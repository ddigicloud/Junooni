// ProductPreview.tsx - Optimized version with props-based reviews
"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { Star, Check } from "lucide-react"
import WishlistButton from "@modules/wishlists/components/wishlist-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Region } from "@medusajs/medusa"

interface ProductVariant {
  id: string;
  options?: Array<{
    option?: { title: string };
    value: string;
  }>;
  calculated_price?: {
    calculated_amount: number;
    original_amount?: number;
    currency_code: string;
  };
  metadata?: {
    variant_images?: string | string[];
  };
  [key: string]: any;
}

interface ProductImage {
  url: string;
  [key: string]: any;
}

interface Product {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string;
  created_at?: string;
  variants?: ProductVariant[];
  images?: ProductImage[];
  vendor?: {
    id: string;
    name: string;
    verified?: string;
  };
  metadata?: {
    color_hex_values?: string | Array<{
      name: string;
      hex: string;
    }>;
    variant_images?: string | { [variantId: string]: string };
  };
  [key: string]: any;
}

interface ReviewData {
  averageRating: number;
  reviewCount: number;
  isLoading: boolean;
}

type ProductPreviewProps = {
  product: Product;
  region: Region;
  selectedColors?: string[];
  reviewData?: ReviewData; // New prop for review data
  isFeatured?: boolean;
}

