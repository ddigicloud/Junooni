import { headers, cookies } from "next/headers"
import { cache } from "react"
import type { Metadata } from "next"
import PasswordGateWrapper from "@/components/PasswordGateWrapper"
import { getStoreShell } from "@/lib/api"
import StoreShellWrapper from "@/components/store/StoreShellWrapper"
import TrackingScripts from "@/components/store/TrackingScripts"

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

// Cached fetch — shared between generateMetadata and the layout render.
// Uses the lightweight ?shell=true path (vendor + store only, no products
// query.index) since metadata/password-gate only need vendor/store fields.
const fetchStoreForLayout = cache(async (handle: string, token: string) => {
  return getStoreShell(handle, { accessToken: token || undefined })
})

interface Props {
  children: React.ReactNode
  params: { handle: string }
}

const STATIC_HANDLES = new Set([
  "favicon.ico", "robots.txt", "sitemap.xml", "apple-touch-icon.png",
  "manifest.json", "sw.js", "workbox-0000.js",
])

// ─── Metadata (covers ALL child routes: /categories, /products/:id, etc.) ───
export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const handle = resolveHandle(params.handle)

  if (STATIC_HANDLES.has(handle) || handle.includes(".")) return {}

  const token = getStoreCookieToken(handle)
  const data = await fetchStoreForLayout(handle, token)

  if (!data?.store || !data?.vendor) return {}

  const { vendor, store } = data

  return {
    title: store.seo_title ?? `${vendor.name} — Official Merch`,
    description:
      store.seo_description ??
      vendor.creator_bio ??
      `Official merchandise store for ${vendor.name}`,
    openGraph: {
      title: store.seo_title ?? `${vendor.name} — Official Merch`,
      images: store.og_image
        ? [{ url: store.og_image }]
        : vendor.logo
        ? [{ url: vendor.logo }]
        : [],
    },
    robots: store.status === "live" ? "index,follow" : "noindex",
    icons: store.store_favicon
      ? {
          icon: store.store_favicon,
          shortcut: store.store_favicon,
          apple: store.store_favicon,
        }
      : undefined,
  }
}


// ─── Shell ────────────────────────────────────────────────────────────────────
// function StoreShellWrapper({
//   handle,
//   brandPrimary = "#e65100",
//   children,
// }: {
//   handle: string
//   brandPrimary?: string
//   children: React.ReactNode
// }) {
//   return (
//     <CartProvider handle={handle}>
//       <StoreEditorBridge />
//       {children}
//       <CartDrawer handle={handle} brandPrimary={brandPrimary} />
//     </CartProvider>
//   )
// }

// ─── Layout ───────────────────────────────────────────────────────────────────
export default async function HandleLayout({ children, params }: Props) {
  const handle = resolveHandle(params.handle)

  //console.log(`[layout] handle="${handle}" params.handle="${params.handle}"`)

  if (STATIC_HANDLES.has(handle) || handle.includes(".")) {
    //console.log(`[layout] static handle — skipping`)
    return <>{children}</>
  }

  if (isVendorPreview()) {
    //console.log(`[layout] isVendorPreview=true — skipping TrackingScripts`)
    return <StoreShellWrapper handle={handle}>{children}</StoreShellWrapper>
  }

  const token = getStoreCookieToken(handle)
  //console.log(`[layout] token=${token ? "present" : "absent"}`)

  if (isValidToken(handle, token)) {
    //console.log(`[layout] isValidToken=true — fetching store for TrackingScripts`)
    let trackedStore: any = null
    try {
      const r = await fetch(`${BACKEND_URL}/storefront/${handle}?shell=true`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
      })
      //console.log(`[layout] isValidToken fetch status=${r.status}`)
      if (r.ok) {
        const d = await r.json()
        trackedStore = d?.store ?? null
        //console.log(`[layout] isValidToken trackedStore gtm_id=${trackedStore?.gtm_id}`)
      }
    } catch (e) {
      //console.log(`[layout] isValidToken fetch error:`, e)
    }
    return (
      <StoreShellWrapper handle={handle} brandPrimary={trackedStore?.primary_color ?? "#e65100"}>
        <TrackingScripts store={trackedStore} />
        {children}
      </StoreShellWrapper>
    )
  }

  try {
    //console.log(`[layout] no token — fetching storefront shell`)
    const res = await fetch(`${BACKEND_URL}/storefront/${handle}?shell=true`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8000),
    })
    //console.log(`[layout] storefront fetch status=${res.status}`)

    if (!res.ok) {
      //console.log(`[layout] storefront fetch not ok — rendering without TrackingScripts`)
      return <StoreShellWrapper handle={handle}>{children}</StoreShellWrapper>
    }

    const data = await res.json()
    const store = data?.store
    //console.log(`[layout] store.password_enabled=${store?.password_enabled} gtm_id=${store?.gtm_id}`)

    if (!store?.password_enabled) {
      //console.log(`[layout] rendering with TrackingScripts`)
      return (
        <StoreShellWrapper handle={handle} brandPrimary={store?.primary_color ?? "#e65100"}>
          <TrackingScripts store={store} />
          {children}
        </StoreShellWrapper>
      )
    }

    //console.log(`[layout] password_enabled=true — rendering PasswordGateWrapper`)
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
  } catch (e) {
    //console.log(`[layout] try/catch error:`, e)
    return <StoreShellWrapper handle={handle}>{children}</StoreShellWrapper>
  }
}