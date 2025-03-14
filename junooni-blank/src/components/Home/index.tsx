"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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

const MainHome = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [productMetadata, setProductMetadata] = useState<Record<number, {
    isBestSeller: boolean;
    isStaffPick: boolean;
    rating: number;
    reviewCount: number;
  }>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/blank-products");
        const data = await response.json();
        const fetchedProducts = data.docs || data;
        setProducts(fetchedProducts);
        
        // Generate metadata that would normally come from the API
        const metadata: Record<number, any> = {};
        
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

  // Function to render star ratings with half stars
  const renderStarRating = (product: Product) => {
    const metadata = productMetadata[product.id];
    if (!metadata) return null;
    
    const { rating, reviewCount } = metadata;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        <div className="flex mr-1">
          {[...Array(5)].map((_, i) => {
            if (i < fullStars) {
              return <span key={i} className="text-gray-800">★</span>;
            } else if (i === fullStars && hasHalfStar) {
              return <span key={i} className="text-gray-800">★</span>;
            } else {
              return <span key={i} className="text-gray-300">★</span>;
            }
          })}
        </div>
        <span className="text-sm text-gray-500">{reviewCount}</span>
      </div>
    );
  };

  // Function to format technology names for display
  const formatTechnologyName = (techName: string): string => {
    // Map of technology name abbreviations to their full display names
    const techDisplayNames: Record<string, string> = {
      'dtg': 'Direct to Garment',
      'dtf': 'Direct to Film',
      'screen': 'Screen Printing',
      'embroidery': 'Embroidered',
      'sublimation': 'Dye Sublimation',
      'vinyl': 'Vinyl',
      'laser': 'Laser Engraved',
      'uv': 'UV Printing'
    };
    
    // Return the display name if it exists, otherwise return the capitalized technology name
    if (techDisplayNames[techName.toLowerCase()]) {
      return techDisplayNames[techName.toLowerCase()];
    }
    
    // Handle special cases for common abbreviations
    if (techName.toLowerCase() === 'dtg') return 'DTG';
    if (techName.toLowerCase() === 'dtf') return 'DTF';
    if (techName.toLowerCase() === 'uv') return 'UV';
    
    // Otherwise capitalize the first letter of each word
    return techName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Function to get production options from the product's printing technologies
  const getProductionOptions = (product: Product): string[] => {
    // If the product has printing technologies, use those
    if (product.printingTechnologies && product.printingTechnologies.length > 0) {
      // Map over the printing technologies and format their names
      return product.printingTechnologies.map(tech => 
        // For simplicity in this demo, we'll just use shortened display names
        tech.technologyName.toUpperCase()
      );
    }
    
    // Fallback to a default if no printing technologies are specified
    return ["Printed"];
  };

  return (
    <div className="container p-6 mx-auto">
      <h1 className="mb-10 text-5xl font-bold text-gray-900">What would you like to create?</h1>

      {loading ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <Skeleton className="w-full h-64 mb-3" />
              <Skeleton className="w-1/2 h-4 mb-2" />
              <Skeleton className="w-3/4 h-6 mb-2" />
              <Skeleton className="w-1/3 h-4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {products.length > 0 ? (
            products.map((product) => {
              const metadata = productMetadata[product.id] || {
                isBestSeller: false,
                isStaffPick: false,
                rating: 4.0,
                reviewCount: 0
              };
              
              const productionOptions = getProductionOptions(product);
              const additionalColors = Math.max(0, product.colorOptions.length - 4);
              
              return (
                <div key={product.id} className="relative">
                  {/* Product badges */}
                  <div className="absolute top-2 left-2 z-10 flex gap-1.5">
                    {metadata.isBestSeller && (
                      <span className="px-2 py-0.5 text-xs font-medium text-white bg-black rounded-full">
                        Best seller
                      </span>
                    )}
                    {metadata.isStaffPick && (
                      <span className="px-2 py-0.5 text-xs font-medium text-white bg-gray-600 rounded-full">
                        Staff pick
                      </span>
                    )}
                  </div>

                  {/* Product Image with light gray background */}
                  <div className="w-full h-64 mb-3 bg-gray-100">
                    {product.displayImages?.length > 0 ? (
                      <img
                        src={product.displayImages[0].image.url}
                        alt={product.displayImages[0].image.alt}
                        className="object-cover object-center w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">No Image</p>
                      </div>
                    )}
                  </div>

                  {/* Product model/SKU number */}
                  <div className="mb-1 text-sm text-gray-500">
                    {product.brand} {product.sku}
                  </div>

                  {/* Product Name */}
                  <h3 className="mb-1 text-base font-medium text-gray-900 capitalize">
                    {product.name}
                  </h3>

                  {/* Star Rating */}
                  {renderStarRating(product)}

                  {/* Production Options - Now using actual printing technologies */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {productionOptions.map((option, i) => (
                      <span 
                        key={i} 
                        className="px-3 py-1 text-xs text-gray-700 bg-white border border-gray-200 rounded-full"
                      >
                        {option}
                      </span>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm">From ${product.cost.toFixed(2)}</span> 
                    <span className="text-sm text-gray-500">no minimum</span>
                  </div>

                  {/* Color Options */}
                  <div className="flex items-center gap-1 mt-3">
                    {product.colorOptions.slice(0, 4).map((color, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 border border-gray-300 rounded-full"
                        style={{ 
                          backgroundColor: color.colorHex,
                          border: color.colorHex.toLowerCase() === '#ffffff' ? '1px solid #e5e7eb' : 'none'
                        }}
                      />
                    ))}
                    {additionalColors > 0 && (
                      <span className="text-sm text-gray-500">
                        +{additionalColors}
                      </span>
                    )}
                  </div>
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
  );
};

export default MainHome;