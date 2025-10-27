// import { Radio as RadioGroupOption } from "@headlessui/react"
// import { Text, clx } from "@medusajs/ui"
// import React, { useContext, useMemo, useEffect, useState, type JSX } from "react"

// import Radio from "@modules/common/components/radio"

// import { isManual, isRazorpay } from "@lib/constants"
// import SkeletonCardDetails from "@modules/skeletons/components/skeleton-card-details"
// import { CardElement } from "@stripe/react-stripe-js"
// import { StripeCardElementOptions } from "@stripe/stripe-js"
// import PaymentTest from "../payment-test"
// import { StripeContext } from "../payment-wrapper/stripe-wrapper"

// type PaymentContainerProps = {
//   paymentProviderId: string
//   selectedPaymentOptionId: string | null
//   disabled?: boolean
//   paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
//   children?: React.ReactNode
// }

// const PaymentContainer: React.FC<PaymentContainerProps> = ({
//   paymentProviderId,
//   selectedPaymentOptionId,
//   paymentInfoMap,
//   disabled = false,
//   children,
// }) => {
//   const isDevelopment = process.env.NODE_ENV === "development"

//   return (
//     <RadioGroupOption
//       key={paymentProviderId}
//       value={paymentProviderId}
//       disabled={disabled}
//       className={clx(
//         "flex flex-col gap-y-2 text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 ",
//         {
//           "border-ui-border-interactive":
//             selectedPaymentOptionId === paymentProviderId,
//         }
//       )}
//     >
//       <div className="flex items-center justify-between ">
//         <div className="flex items-center gap-x-4">
//           <Radio checked={selectedPaymentOptionId === paymentProviderId} />
//           <Text className="text-base-regular">
//             {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
//           </Text>
//           {isManual(paymentProviderId) && isDevelopment && (
//             <PaymentTest className="hidden small:block" />
//           )}
//         </div>
//         <span className="justify-self-end text-ui-fg-base text-2xl">
//           {paymentInfoMap[paymentProviderId]?.icon}
//         </span>
//       </div>
//       {isManual(paymentProviderId) && isDevelopment && (
//         <PaymentTest className="small:hidden text-[10px]" />
//       )}
//       {children}
//     </RadioGroupOption>
//   )
// }

// export default PaymentContainer

// export const StripeCardContainer = ({
//   paymentProviderId,
//   selectedPaymentOptionId,
//   paymentInfoMap,
//   disabled = false,
//   setCardBrand,
//   setError,
//   setCardComplete,
// }: Omit<PaymentContainerProps, "children"> & {
//   setCardBrand: (brand: string) => void
//   setError: (error: string | null) => void
//   setCardComplete: (complete: boolean) => void
// }) => {
//   const stripeReady = useContext(StripeContext)

//   const useOptions: StripeCardElementOptions = useMemo(() => {
//     return {
//       style: {
//         base: {
//           fontFamily: "Inter, sans-serif",
//           color: "#424270",
//           "::placeholder": {
//             color: "rgb(107 114 128)",
//           },
//         },
//       },
//       classes: {
//         base: "pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover transition-all duration-300 ease-in-out",
//       },
//     }
//   }, [])

//   return (
//     <PaymentContainer
//       paymentProviderId={paymentProviderId}
//       selectedPaymentOptionId={selectedPaymentOptionId}
//       paymentInfoMap={paymentInfoMap}
//       disabled={disabled}
//     >
//       {selectedPaymentOptionId === paymentProviderId &&
//         (stripeReady ? (
//           <div className="my-4 transition-all duration-150 ease-in-out">
//             <Text className="mb-1 txt-medium-plus text-ui-fg-base">
//               Enter your card details:
//             </Text>
//             <CardElement
//               options={useOptions as StripeCardElementOptions}
//               onChange={(e) => {
//                 setCardBrand(
//                   e.brand && e.brand.charAt(0).toUpperCase() + e.brand.slice(1)
//                 )
//                 setError(e.error?.message || null)
//                 setCardComplete(e.complete)
//               }}
//             />
//           </div>
//         ) : (
//           <SkeletonCardDetails />
//         ))}
//     </PaymentContainer>
//   )
// }

// export const RazorpayContainer = ({
//   paymentProviderId,
//   selectedPaymentOptionId,
//   paymentInfoMap,
//   disabled = false,
// }: Omit<PaymentContainerProps, "children">) => {
//   const [razorpayReady, setRazorpayReady] = useState(false)

