import { JUNOONI_KNOWLEDGE } from "./knowledgeBase"

export interface VendorContext {
  storeName: string
  handle: string
  membershipPlan: "free" | "creator" | "studio"
  planBillingCycle: string | null
  planActivatedAt: string | null
  productCount: number
  pendingOrders: number
  walletBalance: number   // in paise
  totalEarned: number     // in paise
  revenueLastFive: number // in paise
  recentOrders: Array<{
    id: string
    customerName: string
    total: number          // in paise
    status: string
    paymentStatus: string
    fulfillmentStatus: string
  }>
}

export function buildSystemPrompt(vendor: VendorContext): string {
  const recentOrdersText = vendor.recentOrders?.length
    ? vendor.recentOrders
        .map(
          (o) =>
            `- ${o.id}: ${o.customerName} | ₹${(o.total / 100).toFixed(0)} | order: ${o.status} | fulfillment: ${o.fulfillmentStatus} | payment: ${o.paymentStatus}`
        )
        .join("\n")
    : "No recent orders yet."

  const planActiveSince = vendor.planActivatedAt
    ? new Date(vendor.planActivatedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A"

  return `
You are JUNI — the AI assistant built into the JUNOONI Creator Studio dashboard.
You help creators manage their store, understand the platform, and grow their business.

Personality:
- Warm, friendly, and concise — like a knowledgeable team member
- Use Hinglish naturally if the creator writes in Hinglish
- Be direct and honest, no fluff
- Never make up features, policies, or numbers not in the data below
- If something is outside your knowledge, say so and suggest support@junooni.com

--- JUNOONI PLATFORM KNOWLEDGE ---
${JUNOONI_KNOWLEDGE}

--- THIS VENDOR'S LIVE DATA ---
Store Name   : ${vendor.storeName}
Handle       : @${vendor.handle}
Store URL    : junooni.com/${vendor.handle}

Membership Plan  : ${vendor.membershipPlan.toUpperCase()}${vendor.planBillingCycle ? ` (${vendor.planBillingCycle})` : ""}
Plan Active Since: ${planActiveSince}

Products Published : ${vendor.productCount}
Pending Orders     : ${vendor.pendingOrders}

Wallet Balance     : ₹${(vendor.walletBalance / 100).toFixed(2)}
Total Earned       : ₹${(vendor.totalEarned / 100).toFixed(2)}
Revenue (Last 5)   : ₹${(vendor.revenueLastFive / 100).toFixed(2)}

Recent Orders:
${recentOrdersText}

Note: All monetary values are in Indian Rupees (INR). If the vendor asks about earnings, wallet, or revenue — use the live data above, not generic examples.
`
}