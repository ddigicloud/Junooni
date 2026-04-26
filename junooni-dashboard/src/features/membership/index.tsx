// "use client"

// import { useState, useEffect } from "react"
// import { useNavigate, Link } from "@tanstack/react-router"
// import { useToast } from "@/hooks/use-toast"
// import { Separator } from "@/components/ui/separator"
// import { SidebarTrigger } from "@/components/ui/sidebar"
// import { ProfileDropdown } from "@/components/profile-dropdown"
// import AdminImpersonationBanner from "@/components/AdminImpersonationBanner"
// import {
//   Check, Zap, Star, Building2, Sparkles, ArrowLeft,
//   Crown, Package, Globe, Tag, Wallet, Headphones,
//   Loader2, BadgeCheck, Calendar, AlertCircle, ExternalLink,
//   ChevronRight, Shield, Rocket,
// } from "lucide-react"

// const BRAND = { primary: "#e65100", secondary: "#ac1900" }

// // ─── Plan Definitions ─────────────────────────────────────────────────────────

// const PLANS = [
//   {
//     id: "free",
//     name: "Free",
//     tagline: "Get started for free",
//     icon: <Sparkles className="w-5 h-5" />,
//     color: "#6b7280",
//     price_monthly: 0,
//     price_annual: 0,
//     product_limit: 10,
//     features: [
//       { icon: <Package className="w-3.5 h-3.5" />, text: "Up to 10 products", included: true },
//       { icon: <Globe className="w-3.5 h-3.5" />, text: "Junooni subdomain", included: true },
//       { icon: <Tag className="w-3.5 h-3.5" />, text: "Store stays in Draft", included: false },
//       { icon: <Shield className="w-3.5 h-3.5" />, text: "Junooni branding on store", included: false },
//       { icon: <Wallet className="w-3.5 h-3.5" />, text: "Standard payouts (T+7)", included: true },
//       { icon: <Headphones className="w-3.5 h-3.5" />, text: "Email support", included: true },
//     ],
//     cta: "Current plan",
//     highlighted: false,
//   },
//   {
//     id: "starter",
//     name: "Starter",
//     tagline: "For growing creators",
//     icon: <Zap className="w-5 h-5" />,
//     color: "#3b82f6",
//     price_monthly: 1200,
//     price_annual: 2500,
//     product_limit: 50,
//     features: [
//       { icon: <Package className="w-3.5 h-3.5" />, text: "Up to 50 products", included: true },
//       { icon: <Globe className="w-3.5 h-3.5" />, text: "Store goes live", included: true },
//       { icon: <Tag className="w-3.5 h-3.5" />, text: "No Junooni branding", included: true },
//       { icon: <Shield className="w-3.5 h-3.5" />, text: "Custom domain (coming soon)", included: false },
//       { icon: <Wallet className="w-3.5 h-3.5" />, text: "Standard payouts (T+7)", included: true },
//       { icon: <Headphones className="w-3.5 h-3.5" />, text: "Priority email support", included: true },
//     ],
//     cta: "Upgrade to Starter",
//     highlighted: false,
//     razorpay_plan_monthly: "plan_starter_monthly",
//     razorpay_plan_annual: "plan_starter_annual",
//   },
//   {
//     id: "enterprise",
//     name: "Enterprise",
//     tagline: "Custom for large teams",
//     icon: <Building2 className="w-5 h-5" />,
//     color: "#8b5cf6",
//     price_monthly: -1,
//     price_annual: -1,
//     product_limit: -1,
//     features: [
//       { icon: <Package className="w-3.5 h-3.5" />, text: "Everything in Pro", included: true },
//       { icon: <Globe className="w-3.5 h-3.5" />, text: "White-label options", included: true },
//       { icon: <Tag className="w-3.5 h-3.5" />, text: "Custom contract & pricing", included: true },
//       { icon: <Shield className="w-3.5 h-3.5" />, text: "Dedicated account manager", included: true },
//       { icon: <Wallet className="w-3.5 h-3.5" />, text: "SLA guarantee", included: true },
//       { icon: <Headphones className="w-3.5 h-3.5" />, text: "Phone & WhatsApp support", included: true },
//     ],
//     cta: "Contact us",
//     highlighted: false,
//   },
// ]

// function formatINR(paise: number): string {
//   if (paise <= 0) return "₹0"
//   const rupees = paise / 100
//   return `₹${rupees.toLocaleString("en-IN")}`
// }

// // ─── Main ─────────────────────────────────────────────────────────────────────

// export default function MembershipPage() {
//   const navigate = useNavigate()
//   const { toast } = useToast()

//   const [billing, setBilling] = useState<"monthly" | "annual">("monthly")
//   const [currentPlan, setCurrentPlan] = useState<string>("free")
//   const [subscription, setSubscription] = useState<any>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [processingPlanId, setProcessingPlanId] = useState<string | null>(null)
//   const [vendorName, setVendorName] = useState("")
//   const [vendorEmail, setVendorEmail] = useState("")

//   const token = localStorage.getItem("vendorToken")
//   const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL


//   useEffect(() => {
//     console.log("useEffect fired, token:", token) // 👈

