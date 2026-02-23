import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import { Button, Table } from "@medusajs/ui"

const IncompleteVendorsWidget = () => {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    fetch("/admin/incomplete-vendors", { credentials: "include" })
      .then(r => r.json())
      .then(d => setData(d.incomplete_signups || []))
  }, [])

  const sendReminderEmail = async (email: string) => {
    await fetch("/admin/send-onboarding-reminder", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    alert(`Reminder sent to ${email}`)
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-semibold">
        Incomplete Signups ({data.length})
      </h2>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell>Signed up</Table.HeaderCell>
            <Table.HeaderCell>Action</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((row) => (
            <Table.Row key={row.auth_identity_id}>
              <Table.Cell>{row.email}</Table.Cell>
              <Table.Cell>{new Date(row.created_at).toLocaleDateString()}</Table.Cell>
              <Table.Cell>
                <Button size="small" onClick={() => sendReminderEmail(row.email)}>
                  Send Reminder
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "order.list.before", // or any admin zone you want
})

export default IncompleteVendorsWidget