import Medusa from "@medusajs/js-sdk"

// Defaults to standard port for Medusa server
let MEDUSA_BACKEND_URL = "http://localhost:9000"

if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
}

const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

// Add custom vendor management methods
sdk.store.vendor = {
  // Create a new vendor
  async create(vendorData: any, headers: Record<string, string>) {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/vendor`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(vendorData),
    })
    if (!response.ok) throw new Error("Failed to create vendor")
    return await response.json()
  },

  // Retrieve vendor profile
  async retrieve(headers: Record<string, string>) {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/vendor`, {
      method: "GET",
      headers: { ...headers },
    })
    if (!response.ok) throw new Error("Failed to fetch vendor")
    return await response.json()
  },

  // Update vendor profile
  async update(vendorData: any, headers: Record<string, string>) {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/vendor`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(vendorData),
    })
    if (!response.ok) throw new Error("Failed to update vendor")
    return await response.json()
  },
}

export { sdk }
