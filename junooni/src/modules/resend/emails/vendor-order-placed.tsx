import * as React from "react"

type Item = {
  title: string
  subtitle: string
  sku: string
  quantity: number
  unit_price: number
  total: number
}

type Props = {
  vendor_name?: string
  order_id?: string
  order_date?: string
  customer_name?: string
  shipping_address?: string
  items?: Item[]
  vendor_subtotal?: number
  currency?: string
  studio_url?: string
}

export const vendorOrderPlacedEmail = (props: unknown): React.ReactNode => {
  const {
    vendor_name = "Creator",
    order_id = "",
    order_date = "",
    customer_name = "Customer",
    shipping_address = "",
    items = [],
    vendor_subtotal = 0,
    currency = "INR",
    studio_url = "https://studio.junooni.com",
  } = (props as Props) || {}

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)

  return (
    <html>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f5f5f5", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ maxWidth: "600px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #e65100 0%, #ff6d00 100%)", padding: "36px 40px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🎉</div>
            <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: 700, margin: 0 }}>You've got a new order!</h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "15px", marginTop: "8px", marginBottom: 0 }}>
              Order #{order_id} · {order_date}
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: "36px 40px" }}>
            <p style={{ fontSize: "16px", color: "#333", marginBottom: "24px" }}>
              Hi <strong>{vendor_name}</strong>, a customer just placed an order for your products. Here are the details:
            </p>

            {/* Customer Info */}
            <div style={{ background: "#fafafa", border: "1px solid #ebebeb", borderRadius: "10px", padding: "20px", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 0" }}>Customer Details</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ fontSize: "14px", color: "#777", paddingBottom: "6px", width: "120px" }}>Name</td>
                    <td style={{ fontSize: "14px", color: "#1a1a1a", fontWeight: 500, paddingBottom: "6px" }}>{customer_name}</td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: "14px", color: "#777" }}>Ship to</td>
                    <td style={{ fontSize: "14px", color: "#1a1a1a" }}>{shipping_address}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Items */}
            <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 0" }}>Your Items in This Order</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ebebeb" }}>
                  <td style={{ fontSize: "12px", color: "#999", fontWeight: 600, paddingBottom: "8px" }}>PRODUCT</td>
                  <td style={{ fontSize: "12px", color: "#999", fontWeight: 600, paddingBottom: "8px", textAlign: "center" }}>QTY</td>
                  <td style={{ fontSize: "12px", color: "#999", fontWeight: 600, paddingBottom: "8px", textAlign: "right" }}>TOTAL</td>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 0" }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>{item.title}</div>
                      {item.subtitle && <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{item.subtitle}</div>}
                      {item.sku && <div style={{ fontSize: "11px", color: "#bbb", marginTop: "2px" }}>SKU: {item.sku}</div>}
                    </td>
                    <td style={{ padding: "12px 0", textAlign: "center", fontSize: "14px", color: "#555" }}>×{item.quantity}</td>
                    <td style={{ padding: "12px 0", textAlign: "right", fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>{formatPrice(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Subtotal */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "32px" }}>
              <tbody>
                <tr>
                  <td style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a" }}>Your Order Value</td>
                  <td style={{ fontSize: "15px", fontWeight: 700, color: "#e65100", textAlign: "right" }}>{formatPrice(vendor_subtotal)}</td>
                </tr>
              </tbody>
            </table>

            {/* CTA */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <a href={`${studio_url}/orders`} style={{ display: "inline-block", background: "#e65100", color: "#fff", textDecoration: "none", fontSize: "15px", fontWeight: 600, padding: "13px 36px", borderRadius: "8px" }}>
                View Order in Studio →
              </a>
            </div>

            {/* <p style={{ fontSize: "13px", color: "#999", textAlign: "center", margin: 0 }}>
              Please process this order promptly to ensure a great customer experience.
            </p> */}
          </div>

          {/* Footer */}
          <div style={{ background: "#f9f9f9", borderTop: "1px solid #ebebeb", padding: "20px 40px", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>Junooni Marketplace · India</p>
          </div>
        </div>
      </body>
    </html>
  )
}