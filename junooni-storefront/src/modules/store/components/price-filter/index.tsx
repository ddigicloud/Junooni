// "use client"

// import PriceRangeSlider from "@modules/store/components/price-range-slider"

// type PriceFilterProps = {
//   min: number
//   max: number
//   currentMin: number
//   currentMax: number
//   setQueryParams: (name: string, value: string) => void
//   "data-testid"?: string
// }

// const PriceFilter = ({
//   min,
//   max,
//   currentMin,
//   currentMax,
//   setQueryParams,
//   "data-testid": dataTestId,
// }: PriceFilterProps) => {
//   const handleChange = (minValue: number, maxValue: number) => {
//     // Only add price filter if it's different from the full range
//     if (minValue > min || maxValue < max) {
//       setQueryParams("price", `${minValue}-${maxValue}`)
//     } else {
//       // If full range is selected, remove the price filter
//       setQueryParams("price", "")
//     }
//   }

//   return (
//     <PriceRangeSlider
//       minPrice={min}
//       maxPrice={max}
//       currentMin={currentMin}
//       currentMax={currentMax}
//       handleChange={handleChange}
//       data-testid={dataTestId}
//     />
//   )
// }

// export default PriceFilter

"use client"

import { useState, useEffect } from "react"

type PriceFilterProps = {
  min: number
  max: number
  currentMin: number
  currentMax: number
  setQueryParams: (name: string, value: string) => void
  "data-testid"?: string
}

const PriceFilter = ({
  min,
  max,
  currentMin,
  currentMax,
  setQueryParams,
  "data-testid": dataTestId,
}: PriceFilterProps) => {
  const [localMin, setLocalMin] = useState<number>(currentMin || min)
  const [localMax, setLocalMax] = useState<number>(currentMax || max)
  
  // Update local state when props change
  useEffect(() => {
    setLocalMin(currentMin || min)
    setLocalMax(currentMax || max)
  }, [currentMin, currentMax, min, max])
  
  // Apply price filter
  const applyPriceFilter = () => {
    // Validate input
    const validMin = Math.max(min, Math.min(localMin, localMax))
    const validMax = Math.min(max, Math.max(localMax, localMin))
    
    // Only add filter if values are different from the default range
    if (validMin > min || validMax < max) {
      setQueryParams("price", `${validMin}-${validMax}`)
    } else {
      // If full range is selected, remove the filter
      setQueryParams("price", "")
    }
  }
  
  // Myntra-style price ranges
  const priceRanges = [
    { label: `Rs. ${min} to Rs. 499`, min: min, max: 499 },
    { label: 'Rs. 500 to Rs. 999', min: 500, max: 999 },
    { label: 'Rs. 1000 to Rs. 1999', min: 1000, max: 1999 },
    { label: 'Rs. 2000 to Rs. 4999', min: 2000, max: 4999 },
    { label: `Rs. 5000 and above`, min: 5000, max: max }
  ];
  
  // Check which range is selected
  const isRangeSelected = (rangeMin: number, rangeMax: number) => {
    return currentMin === rangeMin && currentMax === rangeMax;
  }
  
  return (
    <div className="space-y-3" data-testid={dataTestId}>
      {/* Myntra-style predefined price ranges */}
      <div className="space-y-2">
        {priceRanges.map((range, index) => (
          <label 
            key={index} 
            className="flex items-center py-1.5 cursor-pointer group"
            onClick={() => {
              setLocalMin(range.min);
              setLocalMax(range.max);
              setQueryParams("price", `${range.min}-${range.max}`);
            }}
          >
            <input
              type="checkbox"
              className="w-4 h-4 mr-3 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
              checked={isRangeSelected(range.min, range.max)}
              readOnly
            />
            <span className={`text-sm ${isRangeSelected(range.min, range.max) ? "text-gray-900 font-medium" : "text-gray-600"}`}>
              {range.label}
            </span>
          </label>
        ))}
      </div>
      
      {/* Custom price range inputs */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
        <input
          type="number"
          min={min}
          max={localMax}
          value={localMin}
          onChange={(e) => setLocalMin(parseInt(e.target.value) || min)}
          onBlur={applyPriceFilter}
          placeholder="Min"
          className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-pink-500 focus:border-pink-500"
        />
        <span className="text-gray-400">to</span>
        <input
          type="number"
          min={localMin}
          max={max}
          value={localMax}
          onChange={(e) => setLocalMax(parseInt(e.target.value) || max)}
          onBlur={applyPriceFilter}
          placeholder="Max"
          className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:ring-pink-500 focus:border-pink-500"
        />
      </div>
    </div>
  )
}

export default PriceFilter