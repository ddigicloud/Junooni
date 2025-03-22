'use client'

import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Share2, Bell, Instagram, Twitter, Youtube, ExternalLink, Calendar, Tag, Users, ChevronRight, ArrowRight } from 'lucide-react';

const CreatorStorePage = () => {
  // States for various interactive elements
  const [showFullBio, setShowFullBio] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  // Sample creator data (would come from your Medusa backend)
  const creator = {
    id: "creator-123",
    name: "Alex Rivera",
    handle: "@alexcreates",
    role: "Music Artist & Visual Creator",
    verified: true,
    followers: 1250000,
    bio: "Alex Rivera is a multi-disciplinary artist known for blending music and visual art in groundbreaking ways. Born in Chicago and based in Los Angeles, Alex's work spans electronic music production, immersive installations, and digital art.\n\nAfter gaining recognition for a viral track in 2019, Alex has collaborated with major brands and fellow artists across the globe. Their artistic philosophy centers on creating experiences that connect people across digital and physical spaces.\n\nAlex's merchandise is designed to extend the artistic experience beyond performances and into fans' everyday lives, with each piece containing elements of their visual aesthetic and musical themes.",
    shortBio: "Multi-disciplinary artist known for blending music and visual art in groundbreaking ways. Based in Los Angeles, creating experiences that connect people across digital and physical spaces.",
    profileImage: "/api/placeholder/800/800",
    coverImage: "/api/placeholder/1600/600",
    socialMedia: {
      instagram: "alexcreates",
      twitter: "alexrivera",
      youtube: "AlexRiveraOfficial",
      website: "https://alexrivera.com"
    },
    upcomingDrops: [
      { date: "Mar 28", title: "Summer Tour Collection" },
      { date: "Apr 15", title: "Limited Edition Vinyl + Merch Bundle" }
    ],
    stats: {
      products: 24,
      limitedEditions: 5,
      exclusives: 3
    }
  };
  
  // Sample products data
  const products = [
    { 
      id: 1, 
      name: "Tour Graphic Tee", 
      price: 45.00, 
      isLimited: true,
      isSigned: false,
      isNew: true,
      category: "apparel",
      image: "/api/placeholder/500/650"
    },
    { 
      id: 2, 
      name: "Album Cover Hoodie", 
      price: 85.00, 
      isLimited: false,
      isSigned: false,
      isNew: false,
      category: "apparel",
      image: "/api/placeholder/500/650"
    },
    { 
      id: 3, 
      name: "Signed Vinyl Record", 
      price: 65.00, 
      isLimited: true,
      isSigned: true,
      isNew: false,
      category: "collectibles",
      image: "/api/placeholder/500/650"
    },
    { 
      id: 4, 
      name: "Digital Art Print", 
      price: 29.99, 
      isLimited: false,
      isSigned: false,
      isNew: true,
      category: "art",
      image: "/api/placeholder/500/650"
    },
    { 
      id: 5, 
      name: "Festival Beanie", 
      price: 35.00, 
      isLimited: false,
      isSigned: false,
      isNew: false,
      category: "accessories",
      image: "/api/placeholder/500/650"
    },
    { 
      id: 6, 
      name: "Limited Studio Session Video", 
      price: 19.99, 
      isLimited: true,
      isSigned: false,
      isNew: true,
      category: "digital",
      image: "/api/placeholder/500/650"
    },
    { 
      id: 7, 
      name: "Artist Collaboration Jacket", 
      price: 129.99, 
      isLimited: true,
      isSigned: false,
      isNew: false,
      category: "apparel",
      image: "/api/placeholder/500/650"
    },
    { 
      id: 8, 
      name: "Exclusive Studio Tour Package", 
      price: 249.99, 
      isLimited: true,
      isSigned: true,
      isNew: true,
      category: "experiences",
      image: "/api/placeholder/500/650"
    }
  ];
  
  // Filter products based on active tab
  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(product => product.category === activeTab);
  
  // Format large numbers with K/M suffix
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo */}
      <div className="relative w-full h-64 overflow-hidden bg-gray-300 md:h-80 lg:h-96">
        <img 
          src={creator.coverImage} 
          alt={`${creator.name} cover`} 
          className="object-cover w-full h-full"
        />
        
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
        
        {/* Creator name on mobile */}
        <div className="absolute bottom-0 left-0 w-full p-4 md:hidden">
          <h1 className="text-3xl font-bold text-white">{creator.name}</h1>
          <p className="text-gray-200">{creator.handle}</p>
        </div>
      </div>
      
      <div className="container px-4 mx-auto">
        {/* Creator Profile Section */}
        <div className="relative mb-8 -mt-20">
          <div className="overflow-hidden bg-white rounded-lg shadow-md">
            <div className="p-4 md:p-6 md:pb-0">
              <div className="flex flex-col gap-6 md:flex-row">
                {/* Profile Picture */}
                <div className="relative w-32 h-32 overflow-hidden border-4 border-white rounded-full shadow-lg md:-mt-24 md:w-40 md:h-40">
                  <img 
                    src={creator.profileImage} 
                    alt={creator.name} 
                    className="object-cover w-full h-full" 
                  />
                  {creator.verified && (
                    <div className="absolute bottom-0 right-0 bg-[#e65100] text-white p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow">
                  {/* Creator Name & Info (desktop) */}
                  <div className="hidden md:block">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                      <div>
                        <h1 className="text-3xl font-bold">{creator.name}</h1>
                        <div className="flex items-center">
                          <p className="text-gray-600">{creator.handle}</p>
                          {creator.verified && (
                            <span className="ml-2 bg-[#e65100] text-white text-xs px-2 py-0.5 rounded-full">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setIsFollowing(!isFollowing)}
                          className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition ${
                            isFollowing 
                              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                              : 'bg-[#e65100] text-white hover:bg-[#d84315]'
                          }`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                          {!isFollowing && <Bell size={16} className="ml-2" />}
                        </button>
                        
                        <div className="relative">
                          <button
                            onClick={() => setShowShareOptions(!showShareOptions)}
                            className="flex items-center px-4 py-2 text-sm font-medium bg-white border rounded-full hover:bg-gray-50"
                          >
                            Share <Share2 size={16} className="ml-2" />
                          </button>
                          
                          {/* Share Dropdown */}
                          {showShareOptions && (
                            <div className="absolute right-0 z-10 w-48 mt-2 bg-white rounded-md shadow-lg">
                              <div className="py-1">
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  Copy Link
                                </a>
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  Share on Twitter
                                </a>
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  Share on Facebook
                                </a>
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  Email
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Creator Role & Stats */}
                  <div className="flex flex-wrap items-center mb-4 text-sm text-gray-600 gap-x-6 gap-y-2">
                    <div>{creator.role}</div>
                    <div className="flex items-center">
                      <Users size={16} className="mr-1" />
                      <span>{formatNumber(creator.followers)} followers</span>
                    </div>
                    <div className="flex items-center">
                      <Tag size={16} className="mr-1" />
                      <span>{creator.stats.products} products</span>
                    </div>
                  </div>
                  
                  {/* Bio */}
                  <div className="mb-4">
                    <p className="text-gray-700">
                      {showFullBio ? creator.bio : creator.shortBio}
                    </p>
                    <button 
                      className="text-[#e65100] text-sm font-medium mt-2 hover:underline"
                      onClick={() => setShowFullBio(!showFullBio)}
                    >
                      {showFullBio ? 'Show less' : 'Read more'}
                    </button>
                  </div>
                  
                  {/* Social Media Links */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {creator.socialMedia.instagram && (
                      <a 
                        href={`https://instagram.com/${creator.socialMedia.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#e65100] transition-colors"
                      >
                        <Instagram size={20} />
                      </a>
                    )}
                    {creator.socialMedia.twitter && (
                      <a 
                        href={`https://twitter.com/${creator.socialMedia.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#e65100] transition-colors"
                      >
                        <Twitter size={20} />
                      </a>
                    )}
                    {creator.socialMedia.youtube && (
                      <a 
                        href={`https://youtube.com/${creator.socialMedia.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#e65100] transition-colors"
                      >
                        <Youtube size={20} />
                      </a>
                    )}
                    {creator.socialMedia.website && (
                      <a 
                        href={creator.socialMedia.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#e65100] transition-colors"
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Mobile Action Buttons */}
              <div className="flex justify-between gap-2 mt-4 md:hidden">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition ${
                    isFollowing 
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                      : 'bg-[#e65100] text-white hover:bg-[#d84315]'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                
                <button
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="flex items-center justify-center flex-1 px-4 py-2 text-sm font-medium bg-white border rounded-full hover:bg-gray-50"
                >
                  Share
                </button>
              </div>
            </div>
            
            {/* Upcoming Drops Section */}
            {creator.upcomingDrops.length > 0 && (
              <div className="p-4 mt-6 border-t bg-gray-50 md:p-6">
                <h3 className="flex items-center mb-3 font-semibold">
                  <Calendar size={18} className="mr-2 text-[#e65100]" />
                  Upcoming Drops
                </h3>
                <div className="flex flex-col gap-2">
                  {creator.upcomingDrops.map((drop, index) => (
                    <div key={index} className="flex items-center justify-between p-3 transition bg-white border rounded-md hover:shadow-sm">
                      <div className="flex items-center">
                        <div className="bg-[#e65100] text-white text-xs font-bold px-2 py-1 rounded mr-3">
                          {drop.date}
                        </div>
                        <span className="font-medium">{drop.title}</span>
                      </div>
                      <button className="text-[#e65100] text-sm font-medium hover:underline flex items-center">
                        Remind me
                        <Bell size={14} className="ml-1" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Product Categories Tabs */}
            <div className="mt-6 border-t">
              <div className="overflow-x-auto">
                <div className="flex px-4 py-2 whitespace-nowrap">
                  <button
                    className={`px-4 py-2 mx-1 font-medium text-sm transition-colors border-b-2 ${
                      activeTab === 'all'
                        ? 'border-[#e65100] text-[#e65100]'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('all')}
                  >
                    All Products
                  </button>
                  
                  <button
                    className={`px-4 py-2 mx-1 font-medium text-sm transition-colors border-b-2 ${
                      activeTab === 'apparel'
                        ? 'border-[#e65100] text-[#e65100]'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('apparel')}
                  >
                    Apparel
                  </button>
                  
                  <button
                    className={`px-4 py-2 mx-1 font-medium text-sm transition-colors border-b-2 ${
                      activeTab === 'collectibles'
                        ? 'border-[#e65100] text-[#e65100]'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('collectibles')}
                  >
                    Collectibles
                  </button>
                  
                  <button
                    className={`px-4 py-2 mx-1 font-medium text-sm transition-colors border-b-2 ${
                      activeTab === 'art'
                        ? 'border-[#e65100] text-[#e65100]'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('art')}
                  >
                    Art
                  </button>
                  
                  <button
                    className={`px-4 py-2 mx-1 font-medium text-sm transition-colors border-b-2 ${
                      activeTab === 'digital'
                        ? 'border-[#e65100] text-[#e65100]'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('digital')}
                  >
                    Digital
                  </button>
                  
                  <button
                    className={`px-4 py-2 mx-1 font-medium text-sm transition-colors border-b-2 ${
                      activeTab === 'experiences'
                        ? 'border-[#e65100] text-[#e65100]'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('experiences')}
                  >
                    Experiences
                  </button>
                  
                  <button
                    className={`px-4 py-2 mx-1 font-medium text-sm transition-colors border-b-2 ${
                      activeTab === 'accessories'
                        ? 'border-[#e65100] text-[#e65100]'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('accessories')}
                  >
                    Accessories
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Fan Testimonials Banner */}
        <div className="mb-8 bg-gradient-to-r from-[#e65100] to-[#ff9800] rounded-lg overflow-hidden shadow-md">
          <div className="flex flex-col items-center justify-between px-6 py-8 text-white md:flex-row">
            <div className="mb-4 md:mb-0">
              <h2 className="mb-2 text-xl font-bold">From the Fans</h2>
              <p>Join thousands of fans who love {creator.name}'s exclusive merchandise</p>
            </div>
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 overflow-hidden border-2 border-white rounded-full">
                  <img src={`/api/placeholder/${50}/${50}`} alt={`Fan ${i}`} className="object-cover w-full h-full" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full bg-white text-[#e65100] font-bold flex items-center justify-center text-sm border-2 border-white">
                +2K
              </div>
            </div>
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {activeTab === 'all' ? 'All Products' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-500">{filteredProducts.length} items</span>
              <select className="border rounded-md p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#e65100]">
                <option>Sort: Featured</option>
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="overflow-hidden bg-white rounded-lg shadow-sm group">
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <div className="aspect-[3/4]">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute flex flex-col gap-2 left-3 top-3">
                    {product.isNew && (
                      <span className="px-2 py-1 text-xs text-white bg-black rounded">
                        New
                      </span>
                    )}
                    {product.isLimited && (
                      <span className="bg-[#e65100] text-white text-xs px-2 py-1 rounded">
                        Limited
                      </span>
                    )}
                    {product.isSigned && (
                      <span className="px-2 py-1 text-xs text-white bg-purple-600 rounded">
                        Signed
                      </span>
                    )}
                  </div>
                  
                  {/* Quick actions */}
                  <div className="absolute right-3 top-3">
                    <button className="p-2 transition-opacity bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100">
                      <Heart size={18} />
                    </button>
                  </div>
                  
                  {/* Quick Add */}
                  <div className="absolute inset-x-0 bottom-0 p-3 transition-opacity opacity-0 bg-gradient-to-t from-black to-transparent group-hover:opacity-100">
                    <button className="w-full py-2 font-medium text-black transition bg-white rounded-md hover:bg-gray-100">
                      Quick Add
                    </button>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  <h3 className="mb-1 text-lg font-medium">{product.name}</h3>
                  <p className="font-semibold text-gray-900">${product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Behind the Scenes Section */}
        <div className="mb-12 overflow-hidden bg-white rounded-lg shadow-md">
          <div className="md:flex">
            <div className="p-6 md:w-1/2 md:p-8">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">
                  BEHIND THE SCENES
                </span>
              </div>
              <h2 className="mb-4 text-2xl font-bold">The Making of the Collection</h2>
              <p className="mb-6 text-gray-700">
                Get a glimpse into {creator.name}'s creative process. Each piece in this collection represents a specific moment or emotion from the artist's journey. The designs are influenced by both personal experiences and fan interactions over the years.
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center p-4 bg-gray-100 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-[#e65100] text-white flex items-center justify-center mr-3">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Collection Started</div>
                    <div className="font-medium">January 2024</div>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-100 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-[#e65100] text-white flex items-center justify-center mr-3">
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Fan Input</div>
                    <div className="font-medium">3,500+ Ideas</div>
                  </div>
                </div>
              </div>
              <a 
                href="#" 
                className="inline-flex items-center text-[#e65100] font-medium hover:underline"
              >
                Watch the full story <ArrowRight size={16} className="ml-1" />
              </a>
            </div>
            <div className="bg-gray-200 md:w-1/2">
              <div className="aspect-video md:h-full">
                <img src="/api/placeholder/800/600" alt="Behind the scenes" className="object-cover w-full h-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full bg-opacity-80">
                    <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-[#e65100] ml-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Fan Community Showcase */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Fan Community</h2>
            <a href="#" className="text-[#e65100] font-medium hover:underline flex items-center">
              View all <ChevronRight size={16} />
            </a>
          </div>
          
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((img) => (
              <a key={img} href="#" className="relative block overflow-hidden rounded-md group aspect-square">
                <img 
                  src={`/api/placeholder/${300}/${300}`} 
                  alt={`Fan photo ${img}`} 
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black opacity-0 bg-opacity-30 group-hover:opacity-100">
                  <div className="text-center text-white">
                    <p className="font-medium">@username</p>
                    <div className="flex items-center justify-center mt-2">
                      <Heart size={16} className="mr-1" />
                      <span className="text-sm">256</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
          
          <div className="p-4 mt-6 text-center bg-gray-100 rounded-lg md:p-6">
            <h3 className="mb-2 font-bold">Show Off Your Merch!</h3>
            <p className="mb-4 text-gray-700">Share your photos with #{creator.handle.replace('@', '')} to be featured in our fan gallery</p>
            <button className="bg-[#e65100] text-white px-6 py-2 rounded-full hover:bg-[#d84315] transition">
              Share Your Photo
            </button>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mb-12 overflow-hidden bg-white rounded-lg shadow-md">
          <div className="p-6 md:p-8">
            <h2 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h2>
            
            <div className="divide-y">
              <details className="py-3">
                <summary className="flex items-center justify-between cursor-pointer">
                  <span className="font-medium">How long does shipping take?</span>
                  <ChevronRight className="w-5 h-5 transition-transform transform" />
                </summary>
                <div className="pt-3 pl-4 text-gray-600">
                  Standard shipping takes 5-7 business days. Express shipping (2-3 business days) is available for an additional fee.
                </div>
              </details>
              
              <details className="py-3">
                <summary className="flex items-center justify-between cursor-pointer">
                  <span className="font-medium">Are the limited edition items really limited?</span>
                  <ChevronRight className="w-5 h-5 transition-transform transform" />
                </summary>
                <div className="pt-3 pl-4 text-gray-600">
                  Yes, all limited edition merchandise is produced in specific quantities and will not be reproduced once sold out.
                </div>
              </details>
              
              <details className="py-3">
                <summary className="flex items-center justify-between cursor-pointer">
                  <span className="font-medium">How can I get signed merchandise?</span>
                  <ChevronRight className="w-5 h-5 transition-transform transform" />
                </summary>
                <div className="pt-3 pl-4 text-gray-600">
                  Signed merchandise is released in limited quantities for special occasions. Follow {creator.name} to get notified about upcoming signed merch drops.
                </div>
              </details>
              
              <details className="py-3">
                <summary className="flex items-center justify-between cursor-pointer">
                  <span className="font-medium">Do you ship internationally?</span>
                  <ChevronRight className="w-5 h-5 transition-transform transform" />
                </summary>
                <div className="pt-3 pl-4 text-gray-600">
                  Yes, we ship to most countries worldwide. International shipping times vary by location.
                </div>
              </details>
            </div>
          </div>
        </div>
        
        {/* Email Signup */}
        <div className="mb-12 overflow-hidden text-white bg-black rounded-lg shadow-md">
          <div className="p-6 text-center md:p-8">
            <h3 className="mb-2 text-xl font-bold">Get Creator Updates First</h3>
            <p className="max-w-xl mx-auto mb-6">
              Subscribe to receive notifications about {creator.name}'s exclusive merch drops, behind-the-scenes content, and fan events.
            </p>
            <div className="flex flex-col max-w-lg gap-3 mx-auto sm:flex-row">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e65100] text-white"
              />
              <button 
                type="submit" 
                className="px-6 py-3 bg-[#e65100] text-white font-medium rounded-md hover:bg-[#d84315] transition"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorStorePage;