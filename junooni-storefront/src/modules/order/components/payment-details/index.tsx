import { CreditCard } from "lucide-react"
import { paymentInfoMap } from "@lib/constants"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { formatDate } from "@lib/data/date-util"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0]?.payments?.[0]

  if (!payment) {
    return null
  }

  // Determine payment method display name
  const getPaymentMethodName = () => {
    // Check for manual payment first
    if (payment.provider_id === "manual" || 
        payment.provider_id === "pp_system_default" ||
        payment.provider_id.toLowerCase().includes("manual")) {
      return "COD"
    }
    
    // Then check paymentInfoMap
    return paymentInfoMap[payment.provider_id]?.title ||
           payment.provider_id.replace("_", " ").toUpperCase()
  }

  return (
    <div className="mb-6 overflow-hidden bg-white rounded-lg sm:shadow md:shadow">
      <div className="py-3 sm:p-6 md:p-6 sm:px-0">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-10 h-10 text-orange-600 bg-orange-100 rounded-full">
              <CreditCard size={20} />
            </div>
          </div>
          <h2 className="ml-3 text-lg font-semibold text-gray-800">
            Payment Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="mb-3 text-sm font-medium text-gray-700">
              Payment Method
            </h3>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 text-gray-600 bg-gray-200 rounded-md">
                {paymentInfoMap[payment.provider_id]?.icon ||
                  payment.provider_id.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p
                  className="text-sm font-medium text-gray-900"
                  data-testid="payment-method"
                >
                  {getPaymentMethodName()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="mb-3 text-sm font-medium text-gray-700">
              Payment Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount paid:</span>
                <span
                  className="font-medium text-gray-900"
                  data-testid="payment-amount"
                >
                  {convertToLocale({
                    amount: payment.amount,
                    currency_code: order.currency_code,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date:</span>
                <span className="text-gray-900">
                  {formatDate(payment.created_at)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600">
                  {payment.captured_at ? "Paid" : "COD"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {order.billing_address && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium text-gray-700">
              Billing Address
            </h3>
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="text-sm text-gray-600">
                <p>
                  {order.billing_address.first_name}{" "}
                  {order.billing_address.last_name}
                </p>
                <p>{order.billing_address.address_1}</p>
                {order.billing_address.address_2 && (
                  <p>{order.billing_address.address_2}</p>
                )}
                <p>
                  {order.billing_address.city},{" "}
                  {order.billing_address.postal_code}
                </p>
                <p>{order.billing_address.country_code?.toUpperCase()}</p>
                {order.billing_address.phone && (
                  <p className="mt-1">{order.billing_address.phone}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentDetails