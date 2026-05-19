// "use client";

// import { assets } from "@assets/assets";
// import Image from "next/image";
// import React, { useRef, useEffect, useState } from "react";
// import Link from "next/link";
// import { ArrowRight } from "lucide-react";

// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/pagination";
// import "swiper/css/navigation";
// import { Pagination, Navigation } from "swiper/modules";
// import type { Swiper as SwiperType } from "swiper";

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface Vendor {
//   id: string;
//   name: string;
//   logo: string;
//   handle: string;
//   creator_bio?: string;
//   metafield?: { featured_vendor?: boolean | string; [key: string]: any };
//   metadata?: { featured_vendor?: boolean | string; [key: string]: any };
//   featured_vendor?: boolean | string;
//   metafields?: { featured_vendor?: boolean | string; [key: string]: any };
// }

// interface VendorListProps {
//   vendorsList: Vendor[];
// }

// // ─── Helper ───────────────────────────────────────────────────────────────────
// const isFeaturedVendor = (vendor: Vendor): boolean => {
//   const val =
//     vendor.metafield?.featured_vendor ??
//     vendor.metadata?.featured_vendor ??
//     vendor.featured_vendor ??
//     vendor.metafields?.featured_vendor;
//   if (typeof val === "string") return val.toLowerCase() === "true";
//   return !!val;
// };

// // ─── Swiper breakpoints ───────────────────────────────────────────────────────
// const SWIPER_BREAKPOINTS = {
//   375: { slidesPerView: 1.3, spaceBetween: 12 },
//   425: { slidesPerView: 1.5, spaceBetween: 10 },
//   640: { slidesPerView: 3, spaceBetween: 20 },
//   768: { slidesPerView: 4, spaceBetween: 24 },
//   1024: { slidesPerView: 5, spaceBetween: 24 },
// };

// // ─── Vendor Card — extracted so skeleton and real card share the same dimensions
// function VendorCard({ vendor, index }: { vendor: Vendor; index: number }) {
//   return (
//     <Link href={`/creator/${vendor.handle}`} className="relative block w-full text-center group">
//       <div
//         className="relative w-full mx-auto mb-3 overflow-hidden transition-all duration-300 bg-gray-100 shadow-sm group-hover:shadow-md"
//         style={{ paddingBottom: "100%" }}
//       >
//         <div className="absolute inset-0">
//           {vendor.logo ? (
//             <Image
//               src={vendor.logo}
//               alt={vendor.name}
//               fill
//               sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
//               priority={index < 3}
//               loading={index < 3 ? "eager" : "lazy"}
//               className="object-cover transition-transform duration-300 group-hover:scale-105"
//             />
//           ) : (
//             <div className="flex items-center justify-center h-full">
//               <Image
//                 src={assets.vendor2}
//                 alt="Default Vendor"
//                 width={80}
//                 height={80}
//                 className="object-contain w-1/2 h-1/2"
//               />
//             </div>
//           )}
//           <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black opacity-0 bg-opacity-20 group-hover:opacity-100">
//             <span className="px-4 py-2 text-xs font-medium text-white bg-black bg-opacity-50 rounded-full">
//               View Shop
//             </span>
//           </div>
//         </div>
//       </div>
//       <h3 className="font-medium text-md text-start">{vendor.name}</h3>
//       <p className="text-sm text-start line-clamp-4">{vendor.creator_bio}</p>
//     </Link>
//   );
// }

// // ─── Static skeleton shown before JS hydrates — matches exact Swiper layout ──
// // Renders a plain CSS grid that looks identical to the first frame of Swiper.
// // No JS, no Swiper — zero CLS.
// function VendorSkeleton({ vendors }: { vendors: Vendor[] }) {
//   return (
//     // Match the same responsive columns as Swiper breakpoints
//     // 1.2 items visible by default → show 1 with a peek of next
//     <div className="flex gap-4 overflow-hidden">
//       {vendors.slice(0, 5).map((vendor, index) => (
//         <div
//           key={vendor.id}
//           className="flex-shrink-0"
//           style={{
//             // Match slidesPerView widths exactly — same calc as Swiper uses
//             width: "calc(100% / 1.2 - 16px / 1.2)",
//           }}
//         >
//           <VendorCard vendor={vendor} index={index} />
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─── Component ────────────────────────────────────────────────────────────────
// const VendorList: React.FC<VendorListProps> = ({ vendorsList }) => {
//   const swiperRef = useRef<SwiperType | null>(null);

//   // Mount gate: render static skeleton on SSR + first paint,
//   // swap to Swiper only after client JS is running.
//   // This eliminates the pre-hydration flash entirely — there is no Swiper
//   // to misbehave before JS runs, only a plain CSS flex row.
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => { setMounted(true); }, []);

