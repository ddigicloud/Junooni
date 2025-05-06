"use client"

import FilterCheckboxGroup from "@modules/store/components/filter-checkbox"

type VendorFilterProps = {
  vendors: {
    value: string
    label: string
  }[]
  selectedVendors: string[]
  setQueryParams: (name: string, value: string) => void
  "data-testid"?: string
}

const VendorFilter = ({
  vendors,
  selectedVendors,
  setQueryParams,
  "data-testid": dataTestId,
}: VendorFilterProps) => {
  const handleChange = (values: string[]) => {
    setQueryParams("vendors", values.join(","))
  }

  return (
    <FilterCheckboxGroup
      title="Vendors"
      items={vendors}
      values={selectedVendors}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default VendorFilter