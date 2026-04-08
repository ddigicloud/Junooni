import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function debugPriceLink({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const productService = container.resolve(Modules.PRODUCT)

  // Get one real latest variant
  const products = await productService.listProducts(
    { status: ["published"] },
    { take: 1, relations: ["variants"], order: { created_at: "DESC" } }
  )
  const variant = products[0]?.variants?.[0]
  logger.info(`Test variant ID: ${variant?.id}`)

  // Try remoteLink
  logger.info("=== remoteLink ===")
  try {
    const remoteLink = container.resolve("remoteLink")
    const links = await remoteLink.list(
      { productService: { variant_id: variant.id } },
      {}
    )
    logger.info(`remoteLink result: ${JSON.stringify(links?.[0], null, 2)}`)
  } catch(err) { logger.error(`remoteLink: ${err}`) }

  // Try query.graph with price_set
  logger.info("=== query.graph price_set ===")
  try {
    const query = container.resolve("query")
    const result = await query.graph({
      entity: "product_variant",
      filters: { id: variant.id },
      fields: ["id", "price_set.id", "price_set.prices.amount", "price_set.prices.currency_code"],
    })
    logger.info(`query result: ${JSON.stringify(result?.data?.[0], null, 2)}`)
  } catch(err) { logger.error(`query.graph: ${err}`) }

  // Raw DB query via mikro-orm
  logger.info("=== raw DB query on product_variant_price_set ===")
  try {
    const manager = container.resolve("__pg_connection__") 
      || container.resolve("pgConnection")
    logger.info("pgConnection found")
  } catch(err) { logger.error(`pgConnection: ${err}`) }

  // Try via pricing module - list prices and check their variant links
  logger.info("=== pricingService.listPrices sample ===")
  try {
    const pricingService = container.resolve(Modules.PRICING)
    const prices = await pricingService.listPrices({}, { take: 2 })
    logger.info(`Price sample: ${JSON.stringify(prices?.[0], null, 2)}`)
  } catch(err) { logger.error(`listPrices: ${err}`) }
}