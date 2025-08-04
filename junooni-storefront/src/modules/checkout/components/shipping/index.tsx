// "use client"

// import { RadioGroup, Radio } from "@headlessui/react"
// import { setShippingMethod } from "@lib/data/cart"
// import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
// import { convertToLocale } from "@lib/util/money"
// import { CheckCircleSolid, Loader } from "@medusajs/icons"
// import { HttpTypes } from "@medusajs/types"
// import { Button, Heading, Text, clx } from "@medusajs/ui"
// import ErrorMessage from "@modules/checkout/components/error-message"
// import Divider from "@modules/common/components/divider"
// import MedusaRadio from "@modules/common/components/radio"
// import { usePathname, useRouter, useSearchParams } from "next/navigation"
// import { useEffect, useState } from "react"

// const PICKUP_OPTION_ON = "__PICKUP_ON"
// const PICKUP_OPTION_OFF = "__PICKUP_OFF"

// type ShippingProps = {
//   cart: HttpTypes.StoreCart
//   availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
// }

// function formatAddress(address) {
//   if (!address) {
//     return ""
//   }

//   let ret = ""

//   if (address.address_1) {
//     ret += ` ${address.address_1}`
//   }

//   if (address.address_2) {
//     ret += `, ${address.address_2}`
//   }

//   if (address.postal_code) {
//     ret += `, ${address.postal_code} ${address.city}`
//   }

//   if (address.country_code) {
//     ret += `, ${address.country_code.toUpperCase()}`
//   }

//   return ret
// }

// const Shipping: React.FC<ShippingProps> = ({
//   cart,
//   availableShippingMethods,
// }) => {
//   const [isLoading, setIsLoading] = useState(false)
//   const [isLoadingPrices, setIsLoadingPrices] = useState(true)

//   const [showPickupOptions, setShowPickupOptions] =
//     useState<string>(PICKUP_OPTION_OFF)
//   const [calculatedPricesMap, setCalculatedPricesMap] = useState<
//     Record<string, number>
//   >({})
//   const [error, setError] = useState<string | null>(null)
//   const [shippingMethodId, setShippingMethodId] = useState<string | null>(
//     cart.shipping_methods?.at(-1)?.shipping_option_id || null
//   )

//   const searchParams = useSearchParams()
//   const router = useRouter()
//   const pathname = usePathname()

//   const isOpen = searchParams.get("step") === "delivery"

//   const _shippingMethods = availableShippingMethods?.filter(
//     (sm) => sm.service_zone?.fulfillment_set?.type !== "pickup"
//   )

//   const _pickupMethods = availableShippingMethods?.filter(
//     (sm) => sm.service_zone?.fulfillment_set?.type === "pickup"
//   )

//   const hasPickupOptions = !!_pickupMethods?.length

//   useEffect(() => {
//     setIsLoadingPrices(true)

//     if (_shippingMethods?.length) {
//       const promises = _shippingMethods
//         .filter((sm) => sm.price_type === "calculated")
//         .map((sm) => calculatePriceForShippingOption(sm.id, cart.id))

//       if (promises.length) {
//         Promise.allSettled(promises).then((res) => {
//           const pricesMap: Record<string, number> = {}
//           res
//             .filter((r) => r.status === "fulfilled")
//             .forEach((p) => (pricesMap[p.value?.id || ""] = p.value?.amount!))

//           setCalculatedPricesMap(pricesMap)
//           setIsLoadingPrices(false)
//         })
//       }
//     }

//     if (_pickupMethods?.find((m) => m.id === shippingMethodId)) {
//       setShowPickupOptions(PICKUP_OPTION_ON)
//     }
//   }, [availableShippingMethods])

//   const handleEdit = () => {
//     router.push(pathname + "?step=delivery", { scroll: false })
//   }

//   const handleSubmit = () => {
//     router.push(pathname + "?step=payment", { scroll: false })
//   }

//   const handleSetShippingMethod = async (
//     id: string,
//     variant: "shipping" | "pickup"
//   ) => {
//     setError(null)

//     if (variant === "pickup") {
//       setShowPickupOptions(PICKUP_OPTION_ON)
//     } else {
//       setShowPickupOptions(PICKUP_OPTION_OFF)
//     }

