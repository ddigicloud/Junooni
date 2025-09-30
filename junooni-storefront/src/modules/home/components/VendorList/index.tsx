"use client";  // Ensures this is a Client Component

import { assets } from "@assets/assets";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { retriveVendors } from "@lib/data/vendors";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
// Import required modules
import { Pagination, Navigation } from "swiper/modules";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Updated interface to include metafield
interface Vendor {
  id: string;
  name: string;
  logo: string;
  handle: string;
  metafield?: {
    featured_vendor?: boolean;
    [key: string]: any; // Allow other metafield properties
  };
  metadata?: {
    featured_vendor?: boolean;
    [key: string]: any; // Alternative structure
  };
  featured_vendor?: boolean; // Direct property (alternative structure)
}

const VendorList: React.FC = () => {
  const [vendorsData, setVendorsData] = useState<Vendor[] | null>(null);
  const [featuredVendors, setFeaturedVendors] = useState<Vendor[] | null>(null);
  const swiperRef = useRef<any>(null);
  const skeletonCount = 6; // Number of skeleton items to show

  // Helper function to check if vendor is featured
  const isFeaturedVendor = (vendor: Vendor): boolean => {
    // Check multiple possible locations for featured_vendor flag
    return !!(
      vendor.metafield?.featured_vendor ||
      vendor.metadata?.featured_vendor ||
      vendor.featured_vendor ||
      (vendor as any).featured_vendor === true ||
      (vendor as any).metafields?.featured_vendor === true
    );
  };

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        console.log('🔍 Fetching vendors...');
        const data = await retriveVendors();
        console.log('📊 Raw vendors data:', data);
        
        if (data && Array.isArray(data)) {
          setVendorsData(data);
          
          // Filter for featured vendors only
          const featured = data.filter(vendor => {
            const isFeatured = isFeaturedVendor(vendor);
            console.log(`🏷️ Vendor "${vendor.name}" featured status:`, {
              isFeatured,
              metafield: vendor.metafield,
              metadata: vendor.metadata,
              direct: vendor.featured_vendor
            });
            return isFeatured;
          });
          
          console.log('⭐ Featured vendors found:', featured.length);
          console.log('⭐ Featured vendors:', featured);
          setFeaturedVendors(featured);
        } else {
          console.log('❌ No vendor data received or invalid format');
          setVendorsData([]);
          setFeaturedVendors([]);
        }
      } catch (error) {
        console.error('❌ Error fetching vendors:', error);
        setVendorsData([]);
        setFeaturedVendors([]);
      }
    };

    fetchVendors();
  }, []);

  // Use featured vendors for display instead of all vendors
  const displayVendors = featuredVendors;

  console.log('🎬 Display vendors:', displayVendors);

  return (
    <section className="relative py-20 bg-gray-50">
      <div className="container px-2 mx-auto sm:px-5">
        <div className="flex items-center justify-between mb-8">
          <p className="text-4xl font-bold tracking-tight">Featured creators</p>
          <Link 
            href={'/ourcreators'} 
            className="flex items-center font-medium text-black transition-colors group hover:text-gray-700"
          >
            <span className="border-b border-transparent group-hover:border-current">View all</span>
            <ArrowRight size={18} className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
        
        {/* Mobile-specific container with overflow handling */}
        <div className="relative -mx-2 overflow-hidden sm:mx-0">
          <div className="px-2 sm:px-0">
            {displayVendors === null ? (
              // Skeleton loader for Swiper
              <Swiper
                slidesPerView={1.2}
                spaceBetween={16}
                navigation={{
                  prevEl: '.vendor-swiper-prev',
                  nextEl: '.vendor-swiper-next',
                  enabled: true,
                }}
                pagination={{
                  el: '.vendor-swiper-pagination',
                  clickable: true,
                  enabled: true,
                  dynamicBullets: true,
                  dynamicMainBullets: 3
                }}
                breakpoints={{
                  375: { slidesPerView: 1.3, spaceBetween: 12 },
                  425: { slidesPerView: 1.5, spaceBetween: 10 },
                  640: { slidesPerView: 3, spaceBetween: 20 },
                  768: { slidesPerView: 4, spaceBetween: 24 },
                  1024: { slidesPerView: 5, spaceBetween: 24 },
                }}
                modules={[Pagination, Navigation]}
                className="vendor-swiper"
                watchOverflow={false}
                allowTouchMove={true}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
              >
                {Array.from({ length: skeletonCount }).map((_, index) => (
                  <SwiperSlide key={index}>
                    <div className="text-center animate-pulse">
                      <div className="w-full mx-auto mb-3 bg-gray-300 rounded-lg aspect-square"></div>
                      <div className="w-3/4 h-4 mx-auto bg-gray-300"></div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : displayVendors.length > 0 ? (
              // Featured vendors data in Swiper
              <Swiper
                slidesPerView={1.2}
                spaceBetween={16}
                navigation={{
                  prevEl: '.vendor-swiper-prev',
                  nextEl: '.vendor-swiper-next',
                  enabled: true,
                }}
                pagination={{
                  el: '.vendor-swiper-pagination',
                  clickable: true,
                  enabled: true,
                  dynamicBullets: true,
                  dynamicMainBullets: 3
                }}
                breakpoints={{
                  375: { slidesPerView: 1.3, spaceBetween: 12 },
                  425: { slidesPerView: 1.5, spaceBetween: 10 },
                  640: { slidesPerView: 3, spaceBetween: 20 },
                  768: { slidesPerView: 4, spaceBetween: 24 },
                  1024: { slidesPerView: 5, spaceBetween: 24 },
                }}
                modules={[Pagination, Navigation]}
                className="vendor-swiper"
                watchOverflow={false}
                allowTouchMove={true}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
              >
                {displayVendors.map((vendor) => (
                  <SwiperSlide key={vendor.id}>
                    <Link href={`/creator/${vendor.handle}`} className="relative block text-center group">
                      <div className="relative w-full mx-auto mb-3 overflow-hidden transition-all duration-300 bg-gray-100 shadow-sm aspect-square group-hover:shadow-md">
                        {vendor.logo ? (
                          <Image
                            src={vendor.logo}
                            alt={vendor.name}
                            fill
                            unoptimized={true}
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
                      <h3 className="font-medium text-md text-start">{vendor.name}</h3>
                      <p className="text-sm text-start">{(vendor as any).creator_bio}</p>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              // No featured vendors message
              <div className="py-12 text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">No Featured Creators</h3>
                <p className="max-w-md mx-auto text-gray-500">
                  There are currently no featured creators to display. Check back later for amazing featured content!
                </p>
                <Link 
                  href="/ourcreators" 
                  className="inline-flex items-center px-4 py-2 mt-4 text-white transition-colors bg-black rounded-lg hover:bg-gray-800"
                >
                  View All Creators
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            )}
            
            {/* Navigation buttons - only show if we have featured vendors */}
            {displayVendors && displayVendors.length > 1 && (
              <>
                {/* Left navigation button positioned at left-middle */}
                <button 
                  className="vendor-swiper-prev absolute -left-6 z-30 p-2 ml-2 transform -translate-y-1/2 bg-white rounded-full shadow-md hover:bg-gray-100 top-[42%]"
                  type="button"
                  onClick={() => swiperRef.current?.slidePrev()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                
                {/* Right navigation button positioned at right-middle */}
                <button 
                  className="vendor-swiper-next absolute z-30 p-2 mr-2 transform -translate-y-1/2 bg-white rounded-full shadow-md -right-6 hover:bg-gray-100 top-[42%]"
                  type="button"
                  onClick={() => swiperRef.current?.slideNext()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Pagination dots container - will be hidden on desktop, only show if we have vendors */}
        {displayVendors && displayVendors.length > 0 && (
          <div className="flex justify-center mt-6 vendor-swiper-pagination md:hidden"></div>
        )}
      </div>
      
      {/* Add custom styling for pagination dots and mobile-specific overflow */}
      <style jsx global>{`
        .vendor-swiper-pagination {
           width:100%;
           max-width:90%;
           margin:auto;
           transform:none;
           margin-top:2rem;
        }
          
        .vendor-swiper-pagination .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #ccc;
          opacity: 0.5;
          margin: 0 4px;
        }
        
        .vendor-swiper-pagination .swiper-pagination-bullet-active {
          opacity: 1;
          background: #333;
        }
        
        .vendor-swiper {
          overflow: visible !important;
        }
        
        /* Mobile-specific styles for peek effect */
        @media (max-width: 640px) {
          .vendor-swiper {
            padding-right: 24px;
          }
          
          .vendor-swiper .swiper-wrapper {
            padding-right: 20px;
          }
        }
        
        @media (min-width: 768px) {
          .vendor-swiper-pagination {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default VendorList;