'use server'

import { sdk } from "@lib/config"
import { getCacheOptions,getAuthHeaders  } from "./cookies"
import { Vendor } from "types/vendor"

interface VendorResponse {

    vendors: [];
  }
  
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
          fields: "*,*products,*products.variants,*products.variants.prices,*products.images",
        },
        headers,
        next,
      })
      .then(({ vendors }) => vendors )
      .catch(() => null);
  };
  

  export const retriveVendorsProducts = async (vendor_id) => {
    const headers = {
      ...(await getAuthHeaders()),
    };
  
    const next = {
      ...(await getCacheOptions("vendors")),
    };
  
    return sdk.client
      .fetch<VendorResponse>(`/vendors/${vendor_id}/products`, {
        method: "GET",
        query: {
          fields: "*",
        },
        headers,
        next,
      })
      .then((products) => products )
      .catch((err) => { 
        console.error("VENDOR PRODUCTS ERROR:", JSON.stringify(err))  // ← add this
      return null 
    });
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


interface FollowersResponse {
  count: number;
  follow: Array<{
    id: string;
    vendor_id: string;
    follow: {
      customer: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
      }
    }
  }>;
}

export const retriveVendorsFollowers = async (vendor_id: string) => {
  console.log("🚀 SDK: Fetching followers for vendor:", vendor_id);
  
  const headers = {
    ...(await getAuthHeaders()),
  };

  const next = {
    ...(await getCacheOptions("vendors")),
  };

  try {
    console.log("📡 SDK: Calling /vendors/" + vendor_id + "/followers");
    
    const response = await sdk.client.fetch<FollowersResponse>(
      `/vendors/${vendor_id}/followers`, 
      {
        method: "GET",
        query: {
          fields: "*",
        },
        headers,
        next,
      }
    );
    
    console.log("✅ SDK: Raw followers response:", response);
    
    return response; // Return the full response { count, follow }
    
  } catch (error) {
    console.error("❌ SDK: Error fetching followers:", error);
    
    // Handle 404 properly instead of returning null
    if (error?.status === 404) {
      console.log("📭 SDK: No followers found (404)");
      return { count: 0, follow: [] }; // Return empty structure, not null
    }
    
    // For other errors, still return empty structure
    return { count: 0, follow: [] };
  }
};




