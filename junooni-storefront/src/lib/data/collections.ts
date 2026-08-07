// "use server"

// import { sdk } from "@lib/config"
// import { HttpTypes } from "@medusajs/types"
// import { getCacheOptions } from "./cookies"

// export const retrieveCollection = async (id: string) => {
//   const next = {
//     ...(await getCacheOptions("collections")),
//   }

//   return sdk.client
//     .fetch<{ collection: HttpTypes.StoreCollection }>(
//       `/store/collections/${id}`,
//       {
//         next
//         // cache: "force-cache",
//       }
//     )
//     .then(({ collection }) => collection)
// }

// export const listCollections = async (
//   queryParams: Record<string, string> = {}
// ): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
//   const next = {
//     ...(await getCacheOptions("collections")),
//   }

//   queryParams.limit = queryParams.limit || "100"
//   queryParams.offset = queryParams.offset || "0"

//   return sdk.client
//     .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
//       "/store/collections",
//       {
        
//         query: queryParams,
        
//         next
//         // cache: "force-cache",
//       }
//     )
//     .then(({ collections }) => ({ collections, count: collections.length }))
// }

// export const getCollectionByHandle = async (
//   handle: string
// ): Promise<HttpTypes.StoreCollection> => {
//   const next = {
//     ...(await getCacheOptions("collections")),
//   }

//   return sdk.client
//     .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
//       query: { handle, fields: "id,handle,title,products.id,products.title,products.handle,products.thumbnail,products.status" },
//       next
//       // cache: "force-cache",
//     })
//     .then(({ collections }) => collections[0])
// }



"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const retrieveCollection = async (id: string) => {
  const next = {
    // FIX: 60s → 300s (5 min)
    // Collections change only when admin creates/edits them.
    ...(await getCacheOptions("collections", 300)),
  }

  return sdk.client
    .fetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        next
      }
    )
    .then(({ collection }) => collection)
}

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("collections", 300)),
  }

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return sdk.client
    .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
      "/store/collections",
      {
        query: queryParams,
        next
      }
    )
    .then(({ collections }) => ({ collections, count: collections.length }))
}

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection> => {
  const next = {
    ...(await getCacheOptions("collections", 300)),
  }

  return sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
      query: {
        handle,
        fields: "id,handle,title,products.id,products.title,products.handle,products.thumbnail,products.status"
      },
      next
    })
    .then(({ collections }) => collections[0])
}