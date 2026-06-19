// src/app/[handle]/order/[orderId]/page.tsx
// Order confirmation + tracking page for creator store

import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  CheckCircle2, ArrowRight, MapPin, Truck, Check,
  Clock, Package, AlertCircle, ExternalLink, ShoppingBag
} from "lucide-react"

interface Props {
  params: { handle: string; orderId: string }
}

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

// ── Fetch order from Medusa ───────────────────────────────────────────────────

async function fetchOrder(orderId: string) {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/orders/${orderId}?fields=*fulfillments,*fulfillments.labels,*shipping_address,*shipping_methods,*items,*items.variant,*items.thumbnail,*payment_collections,*payment_collections.payments`,
      {
        cache: "no-store",
        headers: {
          "x-publishable-api-key": PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.order ?? null
  } catch {
    return null
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  })
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(amount)
}

function getTrackingInfo(order: any) {
  if (!order.fulfillments?.length) return null
  for (const fulfillment of order.fulfillments) {
    if (fulfillment.labels?.length > 0) {
      const label = fulfillment.labels[0]
      if (label.tracking_number?.trim()) {
        return {
          trackingNumber: label.tracking_number,
          trackingUrl: label.tracking_url || label.tracking_number,
          shippedAt: fulfillment.shipped_at,
          deliveredAt: fulfillment.delivered_at,
        }
      }
    }
  }
  return null
}

function getStatus(order: any) {
  if (order.status === "canceled" || order.payment_status === "refunded") return "canceled"
  if (!order.fulfillment_status || order.fulfillment_status === "not_fulfilled") {
    return order.payment_status === "captured" ? "payment_confirmed" : "pending"
  }
  if (order.fulfillment_status === "delivered") return "delivered"
  if (order.fulfillment_status === "shipped") return "shipped"
  return "processing"
}

function getTimelineSteps(order: any, status: string) {
  if (status === "canceled") {
    return [
      { title: "Order Placed", description: formatDate(order.created_at), done: true },
      { title: "Order Canceled", description: order.payment_status === "refunded" ? "Payment refunded" : "Order was canceled", done: false, canceled: true },
    ]
  }
  return [
    { title: "Order Placed", description: formatDate(order.created_at), done: true },
    {
      title: "Payment Confirmed",
      description: order.payment_status === "captured" ? "Payment captured" : "Awaiting payment",
      done: order.payment_status === "captured",
    },
    {
      title: "Processing",
      description: status !== "pending" ? "Order being prepared" : "Will start after payment",
      done: status !== "pending" && status !== "canceled",
    },
    {
      title: "Shipped",
      description: status === "shipped" || status === "delivered"
        ? `Via ${order.shipping_methods?.[0]?.name ?? "Standard Shipping"}`
        : "Awaiting shipment",
      done: status === "shipped" || status === "delivered",
    },
    {
      title: "Delivered",
      description: status === "delivered"
        ? `Delivered to ${order.shipping_address?.first_name}`
        : "Estimated delivery TBD",
      done: status === "delivered",
    },
  ]
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function OrderPage({ params }: Props) {
  const { handle, orderId } = params

  const order = await fetchOrder(orderId)
  if (!order) notFound()

  const status = getStatus(order)
  const trackingInfo = getTrackingInfo(order)
  const timelineSteps = getTimelineSteps(order, status)
  const isNew = order.created_at && (Date.now() - new Date(order.created_at).getTime()) < 60000

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between max-w-3xl px-4 mx-auto h-14">
          <Link href={`/${handle}`} className="text-sm text-gray-500 transition-colors hover:text-gray-900">
            ← Back to store
          </Link>
          <span className="text-sm font-medium text-gray-700">Order Details</span>
        </div>
      </header>

      {/* ── Thank you banner ── */}
      <div className="border-b border-orange-100 bg-orange-50">
        <div className="flex items-center max-w-3xl gap-3 px-4 py-4 mx-auto">
          <div className="flex items-center justify-center bg-orange-100 rounded-full w-9 h-9 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">Thank you for your order! 🎉</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Your order has been placed successfully. You can track its status below.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl px-4 py-8 mx-auto space-y-5">

        {/* ── Success banner (shown right after order) ── */}
        {isNew && (
          <div className="p-6 text-center border border-green-200 bg-green-50 rounded-2xl">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="mb-1 text-xl font-bold text-green-900">Order Placed! 🎉</h1>
            <p className="text-sm text-green-700">
              Thank you! You'll receive a confirmation email shortly.
            </p>
          </div>
        )}

        {/* ── Order summary header ── */}
        <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Order ID</p>
              <p className="font-mono text-sm font-semibold text-gray-900">#{order.custom_display_id ?? orderId.slice(-8)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Date</p>
              <p className="text-sm text-gray-700">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Total</p>
              <p className="text-sm font-bold text-gray-900">{formatINR(order.total ?? 0)}</p>
            </div>
            <div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                status === "canceled"     ? "bg-red-100 text-red-800" :
                status === "delivered"   ? "bg-green-100 text-green-800" :
                status === "shipped"     ? "bg-blue-100 text-blue-800" :
                status === "processing"  ? "bg-purple-100 text-purple-800" :
                "bg-amber-100 text-amber-800"
              }`}>
                {status === "delivered" && <Check className="w-3 h-3" />}
                {status === "shipped" && <Truck className="w-3 h-3" />}
                {status === "processing" && <Package className="w-3 h-3" />}
                {status === "canceled" && <AlertCircle className="w-3 h-3" />}
                {status === "payment_confirmed" || status === "pending" ? <Clock className="w-3 h-3" /> : null}
                {{
                  canceled: "Canceled",
                  delivered: "Delivered",
                  shipped: "Shipped",
                  processing: "Processing",
                  payment_confirmed: "Confirmed",
                  pending: "Pending",
                }[status] ?? status}
              </span>
            </div>
          </div>
        </div>

        {/* ── Tracking banner ── */}
        {trackingInfo && (status === "shipped" || status === "delivered") && (
          <div className="p-5 border-2 border-orange-200 bg-orange-50 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-xl shrink-0">
                <Truck className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-orange-900 text-sm mb-0.5">Track Your Package</p>
                <p className="mb-1 text-xs text-orange-700">Your order is on its way.</p>
                {trackingInfo.shippedAt && (
                  <p className="text-xs text-orange-600">Shipped: {formatDate(trackingInfo.shippedAt)}</p>
                )}
                {trackingInfo.deliveredAt && (
                  <p className="text-xs font-medium text-green-700">Delivered: {formatDate(trackingInfo.deliveredAt)}</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <a
                href={trackingInfo.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors bg-orange-600 rounded-xl hover:bg-orange-700"
              >
                <Truck className="w-4 h-4" />
                Track Package
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* ── Timeline ── */}
        <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <h2 className="flex items-center gap-2 mb-5 text-sm font-bold text-gray-900">
            <Package className="w-4 h-4 text-gray-500" />
            Order Timeline
          </h2>
          <div className="space-y-0">
            {timelineSteps.map((step, i) => (
              <div key={i} className="flex gap-4">
                {/* Dot + line */}
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    (step as any).canceled ? "border-red-400 bg-red-50" :
                    step.done ? "border-orange-500 bg-orange-50" :
                    "border-gray-200 bg-gray-50"
                  }`}>
                    {(step as any).canceled
                      ? <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      : step.done
                      ? <Check className="w-3.5 h-3.5 text-orange-600" />
                      : <Clock className="w-3.5 h-3.5 text-gray-300" />
                    }
                  </div>
                  {i < timelineSteps.length - 1 && (
                    <div className={`w-0.5 flex-1 my-1 ${step.done ? "bg-orange-200" : "bg-gray-100"}`} style={{ minHeight: "24px" }} />
                  )}
                </div>
                {/* Content */}
                <div className="pb-5">
                  <p className={`text-sm font-semibold ${step.done ? "text-gray-900" : "text-gray-400"}`}>
                    {step.title}
                  </p>
                  <p className={`text-xs mt-0.5 ${step.done ? "text-gray-500" : "text-gray-300"}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Shipping info ── */}
        <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <h2 className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900">
            <MapPin className="w-4 h-4 text-gray-500" />
            Shipping Information
          </h2>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Deliver to</p>
              <p className="font-medium text-gray-900">{order.shipping_address?.first_name} {order.shipping_address?.last_name}</p>
              <p className="text-gray-600">{order.shipping_address?.address_1}</p>
              {order.shipping_address?.address_2 && <p className="text-gray-600">{order.shipping_address.address_2}</p>}
              <p className="text-gray-600">{order.shipping_address?.city}, {order.shipping_address?.province} {order.shipping_address?.postal_code}</p>
              <p className="text-gray-600">{order.shipping_address?.country_code?.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Contact</p>
              <p className="text-gray-700">{order.email}</p>
              {order.shipping_address?.phone && <p className="text-gray-700">{order.shipping_address.phone}</p>}
              <div className="mt-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Shipping Method</p>
                <p className="font-medium text-gray-900">{order.shipping_methods?.[0]?.name ?? "Standard Shipping"}</p>
                <p className="text-gray-600">{formatINR(order.shipping_methods?.[0]?.amount ?? 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Order items ── */}
        <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <h2 className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900">
            <ShoppingBag className="w-4 h-4 text-gray-500" />
            Items Ordered
          </h2>
          <div className="space-y-3">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-gray-50">
                <div className="relative overflow-hidden bg-gray-100 rounded-lg w-14 h-14 shrink-0">
                  {item.thumbnail && (
                    <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                  {item.variant?.title && item.variant.title !== "Default Title" && (
                    <p className="text-xs text-gray-400">{item.variant.title}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 shrink-0">
                  {formatINR((item.unit_price ?? 0) * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-4 mt-4 space-y-2 border-t border-gray-100">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatINR(order.subtotal ?? 0)}</span>
            </div>
            {(order.shipping_total ?? 0) > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span>{formatINR(order.shipping_total)}</span>
              </div>
            )}
            {(order.tax_total ?? 0) > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tax</span>
                <span>{formatINR(order.tax_total)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 text-base font-bold text-gray-900 border-t border-gray-100">
              <span>Total</span>
              <span>{formatINR(order.total ?? 0)}</span>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <Link
          href={`/${handle}`}
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm w-full"
          style={{ background: "linear-gradient(135deg, #e65100 0%, #ac1900 100%)" }}
        >
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>

      </div>
    </div>
  )
}