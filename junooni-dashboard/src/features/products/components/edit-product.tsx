// import { useState, useEffect, useRef } from 'react';
// import { useNavigate, useParams } from '@tanstack/react-router';
// import { useForm, useFieldArray } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { IconCirclePlus, IconX, IconLink, IconUpload, IconGripVertical, IconCopy } from '@tabler/icons-react';

// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// import { Switch } from '@/components/ui/switch';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// import { ProductSchema, ApiOption, ApiVariant } from '../data/schema';
// import { fetchProduct, updateProduct, uploadProductImage,fetchCategories } from '../context/fetchApi';

// /** Utility: Generate a random UUID. */
// const generateUUID = () => {
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
//     const r = (Math.random() * 16) | 0;
//     const v = c === 'x' ? r : (r & 0x3) | 0x8;
//     return v.toString(16);
//   });
// };

// /**
//  * Utility: Extract color and size from variant title if not available in options
//  */
// const extractVariantOptions = (title, availableOptions) => {
//   // Common color values to check in the title
//   const commonColors = [
//     'black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 
//     'pink', 'brown', 'gray', 'grey', 'navy', 'teal', 'turquoise', 'silver',
//     'gold', 'beige', 'maroon', 'olive'
//   ];
  
//   // Common size values to check in the title
//   const commonSizes = [
//     'xs', 'small', 's', 'medium', 'm', 'large', 'l', 'xl', 'xxl', '2xl', 'xxxl', '3xl',
//     'one size', 'onesize', 'one-size', 'os'
//   ];
  
//   const result = [];
//   const lowerTitle = title.toLowerCase();
//   const words = lowerTitle.split(/\s+/);
  
//   // Find color option
//   const colorOption = availableOptions.find(opt => 
//     opt.title.toLowerCase() === 'color' || opt.title.toLowerCase().includes('color')
//   );
  
//   if (colorOption) {
//     const foundColor = commonColors.find(color => words.includes(color));
//     if (foundColor) {
//       // Capitalize first letter for display
//       const formattedColor = foundColor.charAt(0).toUpperCase() + foundColor.slice(1);
//       result.push({
//         optionId: colorOption.id,
//         optionName: colorOption.title,
//         value: formattedColor
//       });
//     }
//   }
  
//   // Find size option
//   const sizeOption = availableOptions.find(opt => 
//     opt.title.toLowerCase() === 'size' || opt.title.toLowerCase().includes('size')
//   );
  
//   if (sizeOption) {
//     const foundSize = commonSizes.find(size => words.includes(size));
//     if (foundSize) {
//       // Format size appropriately
//       let formattedSize = foundSize.toUpperCase();
//       if (foundSize === 'small') formattedSize = 'Small';
//       if (foundSize === 'medium') formattedSize = 'Medium';
//       if (foundSize === 'large') formattedSize = 'Large';
      
//       result.push({
//         optionId: sizeOption.id,
//         optionName: sizeOption.title,
//         value: formattedSize
//       });
//     }
//   }
  
//   return result;
// };

// /**
//  * Utility: Given an array of option objects (each with an array of values),
//  * produce all possible variant combinations (Cartesian product).
//  */
// function generateVariantsFromOptions(
//   options: { optionId: string; optionName: string; optionValues: string[] }[]
// ): {
//   id: string;
//   title: string;
//   price: number;
//   compareAtPrice: number;
//   stock: number;
//   sku: string;
//   allowBackorder: boolean;
//   manageInventory: boolean;
//   optionValues: { optionId: string; optionName: string; value: string }[];
// }[] {
//   if (!options.length) return [];

//   console.log("Generating variants from options:", options);

//   // Helper function for the Cartesian product
//   const cartesian = (arrays: string[][]): string[][] => {
//     return arrays.reduce<string[][]>(
//       (results, current) => {
//         return results
//           .map(result => current.map(item => [...result, item]))
//           .reduce((subResults, slice) => [...subResults, ...slice], []);
//       },
//       [[]]
//     );
//   };

//   // Extract value arrays from each option
//   const valueArrays = options.map(opt => opt.optionValues);
  
//   // Generate all combinations of values
//   const combinations = cartesian(valueArrays);
  
//   // Map combinations to variant objects
//   return combinations.map(combo => {
//     // Create option value objects for each value in the combination
//     const optionValues = combo.map((value, index) => ({
//       optionId: options[index].optionId,
//       optionName: options[index].optionName,
//       value: value
//     }));
    
//     // Create variant title (e.g. "Small / Red / Cotton")
//     const title = optionValues.map(opt => opt.value).join(' / ');
    
//     // Create SKU from title, replacing non-alphanumeric chars with hyphens
//     const sku = `SKU-${title.replace(/[^A-Z0-9]/ig, '-')}`;
    
//     return {
//       id: generateUUID(),
//       title,
//       price: 0,
//       compareAtPrice: 0,
//       stock: 0,
//       sku,
//       allowBackorder: false,
//       manageInventory: true,
//       optionValues,
//     };
//   });
// }

// // ProductFormValues structure
// type ProductFormValues = {
//   title: string;
//   handle: string;
//   description: string;
//   status: string;
//   thumbnail: string;
//   discountable: boolean;
//   category: string;
//   options: {
//     id?: string;
//     title: string;
//     optionValues: string[];
//   }[];
//   variants: {
//     id: string;
//     title: string;
//     price: number;
//     compareAtPrice?: number;
//     stock: number;
//     sku: string;
//     allowBackorder: boolean;
//     manageInventory: boolean;
//     optionValues: { optionId?: string; optionName: string; value: string }[];
//   }[];
//   weight: string;
//   length: string;
//   width: string;
//   height: string;
//   material?: string;
//   origin_country?: string;
// };

// const EditProduct = () => {
//   const { id } = useParams({ from: "/_authenticated/products/$id" });
//   const navigate = useNavigate();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [activeImageTab, setActiveImageTab] = useState("upload");
//   const [newImageUrl, setNewImageUrl] = useState("");
  
//   // For managing the new option value being added for each option
//   const [newOptionValues, setNewOptionValues] = useState<Record<number, string>>({});

//   // For images, we store objects with a file (if newly added) and URL and rank.
//   const [mediaItems, setMediaItems] = useState<
//     { file: File | null; url: string; rank: number; id?: string; isNew?: boolean }[]      
//   >([]);

//   // Store categories from API
//   const [categories, setCategories] = useState<
//     { id: string; name: string; handle: string }[]
//   >([]);

//   // For bulk editing variants
//   const [bulkEditMode, setBulkEditMode] = useState(false);
//   const [bulkPrice, setBulkPrice] = useState("");
//   const [bulkStock, setBulkStock] = useState("");
//   const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

//   // Ref for the hidden file input for drag‑and‑drop.
//   const fileInputRef = useRef<HTMLInputElement>(null);
  
//   // Keep track of the original options/variants for reconciliation
//   const [originalData, setOriginalData] = useState<{
//     options?: ApiOption[];
//     variants?: ApiVariant[];
//   }>({});

//   // Initialize the form with default values based on the schema
//   const form = useForm<ProductFormValues>({
//     resolver: zodResolver(ProductSchema),
//     defaultValues: {
//       title: '',
//       handle: '',
//       description: '',
//       status: 'published',
//       thumbnail: '',
//       discountable: true,
//       category: '',
//       options: [],
//       variants: [],
//       weight: '',
//       length: '',
//       width: '',
//       height: '',
//       material: '',
//       origin_country: '',
//     },
//   });

//   // Field arrays for options and variants.
//   const {
//     fields: optionFields,
//     append: appendOption,
//     remove: removeOption,
//     update: updateOption,
//   } = useFieldArray({
//     control: form.control,
//     name: 'options',
//   });

//   const {
//     fields: variantFields,
//     replace: replaceVariants,
//     remove: removeVariant,
//     update: updateVariant,
//   } = useFieldArray({
//     control: form.control,
//     name: 'variants',
//   });

//   // Add a new option value for a specific option
//   const handleAddOptionValue = (optionIndex: number) => {
//     const value = newOptionValues[optionIndex];
//     if (!value || value.trim() === '') return;
    
//     const currentOptions = form.getValues('options');
//     const currentOption = currentOptions[optionIndex];
    
//     // Get current option values (ensure it's an array)
//     const currentValues = Array.isArray(currentOption.optionValues) 
//       ? currentOption.optionValues 
//       : [];
    
//     // Add the new value to the option's values if it doesn't already exist
//     if (!currentValues.includes(value)) {
//       const updatedValues = [...currentValues, value];
      
