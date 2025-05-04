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
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
  product
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)
  
  // Function to get color hex code from product metadata
    const getColorHex = (colorName: string): string => {
      try {
        const raw = product?.metadata?.color_hex_values
        const colorHexArray = raw
          ? typeof raw === "string"
            ? JSON.parse(raw)
            : Array.isArray(raw)
            ? raw
            : []
          : []
    
        const match = colorHexArray.find(
          (entry: any) =>
            entry?.name?.toLowerCase?.() === colorName.toLowerCase()
        )
    
        return match?.hex || "#CCCCCC"
      } catch (e) {
        console.warn("Failed to parse or access color_hex_values:", e)
        return "#CCCCCC"
      }
    }
    
  
  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Select {title}</span>
      <div
        className="flex gap-3"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
            if(title === 'Color'){
              const colorHex = getColorHex(v)
              
              return (
                <div key={v} className="relative group">
                  {/* Custom styled tooltip */}
                  <span className="absolute left-1/2 -bottom-4 -translate-x-1/2 px-2 py-1 text-xs text-white bg-[#E65100] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                    {v}
                  </span>
              
                  <button
                    onClick={() => updateOption(option.id, v, { colorHex: colorHex || '#CCCCCC' })}
                    className={clx(
                      "rounded-full w-10 h-10 border border-gray-300 relative",
                      {
                        "ring-2 ring-offset-2 ring-[#E65100]": v === current,
                        "hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150":
                          v !== current,
                      }
                    )}
                    style={{ backgroundColor: colorHex || '#CCCCCC' }}
                    disabled={disabled}
                    data-testid="option-button"
                  >
                    {v === current && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 16 16" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className={getColorHex(v) &&
                            ['#FFFFFF', '#FFF', '#FFFFFFF'].includes(getColorHex(v).toUpperCase())
                            ? 'text-black'
                            : 'text-white'}
                        >
                          <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </button>
                </div>
              );
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