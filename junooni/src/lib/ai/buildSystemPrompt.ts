import { JUNOONI_KNOWLEDGE } from "./knowledgeBase"
import { buildPageContext } from "./pageGuide"

export interface VendorContext {
  storeName: string
  handle: string
  membershipPlan: "free" | "creator" | "studio"
  planBillingCycle: string | null
  planActivatedAt: string | null
  productCount: number
  marketplaceCount: number
  ownStoreCount: number
  bothChannelsCount: number
  pendingOrders: number
  walletBalance: number   // in paise
  totalEarned: number     // in paise
  revenueLastFive: number // in rupees
  recentOrders: Array<{
    id: string
    customerName: string
    total: number          // customer-facing order total in rupees
    payout: number         // vendor actual earnings after all fees
    processingFee: number  // gateway/processing fee deducted
    paymentMethod: string  // "razorpay" | "cod"
    displayStatus: string
    paymentStatus: string
    createdAt: string | null
  }>
  allOrders: Array<{
    id: string
    customerName: string
    total: number
    payout: number
    processingFee: number
    paymentMethod: string
    displayStatus: string
    paymentStatus: string
    createdAt: string | null
  }>
  vendorStore: {
    id: string
    subdomain: string | null
    customDomain: string | null
    domainVerified: boolean
    template: string
    status: string
    passwordEnabled: boolean
    primaryColor: string | null
    secondaryColor: string | null
    font: string | null
    seoTitle: string | null
    seoDescription: string | null
    tagline: string | null
    announcementText: string | null
    sectionsCount: number
    pagesCount: number
    collectionsCount: number
    storeUrl: string
  } | null
}

function formatOrderLine(o: VendorContext["allOrders"][0]): string {
  const date = o.createdAt
    ? new Date(o.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A"
  return [
    `- ${o.id}: ${o.customerName}`,
    `order total: ₹${o.total.toFixed(0)}`,
    `your payout: ₹${o.payout.toFixed(2)}`,
    `fee: ₹${o.processingFee.toFixed(2)}`,
    `payment: ${o.paymentMethod}`,
    `status: ${o.displayStatus}`,
    `date: ${date}`,
  ].join(" | ")
}

export function buildSystemPrompt(vendor: VendorContext, currentPage?: string): string {
  const recentOrdersText = vendor.recentOrders?.length
    ? vendor.recentOrders.map(formatOrderLine).join("\n")
    : "No recent orders yet."

  const allOrdersText = vendor.allOrders?.length
    ? vendor.allOrders.map(formatOrderLine).join("\n")
    : "No orders yet."

  const planActiveSince = vendor.planActivatedAt
    ? new Date(vendor.planActivatedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A"

  const pageContext = buildPageContext(currentPage)

  const ownStoreSection = vendor.vendorStore
    ? `
--- OWN STORE DATA ---
Store URL       : ${vendor.vendorStore.storeUrl}
Status          : ${vendor.vendorStore.status.toUpperCase()}
Template        : ${vendor.vendorStore.template}
Password Lock   : ${vendor.vendorStore.passwordEnabled ? "Yes — store is password protected" : "No"}
Custom Domain   : ${
  vendor.vendorStore.customDomain
    ? `${vendor.vendorStore.customDomain} (${vendor.vendorStore.domainVerified ? "verified ✅" : "not verified yet ⚠️"})`
    : "Not set"
}
Subdomain       : ${vendor.vendorStore.subdomain ? `${vendor.vendorStore.subdomain}.junooni.com` : "Not set"}
Font            : ${vendor.vendorStore.font ?? "default"}
Primary Color   : ${vendor.vendorStore.primaryColor ?? "not set"}
Secondary Color : ${vendor.vendorStore.secondaryColor ?? "not set"}
SEO Title       : ${vendor.vendorStore.seoTitle ?? "not set"}
SEO Description : ${vendor.vendorStore.seoDescription ?? "not set"}
Tagline         : ${vendor.vendorStore.tagline ?? "not set"}
Announcement    : ${vendor.vendorStore.announcementText ?? "none"}
Sections        : ${vendor.vendorStore.sectionsCount} configured
Custom Pages    : ${vendor.vendorStore.pagesCount} (e.g. Terms, Privacy, Returns)
Collections     : ${vendor.vendorStore.collectionsCount} configured

Store Status Guide:
- "draft"  → store is not live yet, only you can see it
- "live"   → store is public and accessible to customers
- "paused" → store is temporarily hidden from customers
`
    : `
--- OWN STORE DATA ---
This creator does not have an own store set up yet.
They can enable it from the My Store section in Creator Studio.
`

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

Products Published : ${vendor.productCount} total
  - On JUNOONI Marketplace : ${vendor.marketplaceCount}
  - On Own Store           : ${vendor.ownStoreCount}
  - On Both Channels       : ${vendor.bothChannelsCount}

Pending Orders     : ${vendor.pendingOrders}

Wallet Balance     : ₹${(vendor.walletBalance / 100).toFixed(2)}
Total Earned       : ₹${(vendor.totalEarned / 100).toFixed(2)}
Revenue (Last 5)   : ₹${vendor.revenueLastFive.toFixed(2)}
${ownStoreSection}
Recent Orders (last 5):
${recentOrdersText}

All Orders (use this to answer any order number lookup):
${allOrdersText}

--- PRODUCT CHANNEL GUIDE ---
JUNOONI has two places where a creator's products can appear:
- JUNOONI Marketplace (junooni.com) — the shared marketplace where all creators list products.
- Own Store (handle.junooni.com or custom domain) — the creator's personal storefront powered by JUNOONI.
A product can be on one or both. Use the counts above to answer questions like
"how many products are on my store?" or "how many are on the marketplace?"

--- PAYOUT CALCULATION GUIDE ---
Each order shows two amounts:
- "order total" → what the customer paid (full price)
- "your payout" → what YOU actually earn after all deductions

For JUNOONI-fulfillment products (JUNOONI prints and ships):
  Payout = (Item Price - GST) - (Qikink production cost × quantity) - processing fee

For Creator-fulfillment products (you handle shipping yourself):
  Payout = Item Price × 90% - processing fee

Processing fees:
- Razorpay online payment: 2% gateway fee + 18% GST on that fee (~2.36% total)
- COD orders: no processing fee

If a creator asks "how much will I earn" or "what is my payout" for any order,
use the "your payout" field from the order data above — do not recalculate.
If they ask about a specific order number, look it up in All Orders and show:
  Order [ID] — Customer paid ₹[total], your payout is ₹[payout] (after ₹[fee] processing fee)

--- ORDER STATUS GUIDE ---
Each order has a single "displayStatus" field. Use ONLY this to answer order status questions:
- "delivered"            → order has been delivered to the customer ✅
- "partially_delivered"  → some items delivered, rest still in transit
- "shipped"              → order is fully shipped, in transit
- "partially_shipped"    → some items shipped, rest pending
- "pending_fulfillment"  → order placed and paid, not yet shipped
- "canceled"             → order was cancelled

CRITICAL: The internal Medusa order.status field "pending" does NOT mean undelivered.
Medusa keeps order.status = "pending" throughout the entire lifecycle, even after delivery.
You will NEVER see or use that raw field — only use the displayStatus provided above.

For multi-vendor orders (where a customer bought from multiple creators at once),
each vendor's displayStatus reflects ONLY their own items — not the other vendor's items.
So an order can show "delivered" for one vendor and "pending_fulfillment" for another.

Example: displayStatus="delivered"           → order is delivered ✅
Example: displayStatus="pending_fulfillment" → order is placed, not yet shipped
Example: displayStatus="partially_delivered" → some items delivered, some still in transit
Example: displayStatus="canceled"            → order was cancelled
${pageContext}
Note: All monetary values are in Indian Rupees (INR).
- Wallet Balance and Total Earned are lifetime figures from your payout ledger.
- Revenue (Last 5) is the sum of your 5 most recent order totals in rupees.
- Order amounts are customer-facing totals in rupees.
- Payout amounts are your actual earnings after production cost and fees.
If the vendor asks about earnings, wallet, or revenue — use the live data above, not generic examples.
`
}