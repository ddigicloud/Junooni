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
    // Only add price filter if it's different from the full range
    if (minValue > min || maxValue < max) {
      setQueryParams("price", `${minValue}-${maxValue}`)
    } else {
      // If full range is selected, remove the price filter
      setQueryParams("price", "")
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