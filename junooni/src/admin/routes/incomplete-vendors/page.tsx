import { defineRouteConfig } from "@medusajs/admin-sdk"
import { User } from "@medusajs/icons"
import { useEffect, useState } from "react"
import { Button, Table, Badge, toast } from "@medusajs/ui"

const VENDOR_DASHBOARD_URL =
  import.meta.env.VITE_VENDOR_DASHBOARD_URL ?? "https://studio.junooni.com"

const IncompleteVendorsPage = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string | null>(null)
  const [impersonating, setImpersonating] = useState<string | null>(null)

  useEffect(() => {
    fetch("/admin/incomplete-vendors", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        setData(d.incomplete_signups || [])
        setLoading(false)
      })
  }, [])

  const sendReminder = async (email: string) => {
    setSending(email)
    try {
      await fetch("/admin/send-onboarding-reminder", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      toast.success("Reminder sent", { description: `Email sent to ${email}` })
    } catch {
      toast.error("Failed to send reminder")
    } finally {
      setSending(null)
    }
  }

  // ── NEW: Impersonate an incomplete vendor ──────────────────────────────────
  // These vendors registered but never completed onboarding.
  // We generate a token from their auth_identity_id and drop them into
  // the onboarding flow directly — no password needed.
  const loginAsIncompleteVendor = async (auth_identity_id: string, email: string) => {
    setImpersonating(auth_identity_id)
    try {
      const response = await fetch("/admin/impersonate-incomplete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auth_identity_id }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message ?? "Failed to generate token")
      }

      const { token } = await response.json()

      // Redirect to sign-in page with ?impersonate= param.
      // The sign-in page detects it, stores it, and because actor_id is empty
      // it routes to /onboarding instead of /dashboard.
      const url = new URL(`${VENDOR_DASHBOARD_URL}/sign-in`)
      url.searchParams.set("impersonate", token)
      window.open(url.toString(), "_blank", "noopener,noreferrer")

      toast.success("Opened onboarding", {
        description: `Entering onboarding as ${email}`,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      toast.error("Login failed", { description: message })
    } finally {
      setImpersonating(null)
    }
  }
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Incomplete Signups</h1>
          <p className="mt-1 text-sm text-gray-500">
            Creators who registered but never completed onboarding
          </p>
        </div>
        <Badge color="orange">{data.length} pending</Badge>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-400">All creators have completed onboarding 🎉</p>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Signed Up</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.map((row) => (
              <Table.Row key={row.auth_identity_id}>
                <Table.Cell>{row.email}</Table.Cell>
                <Table.Cell>
                  {new Date(row.created_at).toLocaleDateString("en-IN")}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    {/* Existing button — unchanged */}
                    <Button
                      size="small"
                      variant="secondary"
                      isLoading={sending === row.email}
                      onClick={() => sendReminder(row.email)}
                    >
                      Send Reminder
                    </Button>

                    {/* NEW: Login as this vendor directly into onboarding */}
                    <Button
                      size="small"
                      variant="primary"
                      isLoading={impersonating === row.auth_identity_id}
                      onClick={() => loginAsIncompleteVendor(row.auth_identity_id, row.email)}
                    >
                      Login as Vendor
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Incomplete Signups",
  icon: User,
})

export default IncompleteVendorsPage