// import { useRouter } from "@tanstack/react-router";
// import { Skeleton } from "@/components/ui/skeleton";

// // ENVIRONMENT VARIABLE - You'll need to ensure this is accessible in this component
// const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;

// // Define interfaces - these could alternatively be imported from a types file
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

// interface ProductCardProps {
//   product: Product;
//   metadata: ProductMetadata;
// }

// const ProductCard = ({ product, metadata }: ProductCardProps) => {
//   const router = useRouter();
  
//   // Function to handle product click - intelligently determines proper route based on current path
//   const handleProductClick = () => {
//     const currentPath = router.state.location.pathname;
//     router.navigate({
//           to: `/${currentPath}/${product.id}`
//         })
  
//     // Store the product in sessionStorage for retrieval
//     sessionStorage.setItem(`product_${product.id}`, JSON.stringify(product));
//   };

//   // Function to render star ratings with half stars
//   const renderStarRating = () => {
//     const { rating, reviewCount } = metadata;
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;
    
//     return (
//       <div className="flex items-center">
//         <div className="flex mr-1">
//           {[...Array(5)].map((_, i) => {
//             if (i < fullStars) {
//               return <span key={i} className="text-gray-800">★</span>;
//             } else if (i === fullStars && hasHalfStar) {
//               return <span key={i} className="text-gray-800">★</span>;
//             } else {
//               return <span key={i} className="text-gray-300">★</span>;
//             }
//           })}
//         </div>
//         <span className="text-sm text-gray-500">{reviewCount}</span>
//       </div>
//     );
//   };

//   // Function to format technology names for display
//   const formatTechnologyName = (techName: string): string => {
//     // Map of technology name abbreviations to their full display names
//     const techDisplayNames: Record<string, string> = {
//       'dtg': 'Direct to Garment',
//       'dtf': 'Direct to Film',
//       'screen': 'Screen Printing',
//       'embroidery': 'Embroidered',
//       'sublimation': 'Dye Sublimation',
//       'vinyl': 'Vinyl',
//       'laser': 'Laser Engraved',
//       'uv': 'UV Printing'
//     };
    
//     // Return the display name if it exists, otherwise return the capitalized technology name
//     if (techDisplayNames[techName.toLowerCase()]) {
//       return techDisplayNames[techName.toLowerCase()];
//     }
    
//     // Handle special cases for common abbreviations
//     if (techName.toLowerCase() === 'dtg') return 'DTG';
//     if (techName.toLowerCase() === 'dtf') return 'DTF';
//     if (techName.toLowerCase() === 'uv') return 'UV';
    
//     // Otherwise capitalize the first letter of each word
//     return techName
//       .split(' ')
//       .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//       .join(' ');
//   };

//   // Function to get production options from the product's printing technologies
//   const getProductionOptions = (): string[] => {
//     // If the product has printing technologies, use those
//     if (product.printingTechnologies && product.printingTechnologies.length > 0) {
//       // Map over the printing technologies and format their names
//       return product.printingTechnologies.map(tech => 
//         formatTechnologyName(tech.technologyName)
//       );
//     }
    
//     // Fallback to a default if no printing technologies are specified
//     return ["Printed"];
//   };

//   const productionOptions = getProductionOptions();
//   const additionalColors = Math.max(0, product.colorOptions.length - 4);

//   return (
//     <div className="relative w-[100%] max-w-[90%] mx-auto">
//       {/* Product badges */}
//       <div className="absolute top-2 left-2 z-10 flex gap-1.5">
//         {metadata.isBestSeller && (
//           <span className="px-2 py-0.5 text-xs font-medium text-white bg-black rounded-full">
//             Best seller
//           </span>
//         )}
//         {metadata.isStaffPick && (
//           <span className="px-2 py-0.5 text-xs font-medium text-white bg-gray-600 rounded-full">
//             Staff pick
//           </span>
//         )}
//       </div>

//       {/* Product Image with light gray background */}
//       <div 
//         className="w-full h-64 mb-3 bg-gray-100 cursor-pointer" 
//         onClick={handleProductClick}
//       >
//         {product.displayImages?.length > 0 ? (
//           <img
//             src={`${vite_payload}/${product.displayImages[0].image.url}`}
//             alt={product.displayImages[0].image.alt}
//             className="object-cover object-center w-full h-full"
//           />
//         ) : (
//           <div className="flex items-center justify-center h-full">
//             <p className="text-gray-400">No Image</p>
//           </div>
//         )}
//       </div>

//       {/* Product model/SKU number */}
//       <div className="mb-1 text-sm text-gray-500">
//         {product.brand} {product.sku}
//       </div>

//       {/* Product Name */}
//       <div 
//         onClick={handleProductClick} 
//         className="cursor-pointer"
//       >
//         <h3 className="mb-1 text-base font-medium text-gray-900 capitalize">
//           {product.name}
//         </h3>
//       </div>

//       {/* Star Rating */}
//       {renderStarRating()}

//       {/* Production Options */}
//       <div className="flex flex-wrap gap-2 mt-2">
//         {productionOptions.map((option, i) => (
//           <span 
//             key={i} 
//             className="px-3 py-1 text-xs text-gray-700 bg-white border border-gray-200 rounded-full"
//           >
//             {option}
//           </span>
//         ))}
//       </div>

//       {/* Pricing */}
//       <div className="flex items-center gap-2 mt-3">
//         <span className="text-sm">From ₹{product.cost.toFixed(2)}</span> 
//         <span className="text-sm text-gray-500">no minimum</span>
//       </div>