//     const load = async () => {
//       if (!token) { navigate({ to: "/sign-in" }); return }
//       try {
//         const [vRes, subRes] = await Promise.all([
//           fetch(`${backendUrl}/vendors/me`, { headers: { Authorization: `Bearer ${token}` } }),
//           fetch(`${backendUrl}/vendors/me/subscription`, { headers: { Authorization: `Bearer ${token}` } }),
//         ])
//         if (vRes.ok) {
//           const vd = await vRes.json()
//           //console.log("FULL VENDOR RESPONSE:", JSON.stringify(vd, null, 2))
          
//           const vendor = vd.vendor
//           setVendorName(vendor?.name ?? "")
//           setVendorEmail(vendor?.admins?.[0]?.email ?? vendor?.login_email ?? "")
//           setCurrentPlan(vendor?.plan ?? "free")

//           // Build a subscription-like object from flat vendor fields
//           if (vendor?.razorpay_subscription_id) {
//             setSubscription({
//               id: vendor.razorpay_subscription_id,
//               status: "active",
//               billing_cycle: vendor.plan_billing_cycle,
//               activated_at: vendor.plan_activated_at,
//             })
//           }
//         }
//        if (subRes.ok) {
//           const sd = await subRes.json()
//           // Only overwrite if backend actually returns a subscription object
//           if (sd.subscription) {
//             setSubscription(sd.subscription)
//           }
//           if (sd.plan && sd.plan !== "free") {
//             setCurrentPlan(sd.plan)
//           }
//         }
//       } catch (e) { console.error(e) }
//       finally { setIsLoading(false) }
//     }
//     load()
//   }, [])

//   // Load Razorpay script
//   useEffect(() => {
//     const script = document.createElement("script")
//     script.src = "https://checkout.razorpay.com/v1/checkout.js"
//     script.async = true
//     document.body.appendChild(script)
//     return () => { document.body.removeChild(script) }
//   }, [])

//   const handleUpgrade = async (plan: typeof PLANS[0]) => {
//     if (plan.id === "enterprise") {
//       const a = document.createElement("a")
//       a.href = "mailto:support@junooni.com?subject=Enterprise%20Plan%20Inquiry"
//       a.click()
//       return
//     }
//     if (plan.id === "free" || plan.id === currentPlan) return

//     setProcessingPlanId(plan.id)
//     try {
//       // 1. Create Razorpay subscription order on backend
//       const res = await fetch(`${backendUrl}/vendors/me/subscription`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({
//           plan_id: plan.id,
//           billing_cycle: billing,
//           razorpay_plan_id: billing === "monthly" ? plan.razorpay_plan_monthly : plan.razorpay_plan_annual,
//         }),
//       })

//       if (!res.ok) {
//         const err = await res.json().catch(() => ({}))
//         throw new Error(err.message ?? `HTTP ${res.status}`)
//       }

//       const { subscription_id, order_id, amount, currency, key_id } = await res.json()

//       // 2. Open Razorpay checkout
//       const rzp = new (window as any).Razorpay({
//         key: key_id ?? import.meta.env.VITE_RAZORPAY_ID,
//         subscription_id: subscription_id,  // for recurring
//         order_id: order_id,               // fallback for one-time
//         amount: amount,
//         currency: currency ?? "INR",
//         name: "JUNOONI Creator Studio",
//         description: `${plan.name} Plan — ${billing === "annual" ? "Annual" : "Monthly"}`,
//         image: "/logo.png",
//         prefill: { name: vendorName, email: vendorEmail },
//         theme: { color: BRAND.primary },
//         modal: {
//           ondismiss: () => setProcessingPlanId(null),
//         },
//         handler: async (response: any) => {
//           // 3. Verify payment on backend
//           try {
//             const verifyRes = await fetch(`${backendUrl}/vendors/me/subscription?action=verify`, {
//               method: "POST",
//               headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//               body: JSON.stringify({
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_subscription_id: response.razorpay_subscription_id,
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_signature: response.razorpay_signature,
//                 plan_id: plan.id,
//                 billing_cycle: billing,
//               }),
//             })
//             if (!verifyRes.ok) throw new Error("Verification failed")
//             const vd = await verifyRes.json()
//             setCurrentPlan(plan.id)
//             setSubscription(vd.subscription)
//             toast({
//               title: `🎉 Welcome to ${plan.name}!`,
//               description: `Your ${plan.name} plan is now active. Enjoy your new features!`,
//             })
//           } catch (e) {
//             toast({ title: "Payment received but verification failed", description: "Please contact support@junooni.com", variant: "destructive" })
//           } finally {
//             setProcessingPlanId(null)
//           }
//         },
//       })
//       rzp.open()
//     } catch (e) {
//       toast({ title: "Could not start checkout", description: String(e), variant: "destructive" })
//       setProcessingPlanId(null)
//     }
//   }

//   const handleCancelSubscription = async () => {
//     if (!confirm("Are you sure? Your plan will revert to Free at the end of the billing period.")) return
//     try {
//       await fetch(`${backendUrl}/vendors/me/subscription?action=cancel`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       toast({ title: "Subscription cancelled", description: "You'll retain access until the end of your billing period." })
//       setSubscription((s: any) => s ? { ...s, status: "cancelling" } : s)
//     } catch (e) {
//       toast({ title: "Failed to cancel", description: String(e), variant: "destructive" })
//     }
//   }

//   // const annualSaving = (plan: typeof PLANS[0]) => {
//   //   if (plan.price_monthly <= 0 || plan.price_annual <= 0) return 0
//   //   return Math.round(((plan.price_monthly * 12 - plan.price_annual) / (plan.price_monthly * 12)) * 100)
//   // }

