"use client"

import { useEditorStore } from "@/lib/useEditorStore"
import MinimalTemplate from "@/components/templates/minimal/MinimalTemplate"
import BoldTemplate from "@/components/templates/bold/BoldTemplate"
import EditorialTemplate from "@/components/templates/editorial/EditorialTemplate"

interface Props {
  vendor: any
  store: any       // server-fetched store (initial value)
  products: any[]
  categories: any[]
  collections: any[]
}

export default function StoreRenderer({ vendor, store: serverStore, products, categories, collections }: Props) {
  // This reactively picks up editor postMessage updates
  const store = useEditorStore(serverStore)

  const template = store?.template ?? "minimal"

  const brandStyles = {
    "--brand-primary":   store?.primary_color   ?? "#e65100",
    "--brand-secondary": store?.secondary_color ?? "#ac1900",
  } as React.CSSProperties

  return (
    <div style={brandStyles}>
      {template === "minimal" && (
        <MinimalTemplate vendor={vendor} store={store} products={products}
          categories={categories} collections={collections} />
      )}
      {template === "bold" && (
        <BoldTemplate vendor={vendor} store={store} products={products}
          categories={categories} collections={collections} />
      )}
      {template === "editorial" && (
        <EditorialTemplate vendor={vendor} store={store} products={products}
          categories={categories} collections={collections} />
      )}
    </div>
  )
}