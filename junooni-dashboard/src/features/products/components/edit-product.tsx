import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useToast } from "@/hooks/use-toast";
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
  IconClock,
  IconColorSwatch,
  IconExternalLink,
  IconPackage
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronsRightLeft, Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

// Import components from our product modules
import { StreamlinedImageManager } from '../context/product-modules/ImageManager';
import { EnhancedOptionComponent } from '../context/product-modules/OptionComponents';
import SimplifiedColorSelector from '../context/color-selection';
import InventoryManagementModal from '../context/product-modules/InventoryManagementModel';

// Import a rich text editor component
import { TipTapEditor } from '../context/editor';

import { ProductSchema } from '../data/schema';
import { 
  fetchProduct, 
  updateProduct, 
  uploadProductImage, 
  fetchCategories, 
  batchUpdateVariants, 
  fetchInventoryLevels, 
  batchUpdateInventoryLevels,
  getVariantInventoryItemId
} from '../context/fetchApi';
import HierarchicalCategorySelector from '../context/HierarchicalCategorySelector';

// Import types and utilities
import { 
  MediaItem, 
  VariantInfo, 
  ProductFormProps, 
  ProductFormValues,
  Option,
  Variant,
  OptionValue,
  ProductDetail
} from '../context/product-modules/types';

import { 
  generateUUID,
  generateUniqueSku, 
  generateVariantsFromOptions,
  isColorOption,
  prepareVariantImageMetadata,
  getColorImagesMetadata
} from '../context/product-modules/utils';

