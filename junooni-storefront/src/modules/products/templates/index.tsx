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
import ColorFilteredImageGallery from "./color-filtered-image-gallery";
import ProductInfo from "@modules/products/templates/product-info";
import ProductActionsWrapper from "./product-actions-wrapper";
import ProductTabs from "@modules/products/components/product-tabs";
import RelatedProducts from "@modules/products/components/related-products";
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products";
import { Heart, Share2, ShieldCheck, Truck, RefreshCw, Clock, Check } from "lucide-react";

// Extend the StoreProduct type to include vendor information
type ExtendedStoreProduct = HttpTypes.StoreProduct & {
  vendor?: {
    id?: string;
    name?: string;
    handle?: string;
    logo?: string;
    verified?: string;
  };
};

type ProductTemplateProps = {
  product: ExtendedStoreProduct;
  region: HttpTypes.StoreRegion;
  countryCode: string;
};

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode
}) => {
  if (!product || !product.id) {
    return notFound();
  }

   //console.log('🔍 ProductTemplate - Full Product Object:', product);
    //console.log('🔍 ProductTemplate - Product Keys:', Object.keys(product));
  
  // Now this will work without TypeScript errors
  const extendedProduct = {
    ...product,
    vendor: product.vendor ?? {
      name: "",
      handle: "",
      logo: ""
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto">
        <div className="mb-10 overflow-hidden bg-white rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5">
            {/* Product Images Section with Color Filtering */}
            <div className="p-4 md:col-span-3">
              <Suspense fallback={<div className="h-[450px] bg-gray-100 animate-pulse rounded-lg"></div>}>
                <ColorFilteredImageGallery product={product} />
              </Suspense>
            </div>
            
            {/* Product Details Section */}
            <div className="p-4 md:p-8 md:col-span-2">
              {/* Vendor Info */}
              {extendedProduct.vendor && (
                <a 
                  href={`/creator/${extendedProduct.vendor.handle || "vendor"}`}
                  className="flex items-center mb-4 group"
                >
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
                      <h4 className="text-base font-medium group-hover:text-[#e65100] transition-colors">{extendedProduct.vendor.name || "Unknown Vendor"}</h4>
                      {extendedProduct.vendor?.verified === "Yes" && (
                        // <Check size={12} className="ml-1 text-orange-500" />
                            <svg
                              className="ml-2 inline-block align-middle"
                              width="18"
                              height="18"
                              viewBox="0 0 20 20"
                              preserveAspectRatio="xMidYMid meet"
                              aria-label="Verified"
                            >
                              {/* Verified badge shape (clean + symmetrical) */}
                              <path
                                fill="#e65100"
                                d="
                                  M10 0.8
                                  L12.2 2.2
                                  L14.9 1.9
                                  L16.1 4.4
                                  L18.6 5.6
                                  L17.9 8.3
                                  L19.2 10
                                  L17.9 11.7
                                  L18.6 14.4
                                  L16.1 15.6
                                  L14.9 18.1
                                  L12.2 17.8
                                  L10 19.2
                                  L7.8 17.8
                                  L5.1 18.1
                                  L3.9 15.6
                                  L1.4 14.4
                                  L2.1 11.7
                                  L0.8 10
                                  L2.1 8.3
                                  L1.4 5.6
                                  L3.9 4.4
                                  L5.1 1.9
                                  L7.8 2.2
                                  Z"
                              />

                              {/* Check */}
                              <path
                                d="M6.2 10.2l2.1 2.2 4.5-4.6"
                                fill="none"
                                stroke="white"
                                strokeWidth="1.9"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          
                      )}
                    </div>
                    <span className="block -mt-1 text-xs text-gray-500 group-hover:text-[#e65100] transition-colors">
                      @{extendedProduct.vendor.handle || "vendor"}
                    </span>
                  </div>
                </a>
              )}     
              
              {/* Product Info */}
              <Suspense fallback={<div className="h-20 mb-4 bg-gray-100 rounded animate-pulse"></div>}>
                <ProductInfo product={product} />
              </Suspense>
              
              {/* Product Actions */}
              <Suspense fallback={<div className="h-40 my-6 bg-gray-100 rounded animate-pulse"></div>}>
                <ProductActionsWrapper id={product.id} region={region} />
              </Suspense>
              
              {/* Shipping & Returns */}
              <div className="py-6 mb-6 border-t border-b">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex items-start">
                    <Truck size={18} className="text-[#e65100] mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Free Shipping</h4>
                      <p className="text-xs text-gray-600">Orders over Rs.200</p>
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
                      <h4 className="text-sm font-medium">Made for You</h4>
                      <p className="text-xs text-gray-600">Reduce carbon footprint</p>
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