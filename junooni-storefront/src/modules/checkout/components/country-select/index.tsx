"use client"

import { useState, useEffect } from "react"
import { clx } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { ChevronDown } from "@medusajs/icons"

type CountrySelectProps = {
  region: HttpTypes.StoreRegion
  name: string
  required?: boolean
  autoComplete?: string
  defaultValue?: string
  className?: string
  "data-testid"?: string
}

const CountrySelect = ({
  region,
  name,
  required = false,
  autoComplete,
  defaultValue,
  className,
  "data-testid": testId,
  ...props
}: CountrySelectProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(
    defaultValue
  )

  const countries =
    region?.countries?.map((c) => ({
      value: c.iso_2,
      label: c.display_name,
    })) || []

  useEffect(() => {
    if (defaultValue) {
      setSelectedCountry(defaultValue)
    }
  }, [defaultValue])

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-1">
        <label
          htmlFor={name}
          className={clx("text-sm font-medium transition-colors", {
            "text-[#e65100]": isFocused,
            "text-gray-700": !isFocused,
          })}
        >
          Country
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
      </div>
      <div className="relative">
        <select
          name={name}
          autoComplete={autoComplete}
          defaultValue={selectedCountry}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={clx(
            "appearance-none w-full px-4 py-2.5 border rounded-md text-gray-900 text-base transition-all focus:outline-none",
            {
              "border-[#e65100] ring-1 ring-[#e65100]/20": isFocused,
              "border-ui-border-base": !isFocused,
            },
            className
          )}
          data-testid={testId}
          {...props}
        >
          <option value="">Select a country</option>
          {countries.map((country, index) => (
            <option key={index} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    </div>
  )
}

export default CountrySelect
