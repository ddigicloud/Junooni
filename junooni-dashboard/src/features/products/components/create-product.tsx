

// Helper function to render category options recursively (for nested categories)
const renderCategoryOptions = (categories: any[]) => {
  if (!categories || !Array.isArray(categories)) {
    return [];
  }
  
  return categories.map(category => {
    if (!category) return null;
    
    return (
      <SelectItem key={category.id} value={category.id}>
        {category.name}
      </SelectItem>
    );
  });
};// Remove unused type definitions
type CategoryChild = {
id: string;
name: string;
handle: string;
mpath: string;
is_active: boolean;
is_internal: boolean;
rank: number;
metadata: any;
parent_category_id: string;
created_at: string;
updated_at: string;
};import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCirclePlus, IconX, IconLink, IconUpload, IconCopy, IconEdit, IconTrash, IconPhotoPlus } from '@tabler/icons-react';

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

import { ProductSchema } from '../data/schema';
import { createProduct, uploadProductImage, fetchCategories } from '../context/fetchApi';

/** Utility: Generate a random UUID. */
const generateUUID = () => {
return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0;
  const v = c === 'x' ? r : (r & 0x3) | 0x8;
  return v.toString(16);
});
};

/**
* Utility: Generate a unique SKU with timestamp to avoid duplicates.
* This ensures SKUs are unique even if the variant names are identical to existing ones.
*/
function generateUniqueSku(baseName: string): string {
// Get current timestamp in milliseconds
const timestamp = new Date().getTime();

// Replace non-alphanumeric chars with hyphens and make lowercase
const cleanName = baseName.replace(/[^A-Z0-9]/ig, '-').toLowerCase();

// Add timestamp to ensure uniqueness
return `SKU-${cleanName}-${timestamp}`;
}

