import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearch, useLocation } from '@tanstack/react-router';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  IconCirclePlus, 
  IconX, 
  IconLink, 
  IconUpload, 
  IconCopy, 
  IconEdit, 
  IconCheck, 
  IconTrash, 
  IconPhotoPlus,
  IconInfoCircle,
  IconTruck,
  IconClock
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

// Import components from our new modules
import { StreamlinedImageManager } from '../../products/context/product-modules/ImageManager';
import { EnhancedOptionComponent } from '../../products/context/product-modules/OptionComponents';
import { ProductSchema } from '../../products/data/schema';
import { createProduct, uploadProductImage, fetchCategories, batchUpdateInventoryLevels, fetchProduct, submitArtwork, uploadArtworkFile, createArtworkPayload } from '../../products/context/fetchApi';
import HierarchicalCategorySelector from '../../products/context/HierarchicalCategorySelector';

// Import rich text editor component
import { TipTapEditor } from '../../products/context/editor';

// Import types and utilities
import { 
  MediaItem, 
  VariantInfo, 
  ProductFormValues,
  Option,
  Variant,
  OptionValue,
  ProductDetail
} from '../../products/context/product-modules/types';

import { 
  generateUUID,
  generateUniqueSku, 
  generateVariantsFromOptions,
  isColorOption,
  prepareVariantImageMetadata,
  getColorImagesMetadata
} from '../../products/context/product-modules/utils';

// ===== TYPE DEFINITIONS =====
interface PayloadImageSettings {
  color_Images: boolean;
  size_Images: boolean;
  material_Images: boolean;
  style_Images: boolean;
  pattern_Images?: boolean;
  finish_Images?: boolean;
}

interface PayloadProductData {
  id?: string;
  cost?: number;
  dimensions?: {
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
  };
  materials?: {
    primary?: string;
    secondary?: string[];
  };
  pricing?: {
    suggestedRetail?: number;
    markupValue?: number;
    costBreakdown?: any;
  };
  fulfillmentSettings?: {
    handlingTime?: string;
    shippingTime?: string;
    provider?: string;
  };
  color_Images?: boolean;
  size_Images?: boolean;
  material_Images?: boolean;
  style_Images?: boolean;
  shippingInfo?: {
    weight?: number;
    shippingDimensions?: string;
    shippingLocationID?: string; // This is the correct path
    packageType?: string;
  };
  payloadConfiguration?: {
    color_Images: boolean;
    size_Images: boolean;
    strategy: string;
    calculation_breakdown: Array<{
      color: string;
      mockupsForColor: number;
      sizesCount: number;
      subtotal: number;
    }>;
  };
}

interface ProcessedImage {
  file: File;
  url: string;
  colorValue?: string;
  size: number;
  dimensions?: { width: number; height: number };
  quality: 'high' | 'medium' | 'low';
}

interface SelectedProductInfo {
  color: string;
  colorName: string;
  productId: string;
  productName: string;
}

interface PayloadCMSProduct {
  id: number;
  name: string;
  slug: string;
  status: string;
  productType: string;
  brand: string;
  brandSku: string;
  sku: string;
  cost: number;
  pricing: {
    markupType: string;
    markupValue: number;
    suggestedRetail: number;
  };
  description: string;
  materials: {
    primary: string;
    weight: string;
    construction: string;
    finish?: string;
    efabType: string;
    fabricWeight: number;
  };
  physicalDimensions: {
    widthInches: number;
    heightInches: number;
    depthInches: number;
    diameter?: number;
    units: string;
  };
  shippingInfo: {
    weight: number;
    shippingDimensions: string;
    packageType: string;
  };
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
  color_Images: boolean;
  size_Images: boolean;
  categories: Array<{
    id: number;
    title: string;
    slug: string;
  }>;
}

// ===== ENHANCED TYPE DEFINITIONS =====
interface PayloadCMSLocationState {
  payloadProduct?: PayloadCMSProduct;
  designData?: DesignData;
  designImages?: Record<string, string>;
  mockupImages?: Record<string, string>;
  uniqueImages?: Record<string, {
    imageData: string;
    colorName: string;
    mockupTitle: string;
    sizeName?: string;
  }>;
}

interface DesignData {
  productInfo: {
    title: string;
    description: string;
    sku: string;
    brand: string;
  };
  options: {
    title: string;
    optionValues: string[];
  }[];
  designElements: Record<string, any[]>;
  colorDetails: {
    name: string;
    value: string;
  }[];
  printingTechnology: string;
  price: number;
  mockupData?: any;
  layersInfo?: any[];
  canvasConfigs?: Record<string, any>;
  printableAreas?: Record<string, any>;
  selectedProduct?: SelectedProductInfo;
}

interface LocationState {
  designData?: DesignData;
  designImages?: DesignImageItem[]; // ✅ FIXED: Array of design images
  mockupImages?: Record<string, string>;
  canvasImages?: Array<{  // 🔥 ADD THIS
    area_id: string;
    image_data: string;
    metadata: any;
    description: string;
  }>;
  uniqueImages?: Record<string, {
    imageData: string;
    colorName: string;
    mockupTitle: string;
    sizeName?: string;
  }>;
  uploadedFiles?: any[];
  selectedProduct?: SelectedProductInfo;
  enhancedProductData?: PayloadProductData;
  skipMockupGeneration?: boolean;
}

// Add the missing interface
interface DesignImageItem {
  area: string;
  base64Data: string;
  name: string;
  id?: string;
  originalWidth?: number;
  originalHeight?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  position?: {
    x: number;
    y: number;
  };
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  type?: string;
  opacity?: number;
}

interface SearchParams {
  fromDesigner?: string;
  from?: string;
}

interface ImageAssociationSettings {
  color_Images: boolean;
  size_Images: boolean;
  material_Images?: boolean;
  style_Images?: boolean;
}

// NEW: Pre-generated image lookup structure
interface PreGeneratedImageData {
  imageData: string;
  colorName: string;
  mockupTitle: string;
  sizeName?: string;
  key: string;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Enhanced function to check if an option is a size option
 */

const createColorMatcher = (designData: DesignData) => {
  // Extract all available colors from design data
  const availableColors = new Map<string, { name: string; hex?: string }>();
  
  // Get colors from colorDetails (primary source)
  if (designData.colorDetails && Array.isArray(designData.colorDetails)) {
    designData.colorDetails.forEach(color => {
      if (color.name) {
        availableColors.set(color.name.toLowerCase(), {
          name: color.name,
          hex: color.value
        });
      }
    });
  }
  
  // Get colors from options (fallback)
  if (designData.options && Array.isArray(designData.options)) {
    const colorOption = designData.options.find(opt => 
      opt.title && opt.title.toLowerCase().includes('color')
    );
    
    if (colorOption?.optionValues) {
      colorOption.optionValues.forEach(colorValue => {
        const key = colorValue.toLowerCase();
        if (!availableColors.has(key)) {
          availableColors.set(key, { name: colorValue });
        }
      });
    }
  }
  
  return {
    availableColors,
    
    /**
     * Match color from variant key using multiple strategies
     */
    matchColor: (variantKey: string): string => {
      
      const keyLower = variantKey.toLowerCase();
      const keyParts = variantKey.split(/[-_\s]+/).filter(p => p.length > 0);
      
      // Strategy 1: Exact match in parts
      for (const part of keyParts) {
        const partLower = part.toLowerCase();
        if (availableColors.has(partLower)) {
          const matched = availableColors.get(partLower)!;
          return matched.name;
        }
      }
      
      // Strategy 2: Substring match in full key
      for (const [colorKey, colorData] of availableColors) {
        if (keyLower.includes(colorKey)) {
          return colorData.name;
        }
      }
      
      // Strategy 3: Partial word matching (for compound color names)
      for (const [colorKey, colorData] of availableColors) {
        const colorWords = colorKey.split(/\s+/);
        const hasAllWords = colorWords.every(word => 
          word.length > 2 && keyLower.includes(word)
        );
        if (hasAllWords) {
          return colorData.name;
        }
      }
      
      // Strategy 4: Common color pattern matching (dynamic)
      const commonColorPatterns = createCommonColorPatterns(availableColors);
      for (const [pattern, colorName] of commonColorPatterns) {
        if (keyLower.includes(pattern)) {
          return colorName;
        }
      }
      
      // Fallback: Return first available color
      const firstColor = Array.from(availableColors.values())[0];
      if (firstColor) {
        return firstColor.name;
      }
      
      return 'Unknown';
    },
    
    /**
     * Get all color names
     */
    getAllColorNames: (): string[] => {
      return Array.from(availableColors.values()).map(c => c.name);
    },
    
    /**
     * Get hex value for a color name
     */
    getHexForColor: (colorName: string): string | undefined => {
      const colorKey = colorName.toLowerCase();
      return availableColors.get(colorKey)?.hex;
    }
  };
};

const createCommonColorPatterns = (availableColors: Map<string, { name: string; hex?: string }>): Map<string, string> => {
  const patterns = new Map<string, string>();
  
  for (const [colorKey, colorData] of availableColors) {
    const colorName = colorData.name;
    const colorLower = colorKey;
    
    // Add common abbreviations and variations
    if (colorLower.includes('black') || colorLower === 'blk') {
      patterns.set('blk', colorName);
      patterns.set('black', colorName);
    }
    
    if (colorLower.includes('white') || colorLower === 'wht') {
      patterns.set('wht', colorName);
      patterns.set('white', colorName);
    }
    
    if (colorLower.includes('red') || colorLower === 'rd') {
      patterns.set('rd', colorName);
      patterns.set('red', colorName);
    }
    
    if (colorLower.includes('blue') || colorLower === 'bl' || colorLower === 'blu') {
      patterns.set('bl', colorName);
      patterns.set('blu', colorName);
      patterns.set('blue', colorName);
    }
    
    if (colorLower.includes('green') || colorLower === 'grn') {
      patterns.set('grn', colorName);
      patterns.set('green', colorName);
    }
    
    if (colorLower.includes('yellow') || colorLower === 'yel') {
      patterns.set('yel', colorName);
      patterns.set('yellow', colorName);
    }
    
    if (colorLower.includes('purple') || colorLower === 'pur') {
      patterns.set('pur', colorName);
      patterns.set('purple', colorName);
    }
    
    if (colorLower.includes('orange') || colorLower === 'org') {
      patterns.set('org', colorName);
      patterns.set('orange', colorName);
    }
    
    if (colorLower.includes('pink') || colorLower === 'pnk') {
      patterns.set('pnk', colorName);
      patterns.set('pink', colorName);
    }
    
    if (colorLower.includes('brown') || colorLower === 'brn') {
      patterns.set('brn', colorName);
      patterns.set('brown', colorName);
    }
    
    if (colorLower.includes('gray') || colorLower.includes('grey') || colorLower === 'gry') {
      patterns.set('gry', colorName);
      patterns.set('gray', colorName);
      patterns.set('grey', colorName);
    }
    
    // Add first 3 characters as abbreviation
    if (colorLower.length >= 3) {
      patterns.set(colorLower.substring(0, 3), colorName);
    }
    
    // Add full color name
    patterns.set(colorLower, colorName);
  }
  
  return patterns;
};

const isSizeOption = (optionTitle: string): boolean => {
  const sizeKeywords = [
    'size', 'sizes', 'dimension', 'dimensions', 
    'length', 'width', 'height', 'diameter',
    'small', 'medium', 'large', 'xl', 'xxl',
    's', 'm', 'l', 'xs'
  ];
  
  return sizeKeywords.some(keyword => 
    optionTitle.toLowerCase().includes(keyword)
  );
};

/**
 * Enhanced function to check if an option is a material option
 */
const isMaterialOption = (optionTitle: string): boolean => {
  const materialKeywords = [
    'material', 'materials', 'fabric', 'fabrics',
    'cotton', 'polyester', 'silk', 'wool', 'leather',
    'metal', 'plastic', 'wood', 'bamboo', 'glass'
  ];
  
  return materialKeywords.some(keyword => 
    optionTitle.toLowerCase().includes(keyword)
  );
};

/**
 * Enhanced function to check if an option is a style option
 */
const isStyleOption = (optionTitle: string): boolean => {
  const styleKeywords = [
    'style', 'styles', 'design', 'designs', 'pattern', 'patterns',
    'finish', 'finishes', 'type', 'types', 'variant', 'variants',
    'model', 'models', 'edition', 'editions'
  ];
  
  return styleKeywords.some(keyword => 
    optionTitle.toLowerCase().includes(keyword)
  );
};

/**
 * Determines if an option should have image association based on PayloadCMS settings
 */
const getImageAssociationForOption = (
  optionTitle: string, 
  settings: PayloadImageSettings
): boolean => {
  if (!optionTitle) return false;
  
  const normalizedTitle = optionTitle.toLowerCase().trim();
  
  // Color options
  if (isColorOption(optionTitle)) {
    const result = settings.color_Images;
    return result;
  }
  
  // Size options
  if (isSizeOption(normalizedTitle)) {
    const result = settings.size_Images;
    return result;
  }
  
  // Material options
  if (isMaterialOption(normalizedTitle)) {
    const result = settings.material_Images || false;
    return result;
  }
  
  // Style options
  if (isStyleOption(normalizedTitle)) {
    const result = settings.style_Images || false;

    return result;
  }
  return false;
};

/**
 * Generic function to check if an option should have images based on PayloadCMS settings
 */
const shouldOptionHaveImages = (
  optionTitle: string, 
  imageAssociationSettings: PayloadImageSettings
): boolean => {
  return getImageAssociationForOption(optionTitle, imageAssociationSettings);
};


// Move this near other utility functions (around line 400-500)
const removeDuplicateDesignImages = (designImages: MediaItem[]): MediaItem[] => {
  //console.log('🔍 Starting deduplication with', designImages.length, 'images');
  
  const uniqueImages = [];
  const seenHashes = new Set();
  
  for (let i = 0; i < designImages.length; i++) {
    const image = designImages[i];
    
    // Create hash based on file content (ignore timestamps and random IDs)
    let contentHash = 'no-file';
    if (image.file) {
      const namePattern = image.file.name.replace(/[-_]\d+[-_]/g, '-X-'); // Remove timestamps
      contentHash = `${image.file.size}-${image.file.type}-${namePattern}`;
    }
    
    // Use original filename and area only
    const designContext = `${image.metadata?.designArea || 'unknown'}-${image.metadata?.originalFileName || 'unnamed'}`;
    const hash = `${contentHash}-${designContext}`;
    
    if (!seenHashes.has(hash)) {
      seenHashes.add(hash);
      uniqueImages.push(image);
      //console.log('✅ UNIQUE - Keeping image:', image.file?.name || 'unnamed');
    } else {
      //console.log('🚫 DUPLICATE - Removing image:', image.file?.name || 'unnamed');
      if (image.url?.startsWith('blob:')) {
        URL.revokeObjectURL(image.url);
      }
    }
  }
  
  //console.log('🎯 Deduplication result:', uniqueImages.length, 'unique images');
  return uniqueImages;
};
/**
 * Process base64 image data to File object
 */
const processBase64ToFile = async (
  base64Data: string, 
  fileName: string, 
  colorName?: string
): Promise<ProcessedImage | null> => {
  try {
    
    if (!base64Data) {
      throw new Error('Base64 data is empty');
    }
    
    if (!base64Data.startsWith('data:image/')) {
      throw new Error('Invalid data URL format - must start with data:image/');
    }
    
    if (!base64Data.includes('base64,')) {
      throw new Error('Invalid data URL format - missing base64 marker');
    }
    
    const [header, base64Content] = base64Data.split('base64,');
    
    if (!header || !base64Content) {
      throw new Error('Failed to split base64 data URL');
    }
    
    const mimeType = header.split(':')[1]?.split(';')[0];
    
    if (!mimeType || !mimeType.startsWith('image/')) {
      throw new Error(`Invalid MIME type: ${mimeType}`);
    }
    
    if (base64Content.length < 100) {
      throw new Error(`Base64 content too short: ${base64Content.length} characters`);
    }
    
    let binaryString: string;
    try {
      binaryString = atob(base64Content);
    } catch (atobError) {
      throw new Error(`Failed to decode base64: ${atobError.message}`);
    }
    
    if (binaryString.length < 100) {
      throw new Error(`Decoded binary too short: ${binaryString.length} bytes`);
    }
    
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: mimeType });
    
    if (blob.size < 1000) {
      throw new Error(`Generated blob too small: ${blob.size} bytes`);
    }
    
    const cleanFileName = fileName.replace(/[^a-z0-9.-]/gi, '_');
    const file = new File([blob], cleanFileName, { 
      type: mimeType,
      lastModified: Date.now()
    });
    
    
    const objectUrl = URL.createObjectURL(file);
    let dimensions: { width: number; height: number };
    
    try {
      dimensions = await validateImageDimensions(objectUrl);
    } catch (validationError) {
      URL.revokeObjectURL(objectUrl);
      throw new Error(`Image validation failed: ${validationError.message}`);
    }
    
    const result: ProcessedImage = {
      file,
      url: objectUrl,
      colorValue: colorName,
      size: file.size,
      dimensions,
      quality: file.size > 100000 ? 'high' : file.size > 50000 ? 'medium' : 'low'
    };
    
    return result;
    
  } catch (error) {
    return null;
  }
};

/**
 * Validate image dimensions
 */
const validateImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    const timeout = setTimeout(() => {
      reject(new Error('Image validation timeout (10s)'));
    }, 10000);
    
    img.onload = () => {
      clearTimeout(timeout);
      
      if (img.width < 10 || img.height < 10) {
        reject(new Error(`Invalid image dimensions: ${img.width}x${img.height}`));
        return;
      }
      
      if (img.width > 10000 || img.height > 10000) {
        reject(new Error(`Image too large: ${img.width}x${img.height}`));
        return;
      }
      
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to load image for dimension validation'));
    };
    
    img.src = url;
  });
};

// ===== SUCCESS NOTIFICATION COMPONENT =====
const DesignImportSuccessNotification: React.FC<{
  designData: DesignData | null;
  enhancedProductData?: PayloadProductData;
  onDismiss: () => void;
}> = ({ designData, enhancedProductData, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, [onDismiss]);
  
  if (!isVisible || !designData) return null;
  
  const layersCount = designData.layersInfo?.length || 0;
  const elementsCount = Object.values(designData.designElements || {}).flat().length;
  const hasGoodQuality = designData.layersInfo?.every(layer => 
    layer.printQuality === 'Good' || layer.printQuality === 'Excellent'
  );
  const avgDPI = designData.layersInfo?.length > 0 
    ? Math.round(designData.layersInfo.reduce((acc, layer) => acc + layer.dpi, 0) / designData.layersInfo.length)
    : 0;
  
  return (
    <div className={`fixed top-4 right-4 max-w-md bg-white border border-green-200 rounded-lg shadow-lg z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      {/* <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1 w-0 ml-3">
            <p className="text-sm font-medium text-green-800">
              Design Successfully Imported!
            </p>
            <div className="mt-2 space-y-1 text-sm text-green-700">
              <div className="flex justify-between">
                <span>Design Elements:</span>
                <span className="font-medium">{elementsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Layers:</span>
                <span className="font-medium">{layersCount}</span>
              </div>
              {avgDPI > 0 && (
                <div className="flex justify-between">
                  <span>Average DPI:</span>
                  <span className={`font-medium ${hasGoodQuality ? 'text-green-600' : 'text-yellow-600'}`}>
                    {avgDPI}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Print Quality:</span>
                <span className={`font-medium ${hasGoodQuality ? 'text-green-600' : 'text-yellow-600'}`}>
                  {hasGoodQuality ? 'Excellent' : 'Mixed'}
                </span>
              </div>
              {enhancedProductData && (
                <>
                  <div className="pt-2 mt-2 border-t border-green-300">
                    <div className="flex justify-between">
                      <span>Enhanced Data:</span>
                      <span className="font-medium text-blue-600">Available</span>
                    </div>
                    {enhancedProductData.cost && (
                      <div className="flex justify-between">
                        <span>Base Cost:</span>
                        <span className="font-medium">₹{enhancedProductData.cost}</span>
                      </div>
                    )}
                    {enhancedProductData.materials?.primary && (
                      <div className="flex justify-between">
                        <span>Material:</span>
                        <span className="text-xs font-medium">{enhancedProductData.materials.primary}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onDismiss, 300);
              }}
              className="inline-flex text-gray-400 bg-white rounded-md hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div> */}
    </div>
  );
};

// Default location ID for inventory management
//const defaultLocationId = "sloc_01JKWDDGKGCQFJANXV0CVJN2QW";

// ===== MAIN CREATE COMPONENT =====
const Create: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useSearch({
    from: undefined as any,
  }) as SearchParams;
  
  // ===== COMPONENT INITIALIZATION LOG =====
  
  // Designer data state
  const [designData, setDesignData] = useState<DesignData | null>(null);
  const [importedDesignImages, setImportedDesignImages] = useState<Record<string, string>>({});
  const [importedMockupImages, setImportedMockupImages] = useState<Record<string, string>>({});
  const [importedFiles, setImportedFiles] = useState<any[]>([]);
  const [showImportNotification, setShowImportNotification] = useState(false);
  const [enhancedProductData, setEnhancedProductData] = useState<PayloadProductData | null>(null);
  // Add this state variable with your other state declarations
  const [dynamicLocationId, setDynamicLocationId] = useState<string>('');
  // Add these with your other state declarations
const [isProcessingDesignImages, setIsProcessingDesignImages] = useState<boolean>(false);
const [hasProcessedInitialData, setHasProcessedInitialData] = useState<boolean>(false);
const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
// Add with your other state declarations
const [importedCanvasImages, setImportedCanvasImages] = useState<Array<{
  area_id: string;
  image_data: string;
  metadata: any;
  description: string;
}>>([]);

  // ===== NEW: PRE-GENERATED IMAGE MANAGEMENT STATE =====
  const [preGeneratedMockupImages, setPreGeneratedMockupImages] = useState<Record<string, string>>({});
  const [skipMockupGeneration, setSkipMockupGeneration] = useState<boolean>(false);
  const [imageReuseStats, setImageReuseStats] = useState({
    totalReceived: 0,
    reused: 0,
    regenerated: 0
  });

  // Main state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImageTab, setActiveImageTab] = useState<string>("upload");
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [payloadProduct, setPayloadProduct] = useState<PayloadCMSProduct | null>(null);
  
  // State for storing categories from API
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // For managing the new option value being added for each option
  const [newOptionValues, setNewOptionValues] = useState<Record<number, string>>({});
  
  // For images, we store objects with a file (if newly added) and URL and rank.
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  
  // Store uploaded image data (id to url mapping)
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});

  // For bulk editing variants
  const [bulkEditMode, setBulkEditMode] = useState<boolean>(false);
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkStock, setBulkStock] = useState<string>("");
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  // Ref for the hidden file input for drag-and-drop.
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for variant toggle
  const [hasVariants, setHasVariants] = useState<boolean>(false);
  const [payloadImageSettings, setPayloadImageSettings] = useState<ImageAssociationSettings>({
    color_Images: false,
    size_Images: false,
    material_Images: false,
    style_Images: false
  });
  
  // Initialize the form with default values based on the schema
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    shouldFocusError: false,
    mode: 'onSubmit', 
    defaultValues: {
      title: '',
      subtitle: '',
      handle: '',
      description: '',
      status: 'draft',
      thumbnail: '',
      discountable: true,
      category_id: '',
      options: [
        {
          id: generateUUID(),
          title: 'Size',
          optionValues: [],
          colorHexValues: {},
          imageAssociation: false
        }
      ],
      variants: [],
      defaultVariantPrice: 0,
      defaultVariantSku: generateUniqueSku('default'),
      defaultVariantStock: 0,
      weight: '',
      length: '',
      width: '',
      height: '',
      material: '',
      origin_country: '',
      // Fields for metadata
      productDetails: [{ id: generateUUID(), text: '' }],
      storyBehindDesign: '',
      locationId: '',
    
      // Default shipping fields
      shippingDays: '7-10',
      handlingTime: '2-3',
    },
  });

  // Field arrays for options and variants.
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
    update: updateOption,
  } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const {
    fields: variantFields,
    replace: replaceVariants,
    remove: removeVariant,
    update: updateVariant,
  } = useFieldArray({
    control: form.control,
    name: 'variants',
  });
  
  // Field array for product details (bullet points)
  const {
    fields: productDetailFields,
    append: appendProductDetail,
    remove: removeProductDetail,
  } = useFieldArray({
    control: form.control,
    name: 'productDetails',
  });

  // ===== NEW: PRE-GENERATED IMAGE LOOKUP FUNCTION =====
  const getPreGeneratedImage = useCallback((mockupTitle: string, colorName: string, sizeName?: string): string | null => {
    if (Object.keys(preGeneratedMockupImages).length === 0) {
      return null;
    }
    
    // Create multiple possible keys to check
    const possibleKeys = [
      // Exact matches
      `${mockupTitle}_${colorName}${sizeName ? `_${sizeName}` : ''}`,
      `${mockupTitle}-${colorName}${sizeName ? `-${sizeName}` : ''}`,
      `${mockupTitle.toLowerCase()}_${colorName.toLowerCase()}${sizeName ? `_${sizeName.toLowerCase()}` : ''}`,
      `${mockupTitle.toLowerCase()}-${colorName.toLowerCase()}${sizeName ? `-${sizeName.toLowerCase()}` : ''}`,
      
      // Without size (for shared images)
      `${mockupTitle}_${colorName}`,
      `${mockupTitle}-${colorName}`,
      `${mockupTitle.toLowerCase()}_${colorName.toLowerCase()}`,
      `${mockupTitle.toLowerCase()}-${colorName.toLowerCase()}`,
      
      // Partial matches
      colorName,
      colorName.toLowerCase(),
    ];
    
    // Try each possible key
    for (const key of possibleKeys) {
      if (preGeneratedMockupImages[key]) {
        setImageReuseStats(prev => ({ ...prev, reused: prev.reused + 1 }));
        return preGeneratedMockupImages[key];
      }
    }
    
    // Check for partial key matches
    for (const [existingKey, imageData] of Object.entries(preGeneratedMockupImages)) {
      // Check if the existing key contains our search terms
      const keyLower = existingKey.toLowerCase();
      const mockupLower = mockupTitle.toLowerCase();
      const colorLower = colorName.toLowerCase();
      const sizeLower = sizeName?.toLowerCase();
      
      if (keyLower.includes(mockupLower) && keyLower.includes(colorLower)) {
        if (!sizeName || keyLower.includes(sizeLower!)) {
          setImageReuseStats(prev => ({ ...prev, reused: prev.reused + 1 }));
          return imageData;
        }
      }
    }
    
    setImageReuseStats(prev => ({ ...prev, regenerated: prev.regenerated + 1 }));
    return null;
  }, [preGeneratedMockupImages]);

  // ===== NEW: EXTRACT AND STORE PRE-GENERATED IMAGES =====
  const extractAndStorePreGeneratedImages = useCallback((locationState: LocationState) => {
    
    const extractedImages: Record<string, string> = {};
    let totalImages = 0;
    
    // Extract from mockupImages (legacy format)
    if (locationState.mockupImages) {
      
      Object.entries(locationState.mockupImages).forEach(([key, imageData]) => {
        if (imageData && typeof imageData === 'string' && imageData.startsWith('data:image/')) {
          extractedImages[key] = imageData;
          totalImages++;
        }
      });
    }
    
    // Extract from uniqueImages (enhanced format)
    if (locationState.uniqueImages) {
      
      Object.entries(locationState.uniqueImages).forEach(([key, imageInfo]) => {
        if (imageInfo?.imageData && imageInfo.imageData.startsWith('data:image/')) {
          // Create multiple key variations for better lookup
          const baseKey = key;
          const colorSizeKey = `${imageInfo.mockupTitle}_${imageInfo.colorName}${imageInfo.sizeName ? `_${imageInfo.sizeName}` : ''}`;
          const colorOnlyKey = `${imageInfo.mockupTitle}_${imageInfo.colorName}`;
          
          extractedImages[baseKey] = imageInfo.imageData;
          extractedImages[colorSizeKey] = imageInfo.imageData;
          extractedImages[colorOnlyKey] = imageInfo.imageData;
          
          totalImages++;
        }
      });
    }
    
    if (totalImages > 0) {
      setPreGeneratedMockupImages(extractedImages);
      setSkipMockupGeneration(true);
      setImageReuseStats({
        totalReceived: totalImages,
        reused: 0,
        regenerated: 0
      });
      
    } else {
      setSkipMockupGeneration(false);
    }
    
    return totalImages > 0;
  }, []);

  // ===== ENHANCED DESIGNER DATA HANDLING =====
  // Replace your existing useEffect with this corrected version
useEffect(() => {
  let isProcessing = false; // Add this line
  const processLocationState = async () => {
    
    if (location.state) {
      isProcessing = true; // Add this line
      const locationState = location.state as LocationState;
      
      // STEP 1: Extract and store pre-generated images FIRST
      const hasPreGeneratedImages = extractAndStorePreGeneratedImages(locationState);
      
      // STEP 2: Check for skipMockupGeneration flag
      if (locationState.skipMockupGeneration !== undefined) {
        setSkipMockupGeneration(locationState.skipMockupGeneration);
      }
      
      // STEP 3A: Process designImages array (new format) - PROPERLY AWAITED
      // STEP 3: FIXED - Process design images ONLY ONCE
      let designImagesProcessed = false;

      // Option A: Process designImages array (new format) - HIGHEST PRIORITY
      if (locationState.designImages && Array.isArray(locationState.designImages) && locationState.designImages.length > 0) {
        await processDesignImagesArray(locationState.designImages);
        designImagesProcessed = true;
      }
       if (locationState.canvasImages && Array.isArray(locationState.canvasImages)) {
        console.log('📸 Found', locationState.canvasImages.length, 'canvas images');
        setImportedCanvasImages(locationState.canvasImages);
      }
      // Option B: Process design elements (legacy format) - ONLY if new format not found
      else if (locationState.designData?.designElements && !designImagesProcessed) {
        
        let totalImages = 0;
        Object.entries(locationState.designData.designElements).forEach(([area, elements]) => {
          if (Array.isArray(elements)) {
            elements.forEach((element) => {
              if (element.type === 'image' && element.imageBase64) {
                totalImages++;
              }
            });
          }
        });
        
        if (totalImages > 0) {
          await processRawDesignImages(locationState.designData.designElements);
          designImagesProcessed = true;
        }
      }
      
      // Continue with rest of your existing logic...
      if (locationState.designData) {
        setDesignData(locationState.designData);
        setEnhancedProductData(locationState.enhancedProductData);
        
        const imageSettings = {
          color_Images: locationState.enhancedProductData?.color_Images || false,
          size_Images: locationState.enhancedProductData?.size_Images || false,
          material_Images: locationState.enhancedProductData?.material_Images || false,
          style_Images: locationState.enhancedProductData?.style_Images || false
        };
        
        setPayloadImageSettings(imageSettings);
        
        // Populate form - add delay to ensure processing completes
       setTimeout(() => {
        // ALWAYS prioritize selected colors from canvas over PayloadCMS data
        if (locationState.designData?.colorDetails && 
            Array.isArray(locationState.designData.colorDetails) && 
            locationState.designData.colorDetails.length > 0) {
          
          // Use SELECTED colors from canvas
          populateFormWithDesignData(locationState.designData, locationState.enhancedProductData, imageSettings);
          
        } else if (locationState.enhancedProductData && Object.keys(locationState.enhancedProductData).length > 10) {
          
          // Only fall back to PayloadCMS if no selected colors from canvas
          const payloadProduct = locationState.enhancedProductData as PayloadCMSProduct;
          populateFormWithPayloadCMSData(payloadProduct);
          
        } else {
          populateFormWithDesignData(locationState.designData, locationState.enhancedProductData, imageSettings);
        }
      }, 1000);
        
        setShowImportNotification(true);
      }
    }
  };
  
  // Execute the async processing
  processLocationState().catch(error => {
      isProcessing = false; // Add this
    setError('Failed to process imported design data');
  });
}, [location.state, extractAndStorePreGeneratedImages]);


  // ===== ENHANCED MOCKUP IMAGE PROCESSING WITH REUSE =====
  const handleMockupImagesEnhanced = async (
    locationState: LocationState, 
    directImageSettings?: ImageAssociationSettings
  ) => {
    try {
      
      const { mockupImages = {}, uniqueImages = {}, designData, enhancedProductData } = locationState;
      const settingsToUse = directImageSettings || payloadImageSettings;
      

      // STEP 1: Process raw design images FIRST
      if (designData?.designElements) {
        await processRawDesignImages(designData.designElements);
      }

      // STEP 2: Process mockup images with reuse logic
      if (skipMockupGeneration && Object.keys(preGeneratedMockupImages).length > 0) {
        await reusePreGeneratedMockupImages(designData!, settingsToUse);
      } else {
        if (Object.keys(uniqueImages).length > 0) {
          await processUniqueImagesFromCanvas(uniqueImages, designData!, settingsToUse);
        } else if (Object.keys(mockupImages).length > 0) {
          await processMockupImagesDirectly(mockupImages, designData!, settingsToUse);
        } else {
          setError('No mockup images found from designer');
        }
      }
      
    } catch (error) {
      setError('Failed to process images from designer');
    }
  };

  // ===== NEW: REUSE PRE-GENERATED MOCKUP IMAGES =====
  const reusePreGeneratedMockupImages = async (
    designData: DesignData,
    imageSettings: ImageAssociationSettings
  ) => {
    
    const processedImages: MediaItem[] = [];
    let currentRank = 1000; // Start after design images
    let reuseCount = 0;
    
    try {
      // Extract color and size info from design data for processing
      const colorDetails = designData.colorDetails || [];
      const sizeOption = designData.options?.find(opt => 
        opt.title.toLowerCase().includes('size')
      );
      const sizes = sizeOption?.optionValues || [];
      
      // Process each color
      for (const colorDetail of colorDetails) {
        if (imageSettings.size_Images && sizes.length > 0) {
          // Size-specific images
          for (const size of sizes) {
            const preGeneratedImage = getPreGeneratedImage('mockup', colorDetail.name, size);
            
            if (preGeneratedImage) {
              const fileName = `reused-mockup-${colorDetail.name.toLowerCase()}-${size.toLowerCase()}.png`;
              
              const processedImage = await processBase64ToFile(
                preGeneratedImage,
                fileName,
                colorDetail.name
              );
              
              if (processedImage) {
                const mediaItem: MediaItem = {
                  file: processedImage.file,
                  url: processedImage.url,
                  rank: currentRank++,
                  isNew: true,
                  variantInfo: {
                    optionName: 'Color',
                    optionValues: [colorDetail.name],
                    secondaryOptionName: 'Size',
                    secondaryOptionValues: [size]
                  },
                  colorValue: colorDetail.name,
                  metadata: {
                    isReuseImage: true,
                    reuseSource: 'pre_generated',
                    originalVariantKey: `${colorDetail.name}_${size}`,
                    extractedColorName: colorDetail.name,
                    extractedSizeName: size,
                    payloadSettings: { ...imageSettings }
                  }
                };
                
                processedImages.push(mediaItem);
                reuseCount++;
              }
            }
          }
        } else {
          // Color-specific, size-shared images
          const preGeneratedImage = getPreGeneratedImage('mockup', colorDetail.name);
          
          if (preGeneratedImage) {
            const fileName = `reused-mockup-${colorDetail.name.toLowerCase()}-shared.png`;
            
            const processedImage = await processBase64ToFile(
              preGeneratedImage,
              fileName,
              colorDetail.name
            );
            
            if (processedImage) {
              const mediaItem: MediaItem = {
                file: processedImage.file,
                url: processedImage.url,
                rank: currentRank++,
                isNew: true,
                variantInfo: {
                  optionName: 'Color',
                  optionValues: [colorDetail.name],
                  isSharedAcrossSizes: true,
                  coversSizes: sizes
                },
                colorValue: colorDetail.name,
                metadata: {
                  isReuseImage: true,
                  isSharedImage: true,
                  reuseSource: 'pre_generated',
                  originalVariantKey: colorDetail.name,
                  extractedColorName: colorDetail.name,
                  payloadSettings: { ...imageSettings },
                  allCoveredKeys: sizes.map(size => `${colorDetail.name}_${size}`)
                }
              };
              
              processedImages.push(mediaItem);
              reuseCount++;
            }
          }
        }
      }
      
      if (processedImages.length > 0) {
        setMediaItems(prev => [...prev, ...processedImages]);
        setTimeout(() => setActiveImageTab('upload'), 100);
        
      } else {
        setSkipMockupGeneration(false);
      }
      
      // Update reuse stats
      setImageReuseStats(prev => ({
        ...prev,
        reused: prev.reused + reuseCount
      }));
      
    } catch (error) {
      setSkipMockupGeneration(false);
    }
  };

  // ===== DESIGN IMAGE PROCESSING (UNCHANGED) =====
  const processRawDesignImages = async (designElements: Record<string, any[]>) => {
    
    if (!designElements || typeof designElements !== 'object') {
      return;
    }
    
    try {
      const rawDesignImages: MediaItem[] = [];
      let designImageRank = 0;
      let totalProcessed = 0;
      let totalFailed = 0;
      
      // Process each area
      for (const [areaName, elements] of Object.entries(designElements)) {       
        if (!Array.isArray(elements)) {
    
          continue;
        }
        
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          
          if (element.type === 'image' && element.imageBase64) {
            try {
              
              const timestamp = Date.now();
              const randomId = Math.random().toString(36).substring(2, 8);
              const cleanName = (element.imageName || 'design-image')
                .replace(/[^a-z0-9.-]/gi, '_')
                .toLowerCase();
              const fileName = `design-${cleanName}-${areaName}-${timestamp}-${randomId}.png`;
              
              const processedImage = await processBase64ToFile(
                element.imageBase64,
                fileName,
                undefined
              );
              
              if (!processedImage) {

                totalFailed++;
                continue;
              }
              
              const designMediaItem: MediaItem = {
                file: processedImage.file,
                url: processedImage.url,
                rank: designImageRank++,
                isNew: true,
                
                variantInfo: {
                  isRawDesignImage: true,
                  designArea: areaName,
                  originalFileName: element.imageName || 'Unnamed'
                },
                
                metadata: {
                  isRawDesignImage: true,
                  designArea: areaName,
                  originalFileName: element.imageName,
                  originalImageWidth: element.originalImageWidth || element.width,
                  originalImageHeight: element.originalImageHeight || element.height,
                  
                  canvasPosition: {
                    x: element.x || 0,
                    y: element.y || 0,
                    width: element.width || 0,
                    height: element.height || 0,
                    rotation: element.rotation || 0
                  },
                  
                  uploadValidation: {
                    hasFile: true,
                    fileSize: processedImage.file.size,
                    fileType: processedImage.file.type,
                    fileName: processedImage.file.name,
                    validForUpload: true
                  },
                  
                  debugInfo: {
                    source: 'canvas_design_element',
                    area: areaName,
                    elementId: element.id,
                    processed: true,
                    timestamp: new Date().toISOString(),
                    processedAt: 'processRawDesignImages'
                  }
                }
              };
              
              rawDesignImages.push(designMediaItem);
              totalProcessed++;
              
              
            } catch (error) {
              totalFailed++;
            }
          }
        }
      }
    
      
      if (rawDesignImages.length > 0) {

        
        setMediaItems(prev => {
          const combined = [...rawDesignImages, ...prev];
          
          const designImagesInState = combined.filter(item => item.metadata?.isRawDesignImage);
          
          return combined;
        });
        
        setTimeout(() => {
          setMediaItems(current => {
            const designImages = current.filter(item => item.metadata?.isRawDesignImage);
            
            if (designImages.length > 0) {

              designImages.forEach((img, index) => {
              });
            } else {
            }
            
            return current;
          });
        }, 100);
        
      } else {
      }
      
    } catch (error) {
    }
  };

  // ===== EXISTING UNIQUE IMAGES PROCESSING =====
  const processUniqueImagesFromCanvas = async (
    uniqueImages: Record<string, any>,
    designData: DesignData,
    directImageSettings?: ImageAssociationSettings
  ) => {
    try {
      const settingsToUse = directImageSettings || payloadImageSettings;
      
      const processedImages: MediaItem[] = [];
      let currentRank = 0;
      let skippedCount = 0;
      let failedCount = 0;
      
      for (const [imageHash, imageInfo] of Object.entries(uniqueImages)) {
        try {
          
          if (!imageInfo.imageData) {
            skippedCount++;
            continue;
          }
          
          let base64Data = imageInfo.imageData;
          if (!base64Data.startsWith('data:image/')) {
            if (base64Data.length > 100 && !base64Data.includes('data:')) {
              base64Data = `data:image/png;base64,${base64Data}`;
        
            } else {
              skippedCount++;
              continue;
            }
          }
          
          let extractedInfo = {
            colorName: imageInfo.colorName || 'Unknown',
            sizeName: imageInfo.sizeName
          };
          
          if (imageInfo.mockupTitle && (extractedInfo.colorName === 'Unknown' || !extractedInfo.sizeName)) {
            const parsedFromTitle = parseVariantKeyEnhanced(imageInfo.mockupTitle, designData);
            if (parsedFromTitle.colorName !== 'Unknown') {
              extractedInfo.colorName = parsedFromTitle.colorName;
            }
            if (parsedFromTitle.sizeName && !extractedInfo.sizeName) {
              extractedInfo.sizeName = parsedFromTitle.sizeName;
            }
          }
          
          if (extractedInfo.colorName === 'Unknown' && designData.colorDetails?.length > 0) {
            extractedInfo.colorName = designData.colorDetails[0].name;
          }
          
          const timestamp = Date.now();
          const fileName = extractedInfo.sizeName 
            ? `canvas-${extractedInfo.colorName.toLowerCase()}-${extractedInfo.sizeName.toLowerCase()}-${timestamp}.png`
            : `canvas-${extractedInfo.colorName.toLowerCase()}-${timestamp}.png`;
          
          
          const processedImage = await processBase64ToFile(
            base64Data,
            fileName,
            extractedInfo.colorName
          );
          
          if (!processedImage) {
            failedCount++;
            continue;
          }
          
          if (processedImage.file.size < 1000) {
        
            failedCount++;
            continue;
          }
          
          if (!processedImage.file.type.startsWith('image/')) {
  
            failedCount++;
            continue;
          }
          
          const variantInfo = createVariantInfoStructure(extractedInfo, settingsToUse);
          
          const mediaItem: MediaItem = {
            file: processedImage.file,
            url: processedImage.url,
            rank: currentRank,
            isNew: true,
            variantInfo: variantInfo,
            colorValue: extractedInfo.colorName,
            
            metadata: {
              isSharedImage: !settingsToUse.size_Images,
              originalVariantKey: `${imageInfo.mockupTitle}-${extractedInfo.colorName}${extractedInfo.sizeName ? `-${extractedInfo.sizeName}` : ''}`,
              sharingStrategy: determineSharingStrategy(settingsToUse),
              imageHash: imageHash,
              originalSize: processedImage.size,
              quality: processedImage.quality,
              validatedDimensions: processedImage.dimensions ? 
                `${processedImage.dimensions.width}x${processedImage.dimensions.height}` : 'unknown',
              extractedColorName: extractedInfo.colorName,
              extractedSizeName: extractedInfo.sizeName,
              payloadSettings: { ...settingsToUse },
              
              uploadValidation: {
                hasFile: !!processedImage.file,
                fileSize: processedImage.file.size,
                fileType: processedImage.file.type,
                fileName: processedImage.file.name,
                validForUpload: true,
                originalBase64Length: base64Data.length
              },
              
              debugInfo: {
                originalColorName: imageInfo.colorName,
                originalSizeName: imageInfo.sizeName,
                originalMockupTitle: imageInfo.mockupTitle,
                extractionStrategy: 'enhanced_validated',
                processed: true,
                timestamp: new Date().toISOString()
              }
            }
          };
          
          if (!mediaItem.file) {

            failedCount++;
            continue;
          }
          
          processedImages.push(mediaItem);
          currentRank++;
        
          
        } catch (error) {
          failedCount++;
        }
      }
      
      
      if (processedImages.length === 0) {
        setError('Enhanced processing: Failed to process any images. Check //console for details.');
        return;
      }
      
      const validImages = processedImages.filter(item => {
        const isValid = item.file && item.file.size > 0 && item.url;
        if (!isValid) {
        }
        return isValid;
      });
      
      // setMediaItems(validImages);
      setMediaItems(prev => [...prev, ...validImages])   // ✅ merge

      setTimeout(() => setActiveImageTab('upload'), 100);
      
      validImages.forEach((item, index) => {
      });
      
    } catch (error) {
      setError('Enhanced image processing failed. Check //console for details.');
    }
  };

  // ===== EXTRACT COLOR AND SIZE FROM IMAGE DATA =====
  const extractColorAndSizeFromImageData = (imageInfo: any, designData: DesignData) => {
    
    const colorMatcher = createColorMatcher(designData);
    
    let colorName = imageInfo.colorName || 'Unknown';
    let sizeName: string | undefined = imageInfo.sizeName;
    
    // Strategy 1: Direct extraction from imageInfo
    if (colorName && colorName !== 'Unknown') {
    } else {
      // Strategy 2: Extract from mockupTitle using dynamic matcher
      if (imageInfo.mockupTitle) {
        colorName = colorMatcher.matchColor(imageInfo.mockupTitle);
      }
      
      // Strategy 3: Use first available color as fallback
      if (colorName === 'Unknown') {
        const firstColor = colorMatcher.getAllColorNames()[0];
        if (firstColor) {
          colorName = firstColor;
        }
      }
    }
    
    // Size extraction with multiple strategies
    if (!sizeName && imageInfo.mockupTitle && designData.options) {
      const sizeOption = designData.options.find(opt => 
        opt.title.toLowerCase().includes('size')
      );
      
      if (sizeOption?.optionValues) {
        // Strategy 1: Direct match in mockupTitle
        for (const sizeValue of sizeOption.optionValues) {
          if (imageInfo.mockupTitle.toLowerCase().includes(sizeValue.toLowerCase())) {
            sizeName = sizeValue;
            break;
          }
        }
        
        // Strategy 2: Parse title parts
        if (!sizeName) {
          const titleParts = imageInfo.mockupTitle.split(/[-_\s]+/);
          for (const part of titleParts) {
            const matchingSize = sizeOption.optionValues.find(size => 
              size.toLowerCase() === part.trim().toLowerCase()
            );
            if (matchingSize) {
              sizeName = matchingSize;
              break;
            }
          }
        }
      }
    }
    
    return { colorName, sizeName };
  };

  // ===== HELPER FUNCTIONS =====


  // Add this helper function before the Create component
// Updated helper function to access the correct nested property
const getLocationId = (enhancedProductData?: PayloadProductData): string => {
  // First, try to get from PayloadCMS data (nested in shippingInfo)
  if (enhancedProductData?.shippingInfo?.shippingLocationID) {
    return enhancedProductData.shippingInfo.shippingLocationID;
  }
  
  // Fallback to environment variable
  const envLocationId = import.meta.env.VITE_STORE_LOCATION_ID;
  if (envLocationId) {
    return envLocationId;
  }
  
  // Final fallback (should not happen in production)
  return 'sloc_01JKWDDGKGCQFJANXV0CVJN2QW';
};
  const validateColorExists = (colorName: string, designData: DesignData): boolean => {
    const colorMatcher = createColorMatcher(designData);
    return colorMatcher.getAllColorNames().includes(colorName);
  };


  const getStaticUrl = (fileId: string): string => {
  const baseUrl = import.meta.env.VITE_STATIC_BASE_URL || 'https://files.junooni.com/junooni-files';
  return `${baseUrl}/${fileId}`;
};

  const getColorHex = (colorName: string, designData: DesignData): string | undefined => {
    const colorMatcher = createColorMatcher(designData);
    return colorMatcher.getHexForColor(colorName);
  };

  const isSizeValue = (value: string, designData: DesignData): boolean => {
    const sizeOption = designData.options?.find(opt => 
      opt.title.toLowerCase().includes('size')
    );
    
    return sizeOption?.optionValues.includes(value) || false;
  };

  const createVariantInfoStructure = (
    extractedInfo: { colorName: string; sizeName?: string },
    settings: ImageAssociationSettings
  ) => {
    const { colorName, sizeName } = extractedInfo;
    
    const baseVariantInfo = {
      optionName: 'Color',
      optionValues: [colorName || 'Unknown']
    };
    
    if (settings.color_Images && settings.size_Images && sizeName) {
      return {
        ...baseVariantInfo,
        secondaryOptionName: 'Size',
        secondaryOptionValues: [sizeName]
      };
    } else if (settings.size_Images && sizeName) {
      return {
        optionName: 'Size',
        optionValues: [sizeName],
        secondaryOptionName: 'Color',
        secondaryOptionValues: [colorName || 'Unknown']
      };
    }
    
    return baseVariantInfo;
  };

  const determineSharingStrategy = (settings: ImageAssociationSettings): string => {
    if (settings.color_Images && settings.size_Images) {
      return 'color_and_size_specific';
    } else if (settings.color_Images && !settings.size_Images) {
      return 'color_specific_size_shared';
    } else {
      return 'shared_across_all';
    }
  };

  // Replace your existing getImagesForOptionValue function with this:
  const getImagesForOptionValue = (optionName: string, optionValue: string): MediaItem[] => {
    
    const filteredImages = mediaItems.filter(item => {
      // For shared images, check if the color matches
      if (item.metadata?.isSharedImage && optionName.toLowerCase() === 'color') {
        const matches = item.colorValue?.toLowerCase() === optionValue.toLowerCase() ||
                       item.metadata?.extractedColorName?.toLowerCase() === optionValue.toLowerCase();
        
        if (matches) {
          return true;
        }
      }
      
      // ✅ CRITICAL FIX: For size options with shared images, return empty array
      // Shared images should NEVER appear in size option sections when size_Images = false
      if (item.metadata?.isSharedImage && optionName.toLowerCase() === 'size') {
        return false;
      }
      
      // Regular variant-specific matching (for non-shared images only)
      if (item.variantInfo && !item.metadata?.isSharedImage) {
        const primaryMatch = 
          item.variantInfo.optionName?.toLowerCase() === optionName.toLowerCase() &&
          item.variantInfo.optionValues?.some(val => val.toLowerCase() === optionValue.toLowerCase());
          
        const secondaryMatch = 
          item.variantInfo.secondaryOptionName?.toLowerCase() === optionName.toLowerCase() &&
          item.variantInfo.secondaryOptionValues?.some(val => val.toLowerCase() === optionValue.toLowerCase());
          
        if (primaryMatch || secondaryMatch) {
          return true;
        }
      }
      
      return false;
    });
    
    // ✅ DEDUPLICATION: Remove duplicates based on URL and metadata
    const uniqueImages = filteredImages.filter((item, index, self) => {
      return self.findIndex(img => 
        img.url === item.url && 
        img.file?.name === item.file?.name &&
        img.metadata?.originalVariantKey === item.metadata?.originalVariantKey
      ) === index;
    });
    
    return uniqueImages;
  };
  // ===== ENHANCED: GET IMAGES FOR COLOR-SIZE COMBINATION =====
  const getImagesForColorSizeCombination = (colorValue: string, sizeValue: string): MediaItem[] => {
    
    const filteredImages = mediaItems.filter(item => {
      let colorMatch = false;
      let sizeMatch = false;
      
      const colorLower = colorValue.toLowerCase();
      const sizeLower = sizeValue.toLowerCase();
      
      // Check color match (multiple strategies)
      if (item.variantInfo?.optionName?.toLowerCase() === 'color' && 
          item.variantInfo?.optionValues?.some(val => val.toLowerCase() === colorLower)) {
        colorMatch = true;
      } else if (item.metadata?.extractedColorName?.toLowerCase() === colorLower) {
        colorMatch = true;
      } else if (item.colorValue?.toLowerCase() === colorLower) {
        colorMatch = true;
      }
      
      // Check size match (multiple strategies)
      if (item.variantInfo?.secondaryOptionName?.toLowerCase() === 'size' && 
          item.variantInfo?.secondaryOptionValues?.some(val => val.toLowerCase() === sizeLower)) {
        sizeMatch = true;
      } else if (item.variantInfo?.optionName?.toLowerCase() === 'size' && 
                 item.variantInfo?.optionValues?.some(val => val.toLowerCase() === sizeLower)) {
        sizeMatch = true;
      } else if (item.metadata?.extractedSizeName?.toLowerCase() === sizeLower) {
        sizeMatch = true;
      }
      
      const result = colorMatch && sizeMatch;
      
      if (result) {
      }
      
      return result;
    });
    
    return filteredImages;
  };

  // ===== PAYLOADCMS DATA CONVERTER =====
  const convertPayloadCMSToFormData = (payloadProduct: PayloadCMSProduct): {
    designData: DesignData;
    enhancedProductData: PayloadProductData;
  } => {
    
    const designData: DesignData = {
      productInfo: {
        title: payloadProduct.name,
        description: payloadProduct.description,
        sku: payloadProduct.sku,
        brand: payloadProduct.brand
      },
      options: [
        {
          title: 'Color',
          optionValues: payloadProduct.colorOptions.map(color => color.colorName)
        },
        {
          title: 'Size', 
          optionValues: payloadProduct.sizeOptions.map(size => size.sizeName)
        }
      ].filter(option => option.optionValues.length > 0),
      designElements: {},
      colorDetails: payloadProduct.colorOptions.map(color => ({
        name: color.colorName,
        value: color.colorHex
      })),
      printingTechnology: 'dtg',
      price: payloadProduct.pricing.suggestedRetail
    };
    
    const enhancedProductData: PayloadProductData = {
      id: payloadProduct.id.toString(),
      cost: payloadProduct.cost,
      dimensions: {
        weight: payloadProduct.shippingInfo.weight,
        length: payloadProduct.physicalDimensions.widthInches * 2.54,
        width: payloadProduct.physicalDimensions.heightInches * 2.54,
        height: payloadProduct.physicalDimensions.depthInches * 2.54
      },
      materials: {
        primary: payloadProduct.materials.primary,
        secondary: payloadProduct.materials.construction ? [payloadProduct.materials.construction] : []
      },
      pricing: {
        suggestedRetail: payloadProduct.pricing.suggestedRetail,
        markupValue: payloadProduct.pricing.markupValue,
        costBreakdown: {
          baseCost: payloadProduct.cost,
          markup: payloadProduct.pricing.markupValue,
          total: payloadProduct.pricing.suggestedRetail
        }
      },
      fulfillmentSettings: {
        handlingTime: '2-3',
        shippingTime: '7-10',
        provider: 'junooni'
      },
       shippingInfo: {
      weight: payloadProduct.shippingInfo.weight,
      shippingDimensions: payloadProduct.shippingInfo.shippingDimensions,
      shippingLocationID: payloadProduct.shippingInfo.shippingLocationID, // Correct path
      packageType: payloadProduct.shippingInfo.packageType
    },
      color_Images: payloadProduct.color_Images,
      size_Images: payloadProduct.size_Images,
      material_Images: false,
      style_Images: false
    };
    
    return { designData, enhancedProductData };
  };

  // ===== UPDATED FORM POPULATION FUNCTION =====
  const populateFormWithPayloadCMSData = (payloadProduct: PayloadCMSProduct) => {
    try {

    const locationId = getLocationId(payloadProduct);
    setDynamicLocationId(locationId);
    form.setValue('locationId', locationId);
      
      // ===== 1. BASIC PRODUCT INFORMATION =====
      
      form.setValue('title', payloadProduct.name);
      form.setValue('description', payloadProduct.description);
      form.setValue('subtitle', `${payloadProduct.brand} - ${payloadProduct.productType.replace('_', ' ')}`);
      
      const widthInCm = Math.round(payloadProduct.physicalDimensions.widthInches);
      const heightInCm = Math.round(payloadProduct.physicalDimensions.heightInches);
      const lengthInCm = Math.round(payloadProduct.physicalDimensions.depthInches);
      const weightInGrams = Math.round(payloadProduct.shippingInfo.weight);
      
      form.setValue('weight', weightInGrams.toString());
      form.setValue('length', lengthInCm.toString());
      form.setValue('width', widthInCm.toString());
      form.setValue('height', heightInCm.toString());
      
      const materialInfo = payloadProduct.materials.primary;
      form.setValue('material', materialInfo);
      form.setValue('origin_country', 'IN');
      
      const suggestedPrice = payloadProduct.pricing.suggestedRetail;
      form.setValue('defaultVariantPrice', suggestedPrice);
      console.log("Mug/shirt Price", suggestedPrice);
      
      // ===== 5. STATUS AND SETTINGS =====
      form.setValue('status', payloadProduct.status === 'active' ? 'published' : 'draft');
      form.setValue('discountable', true);
      
      // ===== 6. IMAGE SETTINGS =====
      const imageSettings = {
        color_Images: payloadProduct.color_Images,
        size_Images: payloadProduct.size_Images,
        material_Images: false,
        style_Images: false
      };
      
      setPayloadImageSettings(imageSettings);
      
      const currentOptions = form.getValues('options');
      for (let i = currentOptions.length - 1; i > 0; i--) {
        removeOption(i);
      }
      
      // ===== COLOR OPTIONS REMOVED - NOW HANDLED BY populateFormWithDesignData =====
      
      // ===== SIZE OPTIONS ONLY =====
      if (payloadProduct.sizeOptions && payloadProduct.sizeOptions.length > 0) {
        // ✅ CHECK if Size option already exists
        const currentOptions = form.getValues('options');
        const existingSizeOption = currentOptions.find(opt => 
          opt.title && opt.title.toLowerCase().includes('size')
        );
        
        if (!existingSizeOption) {
          const sizeOption = {
            id: generateUUID(),
            title: 'Size',
            optionValues: payloadProduct.sizeOptions.map(size => size.sizeName),
            imageAssociation: payloadProduct.size_Images,
            colorHexValues: {}
          };
          
          appendOption(sizeOption);
        } else {
          //console.log('Size option already exists, skipping duplicate');
        }
      }
      
      setHasVariants(true);

const currentDetails = form.getValues('productDetails') || [];
for (let i = currentDetails.length - 1; i >= 0; i--) {
  removeProductDetail(i);
}

// Check for existing product details in PayloadCMS data
let existingProductDetails = null;

// Try different possible field names for product details
const detailsFields = [
  'productDetails',
  'product_details', 
  'details',
  'features',
  'highlights',
  'bullet_points',
  'key_features'
];

for (const field of detailsFields) {
  if (payloadProduct[field] && Array.isArray(payloadProduct[field]) && payloadProduct[field].length > 0) {
    existingProductDetails = payloadProduct[field];
    break;
  } else if (payloadProduct[field] && typeof payloadProduct[field] === 'string' && payloadProduct[field].trim()) {
    // If it's a string, split by newlines or bullets
    const splitDetails = payloadProduct[field]
      .split(/\n|•|\*|-/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    if (splitDetails.length > 0) {
      existingProductDetails = splitDetails;
      break;
    }
  }
}

// Add this safety check in both population functions
const ensureValidStatus = (status: any): string => {
  const validStatuses = ['published', 'draft', 'archived', 'proposed', 'rejected'];
  if (validStatuses.includes(status)) {
    return status;
  }
  return 'draft'; // Always fallback to draft
};

// Then use it:
form.setValue('status', ensureValidStatus('draft'));

if (existingProductDetails && existingProductDetails.length > 0) {
  
  existingProductDetails.forEach(detail => {
    const detailText = typeof detail === 'string' ? detail : detail.text || detail.content || String(detail);
    if (detailText.trim()) {
      appendProductDetail({ id: generateUUID(), text: detailText.trim() });
    }
  });
  
} else {
}

        let existingStory = null;

        // Try different possible field names for story/description
        const storyFields = [
          'storyBehindDesign',
          'story_behind_design',
          'product_story',
          'design_story', 
          'story',
          'long_description',
          'detailed_description',
          'brand_story',
          'inspiration',
          'design_inspiration'
        ];

        for (const field of storyFields) {
          if (payloadProduct[field] && typeof payloadProduct[field] === 'string' && payloadProduct[field].trim()) {
            existingStory = payloadProduct[field].trim();
            break;
          }
        }

        if (existingStory) {
          form.setValue('storyBehindDesign', existingStory);
        } else {
          form.setValue('storyBehindDesign', '');
        }
      
      // ===== 10. GENERATE VARIANTS WITH CORRECT PRICING =====
      setTimeout(() => {
        handleGenerateVariants();
        
        setTimeout(() => {
          const variants = form.getValues('variants');
          const correctPrice = payloadProduct.pricing.suggestedRetail;
          
          variants.forEach((_, index) => {
            form.setValue(`variants.${index}.price`, correctPrice);
            form.setValue(`variants.${index}.stock`, 10);
          });
          
          form.trigger();
        }, 800);
      }, 400);
      
      setTimeout(() => {
        form.trigger();
      }, 1000);
      
    } catch (error) {
      setError(`Failed to populate form: ${error.message}`);
    }
  };

  // ===== FORM POPULATION WITH DYNAMIC IMAGE ASSOCIATION =====
const populateFormWithDesignData = (
  data: DesignData, 
  productData?: PayloadProductData,
  directImageSettings?: ImageAssociationSettings
) => {
  try {
    console.log('🎯 POPULATE DEBUG: Starting form population with design data');
    
    const settingsToUse = directImageSettings || payloadImageSettings;
    const locationId = getLocationId(productData);
    setDynamicLocationId(locationId);
    form.setValue('locationId', locationId);
    
    // STEP 1: Basic product information
    if (data.productInfo) {
      if (data.productInfo.title) {
        form.setValue('title', data.productInfo.title);
        console.log('🎯 POPULATE DEBUG: Set title:', data.productInfo.title);
      }
      
      if (data.productInfo.description) {
        form.setValue('description', data.productInfo.description);
      }
      
      if (data.productInfo.brand) {
        form.setValue('subtitle', `By ${data.productInfo.brand}`);
      }
    }
    
    // STEP 2: Enhanced product data
    if (productData) {
      if (productData.dimensions) {
        if (productData.dimensions.weight) {
          form.setValue('weight', productData.dimensions.weight.toString());
        }
        if (productData.dimensions.length) {
          form.setValue('length', productData.dimensions.length.toString());
        }
        if (productData.dimensions.width) {
          form.setValue('width', productData.dimensions.width.toString());
        }
        if (productData.dimensions.height) {
          form.setValue('height', productData.dimensions.height.toString());
        }
      }
      
      if (productData.materials?.primary) {
        form.setValue('material', productData.materials.primary);
      }
      
      if (productData.pricing?.suggestedRetail) {
        form.setValue('defaultVariantPrice', productData.pricing.suggestedRetail);
      }
    }
    
    // STEP 3: Basic settings
    form.setValue('status', 'draft');
    form.setValue('discountable', true);
    
    // STEP 4: Process colors ONLY from colorDetails (selected colors)
    // NO cleanup loops, NO appendOption calls - just update existing option
    if (data.colorDetails && Array.isArray(data.colorDetails) && data.colorDetails.length > 0) {
      console.log('🎯 POPULATE DEBUG: Processing selected colors:', data.colorDetails.length);
      
      const colorHexValues: Record<string, string> = {};
      data.colorDetails.forEach(color => {
        if (color.name && color.value) {
          colorHexValues[color.name] = color.value;
        }
      });
      
      const selectedColorNames = data.colorDetails.map(color => color.name);
      
      // Update existing first option with color data (no cleanup needed)
      form.setValue('options.0.id', generateUUID());
      form.setValue('options.0.title', 'Color');
      form.setValue('options.0.optionValues', selectedColorNames);
      form.setValue('options.0.imageAssociation', settingsToUse.color_Images);
      form.setValue('options.0.colorHexValues', colorHexValues);
      
      console.log('🎯 POPULATE DEBUG: Set color option with values:', selectedColorNames);
    }
    
    setHasVariants(true);
    
    // STEP 5: Generate variants with delay to ensure options are set
    setTimeout(() => {
      console.log('🎯 POPULATE DEBUG: Generating variants');
      try {
        handleGenerateVariants();
        
        // Set pricing after variants are generated
        setTimeout(() => {
          const variants = form.getValues('variants');
          const priceToApply = productData?.pricing?.suggestedRetail || 
                              (productData?.cost ? Math.round(productData.cost * 2.5) : 
                              data.price || 25.00);
          
          if (variants && variants.length > 0) {
            variants.forEach((_, index) => {
              form.setValue(`variants.${index}.price`, priceToApply);
              form.setValue(`variants.${index}.stock`, 10);
            });
            console.log('🎯 POPULATE DEBUG: Variant prices set');
          }
        }, 1000);
      } catch (variantError) {
        console.error('🎯 POPULATE ERROR: Variant generation failed:', variantError);
      }
    }, 1000);
    
    console.log('🎯 POPULATE DEBUG: Form population completed successfully');
    
  } catch (error) {
    console.error('🎯 POPULATE ERROR: Form population failed:', error);
    setError(`Failed to populate form: ${error.message}`);
  }
};

  // ===== FALLBACK: DIRECT MOCKUP PROCESSING =====
  const processMockupImagesDirectly = async (
    mockupImages: Record<string, string>,
    designData: DesignData,
    directImageSettings?: ImageAssociationSettings
  ) => {
    try {
      const settingsToUse = directImageSettings || payloadImageSettings;
      
      const shouldDeduplicateByColor = settingsToUse.color_Images && !settingsToUse.size_Images;
      
      if (shouldDeduplicateByColor) {
        return await processSharedImagesByColor(mockupImages, designData, settingsToUse);
      } else {
        return await processIndividualImages(mockupImages, designData, settingsToUse);
      }
      
    } catch (error) {
      setError('Failed to process mockup images from designer');
    }
  };

const processSharedImagesByColor = async (
  mockupImages: Record<string, string>,
  designData: DesignData,
  imageSettings: ImageAssociationSettings
) => {
  // //console.log('🔥 processSharedImagesByColor called with:', Object.keys(mockupImages).length, 'images');
  
  const imagesByColor: Record<string, { key: string; data: string; allKeys: string[] }> = {};
  
  // STEP 1: Group images by color and deduplicate
  for (const [variantKey, imageData] of Object.entries(mockupImages)) {
    if (!imageData || !imageData.startsWith('data:')) continue;
    
    const extractedColor = extractColorFromVariantKey(variantKey, designData);
    ////console.log('🔥 Processing variant key:', variantKey, 'extracted color:', extractedColor);
    
    if (!imagesByColor[extractedColor]) {
      imagesByColor[extractedColor] = {
        key: variantKey,
        data: imageData,
        allKeys: [variantKey]
      };
    } else {
      // Just add to allKeys for metadata, but don't create duplicate image
      imagesByColor[extractedColor].allKeys.push(variantKey);
      ////console.log('🔥 Skipping duplicate for color:', extractedColor, 'total keys now:', imagesByColor[extractedColor].allKeys.length);
    }
  }
  
  ////console.log('🔥 Final grouped colors:', Object.keys(imagesByColor));
  
  const processedImages: MediaItem[] = [];
  let currentRank = 1000; // Start after design images
  
  // STEP 2: Create exactly ONE shared image per color
  for (const [colorName, group] of Object.entries(imagesByColor)) {
    try {
      ////console.log('🔥 Creating shared image for color:', colorName, 'covering', group.allKeys.length, 'variants');
      
      const fileName = `mockup-${colorName.toLowerCase()}-shared.png`;
      
      const processedImage = await processBase64ToFile(
        group.data,
        fileName,
        colorName
      );
      
      if (!processedImage) {
        ////console.log('🔥 Failed to process image for color:', colorName);
        continue;
      }
      
      // Get all size values that this shared image covers
      const coversSizes = getSizesFromKeys(group.allKeys, designData);
      
      const variantInfo = {
        optionName: 'Color',
        optionValues: [colorName],
        isSharedAcrossSizes: true,
        coversSizes: coversSizes
      };
      
      const mediaItem: MediaItem = {
        file: processedImage.file,
        url: processedImage.url,
        rank: currentRank++,
        isNew: true,
        variantInfo: variantInfo,
        colorValue: colorName,
        metadata: {
          isSharedImage: true, // CRITICAL: Mark as shared
          originalVariantKey: group.key,
          sharingStrategy: 'color_specific_size_shared',
          imageHash: `shared_${colorName}`,
          extractedColorName: colorName,
          extractedSizeName: undefined, // No specific size
          payloadSettings: { ...imageSettings },
          allCoveredKeys: group.allKeys,
          
          // Add deduplication metadata
          isDeduplicated: true,
          originalVariantCount: group.allKeys.length,
          
          debugInfo: {
            strategy: 'shared_by_color',
            representativeKey: group.key,
            totalVariantsCovered: group.allKeys.length,
            coveredKeys: group.allKeys,
            deduplicationApplied: true
          }
        }
      };
      
      processedImages.push(mediaItem);
      ////console.log('🔥 Created media item for color:', colorName, 'with', group.allKeys.length, 'covered variants');
      
    } catch (error) {
      ////console.error('🔥 Error processing color:', colorName, error);
    }
  }
  
  ////console.log('🔥 Total processed images:', processedImages.length);
  
  if (processedImages.length > 0) {
    // 🔥 CRITICAL FIX: Use functional update with deduplication
    setMediaItems(prev => {
      // Filter out any existing shared images for the same colors to prevent duplicates
      const existingNonShared = prev.filter(item => !item.metadata?.isSharedImage);
      
      // Add new shared images
      const combined = [...existingNonShared, ...processedImages];
      
      ////console.log('🔥 Setting mediaItems with', combined.length, 'total items');
      ////console.log('🔥 Shared images in result:', combined.filter(item => item.metadata?.isSharedImage).length);
      
      return combined;
    });
    
    setTimeout(() => setActiveImageTab('upload'), 100);
    
    processedImages.forEach((item, index) => {
      // //console.log(`🔥 Final shared image ${index + 1}:`, {
      //   colorName: item.colorValue,
      //   fileName: item.file?.name,
      //   coveredVariants: item.metadata?.allCoveredKeys?.length || 0
      // });
    });
  } else {
    setError('Failed to create any shared images. Check //console for details.');
  }
};



  const extractColorFromVariantKey = (variantKey: string, designData: DesignData): string => {
    
    const colorMatcher = createColorMatcher(designData);
    return colorMatcher.matchColor(variantKey);
  };

  const getSizesFromKeys = (keys: string[], designData: DesignData): string[] => {
    const sizes = new Set<string>();
    
    const availableSizes = designData.options?.find(opt => 
      opt.title.toLowerCase().includes('size')
    )?.optionValues || [];
    
    keys.forEach(key => {
      const parts = key.split(/[-_\s]+/).filter(p => p.length > 0);
      parts.forEach(part => {
        const matchingSize = availableSizes.find(size => 
          size.toLowerCase() === part.toLowerCase()
        );
        if (matchingSize) {
          sizes.add(matchingSize);
        }
      });
    });
    
    return Array.from(sizes);
  };

  const processIndividualImages = async (
    mockupImages: Record<string, string>,
    designData: DesignData,
    imageSettings: ImageAssociationSettings
  ) => {
    
    const processedImages: MediaItem[] = [];
    let currentRank = 0;
    
    for (const [variantKey, imageDataUrl] of Object.entries(mockupImages)) {
      if (!imageDataUrl || !imageDataUrl.startsWith('data:')) continue;
      
      try {
        const parsedInfo = parseVariantKeyEnhanced(variantKey, designData);
        
        const fileName = parsedInfo.sizeName 
          ? `mockup-${parsedInfo.colorName.toLowerCase()}-${parsedInfo.sizeName.toLowerCase()}.png`
          : `mockup-${parsedInfo.colorName.toLowerCase()}.png`;
        
        const processedImage = await processBase64ToFile(
          imageDataUrl,
          fileName,
          parsedInfo.colorName
        );
        
        if (!processedImage) continue;
        
        const variantInfo = createVariantInfoStructure(
          { colorName: parsedInfo.colorName, sizeName: parsedInfo.sizeName },
          imageSettings
        );
        
        const mediaItem: MediaItem = {
          file: processedImage.file,
          url: processedImage.url,
          rank: currentRank++,
          isNew: true,
          variantInfo: variantInfo,
          colorValue: parsedInfo.colorName,
          metadata: {
            isSharedImage: false,
            originalVariantKey: variantKey,
            sharingStrategy: determineSharingStrategy(imageSettings),
            imageHash: variantKey,
            extractedColorName: parsedInfo.colorName,
            extractedSizeName: parsedInfo.sizeName,
            payloadSettings: { ...imageSettings }
          }
        };
        
        processedImages.push(mediaItem);
        
      } catch (error) {
      }
    }
    
    
    // setMediaItems(processedImages);
    //setMediaItems(prev => [...prev, ...processedImages])
    setMediaItems(prev => {
      const combined = [...prev, ...validImages]
      return combined
    })

    setTimeout(() => setActiveImageTab('upload'), 100);
  };

  // ===== ENHANCED VARIANT KEY PARSING =====
  const parseVariantKeyEnhanced = (variantKey: string, designData: DesignData) => {
    
    const parts = variantKey.split(/[-_]+/).filter(part => part.length > 0);  
    let colorName = 'Unknown';
    let sizeName: string | undefined = undefined;
    
    const colorMatcher = createColorMatcher(designData);
    
    const sizeOption = designData.options?.find(opt => 
      opt.title.toLowerCase().includes('size')
    );
    
    for (const part of parts) {
      const partLower = part.toLowerCase();
      
      const matchedColor = colorMatcher.matchColor(part);
      if (matchedColor !== 'Unknown') {
        colorName = matchedColor;
      }
      
      if (sizeOption?.optionValues) {
        const matchingSize = sizeOption.optionValues.find(size => 
          size.toLowerCase() === partLower
        );
        if (matchingSize) {
          sizeName = matchingSize;
        }
      }
    }
    
    if (colorName === 'Unknown') {
      colorName = colorMatcher.matchColor(variantKey);
    }
    
    if (!sizeName && sizeOption?.optionValues) {
      for (const size of sizeOption.optionValues) {
        const sizeLower = size.toLowerCase();
        if (variantKey.toLowerCase().includes(`_${sizeLower}_`) || 
            variantKey.toLowerCase().includes(`_${sizeLower}`) ||
            variantKey.toLowerCase().endsWith(`_${sizeLower}`) ||
            variantKey.toLowerCase().includes(`-${sizeLower}-`) ||
            variantKey.toLowerCase().includes(`-${sizeLower}`) ||
            variantKey.toLowerCase().endsWith(`-${sizeLower}`)) {
          sizeName = size;
          break;
        }
      }
    }
    
    return { colorName, sizeName };
  };

  // ===== VARIANT GENERATION =====
  const handleGenerateVariants = useCallback(() => {
    const currentOptions = form.getValues('options');
    
    const validOptions = currentOptions.filter(opt => 
      opt.title && Array.isArray(opt.optionValues) && opt.optionValues.length > 0
    );
    
    if (validOptions.length > 0) {
      const parsedOptions = validOptions.map((opt) => ({
        optionId: opt.id || generateUUID(),
        optionName: opt.title,
        optionValues: opt.optionValues,
      }));
      
      const currentVariants = form.getValues('variants');
      
      const newVariants = generateVariantsFromOptions(parsedOptions);
      
      const variantsWithExistingData = newVariants.map(newVariant => {
        const existingVariant = currentVariants.find(existing => {
          if (!existing.optionValues || 
              !Array.isArray(existing.optionValues) || 
              existing.optionValues.length !== newVariant.optionValues.length) return false;
          
          const allValuesMatch = newVariant.optionValues.every(newOptVal => 
            existing.optionValues.some(existingOptVal => 
              existingOptVal.optionName === newOptVal.optionName && 
              existingOptVal.value === newOptVal.value
            )
          );
          
          return allValuesMatch;
        });
        
        if (existingVariant) {
          return {
            ...existingVariant,
            title: newVariant.title,
            optionValues: newVariant.optionValues.map(newOptVal => {
              const matchingExistingOptVal = existingVariant.optionValues.find(
                existingOptVal => existingOptVal.optionName === newOptVal.optionName && 
                                  existingOptVal.value === newOptVal.value
              );
              
              return {
                optionId: matchingExistingOptVal?.optionId || newOptVal.optionId,
                optionName: newOptVal.optionName,
                value: newOptVal.value
              };
            }),
          };
        }
        
        return newVariant;
      });
      
      replaceVariants(variantsWithExistingData);
    } else {
      replaceVariants([]);
    }
  }, [form, replaceVariants]);

  // ===== FILE HANDLING =====
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    variantInfo: VariantInfo | null = null
  ): void => {
    try {
      if (e.target.files && e.target.files.length > 0) {
        const newMedia = Array.from(e.target.files).map((file, index) => {
          const mediaItem: MediaItem = {
            file,
            url: URL.createObjectURL(file),
            rank: mediaItems.length + index,
            isNew: true
          };
          
          if (variantInfo) {
            if (variantInfo.variantId) {
              mediaItem.variantInfo = {
                variantId: variantInfo.variantId
              };
            } else if (variantInfo.optionName && variantInfo.optionValues?.[0]) {
              mediaItem.variantInfo = {
                optionName: variantInfo.optionName,
                optionValues: [variantInfo.optionValues[0]]
              };
              
              if (isColorOption(variantInfo.optionName)) {
                mediaItem.colorValue = variantInfo.optionValues[0];
                
              }
            }
          }
          
          return mediaItem;
        });
        
        setMediaItems((prev) => [...prev, ...newMedia]);
        
        if (e.target) {
          e.target.value = '';
        }
      }
    } catch (error) {
      if (e.target) {
        e.target.value = '';
      }
      
      alert("Error uploading files. Please try again.");
    }
  };

  // ===== HELPER FUNCTIONS FOR IMAGE MANAGEMENT =====
  const getImageAssociatedOptions = () => {
    const currentOptions = form.getValues('options');
    return currentOptions.filter(opt => 
      opt.title && 
      opt.optionValues && 
      opt.optionValues.length > 0 && 
      shouldOptionHaveImages(opt.title, payloadImageSettings)
    );
  };
  
  const [imageAssociatedOptions, setImageAssociatedOptions] = useState<Option[]>([]);
  
  useEffect(() => {
    const subscription = form.watch((formValues, { name, type }) => {
      if (name && (name.includes('options') || name.includes('imageAssociation'))) {
        const newImageAssociatedOptions = getImageAssociatedOptions();
        setImageAssociatedOptions(newImageAssociatedOptions);
        
      }
    });
    
    setImageAssociatedOptions(getImageAssociatedOptions());
    
    return () => subscription.unsubscribe();
  }, [form, payloadImageSettings]);

  useEffect(() => {
    const currentOptions = form.getValues('options');
    
    const validOptions = currentOptions.filter(opt => 
      opt.title && opt.title.trim() !== '' && 
      opt.optionValues && 
      Array.isArray(opt.optionValues) && 
      opt.optionValues.length > 0
    );
    
    if (currentOptions.length > validOptions.length + 1) {
      
      for (let i = currentOptions.length - 1; i > validOptions.length; i--) {
        removeOption(i);
      }
    }
    
    if (currentOptions.length > 3) {
      for (let i = currentOptions.length - 1; i >= 3; i--) {
        removeOption(i);
      }
    }
  }, [form.watch('options')]);

  // ===== ADDITIONAL HELPER FUNCTIONS =====
  const handleAddOptionValue = (optionIndex: number) => {
    const value = newOptionValues[optionIndex];
    if (!value || value.trim() === '') return;
    
    const currentOptions = form.getValues('options');
    const currentOption = currentOptions[optionIndex];
    
    const currentValues = Array.isArray(currentOption.optionValues) 
      ? currentOption.optionValues 
      : [];
    
    if (!currentValues.includes(value)) {
      const updatedValues = [...currentValues, value];
      
      updateOption(optionIndex, {
        ...currentOption,
        optionValues: updatedValues
      });
      
      const updatedNewValues = { ...newOptionValues };
      updatedNewValues[optionIndex] = '';
      setNewOptionValues(updatedNewValues);
      
      handleGenerateVariants();
    }
  };

  const handleNewOptionValueChange = (optionIndex: number, value: string) => {
    setNewOptionValues(prev => ({
      ...prev,
      [optionIndex]: value
    }));
  };

  const handleVariantFieldChange = (variantIndex: number, field: string, value: any) => {
    const currentVariants = form.getValues('variants');
    const currentVariant = currentVariants[variantIndex];
    
    const updatedVariant = JSON.parse(JSON.stringify(currentVariant));
    updatedVariant[field] = value;
    
    updateVariant(variantIndex, updatedVariant);
  };

  const handleBulkEdit = (field: string, value: any) => {
    if (!selectedVariants.length) return;
    
    const currentVariants = form.getValues('variants');
    
    selectedVariants.forEach(variantId => {
      const variantIndex = currentVariants.findIndex(v => v.id === variantId);
      if (variantIndex !== -1) {
        handleVariantFieldChange(variantIndex, field, value);
      }
    });
    
    if (field === 'price') setBulkPrice('');
    if (field === 'stock') setBulkStock('');
  };

  const handleSelectAllVariants = (checked: boolean) => {
    if (checked) {
      const allVariantIds = form.getValues('variants').map(v => v.id);
      setSelectedVariants(allVariantIds);
    } else {
      setSelectedVariants([]);
    }
  };

  const handleToggleVariantSelection = (variantId: string) => {
    setSelectedVariants(prev => {
      if (prev.includes(variantId)) {
        return prev.filter(id => id !== variantId);
      } else {
        return [...prev, variantId];
      }
    });
  };

  const handleDuplicateVariant = (variantIndex: number) => {
    const currentVariants = form.getValues('variants');
    const variantToDuplicate = currentVariants[variantIndex];
    
    const newVariant = {
      ...JSON.parse(JSON.stringify(variantToDuplicate)),
      id: generateUUID(),
      sku: generateUniqueSku(`${variantToDuplicate.title}-copy`),
      title: `${variantToDuplicate.title} (Copy)`
    };
    
    const updatedVariants = [...currentVariants];
    updatedVariants.splice(variantIndex + 1, 0, newVariant);
    
    replaceVariants(updatedVariants);
  };

  
  const getVariantAssociatedImages = (variant: Variant, mediaItems: MediaItem[]): {id: string, url: string}[] => {
    if (!variant.optionValues || !Array.isArray(variant.optionValues)) {
      return [];
    }
    
    const associatedImages: {id: string, url: string}[] = [];
    
    const directVariantImages = mediaItems.filter(item => 
      item.variantInfo?.variantId === variant.id
    );
    
    directVariantImages.forEach(item => {
      if (item.url && item.id) {
        const exists = associatedImages.some(img => img.id === item.id);
        if (!exists) {
          associatedImages.push({ id: item.id, url: item.url });
        }
      }
    });
    
    variant.optionValues.forEach(optVal => {
      const optionValueImages = mediaItems.filter(item => {
        return item.variantInfo?.optionName && 
          item.variantInfo.optionName.toLowerCase() === optVal.optionName.toLowerCase() && 
          item.variantInfo?.optionValues?.includes(optVal.value);
      });
        
      optionValueImages.forEach(item => {
        if (item.url && item.id) {
          const exists = associatedImages.some(img => img.id === item.id);
          if (!exists) {
            associatedImages.push({ id: item.id, url: item.url });
          }
        }
      });
    });
    
    return associatedImages;
  };

  const handleAddProductDetail = () => {
    appendProductDetail({ id: generateUUID(), text: '' });
  };

  const handleDropzoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAddImageUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!newImageUrl.trim()) return;
    
    try {
      new URL(newImageUrl);
      
      setMediaItems((prev) => [
        ...prev,
        {
          file: undefined,
          url: newImageUrl,
          rank: prev.length,
          isNew: true
        }
      ]);
      
      setNewImageUrl('');
      
    } catch (error) {
      setError('Please enter a valid URL');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate({ to: '/productCatalog' });
  };

  // ===== EFFECTS FOR MONITORING CHANGES =====
  // useEffect(() => {
  //   const subscription = form.watch((formValues, { name, type }) => {
  //     if (name && 
  //         name.startsWith('options.') && 
  //         name.includes('optionValues') && 
  //         type === 'change') {
        
        
  //       const currentOptions = form.getValues('options');
        
  //       if (currentOptions.length === 1) {
  //         const firstOption = currentOptions[0];
  //         const hasTitle = firstOption?.title && firstOption.title.trim() !== '';
  //         const hasValues = firstOption?.optionValues && 
  //                          Array.isArray(firstOption.optionValues) && 
  //                          firstOption.optionValues.length > 0;
          
  //         if (hasTitle && hasValues) {
  //           appendOption({ 
  //             id: generateUUID(),
  //             title: '', 
  //             optionValues: [],
  //             imageAssociation: false
  //           });
  //         }
  //       }
        
  //       setTimeout(() => {
  //         handleGenerateVariants();
  //       }, 300);
  //     }
  //   });
    
  //   return () => subscription.unsubscribe();
  // }, [appendOption, form, handleGenerateVariants]);

  // ✅ REPLACE WITH THIS SIMPLER VERSION
useEffect(() => {
  const subscription = form.watch((formValues, { name, type }) => {
    // Only handle option value changes, not other form changes
    if (name && 
        name.startsWith('options.') && 
        name.includes('optionValues') && 
        type === 'change' &&
        !isSubmittingForm) { // Don't trigger during form submission
      
      console.log('🎯 OPTIONS DEBUG: Option values changed:', name);
      
      // Debounce variant generation to prevent excessive calls
      clearTimeout(window.variantGenerationTimeout);
      window.variantGenerationTimeout = setTimeout(() => {
        try {
          console.log('🎯 OPTIONS DEBUG: Regenerating variants');
          handleGenerateVariants();
        } catch (error) {
          console.error('🎯 OPTIONS ERROR: Variant generation failed:', error);
        }
      }, 500);
    }
  });
  
  return () => {
    subscription.unsubscribe();
    if (window.variantGenerationTimeout) {
      clearTimeout(window.variantGenerationTimeout);
    }
  };
}, [form, handleGenerateVariants, isSubmittingForm]);


  useEffect(() => {
    const initialOptionValues: Record<number, string> = {};
    optionFields.forEach((_, index) => {
      initialOptionValues[index] = '';
    });
    setNewOptionValues(initialOptionValues);
  }, [optionFields.length]);

  useEffect(() => {
    return () => {
      mediaItems.forEach((item) => {
        if (item.file) URL.revokeObjectURL(item.url);
      });
    };
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      setCategoryError(null);
      try {
        const response = await fetchCategories();
        
        if (!response) {
          throw new Error('Failed to fetch categories');
        }
        
        const jsonData = await response.json();
        
        if (jsonData && jsonData.product_categories) {
          setProductCategories(jsonData.product_categories);
        } else {
          setCategoryError('Received invalid category data from server');
        }
      } catch (error) {
        setCategoryError('Failed to load categories. Please try again.');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, []);


// Add this new function to process designImages array format
// Replace your processDesignImagesArray function with this enhanced version
// Replace your processDesignImagesArray with this version that has detailed logging

// Update your useEffect to process both formats
// Replace your existing useEffect with this corrected version
useEffect(() => {
  // GUARD: Prevent multiple processing
  if (hasProcessedInitialData) {
    console.log('🚫 Initial data already processed, skipping...');
    return;
  }
  
  const processLocationState = async () => {
    if (location.state) {
      console.log('🎯 CREATE DEBUG: Starting location state processing');
      setHasProcessedInitialData(true); // Set flag immediately to prevent re-processing
      
      const locationState = location.state as LocationState;
      
      try {
        // STEP 1: Extract pre-generated images first
        const hasPreGeneratedImages = extractAndStorePreGeneratedImages(locationState);
        
        // STEP 2: Process canvas images
        if (locationState.canvasImages && Array.isArray(locationState.canvasImages)) {
          console.log('🎯 CREATE DEBUG: Found', locationState.canvasImages.length, 'canvas images');
          setImportedCanvasImages(locationState.canvasImages);
        }
        
        // STEP 3: Process design images ONLY if they exist
        if (locationState.designImages && Array.isArray(locationState.designImages) && locationState.designImages.length > 0) {
          console.log('🎯 CREATE DEBUG: Processing', locationState.designImages.length, 'design images');
          await processDesignImagesArray(locationState.designImages);
        }
        
        // STEP 4: Set design data without triggering form population yet
        if (locationState.designData) {
          console.log('🎯 CREATE DEBUG: Setting design data');
          setDesignData(locationState.designData);
          setEnhancedProductData(locationState.enhancedProductData);
          
          const imageSettings = {
            color_Images: locationState.enhancedProductData?.color_Images || false,
            size_Images: locationState.enhancedProductData?.size_Images || false,
            material_Images: locationState.enhancedProductData?.material_Images || false,
            style_Images: locationState.enhancedProductData?.style_Images || false
          };
          
          setPayloadImageSettings(imageSettings);
          
          // STEP 5: Populate form with a longer delay to ensure all processing is complete
          setTimeout(() => {
            console.log('🎯 CREATE DEBUG: Starting form population');
            try {
              if (locationState.enhancedProductData && Object.keys(locationState.enhancedProductData).length > 10) {
                console.log('🎯 CREATE DEBUG: Using PayloadCMS data');
                const payloadProduct = locationState.enhancedProductData as PayloadCMSProduct;
                populateFormWithPayloadCMSData(payloadProduct);
              } else {
                console.log('🎯 CREATE DEBUG: Using design data');
                populateFormWithDesignData(locationState.designData, locationState.enhancedProductData, imageSettings);
              }
              
              // Process mockup images AFTER form is populated
              if (hasPreGeneratedImages || Object.keys(locationState.mockupImages || {}).length > 0) {
                console.log('🎯 CREATE DEBUG: Processing mockup images');
                handleMockupImagesEnhanced(locationState, imageSettings);
              }
              
              setShowImportNotification(true);
              console.log('🎯 CREATE DEBUG: Form population completed');
              
            } catch (populationError) {
              console.error('🎯 CREATE ERROR: Form population failed:', populationError);
              setError('Failed to populate form with imported data');
            }
          }, 2000); // Increased delay to prevent race conditions
        }
        
      } catch (error) {
        console.error('🎯 CREATE ERROR: Location state processing failed:', error);
        setError('Failed to process imported design data');
        setHasProcessedInitialData(false); // Reset flag on error
      }
    }
  };
  
  // Execute processing
  processLocationState();
}, [location.state]);

// Add this debug function before your onSubmit function
const debugMediaItems = () => {
  
  mediaItems.forEach((item, index) => {

    // Check if this would match the design image filter
    const isDesign = item.metadata?.isRawDesignImage === true || 
                   item.variantInfo?.isRawDesignImage === true ||
                   item.metadata?.debugInfo?.source === 'canvas_design_element';
    
  });
  
  // Test the actual filter
  const designImages = mediaItems.filter(item => {
    const isDesign = item.metadata?.isRawDesignImage === true || 
                   item.variantInfo?.isRawDesignImage === true ||
                   item.metadata?.debugInfo?.source === 'canvas_design_element';
    
    if (isDesign) {
     }
    
    return isDesign;
  });
  
  
  return designImages.length;
};

// ===== COMPLETE ENHANCED FORM SUBMISSION WITH DESIGN IMAGE UPLOAD =====
// Updated onSubmit function sections - replace the artwork creation and product creation parts

const processDesignImagesArray = async (designImagesArray) => {
  //console.log('🎨 processDesignImagesArray called with:', designImagesArray?.length || 0, 'images');
  
  // GUARD: Prevent multiple simultaneous processing
  if (isProcessingDesignImages) {
    //console.log('🚫 Already processing design images, skipping...');
    return false;
  }
  
  if (!Array.isArray(designImagesArray) || designImagesArray.length === 0) {
    return false;
  }
  
  setIsProcessingDesignImages(true);
  
  try {
    const processedImages = [];
    let designImageRank = 0;
    
    for (let i = 0; i < designImagesArray.length; i++) {
      const designImage = designImagesArray[i];
      
      if (!designImage.base64Data) {
        continue;
      }
      
      try {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const cleanName = (designImage.name || 'design-image')
          .replace(/[^a-z0-9.-]/gi, '_')
          .toLowerCase();
        const fileName = `design-${cleanName}-${designImage.area}-${timestamp}-${randomId}.png`;
        
        const processedImage = await processBase64ToFile(
          designImage.base64Data,
          fileName,
          undefined
        );
        
        if (!processedImage) {
          continue;
        }
        
        const designMediaItem = {
          file: processedImage.file,
          url: processedImage.url,
          rank: designImageRank++,
          isNew: true,
          
          variantInfo: {
            isRawDesignImage: true,
            designArea: designImage.area,
            originalFileName: designImage.name
          },
          
          metadata: {
            isRawDesignImage: true,
            designArea: designImage.area,
            originalFileName: designImage.name,
            originalImageWidth: designImage.originalWidth,
            originalImageHeight: designImage.originalHeight,
            
            canvasPosition: {
              x: designImage.position?.x || 0,
              y: designImage.position?.y || 0,
              width: designImage.dimensions?.width || 0,
              height: designImage.dimensions?.height || 0,
              rotation: designImage.rotation || 0
            },
            
            processingId: `${designImage.area}-${designImage.name}-${i}`,
            
            uploadValidation: {
              hasFile: true,
              fileSize: processedImage.file.size,
              fileType: processedImage.file.type,
              fileName: processedImage.file.name,
              validForUpload: true
            },
            
            debugInfo: {
              source: 'canvas_design_element',
              area: designImage.area,
              elementId: designImage.id,
              processed: true,
              timestamp: new Date().toISOString(),
              processedAt: 'processDesignImagesArray'
            }
          }
        };
        
        processedImages.push(designMediaItem);
    
      } catch (imageError) {
        //console.error('Error processing design image:', imageError);
      }
    }
    
    if (processedImages.length === 0) {
      return false;
    }
    
    // SINGLE state update with REPLACEMENT, not accumulation
    setMediaItems(prevMediaItems => {
      // Remove any existing design images first
      const nonDesignImages = prevMediaItems.filter(item => 
        !(item.metadata?.isRawDesignImage === true ||
          item.variantInfo?.isRawDesignImage === true ||
          item.metadata?.debugInfo?.source === 'canvas_design_element')
      );
      
      // Apply deduplication to new images only
      const deduplicatedNew = removeDuplicateDesignImages(processedImages);
      
      // Combine: deduplicated new + existing non-design
      return [...deduplicatedNew, ...nonDesignImages];
    });
    
    return true;
    
  } catch (criticalError) {
    //console.error('Critical error in processDesignImagesArray:', criticalError);
    return false;
  } finally {
    setIsProcessingDesignImages(false);
  }
};

const processCanvasImagesForArtwork = async (canvasImages: Array<{
  area_id: string;
  image_data: string | Promise<string>; // Updated type to handle Promise
  metadata: any;
  description: string;
}>): Promise<Array<{
  uploadResult: any;
  originalMetadata: any;
  areaId: string;
  description: string;
}>> => {
  console.log('🖼️ Processing', canvasImages.length, 'canvas images for artwork');
  
  const processedCanvasImages = [];
  
  for (let i = 0; i < canvasImages.length; i++) {
    const canvasImage = canvasImages[i];
    
    try {
      // 🔥 FIX: Await the Promise if image_data is a Promise
      let resolvedImageData: string;
      
      if (canvasImage.image_data instanceof Promise) {
        console.log(`⏳ Awaiting Promise for canvas image area: ${canvasImage.area_id}`);
        resolvedImageData = await canvasImage.image_data;
      } else {
        resolvedImageData = canvasImage.image_data;
      }
      
      console.log(`✅ Resolved image data for area: ${canvasImage.area_id}, length: ${resolvedImageData.length}`);
      
      // Additional validation
      if (!resolvedImageData || !resolvedImageData.startsWith('data:image/')) {
        console.error(`❌ Invalid image data for area: ${canvasImage.area_id}`);
        continue;
      }
      
      // Convert base64 to file
      const processedImage = await processBase64ToFile(
        resolvedImageData,
        `canvas-${canvasImage.area_id}-complete-layout.png`,
        undefined
      );
      
      if (!processedImage?.file) {
        console.error(`❌ Failed to process canvas image for area: ${canvasImage.area_id}`);
        continue;
      }
      
      // Upload canvas image file
      console.log(`⬆️ Uploading canvas image for area: ${canvasImage.area_id}`);
      const uploadResult = await uploadArtworkFile(processedImage.file);
      
      processedCanvasImages.push({
        uploadResult,
        originalMetadata: canvasImage.metadata,
        areaId: canvasImage.area_id,
        description: canvasImage.description
      });
      
      console.log(`✅ Canvas image uploaded for area: ${canvasImage.area_id}`);
      
    } catch (error) {
      console.error(`❌ Error processing canvas image for area ${canvasImage.area_id}:`, error);
    }
  }
  
  return processedCanvasImages;
};


const onSubmit = async (values: ProductFormValues) => {
  
  // GUARD: Prevent multiple form submissions
  if (isSubmittingForm) {
    //console.log('🚫 Form already submitting, ignoring duplicate submission');
    return;
  }
  
  if (!values.title.trim()) {
    setError('Product title is required');
    return;
  }
  
 setIsSubmitting(true);
  setIsSubmittingForm(true);
  setError(null);

  
  try {
    
    const designArtworkPayloads: any[] = [];
    const productImages: Array<{id: string, url: string, alt?: string}> = [];
    let mainArtworkId: string | null = null;

    // Enhanced design image detection
    // Enhanced design image detection with deduplication

    // ENHANCED design image detection with STRICT deduplication
    // const allDesignImages = mediaItems.filter(item => {
    //   const isDesign = item.metadata?.isRawDesignImage === true || 
    //                  item.variantInfo?.isRawDesignImage === true ||
    //                  item.metadata?.debugInfo?.source === 'canvas_design_element';
    //   return isDesign;
    // });

    // //console.log('🎨 Found', allDesignImages.length, 'design images before deduplication');

    // // Apply STRICT deduplication with improved logic
    // const designImages = removeDuplicateDesignImages(allDesignImages);
    //  const mockupImages = mediaItems.filter(item => !allDesignImages.includes(item));

    // Separate images by type using the same filtering logic consistently
    const { designImages: allDesignImages, mockupImages } = (() => {
      const designs = [];
      const mockups = [];
      
      for (const item of mediaItems) {
        const isDesign = item.metadata?.isRawDesignImage === true || 
                      item.variantInfo?.isRawDesignImage === true ||
                      item.metadata?.debugInfo?.source === 'canvas_design_element';
        
        if (isDesign) {
          designs.push(item);
        } else {
          mockups.push(item);
        }
      }
      
      return { designImages: designs, mockupImages: mockups };
    })();

    //console.log('🎨 Found', allDesignImages.length, 'design images before deduplication');
    //console.log('📸 Found', mockupImages.length, 'mockup images for upload');

    // Apply deduplication to design images only
    const designImages = removeDuplicateDesignImages(allDesignImages);
    
    //console.log('🎯 After deduplication:', designImages.length, 'unique design images');

    // Additional validation: ensure we have actual files
    const validDesignImages = designImages.filter(img => {
      const isValid = img.file && img.file.size > 0;
      if (!isValid) {
        //console.log('❌ Invalid design image found:', img);
      }
      return isValid;
    });

    //console.log('✅ Valid design images for upload:', validDesignImages.length);

    // STEP 1: Process design images with SINGLE ARTWORK PER AREA
   // STEP 1: Process design images AND canvas images with COMBINED ARTWORK
if (validDesignImages.length > 0 || importedCanvasImages.length > 0) {
  console.log('🚀 Starting artwork creation with:');
  console.log('- Design images:', validDesignImages.length);
  console.log('- Canvas images:', importedCanvasImages.length);
  
  try {
    const allUploadedFiles = [];
    let totalImageCount = 0;
    
    // PROCESS DESIGN IMAGES (existing code - keep as is)
    if (validDesignImages.length > 0) {
      const imagesByArea = validDesignImages.reduce((groups, designImage, index) => {
        const area = designImage.metadata?.designArea || 'front';
        if (!groups[area]) {
          groups[area] = [];
        }
        groups[area].push({ designImage, index });
        return groups;
      }, {});
      
      for (const [areaName, areaImages] of Object.entries(imagesByArea)) {
        for (const { designImage, index } of areaImages) {
          if (!designImage.file) continue;
          
          const uploadResult = await uploadArtworkFile(designImage.file);
          allUploadedFiles.push({
            ...uploadResult,
            originalMetadata: designImage.metadata,
            designArea: areaName,
            areaIndex: index,
            fileType: 'design_element' // 🔥 ADD TYPE
          });
          
          totalImageCount++;
        }
      }
    }
    
    // 🔥 NEW: PROCESS CANVAS IMAGES
    if (importedCanvasImages.length > 0) {
      const processedCanvasImages = await processCanvasImagesForArtwork(importedCanvasImages);
      
      processedCanvasImages.forEach((canvasImage, index) => {
        allUploadedFiles.push({
          ...canvasImage.uploadResult,
          originalMetadata: canvasImage.originalMetadata,
          designArea: canvasImage.areaId,
          areaIndex: index,
          fileType: 'canvas_layout', // 🔥 ADD TYPE
          manufacturingDescription: canvasImage.description
        });
        
        totalImageCount++;
      });
      
      console.log(`✅ Added ${processedCanvasImages.length} canvas images to artwork`);
    }
    
    if (allUploadedFiles.length === 0) {
      console.log(`⚠️ No files uploaded for artwork creation`);
    } else {
      // Create SINGLE artwork payload with ALL files (design + canvas)
      const combinedArtworkPayload = {
        name: `${form.getValues('title')} - Complete Design & Layout`,
        description: `Complete design for ${form.getValues('title')} containing ${totalImageCount} elements including design elements and manufacturing layout references`,
        medias: allUploadedFiles.map((uploadedFile, globalIndex) => ({
          image_url: uploadedFile.url,
          filename: uploadedFile.filename,
          mime_type: uploadedFile.mime_type,
          file_id: uploadedFile.id,
          file_type: "image",
          file_description: uploadedFile.fileType === 'canvas_layout' 
            ? `${uploadedFile.designArea} complete canvas layout for manufacturing`
            : `${uploadedFile.designArea} design element ${uploadedFile.areaIndex + 1}`,
          design_area: uploadedFile.designArea.toLowerCase(),
          file_category: uploadedFile.fileType, // 🔥 ADD CATEGORY
          metadata: {
            original_filename: uploadedFile.originalMetadata?.originalFileName,
            canvas_position: uploadedFile.originalMetadata?.canvasPosition || {},
            source: uploadedFile.fileType === 'canvas_layout' ? 'canvas_complete_layout' : 'canvas_design_element',
            element_index: globalIndex,
            area_name: uploadedFile.designArea,
            area_element_index: uploadedFile.areaIndex,
            total_elements: totalImageCount,
            manufacturing_description: uploadedFile.manufacturingDescription || undefined,
            // 🔥 ADD: Canvas-specific metadata
            ...(uploadedFile.fileType === 'canvas_layout' && uploadedFile.originalMetadata ? {
              canvas_dimensions: uploadedFile.originalMetadata.canvas_dimensions,
              printable_area: uploadedFile.originalMetadata.printable_area,
              design_elements_count: uploadedFile.originalMetadata.design_elements?.length || 0,
              canvas_settings: uploadedFile.originalMetadata.canvas_settings
            } : {})
          }
        }))
      };
      
      console.log(`🎨 Creating combined artwork with ${allUploadedFiles.length} files (design + canvas)`);
      
      // Create artwork containing everything
      const combinedArtworkResult = await createArtworkPayload(combinedArtworkPayload);
      console.log(`✅ Combined artwork created:`, combinedArtworkResult);

      // Extract artwork ID
      if (combinedArtworkResult?.vendor_artwork?.id) {
        mainArtworkId = combinedArtworkResult.vendor_artwork.id;
        console.log(`🎯 Combined artwork ID: ${mainArtworkId}`);
      }
      
      // Store artwork data with enhanced info
      designArtworkPayloads.push({
        artwork_data: combinedArtworkResult,
        design_areas: [...new Set(allUploadedFiles.map(f => f.designArea))],
        image_count: totalImageCount,
        design_elements_count: validDesignImages.length,
        canvas_images_count: importedCanvasImages.length,
        is_combined_artwork: true,
        artwork_id: mainArtworkId,
        contains_canvas_layouts: importedCanvasImages.length > 0
      });
      
      // Add product image (use first uploaded file)
      if (combinedArtworkResult.medias?.length > 0) {
        const primaryMedia = combinedArtworkResult.medias[0];
        productImages.push({
          id: primaryMedia.file_id,
          url: primaryMedia.image_url,
          alt: `Design: ${form.getValues('title')}`
        });
      }
    }
    
  } catch (artworkError) {
    console.error(`❌ Error creating combined artwork:`, artworkError);
    throw new Error(`Failed to create combined artwork: ${artworkError.message}`);
  }
}

// Continue with existing mockup image processing...
    // STEP 2: Upload mockup images (unchanged)
    if (mockupImages.length > 0) {
      
      for (const [index, mockupImage] of mockupImages.entries()) {
        try {
          
          if (!mockupImage.file) {
            throw new Error(`Mockup image ${index + 1} missing file data`);
          }
          
          const formData = new FormData();
          formData.append('files', mockupImage.file);
          
          const uploadResult = await uploadProductImage({
            productId: '',
            formData: formData,
            multiple: false
          });
          
          if (!uploadResult || !('id' in uploadResult) || !('url' in uploadResult)) {
            throw new Error(`Invalid upload response for mockup image: ${mockupImage.file.name}`);
          }
          
          productImages.push({
            id: uploadResult.id,
            url: uploadResult.url,
            alt: `Mockup: ${mockupImage.colorValue || 'Product'}`
          });
          
          mockupImage.id = uploadResult.id;
          mockupImage.url = uploadResult.url;
          
          
        } catch (uploadError: any) {
          throw new Error(`Failed to upload mockup image: ${uploadError.message}`);
        }
      }
      
   }
    
    // ✅ STEP 3: Continue with product creation (rest of your existing code)
    const timestamp = Date.now();
    const handle = values.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50)
      + `-${timestamp}`;

    // Get form values
    const formValues = form.getValues();
    
    // Extract PayloadCMS image association settings for dynamic processing
    const imageAssociationSettings = {
      color_Images: enhancedProductData?.color_Images || false,
      size_Images: enhancedProductData?.size_Images || false,
      material_Images: enhancedProductData?.material_Images || false,
      style_Images: enhancedProductData?.style_Images || false
    };

    // Declare validOptions in the outer scope
    let validOptions: any[] = [];
    let options: any[] = [];
    let variants: any[] = [];
    
    // ✅ STEP 4: Process options and variants (unchanged existing code)
    if (hasVariants && formValues.options.length > 0) {
      
      validOptions = formValues.options.filter(opt => 
        opt.title && opt.optionValues && opt.optionValues.length > 0
      );
      
      if (validOptions.length === 0) {
        throw new Error("Please add at least one option with values");
      }
      
      // Format options for API
      options = validOptions.map(opt => ({
        title: opt.title,
        values: opt.optionValues
      }));
      
      const formVariants = formValues.variants;
      
      if (formVariants.length === 0) {
        throw new Error("No variants found. Please generate variants from your options.");
      }
      
      // Process variants with complete metadata
      variants = formVariants.map((variant, index) => {
        const price = typeof variant.price === 'string' 
          ? parseFloat(variant.price) 
          : (variant.price || 0);

        // Format variant options
        const variantOptions: Record<string, string> = {};
        if (variant.optionValues && variant.optionValues.length > 0) {
          variant.optionValues.forEach(optVal => {
            variantOptions[optVal.optionName] = optVal.value;
          });
        }

        // CREATE VARIANT METADATA WITH IMAGE ASSOCIATIONS
        const variantMetadata: Record<string, any> = {};

        // Get ALL images associated with this variant
        const directVariantImages = mediaItems.filter(item => 
          item.variantInfo?.variantId === variant.id && item.id
        );

        const optionValueImages = mediaItems.filter(item => {
          if (!item.variantInfo?.optionName || !item.variantInfo?.optionValues || !variant.optionValues) {
            return false;
          }
          
          return variant.optionValues.some(optVal => 
            optVal.optionName.toLowerCase() === item.variantInfo!.optionName!.toLowerCase() && 
            item.variantInfo!.optionValues!.includes(optVal.value)
          );
        });

        // Combine all variant-associated images, avoiding duplicates
        const allVariantImages = [...directVariantImages];
        optionValueImages.forEach(img => {
          if (!allVariantImages.some(existing => existing.id === img.id)) {
            allVariantImages.push(img);
          }
        });

        // METADATA KEY 1: variant_images (array of URLs)
        const variantImageUrls = allVariantImages
          .map(item => {
            if (item.url && item.url.startsWith('blob:') && item.id) {
              return getStaticUrl(item.id);
            }
            return item.url;
          })
          .filter(url => url);

        if (variantImageUrls.length > 0) {
          variantMetadata.variant_images = JSON.stringify(variantImageUrls);
        }

        // METADATA KEY 2: variant_image_ids (array of image IDs)
        const variantImageIds = allVariantImages
          .map(item => item.id)
          .filter(id => id && typeof id === 'string');

        if (variantImageIds.length > 0) {
          variantMetadata.variant_image_ids = JSON.stringify(variantImageIds);
        }

        // METADATA KEY 3: color_images and option_images - DYNAMIC based on PayloadCMS
        const colorImages: any[] = [];
        const allOptionImages: any[] = [];

        if (variant.optionValues) {
          variant.optionValues.forEach(optVal => {
            // Check if this option type should have images based on PayloadCMS
            const shouldHaveImages = shouldOptionHaveImages(optVal.optionName, payloadImageSettings);

            if (!shouldHaveImages) {
               return;
            }
            
            
            // Get images associated with this option value
            const optionSpecificImages = mediaItems.filter(item => 
              item.variantInfo?.optionName && 
              item.variantInfo.optionName.toLowerCase() === optVal.optionName.toLowerCase() && 
              item.variantInfo?.optionValues?.includes(optVal.value) &&
              item.url
            );
            
            optionSpecificImages.forEach(item => {
              let url = item.url;
              const STATIC_BASE_URL = import.meta.env.VITE_STATIC_BASE_URL || 'https://yourdomain.com/static';
                if (url.startsWith('blob:') && item.id) {
                  url = `${STATIC_BASE_URL}/${item.id}`;
                }
              
              // Add to general option images
              allOptionImages.push({
                option_name: optVal.optionName,
                option_value: optVal.value,
                url: url,
                imageId: item.id || ''
              });
              
              // If this is a color option AND color_Images is enabled, add to color_images
              if (isColorOption(optVal.optionName) && imageAssociationSettings.color_Images) {
                colorImages.push({
                  color: optVal.value,
                  url: url,
                  imageId: item.id || ''
                });
              }
            });
          });
        }

        // Add color_images metadata if we have color images
        if (colorImages.length > 0) {
          variantMetadata.color_images = JSON.stringify(colorImages);
           }

        // Add option_images metadata for all enabled option types
        if (allOptionImages.length > 0) {
          variantMetadata.option_images = JSON.stringify(allOptionImages);
          }

        // Return formatted variant with complete metadata
        return {
          title: variant.title || `Variant ${index + 1}`,
          sku: variant.sku || `sku-${timestamp}-${index}`,
          manage_inventory: Boolean(variant.manageInventory),
          allow_backorder: Boolean(variant.allowBackorder),
          options: variantOptions,
          prices: [{
            amount: price,
            currency_code: 'inr'
          }],
          metadata: variantMetadata
        };
      });
      
    } else {
      
      // For non-variant products, create default option
      validOptions = [{ title: "Size", optionValues: ["Default"] }];
      options = [{ title: "Size", values: ["Default"] }];
      
      variants = [{
        title: "Default",
        sku: `sku-${timestamp}`,
        manage_inventory: true,
        allow_backorder: false,
        options: { "Size": "Default" },
        prices: [{ amount: formValues.defaultVariantPrice || 25.00, currency_code: 'inr' }],
        metadata: {}
      }];
    }
    
    // ✅ STEP 5: Prepare main product metadata
    const productMetadata: Record<string, any> = {};
    
    // 🔥 ADD DESIGN ARTWORK DATA TO PRODUCT METADATA
    if (designArtworkPayloads.length > 0) {
      productMetadata.design_artwork = JSON.stringify(designArtworkPayloads);
       }
    
    // Add fulfillment information
    if (formValues.handlingTime?.trim()) {
      const fulfillmentData = {
        type: "Junooni-fulfilment",
        handling_time: formValues.handlingTime.trim(),
        shipping_time: formValues.shippingDays?.trim() || '7-10'
      };
      productMetadata.fulfillment_type = JSON.stringify(fulfillmentData);
    }

    // 🔥 ADD THIS CANVAS IMAGE METADATA CODE HERE
    if (importedCanvasImages.length > 0) {
      productMetadata.canvas_layouts = JSON.stringify({
        total_canvas_images: importedCanvasImages.length,
        areas_covered: importedCanvasImages.map(img => img.area_id),
        manufacturing_ready: true,
        canvas_metadata: importedCanvasImages.map(img => ({
          area: img.area_id,
          elements_count: img.metadata?.design_elements?.length || 0,
          canvas_dimensions: img.metadata?.canvas_dimensions
        }))
      });
    }
    
    // Add product details if present
    if (formValues.productDetails && Array.isArray(formValues.productDetails)) {
      const validDetails = formValues.productDetails
        .filter(detail => detail && detail.text && detail.text.trim() !== '')
        .map(detail => detail.text.trim());
      
      if (validDetails.length > 0) {
        productMetadata.product_details = JSON.stringify(validDetails);
      }
    }
    
    // Add story behind design if present
    if (formValues.storyBehindDesign && typeof formValues.storyBehindDesign === 'string') {
      productMetadata.description_story = formValues.storyBehindDesign.trim();
    }
    
    // Add color hex values if present
    const formColorOption = validOptions.find(opt => 
      opt.title?.toLowerCase() === 'color' || opt.title?.toLowerCase() === 'colour'
    );
    
    if (formColorOption && formColorOption.colorHexValues) {
      const colorHexArray = Object.entries(formColorOption.colorHexValues).map(
        ([colorName, hexValue]) => ({ name: colorName, hex: hexValue })
      );
      productMetadata.color_hex_values = JSON.stringify(colorHexArray);
    }
    
    // Add image association settings
    if (validOptions.length > 0) {
      const imageAssociationSettingsArray = validOptions
        .filter(opt => opt.title && Array.isArray(opt.optionValues) && opt.optionValues.length > 0)
        .map(opt => ({
          option_id: opt.id,
          option_name: opt.title,
          enabled: Boolean(opt.imageAssociation)
        }));

      if (imageAssociationSettingsArray.length > 0) {
        productMetadata.variant_specific_image_option = JSON.stringify(imageAssociationSettingsArray);
      }
    }

    // PayloadCMS integration metadata
    if (enhancedProductData) {
      productMetadata.payload_integration = JSON.stringify({
        source_product_id: enhancedProductData.id,
        base_cost: enhancedProductData.cost,
        image_settings: payloadImageSettings,
        imported_at: new Date().toISOString()
      });
    }

    // 🔥 NEW: CREATE ADDITIONAL_DATA OBJECT
    const additionalData: any = {};
    
    // Add vendor_artwork_id if we have a main artwork ID
    if (mainArtworkId) {
      additionalData.vendor_artwork_id = mainArtworkId;
      }
    
    // Add size_chart_id from PayloadCMS data
    if (enhancedProductData && enhancedProductData.sizeChartHtml) {
      additionalData.size_chart_id = enhancedProductData.sizeChartHtml;
      
    }
    
    // Add brand_id (leave empty for now as requested)
    additionalData.brand_id = "";
    
    // Log the final additional_data

    // ✅ STEP 6: Create final product object WITH ADDITIONAL_DATA
    const product = {
      title: formValues.title.trim(),
      handle: handle,
      description: formValues.description?.trim() || "",
      status: formValues.status || "draft",
      discountable: Boolean(formValues.discountable),
      
      // Add images if available
      ...(productImages.length > 0 ? { 
        images: productImages,
        thumbnail: productImages[0]?.url || "" 
      } : {}),
      
      // Add category if selected
      ...(formValues.category_id ? { categories: [{ id: formValues.category_id }] } : {}),
      
      // Add physical dimensions if provided
      ...(formValues.weight ? { weight: parseInt(formValues.weight) || 0 } : {}),
      ...(formValues.length ? { length: parseInt(formValues.length) || 0 } : {}),
      ...(formValues.width ? { width: parseInt(formValues.width) || 0 } : {}),
      ...(formValues.height ? { height: parseInt(formValues.height) || 0 } : {}),
      ...(formValues.material ? { material: formValues.material } : {}),
      ...(formValues.origin_country ? { origin_country: formValues.origin_country } : {}),
      
      options: options,
      variants: variants,
      metadata: productMetadata,
      
      // 🔥 NEW: Add additional_data to product
      additional_data: additionalData
    };
    
    // ✅ STEP 7: Validation
    if (!product.options || product.options.length === 0) {
      throw new Error("CRITICAL ERROR: Options array is empty");
    }
    
    if (!product.variants || product.variants.length === 0) {
      throw new Error("CRITICAL ERROR: Variants array is empty");
    }
    
    // ✅ STEP 8: Create product
    const result = await createProduct({ product });

    if (result && result.id) {
      setCreatedProductId(result.id);
      
      // Handle inventory creation (unchanged)
      setTimeout(async () => {
        try {
          const completeProduct = await fetchProduct({ id: result.id });
          
          if (completeProduct && completeProduct.variants) {
            const inventoryCreations = [];

             const locationIdToUse = dynamicLocationId || getLocationId(enhancedProductData);
              
            for (const variant of completeProduct.variants) {
              if (variant.inventory_items && Array.isArray(variant.inventory_items) && variant.inventory_items.length > 0) {
                const inventoryItemId = variant.inventory_items[0].inventory_item_id;
                
                if (inventoryItemId) {
                  const formVariant = variants.find(v => v.title === variant.title) || variants[0];
                  const stockQuantity = parseInt(String(formVariant?.stock || '0'));
                  
                  inventoryCreations.push({
                    inventory_item_id: inventoryItemId,
                    location_id: locationIdToUse,
                    stocked_quantity: stockQuantity,
                    incoming_quantity: 0
                  });
                }
              }
            }
            
            if (inventoryCreations.length > 0) {
              await batchUpdateInventoryLevels({ create: inventoryCreations });
               }
          }
        } catch (inventoryError) {
           }
      }, 2000);
      
      setShowSuccess(true);
    }
    
  } catch (error: any) {
    
    // Enhanced error handling
    if (error.message.includes('submitArtwork') || error.message.includes('artwork')) {
      setError(`Artwork processing failed: ${error.message}`);
    } else if (error.response?.data) {
      setError(`API Error: ${error.response.data.message || JSON.stringify(error.response.data)}`);
    } else if (error.message) {
      setError(error.message);
    } else {
      setError("Unknown error occurred");
    }
  } finally {
    setIsSubmitting(false);
  }
};

  // For debugging when create button doesn't work
  const handleManualSubmit = (e: React.FormEvent) => {
  if (e) e.preventDefault();
  
  // Prevent multiple rapid clicks
  if (isSubmittingForm) {
    //console.log('🚫 Already submitting, ignoring click');
    return;
  }
  
  form.handleSubmit(onSubmit)();
};

  // ===== ERROR HANDLING =====
  if (error && error.includes('Failed to load')) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Error</h2>
          <p className="mb-6">{error}</p>
          <Button 
            onClick={() => navigate({ to: '/productCatalog' })}
            className="bg-[#e65100] hover:bg-[#d84315] text-white"
          >
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  // Success message dialog
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
              <IconCheck size={32} className="text-green-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-800">Product Created Successfully!</h2>
            <p className="mb-6 text-gray-600">Your product has been created and is ready to go.</p>
            <div className="flex gap-4">
              <Button
                onClick={handleSuccessClose}
                variant="outline"
                className="flex-1"
              >
                Create Another
              </Button>
              <Button
                onClick={() => navigate({ to: `/products/${createdProductId}` })}
                className="flex-1 bg-[#e65100] hover:bg-[#d84315] text-white"
              >
                View Product
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="px-6 py-8 bg-gray-50">
      {/* Header Bar with Junooni branding */}
      <div className="flex flex-col justify-between gap-4 p-6 mb-6 bg-white border border-gray-100 rounded-lg shadow-sm md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#e65100]">
            {designData ? 'Create Custom Product' : 'Create New Product'}
          </h1>
          <p className="mt-1 text-gray-500">Fill in the details to create your product</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => navigate({ to: '/productCatalog' })}
            className="text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleManualSubmit} 
            disabled={isSubmitting}
            className="bg-[#e65100] hover:bg-[#d84315] text-white shadow-sm"
          >
            {isSubmitting ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {showImportNotification && (
        <DesignImportSuccessNotification
          designData={designData}
          enhancedProductData={enhancedProductData}
          onDismiss={() => setShowImportNotification(false)}
        />
      )}

      <Form {...form}>
        <form 
          onSubmit={(e) => {
            // Prevent default form submission - we'll handle it manually
            e.preventDefault();
            handleManualSubmit(e);
          }}
          noValidate
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Left Column */}
            <div className="space-y-6 md:col-span-2">
              {/* Title & Description Section */}
              <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="mb-6">
                  <h2 className="mb-4 text-xl font-semibold text-gray-800">Basic Information</h2>
                  <Separator className="mb-6" />
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="font-medium text-gray-700">Product Title*</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g. Handcrafted Leather Bag" 
                            className="w-full border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">
                          The URL slug will be auto-generated from the title
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="font-medium text-gray-700">Short Description</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Brief product description (displays in listings)" 
                            className="w-full border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-gray-700">Description</FormLabel>
                        <FormControl>
                          <Controller
                            name="description"
                            control={form.control}
                            render={({ field }) => (
                              <TipTapEditor
                                value={field.value || ''}
                                onChange={field.onChange}
                                placeholder="Write product details..."
                              />
                            )}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Product Details Section (Bullet Points) */}
              <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Product Details</h2>
                <Separator className="mb-6" />
                
                <p className="mb-4 text-sm text-gray-500">Add bullet points highlighting key features of your product</p>
                
                {productDetailFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2 mb-3">
                    <span className="mt-2.5 text-[#e65100]">•</span>
                    <FormField
                      control={form.control}
                      name={`productDetails.${index}.text`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder={`Product detail #${index + 1}`}
                              className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProductDetail(index)}
                      className="mt-1 text-gray-500 hover:text-red-500"
                    >
                      <IconX size={18} />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddProductDetail}
                  className="mt-2 text-[#e65100] border-[#e65100] hover:bg-orange-50"
                >
                  <IconCirclePlus className="mr-1.5" size={18} /> 
                  Add Product Detail
                </Button>
              </section>

              {/* Story Behind Design Section */}
              <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Story Behind the Design</h2>
                <Separator className="mb-6" />
                
                <p className="mb-4 text-sm text-gray-500">Share the inspiration and story behind your product</p>
                
                <FormField
                  control={form.control}
                  name="storyBehindDesign"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Controller
                          name="storyBehindDesign"
                          control={form.control}
                          render={({ field }) => (
                            <TipTapEditor
                              value={field.value || ''}
                              onChange={field.onChange}
                              placeholder="Share the story behind your design..."
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </section>
           
              {/* Media Section - IMPROVED VERSION with working variant-specific uploads */}
              <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">Product Images</h2>
              <Separator className="mb-6" />
              
              <p className="mb-4 text-sm text-gray-500">
                Add images for your product. The first image will be used as the thumbnail.
              </p>
              
              <div className="mb-6">
                <Tabs defaultValue="upload" onValueChange={setActiveImageTab} value={activeImageTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 p-1 mb-4 bg-gray-100 rounded-md">
                    <TabsTrigger 
                      value="upload" 
                      className="data-[state=active]:bg-white data-[state=active]:text-[#e65100] data-[state=active]:shadow-sm rounded-md"
                    >
                      <IconUpload size={16} className="mr-2" />
                      Upload Images
                    </TabsTrigger>
                    <TabsTrigger 
                      value="url" 
                      className="data-[state=active]:bg-white data-[state=active]:text-[#e65100] data-[state=active]:shadow-sm rounded-md"
                    >
                      <IconLink size={16} className="mr-2" />
                      Add from URL
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload">
                    {hasVariants && imageAssociatedOptions.length > 0 ? (
                      // ✅ FIXED: Pass all required props to StreamlinedImageManager
                      <StreamlinedImageManager
                        mediaItems={mediaItems}
                        setMediaItems={setMediaItems}
                        options={form.getValues('options')}
                        variants={form.getValues('variants')}
                        fileInputRef={fileInputRef}
                        handleFileChange={handleFileChange}
                        payloadImageSettings={payloadImageSettings}
                        getImagesForOptionValue={getImagesForOptionValue}
                        getImagesForColorSizeCombination={getImagesForColorSizeCombination}
                        isColorOption={isColorOption}
                        isSizeOption={(title: string) => isSizeOption(title.toLowerCase())}
                      />
                    ) : (
                      // Show standard upload interface when no variant-specific images needed
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          if (fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }}
                        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#e65100] hover:bg-orange-50 transition-all duration-200"
                      >
                        <div className="flex items-center justify-center w-16 h-16 mb-3 bg-orange-100 rounded-full">
                          <IconPhotoPlus size={28} className="text-[#e65100]" />
                        </div>
                        <p className="font-medium text-gray-700">Drag and drop images here</p>
                        <p className="mt-1 text-sm text-gray-500">
                          or click to browse your files
                        </p>
                        <p className="mt-4 text-xs text-gray-500">
                          Supports: JPG, PNG, GIF (Max 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="hidden"
                    />
                  </TabsContent>
                    
                    <TabsContent value="url">
                      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="mb-3 text-sm text-gray-600">
                          Add images from external URLs to your product gallery
                        </p>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="url"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddImageUrl(e);
                              }
                            }}
                          />
                          <Button 
                            onClick={(e) => handleAddImageUrl(e)} 
                            type="button"
                            className="bg-[#e65100] hover:bg-[#d84315] text-white"
                          >
                            Add Image
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                
                {/* Show general images only when not in variant-specific mode */}
                {(!hasVariants || imageAssociatedOptions.length === 0) && (
                  mediaItems.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {mediaItems.sort((a, b) => a.rank - b.rank).map((item, index) => (
                        <div
                          key={`${item.url}-${index}`}
                          className="relative flex flex-col overflow-hidden transition-all duration-200 bg-white border rounded-md group hover:shadow-md"
                        >
                          <div className="relative flex items-center justify-center h-48 overflow-hidden bg-gray-100">
                            <img
                              src={item.url}
                              alt={`Product image ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 bg-black bg-opacity-0 opacity-0 group-hover:bg-opacity-20 group-hover:opacity-100">
                              <div className="flex space-x-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (index === 0) return;
                                    setMediaItems((prev) => {
                                      const newMedia = [...prev];
                                      const temp = newMedia[index - 1];
                                      newMedia[index - 1] = { ...newMedia[index], rank: index - 1 };
                                      newMedia[index] = { ...temp, rank: index };
                                      return newMedia;
                                    });
                                  }}
                                  disabled={index === 0}
                                  className="p-1 text-white bg-gray-800 rounded-full disabled:opacity-50 hover:bg-gray-700"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (index === mediaItems.length - 1) return;
                                    setMediaItems((prev) => {
                                      const newMedia = [...prev];
                                      const temp = newMedia[index + 1];
                                      newMedia[index + 1] = { ...newMedia[index], rank: index + 1 };
                                      newMedia[index] = { ...temp, rank: index };
                                      return newMedia;
                                    });
                                  }}
                                  disabled={index === mediaItems.length - 1}
                                  className="p-1 text-white bg-gray-800 rounded-full disabled:opacity-50 hover:bg-gray-700"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 border-t">
                            <div className="flex-1 text-sm text-gray-600 truncate">
                              {item.file ? item.file.name.substring(0, 20) : `Image ${index + 1}`}
                              {item.variantInfo && (
                                <div className="mt-1">
                                  <Badge className="bg-[#e65100] text-white text-xs">
                                    {item.variantInfo.variantTitle || 
                                    item.variantInfo.optionName && item.variantInfo.optionValues?.[0] ? 
                                    `${item.variantInfo.optionName}: ${item.variantInfo.optionValues[0]}` : 
                                    'Variant'}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setMediaItems((prev) => {
                                  const removed = prev[index];
                                  if (removed.file) {
                                    URL.revokeObjectURL(removed.url);
                                  }
                                  // Return filtered array with reordered ranks
                                  const filtered = prev.filter((_, i) => i !== index);
                                  return filtered.map((item, i) => ({ ...item, rank: i }));
                                });
                              }}
                              className="p-1.5 text-red-500 bg-red-50 rounded-full hover:bg-red-100"
                            >
                              <IconTrash size={16} />
                            </button>
                          </div>
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-[#e65100] text-white text-xs px-2 py-1 rounded-md">
                              Main
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-gray-300 border-dashed rounded-md bg-gray-50">
                      <p className="text-gray-500">No images added yet. Add images to showcase your product.</p>
                    </div>
                  )
                )}
              </section>

              {/* Options & Variants Section with Junooni styling */}
              <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Options & Variants</h2>
                <Separator className="mb-6" />
                
                {/* Variant Toggle */}
                <div className="mb-6">
                  <div className="flex items-center mb-4 space-x-2">
                    <Switch 
                      checked={hasVariants}
                      onCheckedChange={setHasVariants}
                      id="has-variants"
                      className="data-[state=checked]:bg-[#e65100]"
                    />
                    <label 
                      htmlFor="has-variants" 
                      className="font-medium text-gray-800 cursor-pointer"
                    >
                      This product has multiple variants
                    </label>
                  </div>
                  <div className="pl-10 mb-2 text-sm text-gray-600">
                    {hasVariants ? 
                      "Create variants like size or color that customers can choose from" : 
                      "A single variant will be created automatically"
                    }
                  </div>
                </div>
                
                {/* Default Variant Details - Only show when NOT using variants */}
                {!hasVariants && (
                  <div className="p-5 mb-8 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <h3 className="mb-4 font-medium text-gray-700">Default Variant Details</h3>
                    
                    <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="defaultVariantSku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-gray-700">SKU</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="e.g. LTH-BAG-001" 
                                className="w-full border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="defaultVariantPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-gray-700">Price</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                <Input 
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={field.value}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  placeholder="0.00" 
                                  className="w-full pl-7 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                
                {/* Options Section - Only show if variants are enabled */}
                {hasVariants && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-700">Product Options</h3>
                      <Badge variant="outline" className="text-[#e65100] border-[#e65100] bg-orange-50">
                        Required
                      </Badge>
                    </div>
                    
                    <div className="p-4 mb-5 border border-orange-200 rounded-md bg-orange-50">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <IconInfoCircle className="h-5 w-5 text-[#e65100]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">
                            Add options like size or color to create variants of this product. Each combination will create a unique variant.
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#e65100]">
                            At least one option with values is required when using variants.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {optionFields.map((opt, optionIndex) => (
                      <div key={opt.id} className="p-5 mb-4 transition-shadow duration-200 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <FormField
                            control={form.control}
                            name={`options.${optionIndex}.title`}
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel className="font-medium text-gray-700">
                                  Option {optionIndex + 1} name
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder={
                                      optionIndex === 0 ? "e.g. Size" : 
                                      optionIndex === 1 ? "e.g. Color" : "e.g. Material"
                                    }
                                    className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          {/* Don't allow removing the first option or if only one exists */}
                          {(optionIndex > 0 || optionFields.length > 1) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="mt-6 ml-2 text-gray-500 hover:text-red-500 hover:bg-red-50"
                              onClick={() => removeOption(optionIndex)}
                            >
                              <IconX size={18} />
                            </Button>
                          )}
                        </div>
                        
                        {/* Use Enhanced Option Component for all option types */}
                        <EnhancedOptionComponent
                          optionIndex={optionIndex}
                          currentOption={form.getValues('options')[optionIndex]}
                          updateOption={updateOption}
                          handleGenerateVariants={handleGenerateVariants}
                          form={form}
                        />
                      </div>
                    ))}
                    
                    {/* Add another option button (only if fewer than 3 options) */}
                    {optionFields.length < 3 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newOptionIndex = optionFields.length;
                          appendOption({ 
                            id: generateUUID(),
                            title: '', 
                            optionValues: [],
                            imageAssociation: false
                          });
                          setNewOptionValues(prev => ({
                            ...prev,
                            [newOptionIndex]: ''
                          }));
                        }}
                        className="mt-2 text-[#e65100] border-[#e65100] hover:bg-orange-50"
                      >
                        <IconCirclePlus className="mr-1.5" size={18} /> 
                        Add another option
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Variants Section with Bulk Editing */}
                {variantFields.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-medium text-gray-700">Product Variants ({variantFields.length})</h3>
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={handleGenerateVariants}
                        size="sm"
                        className="text-[#e65100] border-[#e65100] hover:bg-orange-50"
                      >
                        Regenerate variants
                      </Button>
                    </div>
                    
                    {/* Bulk Edit Controls */}
                    <Card className="mb-6 border-gray-200 shadow-sm">
                      <CardHeader className="pb-3 border-b bg-gray-50">
                        <CardTitle className="flex items-center text-base text-gray-700">
                          <IconEdit size={18} className="mr-2 text-[#e65100]" />
                          Bulk Edit
                        </CardTitle>
                        <CardDescription>
                          Apply changes to multiple variants at once
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center">
                            <Switch 
                              checked={bulkEditMode} 
                              onCheckedChange={setBulkEditMode} 
                              id="bulk-edit-mode"
                              className="data-[state=checked]:bg-[#e65100]"
                            />
                            <label htmlFor="bulk-edit-mode" className="ml-2 text-sm text-gray-700">
                              {bulkEditMode ? 'Exit bulk edit mode' : 'Enable bulk edit mode'}
                            </label>
                          </div>
                          
                          {bulkEditMode && (
                            <>
                              <div className="flex items-center mb-2">
                                <Switch 
                                  checked={selectedVariants.length === variantFields.length}
                                  onCheckedChange={handleSelectAllVariants}
                                  id="select-all-variants" 
                                  className="data-[state=checked]:bg-[#e65100]"
                                />
                                <label htmlFor="select-all-variants" className="ml-2 text-sm text-gray-700">
                                  Select all variants ({selectedVariants.length}/{variantFields.length})
                                </label>
                              </div>
                              
                              {selectedVariants.length > 0 && (
                                <div className="grid grid-cols-1 gap-4 mt-2 md:grid-cols-2">
                                  <div>
                                    <label className="block mb-1.5 text-sm text-gray-700">Set price for all selected</label>
                                    <div className="flex gap-2">
                                      <div className="relative flex-1">
                                        <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={bulkPrice}
                                          onChange={(e) => setBulkPrice(e.target.value)}
                                          placeholder="0.00"
                                          className="pl-7 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => handleBulkEdit('price', parseFloat(bulkPrice) || 0)}
                                        disabled={!bulkPrice}
                                        className="bg-[#e65100] hover:bg-[#d84315] text-white disabled:bg-gray-300"
                                      >
                                        Apply
                                      </Button>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block mb-1.5 text-sm text-gray-700">Set stock for all selected</label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={bulkStock}
                                        onChange={(e) => setBulkStock(e.target.value)}
                                        placeholder="0"
                                        className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => handleBulkEdit('stock', parseInt(bulkStock) || 0)}
                                        disabled={!bulkStock}
                                        className="bg-[#e65100] hover:bg-[#d84315] text-white disabled:bg-gray-300"
                                      >
                                        Apply
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Variants Table */}
                    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            {bulkEditMode && (
                              <th className="p-3 text-left border-r border-gray-200">
                                <span className="sr-only">Select</span>
                              </th>
                            )}
                            <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Variant</th>
                            <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">SKU</th>
                            <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Price</th>
                            <th className="p-3 font-medium text-center text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variantFields.map((vf, index) => (
                            <tr 
                              key={vf.id} 
                              className={`
                                ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                ${bulkEditMode && selectedVariants.includes(vf.id) ? "bg-orange-50" : ""}
                                hover:bg-orange-50 transition-colors duration-150
                              `}
                            >
                              {bulkEditMode && (
                                <td className="p-3 text-center border-r border-gray-200">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedVariants.includes(vf.id)} 
                                    onChange={() => handleToggleVariantSelection(vf.id)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#e65100] focus:ring-[#e65100]"
                                  />
                                </td>
                              )}
                              <td className="p-3 border-r border-gray-200">
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-800">{form.watch(`variants.${index}.title`)}</span>
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {form.watch(`variants.${index}.optionValues`, []).map((optVal: OptionValue, optIndex: number) => (
                                      <Badge 
                                        key={optIndex} 
                                        variant="outline" 
                                        className="text-xs text-[#e65100] border-orange-200 bg-orange-50"
                                      >
                                        {optVal.optionName}: {optVal.value}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 border-r border-gray-200">
                                <Input
                                  {...form.register(`variants.${index}.sku`)}
                                  onChange={(e) => handleVariantFieldChange(index, 'sku', e.target.value)}
                                  className="w-full border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                                />
                              </td>
                              <td className="p-3 border-r border-gray-200">
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.watch(`variants.${index}.price`) || ''}
                                    onChange={(e) => {
                                      const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                                      handleVariantFieldChange(index, 'price', value === '' ? 0 : value);
                                    }}
                                    className="w-full pl-7 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                                  />
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex justify-center space-x-2">
                                  <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDuplicateVariant(index)}
                                    className="text-gray-600 hover:bg-gray-100"
                                    title="Duplicate variant"
                                  >
                                    <IconCopy size={16} />
                                  </Button>
                                  
                                  <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => removeVariant(index)}
                                    className="text-red-500 hover:bg-red-50"
                                    title="Remove variant"
                                  >
                                    <IconX size={16} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Status Card */}
              <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Status & Visibility</h2>
                <Separator className="mb-6" />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="mb-5">
                      <FormLabel className="font-medium text-gray-700">Product Status</FormLabel>
                      <Select onValueChange={field.onChange}  value={field.value || "draft"}  defaultValue="draft">
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:ring-[#e65100]">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">
                            <div className="flex items-center">
                              <span className="w-2 h-2 mr-2 bg-gray-400 rounded-full"></span>
                              Draft
                            </div>
                          </SelectItem>
                          <SelectItem value="proposed">
                            <div className="flex items-center">
                              <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
                              Proposed
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-sm text-gray-500">
                        Draft products are not visible to customers
                      </FormDescription>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Category Selection */}
                {isLoadingCategories ? (
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem className="mb-5">
                        <FormLabel className="font-medium text-gray-700">Product Category</FormLabel>
                        <Select disabled={true}>
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:ring-[#e65100]">
                              <SelectValue placeholder="Loading categories..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <div className="p-2 text-gray-500">Loading...</div>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-sm text-gray-500">
                          Categorize your product to help customers find it
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                ) : categoryError ? (
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem className="mb-5">
                        <FormLabel className="font-medium text-gray-700">Product Category</FormLabel>
                        <Select disabled={true}>
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:ring-[#e65100]">
                              <SelectValue placeholder="Error loading categories" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <div className="p-2 text-sm text-red-500">{categoryError}</div>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-sm text-gray-500">
                          Categorize your product to help customers find it
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                ) : (
                  <HierarchicalCategorySelector 
                    form={form} 
                    categories={productCategories} 
                    name="category_id" 
                  />
                )}

                <FormField
                  control={form.control}
                  name="discountable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md">
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                          className="data-[state=checked]:bg-[#e65100]"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-gray-700">Discountable</FormLabel>
                        <FormDescription className="text-sm text-gray-500">
                          Allow this product to be used in discounts
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </section>
              
              {/* Shipping & Fulfillment Info Card */}
              <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Shipping & Fulfillment</h2>
                <Separator className="mb-4" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-full text-[#e65100]">
                    <IconTruck size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Junooni Fulfillment</h3>
                    <p className="text-sm text-gray-600">You'll handle all order shipping</p>
                  </div>
                </div>
                
                {/* Shipping information */}
                <div className="mt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="shippingDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center font-medium text-gray-700">
                          <IconTruck size={18} className="mr-1.5 text-[#e65100]" />
                          Shipping Time
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:ring-[#e65100]">
                              <SelectValue placeholder="Select shipping time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="3-5">3-5 business days</SelectItem>
                            <SelectItem value="5-7">5-7 business days</SelectItem>
                            <SelectItem value="7-10">7-10 business days</SelectItem>
                            <SelectItem value="10-14">10-14 business days</SelectItem>
                            <SelectItem value="14-21">2-3 weeks</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Estimated time for delivery after shipping
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="handlingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center font-medium text-gray-700">
                          <IconClock size={18} className="mr-1.5 text-[#e65100]" />
                          Handling Time
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:ring-[#e65100]">
                              <SelectValue placeholder="Select handling time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 business day</SelectItem>
                            <SelectItem value="1-2">1-2 business days</SelectItem>
                            <SelectItem value="2-3">2-3 business days</SelectItem>
                            <SelectItem value="3-5">3-5 business days</SelectItem>
                            <SelectItem value="5-7">5-7 business days</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Time needed to prepare and package the order
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Stock Management Info */}
                <div className="mt-6">
                  <h3 className="mb-2 font-medium text-gray-700">Stock Information</h3>
                  <p className="text-sm text-gray-600">
                    Stock levels you set for each variant will be tracked with each order.
                    Be sure to maintain sufficient inventory to fulfill orders promptly.
                  </p>
                  
                  <Alert className="mt-4">
                    <IconInfoCircle className="w-4 h-4" />
                    <AlertDescription>
                      Inventory will be managed automatically based on the stock levels you set for each variant.
                    </AlertDescription>
                  </Alert>
                </div>
              </section>
              
              {/* Physical Details Card */}
              <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Physical Details</h2>
                <Separator className="mb-6" />
                
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-gray-700">Weight (g)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0" 
                            placeholder="e.g. 400" 
                            className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-gray-700">Length(inch)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0" 
                              placeholder="e.g. 30" 
                              className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-gray-700">Width(inch)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0" 
                              placeholder="e.g. 20" 
                              className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-gray-700">Height(inch)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0" 
                              placeholder="e.g. 5" 
                              className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </section>
              
              {/* Additional Info Card */}
              <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Additional Info</h2>
                <Separator className="mb-6" />
                
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-gray-700">Material</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g. Cotton, Polyester" 
                            className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="origin_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-gray-700">Country of Origin</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ''}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:ring-[#e65100]">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="IN">India</SelectItem>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CN">China</SelectItem>
                            <SelectItem value="JP">Japan</SelectItem>
                            <SelectItem value="KR">South Korea</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                            <SelectItem value="DE">Germany</SelectItem>
                            <SelectItem value="IT">Italy</SelectItem>
                            <SelectItem value="FR">France</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </section>
            </div>
          </div>
          
          {/* Bottom Action Bar - Fixed to bottom on mobile */}
          <div className="fixed bottom-0 left-0 right-0 z-10 p-4 bg-white border-t border-gray-200 md:static md:bg-transparent md:border-0 md:p-0 md:mt-6">
            <div className="flex justify-end mx-auto space-x-3 max-w-7xl">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => navigate({ to: '/productCatalog' })}
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleManualSubmit} 
                disabled={isSubmitting}
                className="bg-[#e65100] hover:bg-[#d84315] text-white shadow-sm"
              >
                {isSubmitting ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
      
      {/* Error Display */}
      {error && (
        <div className="fixed max-w-md p-4 border border-red-200 rounded-lg shadow-lg bottom-4 right-4 bg-red-50">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <IconX className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">
                {error}
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 ml-4 text-red-400 hover:text-red-500"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Create;