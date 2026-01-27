import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { MapPin, Truck, Calendar, Check, Clock, Package, AlertCircle, ShoppingBag, ExternalLink } from "lucide-react"
import { formatDate } from "@lib/data/date-util"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  // Function to format payment provider name
  const formatPaymentProvider = (providerId: string) => {
    if (!providerId) return "N/A"
    
    if (providerId === "pp_system_default") {
      return "Standard Payment"
    }
    
    const withoutPrefix = providerId.replace(/^pp_/, '')
    const parts = withoutPrefix.split('_')
    const providerName = parts[0]
    
    return providerName.charAt(0).toUpperCase() + providerName.slice(1)
  }

  // Function to get tracking information from fulfillments
  const getTrackingInfo = () => {
    console.log("=== TRACKING DEBUG ===")
    console.log("Order fulfillment_status:", order.fulfillment_status)
    console.log("Order fulfillments:", order.fulfillments)
    
    if (!order.fulfillments || order.fulfillments.length === 0) {
      console.log("No fulfillments found")
      return null
    }

    console.log("Number of fulfillments:", order.fulfillments.length)

    // Loop through all fulfillments to find one with tracking
    for (const fulfillment of order.fulfillments) {
      console.log("Checking fulfillment:", fulfillment.id)
      console.log("Fulfillment labels:", fulfillment.labels)
      
      if (fulfillment.labels && fulfillment.labels.length > 0) {
        const label = fulfillment.labels[0]
        console.log("Found label:", label)
        
        // Check if tracking_number exists and is not empty
        if (label.tracking_number && label.tracking_number.trim() !== '') {
          console.log("Valid tracking found:", label.tracking_number)
          
          return {
            trackingNumber: label.tracking_number,
            trackingUrl: label.tracking_url || label.tracking_number,
            labelUrl: label.label_url,
            fulfillmentId: fulfillment.id,
            shippedAt: fulfillment.shipped_at,
            deliveredAt: fulfillment.delivered_at,
          }
        }
      }
    }

    console.log("No valid tracking information found")
    return null
  }

  const trackingInfo = getTrackingInfo()
  console.log("Final tracking info:", trackingInfo)

  // Function to get a more detailed fulfillment status
  const getDetailedFulfillmentStatus = () => {
    if (order.status === "canceled" || order.payment_status === "refunded") {
      return "canceled"
    }
    
    if (!order.fulfillment_status || order.fulfillment_status === "not_fulfilled") {
      if (order.payment_status === "captured") {
        return "payment_confirmed"
      }
      return "pending"
    } else if (order.fulfillment_status === "delivered") {
      return "delivered"
    } else if (order.fulfillment_status === "shipped") {
      return "shipped"
    } else {
      return "processing"
    }
  }

  const status = getDetailedFulfillmentStatus()

  // Enhanced timeline steps
  const getTimelineSteps = () => {
    if (status === "canceled") {
      return [
        {
          title: "Order Placed",
          description: formatDate(order.created_at),
          status: "completed",
          icon: <Package size={16} />,
        },
        {
          title: "Order Canceled",
          description: order.payment_status === "refunded"
            ? "Payment has been refunded"
            : "Order was canceled",
          status: "canceled",
          icon: <AlertCircle size={16} />,
        },
      ]
    }

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
          ? `Payment captured on ${formatDate(order.payment_collections?.[0]?.payments?.[0]?.captured_at || order.created_at)}`
          : "Waiting for payment confirmation",
        status: order.payment_status === "captured" ? "completed" : "pending",
        icon: <AlertCircle size={16} />,
      },
      {
        title: "Fulfilled",
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
      <div className="px-0 py-3 sm:p-6 md:p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-10 h-10 text-orange-600 bg-orange-100 rounded-full">
              <ShoppingBag size={20} />
            </div>
          </div>
          <h2 className="ml-3 text-lg font-semibold text-gray-800">
            Shipping Information
          </h2>
        </div>

        {/* Tracking Information Banner - Show if tracking available AND order is shipped */}
        {trackingInfo && trackingInfo.trackingNumber && (order.fulfillment_status === "shipped" || order.fulfillment_status === "delivered") && (
          <div className="p-4 mb-6 border-2 border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-10 h-10 text-orange-600 bg-orange-100 rounded-full">
                    <Truck size={20} />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-semibold text-orange-900">
                    Track Your Order
                  </h3>
                  <p className="mt-1 text-xs text-orange-700">
                    Your order has been shipped. Click the link below to track your package.
                  </p>
                  {trackingInfo.shippedAt && (
                    <p className="mt-1 text-xs text-orange-600">
                      Shipped on: {formatDate(trackingInfo.shippedAt)}
                    </p>
                  )}
                  {trackingInfo.deliveredAt && (
                    <p className="mt-1 text-xs text-green-600 font-medium">
                      Delivered on: {formatDate(trackingInfo.deliveredAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Tracking Link */}
            <div className="mt-4">
              <a
                href={trackingInfo.trackingNumber}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Truck size={16} className="mr-2" />
                Track Package
                <ExternalLink size={14} className="ml-2" />
              </a>
            </div>
          </div>
        )}

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
          status === "canceled"
            ? "bg-red-50 border border-red-200"
            : order.payment_status === "captured" && order.fulfillment_status === "not_fulfilled"
            ? "bg-orange-50 border border-orange-200" 
            : order.payment_status === "captured" && order.fulfillment_status === "delivered"
            ? "bg-green-50 border border-green-200"
            : "bg-yellow-50 border border-yellow-200"
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {status === "canceled" && (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              {status !== "canceled" && order.payment_status === "captured" && order.fulfillment_status === "not_fulfilled" && (
                <AlertCircle className="w-5 h-5 text-orange-600" />
              )}
              {status !== "canceled" && order.payment_status === "captured" && order.fulfillment_status === "fulfilled" && (
                <Check className="w-5 h-5 text-green-600" />
              )}
              {status !== "canceled" && order.payment_status !== "captured" && (
                <Clock className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                status === "canceled"
                  ? "text-red-800"
                  : order.payment_status === "captured" && order.fulfillment_status === "not_fulfilled"
                  ? "text-orange-800" 
                  : order.payment_status === "captured" && order.fulfillment_status === "delivered"
                  ? "text-green-800"
                  : "text-yellow-800"
              }`}>
                Order Status
              </h3>
              <div className={`mt-1 text-sm ${
                status === "canceled"
                  ? "text-red-700"
                  : order.payment_status === "captured" && order.fulfillment_status === "delivered"
                  ? "text-green-700" 
                  : order.payment_status === "captured" && order.fulfillment_status === "delivered"
                  ? "text-green-700"
                  : "text-yellow-700"
              }`}>
                {status === "canceled" && (
                  <>
                    This order has been canceled.
                    {order.payment_status === "refunded" && " Your payment has been refunded."}
                  </>
                )}
                {status !== "canceled" && order.payment_status === "captured" && (order.fulfillment_status === "shipped" || order.fulfillment_status === "not_fulfilled") && (
                  "Your payment has been confirmed. We're now preparing your order for shipment."
                )}
                {status !== "canceled" && order.payment_status === "captured" && order.fulfillment_status === "delivered" && (
                  "Your order has been delivered successfully!"
                )}
                {status !== "canceled" && order.payment_status !== "captured" && (
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
            <div className="hidden sm:block absolute top-0 left-1/2 w-0.5 h-full bg-gray-200 transform -translate-x-1/2"></div>

            <div className="space-y-8">
              {timelineSteps.map((step, index) => (
                <div
                  key={index}
                  className="relative flex flex-col items-center sm:flex-row sm:items-center"
                >
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

                  <div
                    className={`z-0 flex items-center justify-center flex-shrink-0 w-8 h-8 mx-auto rounded-full sm:mx-0 ${
                      step.status === "completed"
                        ? "bg-orange-100 border-2 border-orange-600"
                        : step.status === "canceled"
                        ? "bg-red-100 border-2 border-red-600"
                        : "bg-gray-100 border-2 border-gray-300"
                    }`}
                  >
                    {step.status === "completed" ? (
                      <Check size={16} className="text-orange-600" />
                    ) : step.status === "canceled" ? (
                      <AlertCircle size={16} className="text-red-600" />
                    ) : (
                      <span className="text-gray-400">{step.icon}</span>
                    )}
                  </div>

                  <div className="sm:w-1/2 sm:pl-8">
                    <div className="px-4 mt-3 text-center sm:hidden">
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

                  {index !== timelineSteps.length - 1 && (
                    <div className="absolute w-px h-full bg-gray-300 left-1/2 top-8 sm:hidden"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Order Information */}
        <div className="pt-6 mt-8 border-t border-gray-200">
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
                {formatPaymentProvider(order.payment_collections?.[0]?.payments?.[0]?.provider_id || "")}
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