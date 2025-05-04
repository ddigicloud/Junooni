// 'use server'

// import { sdk } from "@lib/config"
// import { getCacheOptions,getAuthHeaders  } from "./cookies"
// import { Vendor } from "types/vendor"

// interface VendorResponse {

//     vendors: [];
//   }
  
//   export const retriveVendors = async () => {
//     const headers = {
//       ...(await getAuthHeaders()),
//     };
  
//     const next = {
//       ...(await getCacheOptions("vendors")),
//     };
  
//     return sdk.client
//       .fetch<VendorResponse>(`/vendors`, {
//         method: "GET",
//         query: {
//           fields: "*",
//         },
//         headers,
//         next,
//       })
//       .then(({ vendors }) => vendors )
//       .catch(() => null);
//   };
  

//   export const retriveVendorsProducts = async (vendor_id) => {
//     const headers = {
//       ...(await getAuthHeaders()),
//     };
  
//     const next = {
//       ...(await getCacheOptions("vendors")),
//     };
  
//     return sdk.client
//       .fetch<VendorResponse>(`/vendors/${vendor_id}/products`, {
//         method: "GET",
//         query: {
//           fields: "*",
//         },
//         headers,
//         next,
//       })
//       .then((products) => products )
//       .catch(() => null);
//   };
  

//  /**
//  * Retrieves a specific vendor by handle
//  * @param handle The vendor's unique handle
//  * @returns Promise resolving to a Vendor object or undefined if not found
//  */
// export async function getVendorByHandle(handle: string): Promise<Vendor | undefined> {
//   const vendors = await retriveVendors();
//   return vendors.find(vendor => vendor.handle === handle);
// }



// export const retriveVendorsFollowers = async (vendor_id) => {
//   const headers = {
//     ...(await getAuthHeaders()),
//   };

//   const next = {
//     ...(await getCacheOptions("vendors")),
//   };

//   return sdk.client
//     .fetch<VendorResponse>(`/vendors/${vendor_id}/followers`, {
//       method: "GET",
//       query: {
//         fields: "*",
//       },
//       headers,
//       next,
//     })
//     .then((followers) => followers )
//     .catch(() => null);
// };






'use server'

import { sdk } from "@lib/config"
import { getCacheOptions, getAuthHeaders } from "./cookies"
import { Vendor } from "types/vendor"
import { cookies as nextCookies } from "next/headers"

interface VendorResponse {
  vendors: [];
}

interface VendorProductsResponse {
  products: [];
}

// Existing vendor functions...
export const retriveVendors = async () => {
  const headers = {
    ...(await getAuthHeaders()),
  };

  const next = {
    ...(await getCacheOptions("vendors")),
  };

  return sdk.client
    .fetch<VendorResponse>(`/vendors`, {
      method: "GET",
      query: {
        fields: "*",
      },
      headers,
      next,
    })
    .then(({ vendors }) => vendors)
    .catch(() => null);
};

export const retriveVendorsProducts = async (vendor_id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  };

  const next = {
    ...(await getCacheOptions("vendors")),
  };

  return sdk.client
    .fetch<VendorProductsResponse>(`/vendors/${vendor_id}/products`, {
      method: "GET",
      query: {
        fields: "*",
      },
      headers,
      next,
    })
    .then((products) => products)
    .catch(() => null);
};



/**
 * Retrieves a specific vendor by handle
 * @param handle The vendor's unique handle
 * @returns Promise resolving to a Vendor object or undefined if not found
 */
export async function getVendorByHandle(handle: string): Promise<Vendor | undefined> {
  const vendors = await retriveVendors();
  return vendors.find(vendor => vendor.handle === handle);
}

export const retriveVendorsFollowers = async (vendor_id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  };

  const next = {
    ...(await getCacheOptions("vendors")),
  };

  return sdk.client
    .fetch<VendorResponse>(`/vendors/${vendor_id}/followers`, {
      method: "GET",
      query: {
        fields: "*",
      },
      headers,
      next,
    })
    .then((followers) => followers)
    .catch(() => null);
};




/**
 * Fetches products for a specific vendor with pagination support
 * @param vendorId The unique identifier of the vendor
 * @param page The current page number (1-based)
 * @param limit The number of products per page
 * @param sortBy Optional sort parameter
 * @returns Object containing products array and total count
 */
export const fetchVendorProductsPaginated = async (
  vendorId: string, 
  page: number = 1, 
  limit: number = 12,
  sortBy?: string
) => {
  try {

      const cookies = await nextCookies()
        const token = cookies.get("_medusa_jwt")?.value
    // Calculate pagination offset
    const offset = (page - 1) * limit;
    
    // Build the API URL with query parameters
    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}/vendors/${vendorId}/products`;
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    // Add sort parameters if provided
    if (sortBy) {
      if (sortBy === 'created_at') {
        queryParams.append('order', 'created_at');
      } else if (sortBy === 'price_asc') {
        queryParams.append('order', 'variants.calculated_price');
      } else if (sortBy === 'price_desc') {
        queryParams.append('order', 'variants.calculated_price:desc');
      }
    }
    
    // Make the API request
    const url = `${baseUrl}?${queryParams.toString()}`;
    const response = await fetch(url,{
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-publishable-api-key": `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}`
      },
    });
    
    if (!response.ok) {
      console.error(`Error fetching vendor products: ${response.status} ${response.statusText}`);
      return { products: [], count: 0 };
    }
    
    const data = await response.json();
    
    // Return formatted response
    return {
      products: data.products || [],
      count: data.count || 0
    };
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    return { products: [], count: 0 };
  }
};