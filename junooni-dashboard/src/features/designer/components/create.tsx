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
import { createProduct, uploadProductImage, fetchCategories, batchUpdateInventoryLevels, fetchProduct } from '../../products/context/fetchApi';
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
    suggestedRetailPrice?: number;
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
    suggestedRetailPrice: number;
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
  designImages?: Record<string, string>;
  mockupImages?: Record<string, string>;
  uniqueImages?: Record<string, {
    imageData: string;
    colorName: string;
    mockupTitle: string;
    sizeName?: string; // Add this for size-specific images
  }>;
  uploadedFiles?: any[];
  selectedProduct?: SelectedProductInfo;
  enhancedProductData?: PayloadProductData;
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
  
  console.log('🎨 Available colors for matching:', Array.from(availableColors.values()));
  
  return {
    availableColors,
    
    /**
     * Match color from variant key using multiple strategies
     */
    matchColor: (variantKey: string): string => {
      console.log(`🔍 Matching color from: "${variantKey}"`);
      
      const keyLower = variantKey.toLowerCase();
      const keyParts = variantKey.split(/[-_\s]+/).filter(p => p.length > 0);
      
      // Strategy 1: Exact match in parts
      for (const part of keyParts) {
        const partLower = part.toLowerCase();
        if (availableColors.has(partLower)) {
          const matched = availableColors.get(partLower)!;
          console.log(`✅ Exact match found: "${matched.name}" from part "${part}"`);
          return matched.name;
        }
      }
      
      // Strategy 2: Substring match in full key
      for (const [colorKey, colorData] of availableColors) {
        if (keyLower.includes(colorKey)) {
          console.log(`✅ Substring match found: "${colorData.name}" (${colorKey}) in "${variantKey}"`);
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
          console.log(`✅ Partial word match found: "${colorData.name}" in "${variantKey}"`);
          return colorData.name;
        }
      }
      
      // Strategy 4: Common color pattern matching (dynamic)
      const commonColorPatterns = createCommonColorPatterns(availableColors);
      for (const [pattern, colorName] of commonColorPatterns) {
        if (keyLower.includes(pattern)) {
          console.log(`✅ Pattern match found: "${colorName}" (pattern: ${pattern}) in "${variantKey}"`);
          return colorName;
        }
      }
      
      // Fallback: Return first available color
      const firstColor = Array.from(availableColors.values())[0];
      if (firstColor) {
        console.log(`⚠️ No color match found, using first available: "${firstColor.name}"`);
        return firstColor.name;
      }
      
      console.log(`❌ No colors available, returning 'Unknown'`);
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
    console.log(`🎨 Color option "${optionTitle}" → ${result} (settings.color_Images = ${settings.color_Images})`);
    return result;
  }
  
  // Size options
  if (isSizeOption(normalizedTitle)) {
    const result = settings.size_Images;
    console.log(`📏 Size option "${optionTitle}" → ${result} (settings.size_Images = ${settings.size_Images})`);
    return result;
  }
  
  // Material options
  if (isMaterialOption(normalizedTitle)) {
    const result = settings.material_Images || false;
    console.log(`🧵 Material option "${optionTitle}" → ${result}`);
    return result;
  }
  
  // Style options
  if (isStyleOption(normalizedTitle)) {
    const result = settings.style_Images || false;
    console.log(`✨ Style option "${optionTitle}" → ${result}`);
    return result;
  }
  
  console.log(`❓ Unknown option "${optionTitle}" → false`);
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

/**
 * Process base64 image data to File object
 */
const processBase64ToFile = async (
  base64Data: string, 
  fileName: string, 
  colorName?: string
): Promise<ProcessedImage | null> => {
  try {
    console.log(`🔄 ENHANCED Processing: ${fileName} (${colorName || 'no color'})`);
    console.log(`📊 Input Base64 length: ${base64Data.length} characters`);
    
    // ✅ ENHANCED: More thorough validation
    if (!base64Data) {
      throw new Error('Base64 data is empty');
    }
    
    if (!base64Data.startsWith('data:image/')) {
      throw new Error('Invalid data URL format - must start with data:image/');
    }
    
    if (!base64Data.includes('base64,')) {
      throw new Error('Invalid data URL format - missing base64 marker');
    }
    
    // Extract components with better error handling
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
    
    console.log(`🎯 MIME type: ${mimeType}, Content length: ${base64Content.length}`);
    
    // ✅ ENHANCED: Convert with better error handling
    let binaryString: string;
    try {
      binaryString = atob(base64Content);
    } catch (atobError) {
      throw new Error(`Failed to decode base64: ${atobError.message}`);
    }
    
    if (binaryString.length < 100) {
      throw new Error(`Decoded binary too short: ${binaryString.length} bytes`);
    }
    
    // Create byte array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // ✅ ENHANCED: Create blob and file with validation
    const blob = new Blob([bytes], { type: mimeType });
    
    if (blob.size < 1000) {
      throw new Error(`Generated blob too small: ${blob.size} bytes`);
    }
    
    // ✅ ENHANCED: Create file with proper naming
    const cleanFileName = fileName.replace(/[^a-z0-9.-]/gi, '_');
    const file = new File([blob], cleanFileName, { 
      type: mimeType,
      lastModified: Date.now()
    });
    
    console.log(`📁 Created file: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);
    
    // ✅ ENHANCED: Validate by loading the image
    const objectUrl = URL.createObjectURL(file);
    let dimensions: { width: number; height: number };
    
    try {
      dimensions = await validateImageDimensions(objectUrl);
      console.log(`📐 Validated dimensions: ${dimensions.width}x${dimensions.height}`);
    } catch (validationError) {
      URL.revokeObjectURL(objectUrl);
      throw new Error(`Image validation failed: ${validationError.message}`);
    }
    
    // ✅ ENHANCED: Return comprehensive result
    const result: ProcessedImage = {
      file,
      url: objectUrl,
      colorValue: colorName,
      size: file.size,
      dimensions,
      quality: file.size > 100000 ? 'high' : file.size > 50000 ? 'medium' : 'low'
    };
    
    console.log(`✅ ENHANCED SUCCESS: ${file.name}`);
    console.log(`📊 Final file size: ${file.size} bytes`);
    console.log(`📐 Dimensions: ${dimensions.width}x${dimensions.height}`);
    console.log(`🎯 Quality: ${result.quality}`);
    
    return result;
    
  } catch (error) {
    console.error(`❌ ENHANCED PROCESSING FAILED for ${fileName}:`, error);
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
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1 w-0 ml-3">
            <p className="text-sm font-medium text-green-800">
              🎨 Design Successfully Imported!
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
                  {hasGoodQuality ? '✅ Excellent' : '⚠️ Mixed'}
                </span>
              </div>
              {enhancedProductData && (
                <>
                  <div className="pt-2 mt-2 border-t border-green-300">
                    <div className="flex justify-between">
                      <span>Enhanced Data:</span>
                      <span className="font-medium text-blue-600">✅ Available</span>
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
      </div>
    </div>
  );
};

// Default location ID for inventory management
const defaultLocationId = "sloc_01JKWDDGKGCQFJANXV0CVJN2QW";

// ===== MAIN CREATE COMPONENT =====
const Create: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useSearch({
    from: undefined as any,
  }) as SearchParams;
  
  // ===== COMPONENT INITIALIZATION LOG =====
  console.log('\n🏗️ === CREATE COMPONENT INITIALIZATION ===');
  console.log('📍 Current location state:', location.state ? 'Present' : 'Not present');
  console.log('🔧 Search params:', searchParams);
  console.log('⚙️ Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    hostname: window.location.hostname
  });
  
  // Designer data state
  const [designData, setDesignData] = useState<DesignData | null>(null);
  const [importedDesignImages, setImportedDesignImages] = useState<Record<string, string>>({});
  const [importedMockupImages, setImportedMockupImages] = useState<Record<string, string>>({});
  const [importedFiles, setImportedFiles] = useState<any[]>([]);
  const [showImportNotification, setShowImportNotification] = useState(false);
  const [enhancedProductData, setEnhancedProductData] = useState<PayloadProductData | null>(null);

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
    defaultValues: {
      title: '',
      subtitle: '',
      handle: '',
      description: '',
      status: 'published',
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
      locationId: defaultLocationId,
    
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

  // ===== ENHANCED DESIGNER DATA HANDLING =====
  // Replace the entire useEffect with this fixed version
useEffect(() => {
  console.log('🗂️ CREATE COMPONENT MOUNTED - Checking for PayloadCMS data...');
  
  const checkForPayloadCMSData = () => {
    if (location.state) {
      console.log('✅ FOUND LOCATION STATE DATA!');
      console.log('📊 Location state keys:', Object.keys(location.state));
      
      const locationState = location.state as any;

      // ✅ PRIORITY 1: Check for direct PayloadCMS product data
      if (locationState.payloadProduct) {
        console.log('🚀 Direct PayloadCMS product found!');
        console.log('📊 PayloadCMS product data:', locationState.payloadProduct);
        
        setPayloadProduct(locationState.payloadProduct);
        populateFormWithPayloadCMSData(locationState.payloadProduct);
        setShowImportNotification(true);
        return true;
      }
      
      // ✅ PRIORITY 2: Check for PayloadCMS data in enhancedProductData
      if (locationState.enhancedProductData) {
        console.log('🔍 Enhanced product data found, checking for PayloadCMS structure...');
        console.log('📊 Enhanced data:', locationState.enhancedProductData);
        
        // Try to reconstruct PayloadCMS structure from enhanced data
        const enhanced = locationState.enhancedProductData;
        const design = locationState.designData;
        
        if (enhanced.id && design?.productInfo) {
          console.log('🔄 Reconstructing PayloadCMS structure from enhanced data...');
          
          const reconstructedPayload: PayloadCMSProduct = {
            id: parseInt(enhanced.id) || 1,
            name: design.productInfo.title || 'Imported Product',
            slug: design.productInfo.title?.toLowerCase().replace(/\s+/g, '-') || 'imported-product',
            status: 'active',
            productType: 'apparel_tshirt',
            brand: design.productInfo.brand || 'Junooni',
            brandSku: design.productInfo.sku || 'JUNI-001',
            sku: design.productInfo.sku || 'JUNI-001',
            cost: enhanced.cost || 200,
            pricing: {
              markupType: 'fixed',
              markupValue: enhanced.pricing?.markupValue || 100,
              suggestedRetailPrice: enhanced.pricing?.suggestedRetailPrice || design.price || 300
            },
            description: design.productInfo.description || 'Imported from designer',
            materials: {
              primary: enhanced.materials?.primary || '100% Cotton',
              weight: '30',
              construction: 'Ring-spun',
              efabType: 'cotton',
              fabricWeight: 180
            },
            physicalDimensions: {
              widthInches: enhanced.dimensions?.length ? enhanced.dimensions.length / 2.54 : 8,
              heightInches: enhanced.dimensions?.width ? enhanced.dimensions.width / 2.54 : 12,
              depthInches: enhanced.dimensions?.height ? enhanced.dimensions.height / 2.54 : 1,
              units: 'inches'
            },
            shippingInfo: {
              weight: enhanced.dimensions?.weight ? enhanced.dimensions.weight / 28.35 : 10,
              shippingDimensions: '10x13x3',
              packageType: 'poly_mailer'
            },
            colorOptions: design.colorDetails?.map((color, index) => ({
              id: `color_${index}`,
              colorName: color.name,
              colorHex: color.value
            })) || [],
            sizeOptions: design.options?.find(opt => opt.title.toLowerCase().includes('size'))?.optionValues.map((size, index) => ({
              id: `size_${index}`,
              sizeName: size
            })) || [],
            color_Images: enhanced.color_Images || false,
            size_Images: enhanced.size_Images || false,
            categories: []
          };
          
          console.log('✅ Reconstructed PayloadCMS structure:', reconstructedPayload);
          
          setPayloadProduct(reconstructedPayload);
          populateFormWithPayloadCMSData(reconstructedPayload);
          
          // Set additional data for compatibility
          setDesignData(design);
          setEnhancedProductData(enhanced);
          
          // Handle images if available
          if (locationState.mockupImages && Object.keys(locationState.mockupImages).length > 0) {
            console.log('🖼️ Processing images with reconstructed PayloadCMS data...');
            const imageSettings = {
              color_Images: reconstructedPayload.color_Images,
              size_Images: reconstructedPayload.size_Images,
              material_Images: false,
              style_Images: false
            };
            setTimeout(() => {
              handleMockupImagesEnhanced(locationState, imageSettings);
            }, 1500);
          }
          
          setShowImportNotification(true);
          return true;
        }
      }
      
      // ✅ FALLBACK: Legacy designer data handling
      if (locationState.designData) {
        console.log('📐 Legacy designer data found, using fallback method');
        
        const imageSettings = {
          color_Images: locationState.enhancedProductData?.color_Images || false,
          size_Images: locationState.enhancedProductData?.size_Images || false,
          material_Images: locationState.enhancedProductData?.material_Images || false,
          style_Images: locationState.enhancedProductData?.style_Images || false
        };
        
        setPayloadImageSettings(imageSettings);
        setDesignData(locationState.designData);
        setEnhancedProductData(locationState.enhancedProductData);
        
        // Use the original population method for legacy data
        setTimeout(() => {
          populateFormWithDesignData(locationState.designData, locationState.enhancedProductData, imageSettings);
          
          if (Object.keys(locationState.mockupImages || {}).length > 0) {
            handleMockupImagesEnhanced(locationState, imageSettings);
          }
        }, 100);
        
        setShowImportNotification(true);
        return true;
      }
    }
    
    console.log('ℹ️ No PayloadCMS or designer data found - showing empty form');
    return false;
  };
  
  checkForPayloadCMSData();
}, [location.state]);


  // ===== ENHANCED MOCKUP IMAGE PROCESSING =====
const handleMockupImagesEnhanced = async (
  locationState: LocationState, 
  directImageSettings?: ImageAssociationSettings
) => {
  try {
    console.log('\n🎨 === ENHANCED: PROCESSING BOTH RAW DESIGN + MOCKUP IMAGES ===');
    
    const { mockupImages = {}, uniqueImages = {}, designData, enhancedProductData } = locationState;
    const settingsToUse = directImageSettings || payloadImageSettings;
    
    console.log('📊 Input data:', {
      mockupEntries: Object.keys(mockupImages).length,
      uniqueImages: Object.keys(uniqueImages).length,
      hasDesignData: !!designData,
      payloadSettings: settingsToUse
    });

    // 🔥 NEW: Extract and process raw design images FIRST
    if (designData?.designElements) {
      console.log('\n🖼️ === STEP 1: PROCESSING RAW DESIGN IMAGES ===');
      await processRawDesignImages(designData.designElements);
    }

    // 🔥 EXISTING: Process mockup images SECOND  
    if (Object.keys(uniqueImages).length > 0) {
      console.log('\n🎨 === STEP 2: PROCESSING MOCKUP IMAGES ===');
      await processUniqueImagesFromCanvas(uniqueImages, designData!, settingsToUse);
    } else if (Object.keys(mockupImages).length > 0) {
      console.log('\n🎨 === STEP 2: PROCESSING MOCKUP IMAGES (FALLBACK) ===');
      await processMockupImagesDirectly(mockupImages, designData!, settingsToUse);
    } else {
      console.error('❌ No mockup image data found');
      setError('No mockup images found from designer');
    }
    
  } catch (error) {
    console.error('❌ Error in enhanced image processing:', error);
    setError('Failed to process images from designer');
  }
};

const processRawDesignImages = async (designElements: Record<string, any[]>) => {
  try {
    console.log('\n🖼️ === PROCESSING RAW DESIGN IMAGES ===');
    
    const rawDesignImages: MediaItem[] = [];
    let designImageRank = 1000; // Start at high rank so they appear after mockups
    
    // Extract all image elements from all areas
    for (const [areaName, elements] of Object.entries(designElements)) {
      console.log(`\n📋 Processing area: ${areaName} (${elements.length} elements)`);
      
      for (const element of elements) {
        if (element.type === 'image' && element.imageBase64) {
          console.log(`\n🔄 Processing design image: ${element.imageName || 'Unnamed'}`);
          console.log(`📊 Base64 length: ${element.imageBase64.length} characters`);
          
          try {
            // Generate unique filename for design image
            const timestamp = Date.now();
            const cleanName = (element.imageName || 'design-image')
              .replace(/[^a-z0-9.-]/gi, '_')
              .toLowerCase();
            const fileName = `design-${cleanName}-${areaName}-${timestamp}.png`;
            
            // Convert base64 to file
            const processedImage = await processBase64ToFile(
              element.imageBase64,
              fileName,
              undefined // No color association for raw design images
            );
            
            if (!processedImage) {
              console.error(`❌ Failed to process design image: ${element.imageName}`);
              continue;
            }
            
            // Create MediaItem for raw design image
            const designMediaItem: MediaItem = {
              file: processedImage.file,
              url: processedImage.url,
              rank: designImageRank++,
              isNew: true,
              
              // 🔥 MARK AS RAW DESIGN IMAGE
              variantInfo: {
                isRawDesignImage: true,
                designArea: areaName,
                originalFileName: element.imageName || 'Unnamed'
              },
              
              metadata: {
                isRawDesignImage: true, // 🔥 KEY FLAG
                designArea: areaName,
                originalFileName: element.imageName,
                originalImageWidth: element.originalImageWidth,
                originalImageHeight: element.originalImageHeight,
                canvasPosition: {
                  x: element.x,
                  y: element.y,
                  width: element.width,
                  height: element.height,
                  rotation: element.rotation
                },
                uploadValidation: {
                  hasFile: !!processedImage.file,
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
                  timestamp: new Date().toISOString()
                }
              }
            };
            
            rawDesignImages.push(designMediaItem);
            
            console.log(`✅ Processed design image: ${fileName}`);
            console.log(`   File size: ${processedImage.file.size} bytes`);
            console.log(`   Dimensions: ${processedImage.dimensions?.width}x${processedImage.dimensions?.height}`);
            
          } catch (error) {
            console.error(`❌ Error processing design image ${element.imageName}:`, error);
          }
        }
      }
    }
    
    console.log(`\n📊 RAW DESIGN IMAGES PROCESSED: ${rawDesignImages.length} images`);
    
    if (rawDesignImages.length > 0) {
      // 🔥 ADD to existing mediaItems (don't replace)
      setMediaItems(prev => {
        const combined = [...rawDesignImages, ...prev];
        console.log(`🔗 Combined images: ${rawDesignImages.length} design + ${prev.length} mockup = ${combined.length} total`);
        return combined;
      });
      
      console.log('\n🎯 RAW DESIGN IMAGES SUMMARY:');
      rawDesignImages.forEach((item, index) => {
        console.log(`${index + 1}. ${item.file?.name}`);
        console.log(`   Area: ${item.metadata?.designArea}`);
        console.log(`   Original: ${item.metadata?.originalFileName}`);
        console.log(`   Size: ${item.file?.size} bytes`);
      });
    } else {
      console.log('ℹ️ No raw design images found to process');
    }
    
  } catch (error) {
    console.error('❌ Error processing raw design images:', error);
    throw error;
  }
};

  // ===== UNIQUE IMAGES PROCESSING =====
const processUniqueImagesFromCanvas = async (
  uniqueImages: Record<string, any>,
  designData: DesignData,
  directImageSettings?: ImageAssociationSettings
) => {
  try {
    console.log('\n🚨 === ENHANCED IMAGE PROCESSING WITH UPLOAD VALIDATION ===');
    const settingsToUse = directImageSettings || payloadImageSettings;
    console.log('📊 Input unique images:', Object.keys(uniqueImages).length);
    console.log('📊 Using PayloadCMS settings:', settingsToUse);
    
    const processedImages: MediaItem[] = [];
    let currentRank = 0;
    let skippedCount = 0;
    let failedCount = 0;
    
    for (const [imageHash, imageInfo] of Object.entries(uniqueImages)) {
      try {
        console.log(`\n🔄 Processing image ${currentRank + 1}/${Object.keys(uniqueImages).length}`);
        console.log(`📋 Hash: ${imageHash.substring(0, 12)}...`);
        
        // ✅ ENHANCED: Validate base64 data more thoroughly
        if (!imageInfo.imageData) {
          console.error(`❌ No imageData for hash ${imageHash}`);
          skippedCount++;
          continue;
        }
        
        // ✅ ENHANCED: Support both data URLs and raw base64
        let base64Data = imageInfo.imageData;
        if (!base64Data.startsWith('data:image/')) {
          // If it's raw base64, add the data URL prefix
          if (base64Data.length > 100 && !base64Data.includes('data:')) {
            base64Data = `data:image/png;base64,${base64Data}`;
            console.log('🔧 Added data URL prefix to raw base64');
          } else {
            console.error(`❌ Invalid image data format for hash ${imageHash}`);
            skippedCount++;
            continue;
          }
        }
        
        // Extract info with enhanced fallbacks
        let extractedInfo = {
          colorName: imageInfo.colorName || 'Unknown',
          sizeName: imageInfo.sizeName
        };
        
        // Enhanced parsing from title if needed
        if (imageInfo.mockupTitle && (extractedInfo.colorName === 'Unknown' || !extractedInfo.sizeName)) {
          const parsedFromTitle = parseVariantKeyEnhanced(imageInfo.mockupTitle, designData);
          if (parsedFromTitle.colorName !== 'Unknown') {
            extractedInfo.colorName = parsedFromTitle.colorName;
          }
          if (parsedFromTitle.sizeName && !extractedInfo.sizeName) {
            extractedInfo.sizeName = parsedFromTitle.sizeName;
          }
        }
        
        // Fallback to first available color
        if (extractedInfo.colorName === 'Unknown' && designData.colorDetails?.length > 0) {
          extractedInfo.colorName = designData.colorDetails[0].name;
        }
        
        // ✅ ENHANCED: Generate unique filename with timestamp
        const timestamp = Date.now();
        const fileName = extractedInfo.sizeName 
          ? `canvas-${extractedInfo.colorName.toLowerCase()}-${extractedInfo.sizeName.toLowerCase()}-${timestamp}.png`
          : `canvas-${extractedInfo.colorName.toLowerCase()}-${timestamp}.png`;
        
        console.log(`📝 Processing file: ${fileName}`);
        console.log(`📊 Base64 length: ${base64Data.length} characters`);
        
        // ✅ ENHANCED: Process base64 with better error handling
        const processedImage = await processBase64ToFile(
          base64Data,
          fileName,
          extractedInfo.colorName
        );
        
        if (!processedImage) {
          console.error(`❌ Failed to process base64 for ${fileName}`);
          failedCount++;
          continue;
        }
        
        // ✅ ENHANCED: Validate file size and type
        if (processedImage.file.size < 1000) {
          console.error(`❌ File too small: ${processedImage.file.size} bytes`);
          failedCount++;
          continue;
        }
        
        if (!processedImage.file.type.startsWith('image/')) {
          console.error(`❌ Invalid file type: ${processedImage.file.type}`);
          failedCount++;
          continue;
        }
        
        // Create variant info structure
        const variantInfo = createVariantInfoStructure(extractedInfo, settingsToUse);
        
        // ✅ ENHANCED: Create MediaItem with comprehensive metadata
        const mediaItem: MediaItem = {
          file: processedImage.file, // ✅ Critical: Ensure File object is set
          url: processedImage.url,
          rank: currentRank,
          isNew: true,
          variantInfo: variantInfo,
          colorValue: extractedInfo.colorName,
          
          // ✅ ENHANCED: Add comprehensive metadata for debugging
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
            
            // ✅ ENHANCED: Add upload validation flags
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
        
        // ✅ ENHANCED: Validate MediaItem before adding
        if (!mediaItem.file) {
          console.error(`❌ MediaItem missing file object for ${fileName}`);
          failedCount++;
          continue;
        }
        
        processedImages.push(mediaItem);
        currentRank++;
        
        console.log(`✅ SUCCESS: Created MediaItem #${currentRank}: ${fileName}`);
        console.log(`   File size: ${processedImage.file.size} bytes`);
        console.log(`   File type: ${processedImage.file.type}`);
        console.log(`   Color: ${extractedInfo.colorName}, Size: ${extractedInfo.sizeName || 'none'}`);
        
      } catch (error) {
        console.error(`❌ ERROR processing image:`, error);
        failedCount++;
      }
    }
    
    console.log(`\n📊 ENHANCED PROCESSING COMPLETE:`);
    console.log(`   ✅ Successfully processed: ${processedImages.length}`);
    console.log(`   ⏭️ Skipped (invalid data): ${skippedCount}`);
    console.log(`   ❌ Failed (processing error): ${failedCount}`);
    console.log(`   📊 Total input: ${Object.keys(uniqueImages).length}`);
    
    if (processedImages.length === 0) {
      console.error('🚨 CRITICAL: No images were successfully processed!');
      setError('Enhanced processing: Failed to process any images. Check console for details.');
      return;
    }
    
    // ✅ ENHANCED: Final validation before setting mediaItems
    const validImages = processedImages.filter(item => {
      const isValid = item.file && item.file.size > 0 && item.url;
      if (!isValid) {
        console.error(`❌ Invalid MediaItem filtered out:`, {
          hasFile: !!item.file,
          fileSize: item.file?.size,
          hasUrl: !!item.url
        });
      }
      return isValid;
    });
    
    console.log(`\n🔍 FINAL VALIDATION: ${validImages.length}/${processedImages.length} images valid for upload`);
    
    // Set the validated images
    setMediaItems(validImages);
    setTimeout(() => setActiveImageTab('upload'), 100);
    
    // ✅ ENHANCED: Log final state for debugging
    console.log('\n📋 FINAL MEDIA ITEMS READY FOR UPLOAD:');
    validImages.forEach((item, index) => {
      console.log(`${index + 1}. ${item.file?.name}`);
      console.log(`   File: ${item.file?.size} bytes, Type: ${item.file?.type}`);
      console.log(`   Color: ${item.colorValue}, URL: ${item.url.substring(0, 50)}...`);
      console.log(`   Upload Ready: ${item.metadata?.uploadValidation?.validForUpload}`);
    });
    
  } catch (error) {
    console.error('🚨 ENHANCED PROCESSING CRITICAL ERROR:', error);
    setError('Enhanced image processing failed. Check console for details.');
  }
};



  // ===== EXTRACT COLOR AND SIZE FROM IMAGE DATA =====
const extractColorAndSizeFromImageData = (imageInfo: any, designData: DesignData) => {
  console.log('\n🔍 === ENHANCED EXTRACTION DEBUG ===');
  console.log('Input imageInfo:', {
    colorName: imageInfo.colorName,
    sizeName: imageInfo.sizeName,
    mockupTitle: imageInfo.mockupTitle,
    hasImageData: !!imageInfo.imageData
  });
  
  const colorMatcher = createColorMatcher(designData);
  
  let colorName = imageInfo.colorName || 'Unknown';
  let sizeName: string | undefined = imageInfo.sizeName;
  
  // Strategy 1: Direct extraction from imageInfo
  if (colorName && colorName !== 'Unknown') {
    console.log(`✅ Direct color extraction: ${colorName}`);
  } else {
    // Strategy 2: Extract from mockupTitle using dynamic matcher
    if (imageInfo.mockupTitle) {
      colorName = colorMatcher.matchColor(imageInfo.mockupTitle);
      console.log(`🎨 Found color from title: ${colorName}`);
    }
    
    // Strategy 3: Use first available color as fallback
    if (colorName === 'Unknown') {
      const firstColor = colorMatcher.getAllColorNames()[0];
      if (firstColor) {
        colorName = firstColor;
        console.log(`🔄 Fallback to first color: ${colorName}`);
      }
    }
  }
  
  // Size extraction with multiple strategies (unchanged as it doesn't use hardcoded values)
  if (!sizeName && imageInfo.mockupTitle && designData.options) {
    const sizeOption = designData.options.find(opt => 
      opt.title.toLowerCase().includes('size')
    );
    
    if (sizeOption?.optionValues) {
      // Strategy 1: Direct match in mockupTitle
      for (const sizeValue of sizeOption.optionValues) {
        if (imageInfo.mockupTitle.toLowerCase().includes(sizeValue.toLowerCase())) {
          sizeName = sizeValue;
          console.log(`📏 Found size from title: ${sizeName}`);
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
            console.log(`📏 Found size from parts: ${sizeName}`);
            break;
          }
        }
      }
    }
  }
  
  console.log('✅ FINAL EXTRACTION RESULT:', { colorName, sizeName });
  return { colorName, sizeName };
};


  // ===== HELPER FUNCTIONS =====


  const validateColorExists = (colorName: string, designData: DesignData): boolean => {
  const colorMatcher = createColorMatcher(designData);
  return colorMatcher.getAllColorNames().includes(colorName);
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
  
  console.log('🏗️ Creating enhanced variant info for:', { colorName, sizeName });
  console.log('Settings:', settings);
  
  // 🚨 FIX: Always create some variant info, even with minimal data
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

  // ===== ENHANCED: GET IMAGES FOR OPTION VALUE =====
const getImagesForOptionValue = (optionName: string, optionValue: string): MediaItem[] => {
  console.log(`\n🔍 === SEARCHING FOR: ${optionName} = "${optionValue}" ===`);
  
  const filteredImages = mediaItems.filter(item => {
    // For shared images, check if the color matches
    if (item.metadata?.isSharedImage && optionName.toLowerCase() === 'color') {
      const matches = item.colorValue?.toLowerCase() === optionValue.toLowerCase() ||
                     item.metadata?.extractedColorName?.toLowerCase() === optionValue.toLowerCase();
      
      if (matches) {
        console.log(`   ✅ SHARED IMAGE MATCH: ${optionValue}`);
        return true;
      }
    }
    
    // For size options with shared images, return the image if it covers this size
    if (item.metadata?.isSharedImage && optionName.toLowerCase() === 'size') {
      const coversSizes = item.variantInfo?.coversSizes || [];
      const coversThisSize = coversSizes.some(size => size.toLowerCase() === optionValue.toLowerCase());
      
      if (coversThisSize) {
        console.log(`   ✅ SHARED IMAGE COVERS SIZE: ${optionValue}`);
        return true;
      }
    }
    
    // Regular variant-specific matching
    if (item.variantInfo) {
      const primaryMatch = 
        item.variantInfo.optionName?.toLowerCase() === optionName.toLowerCase() &&
        item.variantInfo.optionValues?.some(val => val.toLowerCase() === optionValue.toLowerCase());
        
      const secondaryMatch = 
        item.variantInfo.secondaryOptionName?.toLowerCase() === optionName.toLowerCase() &&
        item.variantInfo.secondaryOptionValues?.some(val => val.toLowerCase() === optionValue.toLowerCase());
        
      if (primaryMatch || secondaryMatch) {
        console.log(`   ✅ VARIANT SPECIFIC MATCH: ${optionValue}`);
        return true;
      }
    }
    
    return false;
  });
  
  console.log(`🎯 RESULT: Found ${filteredImages.length} images for ${optionName}: ${optionValue}`);
  return filteredImages;
};

  // ===== ENHANCED: GET IMAGES FOR COLOR-SIZE COMBINATION =====
  const getImagesForColorSizeCombination = (colorValue: string, sizeValue: string): MediaItem[] => {
  console.log(`\n🔍 === ENHANCED COMBINATION SEARCH ===`);
  console.log(`🎯 Looking for: Color="${colorValue}" + Size="${sizeValue}"`);
  
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
      console.log(`   ✅ COMBINATION MATCH: ${colorValue} + ${sizeValue}`);
    }
    
    return result;
  });
  
  console.log(`🎯 COMBINATION RESULT: Found ${filteredImages.length} images for ${colorValue} + ${sizeValue}`);
  return filteredImages;
};


