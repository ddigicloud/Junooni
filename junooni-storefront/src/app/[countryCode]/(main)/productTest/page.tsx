'use client'

import React, { useState } from 'react';
import { Heart, ShoppingCart, Share2, ArrowLeft, ArrowRight, Star, ChevronDown, ChevronUp, Users, Calendar, Clock, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const ProductPage = () => {
  // State management
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [currentProductVariantId, setCurrentProductVariantId] = useState('variant-1');
  
  // Sample product data - would come from your Medusa backend
  const product = {
    id: "prod-001",
    name: "Tour Limited Edition Graphic Tee",
    creator: {
      id: "creator-123",
      name: "Alex Rivera",
      handle: "@alexcreates",
      verified: true,
      image: "https://placehold.co/80/80"
    },
    price: 59.99,
    comparePrice: 79.99,
    discount: 25,
    rating: 4.8,
    reviewCount: 86,
    description: "This exclusive tour tee features custom artwork designed by Alex Rivera for the 2025 World Tour. The front showcases a unique graphic print that combines elements from Alex's latest album artwork with city-inspired motifs from the tour locations.",
    details: [
      "Premium weight 100% organic cotton",
      "Ribbed crewneck collar",
      "Printed with eco-friendly inks",
      "Exclusive to Junooni",
      "Limited production of 1,000 pieces worldwide",
      "Each piece is individually numbered"
    ],
    stock: {
      total: 230,
      initialQuantity: 1000,
      lowStock: true
    },
    isLimited: true,
    isNew: true,
    isSigned: false,
    images: [
      "https://placehold.co/600/800",
      "https://placehold.co/600/800",
      "https://placehold.co/600/800",
      "https://placehold.co/600/800"
    ],
    thumbnails: [
      "https://placehold.co/120/120",
      "https://placehold.co/120/120",
      "https://placehold.co/120/120",
      "https://placehold.co/120/120"
    ],
    sizes: [
      { id: 1, label: "S", available: true },
      { id: 2, label: "M", available: true },
      { id: 3, label: "L", available: true },
      { id: 4, label: "XL", available: true },
      { id: 5, label: "XXL", available: false }
    ],
    colors: [
      { id: 1, name: "Black", hex: "#000000", available: true },
      { id: 2, name: "White", hex: "#FFFFFF", available: true },
      { id: 3, name: "Navy", hex: "#000080", available:   false }
    ],
    storyContent: {
      title: "The Story Behind The Design",
      text: "This design was created during the final leg of Alex's European tour. Inspired by the historic architecture of Prague and the vibrant street art scene in Berlin, Alex sketched the initial concept backstage before a sold-out show.\n\nThe circular elements represent the connection between artist and audience, while the geometric patterns symbolize the different cities visited during the tour. Each shirt is part of a limited run, with only 1,000 pieces produced worldwide.",
      image: "https://placehold.co/500/300",
      process: [
        "Hand-sketched design by Alex Rivera",
        "Digital refinement with fan input",
        "Small-batch production with eco-friendly materials",
        "Individual numbering of each piece"
      ]
    },
    shipping: {
      freeThreshold: 100,
      estimatedDelivery: "5-7 business days",
      returnPeriod: 30
    },
    variants: [
      {
        id: "variant-1",
        size: "M",
        color: "Black",
        price: 59.99,
        available: true,
        stock: 58
      },
      {
        id: "variant-2",
        size: "L",
        color: "Black",
        price: 59.99,
        available: true,
        stock: 42
      }
    ],
    relatedProducts: [
      {
        id: "related-1",
        name: "Tour Hoodie",
        price: 89.99,
        image: "https://placehold.co/300/400"
      },
      {
        id: "related-2",
        name: "Signed Vinyl",
        price: 49.99,
        isLimited: true,
        image: "https://placehold.co/300/400"
      },
      {
        id: "related-3",
        name: "Tour Poster",
        price: 24.99,
        image: "https://placehold.co/300/400"
      },
      {
        id: "related-4",
        name: "Digital Album",
        price: 12.99,
        image: "https://placehold.co/300/400"
      }
    ],
    reviews: [
      {
        id: 1,
        author: "JamieL",
        rating: 5,
        date: "March 10, 2025",
        title: "High quality and unique design",
        content: "I love how soft this shirt is while still being durable. The design is so unique and I've gotten tons of compliments when wearing it. Definitely worth the price for something so exclusive.",
        verified: true,
        image: "https://placehold.co/100/100"
      },
      {
        id: 2,
        author: "MusicFan22",
        rating: 4,
        date: "March 5, 2025",
        title: "Great fit, shipping took a while",
        content: "The shirt fits perfectly and the design is exactly as pictured. My only complaint is that shipping took longer than expected. Still, I'm happy with my purchase and would buy from Alex's collection again.",
        verified: true
      },
      {
        id: 3,
        author: "ConcertGoer",
        rating: 5,
        date: "February 28, 2025",
        title: "Amazing memorabilia from the tour",
        content: "Having been to one of the tour shows, this shirt makes for the perfect memento. The quality is excellent and I love that it's numbered - mine is #348/1000!",
        verified: true
      }
    ]
  };
  
  // Helper functions
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };
  
  const setThumbnailImage = (index) => {
    setCurrentImageIndex(index);
  };
  
  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // Format currency
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };
  
  // Calculate stock percentage
  const stockPercentage = (product.stock.total / product.stock.initialQuantity) * 100;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-6 mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600">
          <a href="#" className="hover:text-[#e65100]">Home</a> / 
          <a href="#" className="hover:text-[#e65100] mx-1">Creators</a> / 
          <a href="#" className="hover:text-[#e65100] mx-1">{product.creator.name}</a> / 
          <span className="ml-1 text-gray-900">{product.name}</span>
        </div>
        
        <div className="mb-10 overflow-hidden bg-white rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Product Images Section */}
            <div className="p-4 border-b md:p-6 md:border-b-0 md:border-r">
              {/* Main Image */}
              <div className="relative mb-4 overflow-hidden bg-gray-100 rounded-lg">
                <div className="aspect-[3/4]">
                  <img 
                    src={product.images[currentImageIndex]} 
                    alt={product.name} 
                    className="object-cover w-full h-full"
                  />
                </div>
                
                {/* Image Navigation Arrows */}
                <button 
                  className="absolute flex items-center justify-center w-10 h-10 transition -translate-y-1/2 bg-white rounded-full left-2 top-1/2 bg-opacity-70 hover:bg-opacity-100"
                  onClick={prevImage}
                >
                  <ArrowLeft size={20} />
                </button>
                <button 
                  className="absolute flex items-center justify-center w-10 h-10 transition -translate-y-1/2 bg-white rounded-full right-2 top-1/2 bg-opacity-70 hover:bg-opacity-100"
                  onClick={nextImage}
                >
                  <ArrowRight size={20} />
                </button>
                
                {/* Badges */}
                <div className="absolute flex flex-col gap-2 left-3 top-3">
                  {product.isNew && (
                    <span className="px-2 py-1 text-xs text-white bg-black rounded">
                      New
                    </span>
                  )}
                  {product.isLimited && (
                    <span className="bg-[#e65100] text-white text-xs px-2 py-1 rounded">
                      Limited Edition
                    </span>
                  )}
                  {product.isSigned && (
                    <span className="px-2 py-1 text-xs text-white bg-purple-600 rounded">
                      Signed
                    </span>
                  )}
                </div>
              </div>
              
              {/* Thumbnails */}
              <div className="flex gap-2 pb-2 overflow-x-auto">
                {product.thumbnails.map((thumb, index) => (
                  <button 
                    key={index}
                    className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-[#e65100]' : 'border-transparent'
                    }`}
                    onClick={() => setThumbnailImage(index)}
                  >
                    <img 
                      src={thumb} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Product Details Section */}
            <div className="p-4 md:p-8">
              {/* Creator Info */}
              <div className="flex items-center mb-4">
                <img 
                  src={product.creator.image} 
                  alt={product.creator.name} 
                  className="object-cover w-8 h-8 mr-2 rounded-full"
                />
                <div>
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium">{product.creator.name}</h4>
                    {product.creator.verified && (
                      <span className="ml-1 text-[#e65100]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{product.creator.handle}</span>
                </div>
              </div>
              
              {/* Product Title */}
              <h1 className="mb-2 text-2xl font-bold md:text-3xl">{product.name}</h1>
              
              {/* Ratings */}
              <div className="flex items-center mb-4">
                <div className="flex mr-2 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                      size={16}
                      className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                <span className="mx-2 text-gray-400">|</span>
                <button 
                  className="text-sm text-gray-600 hover:underline"
                  onClick={() => setReviewsOpen(true)}
                >
                  {product.reviewCount} reviews
                </button>
              </div>
              
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center">
                  <span className="mr-2 text-2xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.comparePrice && (
                    <>
                      <span className="mr-2 text-gray-500 line-through">
                        {formatPrice(product.comparePrice)}
                      </span>
                      <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded">
                        Save {product.discount}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Short Description */}
              <p className="mb-6 text-gray-700">
                {product.description}
              </p>
              
              {/* Product Variants - Color Selection */}
              {product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-2 font-medium">Color: {selectedColor || "Choose an option"}</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(color => (
                      <button
                        key={color.id}
                        disabled={!color.available}
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center 
                          ${color.hex === '#FFFFFF' ? 'border border-gray-300' : ''} 
                          ${selectedColor === color.name ? 'ring-2 ring-[#e65100] ring-offset-2' : ''}
                          ${!color.available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        style={{ backgroundColor: color.hex }}
                        onClick={() => color.available && setSelectedColor(color.name)}
                        title={`${color.name}${!color.available ? ' (Out of Stock)' : ''}`}
                      >
                        {selectedColor === color.name && (
                          <span className={`text-xs ${['White'].includes(color.name) ? 'text-black' : 'text-white'}`}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Product Variants - Size Selection */}
              {product.sizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Size: {selectedSize || "Choose an option"}</h3>
                    <button className="text-sm text-[#e65100] hover:underline">Size Guide</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size.id}
                        disabled={!size.available}
                        className={`
                          w-12 h-10 border rounded-md flex items-center justify-center text-sm font-medium
                          ${selectedSize === size.label 
                            ? 'bg-[#e65100] text-white border-[#e65100]' 
                            : 'bg-white text-gray-800 border-gray-300 hover:border-[#e65100]'
                          }
                          ${!size.available ? 'opacity-40 cursor-not-allowed line-through' : 'cursor-pointer'}
                        `}
                        onClick={() => size.available && setSelectedSize(size.label)}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Stock Status */}
              {product.stock.lowStock && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span className="text-gray-700">
                      Only <strong>{product.stock.total}</strong> left in stock
                    </span>
                    <span className="text-gray-500">
                      {Math.round(stockPercentage)}% sold
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className="bg-[#e65100] h-2 rounded-full" 
                      style={{ width: `${100 - stockPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Quantity Selector */}
              <div className="mb-6">
                <h3 className="mb-2 font-medium">Quantity</h3>
                <div className="flex">
                  <div className="flex items-center border rounded-md">
                    <button 
                      className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800"
                      onClick={decrementQuantity}
                    >
                      <ChevronDown size={20} />
                    </button>
                    <span className="w-12 text-center">{quantity}</span>
                    <button 
                      className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800"
                      onClick={incrementQuantity}
                    >
                      <ChevronUp size={20} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Add to Cart & Actions */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button className="flex-1 bg-[#e65100] text-white px-6 py-3 rounded-md font-medium hover:bg-[#d84315] transition flex items-center justify-center">
                  <ShoppingCart size={18} className="mr-2" />
                  Add to Cart
                </button>
                <button className="w-12 h-12 border border-gray-300 rounded-md flex items-center justify-center text-gray-700 hover:border-[#e65100] hover:text-[#e65100] transition">
                  <Heart size={20} />
                </button>
                <button className="w-12 h-12 border border-gray-300 rounded-md flex items-center justify-center text-gray-700 hover:border-[#e65100] hover:text-[#e65100] transition">
                  <Share2 size={20} />
                </button>
              </div>
              
              {/* Shipping & Returns */}
              <div className="py-6 mb-6 border-t border-b">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex items-start">
                    <Truck size={18} className="text-[#e65100] mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Free Shipping</h4>
                      <p className="text-xs text-gray-600">Orders over ${product.shipping.freeThreshold}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock size={18} className="text-[#e65100] mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Delivery Time</h4>
                      <p className="text-xs text-gray-600">{product.shipping.estimatedDelivery}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <RefreshCw size={18} className="text-[#e65100] mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium">Easy Returns</h4>
                      <p className="text-xs text-gray-600">{product.shipping.returnPeriod} days return policy</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Authenticity Guarantee */}
              <div className="flex items-center p-3 mb-6 rounded-md bg-gray-50">
                <ShieldCheck size={20} className="text-[#e65100] mr-2" />
                <div>
                  <p className="text-sm font-medium">Authenticity Guaranteed</p>
                  <p className="text-xs text-gray-600">Official merchandise from {product.creator.name}</p>
                </div>
              </div>
              
              {/* Fan Stats */}
              {product.isLimited && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users size={16} className="mr-1" />
                  <span>
                    <strong>217</strong> fans have purchased this item in the last 48 hours
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Product Info Tabs */}
        <div className="mb-10 overflow-hidden bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              <button
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'description'
                    ? 'border-[#e65100] text-[#e65100]'
                    : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description & Details
              </button>
              
              <button
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'story'
                    ? 'border-[#e65100] text-[#e65100]'
                    : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('story')}
              >
                The Story
              </button>
              
              <button
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'reviews'
                    ? 'border-[#e65100] text-[#e65100]'
                    : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({product.reviewCount})
              </button>
              
              <button
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'shipping'
                    ? 'border-[#e65100] text-[#e65100]'
                    : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('shipping')}
              >
                Shipping & Returns
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Description & Details Tab */}
            {activeTab === 'description' && (
              <div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div>
                    <h2 className="mb-4 text-lg font-semibold">Description</h2>
                    <p className="mb-6 text-gray-700">
                      {product.description}
                    </p>
                    
                    {product.isLimited && (
                      <div className="p-4 mb-6 rounded-md bg-gray-50">
                        <div className="flex items-center mb-2">
                          <Calendar size={18} className="text-[#e65100] mr-2" />
                          <h3 className="font-medium">Limited Edition</h3>
                        </div>
                        <p className="text-sm text-gray-700">
                          This item is part of a limited production run of {product.stock.initialQuantity} pieces. 
                          Each item is individually numbered and will not be reproduced once sold out.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="mb-4 text-lg font-semibold">Product Details</h2>
                    <ul className="space-y-2">
                      {product.details.map((detail, index) => (
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
                <h2 className="mb-4 text-xl font-semibold">{product.storyContent.title}</h2>
                
                <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
                  <div>
                    <p className="mb-6 text-gray-700 whitespace-pre-line">
                      {product.storyContent.text}
                    </p>
                    
                    <h3 className="mb-3 font-medium">The Process</h3>
                    <ul className="space-y-2">
                      {product.storyContent.process.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#e65100] text-white text-xs font-bold mr-2">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img 
                        src={product.storyContent.image} 
                        alt="Behind the design" 
                        className="w-full h-auto"
                      />
                    </div>
                    
                    <div className="p-4 rounded-md bg-gray-50">
                      <h3 className="mb-2 font-medium">A Message from {product.creator.name}</h3>
                      <p className="text-sm italic text-gray-700">
                        "I wanted to create something that captures the energy of the live shows and the connection
                        I feel with fans in each city. This design represents our shared journey and the unique experience
                        of this tour. Thank you for supporting my work and carrying a piece of this experience with you."
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t">
                  <h3 className="mb-3 font-medium">Share Your Story</h3>
                  <p className="mb-4 text-gray-700">
                    Got this item? Tag @{product.creator.handle.replace('@', '')} and #JunooniMerch on social media to share how you're styling it!
                  </p>
                  <button className="bg-[#e65100] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#d84315] transition">
                    Share Your Photo
                  </button>
                </div>
              </div>
            )}
            
            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex flex-col gap-8 md:flex-row">
                  {/* Review Summary */}
                  <div className="md:w-1/3">
                    <div className="p-4 mb-4 rounded-lg bg-gray-50">
                      <h3 className="mb-2 text-2xl font-bold text-center">{product.rating}</h3>
                      <div className="flex justify-center mb-2 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                            size={18}
                            className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}
                          />
                        ))}
                      </div>
                      <p className="mb-4 text-sm text-center text-gray-600">
                        Based on {product.reviewCount} reviews
                      </p>
                      
                      {/* Rating Distribution */}
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => {
                          // Calculate percentage based on dummy data for this example
                          const percentage = rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 7 : rating === 2 ? 2 : 1;
                          
                          return (
                            <div key={rating} className="flex items-center text-sm">
                              <div className="flex items-center w-12">
                                <span className="text-gray-700">{rating}</span>
                                <Star size={12} className="ml-1 text-yellow-400" fill="currentColor" />
                              </div>
                              <div className="flex-grow h-2 mx-3 bg-gray-200 rounded-full">
                                <div 
                                  className="h-2 bg-yellow-400 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="w-8 text-gray-700">{percentage}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <button className="w-full bg-[#e65100] text-white py-2 rounded-md font-medium hover:bg-[#d84315] transition">
                      Write a Review
                    </button>
                  </div>
                  
                  {/* Review List */}
                  <div className="md:w-2/3">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Customer Reviews</h3>
                      <select className="p-1 text-sm border rounded">
                        <option>Most Recent</option>
                        <option>Highest Rated</option>
                        <option>Lowest Rated</option>
                      </select>
                    </div>
                    
                    <div className="space-y-6">
                      {product.reviews.map(review => (
                        <div key={review.id} className="pb-6 border-b">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center">
                              <div className="mr-2 font-medium">{review.author}</div>
                              {review.verified && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{review.date}</div>
                          </div>
                          
                          <div className="flex mb-2 text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={16} 
                                fill={i < review.rating ? "currentColor" : "none"}
                                className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                              />
                            ))}
                          </div>
                          
                          <h4 className="mb-2 font-medium">{review.title}</h4>
                          <p className="mb-4 text-gray-700">{review.content}</p>
                          
                          {review.image && (
                            <div className="mb-4">
                              <img 
                                src={review.image} 
                                alt={`Review by ${review.author}`} 
                                className="object-cover w-20 h-20 rounded"
                              />
                            </div>
                          )}
                          
                          <div className="flex gap-4 text-sm">
                            <button className="text-gray-500 hover:text-[#e65100]">Helpful (12)</button>
                            <button className="text-gray-500 hover:text-[#e65100]">Report</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 text-center">
                      <button className="text-[#e65100] font-medium hover:underline">
                        Load More Reviews
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Shipping & Returns Tab */}
            {activeTab === 'shipping' && (
              <div className="max-w-3xl mx-auto">
                <h2 className="mb-6 text-xl font-semibold">Shipping & Returns Information</h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="flex items-center mb-3 text-lg font-medium">
                      <Truck size={18} className="text-[#e65100] mr-2" />
                      Shipping Details
                    </h3>
                    <div className="p-4 space-y-4 rounded-md bg-gray-50">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium">Standard Shipping</h4>
                          <p className="text-sm text-gray-700">{product.shipping.estimatedDelivery}</p>
                          <p className="text-sm text-gray-500">
                            Free for orders over ${product.shipping.freeThreshold}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Express Shipping</h4>
                          <p className="text-sm text-gray-700">2-3 business days</p>
                          <p className="text-sm text-gray-500">
                            Additional fees apply
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="mb-1 text-sm font-medium">Delivery Tracking</h4>
                        <p className="text-sm text-gray-700">
                          All orders include tracking information sent via email once your order ships.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="mb-1 text-sm font-medium">International Shipping</h4>
                        <p className="text-sm text-gray-700">
                          We ship to most countries worldwide. International orders may be subject to customs fees and import duties.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="flex items-center mb-3 text-lg font-medium">
                      <RefreshCw size={18} className="text-[#e65100] mr-2" />
                      Returns Policy
                    </h3>
                    <div className="p-4 space-y-4 rounded-md bg-gray-50">
                      <p className="text-sm text-gray-700">
                        We offer a {product.shipping.returnPeriod}-day return policy for most items. To be eligible for a return:
                      </p>
                      
                      <ul className="space-y-2 text-sm text-gray-700">
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
                          <span>Initiate the return within {product.shipping.returnPeriod} days of delivery</span>
                        </li>
                      </ul>
                      
                      <div>
                        <h4 className="mb-1 text-sm font-medium">Limited Edition Items</h4>
                        <p className="text-sm text-gray-700">
                          Please note that some limited edition or made-to-order items may have different return policies.
                          These will be clearly marked on the product page.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="mb-1 text-sm font-medium">How to Initiate a Return</h4>
                        <p className="text-sm text-gray-700">
                          To start the return process, please contact our customer service team through
                          your account page or by emailing support@junooni.com.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Related Products */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">More From This Creator</h2>
            <a href="#" className="text-[#e65100] font-medium text-sm hover:underline flex items-center">
              View All
              <ArrowRight size={16} className="ml-1" />
            </a>
          </div>
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {product.relatedProducts.map(relatedProduct => (
              <div key={relatedProduct.id} className="overflow-hidden bg-white rounded-lg shadow-sm group">
                <div className="relative overflow-hidden">
                  <div className="aspect-[3/4]">
                    <img 
                      src={relatedProduct.image} 
                      alt={relatedProduct.name} 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  
                  {relatedProduct.isLimited && (
                    <div className="absolute left-3 top-3">
                      <span className="bg-[#e65100] text-white text-xs px-2 py-1 rounded">
                        Limited
                      </span>
                    </div>
                  )}
                  
                  <div className="absolute inset-x-0 bottom-0 p-3 transition-opacity opacity-0 bg-gradient-to-t from-black to-transparent group-hover:opacity-100">
                    <button className="w-full py-2 font-medium text-black transition bg-white rounded-md hover:bg-gray-100">
                      Quick View
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="mb-1 font-medium">{relatedProduct.name}</h3>
                  <p className="font-semibold text-gray-900">${relatedProduct.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recently Viewed */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recently Viewed</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {[1, 2, 3, 4].map(item => (
              <div key={`recent-${item}`} className="overflow-hidden bg-white rounded-lg shadow-sm group">
                <div className="relative overflow-hidden">
                  <div className="aspect-[3/4]">
                    <img 
                      src={`https://placehold.co/${300}/${400}`} 
                      alt={`Recent item ${item}`} 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="mb-1 font-medium">Product Name {item}</h3>
                  <p className="font-semibold text-gray-900">${(19.99 + item * 10).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Fan Photos */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Fan Photos</h2>
            <a href="#" className="text-[#e65100] font-medium text-sm hover:underline">
              View Gallery
            </a>
          </div>
          
          <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map(img => (
              <a key={`fan-${img}`} href="#" className="relative block overflow-hidden rounded-md group aspect-square">
                <img 
                  src={`https://placehold.co/${200}/${200}`} 
                  alt={`Fan photo ${img}`} 
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black opacity-0 bg-opacity-30 group-hover:opacity-100">
                  <div className="text-center text-white">
                    <p className="text-sm font-medium">@username</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;