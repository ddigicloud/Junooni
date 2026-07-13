import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

type StepInput = {
  sales_channel_id?: string | null
  vendor_id?: string | null
}

export const getOrderEmailBrandingStep = createStep(
  "get-order-email-branding",
  async ({ sales_channel_id, vendor_id }: StepInput, { container }) => {
    const defaultChannelId = process.env.DEFAULT_SALES_CHANNEL_ID

    // Default marketplace channel (or missing info) → use Junooni branding
    if (!sales_channel_id || sales_channel_id === defaultChannelId || !vendor_id) {
      return new StepResponse({
        storeLogo: null,
        storeName: null,
        storePrimaryColor: null,
        storeUrl: null,
        vendorHandle: null,
      })
    }

    const query = container.resolve("query")

    const { data: vendors } = await query.graph({
      entity: "vendor",
      fields: [
        "id",
        "name",
        "handle",
        "vendor_store.store_logo",
        "vendor_store.custom_domain",
        "vendor_store.subdomain",
        "vendor_store.primary_color",
      ],
      filters: { id: vendor_id },
    })

    const vendor = vendors?.[0]
    const vendorStore = vendor?.vendor_store
    const storeLogo = vendorStore?.store_logo

    if (!storeLogo) {
      // Vendor has no own store / no logo set → fall back to Junooni branding
      return new StepResponse({
        storeLogo: null,
        storeName: null,
        storePrimaryColor: null,
        storeUrl: null,
        vendorHandle: null,
      })
    }

    // Build the vendor's own store URL (custom domain takes priority over subdomain)
    let storeUrl: string | null = null
    if (vendorStore.custom_domain) {
      storeUrl = `https://${vendorStore.custom_domain}`
    } else if (vendorStore.subdomain) {
      storeUrl = `https://${vendorStore.subdomain}.junooni.com`
    }

    const storePrimaryColor = vendorStore.primary_color || null

    return new StepResponse({
      storeLogo,
      storeName: vendor?.name || vendor?.handle || null,
      storePrimaryColor,
      storeUrl,
      vendorHandle: vendor?.handle || null,
    })
  }
)