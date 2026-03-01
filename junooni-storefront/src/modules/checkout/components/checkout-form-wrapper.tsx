// src/modules/checkout/components/checkout-form-wrapper.tsx
"use client"

import { CheckoutProvider } from "../context/checkout-context"
import { ReactNode } from "react"

export default function CheckoutFormWrapper({ children }: { children: ReactNode }) {
  return <CheckoutProvider>{children}</CheckoutProvider>
}