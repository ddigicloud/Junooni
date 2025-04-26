// components/brand-filter/index.tsx
"use client"

import FilterCheckboxGroup from "@modules/store/components/filter-checkbox"

type BrandFilterProps = {
  brands: {
    value: string
    label: string
  }[]
  selectedBrands: string[]
  setQueryParams: (name: string, value: string) => void
  "data-testid"?: string
}

const BrandFilter = ({
  brands,
  selectedBrands,
  setQueryParams,
  "data-testid": dataTestId,
}: BrandFilterProps) => {
  const handleChange = (values: string[]) => {
    setQueryParams("brands", values.join(","))
  }

  return (
    <FilterCheckboxGroup
      title="Brands"
      items={brands}
      values={selectedBrands}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default BrandFilter