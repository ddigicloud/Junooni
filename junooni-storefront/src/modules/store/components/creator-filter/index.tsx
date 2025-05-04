"use client"

import FilterCheckboxGroup from "@modules/store/components/filter-checkbox"

type CreatorFilterProps = {
  creators: {
    value: string
    label: string
  }[]
  selectedCreators: string[]
  setQueryParams: (name: string, value: string) => void
  "data-testid"?: string
}

const CreatorFilter = ({
  creators,
  selectedCreators,
  setQueryParams,
  "data-testid": dataTestId,
}: CreatorFilterProps) => {
  const handleChange = (values: string[]) => {
    console.log("Selected creators:", values)
    // Join the creator IDs with commas
    setQueryParams("creators", values.join(","))
  }

  return (
    <FilterCheckboxGroup
      title="Creators"
      items={creators}
      values={selectedCreators}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default CreatorFilter