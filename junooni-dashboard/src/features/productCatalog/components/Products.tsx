// import { useEffect, useState } from "react";
// import ProductCard, { ProductCardSkeleton } from "./ProductCard"; // Import the ProductCard component
// import Navbar from "./Navbar";
// import { useToast } from "@/hooks/use-toast";

// const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;

// // Define all the interfaces for our data types
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

// const Products = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [productMetadata, setProductMetadata] = useState<ProductMetadataMap>({});

//    const { toast } = useToast();
//     // Add this useEffect near the top of your component, right after your state declarations
//   useEffect(() => {
//     // Check if user is authenticated by looking for token
//     const token = localStorage.getItem('vendorToken');
    
//     // If no token is found, redirect to sign-in page
//     if (!token) {
//       // Show a toast notification
//       toast({
//         title: "Authentication Required",
//         description: "Please sign in to access your profile.",
//         variant: "destructive",
//       });
      
//       // Redirect to sign-in page
//       window.location.href = '/sign-in';
//       return;
//     }
//   }, []); // Empty dependency array means this runs once when component mounts
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
//     <>
//     <Navbar/>
//     <div className="w-[100%] max-w-[95%] mx-auto mt-24">
//       <h1 className="mb-10 text-2xl font-semibold text-gray-900 dark:text-white">What would you like to create?</h1>
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
//                 <div key={product.id} className="relative w-[100%] max-w-[90%] mx-auto">
//                   <ProductCard 
//                     product={product} 
//                     metadata={metadata}
//                   />
//                 </div>
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
//     </>
//   );
// };

// export default Products;

import { useEffect, useState } from "react";
import ProductCard, { ProductCardSkeleton } from "./ProductCard"; // Import the ProductCard component
import Navbar from "./Navbar";
import { useToast } from "@/hooks/use-toast";

const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;

// Define all the interfaces for our data types
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

// Define the state types
type ProductMetadataMap = Record<number, ProductMetadata>;

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [productMetadata, setProductMetadata] = useState<ProductMetadataMap>({});

   const { toast } = useToast();
    // Add this useEffect near the top of your component, right after your state declarations
  useEffect(() => {
    // Check if user is authenticated by looking for token
    const token = localStorage.getItem('vendorToken');
    
    // If no token is found, redirect to sign-in page
    if (!token) {
      // Show a toast notification
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your profile.",
        variant: "destructive",
      });
      
      // Redirect to sign-in page
      window.location.href = '/sign-in';
      return;
    }
  }, []); // Empty dependency array means this runs once when component mounts
  
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

  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          {/* Enhanced Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#e65100] to-[#ff7043] rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              What would you like to 
              <span className="bg-gradient-to-r from-[#e65100] to-[#ff7043] bg-clip-text text-transparent"> create</span>?
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our premium collection of customizable products. From apparel to accessories, bring your designs to life.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-[#e65100] mb-2">{products.length}+</div>
              <div className="text-gray-600">Premium Products</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-[#e65100] mb-2">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-[#e65100] mb-2">Fast</div>
              <div className="text-gray-600">Delivery</div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.length > 0 ? (
                products.map((product) => {
                  const metadata = productMetadata[product.id] || {
                    isBestSeller: false,
                    isStaffPick: false,
                    rating: 4.0,
                    reviewCount: 0
                  };
                  
                  return (
                    <div key={product.id} className="group">
                      <ProductCard 
                        product={product} 
                        metadata={metadata}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500">We're currently updating our catalog. Please check back soon!</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Call to Action Section */}
          {!loading && products.length > 0 && (
            <div className="mt-16 bg-gradient-to-r from-[#e65100] to-[#ff7043] rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-4">Ready to start creating?</h2>
              <p className="text-lg opacity-90 mb-6">Choose from our wide selection of premium products and bring your designs to life.</p>
              <button className="bg-white text-[#e65100] font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                Get Started Today
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Products;