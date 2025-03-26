"use client";  // Ensures this is a Client Component

import { assets } from "@assets/assets";
import Image from "next/image";
import React, { useEffect, useState } from "react";
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

interface Vendor {
  id: string;
  name: string;
  logo: string;
  handle:string;
}

const VendorList: React.FC = () => {
  const [vendorsData, setVendorsData] = useState<Vendor[] | null>(null);
  const skeletonCount = 6; // Number of skeleton items to show

  useEffect(() => {
    const fetchVendors = async () => {
      const data = await retriveVendors();
      setVendorsData(data ?? []);
    };

    fetchVendors();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold">Featured Creators</h2>
          <div className="hidden space-x-2 md:flex">
            <button className="p-2 bg-white rounded-full shadow-md vendor-swiper-prev hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button className="p-2 bg-white rounded-full shadow-md vendor-swiper-next hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
        
        {vendorsData === null ? (
          // Skeleton loader for Swiper
          <Swiper
            slidesPerView={1}
            spaceBetween={16}
            navigation={{
              prevEl: '.vendor-swiper-prev',
              nextEl: '.vendor-swiper-next'
            }}
            pagination={{
              el: '.vendor-swiper-pagination',
              clickable: true,
              enabled: true,
              dynamicBullets: true,
              dynamicMainBullets: 3
            }}
            breakpoints={{
              425:{slidesPerView: 2, spaceBetween: 10 },
              640: { slidesPerView: 3, spaceBetween: 20 },
              768: { slidesPerView: 4, spaceBetween: 24 },
              1024: { slidesPerView: 5, spaceBetween: 24 },
            }}
            modules={[Pagination, Navigation]}
            className="vendor-swiper"
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
        ) : vendorsData.length > 0 ? (
          // Actual vendor data in Swiper
          <Swiper
            slidesPerView={1}
            spaceBetween={16}
            navigation={{
              prevEl: '.vendor-swiper-prev',
              nextEl: '.vendor-swiper-next'
            }}
            pagination={{
              el: '.vendor-swiper-pagination',
              clickable: true,
              enabled: true,
              dynamicBullets: true,
              dynamicMainBullets: 3
            }}
            breakpoints={{
              425:{slidesPerView: 2, spaceBetween: 10 },
              640: { slidesPerView: 3, spaceBetween: 20 },
              768: { slidesPerView: 4, spaceBetween: 24 },
              1024: { slidesPerView: 5, spaceBetween: 24 },
            }}
            modules={[Pagination, Navigation]}
            className="vendor-swiper"
          >
            {vendorsData.map((vendor) => (
              <SwiperSlide key={vendor.id}>
                <a href="#" className="block text-center group">
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
                      <Link href={`/creator/${vendor.handle}`}>
                      <span className="px-4 py-2 text-xs font-medium text-white bg-black bg-opacity-50 rounded-full">
                        View Shop
                      </span>
                      </Link>
                    </div>
                  </div>
                  <h3 className="font-medium text-md">{vendor.name}</h3>
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-center text-gray-500">No vendors available</p>
        )}
        
        {/* Pagination dots container - will be hidden on desktop */}
        <div className="flex justify-center mt-6 vendor-swiper-pagination md:hidden"></div>
      </div>
      
      {/* Add custom styling for pagination dots */}
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