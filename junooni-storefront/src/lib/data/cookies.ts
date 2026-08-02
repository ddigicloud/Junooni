// import "server-only"
// import { cookies as nextCookies } from "next/headers"

// export const getAuthHeaders = async (): Promise<
//   { authorization: string } | {}
// > => {
//   const cookies = await nextCookies()
//   const token = cookies.get("_medusa_jwt")?.value

//   if (!token) {
//     return {}
//   }

//   return { authorization: `Bearer ${token}` }
// }

// export const getCacheTag = async (tag: string): Promise<string> => {
//   try {
//     const cookies = await nextCookies()
//     const cacheId = cookies.get("_medusa_cache_id")?.value

//     if (!cacheId) {
//       return ""
//     }

//     return `${tag}-${cacheId}`
//   } catch (error) {
//     return ""
//   }
// }

// export const getCacheOptions = async (
//   tag: string,
//   revalidate: number = 60
// ): Promise<{ tags: string[]; revalidate: number } | {}> => {
//   if (typeof window !== "undefined") {
//     return {}
//   }

//   const cacheTag = await getCacheTag(tag)

//   if (!cacheTag) {
//     return {}
//   }

//   return { tags: [`${cacheTag}`], revalidate }
// }

// export const setAuthToken = async (token: string) => {
//   const cookies = await nextCookies()
//   cookies.set("_medusa_jwt", token, {
//     maxAge: 60 * 60 * 24 * 7,
//     httpOnly: true,
//     sameSite: "strict",
//     secure: process.env.NODE_ENV === "production",
//   })
// }

// export const removeAuthToken = async () => {
//   const cookies = await nextCookies()
//   cookies.set("_medusa_jwt", "", {
//     maxAge: -1,
//   })
// }

// export const getCartId = async () => {
//   const cookies = await nextCookies()
//   return cookies.get("_medusa_cart_id")?.value
// }

// export const setCartId = async (cartId: string) => {
//   const cookies = await nextCookies()
//   cookies.set("_medusa_cart_id", cartId, {
//     maxAge: 60 * 60 * 24 * 7,
//     httpOnly: true,
//     sameSite: "strict",
//     secure: process.env.NODE_ENV === "production",
//   })
// }

// export const removeCartId = async () => {
//   const cookies = await nextCookies()
//   cookies.set("_medusa_cart_id", "", {
//     maxAge: -1,
//   })
// }



import "server-only"
import { cookies as nextCookies } from "next/headers"

export const getAuthHeaders = async (): Promise<{ authorization: string } | {}> => {
  const cookies = await nextCookies()
  const token = cookies.get("_medusa_jwt")?.value

  if (!token) {
    return {}
  }

  return { authorization: `Bearer ${token}` }
}

export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookies = await nextCookies()
    const cacheId = cookies.get("_medusa_cache_id")?.value

    if (!cacheId) {
      return ""
    }

    return `${tag}-${cacheId}`
  } catch (error) {
    return ""
  }
}

export const getCacheOptions = async (
  tag: string,
  revalidate: number = 60
): Promise<{ revalidate: number; tags?: string[] }> => {
  if (typeof window !== "undefined") {
    return { revalidate }
  }

  const cacheTag = await getCacheTag(tag)

  // ✅ ALWAYS return revalidate — even without a cache tag
  // Before: returned {} when no cookie → no caching at all
  // Now: always caches for `revalidate` seconds minimum
  if (!cacheTag) {
    return { revalidate }
  }

  return { tags: [cacheTag], revalidate }
}

export const setAuthToken = async (token: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeAuthToken = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", "", {
    maxAge: -1,
  })
}

export const getCartId = async () => {
  const cookies = await nextCookies()
  return cookies.get("_medusa_cart_id")?.value
}

export const setCartId = async (cartId: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeCartId = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", "", {
    maxAge: -1,
  })
}