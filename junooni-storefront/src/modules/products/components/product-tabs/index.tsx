"use client"

import { HttpTypes } from "@medusajs/types"
import { useState } from "react"
import { Calendar, Star, RefreshCw, Clock, Truck } from "lucide-react"
import ProductReviews from "../product-reviews"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description')
  
  // Hardcoded product details - these could be supplemented with product data
  const productDetails = [
    "Premium weight 100% organic cotton",
    "Ribbed crewneck collar",
    "Printed with eco-friendly inks",
    "Limited production run"
  ]
  
  // Hardcoded story content
  const storyTitle = "The Story Behind The Design"
  const storyText = "This design was created during our latest product development cycle. Inspired by customer feedback and industry trends, our team sketched the initial concept and refined it through multiple iterations.\n\nThe circular elements represent the connection between our brand and our customers, while the patterns symbolize our commitment to quality. Each piece is made with attention to detail and sustainability in mind."
  const storyImage = "https://placehold.co/500/300"
  const storyProcess = [
    "Hand-sketched initial design",
    "Digital refinement with customer input",
    "Small-batch production with eco-friendly materials",
    "Quality testing and assurance"
  ]
    
  // Hardcoded shipping details
  const freeThreshold = "100"
  const estimatedDelivery = "5-7 business days"
  const returnPeriod = "30"
  
 
  
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
            <span className="hidden sm:block">Reviews </span>
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
        {/* Description & Details Tab - Using available product data */}
        {activeTab === 'description' && (
          <div>
            <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
              <div>
                <h2 className="mb-2 text-base font-semibold sm:mb-4 sm:text-lg">Description</h2>
                <p className="mb-4 text-sm text-gray-700 sm:mb-6">
                  {product.description}
                </p>
                
                {/* Limited edition badge - can be hardcoded or based on stock level */}
                {(product.inventory_quantity && product.inventory_quantity < 50) && (
                  <div className="p-3 mb-4 rounded-md bg-gray-50 sm:p-4 sm:mb-6">
                    <div className="flex items-center mb-1 sm:mb-2">
                      <Calendar size={16} className="text-[#e65100] mr-2" />
                      <h3 className="text-sm font-medium sm:text-base">Limited Edition</h3>
                    </div>
                    <p className="text-xs text-gray-700 sm:text-sm">
                      This item is part of a limited production run. 
                      Once sold out, it may not be restocked.
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="mb-2 text-base font-semibold sm:mb-4 sm:text-lg">Product Details</h2>
                
                {/* Product specifications using available data */}
                <div className="mb-4 space-y-3 text-sm sm:mb-6">
                  {product.material && (
                    <div className="flex items-start">
                      <span className="text-[#e65100] mr-2">•</span>
                      <div>
                        <span className="font-medium">Material: </span>
                        <span className="text-gray-700">{product.material}</span>
                      </div>
                    </div>
                  )}
                  
                  {product.origin_country && (
                    <div className="flex items-start">
                      <span className="text-[#e65100] mr-2">•</span>
                      <div>
                        <span className="font-medium">Country of origin: </span>
                        <span className="text-gray-700">{product.origin_country}</span>
                      </div>
                    </div>
                  )}
                  
                  {product.type?.value && (
                    <div className="flex items-start">
                      <span className="text-[#e65100] mr-2">•</span>
                      <div>
                        <span className="font-medium">Type: </span>
                        <span className="text-gray-700">{product.type.value}</span>
                      </div>
                    </div>
                  )}
                  
                  {product.weight && (
                    <div className="flex items-start">
                      <span className="text-[#e65100] mr-2">•</span>
                      <div>
                        <span className="font-medium">Weight: </span>
                        <span className="text-gray-700">{product.weight} g</span>
                      </div>
                    </div>
                  )}
                  
                  {(product.length && product.width && product.height) && (
                    <div className="flex items-start">
                      <span className="text-[#e65100] mr-2">•</span>
                      <div>
                        <span className="font-medium">Dimensions: </span>
                        <span className="text-gray-700">{product.length}L x {product.width}W x {product.height}H</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Hardcoded details for elements not available in product data */}
                <ul className="space-y-2 text-sm">
                  {productDetails.map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-[#e65100] mr-2">•</span>
                      <span className="text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* The Story Tab */}
        {activeTab === 'story' && (
          <div>
            <h2 className="mb-3 text-base font-semibold sm:text-xl sm:mb-4">
              {storyTitle}
            </h2>
            
            <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
              <div>
                <p className="mb-4 text-sm text-gray-700 whitespace-pre-line sm:text-base sm:mb-6">
                  {storyText || "No story content available for this product."}
                </p>
                
                {storyProcess.length > 0 && (
                  <>
                    <h3 className="mb-2 text-sm font-medium sm:text-base sm:mb-3">The Process</h3>
                    <ul className="space-y-2">
                      {storyProcess.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#e65100] text-white text-xs font-bold mr-2">
                            {index + 1}
                          </span>
                          <span className="text-xs text-gray-700 sm:text-sm">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              
              <div>
                <div className="mb-3 overflow-hidden rounded-lg sm:mb-4">
                  {/* Use first product image as fallback if available */}
                  <img 
                    src={product.images?.[0]?.url || storyImage} 
                    alt="Behind the design" 
                    className="object-cover w-full h-auto"
                    loading="lazy"
                  />
                </div>
                
                <div className="p-3 rounded-md bg-gray-50 sm:p-4">
                  <h3 className="mb-1 text-sm font-medium sm:text-base sm:mb-2">A Message from the Creator</h3>
                  <p className="text-xs italic text-gray-700 sm:text-sm">
                    "We're proud to offer this product as part of our latest collection. Each item is crafted with care and designed to exceed your expectations."
                  </p>
                </div>
              </div>
            </div>
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
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div>
                      <h4 className="text-xs font-medium sm:text-sm">Standard Shipping</h4>
                      <p className="text-xs text-gray-700 sm:text-sm">{estimatedDelivery}</p>
                      <p className="text-xs text-gray-500 sm:text-sm">
                        Free for orders over ${freeThreshold}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium sm:text-sm">Express Shipping</h4>
                      <p className="text-xs text-gray-700 sm:text-sm">2-3 business days</p>
                      <p className="text-xs text-gray-500 sm:text-sm">
                        Additional fees apply
                      </p>
                    </div>
                    <div>
                      <h4 className="mb-1 text-xs font-medium sm:text-sm">Delivery Tracking</h4>
                      <p className="text-xs text-gray-700 sm:text-sm">
                        All orders include tracking information sent via email once your order ships.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="flex items-center mb-2 text-sm font-medium sm:text-lg sm:mb-3">
                  <RefreshCw size={16} className="text-[#e65100] mr-2 sm:size-18" />
                  Returns Policy
                </h3>
                <div className="p-3 space-y-3 rounded-md bg-gray-50 sm:p-4 sm:space-y-4">
                  <p className="text-xs text-gray-700 sm:text-sm">
                    We offer a {returnPeriod}-day return policy for most items. To be eligible for a return:
                  </p>
                  
                  <ul className="space-y-2 text-xs text-gray-700 sm:text-sm">
                    <li className="flex items-start">
                      <span className="text-[#e65100] mr-2">•</span>
                      <span>Items must be unused and in the original packaging</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#e65100] mr-2">•</span>
                      <span>Include the original receipt or proof of purchase</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#e65100] mr-2">•</span>
                      <span>Initiate the return within {returnPeriod} days of delivery</span>
                    </li>
                  </ul>
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