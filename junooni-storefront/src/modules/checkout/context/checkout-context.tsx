"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type CheckoutContextType = {
  selectedPaymentMethod: string
  setSelectedPaymentMethod: (method: string) => void
}

const CheckoutContext = createContext<CheckoutContextType>({
  selectedPaymentMethod: "",
  setSelectedPaymentMethod: () => {},
})

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethodState] = useState("")

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("junooni_payment_method")
    if (saved) setSelectedPaymentMethodState(saved)
  }, [])

  const setSelectedPaymentMethod = (method: string) => {
    setSelectedPaymentMethodState(method)
    localStorage.setItem("junooni_payment_method", method)
  }

  // Clear when cart is completed
  useEffect(() => {
    const handleOrderComplete = () => {
      localStorage.removeItem("junooni_payment_method")
    }
    window.addEventListener("order.completed", handleOrderComplete)
    return () => window.removeEventListener("order.completed", handleOrderComplete)
  }, [])

  return (
    <CheckoutContext.Provider value={{ selectedPaymentMethod, setSelectedPaymentMethod }}>
      {children}
    </CheckoutContext.Provider>
  )
}

export const useCheckout = () => useContext(CheckoutContext)