//   const featuredVendors = vendorsList.filter(isFeaturedVendor);

//   // ─── Empty state ────────────────────────────────────────────────────────────
//   if (featuredVendors.length === 0) {
//     return (
//       <section className="relative py-20 bg-gray-50">
//         <div className="container px-2 mx-auto sm:px-5">
//           <div className="flex items-center justify-between mb-8">
//             <p className="text-4xl font-bold tracking-tight">Featured creators</p>
//           </div>
//           <div className="py-12 text-center">
//             <div className="mb-4">
//               <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                   d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
//               </svg>
//             </div>
//             <h3 className="mb-2 text-lg font-medium text-gray-900">No Featured Creators</h3>
//             <p className="max-w-md mx-auto text-gray-500">
//               There are currently no featured creators to display. Check back later!
//             </p>
//             <Link href="/creators" className="inline-flex items-center px-4 py-2 mt-4 text-white transition-colors bg-black rounded-lg hover:bg-gray-800">
//               View All Creators <ArrowRight size={16} className="ml-2" />
//             </Link>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   // ─── Main render ─────────────────────────────────────────────────────────────
//   return (
//     <section className="relative py-20 bg-gray-50">
//       <div className="container px-2 mx-auto sm:px-5">
//         <div className="flex items-center justify-between mb-8">
//           <p className="text-4xl font-bold tracking-tight">Featured creators</p>
//           <Link href="/creators" className="flex items-center font-medium text-black transition-colors group hover:text-gray-700">
//             <span className="border-b border-transparent group-hover:border-current">View all</span>
//             <ArrowRight size={18} className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
//           </Link>
//         </div>

//         <div className="relative -mx-2 overflow-hidden sm:mx-0">
//           <div className="px-2 sm:px-0">

//             {!mounted ? (
//               // ── SSR + first paint: plain CSS flex, no Swiper, no CLS ──────────
//               <VendorSkeleton vendors={featuredVendors} />
//             ) : (
//               // ── After hydration: real Swiper with full interactivity ──────────
//               <Swiper
//                 slidesPerView={1.2}
//                 spaceBetween={16}
//                 navigation={{
//                   prevEl: ".vendor-swiper-prev",
//                   nextEl: ".vendor-swiper-next",
//                   enabled: true,
//                 }}
//                 pagination={{
//                   el: ".vendor-swiper-pagination",
//                   clickable: true,
//                   enabled: true,
//                   dynamicBullets: true,
//                   dynamicMainBullets: 3,
//                 }}
//                 breakpoints={SWIPER_BREAKPOINTS}
//                 modules={[Pagination, Navigation]}
//                 className="vendor-swiper"
//                 watchOverflow={false}
//                 allowTouchMove={true}
//                 onSwiper={(swiper) => { swiperRef.current = swiper; }}
//               >
//                 {featuredVendors.map((vendor, index) => (
//                   <SwiperSlide key={vendor.id}>
//                     <VendorCard vendor={vendor} index={index} />
//                   </SwiperSlide>
//                 ))}
//               </Swiper>
//             )}

//             {/* Navigation arrows — only visible after mount when Swiper is active */}
//             {mounted && featuredVendors.length > 1 && (
//               <>
//                 <button
//                   className="vendor-swiper-prev absolute -left-6 z-30 p-2 ml-2 transform -translate-y-1/2 bg-white rounded-full shadow-md hover:bg-gray-100 top-[42%]"
//                   type="button"
//                   onClick={() => swiperRef.current?.slidePrev()}
//                   aria-label="Previous creators"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
//                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
//                     <polyline points="15 18 9 12 15 6" />
//                   </svg>
//                 </button>
//                 <button
//                   className="vendor-swiper-next absolute z-30 p-2 mr-2 transform -translate-y-1/2 bg-white rounded-full shadow-md -right-6 hover:bg-gray-100 top-[42%]"
//                   type="button"
//                   onClick={() => swiperRef.current?.slideNext()}
//                   aria-label="Next creators"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
//                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
//                     <polyline points="9 18 15 12 9 6" />
//                   </svg>
//                 </button>
//               </>
//             )}
//           </div>
//         </div>

//         <div className="flex justify-center mt-6 vendor-swiper-pagination md:hidden" />
//       </div>

//       <style jsx global>{`
//         .vendor-swiper {
//           overflow: visible !important;
//         }
//         @media (max-width: 640px) {
//           .vendor-swiper { padding-right: 24px; }
//           .vendor-swiper .swiper-wrapper { padding-right: 20px; }
//         }
//         .vendor-swiper-pagination {
//           width: 100%;
//           max-width: 90%;
//           margin: auto;
//           transform: none;
//           margin-top: 2rem;
//         }
//         .vendor-swiper-pagination .swiper-pagination-bullet {
//           width: 8px;
//           height: 8px;
//           background: #ccc;
//           opacity: 0.5;
//           margin: 0 4px;
//         }
//         .vendor-swiper-pagination .swiper-pagination-bullet-active {
//           opacity: 1;
//           background: #333;
//         }
//         @media (min-width: 768px) {
//           .vendor-swiper-pagination { display: none; }
//         }
//       `}</style>
//     </section>
//   );
// };

// export default VendorList;

"use client";

import { assets } from "@assets/assets";
import Image from "next/image";
import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Vendor {
  id: string;
  name: string;
  logo: string;
  handle: string;
  creator_bio?: string;
  metafield?: { featured_vendor?: boolean | string; [key: string]: any };
  metadata?: { featured_vendor?: boolean | string; [key: string]: any };
  featured_vendor?: boolean | string;
  metafields?: { featured_vendor?: boolean | string; [key: string]: any };
}

interface VendorListProps {
  vendorsList: Vendor[];
}

const isFeaturedVendor = (vendor: Vendor): boolean => {
  const val =
    vendor.metafield?.featured_vendor ??
    vendor.metadata?.featured_vendor ??
    vendor.featured_vendor ??
    vendor.metafields?.featured_vendor;
  if (typeof val === "string") return val.toLowerCase() === "true";
  return !!val;
};

const SWIPER_BREAKPOINTS = {
  375: { slidesPerView: 1.3, spaceBetween: 12 },
  425: { slidesPerView: 1.5, spaceBetween: 10 },
  640: { slidesPerView: 3, spaceBetween: 20 },
  768: { slidesPerView: 4, spaceBetween: 24 },
  1024: { slidesPerView: 5, spaceBetween: 24 },
};

