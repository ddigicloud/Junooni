// "use client"

// import { Text, clx } from "@medusajs/ui"

// type ColorOption = {
//   value: string
//   label: string
//   color: string
// }

// type ColorSelectorProps = {
//   title: string
//   items: ColorOption[]
//   values: string[]
//   handleChange: (values: string[]) => void
//   "data-testid"?: string
// }

// const ColorSelector = ({
//   title,
//   items,
//   values,
//   handleChange,
//   "data-testid": dataTestId,
// }: ColorSelectorProps) => {
//   // Toggle a color selection
//   const toggleColor = (colorValue: string) => {
//     if (values.includes(colorValue)) {
//       // Remove color if already selected
//       handleChange(values.filter(v => v !== colorValue))
//     } else {
//       // Add color if not selected
//       handleChange([...values, colorValue])
//     }
//   }

//   return (
//     <div className="flex gap-x-3 flex-col gap-y-3">
//       <Text className="txt-compact-small-plus text-ui-fg-muted">{title}</Text>
//       <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
//         {items?.map((item) => (
//           <button
//             key={item.value}
//             className={clx(
//               "w-8 h-8 rounded-full border border-ui-border-base hover:border-ui-border-interactive",
//               {
//                 "ring-2 ring-ui-border-interactive": values.includes(item.value),
//               }
//             )}
//             style={{ backgroundColor: item.color }}
//             onClick={() => toggleColor(item.value)}
//             title={item.label}
//             aria-label={`Select color: ${item.label}`}
//             aria-pressed={values.includes(item.value)}
//           />
//         ))}
//       </div>
//     </div>
//   )
// }

// export default ColorSelector



"use client"

import { Text, clx } from "@medusajs/ui"

type ColorOption = {
  value: string
  label: string
  color: string
}

type ColorSelectorProps = {
  title: string
  items: ColorOption[]
  values: string[]
  handleChange: (values: string[]) => void
  "data-testid"?: string
}

const ColorSelector = ({
  title,
  items,
  values,
  handleChange,
  "data-testid": dataTestId,
}: ColorSelectorProps) => {
  // Toggle a color selection
  const toggleColor = (colorValue: string) => {
    if (values.includes(colorValue)) {
      // Remove color if already selected
      handleChange(values.filter(v => v !== colorValue))
    } else {
      // Add color if not selected
      handleChange([...values, colorValue])
    }
  }

  return (
    <div className="flex gap-x-3 flex-col gap-y-3">
      <Text className="txt-compact-small-plus text-ui-fg-muted">{title}</Text>
      <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
        {items?.map((item) => (
          <button
            key={item.value}
            className={clx(
              "w-8 h-8 rounded-full border border-ui-border-base hover:border-ui-border-interactive",
              {
                "ring-2 ring-ui-border-interactive": values.includes(item.value),
              }
            )}
            style={{ backgroundColor: item.color }}
            onClick={() => toggleColor(item.value)}
            title={item.label}
            aria-label={`Select color: ${item.label}`}
            aria-pressed={values.includes(item.value)}
          />
        ))}
      </div>
    </div>
  )
}

export default ColorSelector