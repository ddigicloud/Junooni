// src/components/Designer/EnhancedDataLoader.tsx
import React, { useState, useEffect } from 'react';
import EnhancedCanvasDesigner from './Canvas';

// =====================================
// ENHANCED TYPE DEFINITIONS WITH MASKING & AI FEATURES
// =====================================

interface DynamicProductColor {
  id: string;
  colorName: string;
  colorHex: string;
  isPrimary?: boolean;
  fabricInteraction?: {
    absorptionRate: number;
    blendMode: string;
    colorShift: {
      hueShift: number;
      saturationShift: number;
      lightnessShift: number;
    };
  };
}

interface DynamicProductSize {
  id: string;
  sizeName: string;
  sizeDescription?: string;
  dimensions?: {
    width?: number;
    height?: number;
  };
}

// Enhanced masking configuration interface
interface MaskingConfiguration {
  enableMasking: boolean;
  maskType: 'gradient' | 'path' | 'edge_detection' | 'ai_automatic';
  maskPath?: string;
}

interface GradientMaskSettings {
  gradientDirection: 'horizontal' | 'vertical' | 'radial' | 'diagonal';
  gradientAngle: number;
  fadeStart: number;
  fadeEnd: number;
  fadeIntensity: number;
}

interface EdgeDetectionSettings {
  enableEdgeDetection: boolean;
  edgeThreshold: number;
  edgeSoftness: number;
}

interface FabricIntegration {
  enableFabricBlend: boolean;
  bfabType?: string;
  foldAwareness: boolean;
  seamAwareness: boolean;
  textureIntensity: number;
  fabricColor: string;
  fabricRoughness: number;
}

interface DesignPlacement {
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
  opacity?: number;
  preserveColors?: boolean;
}

interface SurfaceWrapSettings {
  enableWrap?: boolean;
  wrapAngle: number;
  wrapIntensity: number;
  dynamicWrap: boolean;
  wrapFalloff: number;
}

interface PerspectiveSettings {
  enablePerspective: boolean;
  perspectiveIntensity: number;
  dynamicPerspective: boolean;
}

interface FabricEffectsSettings {
  enableFolds: boolean;
  foldIntensity: number;
  foldDirection: 'horizontal' | 'vertical' | 'radial';
  seamDistrt: boolean;
  fabricDpth: number;
}

// Enhanced visible area with all masking features
// Line ~85: Update EnhancedVisibleArea interface
// Line ~85: Complete visible area field name updates
interface EnhancedVisibleArea {
  id: string;
  areaName: string;
  visibility: 'full' | 'partial' | 'edge' | 'sleeve';
  visibilityPercentage: number;
  // ✅ ADD THIS FIELD:
  uvMap?: {
    srfc: 'cylinder' | 'plane' | 'sphere' | 'cone';
    uStart: number;
    vStart: number;
    uSpan: number;
    vSpan: number;
    uRepeat: number;
    vRepeat: number;
    rotationDeg: number | null;
    orn: {
      type: string;
      featureName: string | null;
      angleDeg: number | null;
      pixelX: number | null;
    };
    wrpmdU: 'clamp' | 'repeat' | 'mirror';
    wpmdV: 'clamp' | 'repeat' | 'mirror';
  };
  Config: {                         // Changed from 'maskingConfiguration'
    enableMasking: boolean;
    mask: string;                   // Changed from 'maskType'
    maskPath?: string;
  };
  grdnmsk: {                        // Changed from 'gradientMaskSettings'
    grdn: string;                   // Changed from 'gradientDirection'
    gradientAngle: number;
    fadeStart: number;
    fadeEnd: number;
    fadeIntensity: number;
  };
  edgeDetectionSettings: EdgeDetectionSettings; // This stays the same
  fbrc: {                           // Changed from 'fabricIntegration'
    enableFabricBlend: boolean;
    bfab: string;                   // Changed from 'bfabType'
    foldAwareness: boolean;
    seamAwareness: boolean;
    textureIntensity: number;
    fabricColor: string;
    fabricRoughness: number;
  };
  design: {                         // Changed from 'designPlacement'
    coordinateX: number;
    coordinateY: number;
    coordinateWidth: number;
    coordinateHeight: number;
    rotation: number;
    skewX: number;
    skewY: number;
    scaleX: number;
    scaleY: number;
    blend: string;                  // Changed from 'blendMode'
    opacity?: number;
    preserveColors?: boolean;
  };
  surfaceWrapSettings: SurfaceWrapSettings; // This stays the same
  perspectiveSettings: PerspectiveSettings; // This stays the same
  fbrEft: {                         // Changed from 'fabricEffectsSettings'
    enableFolds: boolean;
    foldIntensity: number;
    fold: string;                   // Changed from 'foldDirection'
    seamDistrt: boolean;
    fabricDpth: number;
  };
}