// ===== PAYLOADCMS DATA CONVERTER =====
const convertPayloadCMSToFormData = (payloadProduct: PayloadCMSProduct): {
  designData: DesignData;
  enhancedProductData: PayloadProductData;
} => {
  console.log('🔄 Converting PayloadCMS product to form data:', payloadProduct.name);
  
  // Convert to DesignData format
  const designData: DesignData = {
    productInfo: {
      title: payloadProduct.name,
      description: payloadProduct.description,
      sku: payloadProduct.sku,
      brand: payloadProduct.brand
    },
    options: [
      // Color option
      {
        title: 'Color',
        optionValues: payloadProduct.colorOptions.map(color => color.colorName)
      },
      // Size option
      {
        title: 'Size', 
        optionValues: payloadProduct.sizeOptions.map(size => size.sizeName)
      }
    ].filter(option => option.optionValues.length > 0),
    designElements: {}, // Will be populated if design canvas data exists
    colorDetails: payloadProduct.colorOptions.map(color => ({
      name: color.colorName,
      value: color.colorHex
    })),
    printingTechnology: 'dtg', // Default from PayloadCMS data
    price: payloadProduct.pricing.suggestedRetailPrice
  };
  
  // Convert to enhanced product data format
  const enhancedProductData: PayloadProductData = {
    id: payloadProduct.id.toString(),
    cost: payloadProduct.cost,
    dimensions: {
      weight: payloadProduct.shippingInfo.weight,
      length: payloadProduct.physicalDimensions.widthInches * 2.54, // Convert inches to cm
      width: payloadProduct.physicalDimensions.heightInches * 2.54,
      height: payloadProduct.physicalDimensions.depthInches * 2.54
    },
    materials: {
      primary: payloadProduct.materials.primary,
      secondary: payloadProduct.materials.construction ? [payloadProduct.materials.construction] : []
    },
    pricing: {
      suggestedRetailPrice: payloadProduct.pricing.suggestedRetailPrice,
      markupValue: payloadProduct.pricing.markupValue,
      costBreakdown: {
        baseCost: payloadProduct.cost,
        markup: payloadProduct.pricing.markupValue,
        total: payloadProduct.pricing.suggestedRetailPrice
      }
    },
    fulfillmentSettings: {
      handlingTime: '2-3', // Default based on product type
      shippingTime: '7-10',
      provider: 'junooni'
    },
    color_Images: payloadProduct.color_Images,
    size_Images: payloadProduct.size_Images,
    material_Images: false, // Not in current PayloadCMS structure
    style_Images: false
  };
  
  console.log('✅ Converted PayloadCMS data:', {
    title: designData.productInfo.title,
    price: designData.price,
    optionsCount: designData.options.length,
    colorsCount: designData.colorDetails.length,
    imageSettings: {
      color_Images: enhancedProductData.color_Images,
      size_Images: enhancedProductData.size_Images
    }
  });
  
  return { designData, enhancedProductData };
};

