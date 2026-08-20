// ─── toolHandlers.ts ──────────────────────────────────────────────────────────
// One handler per tool declared in toolDefinitions.ts.
// Each handler receives the pre-built VendorContext and tool args,
// returns a plain object that gets sent back to Gemini as the tool result.
// No DB calls here — all data comes from VendorContext already fetched.

import { VendorContext } from "./buildSystemPrompt"

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToolName =
  | "get_store_overview"
  | "get_orders"
  | "get_earnings"
  | "get_products"
  | "get_order_detail"
  | "get_own_store"
  | "get_pending_actions"

export type ToolArgs = Record<string, any>

export type ToolResult =
  | { ok: true;  data: Record<string, any> }
  | { ok: false; error: string }

// ─── Router ───────────────────────────────────────────────────────────────────

export function handleTool(
  name: ToolName,
  args: ToolArgs,
  vendor: VendorContext
): ToolResult {
  try {
    switch (name) {
      case "get_store_overview":  return getStoreOverview(vendor)
      case "get_orders":          return getOrders(args, vendor)
      case "get_earnings":        return getEarnings(args, vendor)
      case "get_products":        return getProducts(args, vendor)
      case "get_order_detail":    return getOrderDetail(args, vendor)
      case "get_own_store":       return getOwnStore(vendor)
      case "get_pending_actions": return getPendingActions(vendor)
      default:
        return { ok: false, error: `Unknown tool: ${name}` }
    }
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Tool handler error" }
  }
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

function getStoreOverview(vendor: VendorContext): ToolResult {
  return {
    ok: true,
    data: {
      store_name:          vendor.storeName,
      handle:              `@${vendor.handle}`,
      marketplace_url:     `junooni.com/@${vendor.handle}`,
      membership_plan:     vendor.membershipPlan,
      plan_billing_cycle:  vendor.planBillingCycle ?? "N/A",
      plan_active_since:   vendor.planActivatedAt
                             ? new Date(vendor.planActivatedAt).toLocaleDateString("en-IN")
                             : "N/A",
      products_published:  vendor.productCount,
      on_marketplace:      vendor.marketplaceCount,
      on_own_store:        vendor.ownStoreCount,
      on_both_channels:    vendor.bothChannelsCount,
      pending_orders:      vendor.pendingOrders,
      wallet_balance_inr:  (vendor.walletBalance / 100).toFixed(2),
      total_earned_inr:    (vendor.totalEarned / 100).toFixed(2),
      own_store_status:    vendor.vendorStore?.status ?? "not_set_up",
      own_store_url:       vendor.vendorStore?.storeUrl ?? null,
    },
  }
}

function getOrders(args: ToolArgs, vendor: VendorContext): ToolResult {
  const status = args.status ?? "all"
  const limit  = Math.min(Number(args.limit ?? 10), 50)

  let orders = vendor.allOrders ?? []

  if (status !== "all") {
    orders = orders.filter((o) => o.displayStatus === status)
  }

  orders = orders.slice(0, limit)

  return {
    ok: true,
    data: {
      total_matching: orders.length,
      filter_applied: status,
      orders: orders.map((o) => ({
        id:             o.id,
        customer:       o.customerName,
        order_total:    `₹${o.total.toFixed(0)}`,
        your_payout:    `₹${o.payout.toFixed(2)}`,
        processing_fee: `₹${o.processingFee.toFixed(2)}`,
        payment_method: o.paymentMethod,
        status:         o.displayStatus,
        payment_status: o.paymentStatus,
        date:           o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })
                          : "N/A",
      })),
    },
  }
}

function getEarnings(args: ToolArgs, vendor: VendorContext): ToolResult {
  const includeBreakdown = args.include_order_breakdown ?? false

  const totalPayoutFromOrders = (vendor.allOrders ?? []).reduce(
    (sum, o) => sum + (o.payout ?? 0),
    0
  )

  const result: Record<string, any> = {
    wallet_balance_inr:          (vendor.walletBalance / 100).toFixed(2),
    total_earned_lifetime_inr:   (vendor.totalEarned / 100).toFixed(2),
    revenue_last_5_orders_inr:   vendor.revenueLastFive.toFixed(2),
    total_payout_all_orders_inr: totalPayoutFromOrders.toFixed(2),
    total_orders:                (vendor.allOrders ?? []).length,
    note: "wallet_balance is withdrawable amount. total_earned is lifetime cumulative.",
  }

  if (includeBreakdown) {
    result.order_payouts = (vendor.allOrders ?? []).slice(0, 20).map((o) => ({
      id:       o.id,
      payout:   `₹${o.payout.toFixed(2)}`,
      fee:      `₹${o.processingFee.toFixed(2)}`,
      payment:  o.paymentMethod,
      status:   o.displayStatus,
    }))
  }

  return { ok: true, data: result }
}

