"use client"

import PriceRangeSlider from "@modules/store/components/price-range-slider"

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
  const handleChange = (minValue: number, maxValue: number) => {
    //console.log("🎯 PriceFilter handleChange called:", { minValue, maxValue, fullRange: { min, max } })
    
    // Check if user has set a custom range (different from full range)
    const hasCustomRange = minValue > min || maxValue < max
    
    if (hasCustomRange) {
      //console.log("✅ Setting custom price range:", `${minValue} - ${maxValue}`)
      
      // ✅ FIX: Set BOTH formats to support filtering AND applied filters display
      
      // 1. Separate parameters for StoreTemplate filtering
      setQueryParams("minPrice", minValue.toString())
      setQueryParams("maxPrice", maxValue.toString())
      
      // 2. Combined parameter for Applied Filters display
      setQueryParams("price", `${minValue}-${maxValue}`)
      
      // console.log("🔄 Query params set:", { 
      //   minPrice: minValue.toString(), 
      //   maxPrice: maxValue.toString(),
      //   price: `${minValue}-${maxValue}` 
      // })
    } else {
      //console.log("❌ Removing price filter (full range selected)")
      
      // ✅ FIX: Remove ALL price parameters when full range is selected
      setQueryParams("minPrice", "")
      setQueryParams("maxPrice", "")
      setQueryParams("price", "")
      
      //console.log("🔄 All price filters removed from query params")
    }
  }

  return (
    <PriceRangeSlider
      minPrice={min}
      maxPrice={max}
      currentMin={currentMin}
      currentMax={currentMax}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default PriceFilter