// ─── VendorCard ───────────────────────────────────────────────────────────────
// KEY FIX: Uses router.push on click so the URL changes INSTANTLY
// (triggering the loading.tsx skeleton) before the server responds.
// Link href with prefetch={true} preloads the page on hover.
function VendorCard({ vendor, index }: { vendor: Vendor; index: number }) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Instantly push the URL — loading.tsx shows immediately
    // Server fetch happens in the background
    router.push(`/creator/${vendor.handle}`);
  };

  return (
    <Link
      href={`/creator/${vendor.handle}`}
      prefetch={true}               // preloads on hover
      onClick={handleClick}         // instant URL change on click
      className="relative block w-full text-center group"
    >
      <div
        className="relative w-full mx-auto mb-3 overflow-hidden transition-all duration-300 bg-gray-100 shadow-sm group-hover:shadow-md"
        style={{ paddingBottom: "100%" }}
      >
        <div className="absolute inset-0">
          {vendor.logo ? (
            <Image
              src={vendor.logo}
              alt={vendor.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              priority={index < 3}
              loading={index < 3 ? "eager" : "lazy"}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Image
                src={assets.vendor2}
                alt="Default Vendor"
                width={80}
                height={80}
                className="object-contain w-1/2 h-1/2"
              />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black opacity-0 bg-opacity-20 group-hover:opacity-100">
            <span className="px-4 py-2 text-xs font-medium text-white bg-black bg-opacity-50 rounded-full">
              View Shop
            </span>
          </div>
        </div>
      </div>
      <h3 className="font-medium text-md text-start">{vendor.name}</h3>
      <p className="text-sm text-start line-clamp-4">{vendor.creator_bio}</p>
    </Link>
  );
}

function VendorSkeleton({ vendors }: { vendors: Vendor[] }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {vendors.slice(0, 5).map((vendor, index) => (
        <div
          key={vendor.id}
          className="flex-shrink-0"
          style={{ width: "calc(100% / 1.2 - 16px / 1.2)" }}
        >
          <VendorCard vendor={vendor} index={index} />
        </div>
      ))}
    </div>
  );
}

// ─── VendorList ───────────────────────────────────────────────────────────────
const VendorList: React.FC<VendorListProps> = ({ vendorsList }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const featuredVendors = vendorsList.filter(isFeaturedVendor);

  if (featuredVendors.length === 0) {
    return (
      <section className="relative py-20 bg-gray-50">
        <div className="container px-2 mx-auto sm:px-5">
          <div className="flex items-center justify-between mb-8">
            <p className="text-4xl font-bold tracking-tight">Featured creators</p>
          </div>
          <div className="py-12 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">No Featured Creators</h3>
            <p className="max-w-md mx-auto text-gray-500">
              There are currently no featured creators to display. Check back later!
            </p>
            <Link href="/creators" prefetch={true} className="inline-flex items-center px-4 py-2 mt-4 text-white transition-colors bg-black rounded-lg hover:bg-gray-800">
              View All Creators <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 bg-gray-50">
      <div className="container px-2 mx-auto sm:px-5">
        <div className="flex items-center justify-between mb-8">
          <p className="text-4xl font-bold tracking-tight">Featured creators</p>
          <Link href="/creators" prefetch={true} className="flex items-center font-medium text-black transition-colors group hover:text-gray-700">
            <span className="border-b border-transparent group-hover:border-current">View all</span>
            <ArrowRight size={18} className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="relative -mx-2 overflow-hidden sm:mx-0">
          <div className="px-2 sm:px-0">
            {!mounted ? (
              <VendorSkeleton vendors={featuredVendors} />
            ) : (
              <Swiper
                slidesPerView={1.2}
                spaceBetween={16}
                navigation={{
                  prevEl: ".vendor-swiper-prev",
                  nextEl: ".vendor-swiper-next",
                  enabled: true,
                }}
                pagination={{
                  el: ".vendor-swiper-pagination",
                  clickable: true,
                  enabled: true,
                  dynamicBullets: true,
                  dynamicMainBullets: 3,
                }}
                breakpoints={SWIPER_BREAKPOINTS}
                modules={[Pagination, Navigation]}
                className="vendor-swiper"
                watchOverflow={false}
                allowTouchMove={true}
                onSwiper={(swiper) => { swiperRef.current = swiper; }}
              >
                {featuredVendors.map((vendor, index) => (
                  <SwiperSlide key={vendor.id}>
                    <VendorCard vendor={vendor} index={index} />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            {mounted && featuredVendors.length > 1 && (
              <>
                <button
                  className="vendor-swiper-prev absolute -left-6 z-30 p-2 ml-2 transform -translate-y-1/2 bg-white rounded-full shadow-md hover:bg-gray-100 top-[42%]"
                  type="button"
                  onClick={() => swiperRef.current?.slidePrev()}
                  aria-label="Previous creators"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  className="vendor-swiper-next absolute z-30 p-2 mr-2 transform -translate-y-1/2 bg-white rounded-full shadow-md -right-6 hover:bg-gray-100 top-[42%]"
                  type="button"
                  onClick={() => swiperRef.current?.slideNext()}
                  aria-label="Next creators"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-6 vendor-swiper-pagination md:hidden" />
      </div>

      <style jsx global>{`
        .vendor-swiper { overflow: visible !important; }
        @media (max-width: 640px) {
          .vendor-swiper { padding-right: 24px; }
          .vendor-swiper .swiper-wrapper { padding-right: 20px; }
        }
        .vendor-swiper-pagination {
          width: 100%; max-width: 90%; margin: auto;
          transform: none; margin-top: 2rem;
        }
        .vendor-swiper-pagination .swiper-pagination-bullet {
          width: 8px; height: 8px; background: #ccc; opacity: 0.5; margin: 0 4px;
        }
        .vendor-swiper-pagination .swiper-pagination-bullet-active {
          opacity: 1; background: #333;
        }
        @media (min-width: 768px) { .vendor-swiper-pagination { display: none; } }
      `}</style>
    </section>
  );
};

export default VendorList;