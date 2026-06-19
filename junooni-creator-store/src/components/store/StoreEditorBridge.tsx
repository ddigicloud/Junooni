// "use client"

// import { useEffect } from "react"
// import { useRouter } from "next/navigation"

// export let editorStoreOverride: any = null

// export default function StoreEditorBridge() {
//   const router = useRouter()

//   useEffect(() => {
//     const handler = (e: MessageEvent) => {
//       if (e.data?.type === "STORE_UPDATE") {
//         editorStoreOverride = e.data.store
//         window.dispatchEvent(new CustomEvent("editor-store-update", { 
//           detail: e.data.store 
//         }))
//         e.source?.postMessage?.({ type: "IFRAME_READY" }, "*" as any)
//       }
//       if (e.data?.type === "STORE_SAVED") {
//         editorStoreOverride = null
//         router.refresh()
//       }
//       // ── NEW: instant client-side navigation from page switcher ──
//      if (e.data?.type === "NAVIGATE" && e.data.path) {
//         const isProd = process.env.NODE_ENV === "production"
//         if (isProd) {
//           router.push(e.data.path === "/" ? "/" : e.data.path)
//         } else {
//           const segments = window.location.pathname.split("/").filter(Boolean)
//           const handle = segments[0] ?? ""
//           const fullPath = handle
//             ? `/${handle}${e.data.path === "/" ? "" : e.data.path}`
//             : e.data.path
//           router.push(fullPath)
//         }
//       }
//     }

//     window.addEventListener("message", handler)
//     window.parent.postMessage({ type: "IFRAME_READY" }, "*")
//     return () => window.removeEventListener("message", handler)
//   }, [router])

//   return null
// }



"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export let editorStoreOverride: any = null

export default function StoreEditorBridge() {
  const router   = useRouter()
  const pathname = usePathname()

  // ── Tell the studio whenever the route changes, for ANY reason ──
  // (page switcher NAVIGATE, in-iframe Link clicks, cart drawer's
  // router.push to /checkout, redirects, etc.)
  useEffect(() => {
    window.parent.postMessage({ type: "IFRAME_NAVIGATION", path: pathname }, "*")
  }, [pathname])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "STORE_UPDATE") {
        editorStoreOverride = e.data.store
        window.dispatchEvent(new CustomEvent("editor-store-update", {
          detail: e.data.store
        }))
        // NOTE: removed the erroneous IFRAME_READY echo that lived here —
        // it was firing on every store edit and resetting the studio's
        // isNavigating/loading state unnecessarily.
      }
      if (e.data?.type === "STORE_SAVED") {
        editorStoreOverride = null
        router.refresh()
      }
      // ── Page switcher → instant client-side navigation ──
      if (e.data?.type === "NAVIGATE" && e.data.path) {
        const isProd = process.env.NODE_ENV === "production"
        if (isProd) {
          router.push(e.data.path === "/" ? "/" : e.data.path)
        } else {
          const segments = window.location.pathname.split("/").filter(Boolean)
          const handle = segments[0] ?? ""
          const fullPath = handle
            ? `/${handle}${e.data.path === "/" ? "" : e.data.path}`
            : e.data.path
          router.push(fullPath)
        }
      }
    }

    window.addEventListener("message", handler)
    window.parent.postMessage({ type: "IFRAME_READY" }, "*")
    return () => window.removeEventListener("message", handler)
  }, [router])

  return null
}