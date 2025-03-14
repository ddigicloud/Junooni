'use client'

import React from 'react';
import { Heart, Eye } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination,Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
// import { listProducts } from '@lib/data/products';



const ProductSlider =  () => {



  const products = [
    {
      id: 1,
      name: "Asher Recycled Rings 4-in-1",
      price: 39.99,
      originalPrice: 39.99,
      image: "https://modavenextjs.vercel.app/images/products/jewelry/jewelry-1.jpg",
      colors: ['#D4BE91', '#C0C0C0', '#000000'],
      discount: 0
    },
    {
      id: 2,
      name: "Charm Recycled Small Hoop Earrings",
      price: 79.99,
      originalPrice: 98.00,
      image: "https://modavenextjs.vercel.app/images/products/jewelry/jewelry-3.jpg",
      colors: ['#D4BE91', '#C0C0C0', '#000000'],
      discount: 25
    },
    {
      id: 3,
      name: "Mia Amalfi Bracelet Gold",
      price: 129.99,
      originalPrice: 98.00,
      image: "https://modavenextjs.vercel.app/images/products/jewelry/jewelry-6.jpg",
      colors: ['#D4BE91', '#FFFFFF'],
      discount: 25
    },
    {
      id: 4,
      name: "Pilgrim Love Chain Bracelet Gold",
      price: 219.99,
      originalPrice: 98.00,
      image: "https://modavenextjs.vercel.app/images/products/jewelry/jewelry-8.jpg",
      colors: ['#D4BE91', '#000000'],
      discount: 25
    },
    {
      id: 5,
      name: "Pilgrim Care Recycled Semi-Hoop",
      price: 219.99,
      originalPrice: 98.00,
      image: "https://modavenextjs.vercel.app/images/products/jewelry/jewelry-11.jpg",
      colors: ['#D4BE91', '#000000'],
      discount: 25
    },
    {
      id: 6,
      name: "Charm Recycled Triangle Pendant",
      price: 79.99,
      originalPrice: 98.00,
      image: "https://modavenextjs.vercel.app/images/products/jewelry/jewelry-13.jpg",
      colors: ['#D4BE91', '#000000'],
      discount: 25
    },
    {
      id: 7,
      name: "Penelope Recycled Earrings",
      price: 219.99,
      originalPrice: 98.00,
      image: "https://modavenextjs.vercel.app/images/products/jewelry/jewelry-15.jpg",
      colors: ['#D4BE91', '#000000'],
      discount: 25
    },
    {
      id: 8,
      name: "Faux-leather trousers",
      price: 219.99,
      originalPrice: 98.00,
      image: "https://modavenextjs.vercel.app/images/products/jewelry/jewelry-17.jpg",
      colors: ['#D4BE91', '#000000'],
      discount: 25
    }
  ];

  return (
    <>
    <div className='flex flex-col items-center justify-center w-full gap-4 mb-8'>
    <h2 className='text-5xl'>Today's Top Picks</h2>
    <p className='text-lg'>Fresh styles just in! Elevate your look.</p>
    </div>
    <div className="relative w-full max-w-6xl px-4 pb-12 mx-auto">

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        loop={true}
        autoplay={{ 
          delay: 3000,
          disableOnInteraction: false 
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
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="relative p-2 mb-14 group">
              {product.discount > 0 && (
                <div className="absolute z-10 px-4 py-1 m-3 text-xs text-white bg-red-500 rounded-3xl">
                  -{product.discount}%
                </div>
              )}
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="object-cover w-full rounded-md aspect-square"
                />
                <div className="absolute flex flex-col gap-2 transition-opacity opacity-0 top-2 right-2 group-hover:opacity-100">
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm ">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold">${product.price}</span>
                  {product.originalPrice !== product.price && (
                    <span className="text-gray-500 line-through">${product.originalPrice}</span>
                  )}
                </div>
                {product.colors.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {product.colors.map((color, index) => (
                   
                      <div
                        key={index}
                        className="w-6 h-6 border border-gray-300 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                 
                     
                    ))}
                  </div>
                )}
                <button className="w-full py-2 mt-4 text-white transition-colors bg-black rounded-md hover:bg-gray-800">
                  Add to Cart
                </button>
              </div>        
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
    </>
  );
};

export default ProductSlider;

// import React, { Suspense } from "react";
// import RelatedProducts from "@modules/products/components/related-products";
// import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products";
// import { HttpTypes } from "@medusajs/types";

// type RelatedProductsSectionProps = {
//   product: HttpTypes.StoreProduct;
//   countryCode: string;
// };

// const RelatedProductsSection: React.FC<RelatedProductsSectionProps> = ({ product, countryCode }) => {
//   return (
//     <div
//       className="my-16 content-container small:my-32"
//       data-testid="related-products-container"
//     >
//       <Suspense fallback={<SkeletonRelatedProducts />}>
//         <RelatedProducts product={product} countryCode={countryCode} />
//       </Suspense>
//     </div>
//   );
// };

// export default RelatedProductsSection;
