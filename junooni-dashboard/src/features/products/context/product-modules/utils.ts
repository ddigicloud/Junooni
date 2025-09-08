// ../context/product-components/utils.ts

import { Option, Variant, VariantOptionValue, MediaItem } from './types';

// Helper function to determine which option type is a color option
export const isColorOption = (optionTitle: string): boolean => {
  if (!optionTitle) return false;
  const normalizedTitle = optionTitle.toLowerCase();
  return normalizedTitle === 'color' || normalizedTitle === 'colour';
};

// Generate a random UUID
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Generate a unique SKU with timestamp to avoid duplicates
export function generateUniqueSku(baseName: string): string {
  // Get current timestamp in milliseconds
  const timestamp = new Date().getTime();

  // Replace non-alphanumeric chars with hyphens and make lowercase
  const cleanName = baseName.replace(/[^A-Z0-9]/ig, '-').toLowerCase();

  // Add timestamp to ensure uniqueness
  return `JUNI-${cleanName}-${timestamp}`;
}

// Generate all possible variant combinations (Cartesian product) from options
export function generateVariantsFromOptions(options: any[]): Variant[] {
  if (!options.length) return [];

  // Helper function for the Cartesian product
  const cartesian = (arrays: any[][]) => {
    return arrays.reduce(
      (results, current) => {
        return results
          .map(result => current.map(item => [...result, item]))
          .reduce((subResults, slice) => [...subResults, ...slice], []);
      },
      [[]]
    );
  };

  // Extract value arrays from each option
  const valueArrays = options.map(opt => opt.optionValues);

  // Generate all combinations of values
  const combinations = cartesian(valueArrays);

  // Map combinations to variant objects
  return combinations.map(combo => {
    // Create option value objects for each value in the combination
    const optionValues = combo.map((value: string, index: number) => ({
      optionId: options[index].optionId,
      optionName: options[index].optionName,
      value: value
    }));
    
    // Create variant title (e.g. "Small / Red / Cotton")
    const title = optionValues.map((opt: VariantOptionValue) => opt.value).join(' / ');
    
    // Create unique SKU with timestamp to avoid duplicates
    const sku = generateUniqueSku(title);
    
    return {
      id: generateUUID(),
      title,
      price: 0,
      compareAtPrice: 0,
      stock: 0,
      sku,
      allowBackorder: false,
      manageInventory: true,
      optionValues,
    };
  });
}

// Get images associated with a specific option value
export const getOptionValueImages = (
  optionName: string, 
  optionValue: string, 
  mediaItems: MediaItem[]
): MediaItem[] => {
  if (!optionName || !optionValue || !mediaItems || !Array.isArray(mediaItems)) return [];
  
  return mediaItems.filter(item => {
    // Check for option-based matches
    if (item.variantInfo?.optionName === optionName && 
        item.variantInfo?.optionValues && 
        Array.isArray(item.variantInfo.optionValues) &&
        item.variantInfo.optionValues.includes(optionValue)) {
      return true;
    }
    
    // Check for color-specific matches (legacy)
    if (item.colorValue === optionValue && 
        (optionName.toLowerCase() === 'color' || optionName.toLowerCase() === 'colour')) {
      return true;
    }
    
    return false;
  });
};

// Prepare variant image metadata for the API
export const prepareVariantImageMetadata = (
  options: Option[], 
  mediaItems: MediaItem[]
): Record<string, any> => {
  const metadata: Record<string, any> = {};
  
  try {
    // Find images with variant info
    const associatedImages = mediaItems.filter(item => item.variantInfo);
    
    if (associatedImages.length > 0) {
      // For option-specific images (non-variant)
      const imagesByOption: Record<string, Record<string, string>> = {};
      
      associatedImages.forEach(item => {
        if (item.variantInfo?.optionName && item.variantInfo?.optionValues?.[0]) {
          const optName = item.variantInfo.optionName;
          const optValue = item.variantInfo.optionValues[0];
          
          if (!imagesByOption[optName]) {
            imagesByOption[optName] = {};
          }
          
          // Only store one image per option/value - simpler structure
          imagesByOption[optName][optValue] = item.url;
        }
      });
      
      if (Object.keys(imagesByOption).length > 0) {
        metadata.option_images = JSON.stringify(imagesByOption);
      }
      
      // For variant-specific images, use even simpler approach
      const variantImages: Record<string, string> = {};
      
      associatedImages.forEach(item => {
        if (item.variantInfo?.variantId) {
          // Just store one image per variant ID - keeps it ultra simple
          variantImages[item.variantInfo.variantId] = item.url;
        }
      });
      
      if (Object.keys(variantImages).length > 0) {
        metadata.variant_images = JSON.stringify(variantImages);
      }
    }
  } catch (err) {
    console.error("Error preparing variant image metadata:", err);
    // Fail gracefully - return empty metadata
  }
  
  return metadata;
};

// Get color images metadata for a variant
export function getColorImagesMetadata(variant: Variant, mediaItems: MediaItem[]): any[] {
  // Add proper null/undefined checks
  const colorOption = variant.optionValues.find(opt => 
    opt.optionName && isColorOption(opt.optionName)
  );
  
  if (!colorOption || !colorOption.optionName) return [];
  
  const colorImages = getOptionValueImages(colorOption.optionName, colorOption.value, mediaItems)
    .map(img => ({ url: img.url, color: colorOption.value }));
    
  return colorImages;
}