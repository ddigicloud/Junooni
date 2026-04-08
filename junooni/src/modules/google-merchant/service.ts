import { GoogleAuth } from "google-auth-library"
import { Logger } from "@medusajs/framework/types"

interface GoogleMerchantConfig {
  merchantId: string
  dataSourceId: string
  serviceAccountKeyJson: string
}

interface MerchantProductAttributes {
  title: string
  description: string
  link: string
  imageLink: string
  additionalImageLinks?: string[]
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "PREORDER"
  condition: "NEW" | "USED" | "REFURBISHED"
  brand: string
  price: {
    amountMicros: string  // price in micros e.g. ₹999 = "999000000"
    currencyCode: string
  }
  productTypes?: string[]
  identifierExists?: boolean
  customAttributes?: { name: string; value: string }[]
}

interface MerchantProductInput {
  offerId: string
  contentLanguage: string   // "en"
  feedLabel: string         // "IN" for India
  productAttributes: MerchantProductAttributes
}

interface UpsertResult {
  success: boolean
  offerId?: string
  error?: string
}

export class GoogleMerchantService {
  private merchantId: string
  private dataSourceId: string
  private auth: GoogleAuth
  private baseUrl = "https://merchantapi.googleapis.com"
  private logger: Logger

  constructor(config: GoogleMerchantConfig, logger: Logger) {
    this.merchantId = config.merchantId
    this.dataSourceId = config.dataSourceId
    this.logger = logger

    this.auth = new GoogleAuth({
      credentials: JSON.parse(config.serviceAccountKeyJson),
      scopes: ["https://www.googleapis.com/auth/content"],
    })
  }

  private async getAccessToken(): Promise<string> {
    const client = await this.auth.getClient()
    const tokenResponse = await client.getAccessToken()
    if (!tokenResponse.token) throw new Error("Failed to get Google OAuth access token")
    return tokenResponse.token
  }

  async upsertProduct(product: MerchantProductInput): Promise<UpsertResult> {
    try {
      const token = await this.getAccessToken()

      // v1 endpoint with dataSource as query param
      const dataSource = `accounts/${this.merchantId}/dataSources/${this.dataSourceId}`
      const url = `${this.baseUrl}/products/v1/accounts/${this.merchantId}/productInputs:insert?dataSource=${encodeURIComponent(dataSource)}`

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })

      if (!res.ok) {
        const errorBody = await res.text()
        throw new Error(`HTTP ${res.status}: ${errorBody}`)
      }

      this.logger.info(`[GoogleMerchant] Upserted: ${product.offerId}`)
      return { success: true, offerId: product.offerId }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      this.logger.error(`[GoogleMerchant] Failed to upsert ${product.offerId}: ${message}`)
      return { success: false, offerId: product.offerId, error: message }
    }
  }

  async deleteProduct(offerId: string): Promise<UpsertResult> {
    try {
      const token = await this.getAccessToken()
      // name format: accounts/{account}/productInputs/{productinput}
      // productinput = channel~contentLanguage~feedLabel~offerId
      const productInputName = `accounts/${this.merchantId}/productInputs/online~en~IN~${offerId}`
      const dataSource = `accounts/${this.merchantId}/dataSources/${this.dataSourceId}`

      const url = `${this.baseUrl}/products/v1/${productInputName}?dataSource=${encodeURIComponent(dataSource)}`

      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok && res.status !== 404) {
        const errorBody = await res.text()
        throw new Error(`HTTP ${res.status}: ${errorBody}`)
      }

      this.logger.info(`[GoogleMerchant] Deleted: ${offerId}`)
      return { success: true, offerId }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      this.logger.error(`[GoogleMerchant] Failed to delete ${offerId}: ${message}`)
      return { success: false, offerId, error: message }
    }
  }

  async batchUpsert(
    products: MerchantProductInput[],
    chunkSize = 10
  ): Promise<{ succeeded: number; failed: number; errors: string[] }> {
    const results = { succeeded: 0, failed: 0, errors: [] as string[] }

    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize)
      this.logger.info(
        `[GoogleMerchant] Batch ${i + 1}–${Math.min(i + chunkSize, products.length)} of ${products.length}`
      )

      const chunkResults = await Promise.allSettled(
        chunk.map((p) => this.upsertProduct(p))
      )

      for (const result of chunkResults) {
        if (result.status === "fulfilled" && result.value.success) {
          results.succeeded++
        } else {
          results.failed++
          const error =
            result.status === "rejected"
              ? String(result.reason)
              : result.value.error || "Unknown"
          results.errors.push(error)
        }
      }

      // Small delay between chunks
      if (i + chunkSize < products.length) {
        await new Promise((r) => setTimeout(r, 500))
      }
    }

    return results
  }
}