// ===== UPDATED FORM POPULATION FUNCTION =====
const populateFormWithPayloadCMSData = (payloadProduct: PayloadCMSProduct) => {
  try {
    console.log('\n📄 === POPULATING FORM WITH PAYLOADCMS DATA (FIXED) ===');
    console.log('📊 PayloadCMS Product:', payloadProduct);
    
    // ===== 1. BASIC PRODUCT INFORMATION =====
    console.log('📝 Setting basic product info...');
    
    form.setValue('title', payloadProduct.name);
    form.setValue('description', payloadProduct.description);
    form.setValue('subtitle', `${payloadProduct.brand} - ${payloadProduct.productType.replace('_', ' ')}`);
    
    console.log(`✅ Set title: "${payloadProduct.name}"`);
    console.log(`✅ Set description: "${payloadProduct.description}"`);
    
    // ===== 2. PHYSICAL DIMENSIONS (CRITICAL FIX) =====
    console.log('📏 Setting physical dimensions...');
    console.log('📊 Raw PayloadCMS dimensions:', payloadProduct.physicalDimensions);
    console.log('📊 Raw PayloadCMS shipping:', payloadProduct.shippingInfo);
    
    // Convert inches to cm (1 inch = 2.54 cm)
    const widthInCm = Math.round(payloadProduct.physicalDimensions.widthInches);
    const heightInCm = Math.round(payloadProduct.physicalDimensions.heightInches);
    const lengthInCm = Math.round(payloadProduct.physicalDimensions.depthInches);
    
    // Convert shipping weight to grams (assuming it's in ounces, 1 oz = 28.35g)
    const weightInGrams = Math.round(payloadProduct.shippingInfo.weight);
    
    console.log(`🔄 Converted dimensions: ${lengthInCm}cm × ${widthInCm}cm × ${heightInCm}cm`);
    console.log(`🔄 Converted weight: ${weightInGrams}g`);
    
    // Set the form values
    form.setValue('weight', weightInGrams.toString());
    form.setValue('length', lengthInCm.toString());
    form.setValue('width', widthInCm.toString());
    form.setValue('height', heightInCm.toString());
    
    console.log(`✅ Set weight: ${weightInGrams}g`);
    console.log(`✅ Set dimensions: ${lengthInCm}×${widthInCm}×${heightInCm}cm`);
    
    // ===== 3. MATERIAL INFORMATION =====
    console.log('🧵 Setting material info...');
    console.log('📊 PayloadCMS materials:', payloadProduct.materials);
    
    const materialInfo = payloadProduct.materials.primary;
    form.setValue('material', materialInfo);
    form.setValue('origin_country', 'IN'); // Default to India
    
    console.log(`✅ Set material: "${materialInfo}"`);
    
    // ===== 4. PRICING (CRITICAL FIX) =====
    console.log('💰 Setting pricing info...');
    console.log('📊 PayloadCMS pricing:', payloadProduct.pricing);
    
    const suggestedPrice = payloadProduct.pricing.suggestedRetailPrice;
    form.setValue('defaultVariantPrice', suggestedPrice);
    
    console.log(`✅ Set price: ₹${suggestedPrice}`);
    
    // ===== 5. STATUS AND SETTINGS =====
    form.setValue('status', payloadProduct.status === 'active' ? 'published' : 'draft');
    form.setValue('discountable', true);
    
    console.log(`✅ Set status: ${payloadProduct.status === 'active' ? 'published' : 'draft'}`);
    
    // ===== 6. IMAGE SETTINGS =====
    const imageSettings = {
      color_Images: payloadProduct.color_Images,
      size_Images: payloadProduct.size_Images,
      material_Images: false,
      style_Images: false
    };
    
    console.log('🖼️ Setting PayloadCMS image settings:', imageSettings);
    setPayloadImageSettings(imageSettings);
    
    // ===== 7. OPTIONS SETUP =====
    console.log('🔧 Setting up options...');
    
    // Clear existing options first
    const currentOptions = form.getValues('options');
    for (let i = currentOptions.length - 1; i > 0; i--) {
      removeOption(i);
    }
    
    // Set up color option
    if (payloadProduct.colorOptions && payloadProduct.colorOptions.length > 0) {
      console.log(`🎨 Setting up ${payloadProduct.colorOptions.length} colors`);
      
      const colorHexValues: Record<string, string> = {};
      payloadProduct.colorOptions.forEach(color => {
        colorHexValues[color.colorName] = color.colorHex;
      });
      
      const colorOption = {
        id: generateUUID(),
        title: 'Color',
        optionValues: payloadProduct.colorOptions.map(color => color.colorName),
        imageAssociation: payloadProduct.color_Images,
        colorHexValues: colorHexValues
      };
      
      form.setValue('options.0', colorOption);
      console.log(`✅ Set color option:`, colorOption);
    }
    
    // Add size option if sizes exist
    if (payloadProduct.sizeOptions && payloadProduct.sizeOptions.length > 0) {
      console.log(`📏 Setting up ${payloadProduct.sizeOptions.length} sizes`);
      
      const sizeOption = {
        id: generateUUID(),
        title: 'Size',
        optionValues: payloadProduct.sizeOptions.map(size => size.sizeName),
        imageAssociation: payloadProduct.size_Images,
        colorHexValues: {}
      };
      
      appendOption(sizeOption);
      console.log(`✅ Set size option:`, sizeOption);
    }
    
    setHasVariants(true);
    
    // ===== 8. PRODUCT DETAILS =====
    console.log('📋 Setting product details...');
    
    // Clear existing details
    const currentDetails = form.getValues('productDetails') || [];
    for (let i = currentDetails.length - 1; i >= 0; i--) {
      removeProductDetail(i);
    }
    
    // Add PayloadCMS-based details
    const productDetails = [
      `Made with premium ${payloadProduct.materials.primary}`,
      `${payloadProduct.materials.construction} construction for superior quality`,
      `Available in ${payloadProduct.colorOptions.length} beautiful colors`,
      `Multiple sizes: ${payloadProduct.sizeOptions.map(s => s.sizeName).join(', ')}`,
      `${payloadProduct.brand} quality guarantee`
    ];
    
    productDetails.forEach(detail => {
      appendProductDetail({ id: generateUUID(), text: detail });
    });
    
    console.log(`✅ Added ${productDetails.length} product details`);
    
    // ===== 9. STORY BEHIND DESIGN =====
    const storyText = `This ${payloadProduct.name} represents our commitment to exceptional quality and timeless style. ` +
      `Expertly crafted with ${payloadProduct.materials.primary} using ${payloadProduct.materials.construction} construction, ` +
      `this piece seamlessly blends comfort with lasting durability. ` +
      `Available in ${payloadProduct.colorOptions.length} carefully selected colors and multiple sizes to perfectly suit your individual style and preferences.`;
    
    form.setValue('storyBehindDesign', storyText);
    console.log('✅ Set story behind design');
    
    // ===== 10. GENERATE VARIANTS WITH CORRECT PRICING =====
    setTimeout(() => {
      console.log('🔄 Generating variants with PayloadCMS pricing...');
      handleGenerateVariants();
      
      // Apply correct pricing to variants
      setTimeout(() => {
        const variants = form.getValues('variants');
        const correctPrice = payloadProduct.pricing.suggestedRetailPrice;
        
        console.log(`💰 Applying price ₹${correctPrice} to ${variants.length} variants`);
        
        variants.forEach((_, index) => {
          form.setValue(`variants.${index}.price`, correctPrice);
          form.setValue(`variants.${index}.stock`, 10);
        });
        
        console.log(`✅ Applied pricing ₹${correctPrice} to all variants`);
        
        // Force form update
        form.trigger();
      }, 800);
    }, 400);
    
    // ===== 11. FORCE FORM RE-RENDER =====
    setTimeout(() => {
      form.trigger();
      console.log('🔄 Triggered form validation and re-render');
    }, 1000);
    
    console.log('🎉 PayloadCMS form population completed successfully!');
    
  } catch (error) {
    console.error('❌ Error populating form with PayloadCMS data:', error);
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
    console.log('\n📄 === POPULATING FORM WITH DESIGN DATA (COMPLETE) ===');
    const settingsToUse = directImageSettings || payloadImageSettings;
    console.log('🔧 Using PayloadCMS settings:', settingsToUse);
    console.log('📊 Design Data:', data);
    console.log('📊 Product Data:', productData);
    
    // ===== 1. BASIC PRODUCT INFORMATION =====
    if (data.productInfo) {
      console.log('📝 Setting basic product info...');
      
      // Set product title
      if (data.productInfo.title) {
        form.setValue('title', data.productInfo.title);
        console.log(`✅ Set title: ${data.productInfo.title}`);
      }
      
      // Set product description
      if (data.productInfo.description) {
        form.setValue('description', data.productInfo.description);
        console.log(`✅ Set description: ${data.productInfo.description.substring(0, 100)}...`);
      }
      
      // Set brand info if available
      if (data.productInfo.brand) {
        console.log(`📱 Brand info available: ${data.productInfo.brand}`);
        // You could use this for subtitle or other fields
        form.setValue('subtitle', `By ${data.productInfo.brand}`);
      }
    }
    
    // ===== 2. PAYLOADCMS ENHANCED DATA =====
    if (productData) {
      console.log('🚀 Setting PayloadCMS enhanced data...');
      
      // Set physical dimensions
      if (productData.dimensions) {
        console.log('📏 Setting physical dimensions...');
        
        if (productData.dimensions.weight) {
          form.setValue('weight', productData.dimensions.weight.toString());
          console.log(`✅ Set weight: ${productData.dimensions.weight}g`);
        }
        
        if (productData.dimensions.length) {
          form.setValue('length', productData.dimensions.length.toString());
          console.log(`✅ Set length: ${productData.dimensions.length}cm`);
        }
        
        if (productData.dimensions.width) {
          form.setValue('width', productData.dimensions.width.toString());
          console.log(`✅ Set width: ${productData.dimensions.width}cm`);
        }
        
        if (productData.dimensions.height) {
          form.setValue('height', productData.dimensions.height.toString());
          console.log(`✅ Set height: ${productData.dimensions.height}cm`);
        }
      }
      
      // Set material information
      if (productData.materials?.primary) {
        form.setValue('material', productData.materials.primary);
        console.log(`✅ Set material: ${productData.materials.primary}`);
      }
      
      // Set pricing if available
      if (productData.pricing?.suggestedRetailPrice) {
        const price = productData.pricing.suggestedRetailPrice;
        form.setValue('defaultVariantPrice', price);
        console.log(`✅ Set default price: ₹${price}`);
      } else if (data.price) {
        form.setValue('defaultVariantPrice', data.price);
        console.log(`✅ Set price from design data: ₹${data.price}`);
      }
      
      // Set fulfillment settings
      if (productData.fulfillmentSettings) {
        if (productData.fulfillmentSettings.handlingTime) {
          form.setValue('handlingTime', productData.fulfillmentSettings.handlingTime);
          console.log(`✅ Set handling time: ${productData.fulfillmentSettings.handlingTime}`);
        }
        
        if (productData.fulfillmentSettings.shippingTime) {
          form.setValue('shippingDays', productData.fulfillmentSettings.shippingTime);
          console.log(`✅ Set shipping time: ${productData.fulfillmentSettings.shippingTime}`);
        }
      }
      
      // Set cost-based pricing if available
      if (productData.cost) {
        const basePrice = productData.cost * 2.5; // Example markup
        form.setValue('defaultVariantPrice', Math.round(basePrice));
        console.log(`✅ Set price based on cost: ₹${Math.round(basePrice)} (cost: ₹${productData.cost})`);
      }
    }
    
    // ===== 3. PRODUCT STATUS AND SETTINGS =====
    // Set default status to draft for review
    form.setValue('status', 'draft');
    form.setValue('discountable', true);
    console.log('✅ Set default status and discountable');
    
    // ===== 4. OPTIONS AND VARIANTS PROCESSING =====
    if (data.options && data.options.length > 0) {
      console.log('\n🔧 Applying PayloadCMS settings to options...');
      
      const validOptions = data.options.filter(opt => 
        opt.title && opt.optionValues && opt.optionValues.length > 0
      );
      
      validOptions.forEach((option, index) => {
        // ✅ Use the direct settings instead of state
        const shouldHaveImageAssociation = getImageAssociationForOption(option.title, settingsToUse);
        
        const enhancedOption = {
          id: generateUUID(),
          title: option.title,
          optionValues: option.optionValues,
          imageAssociation: shouldHaveImageAssociation,
          colorHexValues: {}
        };
        
        // Set color hex values for color options
        if (isColorOption(option.title) && data.colorDetails && Array.isArray(data.colorDetails)) {
          const colorHexValues: Record<string, string> = {};
          
          data.colorDetails.forEach(color => {
            if (color.name && color.value) {
              colorHexValues[color.name] = color.value;
            }
          });
          
          enhancedOption.colorHexValues = colorHexValues;
          console.log('🎨 Set color hex values:', colorHexValues);
        }
        
        if (index < form.getValues('options').length) {
          form.setValue(`options.${index}`, enhancedOption);
        } else {
          appendOption(enhancedOption);
        }
      });
      
      setHasVariants(true);
      console.log('✅ Options configured with image associations');
    }
    
    // ===== 5. ADDITIONAL METADATA =====
    // Set story behind design if available from design data
    if (data.designElements && Object.keys(data.designElements).length > 0) {
      const elementCount = Object.values(data.designElements).flat().length;
      const defaultStory = `This design features ${elementCount} unique design elements carefully crafted to create a distinctive and appealing product.`;
      form.setValue('storyBehindDesign', defaultStory);
      console.log('✅ Set default story behind design');
    }
    
    // Generate initial product details
    const initialDetails = [
      'High-quality materials and construction',
      'Unique design imported from designer tools',
      'Carefully crafted for durability and style'
    ];
    
    // Add material-specific detail if available
    if (productData?.materials?.primary) {
      initialDetails.push(`Made with premium ${productData.materials.primary.toLowerCase()}`);
    }
    
    // Clear existing details and add new ones
    const currentDetails = form.getValues('productDetails') || [];
    currentDetails.forEach((_, index) => {
      removeProductDetail(0); // Always remove from index 0
    });
    
    initialDetails.forEach(detail => {
      appendProductDetail({ id: generateUUID(), text: detail });
    });
    
    console.log('✅ Set initial product details');
    
    // ===== 6. GENERATE VARIANTS =====
    // Generate variants after setting options
    setTimeout(() => {
      handleGenerateVariants();
      
      // Apply price to variants after generation
      setTimeout(() => {
        const variants = form.getValues('variants');
        const priceToApply = productData?.pricing?.suggestedRetailPrice || 
                            productData?.cost ? Math.round(productData.cost * 2.5) : 
                            data.price || 25.00;
        
        if (variants.length > 0) {
          variants.forEach((_, index) => {
            form.setValue(`variants.${index}.price`, priceToApply);
            form.setValue(`variants.${index}.stock`, 10);
          });
          console.log(`✅ Applied price ₹${priceToApply} to ${variants.length} variants`);
        }
      }, 500);
    }, 200);
    
    console.log('✅ Form populated completely with PayloadCMS data');
    
  } catch (error) {
    console.error('❌ Error populating form:', error);
    setError('Failed to populate form with design data');
  }
};

  // ===== FALLBACK: DIRECT MOCKUP PROCESSING =====
  const processMockupImagesDirectly = async (
  mockupImages: Record<string, string>,
  designData: DesignData,
  directImageSettings?: ImageAssociationSettings
) => {
  try {
    console.log('\n🔄 === FIXED MOCKUP PROCESSING WITH DEDUPLICATION ===');
    const settingsToUse = directImageSettings || payloadImageSettings;
    console.log('📊 Settings:', settingsToUse);
    console.log('📊 Input images:', Object.keys(mockupImages).length);
    
    // 🚨 KEY FIX: Check if we need to deduplicate by color
    const shouldDeduplicateByColor = settingsToUse.color_Images && !settingsToUse.size_Images;
    
    console.log(`🔧 Strategy: ${shouldDeduplicateByColor ? 'DEDUPLICATE_BY_COLOR' : 'INDIVIDUAL_PROCESSING'}`);
    
    if (shouldDeduplicateByColor) {
      return await processSharedImagesByColor(mockupImages, designData, settingsToUse);
    } else {
      return await processIndividualImages(mockupImages, designData, settingsToUse);
    }
    
  } catch (error) {
    console.error('❌ Error in fixed mockup processing:', error);
    setError('Failed to process mockup images from designer');
  }
};

// FIX 2: New Function - Process Shared Images by Color
const processSharedImagesByColor = async (
  mockupImages: Record<string, string>,
  designData: DesignData,
  imageSettings: ImageAssociationSettings
) => {
  console.log('\n🎨 === PROCESSING SHARED IMAGES BY COLOR ===');
  
  // Step 1: Group images by color
  const imagesByColor: Record<string, { key: string; data: string; allKeys: string[] }> = {};
  
  for (const [variantKey, imageData] of Object.entries(mockupImages)) {
    if (!imageData || !imageData.startsWith('data:')) continue;
    
    // Extract color from variant key
    const extractedColor = extractColorFromVariantKey(variantKey, designData);
    console.log(`🔍 Key "${variantKey}" → Color: "${extractedColor}"`);
    
    if (!imagesByColor[extractedColor]) {
      imagesByColor[extractedColor] = {
        key: variantKey,           // Keep the first key as representative
        data: imageData,           // Keep the first image data
        allKeys: [variantKey]      // Track all keys for this color
      };
      console.log(`✅ NEW COLOR GROUP: "${extractedColor}" (representative: ${variantKey})`);
    } else {
      imagesByColor[extractedColor].allKeys.push(variantKey);
      console.log(`📌 Added to existing group "${extractedColor}": ${variantKey}`);
    }
  }
  
  console.log(`\n📊 COLOR GROUPS CREATED: ${Object.keys(imagesByColor).length}`);
  Object.entries(imagesByColor).forEach(([color, group]) => {
    console.log(`   ${color}: ${group.allKeys.length} variants (${group.allKeys.join(', ')})`);
  });
  
  // Step 2: Create one MediaItem per color
  const processedImages: MediaItem[] = [];
  let currentRank = 0;
  
  for (const [colorName, group] of Object.entries(imagesByColor)) {
    try {
      console.log(`\n🔄 Processing shared image for color: ${colorName}`);
      console.log(`📋 Representative key: ${group.key}`);
      console.log(`📋 Covers variants: ${group.allKeys.join(', ')}`);
      
      const fileName = `mockup-${colorName.toLowerCase()}-shared.png`;
      
      const processedImage = await processBase64ToFile(
        group.data,
        fileName,
        colorName
      );
      
      if (!processedImage) {
        console.error(`❌ Failed to process shared image for ${colorName}`);
        continue;
      }
      
      // Create variant info for shared image
      const variantInfo = {
        optionName: 'Color',
        optionValues: [colorName],
        // Mark as shared across sizes
        isSharedAcrossSizes: true,
        coversSizes: getSizesFromKeys(group.allKeys, designData)
      };
      
      const mediaItem: MediaItem = {
        file: processedImage.file,
        url: processedImage.url,
        rank: currentRank++,
        isNew: true,
        variantInfo: variantInfo,
        colorValue: colorName,
        metadata: {
          isSharedImage: true,
          originalVariantKey: group.key,
          sharingStrategy: 'color_specific_size_shared',
          imageHash: `shared_${colorName}`,
          extractedColorName: colorName,
          extractedSizeName: undefined, // No specific size
          payloadSettings: { ...imageSettings },
          allCoveredKeys: group.allKeys,
          
          debugInfo: {
            strategy: 'shared_by_color',
            representativeKey: group.key,
            totalVariantsCovered: group.allKeys.length,
            coveredKeys: group.allKeys
          }
        }
      };
      
      processedImages.push(mediaItem);
      
      console.log(`✅ SUCCESS: Created shared image for ${colorName}`);
      console.log(`   Covers ${group.allKeys.length} size variants`);
      console.log(`   File: ${fileName}`);
      
    } catch (error) {
      console.error(`❌ Error processing shared image for ${colorName}:`, error);
    }
  }
  
  console.log(`\n📊 SHARED PROCESSING COMPLETE:`);
  console.log(`   ✅ Colors processed: ${Object.keys(imagesByColor).length}`);
  console.log(`   ✅ Shared images created: ${processedImages.length}`);
  console.log(`   📊 Total input variants: ${Object.keys(mockupImages).length}`);
  
  if (processedImages.length > 0) {
    setMediaItems(processedImages);
    setTimeout(() => setActiveImageTab('upload'), 100);
    
    // Debug final result
    console.log('\n🔍 FINAL SHARED IMAGES:');
    processedImages.forEach((item, index) => {
      console.log(`${index + 1}. Color: ${item.colorValue}`);
      console.log(`   File: ${item.file?.name}`);
      console.log(`   Covers: ${item.metadata?.allCoveredKeys?.join(', ')}`);
      console.log(`   IsShared: ${item.metadata?.isSharedImage}`);
    });
  } else {
    setError('Failed to create any shared images. Check console for details.');
  }
};



