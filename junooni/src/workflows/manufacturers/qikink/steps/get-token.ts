import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

type GetQikinkTokenOutput = {
  accessToken: string
}

/**
 * Step to obtain Qikink access token
 * Uses client credentials from environment variables
 */
export const getQikinkTokenStep = createStep(
  "get-qikink-token-step",
  async (_input: {}, { container }) => {
    console.log("🔑 Obtaining Qikink access token...")

    const clientId = process.env.QIKINK_CLIENT_ID
    const clientSecret = process.env.QIKINK_CLIENT_SECRET

    console.log("🔧 Using Qikink client ID:", clientId)
    console.log("🔧 Using Qikink client secret:", clientSecret)

    if (!clientId || !clientSecret) {
      throw new Error("Missing Qikink credentials in environment variables")
    }

    const tokenUrl = "https://sandbox.qikink.com/api/token"

    try {
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `ClientId=${clientId}&client_secret=${clientSecret}`,
      })

      console.log(`🔔 Qikink token response status: ${response.status}`)
      console.log(`🔔 Qikink token response headers: ${JSON.stringify(response.headers)}`)
      console.log("🔔 Qikink token response ok:", response.ok)
      console.log("🔔 Qikink token response statusText:", response.statusText)
      console.log("🔔 Reading Qikink token response body...")
      console.log("🔔 Qikink token response body type:", typeof response.body)
      console.log("🔔 Qikink token response body used:", response.bodyUsed)
      console.log(" Qikink response", response)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Failed to get Qikink token: ${response.status} - ${errorText}`
        )
      }

      const data = await response.json()

      if (!data.Accesstoken) {
        throw new Error("Qikink token response missing Accesstoken field")
      }

      console.log("✅ Qikink access token obtained successfully")

      return new StepResponse({
        accessToken: data.Accesstoken,
      })
    } catch (error) {
      console.error("❌ Failed to obtain Qikink token:", error)
      throw error
    }
  }
)
