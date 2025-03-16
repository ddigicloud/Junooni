"use client";

import { useEffect, useState } from "react";
import { HttpTypes } from "@medusajs/types";
import { Heart, Eye } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

export default function HomeFeatuedProducts() {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([]);
  const [region, setRegion] = useState<string | null>(null);

  // First, get the current region (if needed)
  useEffect(() => {
    const fetchRegion = async () => {
      try {
        const res = await fetch(`http://localhost:9000/store/regions`, {
          credentials: "include",
          headers: {
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "temp",
          },
        });
        const data = await res.json();
        console.log(data)
        if (data.regions && data.regions.length > 0) {
          setRegion(data.regions[0].id);
        }
      } catch (error) {
        console.error("Error fetching regions:", error);
      }
    };

    fetchRegion();
  }, []);

  // Debug state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Then fetch products with calculated prices
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
  
        // For initial debugging, let's try to fetch without complex query params
        const res = await fetch(
          `http://localhost:9000/store/products`,
          {
            credentials: "include",
            headers: {
              "x-publishable-api-key":
                process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "temp",
            },
          }
        );

        // Check if the response is OK
        if (!res.ok) {
          console.error("API Error:", res.status, res.statusText);
          throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
      
        
        if (!data.products || !Array.isArray(data.products)) {
          console.error("Invalid data format:", data);
          throw new Error("Invalid data format received from API");
        }

       
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Function to format price
  const formatPrice = (priceObj: any, currency: string = "USD") => {
    if (!priceObj) return "N/A";
    
    // Handle if priceObj is a complex object (BaseCalculatedPriceSet)
    let rawPrice;
    
    // If it's an object with an amount property
    if (typeof priceObj === 'object' && priceObj.amount !== undefined) {
      rawPrice = priceObj.amount;
    } 
    // If it's a direct number or string
    else if (typeof priceObj === 'number' || typeof priceObj === 'string') {
      rawPrice = priceObj;
    }
    // Default fallback
    else {
      return "N/A";
    }
    
    // Convert to number if it's a string
    const numPrice = typeof rawPrice === "string" ? parseFloat(rawPrice) : rawPrice;
    
    // Format with currency
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(numPrice / 100); // Medusa stores prices in cents
  };

  return (
    <div>
      <div className='flex flex-col items-center justify-center w-full gap-4 my-16'>
        <h2 className='text-5xl'>Today's Top Picks</h2>
        <p className='text-lg'>Fresh styles just in! Elevate your look.</p>
      </div>
      <div className="relative w-full max-w-6xl px-4 pb-12 mx-auto">
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          loop={products && products.length > 1}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          className="relative product-swiper"
        >
          {loading ? (
            <SwiperSlide>
              <div className="flex items-center justify-center h-64">
                <p>Loading products...</p>
              </div>
            </SwiperSlide>
          ) : error ? (
            <SwiperSlide>
              <div className="flex flex-col items-center justify-center h-64 p-4 text-red-500">
                <p className="font-bold">Error loading products</p>
                <p className="text-sm">{error}</p>
                <p className="mt-2 text-sm text-gray-600">Please check console for details</p>
              </div>
            </SwiperSlide>
          ) : products && products.length > 0 ? (
            products.map((product) => (
              <SwiperSlide key={product.id}>
                <div className="relative p-2 mb-14 group">
                  <div className="absolute z-10 px-4 py-1 m-3 text-xs text-white bg-red-500 rounded-3xl">
                    -25%
                  </div>

                  <div className="relative overflow-hidden rounded-md">
                    <LocalizedClientLink href={`/products/${product.handle}`}>
                      <div className="relative w-full h-[320px]">
                        <img
                          src={product.thumbnail || "/default-thumbnail.jpg"}
                          alt={product.title}
                          className="absolute inset-0 object-cover w-full h-full transition-opacity duration-300 opacity-100 group-hover:opacity-0"
                        />
                        {product.images?.[1] && (
                          <img
                            src={product.images[1]?.url}
                            alt={product.title}
                            className="absolute inset-0 object-cover w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                          />
                        )}
                      </div>
                    </LocalizedClientLink>
                    <div className="absolute bottom-0 flex justify-around w-full">
                      {product.options?.map((item) => {
                        if (item.title !== "Color") {
                          return (
                            <div
                              key={item.id}
                              className="flex justify-center w-full py-2 text-xs gap-4 text-white bg-[#000000b7] rounded-b-md"
                            >
                              {item.values?.map((sizeVal) => (
                                <p key={sizeVal.id}>{sizeVal.value}</p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <div className="absolute flex flex-col gap-2 transition-opacity opacity-0 top-2 right-2 group-hover:opacity-100">
                      <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                        <Heart className="w-5 h-5" />
                      </button>
                      <LocalizedClientLink href={`/products/${product.handle}`}>
                        <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                          <Eye className="w-5 h-5" />
                        </button>
                      </LocalizedClientLink>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <LocalizedClientLink href={`/products/${product.handle}`}>
                        <h3 className="text-base hover:text-red-800">{product.title}</h3>
                      </LocalizedClientLink>
                      <span className="text-base font-medium">
                        {/* Format and display the price properly */}
                        {product.variants && product.variants[0] ? 
                          formatPrice(product.variants[0].calculated_price) : "N/A"}
                      </span>
                    </div>
                  
                    <div className="flex gap-2 mt-2">
                        <div className="w-6 h-6 border border-gray-300 rounded-full outline-1 outline-black outline-double"/>
                        <div className="w-6 h-6 bg-black border border-gray-300 rounded-full"/>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <div className="flex items-center justify-center h-64">
                <p>No products found</p>
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </div>
    </div>
  );
}