//     let currentId: string | null = null
//     setIsLoading(true)
//     setShippingMethodId((prev) => {
//       currentId = prev
//       return id
//     })

//     await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
//       .catch((err) => {
//         setShippingMethodId(currentId)

//         setError(err.message)
//       })
//       .finally(() => {
//         setIsLoading(false)
//       })
//   }

//   useEffect(() => {
//     setError(null)
//   }, [isOpen])

//   return (
//     <div className="bg-white">
//       <div className="flex flex-row items-center justify-between mb-6">
//         <Heading
//           level="h2"
//           className={clx(
//             "flex flex-row text-3xl-regular gap-x-2 items-baseline",
//             {
//               "opacity-50 pointer-events-none select-none":
//                 !isOpen && cart.shipping_methods?.length === 0,
//             }
//           )}
//         >
//           Delivery
//           {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
//             <CheckCircleSolid />
//           )}
//         </Heading>
//         {!isOpen &&
//           cart?.shipping_address &&
//           cart?.billing_address &&
//           cart?.email && (
//             <Text>
//               <button
//                 onClick={handleEdit}
//                 className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
//                 data-testid="edit-delivery-button"
//               >
//                 Edit
//               </button>
//             </Text>
//           )}
//       </div>
//       {isOpen ? (
//         <>
//           <div className="grid">
//             <div className="flex flex-col">
//               <span className="font-medium txt-medium text-ui-fg-base">
//                 Shipping method
//               </span>
//               <span className="mb-4 text-ui-fg-muted txt-medium">
//                 How would you like you order delivered
//               </span>
//             </div>
//             <div data-testid="delivery-options-container">
//               <div className="pt-2 pb-8 md:pt-0">
//                 {hasPickupOptions && (
//                   <RadioGroup
//                     value={showPickupOptions}
//                     onChange={(value) => {
//                       const id = _pickupMethods.find(
//                         (option) => !option.insufficient_inventory
//                       )?.id

//                       if (id) {
//                         handleSetShippingMethod(id, "pickup")
//                       }
//                     }}
//                   >
//                     <Radio
//                       value={PICKUP_OPTION_ON}
//                       data-testid="delivery-option-radio"
//                       className={clx(
//                         "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
//                         {
//                           "border-ui-border-interactive":
//                             showPickupOptions === PICKUP_OPTION_ON,
//                         }
//                       )}
//                     >
//                       <div className="flex items-center gap-x-4">
//                         <MedusaRadio
//                           checked={showPickupOptions === PICKUP_OPTION_ON}
//                         />
//                         <span className="text-base-regular">
//                           Pick up your order
//                         </span>
//                       </div>
//                       <span className="justify-self-end text-ui-fg-base">
//                         -
//                       </span>
//                     </Radio>
//                   </RadioGroup>
//                 )}
//                 <RadioGroup
//                   value={shippingMethodId}
//                   onChange={(v) => handleSetShippingMethod(v, "shipping")}
//                 >
//                   {_shippingMethods?.map((option) => {
//                     const isDisabled =
//                       option.price_type === "calculated" &&
//                       !isLoadingPrices &&
//                       typeof calculatedPricesMap[option.id] !== "number"

//                     return (
//                       <Radio
//                         key={option.id}
//                         value={option.id}
//                         data-testid="delivery-option-radio"
//                         disabled={isDisabled}
//                         className={clx(
//                           "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
//                           {
//                             "border-ui-border-interactive":
//                               option.id === shippingMethodId,
//                             "hover:shadow-brders-none cursor-not-allowed":
//                               isDisabled,
//                           }
//                         )}
//                       >
//                         <div className="flex items-center gap-x-4">
//                           <MedusaRadio
//                             checked={option.id === shippingMethodId}
//                           />
//                           <span className="text-base-regular">
//                             {option.name}
//                           </span>
//                         </div>
//                         <span className="justify-self-end text-ui-fg-base">
//                           {option.price_type === "flat" ? (
//                             convertToLocale({
//                               amount: option.amount!,
//                               currency_code: cart?.currency_code,
//                             })
//                           ) : calculatedPricesMap[option.id] ? (
//                             convertToLocale({
//                               amount: calculatedPricesMap[option.id],
//                               currency_code: cart?.currency_code,
//                             })
//                           ) : isLoadingPrices ? (
//                             <Loader />
//                           ) : (
//                             "-"
//                           )}
//                         </span>
//                       </Radio>
//                     )
//                   })}
//                 </RadioGroup>
//               </div>
//             </div>
//           </div>

//           {showPickupOptions === PICKUP_OPTION_ON && (
//             <div className="grid">
//               <div className="flex flex-col">
//                 <span className="font-medium txt-medium text-ui-fg-base">
//                   Store
//                 </span>
//                 <span className="mb-4 text-ui-fg-muted txt-medium">
//                   Choose a store near you
//                 </span>
//               </div>
//               <div data-testid="delivery-options-container">
//                 <div className="pt-2 pb-8 md:pt-0">
//                   <RadioGroup
//                     value={shippingMethodId}
//                     onChange={(v) => handleSetShippingMethod(v, "pickup")}
//                   >
//                     {_pickupMethods?.map((option) => {
//                       return (
//                         <Radio
//                           key={option.id}
//                           value={option.id}
//                           disabled={option.insufficient_inventory}
//                           data-testid="delivery-option-radio"
//                           className={clx(
//                             "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
//                             {
//                               "border-ui-border-interactive":
//                                 option.id === shippingMethodId,
//                               "hover:shadow-brders-none cursor-not-allowed":
//                                 option.insufficient_inventory,
//                             }
//                           )}
//                         >
//                           <div className="flex items-start gap-x-4">
//                             <MedusaRadio
//                               checked={option.id === shippingMethodId}
//                             />
//                             <div className="flex flex-col">
//                               <span className="text-base-regular">
//                                 {option.name}
//                               </span>
//                               <span className="text-base-regular text-ui-fg-muted">
//                                 {formatAddress(
//                                   option.service_zone?.fulfillment_set?.location
//                                     ?.address
//                                 )}
//                               </span>
//                             </div>
//                           </div>
//                           <span className="justify-self-end text-ui-fg-base">
//                             {convertToLocale({
//                               amount: option.amount!,
//                               currency_code: cart?.currency_code,
//                             })}
//                           </span>
//                         </Radio>
//                       )
//                     })}
//                   </RadioGroup>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div>
//             <ErrorMessage
//               error={error}
//               data-testid="delivery-option-error-message"
//             />
//             <Button
//               size="large"
//               className="mt"
//               onClick={handleSubmit}
//               isLoading={isLoading}
//               disabled={!cart.shipping_methods?.[0]}
//               data-testid="submit-delivery-option-button"
//             >
//               Continue to payment
//             </Button>
//           </div>
//         </>
//       ) : (
//         <div>
//           <div className="text-small-regular">
//             {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
//               <div className="flex flex-col w-1/3">
//                 <Text className="mb-1 txt-medium-plus text-ui-fg-base">
//                   Method
//                 </Text>
//                 <Text className="txt-medium text-ui-fg-subtle">
//                   {cart.shipping_methods?.at(-1)?.name}{" "}
//                   {convertToLocale({
//                     amount: cart.shipping_methods.at(-1)?.amount!,
//                     currency_code: cart?.currency_code,
//                   })}
//                 </Text>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//       <Divider className="mt-8" />
//     </div>
//   )
// }

// export default Shipping

"use client"

import { RadioGroup, Radio } from "@headlessui/react"
import { setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid, Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Button, Heading, Text, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import MedusaRadio from "@modules/common/components/radio"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

function formatAddress(address) {
  if (!address) {
    return ""
  }

  let ret = ""

  if (address.address_1) {
    ret += ` ${address.address_1}`
  }

  if (address.address_2) {
    ret += `, ${address.address_2}`
  }

  if (address.postal_code) {
    ret += `, ${address.postal_code} ${address.city}`
  }

  if (address.country_code) {
    ret += `, ${address.country_code.toUpperCase()}`
  }

  return ret
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)

  const [showPickupOptions, setShowPickupOptions] =
    useState<string>(PICKUP_OPTION_OFF)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})
  const [error, setError] = useState<string | null>(null)
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  const _shippingMethods = availableShippingMethods?.filter(
    (sm) => sm.service_zone?.fulfillment_set?.type !== "pickup"
  )

  const _pickupMethods = availableShippingMethods?.filter(
    (sm) => sm.service_zone?.fulfillment_set?.type === "pickup"
  )

  const hasPickupOptions = !!_pickupMethods?.length

  useEffect(() => {
    setIsLoadingPrices(true)

    if (_shippingMethods?.length) {
      const promises = _shippingMethods
        .filter((sm) => sm.price_type === "calculated")
        .map((sm) => calculatePriceForShippingOption(sm.id, cart.id))

      if (promises.length) {
        Promise.allSettled(promises).then((res) => {
          const pricesMap: Record<string, number> = {}
          res
            .filter((r) => r.status === "fulfilled")
            .forEach((p) => (pricesMap[p.value?.id || ""] = p.value?.amount!))

          setCalculatedPricesMap(pricesMap)
          setIsLoadingPrices(false)
        })
      }
    }

    if (_pickupMethods?.find((m) => m.id === shippingMethodId)) {
      setShowPickupOptions(PICKUP_OPTION_ON)
    }
  }, [availableShippingMethods])

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const handleSetShippingMethod = async (
    id: string,
    variant: "shipping" | "pickup"
  ) => {
    setError(null)

    if (variant === "pickup") {
      setShowPickupOptions(PICKUP_OPTION_ON)
    } else {
      setShowPickupOptions(PICKUP_OPTION_OFF)
    }

    let currentId: string | null = null
    setIsLoading(true)
    setShippingMethodId((prev) => {
      currentId = prev
      return id
    })

    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((err) => {
        setShippingMethodId(currentId)
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
      <div className="p-6">
        <div className="flex flex-row items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              !isOpen && (cart.shipping_methods?.length ?? 0) > 0
                ? 'bg-orange-100 text-[#e65100]' 
                : isOpen 
                ? 'bg-[#e65100] text-white' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 ? (
                <CheckCircleSolid className="w-5 h-5" />
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-.293-.707L15 4.586A1 1 0 0014.414 4H14v3z" />
                </svg>
              )}
            </div>
            <Heading
              level="h2"
              className={clx(
                "text-xl font-semibold text-gray-900",
                {
                  "opacity-50 pointer-events-none select-none":
                    !isOpen && cart.shipping_methods?.length === 0,
                }
              )}
            >
              Delivery Options
            </Heading>
            {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
              <div className="px-2 py-1 text-xs font-medium text-white bg-[#e65100] rounded-full">
                Completed
              </div>
            )}
          </div>
          {!isOpen &&
            cart?.shipping_address &&
            cart?.billing_address &&
            cart?.email && (
              <button
                onClick={handleEdit}
                className="text-[#e65100] hover:text-[#bf360c] font-medium text-sm transition-colors duration-200 flex items-center gap-1 hover:gap-2"
                data-testid="edit-delivery-button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
        </div>
        
        {isOpen ? (
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="mb-6">
                <h3 className="mb-2 font-semibold text-gray-900">Choose Your Delivery Method</h3>
                <p className="text-sm text-gray-600">Select how you'd like to receive your order</p>
              </div>

              <div data-testid="delivery-options-container" className="space-y-4">
                {hasPickupOptions && (
                  <div className="space-y-3">
                    <RadioGroup
                      value={showPickupOptions}
                      onChange={(value) => {
                        const id = _pickupMethods.find(
                          (option) => !option.insufficient_inventory
                        )?.id

                        if (id) {
                          handleSetShippingMethod(id, "pickup")
                        }
                      }}
                    >
                      <Radio
                        value={PICKUP_OPTION_ON}
                        data-testid="delivery-option-radio"
                        className={clx(
                          "group relative flex items-center justify-between cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:bg-gray-50",
                          {
                            "border-[#e65100] bg-orange-50": showPickupOptions === PICKUP_OPTION_ON,
                            "border-gray-200": showPickupOptions !== PICKUP_OPTION_ON,
                          }
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            showPickupOptions === PICKUP_OPTION_ON 
                              ? 'border-[#e65100] bg-[#e65100]' 
                              : 'border-gray-300'
                          }`}>
                            {showPickupOptions === PICKUP_OPTION_ON && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="font-medium text-gray-900">Store Pickup</span>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-900">Free</span>
                      </Radio>
                    </RadioGroup>
                  </div>
                )}

                <div className="space-y-3">
                  <RadioGroup
                    value={shippingMethodId}
                    onChange={(v) => handleSetShippingMethod(v, "shipping")}
                  >
                    {_shippingMethods?.map((option) => {
                      const isDisabled =
                        option.price_type === "calculated" &&
                        !isLoadingPrices &&
                        typeof calculatedPricesMap[option.id] !== "number"

                      return (
                        <Radio
                          key={option.id}
                          value={option.id}
                          data-testid="delivery-option-radio"
                          disabled={isDisabled}
                          className={clx(
                            "group relative flex items-center justify-between cursor-pointer rounded-xl border-2 p-4 transition-all duration-200",
                            {
                              "border-[#e65100] bg-orange-50": option.id === shippingMethodId,
                              "border-gray-200 hover:bg-gray-50": option.id !== shippingMethodId && !isDisabled,
                              "border-gray-100 bg-gray-50 cursor-not-allowed": isDisabled,
                            }
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              option.id === shippingMethodId 
                                ? 'border-[#e65100] bg-[#e65100]' 
                                : 'border-gray-300'
                            }`}>
                              {option.id === shippingMethodId && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                              <span className="font-medium text-gray-900">{option.name}</span>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {option.price_type === "flat" ? (
                              convertToLocale({
                                amount: option.amount!,
                                currency_code: cart?.currency_code,
                              })
                            ) : calculatedPricesMap[option.id] ? (
                              convertToLocale({
                                amount: calculatedPricesMap[option.id],
                                currency_code: cart?.currency_code,
                              })
                            ) : isLoadingPrices ? (
                              <Loader className="w-4 h-4" />
                            ) : (
                              "Quote on request"
                            )}
                          </span>
                        </Radio>
                      )
                    })}
                  </RadioGroup>
                </div>
              </div>
            </div>

            {showPickupOptions === PICKUP_OPTION_ON && (
              <div className="p-6 bg-blue-50 rounded-xl">
                <div className="mb-4">
                  <h3 className="mb-2 font-semibold text-gray-900">Select Pickup Location</h3>
                  <p className="text-sm text-gray-600">Choose a store near you for pickup</p>
                </div>
                <div data-testid="delivery-options-container">
                  <RadioGroup
                    value={shippingMethodId}
                    onChange={(v) => handleSetShippingMethod(v, "pickup")}
                    className="space-y-3"
                  >
                    {_pickupMethods?.map((option) => {
                      return (
                        <Radio
                          key={option.id}
                          value={option.id}
                          disabled={option.insufficient_inventory}
                          data-testid="delivery-option-radio"
                          className={clx(
                            "group relative flex items-center justify-between cursor-pointer rounded-xl border-2 p-4 transition-all duration-200",
                            {
                              "border-[#e65100] bg-orange-50": option.id === shippingMethodId,
                              "border-gray-200 hover:bg-white": option.id !== shippingMethodId && !option.insufficient_inventory,
                              "border-gray-100 bg-gray-50 cursor-not-allowed": option.insufficient_inventory,
                            }
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                              option.id === shippingMethodId 
                                ? 'border-[#e65100] bg-[#e65100]' 
                                : 'border-gray-300'
                            }`}>
                              {option.id === shippingMethodId && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{option.name}</div>
                              <div className="mt-1 text-sm text-gray-600">
                                {formatAddress(
                                  option.service_zone?.fulfillment_set?.location?.address
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {convertToLocale({
                              amount: option.amount!,
                              currency_code: cart?.currency_code,
                            })}
                          </span>
                        </Radio>
                      )
                    })}
                  </RadioGroup>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <ErrorMessage
                error={error}
                data-testid="delivery-option-error-message"
              />
              <Button
                size="large"
                className="w-full bg-[#e65100] hover:bg-[#bf360c] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                onClick={handleSubmit}
                isLoading={isLoading}
                disabled={!cart.shipping_methods?.[0]}
                data-testid="submit-delivery-option-button"
              >
                Continue to Payment
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-[#e65100] rounded-full"></div>
                  <Text className="font-medium text-gray-900">Selected Method</Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text className="text-gray-600">
                    {cart.shipping_methods?.at(-1)?.name}
                  </Text>
                  <Text className="font-semibold text-gray-900">
                    {convertToLocale({
                      amount: cart.shipping_methods.at(-1)?.amount!,
                      currency_code: cart?.currency_code,
                    })}
                  </Text>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Shipping