const extractColorFromVariantKey = (variantKey: string, designData: DesignData): string => {
  console.log(`🎨 Extracting color from: "${variantKey}"`);
  
  const colorMatcher = createColorMatcher(designData);
  return colorMatcher.matchColor(variantKey);
};

// FIX 4: Helper Function - Get All Sizes from Keys
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
  console.log('\n🔄 === PROCESSING INDIVIDUAL IMAGES ===');
  
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
      console.error(`❌ Error processing ${variantKey}:`, error);
    }
  }
  
  console.log(`📊 Individual processing complete: ${processedImages.length} images`);
  
  setMediaItems(processedImages);
  setTimeout(() => setActiveImageTab('upload'), 100);
};

  // ===== ENHANCED VARIANT KEY PARSING =====
  const parseVariantKeyEnhanced = (variantKey: string, designData: DesignData) => {
  console.log(`🔍 ENHANCED PARSING: "${variantKey}"`);
  
  // Split by underscores AND hyphens
  const parts = variantKey.split(/[-_]+/).filter(part => part.length > 0);
  console.log(`📋 Split parts: [${parts.join(', ')}]`);
  
  let colorName = 'Unknown';
  let sizeName: string | undefined = undefined;
  
  // Create color matcher for this design data
  const colorMatcher = createColorMatcher(designData);
  
  // Get available options from design data
  const sizeOption = designData.options?.find(opt => 
    opt.title.toLowerCase().includes('size')
  );
  
  console.log('Available options:', {
    colors: colorMatcher.getAllColorNames(),
    sizes: sizeOption?.optionValues || []
  });
  
  // Strategy 1: Match each part against known values
  for (const part of parts) {
    const partLower = part.toLowerCase();
    console.log(`🔍 Checking part: "${part}" (${partLower})`);
    
    // Check if this part matches a color (using dynamic matcher)
    const matchedColor = colorMatcher.matchColor(part);
    if (matchedColor !== 'Unknown') {
      colorName = matchedColor;
      console.log(`🎨 Found color: ${colorName}`);
    }
    
    // Check if this part matches a size (case-insensitive) 
    if (sizeOption?.optionValues) {
      const matchingSize = sizeOption.optionValues.find(size => 
        size.toLowerCase() === partLower
      );
      if (matchingSize) {
        sizeName = matchingSize;
        console.log(`📏 Found size: ${sizeName}`);
      }
    }
  }
  
  // Strategy 2: Use full variant key for color matching if no part matched
  if (colorName === 'Unknown') {
    colorName = colorMatcher.matchColor(variantKey);
    console.log(`🎨 Full key color match: ${colorName}`);
  }
  
  // Strategy 3: Enhanced size pattern matching
  if (!sizeName && sizeOption?.optionValues) {
    // Look for size patterns in the full key
    for (const size of sizeOption.optionValues) {
      const sizeLower = size.toLowerCase();
      if (variantKey.toLowerCase().includes(`_${sizeLower}_`) || 
          variantKey.toLowerCase().includes(`_${sizeLower}`) ||
          variantKey.toLowerCase().endsWith(`_${sizeLower}`) ||
          variantKey.toLowerCase().includes(`-${sizeLower}-`) ||
          variantKey.toLowerCase().includes(`-${sizeLower}`) ||
          variantKey.toLowerCase().endsWith(`-${sizeLower}`)) {
        sizeName = size;
        console.log(`📏 Pattern match size: ${sizeName}`);
        break;
      }
    }
  }
  
  console.log(`✅ FINAL PARSED RESULT: Color="${colorName}", Size="${sizeName || 'none'}"`);
  return { colorName, sizeName };
};

  // ===== VARIANT GENERATION =====
  const handleGenerateVariants = useCallback(() => {
    const currentOptions = form.getValues('options');
    
    // Filter out options without name or values
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
      
      // Preserve existing variant data (prices, stock, etc.) where possible
      const variantsWithExistingData = newVariants.map(newVariant => {
        // Try to find an existing variant with the same option values
        const existingVariant = currentVariants.find(existing => {
          // Skip if lengths don't match or if optionValues is not an array
          if (!existing.optionValues || 
              !Array.isArray(existing.optionValues) || 
              existing.optionValues.length !== newVariant.optionValues.length) return false;
          
          // Check if all option values match
          const allValuesMatch = newVariant.optionValues.every(newOptVal => 
            existing.optionValues.some(existingOptVal => 
              existingOptVal.optionName === newOptVal.optionName && 
              existingOptVal.value === newOptVal.value
            )
          );
          
          return allValuesMatch;
        });
        
        if (existingVariant) {
          // Keep existing data but update title and optionValues
          return {
            ...existingVariant,
            title: newVariant.title, // Use consistent title format
            optionValues: newVariant.optionValues.map(newOptVal => {
              // Find matching existing option value to preserve optionId
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
        
        // For new variants, use the generated unique SKU and other default values
        return newVariant;
      });
      
      // Replace variants in the form
      replaceVariants(variantsWithExistingData);
    } else {
      // If there are no valid options, clear the variants
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
        // Create new media items with proper metadata
        const newMedia = Array.from(e.target.files).map((file, index) => {
          const mediaItem: MediaItem = {
            file,
            url: URL.createObjectURL(file),
            rank: mediaItems.length + index,
            isNew: true
          };
          
          // Add simplified variantInfo to avoid complex objects
          if (variantInfo) {
            if (variantInfo.variantId) {
              // For variant-specific uploads, just store ID
              mediaItem.variantInfo = {
                variantId: variantInfo.variantId
              };
            } else if (variantInfo.optionName && variantInfo.optionValues?.[0]) {
              // For option-specific uploads, just store name and first value
              mediaItem.variantInfo = {
                optionName: variantInfo.optionName,
                optionValues: [variantInfo.optionValues[0]]
              };
              
              // CRITICAL FIX: Set colorValue for color options
              if (isColorOption(variantInfo.optionName)) {
                mediaItem.colorValue = variantInfo.optionValues[0];
                console.log(`Setting colorValue to: ${variantInfo.optionValues[0]} for option: ${variantInfo.optionName}`);
              }
            }
          }
          
          return mediaItem;
        });
        
        setMediaItems((prev) => [...prev, ...newMedia]);
        
        // Clear the file input
        if (e.target) {
          e.target.value = '';
        }
      }
    } catch (error) {
      // Clear the file input on error
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
      // DYNAMIC: Use PayloadCMS settings instead of hardcoded imageAssociation
      shouldOptionHaveImages(opt.title, payloadImageSettings)
    );
  };
  
  // State for options that have image associations
  const [imageAssociatedOptions, setImageAssociatedOptions] = useState<Option[]>([]);
  
  // Update imageAssociatedOptions when options change
  useEffect(() => {
    const subscription = form.watch((formValues, { name, type }) => {
      if (name && (name.includes('options') || name.includes('imageAssociation'))) {
        const newImageAssociatedOptions = getImageAssociatedOptions();
        setImageAssociatedOptions(newImageAssociatedOptions);
        
        console.log('🔄 Image associated options updated:', 
          newImageAssociatedOptions.map(opt => `${opt.title}(${opt.imageAssociation})`));
      }
    });
    
    // Also update when PayloadCMS settings change
    setImageAssociatedOptions(getImageAssociatedOptions());
    
    return () => subscription.unsubscribe();
  }, [form, payloadImageSettings]);


useEffect(() => {
  // Prevent unwanted option fields from appearing
  const currentOptions = form.getValues('options');
  
  // Only keep valid options (with titles and values)
  const validOptions = currentOptions.filter(opt => 
    opt.title && opt.title.trim() !== '' && 
    opt.optionValues && 
    Array.isArray(opt.optionValues) && 
    opt.optionValues.length > 0
  );
  
  // If we have more options than valid ones, remove the extras
  if (currentOptions.length > validOptions.length + 1) {
    console.log('🧹 Cleaning up extra option fields...');
    
    // Remove extra options from the end
    for (let i = currentOptions.length - 1; i > validOptions.length; i--) {
      removeOption(i);
    }
  }
  
  // Ensure we don't have more than 3 options total
  if (currentOptions.length > 3) {
    for (let i = currentOptions.length - 1; i >= 3; i--) {
      removeOption(i);
    }
  }
}, [form.watch('options')]);

  
  // ===== DEBUGGING AND MONITORING =====
  const debugImageAssociations = () => {
    console.log('\n🐛 === IMAGE ASSOCIATION DEBUG ===');
    console.log('📊 Current state:', {
      mediaItemsCount: mediaItems.length,
      payloadSettings: payloadImageSettings,
      hasVariants: hasVariants,
      imageAssociatedOptions: getImageAssociatedOptions().length
    });
    
    console.log('\n📋 Media Items Details:');
    mediaItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.url?.substring(0, 30)}...`);
      console.log(`      Variant Info:`, item.variantInfo);
      console.log(`      Color Value: ${item.colorValue || 'none'}`);
      console.log(`      Metadata:`, {
        extractedColorName: item.metadata?.extractedColorName,
        extractedSizeName: item.metadata?.extractedSizeName,
        sharingStrategy: item.metadata?.sharingStrategy,
        isSharedImage: item.metadata?.isSharedImage
      });
    });
    
    console.log('\n🔗 Image Associated Options:');
    getImageAssociatedOptions().forEach(opt => {
      console.log(`   - ${opt.title}: ${opt.optionValues.join(', ')}`);
      console.log(`     Image Association: ${opt.imageAssociation}`);
    });
  };

  const testImageFiltering = () => {
    console.log('\n🧪 === TESTING IMAGE FILTERING ===');
    
    const options = form.getValues('options');
    options.forEach(option => {
      if (getImageAssociationForOption(option.title, payloadImageSettings)) {
        console.log(`\n🔍 Testing option: ${option.title}`);
        
        option.optionValues.forEach(value => {
          const images = getImagesForOptionValue(option.title, value);
          console.log(`   ${option.title}="${value}": ${images.length} images found`);
          
          images.forEach(img => {
            console.log(`      - ${img.metadata?.extractedColorName || 'unknown'} ${img.metadata?.extractedSizeName ? `+ ${img.metadata.extractedSizeName}` : '(shared)'}`);
          });
        });
      }
    });
    
    // Test color+size combinations if both are enabled
    if (payloadImageSettings.color_Images && payloadImageSettings.size_Images) {
      console.log('\n🎯 Testing color+size combinations:');
      
      const colorOption = options.find(opt => isColorOption(opt.title));
      const sizeOption = options.find(opt => isSizeOption(opt.title.toLowerCase()));
      
      if (colorOption && sizeOption) {
        colorOption.optionValues.forEach(color => {
          sizeOption.optionValues.forEach(size => {
            const images = getImagesForColorSizeCombination(color, size);
            console.log(`   ${color} + ${size}: ${images.length} images`);
          });
        });
      }
    }
  };

  useEffect(() => {
  if (mediaItems.length > 0) {
    console.log('🔧 MediaItems updated, running debug...');
    debugImageAssociations();
    
    // ✅ Test color+size combinations specifically
    if (payloadImageSettings.color_Images && payloadImageSettings.size_Images) {
      console.log('🧪 Testing color+size combinations...');
      testImageFiltering();
    }
  }
}, [mediaItems, payloadImageSettings]);

  // ===== ADDITIONAL HELPER FUNCTIONS =====
  
  // Add a new option value for a specific option
  const handleAddOptionValue = (optionIndex: number) => {
    const value = newOptionValues[optionIndex];
    if (!value || value.trim() === '') return;
    
    const currentOptions = form.getValues('options');
    const currentOption = currentOptions[optionIndex];
    
    // Get current option values (ensure it's an array)
    const currentValues = Array.isArray(currentOption.optionValues) 
      ? currentOption.optionValues 
      : [];
    
    // Add the new value to the option's values if it doesn't already exist
    if (!currentValues.includes(value)) {
      const updatedValues = [...currentValues, value];
      
      // Update the option in the form
      updateOption(optionIndex, {
        ...currentOption,
        optionValues: updatedValues
      });
      
      // Clear the input for this option
      const updatedNewValues = { ...newOptionValues };
      updatedNewValues[optionIndex] = '';
      setNewOptionValues(updatedNewValues);
      
      // Generate variants after adding a new option value
      handleGenerateVariants();
    }
  };

  // Handle change in new option value input
  const handleNewOptionValueChange = (optionIndex: number, value: string) => {
    setNewOptionValues(prev => ({
      ...prev,
      [optionIndex]: value
    }));
  };

  // Update a specific variant field
  const handleVariantFieldChange = (variantIndex: number, field: string, value: any) => {
    const currentVariants = form.getValues('variants');
    const currentVariant = currentVariants[variantIndex];
    
    // Create a deep copy to ensure nested objects are updated properly
    const updatedVariant = JSON.parse(JSON.stringify(currentVariant));
    updatedVariant[field] = value;
    
    updateVariant(variantIndex, updatedVariant);
  };

  // Handle bulk edit of variants
  const handleBulkEdit = (field: string, value: any) => {
    if (!selectedVariants.length) return;
    
    const currentVariants = form.getValues('variants');
    
    // Update each selected variant
    selectedVariants.forEach(variantId => {
      const variantIndex = currentVariants.findIndex(v => v.id === variantId);
      if (variantIndex !== -1) {
        handleVariantFieldChange(variantIndex, field, value);
      }
    });
    
    // Clear bulk edit values after applying
    if (field === 'price') setBulkPrice('');
    if (field === 'stock') setBulkStock('');
  };

  // Handle selecting all variants
  const handleSelectAllVariants = (checked: boolean) => {
    if (checked) {
      // Select all variants
      const allVariantIds = form.getValues('variants').map(v => v.id);
      setSelectedVariants(allVariantIds);
    } else {
      // Deselect all
      setSelectedVariants([]);
    }
  };

  // Toggle selection of a specific variant
  const handleToggleVariantSelection = (variantId: string) => {
    setSelectedVariants(prev => {
      if (prev.includes(variantId)) {
        return prev.filter(id => id !== variantId);
      } else {
        return [...prev, variantId];
      }
    });
  };

  // Duplicate a variant
  const handleDuplicateVariant = (variantIndex: number) => {
    const currentVariants = form.getValues('variants');
    const variantToDuplicate = currentVariants[variantIndex];
    
    // Create a new copy with a new ID and unique SKU
    const newVariant = {
      ...JSON.parse(JSON.stringify(variantToDuplicate)),
      id: generateUUID(),
      sku: generateUniqueSku(`${variantToDuplicate.title}-copy`),
      title: `${variantToDuplicate.title} (Copy)`
    };
    
    // Insert after the original
    const updatedVariants = [...currentVariants];
    updatedVariants.splice(variantIndex + 1, 0, newVariant);
    
    replaceVariants(updatedVariants);
  };

  // Get all images associated with a variant (both direct and via option values)
  const getVariantAssociatedImages = (variant: Variant, mediaItems: MediaItem[]): {id: string, url: string}[] => {
    if (!variant.optionValues || !Array.isArray(variant.optionValues)) {
      return [];
    }
    
    const associatedImages: {id: string, url: string}[] = [];
    
    // First, check for direct variant-specific images
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
    
    // Next, check each option value for associated images
    variant.optionValues.forEach(optVal => {
      const optionValueImages = mediaItems.filter(item => {
        // Add case-insensitive comparison here
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

  // Add new product detail bullet point
  const handleAddProductDetail = () => {
    appendProductDetail({ id: generateUUID(), text: '' });
  };

  // Trigger the hidden file input when clicking the dropzone.
  const handleDropzoneClick = (e: React.MouseEvent) => {
    // Prevent form submission
    e.preventDefault();
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle adding a new image via URL
  const handleAddImageUrl = (e: React.MouseEvent) => {
    // Prevent form submission
    e.preventDefault();
    
    if (!newImageUrl.trim()) return;
    
    // Basic URL validation
    try {
      new URL(newImageUrl); // Will throw if not a valid URL
      
      // Add to media items
      setMediaItems((prev) => [
        ...prev,
        {
          file: undefined,
          url: newImageUrl,
          rank: prev.length,
          isNew: true
        }
      ]);
      
      // Clear the input
      setNewImageUrl('');
      
    } catch (error) {
      setError('Please enter a valid URL');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Close success message and reset the form
  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate({ to: '/productCatalog' }); // Always go to catalog for new products
  };

  // ===== EFFECTS FOR MONITORING CHANGES =====
  // Monitor option changes to update variants and detect color options
  // ===== SIMPLE FIX FOR OPTION 3 POPUP ISSUE =====

// 1. FIND this useEffect in your code and REPLACE it completely:
// This is the problematic useEffect that's causing the issue

// REMOVE/REPLACE this entire useEffect:
useEffect(() => {
  const subscription = form.watch((formValues, { name, type }) => {
    // ❌ PROBLEM: This watches ALL form changes including title
    // ❌ PROBLEM: This creates new options when typing in ANY field
    if (name && (name.includes('options') || name.includes('title'))) {
      // ... problematic code
    }
  });
  return () => subscription.unsubscribe();
}, [appendOption, form, handleGenerateVariants]);

// 2. REPLACE with this FIXED version:
useEffect(() => {
  const subscription = form.watch((formValues, { name, type }) => {
    // ✅ FIX: ONLY watch for option value changes, NOT title or other fields
    if (name && 
        name.startsWith('options.') && 
        name.includes('optionValues') && 
        type === 'change') {
      
      console.log('🔧 Option values changed:', name);
      
      const currentOptions = form.getValues('options');
      
      // Only add new option if we have exactly 1 complete option and need a 2nd one
      if (currentOptions.length === 1) {
        const firstOption = currentOptions[0];
        const hasTitle = firstOption?.title && firstOption.title.trim() !== '';
        const hasValues = firstOption?.optionValues && 
                         Array.isArray(firstOption.optionValues) && 
                         firstOption.optionValues.length > 0;
        
        if (hasTitle && hasValues) {
          console.log('✅ Adding second option slot');
          appendOption({ 
            id: generateUUID(),
            title: '', 
            optionValues: [],
            imageAssociation: false
          });
        }
      }
      
      // Regenerate variants after option changes
      setTimeout(() => {
        handleGenerateVariants();
      }, 300);
    }
  });
  
  return () => subscription.unsubscribe();
}, [appendOption, form, handleGenerateVariants]);

  // Initialize default option values state
  useEffect(() => {
    const initialOptionValues: Record<number, string> = {};
    optionFields.forEach((_, index) => {
      initialOptionValues[index] = '';
    });
    setNewOptionValues(initialOptionValues);
  }, [optionFields.length]);

  // Cleanup any object URLs for newly added files when unmounting.
  useEffect(() => {
    return () => {
      mediaItems.forEach((item) => {
        if (item.file) URL.revokeObjectURL(item.url);
      });
    };
  }, []);

  // Fetch categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      setCategoryError(null);
      try {
        // Get the response from your fetchCategories function
        const response = await fetchCategories();
        
        if (!response) {
          throw new Error('Failed to fetch categories');
        }
        
        // Parse the response JSON
        const jsonData = await response.json();
        
        if (jsonData && jsonData.product_categories) {
          setProductCategories(jsonData.product_categories);
        } else {
          // Handle unexpected response format
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

  // ===== FORM SUBMISSION =====
const onSubmit = async (values: ProductFormValues) => {
  if (!values.title.trim()) {
    setError('Product title is required');
    return;
  }
  
  setIsSubmitting(true);
  setError(null);
  
  try {
    console.log("🚀 === ENHANCED: UPLOAD RAW DESIGN + MOCKUP IMAGES ===");
    
    // ✅ STEP 1: Upload ALL images (both design and mockup)
    const productImages: Array<{id: string, url: string, alt?: string}> = [];
    const imageIdToUrlMap: Record<string, string> = {};
    
    // 🔥 NEW: Separate design images from mockup images
    const rawDesignImages = mediaItems.filter(item => item.metadata?.isRawDesignImage);
    const mockupImages = mediaItems.filter(item => !item.metadata?.isRawDesignImage);
    
    console.log(`📊 Image categorization:`);
    console.log(`   Raw design images: ${rawDesignImages.length}`);
    console.log(`   Mockup images: ${mockupImages.length}`);
    console.log(`   Total images: ${mediaItems.length}`);
    
    if (mediaItems.length > 0) {
      try {
        const sortedMediaItems = [...mediaItems].sort((a, b) => a.rank - b.rank);
        
        // Validate all items have files
        const invalidItems = sortedMediaItems.filter(item => !item.file);
        if (invalidItems.length > 0) {
          throw new Error(`${invalidItems.length} images missing file data`);
        }
        
        console.log(`✅ All ${sortedMediaItems.length} images validated for upload`);
        
        // Upload each image with proper categorization
        for (const [index, item] of sortedMediaItems.entries()) {
          const imageType = item.metadata?.isRawDesignImage ? 'DESIGN' : 'MOCKUP';
          console.log(`\n📤 Uploading ${imageType} ${index + 1}/${sortedMediaItems.length}: ${item.file.name}`);
          
          const formData = new FormData();
          formData.append('files', item.file);
          
          const uploadResult = await uploadProductImage({
            productId: '',
            formData: formData,
            multiple: false
          });
          
          if (!uploadResult || !('id' in uploadResult) || !('url' in uploadResult)) {
            throw new Error(`Invalid upload response for ${item.file.name}`);
          }
          
          // Store upload result with proper alt text
          const altText = item.metadata?.isRawDesignImage 
            ? `Design: ${item.metadata.originalFileName} (${item.metadata.designArea})`
            : `Mockup: ${item.colorValue || 'Product'}`;
            
          productImages.push({
            id: uploadResult.id,
            url: uploadResult.url,
            alt: altText
          });
          
          item.id = uploadResult.id;
          item.url = uploadResult.url;
          imageIdToUrlMap[uploadResult.id] = uploadResult.url;
          
          console.log(`✅ ${imageType} uploaded: ${uploadResult.id}`);
        }
        
        console.log(`\n🎉 All images uploaded successfully!`);
        console.log(`   📊 Total: ${productImages.length} images`);
        console.log(`   🖼️ Design: ${rawDesignImages.length} images`);
        console.log(`   🎨 Mockup: ${mockupImages.length} images`);
        
      } catch (uploadError: any) {
        console.error('❌ Image upload failed:', uploadError);
        setError(`Failed to upload images: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
    }

    // ✅ Continue with rest of product creation...
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

      console.log('🖼️ Using PayloadCMS Image Association Settings:', imageAssociationSettings);

      // Declare validOptions in the outer scope
      let validOptions: any[] = [];
      let options: any[] = [];
      let variants: any[] = [];
      
      // STEP 2: Process options and variants
      if (hasVariants && formValues.options.length > 0) {
        console.log("📋 Processing with variants and metadata...");
        
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
        
        // STEP 3: Process variants with complete metadata
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

          // STEP 4: CREATE VARIANT METADATA WITH IMAGE ASSOCIATIONS
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
                return `http://localhost:9000/static/${item.id}`;
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

          // METADATA KEY 3: color_images (array of color objects) - DYNAMIC based on PayloadCMS
          const colorImages: any[] = [];
          
          // METADATA KEY 4: option_images (array of all option objects) - DYNAMIC based on PayloadCMS
          const allOptionImages: any[] = [];

          if (variant.optionValues) {
            variant.optionValues.forEach(optVal => {
              // Check if this option type should have images based on PayloadCMS
              const shouldHaveImages = shouldOptionHaveImages(optVal.optionName, payloadImageSettings);

              
              if (!shouldHaveImages) {
                console.log(`⏭️ Skipping image processing for "${optVal.optionName}" (not enabled in PayloadCMS)`);
                return;
              }
              
              console.log(`🖼️ Processing images for "${optVal.optionName}: ${optVal.value}" (enabled in PayloadCMS)`);
              
              // Get images associated with this option value
              const optionSpecificImages = mediaItems.filter(item => 
                item.variantInfo?.optionName && 
                item.variantInfo.optionName.toLowerCase() === optVal.optionName.toLowerCase() && 
                item.variantInfo?.optionValues?.includes(optVal.value) &&
                item.url
              );
              
              optionSpecificImages.forEach(item => {
                let url = item.url;
                if (url.startsWith('blob:') && item.id) {
                  url = `http://localhost:9000/static/${item.id}`;
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
            console.log(`🎨 Added color_images for variant ${variant.title}:`, colorImages);
          }

          // Add option_images metadata for all enabled option types
          if (allOptionImages.length > 0) {
            variantMetadata.option_images = JSON.stringify(allOptionImages);
            console.log(`📊 Added option_images for variant ${variant.title}:`, allOptionImages);
          }

          // STEP 5: Return formatted variant with complete metadata
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
        console.log("📋 Creating default options and variants (no metadata)...");
        
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
      
      // STEP 6: Prepare main product metadata
      const productMetadata: Record<string, any> = {};
      
      // Add fulfillment information
      if (formValues.handlingTime?.trim()) {
        const fulfillmentData = {
          type: "Junooni-fulfilment",
          handling_time: formValues.handlingTime.trim(),
          shipping_time: formValues.shippingDays?.trim() || '7-10'
        };
        productMetadata.fulfillment_type = JSON.stringify(fulfillmentData);
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
      
      // Add image association settings - now validOptions is accessible
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

      // STEP 7: Create final product object
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
        metadata: productMetadata
      };
      
      // STEP 8: Validation
      if (!product.options || product.options.length === 0) {
        throw new Error("CRITICAL ERROR: Options array is empty");
      }
      
      if (!product.variants || product.variants.length === 0) {
        throw new Error("CRITICAL ERROR: Variants array is empty");
      }

      console.log("=== COMPLETE PRODUCT WITH METADATA ===");
      console.log("Product:", JSON.stringify(product, null, 2));
      console.log("Variant metadata sample:", variants[0]?.metadata);
      
      // STEP 9: Create product
      const result = await createProduct({ product });
      
      console.log("✅ Product with complete metadata created successfully:", result);
      
      if (result && result.id) {
        setCreatedProductId(result.id);
        
        // Handle inventory creation
        setTimeout(async () => {
          try {
            const completeProduct = await fetchProduct({ id: result.id });
            
            if (completeProduct && completeProduct.variants) {
              const inventoryCreations = [];
              
              for (const variant of completeProduct.variants) {
                if (variant.inventory_items && Array.isArray(variant.inventory_items) && variant.inventory_items.length > 0) {
                  const inventoryItemId = variant.inventory_items[0].inventory_item_id;
                  
                  if (inventoryItemId) {
                    const formVariant = variants.find(v => v.title === variant.title) || variants[0];
                    const stockQuantity = parseInt(String(formVariant?.stock || '0'));
                    
                    inventoryCreations.push({
                      inventory_item_id: inventoryItemId,
                      location_id: defaultLocationId,
                      stocked_quantity: stockQuantity,
                      incoming_quantity: 0
                    });
                  }
                }
              }
              
              if (inventoryCreations.length > 0) {
                await batchUpdateInventoryLevels({ create: inventoryCreations });
                console.log("✅ Inventory levels created successfully");
              }
            }
          } catch (inventoryError) {
            console.error("Failed to create inventory levels:", inventoryError);
          }
        }, 2000);
        
        setShowSuccess(true);
      }
      
    } catch (error: any) {
      console.error("❌ Product creation with metadata failed:", error);
      
      if (error.response?.data) {
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                          <SelectItem value="published">
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
                  
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-gray-700">Length(inches)</FormLabel>
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
                          <FormLabel className="font-medium text-gray-700">Width(inches)</FormLabel>
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
                          <FormLabel className="font-medium text-gray-700">Height(inches)</FormLabel>
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
};

export default Create;