//   if (isLoading) return (
//     <div className="flex items-center justify-center min-h-screen">
//       <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} />
//     </div>
//   )

//   const activePlan = PLANS.find(p => p.id === currentPlan) ?? PLANS[0]
//   const nextBillingDate = subscription?.activated_at? new Date(new Date(subscription.activated_at).setMonth(new Date(subscription.activated_at).getMonth() + 1
//       )
//     ).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
//   : null

//   return (

//     <div className="min-h-screen bg-gray-50">
//       <AdminImpersonationBanner />

//       {/* Header */}
//       <div className="sticky top-0 z-30 border-b border-gray-200 shadow-sm bg-white/90 backdrop-blur-md">
//         <div className="container flex items-center justify-between px-4 py-3 mx-auto">
//           <div className="flex items-center gap-3">
//             <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
//             <Separator orientation="vertical" className="h-6" />
//             <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
//               <ArrowLeft className="w-3.5 h-3.5" />Back
//             </Link>
//             <Separator orientation="vertical" className="h-4" />
//             <span className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
//               <Crown className="w-4 h-4" style={{ color: BRAND.primary }} />
//               Membership
//             </span>
//           </div>
//           <ProfileDropdown />
//         </div>
//       </div>

//       <div className="container max-w-6xl px-4 py-10 mx-auto">

//         {/* Hero */}
//         <div className="mb-10 text-center">
//           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
//             style={{ background: `${BRAND.primary}15`, color: BRAND.primary }}>
//             <Rocket className="w-3.5 h-3.5" />
//             Creator Plans
//           </div>
//           <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
//             Grow your creator business
//           </h1>
//           <p className="max-w-xl mx-auto text-base text-gray-500">
//             Unlock more products, remove Junooni branding, get a custom domain and priority payouts — everything you need to scale.
//           </p>
//         </div>

//         {/* Current plan banner */}
//         {currentPlan !== "free" && (
//           <div className="flex items-center justify-between gap-4 p-4 mb-8 border-2 rounded-2xl"
//             style={{ borderColor: `${activePlan.color}40`, background: `${activePlan.color}08` }}>
//             <div className="flex items-center gap-3">
//               <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: `${activePlan.color}20`, color: activePlan.color }}>
//                 {activePlan.icon}
//               </div>
//               <div>
//                 <div className="flex items-center gap-2">
//                   <p className="font-semibold text-gray-900">You're on the <span style={{ color: activePlan.color }}>{activePlan.name}</span> plan</p>
//                   <BadgeCheck className="w-4 h-4" style={{ color: activePlan.color }} />
//                 </div>
//                 {nextBillingDate && subscription?.status !== "cancelling" && (
//                   <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
//                     <Calendar className="w-3 h-3" />
//                     Renews on {nextBillingDate}
//                   </p>
//                 )}
//                 {subscription?.status === "cancelling" && (
//                   <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
//                     <AlertCircle className="w-3 h-3" />
//                     Cancels on {nextBillingDate} — reverts to Free
//                   </p>
//                 )}
//               </div>
//             </div>
//             {subscription && subscription.status !== "cancelling" && (
//               <button onClick={handleCancelSubscription} className="text-xs text-gray-400 hover:text-red-500 transition-colors border border-gray-200 rounded-lg px-3 py-1.5">
//                 Cancel plan
//               </button>
//             )}
//           </div>
//         )}

//         {/* Billing toggle */}
//         <div className="flex items-center justify-center gap-3 mb-8">
//           <span className={`text-sm font-medium ${billing === "monthly" ? "text-gray-900" : "text-gray-400"}`}>Monthly</span>
//           <button
//             onClick={() => setBilling(b => b === "monthly" ? "annual" : "monthly")}
//             className="relative w-12 h-6 transition-colors rounded-full"
//             style={{ background: billing === "annual" ? BRAND.primary : "#d1d5db" }}
//           >
//             <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${billing === "annual" ? "translate-x-6" : ""}`} />
//           </button>
//           <span className={`text-sm font-medium ${billing === "annual" ? "text-gray-900" : "text-gray-400"}`}>Annual</span>
//           {/* {billing === "annual" && (
//             <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: BRAND.primary }}>
//               Save up to 25%
//             </span>
//           )} */}
//         </div>

//         {/* Plan cards */}
//         <div className="grid grid-cols-1 gap-5 mb-12 md:grid-cols-2 lg:grid-cols-3">
//           {PLANS.map(plan => {
//             const isCurrent = plan.id === currentPlan
//             const isProcessing = processingPlanId === plan.id
//             //const saving = annualSaving(plan)
//             const price = billing === "annual" ? plan.price_annual : plan.price_monthly
//             const monthlyEquiv = billing === "annual" && plan.price_annual > 0 ? Math.round(plan.price_annual / 12) : null

//             return (
//               <div key={plan.id}
//                 className={`relative flex flex-col rounded-2xl border-2 transition-all ${
//                   plan.highlighted
//                     ? "shadow-xl scale-[1.02]"
//                     : "shadow-sm hover:shadow-md"
//                 } ${isCurrent ? "bg-white" : "bg-white"}`}
//                 style={{ borderColor: plan.highlighted ? BRAND.primary : isCurrent ? `${plan.color}60` : "#e5e7eb" }}>

