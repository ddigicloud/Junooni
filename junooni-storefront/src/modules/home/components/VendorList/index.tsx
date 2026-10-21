"use client";

import { assets } from "@assets/assets";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

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

// ─── VendorCard ───────────────────────────────────────────────────────────────
function VendorCard({ vendor, index }: { vendor: Vendor; index: number }) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/creator/${vendor.handle}`);
  };

  return (
    <Link
      href={`/creator/${vendor.handle}`}
      prefetch={true}
      onClick={handleClick}
      className="relative block w-full text-center group"
    >
      {/* Square image with rounded corners */}
      <div
        className="relative w-full mx-auto mb-3 overflow-hidden bg-gray-200 rounded-sm shadow-sm transition-all duration-300 group-hover:shadow-md"
        style={{ paddingBottom: "100%" }}
      >
        <div className="absolute inset-0">
          {vendor.logo ? (
            <Image
              src={vendor.logo}
              alt={vendor.name}
              fill
              sizes="(max-width: 640px) 75vw, (max-width: 1024px) 25vw, 20vw"
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
        </div>
      </div>

      <div className="bg-gray-100 rounded-b-xl px-3 pt-3 pb-3">
        {/* Name */}
        <h3 className="font-semibold text-sm text-start mb-0.5 truncate">{vendor.name}</h3>

        {/* Role / bio — single line */}
        <p className="text-xs text-gray-500 text-start mb-3" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "3rem", lineHeight: "1rem" }}>{vendor.creator_bio}</p>

        {/* View Store button */}
        <button className="flex items-center gap-1.5 px-4 h-10 text-sm font-medium border border-gray-300 rounded-lg hover:border-[#e65100] transition-colors bg-white" style={{ color: "#e65100" }}>
          View Store <ArrowRight size={14} />
        </button>
      </div>
    </Link>
  );
}

// ─── VendorList ───────────────────────────────────────────────────────────────
const VendorList: React.FC<VendorListProps> = ({ vendorsList }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const featuredVendors = vendorsList.filter(isFeaturedVendor);

  if (featuredVendors.length === 0) {
    return (
      <section className="relative py-20 bg-white">
        <div className="container px-4 mx-auto sm:px-5">
          <div className="flex items-center justify-between mb-8">
            <p className="text-2xl sm:text-4xl font-bold tracking-tight">Featured creators</p>
          </div>
          <div className="py-12 text-center">
            <h3 className="mb-2 text-lg font-medium text-gray-900">No Featured Creators</h3>
            <p className="max-w-md mx-auto text-gray-500">
              There are currently no featured creators to display. Check back later!
            </p>
            <Link
              href="/creators"
              prefetch={true}
              className="inline-flex items-center px-4 py-2 mt-4 text-white transition-colors bg-black rounded-lg hover:bg-gray-800"
            >
              View All Creators <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 sm:py-20 bg-gray-50">
      <div className="mx-auto sm:px-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6 px-4 sm:px-0">
          <p className="text-2xl sm:text-4xl font-bold tracking-tight">Featured creators</p>
          <Link
            href="/creators"
            prefetch={true}
            className="flex items-center font-medium text-black transition-colors group hover:text-gray-700"
          >
            <span className="text-sm sm:text-base border-b border-transparent group-hover:border-current">
              View all
            </span>
            <ArrowRight
              size={14}
              className="ml-1 sm:ml-2 sm:w-[18px] sm:h-[18px] transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* ── Desktop grid (≥ sm) ── */}
        <div className="hidden sm:grid gap-4" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
          {featuredVendors.slice(0, 5).map((vendor, i) => (
            <VendorCard key={vendor.id} vendor={vendor} index={i} />
          ))}
        </div>

        {/* ── Mobile carousel (< sm) ── */}
        <div className="sm:hidden">
          {mounted ? (
            <div
              className="vendor-swiper-container"
              style={{ overflow: "hidden", paddingLeft: "16px" }}
            >
              <Swiper
                modules={[Pagination]}
                slidesPerView={1.35}
                spaceBetween={14}
                breakpoints={{
                  375: { slidesPerView: 1.35, spaceBetween: 14 },
                  425: { slidesPerView: 1.6,  spaceBetween: 14 },
                  500: { slidesPerView: 2.1,  spaceBetween: 16 },
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                  dynamicMainBullets: 3,
                }}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                style={{ overflow: "visible", paddingBottom: "40px" } as React.CSSProperties}
              >
                {featuredVendors.map((vendor, index) => (
                  <SwiperSlide key={vendor.id}>
                    <VendorCard vendor={vendor} index={index} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            /* SSR fallback: 2-col grid until Swiper hydrates */
            <div className="px-4 grid grid-cols-2 gap-3">
              {featuredVendors.slice(0, 2).map((vendor, i) => (
                <VendorCard key={vendor.id} vendor={vendor} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        /* Dots rendered inside Swiper — must target .swiper-pagination inside the container */
        .vendor-swiper-container .swiper-pagination {
          bottom: 4px;
          left: 0 !important;
          width: 100% !important;
          text-align: center;
        }
        .vendor-swiper-container .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #ccc;
          opacity: 0.5;
          margin: 0 4px !important;
        }
        .vendor-swiper-container .swiper-pagination-bullet-active {
          opacity: 1;
          background: #333;
        }
      `}</style>
    </section>
  );
};

export default VendorList;