"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { XCircle, Loader2, AlertTriangle, X } from "lucide-react"
import { cancelOrder } from "@/lib/orders"

function CancelConfirmModal({
  onConfirm,
  onClose,
  loading,
}: {
  onConfirm: () => void
  onClose: () => void
  loading: boolean
}) {
  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon + heading */}
        <div className="px-6 pt-8 pb-6 text-center">
          <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-full bg-red-50">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Cancel this order?
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            This action cannot be undone. Your order will be canceled and
            any payment will be refunded according to our policy.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Actions */}
        <div className="flex gap-3 px-6 py-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Keep Order
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Canceling...</>
              : "Yes, Cancel Order"
            }
          </button>
        </div>

      </div>
    </div>
  )
}

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canceled, setCanceled] = useState(false)
  const router = useRouter()

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    const result = await cancelOrder(orderId)
    setLoading(false)
    if (result.success) {
      setShowModal(false)
      setCanceled(true)
      router.refresh()
    } else {
      setShowModal(false)
      setError(result.error ?? "Failed to cancel order")
    }
  }

  if (canceled) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-red-600 border border-red-200 rounded-xl bg-red-50">
        <XCircle className="w-4 h-4" />
        Order cancellation requested
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center w-full gap-2 py-3 text-sm font-semibold transition-colors border-2 border-red-200 rounded-xl text-red-600 hover:bg-red-50"
        >
          <XCircle className="w-4 h-4" />
          Cancel Order
        </button>
        {error && (
          <p className="text-xs text-center text-red-500">{error}</p>
        )}
      </div>

      {showModal && (
        <CancelConfirmModal
          onConfirm={handleConfirm}
          onClose={() => !loading && setShowModal(false)}
          loading={loading}
        />
      )}
    </>
  )
}