// import { HttpTypes } from "@medusajs/types"
// import { Heading, Text } from "@medusajs/ui"
// import LocalizedClientLink from "@modules/common/components/localized-client-link"


// type ProductInfoProps = {
//   product: HttpTypes.StoreProduct
// }

// const ProductInfo = ({ product }: ProductInfoProps) => {
//   return (
//     <div id="product-info">
//       <div className="flex flex-col gap-y-4 lg:max-w-[500px] ">
//         {product.collection && (
//           <LocalizedClientLink
//             href={`/collections/${product.collection.handle}`}
//             className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
//           >
//             {product.collection.title}
//           </LocalizedClientLink>
//         )}
//         <Heading
//           level="h2"
//           className="text-3xl leading-10 text-ui-fg-base"
//           data-testid="product-title"
//         >
//           {product.title}
//         </Heading>
       
//         <Text
//           className="whitespace-pre-line text-medium text-ui-fg-subtle"
//           data-testid="product-description"
//         >
//           {product.description}
//         </Text>
//       </div>
//     </div>
//   )
// }

// export default ProductInfo


import { HttpTypes } from "@medusajs/types";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Star } from "lucide-react";

type ProductInfoProps = {
  product: HttpTypes.StoreProduct;
};

const ProductInfo = ({ product }: ProductInfoProps) => {
 

  // Hardcoded rating values
  const rating = 4.8;
  const reviewCount = 86;

  return (
    <div>
      {/* Product Title */}
      <h1 className="mb-2 text-2xl font-bold md:text-3xl">{product.title}</h1>
      
      {/* Ratings (if available) */}
      {rating && (
        <div className="flex items-center mb-4">
          <div className="flex mr-2 text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i}
                fill={i < Math.floor(rating) ? "currentColor" : "none"} 
                size={16}
                className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700">{rating}</span>
          <span className="mx-2 text-gray-400">|</span>
          <button className="text-sm text-gray-600 hover:underline">
            {reviewCount} reviews
          </button>
        </div>
      )}
      
     
      
      {/* Short Description */}
      <p className="mb-6 text-gray-700">
        {product.description}
      </p>
      
      {/* Collection Link (if available) */}
      {product.collection && (
        <div className="mb-4">
          <span className="text-sm text-gray-600">Collection: </span>
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-sm font-medium text-[#e65100] hover:underline"
          >
            {product.collection.title}
          </LocalizedClientLink>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;