// Smart masking for AI features
interface SmartMasking {
  enableSmartMask: boolean;
  maskingStrategy: 'ai_automatic' | 'manual' | 'hybrid';
}

interface AIMaskSettings {
  edgeDetectionLevel: 'low' | 'medium' | 'high';
  adaptToLighting: boolean;
  fabricAwareness: boolean;
  seamDetection: boolean;
}

interface GeneratedMask {
  maskPath?: string;
  maskType?: string;
  maskConfidence?: number;
}

interface SmartPlacement {
  autoX?: number;
  autoY?: number;
  autoWidth?: number;
  autoHeight?: number;
  enableManualOverride: boolean;
  manualX?: number;
  manualY?: number;
  manualWidth?: number;
  manualHeight?: number;
  rotation: number;
  skewX: number;
  skewY: number;
  scaleX: number;
  scaleY: number;
}

interface SmartVisibleArea {
  id: string;
  areaName: string;
  dataSource: 'ai_detected' | 'manual' | 'hybrid';
  appStat: 'pending_review' | 'approved' | 'rejected';
  visibility: 'full' | 'partial' | 'edge';
  visibilityPercentage: number;
  smartMasking: SmartMasking;
  aiMaskSettings: AIMaskSettings;
  generatedMask: GeneratedMask;
  smartPlacement: SmartPlacement;
}

// Fabric properties interface
interface FabricProperties {
  mfabType?: string;
  fabricWeight: number;
  surfaceTexture: string;
  stretchability: number;
  transparency: number;
}

