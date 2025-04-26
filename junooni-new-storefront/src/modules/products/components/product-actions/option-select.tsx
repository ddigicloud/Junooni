// import { HttpTypes } from "@medusajs/types"
// import { clx } from "@medusajs/ui"
// import React from "react"

// type OptionSelectProps = {
//   option: HttpTypes.StoreProductOption
//   current: string | undefined
//   updateOption: (title: string, value: string) => void
//   title: string
//   disabled: boolean
//   "data-testid"?: string,
// }

// const OptionSelect: React.FC<OptionSelectProps> = ({
//   option,
//   current,
//   updateOption,
//   title,
//   "data-testid": dataTestId,
//   disabled
// }) => {
//   const filteredOptions = (option.values ?? []).map((v) => v.value)

//   return (
//     <div className="flex flex-col gap-y-3">
//       <span className="text-sm">Select {title}</span>
//       <div
//         className="flex gap-3"
//         data-testid={dataTestId}
//       >
//         {filteredOptions.map((v) => {
          
       
//               return (
//                 <button
//                   onClick={() => updateOption(option.id, v)}
//                   key={v}
//                   className={clx(
//                     "border-ui-border-base border text-small-regular   w-12 h-10",
//                     {
//                       " bg-black text-white border-4 border-black": v === current,
//                       " transition-shadow ease-in-out duration-150":
//                         v !== current,
//                     }
//                   )}
//                   disabled={disabled}
//                   data-testid="option-button"
//                 >
//                   {v}
//                 </button>
//               )
//             }
//         )}
//       </div>
//     </div>
//   )
// }

// export default OptionSelect


import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"


