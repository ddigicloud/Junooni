"use client" // ← add this if not already there

import { Heading } from "@medusajs/ui"
import { useCheckout } from "@modules/checkout/context/checkout-context" // ← add
import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import LoyaltyPoints from "../../components/loyalty-points"

const CheckoutSummary = ({ cart }: { cart: any }) => {
   const { selectedPaymentMethod } = useCheckout() // ← add
   console.log("CheckoutSummary selectedPaymentMethod:", selectedPaymentMethod) // ← add this
  return (
    <div className="sticky top-0 flex flex-col-reverse py-8 small:flex-col gap-y-8 small:py-0 ">
      <div className="flex flex-col w-full p-8 bg-white">
        <Divider className="my-6 small:hidden" />
        <Heading
          level="h2"
          className="flex flex-row items-baseline text-3xl-regular"
        >
          In your Cart
        </Heading>
        <Divider className="my-6" />
        <CartTotals totals={cart} selectedPaymentMethod={selectedPaymentMethod} /> 
        <ItemsPreviewTemplate cart={cart} />
        <div className="my-6">
          <DiscountCode cart={cart} />
          <LoyaltyPoints cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary