// ============================================================
// hooks/useStoreImport.ts
// Handles store import: mockup generation orchestration,
// data transformation, navigation to Create page.
// ============================================================

import { useState, useCallback } from 'react';
import type { StoreImportData, ImageGenerationProgress, MockupCalculationResult, PayloadProductData, DesignElement } from '../types';
import { saveToSessionStorage } from '../utils';
import { getMockupsForColor, getProductColorForMockup } from '../mockup-engine-utils';

interface UseStoreImportOptions {
  productData: PayloadProductData;
  activeTechnology: string;
  selectedColors: Array<{ name: string; value: string }>;
  selectedSizes: string[];
  allMockups: any[];
  designElements: Record<string, DesignElement[]>;
  getAllCanvasConfigs: Record<string, any>;
  getAllPrintableAreas: Record<string, any>;
  mockupCalculation: MockupCalculationResult | null;
  hasDesignElements: boolean;
  getCurrentTechnology: () => any;
  getVisibleDesignElements: (elements: Record<string, DesignElement[]>) => Record<string, DesignElement[]>;
  getSurfaceConfiguration: () => any;
  extractDesignImages: () => any[];
  exportAllCanvasImages: () => Promise<any[]>;
  calculateTotalPricing: () => any;
  generateDetailedAreaAnalysis: (pricingData: any) => any;
  mockupGenerator: any;
  navigate: (opts: any) => void;
  shouldSkipMockupGeneration: () => boolean;
}

export const useStoreImport = ({
  productData,
  activeTechnology,
  selectedColors,
  selectedSizes,
  allMockups,
  designElements,
  getAllCanvasConfigs,
  getAllPrintableAreas,
  mockupCalculation,
  hasDesignElements,
  getCurrentTechnology,
  getVisibleDesignElements,
  getSurfaceConfiguration,
  extractDesignImages,
  exportAllCanvasImages,
  calculateTotalPricing,
  generateDetailedAreaAnalysis,
  mockupGenerator,
  navigate,
  shouldSkipMockupGeneration,
}: UseStoreImportOptions) => {
  const [isGeneratingForStore, setIsGeneratingForStore] = useState(false);
  const [storeImportData, setStoreImportData] = useState<StoreImportData | null>(null);
  const [showStoreImportModal, setShowStoreImportModal] = useState(false);
  const [storeGenerationProgress, setStoreGenerationProgress] = useState<ImageGenerationProgress | null>(null);

  // ── Calculate price from cost (markup) ───────────────────────────────────
  const calculatePriceFromCost = (cost: number): number => Math.round(cost + cost * 0.5 + 100);

  // ── Navigate to Create page ───────────────────────────────────────────────
  const navigateToCreatePage = useCallback(async (transformedData: any) => {
    setShowStoreImportModal(false);
    // uploadQualityImages = full-resolution data straight from generation (for Medusa upload)
    // transferQualityImages = same data passed through sessionStorage for display (may be compressed later)
    // Both reference the same colorSpecificImages here since we generate at 600px WebP already;
    // create.tsx will use uploadQualityColorSpecificImages for actual file upload.
    const uploadQualityImages: Record<string, any[]> = { ...transformedData.colorSpecificImages };
    const transferQualityImages: Record<string, any[]> = { ...transformedData.colorSpecificImages };

    try {
      const keysToDelete: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith('store_import_')) keysToDelete.push(key);
      }
      keysToDelete.forEach(k => sessionStorage.removeItem(k));
    } catch {}

    const sessionKey = `store_import_${Date.now()}`;
    const saved1 = saveToSessionStorage(`${sessionKey}_colorSpecificImages`, transferQualityImages);
    const saved2 = saveToSessionStorage(`${sessionKey}_colorSpecificMockups`, transformedData.designData?.mockupData?.colorSpecificMockups || []);
    const saved3 = saveToSessionStorage(`${sessionKey}_canvasImages`, transformedData.canvasImages || []);

    navigate({
      to: '/designer/create',
      state: {
        sessionKey,
        designData: {
          ...transformedData.designData,
          mockupData: { ...transformedData.designData?.mockupData, colorSpecificMockups: [], mockupPreview: null },
        },
        mockupImages: {},
        // Display quality (may come from sessionStorage on create page)
        colorSpecificImages: saved1 ? {} : transferQualityImages,
        // Upload quality — always in navigation state (not sessionStorage) so it survives at full fidelity
        uploadQualityColorSpecificImages: uploadQualityImages,
        designImages: transformedData.designImages || [],
        enhancedProductData: transformedData.enhancedProductData,
        // filteredProductData carries the SELECTED print technology from Canvas
        filteredProductData: transformedData.filteredProductData,
        uploadedFiles: [],
        pricingData: transformedData.pricingData,
        availableMockups: transformedData.availableMockups,
        imageAreaAnalysis: transformedData.imageAreaAnalysis,
        detailedAreaAnalysis: transformedData.detailedAreaAnalysis,
        enhancedImageAreaAnalysis: transformedData.enhancedImageAreaAnalysis,
        designMetrics: transformedData.designMetrics,
        storeMetadata: transformedData.storeMetadata,
        navigationContext: {
          sourceComponent: 'EnhancedCanvas',
          importTimestamp: new Date().toISOString(),
          sessionStorageKey: sessionKey,
          hasUploadQualityImages: Object.keys(uploadQualityImages).length > 0,
          totalUploadImages: Object.values(uploadQualityImages).flat().length,
        },
      },
    });
  }, [navigate]);

  // ── Transform store data for Create page ─────────────────────────────────
  const transformStoreDataForCreate = useCallback((storeData: any, filteredProductData: any) => {
    const mockupImages: Record<string, string> = {};
    const colorSpecificImages: Record<string, any[]> = {};
    const processedMockups = new Set<string>();
    const seenImageData = new Map<string, string>();

    // size_Images=true  → each size gets its own mockup image (size-specific)
    // size_Images=false → all sizes share the same images (deduplicate by image hash)
    const sizeImages: boolean = !!filteredProductData?.size_Images;

    (storeData.mockup_variants || []).forEach((mockupVariant: any) => {
      if (!mockupVariant?.color_combinations) return;
      mockupVariant.color_combinations.forEach((colorCombo: any) => {
        if (!colorCombo) return;
        if (!colorSpecificImages[colorCombo.color_hex]) colorSpecificImages[colorCombo.color_hex] = [];

        const sizeVariants = colorCombo.size_variants || [];
        if (sizeVariants.length === 0) return;

        sizeVariants.forEach((sizeVariant: any) => {
          if (!sizeVariant?.generated_images?.length) return;
          const generatedImage = sizeVariant.generated_images[0];
          if (!generatedImage?.image_data || generatedImage.image_data.length < 100) return;

          const imageHash = generatedImage.image_data.substring(0, 100);

          // Normalize with hyphens — matches the normalize() fn in create.tsx updateVariantImages.
          // Strips # from hex colors; spaces/underscores → hyphens; strips non-alphanum.
          // e.g. "Golden Yellow" → "golden-yellow", "#ec5100" → "ec5100"
          const normalizeKey = (s: string) =>
            s.toLowerCase().replace(/^#/, '').replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '');

          // ── Deduplication key ───────────────────────────────────────────────
          // When size_Images=false: key is per-color+mockup+hash (size ignored)
          //   → all sizes produce the SAME key → only first size passes the check
          // When size_Images=true:  key includes size → each size is kept separately
          const sizeSegment = sizeImages ? normalizeKey(sizeVariant.size_name || 'shared') : 'shared';
          const imageKey = `${normalizeKey(mockupVariant.mockup_id)}_${normalizeKey(mockupVariant.view_angle)}_${normalizeKey(colorCombo.color_hex)}_${sizeSegment}_${imageHash}`;
          if (seenImageData.has(imageKey)) return;
          seenImageData.set(imageKey, imageKey);

          // ── Storage key (Medusa filename base) ──────────────────────────────
          // Include size segment only when size_Images=true.
          const standardKey = [
            normalizeKey(mockupVariant.mockup_id),
            normalizeKey(mockupVariant.view_angle),
            normalizeKey(colorCombo.color_hex),
            sizeImages ? normalizeKey(sizeVariant.size_name || '') : '',
          ].filter(Boolean).join('-');

          mockupImages[standardKey] = generatedImage.image_data;

          colorSpecificImages[colorCombo.color_hex].push({
            mockupId:    mockupVariant.mockup_id,
            viewAngle:   mockupVariant.view_angle,
            mockupTitle: mockupVariant.mockup_title,
            // sizeName only set when size_Images=true; create.tsx uses it for filename matching
            sizeName:    sizeImages ? (sizeVariant.size_name || null) : null,
            imageData:   generatedImage.image_data,
            storageKey:  standardKey,
          });
        });
      });
    });

    const colorDetails = selectedColors.map(c => ({ name: c.name, value: c.value }));
    const sizeOptions = selectedSizes.slice();

    const colorSpecificMockups = Object.keys(colorSpecificImages).map(colorHex => {
      const match = colorDetails.find(c => c.value.toLowerCase() === colorHex.toLowerCase());
      return {
        colorName: match?.name || `Color ${colorHex}`, colorHex,
        mockups: colorSpecificImages[colorHex].map((img, i) => ({
          id: `${colorHex}-mockup-${i}`, ...img,
        })),
        imageCount: colorSpecificImages[colorHex].length,
      };
    });

    const designData = {
      productInfo: {
        title: storeData.product_name || 'Custom Design Product',
        description: `Custom designed ${storeData.product_type}`,
        sku: storeData.product_id || `custom-${Date.now()}`,
        brand: filteredProductData?.brand || 'Junooni',
      },
      options: [
        { title: 'Color', optionValues: colorDetails.map(c => c.name) },
        { title: 'Size', optionValues: sizeOptions },
      ].filter(o => o.optionValues.length > 0),
      designElements: storeData.design_elements,
      designConfiguration: storeData.design_configuration,
      colorDetails,
      printingTechnology: 'dtg',
      price: calculatePriceFromCost(filteredProductData?.cost || 200),
      mockupData: {
        selectedMockup: null, allMockups,
        mockupPreview: Object.values(mockupImages)[0] || null,
        colorSpecificMockups,
        designImages: storeData.design_images || [],
      },
      selectedProduct: {
        color: selectedColors[0]?.value || '#ffffff',
        colorName: selectedColors[0]?.name || 'White',
        productId: storeData.product_id,
        productName: storeData.product_name,
      },
    };

    return {
      designData, mockupImages, colorSpecificImages,
      designImages: storeData.design_images || [],
      canvasImages: storeData.canvas_images || [],
      enhancedProductData: { ...filteredProductData, cost: filteredProductData?.cost || 200 },
      filteredProductData,
      pricingData: storeData.pricing_data || null,
      availableMockups: storeData.available_mockups || null,
      imageAreaAnalysis: storeData.image_area_analysis || null,
      detailedAreaAnalysis: storeData.detailed_area_analysis,
      enhancedImageAreaAnalysis: storeData.image_area_analysis,
      designMetrics: {
        totalElements: storeData.detailed_area_analysis?.area_summary?.total_elements_across_all_areas || 0,
        areasWithElements: storeData.detailed_area_analysis?.areas_with_elements || [],
        areasWithoutElements: storeData.detailed_area_analysis?.areas_without_elements || [],
      },
      storeMetadata: {
        generation_summary: storeData.generation_summary || null,
        mockup_variants: storeData.mockup_variants || [],
        design_configuration: storeData.design_configuration || {},
        total_images_generated: storeData.generation_summary?.total_images_generated || 0,
        errors: storeData.generation_summary?.errors || [],
      },
    };
  }, [selectedColors, selectedSizes, allMockups, calculatePriceFromCost]);

  // ── Main import handler ───────────────────────────────────────────────────
  const handleImportToStore = useCallback(async () => {
    if (shouldSkipMockupGeneration()) {
      try {
        setIsGeneratingForStore(true);
        const filteredProductData = {
          ...productData,
          printT: (productData?.printT || []).filter(
            t => t.id === activeTechnology || t.technologyName === activeTechnology
          ),
        };
        if (filteredProductData.printT.length === 0) throw new Error(`No matching technology: ${activeTechnology}`);

        const designImages = extractDesignImages();
        const canvasImagesData = await exportAllCanvasImages();
        const finalPricingBreakdown = calculateTotalPricing();
        const pricingDataResult = calculateTotalPricing();
        const detailedAreaAnalysis = generateDetailedAreaAnalysis(pricingDataResult);

        const dataWithoutMockups = {
          product_id: productData.id || `product-${Date.now()}`,
          product_name: productData.name || 'Custom Product',
          product_type: productData.productType || 'custom',
          design_elements: getVisibleDesignElements(designElements),
          design_configuration: { canvas_configs: getAllCanvasConfigs, printable_areas: getAllPrintableAreas, design_metadata: { total_elements: Object.values(designElements).flat().length, creation_timestamp: new Date().toISOString() } },
          canvas_images: canvasImagesData, design_images: designImages,
          detailed_area_analysis: detailedAreaAnalysis,
          pricing_data: { final_price_per_unit: finalPricingBreakdown.priceBreakdown.finalPrice, currency: 'INR', pricing_breakdown: finalPricingBreakdown },
          mockup_variants: [],
          generation_summary: { total_combinations: 0, total_images_generated: 0, generation_started: new Date().toISOString(), generation_completed: new Date().toISOString(), total_time_ms: 0, engine_usage: { canvas_professional: 0, pixi_dynamic: 0 }, errors: [], mockup_calculation: mockupCalculation! },
        };

        const transformedData = transformStoreDataForCreate(dataWithoutMockups, filteredProductData);
        await navigateToCreatePage(transformedData);
      } catch (error: any) {
        alert(`Failed to prepare product data: ${error.message}`);
      } finally {
        setIsGeneratingForStore(false);
      }
      return;
    }

    if (!hasDesignElements) { alert('⚠️ Please add design elements before importing to store.'); return; }
    if (!selectedColors.length || !selectedSizes.length) { alert('⚠️ Please select colors and sizes before importing to store.'); return; }
    if (!mockupCalculation) { alert('⚠️ Unable to calculate mockups. Please check your selections.'); return; }

    const pricingData = calculateTotalPricing();
    const detailedAreaAnalysis = generateDetailedAreaAnalysis(pricingData);

    const normalizeArea = (name: string) => name.toLowerCase().trim().replace(/\s+/g, '_');
    const areasWithElements = Object.keys(designElements).filter(areaId => {
      const visible = (designElements[areaId] || []).filter(el => el.visible !== false);
      return visible.length > 0;
    }).map(normalizeArea);

    // const allMockupsForTech: any[] = [];
    // selectedColors.forEach(color => {
    //   const mockups = getMockupsForColor(productData, color.value, activeTechnology,
    //     productData.size_Images && selectedSizes.length > 0 ? selectedSizes[0] : undefined);
    //   mockups.forEach(m => allMockupsForTech.push({ ...m, target_color: color.value, target_color_name: color.name }));
    // });

    const allMockupsForTech: any[] = [];
      selectedColors.forEach(color => {
        if (productData.size_Images) {
          // size_Images=true: get mockups for EACH selected size separately
          selectedSizes.forEach(size => {
            const mockups = getMockupsForColor(productData, color.value, activeTechnology, size);
            mockups.forEach(m => allMockupsForTech.push({ ...m, target_color: color.value, target_color_name: color.name, photoSize: size }));
          });
        } else {
          // size_Images=false: one set of mockups for all sizes (shared)
          const mockups = getMockupsForColor(productData, color.value, activeTechnology, undefined);
          mockups.forEach(m => allMockupsForTech.push({ ...m, target_color: color.value, target_color_name: color.name }));
        }
      });

    if (allMockupsForTech.length === 0) { alert('❌ No mockups found for selected configuration.'); return; }

    try {
      setIsGeneratingForStore(true);
      setShowStoreImportModal(true);
      setStoreImportData(null);
      setStoreGenerationProgress({ total: allMockupsForTech.length, completed: 0, current_combination: 'Initializing...', current_mockup: '', current_engine: 'canvas_professional', errors: [] });

      const filteredProductData = {
        ...productData,
        printT: (productData?.printT || []).filter(t => t.id === activeTechnology || t.technologyName === activeTechnology),
      };
      if (filteredProductData.printT.length === 0) throw new Error(`No matching technology: ${activeTechnology}`);

      mockupGenerator.setProductData(filteredProductData);

      let completedCombinations = 0;
      const errors: string[] = [];
      const engineUsage = { canvas_professional: 0, pixi_dynamic: 0 };
      const mockupVariants: any[] = [];

      for (const mockup of allMockupsForTech) {
        const mockupSize = (mockup as any).photoSize;
        const sizesToProcess = productData.size_Images && mockupSize && selectedSizes.includes(mockupSize)
          ? [mockupSize] : productData.size_Images ? [] : selectedSizes;

        if (productData.size_Images && sizesToProcess.length === 0) continue;

        const mockupAreaNames = mockup.area?.map((a: any) => a.areaName?.toLowerCase()) || [];
        const hasElements = mockupAreaNames.some((area: string) => areasWithElements.includes(area));

        const filteredElements: Record<string, DesignElement[]> = {};
        mockupAreaNames.forEach((area: string) => {
          if (designElements[area]) filteredElements[area] = designElements[area];
        });

        const colorCombinations: any[] = [{ color_name: mockup.target_color_name, color_hex: mockup.target_color, size_variants: [] }];

        try {
          const result = await mockupGenerator.generateSingleMockup(
            mockup, hasElements ? getVisibleDesignElements(filteredElements) : Object.fromEntries(mockupAreaNames.map((a: string) => [a, []])),
            getAllCanvasConfigs, getAllPrintableAreas,
            getProductColorForMockup(mockup, mockup.target_color, productData), productData, 600, true
          );
          engineUsage[result.engine]++;

          if (productData.size_Images) {
            // size_Images=true: one size_variant entry per size (each may get its own image)
            sizesToProcess.forEach((size: string) => {
              colorCombinations[0].size_variants.push({
                size_name: size,
                generated_images: [{ engine_used: result.engine, image_data: result.imageData, resolution: 600, generation_timestamp: new Date().toISOString(), quality_metrics: result.metrics }],
              });
            });
          } else {
            // size_Images=false: ONE shared entry — all sizes use the same image.
            // transformStoreDataForCreate deduplicates and uploads a single file.
            colorCombinations[0].size_variants.push({
              size_name: 'shared',
              generated_images: [{ engine_used: result.engine, image_data: result.imageData, resolution: 600, generation_timestamp: new Date().toISOString(), quality_metrics: result.metrics }],
            });
          }
        } catch (error: any) {
          errors.push(`Failed: ${mockup.title} - ${error.message}`);
          colorCombinations[0].size_variants.push({ size_name: 'shared', generated_images: [] });
        }

        mockupVariants.push({ mockup_id: mockup.id, mockup_title: mockup.title, view_angle: mockup.viewAngle || 'front', mockup_color: mockup.photoColor, mockup_size: mockupSize, has_design_elements: hasElements, mockup_areas: mockupAreaNames, color_combinations: colorCombinations });

        completedCombinations++;
        setStoreGenerationProgress(prev => ({ ...prev!, completed: completedCombinations, current_mockup: mockup.title, errors: [...errors] }));
        await new Promise(r => setTimeout(r, 200));
      }

      const designImages = extractDesignImages();
      const canvasImagesData = await exportAllCanvasImages();
      const finalPricingBreakdown = calculateTotalPricing();
      const totalImagesGenerated = mockupVariants.reduce((t, mv) => t + mv.color_combinations.reduce((ct: number, cc: any) => ct + cc.size_variants.reduce((st: number, sv: any) => st + sv.generated_images.length, 0), 0), 0);

      const importData: StoreImportData = {
        product_id: productData.id || `product-${Date.now()}`,
        product_name: productData.name || 'Custom Product',
        product_type: productData.productType || 'custom',
        design_elements: designElements,
        design_configuration: { canvas_configs: getAllCanvasConfigs, printable_areas: getAllPrintableAreas, design_metadata: { total_elements: Object.values(designElements).flat().length, areas_used: areasWithElements, creation_timestamp: new Date().toISOString(), last_modified: new Date().toISOString() } },
        mockup_variants: mockupVariants,
        design_images: designImages, canvas_images: canvasImagesData,
        detailed_area_analysis: detailedAreaAnalysis,
        pricing_data: { final_price_per_unit: finalPricingBreakdown.priceBreakdown.finalPrice, currency: 'INR', pricing_breakdown: finalPricingBreakdown, areas_pricing: finalPricingBreakdown.areas },
        generation_summary: { total_combinations: allMockupsForTech.length, total_images_generated: totalImagesGenerated, generation_started: new Date().toISOString(), generation_completed: new Date().toISOString(), total_time_ms: 0, engine_usage: engineUsage, mockup_calculation: mockupCalculation!, errors, areas_with_elements: areasWithElements },
      };

      setStoreImportData(importData);
      const transformedData = transformStoreDataForCreate(importData, filteredProductData);
      await navigateToCreatePage(transformedData);
    } catch (error: any) {
      setShowStoreImportModal(true);
      setStoreImportData({ generation_summary: { errors: [error.message], error_type: 'limit_exceeded' } } as any);
    } finally {
      setTimeout(() => setIsGeneratingForStore(false), 2000);
    }
  }, [
    shouldSkipMockupGeneration, hasDesignElements, selectedColors, selectedSizes, mockupCalculation,
    productData, activeTechnology, designElements, getAllCanvasConfigs, getAllPrintableAreas,
    mockupGenerator, extractDesignImages, exportAllCanvasImages, calculateTotalPricing,
    generateDetailedAreaAnalysis, getVisibleDesignElements, transformStoreDataForCreate, navigateToCreatePage,
  ]);

  return {
    isGeneratingForStore, storeImportData, showStoreImportModal, setShowStoreImportModal, storeGenerationProgress,
    handleImportToStore,
  };
};