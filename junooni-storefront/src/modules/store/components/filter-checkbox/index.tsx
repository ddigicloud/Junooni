"use client"

import { useState } from "react"
import { Checkbox, Label, Text } from "@medusajs/ui"

type FilterCheckboxGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  values: string[]
  handleChange: (values: string[]) => void
  "data-testid"?: string
}

const FilterCheckboxGroup = ({
  title,
  items,
  values,
  handleChange,
  "data-testid": dataTestId,
}: FilterCheckboxGroupProps) => {
  const toggleItem = (item: string) => {
    // Create a new array to avoid reference issues
    let newValues = [...values]
    
    if (values.includes(item)) {
      // Remove item if already selected
      newValues = newValues.filter((v) => v !== item)
    } else {
      // Add item if not selected
      newValues.push(item)
    }
    
    // Update parent component with new values
    handleChange(newValues)
  }

  return (
    <div className="flex flex-col gap-x-3 gap-y-3">
      <Text className="txt-compact-small-plus text-ui-fg-muted">{title}</Text>
      <div className="flex flex-col gap-y-2" data-testid={dataTestId}>
        {items?.map((i) => (
          <div key={i.value} className="flex items-center gap-x-2">
            <Checkbox
              id={`${title.toLowerCase()}-${i.value}`}
              checked={values.includes(i.value)}
              onCheckedChange={() => toggleItem(i.value)}
            />
            <Label
              htmlFor={`${title.toLowerCase()}-${i.value}`}
              className="!txt-compact-small !transform-none text-ui-fg-subtle hover:cursor-pointer"
              data-testid="checkbox-label"
            >
              {i.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FilterCheckboxGroup