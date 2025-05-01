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

"use client"

import { HttpTypes } from "@medusajs/types"
import {
  ArrowLeft,
  ChevronRight,
  Download,
  MessageSquare,
  Truck,
} from "lucide-react"
import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import PaymentDetails from "@modules/order/components/payment-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import Items from "@modules/order/components/items"
import Help from "@modules/order/components/help"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  const [activeTab, setActiveTab] = useState<"items" | "payment">("items")

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
                    {order.status.replace("_", " ")}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8 mx-auto sm:px-6 lg:px-8">
        {/* Order Info */}
        <OrderDetails order={order} showStatus />

        {/* Order Details Tabs */}
        <div className="mb-6 overflow-hidden bg-white rounded-lg shadow">
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

          <div className="p-6">
            {activeTab === "items" && <Items order={order} />}

            {activeTab === "payment" && (
              <div className="space-y-6">
                <PaymentDetails order={order} />
                <ShippingDetails order={order} />
                <OrderSummary order={order} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <button className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm sm:w-auto hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                <Download size={16} className="mr-2" />
                Download Invoice
              </button>

              <div className="flex flex-col w-full space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:w-auto">
                <button className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm sm:w-auto hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                  <Truck size={16} className="mr-2" />
                  Track Order
                </button>
                <button className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm sm:w-auto hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                  <MessageSquare size={16} className="mr-2" />
                  Need Help?
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-8 mb-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            You Might Also Like
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden bg-white rounded-lg shadow"
              >
                <div className="w-full bg-gray-200 aspect-square">
                  <img
                    src={`/api/placeholder/400/400`}
                    alt={`Recommended product ${item}`}
                    className="object-cover object-center w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    Recommended Product {item}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    ${(item * 19.99).toFixed(2)}
                  </p>
                  <button className="inline-flex items-center justify-center w-full px-4 py-2 mt-2 text-xs font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <Help />
      </main>
    </div>
  )
}

export default OrderDetailsTemplate
