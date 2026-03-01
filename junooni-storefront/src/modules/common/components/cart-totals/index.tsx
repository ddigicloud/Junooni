// "use client"

// import { convertToLocale } from "@lib/util/money"
// import React from "react"

// const COD_FEE = 35 // ₹35 in paise

// type CartTotalsProps = {
//   totals: {
//     total?: number | null
//     subtotal?: number | null
//     tax_total?: number | null
//     shipping_total?: number | null
//     discount_total?: number | null
//     gift_card_total?: number | null
//     currency_code: string
//     shipping_subtotal?: number | null
//   }
//     selectedPaymentMethod?: string // ← add
// }

// const CartTotals: React.FC<CartTotalsProps> = ({ totals, selectedPaymentMethod }) => {
//   console.log("CartTotals selectedPaymentMethod:", selectedPaymentMethod) // ← add this
//   const isCOD = selectedPaymentMethod === "pp_system_default"
//   console.log("isCOD:", isCOD) // ← add this
//   const codFee = isCOD ? COD_FEE : 0
  
//   const {
//     currency_code,
//     total,
//     subtotal,
//     tax_total,
//     discount_total,
//     discount_subtotal,
//     gift_card_total,
//     shipping_subtotal,
//   } = totals
//   console.log("Cart Totals:", totals)
  
//   return (
//     <div>
//       <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
//         <div className="flex items-center justify-between">
//           <span className="flex items-center gap-x-1">
//             Subtotal (excl. shipping and taxes)
//           </span>
//           <span data-testid="cart-subtotal" data-value={subtotal || 0}>
//             {convertToLocale({ amount: (subtotal ?? 0) - (shipping_subtotal ?? 0), currency_code })}
//           </span>
//         </div>
//         {!!discount_subtotal && (
//           <div className="flex items-center justify-between">
//             <span>Discount</span>
//             <span
//               className="text-ui-fg-interactive"
//               data-testid="cart-discount"
//               data-value={discount_subtotal || 0}
//             >
//               -{" "}
//               {convertToLocale({ amount: discount_subtotal ?? 0, currency_code })}
//             </span>
//           </div>
//         )}
//         <div className="flex items-center justify-between">
//           <span>Shipping</span>
//           <span data-testid="cart-shipping" data-value={shipping_subtotal || 0}>
//             {convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })}
//           </span>
//         </div>
//         <div className="flex justify-between">
//           <span className="flex items-center gap-x-1 ">Taxes</span>
//           <span data-testid="cart-taxes" data-value={tax_total || 0}>
//             {convertToLocale({ amount: tax_total ?? 0, currency_code })}
//           </span>
//         </div>

//          {/* ← NEW COD fee row */}
//         {isCOD && (
//           <div className="flex items-center justify-between">
//             <span className="flex items-center gap-x-1">
//               COD Charges
//               <span className="text-xs text-gray-400">(Cash on Delivery)</span>
//             </span>
//             <span data-testid="cart-cod-fee">
//               {convertToLocale({ amount: COD_FEE, currency_code })}
//             </span>
//           </div>
//         )}
        
//         {!!gift_card_total && (
//           <div className="flex items-center justify-between">
//             <span>Gift card</span>
//             <span
//               className="text-ui-fg-interactive"
//               data-testid="cart-gift-card-amount"
//               data-value={gift_card_total || 0}
//             >
//               -{" "}
//               {convertToLocale({ amount: gift_card_total ?? 0, currency_code })}
//             </span>
//           </div>
//         )}
//       </div>
//       <div className="w-full h-px my-4 border-b border-gray-200" />
//        <div className="flex items-center justify-between mb-2 text-ui-fg-base txt-medium">
//         <span>Total</span>
//         {/* ← add codFee to total */}
//         <span className="txt-xlarge-plus" data-testid="cart-total" data-value={(total ?? 0) + codFee}>
//           {convertToLocale({ amount: (total ?? 0) + codFee, currency_code })}
//         </span>
//       </div>
//       <div className="w-full h-px mt-4 border-b border-gray-200" />
//     </div>
//   )
// }

// export default CartTotals

"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    shipping_total?: number | null
    discount_total?: number | null
    gift_card_total?: number | null
    currency_code: string
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
    items?: any[]
  }
  selectedPaymentMethod?: string
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals, selectedPaymentMethod }) => {
  const isCOD = selectedPaymentMethod === "pp_system_default"

  const {
    currency_code,
    total,
    subtotal,
    tax_total,
    discount_subtotal,
    gift_card_total,
    shipping_subtotal,
    items,
  } = totals

  // Read COD fee from actual cart line item added by backend
  const codFeeItem = items?.find((item: any) => item.metadata?.is_cod_fee === true)
  const codFeeAmount = codFeeItem?.unit_price ?? 0

  // Exclude COD fee from subtotal display
  const displaySubtotal = (subtotal ?? 0) - (shipping_subtotal ?? 0) - codFeeAmount

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-x-1">
            Subtotal (excl. shipping and taxes)
          </span>
          <span data-testid="cart-subtotal" data-value={subtotal || 0}>
            {convertToLocale({ amount: displaySubtotal, currency_code })}
          </span>
        </div>

        {!!discount_subtotal && (
          <div className="flex items-center justify-between">
            <span>Discount</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-discount"
              data-value={discount_subtotal || 0}
            >
              - {convertToLocale({ amount: discount_subtotal ?? 0, currency_code })}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span data-testid="cart-shipping" data-value={shipping_subtotal || 0}>
            {convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="flex items-center gap-x-1">Taxes</span>
          <span data-testid="cart-taxes" data-value={tax_total || 0}>
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>

        {/* COD fee row — only shown when COD selected AND line item exists in cart */}
        {codFeeAmount > 0 && (
          <div className="flex items-center justify-between text-grey-700">
            <span className="flex items-center gap-x-1">
              COD Charges
              {/* <span className="text-xs text-gray-400">(Cash on Delivery)</span> */}
            </span>
            <span data-testid="cart-cod-fee">
              {convertToLocale({ amount: codFeeAmount, currency_code })}
            </span>
          </div>
        )}

        {!!gift_card_total && (
          <div className="flex items-center justify-between">
            <span>Gift card</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-gift-card-amount"
              data-value={gift_card_total || 0}
            >
              - {convertToLocale({ amount: gift_card_total ?? 0, currency_code })}
            </span>
          </div>
        )}
      </div>

      <div className="w-full h-px my-4 border-b border-gray-200" />

      <div className="flex items-center justify-between mb-2 text-ui-fg-base txt-medium">
        <span>Total</span>
        {/* Total already includes COD fee since it's a real line item in cart */}
        <span
          className="txt-xlarge-plus"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>

      <div className="w-full h-px mt-4 border-b border-gray-200" />
    </div>
  )
}

export default CartTotals