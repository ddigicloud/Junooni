// "use client"

// import { useEffect } from "react"
// import { useRouter } from "next/navigation"

// // Global store override — set by editor, read by components
// export let editorStoreOverride: any = null

// export default function StoreEditorBridge() {
//   const router = useRouter()

//   useEffect(() => {
//     const handler = (e: MessageEvent) => {
//       if (e.data?.type === "STORE_UPDATE") {
//         // Apply store override in memory immediately
//         editorStoreOverride = e.data.store
//         // Dispatch a custom event so client components can react
//         window.dispatchEvent(new CustomEvent("editor-store-update", { 
//           detail: e.data.store 
//         }))
//         // Signal editor that iframe is ready
//         e.source?.postMessage?.({ type: "IFRAME_READY" }, "*" as any)
//       }
//       if (e.data?.type === "STORE_SAVED") {
//         // Only do server refresh on actual save
//         editorStoreOverride = null
//         router.refresh()
//       }
//     }

//     window.addEventListener("message", handler)
//     // Tell editor we're ready immediately on mount
//     window.parent.postMessage({ type: "IFRAME_READY" }, "*")
//     return () => window.removeEventListener("message", handler)
//   }, [router])

//   return null
// }

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export let editorStoreOverride: any = null

export default function StoreEditorBridge() {
  const router = useRouter()

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "STORE_UPDATE") {
        editorStoreOverride = e.data.store
        window.dispatchEvent(new CustomEvent("editor-store-update", { 
          detail: e.data.store 
        }))
        e.source?.postMessage?.({ type: "IFRAME_READY" }, "*" as any)
      }
      if (e.data?.type === "STORE_SAVED") {
        editorStoreOverride = null
        router.refresh()
      }
      // ── NEW: instant client-side navigation from page switcher ──
      if (e.data?.type === "NAVIGATE" && e.data.path) {
        const segments = window.location.pathname.split("/").filter(Boolean)
        const handle = segments[0] ?? ""
        const fullPath = handle ? `/${handle}${e.data.path === "/" ? "" : e.data.path}` : e.data.path
        router.push(fullPath)
      }
    }

    window.addEventListener("message", handler)
    window.parent.postMessage({ type: "IFRAME_READY" }, "*")
    return () => window.removeEventListener("message", handler)
  }, [router])

  return null
}