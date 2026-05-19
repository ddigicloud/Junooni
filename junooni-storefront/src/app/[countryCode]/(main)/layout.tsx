import { Metadata } from "next"
import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { NavProvider } from "@modules/layout/templates/nav/NavContext"
import ClientNavContainer from "@modules/layout/templates/nav/ClientNavContainer"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"
import { ToastContainer } from "react-toastify"
import JsonLd from "./components/JsonLd"   // 👈 add this

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

// 👇 Add these two schemas
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Junooni",
  "url": "https://junooni.com/in",
  "logo": "https://studio.junooni.com/assets/junooni_logo_brand_color-FiOJAWKM.png",
  "description": "India's #1 creator merchandise marketplace. Buy exclusive custom merch from your favourite creators.",
  "sameAs": [
    "https://www.instagram.com/bejunooni?utm_source=qr&igsh=YmI4eTJhazMxMHo0",  // update with your real handles
    "https://www.facebook.com/p/Junooni-61577994639087/"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "support@junooni.com"   // update with real email
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Junooni",
  "url": "https://junooni.com/in",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://junooni.com/in/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

export default async function PageLayout(props: { children: React.ReactNode }) {
  const customer = await retrieveCustomer()
  const cart = await retrieveCart()
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()
    shippingOptions = shipping_options
  }

  return (
    <>
      {/* 👇 Add both schemas — renders in <head> automatically in App Router */}
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />

      <NavProvider>
        <ClientNavContainer>
          <Nav />
        </ClientNavContainer>
      </NavProvider>
     
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}
      {props.children}
      <Footer />
      <ToastContainer/>
    </>
  )
}