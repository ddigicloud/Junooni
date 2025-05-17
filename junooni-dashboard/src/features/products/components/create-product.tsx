import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
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
import { StreamlinedImageManager } from '../context/product-modules/ImageManager';
import { EnhancedOptionComponent } from '../context/product-modules/OptionComponents';
import { ProductSchema } from '../data/schema';
import { createProduct, uploadProductImage, fetchCategories, batchUpdateInventoryLevels, fetchProduct } from '../context/fetchApi';
import HierarchicalCategorySelector from '../context/HierarchicalCategorySelector';

// Import rich text editor component
import { TipTapEditor } from '../context/editor';

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
//import { extractInventoryItemId } from '../context/fetchApi';

// Default location ID for inventory management
const defaultLocationId = "sloc_01JKWDDGKGCQFJANXV0CVJN2QW"; // Default location ID

// Main Product Form Component
const ProductForm: React.FC<ProductFormProps> = ({ initialData, isEditing = false }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImageTab, setActiveImageTab] = useState<string>("upload");
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  
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
  const [hasVariants, setHasVariants] = useState<boolean>(initialData ? initialData.options.length > 0 : false);
  
  // Initialize the form with default values based on the schema
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    defaultValues: initialData || {
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

  // Generate variants from options - using useCallback to memoize
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

  // Handle file change for standard and variant-specific uploads
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    variantInfo: VariantInfo | null = null
  ): void => {
    try {
      if (e.target.files && e.target.files.length > 0) {
        // Create new media items with minimal metadata
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

  const getImageAssociatedOptions = () => {
    const currentOptions = form.getValues('options');
    return currentOptions.filter(opt => 
      opt.title && 
      opt.optionValues && 
      opt.optionValues.length > 0 && 
      opt.imageAssociation === true
    );
  };
  
  // State for options that have image associations
  const [imageAssociatedOptions, setImageAssociatedOptions] = useState<Option[]>([]);
  
  // Update imageAssociatedOptions when options change
  useEffect(() => {
    const subscription = form.watch((formValues, { name, type }) => {
      // Update imageAssociatedOptions when options change
      if (name && (name.includes('options') || name.includes('imageAssociation'))) {
        setImageAssociatedOptions(getImageAssociatedOptions());
      }
    });
    
    // Initial setting
    setImageAssociatedOptions(getImageAssociatedOptions());
    
    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, [form]);

  // Trigger the hidden file input when clicking the dropzone.
  const handleDropzoneClick = (e: React.MouseEvent) => {
    // Prevent form submission
    e.preventDefault();
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
      const optionValueImages = mediaItems.filter(item => 
        item.variantInfo?.optionName === optVal.optionName && 
        item.variantInfo?.optionValues?.includes(optVal.value)
      );
      
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

  // Close success message and reset the form
  const handleSuccessClose = () => {
    setShowSuccess(false);
    
    // If editing, navigate back to products, otherwise reset form for a new product
    if (isEditing) {
      navigate({ to: '/products' });
    } else {
      // Reset the form for a new product
      form.reset({
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
        productDetails: [{ id: generateUUID(), text: '' }],
        storyBehindDesign: '',
        locationId: defaultLocationId,
       
        shippingDays: '7-10',
        handlingTime: '2-3',
      });
      
      // Clear media items
      setMediaItems([]);
      
      // Reset variant state
      setHasVariants(false);
    }
  };

  // Monitor option changes to update variants and detect color options
  useEffect(() => {
    const subscription = form.watch((formValues, { name, type }) => {
      // Check if the changed field is an option field
      if (name && (name.includes('options') || name.includes('title'))) {
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
              // Add a new empty option
              appendOption({ 
                id: generateUUID(),
                title: '', 
                optionValues: [],
                imageAssociation: false
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

  // Handle form submission with proper variant image handling
  const onSubmit = async (values: ProductFormValues) => {
    // Validate required fields
    if (!values.title.trim()) {
      setError('Product title is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // STEP 1: Upload images first to get image IDs
      const productImages: Array<{id: string, url: string, alt?: string}> = [];
      const imageIdToUrlMap: Record<string, string> = {};
      
      if (mediaItems.length > 0) {
        try {
          // Sort media items by rank to maintain order
          const sortedMediaItems = [...mediaItems].sort((a, b) => a.rank - b.rank);
          
          // Upload each file to get image IDs
          // Upload each file to get image IDs
for (const item of sortedMediaItems) {
  if (item.file) {
    const formData = new FormData();
    formData.append('files', item.file);
    
    // Use the provided uploadProductImage function
    const uploadResult = await uploadProductImage({
      productId: '', // We don't have a product ID yet
      formData: formData,
      multiple: false
    });
    
    // The response should contain id and url
    if (uploadResult && 'id' in uploadResult && 'url' in uploadResult) {
      // Store the image in our productImages array
      productImages.push({
        id: uploadResult.id,
        url: uploadResult.url,
        alt: item.colorValue || item.variantInfo?.optionValues?.[0]
      });
      
      // Update the mediaItem with the new ID and URL
      item.id = uploadResult.id;
      
      // Store the ID to URL mapping
      imageIdToUrlMap[uploadResult.id] = uploadResult.url;
    }
  }
}
          
          // Update our uploadedImages state
          setUploadedImages(imageIdToUrlMap);
          
        } catch (uploadError: any) {
          setError(`Failed to upload images: ${uploadError.message || 'Unknown error'}`);
          setIsSubmitting(false);
          return;
        }
      }
      
      // Auto-generate handle from title and add timestamp for uniqueness
      const timestamp = new Date().getTime();
      const baseHandle = values.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove any non-word chars (except spaces and dashes)
        .replace(/\s+/g, '-') // Replace spaces with single dash
        .replace(/-+/g, '-'); // Replace multiple dashes with single dash
      
      values.handle = `${baseHandle}-${timestamp}`;
      
      let options: any[] = [];
      let variants: any[] = [];
  
      // Prepare metadata with product details and story
      const metadata: Record<string, any> = {};
      
      // Get the actual form values directly before saving
      const formValues = form.getValues();
      
      // Process fulfillment data with values directly from the form
      const fulfillmentData = {
        type: "Creator-fulfilment",
        handling_time: formValues.handlingTime || '2-3',
        shipping_time: formValues.shippingDays || '7-10'
      };
      
      // Stringify the fulfillment object and assign to metadata
      metadata.fulfillment_type = JSON.stringify(fulfillmentData);
      
      // Process product details - extract text values from the array
      if (formValues.productDetails && Array.isArray(formValues.productDetails)) {
        const validDetails = formValues.productDetails
          .filter(detail => detail && detail.text && detail.text.trim() !== '')
          .map(detail => detail.text.trim());
        
        if (validDetails.length > 0) {
          metadata.product_details = JSON.stringify(validDetails);
        }
      }
      
      // Process story behind design - handle HTML content
      if (formValues.storyBehindDesign && typeof formValues.storyBehindDesign === 'string') {
        // Store HTML as is - the API should handle HTML content
        metadata.description_story = formValues.storyBehindDesign.trim();
      }
      
      // Process color hex values if present
      const formColorOption = formValues.options?.find(opt => 
        opt.title?.toLowerCase() === 'color' || opt.title?.toLowerCase() === 'colour'
      );
      
      if (formColorOption && formColorOption.colorHexValues) {
        // Convert the color hex values object to an array of {name, hex} pairs
        const colorHexArray = Object.entries(formColorOption.colorHexValues).map(
          ([colorName, hexValue]) => ({
            name: colorName,
            hex: hexValue
          })
        );
        
        // Store as a single JSON string in metadata
        metadata.color_hex_values = JSON.stringify(colorHexArray);
      }
      
      // Process image associations metadata
      const imageMetadata = prepareVariantImageMetadata(formValues.options, mediaItems);
      Object.entries(imageMetadata).forEach(([key, value]) => {
        metadata[key] = value;
      });

      // IMPORTANT: Get the latest option values directly from the form
      // This ensures we capture the correct imageAssociation values
      const latestOptions = formValues.options;
      
      // Image association settings - direct from form values
      const imageAssociationSettings = latestOptions
        .filter(opt => opt.title && Array.isArray(opt.optionValues) && opt.optionValues.length > 0)
        .map(opt => ({
          option_id: opt.id,
          option_name: opt.title,
          enabled: Boolean(opt.imageAssociation) // This value should be correct now
        }));

      // Add to metadata
      metadata.variant_specific_image_option = JSON.stringify(imageAssociationSettings);
      
      // Log to verify the values are correct
      console.log('Image association settings being saved:', imageAssociationSettings);
      console.log('Full metadata being saved:', metadata);
      
      if (hasVariants) {
        // When using variants: filter and transform options to API format (remove empty ones)
        const validOptions = formValues.options.filter(opt => 
          opt.title && 
          Array.isArray(opt.optionValues) && 
          opt.optionValues.length > 0
        );
        
        // Check if we have at least one option with values when variants are enabled
        if (validOptions.length === 0) {
          setError('You must add at least one option (like Size or Color) with values');
          setIsSubmitting(false);
          return;
        }
        
        // Format options to match Medusa JS API expectations
        options = validOptions.map((opt) => {
          return {
            title: opt.title,
            values: opt.optionValues
          };
        });
        
        // Validate variants - make sure each has at least a title and SKU
        const invalidVariants = formValues.variants.filter(v => !v.title || !v.sku);
        if (invalidVariants.length > 0) {
          setError('All variants must have a title and SKU');
          setIsSubmitting(false);
          return;
        }
        
        // Check if we have variants
        if (formValues.variants.length === 0) {
          setError('You must add at least one variant. Add option values first.');
          setIsSubmitting(false);
          return;
        }
        
        variants = formValues.variants;
      } else {
        // When not using variants: create a single default option and variant
        // This is needed because Medusa API requires at least one option and value
        const defaultTitle = "Title";
        const defaultValue = "Default";
        
        // Use the user-provided values for the default variant or fallback to defaults
        const defaultSku = formValues.defaultVariantSku || generateUniqueSku(formValues.title);
        const defaultPrice = formValues.defaultVariantPrice || 0;
        const defaultStock = formValues.defaultVariantStock || 0;
        
        // Create a default option with a default value and ID
        const defaultOptionId = generateUUID();
        options = [
          {
            id: defaultOptionId,
            title: defaultTitle,
            values: [defaultValue]
          }
        ];
        
        // Create the default option value object for the variant - use the same ID
        const defaultOptionValue = {
          optionId: defaultOptionId,
          optionName: defaultTitle,
          value: defaultValue
        };
        
        // Create a single default variant with the default option value
        variants = [{
          id: generateUUID(),
          title: 'Default',
          price: defaultPrice,
          compareAtPrice: 0,
          stock: defaultStock,
          sku: defaultSku,
          allowBackorder: false,
          manageInventory: true,
          optionValues: [defaultOptionValue]
        }];
      }
      
      // Transform variants to match Medusa JS API expectations
      const formattedVariants = variants.map((variant) => {
        // Format price as number to avoid string issues
        const price = typeof variant.price === 'string' 
          ? parseFloat(variant.price) 
          : (variant.price || 0);
      
        // Format options according to Medusa JS API expectations
        const variantOptions: Record<string, string> = {};
        
        // Map each option value to the format Medusa expects
        if (variant.optionValues && variant.optionValues.length > 0) {
          variant.optionValues.forEach(optVal => {
            variantOptions[optVal.optionName] = optVal.value;
          });
        }
        
        // Prepare variant-specific metadata with correct image info
        const variantMetadata: Record<string, any> = {};

        // Store color images in variant metadata using IMAGE IDs instead of URLs
        if (variant.optionValues.some((opt: OptionValue) => isColorOption(opt.optionName))) {
          const colorOption = variant.optionValues.find((opt: OptionValue) => isColorOption(opt.optionName));
          if (colorOption) {
            // Get color-specific images
            const colorImages = mediaItems
              .filter(item => 
                item.variantInfo?.optionName === colorOption.optionName && 
                item.variantInfo?.optionValues?.includes(colorOption.value) &&
                item.id // Only include items with an ID
              )
              .map(item => ({
                color: colorOption.value,
                imageId: item.id, // Store the image ID instead of URL
                url: item.url // Keep URL for reference
              }));
            
            if (colorImages.length > 0) {
              variantMetadata.color_images = colorImages;
            }
          }
        }

        // Get all images associated with this variant and store their IDs
       // Get all images associated with a variant (both direct and via option values)
const getVariantAssociatedImages = (variant: Variant, mediaItems: MediaItem[]): {id: string, url: string}[] => {
  if (!variant.optionValues || !Array.isArray(variant.optionValues)) {
    return [];
  }
  
  const associatedImages: {id: string, url: string}[] = [];
  
  // First, check for direct variant-specific images
  const directVariantImages = mediaItems.filter(item => 
    item.variantInfo?.variantId === variant.id && item.id // Ensure we have a valid ID
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
    const optionValueImages = mediaItems.filter(item => 
      item.variantInfo?.optionName === optVal.optionName && 
      item.variantInfo?.optionValues?.includes(optVal.value) &&
      item.id // Ensure we have a valid ID
    );
    
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
        
        // Return a minimal variant with only fields we know are accepted
        return {
          title: variant.title,
          sku: variant.sku || '',
          manage_inventory: Boolean(variant.manageInventory),
          allow_backorder: Boolean(variant.allowBackorder),
          options: variantOptions,
          metadata: variantMetadata,
                   
          // The most basic prices array structure
          prices: [{
            amount: price,
            currency_code: 'inr'
          }]
        };
      });
      
      // Extract image data for the API - include both id and url in each object
      const formattedImages = productImages.map(img => ({ 
        id: img.id, 
        url: img.url,
        ...(img.alt ? { alt: img.alt } : {})
      }));
      
      // Construct the product object in Medusa JS API format
      const newProduct = {
        title: formValues.title.trim(),
        subtitle: formValues.subtitle?.trim() || "", // Added short description
        handle: formValues.handle.trim(),
        description: formValues.description.trim() || "",
        status: formValues.status,
        discountable: Boolean(formValues.discountable),
        
        // Include image objects if we have any (not just IDs)
        ...(formattedImages.length > 0 ? { 
          images: formattedImages,
          thumbnail: productImages[0]?.url || "" 
        } : {}),
        
        // Include category if selected
        categories: formValues.category_id ? [{ id: formValues.category_id }] : [],
          
        weight: formValues.weight ? parseInt(formValues.weight) || 0 : 0,
        length: formValues.length ? parseInt(formValues.length) || 0 : 0,
        width: formValues.width ? parseInt(formValues.width) || 0 : 0,
        height: formValues.height ? parseInt(formValues.height) || 0 : 0,
        // Only include these if they have values
        ...(formValues.material ? { material: formValues.material } : {}),
        ...(formValues.origin_country ? { origin_country: formValues.origin_country } : {}),
        // Include metadata
        metadata: metadata,
        options: options, // Always include options even for no-variant products
        variants: formattedVariants,
      };
    
      console.log("Full product creation payload:", JSON.stringify(newProduct, null, 2));

      try {
        // Create the product
        const result = await createProduct({ 
          product: newProduct
        });
        
        console.log("Product created successfully:", result);
        
        // Store the created product ID
     // After successful product creation
if (result && result.id) {
  setCreatedProductId(result.id);
  
  console.log("Product created successfully with ID:", result.id);
  
  // Add a slight delay to allow backend processing
  setTimeout(async () => {
    try {
      // Fetch the complete product with inventory information
      console.log("Fetching complete product data to retrieve inventory items...");
      const completeProduct = await fetchProduct({ id: result.id });
      
      if (completeProduct && completeProduct.variants) {
        console.log("Processing inventory for variants from complete product data");
        const inventoryCreations = [];
        
        for (const variant of completeProduct.variants) {
          console.log(`Processing variant ${variant.id}: ${variant.title}`);
          
          // Check if inventory_items exists and has data
          if (variant.inventory_items && Array.isArray(variant.inventory_items) && variant.inventory_items.length > 0) {
            const inventoryItemId = variant.inventory_items[0].inventory_item_id;
            
            if (inventoryItemId) {
              console.log(`Found inventory_item_id: ${inventoryItemId} for variant ${variant.title}`);
              
              // Find matching form variant to get stock
              const formVariant = variants.find(v => v.title === variant.title) || variants[0];
              const stockQuantity = parseInt(String(formVariant?.stock || '0'));
              
              inventoryCreations.push({
                inventory_item_id: inventoryItemId,
                location_id: defaultLocationId,
                stocked_quantity: stockQuantity,
                incoming_quantity: 0
              });
            }
          } else {
            console.warn(`No inventory_items found for variant: ${variant.title}`);
          }
        }
        
        // Only proceed if we have inventory operations to perform
        if (inventoryCreations.length > 0) {
          console.log(`Submitting ${inventoryCreations.length} inventory creation operations`);
          
          try {
            const inventoryResult = await batchUpdateInventoryLevels({
              create: inventoryCreations
            });
            
            console.log("Inventory creation successful:", inventoryResult);
          } catch (inventoryError) {
            console.error("Failed to create inventory levels:", inventoryError);
            // Don't set error - continue showing success message for product creation
          }
        } else {
          console.warn("No valid inventory items found to create");
        }
      }
    } catch (fetchError) {
      console.error("Failed to fetch complete product data:", fetchError);
      // Still show success for product creation even if inventory failed
    }
  }, 2000); // 2-second delay to allow backend processing
  
  // Show success message for product creation
  setShowSuccess(true);
  setIsSubmitting(false);
}
        
      } catch (apiError: any) {
        if (apiError.response) {
          setError(`API Error: ${apiError.response.data?.message || apiError.message || 'Unknown API error'}`);
        } else if (apiError.request) {
          setError('Network error: No response received from server. Please check your connection.');
        } else {
          setError(`Error: ${apiError.message || 'Unknown error occurred'}`);
        }
        setIsSubmitting(false);
      }
    } catch (error: any) {
      setError(`Failed to create product: ${error?.message || 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };

  // For debugging when create button doesn't work
  const handleManualSubmit = (e: React.FormEvent) => {
    if (e) e.preventDefault();
    form.handleSubmit(onSubmit)();
  };
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Error</h2>
          <p className="mb-6">{error}</p>
          <Button 
            onClick={() => navigate({ to: '/products' })}
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

  return (
    <div className="px-6 py-8 bg-gray-50">
      {/* Header Bar with Junooni branding */}
      <div className="flex flex-col justify-between gap-4 p-6 mb-6 bg-white border border-gray-100 rounded-lg shadow-sm md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#e65100]">
            {isEditing ? "Edit Product" : "Create New Product"}
          </h1>
          <p className="mt-1 text-gray-500">Fill in the details to {isEditing ? "update" : "create"} your product</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            type="button"
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
            {isSubmitting ? 
              (isEditing ? 'Saving...' : 'Creating...') : 
              (isEditing ? 'Save Product' : 'Create Product')}
          </Button>
        </div>
      </div>

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
                        // Show variant-specific upload interface when variants and options with imageAssociation are present
                        <StreamlinedImageManager
                          mediaItems={mediaItems}
                          setMediaItems={setMediaItems}
                          options={form.getValues('options')}
                          variants={form.getValues('variants')}
                          fileInputRef={fileInputRef}
                          handleFileChange={handleFileChange}
                        />
                      ) : (
                        // Show standard upload interface
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
                      
                      <FormField
                        control={form.control}
                        name="defaultVariantStock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-gray-700">Stock</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="0"
                                step="1"
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                placeholder="0" 
                                className="w-full border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                              />
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
                            <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Stock</th>
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
                              <td className="p-3 border-r border-gray-200">
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={form.watch(`variants.${index}.stock`) || ''}
                                  onChange={(e) => {
                                    const value = e.target.value === '' ? '' : parseInt(e.target.value);
                                    handleVariantFieldChange(index, 'stock', value === '' ? 0 : value);
                                  }}
                                  className="w-full border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                                />
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
                    <h3 className="font-medium text-gray-800">Creator Fulfillment</h3>
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
                type="button"
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
                {isSubmitting ? 
                  (isEditing ? 'Saving...' : 'Creating...') : 
                  (isEditing ? 'Save Product' : 'Create Product')}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProductForm;