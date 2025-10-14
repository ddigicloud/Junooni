// import { clx } from "@medusajs/ui"

// import { getProductPrice } from "@lib/util/get-product-price"
// import { HttpTypes } from "@medusajs/types"

// export default function ProductPrice({
//   product,
//   variant,
// }: {
//   product: HttpTypes.StoreProduct
//   variant?: HttpTypes.StoreProductVariant
// }) {
//   const { cheapestPrice, variantPrice } = getProductPrice({
//     product,
//     variantId: variant?.id,
//   })

//   const selectedPrice = variant ? variantPrice : cheapestPrice

//   // if (!selectedPrice) {
//   //   return <div className="block w-32 bg-gray-100 h-9 animate-pulse" />
//   // }
//   if (!selectedPrice || selectedPrice.calculated_price_number <= 0) {
//     return (
//       <div className="flex flex-col text-ui-fg-base">
//          <span
//           className="text-xl-semi"
//           style={{ color: "#e65100" }} // Setting the color to #e65100
//         >
//           Free
//         </span>
//       </div>
//     )
//   }

//   return (
//     <div className="flex flex-col text-ui-fg-base">
//       <span
//         className={clx("text-xl-semi", {
//           "text-ui-fg-interactive": selectedPrice.price_type === "sale",
//         })}
//       >
//         {!variant && "From "}
//         <span
//           data-testid="product-price"
//           data-value={selectedPrice.calculated_price_number}
//         >
//           {selectedPrice.calculated_price}
//         </span>
//       </span>
//       {selectedPrice.price_type === "sale" && (
//         <>
//           <p>
//             <span className="text-ui-fg-subtle">Original: </span>
//             <span
//               className="line-through"
//               data-testid="original-product-price"
//               data-value={selectedPrice.original_price_number}
//             >
//               {selectedPrice.original_price}
//             </span>
//           </p>
//           <span className="text-ui-fg-interactive">
//             -{selectedPrice.percentage_diff}%
//           </span>
//         </>
//       )}
//     </div>
//   )
// }


import { clx } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  // Show loading state if price is not available
  if (!selectedPrice) {
    return <div className="block w-32 bg-gray-100 h-9 animate-pulse" />
  }

  // Only show "Free" if price is explicitly 0
  if (selectedPrice.calculated_price_number === 0) {
    return (
      <div className="flex flex-col text-ui-fg-base">
        <span
          className="text-xl-semi"
          style={{ color: "#e65100" }}
        >
          Free
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col text-ui-fg-base">
      <span
        className={clx("text-xl-semi", {
          "text-ui-fg-interactive": selectedPrice.price_type === "sale",
        })}
      >
        {!variant && "From "}
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
      </span>
      {selectedPrice.price_type === "sale" && (
        <>
          <p>
            <span className="text-ui-fg-subtle">Original: </span>
            <span
              className="line-through"
              data-testid="original-product-price"
              data-value={selectedPrice.original_price_number}
            >
              {selectedPrice.original_price}
            </span>
          </p>
          <span className="text-ui-fg-interactive">
            -{selectedPrice.percentage_diff}%
          </span>
        </>
      )}
    </div>
  )
}