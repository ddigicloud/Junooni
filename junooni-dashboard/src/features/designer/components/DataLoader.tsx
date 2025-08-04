// src/components/Designer/ImprovedDataLoader.tsx
import React, { useState, useEffect } from 'react';
import EnhancedDynamicDesigner from './Canvas';

// =====================================
// DYNAMIC TYPE DEFINITIONS FROM PAYLOADCMS
// =====================================

interface DynamicProductColor {
  id: string;
  colorName: string;
  colorHex: string;
  isPrimary?: boolean;
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

interface DynamicCustomizableArea {
  areaId: string;
  areaName: string;
  areaType: 'primary' | 'secondary' | 'accent';
  canvasDimensions: {
    widthInches: number;
    heightInches: number;
    canvasPixelWidth: number;
    canvasPixelHeight: number;
    aspectRatioLocked: boolean;
  };
  designCanvasPhotos: Array<{
    photo: {
      id: number;
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    photoColor?: string;
    printableAreaCoordinates?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  restrictions?: {
    minElementSize?: {
      width?: number;
      height?: number;
    };
    maxElements?: number;
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
  fabricProperties?: {
    fabricType: string;
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
  visibleAreas: Array<{
    areaName: string;
    visibility: 'full' | 'partial' | 'edge';
    visibilityPercentage?: number;
    fabricIntegration?: {
      enableFabricBlend: boolean;
      fabricType: string;
      foldAwareness: boolean;
      seamAwareness: boolean;
      textureIntensity: number;
      fabricColor: string;
      fabricRoughness: number;
    };
    desgnPlacment: {
      coord: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      transforms: {
        rotation: number;
        skewX: number;
        skewY: number;
        scaleX: number;
        scaleY: number;
      };
      renderSettings: {
        blendMode: string;
        opacity: number;
        preserveColors: boolean;
      };
      surfSpecs: {
        wrapSettng: {
          enableWrap: boolean;
          wrapAngle: number;
          wrapIntensity: number;
          dynamicWrap?: boolean;
          wrapFalloff?: number;
        };
        perspCorrection: {
          enablePersp: boolean;
          perspIntensity: number;
          dynamicPerspective?: boolean;
        };
        fabricEffects?: {
          enableFolds: boolean;
          foldIntensity: number;
          foldDirection: 'horizontal' | 'vertical' | 'radial';
          seamDistortion: boolean;
          fabricDepth: number;
        };
      };
    };
  }>;
  priority: number;
  tags?: { tag: string }[];
}

interface DynamicPrintingTechnology {
  id: string;
  techName: string;
  printConstraints?: {
    dpiReq?: {
      minimum: number;
      recommended: number;
      maximum: number;
    };
    sizeLimits?: {
      minWidInch: number;
      minHtInch: number;
      maxWidInch?: number;
      maxHtInch?: number;
    };
    colorLimits?: {
      maxColors?: number;
      supportsFullColor: boolean;
    };
  };
  customizationAreas: DynamicCustomizableArea[];
  mockupPhotos: DynamicMockupPhoto[];
}

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
  materials?: {
    primary?: string;
    weight?: string;
    construction?: string;
    finish?: string;
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
  surfaceConf?: {
    renderType: 'flat' | 'cylindrical' | 'conical' | 'spherical' | 'complex_3d';
    surfaceProp?: {
      wrapAngle?: number;
      curveIntnsty?: number;
      designRatio?: {
        widthRatio?: number;
        heightRatio?: number;
      };
    };
    blendSetting?: {
      defBlendMode?: string;
      defaultOpacity?: number;
      preserveColors?: boolean;
    };
  };
  printTech: DynamicPrintingTechnology[];
  displayImages?: Array<{
    id: string;
    title: string;
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
// DYNAMIC API CONFIGURATION
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
  // Get configuration from environment variables with fallbacks
  const baseUrl = import.meta.env?.VITE_PAYLOAD_BASE_URL || 
                  process.env.REACT_APP_PAYLOAD_BASE_URL || 
                  'http://localhost:3000';
  
  return {
    baseUrl,
    endpoints: {
      products: '/api/blank-products',
      media: '/api/media'
    },
    timeout: 10000, // 10 seconds
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
// IMPROVED DATA LOADER COMPONENT
// =====================================

interface ImprovedDataLoaderProps {
  productId: string | number;
}

const DataLoader: React.FC<ImprovedDataLoaderProps> = ({ productId }) => {
  const [productData, setProductData] = useState<DynamicProductData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<LoadingError | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  // =====================================
  // ENHANCED IMAGE URL PROCESSING
  // =====================================
  
  const processImageUrls = (data: any): DynamicProductData => {
    const config = getDynamicAPIConfig();
    
    console.log('🖼️ Processing image URLs with base:', config.baseUrl);
    
    // Helper function to process image URLs
    const processUrl = (obj: any) => {
      if (!obj) return obj;
      
      const newObj = { ...obj };
      
      if (newObj.url && typeof newObj.url === 'string') {
        if (newObj.url.startsWith('http://') || newObj.url.startsWith('https://')) {
          // Already absolute URL
          return newObj;
        } else if (newObj.url.startsWith('/')) {
          // Relative URL starting with /
          newObj.url = `${config.baseUrl}${newObj.url}`;
        } else {
          // Relative URL without /
          newObj.url = `${config.baseUrl}/api/media/file/${newObj.url}`;
        }
      }
      
      return newObj;
    };
    
    // Deep clone to avoid mutation
    const processedData = JSON.parse(JSON.stringify(data));
    
    // Process displayImages
    if (processedData.displayImages) {
      processedData.displayImages = processedData.displayImages.map((item: any) => ({
        ...item,
        image: processUrl(item.image)
      }));
    }
    
    // Process printing technologies
    if (processedData.printTech) {
      processedData.printTech = processedData.printTech.map((tech: any) => {
        const newTech = { ...tech };
        
        // Process customizationAreas
        if (newTech.customizationAreas) {
          newTech.customizationAreas = newTech.customizationAreas.map((area: any) => {
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
    
    console.log('✅ Image URL processing complete');
    return processedData as DynamicProductData;
  };

  // =====================================
  // ENHANCED API FETCH WITH RETRY LOGIC
  // =====================================
  
  const fetchWithRetry = async (url: string, attempt: number = 1): Promise<Response> => {
    const config = getDynamicAPIConfig();
    
    console.log(`📡 Fetching (attempt ${attempt}/${config.retryAttempts}):`, url);
    
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
      console.error(`❌ Fetch attempt ${attempt} failed:`, fetchError);
      
      if (attempt < config.retryAttempts) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`⏱️ Retrying in ${delay}ms...`);
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
    console.log('🔍 Validating product data...');
    
    if (!data) {
      console.error('❌ No data received');
      return false;
    }
    
    if (!data.name || !data.id) {
      console.error('❌ Missing required fields: name or id');
      return false;
    }
    
    if (!data.printTech || !Array.isArray(data.printTech) || data.printTech.length === 0) {
      console.error('❌ No printing technologies configured');
      return false;
    }
    
    if (!data.colorOptions || !Array.isArray(data.colorOptions) || data.colorOptions.length === 0) {
      console.error('❌ No color options configured');
      return false;
    }
    
    if (!data.sizeOptions || !Array.isArray(data.sizeOptions) || data.sizeOptions.length === 0) {
      console.error('❌ No size options configured');
      return false;
    }
    
    // Validate at least one technology has customization areas
    const hasValidTech = data.printTech.some((tech: any) => 
      tech.customizationAreas && Array.isArray(tech.customizationAreas) && tech.customizationAreas.length > 0
    );
    
    if (!hasValidTech) {
      console.error('❌ No valid printing technology with customization areas');
      return false;
    }
    
    console.log('✅ Product data validation passed');
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
      
      console.log('🚀 Starting product data fetch for ID:', productId);
      console.log('🌐 API URL:', url);
      
      const response = await fetchWithRetry(url);
      const data = await response.json();
      
      console.log('📦 Raw product data received:', {
        name: data.name,
        id: data.id,
        productType: data.productType,
        technologiesCount: data.printTech?.length || 0,
        colorsCount: data.colorOptions?.length || 0,
        sizesCount: data.sizeOptions?.length || 0
      });
      
      // Validate the data
      if (!validateProductData(data)) {
        throw new Error('Invalid product data structure received from PayloadCMS');
      }
      
      // Process image URLs
      const processedData = processImageUrls(data);
      
      console.log('✅ Product data successfully processed and validated');
      setProductData(processedData);
      setLoading(false);
      setRetryCount(0);
      
    } catch (err: any) {
      console.error('💥 Error fetching product data:', err);
      
      const classifiedError = classifyError(err);
      setError(classifiedError);
      setLoading(false);
      
      // Auto-retry for retryable errors
      if (classifiedError.retryable && retryCount < 2) {
        console.log('🔄 Auto-retrying due to retryable error...');
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
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative">
            <div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-transparent border-r-blue-400 rounded-full animate-ping"></div>
          </div>
          
          <h2 className="mt-6 text-xl font-semibold text-gray-800">Loading Product Data</h2>
          <p className="mt-2 text-gray-600">Fetching dynamic configuration from PayloadCMS...</p>
          
          {retryCount > 0 && (
            <p className="mt-2 text-sm text-blue-600">
              Retry attempt {retryCount}/2
            </p>
          )}
          
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
          <div className="text-4xl mb-4">{getErrorIcon(error.type)}</div>
          
          <h2 className="text-2xl font-bold mb-4">
            {error.type === 'not_found' ? 'Product Not Found' :
             error.type === 'network' ? 'Connection Error' :
             error.type === 'timeout' ? 'Request Timeout' :
             error.type === 'server_error' ? 'Server Error' :
             'Error Loading Product'}
          </h2>
          
          <p className="mb-6 leading-relaxed">{error.message}</p>
          
          {error.details && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer font-medium mb-2">Technical Details</summary>
              <pre className="text-xs bg-white p-3 rounded border overflow-auto">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </details>
          )}
          
          <div className="flex gap-3 justify-center">
            {error.retryable && (
              <button 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                onClick={handleRetry}
              >
                🔄 Try Again
              </button>
            )}
            
            <button 
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              onClick={() => window.location.href = '/'}
            >
              ← Go Back
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-white bg-opacity-50 rounded-lg">
            <p className="text-sm font-medium mb-2">Troubleshooting Tips:</p>
            <ul className="text-sm space-y-1">
              <li>• Check if PayloadCMS is running on the configured port</li>
              <li>• Verify the product ID is correct</li>
              <li>• Ensure CORS is properly configured in PayloadCMS</li>
              <li>• Check your internet connection</li>
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
        <div className="max-w-lg p-8 text-center text-yellow-600 rounded-xl bg-yellow-50 border-2 border-yellow-200 shadow-lg">
          <div className="text-4xl mb-4">🤔</div>
          <h2 className="text-xl font-bold mb-4">No Product Data</h2>
          <p className="mb-6">Product data was successfully fetched but appears to be empty.</p>
          <button 
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            onClick={handleRetry}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }
  
  // =====================================
  // RENDER DESIGNER WITH SUCCESS INDICATOR
  // =====================================
  
  return (
    <div className="relative">
      {/* Success indicator */}
      <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">PayloadCMS Connected</span>
        </div>
      </div>
      
      {/* Main designer */}
      <EnhancedDynamicDesigner productData={productData} />
    </div>
  );
};

export default DataLoader;