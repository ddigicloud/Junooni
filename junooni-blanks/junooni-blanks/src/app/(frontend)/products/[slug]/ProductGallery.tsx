'use client'

import React, { useState } from 'react'

interface DisplayImage {
  id: string
  image: {
    url: string
    sizes?: {
      large?: { url: string }
      thumbnail?: { url: string }
    }
  }
}

interface ProductGalleryProps {
  displayImages: DisplayImage[]
  productName: string
}

export default function ProductGallery({ displayImages, productName }: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  return (
    <div className="space-y-4">
      {/* Main Image */}
      {displayImages.length > 0 && displayImages[selectedImageIndex]?.image ? (
        <div className="relative w-full overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-2xl" style={{ paddingBottom: '125%' }}>
          <img
            src={displayImages[selectedImageIndex].image.sizes?.large?.url || displayImages[selectedImageIndex].image.url}
            alt={`${productName} - View ${selectedImageIndex + 1}`}
            className="absolute inset-0 object-cover w-full h-full"
          />
        </div>
      ) : (
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl" style={{ paddingBottom: '125%' }}>
          <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold" style={{ color: '#e65100' }}>
            {productName.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Thumbnail Gallery */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {displayImages.map((img: DisplayImage, index: number) => (
            <div
              key={img.id || index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative overflow-hidden bg-gray-100 border-2 cursor-pointer aspect-square dark:bg-gray-800 rounded-lg hover:border-orange-500 transition-all ${
                selectedImageIndex === index 
                  ? 'border-orange-500 ring-2 ring-orange-200' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {img.image?.url && (
                <img
                  src={img.image.sizes?.thumbnail?.url || img.image.url}
                  alt={`${productName} view ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}