const ProductPreview = ({ 
  product, 
  region, 
  selectedColors = [],
  reviewData = { averageRating: 0, reviewCount: 0, isLoading: true }, // Default values
  isFeatured = false
}: ProductPreviewProps) => {
  
  // Color hover state
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  // Use passed-in review data instead of individual API calls
  const { averageRating, reviewCount, isLoading: isLoadingReviews } = reviewData;

  // Color name normalizer (optimized - memoized)
  const normalizeColorName = useMemo(() => (colorName: string): string => {
    return colorName
      .trim()
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([a-z])(\d)/g, '$1 $2')
      .replace(/(\d)([a-z])/gi, '$1 $2')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  // Extract image finding logic (optimized - memoized)
  const findImageForColor = useMemo(() => (colorName: string): string | null => {
    if (!colorName) return null;
    
    const normalizedColorName = normalizeColorName(colorName);
    
    // Find variants by color options
    const colorMatchingVariants = product.variants?.filter(variant => {
      if (!variant.options) return false;
      return variant.options.some(option => 
        option.option?.title === 'color' && 
        normalizeColorName(option.value).toLowerCase() === normalizedColorName.toLowerCase()
      );
    }) || [];
    
    // Strategy 1A: Try variant.metadata.variant_images first
    let variantWithImage = colorMatchingVariants.find(variant => 
      variant.metadata?.variant_images
    );
    
    if (variantWithImage && variantWithImage.metadata?.variant_images) {
      let variantImages = variantWithImage.metadata.variant_images;
      if (typeof variantImages === 'string') {
        try {
          variantImages = JSON.parse(variantImages);
        } catch (e) {
          variantImages = [];
        }
      }
      
      if (Array.isArray(variantImages) && variantImages.length > 0) {
        return variantImages[0];
      }
    }
    
    // Strategy 1B: Try product.metadata.variant_images mapping
    if (product.metadata?.variant_images) {
      let productVariantImages = product.metadata.variant_images;
      if (typeof productVariantImages === 'string') {
        try {
          productVariantImages = JSON.parse(productVariantImages);
        } catch (e) {
          productVariantImages = {};
        }
      }
      
      if (typeof productVariantImages === 'object') {
        for (const variant of colorMatchingVariants) {
          if (productVariantImages[variant.id]) {
            return productVariantImages[variant.id];
          }
        }
      }
    }
    
    // Strategy 2: Search product.images for color-specific filenames
    if (product.images && product.images.length > 1) {
      const colorImage = product.images.find(img => {
        const imageUrl = img.url || '';
        const colorVariations = [
          normalizedColorName.toLowerCase(),
          normalizedColorName.toLowerCase().replace(/\s+/g, ''),
          normalizedColorName.toLowerCase().replace(/\s+/g, '-'),
          normalizedColorName.toLowerCase().replace(/\s+/g, '_'),
        ];
        
        return colorVariations.some(variation => 
          imageUrl.toLowerCase().includes(variation)
        );
      });
      
      if (colorImage) {
        return colorImage.url;
      }
    }
    
    return null;
  }, [product, normalizeColorName]);

  // Optimized image selection with minimal processing
  interface ImageSelectionResult {
    displayImage: string | undefined;
    matchedVariant: ProductVariant | null;
    allProductColors: Array<{ name: string; hex: string; normalizedName: string }>;
  }

  const { displayImage, matchedVariant, allProductColors } = useMemo((): ImageSelectionResult => {
    // Determine which color to use for image (hovered color takes priority)
    const activeColors = hoveredColor ? [hoveredColor] : selectedColors;
    
    // Extract colors from product metadata (cached)
    const productColors: Array<{ name: string; hex: string; normalizedName: string }> = [];
    if (product.metadata?.color_hex_values) {
      let colorsData = product.metadata.color_hex_values;
      if (typeof colorsData === 'string') {
        try {
          colorsData = JSON.parse(colorsData);
        } catch (e) {
          // Silent fail for performance
        }
      }
      if (Array.isArray(colorsData)) {
        productColors.push(...colorsData.map(color => ({
          ...color,
          normalizedName: normalizeColorName(color.name)
        })));
      }
    }
    
    // Find matching color
    const normalizedActiveColors = activeColors.map(color => 
      normalizeColorName(color).toLowerCase().trim()
    );
    
    const matchedColor = normalizedActiveColors.length > 0 
      ? productColors.find(color => 
          normalizedActiveColors.includes(color.normalizedName.toLowerCase().trim())
        )
      : null;
    
    // Image selection
    let bestImage = product.thumbnail; // Default fallback
    let bestVariant: ProductVariant | null = null;
    
    if (matchedColor) {
      const colorImage = findImageForColor(matchedColor.normalizedName);
      if (colorImage) {
        bestImage = colorImage;
        
        // Find the matching variant
        const colorMatchingVariants = product.variants?.filter(variant => {
          if (!variant.options) return false;
          return variant.options.some(option => 
            option.option?.title === 'color' && 
            normalizeColorName(option.value).toLowerCase() === matchedColor.normalizedName.toLowerCase()
          );
        }) || [];
        
        bestVariant = colorMatchingVariants[0] || null;
      }
    }
    
    return {
      displayImage: bestImage,
      matchedVariant: bestVariant,
      allProductColors: productColors
    };
  }, [product, selectedColors, hoveredColor, normalizeColorName, findImageForColor]);

  // Get product price (prioritize matched variant) - optimized
  interface PriceResult {
    formattedPrice: string;
    hasDiscount: boolean;
    discountPercentage: number;
    originalPrice: string | null;
  }

  const { formattedPrice, hasDiscount, discountPercentage, originalPrice } = useMemo((): PriceResult => {
    if (!product || !region) {
      return {
        formattedPrice: "N/A",
        hasDiscount: false,
        discountPercentage: 0,
        originalPrice: null
      };
    }
    
    const regionCurrencyCode = region.currency_code;
    let cheapestPrice: {
      amount: number;
      original_amount: number;
      currency_code: string;
    } | undefined = undefined;
    
    if (product.variants && product.variants.length > 0) {
      // Prioritize matched variant for pricing
      if (matchedVariant && matchedVariant.calculated_price?.calculated_amount) {
        cheapestPrice = {
          amount: matchedVariant.calculated_price.calculated_amount,
          original_amount: matchedVariant.calculated_price.original_amount || matchedVariant.calculated_price.calculated_amount,
          currency_code: matchedVariant.calculated_price.currency_code
        };
      }
      
      // Fallback to cheapest price
      if (!cheapestPrice) {
        cheapestPrice = product.variants.reduce((cheapest, variant) => {
          if (!variant.calculated_price?.calculated_amount) return cheapest;
          
          const variantPrice = {
            amount: variant.calculated_price.calculated_amount,
            original_amount: variant.calculated_price.original_amount || variant.calculated_price.calculated_amount,
            currency_code: variant.calculated_price.currency_code
          };
          
          if (!cheapest || variantPrice.amount < cheapest.amount) {
            return variantPrice;
          }
          return cheapest;
        }, undefined as typeof cheapestPrice);
      }
    }
    
    let formattedPrice = "N/A";
    let hasDiscount = false;
    let discountPercentage = 0;
    let originalPrice: string | null = null;
    
    if (cheapestPrice && cheapestPrice.amount) {
      formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: regionCurrencyCode,
      }).format(cheapestPrice.amount);
      
      // Check for discounts
      if (cheapestPrice.original_amount && cheapestPrice.original_amount > cheapestPrice.amount) {
        hasDiscount = true;
        const discount = cheapestPrice.original_amount - cheapestPrice.amount;
        discountPercentage = Math.round((discount / cheapestPrice.original_amount) * 100);
        originalPrice = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: regionCurrencyCode,
        }).format(cheapestPrice.original_amount);
      }
    }
    
    return {
      formattedPrice,
      hasDiscount,
      discountPercentage,
      originalPrice
    };
  }, [product, region, matchedVariant]);

  // Get vendor info - memoized
  const vendorName = useMemo(() => product.vendor?.name || "Unknown Vendor", [product.vendor]);

  // Check if new - memoized
  const isNew = useMemo(() => {
    if (!product.created_at) return false;
    const createdAt = new Date(product.created_at);
    const now = new Date();
    return (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24) < 14;
  }, [product.created_at]);

  // URL helper - memoized
  const isRelativeUrl = useMemo(() => (url: string): boolean => {
    if (!url) return true;
    return !url.startsWith('http') && !url.startsWith('//');
  }, []);

  // Color hover handlers
  const handleColorHover = (colorName: string): void => {
    setHoveredColor(colorName);
  };

  const handleColorLeave = (): void => {
    setHoveredColor(null);
  };

  return (
    <div className="flex flex-col h-full group">
      {/* Product Image */}
      <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden rounded-lg mb-4">
        <LocalizedClientLink href={`/products/${product.handle}`}>
          {displayImage ? (
            <div className="relative w-full h-full">
              {isRelativeUrl(displayImage) ? (
                <Image
                  src={displayImage}
                  alt={`${product.title}${selectedColors.length > 0 ? ` in ${selectedColors.join(', ')}` : ''}`}
                  fill
                  sizes="(max-width: 576px) 100vw, (max-width: 768px) 50vw, 33vw"
                  className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                    hoveredColor ? 'brightness-110' : ''
                  }`}
                  loading="lazy"
                />
              ) : (
                <img
                  src={displayImage}
                  alt={`${product.title}${selectedColors.length > 0 ? ` in ${selectedColors.join(', ')}` : ''}`}
                  className={`object-cover w-full h-full transition-all duration-300 group-hover:scale-105 ${
                    hoveredColor ? 'brightness-110' : ''
                  }`}
                  loading="lazy"
                />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-200">
              <p className="text-gray-400">No image</p>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute flex flex-col gap-2 left-3 top-3">
            {isNew && (
              <span className="px-2 py-1 text-xs text-white bg-black rounded">
                New
              </span>
            )}
            {hasDiscount && (
              <span className="bg-[#e65100] text-white text-xs px-2 py-1 rounded">
                {discountPercentage}% Off
              </span>
            )}
          </div>
          
          {/* Quick actions */}
          <div className="absolute top-0 right-0 z-20">
            <div className="pointer-events-auto">
              <WishlistButton variantId={matchedVariant?.id || product.variants?.[0]?.id}/>
            </div>
          </div>
          
          {/* Add to cart */}
          <div className="absolute inset-x-0 bottom-0 p-4 transition-opacity opacity-0 bg-gradient-to-t from-black to-transparent group-hover:opacity-100">
            <button className="w-full py-2 font-medium text-black transition bg-white rounded-md hover:bg-gray-100">
              Add to Cart
            </button>
          </div>
        </LocalizedClientLink>
      </div>
      
      {/* Product Info */}
      <div className="flex-grow p-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium mb-1 hover:text-[#e65100] transition">
              <LocalizedClientLink href={`/products/${product.handle}`}>
                {product.title}
              </LocalizedClientLink>
            </h3>
            <div className="flex items-center mb-1 text-sm text-gray-600">
              <span className="mr-1">{vendorName}</span>
              {product.vendor?.verified === "Yes" && (
                <span className="text-[#e65100]">
                  <Check size={14} />
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">{formattedPrice}</div>
            {hasDiscount && originalPrice && (
              <div className="text-sm">
                <span className="text-gray-500 line-through">
                  {originalPrice}
                </span>
                <span className="ml-1 text-red-600">-{discountPercentage}%</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Review Data (now passed as props) with Loading States */}
        <div className="flex items-center mt-2">
          {isLoadingReviews ? (
            <div className="flex items-center">
              <div className="flex mr-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-3 h-3 mr-0.5 bg-gray-200 rounded-full animate-pulse" />
                ))}
              </div>
              <div className="w-8 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : reviewCount > 0 ? (
            <>
              <div className="flex mr-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    fill={i < Math.floor(averageRating) ? "currentColor" : "none"}
                    size={14}
                    className={i < Math.floor(averageRating) ? "text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">
                ({reviewCount})
              </span>
            </>
          ) : (
            <div className="flex items-center">
              <div className="flex mr-1 text-gray-300">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    fill="none"
                    size={14}
                    className="text-gray-300"
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                No reviews
              </span>
            </div>
          )}
        </div>
        
        {/* Color swatches with hover functionality */}
        {allProductColors.length > 0 && (
          <div className="flex gap-1 mt-2">
            {allProductColors.slice(0, 4).map((color, index) => {
              const isSelected = selectedColors.some(selected => 
                normalizeColorName(selected).toLowerCase().trim() === color.normalizedName.toLowerCase().trim()
              );
              const isHovered = hoveredColor === color.normalizedName;
              
              return (
                <div
                  key={`${product.id}-color-${index}`}
                  className={`w-4 h-4 border-2 rounded-full transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-[#e65100] shadow-md scale-110 ring-2 ring-orange-200' 
                      : isHovered
                        ? 'border-blue-500 shadow-md scale-110 ring-2 ring-blue-200'
                        : 'border-gray-100 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={`${color.normalizedName}${isSelected ? ' (current)' : ''}`}
                  onMouseEnter={() => handleColorHover(color.normalizedName)}
                  onMouseLeave={handleColorLeave}
                ></div>
              );
            })}
            {allProductColors.length > 4 && (
              <span className="ml-1 text-xs text-gray-500">
                +{allProductColors.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPreview;