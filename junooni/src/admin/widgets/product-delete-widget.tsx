import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { Container, Heading, Text, Button, toast } from "@medusajs/ui"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { sdk } from "../lib/sdk"

// ─── Delete confirmation modal ────────────────────────────────────────────────

const DeleteProductModal = ({
  product,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  product: AdminProduct
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}) => {
  const [typedTitle, setTypedTitle] = useState("")
  const titleMatches = typedTitle.trim() === product.title?.trim()

  return (
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
                Permanently delete product?
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
              "Product record and all metadata",
              "All mockup images (from S3 storage)",
              "All variants, options, and pricing",
              "Artwork links for this product",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 text-xs">✕</span>
                <Text className="text-sm text-red-700">{item}</Text>
              </div>
            ))}
          </div>

          {/* Type-to-confirm */}
          <div className="mb-6">
            <Text className="text-sm text-gray-700 mb-2">
              Type{" "}
              <span className="font-mono font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">
                {product.title}
              </span>{" "}
              to confirm
            </Text>
            <input
              type="text"
              value={typedTitle}
              onChange={e => setTypedTitle(e.target.value)}
              placeholder={product.title ?? ""}
              disabled={isDeleting}
              autoFocus
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: typedTitle && !titleMatches ? "#ef4444" : "#d1d5db",
              }}
            />
            {typedTitle && !titleMatches && (
              <Text className="text-xs text-red-500 mt-1">Title doesn't match.</Text>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              disabled={!titleMatches || isDeleting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700 active:bg-red-800"
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

// ─── Widget ───────────────────────────────────────────────────────────────────

const ProductDeleteWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const navigate = useNavigate()
  const [showModal, setShowModal]   = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await sdk.client.fetch(
        `/admin/products/${product.id}/permanent-delete`,
        { method: "DELETE" }
      )

      // 207 = partial success (product deleted but some files had errors)
      if (response && (response as any).errors?.length) {
        toast.warning(
          `Product deleted, but some files could not be cleaned up: ${(response as any).errors.join("; ")}`
        )
      } else {
        toast.success(`"${product.title}" permanently deleted.`)
      }

      setShowModal(false)
      navigate("/products")
    } catch (err) {
      toast.error(
        `Delete failed: ${err instanceof Error ? err.message : "Unknown error"}`
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {showModal && (
        <DeleteProductModal
          product={product}
          onConfirm={handleDelete}
          onCancel={() => setShowModal(false)}
          isDeleting={isDeleting}
        />
      )}

      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h2" className="text-red-700">Danger zone</Heading>
            <Text className="text-sm text-gray-500 mt-0.5">
              Permanently delete this product and all its files from storage.
            </Text>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors"
          >
            🗑 Delete permanently
          </button>
        </div>
      </Container>
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductDeleteWidget