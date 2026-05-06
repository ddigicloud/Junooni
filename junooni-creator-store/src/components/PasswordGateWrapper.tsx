"use client"

import { useState } from "react"
import PasswordGate from "./PasswordGate"

interface Props {
  handle: string
  storeName: string
  store_id: string
  storeLogo?: string | null
  primaryColor?: string
  secondaryColor?: string
  backendUrl: string
}

export default function PasswordGateWrapper(props: Props) {
  const [granted, setGranted] = useState(false)

  const handleSuccess = (_token: string) => {
    setGranted(true)

    // Small delay to ensure browser commits the cookie before reload
    // Without this, reload can fire before the cookie is persisted
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  if (granted) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", fontFamily: "Inter, sans-serif",
      }}>
        <p style={{ color: "#888", fontSize: "0.9rem" }}>Opening store...</p>
      </div>
    )
  }

  return <PasswordGate {...props} onSuccess={handleSuccess} />
}