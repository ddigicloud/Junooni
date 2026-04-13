// junooni-creator-store/middleware.ts  (root of the Next.js project)

import { NextRequest, NextResponse } from "next/server"

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "junooni.com"
const STORE_PORT  = process.env.STORE_PORT ?? "3001"  // only used locally

export function middleware(req: NextRequest) {
  const url  = req.nextUrl.clone()
  const host = req.headers.get("host") ?? ""

  // ── 1. Strip port for localhost comparisons ──────────────────────────────
  const hostname = host.replace(/:.*$/, "")

  // ── 2. Detect localhost dev mode ─────────────────────────────────────────
  // Dev URL pattern:  http://localhost:3001/tanishkhandle
  //   → handle comes from the URL path, not the subdomain
  // Prod URL pattern: https://tanishk.junooni.com/
  //   → handle comes from the subdomain

  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1"

  if (isLocalhost) {
    // Dev: keep existing path-based routing — nothing to rewrite
    return NextResponse.next()
  }

  // ── 3. Production: extract subdomain ─────────────────────────────────────
  // hostname = "tanishk.junooni.com"
  // ROOT_DOMAIN = "junooni.com"
  // subdomain  = "tanishk"

  const subdomain = hostname.endsWith(`.${ROOT_DOMAIN}`)
    ? hostname.slice(0, -(ROOT_DOMAIN.length + 1))   // "tanishk"
    : null

  // ── 4. If no subdomain (bare junooni.com) → main marketing site, skip ───
  if (!subdomain || subdomain === "www") {
    return NextResponse.next()
  }

  // ── 5. Rewrite: /  →  /[subdomain]  internally ───────────────────────────
  // The browser still sees "tanishk.junooni.com"
  // Next.js internally routes to /tanishk/...
  //
  // Only rewrite root + non-Next.js internal paths
  // (leave /_next/, /api/, /favicon.ico alone)
  const isInternal =
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api")   ||
    url.pathname === "/favicon.ico"

  if (!isInternal) {
    // Prepend the subdomain as the first path segment if not already there
    if (!url.pathname.startsWith(`/${subdomain}`)) {
      url.pathname = `/${subdomain}${url.pathname}`
    }

    const res = NextResponse.rewrite(url)
    // Pass handle to server components via header
    res.headers.set("x-handle", subdomain)
    return res
  }

  return NextResponse.next()
}

export const config = {
  // Run on all paths except static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}