// import { EllipseMiniSolid } from "@medusajs/icons"
// import { Label, RadioGroup, Text, clx } from "@medusajs/ui"

// type FilterRadioGroupProps = {
//   title: string
//   items: {
//     value: string
//     label: string
//   }[]
//   value: any
//   handleChange: (...args: any[]) => void
//   "data-testid"?: string
// }

// const FilterRadioGroup = ({
//   title,
//   items,
//   value,
//   handleChange,
//   "data-testid": dataTestId,
// }: FilterRadioGroupProps) => {
//   return (
//     <div className="flex gap-x-3 flex-col gap-y-3">
//       <Text className="txt-compact-small-plus text-ui-fg-muted">{title}</Text>
//       <RadioGroup data-testid={dataTestId} onValueChange={handleChange}>
//         {items?.map((i) => (
//           <div
//             key={i.value}
//             className={clx("flex gap-x-2 items-center", {
//               "ml-[-23px]": i.value === value,
//             })}
//           >
//             {i.value === value && <EllipseMiniSolid />}
//             <RadioGroup.Item
//               checked={i.value === value}
//               className="hidden peer"
//               id={i.value}
//               value={i.value}
//             />
//             <Label
//               htmlFor={i.value}
//               className={clx(
//                 "!txt-compact-small !transform-none text-ui-fg-subtle hover:cursor-pointer",
//                 {
//                   "text-ui-fg-base": i.value === value,
//                 }
//               )}
//               data-testid="radio-label"
//               data-active={i.value === value}
//             >
//               {i.label}
//             </Label>
//           </div>
//         ))}
//       </RadioGroup>
//     </div>
//   )
// }

// export default FilterRadioGroup


"use client"

import { RadioGroup } from "@headlessui/react"
import { Text } from "@medusajs/ui"

type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: string
  handleChange: (value: string) => void
  "data-testid"?: string
}

const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange,
  "data-testid": dataTestId,
}: FilterRadioGroupProps) => {
  return (
    <div className="flex gap-x-3 flex-col gap-y-3">
      {title && (
        <Text className="txt-compact-small-plus text-ui-fg-muted">{title}</Text>
      )}
      <RadioGroup
        value={value}
        onChange={handleChange}
        className="gap-y-2 flex flex-col"
        data-testid={dataTestId}
      >
        {items.map((item, i) => {
          return (
            <RadioGroup.Option
              key={i}
              value={item.value}
              className="flex items-center gap-x-2"
            >
              {({ checked }) => (
                <>
                  <span
                    className={`h-3 w-3 rounded-full border border-gray-200 flex items-center justify-center ${
                      checked ? "border-gray-900" : ""
                    }`}
                  >
                    {checked && (
                      <span className="h-2 w-2 rounded-full bg-gray-900" />
                    )}
                  </span>
                  <RadioGroup.Label
                    as="p"
                    className={`txt-compact-small text-ui-fg-subtle cursor-pointer ${
                      checked ? "txt-compact-small-plus text-ui-fg-base" : ""
                    }`}
                  >
                    {item.label}
                  </RadioGroup.Label>
                </>
              )}
            </RadioGroup.Option>
          )
        })}
      </RadioGroup>
    </div>
  )
}

export default FilterRadioGroup