import { useEffect, useState } from "react";
import ProductCard, { ProductCardSkeleton } from "./ProductCard"; // Import the ProductCard component
import Navbar from "./Navbar";

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
    <div className="w-[100%] max-w-[95%] mx-auto mt-24">
      <h1 className="mb-10 text-2xl font-semibold text-gray-900 dark:text-white">What would you like to create?</h1>
      {loading ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(5)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-3 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.length > 0 ? (
            products.map((product) => {
              const metadata = productMetadata[product.id] || {
                isBestSeller: false,
                isStaffPick: false,
                rating: 4.0,
                reviewCount: 0
              };
              
              return (
                <div key={product.id} className="relative w-[100%] max-w-[90%] mx-auto">
                  <ProductCard 
                    product={product} 
                    metadata={metadata}
                  />
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center col-span-full">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default Products;