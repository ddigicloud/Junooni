'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Heart, 
  ShoppingCart, 
  Share2, 
  Bell, 
  Instagram, 
  Twitter, 
  Youtube, 
  ExternalLink, 
  Calendar, 
  Tag,
  Mail,
  Users, 
  ChevronRight, 
  ArrowRight,
  MessageCircleMore,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { retriveVendorsProducts } from '@lib/data/vendors';
import {
  CreatorStorePageProps,
  TabButtonProps,
  FAQItemProps,
  DynamicProductCardProps,
  Vendor,
  Product,
  Creator,
  ProductOption,
  ProductVariant,
  fadeIn,
  slideIn,
  staggerContainer
} from '../../../../types/vendor'

const CreatorStorePage: React.FC<CreatorStorePageProps> = ({ vendor, region }) => {
  const [vendorProducts, setVendorProducts] = useState<Product[]>([]);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch vendor products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        if (vendor && !Array.isArray(vendor)) {
          const response = await retriveVendorsProducts(vendor.id);
          
          // Handle different possible response formats
          let products: Product[] = [];
          if (Array.isArray(response)) {
            products = response;
          } else if (response && response.products && Array.isArray(response.products)) {
            products = response.products;
          } else if (response && typeof response === 'object') {
            // If it's a single product object
            products = [response as Product];
          }
          
          setVendorProducts(products);
          
          // Extract unique categories from products
          if (Array.isArray(products) && products.length > 0) {
            const categories = new Set<string>();
            products.forEach((product: Product) => {
              // Extract collections
              if (product.collection && product.collection.id) {
                categories.add('collection');
              }
              
              // Extract product types
              if (product.type) {
                categories.add(product.type.toLowerCase());
              }
              
              // Extract categories from options (like "Color", "Size")
              if (product.options && Array.isArray(product.options)) {
                product.options.forEach((option: ProductOption) => {
                  if (option && option.title) {
                    categories.add(option.title.toLowerCase());
                  }
                });
              }
            });
            
            setProductCategories(Array.from(categories));
          }
        }
      } catch (error) {
        console.error("Error fetching vendor products:", error);
        setVendorProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [vendor]);

  // If this is the main page showing multiple vendors
  if (Array.isArray(vendor)) {
    return (
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="container px-4 py-12 mx-auto"
      >
        <motion.h1 
          variants={slideIn} 
          className="mb-8 text-4xl font-bold"
        >
          Creator Stores
        </motion.h1>
        <motion.div 
          variants={staggerContainer}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {vendor.map((vendorItem: Vendor) => (
            <motion.div key={vendorItem.id} variants={slideIn}>
              <Link href={`/creator/${vendorItem.handle}`} className="block transform transition-all duration-300 hover:scale-[1.02]">
                <div className="overflow-hidden transition-shadow bg-white rounded-lg shadow-md hover:shadow-xl">
                  <div className="overflow-hidden h-52">
                    <img 
                      src={vendorItem.coverphoto || "/api/placeholder/800/400"} 
                      alt={`${vendorItem.name} cover`} 
                      className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center p-5">
                    {/* Fixed logo styling with proper containment */}
                    <div className="relative w-16 h-16 mr-4 overflow-hidden border-2 border-white rounded-full shadow">
                      <div className="relative w-full h-full">
                        <img 
                          src={vendorItem.logo || "/api/placeholder/100/100"} 
                          alt={vendorItem.name} 
                          className="absolute inset-0 object-cover object-center w-full h-full" 
                        />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{vendorItem.name}</h2>
                      <p className="text-sm text-gray-600">{vendorItem.creator_title || "Creator"}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  // States for various interactive elements
  const [showFullBio, setShowFullBio] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [showShareOptions, setShowShareOptions] = useState<boolean>(false);
  
  // Merge API data with sample data for missing fields
  const creator: Creator = {
    id: vendor.id,
    name: vendor.name,
    handle: vendor.handle,
    role: vendor.creator_title || "Music Artist & Visual Creator", 
    verified: true, // Sample data (not in API)
    followers: 1250000, // Sample data (not in API)
    bio: vendor.creator_bio || "Artist bio not provided.",
    shortBio: vendor.creator_bio 
      ? (vendor.creator_bio.length > 150 ? vendor.creator_bio.substring(0, 150) + "..." : vendor.creator_bio)
      : "Artist bio not provided.",
    profileImage: vendor.logo || "/api/placeholder/800/800",
    coverImage: vendor.coverphoto || "/api/placeholder/1600/600",
    socialMedia: {
      instagram: vendor.instagram || null,
      twitter: vendor.xtwitter || null,
      youtube: vendor.youtube || null,
      website: vendor.othersocial || null
    },
    upcomingDrops: [
      { date: "Mar 28", title: "Summer Tour Collection" },
      { date: "Apr 15", title: "Limited Edition Vinyl + Merch Bundle" }
    ],
    stats: {
      products: Array.isArray(vendorProducts) ? vendorProducts.length : 0,
      limitedEditions: Array.isArray(vendorProducts) ? vendorProducts.filter(p => p.status === "published").length : 0,
      exclusives: Array.isArray(vendorProducts) ? vendorProducts.filter(p => p.is_giftcard).length : 0
    }
  };
  
  // Filter products based on active tab - with safety checks
  const filteredProducts: Product[] = activeTab === 'all' 
    ? (Array.isArray(vendorProducts) ? vendorProducts : [])
    : (Array.isArray(vendorProducts) ? vendorProducts.filter(product => {
        // Filter based on the selected category
        if (product.options && Array.isArray(product.options) && product.options.length > 0) {
          return product.options.some(option => 
            option && option.title && option.title.toLowerCase() === activeTab.toLowerCase()
          );
        }
        if (product.type && product.type.toLowerCase() === activeTab.toLowerCase()) {
          return true;
        }
        return false;
      }) : []);
  
  // Format large numbers with K/M suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Function to properly format social media URLs
  const formatSocialUrl = (type: string, username: string | null): string | null => {
    if (!username) return null;
    
    switch(type) {
      case 'instagram':
        return username.startsWith('http') ? username : `https://instagram.com/${username}`;
      case 'twitter':
        return username.startsWith('http') ? username : `https://twitter.com/${username}`;
      case 'youtube':
        return username.startsWith('http') ? username : `https://youtube.com/${username}`;
      case 'website':
        return username.startsWith('http') ? username : `https://${username}`;
      default:
        return username;
    }
  };

  // Function to get product price safely
  const getProductPrice = (product: Product): number => {
    if (product && product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      // Get the first variant with pricing, defaulting to the first variant if none have prices
      const variantWithPrice = product.variants[0];
      if (variantWithPrice) {
        // Return a default price if no pricing is available
        return variantWithPrice.price || 0;
      }
    }
    return 0;
  };

  // Function to check if a product has a certain badge characteristic - with safety checks
  const hasProductBadge = (product: Product, badgeType: string): boolean => {
    if (!product) return false;
    
    switch (badgeType) {
      case 'isNew':
        // Consider a product new if it was created within the last 30 days
        if (product.created_at) {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const createdAt = new Date(product.created_at);
          return createdAt > thirtyDaysAgo;
        }
        return false;
      
      case 'isLimited':
        // Consider a product limited if it has specific metadata or limited variants
        return product.discountable === false; // Just an example condition
      
      case 'isSigned':
        // Check if the product has any indication of being signed
        return product.material === 'cotton'; // Just an example condition
      
      default:
        return false;
    }
  };
  
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="min-h-screen mt-16 bg-gray-50"
    >
      {/* Cover Photo */}
      <motion.div 
        variants={fadeIn}
        className="relative w-full h-64 overflow-hidden bg-gray-300 md:h-80 lg:h-96"
      >
        <img 
          src={creator.coverImage} 
          alt={`${creator.name} cover`} 
          className="object-cover w-full h-full"
        />
        
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
        
        {/* Creator name on mobile */}
        <motion.div 
          variants={slideIn}
          className="absolute bottom-0 left-0 w-full p-4 md:hidden"
        >
          <h1 className="text-3xl font-bold text-white">{creator.name}</h1>
          <p className="text-gray-200">{creator.handle}</p>
        </motion.div>
      </motion.div>
      
      <div className="container px-4 mx-auto">
        {/* Creator Profile Section */}
        <motion.div 
          variants={slideIn}
          className="relative mb-8 -mt-20"
        >
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 md:p-6 md:pb-0">
              <div className="flex flex-col gap-6 md:flex-row">
                {/* Profile Picture with proper styling */}
                <motion.div 
                  variants={fadeIn}
                  className="relative w-32 h-32 md:w-40 md:h-40 md:-mt-24"
                >
                  <div className="w-full h-full overflow-hidden border-4 border-white rounded-full shadow-lg">
                    <div className="relative w-full h-full">
                      <img 
                        src={creator.profileImage} 
                        alt={creator.name} 
                        className="absolute inset-0 object-cover object-center w-full h-full" 
                      />
                    </div>
                  </div>
                  {creator.verified && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                      className="absolute bottom-0 right-0 bg-[#e65100] text-white p-1.5 rounded-full"
                    >
                      <Sparkles size={16} />
                    </motion.div>
                  )}
                </motion.div>
                
                <div className="flex-grow">
                  {/* Creator Name & Info (desktop) */}
                  <div className="hidden md:block">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                      <motion.div variants={slideIn}>
                        <h1 className="text-3xl font-bold">{creator.name}</h1>
                        <div className="flex items-center">
                          <p className="text-gray-600">{creator.handle}</p>
                          {creator.verified && (
                            <span className="ml-2 bg-[#e65100] text-white text-xs px-2 py-0.5 rounded-full">
                              Verified
                            </span>
                          )}
                        </div>
                      </motion.div>
                      
                      {/* Action Buttons */}
                      <motion.div 
                        variants={slideIn}
                        className="flex flex-wrap gap-2"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsFollowing(!isFollowing)}
                          className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition ${
                            isFollowing 
                              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                              : 'bg-[#e65100] text-white hover:bg-[#d84315]'
                          }`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                          {!isFollowing && <Bell size={16} className="ml-2" />}
                        </motion.button>
                        
                        <div className="relative">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowShareOptions(!showShareOptions)}
                            className="flex items-center px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-full hover:bg-gray-50"
                          >
                            Share <Share2 size={16} className="ml-2" />
                          </motion.button>
                          
                          {/* Share Dropdown */}
                          {showShareOptions && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute right-0 z-10 w-48 mt-2 bg-white rounded-md shadow-lg"
                            >
                              <div className="py-1">
                                <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <MessageCircleMore size={16} className="mr-2" />
                                  Copy Link
                                </a>
                                <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <Twitter size={16} className="mr-2" />
                                  Share on Twitter
                                </a>
                                <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <ExternalLink size={16} className="mr-2" />
                                  Share on Facebook
                                </a>
                                <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <Mail size={16} className="mr-2" />
                                  Email
                                </a>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Creator Role & Stats */}
                  <motion.div 
                    variants={slideIn}
                    className="flex flex-wrap items-center mb-4 text-sm text-gray-600 gap-x-6 gap-y-2"
                  >
                    <div>{creator.role}</div>
                    <div className="flex items-center">
                      <Users size={16} className="mr-1" />
                      <span>{formatNumber(creator.followers)} followers</span>
                    </div>
                    <div className="flex items-center">
                      <Tag size={16} className="mr-1" />
                      <span>{creator.stats.products} products</span>
                    </div>
                  </motion.div>
                  
                  {/* Bio */}
                  <motion.div 
                    variants={slideIn}
                    className="mb-4"
                  >
                    <p className="text-gray-700">
                      {showFullBio ? creator.bio : creator.shortBio}
                    </p>
                    {creator.bio && creator.bio.length > 150 && (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-[#e65100] text-sm font-medium mt-2 hover:underline"
                        onClick={() => setShowFullBio(!showFullBio)}
                      >
                        {showFullBio ? 'Show less' : 'Read more'}
                      </motion.button>
                    )}
                  </motion.div>
                  
                  {/* Social Media Links */}
                  <motion.div 
                    variants={staggerContainer}
                    className="flex flex-wrap gap-4 mt-4"
                  >
                    {creator.socialMedia.instagram && (
                      <motion.a 
                        variants={slideIn}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        href={formatSocialUrl('instagram', creator.socialMedia.instagram)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 transition-colors hover:text-[#E1306C]"
                        aria-label="Instagram"
                      >
                        <Instagram size={22} />
                      </motion.a>
                    )}
                    {creator.socialMedia.twitter && (
                      <motion.a 
                        variants={slideIn}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        href={formatSocialUrl('twitter', creator.socialMedia.twitter)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 transition-colors hover:text-[#1DA1F2]"
                        aria-label="Twitter"
                      >
                        <Twitter size={22} />
                      </motion.a>
                    )}
                    {creator.socialMedia.youtube && (
                      <motion.a 
                        variants={slideIn}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        href={formatSocialUrl('youtube', creator.socialMedia.youtube)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 transition-colors hover:text-[#FF0000]"
                        aria-label="YouTube"
                      >
                        <Youtube size={22} />
                      </motion.a>
                    )}
                    {creator.socialMedia.website && (
                      <motion.a 
                        variants={slideIn}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        href={formatSocialUrl('website', creator.socialMedia.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 transition-colors hover:text-[#e65100]"
                        aria-label="Website"
                      >
                        <ExternalLink size={22} />
                      </motion.a>
                    )}
                  </motion.div>
                </div>
              </div>
              
              {/* Mobile Action Buttons */}
              <motion.div 
                variants={slideIn}
                className="flex justify-between gap-2 mt-4 md:hidden"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition ${
                    isFollowing 
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                      : 'bg-[#e65100] text-white hover:bg-[#d84315]'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="flex items-center justify-center flex-1 px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-full hover:bg-gray-50"
                >
                  Share
                </motion.button>
              </motion.div>
            </div>
            
            {/* Upcoming Drops Section */}
            {creator.upcomingDrops && creator.upcomingDrops.length > 0 && (
              <motion.div 
                variants={slideIn}
                className="p-4 mt-6 border-t bg-gray-50 md:p-6"
              >
                <h3 className="flex items-center mb-3 font-semibold">
                  <Calendar size={18} className="mr-2 text-[#e65100]" />
                  Upcoming Drops
                </h3>
                <motion.div 
                  variants={staggerContainer}
                  className="flex flex-col gap-2"
                >
                  {creator.upcomingDrops.map((drop, index) => (
                    <motion.div 
                      key={index}
                      variants={slideIn}
                      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                      className="flex items-center justify-between p-3 transition bg-white border rounded-md hover:shadow-md"
                    >
                      <div className="flex items-center">
                        <div className="bg-[#e65100] text-white text-xs font-bold px-2 py-1 rounded mr-3">
                          {drop.date}
                        </div>
                        <span className="font-medium">{drop.title}</span>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-[#e65100] text-sm font-medium hover:underline flex items-center"
                      >
                        Remind me
                        <Bell size={14} className="ml-1" />
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
            
            {/* Product Categories Tabs */}
            <motion.div 
              variants={fadeIn}
              className="mt-6 border-t"
            >
              <div className="overflow-x-auto">
                <div className="flex px-4 py-2 whitespace-nowrap">
                  <TabButton 
                    active={activeTab === 'all'} 
                    onClick={() => setActiveTab('all')}
                  >
                    All Products
                  </TabButton>
                  
                  {/* Dynamic category tabs based on available categories */}
                  {Array.isArray(productCategories) && productCategories.map((category: string) => (
                    <TabButton 
                      key={category}
                      active={activeTab === category} 
                      onClick={() => setActiveTab(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </TabButton>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Products Grid */}
        <motion.div 
          variants={slideIn}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {activeTab === 'all' ? 'All Products' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-500">
                {Array.isArray(filteredProducts) ? filteredProducts.length : 0} items
              </span>
              <select className="border rounded-md  p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#e65100]">
                <option>Sort: Featured</option>
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full border-t-[#e65100] animate-spin"></div>
            </div>
          ) : (
            !Array.isArray(filteredProducts) || filteredProducts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg text-gray-500">No products found in this category.</p>
              </div>
            ) : (
              <motion.div 
                variants={staggerContainer}
                className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6"
              >
                {filteredProducts.map((product: Product) => (
                  <DynamicProductCard 
                    key={product.id} 
                    product={product} 
                    hasProductBadge={hasProductBadge} 
                  />
                ))}
              </motion.div>
            )
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Component for Tab Buttons
const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ y: 1 }}
      className={`px-4 py-2 mx-1 font-medium text-sm transition-colors border-b-2 ${
        active
          ? 'border-[#e65100] text-[#e65100]'
          : 'border-transparent hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

// Component for FAQ Items
const FAQItem: React.FC<FAQItemProps> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  return (
    <motion.details 
      variants={slideIn}
      className="py-3"
      open={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
    >
      <summary className="flex items-center justify-between cursor-pointer">
        <span className="font-medium">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-5 h-5 transition-transform transform" />
        </motion.div>
      </summary>
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="pt-3 pl-4 text-gray-600"
      >
        {children}
      </motion.div>
    </motion.details>
  );
};

// Dynamic Product Card Component 
const DynamicProductCard: React.FC<DynamicProductCardProps> = ({ product, hasProductBadge }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  
  // Extract required info from product with safety checks
  const productName = product?.title || 'Product';
  const productImage = product?.thumbnail || '/api/placeholder/500/650';
  const productHandle = product?.handle || '';
  
  // Get price (fixed since actual price may not be in the data)
  const price = 45.99;
  
  return (
    <motion.div 
      variants={slideIn}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="overflow-hidden bg-white rounded-lg shadow-sm group"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <Link href={`/products/${productHandle}`}>
          <div className="aspect-[3/4]">
            <motion.img 
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.5 }}
              src={productImage} 
              alt={productName} 
              className="object-cover w-full h-full"
            />
          </div>
        </Link>
        
        {/* Badges */}
        <div className="absolute flex flex-col gap-2 left-3 top-3">
          {hasProductBadge(product, 'isNew') && (
            <motion.span 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="px-2 py-1 text-xs text-white bg-black rounded"
            >
              New
            </motion.span>
          )}
          {hasProductBadge(product, 'isLimited') && (
            <motion.span 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-[#e65100] text-white text-xs px-2 py-1 rounded"
            >
              Limited
            </motion.span>
          )}
          {hasProductBadge(product, 'isSigned') && (
            <motion.span 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="px-2 py-1 text-xs text-white bg-purple-600 rounded"
            >
              Signed
            </motion.span>
          )}
        </div>
        
        {/* Quick actions */}
        <motion.div 
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute right-3 top-3"
        >
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-white rounded-full shadow-md"
          >
            <Heart size={18} className="text-gray-700 hover:text-red-500" />
          </motion.button>
        </motion.div>
        
        {/* Quick Add */}
        <motion.div 
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black to-transparent"
        >
          <Link href={`/products/${productHandle}`}>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center w-full py-2 font-medium text-black transition bg-white rounded-md hover:bg-gray-100"
            >
              <ShoppingBag size={16} className="mr-2" />
              View Product
            </motion.button>
          </Link>
        </motion.div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className="mb-1 text-lg font-medium">{productName}</h3>
        {product?.variants && Array.isArray(product.variants) && product.variants.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-2">
            {product.variants.slice(0, 3).map((variant: ProductVariant, index: number) => (
              <div key={variant.id} className="px-2 py-1 text-xs bg-gray-100 rounded">
                {variant.title}
              </div>
            ))}
            {product.variants.length > 3 && (
              <div className="px-2 py-1 text-xs bg-gray-100 rounded">
                +{product.variants.length - 3} more
              </div>
            )}
          </div>
        ) : null}
        <p className="font-semibold text-gray-900">${price.toFixed(2)}</p>
      </div>
    </motion.div>
  );
};

export default CreatorStorePage;