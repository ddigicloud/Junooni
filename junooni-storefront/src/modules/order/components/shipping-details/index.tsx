// import { convertToLocale } from "@lib/util/money"
// import { HttpTypes } from "@medusajs/types"
// import { MapPin, Truck, Calendar, Check, Clock } from "lucide-react"
// import { formatDate } from "@lib/data/date-util"

// type ShippingDetailsProps = {
//   order: HttpTypes.StoreOrder
// }

// const ShippingDetails = ({ order }: ShippingDetailsProps) => {
//   // Timeline steps for order tracking - this would ideally come from your backend
//   const getFulfillmentStatus = ():
//     | "pending"
//     | "processing"
//     | "shipped"
//     | "delivered" => {
//     if (
//       !order.fulfillment_status ||
//       order.fulfillment_status === "not_fulfilled"
//     ) {
//       return "pending"
//     } else if (order.fulfillment_status === "fulfilled") {
//       return "delivered"
//     } else if (order.fulfillment_status === "partially_fulfilled") {
//       return "shipped"
//     } else {
//       return "processing"
//     }
//   }

//   const status = getFulfillmentStatus()

//   const timelineSteps = [
//     {
//       title: "Order Placed",
//       description: formatDate(order.created_at),
//       status: "completed",
//     },
//     {
//       title: "Processing",
//       description: formatDate(order.updated_at || order.created_at),
//       status: status === "pending" ? "pending" : "completed",
//     },
//     {
//       title: "Shipped",
//       description: "Estimated 1-2 days after processing",
//       status:
//         status === "pending" || status === "processing"
//           ? "pending"
//           : "completed",
//     },
//     {
//       title: "Delivered",
//       description: "Typically 3-5 business days",
//       status: status === "delivered" ? "completed" : "pending",
//     },
//   ]

//   return (
//     <div className="mb-6 overflow-hidden bg-white rounded-lg shadow">
//       <div className="p-6">
//         <h2 className="mb-4 text-lg font-semibold text-gray-800">
//           Shipping Information
//         </h2>

//         <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//           {/* Shipping Address */}
//           <div className="p-4 rounded-lg bg-gray-50">
//             <div className="flex items-start">
//               <div className="flex-shrink-0">
//                 <div className="flex items-center justify-center w-10 h-10 text-orange-600 bg-orange-100 rounded-full">
//                   <MapPin size={20} />
//                 </div>
//               </div>
//               <div className="ml-4" data-testid="shipping-address-summary">
//                 <h3 className="text-sm font-medium text-gray-700">
//                   Shipping Address
//                 </h3>
//                 <div className="mt-2 text-sm text-gray-600">
//                   <p>
//                     {order.shipping_address?.first_name}{" "}
//                     {order.shipping_address?.last_name}
//                   </p>
//                   <p>{order.shipping_address?.address_1}</p>
//                   {order.shipping_address?.address_2 && (
//                     <p>{order.shipping_address?.address_2}</p>
//                   )}
//                   <p>
//                     {order.shipping_address?.postal_code},{" "}
//                     {order.shipping_address?.city}
//                   </p>
//                   <p>{order.shipping_address?.country_code?.toUpperCase()}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Contact Info */}
//           <div className="p-4 rounded-lg bg-gray-50">
//             <div className="flex items-start">
//               <div className="flex-shrink-0">
//                 <div className="flex items-center justify-center w-10 h-10 text-orange-600 bg-orange-100 rounded-full">
//                   <MapPin size={20} />
//                 </div>
//               </div>
//               <div className="ml-4" data-testid="shipping-contact-summary">
//                 <h3 className="text-sm font-medium text-gray-700">
//                   Contact Information
//                 </h3>
//                 <div className="mt-2 text-sm text-gray-600">
//                   <p>
//                     <span className="font-medium">Email:</span> {order.email}
//                   </p>
//                   {order.shipping_address?.phone && (
//                     <p>
//                       <span className="font-medium">Phone:</span>{" "}
//                       {order.shipping_address?.phone}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Shipping Method */}
//           <div className="p-4 rounded-lg bg-gray-50">
//             <div className="flex items-start">
//               <div className="flex-shrink-0">
//                 <div className="flex items-center justify-center w-10 h-10 text-orange-600 bg-orange-100 rounded-full">
//                   <Truck size={20} />
//                 </div>
//               </div>
//               <div className="ml-4" data-testid="shipping-method-summary">
//                 <h3 className="text-sm font-medium text-gray-700">
//                   Shipping Method
//                 </h3>
//                 <div className="mt-2 text-sm text-gray-600">
//                   <p>
//                     {order.shipping_methods?.[0]?.shipping_option?.name ||
//                       "Standard Shipping"}{" "}
//                     (
//                     {convertToLocale({
//                       amount: order.shipping_methods?.[0]?.price ?? 0,
//                       currency_code: order.currency_code,
//                     })}
//                     )
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Order Tracking */}
//         <div className="mt-8">
//           <h3 className="mb-4 text-sm font-medium text-gray-700">
//             Order Tracking
//           </h3>

