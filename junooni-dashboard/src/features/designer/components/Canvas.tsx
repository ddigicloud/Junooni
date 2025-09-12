// src/components/Designer/Canvas.tsx - Complete Rewrite with Fixed Mockup Calculation
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import Konva from 'konva';
import JunooniLogo from "@/assets/junooni_logo_brand_color.png";
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
import { Palette, Ruler, Upload, FolderOpen, Layers, Package, PenTool, Eye, Menu, X, ChevronUp, ChevronDown } from 'lucide-react';
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
  imageBase64?: string; // ✨ Base64 for persistent storage
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
  alpMasks?: Array<{
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
  light?: Array<{
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
  render?: {
    pfEngine: 'auto' | 'canvas' | 'pixi';
    enableAdvancedEffects: boolean;
    quality: 'draft' | 'standard' | 'high' | 'ultra';
    exportRes: number;
    enableProgTrack: boolean;
  };
  area: Array<{
    id: string;
    areaName: string;
    visibility: 'full' | 'partial' | 'edge' | 'sleeve';
    visibilityPercentage?: number;
    design: {
      coordinateX: number;
      coordinateY: number;
      coordinateWidth: number;
      coordinateHeight: number;
      rotation: number;
      skewX: number;
      skewY: number;
      scaleX: number;
      scaleY: number;
      blend: string;
      opacity: number | null;
      preserveColors: boolean | null;
    };
    fbrc?: {
      enableFabricBlend: boolean;
      bfab: string;
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
    Config?: {
      enableMasking: boolean;
      maskTypes: string;
      maskPath?: string;
    };
    grdnmsk?: {
      grdn: string;
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
    fbrEft?: {
      enableFolds: boolean;
      foldIntensity: number;
      fold: string;
      seamDistrt: boolean;
      fabricDpth: number;
    };
  }>;
  fbrcProp?: {
    mfab: string;
    fabricWeight: number;
    Texture: string;
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
  base64Data?: string; // ✨ Base64 for persistent storage
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
  printT: Array<{
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
    designImages?: Array<{ // ✨ NEW: Include design images
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
// AREA SELECTION THUMBNAIL COMPONENT (INLINE)
// =====================================

interface AreaSelectionThumbnailProps {
  areaId: string;
  areaName: string;
  isActive: boolean;
  onSelect: (areaId: string) => void;
  canvasImage: HTMLImageElement | null;
  activeColor: string;
  elementCount: number;
}

// Replace the AreaSelectionThumbnail component with this fixed version:

const AreaSelectionThumbnail: React.FC<AreaSelectionThumbnailProps> = ({
  areaId,
  areaName,
  isActive,
  onSelect,
  canvasImage,
  activeColor,
  elementCount
}) => {
  const [isImageLoading, setIsImageLoading] = useState(!canvasImage);
  
  // 🔥 ADD: Update loading state when image changes
  useEffect(() => {
    setIsImageLoading(!canvasImage);
  }, [canvasImage]);

  return (
    <button
      onClick={() => onSelect(areaId)}
      className={`w-full p-2 sm:p-3 border rounded-lg transition-all touch-manipulation ${
        isActive
          ? 'border-orange-500 border-2 '
          : 'hover:border-gray-300 hover:shadow-sm border-[#F3F4F6]'
      }`}
    >
      <div className="relative mb-2 overflow-hidden bg-gray-100 rounded aspect-square">
        {canvasImage ? (
          <div className="relative w-full h-full">
            {/* 🔥 FIXED: Use CSS mask instead of background + multiply */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ 
                backgroundColor: activeColor,
                WebkitMask: `url(${canvasImage.src}) center/cover no-repeat`,
                mask: `url(${canvasImage.src}) center/cover no-repeat`,
                WebkitMaskComposite: 'source-in',
                maskComposite: 'intersect'
              }}
            />
            
            {/* Optional: Very subtle texture overlay for depth */}
            <img
              src={canvasImage.src}
              alt={areaName}
              className="absolute inset-0 object-cover w-full h-full opacity-5"
              style={{ mixBlendMode: 'multiply' }}
            />
            
            {elementCount > 0 && (
              <div className="absolute top-1 right-1">
                <div className="flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-orange-500 rounded-full sm:w-5 sm:h-5">
                  {elementCount}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            {/* 🔥 ADD: Show loading state */}
            {isImageLoading ? (
              <div className="text-center">
                <div className="w-3 h-3 mx-auto mb-1 border-b-2 border-gray-400 rounded-full sm:w-4 sm:h-4 animate-spin"></div>
                <span className="text-xs">Loading...</span>
              </div>
            ) : (
              <span className="text-xs">No Image</span>
            )}
          </div>
        )}
      </div>
      
      <p className="text-xs font-medium text-center sm:text-sm">{areaName}</p>
    </button>
  );
};

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
  const backendUrl = import.meta.env?.VITE_PAYLOAD_BASE_URL;
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

    if (!productData?.printT || !Array.isArray(productData.printT)) {
      return [];
    }

    const allMockups: DynamicMockupPhoto[] = [];

    productData.printT.forEach((tech: any) => {
      if (tech.mockupPhotos && Array.isArray(tech.mockupPhotos)) {
        tech.mockupPhotos.forEach((mockup: any) => {
          if (mockup?.photo?.url && mockup?.area?.length) {
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
  productData.printT?.forEach(tech => {
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

  // 🔥 CORRECTED: Determine strategy based on BOTH flags
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
    // 🔥 NEW: Sizes get unique images, but colors share them
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
    mockup.alpMasks?.length ||
    mockup.light?.length ||
    mockup.area?.some(area => 
      area.surfaceWrapSettings?.enableWrap ||
      area.perspectiveSettings?.enablePerspective ||
      area.fbrc?.enableFabricBlend ||
      area.Config?.enableMasking
    ) ||
    mockup.render?.enableAdvancedEffects
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
  // 🔥 FORCE CANVAS FOR T-SHIRTS - Add this check first
  if (this.productData?.productType?.toLowerCase().includes('shirt') || 
      this.productData?.productType?.toLowerCase().includes('tee') ||
      this.productData?.productType?.toLowerCase().includes('apparel')) {
    return 'canvas_professional';
  }

  if (mockup.render?.pfEngine) {
    switch (mockup.render.pfEngine) {
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
    mockup.alpMasks?.length ||
    mockup.light?.length ||
    mockup.area?.some(area => 
      area.surfaceWrapSettings?.enableWrap ||
      area.perspectiveSettings?.enablePerspective ||
      area.fbrc?.enableFabricBlend ||
      area.Config?.enableMasking
    ) ||
    mockup.render?.enableAdvancedEffects
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

  // 🔥 ENHANCED: Store import generation with proper color-specific grouping
  // 🔥 CORRECTED: Store import generation with proper size_Images handling
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
  
  // 🔥 CORRECTED: Calculate total combinations based on size_Images flag
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

        // 🔥 CORRECTED: Handle size generation based on size_Images flag from PayloadCMS
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
          // 🔥 size_Images = TRUE: Generate separate images for each size
          
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
      base64_images: totalBase64Images, // ✨ Track base64 images
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
    if (mockup.render?.pfEngine) {
      switch (mockup.render.pfEngine) {
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
      mockup.alpMasks?.length ||
      mockup.light?.length ||
      mockup.area?.some(area => 
        area.surfaceWrapSettings?.enableWrap ||
        area.perspectiveSettings?.enablePerspective ||
        area.fbrc?.enableFabricBlend ||
        area.Config?.enableMasking
      ) ||
      mockup.render?.enableAdvancedEffects
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
        className={`w-full p-2 border rounded-lg transition-all relative touch-manipulation ${
          isSelected
            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
      >
        <div className="relative mb-2 overflow-hidden bg-gray-100 rounded aspect-square">
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            <div className="text-center">
              <span className="text-xs">⚠ ️</span>
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
      className={`w-full p-2 border rounded-lg transition-all relative touch-manipulation ${
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
        {mockup.dispMaps?.length > 0 && <span className="text-xs" title="Displacement Maps">🎨</span>}
        {mockup.alpMasks?.length > 0 && <span className="text-xs" title="Alpha Masks">🎭</span>}
        {mockup.light?.length > 0 && <span className="text-xs" title="Lighting Effects">💡</span>}
      </div>
      
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex !== dropIndex) {
      const draggedLayer = layers[dragIndex];
      if (draggedLayer) {
        // Use the existing onMoveLayer function
        if (dragIndex > dropIndex) {
          // Moving up in list = moving layer to front
          for (let i = 0; i < dragIndex - dropIndex; i++) {
            onMoveLayer(draggedLayer.element.id, 'up');
          }
        } else {
          // Moving down in list = moving layer to back  
          for (let i = 0; i < dropIndex - dragIndex; i++) {
            onMoveLayer(draggedLayer.element.id, 'down');
          }
        }
      }
    }
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Layers</h3>
        <div className="text-xs text-gray-500">
          Total: {layers.length}
        </div>
      </div>
      
      <div className="p-2 mb-2 text-xs text-gray-600 rounded bg-orange-50">
        Drag to reorder • Top = Front
      </div>
      
      <div className="space-y-1 overflow-y-auto max-h-64 sm:max-h-80">
        {layers.map((layer, index) => (
          <div
            key={layer.element.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`group border rounded-lg p-2 sm:p-3 cursor-move transition-all hover:shadow-sm touch-manipulation ${
              selectedId === layer.element.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            } ${draggedIndex === index ? 'opacity-50' : ''}`}
            onClick={() => onSelectLayer(layer.element.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {/* Drag handle */}
                <div className="flex flex-col space-y-0.5 text-gray-400 group-hover:text-gray-600">
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                </div>
                
                <div className="flex-shrink-0 w-6 h-6 overflow-hidden bg-gray-100 border rounded sm:w-8 sm:h-8">
                  {layer.element.type === 'image' && layer.element.image ? (
                    <img
                      src={layer.element.imageUrl}
                      alt={layer.element.layerName}
                      className="object-cover w-full h-full"
                    />
                  ) : layer.element.type === 'text' ? (
                    <div className="flex items-center justify-center w-full h-full text-gray-600">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-200"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-900 truncate sm:text-sm">
                    {layer.element.layerName || layer.element.imageName || layer.element.text || `Layer ${index + 1}`}
                  </div>
                  <div className="text-xs text-gray-500 uppercase">
                    {layer.element.type} • Z:{layer.element.zIndex || 0}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 transition-opacity opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(layer.element.id);
                  }}
                  className={`p-1 rounded hover:bg-gray-200 touch-manipulation ${
                    layer.element.visible !== false ? 'text-gray-700' : 'text-gray-400'
                  }`}
                  title={layer.element.visible !== false ? 'Hide layer' : 'Show layer'}
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className={`p-1 rounded hover:bg-gray-200 touch-manipulation ${
                    layer.element.locked ? 'text-red-600' : 'text-gray-400'
                  }`}
                  title={layer.element.locked ? 'Unlock layer' : 'Lock layer'}
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {layer.element.locked ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    )}
                  </svg>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLayer(layer.element.id);
                  }}
                  className="p-1 text-red-600 rounded hover:bg-red-50 touch-manipulation"
                  title="Delete layer"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                  <div className="w-2 h-2 rounded-full sm:w-3 sm:h-3" style={{ backgroundColor: layer.printQualityColor.includes('green') ? '#10b981' : layer.printQualityColor.includes('yellow') ? '#f59e0b' : '#ef4444' }}></div>
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
          <div className="mb-2 text-2xl">📄</div>
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
    
    alert(`✨ Ready to import to store!\n\n` +
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
      if (e.target === e.currentTarget && !isGenerating) onClose();
    }}
  >
    <div
      className="bg-white rounded-lg shadow-xl w-full max-w-lg sm:max-w-3xl max-h-[90vh] overflow-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-lg font-semibold" style={{ color: brandColor }}>
          Store Import
        </h2>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Progress */}
        {isGenerating && generationProgress && (
          <div className="p-3 border rounded bg-orange-50">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-medium text-[#e65100]">Generating...</span>
              <span className="text-gray-600">
                {generationProgress.completed}/{generationProgress.total}
              </span>
            </div>
            <div className="w-full h-2 mb-2 bg-gray-200 rounded">
              <div
                className="h-2 rounded bg-[#e65100] transition-all"
                style={{
                  width: `${
                    (generationProgress.completed / generationProgress.total) * 100
                  }%`,
                }}
              ></div>
            </div>
            {generationProgress.estimated_time_remaining_ms && (
              <div className="text-xs text-gray-500">
                ETA: {Math.round(generationProgress.estimated_time_remaining_ms / 1000)}s
              </div>
            )}
          </div>
        )}

        {/* Completed */}
        {!isGenerating && importData && (
          <div className="space-y-4">
            <div className="p-3 border rounded bg-green-50 flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm text-green-700">
                {importData.generation_summary.total_images_generated} images generated in{" "}
                {Math.round(importData.generation_summary.total_time_ms / 1000)}s
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-sm">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xl font-bold" style={{ color: brandColor }}>
                  {importData.mockup_variants.length}
                </div>
                <div className="text-gray-600">Variants</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xl font-bold" style={{ color: brandColor }}>
                  {importData.generation_summary.total_images_generated}
                </div>
                <div className="text-gray-600">Images</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleImportToStore}
                className="flex-1 px-4 py-2 text-sm font-medium text-white rounded bg-[#e65100] hover:opacity-90"
              >
                Import
              </button>
              <button
                onClick={downloadImportData}
                className="px-4 py-2 text-sm font-medium text-white rounded bg-blue-600 hover:bg-blue-700"
              >
                Download
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white rounded bg-gray-600 hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Empty */}
        {!isGenerating && !importData && (
          <div className="py-6 text-center text-sm text-gray-600">
            <div className="mb-2 text-3xl">🎪</div>
            No import data yet. <br />
            <span className="text-gray-500">Generate & import to see results.</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

};

// =====================================
// MOBILE BOTTOM TAB BAR COMPONENT
// =====================================

interface MobileBottomTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedColors: Array<{ name: string; value: string }>;
  selectedSizes: string[];
  uploadedFiles: UploadedFile[];
  layersCount: number;
}

const MobileBottomTabBar: React.FC<MobileBottomTabBarProps> = ({
  activeTab,
  onTabChange,
  selectedColors,
  selectedSizes,
  uploadedFiles,
  layersCount
}) => {
  const tabs = [
    { id: 'product', icon: Package, label: 'Product', count: 1 },
    { id: 'colors', icon: Palette, label: 'Colors', count: selectedColors.length },
    { id: 'sizes', icon: Ruler, label: 'Sizes', count: selectedSizes.length },
    { id: 'upload', icon: Upload, label: 'Upload', count: uploadedFiles.length },
    { id: 'layers', icon: Layers, label: 'Layers', count: layersCount }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 sm:hidden">
      <div className="flex">
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-2 px-1 flex flex-col items-center justify-center transition-colors touch-manipulation ${
                activeTab === tab.id 
                  ? 'text-[#e65100] bg-orange-50' 
                  : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <IconComponent 
                  size={20}
                  strokeWidth={activeTab === tab.id ? 2.5 : 2}
                />
                
                {tab.count > 0 && tab.id !== 'product' && (
                  <span className="absolute flex items-center justify-center w-3 h-3 text-xs font-bold text-white bg-orange-500 rounded-full -top-1 -right-1">
                    {tab.count > 9 ? '9+' : tab.count}
                  </span>
                )}
              </div>
              
              <span className="mt-1 text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// =====================================
// MOBILE BOTTOM SHEET COMPONENT
// =====================================

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (startY === null || currentY === null) return;
    
    const deltaY = currentY - startY;
    if (deltaY > 100) { // Swipe down threshold
      onClose();
    }
    
    setStartY(null);
    setCurrentY(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl max-h-[80vh] flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className="flex items-center justify-center py-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 capitalize">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 touch-manipulation"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {children}
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
  const [activeTab, setActiveTab] = useState<'product' | 'colors' | 'sizes' | 'upload' | 'library' | 'layers'>('upload');
  const [debugMode, setDebugMode] = useState(false);
  const navigate = useNavigate();
  const designElementsRef = useRef<Record<string, DesignElement[]>>({});
  
  // Mobile specific state
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileBottomSheet, setShowMobileBottomSheet] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [activeTechnology, setActiveTechnology] = useState<string>(() => {
    return productData?.printT?.[0]?.id || productData?.printT?.[0]?.technologyName || 'dtg';
  });
  const [activeArea, setActiveArea] = useState<string>('front');
  
  const [availableAreasData, setAvailableAreasData] = useState<Array<{
    id: string;
    name: string; 
    displayName: string;
    canvasDim?: any;
    designCanvasPhotos?: any[];
    restrictions?: any;
  }>>([]);
  
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
  // MOBILE DETECTION
  // =====================================
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // =====================================
  // MEMOIZED CONFIGURATIONS
  // =====================================
  
  const allMockups = useMemo(() => extractAllMockupsFromPayload(productData), [productData]);
  const currentHero = useMemo(() => selectedHeroMockup || allMockups[0] || null, [selectedHeroMockup, allMockups]);
  const mockupGenerator = useMemo(() => new EnhancedMockupGenerator(), []);

  // 🔥 ENHANCED: Mockup calculation with proper color-specific logic
  const mockupCalculation = useMemo(() => {
    if (selectedColors.length === 0 || selectedSizes.length === 0) {
      return null;
    }
    return calculateTotalMockups(productData, selectedColors, selectedSizes);
  }, [productData, selectedColors, selectedSizes]);

  // 🔥 ENHANCED: Color-specific mockup groups
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
    return productData?.printT?.find((tech: any) => tech.id === activeTechnology || tech.technologyName === activeTechnology);
  }, [productData, activeTechnology]);
  
  const getAvailableAreas = useCallback(() => {
  try {
    const technology = getCurrentTechnology();
    if (!technology?.custAreas?.length) {
      return ['front'];
    }
    
    // Keep returning simple strings like before
    const areas = technology.custAreas
      .filter((area: any) => area?.areaName)
      .map((area: any) => area.areaName.toLowerCase());
    
    return areas.length > 0 ? areas : ['front'];
  } catch (error) {
    return ['front'];
  }
}, [getCurrentTechnology]);

const getAreaDisplayData = useCallback((areaId: string) => {
  try {
    const technology = getCurrentTechnology();
    const custArea = technology?.custAreas?.find(
      (area: any) => area.areaName.toLowerCase() === areaId.toLowerCase()
    );
    
    return {
      id: areaId,
      name: custArea?.areaName || areaId,
      displayName: custArea?.areaName || areaId.charAt(0).toUpperCase() + areaId.slice(1),
      canvasDim: custArea?.canvasDim,
      designCanvasPhotos: custArea?.designCanvasPhotos || [],
      restrictions: custArea?.restrictions
    };
  } catch (error) {
    return {
      id: areaId,
      name: areaId,
      displayName: areaId.charAt(0).toUpperCase() + areaId.slice(1),
      designCanvasPhotos: []
    };
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

  // Filter out hidden design elements for mockup rendering
const getVisibleDesignElements = useCallback((elements: Record<string, DesignElement[]>) => {
  const visibleElements: Record<string, DesignElement[]> = {};
  
  Object.keys(elements).forEach(area => {
    visibleElements[area] = (elements[area] || []).filter(element => element.visible !== false);
  });
  
  return visibleElements;
}, []);

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
  
  // 🔥 CORRECTED: Extract PayloadCMS flags from the original product data to determine image sharing behavior
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
      
      // 🔥 CORRECTED: Handle transformation based on size_Images flag
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
  
  // 🔥 CORRECTED: Validation based on size_Images flag
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
  
  // ✨ ENHANCED: Clean design elements with base64 data
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
        imageBase64: element.imageBase64, // ✨ Include base64 in export
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
      getVisibleDesignElements(designElements),
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
    <div className="space-y-4 sm:space-y-6">
      {/* Enhanced storage info */}
      {/* {totalImages > 0 && (
        <div className="p-3 border border-blue-100 sm:p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center mb-3">
            <div className="flex items-center justify-center w-6 h-6 mr-3 bg-blue-100 rounded-lg sm:w-8 sm:h-8">
              <svg className="w-3 h-3 text-blue-600 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 sm:text-base">Storage Information</h4>
              <p className="text-xs text-blue-600">{(totalBase64Size / 1024 / 1024).toFixed(2)} MB used</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 rounded-lg sm:p-3 bg-white/60">
              <div className="text-xs font-medium text-blue-600">IMAGES</div>
              <div className="text-lg font-bold text-blue-900">{imagesWithBase64}/{totalImages}</div>
              <div className="text-xs text-blue-600">with base64</div>
            </div>
            <div className="p-2 rounded-lg sm:p-3 bg-white/60">
              <div className="text-xs font-medium text-blue-600">STATUS</div>
              <div className={`text-lg font-bold ${imagesWithBase64 === totalImages ? 'text-green-600' : 'text-orange-600'}`}>
                {imagesWithBase64 === totalImages ? '✅' : '⚠️'}
              </div>
              <div className="text-xs text-blue-600">
                {imagesWithBase64 === totalImages ? 'All stored' : 'Partial storage'}
              </div>
            </div>
          </div>
        </div>
      )} */}
      
      {/* Enhanced upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${
          isDragging 
            ? 'border-orange-400 bg-orange-50 scale-102' 
            : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50/30'
        }`}
      >
        <div className="p-8 text-center sm:p-12">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all ${
            isDragging ? 'bg-orange-100' : 'bg-gray-100'
          }`}>
            <svg 
              className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors ${isDragging ? 'text-orange-600' : 'text-gray-400'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">
            {isDragging ? 'Drop your images here' : 'Upload design images'}
          </h3>
          <p className="mb-1 text-sm text-gray-600">
            Drag and drop your files or click to browse
          </p>
          <p className="mb-4 text-xs text-gray-500 sm:mb-6">
            Supports PNG, JPG, GIF up to 10MB each
          </p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-all transform rounded-lg sm:px-6 sm:py-3 hover:shadow-lg hover:scale-105 touch-manipulation"
            style={{ backgroundColor: brandColor }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Choose Files
          </button>
          
          {/* <div className="p-3 mt-4 border border-green-200 rounded-lg bg-green-50">
            <p className="text-xs font-medium text-green-700">
              All images are automatically converted to base64 for persistent storage
            </p>
          </div> */}
        </div>
        
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-orange-100/50 rounded-xl">
            <div className="p-4 bg-white rounded-lg shadow-lg sm:p-6">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2 text-orange-600 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg font-semibold text-orange-800">Drop to upload</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
      
      {/* Enhanced uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Recent Uploads</h4>
            <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="space-y-2">
            {uploadedFiles.map(file => {
              // Truncate long filenames
              const displayName = file.name.length > 25 
                ? `${file.name.substring(0, 20)}...${file.name.split('.').pop()}` 
                : file.name;
              
              return (
                <div key={file.id} className="flex items-center p-2 transition-colors bg-white border border-gray-200 rounded-lg sm:p-3 hover:border-gray-300">
                  <div className="relative flex-shrink-0 mr-3">
                    <img 
                      src={file.url} 
                      alt={file.name} 
                      className="object-cover w-10 h-10 border border-gray-200 rounded-lg sm:w-12 sm:h-12" 
                    />
                    <div className="absolute -top-1 -right-1">
                      {file.base64Data ? (
                        <div className="flex items-center justify-center w-3 h-3 bg-green-500 rounded-full sm:w-4 sm:h-4">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-3 h-3 bg-orange-500 rounded-full sm:w-4 sm:h-4">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p 
                      className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600" 
                      title={file.name}
                    >
                      {displayName}
                    </p>
                    <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                      <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                      <span>•</span>
                      <span className={file.base64Data ? 'text-green-600' : 'text-orange-600'}>
                        {file.base64Data ? 'Base64 stored' : 'Not stored'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-2">
                    <div className={`w-2 h-2 rounded-full ${file.base64Data ? 'bg-green-500' : 'bg-orange-500'}`} />
                  </div>
                </div>
              );
            })}
          </div>
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
      
      const currentElement = elements[elementIndex];
      
      if (direction === 'up') {
        // Move layer up in z-index (to front)
        const maxZIndex = Math.max(...elements.map(el => el.zIndex || 0));
        currentElement.zIndex = maxZIndex + 1;
      } else {
        // Move layer down in z-index (to back)
        const minZIndex = Math.min(...elements.map(el => el.zIndex || 0));
        currentElement.zIndex = Math.max(0, minZIndex - 1);
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
            <div className="mb-4 text-4xl">🖼️</div>
            <p className="font-medium">No mockups available</p>
          </div>
        </div>
      );
    }
    
    const canvasConfigs = getAllCanvasConfigs;
    const printableAreas = getAllPrintableAreas;
    
    return (
      <div className="flex h-full">
        {/* Enhanced Mockup Thumbnails - Hidden on Mobile */}
        <div className="hidden w-64 p-4 bg-white border-r border-gray-200 sm:block">
          
          <div className="space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
            {colorSpecificMockupGroups.length > 0 ? (
              colorSpecificMockupGroups.flatMap(group => 
              group.mockups.map((mockup, index) => {
               
                const thumbnailProductColor = group.colorHex;
                
                return (
                  <ThumbnailPreview
                    key={`${group.colorHex}-${mockup.id}`}
                    mockup={mockup}
                   designElements={getVisibleDesignElements(designElements)} 
                    canvasConfigs={canvasConfigs}
                    canvasPrintableAreas={printableAreas}
                    productColor={thumbnailProductColor} // ✅ This will now be the correct group color
                    isSelected={selectedHeroMockup?.id === mockup.id || (!selectedHeroMockup && index === 0)}
                    onSelect={() => {
                      console.log('Manual mockup selection:', mockup.title, mockup.photoColor);
                      setSelectedHeroMockup(mockup); // Allow manual selection
                    }}
                    productData={productData}
                  />
                );
              })
            )
            ) : (
              allMockups.slice(0, 5).map((mockup, index) => {
                const mockupProductColor = activeColor;
                
                return (
                  <ThumbnailPreview
                    key={mockup.id}
                    mockup={mockup}
                   designElements={getVisibleDesignElements(designElements)} 
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
                <div className="mb-2 text-2xl">🎨</div>
                <p className="text-sm">No mockups available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Preview */}
        <div className="flex flex-col flex-1 p-2 overflow-y-auto sm:p-4">
          
          {/* Main Preview Content */}
          <div className="flex items-center justify-center flex-1">
          <div className="relative">
            <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] relative bg-gray-50 rounded-lg overflow-hidden shadow-lg">
              {(() => {
                const heroMockup = selectedHeroMockup || allMockups[0];

                // For the main preview, use the active color if mockup is neutral, otherwise use mockup's color
                const heroProductColor = (() => {
                  if (!heroMockup) return activeColor;
                  
                  const mockupColor = heroMockup.photoColor?.toLowerCase() || '';
                  const neutralColors = ['#ffffff', '#f5f5f5', '#fafafa', 'white'];
                  
                  // If mockup is neutral, use active color
                  if (neutralColors.includes(mockupColor)) {
                    return activeColor;
                  }
                  
                  // If mockup has specific color, use that
                  return heroMockup.photoColor || activeColor;
                })();

              console.log("mockup selected color:",heroMockup);
                
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
                
        return (
                <div className="w-full h-full">
                  {/* ✅ CUSTOM MAIN PREVIEW - Using ThumbnailPreview logic but styled for main preview */}
                  <div 
                    className="w-full h-full p-0 transition-all cursor-default"
                  >
                    <div className="relative w-full h-full overflow-hidden rounded">
                      <ThumbnailPreview
                        mockup={heroMockup}
                        designElements={getVisibleDesignElements(designElements)}  
                        canvasConfigs={canvasConfigs}
                        canvasPrintableAreas={printableAreas}
                        productColor={heroProductColor}
                        displayDimensions={{ width: 400, height: 400 }} // 🔥 HIGH RESOLUTION
                        isMainPreview={true}
                        isSelected={true} // Always selected for main preview
                        onSelect={() => {}} // No action needed for main preview
                        productData={productData}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
              
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
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
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
    
    // Mobile responsive dimensions
    const baseWidth = canvasConfig.width;
    const baseHeight = canvasConfig.height;
    const maxWidth = isMobile ? window.innerWidth - 40 : baseWidth;
    const maxHeight = isMobile ? window.innerHeight * 0.6 : baseHeight;
    
    const scale = Math.min(maxWidth / baseWidth, maxHeight / baseHeight, 1);
    const displayWidth = baseWidth * scale;
    const displayHeight = baseHeight * scale;
    
    return (
      <div className="relative">
        <Stage
          ref={stageRef}
          width={displayWidth}
          height={displayHeight}
          scaleX={scale}
          scaleY={scale}
          onClick={handleStageClick}
          className="bg-white border border-gray-300 rounded-lg shadow-sm touch-manipulation"
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
              anchorSize={isMobile ? 12 : 8}
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
        
        {/* Mobile-friendly element controls */}
        {selectedId && (
          <div className={`absolute ${isMobile ? 'bottom-4 left-4 right-4' : 'top-4 right-4'} p-3 bg-white border border-gray-200 shadow-lg rounded-xl`}>
            <div className="space-y-3">
              <div>
                <div className="mb-2 text-xs font-medium text-gray-700">Alignment</div>
                <div className={`grid ${isMobile ? 'grid-cols-6' : 'grid-cols-3'} gap-1`}>
                  <button 
                    onClick={() => centerElement('horizontal')}
                    className="p-2 text-gray-600 transition-colors rounded-md hover:bg-orange-50 hover:text-orange-600 touch-manipulation"
                    title="Center horizontally"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 17h8M12 3v18" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => centerElement('both')}
                    className="p-2 text-gray-600 transition-colors rounded-md hover:bg-orange-50 hover:text-orange-600 touch-manipulation"
                    title="Center both"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18M3 12h18" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => centerElement('vertical')}
                    className="p-2 text-gray-600 transition-colors rounded-md hover:bg-orange-50 hover:text-orange-600 touch-manipulation"
                    title="Center vertically"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8v8M17 8v8M3 12h18" />
                    </svg>
                  </button>
                  
                  {isMobile && (
                    <>
                      <div className="mx-1 border-l border-gray-200"></div>
                      <button 
                        onClick={deleteSelectedElement}
                        className="p-2 text-red-600 transition-colors rounded-md hover:bg-red-50 touch-manipulation"
                        title="Delete element"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setSelectedId(null)}
                        className="p-2 text-gray-600 transition-colors rounded-md hover:bg-gray-50 touch-manipulation"
                        title="Deselect"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {!isMobile && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="mb-2 text-xs font-medium text-gray-700">Actions</div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={deleteSelectedElement}
                      className="p-2 text-red-600 transition-colors rounded-md hover:bg-red-50 touch-manipulation"
                      title="Delete element"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }, [getCanvasConfig, getPrintableAreaFromPhoto, activeArea, activeColor, canvasImages, handleStageClick, brandColor, renderDesignElements, selectedId, centerElement, deleteSelectedElement, getSurfaceConfiguration, isMobile]);
    
    // =====================================
    // SETTINGS PANELS
    // =====================================
    
    const renderSettingsPanel = () => {
      switch (activeTab) {
      case 'product':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{productData?.name || 'Unnamed Product'}</h3>
            
            {/* Product Basic Info */}
            <div className="p-1 rounded-l">
              <div className="space-y-2">
                
                <div>
                  <label className="text-xs font-medium tracking-wider text-black uppercase">Product Type</label>
                  <p className="mt-1 text-sm text-black capitalize">{productData?.productType || 'Unknown'}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium tracking-wider text-black uppercase">Brand</label>
                  <p className="mt-1 text-sm text-black">{productData?.brand || 'Junooni'}</p>
                </div>
              </div>
            </div>

            {/* Technology Information */}
            <div className="p-2 rounded-lg ">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium tracking-wider text-gray-500 uppercase">Current Technology</label>
                  <span className="px-2 py-1 text-xs font-medium text-white rounded" style={{ backgroundColor: brandColor }}>
                    Active
                  </span>
                </div>
                
                <div className="p-0 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <select
                      value={activeTechnology}
                      onChange={(e) => setActiveTechnology(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 touch-manipulation"
                    >
                      {productData?.printT?.map((tech: any) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.technologyName.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>       
                </div>
              </div>
            </div>
          </div>
        );

        case 'colors':
          return (
            <div className="space-y-4">
              <h3 className="font-medium">Enhanced Color Selection</h3>
              
              <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-4'} gap-2 mb-4`}>
                {productData?.colorOptions?.map((color: any) => (
                  <button
                    key={color.colorHex}
                    onClick={() => handleColorChange(color.colorHex, color.colorName)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 transition-all hover:scale-105 flex items-center justify-center touch-manipulation ${
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
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Selected Colors</h4>
                {selectedColors.map(color => (
                  <div key={color.value} className="flex items-center justify-between p-2 transition-colors rounded-md bg-gray-50 hover:bg-gray-100">
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 mr-3 border border-gray-200 rounded-full sm:w-8 sm:h-8"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-sm font-medium">{color.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setActiveColor(color.value)}
                        className={`p-1 rounded transition-colors touch-manipulation ${activeColor === color.value 
                          ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-200'}`}
                        title="Set as active color"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      {selectedColors.length > 1 && (
                        <button 
                          onClick={() => removeColor(color.value)}
                          className="p-1 text-red-600 transition-colors rounded hover:bg-red-50 touch-manipulation"
                          title="Remove color"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
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
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                {productData?.sizeOptions?.map((size: any) => (
                  <button
                    key={size.sizeName}
                    onClick={() => toggleSizeSelection(size.sizeName)}
                    className={`px-3 py-2 text-sm border rounded touch-manipulation ${
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
          return renderUploadPanel();

        case 'library':
          return (
            <div className="space-y-4">
              <h3 className="font-medium">Design Library</h3>
              <p className="text-sm text-gray-600">Browse pre-made designs and templates</p>
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
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

  // Auto-select hero mockup based on active color
  useEffect(() => {
    if (allMockups.length > 0) {
      // Find mockup that matches active color
      let bestMockup = allMockups.find(mockup => {
        const mockupColor = mockup.photoColor?.toLowerCase() || '';
        return mockupColor === activeColor?.toLowerCase();
      });
      
      // Fallback to neutral mockup
      if (!bestMockup) {
        const neutralColors = ['#ffffff', '#f5f5f5', '#fafafa', 'white'];
        bestMockup = allMockups.find(mockup => {
          const mockupColor = mockup.photoColor?.toLowerCase() || '';
          return neutralColors.includes(mockupColor);
        });
      }
      
      // Use dynamic neutral detector as last resort
      if (!bestMockup) {
        const neutralDetector = createDynamicNeutralDetector(productData);
        bestMockup = allMockups.find(mockup => {
          const mockupColor = mockup.photoColor || '';
          return neutralDetector.isNeutral(mockupColor);
        });
      }
      
      // Auto-select the best mockup for active color
      if (bestMockup) {
        console.log('Auto-selecting mockup for active color:', activeColor, '-> mockup:', bestMockup.photoColor);
        setSelectedHeroMockup(bestMockup);
      }
    }
  }, [activeColor, allMockups, productData]); // This will re-run when activeColor changes
    
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
          transformer.anchorSize(isMobile ? 12 : 8);
        } else {
          transformer.nodes([]);
        }
      } else {
        transformer.nodes([]);
        transformer.getLayer()?.batchDraw();
      }
    }, [selectedId, designElements, activeArea, isMobile]);
    
    // 🔥 FIX: Load canvas images for ALL areas, not just the active one
  useEffect(() => {
    const loadAllAreaImages = async () => {
      const technology = getCurrentTechnology();
      if (!technology?.custAreas?.length) return;
      
      // Load images for ALL available areas
      for (const area of availableAreas) {
        try {
          const custArea = getCustomizationAreaByName(area);
          if (!custArea?.designCanvasPhotos?.length) {
            console.log(`No designCanvasPhotos for area: ${area}`);
            continue;
          }
          
          // Find the best photo for this area
          let photo = custArea.designCanvasPhotos.find((p: any) => 
            p?.photoColor?.toLowerCase() === activeColor?.toLowerCase()
          );
          
          if (!photo) {
            photo = custArea.designCanvasPhotos.find((p: any) => 
              p?.photoColor?.toLowerCase() === '#ffffff'
            );
          }
          
          if (!photo && custArea.designCanvasPhotos.length > 0) {
            photo = custArea.designCanvasPhotos[0];
          }
          
          if (!photo?.photo?.url) continue;
          
          const img = new Image();
          img.crossOrigin = "anonymous";
          const resolvedUrl = resolveImageUrl(photo.photo.url);
          
          // Use Promise to handle async loading
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              const key = `${area}_${activeColor}`;
              setCanvasImages(prev => ({ 
                ...prev, 
                [key]: img, 
                [area]: img
              }));
              console.log(`Preloaded image for area: ${area}`);
              resolve();
            };
            
            img.onerror = (error) => {
              console.error(`Failed to preload image for area: ${area}`, error);
              reject(error);
            };
            
            img.src = resolvedUrl;
          });
        } catch (error) {
          console.error(`Error preloading image for area: ${area}:`, error);
        }
      }
    };
    
    loadAllAreaImages();
  }, [activeColor, activeTechnology, availableAreas, getCurrentTechnology, getCustomizationAreaByName]);

  // 🔥 ADD: Separate effect for active area changes
  useEffect(() => {
    const loadActiveAreaImage = async () => {
      const area = getCustomizationAreaByName(activeArea);
      if (!area?.designCanvasPhotos?.length) return;
      
      // Check if image is already loaded
      const existingImage = canvasImages[`${activeArea}_${activeColor}`] || canvasImages[activeArea];
      if (existingImage) {
        console.log(`Image already loaded for active area: ${activeArea}`);
        return;
      }
      
      // Load image for active area if not already loaded
      try {
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
        
        if (!photo?.photo?.url) return;
        
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
          console.log(`Loaded image for active area: ${activeArea}`);
        };
        
        img.onerror = (error) => {
          console.error(`Failed to load image for active area: ${activeArea}`, error);
        };
        
        img.src = resolvedUrl;
      } catch (error) {
        console.error(`Error loading active area image: ${activeArea}:`, error);
      }
    };
    
    loadActiveAreaImage();
  }, [activeArea]);
    
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
    
  // 🔥 ADD: Initialize canvas images on component mount
  useEffect(() => {
    console.log('Component mounted, initializing canvas images...');
    
    // Trigger initial load of all area images
    setForceUpdate(prev => prev + 1);
  }, []); // Empty dependency array - only run on mount

  useEffect(() => {
    const areas = getAvailableAreas();
    setAvailableAreasData(areas);
    
    // Set first area as active if current active area doesn't exist
    if (!areas.find(a => a.id === activeArea) && areas.length > 0) {
      setActiveArea(areas[0].id);
    }
  }, [activeTechnology, getAvailableAreas]);

    useEffect(() => {
      return () => {
        uploadedFiles.forEach(file => {
          URL.revokeObjectURL(file.url);
        });
      };
    }, []);
    
    // Mobile bottom sheet handlers
    const handleMobileTabChange = useCallback((tab: string) => {
      setActiveTab(tab as any);
      setShowMobileBottomSheet(true);
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
          <div className="px-1 py-2 bg-white border-b border-gray-200 shadow-sm sm:px-4">
            <div className="flex items-center justify-between">
              {/* Left: Logo */}
              <div className="flex items-center">
                <img src={JunooniLogo} alt="Junooni Logo" className="h-6 sm:h-8" />
              </div>
              
              {/* Center: Design/Preview Toggle Buttons */}
              <div className="flex p-0.5 mr-2 sm:p-1 bg-gray-100 border border-gray-200 rounded-lg">
                <button
                  onClick={() => setActiveView('design')}
                  className={`flex items-center gap-0.5 sm:gap-2 
                    px-1.5 sm:px-4 py-1 sm:py-2 
                    text-[10px] sm:text-sm font-medium 
                    rounded-md transition-all touch-manipulation ${
                      activeView === 'design'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  style={{
                    backgroundColor: activeView === 'design' ? brandColor : 'transparent'
                  }}
                >
                  <PenTool size={isMobile ? 12 : 16} strokeWidth={2} />
                  Design
                </button>

                <button
                  onClick={() => setActiveView('preview')}
                  className={`flex items-center gap-0.5 sm:gap-2 
                    px-1.5 sm:px-4 py-1 sm:py-2 
                    text-[10px] sm:text-sm font-medium 
                    rounded-md transition-all touch-manipulation ${
                      activeView === 'preview'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  style={{
                    backgroundColor: activeView === 'preview' ? brandColor : 'transparent'
                  }}
                >
                  <Eye size={isMobile ? 12 : 16} strokeWidth={2} />
                  Preview
                </button>
              </div>

              
              {/* Right: Import to Store + Exit Button */}
              <div className="flex items-center gap-0 sm:gap-3">
                <button
                  onClick={handleImportToStore}
                  disabled={!hasDesignElements || isGeneratingForStore || !mockupCalculation}
                  className="flex items-center gap-1 px-2 py-2 text-xs font-medium text-white transition-colors rounded-lg shadow-sm sm:gap-2 sm:px-4 sm:text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation ml-0.5 sm:ml-0"
                  style={{ backgroundColor: brandColor }}
                >
                  {isGeneratingForStore ? (
                    <>
                      <div className="w-3 h-3 border-b-2 border-white rounded-full sm:w-4 sm:h-4 animate-spin"></div>
                      <span className="hidden sm:inline">Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="hidden sm:inline">Import to Store</span>
                    </>
                  )}
                </button>
                
                <button
          onClick={() => window.history.back()}
                  className="p-2 text-gray-500 transition-colors rounded-lg hover:text-gray-700 hover:bg-gray-100 touch-manipulation"
                  title="Close Designer"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

        {/* Main Content Container */}
        <div className="flex flex-1 overflow-hidden">
          {/* Collapsible Toggle Button - Desktop Only */}
          {activeView === 'design' && !isMobile && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`fixed z-40 p-2 bg-white border border-gray-300 rounded-r-lg shadow-md hover:bg-gray-50 transition-all duration-300 ${
                sidebarCollapsed ? 'left-20' : 'left-96'
              } top-[calc(50%+4rem)] -translate-y-1/2`}
              title={sidebarCollapsed ? 'Expand content panel' : 'Collapse content panel'}
            >
              <svg 
                className={`w-3 h-3 text-[#e65100] transition-transform duration-300 ${sidebarCollapsed ? 'rotate-0' : 'rotate-180'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Enhanced Vertical Sidebar - Desktop Only in Design Mode */}
          {activeView === 'design' && !isMobile && (
            <div className="flex bg-white border-r border-gray-200 shadow-sm">
              {/* Vertical Navigation - Always Visible */}
              <div className="flex flex-col border-r border-gray-200 w-17" style={{ backgroundColor: '#e65100' }}>
                
                <nav className="flex flex-col flex-1 p-2 space-y-1">
                  {([
                    { id: 'product', icon: Package, label: 'Product', count: 1 },
                    { id: 'colors', icon: Palette, label: 'Colors', count: selectedColors.length },
                    { id: 'sizes', icon: Ruler, label: 'Sizes', count: selectedSizes.length },
                    { id: 'upload', icon: Upload, label: 'Upload', count: uploadedFiles.length },
                    { id: 'library', icon: FolderOpen, label: 'Library', count: 0 },
                    { id: 'layers', icon: Layers, label: 'Layers', count: getLayersInfo().length }
                  ] as const).map(tab => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative group flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 touch-manipulation ${
                          activeTab === tab.id 
                            ? 'bg-white text-[#e65100] shadow-sm' 
                            : 'text-white hover:text-[#e65100] hover:bg-white/70'
                        }`}
                        title={tab.label}
                      >
                        <div className="relative">
                          <IconComponent 
                            size={20}
                            strokeWidth={activeTab === tab.id ? 2.5 : 2}
                          />
                          
                          {tab.count > 0 && tab.id !== 'product' && (
                            <span className="absolute flex items-center justify-center w-4 h-4 text-xs font-bold text-orange-600 bg-white rounded-full -top-3 -right-1">
                              {tab.count > 99 ? '99+' : tab.count}
                            </span>
                          )}
                        </div>
                        
                        <span className="mt-1 text-xs font-medium">{tab.label}</span>
                        
                        {/* Active indicator */}
                        {activeTab === tab.id && (
                          <div className="absolute left-0 w-1 h-8 transform -translate-y-1/2 bg-white rounded-r-full top-1/2" />
                        )}
                      </button>
                    );
                  })}
                </nav>
                
                {/* Status indicators at bottom */}
                <div className="p-2 border-t border-orange-600">
                  <div className="space-y-2">
                    {isGeneratingForStore && (
                      <div className="flex items-center justify-center p-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                    
                    {getLayersInfo().length > 0 && (
                      <div className="flex items-center justify-center">
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            getLayersInfo().every(layer => layer.printQuality === 'Excellent') ? 'bg-green-400' : 
                            getLayersInfo().some(layer => layer.printQuality === 'Poor') ? 'bg-red-400' : 'bg-yellow-400'
                          }`}
                          title={`Print Quality: ${getLayersInfo().every(layer => layer.printQuality === 'Excellent') ? 'Excellent' : 
                                getLayersInfo().some(layer => layer.printQuality === 'Poor') ? 'Poor' : 'Good'}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Content Panel - Collapsible */}
              <div className={`flex flex-col transition-all duration-300 overflow-hidden h-full ${
                sidebarCollapsed ? 'w-0' : 'w-80'
              }`}>
                {/* Header */}
                <div className="px-6 py-4 border-l-3 border-r-2 border-b border-t-2  border-[#e65100] bg-[#fed7aa]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 capitalize">{activeTab}</h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {activeTab === 'colors' && `${selectedColors.length} selected`}
                        {activeTab === 'sizes' && `${selectedSizes.length} selected`}
                        {activeTab === 'upload' && `${uploadedFiles.length} files`}
                        {activeTab === 'library' && 'Browse templates'}
                        {activeTab === 'layers' && `${getLayersInfo().length} layers`}
                      </p>
                    </div>
                    
                    {/* Active color indicator */}
                    {activeTab === 'colors' && activeColor && (
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 border-2 border-gray-300 rounded-full shadow-sm"
                          style={{ backgroundColor: activeColor }}
                          title="Active color"
                        />
                        <span className="text-xs font-medium text-gray-600">
                          {selectedColors.find(c => c.value === activeColor)?.name || 'Active'}
                        </span>
                      </div>
                    )}
                    
                    {/* Layer quality indicator */}
                    {activeTab === 'layers' && getLayersInfo().length > 0 && (
                      <div className="flex items-center space-x-2 text-xs">
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            getLayersInfo().every(layer => layer.printQuality === 'Excellent') ? 'bg-green-500' : 
                            getLayersInfo().some(layer => layer.printQuality === 'Poor') ? 'bg-red-500' : 'bg-yellow-500'
                          }`}
                        />
                        <span className="font-medium text-gray-600">
                          Avg: {Math.round(getLayersInfo().reduce((acc, layer) => acc + layer.dpi, 0) / getLayersInfo().length)} DPI
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto border-l-3 border-r-2 border-b-2 border-[#e65100] bg-[#fed7aa] 
                        [scrollbar-width:thin] [scrollbar-color:#4B4B4B_#ffccbc]">
                  <div className="px-3 py-3 bg-[#fed7aa] border-[#e65100]">
                    {renderSettingsPanel()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className={`flex transition-all duration-300 ${
            activeView === 'design' 
              ? !isMobile
                ? sidebarCollapsed 
                  ? 'w-[calc(100%-4rem)]' 
                  : 'w-[calc(100%-24rem)]' 
                : 'flex-1'
              : 'flex-1'
          }`}>
            {/* Add Area Thumbnails for Design Mode - Desktop Only */}
            {activeView === 'design' && !isMobile && availableAreas.length > 1 && (
              <div className="w-40 p-3 bg-[#F3F4F6] ">
                
                <div className="space-y-2">
                  {availableAreas.map(area => {
                    const areaData = getAreaDisplayData(area);
                    const elementCount = designElements[area]?.length || 0;
                    const canvasImage = canvasImages[`${area}_${activeColor}`] || canvasImages[area];
                    
                    return (
                      <AreaSelectionThumbnail
                        key={area}
                        areaId={area}
                        areaName={areaData.displayName}
                        isActive={activeArea === area}
                        onSelect={setActiveArea}
                        canvasImage={canvasImage}
                        activeColor={activeColor}
                        elementCount={elementCount}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="flex-1 p-2 overflow-hidden">
              {activeView === 'design' ? (
                <div className="flex items-center justify-center h-full p-2 overflow-y-auto sm:p-4">
                  {renderCanvas()}
                </div>
              ) : (
                renderPreview()
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Bottom Tab Bar */}
        {isMobile && activeView === 'design' && (
          <MobileBottomTabBar
            activeTab={activeTab}
            onTabChange={handleMobileTabChange}
            selectedColors={selectedColors}
            selectedSizes={selectedSizes}
            uploadedFiles={uploadedFiles}
            layersCount={getLayersInfo().length}
          />
        )}

        {/* Mobile Bottom Sheet */}
        {isMobile && (
          <MobileBottomSheet
            isOpen={showMobileBottomSheet}
            onClose={() => setShowMobileBottomSheet(false)}
            title={activeTab}
          >
            {renderSettingsPanel()}
          </MobileBottomSheet>
        )}
        
        {/* Enhanced Store Import Modal */}
        <StoreImportModal
          isOpen={showStoreImportModal}
          onClose={() => setShowStoreImportModal(false)}
          importData={storeImportData}
          isGenerating={isGeneratingForStore}
          generationProgress={storeGenerationProgress}
          mockupCalculation={mockupCalculation}
        />
        
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