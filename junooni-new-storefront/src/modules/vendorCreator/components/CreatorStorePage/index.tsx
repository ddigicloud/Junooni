'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { 
  Heart, 
  Share2, 
  Facebook,
  Bell, 
  Copy,
  MessageCircle,
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
} from 'lucide-react';
import { retriveVendorsFollowers, retriveVendorsProducts } from '@lib/data/vendors';
import {
  CreatorStorePageProps,
  FAQItemProps,
  DynamicProductCardProps,
  Vendor,
  Product,
  Creator,
  fadeIn,
  slideIn,
  staggerContainer
} from '../../../../types/vendor';
import { assets } from '@assets/assets';
import { Addfollower, deletefollower, retrieveCustomer } from '@lib/data/customer';

// Updated DynamicProductCardProps to include region
interface ExtendedProductCardProps extends DynamicProductCardProps {
  region: any;
}

const CreatorStorePage: React.FC<CreatorStorePageProps> = ({ vendor, region }) => {
  const [vendorProducts, setVendorProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [followers, setFollowers] = useState([]);

  const followerCounting = followers.map((item)=>{
    return item.follow
  })

console.log(followerCounting)
  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        console.log("Fetching followers for vendor ID:", vendor.id);
        const vendorFollowers = await retriveVendorsFollowers(vendor.id);
        
        // Check if the response is an array or needs to be converted
        const followersArray = Array.isArray(vendorFollowers) 
          ? vendorFollowers 
          : [vendorFollowers];
        
        // Filter out any undefined or null entries
        const validFollowers = followersArray.filter(f => f && f.follow);
        
        console.log("Processed followers:", validFollowers);
        setFollowers(validFollowers);
      } catch (e) {
        console.error("Error fetching followers:", e);
        setFollowers([]);
      }
    };
  
    if (vendor && vendor.id) {
      fetchFollowers();
    }
  }, [vendor]);
  
  // Optional: Helper function to generate avatar colors based on user ID
  // Place this function outside your component
  const generateAvatarColor = (userId: string): string => {
    // Simple hash function to generate a consistent color for a user
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to RGB format
    const r = (hash & 0xFF) % 200 + 55; // Avoid too dark colors
    const g = ((hash >> 8) & 0xFF) % 200 + 55;
    const b = ((hash >> 16) & 0xFF) % 200 + 55;
    
    return `rgb(${r}, ${g}, ${b})`;
  };


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
                      src={vendorItem.coverphoto} 
                      alt={`${vendorItem.name} cover`} 
                      className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center p-5">
                    <div className="relative w-16 h-16 mr-4 overflow-hidden border-2 border-white rounded-full shadow">
                      <div className="relative w-full h-full">
                        <img 
                          src={vendorItem.logo} 
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
  const [currentCustomer, setCurrentCustomer] = useState(null);
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
    profileImage: vendor.logo,
    coverImage: vendor.coverphoto,
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
  

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

const [copied, setCopied] = useState(false)
const [copyPosition, setCopyPosition] = useState<{ x: number; y: number } | null>(null)


const handleCopy = async (e: React.MouseEvent) => {
  try {
    await navigator.clipboard.writeText(currentUrl)
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setCopyPosition({ x: rect.left + rect.width / 2, y: rect.top })
    setCopied(true)
    setShowShareOptions(false) // close dropdown
    setTimeout(() => {
      setCopied(false)
      setCopyPosition(null)
    }, 1200)
  } catch (error) {
    console.error("Failed to copy:", error)
  }
}


  
  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent("Check out this creator on Junooni!")}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
  }
  

// Fetch current customer and check following status
useEffect(() => {
  const checkFollowingStatus = async () => {
    try {
      // Get current customer
      const customer = await retrieveCustomer();
      
      setCurrentCustomer(customer);
      
      if (customer && followers.length > 0) {
        // Check if this customer is already following the vendor
        const isAlreadyFollowing = followers.some(
          item => item.follow.follow?.customer_id === customer.id
        );
        console.log("successfully matched")
        setIsFollowing(isAlreadyFollowing);
        
      }
    } catch (error) {
      console.error("Error checking following status:", error);
    }
  };
  
  if (followers.length > 0) {
    checkFollowingStatus();
  }
}, [followers]);