//           <div className="relative">
//             {/* Timeline */}
//             <div className="hidden sm:block absolute top-0 left-1/2 w-0.5 h-full bg-gray-200 transform -translate-x-1/2"></div>

//             {/* Steps */}
//             <div className="space-y-8">
//               {timelineSteps.map((step, index) => (
//                 <div key={index} className="relative flex items-center">
//                   <div className="justify-end hidden w-1/2 pr-8 sm:flex">
//                     <div className="text-right">
//                       <h3 className="text-sm font-medium text-gray-900">
//                         {step.title}
//                       </h3>
//                       <p className="text-xs text-gray-500">
//                         {step.description}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="z-10 flex items-center justify-center flex-shrink-0 w-8 h-8 mx-auto bg-white border-2 border-orange-600 rounded-full sm:mx-0">
//                     {step.status === "completed" ? (
//                       <Check size={16} className="text-orange-600" />
//                     ) : (
//                       <Clock size={16} className="text-gray-400" />
//                     )}
//                   </div>

//                   <div className="sm:w-1/2 sm:pl-8">
//                     <div className="sm:hidden">
//                       <h3 className="text-sm font-medium text-gray-900">
//                         {step.title}
//                       </h3>
//                       <p className="text-xs text-gray-500">
//                         {step.description}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ShippingDetails

import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { MapPin, Truck, Calendar, Check, Clock, Package, AlertCircle } from "lucide-react"
import { formatDate } from "@lib/data/date-util"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  // Function to get a more detailed fulfillment status with additional information
  const getDetailedFulfillmentStatus = () => {
    if (!order.fulfillment_status || order.fulfillment_status === "not_fulfilled") {
      // Check payment status to provide more context
      if (order.payment_status === "captured") {
        return "payment_confirmed"
      }
      return "pending"
    } else if (order.fulfillment_status === "fulfilled") {
      return "delivered"
    } else if (order.fulfillment_status === "partially_fulfilled") {
      return "shipped"
    } else {
      return "processing"
    }
  }

  const status = getDetailedFulfillmentStatus()

  // Enhanced timeline steps with dynamic updates based on actual API data
  const getTimelineSteps = () => {
    const steps = [
      {
        title: "Order Placed",
        description: formatDate(order.created_at),
        status: "completed",
        icon: <Package size={16} />,
      },
      {
        title: "Payment Confirmed",
        description: order.payment_status === "captured" 
          ? `Payment captured on ${formatDate(order.payment_collections?.[0]?.captured_at || order.created_at)}`
          : "Waiting for payment confirmation",
        status: order.payment_status === "captured" ? "completed" : "pending",
        icon: <AlertCircle size={16} />,
      },
      {
        title: "Processing",
        description: status !== "pending" 
          ? `Started processing at ${formatDate(order.updated_at || order.created_at)}`
          : "Order will be processed after payment",
        status: status === "pending" ? "pending" : "completed",
        icon: <Clock size={16} />,
      },
      {
        title: "Shipped",
        description: status === "shipped" || status === "delivered"
          ? `Shipped via ${order.shipping_methods?.[0]?.name || "Standard Shipping"}`
          : "Awaiting shipment",
        status: status === "shipped" || status === "delivered" ? "completed" : "pending",
        icon: <Truck size={16} />,
      },
      {
        title: "Delivered",
        description: status === "delivered" 
          ? `Delivered to ${order.shipping_address?.first_name} ${order.shipping_address?.last_name}`
          : "Estimated delivery date TBD",
        status: status === "delivered" ? "completed" : "pending",
        icon: <Check size={16} />,
      },
    ]

    return steps
  }

  const timelineSteps = getTimelineSteps()

  return (
    <div className="mb-6 overflow-hidden bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Shipping Information
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Shipping Address */}
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 text-orange-600 bg-orange-100 rounded-full">
                  <MapPin size={20} />
                </div>
              </div>
              <div className="ml-4" data-testid="shipping-address-summary">
                <h3 className="text-sm font-medium text-gray-700">
                  Shipping Address
                </h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-medium">
                    {order.shipping_address?.first_name}{" "}
                    {order.shipping_address?.last_name}
                  </p>
                  {order.shipping_address?.company && (
                    <p>{order.shipping_address?.company}</p>
                  )}
                  <p>{order.shipping_address?.address_1}</p>
                  {order.shipping_address?.address_2 && (
                    <p>{order.shipping_address?.address_2}</p>
                  )}
                  <p>
                    {order.shipping_address?.postal_code},{" "}
                    {order.shipping_address?.city}
                  </p>
                  <p>
                    {order.shipping_address?.province && `${order.shipping_address?.province}, `}
                    {order.shipping_address?.country_code?.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 text-orange-600 bg-orange-100 rounded-full">
                  <MapPin size={20} />
                </div>
              </div>
              <div className="ml-4" data-testid="shipping-contact-summary">
                <h3 className="text-sm font-medium text-gray-700">
                  Contact Information
                </h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Email:</span> {order.email}
                  </p>
                  {order.shipping_address?.phone && (
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {order.shipping_address?.phone}
                    </p>
                  )}
                  {/* Add customer information if available */}
                  {(order.customer?.first_name || order.customer?.last_name) && (
                    <p>
                      <span className="font-medium">Customer:</span>{" "}
                      {order.customer?.first_name} {order.customer?.last_name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Method */}
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 text-orange-600 bg-orange-100 rounded-full">
                  <Truck size={20} />
                </div>
              </div>
              <div className="ml-4" data-testid="shipping-method-summary">
                <h3 className="text-sm font-medium text-gray-700">
                  Shipping Method
                </h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-medium">
                    {order.shipping_methods?.[0]?.name || "Standard Shipping"}
                  </p>
                  <p>
                    Cost: {convertToLocale({
                      amount: order.shipping_methods?.[0]?.amount ?? 0,
                      currency_code: order.currency_code,
                    })}
                  </p>
                  {order.shipping_methods?.[0]?.description && (
                    <p className="mt-1 text-xs text-gray-500">
                      {order.shipping_methods?.[0]?.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Banner */}
        <div className={`mt-6 p-4 rounded-lg ${
          order.payment_status === "captured" && order.fulfillment_status === "not_fulfilled"
            ? "bg-blue-50 border border-blue-200" 
            : order.payment_status === "captured" && order.fulfillment_status === "fulfilled"
            ? "bg-green-50 border border-green-200"
            : "bg-yellow-50 border border-yellow-200"
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {order.payment_status === "captured" && order.fulfillment_status === "not_fulfilled" && (
                <AlertCircle className="w-5 h-5 text-blue-600" />
              )}
              {order.payment_status === "captured" && order.fulfillment_status === "fulfilled" && (
                <Check className="w-5 h-5 text-green-600" />
              )}
              {order.payment_status !== "captured" && (
                <Clock className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                order.payment_status === "captured" && order.fulfillment_status === "not_fulfilled"
                  ? "text-blue-800" 
                  : order.payment_status === "captured" && order.fulfillment_status === "fulfilled"
                  ? "text-green-800"
                  : "text-yellow-800"
              }`}>
                Order Status
              </h3>
              <div className={`mt-1 text-sm ${
                order.payment_status === "captured" && order.fulfillment_status === "not_fulfilled"
                  ? "text-blue-700" 
                  : order.payment_status === "captured" && order.fulfillment_status === "fulfilled"
                  ? "text-green-700"
                  : "text-yellow-700"
              }`}>
                {order.payment_status === "captured" && order.fulfillment_status === "not_fulfilled" && (
                  "Your payment has been confirmed. We're now preparing your order for shipment."
                )}
                {order.payment_status === "captured" && order.fulfillment_status === "fulfilled" && (
                  "Your order has been delivered successfully!"
                )}
                {order.payment_status !== "captured" && (
                  "We're waiting for payment confirmation."
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Tracking Timeline */}
        <div className="mt-8">
          <h3 className="mb-4 text-sm font-medium text-gray-700">
            Order Tracking
          </h3>

          <div className="relative">
            {/* Timeline */}
            <div className="hidden sm:block absolute top-0 left-1/2 w-0.5 h-full bg-gray-200 transform -translate-x-1/2"></div>

            {/* Steps */}
            <div className="space-y-8">
              {timelineSteps.map((step, index) => (
                <div key={index} className="relative flex items-center">
                  <div className="justify-end hidden w-1/2 pr-8 sm:flex">
                    <div className="text-right">
                      <h3 className={`text-sm font-medium ${
                        step.status === "completed" ? "text-gray-900" : "text-gray-500"
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-xs ${
                        step.status === "completed" ? "text-gray-600" : "text-gray-400"
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className={`z-10 flex items-center justify-center flex-shrink-0 w-8 h-8 mx-auto rounded-full sm:mx-0 ${
                    step.status === "completed" 
                      ? "bg-orange-100 border-2 border-orange-600" 
                      : "bg-gray-100 border-2 border-gray-300"
                  }`}>
                    {step.status === "completed" ? (
                      <Check size={16} className="text-orange-600" />
                    ) : (
                      <span className="text-gray-400">{step.icon}</span>
                    )}
                  </div>

                  <div className="sm:w-1/2 sm:pl-8">
                    <div className="sm:hidden">
                      <h3 className={`text-sm font-medium ${
                        step.status === "completed" ? "text-gray-900" : "text-gray-500"
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-xs ${
                        step.status === "completed" ? "text-gray-600" : "text-gray-400"
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Order Information */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Order ID</h4>
              <p className="mt-1 text-sm text-gray-600">#{order.display_id || order.id}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Order Date</h4>
              <p className="mt-1 text-sm text-gray-600">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Payment Method</h4>
              <p className="mt-1 text-sm text-gray-600">
                {order.payment_collections?.[0]?.payments?.[0]?.provider_id === "pp_system_default" 
                  ? "Standard Payment"
                  : order.payment_collections?.[0]?.payments?.[0]?.provider_id || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Total Amount</h4>
              <p className="mt-1 text-sm text-gray-600">
                {convertToLocale({
                  amount: order.total ?? 0,
                  currency_code: order.currency_code,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShippingDetails