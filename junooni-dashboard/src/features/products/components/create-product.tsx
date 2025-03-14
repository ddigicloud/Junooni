import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCirclePlus, IconX, IconLink, IconUpload, IconCopy } from '@tabler/icons-react';

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
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    
    // Create SKU from title, replacing non-alphanumeric chars with hyphens
    const sku = `SKU-${title.replace(/[^A-Z0-9]/ig, '-')}`;
    
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
  handle: string;
  description: string;
  status: string;
  thumbnail: string;
  discountable: boolean;
  category: string;
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
  weight: string;
  length: string;
  width: string;
  height: string;
  material?: string;
  origin_country?: string;
};

const CreateProduct = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImageTab, setActiveImageTab] = useState("upload");
  const [newImageUrl, setNewImageUrl] = useState("");
  
  // For managing the new option value being added for each option
  const [newOptionValues, setNewOptionValues] = useState<Record<number, string>>({});

  // For images, we store objects with a file (if newly added) and URL and rank.
  const [mediaItems, setMediaItems] = useState<
    { file: File | null; url: string; rank: number; id?: string; isNew?: boolean }[]      
  >([]);

  // Store categories from API
  const [categories, setCategories] = useState<
    { id: string; name: string; handle: string }[]
  >([]);

  // For bulk editing variants
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  // Ref for the hidden file input for drag‑and‑drop.
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize the form with default values based on the schema
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      title: '',
      handle: '',
      description: '',
      status: 'draft', // Default to draft for new products
      thumbnail: '',
      discountable: true,
      category: '',
      options: [
        // Start with two common options: Size and Color
        {
          id: generateUUID(),
          title: 'Size',
          optionValues: []
        },
        {
          id: generateUUID(),
          title: 'Color',
          optionValues: []
        }
      ],
      variants: [],
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
        
        // For new variants, add default sku and other values
        const variant = {
          ...newVariant,
          sku: `SKU-${newVariant.title.replace(/[^A-Z0-9]/ig, '-')}`,
          price: 0,
          stock: 0,
          allowBackorder: false,
          manageInventory: true,
        };
        
        console.log("Created new variant:", variant.title);
        return variant;
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
    
    // Create a new copy with a new ID
    const newVariant = {
      ...JSON.parse(JSON.stringify(variantToDuplicate)),
      id: generateUUID(),
      sku: `${variantToDuplicate.sku}-copy`,
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
  }, [appendOption, form, handleGenerateVariants]);

  // Initialize default option values state
  useEffect(() => {
    const initialOptionValues = {};
    optionFields.forEach((_, index) => {
      initialOptionValues[index] = '';
    });
    setNewOptionValues(initialOptionValues);
  }, [optionFields.length]);

  // Fetch categories on component mount
  // useEffect(() => {
  //   async function loadCategories() {
  //     try {
  //       const categoriesData = await fetchCategories();
  //       if (categoriesData && Array.isArray(categoriesData)) {
  //         setCategories(categoriesData);
  //       }
  //     } catch (error) {
  //       console.error('Error loading categories:', error);
  //     }
  //   }
    
  //   loadCategories();
  // }, []);

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

  // Update the submission handler to create a new product - FIXED FOR API FORMAT
  const onSubmit = async (values: ProductFormValues) => {
    // Validate required fields
    if (!values.title.trim()) {
      setError('Product title is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Form values for submission:', values);
      
      // Generate a handle if none provided
      if (!values.handle.trim()) {
        values.handle = values.title.toLowerCase().replace(/\s+/g, '-');
      }
      
      // Filter and transform options to API format (remove empty ones)
      const validOptions = values.options.filter(opt => 
        opt.title && 
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
        return {
          title: opt.title,
          values: opt.optionValues.map(value => value)  // Array of string values
        };
      });

      console.log('Formatted options:', options);
      
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
      
      // Transform variants to API format
      const variants = values.variants.map((variant) => {
        // Format price as number to avoid string issues
        const price = typeof variant.price === 'string' 
          ? parseFloat(variant.price) 
          : (variant.price || 0);

        // Format options according to API expectations
        const options = {};
        
        // Return the variant in API format
        return {
          title: variant.title,
          sku: variant.sku || '',
          manage_inventory: Boolean(variant.manageInventory),
          allow_backorder: Boolean(variant.allowBackorder),
          // Don't include id, inventory_quantity, or compare_at_price
          prices: [{
            amount: price,
            currency_code: 'usd'
          }]
        };
      });

      console.log('Formatted variants:', variants);
    
      // Get the selected category ID
      const categoryId = values.category || null;
      
      // Construct the product object in API format, conforming to the schema
      const newProduct = {
        title: values.title.trim(),
        handle: values.handle.trim(),
        description: values.description.trim() || "",
        status: values.status,
        thumbnail: values.thumbnail || "",
        discountable: Boolean(values.discountable),
        // category_id: categoryId, 
        weight: values.weight ? parseInt(values.weight) || 0 : 0,
        length: values.length ? parseInt(values.length) || 0 : 0,
        width: values.width ? parseInt(values.width) || 0 : 0,
        height: values.height ? parseInt(values.height) || 0 : 0,
        material: values.material || undefined,
        origin_country: values.origin_country || undefined,
        options: options,
        variants: variants,
      };

      // Debug output
      console.log('Product data being sent to API:', JSON.stringify(newProduct, null, 2));
      
      try {
        // Send the create request
        const result = await createProduct({ product: newProduct });
        console.log('Create result:', result);
        
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
              else if (item.url) {
                // If it's a URL, we would need a method to associate it with the product
                // This depends on your API implementation
                console.log('URL image to associate:', item.url);
                // Example: await associateProductImage({ productId: result.id, url: item.url, rank: item.rank });
              }
            }
          } catch (uploadError) {
            console.error('Error uploading images:', uploadError);
            // We don't want to fail the whole operation if image upload fails
            // Just log it and continue
          }
        }
        
        // Navigate to the product detail page or back to products list
        navigate({ to: '/products' });
      } catch (apiError: any) {
        console.error('API Error creating product:', apiError);
        
        // More detailed error handling
        if (apiError.response) {
          console.error('API Error response:', apiError.response);
          console.error('Error response data:', apiError.response.data);
          setError(`API Error: ${apiError.response.data?.message || apiError.response.data?.error || apiError.message || 'Unknown API error'}`);
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

  // Cleanup any object URLs for newly added files when unmounting.
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Error</h2>
          <p className="mb-6">{error}</p>
          <Button onClick={() => navigate({ to: '/products' })}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create New Product</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate({ to: '/products' })}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Left Column */}
            <div className="space-y-8 md:col-span-2">
              {/* Title & Description Section */}
              <section className="p-6 bg-white border border-gray-200 rounded">
                <div className="mb-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Winter Hoodie" className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mb-4">
                  <FormField
                    control={form.control}
                    name="handle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Handle (URL Slug)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. winter-hoodie (generated from title if left blank)" className="w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            rows={6}
                            placeholder="Write product details..."
                            className="w-full p-2 border rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Media Section */}
              <section className="p-6 bg-white border border-gray-200 rounded">
                <h2 className="mb-4 text-lg font-semibold">Media</h2>
                <div className="mb-4">
                  <FormField
                    control={form.control}
                    name="thumbnail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/image.jpg" className="w-full" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <h3 className="mb-2 font-medium">Product Images</h3>
                
                <Tabs defaultValue="upload" onValueChange={setActiveImageTab} value={activeImageTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="upload">
                      <IconUpload size={16} className="mr-2" />
                      Upload Images
                    </TabsTrigger>
                    <TabsTrigger value="url">
                      <IconLink size={16} className="mr-2" />
                      Add from URL
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload">
                    <div
                      onClick={handleDropzoneClick}
                      className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400"
                    >
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M14 22h20M24 12v20"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="mt-2 text-sm text-gray-600">
                        Drag and drop images or click to upload
                      </span>
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
                    <div className="flex items-center space-x-2">
                      <Input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImageUrl();
                          }
                        }}
                      />
                      <Button onClick={handleAddImageUrl} type="button">Add Image</Button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Enter the URL of an image to add it to the product gallery.
                    </p>
                  </TabsContent>
                </Tabs>
                
                {mediaItems.length > 0 && (
                  <div className="mt-4">
                    <h4 className="mb-2">Current Images ({mediaItems.length})</h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {mediaItems
                        .sort((a, b) => a.rank - b.rank)
                        .map((item, index) => (
                          <div
                            key={index}
                            className="relative flex flex-col overflow-hidden bg-gray-100 border rounded"
                          >
                            <div className="flex items-center justify-center h-32 overflow-hidden">
                              <img
                                src={item.url}
                                alt={`Preview ${index}`}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="flex items-center justify-between p-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px]">
                                      {item.file ? item.file.name : item.url.split('/').pop() || `Image ${index + 1}`}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Will be uploaded when product is created
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="flex space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveImageUp(index)}
                                  disabled={index === 0}
                                  className="p-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveImageDown(index)}
                                  disabled={index === mediaItems.length - 1}
                                  className="p-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index)}
                                  className="p-1 text-xs text-white bg-red-500 rounded"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Variants Section - Improved Shopify-like style */}
              <section className="p-6 bg-white border border-gray-200 rounded">
                <h2 className="mb-4 text-lg font-semibold">Options & Variants</h2>
                
                {/* Options Section */}
                <div className="mb-6">
                  <h3 className="mb-3 font-medium">Options</h3>
                  <div className="p-4 mb-4 rounded-md bg-gray-50">
                    <p className="text-sm text-gray-600">
                      Add options like size or color to create variants of this product. Customers will choose from these options during checkout.
                    </p>
                    <p className="mt-2 text-sm font-semibold text-blue-600">
                      * Options and values are required for product creation
                    </p>
                  </div>
                  
                  {optionFields.map((opt, optionIndex) => (
                    <div key={opt.id} className="p-4 mb-6 border rounded-md">
                      <div className="flex items-center justify-between mb-4">
                        <FormField
                          control={form.control}
                          name={`options.${optionIndex}.title` as const}
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>
                                Option {optionIndex + 1} name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder={
                                    optionIndex === 0 ? "e.g. Size" : 
                                    optionIndex === 1 ? "e.g. Color" : "e.g. Material"
                                  }
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
                            className="mt-6 ml-2"
                            onClick={() => removeOption(optionIndex)}
                          >
                            <IconX size={18} />
                          </Button>
                        )}
                      </div>
                      
                      {/* Option Values with Pill Style Display */}
                      <div className="mt-4">
                        <FormLabel>
                          Option values
                        </FormLabel>
                        
                        {/* Display existing values as pills */}
                        <div className="flex flex-wrap gap-2 mt-2 mb-3">
                          {Array.isArray(form.watch(`options.${optionIndex}.optionValues`)) ? 
                            form.watch(`options.${optionIndex}.optionValues`, []).map((value, valueIndex) => (
                              <span 
                                key={valueIndex} 
                                className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-full"
                              >
                                {value}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOptionValue(optionIndex, valueIndex)}
                                  className="ml-1 text-gray-500 hover:text-gray-700"
                                >
                                  <IconX size={14} />
                                </button>
                              </span>
                            )) : <span className="text-sm text-gray-500">No values added yet</span>
                          }
                        </div>
                        
                        {/* Add new value input */}
                        <div className="flex gap-2">
                          <Input 
                            value={newOptionValues[optionIndex] || ''}
                            onChange={(e) => handleNewOptionValueChange(optionIndex, e.target.value)}
                            placeholder="Enter a new value..."
                            className="flex-1"
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
                      className="mt-2"
                    >
                      <IconCirclePlus className="mr-1" /> 
                      Add another option
                    </Button>
                  )}
                </div>
                
                {/* Variants Section with Bulk Editing */}
                {variantFields.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Variants ({variantFields.length})</h3>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleGenerateVariants}
                        size="sm"
                      >
                        Regenerate variants
                      </Button>
                    </div>
                    
                    {/* Bulk Edit Controls */}
                    <Card className="mb-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Bulk Edit</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center">
                            <Switch 
                              checked={bulkEditMode} 
                              onCheckedChange={setBulkEditMode} 
                              id="bulk-edit-mode"
                            />
                            <label htmlFor="bulk-edit-mode" className="ml-2 text-sm">
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
                                />
                                <label htmlFor="select-all-variants" className="ml-2 text-sm">
                                  Select all variants ({selectedVariants.length}/{variantFields.length})
                                </label>
                              </div>
                              
                              {selectedVariants.length > 0 && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <div>
                                    <label className="block mb-1 text-sm">Set price for all selected</label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={bulkPrice}
                                        onChange={(e) => setBulkPrice(e.target.value)}
                                        placeholder="0.00"
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => handleBulkEdit('price', parseFloat(bulkPrice) || 0)}
                                        disabled={!bulkPrice}
                                      >
                                        Apply
                                      </Button>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block mb-1 text-sm">Set stock for all selected</label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={bulkStock}
                                        onChange={(e) => setBulkStock(e.target.value)}
                                        placeholder="0"
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => handleBulkEdit('stock', parseInt(bulkStock) || 0)}
                                        disabled={!bulkStock}
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
                    <div className="overflow-x-auto">
                      <table className="w-full mt-4 border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            {bulkEditMode && (
                              <th className="p-2 text-left border">
                                <span className="sr-only">Select</span>
                              </th>
                            )}
                            <th className="p-2 text-left border">Variant</th>
                            <th className="p-2 text-left border">SKU</th>
                            <th className="p-2 text-left border">Price</th>
                            <th className="p-2 text-left border">Stock</th>
                            <th className="p-2 text-center border">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variantFields.map((vf, index) => (
                            <tr key={vf.id} className={bulkEditMode && selectedVariants.includes(vf.id) ? "bg-blue-50" : ""}>
                              {bulkEditMode && (
                                <td className="p-2 text-center border">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedVariants.includes(vf.id)} 
                                    onChange={() => handleToggleVariantSelection(vf.id)}
                                    className="w-4 h-4"
                                  />
                                </td>
                              )}
                              <td className="p-2 border">
                                <div className="flex flex-col">
                                  <span className="font-medium">{form.watch(`variants.${index}.title`)}</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {form.watch(`variants.${index}.optionValues`, []).map((optVal, optIndex) => (
                                      <Badge 
                                        key={optIndex} 
                                        variant="outline" 
                                        className="text-xs"
                                      >
                                        {optVal.optionName}: {optVal.value}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </td>
                              <td className="p-2 border">
                                <Input
                                  {...form.register(`variants.${index}.sku`)}
                                  onChange={(e) => handleVariantFieldChange(index, 'sku', e.target.value)}
                                  className="w-full"
                                />
                              </td>
                              <td className="p-2 border">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={form.watch(`variants.${index}.price`) || ''}
                                  onChange={(e) => {
                                    const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                                    handleVariantFieldChange(index, 'price', value === '' ? 0 : value);
                                  }}
                                  className="w-full"
                                />
                              </td>
                              <td className="p-2 border">
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={form.watch(`variants.${index}.stock`) || ''}
                                  onChange={(e) => {
                                    const value = e.target.value === '' ? '' : parseInt(e.target.value);
                                    handleVariantFieldChange(index, 'stock', value === '' ? 0 : value);
                                  }}
                                  className="w-full"
                                />
                              </td>
                              <td className="p-2 text-center border">
                                <div className="flex justify-center space-x-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => handleDuplicateVariant(index)}
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
            <div className="space-y-8">
              <section className="p-6 bg-white border border-gray-200 rounded">
                <h2 className="mb-4 text-lg font-semibold">Status</h2>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="discountable"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discountable</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value === 'true')} 
                          value={field.value ? 'true' : 'false'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          {/* <SelectContent>
                            {categories.length > 0 ? (
                              categories.map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>
                                No categories available
                              </SelectItem>
                            )}
                          </SelectContent> */}
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>
              
              <section className="p-6 bg-white border border-gray-200 rounded">
                <h2 className="mb-4 text-lg font-semibold">Physical Details</h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (g)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" placeholder="e.g. 400" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length (cm)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" placeholder="e.g. 30" />
                        </FormControl>
                      </FormItem>

                    )}
                  />
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width (cm)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" placeholder="e.g. 20" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" placeholder="e.g. 5" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </section>
              
              <section className="p-6 bg-white border border-gray-200 rounded">
                <h2 className="mb-4 text-lg font-semibold">Additional Info</h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Cotton, Polyester" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="origin_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country of Origin</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. US, China" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </section>
            </div>
          </div>
          <div className="flex justify-end mt-8 space-x-2">
            <Button variant="outline" onClick={() => navigate({ to: '/products' })}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateProduct;