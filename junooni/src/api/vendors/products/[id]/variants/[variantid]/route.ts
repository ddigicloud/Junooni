import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { id: productId, variantid } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    const { data: [variant] } = await query.graph(
      {
        entity: "product_variant",
        filters: {
          id: variantid,
          $and: [{ product_id: { $eq: productId } }],
        },
        fields: (() => {
          const f = req.query?.fields;
          if (!f) return ['id', 'title', 'images.id', 'images.url', 'options.value', 'options.option_id'];
          if (Array.isArray(f)) return f as string[];
          if (typeof f === 'string') return f.split(',').map(s => s.trim());
          return [];
        })(),
      },
      { throwIfKeyNotFound: false }
    )

    if (!variant) {
      return res.status(404).json({
        message: `Variant with id '${variantid}' not found for product '${productId}'`,
      })
    }

    return res.status(200).json({ variant })
  } catch (err) {
    console.error("Error fetching variant:", err)
    return res.status(500).json({
      message: "Internal server error",
    })
  }
}

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { id: productId, variantid } = req.params

  try {
    const { images, thumbnail_url } = req.body as { 
      images: { id: string }[]
      thumbnail_url?: string  // ← matches what fetchApi sends
    }

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ message: "images array is required" })
    }

    const productModule = req.scope.resolve(Modules.PRODUCT) as any

    // Associate all images with variant
    await productModule.addImageToVariant(
      images.map(img => ({
        variant_id: variantid,
        image_id: img.id
      }))
    )

    // Set thumbnail URL directly — no extra query needed
    if (thumbnail_url) {
      await productModule.updateProductVariants(
        { id: variantid },
        { thumbnail: thumbnail_url }
      )
      console.log(`✅ Thumbnail set: ${thumbnail_url}`)
    }

    return res.status(200).json({ 
      success: true, 
      variant_id: variantid, 
      images_count: images.length 
    })
  } catch (err) {
    console.error("Error updating variant images:", err)
    return res.status(500).json({ message: err.message || "Internal server error" })
  }
}