//                 {/* Popular badge */}
//                 {plan.highlighted && (
//                   <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold text-white whitespace-nowrap"
//                     style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
//                     ⭐ Most Popular
//                   </div>
//                 )}

//                 <div className="flex flex-col flex-1 p-5">
//                   {/* Plan header */}
//                   <div className="flex items-center gap-2.5 mb-4">
//                     <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
//                       style={{ background: `${plan.color}15`, color: plan.color }}>
//                       {plan.icon}
//                     </div>
//                     <div>
//                       <h3 className="text-sm font-bold text-gray-900">{plan.name}</h3>
//                       <p className="text-[11px] text-gray-400">{plan.tagline}</p>
//                     </div>
//                     {isCurrent && (
//                       <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full border" style={{ borderColor: "#16a34a50", color: "#16a34a", background: "#16a34a15" }}>
//                         Active
//                       </span>
//                     )}
//                   </div>

//                   {/* Price */}
//                   <div className="mb-5">
//                     {plan.price_monthly === -1 ? (
//                       <p className="text-2xl font-bold text-gray-900">Custom</p>
//                     ) : plan.price_monthly === 0 ? (
//                       <p className="text-2xl font-bold text-gray-900">Free</p>
//                     ) : (
//                       <div>
//                         <div className="flex items-end gap-1">
//                           <span className="text-2xl font-bold text-gray-900">
//                             {billing === "annual" && monthlyEquiv
//                               ? `₹${(monthlyEquiv).toLocaleString("en-IN")}`
//                               : `₹${(plan.price_monthly).toLocaleString("en-IN")}`}
//                           </span>
//                           <span className="pb-1 text-xs text-gray-400">/mo</span>
//                         </div>
//                         {billing === "annual" && (
//                           <p className="text-[11px] text-gray-400">
//                             Billed ₹{plan.price_annual.toLocaleString("en-IN")}/year
//                           </p>
//                         )}
//                       </div>
//                     )}
//                   </div>

//                   {/* Features */}
//                   <ul className="flex-1 mb-6 space-y-2">
//                     {plan.features.map((f, i) => (
//                       <li key={i} className={`flex items-center gap-2 text-xs ${f.included ? "text-gray-700" : "text-gray-400 line-through"}`}>
//                         <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${f.included ? "" : "opacity-40"}`}
//                           style={{ background: f.included ? `${plan.color}20` : "#f3f4f6", color: f.included ? plan.color : "#9ca3af" }}>
//                           {f.included ? <Check className="w-2.5 h-2.5" /> : <span className="text-[10px]">—</span>}
//                         </div>
//                         <span className="flex items-center gap-1">{f.icon}{f.text}</span>
//                       </li>
//                     ))}
//                   </ul>

//                   {/* CTA */}
//                   <button
//                     onClick={() => handleUpgrade(plan)}
//                     disabled={isCurrent || isProcessing || (plan.price_monthly === 0 && currentPlan !== "free")}
//                     className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
//                       isCurrent
//                         ? "bg-gray-100 text-gray-400 cursor-default"
//                         : plan.id === "enterprise"
//                           ? "border-2 bg-white text-gray-700 hover:bg-gray-50"
//                           : "text-white hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
//                     }`}
//                     style={{
//                       background: isCurrent ? undefined : plan.id === "enterprise" ? undefined : `linear-gradient(135deg, ${plan.color} 0%, ${plan.highlighted ? BRAND.secondary : plan.color}cc 100%)`,
//                       borderColor: plan.id === "enterprise" ? plan.color : undefined,
//                     }}
//                   >
//                     {isProcessing ? (
//                       <><Loader2 className="w-3.5 h-3.5 animate-spin" />Processing...</>
//                     ) : isCurrent ? (
//                       <><BadgeCheck className="w-3.5 h-3.5" />Current plan</>
//                     ) : plan.id === "enterprise" ? (
//                       <><ExternalLink className="w-3.5 h-3.5" />Contact us</>
//                     ) : (
//                       <>{plan.cta} <ChevronRight className="w-3.5 h-3.5" /></>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             )
//           })}
//         </div>

