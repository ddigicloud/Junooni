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
import JUNO from "@/assets/JUNO.mp4";
import { Palette, Ruler, Upload, FolderOpen, Layers, Package, PenTool, Eye, Trash, Trash2, Menu, X, ChevronUp, ChevronDown , Calculator , IndianRupee, Shield, CheckCircle, ArrowLeft, Sparkles, Info } from 'lucide-react';
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
  imageBase64?: string; // âœ¨ Base64 for persistent storage
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
  realWorldDimensions?: {
    widthInches: number;
    heightInches: number;
    xInches: number;
    yInches: number;
    areaSquareInches: number;
  };
}

interface AreaPricingInfo {
  areaId: string;
  areaName: string;
  minimumPrice: number;
  pricePerSquareInch: number;
  designAreaSquareInches: number;      // Total design area available
  currentImageArea: number;            // Current area consumed by images
  calculatedPrice: number;
  finalPrice: number;
  elements: Array<{
    elementId: string;
    elementName: string;
    areaSquareInches: number;
    elementPrice: number;
    originalArea: number;              // Original image area
    extraArea: number;                 // Extra area added by dragging
  }>;
}

interface PricingCalculation {
  subtotal: number;
  setupFee: number;
  technologyFee: number;
  printingGSTAmount?: number;  // NEW
  productGSTAmount?: number;   // NEW
  shippingCharges?: number;     // NEW
  totalBeforeMarkup: number;
  markup: number;
  finalTotal: number;
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


interface TotalPricingBreakdown {
  areas: Record<string, AreaPricingInfo>;
  calculation: PricingCalculation;
  technology: string;
  totalElements: number;
  totalDesignArea: number;
 priceBreakdown: {
    basePrintingCost: number;
    blankProductCost: number;
    printingGSTAmount?: number;  // NEW
    productGSTAmount?: number;   // NEW
    setupFees: number;
    additionalCosts: number;
    shippingCharges?: number;    // NEW
    markup: number;
    finalPrice: number;
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
   // ðŸ”¥ NEW: Mockup dimensions from PayloadCMS
  mocwidthpx?: number;      // Mockup width in pixels (for main preview)
  mochigtpx?: number;       // Mockup height in pixels (for main preview)
  tmbwidthpx?: number;      // Thumbnail width in pixels (for thumbnails)
  tmbhigtpx?: number; 
  // 🆕 NEW: Color masking fields
  requiresColorMasking?: boolean;  // Flag to indicate this mockup needs color masking
  maskColor?: string;               // The actual color to apply in the mask
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
  base64Data?: string; // âœ¨ Base64 for persistent storage
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
  surfConf?: {
    No_Mockup_Compatible?: boolean;
    renderType?: string;
    blendSet?: {
      defaultBlendMode?: string;
      defaultOpacity?: number;
      preserveColors?: boolean;
    };
    surfProp?: {
      wrapAngle?: number;
      curveInten?: number;
      designRatio?: any;
    };
  };
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
    mockup_size?: string;
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
  // ðŸ”¥ ADD DESIGN IMAGES PROPERTY
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
    designImages?: Array<{ // âœ¨ NEW: Include design images
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
  
  useEffect(() => {
    setIsImageLoading(!canvasImage);
  }, [canvasImage]);

  return (
    <button
      onClick={() => onSelect(areaId)}
      className={`w-full p-2 sm:px-6 sm:py-4 border rounded-lg transition-all touch-manipulation ${
        isActive
          ? 'border-orange-500 border-2 '
          : 'hover:border-gray-300 hover:shadow-sm border-white'
      }`}
    >
      <div className="relative mb-2 overflow-hidden bg-gray-100 rounded aspect-square">
        {canvasImage ? (
          <div className="relative w-full h-full">
            {/* LAYER 1: Base color background */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ 
                backgroundColor: activeColor
              }}
            />
            
            {/* LAYER 2: Canvas template image - overlay with proper visibility */}
            <img
              src={canvasImage.src}
              alt={areaName}
              className="absolute inset-0 object-cover w-full h-full"
              style={{ mixBlendMode: 'normal' }}
            />
            
            {/* LAYER 3: Subtle texture overlay for depth - optional */}
            <img
              src={canvasImage.src}
              alt={areaName}
              className="absolute inset-0 object-cover w-full h-full opacity-5"
              style={{ mixBlendMode: 'multiply' }}
            />
            
            {/* Element count badge */}
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

const renderMockupDirectly = async (
  mockup: DynamicMockupPhoto,
  designElements: Record<string, DesignElement[]>,
  canvasConfigs: Record<string, any>,
  printableAreas: Record<string, any>,
  productColor: string,
  targetResolution: number = 1000
): Promise<string> => {
  // console.log('🎨 Direct Canvas Render - Checking for color masking');
  // console.log('   Mockup color:', mockup.photoColor);
  // console.log('   Product color:', productColor);
  // console.log('   requiresColorMasking:', mockup.requiresColorMasking);
  // console.log('   maskColor:', mockup.maskColor);
  
  return new Promise(async (resolve, reject) => {
    try {
      // Create offscreen canvas
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = targetResolution;
      offscreenCanvas.height = targetResolution;
      const ctx = offscreenCanvas.getContext('2d', { alpha: true });
      
      if (!ctx) {
        throw new Error('Failed to get 2D context');
      }
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // 🔥 FIXED: Check if mockup requires color masking (transparent mockup)
      // 🆕 NEW: Check if mockup requires color masking (transparent mockup)
      const requiresColorMasking = mockup.requiresColorMasking === true || 
                                  mockup.photoColor?.toLowerCase() === '#00000000';
      const maskColor = mockup.maskColor || productColor || '#ffffff';

      if (requiresColorMasking) {
        // console.log('✅ Applying color masking for transparent mockup');
        // console.log('   Mask color:', maskColor);
        
        // LAYER 1: Draw base color layer FIRST
        ctx.fillStyle = maskColor;
        ctx.fillRect(0, 0, targetResolution, targetResolution);
        
        // LAYER 2: Load and draw transparent mockup on top
        const mockupBaseImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Failed to load mockup'));
          img.src = resolveImageUrl(mockup.photo.url);
        });
        
        // Draw transparent mockup over the color layer
        ctx.drawImage(mockupBaseImg, 0, 0, targetResolution, targetResolution);
        
      } else {
        // ORIGINAL LOGIC: Non-transparent mockup
        //console.log('📷 Using standard mockup rendering (no color masking)');
        
        // Load mockup base image
        const mockupBaseImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Failed to load mockup'));
          img.src = resolveImageUrl(mockup.photo.url);
        });
        
        // Draw mockup base
        ctx.drawImage(mockupBaseImg, 0, 0, targetResolution, targetResolution);
        
        // Apply product color overlay - only to white t-shirt fabric
      //   if (productColor !== '#ffffff') {
      //     // Create temporary canvas for color detection
      //     const tempCanvas = document.createElement('canvas');
      //     tempCanvas.width = targetResolution;
      //     tempCanvas.height = targetResolution;
      //     const tempCtx = tempCanvas.getContext('2d');
          
      //     if (tempCtx) {
      //       // Draw original image to analyze
      //       tempCtx.drawImage(mockupBaseImg, 0, 0, targetResolution, targetResolution);
      //       const imageData = tempCtx.getImageData(0, 0, targetResolution, targetResolution);
      //       const data = imageData.data;
            
      //       // Create mask: detect only the WHITE t-shirt fabric
      //       const whiteMin = 200;
      //       const whiteMax = 250;
            
      //       for (let i = 0; i < data.length; i += 4) {
      //         const r = data[i];
      //         const g = data[i + 1];
      //         const b = data[i + 2];
              
      //         const brightness = (r + g + b) / 3;
      //         const colorVariance = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
              
      //         const isWhiteFabric = brightness >= whiteMin && 
      //                               brightness <= whiteMax && 
      //                               colorVariance < 15 &&
      //                               !(r > 250 && g > 250 && b > 250);
              
      //         if (!isWhiteFabric) {
      //           data[i + 3] = 0;
      //         }
      //       }
            
      //       tempCtx.putImageData(imageData, 0, 0);
            
      //       // Now apply color with multiply blend
      //       const colorLayer = document.createElement('canvas');
      //       colorLayer.width = targetResolution;
      //       colorLayer.height = targetResolution;
      //       const colorCtx = colorLayer.getContext('2d');
            
      //       if (colorCtx) {
      //         colorCtx.fillStyle = productColor;
      //         colorCtx.fillRect(0, 0, targetResolution, targetResolution);
              
      //         colorCtx.globalCompositeOperation = 'destination-in';
      //         colorCtx.drawImage(tempCanvas, 0, 0);
              
      //         ctx.drawImage(colorLayer, 0, 0);
              
      //         ctx.globalAlpha = 0.15;
      //         ctx.globalCompositeOperation = 'multiply';
      //         ctx.drawImage(tempCanvas, 0, 0);
      //         ctx.globalAlpha = 1;
      //         ctx.globalCompositeOperation = 'source-over';
      //       }
      //     }
      //   }
      }
      
      // Draw design elements for each area
      for (const mockupArea of mockup.area || []) {
        const areaName = mockupArea.areaName.toLowerCase();
        const elements = designElements[areaName] || [];
        // const visibleElements = elements.filter(el => el.visible !== false && el.type === 'image');
        const visibleElements = elements
        .filter(el => el.visible !== false && el.type === 'image')
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)); // ✅ Sort by zIndex ascending (bottom to top)
      
        
        if (visibleElements.length === 0) continue;
        
        const canvasConfig = canvasConfigs[areaName];
        const printableArea = printableAreas[areaName];
        
        if (!canvasConfig || !printableArea) continue;
        
        // Map design coordinates to mockup space
        const design = mockupArea.design;
        const mockupAreaX = design.coordinateX * targetResolution;
        const mockupAreaY = design.coordinateY * targetResolution;
        const mockupAreaWidth = design.coordinateWidth * targetResolution;
        const mockupAreaHeight = design.coordinateHeight * targetResolution;
        
        // Save context and create clipping region
        ctx.save();
        ctx.beginPath();
        ctx.rect(mockupAreaX, mockupAreaY, mockupAreaWidth, mockupAreaHeight);
        ctx.clip();
        
        // Calculate scale factors from canvas to mockup
        const scaleX = mockupAreaWidth / printableArea.width;
        const scaleY = mockupAreaHeight / printableArea.height;
        
        // Draw each design element
        for (const element of visibleElements) {
          if (!element.image) continue;
          
          ctx.save();
          
          // Convert canvas coordinates to mockup coordinates
          // const elementX = mockupAreaX + (element.x - printableArea.x) * scaleX;
          // const elementY = mockupAreaY + (element.y - printableArea.y) * scaleY;
          // const elementWidth = element.width * scaleX * (element.scaleX || 1);
          // const elementHeight = element.height * scaleY * (element.scaleY || 1);
          
          // Apply transformations
          // const centerX = elementX + elementWidth / 2;
          // const centerY = elementY + elementHeight / 2;

          // Calculate center position in canvas space FIRST (using UNSCALED dimensions)
          const centerInCanvasX = element.x + element.width / 2;
          const centerInCanvasY = element.y + element.height / 2;

          // Transform center to mockup space
          const centerX = mockupAreaX + (centerInCanvasX - printableArea.x) * scaleX;
          const centerY = mockupAreaY + (centerInCanvasY - printableArea.y) * scaleY;

          // Calculate final dimensions (with all scales applied)
          const elementWidth = element.width * scaleX * (element.scaleX || 1);
          const elementHeight = element.height * scaleY * (element.scaleY || 1);
          
          ctx.translate(centerX, centerY);
          
          if (element.rotation) {
            ctx.rotate((element.rotation * Math.PI) / 180);
          }
          // if (element.rotation) {
          //   console.log('🔍 DEBUG:', {
          //     id: element.id,
          //     x: element.x,
          //     y: element.y,
          //     width: element.width,
          //     scaleX: element.scaleX,
          //     centerInCanvasX,
          //     centerX
          //   });
          // }
          
          //ctx.globalAlpha = (element.opacity || 1) * (design.opacity || 1);
          // Set element opacity (default to 1 if not specified)
          ctx.globalAlpha = element.opacity || 1;
          
          if (design.blend && design.blend !== 'normal') {
            ctx.globalCompositeOperation = design.blend as GlobalCompositeOperation;
          }
          
          // Draw design image
          ctx.drawImage(
            element.image,
            -elementWidth / 2,
            -elementHeight / 2,
            elementWidth,
            elementHeight
          );
          
          ctx.restore();
        }
        
        ctx.restore(); // Remove clipping
      }
      
      // Apply lighting overlays
      if (mockup.light && mockup.light.length > 0) {
        for (const lightOverlay of mockup.light) {
          try {
            const lightImg = await new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => resolve(img);
              img.onerror = () => reject();
              img.src = resolveImageUrl(lightOverlay.overImage.url);
            });
            
            ctx.globalAlpha = lightOverlay.ovlayOpa || 0.5;
            ctx.globalCompositeOperation = lightOverlay.overbldMde as GlobalCompositeOperation || 'normal';
            ctx.drawImage(lightImg, 0, 0, targetResolution, targetResolution);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
          } catch {
            // Skip failed overlays
          }
        }
      }
      
      // Convert to base64
      const imageData = offscreenCanvas.toDataURL('image/png', 0.95);
      //console.log('✅ Direct render complete with color masking');
      resolve(imageData);
      
    } catch (error) {
      //console.error('❌ Direct render failed:', error);
      reject(error);
    }
  });
};

