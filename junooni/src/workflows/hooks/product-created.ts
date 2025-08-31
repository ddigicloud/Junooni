// src/workflows/hooks/product-created.ts

import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { linkBrand } from "./product-created/brand-link"
import { linkSizeChart } from "./product-created/sizechart-link"
import { linkVendorArtwork } from "./product-created/artwork-link"

// Attach all hook handlers under product-created
createProductsWorkflow.hooks.productsCreated(
  async (data, context) => {
    await linkBrand(data, context)
    await linkSizeChart(data, context)
    await linkVendorArtwork(data, context)
  }
)