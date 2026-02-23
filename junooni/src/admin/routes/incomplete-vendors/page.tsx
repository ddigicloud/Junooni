import { defineRouteConfig } from "@medusajs/admin-sdk"
import { User } from "@medusajs/icons"
import { useEffect, useState } from "react"
import { Button, Table, Badge, toast } from "@medusajs/ui"

const IncompleteVendorsPage = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string | null>(null)

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
              <Table.HeaderCell>Action</Table.HeaderCell>
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
                  <Button
                    size="small"
                    variant="secondary"
                    isLoading={sending === row.email}
                    onClick={() => sendReminder(row.email)}
                  >
                    Send Reminder
                  </Button>
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