//       {/* Color Options */}
//       <div className="flex items-center gap-1 mt-3">
//         {product.colorOptions.slice(0, 4).map((color, i) => (
//           <div
//             key={i}
//             className="w-5 h-5 border border-gray-300 rounded-full"
//             style={{ 
//               backgroundColor: color.colorHex,
//               border: color.colorHex.toLowerCase() === '#ffffff' ? '1px solid #e5e7eb' : 'none'
//             }}
//           />
//         ))}
//         {additionalColors > 0 && (
//           <span className="text-sm text-gray-500">
//             +{additionalColors}
//           </span>
//         )}
//       </div>
//     </div>
//   );
// };

// // Loading skeleton component for the product card
// export const ProductCardSkeleton = () => {
//   return (
//     <div>
//       <Skeleton className="w-full h-64 mb-3" />
//       <Skeleton className="w-1/2 h-4 mb-2" />
//       <Skeleton className="w-3/4 h-6 mb-2" />
//       <Skeleton className="w-1/3 h-4" />
//     </div>
//   );
// };

// export default ProductCard;

import { useRouter } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";

const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;

// Define interfaces
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
  status?: string;
  displayImages: DisplayImage[];
  colorOptions: ColorOption[];
  sizeOptions: SizeOption[];
  printingTechnologies?: PrintingTechnology[];
  printT?: PrintingTechnology[];
}

interface ProductMetadata {
  isBestSeller: boolean;
  isStaffPick: boolean;
  rating: number;
  reviewCount: number;
}

interface ProductCardProps {
  product: Product;
  metadata: ProductMetadata;
}

const ProductCard = ({ product, metadata }: ProductCardProps) => {
  const router = useRouter();

  // ✅ REMOVED: Draft check - products are already filtered in the parent component
  // This eliminates blank spaces in the grid
  
  const handleProductClick = () => {
    const currentPath = router.state.location.pathname;
    router.navigate({
      to: `/${currentPath}/${product.id}`
    });
    
    sessionStorage.setItem(`product_${product.id}`, JSON.stringify(product));
  };

  const formatTechnologyName = (techName: string): string => {
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
    
    if (techDisplayNames[techName.toLowerCase()]) {
      return techDisplayNames[techName.toLowerCase()];
    }
    
    if (techName.toLowerCase() === 'dtg') return 'DTG';
    if (techName.toLowerCase() === 'dtf') return 'DTF';
    if (techName.toLowerCase() === 'uv') return 'UV';
    
    return techName
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getProductionOptions = (): string[] => {
    const printingTechs = (product as any).printT || product.printingTechnologies || [];
    
    if (printingTechs.length > 0) {
      return printingTechs.map((tech: any) => 
        formatTechnologyName(tech.technologyName)
      );
    }
    
    return ["Printed"];
  };

  const productionOptions = getProductionOptions();
  const additionalColors = Math.max(0, product.colorOptions.length - 4);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#e65100]/10 hover:border-[#e65100]/20 group">
      {/* Product Image */}
      <div 
        className="relative w-full overflow-hidden transition-transform duration-300 cursor-pointer h-72 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:scale-105" 
        onClick={handleProductClick}
      >
        {product.displayImages?.length > 0 ? (
          <img
            src={`${vite_payload}${product.displayImages[0].image.url}`}
            alt={product.displayImages[0].image.alt}
            className="object-cover object-center w-full h-full transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-full">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-400">No Image Available</p>
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 transition-colors duration-300 bg-black/0 group-hover:bg-black/10" />
        
        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
          <button className="bg-white/90 backdrop-blur-sm text-[#e65100] font-semibold px-6 py-2 rounded-full shadow-lg hover:bg-white transition-colors duration-200">
            Quick View
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-3 space-y-2">
        {/* Product Name */}
        <div onClick={handleProductClick} className="cursor-pointer">
          <h3 className="text-lg font-bold text-gray-900 capitalize hover:text-[#e65100] transition-colors duration-200 line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* Production Options */}
        <div className="flex flex-wrap gap-2">
          {productionOptions.slice(0, 2).map((option, i) => (
            <span 
              key={i} 
              className="px-3 py-1.5 text-xs font-medium text-[#e65100] bg-[#e65100]/10 border border-[#e65100]/20 rounded-full"
            >
              {option}
            </span>
          ))}
          {productionOptions.length > 2 && (
            <span className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
              +{productionOptions.length - 2} more
            </span>
          )}
        </div>

        {/* Color Options */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Colors:</span>
          <div className="flex items-center gap-2">
            {product.colorOptions.slice(0, 4).map((color, i) => (
              <div
                key={i}
                className="relative w-6 h-6 rounded-full shadow-sm ring-2 ring-gray-200 hover:ring-[#e65100] transition-all duration-200 cursor-pointer"
                style={{ backgroundColor: color.colorHex }}
                title={color.colorName}
              >
                {color.colorHex.toLowerCase() === '#ffffff' && (
                  <div className="absolute inset-0 border border-gray-300 rounded-full" />
                )}
              </div>
            ))}
            {additionalColors > 0 && (
              <div className="flex items-center justify-center w-6 h-6 bg-gray-100 border-2 border-gray-200 rounded-full">
                <span className="text-xs font-medium text-gray-600">+{additionalColors}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">₹{product.cost.toFixed(2)}</span>
              <span className="text-sm font-medium text-gray-500">no minimum</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              In Stock
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
      <Skeleton className="w-full rounded-none h-72" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-24 h-6 rounded-full" />
          <Skeleton className="w-6 h-6 rounded-full" />
        </div>
        <Skeleton className="w-3/4 h-6" />
        <Skeleton className="w-1/2 h-5" />
        <div className="flex gap-2">
          <Skeleton className="w-16 h-6 rounded-full" />
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-4" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-6 h-6 rounded-full" />
            ))}
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <Skeleton className="w-20 h-6" />
            <Skeleton className="w-16 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;