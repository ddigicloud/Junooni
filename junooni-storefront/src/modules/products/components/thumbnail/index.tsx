// import React from "react"
// import PlaceholderImage from "@modules/common/icons/placeholder-image"

// type ThumbnailProps = {
//   thumbnail?: string | null
//   images?: any[] | null
//   size?: "small" | "medium" | "large" | "full" | "square"
//   isFeatured?: boolean
//   className?: string
//   "data-testid"?: string
// }

// const Thumbnail: React.FC<ThumbnailProps> = ({
//   thumbnail,
//   images,
//   size = "small",
//   isFeatured,
//   className,
//   "data-testid": dataTestid,
// }) => {
//   // Find the initial image to display - use thumbnail if available, otherwise the first image
//   const initialImage = thumbnail || images?.[0]?.url

//   return (
//     <div 
//       className={`w-full h-full ${className || ""}`}
//       data-testid={dataTestid}
//     >
//       {/* Primary image - fills the entire container using standard flow */}
//       {initialImage ? (
//         <img
//           src={initialImage}
//           alt="Product thumbnail"
//           className="object-cover object-center w-full h-full"
//           draggable={false}
//           loading="lazy"
//         />
//       ) : (
//         /* Placeholder when no image is available */
//         <div className="flex items-center justify-center w-full h-full bg-gray-100">
//           <PlaceholderImage size={size === "small" ? 16 : 24} />
//         </div>
//       )}
      
//       {/* Optional secondary image for hover effect - appears on hover */}
//       {images && images.length > 1 && (
//         <img
//           src={images[1].url}
//           alt="Product thumbnail hover"
//           className="absolute inset-0 object-cover object-center w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
//           draggable={false}
//           loading="lazy"
//         />
//       )}
//     </div>
//   )
// }

// export default Thumbnail

import React from "react"
import PlaceholderImage from "@modules/common/icons/placeholder-image"

type StoreImage = {
  id?: string
  url?: string
  variant_id?: string
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
  "data-testid": dataTestid,
}) => {
  // Parse variant metadata for URLs (robustly)
  const parseVariantUrlsFromMetadata = (): string[] | null => {
    if (!variantMetadata) return null

    try {
      // 1) `variant_images` often is a JSON string of urls
      const vImgs = variantMetadata.variant_images
      if (vImgs) {
        const parsed = typeof vImgs === "string" ? JSON.parse(vImgs) : vImgs
        if (Array.isArray(parsed) && parsed.length) {
          // ensure they are strings (URLs)
          return parsed.filter(Boolean).map(String)
        }
      }

      // 2) `variant_image_ids` -> map ids to product images array
      const vImgIds = variantMetadata.variant_image_ids
      if (vImgIds && images && images.length) {
        const parsedIds = typeof vImgIds === "string" ? JSON.parse(vImgIds) : vImgIds
        if (Array.isArray(parsedIds) && parsedIds.length) {
          const urls = images
            .filter((img) => img?.id && parsedIds.includes(img.id))
            .map((img) => img.url)
            .filter(Boolean)
          if (urls.length) return urls
        }
      }
    } catch (e) {
      // parsing might fail — ignore and fallback
      // console.warn("Failed to parse variant metadata", e)
    }

    return null
  }

  // Try to find variant-specific images and return array of image objects (with url)
  const getDisplayImages = (): StoreImage[] => {
    // 1. Try variant metadata urls
    const urlsFromMetadata = parseVariantUrlsFromMetadata()
    if (urlsFromMetadata && urlsFromMetadata.length) {
      // convert to object shape similar to product.images
      return urlsFromMetadata.map((u, idx) => ({ url: u, id: `variant-url-${idx}` }))
    }

    // 2. Try mapping images whose img.variant_id === variantId (some systems attach variant_id to images)
    if (variantId && images && images.length) {
      const variantImages = images.filter((img) => {
        // robust checks: top-level variant_id, metadata.variant_id, or nested metadata.variant?.id
        return (
          img.variant_id === variantId ||
          img.metadata?.variant_id === variantId ||
          (img.metadata?.variant && img.metadata.variant.id === variantId)
        )
      })
      if (variantImages.length) return variantImages
    }

    // 3. fallback to product images (if provided)
    if (images && images.length) return images

    // 4. nothing -> return empty array
    return []
  }

  const displayImages = getDisplayImages()

  // Prefer variant-derived image (displayImages[0]) over thumbnail; but keep thumbnail as last-resort
  const initialImage = displayImages?.[0]?.url || thumbnail || null

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

      {/* Hover / secondary image: requires parent to have `group` for `group-hover` to work.
          Display the 2nd image if available. */}
      {displayImages && displayImages.length > 1 && (
        <img
          src={displayImages[1].url}
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
