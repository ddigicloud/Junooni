// "use client"

// import { Button } from "@medusajs/ui"
// import React from "react"
// import { useFormStatus } from "react-dom"

// export function SubmitButton({
//   children,
//   variant = "primary",
//   className,
//   "data-testid": dataTestId,
// }: {
//   children: React.ReactNode
//   variant?: "primary" | "secondary" | "transparent" | "danger" | null
//   className?: string
//   "data-testid"?: string
// }) {
//   const { pending } = useFormStatus()

//   return (
//     <Button
//       size="large"
//       className={className}
//       type="submit"
//       isLoading={pending}
//       variant={variant || "primary"}
//       data-testid={dataTestId}
//     >
//       {children}
//     </Button>
//   )
// }

"use client"

import { Button } from "@medusajs/ui"
import { useFormStatus } from "react-dom"
import Spinner from "@modules/common/icons/spinner"
import { clx } from "@medusajs/ui"

export const SubmitButton = ({
  children,
  variant = "primary",
  className,
  ...props
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary"
  className?: string
  [key: string]: any
}) => {
  const { pending } = useFormStatus()

  return (
    <Button
      className={clx(
        "h-11 min-w-[120px] flex items-center justify-center",
        {
          "bg-[#e65100] hover:bg-[#e65100]/90 text-white":
            variant === "primary",
          "border-[#e65100] border text-[#e65100] hover:bg-[#e65100]/5":
            variant === "secondary",
        },
        className
      )}
      type="submit"
      disabled={pending}
      {...props}
    >
      {pending ? <Spinner /> : children}
    </Button>
  )
}
