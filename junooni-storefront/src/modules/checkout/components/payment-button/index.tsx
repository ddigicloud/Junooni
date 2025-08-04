// "use client"

// import { isManual, isStripe } from "@lib/constants"
// import { placeOrder } from "@lib/data/cart"
// import { HttpTypes } from "@medusajs/types"
// import { Button } from "@medusajs/ui"
// import { useElements, useStripe } from "@stripe/react-stripe-js"
// import React, { useState } from "react"
// import ErrorMessage from "../error-message"

// type PaymentButtonProps = {
//   cart: HttpTypes.StoreCart
//   "data-testid": string
// }

// const PaymentButton: React.FC<PaymentButtonProps> = ({
//   cart,
//   "data-testid": dataTestId,
// }) => {
//   const notReady =
//     !cart ||
//     !cart.shipping_address ||
//     !cart.billing_address ||
//     !cart.email ||
//     (cart.shipping_methods?.length ?? 0) < 1

//   const paymentSession = cart.payment_collection?.payment_sessions?.[0]

//   switch (true) {
//     case isStripe(paymentSession?.provider_id):
//       return (
//         <StripePaymentButton
//           notReady={notReady}
//           cart={cart}
//           data-testid={dataTestId}
//         />
//       )
//     case isManual(paymentSession?.provider_id):
//       return (
//         <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
//       )
//     default:
//       return <Button disabled>Select a payment method</Button>
//   }
// }

// const StripePaymentButton = ({
//   cart,
//   notReady,
//   "data-testid": dataTestId,
// }: {
//   cart: HttpTypes.StoreCart
//   notReady: boolean
//   "data-testid"?: string
// }) => {
//   const [submitting, setSubmitting] = useState(false)
//   const [errorMessage, setErrorMessage] = useState<string | null>(null)

//   const onPaymentCompleted = async () => {
//     await placeOrder()
//       .catch((err) => {
//         setErrorMessage(err.message)
//       })
//       .finally(() => {
//         setSubmitting(false)
//       })
//   }

//   const stripe = useStripe()
//   const elements = useElements()
//   const card = elements?.getElement("card")

//   const session = cart.payment_collection?.payment_sessions?.find(
//     (s) => s.status === "pending"
//   )

//   const disabled = !stripe || !elements ? true : false

//   const handlePayment = async () => {
//     setSubmitting(true)

//     if (!stripe || !elements || !card || !cart) {
//       setSubmitting(false)
//       return
//     }

//     await stripe
//       .confirmCardPayment(session?.data.client_secret as string, {
//         payment_method: {
//           card: card,
//           billing_details: {
//             name:
//               cart.billing_address?.first_name +
//               " " +
//               cart.billing_address?.last_name,
//             address: {
//               city: cart.billing_address?.city ?? undefined,
//               country: cart.billing_address?.country_code ?? undefined,
//               line1: cart.billing_address?.address_1 ?? undefined,
//               line2: cart.billing_address?.address_2 ?? undefined,
//               postal_code: cart.billing_address?.postal_code ?? undefined,
//               state: cart.billing_address?.province ?? undefined,
//             },
//             email: cart.email,
//             phone: cart.billing_address?.phone ?? undefined,
//           },
//         },
//       })
//       .then(({ error, paymentIntent }) => {
//         if (error) {
//           const pi = error.payment_intent

//           if (
//             (pi && pi.status === "requires_capture") ||
//             (pi && pi.status === "succeeded")
//           ) {
//             onPaymentCompleted()
//           }

//           setErrorMessage(error.message || null)
//           return
//         }

//         if (
//           (paymentIntent && paymentIntent.status === "requires_capture") ||
//           paymentIntent.status === "succeeded"
//         ) {
//           return onPaymentCompleted()
//         }

//         return
//       })
//   }

//   return (
//     <>
//       <Button
//         disabled={disabled || notReady}
//         onClick={handlePayment}
//         size="large"
//         isLoading={submitting}
//         data-testid={dataTestId}
//       >
//         Place order
//       </Button>
//       <ErrorMessage
//         error={errorMessage}
//         data-testid="stripe-payment-error-message"
//       />
//     </>
//   )
// }

// const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
//   const [submitting, setSubmitting] = useState(false)
//   const [errorMessage, setErrorMessage] = useState<string | null>(null)

//   const onPaymentCompleted = async () => {
//     await placeOrder()
//       .catch((err) => {
//         setErrorMessage(err.message)
//       })
//       .finally(() => {
//         setSubmitting(false)
//       })
//   }

//   const handlePayment = () => {
//     setSubmitting(true)

//     onPaymentCompleted()
//   }

//   return (
//     <>
//       <Button
//         disabled={notReady}
//         isLoading={submitting}
//         onClick={handlePayment}
//         size="large"
//         data-testid="submit-order-button"
//       >
//         Place order
//       </Button>
//       <ErrorMessage
//         error={errorMessage}
//         data-testid="manual-payment-error-message"
//       />
//     </>
//   )
// }

// export default PaymentButton


"use client"

import { isManual, isStripe } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState, useEffect } from "react"
import ErrorMessage from "../error-message"

