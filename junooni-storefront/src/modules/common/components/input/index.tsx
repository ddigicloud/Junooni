// import { Label } from "@medusajs/ui"
// import React, { useEffect, useImperativeHandle, useState } from "react"

// import Eye from "@modules/common/icons/eye"
// import EyeOff from "@modules/common/icons/eye-off"

// type InputProps = Omit<
//   Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
//   "placeholder"
// > & {
//   label: string
//   errors?: Record<string, unknown>
//   touched?: Record<string, unknown>
//   name: string
//   topLabel?: string
// }

// const Input = React.forwardRef<HTMLInputElement, InputProps>(
//   ({ type, name, label, touched, required, topLabel, ...props }, ref) => {
//     const inputRef = React.useRef<HTMLInputElement>(null)
//     const [showPassword, setShowPassword] = useState(false)
//     const [inputType, setInputType] = useState(type)

//     useEffect(() => {
//       if (type === "password" && showPassword) {
//         setInputType("text")
//       }

//       if (type === "password" && !showPassword) {
//         setInputType("password")
//       }
//     }, [type, showPassword])

//     useImperativeHandle(ref, () => inputRef.current!)

//     return (
//       <div className="flex flex-col w-full">
//         {topLabel && (
//           <Label className="mb-2 txt-compact-medium-plus">{topLabel}</Label>
//         )}
//         <div className="relative z-0 flex w-full txt-compact-medium">
//           <input
//             type={inputType}
//             name={name}
//             placeholder=" "
//             required={required}
//             className="block w-full px-4 pt-4 pb-1 mt-0 border rounded-md appearance-none h-11 bg-ui-bg-field focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover"
//             {...props}
//             ref={inputRef}
//           />
//           <label
//             htmlFor={name}
//             onClick={() => inputRef.current?.focus()}
//             className="absolute flex items-center justify-center px-1 mx-3 transition-all duration-300 top-3 -z-1 origin-0 text-ui-fg-subtle"
//           >
//             {label}
//             {required && <span className="text-rose-500">*</span>}
//           </label>
//           {type === "password" && (
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-0 px-4 transition-all duration-150 outline-none text-ui-fg-subtle focus:outline-none focus:text-ui-fg-base top-3"
//             >
//               {showPassword ? <Eye /> : <EyeOff />}
//             </button>
//           )}
//         </div>
//       </div>
//     )
//   }
// )

// Input.displayName = "Input"

// export default Input

import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react"
import { clx } from "@medusajs/ui"

type InputProps = {
  label: string
  name: string
  required?: boolean
  autoComplete?: string
  defaultValue?: string
  placeholder?: string
  type?: string
  className?: string
  errors?: Record<string, unknown>
  "data-testid"?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      name,
      required = false,
      autoComplete,
      defaultValue,
      placeholder,
      errors,
      type = "text",
      className,
      "data-testid": testId,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [value, setValue] = useState(defaultValue || "")
    const inputRef = React.useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    useEffect(() => {
      if (defaultValue) {
        setValue(defaultValue)
      }
    }, [defaultValue])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
    }

    const hasError = errors && name in errors

    return (
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor={name}
            className={clx("text-sm font-medium transition-colors", {
              "text-[#e65100]": isFocused,
              "text-gray-700": !isFocused,
              "text-rose-500": hasError,
            })}
          >
            {label}
            {required && <span className="ml-1 text-rose-500">*</span>}
          </label>
        </div>
        <div className="relative">
          <input
            id={name}
            name={name}
            type={type}
            ref={inputRef}
            autoComplete={autoComplete}
            value={value}
            placeholder={placeholder}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required={required}
            className={clx(
              "appearance-none w-full px-4 py-2.5 border rounded-md text-gray-900 placeholder-gray-400 text-base transition-all focus:outline-none",
              {
                "border-[#e65100] ring-1 ring-[#e65100]/20":
                  isFocused && !hasError,
                "border-ui-border-base": !isFocused && !hasError,
                "border-rose-500 ring-1 ring-rose-500/10": hasError,
              },
              className
            )}
            data-testid={testId}
            {...props}
          />
        </div>
        {hasError && (
          <p className="mt-1 text-sm text-rose-500">{errors[name] as string}</p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
