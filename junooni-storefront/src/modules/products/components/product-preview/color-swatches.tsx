'use client'

import React, { useState } from "react"

const ColorSwatches: React.FC<{ product: any }> = ({ product }) => {
  const [showAll, setShowAll] = useState(false)

  // Extract color option values from product options
  const colorOption = product.options?.find(
    (opt: any) => opt.title?.toLowerCase() === "color"
  )
  const colorValues = colorOption?.values?.map((v: any) => v.value) || []

  // Parse color hex values from metadata
  const parsedHexColors: { name: string; hex: string }[] = Array.isArray(product.metadata?.color_hex_values)
    ? product.metadata.color_hex_values
    : (() => {
        try {
          return JSON.parse(product.metadata?.color_hex_values || "[]")
        } catch {
          return []
        }
      })()

  // Match color names from options with their hex value in metadata
  const mergedColors = colorValues.map((colorName: string) => {
    const match = parsedHexColors.find(
      (c) => c.name?.toLowerCase() === colorName.toLowerCase()
    )
    return {
      name: colorName,
      hex: match?.hex || "#000000"
    }
  })

  const visibleColors = showAll ? mergedColors : mergedColors.slice(0, 5)
  const hiddenCount = mergedColors.length - 5

  return (
    mergedColors.length > 0 && (
      <div className="pt-3 mt-auto pointer-events-auto">
        <ul className="flex flex-wrap items-center gap-x-1">
          {visibleColors.map((color, index) => (
            <li key={index}>
              <div
                className="w-6 h-6 transition-transform border border-gray-200 rounded-full shadow-sm cursor-pointer hover:scale-110"
                style={{ backgroundColor: color.hex }}
                title={color.name || "Unknown"}
              ></div>
            </li>
          ))}
          {!showAll && hiddenCount > 0 && (
            <li>
              <button
                className="flex items-center justify-center w-6 h-6 text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-100"
                onClick={() => setShowAll(true)}
                title="Show all colors"
              >
                +{hiddenCount}
              </button>
            </li>
          )}
        </ul>
      </div>
    )
  )
}

export default ColorSwatches
