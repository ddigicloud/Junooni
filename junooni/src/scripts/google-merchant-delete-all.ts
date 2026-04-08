import { ExecArgs } from "@medusajs/framework/types"
import { GoogleAuth } from "google-auth-library"

// All 30 unique offer IDs extracted from product_issues_2026-03-25_11-54-00.csv
const OFFER_IDS_TO_DELETE = [
  "JUNI-beige-l-170326-MMUAVCG4",
  "JUNI-beige-l-200326-MMYV2TZ2",
  "JUNI-beige-x-170326-MMUAVCG4",
  "JUNI-beige-x-200326-MMYV2TZ2",
  "JUNI-beige-xl-170326-MMUAVCG4",
  "JUNI-beige-xl-200326-MMYV2TZ2",
  "JUNI-golden-yellow-l-200326-MMYV2TZ2",
  "JUNI-golden-yellow-x-200326-MMYV2TZ2",
  "JUNI-golden-yellow-xl-200326-MMYV2TZ2",
  "JUNI-lavender-l-120326-MMNBTSEN",
  "JUNI-lavender-l-170326-MMUAVCG4",
  "JUNI-lavender-l-200326-MMYV2TZ2",
  "JUNI-lavender-x-120326-MMNBTSEM",
  "JUNI-lavender-x-170326-MMUAVCG4",
  "JUNI-lavender-x-200326-MMYV2TZ2",
  "JUNI-lavender-xl-120326-MMNBTSEN",
  "JUNI-lavender-xl-170326-MMUAVCG4",
  "JUNI-lavender-xl-200326-MMYV2TZ2",
  "JUNI-mint-l-200326-MMYV2TZ2",
  "JUNI-mint-x-200326-MMYV2TZ2",
  "JUNI-mint-xl-200326-MMYV2TZ2",
  "JUNI-orange-l-070326-MMG0UI39",
  "JUNI-orange-l-070326-MMG23P0I",
  "JUNI-orange-x-070326-MMG0UI39",
  "JUNI-orange-x-070326-MMG23P0I",
  "JUNI-orange-xl-070326-MMG0UI39",
  "JUNI-orange-xl-070326-MMG23P0I",
  "JUNI-skyblue-l-200326-MMYV2TZ1",
  "JUNI-skyblue-x-200326-MMYV2TZ1",
  "JUNI-skyblue-xl-200326-MMYV2TZ2",
]

export default async function deleteCsvProducts({ container }: ExecArgs) {
  const logger = container.resolve("logger")

  const merchantId = process.env.GOOGLE_MERCHANT_ID
  const saKeyJson = process.env.GOOGLE_MERCHANT_SA_KEY
  const dataSourceId = process.env.GOOGLE_MERCHANT_DATASOURCE_ID

  if (!merchantId || !saKeyJson || !dataSourceId) {
    throw new Error("Missing env vars: GOOGLE_MERCHANT_ID, GOOGLE_MERCHANT_SA_KEY, GOOGLE_MERCHANT_DATASOURCE_ID")
  }

  const auth = new GoogleAuth({
    credentials: JSON.parse(saKeyJson),
    scopes: ["https://www.googleapis.com/auth/content"],
  })
  const client = await auth.getClient()
  const tokenResponse = await client.getAccessToken()
  const token = tokenResponse.token!

  const dataSource = `accounts/${merchantId}/dataSources/${dataSourceId}`

  // DRY RUN mode — set DRY_RUN=true to preview without deleting
  const DRY_RUN = process.env.DRY_RUN === "true"

  if (DRY_RUN) {
    logger.info(`[DeleteCSV] DRY RUN — would delete ${OFFER_IDS_TO_DELETE.length} products:`)
    OFFER_IDS_TO_DELETE.forEach(id => logger.info(`  - ${id}`))
    logger.info("[DeleteCSV] Set DRY_RUN=false to actually delete.")
    return
  }

  logger.info(`[DeleteCSV] Deleting ${OFFER_IDS_TO_DELETE.length} products from Merchant Center...`)

  let deleted = 0
  let failed = 0
  let notFound = 0

  for (const offerId of OFFER_IDS_TO_DELETE) {
    const productInputName = `accounts/${merchantId}/productInputs/online~en~IN~${offerId}`
    const url = `https://merchantapi.googleapis.com/products/v1/${productInputName}?dataSource=${encodeURIComponent(dataSource)}`

    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.ok) {
      logger.info(`[DeleteCSV] ✓ Deleted: ${offerId}`)
      deleted++
    } else if (res.status === 404) {
      logger.warn(`[DeleteCSV] ⚠ Not found (already deleted?): ${offerId}`)
      notFound++
    } else {
      const body = await res.text()
      logger.error(`[DeleteCSV] ✗ Failed: ${offerId} — ${res.status} ${body}`)
      failed++
    }
  }

  logger.info("─────────────────────────────────────")
  logger.info(`[DeleteCSV] Done!`)
  logger.info(`[DeleteCSV]  ✓ Deleted:   ${deleted}`)
  logger.info(`[DeleteCSV]  ⚠ Not found: ${notFound}`)
  logger.info(`[DeleteCSV]  ✗ Failed:    ${failed}`)
  logger.info("─────────────────────────────────────")
}