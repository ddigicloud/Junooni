import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Select {title}</span>
      <div
        className="flex gap-3"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
            if(title === 'Color'){
              return (
                <button
                  onClick={() => updateOption(option.id, v)}
                  key={v}
                  className={clx(
                    "rounded-full w-8 h-8 border border-black",
                    {
                      " bg-black text-white": v === current,
                      "hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150":
                        v !== current,
                    }
                  )}
                  disabled={disabled}
                  data-testid="option-button"
                >

                </button>
              )
            }else{
              return (
                <button
                  onClick={() => updateOption(option.id, v)}
                  key={v}
                  className={clx(
                    "border-ui-border-base bg-ui-bg-subtle border shadow-elevation-card-rest text-small-regular rounded-full w-10 h-10",
                    {
                      " bg-black text-white border-4 border-black": v === current,
                      "hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150":
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
