// junooni-dashboard/src/features/billing-history/index.tsx
// Transaction history for membership/subscription payments

import { useState, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  ArrowLeft, Receipt, CheckCircle2, XCircle,
  Clock, Download, RefreshCw, CreditCard,
  Calendar, IndianRupee, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:9000"
const BRAND = { primary: "#e65100", secondary: "#ac1900" }

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payment {
  id: string
  entity: string
  amount: number          // in paise
  currency: string
  status: "captured" | "failed" | "refunded" | "created" | "authorized"
  order_id?: string
  invoice_id?: string
  description?: string
  created_at: number      // unix timestamp
  method?: string
  error_description?: string
  refund_status?: string | null
}

interface Subscription {
  id: string
  plan_id: string
  status: string
  current_start?: number
  current_end?: number
  paid_count?: number
  remaining_count?: number
  charge_at?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function formatShortDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  })
}

function StatusBadge({ status }: { status: Payment["status"] }) {
  const config = {
    captured:   { label: "Paid",       color: "bg-green-100 text-green-800 border-green-200" },
    authorized: { label: "Authorized", color: "bg-blue-100 text-blue-800 border-blue-200" },
    created:    { label: "Pending",    color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    failed:     { label: "Failed",     color: "bg-red-100 text-red-800 border-red-200" },
    refunded:   { label: "Refunded",   color: "bg-gray-100 text-gray-700 border-gray-200" },
  }[status] ?? { label: status, color: "bg-gray-100 text-gray-600 border-gray-200" }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${config.color}`}>
      {status === "captured" && <CheckCircle2 className="w-3 h-3" />}
      {status === "failed" && <XCircle className="w-3 h-3" />}
      {status === "created" && <Clock className="w-3 h-3" />}
      {config.label}
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BillingHistoryPage() {
  const navigate = useNavigate()
  const [payments, setPayments] = useState<Payment[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>("free")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const token = localStorage.getItem("vendorToken") ?? ""

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const [vendorRes, subRes] = await Promise.all([
        fetch(`${BACKEND_URL}/vendors/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BACKEND_URL}/vendors/me/subscription`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (vendorRes.ok) {
        const vd = await vendorRes.json()
        setCurrentPlan(vd.vendor?.plan ?? "free")
      }

      if (subRes.ok) {
        const sd = await subRes.json()
        setSubscription(sd.subscription ?? null)
        setPayments(sd.payments ?? [])
      } else {
        // No subscription yet — show empty state
        setSubscription(null)
        setPayments([])
      }
    } catch (err) {
      setError("Failed to load billing history. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const totalPaid = payments
    .filter(p => p.status === "captured")
    .reduce((sum, p) => sum + p.amount, 0)

  const planLabel: Record<string, string> = {
    free: "Free", starter: "Starter", pro: "Pro", enterprise: "Enterprise"
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full border-t-transparent animate-spin"
            style={{ borderColor: BRAND.primary, borderTopColor: "transparent" }} />
          <p className="text-sm text-gray-500">Loading billing history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center max-w-5xl gap-3 px-4 mx-auto sm:px-6 h-14">
          <button onClick={() => navigate({ to: "/store/membership" })}
            className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-gray-600" />
            <h1 className="text-sm font-bold text-gray-900">Billing History</h1>
          </div>
          <div className="ml-auto">
            <button onClick={() => load(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl px-4 py-6 mx-auto space-y-5 sm:px-6">

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 border border-red-200 rounded-xl bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Current plan */}
          <div className="p-4 bg-white border border-gray-200 rounded-2xl">
            <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">Current Plan</p>
            <p className="text-lg font-bold text-gray-900">{planLabel[currentPlan] ?? currentPlan}</p>
            {currentPlan !== "free" && (
              <button onClick={() => navigate({ to: "/store/membership" })}
                className="mt-1 text-xs font-semibold"
                style={{ color: BRAND.primary }}>
                Manage →
              </button>
            )}
          </div>

          {/* Total paid */}
          <div className="p-4 bg-white border border-gray-200 rounded-2xl">
            <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">Total Paid</p>
            <p className="text-lg font-bold text-gray-900">{formatAmount(totalPaid)}</p>
            <p className="mt-1 text-xs text-gray-400">{payments.filter(p => p.status === "captured").length} payment{payments.filter(p => p.status === "captured").length !== 1 ? "s" : ""}</p>
          </div>

          {/* Next billing */}
          <div className="p-4 bg-white border border-gray-200 rounded-2xl">
            <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">Next Billing</p>
            {subscription?.charge_at ? (
              <>
                <p className="text-lg font-bold text-gray-900">{formatShortDate(subscription.charge_at)}</p>
                {/* <p className="mt-1 text-xs text-gray-400">
                  {subscription.remaining_count != null
                    ? `${subscription.remaining_count} payment${subscription.remaining_count !== 1 ? "s" : ""} remaining`
                    : "Auto-renews"}
                </p> */}
              </>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>
        </div>

        {/* Subscription info */}
        {subscription && (
          <div className="p-5 bg-white border border-gray-200 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-bold text-gray-900">Active Subscription</h2>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                subscription.status === "active" ? "bg-green-100 text-green-800" :
                subscription.status === "cancelled" ? "bg-red-100 text-red-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {subscription.status === "active" && <CheckCircle2 className="w-3 h-3" />}
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Subscription ID</p>
                <p className="font-mono text-xs text-gray-700 break-all">{subscription.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Billing period</p>
                <p className="text-gray-700">
                  {subscription.current_start ? formatShortDate(subscription.current_start) : "—"}
                  {" → "}
                  {subscription.current_end ? formatShortDate(subscription.current_end) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Paid cycles</p>
                <p className="text-gray-700">{subscription.paid_count ?? 0}</p>
              </div>
              {/* <div>
                <p className="text-xs text-gray-400 mb-0.5">Remaining</p>
                <p className="text-gray-700">{subscription.remaining_count ?? "—"}</p>
              </div> */}
            </div>
          </div>
        )}

        {/* Payment list */}
        <div className="overflow-hidden bg-white border border-gray-200 rounded-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Payment History</h2>
            {payments.length > 0 && (
              <span className="text-xs text-gray-400">{payments.length} transaction{payments.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="flex items-center justify-center w-12 h-12 mb-3 bg-gray-100 rounded-xl">
                <Receipt className="w-5 h-5 text-gray-400" />
              </div>
              <p className="mb-1 text-sm font-semibold text-gray-700">No transactions yet</p>
              <p className="max-w-xs text-xs text-gray-400">
                {currentPlan === "free"
                  ? "Upgrade to a paid plan to see billing history here."
                  : "Your payment history will appear here once payments are processed."}
              </p>
              {currentPlan === "free" && (
                <button onClick={() => navigate({ to: "/membership" })}
                  className="px-4 py-2 mt-4 text-sm font-semibold text-white transition-opacity rounded-xl hover:opacity-80"
                  style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
                  View Plans
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {payments.map(payment => (
                <div key={payment.id} className="flex items-start gap-4 px-5 py-4">
                  {/* Icon */}
                  <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                    payment.status === "captured" ? "bg-green-50" :
                    payment.status === "failed" ? "bg-red-50" :
                    "bg-yellow-50"
                  }`}>
                    {payment.status === "captured" && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    {payment.status === "failed" && <XCircle className="w-4 h-4 text-red-500" />}
                    {(payment.status === "created" || payment.status === "authorized") && <Clock className="w-4 h-4 text-yellow-600" />}
                    {payment.status === "refunded" && <RefreshCw className="w-4 h-4 text-gray-500" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatAmount(payment.amount)}
                      </p>
                      <StatusBadge status={payment.status} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(payment.created_at)}
                    </p>
                    {payment.method && (
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">{payment.method}</p>
                    )}
                    {payment.status === "failed" && payment.error_description && (
                      <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {payment.error_description}
                      </p>
                    )}
                    <p className="mt-1 font-mono text-xs text-gray-300">{payment.id}</p>
                  </div>

                  {/* Amount (right aligned on desktop) */}
                  <div className="hidden text-right sm:block shrink-0">
                    <p className="text-sm font-bold text-gray-900">{formatAmount(payment.amount)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{payment.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help note */}
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-orange-50 border border-orange-100">
          <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <div className="text-xs text-orange-700">
            <p className="font-semibold mb-0.5">Need help with a payment?</p>
            <p>For refunds, billing disputes, or payment issues, contact <a href="mailto:support@junooni.com" className="font-semibold underline">support@junooni.com</a> with your payment ID.</p>
          </div>
        </div>
      </div>
    </div>
  )
}