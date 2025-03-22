import React from "react"
import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: any[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  className,
  "data-testid": dataTestid,
}) => {
  // Find the initial image to display - use thumbnail if available, otherwise the first image
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <div 
      className={`w-full h-full ${className || ""}`}
      data-testid={dataTestid}
    >
      {/* Primary image - fills the entire container using standard flow */}
      {initialImage ? (
        <img
          src={initialImage}
          alt="Product thumbnail"
          className="object-cover object-center w-full h-full"
          draggable={false}
          loading="lazy"
        />
      ) : (
        /* Placeholder when no image is available */
        <div className="flex items-center justify-center w-full h-full bg-gray-100">
          <PlaceholderImage size={size === "small" ? 16 : 24} />
        </div>
      )}
      
      {/* Optional secondary image for hover effect - appears on hover */}
      {images && images.length > 1 && (
        <img
          src={images[1].url}
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