// Enhanced customizable area
interface DynamicCustomizableArea {
  id: string;
  areaId: string;
  areaName: string;
  areaType: 'primary' | 'secondary' | 'accent';
  designCanvasPhotos: Array<{
    id: string;
    photo: {
      id: number;
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    photoColor?: string;
    printAreaCoord?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  canvasDim: {
    widthInch: number;
    heightInch: number;
    canvasPixWid: number;
    canvasPixHeight: number;
    aspectRatioLocked: boolean;
  };
  restrictions?: {
    minElementSize?: {
      width?: number;
      height?: number;
    };
    maxElements?: number;
  };
}

// Enhanced mockup photo with masking features
// Line ~180: Complete mockup photo field name updates
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
  area: EnhancedVisibleArea[];      // Changed from 'visibleAreas'
  dispMaps?: any[];                 // Changed from 'disMaps' 
  alpMasks?: any[];                 // This one was correct
  light?: any[];                    // Changed from 'lightOver'
  render?: {                        // Changed from 'renderPref'
    pfEngine: string;               // Changed from 'preferredEngine'
    enableAdvancedEffects: boolean;
    quality: string;                // Changed from 'qualityLevel'
    exportRes: number;              // Changed from 'exportRes'
    enableProgTrack: boolean;       // Changed from 'enableProgTrack'
  };
  fbrcProp?: {                      // Changed from 'mFabricProp'
    mfab: string;                   // Changed from 'mfabType'
    fabricWeight: number;           // Changed from 'mockupFabricWeight'
    Texture: string;                // Changed from 'mockupSurfaceTexture'
    stretchability: number;         // Changed from 'mockupStretchability'
    transparency: number;           // Changed from 'mockupTransparency'
  };
  lightingConditions?: {
    lightDirection: number;
    lightIntensity: number;
    ambientLight: number;
    shadowIntensity: number;
  };
  tags?: { tag: string }[];
}

// Smart mockup photo interface
interface SmartMockupPhoto {
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
  mockupStyle: string;
  photoColor: string;
  priority: number;
  smartVisA: SmartVisibleArea[];
  tags?: { tag: string }[];
  aiAnalRes?: {
    analStat: 'pending' | 'completed' | 'failed';
    detProdTy?: string;
    confScore?: number;
    detAr: any[];
    dtcObs: any[];
  };
}

// Smart customization area
interface SmartCustomizationArea {
  id: string;
  areaId: string;
  areaName: string;
  areaType: 'primary' | 'secondary' | 'accent';
  smartCanvasConfig: {
    useAICalculatedDimensions: boolean;
    aiWidthInches?: number;
    aiHeightInches?: number;
    aiCanvasPixelWidth?: number;
    aiCanvasPixelHeight?: number;
    manualWidthInches?: number;
    manualHeightInches?: number;
    manualCanvasPixelWidth: number;
    manualCanvasPixelHeight: number;
    aspectRatioLocked: boolean;
  };
}

// Enhanced printing technology
interface DynamicPrintingTechnology {
  id: string;
  technologyName: string;
  mockupPhotos: DynamicMockupPhoto[];
  custAreas: DynamicCustomizableArea[];
  printingConstraints?: {
    dpiRequirements?: {
      minimum: number;
      recommended: number;
      maximum: number;
    };
    sizeLimits?: {
      minWidthInch: number;
      minHeightInch: number;
      maxWidthInch?: number;
      maxHeightInch?: number;
    };
    colorLimits?: {
      maxColors?: number;
      supportsFullColor: boolean;
    };
    printBleeds?: {
      bleedMargin: number;
      safetyMargin: number;
      trimTolerance: number;
    };
  };
}

// Smart printing technology
interface SmartPrintingTechnology {
  id: string;
  technologyName: string;
  smartMockupPhotos: SmartMockupPhoto[];
}

// Product intelligence interface
interface ProductIntelligence {
  prodTemp: string;
  autoDetSett: {
    enImgAnal: boolean;
    anAcc: string;
    detThres: number;
    manlReq: boolean;
  };
  srtDef: {
    intfrmTlt: boolean;
    oMskRls: {
      enablesMask: boolean;
      edgeDetctMode: string;
      occlDetct: {
        detectCamHole: boolean;
        detectSeams: boolean;
        detectFolds: boolean;
        detectShadows: boolean;
      };
    };
  };
}

// Enhanced product data interface
interface DynamicProductData {
  id: number;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  brandSku?: string;
  cost: number;
  status: 'active' | 'draft' | 'discontinued' | 'out_of_stock' | 'coming_soon';
  productType: string;
  description?: string;
  
  // Enhanced materials with fabric properties
  materials?: {
    primary?: string;
    weight?: string;
    construction?: string;
    finish?: string;
    efabType?: string;
    fabricWeight?: number;
    surfaceTexture?: string;
    stretchability?: number;
    transparency?: number;
    reflectivity?: number;
  };
  
  physicalDimensions?: {
    widthInches?: number;
    heightInches?: number;
    depthInches?: number;
    diameter?: number;
    units: string;
  };
  
  shippingInfo?: {
    weight: number;
    shippingDimensions?: string;
    packageType?: string;
  };
  
  colorOptions: DynamicProductColor[];
  sizeOptions: DynamicProductSize[];
  
  // Enhanced surface configuration
  surfConf?: {
    renderType: 'flat' | 'cylindrical' | 'conical' | 'spherical' | 'complex_3d';
    surfProp?: {
      wrapAngle?: number;
      curveInten?: number;
      designRatio?: {
        widthRatio?: number;
        heightRatio?: number;
      };
    };
    blendSet?: {
      defaultBlendMode?: string;
      defaultOpacity?: number;
      preserveColors?: boolean;
    };
  };
  
  // Advanced surface mapping
  advanSurfMap?: {
    curvProf: string;
    barrelDist: number;
    pincushiDistor: number;
    perspDis: number;
    hasSeams: boolean;
  };
  
  seamPositions?: any[];
  lightingConfiguration?: {
    lightDirection: number;
    lightIntensity: number;
    ambientLight: number;
    shadowIntensity: number;
  };
  
  // Main printing technologies (updated field name)
  printT: DynamicPrintingTechnology[];
  
  // Smart printing technologies with AI features
   PrntTch?: SmartPrintingTechnology[];
  smartCustomizationAreas?: SmartCustomizationArea[];
  
  // Product intelligence for AI features
  prodInt?: ProductIntelligence;
  
  // Area synchronization rules
  areaSynchRules?: any[];
  
  displayImages?: Array<{
    id: string;
    title?: string;
    image: {
      id: number;
      url: string;
      alt: string;
    };
    caption?: string;
  }>;
  
  careInstructions?: Array<{
    instruction: string;
    icon: string;
  }>;
  
  vendorInfo?: {
    supplier?: string;
    supplierProductId?: string;
    countryOfOrigin?: string;
  };
  
  sourcing?: {
    minimumOrderQuantity?: number;
    leadTimeDays?: number;
    rushAvailable?: boolean;
    rushLeadTimeDays?: number;
  };
  
  pricing?: {
    markupType?: 'percentage' | 'fixed' | 'tiered';
    markupValue?: number;
    suggestedRetailPrice?: number;
  };
  
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  
  updatedAt: string;
  createdAt: string;
}

// =====================================
// API CONFIGURATION
// =====================================

interface APIConfig {
  baseUrl: string;
  endpoints: {
    products: string;
    media: string;
  };
  timeout: number;
  retryAttempts: number;
}

const getDynamicAPIConfig = (): APIConfig => {
  const baseUrl = import.meta.env?.VITE_PAYLOAD_BASE_URL || 
                  process.env.VITE_PAYLOAD_BASE_URL;
  
  return {
    baseUrl,
    endpoints: {
      products: '/api/blank-products',
      media: '/api/media'
    },
    timeout: 10000,
    retryAttempts: 3
  };
};

// =====================================
// ENHANCED ERROR TYPES
// =====================================

interface LoadingError {
  type: 'network' | 'not_found' | 'invalid_data' | 'timeout' | 'server_error';
  message: string;
  details?: any;
  retryable: boolean;
}

// =====================================
// PRODUCTION UI COMPONENTS
// =====================================

const LoadingSpinner: React.FC = () => (
  <div className="relative">
    {/* Primary spinner */}
    <div className="w-20 h-20 border-4 border-gray-200 rounded-full animate-spin border-t-[#e65100]"></div>
    
    {/* Secondary pulse effect */}
    <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-pulse border-r-[#e65100] opacity-50"></div>
    
    {/* Inner glow */}
    <div className="absolute inset-2 w-16 h-16 border-2 border-gray-100 rounded-full animate-spin border-t-[#ff8a50]"></div>
  </div>
);

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="w-full max-w-md mx-auto mt-6">
    <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
      <span>Loading product data...</span>
      <span>{progress}%</span>
    </div>
    <div className="w-full h-2 bg-gray-200 rounded-full">
      <div 
        className="h-2 bg-gradient-to-r from-[#e65100] to-[#ff8a50] rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

const StatusIndicator: React.FC<{ status: string }> = ({ status }) => (
  <div className="flex items-center gap-2 mt-4 text-gray-600">
    <div className="w-2 h-2 bg-[#e65100] rounded-full animate-pulse"></div>
    <span className="text-sm font-medium">{status}</span>
  </div>
);

// =====================================
// ENHANCED DATA LOADER COMPONENT
// =====================================

interface EnhancedDataLoaderProps {
  productId: string | number;
}

const EnhancedDataLoader: React.FC<EnhancedDataLoaderProps> = ({ productId }) => {
  const [productData, setProductData] = useState<DynamicProductData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<LoadingError | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingStatus, setLoadingStatus] = useState<string>('Initializing...');
  const [showSuccessNotification, setShowSuccessNotification] = useState<boolean>(false);
  
  // =====================================
  // ENHANCED IMAGE URL PROCESSING
  // =====================================
  
  const processImageUrls = (data: any): DynamicProductData => {
    setLoadingProgress(60);
    setLoadingStatus('Processing image URLs...');
    
    const config = getDynamicAPIConfig();
    
    const processUrl = (obj: any) => {
      if (!obj) return obj;
      
      const newObj = { ...obj };
      
      if (newObj.url && typeof newObj.url === 'string') {
        if (newObj.url.startsWith('http://') || newObj.url.startsWith('https://')) {
          return newObj;
        } else if (newObj.url.startsWith('/')) {
          newObj.url = `${config.baseUrl}${newObj.url}`;
        } else {
          newObj.url = `${config.baseUrl}/api/media/file/${newObj.url}`;
        }
      }
      
      return newObj;
    };
    
    const processedData = JSON.parse(JSON.stringify(data));
    
    // Process displayImages
    if (processedData.displayImages) {
      processedData.displayImages = processedData.displayImages.map((item: any) => ({
        ...item,
        image: processUrl(item.image)
      }));
    }
    
    // Process main printing technologies (printT)
    if (processedData.printT) {
      processedData.printT = processedData.printT.map((tech: any) => {
        const newTech = { ...tech };
        
        // Process custAreas (customization areas)
        if (newTech.custAreas) {
          newTech.custAreas = newTech.custAreas.map((area: any) => {
            const newArea = { ...area };
            
            // Process designCanvasPhotos
            if (newArea.designCanvasPhotos) {
              newArea.designCanvasPhotos = newArea.designCanvasPhotos.map((photo: any) => ({
                ...photo,
                photo: processUrl(photo.photo)
              }));
            }
            
            return newArea;
          });
        }
        
        // Process mockupPhotos
        if (newTech.mockupPhotos) {
          newTech.mockupPhotos = newTech.mockupPhotos.map((photo: any) => ({
            ...photo,
            photo: processUrl(photo.photo)
          }));
        }
        
        return newTech;
      });
    }
    
    // Process smart printing technologies
    if (processedData.smartprintT) {
      processedData.smartprintT = processedData.smartprintT.map((tech: any) => {
        const newTech = { ...tech };
        
        // Process smartMockupPhotos
        if (newTech.smartMockupPhotos) {
          newTech.smartMockupPhotos = newTech.smartMockupPhotos.map((photo: any) => ({
            ...photo,
            photo: processUrl(photo.photo)
          }));
        }
        
        return newTech;
      });
    }
    
    setLoadingProgress(80);
    setLoadingStatus('Finalizing data processing...');
    
    return processedData as DynamicProductData;
  };

  // =====================================
  // ENHANCED API FETCH WITH RETRY LOGIC
  // =====================================
  
  const fetchWithRetry = async (url: string, attempt: number = 1): Promise<Response> => {
  const config = getDynamicAPIConfig();
  
  setLoadingStatus(
    attempt === 1 
      ? 'Connecting to server...' 
      : `Retrying connection (${attempt}/${config.retryAttempts})...`
  );
  setLoadingProgress(Math.min(20 + (attempt * 10), 40));
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    
    const response = await fetch(url, {
      signal: controller.signal,
      method: "GET",
      credentials: "include",   // ✔️ add this
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    setLoadingProgress(50);
    setLoadingStatus("Receiving data...");
    
    return response;
    
  } catch (fetchError: any) {
    if (attempt < config.retryAttempts) {
      const delay = Math.pow(2, attempt) * 1000;
      setLoadingStatus(`Retry in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, attempt + 1);
    }
    
    throw fetchError;
  }
};

  
  // =====================================
  // ENHANCED ERROR CLASSIFICATION
  // =====================================
  
  const classifyError = (error: any): LoadingError => {
    if (error.name === 'AbortError') {
      return {
        type: 'timeout',
        message: 'Connection timeout - The server is taking too long to respond.',
        retryable: true
      };
    }
    
    if (error.message.includes('404')) {
      return {
        type: 'not_found',
        message: `Product "${productId}" could not be found in the system.`,
        retryable: false
      };
    }
    
    if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
      return {
        type: 'server_error',
        message: 'Server is currently unavailable. Please try again in a moment.',
        retryable: true
      };
    }
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return {
        type: 'network',
        message: 'Unable to connect. Please check your internet connection.',
        retryable: true
      };
    }
    
    return {
      type: 'invalid_data',
      message: 'An unexpected error occurred while processing the product data.',
      details: error,
      retryable: true
    };
  };
  
  // =====================================
  // ENHANCED DATA VALIDATION
  // =====================================
  
  const validateProductData = (data: any): boolean => {
    setLoadingProgress(90);
    setLoadingStatus('Validating product data...');
    
    if (!data) return false;
    if (!data.name || !data.id) return false;
    if (!data.printT || !Array.isArray(data.printT) || data.printT.length === 0) return false;
    if (!data.colorOptions || !Array.isArray(data.colorOptions) || data.colorOptions.length === 0) return false;
    if (!data.sizeOptions || !Array.isArray(data.sizeOptions) || data.sizeOptions.length === 0) return false;
    
    const hasValidTech = data.printT.some((tech: any) => 
      tech.custAreas && Array.isArray(tech.custAreas) && tech.custAreas.length > 0
    );
    
    if (!hasValidTech) return false;
    
    return true;
  };
  
  // =====================================
  // MAIN DATA FETCHING FUNCTION
  // =====================================
  
  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);
      setLoadingStatus('Initializing connection...');
      
      const config = getDynamicAPIConfig();
      const url = `${config.baseUrl}${config.endpoints.products}/${productId}`;
      
      // Simulate initial progress
      setTimeout(() => setLoadingProgress(10), 100);
      
      const response = await fetchWithRetry(url);
      const data = await response.json();
      
      // Validate the enhanced data
      if (!validateProductData(data)) {
        throw new Error('Product data structure validation failed');
      }
      
      // Process image URLs with enhanced support
      const processedData = processImageUrls(data);
      
      setLoadingProgress(100);
      setLoadingStatus('Complete!');
      
      // Brief delay to show completion
      setTimeout(() => {
        setProductData(processedData);
        setLoading(false);
        setRetryCount(0);
        setShowSuccessNotification(true);
        
        // Auto-hide success notification after 3 seconds
        setTimeout(() => {
          setShowSuccessNotification(false);
        }, 3000);
      }, 300);
      
    } catch (err: any) {
      const classifiedError = classifyError(err);
      setError(classifiedError);
      setLoading(false);
      
      // Auto-retry for retryable errors
      if (classifiedError.retryable && retryCount < 2) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchProductData();
        }, 3000);
      }
    }
  };

  // =====================================
  // EFFECT HOOKS
  // =====================================
  
  useEffect(() => {
    if (!productId) {
      setError({
        type: 'invalid_data',
        message: 'No product ID provided',
        retryable: false
      });
      setLoading(false);
      return;
    }
    
    fetchProductData();
  }, [productId]);
  
  // =====================================
  // MANUAL RETRY FUNCTION
  // =====================================
  
  const handleRetry = () => {
    setRetryCount(0);
    fetchProductData();
  };
  
  // =====================================
  // RENDER LOADING STATE
  // =====================================
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl">
          {/* Loading Spinner with subtle animation background */}
          <div className="relative flex justify-center mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-orange-50 rounded-full blur-2xl opacity-40" />
            <LoadingSpinner />
          </div>

          {/* Title */}
          <h2 className="mb-2 text-xl font-semibold text-center text-gray-900">
            Loading Product
          </h2>
          
          {/* Status with dot indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <StatusIndicator status={loadingStatus} />
          </div>

          {/* Sleek Progress Bar */}
          <ProgressBar progress={loadingProgress} />

          {/* Compact Info Footer */}
          {(productId || retryCount > 0) && (
            <div className="flex items-center justify-between pt-6 mt-6 text-sm border-t border-gray-100">
              {/* {productId && (
                <span className="text-gray-500">
                  ID: <span className="font-mono text-gray-900">{productId}</span>
                </span>
              )} */}
              {retryCount > 0 && (
                <span className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-full">
                  Retry {retryCount}/3
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // =====================================
  // RENDER ERROR STATE
  // =====================================
  
  if (error) {
    const getErrorConfig = (type: string) => {
      switch (type) {
        case 'network':
          return {
            icon: '🌐',
            color: 'border-red-200 bg-red-50',
            iconBg: 'bg-red-100',
            title: 'Connection Error',
            titleColor: 'text-red-800',
            textColor: 'text-red-700'
          };
        case 'not_found':
          return {
            icon: '🔍',
            color: 'border-amber-200 bg-amber-50',
            iconBg: 'bg-amber-100',
            title: 'Product Not Found',
            titleColor: 'text-amber-800',
            textColor: 'text-amber-700'
          };
        case 'timeout':
          return {
            icon: '⏱️',
            color: 'border-orange-200 bg-orange-50',
            iconBg: 'bg-orange-100',
            title: 'Request Timeout',
            titleColor: 'text-orange-800',
            textColor: 'text-orange-700'
          };
        case 'server_error':
          return {
            icon: '🔧',
            color: 'border-red-200 bg-red-50',
            iconBg: 'bg-red-100',
            title: 'Server Error',
            titleColor: 'text-red-800',
            textColor: 'text-red-700'
          };
        default:
          return {
            icon: '⚠️',
            color: 'border-gray-200 bg-gray-50',
            iconBg: 'bg-gray-100',
            title: 'Loading Error',
            titleColor: 'text-gray-800',
            textColor: 'text-gray-700'
          };
      }
    };
    
    const config = getErrorConfig(error.type);
    
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className={`max-w-lg w-full rounded-2xl shadow-xl border-2 ${config.color} overflow-hidden`}>
          
          {/* Header */}
          <div className="p-8 text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 ${config.iconBg} rounded-full mb-4`}>
              <span className="text-2xl">{config.icon}</span>
            </div>
            
            <h2 className={`text-2xl font-bold ${config.titleColor} mb-3`}>
              {config.title}
            </h2>
            
            <p className={`${config.textColor} leading-relaxed text-lg`}>
              {error.message}
            </p>
          </div>
          
          {/* Error Details */}
          {error.details && (
            <div className="px-8 pb-4">
              <details className="group">
                <summary className={`${config.textColor} cursor-pointer font-medium hover:underline flex items-center gap-2`}>
                  <span className="transition-transform group-open:rotate-90">▶</span>
                  Technical Details
                </summary>
                <div className="p-4 mt-3 bg-white border border-gray-200 rounded-lg">
                  <pre className="overflow-auto text-xs text-gray-600 max-h-40">
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="p-8 bg-white bg-opacity-50 border-t border-gray-200">
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              {error.retryable && (
                <button 
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#e65100] text-white font-semibold rounded-lg hover:bg-[#d84315] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  onClick={handleRetry}
                >
                  <span className="mr-2">🔄</span>
                  Try Again
                </button>
              )}
              
              <button 
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                onClick={() => window.location.href = '/'}
              >
                <span className="mr-2">←</span>
                Go Back
              </button>
            </div>
          </div>
          
          {/* Troubleshooting Info */}
          <div className="p-6 bg-white border-t border-gray-200">
            <div className="text-center">
              <h4 className="flex items-center justify-center gap-2 mb-3 font-semibold text-gray-800">
                <span>🛠️</span>
                Troubleshooting Tips
              </h4>
              <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#e65100] rounded-full flex-shrink-0"></span>
                  <span>Check internet connection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#e65100] rounded-full flex-shrink-0"></span>
                  <span>Verify PayloadCMS status</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#e65100] rounded-full flex-shrink-0"></span>
                  <span>Validate product ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#e65100] rounded-full flex-shrink-0"></span>
                  <span>Check CORS settings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // =====================================
  // RENDER SUCCESS STATE
  // =====================================
  
  if (!productData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="w-full max-w-lg overflow-hidden border-2 shadow-xl bg-amber-50 border-amber-200 rounded-2xl">
          
          {/* Header */}
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-amber-100">
              <span className="text-2xl">🤔</span>
            </div>
            
            <h2 className="mb-3 text-2xl font-bold text-amber-800">
              No Product Data
            </h2>
            
            <p className="leading-relaxed text-amber-700">
              The product was found but contains no usable data. This might be a configuration issue.
            </p>
          </div>
          
          {/* Action Button */}
          <div className="p-8 bg-white bg-opacity-50 border-t border-amber-200">
            <button 
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-[#e65100] text-white font-semibold rounded-lg hover:bg-[#d84315] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={handleRetry}
            >
              <span className="mr-2">🔄</span>
              Reload Product
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // =====================================
  // RENDER DESIGNER WITH ENHANCED SUCCESS INDICATOR
  // =====================================
  
  return (
    <div className="relative">
      {/* Success notification - briefly shown */}
      {showSuccessNotification && (
        <div className="fixed z-50 duration-500 top-4 right-4 animate-in slide-in-from-right">
          <div className="max-w-sm p-4 border border-orange-200 rounded-lg shadow-lg bg-orange-50">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                  <span className="text-sm text-orange-600">✓</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-orange-800">Product Loaded</h4>
                <p className="mt-1 text-xs text-orange-700">
                  {productData.name} is ready for customization
                </p>
              </div>
              <button
                onClick={() => setShowSuccessNotification(false)}
                className="text-lg leading-none text-orange-400 hover:text-orange-600"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main enhanced designer */}
      <EnhancedCanvasDesigner productData={productData} />
    </div>
  );
};

export default EnhancedDataLoader;