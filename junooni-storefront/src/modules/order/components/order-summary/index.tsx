import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Package } from "lucide-react"

type OrderSummaryProps = {
  order: HttpTypes.StoreOrder
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const getAmount = (amount?: number | null) => {
    if (!amount) {
      return
    }
    return convertToLocale({
      amount,
      currency_code: order.currency_code,
    })
  }

  return (
    <div className="mb-6 overflow-hidden bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-10 h-10 text-orange-600 bg-orange-100 rounded-full">
              <Package size={20} />
            </div>
          </div>
          <h2 className="ml-3 text-lg font-semibold text-gray-800">
            Order Summary
          </h2>
        </div>

        <div className="p-4 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-3 text-sm font-medium text-gray-700">
            <span>Subtotal</span>
            <span>{getAmount(order.subtotal)}</span>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            {order.discount_total > 0 && (
              <div className="flex items-center justify-between">
                <span>Discount</span>
                <span className="text-green-600">
                  - {getAmount(order.discount_total)}
                </span>
              </div>
            )}

            {order.gift_card_total > 0 && (
              <div className="flex items-center justify-between">
                <span>Gift Card</span>
                <span className="text-green-600">
                  - {getAmount(order.gift_card_total)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{getAmount(order.shipping_total)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Taxes</span>
              <span>{getAmount(order.tax_total)}</span>
            </div>
          </div>

          <div className="w-full h-px my-3 border-b border-gray-200 border-dashed"></div>

          <div className="flex items-center justify-between text-base font-medium text-gray-900">
            <span>Total</span>
            <span>{getAmount(order.total)}</span>
          </div>
        </div>

        {order.payments?.length > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>Payment method</span>
            <span className="font-medium">
              {order.payments[0].provider_id.replace("_", " ").toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderSummary
