"use client"

import { HttpTypes } from "@medusajs/types"
import { useState } from "react"
import { 
  Calendar, 
  Star, 
  RefreshCw, 
  Clock, 
  Truck, 
  Droplets, 
  Wind, 
  Sun, 
  Shield, 
  Hand, 
  Ban, 
  Flame
} from "lucide-react"
import ProductReviews from "../product-reviews"
import Link from "next/link"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description')
  
  // Helper function to safely parse JSON metadata
  const parseMetadata = (metadataField: string) => {
    try {
      if (product.metadata?.[metadataField]) {
        return JSON.parse(product.metadata[metadataField])
      }
      return null
    } catch (error) {
      console.error(`Error parsing ${metadataField}:`, error)
      return null
    }
  }

  // Get all metadata
  const productDetails = parseMetadata('product_details')
  const careInstructions = parseMetadata('care_instructions')
  const fulfillmentType = parseMetadata('fulfillment_type')
  
  // Care instruction icons mapping
 const careIconMap = {
  wash_cold: Droplets,
  wash_warm: Flame,      // 🔥 close representation for warm wash
  hand_wash: Hand,       // ✋ represents hand wash
  no_wash: Ban,          // 🚫 no washing
  hang_dry: Wind,        // 🌬️ hanging dry
  no_dry: Ban,           // 🚫 no drying
  no_bleach: Shield,     // 🛡️ no bleach
  // iron_low: Iron,        // 🪡 ironing at low temp
  no_iron: Sun,          // ☀️ (alternative: use Ban+Iron if custom)
  tumble_dry_low: RefreshCw, // 🔄 tumble dry at low temp
}
  
  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-sm">
      {/* Responsive Tab Navigation */}
      <div className="border-b">
        <div className="flex w-full overflow-x-auto scrollbar-hide">
          <button
            className={`px-3 py-2 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap transition-colors border-b-2 flex-1 min-w-[80px] sm:min-w-0 sm:flex-none sm:px-6 sm:py-3 ${
              activeTab === 'description'
                ? 'border-[#e65100] text-[#e65100]'
                : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('description')}
          >
            <span className="block sm:hidden">Info</span>
            <span className="hidden sm:block">Description & Details</span>
          </button>
          
          <button
            className={`px-3 py-2 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap transition-colors border-b-2 flex-1 min-w-[80px] sm:min-w-0 sm:flex-none sm:px-6 sm:py-3 ${
              activeTab === 'story'
                ? 'border-[#e65100] text-[#e65100]'
                : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('story')}
          >
            <span>Story</span>
          </button>
          
          <button
            className={`px-3 py-2 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap transition-colors border-b-2 flex-1 min-w-[80px] sm:min-w-0 sm:flex-none sm:px-6 sm:py-3 ${
              activeTab === 'reviews'
                ? 'border-[#e65100] text-[#e65100]'
                : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            <span className="block sm:hidden">Reviews</span>
            <span className="hidden sm:block">Reviews</span>
          </button>

          <button
            className={`px-3 py-2 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap transition-colors border-b-2 flex-1 min-w-[80px] sm:min-w-0 sm:flex-none sm:px-6 sm:py-3 ${
              activeTab === 'shipping'
                ? 'border-[#e65100] text-[#e65100]'
                : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('shipping')}
          >
            <span className="block sm:hidden">Shipping</span>
            <span className="hidden sm:block">Shipping & Returns</span>
          </button>
        </div>
      </div>
      
      {/* Responsive Content Areas */}
      <div className="p-3 sm:p-4 md:p-6">
        {/* Description & Details Tab */}
        {activeTab === 'description' && (
          <div>
            <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
              {/* Description Column */}
              <div>
                <h2 className="mb-2 text-base font-semibold sm:mb-4 sm:text-lg">Description</h2>
                {product.description ? (
                  <div
                    className="mb-4 text-sm text-gray-700 sm:mb-6"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p className="mb-4 text-sm italic text-gray-500 sm:mb-6">No description available.</p>
                )}
                
                {/* Limited edition badge - only if inventory is low */}
                {(product.inventory_quantity && product.inventory_quantity < 50) && (
                  <div className="p-3 mb-4 rounded-md bg-gray-50 sm:p-4 sm:mb-6">
                    <div className="flex items-center mb-1 sm:mb-2">
                      <Calendar size={16} className="text-[#e65100] mr-2" />
                      <h3 className="text-sm font-medium sm:text-base">Limited Stock</h3>
                    </div>
                    <p className="text-xs text-gray-700 sm:text-">
                      Only {product.inventory_quantity} left in stock.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Product Details Column */}
              <div> 
                {/* Product details from metadata - only show if exists */}
                {productDetails && Array.isArray(productDetails) && productDetails.length > 0 && (
                  <div className="mb-4 sm:mb-6">
                    <h3 className="mb-2 text-sm font-medium sm:text-base">Features</h3>
                    <ul className="space-y-2 text-sm">
                      {productDetails.map((detail, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-[#e65100] mr-2">•</span>
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Show message if no additional details available */}
                {!productDetails && !product.material && !product.origin_country && (
                  <p className="text-sm italic text-gray-500">Additional product details not available.</p>
                )}
              </div>

              {/* Care Instructions Column */}
              <div>
                <h2 className="mb-2 text-base font-semibold sm:mb-4 sm:text-lg">Care Instructions</h2>
                
               {/* Care Instructions - only show if exists */}
                {careInstructions && Array.isArray(careInstructions) && careInstructions.length > 0 ? (
                  <div className="space-y-3">
                    {careInstructions.map((instruction, index) => {
                      const IconComponent = careIconMap[instruction.icon] || Shield
                      return (
                        <div key={index} className="flex items-start">
                          <IconComponent size={16} className="text-[#e65100] mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-700 sm:text-sm">{instruction.instruction}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-500">Care instructions not available for this product.</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* The Story Tab */}
        {activeTab === 'story' && (
          <div>
            {product.metadata?.description_story ? (
              <>
                <h2 className="mb-3 text-base font-semibold sm:text-xl sm:mb-4">
                  Product Story
                </h2>
                
                <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
                  <div>
                    <div
                      className="mb-4 text-sm text-gray-700 whitespace-pre-line sm:text-base sm:mb-6"
                      dangerouslySetInnerHTML={{ 
                        __html: product.metadata.description_story 
                      }}
                    />
                  </div>
                  
                  <div>
                    {product.images?.[0]?.url && (
                      <div className="mb-3 overflow-hidden rounded-lg sm:mb-4">
                        <img 
                          src={product.images[0].url} 
                          alt="Product story" 
                          className="object-cover w-full h-auto"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="italic text-gray-500">No story available for this product.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="my-5 content-container">
            <ProductReviews productId={product.id} />
          </div>
        )}
        
        {/* Shipping & Returns Tab */}
        {activeTab === 'shipping' && (
          <div className="w-full mx-auto">
            <h2 className="mb-4 text-base font-semibold sm:text-xl sm:mb-6">
              Shipping & Returns Information
            </h2>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <div>
                <h3 className="flex items-center mb-2 text-sm font-medium sm:text-lg sm:mb-3">
                  <Truck size={16} className="text-[#e65100] mr-2 sm:size-18" />
                  Shipping Details
                </h3>
                <div className="p-3 space-y-3 rounded-md bg-gray-50 sm:p-4 sm:space-y-4">
                  {fulfillmentType ? (
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {fulfillmentType.type && (
                        <div>
                          <h4 className="text-xs font-medium sm:text-sm">Fulfillment Type</h4>
                          <p className="text-xs text-gray-700 sm:text-sm">{fulfillmentType.type}</p>
                        </div>
                      )}
                      
                      {fulfillmentType.handling_time && (
                        <div>
                          <h4 className="text-xs font-medium sm:text-sm">Processing Time</h4>
                          <p className="text-xs text-gray-700 sm:text-sm">{fulfillmentType.handling_time} days</p>
                        </div>
                      )}
                      
                      {fulfillmentType.shipping_time && (
                        <div>
                          <h4 className="text-xs font-medium sm:text-sm">Shipping Time</h4>
                          <p className="text-xs text-gray-700 sm:text-sm">{fulfillmentType.shipping_time} days</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs italic text-gray-500 sm:text-sm">
                      Shipping information not available for this product.
                    </p>
                  )}
                </div>
              </div>

             <div>
                <h3 className="flex items-center mb-2 text-sm font-medium sm:text-lg sm:mb-3">
                  <RefreshCw size={16} className="text-[#e65100] mr-2 sm:size-18" />
                  Returns Policy
                </h3>
                <div className="p-3 space-y-3 rounded-md bg-gray-50 sm:p-4 sm:space-y-4">
                  <ul className="mb-3 space-y-2 text-xs text-gray-700 list-disc list-inside sm:text-sm">
                    <li>Quality is guaranteed. If there is a print error or visible quality issue, we'll replace or refund it.</li>
                    <li>Because the products are made to order, we do not accept general returns or sizing-related returns.</li>
                  </ul>
                  <LocalizedClientLink
                    href="/refund-exchange"
                    className="inline-flex items-center px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#e65100] rounded-md hover:bg-[#d84e00] transition-colors"
                  >
                    View Refund & Exchange Policy
                  </LocalizedClientLink>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductTabs