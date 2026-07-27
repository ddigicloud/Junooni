"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { cookies as nextCookies } from "next/headers"
import { cache } from "react"

import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeAuthToken,
  setAuthToken,
} from "./cookies"

export const retrieveCustomer = cache(
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    return await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        method: "GET",
        query: {
          fields: "*orders",
        },
        headers,
        next
        // cache: "force-cache",
      })
      .then(({ customer }) => customer)
      .catch(() => null)
  }
)

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch(medusaError)

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  const customerForm = {
    email:      formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name:  formData.get("last_name") as string,
    phone:      formData.get("phone") as string,
  }

  try {
    let token: string

    try {
      token = await sdk.auth.register("customer", "emailpass", {
        email:    customerForm.email,
        password: password,
      }) as string

    } catch (registerError: any) {
  const msg = registerError?.toString() || ""

  if (msg.includes("Identity with email already exists")) {
    // First try login with same password (fastest path)
    const loginAttempt = await sdk.auth.login("customer", "emailpass", {
      email:    customerForm.email,
      password: password,
    }).catch(() => null)

    if (loginAttempt && typeof loginAttempt === "string") {
      // Same password — reuse shared identity
      token = loginAttempt
    } else {
      // Different password — use backend route to link customer to existing identity
      const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
      const linkRes    = await fetch(
        `${backendUrl}/store/customers/create-with-existing-identity`,
        {
          method:  "POST",
          headers: {
            "Content-Type":          "application/json",
            "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          },
          body: JSON.stringify({
            email:      customerForm.email,
            first_name: customerForm.first_name,
            last_name:  customerForm.last_name,
            phone:      customerForm.phone,
          }),
        }
      )
      const linkData = await linkRes.json()
      console.log("[signup] create-with-existing-identity:", linkData)

      if (linkRes.status === 409 && linkData.type === "customer_exists") {
        return "A customer account with this email already exists. Please sign in instead."
      }

      if (!linkRes.ok || !linkData.token) {
        return linkData.message || "Registration failed. Please try again."
      }

      // Customer created and linked — set token and finish
      await setAuthToken(linkData.token)
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      await transferCart()
      await wishListCreate()
      await followerCreate()
      return linkData.customer
    }
  } else {
    throw registerError
  }
}

    await setAuthToken(token)
    const headers = { ...(await getAuthHeaders()) }

    // Try creating customer — may fail if guest customer already exists
    let createdCustomer: any
    try {
      const result = await sdk.store.customer.create(customerForm, {}, headers)
      createdCustomer = result.customer
    } catch (createErr: any) {
      const createMsg = createErr?.toString() || ""
      console.log("[signup] customer create error:", createMsg)

      if (createMsg.includes("guest customer") || createMsg.includes("already exists")) {
        // Guest customer exists with this email — just log them in
        const loginToken = await sdk.auth.login("customer", "emailpass", {
          email:    customerForm.email,
          password: password,
        })
        await setAuthToken(loginToken as string)
        const customerCacheTag = await getCacheTag("customers")
        revalidateTag(customerCacheTag)
        await transferCart()
        return "Account linked successfully. You are now signed in."
      }
      throw createErr
    }

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email:    customerForm.email,
      password: password,
    })
    await setAuthToken(loginToken as string)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)
    await transferCart()

    if (createdCustomer) {
      await wishListCreate()
      await followerCreate()
    }

    return createdCustomer

  } catch (error: any) {
    const msg = error?.toString() || ""
    console.log("[signup] outer catch:", msg)
    if (msg.includes("guest customer with the email already exists")) {
      return "An account with this email already exists. Please sign in instead."
    }
    return msg
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await sdk.auth
      .login("customer", "emailpass", { email, password })
      .then(async (token) => {
        await setAuthToken(token as string)
        const customerCacheTag = await getCacheTag("customers")
        revalidateTag(customerCacheTag)
      })
  } catch (error: any) {
    return error.toString()
  }

  try {
    await transferCart()
  } catch (error: any) {
    return error.toString()
  }
}

export async function signout(countryCode: string) {
  await sdk.auth.logout()
  removeAuthToken()
  revalidateTag("auth")
  revalidateTag("customer")
  redirect(`/${countryCode}/account`)
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  revalidateTag("cart")
}

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false
  const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async ({ customer }) => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  } as HttpTypes.StoreUpdateCustomerAddress

  const phone = formData.get("phone") as string

  if (phone) {
    address.phone = phone
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}


// follwer list create

export const followerCreate =
  async () => {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value
    //console.log(token)

    return await sdk.client
      .fetch(`/store/customers/me/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-publishable-api-key": `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}`
        },
      })
      .then((follow) => follow)
      .catch(() => null)
  }

  export const Addfollower =
  async (vendor_id) => {
    //console.log(`In api req vendor_id : ${vendor_id}` )
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value
    //console.log(token)

    return await sdk.client
      .fetch(`/store/customers/me/follow/lists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-publishable-api-key": `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}`
        },
        body:{
         "vendor_id": `${vendor_id}`
        }
      })
      .then((follow) => follow)
      .catch(() => null)
  }



  export const deletefollower = async (vendor_id) => {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value
    //console.log("Deleting follower for vendor:", vendor_id)
  
    try {
      // First, fetch the current follow list to find the correct creator id
      const followList = await sdk.client.fetch(`/store/customers/me/follow`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-publishable-api-key": `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}`
        }
      })
  
      // Check if we have a follow object with creators
      if (followList && followList.follow && followList.follow.creators) {
        // Find the creator entry that matches the vendor_id
        const creatorToDelete = followList.follow.creators.find(
          creator => creator.vendor_id === vendor_id
        )
  
        if (creatorToDelete) {
          // Use the creator's id for deletion
          return await sdk.client.fetch(
            `/store/customers/me/follow/lists/${creatorToDelete.id}`, 
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "x-publishable-api-key": `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}`
              }
            }
          )
        } else {
          //console.error("Creator with vendor_id", vendor_id, "not found in follow list")
          return null
        }
      } else {
        //console.error("Follow list not found or has no creators")
        return null
      }
    } catch (error) {
      //console.error("Error in deletefollower:", error)
      return null
    }
  }

  export const followerList =
  async () => {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value
   return await sdk.client
      .fetch(`/store/customers/me/follow`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-publishable-api-key": `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}`
        },
      })
      .then((follow) => follow)
      .catch(() => null)
  }


  // wishlist create 

export const wishListCreate =
  async () => {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value


    await sdk.client
      .fetch(`/store/customers/me/wishlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-publishable-api-key": `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}`
        },
      })
      .then((customer) => customer)
      .catch(() => null)
  }


  // wishlist addItem
/**
 * Adds an item to the customer's wishlist
 * @param variant_id - The ID of the product variant to add to the wishlist
 * @returns The API response or null if an error occurs
 */
export const wishlistAddItem = async (variant_id: string): Promise<any> => {
 

  const cookies = await nextCookies()
  const token = cookies.get("_medusa_jwt")?.value
  
  if (!token) {
    //console.log("please login")
    return "please login"
  }
  
  return await sdk.client
    .fetch(`/store/customers/me/wishlists/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-publishable-api-key": `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}`
      },
      body: {
        "variant_id": `${variant_id}`
      }
    })
    .then((res) => res)
    .catch(() => null)
}

/**
 * Retrieves the customer's wishlist
 * @returns The wishlist data or null if an error occurs
 */
export const wishlistItems = async (): Promise<any> => {
  const cookies = await nextCookies()
  const token = cookies.get("_medusa_jwt")?.value
  
  if (!token) {
    //console.log("please login")
    return "please login"
  }
  
  return await sdk.client
    .fetch(`/store/customers/me/wishlists`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-publishable-api-key": `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}`
      }
    })
    .then((res) => res)
    .catch(() => null)
}

/**
 * Deletes an item from the customer's wishlist
 * @param itemId - The ID of the wishlist item to delete
 * @returns The API response or null if an error occurs
 */
export const ItemDelete = async (itemId: string): Promise<any> => {
  const cookies = await nextCookies()
  const token = cookies.get("_medusa_jwt")?.value
  
  if (!token) {
    //console.log("please login")
    return "please login"
  }
  
  return await sdk.client
    .fetch(`/store/customers/me/wishlists/items/${itemId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-publishable-api-key": `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}`
      }
    })
    .then((res) => res)
    .catch(() => null)
}



export const matchItemWithVariant = async (productId: string): Promise<any> => {
  const cookies = await nextCookies()
  const token = cookies.get("_medusa_jwt")?.value
  
  if (!token) {
    //console.log("please login")
    return "please login"
  }
  
  return await sdk.client
    .fetch(`/store/products/${productId}`, {
      method: "GET",
      query: {
        fields: "*variants.calculated_price,+metadata,+tags,*vendor" // Add this line
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-publishable-api-key": `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}`
      }
    })
    .then((res) => res)
    .catch(() => null)
}


export const getLoyaltyPoints = async () => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client.fetch<{ points: number }>(
    `/store/customers/me/loyalty-points`,
    {
      method: "GET",
      headers,
    }
  )
    .then(({ points }) => points)
    .catch(() => null)
}

// loyalty points

/**
 * Retrieves the customer's current loyalty points balance
 * @returns The current points balance or null if an error occurs
 */
export const loyaltyPoints = async () => {
  const cookies = await nextCookies()
  const token = cookies.get("_medusa_jwt")?.value

  return await sdk.client
    .fetch(`/store/customers/me/loyalty-points`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-publishable-api-key": `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}`,
      },
    })
    .then((res) => res)
    .catch(() => null)
}



/**
 * Retrieves the customer's loyalty points history
 * @param limit - Optional limit for number of history entries (default: 50)
 * @returns The loyalty points history data or null if an error occurs
 */
// Replace your loyaltyPointsHistory function in customer.ts with this enhanced version:

export const loyaltyPointsHistory = async (limit?: number, offset?: number) => {
  //console.log('🔍 loyaltyPointsHistory called with:', { limit, offset })
  
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value

    // Check if token exists
    if (!token) {
      //console.error('❌ No JWT token found in cookies')
      //console.log('🔍 Available cookies:', Object.keys(cookies.getAll()))
      return null
    }
    //console.log('✅ JWT token found:', token.substring(0, 20) + '...')

    // Check environment variable
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (!publishableKey) {
      //console.error('❌ NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not defined')
      return null
    }
    //console.log('✅ Publishable key found:', publishableKey.substring(0, 20) + '...')

    // Build query parameters
    const queryParams = new URLSearchParams()
    if (limit) queryParams.append('limit', limit.toString())
    if (offset) queryParams.append('offset', offset.toString())
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
    const fullUrl = `/store/customers/me/loyalty-points/history${queryString}`
    
    //console.log('🌐 Making request to:', fullUrl)

    const response = await sdk.client.fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-publishable-api-key": publishableKey,
      },
    })

    //console.log('✅ API Response received:', response)
    
    // Validate response structure
    if (response && typeof response === 'object') {
      if (response.transactions && Array.isArray(response.transactions)) {
        //console.log(`✅ Valid response structure: ${response.transactions.length} transactions`)
        //console.log('💰 Current balance from API:', response.current_balance)
        
        if (response.transactions.length > 0) {
          //console.log('📊 Sample transaction:', response.transactions[0])
        }
        
        return response
      } else {
        //console.warn('⚠️ Response missing transactions array:', response)
        return response // Return anyway, might be valid but empty
      }
    } else {
      //console.error('❌ Invalid response structure:', typeof response, response)
      return null
    }

  } catch (error) {
    //console.error('❌ Error in loyaltyPointsHistory:', error)
    
    // Log detailed error information
    if (error.response) {
      //console.error('📊 Error Response Status:', error.response.status)
      //console.error('📊 Error Response Headers:', error.response.headers)
      try {
        const errorBody = await error.response.text()
        //console.error('📊 Error Response Body:', errorBody)
      } catch (bodyError) {
        //console.error('❌ Could not read error response body:', bodyError)
      }
    } else if (error.request) {
      //console.error('📊 Request made but no response received:', error.request)
    } else {
      //console.error('📊 Error setting up request:', error.message)
    }
    
    return null
  }
}


// Add this function to your customer.ts file

// Add this function to your customer.ts file

/**
 * Fetches invoice PDF for a specific order and returns it as a base64 string
 * @param orderId - The ID of the order to generate invoice for
 * @returns Object with success status and PDF data as base64 string or error message
 */
export const fetchOrderInvoice = async (orderId: string) => {
  const cookies = await nextCookies()
  const token = cookies.get("_medusa_jwt")?.value
  
  if (!token) {
    //console.log("Please login to generate invoice")
    return { success: false, error: "Please login to generate invoice" }
  }

  try {
    const baseUrl = process.env.MEDUSA_BACKEND_URL
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

    // Use raw fetch instead of SDK for binary responses
    const response = await fetch(`${baseUrl}/store/customers/me/orders/${orderId}/invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-publishable-api-key": publishableKey || "",
      },
      credentials: "include",
    })

    // Check if response is ok
    if (!response || !response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    // Get the blob from the response
    const pdfBlob = await response.blob()
    
    // Check if it's actually a PDF
    if (pdfBlob.type !== "application/pdf") {
      throw new Error(`Expected PDF response but got: ${pdfBlob.type}`)
    }

    // Convert blob to buffer then to base64
    const arrayBuffer = await pdfBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')

    return {
      success: true,
      data: {
        base64,
        mimeType: pdfBlob.type,
        size: pdfBlob.size
      }
    }

  } catch (error) {
    //console.error("Invoice fetch error:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }
  }
}
// Also add this debug function to test the API directly:
export const debugLoyaltyHistoryAPI = async () => {
  //console.log('🧪 Debug: Testing loyalty history API directly...')
  
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value
    
    //console.log('🔍 Token check:', token ? 'Found' : 'Missing')
    //console.log('🔍 Publishable key check:', process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ? 'Found' : 'Missing')
    
    if (!token) {
      return { error: 'No authentication token found' }
    }

    // Test with explicit URL
    const testUrl = '/store/customers/me/loyalty-points/historylimit=10'
    //console.log('🌐 Testing URL:', testUrl)

    const response = await sdk.client.fetch(testUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
      },
    })

    //console.log('✅ Debug API test successful:', response)
    return { success: true, data: response }

  } catch (error) {
    //console.error('❌ Debug API test failed:', error)
    return { error: error.message, details: error }
  }
}

export const updateEmail = async (email) => {
  const cookies = await nextCookies()
  const token = cookies.get("_medusa_jwt")?.value
  return await sdk.client
    .fetch("/store/customers/me", {
      method: "UPDATE",
      body: {
        email: `${email}`,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-publishable-api-key": `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}`,
      },
    })
    .then((customer) => customer)
    .catch(medusaError)
}

export async function getGoogleAuthUrl(isRegister = false): Promise<string> {
  const result = await sdk.auth.login("customer", "google", {})

  if (typeof result === "object" && result !== null && "location" in result) {
    return result.location as string
  }

  throw new Error("Could not get Google auth URL")
}


export async function setGoogleAuthCookie(token: string) {
  await setAuthToken(token)
  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)
}