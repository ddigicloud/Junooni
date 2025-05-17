// "use client"

// import ColorSelector from "@modules/store/components/color-selector"
// import { useMemo } from "react"
// import { HttpTypes } from "@medusajs/types"

// type ColorFilterProps = {
//   selectedColors: string[]
//   collection?: HttpTypes.StoreProduct[] // Array of products
//   setQueryParams: (name: string, value: string) => void
//   "data-testid"?: string
// }

// const ColorFilter = ({
//   selectedColors,
//   collection = [],
//   setQueryParams,
//   "data-testid": dataTestId,
// }: ColorFilterProps) => {
//   // Extract dynamic colors from product metadata
//   const colorOptions = useMemo(() => {
//     // If collection is not an array or is empty, return empty array
//     if (!Array.isArray(collection) || collection.length === 0) {
//       return [];
//     }
    
//     // Use Map to ensure uniqueness of colors
//     const colorMap = new Map();
    
//     // Process each product in the collection
//     collection.forEach(product => {
//       if (product.metadata) {
//         // First, try to parse color_hex_values JSON
//         if (product.metadata.color_hex_values) {
//           try {
//             const parsedColors = JSON.parse(product.metadata.color_hex_values);
//             if (Array.isArray(parsedColors)) {
//               parsedColors.forEach(color => {
//                 if (color && color.name && color.hex) {
//                   colorMap.set(color.name.toLowerCase(), {
//                     value: color.name.toLowerCase(),
//                     label: color.name.charAt(0).toUpperCase() + color.name.slice(1),
//                     color: color.hex
//                   });
//                 }
//               });
//             }
//           } catch (e) {
//             console.error('Failed to parse color_hex_values:', e);
//           }
//         }
        
    
//       }
      
//       // Check product variant options for color info
//       if (product.options) {
//         const colorOptions = product.options.filter(option => 
//           option.title.toLowerCase() === "color"
//         );
        
//         colorOptions.forEach(option => {
//           if (option.values) {
//             option.values.forEach(value => {
//               if (value.value) {
//                 const colorName = value.value.toLowerCase();
//                 colorMap.set(colorName, {
//                   value: colorName,
//                   label: value.value, // Use original value for label
//                   color: "#000000" // Default color if not specified
//                 });
//               }
//             });
//           }
//         });
//       }
//     });
    
//     // Convert map to array for component consumption and sort alphabetically
//     return Array.from(colorMap.values()).sort((a, b) => a.label.localeCompare(b.label));
//   }, [collection]);

//   const handleChange = (values: string[]) => {
//     if (values.length > 0) {
//       // Join multiple selected colors with comma
//       setQueryParams("colors", values.join(","));
//     } else {
//       // If no colors selected, remove the parameter
//       setQueryParams("colors", "");
//     }
//   };

//   // Only render the color selector if there are color options available
//   if (colorOptions.length === 0) {
//     return null;
//   }

//   return (
//     <ColorSelector
//       title="Colors"
//       items={colorOptions}
//       values={selectedColors}
//       handleChange={handleChange}
//       data-testid={dataTestId}
//     />
//   );
// };

// export default ColorFilter;



// @modules/store/components/color-filter/index.tsx
"use client"

import { useCallback } from "react"

type ColorFilterProps = {
  availableColors?: string[]
  selectedColors?: string[]
  setQueryParams: (name: string, value: string) => void
  'data-testid'?: string
}

const ColorFilter = ({ 
  availableColors = [], 
  selectedColors = [], 
  setQueryParams, 
  'data-testid': dataTestId 
}: ColorFilterProps) => {
  // Color mapping for common color names
  const colorMap: Record<string, string> = {
    "black": "bg-black",
    "white": "bg-white border border-gray-300",
    "gray": "bg-gray-400",
    "red": "bg-red-600",
    "blue": "bg-blue-600",
    "green": "bg-green-600",
    "yellow": "bg-yellow-400",
    "purple": "bg-purple-600",
    "pink": "bg-pink-500",
    "orange": "bg-orange-500",
    "brown": "bg-amber-800",
    "navy": "bg-indigo-900",
    "beige": "bg-amber-100 border border-gray-300",
  }

  if (!availableColors || availableColors.length === 0) {
    return null
  }

  const toggleColor = (colorName: string) => {
    if (selectedColors.includes(colorName)) {
      // Remove color
      const newColors = selectedColors.filter(c => c !== colorName).join(",")
      setQueryParams("colors", newColors)
    } else {
      // Add color
      const newColors = [...selectedColors, colorName].join(",")
      setQueryParams("colors", newColors)
    }
  }

  return (
    <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
      {availableColors.map((colorName) => {
        const isSelected = selectedColors.includes(colorName)
        const bgColorClass = colorMap[colorName.toLowerCase()] || "bg-gray-300"
        
        return (
          <button
            key={colorName}
            onClick={() => toggleColor(colorName)}
            className={`w-7 h-7 rounded-full ${bgColorClass} flex items-center justify-center transition-transform ${isSelected ? 'ring-2 ring-offset-1 ring-pink-500 scale-110' : ''}`}
            title={colorName.charAt(0).toUpperCase() + colorName.slice(1)}
            aria-label={`Filter by ${colorName} color`}
            data-testid={`color-${colorName}`}
          >
            {isSelected && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" 
                className={`${colorName.toLowerCase() === 'white' || colorName.toLowerCase() === 'yellow' || colorName.toLowerCase() === 'beige' ? 'text-black' : 'text-white'}`}>
                <path d="M5 12L10 17L19 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        )
      })}
      
      {selectedColors.length > 0 && (
        <button 
          onClick={() => setQueryParams("colors", "")}
          className="text-xs text-pink-600 font-medium ml-2 hover:underline" 
          aria-label="Clear color selection"
        >
          Clear
        </button>
      )}
    </div>
  )
}

export default ColorFilter