"use client"

import { useEffect } from "react"

export default function ClearCheckoutHistory() {
  useEffect(() => {
    // Replace the current history entry (order confirmation page) 
    // so that going back skips the checkout and lands on /store
    window.history.replaceState(null, "", window.location.href)
    
    // Push /store as the "back" destination by manipulating history
    window.history.pushState(null, "", window.location.href)
    
    const handlePopState = () => {
      window.location.href = "/store"
    }
    
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  return null
}