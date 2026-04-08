import { ExecArgs } from "@medusajs/framework/types"
import { GoogleAuth } from "google-auth-library"

export default async function registerGcp({ container }: ExecArgs) {
  const logger = container.resolve("logger")

  const merchantId = process.env.GOOGLE_MERCHANT_ID
  const saKeyJson = process.env.GOOGLE_MERCHANT_SA_KEY
  const developerEmail = process.env.GOOGLE_MERCHANT_DEV_EMAIL // your Gmail

  if (!merchantId || !saKeyJson || !developerEmail) {
    throw new Error("Missing: GOOGLE_MERCHANT_ID, GOOGLE_MERCHANT_SA_KEY, GOOGLE_MERCHANT_DEV_EMAIL")
  }

  const auth = new GoogleAuth({
    credentials: JSON.parse(saKeyJson),
    scopes: ["https://www.googleapis.com/auth/content"],
  })

  const client = await auth.getClient()
  const tokenResponse = await client.getAccessToken()
  const token = tokenResponse.token

  logger.info(`[RegisterGCP] Registering GCP project with Merchant Center account ${merchantId}...`)

  const url = `https://merchantapi.googleapis.com/accounts/v1/accounts/${merchantId}/developerRegistration:registerGcp`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ developerEmail }),
  })

  const body = await res.json()

  if (!res.ok) {
    logger.error(`[RegisterGCP] Failed: ${JSON.stringify(body, null, 2)}`)
    return
  }

  logger.info(`[RegisterGCP] Success! Response:\n${JSON.stringify(body, null, 2)}`)
  logger.info(`[RegisterGCP] Wait 5 minutes then run the bulk sync script.`)
}
