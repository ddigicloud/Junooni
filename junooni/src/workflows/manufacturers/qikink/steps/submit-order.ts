import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

type SubmitQikinkOrderInput = {
  payload: any
  accessToken: string
}

type SubmitQikinkOrderOutput = {
  result: {
    order_id: number
    number: string
    [key: string]: any
  }
}

/**
 * Step to submit order to Qikink API
 */
export const submitQikinkOrderStep = createStep(
  "submit-qikink-order-step",
  async (input: SubmitQikinkOrderInput, { container }) => {
    console.log("📤 Submitting order to Qikink...")

    const QIKINK_CLIENT_ID = process.env.QIKINK_CLIENT_ID || "739060471115980"
    const QIKINK_API_URL =
      process.env.QIKINK_API_URL || "https://sandbox.qikink.com/api/order/create"

    console.log(`🔗 Qikink API URL: ${QIKINK_API_URL}`)
    console.log("📦 Payload summary:")
    console.log(`   - Order number: ${input.payload.order_number}`)
    console.log(`   - Line items: ${input.payload.line_items.length}`)
    console.log(`   - Total value: ₹${input.payload.total_order_value}`)

    try {
      const response = await fetch(QIKINK_API_URL, {
        method: "POST",
        headers: {
          ClientId: QIKINK_CLIENT_ID,
          Accesstoken: input.accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input.payload),
      })

      const result = await response.json()

      console.log(`📦 Qikink response status: ${response.status}`)

      if (!response.ok) {
        console.error("❌ Qikink API error response:", result)
        throw new Error(
          result.message || result.error || `Qikink API error: ${response.status}`
        )
      }

      console.log("✅ Qikink order submitted successfully")
      console.log(`   - Qikink Order ID: ${result.order_id}`)
      console.log(`   - Qikink Order Number: ${result.number}`)

      return new StepResponse({
        result,
      })
    } catch (error) {
      console.error("❌ Failed to submit order to Qikink:", error)
      throw error
    }
  }
)
