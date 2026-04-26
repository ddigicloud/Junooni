import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import { useEffect, useState } from "react"
import { sdk } from "../lib/sdk"

const BADGE_STYLES = {
  "JUNOONI-fulfillment": { background: "#ede9fe", color: "#5b21b6" },
  "default": { background: "#f3f4f6", color: "#374151" },
}

type ItemFulfillment = {
  itemId: string
  title: string
  variantTitle: string
  fulfillmentType: string | null
}

const OrderFulfillmentBadgeWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const [itemFulfillments, setItemFulfillments] = useState<ItemFulfillment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFulfillmentTypes = async () => {
      const items = (data as any).items ?? []
      if (!items.length) {
        setLoading(false)
        return
      }

      // Get unique product IDs
      const productIds: string[] = [
        ...new Set(
          items
            .map((item: any) => item.variant?.product_id)
            .filter(Boolean)
        ),
      ]

      // Fetch all products in parallel
      const productMap: Record<string, any> = {}
      await Promise.all(
        productIds.map(async (productId) => {
          try {
            const res = await sdk.admin.product.retrieve(productId, {
              fields: "id,metadata",
            })
            productMap[productId] = res.product
          } catch (e) {
            console.error("Failed to fetch product", productId, e)
          }
        })
      )

      // Map each line item to its fulfillment type
      const result: ItemFulfillment[] = items.map((item: any) => {
        const productId = item.variant?.product_id
        const product = productMap[productId]
        const raw = product?.metadata?.fulfillment_type

        let fulfillmentType: string | null = null
        if (raw) {
          try {
            const ft = typeof raw === "string" ? JSON.parse(raw) : raw
            fulfillmentType = ft.type ?? null
          } catch {
            fulfillmentType = null
          }
        }

        return {
          itemId: item.id,
          title: item.title,
          variantTitle: item.variant_title ?? "",
          fulfillmentType,
        }
      })

      setItemFulfillments(result)
      setLoading(false)
    }

    fetchFulfillmentTypes()
  }, [data])

  const itemsWithBadge = itemFulfillments.filter((i) => i.fulfillmentType)

  if (loading || !itemsWithBadge.length) return null

  return (
    <div style={{
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "8px",
    }}>
      <p style={{ fontWeight: 600, fontSize: "13px", marginBottom: "12px", color: "#111" }}>
        Fulfillment Types
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {itemsWithBadge.map((item) => {
          const badgeStyle =
            BADGE_STYLES[item.fulfillmentType as keyof typeof BADGE_STYLES] ??
            BADGE_STYLES["default"]

          return (
            <div key={item.itemId} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "13px",
            }}>
              <span style={{
                color: "#6b7280",
                maxWidth: "60%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {item.title}
                {item.variantTitle ? ` · ${item.variantTitle}` : ""}
              </span>
              <span style={{
                padding: "2px 10px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 500,
                ...badgeStyle,
              }}>
                {item.fulfillmentType}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default OrderFulfillmentBadgeWidget