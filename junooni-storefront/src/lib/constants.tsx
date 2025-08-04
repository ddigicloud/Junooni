// import React from "react"
// import { CreditCard } from "@medusajs/icons"

// import Ideal from "@modules/common/icons/ideal"
// import Bancontact from "@modules/common/icons/bancontact"
// import PayPal from "@modules/common/icons/paypal"

// /* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
// export const paymentInfoMap: Record<
//   string,
//   { title: string; icon: React.JSX.Element }
// > = {
//   pp_stripe_stripe: {
//     title: "Credit card",
//     icon: <CreditCard />,
//   },
//   "pp_stripe-ideal_stripe": {
//     title: "iDeal",
//     icon: <Ideal />,
//   },
//   "pp_stripe-bancontact_stripe": {
//     title: "Bancontact",
//     icon: <Bancontact />,
//   },
//   pp_paypal_paypal: {
//     title: "PayPal",
//     icon: <PayPal />,
//   },
//   pp_system_default: {
//     title: "Manual Payment",
//     icon: <CreditCard />,
//   },
//   // Add more payment providers here
// }

// // This only checks if it is native stripe for card payments, it ignores the other stripe-based providers
// export const isStripe = (providerId?: string) => {
//   return providerId?.startsWith("pp_stripe_")
// }
// export const isPaypal = (providerId?: string) => {
//   return providerId?.startsWith("pp_paypal")
// }
// export const isManual = (providerId?: string) => {
//   return providerId?.startsWith("pp_system_default")
// }

// // Add currencies that don't need to be divided by 100
// export const noDivisionCurrencies = [
//   "krw",
//   "jpy",
//   "vnd",
//   "clp",
//   "pyg",
//   "xaf",
//   "xof",
//   "bif",
//   "djf",
//   "gnf",
//   "kmf",
//   "mga",
//   "rwf",
//   "xpf",
//   "htg",
//   "vuv",
//   "xag",
//   "xdr",
//   "xau",
// ]


import React from "react"
import { CreditCard } from "@medusajs/icons"

import Ideal from "@modules/common/icons/ideal"
import Bancontact from "@modules/common/icons/bancontact"
import PayPal from "@modules/common/icons/paypal"

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_stripe_stripe: {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_stripe-ideal_stripe": {
    title: "iDeal",
    icon: <Ideal />,
  },
  "pp_stripe-bancontact_stripe": {
    title: "Bancontact",
    icon: <Bancontact />,
  },
  pp_paypal_paypal: {
    title: "PayPal",
    icon: <PayPal />,
  },
  pp_system_default: {
    title: "Manual Payment",
    icon: <CreditCard />,
  },
  pp_razorpay_razorpay: {
    title: "Razorpay",
    icon: (
      <svg width="20" height="20" viewBox="0 0 1896 401" fill="none">
        <path d="M122.63 105.7l-15.75 57.97 90.15-58.3-58.96.33c-8.4 0-15.44 6.67-15.44 15.44v-.44z" fill="#0C2654"/>
        <path d="M275.09 234.35c0-5.44-1.98-10.67-5.44-14.67L244.71 194.7c-12.89-15.75-36.67-18.22-53.33-5.33l-6.67 4.89c-16.44 12.89-19.33 36.67-6.67 53.33l24.89 32c3.78 4.89 9.78 7.78 16 7.78h50.67c8.67 0 15.78-7.11 15.78-15.78v-36.44h-.29z" fill="#0C2654"/>
        <path d="M446.54 105.7l-32.44 119.11h-22.67l32.44-119.11h22.67z" fill="#0C2654"/>
        <path d="M478.76 224.81l32.44-119.11h22.44l-10.22 37.56c7.33-6.67 16.44-11.78 27.11-11.78 21.56 0 35.78 15.78 35.78 38.22 0 5.78-1.11 11.78-2.89 17.33l-16.44 60.44h-22.44l15.78-58c1.33-4.67 2-9.11 2-13.33 0-13.33-8.67-22.44-21.78-22.44-15.11 0-26.22 12.44-30.22 28.44l-14.67 54.89h-22.44l-.45.78z" fill="#0C2654"/>
        <path d="M633.54 139.26c-24.44 0-42.22 18.67-42.22 42.67 0 15.33 9.33 27.56 24.44 27.56 24.67 0 42.44-18.67 42.44-42.67 0-15.33-9.33-27.56-24.66-27.56zm-64.44 85.55l32.44-119.11h22.67l-10.67 39.33c7.33-7.11 17.33-12.44 29.11-12.44 21.33 0 35.56 15.78 35.56 38.67 0 5.78-1.11 11.78-2.89 17.78l-16.22 59.56h-22.67l15.78-57.78c1.33-4.67 2-9.33 2-13.78 0-13.33-8.67-22.67-21.78-22.67-15.33 0-26.44 12.67-30.44 28.67l-14.67 54.56h-22.22v.21z" fill="#0C2654"/>
        <path d="M901.54 105.7l-32.44 119.11h-22.67l32.44-119.11h22.67z" fill="#0C2654"/>
        <path d="M707.76 224.81l6.89-25.33h47.78l-6.89 25.33h-47.78zm-11.78-43.33l6.89-25.33h47.78l-6.89 25.33h-47.78zm-11.78-43.11l6.89-25.33h47.78l-6.89 25.33h-47.78z" fill="#0C2654"/>
        <path d="M778.65 224.81l32.44-119.11h22.44l-32.44 119.11h-22.44z" fill="#0C2654"/>
        <path d="M1068.87 224.81l32.44-119.11h57.78c23.11 0 37.33 12.44 37.33 32.44 0 25.78-18.22 44.44-44.44 44.44h-38.22l-12.44 42.23h-32.45zm40.67-118.67l-12.44 46h33.78c12.44 0 20.44-8.67 20.44-20.22 0-8.67-5.33-13.78-15.11-13.78h-26.67z" fill="#0C2654"/>
        <path d="M1200.87 224.81l32.44-119.11h32.44l-32.44 119.11h-32.44z" fill="#0C2654"/>
        <path d="M1357.54 139.26c-19.11 0-32.44 14.22-32.44 32.22 0 10.67 6.22 18.22 16.44 18.22 19.33 0 32.67-14.22 32.67-32.22 0-10.67-6.22-18.22-16.67-18.22zm-64.44 85.55l32.44-119.11h32.44l-9.33 34.22c5.78-6.22 14.22-10.67 24.44-10.67 18.22 0 30.67 13.33 30.67 32.44 0 4.67-.89 9.78-2.22 14.67l-13.78 48.45h-32.44l12.44-44.89c.89-3.33 1.33-6.22 1.33-8.89 0-8.67-4.67-14.22-12.44-14.22-10.22 0-17.78 8.67-20.67 19.78l-12.44 47.78h-32.44v.44z" fill="#0C2654"/>
        <path d="M1896 105.7l-32.44 119.11h-32.44l32.44-119.11H1896z" fill="#0C2654"/>
        <path d="M1506.87 224.81l6.89-25.33h40l-6.89 25.33h-40zm-9.78-35.78l6.89-25.33h40l-6.89 25.33h-40zm-9.78-35.78l6.89-25.33h40l-6.89 25.33h-40z" fill="#0C2654"/>
        <path d="M1563.54 224.81l32.44-119.11h32.44l-32.44 119.11h-32.44z" fill="#0C2654"/>
        <path d="M275.09 330.7c-5.44 0-9.78-4.44-9.78-9.78s4.44-9.78 9.78-9.78 9.78 4.44 9.78 9.78-4.44 9.78-9.78 9.78z" fill="#528FF0"/>
      </svg>
    ),
  },
  // Add more payment providers here
}

// This only checks if it is native stripe for card payments, it ignores the other stripe-based providers
export const isStripe = (providerId?: string) => {
  return providerId?.startsWith("pp_stripe_")
}

export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}

export const isRazorpay = (providerId?: string) => {
  return providerId?.startsWith("pp_razorpay")
}

export const isManual = (providerId?: string) => {
  return providerId?.startsWith("pp_system_default")
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]