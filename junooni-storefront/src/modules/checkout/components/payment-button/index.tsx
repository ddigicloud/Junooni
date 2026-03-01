"use client"

import { isManual, isStripe } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState, useEffect } from "react"
import ErrorMessage from "../error-message"
import junoonilogo from "@assets/JUNOONI_logo.ico"

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

  useEffect(() => {
    console.log("Payment Session:", paymentSession)
  }, [paymentSession])

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
        <ManualTestPaymentButton 
          notReady={notReady} 
          cart={cart}
          data-testid={dataTestId} 
        />
      )
    case isRazorpay(paymentSession?.provider_id):
      return (
        <RazorpayPaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    default:
      return (
        <div className="space-y-2">
          <Button disabled>
            Unhandled payment provider: {paymentSession?.provider_id || "none"}
          </Button>
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
    try {
      await placeOrder()
    } catch (err: any) {
      setErrorMessage(err.message)
      throw err
    } finally {
      setSubmitting(false)
    }
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

const ManualTestPaymentButton = ({ 
  notReady,
  cart,
  "data-testid": dataTestId,
}: { 
  notReady: boolean
  cart: HttpTypes.StoreCart
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    try {
      await placeOrder()
    } catch (err: any) {
      setErrorMessage(err.message)
      throw err
    } finally {
      setSubmitting(false)
    }
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
        data-testid={dataTestId}
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
    console.log("Razorpay Session Data:", session?.data)
  }, [session])

  const authorizePayment = async (razorpayResponse: any) => {
    try {
      const authUrl = `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/razorpay/authorize`

      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
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

      if (!response.ok) {
        const errorResponse = await response.json()
        throw new Error(errorResponse.error || `Authorization failed: ${response.status}`)
      }

      const result = await response.json()
      return result

    } catch (error) {
      console.error("Authorization error:", error)
      throw error
    }
  }

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded || !cart) {
      setErrorMessage("Failed to load Razorpay SDK")
      setSubmitting(false)
      return
    }

    const razorpayOrderId = session?.data?.id

    if (!razorpayOrderId) {
      setErrorMessage("Payment session not properly initialized. Please try again.")
      setSubmitting(false)
      return
    }

    const options: any = {
      key: session?.data?.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: session?.data?.amount,
      currency: session?.data?.currency || "INR",
      name: "JUNOONI",
      image: "https://studio.junooni.com/assets/junooni-favicon-BskTzyxn.png",
      description: "Order Payment",
      order_id: razorpayOrderId,
      handler: async function (response: any) {
        console.log("✅ Payment Success:", response)
        
        try {
          console.log("🔐 Authorizing payment...")
          await authorizePayment(response)
          console.log("✅ Payment authorized")
          
          console.log("📦 Placing order (will redirect)...")
          await placeOrder()
          
        } catch (err: any) {
          console.error("❌ Order placement error:", err)
          setErrorMessage(err.message || "Order placement failed")
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
          console.log("❌ Payment Modal Dismissed")
          setSubmitting(false)
        }
      }
    }

    try {
      const rzp = new (window as any).Razorpay(options)
      rzp.on("payment.failed", function (response: any) {
        console.error("❌ Razorpay Payment Failed:", response.error)
        setErrorMessage(`Payment failed: ${response.error?.description || 'Unknown error'}`)
        setSubmitting(false)
      })
      rzp.open()
    } catch (error) {
      console.error("❌ Razorpay Error:", error)
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
        className="bg-[#e65100] hover:bg-[#bf360c] text-white shadow-none"
      >
        {submitting ? "Processing Payment..." : "Pay Now"}
      </Button>
      {/* <ErrorMessage
        error={errorMessage}
        data-testid="razorpay-payment-error-message"
      /> */}
    </>
  )
}

export default PaymentButton