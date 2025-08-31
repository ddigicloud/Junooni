import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

import { VENDOR_ARTWORK_MODULE } from "../../../modules/artwork"
import VendorArtworkModuleService from "../../../modules/artwork/service"

export async function linkVendorArtwork(
  { products, additional_data },
  { container }
) {
  if (!additional_data?.vendor_artwork_id) {
    // No vendor artwork to link
    return new StepResponse([], [])
  }

  // Ensure the vendor artwork exists
  const vendorArtworkModuleService: VendorArtworkModuleService = container.resolve(VENDOR_ARTWORK_MODULE)
  await vendorArtworkModuleService.retrieveVendorArtwork(additional_data.vendor_artwork_id as string)

  // Link the vendor artwork to each product
  const link = container.resolve("link")
  const links = products.map(product => ({
    [Modules.PRODUCT]: { product_id: product.id },
    [VENDOR_ARTWORK_MODULE]: { vendor_artwork_id: additional_data.vendor_artwork_id },
  }))
  await link.create(links)

  return new StepResponse(links, links)
}