/**
* Utility: Given an array of option objects (each with an array of values),
* produce all possible variant combinations (Cartesian product).
*/
function generateVariantsFromOptions(
options: { optionId: string; optionName: string; optionValues: string[] }[]
): {
id: string;
title: string;
price: number;
compareAtPrice: number;
stock: number;
sku: string;
allowBackorder: boolean;
manageInventory: boolean;
optionValues: { optionId: string; optionName: string; value: string }[];
}[] {
if (!options.length) return [];

console.log("Generating variants from options:", options);

// Helper function for the Cartesian product
const cartesian = (arrays: string[][]): string[][] => {
  return arrays.reduce<string[][]>(
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
  const optionValues = combo.map((value, index) => ({
    optionId: options[index].optionId,
    optionName: options[index].optionName,
    value: value
  }));
  
  // Create variant title (e.g. "Small / Red / Cotton")
  const title = optionValues.map(opt => opt.value).join(' / ');
  
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

// ProductFormValues structure
type ProductFormValues = {
title: string;
subtitle: string; // Added short description field
handle: string;
description: string;
status: string;
thumbnail: string;
discountable: boolean;
options: {
  id?: string;
  title: string;
  optionValues: string[];
}[];
variants: {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku: string;
  allowBackorder: boolean;
  manageInventory: boolean;
  optionValues: { optionId?: string; optionName: string; value: string }[];
}[];
// Default variant fields for when hasVariants is false
defaultVariantPrice: number;
defaultVariantSku: string;
defaultVariantStock: number;
// Category selection
category_id: string;
// Physical details
weight: string;
length: string;
width: string;
height: string;
material?: string;
origin_country?: string;
};

interface ProductFormProps {
initialData?: ProductFormValues;
isEditing?: boolean;
}

const ProductForm = ({ initialData, isEditing = false }: ProductFormProps) => {
const navigate = useNavigate();
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);
const [activeImageTab, setActiveImageTab] = useState("upload");
const [newImageUrl, setNewImageUrl] = useState("");
const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

// State for storing categories from API
const [productCategories, setProductCategories] = useState<any[]>([]);
const [isLoadingCategories, setIsLoadingCategories] = useState(false);
const [categoryError, setCategoryError] = useState<string | null>(null);

// For managing the new option value being added for each option
const [newOptionValues, setNewOptionValues] = useState<Record<number, string>>({});

// For images, we store objects with a file (if newly added) and URL and rank.
const [mediaItems, setMediaItems] = useState<
  { file: File | null; url: string; rank: number; id?: string; isNew?: boolean }[]      
>([]);


// For bulk editing variants
const [bulkEditMode, setBulkEditMode] = useState(false);
const [bulkPrice, setBulkPrice] = useState("");
const [bulkStock, setBulkStock] = useState("");
const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

// Ref for the hidden file input for drag‑and‑drop.
const fileInputRef = useRef<HTMLInputElement>(null);

// State for variant toggle
const [hasVariants, setHasVariants] = useState(initialData ? initialData.options.length > 0 : false);

// Initialize the form with default values based on the schema
const form = useForm<ProductFormValues>({
  resolver: zodResolver(ProductSchema),
  defaultValues: initialData || {
    title: '',
    subtitle: '', // Added short description field
    handle: '', // Will be auto-generated
    description: '',
    status: 'draft', // Default to draft for new products
    thumbnail: '',
    discountable: true,
    category_id: '', // Default empty category selection
    options: [
      // Start with just one option when variants are enabled
      {
        id: generateUUID(),
        title: 'Size',
        optionValues: []
      }
    ],
    variants: [],
    // Default variant fields
    defaultVariantPrice: 0,
    defaultVariantSku: generateUniqueSku('default'),
    defaultVariantStock: 0,
    weight: '',
    length: '',
    width: '',
    height: '',
    material: '',
    origin_country: '',
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

// Generate variants from options
const handleGenerateVariants = () => {
  const currentOptions = form.getValues('options');
  
  // Filter out options without name or values
  const validOptions = currentOptions.filter(opt => 
    opt.title && Array.isArray(opt.optionValues) && opt.optionValues.length > 0
  );
  
  if (validOptions.length > 0) {
    console.log("Generating variants from options:", validOptions);
    
    const parsedOptions = validOptions.map((opt) => ({
      optionId: opt.id || generateUUID(),
      optionName: opt.title,
      optionValues: opt.optionValues,
    }));
    
    const currentVariants = form.getValues('variants');
    console.log("Current variants before generation:", currentVariants);
    
    const newVariants = generateVariantsFromOptions(parsedOptions);
    console.log("Generated new variants:", newVariants);
    
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
        console.log("Found existing variant match:", {
          new: newVariant.title,
          existing: existingVariant.title
        });
        
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
    
    console.log("Final variants to be applied:", variantsWithExistingData);
    
    // Replace variants in the form
    replaceVariants(variantsWithExistingData);
    
    // Log variants after replacement to verify
    setTimeout(() => {
      console.log("Variants after replacement:", form.getValues('variants'));
    }, 0);
  } else {
    console.log("No valid options found, clearing variants");
    // If there are no valid options, clear the variants
    replaceVariants([]);
  }
};

// Update a specific variant field
const handleVariantFieldChange = (variantIndex: number, field: string, value: any) => {
  const currentVariants = form.getValues('variants');
  const currentVariant = currentVariants[variantIndex];
  
  // Create a deep copy to ensure nested objects are updated properly
  const updatedVariant = JSON.parse(JSON.stringify(currentVariant));
  updatedVariant[field] = value;
  
  // Log for debugging
  console.log(`Updating variant ${variantIndex}, field ${field}:`, value);
  
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

// File selection handler (for adding new images).
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files) {
    const newMedia = Array.from(e.target.files).map((file, index) => ({
      file,
      url: URL.createObjectURL(file),
      rank: mediaItems.length + index, // Assign new ranks
      isNew: true
    }));
    setMediaItems((prev) => [...prev, ...newMedia]);
  }
};

// Trigger the hidden file input when clicking the dropzone.
const handleDropzoneClick = () => {
  fileInputRef.current?.click();
};

// Remove an image and revoke its object URL if necessary.
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

// Monitor option changes to update variants
useEffect(() => {
  const subscription = form.watch((formValues, { name, type }) => {
    console.log('Form changed:', { name, type, formValues });
    
    // Check if the changed field is an option field
    if (name && (name.includes('options') || name.includes('title'))) {
      const currentOptions = form.getValues('options');
      console.log('Current options after change:', currentOptions);
      
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
            appendOption({ title: '', optionValues: [] });
          }
        }
      }
      
      // If the change is significant, regenerate the variants
      if (type === 'change') {
        console.log('Regenerating variants due to option change');
        handleGenerateVariants();
      }
    }
  });
  
  // Cleanup subscription on component unmount
  return () => subscription.unsubscribe();
}, [appendOption, form]);

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
      console.log('Categories fetched:', jsonData);
      
      if (jsonData && jsonData.product_categories) {
        setProductCategories(jsonData.product_categories);
      } else {
        // Handle unexpected response format
        console.error('Unexpected response format:', jsonData);
        setCategoryError('Received invalid category data from server');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoryError('Failed to load categories. Please try again.');
    } finally {
      setIsLoadingCategories(false);
    }
  };
  
  loadCategories();
}, []);

