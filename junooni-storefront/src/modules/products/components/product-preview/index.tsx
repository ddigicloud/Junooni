// ProductPreview.tsx - Mobile-optimized Nykaa style with real tags
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

interface ProductTag {
  id: string;
  value: string;
  created_at?: string;
  updated_at?: string;
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
  tags?: ProductTag[];
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
  reviewData?: ReviewData;
  isFeatured?: boolean;
}

const ProductPreview = ({ 
  product, 
  region, 
  selectedColors = [],
  reviewData = { averageRating: 0, reviewCount: 0, isLoading: true },
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

  // Extract and process product tags - memoized
  const productTags = useMemo(() => {
    if (!product.tags || !Array.isArray(product.tags)) return [];
    
    // Filter and process tags for display
    const processedTags = product.tags
      .filter(tag => tag.value && tag.value.trim() !== '')
      .map(tag => ({
        id: tag.id,
        value: tag.value.trim(),
        displayValue: tag.value.trim().toUpperCase()
      }));
    
    // For mobile: show max 3 tags, for desktop: show max 5 tags
    return {
      mobile: processedTags.slice(0, 3),
      desktop: processedTags.slice(0, 5)
    };
  }, [product.tags]);

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

  // Truncate product title for mobile
  const truncateTitle = (title: string, maxLength: number = 40): string => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="flex flex-col h-full bg-white group">
      {/* Product Image - Mobile First */}
      <div className="aspect-[3/4] sm:aspect-[4/5] bg-gray-50 relative overflow-hidden mb-3">
        <LocalizedClientLink href={`/products/${product.handle}`}>
          {displayImage ? (
            <div className="relative w-full h-full">
              {isRelativeUrl(displayImage) ? (
                <Image
                  src={displayImage}
                  alt={`${product.title}${selectedColors.length > 0 ? ` in ${selectedColors.join(', ')}` : ''}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
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
              <p className="text-sm text-gray-400">No image</p>
            </div>
          )}
        </LocalizedClientLink>
        
        {/* Wishlist Button - Always Visible */}
        <div className="absolute top-0.5 right-0.5 z-10">
          <div className="bg-white rounded-full shadow-md">
            <WishlistButton alwaysVisible={true} variantId={matchedVariant?.id || product.variants?.[0]?.id}/>
          </div>
        </div>
      </div>
      
      {/* Product Info - Nykaa Order */}
      <div className="flex-grow px-1">
        
        {/* 1. Product Tags - Real Tags Only */}
        {(productTags.mobile.length > 0 || productTags.desktop.length > 0) && (
          <div className="mb-2">
            {/* Mobile View - Max 3 tags */}
            <div className="flex flex-wrap gap-1 mb-2 sm:hidden">
              {productTags.mobile.map((tag, index) => (
                <span 
                  key={`mobile-${tag.id || index}`} 
                  className="px-2 py-1 text-[10px] font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded"
                >
                  {tag.displayValue}
                </span>
              ))}
            </div>
            
            {/* Desktop View - Max 5 tags */}
            <div className="flex-wrap hidden gap-2 mb-2 sm:flex">
              {productTags.desktop.map((tag, index) => (
                <span 
                  key={`desktop-${tag.id || index}`} 
                  className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded"
                >
                  {tag.displayValue}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* 2. Vendor Name - Truncated */}
        <div className="flex items-center px-2 mb-2">
          <span className="mr-1 text-sm font-medium text-black">{vendorName}</span>
          {product.vendor?.verified === "Yes" && (
            <Check size={14} className="text-orange-500" />
          )}
        </div>
        
        {/* 3. Product Name */}
        <h3
          className="text-sm sm:text-base font-medium mb-1.5 leading-tight px-2"
          title={product.title} // <-- FULL TITLE ON HOVER (desktop)
        >
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="transition-colors hover:text-orange-600"
          >
            <span className="block sm:hidden">
              {truncateTitle(product.title, 15)}
            </span>
            <span className="hidden sm:block">
              {truncateTitle(product.title, 18)}
            </span>
          </LocalizedClientLink>
        </h3>

        
        {/* 4. Color Options */}
        {allProductColors.length > 0 && (
          <div className="flex items-center gap-1 px-2 mb-3">
            {allProductColors.slice(0, 5).map((color, index) => {
              const isSelected = selectedColors.some(selected => 
                normalizeColorName(selected).toLowerCase().trim() === color.normalizedName.toLowerCase().trim()
              );
              const isHovered = hoveredColor === color.normalizedName;
              
              return (
                <div
                  key={`${product.id}-color-${index}`}
                  className={`w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border-2 rounded-full transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-orange-500 shadow-sm scale-110' 
                      : isHovered
                        ? 'border-blue-500 shadow-sm scale-110'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.normalizedName}
                  onMouseEnter={() => handleColorHover(color.normalizedName)}
                  onMouseLeave={handleColorLeave}
                />
              );
            })}
            {allProductColors.length > 5 && (
              <span className="text-[10px] sm:text-xs text-gray-500 ml-1">
                +{allProductColors.length - 5}
              </span>
            )}
          </div>
        )}
        
        {/* 5. Price */}
        <div className="px-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900 sm:text-base">
              {formattedPrice}
            </span>
            {hasDiscount && originalPrice && (
              <>
                <span className="text-xs text-gray-500 line-through sm:text-sm">
                  {originalPrice}
                </span>
                <span className="text-xs font-medium text-red-600 sm:text-sm">
                  {discountPercentage}% off
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* 6. Reviews - Last */}
        <div className="flex items-center px-2 pb-2">
          {isLoadingReviews ? (
            <div className="flex items-center">
              <div className="flex mr-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 bg-gray-200 rounded-full animate-pulse" />
                ))}
              </div>
              <div className="w-8 h-2.5 sm:h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : reviewCount > 0 ? (
            <div className="flex items-center">
              <div className="flex mr-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    fill={i < Math.floor(averageRating) ? "currentColor" : "none"}
                    size={12}
                    className={`${
                      i < Math.floor(averageRating) ? "text-yellow-400" : "text-gray-300"
                    } sm:w-3 sm:h-3`}
                  />
                ))}
              </div>
              <span className="text-[10px] sm:text-xs text-gray-600">
                ({reviewCount})
              </span>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="flex mr-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    fill="none"
                    size={12}
                    className="text-gray-300 sm:w-3 sm:h-3"
                  />
                ))}
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500">
                No reviews
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;