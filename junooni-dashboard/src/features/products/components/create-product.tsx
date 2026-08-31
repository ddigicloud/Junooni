import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
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
import {
  createProduct,
  uploadProductImage,
  fetchCategories,
  batchUpdateInventoryLevels,
  fetchProduct,
  updateVariantImages,
  fetchCurrentVendor,
  assignProductSalesChannels,
  removeProductFromSalesChannel,
} from '../context/fetchApi';
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

// Default location ID for inventory management
const defaultLocationId = "sloc_01JKWDDGKGCQFJANXV0CVJN2QW";
const SALES_CHANNEL_MARKETPLACE = 'sc_01JKWDD6MMQ7ZQCN6ZX4RXPP5H';
const SALES_CHANNEL_OWN_STORE   = 'sc_01KMAP3HD1EVDF9FT7EHHHV8HP';

const SALES_CHANNEL_LABELS: Record<string, string> = {
  [SALES_CHANNEL_MARKETPLACE]: 'Junooni Marketplace',
  [SALES_CHANNEL_OWN_STORE]: 'My Own Store',
};

// Main Product Form Component
const ProductForm: React.FC<ProductFormProps> = ({ initialData, isEditing = false }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImageTab, setActiveImageTab] = useState<string>("upload");
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);

  // ── NEW: image & variant dirty-tracking ─────────────────────────────
  const [hasImageChanges, setHasImageChanges] = useState<boolean>(false);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [hasUnsavedVariantChanges, setHasUnsavedVariantChanges] = useState<boolean>(false);
  const [salesChannelsDirty, setSalesChannelsDirty] = useState<boolean>(false);
  // ────────────────────────────────────────────────────────────────────

  // State for storing categories from API
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // For managing the new option value being added for each option
  const [newOptionValues, setNewOptionValues] = useState<Record<number, string>>({});
  
  // For images
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});

  // For bulk editing variants
  const [bulkEditMode, setBulkEditMode] = useState<boolean>(false);
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkStock, setBulkStock] = useState<string>("");
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  // Sales channels
  const [vendorSalesChannels, setVendorSalesChannels] = useState<string[]>([]);
  const [selectedSalesChannels, setSelectedSalesChannels] = useState<string[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [vendorHasMarketplace, setVendorHasMarketplace] = useState(false);

  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for variant toggle
  const [hasVariants, setHasVariants] = useState<boolean>(
    initialData ? initialData.options.length > 0 : false
  );
  
  // Initialize the form
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
      options: [{
        id: generateUUID(),
        title: 'Size',
        optionValues: [],
        colorHexValues: {},
        imageAssociation: false
      }],
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
    },
  });

  // Field arrays
  const { fields: optionFields, append: appendOption, remove: removeOption, update: updateOption } =
    useFieldArray({ control: form.control, name: 'options' });

  const { fields: variantFields, replace: replaceVariants, remove: removeVariant, update: updateVariant } =
    useFieldArray({ control: form.control, name: 'variants' });

  const { fields: productDetailFields, append: appendProductDetail, remove: removeProductDetail } =
    useFieldArray({ control: form.control, name: 'productDetails' });

  // ── isFormDirty: gates the Save/Create button ────────────────────────
  const isFormDirty =
    form.formState.isDirty ||
    hasUnsavedVariantChanges ||
    hasImageChanges ||
    deletedImageIds.length > 0 ||
    salesChannelsDirty;
  // ────────────────────────────────────────────────────────────────────

  // ── Variant generation ───────────────────────────────────────────────
  const handleGenerateVariants = useCallback(() => {
    const currentOptions = form.getValues('options');
    const validOptions = currentOptions.filter(
      opt => opt.title && Array.isArray(opt.optionValues) && opt.optionValues.length > 0
    );

    if (validOptions.length > 0) {
      const parsedOptions = validOptions.map(opt => ({
        optionId: opt.id || generateUUID(),
        optionName: opt.title,
        optionValues: opt.optionValues,
      }));

      const currentVariants = form.getValues('variants');
      const newVariants = generateVariantsFromOptions(parsedOptions);

      const variantsWithExistingData = newVariants.map(newVariant => {
        const existingVariant = currentVariants.find(existing => {
          if (!existing.optionValues || !Array.isArray(existing.optionValues) ||
              existing.optionValues.length !== newVariant.optionValues.length) return false;
          return newVariant.optionValues.every(newOptVal =>
            existing.optionValues.some(existingOptVal =>
              existingOptVal.optionName === newOptVal.optionName &&
              existingOptVal.value === newOptVal.value
            )
          );
        });

        if (existingVariant) {
          return {
            ...existingVariant,
            title: newVariant.title,
            optionValues: newVariant.optionValues.map(newOptVal => {
              const matchingExistingOptVal = existingVariant.optionValues.find(
                ev => ev.optionName === newOptVal.optionName && ev.value === newOptVal.value
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
      setHasUnsavedVariantChanges(true);
    } else {
      replaceVariants([]);
    }
  }, [form, replaceVariants]);

  // ── Option value management ──────────────────────────────────────────
  const handleAddOptionValue = (optionIndex: number) => {
    const value = newOptionValues[optionIndex];
    if (!value || value.trim() === '') return;
    const currentOptions = form.getValues('options');
    const currentOption = currentOptions[optionIndex];
    const currentValues = Array.isArray(currentOption.optionValues) ? currentOption.optionValues : [];
    if (!currentValues.includes(value)) {
      updateOption(optionIndex, { ...currentOption, optionValues: [...currentValues, value] });
      setNewOptionValues(prev => ({ ...prev, [optionIndex]: '' }));
      handleGenerateVariants();
    }
  };

  const handleNewOptionValueChange = (optionIndex: number, value: string) => {
    setNewOptionValues(prev => ({ ...prev, [optionIndex]: value }));
  };

  // ── Variant field change ─────────────────────────────────────────────
  const handleVariantFieldChange = (variantIndex: number, field: string, value: any) => {
    form.setValue(`variants.${variantIndex}.${field}` as any, value, {
      shouldValidate: false,
      shouldDirty: true,
      shouldTouch: false
    });
    setHasUnsavedVariantChanges(true);
  };

  // ── Remove variant (NEW: with dirty tracking) ────────────────────────
  const handleRemoveVariant = (index: number) => {
    removeVariant(index);
    setHasUnsavedVariantChanges(true);
  };

  // ── Bulk editing ─────────────────────────────────────────────────────
  const handleBulkEdit = (field: string, value: any) => {
    if (!selectedVariants.length) return;
    const currentVariants = form.getValues('variants');
    selectedVariants.forEach(variantId => {
      const variantIndex = currentVariants.findIndex(v => v.id === variantId);
      if (variantIndex !== -1) handleVariantFieldChange(variantIndex, field, value);
    });
    if (field === 'price') setBulkPrice('');
    if (field === 'stock') setBulkStock('');
  };

  const handleSelectAllVariants = (checked: boolean) => {
    setSelectedVariants(checked ? form.getValues('variants').map(v => v.id) : []);
  };

  const handleToggleVariantSelection = (variantId: string) => {
    setSelectedVariants(prev =>
      prev.includes(variantId) ? prev.filter(id => id !== variantId) : [...prev, variantId]
    );
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
    setHasUnsavedVariantChanges(true);
  };

  // ── Image management ─────────────────────────────────────────────────
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
                variantId: variantInfo.variantId,
                variantTitle: variantInfo.variantTitle,
                allOptionValues: variantInfo.allOptionValues
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
        setMediaItems(prev => [...prev, ...newMedia]);
        setHasImageChanges(true);
        if (e.target) e.target.value = '';
      }
    } catch (error) {
      if (e.target) e.target.value = '';
      alert("Error uploading files. Please try again.");
    }
  };

  // ── Remove image (NEW: tracks deleted server image IDs) ──────────────
  const handleRemoveImage = (index: number) => {
    setHasImageChanges(true);
    setMediaItems(prev => {
      const removed = prev[index];
      if (removed?.id && removed.id.startsWith('img_') && !removed.isNew) {
        setDeletedImageIds(prevDeleted =>
          prevDeleted.includes(removed.id) ? prevDeleted : [...prevDeleted, removed.id]
        );
      }
      if (removed?.file && removed.url.startsWith('blob:')) {
        URL.revokeObjectURL(removed.url);
      }
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((item, i) => ({ ...item, rank: i }));
    });
  };

  // ── Move image up/down (NEW) ─────────────────────────────────────────
  const handleMoveImageUp = (index: number) => {
    if (index === 0) return;
    setHasImageChanges(true);
    setMediaItems(prev => {
      const newMedia = [...prev];
      const temp = newMedia[index - 1];
      newMedia[index - 1] = { ...newMedia[index], rank: index - 1 };
      newMedia[index] = { ...temp, rank: index };
      return newMedia;
    });
  };

  const handleMoveImageDown = (index: number) => {
    if (index === mediaItems.length - 1) return;
    setHasImageChanges(true);
    setMediaItems(prev => {
      const newMedia = [...prev];
      const temp = newMedia[index + 1];
      newMedia[index + 1] = { ...newMedia[index], rank: index + 1 };
      newMedia[index] = { ...temp, rank: index };
      return newMedia;
    });
  };

  const getImageAssociatedOptions = () => {
    const currentOptions = form.getValues('options');
    return currentOptions.filter(opt =>
      opt.title && opt.optionValues && opt.optionValues.length > 0 && opt.imageAssociation === true
    );
  };

  const [imageAssociatedOptions, setImageAssociatedOptions] = useState<Option[]>([]);

  useEffect(() => {
    const subscription = form.watch((formValues, { name, type }) => {
      if (name && (name.includes('options') || name.includes('imageAssociation'))) {
        setImageAssociatedOptions(getImageAssociatedOptions());
      }
    });
    setImageAssociatedOptions(getImageAssociatedOptions());
    return () => subscription.unsubscribe();
  }, [form]);

  const handleDropzoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const getVariantAssociatedImages = (variant: Variant, mediaItems: MediaItem[]) => {
    if (!variant.optionValues || !Array.isArray(variant.optionValues)) return [];
    const associatedImages: { id: string; url: string }[] = [];
    mediaItems.filter(item => item.variantInfo?.variantId === variant.id).forEach(item => {
      if (item.url && item.id && !associatedImages.some(img => img.id === item.id)) {
        associatedImages.push({ id: item.id, url: item.url });
      }
    });
    variant.optionValues.forEach(optVal => {
      mediaItems.filter(item =>
        item.variantInfo?.optionName &&
        item.variantInfo.optionName.toLowerCase() === optVal.optionName.toLowerCase() &&
        item.variantInfo?.optionValues?.includes(optVal.value)
      ).forEach(item => {
        if (item.url && item.id && !associatedImages.some(img => img.id === item.id)) {
          associatedImages.push({ id: item.id, url: item.url });
        }
      });
    });
    return associatedImages;
  };

  const handleAddProductDetail = () => {
    appendProductDetail({ id: generateUUID(), text: '' });
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    if (isEditing) {
      navigate({ to: '/products' });
    } else {
      form.reset({
        title: '', subtitle: '', handle: '', description: '', status: 'draft', thumbnail: '',
        discountable: true, category_id: '',
        options: [{ id: generateUUID(), title: 'Size', optionValues: [], colorHexValues: {}, imageAssociation: false }],
        variants: [], defaultVariantPrice: 0, defaultVariantSku: generateUniqueSku('default'),
        defaultVariantStock: 0, weight: '', length: '', width: '', height: '',
        material: '', origin_country: '', productDetails: [{ id: generateUUID(), text: '' }],
        storyBehindDesign: '', locationId: defaultLocationId, shippingDays: '7-10', handlingTime: '2-3',
      });
      setMediaItems([]);
      setHasVariants(false);
      setHasImageChanges(false);
      setDeletedImageIds([]);
      setHasUnsavedVariantChanges(false);
      setSalesChannelsDirty(false);
    }
  };

  // ── Vendor sales channel load ─────────────────────────────────────────
    useEffect(() => {
      form.setValue('status', 'draft');          // ← pre-select Draft immediately
      const loadVendorChannels = async () => {
        setIsLoadingChannels(true);
        try {
          const vendor = await fetchCurrentVendor();
          if (!vendor) {
            setVendorSalesChannels([]);
            setSelectedSalesChannels([]);
            return;
          }
        const gstVerified = vendor.gst_verification_status === 'verified';
        const allowed: string[] = [];
        if (gstVerified && vendor.sell_on_marketplace) allowed.push(SALES_CHANNEL_MARKETPLACE);
        if (vendor.sell_on_own_store) allowed.push(SALES_CHANNEL_OWN_STORE);
        setVendorHasMarketplace(Boolean(vendor.sell_on_marketplace));
        setVendorSalesChannels(allowed);
        setSelectedSalesChannels([...allowed]);
        const hasMarketplace = allowed.includes(SALES_CHANNEL_MARKETPLACE);
        const hasOwnStore = allowed.includes(SALES_CHANNEL_OWN_STORE);
        if (hasMarketplace) form.setValue('status', 'proposed');
        else if (hasOwnStore) form.setValue('status', 'published');
        else form.setValue('status', 'draft');
      } catch {
        setVendorSalesChannels([]);
        setSelectedSalesChannels([]);
        form.setValue('status', 'draft');
      } finally {
        setIsLoadingChannels(false);
      }
    };
    loadVendorChannels();
  }, []);

  // ── Option watcher ───────────────────────────────────────────────────
  useEffect(() => {
    const subscription = form.watch((formValues, { name, type }) => {
      if (name && name.includes('options')) {
        const currentOptions = form.getValues('options');
        if (currentOptions.length > 0) {
          const lastOption = currentOptions[currentOptions.length - 1];
          const hasValues = lastOption?.optionValues && Array.isArray(lastOption.optionValues) &&
            lastOption.optionValues.length > 0;
          if (hasValues && currentOptions.length < 3) {
            const hasEmptyOption = currentOptions.some(
              opt => opt.title === '' && (!opt.optionValues ||
                (Array.isArray(opt.optionValues) && opt.optionValues.length === 0))
            );
            if (!hasEmptyOption) {
              appendOption({ id: generateUUID(), title: '', optionValues: [], imageAssociation: false });
            }
          }
        }
        if (type === 'change') handleGenerateVariants();
      }
    });
    return () => subscription.unsubscribe();
  }, [appendOption, form, handleGenerateVariants]);

  useEffect(() => {
    const initialOptionValues: Record<number, string> = {};
    optionFields.forEach((_, index) => { initialOptionValues[index] = ''; });
    setNewOptionValues(initialOptionValues);
  }, [optionFields.length]);

  useEffect(() => {
    return () => { mediaItems.forEach(item => { if (item.file) URL.revokeObjectURL(item.url); }); };
  }, []);

  // ── Category load ────────────────────────────────────────────────────
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      setCategoryError(null);
      try {
        const response = await fetchCategories();
        if (!response) throw new Error('Failed to fetch categories');
        const jsonData = await response.json();
        if (jsonData?.product_categories) setProductCategories(jsonData.product_categories);
        else setCategoryError('Received invalid category data from server');
      } catch (error) {
        setCategoryError('Failed to load categories. Please try again.');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleAddImageUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    try {
      new URL(newImageUrl);
      setMediaItems(prev => [...prev, { file: undefined, url: newImageUrl, rank: prev.length, isNew: true }]);
      setHasImageChanges(true);
      setNewImageUrl('');
    } catch (error) {
      setError('Please enter a valid URL');
      setTimeout(() => setError(null), 3000);
    }
  };

  // ── Form submission ──────────────────────────────────────────────────
  const onSubmit = async (values: ProductFormValues) => {
    if (!values.title.trim()) { setError('Product title is required'); return; }
    setIsSubmitting(true);
    setError(null);

    try {
      // STEP 1: Upload new images
      const productImages: Array<{ id: string; url: string; alt?: string }> = [];
      const imageIdToUrlMap: Record<string, string> = {};

      // Capture uploaded image metadata for setTimeout closure
      // (mediaItems state will be stale inside setTimeout)
      const uploadedMediaSnapshot: Array<{
        imgId: string;
        serverUrl: string;
        colorValue?: string;
        variantInfo?: any;
      }> = [];

      if (mediaItems.length > 0) {
        const sortedMediaItems = [...mediaItems]
          .sort((a, b) => a.rank - b.rank)
          .filter(item => !deletedImageIds.includes(item.id || ''));

        for (const item of sortedMediaItems) {
          if (item.file) {
            const formData = new FormData();
            formData.append('files', item.file);
            const uploadResult = await uploadProductImage({ productId: '', formData, multiple: false });
            if (uploadResult && 'id' in uploadResult && 'url' in uploadResult) {
              productImages.push({ id: uploadResult.id, url: uploadResult.url, alt: item.colorValue || item.variantInfo?.optionValues?.[0] });
              item.id = uploadResult.id;
              item.url = uploadResult.url;
              imageIdToUrlMap[uploadResult.id] = uploadResult.url;

              // Snapshot for setTimeout closure — captures real img_ ID with variant metadata
              uploadedMediaSnapshot.push({
                imgId: uploadResult.id,
                serverUrl: uploadResult.url,
                colorValue: item.colorValue,
                variantInfo: item.variantInfo,
              });
            }
          } else if (item.url && !item.url.startsWith('blob:')) {
            // URL-based image — include as-is
            if (item.id) productImages.push({ id: item.id, url: item.url });
          }
        }
        setUploadedImages(imageIdToUrlMap);
      }

      // STEP 2: Delete images that were removed
      if (deletedImageIds.length > 0) {
        await Promise.allSettled(
          deletedImageIds.map(imageId =>
            uploadProductImage({ productId: '', imageId, action: 'delete' })
              .catch(err => console.error(`Failed to delete image ${imageId}:`, err))
          )
        );
      }

      // STEP 3: Build handle
      const timestamp = new Date().getTime();
      const baseHandle = values.title.toLowerCase()
        .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
      values.handle = `${baseHandle}-${timestamp}`;

      // STEP 4: Build metadata
      const metadata: Record<string, any> = {};
      const formValues = form.getValues();

      metadata.fulfillment_type = JSON.stringify({
        type: "Creator-fulfillment",
        handling_time: formValues.handlingTime || '2-3',
        shipping_time: formValues.shippingDays || '7-10'
      });

      if (formValues.productDetails && Array.isArray(formValues.productDetails)) {
        const validDetails = formValues.productDetails
          .filter(d => d && d.text && d.text.trim() !== '')
          .map(d => d.text.trim());
        if (validDetails.length > 0) metadata.product_details = JSON.stringify(validDetails);
      }

      if (formValues.storyBehindDesign?.trim()) {
        metadata.description_story = formValues.storyBehindDesign.trim();
      }

      const formColorOption = formValues.options?.find(
        opt => opt.title?.toLowerCase() === 'color' || opt.title?.toLowerCase() === 'colour'
      );
      if (formColorOption?.colorHexValues) {
        const colorHexArray = Object.entries(formColorOption.colorHexValues).map(
          ([colorName, hexValue]) => ({ name: colorName, hex: hexValue })
        );
        metadata.color_hex_values = JSON.stringify(colorHexArray);
      }

      const imageMetadata = prepareVariantImageMetadata(formValues.options, mediaItems);
      Object.entries(imageMetadata).forEach(([key, value]) => { metadata[key] = value; });

      const latestOptions = formValues.options;
      const imageAssociationSettings = latestOptions
        .filter(opt => opt.title && Array.isArray(opt.optionValues) && opt.optionValues.length > 0)
        .map(opt => ({ option_id: opt.id, option_name: opt.title, enabled: Boolean(opt.imageAssociation) }));
      metadata.variant_specific_image_option = JSON.stringify(imageAssociationSettings);

      // STEP 5: Build options and variants
      let options: any[] = [];
      let variants: any[] = [];

      if (hasVariants) {
        const validOptions = formValues.options.filter(
          opt => opt.title && Array.isArray(opt.optionValues) && opt.optionValues.length > 0
        );
        if (validOptions.length === 0) {
          setError('You must add at least one option with values');
          setIsSubmitting(false);
          return;
        }
        options = validOptions.map(opt => ({ title: opt.title, values: opt.optionValues }));

        if (formValues.variants.length === 0) {
          setError('You must add at least one variant.');
          setIsSubmitting(false);
          return;
        }
        variants = formValues.variants;
      } else {
        options = [{ title: "Title", values: ["Default"] }];
        variants = [{
          id: generateUUID(), title: 'Default',
          price: formValues.defaultVariantPrice || 0,
          compareAtPrice: 0, stock: formValues.defaultVariantStock || 0,
          sku: formValues.defaultVariantSku || generateUniqueSku(formValues.title),
          allowBackorder: false, manageInventory: true,
          optionValues: [{ optionName: "Title", value: "Default" }]
        }];
      }

      // STEP 6: Format variants with proper option_id resolution (FIXED from edit-product)
      const formattedVariants = variants.map((variant) => {
        const price = typeof variant.price === 'string' ? parseFloat(variant.price) : (variant.price || 0);
        const variantOptions: Record<string, string> = {};

        if (variant.optionValues && variant.optionValues.length > 0) {
          variant.optionValues.forEach((optVal: any) => {
            // Resolve to proper option title for Medusa
            const matchingFormOpt = formValues.options.find(fo =>
              fo.id === optVal.optionId || fo.title === optVal.optionName
            );
            const optionTitle = matchingFormOpt?.title || optVal.optionName;
            variantOptions[optionTitle] = typeof optVal.value === 'object'
              ? String((optVal.value as any)?.value ?? optVal.value)
              : String(optVal.value ?? '');
          });
        }

        const variantMetadata: Record<string, any> = {};
        const costPrice = typeof variant.cost_price === 'string'
          ? parseFloat(variant.cost_price) || 0
          : (variant.cost_price || variant.metadata?.cost_price || 0);
        if (costPrice > 0) variantMetadata.cost_price = costPrice;

        return {
          title: variant.title,
          sku: variant.sku || '',
          manage_inventory: Boolean(variant.manageInventory !== false ? variant.manageInventory : true),
          allow_backorder: Boolean(variant.allowBackorder),
          options: variantOptions,
          metadata: variantMetadata,
          prices: [{ amount: price, currency_code: 'inr' }]
        };
      });

              // STEP 7: Build product payload
        // Note: images are attached AFTER product creation using the real product ID
        // Passing images at creation time causes linking issues in Medusa v2

        const newProduct = {
          title: formValues.title.trim(),
          subtitle: formValues.subtitle?.trim() || "",
          handle: formValues.handle.trim(),
          description: formValues.description.trim() || "",
          status: formValues.status,
          discountable: Boolean(formValues.discountable),
        categories: formValues.category_id
          ? (Array.isArray(formValues.category_id)
            ? formValues.category_id.map((id: string) => ({ id }))
            : [{ id: formValues.category_id }])
          : [],
        weight: formValues.weight ? parseInt(formValues.weight) || 0 : 0,
        length: formValues.length ? parseInt(formValues.length) || 0 : 0,
        width: formValues.width ? parseInt(formValues.width) || 0 : 0,
        height: formValues.height ? parseInt(formValues.height) || 0 : 0,
        ...(formValues.material ? { material: formValues.material } : {}),
        ...(formValues.origin_country ? { origin_country: formValues.origin_country } : {}),
        metadata,
        options,
        variants: formattedVariants,
      };

      console.log('🔍 CHECKPOINT 1 — uploadedMediaSnapshot after upload loop:', 
        JSON.stringify(uploadedMediaSnapshot, null, 2));
      console.log('🔍 CHECKPOINT 1 — productImages:', JSON.stringify(productImages, null, 2));

            // STEP 8: Create product
      const result = await createProduct({ product: newProduct });

      if (result && result.id) {
        setCreatedProductId(result.id);

        console.log('🔍 CHECKPOINT 2 — result.id:', result.id);
        console.log('🔍 CHECKPOINT 2 — uploadedMediaSnapshot at this point:', 
          JSON.stringify(uploadedMediaSnapshot, null, 2));

        // STEP 8.5: Now attach images to the product using the real product ID
        // This is more reliable than passing images at creation time in Medusa v2
        if (uploadedMediaSnapshot.length > 0) {
                    try {
            const imageAttachPayload = uploadedMediaSnapshot.map(snap => ({
              id: snap.imgId,
              url: snap.serverUrl,
            }));

            console.log('🔍 CHECKPOINT 3 — imageAttachPayload:', JSON.stringify(imageAttachPayload));

            const attachResponse = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/products/${result.id}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('vendorToken')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                images: imageAttachPayload,
                thumbnail: uploadedMediaSnapshot[0]?.serverUrl || '',
              }),
            });

            const attachResponseData = await attachResponse.json().catch(() => ({}));
            console.log('🔍 CHECKPOINT 3 — attach response status:', attachResponse.status);
            console.log('🔍 CHECKPOINT 3 — attach response data images:', 
              JSON.stringify(attachResponseData?.product?.images || attachResponseData?.images || attachResponseData));
          } catch (attachErr) {
            console.error('❌ CHECKPOINT 3 — Failed to attach images:', attachErr);
          }
        }

        setTimeout(async () => {
          try {
            const completeProduct = await fetchProduct({ id: result.id });

            console.log('🔍 CHECKPOINT 4 — completeProduct.images:', 
              JSON.stringify(completeProduct?.images || []));
            console.log('🔍 CHECKPOINT 4 — completeProduct.variants count:', 
              completeProduct?.variants?.length);
            console.log('🔍 CHECKPOINT 4 — uploadedMediaSnapshot in setTimeout:', 
              JSON.stringify(uploadedMediaSnapshot));

            if (completeProduct?.variants) {
              // Inventory creation
              const inventoryCreations = [];
              for (const variant of completeProduct.variants) {
                if (variant.inventory_items?.length > 0) {
                  const inventoryItemId = variant.inventory_items[0].inventory_item_id;
                  if (inventoryItemId) {
                    const formVariant = variants.find(v => v.title === variant.title) || variants[0];
                    inventoryCreations.push({
                      inventory_item_id: inventoryItemId,
                      location_id: defaultLocationId,
                      stocked_quantity: parseInt(String(formVariant?.stock || '0')),
                      incoming_quantity: 0
                    });
                  }
                }
              }
              if (inventoryCreations.length > 0) {
                await batchUpdateInventoryLevels({ create: inventoryCreations });
              }

              // ── VARIANT IMAGE ASSOCIATION ──────────────────────────────────
              // uploadedMediaSnapshot is captured in onSubmit scope (not stale state)
              // imgId is a filename string (not img_ prefixed) from local file provider
              // colorValue and variantInfo are set by StreamlinedImageManager

              // Build option value → imgId maps from uploadedMediaSnapshot
              // Keyed by optionName so we can match color, size, or both
              // Structure: { 'color': { 'white': [id1], 'blue': [id2] }, 'size': { 'x': [id1], 'l': [id2] } }
              const optionNameToValueImgIds: Record<string, Record<string, string[]>> = {};

                for (const snap of uploadedMediaSnapshot) {
                if (!snap.imgId) continue;

                // Combination mode: allOptionValues has ALL option name+value pairs for this variant
                const allOptVals = (snap.variantInfo as any)?.allOptionValues as Array<{optionName: string; value: string}> || [];
                if (allOptVals.length > 0) {
                  for (const ov of allOptVals) {
                    const optName = (ov.optionName || '').toLowerCase().replace(/[\s_-]+/g, '');
                    const optVal = (ov.value || '').toLowerCase().replace(/[\s_-]+/g, '');
                    if (!optName || !optVal) continue;
                    if (!optionNameToValueImgIds[optName]) optionNameToValueImgIds[optName] = {};
                    if (!optionNameToValueImgIds[optName][optVal]) optionNameToValueImgIds[optName][optVal] = [];
                    if (!optionNameToValueImgIds[optName][optVal].includes(snap.imgId)) {
                      optionNameToValueImgIds[optName][optVal].push(snap.imgId);
                    }
                  }
                  continue; // allOptionValues covers all — skip single-option cases
                }

                const optionName = snap.variantInfo?.optionName?.toLowerCase().replace(/[\s_-]+/g, '') || '';
                const optionValues = snap.variantInfo?.optionValues || [];

                // Also treat colorValue as a color option entry
                if (snap.colorValue) {
                  const colorKey = 'color';
                  const valKey = snap.colorValue.toLowerCase().replace(/[\s_-]+/g, '');
                  if (!optionNameToValueImgIds[colorKey]) optionNameToValueImgIds[colorKey] = {};
                  if (!optionNameToValueImgIds[colorKey][valKey]) optionNameToValueImgIds[colorKey][valKey] = [];
                  if (!optionNameToValueImgIds[colorKey][valKey].includes(snap.imgId)) {
                    optionNameToValueImgIds[colorKey][valKey].push(snap.imgId);
                  }
                }

                if (optionName && optionValues.length) {
                  if (!optionNameToValueImgIds[optionName]) optionNameToValueImgIds[optionName] = {};
                  for (const val of optionValues) {
                    const valKey = val.toLowerCase().replace(/[\s_-]+/g, '');
                    if (!optionNameToValueImgIds[optionName][valKey]) optionNameToValueImgIds[optionName][valKey] = [];
                    if (!optionNameToValueImgIds[optionName][valKey].includes(snap.imgId)) {
                      optionNameToValueImgIds[optionName][valKey].push(snap.imgId);
                    }
                  }
                }
              }

              console.log('optionNameToValueImgIds:', optionNameToValueImgIds);

              // All imgIds for fallback
              const allSnapshotImgIds = uploadedMediaSnapshot
                .map(s => s.imgId)
                .filter((id): id is string => !!id && id.length > 0);

              // Check which option types have specific images
              const hasAnySpecificImages = Object.keys(optionNameToValueImgIds).length > 0;
              console.log('hasAnySpecificImages:', hasAnySpecificImages, 'allSnapshotImgIds:', allSnapshotImgIds);

              for (const completedVariant of completeProduct.variants) {
                console.log(`Variant "${completedVariant.title}" options:`,
                  completedVariant.options?.map((o: any) => `${o.option?.title}=${o.value}`));

                let matchingImageIds: string[] = [];

                if (hasAnySpecificImages) {
                  // Try to find images that match ALL of this variant's options
                  // that have specific images uploaded
                  // Strategy: intersect image sets across all matching options

                  let candidateSets: string[][] = [];

                  for (const variantOpt of (completedVariant.options || [])) {
                    const optTitle = variantOpt.option?.title?.toLowerCase().replace(/[\s_-]+/g, '') || '';
                    const optValue = (variantOpt.value || '').toLowerCase().replace(/[\s_-]+/g, '');

                    // Check if we have images for this option type
                    if (optionNameToValueImgIds[optTitle]) {
                      const idsForThisValue = optionNameToValueImgIds[optTitle][optValue] || [];
                      if (idsForThisValue.length > 0) {
                        candidateSets.push(idsForThisValue);
                        console.log(`  Option ${optTitle}=${optValue}: ${idsForThisValue.length} candidate images`);
                      }
                    }
                  }

                  if (candidateSets.length > 0) {
                    if (candidateSets.length === 1) {
                      // Only one option has specific images — use those directly
                      matchingImageIds = candidateSets[0];
                    } else {
                      // Multiple options have specific images — intersect the sets
                      // (only images that satisfy ALL option constraints)
                      matchingImageIds = candidateSets.reduce((acc, set) =>
                        acc.filter(id => set.includes(id))
                      );
                      // If intersection is empty (no image covers both constraints),
                      // fall back to the first set (most specific)
                      if (matchingImageIds.length === 0) {
                        matchingImageIds = candidateSets[0];
                        console.log(`  Intersection empty — using first candidate set`);
                      }
                    }
                  }

                  console.log(`  Matched ${matchingImageIds.length} images for "${completedVariant.title}"`);
                }

                // Fallback: assign all images when no specific match found
                if (matchingImageIds.length === 0) {
                  matchingImageIds = allSnapshotImgIds;
                  console.log(`  Fallback — assigning all ${matchingImageIds.length} images`);
                }

                if (matchingImageIds.length > 0) {
                  const thumbnailUrl = uploadedMediaSnapshot.find(
                    s => s.imgId === matchingImageIds[0]
                  )?.serverUrl;

                  try {
                    await updateVariantImages({
                      productId: result.id,
                      variantId: completedVariant.id,
                      imageIds: matchingImageIds,
                      thumbnailUrl,
                    });
                    console.log(`✅ Assigned ${matchingImageIds.length} images to: ${completedVariant.title}`);
                  } catch (err: any) {
                    console.error(`❌ Failed for ${completedVariant.title}:`, err?.message || err);
                  }
                } else {
                  console.log(`⚠️ No images for: ${completedVariant.title}`);
                }
              }

              // Assign sales channels
              try {
                if (selectedSalesChannels.length > 0) {
                  await assignProductSalesChannels({ productId: result.id, salesChannelIds: selectedSalesChannels });
                } else {
                  await assignProductSalesChannels({ productId: result.id, salesChannelIds: [SALES_CHANNEL_MARKETPLACE] });
                }
              } catch (scError) {
                console.error('Sales channel assignment failed (non-fatal):', scError);
              }
            }
          } catch (fetchError) {
            console.error('Post-creation error:', fetchError);
          }
        }, 2000);

        // Reset dirty state
        setHasImageChanges(false);
        setDeletedImageIds([]);
        setHasUnsavedVariantChanges(false);
        setSalesChannelsDirty(false);

        toast({ title: "Product Created", description: "Your product has been successfully created.", variant: "default" });
        setShowSuccess(true);
        setIsSubmitting(false);
      }

    } catch (error: any) {
      if (error.response) {
        setError(`API Error: ${error.response.data?.message || error.message || 'Unknown API error'}`);
      } else if (error.request) {
        setError('Network error: No response received from server.');
      } else {
        setError(`Error: ${error.message || 'Unknown error occurred'}`);
      }
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    if (e) e.preventDefault();
    form.handleSubmit(onSubmit)();
  };

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
              <Button onClick={handleSuccessClose} variant="outline" className="flex-1">Create Another</Button>
              <Button onClick={() => navigate({ to: `/products/${createdProductId}` })} className="flex-1 bg-[#e65100] hover:bg-[#d84315] text-white">View Product</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-8 sm:px-6 bg-gray-50">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 p-6 mb-6 bg-white border border-gray-100 rounded-lg shadow-sm md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#e65100]">{isEditing ? "Edit Product" : "Create New Product"}</h1>
          <p className="mt-1 text-gray-500">Fill in the details to {isEditing ? "update" : "create"} your product</p>
        </div>
        <div className="flex space-x-3">
          <Button type="button" variant="outline" onClick={() => navigate({ to: '/products' })} className="text-gray-700 border-gray-300 hover:bg-gray-50">Cancel</Button>
          <Button
            type="button"
            onClick={handleManualSubmit}
            disabled={isSubmitting}
            className="bg-[#e65100] hover:bg-[#d84315] text-white shadow-sm"
          >
            {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Product' : 'Create Product')}
          </Button>
        </div>
      </div>

      {error && (
        <div className="fixed z-50 max-w-md p-4 border border-red-200 rounded-lg shadow-lg bottom-4 right-4 bg-red-50">
          <div className="flex items-start">
            <div className="flex-1 text-sm text-red-700">{error}</div>
            <button onClick={() => setError(null)} className="ml-4 text-red-400 hover:text-red-500"><IconX className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={(e) => { e.preventDefault(); handleManualSubmit(e); }} noValidate>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* ── Left Column ─────────────────────────────────────────── */}
            <div className="space-y-6 md:col-span-2">

              {/* Basic Information */}
              <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Basic Information</h2>
                <Separator className="mb-6" />
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel className="font-medium text-gray-700">Product Title*</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. Handcrafted Leather Bag" className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" /></FormControl>
                    <FormDescription className="text-sm text-gray-500">The URL slug will be auto-generated from the title</FormDescription>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="subtitle" render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel className="font-medium text-gray-700">Short Description</FormLabel>
                    <FormControl><Input {...field} placeholder="Brief product description (displays in listings)" className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" /></FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">Description</FormLabel>
                    <FormControl>
                      <Controller name="description" control={form.control} render={({ field }) => (
                        <TipTapEditor value={field.value || ''} onChange={field.onChange} placeholder="Write product details..." />
                      )} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )} />
              </section>

              {/* Product Details */}
              <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Product Details</h2>
                <Separator className="mb-6" />
                <p className="mb-4 text-sm text-gray-500">Add bullet points highlighting key features of your product</p>
                {productDetailFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2 mb-3">
                    <span className="mt-2.5 text-[#e65100]">•</span>
                    <FormField control={form.control} name={`productDetails.${index}.text`} render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl><Input {...field} placeholder={`Product detail #${index + 1}`} className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" /></FormControl>
                      </FormItem>
                    )} />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeProductDetail(index)} className="mt-1 text-gray-500 hover:text-red-500"><IconX size={18} /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddProductDetail} className="mt-2 text-[#e65100] border-[#e65100] hover:bg-orange-50">
                  <IconCirclePlus className="mr-1.5" size={18} /> Add Product Detail
                </Button>
              </section>

              {/* Story Behind Design */}
              <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Story Behind the Design</h2>
                <Separator className="mb-6" />
                <p className="mb-4 text-sm text-gray-500">Share the inspiration and story behind your product</p>
                <FormField control={form.control} name="storyBehindDesign" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Controller name="storyBehindDesign" control={form.control} render={({ field }) => (
                        <TipTapEditor value={field.value || ''} onChange={field.onChange} placeholder="Share the story behind your design..." />
                      )} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )} />
              </section>

              {/* Product Images */}
              <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Product Images</h2>
                <Separator className="mb-6" />
                <p className="mb-4 text-sm text-gray-500">Add images for your product. The first image will be used as the thumbnail.</p>

                <div className="mb-6">
                  <Tabs defaultValue="upload" onValueChange={setActiveImageTab} value={activeImageTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 p-1 mb-4 bg-gray-100 rounded-md">
                      <TabsTrigger value="upload" className="data-[state=active]:bg-white data-[state=active]:text-[#e65100] data-[state=active]:shadow-sm rounded-md">
                        <IconUpload size={16} className="mr-2" /> Upload Images
                      </TabsTrigger>
                      <TabsTrigger value="url" className="data-[state=active]:bg-white data-[state=active]:text-[#e65100] data-[state=active]:shadow-sm rounded-md">
                        <IconLink size={16} className="mr-2" /> Add from URL
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload">
                      {hasVariants && imageAssociatedOptions.length > 0 ? (
                        <StreamlinedImageManager
                          mediaItems={mediaItems}
                          setMediaItems={setMediaItems}
                          options={form.getValues('options')}
                          variants={form.getValues('variants')}
                          fileInputRef={fileInputRef}
                          handleFileChange={handleFileChange}
                          onImageChange={() => setHasImageChanges(true)}
                          handleRemoveImage={handleRemoveImage}
                          handleMoveImageUp={handleMoveImageUp}
                          handleMoveImageDown={handleMoveImageDown}
                        />
                      ) : (
                        <div onClick={handleDropzoneClick} className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#e65100] hover:bg-orange-50 transition-all duration-200">
                          <div className="flex items-center justify-center w-16 h-16 mb-3 bg-orange-100 rounded-full">
                            <IconPhotoPlus size={28} className="text-[#e65100]" />
                          </div>
                          <p className="font-medium text-gray-700">Drag and drop images here</p>
                          <p className="mt-1 text-sm text-gray-500">or click to browse your files</p>
                          <p className="mt-4 text-xs text-gray-500">Supports: JPG, PNG, GIF (Max 5MB)</p>
                        </div>
                      )}
                      <input type="file" multiple accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                    </TabsContent>

                    <TabsContent value="url">
                      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="mb-3 text-sm text-gray-600">Add images from external URLs to your product gallery</p>
                        <div className="flex items-center space-x-2">
                          <Input type="url" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="https://example.com/image.jpg"
                            className="flex-1 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl(e as any); } }} />
                          <Button onClick={(e) => handleAddImageUrl(e)} type="button" className="bg-[#e65100] hover:bg-[#d84315] text-white">Add Image</Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* General image grid (when not in variant-specific mode) */}
                {(!hasVariants || imageAssociatedOptions.length === 0) && (
                  mediaItems.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {mediaItems.sort((a, b) => a.rank - b.rank).map((item, index) => (
                        <div key={`${item.url}-${index}`} className="relative flex flex-col overflow-hidden transition-all duration-200 bg-white border rounded-md group hover:shadow-md">
                          <div className="relative flex items-center justify-center h-48 overflow-hidden bg-gray-100">
                            <img src={item.url} alt={`Product image ${index + 1}`} className="object-cover w-full h-full" />
                            <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 bg-black bg-opacity-0 opacity-0 group-hover:bg-opacity-20 group-hover:opacity-100">
                              <div className="flex space-x-1">
                                <button type="button" onClick={() => handleMoveImageUp(index)} disabled={index === 0} className="p-1 text-white bg-gray-800 rounded-full disabled:opacity-50 hover:bg-gray-700">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                                </button>
                                <button type="button" onClick={() => handleMoveImageDown(index)} disabled={index === mediaItems.length - 1} className="p-1 text-white bg-gray-800 rounded-full disabled:opacity-50 hover:bg-gray-700">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
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
                                    {item.variantInfo.optionName && item.variantInfo.optionValues?.[0]
                                      ? `${item.variantInfo.optionName}: ${item.variantInfo.optionValues[0]}`
                                      : 'Variant'}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <button type="button" onClick={() => handleRemoveImage(index)} className="p-1.5 text-red-500 bg-red-50 rounded-full hover:bg-red-100">
                              <IconTrash size={16} />
                            </button>
                          </div>
                          {index === 0 && <div className="absolute top-2 left-2 bg-[#e65100] text-white text-xs px-2 py-1 rounded-md">Main</div>}
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

              {/* Options & Variants */}
              <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Options & Variants</h2>
                <Separator className="mb-6" />

                <div className="mb-6">
                  <div className="flex items-center mb-4 space-x-2">
                    <Switch checked={hasVariants} onCheckedChange={setHasVariants} id="has-variants" className="data-[state=checked]:bg-[#e65100]" />
                    <label htmlFor="has-variants" className="font-medium text-gray-800 cursor-pointer">This product has multiple variants</label>
                  </div>
                  <div className="pl-10 mb-2 text-sm text-gray-600">
                    {hasVariants ? "Create variants like size or color that customers can choose from" : "A single variant will be created automatically"}
                  </div>
                </div>

                {/* Default variant details (no-variant mode) */}
                {!hasVariants && (
                  <div className="p-5 mb-8 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <h3 className="mb-4 font-medium text-gray-700">Default Variant Details</h3>
                    <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-3">
                      <FormField control={form.control} name="defaultVariantSku" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-gray-700">SKU</FormLabel>
                          <FormControl><Input {...field} placeholder="e.g. LTH-BAG-001" className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" /></FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="defaultVariantPrice" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-gray-700">Price</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                              <Input type="number" min="0" step="0.01" value={field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} placeholder="0.00" className="w-full pl-7 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="defaultVariantStock" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-gray-700">Stock</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="1" value={field.value} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} placeholder="0" className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                )}

                {/* Options (variant mode) */}
                {hasVariants && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-700">Product Options</h3>
                      <Badge variant="outline" className="text-[#e65100] border-[#e65100] bg-orange-50">Required</Badge>
                    </div>

                    <div className="p-4 mb-5 border border-orange-200 rounded-md bg-orange-50">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3"><IconInfoCircle className="h-5 w-5 text-[#e65100]" /></div>
                        <div>
                          <p className="text-sm text-gray-700">Add options like size or color to create variants. Each combination will create a unique variant.</p>
                          <p className="mt-1 text-sm font-medium text-[#e65100]">At least one option with values is required when using variants.</p>
                        </div>
                      </div>
                    </div>

                    {optionFields.map((opt, optionIndex) => (
                      <div key={opt.id} className="p-5 mb-4 transition-shadow duration-200 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <FormField control={form.control} name={`options.${optionIndex}.title`} render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel className="font-medium text-gray-700">Option {optionIndex + 1} name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder={optionIndex === 0 ? "e.g. Size" : optionIndex === 1 ? "e.g. Color" : "e.g. Material"} className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" />
                              </FormControl>
                            </FormItem>
                          )} />
                          {(optionIndex > 0 || optionFields.length > 1) && (
                            <Button type="button" variant="ghost" size="sm" className="mt-6 ml-2 text-gray-500 hover:text-red-500 hover:bg-red-50" onClick={() => removeOption(optionIndex)}>
                              <IconX size={18} />
                            </Button>
                          )}
                        </div>
                        <EnhancedOptionComponent
                          optionIndex={optionIndex}
                          currentOption={form.getValues('options')[optionIndex]}
                          updateOption={updateOption}
                          handleGenerateVariants={handleGenerateVariants}
                          form={form}
                        />
                      </div>
                    ))}

                    {optionFields.length < 3 && (
                      <Button type="button" variant="outline" onClick={() => { const idx = optionFields.length; appendOption({ id: generateUUID(), title: '', optionValues: [], imageAssociation: false }); setNewOptionValues(prev => ({ ...prev, [idx]: '' })); }} className="mt-2 text-[#e65100] border-[#e65100] hover:bg-orange-50">
                        <IconCirclePlus className="mr-1.5" size={18} /> Add another option
                      </Button>
                    )}
                  </div>
                )}

                {/* Variants table */}
                {variantFields.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-medium text-gray-700">Product Variants ({variantFields.length})</h3>
                      <Button type="button" variant="outline" onClick={handleGenerateVariants} size="sm" className="text-[#e65100] border-[#e65100] hover:bg-orange-50">
                        Regenerate variants
                      </Button>
                    </div>

                    {/* Unsaved changes warning */}
                    {hasUnsavedVariantChanges && (
                      <Alert className="mb-4 bg-amber-50 border-amber-200">
                        <IconInfoCircle className="w-4 h-4 text-amber-500" />
                        <AlertDescription className="text-amber-700">
                          You have unsaved variant changes. Save the product to confirm them.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Bulk Edit Card */}
                    <Card className="mb-6 border-gray-200 shadow-sm">
                      <CardHeader className="pb-3 border-b bg-gray-50">
                        <CardTitle className="flex items-center text-base text-gray-700"><IconEdit size={18} className="mr-2 text-[#e65100]" />Bulk Edit</CardTitle>
                        <CardDescription>Apply changes to multiple variants at once</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center">
                            <Switch checked={bulkEditMode} onCheckedChange={setBulkEditMode} id="bulk-edit-mode" className="data-[state=checked]:bg-[#e65100]" />
                            <label htmlFor="bulk-edit-mode" className="ml-2 text-sm text-gray-700">{bulkEditMode ? 'Exit bulk edit mode' : 'Enable bulk edit mode'}</label>
                          </div>
                          {bulkEditMode && (
                            <>
                              <div className="flex items-center mb-2">
                                <Switch checked={selectedVariants.length === variantFields.length} onCheckedChange={handleSelectAllVariants} id="select-all-variants" className="data-[state=checked]:bg-[#e65100]" />
                                <label htmlFor="select-all-variants" className="ml-2 text-sm text-gray-700">Select all variants ({selectedVariants.length}/{variantFields.length})</label>
                              </div>
                              {selectedVariants.length > 0 && (
                                <div className="grid grid-cols-1 gap-4 mt-2 md:grid-cols-2">
                                  <div>
                                    <label className="block mb-1.5 text-sm text-gray-700">Set price for all selected</label>
                                    <div className="flex gap-2">
                                      <div className="relative flex-1">
                                        <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                        <Input type="number" min="0" step="0.01" value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)} placeholder="0.00" className="pl-7 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" />
                                      </div>
                                      <Button type="button" size="sm" onClick={() => handleBulkEdit('price', parseFloat(bulkPrice) || 0)} disabled={!bulkPrice} className="bg-[#e65100] hover:bg-[#d84315] text-white disabled:bg-gray-300">Apply</Button>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block mb-1.5 text-sm text-gray-700">Set stock for all selected</label>
                                    <div className="flex gap-2">
                                      <Input type="number" min="0" step="1" value={bulkStock} onChange={(e) => setBulkStock(e.target.value)} placeholder="0" className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" />
                                      <Button type="button" size="sm" onClick={() => handleBulkEdit('stock', parseInt(bulkStock) || 0)} disabled={!bulkStock} className="bg-[#e65100] hover:bg-[#d84315] text-white disabled:bg-gray-300">Apply</Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Variants Table — now includes Cost Price & Profit columns */}
                    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            {bulkEditMode && <th className="p-3 text-left border-r border-gray-200"><span className="sr-only">Select</span></th>}
                            <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Variant</th>
                            <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">SKU</th>
                            <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Cost Price</th>
                            <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Price</th>
                            <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Stock</th>
                            <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Profit</th>
                            <th className="p-3 font-medium text-center text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variantFields.map((vf, index) => {
                            const watchedPrice = form.watch(`variants.${index}.price`) || 0;
                            const watchedCostPrice = form.watch(`variants.${index}.cost_price`) || 0;
                            const profit = (typeof watchedPrice === 'string' ? parseFloat(watchedPrice) : watchedPrice) -
                              (typeof watchedCostPrice === 'string' ? parseFloat(watchedCostPrice) : watchedCostPrice);

                            return (
                              <tr key={vf.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${bulkEditMode && selectedVariants.includes(vf.id) ? 'bg-orange-50' : ''} hover:bg-orange-50 transition-colors duration-150`}>
                                {bulkEditMode && (
                                  <td className="p-3 text-center border-r border-gray-200">
                                    <input type="checkbox" checked={selectedVariants.includes(vf.id)} onChange={() => handleToggleVariantSelection(vf.id)} className="w-4 h-4 rounded border-gray-300 text-[#e65100] focus:ring-[#e65100]" />
                                  </td>
                                )}
                                <td className="p-3 border-r border-gray-200">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-gray-800">{form.watch(`variants.${index}.title`)}</span>
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {form.watch(`variants.${index}.optionValues`, []).map((optVal: OptionValue, optIndex: number) => (
                                        <Badge key={optIndex} variant="outline" className="text-xs text-[#e65100] border-orange-200 bg-orange-50">
                                          {optVal.optionName}: {optVal.value}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 border-r border-gray-200">
                                  <Input {...form.register(`variants.${index}.sku`)} onChange={(e) => handleVariantFieldChange(index, 'sku', e.target.value)} className="w-full border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" />
                                </td>
                                {/* Cost Price — readonly, from metadata */}
                                <td className="p-3 border-r border-gray-200">
                                  <div className="text-center">
                                    <span className="font-medium text-orange-600">
                                      {watchedCostPrice > 0 ? `₹${Number(watchedCostPrice).toFixed(2)}` : '--'}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3 border-r border-gray-200">
                                  <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                    <Input type="number" min="0" step="0.01" value={form.watch(`variants.${index}.price`) || ''} onChange={(e) => { const value = e.target.value === '' ? 0 : parseFloat(e.target.value); handleVariantFieldChange(index, 'price', value); }} className="w-full pl-7 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" />
                                  </div>
                                </td>
                                <td className="p-3 border-r border-gray-200">
                                  <Input type="number" min="0" step="1" value={form.watch(`variants.${index}.stock`) || ''} onChange={(e) => { const value = e.target.value === '' ? 0 : parseInt(e.target.value); handleVariantFieldChange(index, 'stock', value); }} className="w-full border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" />
                                </td>
                                {/* Profit column */}
                                <td className="p-3 border-r border-gray-200">
                                  <div className="text-center">
                                    <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      ₹{profit.toFixed(2)}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex justify-center space-x-2">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleDuplicateVariant(index)} className="text-gray-600 hover:bg-gray-100" title="Duplicate variant"><IconCopy size={16} /></Button>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveVariant(index)} className="text-red-500 hover:bg-red-50" title="Remove variant"><IconX size={16} /></Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* ── Right Column ─────────────────────────────────────────── */}
            <div className="space-y-6">

              {/* Status & Visibility */}
              <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Status & Visibility</h2>
                <Separator className="mb-6" />

                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem className="mb-5">
                    <FormLabel className="font-medium text-gray-700">Product Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'draft'}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:ring-[#e65100]">
                          <SelectValue placeholder="Select status">
                            {field.value === 'draft' && <div className="flex items-center"><span className="w-2 h-2 mr-2 bg-gray-400 rounded-full"></span>Draft</div>}
                            {field.value === 'proposed' && <div className="flex items-center"><span className="w-2 h-2 mr-2 bg-yellow-400 rounded-full"></span>Proposed</div>}
                            {field.value === 'published' && <div className="flex items-center"><span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>Published</div>}
                            {!field.value && <span className="text-gray-400">Select status</span>}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft"><div className="flex items-center"><span className="w-2 h-2 mr-2 bg-gray-400 rounded-full"></span>Draft</div></SelectItem>
                        {selectedSalesChannels.includes(SALES_CHANNEL_MARKETPLACE) && (
                          <SelectItem value="proposed"><div className="flex items-center"><span className="w-2 h-2 mr-2 bg-yellow-400 rounded-full"></span>Proposed</div></SelectItem>
                        )}
                        {selectedSalesChannels.includes(SALES_CHANNEL_OWN_STORE) && !selectedSalesChannels.includes(SALES_CHANNEL_MARKETPLACE) && (
                          <SelectItem value="published"><div className="flex items-center"><span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>Published</div></SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-sm text-gray-500">Draft products are not visible to customers</FormDescription>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )} />

                {/* Category */}
                {isLoadingCategories ? (
                  <FormField control={form.control} name="category_id" render={() => (
                    <FormItem className="mb-5">
                      <FormLabel className="font-medium text-gray-700">Product Category</FormLabel>
                      <Select disabled><FormControl><SelectTrigger className="border-gray-300"><SelectValue placeholder="Loading categories..." /></SelectTrigger></FormControl><SelectContent><div className="p-2 text-gray-500">Loading...</div></SelectContent></Select>
                    </FormItem>
                  )} />
                ) : categoryError ? (
                  <FormField control={form.control} name="category_id" render={() => (
                    <FormItem className="mb-5">
                      <FormLabel className="font-medium text-gray-700">Product Category</FormLabel>
                      <Select disabled><FormControl><SelectTrigger className="border-gray-300"><SelectValue placeholder="Error loading categories" /></SelectTrigger></FormControl><SelectContent><div className="p-2 text-sm text-red-500">{categoryError}</div></SelectContent></Select>
                    </FormItem>
                  )} />
                ) : (
                  <HierarchicalCategorySelector form={form} categories={productCategories} name="category_id" isMultiSelect={true} />
                )}

                <FormField control={form.control} name="discountable" render={({ field }) => (
                  <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-[#e65100]" /></FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-gray-700">Discountable</FormLabel>
                      <FormDescription className="text-sm text-gray-500">Allow this product to be used in discounts</FormDescription>
                    </div>
                  </FormItem>
                )} />

                {/* Sales Channels */}
                <div className="mt-5">
                  <Separator className="mb-4" />
                  <h3 className="mb-1 font-medium text-gray-700">Sales Channels</h3>
                  <p className="mb-3 text-sm text-gray-500">Choose where this product will be available for sale</p>

                  {isLoadingChannels ? (
                    <p className="text-sm text-gray-400">Loading channels...</p>
                  ) : (
                    <>
                      {vendorSalesChannels.length > 0 && (
                        <div className="space-y-3">
                          {vendorSalesChannels.map(channelId => {
                            const isChecked = selectedSalesChannels.includes(channelId);
                            const isOnlyChannel = vendorSalesChannels.length === 1;
                            const isLastSelected = isChecked && selectedSalesChannels.length === 1;
                            const isDisabled = isOnlyChannel || isLastSelected;
                            return (
                              <div key={channelId} className={`flex items-center gap-3 p-3 border rounded-md ${isDisabled ? 'border-gray-100 bg-gray-50 opacity-70' : 'border-gray-200'}`}>
                                <Checkbox id={`sc-create-${channelId}`} checked={isChecked} disabled={isDisabled}
                                  onCheckedChange={(checked) => {
                                    if (isDisabled) return;
                                    const next = checked
                                      ? [...selectedSalesChannels, channelId]
                                      : selectedSalesChannels.filter(id => id !== channelId);
                                    setSelectedSalesChannels(next);
                                    setSalesChannelsDirty(true);
                                    const mktIn = next.includes(SALES_CHANNEL_MARKETPLACE);
                                    const ownIn = next.includes(SALES_CHANNEL_OWN_STORE);
                                    if (mktIn) form.setValue('status', 'proposed');
                                    else if (ownIn && !mktIn) form.setValue('status', 'published');
                                  }}
                                  className="data-[state=checked]:bg-[#e65100] data-[state=checked]:border-[#e65100]" />
                                <div className="flex-1">
                                  <label htmlFor={`sc-create-${channelId}`} className={`text-sm font-medium ${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer'}`}>
                                    {SALES_CHANNEL_LABELS[channelId] || channelId}
                                  </label>
                                  {isOnlyChannel && <p className="mt-0.5 text-xs text-gray-400">Only available channel</p>}
                                  {isLastSelected && !isOnlyChannel && <p className="mt-0.5 text-xs text-gray-400">At least one channel must be selected</p>}
                                </div>
                                {isChecked && <span className="text-xs text-[#e65100] font-medium">Active</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {vendorHasMarketplace && !vendorSalesChannels.includes(SALES_CHANNEL_MARKETPLACE) && (
                        <div className="flex items-start gap-2 p-3 mt-3 text-sm border rounded-md border-amber-200 bg-amber-50">
                          <IconInfoCircle size={16} className="mt-0.5 text-amber-500 shrink-0" />
                          <p className="text-amber-700">
                            <span className="font-medium">Junooni Marketplace unavailable.</span>{' '}
                            Complete GST verification in{' '}
                            <button type="button" className="font-medium underline hover:text-amber-900" onClick={() => window.location.href = '/profile'}>business settings</button>{' '}
                            to list on the marketplace.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>

              {/* Shipping & Fulfillment */}
              <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Shipping & Fulfillment</h2>
                <Separator className="mb-4" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-full text-[#e65100]"><IconTruck size={24} /></div>
                  <div>
                    <h3 className="font-medium text-gray-800">Creator Fulfillment</h3>
                    <p className="text-sm text-gray-600">You'll handle all order shipping</p>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <FormField control={form.control} name="shippingDays" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center font-medium text-gray-700"><IconTruck size={18} className="mr-1.5 text-[#e65100]" />Shipping Time</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger className="border-gray-300 focus:ring-[#e65100]"><SelectValue placeholder="Select shipping time" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="3-5">3-5 business days</SelectItem>
                          <SelectItem value="5-7">5-7 business days</SelectItem>
                          <SelectItem value="7-10">7-10 business days</SelectItem>
                          <SelectItem value="10-14">10-14 business days</SelectItem>
                          <SelectItem value="14-21">2-3 weeks</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Estimated time for delivery after shipping</FormDescription>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="handlingTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center font-medium text-gray-700"><IconClock size={18} className="mr-1.5 text-[#e65100]" />Handling Time</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger className="border-gray-300 focus:ring-[#e65100]"><SelectValue placeholder="Select handling time" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 business day</SelectItem>
                          <SelectItem value="1-2">1-2 business days</SelectItem>
                          <SelectItem value="2-3">2-3 business days</SelectItem>
                          <SelectItem value="3-5">3-5 business days</SelectItem>
                          <SelectItem value="5-7">5-7 business days</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Time needed to prepare and package the order</FormDescription>
                    </FormItem>
                  )} />
                </div>
              </section>

              {/* Physical Details */}
              <section className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Physical Details</h2>
                <Separator className="mb-6" />
                <div className="space-y-5">
                  <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">Weight (g)</FormLabel>
                      <FormControl><Input {...field} type="number" min="0" placeholder="e.g. 400" className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" /></FormControl>
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-3 gap-3">
                    <FormField control={form.control} name="length" render={({ field }) => (
                      <FormItem><FormLabel className="font-medium text-gray-700">Length(cm)</FormLabel><FormControl><Input {...field} type="number" min="0" placeholder="30" className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="width" render={({ field }) => (
                      <FormItem><FormLabel className="font-medium text-gray-700">Width(cm)</FormLabel><FormControl><Input {...field} type="number" min="0" placeholder="20" className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="height" render={({ field }) => (
                      <FormItem><FormLabel className="font-medium text-gray-700">Height(cm)</FormLabel><FormControl><Input {...field} type="number" min="0" placeholder="5" className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" /></FormControl></FormItem>
                    )} />
                  </div>
                </div>
              </section>

              {/* Additional Info */}
              <section className="p-6 pb-16 bg-white border border-gray-200 rounded-lg shadow-sm md:pb-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Additional Info</h2>
                <Separator className="mb-6" />
                <div className="space-y-5">
                  <FormField control={form.control} name="material" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">Material</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. Cotton, Polyester" className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="origin_country" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">Country of Origin</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'India'}>
                        <FormControl><SelectTrigger className="border-gray-300 focus:ring-[#e65100]"><SelectValue placeholder="Select country" /></SelectTrigger></FormControl>
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
                  )} />
                </div>
              </section>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-10 p-4 bg-white border-t border-gray-200 md:static md:bg-transparent md:border-0 md:p-0 md:mt-6">
            <div className="flex justify-end mx-auto space-x-3 max-w-7xl">
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/products' })} className="text-gray-700 border-gray-300 hover:bg-gray-50">Cancel</Button>
              <Button
                type="button"
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="bg-[#e65100] hover:bg-[#d84315] text-white shadow-sm"
              >
                {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Product' : 'Create Product')}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProductForm;