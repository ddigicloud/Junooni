// ============================================================
// mockup-engine-utils.ts
// Color detection, mockup filtering, and calculation logic.
// No React imports — pure logic functions only.
// ============================================================

import type {
  PayloadProductData,
  DynamicMockupPhoto,
  MockupCalculationResult,
  ColorSpecificMockupGroup,
} from './types';

// ── Dynamic neutral colour detector ──────────────────────────────────────────
export const createDynamicNeutralDetector = (productData: PayloadProductData) => {
  const neutralVariations = new Set<string>();

  const baseNeutrals = [
    '#ffffff', '#f5f5f5', '#fafafa', '#f0f0f0', '#e5e5e5',
    '#00000000', '00000000', 'transparent',
  ];
  baseNeutrals.forEach(c => {
    neutralVariations.add(c.toLowerCase());
    neutralVariations.add(c.toLowerCase().replace('#', ''));
  });

  ['white', 'neutral', 'natural', 'default', 'transparent'].forEach(w =>
    neutralVariations.add(w.toLowerCase())
  );

  productData?.colorOptions?.forEach((color: any) => {
    const name = color.colorName?.toLowerCase() || '';
    const hex = color.colorHex?.toLowerCase() || '';
    if (name.includes('white') || name.includes('neutral') || hex === '#ffffff' || hex === '#f5f5f5') {
      neutralVariations.add(hex);
      neutralVariations.add(name);
    }
  });

  return {
    isNeutral: (colorValue: string): boolean => {
      const n = colorValue?.toLowerCase().trim() || '';
      return neutralVariations.has(n) || neutralVariations.has(n.replace('#', ''));
    },
    getNeutralColors: (): string[] => Array.from(neutralVariations),
  };
};

// ── Canvas colour matcher ─────────────────────────────────────────────────────
export const createCanvasColorMatcher = (productData: PayloadProductData) => {
  const availableColors = new Map<string, { name: string; hex: string }>();

  productData?.colorOptions?.forEach(color => {
    if (color.colorName && color.colorHex) {
      availableColors.set(color.colorHex.toLowerCase(), { name: color.colorName, hex: color.colorHex });
      availableColors.set(color.colorName.toLowerCase(), { name: color.colorName, hex: color.colorHex });
    }
  });

  return {
    availableColors,
    isValidColor: (v: string) => availableColors.has(v.toLowerCase()),
    getColorInfo: (v: string) => availableColors.get(v.toLowerCase()) ?? null,
    areColorsSimilar: (c1: string, c2: string): boolean => {
      if (c1.toLowerCase() === c2.toLowerCase()) return true;
      const i1 = availableColors.get(c1.toLowerCase());
      const i2 = availableColors.get(c2.toLowerCase());
      return !!(i1 && i2 && i1.hex.toLowerCase() === i2.hex.toLowerCase());
    },
    getAllColors: (): Array<{ name: string; hex: string }> => {
      const unique = new Map<string, { name: string; hex: string }>();
      for (const v of availableColors.values()) unique.set(v.hex, v);
      return Array.from(unique.values());
    },
  };
};

// ── Extract all mockups from PayloadCMS product ───────────────────────────────
export const extractAllMockupsFromPayload = (productData: PayloadProductData): DynamicMockupPhoto[] => {
  try {
    if (!productData?.printT || !Array.isArray(productData.printT)) return [];

    const allMockups: DynamicMockupPhoto[] = [];
    productData.printT.forEach((tech: any) => {
      if (tech.mockupPhotos && Array.isArray(tech.mockupPhotos)) {
        tech.mockupPhotos.forEach((mockup: any) => {
          if (mockup?.photo?.url && mockup?.area?.length) allMockups.push(mockup);
        });
      }
    });

    allMockups.sort((a, b) => {
      if (a.photoColor === '#ffffff' && b.photoColor !== '#ffffff') return -1;
      if (b.photoColor === '#ffffff' && a.photoColor !== '#ffffff') return 1;
      return (a.priority || 0) - (b.priority || 0);
    });

    return allMockups;
  } catch { return []; }
};