//       // Update the option in the form
//       updateOption(optionIndex, {
//         ...currentOption,
//         optionValues: updatedValues
//       });
      
//       // Clear the input for this option
//       const updatedNewValues = { ...newOptionValues };
//       updatedNewValues[optionIndex] = '';
//       setNewOptionValues(updatedNewValues);
      
//       // Generate variants after adding a new option value
//       handleGenerateVariants();
//     }
//   };

//   // Remove an option value
//   const handleRemoveOptionValue = (optionIndex: number, valueIndex: number) => {
//     const currentOptions = form.getValues('options');
//     const currentOption = currentOptions[optionIndex];
    
//     // Ensure we have an array of values
//     const currentValues = Array.isArray(currentOption.optionValues) 
//       ? currentOption.optionValues 
//       : [];
    
//     // Remove the value at the specified index
//     const updatedValues = currentValues.filter((_, i) => i !== valueIndex);
    
//     // Update the option in the form
//     updateOption(optionIndex, {
//       ...currentOption,
//       optionValues: updatedValues
//     });
    
//     // Generate variants after removing an option value
//     handleGenerateVariants();
//   };

//   // Handle change in new option value input
//   const handleNewOptionValueChange = (optionIndex: number, value: string) => {
//     setNewOptionValues(prev => ({
//       ...prev,
//       [optionIndex]: value
//     }));
//   };

//   // Generate variants from options
//   const handleGenerateVariants = () => {
//     const currentOptions = form.getValues('options');
    
//     // Filter out options without name or values
//     const validOptions = currentOptions.filter(opt => 
//       opt.title && Array.isArray(opt.optionValues) && opt.optionValues.length > 0
//     );
    
//     if (validOptions.length > 0) {
//       console.log("Generating variants from options:", validOptions);
      
//       const parsedOptions = validOptions.map((opt) => ({
//         optionId: opt.id || generateUUID(),
//         optionName: opt.title,
//         optionValues: opt.optionValues,
//       }));
      
//       const currentVariants = form.getValues('variants');
//       console.log("Current variants before generation:", currentVariants);
      
//       const newVariants = generateVariantsFromOptions(parsedOptions);
//       console.log("Generated new variants:", newVariants);
      
//       // Preserve existing variant data (prices, stock, etc.) where possible
//       const variantsWithExistingData = newVariants.map(newVariant => {
//         // Try to find an existing variant with the same option values
//         const existingVariant = currentVariants.find(existing => {
//           // Skip if lengths don't match or if optionValues is not an array
//           if (!existing.optionValues || 
//               !Array.isArray(existing.optionValues) || 
//               existing.optionValues.length !== newVariant.optionValues.length) return false;
          
//           // Check if all option values match
//           const allValuesMatch = newVariant.optionValues.every(newOptVal => 
//             existing.optionValues.some(existingOptVal => 
//               existingOptVal.optionName === newOptVal.optionName && 
//               existingOptVal.value === newOptVal.value
//             )
//           );
          
//           return allValuesMatch;
//         });
        
//         if (existingVariant) {
//           console.log("Found existing variant match:", {
//             new: newVariant.title,
//             existing: existingVariant.title
//           });
          
//           // Keep existing data but update title and optionValues
//           return {
//             ...existingVariant,
//             title: newVariant.title, // Use consistent title format
//             optionValues: newVariant.optionValues.map(newOptVal => {
//               // Find matching existing option value to preserve optionId
//               const matchingExistingOptVal = existingVariant.optionValues.find(
//                 existingOptVal => existingOptVal.optionName === newOptVal.optionName && 
//                                   existingOptVal.value === newOptVal.value
//               );
              
//               return {
//                 optionId: matchingExistingOptVal?.optionId || newOptVal.optionId,
//                 optionName: newOptVal.optionName,
//                 value: newOptVal.value
//               };
//             }),
//           };
//         }
        
//         // For new variants, add default sku and other values
//         const variant = {
//           ...newVariant,
//           sku: `SKU-${newVariant.title.replace(/[^A-Z0-9]/ig, '-')}`,
//           price: 0,
//           stock: 0,
//           allowBackorder: false,
//           manageInventory: true,
//         };
        
//         console.log("Created new variant:", variant.title);
//         return variant;
//       });
      
//       console.log("Final variants to be applied:", variantsWithExistingData);
      
//       // Replace variants in the form
//       replaceVariants(variantsWithExistingData);
      
//       // Log variants after replacement to verify
//       setTimeout(() => {
//         console.log("Variants after replacement:", form.getValues('variants'));
//       }, 0);
//     } else {
//       console.log("No valid options found, clearing variants");
//       // If there are no valid options, clear the variants
//       replaceVariants([]);
//     }
//   };

//   // Update a specific variant field
//   const handleVariantFieldChange = (variantIndex: number, field: string, value: any) => {
//     const currentVariants = form.getValues('variants');
//     const currentVariant = currentVariants[variantIndex];
    
//     // Create a deep copy to ensure nested objects are updated properly
//     const updatedVariant = JSON.parse(JSON.stringify(currentVariant));
//     updatedVariant[field] = value;
    
//     // Log for debugging
//     console.log(`Updating variant ${variantIndex}, field ${field}:`, value);
    
//     updateVariant(variantIndex, updatedVariant);
//   };

//   // Handle bulk edit of variants
//   const handleBulkEdit = (field: string, value: any) => {
//     if (!selectedVariants.length) return;
    
//     const currentVariants = form.getValues('variants');
    
//     // Update each selected variant
//     selectedVariants.forEach(variantId => {
//       const variantIndex = currentVariants.findIndex(v => v.id === variantId);
//       if (variantIndex !== -1) {
//         handleVariantFieldChange(variantIndex, field, value);
//       }
//     });
    
//     // Clear bulk edit values after applying
//     if (field === 'price') setBulkPrice('');
//     if (field === 'stock') setBulkStock('');
//   };

//   // Handle selecting all variants
//   const handleSelectAllVariants = (checked: boolean) => {
//     if (checked) {
//       // Select all variants
//       const allVariantIds = form.getValues('variants').map(v => v.id);
//       setSelectedVariants(allVariantIds);
//     } else {
//       // Deselect all
//       setSelectedVariants([]);
//     }
//   };

//   // Toggle selection of a specific variant
//   const handleToggleVariantSelection = (variantId: string) => {
//     setSelectedVariants(prev => {
//       if (prev.includes(variantId)) {
//         return prev.filter(id => id !== variantId);
//       } else {
//         return [...prev, variantId];
//       }
//     });
//   };

//   // Duplicate a variant
//   const handleDuplicateVariant = (variantIndex: number) => {
//     const currentVariants = form.getValues('variants');
//     const variantToDuplicate = currentVariants[variantIndex];
    
//     // Create a new copy with a new ID
//     const newVariant = {
//       ...JSON.parse(JSON.stringify(variantToDuplicate)),
//       id: generateUUID(),
//       sku: `${variantToDuplicate.sku}-copy`,
//       title: `${variantToDuplicate.title} (Copy)`
//     };
    
//     // Insert after the original
//     const updatedVariants = [...currentVariants];
//     updatedVariants.splice(variantIndex + 1, 0, newVariant);
    
//     replaceVariants(updatedVariants);
//   };

//   // Handle adding a new image via URL
//   const handleAddImageUrl = () => {
//     if (!newImageUrl.trim()) return;
    
//     // Basic URL validation
//     try {
//       new URL(newImageUrl); // Will throw if not a valid URL
      
//       // Add to media items
//       setMediaItems((prev) => [
//         ...prev,
//         {
//           file: null,
//           url: newImageUrl,
//           rank: prev.length,
//           isNew: true
//         }
//       ]);
      
//       // Clear the input
//       setNewImageUrl('');
      
//     } catch (error) {
//       setError('Please enter a valid URL');
//       setTimeout(() => setError(null), 3000);
//     }
//   };

//   // Monitor option changes to update variants
//   useEffect(() => {
//     const subscription = form.watch((formValues, { name, type }) => {
//       console.log('Form changed:', { name, type, formValues });
      
//       // Check if the changed field is an option field
//       if (name && (name.includes('options') || name.includes('title'))) {
//         const currentOptions = form.getValues('options');
//         console.log('Current options after change:', currentOptions);
        
//         // If the last option has values and we have fewer than 3 options
//         if (currentOptions.length > 0) {
//           const lastOption = currentOptions[currentOptions.length - 1];
//           const hasValues = lastOption?.optionValues && 
//                           Array.isArray(lastOption.optionValues) && 
//                           lastOption.optionValues.length > 0;
          
