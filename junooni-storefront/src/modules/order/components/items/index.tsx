// import repeat from "@lib/util/repeat"
// import { HttpTypes } from "@medusajs/types"
// import { Table } from "@medusajs/ui"

// import Divider from "@modules/common/components/divider"
// import Item from "@modules/order/components/item"
// import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

// type ItemsProps = {
//   order: HttpTypes.StoreOrder
// }

// const Items = ({ order }: ItemsProps) => {
//   const items = order.items

//   return (
//     <div className="flex flex-col">
//       <Divider className="!mb-0" />
//       <Table>
//         <Table.Body data-testid="products-table">
//           {items?.length
//             ? items
//                 .sort((a, b) => {
//                   return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
//                 })
//                 .map((item) => {
//                   return (
//                     <Item
//                       key={item.id}
//                       item={item}
//                       currencyCode={order.currency_code}
//                     />
//                   )
//                 })
//             : repeat(5).map((i) => {
//                 return <SkeletonLineItem key={i} />
//               })}
//         </Table.Body>
//       </Table>
//     </div>
//   )
// }

// export default Items

// import repeat from "@lib/util/repeat"
// import { HttpTypes } from "@medusajs/types"
// import { Table } from "@medusajs/ui"

// import Divider from "@modules/common/components/divider"
// import Item from "@modules/order/components/item"
// import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

// type ItemsProps = {
//   order: HttpTypes.StoreOrder
// }

// const Items = ({ order }: ItemsProps) => {
//   const items = order.items

//   return (
//     <div className="flex flex-col">
//       <Divider className="!mb-0" />
//       <Table>
//         <Table.Body data-testid="products-table">
//           {items?.length
//             ? items
//                 .sort((a, b) => {
//                   return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
//                 })
//                 .map((item) => {
//                   return (
//                     <Item
//                       key={item.id}
//                       item={item}
//                       currencyCode={order.currency_code}
//                     />
//                   )
//                 })
//             : repeat(5).map((i) => {
//                 return <SkeletonLineItem key={i} />
//               })}
//         </Table.Body>
//       </Table>
//     </div>
//   )
// }

// export default Items

import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import { ShoppingBag } from "lucide-react"

type ItemsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const Items = ({order, showStatus = false }: ItemsProps) => {
  const getAmount = (amount?: number) => {
    if (!amount) {
      return "0"
    }

    return convertToLocale({
      amount,
      currency_code: order.currency_code,
    })
  }

  const items = order.items || []

  // Helper function to get the correct variant image
  const getItemImage = (item: HttpTypes.StoreOrderLineItem) => {
    // First priority: Check variant metadata for variant_images
    if (item.variant?.metadata?.variant_images) {
      try {
        const variantImages = JSON.parse(item.variant.metadata.variant_images as string)
        if (Array.isArray(variantImages) && variantImages.length > 0) {
          return variantImages[0]
        }
      } catch (e) {
        // Silently fail and continue to next fallback
      }
    }

    // Second priority: Check variant metadata for color_images
    if (item.variant?.metadata?.color_images) {
      try {
        const colorImages = JSON.parse(item.variant.metadata.color_images as string)
        if (Array.isArray(colorImages) && colorImages.length > 0) {
          const colorImage = colorImages[0]?.url
          if (colorImage) {
            return colorImage
          }
        }
      } catch (e) {
        // Silently fail and continue to next fallback
      }
    }

    // Third priority: Check variant metadata for option_images
    if (item.variant?.metadata?.option_images) {
      try {
        const optionImages = JSON.parse(item.variant.metadata.option_images as string)
        if (Array.isArray(optionImages) && optionImages.length > 0) {
          const optionImage = optionImages[0]?.url
          if (optionImage) {
            return optionImage
          }
        }
      } catch (e) {
        // Silently fail and continue to next fallback
      }
    }

    // Fourth priority: line item thumbnail
    if (item.thumbnail) {
      return item.thumbnail
    }

    // Fifth priority: variant thumbnail (if it exists)
    const variantThumbnail = (item.variant as any)?.thumbnail
    if (variantThumbnail) {
      return variantThumbnail
    }

    // Last priority: product thumbnail
    if (item.product?.thumbnail) {
      return item.product.thumbnail
    }

    return null
  }

  return (
    <div className="mb-6 overflow-hidden bg-white rounded-lg sm:shadow md:shadow">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-10 h-10 text-orange-600 bg-orange-100 rounded-full">
              <ShoppingBag size={20} />
            </div>
          </div>
          <h2 className="ml-3 text-lg font-semibold text-gray-800">
            Order Items
          </h2>
        </div>

        <div className="space-y-4">
          {items.map((item) => {
            const itemImage = getItemImage(item)
            
            return (
              <div
                key={item.id}
                className="flex flex-col pb-4 border-b border-gray-200 sm:flex-row last:border-b-0 last:pb-0"
              >
                <div className="mb-4 sm:flex-shrink-0 sm:mb-0">
                  <div className="w-20 h-20 overflow-hidden bg-gray-200 rounded-md">
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={item.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-500">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 sm:ml-6">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">
                        {item.product_title}
                      </h3>
                      {item.variant?.options?.length && item.product?.options?.length ? (
                        <p className="mt-1 text-sm text-gray-500">
                          {item.variant.options
                            .map((opt) => {
                              const title =
                                item.product?.options?.find((o) => o.id === opt.option_id)?.title || "Option"
                              return `${title}: ${opt.value}`
                            })
                            .join(" / ")}
                        </p>
                      ) : item.variant?.title && item.variant.title !== "Default Variant" ? (
                        <p className="mt-1 text-sm text-gray-500">{item.variant.title}</p>
                      ) : null}

                      <p className="mt-1 text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-medium text-gray-900">
                        {getAmount(item.total)}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {getAmount(item.unit_price)} each
                      </p>
                    </div>
                  </div>

                  {showStatus && item.fulfillment_status && (
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${
                          item.fulfillment_status === "fulfilled"
                            ? "bg-green-100 text-green-800"
                            : item.fulfillment_status === "partially_fulfilled"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.fulfillment_status.replace("_", " ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Items