// "use client"

// import FilterRadioGroup from "@modules/common/components/filter-radio-group"

// export type SortOptions = "price_asc" | "price_desc" | "created_at"

// type SortProductsProps = {
//   sortBy: SortOptions
//   setQueryParams: (name: string, value: SortOptions) => void
//   "data-testid"?: string
// }

// const sortOptions = [
//   {
//     value: "created_at",
//     label: "Latest Arrivals",
//   },
//   {
//     value: "price_asc",
//     label: "Price: Low -> High",
//   },
//   {
//     value: "price_desc",
//     label: "Price: High -> Low",
//   },
// ]

// const SortProducts = ({
//   "data-testid": dataTestId,
//   sortBy,
//   setQueryParams,
// }: SortProductsProps) => {
//   const handleChange = (value: SortOptions) => {
//     setQueryParams("sortBy", value)
//   }

//   return (
//     <FilterRadioGroup
//       title="Sort by"
//       items={sortOptions}
//       value={sortBy}
//       handleChange={handleChange}
//       data-testid={dataTestId}
//     />
//   )
// }

// export default SortProducts
"use client"

import { useState } from "react"
import { ChevronDown, Check } from "lucide-react"
import clsx from "clsx"
import { Button } from "@medusajs/ui"
import { SortOptions } from "./sort-products"

export type { SortOptions }

const options: { label: string; value: SortOptions }[] = [
  { label: "Recommended", value: "created_at" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A-Z", value: "name_asc" },
  { label: "Name: Z-A", value: "name_desc" },
]

type Props = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: string) => void
  "data-testid"?: string
}

const SortProducts = ({ sortBy, setQueryParams, "data-testid": dataTestId }: Props) => {
  const [open, setOpen] = useState(false)

  const current = options.find((o) => o.value === sortBy)

  return (
    <div className="relative inline-block text-left" data-testid={dataTestId}>
      <Button
        variant="secondary"
        size="small"
        className="flex items-center gap-2 w-[204px] justify-between rounded-none border shadow-none ml-0"
        onClick={() => setOpen((prev) => !prev)}
      >
        Sort by : {current?.label}
        <ChevronDown className="w-4 h-4" />
      </Button>

      {open && (
        <div className="absolute z-20 mt-2 w-[200px] bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option.value}
                className={clsx(
                  "cursor-pointer px-4 py-2 flex items-center justify-between transition-colors",
                  {
                    "bg-gray-100 font-semibold": sortBy === option.value,
                  }
                )}
                onClick={() => {
                  setQueryParams("sortBy", option.value)
                  setOpen(false)
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e65100"
                  e.currentTarget.style.color = "white"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    sortBy === option.value ? "#f3f4f6" : "white"
                  e.currentTarget.style.color = "black"
                }}
              >
                {option.label}
                {sortBy === option.value && <Check className="w-4 h-4 text-white" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SortProducts
