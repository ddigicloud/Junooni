import { assets } from "@assets/assets";
import Image from "next/image";
import React from "react";

const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
const BACKEND_URL = process.env.MEDUSA_BACKEND_URL;


interface Vendor {
  vendor_id: string;
  vendor_name: string;
  logo: string;
}

const VendorCreator = async () => {
  const response = await fetch(`http://localhost:9000/vendors`, {
    headers: {
      publishable: PUBLISHABLE_API_KEY!,
    },
  });

  const vendorsArray = await response.json();
  const vendorsData: Vendor[] = vendorsArray.vendors;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 mx-auto">
        <h2 className="mb-10 text-3xl font-bold text-center">Featured Creators</h2>
        <div
          className="grid grid-cols-2 gap-4 overflow-x-auto md:grid-cols-3 lg:grid-cols-6 md:gap-6"
          style={{ scrollbarWidth: "none" }}
        >
          {vendorsData.map((vendor: Vendor) => {
            return (
              <a href="#" key={vendor.vendor_id} className="text-center group">
                <div className="relative flex items-center justify-center w-4/5 mx-auto mb-3 overflow-hidden bg-gray-100 rounded-full aspect-square">
                  {vendor.logo ? (
                    <Image
                      src={vendor.logo}
                      alt={vendor.vendor_name}
                      width={80}
                      height={80}
                      unoptimized={true} // Ensures external images load correctly
                      className="object-contain w-16 h-16"
                    />
                  ) : (
                    <Image
                      src={assets.vendor2} // Default fallback
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
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VendorCreator;
