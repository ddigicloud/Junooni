// junooni-creator-store/middleware.ts

import { NextRequest, NextResponse } from "next/server"

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "junooni.com"
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

const domainCache = new Map<string, { handle: string; ts: number }>()
const CACHE_TTL   = 5 * 60 * 1000

async function resolveCustomDomain(hostname: string): Promise<string | null> {
  const cached = domainCache.get(hostname)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.handle
  try {
    const res = await fetch(
      `${BACKEND_URL}/storefront/by-domain?domain=${encodeURIComponent(hostname)}`,
      { cache: "no-store", signal: AbortSignal.timeout(3000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    const handle = data?.handle ?? null
    if (handle) domainCache.set(hostname, { handle, ts: Date.now() })
    return handle
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const url      = req.nextUrl.clone()
  const host     = req.headers.get("host") ?? ""
  const hostname = host.replace(/:.*$/, "").toLowerCase()
  const pathname = url.pathname

  // Never touch static files or Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api")   ||
    // pathname === "/favicon.ico"   ||
    pathname === "/robots.txt"    ||
    pathname === "/sitemap.xml"   ||
    /\.(?:ico|png|jpg|jpeg|gif|svg|webp|css|js|woff2?)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  let handle: string | null = null

  // ── junooni.com subdomain: meenal.junooni.com ────────────────────────────
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = hostname.slice(0, -(ROOT_DOMAIN.length + 1))
    if (sub && sub !== "www" && sub !== "studio" && sub !== "api") {
      handle = sub
    }
  }

  // ── Dev: meenal.localhost:3001 ────────────────────────────────────────────
  else if (hostname.endsWith(".localhost")) {
    handle = hostname.replace(/\.localhost$/, "")
  }

  // ── Custom domain: sunozara.store ─────────────────────────────────────────
  else if (
    hostname !== "localhost" &&
    hostname !== ROOT_DOMAIN &&
    !hostname.startsWith("localhost:")
  ) {
    handle = await resolveCustomDomain(hostname)
  }

  // No handle found (root junooni.com or localhost dev) → pass through
  if (!handle) return NextResponse.next()

  // ── Redirect custom domain checkout to junooni subdomain ─────────────────
const isJunooniSubdomain = hostname.endsWith(`.${ROOT_DOMAIN}`)
if (!isJunooniSubdomain && pathname.startsWith("/checkout")) {
  const junooniUrl = `https://${handle}.${ROOT_DOMAIN}${pathname}${url.search}`
  return NextResponse.redirect(junooniUrl)
}

// ── CORS for checkout on junooni subdomain ────────────────────────────────
// When the RSC fetch from a custom domain follows the redirect above, it
// arrives here as a cross-origin request. Without CORS headers the browser
// blocks it with "No Access-Control-Allow-Origin".
if (isJunooniSubdomain && pathname.startsWith("/checkout")) {
  const origin = req.headers.get("origin") ?? ""
  const isCrossOrigin = !!origin && !origin.endsWith(`.${ROOT_DOMAIN}`) && origin !== `https://${ROOT_DOMAIN}`
  if (isCrossOrigin) {
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url",
          "Access-Control-Max-Age": "86400",
        },
      })
    }
    url.pathname = pathname === "/" ? `/${handle}` : `/${handle}${pathname}`
    const res = NextResponse.rewrite(url)
    res.headers.set("x-handle", handle)
    res.headers.set("Access-Control-Allow-Origin", origin)
    res.headers.set("Access-Control-Allow-Credentials", "true")
    if (url.searchParams.get("__preview") === "1") res.headers.set("x-vendor-preview", "1")
    return res
  }
}

  // ── Rewrite browser URL path → internal Next.js path ─────────────────────
  //
  // Browser sees:   meenal.junooni.com/              (clean URL ✓)
  // Browser sees:   meenal.junooni.com/products/mug  (clean URL ✓)
  // Next.js routes: /meenal                          (internal)
  // Next.js routes: /meenal/products/mug             (internal)
  //
  // NextResponse.rewrite() rewrites server-side only — browser URL stays clean.
  // The handle NEVER appears in the browser URL bar.

  // pathname from browser: "/" or "/products/mug" or "/about"
  // Never includes the handle since it comes from subdomain/custom domain
  const internalPath = pathname === "/"
    ? `/${handle}`
    : `/${handle}${pathname}`

  url.pathname = internalPath

  const res = NextResponse.rewrite(url)
  res.headers.set("x-handle", handle)

  if (url.searchParams.get("__preview") === "1") {
    res.headers.set("x-vendor-preview", "1")
  }

  console.log(`[middleware] ${hostname}${pathname} → ${internalPath}`)
  return res
}

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
//   ],
// }
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|robots.txt|sitemap.xml).*)",
  ],
}