// ── Get mockups filtered by colour (and optionally size) ──────────────────────
export const getMockupsForColor = (
  productData: PayloadProductData,
  colorHex: string,
  activeTechnology: string,
  selectedSize?: string
): DynamicMockupPhoto[] => {
  const allMockups: DynamicMockupPhoto[] = [];

  const activeTech = productData.printT?.find(
    t => t.id === activeTechnology || t.technologyName === activeTechnology
  );
  if (!activeTech) return [];

  if (activeTech.mockupPhotos && Array.isArray(activeTech.mockupPhotos)) {
    activeTech.mockupPhotos.forEach(m => {
      if (m?.photo?.url && m?.area?.length) allMockups.push(m);
    });
  }

  if (!productData?.colorOptions) return allMockups;

  const neutralDetector = createDynamicNeutralDetector(productData);
  const colorMatcher = createCanvasColorMatcher(productData);
  const targetColorInfo = colorMatcher.getColorInfo(colorHex);
  if (!targetColorInfo) return allMockups;

  // Prefer exact colour-specific mockups; fall back to transparent/neutral
  let colorSpecific = allMockups.filter(m => colorMatcher.areColorsSimilar(m.photoColor || '', colorHex));
  let filtered: DynamicMockupPhoto[] = colorSpecific.length > 0
    ? colorSpecific
    : allMockups.filter(m => neutralDetector.isNeutral(m.photoColor?.toLowerCase() || ''));

  // Filter by size when size_Images is set
  if (productData.size_Images && selectedSize) {
    filtered = filtered.filter(m => {
      const mockupSize = (m as any).photoSize;
      return mockupSize?.toLowerCase().trim() === selectedSize.toLowerCase().trim();
    });
    if (filtered.length === 0) return [];
  }

  // Neutral fallback (only when size_Images is false)
  if (filtered.length === 0 && !productData.size_Images) {
    return allMockups.filter(m => neutralDetector.isNeutral(m.photoColor?.toLowerCase() || ''));
  }

  return filtered;
};

// ── Total mockup count calculator ─────────────────────────────────────────────
export const calculateTotalMockups = (
  productData: PayloadProductData,
  selectedColors: Array<{ name: string; value: string }>,
  selectedSizes: string[],
  activeTechnology: string
): MockupCalculationResult => {
  const { color_Images, size_Images } = productData;
  let totalMockups = 0;
  const calculationBreakdown: MockupCalculationResult['calculationBreakdown'] = [];

  let strategy: MockupCalculationResult['strategy'];
  if (color_Images && size_Images) strategy = 'color_and_size_specific';
  else if (color_Images && !size_Images) strategy = 'color_specific';
  else if (!color_Images && size_Images) strategy = 'size_specific' as any;
  else strategy = 'shared_across_all';

  if (strategy === 'color_and_size_specific') {
    selectedColors.forEach(color => {
      selectedSizes.forEach(size => {
        const mockups = getMockupsForColor(productData, color.value, activeTechnology, size);
        if (mockups.length > 0) {
          calculationBreakdown.push({ color: color.name, colorHex: color.value, mockupsForColor: mockups.length, sizesCount: 1, subtotal: mockups.length, mockups });
          totalMockups += mockups.length;
        }
      });
    });
  } else if (strategy === 'color_specific') {
    selectedColors.forEach(color => {
      const mockups = getMockupsForColor(productData, color.value, activeTechnology);
      calculationBreakdown.push({ color: color.name, colorHex: color.value, mockupsForColor: 1, sizesCount: 1, subtotal: 1, mockups });
      totalMockups += 1;
    });
  } else if ((strategy as string) === 'size_specific') {
    selectedSizes.forEach(size => {
      const mockups = getMockupsForColor(productData, selectedColors[0]?.value || '#ffffff', activeTechnology, size);
      if (mockups.length > 0) {
        calculationBreakdown.push({ color: 'All Colors', colorHex: 'shared', mockupsForColor: mockups.length, sizesCount: 1, subtotal: mockups.length, mockups });
        totalMockups += mockups.length;
      }
    });
  } else {
    const mockups = getMockupsForColor(productData, selectedColors[0]?.value || '#ffffff', activeTechnology);
    totalMockups = mockups.length;
    calculationBreakdown.push({ color: 'All Colors', colorHex: 'shared', mockupsForColor: mockups.length, sizesCount: 1, subtotal: totalMockups, mockups });
  }

  return { totalMockups, calculationBreakdown, strategy };
};

// ── Colour-specific mockup groups ─────────────────────────────────────────────
export const getColorSpecificMockupGroups = (
  productData: PayloadProductData,
  selectedColors: Array<{ name: string; value: string }>,
  activeTechnology: string
): ColorSpecificMockupGroup[] => {
  const groups: ColorSpecificMockupGroup[] = [];

  if (!productData.color_Images) {
    const firstColor = selectedColors[0];
    const sharedMockups = firstColor ? getMockupsForColor(productData, firstColor.value, activeTechnology) : [];
    selectedColors.forEach(color => groups.push({ colorName: color.name, colorHex: color.value, mockups: sharedMockups, imageCount: sharedMockups.length }));
    return groups;
  }

  selectedColors.forEach(color => {
    const mockups = getMockupsForColor(productData, color.value, activeTechnology);
    groups.push({ colorName: color.name, colorHex: color.value, mockups, imageCount: mockups.length });
  });

  return groups;
};

// ── Smart product colour for mockup render ────────────────────────────────────
export const getProductColorForMockup = (
  mockup: DynamicMockupPhoto,
  selectedColor: string,
  _productData?: PayloadProductData
): string => selectedColor; // Always use the user-selected colour