const createDynamicNeutralDetector = (productData: PayloadProductData) => {
  const neutralVariations = new Set<string>();
  
  // 🆕 ADD: Transparent mockups should be neutral (work for all colors)
  const baseNeutrals = [
    '#ffffff', '#f5f5f5', '#fafafa', '#f0f0f0', '#e5e5e5',
    '#00000000', '00000000', 'transparent'  // ✅ Added transparent variations
  ];
  baseNeutrals.forEach(color => {
    neutralVariations.add(color.toLowerCase());
    neutralVariations.add(color.toLowerCase().replace('#', ''));
  });
  
  // Add word-based neutrals
  ['white', 'neutral', 'natural', 'default', 'transparent'].forEach(word => {
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
// COLOR UTILITY FUNCTIONS
// =====================================

/**
 * Calculate brightness of a hex color (0-255)
 * Returns higher values for lighter colors
 */
const getColorBrightness = (hexColor: string): number => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Handle 3-digit hex codes
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  
  // Calculate perceived brightness using standard formula
  // Human eye is more sensitive to green, less to blue
  return (r * 299 + g * 587 + b * 114) / 1000;
};

/**
 * Determine if a color is light or dark
 * Returns true for light colors, false for dark
 */
const isLightColor = (hexColor: string): boolean => {
  const brightness = getColorBrightness(hexColor);
  // Threshold of 128 works well (half of 255)
  return brightness > 128;
};

// =====================================
// ENHANCED MOCKUP CALCULATION LOGIC
// =====================================

/**
 * Get mockups for a specific color from PayloadCMS data
 */
// Around line 3150 in getMockupsForColor function
const getMockupsForColor = (
  productData: PayloadProductData, 
  colorHex: string,
  activeTechnology: string,
  selectedSize?: string
): DynamicMockupPhoto[] => {
  // console.log('🔍 getMockupsForColor called:', {
  //   colorHex,
  //   selectedSize,
  //   activeTechnology
  // });
  
  const allMockups: DynamicMockupPhoto[] = [];
  
  const activeTech = productData.printT?.find(tech => 
    tech.id === activeTechnology || tech.technologyName === activeTechnology
  );
  
  if (!activeTech) {
    //console.log('❌ No active technology found');
    return [];
  }
  
  if (activeTech.mockupPhotos && Array.isArray(activeTech.mockupPhotos)) {
    activeTech.mockupPhotos.forEach(mockup => {
      if (mockup?.photo?.url && mockup?.area?.length) {
        allMockups.push(mockup);
      }
    });
  }
  
  //console.log('📦 Total mockups in tech:', allMockups.length);
  // console.log('📸 Mockup colors:', allMockups.map(m => ({ 
  //   id: m.id, 
  //   title: m.title, 
  //   photoColor: m.photoColor 
  // })));
  
  if (!productData?.colorOptions) {
    //console.log('⚠️ No color options, returning all mockups');
    return allMockups;
  }

  const neutralDetector = createDynamicNeutralDetector(productData);
  const colorMatcher = createCanvasColorMatcher(productData);
  const targetColorInfo = colorMatcher.getColorInfo(colorHex);
  
  //console.log('🎨 Neutral colors:', neutralDetector.getNeutralColors());
  
  if (!targetColorInfo) {
    //console.log('⚠️ No target color info, returning all mockups');
    return allMockups;
  }

  // Filter by color
 // STEP 1: Find color-specific mockups ONLY
  let colorSpecificMockups = allMockups.filter(mockup => {
      return colorMatcher.areColorsSimilar(mockup.photoColor || '', colorHex);
  });

  // STEP 2: Use color-specific if found, otherwise fallback to transparent
  let filteredMockups: DynamicMockupPhoto[];

  if (colorSpecificMockups.length > 0) {
      filteredMockups = colorSpecificMockups;  // Use color-specific ONLY
  } else {
      // Fallback to transparent/neutral mockups
      filteredMockups = allMockups.filter(mockup => {
          return neutralDetector.isNeutral(mockup.photoColor?.toLowerCase() || '');
      });
  }
    
  //console.log(`✅ After color filter: ${filteredMockups.length} mockups`);
  
  // Filter by size if needed
  if (productData.size_Images && selectedSize) {
    filteredMockups = filteredMockups.filter(mockup => {
      const mockupSize = (mockup as any).photoSize;
      
      if (!mockupSize) {
        //console.log(`⚠️ Mockup ${mockup.title} has no photoSize - excluding`);
        return false;
      }
      
      const sizeMatch = mockupSize.toLowerCase().trim() === selectedSize.toLowerCase().trim();
      //console.log(`   Size check for ${mockup.title}: ${mockupSize} === ${selectedSize} ? ${sizeMatch}`);
      return sizeMatch;
    });
    
    //console.log(`✅ After size filter: ${filteredMockups.length} mockups`);
    
    if (filteredMockups.length === 0) {
      //console.log(`❌ No mockups found for size "${selectedSize}" and color "${colorHex}"`);
      return [];
    }
  }
  
  // Only return neutral fallback when size_Images is FALSE
  if (filteredMockups.length === 0 && !productData.size_Images) {
    //console.log('⚠️ No color matches, trying neutral fallback');
    const neutralMockups = allMockups.filter(mockup => {
      const mockupColor = mockup.photoColor?.toLowerCase() || '';
      return neutralDetector.isNeutral(mockupColor);
    });
    
    //console.log(`✅ Found ${neutralMockups.length} neutral mockups`);
    return neutralMockups;
  }
  
  //console.log(`🎯 Final result: ${filteredMockups.length} mockups for color ${colorHex}`);
  return filteredMockups;
};

/**
 * Enhanced calculation for color and size specific scenarios
 */
const calculateTotalMockups = (
  productData: PayloadProductData,
  selectedColors: Array<{ name: string; value: string }>,
  selectedSizes: string[],
  activeTechnology: string 
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
  selectedColors.forEach(color => {
    selectedSizes.forEach(size => {
      const mockupsForSize = getMockupsForColor(productData, color.value, activeTechnology, size);
      if (mockupsForSize.length > 0) {
        calculationBreakdown.push({
          color: color.name,
          colorHex: color.value,
          mockupsForColor: mockupsForSize.length,
          sizesCount: 1,
          subtotal: mockupsForSize.length,
          mockups: mockupsForSize,
        });
        totalMockups += mockupsForSize.length;
      }
    });
  });
}
else if (strategy === 'color_specific') {
    // CORRECTED: Colors get unique images, but sizes share them
    selectedColors.forEach(color => {
      const mockupsForColor = getMockupsForColor(productData, color.value , activeTechnology);
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
  // âœ… Each size gets its own mockups, even when colors are shared
  selectedSizes.forEach(size => {
    const sizeMockups = getMockupsForColor(
      productData,
      selectedColors[0]?.value || '#ffffff', // color shared
      activeTechnology,
      size // pass size here!
    );

    if (sizeMockups.length > 0) {
      calculationBreakdown.push({
        color: 'All Colors',
        colorHex: 'shared',
        mockupsForColor: sizeMockups.length,
        sizesCount: 1,
        subtotal: sizeMockups.length,
        mockups: sizeMockups,
      });

      totalMockups += sizeMockups.length;
    } else {
      //console.warn(`âš ï¸ No mockups found for size: ${size}`);
    }
  });
}
else {
    // Everything is shared
    const allMockups = getMockupsForColor(productData, selectedColors[0]?.value || '#ffffff' , activeTechnology);
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
  selectedColors: Array<{ name: string; value: string }>,
  activeTechnology: string 
): ColorSpecificMockupGroup[] => {
  
  const groups: ColorSpecificMockupGroup[] = [];
  const colorMatcher = createCanvasColorMatcher(productData);
  
  if (!productData.color_Images) {
    // If color_Images is false, all colors share the same mockup
    
    const firstColor = selectedColors[0];
    const sharedMockups = firstColor ? getMockupsForColor(productData, firstColor.value , activeTechnology) : [];
    
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
    
    const colorMockups = getMockupsForColor(productData, color.value , activeTechnology);
    
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
  
  // ðŸ”¥ CRITICAL FIX: ALWAYS use the selected color
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
  targetResolution: number = 1000,
  isStoreImport: boolean = false
): Promise<string> => {
  //console.log('ðŸ”§ capturePreviewRender - isStoreImport:', isStoreImport);
  
  const selectedEngine = this.determineEngine(mockup);
  //console.log('ðŸ”§ Selected engine:', selectedEngine);
  
  // CRITICAL: For store imports with Canvas, bypass React completely
  if (isStoreImport && selectedEngine === 'canvas_professional') {
    //console.log('ðŸŽª STORE IMPORT: Using Direct Canvas Render (No React)');
    
    try {
      const imageData = await renderMockupDirectly(
        mockup,
        designElements,
        canvasConfigs,
        printableAreas,
        productColor,
        targetResolution
      );
      
      //console.log('âœ… Direct Canvas render succeeded');
      return imageData;
      
    } catch (directCanvasError) {
      //console.warn('âš ï¸ Direct Canvas failed, trying PIXI:', directCanvasError);
      
      try {
        const pixiData = await this.captureWithPixiContainer(
          mockup, designElements, canvasConfigs, printableAreas,
          productColor, productData, targetResolution
        );
        
        //console.log('âœ… PIXI fallback succeeded');
        return pixiData;
        
      } catch (pixiError) {
        throw new Error(`Both engines failed - Canvas: ${directCanvasError.message}, PIXI: ${pixiError.message}`);
      }
    }
  }
  
  // For preview mode, use existing component-based rendering
  if (selectedEngine === 'canvas_professional') {
    //console.log('ðŸ‘ï¸ PREVIEW: Using React Component Canvas');
    return await this.captureWithCanvasSimplified(
      mockup, designElements, canvasConfigs, printableAreas,
      productColor, productData, targetResolution, isStoreImport
    );
  } else {
    //console.log('🎨 Using PIXI engine');
    return await this.captureWithPixiContainer(
      mockup, designElements, canvasConfigs, printableAreas,
      productColor, productData, targetResolution
    );
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
  targetResolution: number,
  isStoreImport: boolean = false
): Promise<string> => {
  //console.log('🎨 captureWithCanvasSimplified - Store Import:', isStoreImport);
  
  return new Promise((resolve, reject) => {
    let renderCompleted = false;
    let renderTimeout: NodeJS.Timeout;
    let componentMounted = false;
    
    // Create HIDDEN container to avoid render blocking
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: -99999px;
      left: -99999px;
      width: ${targetResolution}px;
      height: ${targetResolution}px;
      background: white;
      z-index: -1;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
    `;
    
    container.id = `canvas-store-${Date.now()}`;
    document.body.appendChild(container);
    
    //console.log('âœ… Container created:', container.id);
    
    const cleanup = () => {
      try {
        if (componentMounted) {
          componentMounted = false;
        }
        setTimeout(() => {
          if (document.body.contains(container)) {
            document.body.removeChild(container);
            //console.log('ðŸ§¹ Container cleaned up');
          }
        }, 100);
      } catch (e) {
        //console.warn('Cleanup error:', e);
      }
    };
    
    // CRITICAL: Much longer timeout for Store Import
    const timeoutDuration = isStoreImport ? 90000 : 30000; // 90s for store, 30s for preview
    //console.log('â±ï¸ Timeout set to:', timeoutDuration / 1000, 'seconds');
    
    renderTimeout = setTimeout(() => {
      if (renderCompleted) return;
      renderCompleted = true;
      
      //console.error('âŒ Canvas TIMEOUT after', timeoutDuration / 1000, 'seconds');
      cleanup();
      reject(new Error(`Canvas timeout after ${timeoutDuration / 1000}s`));
      
    }, timeoutDuration);
    
    //console.log('ðŸ“¦ Importing react-dom/client...');
    
    import('react-dom/client').then(async ({ createRoot }) => {
      //console.log('âœ… React DOM imported, creating root...');
      
      try {
        const root = createRoot(container);
        componentMounted = true;
        
        //console.log('ðŸŽ­ Creating EnhancedMockupEngine component...');
        
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
          pixelRatio: isStoreImport ? 2 : 1, // Higher quality for store
          showBadges: false, // Disable badges for cleaner output
          
          onRenderComplete: (imageData: string) => {
            if (renderCompleted) {
              //console.warn('âš ï¸ onRenderComplete called but already completed');
              return;
            }
            renderCompleted = true;
            
            //console.log('âœ… âœ… âœ… CANVAS RENDER COMPLETE!');
            //console.log('ðŸ“Š Image data length:', imageData?.length || 0);
            
            if (renderTimeout) {
              clearTimeout(renderTimeout);
              //console.log('â±ï¸ Timeout cleared');
            }
            
            cleanup();
            
            if (imageData && imageData.length > 0) {
              //console.log('âœ… Resolving with image data');
              resolve(imageData);
            } else {
              //console.error('âŒ No image data received');
              reject(new Error('No image data received'));
            }
          },
          
          onProgress: (progress: number) => {
            //console.log(`ðŸ“Š Canvas progress: ${Math.round(progress)}%`);
          },
          
          onError: (error: any) => {
            if (renderCompleted) {
              //console.warn('âš ï¸ onError called but already completed');
              return;
            }
            renderCompleted = true;
            
            //console.error('âŒ âŒ âŒ CANVAS ERROR:', error);
            
            if (renderTimeout) clearTimeout(renderTimeout);
            cleanup();
            reject(new Error(`Canvas error: ${error?.message || error}`));
          }
        });
        
        //console.log('ðŸš€ Rendering component...');
        root.render(mockupComponent);
        //console.log('âœ… Component render called, waiting for callbacks...');
        
      } catch (renderError) {
        //console.error('âŒ Render exception:', renderError);
        if (!renderCompleted) {
          renderCompleted = true;
          if (renderTimeout) clearTimeout(renderTimeout);
          cleanup();
          reject(new Error(`Render error: ${renderError.message}`));
        }
      }
      
    }).catch(importError => {
      //console.error('âŒ ReactDOM import failed:', importError);
      if (!renderCompleted) {
        renderCompleted = true;
        if (renderTimeout) clearTimeout(renderTimeout);
        cleanup();
        reject(new Error(`Import failed: ${importError.message}`));
      }
    });
  });
};

// Separate method for Canvas engine attempt with timeout
private tryCanvasEngine = async (
  mockup: DynamicMockupPhoto,
  designElements: Record<string, DesignElement[]>,
  canvasConfigs: Record<string, any>,
  printableAreas: Record<string, any>,
  productColor: string,
  productData: any,
  targetResolution: number,
  isStoreImport: boolean = false
): Promise<string> => {
  //console.log('ðŸ”§ tryCanvasEngine - isStoreImport:', isStoreImport);
  
  return new Promise((resolve, reject) => {
    let renderCompleted = false;
    let renderTimeout: NodeJS.Timeout;
    
    // Create VISIBLE container like Preview mode
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${targetResolution}px;
      height: ${targetResolution}px;
      background: white;
      z-index: 999999;
      opacity: 1;
      pointer-events: none;
      border: 5px solid ${isStoreImport ? '#10b981' : '#ef4444'};
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    `;
    
    // Add progress indicator
    container.innerHTML = `
      <div style="position: absolute; top: 12px; left: 12px; right: 12px; background: ${isStoreImport ? '#10b981' : '#ef4444'}; color: white; padding: 8px 16px; font-size: 16px; border-radius: 8px; font-weight: bold; z-index: 10001; text-align: center;">
        ${isStoreImport ? 'ðŸŽª STORE IMPORT' : 'ðŸ‘ï¸ PREVIEW'} - Rendering...
      </div>
      <div id="progress-bar" style="position: absolute; bottom: 12px; left: 12px; right: 12px; height: 8px; background: rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden;">
        <div id="progress-fill" style="height: 100%; width: 0%; background: ${isStoreImport ? '#10b981' : '#ef4444'}; transition: width 0.3s;"></div>
      </div>
    `;
    
    container.id = `canvas-render-${Date.now()}`;
    document.body.appendChild(container);
    
    const cleanup = () => {
      // Longer delay for Store Import like Preview mode
      const cleanupDelay = isStoreImport ? 2000 : 1000;
      
      setTimeout(() => {
        try {
          if (document.body.contains(container)) {
            document.body.removeChild(container);
            //console.log('ðŸ”§ Container cleaned up after', cleanupDelay, 'ms');
          }
        } catch (e) {
          //console.warn('Cleanup error:', e);
        }
      }, cleanupDelay);
    };
    
    // Much longer timeout for Store Import - matching Preview behavior
    const timeoutDuration = isStoreImport ? 60000 : 20000; // 60s for store import
    //console.log('ðŸ”§ Canvas timeout set to:', timeoutDuration / 1000, 'seconds');
    
    renderTimeout = setTimeout(() => {
      if (renderCompleted) return;
      renderCompleted = true;
      
      //console.error('âŒ Canvas timeout after', timeoutDuration / 1000, 'seconds');
      cleanup();
      reject(new Error(`Canvas timeout after ${timeoutDuration / 1000}s`));
      
    }, timeoutDuration);
    
    import('react-dom/client').then(async ({ createRoot }) => {
      const root = createRoot(container);
      
      const updateProgress = (progress: number) => {
        const progressFill = container.querySelector('#progress-fill') as HTMLElement;
        if (progressFill) {
          progressFill.style.width = `${progress}%`;
        }
      };
      
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
        pixelRatio: 2, // Higher quality for store import
        
        onRenderComplete: (imageData: string) => {
          if (renderCompleted) return;
          renderCompleted = true;
          
          //console.log('âœ… Canvas render complete, data size:', imageData.length);
          updateProgress(100);
          
          if (renderTimeout) clearTimeout(renderTimeout);
          
          // Keep visible longer for Store Import to verify
          cleanup();
          
          if (imageData && imageData.length > 0) {
            resolve(imageData);
          } else {
            reject(new Error('No image data received'));
          }
        },
        
        onProgress: (progress: number) => {
          updateProgress(progress);
          //console.log(`Canvas progress: ${Math.round(progress)}%`);
        },
        
        onError: (error: any) => {
          if (renderCompleted) return;
          renderCompleted = true;
          
          //console.error('âŒ Canvas error:', error);
          
          if (renderTimeout) clearTimeout(renderTimeout);
          cleanup();
          reject(new Error(`Canvas error: ${error?.message || error}`));
        }
      });
      
      try {
        root.render(mockupComponent);
        //console.log('âœ… Canvas component mounted successfully');
      } catch (renderError) {
        if (!renderCompleted) {
          renderCompleted = true;
          if (renderTimeout) clearTimeout(renderTimeout);
          cleanup();
          reject(new Error(`Render error: ${renderError.message}`));
        }
      }
      
    }).catch(importError => {
      if (!renderCompleted) {
        renderCompleted = true;
        if (renderTimeout) clearTimeout(renderTimeout);
        cleanup();
        reject(new Error(`Import failed: ${importError.message}`));
      }
    });
  });
};


// ðŸ”¥ PIXI ENGINE - Keep existing working version
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

// ðŸ”¥ ENHANCED determineEngine method (your existing one is good, but here's the complete version)
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

// ðŸ”¥ OPTIONAL: Add this property to the class to store product data
private productData: any;

// ðŸ”¥ OPTIONAL: Update your constructor or add this method to set product data
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

 public generateSingleMockup = async (
  mockup: DynamicMockupPhoto,
  designElements: Record<string, DesignElement[]>,
  canvasConfigs: Record<string, any>,
  printableAreas: Record<string, any>,
  productColor: string,
  productData: any,
  targetResolution: number = 1000,
  isStoreImport: boolean = false
): Promise<{ imageData: string; engine: 'canvas_professional' | 'pixi_dynamic'; metrics: any }> => {
  //console.log('ðŸŽ¯ generateSingleMockup called with isStoreImport:', isStoreImport);
  
  const startTime = performance.now();
  const engine = this.determineEngine(mockup);
  
  //console.log('ðŸ”§ Determined engine:', engine);
  
  // const cacheKey = `${mockup.id}-${productColor}-${Object.keys(designElements).length}-${targetResolution}-${isStoreImport ? 'store' : 'preview'}`;
  const cacheKey = `${mockup.id}-${mockup.viewAngle || 'front'}-${productColor}-${Object.keys(designElements).length}-${targetResolution}-${isStoreImport ? 'store' : 'preview'}`;
  
  if (this.renderCache.has(cacheKey)) {
    //console.log('ðŸ’¾ Using cached image');
    const cachedImageData = this.renderCache.get(cacheKey)!;
    return {
      imageData: cachedImageData,
      engine,
      metrics: {
        render_time_ms: 0,
        image_size_kb: Math.round((cachedImageData.length * 3) / 4 / 1024),
        compression_ratio: 2.0,
        cached: true
      }
    };
  }
  
  //console.log('ðŸš€ Starting fresh render with isStoreImport:', isStoreImport);
  
  // Call capturePreviewRender with the isStoreImport flag
  const imageData = await this.capturePreviewRender(
    mockup, 
    designElements, 
    canvasConfigs, 
    printableAreas, 
    productColor, 
    productData, 
    targetResolution,
    isStoreImport  // â† CRITICAL: Pass the flag here
  );
  
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  //console.log('âœ… Generation complete in', Math.round(renderTime), 'ms');
  
  this.renderCache.set(cacheKey, imageData);
  
  return {
    imageData,
    engine,
    metrics: {
      render_time_ms: Math.round(renderTime),
      image_size_kb: Math.round((imageData.length * 3) / 4 / 1024),
      compression_ratio: 2.0,
      cached: false
    }
  };
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

  // âœ… ADD THIS CHECK
  if (productData?.surfConf?.No_Mockup_Compatible === true) {
    return {
      product_id: productData.id || `product-${Date.now()}`,
      product_name: productData.name || 'Unnamed Product',
      product_type: productData.productType || 'custom',
      design_elements: designElements,
      design_configuration: {
        canvas_configs: canvasConfigs,
        printable_areas: printableAreas,
        design_metadata: {
          total_elements: Object.values(designElements).flat().length,
          creation_timestamp: new Date().toISOString(),
        }
      },
      mockup_variants: [],
      generation_summary: {
        total_combinations: 0,
        total_images_generated: 0,
        generation_started: new Date().toISOString(),
        generation_completed: new Date().toISOString(),
        total_time_ms: 0,
        engine_usage: { canvas_professional: 0, pixi_dynamic: 0 },
        mockup_calculation: mockupCalculation,
        errors: [],
        message: 'Mockup generation skipped - product not compatible'
      }
    };
  }
  
  
  if (this.isGenerating) {
    throw new Error('Generation already in progress');
  }

  this.isGenerating = true;
  
  const generationStartTime = performance.now();
  const generationStarted = new Date().toISOString();
  
  let totalCombinations: number;
  if (productData.size_Images) {
    totalCombinations = mockupCalculation.totalMockups * selectedSizes.length;
  } else {
    totalCombinations = mockupCalculation.totalMockups;
  }
  
  let completedCombinations = 0;
  const errors: string[] = [];
  const engineUsage = { canvas_professional: 0, pixi_dynamic: 0 };
  const mockupVariants: StoreImportData['mockup_variants'] = [];

  try {
    // ðŸ”¥ FIX: When size_Images=true, process each color-size combination
    for (const colorBreakdown of mockupCalculation.calculationBreakdown) {
      
      // ðŸ”¥ FIX: For each size, get mockups specifically for that size
      const sizesToProcess = productData.size_Images ? selectedSizes : [null];
      
      for (const size of sizesToProcess) {
        // Get mockups for this specific color and size combination
        const mockupsToProcess = productData.size_Images 
          ? colorBreakdown.mockups.filter(m => (m as any).photoSize === size)
          : colorBreakdown.mockups;
        
        //console.log(`ðŸŽ¯ Processing ${mockupsToProcess.length} mockups for ${colorBreakdown.color}${size ? ` - ${size}` : ''}`);
        
        for (const mockup of mockupsToProcess) {
          const smartProductColor = getProductColorForMockup(mockup, colorBreakdown.colorHex, productData);
          const determinedEngine = this.determineEngine(mockup);
          
          const mockupAreas = mockup.area?.map(area => area.areaName?.toLowerCase()) || [];
          
          // ðŸ”¥ FIX: Check if ANY of these areas have design elements
          const hasDesignElements = mockupAreas.some(areaName => {
            const areaElements = designElements[areaName] || [];
            return areaElements.some(element => element.visible !== false);
          });

          const mockupSize = (mockup as any).photoSize;

          if (!productData.size_Images) {
            // Sizes share the same image
            const colorCombinations: any[] = [{
              color_name: colorBreakdown.color,
              color_hex: colorBreakdown.colorHex,
              size_variants: []
            }];

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
                mockup, designElements, canvasConfigs, printableAreas,
                smartProductColor, productData, 1000, true
              );

              engineUsage[result.engine]++;

              selectedSizes.forEach(sz => {
                colorCombinations[0].size_variants.push({
                  size_name: sz,
                  generated_images: [{
                    engine_used: result.engine,
                    image_data: result.imageData,
                    resolution: 1000,
                    generation_timestamp: new Date().toISOString(),
                    quality_metrics: result.metrics
                  }]
                });
              });

              mockupVariants.push({
                mockup_id: mockup.id,
                mockup_title: mockup.title,
                view_angle: mockup.viewAngle || 'front',
                mockup_color: mockup.photoColor,
                color_combinations: colorCombinations
              });

              completedCombinations++;

            } catch (error) {
              errors.push(`Failed: ${combinationId} - ${error.message}`);
              
              selectedSizes.forEach(sz => {
                colorCombinations[0].size_variants.push({
                  size_name: sz,
                  generated_images: []
                });
              });
            }

          } else {
            // ðŸ”¥ Size-specific: Each mockup generates for its specific size only
            const colorCombinations: any[] = [{
              color_name: colorBreakdown.color,
              color_hex: colorBreakdown.colorHex,
              size_variants: []
            }];

            const combinationId = `${mockup.title}-${colorBreakdown.color}-${mockupSize}`;
            
            onProgress?.({
              total: totalCombinations,
              completed: completedCombinations,
              current_combination: combinationId,
              current_mockup: `${mockup.title} (${mockupSize})`,
              current_engine: determinedEngine,
              errors: [...errors]
            });

            try {
              const result = await this.generateSingleMockup(
                mockup, designElements, canvasConfigs, printableAreas,
                smartProductColor, productData, 1000, true
              );

              engineUsage[result.engine]++;

              colorCombinations[0].size_variants.push({
                size_name: mockupSize,
                generated_images: [{
                  engine_used: result.engine,
                  image_data: result.imageData,
                  resolution: 1000,
                  generation_timestamp: new Date().toISOString(),
                  quality_metrics: result.metrics
                }]
              });

              mockupVariants.push({
                mockup_id: mockup.id,
                mockup_title: mockup.title,
                view_angle: mockup.viewAngle || 'front',
                mockup_color: mockup.photoColor,
                mockup_size: mockupSize, // ðŸ”¥ Critical: Store the specific size
                color_combinations: colorCombinations
              });

              // ðŸ”¥ DEBUG: Log what we just added
              // console.log('ðŸ“¦ ADDED MOCKUP VARIANT:', {
              //   title: mockup.title,
              //   mockup_size: mockupSize,
              //   mockup_color: mockup.photoColor,
              //   color_name: colorCombinations[0].color_name,
              //   color_hex: colorCombinations[0].color_hex,
              //   size_variants: colorCombinations[0].size_variants.map(sv => ({
              //     size_name: sv.size_name,
              //     has_images: sv.generated_images.length > 0
              //   }))
              // });

              completedCombinations++;

            } catch (error) {
              errors.push(`Failed: ${combinationId} - ${error.message}`);
              
              colorCombinations[0].size_variants.push({
                size_name: mockupSize,
                generated_images: []
              });
            }

            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          await new Promise(resolve => setTimeout(resolve, 200));
        }
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

  const totalImagesGenerated = mockupVariants.reduce((total, mockup) => 
    total + mockup.color_combinations.reduce((colorTotal, color) => 
      colorTotal + color.size_variants.reduce((sizeTotal, sz) => 
        sizeTotal + sz.generated_images.length, 0), 0), 0);

  const designConfiguration = {
    canvas_configs: canvasConfigs,
    printable_areas: printableAreas,
    design_metadata: {
      total_elements: Object.values(designElements).flat().length,
      areas_used: Object.keys(designElements).filter(area => designElements[area].length > 0),
      creation_timestamp: new Date().toISOString(),
      last_modified: new Date().toISOString()
    },
    payloadcms_flags: {
      color_Images: productData.color_Images,
      size_Images: productData.size_Images
    }
  };

//   console.log('ðŸ“¦ FINAL MOCKUP VARIANTS SUMMARY:', {
//   total_variants: mockupVariants.length,
//   variants: mockupVariants.map(v => ({
//     title: v.mockup_title,
//     mockup_size: v.mockup_size,
//     mockup_color: v.mockup_color,
//     color_combinations: v.color_combinations?.length || 0,
//     first_color: v.color_combinations?.[0]?.color_name,
//     size_variants_count: v.color_combinations?.[0]?.size_variants?.length || 0,
//     sizes: v.color_combinations?.[0]?.size_variants?.map(sv => sv.size_name)
//   }))
// });

  return {
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
  isMainPreview?: boolean; // ðŸ”¥ ADD THIS PROP
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
  displayDimensions = { width: 275, height: 275 },
  isMainPreview = false,
  productData
}) => {
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [renderComplete, setRenderComplete] = useState(false);
  const [forceRender, setForceRender] = useState(false);

  // Determine which engine this mockup needs
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

  const renderEngine = determineRenderEngine();
  const shouldUseDirectRender = renderEngine === 'canvas'; // 🔥 Only use direct render for Canvas

  // 🔥 NEW: Use renderMockupDirectly ONLY for Canvas engine
  useEffect(() => {
    if (!shouldUseDirectRender) {
      // For PIXI, use the old component-based approach
      setIsRendering(false);
      return;
    }

    let isMounted = true;
    
    const generatePreview = async () => {
      try {
        setIsRendering(true);
        
        // Use direct rendering for Canvas engine only
        const imageData = await renderMockupDirectly(
          mockup,
          designElements,
          canvasConfigs,
          canvasPrintableAreas,
          productColor,
          displayDimensions.width
        );
        
        if (isMounted) {
          setPreviewImage(imageData);
          setIsRendering(false);
        }
      } catch (error) {
        console.error('Canvas preview render failed:', error);
        if (isMounted) {
          setThumbnailError('Failed to render preview');
          setIsRendering(false);
        }
      }
    };
    
    generatePreview();
    
    return () => {
      isMounted = false;
    };
  }, [mockup.id, productColor, shouldUseDirectRender, displayDimensions.width]);

  // For PIXI engine, use the old component-based rendering
  useEffect(() => {
    if (shouldUseDirectRender) return; // Skip for Canvas

    const timer = setTimeout(() => {
      setForceRender(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [shouldUseDirectRender]);

  useEffect(() => {
    if (shouldUseDirectRender) return; // Skip for Canvas
    
    if (mockup?.photo?.url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setRenderComplete(true);
      img.onerror = () => setThumbnailError('Failed to load base image');
      img.src = resolveImageUrl(mockup.photo.url);
    }
  }, [mockup?.photo?.url, shouldUseDirectRender]);

  const renderMockupThumbnail = useCallback(() => {
    if (!mockup?.photo?.url) {
      return (
        <div className="flex items-center justify-center w-full h-full text-gray-400">
          <span className="text-xs">No Image</span>
        </div>
      );
    }

    // 🔥 Canvas Engine: Show direct render result
    if (shouldUseDirectRender) {
      if (isRendering) {
        return (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <div className="w-6 h-6 mx-auto mb-1 border-b-2 border-Orange-500 rounded-full animate-spin"></div>
              {/* <div className="text-xs text-gray-600">Canvas Rendering...</div> */}
            </div>
          </div>
        );
      }

      if (previewImage) {
        return (
          <div className="relative w-full h-full">
            <img
              src={previewImage}
              alt={mockup.title}
              className="object-contain w-full h-full"
            />
          </div>
        );
      }

      return (
        <div className="flex items-center justify-center w-full h-full text-gray-400">
          <span className="text-xs">No Preview</span>
        </div>
      );
    }

    // 🔥 PIXI Engine: Use EnhancedMockupEngine component
    const hasDesignElements = Object.values(designElements).some(elements => elements.length > 0);
    
    const requiresColorMasking = mockup.requiresColorMasking === true || 
                                 mockup.photoColor?.toLowerCase() === '#00000000';
    const maskColor = mockup.maskColor || productColor || '#ffffff';

    // NO DESIGN ELEMENTS - Show mockup only
    if (!hasDesignElements) {
      if (requiresColorMasking) {
        return (
          <div className="relative w-full h-full overflow-hidden">
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ backgroundColor: maskColor }}
            />
            <img
              src={resolveImageUrl(mockup.photo.url)}
              alt={mockup.title}
              className="absolute inset-0 object-cover w-full h-full"
              onError={() => setThumbnailError('Failed to load image')}
            />
          </div>
        );
      }
      
      return (
        <img
          src={resolveImageUrl(mockup.photo.url)}
          alt={mockup.title}
          className="object-cover w-full h-full"
          onError={() => setThumbnailError('Failed to load image')}
        />
      );
    }

    // HAS DESIGN ELEMENTS - Use EnhancedMockupEngine for PIXI
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
            renderEngine="pixi"
            enablePixiFeatures={true}
            pixelRatio={isMainPreview ? 2 : 1}
            onRenderComplete={() => {}}
            onProgress={() => {}}
          />
        </div>
      );
    }

    // PIXI LOADING STATE
    return (
      <div className="relative w-full h-full">
        <div className="flex items-center justify-center w-full h-full bg-gray-100">
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <div className="text-center">
              <div className="w-3 h-3 mx-auto mb-1 border-b-2 border-purple-500 rounded-full animate-spin"></div>
              <div className="text-xs text-gray-600">PIXI Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [mockup, designElements, shouldUseDirectRender, isRendering, previewImage, forceRender, renderComplete, productColor, displayDimensions, isMainPreview, productData]);

  const getEngineType = useMemo(() => {
    return renderEngine === 'pixi' ? 'PIXI' : 'Canvas';
  }, [renderEngine]);

  if (thumbnailError) {
    return (
      <button
        onClick={onSelect}
        className={`w-full p-2 border rounded-lg transition-all relative touch-manipulation ${
          isSelected
            ? 'border-white-100 bg-white-50 ring-2 ring-white-200'
            : 'border-white hover:border-white hover:shadow-sm'
        }`}
      >
        <div className="relative mb-2 overflow-hidden bg-gray-100 rounded aspect-square">
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            <div className="text-center">
              <span className="text-xs">⚠️</span>
              <p className="mt-1 text-xs">Error</p>
            </div>
          </div>
        </div>
        
        <p className="text-xs font-medium text-center line-clamp-1">{mockup.title}</p>
        <p className="text-xs text-center text-gray-500">{mockup.viewAngle}</p>
      </button>
    );
  }

  return (
    <button
      onClick={onSelect}
      className={`w-full p-0 sm:p-2 sm:pt-2 border rounded-lg transition-all relative touch-manipulation ${
        isSelected
          ? 'border-white bg-white ring-2 ring-white'
          : 'border-white hover:border-white hover:shadow-sm'
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
        {mockup.alpMasks?.length > 0 && <span className="text-xs" title="Alpha Masks">🎉</span>}
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
                    {layer.element.type} â€¢ Z:{layer.element.zIndex || 0}
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

// =====================================
// STORE IMPORT MODAL COMPONENT
// =====================================

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
  setActiveView?: (view: 'design' | 'preview') => void;
  setActiveTab?: (tab: string) => void;
}

const StoreImportModal: React.FC<StoreImportModalProps> = ({
  isOpen,
  onClose,
  importData,
  isGenerating,
  generationProgress,
  mockupCalculation,
  setActiveView,
  setActiveTab
}) => {
  const brandColor = '#ec5100';
  
  // ✅ ERROR DETECTION
  const hasError = importData?.generation_summary?.errors?.length > 0;
  const errorType = importData?.generation_summary?.error_type;
  const errorMessages = importData?.generation_summary?.errors || [];

  // Rotating message component
  const RotatingMessage = () => {
    const messages = [
      "✨ Magic is happening...",
      "🎨 Creating masterpieces...",
      "🚀 Generating awesomeness...",
      "☑️ Working our magic...",
      "🎪 Show time in progress...",
      "🌟 Crafting something special...",
      "🎯 Almost there...",
      "💌 Making it perfect..."
    ];

    const [messageIndex, setMessageIndex] = React.useState(0);

    React.useEffect(() => {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
      }, 2000);

      return () => clearInterval(interval);
    }, []);

    return <span>{messages[messageIndex]}</span>;
  };

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
          console.error('Cleanup error:', cleanupError);
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

  const handleCloseAndNavigate = (tab: string) => {
    onClose();
    if (setActiveView) setActiveView('design');
    if (setActiveTab) setActiveTab(tab);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isGenerating) onClose();
      }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold" style={{ color: hasError ? '#dc2626' : brandColor }}>
            {hasError ? '⚠️ Limit Exceeded' : 'Store Import'}
          </h2>
          {!isGenerating && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="px-4 py-5 space-y-5">
          {/* ✅ ERROR STATE - SHORTENED */}
          {hasError && !isGenerating && (
            <div className="p-6 space-y-4 rounded-lg bg-white">
              {/* Error Icon and Message */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800">
                    Too Many Mockups
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    Please reduce selected colors to continue
                  </p>
                </div>
              </div>

              {/* Current Selection Info */}
              {/* {mockupCalculation && (
                <div className="p-3 border-l-4 border-red-400 rounded bg-red-100/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-red-800">Current Selection:</span>
                    <span className="px-2 py-1 text-sm font-bold text-red-700 bg-red-200 rounded-full">
                      {mockupCalculation.totalMockups} mockups
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-red-600">
                    Recommended: Keep under 50 mockups for optimal performance
                  </p>
                </div>
              )} */}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => handleCloseAndNavigate('product')}
                  className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded hover:bg-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Reduce Colors
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  Close
                </button>
              </div>

              {/* Technical Details (Collapsible) - Optional */}
              {/* {errorMessages.length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs font-medium text-red-600 cursor-pointer hover:text-red-700 hover:underline">
                    View technical details
                  </summary>
                  <div className="p-2 mt-2 space-y-1 overflow-x-auto font-mono text-xs text-red-800 rounded bg-red-100/50">
                    {errorMessages.map((err, i) => (
                      <div key={i} className="py-1">
                        {err}
                      </div>
                    ))}
                  </div>
                </details>
              )} */}
            </div>
          )}

          {/* Progress State */}
          {isGenerating && generationProgress && (
            <div className="p-6 border rounded bg-orange-50">
              <div className="flex flex-col items-center gap-4">
                {/* Spinning Loader */}
                <div className="w-12 h-12 border-t-2 border-b-2 border-[#e65100] rounded-full animate-spin"></div>
                
                {/* Rotating Message */}
                <div className="text-center">
                  <div className="font-medium text-[#e65100] mb-1">
                    <RotatingMessage />
                  </div>
                  <div className="text-sm text-gray-600">
                    {generationProgress.completed}/{generationProgress.total} images
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md">
                  <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
                    <div
                      className="h-full transition-all duration-300 bg-[#e65100]"
                      style={{
                        width: `${(generationProgress.completed / generationProgress.total) * 100}%`
                      }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-center text-gray-600">
                    {Math.round((generationProgress.completed / generationProgress.total) * 100)}% Complete
                  </div>
                </div>

                {/* Current Task */}
                {/* {generationProgress.current_combination && (
                  <div className="text-xs text-center text-gray-600">
                    <div className="font-semibold">{generationProgress.current_mockup}</div>
                    <div className="text-gray-500">{generationProgress.current_engine}</div>
                  </div>
                )} */}
              </div>
            </div>
          )}

          {/* Completed State */}
          {!isGenerating && importData && !hasError && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 border rounded bg-green-50">
                <span className="text-green-600">✅</span>
                <span className="text-sm text-green-700">
                  {importData.generation_summary.total_images_generated} images generated in{" "}
                  {Math.round(importData.generation_summary.total_time_ms / 1000)}s
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-center">
                <div className="p-3 rounded bg-gray-50">
                  <div className="text-xl font-bold" style={{ color: brandColor }}>
                    {importData.mockup_variants.length}
                  </div>
                  <div className="text-gray-600">Variants</div>
                </div>
                <div className="p-3 rounded bg-gray-50">
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
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Download
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isGenerating && !importData && !hasError && (
            <div className="py-6 text-sm text-center text-gray-600">
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
  totalPrice: number; // Add this
}

const MobileBottomTabBar: React.FC<MobileBottomTabBarProps> = ({
  activeTab,
  onTabChange,
  selectedColors,
  selectedSizes,
  uploadedFiles,
  totalPrice,
  layersCount
}) => {
  const tabs = [
    { id: 'product', icon: Package, label: 'Product', count: 1 },
    { id: 'colors', icon: Palette, label: 'Colors', count: selectedColors.length },
    { id: 'sizes', icon: Ruler, label: 'Sizes', count: selectedSizes.length },
    { id: 'upload', icon: Upload, label: 'Upload', count: uploadedFiles.length },
    { id: 'layers', icon: Layers, label: 'Layers', count: layersCount },
    { id: 'pricing', icon: IndianRupee, label: 'Price', count: totalPrice > 0 ? 1 : 0 }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 sm:hidden">
       {/* ðŸ”¥ NEW: Price summary bar */}
        {totalPrice > 0 && (
          <div className="px-4 py-1 border-b border-green-200 bg-green-50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-700">Current Unit Price:</span>
              <span className="font-bold text-green-800">${totalPrice}</span>
            </div>
          </div>
        )}
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
  const [activeTab, setActiveTab] = useState<'product' | 'colors' | 'sizes' | 'upload' | 'library' | 'layers' | 'pricing'>('product');
  const [debugMode, setDebugMode] = useState(false);
  const navigate = useNavigate();
  const designElementsRef = useRef<Record<string, DesignElement[]>>({});
  const prevSelectedIdRef = useRef<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 }); // ADD THIS
  const [isTablet, setIsTablet] = useState(false);

const [alignmentPanelPos, setAlignmentPanelPos] = useState({ x: 500, y: 320 });
const [isDraggingPanel, setIsDraggingPanel] = useState(false);
const dragStartRef = useRef({ x: 0, y: 0, panelX: 0, panelY: 0 });
const panelRef = useRef<HTMLDivElement>(null); // ADD THIS

  // 2. STATE MANAGEMENT SECTION - Add these state variables after existing state declarations

const [pricingData, setPricingData] = useState<Record<string, AreaPricingInfo>>({});
const [totalPrice, setTotalPrice] = useState<number>(0);
const [pricingBreakdown, setPricingBreakdown] = useState<TotalPricingBreakdown | null>(null);
const [showPricingPanel, setShowPricingPanel] = useState(false);
const [priceCalculationLoading, setPriceCalculationLoading] = useState(false);
  
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
  
const [activeSize, setActiveSize] = useState<string>(() => {
  if (productData?.sizeOptions && productData.sizeOptions.length > 0) {
    return productData.sizeOptions[0].sizeName;
  }
  return '';
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

  // useEffect(() => {
  //   const checkIsMobile = () => {
  //     setIsMobile(window.innerWidth < 768);
  //   };
    
  //   checkIsMobile();
  //   window.addEventListener('resize', checkIsMobile);
    
  //   return () => window.removeEventListener('resize', checkIsMobile);
  // }, []);

  useEffect(() => {
  const checkDevice = () => {
    const width = window.innerWidth;
    setIsMobile(width < 768);
    setIsTablet(width >= 768 && width < 1024);  // ✅ Tablet detection
  };
  
  checkDevice();
  window.addEventListener('resize', checkDevice);
  
  return () => window.removeEventListener('resize', checkDevice);
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

  // Create a helper function to determine engine - around line 3900 or wherever makes sense:

  const isProductMockupCompatible = useCallback((): boolean => {
    return !productData?.surfConf?.No_Mockup_Compatible;
  }, [productData]);



const handlePanelMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
  if (isMobile) return;
  
  // Only allow dragging from the drag handle
  const target = e.target as HTMLElement;
  if (!target.closest('[data-drag-handle]')) {
    return;
  }
  
  e.preventDefault();
  e.stopPropagation();
  
  // ðŸ”¥ FIX: Read current position directly from the DOM element instead of state
  const currentLeft = panelRef.current ? parseFloat(panelRef.current.style.left || '0') : alignmentPanelPos.x;
  const currentTop = panelRef.current ? parseFloat(panelRef.current.style.top || '0') : alignmentPanelPos.y;
  
  // Store initial mouse position and CURRENT panel position (not stale state)
  dragStartRef.current = {
    x: e.clientX,
    y: e.clientY,
    panelX: currentLeft,
    panelY: currentTop
  };
  
  setIsDraggingPanel(true);
  
  //console.log('ðŸ”µ Drag started:', dragStartRef.current);
}, [isMobile, alignmentPanelPos]); // Keep alignmentPanelPos as fallback only

const handlePanelMouseMove = useCallback((e: MouseEvent) => {
  if (!isDraggingPanel) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  // Calculate distance moved from start
  const deltaX = e.clientX - dragStartRef.current.x;
  const deltaY = e.clientY - dragStartRef.current.y;
  
  // Calculate new position
  const newX = dragStartRef.current.panelX + deltaX;
  const newY = dragStartRef.current.panelY + deltaY;
  
  // ðŸ”¥ FIX: Get actual panel dimensions from the DOM
  const panelWidth = panelRef.current?.offsetWidth || 250;
  const panelHeight = panelRef.current?.offsetHeight || 200;
  
  // Apply boundaries - allow panel to reach edges but not go off-screen
  const maxX = window.innerWidth - panelWidth - 16; // 16px padding from edge
  const maxY = window.innerHeight - panelHeight - 16;
  
  const boundedX = Math.max(16, Math.min(newX, maxX)); // 16px minimum from left
  const boundedY = Math.max(16, Math.min(newY, maxY)); // 16px minimum from top
  
  // Update position immediately using ref for visual feedback
  if (panelRef.current) {
    panelRef.current.style.left = `${boundedX}px`;
    panelRef.current.style.top = `${boundedY}px`;
  }
  
  // Also update state (debounced effect)
  setAlignmentPanelPos({ x: boundedX, y: boundedY });
}, [isDraggingPanel]);

const handlePanelMouseUp = useCallback((e: MouseEvent) => {
  if (!isDraggingPanel) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  // Calculate final position
  const deltaX = e.clientX - dragStartRef.current.x;
  const deltaY = e.clientY - dragStartRef.current.y;
  
  const finalX = dragStartRef.current.panelX + deltaX;
  const finalY = dragStartRef.current.panelY + deltaY;
  
  const maxX = window.innerWidth - 300;
  const maxY = window.innerHeight - 200;
  
  const boundedX = Math.max(0, Math.min(finalX, maxX));
  const boundedY = Math.max(0, Math.min(finalY, maxY));
  
  setAlignmentPanelPos({ x: boundedX, y: boundedY });
  setIsDraggingPanel(false);
  
  //console.log('ðŸŸ¢ Drag ended at:', { x: boundedX, y: boundedY });
}, [isDraggingPanel]);


  // Add this helper function near your other Canvas.tsx utility functions (around line 500)

const determineRequiredEngine = useCallback((mockup: DynamicMockupPhoto): 'canvas' | 'pixi' => {
  // 1. Check explicit engine setting first
  if (mockup.render?.pfEngine === 'canvas') {
    return 'canvas';
  }
  if (mockup.render?.pfEngine === 'pixi') {
    return 'pixi';
  }
  
  // 2. Check product type - apparel always uses Canvas
  const productType = productData?.productType?.toLowerCase() || '';
  const isApparel = productType.includes('shirt') || 
                   productType.includes('tee') ||
                   productType.includes('apparel') ||
                   productType.includes('hoodie') ||
                   productType.includes('tank') ||
                   productType.includes('clothing');
  
  if (isApparel) {
    return 'canvas';
  }
  
  // 3. Check for ACTIVE advanced features (not just defined properties)
  const hasActivePixiFeatures = !!(
    (mockup.dispMaps?.length && mockup.render?.enableAdvancedEffects) ||
    (mockup.alpMasks?.length && mockup.render?.enableAdvancedEffects) ||
    (mockup.light?.length && mockup.render?.enableAdvancedEffects) ||
    mockup.area?.some(area => 
      (area.surfaceWrapSettings?.enableWrap === true) ||
      (area.perspectiveSettings?.enablePerspective === true) ||
      (area.fbrc?.enableFabricBlend === true) ||
      (area.Config?.enableMasking === true)
    )
  );
  
  return hasActivePixiFeatures ? 'pixi' : 'canvas';
}, [productData]);
  
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

// Helper function to check if mockup generation should be skipped
const shouldSkipMockupGeneration = useCallback((): boolean => {
  // Check if product is not mockup compatible
  if (productData?.surfConf?.No_Mockup_Compatible === true) {
    return true;
  }
  
  // Check if technology is Embroidery or Vinyl/Heat Transfer
  const currentTech = getCurrentTechnology();
  const techName = currentTech?.technologyName?.toLowerCase().trim() || '';
  
  // List of technologies that don't support mockup generation
  const unsupportedTechnologies = [
    'embroidery',
    'vinyl/heat transfer'
  ];
  
  return unsupportedTechnologies.some(tech => techName === tech);
}, [productData, getCurrentTechnology]);

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
  
  // Add null/undefined check for targetArea
  if (!technology || !targetArea) return null;
  
  // Normalize the target area name once
  const normalizedTarget = targetArea.toLowerCase().trim();
  
  return technology.custAreas?.find((area: any) => 
    area.areaName?.toLowerCase()?.trim() === normalizedTarget
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
      // âœ… CORRECT: Use entire design area when no printAreaCoord is defined
      return { 
        x: 0,                      // Start from origin
        y: 0,                      // Start from origin  
        width: canvasConfig.width, // Full canvas width (represents full design area)
        height: canvasConfig.height // Full canvas height (represents full design area)
      };
    }
    
    // When printAreaCoord exists, use it
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
      // âœ… FIXED: Even when photo exists but no printAreaCoord, use full area
      const canvasConfig = getCanvasConfig(areaId);
      return { 
        x: 0, 
        y: 0, 
        width: canvasConfig.width, 
        height: canvasConfig.height 
      };
    }

    // Use the defined printAreaCoord
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
    // âœ… FIXED: Fallback also uses full design area
    return { 
      x: 0, 
      y: 0, 
      width: canvasConfig.width, 
      height: canvasConfig.height 
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
Rotation: ${element.rotation || 0}Â°
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


// 3. HELPER FUNCTIONS SECTION - Add these pricing calculation functions

const getPricingInfoForArea = useCallback((areaId: string): { minimumPrice: number; pricePerSquareInch: number; isFixedPrice: boolean } => {
  try {
    const technology = getCurrentTechnology();
    
    // Try to get area-specific pricing from PayloadCMS
    if (technology?.custAreas) {
      const area = technology.custAreas.find((a: any) => 
        a.areaName.toLowerCase() === areaId.toLowerCase()
      );

      if (area) {
        const minimumPrice = parseFloat(area['Minimum printing price'] || '0');
        const pricePerSquareInch = parseFloat(area['Per sq inch printing price'] || '0');
        
        // //console.log('ðŸ”§ AREA PRICING DATA:', {
        //   areaId,
        //   minimumPrice,
        //   pricePerSquareInch,
        //   hasMinimum: !!area['Minimum printing price'],
        //   hasRate: !!area['Per sq inch printing price']
        //  });

        // Case 1: Has both minimum and rate per sq inch
        if (area['Minimum printing price'] && area['Per sq inch printing price']) {
          return { 
            minimumPrice, 
            pricePerSquareInch, 
            isFixedPrice: false 
          };
        }
        
        // Case 2: Has minimum price but no rate (fixed price model)
        if (area['Minimum printing price'] && !area['Per sq inch printing price']) {
          return { 
            minimumPrice, 
            pricePerSquareInch: 0, 
            isFixedPrice: true 
          };
        }
        
        // Case 3: Has rate but no minimum
        if (!area['Minimum printing price'] && area['Per sq inch printing price']) {
          return { 
            minimumPrice: 0, 
            pricePerSquareInch, 
            isFixedPrice: false 
          };
        }
      }
    }
    
    // Case 4: No area-specific pricing, fallback to product cost
    const productCost = productData?.cost || 0;
    // //console.log('ðŸ”§ FALLBACK TO PRODUCT COST:', {
    //   areaId,
    //   productCost,
    //   reason: 'No area-specific pricing found'
    // });
    
    return { 
      minimumPrice: productCost, 
      pricePerSquareInch: 0, 
      isFixedPrice: true 
    };

  } catch (error) {
    ////console.error('Error getting pricing info for area:', areaId, error);
    
    // Final fallback to product cost
    const productCost = productData?.cost || 100;
    return { 
      minimumPrice: productCost, 
      pricePerSquareInch: 0, 
      isFixedPrice: true 
    };
  }
}, [getCurrentTechnology, productData]);

const calculateElementRealWorldDimensions = useCallback((element: DesignElement, areaId: string) => {
  const canvasConfig = getCanvasConfig(areaId);
  const printableArea = getPrintableAreaFromPhoto(areaId); // Design area bounds
  
  // ðŸ”§ FIXED: Calculate only the area within design boundaries
  const elementLeft = element.x;
  const elementTop = element.y;
  const elementRight = element.x + element.width;
  const elementBottom = element.y + element.height;
  
  const designLeft = printableArea.x;
  const designTop = printableArea.y;
  const designRight = printableArea.x + printableArea.width;
  const designBottom = printableArea.y + printableArea.height;
  
  // Calculate intersection (only the part within design area)
  const intersectionLeft = Math.max(elementLeft, designLeft);
  const intersectionTop = Math.max(elementTop, designTop);
  const intersectionRight = Math.min(elementRight, designRight);
  const intersectionBottom = Math.min(elementBottom, designBottom);
  
  // If no intersection, area is 0
  if (intersectionLeft >= intersectionRight || intersectionTop >= intersectionBottom) {
    return {
      widthInches: 0,
      heightInches: 0,
      xInches: 0,
      yInches: 0,
      areaSquareInches: 0
    };
  }
  
  // Calculate dimensions of intersection area only
  const intersectionWidth = intersectionRight - intersectionLeft;
  const intersectionHeight = intersectionBottom - intersectionTop;
  
  const widthInches = (intersectionWidth / printableArea.width) * canvasConfig.realWorldWidth;
  const heightInches = (intersectionHeight / printableArea.height) * canvasConfig.realWorldHeight;
  const xInches = ((intersectionLeft - printableArea.x) / printableArea.width) * canvasConfig.realWorldWidth;
  const yInches = ((intersectionTop - printableArea.y) / printableArea.height) * canvasConfig.realWorldHeight;
  const areaSquareInches = widthInches * heightInches;

  // //console.log('ðŸ”§ INTERSECTION CALCULATION:', {
  //   elementBounds: `${elementLeft},${elementTop} to ${elementRight},${elementBottom}`,
  //   designBounds: `${designLeft},${designTop} to ${designRight},${designBottom}`,
  //   intersectionBounds: `${intersectionLeft},${intersectionTop} to ${intersectionRight},${intersectionBottom}`,
  //   intersectionSize: `${intersectionWidth}x${intersectionHeight}`,
  //   areaSquareInches,
  //   maxPossible: 320
  // });

  return {
    widthInches: Number(widthInches.toFixed(3)),
    heightInches: Number(heightInches.toFixed(3)),
    xInches: Number(xInches.toFixed(3)),
    yInches: Number(yInches.toFixed(3)),
    areaSquareInches: Number(areaSquareInches.toFixed(3))
  };
}, [getCanvasConfig, getPrintableAreaFromPhoto]);

const calculateAreaPricing = useCallback((areaId: string): AreaPricingInfo => {
  const elements = designElements[areaId] || [];
  const visibleElements = elements
    .filter(element => element.visible !== false)
    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)); // Sort by z-index (bottom to top)
  
  const { minimumPrice, pricePerSquareInch, isFixedPrice } = getPricingInfoForArea(areaId);
  
  const canvasConfig = getCanvasConfig(areaId);
  const printableArea = getPrintableAreaFromPhoto(areaId);
  const totalDesignAreaAvailable = canvasConfig.realWorldWidth * canvasConfig.realWorldHeight;

  // 🔥 FIXED: Precise area calculation with overlap detection using analytical geometry
  const calculateVisibleAreas = () => {
    if (visibleElements.length === 0) return { totalArea: 0, elementAreas: [] };
    if (visibleElements.length === 1) {
      const dims = calculateElementRealWorldDimensions(visibleElements[0], areaId);
      return { 
        totalArea: dims.areaSquareInches, 
        elementAreas: [{ element: visibleElements[0], visibleArea: dims.areaSquareInches }] 
      };
    }

    // Get all element rectangles
    const elementRects = visibleElements.map(element => {
      const dims = calculateElementRealWorldDimensions(element, areaId);
      return {
        element,
        x: dims.xInches,
        y: dims.yInches,
        width: dims.widthInches,
        height: dims.heightInches,
        area: dims.areaSquareInches
      };
    }).filter(rect => rect.area > 0); // Skip zero-area elements

    // Helper function to calculate intersection area between two rectangles
    const getIntersectionArea = (rect1: any, rect2: any): number => {
      const x1 = Math.max(rect1.x, rect2.x);
      const y1 = Math.max(rect1.y, rect2.y);
      const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
      const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);
      
      if (x2 <= x1 || y2 <= y1) return 0; // No intersection
      
      return (x2 - x1) * (y2 - y1);
    };

    // Calculate total area using inclusion-exclusion principle for rectangles
    // Start with sum of all individual areas
    let totalArea = elementRects.reduce((sum, rect) => sum + rect.area, 0);

    // Subtract all pairwise intersections (overlaps counted once, not twice)
    for (let i = 0; i < elementRects.length; i++) {
      for (let j = i + 1; j < elementRects.length; j++) {
        const overlapArea = getIntersectionArea(elementRects[i], elementRects[j]);
        if (overlapArea > 0) {
          totalArea -= overlapArea;
        }
      }
    }

    // For triple+ overlaps, this is more complex (inclusion-exclusion principle)
    // But for most practical cases with 2-3 elements, pairwise is sufficient
    // If you have many overlapping elements, we'd need the full inclusion-exclusion

    // Calculate visible area for each element (their actual area within printable region)
    const elementAreas = elementRects.map(rect => {
      return {
        element: rect.element,
        visibleArea: Number(rect.area.toFixed(3))
      };
    });
    
    return {
      totalArea: Number(totalArea.toFixed(3)),
      elementAreas
    };
  };

  const { totalArea: totalCurrentImageArea, elementAreas } = calculateVisibleAreas();
  const elementPricing: AreaPricingInfo['elements'] = [];

  elementAreas.forEach(({ element, visibleArea }) => {
    const currentRealWorldDims = calculateElementRealWorldDimensions(element, areaId);
    const currentAreaSquareInches = currentRealWorldDims.areaSquareInches;

    let elementPrice: number;

    if (isFixedPrice) {
      // Fixed price model - use minimum price regardless of area
      elementPrice = minimumPrice;
    } else {
      // Area-based pricing model - distribute price based on VISIBLE area
      const proportionalShare = totalCurrentImageArea > 0 
        ? (visibleArea / totalCurrentImageArea)
        : 1 / visibleElements.length;
      
      const totalAreaPrice = totalCurrentImageArea * pricePerSquareInch;
      const totalPrice = Math.max(minimumPrice, totalAreaPrice);
      elementPrice = totalPrice * proportionalShare;
    }

    // Calculate original area for reference
    let originalAreaSquareInches = 0;
    if (element.type === 'image') {
      const originalImageWidthInInches = ((element.originalImageWidth || element.width) / printableArea.width) * canvasConfig.realWorldWidth;
      const originalImageHeightInInches = ((element.originalImageHeight || element.height) / printableArea.height) * canvasConfig.realWorldHeight;
      originalAreaSquareInches = originalImageWidthInInches * originalImageHeightInInches;
    } else {
      originalAreaSquareInches = currentAreaSquareInches;
    }

    elementPricing.push({
      elementId: element.id,
      elementName: element.imageName || element.text || `Element ${element.id.slice(-4)}`,
      areaSquareInches: visibleArea, // 🔥 Use visible area instead of total area
      elementPrice: Number(elementPrice.toFixed(2)),
      originalArea: Number(originalAreaSquareInches.toFixed(3)),
      extraArea: Number(Math.max(0, visibleArea - originalAreaSquareInches).toFixed(3))
    });

    element.realWorldDimensions = currentRealWorldDims;
  });

  // Calculate total cost using visible area only
  let totalCost: number;
  if (isFixedPrice) {
    totalCost = minimumPrice;
  } else {
    const calculatedPrice = totalCurrentImageArea * pricePerSquareInch;
    totalCost = Math.max(minimumPrice, calculatedPrice);
  }

  return {
    areaId,
    areaName: areaId.charAt(0).toUpperCase() + areaId.slice(1),
    minimumPrice,
    pricePerSquareInch,
    designAreaSquareInches: Number(totalDesignAreaAvailable.toFixed(3)),
    currentImageArea: Number(totalCurrentImageArea.toFixed(3)),
    calculatedPrice: Number(totalCost.toFixed(2)),
    finalPrice: Number(totalCost.toFixed(2)),
    elements: elementPricing
  };
}, [designElements, getPricingInfoForArea, calculateElementRealWorldDimensions, getCanvasConfig, getPrintableAreaFromPhoto]);

const calculateTotalPricing = useCallback((): TotalPricingBreakdown => {
  setPriceCalculationLoading(true);
  
  const areas: Record<string, AreaPricingInfo> = {};
  let totalDesignArea = 0;
  let totalElements = 0;
  let basePrintingCost = 0;

  // Calculate pricing for each area with visible elements
  Object.keys(designElements).forEach(areaId => {
    const elements = designElements[areaId] || [];
    const visibleElements = elements.filter(element => element.visible !== false);
    
    if (visibleElements.length > 0) {
      const areaPricing = calculateAreaPricing(areaId);
      areas[areaId] = areaPricing;
      totalDesignArea += areaPricing.designAreaSquareInches;
      totalElements += visibleElements.length;
      basePrintingCost += areaPricing.finalPrice;
    }
  });

  // Get product cost and additional fees
  const blankProductCost = productData?.cost || 0;
  const additionalCosts = productData?.additionalCosts || {};
  const setupFee = parseFloat(additionalCosts.setupFee || '0');
  const technologyFee = parseFloat(additionalCosts.rushSurcharge || '0');
  
  // NEW: Get GST percentages and shipping charges
  const printingGSTPercent = parseFloat(additionalCosts.printingGST || '0');
  const productGSTPercent = parseFloat(productData?.['GST Cost'] || '0');
  const shippingCharges = parseFloat(productData?.shippingInfo?.shippingCharges || '0');
  
  // NEW: Calculate GST amounts
  const printingGSTAmount = printingGSTPercent > 0 ? (basePrintingCost * printingGSTPercent / 100) : 0;
  const productGSTAmount = productGSTPercent > 0 ? (blankProductCost * productGSTPercent / 100) : 0;

  // Calculate final price including GST and shipping
  const finalPrice = basePrintingCost + printingGSTAmount + blankProductCost + productGSTAmount + setupFee + technologyFee + shippingCharges;

  const calculation: PricingCalculation = {
    subtotal: basePrintingCost,
    setupFee,
    technologyFee,
    printingGSTAmount: Number(printingGSTAmount.toFixed(2)),
    productGSTAmount: Number(productGSTAmount.toFixed(2)),
    shippingCharges: Number(shippingCharges.toFixed(2)),
    totalBeforeMarkup: basePrintingCost + printingGSTAmount + blankProductCost + productGSTAmount + setupFee + technologyFee + shippingCharges,
    markup: 0,
    finalTotal: Number(finalPrice.toFixed(2))
  };

  const breakdown: TotalPricingBreakdown = {
    areas,
    calculation,
    technology: activeTechnology,
    totalElements,
    totalDesignArea: Number(totalDesignArea.toFixed(3)),
    priceBreakdown: {
      basePrintingCost: Number(basePrintingCost.toFixed(2)),
      blankProductCost: Number(blankProductCost.toFixed(2)),
      printingGSTAmount: Number(printingGSTAmount.toFixed(2)),
      productGSTAmount: Number(productGSTAmount.toFixed(2)),
      setupFees: setupFee,
      additionalCosts: technologyFee,
      shippingCharges: Number(shippingCharges.toFixed(2)),
      markup: 0,
      finalPrice: Number(finalPrice.toFixed(2))
    }
  };

  setPriceCalculationLoading(false);
  return breakdown;
}, [designElements, calculateAreaPricing, productData, activeTechnology]);

const updatePricingData = useCallback(() => {
  const breakdown = calculateTotalPricing();
  setPricingBreakdown(breakdown);
  setPricingData(breakdown.areas);
  setTotalPrice(breakdown.calculation.finalTotal);
}, [calculateTotalPricing]);


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
    
    // //console.log(`ðŸŽ¯ CANVAS CAPTURE: Starting capture for ${areaId}`, {
    //   canvasConfig,
    //   hasCanvasImage: !!canvasImage,
    //   visibleElements: visibleElements.length,
    //   printableArea
    // });
    
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
      ////console.log(`ðŸŽ¯ CANVAS CAPTURE: Adding t-shirt template with color ${activeColor}`);
      
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
        ////console.log(`ðŸŽ¯ CANVAS CAPTURE: Adding clipped image element ${element.id}`);
        
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
        ////console.log(`ðŸŽ¯ CANVAS CAPTURE: Adding clipped text element ${element.id}`);
        
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
    
    // //console.log(`ðŸŽ¯ CANVAS CAPTURE: Successfully captured ${areaId}`, {
    //   dataUrlLength: dataURL.length,
    //   hasBackground: !!canvasImage,
    //   clippedElements: visibleElements.length
    // });
    
    // Cleanup
    tempStage.destroy();
    
    return dataURL;
    
  } catch (error) {
    ////console.error(`ðŸŽ¯ CANVAS CAPTURE: Error capturing area ${areaId}:`, error);
    return null;
  }
}, [getCanvasConfig, getPrintableAreaFromPhoto, designElements, activeColor, canvasImages]);


const generateDetailedAreaAnalysis = useCallback(() => {
  const detailedAnalysis = {
    total_design_area_available: 0,
    current_image_area_used: 0,
    area_utilization_percentage: 0,
    all_available_areas: availableAreas,
    areas_with_elements: [],
    areas_without_elements: [],
    detailed_areas_breakdown: {},
    element_details: {},
    area_summary: {}
  };

  // Process each available area
  availableAreas.forEach(areaId => {
    const elements = designElements[areaId] || [];
    const visibleElements = elements.filter(element => element.visible !== false);
    const canvasConfig = getCanvasConfig(areaId);
    const printableArea = getPrintableAreaFromPhoto(areaId);
    
    // Calculate area-level metrics
    const areaDesignAvailable = canvasConfig.realWorldWidth * canvasConfig.realWorldHeight;
    let areaCurrentImageUsed = 0;
    const elementDetails = [];

    // Process each element in this area
    visibleElements.forEach((element, index) => {
      const realWorldDims = calculateElementRealWorldDimensions(element, areaId);
      areaCurrentImageUsed += realWorldDims.areaSquareInches;

      // Calculate element-specific details
      const elementDetail = {
        element_id: element.id,
        element_name: element.imageName || element.text || `Element ${index + 1}`,
        element_type: element.type,
        
        // ðŸ”¥ NEW: Physical dimensions in inches
        physical_dimensions: {
          width_inches: Number(realWorldDims.widthInches.toFixed(3)),
          height_inches: Number(realWorldDims.heightInches.toFixed(3)),
          area_square_inches: Number(realWorldDims.areaSquareInches.toFixed(3)),
          position_x_inches: Number(realWorldDims.xInches.toFixed(3)),
          position_y_inches: Number(realWorldDims.yInches.toFixed(3))
        },
        
        // ðŸ”¥ NEW: Pixel dimensions
        pixel_dimensions: {
          width_pixels: Math.round(element.width),
          height_pixels: Math.round(element.height),
          position_x_pixels: Math.round(element.x),
          position_y_pixels: Math.round(element.y)
        },
        
        // ðŸ”¥ NEW: Original image information
        original_image_info: {
          original_width_pixels: element.originalImageWidth || element.width,
          original_height_pixels: element.originalImageHeight || element.height,
          original_area_pixels: (element.originalImageWidth || element.width) * (element.originalImageHeight || element.height),
          original_aspect_ratio: Number(((element.originalImageWidth || element.width) / (element.originalImageHeight || element.height)).toFixed(3))
        },
        
        // ðŸ”¥ NEW: Transformation details (including rotation)
        transformations: {
          rotation_degrees: Number((element.rotation || 0).toFixed(2)),
          scale_x: Number((element.scaleX || 1).toFixed(3)),
          scale_y: Number((element.scaleY || 1).toFixed(3)),
          opacity: Number((element.opacity || 1).toFixed(2)),
          is_rotated: Math.abs(element.rotation || 0) > 0.1,
          is_scaled: Math.abs((element.scaleX || 1) - 1) > 0.01 || Math.abs((element.scaleY || 1) - 1) > 0.01
        },
        
        // ðŸ”¥ NEW: Quality and DPI information
        print_quality: (() => {
          const dpiInfo = calculateDPI(element);
          return {
            dpi: dpiInfo.dpi,
            quality_rating: dpiInfo.quality,
            quality_color: dpiInfo.color,
            is_print_ready: dpiInfo.quality !== 'Poor'
          };
        })(),
        
        // ðŸ”¥ NEW: Area utilization for this element
        area_utilization: {
          design_area_consumed_percentage: Number(((realWorldDims.areaSquareInches / areaDesignAvailable) * 100).toFixed(2)),
          printable_area_consumed_percentage: Number(((realWorldDims.areaSquareInches / (printableArea.width * printableArea.height / (canvasConfig.width * canvasConfig.height) * areaDesignAvailable)) * 100).toFixed(2))
        },
        
        // ðŸ”¥ NEW: Positioning information
        positioning: {
          is_centered_horizontally: Math.abs((element.x + element.width/2) - (printableArea.x + printableArea.width/2)) < 5,
          is_centered_vertically: Math.abs((element.y + element.height/2) - (printableArea.y + printableArea.height/2)) < 5,
          distance_from_edges: {
            top: Math.round(element.y - printableArea.y),
            bottom: Math.round((printableArea.y + printableArea.height) - (element.y + element.height)),
            left: Math.round(element.x - printableArea.x),
            right: Math.round((printableArea.x + printableArea.width) - (element.x + element.width))
          }
        },
        
        // ðŸ”¥ NEW: State information
        state: {
          visible: element.visible !== false,
          locked: element.locked || false,
          selected: element.selected || false,
          z_index: element.zIndex || 0,
          has_base64: !!element.imageBase64
        }
      };
      
      elementDetails.push(elementDetail);
    });

    // Calculate area utilization
    const areaUtilization = areaDesignAvailable > 0 ? (areaCurrentImageUsed / areaDesignAvailable) * 100 : 0;
    
    // Determine if area has elements
    if (visibleElements.length > 0) {
      detailedAnalysis.areas_with_elements.push(areaId);
    } else {
      detailedAnalysis.areas_without_elements.push(areaId);
    }
    
    // Store detailed breakdown for this area
    detailedAnalysis.detailed_areas_breakdown[areaId] = {
      area_id: areaId,
      area_name: areaId.charAt(0).toUpperCase() + areaId.slice(1),
      has_elements: visibleElements.length > 0,
      
      // ðŸ”¥ NEW: Area capacity information
      capacity: {
        design_area_available_sq_inches: Number(areaDesignAvailable.toFixed(3)),
        current_image_area_used_sq_inches: Number(areaCurrentImageUsed.toFixed(3)),
        remaining_area_sq_inches: Number((areaDesignAvailable - areaCurrentImageUsed).toFixed(3)),
        utilization_percentage: Number(areaUtilization.toFixed(2))
      },
      
      // ðŸ”¥ NEW: Canvas and printable area info
      area_specifications: {
        canvas_width_pixels: canvasConfig.width,
        canvas_height_pixels: canvasConfig.height,
        canvas_width_inches: canvasConfig.realWorldWidth,
        canvas_height_inches: canvasConfig.realWorldHeight,
        printable_area: {
          x_pixels: printableArea.x,
          y_pixels: printableArea.y,
          width_pixels: printableArea.width,
          height_pixels: printableArea.height,
          x_inches: Number(((printableArea.x / canvasConfig.width) * canvasConfig.realWorldWidth).toFixed(3)),
          y_inches: Number(((printableArea.y / canvasConfig.height) * canvasConfig.realWorldHeight).toFixed(3)),
          width_inches: Number(((printableArea.width / canvasConfig.width) * canvasConfig.realWorldWidth).toFixed(3)),
          height_inches: Number(((printableArea.height / canvasConfig.height) * canvasConfig.realWorldHeight).toFixed(3))
        }
      },
      
      // ðŸ”¥ NEW: Element statistics
      element_statistics: {
        total_elements: elements.length,
        visible_elements: visibleElements.length,
        hidden_elements: elements.length - visibleElements.length,
        image_elements: visibleElements.filter(el => el.type === 'image').length,
        text_elements: visibleElements.filter(el => el.type === 'text').length,
        rotated_elements: visibleElements.filter(el => Math.abs(el.rotation || 0) > 0.1).length,
        scaled_elements: visibleElements.filter(el => Math.abs((el.scaleX || 1) - 1) > 0.01 || Math.abs((el.scaleY || 1) - 1) > 0.01).length
      },
      
      // ðŸ”¥ NEW: Individual elements in this area
      elements: elementDetails
    };
    
    // Store element details
    detailedAnalysis.element_details[areaId] = elementDetails;
    
    // Add to totals
    detailedAnalysis.total_design_area_available += areaDesignAvailable;
    detailedAnalysis.current_image_area_used += areaCurrentImageUsed;
  });

  // Calculate overall utilization
  detailedAnalysis.area_utilization_percentage = detailedAnalysis.total_design_area_available > 0 
    ? Number(((detailedAnalysis.current_image_area_used / detailedAnalysis.total_design_area_available) * 100).toFixed(2))
    : 0;

  // Create area summary
  detailedAnalysis.area_summary = {
    total_areas: availableAreas.length,
    areas_with_content: detailedAnalysis.areas_with_elements.length,
    areas_empty: detailedAnalysis.areas_without_elements.length,
    total_elements_across_all_areas: Object.values(designElements).flat().length,
    total_visible_elements: Object.values(designElements).flat().filter(el => el.visible !== false).length,
    most_utilized_area: (() => {
      let maxUtilization = 0;
      let mostUtilizedArea = null;
      
      Object.values(detailedAnalysis.detailed_areas_breakdown).forEach(area => {
        if (area.capacity.utilization_percentage > maxUtilization) {
          maxUtilization = area.capacity.utilization_percentage;
          mostUtilizedArea = area.area_id;
        }
      });
      
      return mostUtilizedArea;
    })(),
    design_complexity_score: (() => {
      // Calculate complexity based on number of elements, transformations, etc.
      const totalElements = Object.values(detailedAnalysis.element_details).flat().length;
      const rotatedElements = Object.values(detailedAnalysis.element_details).flat().filter(el => el.transformations.is_rotated).length;
      const scaledElements = Object.values(detailedAnalysis.element_details).flat().filter(el => el.transformations.is_scaled).length;
      
      return {
        total_elements: totalElements,
        complexity_factors: {
          has_rotations: rotatedElements > 0,
          has_scaling: scaledElements > 0,
          multi_area_design: detailedAnalysis.areas_with_elements.length > 1,
          high_utilization: detailedAnalysis.area_utilization_percentage > 70
        },
        complexity_rating: (() => {
          let score = 0;
          if (totalElements > 5) score += 1;
          if (rotatedElements > 0) score += 1;
          if (scaledElements > 0) score += 1;
          if (detailedAnalysis.areas_with_elements.length > 1) score += 1;
          if (detailedAnalysis.area_utilization_percentage > 70) score += 1;
          
          if (score >= 4) return 'Complex';
          if (score >= 2) return 'Moderate';
          return 'Simple';
        })()
      };
    })()
  };

  ////console.log('ðŸ”§ Generated detailed area analysis:', detailedAnalysis);
  return detailedAnalysis;
}, [availableAreas, designElements, getCanvasConfig, getPrintableAreaFromPhoto, calculateElementRealWorldDimensions, calculateDPI]);


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
      description += `   Rotation: ${element.transformations.rotation}Â°\n`;
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
        ////console.error(`Error exporting canvas image for area ${areaId}:`, error);
      }
    }
  });
  
  return canvasImages;
}, [designElements, captureCanvasImageForArea, generateCanvasMetadata, generateDetailedDescription]);

const renderTechnologySelector = () => {
  const currentTech = getCurrentTechnology();
  const hasElements = Object.values(designElements).some(elements => 
    elements.some(element => element.visible !== false)
  );
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium tracking-wider text-gray-500 uppercase">
          Current Technology
        </label>
        <span className="px-2 py-1 text-xs font-medium text-white rounded" style={{ backgroundColor: brandColor }}>
          Active
        </span>
      </div>
      
      <div className="space-y-2">
        <select
          value={activeTechnology}
          onChange={(e) => handleTechnologyChange(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 touch-manipulation"
          disabled={priceCalculationLoading}
        >
          {productData?.printT?.map((tech: any) => (
            <option key={tech.id} value={tech.id}>
              {tech.technologyName.toUpperCase()}
            </option>
          ))}
        </select>
        
        {priceCalculationLoading && (
          <div className="flex items-center gap-2 text-xs text-orange-600">
            <div className="w-3 h-3 border-b-2 border-orange-500 rounded-full animate-spin"></div>
            <span>Updating pricing...</span>
          </div>
        )}
      </div>
      
      {/* Technology Pricing Info */}
      {/* {currentTech && (
        <div className="p-2 text-xs rounded bg-gray-50">
          <div className="mb-1 font-medium text-gray-700">
            {currentTech.technologyName} - Pricing Info
          </div>
          
          {currentTech.custAreas?.map((area: any) => (
            <div key={area.id} className="flex justify-between py-1">
              <span className="text-gray-600">{area.areaName}:</span>
              <span className="text-gray-800">
                Rs.{area['Minimum printing price'] || 'N/A'} min, 
                Rs.{area['Per sq inch printing price'] || 'N/A'}/sq"
              </span>
            </div>
          ))}
          
          {hasElements && pricingBreakdown && (
            <div className="pt-2 mt-2 border-t border-gray-200">
              <div className="flex justify-between font-medium">
                <span>Current Design Cost:</span>
                <span className="text-green-600">Rs.{totalPrice}</span>
              </div>
            </div>
          )}
        </div>
      )} */}
      
      {/* Technology Change Warning */}
      {hasElements && (
        <div className="p-2 text-xs border rounded bg-amber-50 border-amber-200">
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-amber-400 rounded-full flex-shrink-0 mt-0.5"></div>
            <div>
              <div className="font-medium text-amber-800">Note:</div>
              <div className="text-amber-700">
                Changing technology will recalculate all pricing based on new rates and minimums.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Remove the standalone PricingPanel component entirely and add this inside EnhancedCanvas:

const renderPricingPanel = () => {
  if (!pricingBreakdown) {
    return (
      <div className="space-y-4">
        <div className="p-8 text-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-orange-50">
            <Calculator className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-800">Pricing Calculator</h3>
          <p className="text-sm text-gray-600">Add design elements to see pricing breakdown</p>
        </div>
      </div>
    );
  }

  const { areas, calculation, priceBreakdown } = pricingBreakdown;

  return (
    <div className="space-y-4">
      {/* Header with Loading State */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Pricing Summary</h3>
          <p className="text-xs text-gray-500">Real-time calculation</p>
        </div>
        {priceCalculationLoading && (
          <div className="flex items-center gap-2 text-xs text-orange-600">
            <div className="w-4 h-4 border-b-2 border-orange-500 rounded-full animate-spin"></div>
            <span>Calculating...</span>
          </div>
        )}
      </div>

      {/* Final Price Card - Prominent */}
      <div className="relative p-5 overflow-hidden border-2 border-green-300 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 bg-green-200 rounded-full opacity-20"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Final Price per Unit</span>
            <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
              <CheckCircle size={12} />
              Ready
            </div>
          </div>
          <div className="text-3xl font-bold text-green-800">
            Rs.{priceBreakdown.finalPrice}
          </div>
          <p className="mt-1 text-xs text-green-600">
            Technology: {getCurrentTechnology()?.technologyName || activeTechnology}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-orange-50">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center w-6 h-6 bg-orange-100 rounded">
              <Layers size={14} className="text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-700">Elements</span>
          </div>
          <div className="text-xl font-bold text-orange-800">{pricingBreakdown.totalElements}</div>
        </div>
        
        <div className="p-3 rounded-lg bg-orange-50">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center w-6 h-6 bg-orange-100 rounded">
              <Ruler size={14} className="text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-700">Design Area</span>
          </div>
          <div className="text-xl font-bold text-orange-800">{pricingBreakdown.totalDesignArea}&quot;</div>
        </div>
      </div>

      {/* Areas Breakdown - Collapsible */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 bg-gray-100 rounded">
            <Package size={12} className="text-gray-600" />
          </div>
          <h4 className="text-sm font-semibold text-gray-800">Design Areas</h4>
          <span className="text-xs text-gray-500">({Object.keys(areas).length} areas)</span>
        </div>
        
        {Object.values(areas).map(area => (
          <details key={area.areaId} className="overflow-hidden border border-gray-200 rounded-lg group bg-gray-50">
            <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100">
              <div className="flex items-center gap-2">
                {/* <ChevronDown size={16} className="text-gray-400 transition-transform group-open:rotate-180" /> */}
                <span className="font-medium text-gray-900">{area.areaName}</span>
                <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-200 rounded-full">
                  {area.elements.length} element{area.elements.length !== 1 ? 's' : ''}
                </span>
              </div>
              <span className="text-base font-bold text-green-600">
                Rs.{area.finalPrice}
              </span>
            </summary>
            
            {/* <div className="p-3 space-y-3 bg-white border-t">
              Area Statistics 
              <div className="grid grid-cols-2 gap-2 p-2 rounded bg-gray-50">
                <div>
                  <div className="text-xs text-gray-500">Available Area</div>
                  <div className="font-semibold text-gray-800">{area.designAreaSquareInches}&quot; sq</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Used Area</div>
                  <div className="font-semibold text-orange-600">{area.currentImageArea}&quot; sq</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Rate</div>
                  <div className="font-semibold text-gray-800">Rs.{area.pricePerSquareInch}/sq&quot;</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Minimum</div>
                  <div className="font-semibold text-gray-800">Rs.{area.minimumPrice}</div>
                </div>
              </div>

               Price Calculation Formula 
              <div className="p-2 border-l-2 border-orange-400 rounded bg-orange-50">
                <div className="mb-1 text-xs font-medium text-orange-700">Calculation</div>
                <div className="font-mono text-xs text-orange-900">
                  max(Rs.{area.minimumPrice}, {area.currentImageArea}&quot; Ã— Rs.{area.pricePerSquareInch})
                </div>
                <div className="mt-1 text-xs text-orange-600">
                  = Rs.{area.finalPrice}
                </div>
              </div>

               Elements Breakdown 
              {area.elements.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700">Elements:</div>
                  {area.elements.map(element => (
                    <div key={element.elementId} className="p-2 bg-white border rounded">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{element.elementName}</div>
                          <div className="text-xs text-gray-500">Area: {element.areaSquareInches}&quot; sq</div>
                        </div>
                        <div className="text-sm font-bold text-green-600 whitespace-nowrap">
                          Rs.{element.elementPrice}
                        </div>
                      </div>
                      
                      {element.extraArea > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 text-xs text-orange-700 rounded bg-orange-50">
                          <Info size={12} />
                          Expanded by +{element.extraArea}&quot; sq from original
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div> */}
          </details>
        ))}
      </div>

      {/* Cost Breakdown */}
      <div className="p-4 space-y-3 bg-white border-2 border-gray-200 rounded-xl">
        <div className="flex items-center gap-2 pb-2 border-b">
          <IndianRupee size={16} className="text-gray-700" />
          <h4 className="text-sm font-semibold text-gray-800">Cost Breakdown</h4>
        </div>
        
        <div className="space-y-2 text-sm">
          {/* Printing Costs */}
          <div className="p-2 space-y-1 rounded bg-orange-50">
            <div className="flex justify-between font-medium text-orange-800">
              <span>Base Printing</span>
              <span>Rs.{priceBreakdown.basePrintingCost}</span>
            </div>
            {priceBreakdown.printingGSTAmount > 0 && (
              <div className="flex justify-between pl-4 text-xs text-orange-600">
                <span>+ GST ({productData?.additionalCosts?.printingGST}%)</span>
                <span>Rs.{priceBreakdown.printingGSTAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Product Cost */}
          <div className="p-2 space-y-1 rounded bg-orange-50">
            <div className="flex justify-between font-medium text-orange-800">
              <span>Blank Product</span>
              <span>Rs.{priceBreakdown.blankProductCost}</span>
            </div>
            {priceBreakdown.productGSTAmount > 0 && (
              <div className="flex justify-between pl-4 text-xs text-orange-600">
                <span>+ GST ({productData?.['GST Cost']}%)</span>
                <span>Rs.{priceBreakdown.productGSTAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Additional Costs */}
          {(priceBreakdown.setupFees > 0 || priceBreakdown.additionalCosts > 0 || priceBreakdown.shippingCharges > 0) && (
            <div className="p-2 space-y-1 rounded bg-gray-50">
              {priceBreakdown.setupFees > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Setup Fees</span>
                  <span>Rs.{priceBreakdown.setupFees}</span>
                </div>
              )}
              {priceBreakdown.additionalCosts > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Additional Costs</span>
                  <span>Rs.{priceBreakdown.additionalCosts}</span>
                </div>
              )}
              {priceBreakdown.shippingCharges > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>Rs.{priceBreakdown.shippingCharges}</span>
                </div>
              )}
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between pt-3 text-base font-bold text-green-800 border-t-2 border-green-300">
            <span>Total per Unit</span>
            <span>Rs.{priceBreakdown.finalPrice}</span>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="flex items-start gap-2 p-3 border border-orange-200 rounded-lg bg-orange-50">
        <Info size={14} className="flex-shrink-0 mt-0.5 text-orange-600" />
        <p className="text-xs text-orange-700">
          Pricing updates automatically when you modify designs. Final price includes all taxes and fees.
        </p>
      </div>
    </div>
  );
};

// ðŸ”¥ NEW: Enhanced technology change handler
const handleTechnologyChange = useCallback((newTechnologyId: string) => {
  ////console.log('Technology changing from:', activeTechnology, 'to:', newTechnologyId);
  
  // Store current pricing data before change
  const previousPricingData = pricingBreakdown;
  
  // Set loading state
  setPriceCalculationLoading(true);
  
  // Clear current pricing data
  setPricingData({});
  setTotalPrice(0);
  setPricingBreakdown(null);
  
  // Update active technology
  setActiveTechnology(newTechnologyId);
  
  // Get new technology info for validation
  const newTechnology = productData?.printT?.find((tech: any) => 
    tech.id === newTechnologyId || tech.technologyName === newTechnologyId
  );
  
  if (!newTechnology) {
    ////console.error('Technology not found:', newTechnologyId);
    setPriceCalculationLoading(false);
    return;
  }
  
  ////console.log('New technology loaded:', newTechnology.technologyName);
  
  // Update available areas for new technology
  const newAreas = getAvailableAreas();
  
  // Check if current active area exists in new technology
  if (!newAreas.includes(activeArea) && newAreas.length > 0) {
    ////console.log('Active area not available in new technology, switching to:', newAreas[0]);
    setActiveArea(newAreas[0]);
  }
  
  // Show pricing comparison if there were previous calculations
  if (previousPricingData && previousPricingData.totalElements > 0) {
    ////console.log('Previous pricing data exists - will show comparison after recalculation');
  }
  
  // Recalculate pricing after technology data is loaded
  setTimeout(() => {
    const hasElements = Object.values(designElements).some(elements => 
      elements.some(element => element.visible !== false)
    );
    
    if (hasElements) {
      ////console.log('Recalculating pricing for new technology...');
      
      try {
        updatePricingData();
        
        // Show notification about technology change
        if (isMobile) {
          // For mobile, you might want to show a toast notification
          ////console.log('Technology changed to:', newTechnology.technologyName);
        }
        
      } catch (error) {
        ////console.error('Error recalculating pricing after technology change:', error);
        setPriceCalculationLoading(false);
      }
    } else {
      setPriceCalculationLoading(false);
    }
  }, 800); // Longer delay to ensure all technology data is loaded
  
}, [activeTechnology, productData, getAvailableAreas, activeArea, pricingBreakdown, designElements, updatePricingData, isMobile]);

// ðŸ”¥ NEW: Technology comparison helper
const compareTechnologyPricing = useCallback((tech1Id: string, tech2Id: string) => {
  const tech1 = productData?.printT?.find((tech: any) => tech.id === tech1Id);
  const tech2 = productData?.printT?.find((tech: any) => tech.id === tech2Id);
  
  if (!tech1 || !tech2) {
    return null;
  }
  
  const comparison = {
    tech1: {
      id: tech1.id,
      name: tech1.technologyName,
      areas: tech1.custAreas?.map((area: any) => ({
        name: area.areaName,
        minimumPrice: parseFloat(area['Minimum printing price'] || '0'),
        pricePerSquareInch: parseFloat(area['Per sq inch printing price'] || '0')
      })) || []
    },
    tech2: {
      id: tech2.id,
      name: tech2.technologyName,
      areas: tech2.custAreas?.map((area: any) => ({
        name: area.areaName,
        minimumPrice: parseFloat(area['Minimum printing price'] || '0'),
        pricePerSquareInch: parseFloat(area['Per sq inch printing price'] || '0')
      })) || []
    }
  };
  
  return comparison;
}, [productData]);
  // =====================================
  // ENHANCED STORE IMPORT FUNCTION
  // =============================
  //========
  
    const calculatePriceFromCost = (cost: number): number => {
    const markup = cost * 0.5;
    const baseProfit = 100;
    return Math.round(cost + markup + baseProfit);
  };

 const transformStoreDataForCreate = useCallback((storeData, filteredProductData) => {

  // Extract mockup images based on PayloadCMS flags
const mockupImages = {};
const colorSpecificImages = {};

// 🔥 FIX: Define flags early and with proper fallbacks
const productDataFlags = {
  color_Images: filteredProductData?.color_Images ?? productData?.color_Images ?? false,
  size_Images: filteredProductData?.size_Images ?? productData?.size_Images ?? false
};

//console.log('🔥 Product flags:', productDataFlags);

// Process mockup variants
if (storeData.mockup_variants && Array.isArray(storeData.mockup_variants)) {
  // 🔍 DEBUG: Log the raw mockup variants data BEFORE processing
  // console.log('🔍 RAW MOCKUP VARIANTS DATA:', JSON.stringify(
  //   storeData.mockup_variants.map(mv => ({
  //     id: mv.mockup_id,
  //     title: mv.mockup_title,
  //     viewAngle: mv.view_angle,
  //     hasDesign: mv.has_design_elements,
  //     colorCombosCount: mv.color_combinations?.length,
  //     firstColorHex: mv.color_combinations?.[0]?.color_hex,
  //     firstSizeVariantsCount: mv.color_combinations?.[0]?.size_variants?.length,
  //     firstImageDataPreview: mv.color_combinations?.[0]?.size_variants?.[0]?.generated_images?.[0]?.image_data?.substring(0, 50)
  //   })),
  //   null, 2
  // ));
  
  // 🆕 Track processed mockups by image data hash to prevent true duplicates
  const processedMockups = new Set<string>();
  const seenImageData = new Map<string, string>(); // imageData hash -> unique ID
  
  storeData.mockup_variants.forEach(mockupVariant => {
    if (!mockupVariant?.color_combinations) return;
    
    mockupVariant.color_combinations.forEach(colorCombo => {
      if (!colorCombo) return;
      
      // 🆕 Create unique identifier for this mockup variant
      const mockupUniqueId = `${mockupVariant.mockup_id}_${mockupVariant.view_angle}_${colorCombo.color_hex}`;
      
      // 🆕 Skip if already processed
      if (processedMockups.has(mockupUniqueId)) {
        //console.log(`⏭️  Skipping duplicate: ${mockupUniqueId}`);
        return;
      }
      
      // Mark as processed
      processedMockups.add(mockupUniqueId);
      //console.log(`✅ Processing: ${mockupUniqueId}`);
      
      // Initialize color group if not exists
      if (!colorSpecificImages[colorCombo.color_hex]) {
        colorSpecificImages[colorCombo.color_hex] = [];
      }
      
      // Determine labeling strategy
      const useColorLabels = productDataFlags.color_Images;
      const useSizeLabels = productDataFlags.size_Images;
      
      if (!productDataFlags.size_Images) {
        // Sizes share images
        const firstSizeVariant = colorCombo.size_variants?.[0];
        
        if (firstSizeVariant?.generated_images?.length > 0) {
          const generatedImage = firstSizeVariant.generated_images[0];
          
          // 🆕 CRITICAL: Validate that imageData exists and is not empty
          if (!generatedImage?.image_data || generatedImage.image_data.length < 100) {
            //console.error(`❌ SKIPPING: ${mockupVariant.mockup_title} (${mockupVariant.view_angle}) - Empty or invalid image data`);
            //console.error(`   hasDesign: ${mockupVariant.has_design_elements}`);
            //console.error(`   imageData length: ${generatedImage?.image_data?.length || 0}`);
            return; // Skip this mockup - don't add to colorSpecificImages
          }
          
          // 🆕 CRITICAL: Check if this exact image data already exists for this color
          const imageDataHash = generatedImage.image_data.substring(0, 100); // Use first 100 chars as hash
          const imageKey = `${colorCombo.color_hex}_${imageDataHash}`;
          
          if (seenImageData.has(imageKey)) {
            //console.log(`⏭️  Skipping duplicate image data for ${mockupVariant.mockup_title} (${mockupVariant.view_angle})`);
            //console.log(`   Duplicate of: ${seenImageData.get(imageKey)}`);
            return; // Skip this duplicate image
          }
          
         seenImageData.set(imageKey, mockupUniqueId);
          //console.log(`✅ Adding unique mockup: [${mockupVariant.mockup_title}] view: [${mockupVariant.view_angle}] hasDesign: [${mockupVariant.has_design_elements}]`);
          
          // 🆕 CRITICAL: Create ONE key only - no multiple formats!
          const standardKey = `${mockupVariant.mockup_id}_${mockupVariant.view_angle}_${colorCombo.color_hex}`
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
          
          // Store with ONE key only
          mockupImages[standardKey] = generatedImage.image_data;
          
          //console.log(`📦 Stored with ONE key: [${standardKey}]`);

          // Add to colorSpecificImages (this is what Create page uses)
          colorSpecificImages[colorCombo.color_hex].push({
            mockupId: mockupVariant.mockup_id,
            viewAngle: mockupVariant.view_angle,
            mockupTitle: mockupVariant.mockup_title,
            hasDesign: mockupVariant.has_design_elements,
            areas: mockupVariant.mockup_areas || [],
            imageData: generatedImage.image_data,
            storageKey: standardKey
          });
          
          // Create size-specific keys for compatibility
          if (colorCombo.size_variants) {
            colorCombo.size_variants.forEach(sizeVariant => {
              if (!sizeVariant) return;
              const sizeKey = `${mockupVariant.mockup_title}_${colorCombo.color_name}_${sizeVariant.size_name}`;
              const cleanSizeKey = sizeKey.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
              mockupImages[cleanSizeKey] = generatedImage.image_data;
              
              // 🆕 Store size keys with multiple formats
              const sizeSpaceKey = sizeKey.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
              if (sizeSpaceKey !== cleanSizeKey) {
                mockupImages[sizeSpaceKey] = generatedImage.image_data;
              }
              mockupImages[sizeKey] = generatedImage.image_data;
            });
          }
        }
      } else {
        // Size-specific images
        if (colorCombo.size_variants && Array.isArray(colorCombo.size_variants)) {
          colorCombo.size_variants.forEach(sizeVariant => {
            if (!sizeVariant?.generated_images) return;
            
            sizeVariant.generated_images.forEach((generatedImage) => {
              // 🆕 CRITICAL: Validate that imageData exists
              if (!generatedImage?.image_data || generatedImage.image_data.length < 100) {
                //console.error(`❌ SKIPPING: ${mockupVariant.mockup_title} (${sizeVariant.size_name}) - Empty image data`);
                return;
              }
              
              // 🆕 CRITICAL: Check if this exact image data already exists
              const imageDataHash = generatedImage.image_data.substring(0, 100);
              const imageKey = `${colorCombo.color_hex}_${sizeVariant.size_name}_${imageDataHash}`;
              
              if (seenImageData.has(imageKey)) {
                //console.log(`⏭️  Skipping duplicate image data for ${mockupVariant.mockup_title} (${sizeVariant.size_name})`);
                return;
              }
              
             seenImageData.set(imageKey, mockupUniqueId);
              //console.log(`✅ Adding unique size-specific mockup: [${mockupVariant.mockup_title}] size: [${sizeVariant.size_name}]`);
              
              // 🆕 CRITICAL: ONE key only
              const standardKey = `${mockupVariant.mockup_id}_${mockupVariant.view_angle}_${colorCombo.color_hex}_${sizeVariant.size_name}`
                .toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '');
              
              // Store with ONE key only
              mockupImages[standardKey] = generatedImage.image_data;
              
              //console.log(`📦 Stored with ONE key: [${standardKey}]`);
              
              // Add to colorSpecificImages
              colorSpecificImages[colorCombo.color_hex].push({
                mockupId: mockupVariant.mockup_id,
                viewAngle: mockupVariant.view_angle,
                mockupTitle: `${mockupVariant.mockup_title} (${sizeVariant.size_name})`,
                hasDesign: mockupVariant.has_design_elements,
                areas: mockupVariant.mockup_areas || [],
                imageData: generatedImage.image_data,
                storageKey: standardKey
              });
            });
          });
        }
      }
    });
  });
}

  const designImages = storeData.design_images || [];
  const canvasImages = storeData.canvas_images || [];

  // Extract color details from the calculation breakdown
const colorDetails = storeData.generation_summary?.mockup_calculation?.calculationBreakdown?.map(breakdown => ({
  name: breakdown.color,
  value: breakdown.colorHex
})) || selectedColors.map(color => ({
  name: color.name,
  value: color.value
})) || [];

  // Extract size options - Collect sizes from ALL mockup variants
const allSizesSet = new Set<string>();

if (storeData.mockup_variants && Array.isArray(storeData.mockup_variants)) {
  storeData.mockup_variants.forEach(mockupVariant => {
    // Check mockup_size at the variant level (for size_Images=true)
    if (mockupVariant.mockup_size) {
      allSizesSet.add(mockupVariant.mockup_size);
    }
    
    // Also check color_combinations (fallback for size_Images=false)
    if (mockupVariant.color_combinations && Array.isArray(mockupVariant.color_combinations)) {
      mockupVariant.color_combinations.forEach(colorCombo => {
        if (colorCombo.size_variants && Array.isArray(colorCombo.size_variants)) {
          colorCombo.size_variants.forEach(sizeVariant => {
            if (sizeVariant.size_name) {
              allSizesSet.add(sizeVariant.size_name);
            }
          });
        }
      });
    }
  });
}

const sizeOptions = allSizesSet.size > 0 
  ? Array.from(allSizesSet) 
  : selectedSizes.slice();

//console.log('🔥 Extracted all sizes:', sizeOptions);
  
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
  
  // Clean design elements with base64 data
  const cleanDesignElements = {};
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
        imageBase64: element.imageBase64,
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
  
  // 🆕 IMPROVED: Create color-specific mockup groups with better color matching
  const colorSpecificMockups = Object.keys(colorSpecificImages).map(colorHex => {
    const normalizedColorHex = colorHex.toLowerCase();
    
    let colorMatch = colorDetails.find(c => c.value.toLowerCase() === normalizedColorHex);
    
    if (!colorMatch) {
      colorMatch = colorDetails.find(c => 
        c.value.toLowerCase().replace('#', '') === normalizedColorHex.replace('#', '')
      );
    }
    
    if (!colorMatch && selectedColors.length > 0) {
      colorMatch = selectedColors.find(c => c.value.toLowerCase() === normalizedColorHex);
    }
    
    const colorName = colorMatch?.name || `Color ${colorHex}`;
    
    //console.log(`🎨 Color Mapping: ${colorHex} → ${colorName} (${colorSpecificImages[colorHex].length} mockups)`);
    
    return {
      colorName,
      colorHex,
      mockups: colorSpecificImages[colorHex].map((img, index) => ({
        id: `${colorHex}-mockup-${index}`,
        mockupId: img.mockupId,
        viewAngle: img.viewAngle,
        title: img.mockupTitle,
        hasDesign: img.hasDesign,
        imageData: img.imageData,
        storageKey: img.storageKey  // 🆕 Include the storage key
      })),
      imageCount: colorSpecificImages[colorHex].length
    };
  });
  
  // console.log('✅ Final color-specific mockups:', colorSpecificMockups.map(c => ({
  //   name: c.colorName,
  //   hex: c.colorHex,
  //   mockupCount: c.imageCount,
  //   mockups: c.mockups.map(m => ({ 
  //     viewAngle: m.viewAngle, 
  //     hasDesign: m.hasDesign,
  //     hasImageData: m.imageData?.length > 100
  //   }))
  // })));
  
  const designData = {
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
      // mockupPreviews: mockupImages,
      colorSpecificMockups: colorSpecificMockups,
      designImages: designImages
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
    canvasImages,
    enhancedProductData,
    filteredProductData,
    
    // Include calculated data in transformed result
    pricingData: storeData.pricing_data || null,
    availableMockups: storeData.available_mockups || null,
    imageAreaAnalysis: storeData.image_area_analysis || null,
    
    // Enhanced area analysis data
    detailedAreaAnalysis: storeData.detailed_area_analysis,
    enhancedImageAreaAnalysis: storeData.image_area_analysis,
    
    // Quick access design metrics for Create component
    designMetrics: {
      totalDesignAreaAvailable: storeData.detailed_area_analysis?.total_design_area_available || 0,
      currentImageAreaUsed: storeData.detailed_area_analysis?.current_image_area_used || 0,
      utilizationPercentage: storeData.detailed_area_analysis?.area_utilization_percentage || 0,
      complexityRating: storeData.detailed_area_analysis?.area_summary?.design_complexity_score?.complexity_rating || 'Simple',
      areasWithElements: storeData.detailed_area_analysis?.areas_with_elements || [],
      areasWithoutElements: storeData.detailed_area_analysis?.areas_without_elements || [],
      totalElements: storeData.detailed_area_analysis?.area_summary?.total_elements_across_all_areas || 0,
      
      // Per-area breakdown for Create component
      areaBreakdown: Object.fromEntries(
        Object.entries(storeData.detailed_area_analysis?.detailed_areas_breakdown || {}).map(([areaId, breakdown]) => [
          areaId,
          {
            areaName: breakdown.area_name,
            hasElements: breakdown.has_elements,
            designAreaAvailable: breakdown.capacity.design_area_available_sq_inches,
            currentImageAreaUsed: breakdown.capacity.current_image_area_used_sq_inches,
            utilizationPercentage: breakdown.capacity.utilization_percentage,
            elementCount: breakdown.element_statistics.visible_elements,
            rotatedElements: breakdown.element_statistics.rotated_elements,
            scaledElements: breakdown.element_statistics.scaled_elements
          }
        ])
      ),
      
      // Individual element details for Create component
      elementDetails: Object.fromEntries(
        Object.entries(storeData.detailed_area_analysis?.element_details || {}).map(([areaId, elements]) => [
          areaId,
          elements.map(element => ({
            id: element.element_id,
            name: element.element_name,
            type: element.element_type,
            
            // Dimensions in both inches and pixels
            widthInches: element.physical_dimensions.width_inches,
            heightInches: element.physical_dimensions.height_inches,
            areaSquareInches: element.physical_dimensions.area_square_inches,
            widthPixels: element.pixel_dimensions.width_pixels,
            heightPixels: element.pixel_dimensions.height_pixels,
            
            // Rotation and transformation info
            rotationDegrees: element.transformations.rotation_degrees,
            isRotated: element.transformations.is_rotated,
            isScaled: element.transformations.is_scaled,
            scaleX: element.transformations.scale_x,
            scaleY: element.transformations.scale_y,
            
            // Quality information
            printQuality: element.print_quality.quality_rating,
            dpi: element.print_quality.dpi,
            isPrintReady: element.print_quality.is_print_ready,
            
            // Original image info
            originalWidth: element.original_image_info.original_width_pixels,
            originalHeight: element.original_image_info.original_height_pixels,
            originalAspectRatio: element.original_image_info.original_aspect_ratio,
            
            // Positioning
            isCenteredHorizontally: element.positioning.is_centered_horizontally,
            isCenteredVertically: element.positioning.is_centered_vertically,
            distanceFromEdges: element.positioning.distance_from_edges,
            
            // State
            visible: element.state.visible,
            locked: element.state.locked,
            zIndex: element.state.z_index,
            hasBase64: element.state.has_base64
          }))
        ])
      )
    },
    
    // Additional Store Metadata
    storeMetadata: {
      generation_summary: storeData.generation_summary || null,
      mockup_variants: storeData.mockup_variants || [],
      design_configuration: storeData.design_configuration || {},
      total_images_generated: storeData.generation_summary?.total_images_generated || 0,
      total_time_ms: storeData.generation_summary?.total_time_ms || 0,
      engine_usage: storeData.generation_summary?.engine_usage || {},
      errors: storeData.generation_summary?.errors || []
    }
  };

  return result;
}, [selectedColors, selectedSizes, allMockups, productData, calculatePriceFromCost]);


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



const navigateToCreatePage = useCallback((transformedData) => {
  // //console.log('ðŸ”§ NAVIGATION DEBUG - Enhanced data being sent to Create:', {
  //   hasDetailedAreaAnalysis: !!transformedData.detailedAreaAnalysis,
  //   hasDesignMetrics: !!transformedData.designMetrics,
  //   totalElements: transformedData.designMetrics?.totalElements,
  //   areasWithElements: transformedData.designMetrics?.areasWithElements,
  //   areasWithoutElements: transformedData.designMetrics?.areasWithoutElements,
  //   utilizationPercentage: transformedData.designMetrics?.utilizationPercentage,
  //   complexityRating: transformedData.designMetrics?.complexityRating,
  //   elementDetailsKeys: Object.keys(transformedData.designMetrics?.elementDetails || {}),
  //   areaBreakdownKeys: Object.keys(transformedData.designMetrics?.areaBreakdown || {}),
  //   mockupImagesCount: Object.keys(transformedData.mockupImages || {}).length,
  //   canvasImagesCount: transformedData.canvasImages?.length || 0,
  //   designImagesCount: transformedData.designImages?.length || 0
  // });

  // Log detailed element information for each area
  if (transformedData.designMetrics?.elementDetails) {
    Object.entries(transformedData.designMetrics.elementDetails).forEach(([areaId, elements]) => {
      // //console.log(`ðŸ”§ ${areaId.toUpperCase()} ELEMENTS (${elements.length}):`, elements.map(el => ({
      //   name: el.name,
      //   dimensions: `${el.widthInches.toFixed(2)}" Ã— ${el.heightInches.toFixed(2)}" = ${el.areaSquareInches.toFixed(2)} sq"`,
      //   pixels: `${el.widthPixels} Ã— ${el.heightPixels}`,
      //   rotation: el.rotationDegrees + 'Â°',
      //   quality: `${el.printQuality} (${el.dpi} DPI)`,
      //   isRotated: el.isRotated,
      //   isScaled: el.isScaled,
      //   originalSize: `${el.originalWidth} Ã— ${el.originalHeight}`
      // })));
    });
  }

  // Log area breakdown information
  if (transformedData.designMetrics?.areaBreakdown) {
    Object.entries(transformedData.designMetrics.areaBreakdown).forEach(([areaId, breakdown]) => {
      // //console.log(`ðŸ”§ ${areaId.toUpperCase()} BREAKDOWN:`, {
      //   hasElements: breakdown.hasElements,
      //   designAreaAvailable: breakdown.designAreaAvailable.toFixed(2) + ' sq"',
      //   currentImageAreaUsed: breakdown.currentImageAreaUsed.toFixed(2) + ' sq"',
      //   utilization: breakdown.utilizationPercentage.toFixed(1) + '%',
      //   elementCount: breakdown.elementCount,
      //   rotatedElements: breakdown.rotatedElements,
      //   scaledElements: breakdown.scaledElements
      // });
    });
  }

  // Log mockup images by area
  const mockupsByArea = {};
  Object.keys(transformedData.mockupImages || {}).forEach(key => {
    const [area] = key.split('_');
    if (!mockupsByArea[area]) mockupsByArea[area] = 0;
    mockupsByArea[area]++;
  });
  ////console.log('ðŸ”§ MOCKUP IMAGES BY AREA:', mockupsByArea);

  // Verify design images
  if (transformedData.designImages?.length > 0) {
    // //console.log('ðŸ”§ DESIGN IMAGES:', transformedData.designImages.map(img => ({
    //   name: img.name,
    //   area: img.area,
    //   dimensions: `${img.originalWidth} Ã— ${img.originalHeight}`,
    //   hasBase64: !!img.base64Data,
    //   position: `${img.position?.x}, ${img.position?.y}`,
    //   size: `${img.dimensions?.width} Ã— ${img.dimensions?.height}`,
    //   rotation: img.rotation || 0
    // })));
  }

  // Verify canvas images
  if (transformedData.canvasImages?.length > 0) {
    // //console.log('ðŸ”§ CANVAS IMAGES:', transformedData.canvasImages.map(img => ({
    //   area: img.area_id,
    //   hasImageData: !!img.image_data,
    //   elementsCount: img.metadata?.design_elements?.length || 0
    // })));
  }

  setShowStoreImportModal(false);
  //console.log("design data",transformedData.designData);
  navigate({
    to: '/designer/create',
    state: {
      // Core Design Data
      designData: transformedData.designData,
      mockupImages: transformedData.mockupImages,
      colorSpecificImages: transformedData.colorSpecificImages,
      enhancedProductData: transformedData.enhancedProductData,
      filteredProductData: transformedData.filteredProductData,
      
      // Image Data
      designImages: transformedData.designImages,
      canvasImages: transformedData.canvasImages,
      uploadedFiles: [],
      
      // Complete Calculated Data
      pricingData: transformedData.pricingData,
      availableMockups: transformedData.availableMockups,
      imageAreaAnalysis: transformedData.imageAreaAnalysis,
      
      // Enhanced Area Analysis
      detailedAreaAnalysis: transformedData.detailedAreaAnalysis,
      enhancedImageAreaAnalysis: transformedData.enhancedImageAreaAnalysis,
      designMetrics: transformedData.designMetrics,
      
      // Additional Store Metadata
      storeMetadata: transformedData.storeMetadata,
      
      // Navigation Context
      navigationContext: {
        sourceComponent: 'EnhancedCanvas',
        importTimestamp: new Date().toISOString(),
        totalDataSize: JSON.stringify(transformedData).length,
        hasCompleteData: {
          designImages: !!transformedData.designImages?.length,
          canvasImages: !!transformedData.canvasImages?.length,
          pricingData: !!transformedData.pricingData,
          availableMockups: !!transformedData.availableMockups,
          detailedAreaAnalysis: !!transformedData.detailedAreaAnalysis,
          designMetrics: !!transformedData.designMetrics,
          elementDetails: !!transformedData.designMetrics?.elementDetails,
          areaBreakdown: !!transformedData.designMetrics?.areaBreakdown
        },
        dataVerification: {
          totalMockupImages: Object.keys(transformedData.mockupImages || {}).length,
          areasWithElements: transformedData.designMetrics?.areasWithElements || [],
          areasWithoutElements: transformedData.designMetrics?.areasWithoutElements || [],
          totalElements: transformedData.designMetrics?.totalElements || 0,
          utilizationPercentage: transformedData.designMetrics?.utilizationPercentage || 0,
          complexityRating: transformedData.designMetrics?.complexityRating || 'Simple'
        }
      }
    }
  });
  
}, [navigate]);


// Complete Fixed generateComprehensiveMockups Function

// Copy this function and replace the existing one in your Canvas.tsx file

const generateComprehensiveMockups = async (
  productData: PayloadProductData,
  selectedColors: Array<{ name: string; value: string }>,
  selectedSizes: string[],
  areasWithElements: string[],
  areasWithoutElements: string[],
  designElements: Record<string, DesignElement[]>,
  canvasConfigs: Record<string, any>,
  printableAreas: Record<string, any>,
  allMockups: any[],
  onProgress?: (progress: ImageGenerationProgress) => void
): Promise<StoreImportData> => {
  const generationStartTime = performance.now();
  const generationStarted = new Date().toISOString();
  
  let totalCombinations = 0;
  let completedCombinations = 0;
  const errors: string[] = [];
  const engineUsage = { canvas_professional: 0, pixi_dynamic: 0 };
  const mockupVariants: StoreImportData['mockup_variants'] = [];

  // Calculate total combinations for ALL areas
  totalCombinations = allMockups.length * (productData.size_Images ? selectedSizes.length : 1);

  ////console.log(`Processing ${totalCombinations} total combinations for all areas`);

  try {
  // ðŸ”¥ AROUND LINE 2970 - REPLACE THIS SECTION
for (const mockup of allMockups) {
  const colorCombinations: any[] = [{
    color_name: mockup.target_color_name,
    color_hex: mockup.target_color,
    size_variants: []
  }];

  const mockupAreas = mockup.area?.map(area => area.areaName?.toLowerCase()) || [];

  // console.log('🖼️ ', mockup.title, '→ areas:', mockupAreas);
  // console.log('   Checking against:', areasWithElements);
  
  // ðŸ”¥ NEW: Detect cylindrical products
  const surfaceConfig = getSurfaceConfiguration();
  const isCylindrical = surfaceConfig.renderType === 'cylindrical';
  
  // ðŸ”¥ NEW: Check if product has only ONE customization area
  const custAreas = productData.printT?.[0]?.custAreas || [];
  const hasSingleCustArea = custAreas.length === 1;
  
//   console.log('ðŸ”§ Product Configuration:', {
//   isCylindrical,
//   custAreasCount: custAreas.length,
//   hasSingleCustArea,
//   areasWithElements: areasWithElements.length,
//   willApplyToAllMockups: isCylindrical && hasSingleCustArea && areasWithElements.length > 0
// });

  let designToUse: Record<string, DesignElement[]>;
  let hasDesignElements: boolean;
  
  if (isCylindrical && hasSingleCustArea && areasWithElements.length > 0) {
    // ðŸ”¥ CYLINDRICAL LOGIC: Use the single custArea's design for ALL mockups
    //console.log('ðŸ”§ Cylindrical product with single area - applying design to all mockups');
    
    const singleAreaName = areasWithElements[0]; // The one area with design
    designToUse = {
      ...designElements,
      // Map the single area's design to ALL mockup areas
      ...mockupAreas.reduce((acc, mockupArea) => {
        acc[mockupArea] = designElements[singleAreaName] || [];
        return acc;
      }, {} as Record<string, DesignElement[]>)
    };
    
    hasDesignElements = true;
    
  } else {
    // ðŸ”¥ EXISTING LOGIC: Match mockup areas to design areas
    hasDesignElements = mockupAreas.some(areaName => 
      areasWithElements.some(elementArea => elementArea.toLowerCase() === areaName)
    );

    // console.log('   Result:', hasDesignElements ? '✅ HAS DESIGN' : '❌ NO DESIGN');
    // console.log('');
    
    designToUse = designElements;
    //console.log('   Using design elements as-is for this mockup', designToUse);
  }

  // Rest of the generation logic remains the same...
  // const sizesToProcess = productData.size_Images && mockupSize ? [mockupSize] : selectedSizes;

    // ðŸ”¥ CRITICAL FIX: When size_Images is true, only process the size that matches this mockup
    // ðŸ”¥ FIX: Determine which sizes to process for this mockup
    const mockupSize = (mockup as any).photoSize;
    let sizesToProcess: string[];

    if (productData.size_Images && mockupSize) {
      // Size-specific: Only process if this mockup's size is selected
      if (selectedSizes.includes(mockupSize)) {
        sizesToProcess = [mockupSize];
      } else {
        // Skip this mockup if its size isn't selected
        continue;
      }
    } else if (productData.size_Images && !mockupSize) {
      // Mockup has no size but size_Images is true - this is an error
      //console.warn(`âš ï¸ Mockup ${mockup.title} has no photoSize but size_Images=true`);
      continue;
    } else {
      // Size-shared: Process all selected sizes
      sizesToProcess = selectedSizes;
    }

    if (!productData.size_Images) {
      // Sizes share the same image - generate once
      const combinationId = `${mockup.title}-${mockup.target_color_name}-${hasDesignElements ? 'custom' : 'base'}`;
      
      onProgress?.({
        total: totalCombinations,
        completed: completedCombinations,
        current_combination: combinationId,
        current_mockup: mockup.title,
        current_engine: 'canvas_professional',
        errors: [...errors]
      });

      try {
        let result;
        
        if (hasDesignElements) {
          result = await mockupGenerator.generateSingleMockup(
            mockup, designElements, canvasConfigs, printableAreas,
            mockup.target_color, productData, 1000, true
          );
        } else {
          const emptyDesignElements: Record<string, DesignElement[]> = {};
          mockupAreas.forEach(area => { emptyDesignElements[area] = []; });
          
          result = await mockupGenerator.generateSingleMockup(
            mockup, emptyDesignElements, canvasConfigs, printableAreas,
            mockup.target_color, productData, 1000, true
          );
        }

        engineUsage[result.engine]++;

        selectedSizes.forEach(size => {
          colorCombinations[0].size_variants.push({
            size_name: size,
            generated_images: [{
              engine_used: result.engine,
              image_data: result.imageData,
              resolution: 1000,
              generation_timestamp: new Date().toISOString(),
              quality_metrics: result.metrics,
              mockup_type: hasDesignElements ? 'custom_design' : 'base_template'
            }]
          });
        });

        completedCombinations++;

      } catch (error) {
        const errorMsg = `Failed: ${combinationId} - ${error.message}`;
        errors.push(errorMsg);
        
        selectedSizes.forEach(size => {
          colorCombinations[0].size_variants.push({
            size_name: size,
            generated_images: []
          });
        });
      }

    } else {
      // ðŸ”¥ FIX: Generate separate images - but ONLY for the matching size
      for (const size of sizesToProcess) {
        const combinationId = `${mockup.title}-${mockup.target_color_name}-${size}-${hasDesignElements ? 'custom' : 'base'}`;
        
        onProgress?.({
          total: totalCombinations,
          completed: completedCombinations,
          current_combination: combinationId,
          current_mockup: mockup.title,
          current_engine: 'canvas_professional',
          errors: [...errors]
        });

        try {
          let result;
          
          if (hasDesignElements) {
            result = await mockupGenerator.generateSingleMockup(
              mockup, designElements, canvasConfigs, printableAreas,
              mockup.target_color, productData, 1000, true
            );
          } else {
            const emptyDesignElements: Record<string, DesignElement[]> = {};
            mockupAreas.forEach(area => { emptyDesignElements[area] = []; });
            
            result = await mockupGenerator.generateSingleMockup(
              mockup, emptyDesignElements, canvasConfigs, printableAreas,
              mockup.target_color, productData, 1000, true
            );
          }

          engineUsage[result.engine]++;

          colorCombinations[0].size_variants.push({
            size_name: size,
            generated_images: [{
              engine_used: result.engine,
              image_data: result.imageData,
              resolution: 1000,
              generation_timestamp: new Date().toISOString(),
              quality_metrics: result.metrics,
              mockup_type: hasDesignElements ? 'custom_design' : 'base_template'
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

    mockupVariants.push({
      mockup_id: mockup.id,
      mockup_title: mockup.title,
      view_angle: mockup.viewAngle || 'front',
      mockup_color: mockup.photoColor,
      mockup_size: mockupSize, // ðŸ”¥ Store the specific size
      has_design_elements: hasDesignElements,
      mockup_areas: mockupAreas,
      color_combinations: colorCombinations
    });

    //console.log("mockup variants data", mockupVariants);
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  } catch (criticalError) {
    errors.push(`Critical error: ${criticalError.message}`);
  }

  const generationEndTime = performance.now();
  const totalTimeMs = generationEndTime - generationStartTime;
  const generationCompleted = new Date().toISOString();

  const totalImagesGenerated = mockupVariants.reduce((total, mockup) => 
    total + mockup.color_combinations.reduce((colorTotal, color) => 
      colorTotal + color.size_variants.reduce((sizeTotal, size) => 
        sizeTotal + size.generated_images.length, 0), 0), 0);

  const mockupCalculationResult: MockupCalculationResult = {
    totalMockups: totalImagesGenerated,
    calculationBreakdown: selectedColors.map(color => ({
      color: color.name,
      colorHex: color.value,
      mockupsForColor: allMockups.filter(m => m.target_color === color.value).length,
      sizesCount: selectedSizes.length,
      subtotal: allMockups.filter(m => m.target_color === color.value).length * (productData.size_Images ? selectedSizes.length : 1),
      mockups: allMockups.filter(m => m.target_color === color.value)
    })),
    strategy: productData.color_Images && productData.size_Images ? 'color_and_size_specific' : 
             productData.color_Images ? 'color_specific' : 'shared_across_all'
  };

  return {
    product_id: productData.id || `product-${Date.now()}`,
    product_name: productData.name || 'Custom Product',
    product_type: productData.productType || 'custom',
    design_elements: designElements,
    design_configuration: {
      canvas_configs: canvasConfigs,
      printable_areas: printableAreas,
      design_metadata: {
        total_elements: Object.values(designElements).flat().length,
        areas_used: areasWithElements,
        areas_available: [...areasWithElements, ...areasWithoutElements],
        creation_timestamp: new Date().toISOString(),
        last_modified: new Date().toISOString()
      }
    },
    mockup_variants: mockupVariants,
    generation_summary: {
      total_combinations: totalCombinations,
      total_images_generated: totalImagesGenerated,
      generation_started: generationStarted,
      generation_completed: generationCompleted,
      total_time_ms: Math.round(totalTimeMs),
      engine_usage: engineUsage,
      mockup_calculation: mockupCalculationResult,
      errors: errors,
      areas_with_elements: areasWithElements,
      areas_without_elements: areasWithoutElements,
      custom_mockups: mockupVariants.filter(m => m.has_design_elements).length,
      base_mockups: mockupVariants.filter(m => !m.has_design_elements).length
    }
  };
}

const handleImportToStore = useCallback(async () => {
  // ✅ CRITICAL: Check for no_mockup_compatible FIRST
 if (shouldSkipMockupGeneration()) {
    //console.log('âš ï¸ Product not mockup compatible - skipping mockup generation, navigating directly to Create');
    
    try {
      setIsGeneratingForStore(true);
      
      // Filter product data to active technology
      const filteredProductData = {
        ...productData,
        printT: Array.isArray(productData?.printT)
          ? productData.printT.filter((t) => t.id === activeTechnology || t.technologyName === activeTechnology)
          : []
      };

      if (filteredProductData.printT.length === 0) {
        throw new Error(`No matching technology found for: ${activeTechnology}`);
      }

      // Prepare data WITHOUT mockups
      const designImages = extractDesignImages();
      const canvasImages = exportAllCanvasImages();
      const finalPricingBreakdown = calculateTotalPricing();
      const detailedAreaAnalysis = generateDetailedAreaAnalysis();

       // ðŸ”¥ FIX: Calculate total current image area
      let totalCurrentImageArea = 0;
      Object.values(finalPricingBreakdown.areas).forEach(area => {
        totalCurrentImageArea += area.currentImageArea;
      });

      const dataWithoutMockups = {
        product_id: productData.id || `product-${Date.now()}`,
        product_name: productData.name || 'Custom Product',
        product_type: productData.productType || 'custom',
        design_elements: getVisibleDesignElements(designElements),
        design_configuration: {
          canvas_configs: getAllCanvasConfigs,
          printable_areas: getAllPrintableAreas,
          design_metadata: {
            total_elements: Object.values(designElements).flat().length,
            areas_used: Object.keys(designElements).filter(area => designElements[area].length > 0),
            creation_timestamp: new Date().toISOString(),
            last_modified: new Date().toISOString()
          }
        },
        canvas_images: canvasImages,
        design_images: designImages,
         
        // ðŸ”¥ ADD: Include detailed area analysis
        detailed_area_analysis: detailedAreaAnalysis,
        
        // ðŸ”¥ ADD: Include pricing data
        pricing_data: {
          final_price_per_unit: Number(finalPricingBreakdown.priceBreakdown.finalPrice.toFixed(2)),
          currency: 'INR',
          technology: activeTechnology,
          technology_name: getCurrentTechnology()?.technologyName || activeTechnology,
          pricing_breakdown: finalPricingBreakdown,
          areas_pricing: finalPricingBreakdown.areas,
          total_design_area: finalPricingBreakdown.totalDesignArea,
          base_printing_cost: finalPricingBreakdown.priceBreakdown.basePrintingCost,
          blank_product_cost: finalPricingBreakdown.priceBreakdown.blankProductCost,
          setup_fees: finalPricingBreakdown.priceBreakdown.setupFees,
          additional_costs: finalPricingBreakdown.priceBreakdown.additionalCosts,
          markup: finalPricingBreakdown.priceBreakdown.markup,
          price_calculation_details: {
            minimum_prices: Object.values(finalPricingBreakdown.areas).map(area => ({
              area: area.areaId,
              minimum_price: area.minimumPrice,
              price_per_sq_inch: area.pricePerSquareInch
            })),
            element_dimensions: Object.values(finalPricingBreakdown.areas)
              .flatMap(area => 
                area.elements.map(element => ({
                  element_id: element.elementId,
                  element_name: element.elementName,
                  area: area.areaId,
                  area_square_inches: element.areaSquareInches,
                  element_price: element.elementPrice,
                  original_area: element.originalArea,
                  extra_area: element.extraArea
                }))
              )
          },
          quantity_pricing: {
            selected_colors_count: selectedColors.length,
            selected_sizes_count: selectedSizes.length,
            total_variants: selectedColors.length * selectedSizes.length,
            estimated_total_cost: Number((finalPricingBreakdown.priceBreakdown.finalPrice * selectedColors.length * selectedSizes.length).toFixed(2))
          }
        },
        mockup_variants: [], // Empty - no mockups
        generation_summary: {
          total_combinations: 0,
          total_images_generated: 0,
          generation_started: new Date().toISOString(),
          generation_completed: new Date().toISOString(),
          total_time_ms: 0,
          engine_usage: { canvas_professional: 0, pixi_dynamic: 0 },
          errors: [],
          message: 'Product not mockup compatible - skipped mockup generation'
        }
      };

      // Transform the data for Create page (without mockups)
      const transformedData = transformStoreDataForCreate(dataWithoutMockups, filteredProductData);
      
      // Navigate directly to Create page
      navigateToCreatePage(transformedData);
      
    } catch (error) {
      //console.error('âŒ Failed to prepare data for Create page:', error);
      alert(`Failed to prepare product data: ${error.message}`);
    } finally {
      setIsGeneratingForStore(false);
    }
    
    return; // Exit early - don't continue with mockup generation
  }


  if (!hasDesignElements) {
    alert('âš ï¸ Please add design elements before importing to store.');
    return;
  }

  if (selectedColors.length === 0 || selectedSizes.length === 0) {
    alert('âš ï¸ Please select colors and sizes before importing to store.');
    return;
  }

  if (!mockupCalculation) {
    alert('âš ï¸ Unable to calculate mockups. Please check your selections.');
    return;
  }

  ////console.log('ðŸ”§ IMPORT DEBUG - Starting import process...');
  ////console.log('ðŸ”§ Current designElements:', designElements);
  ////console.log('ðŸ”§ Available areas:', availableAreas);

  // Generate detailed area analysis BEFORE import
  ////console.log('ðŸ”§ Generating detailed area analysis...');
  const detailedAreaAnalysis = generateDetailedAreaAnalysis();
  
  ////console.log('ðŸ”§ DETAILED AREA ANALYSIS:', detailedAreaAnalysis);
  ////console.log('ðŸ”§ Area Summary:', detailedAreaAnalysis.area_summary);

  // Enhanced area identification with normalization
  const normalizeAreaName = (areaName) => {
    return areaName.toLowerCase().trim().replace(/\s+/g, '_');
  };

  // Get all areas that actually have design elements (with normalization)
  const areasWithElements = [];
  Object.keys(designElements).forEach(areaId => {
    const elements = designElements[areaId] || [];
    const visibleElements = elements.filter(element => element.visible !== false);
    
    ////console.log(`ðŸ”§ Checking area "${areaId}": ${visibleElements.length} visible elements`);
    

    //console.log(`📍 "${areaId}" → ${visibleElements.length} visible elements`);
    if (visibleElements.length > 0) {
      const normalizedAreaId = normalizeAreaName(areaId);
      areasWithElements.push(normalizedAreaId);
      ////console.log(`ðŸ”§ Added area with elements: ${normalizedAreaId} (original: ${areaId})`);

      //console.log(`   ✅ "${normalizedAreaId}" added`);
    }
  });

  //console.log('📊 areasWithElements:', areasWithElements);
  // Get ALL mockups and areas from technology
  const allMockupsForTech = [];
  const allAvailableAreas = new Set();

  // ðŸ”¥ FIX: Filter by selected sizes when size_Images is true
selectedColors.forEach(color => {
  if (productData.size_Images && selectedSizes.length > 0) {
     //console.log('ðŸ” Selected sizes to process:', selectedSizes);
    // When size_Images is true, get mockups for each selected size
    selectedSizes.forEach(size => {
      //console.log('ðŸ” Processing size:', size);
      const mockupsForColorAndSize = getMockupsForColor(
        productData, 
        color.value, 
        activeTechnology,
        size  // âœ… Pass the size parameter
      );
      
      mockupsForColorAndSize.forEach(mockup => {
        allMockupsForTech.push({
          ...mockup,
          target_color: color.value,
          target_color_name: color.name,
          target_size: size  // Also track which size this mockup is for
        });
        
        // Collect areas...
        if (mockup.area && Array.isArray(mockup.area)) {
          mockup.area.forEach(area => {
            if (area.areaName) {
              const normalizedAreaName = normalizeAreaName(area.areaName);
              allAvailableAreas.add(normalizedAreaName);
            }
          });
        }
      });
    });
  } else {
    // When size_Images is false, sizes share mockups
    const mockupsForColor = getMockupsForColor(
      productData, 
      color.value, 
      activeTechnology
    );
    
    mockupsForColor.forEach(mockup => {
      allMockupsForTech.push({
        ...mockup,
        target_color: color.value,
        target_color_name: color.name
      });
      
      // Collect areas...
      if (mockup.area && Array.isArray(mockup.area)) {
        mockup.area.forEach(area => {
          if (area.areaName) {
            const normalizedAreaName = normalizeAreaName(area.areaName);
            allAvailableAreas.add(normalizedAreaName);
          }
        });
      }
    });
  }
});

  const allAreasList = Array.from(allAvailableAreas);
  const areasWithoutElements = allAreasList.filter(area => !areasWithElements.includes(area));

  if (allAreasList.length === 0) {
    alert(`âŒ No areas found in mockup data. Please check your product configuration.`);
    return;
  }

  // Calculate pricing and continue with generation
  const finalPricingBreakdown = calculateTotalPricing();
  setPricingBreakdown(finalPricingBreakdown);

  try {
    setIsGeneratingForStore(true);
    setShowStoreImportModal(true);  
    setStoreImportData(null);
    
    // Calculate total mockups for progress tracking
    const customMockupsNeeded = allMockupsForTech.length * (productData.size_Images ? selectedSizes.length : 1);
    
    setStoreGenerationProgress({
      total: customMockupsNeeded,
      completed: 0,
      current_combination: 'Initializing comprehensive store import...',
      current_mockup: `Processing ${areasWithElements.length} areas with custom designs + ${areasWithoutElements.length} base areas`,
      current_engine: 'canvas_professional',
      errors: []
    });
    
    setShowStoreImportModal(true);
    await new Promise(resolve => setTimeout(resolve, 200));

    // Filter product data to active technology
    const filteredProductData = {
      ...productData,
      printT: Array.isArray(productData?.printT)
        ? productData.printT.filter((t) => t.id === activeTechnology || t.technologyName === activeTechnology)
        : []
    };

    if (filteredProductData.printT.length === 0) {
      throw new Error(`No matching technology found for: ${activeTechnology}`);
    }

    // Set product data for mockup generator
    mockupGenerator.setProductData(filteredProductData);

    // Enhanced progress callback
    const progressCallback = (progress) => {
      ////console.log(`ðŸ”§ Generation Progress: ${progress.completed}/${progress.total} - ${progress.current_combination}`);
      setStoreGenerationProgress({ ...progress });
      
      if (progress.errors && progress.errors.length > 0) {
        ////console.error('ðŸ”§ Generation errors:', progress.errors);
      }
    };

    ////console.log('ðŸ”§ Starting comprehensive mockup generation for ALL areas...');
    
    // Generate comprehensive mockups
    const comprehensiveImportData = await generateComprehensiveMockups(
      filteredProductData,
      selectedColors,
      selectedSizes,
      areasWithElements,
      areasWithoutElements,
      getVisibleDesignElements(designElements),
      getAllCanvasConfigs,
      getAllPrintableAreas,
      allMockupsForTech,
      progressCallback
    );


    // //console.log('ðŸ”§ Comprehensive generation completed:', {
    //   totalImages: comprehensiveImportData.generation_summary.total_images_generated,
    //   timeMs: comprehensiveImportData.generation_summary.total_time_ms,
    //   errors: comprehensiveImportData.generation_summary.errors.length,
    //   areasWithElements: areasWithElements,
    //   areasWithoutElements: areasWithoutElements
    // });

    if (comprehensiveImportData.generation_summary.total_images_generated === 0) {
      throw new Error(`No mockup images were generated. Check mockup configuration for technology: ${activeTechnology}`);
    }

    // Add detailed area analysis to import data
    comprehensiveImportData.detailed_area_analysis = detailedAreaAnalysis;
    
    // Enhance existing imageAreaAnalysis with detailed element info
    comprehensiveImportData.image_area_analysis = {
      ...comprehensiveImportData.image_area_analysis,
      detailed_element_breakdown: detailedAreaAnalysis.element_details,
      area_specifications: Object.fromEntries(
        Object.entries(detailedAreaAnalysis.detailed_areas_breakdown).map(([areaId, breakdown]) => [
          areaId, 
          breakdown.area_specifications
        ])
      ),
      design_complexity: detailedAreaAnalysis.area_summary.design_complexity_score,
      
      // Quick access element summary for Create component
      elements_summary: Object.fromEntries(
        Object.entries(detailedAreaAnalysis.element_details).map(([areaId, elements]) => [
          areaId,
          elements.map(element => ({
            id: element.element_id,
            name: element.element_name,
            type: element.element_type,
            dimensions: {
              width_inches: element.physical_dimensions.width_inches,
              height_inches: element.physical_dimensions.height_inches,
              area_square_inches: element.physical_dimensions.area_square_inches,
              width_pixels: element.pixel_dimensions.width_pixels,
              height_pixels: element.pixel_dimensions.height_pixels
            },
            transformations: {
              rotation_degrees: element.transformations.rotation_degrees,
              is_rotated: element.transformations.is_rotated,
              is_scaled: element.transformations.is_scaled,
              scale_x: element.transformations.scale_x,
              scale_y: element.transformations.scale_y
            },
            quality: {
              dpi: element.print_quality.dpi,
              rating: element.print_quality.quality_rating,
              is_print_ready: element.print_quality.is_print_ready
            },
            positioning: element.positioning
          }))
        ])
      )
    };

    // Add additional comprehensive store data
    const designImages = extractDesignImages();
    const canvasImages = exportAllCanvasImages();

  //   console.log('ðŸ“¦ GENERATION COMPLETE:', {
  //   total_variants: comprehensiveImportData.mockup_variants.length,
  //   variants: comprehensiveImportData.mockup_variants.map(v => ({
  //     title: v.mockup_title,
  //     mockup_size: v.mockup_size,
  //     mockup_color: v.mockup_color,
  //     has_design: v.has_design_elements
  //   }))
  // });
    
    comprehensiveImportData.canvas_images = canvasImages;
    comprehensiveImportData.design_images = designImages;
    
    // Add available mockups data
    const availableMockupsForStore = [];
    allMockupsForTech.forEach(mockup => {
      const mockupAreas = mockup.area?.map(area => area.areaName?.toLowerCase()) || [];
      const hasDesignElements = mockupAreas.some(areaName => 
        areasWithElements.some(elementArea => elementArea.toLowerCase() === areaName)
      );

      availableMockupsForStore.push({
        mockup_id: mockup.id,
        mockup_title: mockup.title,
        mockup_photo_url: resolveImageUrl(mockup.photo?.url || ''),
        view_angle: mockup.viewAngle || 'front',
        mockup_type: mockup.mockupType || 'product',
        photo_color: mockup.photoColor || '#ffffff',
        priority: mockup.priority || 0,
        target_color: mockup.target_color,
        target_color_name: mockup.target_color_name,
        technology: activeTechnology,
        technology_name: getCurrentTechnology()?.technologyName || activeTechnology,
        has_design_elements: hasDesignElements,
        areas: mockup.area?.map(area => ({
          area_id: area.id,
          area_name: area.areaName,
          has_elements: areasWithElements.some(elementArea => elementArea.toLowerCase() === area.areaName?.toLowerCase()),
          visibility: area.visibility || 'full',
          design_coordinates: {
            x: area.design?.coordinateX || 0,
            y: area.design?.coordinateY || 0,
            width: area.design?.coordinateWidth || 1,
            height: area.design?.coordinateHeight || 1,
            rotation: area.design?.rotation || 0,
            scale_x: area.design?.scaleX || 1,
            scale_y: area.design?.scaleY || 1,
            opacity: area.design?.opacity || 1,
            blend_mode: area.design?.blend || 'normal'
          }
        })) || []
      });
    });

    comprehensiveImportData.available_mockups = {
      technology_id: activeTechnology,
      technology_name: getCurrentTechnology()?.technologyName || activeTechnology,
      selected_colors: selectedColors,
      all_available_areas: allAreasList,
      areas_with_elements: areasWithElements,
      areas_without_elements: areasWithoutElements,
      total_available_mockups: availableMockupsForStore.length,
      mockups_by_color: selectedColors.map(color => ({
        color_name: color.name,
        color_hex: color.value,
        mockup_count: availableMockupsForStore.filter(m => m.target_color === color.value).length,
        mockups_with_elements: availableMockupsForStore.filter(m => m.target_color === color.value && m.has_design_elements).length,
        mockups_base_only: availableMockupsForStore.filter(m => m.target_color === color.value && !m.has_design_elements).length,
        mockups: availableMockupsForStore.filter(m => m.target_color === color.value)
      })),
      all_mockups: availableMockupsForStore
    };

    let totalCurrentImageArea = 0;
    Object.values(finalPricingBreakdown.areas).forEach(area => {
      totalCurrentImageArea += area.currentImageArea;
    });

    comprehensiveImportData.pricing_data = {
      final_price_per_unit: Number(finalPricingBreakdown.priceBreakdown.finalPrice.toFixed(2)),
      currency: 'INR',
      technology: activeTechnology,
      technology_name: getCurrentTechnology()?.technologyName || activeTechnology,
      pricing_breakdown: finalPricingBreakdown,
      areas_pricing: finalPricingBreakdown.areas,
      areas_with_elements: areasWithElements,
      areas_without_elements: areasWithoutElements,
      total_design_area: finalPricingBreakdown.totalDesignArea,
      base_printing_cost: finalPricingBreakdown.priceBreakdown.basePrintingCost,
      blank_product_cost: finalPricingBreakdown.priceBreakdown.blankProductCost,
      setup_fees: finalPricingBreakdown.priceBreakdown.setupFees,
      additional_costs: finalPricingBreakdown.priceBreakdown.additionalCosts,
      markup: finalPricingBreakdown.priceBreakdown.markup,
      price_calculation_details: {
        minimum_prices: Object.values(finalPricingBreakdown.areas).map(area => ({
          area: area.areaId,
          has_elements: areasWithElements.includes(area.areaId),
          minimum_price: area.minimumPrice,
          price_per_sq_inch: area.pricePerSquareInch
        })),
        element_dimensions: Object.values(finalPricingBreakdown.areas)
          .filter(area => areasWithElements.includes(area.areaId))
          .flatMap(area => 
            area.elements.map(element => ({
              element_id: element.elementId,
              element_name: element.elementName,
              area: area.areaId,
              area_square_inches: element.areaSquareInches,
              element_price: element.elementPrice,
              original_area: element.originalArea,
              extra_area: element.extraArea
            }))
          )
      },
      quantity_pricing: {
        selected_colors_count: selectedColors.length,
        selected_sizes_count: selectedSizes.length,
        total_variants: selectedColors.length * selectedSizes.length,
        estimated_total_cost: Number((finalPricingBreakdown.priceBreakdown.finalPrice * selectedColors.length * selectedSizes.length).toFixed(2))
      }
    };

    // //console.log('ðŸ”§ Enhanced import data created with detailed analysis:', {
    //   totalElements: detailedAreaAnalysis.area_summary.total_elements_across_all_areas,
    //   complexityRating: detailedAreaAnalysis.area_summary.design_complexity_score.complexity_rating,
    //   utilizationPercentage: detailedAreaAnalysis.area_utilization_percentage,
    //   areasWithContent: detailedAreaAnalysis.areas_with_elements.length
    // });

    setStoreImportData(comprehensiveImportData);

    setStoreGenerationProgress(prev => ({
      ...prev,
      current_combination: 'Generation Complete!',
      current_mockup: `Generated ${comprehensiveImportData.generation_summary.total_images_generated} mockups for all areas: ${allAreasList.join(', ')}`,
      completed: prev?.total || customMockupsNeeded
    }));

    await new Promise(resolve => setTimeout(resolve, 1000));

    // //console.log('ðŸ”§ Transforming comprehensive data and navigating...');
    //const transformedData = transformStoreDataForCreate(comprehensiveImportData, filteredProductData);

  //   console.log('ðŸ“¦ BEFORE TRANSFORM:', {
  //   total_mockup_variants: comprehensiveImportData.mockup_variants.length,
  //   has_design_images: !!comprehensiveImportData.design_images,
  //   design_images_count: comprehensiveImportData.design_images?.length || 0
  // });

  // Transform the data
  //console.log('ðŸ”§ CALLING transformStoreDataForCreate...');
  const transformedData = transformStoreDataForCreate(comprehensiveImportData, filteredProductData);

  // console.log('ðŸ”§ AFTER TRANSFORM:', {
  //   mockupImagesCount: Object.keys(transformedData.mockupImages || {}).length,
  //   mockupImageKeys: Object.keys(transformedData.mockupImages || {}),
  //   colorSpecificImagesCount: Object.keys(transformedData.colorSpecificImages || {}).length
  // });

     navigateToCreatePage(transformedData);

  } catch (error) {
    console.error('🔧 Enhanced store import failed:', error);
    
    setStoreGenerationProgress(prev => ({
      ...prev,
      current_combination: 'Error occurred',
      current_mockup: error.message,
      errors: [...(prev?.errors || []), error.message]
    }));
    
    // ⚠️ SHOW CUSTOM ERROR POPUP INSTEAD OF ALERT
    setShowStoreImportModal(true);
    setStoreImportData({
      ...storeImportData,
      generation_summary: {
        ...storeImportData?.generation_summary,
        errors: [error.message],
        error_type: 'limit_exceeded'
      }
    } as any);
    
  } finally {
    setTimeout(() => {
      setIsGeneratingForStore(false);
    }, 2000);
  }
}, [
  hasDesignElements,
  selectedColors,
  selectedSizes,
  mockupCalculation,
  generateDetailedAreaAnalysis,
  productData,
  activeTechnology,
  designElements,
  getAllCanvasConfigs,
  getAllPrintableAreas,
  mockupGenerator,
  extractDesignImages,
  exportAllCanvasImages,
  calculateTotalPricing,
  getCurrentTechnology,
  getMockupsForColor,
  resolveImageUrl,
  transformStoreDataForCreate,
  navigateToCreatePage,
  getVisibleDesignElements,
  generateComprehensiveMockups
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
                {imagesWithBase64 === totalImages ? 'âœ…' : 'âš ï¸'}
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
        <div className="p-8 text-center sm:py-12 sm:px-8">
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
                      {/* <span>â€¢</span> */}
                      <span className={file.base64Data ? 'text-green-600' : 'text-orange-600'}>
                        {file.base64Data ? 'Stored' : 'Not stored'}
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
        
        // âœ… CREATE ELEMENT WITH GUARANTEED BASE64
        const element = {
          id: `img-${Date.now()}-${Math.random()}`,
          type: 'image',
          x: centerX, y: centerY, width, height,
          rotation: 0, scaleX: 1, scaleY: 1,
          draggable: true, selected: false, zIndex: 1,
          image: img, imageName: imageName || 'Uploaded Image',
          imageUrl: imageSrc,
          imageBase64: base64Data, // âœ… STORE BASE64
          originalImageWidth: img.naturalWidth || img.width,
          originalImageHeight: img.naturalHeight || img.height,
          opacity: 1, visible: true, locked: false
        };
        
        
        // âœ… ATOMIC STATE UPDATE WITH PROPER MERGING
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
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const blobUrl = URL.createObjectURL(file);
      
      setUploadedFiles(prev => [...prev, {
        id: `file-${Date.now()}`,
        file, url: blobUrl, base64Data,
        name: file.name, size: file.size, type: file.type,
        uploadProgress: 100, isUploading: false, targetArea: activeArea
      }]);
      
      const success = await addImageToCanvasWithStateProtection(blobUrl, file.name, activeArea, base64Data);
      
      if (success) {
        // ðŸ”¥ NEW: Trigger pricing calculation after successful upload
        setTimeout(() => {
          updatePricingData();
        }, 500); // Small delay to ensure state is updated
      }
      
    } catch (error) {
      ////console.error('Error uploading file:', error);
    }
  }
}, [activeArea, addImageToCanvasWithStateProtection, updatePricingData]);


  
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
      // ✅ SET NEWLY SELECTED COLOR AS ACTIVE
      setActiveColor(colorHex);
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
  
  const centerElement = useCallback((alignment: 'horizontal' | 'vertical' | 'both' | 'left' | 'right' | 'top' | 'bottom' | 'hcenter' | 'vcenter') => {
  if (!selectedId) return;

  const printableArea = getPrintableAreaFromPhoto(activeArea, activeColor);
  if (!printableArea) return;

  setDesignElements(prev => {
    const updated = { ...prev };
    if (!updated[activeArea]) return updated;

    updated[activeArea] = updated[activeArea].map(el => {
      if (el.id !== selectedId) return el;

      // defaults to current position
      let newX = el.x;
      let newY = el.y;

      // horizontal centering
      const doHCenter = alignment === 'horizontal' || alignment === 'both' || alignment === 'hcenter';
      // vertical centering
      const doVCenter = alignment === 'vertical' || alignment === 'both' || alignment === 'vcenter';

      if (doHCenter) {
        newX = printableArea.x + (printableArea.width - (el.width || 0)) / 2;
      }

      if (doVCenter) {
        newY = printableArea.y + (printableArea.height - (el.height || 0)) / 2;
      }

      // explicit edge alignments override centers
      if (alignment === 'left') {
        newX = printableArea.x;
      } else if (alignment === 'right') {
        newX = printableArea.x + printableArea.width - (el.width || 0);
      } else if (alignment === 'top') {
        newY = printableArea.y;
      } else if (alignment === 'bottom') {
        newY = printableArea.y + printableArea.height - (el.height || 0);
      }

      return { ...el, x: newX, y: newY };
    });

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

  // Check if mockups are compatible
 if (shouldSkipMockupGeneration()) {
    return (
      <div className="flex items-center justify-center h-full mt-4 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 sm:mt-0">
        <div className="w-full max-w-xl px-4 ">
          {/* Main Card */}
          <div className="relative overflow-hidden bg-white shadow-xl rounded-2xl">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-44 h-44 opacity-5">
              <Palette className="w-full h-full" style={{ color: '#e65100' }} />
            </div>
            
            {/* Content */}
            <div className="relative p-6">
              {/* Icon Header */}
              <div className="flex justify-center mt-4">
                <div className="p-0">
                  <video 
                    src={JUNO} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-36 h-36 object-contain rounded-md"
                  />
                </div>
              </div>
              
              {/* Title */}
              <h2 className="mb-0 text-2xl font-bold text-center text-gray-900">
                JUNO Will Create Your Mockup
              </h2>
              
              {/* Subtitle */}
              <p className="mb-1 text-sm text-center text-gray-600">
                We don't have the ability to create mockups for the tech used, but JUNO does
              </p>
              
              {/* Features Grid */}
              
              {/* Action Button */}
              <button
                onClick={() => setActiveView('design')}
                className="flex items-center justify-center w-full gap-2 px-5 py-3 text-sm font-semibold text-white transition-all rounded-lg hover:shadow-lg hover:scale-105"
                style={{ backgroundColor: '#e65100' }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Designing</span>
              </button>
              
              {/* Help Text */}
              <p className="mt-3 text-xs text-center text-gray-500">
                Need help? Contact support
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ðŸ”¥ CRITICAL FIX: Immediately stop preview rendering when store import starts
  if (isGeneratingForStore || showStoreImportModal) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="mb-4 text-4xl">â³</div>
          <p className="font-medium">Generating store mockups...</p>
          <p className="mt-2 text-sm">Preview paused</p>
        </div>
      </div>
    );
  }

  const surfaceConfig = getSurfaceConfiguration();
  

  // Early return if no selections made
  if (selectedColors.length === 0 || selectedSizes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <div className="mb-4 text-4xl">🎨</div>
          <p className="font-medium">Select colors and sizes to see preview</p>
          <p className="mt-2 text-sm">Choose options from the design panel</p>
        </div>
      </div>
    );
  }
  
  if (allMockups.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <div className="mb-4 text-4xl">ðŸ–¼ï¸</div>
          <p className="font-medium">No mockups available</p>
        </div>
      </div>
    );
  }
  
  const canvasConfigs = getAllCanvasConfigs;
  const printableAreas = getAllPrintableAreas;

   const getMockupDimensions = (mockup: DynamicMockupPhoto, type: 'thumbnail' | 'mockup') => {
    if (type === 'thumbnail') {
      return {
        width: mockup.tmbwidthpx || 220,
        height: mockup.tmbhigtpx || 220
      };
    } else {
      return {
        width: mockup.mocwidthpx || 500,
        height: mockup.mochigtpx || 500
      };
    }
  };
  
  return (
    <div className="flex h-full">
      {/* Enhanced Mockup Thumbnails - Hidden on Mobile */}
      <div className="hidden w-56 p-4 bg-white border-r border-gray-200 sm:block">
        <div className="space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
          
          {/* Color Thumbnails Section */}
          {/* <div>
            <h4 className="flex items-center mb-3 text-sm font-medium text-gray-700">
              <div className="w-3 h-3 mr-2 bg-blue-500 rounded-full"></div>
              Selected Colors
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {selectedColors.length}
              </span>
            </h4>
            
            <div className="space-y-2">
              {selectedColors.map(selectedColor => {
                const colorMockups = getMockupsForColor(productData, selectedColor.value, activeTechnology);
                const areaSpecificMockups = colorMockups.filter(mockup => {
                  return mockup.area?.some(area => 
                    area.areaName?.toLowerCase() === activeArea.toLowerCase()
                  );
                });
                
                const mockupToShow = areaSpecificMockups[0] || colorMockups[0];
                
                if (!mockupToShow) return null;
                
                const isActiveColor = activeColor === selectedColor.value;
                
                return (
                  <div key={`color-${selectedColor.value}`}>
                    <button
                      onClick={() => setActiveColor(selectedColor.value)}
                      className={`w-full p-2 border rounded-lg transition-all touch-manipulation ${
                        isActiveColor
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="relative mb-2 overflow-hidden bg-gray-100 rounded aspect-square">
                        <ThumbnailPreview
                          mockup={mockupToShow}
                          designElements={getVisibleDesignElements(designElements)} 
                          canvasConfigs={canvasConfigs}
                          canvasPrintableAreas={printableAreas}
                          productColor={selectedColor.value}
                          displayDimensions={{ width: 250, height: 250 }}
                          isSelected={isActiveColor}
                          onSelect={() => setActiveColor(selectedColor.value)}
                          productData={productData}
                        />
                        
                        {isActiveColor && (
                          <div className="absolute top-2 right-2">
                            <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs font-medium">{selectedColor.name}</p>
                        <div className="flex items-center justify-center mt-1">
                          <div 
                            className="w-4 h-4 mr-1 border rounded"
                            style={{ backgroundColor: selectedColor.value }}
                          />
                          <span className="text-xs text-gray-500">{activeArea}</span>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div> */}
          
          {/* Available Mockups Section */}
          <div>
            {/* <h4 className="flex items-center mb-3 text-sm font-medium text-gray-700">
              <div className="w-3 h-3 mr-2 bg-orange-500 rounded-full"></div>
              Available Mockups
              <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                {(() => {
                  const mockups = getMockupsForColor(productData, activeColor, activeTechnology);
                  return mockups.length;
                })()}
              </span>
            </h4> */}
            
            {/* <div className="mb-2 text-xs text-gray-500">
              For: {selectedColors.find(c => c.value === activeColor)?.name || 'Active Color'}
            </div> */}
            
            <div className="space-y-2">
              {(() => {
                const colorMockups = getMockupsForColor(productData, activeColor, activeTechnology,  productData.size_Images ? activeSize : undefined );
                
                if (colorMockups.length === 0) {
                  return (
                    <div className="p-4 text-center text-gray-500 rounded-lg bg-gray-50">
                      <div className="text-sm">No mockups available</div>
                      <div className="mt-1 text-xs">for selected color</div>
                    </div>
                  );
                }
                
                return colorMockups.map((mockup, index) => {
                  const isSelectedMockup = selectedHeroMockup?.id === mockup.id || 
                                           (!selectedHeroMockup && index === 0);
                  
                  const mockupAreaName = mockup.area?.[0]?.areaName || mockup.viewAngle || mockup.title || `View ${index + 1}`;

                   // ðŸ”¥ Get thumbnail dimensions from PayloadCMS
                  const thumbnailDims = getMockupDimensions(mockup, 'thumbnail');

                  const engineType = determineRequiredEngine(mockup);
                  const requiresPixi = engineType === 'pixi';

                    //console.log(`Mockup ${mockup.id} requires PIXI:`, requiresPixi);
                  ////console.log('Thumbnail dimensions:', thumbnailDims);

                    // const thumbnailKey = requiresPixi
                    // ? `thumb-${mockup.id}-${activeColor}-${isSelectedMockup ? 'sel' : 'unsel'}`
                    // : `thumb-${mockup.id}-${activeColor}`;
                  
                  return (
                    <div key={`mockup-${mockup.id}`}>
                      <button
                       onSelect={() => {
                          //console.log('Thumbnail selected:', mockup.title, 'size:', (mockup as any).photoSize);
                          setSelectedHeroMockup(mockup);
                        }}
                        className={`w-full p-2 border rounded-lg transition-all touch-manipulation ${
                          isSelectedMockup
                            ? 'border-orange-500 ring-2 ring-orange-200'
                            : 'border-none hover:border-white-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="relative mb-2 overflow-hidden rounded bg-white-100 aspect-square">
                          {requiresPixi ? (
                          // PIXI: Use dynamic key to force cleanup
                          <ThumbnailPreview
                            key={`thumb-pixi-${mockup.id}-${activeColor}-${isSelectedMockup}`}
                            mockup={mockup}
                            designElements={getVisibleDesignElements(designElements)} 
                            canvasConfigs={canvasConfigs}
                            canvasPrintableAreas={printableAreas}
                            productColor={activeColor}
                            displayDimensions={thumbnailDims}
                            isSelected={isSelectedMockup}
                            isMainPreview={false}
                            onSelect={() => setSelectedHeroMockup(mockup)}
                            productData={productData}
                          />
                        ) : (
                          // Canvas: No key = smooth, no remount
                          <ThumbnailPreview
                            mockup={mockup}
                            designElements={getVisibleDesignElements(designElements)} 
                            canvasConfigs={canvasConfigs}
                            canvasPrintableAreas={printableAreas}
                            productColor={activeColor}
                            displayDimensions={thumbnailDims}
                            isSelected={isSelectedMockup}
                            isMainPreview={false}
                            onSelect={() => setSelectedHeroMockup(mockup)}
                            productData={productData}
                          />
                        )}
                                         
                          
                        </div>
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Preview */}
      <div className="flex flex-col flex-1 p-2 overflow-y-auto sm:px-4 sm:pb-2 sm:pt-0">
        <div className="flex items-start justify-center flex-1">
          {/* Main Container - Preview + Color Circles */}
          <div className="flex flex-col items-center gap-4">
            
            {/* ðŸ”¥ MOBILE: Color Circles ABOVE Preview */}
            {isMobile && productData?.color_Images && (
              <div className="w-[300px]">
                <div className="flex flex-wrap justify-center gap-3 py-2">
                  {selectedColors.map((color) => {
                    const isActive = activeColor === color.value;
                    
                    return (
                      <button
                        key={color.value}
                        onClick={() => setActiveColor(color.value)}
                        className="flex flex-col items-center group"
                        title={`${color.name} - Click to activate`}
                      >
                        <div className="relative">
                          <div
                            className={`w-10 h-10 rounded-full border-3 transition-all transform hover:scale-110 shadow-md ${
                              isActive
                                ? 'scale-110'
                                : 'border-gray-300 group-hover:border-gray-400 group-hover:shadow-lg'
                            }`}
                            style={{ 
                              backgroundColor: color.value,
                              borderColor: isActive ? '#e65100' : undefined,
                              boxShadow: isActive ? '0 0 0 4px rgba(230, 81, 0, 0.3)' : undefined
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Main Preview */}
            <div className="relative">
              <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] relative bg-white rounded-lg overflow-hidden">
                {(() => {
                  const getHeroMockupForActiveColorAndArea = () => {
                  // ðŸ”¥ FIX: Check if selected mockup matches current size
                  if (selectedHeroMockup) {
                    const mockupSize = (selectedHeroMockup as any).photoSize;
                    
                    // Only keep selected mockup if size matches (or size_Images is false)
                    if (!productData.size_Images || mockupSize === activeSize) {
                      return selectedHeroMockup;
                    }
                    
                    // Size doesn't match, clear it
                    //console.log('Clearing mismatched mockup - was:', mockupSize, 'need:', activeSize);
                  }
                  
                  const colorMockups = getMockupsForColor(
                    productData, 
                    activeColor, 
                    activeTechnology,
                    productData.size_Images ? activeSize : undefined
                  );
                  
                  //console.log('Available mockups for size', activeSize, ':', colorMockups.length);
                  
                  const areaSpecificMockups = colorMockups.filter(mockup => {
                    return mockup.area?.some(area => 
                      area.areaName?.toLowerCase() === activeArea.toLowerCase()
                    );
                  });
                  
                  return areaSpecificMockups[0] || colorMockups[0] || null;
                };
                  
                  const heroMockup = getHeroMockupForActiveColorAndArea();
                  
                  if (!heroMockup) {
                    const activeColorName = selectedColors.find(c => c.value === activeColor)?.name || 'selected color';
                    return (
                      <div className="flex items-center justify-center w-full h-full text-gray-400">
                        <div className="text-center">
                          <div className="mb-4 text-4xl">🎨</div>
                          <p className="font-medium">No preview available</p>
                          <p className="mt-2 text-sm">for <strong>{activeArea}</strong> area</p>
                          <p className="text-sm">in <strong>{activeColorName}</strong></p>
                        </div>
                      </div>
                    );
                  }
                  
                  const mockupDims = getMockupDimensions(heroMockup, 'mockup');    
                  
               const engineType = determineRequiredEngine(heroMockup);
              const requiresPixi = engineType === 'pixi';

                  // const mainPreviewKey = requiresPixi 
                  //   ? `main-preview-${heroMockup.id}-${activeColor}-${Date.now()}` // Force remount for PIXI
                  //   : `main-canvas-${heroMockup.id}`; // Stable key for Canvas

              
                  return (
                    <div className="w-full h-full">
                      {requiresPixi ? (
                      // PIXI: Force remount with dynamic key
                      <ThumbnailPreview
                        key={`main-pixi-${heroMockup.id}-${activeColor}-${Date.now()}`}
                        mockup={heroMockup}
                        designElements={getVisibleDesignElements(designElements)}  
                        canvasConfigs={canvasConfigs}
                        canvasPrintableAreas={printableAreas}
                        productColor={activeColor}
                        displayDimensions={mockupDims}
                        isMainPreview={true}
                        isSelected={true}
                        onSelect={() => {}}
                        productData={productData}
                      />
                    ) : (
                      // Canvas: No key = smooth transitions
                      <ThumbnailPreview
                        mockup={heroMockup}
                        designElements={getVisibleDesignElements(designElements)}  
                        canvasConfigs={canvasConfigs}
                        canvasPrintableAreas={printableAreas}
                        productColor={activeColor}
                        displayDimensions={mockupDims}
                        isMainPreview={true}
                        isSelected={true}
                        onSelect={() => {}}
                        productData={productData}
                      />
                    )}
                    </div>
                  );
                })()}
              </div>
            </div>
            
            {/* ðŸ”¥ MOBILE: Mockup Thumbnails - Horizontal Scrollable BELOW Preview */}
            {isMobile && productData?.color_Images && (
              <div className="w-[300px]">
                <div className="flex gap-3 pb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {(() => {
                    const colorMockups = getMockupsForColor(productData, activeColor, activeTechnology ,  productData.size_Images ? activeSize : undefined);
                    
                    if (colorMockups.length === 0) {
                      return (
                        <div className="flex items-center justify-center w-full p-4 text-center text-gray-500 rounded-lg bg-gray-50">
                          <div className="text-sm">No mockups available</div>
                        </div>
                      );
                    }
                    
                    return colorMockups.map((mockup, index) => {
                      const isSelectedMockup = selectedHeroMockup?.id === mockup.id || 
                                              (!selectedHeroMockup && index === 0);
                      
                      const thumbnailDims = getMockupDimensions(mockup, 'thumbnail');

                      // Check if this specific mockup uses PIXI
                   const engineType = determineRequiredEngine(mockup);
                    const requiresPixi = engineType === 'pixi';
                      
                      // Different key strategy: PIXI needs remount, Canvas doesn't
                      // const thumbnailKey = requiresPixi
                      //   ? `thumb-${mockup.id}-${activeColor}-${isSelectedMockup ? 'sel' : 'unsel'}`
                      //    : `thumb-canvas-${mockup.id}`;
                      
                      return (
                        <div key={`mobile-mockup-${mockup.id}`} className="flex-shrink-0">
                          <button
                            onClick={() => setSelectedHeroMockup(mockup)}
                            className={`w-20 h-20 p-1 border rounded-lg transition-all touch-manipulation ${
                              isSelectedMockup
                                ? 'border-orange-500 ring-orange-200'
                                : 'border-none hover:border-white-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="relative w-full h-full overflow-hidden bg-gray-100 rounded border-none">
                               {requiresPixi ? (
                              // PIXI: Use dynamic key to force cleanup
                              <ThumbnailPreview
                                key={`thumb-pixi-${mockup.id}-${activeColor}-${isSelectedMockup}`}
                                mockup={mockup}
                                designElements={getVisibleDesignElements(designElements)} 
                                canvasConfigs={canvasConfigs}
                                canvasPrintableAreas={printableAreas}
                                productColor={activeColor}
                                displayDimensions={thumbnailDims}
                                isSelected={isSelectedMockup}
                                isMainPreview={false}
                                onSelect={() => setSelectedHeroMockup(mockup)}
                                productData={productData}
                              />
                            ) : (
                              // Canvas: No key = smooth, no remount
                              <ThumbnailPreview
                                mockup={mockup}
                                designElements={getVisibleDesignElements(designElements)} 
                                canvasConfigs={canvasConfigs}
                                canvasPrintableAreas={printableAreas}
                                productColor={activeColor}
                                displayDimensions={thumbnailDims}
                                isSelected={isSelectedMockup}
                                isMainPreview={false}
                                onSelect={() => setSelectedHeroMockup(mockup)}
                                productData={productData}
                              />
                            )}
                            </div>
                          </button>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
            
            {/* ðŸ”¥ DESKTOP: Color Circles BELOW Preview (unchanged) */}
            {!isMobile && productData?.color_Images&& (
              <div className="w-[400px]">
                <div className="flex flex-wrap justify-center gap-3 py-0">
                  {selectedColors.map((color) => {
                    const isActive = activeColor === color.value;
                    
                    return (
                      <button
                        key={color.value}
                        onClick={() => setActiveColor(color.value)}
                        className="flex flex-col items-center group"
                        title={`${color.name} - Click to activate`}
                      >
                        <div className="relative">
                          <div
                            className={`w-10 h-10 rounded-full border-3 transition-all transform hover:scale-110 shadow-md ${
                              isActive
                                ? 'scale-110'
                                : 'border-gray-300 group-hover:border-gray-400 group-hover:shadow-lg'
                            }`}
                            style={{ 
                              backgroundColor: color.value,
                              borderColor: isActive ? '#e65100' : undefined,
                              boxShadow: isActive ? '0 0 0 4px #e65100' : undefined
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}         
                </div>
              </div>
            )}

              {/* Desktop: Size Selector with Mockup Thumbnails */}
              {!isMobile && productData.size_Images && selectedSizes.length > 1 && (
                <div className="w-[400px] mt-0">
                  <div className="flex flex-wrap justify-center gap-3 pt-0 pb-2">
                    {selectedSizes.map((size) => {
                      const isActive = activeSize === size;
                      
                      // Get mockup for this specific size
                      const sizeMockups = getMockupsForColor(
                        productData,
                        activeColor,
                        activeTechnology,
                        size // Pass size to filter
                      );
                      
                      const mockupForSize = sizeMockups[0]; // Get first available mockup for this size
                      
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            //console.log('Size mockup clicked:', size);
                            setActiveSize(size);
                            
                            // Set the specific mockup for this size
                            if (mockupForSize) {
                              setSelectedHeroMockup(mockupForSize);
                            } else {
                              setSelectedHeroMockup(null);
                            }
                          }}
                          className={`flex flex-col items-center p-2 border-2 rounded-lg transition-all touch-manipulation ${
                            isActive
                              ? 'border-orange-500 ring-2 ring-orange-200'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {/* Mockup Thumbnail */}
                          <div className="relative w-20 h-20 mb-2 overflow-hidden bg-gray-100 rounded">
                            {mockupForSize ? (
                              <img
                                src={resolveImageUrl(mockupForSize.photo.url)}
                                alt={`${size} mockup`}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
                                No mockup
                              </div>
                            )}
                            
                            {/* Active indicator badge */}
                            {isActive && (
                              <div className="absolute flex items-center justify-center w-6 h-6 bg-orange-500 rounded-full top-1 right-1">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Size Label */}
                          <span className={`text-sm font-medium ${
                            isActive ? 'text-orange-600' : 'text-gray-700'
                          }`}>
                            {size}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mobile: Size Selector with Mockup Thumbnails */}
              {isMobile && productData.size_Images && selectedSizes.length > 0 && (
                <div className="w-[300px] mt-3">
                  <div className="flex flex-wrap justify-center gap-2 py-2">
                    {selectedSizes.map((size) => {
                      const isActive = activeSize === size;
                      
                      // Get mockup for this specific size
                      const sizeMockups = getMockupsForColor(
                        productData,
                        activeColor,
                        activeTechnology,
                        size
                      );
                      
                      const mockupForSize = sizeMockups[0];
                      
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            //console.log('Size mockup clicked (mobile):', size);
                            setActiveSize(size);
                            
                            if (mockupForSize) {
                              setSelectedHeroMockup(mockupForSize);
                            } else {
                              setSelectedHeroMockup(null);
                            }
                          }}
                          className={`flex flex-col items-center p-1.5 border-2 rounded-lg transition-all touch-manipulation ${
                            isActive
                              ? 'border-orange-500 ring-2 ring-orange-200'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {/* Mockup Thumbnail - Smaller for mobile */}
                          <div className="relative w-16 h-16 mb-1 overflow-hidden bg-gray-100 rounded">
                            {mockupForSize ? (
                              <img
                                src={resolveImageUrl(mockupForSize.photo.url)}
                                alt={`${size} mockup`}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
                                No mockup
                              </div>
                            )}
                            
                            {isActive && (
                              <div className="absolute flex items-center justify-center w-5 h-5 bg-orange-500 rounded-full top-1 right-1">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Size Label */}
                          <span className={`text-xs font-medium ${
                            isActive ? 'text-orange-600' : 'text-gray-700'
                          }`}>
                            {size}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}






          </div>
        </div>
      </div>
      
    </div>
  );
}, [
  allMockups,
  selectedColors,
  selectedSizes,
  selectedHeroMockup,
  designElements, 
  getAllCanvasConfigs, 
  getAllPrintableAreas, 
  productData,
  getSurfaceConfiguration,
  activeArea,
  activeColor,
  activeTechnology,
  availableAreas,
  getVisibleDesignElements
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
            // x={element.x}
            // y={element.y}
            x={element.x + element.width / 2}
            y={element.y + element.height / 2}
            offsetX={element.width / 2}
            offsetY={element.height / 2}
            width={element.width}
            height={element.height}
            rotation={element.rotation}
            scaleX={element.scaleX}
            scaleY={element.scaleY}
            draggable={element.draggable && !isLocked}
            opacity={element.opacity || 1}
            listening={!isLocked}
            onClick={() => !isLocked && setSelectedId(element.id)}
            onTap={() => !isLocked && setSelectedId(element.id)}
            onTouchStart={() => !isLocked && setSelectedId(element.id)}
            onDragEnd={(e) => {
              if (isLocked) return;
              
              setDesignElements(prev => {
                const updated = { ...prev };
                if (updated[areaId]) {
                  updated[areaId] = updated[areaId].map(el =>
                    el.id === element.id ? { ...el, x: e.target.x() - element.width / 2, y: e.target.y() - element.height / 2 } : el
                  );
                }
                return updated;
              });
              
              // Recalculate pricing after drag
              setTimeout(() => updatePricingData(), 100);
            }}

            onTransformEnd={(e) => {
            if (isLocked) return;
            const node = e.target;
            
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            
            // Calculate new dimensions from the actual node size after scaling
            const newWidth = Math.max(10, node.width() * scaleX);
            const newHeight = Math.max(10, node.height() * scaleY);
            
            // //console.log('ðŸ”§ TRANSFORM UPDATE:', {
            //   elementId: element.id,
            //   beforeWidth: element.width,
            //   beforeHeight: element.height,
            //   afterWidth: newWidth,
            //   afterHeight: newHeight,
            //   scaleX,
            //   scaleY,
            //   nodeWidth: node.width(),
            //   nodeHeight: node.height()
            // });
            
            setDesignElements(prev => {
              const updated = { ...prev };
              if (updated[areaId]) {
                updated[areaId] = updated[areaId].map(el =>
                  el.id === element.id ? {
                    ...el,
                    // x: node.x(),
                    // y: node.y(),
                    x: node.x() - newWidth / 2,
                    y: node.y() - newHeight / 2,
                    rotation: node.rotation(),
                    width: newWidth,      // Update with scaled width
                    height: newHeight,    // Update with scaled height  
                    scaleX: 1,           // Reset scale to 1
                    scaleY: 1,           // Reset scale to 1
                  } : el
                );
              }
              return updated;
            });
            
            // Reset the node scales after updating state
            node.scaleX(1);
            node.scaleY(1);
            
            // Recalculate pricing after transform
            setTimeout(() => updatePricingData(), 150);
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
            // x={element.x}
            // y={element.y}
            x={element.x + element.width / 2}
            y={element.y + (element.height || element.fontSize || 20) / 2}
            offsetX={element.width / 2}
            offsetY={(element.height || element.fontSize || 20) / 2}
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
              
              // //console.log('ðŸ”§ DRAG UPDATE:', {
              //   elementId: element.id,
              //   newX: e.target.x(),
              //   newY: e.target.y()
              // });
              
              setDesignElements(prev => {
                const updated = { ...prev };
                if (updated[areaId]) {
                  updated[areaId] = updated[areaId].map(el =>
                    el.id === element.id ? { ...el, x: e.target.x() - element.width / 2, y: e.target.y() - (element.height || element.fontSize || 20) / 2 } : el
                  );
                }
                return updated;
              });
              
              // Recalculate pricing after drag
              setTimeout(() => updatePricingData(), 100);
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
                      // x: node.x(),
                      // y: node.y(),
                      x: node.x() - element.width / 2,
                      y: node.y() - (element.height || element.fontSize || 20) / 2,
                      rotation: node.rotation(),
                      scaleX: node.scaleX(),
                      scaleY: node.scaleY(),
                    } : el
                  );
                }
                return updated;
              });
              
              // ðŸ”¥ NEW: Recalculate pricing after transform
              setTimeout(() => updatePricingData(), 100);
            }}
          />
        );
      }
      
      return null;
    });
}, [designElements, selectedId, updatePricingData]);
  
  const renderCanvas = useCallback(() => {
 const canvasConfig = getCanvasConfig(activeArea, activeColor);
 const printableArea = getPrintableAreaFromPhoto(activeArea, activeColor);
 const canvasImage = canvasImages[`${activeArea}_${activeColor}`] || canvasImages[activeArea];
 const surfaceConfig = getSurfaceConfiguration();

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
          onTap={handleStageClick}
          onTouchStart={(e) => {
          if (e.target === e.target.getStage()) {
          setSelectedId(null);
          }
          }}
          className="bg-white border border-none rounded-lg shadow-sm touch-manipulation"
        >
      {/* LAYER 1: Base Color Layer - Always visible, changes with activeColor */}
      <Layer>
        <Rect
        x={0}
        y={0}
        width={canvasConfig.width}
        height={canvasConfig.height}
        fill={activeColor}
        listening={false}
        />
      </Layer>

      {/* LAYER 2: Template/T-Shirt Image Layer - Shows on top with proper masking */}
      {canvasImage && (
        <Layer>
          <KonvaImage
          image={canvasImage}
          x={0}
          y={0}
          width={canvasConfig.width}
          height={canvasConfig.height}
          listening={false}
          opacity={1}
          />
        </Layer>
      )}

      {/* LAYER 3: Subtle texture overlay - optional */}
      {canvasImage && (
        <Layer>
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
        </Layer>
      )}

      {/* LAYER 4: Printable area boundary */}
      <Layer>
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
      </Layer>

      {/* LAYER 5: Design elements (clipped to printable area) */}
      <Layer ref={layerRef}>
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
      </Layer>

      {/* LAYER 6: Transformer for selected element - MUST BE LAST to stay on top */}
      <Layer listening={true}>
        <Transformer
        ref={transformerRef}
        anchorStroke={brandColor}
        anchorFill="#FFFFFF"
        anchorSize={isMobile ? 12 : 8}
        borderStroke={brandColor}
        borderDash={[4, 4]}
        rotateAnchorOffset={25}
        keepRatio={true
        }
        listening={true}
        anchorStyleFunc={(anchor) => {
        anchor.cornerRadius(2);
        anchor.strokeWidth(2);
        if (anchor.hasName('top-center') || anchor.hasName('bottom-center') ||
        anchor.hasName('middle-left') || anchor.hasName('middle-right')) {
        anchor.width(8);
        anchor.height(8);
        }
        }}
        boundBoxFunc={(oldBox, newBox) => {
        if (newBox.width < 10 || newBox.height < 10) {
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

      {/* Dragging overlay indicator */}
      {isDraggingPanel && !isMobile && (
        <div className="fixed inset-0 z-40 pointer-events-none bg-black/5">
          <div className="absolute px-4 py-2 text-sm font-medium text-orange-600 -translate-x-1/2 bg-white rounded-lg shadow-lg top-4 left-1/2">
          ↕️ Drag to reposition alignment panel
          </div>
        </div>
      )}

      {/* Mobile-friendly element controls */}
      {selectedId && (
        <div
        ref={panelRef}
        className={`${
        isMobile
        ? 'absolute -bottom-16 left-4 right-4'
        : 'fixed'
        } sm:p-3 px-3 py-0 bg-white border-2 border-orange-500 shadow-xl rounded-xl z-[60] ${
        isDraggingPanel ? 'cursor-grabbing shadow-2xl' : 'cursor-default'
        }`}
        style={!isMobile ? {
        left: `${alignmentPanelPos.x}px`,
        top: `${alignmentPanelPos.y}px`,
        userSelect: 'none',
        transition: isDraggingPanel ? 'none' : 'box-shadow 0.2s ease',
        pointerEvents: 'auto',
        maxWidth: '250px',
        willChange: isDraggingPanel ? 'transform' : 'auto',
        transform: isDraggingPanel ? 'scale(1.02)' : 'scale(1)',
        } : {}}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handlePanelMouseDown}
        >
      {!isMobile && (
        <div
        data-drag-handle="true"
        className={`flex items-center justify-between pb-2 mb-2 border-b border-gray-200 ${
        isDraggingPanel ? 'cursor-grabbing bg-gray-50' : 'cursor-grab hover:bg-gray-50'
        } rounded-t-lg transition-colors px-2 py-1`}
        >
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
      <div className={`w-1 h-1 rounded-full transition-colors ${
      isDraggingPanel ? 'bg-orange-500' : 'bg-gray-400'
      }`}></div>
      <div className={`w-1 h-1 rounded-full transition-colors ${
      isDraggingPanel ? 'bg-orange-500' : 'bg-gray-400'
      }`}></div>
      <div className={`w-1 h-1 rounded-full transition-colors ${
      isDraggingPanel ? 'bg-orange-500' : 'bg-gray-400'
      }`}></div>
      <div className={`w-1 h-1 rounded-full transition-colors ${
      isDraggingPanel ? 'bg-orange-500' : 'bg-gray-400'
      }`}></div>
      </div>
      <span className="text-xs font-medium text-gray-500">
      {isDraggingPanel ? 'Dragging...' : 'Drag to move'}
      </span>
      </div>
      </div>
      )}

      <div className="space-y-0 md:space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 md:flex-col md:gap-0">
      <div className="flex items-center gap-1 md:w-full">
      <div className="text-xs font-medium text-gray-700">Alignment</div>

{/* Desktop alignment: 3x2 grid with arrows */}
<div className="grid grid-cols-3 gap-1 ml-1">
  {/* Left */}
  <button
    onClick={() => centerElement('left')}
    className="p-2 text-gray-600 transition-colors rounded-md hover:bg-orange-50 hover:text-orange-600 touch-manipulation"
    title="Align left"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5 5-5M6 12h12" />
    </svg>
  </button>

  {/* Horizontal center */}
  <button
    onClick={() => centerElement('hcenter')}
    className="p-2 text-gray-600 transition-colors rounded-md hover:bg-orange-50 hover:text-orange-600 touch-manipulation"
    title="Center horizontally"
  >
   <svg
  className="w-4 h-4"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth={2}
  strokeLinecap="round"
  strokeLinejoin="round"
>
  {/* Center vertical bar */}
  <path d="M12 4v16" />

  {/* Left arrow (pointing right, toward the bar) */}
  <path d="M4 12h5" />
  <path d="M7 9l3 3-3 3" />

  {/* Right arrow (pointing left, toward the bar) */}
  <path d="M20 12h-5" />
  <path d="M17 9l-3 3 3 3" />
</svg>


  </button>
  {/* Right */}
  <button
    onClick={() => centerElement('right')}
    className="p-2 text-gray-600 transition-colors rounded-md hover:bg-orange-50 hover:text-orange-600 touch-manipulation"
    title="Align right"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
    </svg>
  </button>

  {/* Top */}
  <button
    onClick={() => centerElement('top')}
    className="p-2 text-gray-600 transition-colors rounded-md hover:bg-orange-50 hover:text-orange-600 touch-manipulation"
    title="Align top"
  >
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11V3m0 0L7 7m5-4 5 4M4 21h16" />
    </svg>
  </button>

  {/* Vertical center */}
  <button
    onClick={() => centerElement('vcenter')}
    className="p-2 text-gray-600 transition-colors rounded-md hover:bg-orange-50 hover:text-orange-600 touch-manipulation"
    title="Center vertically"
  >
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
     strokeLinecap="round" strokeLinejoin="round">

  {/* Top arrow */}
  <path d="M12 5v5" />
  <path d="M9 8l3 3 3-3" />

  {/* Center horizontal bar */}
  <path d="M4 12h16" />

  {/* Bottom arrow */}
  <path d="M12 19v-5" />
  <path d="M9 16l3-3 3 3" />
</svg>

  </button>

  {/* Bottom */}
  <button
    onClick={() => centerElement('bottom')}
    className="p-2 text-gray-600 transition-colors rounded-md hover:bg-orange-50 hover:text-orange-600 touch-manipulation"
    title="Align bottom"
  >
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 13v8m0 0l5-4m-5 4-5-4M4 3h16" />
    </svg>
  </button>
</div>

      </div>
      {/* Rotation Angle Display */}
      {(() => {
        const selectedElement = designElements[activeArea]?.find(el => el.id === selectedId);
        const rotation = selectedElement?.rotation || 0;
        return (
          <div className="flex items-center justify-between w-1/2 sm:w-full md:w-full pt-2 pb-2 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xs font-medium text-gray-700">Rotation</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-orange-600">
                {Math.round(rotation)}°
              </span>
            </div>
          </div>
        );
      })()}
      <div className="flex items-center gap-2 md:w-full md:pt-3 md:border-t md:border-gray-200">
      <button
      onClick={deleteSelectedElement}
      className="p-2 text-red-600 transition-colors rounded-md hover:bg-red-50 touch-manipulation"
      title="Delete element"
      >
      <Trash2 size={14} />
      </button>
      <button
      onClick={(e) => {
      e.stopPropagation();
      setSelectedId(null);
      }}
      className="p-2 text-orange-500 transition-colors rounded-md hover:bg-orange-50"
      title="Close"
      >
      <X size={16} />
      </button>
      </div>
      </div>
      </div>
      </div>
      )}
      </div>
      );
}, [getCanvasConfig, getPrintableAreaFromPhoto, activeArea, activeColor, canvasImages, handleStageClick, brandColor, renderDesignElements, selectedId, centerElement, deleteSelectedElement, getSurfaceConfiguration, isMobile, handlePanelMouseDown, isDraggingPanel, alignmentPanelPos]);

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
                
                {/* <div>
                  <label className="text-xs font-medium tracking-wider text-black uppercase">Brand</label>
                  <p className="mt-1 text-sm text-black">{productData?.brand || 'Junooni'}</p>
                </div> */}

                 {/* ðŸ”¥ NEW: Current pricing summary */}
                {totalPrice > 0 && (
                  <div className="p-2 border border-green-200 rounded bg-green-50">
                    <label className="text-xs font-medium tracking-wider text-green-700 uppercase">Current Price</label>
                    <p className="mt-1 text-lg font-bold text-green-800">Rs.{totalPrice}</p>
                    <p className="text-xs text-green-600">per unit</p>
                  </div>
                )}
              </div>
            </div>

            {/* Technology Information */}
            <div className="p-2 rounded-lg ">
                {renderTechnologySelector()}
            </div>
          </div>
        );

        case 'colors':
          return (
            <div className="space-y-4">
              <h3 className="font-medium">Enhanced Color Selection</h3>
              
              <div className={`flex flex-wrap gap-2 mb-4`}>
                {productData?.colorOptions?.map((color: any) => {
                  const isSelected = selectedColors.some(c => c.value === color.colorHex);
                  const tickColor = isLightColor(color.colorHex) ? '#000000' : '#FFFFFF';
                  
                  return (
                    <button
                      key={color.colorHex}
                      onClick={() => handleColorChange(color.colorHex, color.colorName)}
                      className={`w-8 h-8 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg border-2 transition-all hover:scale-105 flex items-center justify-center touch-manipulation ${
                        isSelected
                          ? 'border-orange-500 ring-2 ring-orange-200 scale-110' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.colorHex }}
                      title={color.colorName}
                    >
                      {isSelected && (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill={tickColor}
                          width="16" 
                          height="16"
                          style={{ 
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                            strokeWidth: '0.5px',
                            stroke: tickColor === '#FFFFFF' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'
                          }}
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </button>
                  );
                })}
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

        // case 'library':
        //   return (
        //     <div className="space-y-4">
        //       <h3 className="font-medium">Design Library</h3>
        //       <p className="text-sm text-gray-600">Browse pre-made designs and templates</p>
        //       <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
        //         <div className="flex items-center justify-center bg-gray-100 rounded-lg aspect-square">
        //           <span className="text-xs text-gray-400">Template 1</span>
        //         </div>
        //         <div className="flex items-center justify-center bg-gray-100 rounded-lg aspect-square">
        //           <span className="text-xs text-gray-400">Template 2</span>
        //         </div>
        //       </div>
        //     </div>
        //   );

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

           case 'pricing':
           return renderPricingPanel();

        default:
          return null;
      }
    };
    
    // =====================================
    // EFFECTS
    // =====================================
// Update active size when selected sizes change

// Add this useEffect near your other effects (around line 5500-5600)
useEffect(() => {
  // Only run on desktop and when panel is visible
  if (isMobile && !isMobile || !selectedId) return;

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if click is on the panel itself
    if (panelRef.current && panelRef.current.contains(target)) {
      return; // Don't close if clicking inside panel
    }
    
    // Check if click is on the canvas transformer/selected element
    const isCanvasClick = target.closest('.konvajs-content');
    if (isCanvasClick) {
      return; // Don't close if clicking on canvas (handled by Konva)
    }
    
    // Check if click is on a layer in the layers panel (to prevent interference)
    const isLayerPanelClick = target.closest('[data-layer-panel]');
    if (isLayerPanelClick) {
      return;
    }
    
    // Close the panel by deselecting the element
    //console.log('ðŸ”µ Clicked outside alignment panel - closing');
    setSelectedId(null);
  };

  // Add event listener after a small delay to prevent immediate closing
  const timeoutId = setTimeout(() => {
    document.addEventListener('mousedown', handleClickOutside, true);
  }, 100);

  return () => {
    clearTimeout(timeoutId);
    document.removeEventListener('mousedown', handleClickOutside, true);
  };
}, [selectedId, isMobile]);
useEffect(() => {
  if (selectedSizes.length > 0 && !selectedSizes.includes(activeSize)) {
    setActiveSize(selectedSizes[0]);
  }
}, [selectedSizes, activeSize]);


useEffect(() => {
  if (isDraggingPanel) {
    // Attach listeners to document for better capture
    document.addEventListener('mousemove', handlePanelMouseMove, { capture: true });
    document.addEventListener('mouseup', handlePanelMouseUp, { capture: true });
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    
    // Disable pointer events on canvas
    const canvasContainer = document.querySelector('.konvajs-content');
    if (canvasContainer) {
      (canvasContainer as HTMLElement).style.pointerEvents = 'none';
    }
    
    return () => {
      document.removeEventListener('mousemove', handlePanelMouseMove, { capture: true });
      document.removeEventListener('mouseup', handlePanelMouseUp, { capture: true });
      
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      
      if (canvasContainer) {
        (canvasContainer as HTMLElement).style.pointerEvents = 'auto';
      }
    };
  }
}, [isDraggingPanel, handlePanelMouseMove, handlePanelMouseUp]);

// ðŸ”¥ FIX: Reset hero mockup when size changes
  useEffect(() => {
    designElementsRef.current = designElements;
  }, [designElements]);

  // --- add AFTER the activeTechnology state declaration ---
useEffect(() => {
  try {
    // read technology param from URL
    const params = new URLSearchParams(window.location.search);
    const techParam = params.get('technology');

    if (techParam && productData?.printT && Array.isArray(productData.printT)) {
      const found = productData.printT.find((t: any) => t.id === techParam || t.technologyName === techParam);
      if (found) {
        setActiveTechnology(found.id);
      }
    }
  } catch (err) {
    // non-fatal â€” ignore if window or URLSearchParams unavailable in some envs
    ////console.warn('Unable to parse technology from URL', err);
  }
}, [productData]);


  // âœ… ADD THIS: Periodic state validator
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
  // Auto-select hero mockup based on active color - PRESERVE AREA on color change
useEffect(() => {
  if (allMockups.length > 0 && activeColor) {
    // 🔥 FIX: Determine which area to preserve
    // If user has a selected mockup, keep its area when color changes
    let targetArea = activeArea; // Default to activeArea
    
    if (selectedHeroMockup?.area && selectedHeroMockup.area.length > 0) {
      // User has selected a specific mockup - preserve its area
      const currentMockupArea = selectedHeroMockup.area[0]?.areaName?.toLowerCase();
      if (currentMockupArea) {
        targetArea = currentMockupArea; // Use the selected mockup's area
        //console.log('Preserving area from selected mockup:', targetArea);
      }
    }
    
    // Get mockups for the active color
    const colorMockups = getMockupsForColor(
      productData,
      activeColor,
      activeTechnology,
      productData.size_Images ? activeSize : undefined
    );
    
    // 🔥 FIX: Filter to mockups that match the TARGET area (preserved from selection)
    const areaSpecificMockups = colorMockups.filter(mockup => {
      if (!mockup.area || !Array.isArray(mockup.area)) return false;
      
      return mockup.area.some(area => {
        if (!area?.areaName) return false;
        return area.areaName.toLowerCase() === targetArea.toLowerCase();
      });
    });
    
    // Prefer area-specific mockup, fallback to any mockup for this color
    let bestMockup = areaSpecificMockups[0] || colorMockups[0];
    
    // If still no mockup, try neutral colors for the target area
    if (!bestMockup) {
      const neutralDetector = createDynamicNeutralDetector(productData);
      const neutralMockups = allMockups.filter(mockup => {
        const mockupColor = mockup.photoColor || '';
        
        if (!mockup.area || !Array.isArray(mockup.area)) return false;
        
        const hasTargetArea = mockup.area.some(area => {
          if (!area?.areaName) return false;
          return area.areaName.toLowerCase() === targetArea.toLowerCase();
        });
        
        return neutralDetector.isNeutral(mockupColor) && hasTargetArea;
      });
      
      bestMockup = neutralMockups[0];
    }
    
    // Auto-select the best mockup for the target area
    if (bestMockup) {
      //console.log('Auto-selecting mockup for area:', targetArea, '-> mockup:', bestMockup.title);
      setSelectedHeroMockup(bestMockup);
    }
  }
}, [activeColor, allMockups, productData, activeTechnology, activeSize, selectedHeroMockup]);
    
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
    
    // ðŸ”¥ FIX: Load canvas images for ALL areas, not just the active one
  useEffect(() => {
    const loadAllAreaImages = async () => {
      const technology = getCurrentTechnology();
      if (!technology?.custAreas?.length) return;
      
      // Load images for ALL available areas
      for (const area of availableAreas) {
        try {
          const custArea = getCustomizationAreaByName(area);
          if (!custArea?.designCanvasPhotos?.length) {
            ////console.log(`No designCanvasPhotos for area: ${area}`);
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
              ////console.log(`Preloaded image for area: ${area}`);
              resolve();
            };
            
            img.onerror = (error) => {
              ////console.error(`Failed to preload image for area: ${area}`, error);
              reject(error);
            };
            
            img.src = resolvedUrl;
          });
        } catch (error) {
          ////console.error(`Error preloading image for area: ${area}:`, error);
        }
      }
    };
    
    loadAllAreaImages();
  }, [activeColor, activeTechnology, availableAreas, getCurrentTechnology, getCustomizationAreaByName]);

  // ðŸ”¥ ADD: Separate effect for active area changes
  useEffect(() => {
    const loadActiveAreaImage = async () => {
      const area = getCustomizationAreaByName(activeArea);
      if (!area?.designCanvasPhotos?.length) return;
      
      // Check if image is already loaded
      const existingImage = canvasImages[`${activeArea}_${activeColor}`] || canvasImages[activeArea];
      if (existingImage) {
        ////console.log(`Image already loaded for active area: ${activeArea}`);
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
          ////console.log(`Loaded image for active area: ${activeArea}`);
        };
        
        img.onerror = (error) => {
          ////console.error(`Failed to load image for active area: ${activeArea}`, error);
        };
        
        img.src = resolvedUrl;
      } catch (error) {
        ////console.error(`Error loading active area image: ${activeArea}:`, error);
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
    // âœ… REMOVED triggerUpdate() call
    setSelectedId(null);
  }, [activeArea]); // âœ… REMOVED triggerUpdate from deps
    
    useEffect(() => {
      if (activeView === 'preview') {
        setSelectedId(null);
      }
    }, [activeView]);
    
    // âœ… REPLACE THIS useEffect to prevent state reset
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
    
  // ðŸ”¥ ADD: Initialize canvas images on component mount
  useEffect(() => {
    ////console.log('Component mounted, initializing canvas images...');
    
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
    

// 7. EFFECTS SECTION - Add these useEffect hooks for pricing recalculation

// ðŸ”¥ NEW: Main pricing recalculation effect
useEffect(() => {
  // Recalculate pricing whenever design elements change or technology changes
  if (Object.keys(designElements).length > 0) {
    const hasVisibleElements = Object.values(designElements).some(elements => 
      elements.some(element => element.visible !== false)
    );
    
    if (hasVisibleElements) {
      // Debounce pricing calculation to avoid excessive recalculations
      const timeoutId = setTimeout(() => {
        updatePricingData();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      // Clear pricing data when no visible elements
      setPricingData({});
      setTotalPrice(0);
      setPricingBreakdown(null);
    }
  }
}, [designElements, activeTechnology, updatePricingData]);

// ðŸ”¥ NEW: Technology change pricing recalculation
useEffect(() => {
  // When technology changes, recalculate all pricing
  if (activeTechnology) {
    const hasElements = Object.values(designElements).some(elements => 
      elements.length > 0
    );
    
    if (hasElements) {
      ////console.log('Technology changed to:', activeTechnology, '- Recalculating pricing...');
      
      // Reset pricing data first
      setPricingData({});
      setTotalPrice(0);
      setPricingBreakdown(null);
      
      // Recalculate after a short delay to ensure technology data is loaded
      const timeoutId = setTimeout(() => {
        updatePricingData();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }
}, [activeTechnology, designElements, updatePricingData]);

// ðŸ”¥ NEW: Active area change effect
useEffect(() => {
  // When active area changes, update pricing display if needed
  if (activeArea && pricingBreakdown) {
    // This can be used to highlight current area in pricing panel
    // or perform area-specific pricing updates
    ////console.log('Active area changed to:', activeArea);
  }
}, [activeArea, pricingBreakdown]);

// ðŸ”¥ NEW: Color/Size selection pricing impact
useEffect(() => {
  // Recalculate total pricing when color or size selections change
  // This affects the final quantity-based pricing calculations
  if (selectedColors.length > 0 && selectedSizes.length > 0 && pricingBreakdown) {
    const updatedBreakdown = { ...pricingBreakdown };
    // You can add logic here to adjust pricing based on quantity discounts
    // or bulk pricing rules if needed
    
    ////console.log('Selection changed - Colors:', selectedColors.length, 'Sizes:', selectedSizes.length);
  }
}, [selectedColors, selectedSizes, pricingBreakdown]);

// ðŸ”¥ NEW: Element deletion effect
useEffect(() => {
  // When selectedId is null and we previously had a selection,
  // it might indicate element deletion, so recalculate pricing
  if (prevSelectedIdRef.current && !selectedId) {
    // Element might have been deleted
    setTimeout(() => {
      const hasElements = Object.values(designElements).some(elements => 
        elements.length > 0
      );
      
      if (hasElements) {
        updatePricingData();
      } else {
        // All elements deleted, clear pricing
        setPricingData({});
        setTotalPrice(0);
        setPricingBreakdown(null);
      }
    }, 100);
  }
  
  // Update the ref for next time
  prevSelectedIdRef.current = selectedId;
}, [selectedId, designElements, updatePricingData]);

// ðŸ”¥ NEW: Canvas image loading effect with pricing
useEffect(() => {
  // When canvas images load, we might need to recalculate pricing
  // if it affects the printable area calculations
  const loadedImages = Object.keys(canvasImages).length;
  const expectedImages = availableAreas.length;
  
  if (loadedImages > 0 && loadedImages <= expectedImages) {
    // Canvas images are loading/loaded - might affect printable areas
    const hasElements = Object.values(designElements).some(elements => 
      elements.length > 0
    );
    
    if (hasElements && pricingBreakdown) {
      // Recalculate pricing as printable areas might have changed
      setTimeout(() => {
        updatePricingData();
      }, 200);
    }
  }
}, [canvasImages, availableAreas.length, designElements, pricingBreakdown, updatePricingData]);

// ðŸ”¥ NEW: Product data change effect
useEffect(() => {
  // When product data changes (e.g., from API updates), recalculate pricing
  if (productData && Object.keys(designElements).length > 0) {
    ////console.log('Product data updated - Recalculating pricing...');
    
    setTimeout(() => {
      updatePricingData();
    }, 300);
  }
}, [productData, designElements, updatePricingData]);

// In renderPreview, right after getting colorMockups
// useEffect(() => {
//   console.log('ðŸ” Preview State:', {
//     activeSize,
//     activeColor,
//     selectedSizes,
//     size_Images: productData?.size_Images
//   });
// }, [activeSize, activeColor, selectedSizes, productData?.size_Images]);

// ðŸ”¥ NEW: Error handling for pricing calculations
useEffect(() => {
  // Monitor for pricing calculation errors and provide user feedback
  if (priceCalculationLoading) {
    const timeoutId = setTimeout(() => {
      if (priceCalculationLoading) {
        ////console.warn('Pricing calculation taking longer than expected');
        setPriceCalculationLoading(false);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeoutId);
  }
}, [priceCalculationLoading]);



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
          <div className="px-1 py-4 bg-white border-b border-gray-200 shadow-sm sm:px-4">
            <div className="flex items-center justify-between">
              {/* Left: Logo */}
              <div className="flex items-center ml-2">
                <img src={JunooniLogo} alt="Junooni Logo" className="h-8 sm:h-8" />
              </div>
              
              {/* Center: Design/Preview Toggle Buttons */}
              <div className="flex p-0.5 mr-0 sm:p-1 bg-gray-100 border border-gray-200 rounded-lg">
                <button
                  onClick={() => setActiveView('design')}
                  className={`flex items-center gap-0.5 sm:gap-2 
                    px-2 md:px-3 lg:px-4 py-1.5 md:py-2 
                    text-[12px] sm:text-sm font-medium 
                    rounded-md transition-all touch-manipulation ${
                      activeView === 'design'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  style={{
                    backgroundColor: activeView === 'design' ? brandColor : 'transparent'
                  }}
                >
                 {!isMobile && (
                    <PenTool size={16} strokeWidth={2} />
                  )}
                  Design
                </button>
                {/* Debug //console Log */}
                {/* {(() => {
                  console.log('ðŸ” Debug No_Mockup_Compatible:', {
                    productData: productData,
                    No_Mockup_Compatible: productData?.No_Mockup_Compatible,
                    type: typeof productData?.No_Mockup_Compatible,
                    hasProductData: !!productData,
                    allKeys: productData ? Object.keys(productData) : []
                  });
                  return null; // Must return something in JSX
                })()} */}
          
                
                <button
                  onClick={() => setActiveView('preview')}
                  className={`flex items-center gap-0.5 sm:gap-2 
                    px-1.5 sm:px-4 py-1 sm:py-2 
                    text-[12px] sm:text-sm font-medium 
                    rounded-md transition-all touch-manipulation ${
                      activeView === 'preview'
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  style={{
                    backgroundColor: activeView === 'preview' ? brandColor : 'transparent'
                  }}
                >
                  {!isMobile && (
                    <Eye size={16} strokeWidth={2} />
                  )}
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
                      <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Area Thumbnails - Horizontal Scrollable */}
          {activeView === 'design' && isMobile && availableAreas.length > 1 && (
            <div className="w-full bg-white">
              <div className="px-4 pt-2 pb-0">
                <div className="flex pb-0 space-x-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {availableAreas.map(area => {
                    const areaData = getAreaDisplayData(area);
                    const elementCount = designElements[area]?.length || 0;
                    const canvasImage = canvasImages[`${area}_${activeColor}`] || canvasImages[area];
                  
                    return (
                      <div key={area} className="flex-shrink-0">
                        <button
                          onClick={() => setActiveArea(area)}
                          className={`flex flex-col items-center p-2 rounded-lg transition-all touch-manipulation min-w-[80px] ${
                            activeArea === area
                              ? 'border-orange-500 border-2 bg-orange-50'
                              : 'bg-white border-none'
                          }`}
                        >
                          <div className="relative w-16 h-16 mb-0 overflow-hidden bg-white border-none rounded">
                            {canvasImage ? (
                              <div className="relative w-full h-full border-none">
                                {/* LAYER 1: Base color background */}
                                <div
                                  className="absolute inset-0 w-full h-full"
                                  style={{
                                    backgroundColor: activeColor
                                  }}
                                />
                              
                                {/* LAYER 2: Canvas template image - overlay on top */}
                                <img
                                  src={canvasImage.src}
                                  alt={areaData.displayName}
                                  className="absolute inset-0 object-cover w-full h-full"
                                  style={{ mixBlendMode: 'normal' }}
                                />
                              
                                {/* LAYER 3: Subtle texture overlay for depth */}
                                <img
                                  src={canvasImage.src}
                                  alt={areaData.displayName}
                                  className="absolute inset-0 object-cover w-full h-full opacity-5"
                                  style={{ mixBlendMode: 'multiply' }}
                                />
                              
                                {/* Element count badge */}
                                {elementCount > 0 && (
                                  <div className="absolute top-1 right-1">
                                    <div className="flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-orange-500 rounded-full">
                                      {elementCount}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center w-full h-full text-gray-400">
                                <span className="text-xs">Loading...</span>
                              </div>
                            )}
                          </div>
                        
                          <p className="text-xs font-medium leading-tight text-center text-gray-700">
                            {areaData.displayName}
                          </p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}


        {/* Main Content Container */}
        <div className="flex flex-1 overflow-hidden">
          {/* Collapsible Toggle Button - Desktop Only */}
          {activeView === 'design' && !isMobile && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`fixed z-40 p-2 bg-white border border-gray-300 rounded-r-lg shadow-md hover:bg-gray-50 transition-all duration-300 ${
                sidebarCollapsed ? 'left-20 md:left-27' : 'left-80 lg:left-96'
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
              <div className="flex flex-col w-16 border-r border-gray-200 md:w-20 lg:w-17" style={{ backgroundColor: '#e65100' }}>
                
                <nav className="flex flex-col flex-1 p-2 space-y-1">
                  {([
                    { id: 'product', icon: Package, label: 'Product', count: 1 },
                    { id: 'colors', icon: Palette, label: 'Colors', count: selectedColors.length },
                    { id: 'sizes', icon: Ruler, label: 'Sizes', count: selectedSizes.length },
                    { id: 'upload', icon: Upload, label: 'Upload', count: uploadedFiles.length },
                    // { id: 'library', icon: FolderOpen, label: 'Library', count: 0 },
                    { id: 'layers', icon: Layers, label: 'Layers', count: getLayersInfo().length },
                    { id: 'pricing', icon: IndianRupee, label: 'Pricing', count: totalPrice > 0 ? 1 : 0 }
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
                sidebarCollapsed ? 'w-0' : 'w-72 md:w-64 lg:w-80'
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
                        {/* {activeTab === 'library' && 'Browse templates'} */}
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
          <div className={`flex flex-1 transition-all duration-300 ${
            activeView === 'design' && !isMobile
              ? sidebarCollapsed 
                ? 'md:w-[calc(100%-6rem)] lg:w-[calc(100%-4rem)]'
                : 'md:w-[calc(100%-20rem)] lg:w-[calc(100%-24rem)]'
              : ''
          }`}>
            {/* Add Area Thumbnails for Design Mode - Desktop Only */}
            {activeView === 'design' && !isMobile && availableAreas.length > 1 && (
              <div className="w-32 p-2 overflow-y-auto bg-white md:w-32 lg:w-44 md:p-3">
                
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
            
            <div className="flex-1 px-2 pt-0 pb-2 overflow-y-auto bg-white sm:p-2">
             {activeView === 'design' ? (
              <div className={`flex items-center justify-center h-auto overflow-y-auto ${
                isMobile ?'px-2 pt-8 pb-20' : 'px-3 md:px-4 pt-0 pb-2 sm:p-3 md:p-6' // More bottom padding for mobile
              }`}>
                <div className="relative"> {/* Add wrapper div */}
                  {renderCanvas()}
                </div>
              </div>
            )  : (
                // Wrap preview in conditional check
                isGeneratingForStore || showStoreImportModal ? (
                  <div className="flex items-center justify-center h-full bg-gray-50">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                      <p className="text-xl font-semibold text-gray-900">Store Import in Progress</p>
                      <p className="mt-2 text-gray-600">Preview temporarily disabled</p>
                    </div>
                  </div>
                ) : 
            (
              renderPreview()
            )
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
            totalPrice={totalPrice}
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