// import { useEffect, useState } from "react";
// import ProductCard, { ProductCardSkeleton } from "./ProductCard"; // Import the new component

// const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;

// // Define interfaces - ideally these would be in a separate types file
// interface Image {
//   id: number;
//   alt: string;
//   url: string;
//   width: number;
//   height: number;
// }

// interface DisplayImage {
//   id: string;
//   title: string | null;
//   image: Image;
//   caption: string | null;
// }

// interface ColorOption {
//   id: string;
//   colorName: string;
//   colorHex: string;
// }

// interface SizeOption {
//   id: string;
//   sizeName: string;
//   sizeDescription: string | null;
// }

// interface PrintingTechnology {
//   id: string;
//   technologyName: string;
//   customizationAreas: any[];
//   mockupPhotos: any[];
// }

// interface Product {
//   id: number;
//   name: string;
//   cost: number;
//   sku: string;
//   brand: string;
//   displayImages: DisplayImage[];
//   colorOptions: ColorOption[];
//   sizeOptions: SizeOption[];
//   printingTechnologies: PrintingTechnology[];
// }

// interface ProductMetadata {
//   isBestSeller: boolean;
//   isStaffPick: boolean;
//   rating: number;
//   reviewCount: number;
// }

// // Define the state types
// type ProductMetadataMap = Record<number, ProductMetadata>;

// const Catalog = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [productMetadata, setProductMetadata] = useState<ProductMetadataMap>({});
//   // const router = useRouter();

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await fetch(`${vite_payload}/api/blank-products`, {
//           credentials: 'include',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });
//         const data = await response.json();
//         const fetchedProducts: Product[] = data.docs || data;
//         setProducts(fetchedProducts);
        
//         // Generate metadata that would normally come from the API
//         const metadata: ProductMetadataMap = {};
        
//         fetchedProducts.forEach((product: Product) => {
//           metadata[product.id] = {
//             isBestSeller: Math.random() > 0.3,
//             isStaffPick: Math.random() > 0.6,
//             rating: 3.5 + Math.random() * 1.5,
//             reviewCount: Math.floor(10 + Math.random() * 140)
//           };
//         });
        
//         setProductMetadata(metadata);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProducts();
//   }, []);

//   return (
//     <div className="w-[100%] max-w-[95%] mx-auto mt-24">
//       <h1 className="mb-10 text-2xl font-semibold text-gray-900 dark:text-white">
//         What would you like to create?
//       </h1>
//       {loading ? (
//         <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//           {[...Array(5)].map((_, i) => (
//             <ProductCardSkeleton key={i} />
//           ))}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-x-3 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//           {products.length > 0 ? (
//             products.map((product) => {
//               const metadata = productMetadata[product.id] || {
//                 isBestSeller: false,
//                 isStaffPick: false,
//                 rating: 4.0,
//                 reviewCount: 0
//               };
              
//               return (
//                 <ProductCard 
//                   key={product.id} 
//                   product={product} 
//                   metadata={metadata} 
//                 />
//               );
//             })
//           ) : (
//             <div className="py-8 text-center col-span-full">
//               <p className="text-gray-500">No products found</p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Catalog;

import { useEffect, useState } from "react";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";

const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;

// Define interfaces - ideally these would be in a separate types file
interface Image {
  id: number;
  alt: string;
  url: string;
  width: number;
  height: number;
}

interface DisplayImage {
  id: string;
  title: string | null;
  image: Image;
  caption: string | null;
}

interface ColorOption {
  id: string;
  colorName: string;
  colorHex: string;
}

interface SizeOption {
  id: string;
  sizeName: string;
  sizeDescription: string | null;
}

interface PrintingTechnology {
  id: string;
  technologyName: string;
  customizationAreas: any[];
  mockupPhotos: any[];
}

interface Product {
  id: number;
  name: string;
  cost: number;
  sku: string;
  brand: string;
  displayImages: DisplayImage[];
  colorOptions: ColorOption[];
  sizeOptions: SizeOption[];
  printingTechnologies: PrintingTechnology[];
}

interface ProductMetadata {
  isBestSeller: boolean;
  isStaffPick: boolean;
  rating: number;
  reviewCount: number;
}

type ProductMetadataMap = Record<number, ProductMetadata>;

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [productMetadata, setProductMetadata] = useState<ProductMetadataMap>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${vite_payload}/api/blank-products`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        const fetchedProducts: Product[] = data.docs || data;
        setProducts(fetchedProducts);
        
        // Generate metadata that would normally come from the API
        const metadata: ProductMetadataMap = {};
        
        fetchedProducts.forEach((product: Product) => {
          metadata[product.id] = {
            isBestSeller: Math.random() > 0.3,
            isStaffPick: Math.random() > 0.6,
            rating: 3.5 + Math.random() * 1.5,
            reviewCount: Math.floor(10 + Math.random() * 140)
          };
        });
        
        setProductMetadata(metadata);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ["all", "apparel", "accessories", "home", "promotional"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#e65100] to-[#ff9800] opacity-5"></div>
        <div className="relative px-4 pt-20 pb-16 mx-auto mt-8 max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-3xl lg:text-5xl dark:text-white">
              Build Your Vision
              <span className="block text-[#e65100] text-2xl md:text-3xl lg:text-3xl font-medium mt-2">
                Choose from Premium Products
              </span>
            </h1>
            <p className="max-w-3xl mx-auto mb-8 text-lg text-gray-600 dark:text-gray-300">
              Transform your ideas into reality with our curated collection of high-quality blank products, 
              perfect for customization and branding.
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="p-3 bg-white border border-gray-200 shadow-xl dark:bg-gray-800 rounded-2xl dark:border-gray-700">
              <div className="flex flex-col gap-4 lg:flex-row">
                {/* Search Input */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e65100] focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="lg:w-64">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#e65100] focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="px-4 pb-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Stats Bar */}
        <div className="flex flex-col items-start justify-between p-6 mb-8 bg-white border border-gray-200 shadow-sm sm:flex-row sm:items-center dark:bg-gray-800 rounded-xl dark:border-gray-700">
          <div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
              Product Catalog
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {loading ? 'Loading...' : `${filteredProducts.length} products available`}
            </p>
          </div>
          
          {/* {!loading && (
            <div className="flex gap-4 mt-4 sm:mt-0">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-3 h-3 bg-[#e65100] rounded-full"></div>
                <span>Best Sellers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Staff Picks</span>
              </div>
            </div>
          )} */}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 rounded-xl">
                  <div className="w-full h-64 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-6">
                    <div className="h-4 mb-3 bg-gray-200 rounded dark:bg-gray-700"></div>
                    <div className="w-2/3 h-3 mb-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                    <div className="w-1/3 h-6 bg-gray-200 rounded dark:bg-gray-700"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => {
                  const metadata = productMetadata[product.id] || {
                    isBestSeller: false,
                    isStaffPick: false,
                    rating: 4.0,
                    reviewCount: 0
                  };
                  
                  return (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      metadata={metadata} 
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full dark:bg-gray-800">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-medium text-gray-900 dark:text-white">
                    No products found
                  </h3>
                  <p className="mb-6 text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria
                  </p>
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-[#e65100] hover:bg-[#d84315] transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}

            {/* Load More Button (if needed) */}
            {filteredProducts.length > 0 && filteredProducts.length >= 12 && (
              <div className="mt-12 text-center">
                <button className="inline-flex items-center px-8 py-4 border-2 border-[#e65100] text-[#e65100] font-semibold rounded-xl hover:bg-[#e65100] hover:text-white transition-all duration-200 transform hover:scale-105">
                  <span>Load More Products</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Catalog;