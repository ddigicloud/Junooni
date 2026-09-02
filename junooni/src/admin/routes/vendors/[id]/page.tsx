import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Heading, Label, Button, Text, Badge, toast, Textarea } from "@medusajs/ui";
import { Users } from "@medusajs/icons";
import CreatorFollowersTab from "./followers/page"
import CreatorPayoutTab from "./payout/page"
import CreatorPayoutDetailsTab from "./payout/payout-details/page"

const VENDOR_DASHBOARD_URL = import.meta.env.VITE_VENDOR_DASHBOARD_URL ?? "https://studio.junooni.com"

// ─── Plan config (mirrors membership.tsx) ────────────────────────────────────

const PLAN_META: Record<string, {
  label: string; color: string; bg: string; border: string
  product_limit: number; custom_domain: boolean; remove_branding: boolean
  priority_payouts: boolean; store_live: boolean
}> = {
  free: {
    label: "Free", color: "#6b7280", bg: "bg-gray-100", border: "border-gray-300",
    product_limit: 10, custom_domain: false, remove_branding: false,
    priority_payouts: false, store_live: false,
  },
  starter: {
    label: "Starter", color: "#3b82f6", bg: "bg-blue-50", border: "border-blue-300",
    product_limit: 50, custom_domain: false, remove_branding: true,
    priority_payouts: false, store_live: true,
  },
  pro: {
    label: "Pro", color: "#e65100", bg: "bg-orange-50", border: "border-orange-300",
    product_limit: -1, custom_domain: true, remove_branding: true,
    priority_payouts: true, store_live: true,
  },
  enterprise: {
    label: "Enterprise", color: "#8b5cf6", bg: "bg-purple-50", border: "border-purple-300",
    product_limit: -1, custom_domain: true, remove_branding: true,
    priority_payouts: true, store_live: true,
  },
}

const PLAN_OPTIONS = ["free", "starter", "pro", "enterprise"] as const

// ─── Types ────────────────────────────────────────────────────────────────────

interface Admin {
  id: string; email: string; first_name?: string; last_name?: string
  created_at: string; updated_at: string;
}

interface Vendor {
  id: string; name: string; handle?: string; logo?: string; coverphoto?: string
  youtube?: string; instagram?: string; xtwitter?: string; facebook?: string
  othersocial?: string; phonenumber?: string; GSTIN?: string; companyname?: string
  pan_number?: string; city?: string; pincode?: string; state?: string
  address?: string; tan_number?: string; bank_account_holder_name?: string
  bank_account_number?: string; bank_account_ifsc_code?: string; bank_name?: string
  bank_account_type?: "Saving" | "Current"; cancelled_checkque?: string
  creator_bio?: string; creator_title?: string; created_at: string; updated_at: string
  admins?: Admin[]; login_email?: string; auth_enabled?: boolean; last_login?: string
  verified?: "Yes" | "No"; gst_verification_status?: "pending" | "verified" | "failed"
  metadata?: Record<string, any>
  sell_on_marketplace?: boolean; sell_on_own_store?: boolean
  marketplace_status?: "none" | "pending" | "approved" | "rejected"
  marketplace_rejection_reason?: string | null
  marketplace_applied_at?: string | null
  marketplace_approved_at?: string | null
  plan?: string
  plan_billing_cycle?: string
  plan_activated_at?: string
  razorpay_subscription_id?: string
}

// ─── Delete confirmation modal ────────────────────────────────────────────────

const DeleteVendorModal = ({
  vendor,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  vendor: Vendor
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}) => {
  const [typedName, setTypedName] = useState("")
  const nameMatches = typedName.trim() === vendor.name.trim()

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden">

        {/* Red top bar */}
        <div className="h-1.5 w-full bg-red-600" />

        <div className="p-6">
          {/* Icon + heading */}
          <div className="flex items-start gap-4 mb-5">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-xl">🗑</span>
            </div>
            <div>
              <Heading level="h2" className="text-xl text-gray-900">
                Permanently delete creator?
              </Heading>
              <Text className="text-sm text-gray-500 mt-1">
                This cannot be undone.
              </Text>
            </div>
          </div>

          {/* What gets deleted */}
          <div className="mb-5 p-4 rounded-xl border border-red-100 bg-red-50 space-y-2">
            <Text className="text-sm font-semibold text-red-800 mb-2">
              The following will be permanently deleted:
            </Text>
            {[
              "Creator profile and account",
              "All products linked to this creator",
              "All artwork files and media assets",
              "All admin accounts for this creator",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 text-xs">✕</span>
                <Text className="text-sm text-red-700">{item}</Text>
              </div>
            ))}
          </div>

          {/* Type-to-confirm */}
          <div className="mb-6">
            <Label className="block text-sm text-gray-700 mb-2">
              Type <span className="font-mono font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">{vendor.name}</span> to confirm
            </Label>
            <input
              type="text"
              value={typedName}
              onChange={e => setTypedName(e.target.value)}
              placeholder={vendor.name}
              disabled={isDeleting}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: typedName && !nameMatches ? "#ef4444" : "#d1d5db",
              }}
            />
            {typedName && !nameMatches && (
              <Text className="text-xs text-red-500 mt-1">Name doesn't match.</Text>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              disabled={!nameMatches || isDeleting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all
                disabled:opacity-40 disabled:cursor-not-allowed
                bg-red-600 hover:bg-red-700 active:bg-red-800"
            >
              {isDeleting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete permanently"
              )}
            </button>
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const StoreModeRow = ({ vendor }: { vendor: Vendor }) => {
  const marketplace = vendor.sell_on_marketplace
  const ownStore = vendor.sell_on_own_store
  const neither = !marketplace && !ownStore
  return (
    <div className="flex flex-wrap gap-2">
      {neither && <Badge className="text-gray-600 bg-gray-100">Not set yet</Badge>}
      {marketplace && <Badge className="text-orange-800 bg-orange-100">Marketplace</Badge>}
      {ownStore    && <Badge className="text-green-800 bg-green-100">Own store</Badge>}
      {marketplace && ownStore && <Badge className="text-blue-800 bg-blue-100">Selling on both</Badge>}
    </div>
  )
}

function PlanBadge({ plan }: { plan?: string }) {
  const meta = PLAN_META[plan ?? "free"] ?? PLAN_META.free
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border"
      style={{ color: meta.color, borderColor: meta.color + "50", background: meta.color + "12" }}
    >
      {meta.label}
    </span>
  )
}

function CheckIcon({ ok }: { ok: boolean }) {
  return ok
    ? <span className="text-green-600 font-bold">✓</span>
    : <span className="text-gray-300">—</span>
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const CreatorDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [hasMetadata, setHasMetadata] = useState(false)
  const [isImpersonating, setIsImpersonating] = useState(false)

  // store mode
  const [isSavingStoreMode, setIsSavingStoreMode] = useState(false)
  const [storeModeEdit, setStoreModeEdit] = useState({ sell_on_marketplace: false, sell_on_own_store: false })

  // marketplace application
  const [isProcessingApplication, setIsProcessingApplication] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  // plan management
  const [isSavingPlan, setIsSavingPlan] = useState(false)
  const [planEdit, setPlanEdit] = useState<string>("free")
  const [razorpaySubDetails, setRazorpaySubDetails] = useState<any>(null)
  const [isLoadingSub, setIsLoadingSub] = useState(false)

  // ── delete ──────────────────────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => { fetchVendorDetails() }, [id])

  useEffect(() => {
    if (vendor) {
      setStoreModeEdit({
        sell_on_marketplace: vendor.sell_on_marketplace ?? false,
        sell_on_own_store: vendor.sell_on_own_store ?? false,
      })
      setPlanEdit(vendor.plan ?? "free")
    }
  }, [vendor])

  useEffect(() => {
    if (activeTab === "plan" && vendor?.razorpay_subscription_id && !razorpaySubDetails) {
      fetchRazorpaySub()
    }
  }, [activeTab, vendor])

  const fetchVendorDetails = async () => {
    try {
      setIsLoading(true); setError(null)
      const response = await fetch(`/vendors?vendor_id=${id}`, { credentials: "include" })
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)
      const data = await response.json()
      if (data.vendor) {
        setVendor(data.vendor)
        setHasMetadata(data.vendor.metadata && Object.keys(data.vendor.metadata).length > 0)
      } else {
        setError("Creator data not found")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRazorpaySub = async () => {
    if (!vendor?.razorpay_subscription_id) return
    setIsLoadingSub(true)
    try {
      const res = await fetch(`/vendors/me/subscription?vendor_id=${vendor.id}`, { credentials: "include" })
      if (res.ok) { const d = await res.json(); setRazorpaySubDetails(d.subscription) }
    } catch {}
    finally { setIsLoadingSub(false) }
  }

  // ── Permanent delete ─────────────────────────────────────────────────────────
  const handlePermanentDelete = async () => {
    if (!vendor) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/vendors/${vendor.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok && response.status !== 207) {
        throw new Error(data.message || `HTTP ${response.status}`)
      }

      // 207 = partial success (vendor deleted but some files/products had errors)
      if (response.status === 207) {
        toast.warning(
          `Creator deleted, but some cleanup failed: ${(data.errors ?? []).join("; ")}`
        )
      } else {
        toast.success(`${vendor.name} and all associated data have been permanently deleted.`)
      }

      setShowDeleteModal(false)
      navigate("/vendors")
    } catch (err) {
      toast.error(`Delete failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMarketplaceAction = async (action: "approve" | "reject") => {
    if (!vendor) return
    if (action === "reject" && !rejectReason.trim()) {
      toast.error("Please provide a rejection reason.")
      return
    }
    setIsProcessingApplication(true)
    try {
      const response = await fetch(`/admin/vendors/${vendor.id}/marketplace-application`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "approve" ? { action } : { action, reason: rejectReason.trim() }
        ),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`)

      setVendor(prev => prev ? {
        ...prev,
        marketplace_status: action === "approve" ? "approved" : "rejected",
        sell_on_marketplace: action === "approve",
        marketplace_rejection_reason: action === "reject" ? rejectReason.trim() : null,
      } : prev)
      setShowRejectForm(false)
      setRejectReason("")
      toast.success(action === "approve" ? "Creator approved for marketplace." : "Application rejected.")
    } catch (err) {
      toast.error(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsProcessingApplication(false)
    }
  }

  const handleSaveStoreMode = async () => {
    if (!vendor) return
    setIsSavingStoreMode(true)
    try {
      const payload: any = { ...storeModeEdit }
      if (storeModeEdit.sell_on_marketplace && vendor.marketplace_status !== "approved") {
        payload.marketplace_status = "approved"
        payload.marketplace_approved_at = new Date().toISOString()
        payload.marketplace_rejection_reason = null
      } else if (!storeModeEdit.sell_on_marketplace && vendor.marketplace_status === "approved") {
        payload.marketplace_status = "none"
      }

      const response = await fetch(`/vendors/${vendor.id}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      setVendor(prev => prev ? { ...prev, ...storeModeEdit, ...payload } : prev)
      toast.success("Store mode updated.")
    } catch (err) {
      toast.error(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally { setIsSavingStoreMode(false) }
  }

  const handleSavePlan = async () => {
    if (!vendor) return
    setIsSavingPlan(true)
    try {
      const response = await fetch(`/vendors/${vendor.id}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planEdit }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      setVendor(prev => prev ? { ...prev, plan: planEdit } : prev)
      toast.success(`Plan updated to ${PLAN_META[planEdit]?.label ?? planEdit}.`)
    } catch (err) {
      toast.error(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally { setIsSavingPlan(false) }
  }

  const handleCancelSubscription = async () => {
    if (!vendor?.razorpay_subscription_id) return
    if (!confirm("This will cancel the creator's Razorpay subscription at end of billing period. Continue?")) return
    try {
      await fetch(`/vendors/me/subscription?action=cancel`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendor_id: vendor.id }),
      })
      toast.success("Subscription cancellation scheduled.")
      await fetchRazorpaySub()
    } catch (err) {
      toast.error(`Failed: ${err instanceof Error ? err.message : "Unknown"}`)
    }
  }

  const handleLoginAsVendor = async () => {
    if (!vendor) return
    setIsImpersonating(true)
    try {
      const vendorAdminId = vendor.admins?.[0]?.id
      if (!vendorAdminId) { toast.error("This vendor has no admin account."); return }
      const response = await fetch("/admin/impersonate", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendor_admin_id: vendorAdminId }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (!data.token) throw new Error("No token returned")
      const url = new URL(`${VENDOR_DASHBOARD_URL}/sign-in`)
      url.searchParams.set("impersonate", data.token)
      window.open(url.toString(), "_blank", "noopener,noreferrer")
      toast.success(`Opened ${vendor.name}'s dashboard.`)
    } catch (err) {
      toast.error(`Login as vendor failed: ${err instanceof Error ? err.message : "Unknown"}`)
    } finally { setIsImpersonating(false) }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    })
  }

  if (isLoading) return <Container className="py-8"><div className="flex items-center justify-center h-40"><Text>Loading...</Text></div></Container>
  if (error) return <Container className="py-8"><div className="p-4 text-red-600 border border-red-300 rounded bg-red-50"><Heading level="h2" className="mb-2">Error</Heading><Text>{error}</Text><Button variant="secondary" className="mt-4" onClick={() => navigate("/vendors")}>Back</Button></div></Container>
  if (!vendor) return <Container className="py-8"><Text>Creator not found.</Text></Container>

  const activePlanMeta = PLAN_META[vendor.plan ?? "free"] ?? PLAN_META.free

  return (
    <Container className="py-8">

      {/* ── Delete confirmation modal ──────────────────────────────────────── */}
      {showDeleteModal && (
        <DeleteVendorModal
          vendor={vendor}
          onConfirm={handlePermanentDelete}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
        />
      )}

      {/* Cover + logo */}
      <div className="relative mb-8">
        <div className="h-48 overflow-hidden bg-gray-200 rounded-lg">
          {vendor.coverphoto
            ? <img src={vendor.coverphoto} alt="Cover" className="object-cover w-full h-full" />
            : <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gray-100">No cover photo</div>}
        </div>
        <div className="absolute bottom-0 flex items-end transform translate-y-1/2 left-6">
          <div className="w-24 h-24 overflow-hidden bg-white border-4 border-white rounded-lg">
            {vendor.logo
              ? <img src={vendor.logo} alt="logo" className="object-cover w-full h-full" />
              : <div className="flex items-center justify-center w-full h-full font-bold text-gray-500 bg-gray-100">{vendor.name.substring(0, 2).toUpperCase()}</div>}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary" onClick={handleLoginAsVendor} isLoading={isImpersonating} disabled={isImpersonating || !vendor.admins?.length}>
            <Users className="mr-1.5" />Login as Vendor
          </Button>
          <Button variant="secondary" onClick={() => navigate("/vendors")}>Back to Creators</Button>
        </div>
      </div>

      {/* Name + badges */}
      <div className="pt-2 pl-32 mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Heading level="h1" className="text-2xl">{vendor.name}</Heading>
          {vendor.verified === "Yes" && <Badge className="text-green-800 bg-green-100">Verified</Badge>}
          {vendor.gst_verification_status === "verified" && <Badge className="text-blue-800 bg-blue-100">GST Verified</Badge>}
          {vendor.sell_on_marketplace && <Badge className="text-orange-800 bg-orange-100">Marketplace</Badge>}
          {vendor.sell_on_own_store && <Badge className="text-green-800 bg-green-100">Own store</Badge>}
          {vendor.marketplace_status === "pending" && <Badge className="text-amber-800 bg-amber-100">Marketplace: Pending review</Badge>}
          {vendor.marketplace_status === "rejected" && <Badge className="text-red-800 bg-red-100">Marketplace: Rejected</Badge>}
          <PlanBadge plan={vendor.plan} />
        </div>
        <Text className="text-gray-500">{vendor.creator_title || "No title set"}</Text>
        {vendor.handle && <Badge className="mt-2">@{vendor.handle}</Badge>}
      </div>

      {/* Tab nav */}
      <div className="mb-6 border-b">
        <div className="flex flex-wrap gap-6">
          {[
            { key: "basic",          label: "Basic Info" },
            { key: "plan",           label: "Plan & Billing" },
            { key: "store-mode",     label: "Store mode" },
            { key: "profile",        label: "Profile & Social" },
            { key: "business",       label: "Business" },
            { key: "banking",        label: "Banking" },
            { key: "payout",         label: "Payout" },
            { key: "payout-details", label: "Payout Details" },
            { key: "followers",      label: "Followers" },
            { key: "admins",         label: "Admins" },
          ].map(tab => (
            <Button key={tab.key} variant="transparent"
              className={`py-2 px-1 border-b-2 rounded-none ${activeTab === tab.key ? "border-blue-500" : "border-transparent"}`}
              onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </Button>
          ))}
          {hasMetadata && (
            <Button variant="transparent"
              className={`py-2 px-1 border-b-2 rounded-none ${activeTab === "metadata" ? "border-blue-500" : "border-transparent"}`}
              onClick={() => setActiveTab("metadata")}>
              Metadata
            </Button>
          )}
        </div>
      </div>

      {/* ══ PLAN & BILLING TAB ══════════════════════════════════════════════ */}
      {activeTab === "plan" && (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl border-2 ${activePlanMeta.border} ${activePlanMeta.bg}`}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Heading level="h2" className="text-xl">Current plan</Heading>
                  <PlanBadge plan={vendor.plan} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2 text-sm">
                  <div>
                    <Label className="text-xs text-gray-500 block">Billing cycle</Label>
                    <Text className="font-medium capitalize">{vendor.plan_billing_cycle ?? "—"}</Text>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 block">Activated on</Label>
                    <Text className="font-medium">{vendor.plan_activated_at ? formatDate(vendor.plan_activated_at) : "—"}</Text>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 block">Razorpay Subscription ID</Label>
                    <Text className="font-mono text-xs break-all">{vendor.razorpay_subscription_id ?? "—"}</Text>
                  </div>
                </div>
              </div>
              {vendor.razorpay_subscription_id && (
                <Button variant="danger" size="small" onClick={handleCancelSubscription}>
                  Cancel subscription
                </Button>
              )}
            </div>
          </div>

          <div className="p-6 bg-white border rounded-xl">
            <Heading level="h2" className="text-xl mb-4">Plan features</Heading>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Product limit", value: activePlanMeta.product_limit === -1 ? "Unlimited" : String(activePlanMeta.product_limit) },
                { label: "Store can go live",         bool: activePlanMeta.store_live },
                { label: "Remove Junooni branding",   bool: activePlanMeta.remove_branding },
                { label: "Custom domain",             bool: activePlanMeta.custom_domain },
                { label: "Priority payouts (T+3)",    bool: activePlanMeta.priority_payouts },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg border bg-gray-50 flex items-center gap-2">
                  {"bool" in item
                    ? <CheckIcon ok={item.bool!} />
                    : <span className="text-orange-600 font-bold text-sm">{item.value}</span>}
                  <Label className="text-sm">{item.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {vendor.razorpay_subscription_id && (
            <div className="p-6 bg-white border rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <Heading level="h2" className="text-xl">Razorpay subscription</Heading>
                <Button variant="secondary" size="small" onClick={fetchRazorpaySub}>Refresh</Button>
              </div>
              {isLoadingSub ? (
                <Text className="text-gray-400">Loading...</Text>
              ) : razorpaySubDetails ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  {[
                    { label: "Subscription ID",  value: razorpaySubDetails.id },
                    { label: "Status",           value: razorpaySubDetails.status },
                    { label: "Plan ID",          value: razorpaySubDetails.plan_id },
                    { label: "Paid count",       value: String(razorpaySubDetails.paid_count ?? "—") },
                    { label: "Remaining count",  value: String(razorpaySubDetails.remaining_count ?? "—") },
                    { label: "Current start",    value: razorpaySubDetails.current_start ? new Date(razorpaySubDetails.current_start * 1000).toLocaleDateString() : "—" },
                    { label: "Current end",      value: razorpaySubDetails.current_end ? new Date(razorpaySubDetails.current_end * 1000).toLocaleDateString() : "—" },
                    { label: "Charge at",        value: razorpaySubDetails.charge_at ? new Date(razorpaySubDetails.charge_at * 1000).toLocaleDateString() : "—" },
                  ].map(({ label, value }, i) => (
                    <div key={i} className="p-3 rounded-lg bg-gray-50 border">
                      <Label className="block text-xs text-gray-500 mb-0.5">{label}</Label>
                      <Text className="font-mono text-xs break-all">{value}</Text>
                    </div>
                  ))}
                </div>
              ) : (
                <Text className="text-gray-400 text-sm">Could not load Razorpay details. Check backend logs.</Text>
              )}
            </div>
          )}

          <div className="p-6 bg-white border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-100">
                <span className="text-amber-600 text-sm">⚠</span>
              </div>
              <div>
                <Heading level="h2" className="text-xl">Admin override</Heading>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Manually set this creator's plan. Use for gifting, corrections, or enterprise deals. This does <strong>not</strong> create a Razorpay subscription.
                </Text>
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-48">
                <Label className="block mb-2 text-sm">Set plan to</Label>
                <select
                  value={planEdit}
                  onChange={e => setPlanEdit(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                >
                  {PLAN_OPTIONS.map(p => (
                    <option key={p} value={p}>{PLAN_META[p].label}</option>
                  ))}
                </select>
              </div>
              <Button
                variant="primary"
                onClick={handleSavePlan}
                disabled={isSavingPlan || planEdit === (vendor.plan ?? "free")}
                isLoading={isSavingPlan}
              >
                Apply override
              </Button>
            </div>
            {planEdit !== (vendor.plan ?? "free") && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                This will change the plan from <strong>{activePlanMeta.label}</strong> → <strong>{PLAN_META[planEdit]?.label}</strong> immediately.
              </div>
            )}
          </div>

          <div className="p-6 bg-white border rounded-xl overflow-x-auto">
            <Heading level="h2" className="text-xl mb-4">All plans reference</Heading>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium">Feature</th>
                  {PLAN_OPTIONS.map(p => (
                    <th key={p} className={`py-2 px-3 text-center font-semibold ${p === (vendor.plan ?? "free") ? "text-orange-600 bg-orange-50 rounded-t" : "text-gray-700"}`}>
                      {PLAN_META[p].label}
                      {p === (vendor.plan ?? "free") && <span className="block text-[10px] font-normal text-orange-400">current</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { label: "Products",          vals: ["10", "50", "Unlimited", "Unlimited"] },
                  { label: "Store live",        vals: [false, true, true, true] },
                  { label: "Custom domain",     vals: [false, false, true, true] },
                  { label: "Remove branding",   vals: [false, true, true, true] },
                  { label: "Priority payouts",  vals: [false, false, true, true] },
                  { label: "Price/mo",          vals: ["Free", "₹999", "₹2,499", "Custom"] },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50/50" : ""}>
                    <td className="py-2 pr-4 text-gray-700">{row.label}</td>
                    {row.vals.map((val, j) => (
                      <td key={j} className={`py-2 px-3 text-center ${PLAN_OPTIONS[j] === (vendor.plan ?? "free") ? "bg-orange-50/60" : ""}`}>
                        {typeof val === "boolean"
                          ? <CheckIcon ok={val} />
                          : <span className="text-xs text-gray-600">{val}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ BASIC INFO TAB ══════════════════════════════════════════════════ */}
      {activeTab === "basic" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="p-6 mb-6 bg-white border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <Heading level="h2" className="text-xl">Basic Information</Heading>
                <Button variant="secondary" size="small" onClick={() => navigate(`/vendors/${vendor.id}/edit?tab=basic`)}>Edit</Button>
              </div>
              <div className="space-y-4">
                <div><Label className="block mb-1 text-sm">Creator ID</Label><div className="p-2 font-mono text-sm border rounded bg-gray-50">{vendor.id}</div></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="block mb-1 text-sm">Name</Label><div className="p-2 border rounded bg-gray-50">{vendor.name}</div></div>
                  <div><Label className="block mb-1 text-sm">Handle</Label><div className="p-2 border rounded bg-gray-50">{vendor.handle || "Not set"}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="block mb-1 text-sm">Created</Label><div className="p-2 border rounded bg-gray-50">{formatDate(vendor.created_at)}</div></div>
                  <div><Label className="block mb-1 text-sm">Updated</Label><div className="p-2 border rounded bg-gray-50">{formatDate(vendor.updated_at)}</div></div>
                </div>
                <div><Label className="block mb-1 text-sm">Title</Label><div className="p-2 border rounded bg-gray-50">{vendor.creator_title || "Not set"}</div></div>
                <div>
                  <Label className="block mb-1 text-sm">Verification</Label>
                  <div className="flex items-center gap-2 p-2 border rounded bg-gray-50">
                    <Badge className={vendor.verified === "Yes" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {vendor.verified === "Yes" ? "Verified" : "Unverified"}
                    </Badge>
                    {vendor.verified !== "Yes" && (
                      <Button variant="secondary" size="small" onClick={() => navigate(`/vendors/${vendor.id}/edit?tab=basic`)}>Verify</Button>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="block mb-1 text-sm">Plan</Label>
                  <div className="flex items-center gap-3 p-2 border rounded bg-gray-50">
                    <PlanBadge plan={vendor.plan} />
                    {vendor.plan_billing_cycle && <span className="text-xs text-gray-500 capitalize">{vendor.plan_billing_cycle} billing</span>}
                    {vendor.plan_activated_at && <span className="text-xs text-gray-400">since {new Date(vendor.plan_activated_at).toLocaleDateString()}</span>}
                    <button className="ml-auto text-xs text-blue-600 underline hover:text-blue-800" onClick={() => setActiveTab("plan")}>Manage</button>
                  </div>
                </div>
                <div>
                  <Label className="block mb-1 text-sm">Store mode</Label>
                  <div className="flex items-center gap-3 p-2 border rounded bg-gray-50">
                    <StoreModeRow vendor={vendor} />
                    <button className="ml-auto text-xs text-blue-600 underline hover:text-blue-800" onClick={() => setActiveTab("store-mode")}>Change</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 mb-6 bg-white border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <Heading level="h2" className="text-xl">Login Information</Heading>
                <Button variant="secondary" size="small" onClick={() => navigate(`/vendors/${vendor.id}/auth`)}>Manage Access</Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Auth Status</Label>
                  <Badge className={vendor.auth_enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{vendor.auth_enabled ? "Enabled" : "Disabled"}</Badge>
                </div>
                <div><Label className="block mb-1 text-sm">Login Email</Label><div className="p-2 border rounded bg-gray-50">{vendor.login_email || "Not set"}</div></div>
                <div><Label className="block mb-1 text-sm">Last Login</Label><div className="p-2 border rounded bg-gray-50">{vendor.last_login ? formatDate(vendor.last_login) : "Never"}</div></div>
              </div>
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="p-6 mb-6 bg-white border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <Heading level="h2" className="text-xl">Bio</Heading>
                <Button variant="secondary" size="small" onClick={() => navigate(`/vendors/${vendor.id}/edit?tab=profile`)}>Edit</Button>
              </div>
              <div className="prose max-w-none">
                {vendor.creator_bio ? <p>{vendor.creator_bio}</p> : <p className="italic text-gray-500">No biography</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ STORE MODE TAB ══════════════════════════════════════════════════ */}
      {activeTab === "store-mode" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <Heading level="h2" className="text-xl mb-1">Store mode</Heading>
          <Text className="mb-6 text-sm text-gray-500">Control where {vendor.name}'s merch is sold.</Text>

          {vendor.marketplace_status && vendor.marketplace_status !== "none" && (
            <div className={`p-5 mb-6 rounded-xl border-2 ${
              vendor.marketplace_status === "pending" ? "border-amber-300 bg-amber-50" :
              vendor.marketplace_status === "approved" ? "border-green-300 bg-green-50" :
              "border-red-300 bg-red-50"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <Heading level="h3" className="text-lg">Marketplace application</Heading>
                <Badge className={
                  vendor.marketplace_status === "pending" ? "bg-amber-200 text-amber-900" :
                  vendor.marketplace_status === "approved" ? "bg-green-200 text-green-900" :
                  "bg-red-200 text-red-900"
                }>
                  {vendor.marketplace_status === "pending" ? "Pending review" :
                   vendor.marketplace_status === "approved" ? "Approved" : "Rejected"}
                </Badge>
              </div>

              {vendor.marketplace_applied_at && (
                <Text className="text-sm text-gray-600 mb-1">Applied: {formatDate(vendor.marketplace_applied_at)}</Text>
              )}
              {vendor.marketplace_status === "approved" && vendor.marketplace_approved_at && (
                <Text className="text-sm text-gray-600 mb-3">Approved: {formatDate(vendor.marketplace_approved_at)}</Text>
              )}
              {vendor.marketplace_status === "rejected" && vendor.marketplace_rejection_reason && (
                <Text className="text-sm text-red-700 mb-3">Reason: {vendor.marketplace_rejection_reason}</Text>
              )}

              {vendor.marketplace_status === "pending" && (
                <div className="mt-3">
                  {!showRejectForm ? (
                    <div className="flex gap-3">
                      <Button variant="primary" onClick={() => handleMarketplaceAction("approve")} isLoading={isProcessingApplication} disabled={isProcessingApplication}>Approve</Button>
                      <Button variant="danger" onClick={() => setShowRejectForm(true)} disabled={isProcessingApplication}>Reject</Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label className="block mb-1 text-sm">Rejection reason</Label>
                        <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Profile incomplete, content guidelines not met..." rows={3} />
                      </div>
                      <div className="flex gap-3">
                        <Button variant="danger" onClick={() => handleMarketplaceAction("reject")} isLoading={isProcessingApplication} disabled={isProcessingApplication || !rejectReason.trim()}>Confirm rejection</Button>
                        <Button variant="secondary" onClick={() => { setShowRejectForm(false); setRejectReason("") }} disabled={isProcessingApplication}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {vendor.marketplace_status === "rejected" && (
                <Text className="text-xs text-gray-500 italic">The creator can re-apply from their dashboard.</Text>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
            <label className={`flex items-start gap-4 p-5 border-2 rounded-xl transition-all ${storeModeEdit.sell_on_marketplace ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-gray-50"} ${vendor.marketplace_status === "pending" ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-gray-300"}`}>
              <input type="checkbox" className="mt-1 w-4 h-4 accent-orange-500" checked={storeModeEdit.sell_on_marketplace} disabled={vendor.marketplace_status === "pending"} onChange={e => setStoreModeEdit(p => ({ ...p, sell_on_marketplace: e.target.checked }))} />
              <div>
                <Text className="font-semibold">Junooni marketplace</Text>
                <Text className="mt-1 text-sm text-gray-500">Products on junooni.com/store/{vendor.handle || vendor.id}</Text>
                <Badge className="mt-2 text-orange-800 bg-orange-100">junooni.com</Badge>
                {vendor.marketplace_status === "pending" && (<Text className="mt-2 text-xs text-amber-600">Use Approve/Reject above instead of toggling directly.</Text>)}
              </div>
            </label>
            <label className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all ${storeModeEdit.sell_on_own_store ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}>
              <input type="checkbox" className="mt-1 w-4 h-4 accent-green-600" checked={storeModeEdit.sell_on_own_store} onChange={e => setStoreModeEdit(p => ({ ...p, sell_on_own_store: e.target.checked }))} />
              <div><Text className="font-semibold">Own branded store</Text><Text className="mt-1 text-sm text-gray-500">Custom domain storefront. JUNOONI fulfills invisibly.</Text><Badge className="mt-2 text-green-800 bg-green-100">Custom domain</Badge></div>
            </label>
          </div>
          {!storeModeEdit.sell_on_marketplace && !storeModeEdit.sell_on_own_store && (
            <div className="p-4 mb-4 border border-yellow-200 rounded-lg bg-yellow-50"><Text className="text-sm text-yellow-800">⚠️ Neither selected — products won't be visible anywhere.</Text></div>
          )}
          <div className="flex gap-3">
            <Button variant="primary" isLoading={isSavingStoreMode} disabled={isSavingStoreMode || (!storeModeEdit.sell_on_marketplace && !storeModeEdit.sell_on_own_store)} onClick={handleSaveStoreMode}>Save</Button>
            <Button variant="secondary" disabled={isSavingStoreMode} onClick={() => setStoreModeEdit({ sell_on_marketplace: vendor.sell_on_marketplace ?? false, sell_on_own_store: vendor.sell_on_own_store ?? false })}>Reset</Button>
          </div>
        </div>
      )}

      {/* ══ OTHER TABS ══════════════════════════════════════════════════════ */}
      {activeTab === "profile" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <div className="flex items-center justify-between mb-4"><Heading level="h2" className="text-xl">Social & Contact</Heading><Button variant="secondary" size="small" onClick={() => navigate(`/vendors/${vendor.id}/edit?tab=profile`)}>Edit</Button></div>
          <div className="space-y-4">
            {(["phonenumber", "youtube", "instagram", "xtwitter", "facebook", "othersocial"] as const).map(field => (
              <div key={field}><Label className="block mb-1 text-sm capitalize">{field === "xtwitter" ? "X (Twitter)" : field === "othersocial" ? "Other" : field.charAt(0).toUpperCase() + field.slice(1)}</Label><div className="p-2 border rounded bg-gray-50">{vendor[field] || <span className="text-gray-400">Not set</span>}</div></div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "business" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <div className="flex items-center justify-between mb-4"><Heading level="h2" className="text-xl">Business</Heading><Button variant="secondary" size="small" onClick={() => navigate(`/vendors/${vendor.id}/edit?tab=business`)}>Edit</Button></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {[["Company", vendor.companyname], ["GSTIN", vendor.GSTIN], ["PAN", vendor.pan_number], ["TAN", vendor.tan_number]].map(([l, v]) => (
                <div key={String(l)}><Label className="block mb-1 text-sm">{l}</Label><div className="p-2 font-mono text-sm border rounded bg-gray-50">{v || <span className="text-gray-400">Not set</span>}</div></div>
              ))}
            </div>
            <div><Label className="block mb-1 text-sm">GST Status</Label><div className="p-2 border rounded bg-gray-50"><Badge className={vendor.gst_verification_status === "verified" ? "bg-green-100 text-green-800" : vendor.gst_verification_status === "failed" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>{vendor.gst_verification_status ?? "Pending"}</Badge></div></div>
          </div>
        </div>
      )}

      {activeTab === "banking" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <div className="flex items-center justify-between mb-4"><Heading level="h2" className="text-xl">Banking</Heading><Button variant="secondary" size="small" onClick={() => navigate(`/vendors/${vendor.id}/edit?tab=banking`)}>Edit</Button></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[["Holder Name", vendor.bank_account_holder_name], ["Bank Name", vendor.bank_name], ["Account Type", vendor.bank_account_type], ["IFSC", vendor.bank_account_ifsc_code]].map(([l, v]) => (
              <div key={String(l)}><Label className="block mb-1 text-sm">{l}</Label><div className="p-2 border rounded bg-gray-50">{v || <span className="text-gray-400">Not set</span>}</div></div>
            ))}
            <div><Label className="block mb-1 text-sm">Account Number</Label><div className="p-2 font-mono border rounded bg-gray-50">{vendor.bank_account_number ? `••••••${vendor.bank_account_number.slice(-4)}` : <span className="text-gray-400">Not set</span>}</div></div>
            <div><Label className="block mb-1 text-sm">Cancelled Cheque</Label><div className="p-2 border rounded bg-gray-50">{vendor.cancelled_checkque ? <div className="flex gap-2 items-center"><Badge className="bg-green-100 text-green-800">Uploaded</Badge><Button variant="secondary" size="small" onClick={() => window.open(vendor.cancelled_checkque, "_blank")}>View</Button></div> : <Badge className="bg-red-100 text-red-800">Not uploaded</Badge>}</div></div>
          </div>
        </div>
      )}

      {activeTab === "payout" && <CreatorPayoutTab />}
      {activeTab === "payout-details" && <CreatorPayoutDetailsTab />}
      {activeTab === "followers" && <CreatorFollowersTab />}

      {activeTab === "admins" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <div className="flex items-center justify-between mb-4"><Heading level="h2" className="text-xl">Admins</Heading><Button variant="secondary" size="small" onClick={() => navigate(`/vendors/${vendor.id}/admin/add`)}>Add Admin</Button></div>
          {vendor.admins?.length ? (
            <div className="space-y-4">
              {vendor.admins.map(admin => (
                <div key={admin.id} className="p-4 border rounded-lg bg-gray-50 flex items-start justify-between">
                  <div><Text className="font-medium">{admin.first_name || admin.last_name ? `${admin.first_name || ""} ${admin.last_name || ""}`.trim() : "Unnamed"}</Text><Text className="text-sm text-gray-600">{admin.email}</Text></div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="small" onClick={() => navigate(`/vendors/${vendor.id}/admin/${admin.id}/edit`)}>Edit</Button>
                    <Button variant="danger" size="small">Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : <Text className="text-gray-500">No admins assigned.</Text>}
        </div>
      )}

      {activeTab === "metadata" && vendor.metadata && Object.keys(vendor.metadata).length > 0 && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <Heading level="h2" className="text-xl mb-4">Metadata</Heading>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Object.entries(vendor.metadata).map(([key, value], i) => (
              <div key={i} className="p-4 border rounded-lg bg-gray-50">
                <Label className="block mb-1 text-sm font-medium">{key}</Label>
                <div className="p-2 bg-gray-100 border rounded text-xs font-mono">{typeof value === "object" ? JSON.stringify(value) : String(value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ BOTTOM ACTIONS ══════════════════════════════════════════════════ */}
      <div className="flex flex-wrap gap-4 mt-8">
        <Button variant="primary" onClick={() => navigate(`/vendors/${vendor.id}/edit`)}>Edit Creator</Button>
        <Button variant="secondary" onClick={handleLoginAsVendor} isLoading={isImpersonating} disabled={isImpersonating || !vendor.admins?.length}>
          <Users className="mr-1.5" />Login as Vendor
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/vendors/${vendor.id}/products`)}>Products</Button>
        <Button variant="secondary" onClick={() => navigate(`/vendors/${vendor.id}/orders`)}>Orders</Button>
        <Button variant="secondary" onClick={() => setActiveTab("plan")}>Manage Plan</Button>
        <Button variant="danger" onClick={() => { if (confirm("Deactivate this creator?")) console.log("Deactivating", vendor.id) }}>Deactivate</Button>

        {/* ── Permanent delete — separated visually to avoid accidental clicks ── */}
        <div className="ml-auto">
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            className="border-2 border-red-700 bg-red-700 hover:bg-red-800"
          >
            🗑 Delete Creator Permanently
          </Button>
        </div>
      </div>

    </Container>
  )
}

export default CreatorDetailPage