import axios from 'axios';

// Replace with your actual API base URL
const API_BASE_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL;
const API_KEY = import.meta.env.VITE_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

// Define a Product type (adjust according to your actual product structure)
interface Product {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  metadata?: Record<string, any>;
  [key: string]: any; // Allow other dynamic properties
}

interface Category {
  id: string;
  name: string;
  handle: string;
  parent_category_id: string | null;
  category_children?: Category[];
  parent_category?: Category | null;
}

interface ImageUploadResponse {
  url: string;
  id: string;
}

interface InventoryItem {
  id: string;
  sku?: string;
  origin_country?: string;
  hs_code?: string;
  mid_code?: string;
  material?: string;
  weight?: number;
  length?: number;
  height?: number;
  width?: number;
  requires_shipping?: boolean;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

interface InventoryLevel {
  id: string;
  inventory_item_id: string;
  location_id: string;
  stocked_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  incoming_quantity: number;
}

/**
 * Fetch a product by its ID
 * @param id - The product ID
 * @returns A Promise resolving to the product data
 */
export async function fetchProduct({ id }: { id: string }): Promise<Product> {
  const token = localStorage.getItem("vendorToken");
  try {
   const response = await axios.get(`${API_BASE_URL}/vendors/products/${id}`, {
  headers: {
    Authorization: `Bearer ${token}`,
    'x-publishable-api-key': `${API_KEY}`,
  },
  params: {
    fields: [
    'id','title','subtitle','handle','description','status',
    'thumbnail','discountable','weight','length','width','height',
    'material','origin_country','metadata',
    'options.id','options.title',
    // 'options.values.id','options.values.value',
    'options.id','options.title','options.is_exclusive',
    '+options.values.id','+options.values.value',
    // Also fetch the product-level value restrictions:
    '+options.product_values.id','+options.product_values.value',
    'variants.id','variants.title','variants.sku','variants.allow_backorder',
    'variants.manage_inventory',
    '+variants.inventory_quantity',
    'variants.prices.amount','variants.prices.currency_code',
    '+sales_channels.id','+sales_channels.name', 
    'variants.options.option_id','variants.options.value',
    // 'variants.options.option.id',
    // 'variants.options.option.title',
    'variants.inventory_items.inventory_item_id',
    'variants.metadata',
    // 'variants.images.id','variants.images.url',
    'images.id','images.url','images.rank','images.metadata',
    'categories.id','categories.name',
  ].join(',')
  }
});
    //console.log("Product fetched:", response.data.product);
    return response.data.product;
  } catch (error) {
    //console.error('Error fetching product:', error);
    throw error;
  }
}

// fetchApi.ts — add this new function
export async function fetchVariantImages({ id }: { id: string }): Promise<any[]> {
  const token = localStorage.getItem("vendorToken");
  const response = await axios.get(`${API_BASE_URL}/vendors/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      fields: 'variants.id,variants.images.id,variants.images.url,variants.options.value,variants.options.option_id',
    }
  });
  return response.data.product?.variants || [];
}

/**
 * Extract inventory item ID based on the specific Medusa API response structure
 * 
 * @param variant - The product variant object from API response
 * @returns The inventory item ID or null if not found
 */
export function extractInventoryItemId(variant) {
  // Check if variant exists
  if (!variant) return null;
  
  // Based on the GET /vendors/products response, we know the structure:
  // variant.inventory_items[0].inventory_item_id
  if (variant.inventory_items && 
      Array.isArray(variant.inventory_items) && 
      variant.inventory_items.length > 0 &&
      variant.inventory_items[0].inventory_item_id) {
    return variant.inventory_items[0].inventory_item_id;
  }
  
  // Fallback: Check if inventory info is nested differently
  if (variant.inventory_items && 
      Array.isArray(variant.inventory_items) && 
      variant.inventory_items.length > 0 &&
      variant.inventory_items[0].inventory && 
      variant.inventory_items[0].inventory.id) {
    return variant.inventory_items[0].inventory.id;
  }
  
  // Final fallback: the id might be directly in inventory
  if (variant.inventory_items && 
      Array.isArray(variant.inventory_items) && 
      variant.inventory_items.length > 0) {
    const item = variant.inventory_items[0];
    return item.id || item.inventory_item_id || (item.inventory && item.inventory.id);
  }
  
  return null;
}

/**
 * Handle inventory creation after product is created
 * 
 * @param result - The product creation result from API
 * @param formVariants - The variants from the form
 * @param defaultLocationId - The location ID for inventory
 * @returns Promise resolving to the inventory creation result
 */
export async function handleInventoryCreation(result, formVariants, defaultLocationId) {
  if (!result || !result.variants || !Array.isArray(result.variants) || result.variants.length === 0) {
    return null;
  }

  // Build a lookup map once — O(1) per lookup instead of O(n) per variant
  const formVariantMap = new Map(formVariants.map(v => [v.title, v]));

  const inventoryCreations = result.variants
    .map(variant => {
      const inventoryItemId = extractInventoryItemId(variant);
      if (!inventoryItemId) return null;

      const formVariant = formVariantMap.get(variant.title) || formVariants[0];
      return {
        inventory_item_id: inventoryItemId,
        location_id: defaultLocationId,
        stocked_quantity: parseInt(formVariant?.stock || 0),
        incoming_quantity: 0
      };
    })
    .filter(Boolean);

  if (inventoryCreations.length === 0) return null;

  try {
    return await batchUpdateInventoryLevels({ create: inventoryCreations });
  } catch (error) {
    throw error;
  }
}

/**
 * Extract stock information directly from a product variant
 * @param variant - The product variant
 * @returns The stock quantity or null if not found
 */
export function getVariantStock(variant: any): number | null {
  // Try inventory_items array first
  if (variant.inventory_items && Array.isArray(variant.inventory_items) && variant.inventory_items.length > 0) {
    return variant.inventory_items[0].required_quantity || 0;
  }
  
  // Fall back to direct inventory_quantity if available
  if (variant.inventory_quantity !== undefined) {
    return variant.inventory_quantity;
  }
  
  return null;
}

/**
 * Extract inventory item ID from a product variant
 * @param variant - The product variant
 * @returns The inventory item ID or null if not found
 */
export function getVariantInventoryItemId(variant: any): string | null {
  return variant.inventoryItemId ?? null;
}

/**
 * Fetch categories for product categorization
 * @returns A Promise resolving to an array of categories
 */
// fetchApi.ts — fetchCategories()
export async function fetchCategories() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5s max

  try {
    const response = await fetch(`${API_BASE_URL}/store/product-categories?limit=200&fields=id,name,handle,parent_category_id`, {
      credentials: 'include',
      headers: { 'x-publishable-api-key': API_KEY },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      console.warn('fetchCategories timed out after 5s');
      return null;
    }
    throw error;
  }
}

/**
 * Batch update product variants (create, update, delete)
 * @param productId - The product ID
 * @param variantChanges - Object containing created, updated, and deleted variants
 * @returns A Promise resolving to the batch update response
 */
export async function batchUpdateVariants({ 
  productId, 
  variantChanges
}: {
  productId: string;
  variantChanges: {
    create?: any[];
    update?: any[];
    delete?: { id: string }[];  // ← correct: array of { id }
  };
}): Promise<any> {
  const token = localStorage.getItem("vendorToken");

  // Just to debug
  //console.log("Batch variant update payload:", JSON.stringify(variantChanges, null, 2));

  const response = await axios.post(
    `${API_BASE_URL}/vendors/products/${productId}/variants/batch`, 
    variantChanges,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
  
}


/**
 * Update an existing product
 * @param product - The updated product data with ID
 * @returns A Promise resolving to the updated product
 */
export async function updateProduct({ product }: { product: Product }): Promise<Product> {
  const token = localStorage.getItem("vendorToken");
  const { id } = product;

  if (!id) {
    throw new Error('Product ID is required for update');
  }

  // Exclude id from body payload
  const { id: _, ...productDataWithId } = product;

  const response = await axios.put(
    `${API_BASE_URL}/vendors/products/${id}`,
    productDataWithId,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }
  );

  return response.data.product || response.data;
}


/**
 * Upload and manage product images
 * @param options - Upload options including product ID, form data or image URL
 * @returns A Promise resolving to the upload response
 */
export async function uploadProductImage({ 
  productId, 
  formData = null, 
  imageUrl = null, 
  imageId = null, 
  action = 'upload',
  multiple = false 
}: {
  productId: string;
  formData?: FormData | null;
  imageUrl?: string | null;
  imageId?: string | null;
  action?: 'upload' | 'delete';
  multiple?: boolean;
}): Promise<ImageUploadResponse | ImageUploadResponse[] | { success: boolean }> {
  const token = localStorage.getItem("vendorToken");
  
  try {
    // ✅ Handle image deletion
    if (action === 'delete' && imageId) {
      console.log(`🗑️ Deleting image ${imageId} from product ${productId}`);
      
      const response = await axios.delete(
        `${API_BASE_URL}/vendors/uploads`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {
            fileId: imageId,
            productId: productId  // Include productId to help with thumbnail handling
          }
        }
      );
      
      console.log(`✅ Image deleted successfully:`, response.data);
      return response.data;
    }
    
    // ✅ Handle file upload via FormData
    if (formData) {
      const response = await axios.post(`${API_BASE_URL}/vendors/uploads`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true,
      });
      
      console.log("Image upload response:", response.data);
      
      // Return all files or just the first one based on the multiple flag
      return multiple ? response.data.files : response.data.files[0];
    }
    
    // Handle URL-based image upload
    if (imageUrl) {
      const response = await axios.post(`${API_BASE_URL}/vendors/uploads/url`, 
        { url: imageUrl, productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true,
        }
      );
      
      console.log("URL image upload response:", response.data);
      return response.data;
    }
    
    throw new Error('Invalid upload parameters');
  } catch (error) {
    console.error('Error with image operation:', error);
    throw error;
  }
}

/**
 * Fetch inventory levels for a specific inventory item
 * @param inventoryItemId - The inventory item ID
 * @returns A Promise resolving to the inventory levels
 */
export async function fetchInventoryLevels({ inventoryItemId }: { inventoryItemId: string }): Promise<any> {
  const token = localStorage.getItem("vendorToken");
  try {
    const response = await axios.get(
      `${API_BASE_URL}/vendors/inventory-items/${inventoryItemId}/location-levels`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    
    //console.log("Inventory levels fetched:", response.data);
    return response.data;
  } catch (error) {
    //console.error('Error fetching inventory levels:', error);
    throw error;
  }
}

/**
 * Fetch all inventory items
 * @returns A Promise resolving to inventory items
 */
export async function fetchAllInventoryItems(): Promise<InventoryItem[]> {
  const token = localStorage.getItem("vendorToken");
  try {
    const response = await axios.get(
      `${API_BASE_URL}/vendors/inventory-items`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    
    //console.log("All inventory items fetched:", response.data);
    return response.data.inventory_items || [];
  } catch (error) {
    //console.error('Error fetching all inventory items:', error);
    throw error;
  }
}

/**
 * Update inventory levels for a specific inventory item
 * @param inventoryItemId - The inventory item ID
 * @param locationId - The location ID
 * @param quantity - The new stocked quantity
 * @returns A Promise resolving to the updated inventory level
 */
export async function updateInventoryLevel({ 
  inventoryItemId,
  locationId, 
  quantity 
}: { 
  inventoryItemId: string;
  locationId: string;
  quantity: number;
}): Promise<any> {
  const token = localStorage.getItem("vendorToken");
  try {
    const response = await axios.post(
      `${API_BASE_URL}/vendors/inventory-items/${inventoryItemId}/location-levels`,
      {
        location_id: locationId,
        stocked_quantity: quantity
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      }
    );
    
    //console.log("Inventory level updated:", response.data);
    return response.data;
  } catch (error) {
    //console.error('Error updating inventory level:', error);
    throw error;
  }
}

/**
 * Fetch all products
 * @returns A Promise resolving to an array of products
 */
export async function fetchProducts(): Promise<Product[]> {
  const token = localStorage.getItem("vendorToken");
  try {
    const response = await axios.get(`${API_BASE_URL}/vendors/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      currency_code: 'inr',
      fields: 'id,title,subtitle,status,thumbnail,handle,variants.id,variants.prices.amount,variants.prices.currency_code,categories.id,categories.name',
      limit: 100,
    },
    withCredentials: true,
  });
    return response.data.products || response.data;
  } catch (error) {
    //console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Create a new product
 * @param product - The product data
 * @returns A Promise resolving to the created product
 */
export async function createProduct({ product }: { product: Product }): Promise<Product> {
  const token = localStorage.getItem("vendorToken");
  try {
    // Ensure currency_code is present
   
    
    const response = await axios.post(
      `${API_BASE_URL}/vendors/products`, 
      product, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.product;
  } catch (error) {
    //console.error('Error creating product:', error);
    throw error;
  }
}


/**
 * STEP 1: Upload artwork file
 */
export async function uploadArtworkFile(file: File) {
  const token = localStorage.getItem("vendorToken")
  const formData = new FormData()
  formData.append("files", file)

  try {
    //console.log("📤 Uploading artwork file:", file.name)

    const response = await axios.post(
      `${API_BASE_URL}/vendors/artwork/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    )

    //console.log("✅ File uploaded successfully:", response.data)
    
    // ✅ Extract the first file from the response
    const uploadedFile = response.data.files?.[0]
    
    if (!uploadedFile) {
      throw new Error("No file data returned from upload")
    }
    
    return {
      id: uploadedFile.id,
      url: uploadedFile.url,
      filename: uploadedFile.filename,
      mime_type: uploadedFile.mimeType || uploadedFile.mime_type, // Handle both possible field names
    }
  } catch (err: any) {
    //console.error("❌ Error uploading artwork file:", err)
    throw new Error(
      `Failed to upload artwork file: ${err.response?.data?.message || err.message}`
    )
  }
}

/**
 * STEP 2: Create artwork payload
 */
/**
 * STEP 2: Create artwork payload with required field enforcement
 */
export async function createArtworkPayload(artworkPayload: any) {
  const token = localStorage.getItem("vendorToken")

  try {
    // Ensure all required fields are present in medias array
    if (artworkPayload.medias && Array.isArray(artworkPayload.medias)) {
      artworkPayload.medias = artworkPayload.medias.map((media, index) => {
        return {
          ...media,
          // Force required fields with fallbacks
          mime_type: media.mime_type || media.mimeType || 'image/png',
          filename: media.filename || media.name || `artwork-${index + 1}.png`
        }
      })
    }

    //console.log("Creating artwork with processed payload:", artworkPayload)

    const response = await axios.post(
      `${API_BASE_URL}/vendors/artwork`,
      artworkPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    )

    //console.log("Artwork created successfully:", response.data)
    return response.data
  } catch (err: any) {
    //console.error("Error creating artwork payload:", err)
    throw new Error(
      `Failed to create artwork payload: ${err.response?.data?.message || err.message}`
    )
  }
}

/**
 * Combined helper → Upload file + create artwork
 */
export async function submitArtwork(
  areaName: string,
  designImage: { file: File; metadata?: Record<string, any> }
) {
  // Step 1: Upload the design image
  const uploadResult = await uploadArtworkFile(designImage.file)

  // Step 2: Build final payload
  const artworkPayload = {
    name: `${areaName.charAt(0).toUpperCase() + areaName.slice(1)} Artwork`,
    description: `${areaName.charAt(0).toUpperCase() + areaName.slice(1)} Artwork - Canvas design from ${areaName} area`,
    medias: [
      {
        // ✅ Use URL in payload
        image_url: uploadResult.url,

        // ✅ Extra metadata
        filename: uploadResult.filename || designImage.file.name,
        mime_type: uploadResult.mime_type || designImage.file.type,
        file_id: uploadResult.id,
        file_type: "image",
        file_description: `${areaName} design artwork file`,
        design_area: areaName.toLowerCase(),
        metadata: {
          original_filename: designImage.file.name,
          canvas_position: designImage.metadata?.canvasPosition || {},
          source: "canvas_design_element",
        },
      },
    ],
  }

  // Step 3: Submit to /vendors/artwork
  return await createArtworkPayload(artworkPayload)
}


/**
 * Batch update inventory levels
 * @param updates - Object containing created, updated, and deleted inventory levels
 * @returns A Promise resolving to the batch update response
 */
/**
 * Batch update inventory levels with a simplified approach
 */
export async function batchUpdateInventoryLevels(payload: {
  create?: {
    inventory_item_id: string;
    location_id: string;
    stocked_quantity: number;
    incoming_quantity?: number;
  }[],
  update?: {
    inventory_item_id: string;
    location_id: string;
    stocked_quantity: number;
  }[]
}): Promise<any> {
  const token = localStorage.getItem("vendorToken");

  //console.log("📦 Inventory batch operation payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(
      `${API_BASE_URL}/vendors/inventory-items/location-levels/batch`, 
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      }
    );
    
    //console.log("✅ Inventory operation success:", response.data);
    return response.data;
  } catch (error) {
    //console.error('❌ Error in inventory operation:', error);
    throw error;
  }
}

/**
 * Associate product images with specific variants (Medusa v2.11.2+)
 * Called AFTER product creation
 */
export async function updateVariantImages({
  productId,
  variantId,
  imageIds,
  thumbnailUrl,  // ← rename from thumbnailId to thumbnailUrl
}: {
  productId: string;
  variantId: string;
  imageIds: string[];
  thumbnailUrl?: string;  // ← URL string now
}): Promise<any> {
  const token = localStorage.getItem("vendorToken");
  try {
    const response = await axios.post(
      `${API_BASE_URL}/vendors/products/${productId}/variants/${variantId}`,
      { 
        images: imageIds.map(id => ({ id })),
        thumbnail_url: thumbnailUrl  // ← send URL directly
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ updateVariantImages failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Update a product option's metadata
 */
export async function updateProductOption({
  productId,
  optionId,
  title,
  metadata,
}: {
  productId: string;
  optionId: string;
  title: string;
  metadata: Record<string, any>;
}): Promise<any> {
  const token = localStorage.getItem("vendorToken");
  try {
    const response = await axios.post(
      `${API_BASE_URL}/vendors/products/${productId}/options/${optionId}`,
      { title, metadata },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error updating product option:', error);
    throw error;
  }
}

/**
 * Delete a product

/**
 * Delete a product
 * @param id - The product ID to delete
 * @returns A Promise resolving to void
 */
export async function deleteProduct({ id }: { id: string }): Promise<void> {
  const token = localStorage.getItem("vendorToken");
  try {
    await axios.delete(`${API_BASE_URL}/vendors/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
  } catch (error) {
    //console.error('Error deleting product:', error);
    throw error;
  }
}

/**
 * Fetch current vendor profile
 */
/**
 * Fetch current vendor profile by decoding vendor ID from JWT token
 */
/**
 * Fetch current vendor profile via /vendors/me
 */
export async function fetchCurrentVendor(): Promise<any> {
  const token = localStorage.getItem("vendorToken");
  if (!token) return null;

  try {
    const response = await fetch(
      `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      console.warn(`fetchCurrentVendor: /vendors/me returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    // Same shape as dashboard: data.vendor.id = actual vendor ID
    // data.vendor.sell_on_marketplace, data.vendor.sell_on_own_store
    return data.vendor;
  } catch (error) {
    console.warn('fetchCurrentVendor failed:', error);
    return null;
  }
}
/**
 * Assign sales channels to a product
 */
// const DEFAULT_SALES_CHANNEL_ID = 'sc_01JKWDD6MMQ7ZQCN6ZX4RXPP5H';

// export async function assignProductSalesChannels({
//   productId,
//   salesChannelIds,
// }: {
//   productId: string;
//   salesChannelIds: string[];
// }): Promise<any> {
//   const token = localStorage.getItem("vendorToken");

//   // Step 1: Assign the correct sales channels
//   const assignResults = await Promise.all(
//     salesChannelIds.map(channelId =>
//       axios.post(
//         `${API_BASE_URL}/vendors/sales-channels/${channelId}/products/batch`,
//         { product_ids: [{ id: productId }] },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//           withCredentials: true,
//         }
//       )
//     )
//   );

//   // Step 2: Remove default sales channel if it's not in the assigned list
//   if (!salesChannelIds.includes(DEFAULT_SALES_CHANNEL_ID)) {
//     try {
//       await axios.delete(
//         `${API_BASE_URL}/vendors/sales-channels/${DEFAULT_SALES_CHANNEL_ID}/products/batch`,
//         {
//           data: { product_ids: [{ id: productId }] },
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//           withCredentials: true,
//         }
//       );
//       console.log('✅ Removed from default sales channel');
//     } catch (err) {
//       // Non-fatal — product may not have been in default channel
//       console.warn('⚠️ Could not remove from default sales channel:', err);
//     }
//   }

//   console.log('✅ Sales channels assigned:', salesChannelIds);
//   return assignResults.map(r => r.data);
// }

// ❌ REMOVE THIS - hardcoded and environment-specific
//const DEFAULT_SALES_CHANNEL_ID = 'sc_01JKWDD6MMQ7ZQCN6ZX4RXPP5H';

const SALES_CHANNEL_MARKETPLACE = 'sc_01JKWDD6MMQ7ZQCN6ZX4RXPP5H'; // Default = Marketplace
const SALES_CHANNEL_OWN_STORE   = 'sc_01KMAP3HD1EVDF9FT7EHHHV8HP'; // Own Store

// All channels that could be on a product — used to clean up before assigning
const ALL_JUNOONI_CHANNELS = [
  SALES_CHANNEL_MARKETPLACE,
  SALES_CHANNEL_OWN_STORE,
];

export async function assignProductSalesChannels({
  productId,
  salesChannelIds,
}: {
  productId: string;
  salesChannelIds: string[];
}): Promise<any> {
  const token = localStorage.getItem("vendorToken");

  if (!salesChannelIds.length) {
    console.warn('assignProductSalesChannels: No channels provided');
    return;
  }

  console.log('🔴 assignProductSalesChannels called:', {
    productId,
    desired: salesChannelIds,
  });

  // Step 1: Remove ALL known channels first (clean slate)
  // This handles: Medusa auto-assigns marketplace at creation,
  // and we need to remove it if vendor is own-store-only.
  // Use allSettled so 404s (not assigned) don't throw.
  const channelsToRemove = ALL_JUNOONI_CHANNELS.filter(
    ch => !salesChannelIds.includes(ch)
  );

  console.log('🔴 Channels to remove:', channelsToRemove);
  console.log('🔴 Channels to add:', salesChannelIds);

  await Promise.allSettled(
    channelsToRemove.map(channelId =>
      axios.delete(
        `${API_BASE_URL}/vendors/sales-channels/${channelId}/products/batch`,
        {
          data: { product_ids: [{ id: productId }] },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      ).then(() => {
        console.log('✅ Removed channel:', channelId);
      }).catch(err => {
        // 404 = was never assigned, that's fine
        if (err?.response?.status !== 404) {
          console.warn(`⚠️ Could not remove channel ${channelId}:`, err?.response?.data || err.message);
        }
      })
    )
  );

  // Step 2: Add only desired channels
  const results = await Promise.all(
    salesChannelIds.map(channelId =>
      axios.post(
        `${API_BASE_URL}/vendors/sales-channels/${channelId}/products/batch`,
        { product_ids: [{ id: productId }] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      ).then(r => {
        console.log('✅ Added channel:', channelId);
        return r;
      }).catch(err => {
        console.error('❌ Failed to add channel:', channelId, err?.response?.data || err.message);
        throw err;
      })
    )
  );

  console.log('✅ Sales channel assignment complete. Final channels:', salesChannelIds);
  return results.map(r => r.data);
}
/**
 * Fetch sales channels assigned to a product
 */
export async function fetchProductSalesChannels(productId: string): Promise<string[]> {
  const token = localStorage.getItem("vendorToken");
  //console.log('🟡 fetchProductSalesChannels called for:', productId);
  try {
    const response = await axios.get(
      `${API_BASE_URL}/vendors/products/${productId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { fields: '+sales_channels.id,+sales_channels.name' },
        withCredentials: true,
      }
    );
    const salesChannels = response.data.product?.sales_channels || [];
    //console.log('🟡 Raw sales_channels from API:', salesChannels);
    const ids = salesChannels.map((sc: any) => sc.id);
    //console.log('🟡 Extracted channel IDs:', ids);
    return ids;
  } catch (error: any) {
    //console.error('🟡 fetchProductSalesChannels ERROR:', error?.response?.data || error.message);
    return [];
  }
}

/**
 * Remove a product from a sales channel
 */
export async function removeProductFromSalesChannel({
  productId,
  salesChannelId,
}: {
  productId: string;
  salesChannelId: string;
}): Promise<any> {
  const token = localStorage.getItem("vendorToken");
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/vendors/sales-channels/${salesChannelId}/products/batch`,
      {
        data: { product_ids: [{ id: productId }] },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error removing product from sales channel:', error);
    throw error;
  }
}