function getProducts(args: ToolArgs, vendor: VendorContext): ToolResult {
  const channel = args.channel ?? "all"

  const counts: Record<string, any> = {
    total_published: vendor.productCount,
    on_marketplace:  vendor.marketplaceCount,
    on_own_store:    vendor.ownStoreCount,
    on_both:         vendor.bothChannelsCount,
  }

  let summary = ""
  switch (channel) {
    case "marketplace":
      summary = `${vendor.marketplaceCount} products on JUNOONI Marketplace`
      break
    case "own_store":
      summary = `${vendor.ownStoreCount} products on own store (${vendor.vendorStore?.storeUrl ?? "not set up"})`
      break
    case "both":
      summary = `${vendor.bothChannelsCount} products live on both Marketplace and Own Store`
      break
    default:
      summary = `${vendor.productCount} total published products`
  }

  return {
    ok: true,
    data: {
      summary,
      channel_filter: channel,
      counts,
      channel_guide: {
        marketplace: "junooni.com — shared marketplace, all creators",
        own_store:   vendor.vendorStore?.storeUrl ?? "not configured yet",
      },
    },
  }
}

function getOrderDetail(args: ToolArgs, vendor: VendorContext): ToolResult {
  const rawId = String(args.order_id ?? "").replace(/^#/, "").trim()
  if (!rawId) return { ok: false, error: "order_id is required" }

  const order = (vendor.allOrders ?? []).find(
    (o) =>
      o.id === `#${rawId}` ||
      o.id === rawId ||
      o.id.replace(/^#/, "") === rawId
  )

  if (!order) {
    return {
      ok: false,
      error: `Order #${rawId} not found in your orders. It may belong to another vendor or not exist.`,
    }
  }

  return {
    ok: true,
    data: {
      id:             order.id,
      customer:       order.customerName,
      order_total:    `₹${order.total.toFixed(0)}`,
      your_payout:    `₹${order.payout.toFixed(2)}`,
      processing_fee: `₹${order.processingFee.toFixed(2)}`,
      payment_method: order.paymentMethod,
      status:         order.displayStatus,
      payment_status: order.paymentStatus,
      date:           order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "N/A",
    },
  }
}

function getOwnStore(vendor: VendorContext): ToolResult {
  if (!vendor.vendorStore) {
    return {
      ok: true,
      data: {
        set_up: false,
        message: "No own store configured yet. Go to My Store in Creator Studio to set it up.",
      },
    }
  }

  const s = vendor.vendorStore
  return {
    ok: true,
    data: {
      set_up:            true,
      store_url:         s.storeUrl,
      status:            s.status,
      is_live:           s.status === "live",
      template:          s.template,
      subdomain:         s.subdomain ? `${s.subdomain}.junooni.com` : null,
      custom_domain:     s.customDomain ?? null,
      domain_verified:   s.domainVerified,
      password_locked:   s.passwordEnabled,
      primary_color:     s.primaryColor ?? "not set",
      secondary_color:   s.secondaryColor ?? "not set",
      font:              s.font ?? "default",
      seo_title:         s.seoTitle ?? "not set",
      seo_description:   s.seoDescription ?? "not set",
      tagline:           s.tagline ?? "not set",
      announcement:      s.announcementText ?? "none",
      sections_count:    s.sectionsCount,
      pages_count:       s.pagesCount,
      collections_count: s.collectionsCount,
      status_guide: {
        draft:  "Store is not live yet, only you can see it",
        live:   "Store is public and accessible to customers",
        paused: "Store is temporarily hidden from customers",
      },
    },
  }
}

function getPendingActions(vendor: VendorContext): ToolResult {
  const actions: string[] = []

  if (vendor.pendingOrders > 0) {
    actions.push(
      `📦 You have ${vendor.pendingOrders} pending order${vendor.pendingOrders > 1 ? "s" : ""} waiting to be fulfilled`
    )
  }

  if (vendor.productCount === 0) {
    actions.push("🎨 Add your first product — go to Products > Add Product")
  }

  if (!vendor.vendorStore) {
    actions.push("🏪 Set up your own store — go to My Store in Creator Studio")
  } else {
    if (vendor.vendorStore.status === "draft") {
      actions.push("🚀 Your own store is in Draft — publish it to make it live")
    }
    if (!vendor.vendorStore.seoTitle) {
      actions.push("🔍 Add SEO title to your store for better discoverability")
    }
    if (!vendor.vendorStore.tagline) {
      actions.push("✍️ Add a tagline to your store from the Store Editor")
    }
    if (vendor.vendorStore.sectionsCount === 0) {
      actions.push("🖼️ Add sections to your own store (hero banner, featured products, etc.)")
    }
  }

  if (vendor.membershipPlan === "free" && vendor.productCount >= 3) {
    actions.push("⭐ Consider upgrading to Creator Plan (₹899/mo) for more products and features")
  }

  if ((vendor.walletBalance / 100) >= 500) {
    actions.push(
      `💰 You have ₹${(vendor.walletBalance / 100).toFixed(0)} in your wallet — you can withdraw now (min ₹500)`
    )
  }

  return {
    ok: true,
    data: {
      pending_actions_count: actions.length,
      actions: actions.length > 0 ? actions : ["✅ Everything looks good! No pending actions."],
    },
  }
}