//           if (hasValues && currentOptions.length < 3) {
//             // Check if we don't already have an empty option at the end
//             const hasEmptyOption = currentOptions.some(opt => 
//               opt.title === '' && (!opt.optionValues || 
//               (Array.isArray(opt.optionValues) && opt.optionValues.length === 0))
//             );
            
//             if (!hasEmptyOption) {
//               // Add a new empty option
//               appendOption({ title: '', optionValues: [] });
//             }
//           }
//         }
        
//         // Only regenerate variants if we have a meaningful change to options
//         // This prevents unnecessary regeneration during initial form setup
//         if (isLoading) return;
        
//         // If the change is significant, regenerate the variants
//         if (type === 'change') {
//           console.log('Regenerating variants due to option change');
//           handleGenerateVariants();
//         }
//       }
//     });
    
//     // Cleanup subscription on component unmount
//     return () => subscription.unsubscribe();
//   }, [appendOption, form, isLoading, handleGenerateVariants]);

//   // Fetch categories on component mount
//   useEffect(() => {
//     async function loadCategories() {
//       try {
//         const categoriesData = await fetchCategories({ id });
  
//         console.log("Raw API Response:", JSON.stringify(categoriesData, null, 2));
  
//         if (categoriesData && Array.isArray(categoriesData.categories)) {
//           setCategories(categoriesData.categories);
//         } else if (Array.isArray(categoriesData)) {
//           setCategories(categoriesData);
//         } else {
//           console.warn("Unexpected response format:", categoriesData);
//         }
//       } catch (error) {
//         console.error("Error loading categories:", error);
//       }
//     }
  
//     loadCategories();
//   }, []);
  

//   // Fetch the product details when the component mounts.
//   useEffect(() => {
//     async function loadProduct() {
//       setIsLoading(true);
//       setError(null);
      
//       try {
//         // Fetch product data
//         const product = await fetchProduct({id});
        
//         // Defensive check to ensure we have a valid product
//         if (!product) {
//           throw new Error('Product data is empty or invalid');
//         }

//         console.log('Loaded product data:', product);
        
//         // Save original data for reference
//         setOriginalData({
//           options: product.options,
//           variants: product.variants
//         });

//         // Prepare default options if none exist
//         let transformedOptions = [];
        
//         if (product.options && product.options.length > 0) {
//           // Transform options to match component format with array-based values
//           transformedOptions = product.options.map((opt) => {
//             // Get all values for this option
//             const optionValues = opt.values?.map(value => value.value) || [];
            
//             return {
//               id: opt.id, // Keep the original option ID
//               title: opt.title,
//               optionValues: optionValues
//             };
//           });
//         } else {
//           // Create default Color and Size options if none exist
//           transformedOptions = [
//             {
//               id: generateUUID(),
//               title: 'Color',
//               optionValues: []
//             },
//             {
//               id: generateUUID(),
//               title: 'Size',
//               optionValues: []
//             }
//           ];
//         }
        
//         // Add at least one empty option if none exist
//         if (transformedOptions.length === 0) {
//           transformedOptions.push({
//             id: generateUUID(),
//             title: '',
//             optionValues: []
//           });
//         }
        
//         // Transform variants to match component format
//         const transformedVariants = [];
        
//         if (product.variants && product.variants.length > 0) {
//           for (const variant of product.variants) {
//             // Extract price if available - handle potential undefined structures
//             let price = 0;
//             if (variant.prices && variant.prices.length > 0) {
//               price = variant.prices[0].amount;
//             }
            
//             // Extract option values from the variant
//             let optionValues = [];
            
//             // First try to get options from the variant's options array
//             if (variant.options && variant.options.length > 0) {
//               optionValues = variant.options.map(optVal => ({
//                 optionId: optVal.option?.id,
//                 optionName: optVal.option?.title || '',
//                 value: optVal.value
//               }));
//             } 
//             // If no options, try to parse from the title
//             else if (variant.title) {
//               // Try to extract color and size info from the title
//               optionValues = extractVariantOptions(variant.title, transformedOptions);
//             }
            
//             // If still no options but we have default ones, create placeholder values
//             if (optionValues.length === 0 && transformedOptions.length > 0) {
//               const variantWords = variant.title.split(' ');
              
//               // Try to add a placeholder for each option
//               transformedOptions.forEach((opt, idx) => {
//                 const placeholderValue = idx < variantWords.length ? 
//                   variantWords[idx] : `Option ${idx + 1}`;
                
//                 optionValues.push({
//                   optionId: opt.id,
//                   optionName: opt.title,
//                   value: placeholderValue
//                 });
                
//                 // Add this value to the option's values if not already there
//                 if (!opt.optionValues.includes(placeholderValue)) {
//                   opt.optionValues.push(placeholderValue);
//                 }
//               });
//             }
            
//             console.log(`Variant ${variant.title} option values:`, optionValues);
            
//             transformedVariants.push({
//               id: variant.id,
//               title: variant.title,
//               price: price,
//               compareAtPrice: variant.compare_at_price || 0,
//               stock: variant.inventory_quantity || 0,
//               sku: variant.sku || `SKU-${variant.title.replace(/[^A-Z0-9]/ig, '-')}`,
//               allowBackorder: variant.allow_backorder || false,
//               manageInventory: variant.manage_inventory || true,
//               optionValues
//             });
//           }
//         }
        
//         // Transform images
//         const transformedMedia = product.images?.map((img) => ({
//           file: null,
//           url: img.url,
//           rank: img.rank || 0,
//           id: img.id // Keep the image ID
//         })) || [];
        
//         // Prepare default new option values
//         const initialOptionValues = {};
//         transformedOptions.forEach((_, index) => {
//           initialOptionValues[index] = '';
//         });
//         setNewOptionValues(initialOptionValues);
        
//         // Reset form with fetched values
//         form.reset({
//           title: product.title || '',
//           handle: product.handle || '',
//           description: product.description || '',
//           status: product.status || 'published',
//           thumbnail: product.thumbnail || '',
//           discountable: product.discountable ?? true,
//           category: product.category?.id || '',
//           options: transformedOptions,
//           variants: transformedVariants,
//           weight: product.weight?.toString() || '',
//           length: product.length?.toString() || '',
//           width: product.width?.toString() || '',
//           height: product.height?.toString() || '',
//           material: product.material || '',
//           origin_country: product.origin_country || '',
//         });
        
//         // Set media items
//         setMediaItems(transformedMedia);
        
//         setIsLoading(false);
//       } catch (error) {
//         console.error('Error loading product:', error);
//         setError('Failed to load product. Please try again.');
//         setIsLoading(false);
//       }
//     }

//     if (id) {
//       loadProduct();
//     }
//   }, [id, form]);

