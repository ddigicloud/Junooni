// "use client"

// import { RadioGroup } from "@headlessui/react"
// import { isStripe as isStripeFunc, isRazorpay as isRazorpayFunc, paymentInfoMap } from "@lib/constants"
// import { initiatePaymentSession } from "@lib/data/cart"
// import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
// import { Button, Container, Heading, Text, clx } from "@medusajs/ui"
// import ErrorMessage from "@modules/checkout/components/error-message"
// import PaymentContainer, {
//   StripeCardContainer,
//   RazorpayContainer,
// } from "@modules/checkout/components/payment-container"
// import Divider from "@modules/common/components/divider"
// import { usePathname, useRouter, useSearchParams } from "next/navigation"
// import { useCallback, useEffect, useState } from "react"

// const Payment = ({
//   cart,
//   availablePaymentMethods,
// }: {
//   cart: any
//   availablePaymentMethods: any[]
// }) => {
//   const activeSession = cart.payment_collection?.payment_sessions?.find(
//     (paymentSession: any) => paymentSession.status === "pending"
//   )

//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [cardBrand, setCardBrand] = useState<string | null>(null)
//   const [cardComplete, setCardComplete] = useState(false)
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
//     activeSession?.provider_id ?? ""
//   )

//   const searchParams = useSearchParams()
//   const router = useRouter()
//   const pathname = usePathname()

//   const isOpen = searchParams.get("step") === "payment"

//   const isStripe = isStripeFunc(selectedPaymentMethod)
//   const isRazorpay = isRazorpayFunc(selectedPaymentMethod)

//   const setPaymentMethod = async (method: string) => {
//     setError(null)
//     setSelectedPaymentMethod(method)
    
//     // For Stripe, initiate session immediately
//     if (isStripeFunc(method)) {
//       await initiatePaymentSession(cart, {
//         provider_id: method,
//       })
//     }
    
//     // For Razorpay, initiate session (Medusa will handle the provider setup)
//     if (isRazorpayFunc(method)) {
//       await initiatePaymentSession(cart, {
//         provider_id: method,
//       })
//     }
//   }

//   const paidByGiftcard =
//     cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

//   const paymentReady =
//     (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard

//   const createQueryString = useCallback(
//     (name: string, value: string) => {
//       const params = new URLSearchParams(searchParams)
//       params.set(name, value)

//       return params.toString()
//     },
//     [searchParams]
//   )

//   const handleEdit = () => {
//     router.push(pathname + "?" + createQueryString("step", "payment"), {
//       scroll: false,
//     })
//   }

//   const handleSubmit = async () => {
//     setIsLoading(true)
//     try {
//       const shouldInputCard =
//         isStripeFunc(selectedPaymentMethod) && !activeSession

//       const checkActiveSession =
//         activeSession?.provider_id === selectedPaymentMethod

//       if (!checkActiveSession) {
//         await initiatePaymentSession(cart, {
//           provider_id: selectedPaymentMethod,
//         })
//       }

//       // For Razorpay, we proceed directly to review as Razorpay payment will be handled on the review/order confirmation step
//       if (!shouldInputCard) {
//         return router.push(
//           pathname + "?" + createQueryString("step", "review"),
//           {
//             scroll: false,
//           }
//         )
//       }
//     } catch (err: any) {
//       setError(err.message)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     setError(null)
//   }, [isOpen])

//   return (
//     <div className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
//       <div className="p-6">
//         <div className="flex flex-row items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
//               !isOpen && paymentReady
//                 ? 'bg-orange-100 text-[#e65100]' 
//                 : isOpen 
//                 ? 'bg-[#e65100] text-white' 
//                 : 'bg-gray-100 text-gray-400'
//             }`}>
//               {!isOpen && paymentReady ? (
//                 <CheckCircleSolid className="w-5 h-5" />
//               ) : (
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                 </svg>
//               )}
//             </div>
//             <Heading
//               level="h2"
//               className={clx(
//                 "text-xl font-semibold text-gray-900",
//                 {
//                   "opacity-50 pointer-events-none select-none":
//                     !isOpen && !paymentReady,
//                 }
//               )}
//             >
//               Payment Information
//             </Heading>
//             {!isOpen && paymentReady && (
//               <div className="px-2 py-1 text-xs font-medium text-white bg-[#e65100] rounded-full">
//                 Completed
//               </div>
//             )}
//           </div>
//           {!isOpen && paymentReady && (
//             <button
//               onClick={handleEdit}
//               className="text-[#e65100] hover:text-[#bf360c] font-medium text-sm transition-colors duration-200 flex items-center gap-1 hover:gap-2"
//               data-testid="edit-payment-button"
//             >
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//               </svg>
//               Edit
//             </button>
//           )}
//         </div>

