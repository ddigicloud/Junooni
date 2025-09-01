// src/components/Designer/Canvas.tsx - Complete Rewrite with Fixed Mockup Calculation
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import Konva from 'konva';
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Rect,
  Group,
  Transformer,
  Text as KonvaText,
} from 'react-konva';
import EnhancedMockupEngine from '../engines/mockup/MockupEngine';
import { useNavigate } from '@tanstack/react-router';

// =====================================
// TYPE DEFINITIONS
// =====================================

interface DesignElement {
  id: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  draggable: boolean;
  selected: boolean;
  zIndex: number;
  image?: HTMLImageElement;
  imageName?: string;
  imageUrl?: string;
  imageBase64?: string; // âœ… Base64 for persistent storage
  originalImageWidth?: number;
  originalImageHeight?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  opacity?: number;
  layerName?: string;
  visible?: boolean;
  locked?: boolean;
}

interface LayerInfo {
  element: DesignElement;
  dpi: number;
  printQuality: 'Poor' | 'Good' | 'Excellent';
  printQualityColor: string;
  dimensions: {
    widthInches: number;
    heightInches: number;
    widthUnits: number;
    heightUnits: number;
  };
}


interface CanvasImageMetadata {
  area_name: string;
  canvas_dimensions: { 
    width_pixels: number; 
    height_pixels: number; 
    width_inches: number; 
    height_inches: number 
  };
  printable_area: { x: number; y: number; width: number; height: number };
  design_elements: Array<{
    element_id: string; 
    element_index: number; 
    type: string;
    position: { x: number; y: number; x_inches: number; y_inches: number };
    dimensions: { 
      width_pixels: number; 
      height_pixels: number; 
      width_inches: number; 
      height_inches: number 
    };
    transformations: { rotation: number; scale_x: number; scale_y: number; opacity: number };
    image_info?: { 
      original_name: string; 
      original_width: number; 
      original_height: number; 
      print_quality: string; 
      print_dpi: number 
    };
    text_info?: { 
      content: string; 
      font_size: number; 
      font_family: string; 
      color: string 
    };
  }>;
  canvas_settings: { 
    active_color: string; 
    total_elements: number; 
    visible_elements: number 
  };
}


interface DynamicMockupPhoto {
  id: string;
  title: string;
  photo: {
    id: number;
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  viewAngle: string;
  mockupType: string;
  photoColor: string;
  priority: number;
  dispMaps?: Array<{
    id: string;
    dispImg: {
      id: number;
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    dsrfaceTy: 'cylindrical' | 'conical' | 'spherical';
    disint: number;
    disarea: string;
  }>;
  alphaMasks?: Array<{
    id: string;
    maskImg: {
      id: number;
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    alfarea: string;
    alfamask: 'alpha' | 'luminance' | 'red_channel';
    featherEdge: number;
  }>;
  lightingOverlays?: Array<{
    id: string;
    overImage: {
      id: number;
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    overlayType: 'lighting' | 'shadow' | 'reflection' | 'ambient';
    overbldMde: string;
    ovlayOpa: number;
    overlayArea?: string;
  }>;
  renderPref?: {
    preferredEngine: 'auto' | 'canvas' | 'pixi';
    enableAdvancedEffects: boolean;
    qualityLevel: 'draft' | 'standard' | 'high' | 'ultra';
    exportRes: number;
    enableProgTrack: boolean;
  };
  visibleAreas: Array<{
    id: string;
    areaName: string;
    visibility: 'full' | 'partial' | 'edge' | 'sleeve';
    visibilityPercentage?: number;
    designPlacement: {
      coordinateX: number;
      coordinateY: number;
      coordinateWidth: number;
      coordinateHeight: number;
      rotation: number;
      skewX: number;
      skewY: number;
      scaleX: number;
      scaleY: number;
      blendMode: string;
      opacity: number | null;
      preserveColors: boolean | null;
    };
    fabricIntegration?: {
      enableFabricBlend: boolean;
      bfabType: string;
      foldAwareness: boolean;
      seamAwareness: boolean;
      textureIntensity: number;
      fabricColor: string;
      fabricRoughness: number;
    };
    surfaceWrapSettings?: {
      enableWrap: boolean | null;
      wrapAngle: number;
      wrapIntensity: number;
      dynamicWrap: boolean;
      wrapFalloff: number;
    };
    perspectiveSettings?: {
      enablePerspective: boolean | null;
      perspectiveIntensity: number;
      dynamicPerspective: boolean;
    };
    maskingConfiguration?: {
      enableMasking: boolean;
      maskTypes: string;
      maskPath?: string;
    };
    gradientMaskSettings?: {
      gradientDirection: string;
      gradientAngle: number;
      fadeStart: number;
      fadeEnd: number;
      fadeIntensity: number;
    };
    edgeDetectionSettings?: {
      enableEdgeDetection: boolean;
      edgeThreshold: number;
      edgeSoftness: number;
    };
    fabricEffectsSettings?: {
      enableFolds: boolean;
      foldIntensity: number;
      foldDirection: string;
      seamDistrt: boolean;
      fabricDpth: number;
    };
  }>;
  fabricProp?: {
    mfabType: string;
    fabricWeight: number;
    surfaceTexture: string;
    stretchability: number;
    transparency: number;
  };
  lightingConditions?: {
    lightDirection: number;
    lightIntensity: number;
    ambientLight: number;
    shadowIntensity: number;
  };
}

interface UploadedFile {
  id: string;
  file: File;
  url: string;
  base64Data?: string; // âœ… Base64 for persistent storage
  name: string;
  size: number;
  type: string;
  uploadProgress: number;
  isUploading: boolean;
  error?: string;
  targetArea?: string;
}

interface PayloadProductData {
  id: string;
  name: string;
  brand?: string;
  colorOptions: Array<{
    id: string;
    colorName: string;
    colorHex: string;
    isPrimary?: boolean;
  }>;
  sizeOptions: Array<{
    id: string;
    sizeName: string;
    sizeDescription?: string;
  }>;
  color_Images: boolean;  // PayloadCMS: Different images for different colors
  size_Images: boolean;   // PayloadCMS: Different images for different sizes
  printTechn: Array<{
    id: string;
    technologyName: string;
    mockupPhotos: DynamicMockupPhoto[];
    custAreas?: Array<{
      areaName: string;
      canvasDim?: {
        widthInch: number;
        heightInch: number;
        canvasPixWid: number;
        canvasPixHeight: number;
        aspectRatioLocked: boolean;
      };
      designCanvasPhotos?: Array<{
        photo: {
          url: string;
        };
        photoColor: string;
        printAreaCoord?: {
          x: number;
          y: number;
          width: number;
          height: number;
        };
      }>;
    }>;
    printingConstraints?: {
      dpiRequirements: {
        minimum: number;
        recommended: number;
        maximum: number;
      };
    };
  }>;
  cost: number;
  pricing?: {
    markupType: string;
    markupValue: number;
    suggestedRetailPrice: number;
  };
  productType?: string;
}

interface MockupCalculationResult {
  totalMockups: number;
  calculationBreakdown: Array<{
    color: string;
    colorHex: string;
    mockupsForColor: number;
    sizesCount: number;
    subtotal: number;
    mockups: DynamicMockupPhoto[];
  }>;
  strategy: 'color_and_size_specific' | 'color_specific' | 'shared_across_all';
}

interface ColorSpecificMockupGroup {
  colorName: string;
  colorHex: string;
  mockups: DynamicMockupPhoto[];
  imageCount: number;
}

interface StoreImportData {
  product_id: string;
  product_name: string;
  product_type: string;
  design_elements: Record<string, DesignElement[]>;
  design_configuration: {
    canvas_configs: Record<string, any>;
    printable_areas: Record<string, any>;
    design_metadata: {
      total_elements: number;
      areas_used: string[];
      creation_timestamp: string;
      last_modified: string;
    };
  };
  mockup_variants: Array<{
    mockup_id: string;
    mockup_title: string;
    view_angle: string;
    mockup_color: string;
    color_combinations: Array<{
      color_name: string;
      color_hex: string;
      size_variants: Array<{
        size_name: string;
        generated_images: Array<{
          engine_used: 'canvas_professional' | 'pixi_dynamic';
          image_data: string;
          resolution: number;
          generation_timestamp: string;
          quality_metrics: {
            render_time_ms: number;
            image_size_kb: number;
            compression_ratio: number;
          };
        }>;
      }>;
    }>;
  }>;
  // 🔥 ADD DESIGN IMAGES PROPERTY
  design_images?: Array<{
    id: string;
    name: string;
    type: string;
    base64Data: string;
    originalWidth: number;
    originalHeight: number;
    area: string;
    description?: string;
    position: { x: number; y: number };
    dimensions: { width: number; height: number };
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    opacity?: number;
  }>;
  canvas_images?: Array<{
  area_id: string;
  image_data: string;
  metadata: CanvasImageMetadata;
  description: string;
}>;
  generation_summary: {
    total_combinations: number;
    total_images_generated: number;
    generation_started: string;
    generation_completed: string;
    total_time_ms: number;
    engine_usage: {
      canvas_professional: number;
      pixi_dynamic: number;
    };
    mockup_calculation: MockupCalculationResult;
    errors: string[];
  };
}

interface ImageGenerationProgress {
  total: number;
  completed: number;
  current_combination: string;
  current_mockup: string;
  current_engine: 'canvas_professional' | 'pixi_dynamic';
  errors: string[];
  estimated_time_remaining_ms?: number;
}

interface DesignData {
  productInfo: {
    title: string;
    description: string;
    sku: string;
    brand: string;
  };
  options: Array<{
    title: string;
    optionValues: string[];
  }>;
  designElements: Record<string, any[]>;
  designConfiguration: {
    canvas_configs: Record<string, any>;
    printable_areas: Record<string, any>;
    design_metadata: {
      total_elements: number;
      areas_used: string[];
      creation_timestamp: string;
      last_modified: string;
    };
  };
  colorDetails: Array<{ name: string; value: string }>;
  printingTechnology: string;
  price: number;
  mockupData: {
    selectedMockup: DynamicMockupPhoto | null;
    allMockups: DynamicMockupPhoto[];
    mockupPreview: string | null;
    mockupPreviews: Record<string, string>;
    colorSpecificMockups: ColorSpecificMockupGroup[];
    designImages?: Array<{ // âœ… NEW: Include design images
      id: string;
      name: string;
      type: string;
      base64Data: string;
      originalWidth: number;
      originalHeight: number;
      area: string;
      position: { x: number; y: number };
      dimensions: { width: number; height: number };
    }>;
  };
  selectedProduct: {
    color: string;
    colorName: string;
    productId: string;
    productName: string;
  };
}

// =====================================
// UTILITY FUNCTIONS
// =====================================

const createDynamicNeutralDetector = (productData: PayloadProductData) => {
  const neutralVariations = new Set<string>();
  
  // Add common neutral variations
  const baseNeutrals = ['#ffffff', '#f5f5f5', '#fafafa', '#f0f0f0', '#e5e5e5'];
  baseNeutrals.forEach(color => {
    neutralVariations.add(color.toLowerCase());
    neutralVariations.add(color.toLowerCase().replace('#', ''));
  });
  
  // Add word-based neutrals
  ['white', 'neutral', 'natural', 'default'].forEach(word => {
    neutralVariations.add(word.toLowerCase());
  });
  
  // Extract neutral colors from product data
  productData?.colorOptions?.forEach((color: any) => {
    const colorName = color.colorName?.toLowerCase() || '';
    const colorHex = color.colorHex?.toLowerCase() || '';
    
    if (colorName.includes('white') || colorName.includes('neutral') || 
        colorHex === '#ffffff' || colorHex === '#f5f5f5') {
      neutralVariations.add(colorHex);
      neutralVariations.add(colorName);
    }
  });
  
  return {
    isNeutral: (colorValue: string): boolean => {
      const normalizedColor = colorValue?.toLowerCase().trim() || '';
      return neutralVariations.has(normalizedColor) || 
             neutralVariations.has(normalizedColor.replace('#', ''));
    },
    getNeutralColors: (): string[] => Array.from(neutralVariations)
  };
};
/**
 * Create dynamic color matcher for Canvas component
 */
const createCanvasColorMatcher = (productData: PayloadProductData) => {
  const availableColors = new Map<string, { name: string; hex: string }>();
  
  // Extract colors from product data
  if (productData?.colorOptions && Array.isArray(productData.colorOptions)) {
    productData.colorOptions.forEach(color => {
      if (color.colorName && color.colorHex) {
        availableColors.set(color.colorHex.toLowerCase(), {
          name: color.colorName,
          hex: color.colorHex
        });
        availableColors.set(color.colorName.toLowerCase(), {
          name: color.colorName,
          hex: color.colorHex
        });
      }
    });
  }
  
  return {
    availableColors,
    
    /**
     * Check if a color exists in the product data
     */
    isValidColor: (colorValue: string): boolean => {
      const colorLower = colorValue.toLowerCase();
      return availableColors.has(colorLower);
    },
    
    /**
     * Get color info by hex or name
     */
    getColorInfo: (colorValue: string): { name: string; hex: string } | null => {
      const colorLower = colorValue.toLowerCase();
      return availableColors.get(colorLower) || null;
    },
    
    /**
     * Check if two colors are similar/same
     */
    areColorsSimilar: (color1: string, color2: string): boolean => {
      const c1Lower = color1.toLowerCase();
      const c2Lower = color2.toLowerCase();
      
      // Direct match
      if (c1Lower === c2Lower) return true;
      
      // Check if both refer to the same color in our data
      const info1 = availableColors.get(c1Lower);
      const info2 = availableColors.get(c2Lower);
      
      if (info1 && info2) {
        return info1.hex.toLowerCase() === info2.hex.toLowerCase();
      }
      
      return false;
    },
    
    /**
     * Get all available colors
     */
    getAllColors: (): Array<{ name: string; hex: string }> => {
      const uniqueColors = new Map<string, { name: string; hex: string }>();
      for (const colorInfo of availableColors.values()) {
        uniqueColors.set(colorInfo.hex, colorInfo);
      }
      return Array.from(uniqueColors.values());
    }
  };
};



const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const convertImageToBase64 = (img) => {

  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Use natural dimensions to preserve quality
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0);
      
      // Convert to base64 with high quality
      const base64 = canvas.toDataURL('image/png', 0.95);
      
      resolve(base64);
      
    } catch (error) {

      reject(error);
    }
  });
};

const loadImageWithCORS = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Set cross-origin before setting src
    img.crossOrigin = 'anonymous';
    
    img.onload = async () => {
      
      try {
        const base64 = await convertImageToBase64(img);
        resolve({ img, base64 });
      } catch (error) {
        // Still resolve with image but without base64
        resolve({ img, base64: null, error: error.message });
      }
    };
    
    img.onerror = (error) => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    // Add timeout for loading
    setTimeout(() => {
      if (!img.complete) {
        reject(new Error('Image loading timeout'));
      }
    }, 10000);
    
    img.src = src;
  });
};

const createImageFromBase64 = (base64: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.src = base64;
  });
};


const getApiConfig = () => {
  const backendUrl = import.meta.env?.VITE_PAYLOAD_BASE_URL || 'http://localhost:3000';
  return { BACKEND_URL: backendUrl };
};

const resolveImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const config = getApiConfig();
  if (url.startsWith('/')) return `${config.BACKEND_URL}${url}`;
  return `${config.BACKEND_URL}/api/media/file/${url}`;
};

const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select an image file (PNG, JPG, GIF, etc.)' };
  }
  
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  return { valid: true };
};

const extractAllMockupsFromPayload = (productData: PayloadProductData): DynamicMockupPhoto[] => {
  try {

    if (!productData?.printTechn || !Array.isArray(productData.printTechn)) {
      return [];
    }

    const allMockups: DynamicMockupPhoto[] = [];

    productData.printTechn.forEach((tech: any) => {
      if (tech.mockupPhotos && Array.isArray(tech.mockupPhotos)) {
        tech.mockupPhotos.forEach((mockup: any) => {
          if (mockup?.photo?.url && mockup?.visibleAreas?.length) {
            allMockups.push(mockup);
          }
        });
      }
    });

    // Sort by priority and default to #ffffff mockups first
    allMockups.sort((a, b) => {
      if (a.photoColor === '#ffffff' && b.photoColor !== '#ffffff') return -1;
      if (b.photoColor === '#ffffff' && a.photoColor !== '#ffffff') return 1;
      return (a.priority || 0) - (b.priority || 0);
    });

    return allMockups;
  } catch (error) {
    return [];
  }
};

// =====================================
// ENHANCED MOCKUP CALCULATION LOGIC
// =====================================

/**
 * Get mockups for a specific color from PayloadCMS data
 */
const getMockupsForColor = (
  productData: PayloadProductData, 
  colorHex: string
): DynamicMockupPhoto[] => {
  const allMockups: DynamicMockupPhoto[] = [];
  
  // Extract all mockups from all print techniques
  productData.printTechn?.forEach(tech => {
    tech.mockupPhotos?.forEach(mockup => {
      allMockups.push(mockup);
    });
  });
  
  if (!productData?.colorOptions) {
    return allMockups;
  }

  // 🔥 FIXED: Use dynamic neutral detector instead of hardcoded colors
  const neutralDetector = createDynamicNeutralDetector(productData);
  const colorMatcher = createCanvasColorMatcher(productData);
  
  // Find the target color info
  const targetColorInfo = colorMatcher.getColorInfo(colorHex);
  
  if (!targetColorInfo) {
    return allMockups;
  }

  // Filter mockups for the specific color
  const colorMockups = allMockups.filter(mockup => {
    
    // Direct color match using our matcher
    if (colorMatcher.areColorsSimilar(mockup.photoColor || '', colorHex)) {
      return true;
    }
    
    // 🔥 FIXED: Use dynamic neutral detection instead of hardcoded array
    const mockupColor = mockup.photoColor?.toLowerCase() || '';
    
    if (neutralDetector.isNeutral(mockupColor)) {
      return true;
    }
    
    return false;
  });
  
  // If no specific mockups found, return neutral mockups that can be overlaid
  if (colorMockups.length === 0) {
    
    // 🔥 FIXED: Use dynamic neutral detection
    const neutralMockups = allMockups.filter(mockup => {
      const mockupColor = mockup.photoColor?.toLowerCase() || '';
      return neutralDetector.isNeutral(mockupColor);
    });
    
    return neutralMockups;
  }
  
  return colorMockups;
};

/**
 * Enhanced calculation for color and size specific scenarios
 */
const calculateTotalMockups = (
  productData: PayloadProductData,
  selectedColors: Array<{ name: string; value: string }>,
  selectedSizes: string[]
): MockupCalculationResult => {
  
  const { color_Images, size_Images } = productData;
  let totalMockups = 0;
  const calculationBreakdown: MockupCalculationResult['calculationBreakdown'] = [];

  // ðŸ”¥ CORRECTED: Determine strategy based on BOTH flags
  let strategy: MockupCalculationResult['strategy'];
  
  if (color_Images && size_Images) {
    strategy = 'color_and_size_specific';
  } else if (color_Images && !size_Images) {
    strategy = 'color_specific';
  } else if (!color_Images && size_Images) {
    strategy = 'size_specific';
  } else {
    strategy = 'shared_across_all';
  }

  if (strategy === 'color_and_size_specific') {
    // Both colors and sizes get unique images
    selectedColors.forEach(color => {
      const mockupsForColor = getMockupsForColor(productData, color.value);
      const sizesCount = selectedSizes.length;
      const subtotal = mockupsForColor.length * sizesCount;
      
      calculationBreakdown.push({
        color: color.name,
        colorHex: color.value,
        mockupsForColor: mockupsForColor.length,
        sizesCount,
        subtotal,
        mockups: mockupsForColor
      });
      
      totalMockups += subtotal;
      
    });

  } else if (strategy === 'color_specific') {
    // CORRECTED: Colors get unique images, but sizes share them
    selectedColors.forEach(color => {
      const mockupsForColor = getMockupsForColor(productData, color.value);
      const sizesCount = 1; // Sizes share the same images
      const subtotal = 1; // No multiplication for sizes
      
      calculationBreakdown.push({
        color: color.name,
        colorHex: color.value,
        mockupsForColor: 1,
        sizesCount,
        subtotal,
        mockups: mockupsForColor
      });
      
      totalMockups += subtotal;
      
    });

  } else if (strategy === 'size_specific') {
    // ðŸ”¥ NEW: Sizes get unique images, but colors share them
    const baseColorMockups = getMockupsForColor(productData, selectedColors[0]?.value || '#ffffff');
    const sizesCount = selectedSizes.length;
    const subtotal = baseColorMockups.length * sizesCount;
    
    calculationBreakdown.push({
      color: 'All Colors',
      colorHex: 'shared',
      mockupsForColor: baseColorMockups.length,
      sizesCount,
      subtotal,
      mockups: baseColorMockups
    });
    
    totalMockups = subtotal;

  } else {
    // Everything is shared
    const allMockups = getMockupsForColor(productData, selectedColors[0]?.value || '#ffffff');
    totalMockups = allMockups.length;
    
    calculationBreakdown.push({
      color: 'All Colors',
      colorHex: 'shared',
      mockupsForColor: allMockups.length,
      sizesCount: 1,
      subtotal: totalMockups,
      mockups: allMockups
    });
    
  }
  
  if (!size_Images) {
  }

  return {
    totalMockups,
    calculationBreakdown,
    strategy
  };
};
/**
 * Get color-specific mockup groups for generation
 */
const getColorSpecificMockupGroups = (
  productData: PayloadProductData,
  selectedColors: Array<{ name: string; value: string }>
): ColorSpecificMockupGroup[] => {
  
  const groups: ColorSpecificMockupGroup[] = [];
  const colorMatcher = createCanvasColorMatcher(productData);
  
  if (!productData.color_Images) {
    // If color_Images is false, all colors share the same mockup
    
    const firstColor = selectedColors[0];
    const sharedMockups = firstColor ? getMockupsForColor(productData, firstColor.value) : [];
    
    selectedColors.forEach(color => {
      groups.push({
        colorName: color.name,
        colorHex: color.value,
        mockups: sharedMockups,
        imageCount: sharedMockups.length
      });
    });
    
    return groups;
  }

  // color_Images = true: Each color gets its specific mockups
  
  selectedColors.forEach(color => {
    
    // Validate color exists in product data
    if (!colorMatcher.isValidColor(color.value) && !colorMatcher.isValidColor(color.name)) {
    }
    
    const colorMockups = getMockupsForColor(productData, color.value);
    
    groups.push({
      colorName: color.name,
      colorHex: color.value,
      mockups: colorMockups,
      imageCount: colorMockups.length
    });
    
    colorMockups.forEach(mockup => {
    });
  });

  const totalUniqueMockups = groups.reduce((sum, group) => sum + group.imageCount, 0);

  return groups;
};

/**
 * Smart color handling for different product types
 */
const getProductColorForMockup = (
  mockup: DynamicMockupPhoto, 
  selectedColor: string, 
  productData?: PayloadProductData
) => {
  
  // 🔥 CRITICAL FIX: ALWAYS use the selected color
  // This ensures #87CEEB shows as #87CEEB, not #588157
  
  const neutralDetector = createDynamicNeutralDetector(productData);
  const mockupColor = mockup.photoColor?.toLowerCase().trim() || '';

  return selectedColor;
};

// =====================================
// ENHANCED MOCKUP GENERATOR
// =====================================

class EnhancedMockupGenerator {
  private isGenerating = false;
  private generationQueue = new Map<string, Promise<string | null>>();
  private renderCache = new Map<string, string>();

private capturePreviewRender = async (
  mockup: DynamicMockupPhoto,
  designElements: Record<string, DesignElement[]>,
  canvasConfigs: Record<string, any>,
  printableAreas: Record<string, any>,
  productColor: string,
  productData: any,
  targetResolution: number = 1000
): Promise<string> => {
  
  const selectedEngine = this.determineEngine(mockup);
  
  if (selectedEngine === 'canvas_professional') {
    return await this.captureWithCanvasSimplified(mockup, designElements, canvasConfigs, printableAreas, productColor, productData, targetResolution);
  } else {
    return await this.captureWithPixiContainer(mockup, designElements, canvasConfigs, printableAreas, productColor, productData, targetResolution);
  }
};

// Fixed captureWithCanvasSimplified method with PIXI fallback
private captureWithCanvasSimplified = async (
  mockup: DynamicMockupPhoto,
  designElements: Record<string, DesignElement[]>,
  canvasConfigs: Record<string, any>,
  printableAreas: Record<string, any>,
  productColor: string,
  productData: any,
  targetResolution: number
): Promise<string> => {
  
  // Try Canvas engine first with 15 second timeout
  try {
    const canvasResult = await this.tryCanvasEngine(
      mockup, designElements, canvasConfigs, printableAreas, 
      productColor, productData, targetResolution
    );
    
    return canvasResult;
    
  } catch (canvasError) {
    
    // Fallback to PIXI engine
    try {
      const pixiResult = await this.captureWithPixiContainer(
        mockup, designElements, canvasConfigs, printableAreas, 
        productColor, productData, targetResolution
      );
      
      return pixiResult;
      
    } catch (pixiError) {
      throw new Error(`Both Canvas and PIXI failed: Canvas: ${canvasError.message}, PIXI: ${pixiError.message}`);
    }
  }
};

// Separate method for Canvas engine attempt with timeout
private tryCanvasEngine = async (
  mockup: DynamicMockupPhoto,
  designElements: Record<string, DesignElement[]>,
  canvasConfigs: Record<string, any>,
  printableAreas: Record<string, any>,
  productColor: string,
  productData: any,
  targetResolution: number
): Promise<string> => {
  
  return new Promise((resolve, reject) => {
    let renderCompleted = false;
    let renderTimeout: NodeJS.Timeout;
    let componentMounted = false;
    
    // Create visible container for Canvas rendering
    const container = document.createElement('div');
    container.style.cssText = `
  position: fixed;
  top: -9999px;
  left: -9999px;
  width: ${targetResolution}px;
  height: ${targetResolution}px;
  background: white;
  z-index: -1;
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
  overflow: hidden;
`;
    
    // Visual indicator
    container.innerHTML = `
      <div style="position: absolute; top: 8px; left: 8px; background: #10b981; color: white; padding: 6px 12px; font-size: 12px; border-radius: 6px; font-weight: bold; z-index: 10001;">
        Canvas Engine (15s timeout)
      </div>
      <div style="position: absolute; top: 8px; right: 8px; background: rgba(16,185,129,0.1); color: #10b981; padding: 6px 12px; font-size: 11px; border-radius: 6px; font-weight: bold;" id="canvas-progress">
        Initializing...
      </div>
      <div style="position: absolute; bottom: 8px; left: 8px; background: rgba(16,185,129,0.1); color: #10b981; padding: 4px 8px; font-size: 10px; border-radius: 4px;">
        ${mockup.title}
      </div>
    `;
    
    container.id = `canvas-pro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    document.body.appendChild(container);
    
    // Cleanup function
    const cleanup = () => {
      try {
        if (componentMounted) {
          componentMounted = false;
        }
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      } catch (e) {
      }
    };
    
    // Set 15 second timeout
    renderTimeout = setTimeout(() => {
      if (renderCompleted) return;
      renderCompleted = true;
      
      // Update progress to show timeout
      const progressElement = container.querySelector('#canvas-progress');
      if (progressElement) {
        progressElement.textContent = 'Timeout!';
        progressElement.style.background = '#f59e0b';
        progressElement.style.color = 'white';
      }
      
      // Cleanup and reject
      setTimeout(cleanup, 500);
      reject(new Error('Canvas engine timeout after 15 seconds'));
      
    }, 15000); // 15 second timeout
    
    import('react-dom/client').then(async ({ createRoot }) => {
      const root = createRoot(container);
      componentMounted = true;
      
      const mockupComponent = React.createElement(EnhancedMockupEngine, {
        mockup,
        designElements,
        canvasConfigs,
        canvasPrintableAreas: printableAreas,
        displayDimensions: { 
          width: targetResolution,
          height: targetResolution
        },
        productType: productData?.productType || 'apparel',
        productColor,
        renderEngine: 'canvas',
        enablePixiFeatures: false,
        
        // Success handler
        onRenderComplete: (imageData: string) => {
          if (renderCompleted) return;
          renderCompleted = true;
          
          // Update progress indicator
          const progressElement = container.querySelector('#canvas-progress');
          if (progressElement) {
            progressElement.textContent = 'Complete!';
            progressElement.style.background = '#10b981';
            progressElement.style.color = 'white';
          }
          
          if (renderTimeout) clearTimeout(renderTimeout);
          
          // Delayed cleanup to show success
          setTimeout(cleanup, 1000);
          
          if (imageData && imageData.length > 0) {
            resolve(imageData);
          } else {
            reject(new Error('Canvas completed but no image data received'));
          }
        },
        
        // Progress handler
        onProgress: (progress: number) => {
          const progressElement = container.querySelector('#canvas-progress');
          if (progressElement) {
            progressElement.textContent = `${Math.round(progress)}%`;
            if (progress > 50) {
              progressElement.style.background = '#10b981';
              progressElement.style.color = 'white';
            }
          }
        },
        
        // Error handler
        onError: (error: any) => {
          if (renderCompleted) return;
          renderCompleted = true;
          
          // Update progress indicator
          const progressElement = container.querySelector('#canvas-progress');
          if (progressElement) {
            progressElement.textContent = 'Error!';
            progressElement.style.background = '#ef4444';
            progressElement.style.color = 'white';
          }
          
          if (renderTimeout) clearTimeout(renderTimeout);
          
          // Cleanup and reject
          setTimeout(cleanup, 2000);
          reject(new Error(`Canvas render error: ${error?.message || error}`));
        }
      });
      
      // Render component with error handling
      try {
        root.render(mockupComponent);

      } catch (renderError) {
        if (!renderCompleted) {
          renderCompleted = true;
          if (renderTimeout) clearTimeout(renderTimeout);
          
          cleanup();
          reject(new Error(`Canvas render error: ${renderError.message}`));
        }
      }
      
    }).catch(importError => {
      if (!renderCompleted) {
        renderCompleted = true;
        if (renderTimeout) clearTimeout(renderTimeout);
        
        cleanup();
        reject(new Error(`ReactDOM import failed: ${importError.message}`));
      }
    });
  });
};

// 🔥 PIXI ENGINE - Keep existing working version
private captureWithPixiContainer = async (
  mockup: DynamicMockupPhoto,
  designElements: Record<string, DesignElement[]>,
  canvasConfigs: Record<string, any>,
  printableAreas: Record<string, any>,
  productColor: string,
  productData: any,
  targetResolution: number
): Promise<string> => {
  
  return new Promise((resolve, reject) => {
    let renderCompleted = false;
    let renderTimeout: NodeJS.Timeout;
    
    const container = document.createElement('div');
      container.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 500px;
    height: 500px;
    background: white;
    z-index: -1;
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
    overflow: hidden;
  `;
    
    container.innerHTML = `
    //   <div style="position: absolute; top: 5px; left: 5px; background: #8b5cf6; color: white; padding: 4px 8px; font-size: 11px; border-radius: 4px; font-weight: bold;">
    //     Engine: PIXI Dynamic
    //   </div>
    //   <div style="position: absolute; top: 5px; right: 5px; background: rgba(139,92,246,0.1); color: #8b5cf6; padding: 4px 8px; font-size: 10px; border-radius: 4px;" id="pixi-progress">0%</div>
    // `;
    container.innerHTML = `
      <div style="position: absolute; width: 100%; height: 100%;"></div>
    `;
    
    container.id = `pixi-container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    document.body.appendChild(container);
    
    import('react-dom/client').then(async ({ createRoot }) => {
      const root = createRoot(container);
      
      const mockupComponent = React.createElement(EnhancedMockupEngine, {
        mockup,
        designElements,
        canvasConfigs,
        canvasPrintableAreas: printableAreas,
        displayDimensions: { width: targetResolution, height: targetResolution },
        productType: productData?.productType || 'drinkware',
        productColor,
        renderEngine: 'pixi',
        enablePixiFeatures: true,
        onRenderComplete: async (imageData: string) => {
          if (renderCompleted) return;
          renderCompleted = true;
          
          if (renderTimeout) clearTimeout(renderTimeout);
          
          setTimeout(() => {
            try {
              root.unmount();
              if (document.body.contains(container)) {
                document.body.removeChild(container);

              }
            } catch (e) {
      
            }
          }, 200);
          
          resolve(imageData);
        },
        onProgress: (progress: number) => {
          const progressElement = container.querySelector('#pixi-progress');
          if (progressElement) {
            progressElement.textContent = `${Math.round(progress)}%`;
          }
    
        }
      });
      
      renderTimeout = setTimeout(() => {
        if (renderCompleted) return;
        renderCompleted = true;
        
        try {
          root.unmount();
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        } catch (e) {}
        
        reject(new Error(`PIXI timeout (20s)`));
      }, 20000);
      
      root.render(mockupComponent);
      
    }).catch(error => {
      if (!renderCompleted) {
        renderCompleted = true;
        if (renderTimeout) clearTimeout(renderTimeout);
        
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        reject(error);
      }
    });
  });
};

// 🔥 ENHANCED determineEngine method (your existing one is good, but here's the complete version)
private determineEngine = (mockup: DynamicMockupPhoto): 'canvas_professional' | 'pixi_dynamic' => {
  const productType = this.productData?.productType?.toLowerCase() || '';
  const isApparel = productType.includes('shirt') || 
                   productType.includes('tee') ||
                   productType.includes('apparel') ||
                   productType.includes('hoodie') ||
                   productType.includes('tank') ||
                   productType.includes('clothing');
  
  if (isApparel) {
    return 'canvas_professional';
  }
  
  const hasComplexFeatures = !!(
    mockup.dispMaps?.length ||
    mockup.alphaMasks?.length ||
    mockup.lightingOverlays?.length ||
    mockup.visibleAreas?.some(area => 
      area.surfaceWrapSettings?.enableWrap ||
      area.perspectiveSettings?.enablePerspective ||
      area.fabricIntegration?.enableFabricBlend ||
      area.maskingConfiguration?.enableMasking
    ) ||
    mockup.renderPref?.enableAdvancedEffects
  );
  
  if (hasComplexFeatures) {
    return 'pixi_dynamic';
  }

  return 'canvas_professional';
};

// 🔥 OPTIONAL: Add this property to the class to store product data
private productData: any;

// 🔥 OPTIONAL: Update your constructor or add this method to set product data
public setProductData(productData: any) {
  this.productData = productData;
}

  
  private determineEngine = (mockup: DynamicMockupPhoto): 'canvas_professional' | 'pixi_dynamic' => {
  // ðŸ”¥ FORCE CANVAS FOR T-SHIRTS - Add this check first
  if (this.productData?.productType?.toLowerCase().includes('shirt') || 
      this.productData?.productType?.toLowerCase().includes('tee') ||
      this.productData?.productType?.toLowerCase().includes('apparel')) {
    return 'canvas_professional';
  }

  if (mockup.renderPref?.preferredEngine) {
    switch (mockup.renderPref.preferredEngine) {
      case 'canvas':
        return 'canvas_professional';
      case 'pixi':
        return 'pixi_dynamic';
      case 'auto':
        break;
    }
  }

  const requiresPixi = !!(
    mockup.dispMaps?.length ||
    mockup.alphaMasks?.length ||
    mockup.lightingOverlays?.length ||
    mockup.visibleAreas?.some(area => 
      area.surfaceWrapSettings?.enableWrap ||
      area.perspectiveSettings?.enablePerspective ||
      area.fabricIntegration?.enableFabricBlend ||
      area.maskingConfiguration?.enableMasking
    ) ||
    mockup.renderPref?.enableAdvancedEffects
  );

  return requiresPixi ? 'pixi_dynamic' : 'canvas_professional';
};

  private generateSingleMockup = async (
    mockup: DynamicMockupPhoto,
    designElements: Record<string, DesignElement[]>,
    canvasConfigs: Record<string, any>,
    printableAreas: Record<string, any>,
    productColor: string,
    productData: any,
    targetResolution: number = 1000
  ): Promise<{ imageData: string; engine: 'canvas_professional' | 'pixi_dynamic'; metrics: any }> => {
    const startTime = performance.now();
    const engine = this.determineEngine(mockup);
    
    const cacheKey = `${mockup.id}-${productColor}-${Object.keys(designElements).length}-${targetResolution}`;
    
    if (this.renderCache.has(cacheKey)) {
      const cachedImageData = this.renderCache.get(cacheKey)!;
      return {
        imageData: cachedImageData,
        engine,
        metrics: {
          render_time_ms: 0,
          image_size_kb: Math.round((cachedImageData.length * 3) / 4 / 1024),
          compression_ratio: 2.0
        }
      };
    }
    
    if (this.generationQueue.has(cacheKey)) {
      return await this.generationQueue.get(cacheKey)!;
    }
    
    const generationPromise = this.capturePreviewRender(
      mockup, 
      designElements, 
      canvasConfigs, 
      printableAreas, 
      productColor, 
      productData, 
      targetResolution
    ).then(imageData => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      this.renderCache.set(cacheKey, imageData);
      
      return {
        imageData,
        engine,
        metrics: {
          render_time_ms: Math.round(renderTime),
          image_size_kb: Math.round((imageData.length * 3) / 4 / 1024),
          compression_ratio: 2.0
        }
      };
    });
    
    this.generationQueue.set(cacheKey, generationPromise);
    
    try {
      const result = await generationPromise;
      this.generationQueue.delete(cacheKey);
      return result;
    } catch (error) {
      this.generationQueue.delete(cacheKey);
      throw error;
    }
  };

  // ðŸ”¥ ENHANCED: Store import generation with proper color-specific grouping
  // ðŸ”¥ CORRECTED: Store import generation with proper size_Images handling
public generateForStoreImport = async (
  productData: PayloadProductData,
  selectedColors: Array<{ name: string; value: string }>,
  selectedSizes: string[],
  designElements: Record<string, DesignElement[]>,
  canvasConfigs: Record<string, any>,
  printableAreas: Record<string, any>,
  mockupCalculation: MockupCalculationResult,
  onProgress?: (progress: ImageGenerationProgress) => void
): Promise<StoreImportData> => {
  
  if (this.isGenerating) {
    throw new Error('Generation already in progress');
  }

  this.isGenerating = true;
  
  const generationStartTime = performance.now();
  const generationStarted = new Date().toISOString();
  
  // ðŸ”¥ CORRECTED: Calculate total combinations based on size_Images flag
  let totalCombinations: number;
  if (productData.size_Images) {
    // size_Images = true: Each size gets separate images
    totalCombinations = mockupCalculation.totalMockups * selectedSizes.length;
  } else {
    // size_Images = false: Images are shared across sizes
    totalCombinations = mockupCalculation.totalMockups;
  }
  
  let completedCombinations = 0;
  const errors: string[] = [];
  const engineUsage = { canvas_professional: 0, pixi_dynamic: 0 };

  const mockupVariants: StoreImportData['mockup_variants'] = [];

  try {
    // Process each color group
    for (const colorBreakdown of mockupCalculation.calculationBreakdown) {
      
      for (const mockup of colorBreakdown.mockups) {
        
        const smartProductColor = getProductColorForMockup(mockup, colorBreakdown.colorHex, productData);
        const determinedEngine = this.determineEngine(mockup);
        
        const colorCombinations: any[] = [{
          color_name: colorBreakdown.color,
          color_hex: colorBreakdown.colorHex,
          size_variants: []
        }];

        // ðŸ”¥ CORRECTED: Handle size generation based on size_Images flag from PayloadCMS
        if (!productData.size_Images) {
          
          const combinationId = `${mockup.title}-${colorBreakdown.color}-shared`;
          
          onProgress?.({
            total: totalCombinations,
            completed: completedCombinations,
            current_combination: combinationId,
            current_mockup: mockup.title,
            current_engine: determinedEngine,
            errors: [...errors]
          });

          try {

            const result = await this.generateSingleMockup(
              mockup,
              designElements,
              canvasConfigs,
              printableAreas,
              smartProductColor,
              productData,
              1000
            );

            engineUsage[result.engine]++;

            // Create size variants that all reference the same image
            selectedSizes.forEach(size => {
              colorCombinations[0].size_variants.push({
                size_name: size,
                generated_images: [{
                  engine_used: result.engine,
                  image_data: result.imageData,
                  resolution: 1000,
                  generation_timestamp: new Date().toISOString(),
                  quality_metrics: result.metrics
                }]
              });
            });

            completedCombinations++;

          } catch (error) {
            const errorMsg = `Failed: ${combinationId} - ${error.message}`;
            errors.push(errorMsg);
            
            // Create empty size variants on failure
            selectedSizes.forEach(size => {
              colorCombinations[0].size_variants.push({
                size_name: size,
                generated_images: []
              });
            });
          }

        } else {
          // ðŸ”¥ size_Images = TRUE: Generate separate images for each size
          
          for (let sizeIndex = 0; sizeIndex < selectedSizes.length; sizeIndex++) {
            const size = selectedSizes[sizeIndex];
            const combinationId = `${mockup.title}-${colorBreakdown.color}-${size}`;
            
            onProgress?.({
              total: totalCombinations,
              completed: completedCombinations,
              current_combination: combinationId,
              current_mockup: mockup.title,
              current_engine: determinedEngine,
              errors: [...errors]
            });

            try {

              const result = await this.generateSingleMockup(
                mockup,
                designElements,
                canvasConfigs,
                printableAreas,
                smartProductColor,
                productData,
                1000
              );

              engineUsage[result.engine]++;

              colorCombinations[0].size_variants.push({
                size_name: size,
                generated_images: [{
                  engine_used: result.engine,
                  image_data: result.imageData,
                  resolution: 1000,
                  generation_timestamp: new Date().toISOString(),
                  quality_metrics: result.metrics
                }]
              });

            } catch (error) {
              const errorMsg = `Failed: ${combinationId} - ${error.message}`;
              errors.push(errorMsg);
              
              colorCombinations[0].size_variants.push({
                size_name: size,
                generated_images: []
              });
            }

            completedCombinations++;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        // Add this mockup variant
        mockupVariants.push({
          mockup_id: mockup.id,
          mockup_title: mockup.title,
          view_angle: mockup.viewAngle || 'front',
          mockup_color: mockup.photoColor,
          color_combinations: colorCombinations
        });
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

  } catch (criticalError) {
    errors.push(`Critical error: ${criticalError.message}`);
  } finally {
    this.isGenerating = false;
    this.generationQueue.clear();
  }

  const generationEndTime = performance.now();
  const totalTimeMs = generationEndTime - generationStartTime;
  const generationCompleted = new Date().toISOString();
  let totalBase64Images = 0;
  let base64DataSize = 0;

  const totalImagesGenerated = mockupVariants.reduce((total, mockup) => 
    total + mockup.color_combinations.reduce((colorTotal, color) => 
      colorTotal + color.size_variants.reduce((sizeTotal, size) => 
        sizeTotal + size.generated_images.length, 0), 0), 0);
  // Include design configuration
 const designConfiguration = {
    canvas_configs: canvasConfigs,
    printable_areas: printableAreas,
    design_metadata: {
      total_elements: Object.values(designElements).flat().length,
      areas_used: Object.keys(designElements).filter(area => designElements[area].length > 0),
      creation_timestamp: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      base64_images: totalBase64Images, // âœ… Track base64 images
      base64_data_size_mb: parseFloat((base64DataSize / 1024 / 1024).toFixed(2))
    },
    payloadcms_flags: {
      color_Images: productData.color_Images,
      size_Images: productData.size_Images
    }
  };

  const storeImportData: StoreImportData = {
    product_id: productData.id || `product-${Date.now()}`,
    product_name: productData.name || 'Unnamed Product',
    product_type: productData.productType || 'custom',
    design_elements: designElements,
    design_configuration: designConfiguration,
    mockup_variants: mockupVariants,
    generation_summary: {
      total_combinations: totalCombinations,
      total_images_generated: totalImagesGenerated,
      generation_started: generationStarted,
      generation_completed: generationCompleted,
      total_time_ms: Math.round(totalTimeMs),
      engine_usage: engineUsage,
      mockup_calculation: mockupCalculation,
      errors: errors
    }
  };
  
  return storeImportData;
};

  public isGenerationInProgress(): boolean {
    return this.isGenerating;
  }

  public clearRenderCache(): void {
    this.renderCache.clear();
  }
}

// =====================================
// THUMBNAIL PREVIEW COMPONENT
// =====================================

interface ThumbnailPreviewProps {
  mockup: DynamicMockupPhoto;
  designElements: Record<string, DesignElement[]>;
  canvasConfigs: Record<string, any>;
  canvasPrintableAreas: Record<string, any>;
  productColor: string;
  isSelected: boolean;
  onSelect: () => void;
  displayDimensions?: { width: number; height: number };
  isMainPreview?: boolean; // 🔥 ADD THIS PROP
  productData: any;
}

const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({
  mockup,
  designElements,
  canvasConfigs,
  canvasPrintableAreas,
  productColor,
  isSelected,
  onSelect,
  displayDimensions = { width: 160, height: 160 }, // 🔥 DEFAULT TO THUMBNAIL SIZE
  isMainPreview = false, // 🔥 DEFAULT TO FALSE
  productData
}) => {
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [renderComplete, setRenderComplete] = useState(false);
  const [forceRender, setForceRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setForceRender(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mockup?.photo?.url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setRenderComplete(true);
      img.onerror = () => setThumbnailError('Failed to load base image');
      img.src = resolveImageUrl(mockup.photo.url);
    }
  }, [mockup?.photo?.url]);

  const determineRenderEngine = useCallback((): 'canvas' | 'pixi' | 'auto' => {
    if (mockup.renderPref?.preferredEngine) {
      switch (mockup.renderPref.preferredEngine) {
        case 'canvas':
          return 'canvas';
        case 'pixi':
          return 'pixi';
        case 'auto':
          break;
      }
    }

    const requiresPixi = !!(
      mockup.dispMaps?.length ||
      mockup.alphaMasks?.length ||
      mockup.lightingOverlays?.length ||
      mockup.visibleAreas?.some(area => 
        area.surfaceWrapSettings?.enableWrap ||
        area.perspectiveSettings?.enablePerspective ||
        area.fabricIntegration?.enableFabricBlend ||
        area.maskingConfiguration?.enableMasking
      ) ||
      mockup.renderPref?.enableAdvancedEffects
    );

    return requiresPixi ? 'pixi' : 'canvas';
  }, [mockup]);

  const renderMockupThumbnail = useCallback(() => {
    if (!mockup?.photo?.url) {
      return (
        <div className="flex items-center justify-center w-full h-full text-gray-400">
          <span className="text-xs">No Image</span>
        </div>
      );
    }

    const hasDesignElements = Object.values(designElements).some(elements => elements.length > 0);
    
    if (!hasDesignElements) {
      return (
        <img
          src={resolveImageUrl(mockup.photo.url)}
          alt={mockup.title}
          className="object-cover w-full h-full"
          onError={() => setThumbnailError('Failed to load image')}
        />
      );
    }

    const renderEngine = determineRenderEngine();

    if (forceRender || renderComplete) {
      return (
        <div className="relative w-full h-full">
          <EnhancedMockupEngine
            mockup={mockup}
             showBadges={false}
            designElements={designElements}
            canvasConfigs={canvasConfigs}
            canvasPrintableAreas={canvasPrintableAreas}
              displayDimensions={displayDimensions}
            // displayDimensions={{ width: 160, height: 160 }}
            productType={productData.productType || 'flat'}
            productColor={productColor}
            renderEngine={renderEngine}
            enablePixiFeatures={true}
            pixelRatio={isMainPreview ? 2 : 1}
            onRenderComplete={() => {
            }}
            onProgress={(progress) => {
            }}
          />
        </div>
      );
    }

    return (
      <div className="relative w-full h-full">
        <div className="flex items-center justify-center w-full h-full bg-gray-100">
          <img
            src={resolveImageUrl(mockup.photo.url)}
            alt={mockup.title}
            className="object-cover w-full h-full opacity-30"
            onError={() => setThumbnailError('Failed to load mockup')}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <div className="text-center">
              <div className="w-3 h-3 mx-auto mb-1 border-b-2 border-blue-500 rounded-full animate-spin"></div>
              <div className="text-xs text-gray-600">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [mockup, designElements, canvasConfigs, canvasPrintableAreas, productColor, productData, renderComplete, thumbnailError, determineRenderEngine, forceRender]);

  const getEngineType = useMemo(() => {
    const renderEngine = determineRenderEngine();
    return renderEngine === 'pixi' ? 'PIXI' : 'Canvas';
  }, [determineRenderEngine]);

  if (thumbnailError) {
    return (
      <button
        onClick={onSelect}
        className={`w-full p-2 border rounded-lg transition-all relative ${
          isSelected
            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
      >
        <div className="relative mb-2 overflow-hidden bg-gray-100 roundedstyle={{ aspectRatio: '4/5', minHeight: '160px' }}">
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            <div className="text-center">
              <span className="text-xs">âš ï¸</span>
              <p className="mt-1 text-xs">Error</p>
            </div>
          </div>
        </div>
        
        <p className="text-xs font-medium text-center line-clamp-1">{mockup.title}</p>
        <p className="text-xs text-center text-gray-500">{mockup.viewAngle}</p>
        <p className="text-xs text-center text-gray-400">{mockup.photoColor}</p>
      </button>
    );
  }

  return (
    <button
      onClick={onSelect}
      className={`w-full p-2 border rounded-lg transition-all relative ${
        isSelected
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="relative mb-2 overflow-hidden bg-gray-100 rounded aspect-square">
        {renderMockupThumbnail()}
      </div>
      
      <p className="text-xs font-medium text-center line-clamp-1">{mockup.title}</p>
      <p className="text-xs text-center text-gray-500">{mockup.viewAngle}</p>
      <p className="text-xs text-center text-gray-400">{mockup.photoColor}</p>
      
      <div className="flex items-center justify-center mt-1 space-x-1">
        <span className={`text-xs px-1 py-0.5 rounded ${
          getEngineType === 'PIXI' 
            ? 'bg-purple-100 text-purple-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {getEngineType}
        </span>
        {mockup.dispMaps?.length > 0 && <span className="text-xs" title="Displacement Maps">ðŸŒŠ</span>}
        {mockup.alphaMasks?.length > 0 && <span className="text-xs" title="Alpha Masks">ðŸŽ­</span>}
        {mockup.lightingOverlays?.length > 0 && <span className="text-xs" title="Lighting Effects">ðŸ’¡</span>}
      </div>
      
      {isSelected && (
        <div className="absolute top-1 right-1">
          <div className="flex items-center justify-center w-4 h-4 bg-blue-600 rounded-full">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
};

// =====================================
// LAYERS PANEL COMPONENT
// =====================================

interface LayersPanelProps {
  layers: LayerInfo[];
  selectedId: string | null;
  onSelectLayer: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  onMoveLayer: (layerId: string, direction: 'up' | 'down') => void;
  onDuplicateLayer: (layerId: string) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  selectedId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onDeleteLayer,
  onMoveLayer,
  onDuplicateLayer
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Layers</h3>
        <div className="text-xs text-gray-500">
          Total: {layers.length}
        </div>
      </div>
      
      <div className="space-y-1 overflow-y-auto max-h-80">
        {layers.map((layer, index) => (
          <div
            key={layer.element.id}
            className={`group border rounded-lg p-3 cursor-pointer transition-all hover:shadow-sm ${
              selectedId === layer.element.id
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelectLayer(layer.element.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0 w-8 h-8 overflow-hidden bg-gray-100 border rounded">
                  {layer.element.type === 'image' && layer.element.image ? (
                    <img
                      src={layer.element.imageUrl}
                      alt={layer.element.layerName}
                      className="object-cover w-full h-full"
                    />
                  ) : layer.element.type === 'text' ? (
                    <div className="flex items-center justify-center w-full h-full text-gray-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-200"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {layer.element.layerName || layer.element.imageName || layer.element.text || `Layer ${index + 1}`}
                  </div>
                  <div className="text-xs text-gray-500 uppercase">
                    {layer.element.type}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 transition-opacity opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(layer.element.id);
                  }}
                  className={`p-1 rounded hover:bg-gray-200 ${
                    layer.element.visible !== false ? 'text-gray-700' : 'text-gray-400'
                  }`}
                  title={layer.element.visible !== false ? 'Hide layer' : 'Show layer'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {layer.element.visible !== false ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m-3.122-3.122L21 21" />
                    )}
                  </svg>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLock(layer.element.id);
                  }}
                  className={`p-1 rounded hover:bg-gray-200 ${
                    layer.element.locked ? 'text-red-600' : 'text-gray-400'
                  }`}
                  title={layer.element.locked ? 'Unlock layer' : 'Lock layer'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {layer.element.locked ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {layer.element.type === 'image' && (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Print quality:</span>
                    <span className={`font-medium ${layer.printQualityColor}`}>
                      {layer.printQuality}
                    </span>
                    <span className="text-gray-500">/ {layer.dpi} DPI</span>
                  </div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: layer.printQualityColor.includes('green') ? '#10b981' : layer.printQualityColor.includes('yellow') ? '#f59e0b' : '#ef4444' }}></div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Width: {layer.dimensions.widthUnits.toFixed(2)} units</span>
                <span>Height: {layer.dimensions.heightUnits.toFixed(2)} units</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {layers.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <div className="mb-2 text-2xl">ðŸ“„</div>
          <p className="text-sm">No layers yet</p>
          <p className="mt-1 text-xs">Upload images to create layers</p>
        </div>
      )}
    </div>
  );
};

// =====================================
// STORE IMPORT MODAL COMPONENT
// =====================================

interface StoreImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  importData: StoreImportData | null;
  isGenerating: boolean;
  generationProgress: ImageGenerationProgress | null;
  mockupCalculation: MockupCalculationResult | null;
}

const StoreImportModal: React.FC<StoreImportModalProps> = ({
  isOpen,
  onClose,
  importData,
  isGenerating,
  generationProgress,
  mockupCalculation
}) => {
  const brandColor = '#ec5100';

  const downloadImportData = useCallback(() => {
    if (!importData) return;

    try {
      const dataStr = JSON.stringify(importData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${importData.product_name.replace(/\s+/g, '_')}_store_import.json`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        try {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
          URL.revokeObjectURL(url);
        } catch (cleanupError) {
        }
      }, 100);
      
    } catch (error) {
      alert('Error downloading file. Please try again.');
    }
  }, [importData]);

  const handleImportToStore = useCallback(() => {
    if (!importData) return;
    
    alert(`âœ… Ready to import to store!\n\n` +
          `Product: ${importData.product_name}\n` +
          `Total Images: ${importData.generation_summary.total_images_generated}\n` +
          `Generation Time: ${Math.round(importData.generation_summary.total_time_ms / 1000)}s\n` +
          `Canvas Professional: ${importData.generation_summary.engine_usage.canvas_professional} images\n` +
          `PIXI Dynamic: ${importData.generation_summary.engine_usage.pixi_dynamic} images\n\n` +
          `Integration with store API would happen here.`);
  }, [importData]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isGenerating) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold" style={{ color: brandColor }}>
            Enhanced Store Import Generation
          </h2>
          {/* <button
            onClick={onClose}
            disabled={isGenerating}
            className={`text-2xl transition-colors ${
              isGenerating 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Ã—
          </button> */}
        </div>
        
        <div className="p-6">
          {/* Enhanced Calculation Preview */}
          {/* {mockupCalculation && !isGenerating && (
            <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
              <div className="mb-2 text-sm font-medium text-blue-800">
                ðŸ“Š Enhanced Mockup Calculation ({mockupCalculation.strategy.replace(/_/g, ' ')})
              </div>
              <div className="space-y-1 text-sm text-blue-700">
                <div className="font-medium">
                  ðŸŽ¯ Total Unique Mockups: <strong>{mockupCalculation.totalMockups}</strong>
                </div>
                <div className="p-2 mt-2 text-xs bg-blue-100 rounded">
                  <div className="mb-1 font-medium text-blue-900">ðŸ“‹ Breakdown by Color:</div>
                  {mockupCalculation.calculationBreakdown.map((item, index) => (
                    <div key={index} className="text-xs">
                      â€¢ <strong>{item.color}</strong> ({item.colorHex}): {item.mockupsForColor} mockup(s)
                      {item.mockups.length > 0 && (
                        <div className="ml-4 text-xs text-blue-600">
                          Mockups: {item.mockups.map(m => m.title).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )} */}

          {/* Generation Progress */}
          {isGenerating && generationProgress && (
            <div className="p-4 mb-6 border border-orange-200 rounded-lg bg-orange-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-orange-800"> Generating Enhanced Store Data...</h4>
                <div className="text-sm text-orange-600">
                  {generationProgress.completed}/{generationProgress.total}
                </div>
              </div>
              
              <div className="w-full h-3 mb-3 bg-gray-200 rounded-full">
                <div 
                  className="h-3 transition-all duration-300 bg-orange-600 rounded-full"
                  style={{ 
                    width: `${(generationProgress.completed / generationProgress.total) * 100}%` 
                  }}
                ></div>
              </div>
              
              <div className="space-y-1 text-sm text-orange-700">
                {generationProgress.current_combination && (
                  <div>Combination: <strong>{generationProgress.current_combination}</strong></div>
                )}
                {generationProgress.current_mockup && (
                  <div>Mockup: <strong>{generationProgress.current_mockup}</strong></div>
                )}
                <div className="flex items-center space-x-2">
                  <span>Engine:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    generationProgress.current_engine === 'pixi_dynamic'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {generationProgress.current_engine === 'pixi_dynamic' ? 'PIXI Dynamic' : 'Canvas Professional'}
                  </span>
                </div>
                {generationProgress.estimated_time_remaining_ms && (
                  <div className="text-gray-600">
                    ETA: {Math.round(generationProgress.estimated_time_remaining_ms / 1000)}s
                  </div>
                )}
              </div>
              
              {generationProgress.errors.length > 0 && (
                <div className="mt-2 text-sm text-red-600">
                  Errors: {generationProgress.errors.length}
                </div>
              )}
            </div>
          )}

          {/* Generation Complete */}
          {!isGenerating && importData && (
            <div className="space-y-6">
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center">
                  <div className="mr-2 text-xl text-green-600">âœ…</div>
                  <div>
                    <h4 className="font-semibold text-green-800">Enhanced Store Import Data Generated!</h4>
                    <p className="text-sm text-green-700">
                      Generated {importData.generation_summary.total_images_generated} images 
                      in {Math.round(importData.generation_summary.total_time_ms / 1000)} seconds
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="p-4 text-center rounded-lg bg-gray-50">
                  <div className="text-2xl font-bold" style={{ color: brandColor }}>
                    {importData.mockup_variants.length}
                  </div>
                  <div className="text-sm text-gray-600">Mockup Variants</div>
                </div>
                <div className="p-4 text-center rounded-lg bg-gray-50">
                  <div className="text-2xl font-bold" style={{ color: brandColor }}>
                    {importData.generation_summary.total_images_generated}
                  </div>
                  <div className="text-sm text-gray-600">Total Images</div>
                </div>
                <div className="p-4 text-center rounded-lg bg-purple-50">
                  <div className="text-2xl font-bold text-purple-600">
                    {importData.generation_summary.engine_usage.pixi_dynamic}
                  </div>
                  <div className="text-sm text-gray-600">PIXI Dynamic</div>
                </div>
                <div className="p-4 text-center rounded-lg bg-blue-50">
                  <div className="text-2xl font-bold text-blue-600">
                    {importData.generation_summary.engine_usage.canvas_professional}
                  </div>
                  <div className="text-sm text-gray-600">Canvas Professional</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50">
                <h4 className="mb-3 font-medium">ðŸ“Š Enhanced Generation Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Product:</span> {importData.product_name}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {importData.product_type}
                  </div>
                  <div>
                    <span className="font-medium">Strategy:</span> {importData.generation_summary.mockup_calculation.strategy.replace(/_/g, ' ')}
                  </div>
                  <div>
                    <span className="font-medium">Design Areas:</span> {importData.design_configuration.design_metadata.areas_used.join(', ')}
                  </div>
                  <div>
                    <span className="font-medium">Total Elements:</span> {importData.design_configuration.design_metadata.total_elements}
                  </div>
                  <div>
                    <span className="font-medium">Completed:</span> {new Date(importData.generation_summary.generation_completed).toLocaleString()}
                  </div>
                </div>
                
                {importData.generation_summary.errors.length > 0 && (
                  <div className="pt-3 mt-3 border-t">
                    <div className="text-sm text-red-600">
                      <strong>Errors ({importData.generation_summary.errors.length}):</strong>
                      <ul className="mt-1 overflow-y-auto max-h-20">
                        {importData.generation_summary.errors.slice(0, 3).map((error, index) => (
                          <li key={index} className="text-xs">â€¢ {error}</li>
                        ))}
                        {importData.generation_summary.errors.length > 3 && (
                          <li className="text-xs text-gray-500">... and {importData.generation_summary.errors.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleImportToStore}
                  className="flex-1 px-6 py-3 font-medium text-white transition-colors rounded-lg hover:opacity-90"
                  style={{ backgroundColor: brandColor }}
                >
                  Import to Store
                </button>
                <button
                  onClick={downloadImportData}
                  className="px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  ðŸ“ Download Data
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 font-medium text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* No data and not generating */}
          {!isGenerating && !importData && (
            <div className="py-8 text-center">
              <div className="mb-4 text-4xl">ðŸª</div>
              <p className="text-gray-600">No import data available.</p>
              <p className="mt-1 text-sm text-gray-500">Click "Generate & Import to Store" to generate mockups.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =====================================
// MAIN CANVAS COMPONENT
// =====================================

const EnhancedCanvas: React.FC<{ productData: PayloadProductData }> = ({ productData }) => {
  const brandColor = '#ec5100';
  
  // =====================================
  // STATE MANAGEMENT
  // =====================================
  
  const [activeView, setActiveView] = useState<'design' | 'preview'>('design');
  const [activeTab, setActiveTab] = useState<'colors' | 'sizes' | 'upload' | 'library' | 'layers'>('upload');
  const [debugMode, setDebugMode] = useState(false);
  const navigate = useNavigate();
  const designElementsRef = useRef<Record<string, DesignElement[]>>({});
  
  const [activeTechnology, setActiveTechnology] = useState<string>(() => {
    return productData?.printTechn?.[0]?.id || productData?.printTechn?.[0]?.technologyName || 'dtg';
  });
  const [activeArea, setActiveArea] = useState<string>('front');
  
const [selectedColors, setSelectedColors] = useState<Array<{ name: string; value: string }>>(() => {
  // Use dynamic color detection instead of hardcoded fallback
  if (productData?.colorOptions && productData.colorOptions.length > 0) {
    const primaryColor = productData.colorOptions.find((color: any) => color?.isPrimary);
    const firstColor = primaryColor || productData.colorOptions[0];
    
    if (firstColor?.colorHex && firstColor?.colorName) {
      return [{ name: firstColor.colorName, value: firstColor.colorHex }];
    }
  }
  
  // Only fallback to white if no product colors exist
  return [{ name: 'Default', value: '#ffffff' }];
});
  
  const [selectedSizes, setSelectedSizes] = useState<string[]>(() => {
    const allSizes = (productData?.sizeOptions || [])
      .filter((size: any) => size?.sizeName)
      .map((size: any) => size.sizeName);
    return allSizes.length > 0 ? allSizes : [];
  });
  
const [activeColor, setActiveColor] = useState<string>(() => {
  // Use dynamic color detection instead of hardcoded fallback
  if (productData?.colorOptions && productData.colorOptions.length > 0) {
    const primaryColor = productData.colorOptions.find((color: any) => color?.isPrimary);
    const firstColor = primaryColor || productData.colorOptions[0];
    
    if (firstColor?.colorHex) {
      return firstColor.colorHex;
    }
  }
  
  // Only fallback to white if no product colors exist
  return '#ffffff';
});
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const [canvasImages, setCanvasImages] = useState<Record<string, HTMLImageElement | null>>({});
  const [designElements, setDesignElements] = useState<Record<string, DesignElement[]>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedHeroMockup, setSelectedHeroMockup] = useState<DynamicMockupPhoto | null>(null);
  
  // Store Import States
  const [isGeneratingForStore, setIsGeneratingForStore] = useState(false);
  const [storeImportData, setStoreImportData] = useState<StoreImportData | null>(null);
  const [showStoreImportModal, setShowStoreImportModal] = useState(false);
  const [storeGenerationProgress, setStoreGenerationProgress] = useState<ImageGenerationProgress | null>(null);
  
  const [needsColorOverlay, setNeedsColorOverlay] = useState<Record<string, boolean>>({});
  
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [forceUpdate, setForceUpdate] = useState(0);
  const triggerUpdate = useCallback(() => {
    setForceUpdate(prev => prev + 1);
  }, []);

  // =====================================
  // MEMOIZED CONFIGURATIONS
  // =====================================
  
  const allMockups = useMemo(() => extractAllMockupsFromPayload(productData), [productData]);
  const currentHero = useMemo(() => selectedHeroMockup || allMockups[0] || null, [selectedHeroMockup, allMockups]);
  const mockupGenerator = useMemo(() => new EnhancedMockupGenerator(), []);

  // ðŸ”¥ ENHANCED: Mockup calculation with proper color-specific logic
  const mockupCalculation = useMemo(() => {
    if (selectedColors.length === 0 || selectedSizes.length === 0) {
      return null;
    }
    return calculateTotalMockups(productData, selectedColors, selectedSizes);
  }, [productData, selectedColors, selectedSizes]);

  // ðŸ”¥ ENHANCED: Color-specific mockup groups
  const colorSpecificMockupGroups = useMemo(() => {
    return getColorSpecificMockupGroups(productData, selectedColors);
  }, [productData, selectedColors]);

  // Surface configuration based on product data
  const getSurfaceConfiguration = useCallback(() => {
    if (!productData) return { renderType: 'flat' as const };
    
    let surfaceType: 'flat' | 'cylindrical' | 'conical' | 'spherical' | 'complex_3d' | 'apparel_body' | 'sleeve_wrap' = 'flat';
    
    const productType = productData.productType?.toLowerCase() || '';
    
    if (productType.includes('mug') || productType.includes('bottle') || productType.includes('tumbler')) {
      surfaceType = 'cylindrical';
    } else if (productType.includes('hat') || productType.includes('cap')) {
      surfaceType = 'conical';
    } else if (productType.includes('ball') || productType.includes('ornament')) {
      surfaceType = 'spherical';
    } else if (productType.includes('shirt') || productType.includes('tee') || productType.includes('hoodie')) {
      surfaceType = 'apparel_body';
    } else if (productType.includes('sleeve')) {
      surfaceType = 'sleeve_wrap';
    } else if (productType.includes('pillow') || productType.includes('cushion')) {
      surfaceType = 'complex_3d';
    }
    
    return {
      renderType: surfaceType,
      surfProp: {
        wrapAngle: surfaceType === 'cylindrical' ? 280 : 0,
        curveInten: surfaceType === 'cylindrical' ? 0.8 : 0,
        designRatio: { widthRatio: 1.0, heightRatio: 1.0 }
      },
      blendSet: {
        defaultBlendMode: 'normal',
        defaultOpacity: 1.0,
        preserveColors: true
      }
    };
  }, [productData]);
  
  // =====================================
  // HELPER FUNCTIONS
  // =====================================
  
  const getCurrentTechnology = useCallback(() => {
    return productData?.printTechn?.find((tech: any) => tech.id === activeTechnology || tech.technologyName === activeTechnology);
  }, [productData, activeTechnology]);
  
  const getAvailableAreas = useCallback(() => {
    try {
      const technology = getCurrentTechnology();
      if (!technology?.custAreas?.length) {
        return ['front'];
      }
      
      const areas = technology.custAreas
        .filter((area: any) => area?.areaName)
        .map((area: any) => area.areaName.toLowerCase());
      
      return areas.length > 0 ? areas : ['front'];
    } catch (error) {
      return ['front'];
    }
  }, [getCurrentTechnology]);
  
  const availableAreas = useMemo(() => getAvailableAreas(), [getAvailableAreas]);
  
  const getCustomizationAreaByName = useCallback((targetArea: string) => {
    const technology = getCurrentTechnology();
    if (!technology) return null;
    return technology.custAreas?.find((area: any) => 
      area.areaName?.toLowerCase() === targetArea.toLowerCase()
    );
  }, [getCurrentTechnology]);

  const getCanvasConfig = useCallback((areaId: string, colorHex?: string) => {
    try {
      const area = getCustomizationAreaByName(areaId);
      if (!area) {
        return { width: 800, height: 600, realWorldWidth: 8, realWorldHeight: 12 };
      }

      const canvasDims = area.canvasDim || {
        widthInch: 8,
        heightInch: 12,
        canvasPixWid: 800,
        canvasPixHeight: 600,
        aspectRatioLocked: true
      };

      return {
        width: canvasDims.canvasPixWid || 800,
        height: canvasDims.canvasPixHeight || 600,
        realWorldWidth: canvasDims.widthInch || 8,
        realWorldHeight: canvasDims.heightInch || 12,
      };
    } catch (error) {
      return { width: 800, height: 600, realWorldWidth: 8, realWorldHeight: 12 };
    }
  }, [getCustomizationAreaByName]);
  
  const checkIfColorOverlayNeeded = useCallback((areaId: string, colorHex: string) => {
    const area = getCustomizationAreaByName(areaId);
    if (!area?.designCanvasPhotos?.length) return false;
    
    const exactColorPhoto = area.designCanvasPhotos.find((p: any) => 
      p?.photoColor?.toLowerCase() === colorHex?.toLowerCase()
    );
    
    const needsOverlay = !exactColorPhoto && colorHex !== '#ffffff' && 
                        area.designCanvasPhotos.some((p: any) => 
                          p?.photoColor?.toLowerCase() === '#ffffff'
                        );
    
    return needsOverlay;
  }, [getCustomizationAreaByName]);
  
  const getPrintableAreaFromPhoto = useCallback((areaId: string, colorHex?: string) => {
    try {
      const area = getCustomizationAreaByName(areaId);
      if (!area?.designCanvasPhotos?.length) {
        const canvasConfig = getCanvasConfig(areaId);
        return { 
          x: canvasConfig.width * 0.1, 
          y: canvasConfig.height * 0.1, 
          width: canvasConfig.width * 0.8, 
          height: canvasConfig.height * 0.8 
        };
      }
      
      const targetColor = colorHex || activeColor;
      let canvasPhoto = area.designCanvasPhotos.find((p: any) => 
        p?.photoColor?.toLowerCase() === targetColor?.toLowerCase()
      );
      
      if (!canvasPhoto) {
        canvasPhoto = area.designCanvasPhotos.find((p: any) => 
          p?.photoColor?.toLowerCase() === '#ffffff'
        );
      }
      
      if (!canvasPhoto) {
        canvasPhoto = area.designCanvasPhotos[0];
      }
      
      if (!canvasPhoto?.printAreaCoord) {
        const canvasConfig = getCanvasConfig(areaId);
        return { 
          x: canvasConfig.width * 0.1, 
          y: canvasConfig.height * 0.1, 
          width: canvasConfig.width * 0.8, 
          height: canvasConfig.height * 0.8 
        };
      }

      const canvasConfig = getCanvasConfig(areaId, colorHex);
      const printArea = {
        x: canvasPhoto.printAreaCoord.x * canvasConfig.width,
        y: canvasPhoto.printAreaCoord.y * canvasConfig.height, 
        width: canvasPhoto.printAreaCoord.width * canvasConfig.width,
        height: canvasPhoto.printAreaCoord.height * canvasConfig.height,
      };
      
      return printArea;
    } catch (error) {
      const canvasConfig = getCanvasConfig(areaId);
      return { 
        x: canvasConfig.width * 0.1, 
        y: canvasConfig.height * 0.1, 
        width: canvasConfig.width * 0.8, 
        height: canvasConfig.height * 0.8 
      };
    }
  }, [getCustomizationAreaByName, activeColor, getCanvasConfig]);

  const calculateDPI = useCallback((element: DesignElement): { dpi: number; quality: 'Poor' | 'Good' | 'Excellent'; color: string } => {
    if (!element.image || !element.originalImageWidth || !element.originalImageHeight) {
      return { dpi: 0, quality: 'Poor', color: 'text-red-600' };
    }
    
    const canvasConfig = getCanvasConfig(activeArea);
    
    const elementWidthInches = (element.width / canvasConfig.width) * canvasConfig.realWorldWidth;
    const elementHeightInches = (element.height / canvasConfig.height) * canvasConfig.realWorldHeight;
    
    const dpiX = element.originalImageWidth / elementWidthInches;
    const dpiY = element.originalImageHeight / elementHeightInches;
    const dpi = Math.round(Math.min(dpiX, dpiY));
    
    const technology = getCurrentTechnology();
    const dpiRequirements = technology?.printingConstraints?.dpiRequirements || {
      minimum: 150,
      recommended: 300,
      maximum: 600
    };
    
    let quality: 'Poor' | 'Good' | 'Excellent';
    let color: string;
    
    if (dpi >= dpiRequirements.recommended) {
      quality = 'Excellent';
      color = 'text-green-600';
    } else if (dpi >= dpiRequirements.minimum) {
      quality = 'Good';
      color = 'text-yellow-600';
    } else {
      quality = 'Poor';
      color = 'text-red-600';
    }
    
    return { dpi, quality, color };
  }, [activeArea, getCanvasConfig, getCurrentTechnology]);
  
  const getLayersInfo = useCallback((): LayerInfo[] => {
    const elements = designElements[activeArea] || [];
    const canvasConfig = getCanvasConfig(activeArea);
    
    return elements
      .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
      .map(element => {
        const dpiInfo = calculateDPI(element);
        
        const widthInches = (element.width / canvasConfig.width) * canvasConfig.realWorldWidth;
        const heightInches = (element.height / canvasConfig.height) * canvasConfig.realWorldHeight;
        const widthUnits = element.width / canvasConfig.width;
        const heightUnits = element.height / canvasConfig.height;
        
        return {
          element: {
            ...element,
            layerName: element.imageName || element.text || `Layer ${element.id.slice(-4)}`,
            visible: element.visible !== false,
            locked: element.locked || false
          },
          dpi: dpiInfo.dpi,
          printQuality: dpiInfo.quality,
          printQualityColor: dpiInfo.color,
          dimensions: {
            widthInches,
            heightInches,
            widthUnits,
            heightUnits
          }
        };
      });
  }, [designElements, activeArea, calculateDPI, getCanvasConfig]);
  
  const getAllCanvasConfigs = useMemo(() => {
    const configs: Record<string, any> = {};
    availableAreas.forEach(area => {
      configs[area] = getCanvasConfig(area);
    });
    return configs;
  }, [availableAreas, getCanvasConfig]);
  
  const getAllPrintableAreas = useMemo(() => {
    const areas: Record<string, any> = {};
    availableAreas.forEach(area => {
      areas[area] = getPrintableAreaFromPhoto(area);
    });
    return areas;
  }, [availableAreas, getPrintableAreaFromPhoto]);

  const hasDesignElements = useMemo(() => {
    return Object.values(designElements).some(elements => elements.length > 0);
  }, [designElements]);
  

const extractDesignImages = useCallback(() => {
  const designImages = [];
  let totalElements = 0;
  let imageElements = 0;
  
  Object.entries(designElements).forEach(([area, elements]) => {
    if (!Array.isArray(elements)) {
      return;
    }
    
    totalElements += elements.length;
    
    elements.forEach((element, index) => {
      if (element.type === 'image' && element.imageBase64) {
        imageElements++;
        
        const canvasConfig = getCanvasConfig(area);
        const dpiInfo = calculateDPI(element);
        
        // Generate detailed manufacturing description
        const widthInches = (element.width / canvasConfig.width) * canvasConfig.realWorldWidth;
        const heightInches = (element.height / canvasConfig.height) * canvasConfig.realWorldHeight;
        const xInches = (element.x / canvasConfig.width) * canvasConfig.realWorldWidth;
        const yInches = (element.y / canvasConfig.height) * canvasConfig.realWorldHeight;
        
        const description = `DESIGN IMAGE SPECIFICATIONS:
Area: ${area.toUpperCase()}
Position: (${xInches.toFixed(3)}", ${yInches.toFixed(3)}")
Size: ${widthInches.toFixed(3)}" x ${heightInches.toFixed(3)}"
Pixels: ${element.width} x ${element.height}
Original: ${element.originalImageWidth || element.width} x ${element.originalImageHeight || element.height}
Print Quality: ${dpiInfo.quality} (${dpiInfo.dpi} DPI)
Rotation: ${element.rotation || 0}°
Scale: ${element.scaleX || 1} x ${element.scaleY || 1}
Opacity: ${Math.round((element.opacity || 1) * 100)}%
File: ${element.imageName || `design-image-${imageElements}.png`}
Generated: ${new Date().toISOString()}`;
        
        const designImage = {
          id: element.id,
          name: element.imageName || `design-image-${imageElements}.png`,
          type: 'image/png',
          base64Data: element.imageBase64,
          originalWidth: element.originalImageWidth || element.width,
          originalHeight: element.originalImageHeight || element.height,
          area: area,
          position: { x: element.x, y: element.y },
          dimensions: { width: element.width, height: element.height },
          rotation: element.rotation || 0,
          scaleX: element.scaleX || 1,
          scaleY: element.scaleY || 1,
          opacity: element.opacity || 1,
          description: description
        };
        
        designImages.push(designImage);
      }
    });
  });
  
  return designImages;
}, [designElements, getCanvasConfig, calculateDPI]);



// Canvas Image Capture Functions
const captureCanvasImageForArea = useCallback(async (areaId: string): Promise<string | null> => {
  try {
    const elements = designElements[areaId] || [];
    const visibleElements = elements.filter(element => element.visible !== false);
    
    if (visibleElements.length === 0) {
      return null;
    }
    
    const canvasConfig = getCanvasConfig(areaId, activeColor);
    const printableArea = getPrintableAreaFromPhoto(areaId, activeColor);
    
    // Get the canvas background image (t-shirt template)
    const canvasImage = canvasImages[`${areaId}_${activeColor}`] || canvasImages[areaId];
    
    console.log(`🎯 CANVAS CAPTURE: Starting capture for ${areaId}`, {
      canvasConfig,
      hasCanvasImage: !!canvasImage,
      visibleElements: visibleElements.length,
      printableArea
    });
    
    // Create temporary stage with higher resolution for quality
    const tempStage = new Konva.Stage({
      container: document.createElement('div'),
      width: canvasConfig.width,
      height: canvasConfig.height,
      pixelRatio: 2 // High quality
    });
    
    const tempLayer = new Konva.Layer();
    tempStage.add(tempLayer);
    
    // STEP 1: Add transparent background (no color fill)
    const backgroundRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: canvasConfig.width,
      height: canvasConfig.height,
      fill: 'transparent', // Transparent background
      listening: false
    });
    tempLayer.add(backgroundRect);
    
    // STEP 2: Add the t-shirt template with color applied only to the t-shirt shape
    if (canvasImage) {
      console.log(`🎯 CANVAS CAPTURE: Adding t-shirt template with color ${activeColor}`);
      
      // First, add a colored rectangle for the t-shirt
      const tshirtColorRect = new Konva.Rect({
        x: 0,
        y: 0,
        width: canvasConfig.width,
        height: canvasConfig.height,
        fill: activeColor, // T-shirt color
        listening: false
      });
      tempLayer.add(tshirtColorRect);
      
      // Then add the t-shirt template as a mask to shape the color
      const canvasImageNode = new Konva.Image({
        image: canvasImage,
        x: 0,
        y: 0,
        width: canvasConfig.width,
        height: canvasConfig.height,
        globalCompositeOperation: 'destination-in', // Use t-shirt shape as mask
        listening: false
      });
      tempLayer.add(canvasImageNode);
      
      // Add texture/detail overlay if needed
      const textureOverlay = new Konva.Image({
        image: canvasImage,
        x: 0,
        y: 0,
        width: canvasConfig.width,
        height: canvasConfig.height,
        opacity: 0.1, // Very subtle texture
        globalCompositeOperation: 'multiply',
        listening: false
      });
      tempLayer.add(textureOverlay);
    }
    
    // STEP 3: Create clipping group for design elements (THIS WAS MISSING!)
    const clippingGroup = new Konva.Group({
      clipFunc: (ctx) => {
        ctx.beginPath();
        ctx.rect(printableArea.x, printableArea.y, printableArea.width, printableArea.height);
        ctx.closePath();
      }
    });
    tempLayer.add(clippingGroup);
    
    // STEP 4: Add all visible design elements INSIDE the clipping group
    for (const element of visibleElements) {
      if (element.type === 'image' && element.image) {
        console.log(`🎯 CANVAS CAPTURE: Adding clipped image element ${element.id}`);
        
        const imageNode = new Konva.Image({
          image: element.image,
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          rotation: element.rotation || 0,
          scaleX: element.scaleX || 1,
          scaleY: element.scaleY || 1,
          opacity: element.opacity || 1,
          listening: false
        });
        clippingGroup.add(imageNode); // Add to clipping group instead of layer
        
      } else if (element.type === 'text') {
        console.log(`🎯 CANVAS CAPTURE: Adding clipped text element ${element.id}`);
        
        const textNode = new Konva.Text({
          text: element.text || 'Text',
          x: element.x,
          y: element.y,
          width: element.width,
          fontSize: element.fontSize || 20,
          fontFamily: element.fontFamily || 'Arial',
          fill: element.fill || '#000000',
          rotation: element.rotation || 0,
          scaleX: element.scaleX || 1,
          scaleY: element.scaleY || 1,
          opacity: element.opacity || 1,
          listening: false
        });
        clippingGroup.add(textNode); // Add to clipping group instead of layer
      }
    }
    
    // STEP 5: Add printable area boundary for manufacturer reference (AFTER clipped elements)
    const printableBorder = new Konva.Rect({
      x: printableArea.x,
      y: printableArea.y,
      width: printableArea.width,
      height: printableArea.height,
      stroke: '#FF0000',
      strokeWidth: 2,
      dash: [6, 4],
      listening: false
    });
    tempLayer.add(printableBorder); // Add to main layer (not clipped)
    
    // STEP 6: Force layer to draw and wait for completion
    tempLayer.draw();
    
    // Small delay to ensure rendering is complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // STEP 7: Export as high-quality PNG
    const dataURL = tempStage.toDataURL({
      mimeType: 'image/png',
      quality: 1.0,
      pixelRatio: 2
    });
    
    console.log(`🎯 CANVAS CAPTURE: Successfully captured ${areaId}`, {
      dataUrlLength: dataURL.length,
      hasBackground: !!canvasImage,
      clippedElements: visibleElements.length
    });
    
    // Cleanup
    tempStage.destroy();
    
    return dataURL;
    
  } catch (error) {
    console.error(`🎯 CANVAS CAPTURE: Error capturing area ${areaId}:`, error);
    return null;
  }
}, [getCanvasConfig, getPrintableAreaFromPhoto, designElements, activeColor, canvasImages]);


const generateCanvasMetadata = useCallback((areaId: string): CanvasImageMetadata => {
  const canvasConfig = getCanvasConfig(areaId, activeColor);
  const printableArea = getPrintableAreaFromPhoto(areaId, activeColor);
  const elements = designElements[areaId] || [];
  const visibleElements = elements.filter(element => element.visible !== false);
  
  const designElementsData = visibleElements.map((element, index) => {
    // Calculate inches from pixels
    const xInches = (element.x / canvasConfig.width) * canvasConfig.realWorldWidth;
    const yInches = (element.y / canvasConfig.height) * canvasConfig.realWorldHeight;
    const widthInches = (element.width / canvasConfig.width) * canvasConfig.realWorldWidth;
    const heightInches = (element.height / canvasConfig.height) * canvasConfig.realWorldHeight;
    
    const baseData = {
      element_id: element.id,
      element_index: index,
      type: element.type,
      position: {
        x: Math.round(element.x * 100) / 100,
        y: Math.round(element.y * 100) / 100,
        x_inches: Math.round(xInches * 1000) / 1000,
        y_inches: Math.round(yInches * 1000) / 1000
      },
      dimensions: {
        width_pixels: Math.round(element.width),
        height_pixels: Math.round(element.height),
        width_inches: Math.round(widthInches * 1000) / 1000,
        height_inches: Math.round(heightInches * 1000) / 1000
      },
      transformations: {
        rotation: element.rotation || 0,
        scale_x: element.scaleX || 1,
        scale_y: element.scaleY || 1,
        opacity: element.opacity || 1
      }
    };
    
    if (element.type === 'image') {
      const dpiInfo = calculateDPI(element);
      baseData.image_info = {
        original_name: element.imageName || 'Unknown',
        original_width: element.originalImageWidth || element.width,
        original_height: element.originalImageHeight || element.height,
        print_quality: dpiInfo.quality,
        print_dpi: dpiInfo.dpi
      };
    } else if (element.type === 'text') {
      baseData.text_info = {
        content: element.text || '',
        font_size: element.fontSize || 20,
        font_family: element.fontFamily || 'Arial',
        color: element.fill || '#000000'
      };
    }
    
    return baseData;
  });
  
  return {
    area_name: areaId,
    canvas_dimensions: {
      width_pixels: canvasConfig.width,
      height_pixels: canvasConfig.height,
      width_inches: canvasConfig.realWorldWidth,
      height_inches: canvasConfig.realWorldHeight
    },
    printable_area: {
      x: Math.round(printableArea.x * 100) / 100,
      y: Math.round(printableArea.y * 100) / 100,
      width: Math.round(printableArea.width * 100) / 100,
      height: Math.round(printableArea.height * 100) / 100
    },
    design_elements: designElementsData,
    canvas_settings: {
      active_color: activeColor,
      total_elements: elements.length,
      visible_elements: visibleElements.length
    }
  };
}, [getCanvasConfig, getPrintableAreaFromPhoto, calculateDPI, designElements, activeColor]);

const generateDetailedDescription = useCallback((areaId: string, metadata: CanvasImageMetadata): string => {
  const { canvas_dimensions, printable_area, design_elements, canvas_settings } = metadata;
  
  let description = `MANUFACTURING SPECIFICATIONS - ${areaId.toUpperCase()} AREA\n\n`;
  
  // Canvas specifications
  description += `CANVAS DIMENSIONS:\n`;
  description += `- Pixels: ${canvas_dimensions.width_pixels} x ${canvas_dimensions.height_pixels}\n`;
  description += `- Physical: ${canvas_dimensions.width_inches}" x ${canvas_dimensions.height_inches}"\n`;
  description += `- Color: ${canvas_settings.active_color}\n\n`;
  
  // Printable area
  description += `PRINTABLE AREA:\n`;
  description += `- Position: (${printable_area.x}, ${printable_area.y}) pixels\n`;
  description += `- Size: ${printable_area.width} x ${printable_area.height} pixels\n`;
  description += `- Physical: ${(printable_area.width/canvas_dimensions.width_pixels*canvas_dimensions.width_inches).toFixed(3)}" x ${(printable_area.height/canvas_dimensions.height_pixels*canvas_dimensions.height_inches).toFixed(3)}"\n\n`;
  
  // Design elements
  description += `DESIGN ELEMENTS (${design_elements.length} total):\n`;
  design_elements.forEach((element, index) => {
    description += `\n${index + 1}. ${element.type.toUpperCase()} - ID: ${element.element_id}\n`;
    description += `   Position: (${element.position.x_inches}", ${element.position.y_inches}")\n`;
    description += `   Size: ${element.dimensions.width_inches}" x ${element.dimensions.height_inches}"\n`;
    description += `   Pixels: ${element.dimensions.width_pixels} x ${element.dimensions.height_pixels}\n`;
    
    if (element.transformations.rotation !== 0) {
      description += `   Rotation: ${element.transformations.rotation}°\n`;
    }
    if (element.transformations.scale_x !== 1 || element.transformations.scale_y !== 1) {
      description += `   Scale: ${element.transformations.scale_x} x ${element.transformations.scale_y}\n`;
    }
    if (element.transformations.opacity !== 1) {
      description += `   Opacity: ${Math.round(element.transformations.opacity * 100)}%\n`;
    }
    
    if (element.image_info) {
      description += `   Original: ${element.image_info.original_width} x ${element.image_info.original_height} pixels\n`;
      description += `   Quality: ${element.image_info.print_quality} (${element.image_info.print_dpi} DPI)\n`;
      description += `   File: ${element.image_info.original_name}\n`;
    }
    
    if (element.text_info) {
      description += `   Text: "${element.text_info.content}"\n`;
      description += `   Font: ${element.text_info.font_family}, ${element.text_info.font_size}px\n`;
      description += `   Color: ${element.text_info.color}\n`;
    }
  });
  
  description += `\nMANUFACTURING NOTES:\n`;
  description += `- All measurements are precise for production setup\n`;
  description += `- Red dashed lines indicate printable boundaries\n`;
  description += `- High-resolution PNG for quality reference\n`;
  description += `- Generated: ${new Date().toISOString()}\n`;
  
  return description;
}, []);

const exportAllCanvasImages = useCallback(() => {
  const canvasImages: Array<{
    area_id: string;
    image_data: string;
    metadata: CanvasImageMetadata;
    description: string;
  }> = [];
  
  Object.keys(designElements).forEach(areaId => {
    const elements = designElements[areaId] || [];
    const visibleElements = elements.filter(element => element.visible !== false);
    
    if (visibleElements.length > 0) {
      try {
        const imageData = captureCanvasImageForArea(areaId);
        
        if (imageData) {
          const metadata = generateCanvasMetadata(areaId);
          const description = generateDetailedDescription(areaId, metadata);
          
          canvasImages.push({
            area_id: areaId,
            image_data: imageData,
            metadata: metadata,
            description: description
          });
        }
      } catch (error) {
        console.error(`Error exporting canvas image for area ${areaId}:`, error);
      }
    }
  });
  
  return canvasImages;
}, [designElements, captureCanvasImageForArea, generateCanvasMetadata, generateDetailedDescription]);


  // =====================================
  // ENHANCED STORE IMPORT FUNCTION
  // =====================================
  
  const transformStoreDataForCreate = useCallback((storeData: StoreImportData) => {
  
  // Extract mockup images based on PayloadCMS flags
  const mockupImages: Record<string, string> = {};
  const colorSpecificImages: Record<string, Array<{ mockupTitle: string; imageData: string }>> = {};
  
  // ðŸ”¥ CORRECTED: Extract PayloadCMS flags from the original product data to determine image sharing behavior
  const productDataFlags = {
    color_Images: productData.color_Images,
    size_Images: productData.size_Images
  };
  
  // Process mockup variants based on the size_Images flag
  storeData.mockup_variants.forEach(mockupVariant => {
    
    mockupVariant.color_combinations.forEach(colorCombo => {
      
      // Initialize color group if not exists
      if (!colorSpecificImages[colorCombo.color_hex]) {
        colorSpecificImages[colorCombo.color_hex] = [];
      }
      
      // ðŸ”¥ CORRECTED: Handle transformation based on size_Images flag
      if (!productDataFlags.size_Images) {
        
        const firstSizeVariant = colorCombo.size_variants[0];
        
        if (firstSizeVariant?.generated_images?.length > 0) {
          const generatedImage = firstSizeVariant.generated_images[0];
          
          // Create a unique key for this mockup-color combination
          const uniqueKey = `${mockupVariant.mockup_title}_${colorCombo.color_name}`.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
          
          // Store in general mockup images
          mockupImages[uniqueKey] = generatedImage.image_data;
          
          // Store in color-specific groups
          colorSpecificImages[colorCombo.color_hex].push({
            mockupTitle: mockupVariant.mockup_title,
            imageData: generatedImage.image_data
          });
          
          // Create size-specific keys that reference the same image for compatibility
          colorCombo.size_variants.forEach(sizeVariant => {
            const sizeSpecificKey = `${mockupVariant.mockup_title}_${colorCombo.color_name}_${sizeVariant.size_name}`.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            mockupImages[sizeSpecificKey] = generatedImage.image_data;
          });
          
        } else {
        }
        
      } else {
        
        colorCombo.size_variants.forEach(sizeVariant => {
          
          sizeVariant.generated_images.forEach((generatedImage, imgIndex) => {
            if (generatedImage.image_data) {
              const key = `${mockupVariant.mockup_title}_${colorCombo.color_name}_${sizeVariant.size_name}`;
              const cleanKey = key.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
              
              mockupImages[cleanKey] = generatedImage.image_data;
              
              colorSpecificImages[colorCombo.color_hex].push({
                mockupTitle: `${mockupVariant.mockup_title} (${sizeVariant.size_name})`,
                imageData: generatedImage.image_data
              });
            } else {
            }
          });
        });
      }
    });
  });
  
  Object.keys(colorSpecificImages).forEach(colorHex => {
  });
  
  // ðŸ”¥ CORRECTED: Validation based on size_Images flag
  const expectedUniqueCount = storeData.generation_summary.mockup_calculation.totalMockups;
  const actualUniqueCount = Object.keys(mockupImages).length;
  const designImages = storeData.design_images || []; // Use images from store data
  
  if (designImages.length === 0) {
  } else {
    designImages.forEach((img, index) => {
    });
  }
  
  if (!productDataFlags.size_Images) {
    // For size_Images=false, we should have mockup-color combinations with size aliases
    const uniqueMockupColorCombos = Object.keys(colorSpecificImages).reduce((total, colorHex) => {
      const uniqueTitles = new Set(colorSpecificImages[colorHex].map(item => 
        item.mockupTitle.replace(/ \([^)]+\)$/, '') // Remove size suffix if present
      ));
      return total + uniqueTitles.size;
    }, 0);
  } else {
    // For size_Images=true, we should have mockup-color-size combinations
    const totalVariants = Object.keys(colorSpecificImages).reduce((total, colorHex) => 
      total + colorSpecificImages[colorHex].length, 0);
  }

   const canvasImages = storeData.canvas_images || [];
  console.log('🎯 TRANSFORM DEBUG: Extracted canvas images:', canvasImages.length);
  console.log('🎯 TRANSFORM DEBUG: Canvas images data:', canvasImages);
  
  // Extract color details from the calculation breakdown
  const colorDetails = storeData.generation_summary.mockup_calculation.calculationBreakdown.map(breakdown => ({
    name: breakdown.color,
    value: breakdown.colorHex
  }));
  
  // Extract size options
  const sizeOptions = storeData.mockup_variants[0]?.color_combinations[0]?.size_variants.map(sizeVariant => 
    sizeVariant.size_name
  ) || selectedSizes.slice();
  
  // Create enhanced product data
  const enhancedProductData = {
    ...productData,
    cost: productData.cost || 200,
    brand: productData.brand || 'Junooni',
    materials: productData.materials || { primary: 'Cotton' },
    shippingInfo: productData.shippingInfo || { weight: 10 },
    physicalDimensions: productData.physicalDimensions || {
      widthInches: 8,
      heightInches: 10,
      depthInches: 0.5
    },
    vendorInfo: productData.vendorInfo || { countryOfOrigin: 'IN' },
    pricing: productData.pricing || { suggestedRetailPrice: 300 }
  };
  
  // âœ… ENHANCED: Clean design elements with base64 data
  const cleanDesignElements: Record<string, any[]> = {};
  let totalBase64Images = 0;
  let base64DataSize = 0;
  
  Object.keys(storeData.design_elements).forEach(area => {
    cleanDesignElements[area] = storeData.design_elements[area].map(element => {
      const cleanElement = {
        id: element.id,
        type: element.type,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation,
        scaleX: element.scaleX,
        scaleY: element.scaleY,
        draggable: element.draggable,
        selected: element.selected,
        zIndex: element.zIndex,
        imageName: element.imageName,
        imageUrl: element.imageUrl,
        imageBase64: element.imageBase64, // âœ… Include base64 in export
        originalImageWidth: element.originalImageWidth,
        originalImageHeight: element.originalImageHeight,
        text: element.text,
        fontSize: element.fontSize,
        fontFamily: element.fontFamily,
        fill: element.fill,
        opacity: element.opacity,
        layerName: element.layerName,
        visible: element.visible,
        locked: element.locked
      };
      
      // Track base64 data
      if (element.imageBase64) {
        totalBase64Images++;
        base64DataSize += element.imageBase64.length;
      }
      
      return cleanElement;
    });
  });
  
  // Create color-specific mockup groups
  const colorSpecificMockups: ColorSpecificMockupGroup[] = Object.keys(colorSpecificImages).map(colorHex => {
    const colorName = colorDetails.find(c => c.value === colorHex)?.name || 'Unknown';
    return {
      colorName,
      colorHex,
      mockups: [], // This will be populated by the Create page
      imageCount: colorSpecificImages[colorHex].length
    };
  });
  
  const designData: DesignData = {
    productInfo: {
      title: storeData.product_name || 'Custom Design Product',
      description: `Custom designed ${storeData.product_type} with ${storeData.design_configuration.design_metadata.total_elements} design elements`,
      sku: storeData.product_id || `custom-${Date.now()}`,
      brand: enhancedProductData.brand || 'Junooni'
    },
    options: [
      {
        title: 'Color',
        optionValues: colorDetails.map(c => c.name)
      },
      {
        title: 'Size', 
        optionValues: sizeOptions
      }
    ].filter(opt => opt.optionValues.length > 0),
    designElements: cleanDesignElements,
    designConfiguration: {
      ...storeData.design_configuration,
      payloadcms_flags: productDataFlags
    },
    colorDetails: colorDetails,
    printingTechnology: 'dtg',
    price: calculatePriceFromCost(enhancedProductData.cost),
    mockupData: {
      selectedMockup: allMockups[0] || null,
      allMockups: allMockups,
      mockupPreview: Object.values(mockupImages)[0] || null,
      mockupPreviews: mockupImages,
      colorSpecificMockups: colorSpecificMockups,
      designImages: designImages // 🔥 USE DESIGN IMAGES FROM STORE DATA
    },
    selectedProduct: {
      color: selectedColors[0]?.value || '#ffffff',
      colorName: selectedColors[0]?.name || 'White',
      productId: storeData.product_id,
      productName: storeData.product_name
    }
  };

 const result = {
    designData,
    mockupImages,
    colorSpecificImages,
    designImages: storeData.design_images || [],
    canvasImages, // 🔥 THIS WAS MISSING!
    enhancedProductData
  };

  console.log('🎯 TRANSFORM DEBUG: Final result canvasImages:', result.canvasImages?.length || 0);
  return result;
  
}, [selectedColors, selectedSizes, allMockups, productData]);


const restoreDesignElementsFromBase64 = useCallback(async (elementsData: Record<string, any[]>) => {

  
  const restoredElements: Record<string, DesignElement[]> = {};
  
  for (const [area, elements] of Object.entries(elementsData)) {
    restoredElements[area] = [];
    
    for (const elementData of elements) {
      try {
        if (elementData.type === 'image' && elementData.imageBase64) {
          
          // Create image from base64
          const img = await createImageFromBase64(elementData.imageBase64);
          
          const restoredElement: DesignElement = {
            ...elementData,
            image: img,
            imageUrl: elementData.imageBase64, // Use base64 as URL for restored images
          };
          
          restoredElements[area].push(restoredElement);
          
        } else {
          // Non-image elements (text, etc.)
          restoredElements[area].push(elementData);
        }
      } catch (error) {
        // Add element without image as fallback
        restoredElements[area].push({
          ...elementData,
          image: undefined,
          imageUrl: undefined
        });
      }
    }
  }

  return restoredElements;
}, []);


  const calculatePriceFromCost = (cost: number): number => {
    const markup = cost * 0.5;
    const baseProfit = 100;
    return Math.round(cost + markup + baseProfit);
  };

  const navigateToCreatePage = useCallback((transformedData: any) => {
  
  // ✅ VERIFY DESIGN IMAGES BEFORE NAVIGATION
  const designImagesCheck = {
    hasDesignImages: !!transformedData.designImages,
    designImagesCount: transformedData.designImages?.length || 0,
    designImagesArray: transformedData.designImages || []
  };

  // 🔥 ADD CANVAS IMAGES VERIFICATION
  const canvasImagesCheck = {
    hasCanvasImages: !!transformedData.canvasImages,
    canvasImagesCount: transformedData.canvasImages?.length || 0,
    canvasImagesArray: transformedData.canvasImages || []
  };
  
  console.log('🎯 NAVIGATE DEBUG: Canvas images check:', canvasImagesCheck);
  
  if (designImagesCheck.designImagesCount === 0) {
  } else {
    transformedData.designImages.forEach((img: any, index: number) => {
    });
  }
  
  setShowStoreImportModal(false);
  
  navigate({
    to: '/designer/create',
    state: {
      designData: transformedData.designData,
      mockupImages: transformedData.mockupImages,
      colorSpecificImages: transformedData.colorSpecificImages,
      enhancedProductData: transformedData.enhancedProductData,
      designImages: transformedData.designImages, // ✅ DESIGN IMAGES INCLUDED
      canvasImages: transformedData.canvasImages,
      uploadedFiles: [] // Can be empty since we have base64 data
    }
  });
  
}, [navigate]);

  const handleImportToStore = useCallback(async () => {
  if (!hasDesignElements) {
    alert('⚠️ Please add design elements before importing to store.');
    return;
  }

  if (selectedColors.length === 0 || selectedSizes.length === 0) {
    alert('⚠️ Please select colors and sizes before importing to store.');
    return;
  }

  if (!mockupCalculation) {
    alert('⚠️ Unable to calculate mockups. Please check your selections.');
    return;
  }

  try {
    setIsGeneratingForStore(true);
    setStoreImportData(null);
    setStoreGenerationProgress(null);
    setShowStoreImportModal(true);

    // 🔥 EXTRACT DESIGN IMAGES FIRST
    const designImages = extractDesignImages();
    // Add these lines before mockupGenerator.generateForStoreImport
    const canvasImages = exportAllCanvasImages();
    console.log(`🎯 CANVAS DEBUG: Captured ${canvasImages.length} canvas images`);
    console.log('🎯 CANVAS DEBUG: Canvas images data:', canvasImages);
    canvasImages.forEach((img, index) => {
      console.log(`🎯 CANVAS DEBUG: Image ${index + 1}:`, {
        area_id: img.area_id,
        has_image_data: !!img.image_data,
        image_data_length: img.image_data?.length || 0,
        metadata_areas: img.metadata?.area_name
      });
    });

    const importData = await mockupGenerator.generateForStoreImport(
      productData,
      selectedColors,
      selectedSizes,
      designElements,
      getAllCanvasConfigs,
      getAllPrintableAreas,
      mockupCalculation,
      setStoreGenerationProgress
    );

    importData.canvas_images = canvasImages;
    console.log('🎯 CANVAS DEBUG: Added canvas images to importData');
    console.log('🎯 CANVAS DEBUG: importData.canvas_images length:', importData.canvas_images?.length || 0);
    // 🔥 ADD DESIGN IMAGES TO IMPORT DATA
    importData.design_images = designImages; // Add design images to the import data

    setStoreImportData(importData);

    const transformedData = transformStoreDataForCreate(importData);
    navigateToCreatePage(transformedData);

  } catch (error) {
    alert(`❌ Store import generation failed: ${error.message}`);
  } finally {
    setIsGeneratingForStore(false);
  }
}, [
  hasDesignElements,
  selectedColors,
  selectedSizes,
  mockupCalculation,
  productData,
  designElements,
  getAllCanvasConfigs,
  getAllPrintableAreas,
  mockupGenerator,
  extractDesignImages, // Add this dependency
  transformStoreDataForCreate,
  navigateToCreatePage
]);

const renderUploadPanel = () => {
  const totalImages = Object.values(designElements).flat().filter(el => el.type === 'image').length;
  const imagesWithBase64 = Object.values(designElements).flat().filter(el => el.type === 'image' && el.imageBase64).length;
  const totalBase64Size = Object.values(designElements).flat()
    .filter(el => el.imageBase64)
    .reduce((total, el) => total + (el.imageBase64?.length || 0), 0);

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Upload Design Images</h3>
      
      {/* Enhanced storage info */}
      {totalImages > 0 && (
        <div className="p-3 rounded-lg bg-blue-50">
          <div className="mb-1 text-sm font-medium text-blue-800">
            ðŸ’¾ Storage Information
          </div>
          <div className="text-sm text-blue-700">
            Images with base64: <strong>{imagesWithBase64}/{totalImages}</strong>
          </div>
          <div className="text-sm text-blue-700">
            Storage size: <strong>{(totalBase64Size / 1024 / 1024).toFixed(2)} MB</strong>
          </div>
          {imagesWithBase64 === totalImages ? (
            <div className="mt-1 text-sm text-green-700">
              âœ… All images will be saved in JSON export
            </div>
          ) : (
            <div className="mt-1 text-sm text-orange-700">
              âš ï¸ Some images may not persist in export
            </div>
          )}
        </div>
      )}
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? 'border-orange-500 bg-orange-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p>Drop images here or click to upload</p>
          <p className="mt-1 text-sm">PNG, JPG, GIF up to 10MB</p>
          <p className="mt-1 text-xs text-green-600">âœ… Images will be stored as base64 in JSON</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 mt-4 text-white rounded hover:opacity-90"
          style={{ backgroundColor: brandColor }}
        >
          Choose Files
        </button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
      
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Files</h4>
          {uploadedFiles.map(file => (
            <div key={file.id} className="flex items-center p-2 space-x-2 text-sm rounded bg-gray-50">
              <img src={file.url} alt={file.name} className="object-cover w-8 h-8 rounded" />
              <span className="flex-1 truncate">{file.name}</span>
              <span className="text-gray-500">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
              {file.base64Data ? (
                <span className="text-xs text-green-600">âœ… Base64</span>
              ) : (
                <span className="text-xs text-orange-600">âš ï¸ No Base64</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
  
  // =====================================
  // FILE HANDLING
  // =====================================
  
const addImageToCanvasWithStateProtection = useCallback(async (imageSrc, imageName, targetArea, base64Data) => {
  const areaToUse = targetArea || activeArea;
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvasConfig = getCanvasConfig(areaToUse);
        const printableArea = getPrintableAreaFromPhoto(areaToUse, activeColor);
        
        // Calculate size
        const maxWidth = printableArea.width * 0.8;
        const maxHeight = printableArea.height * 0.8;
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        
        let width = maxWidth;
        let height = maxWidth / aspectRatio;
        if (height > maxHeight) {
          height = maxHeight;
          width = maxHeight * aspectRatio;
        }
        
        const centerX = printableArea.x + (printableArea.width - width) / 2;
        const centerY = printableArea.y + (printableArea.height - height) / 2;
        
        // ✅ CREATE ELEMENT WITH GUARANTEED BASE64
        const element = {
          id: `img-${Date.now()}-${Math.random()}`,
          type: 'image',
          x: centerX, y: centerY, width, height,
          rotation: 0, scaleX: 1, scaleY: 1,
          draggable: true, selected: false, zIndex: 1,
          image: img, imageName: imageName || 'Uploaded Image',
          imageUrl: imageSrc,
          imageBase64: base64Data, // ✅ STORE BASE64
          originalImageWidth: img.naturalWidth || img.width,
          originalImageHeight: img.naturalHeight || img.height,
          opacity: 1, visible: true, locked: false
        };
        
        
        // ✅ ATOMIC STATE UPDATE WITH PROPER MERGING
        setDesignElements(currentState => {
          
          // Ensure area exists
          const updatedState = { ...currentState };
          if (!updatedState[areaToUse]) {
            updatedState[areaToUse] = [];
          }
          
          // Calculate proper zIndex
          const existingElements = updatedState[areaToUse] || [];
          const maxZIndex = existingElements.reduce((max, el) => Math.max(max, el.zIndex || 0), 0);
          element.zIndex = maxZIndex + 1;
          
          // Add element to area
          updatedState[areaToUse] = [...existingElements, element];
          
          return updatedState;
        });
        
        resolve(true);
        
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      reject(error);
    };
    
    img.src = imageSrc;
  });
}, [activeArea, getCanvasConfig, getPrintableAreaFromPhoto, activeColor]);



  const handleFileUpload = useCallback(async (files) => {
  if (!files) return;
  
  for (const file of Array.from(files)) {
    try {
      
      // ✅ GUARANTEED base64 conversion
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target.result;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const blobUrl = URL.createObjectURL(file);
      
      // Store uploaded file
      setUploadedFiles(prev => [...prev, {
        id: `file-${Date.now()}`,
        file, url: blobUrl, base64Data,
        name: file.name, size: file.size, type: file.type,
        uploadProgress: 100, isUploading: false, targetArea: activeArea
      }]);
      
      // ✅ CRITICAL: Add to canvas with state protection
      const success = await addImageToCanvasWithStateProtection(blobUrl, file.name, activeArea, base64Data);
      
      if (success) {
        
        // ✅ IMMEDIATE STATE VERIFICATION
        setTimeout(() => {
          const currentImages = Object.values(designElements).flat().filter(el => el.type === 'image');
          if (currentImages.length === 0) {
          }
        }, 100);
      }
      
    } catch (error) {
    }
  }
}, [activeArea, designElements]);


  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // =====================================
  // COLOR AND SIZE MANAGEMENT
  // =====================================
  
  const handleColorChange = useCallback((colorHex: string, colorName: string) => {
    const isAlreadySelected = selectedColors.some(c => c.value === colorHex);
    
    if (isAlreadySelected) {
      if (selectedColors.length === 1) {
        return;
      }
      
      setSelectedColors(prev => prev.filter(c => c.value !== colorHex));
      
      if (activeColor === colorHex) {
        const newActiveColor = selectedColors.find(c => c.value !== colorHex);
        if (newActiveColor) {
          setActiveColor(newActiveColor.value);
        }
      }
    } else {
      setSelectedColors(prev => [...prev, { name: colorName, value: colorHex }]);
    }
  }, [selectedColors, activeColor]);
  
  const removeColor = useCallback((colorHex: string) => {
    if (selectedColors.length <= 1) {
      return;
    }
    
    setSelectedColors(prev => prev.filter(c => c.value !== colorHex));
    
    if (activeColor === colorHex) {
      const newActiveColor = selectedColors.find(c => c.value !== colorHex);
      if (newActiveColor) {
        setActiveColor(newActiveColor.value);
      }
    }
  }, [selectedColors, activeColor]);
  
  const toggleSizeSelection = useCallback((sizeName: string) => {
    const isSelected = selectedSizes.includes(sizeName);
    
    if (isSelected) {
      if (selectedSizes.length === 1) {
        return;
      }
      
      setSelectedSizes(prev => prev.filter(s => s !== sizeName));
    } else {
      setSelectedSizes(prev => [...prev, sizeName]);
    }
  }, [selectedSizes]);
  
  // =====================================
  // LAYER MANAGEMENT
  // =====================================
  
  const handleSelectLayer = useCallback((layerId: string) => {
    setSelectedId(layerId);
  }, []);
  
  const handleToggleVisibility = useCallback((layerId: string) => {
    setDesignElements(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(area => {
        updated[area] = updated[area].map(el => 
          el.id === layerId ? { ...el, visible: el.visible !== false ? false : true } : el
        );
      });
      return updated;
    });
    triggerUpdate();
  }, [triggerUpdate]);
  
  const handleToggleLock = useCallback((layerId: string) => {
    setDesignElements(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(area => {
        updated[area] = updated[area].map(el => 
          el.id === layerId ? { ...el, locked: !el.locked, draggable: !!el.locked } : el
        );
      });
      return updated;
    });
    triggerUpdate();
  }, [triggerUpdate]);
  
  const handleDeleteLayer = useCallback((layerId: string) => {
    setDesignElements(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(area => {
        updated[area] = updated[area].filter(el => el.id !== layerId);
      });
      return updated;
    });
    
    if (selectedId === layerId) {
      setSelectedId(null);
    }
  }, [selectedId]);
  
  const handleMoveLayer = useCallback((layerId: string, direction: 'up' | 'down') => {
    setDesignElements(prev => {
      const updated = { ...prev };
      
      Object.keys(updated).forEach(area => {
        const elements = [...updated[area]];
        const elementIndex = elements.findIndex(el => el.id === layerId);
        
        if (elementIndex === -1) return;
        
        if (direction === 'up' && elementIndex > 0) {
          const currentElement = elements[elementIndex];
          const targetElement = elements[elementIndex - 1];
          
          const tempZIndex = currentElement.zIndex;
          currentElement.zIndex = targetElement.zIndex;
          targetElement.zIndex = tempZIndex;
          
          elements.sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
        } else if (direction === 'down' && elementIndex < elements.length - 1) {
          const currentElement = elements[elementIndex];
          const targetElement = elements[elementIndex + 1];
          
          const tempZIndex = currentElement.zIndex;
          currentElement.zIndex = targetElement.zIndex;
          targetElement.zIndex = tempZIndex;
          
          elements.sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
        }
        
        updated[area] = elements;
      });
      
      return updated;
    });
    
    triggerUpdate();
  }, [triggerUpdate]);
  
  const handleDuplicateLayer = useCallback((layerId: string) => {
    setDesignElements(prev => {
      const updated = { ...prev };
      
      Object.keys(updated).forEach(area => {
        const elementToDuplicate = updated[area].find(el => el.id === layerId);
        if (elementToDuplicate) {
          const maxZIndex = updated[area].reduce((max, el) => Math.max(max, el.zIndex || 0), 0);
          
          const duplicatedElement: DesignElement = {
            ...elementToDuplicate,
            id: `${elementToDuplicate.type}-${Date.now()}-${Math.random()}`,
            x: elementToDuplicate.x + 20,
            y: elementToDuplicate.y + 20,
            zIndex: maxZIndex + 1,
            selected: false
          };
          
          updated[area] = [...updated[area], duplicatedElement];
          setSelectedId(duplicatedElement.id);
        }
      });
      
      return updated;
    });
    
    triggerUpdate();
  }, [triggerUpdate]);
  
  const deleteSelectedElement = useCallback(() => {
    if (!selectedId) return;
    handleDeleteLayer(selectedId);
  }, [selectedId, handleDeleteLayer]);
  
  const centerElement = useCallback((alignment: 'horizontal' | 'vertical' | 'both') => {
    if (!selectedId) return;
    
    const printableArea = getPrintableAreaFromPhoto(activeArea, activeColor);
    
    setDesignElements(prev => {
      const updated = { ...prev };
      if (updated[activeArea]) {
        updated[activeArea] = updated[activeArea].map(el => {
          if (el.id !== selectedId) return el;
          
          let newX = el.x;
          let newY = el.y;
          
          if (alignment === 'horizontal' || alignment === 'both') {
            newX = printableArea.x + (printableArea.width - el.width) / 2;
          }
          if (alignment === 'vertical' || alignment === 'both') {
            newY = printableArea.y + (printableArea.height - el.height) / 2;
          }
          
          return { ...el, x: newX, y: newY };
        });
      }
      return updated;
    });
    
    triggerUpdate();
  }, [selectedId, activeArea, activeColor, getPrintableAreaFromPhoto, triggerUpdate]);
  
  const handleStageClick = useCallback((e: any) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  }, []);
  
  // =====================================
  // PREVIEW RENDERING
  // =====================================
  
  const renderPreview = useCallback(() => {
    
    const surfaceConfig = getSurfaceConfiguration();
    
    if (allMockups.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <div className="mb-4 text-4xl">ðŸ“·</div>
            <p className="font-medium">No mockups available</p>
            {/* <p className="mt-2 text-sm">No mockups found in PayloadCMS</p> */}
          </div>
        </div>
      );
    }
    
    const canvasConfigs = getAllCanvasConfigs;
    const printableAreas = getAllPrintableAreas;
    
    return (
      <div className="flex h-full">
        {/* Enhanced Mockup Thumbnails */}
        <div className="w-64 p-4 bg-white border-r border-gray-200">
          {/* <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Mockup Variants</h3>
            <div className="text-xs text-gray-500">
              {selectedColors.length} color{selectedColors.length !== 1 ? 's' : ''}
            </div>
          </div> */}
          
          {/* Enhanced Color Display */}
          <div className="mb-4">
            {/* <div className="mb-2 text-xs font-medium text-gray-600">Selected Colors:</div>
            <div className="flex flex-wrap gap-1">
              {selectedColors.map(color => (
                <div 
                  key={color.value}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded"
                >
                   <div 
                    className="w-3 h-3 border border-gray-300 rounded-full"
                    style={{ backgroundColor: color.value }}
                  /> 
                 <span>{color.name}</span> 
                </div>
              ))}
              
            </div> */}
          </div>
          
          {/* Enhanced Calculation Display */}
          {/* {mockupCalculation && (
            <div className="p-2 mb-4 rounded bg-blue-50">
              <div className="mb-1 text-xs font-medium text-blue-800">ðŸ“Š Enhanced Calculation</div>
              <div className="text-xs text-blue-700">
                Strategy: {mockupCalculation.strategy.replace(/_/g, ' ')}
              </div>
              <div className="text-xs text-blue-700">
                Total: <strong>{mockupCalculation.totalMockups}</strong> unique mockups
              </div>
              <div className="mt-1 text-xs text-blue-600">
                {mockupCalculation.calculationBreakdown.map((item, index) => (
                  <div key={index}>
                    â€¢ {item.color}: {item.mockupsForColor} mockup{item.mockupsForColor !== 1 ? 's' : ''}
                  </div>
                ))}
              </div>
            </div>
          )} */}
          
          <div className="space-y-2 max-h-[calc(100vh-275px)] overflow-y-auto">
            {colorSpecificMockupGroups.length > 0 ? (
              colorSpecificMockupGroups.flatMap(group => 
              group.mockups.map((mockup, index) => {
                // 🔥 FIXED: Each thumbnail uses its group's specific color
                const mockupProductColor = getProductColorForMockup(
                  mockup, 
                  group.colorHex, // ✅ Use group's specific color for this thumbnail
                  productData
                );
                
                // Verify the color is correct
                if (mockupProductColor !== group.colorHex) {
                }
                
                return (
                  <ThumbnailPreview
                    key={`${group.colorHex}-${mockup.id}`}
                    mockup={mockup}
                    designElements={designElements}
                    canvasConfigs={canvasConfigs}
                    canvasPrintableAreas={printableAreas}
                    productColor={mockupProductColor} // ✅ This will now be the correct group color
                    isSelected={selectedHeroMockup?.id === mockup.id || (!selectedHeroMockup && index === 0)}
                    onSelect={() => setSelectedHeroMockup(mockup)}
                    productData={productData}
                  />
                );
              })
            )
            ) : (
              allMockups.slice(0, 5).map((mockup, index) => {
                // const mockupProductColor = getProductColorForMockup(mockup, activeColor, productData);
                const mockupProductColor = activeColor;
                
                return (
                  <ThumbnailPreview
                    key={mockup.id}
                    mockup={mockup}
                    designElements={designElements}
                    canvasConfigs={canvasConfigs}
                    canvasPrintableAreas={printableAreas}
                    productColor={mockupProductColor}
                    isSelected={selectedHeroMockup?.id === mockup.id || (!selectedHeroMockup && index === 0)}
                    onSelect={() => setSelectedHeroMockup(mockup)}
                    productData={productData}
                  />
                );
              })
            )}
            
            {allMockups.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <div className="mb-2 text-2xl">ðŸŽ¨</div>
                <p className="text-sm">No mockups available</p>
                {/* <p className="mt-1 text-xs">Check PayloadCMS configuration</p> */}
              </div>
            )}
          </div>
        </div>
        
        {/* Main Preview */}
        <div className="flex flex-col flex-1 p-4">
          {/* Enhanced Export Button Row */}
          {/* <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Enhanced calculation: {mockupCalculation?.totalMockups || 0} unique mockups for {selectedColors.length} color{selectedColors.length !== 1 ? 's' : ''} Ã— {selectedSizes.length} size{selectedSizes.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={handleImportToStore}
              disabled={!hasDesignElements || isGeneratingForStore || selectedColors.length === 0 || !mockupCalculation}
              className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: brandColor }}
            >
              {isGeneratingForStore ? (
                <>
                  <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
                  Generating Enhanced...
                </>
              ) : (
                <>
                  Generate & Import to Store (Enhanced)
                  {mockupCalculation && (
                    <span className="px-2 py-1 text-sm rounded bg-white/20">
                      {mockupCalculation.totalMockups * selectedSizes.length}
                    </span>
                  )}
                </>
              )}
            </button>
          </div> */}
          
          {/* Main Preview Content */}
          <div className="flex items-center justify-center flex-1">
          <div className="relative">
            <div className="w-[500px] h-[500px] relative bg-gray-50 rounded-lg overflow-hidden shadow-lg">
              {(() => {
                const heroMockup = selectedHeroMockup || allMockups[0];
                
                if (!heroMockup) {
                  return (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                      <div className="text-center">
                        <div className="mb-4 text-4xl">🎨</div>
                        <p className="font-medium">Select colors to see preview</p>
                        <p className="mt-2 text-sm">Choose colors from the design panel</p>
                      </div>
                    </div>
                  );
                }
                
                const heroProductColor = getProductColorForMockup(heroMockup, activeColor, productData);
                
        return (
                <div className="w-full h-full">
                  {/* ✅ CUSTOM MAIN PREVIEW - Using ThumbnailPreview logic but styled for main preview */}
                  <div 
                    className="w-full h-full p-0 transition-all cursor-default"
                    style={{ 
                      border: '3px solid',
                      borderColor: brandColor,
                      borderRadius: '8px'
                    }}
                  >
                    <div className="relative w-full h-full overflow-hidden rounded">
                      <ThumbnailPreview
                        mockup={heroMockup}
                        designElements={designElements}
                        canvasConfigs={canvasConfigs}
                        canvasPrintableAreas={printableAreas}
                        productColor={heroProductColor}
                        displayDimensions={{ width: 500, height: 500 }} // 🔥 HIGH RESOLUTION
                        isMainPreview={true}
                        isSelected={true} // Always selected for main preview
                        onSelect={() => {}} // No action needed for main preview
                        productData={productData}
                      />
                    </div>
                    
                    {/* Main preview info overlay */}
                    {/* <div className="absolute px-2 py-1 text-xs font-medium rounded shadow top-2 left-2 bg-white/90 backdrop-blur-sm">
                      Main Preview
                    </div> */}
                    
                    {/* Color info overlay */}
                    <div className="absolute px-2 py-1 text-xs text-white rounded bottom-2 left-2 bg-black/70 backdrop-blur-sm">
                      {selectedColors.find(c => c.value === activeColor)?.name || 'Active Color'}: {heroProductColor}
                    </div>
                    
                    {/* Engine info overlay */}
                    {/* <div className="absolute px-2 py-1 text-xs font-medium text-white rounded top-2 right-2 bg-green-500/90 backdrop-blur-sm">
                      Using Thumbnail Engine ✓
                    </div> */}
                  </div>
                </div>
              );
            })()}
          </div>
              
              {/* Enhanced mockup info panel */}
              {/* {(selectedHeroMockup || allMockups[0]) && (
                <div className="p-3 mt-4 text-xs bg-white border rounded-lg">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium">Surface:</span> {surfaceConfig.renderType}
                    </div>
                    <div>
                      <span className="font-medium">Engine:</span> auto
                    </div>
                    <div>
                      <span className="font-medium">Quality:</span> standard
                    </div>
                    <div>
                      <span className="font-medium">Strategy:</span> {mockupCalculation?.strategy.replace(/_/g, ' ') || 'calculating...'}
                    </div>
                    <div>
                      <span className="font-medium">Selected Color:</span> {activeColor}
                    </div>
                    <div>
                      <span className="font-medium">Mockup Color:</span> {(selectedHeroMockup || allMockups[0])?.photoColor}
                    </div>
                    <div>
                      <span className="font-medium">Expected Mockups:</span> {mockupCalculation?.totalMockups || 0}
                    </div>
                    <div>
                      <span className="font-medium">Total Images:</span> {(mockupCalculation?.totalMockups || 0) * selectedSizes.length}
                    </div>
                  </div>
                  
                  {(selectedHeroMockup || allMockups[0])?.visibleAreas?.[0]?.fabricIntegration && (
                    <div className="pt-2 mt-2 border-t">
                      <span className="font-medium">Fabric:</span> {(selectedHeroMockup || allMockups[0]).visibleAreas[0].fabricIntegration.bfabType}
                      {' | '}
                      <span className="font-medium">Intensity:</span> {(selectedHeroMockup || allMockups[0]).visibleAreas[0].fabricIntegration.textureIntensity}
                    </div>
                  )}
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    );
  }, [
    allMockups,
    selectedColors,
    selectedHeroMockup,
    designElements, 
    getAllCanvasConfigs, 
    getAllPrintableAreas, 
    productData,
    getSurfaceConfiguration,
    brandColor,
    selectedSizes.length,
    handleImportToStore,
    hasDesignElements,
    isGeneratingForStore,
    mockupCalculation,
    colorSpecificMockupGroups,
    activeColor,
    getProductColorForMockup
  ]);
  
  // =====================================
  // CANVAS RENDERING
  // =====================================
  
  const renderDesignElements = useCallback((areaId: string) => {
    const elements = designElements[areaId] || [];
    
    return elements
      .filter(element => element.visible !== false)
      .map(element => {
        const isSelected = selectedId === element.id;
        const isLocked = element.locked || false;
        
        if (element.type === 'image' && element.image) {
          return (
            <KonvaImage
              key={element.id}
              id={element.id}
              image={element.image}
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              rotation={element.rotation}
              scaleX={element.scaleX}
              scaleY={element.scaleY}
              draggable={element.draggable && !isLocked}
              opacity={element.opacity || 1}
              listening={!isLocked}
              onClick={() => !isLocked && setSelectedId(element.id)}
              onDragEnd={(e) => {
                if (isLocked) return;
                setDesignElements(prev => {
                  const updated = { ...prev };
                  if (updated[areaId]) {
                    updated[areaId] = updated[areaId].map(el =>
                      el.id === element.id ? { ...el, x: e.target.x(), y: e.target.y() } : el
                    );
                  }
                  return updated;
                });
              }}
              onTransformEnd={(e) => {
                if (isLocked) return;
                const node = e.target;
                
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                
                setDesignElements(prev => {
                  const updated = { ...prev };
                  if (updated[areaId]) {
                    updated[areaId] = updated[areaId].map(el =>
                      el.id === element.id ? {
                        ...el,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        width: Math.max(10, node.width() * scaleX),
                        height: Math.max(10, node.height() * scaleY),
                        scaleX: 1,
                        scaleY: 1,
                      } : el
                    );
                  }
                  return updated;
                });
                
                node.scaleX(1);
                node.scaleY(1);
              }}
            />
          );
        }
        
        if (element.type === 'text') {
          return (
            <KonvaText
              key={element.id}
              id={element.id}
              text={element.text || 'Text'}
              x={element.x}
              y={element.y}
              width={element.width}
              fontSize={element.fontSize || 20}
              fontFamily={element.fontFamily || 'Arial'}
              fill={element.fill || '#000000'}
              rotation={element.rotation}
              scaleX={element.scaleX}
              scaleY={element.scaleY}
              draggable={element.draggable && !isLocked}
              opacity={element.opacity || 1}
              listening={!isLocked}
              onClick={() => !isLocked && setSelectedId(element.id)}
              onDragEnd={(e) => {
                if (isLocked) return;
                setDesignElements(prev => {
                  const updated = { ...prev };
                  if (updated[areaId]) {
                    updated[areaId] = updated[areaId].map(el =>
                      el.id === element.id ? { ...el, x: e.target.x(), y: e.target.y() } : el
                    );
                  }
                  return updated;
                });
              }}
              onTransformEnd={(e) => {
                if (isLocked) return;
                const node = e.target;
                setDesignElements(prev => {
                  const updated = { ...prev };
                  if (updated[areaId]) {
                    updated[areaId] = updated[areaId].map(el =>
                      el.id === element.id ? {
                        ...el,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        scaleX: node.scaleX(),
                        scaleY: node.scaleY(),
                      } : el
                    );
                  }
                  return updated;
                });
              }}
            />
          );
        }
        
        return null;
      });
  }, [designElements, selectedId]);
  
  const renderCanvas = useCallback(() => {
    const canvasConfig = getCanvasConfig(activeArea, activeColor);
    const printableArea = getPrintableAreaFromPhoto(activeArea, activeColor);
    const canvasImage = canvasImages[`${activeArea}_${activeColor}`] || canvasImages[activeArea];
    const surfaceConfig = getSurfaceConfiguration();
    
    return (
      <div className="relative">
        <Stage
          ref={stageRef}
          width={canvasConfig.width}
          height={canvasConfig.height}
          onClick={handleStageClick}
          className="bg-white border border-gray-300 rounded-lg shadow-sm"
        >
          <Layer ref={layerRef}>
            <Rect
              x={0}
              y={0}
              width={canvasConfig.width}
              height={canvasConfig.height}
              fill={activeColor}
            />
            
            {canvasImage && (
              <KonvaImage
                image={canvasImage}
                x={0}
                y={0}
                width={canvasConfig.width}
                height={canvasConfig.height}
                globalCompositeOperation="destination-in"
                listening={false}
              />
            )}
            
            {canvasImage && (
              <KonvaImage
                image={canvasImage}
                x={0}
                y={0}
                width={canvasConfig.width}
                height={canvasConfig.height}
                opacity={surfaceConfig.renderType === 'leather' ? 0.12 : 0.08}
                globalCompositeOperation="multiply"
                listening={false}
              />
            )}
            
            <Rect
              x={printableArea.x}
              y={printableArea.y}
              width={printableArea.width}
              height={printableArea.height}
              stroke={brandColor}
              strokeWidth={2}
              dash={[6, 4]}
              listening={false}
            />
            
            <Group
              clipFunc={(ctx) => {
                ctx.beginPath();
                ctx.rect(printableArea.x, printableArea.y, printableArea.width, printableArea.height);
                ctx.closePath();
                ctx.clip();
              }}
            >
              {renderDesignElements(activeArea)}
            </Group>
            
            <Transformer
              ref={transformerRef}
              anchorStroke={brandColor}
              anchorFill="#FFFFFF"
              anchorSize={8}
              borderStroke={brandColor}
              borderDash={[4, 4]}
              rotateAnchorOffset={25}
              anchorDragBoundFunc={(oldPos, newPos) => {
                const dx = newPos.x - oldPos.x;
                const dy = newPos.y - oldPos.y;
                const maxDelta = 5;
                
                return {
                  x: oldPos.x + Math.max(-maxDelta, Math.min(maxDelta, dx)),
                  y: oldPos.y + Math.max(-maxDelta, Math.min(maxDelta, dy))
                };
              }}
              boundBoxFunc={(oldBox, newBox) => {
                const minWidth = 10;
                const minHeight = 10;
                
                if (newBox.width < minWidth || newBox.height < minHeight) {
                  return oldBox;
                }
                
                const maxRatio = 10;
                const ratio = newBox.width / newBox.height;
                if (ratio > maxRatio || ratio < 1/maxRatio) {
                  return oldBox;
                }
                
                return newBox;
              }}
              enabledAnchors={[
                'top-left', 'top-center', 'top-right',
                'middle-left', 'middle-right',
                'bottom-left', 'bottom-center', 'bottom-right',
              ]}
            />
          </Layer>
        </Stage>
        
        {selectedId && (
          <div className="absolute p-3 bg-white border border-gray-200 shadow-lg top-4 right-4 rounded-xl">
            <div className="space-y-3">
              <div>
                <div className="mb-2 text-xs font-medium text-gray-700">Alignment</div>
                <div className="grid grid-cols-3 gap-1">
                  <button 
                    onClick={() => centerElement('horizontal')}
                    className="p-2 text-gray-600 transition-colors rounded-md hover:bg-orange-50 hover:text-orange-600"
                    title="Center horizontally"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 17h8M12 3v18" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => centerElement('both')}
                    className="p-2 text-gray-600 transition-colors rounded-md hover:bg-orange-50 hover:text-orange-600"
                    title="Center both"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18M3 12h18" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => centerElement('vertical')}
                    className="p-2 text-gray-600 transition-colors rounded-md hover:bg-orange-50 hover:text-orange-600"
                    title="Center vertically"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8v8M17 8v8M3 12h18" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="mb-2 text-xs font-medium text-gray-700">Actions</div>
                <div className="flex space-x-1">
                  <button 
                    onClick={deleteSelectedElement}
                    className="p-2 text-red-600 transition-colors rounded-md hover:bg-red-50"
                    title="Delete element"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, [getCanvasConfig, getPrintableAreaFromPhoto, activeArea, activeColor, canvasImages, handleStageClick, brandColor, renderDesignElements, selectedId, centerElement, deleteSelectedElement, getSurfaceConfiguration]);
  
  // =====================================
  // SETTINGS PANELS
  // =====================================
  
  const renderSettingsPanel = () => {
    switch (activeTab) {
      case 'colors':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Enhanced Color Selection</h3>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              {productData?.colorOptions?.map((color: any) => (
                <button
                  key={color.colorHex}
                  onClick={() => handleColorChange(color.colorHex, color.colorName)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-105 flex items-center justify-center ${
                    selectedColors.some(c => c.value === color.colorHex)
                      ? 'border-orange-500 ring-2 ring-orange-200 scale-110' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.colorHex }}
                  title={color.colorName}
                >
                  {selectedColors.some(c => c.value === color.colorHex) && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
                         fill={color.colorHex === '#ffffff' ? 'black' : 'white'} width="16" height="16">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            
            {/* Enhanced calculation preview */}
            {/* {mockupCalculation && (
              <div className="p-3 rounded-lg bg-blue-50">
                <div className="mb-2 text-sm font-medium text-blue-800">
                   Enhanced Calculation Preview
                </div>
                <div className="text-sm text-blue-700">
                  Strategy: {mockupCalculation.strategy.replace(/_/g, ' ')}
                </div>
                <div className="text-sm text-blue-700">
                  Unique mockups: <strong>{mockupCalculation.totalMockups}</strong>
                </div>
                <div className="text-sm text-blue-700">
                  Total images: <strong>{mockupCalculation.totalMockups * selectedSizes.length}</strong>
                </div>
              </div>
            )} */}
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selected Colors</h4>
              {selectedColors.map(color => (
                <div key={color.value} className="flex items-center justify-between p-2 transition-colors rounded-md bg-gray-50 hover:bg-gray-100">
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 mr-3 border border-gray-200 rounded-full"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="font-medium">{color.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveColor(color.value)}
                      className={`p-1 rounded transition-colors ${activeColor === color.value 
                        ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:bg-gray-200'}`}
                      title="Set as active color"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    {selectedColors.length > 1 && (
                      <button 
                        onClick={() => removeColor(color.value)}
                        className="p-1 text-red-600 transition-colors rounded hover:bg-red-50"
                        title="Remove color"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'sizes':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Size Selection</h3>
            <div className="grid grid-cols-3 gap-2">
              {productData?.sizeOptions?.map((size: any) => (
                <button
                  key={size.sizeName}
                  onClick={() => toggleSizeSelection(size.sizeName)}
                  className={`px-3 py-2 text-sm border rounded ${
                    selectedSizes.includes(size.sizeName)
                      ? 'text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                  style={{
                    backgroundColor: selectedSizes.includes(size.sizeName) ? brandColor : '',
                    borderColor: selectedSizes.includes(size.sizeName) ? brandColor : ''
                  }}
                >
                  {size.sizeName}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Selected: {selectedSizes.join(', ') || 'None'}
            </div>
            
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Upload Design Images</h3>
            
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-gray-500">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p>Drop images here or click to upload</p>
                <p className="mt-1 text-sm">PNG, JPG, GIF up to 10MB</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 mt-4 text-white rounded hover:opacity-90"
                style={{ backgroundColor: brandColor }}
              >
                Choose Files
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Uploaded Files</h4>
                {uploadedFiles.map(file => (
                  <div key={file.id} className="flex items-center space-x-2 text-sm">
                    <img src={file.url} alt={file.name} className="object-cover w-8 h-8 rounded" />
                    <span className="flex-1 truncate">{file.name}</span>
                    <span className="text-gray-500">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'library':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Design Library</h3>
            <p className="text-sm text-gray-600">Browse pre-made designs and templates</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-center bg-gray-100 rounded-lg aspect-square">
                <span className="text-xs text-gray-400">Template 1</span>
              </div>
              <div className="flex items-center justify-center bg-gray-100 rounded-lg aspect-square">
                <span className="text-xs text-gray-400">Template 2</span>
              </div>
            </div>
          </div>
        );

      case 'layers':
        const layersInfo = getLayersInfo();
        return (
          <LayersPanel
            layers={layersInfo}
            selectedId={selectedId}
            onSelectLayer={handleSelectLayer}
            onToggleVisibility={handleToggleVisibility}
            onToggleLock={handleToggleLock}
            onDeleteLayer={handleDeleteLayer}
            onMoveLayer={handleMoveLayer}
            onDuplicateLayer={handleDuplicateLayer}
          />
        );

      default:
        return null;
    }
  };
  
  // =====================================
  // EFFECTS
  // =====================================
  useEffect(() => {
  designElementsRef.current = designElements;
}, [designElements]);

// ✅ ADD THIS: Periodic state validator
useEffect(() => {
  const validator = setInterval(() => {
    const stateImages = Object.values(designElements).flat().filter(el => el.type === 'image').length;
    const refImages = Object.values(designElementsRef.current).flat().filter(el => el.type === 'image').length;
    
    if (stateImages < refImages && refImages > 0) {
      setDesignElements({ ...designElementsRef.current });
    }
  }, 2000);
  
  return () => clearInterval(validator);
}, [designElements]);


  
  useEffect(() => {
    const transformer = transformerRef.current;
    const layer = layerRef.current;
    if (!transformer || !layer) return;

    if (selectedId) {
      const selectedNode = layer.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformer.nodes([selectedNode as Konva.Node]);
        transformer.getLayer()?.batchDraw();
        
        transformer.centeredScaling(false);
        transformer.flipEnabled(false);
        transformer.rotationSnapTolerance(5);
        transformer.anchorSize(8);
      } else {
        transformer.nodes([]);
      }
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedId, designElements, activeArea]);
  
  useEffect(() => {
  const loadCanvasImages = async () => {
    const area = getCustomizationAreaByName(activeArea);
    if (!area?.designCanvasPhotos?.length) {
      return;
    }
    
    try {
      const overlayNeeded = checkIfColorOverlayNeeded(activeArea, activeColor);
      setNeedsColorOverlay(prev => ({
        ...prev,
        [`${activeArea}_${activeColor}`]: overlayNeeded
      }));
      
      let photo = area.designCanvasPhotos.find((p: any) => 
        p?.photoColor?.toLowerCase() === activeColor?.toLowerCase()
      );
      
      if (!photo) {
        photo = area.designCanvasPhotos.find((p: any) => 
          p?.photoColor?.toLowerCase() === '#ffffff'
        );
      }
      
      if (!photo && area.designCanvasPhotos.length > 0) {
        photo = area.designCanvasPhotos[0];
      }
      
      if (!photo?.photo?.url) {
        return;
      }
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      const resolvedUrl = resolveImageUrl(photo.photo.url);
      
      img.onload = () => {
        const key = `${activeArea}_${activeColor}`;
        setCanvasImages(prev => ({ 
          ...prev, 
          [key]: img, 
          [activeArea]: img
        }));
        // ✅ REMOVED triggerUpdate() call
      };
      
      img.onerror = (error) => {
      };
      
      img.src = resolvedUrl;
    } catch (error) {
    }
  };
  
  loadCanvasImages();
}, [activeColor, activeTechnology, activeArea, getCustomizationAreaByName, checkIfColorOverlayNeeded]); // ✅ REMOVED triggerUpdate from deps
  
  useEffect(() => {
    const currentAreas = getAvailableAreas();
    if (!currentAreas.includes(activeArea) && currentAreas.length > 0) {
      setActiveArea(currentAreas[0]);
    }
  }, [activeTechnology, getAvailableAreas, activeArea]);
  
  useEffect(() => {
  // ✅ REMOVED triggerUpdate() call
  setSelectedId(null);
}, [activeArea]); // ✅ REMOVED triggerUpdate from deps
  
  useEffect(() => {
    if (activeView === 'preview') {
      setSelectedId(null);
    }
  }, [activeView]);
  
  // ✅ REPLACE THIS useEffect to prevent state reset
useEffect(() => {
  setDesignElements(prev => {
    const newElements = { ...prev };
    let hasChanges = false;
    
    availableAreas.forEach(area => {
      if (!newElements[area]) {
        newElements[area] = [];
        hasChanges = true;
      }
    });
    
    // Only return new object if there are actual changes
    return hasChanges ? newElements : prev;
  });
}, [availableAreas]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        deleteSelectedElement();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, deleteSelectedElement]);
  
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        URL.revokeObjectURL(file.url);
      });
    };
  }, []);
  
  if (!productData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-b-2 rounded-full animate-spin" style={{ borderColor: brandColor }}></div>
          <p className="mt-2 text-sm text-gray-600">Loading enhanced designer...</p>
        </div>
      </div>
    );
  }
  
  // =====================================
  // MAIN RENDER
  // =====================================
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      {/* Enhanced Top Header */}
      <div className="px-4 py-2 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-xl font-bold" style={{ color: brandColor }}>
              Junooni
            </div>
            {/* <div className="ml-2 text-sm text-gray-600">
              Enhanced Professional Designer
            </div> */}
            {/* {mockupCalculation && (
              <div className="px-3 py-1 ml-4 text-xs text-blue-800 bg-blue-100 rounded-full">
                {mockupCalculation.strategy.replace(/_/g, ' ')}: {mockupCalculation.totalMockups} unique mockups
              </div>
            )} */}
          </div>
          
          <button
            onClick={handleImportToStore}
            disabled={!hasDesignElements || isGeneratingForStore || !mockupCalculation}
            className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: brandColor }}
          >
            {isGeneratingForStore ? (
              <>
                <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
                Generating Mockups...
              </>
            ) : (
              <>
                Import to Store 
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Sidebar - Design Mode Only */}
        {activeView === 'design' && (
          <div className="flex flex-col w-1/4 bg-white border-r border-gray-200 shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div>
                {/* <h1 className="text-lg font-semibold text-gray-800">{productData.name}</h1>
                <p className="text-xs text-gray-500">Brand: {productData.brand}</p> */}
                
                <div className="flex items-center mt-2 text-xs" style={{ color: brandColor }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {selectedColors.find(c => c.value === activeColor)?.name || 'Active Color'}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {/* <div className="px-2 py-1 text-xs text-gray-500 text-orange-800 bg-orange-100 rounded-full">
                  {getSurfaceConfiguration().renderType.toUpperCase()}
                </div> */}
                {isGeneratingForStore && (
                  <div className="px-2 py-1 text-xs text-white bg-green-500 rounded-full animate-pulse">
                    GENERATING
                  </div>
                )}
                {/* {mockupCalculation && (
                  <div className="px-2 py-1 text-xs text-purple-800 bg-purple-100 rounded-full">
                    {mockupCalculation.totalMockups}M
                  </div>
                )} */}
              </div>
            </div>
            
            <div className="flex overflow-x-auto border-b border-gray-200">
              {(['colors', 'sizes', 'upload', 'library', 'layers'] as const).map(tab => (
                <button
                  key={tab}
                  className={`flex-1 py-4 px-2 text-sm font-medium capitalize transition-all whitespace-nowrap relative ${
                    activeTab === tab 
                      ? 'border-b-2 bg-orange-50' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ 
                    borderColor: activeTab === tab ? brandColor : '',
                    color: activeTab === tab ? brandColor : ''
                  }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                  {tab === 'layers' && (
                    <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-orange-500 rounded-full -top-0 -right-1">
                      {getLayersInfo().length}
                    </span>
                  )}
                  {tab === 'colors' && mockupCalculation && (
                    <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-orange-500 rounded-full -top-0 -right-1">
                      {selectedColors.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              {renderSettingsPanel()}
            </div>
            
            <div className="p-4 space-y-2 border-t border-gray-100">
              <div className="mb-2 text-xs text-gray-600">
                {/* <div className="flex justify-between">
                  <span>Layers: {getLayersInfo().length}</span>
                  <span>Files: {uploadedFiles.length}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Colors: {selectedColors.length}</span>
                  <span>Sizes: {selectedSizes.length}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Strategy: {mockupCalculation?.strategy.replace(/_/g, ' ') || 'calculating...'}</span>
                  <span>Unique: {mockupCalculation?.totalMockups || 0}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Total Images: {(mockupCalculation?.totalMockups || 0) * selectedSizes.length}</span>
                  <span className="font-medium" style={{ color: brandColor }}>
                    ENHANCED
                  </span>
                </div> */}
                {getLayersInfo().length > 0 && (
                  <div className="flex justify-between mt-1">
                    <span>Avg DPI: {Math.round(getLayersInfo().reduce((acc, layer) => acc + layer.dpi, 0) / getLayersInfo().length)}</span>
                    <span className={getLayersInfo().every(layer => layer.printQuality === 'Excellent') ? 'text-green-600' : 
                                   getLayersInfo().some(layer => layer.printQuality === 'Poor') ? 'text-red-600' : 'text-yellow-600'}>
                      Quality: {getLayersInfo().every(layer => layer.printQuality === 'Excellent') ? 'Excellent' : 
                               getLayersInfo().some(layer => layer.printQuality === 'Poor') ? 'Poor' : 'Good'}
                    </span>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={`flex flex-col ${activeView === 'design' ? 'w-3/4' : 'flex-1'}`}>
          <div className="flex items-center justify-between p-2 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              {activeView === 'design' && (
                <>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm font-medium">Technology:</span>
                    <select
                      value={activeTechnology}
                      onChange={(e) => setActiveTechnology(e.target.value)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2"
                      style={{ focusRingColor: brandColor, focusBorderColor: brandColor }}
                    >
                      {productData.printTechn?.map((tech: any) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.technologyName.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="mr-2 text-sm font-medium">Area:</span>
                    <div className="flex space-x-1">
                      {availableAreas.map(area => (
                        <button
                          key={area}
                          onClick={() => {
                            setActiveArea(area);
                          }}
                          className={`px-3 py-1 text-sm rounded capitalize transition-all ${
                            activeArea === area 
                              ? 'text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          style={{
                            backgroundColor: activeArea === area ? brandColor : '',
                          }}
                        >
                          {area}
                          {designElements[area]?.length > 0 && (
                            <span className="ml-1 text-xs opacity-75">
                              ({designElements[area].length})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {activeView === 'preview' && (
                <div className="flex items-center space-x-2">
                  {/* <h2 className="text-lg font-semibold">Enhanced Preview</h2> */}
                  {/* <div className="text-sm text-gray-600">
                    {Object.values(designElements).flat().length} design elements
                  </div> */}
                  {/* {mockupCalculation && (
                    <div className="px-3 py-1 text-sm text-green-800 bg-green-100 rounded-full">
                      {mockupCalculation.totalMockups} unique mockups
                    </div>
                  )} */}
                  {isGeneratingForStore && (
                    <div className="flex items-center text-sm text-green-600">
                      <div className="w-3 h-3 mr-2 border-b-2 border-green-600 rounded-full animate-spin"></div>
                      Generating enhanced data...
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setActiveView('design')}
                className={`px-2 py-1 text-sm font-small rounded-md transition-all ${
                  activeView === 'design'
                    ? 'text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
                style={{
                  backgroundColor: activeView === 'design' ? brandColor : 'transparent'
                }}
              >
                Design
              </button>
              <button
                onClick={() => setActiveView('preview')}
                className={`px-2 py-1 text-sm font-medium rounded-md transition-all ${
                  activeView === 'preview'
                    ? 'text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
                style={{
                  backgroundColor: activeView === 'preview' ? brandColor : 'transparent'
                }}
              >
                Preview
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-2 overflow-hidden">
            {activeView === 'design' ? (
              <div className="flex items-center justify-center h-full p-4 overflow-y-auto">
                {renderCanvas()}
              </div>
            ) : (
              renderPreview()
            )}
          </div>
        </div>
      </div>
      
      {/* Enhanced Store Import Modal */}
      <StoreImportModal
        isOpen={showStoreImportModal}
        onClose={() => setShowStoreImportModal(false)}
        importData={storeImportData}
        isGenerating={isGeneratingForStore}
        generationProgress={storeGenerationProgress}
        mockupCalculation={mockupCalculation}
      />
      
      {/* Enhanced Debug Panel */}
      {debugMode && (
        <div className="fixed z-50 max-w-md p-4 text-xs text-white rounded-lg bottom-4 left-4 bg-black/90">
          <div className="mb-2 font-medium">ðŸ”§ Enhanced Debug Information</div>
          <div className="space-y-1">
            <div>Product: {productData?.name}</div>
            <div>Type: {productData?.productType}</div>
            <div>Technology: {activeTechnology}</div>
            <div>Area: {activeArea}</div>
            <div>Elements: {designElements[activeArea]?.length || 0}</div>
            <div>Total Layers: {getLayersInfo().length}</div>
            <div>Selected: {selectedId || 'None'}</div>
            <div>Color: {activeColor}</div>
            <div>Surface: {getSurfaceConfiguration().renderType}</div>
            <div>Total Mockups: {allMockups.length}</div>
            <div>Selected Colors: {selectedColors.length}</div>
            <div>Selected Sizes: {selectedSizes.length}</div>
            <div>Store Generation: {isGeneratingForStore ? 'ACTIVE' : 'IDLE'}</div>
            
            {mockupCalculation && (
              <>
                <div className="pt-2 mt-2 border-t border-gray-600">Enhanced Calculation:</div>
                <div className="text-xs text-green-400">Strategy: {mockupCalculation.strategy}</div>
                <div className="text-xs text-green-400">Unique Mockups: {mockupCalculation.totalMockups}</div>
                <div className="text-xs text-green-400">Total Images: {mockupCalculation.totalMockups * selectedSizes.length}</div>
                <div className="text-xs text-green-400">Config: color_Images={productData.color_Images.toString()}, size_Images={productData.size_Images.toString()}</div>
              </>
            )}
            
            {storeGenerationProgress && (
              <>
                <div className="pt-2 mt-2 border-t border-gray-600">Generation Progress:</div>
                <div className="text-xs">Progress: {storeGenerationProgress.completed}/{storeGenerationProgress.total}</div>
                <div className="text-xs">Current: {storeGenerationProgress.current_combination}</div>
                <div className="text-xs">Engine: {storeGenerationProgress.current_engine}</div>
              </>
            )}
          </div>
          <button
            onClick={() => setDebugMode(false)}
            className="px-2 py-1 mt-2 text-xs bg-red-600 rounded"
          >
            Close Debug
          </button>
        </div>
      )}
      
      {/* Debug Mode Toggle */}
      <button
        onClick={() => setDebugMode(!debugMode)}
        className="fixed w-4 h-4 transition-opacity opacity-0 bottom-4 right-4 hover:opacity-100"
      >
      </button>
    </div>
  );
};

export default EnhancedCanvas;