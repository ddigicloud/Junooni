import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

type FetchQikinkTrackingInput = {
  qikinkOrderId: number
  accessToken: string
}

type QikinkTrackingOutput = {
  tracking_number: string | null
  tracking_url: string | null
  carrier: string | null
  order_status: string
} | null

interface QikinkOrderResponse {
  order_id: number
  number: string
  created_on: string
  live_date: string | null
  status: string
  shipping_type: string
  payment_type: string
  total_order_value: string
  shipping: {
    first_name: string
    last_name: string
    phone: string
    email: string
    city: string
    zip: string
    province: string | null
    country_code: string
    awb: string | null
    tracking_link: string
    courier_provider_name: string | null
  }
  line_items: any[]
}

/**
 * Step to fetch tracking information from Qikink order
 */
export const fetchQikinkTrackingStep = createStep(
  "fetch-qikink-tracking-step",
  async (input: FetchQikinkTrackingInput, { container }) => {
    console.log(`📡 Fetching tracking for Qikink order: ${input.qikinkOrderId}`)

    const QIKINK_CLIENT_ID = process.env.QIKINK_CLIENT_ID || "739060471115980"
    const QIKINK_BASE_URL =
      process.env.QIKINK_API_URL?.replace("/order/create", "") ||
      "https://sandbox.qikink.com/api"

    const orderUrl = `${QIKINK_BASE_URL}/order?id=${input.qikinkOrderId}`

    console.log(`🔗 Tracking API URL: ${orderUrl}`)

    try {
      const response = await fetch(orderUrl, {
        method: "GET",
        headers: {
          ClientId: QIKINK_CLIENT_ID,
          Accesstoken: input.accessToken,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.status}`)
      }

      const responseData = await response.json()

      // Qikink returns an array, get first element
      const orderData: QikinkOrderResponse = Array.isArray(responseData)
        ? responseData[0]
        : responseData

      if (!orderData) {
        throw new Error(`Order ${input.qikinkOrderId} not found in response`)
      }

      console.log("📦 Order status:", orderData.status)

      // Check if shipping data exists
      if (!orderData.shipping) {
        console.warn("⚠️ No shipping data available yet")
        return new StepResponse(null)
      }

      const awb = orderData.shipping.awb || null
      let trackingUrl = orderData.shipping.tracking_link || ""
      const carrier = orderData.shipping.courier_provider_name || "Qikink"

      console.log(`📦 AWB: ${awb || "Not available"}`)
      console.log(`📦 Carrier: ${carrier}`)

      // Fix incomplete tracking URLs
      if (trackingUrl && trackingUrl.includes("?awb=") && awb) {
        const urlBase = trackingUrl.split("?awb=")[0]
        trackingUrl = `${urlBase}?awb=${awb}`
        console.log(`🔧 Fixed tracking URL`)
      } else if (!trackingUrl || trackingUrl === "#" || !trackingUrl.startsWith("http")) {
        if (awb) {
          trackingUrl = `https://courierupdates.com/?awb=${awb}`
          console.log(`⚠️ Generated tracking URL from AWB`)
        } else {
          trackingUrl = ""
          console.log(`⏳ No tracking available yet`)
        }
      }

      const trackingInfo: QikinkTrackingOutput = {
        tracking_number: awb,
        tracking_url: trackingUrl || null,
        carrier: carrier,
        order_status: orderData.status,
      }

      if (awb) {
        console.log("✅ Tracking information retrieved:")
        console.log(`   - Tracking Number: ${awb}`)
        console.log(`   - Carrier: ${carrier}`)
        console.log(`   - URL: ${trackingUrl}`)
      } else {
        console.log("⏳ Order not yet shipped, no tracking available")
      }

      return new StepResponse(trackingInfo)
    } catch (error) {
      console.error("❌ Failed to fetch tracking:", error)
      // Return null instead of throwing - tracking might not be available immediately
      return new StepResponse(null)
    }
  }
)
