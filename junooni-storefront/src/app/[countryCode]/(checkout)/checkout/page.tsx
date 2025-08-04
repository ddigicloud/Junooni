// import { retrieveCart } from "@lib/data/cart"
// import { retrieveCustomer } from "@lib/data/customer"
// import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
// import CheckoutForm from "@modules/checkout/templates/checkout-form"
// import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
// import { Metadata } from "next"
// import { notFound } from "next/navigation"

// export const metadata: Metadata = {
//   title: "Checkout",
// }

// export default async function Checkout() {
//   const cart = await retrieveCart()

//   if (!cart) {
//     return notFound()
//   }

//   const customer = await retrieveCustomer()

//   return (
//     <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
//       <PaymentWrapper cart={cart}>
//       <CheckoutForm cart={cart} customer={customer} />
//         </PaymentWrapper>
//       <CheckoutSummary cart={cart} />
//     </div>
//   )
// }

// import { retrieveCart } from "@lib/data/cart"
// import { retrieveCustomer } from "@lib/data/customer"
// import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
// import CheckoutForm from "@modules/checkout/templates/checkout-form"
// import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
// import { Metadata } from "next"
// import { notFound } from "next/navigation"

// export const metadata: Metadata = {
//   title: "Checkout",
// }

// export default async function Checkout() {
//   const cart = await retrieveCart()

//   if (!cart) {
//     return notFound()
//   }

//   const customer = await retrieveCustomer()

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       <div className="container px-4 py-8 mx-auto lg:py-12">
//         {/* Header */}
//         <div className="mb-8 text-center lg:mb-12">
//           <h1 className="mb-2 text-3xl font-bold text-gray-900 lg:text-4xl">
//             Secure Checkout
//           </h1>
//           <p className="text-lg text-gray-600">
//             Complete your order in a few simple steps
//           </p>
//         </div>

//         {/* Main Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 max-w-7xl mx-auto">
//           {/* Checkout Form */}
//           <div className="order-2 lg:order-1">
//             <PaymentWrapper cart={cart}>
//               <CheckoutForm cart={cart} customer={customer} />
//             </PaymentWrapper>
//           </div>

//           {/* Order Summary */}
//           <div className="order-1 lg:order-2">
//             <div className="lg:sticky lg:top-8">
//               <CheckoutSummary cart={cart} />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { 
  Shield, 
  Lock, 
  CreditCard, 
  Phone, 
  Mail, 
  CheckCircle,
  Truck,
  RotateCcw
} from "lucide-react"

export const metadata: Metadata = {
  title: "Checkout",
}

// Checkout Footer Component
const CheckoutFooter = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 mt-16">

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          
          {/* Customer Support */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Need Help?</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-8 h-8 bg-[#e65100] rounded-full flex items-center justify-center">
                  <Phone size={16} className="text-white" />
                </div>
                <span className="text-gray-700 font-medium">+91 9557294610</span>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-8 h-8 bg-[#e65100] rounded-full flex items-center justify-center">
                  <Mail size={16} className="text-white" />
                </div>
                <span className="text-gray-700 font-medium">support@junooni.com</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">Business Hours:</p>
                <p className="text-sm text-gray-600">Mon-Fri: 9AM-8PM EST</p>
                <p className="text-sm text-gray-600">Sat-Sun: 10AM-6PM EST</p>
              </div>
            </div>
          </div>

          
            {/* Company Info */}
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Junooni Store</h4>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Premium quality products with fast shipping and excellent customer service. Your satisfaction is our priority.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Shield size={16} className="text-green-600" />
              <span>Secure & Trusted Shopping</span>
            </div>
          </div>
          {/* Quick Links */}
          <div className="text-center md:text-right">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="/shipping-info" className="text-gray-600 hover:text-[#e65100] transition-colors duration-200 font-medium block">
                  Shipping Information
                </a>
              </li>
              <li>
                <a href="/returns" className="text-gray-600 hover:text-[#e65100] transition-colors duration-200 font-medium block">
                  Return Policy
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-600 hover:text-[#e65100] transition-colors duration-200 font-medium block">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-600 hover:text-[#e65100] transition-colors duration-200 font-medium block">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/track-order" className="text-gray-600 hover:text-[#e65100] transition-colors duration-200 font-medium block">
                  Track Your Order
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <span className="font-medium">© {currentYear} Junooni Store. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="/privacy-policy" className="hover:text-[#e65100] transition-colors duration-200 font-medium">
                Privacy Policy
              </a>
              <span className="text-gray-400">•</span>
              <a href="/terms" className="hover:text-[#e65100] transition-colors duration-200 font-medium">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <div className="flex-1">
        <div className="container px-4 py-8 mx-auto lg:py-12">
          {/* Header */}
          <div className="mb-8 text-center lg:mb-12">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 lg:text-4xl">
              Secure Checkout
            </h1>
            <p className="text-lg text-gray-600">
              Complete your order in a few simple steps
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 max-w-7xl mx-auto">
            {/* Checkout Form */}
            <div className="order-2 lg:order-1">
              <PaymentWrapper cart={cart}>
                <CheckoutForm cart={cart} customer={customer} />
              </PaymentWrapper>
            </div>

            {/* Order Summary */}
            <div className="order-1 lg:order-2">
              <div className="lg:sticky lg:top-8">
                <CheckoutSummary cart={cart} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Checkout Footer */}
      <CheckoutFooter />
    </div>
  )
}