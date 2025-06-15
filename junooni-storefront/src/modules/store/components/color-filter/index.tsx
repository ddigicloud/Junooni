"use client"

import { useMemo, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Check } from "lucide-react"

type Color = {
  name: string
  hex: string
}

type ColorOption = {
  value: string
  label: string
  color: string
  count: number
}

type ColorFilterProps = {
  selectedColors: string[]
  collection?: HttpTypes.StoreProduct[]
  availableColors?: Color[]
  setQueryParams: (name: string, value: string) => void
  "data-testid"?: string
}

const ColorFilter = ({
  selectedColors,
  collection = [],
  availableColors,
  setQueryParams,
  "data-testid": dataTestId,
}: ColorFilterProps) => {
  const [showAll, setShowAll] = useState(false)
  const initialLimit = 7 // Show 7 colors initially

  // ✅ NEW: Color name normalizer to fix spacing issues
  const normalizeColorName = (colorName: string): string => {
  console.log(`🔍 Normalizing color: "${colorName}"`)
  
  const result = colorName
    .trim()
    // Handle various patterns more robustly
    .replace(/([a-z])([A-Z])/g, '$1 $2')           // "lightPink" → "light Pink"
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')      // "HTMLParser" → "HTML Parser"  
    .replace(/([a-z])(\d)/g, '$1 $2')              // "red2" → "red 2"
    .replace(/(\d)([a-z])/gi, '$1 $2')             // "2red" → "2 red"
    // ✅ NEW: Handle concatenated color words (the real fix!)
    .replace(/([a-z])(pink|blue|red|green|yellow|purple|orange|black|white|gray|grey|brown)/gi, '$1 $2')
    .replace(/(light|dark|bright|deep|pale|neon|hot|cool|warm)([a-z])/gi, '$1 $2')
    // Normalize spaces
    .replace(/\s+/g, ' ')
    // Proper case
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  console.log(`🎨 Result: "${colorName}" → "${result}"`)
  return result;
}
  // Extract dynamic colors from product metadata or use provided colors
  const colorOptions = useMemo(() => {
    console.log('\n🎨 Professional ColorFilter: Computing color options...')
    console.log('- availableColors prop:', availableColors)
    console.log('- collection length:', collection?.length)

    // Count products for each color
    const colorCountMap = new Map<string, number>()
    const colorDataMap = new Map<string, { name: string; hex: string }>()

    // ✅ PRIORITY 1: Use availableColors prop if provided
    if (availableColors && availableColors.length > 0) {
      console.log('✅ Professional ColorFilter: Using availableColors prop')
      
      // Initialize color data from prop
      availableColors.forEach(color => {
        colorDataMap.set(color.name.toLowerCase(), {
          name: normalizeColorName(color.name), // ✅ FIXED: Normalize from the start
          hex: color.hex
        })
      })
    }

    // Count products for each color by scanning the collection
    if (Array.isArray(collection) && collection.length > 0) {
      console.log('📊 Counting products for each color...')
      
      collection.forEach((product, index) => {
        if (product.metadata?.color_hex_values) {
          let colorsData = product.metadata.color_hex_values
          
          // Handle both string and array formats
          if (typeof colorsData === 'string') {
            try {
              colorsData = JSON.parse(colorsData)
            } catch (e) {
              console.error('JSON parse failed for product:', product.title, e)
              return
            }
          }
          
          if (Array.isArray(colorsData)) {
            colorsData.forEach(color => {
              if (color?.name && color?.hex) {
                const colorKey = color.name.toLowerCase()
                
                // Add to color data if not from prop
                if (!colorDataMap.has(colorKey)) {
                  let cleanHex = color.hex.trim()
                  if (!cleanHex.startsWith('#')) {
                    cleanHex = '#' + cleanHex
                  }
                  
                  if (/^#[0-9A-F]{6}$/i.test(cleanHex)) {
                    colorDataMap.set(colorKey, {
                      name: normalizeColorName(color.name), // ✅ FIXED: Normalize from metadata too
                      hex: cleanHex
                    })
                  }
                }
                
                // Count products with this color
                colorCountMap.set(colorKey, (colorCountMap.get(colorKey) || 0) + 1)
              }
            })
          }
        }
      })
    }

    // Convert to ColorOption format with counts
    const options: ColorOption[] = []
    
    colorDataMap.forEach((colorData, colorKey) => {
      const count = colorCountMap.get(colorKey) || 0
      
      // ✅ NEW: Only include colors with count > 0
      if (count > 0) {
        options.push({
          value: colorKey,
          label: colorData.name, // ✅ FIXED: Already normalized, no need for additional processing
          color: colorData.hex,
          count: count
        })
      }
    })

    // Sort by count (descending) then by name
    const sortedOptions = options.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count // Higher count first
      }
      return a.label.localeCompare(b.label) // Alphabetical for same count
    })

    console.log('🎨 Professional ColorFilter: Final color options (filtered for count > 0):')
    sortedOptions.forEach((option, index) => {
      console.log(`  ${index + 1}. ${option.label} (${option.count}) -> ${option.color}`)
    })

    return sortedOptions
  }, [collection, availableColors])

  const displayedColors = showAll ? colorOptions : colorOptions.slice(0, initialLimit)
  const remainingCount = colorOptions.length - initialLimit

  const handleColorToggle = (colorValue: string) => {
    console.log('🎨 Professional ColorFilter: Toggling color:', colorValue)
    console.log('- Current selectedColors:', selectedColors)
    
    let newSelectedColors: string[]
    
    if (selectedColors.includes(colorValue)) {
      // Remove color
      newSelectedColors = selectedColors.filter(c => c !== colorValue)
      console.log('  → Removing color')
    } else {
      // Add color
      newSelectedColors = [...selectedColors, colorValue]
      console.log('  → Adding color')
    }
    
    console.log('- New selectedColors:', newSelectedColors)
    
    // Update URL params
    const colorsString = newSelectedColors.length > 0 ? newSelectedColors.join(',') : ''
    console.log('- Setting colors param to:', colorsString)
    setQueryParams('colors', colorsString)
  }

  // Only render if there are color options available
  if (colorOptions.length === 0) {
    console.log('❌ Professional ColorFilter: No color options available')
    return null
  }

  console.log('✅ Professional ColorFilter: Rendering with', colorOptions.length, 'total colors (all with count > 0)')

  return (
    <div className="space-y-3" data-testid={dataTestId}>
      {/* Color list with checkboxes */}
      <div className="space-y-2">
        {displayedColors.map((option) => {
          const isSelected = selectedColors.includes(option.value)
          
          return (
            <button
              key={option.value}
              onClick={() => handleColorToggle(option.value)}
              className="flex items-center w-full gap-2 p-0 text-left transition-colors duration-150 rounded hover:bg-gray-50 group"
              aria-label={`Filter by ${option.label} color (${option.count} products)`}
            >
              {/* HTML Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleColorToggle(option.value)}
                className="w-4 h-4 rounded transition-all duration-200 accent-[#e65100] cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Color Circle */}
              <div
                className="flex-shrink-0 w-4 h-4 border border-gray-200 rounded-full"
                style={{ backgroundColor: option.color }}
                title={`${option.label} - ${option.color}`}
              >
                {/* Special handling for white/light colors to show border */}
                {(option.color === '#FFFFFF' || option.color === '#ffffff' || 
                  option.label.toLowerCase().includes('white')) && (
                  <div className="w-full h-full border border-gray-300 rounded-full"></div>
                )}
              </div>

              {/* Color Name and Count */}
              <div className="flex-grow min-w-0">
                <span className="-ml-1 text-sm text-black-900 font-small">
                {/* ✅ DOUBLE SAFEGUARD: Use normalization in render too */}
                {normalizeColorName(option.label)}
              </span>
                <span className="ml-1 text-sm text-gray-500">
                  ({option.count.toLocaleString()})
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Show more/less button */}
      {colorOptions.length > initialLimit && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-[#e65100] hover:text-[#bf3f00] font-medium transition-colors duration-200 flex items-center gap-1"
        >
          {showAll ? (
            <>
              <span>Show less</span>
            </>
          ) : (
            <>
              <span className="text-[#e65100]">+</span>
              <span>{remainingCount} more</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}

export default ColorFilter