import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, toast } from "@medusajs/ui"
import { Users } from "@medusajs/icons"
import { useState } from "react"

// ---------------------------------------------------------------------------
// Config — inject this widget into the vendor detail page.
// Adjust the zone to match wherever your vendor detail route lives.
// Common zones: "vendor.details.before", "vendor.details.after"
// If you have a custom route at /app/vendors/[id], use the widget zone for it.
// ---------------------------------------------------------------------------
export const config = defineWidgetConfig({
  zone: "user.details.after", // ← change this to your actual widget zone
})

type VendorWidgetProps = {
  data: {
    id: string          // this is the vendor_admin id or vendor id depending on your page
    name?: string
    [key: string]: unknown
  }
}

const VENDOR_DASHBOARD_URL =
  import.meta.env.VITE_VENDOR_DASHBOARD_URL ?? "https://studio.junooni.com"

const AssistVendorWidget = ({ data }: VendorWidgetProps) => {
  const [loading, setLoading] = useState(false)

  const handleImpersonate = async () => {
    setLoading(true)

    try {
      // The admin JWT is stored under key "token" in Medusa admin localStorage
      const adminToken = localStorage.getItem("token")

      if (!adminToken) {
        toast.error("Not authenticated", {
          description: "Admin token not found. Please log in again.",
        })
        return
      }

      const response = await fetch("/admin/impersonate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ vendor_admin_id: data.id }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message ?? "Failed to generate impersonation token")
      }

      const { token, vendor } = await response.json()

      // Open the vendor dashboard in a new tab.
      // The vendor dashboard reads the ?impersonate= query param on load.
      const url = new URL(`${VENDOR_DASHBOARD_URL}/auth/impersonate`)
      url.searchParams.set("token", token)

      window.open(url.toString(), "_blank", "noopener,noreferrer")

      toast.success(`Opened ${vendor.name ?? "vendor"} dashboard`, {
        description: "You are now in Admin Assist mode. Token expires in 2 hours.",
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      toast.error("Impersonation failed", { description: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-ui-bg-subtle rounded-lg border border-ui-border-base p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-ui-fg-base font-medium text-sm">Admin Assist</p>
        <p className="text-ui-fg-subtle text-xs mt-0.5">
          Open this vendor's dashboard as them to help with onboarding or issues.
          Token expires in 2 hours.
        </p>
      </div>
      <Button
        variant="secondary"
        size="small"
        isLoading={loading}
        onClick={handleImpersonate}
      >
        <Users className="mr-1.5" />
        Login as Vendor
      </Button>
    </div>
  )
}

export default AssistVendorWidget