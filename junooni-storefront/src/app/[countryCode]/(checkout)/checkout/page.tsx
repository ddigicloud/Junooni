import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Checkout",
}

// Checkout Footer Component (with UI from Footer)
const CheckoutFooter = async () => {
  const productCategories = await listCategories();
  const { collections } = await listCollections();

  return (
    <footer className="w-full text-white bg-black border-t border-gray-700">
      <div className="container px-6 py-16 mx-auto">
        <div className="w-full">
          {/* Help Center & Other Links */}
          <div className="grid grid-cols-1 gap-8 text-sm sm:grid-cols-2 md:grid-cols-5">
            {productCategories?.length > 0 && (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-white">Categories</h3>
                <ul className="flex flex-col mt-2 space-y-2 text-gray-300">
                  {productCategories.map((c) => {
                    if (c.parent_category) return null;
                    return (
                      <li key={c.id}>
                        <LocalizedClientLink
                          className="text-sm transition-colors hover:text-orange-400"
                          href={`/categories/${c.handle}`}
                        >
                          {c.name}
                        </LocalizedClientLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Collections */}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="text-lg font-semibold text-white">
                  Collections
                </span>
                <ul className={clx("grid grid-cols-1 gap-2 text-gray-300")}>
                  {collections.map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="text-sm transition-colors hover:text-orange-400"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Help Center */}
            <div>
              <span className="text-lg font-semibold text-white">Help Center</span>
              <ul className="mt-2 space-y-2 text-sm text-gray-300">
                <li><LocalizedClientLink href="/contact-us" className="text-base hover:text-orange-400">Contact us</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/support" className="text-base hover:text-orange-400">Support</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/orders-shipping" className="text-base hover:text-orange-400">Orders & Shipping</LocalizedClientLink></li>
              </ul>
            </div>

            <div>
              <span className="text-lg font-semibold text-white">Quick links</span>
              <ul className="mt-2 space-y-2 text-sm text-gray-300">
                <li><LocalizedClientLink href="/privacy-policy" className="text-base hover:text-orange-400">Privacy Policy</LocalizedClientLink></li>
                 <li><LocalizedClientLink href="/payment-methods" className="text-base hover:text-orange-400">Payment Methods</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/product-care" className="text-base hover:text-orange-400">Product Care</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/refund-exchange" className="text-base hover:text-orange-400">Refund & Exchange Policy</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/terms-condition" className="text-base hover:text-orange-400">Terms of Service</LocalizedClientLink></li>
              </ul>
            </div>

            {/* Call to Action */}
            <div className="pt-0 mt-0 text-center">
              <p className="mb-4 text-sm text-white sm:text-base">
                Have a passion for creating? Turn it into something bigger.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <a 
                  href="https://studio.junooni.com/" 
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 transform rounded-lg shadow-md bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:scale-105"
                >
                  Join as a Creator
                  <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="flex-col px-4 py-4 text-sm text-gray-400 border-t border-gray-700 md:flex-row">
        <div className="flex justify-center mx-auto max-w-7xl">
          <Text>© {new Date().getFullYear()} Junooni Store. All rights reserved.</Text>
        </div>
      </div>
    </footer>
  );
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
        <div className="container px-4 py-4 mx-auto lg:py-12">
          {/* Header */}
          {/* <div className="mb-8 text-center lg:mb-12">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 lg:text-4xl">
              Secure Checkout
            </h1>
            <p className="text-lg text-gray-600">
              Complete your order in a few simple steps
            </p>
          </div> */}

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