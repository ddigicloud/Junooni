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

      }
    });
    //console.log("Product fetched:", response.data.product);
    return response.data.product;
  } catch (error) {
    //console.error('Error fetching product:', error);
    throw error;
  }
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
  // Make sure we have variants in the result
  if (!result || !result.variants || !Array.isArray(result.variants) || result.variants.length === 0) {
    //console.warn("No variants found in product creation result");
    return null;
  }
  
  //console.log(`Processing inventory for ${result.variants.length} variants`);
  
  // Create array to store inventory creation operations
  const inventoryCreations = [];
  
  // Process each variant from the API response
  for (const variant of result.variants) {
    //console.log(`Processing variant ${variant.id}:`, variant.title);
    
    // Examine inventory_items structure in detail for debugging
    if (variant.inventory_items) {
      //console.log(`Variant has ${variant.inventory_items.length} inventory items`);
    } else {
      //console.log("Variant has no inventory_items array");
    }
    
    // Extract inventory item ID using our extraction function
    const inventoryItemId = extractInventoryItemId(variant);
    
    if (!inventoryItemId) {
      //console.warn(`No inventory item ID found for variant ${variant.id}, skipping inventory creation`);
      continue;
    }
    
    //console.log(`Found inventory_item_id for variant ${variant.id}: ${inventoryItemId}`);
    
    // Find the matching form variant to get the stock quantity
    // Match by title (most reliable in this case)
    const formVariant = formVariants.find(v => v.title === variant.title) || formVariants[0];
    const stockQuantity = parseInt(formVariant?.stock || 0);
    
    //console.log(`Using stock quantity ${stockQuantity} for variant "${variant.title}"`);
    
    inventoryCreations.push({
      inventory_item_id: inventoryItemId,
      location_id: defaultLocationId,
      stocked_quantity: stockQuantity,
      incoming_quantity: 0
    });
  }
  
  // Log the final payload for debugging
  //console.log(`Prepared ${inventoryCreations.length} inventory creation operations`);
  
  if (inventoryCreations.length === 0) {
    //console.warn("No inventory creations to submit");
    return null;
  }
  
  try {
    // Prepare the payload for the API
    const inventoryPayload = {
      create: inventoryCreations
    };
    
    //console.log("Submitting inventory batch creation payload:", inventoryPayload);
    
    // Call the batch update function with the prepared payload
    const response = await batchUpdateInventoryLevels(inventoryPayload);
    
    //console.log("Inventory batch creation successful:", response);
    return response;
  } catch (error) {
    //console.error("Failed to create inventory levels:", error);
    //console.error("Error details:", error.response?.data || error.message);
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
export async function fetchCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/store/product-categories`, {
      credentials: "include",
      headers: {
        'x-publishable-api-key': `${API_KEY}`
      },

    });
    
    return response;
  } catch (error) {
    //console.error('Error fetching categories:', error);
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
    delete?: {
      ids: string[];
      object: string;
      deleted: boolean;
    };
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
    // Handle image deletion
    if (action === 'delete' && imageId) {
      const response = await axios.delete(`${API_BASE_URL}/vendors/uploads/${imageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return { success: true };
    }
    
    // Handle file upload via FormData
    if (formData) {
      const response = await axios.post(`${API_BASE_URL}/vendors/uploads`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true,
      });
      
      //console.log("Image upload response:", response.data);
      
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
      
      //console.log("URL image upload response:", response.data);
      return response.data;
    }
    
    throw new Error('Invalid upload parameters');
  } catch (error) {
    //console.error('Error with image operation:', error);
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
        currency_code: 'inr' // Add currency_code to params to avoid pricing context issues
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

