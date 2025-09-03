"use client"

import { useState, useMemo } from "react"
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
  
  // ✅ Filter out "All vendors" and other "all" options
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Remove "All vendors", "All categories", "All" options and any empty values
      const isAllOption = 
        item.value === '' || 
        item.value === 'all' ||
        item.value === 'all-vendors' ||
        item.value === 'all-categories' ||
        item.value === 'all-colors' ||
        item.label.toLowerCase().includes('all vendors') ||
        item.label.toLowerCase().includes('all categories') ||
        item.label.toLowerCase().includes('all colors') ||
        item.label.toLowerCase().includes('all') ||
        item.label === ''
      
      return !isAllOption
    })
  }, [items])

  //console.log('🔍 FilterCheckboxGroup Debug:')
  //console.log('- Title:', title)
  //console.log('- Original items:', items)
  //console.log('- Filtered items:', filteredItems)

  const toggleItem = (item: string) => {
    if (values.includes(item)) {
      handleChange(values.filter((v) => v !== item))
    } else {
      handleChange([...values, item])
    }
  }

  // Don't render if no valid items after filtering
  if (!filteredItems || filteredItems.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-x-3 gap-y-3">
      {/* <Text className="text-black txt-compact-small-plus">{title}</Text> */}
      <div className="flex flex-col gap-y-2" data-testid={dataTestId}>
        {filteredItems?.map((i) => (
          <div key={i.value} className="flex items-center gap-x-2">
            <input
              type="checkbox"
              id={`${title.toLowerCase()}-${i.value}`}
              checked={values.includes(i.value)}
              onChange={() => toggleItem(i.value)} 
              className="w-4 h-4"
            />
            <Label
              htmlFor={`${title.toLowerCase()}-${i.value}`}
              className="!txt-compact-small !transform-none text-black hover:cursor-pointer"
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