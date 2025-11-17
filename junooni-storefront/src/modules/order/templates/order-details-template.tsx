// "use client"

// import { XMark } from "@medusajs/icons"
// import { HttpTypes } from "@medusajs/types"
// import LocalizedClientLink from "@modules/common/components/localized-client-link"
// import Help from "@modules/order/components/help"
// import Items from "@modules/order/components/items"
// import OrderDetails from "@modules/order/components/order-details"
// import OrderSummary from "@modules/order/components/order-summary"
// import ShippingDetails from "@modules/order/components/shipping-details"
// import React from "react"

// type OrderDetailsTemplateProps = {
//   order: HttpTypes.StoreOrder
// }

// const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
//   order,
// }) => {
//   return (
//     <div className="flex flex-col justify-center gap-y-4">
//       <div className="flex items-center justify-between gap-2">
//         <h1 className="text-2xl-semi">Order details</h1>
//         <LocalizedClientLink
//           href="/account/orders"
//           className="flex items-center gap-2 text-ui-fg-subtle hover:text-ui-fg-base"
//           data-testid="back-to-overview-button"
//         >
//           <XMark /> Back to overview
//         </LocalizedClientLink>
//       </div>
//       <div
//         className="flex flex-col w-full h-full gap-4 bg-white"
//         data-testid="order-details-container"
//       >
//         <OrderDetails order={order} showStatus />
//         <Items order={order} />
//         <ShippingDetails order={order} />
//         <OrderSummary order={order} />
//         <Help />
//       </div>
//     </div>
//   )
// }

// export default OrderDetailsTemplate

// Replace your existing component with this updated version

// Replace your existing component with this updated version
"use client"

import { HttpTypes } from "@medusajs/types"
import {
  ArrowLeft,
  ChevronRight,
  Download,
  MessageSquare,
  Truck,
  FileText,
  Settings,
  Loader2,
} from "lucide-react"
import React, { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import PaymentDetails from "@modules/order/components/payment-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import Items from "@modules/order/components/items"
import Help from "@modules/order/components/help"
import OrderRelatedProducts from "@modules/order/components/order-related-products"
import { fetchOrderInvoice } from "@lib/data/customer" // Import the new server function

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
  countryCode?: string // Make it optional
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
  countryCode,
}) => {
  const [activeTab, setActiveTab] = useState<"items" | "payment">("items")
  const [vendorSummaryData, setVendorSummaryData] = useState<Record<string, any>>({})
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false)
  const [invoiceError, setInvoiceError] = useState<string | null>(null)

  // Generate professional invoice using backend service
  const generateProfessionalInvoice = async () => {
    if (!order || !order.items?.length) {
      setInvoiceError("No order items found to generate invoice")
      return
    }

    setIsGeneratingInvoice(true)
    setInvoiceError(null)

    try {
      // Use the server function instead of local fetch
      const result = await fetchOrderInvoice(order.id)

      if (!result || !result.success) {
        throw new Error(result?.error || "Failed to fetch invoice")
      }

      // Convert base64 back to blob for download
      const binaryString = atob(result.data.base64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      const pdfBlob = new Blob([bytes], { type: result.data.mimeType })

      // Create download link
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `junooni_invoice_${order.display_id || order.id || "unknown"}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (err) {
      setInvoiceError(err instanceof Error ? err.message : "Unexpected error")
    } finally {
      setIsGeneratingInvoice(false)
    }
  }

  return (
    <div className="min-h-screen mt-6 bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center">
              <LocalizedClientLink
                href="/account/orders"
                className="mr-3 text-gray-500 transition hover:text-orange-600"
                data-testid="back-to-overview-button"
              >
                <ArrowLeft size={20} />
              </LocalizedClientLink>
              <h1 className="text-2xl font-semibold text-gray-800">
                Order Details
              </h1>
            </div>
            <div className="flex items-center mt-2">
              <span className="font-medium text-gray-600">
                Order #{order.display_id}
              </span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-gray-600">
                {new Date(order.created_at).toLocaleDateString()}
              </span>

              {order.status && (
                <>
                  <span className="mx-2 text-gray-400">•</span>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {order.fulfillment_status.replace("_", " ")}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-0 py-3 mx-auto sm:px-6 lg:px-8">
        {/* Order Info */}
        <OrderDetails order={order} showStatus />

        {/* Order Details Tabs */}
        <div className="mb-6 overflow-hidden bg-white rounded-lg sm:shadow md:shadow">
          <div className="border-b border-gray-200">
            <nav className="flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("items")}
                className={`${
                  activeTab === "items"
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                Items
              </button>
              <button
                onClick={() => setActiveTab("payment")}
                className={`${
                  activeTab === "payment"
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                Payment Details
              </button>
            </nav>
          </div>

          <div className="sm:p-6 md:p-6 px-0 py-3">
            {activeTab === "items" && <Items order={order} />}

            {activeTab === "payment" && (
              <div className="space-y-6">
                <PaymentDetails order={order} />
                <ShippingDetails order={order} />
                <OrderSummary order={order} />
              </div>
            )}
          </div>

          {/* Professional Invoice Actions - Only show if order is fulfilled/delivered */}
          {(order.fulfillment_status === 'fulfilled' || order.fulfillment_status === 'delivered') && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col space-y-4">
                {/* Professional Backend Invoice */}
                <div>
                  {/* <h3 className="text-sm font-medium text-gray-900 mb-3">Click below button to download invoice 👇</h3> */}
                
                {/* Error Display */}
                {invoiceError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">
                      <strong>Error:</strong> {invoiceError}
                    </p>
                  </div>
                )}

                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={generateProfessionalInvoice}
                    disabled={isGeneratingInvoice}
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingInvoice ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Generating Invoice...
                      </>
                    ) : (
                      <>
                        <Download size={16} className="mr-2" />
                         Download Invoice
                      </>
                    )}
                  </button>
                </div>           
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Related Products */}
        <div className="mb-12">
          <OrderRelatedProducts order={order} countryCode={countryCode || 'in'} />
        </div>

        {/* Help Section */}
        {/* <Help /> */}
      </main>
    </div>
  )
}

export default OrderDetailsTemplate