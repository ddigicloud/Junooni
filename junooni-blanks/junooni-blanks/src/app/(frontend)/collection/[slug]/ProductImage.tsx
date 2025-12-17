'use client'

import { useState } from 'react'

interface ProductImageProps {
  imageUrl: string | null
  productName: string
  className?: string
}

export default function ProductImage({ imageUrl, productName, className }: ProductImageProps) {
  const [hasError, setHasError] = useState(false)

  if (!imageUrl || hasError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold" style={{ color: '#e65100' }}>
        {productName.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={productName}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setHasError(true)}
    />
  )
}