type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string, metadata?: Record<string, any>) => void
  title: string
  disabled: boolean
  "data-testid"?: string
  product: any // Product data containing metadata
  currentValues: Record<string, string> // ✅ add this line
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
  currentValues,
  product
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)
  
  // Function to get color hex code from product metadata
  const getColorHex = (colorName: string): string => {
    let colorHexArray: any[] = [];
  
    try {
      const raw = product?.metadata?.color_hex_values;
      colorHexArray = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch (e) {
      console.warn("Failed to parse color_hex_values:", e);
      return "#CCCCCC"; // fallback grey color
    }
  
    // ✅ Safely handle if colorHexArray is undefined or not an array
    if (!Array.isArray(colorHexArray)) {
      return "#CCCCCC";
    }
  
    const match = colorHexArray.find(
      (entry: any) => entry?.name?.toLowerCase() === colorName.toLowerCase()
    );
  
    return match?.hex || "#CCCCCC"; // fallback color if not found
  };
  
  
  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Select {title}</span>
      <div
        className="flex gap-3"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          if (title === 'Color') {
            const colorHex = getColorHex(v)
          
            const selectedSize = currentValues?.["Size"] || null
          
            // Get the size option object to use its option_id
            const sizeOption = product?.options?.find(
              (opt: any) => opt.title?.toLowerCase() === "size"
            )
            
            
          
            let isOutOfStock = false
          
            if (selectedSize && sizeOption?.id) {
              const matchingVariantExists = product.variants.some((variant: any) => {
                const hasSelectedSize = variant.options?.some(
                  (opt: any) =>
                    opt.option_id === sizeOption.id && opt.value === selectedSize
                )
                const hasColor = variant.options?.some(
                  (opt: any) =>
                    opt.option_id === option.id && opt.value === v
                )
          
                return hasSelectedSize && hasColor
              })
          
              isOutOfStock = !matchingVariantExists
            }
          
            return (
              <div key={v} className="relative group">
                <span className="absolute left-1/2 -bottom-4 -translate-x-1/2 px-2 py-1 text-xs text-white bg-[#E65100] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                  {v}
                </span>
          
                <button
                  onClick={() => {
                    if (!isOutOfStock) {
                      updateOption(option.id, v, { colorHex })
                    }
                  }}
                  className={clx(
                    "rounded-full w-10 h-10 border border-gray-300 relative",
                    {
                      "ring-2 ring-offset-2 ring-[#E65100]": v === current && !isOutOfStock,
                      "hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150":
                        !isOutOfStock && v !== current,
                      "opacity-50 cursor-not-allowed": isOutOfStock,
                    }
                  )}
                  style={{ backgroundColor: colorHex }}
                  disabled={isOutOfStock || disabled}
                  data-testid="option-button"
                >
                  {isOutOfStock && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-0.5 bg-red-600 rotate-45" />
                    </span>
                  )}
          
                  {!isOutOfStock && v === current && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={['#FFFFFF', '#FFF', '#FFFFFFF'].includes(
                          colorHex?.toUpperCase()
                        )
                          ? 'text-black'
                          : 'text-white'}
                      >
                        <path
                          d="M13.3334 4L6.00008 11.3333L2.66675 8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            )
          
          
          
              // return (
                // <button
                //   onClick={() => updateOption(option.id, v, { colorHex: colorHex || '#CCCCCC' })}
                //   key={v}
                //   className={clx(
                //     "rounded-full w-8 h-8 border border-gray-300 relative",
                //     {
                //       "ring-2 ring-offset-2 ring-black": v === current,
                //       "hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150":
                //         v !== current,
                //     }
                //   )}
                //   style={{ 
                //     backgroundColor: colorHex || '#CCCCCC'
                //   }}
                //   disabled={disabled}
                //   data-testid="option-button"
                //   title={v} // Add title attribute for accessibility
                // >
                //   {v === current && (
                //     <span className="absolute inset-0 flex items-center justify-center">
                //       <svg 
                //         width="16" 
                //         height="16" 
                //         viewBox="0 0 16 16" 
                //         fill="none" 
                //         xmlns="http://www.w3.org/2000/svg"
                //         className={getColorHex(v) && ['#FFFFFF', '#FFF', '#FFFFFFF'].includes(getColorHex(v)) ? 'text-black' : 'text-white'}
                //       >
                //         <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                //       </svg>
                //     </span>
                //   )}
                // </button>
              // )
            } else {
              return (
                <button
                  onClick={() => updateOption(option.id, v)}
                  key={v}
                  className={clx(
                    "border-ui-border-base border rounded-md text-small-regular w-12 h-10",
                    {
                      "bg-[#E65100] text-white border-4 border-[#E65100]": v === current,
                      "border-ui-border-base hover:border-[#E65100]": v !== current,
                      "transition-shadow ease-in-out duration-150":
                        v !== current,
                    }
                  )}
                  disabled={disabled}
                  data-testid="option-button"
                >
                  {v}
                </button>
              )
            }
        })}
      </div>
    </div>
  )
}

export default OptionSelect

// import { HttpTypes } from "@medusajs/types"
// import { clx } from "@medusajs/ui"
// import React from "react"

// type OptionSelectProps = {
//   option: HttpTypes.StoreProductOption
//   current: string | undefined
//   updateOption: (title: string, value: string) => void
//   title: string
//   disabled: boolean
//   "data-testid"?: string
// }

// const OptionSelect: React.FC<OptionSelectProps> = ({
//   option,
//   current,
//   updateOption,
//   title,
//   "data-testid": dataTestId,
//   disabled,
// }) => {
//   const filteredOptions = (option.values ?? []).map((v) => v.value)

//   return (
//     <div className="flex flex-col gap-y-3">
//       <span className="text-sm">Select {title}</span>
//       <div
//         className="flex flex-wrap justify-between gap-2"
//         data-testid={dataTestId}
//       >
//         {filteredOptions.map((v) => {
//           return (
//             <button
//               onClick={() => updateOption(option.id, v)}
//               key={v}
//               className={clx(
//                 "border-ui-border-base bg-ui-bg-subtle border text-small-regular h-10 rounded-rounded p-2 flex-1 ",
//                 {
//                   "border-ui-border-interactive": v === current,
//                   "hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150":
//                     v !== current,
//                 }
//               )}
//               disabled={disabled}
//               data-testid="option-button"
//             >
//               {v}
//             </button>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

// export default OptionSelect