//   // File selection handler (for adding new images).
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const newMedia = Array.from(e.target.files).map((file, index) => ({
//         file,
//         url: URL.createObjectURL(file),
//         rank: mediaItems.length + index, // Assign new ranks
//         isNew: true
//       }));
//       setMediaItems((prev) => [...prev, ...newMedia]);
//     }
//   };

//   // Trigger the hidden file input when clicking the dropzone.
//   const handleDropzoneClick = () => {
//     fileInputRef.current?.click();
//   };

//   // Remove an image and revoke its object URL if necessary.
//   const handleRemoveImage = (index: number) => {
//     setMediaItems((prev) => {
//       const removed = prev[index];
//       if (removed.file) {
//         URL.revokeObjectURL(removed.url);
//       }
//       // Return filtered array with reordered ranks
//       const filtered = prev.filter((_, i) => i !== index);
//       return filtered.map((item, i) => ({ ...item, rank: i }));
//     });
//   };

//   // Move image up in order
//   const handleMoveImageUp = (index: number) => {
//     if (index === 0) return; // Already at the top
    
//     setMediaItems((prev) => {
//       const newMedia = [...prev];
//       const temp = newMedia[index - 1];
//       newMedia[index - 1] = { ...newMedia[index], rank: index - 1 };
//       newMedia[index] = { ...temp, rank: index };
//       return newMedia;
//     });
//   };

//   // Move image down in order
//   const handleMoveImageDown = (index: number) => {
//     if (index === mediaItems.length - 1) return; // Already at the bottom
    
//     setMediaItems((prev) => {
//       const newMedia = [...prev];
//       const temp = newMedia[index + 1];
//       newMedia[index + 1] = { ...newMedia[index], rank: index + 1 };
//       newMedia[index] = { ...temp, rank: index };
//       return newMedia;
//     });
//   };

//   // Upload a single file to the server
//   const uploadFile = async (file: File) => {
//     try {
//       const formData = new FormData();
//       formData.append('file', file);
      
//       const response = await uploadProductImage({
//         productId: id,
//         formData
//       });
      
//       if (response && response.id) {
//         return response.url || response.originalPath || response.path;
//       }
      
//       throw new Error('Failed to get image URL from response');
//     } catch (error) {
//       console.error('Error uploading file:', error);
//       throw error;
//     }
//   };

//   // Update the submission handler to match the schema
//   const onSubmit = async (values: ProductFormValues) => {
//     // Validate required fields
//     if (!values.title.trim()) {
//       setError('Product title is required');
//       return;
//     }
    
//     setIsSubmitting(true);
//     setError(null);
    
//     try {
//       console.log('Form values for submission:', values);
      
//       // Step 1: Upload any new image files first
//       const updatedMedia = [...mediaItems];
      
//       // Find items with file property (newly added files)
//       const newFileItems = mediaItems.filter(item => item.file || item.isNew);
      
//       if (newFileItems.length > 0) {
//         try {
//           // Upload each file and update the URL
//           for (const [index, item] of mediaItems.entries()) {
//             if (item.file) {
//               // Upload file to server
//               const uploadedUrl = await uploadFile(item.file);
              
//               // Update the media item with the new URL from server
//               updatedMedia[index] = {
//                 ...updatedMedia[index],
//                 url: uploadedUrl,
//                 file: null, // Clear the file reference
//                 isNew: false
//               };
//             }
//           }
//         } catch (uploadError) {
//           console.error('Error uploading images:', uploadError);
//           setError('Failed to upload images. Please try again.');
//           setIsSubmitting(false);
//           return;
//         }
//       }
      
//       // Prepare images in the API format - ensure it's an array
//       const images = updatedMedia.map((item) => ({
//         id: item.id, // Include image id if it exists
//         url: item.url,
//         rank: item.rank,
//       }));
      
//       // Filter and transform options to API format (remove empty ones)
//       const validOptions = values.options.filter(opt => 
//         opt.title && 
//         Array.isArray(opt.optionValues) && 
//         opt.optionValues.length > 0
//       );
      
//       const options = validOptions.map((opt) => {
//         return {
//           id: opt.id || generateUUID(),
//           title: opt.title,
//           values: opt.optionValues.map(value => ({
//             value,
//           })),
//         };
//       });

//       console.log('Formatted options:', options);
      
//       // Validate variants - make sure each has at least a title and SKU
//       const invalidVariants = values.variants.filter(v => !v.title || !v.sku);
//       if (invalidVariants.length > 0) {
//         setError('All variants must have a title and SKU');
//         setIsSubmitting(false);
//         return;
//       }
      
//       // Transform variants to API format
//       const variants = values.variants.map((variant) => {
//         // Prepare the option values properly, using references to option IDs when possible
//         const variantOptions = variant.optionValues.map(optVal => {
//           // Try to find the corresponding option to get its ID
//           const matchingOption = validOptions.find(opt => opt.title === optVal.optionName);
          
//           return {
//             value: optVal.value,
//             option: {
//               id: optVal.optionId || matchingOption?.id,
//               title: optVal.optionName
//             }
//           };
//         });
        
//         // Find matching variant in original data if exists
//         const originalVariant = originalData.variants?.find(v => v.id === variant.id);
        
//         // Format price as number to avoid string issues
//         const price = typeof variant.price === 'string' 
//           ? parseFloat(variant.price) 
//           : (variant.price || 0);
          
//         // Format stock as integer
//         const stock = typeof variant.stock === 'string'
//           ? parseInt(variant.stock)
//           : (variant.stock || 0);
        
//         // Build the variant object, preserving original prices if they exist
//         const variantObj: any = {
//           id: variant.id || generateUUID(),
//           title: variant.title,
//           sku: variant.sku || '',
//           inventory_quantity: stock,
//           allow_backorder: Boolean(variant.allowBackorder),
//           manage_inventory: Boolean(variant.manageInventory),
//           options: variantOptions
//         };
        
//         // Handle prices properly - either use original prices or create new ones
//         if (originalVariant && originalVariant.prices && originalVariant.prices.length > 0) {
//           // Update existing prices
//           variantObj.prices = originalVariant.prices.map((price: any) => ({
//             id: price.id,
//             amount: price,
//             currency_code: price.currency_code || 'usd'
//           }));
//         } else {
//           // Create new price
//           variantObj.prices = [{
//             amount: price,
//             currency_code: 'usd'
//           }]; 
//         }
        
//         // Include compareAtPrice if it exists and is valid
//         if (variant.compareAtPrice !== undefined && !isNaN(variant.compareAtPrice)) {
//           variantObj.compare_at_price = typeof variant.compareAtPrice === 'string'
//             ? parseFloat(variant.compareAtPrice)
//             : variant.compareAtPrice;
//         }
        
//         return variantObj;
//       });

//       console.log('Formatted variants:', variants);
    
//       // Get the selected category ID
//       const categoryId = values.category || null;
      
//       // Construct the product object in API format, conforming to the schema
//       const updatedProduct = {
//         id,
//         title: values.title.trim(),
//         handle: values.handle.trim() || values.title.toLowerCase().replace(/\s+/g, '-'),
//         description: values.description.trim() || "",
//         status: values.status,
//         thumbnail: values.thumbnail || "",
//         discountable: Boolean(values.discountable),
//         // category_id: categoryId,
//         weight: values.weight ? parseInt(values.weight) || 0 : 0,
//         length: values.length ? parseInt(values.length) || 0 : 0,
//         width: values.width ? parseInt(values.width) || 0 : 0,
//         height: values.height ? parseInt(values.height) || 0 : 0,
//         material: values.material || undefined,
//         origin_country: values.origin_country || undefined,
//         // options,
//         // variants,
//         images,
//       };

//       // Debug output
//       console.log('Product data being sent to API:', JSON.stringify(updatedProduct, null, 2));
      
//       try {
//         // Send the update request
//         const result = await updateProduct({ product: updatedProduct });
//         console.log('Update result:', result);
        
//         // Navigate back to products list on success
//         navigate({ to: '/products' });
//       } catch (apiError: any) {
//         console.error('API Error updating product:', apiError);
        
//         // More detailed error handling
//         if (apiError.response) {
//           console.error('API Error response:', apiError.response);
//           console.error('Error response data:', apiError.response.data);
//           setError(`API Error: ${apiError.response.data?.message || apiError.response.data?.error || apiError.message || 'Unknown API error'}`);
//         } else if (apiError.request) {
//           setError('Network error: No response received from server. Please check your connection.');
//         } else {
//           setError(`Error: ${apiError.message || 'Unknown error occurred'}`);
//         }
//       }
//     } catch (error: any) {
//       console.error('Error preparing data for update:', error);
//       setError(`Failed to update product: ${error?.message || 'Unknown error'}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Cleanup any object URLs for newly added files when unmounting.
//   const mediaRef = useRef(mediaItems);
//   useEffect(() => {
//     mediaRef.current = mediaItems;
//   }, [mediaItems]);

//   useEffect(() => {
//     return () => {
//       mediaRef.current.forEach((item) => {
//         if (item.file) URL.revokeObjectURL(item.url);
//       });
//     };
//   }, []);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <div className="w-16 h-16 mx-auto border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
//           <p className="mt-4">Loading product...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen">
//         <div className="text-center">
//           <h2 className="mb-4 text-2xl font-bold text-red-600">Error</h2>
//           <p className="mb-6">{error}</p>
//           <Button onClick={() => navigate({ to: '/products' })}>
//             Back to Products
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="px-6 py-8">
//       {/* Header Bar */}
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-bold">Edit Product</h1>
//         <div className="space-x-2">
//           <Button variant="outline" onClick={() => navigate({ to: '/products' })}>
//             Cancel
//           </Button>
//           <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
//             {isSubmitting ? 'Saving...' : 'Save'}
//           </Button>
//         </div>
//       </div>

//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)}>
//           <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
//             {/* Left Column */}
//             <div className="space-y-8 md:col-span-2">
//               {/* Title & Description Section */}
//               <section className="p-6 bg-white border border-gray-200 rounded">
//                 <div className="mb-4">
//                   <FormField
//                     control={form.control}
//                     name="title"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Product Title</FormLabel>
//                         <FormControl>
//                           <Input {...field} placeholder="e.g. Winter Hoodie" className="w-full" />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//                 <div className="mb-4">
//                   <FormField
//                     control={form.control}
//                     name="handle"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Handle (URL Slug)</FormLabel>
//                         <FormControl>
//                           <Input {...field} placeholder="e.g. winter-hoodie" className="w-full" />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//                 <div>
//                   <FormField
//                     control={form.control}
//                     name="description"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Description</FormLabel>
//                         <FormControl>
//                           <textarea
//                             {...field}
//                             rows={6}
//                             placeholder="Write product details..."
//                             className="w-full p-2 border rounded-md"
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               </section>

//               {/* Media Section */}
//               <section className="p-6 bg-white border border-gray-200 rounded">
//                 <h2 className="mb-4 text-lg font-semibold">Media</h2>
//                 <div className="mb-4">
//                   <FormField
//                     control={form.control}
//                     name="thumbnail"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Thumbnail URL</FormLabel>
//                         <FormControl>
//                           <Input {...field} placeholder="https://example.com/image.jpg" className="w-full" />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//                 <h3 className="mb-2 font-medium">Product Images</h3>
                
//                 <Tabs defaultValue="upload" onValueChange={setActiveImageTab} value={activeImageTab}>
//                   <TabsList className="mb-4">
//                     <TabsTrigger value="upload">
//                       <IconUpload size={16} className="mr-2" />
//                       Upload Images
//                     </TabsTrigger>
//                     <TabsTrigger value="url">
//                       <IconLink size={16} className="mr-2" />
//                       Add from URL
//                     </TabsTrigger>
//                   </TabsList>
                  
//                   <TabsContent value="upload">
//                     <div
//                       onClick={handleDropzoneClick}
//                       className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400"
//                     >
//                       <svg
//                         className="w-10 h-10 text-gray-400"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 48 48"
//                         aria-hidden="true"
//                       >
//                         <path
//                           d="M14 22h20M24 12v20"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         />
//                       </svg>
//                       <span className="mt-2 text-sm text-gray-600">
//                         Drag and drop images or click to upload
//                       </span>
//                     </div>
//                     <input
//                       type="file"
//                       multiple
//                       accept="image/*"
//                       onChange={handleFileChange}
//                       ref={fileInputRef}
//                       className="hidden"
//                     />
//                   </TabsContent>
                  
//                   <TabsContent value="url">
//                     <div className="flex items-center space-x-2">
//                       <Input
//                         type="url"
//                         value={newImageUrl}
//                         onChange={(e) => setNewImageUrl(e.target.value)}
//                         placeholder="https://example.com/image.jpg"
//                         className="flex-1"
//                         onKeyDown={(e) => {
//                           if (e.key === 'Enter') {
//                             e.preventDefault();
//                             handleAddImageUrl();
//                           }
//                         }}
//                       />
//                       <Button onClick={handleAddImageUrl} type="button">Add Image</Button>
//                     </div>
//                     <p className="mt-2 text-xs text-gray-500">
//                       Enter the URL of an image to add it to the product gallery.
//                     </p>
//                   </TabsContent>
//                 </Tabs>
                
//                 {mediaItems.length > 0 && (
//                   <div className="mt-4">
//                     <h4 className="mb-2">Current Images ({mediaItems.length})</h4>
//                     <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
//                       {mediaItems
//                         .sort((a, b) => a.rank - b.rank)
//                         .map((item, index) => (
//                           <div
//                             key={index}
//                             className="relative flex flex-col overflow-hidden bg-gray-100 border rounded"
//                           >
//                             <div className="flex items-center justify-center h-32 overflow-hidden">
//                               <img
//                                 src={item.url}
//                                 alt={`Preview ${index}`}
//                                 className="object-cover w-full h-full"
//                               />
//                             </div>
//                             <div className="flex items-center justify-between p-2">
//                               <TooltipProvider>
//                                 <Tooltip>
//                                   <TooltipTrigger asChild>
//                                     <div className="text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px]">
//                                       {item.file ? item.file.name : item.url.split('/').pop() || `Image ${index + 1}`}
//                                     </div>
//                                   </TooltipTrigger>
//                                   <TooltipContent>
//                                     {item.isNew ? 'Will be saved on submit' : 'Saved in Medusa'}
//                                   </TooltipContent>
//                                 </Tooltip>
//                               </TooltipProvider>
//                               <div className="flex space-x-1">
//                                 <button
//                                   type="button"
//                                   onClick={() => handleMoveImageUp(index)}
//                                   disabled={index === 0}
//                                   className="p-1 text-xs bg-gray-200 rounded disabled:opacity-50"
//                                 >
//                                   ↑
//                                 </button>
//                                 <button
//                                   type="button"
//                                   onClick={() => handleMoveImageDown(index)}
//                                   disabled={index === mediaItems.length - 1}
//                                   className="p-1 text-xs bg-gray-200 rounded disabled:opacity-50"
//                                 >
//                                   ↓
//                                 </button>
//                                 <button
//                                   type="button"
//                                   onClick={() => handleRemoveImage(index)}
//                                   className="p-1 text-xs text-white bg-red-500 rounded"
//                                 >
//                                   ×
//                                 </button>
//                               </div>
//                             </div>
//                             {item.isNew && (
//                               <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 py-0.5">
//                                 New
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                     </div>
//                   </div>
//                 )}
//               </section>

//               {/* Variants Section - Improved Shopify-like style */}
//               <section className="p-6 bg-white border border-gray-200 rounded">
//                 <h2 className="mb-4 text-lg font-semibold">Options & Variants</h2>
                
//                 {/* Options Section */}
//                 <div className="mb-6">
//                   <h3 className="mb-3 font-medium">Options</h3>
//                   <div className="p-4 mb-4 rounded-md bg-gray-50">
//                     <p className="text-sm text-gray-600">
//                       Add options like size or color to create variants of this product. Customers will choose from these options during checkout.
//                     </p>
//                   </div>
                  
//                   {optionFields.map((opt, optionIndex) => (
//                     <div key={opt.id} className="p-4 mb-6 border rounded-md">
//                       <div className="flex items-center justify-between mb-4">
//                         <FormField
//                           control={form.control}
//                           name={`options.${optionIndex}.title` as const}
//                           render={({ field }) => (
//                             <FormItem className="w-full">
//                               <FormLabel>
//                                 Option {optionIndex + 1} name
//                               </FormLabel>
//                               <FormControl>
//                                 <Input
//                                   {...field}
//                                   placeholder={
//                                     optionIndex === 0 ? "e.g. Size" : 
//                                     optionIndex === 1 ? "e.g. Color" : "e.g. Material"
//                                   }
//                                 />
//                               </FormControl>
//                             </FormItem>
//                           )}
//                         />
                        
//                         {/* Don't allow removing the first option or if only one exists */}
//                         {(optionIndex > 0 || optionFields.length > 1) && (
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             className="mt-6 ml-2"
//                             onClick={() => removeOption(optionIndex)}
//                           >
//                             <IconX size={18} />
//                           </Button>
//                         )}
//                       </div>
                      
//                       {/* Option Values with Pill Style Display */}
//                       <div className="mt-4">
//                         <FormLabel>
//                           Option values
//                         </FormLabel>
                        
//                         {/* Display existing values as pills */}
//                         <div className="flex flex-wrap gap-2 mt-2 mb-3">
//                           {Array.isArray(form.watch(`options.${optionIndex}.optionValues`)) ? 
//                             form.watch(`options.${optionIndex}.optionValues`, []).map((value, valueIndex) => (
//                               <span 
//                                 key={valueIndex} 
//                                 className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-full"
//                               >
//                                 {value}
//                                 <button
//                                   type="button"
//                                   onClick={() => handleRemoveOptionValue(optionIndex, valueIndex)}
//                                   className="ml-1 text-gray-500 hover:text-gray-700"
//                                 >
//                                   <IconX size={14} />
//                                 </button>
//                               </span>
//                             )) : <span className="text-sm text-gray-500">No values added yet</span>
//                           }
//                         </div>
                        
//                         {/* Add new value input */}
//                         <div className="flex gap-2">
                          
//                           <Input 
//                             value={newOptionValues[optionIndex] || ''}
//                             onChange={(e) => handleNewOptionValueChange(optionIndex, e.target.value)}
//                             placeholder="Enter a new value..."
//                             className="flex-1"
//                             onKeyDown={(e) => {
//                               if (e.key === 'Enter') {
//                                 e.preventDefault();
//                                 handleAddOptionValue(optionIndex);
//                               }
//                             }}
//                           />
//                           <Button 
//                             type="button" 
//                             size="sm"
//                             onClick={() => handleAddOptionValue(optionIndex)}
//                           >
//                             Add
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
                  
//                   {/* Add another option button (only if fewer than 3 options) */}
//                   {optionFields.length < 3 && (
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => {
//                         const newOptionIndex = optionFields.length;
//                         appendOption({ title: '', optionValues: [] });
//                         setNewOptionValues(prev => ({
//                           ...prev,
//                           [newOptionIndex]: ''
//                         }));
//                       }}
//                       className="mt-2"
//                     >
//                       <IconCirclePlus className="mr-1" /> 
//                       Add another option
//                     </Button>
//                   )}
//                 </div>
                
//                 {/* Variants Section with Bulk Editing */}
//                 {variantFields.length > 0 && (
//                   <div>
//                     <div className="flex items-center justify-between mb-3">
//                       <h3 className="font-medium">Variants ({variantFields.length})</h3>
//                       <Button 
//                         type="button" 
//                         variant="outline" 
//                         onClick={handleGenerateVariants}
//                         size="sm"
//                       >
//                         Regenerate variants
//                       </Button>
//                     </div>
                    
//                     {/* Bulk Edit Controls */}
//                     <Card className="mb-4">
//                       <CardHeader className="pb-2">
//                         <CardTitle className="text-base">Bulk Edit</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         <div className="flex flex-col gap-4">
//                           <div className="flex items-center">
//                             <Switch 
//                               checked={bulkEditMode} 
//                               onCheckedChange={setBulkEditMode} 
//                               id="bulk-edit-mode"
//                             />
//                             <label htmlFor="bulk-edit-mode" className="ml-2 text-sm">
//                               {bulkEditMode ? 'Exit bulk edit mode' : 'Enable bulk edit mode'}
//                             </label>
//                           </div>
                          
//                           {bulkEditMode && (
//                             <>
//                               <div className="flex items-center mb-2">
//                                 <Switch 
//                                   checked={selectedVariants.length === variantFields.length}
//                                   onCheckedChange={handleSelectAllVariants}
//                                   id="select-all-variants" 
//                                 />
//                                 <label htmlFor="select-all-variants" className="ml-2 text-sm">
//                                   Select all variants ({selectedVariants.length}/{variantFields.length})
//                                 </label>
//                               </div>
                              
//                               {selectedVariants.length > 0 && (
//                                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                                   <div>
//                                     <label className="block mb-1 text-sm">Set price for all selected</label>
//                                     <div className="flex gap-2">
//                                       <Input
//                                         type="number"
//                                         min="0"
//                                         step="0.01"
//                                         value={bulkPrice}
//                                         onChange={(e) => setBulkPrice(e.target.value)}
//                                         placeholder="0.00"
//                                       />
//                                       <Button
//                                         type="button"
//                                         size="sm"
//                                         onClick={() => handleBulkEdit('price', parseFloat(bulkPrice) || 0)}
//                                         disabled={!bulkPrice}
//                                       >
//                                         Apply
//                                       </Button>
//                                     </div>
//                                   </div>
//                                   <div>
//                                     <label className="block mb-1 text-sm">Set stock for all selected</label>
//                                     <div className="flex gap-2">
//                                       <Input
//                                         type="number"
//                                         min="0"
//                                         step="1"
//                                         value={bulkStock}
//                                         onChange={(e) => setBulkStock(e.target.value)}
//                                         placeholder="0"
//                                       />
//                                       <Button
//                                         type="button"
//                                         size="sm"
//                                         onClick={() => handleBulkEdit('stock', parseInt(bulkStock) || 0)}
//                                         disabled={!bulkStock}
//                                       >
//                                         Apply
//                                       </Button>
//                                     </div>
//                                   </div>
//                                 </div>
//                               )}
//                             </>
//                           )}
//                         </div>
//                       </CardContent>
//                     </Card>
                    
//                     {/* Variants Table */}
//                     <div className="overflow-x-auto">
//                       <table className="w-full mt-4 border-collapse">
//                         <thead>
//                           <tr className="bg-gray-50">
//                             {bulkEditMode && (
//                               <th className="p-2 text-left border">
//                                 <span className="sr-only">Select</span>
//                               </th>
//                             )}
//                             <th className="p-2 text-left border">Variant</th>
//                             <th className="p-2 text-left border">SKU</th>
//                             <th className="p-2 text-left border">Price</th>
//                             <th className="p-2 text-left border">Stock</th>
//                             <th className="p-2 text-center border">Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {variantFields.map((vf, index) => (
//                             <tr key={vf.id} className={bulkEditMode && selectedVariants.includes(vf.id) ? "bg-blue-50" : ""}>
//                               {bulkEditMode && (
//                                 <td className="p-2 text-center border">
//                                   <input 
//                                     type="checkbox" 
//                                     checked={selectedVariants.includes(vf.id)} 
//                                     onChange={() => handleToggleVariantSelection(vf.id)}
//                                     className="w-4 h-4"
//                                   />
//                                 </td>
//                               )}
//                               <td className="p-2 border">
//                                 <div className="flex flex-col">
//                                   <span className="font-medium">{form.watch(`variants.${index}.title`)}</span>
//                                   <div className="flex flex-wrap gap-1 mt-1">
//                                     {form.watch(`variants.${index}.optionValues`, []).map((optVal, optIndex) => (
//                                       <Badge 
//                                         key={optIndex} 
//                                         variant="outline" 
//                                         className="text-xs"
//                                       >
//                                         {optVal.optionName}: {optVal.value}
//                                       </Badge>
//                                     ))}
//                                   </div>
//                                 </div>
//                               </td>
//                               <td className="p-2 border">
//                                 <Input
//                                   {...form.register(`variants.${index}.sku`)}
//                                   onChange={(e) => handleVariantFieldChange(index, 'sku', e.target.value)}
//                                   className="w-full"
//                                 />
//                               </td>
//                               <td className="p-2 border">
//                                 <Input
//                                   type="number"
//                                   min="0"
//                                   step="0.01"
//                                   value={form.watch(`variants.${index}.price`) || ''}
//                                   onChange={(e) => {
//                                     const value = e.target.value === '' ? '' : parseFloat(e.target.value);
//                                     handleVariantFieldChange(index, 'price', value === '' ? 0 : value);
//                                   }}
//                                   className="w-full"
//                                 />
//                               </td>
//                               <td className="p-2 border">
//                                 <Input
//                                   type="number"
//                                   min="0"
//                                   step="1"
//                                   value={form.watch(`variants.${index}.stock`) || ''}
//                                   onChange={(e) => {
//                                     const value = e.target.value === '' ? '' : parseInt(e.target.value);
//                                     handleVariantFieldChange(index, 'stock', value === '' ? 0 : value);
//                                   }}
//                                   className="w-full"
//                                 />
//                               </td>
//                               <td className="p-2 text-center border">
//                                 <div className="flex justify-center space-x-1">
//                                   <TooltipProvider>
//                                     <Tooltip>
//                                       <TooltipTrigger asChild>
//                                         <Button 
//                                           variant="ghost" 
//                                           size="sm"
//                                           onClick={() => handleDuplicateVariant(index)}
//                                         >
//                                           <IconCopy size={16} />
//                                         </Button>
//                                       </TooltipTrigger>
//                                       <TooltipContent>Duplicate variant</TooltipContent>
//                                     </Tooltip>
//                                   </TooltipProvider>
                                  
//                                   <TooltipProvider>
//                                     <Tooltip>
//                                       <TooltipTrigger asChild>
//                                         <Button 
//                                           variant="ghost" 
//                                           size="sm" 
//                                           onClick={() => removeVariant(index)}
//                                         >
//                                           <IconX size={16} />
//                                         </Button>
//                                       </TooltipTrigger>
//                                       <TooltipContent>Remove variant</TooltipContent>
//                                     </Tooltip>
//                                   </TooltipProvider>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 )}
//               </section>
//             </div>

//             {/* Right Column */}
//             <div className="space-y-8">
//               <section className="p-6 bg-white border border-gray-200 rounded">
//                 <h2 className="mb-4 text-lg font-semibold">Status</h2>
//                 <FormField
//                   control={form.control}
//                   name="status"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Product Status</FormLabel>
//                       <Select onValueChange={field.onChange} value={field.value}>
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select status" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="published">Published</SelectItem>
//                           <SelectItem value="draft">Draft</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <div className="mt-4">
//                   <FormField
//                     control={form.control}
//                     name="discountable"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Discountable</FormLabel>
//                         <Select 
//                           onValueChange={(value) => field.onChange(value === 'true')} 
//                           value={field.value ? 'true' : 'false'}
//                         >
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             <SelectItem value="true">Yes</SelectItem>
//                             <SelectItem value="false">No</SelectItem>
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <FormField
//                     control={form.control}
//                     name="category"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Category</FormLabel>
//                         <Select onValueChange={field.onChange} value={field.value}>
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select category" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                           {categories.length > 0 ? (
//                                 categories.map(category => (
//                                 <SelectItem key={category.id} value={category.name}>
//                                   {category.name}
//                                 </SelectItem>
//                                 ))
//                                 ) : (
//                                 <SelectItem value="no-categories" disabled>
//                                 No categories available
//                                 </SelectItem>
//                                 )}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               </section>
              
//               <section className="p-6 bg-white border border-gray-200 rounded">
//                 <h2 className="mb-4 text-lg font-semibold">Physical Details</h2>
//                 <div className="space-y-4">
//                   <FormField
//                     control={form.control}
//                     name="weight"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Weight (g)</FormLabel>
//                         <FormControl>
//                           <Input {...field} type="number" min="0" placeholder="e.g. 400" />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="length"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Length (cm)</FormLabel>
//                         <FormControl>
//                           <Input {...field} type="number" min="0" placeholder="e.g. 30" />
//                         </FormControl>
//                       </FormItem>

//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="width"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Width (cm)</FormLabel>
//                         <FormControl>
//                           <Input {...field} type="number" min="0" placeholder="e.g. 20" />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="height"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Height (cm)</FormLabel>
//                         <FormControl>
//                           <Input {...field} type="number" min="0" placeholder="e.g. 5" />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               </section>
              
//               <section className="p-6 bg-white border border-gray-200 rounded">
//                 <h2 className="mb-4 text-lg font-semibold">Additional Info</h2>
//                 <div className="space-y-4">
//                   <FormField
//                     control={form.control}
//                     name="material"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Material</FormLabel>
//                         <FormControl>
//                           <Input {...field} placeholder="e.g. Cotton, Polyester" />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="origin_country"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Country of Origin</FormLabel>
//                         <FormControl>
//                           <Input {...field} placeholder="e.g. US, China" />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               </section>
//             </div>
//           </div>
//           <div className="flex justify-end mt-8 space-x-2">
//             <Button variant="outline" onClick={() => navigate({ to: '/products' })}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={isSubmitting}>
//               {isSubmitting ? 'Saving...' : 'Save'}
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </div>
//   );
// };

// export default EditProduct;

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
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

import { ProductSchema, ApiOption, ApiVariant } from '../data/schema';
import { fetchProduct, updateProduct, uploadProductImage, fetchCategories } from '../context/fetchApi';

// Define interfaces for our data structures
interface OptionValue {
  optionId?: string;
  optionName: string;
  value: string;
}

interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku: string;
  allowBackorder: boolean;
  manageInventory: boolean;
  optionValues: OptionValue[];
}

interface ProductOption {
  id?: string;
  title: string;
  optionValues: string[];
}

interface MediaItem {
  file: File | null;
  url: string;
  rank: number;
  id?: string;
  isNew?: boolean;
}

interface Category {
  id: string;
  name: string;
  handle: string;
}

/** Utility: Generate a random UUID. */
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Utility: Extract color and size from variant title if not available in options
 */
const extractVariantOptions = (title: string, availableOptions: Array<{id: string; title: string}>) => {
  // Common color values to check in the title
  const commonColors = [
    'black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 
    'pink', 'brown', 'gray', 'grey', 'navy', 'teal', 'turquoise', 'silver',
    'gold', 'beige', 'maroon', 'olive'
  ];
  
  // Common size values to check in the title
  const commonSizes = [
    'xs', 'small', 's', 'medium', 'm', 'large', 'l', 'xl', 'xxl', '2xl', 'xxxl', '3xl',
    'one size', 'onesize', 'one-size', 'os'
  ];
  
  const result: OptionValue[] = [];
  const lowerTitle = title.toLowerCase();
  const words = lowerTitle.split(/\s+/);
  
  // Find color option
  const colorOption = availableOptions.find(opt => 
    opt.title.toLowerCase() === 'color' || opt.title.toLowerCase().includes('color')
  );
  
  if (colorOption) {
    const foundColor = commonColors.find(color => words.includes(color));
    if (foundColor) {
      // Capitalize first letter for display
      const formattedColor = foundColor.charAt(0).toUpperCase() + foundColor.slice(1);
      result.push({
        optionId: colorOption.id,
        optionName: colorOption.title,
        value: formattedColor
      });
    }
  }
  
  // Find size option
  const sizeOption = availableOptions.find(opt => 
    opt.title.toLowerCase() === 'size' || opt.title.toLowerCase().includes('size')
  );
  
  if (sizeOption) {
    const foundSize = commonSizes.find(size => words.includes(size));
    if (foundSize) {
      // Format size appropriately
      let formattedSize = foundSize.toUpperCase();
      if (foundSize === 'small') formattedSize = 'Small';
      if (foundSize === 'medium') formattedSize = 'Medium';
      if (foundSize === 'large') formattedSize = 'Large';
      
      result.push({
        optionId: sizeOption.id,
        optionName: sizeOption.title,
        value: formattedSize
      });
    }
  }
  
  return result;
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
  options: ProductOption[];
  variants: ProductVariant[];
  weight: string;
  length: string;
  width: string;
  height: string;
  material?: string;
  origin_country?: string;
};

const EditProduct = () => {
  const { id } = useParams({ from: "/_authenticated/products/$id" });
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageTab, setActiveImageTab] = useState("upload");
  const [newImageUrl, setNewImageUrl] = useState("");
  
  // For managing the new option value being added for each option
  const [newOptionValues, setNewOptionValues] = useState<Record<number, string>>({});

  // For images, we store objects with a file (if newly added) and URL and rank.
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  // Store categories from API
  const [categories, setCategories] = useState<Category[]>([]);

  // For bulk editing variants
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  // Ref for the hidden file input for drag‑and‑drop.
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Keep track of the original options/variants for reconciliation
  const [originalData, setOriginalData] = useState<{
    options?: ApiOption[];
    variants?: ApiVariant[];
  }>({});

  // Initialize the form with default values based on the schema
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      title: '',
      handle: '',
      description: '',
      status: 'published',
      thumbnail: '',
      discountable: true,
      category: '',
      options: [],
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
        
        // Only regenerate variants if we have a meaningful change to options
        // This prevents unnecessary regeneration during initial form setup
        if (isLoading) return;
        
        // If the change is significant, regenerate the variants
        if (type === 'change') {
          console.log('Regenerating variants due to option change');
          handleGenerateVariants();
        }
      }
    });
    
    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, [appendOption, form, isLoading, handleGenerateVariants]);

  // Fetch categories on component mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const categoriesData = await fetchCategories({ id });
  
        console.log("Raw API Response:", JSON.stringify(categoriesData, null, 2));
  
        if (categoriesData && Array.isArray(categoriesData.categories)) {
          setCategories(categoriesData.categories);
        } else if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else {
          console.warn("Unexpected response format:", categoriesData);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    }
  
    loadCategories();
  }, [id]);
  

  // Fetch the product details when the component mounts.
  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch product data
        const product = await fetchProduct({id});
        
        // Defensive check to ensure we have a valid product
        if (!product) {
          throw new Error('Product data is empty or invalid');
        }

        console.log('Loaded product data:', product);
        
        // Save original data for reference
        setOriginalData({
          options: product.options,
          variants: product.variants
        });

        // Prepare default options if none exist
        let transformedOptions: ProductOption[] = [];
        
        if (product.options && product.options.length > 0) {
          // Transform options to match component format with array-based values
          transformedOptions = product.options.map((opt) => {
            // Get all values for this option
            const optionValues = opt.values?.map(value => value.value) || [];
            
            return {
              id: opt.id, // Keep the original option ID
              title: opt.title,
              optionValues: optionValues
            };
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
        const transformedVariants: ProductVariant[] = [];
        
        if (product.variants && product.variants.length > 0) {
          for (const variant of product.variants) {
            // Extract price if available - handle potential undefined structures
            let price = 0;
            if (variant.prices && variant.prices.length > 0) {
              price = variant.prices[0].amount;
            }
            
            // Extract option values from the variant
            let optionValues: OptionValue[] = [];
            
            // First try to get options from the variant's options array
            if (variant.options && variant.options.length > 0) {
              optionValues = variant.options.map(optVal => ({
                optionId: optVal.option?.id,
                optionName: optVal.option?.title || '',
                value: optVal.value
              }));
            } 
            // If no options, try to parse from the title
            else if (variant.title) {
              // Try to extract color and size info from the title
              optionValues = extractVariantOptions(variant.title, transformedOptions);
            }
            
            // If still no options but we have default ones, create placeholder values
            if (optionValues.length === 0 && transformedOptions.length > 0) {
              const variantWords = variant.title.split(' ');
              
              // Try to add a placeholder for each option
              transformedOptions.forEach((opt, idx) => {
                const placeholderValue = idx < variantWords.length ? 
                  variantWords[idx] : `Option ${idx + 1}`;
                
                optionValues.push({
                  optionId: opt.id,
                  optionName: opt.title,
                  value: placeholderValue
                });
                
                // Add this value to the option's values if not already there
                if (!opt.optionValues.includes(placeholderValue)) {
                  opt.optionValues.push(placeholderValue);
                }
              });
            }
            
            console.log(`Variant ${variant.title} option values:`, optionValues);
            
            transformedVariants.push({
              id: variant.id,
              title: variant.title,
              price: price,
              compareAtPrice: variant.compare_at_price || 0,
              stock: variant.inventory_quantity || 0,
              sku: variant.sku || `SKU-${variant.title.replace(/[^A-Z0-9]/ig, '-')}`,
              allowBackorder: variant.allow_backorder || false,
              manageInventory: variant.manage_inventory || true,
              optionValues
            });
          }
        }
        
        // Transform images
        const transformedMedia = product.images?.map((img: {id?: string; url: string; rank?: number}) => ({
          file: null,
          url: img.url,
          rank: img.rank || 0,
          id: img.id // Keep the image ID
        })) || [];
        
        // Prepare default new option values
        const initialOptionValues: Record<number, string> = {};
        transformedOptions.forEach((_, index) => {
          initialOptionValues[index] = '';
        });
        setNewOptionValues(initialOptionValues);
        
        // Reset form with fetched values
        form.reset({
          title: product.title || '',
          handle: product.handle || '',
          description: product.description || '',
          status: product.status || 'published',
          thumbnail: product.thumbnail || '',
          discountable: product.discountable ?? true,
          category: product.category?.id || '',
          options: transformedOptions,
          variants: transformedVariants,
          weight: product.weight?.toString() || '',
          length: product.length?.toString() || '',
          width: product.width?.toString() || '',
          height: product.height?.toString() || '',
          material: product.material || '',
          origin_country: product.origin_country || '',
        });
        
        // Set media items
        setMediaItems(transformedMedia);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading product:', error);
        setError('Failed to load product. Please try again.');
        setIsLoading(false);
      }
    }

    if (id) {
      loadProduct();
    }
  }, [id, form]);

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

  // Upload a single file to the server
  const uploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await uploadProductImage({
        productId: id,
        formData
      });
      
      if (response && response.id) {
        return response.url || response.originalPath || response.path;
      }
      
      throw new Error('Failed to get image URL from response');
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  // Update the submission handler to match the schema
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
      
      // Step 1: Upload any new image files first
      const updatedMedia = [...mediaItems];
      
      // Find items with file property (newly added files)
      const newFileItems = mediaItems.filter(item => item.file || item.isNew);
      
      if (newFileItems.length > 0) {
        try {
          // Upload each file and update the URL
          for (const [index, item] of mediaItems.entries()) {
            if (item.file) {
              // Upload file to server
              const uploadedUrl = await uploadFile(item.file);
              
              // Update the media item with the new URL from server
              updatedMedia[index] = {
                ...updatedMedia[index],
                url: uploadedUrl,
                file: null, // Clear the file reference
                isNew: false
              };
            }
          }
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          setError('Failed to upload images. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Prepare images in the API format - ensure it's an array
      const images = updatedMedia.map((item) => ({
        id: item.id, // Include image id if it exists
        url: item.url,
        rank: item.rank,
      }));
      
      // Filter and transform options to API format (remove empty ones)
      const validOptions = values.options.filter(opt => 
        opt.title && 
        Array.isArray(opt.optionValues) && 
        opt.optionValues.length > 0
      );
      
      const options = validOptions.map((opt: ProductOption) => {
        return {
          id: opt.id || generateUUID(),
          title: opt.title,
          values: opt.optionValues.map(value => ({
            value,
          })),
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
      
      // Transform variants to API format
      const variants = values.variants.map((variant) => {
        // Prepare the option values properly, using references to option IDs when possible
        const variantOptions = variant.optionValues.map(optVal => {
          // Try to find the corresponding option to get its ID
          const matchingOption = validOptions.find(opt => opt.title === optVal.optionName);
          
          return {
            value: optVal.value,
            option: {
              id: optVal.optionId || matchingOption?.id,
              title: optVal.optionName
            }
          };
        });
        
        // Find matching variant in original data if exists
        const originalVariant = originalData.variants?.find(v => v.id === variant.id);
        
        // Format price as number to avoid string issues
        const price = typeof variant.price === 'string' 
          ? parseFloat(variant.price) 
          : (variant.price || 0);
          
        // Format stock as integer
        const stock = typeof variant.stock === 'string'
          ? parseInt(variant.stock)
          : (variant.stock || 0);
        
        // Build the variant object, preserving original prices if they exist
        const variantObj: any = {
          id: variant.id || generateUUID(),
          title: variant.title,
          sku: variant.sku || '',
          inventory_quantity: stock,
          allow_backorder: Boolean(variant.allowBackorder),
          manage_inventory: Boolean(variant.manageInventory),
          options: variantOptions
        };
        
        // Handle prices properly - either use original prices or create new ones
        if (originalVariant && originalVariant.prices && originalVariant.prices.length > 0) {
          // Update existing prices
          variantObj.prices = originalVariant.prices.map((price: any) => ({
            id: price.id,
            amount: price,
            currency_code: price.currency_code || 'usd'
          }));
        } else {
          // Create new price
          variantObj.prices = [{
            amount: price,
            currency_code: 'usd'
          }]; 
        }
        
        // Include compareAtPrice if it exists and is valid
        if (variant.compareAtPrice !== undefined && !isNaN(variant.compareAtPrice)) {
          variantObj.compare_at_price = typeof variant.compareAtPrice === 'string'
            ? parseFloat(variant.compareAtPrice)
            : variant.compareAtPrice;
        }
        
        return variantObj;
      });

      console.log('Formatted variants:', variants);
    
      // Construct the product object in API format, conforming to the schema
      const updatedProduct = {
        id,
        title: values.title.trim(),
        handle: values.handle.trim() || values.title.toLowerCase().replace(/\s+/g, '-'),
        description: values.description.trim() || "",
        status: values.status,
        thumbnail: values.thumbnail || "",
        discountable: Boolean(values.discountable),
        // Add the price property to fix TypeScript error
        price: 0, // Derive a reasonable default from variants if needed
        weight: values.weight ? parseInt(values.weight) || 0 : 0,
        length: values.length ? parseInt(values.length) || 0 : 0,
        width: values.width ? parseInt(values.width) || 0 : 0,
        height: values.height ? parseInt(values.height) || 0 : 0,
        material: values.material || undefined,
        origin_country: values.origin_country || undefined,
        // options,
        // variants,
        images,
      };

      // Debug output
      console.log('Product data being sent to API:', JSON.stringify(updatedProduct, null, 2));
      
      try {
        // Send the update request
        const result = await updateProduct({ product: updatedProduct });
        console.log('Update result:', result);
        
        // Navigate back to products list on success
        navigate({ to: '/products' });
      } catch (apiError: any) {
        console.error('API Error updating product:', apiError);
        
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
      console.error('Error preparing data for update:', error);
      setError(`Failed to update product: ${error?.message || 'Unknown error'}`);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4">Loading product...</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate({ to: '/products' })}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
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
                          <Input {...field} placeholder="e.g. winter-hoodie" className="w-full" />
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
                                    {item.isNew ? 'Will be saved on submit' : 'Saved in Medusa'}
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
                            {item.isNew && (
                              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 py-0.5">
                                New
                              </div>
                            )}
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
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
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
                          <SelectContent>
                          {categories.length > 0 ? (
                                categories.map(category => (
                                <SelectItem key={category.id} value={category.name}>
                                  {category.name}
                                </SelectItem>
                                ))
                                ) : (
                                <SelectItem value="no-categories" disabled>
                                No categories available
                                </SelectItem>
                                )}
                          </SelectContent>
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
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditProduct;