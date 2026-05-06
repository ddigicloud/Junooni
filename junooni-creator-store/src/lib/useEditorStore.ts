"use client"

import { useEffect, useState } from "react"
import { editorStoreOverride } from "../components/store/StoreEditorBridge"

export function useEditorStore(serverStore: any) {
  const [store, setStore] = useState(editorStoreOverride ?? serverStore)

  useEffect(() => {
    // Sync immediately in case override already exists
    if (editorStoreOverride) setStore(editorStoreOverride)

    const handler = (e: CustomEvent) => {
      setStore(e.detail)
    }
    window.addEventListener("editor-store-update", handler as EventListener)
    return () => window.removeEventListener("editor-store-update", handler as EventListener)
  }, [])

  return store
}