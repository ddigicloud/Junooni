'use server'

import { sdk } from "@lib/config"
import { getCacheOptions,getAuthHeaders  } from "./cookies"

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
          fields: "*vendors,*handle",
        },
        headers,
        next,
      })
      .then(({ vendors }) => vendors )
      .catch(() => null);
  };
  