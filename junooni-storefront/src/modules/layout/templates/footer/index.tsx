import { listCategories } from "@lib/data/categories";
import { Text,clx } from "@medusajs/ui";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { listCollections } from "@lib/data/collections";
// import { FaFacebookF } from "react-icons/fa";
// import { FiLinkedin } from "react-icons/fi";
// import { RxTwitterLogo } from "react-icons/rx";


import Newsletter from "@modules/layout/components/Newsletter";

export default async function Footer() {
  const productCategories = await listCategories();
  const { collections } = await listCollections()
 

  return (
    <footer className="w-full border-t border-gray-200 bg-gray-50">
      <div className="container px-6 py-16 mx-auto">
        <div className="w-full">
          

          {/* Help Center & Other Links */}
          <div className="grid grid-cols-1 gap-10 text-sm sm:grid-cols-2 md:grid-cols-5">

          {productCategories?.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-gray-800">Categories</h3>
              <ul className="flex flex-col mt-2 space-y-2 text-gray-600">
                {productCategories.map((c) => {
                  if (c.parent_category) return null;
                  const children = c.category_children || [];

                  return (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-black"
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


        {/* collection */}

            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  Collections
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small",
                    
                  )}
                >
                  {collections.map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <span className="font-semibold text-gray-800">Help Center</span>
              <ul className="mt-2 space-y-2 text-gray-600">
                <li><LocalizedClientLink href="/faqs" className="hover:text-black">FAQs</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/orders-shipping" className="hover:text-black">Orders & Shipping</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/payment-methods" className="hover:text-black">Payment Methods</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/product-care" className="hover:text-black">Product Care</LocalizedClientLink></li>
              </ul>
            </div>

           

          
            
            <div>
              <span className="font-semibold text-gray-800">Order Tracking</span>
              <ul className="mt-2 space-y-2 text-gray-600">
                <li><LocalizedClientLink href="/track-order" className="hover:text-black">Track by Order ID</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/shipment-status" className="hover:text-black">Shipment Status</LocalizedClientLink></li>
              </ul>
            </div>

            <div>
              <span className="font-semibold text-gray-800">Size Guide</span>
              <ul className="mt-2 space-y-2 text-gray-600">
                <li><LocalizedClientLink href="/size-guide" className="hover:text-black">Apparel Sizing Charts</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/measurement-tips" className="hover:text-black">Tips for Accurate Measurements</LocalizedClientLink></li>
              </ul>
            </div>
          </div>
        </div>

      </div>
      
        {/* Footer Bottom */}
        <div className="flex-col px-4 py-4 text-sm text-gray-600 border border-t md:flex-row">
          <div className="flex justify-between mx-auto max-w-7xl">
          <Text>© {new Date().getFullYear()} Junooni Store. All rights reserved.</Text>
          <div className="flex gap-6 md:mt-0">
            <LocalizedClientLink href="/privacy-policy" className="hover:text-black">
              Privacy Policy
            </LocalizedClientLink>
            <LocalizedClientLink href="/terms-conditions" className="hover:text-black">
              Terms & Conditions
            </LocalizedClientLink>
          </div>
          </div>
        </div>
    </footer>
  );
}