// Define the base API URL for images
const API_BASE_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL ;
// Define the storefront domain for product view links
const STOREFRONT_DOMAIN = 'https://www.junooni.com';
// Default location ID for inventory management
const DEFAULT_LOCATION_ID = "sloc_01JKWDDGKGCQFJANXV0CVJN2QW";
const EditProduct = () => {
  const { id } = useParams({ from: "/_authenticated/products/$id" });
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageTab, setActiveImageTab] = useState("upload");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [productLoaded, setProductLoaded] = useState(false);
  const [technologyName, setTechnologyName] = useState<string>('');
  const [payloadProductName, setPayloadProductName] = useState<string>(''); // ADD THIS LINE
  const [sourceProductId, setSourceProductId] = useState<number | null>(null); // ADD THIS LINE

  
  // For the product URL
  const [productViewUrl, setProductViewUrl] = useState("");
  
  // For managing the new option value being added for each option
  const [newOptionValues, setNewOptionValues] = useState<Record<number, string>>({});

  // For images, we store objects with a file (if newly added) and URL and rank.
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  
  // For storing uploaded image mappings (old URL to new ID)
  const [uploadedImageMap, setUploadedImageMap] = useState<Record<string, string>>({});
  
  // For variant toggle
  const [hasVariants, setHasVariants] = useState(false);

  // For bulk editing variants
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkPrice, setBulkPrice] = useState("");
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  // For fulfillment info
  const [fulfillmentType, setFulfillmentType] = useState("");
  const [fulfillmentData, setFulfillmentData] = useState<{
    handling_time?: string;
    shipping_time?: string;
    type?: string;
  } | null>(null);
   const { toast } = useToast();
  // Stock management modal
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [hasUnsavedVariantChanges, setHasUnsavedVariantChanges] = useState(false);

  // Ref for the hidden file input for drag‑and‑drop.
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Keep track of the original options/variants for reconciliation
  const [originalData, setOriginalData] = useState<any>({});
  
  // State for storing categories from API
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // For tracking variant changes for batch update
  const [originalVariantIds, setOriginalVariantIds] = useState<string[]>([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);
  
  // For inventory management
  const [inventoryLevels, setInventoryLevels] = useState<Record<string, any>>({});
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  // For image associations
  const [imageAssociatedOptions, setImageAssociatedOptions] = useState<Option[]>([]);
  
  // State to track selected option and value for variant image display
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [selectedOptionValue, setSelectedOptionValue] = useState<string | null>(null);

  // For tracking inventory changes
  const [inventoryChanges, setInventoryChanges] = useState<{
    create: {
      location_id: string;
      inventory_item_id: string;
      stocked_quantity: number;
      incoming_quantity?: number;
    }[];
    update: {
      location_id: string;
      inventory_item_id: string;
      stocked_quantity: number;
      incoming_quantity?: number;
    }[];
    delete: string[];
  }>({
    create: [],
    update: [],
    delete: []
  });

  const inventoryChangesRef = useRef(inventoryChanges);

  useEffect(() => {
    inventoryChangesRef.current = inventoryChanges;
  }, [inventoryChanges]);

  const inventoryLevelsRef = useRef(inventoryLevels);

  useEffect(() => {
    inventoryLevelsRef.current = inventoryLevels;
  }, [inventoryLevels]);
  
  // Initialize the form with default values based on the schema
  useEffect(() => {
    if (productLoaded && hasVariants) {
      loadInventoryLevels();
    }
  }, [productLoaded, hasVariants]);
  
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
      options: [],
      variants: [],
      weight: '',
      length: '',
      width: '',
      height: '',
      material: '',
      origin_country: '',
      category_id: [],
      productDetails: [{ id: generateUUID(), text: '' }],
      storyBehindDesign: '',
      shippingDays: '7-10',
      handlingTime: '2-3',
      locationId: DEFAULT_LOCATION_ID
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
  // Function to format image URLs
  const getImageDisplayUrl = (item: MediaItem): string => {
    if (!item || !item.url) return '';
    
    // If it's already a blob URL (from file input), use it as is
    if (item.url.startsWith('blob:')) {
      return item.url;
    }
    
    // If it's a full URL (including protocol), use it as is
    if (item.url.startsWith('http://') || item.url.startsWith('https://')) {
      return item.url;
    }
    
    // If it starts with a slash, append it to the API base URL
    if (item.url.startsWith('/')) {
      return `${API_BASE_URL}${item.url}`;
    }
    
    // Otherwise, assume it's a path relative to the static directory
    return `${API_BASE_URL}/static/${item.url}`;
  };
  
  // Get options that have image associations
  const getImageAssociatedOptions = () => {
    const currentOptions = form.getValues('options');
    return currentOptions.filter(opt => 
      opt.title && 
      opt.optionValues && 
      opt.optionValues.length > 0 && 
      opt.imageAssociation === true
    );
  };
  
  // Update imageAssociatedOptions when options change
  useEffect(() => {
    const subscription = form.watch((formValues, { name, type }) => {
      // Update imageAssociatedOptions when options change
      if (name && (name.includes('options') || name.includes('imageAssociation'))) {
        const options = getImageAssociatedOptions();
        setImageAssociatedOptions(options);
        
        // Set selectedOption to the first one with image association if none selected
        if (options.length > 0 && (!selectedOption || !options.some(opt => opt.id === selectedOption.id))) {
          setSelectedOption(options[0]);
          if (options[0].optionValues && options[0].optionValues.length > 0) {
            setSelectedOptionValue(options[0].optionValues[0]);
          }
        }
      }
    });
    
    // Initial setting
    setImageAssociatedOptions(getImageAssociatedOptions());
    
    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, [form, selectedOption]);

  // Normalizes an image ID by removing common prefixes
  const normalizeImageId = (id: string): string => {
    if (!id) return '';
    
    // If it's already a proper image ID, return it
    if (id.startsWith('img_')) return id;
    
    // Try to extract a filename from a path
    const parts = id.split('/');
    const filename = parts[parts.length - 1];
    
    return filename;
  };

  // Add this function to synchronize variant stock changes with inventory
const syncStockToInventory = (variantIndex, stockValue) => {
  const currentVariants = form.getValues('variants');
  const variant = currentVariants[variantIndex];
  
  // Skip if no inventory item ID or management is disabled
  if (!variant.manageInventory || !variant.inventoryItemId) return;
  
  // Call handleInventoryChange to update both UI and track changes
  handleInventoryChange(
    variant.inventoryItemId,
    DEFAULT_LOCATION_ID,
    'stocked_quantity',
    stockValue
  );
};
// Determine if a variant is new based on ID pattern or explicit flag
const isNewVariant = (variant) => {
  // Check for explicit flag from generateVariants function
  if (variant.isNewVariant === true) return true;
  
  // Check if this is a newly generated ID (not from the server)
  if (variant.id && !originalVariantIds.includes(variant.id)) return true;
  
  return false;
};

  // Extracts a proper image ID from a server URL
  const extractImageIdFromUrl = (url: string): string | null => {
    if (!url) return null;
    
    // Try to match image ID pattern in the URL
    const imgIdMatch = url.match(/img_[a-zA-Z0-9]+/);
    if (imgIdMatch) return imgIdMatch[0];
    
    // Otherwise, try to extract just the filename
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    
    return filename || null;
  };

  // Checks if two image IDs might refer to the same image
  const imageIdsMatch = (id1: string, id2: string): boolean => {
    if (!id1 || !id2) return false;
    
    // Normalize both IDs
    const norm1 = normalizeImageId(id1);
    const norm2 = normalizeImageId(id2);
    
    // Direct match
    if (norm1 === norm2) return true;
    
    // One contains the other
    if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
    
    return false;
  };

  // Check if we have images for a specific option value
  const hasImagesForOption = (optionName: string, value: string): boolean => {
    return mediaItems.some(item => 
      item.variantInfo?.optionName === optionName && 
      item.variantInfo?.optionValues?.includes(value)
    );
  };
  
  // Fetch the product details when the component mounts, but only once
  useEffect(() => {
    // Prevent multiple API calls
    if (!id || productLoaded) return;
    
    async function loadProduct() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch product data
        const response = await fetchProduct({id});
        
        // Parse response if it's a string (JSON)
        let product;
        if (typeof response === 'string') {
          try {
            product = JSON.parse(response);
            // The actual product might be nested under a 'product' key
            if (product.product) {
              product = product.product;
            }
          } catch (parseError) {
            ////console.error('Error parsing product data:', parseError);
            throw new Error('Invalid product data format');
          }
        } else {
          product = response;
        }
        
        // Defensive check to ensure we have a valid product
        if (!product) {
          throw new Error('Product data is empty or invalid');
        }
        
        // ===== STEP 2A: Extract Technology Name =====
        // Access the technology name from product.metadata.print_technology_name
        const techName = product.metadata?.print_technology_name || '';
        
        // Optional: Log for debugging
        // console.log("Extracted Technology Name:", techName);
        // console.log("Full metadata:", product.metadata);
        
        // Store in state
        setTechnologyName(techName);
        const payloadProdName = product.metadata?.payload_product_name || '';
        setPayloadProductName(payloadProdName);

        if (product.metadata?.payload_integration) {
        try {
          const payloadIntegration = typeof product.metadata.payload_integration === 'string'
            ? JSON.parse(product.metadata.payload_integration)
            : product.metadata.payload_integration;
          
          if (payloadIntegration?.source_product_id) {
            setSourceProductId(payloadIntegration.source_product_id);
          }
        } catch (e) {
          console.error("Failed to parse payload_integration:", e);
        }
      }
        // ===== END EXTRACTION =====
        
        ////console.log("Loaded product data:", product);
        
        // Set product view URL
        setProductViewUrl(`${STOREFRONT_DOMAIN}/products/${product.handle}`);
        
        // Parse metadata for fulfillment info
        const metadata = product.metadata || {};
        ////console.log("Product metadata:", metadata);
        setFulfillmentType(metadata.fulfillment_type || '');
        
        // Parse fulfillment data from metadata
        if (metadata.fulfillment_type) {
          let fulfillmentDataObj;
          try {
            fulfillmentDataObj = parseFulfillmentData(metadata.fulfillment_type);
            setFulfillmentData(fulfillmentDataObj);
          } catch (e) {
            ////console.error("Error parsing fulfillment data:", e);
          }
        }
        
        // Save original data for reference
        setOriginalData({
          options: product.options,
          variants: product.variants,
          metadata: product.metadata || {} // Store original metadata
        });
        
        // Store original variant IDs for tracking changes
        const originalIds = product.variants?.map((v: any) => v.id) || [];
        setOriginalVariantIds(originalIds);

        // Check if the product has variants
        setHasVariants(product.variants && product.variants.length > 1);

        // Transform options to match component format
        let transformedOptions: Option[] = [];
        
        if (product.options && product.options.length > 0) {
          // Transform options to match component format with array-based values
          transformedOptions = product.options.map((opt: any) => {
            // Extract values from option
            const optionValues = opt.values?.map((value: any) => 
              typeof value === 'object' ? value.value : value
            ) || [];
            
            // Initialize with explicitly false imageAssociation (will be updated later)
            const result: Option = {
              id: opt.id, // Keep the original option ID
              title: opt.title,
              optionValues: optionValues,
              imageAssociation: false // Default value, will be updated from metadata
            };
            
            // Extract color hex values from metadata if this is a color option
            if (isColorOption(opt.title)) {
              const colorHexValues: Record<string, string> = {};
              
              // Look for color hex values in metadata
              if (product.metadata && product.metadata.color_hex_values) {
                try {
                  const colorHexArray = JSON.parse(product.metadata.color_hex_values);
                  if (Array.isArray(colorHexArray)) {
                    colorHexArray.forEach(item => {
                      if (item.name && item.hex) {
                        colorHexValues[item.name] = item.hex;
                      }
                    });
                  }
                } catch (e) {
                  ////console.error("Failed to parse color_hex_values:", e);
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
                      colorHexValues[colorName] = value;
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
          
          // Parse image association settings from metadata
          if (product.metadata && product.metadata.variant_specific_image_option) {
            try {
              let imageAssociationSettings;
              
              // Handle string or object format
              if (typeof product.metadata.variant_specific_image_option === 'string') {
                imageAssociationSettings = JSON.parse(product.metadata.variant_specific_image_option);
              } else {
                imageAssociationSettings = product.metadata.variant_specific_image_option;
              }
              
              ////console.log("Image association settings from metadata:", imageAssociationSettings);
              
              if (Array.isArray(imageAssociationSettings)) {
                // Update each option with its image association setting
                transformedOptions = transformedOptions.map(opt => {
                  // Try different ways to match the option with its setting
                  let setting = imageAssociationSettings.find(s => {
                    // 1. Exact ID match
                    if (s.option_id === opt.id) return true;
                    
                    // 2. Normalize IDs by removing potential prefixes
                    const normalizedSettingId = s.option_id.replace(/^opt_/, '');
                    const normalizedOptId = opt.id.replace(/^opt_/, '');
                    if (normalizedSettingId === normalizedOptId) return true;
                    
                    // 3. Name match (case insensitive)
                    if (s.option_name && opt.title && 
                        s.option_name.toLowerCase() === opt.title.toLowerCase()) return true;
                    
                    return false;
                  });
                  // ADD THESE DEBUG LOGS RIGHT AFTER THE ABOVE PROCESSING:
                  // //console.log("Image association settings being loaded:", imageAssociationSettings);
                  // //console.log("Options with image associations:", transformedOptions.filter(opt => opt.imageAssociation));
                  // //console.log(`Option ${opt.title} (${opt.id}) association setting:`, setting);
                  
                  if (setting) {
                    // Convert to explicit boolean to avoid any "undefined" issues
                    const isEnabled = setting.enabled === true || setting.enabled === "true";
                    return {
                      ...opt,
                      imageAssociation: isEnabled
                    };
                  }
                  
                  // Explicitly set to false if no setting found
                  return {
                    ...opt,
                    imageAssociation: false
                  };
                });
              }
            } catch (e) {
              ////console.error("Failed to parse image association settings:", e);
              
              // Ensure all options have explicit imageAssociation value
              transformedOptions = transformedOptions.map(opt => ({
                ...opt,
                imageAssociation: false
              }));
            }
          } else {
            // If no image association settings found, ensure all options have explicit imageAssociation set to false
            transformedOptions = transformedOptions.map(opt => ({
              ...opt,
              imageAssociation: false
            }));
          }
          
          
          // Log all options after processing
          ////console.log("Transformed options with association settings:", transformedOptions);
        } else {
          // Create default Color and Size options if none exist
          transformedOptions = [
            {
              id: generateUUID(),
              title: 'Color',
              optionValues: [],
              imageAssociation: false
            },
            {
              id: generateUUID(),
              title: 'Size',
              optionValues: [],
              imageAssociation: false
            }
          ];
        }
        
        // Add at least one empty option if none exist
        if (transformedOptions.length === 0) {
          transformedOptions.push({
            id: generateUUID(),
            title: '',
            optionValues: [],
            imageAssociation: false
          });
        }
        
        // Extract shipping info from metadata
        // let shippingDays = '7-10';
        // let handlingTime = '2-3';
        
        // if (product.metadata && product.metadata.fulfillment_type) {
        //   try {
        //     const fulfillmentInfo = JSON.parse(product.metadata.fulfillment_type);
        //     if (typeof fulfillmentInfo === 'object') {
        //       shippingDays = fulfillmentInfo.shipping_time || '7-10';
        //       handlingTime = fulfillmentInfo.handling_time || '2-3';
        //     }
        //   } catch (e) {
        //     ////console.error("Error parsing fulfillment_type:", e);
        //   }
        // }

        // Extract shipping info from metadata
        let shippingDays = '7-10';
        let handlingTime = '2-3';
        
        if (product.metadata && product.metadata.fulfillment_type) {
          try {
            const fulfillmentInfo = JSON.parse(product.metadata.fulfillment_type);
            if (typeof fulfillmentInfo === 'object') {
              // Extract just the numeric part from strings like "2-3 business days"
              if (fulfillmentInfo.shipping_time) {
                const shippingMatch = fulfillmentInfo.shipping_time.match(/(\d+-?\d*)/);
                shippingDays = shippingMatch ? shippingMatch[1] : '7-10';
              }
              
              if (fulfillmentInfo.handling_time) {
                const handlingMatch = fulfillmentInfo.handling_time.match(/(\d+-?\d*)/);
                handlingTime = handlingMatch ? handlingMatch[1] : '2-3';
              }
            }
          } catch (e) {
            console.error("Error parsing fulfillment_type:", e);
          }
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
            // Extract price from the calculated_price in the variant
            let price = 0;
            let prices: any[] = [];

            // Add this right after processing each variant to see the metadata structure
            //console.log(`Variant ${variant.id} metadata:`, variant.metadata);
            if (variant.metadata && variant.metadata.cost_price) {
              //console.log(`Found cost_price in metadata: ${variant.metadata.cost_price}`);
            }
            
            // Check for calculated_price structure first
            if (variant.calculated_price && variant.calculated_price.calculated_amount) {
              price = variant.calculated_price.calculated_amount;
              prices = [{
                amount: price,
                currency_code: variant.calculated_price.currency_code || 'inr'
              }];
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
            } else {
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
                ////console.log(`Failed to fetch inventory for variant ${variant.id}:`, invErr);
              }
            } else if (variant.inventory_quantity !== undefined) {
              stock = variant.inventory_quantity;
            }
            
            // Extract option values from the variant - handle different API formats
            let optionValues: OptionValue[] = [];
            
            if (variant.options) {
              if (Array.isArray(variant.options)) {
                optionValues = variant.options.map((optVal: any) => {
                  return {
                    optionId: optVal.option_id || (optVal.option && optVal.option.id),
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
                    optionId: option.id,
                    optionName: option.title,
                    value: titleParts[index]
                  };
                });
              }
            }
            
            let cost_Price = 0;
            if (variant.metadata && variant.metadata.cost_price) {
              cost_Price = typeof variant.metadata.cost_price === 'string' 
                ? parseFloat(variant.metadata.cost_price) || 0 
                : variant.metadata.cost_price || 0;
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
              inventoryItemId,
               cost_price: cost_Price,
              metadata: variant.metadata || {} // Store original metadata
            });
          }
        }
        
        // Make sure all option values discovered in variants are added to options
        const completeTransformedOptions = addMissingOptionValues(transformedOptions, transformedVariants);

        // Transform images (regular product images)
        const transformedMedia: MediaItem[] = product.images?.map((img: any, index: number) => {
          // Ensure we have the full URL for each image
          let imgUrl = img.url;
          
          ////console.log(`Processing image ${index}:`, img);
          
          return {
            file: null,
            url: imgUrl,
            rank: img.rank || index,
            id: img.id, // Keep the image ID
            isNew: false,
            colorValue: img.metadata?.color // Add color association if available
          };
        }) || [];

        // //console.log("Product Images:", product.images);
        // //console.log("Transformed Media Initial:", transformedMedia);
        // Process variant-specific image associations
        const variantSpecificImages: MediaItem[] = [];

        if (product.variants && Array.isArray(product.variants)) {
          // Process each variant to look for image associations
          product.variants.forEach(variant => {
            ////console.log(`Processing variant ${variant.id} for image associations:`, variant);
            
            // First check if this variant has any direct image associations in its metadata
            let variantImageIds: string[] = [];
            let variantImageUrls: string[] = [];
            
            if (variant.metadata) {
              ////console.log(`Variant ${variant.id} metadata:`, variant.metadata);
              
              // Try to get image IDs first (preferred)
              if (variant.metadata.variant_image_ids) {
                try {
                  const parsedIds = typeof variant.metadata.variant_image_ids === 'string' 
                    ? JSON.parse(variant.metadata.variant_image_ids) 
                    : variant.metadata.variant_image_ids;
                    
                  if (Array.isArray(parsedIds)) {
                    variantImageIds = parsedIds;
                  }
                } catch (e) {
                  ////console.error(`Failed to parse variant_image_ids for variant ${variant.id}:`, e);
                }
              }
              
              // Fall back to URLs if IDs not available
              if (variant.metadata.variant_images) {
                try {
                  const parsedUrls = typeof variant.metadata.variant_images === 'string' 
                    ? JSON.parse(variant.metadata.variant_images) 
                    : variant.metadata.variant_images;
                    
                  if (Array.isArray(parsedUrls)) {
                    variantImageUrls = parsedUrls;
                  }
                } catch (e) {
                  ////console.error(`Failed to parse variant_images for variant ${variant.id}:`, e);
                }
              }
              
              // Handle color_images array
              if (variant.metadata.color_images) {
                try {
                  let colorImages;
                  
                  if (typeof variant.metadata.color_images === 'string') {
                    colorImages = JSON.parse(variant.metadata.color_images);
                  } else {
                    colorImages = variant.metadata.color_images;
                  }
                  
                  ////console.log(`Color images for variant ${variant.id}:`, colorImages);
                  
                  if (Array.isArray(colorImages)) {
                    // Extract the image IDs and URLs
                    colorImages.forEach(colorImg => {
                      if (colorImg.imageId) {
                        // Find a matching option value for this color
                        const colorOption = variant.options?.find(ov => 
                          isColorOption(ov.option?.title || ov.option_name || '') && 
                          ov.value === colorImg.color
                        );
                        
                        const colorOptionName = colorOption?.option?.title || 
                                              colorOption?.option_name || 
                                              'Color';
                        
                        if (colorOption) {
                          ////console.log(`Found color option match for ${colorImg.color}:`, colorOption);
                          
                          // Try to find a matching image in the main images array first
                          let matchingImage = transformedMedia.find(img => {
                            // Try various match methods
                            if (img.id && colorImg.imageId) {
                              return imageIdsMatch(img.id, colorImg.imageId);
                            }
                            
                            // If URLs are available, try matching by URL
                            if (img.url && colorImg.url) {
                              return img.url === colorImg.url;
                            }
                            
                            return false;
                          });
                          
                          if (matchingImage) {
                            ////console.log(`Found matching image for color ${colorImg.color}:`, matchingImage);
                            
                            // Add option association to existing image
                            matchingImage.variantInfo = matchingImage.variantInfo || {};
                            matchingImage.variantInfo.optionName = colorOptionName;
                            matchingImage.variantInfo.optionValues = [colorImg.color];
                            matchingImage.colorValue = colorImg.color;
                          } else {
                            ////console.log(`No matching image found for color ${colorImg.color}, adding as new`);
                            
                            // Use imageId from colorImg if available, otherwise use a URL
                            let imageUrl = colorImg.url || '';
                            
                            // Skip blob URLs or construct a proper URL
                            if (imageUrl.startsWith('blob:')) {
                              // Try to find a server URL in product.images
                              const serverImage = product.images?.find(img => {
                                return img.id === colorImg.imageId;
                              });
                              
                              if (serverImage) {
                                imageUrl = serverImage.url;
                              } else {
                                ////console.warn(`Could not find server URL for color image ${colorImg.imageId}`);
                                // Try to construct URL from image ID
                                imageUrl = `${API_BASE_URL}/static/${colorImg.imageId}`;
                              }
                            }
                            
                            if (imageUrl && !imageUrl.startsWith('blob:')) {
                              variantSpecificImages.push({
                                file: null,
                                url: imageUrl,
                                rank: transformedMedia.length + variantSpecificImages.length,
                                id: colorImg.imageId || `color-${colorImg.color}-${Date.now()}`,
                                isNew: false,
                                colorValue: colorImg.color,
                                variantInfo: {
                                  optionName: colorOptionName,
                                  optionValues: [colorImg.color]
                                }
                              });
                            }
                          }
                        }
                      }
                    });
                  }
                } catch (e) {
                  //console.error("Failed to parse color images:", e);
                }
              }

              // ===== NEW CODE: Handle option_images array (for all option types) =====
              if (variant.metadata.option_images) {
                try {
                  let optionImages;
                  
                  if (typeof variant.metadata.option_images === 'string') {
                    optionImages = JSON.parse(variant.metadata.option_images);
                  } else {
                    optionImages = variant.metadata.option_images;
                  }
                  
                  ////console.log(`Option images for variant ${variant.id}:`, optionImages);
                  
                  if (Array.isArray(optionImages)) {
                    // Process each option image entry
                    // REPLACE the option images processing section in edit-product.tsx (around line 720-750)
                    // Find this section and replace it:

                    optionImages.forEach(optImg => {
                      if (optImg.imageId) {
                        const optionName = optImg.option_name;
                        const optionValue = optImg.option_value;
                        
                        if (optionName && optionValue) {
                          // ADD THIS DEBUG LOG:
                          // console.log(`Attempting to match image ID: "${optImg.imageId}" with available images:`, 
                          //   transformedMedia.map(img => ({id: img.id, url: img.url}))
                          // );
                          
                          ////console.log(`Processing option image for ${optionName}: ${optionValue}`, optImg);
                          
                          // Find the matching image by ID first
                          let matchingImage = transformedMedia.find(img => img.id === optImg.imageId);
                          
                          // If not found by ID, try to match by URL
                          if (!matchingImage) {
                            const targetUrl = optImg.url;
                            matchingImage = transformedMedia.find(img => img.url === targetUrl);
                            ////console.log(`Image ${optImg.imageId} not found by ID, searching by URL: ${targetUrl}`);
                            
                            if (matchingImage) {
                              ////console.log(`Found matching image by URL:`, matchingImage);
                            }
                          }
                          
                          if (matchingImage) {
                            // CRITICAL FIX: Set the colorValue and variantInfo on the existing image
                            matchingImage.colorValue = optionValue;
                            matchingImage.variantInfo = {
                              optionName: optionName,
                              optionValues: [optionValue]
                            };
                            
                            ////console.log(`Successfully set colorValue "${optionValue}" on image:`, matchingImage.id);
                          } else {
                            ////console.log(`No matching image found for ID: ${optImg.imageId}, URL: ${optImg.url}`);
                            
                            // If we can't find the image by ID or URL, create a new media item
                            const newMediaItem: MediaItem = {
                              id: optImg.imageId,
                              url: optImg.url,
                              rank: transformedMedia.length,
                              isNew: false,
                              colorValue: optionValue,
                              variantInfo: {
                                optionName: optionName,
                                optionValues: [optionValue]
                              }
                            };
                            
                            transformedMedia.push(newMediaItem);
                            ////console.log(`Created new media item for missing image:`, newMediaItem);
                          }
                        }
                      }
                    });
                  }
                } catch (e) {
                  ////console.error("Failed to parse option images:", e);
                }
              }
              // ===== END NEW CODE =====
            }
            
            // //console.log(`Variant ${variant.id} image associations:`, {
            //   ids: variantImageIds,
            //   urls: variantImageUrls
            // });
            
            // Process direct variant-specific image IDs
            if (variantImageIds.length > 0) {
              variantImageIds.forEach(imageId => {
                if (!imageId) return;
                
                // Find the image in the already loaded images by ID or pattern match
                const matchingImage = transformedMedia.find(img => {
                  if (!img.id || !imageId) return false;
                  return imageIdsMatch(img.id, imageId);
                });
                
                if (matchingImage) {
                  // Add variant association to this image
                  matchingImage.variantInfo = matchingImage.variantInfo || {};
                  matchingImage.variantInfo.variantId = variant.id;
                  ////console.log(`Associated image ${imageId} with variant ${variant.id}`);
                } else {
                  ////console.warn(`Image ${imageId} not found in loaded images, will check URLs instead`);
                  
                  // Try to find this image in the product images by ID
                  const serverImage = product.images?.find(img => imageIdsMatch(img.id, imageId));
                  
                  if (serverImage) {
                    // Add as a new media item
                    variantSpecificImages.push({
                      file: null,
                      url: serverImage.url,
                      rank: transformedMedia.length + variantSpecificImages.length,
                      id: serverImage.id,
                      isNew: false,
                      variantInfo: { variantId: variant.id }
                    });
                  }
                }
              });
            }

   // Fall back to URLs if IDs didn't match or aren't available
   if (variantImageUrls.length > 0) {
    variantImageUrls.forEach(imageUrl => {
      if (!imageUrl) return;
      
      // Skip blob URLs as they won't be valid anymore
      if (imageUrl.startsWith('blob:')) {
        ////console.warn(`Skipping blob URL: ${imageUrl}`);
        return;
      }
      
      // Find the image in the already loaded images by URL
      const matchingImage = transformedMedia.find(img => img.url === imageUrl);
      
      if (matchingImage) {
        // Add variant association to this image
        matchingImage.variantInfo = matchingImage.variantInfo || {};
        matchingImage.variantInfo.variantId = variant.id;
        ////console.log(`Associated image with URL ${imageUrl} with variant ${variant.id}`);
      } else {
        // If the image isn't in the gallery, add it as a new item
        ////console.log(`Adding new image with URL ${imageUrl} for variant ${variant.id}`);
        
        // Try to find a proper image ID from product.images
        const serverImage = product.images?.find(img => img.url === imageUrl);
        
        variantSpecificImages.push({
          file: null,
          url: imageUrl,
          rank: transformedMedia.length + variantSpecificImages.length,
          id: serverImage?.id || `variant-${variant.id}-${Date.now()}`,
          isNew: false,
          variantInfo: { variantId: variant.id }
        });
      }
    });
  }
});
}

// Combine regular images with variant-specific images, avoiding duplicates
const allMediaItems = [...transformedMedia];

// Only add variant-specific images that don't already exist in the gallery
variantSpecificImages.forEach(vsImage => {
// Check if this image URL already exists in allMediaItems
const exists = allMediaItems.some(item => item.url === vsImage.url);
if (!exists) {
  allMediaItems.push(vsImage);
}
});

////console.log("Final media items after processing:", allMediaItems);

// Set the combined images to the state
setMediaItems(allMediaItems);

// ADD THESE DEBUG LOGS RIGHT AFTER setMediaItems:
////console.log("=== EDIT PRODUCT LOAD DEBUG ===");
// //console.log("Product variants metadata:", product.variants?.map(v => ({
//   id: v.id,
//   title: v.title,
//   metadata: v.metadata
// })));
// //console.log("Final media items loaded:", allMediaItems.map(item => ({
//   id: item.id,
//   url: item.url,
//   variantInfo: item.variantInfo,
//   colorValue: item.colorValue
// })));

// Process product details from metadata
let productDetails: ProductDetail[] = [{ id: generateUUID(), text: '' }];
let storyBehindDesign = '';

if (product.metadata) {
// Extract product details
if (product.metadata.product_details) {
  try {
    const parsedDetails = JSON.parse(product.metadata.product_details);
    if (Array.isArray(parsedDetails) && parsedDetails.length > 0) {
      productDetails = parsedDetails.map(detail => ({
        id: generateUUID(),
        text: detail
      }));
    }
  } catch (e) {
    ////console.error("Failed to parse product details:", e);
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
category_ids: product.categories?.map(cat => cat.id) || [], // Load all category IDs
//category_id: product.categories && product.categories.length > 0 ? product.categories[0].id : '',
productDetails,
storyBehindDesign,
shippingDays,
handlingTime,
locationId: DEFAULT_LOCATION_ID
});

// Log the options after form reset
////console.log("Options after form reset:", form.getValues('options'));

// Log the image association options
const associatedOptions = getImageAssociatedOptions();
////console.log("Image associated options after load:", associatedOptions);
setImageAssociatedOptions(associatedOptions);

// Set initial selected option and value if we have options with image associations
if (associatedOptions.length > 0) {
setSelectedOption(associatedOptions[0]);
if (associatedOptions[0].optionValues && associatedOptions[0].optionValues.length > 0) {
  setSelectedOptionValue(associatedOptions[0].optionValues[0]);
}
}

// Reset the unsaved changes flag after loading
setHasUnsavedVariantChanges(false);

// Mark product as loaded to prevent multiple fetches
setProductLoaded(true);
setIsLoading(false);
} catch (error: any) {
////console.error('Error loading product:', error);
setError('Failed to load product. Please try again.');
setIsLoading(false);
}
}

if (id) {
loadProduct();
}
}, [id, form, productLoaded]);


  // Helper function to ensure all option values are correctly added to the options
  const addMissingOptionValues = (options: Option[], variants: Variant[]): Option[] => {
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

  // Parse fulfillment data
  const parseFulfillmentData = (dataString: string) => {
    try {
      if (!dataString) return null;
      
      let parsedData;
      try {
        parsedData = JSON.parse(dataString);
      } catch (e) {
        ////console.error("Failed to parse fulfillment_data JSON:", e);
        return null;
      }
      
      return parsedData;
    } catch (e) {
      ////console.error("Error parsing fulfillment data:", e);
      return null;
    }
  };

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

  // Remove an option value
  const handleRemoveOptionValue = (optionIndex: number, valueIndex: number) => {
    const currentOptions = form.getValues('options');
    const currentOption = currentOptions[optionIndex];
    
    // Ensure we have an array of values
    const currentValues = Array.isArray(currentOption.optionValues) 
      ? currentOption.optionValues 
      : [];
    
    // Remove the value at the specified index
    const updatedValues = currentValues.filter((_, i) => i !== valueIndex);
    
    // Update the option in the form
    updateOption(optionIndex, {
      ...currentOption,
      optionValues: updatedValues
    });
    
    // Generate variants after removing an option value
    handleGenerateVariants();
  };

  // Handle change in new option value input
  const handleNewOptionValueChange = (optionIndex: number, value: string) => {
    setNewOptionValues(prev => ({
      ...prev,
      [optionIndex]: value
    }));
  };
  
  // Generate variants from options - using useCallback to avoid infinite loops
  // Fixed handleGenerateVariants function
  const handleGenerateVariants = useCallback(() => {
    // Don't generate variants during initial load
    if (!productLoaded) return;
    
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
              existing.optionValues.length !== newVariant.optionValues.length) {
            return false;
          }
          
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
        
        
        // For new variants, use default values and a generated ID
        // Preserve existing inventory item ID mapping if possible
        const variantId = generateUUID();
        
        // Find a previous variant that might have relevant data
        // This helps when adding a new option but wanting to keep pricing data
        const singleOptionMatches = currentVariants.filter(existing => {
          if (!existing.optionValues || !Array.isArray(existing.optionValues)) return false;
          
          // Check if ANY option value matches (not all, since we're adding options)
          return newVariant.optionValues.some(newOptVal =>
            existing.optionValues.some(existingOptVal =>
              existingOptVal.optionName === newOptVal.optionName &&
              existingOptVal.value === newOptVal.value
            )
          );
        });

        
        // Use the first matching variant's data as defaults
        const matchingOldVariant = singleOptionMatches[0];
        
        return {
          ...newVariant,
          id: variantId,
          price: matchingOldVariant?.price || 0,
          stock: matchingOldVariant?.stock || 0,
          sku: generateUniqueSku(`${newVariant.title}`),
          // Mark as a new variant for inventory tracking
          isNewVariant: true
        };
      });


      // After generating all variants, ensure their stock values are properly synced to inventory
      // This should be added at the end of the handleGenerateVariants function
      const syncNewVariantsInventory = () => {
        variantsWithExistingData.forEach((variant, index) => {
          // Only process variants with management enabled and a stock value
          if (variant.manageInventory !== false && (variant.stock || variant.stock === 0)) {
            // We need to ensure the inventoryItemId exists
            if (!variant.inventoryItemId && variant.isNewVariant) {
              variant.inventoryItemId = `temp_item_${variant.id}`;
            }
            
            // Only if the variant has an inventory item ID, sync the stock value
            if (variant.inventoryItemId) {
              // This will generate the proper inventory change entry
              handleInventoryChange(
                variant.inventoryItemId,
                DEFAULT_LOCATION_ID,
                'stocked_quantity',
                parseInt(variant.stock) || 0
              );
              
              ////console.log(`Synced new variant ${variant.id} stock ${variant.stock} to inventory item ${variant.inventoryItemId}`);
            }
          }
        });
      };

      // Call the function to sync inventory for new variants
      syncNewVariantsInventory();

      
      ////console.log("Generated variants:", variantsWithExistingData);
      
      // Flag that we have unsaved variant changes
      setHasUnsavedVariantChanges(true);
      
      // Replace all variants with the newly generated ones
      // This ensures incomplete variants are removed
      replaceVariants(variantsWithExistingData);
      
      // Track deleted variants for inventory tracking
      const existingVariantIds = currentVariants
        .filter(v => originalVariantIds.includes(v.id))
        .map(v => v.id);
        
      const newVariantIds = variantsWithExistingData
        .filter(v => !v.isNewVariant)
        .map(v => v.id);
        
      // Find variants that were removed by the regeneration
      const removedVariantIds = existingVariantIds.filter(id => !newVariantIds.includes(id));
      
      // Add these to the deletedVariantIds for batch update
      if (removedVariantIds.length > 0) {
        setDeletedVariantIds(prev => [...prev, ...removedVariantIds]);
      }
      
    } else {
      // If there are no valid options, clear the variants
      replaceVariants([]);
    }
  }, [form, replaceVariants, productLoaded, originalVariantIds]);

  // Load inventory levels for all variants with inventory items
  const loadInventoryLevels = async () => {
    setIsLoadingInventory(true);
    setInventoryError(null);
    
    try {
      const variantInventoryPromises = [];
      const currentVariants = form.getValues('variants');
      const inventoryItemVariantMap: Record<string, number> = {}; // Map inventory item IDs to variant index
      
      // Reset inventory changes
      setInventoryChanges({
        create: [],
        update: [],
        delete: []
      });
      
      // Create a map of inventory item IDs to variant indices and collect fetch promises
      for (let i = 0; i < currentVariants.length; i++) {
        const variant = currentVariants[i];
        
        // Skip variants that don't have manage_inventory enabled
        if (!variant.manageInventory) continue;
        
        // Get inventory item ID from the variant
        const inventoryItemId = getVariantInventoryItemId(variant);
        
        if (inventoryItemId) {
          inventoryItemVariantMap[inventoryItemId] = i;
          variantInventoryPromises.push(
            fetchInventoryLevels({ inventoryItemId })
              .then(response => ({ 
                inventoryItemId, 
                data: response 
              }))
              .catch(error => ({ 
                inventoryItemId, 
                error 
              }))
          );
        }
      }
      
      // Fetch all inventory levels in parallel
      const results = await Promise.all(variantInventoryPromises);
      
      // Process results
      const newInventoryLevels: Record<string, any> = {};
      
      results.forEach(result => {
        if ('data' in result && result.data) {
          newInventoryLevels[result.inventoryItemId] = result.data.inventory_levels || [];
        } else if ('error' in result) {
          ////console.error(`Error fetching inventory for ${result.inventoryItemId}:`, result.error);
        }
      });
      
      setInventoryLevels(newInventoryLevels);
      setIsLoadingInventory(false);
    } catch (error) {
      ////console.error('Error loading inventory levels:', error);
      setInventoryError('Failed to load inventory data. Please try again.');
      setIsLoadingInventory(false);
    }
  };

  // When opening the stock management modal
  const handleOpenStockModal = async () => {
    // Only disable the stock management modal when there are unsaved variant changes
    if (hasUnsavedVariantChanges) {
      // Do not open the modal if there are unsaved changes
      return;
    }
    
    setIsStockModalOpen(true);
    await loadInventoryLevels();
  };

  // Use InventoryManagementModal instead of the built-in StockManagementModal
  const renderInventoryManagementModal = () => {
    if (!isStockModalOpen) return null;
    
    return (
      <Dialog open={isStockModalOpen} onOpenChange={(open) => !open && setIsStockModalOpen(false)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Inventory Management</DialogTitle>
            <DialogDescription>
              Manage stock levels for all variants
            </DialogDescription>
          </DialogHeader>
          
          <InventoryManagementModal
            variants={form.getValues('variants')}
            inventoryLevels={inventoryLevels}
            isLoadingInventory={isLoadingInventory}
            inventoryError={inventoryError}
            handleInventoryChange={handleInventoryChange}
            updateVariant={updateVariant}
            defaultLocationId={DEFAULT_LOCATION_ID}
            batchUpdateInventoryLevels={batchUpdateInventoryLevels}
            inventoryChanges={inventoryChanges}
            onClose={() => setIsStockModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    );
  };

  // Handle updating inventory quantity - modified for stocked quantity only
  const handleInventoryChange = (
    inventoryItemId: string, 
    locationId: string, 
    field: 'stocked_quantity', 
    value: number
  ) => {
    // Ensure we have numeric values
    const numericValue = typeof value === 'string' ? parseInt(value) || 0 : value;
    
    // Ensure location ID is always set
    const actualLocationId = locationId || DEFAULT_LOCATION_ID;
    
    // First update the inventoryLevels state for UI display
    setInventoryLevels(prev => {
      const updatedLevels = { ...prev };
      const levels = updatedLevels[inventoryItemId] || [];
      const levelIndex = levels.findIndex(level => level.location_id === actualLocationId);
    
      if (levelIndex >= 0) {
        // Update existing level
        levels[levelIndex] = {
          ...levels[levelIndex],
          [field]: numericValue
        };
      } else {
        // Create a new level if it doesn't exist
        levels.push({
          id: `temp_${inventoryItemId}_${actualLocationId}`,
          inventory_item_id: inventoryItemId,
          location_id: actualLocationId,
          stocked_quantity: numericValue,
          reserved_quantity: 0,
          available_quantity: numericValue
        });
      }
    
      updatedLevels[inventoryItemId] = levels;
      return updatedLevels;
    });

    // Track changes in inventoryChanges state
    setInventoryChanges(prev => {
      const changes = { ...prev };
      
      // For new inventory items (those starting with temp_), always go to create
      const isNewInventoryItem = inventoryItemId.startsWith('temp_') || 
                                !inventoryLevelsRef.current[inventoryItemId];
      
      // Prepare the inventory entry with numeric values
      const inventoryEntry = {
        inventory_item_id: inventoryItemId,
        location_id: actualLocationId,
        stocked_quantity: numericValue
      };
      
      if (isNewInventoryItem) {
        // Check if already in create queue
        const createIndex = changes.create.findIndex(item => 
          item.inventory_item_id === inventoryItemId && item.location_id === actualLocationId
        );
        
        if (createIndex >= 0) {
          // Update existing create entry
          changes.create[createIndex] = { 
            ...changes.create[createIndex], 
            [field]: numericValue 
          };
        } else {
          // Add new create entry
          changes.create.push(inventoryEntry);
        }
        
        // Remove from update queue if present
        changes.update = changes.update.filter(item => 
          !(item.inventory_item_id === inventoryItemId && item.location_id === actualLocationId)
        );
      } else {
        // Regular case for existing inventory items
        const existsInCreate = changes.create.some(
          item => item.inventory_item_id === inventoryItemId && item.location_id === actualLocationId
        );
        
        const existsInUpdate = changes.update.some(
          item => item.inventory_item_id === inventoryItemId && item.location_id === actualLocationId
        );
        
        if (existsInCreate) {
          // Update in create queue
          const createIndex = changes.create.findIndex(item => 
            item.inventory_item_id === inventoryItemId && item.location_id === actualLocationId
          );
          changes.create[createIndex] = { 
            ...changes.create[createIndex], 
            [field]: numericValue 
          };
        } else if (existsInUpdate) {
          // Update in update queue
          const updateIndex = changes.update.findIndex(item => 
            item.inventory_item_id === inventoryItemId && item.location_id === actualLocationId
          );
          changes.update[updateIndex] = { 
            ...changes.update[updateIndex], 
            [field]: numericValue 
          };
        } else {
          // Add to update queue
          changes.update.push(inventoryEntry);
        }
      }
      
      return changes;
    });
    
    // Also update the variant's stock field for UI consistency
    if (field === 'stocked_quantity') {
      const currentVariants = form.getValues('variants');
      const variantIndex = currentVariants.findIndex(v => {
        const itemId = getVariantInventoryItemId(v);
        return itemId === inventoryItemId;
      });
    
      if (variantIndex >= 0) {
        // Update variant but avoid calling this function again (to prevent infinite loop)
        const updatedVariant = {...currentVariants[variantIndex], stock: numericValue};
        updateVariant(variantIndex, updatedVariant);
      }
    }
  };
  
  // Get images for a variant
  const getVariantSpecificImages = (variantId: string): MediaItem[] => {
    return mediaItems.filter(item => 
      item.variantInfo?.variantId === variantId
    );
  };

  // Get images for a specific option value
  const getOptionValueImages = (optionName: string, value: string): MediaItem[] => {
    return mediaItems.filter(item => 
      item.variantInfo?.optionName === optionName && 
      item.variantInfo?.optionValues?.includes(value)
    );
  };

  // Update a specific variant field
  const handleVariantFieldChange = (variantIndex: number, field: string, value: any) => {
    const currentVariants = form.getValues('variants');
    const currentVariant = currentVariants[variantIndex];
    
    // Create a deep copy to ensure nested objects are updated properly
    const updatedVariant = JSON.parse(JSON.stringify(currentVariant));
    updatedVariant[field] = value;
    
    updateVariant(variantIndex, updatedVariant);
    
    // Mark that we have unsaved variant changes
    setHasUnsavedVariantChanges(true);
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
        
        // If updating price, also update the prices array
        if (field === 'price') {
          const currentVariant = currentVariants[variantIndex];
          if (currentVariant.prices && Array.isArray(currentVariant.prices)) {
            const updatedPrices = currentVariant.prices.map(p => ({
              ...p,
              amount: value
            }));
            handleVariantFieldChange(variantIndex, 'prices', updatedPrices);
          }
        }
      }
    });
    
    // Clear bulk edit values after applying
    if (field === 'price') setBulkPrice('');
    
    // Mark that we have unsaved variant changes
    setHasUnsavedVariantChanges(true);
  };

  // Handle bulk inventory management toggle
  const handleBulkInventoryToggle = (value: boolean) => {
    if (!selectedVariants.length) return;
    
    const currentVariants = form.getValues('variants');
    
    // Update each selected variant
    selectedVariants.forEach(variantId => {
      const variantIndex = currentVariants.findIndex(v => v.id === variantId);
      if (variantIndex !== -1) {
        handleVariantFieldChange(variantIndex, 'manageInventory', value);
      }
    });
    
    // Mark that we have unsaved variant changes
    setHasUnsavedVariantChanges(true);
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
    
    // Mark that we have unsaved variant changes
    setHasUnsavedVariantChanges(true);
  };

 // Handle removing a variant with tracking for batch update
  const handleRemoveVariant = (index: number) => {
    const variant = form.getValues(`variants.${index}`);
    
    // If this is an existing variant (has an ID and was in the original data), track for deletion
    if (variant.id && originalVariantIds.includes(variant.id)) {
      setDeletedVariantIds(prev => [...prev, variant.id]);
    }
    
    // Remove from the form
    removeVariant(index);
    
    // Mark that we have unsaved variant changes
    setHasUnsavedVariantChanges(true);
  };
  
  // Handle file change for standard and variant-specific uploads
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement> | HTMLInputElement, 
    variantInfo?: VariantInfo
  ): void => {
    try {
      const fileInput = e.target || e;
      if (fileInput.files && fileInput.files.length > 0) {
        // Create new media items with proper association metadata
        const newMedia = Array.from(fileInput.files).map((file, index) => {
          const mediaItem: MediaItem = {
            file,
            url: URL.createObjectURL(file),
            rank: mediaItems.length + index,
            isNew: true
          };
          
          // IMPORTANT: If variantInfo is provided, add it directly to the mediaItem
          if (variantInfo) {
            mediaItem.variantInfo = variantInfo;
            
            // For color options, also set the colorValue property
            if (variantInfo.optionName && 
                variantInfo.optionValues && 
                variantInfo.optionValues.length > 0 && 
                isColorOption(variantInfo.optionName)) {
              mediaItem.colorValue = variantInfo.optionValues[0];
            }
          }
          
          return mediaItem;
        });
        
        // Add the new media items to the existing ones
        setMediaItems(prev => [...prev, ...newMedia]);
        
        // Clear the file input
        fileInput.value = '';
      }
    } catch (error) {
      ////console.error("Error handling file upload:", error);
      alert("Error uploading files. Please try again.");
    }
  };

  // FIXED: Added this function to handle file uploads specifically for variant/option associated images
  const handleAssociatedFileUpload = (files: FileList, associationType: 'variant' | 'option', associationValue: { 
    variantId?: string, 
    optionName?: string, 
    optionValue?: string 
  }) => {
    if (!files || files.length === 0) return;
    
    const newMedia = Array.from(files).map((file, index) => {
      const mediaItem: MediaItem = {
        file,
        url: URL.createObjectURL(file),
        rank: mediaItems.length + index,
        isNew: true,
        variantInfo: {}
      };

      if (associationType === 'variant' && associationValue.variantId) {
        mediaItem.variantInfo = {
          variantId: associationValue.variantId
        };
      } else if (associationType === 'option' && associationValue.optionName && associationValue.optionValue) {
        mediaItem.variantInfo = {
          optionName: associationValue.optionName,
          optionValues: [associationValue.optionValue]
        };
        // For color options, also set colorValue
        if (isColorOption(associationValue.optionName)) {
          mediaItem.colorValue = associationValue.optionValue;
        }
      }
      
      return mediaItem;
    });
    
    setMediaItems(prev => [...prev, ...newMedia]);
  };

  const handleDirectVariantUpload = (files: FileList, variantId: string) => {
    if (!files || files.length === 0) return;
    
    const fileInput = { files, value: '' } as HTMLInputElement;
    handleFileChange(fileInput, { variantId });
  };

  // To handle option-specific uploads directly from the ImageManager
  const handleDirectOptionUpload = (files: FileList, optionName: string, optionValue: string) => {
    if (!files || files.length === 0) return;
    
    const fileInput = { files, value: '' } as HTMLInputElement;
    handleFileChange(fileInput, { 
      optionName, 
      optionValues: [optionValue] 
    });
  };

  // FIXED: Added new function to handle file uploads for variant/option images
  const handleVariantImageUpload = (files: FileList, variantId: string) => {
    handleAssociatedFileUpload(files, 'variant', { variantId });
  };

  // FIXED: Added new function to handle file uploads for option value images
  const handleOptionImageUpload = (files: FileList, optionName: string, optionValue: string) => {
    handleAssociatedFileUpload(files, 'option', { optionName, optionValue });
  };

  // Handle adding a new image via URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    
    // Basic URL validation
    try {
      new URL(newImageUrl); // Will throw if not a valid URL
      
      // Add to media items
      setMediaItems((prev) => [
        ...prev,
        {
          file: null,
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

  // Handle option value selection for variant images
  const handleOptionValueSelect = (optionId: string, value: string) => {
    const options = form.getValues('options');
    const option = options.find(opt => opt.id === optionId);
    
    if (option) {
      setSelectedOption(option);
      setSelectedOptionValue(value);
    }
  };

  // Trigger the hidden file input when clicking the dropzone
  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  // Remove an image and revoke its object URL if necessary
  const handleRemoveImage = (index: number) => {
    setMediaItems((prev) => {
      const removed = prev[index];
      if (removed.file) {
        URL.revokeObjectURL(removed.url);
      }
      // Return filtered array with reordered ranks
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((item, i) => ({ ...item, rank: i }));
    });
  };

  // Move image up in order
  const handleMoveImageUp = (index: number) => {
    if (index === 0) return; // Already at the top
    
    setMediaItems((prev) => {
      const newMedia = [...prev];
      const temp = newMedia[index - 1];
      newMedia[index - 1] = { ...newMedia[index], rank: index - 1 };
      newMedia[index] = { ...temp, rank: index };
      return newMedia;
    });
  };

  // Move image down in order
  const handleMoveImageDown = (index: number) => {
    if (index === mediaItems.length - 1) return; // Already at the bottom
    
    setMediaItems((prev) => {
      const newMedia = [...prev];
      const temp = newMedia[index + 1];
      newMedia[index + 1] = { ...newMedia[index], rank: index + 1 };
      newMedia[index] = { ...temp, rank: index };
      return newMedia;
    });
  };

  // Upload a single file to the server with better metadata handling
  const uploadFile = async (file: File, variantInfo?: VariantInfo): Promise<{url: string, id: string}> => {
    try {
      const formData = new FormData();
      formData.append('files', file);
      
      // Add explicit metadata for variant associations
      if (variantInfo) {
        const metadata: Record<string, any> = {};
        
        if (variantInfo.variantId) {
          metadata.variant_id = variantInfo.variantId;
        }
        
        if (variantInfo.optionName && variantInfo.optionValues) {
          metadata.option_values = [{
            option_name: variantInfo.optionName,
            values: variantInfo.optionValues
          }];
        }
        
        // Add metadata to formData as a separate field
        if (Object.keys(metadata).length > 0) {
          formData.append('metadata', JSON.stringify(metadata));
          ////console.log('Uploading image with variant metadata:', metadata);
        }
      }
      
      const response = await uploadProductImage({
        productId: id,
        formData
      });
      
      if (response && 'id' in response) {
        ////console.log('Image upload successful, received ID:', response.id);
        // Store the mapping from original URL to new ID
        const originalUrl = URL.createObjectURL(file);
        setUploadedImageMap(prev => ({
          ...prev,
          [originalUrl]: response.id
        }));
        
        return {
          url: response.url || (response as any).originalPath || (response as any).path,
          id: response.id
        };
      }
      
      throw new Error('Failed to get image URL from response');
    } catch (error) {
      ////console.error('Error uploading file:', error);
      throw error;
    }
  };
  
  // Add new product detail bullet point
  const handleAddProductDetail = () => {
    appendProductDetail({ id: generateUUID(), text: '' });
  };

  // For debugging when update button doesn't work
  const handleManualSubmit = () => {
    // //console.log('Manual submit button clicked');
    // //console.log('Form state:', form.formState);
    // //console.log('Form values:', form.getValues());
    // //console.log('Media items:', mediaItems);
    form.handleSubmit(onSubmit)();
  };

  // Open product in storefront
  const handleViewProduct = () => {
    if (productViewUrl) {
      window.open(productViewUrl, '_blank');
    }
  };

  // Reset unsaved changes flag after successful save
  const resetUnsavedChangesFlag = () => {
    setHasUnsavedVariantChanges(false);
  };

  // Monitor option changes to update variants, but only after initial load
  useEffect(() => {
    // Skip this effect until product is fully loaded
    if (!productLoaded) return;
    
    const subscription = form.watch((formValues, { name, type }) => {
      // Check if the changed field is an option field
      if (name && (name.includes('options'))) {
        ////console.log(`Form field changed: ${name}, type: ${type}`);
        const currentOptions = form.getValues('options');
        
        // If the last option has values and we have fewer than 3 options
        if (currentOptions.length > 0) {
          const lastOption = currentOptions[currentOptions.length - 1];
          const hasValues = lastOption?.optionValues && 
                          Array.isArray(lastOption.optionValues) && 
                          lastOption.optionValues.length > 0;
          
          if (hasValues && currentOptions.length < 3) {
            // Check if we don't already have an empty option at the end
            const hasEmptyOption = currentOptions.some(opt => 
              opt.title === '' && (!opt.optionValues || 
              (Array.isArray(opt.optionValues) && opt.optionValues.length === 0))
            );
            
            if (!hasEmptyOption) {
              // Add a new empty option with explicit imageAssociation=false
              appendOption({ 
                id: generateUUID(),
                title: '', 
                optionValues: [],
                imageAssociation: false  // Explicitly set to false
              });
            }
          }
        }
        
        // If the change is significant, regenerate the variants
        if (type === 'change') {
          handleGenerateVariants();
        }
      }
    });
    
    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, [appendOption, form, handleGenerateVariants, productLoaded]);

  // Fetch categories when component mounts
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

  // Cleanup any object URLs for newly added files when unmounting
  const mediaRef = useRef(mediaItems);
  useEffect(() => {
    mediaRef.current = mediaItems;
  }, [mediaItems]);

  useEffect(() => {
    return () => {
      mediaRef.current.forEach((item) => {
        if (item.file) URL.revokeObjectURL(item.url);
      });
    };
  }, []);

  // Log current media items for debugging
  useEffect(() => {
    ////console.log("Current media items:", mediaItems);
    
    // For each option with image association, log whether images exist
    const options = form.getValues('options');
    const optionsWithImageAssoc = options.filter(opt => opt.imageAssociation === true);
    
    optionsWithImageAssoc.forEach(option => {
      if (option.optionValues) {
        option.optionValues.forEach(value => {
          const imagesForValue = mediaItems.filter(item => 
            item.variantInfo?.optionName === option.title && 
            item.variantInfo?.optionValues?.includes(value)
          );
          
          //console.log(`Images for ${option.title}: ${value}:`, imagesForValue.length, imagesForValue);
        });
      }
    });
  }, [mediaItems, form]);

  // FIXED: Helper function to prepare option-specific images metadata for all option types
  const prepareOptionImagesMetadata = (options: Option[], media: MediaItem[]) => {
  // Start with empty arrays for all options that have image associations
  const optionImages: Record<string, any[]> = {};
  
  // Make sure options exists and is an array before trying to iterate
  if (Array.isArray(options)) {
    options.forEach(opt => {
      if (opt && opt.imageAssociation) {
        optionImages[opt.title] = [];
      }
    });
  
    // Add images for each option value
    if (Array.isArray(media)) {
      media.forEach(item => {
        // Skip any item without variant info or missing id
        if (!item || !item.variantInfo || !item.id) return;
        
        const { optionName, optionValues } = item.variantInfo;
        
        // If this image is for an option value
        if (optionName && optionValues && Array.isArray(optionValues) && optionValues.length > 0) {
          // Make sure this option exists in our tracking object
          if (!optionImages[optionName]) {
            // Check if this option should have image association
            const matchingOption = options.find(opt => opt.title === optionName);
            if (!matchingOption || !matchingOption.imageAssociation) {
              // Skip if option doesn't exist or doesn't have image association enabled
              return;
            }
            optionImages[optionName] = [];
          }
          
          // For each option value, add this image
          optionValues.forEach(value => {
            if (value) {
              optionImages[optionName].push({
                option_name: optionName,
                option_value: value,
                imageId: item.id,
                url: item.url
              });
            }
          });
        }
      });
    }
  }
  
  return optionImages;
};


  // Update the submission handler with improved image handling for all option types
  // THIS IS A COMPREHENSIVE FIX

// APPROACH: The key issue appears to be in one of the find() operations in the product update flow.
// Rather than trying to fix individual functions, let's add a safer approach to onSubmit
// with error trapping at each key section and replacing find() with alternative approaches.

const onSubmit = async (values: ProductFormValues) => {
  // Validate required fields
  if (!values.title.trim()) {
    setError('Product title is required');
    return;
  }
  
  if (!id) {
    setError('Product ID is missing. Cannot update product.');
    return;
  }
  
  setIsSubmitting(true);
  setError(null);
  
  // Add try/catch to the overall function
  try {
    // Generate a handle if none provided
    if (!values.handle.trim()) {
      values.handle = values.title.toLowerCase().replace(/\s+/g, '-');
    }
    
    // --- STEP 1: Upload Images (wrapped with try/catch) ---
    try {
      // Step 1: Upload any new image files first
      const updatedMedia = [...mediaItems];
      
      // Upload each new image file first and update IDs
      for (let i = 0; i < updatedMedia.length; i++) {
        const item = updatedMedia[i];
        
        if (item && item.file) {
          try {
            //console.log(`Uploading image ${i} with variant info:`, item.variantInfo);
            const uploadResult = await uploadFile(item.file, item.variantInfo);
            
            // Update the media item with server values
            updatedMedia[i] = {
              ...updatedMedia[i],
              url: uploadResult.url,
              id: uploadResult.id,
              file: null,
              isNew: false
            };
            
            //console.log(`Updated image ${i} with new ID: ${uploadResult.id}`);
          } catch (uploadError) {
            //console.error(`Failed to upload image ${i}:`, uploadError);
            setError(`Failed to upload image: ${uploadError.message || 'Unknown error'}`);
            setIsSubmitting(false);
            return;
          }
        }
      }
      
      // Update mediaItems with the uploaded images
      setMediaItems(updatedMedia);
      
      // Prepare images in the API format - ensure they all have proper IDs
      const images = (updatedMedia || [])
        .filter(item => item && item.url && !item.url.startsWith('blob:')) // Filter out any remaining blob URLs
        .map((item) => ({
          url: item.url,
          rank: item.rank || 0,
          id: item.id, // Include ID if available
          // Include color association if available
          ...(item.colorValue ? { metadata: { color: item.colorValue } } : {}),
        }));
      
      //console.log("Final images to be sent to API:", images);
      
      // --- STEP 2: Process Options (wrapped with try/catch) ---
      try {
        // Filter and transform options to API format (remove empty ones)
        const validOptions = (values.options || []).filter(opt => 
          opt && opt.title && 
          Array.isArray(opt.optionValues) && 
          opt.optionValues.length > 0
        );
        
        // Check if we have at least one option with values
        if (validOptions.length === 0) {
          setError('You must add at least one option (like Size or Color) with values');
          setIsSubmitting(false);
          return;
        }
        
        // Format options to match API expectations 
        const options = validOptions.map((opt) => {
          const option = {
            title: opt.title,
            values: opt.optionValues
          };
          
          // Include original ID only if editing an existing option
          if (opt.id) {
            // @ts-ignore
            option.id = opt.id;
          }
          
          return option;
        });
        
        // --- STEP 3: Process Variants (wrapped with try/catch) ---
        try {
          // Validate variants - make sure each has at least a title and SKU
          const invalidVariants = (values.variants || []).filter(v => !v || !v.title || !v.sku);
          if (invalidVariants.length > 0) {
            setError('All variants must have a title and SKU');
            setIsSubmitting(false);
            return;
          }
          
          // Check if we have variants
          if (!values.variants || values.variants.length === 0) {
            setError('You must add at least one variant. Add option values first.');
            setIsSubmitting(false);
            return;
          }
          
          // --- STEP 4: Prepare Metadata (wrapped with try/catch) ---
          try {
            // Prepare metadata with product details and story
            const metadata: Record<string, any> = { 
              ...((originalData && originalData.metadata) ? originalData.metadata : {})
            };

            // Process product details - extract text values from the array
            if (values.productDetails && Array.isArray(values.productDetails)) {
              const validDetails = values.productDetails
                .filter(detail => detail && detail.text && detail.text.trim() !== '')
                .map(detail => detail.text.trim());
              
              if (validDetails.length > 0) {
                metadata.product_details = JSON.stringify(validDetails);
              }
            }

            // Process story behind design - handle HTML content
            if (values.storyBehindDesign && typeof values.storyBehindDesign === 'string') {
              metadata.description_story = values.storyBehindDesign.trim();
            }
            
            // Process fulfillment data (creator fulfillment)
            // Process fulfillment data (preserve original type)
            const fulfillmentInfo = {
              type: fulfillmentData?.type || "Creator-fulfilment", // Use original type or fallback
              handling_time: values.handlingTime || '2-3',
              shipping_time: values.shippingDays || '7-10'
            };
            metadata.fulfillment_type = JSON.stringify(fulfillmentInfo);
            //console.log("product fulfillment type:", fulfillmentInfo);

            // --- STEP 5: Process Colors and Image Associations (wrapped with try/catch) ---
            try {
              // Get the form data safely
              const formData = form.getValues();
              
              // Build color hex values metadata
              let colorHexArray = [];
              if (formData.options) {
                // Find color option without using find() - use a for loop instead
                let formColorOption = null;
                for (let i = 0; i < formData.options.length; i++) {
                  const opt = formData.options[i];
                  if (opt && (
                      (opt.title && opt.title.toLowerCase() === 'color') || 
                      (opt.title && opt.title.toLowerCase() === 'colour')
                  )) {
                    formColorOption = opt;
                    break;
                  }
                }
                
                // Process color hex values if present
                if (formColorOption && formColorOption.colorHexValues) {
                  // Convert the color hex values object to an array of {name, hex} pairs
                  colorHexArray = Object.entries(formColorOption.colorHexValues).map(
                    ([colorName, hexValue]) => ({
                      name: colorName,
                      hex: hexValue
                    })
                  );
                  
                  // Store as a single JSON string in metadata
                  if (colorHexArray.length > 0) {
                    metadata.color_hex_values = JSON.stringify(colorHexArray);
                  }
                }
              }
              
              // Store image association settings - without using find()
               const imageAssociationSettings = values.options
        .filter(opt => opt.title && Array.isArray(opt.optionValues) && opt.optionValues.length > 0)
        .map(opt => {
          // Ensure imageAssociation is a proper boolean
          const isEnabled = opt.imageAssociation === true;
          return {
            option_id: opt.id,
            option_name: opt.title,
            enabled: isEnabled // Always use proper boolean here
          };
        });
              
              // Log the image association settings being saved
              //console.log("Saving image association settings:", imageAssociationSettings);
              if (imageAssociationSettings.length > 0) {
                metadata.variant_specific_image_option = JSON.stringify(imageAssociationSettings);
              }
              
              // --- STEP 6: Process Option-specific Images ---
              try {
                // SIMPLIFIED APPROACH: Build option images metadata directly without using complex functions
                const optionImagesArray = [];
                const colorImagesArray = [];
                
                // Only process if we have options and media
                if (formData.options && Array.isArray(formData.options) && updatedMedia && Array.isArray(updatedMedia)) {
                  // First, build a map of options with image associations
                  const optionsWithImageAssociations = {};
                  for (let i = 0; i < formData.options.length; i++) {
                    const opt = formData.options[i];
                    if (opt && opt.title && opt.imageAssociation === true) {
                      optionsWithImageAssociations[opt.title] = true;
                    }
                  }
                  
                  // Now process each media item for option associations
                  for (let i = 0; i < updatedMedia.length; i++) {
                    const item = updatedMedia[i];
                    if (!item || !item.variantInfo || !item.id) continue;
                    
                    const { optionName, optionValues } = item.variantInfo;
                    
                    // If this image is for an option value
                    if (optionName && optionValues && Array.isArray(optionValues) && optionValues.length > 0) {
                      // Check if this option has image association enabled
                      if (optionsWithImageAssociations[optionName]) {
                        // For each option value, add this image
                        for (let j = 0; j < optionValues.length; j++) {
                          const value = optionValues[j];
                          if (value) {
                            const optionImage = {
                              option_name: optionName,
                              option_value: value,
                              imageId: item.id,
                              url: item.url
                            };
                            
                            optionImagesArray.push(optionImage);
                            
                            // For color options, also add to color-specific array
                            if (optionName.toLowerCase() === 'color' || optionName.toLowerCase() === 'colour') {
                              colorImagesArray.push({
                                color: value,
                                url: item.url,
                                imageId: item.id
                              });
                            }
                          }
                        }
                      }
                    }
                  }
                }
                
                // Add option images to metadata
                if (optionImagesArray.length > 0) {
                  metadata.option_images = JSON.stringify(optionImagesArray);
                }
                
                // Add color images for backward compatibility
                if (colorImagesArray.length > 0) {
                  metadata.color_images = JSON.stringify(colorImagesArray);
                }
                
                // --- STEP 7: Prepare Variants --- 
                try {
                  // Use a simplified approach to format variants for the API
                  // without relying on external functions
                  const formatVariantForApi = (variant) => {
                    if (!variant) return null;
                    
                    // Convert option values to the format expected by the API
                    const options = {};
                    if (variant.optionValues && Array.isArray(variant.optionValues)) {
                      for (let i = 0; i < variant.optionValues.length; i++) {
                        const opt = variant.optionValues[i];
                        if (opt && opt.optionName && opt.value) {
                          options[opt.optionName] = opt.value;
                        }
                      }
                    }
                    
                    const price = typeof variant.price === 'string' ? parseFloat(variant.price) : (variant.price || 0);
                    
                    // Get associated images - without complex filtering
                    const variantImageIds = [];
                    const variantImageUrls = [];
                    const optionTypeImages = {};
                    
                    // Only process if we have media
                    if (updatedMedia && Array.isArray(updatedMedia)) {
                      for (let i = 0; i < updatedMedia.length; i++) {
                        const item = updatedMedia[i];
                        if (!item || !item.id) continue;
                        
                        let isAssociated = false;
                        
                        // Check for direct variant association
                        if (item.variantInfo && item.variantInfo.variantId === variant.id) {
                          isAssociated = true;
                        }
                        
                        // Check for option value association
                        if (item.variantInfo && item.variantInfo.optionName && 
                            item.variantInfo.optionValues && Array.isArray(item.variantInfo.optionValues)) {
                          
                          // Check each option value in the variant
                          if (variant.optionValues && Array.isArray(variant.optionValues)) {
                            for (let j = 0; j < variant.optionValues.length; j++) {
                              const optVal = variant.optionValues[j];
                              if (optVal && optVal.optionName === item.variantInfo.optionName) {
                                // Check if this option value is in the image's associated values
                                if (item.variantInfo.optionValues.includes(optVal.value)) {
                                  isAssociated = true;
                                  
                                  // Add to option-specific images
                                  if (!optionTypeImages[optVal.optionName]) {
                                    optionTypeImages[optVal.optionName] = [];
                                  }
                                  
                                  optionTypeImages[optVal.optionName].push({
                                    option_name: optVal.optionName,
                                    option_value: optVal.value,
                                    url: item.url,
                                    imageId: item.id
                                  });
                                  
                                  // No break here - we want to check all option values
                                }
                              }
                            }
                          }
                        }
                        
                        // If associated, add to lists
                        if (isAssociated) {
                          if (item.id && typeof item.id === 'string') {
                            variantImageIds.push(item.id);
                          }
                          
                          if (item.url && !item.url.startsWith('blob:')) {
                            variantImageUrls.push(item.url);
                          }
                        }
                      }
                    }
                    
                    // Build the variant metadata
                    const variantMetadata = {
                      ...(variant.metadata || {}) // Preserve existing metadata
                    };
                    
                    // Add images to metadata
                    if (variantImageUrls.length > 0) {
                      variantMetadata.variant_images = JSON.stringify(variantImageUrls);
                    }
                    
                    if (variantImageIds.length > 0) {
                      variantMetadata.variant_image_ids = JSON.stringify(variantImageIds);
                    }
                    
                    // Add option images to metadata
                    const allOptionImages = [];
                    Object.keys(optionTypeImages).forEach(optName => {
                      const images = optionTypeImages[optName];
                      if (Array.isArray(images)) {
                        allOptionImages.push(...images);
                      }
                    });
                    
                    if (allOptionImages.length > 0) {
                      variantMetadata.option_images = JSON.stringify(allOptionImages);
                    }
                    
                    // Add color images (for backward compatibility)
                    const colorImages = optionTypeImages['Color'] || optionTypeImages['Colour'] || [];
                    if (colorImages.length > 0) {
                      const legacyColorImages = colorImages.map(img => ({
                        color: img.option_value,
                        url: img.url,
                        imageId: img.imageId
                      }));
                      
                      variantMetadata.color_images = JSON.stringify(legacyColorImages);
                    }
                    
                    return {
                      id: variant.id,
                      title: variant.title,
                      sku: variant.sku || '',
                      allow_backorder: Boolean(variant.allowBackorder),
                      manage_inventory: Boolean(variant.manageInventory),
                      options,
                      prices: [
                        {
                          amount: price,
                          currency_code: 'inr'
                        }
                      ],
                      metadata: variantMetadata
                    };
                  };
                  
                  // Format all variants
                  const allVariants = values.variants || [];
                  const formattedVariants = [];
                  
                  for (let i = 0; i < allVariants.length; i++) {
                    const result = formatVariantForApi(allVariants[i]);
                    if (result) formattedVariants.push(result);
                  }
                  
                  // --- STEP 8: Prepare Final Data For Submission ---
                  try {
                    // Identify new variants and updated variants
                    const createdVariants = [];
                    const updatedVariants = [];
                    
                    for (let i = 0; i < formattedVariants.length; i++) {
                      const v = formattedVariants[i];
                      if (originalVariantIds && Array.isArray(originalVariantIds) && !originalVariantIds.includes(v.id)) {
                        createdVariants.push(v);
                      } else if (originalVariantIds && Array.isArray(originalVariantIds) && originalVariantIds.includes(v.id)) {
                        updatedVariants.push(v);
                      }
                    
                    }
                    
                    // Log variant changes
                    // console.log("Variant changes:", {
                    //   create: createdVariants.length,
                    //   update: updatedVariants.length,
                    //   delete: deletedVariantIds.length
                    // });
                    
                    // Construct the product object in API format (without variants)
                    const productData = {
                      title: values.title.trim(),
                      subtitle: values.subtitle?.trim() || "",
                      handle: values.handle.trim() || values.title.toLowerCase().replace(/\s+/g, '-'),
                      description: values.description.trim() || "",
                      status: values.status,
                      thumbnail: values.thumbnail || "",
                      discountable: Boolean(values.discountable),
                      weight: values.weight ? parseInt(values.weight) || 0 : 0,
                      length: values.length ? parseInt(values.length) || 0 : 0,
                      width: values.width ? parseInt(values.width) || 0 : 0,
                      height: values.height ? parseInt(values.height) || 0 : 0,
                      material: values.material || undefined,
                      origin_country: values.origin_country || undefined,
                      options,
                      images,
                      // Add category if selected
                      //categories: values.category_id ? [{ id: values.category_id }] : [],
                      categories: values.category_ids?.map(id => ({ id })) || [],
                      metadata: metadata
                    };
                    
                    //console.log("Updating product with data:", productData);
                    
                    // --- STEP 9: Make API Calls ---
                    try {
                      // First, update the main product
                      const result = await updateProduct({ 
                        product: {
                          id, // This is used to construct the URL in fetchApi.js
                          ...productData // This is the actual payload (without the id field inside it)
                        } 
                      });
                      
                      //console.log("Product update result:", result);
                      
                      // Then, handle variants separately with batch API
                      if (createdVariants.length > 0 || updatedVariants.length > 0 || 
                          (deletedVariantIds && deletedVariantIds.length > 0)) {
                        // For the batchUpdateVariants function, include currency_code
                        const variantResult = await batchUpdateVariants({
                          productId: id,
                          variantChanges: {
                            create: createdVariants.length > 0 ? createdVariants : undefined,
                            update: updatedVariants.length > 0 ? updatedVariants : undefined,
                            delete: deletedVariantIds && deletedVariantIds.length > 0 ? deletedVariantIds : undefined,
                          }
                        });
                        
                        //console.log("Variant update result:", variantResult);
                      }
                      
                      // Process inventory operations (wrap with try/catch)
                      try {
                        // Handle inventory changes with careful null checks
                        if (!isLoadingInventory) {
                          const currentVariants = form.getValues('variants') || [];
                          
                          // Create or update inventory items based on variant stock values
                          const inventoryOperations = {
                            create: [],
                            update: []
                          };
                          
                          // Process each variant with inventory management enabled
                          for (let i = 0; i < currentVariants.length; i++) {
                            const variant = currentVariants[i];
                            if (variant && variant.manageInventory) {
                              // Get or generate inventory item ID
                              const inventoryItemId = variant.inventoryItemId || `temp_item_${variant.id}`;
                              
                              // Determine if this is a create or update operation
                              const isNew = isNewVariant(variant);
                              
                              const inventoryEntry = {
                                inventory_item_id: inventoryItemId,
                                location_id: DEFAULT_LOCATION_ID,
                                stocked_quantity: parseInt(variant.stock) || 0
                              };
                              
                              // New variants always go to create
                              if (isNew) {
                                inventoryOperations.create.push(inventoryEntry);
                                //console.log(`New variant ${variant.id} added to CREATE inventory ops`);
                              } else {
                                // For existing variants, check if they already have inventory
                                const inventoryExists = inventoryLevelsRef.current && 
                                  inventoryLevelsRef.current[inventoryItemId] && 
                                  inventoryLevelsRef.current[inventoryItemId].some(
                                    level => level.location_id === DEFAULT_LOCATION_ID && 
                                             (!level.id || !level.id.startsWith('temp_'))
                                  );
                                
                                if (inventoryExists) {
                                  inventoryOperations.update.push(inventoryEntry);
                                } else {
                                  inventoryOperations.create.push(inventoryEntry);
                                }
                              }
                            }
                          }
                          
                          // Process inventory operations if we have any
                          if (inventoryOperations.create.length > 0 || inventoryOperations.update.length > 0) {
                            //console.log("Updating inventory with operations:", inventoryOperations);
                            
                            try {
                              const inventoryResult = await batchUpdateInventoryLevels(inventoryOperations);
                              //console.log("Inventory update result:", inventoryResult);
                            } catch (inventoryError) {
                              //console.error("Error updating inventory levels:", inventoryError);
                              // Continue with product update even if inventory update fails
                            }
                          }
                        }
                        
                        // --- STEP 10: Handle Success ---
                        // Reset unsaved changes flag
                        setHasUnsavedVariantChanges(false);
                        
                        // Show success message
                        toast({
                          title: "Product Updated",
                          description: "Your product has been successfully updated.",
                          variant: "default",
                        });
                        
                        // Navigate back to products list
                        setError(null);
                        setProductLoaded(false);
                        navigate({ to: '/products' });
                      } catch (inventoryError) {
                        //console.error("Error handling inventory:", inventoryError);
                        setError(`Failed to update inventory: ${inventoryError?.message || 'Unknown error'}`);
                        setIsSubmitting(false);
                      }
                    } catch (apiError) {
                      //console.error('API Error updating product:', apiError);
                      handleApiError(apiError);
                    }
                  } catch (dataPreparationError) {
                    //console.error('Error preparing final data:', dataPreparationError);
                    setError(`Failed to prepare final data: ${dataPreparationError?.message || 'Unknown error'}`);
                    setIsSubmitting(false);
                  }
                } catch (variantFormattingError) {
                  //console.error('Error formatting variants:', variantFormattingError);
                  setError(`Failed to format variants: ${variantFormattingError?.message || 'Unknown error'}`);
                  setIsSubmitting(false);
                }
              } catch (optionImagesError) {
                //console.error('Error processing option images:', optionImagesError);
                setError(`Failed to process option images: ${optionImagesError?.message || 'Unknown error'}`);
                setIsSubmitting(false);
              }
            } catch (colorProcessingError) {
              //console.error('Error processing color data:', colorProcessingError);
              setError(`Failed to process colors: ${colorProcessingError?.message || 'Unknown error'}`);
              setIsSubmitting(false);
            }
          } catch (metadataError) {
            //console.error('Error preparing metadata:', metadataError);
            setError(`Failed to prepare metadata: ${metadataError?.message || 'Unknown error'}`);
            setIsSubmitting(false);
          }
        } catch (variantError) {
          //console.error('Error processing variants:', variantError);
          setError(`Failed to process variants: ${variantError?.message || 'Unknown error'}`);
          setIsSubmitting(false);
        }
      } catch (optionError) {
        //console.error('Error processing options:', optionError);
        setError(`Failed to process options: ${optionError?.message || 'Unknown error'}`);
        setIsSubmitting(false);
      }
    } catch (imageError) {
      //console.error('Error processing images:', imageError);
      setError(`Failed to process images: ${imageError?.message || 'Unknown error'}`);
      setIsSubmitting(false);
    }
  } catch (error: any) {
    //console.error('Overall error in product update:', error);
    setError(`Failed to update product: ${error?.message || 'Unknown error'}`);
    setIsSubmitting(false);
  } finally {
    setIsSubmitting(false);
  }
};

// Helper function to handle API errors
const handleApiError = (apiError: any) => {
  //console.error('API Error details:', apiError);
  
  // More detailed error handling
  let errorMessage = 'API Error: ';
  
  if (apiError.response) {
    //console.error('API Error response:', apiError.response);
    //console.error('Error response data:', apiError.response.data);
    
    if (apiError.response.data?.message) {
      errorMessage += apiError.response.data.message;
    } else if (apiError.response.data?.error) {
      errorMessage += apiError.response.data.error;
    } else if (apiError.response.status) {
      errorMessage += `HTTP ${apiError.response.status}`;
      if (apiError.response.statusText) errorMessage += ` - ${apiError.response.statusText}`;
    } else {
      errorMessage += apiError.message || 'Unknown API error';
    }
    
    // If we have detailed validation errors, show those too
    if (apiError.response.data?.errors && Array.isArray(apiError.response.data.errors)) {
      const errorsDetail = apiError.response.data.errors
        .map((e: any) => `${e.path || ''}: ${e.message || 'Invalid'}`)
        .join('; ');
      
      if (errorsDetail) {
        errorMessage += ` - ${errorsDetail}`;
      }
    }
  } else if (apiError.request) {
    errorMessage = 'Network error: No response received from server. Please check your connection.';
  } else {
    errorMessage = `Error: ${apiError.message || 'Unknown error occurred'}`;
  }
  
  setError(errorMessage);
  setIsSubmitting(false);
};
  
  // Stock Management Modal Component
  const StockManagementModal = () => {
    const [localInventoryLevels, setLocalInventoryLevels] = useState(inventoryLevels);
    const [updating, setUpdating] = useState(false);
    
    // Function to handle closing the modal
    const handleCloseModal = () => {
      setIsStockModalOpen(false);
    };
    
    // Function to handle stock changes within the modal
    const handleStockChange = (
      inventoryItemId: string, 
      locationId: string, 
      field: 'stocked_quantity' | 'incoming_quantity', 
      value: string | number
    ) => {
      const numericValue = typeof value === 'string' ? parseInt(value) || 0 : value;
      
      // Update local inventory levels
      setLocalInventoryLevels(prev => {
        const updatedLevels = { ...prev };
        const levels = [...(updatedLevels[inventoryItemId] || [])]; 
        const levelIndex = levels.findIndex(level => level.location_id === locationId);
        
        if (levelIndex >= 0) {
          levels[levelIndex] = {
            ...levels[levelIndex],
            [field]: numericValue
          };
        } else {
          levels.push({
            id: `temp_${inventoryItemId}_${locationId}`,
            inventory_item_id: inventoryItemId,
            location_id: locationId,
            stocked_quantity: field === 'stocked_quantity' ? numericValue : 0,
            incoming_quantity: field === 'incoming_quantity' ? numericValue : 0,
            reserved_quantity: 0,
            available_quantity: field === 'stocked_quantity' ? numericValue : 0
          });
        }
        
        updatedLevels[inventoryItemId] = levels;
        return updatedLevels;
      });
    };
    
    // Function to save inventory changes
    const handleSaveInventory = async () => {
      setUpdating(true);
      
      try {
        // Prepare inventory operations
        const operations = {
          create: [],
          update: []
        };
        
        // Process each inventory item
        Object.entries(localInventoryLevels).forEach(([inventoryItemId, levels]) => {
          levels.forEach(level => {
            const isNew = !level.id || level.id.startsWith('temp_');
            const entry = {
              inventory_item_id: inventoryItemId,
              location_id: level.location_id,
              stocked_quantity: level.stocked_quantity || 0,
              incoming_quantity: level.incoming_quantity || 0
            };
            
            if (isNew) {
              operations.create.push(entry);
            } else {
              operations.update.push(entry);
            }
          });
        });
        
        // Save to server
        if (operations.create.length > 0 || operations.update.length > 0) {
          const result = await batchUpdateInventoryLevels(operations);
          //console.log("Inventory update result:", result);
          
          // Update the main inventory levels state
          setInventoryLevels(localInventoryLevels);
          
          // Update variant stock values to match inventory
          updateVariantStockFromInventory();
        }
        
        // Close modal
        setIsStockModalOpen(false);
      } catch (error) {
        //console.error("Error saving inventory:", error);
        setInventoryError("Failed to save inventory changes");
      } finally {
        setUpdating(false);
      }
    };
    
    // Function to update variant stock values from inventory
    const updateVariantStockFromInventory = () => {
      const currentVariants = form.getValues('variants');
      const updatedVariants = [...currentVariants];
      
      currentVariants.forEach((variant, index) => {
        if (variant.manageInventory && variant.inventoryItemId) {
          const inventoryItem = localInventoryLevels[variant.inventoryItemId];
          if (inventoryItem && inventoryItem.length > 0) {
            // Find the main location's inventory level
            const mainLocationLevel = inventoryItem.find(
              level => level.location_id === DEFAULT_LOCATION_ID
            );
            
            if (mainLocationLevel) {
              updatedVariants[index] = {
                ...variant,
                stock: mainLocationLevel.stocked_quantity || 0
              };
            }
          }
        }
      });
      
      // Update variants in form
      replaceVariants(updatedVariants);
    };
    
    // Get variant title by inventory item ID
    const getVariantTitleByInventoryId = (inventoryItemId: string): string => {
      const variants = form.getValues('variants');
      const variant = variants.find(v => v.inventoryItemId === inventoryItemId);
      return variant?.title || 'Unknown Variant';
    };
    
    return (
      <Dialog open={isStockModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Inventory</DialogTitle>
            <DialogDescription>
              Update stock levels for all variants. Changes will only be saved when you click "Save Changes".
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingInventory ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="w-10 h-10 animate-spin text-[#e65100]" />
              <p className="ml-3">Loading inventory data...</p>
            </div>
          ) : inventoryError ? (
            <Alert className="my-4 text-red-800 border border-red-200 bg-red-50">
              <IconInfoCircle className="w-5 h-5" />
              <AlertDescription>{inventoryError}</AlertDescription>
            </Alert>
          ) : Object.keys(localInventoryLevels).length === 0 ? (
            <div className="p-6 text-center">
              <p>No inventory data found for this product's variants.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Variant</th>
                    <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Location</th>
                    <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">In Stock</th>
                    <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Incoming</th>
                    <th className="p-3 font-medium text-left text-gray-700">Available</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(localInventoryLevels).map(([inventoryItemId, levels]) => 
                    levels.map((level, levelIndex) => (
                      <tr 
                        key={`${inventoryItemId}-${level.location_id}`}
                        className={levelIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        {levelIndex === 0 && (
                          <td 
                            className="p-3 border-r border-gray-200"
                            rowSpan={levels.length}
                          >
                            {getVariantTitleByInventoryId(inventoryItemId)}
                          </td>
                        )}
                        <td className="p-3 border-r border-gray-200">
                          {level.location_id === DEFAULT_LOCATION_ID ? 'Default Location' : level.location_id}
                        </td>
                        <td className="p-3 border-r border-gray-200">
                          <Input 
                            type="number"
                            min="0"
                            value={level.stocked_quantity || 0}
                            onChange={(e) => handleStockChange(
                              inventoryItemId,
                              level.location_id,
                              'stocked_quantity',
                              e.target.value
                            )}
                            className="w-24 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                          />
                        </td>
                        <td className="p-3 border-r border-gray-200">
                          <Input 
                            type="number"
                            min="0"
                            value={level.incoming_quantity || 0}
                            onChange={(e) => handleStockChange(
                              inventoryItemId,
                              level.location_id,
                              'incoming_quantity',
                              e.target.value
                            )}
                            className="w-24 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                          />
                        </td>
                        <td className="p-3">
                          {((level.stocked_quantity || 0) - (level.reserved_quantity || 0)) || 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          <DialogFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={handleCloseModal}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveInventory}
              disabled={updating || isLoadingInventory}
              className="bg-[#e65100] hover:bg-[#d84315] text-white"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto animate-spin text-[#e65100]" />
          <p className="mt-4">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
 if (error) {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="">
          <CardContent className="pt-6">
            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            {/* Error Title */}
            <h2 className="mb-2 text-2xl font-bold text-center text-gray-900">
              Unable to Load Product
            </h2>
            
            {/* Error Message */}
            <p className="mb-6 text-center text-gray-600">
              We couldn't load this product. This might be because:
            </p>
            
            {/* Error Reasons */}
            <ul className="mb-6 space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2 text-red-500">•</span>
                <span>The product doesn't exist or has been deleted</span>
              </li>
              {/* <li className="flex items-start">
                <span className="mr-2 text-red-500">•</span>
                <span>You don't have permission to access this product</span>
              </li> */}
              <li className="flex items-start">
                <span className="mr-2 text-red-500">•</span>
                <span>There's a temporary connection issue</span>
              </li>
            </ul>
            
            {/* Product ID for Reference */}
            <div className="p-3 mb-6 rounded-lg bg-gray-50">
              <p className="text-xs font-medium text-gray-500">Product ID:</p>
              <p className="font-mono text-sm text-gray-700">{id}</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-[#e65100] hover:bg-[#d84315] text-white"
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate({ to: '/products' })}
                variant="outline"
                className="w-full text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Back to Products
              </Button>
            </div>
            
            {/* Help Text */}
            <p className="mt-6 text-xs text-center text-gray-500">
              If this problem persists, please contact support
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
  // Main component render
  return (
    <div className="px-6 py-8 bg-gray-50">
      {/* Render the Inventory Management Modal */}
      {renderInventoryManagementModal()}
      
      {/* Header Bar with branding */}
      <div className="flex flex-col justify-between gap-4 p-6 mb-6 bg-white border border-gray-100 rounded-lg shadow-sm md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold text-[#e65100]">Edit Product</h1>
        <p className="mt-1 text-gray-500">Update product details</p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col w-full space-y-2 md:flex-row md:space-y-0 md:space-x-3 md:w-auto">
        <Button
          variant="outline"
          onClick={handleViewProduct}
          className="w-full md:w-auto border-[#e65100] text-[#e65100] hover:bg-orange-50"
          disabled={!productViewUrl}
        >
          <IconExternalLink size={18} className="mr-2" />
          View Product
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate({ to: '/products' })}
          className="w-full text-gray-700 border-gray-300 md:w-auto hover:bg-gray-50"
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={handleManualSubmit}
          disabled={isSubmitting}
          className="w-full md:w-auto bg-[#e65100] hover:bg-[#d84315] text-white shadow-sm"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>


      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                          // Show variant-specific upload interface with FIXED functions for image uploads
                          <StreamlinedImageManager
                          mediaItems={mediaItems}
                          setMediaItems={setMediaItems}
                          options={form.getValues('options')}
                          variants={form.getValues('variants')}
                          fileInputRef={fileInputRef}
                          handleFileChange={handleFileChange}
                          // FIXED: Use the direct upload handlers
                          handleVariantImageUpload={handleDirectVariantUpload}
                          handleOptionImageUpload={handleDirectOptionUpload}
                          getImageDisplayUrl={getImageDisplayUrl}
                        />
                        ) : (
                          // Show standard upload interface
                          <div
                            onClick={handleDropzoneClick}
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
                          onChange={(e) => handleFileChange(e.target)}
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
                                  handleAddImageUrl();
                                }
                              }}
                            />
                            <Button 
                              onClick={handleAddImageUrl} 
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
                                src={getImageDisplayUrl(item)}
                                alt={`Product image ${index + 1}`}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  //console.error(`Failed to load image: ${item.url}`);
                                  e.currentTarget.src = '/placeholder-image.png';
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 bg-black bg-opacity-0 opacity-0 group-hover:bg-opacity-20 group-hover:opacity-100">
                                <div className="flex space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImageUp(index)}
                                    disabled={index === 0}
                                    className="p-1 text-white bg-gray-800 rounded-full disabled:opacity-50 hover:bg-gray-700"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImageDown(index)}
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
                                {/* {item.file ? item.file.name.substring(0, 20) : `Image ${index + 1}`} */}
                                {/* {item.variantInfo && (
                                  <div className="mt-1">
                                    <Badge className="bg-[#e65100] text-white text-xs">
                                      {item.variantInfo.variantTitle || 
                                      item.variantInfo.optionName && item.variantInfo.optionValues?.[0] ? 
                                      `${item.variantInfo.optionName}: ${item.variantInfo.optionValues[0]}` : 
                                      'Variant'}
                                    </Badge> 
                                  <Badge className="bg-[#e65100] text-white text-xs">
                                    {item.colorValue || 
                                    (item.variantInfo?.optionName?.toLowerCase() === "color" 
                                        ? item.variantInfo.optionValues?.[0] 
                                        : "")}
                                  </Badge>
                                </div>
                                )} */}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
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
                {/* Options & Variants Section with styling */}
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
                  
                  {/* Options Section */}
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
                    
                    {optionFields.map((opt, optionIndex) => {
                      // Get the current option directly from form values to ensure we have latest data
                      const currentOption = form.getValues(`options.${optionIndex}`);
                      
                      return (
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
                            currentOption={currentOption}
                            updateOption={updateOption}
                            handleGenerateVariants={handleGenerateVariants}
                            form={form}
                          />
                        </div>
                      );
                    })}
                    
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
                            imageAssociation: false  // Explicitly set to false
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
     {/* Variants Section with Bulk Editing - MODIFIED to remove stock column and add stock management link */}
     {variantFields.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-medium text-gray-700">Product Variants ({variantFields.length})</h3>
                        <div className="flex items-center space-x-2">
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={handleGenerateVariants}
                            size="sm"
                            className="text-[#e65100] border-[#e65100] hover:bg-orange-50"
                          >
                            Regenerate variants
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleOpenStockModal}
                            disabled={hasUnsavedVariantChanges}
                            className={
                              hasUnsavedVariantChanges
                                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                                : "text-[#e65100] border-[#e65100] hover:bg-orange-50"
                            }
                          >
                            <IconPackage size={16} className="mr-2" />
                            Manage Stock
                          </Button>
                        </div>
                      </div>
                      
                      {/* Unsaved changes warning */}
                      {hasUnsavedVariantChanges && (
                        <Alert className="mb-4 bg-amber-50 border-amber-200">
                          <IconInfoCircle className="w-4 h-4 text-amber-500" />
                          <AlertDescription className="text-amber-700">
                            You have unsaved variant changes. Please save the product before managing stock.
                          </AlertDescription>
                        </Alert>
                      )}
                      
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
                                      <label className="block mb-1.5 text-sm text-gray-700">Manage Inventory</label>
                                      <div className="flex items-center gap-2">
                                        <Switch
                                          id="bulk-manage-inventory"
                                          checked={selectedVariants.length > 0 && form.getValues('variants').filter(v => selectedVariants.includes(v.id)).every(v => v.manageInventory)}
                                          onCheckedChange={(value) => handleBulkInventoryToggle(value)}
                                          className="data-[state=checked]:bg-[#e65100]"
                                        />
                                        <label htmlFor="bulk-manage-inventory" className="text-sm text-gray-700">
                                          Track inventory for selected variants
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                   
                      {/* Variants Table - MODIFIED to remove stock column */}
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
                              <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Cost Price</th>
                              <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Price</th>
                              <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Profit</th>
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
                                      {form.watch(`variants.${index}.optionValues`, []).map((optVal, optIndex) => (
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
                                      readOnly={true} // Make cost price read-only
                                      disabled={true} // Disable input to prevent editing
                                      // Replace the current value and onChange with these:
                                      defaultValue={form.getValues(`variants.${index}.cost_price`) || ''}
                                      onBlur={(e) => {
                                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                        handleVariantFieldChange(index, 'cost_price', value);
                                      }}
                                      className="w-full pl-7 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                                    />
                                  </div>
                                </td>
                                <td className="p-3 border-r border-gray-200">
                                  <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      // Replace the current value and onChange with these:
                                      defaultValue={form.getValues(`variants.${index}.price`) || ''}
                                      onBlur={(e) => {
                                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                        handleVariantFieldChange(index, 'price', value);
                                      }}
                                      className="w-full pl-7 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                                    />
                                  </div>
                                </td>
                                <td className="p-3 border-r border-gray-200">
                                  {(() => {
                                    const price = form.watch(`variants.${index}.price`) || 0;
                                    const cost_Price = form.watch(`variants.${index}.cost_price`) || 0;
                                    const profit = price - cost_Price;
                                    return (
                                      <div className="text-center">
                                        <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          ₹{profit.toFixed(2)}
                                        </span>
                                        {/* {profit > 0 && (
                                          <div className="text-xs text-gray-500">
                                            {cost_Price > 0 ? `${((profit/cost_Price) * 100).toFixed(1)}%` : '∞%'}
                                          </div>
                                        )} */}
                                      </div>
                                    );
                                  })()}
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex justify-center space-x-2">
                                    {/* <Button 
                                      type="button"
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleDuplicateVariant(index)}
                                      className="text-gray-600 hover:bg-gray-100"
                                      title="Duplicate variant"
                                    >
                                      <IconCopy size={16} />
                                    </Button> */}
                                    
                                    <Button 
                                      type="button"
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleRemoveVariant(index)}
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
                            <SelectItem value="proposed">
                              <div className="flex items-center">
                                <span className="w-2 h-2 mr-2 bg-yellow-400 rounded-full"></span>
                                Proposed
                              </div>
                            </SelectItem>
                            {/* Only show the published option if already published */}
                            {field.value === "published" && (
                              <SelectItem value="published">
                                <div className="flex items-center">
                                  <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
                                  Published
                                </div>
                              </SelectItem>
                            )}
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
                  {/* Category Selection - Multi-select */}
                  {isLoadingCategories ? (
                    <div className="mb-5">
                      <label className="block mb-2 font-medium text-gray-700">Product Categories</label>
                      <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
                        <p className="text-sm text-gray-500">Loading categories...</p>
                      </div>
                    </div>
                  ) : categoryError ? (
                    <div className="mb-5">
                      <label className="block mb-2 font-medium text-gray-700">Product Categories</label>
                      <Alert className="text-red-800 border border-red-200 bg-red-50">
                        <IconInfoCircle className="w-5 h-5" />
                        <AlertDescription>{categoryError}</AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <FormField
                      control={form.control}
                      name="category_ids"
                      render={({ field }) => (
                        <FormItem className="mb-5">
                          <FormLabel className="font-medium text-gray-700">Product Categories</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              {/* Display selected categories */}
                              {field.value && field.value.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-md bg-gray-50">
                                  {field.value.map((categoryId) => {
                                    const category = productCategories.find(c => c.id === categoryId);
                                    return category ? (
                                      <Badge 
                                        key={categoryId}
                                        className="bg-[#e65100] text-white hover:bg-[#d84315]"
                                      >
                                        {category.name}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newValue = field.value.filter(id => id !== categoryId);
                                            field.onChange(newValue);
                                          }}
                                          className="ml-2 hover:text-red-200"
                                        >
                                          <IconX size={14} />
                                        </button>
                                      </Badge>
                                    ) : null;
                                  })}
                                </div>
                              )}
                              
                              {/* Category selector */}
                              <Select 
                                onValueChange={(value) => {
                                  if (!field.value.includes(value)) {
                                    field.onChange([...field.value, value]);
                                  }
                                }}
                              >
                                <SelectTrigger className="border-gray-300 focus:ring-[#e65100]">
                                  <SelectValue placeholder="Add a category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {productCategories
                                    .filter(cat => !field.value.includes(cat.id))
                                    .map(category => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                      </SelectItem>
                                    ))
                                  }
                                </SelectContent>
                              </Select>
                            </div>
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">
                            Select one or more categories for this product
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
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
                {/* Shipping & Fulfillment Info Card */}
                {/* Shipping & Fulfillment Info Card - UPDATED */}
<section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
  <h2 className="mb-4 text-lg font-semibold text-gray-800">Shipping & Fulfillment</h2>
  <Separator className="mb-4" />
  
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 bg-orange-100 rounded-full text-[#e65100]">
      <IconTruck size={24} />
    </div>
    <div>
      <h3 className="font-medium text-gray-800">
        {fulfillmentData?.type === "Creator-fulfilment" 
          ? "Creator Fulfillment" 
          : fulfillmentData?.type === "JUNOONI-fulfillment"
          ? "Junooni Fulfillment"
          : "Standard Fulfillment"
        }
      </h3>
      <p className="text-sm text-gray-600">
        {fulfillmentData?.type === "Creator-fulfilment" 
          ? "You'll handle all order shipping" 
          : fulfillmentData?.type === "JUNOONI-fulfillment"
          ? "Fulfillment managed by Junooni"
          : "Standard fulfillment process"
        }
      </p>
    </div>
  </div>
  
  {/* Product Info for Junooni Fulfillment */}
  {fulfillmentData?.type === "JUNOONI-fulfillment" && (
    <div className="p-4 mb-6 border border-orange-100 rounded-lg bg-orange-50">
      <h4 className="mb-3 font-medium text-orange-900">Fulfillment Details</h4>
      {/* <div className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-blue-600 font-medium min-w-fit">Product :</span>
          <span className="text-gray-800">{form.watch('title') || 'Not specified'}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-blue-600 font-medium min-w-fit">Technology Name:</span>
          <span className="text-gray-800">
            {technologyName  ||  'Not specified'}
          </span>
        </div>
      </div> */}
      <div className="mb-6 space-y-3">
        <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
          <div className="flex items-start">
            {/* <div className="p-2 mr-3 bg-orange-100 rounded-full text-orange-600">
              <IconInfoCircle size={20} />
            </div> */}
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">Product</p>
              <p className="mt-1 text-base font-semibold text-orange-900">
                {payloadProductName && sourceProductId ? (
                  <a 
                    href={`/productCatalog/${sourceProductId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-800 hover:text-[#e65100] underline decoration-orange-300 hover:decoration-[#e65100] transition-colors"
                  >
                    {payloadProductName}
                    <IconExternalLink size={14} className="inline ml-1 mb-0.5" />
                  </a>
                ) : (
                  <span className="text-gray-800">
                    {payloadProductName || form.watch('title') || 'Not specified'}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        
       
        <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
          <div className="flex items-start">
            {/* <div className="p-2 mr-3 bg-orange-100 rounded-full text-orange-600">
              <IconInfoCircle size={20} />
            </div> */}
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">Print Technology</p>
              <p className="mt-1 text-base font-semibold text-orange-900 uppercase">
                {technologyName  ||  'Not specified'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
  
  {/* Shipping information - Display only */}
  <div className="space-y-4">
    {/* Shipping Time Display */}
    <div className="p-4 border border-orange-100 rounded-lg bg-orange-50">
      <div className="flex items-start gap-3">
        <IconTruck size={18} className="mt-0.5 text-[#e65100]" />
        <div className="flex-1">
          <h4 className="font-medium text-[#e65100] mb-1">Shipping Time</h4>
          <p className="text-[#e65100] font-medium">
            {form.watch('shippingDays') 
              ? `${form.watch('shippingDays')} business days`
              : '7-10 business days'
            }
          </p>
        </div>
      </div>
    </div>
    
    {/* Handling Time Display */}
    <div className="p-4 border border-orange-100 rounded-lg bg-orange-50">
      <div className="flex items-start gap-3">
        <IconClock size={18} className="mt-0.5 text-[#e65100]" />
        <div className="flex-1">
          <h4 className="font-medium text-[#e65100] mb-1">Handling Time</h4>
          <p className="text-[#e65100] font-medium">
            {form.watch('handlingTime') 
              ? `${form.watch('handlingTime')} business days`
              : '2-3 business days'
            }
          </p>
        </div>
      </div>
    </div>
  </div>
  
  {/* Stock Management Info */}
  <div className="mt-6">
    <h3 className="mb-2 font-medium text-gray-700">Stock Information</h3>
    <p className="text-sm text-gray-600">
      Track inventory for each variant using the "Manage Stock" button in the variants section.
      Changes to inventory are only saved when you save the product.
    </p>
    
    <Alert className="mt-4">
      <IconInfoCircle className="w-4 h-4" />
      <AlertDescription>
        To update stock levels after making variant changes, first save the product and then use the "Manage Stock" button.
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
                            <FormLabel className="font-medium text-gray-700">Length(cm)</FormLabel>
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
                            <FormLabel className="font-medium text-gray-700">Width(cm)</FormLabel>
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
                            <FormLabel className="font-medium text-gray-700">Height(cm)</FormLabel>
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
                  variant="outline" 
                  onClick={() => navigate({ to: '/products' })}
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
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    );
  };
  
  export default EditProduct;   