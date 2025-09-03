// import { Radio as RadioGroupOption } from "@headlessui/react"
// import { Text, clx } from "@medusajs/ui"
// import React, { useContext, useMemo, type JSX } from "react"

// import Radio from "@modules/common/components/radio"

// import { isManual } from "@lib/constants"
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
//         <span className="justify-self-end text-ui-fg-base">
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

import { Radio as RadioGroupOption } from "@headlessui/react"
import { Text, clx } from "@medusajs/ui"
import React, { useContext, useMemo, useEffect, useState, type JSX } from "react"

import Radio from "@modules/common/components/radio"

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

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <RadioGroupOption
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className={clx(
        "flex flex-col gap-y-2 text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 ",
        {
          "border-ui-border-interactive":
            selectedPaymentOptionId === paymentProviderId,
        }
      )}
    >
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-x-4">
          <Radio checked={selectedPaymentOptionId === paymentProviderId} />
          <Text className="text-base-regular">
            {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
          </Text>
          {isManual(paymentProviderId) && isDevelopment && (
            <PaymentTest className="hidden small:block" />
          )}
        </div>
        <span className="justify-self-end text-ui-fg-base text-2xl">
          {paymentInfoMap[paymentProviderId]?.icon}
        </span>
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

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "Inter, sans-serif",
          color: "#424270",
          "::placeholder": {
            color: "rgb(107 114 128)",
          },
        },
      },
      classes: {
        base: "pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover transition-all duration-300 ease-in-out",
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
      {selectedPaymentOptionId === paymentProviderId &&
        (stripeReady ? (
          <div className="my-4 transition-all duration-150 ease-in-out">
            <Text className="mb-1 txt-medium-plus text-ui-fg-base">
              Enter your card details:
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
          </div>
        ) : (
          <SkeletonCardDetails />
        ))}
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

  useEffect(() => {
    // Load Razorpay script if not already loaded
    if (!(window as any).Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        setRazorpayReady(true)
      }
      script.onerror = () => {
        // console.error('Failed to load Razorpay script')
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
      {/* {selectedPaymentOptionId === paymentProviderId && (
        <div className="my-4 transition-all duration-150 ease-in-out">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-gray-900">Secure Payment with Razorpay</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Pay securely using UPI, Credit/Debit Cards, Net Banking, and Wallets
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">UPI</span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Cards</span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Net Banking</span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Wallets</span>
            </div>
            {!razorpayReady && (
              <div className="mt-3 text-sm text-gray-500">
                Loading payment options...
              </div>
            )}
          </div>
        </div>
      )} */}
    </PaymentContainer>
  )
}
