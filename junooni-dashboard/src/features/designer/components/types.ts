// ============================================================
// types.ts — all shared interfaces for the designer feature
// Import from here instead of defining inline in Canvas.tsx
// ============================================================

export interface DesignElement {
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
  imageBase64?: string;
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
  cropInfo?: {
    wasCropped: boolean;
    originalDimensions: { width: number; height: number };
    croppedBounds: { x: number; y: number; width: number; height: number };
  } | null;
}

export interface AreaPricingInfo {
  areaId: string;
  areaName: string;
  minimumPrice: number;
  pricePerSquareInch: number;
  designAreaSquareInches: number;
  currentImageArea: number;
  calculatedPrice: number;
  finalPrice: number;
  consumedWidth?: number;
  consumedHeight?: number;
  elements: Array<{
    elementId: string;
    elementName: string;
    areaSquareInches: number;
    elementPrice: number;
    originalArea: number;
    extraArea: number;
  }>;
}

export interface PricingCalculation {
  subtotal: number;
  setupFee: number;
  technologyFee: number;
  printingGSTAmount?: number;
  productGSTAmount?: number;
  shippingCharges?: number;
  totalBeforeMarkup: number;
  markup: number;
  finalTotal: number;
}

export interface TotalPricingBreakdown {
  areas: Record<string, AreaPricingInfo>;
  calculation: PricingCalculation;
  technology: string;
  totalElements: number;
  totalDesignArea: number;
  priceBreakdown: {
    basePrintingCost: number;
    blankProductCost: number;
    printingGSTAmount?: number;
    productGSTAmount?: number;
    setupFees: number;
    additionalCosts: number;
    shippingCharges?: number;
    markup: number;
    finalPrice: number;
  };
}

export interface LayerInfo {
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

export interface CanvasImageMetadata {
  area_name: string;
  canvas_dimensions: {
    width_pixels: number;
    height_pixels: number;
    width_inches: number;
    height_inches: number;
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
      height_inches: number;
    };
    transformations: { rotation: number; scale_x: number; scale_y: number; opacity: number };
    image_info?: {
      original_name: string;
      original_width: number;
      original_height: number;
      print_quality: string;
      print_dpi: number;
    };
    text_info?: {
      content: string;
      font_size: number;
      font_family: string;
      color: string;
    };
  }>;
  canvas_settings: {
    active_color: string;
    total_elements: number;
    visible_elements: number;
  };
}

export interface DynamicMockupPhoto {
  id: string;
  title: string;
  photo: { id: number; url: string; alt: string; width: number; height: number };
  viewAngle: string;
  mockupType: string;
  photoColor: string;
  priority: number;
  mocwidthpx?: number;
  mochigtpx?: number;
  tmbwidthpx?: number;
  tmbhigtpx?: number;
  requiresColorMasking?: boolean;
  maskColor?: string;
  dispMaps?: Array<{
    id: string;
    dispImg: { id: number; url: string; alt: string; width: number; height: number };
    dsrfaceTy: 'cylindrical' | 'conical' | 'spherical';
    disint: number;
    disarea: string;
  }>;
  alpMasks?: Array<{
    id: string;
    maskImg: { id: number; url: string; alt: string; width: number; height: number };
    alfarea: string;
    alfamask: 'alpha' | 'luminance' | 'red_channel';
    featherEdge: number;
  }>;
  light?: Array<{
    id: string;
    overImage: { id: number; url: string; alt: string; width: number; height: number };
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
    Config?: { enableMasking: boolean; maskTypes: string; maskPath?: string };
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

export interface UploadedFile {
  id: string;
  file: File;
  url: string;
  base64Data?: string;
  name: string;
  size: number;
  type: string;
  uploadProgress: number;
  isUploading: boolean;
  error?: string;
  targetArea?: string;
}

export interface PayloadProductData {
  id: string;
  name: string;
  brand?: string;
  colorOptions: Array<{ id: string; colorName: string; colorHex: string; isPrimary?: boolean }>;
  sizeOptions: Array<{ id: string; sizeName: string; sizeDescription?: string }>;
  surfConf?: {
    No_Mockup_Compatible?: boolean;
    renderType?: string;
    blendSet?: { defaultBlendMode?: string; defaultOpacity?: number; preserveColors?: boolean };
    surfProp?: { wrapAngle?: number; curveInten?: number; designRatio?: any };
  };
  color_Images: boolean;
  size_Images: boolean;
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
        photo: { url: string };
        photoColor: string;
        printAreaCoord?: { x: number; y: number; width: number; height: number };
      }>;
    }>;
    printingConstraints?: {
      dpiRequirements: { minimum: number; recommended: number; maximum: number };
    };
  }>;
  cost: number;
  pricing?: { markupType: string; markupValue: number; suggestedRetailPrice: number };
  productType?: string;
  additionalCosts?: Record<string, string>;
  'GST Cost'?: string;
  shippingInfo?: { shippingCharges?: string };
}

export interface MockupCalculationResult {
  totalMockups: number;
  calculationBreakdown: Array<{
    color: string;
    colorHex: string;
    mockupsForColor: number;
    sizesCount: number;
    subtotal: number;
    mockups: DynamicMockupPhoto[];
  }>;
  strategy: 'color_and_size_specific' | 'color_specific' | 'size_specific' | 'shared_across_all';
}

export interface ColorSpecificMockupGroup {
  colorName: string;
  colorHex: string;
  mockups: DynamicMockupPhoto[];
  imageCount: number;
}

export interface ImageGenerationProgress {
  total: number;
  completed: number;
  current_combination: string;
  current_mockup: string;
  current_engine: 'canvas_professional' | 'pixi_dynamic';
  errors: string[];
  estimated_time_remaining_ms?: number;
}

export interface StoreImportData {
  product_id: string;
  product_name: string;
  product_type: string;
  design_elements: Record<string, DesignElement[]>;
  design_configuration: {
    canvas_configs: Record<string, any>;
    printable_areas: Record<string, any>;
    design_metadata: {
      total_elements: number;
      areas_used?: string[];
      creation_timestamp: string;
      last_modified?: string;
    };
  };
  mockup_variants: Array<{
    mockup_id: string;
    mockup_title: string;
    view_angle: string;
    mockup_color: string;
    mockup_size?: string;
    has_design_elements?: boolean;
    mockup_areas?: string[];
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
          quality_metrics: any;
          mockup_type?: string;
        }>;
      }>;
    }>;
  }>;
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
    engine_usage: { canvas_professional: number; pixi_dynamic: number };
    mockup_calculation: MockupCalculationResult;
    errors: string[];
    areas_with_elements?: string[];
    areas_without_elements?: string[];
    custom_mockups?: number;
    base_mockups?: number;
    message?: string;
    error_type?: string;
  };
  detailed_area_analysis?: any;
  image_area_analysis?: any;
  pricing_data?: any;
  available_mockups?: any;
}