// Updated follow handler function
const handleFollowToggle = async () => {
  try {

    console.log(currentCustomer)

    if (!currentCustomer) {
      console.log("User needs to be logged in to follow");
      return;
    }
    
    if (isFollowing) {
      console.log("Unfollowing vendor:", vendor.id);
      setIsFollowing(false);

      

      await deletefollower(vendor.id)
    } else {
      console.log("Following vendor:", vendor.id);
      await Addfollower(vendor.id)
      setIsFollowing(true);
    }
  } catch (error) {
    console.error("Error toggling follow status:", error);
    setIsFollowing(!isFollowing);
  }
};




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

  // Function to check if a product has a certain badge characteristic
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
                          onClick={handleFollowToggle}
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
                              className="absolute right-0 z-10 mt-2 bg-white rounded-md shadow-lg w-52"
                            >
                              <div className="py-1 text-sm text-gray-700">
                                <button
                                  onClick={handleCopy}
                                  className="flex items-center w-full px-4 py-2 hover:bg-[#e65100] hover:text-white"
                                >
                                  <Copy size={16} className="mr-2" />
                                  Copy Link
                                </button>
                                <a
                                  href={shareLinks.whatsapp}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setShowShareOptions(false)}
                                  className="flex items-center px-4 py-2 hover:bg-[#e65100] hover:text-white"
                                >
                                  <MessageCircle size={16} className="mr-2" />
                                  Share on WhatsApp
                                </a>
                                <a
                                  href={shareLinks.twitter}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setShowShareOptions(false)}
                                  className="flex items-center px-4 py-2 hover:bg-[#e65100] hover:text-white"
                                >
                                  <Twitter size={16} className="mr-2" />
                                  Share on Twitter
                                </a>
                                <a
                                  href={shareLinks.facebook}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setShowShareOptions(false)}
                                  className="flex items-center px-4 py-2 hover:bg-[#e65100] hover:text-white"
                                >
                                  <Facebook size={16} className="mr-2" />
                                  Share on Facebook
                                </a>
                              </div>
                            </motion.div>
                          )}
                          {copied && copyPosition && (
                          <div
                            className="fixed z-50 px-3 py-1 text-xs font-medium text-white rounded-md shadow"
                            style={{
                              top: `${copyPosition.y - 6}px`,
                              left: `${copyPosition.x}px`,
                              backgroundColor: "#e65100",
                              transform: "translateX(-50%)"
                            }}
                          >
                            Copied!
                          </div>
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
                        href={formatSocialUrl('instagram', creator.socialMedia.instagram) || undefined}
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
                        href={formatSocialUrl('twitter', creator.socialMedia.twitter) || undefined}
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
                        href={formatSocialUrl('youtube', creator.socialMedia.youtube) || undefined}
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
                        href={formatSocialUrl('website', creator.socialMedia.website) || undefined}
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
                  onClick={handleFollowToggle}
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
          </div>
        </motion.div>

         {/* Fan Testimonials Banner */}
{/* Fan Testimonials Banner with Default Avatar */}
<motion.div 
  variants={fadeIn}
  className="mb-8 bg-gradient-to-r from-[#e65100] to-[#ff9800] rounded-lg overflow-hidden shadow-md"
>
  <div className="flex flex-col items-center justify-between px-6 py-8 text-white md:flex-row">
    <div className="mb-4 md:mb-0">
      <h2 className="mb-2 text-xl font-bold">From the Fans</h2>
      <p>
        Join {followers.length > 0 ? followers.length : "thousands of"} fans who love {creator.name}'s exclusive merchandise
      </p>
      
      {followers.length > 3 && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-3 px-4 py-1.5 bg-white text-[#e65100] rounded-full text-sm font-medium flex items-center"
        >
          View All Fans <ArrowRight size={14} className="ml-1" />
        </motion.button>
      )}
    </div>
    
    <div className="flex -space-x-4">
      {followers && followers.length > 0 ? (
        // Map through actual followers
        followers.slice(0, 5).map((followerData, i) => {
          // Get the follower's customer data
          const follower = followerData.follow?.customer;
          if (!follower) return null;
          
          // Default avatar path - you can change this to your actual default avatar path
          const defaultAvatar = assets.rabit;
          
          return (
            <motion.div 
              key={follower.id} 
              whileHover={{ y: -5, zIndex: 10 }}
              className="relative w-10 h-10 overflow-hidden transition-all border-2 border-white rounded-full cursor-pointer"
              title={`${follower.first_name} ${follower.last_name}`}
            >
              {/* Use profile image if available, otherwise use default avatar */}
              <img 
                src={follower.profile_image || defaultAvatar} 
                alt={`${follower.first_name} ${follower.last_name}`}
                className="object-cover w-full h-full" 
                onError={(e) => {
                  // If the profile image or default avatar fails to load, use placeholder
                  e.currentTarget.src = `${defaultAvatar}`;
                }}
              />
              
              {/* Tooltip with more info on hover */}
              <div className="absolute z-20 w-32 p-2 text-xs text-gray-800 transition-opacity transform -translate-x-1/2 bg-white rounded shadow-md opacity-0 pointer-events-none hover:opacity-100 -bottom-16 left-1/2">
                <p className="font-semibold text-center">{follower.first_name} {follower.last_name}</p>
                <p className="text-center text-gray-500 truncate">{follower.email}</p>
              </div>
            </motion.div>
          );
        })
      ) : (
        // Fallback if no followers data is available
        [1, 2, 3].map((i) => (
          <motion.div 
            key={i} 
            className="w-10 h-10 overflow-hidden border-2 border-white rounded-full"
            whileHover={{ y: -3 }}
          >
            <img 
              src="/images/default-avatar.png" 
              alt={`Fan ${i}`} 
              className="object-cover w-full h-full" 
             
            />
          </motion.div>
        ))
      )}
      
      {/* Show the follower count */}
      <motion.div 
        whileHover={{ scale: 1.1 }}
        className="w-10 h-10 rounded-full bg-white text-[#e65100] font-bold flex items-center justify-center text-sm border-2 border-white"
      >
        {followers && followers.length > 5 
          ? `+${followers.length - 5}` 
          : "+"}
      </motion.div>
    </div>
  </div>
</motion.div>
        
        {/* Products Grid */}
        <motion.div 
          variants={slideIn}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">All Products</h2>
            
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-500">
                {Array.isArray(vendorProducts) ? vendorProducts.length : 0} items
              </span>
              <select className="border rounded-md p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#e65100]">
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
            !Array.isArray(vendorProducts) || vendorProducts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg text-gray-500">No products found.</p>
              </div>
            ) : (
              <motion.div 
                variants={staggerContainer}
                className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6"
              >
                {vendorProducts.map((product: Product) => (
                  <DynamicProductCard 
                    key={product.id} 
                    product={product} 
                    hasProductBadge={hasProductBadge}
                    region={region}
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

// Currency utility functions
function getCurrencySymbol(code: string | undefined): string {
  if (!code) return '$'; // Default to USD symbol
  
  switch (code.toLowerCase()) {
    case 'usd':
      return '$';
    case 'eur':
      return '€';
    case 'gbp':
      return '£';
    case 'jpy':
      return '¥';
    case 'inr':
      return '₹';
    case 'aud':
      return 'A$';
    case 'cad':
      return 'C$';
    case 'cny':
    case 'rmb':
      return '¥';
    default:
      return code.toUpperCase() + ' ';
  }
}

function formatPrice(amount: number, currencyCode: string | undefined): string {
  if (amount === 0) return '0.00';
  
  // For JPY, no decimal places are typically shown
  if (currencyCode && currencyCode.toLowerCase() === 'jpy') {
    return Math.round(amount).toString();
  }
  
  return amount.toFixed(2);
}

// Dynamic Product Card Component 
const DynamicProductCard: React.FC<ExtendedProductCardProps> = ({ product, hasProductBadge, region }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  
  // Extract required info from product with safety checks
  const productName = product?.title || 'Product';
  const productImage = product?.thumbnail ;
  const productHandle = product?.handle || '';
  
  // Get price from product variants based on region currency
  const getPriceData = () => {
    if (product?.variants?.length > 0) {
      const variant = product.variants[0];
      if (variant?.prices?.length > 0) {
        // Get current region's currency code
        const currencyCode = region?.currency_code || 'usd';
        
        // Try to find matching price
        const matchingPrice = variant.prices.find(p => 
          p.currency_code?.toLowerCase() === currencyCode.toLowerCase()
        );
        
        // Use matching price or fall back to first price
        const price = matchingPrice || variant.prices[0];
        
        if (price && typeof price.amount === 'number') {
          return {
            amount: price.amount,
            currencyCode: price.currency_code || currencyCode
          };
        }
      }
    }
    return { amount: 0, currencyCode: region?.currency_code || 'usd' };
  };
  
  const priceData = getPriceData();
  
  // Price component with currency formatting
  const PreviewPrice = ({ price }) => {
    const { amount, currencyCode } = price;
    const symbol = getCurrencySymbol(currencyCode);
    const formattedPrice = formatPrice(amount, currencyCode);
    
    return <span>{symbol}{formattedPrice}</span>;
  };
  
  // UI Components with proper type definitions
  const WishlistButton: React.FC<{variantId: string | undefined}> = ({ variantId }) => (
    <motion.button 
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="absolute z-20 p-2 bg-white rounded-full shadow-md right-3 top-3"
    >
      <Heart size={18} className="text-gray-700 hover:text-red-500" />
    </motion.button>
  );
  
  interface ThumbnailProps {
    thumbnail: string | null;
    images: any[];
    size: string;
    isFeatured: boolean;
  }
  
  const Thumbnail: React.FC<ThumbnailProps> = ({ thumbnail, images, size, isFeatured }) => (
    <img 
      src={thumbnail} 
      alt={productName} 
      className="object-cover w-full h-full"
    />
  );
  
  interface TextProps {
    className: string;
    children: React.ReactNode;
    [key: string]: any;
  }
  
  const Text: React.FC<TextProps> = ({ className, children, ...props }) => (
    <p className={className} {...props}>{children}</p>
  );
  
  interface LinkProps {
    href: string;
    children: React.ReactNode;
  }
  
  const LocalizedClientLink: React.FC<LinkProps> = ({ href, children }) => (
    <Link href={href}>{children}</Link>
  );
  
  // Extract tags from product if available
  const productTags = product?.tags || [];
  
  // Determine vendor name
  const vendorName = product?.vendor?.name || "Junooni";
  
  return (
    <motion.div 
      variants={slideIn}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid="product-wrapper"
      className="relative flex flex-col h-full group"
    >
      {/* Product image container with overlay effects */}
      <div className="relative overflow-hidden rounded-lg bg-gray-50 aspect-[4/5] mb-4">
        {/* Wishlist button */}
        <WishlistButton variantId={product.variants?.[0]?.id} />
        
        {/* Product tags */}
        <div className="absolute z-10 flex flex-wrap gap-2 left-3 top-3 max-w-[85%]">
          {productTags.map((tag) => (
            <span 
              key={tag.id} 
              className="px-2 py-1 text-xs font-medium text-white rounded bg-[#e65100] whitespace-nowrap"
            >
              {tag.value}
            </span>
          ))}
          {hasProductBadge(product, 'isNew') && (
            <span className="px-2 py-1 text-xs font-medium text-white bg-black rounded whitespace-nowrap">
              New
            </span>
          )}
          {hasProductBadge(product, 'isLimited') && (
            <span className="px-2 py-1 text-xs font-medium text-white rounded bg-[#e65100] whitespace-nowrap">
              Limited
            </span>
          )}
          {hasProductBadge(product, 'isSigned') && (
            <span className="px-2 py-1 text-xs font-medium text-white bg-purple-600 rounded whitespace-nowrap">
              Signed
            </span>
          )}
        </div>
        
        {/* Image container with transform effect */}
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
          <Thumbnail
            thumbnail={productImage}
            images={product.images || []}
            size="full"
            isFeatured={false}
          />
        </div>
        
        {/* Quick view overlay - appears on hover */}
        <motion.div 
          className="absolute inset-x-0 bottom-0 flex items-center justify-center p-2 transition-all bg-white/90"
          initial={{ translateY: "100%", opacity: 0 }}
          animate={{ 
            translateY: isHovered ? 0 : "100%", 
            opacity: isHovered ? 1 : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          <LocalizedClientLink href={`/products/${productHandle}`}>
            <span className="text-sm font-medium">Quick view</span>
          </LocalizedClientLink>
        </motion.div>
      </div>
      
      {/* Product info section */}
      <div className="flex-grow">
        {/* Vendor name */}
        <div className="mb-1 text-xs text-gray-500">
          By {vendorName}
        </div>
        
        {/* Product title and price */}
        <div className="flex items-start justify-between mb-2">
          <LocalizedClientLink href={`/products/${productHandle}`}>
            <Text 
              className="pr-2 text-base font-medium leading-tight line-clamp-2" 
              data-testid="product-title"
            >
              {productName}
            </Text>
          </LocalizedClientLink>
          <div className="font-semibold text-gray-900 whitespace-nowrap">
            <PreviewPrice price={priceData} />
          </div>
        </div>
      </div>
      
      {/* Color options - shown if product has color metadata */}
      {product.metadata && Object.entries(product.metadata).length > 0 && (
        <div className="pt-3 mt-auto">
          <ul className="flex items-center gap-x-1">
            {Object.entries(product.metadata).map(([key, value], index) => (
              <li key={index}>
                <div 
                  className="w-6 h-6 transition-transform border border-gray-200 rounded-full shadow-sm cursor-pointer hover:scale-110" 
                  style={{ backgroundColor: `${value}` }}
                  title={key}
                ></div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default CreatorStorePage;