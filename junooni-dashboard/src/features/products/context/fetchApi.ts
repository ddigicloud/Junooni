import axios from 'axios';

// Replace with your actual API base URL
const API_BASE_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL;

// Define a Product type (adjust according to your actual product structure)
interface Product {
  id: string;
  title: string;
  price: number;
  [key: string]: any; // Allow other dynamic properties
}

interface Category {
  id: string;
  name: string;
  handle: string;
}

interface ImageUploadResponse {
  url: string;
  id: string;
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
      },
    });
    console.log("Product fetched:", response.data.product);
    // Make sure this matches your API's response structure
    return response.data.product;
    
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

/**
 * Fetch categories for product categorization
 * @returns A Promise resolving to an array of categories
 */
export async function fetchCategories({ id }: { id?: string }): Promise<{ categories: Category[] }> {
  const token = localStorage.getItem("vendorToken");
  try {
    // Use a dedicated categories endpoint if available
    const response = await axios.get(`${API_BASE_URL}/vendors/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Make sure this matches your API's response structure
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Update an existing product
 * @param product - The updated product data
 * @returns A Promise resolving to the updated product
 */
export async function updateProduct({ product }: { product: Product }): Promise<Product> {
  const token = localStorage.getItem("vendorToken");
  try {
    console.log("Updating product with data:", product);
    
    const response = await axios.put(`${API_BASE_URL}/vendors/products/${product.id}`, product, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    console.log("Product update response:", response.data);
    return response.data.product || response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
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
    });
    return response.data.products || response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
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
    const response = await axios.post(`${API_BASE_URL}/vendors/products`, product, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    return response.data.product;
  } catch (error) {
    console.error('Error creating product:', error);
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
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}