// Add this Razorpay script loader if not already loaded globally
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  // 🔍 DEBUG: Log the actual provider ID
  useEffect(() => {
    console.log("🔍 DEBUG Payment Session:", paymentSession)
    console.log("🔍 DEBUG Provider ID:", paymentSession?.provider_id)
    console.log("🔍 DEBUG All Payment Sessions:", cart.payment_collection?.payment_sessions)
  }, [paymentSession, cart.payment_collection?.payment_sessions])

  // 🔧 IMPROVED: More flexible Razorpay detection
  const isRazorpay = (providerId?: string) => {
    if (!providerId) return false
    return providerId.includes("razorpay") || providerId === "razorpay"
  }

  switch (true) {
    case isStripe(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    // 🔧 IMPROVED: Use flexible Razorpay detection
    case isRazorpay(paymentSession?.provider_id):
      return (
        <RazorpayPaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    default:
      // 🔍 DEBUG: Show what provider ID we got
      console.log("❌ Unhandled provider ID:", paymentSession?.provider_id)
      return (
        <div className="space-y-2">
          <Button disabled>
            Unhandled payment provider: {paymentSession?.provider_id || "none"}
          </Button>
          <p className="text-sm text-gray-500">
            Check console for debug info
          </p>
        </div>
      )
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

const RazorpayPaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  useEffect(() => {
    console.log("🎯 Razorpay Session Data:", session?.data)
  }, [session])

  // ✅ FIXED: Use correct authorization endpoint
  // Updated authorizePayment function for your PaymentButton component

const authorizePayment = async (razorpayResponse: any) => {
  try {
    console.log("🔄 Starting authorization...")
    console.log("📝 Razorpay Response:", razorpayResponse)

    // Use the correct API endpoint
    const authUrl = `http://localhost:9000/store/razorpay/authorize`
    console.log("🌐 Authorization URL:", authUrl)

    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
        collection_id: cart.payment_collection?.id,
        session_id: session?.id
      }),
    })

    console.log("📊 Response Status:", response.status)

    if (!response.ok) {
      const errorResponse = await response.json()
      console.error("❌ Authorization failed:", errorResponse)
      throw new Error(errorResponse.error || `Authorization failed: ${response.status}`)
    }

    const result = await response.json()
    console.log("✅ Authorization successful:", result)
    return result

  } catch (error) {
    console.error('❌ Authorization error:', error)
    throw error
  }
}

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)
    
    console.log("🚀 Starting Razorpay payment flow...")

    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded || !cart) {
      setErrorMessage("Failed to load Razorpay SDK")
      setSubmitting(false)
      return
    }

    // ✅ FIXED: Use correct field - session.data.id (not order_id)
    const razorpayOrderId = session?.data?.id
    
    if (!razorpayOrderId) {
      console.error("❌ Missing Razorpay order ID in session")
      setErrorMessage("Payment session not properly initialized. Please try again.")
      setSubmitting(false)
      return
    }

    console.log("✅ Found Razorpay Order ID:", razorpayOrderId)

    const options: any = {
      key: session?.data?.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: session?.data?.amount,
      currency: session?.data?.currency || "INR",
      name: "Your Store Name",
      description: "Order Payment",
      order_id: razorpayOrderId, // ✅ Use the correct field
      handler: async function (response: any) {
        console.log("✅ Razorpay Payment Success:", response)
        
        try {
          // ✅ Authorize payment
          console.log("🔄 Step 1: Authorizing payment...")
          await authorizePayment(response)
          
          // ✅ Place order
          console.log("🔄 Step 2: Placing order...")
          await placeOrder()
          
          console.log("✅ Complete flow successful!")
        } catch (err: any) {
          console.error("❌ Payment flow error:", err)
          setErrorMessage(`Payment failed: ${err.message}`)
        } finally {
          setSubmitting(false)
        }
      },
      prefill: {
        name: `${cart.billing_address?.first_name || ''} ${cart.billing_address?.last_name || ''}`,
        email: cart.email,
        contact: cart.billing_address?.phone ?? "",
      },
      theme: {
        color: "#e65100",
      },
      modal: {
        ondismiss: function() {
          console.log("💭 Payment modal dismissed")
          setSubmitting(false)
        }
      }
    }

    console.log("🚀 Razorpay Options:", options)

    try {
      const rzp = new (window as any).Razorpay(options)
      rzp.on("payment.failed", function (response: any) {
        console.log("❌ Razorpay Payment Failed:", response)
        setErrorMessage(`Payment failed: ${response.error?.description || 'Unknown error'}`)
        setSubmitting(false)
      })
      rzp.open()
    } catch (error) {
      console.error("❌ Failed to open Razorpay:", error)
      setErrorMessage("Failed to open payment interface")
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid={dataTestId}
        className="bg-[#e65100] hover:bg-[#bf360c] text-white"
      >
        {submitting ? "Processing Payment..." : "Pay with Razorpay"}
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="razorpay-payment-error-message"
      />
      
      {/* ✅ FIXED: Debug info showing correct fields */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="p-3 mt-2 text-xs bg-gray-100 rounded">
          <strong>Debug Info:</strong><br/>
          Provider ID: {session?.provider_id}<br/>
          Has Order ID: {session?.data?.id ? "✅" : "❌"}<br/>
          Order ID: {session?.data?.id}<br/>
          Amount: {session?.data?.amount}<br/>
          Currency: {session?.data?.currency}<br/>
          Status: {session?.data?.status}<br/>
          Session ID: {session?.id}<br/>
          Collection ID: {cart.payment_collection?.id}
        </div>
      )} */}
    </>
  )
}

export default PaymentButton
