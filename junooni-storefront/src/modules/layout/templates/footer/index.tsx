// import { listCategories } from "@lib/data/categories";
// import { Text,clx } from "@medusajs/ui";
// import LocalizedClientLink from "@modules/common/components/localized-client-link";
// import { listCollections } from "@lib/data/collections";
// // import { FaFacebookF } from "react-icons/fa";
// // import { FiLinkedin } from "react-icons/fi";
// // import { RxTwitterLogo } from "react-icons/rx";


// export default async function Footer() {
//   const productCategories = await listCategories();
//   const { collections } = await listCollections()
 

//   return (
//     <footer className="w-full border-t border-gray-200 bg-gray-50">
//       <div className="container px-6 py-16 mx-auto">
//         <div className="w-full">
          

//           {/* Help Center & Other Links */}
//           <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 md:grid-cols-5">

//           {productCategories?.length > 0 && (
//             <div>
//               <h3 className="mb-3 text-lg font-semibold text-gray-800">Categories</h3>
//               <ul className="flex flex-col mt-2 space-y-2 text-gray-600">
//                 {productCategories.map((c) => {
//                   if (c.parent_category) return null;
//                   const children = c.category_children || [];

//                   return (
//                     <li key={c.id}>
//                       <LocalizedClientLink
//                         className="text-base hover:text-black"
//                         href={`/categories/${c.handle}`}
//                       >
//                         {c.name}
//                       </LocalizedClientLink>
                     
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>
//           )}


//         {/* collection */}

//             {collections && collections.length > 0 && (
//               <div className="flex flex-col gap-y-2">
//                 <span className="text-lg font-semibold text-gray-800">
//                   Collections
//                 </span>
//                 <ul
//                   className={clx(
//                     "grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small",
                    
//                   )}
//                 >
//                   {collections.map((c) => (
//                     <li key={c.id}>
//                       <LocalizedClientLink
//                         className="text-base hover:text-ui-fg-base"
//                         href={`/collections/${c.handle}`}
//                       >
//                         {c.title}
//                       </LocalizedClientLink>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             <div>
//               <span className="text-lg font-semibold text-gray-800">Help Center</span>
//               <ul className="mt-2 space-y-2 text-gray-600">
//                 <li><LocalizedClientLink href="/faqs" className="text-base hover:text-black">FAQs</LocalizedClientLink></li>
//                 <li><LocalizedClientLink href="/orders-shipping" className="text-base hover:text-black">Orders & Shipping</LocalizedClientLink></li>
//                 <li><LocalizedClientLink href="/payment-methods" className="text-base hover:text-black">Payment Methods</LocalizedClientLink></li>
//                 <li><LocalizedClientLink href="/product-care" className="text-base hover:text-black">Product Care</LocalizedClientLink></li>
//                 <li><LocalizedClientLink href="/privacy-policy" className="text-base hover:text-black">Privacy Policy</LocalizedClientLink></li>
//                 <li><LocalizedClientLink href="/refund-exchange" className="text-base hover:text-black">Refund & Exchange Policy</LocalizedClientLink></li>
//               </ul>
//             </div>

            
//             <div>
//               <span className="text-lg font-semibold text-gray-800">Order Tracking</span>
//               <ul className="mt-2 space-y-2 text-gray-600">
//                 <li><LocalizedClientLink href="/track-order" className="text-base hover:text-black">Track by Order ID</LocalizedClientLink></li>
//                 <li><LocalizedClientLink href="/shipment-status" className="text-base hover:text-black">Shipment Status</LocalizedClientLink></li>
//               </ul>
//             </div>

//             <div className="pt-0 mt-2 text-center">
//               <p className="mb-4 text-sm text-gray-500 sm:text-base">
//                 Empower creators and discover unique products made with passion.
//               </p>
//               <div className="flex flex-col justify-center gap-3 sm:flex-row">
//                 <a 
//                   href="https://studio.junooni.com/" 
//                   className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 transform rounded-lg shadow-md bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:scale-105"
//                 >
//                   Join as a Creator
//                   <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                 </a>
//               </div>
//             </div>

//           </div>
//         </div>

//       </div>
      
//         {/* Footer Bottom */}
//         <div className="flex-col px-4 py-4 text-sm text-gray-600 border border-t md:flex-row">
//           <div className="flex justify-between mx-auto max-w-7xl">
//           <Text>© {new Date().getFullYear()} Junooni Store. All rights reserved.</Text>
//           <div className="flex gap-6 md:mt-0">
//             <LocalizedClientLink href="/privacy-policy" className="text-base hover:text-black">
//               Privacy Policy
//             </LocalizedClientLink>
//             <LocalizedClientLink href="/terms-condition" className="text-base hover:text-black">
//               Terms & Conditions
//             </LocalizedClientLink>
//           </div>
//           </div>
//         </div>
//     </footer>
//   );
// }

import { listCategories } from "@lib/data/categories";
import { Text, clx } from "@medusajs/ui";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { listCollections } from "@lib/data/collections";

export default async function Footer() {
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
          {/* <div className="flex gap-6 md:mt-0">
            <LocalizedClientLink href="/privacy-policy" className="text-base hover:text-orange-400">
              Privacy Policy
            </LocalizedClientLink>
            <LocalizedClientLink href="/terms-condition" className="text-base hover:text-orange-400">
              Terms & Conditions
            </LocalizedClientLink>
          </div> */}
        </div>
      </div>
    </footer>
  );
}

