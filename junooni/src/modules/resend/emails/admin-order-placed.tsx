import * as React from "react"

type Item = {
  title: string
  subtitle: string
  sku: string
  quantity: number
  unit_price: number
  total: number
  vendor_id: string
  vendor_handle: string
}

type Props = {
  order_id?: string
  order_date?: string
  customer_name?: string
  customer_email?: string
  shipping_address?: string
  items?: Item[]
  total_vendors?: number
  order_total?: number
  order_subtotal?: number
  shipping_total?: number
  tax_total?: number
  currency?: string
  payment_status?: string
  admin_url?: string
  store_url?: string
}

export const adminOrderPlacedEmail = (props: unknown): React.ReactNode => {
  const {
    order_id = "",
    order_date = "",
    customer_name = "Customer",
    customer_email = "",
    shipping_address = "",
    items = [],
    total_vendors = 1,
    order_total = 0,
    order_subtotal = 0,
    shipping_total = 0,
    tax_total = 0,
    currency = "INR",
    payment_status = "pending",
    admin_url = "https://admin.junooni.com/api",
    store_url = "https://junooni.com",
  } = (props as Props) || {}

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)

  // Group items by vendor
  const vendorGroups: Record<string, Item[]> = {}
  const codItem = (items as any[]).find((item: any) => item.metadata?.is_cod_fee)
  items.filter((item: any) => !item.metadata?.is_cod_fee).forEach(item => {
    const key = item.vendor_handle || item.vendor_id || "unknown"
    if (!vendorGroups[key]) vendorGroups[key] = []
    vendorGroups[key].push(item)
  })

  const paymentBadgeColor = payment_status === "captured" ? "#10b981" : payment_status === "awaiting" ? "#f59e0b" : "#6b7280"

  return (
    <html>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f5f5f5", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ maxWidth: "640px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

          {/* Header */}
          <div style={{ background: "#1a1a1a", padding: "28px 40px", display: "flex" }}>
            <div>
              <p style={{ color: "#999", fontSize: "12px", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>New Order Received</p>
              <h1 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, margin: 0 }}>Order #{order_id}</h1>
              <p style={{ color: "#666", fontSize: "13px", margin: "4px 0 0 0" }}>{order_date} · {total_vendors} creator{total_vendors !== 1 ? "s" : ""}</p>
            </div>
          </div>

          <div style={{ padding: "32px 40px" }}>

            {/* Summary Row */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "28px" }}>
              <tbody>
                <tr>
                  <td style={{ width: "33%", textAlign: "center", padding: "16px", background: "#fafafa", borderRadius: "8px" }}>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a" }}>{formatPrice(order_total)}</div>
                    <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>Order Total</div>
                  </td>
                  <td style={{ width: "4px" }} />
                  <td style={{ width: "33%", textAlign: "center", padding: "16px", background: "#fafafa", borderRadius: "8px" }}>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a" }}>
                      {items.filter((item: any) => !item.metadata?.is_cod_fee).length}
                    </div>
                    <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>Items</div>
                  </td>
                  <td style={{ width: "4px" }} />
                  <td style={{ width: "33%", textAlign: "center", padding: "16px", background: "#fafafa", borderRadius: "8px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: paymentBadgeColor }}>{payment_status?.toUpperCase()}</div>
                    <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>Payment</div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Customer Info */}
            <div style={{ border: "1px solid #ebebeb", borderRadius: "10px", padding: "20px", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 0" }}>Customer</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ fontSize: "13px", color: "#777", paddingBottom: "6px", width: "110px" }}>Name</td>
                    <td style={{ fontSize: "13px", color: "#1a1a1a", fontWeight: 500, paddingBottom: "6px" }}>{customer_name}</td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: "13px", color: "#777", paddingBottom: "6px" }}>Email</td>
                    <td style={{ fontSize: "13px", color: "#1a1a1a", paddingBottom: "6px" }}>{customer_email}</td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: "13px", color: "#777" }}>Ship to</td>
                    <td style={{ fontSize: "13px", color: "#1a1a1a" }}>{shipping_address}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Items grouped by vendor */}
            <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 16px 0" }}>
              All Items by Creator
            </h3>

            {Object.entries(vendorGroups).map(([vendorHandle, vendorItems]) => (
              <div key={vendorHandle} style={{ marginBottom: "20px", border: "1px solid #ebebeb", borderRadius: "10px", overflow: "hidden" }}>
                {/* Vendor header */}
                <div style={{ background: "#f9f9f9", padding: "10px 16px", borderBottom: "1px solid #ebebeb" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#e65100" }}>@{vendorHandle}</span>
                  <span style={{ fontSize: "12px", color: "#999", marginLeft: "8px" }}>{vendorItems.length} item{vendorItems.length !== 1 ? "s" : ""}</span>
                </div>
                {/* Items */}
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {vendorItems.map((item, i) => (
                      <tr key={i} style={{ borderBottom: i < vendorItems.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                        <td style={{ padding: "10px 16px" }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>{item.title}</div>
                          {item.subtitle && <div style={{ fontSize: "12px", color: "#888" }}>{item.subtitle}</div>}
                          {item.sku && <div style={{ fontSize: "11px", color: "#bbb" }}>SKU: {item.sku}</div>}
                        </td>
                        <td style={{ padding: "10px 16px", textAlign: "center", fontSize: "13px", color: "#555", whiteSpace: "nowrap" }}>×{item.quantity}</td>
                        <td style={{ padding: "10px 16px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "#1a1a1a", whiteSpace: "nowrap" }}>{formatPrice(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {/* Order Totals */}
            <div style={{ border: "1px solid #ebebeb", borderRadius: "10px", padding: "16px 20px", marginBottom: "28px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ fontSize: "13px", color: "#777", paddingBottom: "8px" }}>Subtotal</td>
                    <td style={{ fontSize: "13px", color: "#1a1a1a", textAlign: "right", paddingBottom: "8px" }}>{formatPrice(order_subtotal)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: "13px", color: "#777", paddingBottom: "8px" }}>Shipping</td>
                    <td style={{ fontSize: "13px", color: "#1a1a1a", textAlign: "right", paddingBottom: "8px" }}>{formatPrice(shipping_total)}</td>
                  </tr>
                  {codItem && (
                    <tr>
                      <td style={{ fontSize: "13px", color: "#777", paddingBottom: "8px" }}>Cash on Delivery Fee</td>
                      <td style={{ fontSize: "13px", color: "#1a1a1a", textAlign: "right", paddingBottom: "8px" }}>{formatPrice((codItem as any).total)}</td>
                    </tr>
                  )}
                  {/* <tr>
                    <td style={{ fontSize: "13px", color: "#777", paddingBottom: "8px" }}>Tax</td>
                    <td style={{ fontSize: "13px", color: "#1a1a1a", textAlign: "right", paddingBottom: "8px" }}>{formatPrice(tax_total)}</td>
                  </tr> */}
                  <tr style={{ borderTop: "1px solid #ebebeb" }}>
                    <td style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a", paddingTop: "10px" }}>Total</td>
                    <td style={{ fontSize: "15px", fontWeight: 700, color: "#e65100", textAlign: "right", paddingTop: "10px" }}>{formatPrice(order_total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CTA */}
            <div style={{ textAlign: "center" }}>
              <a href={admin_url} style={{ display: "inline-block", background: "#1a1a1a", color: "#fff", textDecoration: "none", fontSize: "14px", fontWeight: 600, padding: "12px 32px", borderRadius: "8px" }}>
                View in Admin →
              </a>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: "#f9f9f9", borderTop: "1px solid #ebebeb", padding: "20px 40px", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>Junooni Internet Private Limited · India</p>
          </div>
        </div>
      </body>
    </html>
  )
}