//   useEffect(() => {
//     // Load Razorpay script if not already loaded
//     if (!(window as any).Razorpay) {
//       const script = document.createElement('script')
//       script.src = 'https://checkout.razorpay.com/v1/checkout.js'
//       script.onload = () => {
//         setRazorpayReady(true)
//       }
//       script.onerror = () => {
//         // console.error('Failed to load Razorpay script')
//         setRazorpayReady(false)
//       }
//       document.body.appendChild(script)
//     } else {
//       setRazorpayReady(true)
//     }
//   }, [])

//   return (
//     <PaymentContainer
//       paymentProviderId={paymentProviderId}
//       selectedPaymentOptionId={selectedPaymentOptionId}
//       paymentInfoMap={paymentInfoMap}
//       disabled={disabled}
//     >
//     </PaymentContainer>
//   )
// }


import { Radio as RadioGroupOption } from "@headlessui/react"
import { Text, clx } from "@medusajs/ui"
import React, { useContext, useMemo, useEffect, useState, type JSX } from "react"

import Radio from "@modules/common/components/radio"
import googlepay from "@assets/google-pay.png"
import phonepe from "@assets/phonepe.png"
import paytm from "@assets/paytm.png"
import bhim from "@assets/bhim.png"
import { isManual, isRazorpay } from "@lib/constants"
import SkeletonCardDetails from "@modules/skeletons/components/skeleton-card-details"
import { CardElement } from "@stripe/react-stripe-js"
import { StripeCardElementOptions } from "@stripe/stripe-js"
import PaymentTest from "../payment-test"
import { StripeContext } from "../payment-wrapper/stripe-wrapper"

type PaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
  children?: React.ReactNode
}