//         {/* Feature comparison table */}
//         <div className="mb-8 overflow-hidden bg-white border border-gray-200 rounded-2xl">
//           <div className="px-6 py-4 border-b border-gray-100">
//             <h2 className="text-lg font-bold text-gray-900">Full comparison</h2>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-gray-100">
//                   <th className="w-2/5 px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-400 uppercase">Feature</th>
//                   {PLANS.map(p => (
//                     <th key={p.id} className={`px-4 py-3 text-center ${p.id === currentPlan ? "bg-orange-50" : ""}`}>
//                       <div className="flex flex-col items-center gap-1">
//                         <span className="text-xs font-bold" style={{ color: p.color }}>{p.name}</span>
//                         {p.id === currentPlan && (
//                           <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
//                             style={{ background: `${p.color}20`, color: p.color }}>
//                             Your plan
//                           </span>
//                         )}
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-50">
//                 {[
//                   { label: "Products",                values: ["10",     "50",            "Unlimited"]     },
//                   { label: "Store live",              values: [false,    true,            true]             },
//                   { label: "Custom domain",           values: [false,    false,           true]             },
//                   { label: "Remove Junooni branding", values: [false,    true,            true]             },
//                   { label: "Priority payouts",        values: [false,    false,           true]             },
//                   { label: "Support",                 values: ["Email",  "Priority email","Phone + WhatsApp"]},
//                   { label: "Price/month",             values: ["Free",   "₹1200",          "Custom"]         },
//                 ].map((row, i) => (
//                   <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50/50"}>
//                     <td className="px-6 py-3 text-sm font-medium text-gray-700">{row.label}</td>
//                     {row.values.map((val, j) => (
//                       <td key={j} className={`px-4 py-3 text-center ${PLANS[j]?.id === currentPlan ? "bg-orange-50/50" : ""}`}>
//                         {typeof val === "boolean" ? (
//                           val
//                             ? <Check className="w-4 h-4 mx-auto" style={{ color: BRAND.primary }} />
//                             : <span className="text-lg text-gray-300">—</span>
//                         ) : (
//                           <span className="text-xs font-medium text-gray-600">{val}</span>
//                         )}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* FAQ */}
//         <div className="p-6 bg-white border border-gray-200 rounded-2xl">
//           <h2 className="mb-5 text-lg font-bold text-gray-900">Frequently asked questions</h2>
//           <div className="grid gap-5 md:grid-cols-2">
//             {[
//               { q: "Can I change plans anytime?", a: "Yes. Upgrade instantly and it takes effect immediately. Downgrading takes effect at the end of your billing cycle." },
//               { q: "What happens to my store if I downgrade?", a: "Your store reverts to Draft mode and the product limit applies. Existing products above the limit are hidden but not deleted." },
//               { q: "Is my payment secure?", a: "Yes. Payments are processed by Razorpay — India's leading payment gateway. We never store your card details." },
//               { q: "How does the annual discount work?", a: "Annual plans are billed once a year at the discounted rate. You save up to 25% compared to paying monthly." },
//               { q: "What is custom domain setup?", a: "On Pro, our team will configure your own domain (e.g. merch.yourname.com) to point to your JUNOONI store. Usually done within 24 hours." },
//               { q: "How do I contact support?", a: "Email us at support@junooni.com. Pro plan creators get a dedicated Slack/WhatsApp channel with same-day response." },
//             ].map((faq, i) => (
//               <div key={i} className="space-y-1">
//                 <p className="text-sm font-semibold text-gray-800">{faq.q}</p>
//                 <p className="text-sm leading-relaxed text-gray-500">{faq.a}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//       </div>
//     </div>
//   )
// }


"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ProfileDropdown } from "@/components/profile-dropdown"
import AdminImpersonationBanner from "@/components/AdminImpersonationBanner"
import {
  Check, Zap, Star, Building2, Sparkles, ArrowLeft,
  Crown, Package, Globe, Receipt, Tag, Wallet, Headphones,
  Loader2, BadgeCheck, Calendar, AlertCircle, ExternalLink,
  ChevronRight, Shield, Rocket,
} from "lucide-react"

const BRAND = { primary: "#e65100", secondary: "#ac1900" }

// ─── Plan Definitions ─────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "free",
    name: "Free",
    tagline: "Get started for free",
    icon: <Sparkles className="w-5 h-5" />,
    color: "#e65100",
    price_monthly: 0,
    price_annual: 0,
    product_limit: 10,
    features: [
      { icon: <Package className="w-3.5 h-3.5" />, text: "Up to 10 products", included: true },
      { icon: <Globe className="w-3.5 h-3.5" />, text: "Junooni subdomain", included: true },
      { icon: <Tag className="w-3.5 h-3.5" />, text: "Store stays in Draft", included: false },
      { icon: <Shield className="w-3.5 h-3.5" />, text: "Junooni branding on store", included: false },
      { icon: <Wallet className="w-3.5 h-3.5" />, text: "Standard payouts (T+7)", included: true },
      { icon: <Headphones className="w-3.5 h-3.5" />, text: "Email support", included: true },
    ],
    cta: "Current plan",
    highlighted: false,
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "For growing creators",
    icon: <Zap className="w-5 h-5" />,
    color: "#e65100",
    price_monthly: 899,
    price_annual: 8999,
    product_limit: 50,
    features: [
      { icon: <Package className="w-3.5 h-3.5" />, text: "Up to 50 products", included: true },
      { icon: <Globe className="w-3.5 h-3.5" />, text: "Store goes live", included: true },
      { icon: <Tag className="w-3.5 h-3.5" />, text: "No Junooni branding", included: true },
      { icon: <Shield className="w-3.5 h-3.5" />, text: "Custom domain (coming soon)", included: false },
      { icon: <Wallet className="w-3.5 h-3.5" />, text: "Standard payouts (T+7)", included: true },
      { icon: <Headphones className="w-3.5 h-3.5" />, text: "Priority email support", included: true },
    ],
    cta: "Upgrade to Starter",
    highlighted: false,
    razorpay_plan_monthly: "plan_starter_monthly",
    razorpay_plan_annual: "plan_starter_annual",
  },
  // {
  //   id: "pro",
  //   name: "Pro",
  //   tagline: "For serious creators",
  //   icon: <Star className="w-5 h-5" />,
  //   color: "#e65100",
  //   price_monthly: 2499,
  //   price_annual: 22999,
  //   product_limit: -1,
  //   features: [
  //     { icon: <Package className="w-3.5 h-3.5" />, text: "Unlimited products", included: true },
  //     { icon: <Globe className="w-3.5 h-3.5" />, text: "Custom domain setup", included: true },
  //     { icon: <Tag className="w-3.5 h-3.5" />, text: "No Junooni branding", included: true },
  //     { icon: <Shield className="w-3.5 h-3.5" />, text: "Store goes live", included: true },
  //     { icon: <Wallet className="w-3.5 h-3.5" />, text: "Priority payouts (T+3)", included: true },
  //     { icon: <Headphones className="w-3.5 h-3.5" />, text: "Dedicated support + early access", included: true },
  //   ],
  //   cta: "Upgrade to Pro",
  //   highlighted: true,
  //   razorpay_plan_monthly: "plan_pro_monthly",
  //   razorpay_plan_annual: "plan_pro_annual",
  // },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Custom for large teams",
    icon: <Building2 className="w-5 h-5" />,
    color: "#e65100",
    price_monthly: -1,
    price_annual: -1,
    product_limit: -1,
    features: [
      { icon: <Package className="w-3.5 h-3.5" />, text: "Everything in Pro", included: true },
      { icon: <Globe className="w-3.5 h-3.5" />, text: "White-label options", included: true },
      { icon: <Tag className="w-3.5 h-3.5" />, text: "Custom contract & pricing", included: true },
      { icon: <Shield className="w-3.5 h-3.5" />, text: "Dedicated account manager", included: true },
      { icon: <Wallet className="w-3.5 h-3.5" />, text: "SLA guarantee", included: true },
      { icon: <Headphones className="w-3.5 h-3.5" />, text: "Phone & WhatsApp support", included: true },
    ],
    cta: "Contact us",
    highlighted: false,
  },
]

function formatINR(paise: number): string {
  if (paise <= 0) return "₹0"
  const rupees = paise
  return `₹${rupees.toLocaleString("en-IN")}`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MembershipPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [billing, setBilling] = useState<"monthly" | "annual">("monthly")
  const [currentPlan, setCurrentPlan] = useState<string>("free")
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null)
  const [vendorName, setVendorName] = useState("")
  const [vendorEmail, setVendorEmail] = useState("")

  const token = localStorage.getItem("vendorToken")
  const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL

  useEffect(() => {
    const load = async () => {
      if (!token) { navigate({ to: "/sign-in" }); return }
      try {
        const [vRes, subRes] = await Promise.all([
          fetch(`${backendUrl}/vendors/me`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${backendUrl}/vendors/me/subscription`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (vRes.ok) {
          const vd = await vRes.json()
          setVendorName(vd.vendor?.name ?? "")
          setVendorEmail(vd.vendor?.admins?.[0]?.email ?? vd.vendor?.login_email ?? "")
          setCurrentPlan(vd.vendor?.plan ?? "free")
        }
        if (subRes.ok) {
          const sd = await subRes.json()
          setSubscription(sd.subscription ?? null)
        }
      } catch (e) { console.error(e) }
      finally { setIsLoading(false) }
    }
    load()
  }, [])

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  const handleUpgrade = async (plan: typeof PLANS[0]) => {
    if (plan.id === "enterprise") {
      window.open("mailto:hello@junooni.com?subject=Enterprise Plan Inquiry", "_blank")
      return
    }
    if (plan.id === "free" || plan.id === currentPlan) return

    setProcessingPlanId(plan.id)
    try {
      // 1. Create Razorpay subscription order on backend
      const res = await fetch(`${backendUrl}/vendors/me/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          plan_id: plan.id,
          billing_cycle: billing,
          razorpay_plan_id: billing === "monthly" ? plan.razorpay_plan_monthly : plan.razorpay_plan_annual,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? `HTTP ${res.status}`)
      }

      const { subscription_id, order_id, amount, currency, key_id } = await res.json()

      // 2. Open Razorpay checkout
      const rzp = new (window as any).Razorpay({
        key: key_id ?? import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: subscription_id,  // for recurring
        order_id: order_id,               // fallback for one-time
        amount: amount,
        currency: currency ?? "INR",
        name: "JUNOONI Creator Studio",
        description: `${plan.name} Plan — ${billing === "annual" ? "Annual" : "Monthly"}`,
        image: "/logo.png",
        prefill: { name: vendorName, email: vendorEmail },
        theme: { color: BRAND.primary },
        modal: {
          ondismiss: () => setProcessingPlanId(null),
        },
        handler: async (response: any) => {
          // 3. Verify payment on backend
          try {
            const verifyRes = await fetch(`${backendUrl}/vendors/me/subscription?action=verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan_id: plan.id,
                billing_cycle: billing,
              }),
            })
            if (!verifyRes.ok) {
              const errText = await verifyRes.text().catch(() => `HTTP ${verifyRes.status}`)
              console.error("[membership] verify failed:", verifyRes.status, errText)
              throw new Error(`Verification failed: ${errText}`)
            }
            const vd = await verifyRes.json()
            console.log("[membership] verify success:", vd)
            setCurrentPlan(plan.id)
            setSubscription(vd.subscription)
            toast({
              title: `🎉 Welcome to ${plan.name}!`,
              description: `Your ${plan.name} plan is now active. Enjoy your new features!`,
            })
          } catch (e) {
            toast({ title: "Payment received but verification failed", description: "Please contact support@junooni.com", variant: "destructive" })
          } finally {
            setProcessingPlanId(null)
          }
        },
      })
      rzp.open()
    } catch (e) {
      toast({ title: "Could not start checkout", description: String(e), variant: "destructive" })
      setProcessingPlanId(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure? Your plan will revert to Free at the end of the billing period.")) return
    try {
      await fetch(`${backendUrl}/vendors/me/subscription?action=cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      toast({ title: "Subscription cancelled", description: "You'll retain access until the end of your billing period." })
      setSubscription((s: any) => s ? { ...s, status: "cancelling" } : s)
    } catch (e) {
      toast({ title: "Failed to cancel", description: String(e), variant: "destructive" })
    }
  }

  const annualSaving = (plan: typeof PLANS[0]) => {
    if (plan.price_monthly <= 0 || plan.price_annual <= 0) return 0
    return Math.round(((plan.price_monthly * 12 - plan.price_annual) / (plan.price_monthly * 12)) * 100)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} />
    </div>
  )

  const activePlan = PLANS.find(p => p.id === currentPlan) ?? PLANS[0]
  const nextBillingDate = subscription?.current_end
    ? new Date(subscription.current_end * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminImpersonationBanner />

      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-gray-200 shadow-sm bg-white/90 backdrop-blur-md">
        <div className="container flex items-center justify-between px-4 py-3 mx-auto">
          <div className="flex items-center gap-3">
            <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
            <Separator orientation="vertical" className="h-6" />
            <Link to="/_authenticated/store/collections" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />Back
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
              <Crown className="w-4 h-4" style={{ color: BRAND.primary }} />
              Membership
            </span>
            <div className="flex items-center ml-auto">
              <Link to="/store/billing-history"
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors hover:bg-gray-50">
                <Receipt className="w-3.5 h-3.5" />
                Billing history
              </Link>
            </div>
          </div>
          <ProfileDropdown />
        </div>
      </div>

      <div className="container max-w-6xl px-4 py-10 mx-auto">

        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: `${BRAND.primary}15`, color: BRAND.primary }}>
            <Rocket className="w-3.5 h-3.5" />
            Creator Plans
          </div>
          <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
            Grow your creator business
          </h1>
          <p className="max-w-xl mx-auto text-base text-gray-500">
            Unlock more products, remove Junooni branding, get a custom domain and priority payouts — everything you need to scale.
          </p>
        </div>

        {/* Current plan banner */}
        {currentPlan !== "free" && (
          <div className="flex items-center justify-between gap-4 p-4 mb-8 border-2 rounded-2xl"
            style={{ borderColor: `${activePlan.color}40`, background: `${activePlan.color}08` }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: `${activePlan.color}20`, color: activePlan.color }}>
                {activePlan.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">You're on the <span style={{ color: activePlan.color }}>{activePlan.name}</span> plan</p>
                  <BadgeCheck className="w-4 h-4" style={{ color: activePlan.color }} />
                </div>
                {nextBillingDate && subscription?.status !== "cancelling" && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    Renews on {nextBillingDate}
                  </p>
                )}
                {subscription?.status === "cancelling" && (
                  <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    Cancels on {nextBillingDate} — reverts to Free
                  </p>
                )}
              </div>
            </div>
            {subscription && subscription.status !== "cancelling" && (
              <button onClick={handleCancelSubscription} className="text-xs text-gray-400 hover:text-red-500 transition-colors border border-gray-200 rounded-lg px-3 py-1.5">
                Cancel plan
              </button>
            )}
          </div>
        )}

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className={`text-sm font-medium ${billing === "monthly" ? "text-gray-900" : "text-gray-400"}`}>Monthly</span>
          <button
            onClick={() => setBilling(b => b === "monthly" ? "annual" : "monthly")}
            className="relative w-12 h-6 transition-colors rounded-full"
            style={{ background: billing === "annual" ? BRAND.primary : "#d1d5db" }}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${billing === "annual" ? "translate-x-6" : ""}`} />
          </button>
          <span className={`text-sm font-medium ${billing === "annual" ? "text-gray-900" : "text-gray-400"}`}>Annual</span>
          {billing === "annual" && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: BRAND.primary }}>
              Save up to 25%
            </span>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-5 mb-12 md:grid-cols-2 lg:grid-cols-3">
          {PLANS.map(plan => {
            const isCurrent = plan.id === currentPlan
            const isProcessing = processingPlanId === plan.id
            const saving = annualSaving(plan)
            const price = billing === "annual" ? plan.price_annual : plan.price_monthly
            const monthlyEquiv = billing === "annual" && plan.price_annual > 0 ? Math.round(plan.price_annual / 12) : null

            return (
              <div key={plan.id}
                className={`relative flex flex-col rounded-2xl border-2 transition-all ${
                  plan.highlighted
                    ? "shadow-xl scale-[1.02]"
                    : "shadow-sm hover:shadow-md"
                } ${isCurrent ? "bg-white" : "bg-white"}`}
                style={{ borderColor: plan.highlighted ? BRAND.primary : isCurrent ? `${plan.color}60` : "#e5e7eb" }}>

                {/* Popular badge */}
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold text-white whitespace-nowrap"
                    style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
                    ⭐ Most Popular
                  </div>
                )}

                <div className="flex flex-col flex-1 p-5">
                  {/* Plan header */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                      style={{ background: `${plan.color}15`, color: plan.color }}>
                      {plan.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-[11px] text-gray-400">{plan.tagline}</p>
                    </div>
                    {isCurrent && (
                      <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full border" style={{ borderColor: `${plan.color}50`, color: plan.color, background: `${plan.color}10` }}>
                        Active
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    {plan.price_monthly === -1 ? (
                      <p className="text-2xl font-bold text-gray-900">Custom</p>
                    ) : plan.price_monthly === 0 ? (
                      <p className="text-2xl font-bold text-gray-900">Free</p>
                    ) : (
                      <div>
                        <div className="flex items-end gap-1">
                          <span className="text-2xl font-bold text-gray-900">
                            {billing === "annual" && monthlyEquiv
                              ? `₹${(monthlyEquiv).toLocaleString("en-IN")}`
                              : `₹${(plan.price_monthly).toLocaleString("en-IN")}`}
                          </span>
                          <span className="pb-1 text-xs text-gray-400">/mo</span>
                        </div>
                        {billing === "annual" && (
                          <p className="text-[11px] text-gray-400">
                            Billed ₹{(plan.price_annual / 100).toLocaleString("en-IN")}/year
                            {saving > 0 && <span className="ml-1.5 text-green-600 font-semibold">Save {saving}%</span>}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="flex-1 mb-6 space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className={`flex items-center gap-2 text-xs ${f.included ? "text-gray-700" : "text-gray-400 line-through"}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${f.included ? "" : "opacity-40"}`}
                          style={{ background: f.included ? `${plan.color}20` : "#f3f4f6", color: f.included ? plan.color : "#9ca3af" }}>
                          {f.included ? <Check className="w-2.5 h-2.5" /> : <span className="text-[10px]">—</span>}
                        </div>
                        <span className="flex items-center gap-1">{f.icon}{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={isCurrent || isProcessing || (plan.price_monthly === 0 && currentPlan !== "free")}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      isCurrent
                        ? "bg-gray-100 text-gray-400 cursor-default"
                        : plan.id === "enterprise"
                          ? "border-2 bg-white text-gray-700 hover:bg-gray-50"
                          : "text-white hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
                    }`}
                    style={{
                      background: isCurrent ? undefined : plan.id === "enterprise" ? undefined : `linear-gradient(135deg, ${plan.color} 0%, ${plan.highlighted ? BRAND.secondary : plan.color}cc 100%)`,
                      borderColor: plan.id === "enterprise" ? plan.color : undefined,
                    }}
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" />Processing...</>
                    ) : isCurrent ? (
                      <><BadgeCheck className="w-3.5 h-3.5" />Current plan</>
                    ) : plan.id === "enterprise" ? (
                      <><ExternalLink className="w-3.5 h-3.5" />Contact us</>
                    ) : (
                      <>{plan.cta} <ChevronRight className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Feature comparison table */}
        <div className="mb-8 overflow-hidden bg-white border border-gray-200 rounded-2xl">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Full comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="w-2/5 px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-400 uppercase">Feature</th>
                  {PLANS.map(p => (
                    <th key={p.id} className={`px-4 py-3 text-center ${p.id === currentPlan ? "bg-orange-50" : ""}`}>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold" style={{ color: p.color }}>{p.name}</span>
                        {p.id === currentPlan && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: `${p.color}20`, color: p.color }}>Your plan</span>}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { label: "Products", values: ["10", "50", "Unlimited"] },
                  { label: "Store live", values: [false, true, true] },
                  { label: "Custom domain", values: [false, false, true] },
                  { label: "Remove Junooni branding", values: [false, true, true] },
                  { label: "Priority payouts", values: [false, false, true] },
                  { label: "Support", values: ["Email", "Priority email", "Phone + WhatsApp"] },
                  { label: "Price/month", values: ["Free", "₹999", "Custom"] },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50/50"}>
                    <td className="px-6 py-3 text-sm font-medium text-gray-700">{row.label}</td>
                    {row.values.map((val, j) => (
                      <td key={j} className={`px-4 py-3 text-center ${PLANS[j]?.id === currentPlan ? "bg-orange-50/50" : ""}`}>
                        {typeof val === "boolean" ? (
                          val
                            ? <Check className="w-4 h-4 mx-auto" style={{ color: BRAND.primary }} />
                            : <span className="text-lg text-gray-300">—</span>
                        ) : (
                          <span className="text-xs font-medium text-gray-600">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="p-6 bg-white border border-gray-200 rounded-2xl">
          <h2 className="mb-5 text-lg font-bold text-gray-900">Frequently asked questions</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              { q: "Can I change plans anytime?", a: "Yes. Upgrade instantly and it takes effect immediately. Downgrading takes effect at the end of your billing cycle." },
              { q: "What happens to my store if I downgrade?", a: "Your store reverts to Draft mode and the product limit applies. Existing products above the limit are hidden but not deleted." },
              { q: "Is my payment secure?", a: "Yes. Payments are processed by Razorpay — India's leading payment gateway. We never store your card details." },
              { q: "How does the annual discount work?", a: "Annual plans are billed once a year at the discounted rate. You save up to 25% compared to paying monthly." },
              { q: "What is custom domain setup?", a: "On Pro, our team will configure your own domain (e.g. merch.yourname.com) to point to your JUNOONI store. Usually done within 24 hours." },
              { q: "How do I contact support?", a: "Email us at support@junooni.com. Pro plan creators get a dedicated Slack/WhatsApp channel with same-day response." },
            ].map((faq, i) => (
              <div key={i} className="space-y-1">
                <p className="text-sm font-semibold text-gray-800">{faq.q}</p>
                <p className="text-sm leading-relaxed text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}