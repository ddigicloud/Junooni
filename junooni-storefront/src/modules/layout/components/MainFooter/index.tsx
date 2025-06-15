'use client'

import { listCategories } from "@lib/data/categories";
import { Text, clx } from "@medusajs/ui";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { listCollections } from "@lib/data/collections";
import { useState, useEffect } from "react";
import NewsLetter from "@modules/home/components/NewsLetter";

// import { FaFacebookF } from "react-icons/fa";
// import { FiLinkedin } from "react-icons/fi";
// import { RxTwitterLogo } from "react-icons/rx";
// import CustomCollection from "./CustomCollection";


export default async function MainFooter() {
  const productCategories = await listCategories();

    const [collections, setCollections] = useState<any[]>([])
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchCollections = async () => {
        setLoading(true);
        const data = await listCollections();
        setCollections(data.collections);
        setLoading(false);
      };
  
      fetchCollections();
    }, []);
  
    console.log(collections)
  
    if (loading) return <p>Loading...</p>;

  return (
    <footer className="w-full border-t border-gray-200 bg-gray-50">
      <NewsLetter/>
      <div className="container px-6 py-16 mx-auto">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          {/* Logo & Socials */}
          {/* <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold tracking-wide">JUNOONI</h2>
            <div className="flex gap-4">
              <FiLinkedin className="text-xl text-gray-600 transition cursor-pointer hover:text-black" />
              <FaFacebookF className="text-xl text-gray-600 transition cursor-pointer hover:text-black" />
              <RxTwitterLogo className="text-xl text-gray-600 transition cursor-pointer hover:text-black" />
            </div>
          </div> */}

          {/* Help Center & Other Links */}
          <div className="grid grid-cols-1 gap-10 text-sm sm:grid-cols-3 md:grid-cols-5">

          {productCategories?.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-gray-800">Categories</h3>
              <ul className="flex flex-col mt-2 space-y-2 text-gray-600">
                {productCategories.slice(0, 6).map((c) => {
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
                      {children.length > 0 && (
                        <ul className="mt-1 ml-3 text-xs text-gray-600">
                          {children.map((child) => (
                            <li key={child.id}>
                              <LocalizedClientLink href={`/categories/${child.handle}`} className="hover:text-black">
                                {child.name}
                              </LocalizedClientLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
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
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="font-semibold text-gray-800">
                  Collections
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="text-sm hover:text-ui-fg-base"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
