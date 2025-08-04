// "use client"

// import { Heading, Text, clx } from "@medusajs/ui"

// import PaymentButton from "../payment-button"
// import { useSearchParams } from "next/navigation"

// const Review = ({ cart }: { cart: any }) => {
//   const searchParams = useSearchParams()

//   const isOpen = searchParams.get("step") === "review"

//   const paidByGiftcard =
//     cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

//   const previousStepsCompleted =
//     cart.shipping_address &&
//     cart.shipping_methods.length > 0 &&
//     (cart.payment_collection || paidByGiftcard)

//   return (
//     <div className="bg-white">
//       <div className="flex flex-row items-center justify-between mb-6">
//         <Heading
//           level="h2"
//           className={clx(
//             "flex flex-row text-3xl-regular gap-x-2 items-baseline",
//             {
//               "opacity-50 pointer-events-none select-none": !isOpen,
//             }
//           )}
//         >
//           Review
//         </Heading>
//       </div>
//       {isOpen && previousStepsCompleted && (
//         <>
//           <div className="flex items-start w-full mb-6 gap-x-1">
//             <div className="w-full">
//               <Text className="mb-1 txt-medium-plus text-ui-fg-base">
//                 By clicking the Place Order button, you confirm that you have
//                 read, understand and accept our Terms of Use, Terms of Sale and
//                 Returns Policy and acknowledge that you have read Medusa
//                 Store&apos;s Privacy Policy.
//               </Text>
//             </div>
//           </div>
//           <PaymentButton cart={cart} data-testid="submit-order-button" />
//         </>
//       )}
//     </div>
//   )
// }

// export default Review


"use client"

import { Heading, Text, clx } from "@medusajs/ui"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <div className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
      <div className="p-6">
        <div className="flex flex-row items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isOpen && previousStepsCompleted
                ? 'bg-[#e65100] text-white' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <Heading
              level="h2"
              className={clx(
                "text-xl font-semibold text-gray-900",
                {
                  "opacity-50 pointer-events-none select-none": !isOpen,
                }
              )}
            >
              Review & Place Order
            </Heading>
          </div>
        </div>

        {isOpen && previousStepsCompleted && (
          <div className="space-y-6">
            {/* Order Summary Header */}
            <div className="p-3 border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
              <div className="flex items-center gap-3 mb-0">
                <div className="w-10 h-10 rounded-full bg-[#e65100] text-white flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Almost there!</h3>
                  <p className="text-sm text-gray-600">Review your order details before completing your purchase</p>
                </div>
              </div>

              {/* Security Features */}
              {/* <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Privacy Protected</span>
                </div>
              </div> */}
            </div>

            {/* Place Order Section */}
            <div className="space-y-6">
              {/* Order Confirmation Notice */}
              {/* <div className="p-3 border border-blue-200 bg-blue-50 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">Ready to complete your order?</h3>
                    <p className="text-sm text-gray-600">
                      You'll receive an order confirmation email immediately after placing your order. 
                      We'll also send you tracking information once your items ship.
                    </p>
                  </div>
                </div>
              </div> */}

              {/* Trust Indicators */}
              {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="p-4 text-center border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-green-100 rounded-full">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="mb-1 text-sm font-medium text-gray-900">Secure Payment</h4>
                  <p className="text-xs text-gray-600">256-bit SSL encryption</p>
                </div>

                <div className="p-4 text-center border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-blue-100 rounded-full">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="mb-1 text-sm font-medium text-gray-900">Money Back Guarantee</h4>
                  <p className="text-xs text-gray-600">30-day return policy</p>
                </div>

                <div className="p-4 text-center border border-purple-200 rounded-lg bg-purple-50">
                  <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-purple-100 rounded-full">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="mb-1 text-sm font-medium text-gray-900">Easy Returns</h4>
                  <p className="text-xs text-gray-600">Free return shipping</p>
                </div>
              </div> */}

              {/* Place Order Button */}
              <div className="p-8 border border-gray-200 shadow-sm bg-gradient-to-r from-gray-50 to-white rounded-xl">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-[#e65100] to-[#ff6d00] text-white mb-4 shadow-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Complete Your Purchase</h3>
                  {/* <p className="mb-6 text-sm text-gray-600">Click below to finalize your order</p> */}
                  
                  <div className="max-w-md mx-auto">
                    <PaymentButton 
                      cart={cart} 
                      data-testid="submit-order-button"
                      className="w-full bg-[#e65100] hover:bg-[#bf360c] text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                    />
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                    <svg className="w-4 h-4 text-[#e65100]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                </div>
              </div>
              
              {/* Terms and Conditions */}
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 font-medium text-gray-900">Terms & Conditions</h4>
                  <Text className="text-sm leading-relaxed text-gray-600">
                    By clicking the "Place Order" button, you confirm that you have read, understand and accept our{" "}
                    <a href="#" className="text-[#e65100] hover:text-[#bf360c] font-medium underline">Terms of Use</a>,{" "}
                    <a href="#" className="text-[#e65100] hover:text-[#bf360c] font-medium underline">Terms of Sale</a> and{" "}
                    <a href="#" className="text-[#e65100] hover:text-[#bf360c] font-medium underline">Returns Policy</a> and acknowledge that you have read{" "}
                    <a href="#" className="text-[#e65100] hover:text-[#bf360c] font-medium underline">Medusa Store's Privacy Policy</a>.
                  </Text>
                </div>
              </div>
            </div>
            
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Review