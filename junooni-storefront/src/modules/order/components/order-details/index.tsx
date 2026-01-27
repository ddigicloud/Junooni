// import { HttpTypes } from "@medusajs/types"
// import { Text } from "@medusajs/ui"

// type OrderDetailsProps = {
//   order: HttpTypes.StoreOrder
//   showStatus?: boolean
// }

// const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
//   const formatStatus = (str: string) => {
//     const formatted = str.split("_").join(" ")

//     return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
//   }

//   return (
//     <div>
//       <Text>
//         We have sent the order confirmation details to{" "}
//         <span
//           className="font-semibold text-ui-fg-medium-plus"
//           data-testid="order-email"
//         >
//           {order.email}
//         </span>
//         .
//       </Text>
//       <Text className="mt-2">
//         Order date:{" "}
//         <span data-testid="order-date">
//           {new Date(order.created_at).toDateString()}
//         </span>
//       </Text>
//       <Text className="mt-2 text-ui-fg-interactive">
//         Order number: <span data-testid="order-id">{order.display_id}</span>
//       </Text>

//       <div className="flex items-center mt-4 text-compact-small gap-x-4">
//         {showStatus && (
//           <>
//             <Text>
//               Order status:{" "}
//               <span className="text-ui-fg-subtle " data-testid="order-status">
//                 {/* TODO: Check where the statuses should come from */}
//                 {/* {formatStatus(order.fulfillment_status)} */}
//               </span>
//             </Text>
//             <Text>
//               Payment status:{" "}
//               <span
//                 className="text-ui-fg-subtle "
//                 sata-testid="order-payment-status"
//               >
//                 {/* {formatStatus(order.payment_status)} */}
//               </span>
//             </Text>
//           </>
//         )}
//       </div>
//     </div>
//   )
// }

// export default OrderDetails

// import { HttpTypes } from "@medusajs/types"
// import { Text } from "@medusajs/ui"

// type OrderDetailsProps = {
//   order: HttpTypes.StoreOrder
//   showStatus?: boolean
// }

// const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
//   const formatStatus = (str: string) => {
//     const formatted = str.split("_").join(" ")

//     return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
//   }

//   return (
//     <div>
//       <Text>
//         We have sent the order confirmation details to{" "}
//         <span
//           className="font-semibold text-ui-fg-medium-plus"
//           data-testid="order-email"
//         >
//           {order.email}
//         </span>
//         .
//       </Text>
//       <Text className="mt-2">
//         Order date:{" "}
//         <span data-testid="order-date">
//           {new Date(order.created_at).toDateString()}
//         </span>
//       </Text>
//       <Text className="mt-2 text-ui-fg-interactive">
//         Order number: <span data-testid="order-id">{order.display_id}</span>
//       </Text>

//       <div className="flex items-center mt-4 text-compact-small gap-x-4">
//         {showStatus && (
//           <>
//             <Text>
//               Order status:{" "}
//               <span className="text-ui-fg-subtle " data-testid="order-status">
//                 {/* TODO: Check where the statuses should come from */}
//                 {/* {formatStatus(order.fulfillment_status)} */}
//               </span>
//             </Text>
//             <Text>
//               Payment status:{" "}
//               <span
//                 className="text-ui-fg-subtle "
//                 sata-testid="order-payment-status"
//               >
//                 {/* {formatStatus(order.payment_status)} */}
//               </span>
//             </Text>
//           </>
//         )}
//       </div>
//     </div>
//   )
// }

// export default OrderDetails

"use client"

import { HttpTypes } from "@medusajs/types"
import { Check, Clock, Banknote } from "lucide-react"
import { formatDate } from "@lib/data/date-util"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (status: string) => {
    const formatted = status.split("_").join(" ")
    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  // Check if order is COD (Cash on Delivery)
  const isCODOrder = () => {
    // Check metadata for payment method
    if (order.metadata?.payment_method === "cod" || order.metadata?.payment_method === "cash_on_delivery") {
      return true
    }
    
    // Check if payment provider is manual or COD related
    const paymentProvider = order.payment_collections?.[0]?.payments?.[0]?.provider_id
    if (paymentProvider === "pp_system_default" || paymentProvider?.includes("manual")) {
      return true
    }
    
    return false
  }

  const formatPaymentStatus = (status: string) => {
    // If COD order, always show "COD"
    if (isCODOrder()) {
      return "COD"
    }
    
    // Standard payment status formatting
    if (status === "captured") {
      return "Paid"
    }
    if (status === "authorized") {
      return "Authorized"
    }
    const formatted = status.split("_").join(" ")
    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check size={14} className="mr-1" />
            {formatStatus(status)}
          </div>
        )
      case "fulfilled":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock size={14} className="mr-1" />
            {formatStatus(status)}
          </div>
        )
      case "shipped":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Clock size={14} className="mr-1" />
            {formatStatus(status)}
          </div>
        )
      case "partially_fulfilled":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock size={14} className="mr-1" />
            {formatStatus(status)}
          </div>
        )
      case "not_fulfilled":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock size={14} className="mr-1" />
            {formatStatus(status)}
          </div>
        )
      case "canceled":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Clock size={14} className="mr-1" />
            {formatStatus(status)}
          </div>
        )
      default:
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock size={14} className="mr-1" />
            {formatStatus(status)}
          </div>
        )
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    // Check if COD order first
    if (isCODOrder()) {
      return (
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Banknote size={14} className="mr-1" />
          COD
        </div>
      )
    }

    // Standard payment status badges
    switch (status) {
      case "captured":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check size={14} className="mr-1" />
            Paid
          </div>
        )
      case "authorized":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Check size={14} className="mr-1" />
            Authorized
          </div>
        )
      case "awaiting":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={14} className="mr-1" />
            Awaiting
          </div>
        )
      case "pending":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={14} className="mr-1" />
            Pending
          </div>
        )
      default:
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock size={14} className="mr-1" />
            {formatPaymentStatus(status)}
          </div>
        )
    }
  }

  return (
    <div className="p-6 mb-6 overflow-hidden bg-white rounded-lg shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">
        Order Information
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-gray-600">
            We have sent the order confirmation details to{" "}
            <span
              className="font-semibold text-gray-800"
              data-testid="order-email"
            >
              {order.email}
            </span>
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Order date:{" "}
            <span className="font-medium" data-testid="order-date">
              {formatDate(order.created_at)}
            </span>
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Order number:{" "}
            <span
              className="font-medium text-indigo-600"
              data-testid="order-id"
            >
              #{order.display_id}
            </span>
          </p>
        </div>

        {showStatus && (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Order status:</span>
              <div data-testid="order-status">
                {getStatusBadge(order.fulfillment_status || "not_fulfilled")}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment status:</span>
              <div data-testid="order-payment-status">
                {getPaymentStatusBadge(order.payment_status || "awaiting")}
              </div>
            </div>

            {order.status && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="text-sm font-medium text-gray-800">
                  {formatStatus(order.fulfillment_status)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetails