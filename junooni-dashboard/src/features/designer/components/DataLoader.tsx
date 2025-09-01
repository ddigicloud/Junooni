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
interface EnhancedVisibleArea {
  id: string;
  areaName: string;
  visibility: 'full' | 'partial' | 'edge' | 'sleeve';
  visibilityPercentage: number;
  maskingConfiguration: MaskingConfiguration;
  gradientMaskSettings: GradientMaskSettings;
  edgeDetectionSettings: EdgeDetectionSettings;
  fabricIntegration: FabricIntegration;
  designPlacement: DesignPlacement;
  surfaceWrapSettings: SurfaceWrapSettings;
  perspectiveSettings: PerspectiveSettings;
  fabricEffectsSettings: FabricEffectsSettings;
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
  visibleAreas: EnhancedVisibleArea[];
  fabricProp?: FabricProperties;
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
  printTechn: DynamicPrintingTechnology[];
  
  // Smart printing technologies with AI features
  smartPrintTech?: SmartPrintingTechnology[];
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
                  process.env.REACT_APP_PAYLOAD_BASE_URL || 
                  'http://localhost:3000';
  
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
  
  // =====================================
  // ENHANCED IMAGE URL PROCESSING
  // =====================================
  
  const processImageUrls = (data: any): DynamicProductData => {
    const config = getDynamicAPIConfig();
    
    //console.log('🖼️ Processing enhanced image URLs with base:', config.baseUrl);
    
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
    
    // Process main printing technologies (printTechn)
    if (processedData.printTechn) {
      processedData.printTechn = processedData.printTechn.map((tech: any) => {
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
    if (processedData.smartPrintTech) {
      processedData.smartPrintTech = processedData.smartPrintTech.map((tech: any) => {
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
    
    //console.log('✅ Enhanced image URL processing complete');
    return processedData as DynamicProductData;
  };

  // =====================================
  // ENHANCED API FETCH WITH RETRY LOGIC
  // =====================================
  
  const fetchWithRetry = async (url: string, attempt: number = 1): Promise<Response> => {
    const config = getDynamicAPIConfig();
    
    //console.log(`📡 Fetching enhanced data (attempt ${attempt}/${config.retryAttempts}):`, url);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
      
    } catch (fetchError: any) {
      //console.error(`❌ Enhanced fetch attempt ${attempt} failed:`, fetchError);
      
      if (attempt < config.retryAttempts) {
        const delay = Math.pow(2, attempt) * 1000;
        //console.log(`⏱️ Retrying in ${delay}ms...`);
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
        message: 'Request timed out. The server might be slow or unavailable.',
        retryable: true
      };
    }
    
    if (error.message.includes('404')) {
      return {
        type: 'not_found',
        message: `Product with ID "${productId}" was not found. Please check the product ID.`,
        retryable: false
      };
    }
    
    if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
      return {
        type: 'server_error',
        message: 'Server error occurred. The PayloadCMS backend might be down.',
        retryable: true
      };
    }
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return {
        type: 'network',
        message: 'Network connection failed. Please check your internet connection.',
        retryable: true
      };
    }
    
    return {
      type: 'invalid_data',
      message: error.message || 'An unexpected error occurred while loading the product.',
      details: error,
      retryable: true
    };
  };
  
  // =====================================
  // ENHANCED DATA VALIDATION
  // =====================================
  
  const validateProductData = (data: any): boolean => {
    //console.log('🔍 Validating enhanced product data...');
    
    if (!data) {
      //console.error('❌ No data received');
      return false;
    }
    
    if (!data.name || !data.id) {
      //console.error('❌ Missing required fields: name or id');
      return false;
    }
    
    // Check for main printing technologies (note field name change)
    if (!data.printTechn || !Array.isArray(data.printTechn) || data.printTechn.length === 0) {
      //console.error('❌ No printing technologies configured (printTechn)');
      return false;
    }
    
    if (!data.colorOptions || !Array.isArray(data.colorOptions) || data.colorOptions.length === 0) {
      //console.error('❌ No color options configured');
      return false;
    }
    
    if (!data.sizeOptions || !Array.isArray(data.sizeOptions) || data.sizeOptions.length === 0) {
      //console.error('❌ No size options configured');
      return false;
    }
    
    // Validate at least one technology has customization areas (custAreas)
    const hasValidTech = data.printTechn.some((tech: any) => 
      tech.custAreas && Array.isArray(tech.custAreas) && tech.custAreas.length > 0
    );
    
    if (!hasValidTech) {
      //console.error('❌ No valid printing technology with customization areas (custAreas)');
      return false;
    }
    
    // Log enhanced features detection
    // console.log('🤖 Enhanced features detected:', {
    //   hasSmartPrintTech: !!data.smartPrintTech?.length,
    //   hasProductIntelligence: !!data.prodInt,
    //   hasAdvancedSurfaceMapping: !!data.advanSurfMap,
    //   hasLightingConfiguration: !!data.lightingConfiguration,
    //   hasMaskingFeatures: data.printTechn.some((tech: any) => 
    //     tech.mockupPhotos?.some((photo: any) => 
    //       photo.visibleAreas?.some((area: any) => area.maskingConfiguration?.enableMasking)
    //     )
    //   )
    // });
    
    //console.log('✅ Enhanced product data validation passed');
    return true;
  };
  
  // =====================================
  // MAIN DATA FETCHING FUNCTION
  // =====================================
  
  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = getDynamicAPIConfig();
      const url = `${config.baseUrl}${config.endpoints.products}/${productId}`;
      
      //console.log('🚀 Starting enhanced product data fetch for ID:', productId);
      //console.log('🌐 API URL:', url);
      
      const response = await fetchWithRetry(url);
      const data = await response.json();
      
      // console.log('📦 Enhanced raw product data received:', {
      //   name: data.name,
      //   id: data.id,
      //   productType: data.productType,
      //   mainTechnologiesCount: data.printTechn?.length || 0,
      //   smartTechnologiesCount: data.smartPrintTech?.length || 0,
      //   colorsCount: data.colorOptions?.length || 0,
      //   sizesCount: data.sizeOptions?.length || 0,
      //   hasProductIntelligence: !!data.prodInt,
      //   hasAdvancedSurfaceMapping: !!data.advanSurfMap
      // });
      
      // Validate the enhanced data
      if (!validateProductData(data)) {
        throw new Error('Invalid enhanced product data structure received from PayloadCMS');
      }
      
      // Process image URLs with enhanced support
      const processedData = processImageUrls(data);
      
      //console.log('✅ Enhanced product data successfully processed and validated');
      setProductData(processedData);
      setLoading(false);
      setRetryCount(0);
      
    } catch (err: any) {
      //console.error('💥 Error fetching enhanced product data:', err);
      
      const classifiedError = classifyError(err);
      setError(classifiedError);
      setLoading(false);
      
      // Auto-retry for retryable errors
      if (classifiedError.retryable && retryCount < 2) {
        //console.log('🔄 Auto-retrying enhanced data fetch due to retryable error...');
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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-md p-8 mx-auto text-center">
          {/* Spinner */}
          <div className="relative">
            <div className="w-16 h-16 mx-auto border-4 border-orange-200 border-t-[#e65100] rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-transparent border-r-[#e65100] rounded-full animate-ping"></div>
          </div>

          {/* Title */}
          <h2 className="mt-6 text-xl font-semibold text-gray-800">Loading...</h2>
          <p className="mt-2 text-gray-600">Please wait a moment</p>

          {/* Dots animation */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            <div className="w-2 h-2 bg-[#e65100] rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-[#e65100] rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#e65100] rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>

    );
  }
  
  // =====================================
  // RENDER ERROR STATE
  // =====================================
  
  if (error) {
    const getErrorIcon = (type: string) => {
      switch (type) {
        case 'network':
          return '🌐';
        case 'not_found':
          return '🔍';
        case 'timeout':
          return '⏱️';
        case 'server_error':
          return '🔧';
        default:
          return '⚠️';
      }
    };
    
    const getErrorColor = (type: string) => {
      switch (type) {
        case 'network':
          return 'border-orange-200 bg-orange-50 text-orange-800';
        case 'not_found':
          return 'border-purple-200 bg-purple-50 text-purple-800';
        case 'timeout':
          return 'border-yellow-200 bg-yellow-50 text-yellow-800';
        case 'server_error':
          return 'border-red-200 bg-red-50 text-red-800';
        default:
          return 'border-gray-200 bg-gray-50 text-gray-800';
      }
    };
    
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className={`max-w-lg p-8 text-center rounded-xl border-2 ${getErrorColor(error.type)} shadow-lg`}>
          <div className="mb-4 text-4xl">{getErrorIcon(error.type)}</div>
          
          <h2 className="mb-4 text-2xl font-bold">
            {error.type === 'not_found' ? 'Enhanced Product Not Found' :
             error.type === 'network' ? 'Connection Error' :
             error.type === 'timeout' ? 'Request Timeout' :
             error.type === 'server_error' ? 'Server Error' :
             'Error Loading Enhanced Product'}
          </h2>
          
          <p className="mb-6 leading-relaxed">{error.message}</p>
          
          {error.details && (
            <details className="mb-6 text-left">
              <summary className="mb-2 font-medium cursor-pointer">Technical Details</summary>
              <pre className="p-3 overflow-auto text-xs bg-white border rounded">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </details>
          )}
          
          <div className="flex justify-center gap-3">
            {error.retryable && (
              <button 
                className="px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                onClick={handleRetry}
              >
                🔄 Try Again
              </button>
            )}
            
            <button 
              className="px-6 py-3 font-medium text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
              onClick={() => window.location.href = '/'}
            >
              ← Go Back
            </button>
          </div>
          
          <div className="p-4 mt-6 bg-white bg-opacity-50 rounded-lg">
            <p className="mb-2 text-sm font-medium">Enhanced Features Troubleshooting:</p>
            <ul className="space-y-1 text-sm">
              <li>• Verify PayloadCMS is running with enhanced schema</li>
              <li>• Check if masking features are properly configured</li>
              <li>• Ensure AI processing services are available</li>
              <li>• Validate printTechn field naming in PayloadCMS</li>
              <li>• Check CORS configuration for enhanced endpoints</li>
            </ul>
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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-lg p-8 text-center text-yellow-600 border-2 border-yellow-200 shadow-lg rounded-xl bg-yellow-50">
          <div className="mb-4 text-4xl">🤔</div>
          <h2 className="mb-4 text-xl font-bold">No Enhanced Product Data</h2>
          <p className="mb-6">Enhanced product data was successfully fetched but appears to be empty.</p>
          <button 
            className="px-6 py-3 font-medium text-white transition-colors bg-yellow-600 rounded-lg hover:bg-yellow-700"
            onClick={handleRetry}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }
  
  // =====================================
  // RENDER DESIGNER WITH ENHANCED SUCCESS INDICATOR
  // =====================================
  
  return (
    <div className="relative">
      {/* Enhanced success indicator */}
      
      
      {/* Main enhanced designer */}
      <EnhancedCanvasDesigner productData={productData} />
    </div>
  );
};

export default EnhancedDataLoader;