//         <div className={isOpen ? "block space-y-6" : "hidden"}>
//           {!paidByGiftcard && availablePaymentMethods?.length && (
//             <div className="p-6 bg-gray-50 rounded-xl">
//               <div className="mb-6">
//                 <h3 className="mb-2 font-semibold text-gray-900">Choose Payment Method</h3>
//                 <p className="text-sm text-gray-600">Your payment information is secure and encrypted</p>
//               </div>

//               <RadioGroup
//                 value={selectedPaymentMethod}
//                 onChange={(value: string) => setPaymentMethod(value)}
//                 className="space-y-4"
//               >
//                 {availablePaymentMethods.map((paymentMethod) => (
//                   <div key={paymentMethod.id}>
//                     {isStripeFunc(paymentMethod.id) ? (
//                       <div className="rounded-lg overflow-hidden transition-all duration-200 ">
//                         <StripeCardContainer
//                           paymentProviderId={paymentMethod.id}
//                           selectedPaymentOptionId={selectedPaymentMethod}
//                           paymentInfoMap={paymentInfoMap}
//                           setCardBrand={setCardBrand}
//                           setError={setError}
//                           setCardComplete={setCardComplete}
//                         />
//                       </div>
//                     ) : isRazorpayFunc(paymentMethod.id) ? (
//                       <div className="rounded-lg overflow-hidden transition-all duration-200">
//                         <RazorpayContainer
//                           paymentProviderId={paymentMethod.id}
//                           selectedPaymentOptionId={selectedPaymentMethod}
//                           paymentInfoMap={paymentInfoMap}
//                         />
//                       </div>
//                     ) : (
//                       <div className="rounded-lg overflow-hidden transition-all duration-200 ">
//                         <PaymentContainer
//                           paymentInfoMap={paymentInfoMap}
//                           paymentProviderId={paymentMethod.id}
//                           selectedPaymentOptionId={selectedPaymentMethod}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </RadioGroup>
//             </div>
//           )}

//           {paidByGiftcard && (
//             <div className="p-6 border border-green-200 bg-green-50 rounded-xl">
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
//                   <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <div>
//                   <Text className="font-semibold text-gray-900">Payment method</Text>
//                   <Text
//                     className="font-medium text-green-700"
//                     data-testid="payment-method-summary"
//                   >
//                     Paid with Gift Card
//                   </Text>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="space-y-3">
//             <ErrorMessage
//               error={error}
//               data-testid="payment-method-error-message"
//             />

//             <Button
//               size="large"
//               className="w-full bg-[#e65100] hover:bg-[#bf360c] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-0 border-none shadow-none"
//               onClick={handleSubmit}
//               isLoading={isLoading}
//               disabled={
//                 (isStripe && !cardComplete) ||
//                 (!selectedPaymentMethod && !paidByGiftcard)
//               }
//               data-testid="submit-payment-button"
//             >

//               {!activeSession && isStripeFunc(selectedPaymentMethod)
//                 ? "Enter Card Details"
//                 : isRazorpayFunc(selectedPaymentMethod)
//                 ? "Continue with Online payment"
//                 : "Continue to Review"}
//               <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//               </svg>
//             </Button>
//           </div>
//         </div>

//         <div className={isOpen ? "hidden" : "block"}>
//           {cart && paymentReady && activeSession ? (
//             <div className="grid gap-6 md:grid-cols-2">
//               <div className="space-y-3">
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 bg-[#e65100] rounded-full"></div>
//                   <Text className="font-medium text-gray-900">Payment Method</Text>
//                 </div>
//                 <div className="p-4 rounded-lg bg-gray-50">
//                   <Text
//                     className="font-medium text-gray-900"
//                     data-testid="payment-method-summary"
//                   >
//                     {paymentInfoMap[activeSession?.provider_id]?.title ||
//                       activeSession?.provider_id}
//                   </Text>
//                 </div>
//               </div>
              
//               <div className="space-y-3">
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 bg-[#e65100] rounded-full"></div>
//                   <Text className="font-medium text-gray-900">Payment Details</Text>
//                 </div>
//                 <div className="p-4 rounded-lg bg-gray-50">
//                   <div
//                     className="flex items-center gap-3"
//                     data-testid="payment-details-summary"
//                   >
//                     <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm">
//                       {paymentInfoMap[selectedPaymentMethod]?.icon || (
//                         <CreditCard className="w-4 h-4 text-gray-600" />
//                       )}
//                     </div>
//                     <Text className="font-medium text-gray-900">
//                       {isStripeFunc(selectedPaymentMethod) && cardBrand
//                         ? `${cardBrand} ****`
//                         : isRazorpayFunc(selectedPaymentMethod)
//                         ? "Multiple payment options available"
//                         : "Secure payment ready"}
//                     </Text>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ) : paidByGiftcard ? (
//             <div className="p-4 border border-green-200 rounded-lg bg-green-50">
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                 <Text className="font-medium text-gray-900">Payment Method</Text>
//               </div>
//               <Text
//                 className="mt-2 font-medium text-green-700"
//                 data-testid="payment-method-summary"
//               >
//                 Paid with Gift Card
//               </Text>
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Payment

"use client"

import { RadioGroup } from "@headlessui/react"
import { isStripe as isStripeFunc, isRazorpay as isRazorpayFunc, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import { Button, Container, Heading, Text, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer, {
  StripeCardContainer,
  RazorpayContainer,
} from "@modules/checkout/components/payment-container"
import googlepay from "@assets/google-pay.png"
import phonepe from "@assets/phonepe.png"
import paytm from "@assets/paytm.png"
import bhim from "@assets/bhim.png"
import Divider from "@modules/common/components/divider"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

// Helper function to get display title
const getDisplayTitle = (providerId: string) => {
  const customTitle = paymentInfoMap[providerId]?.title
  
  if (customTitle && customTitle !== 'Razorpay' && customTitle !== 'Stripe') {
    return customTitle
  }
  
  if (isRazorpayFunc(providerId)) {
    return 'Card / UPI / Netbanking'
  }
  
  if (providerId.includes('stripe')) {
    return 'Credit or Debit Card'
  }
  
  return 'Online Payment'
}

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const isStripe = isStripeFunc(selectedPaymentMethod)
  const isRazorpay = isRazorpayFunc(selectedPaymentMethod)

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    
    // For Stripe, initiate session immediately
    if (isStripeFunc(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
      })
    }
    
    // For Razorpay, initiate session (Medusa will handle the provider setup)
    if (isRazorpayFunc(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
      })
    }
  }

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const shouldInputCard =
        isStripeFunc(selectedPaymentMethod) && !activeSession

      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
        })
      }

      // For Razorpay, we proceed directly to review as Razorpay payment will be handled on the review/order confirmation step
      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        )
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
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
              !isOpen && paymentReady
                ? 'bg-orange-100 text-[#e65100]' 
                : isOpen 
                ? 'bg-[#e65100] text-white' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {!isOpen && paymentReady ? (
                <CheckCircleSolid className="w-5 h-5" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              )}
            </div>
            <Heading
              level="h2"
              className={clx(
                "text-xl font-semibold text-gray-900",
                {
                  "opacity-50 pointer-events-none select-none":
                    !isOpen && !paymentReady,
                }
              )}
            >
              Payment Information
            </Heading>
            {!isOpen && paymentReady && (
              <div className="px-2 py-1 text-xs font-medium text-white bg-[#e65100] rounded-full">
                Completed
              </div>
            )}
          </div>
          {!isOpen && paymentReady && (
            <button
              onClick={handleEdit}
              className="text-[#e65100] hover:text-[#bf360c] font-medium text-sm transition-colors duration-200 flex items-center gap-1 hover:gap-2"
              data-testid="edit-payment-button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
        </div>

        <div className={isOpen ? "block space-y-6" : "hidden"}>
          {!paidByGiftcard && availablePaymentMethods?.length && (
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="mb-6">
                <h3 className="mb-2 font-semibold text-gray-900">Choose Payment Method</h3>
                <p className="text-sm text-gray-600">Your payment information is secure and encrypted</p>
              </div>

              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
                className="space-y-4"
              >
                {availablePaymentMethods.map((paymentMethod) => (
                  <div key={paymentMethod.id}>
                    {isStripeFunc(paymentMethod.id) ? (
                      <div className="rounded-lg overflow-hidden transition-all duration-200 ">
                        <StripeCardContainer
                          paymentProviderId={paymentMethod.id}
                          selectedPaymentOptionId={selectedPaymentMethod}
                          paymentInfoMap={paymentInfoMap}
                          setCardBrand={setCardBrand}
                          setError={setError}
                          setCardComplete={setCardComplete}
                        />
                      </div>
                    ) : isRazorpayFunc(paymentMethod.id) ? (
                      <div className="rounded-lg overflow-hidden transition-all duration-200">
                        <RazorpayContainer
                          paymentProviderId={paymentMethod.id}
                          selectedPaymentOptionId={selectedPaymentMethod}
                          paymentInfoMap={paymentInfoMap}
                        />
                      </div>
                    ) : (
                      <div className="rounded-lg overflow-hidden transition-all duration-200 ">
                        <PaymentContainer
                          paymentInfoMap={paymentInfoMap}
                          paymentProviderId={paymentMethod.id}
                          selectedPaymentOptionId={selectedPaymentMethod}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {paidByGiftcard && (
            <div className="p-6 border border-green-200 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <Text className="font-semibold text-gray-900">Payment method</Text>
                  <Text
                    className="font-medium text-green-700"
                    data-testid="payment-method-summary"
                  >
                    Paid with Gift Card
                  </Text>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <ErrorMessage
              error={error}
              data-testid="payment-method-error-message"
            />

            <Button
              size="large"
              className="w-full bg-[#e65100] hover:bg-[#bf360c] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-0 border-none shadow-none"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={
                (isStripe && !cardComplete) ||
                (!selectedPaymentMethod && !paidByGiftcard)
              }
              data-testid="submit-payment-button"
            >

              {!activeSession && isStripeFunc(selectedPaymentMethod)
                ? "Enter Card Details"
                : isRazorpayFunc(selectedPaymentMethod)
                ? "Continue with Online payment"
                : "Continue to Review"}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#e65100] rounded-full"></div>
                  <Text className="font-medium text-gray-900">Payment Method</Text>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <Text
                    className="font-medium text-gray-900"
                    data-testid="payment-method-summary"
                  >
                    {getDisplayTitle(activeSession?.provider_id)}
                  </Text>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#e65100] rounded-full"></div>
                  <Text className="font-medium text-gray-900">Payment Details</Text>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <div
                    className="flex items-center gap-3"
                    data-testid="payment-details-summary"
                  >
                    {isRazorpayFunc(activeSession?.provider_id) ? (
                      <div className="flex items-center -space-x-1.5">
                        {/* Google Pay */}
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-white flex items-center justify-center overflow-hidden shadow-sm">
                          <img src={googlepay.src} alt="Google Pay" className="w-5 h-5 object-contain" />
                        </div>
                        
                        {/* PhonePe */}
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-white flex items-center justify-center overflow-hidden shadow-sm">
                          <img src={phonepe.src} alt="PhonePe" className="w-5 h-5 object-contain" />
                        </div>
                        
                        {/* Paytm */}
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-white flex items-center justify-center overflow-hidden shadow-sm">
                          <img src={paytm.src} alt="Paytm" className="w-5 h-5 object-contain" />
                        </div>
                        
                        {/* BHIM UPI */}
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-white flex items-center justify-center overflow-hidden shadow-sm">
                          <img src={bhim.src} alt="BHIM UPI" className="w-5 h-5 object-contain" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm">
                        {paymentInfoMap[activeSession?.provider_id]?.icon || (
                          <CreditCard className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                    )}
                    <Text className="font-medium text-gray-900">
                      {isStripeFunc(activeSession?.provider_id) && cardBrand
                        ? `${cardBrand} ****`
                        : isRazorpayFunc(activeSession?.provider_id)
                        ? "UPI, Cards & More"
                        : "Secure payment ready"}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Text className="font-medium text-gray-900">Payment Method</Text>
              </div>
              <Text
                className="mt-2 font-medium text-green-700"
                data-testid="payment-method-summary"
              >
                Paid with Gift Card
              </Text>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Payment