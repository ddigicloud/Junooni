// import { getStorefrontData } from "@/lib/api"
// import { CartProvider } from "@/context/CartContext"
// import CartDrawer from "@/components/cart/CartDrawer"
// import { notFound } from "next/navigation"

// export default async function HandleLayout({
//   children,
//   params,
// }: {
//   children: React.ReactNode
//   params: { handle: string }
// }) {
//   const data = await getStorefrontData(params.handle)
//   if (!data) notFound()

//   const brandPrimary = data.store?.primary_color ?? "#e65100"

//   return (
//     <CartProvider>
//       {children}
//       <CartDrawer handle={params.handle} brandPrimary={brandPrimary} />
//     </CartProvider>
//   )
// }

// src/app/[handle]/layout.tsx
// Wraps ALL routes under /[handle]/ including:
//   /[handle]/
//   /[handle]/products/[productHandle]
//   /[handle]/p/[slug]
//
// Password gate is checked here so it applies to every sub-route.

// src/app/[handle]/layout.tsx
// Lightweight — only checks cookie + renders gate or children.
// Does NOT fetch from backend (page.tsx does the single real fetch).

// src/app/[handle]/layout.tsx
// Lightweight — only checks cookie + renders gate or children.
// Does NOT fetch from backend (page.tsx does the single real fetch).

import { headers, cookies } from "next/headers"
import PasswordGateWrapper from "@/components/PasswordGateWrapper"
import { CartProvider } from "@/context/CartContext"
import CartDrawer from "@/components/cart/CartDrawer"
import StoreEditorBridge from "@/components/store/StoreEditorBridge"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const JWT_SECRET  = process.env.JWT_SECRET ?? "junooni-store-access-secret"

function resolveHandle(paramHandle: string): string {
  const xHandle = headers().get("x-handle")
  return xHandle ?? paramHandle
}

function isVendorPreview(): boolean {
  return headers().get("x-vendor-preview") === "1"
}

function getStoreCookieToken(handle: string): string {
  return cookies().get(`store_access_${handle}`)?.value ?? ""
}

function isValidToken(handle: string, token: string): boolean {
  if (!token) return false
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return false
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"))
    if (payload.exp && Date.now() / 1000 > payload.exp) return false
    if (payload.handle !== handle) return false
    const crypto = require("crypto")
    const expected = crypto.createHmac("sha256", JWT_SECRET)
      .update(`${parts[0]}.${parts[1]}`).digest("base64url")
    return expected === parts[2]
  } catch {
    return false
  }
}

interface Props {
  children: React.ReactNode
  params: { handle: string }
}

const STATIC_HANDLES = new Set([
  "favicon.ico", "robots.txt", "sitemap.xml", "apple-touch-icon.png",
  "manifest.json", "sw.js", "workbox-0000.js",
])

// Wrap with CartProvider + CartDrawer — always pass handle
function StoreShell({
  handle,
  brandPrimary = "#e65100",
  children,
}: {
  handle: string
  brandPrimary?: string
  children: React.ReactNode
}) {
  return (
    <CartProvider handle={handle}>
      {/* Listens for STORE_SAVED from editor iframe and calls router.refresh() */}
      <StoreEditorBridge />
      {children}
      <CartDrawer handle={handle} brandPrimary={brandPrimary} />
    </CartProvider>
  )
}

export default async function HandleLayout({ children, params }: Props) {
  const handle = resolveHandle(params.handle)

  console.log(`[layout] handle="${handle}" params.handle="${params.handle}"`)

  if (STATIC_HANDLES.has(handle) || handle.includes(".")) {
    return <>{children}</>
  }

  if (isVendorPreview()) {
    return <StoreShell handle={handle}>{children}</StoreShell>
  }

  const token = getStoreCookieToken(handle)

  if (isValidToken(handle, token)) {
    return <StoreShell handle={handle}>{children}</StoreShell>
  }

  try {
    const res = await fetch(`${BACKEND_URL}/storefront/${handle}`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return <StoreShell handle={handle}>{children}</StoreShell>
    }

    const data = await res.json()
    const store = data?.store

    if (!store?.password_enabled) {
      return (
        <StoreShell handle={handle} brandPrimary={store?.primary_color ?? "#e65100"}>
          {children}
        </StoreShell>
      )
    }

    return (
      <PasswordGateWrapper
        handle={handle}
        storeName={data.vendor?.name ?? "Store"}
        storeLogo={store.store_logo}
        primaryColor={store.primary_color}
        secondaryColor={store.secondary_color}
        backendUrl={BACKEND_URL}
      />
    )
  } catch {
    return <StoreShell handle={handle}>{children}</StoreShell>
  }
}