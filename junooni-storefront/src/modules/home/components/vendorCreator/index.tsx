"use client";  // 👈 Ensures this is a Client Component

import { assets } from "@assets/assets";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { retriveVendors } from "@lib/data/vendors";

interface Vendor {
  vendor_id: string;
  vendor_name: string;
  logo: string;
}

const VendorCreator: React.FC = () => {
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
        <h2 className="mb-10 text-3xl font-bold text-center">Featured Creators</h2>
        <div
          className="grid grid-cols-2 gap-4 overflow-x-auto md:grid-cols-3 lg:grid-cols-6 md:gap-6"
          style={{ scrollbarWidth: "none" }}
        >
          {/* ✅ Show Skeleton Loader while fetching data */}
          {vendorsData === null
            ? Array.from({ length: skeletonCount }).map((_, index) => (
                <div key={index} className="animate-pulse text-center">
                  <div className="w-4/5 mx-auto mb-3 bg-gray-300 rounded-full aspect-square"></div>
                  <div className="h-4 mx-auto bg-gray-300 rounded w-3/4"></div>
                </div>
              ))
            : vendorsData.length > 0
            ? vendorsData.map((vendor) => (
                <a href="#" key={vendor.vendor_id} className="text-center group">
                  <div className="relative flex items-center justify-center w-4/5 mx-auto mb-3 overflow-hidden bg-gray-100 rounded-full aspect-square">
                    {vendor.logo ? (
                      <Image
                        src={vendor.logo}
                        alt={vendor.vendor_name}
                        width={80}
                        height={80}
                        unoptimized={true}
                        className="object-contain w-16 h-16"
                      />
                    ) : (
                      <Image
                        src={assets.vendor2}
                        alt="Default Vendor"
                        width={80}
                        height={80}
                        className="object-contain w-1/2 h-1/2"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black opacity-0 bg-opacity-20 group-hover:opacity-100">
                      <span className="px-4 py-2 text-xs font-medium text-white bg-black bg-opacity-50 rounded-full">
                        View Shop
                      </span>
                    </div>
                  </div>
                  <h3 className="font-medium text-md">{vendor.vendor_name}</h3>
                </a>
              ))
            : (
                <p className="text-center text-gray-500">No vendors available</p>
              )}
        </div>
      </div>
    </section>
  );
};

export default VendorCreator;
