// import React, { Suspense } from "react";
// import ImageGallery from "@modules/products/components/image-gallery";
// import ProductActions from "@modules/products/components/product-actions";
// import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta";
// import ProductTabs from "@modules/products/components/product-tabs";
// import RelatedProducts from "@modules/products/components/related-products";
// import ProductInfo from "@modules/products/templates/product-info";
// import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products";
// import { notFound } from "next/navigation";
// import ProductActionsWrapper from "./product-actions-wrapper";
// import { HttpTypes } from "@medusajs/types";

// type ProductTemplateProps = {
//   product: HttpTypes.StoreProduct;
//   region: HttpTypes.StoreRegion;
//   countryCode: string;
// };

// const ProductTemplate: React.FC<ProductTemplateProps> = ({
//   product,
//   region,
//   countryCode,
// }) => {
//   if (!product || !product.id) {
//     return notFound();
//   }

//   return (
//     <>
//       <div
//         className="relative flex flex-col gap-10 py-6 mt-20 content-container small:flex-row small:items-start"
//         data-testid="product-container"
//       >
//         <div className="relative block w-full">
//           <ImageGallery images={product?.images || []} />
//         </div>
//         <div className="flex flex-col w-full py-8 small:top-48 small:py-0 gap-y-6">
          
//           <ProductInfo product={product} />
          
//           <div className="flex flex-col w-full py-8 small:top-48 small:py-0 gap-y-12">
//           <ProductOnboardingCta />
//           <Suspense
//             fallback={
//               <ProductActions disabled={true} product={product} region={region} />
//             }
//           >
//             <ProductActionsWrapper id={product.id} region={region} />
//           </Suspense>
//         </div>
//         <ProductTabs product={product} />
//         </div>
        
        
//       </div>
//       <div
//         className="my-16 content-container small:my-32"
//         data-testid="related-products-container"
//       >
//         <Suspense fallback={<SkeletonRelatedProducts />}>
//           <RelatedProducts product={product} countryCode={countryCode} />
//         </Suspense>
//       </div>
//     </>
//   );
// };

// export default ProductTemplate;

import React, { Suspense } from "react";
import { HttpTypes } from "@medusajs/types";
import { notFound } from "next/navigation";
import ProductImageGallery from "@modules/products/components/image-gallery";
import ProductInfo from "@modules/products/templates/product-info";
import ProductActionsWrapper from "./product-actions-wrapper";
import ProductTabs from "@modules/products/components/product-tabs";
import RelatedProducts from "@modules/products/components/related-products";
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products";
import { Heart, Share2, ShieldCheck, Truck, RefreshCw, Clock } from "lucide-react";
import { Product } from "@medusajs/js-sdk/dist/admin/product";



type ProductTemplateProps = {
  product: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion;
  countryCode: string;
};

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode
}
) => {
  if (!product || !product.id) {
    return notFound();
  }

  const extendedProduct = {
    ...product,
    vendor: product.vendor ?? {
      name: "Junooni",
      handle: "junooni",
      logo: "" // Replace with actual Junooni logo if available
    }
  } as HttpTypes.StoreProduct & {
    vendor: {
      name: string
      handle: string
      logo: string
    }
  }

  console.log("Product Template - Extended Product:", extendedProduct);
  
  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto ">
        <div className="mb-10 overflow-hidden bg-white rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Product Images Section */}
            <div className="p-4">
              <Suspense fallback={<div className="h-[450px] bg-gray-100 animate-pulse rounded-lg"></div>}>
                <ProductImageGallery images={product.images || []} />
              </Suspense>
            </div>
            
            {/* Product Details Section */}
            <div className="p-4 md:p-8">
              {/* Hardcoded Creator Info */}
              {/* Vendor Info */}
              {extendedProduct.vendor && (
              <div className="flex items-center mb-4">
                {extendedProduct.vendor.logo ? (
                  <img 
                    src={extendedProduct.vendor.logo} 
                    alt={extendedProduct.vendor.name || "Vendor"} 
                    className="object-cover w-8 h-8 mr-2 rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 mr-2 text-white bg-[#e65100] rounded-full text-sm font-semibold uppercase">
                    {extendedProduct.vendor.name?.slice(0, 1) || "V"}
                  </div>
                )}
                <div className="leading-tight">
                  <div className="flex items-center -mt-1">
                    <h4 className="text-sm font-medium">{extendedProduct.vendor.name || "Unknown Vendor"}</h4>
                    <span className="ml-1 text-[#e65100]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <span className="block -mt-1 text-xs text-gray-500">@{extendedProduct.vendor.handle || "vendor"}</span>
                </div>
              </div>
            )}
              
              {/* Product Info */}
              <Suspense fallback={<div className="h-20 mb-4 bg-gray-100 rounded animate-pulse"></div>}>
                <ProductInfo product={product} />
              </Suspense>
              
              {/* Product Actions */}
              <Suspense fallback={<div className="h-40 my-6 bg-gray-100 rounded animate-pulse"></div>}>
                <ProductActionsWrapper id={product.id} region={region} />
              </Suspense>
              
              

              {/* Social Buttons */}
              {/* <div className="flex gap-2 mt-4 mb-6">
                <button className="w-12 h-12 border border-gray-300 rounded-md flex items-center justify-center text-gray-700 hover:border-[#e65100] hover:text-[#e65100] transition">
                  <Heart size={20} />
                </button>
                <button className="w-12 h-12 border border-gray-300 rounded-md flex items-center justify-center text-gray-700 hover:border-[#e65100] hover:text-[#e65100] transition">
                  <Share2 size={20} />
                </button>
              </div> */}
              
              {/* Shipping & Returns */}
              <div className="py-6 mb-6 border-t border-b">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex items-start">
                    <Truck size={18} className="text-[#e65100] mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Free Shipping</h4>
                      <p className="text-xs text-gray-600">Orders over $100</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock size={18} className="text-[#e65100] mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Delivery Time</h4>
                      <p className="text-xs text-gray-600">5-7 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <RefreshCw size={18} className="text-[#e65100] mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Easy Returns</h4>
                      <p className="text-xs text-gray-600">30 days return policy</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Authenticity Guarantee */}
              <div className="flex items-center p-3 mb-6 rounded-md bg-gray-50">
                <ShieldCheck size={20} className="text-[#e65100] mr-2" />
                <div>
                  <p className="text-sm font-medium">Authenticity Guaranteed</p>
                  <p className="text-xs text-gray-600">Official merchandise verified by our team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <div className="mb-10">
          <Suspense fallback={<div className="bg-gray-100 rounded h-60 animate-pulse"></div>}>
            <ProductTabs product={product} />
          </Suspense>
        </div>
        
       

        {/* Related Products */}
        <div className="mb-12">
          <Suspense fallback={<SkeletonRelatedProducts />}>
            <RelatedProducts product={product} countryCode={countryCode} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default ProductTemplate;