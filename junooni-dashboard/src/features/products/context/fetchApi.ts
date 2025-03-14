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
    console.log(response.data.product)
    // Make sure this matches your API's response structure
    return response.data.product;
    
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

export async function fetchCategories({ id }: { id: string }): Promise<Product> {
  const token = localStorage.getItem("vendorToken");
  try {
    const response = await axios.get(`${API_BASE_URL}/vendors/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Make sure this matches your API's response structure
    return response.data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
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
    const response = await axios.put(`${API_BASE_URL}/vendors/products/${product.id}`, product, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Add this to your fetchApi.ts file
export const uploadProductImage = async ({ productId, formData }: { productId: string; formData: FormData }) => {
  const token = localStorage.getItem("vendorToken");
  try {
    const response = await fetch(`${API_BASE_URL}/vendors/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw error;
  }
};

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
    return response.data;
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