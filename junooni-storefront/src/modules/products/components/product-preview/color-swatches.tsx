// 'use client'

// import React, { useState } from "react"

// const ColorSwatches: React.FC<{ product: any }> = ({ product }) => {
//   const [showAll, setShowAll] = useState(false)

//   // Extract color option values from product options
//   const colorOption = product.options?.find(
//     (opt: any) => opt.title?.toLowerCase() === "color"
//   )
//   const colorValues = colorOption?.values?.map((v: any) => v.value) || []

//   // Parse color hex values from metadata
//   const parsedHexColors: { name: string; hex: string }[] = Array.isArray(product.metadata?.color_hex_values)
//     ? product.metadata.color_hex_values
//     : (() => {
//         try {
//           return JSON.parse(product.metadata?.color_hex_values || "[]")
//         } catch {
//           return []
//         }
//       })()

//   // Match color names from options with their hex value in metadata
//   const mergedColors = colorValues.map((colorName: string) => {
//     const match = parsedHexColors.find(
//       (c) => c.name?.toLowerCase() === colorName.toLowerCase()
//     )
//     return {
//       name: colorName,
//       hex: match?.hex || "#000000"
//     }
//   })

//   const visibleColors = showAll ? mergedColors : mergedColors.slice(0, 5)
//   const hiddenCount = mergedColors.length - 5

//   return (
//     mergedColors.length > 0 && (
//       <div className="pt-3 mt-auto pointer-events-auto">
//         <ul className="flex flex-wrap items-center gap-x-1">
//           {visibleColors.map((color, index) => (
//             <li key={index}>
//               <div
//                 className="w-6 h-6 transition-transform border border-gray-200 rounded-full shadow-sm cursor-pointer hover:scale-110"
//                 style={{ backgroundColor: color.hex }}
//                 title={color.name || "Unknown"}
//               ></div>
//             </li>
//           ))}
//           {!showAll && hiddenCount > 0 && (
//             <li>
//               <button
//                 className="flex items-center justify-center w-6 h-6 text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-100"
//                 onClick={() => setShowAll(true)}
//                 title="Show all colors"
//               >
//                 +{hiddenCount}
//               </button>
//             </li>
//           )}
//         </ul>
//       </div>
//     )
//   )
// }

// export default ColorSwatches


// components/color-swatches/index.tsx
"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type ColorSwatchesProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  onColorSelect?: (color: string) => void
  showSelected?: boolean
}

const ColorSwatches = ({ 
  product, 
  variant, 
  onColorSelect,
  showSelected = true 
}: ColorSwatchesProps) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  // Extract color options from product metadata
  const colors = (() => {
    const colorOptions = []
    
    // Check if metadata exists
    if (product.metadata) {
      // First, try to parse color_hex_values JSON
      if (product.metadata.color_hex_values) {
        try {
          const parsedColors = JSON.parse(product.metadata.color_hex_values)
          if (Array.isArray(parsedColors)) {
            return parsedColors.map(color => ({
              name: color.name.toLowerCase(),
              value: color.hex,
              label: color.name.charAt(0).toUpperCase() + color.name.slice(1)
            }))
          }
        } catch (e) {
          
        }
      }
      
  
    }
    
    return colorOptions
  })()

  // Don't render if no colors are available
  if (colors.length === 0) {
    return null
  }

  const handleColorClick = (colorName: string) => {
    setSelectedColor(colorName)
    onColorSelect?.(colorName)
  }

  return (
    <div className="pt-3 mt-auto">
      <div className="flex items-center gap-2">
        {colors.map((color) => (
          <button
            key={color.name}
            className={clx(
              "w-3 h-3 rounded-full border transition-all duration-200",
              "hover:scale-110 hover:border-gray-400",
              selectedColor === color.name && showSelected
                ? "border-2 border-gray-800 scale-110"
                : "border-gray-200",
              color.value === "#FFFFFF" && "shadow-sm" // Add shadow to white color
            )}
            style={{ backgroundColor: color.value }}
            title={color.label}
            onClick={() => handleColorClick(color.name)}
            aria-label={`Select ${color.label} color`}
          />
        ))}
      </div>
    </div>
  )
}

export default ColorSwatches