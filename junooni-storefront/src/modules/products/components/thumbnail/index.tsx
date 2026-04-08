import React from "react"
import PlaceholderImage from "@modules/common/icons/placeholder-image"

type StoreImage = {
  id?: string
  url?: string
  variant_id?: string
  variants?: { id: string }[]
  metadata?: Record<string, any> | null
  [k: string]: any
}

type ThumbnailProps = {
  thumbnail?: string | null
  images?: StoreImage[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  variantMetadata?: Record<string, any> | null
  variantId?: string | null
  variantThumbnail?: string | null
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images = [],
  size = "small",
  isFeatured,
  className,
  variantId,
  variantMetadata,
  variantThumbnail,
  "data-testid": dataTestid,
}) => {
  const getDisplayImages = (): StoreImage[] => {
    // 1. PRIORITY: Native variant images (Medusa v2.11.2+)
    // img.variants[] contains associated variant IDs
    if (variantId && images && images.length) {
      const variantImages = images.filter((img) => {
        if (img.variants && Array.isArray(img.variants)) {
          return img.variants.some((v) => v.id === variantId)
        }
        return false
      })
      if (variantImages.length) return variantImages
    }

    // 2. Legacy: metadata-based variant_images
    if (variantMetadata) {
      try {
        const vImgs = variantMetadata.variant_images
        if (vImgs) {
          const parsed = typeof vImgs === "string" ? JSON.parse(vImgs) : vImgs
          if (Array.isArray(parsed) && parsed.length) {
            return parsed
              .filter(Boolean)
              .map((u: string, idx: number) => ({
                url: u,
                id: `variant-url-${idx}`,
              }))
          }
        }

        // Legacy: variant_image_ids -> map to product images
        const vImgIds = variantMetadata.variant_image_ids
        if (vImgIds && images && images.length) {
          const parsedIds =
            typeof vImgIds === "string" ? JSON.parse(vImgIds) : vImgIds
          if (Array.isArray(parsedIds) && parsedIds.length) {
            const matched = images
              .filter((img) => img?.id && parsedIds.includes(img.id))
            if (matched.length) return matched
          }
        }
      } catch {
        // ignore parse errors
      }
    }

    // 3. Fallback: all product images
    if (images && images.length) return images

    return []
  }

  const displayImages = getDisplayImages()

  // Priority: variantThumbnail (native) > first matched image > product thumbnail
  const initialImage =
    variantThumbnail || displayImages?.[0]?.url || thumbnail || null

  const hoverImage = displayImages?.[1]?.url || null

  return (
    <div
      className={`relative w-full h-full ${className || ""}`}
      data-testid={dataTestid}
    >
      {initialImage ? (
        <img
          src={initialImage}
          alt="Product thumbnail"
          className="object-cover object-center w-full h-full"
          draggable={false}
          loading="lazy"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-100">
          <PlaceholderImage size={size === "small" ? 16 : 24} />
        </div>
      )}

      {hoverImage && (
        <img
          src={hoverImage}
          alt="Product thumbnail hover"
          className="absolute inset-0 object-cover object-center w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          draggable={false}
          loading="lazy"
        />
      )}
    </div>
  )
}

export default Thumbnail