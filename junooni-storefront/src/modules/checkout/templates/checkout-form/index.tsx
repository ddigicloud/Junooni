import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"
import StepIndicator from "@modules/checkout/components/step-indicator"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  // ✅ Don't let shipping failure kill the whole form
  const [shippingMethods, paymentMethods] = await Promise.allSettled([
    listCartShippingMethods(cart.id),
    listCartPaymentMethods(cart.region?.id ?? ""),
  ])

  const resolvedShipping =
    shippingMethods.status === "fulfilled" ? shippingMethods.value : []
  const resolvedPayment =
    paymentMethods.status === "fulfilled" ? paymentMethods.value : []

  return (
    <div className="space-y-6">
      <StepIndicator cart={cart} />
      <div className="space-y-6">
        <Addresses cart={cart} customer={customer} />
        <Shipping cart={cart} availableShippingMethods={resolvedShipping} />
        <Payment cart={cart} availablePaymentMethods={resolvedPayment} />
        <Review cart={cart} />
      </div>
    </div>
  )
}