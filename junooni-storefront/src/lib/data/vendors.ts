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
          fields: "*",
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



export const retriveVendorsFollowers = async (vendor_id) => {
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
    .then((followers) => followers )
    .catch(() => null);
};