// Handle form submission with Medusa API compatibility
const onSubmit = async (values: ProductFormValues) => {
  console.log('onSubmit triggered with values:', values);
  
  // Validate required fields
  if (!values.title.trim()) {
    setError('Product title is required');
    return;
  }
  
  setIsSubmitting(true);
  setError(null);
  
  try {
    // Auto-generate handle from title and add timestamp for uniqueness
    // Make sure it's URL-safe
    const timestamp = new Date().getTime();
    const baseHandle = values.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove any non-word chars (except spaces and dashes)
      .replace(/\s+/g, '-') // Replace spaces with single dash
      .replace(/-+/g, '-'); // Replace multiple dashes with single dash
    
    values.handle = `${baseHandle}-${timestamp}`;
    
    let options = [];
    let variants = [];
    
    if (hasVariants) {
      // When using variants: filter and transform options to API format (remove empty ones)
      const validOptions = values.options.filter(opt => 
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
      const invalidVariants = values.variants.filter(v => !v.title || !v.sku);
      if (invalidVariants.length > 0) {
        setError('All variants must have a title and SKU');
        setIsSubmitting(false);
        return;
      }
      
      // Check if we have variants
      if (values.variants.length === 0) {
        setError('You must add at least one variant. Add option values first.');
        setIsSubmitting(false);
        return;
      }
      
      variants = values.variants;
    } else {
      // When not using variants: create a single default option and variant
      // This is needed because Medusa API requires at least one option and value
      const defaultTitle = "Title";
      const defaultValue = "Default";
      
      // Use the user-provided values for the default variant or fallback to defaults
      const defaultSku = values.defaultVariantSku || generateUniqueSku(values.title);
      const defaultPrice = values.defaultVariantPrice || 0;
      const defaultStock = values.defaultVariantStock || 0;
      
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
    
    // Transform variants to match Medusa JS API format
    const formattedVariants = variants.map((variant) => {
      // Format price as number to avoid string issues
      const price = typeof variant.price === 'string' 
        ? parseFloat(variant.price) 
        : (variant.price || 0);

      // Format options according to Medusa JS API expectations
      const variantOptions = {};
      
      // Map each option value to the format Medusa expects
      if (variant.optionValues && variant.optionValues.length > 0) {
        variant.optionValues.forEach(optVal => {
          variantOptions[optVal.optionName] = optVal.value;
        });
      }
      
      // Return the variant in the format Medusa JS API expects
      return {
        title: variant.title,
        sku: variant.sku || '',
        manage_inventory: Boolean(variant.manageInventory),
        allow_backorder: Boolean(variant.allowBackorder),
        // Don't include inventory_quantity as it's not recognized by your API version
        prices: [{
          amount: price,
          currency_code: 'inr'  // Using INR for Junooni
        }],
        options: variantOptions
      };
    });
    
    // Construct the product object in Medusa JS API format
    const newProduct = {
      title: values.title.trim(),
      subtitle: values.subtitle?.trim() || "", // Added short description
      handle: values.handle.trim(),
      description: values.description.trim() || "",
      status: values.status,
      discountable: Boolean(values.discountable),
      // Include category if selected
      ...(values.category_id ? { category_id: values.category_id } : {}),
      weight: values.weight ? parseInt(values.weight) || 0 : 0,
      length: values.length ? parseInt(values.length) || 0 : 0,
      width: values.width ? parseInt(values.width) || 0 : 0,
      height: values.height ? parseInt(values.height) || 0 : 0,
      // Only include these if they have values
      ...(values.material ? { material: values.material } : {}),
      ...(values.origin_country ? { origin_country: values.origin_country } : {}),
      options: options, // Always include options even for no-variant products
      variants: formattedVariants,
    };
    
    try {
      // Send the create request
      const result = await createProduct({ 
        product: {
          id: "", // This will be ignored by the server but satisfies TypeScript
          price: 0, // This will be overridden by variant prices but satisfies TypeScript
          ...newProduct
        } 
      });
      
      // If we have images to upload, do that now
      if (mediaItems.length > 0 && result.id) {
        try {
          // Upload each file
          for (const item of mediaItems) {
            if (item.file) {
              const formData = new FormData();
              formData.append('file', item.file);
              
              await uploadProductImage({
                productId: result.id,
                formData
              });
            }
          }
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
        }
      }
      
      // Navigate to the product detail page or back to products list
      navigate({ to: '/products' });
    } catch (apiError: any) {
      console.error('API Error creating product:', apiError);
      
      if (apiError.response) {
        setError(`API Error: ${apiError.response.data?.message || apiError.message || 'Unknown API error'}`);
      } else if (apiError.request) {
        setError('Network error: No response received from server. Please check your connection.');
      } else {
        setError(`Error: ${apiError.message || 'Unknown error occurred'}`);
      }
    }
  } catch (error: any) {
    console.error('Error preparing data for creation:', error);
    setError(`Failed to create product: ${error?.message || 'Unknown error'}`);
  } finally {
    setIsSubmitting(false);
  }
};

// For debugging when create button doesn't work
const handleManualSubmit = () => {
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
          variant="outline" 
          onClick={() => navigate({ to: '/products' })}
          className="text-gray-700 border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button 
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
                        <textarea
                          {...field}
                          rows={6}
                          placeholder="Write product details..."
                          className="w-full p-3 border border-gray-300 rounded-md focus:border-[#e65100] focus:ring-[#e65100] resize-y"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* Media Section */}
            <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">Media</h2>
              <Separator className="mb-6" />
              
              <h3 className="mb-3 font-medium text-gray-700">Product Images</h3>
              <p className="mb-4 text-sm text-gray-500">The first image will be used as the thumbnail in product listings</p>
              
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
              
              {mediaItems.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">Product Gallery ({mediaItems.length})</h4>
                    {mediaItems.length > 1 && (
                      <p className="text-xs text-gray-500">Drag to reorder</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {mediaItems
                      .sort((a, b) => a.rank - b.rank)
                      .map((item, index) => (
                        <div
                          key={index}
                          className="relative flex flex-col overflow-hidden transition-all duration-200 bg-white border rounded-md group hover:shadow-md"
                        >
                          <div className="relative flex items-center justify-center h-40 overflow-hidden bg-gray-100">
                            <img
                              src={item.url}
                              alt={`Product image ${index + 1}`}
                              className="object-cover w-full h-full"
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
                            <div className="truncate text-sm text-gray-600 max-w-[160px]">
                              {item.file ? item.file.name : item.url.split('/').pop() || `Image ${index + 1}`}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="p-1 text-red-500 rounded-full bg-red-50 hover:bg-red-100"
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
                </div>
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#e65100]" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
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
                          name={`options.${optionIndex}.title` as const}
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
                            variant="ghost"
                            size="sm"
                            className="mt-6 ml-2 text-gray-500 hover:text-red-500 hover:bg-red-50"
                            onClick={() => removeOption(optionIndex)}
                          >
                            <IconX size={18} />
                          </Button>
                        )}
                      </div>
                      
                      {/* Option Values with Pill Style Display */}
                      <div className="mt-4">
                        <FormLabel className="font-medium text-gray-700">
                          Option values
                        </FormLabel>
                        
                        {/* Display existing values as pills */}
                        <div className="flex flex-wrap gap-2 mt-2 mb-4 min-h-10">
                          {Array.isArray(form.watch(`options.${optionIndex}.optionValues`)) ? 
                            form.watch(`options.${optionIndex}.optionValues`, []).map((value, valueIndex) => (
                              <span 
                                key={valueIndex} 
                                className="flex items-center px-3 py-1.5 text-sm bg-orange-100 text-[#d84315] rounded-full"
                              >
                                {value}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOptionValue(optionIndex, valueIndex)}
                                  className="ml-1.5 text-[#d84315] hover:text-red-700"
                                >
                                  <IconX size={14} />
                                </button>
                              </span>
                            )) : (
                              <div className="py-2 text-sm text-gray-500">No values added yet</div>
                            )
                          }
                        </div>
                        
                        {/* Add new value input */}
                        <div className="flex gap-2">
                          <Input 
                            value={newOptionValues[optionIndex] || ''}
                            onChange={(e) => handleNewOptionValueChange(optionIndex, e.target.value)}
                            placeholder="Enter a new value..."
                            className="flex-1 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddOptionValue(optionIndex);
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            size="sm"
                            onClick={() => handleAddOptionValue(optionIndex)}
                            className="bg-[#e65100] hover:bg-[#d84315] text-white"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add another option button (only if fewer than 3 options) */}
                  {optionFields.length < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newOptionIndex = optionFields.length;
                        appendOption({ title: '', optionValues: [] });
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
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleDuplicateVariant(index)}
                                        className="text-gray-600 hover:bg-gray-100"
                                      >
                                        <IconCopy size={16} />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Duplicate variant</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => removeVariant(index)}
                                        className="text-red-500 hover:bg-red-50"
                                      >
                                        <IconX size={16} />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Remove variant</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
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
                            Published
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
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem className="mb-5">
                    <FormLabel className="font-medium text-gray-700">Product Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || ''}
                      disabled={isLoadingCategories}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:ring-[#e65100]">
                          <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a category"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-80">
                        {categoryError ? (
                          <div className="p-2 text-sm text-red-500">{categoryError}</div>
                        ) : productCategories.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500">No categories available</div>
                        ) : renderCategoryOptions(productCategories)}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-sm text-gray-500">
                      Categorize your product to help customers find it
                    </FormDescription>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
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
                        <FormLabel className="font-medium text-gray-700">Length (cm)</FormLabel>
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
                        <FormLabel className="font-medium text-gray-700">Width (cm)</FormLabel>
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
                        <FormLabel className="font-medium text-gray-700">Height (cm)</FormLabel>
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

