// src/modules/vendors/templates/vendor-template.tsx
"use client"
import { useState } from "react"
import VendorRegister from "@modules/vendor/components/register"
import VendorLogin from "@modules/vendor/components/login"


export type VendorView = "SIGN_IN" | "REGISTER"

export const VENDOR_VIEW = {
  SIGN_IN: "SIGN_IN" as VendorView,
  REGISTER: "REGISTER" as VendorView,
}

const VendorTemplate = () => {
  const [currentView, setCurrentView] = useState<VendorView>(VENDOR_VIEW.REGISTER)

  return (
    <div className="w-full flex justify-center py-24">
      {currentView === VENDOR_VIEW.SIGN_IN ? (
        <VendorLogin setCurrentView={setCurrentView} />
      ) : (
        <VendorRegister setCurrentView={setCurrentView} />
      )}
    </div>
  )
}

export default VendorTemplate