// "use server"

// import { sdk } from "@lib/config"
// import medusaError from "@lib/util/medusa-error"
// import { HttpTypes } from "@medusajs/types"
// import { getCacheOptions } from "./cookies"

// export const listRegions = async () => {
//   const next = {
//     ...(await getCacheOptions("regions")),
//   }

//   return sdk.client
//     .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
//       method: "GET",
//       next,
//       cache: "force-cache",
//     })
//     .then(({ regions }) => regions)
//     .catch(medusaError)
// }

// export const retrieveRegion = async (id: string) => {
//   const next = {
//     ...(await getCacheOptions(["regions", id].join("-"))),
//   }

//   return sdk.client
//     .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
//       method: "GET",
//       next,
//       cache: "force-cache",
//     })
//     .then(({ region }) => region)
//     .catch(medusaError)
// }

// const regionMap = new Map<string, HttpTypes.StoreRegion>()

// export const getRegion = async (countryCode: string) => {
//   try {
//     if (regionMap.has(countryCode)) {
//       return regionMap.get(countryCode)
//     }

//     const regions = await listRegions()

//     if (!regions) {
//       return null
//     }

//     regions.forEach((region) => {
//       region.countries?.forEach((c) => {
//         regionMap.set(c?.iso_2 ?? "", region)
//       })
//     })

//     const region = countryCode
//       ? regionMap.get(countryCode)
//       : regionMap.get("us")

//     return region
//   } catch (e: any) {
//     return null
//   }
// }



"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listRegions = async () => {
  const next = {
    // FIX: 60s → 600s (10 min)
    // Regions almost never change — only when admin adds a new country.
    // Was hitting Medusa DB every 60s on every page load (getRegion is called
    // on every single storefront request). 10x reduction in DB hits.
    ...(await getCacheOptions("regions", 600)),
  }

  return sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ regions }) => regions)
    .catch(medusaError)
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"), 600)),
  }

  return sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ region }) => region)
    .catch(medusaError)
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  try {
    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode)
    }

    const regions = await listRegions()

    if (!regions) {
      return null
    }

    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        regionMap.set(c?.iso_2 ?? "", region)
      })
    })

    const region = countryCode
      ? regionMap.get(countryCode)
      : regionMap.get("us")

    return region
  } catch (e: any) {
    return null
  }
}