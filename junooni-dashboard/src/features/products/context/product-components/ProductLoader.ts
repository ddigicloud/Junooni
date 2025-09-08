// ../context/product-components/ProductLoader.ts
import { fetchProduct, fetchInventoryLevels } from '../fetchApi';
import { 
  MediaItem, 
  Option, 
  Variant,
  ProductDetail,
  ProductFormValues,
  OptionValue
} from '../product-modules/types';
import { generateUUID, isColorOption } from '../product-modules/utils';

// Define the storefront domain for product view links
export const STOREFRONT_DOMAIN = 'https://www.junooni.com';

// Parse fulfillment data from JSON string
export const parseFulfillmentData = (dataString: string) => {
  try {
    if (!dataString) return null;
    
    // Try to parse the JSON array
    let parsedData: any[] = [];
    try {
      parsedData = JSON.parse(dataString);
    } catch (e) {
      console.error("Failed to parse fulfillment_data JSON:", e);
      return null;
    }
    
    // Convert array of objects into a single object
    const result: any = {};
    if (Array.isArray(parsedData)) {
      parsedData.forEach(item => {
        const key = Object.keys(item)[0];
        if (key) {
          result[key] = item[key];
        }
      });
    }
    
    return result;
  } catch (e) {
    console.error("Error parsing fulfillment data:", e);
    return null;
  }
};

// Parse color images from variant metadata
export const parseColorImagesFromVariant = (variant: any): MediaItem[] => {
  try {
    if (!variant.metadata || !variant.metadata.color_images) return [];
    
    // Try to parse color_images from metadata
    let colorImages = [];
    try {
      colorImages = typeof variant.metadata.color_images === 'string' 
        ? JSON.parse(variant.metadata.color_images) 
        : variant.metadata.color_images;
    } catch (e) {
      console.error("Failed to parse color_images from variant:", e);
      return [];
    }
    
    if (!Array.isArray(colorImages)) return [];
    
    // Convert to MediaItem format
    return colorImages.map((img: any, index: number) => ({
      file: null,
      url: img.url,
      rank: 1000 + index, // Set high rank to position after regular images
      id: `color-${variant.id}-${index}`,
      colorValue: img.color,
      isVariantImage: true,
      variantId: variant.id
    }));
  } catch (e) {
    console.error("Error parsing color images:", e);
    return [];
  }
};

// Helper function to ensure all option values are correctly added to the options
export const addMissingOptionValues = (options: Option[], variants: Variant[]): Option[] => {
  // Create map of option title to array of values
  const optionValuesMap: Record<string, Set<string>> = {};
  
  // Initialize map with existing option values
  options.forEach(opt => {
    optionValuesMap[opt.title] = new Set(opt.optionValues);
  });
  
  // Add any missing values from variants
  variants.forEach(variant => {
    if (variant.optionValues && Array.isArray(variant.optionValues)) {
      variant.optionValues.forEach(optVal => {
        if (optVal.optionName && optVal.value) {
          if (!optionValuesMap[optVal.optionName]) {
            optionValuesMap[optVal.optionName] = new Set<string>();
          }
          optionValuesMap[optVal.optionName].add(optVal.value);
        }
      });
    }
  });
  
  // Update options with complete value lists
  return options.map(opt => ({
    ...opt,
    optionValues: Array.from(optionValuesMap[opt.title] || new Set<string>())
  }));
};

// For manually handling responses that match the specific JSON format shown
interface ApiOptionValue {
  option_id?: string;
  option?: {
    id?: string;
    title?: string;
  };
  value: string;
}

interface ApiVariant {
  options?: ApiOptionValue[] | Record<string, string>;
  [key: string]: any;
}

// Extract option values from the variant
export const extractOptionValuesFromNestedVariants = (variant: ApiVariant, optionMap: Record<string, string>): OptionValue[] => {
  if (!variant.options) {
    return [];
  }
  
  if (Array.isArray(variant.options)) {
    return variant.options.map((optVal: ApiOptionValue) => {
      // return {
      //   optionId: optVal.option_id || (optVal.option && optVal.option.id),
      //   optionName: (optVal.option && optVal.option.title) || 
      //              optionMap[optVal.option_id as string] || 'Option',
      //   value: optVal.value
      // };
      return {
        optionId: optVal.option_id || (optVal.option && optVal.option.id) || '',
        optionName: (optVal.option && optVal.option.title) || 
                  optionMap[optVal.option_id as string] || 'Option',
        value: optVal.value
      };
    });
  } else if (typeof variant.options === 'object') {
    // Handle object format of options
    return Object.entries(variant.options).map(([key, value]) => {
      return {
        optionId: '', // We don't have IDs in this format
        optionName: key,
        value: String(value)
      };
    });
  }
  
  return [];
};

// Load a product for editing
export const loadProductForEditing = async (
  id: string, 
  setError: (error: string | null) => void,
  setProductViewUrl: (url: string) => void,
  setFulfillmentType: (type: string) => void,
  setFulfillmentData: (data: any) => void,
  setOriginalData: (data: any) => void,
  setOriginalVariantIds: (ids: string[]) => void,
  setMediaItems: (items: MediaItem[]) => void,
  setProductLoaded: (loaded: boolean) => void,
  setIsLoading: (loading: boolean) => void,
  form: any
): Promise<boolean> => {
  try {
    // Fetch product data
    const response = await fetchProduct({id});
    
    // Parse response if it's a string (JSON)
    let product: any;
    if (typeof response === 'string') {
      try {
        product = JSON.parse(response);
        // The actual product might be nested under a 'product' key
        if (product.product) {
          product = product.product;
        }
      } catch (parseError) {
        console.error('Error parsing product data:', parseError);
        throw new Error('Invalid product data format');
      }
    } else {
      product = response;
    }
    
    // Defensive check to ensure we have a valid product
    if (!product) {
      throw new Error('Product data is empty or invalid');
    }

    console.log('Loaded product data:', product);
    
    // Set product view URL
    setProductViewUrl(`${STOREFRONT_DOMAIN}/products/${product.handle}`);
    
    // Parse metadata for fulfillment info
    const metadata = product.metadata || {};
    setFulfillmentType(metadata.fulfillment_type || '');
    
    if (metadata.fulfillment_data) {
      const parsedData = parseFulfillmentData(metadata.fulfillment_data);
      setFulfillmentData(parsedData);
    }
    
    // Save original data for reference
    setOriginalData({
      options: product.options,
      variants: product.variants
    });

    // Store original variant IDs for tracking changes
    const originalIds = product.variants?.map((v: any) => v.id) || [];
    setOriginalVariantIds(originalIds);

    // Transform options to match component format
    let transformedOptions: Option[] = [];
    
    if (product.options && product.options.length > 0) {
      // Transform options to match component format with array-based values
      transformedOptions = product.options.map((opt: any) => {
        // Extract values from option
        const optionValues = opt.values?.map((value: any) => 
          typeof value === 'object' ? value.value : value
        ) || [];
        
        const result: Option = {
          id: opt.id, // Keep the original option ID
          title: opt.title,
          optionValues: optionValues
        };
        
        // Extract color hex values from metadata if this is a color option
        if (isColorOption(opt.title)) {
          const colorHexValues: Record<string, string> = {};
          
          // Look for color hex values in metadata - NEW METHOD
          if (product.metadata && product.metadata.color_hex_values) {
            try {
              const colorHexArray = JSON.parse(product.metadata.color_hex_values);
              if (Array.isArray(colorHexArray)) {
                colorHexArray.forEach((item: any) => {
                  if (item.name && item.hex) {
                    colorHexValues[item.name] = item.hex;
                  }
                });
                console.log("Successfully loaded color hex values from color_hex_values array:", colorHexValues);
              }
            } catch (e) {
              console.error("Failed to parse color_hex_values:", e);
            }
          }
          
          // FALLBACK: Look for legacy colorhex_ entries if no values found
          if (Object.keys(colorHexValues).length === 0 && product.metadata) {
            Object.entries(product.metadata).forEach(([key, value]) => {
              // Look for keys like "colorhex_red", "colorhex_blue", etc.
              if (key.startsWith('colorhex_') && typeof value === 'string') {
                const colorName = key.replace('colorhex_', '').replace(/_/g, ' ');
                
                // Only add colors that are in this option's values
                const normalizedOptionValues = optionValues.map(v => v.toLowerCase());
                const normalizedColorName = colorName.toLowerCase();
                
                if (normalizedOptionValues.includes(normalizedColorName)) {
                  colorHexValues[colorName] = value as string;
                }
              }
            });
          }
          
          // Add color hex values to the option if any were found
          if (Object.keys(colorHexValues).length > 0) {
            result.colorHexValues = colorHexValues;
          }
        }
        
        return result;
      });
    } else {
      // Create default Color and Size options if none exist
      transformedOptions = [
        {
          id: generateUUID(),
          title: 'Color',
          optionValues: []
        },
        {
          id: generateUUID(),
          title: 'Size',
          optionValues: []
        }
      ];
    }
    
    // Add at least one empty option if none exist
    if (transformedOptions.length === 0) {
      transformedOptions.push({
        id: generateUUID(),
        title: '',
        optionValues: []
      });
    }
    
    // Transform variants to match component format
    const transformedVariants: Variant[] = [];
    
    if (product.variants && product.variants.length > 0) {
      // Create a mapping of option IDs to their titles for easier reference
      const optionMap: Record<string, string> = {};
      if (product.options) {
        product.options.forEach((opt: any) => {
          optionMap[opt.id] = opt.title;
        });
      }

      const newInventoryLevels: Record<string, any[]> = {};
      
      // Now process each variant
      for (const variant of product.variants) {
        console.log('Processing variant:', variant);
        
        // Extract price from the calculated_price in the variant
        let price = 0;
        let prices: any[] = [];
        
        // Check for calculated_price structure first (as in the sample data)
        if (variant.calculated_price && variant.calculated_price.calculated_amount) {
          price = variant.calculated_price.calculated_amount;
          prices = [{
            amount: price,
            currency_code: variant.calculated_price.currency_code || 'inr'
          }];
          console.log('Extracted price from calculated_price:', price);
        } 
        // Fall back to direct prices array if available
        else if (variant.prices && Array.isArray(variant.prices) && variant.prices.length > 0) {
          prices = variant.prices.map((p: any) => ({
            amount: p.amount,
            currency_code: p.currency_code || 'inr'
          }));
          
          // Find the INR price if possible
          const inrPrice = prices.find(p => p.currency_code === 'inr');
          if (inrPrice) {
            price = inrPrice.amount;
          } else {
            price = prices[0].amount;
          }
          
          console.log('Extracted price from prices array:', price);
        } else {
          console.log('No prices found for variant, using default');
          price = 0;
          prices = [{
            amount: 0,
            currency_code: 'inr'
          }];
        }
        
        // Extract inventory/stock quantity from proper field
        let stock = 0;          
        const inventoryItemId = variant.inventory_items?.[0]?.inventory_item_id || null;

        if (inventoryItemId) {
          try {
            const invRes = await fetchInventoryLevels({ inventoryItemId });
            const invLevel = invRes.inventory_levels?.[0];
            if (invLevel) {
              stock = invLevel.stocked_quantity ?? 0;

              // Track inventory level for later sync
              newInventoryLevels[inventoryItemId] = [invLevel];
            }
          } catch (invErr) {
            console.log(`Failed to fetch inventory for variant ${variant.id}:`, invErr);
          }
        } else if (variant.inventory_quantity !== undefined) {
          stock = variant.inventory_quantity;
        }
        
        // Extract option values from the variant
        let optionValues: OptionValue[] = [];
        
        // Handle different formats of option data
        if (variant.options) {
          if (Array.isArray(variant.options)) {
            optionValues = variant.options.map((optVal: any) => {
              // return {
              //   optionId: optVal.option_id || (optVal.option && optVal.option.id),
              //   optionName: (optVal.option && optVal.option.title) || 
              //             optionMap[optVal.option_id] || 'Option',
              //   value: optVal.value
              // };
              return {
                optionId: optVal.option_id || (optVal.option && optVal.option.id) || '',
                optionName: (optVal.option && optVal.option.title) || 
                          optionMap[optVal.option_id] || 'Option',
                value: optVal.value
              };
            });
          } else if (typeof variant.options === 'object') {
            // Handle object format of options
            optionValues = Object.entries(variant.options).map(([key, value]) => {
              const matchingOption = transformedOptions.find(opt => opt.title === key);
              return {
                optionId: matchingOption?.id || '',
                optionName: key,
                value: String(value)
              };
            });
          }
        } else {
          // Try to parse from the variant title if needed
          const titleParts = variant.title.split(/\s*\/\s*/).map((part: string) => part.trim());
          
          if (transformedOptions.length === titleParts.length) {
            optionValues = transformedOptions.map((option, index) => {
              return {
                optionId: option.id || '',
                optionName: option.title,
                value: titleParts[index]
              };
            });
          }
        }
        
        transformedVariants.push({
          id: variant.id,
          title: variant.title,
          price: price,
          prices: prices,
          stock: stock,
          sku: variant.sku || '',
          allowBackorder: Boolean(variant.allow_backorder),
          manageInventory: variant.manage_inventory !== false,
          optionValues,
          inventoryItemId
        });
      }
    }
    
    console.log("Variants before reset:", transformedVariants);
    
    // Make sure all option values discovered in variants are added to options
    const completeTransformedOptions = addMissingOptionValues(transformedOptions, transformedVariants);
    
    // Transform images
    const transformedMedia: MediaItem[] = product.images?.map((img: any) => ({
      file: null,
      url: img.url,
      rank: img.rank || 0,
      id: img.id, // Keep the image ID
      colorValue: img.metadata?.color // Add color association if available
    })) || [];

    // Extract any color-specific images from variant metadata
    const variantColorImages: MediaItem[] = [];
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach(variant => {
        const colorImages = parseColorImagesFromVariant(variant);
        if (colorImages.length > 0) {
          variantColorImages.push(...colorImages);
        }
      });
    }

    // Combine regular images with variant color images
    const allMediaItems = [...transformedMedia, ...variantColorImages];
    setMediaItems(allMediaItems);
    
    // Process product details from metadata
    let productDetails: ProductDetail[] = [{ id: generateUUID(), text: '' }];
    let storyBehindDesign = '';
    
    if (product.metadata) {
      // Extract product details
      if (product.metadata.product_details) {
        try {
          const parsedDetails = JSON.parse(product.metadata.product_details);
          if (Array.isArray(parsedDetails) && parsedDetails.length > 0) {
            productDetails = parsedDetails.map((detail: string) => ({
              id: generateUUID(),
              text: detail
            }));
          }
        } catch (e) {
          console.error("Failed to parse product details:", e);
        }
      }
      
      // Extract story behind design
      if (product.metadata.description_story) {
        storyBehindDesign = product.metadata.description_story;
      }
    }
  
    // Reset form with fetched values
    form.reset({
      title: product.title || '',
      subtitle: product.subtitle || '',
      handle: product.handle || '',
      description: product.description || '',
      status: product.status || 'published',
      thumbnail: product.thumbnail || '',
      discountable: product.discountable ?? true,
      options: completeTransformedOptions,
      variants: transformedVariants,
      weight: product.weight?.toString() || '',
      length: product.length?.toString() || '',
      width: product.width?.toString() || '',
      height: product.height?.toString() || '',
      material: product.material || '',
      origin_country: product.origin_country || '',
      category_id: product.categories && product.categories.length > 0 ? product.categories[0].id : '',
      productDetails,
      storyBehindDesign,
      metadata: {
        fulfillment_type: product.metadata?.fulfillment_type || '',
        fulfillment_data: product.metadata?.fulfillment_data || '',
        product_details: product.metadata?.product_details || '',
        description_story: product.metadata?.description_story || ''
      }
    });
    
    console.log("Form initialized with:", {
      options: completeTransformedOptions,
      variants: transformedVariants,
      productDetails,
      storyBehindDesign
    });
    
    // Set media items
    setMediaItems(transformedMedia);
    
    return true; // Success
  } catch (error: any) {
    console.error('Error loading product:', error);
    setError('Failed to load product. Please try again.');
    setIsLoading(false);
    return false; // Failure
  }
};