// Helper function to get display title without provider branding
const getDisplayTitle = (paymentProviderId: string, paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>) => {
  // Check if custom title is provided in paymentInfoMap
  const customTitle = paymentInfoMap[paymentProviderId]?.title
  
  // If custom title exists and is not a provider name, use it
  if (customTitle && customTitle !== 'Razorpay' && customTitle !== 'Stripe') {
    return customTitle
  }
  
  // Otherwise, return generic title based on provider type
  if (isRazorpay(paymentProviderId)) {
    return 'Card / UPI / Netbanking'
  }
  
  if (paymentProviderId.includes('stripe')) {
    return 'Credit or Debit Card'
  }
  
  if (isManual(paymentProviderId)) {
    return 'Cash on Delivery'
  }
  
  // Default fallback
  return 'Online Payment'
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development"
  const isSelected = selectedPaymentOptionId === paymentProviderId
  const displayTitle = getDisplayTitle(paymentProviderId, paymentInfoMap)

  return (
    <RadioGroupOption
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className={clx(
        "relative flex flex-col gap-y-2 text-small-regular cursor-pointer py-4 px-5 mb-3 rounded-lg transition-all duration-200 ease-in-out group",
        {
          // Selected state - using brand color
          "border-2 border-[#e65100] bg-orange-50/30 shadow-sm": isSelected,
          // Default state
          "border border-gray-200 bg-white hover:border-gray-300": !isSelected && !disabled,
          // Disabled state
          "border border-gray-100 bg-gray-50 cursor-not-allowed opacity-60": disabled,
        }
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          {/* Simplified Radio Button */}
          <div className={clx(
            "relative flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200",
            {
              "border-[#e65100] bg-[#e65100]": isSelected,
              "border-gray-300 bg-white group-hover:border-gray-400": !isSelected && !disabled,
              "border-gray-200 bg-gray-100": disabled,
            }
          )}>
            {isSelected && (
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            )}
          </div>
          
          <Text className={clx("text-base font-medium transition-colors", {
            "text-gray-900": !disabled,
            "text-gray-400": disabled,
          })}>
            {displayTitle}
          </Text>
          
          {isManual(paymentProviderId) && isDevelopment && (
            <PaymentTest className="hidden small:block" />
          )}
        </div>
        
        {/* Payment Icon or Payment Method Icons */}
        {isRazorpay(paymentProviderId) ? (
          <div className="flex items-center -space-x-2">
            {/* Google Pay */}
            <div className={clx(
              "w-9 h-9 rounded-full border-2 bg-white flex items-center justify-center overflow-hidden transition-all duration-200",
              {
                "border-white shadow-md": isSelected,
                "border-gray-200": !isSelected && !disabled,
                "border-gray-100 opacity-60": disabled,
              }
            )}>
              <img src={googlepay.src} alt="Google Pay" className="w-7 h-7 object-contain" />
            </div>
            
            {/* PhonePe */}
            <div className={clx(
              "w-9 h-9 rounded-full border-1 bg-white flex items-center justify-center overflow-hidden transition-all duration-200",
              {
                "border-white shadow-md": isSelected,
                "border-gray-200": !isSelected && !disabled,
                "border-gray-100 opacity-60": disabled,
              }
            )}>
              <img src={phonepe.src} alt="PhonePe" className="w-9 h-9 object-contain" />
            </div>
            
            {/* Paytm */}
            <div className={clx(
              "w-9 h-9 rounded-full border-0 bg-white flex items-center justify-center overflow-hidden transition-all duration-200",
              {
                "border-white shadow-md": isSelected,
                "border-gray-200": !isSelected && !disabled,
                "border-gray-100 opacity-60": disabled,
              }
            )}>
              <img src={paytm.src} alt="Paytm" className="w-7 h-7 object-contain" />
            </div>
            
            {/* BHIM UPI */}
            <div className={clx(
              "w-9 h-9 rounded-full border-2 bg-white flex items-center justify-center overflow-hidden transition-all duration-200",
              {
                "border-white shadow-md": isSelected,
                "border-gray-200": !isSelected && !disabled,
                "border-gray-100 opacity-60": disabled,
              }
            )}>
              <img src={bhim.src} alt="BHIM UPI" className="w-7 h-7 object-contain" />
            </div>
          </div>
        ) : (
          <span className={clx(
            "flex items-center justify-center text-2xl transition-all duration-200",
            {
              "text-gray-700": isSelected,
              "text-gray-400 group-hover:text-gray-600": !isSelected && !disabled,
              "text-gray-300": disabled,
            }
          )}>
            {paymentInfoMap[paymentProviderId]?.icon}
          </span>
        )}
      </div>
      
      {isManual(paymentProviderId) && isDevelopment && (
        <PaymentTest className="small:hidden text-[10px]" />
      )}
      
      {children}
    </RadioGroupOption>
  )
}

export default PaymentContainer

export const StripeCardContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  setCardBrand,
  setError,
  setCardComplete,
}: Omit<PaymentContainerProps, "children"> & {
  setCardBrand: (brand: string) => void
  setError: (error: string | null) => void
  setCardComplete: (complete: boolean) => void
}) => {
  const stripeReady = useContext(StripeContext)
  const isSelected = selectedPaymentOptionId === paymentProviderId

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          color: "#1f2937",
          fontWeight: "400",
          "::placeholder": {
            color: "#9ca3af",
          },
        },
        invalid: {
          color: "#e65100",
          iconColor: "#e65100",
        },
      },
      classes: {
        base: "pt-2.5 pb-1 block w-full h-11 px-4 mt-0 bg-white border rounded-md appearance-none focus:outline-none focus:ring-0 focus:border-[#e65100] border-gray-300 hover:border-gray-400 transition-all duration-200",
      },
    }
  }, [])

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {stripeReady ? (
            <div className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">
                Card details
              </Text>
              
              <CardElement
                options={useOptions as StripeCardElementOptions}
                onChange={(e) => {
                  setCardBrand(
                    e.brand && e.brand.charAt(0).toUpperCase() + e.brand.slice(1)
                  )
                  setError(e.error?.message || null)
                  setCardComplete(e.complete)
                }}
              />
              
              <div className="flex items-center gap-x-1.5 text-xs text-gray-500 mt-2">
                <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Secure payment</span>
              </div>
            </div>
          ) : (
            <SkeletonCardDetails />
          )}
        </div>
      )}
    </PaymentContainer>
  )
}

export const RazorpayContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
}: Omit<PaymentContainerProps, "children">) => {
  const [razorpayReady, setRazorpayReady] = useState(false)
  const isSelected = selectedPaymentOptionId === paymentProviderId

  useEffect(() => {
    // Load Razorpay script if not already loaded
    if (!(window as any).Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        setRazorpayReady(true)
      }
      script.onerror = () => {
        setRazorpayReady(false)
      }
      document.body.appendChild(script)
    } else {
      setRazorpayReady(true)
    }
  }, [])

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {isSelected && (
        <div className="mt-2 flex items-center gap-x-1.5 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Secure payment</span>
        </div>
      )}
    </PaymentContainer>
  )
}