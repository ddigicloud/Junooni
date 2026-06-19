"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import WishlistButton from "@modules/wishlists/components/wishlist-button"
import { listProducts, getProductReviews } from "@lib/data/products"
import { motion } from "framer-motion"
import {
  Heart,
  Share2,
  Bell,
  Instagram,
  Twitter,
  X,
  Youtube,
   Facebook,
  ExternalLink,
  Calendar,
  Tag,
  Mail,
  Users,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  ArrowRight,
  MessageCircleMore,
  Sparkles,
  Star,
  Check,
} from "lucide-react"
import {
  CreatorStorePageProps,
  FAQItemProps,
  DynamicProductCardProps,
  Vendor,
  Product,
  Creator,
  fadeIn,
  slideIn,
  staggerContainer,
} from "../../../../types/vendor"
import { assets } from "@assets/assets"
import Twittericon from "@assets/twitter.png"
import {
  Addfollower,
  deletefollower,
  retrieveCustomer,
} from "@lib/data/customer"
import { toast } from "react-toastify"
import profileplaceholder from "@assets/profile-logo.png"


// Updated DynamicProductCardProps to include region
interface ExtendedProductCardProps extends DynamicProductCardProps {
  region: any
  reviewData?: { averageRating: number; reviewCount: number }
}

// Currency utility functions
function getCurrencySymbol(code: string | undefined): string {
  if (!code) return "$" // Default to USD symbol

  switch (code.toLowerCase()) {
    case "usd":
      return "$"
    case "eur":
      return "€"
    case "gbp":
      return "£"
    case "jpy":
      return "¥"
    case "inr":
      return "₹"
    case "aud":
      return "A$"
    case "cad":
      return "C$"
    case "cny":
    case "rmb":
      return "¥"
    default:
      return code.toUpperCase() + " "
  }
}

function formatPrice(amount: number, currencyCode: string | undefined): string {
  if (amount === 0) return "0.00"

  // For JPY, no decimal places are typically shown
  if (currencyCode && currencyCode.toLowerCase() === "jpy") {
    return Math.round(amount).toString()
  }

  return amount.toFixed(2)
}

// Color name to hex mapping function
const getColorHexFromName = (colorName: string): string => {
  const cleanName = colorName
    .replace(/^Color_/i, '')
    .replace(/^colour_/i, '')
    .toLowerCase()
    .trim()

  const colorMap: { [key: string]: string } = {
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#008000',
    'yellow': '#FFFF00',
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'brown': '#A52A2A',
    'darkred': '#780000',
    'cyan': '#000FFF',
    'lightpink': '#ffe5ec',
    'gray': '#808080',
    'grey': '#808080',
    'navy': '#000080',
    'maroon': '#800000',
    'olive': '#808000',
    'lime': '#00FF00',
    'aqua': '#00FFFF',
    'teal': '#008080',
    'silver': '#C0C0C0',
    'fuchsia': '#FF00FF',
    'beige': '#F5F5DC',
    'khaki': '#F0E68C',
    'coral': '#FF7F50',
    'salmon': '#FA8072',
    'gold': '#FFD700',
  }

  return colorMap[cleanName] || '#CCCCCC'
}

// Extract color information from product metadata (handles both regular and JSON colors)
const extractProductColors = (metadata: any): Array<{name: string, hex: string, key: string}> => {
  //console.log("🎨 Extracting colors from metadata:", metadata)
  
  if (!metadata || typeof metadata !== 'object') {
    //console.log("🎨 No metadata or invalid metadata")
    return []
  }

  const colors: Array<{name: string, hex: string, key: string}> = []
  
  Object.entries(metadata).forEach(([key, value]) => {
    const lowerKey = key.toLowerCase()
    
    if (lowerKey.includes('color') || lowerKey.includes('colour')) {
      //console.log(`🎨 Found color key: ${key} = "${value}"`)
      
      // Case 1: Value contains JSON array of colors
      if (typeof value === 'string' && value.trim().startsWith('[') && value.trim().endsWith(']')) {
        //console.log(`🎨 Found JSON color array: ${value}`)
        try {
          const colorArray = JSON.parse(value)
          if (Array.isArray(colorArray)) {
            colorArray.forEach((colorItem, index) => {
              if (colorItem && typeof colorItem === 'object' && colorItem.name && colorItem.hex) {
                //console.log(`🎨 Parsed color from JSON: ${colorItem.name} = ${colorItem.hex}`)
                colors.push({
                  name: colorItem.name,
                  hex: colorItem.hex,
                  key: `${key}_${index}`
                })
              }
            })
            return // Skip other processing for this key
          }
        } catch (error) {
          //console.log(`🎨 Failed to parse JSON colors: ${error}`)
        }
      }
      
      // Case 2: Value contains single hex code
      else if (typeof value === 'string' && value.match(/^#[0-9A-Fa-f]{6}$/)) {
        //console.log(`🎨 Found hex value: ${value}`)
        colors.push({
          name: key.replace(/^Color_/i, '').replace(/^colour_/i, ''),
          hex: value,
          key: key
        })
      }
      
      // Case 3: Value contains color name
      else if (typeof value === 'string' && value.trim() && value !== '' && !value.includes('{') && !value.includes('[')) {
        //console.log(`🎨 Found color name in value: ${value}`)
        colors.push({
          name: value,
          hex: getColorHexFromName(value),
          key: key
        })
      }
      
      // Case 4: Color name is in the key, value is empty
      else if (!value || value === '') {
        //console.log(`🎨 Extracting color from key: ${key}`)
        const colorName = key.replace(/^Color_/i, '').replace(/^colour_/i, '')
        colors.push({
          name: colorName,
          hex: getColorHexFromName(colorName),
          key: key
        })
      }
      
      // Case 5: Skip complex values that don't fit other patterns
      else {
        //console.log(`🎨 Skipping complex color value: ${key} = ${value}`)
      }
    }
  })
  
  //console.log("🎨 Extracted colors:", colors)
  return colors
}

// Dedicated function for JSON color extraction
const extractJSONColors = (metadata: any): Array<{name: string, hex: string, key: string}> => {
  const colors: Array<{name: string, hex: string, key: string}> = []
  
  if (!metadata || typeof metadata !== 'object') {
    return colors
  }
  
  Object.entries(metadata).forEach(([key, value]) => {
    // Look for JSON color arrays in any field
    if (typeof value === 'string' && value.trim().startsWith('[')) {
      //console.log(`🎨 Checking for JSON colors in ${key}: ${value}`)
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) {
          parsed.forEach((item, index) => {
            // Handle different JSON structures
            if (item && typeof item === 'object') {
              // Structure: [{name: "red", hex: "#FF0000"}]
              if (item.name && item.hex) {
                colors.push({
                  name: item.name,
                  hex: item.hex,
                  key: `${key}_${index}`
                })
              }
              // Structure: [{color: "red", value: "#FF0000"}]
              else if (item.color && item.value) {
                colors.push({
                  name: item.color,
                  hex: item.value,
                  key: `${key}_${index}`
                })
              }
              // Structure: [{title: "red", code: "#FF0000"}]
              else if (item.title && item.code) {
                colors.push({
                  name: item.title,
                  hex: item.code,
                  key: `${key}_${index}`
                })
              }
            }
            // Handle simple string arrays: ["red", "blue", "green"]
            else if (typeof item === 'string') {
              colors.push({
                name: item,
                hex: getColorHexFromName(item),
                key: `${key}_${index}`
              })
            }
          })
        }
      } catch (error) {
        //console.log(`🎨 Failed to parse JSON in ${key}:`, error)
      }
    }
  })
  
  return colors
}

// Check product options for colors
const extractColorsFromOptions = (product: any): Array<{name: string, hex: string}> => {
  //console.log("🎨 Checking product options for colors:", product?.options)
  
  if (!product?.options || !Array.isArray(product.options)) {
    return []
  }
  
  const colors: Array<{name: string, hex: string}> = []
  
  const colorOption = product.options.find((option: any) => 
    option.title?.toLowerCase().includes('color') || 
    option.title?.toLowerCase().includes('colour')
  )
  
  if (colorOption && colorOption.values) {
    //console.log("🎨 Found color option:", colorOption)
    
    colorOption.values.forEach((colorValue: any) => {
      const colorName = colorValue.value || colorValue.title || colorValue
      if (colorName) {
        colors.push({
          name: colorName,
          hex: getColorHexFromName(colorName)
        })
      }
    })
  }
  
  return colors
}

// Enhanced color extraction that combines all sources
const getProductColorsEnhanced = (product: any): Array<{name: string, hex: string, key?: string}> => {
  //console.log(`🎨 Getting enhanced colors for product: ${product?.title}`)
  
  const allColors: Array<{name: string, hex: string, key?: string}> = []
  
  // Method 1: Extract JSON colors first
  const jsonColors = extractJSONColors(product?.metadata)
  //console.log(`🎨 Found ${jsonColors.length} JSON colors:`, jsonColors)
  allColors.push(...jsonColors)
  
  // Method 2: Extract regular metadata colors
  const metadataColors = extractProductColors(product?.metadata)
  //console.log(`🎨 Found ${metadataColors.length} metadata colors:`, metadataColors)
  allColors.push(...metadataColors)
  
  // Method 3: Extract from options
  const optionColors = extractColorsFromOptions(product)
  //console.log(`🎨 Found ${optionColors.length} option colors:`, optionColors)
  allColors.push(...optionColors)
  
  // Remove duplicates based on hex code
  const uniqueColors = allColors.filter((color, index, self) => 
    index === self.findIndex(c => c.hex.toLowerCase() === color.hex.toLowerCase())
  )
  
  //console.log(`🎨 Final unique colors for ${product?.title}:`, uniqueColors)
  return uniqueColors
}

const CreatorStorePage: React.FC<CreatorStorePageProps & {
  vendorProducts?: any[]
  reviewsMap?: Record<string, { averageRating: number; reviewCount: number }>
}> = ({
  vendor,
  region,
  vendorProducts: initialVendorProducts = [],
  reviewsMap = {},
}) => {
  // const [vendorProducts, setVendorProducts] = useState<Product[]>([])
  // const [isLoading, setIsLoading] = useState<boolean>(true)
  const [vendorProducts, setVendorProducts] = useState<Product[]>(initialVendorProducts)
  const [isLoading, setIsLoading] = useState(initialVendorProducts.length === 0)
  const [followers, setFollowers] = useState([])
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true)

  // States for various interactive elements
  const [showFullBio, setShowFullBio] = useState<boolean>(false)
  const [isFollowing, setIsFollowing] = useState<boolean>(false)
  const [currentCustomer, setCurrentCustomer] = useState(null)
  const [showShareOptions, setShowShareOptions] = useState<boolean>(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [sortOption, setSortOption] = useState<string>("featured")
  const PRODUCTS_PER_PAGE = 12

  // Fetch products client-side after first paint
useEffect(() => {
   console.log("CLIENT EFFECT FIRING", vendor.id, region.id)
  if (initialVendorProducts.length > 0) return // already have products from server

  const load = async () => {
    console.log("LOADING PRODUCTS FOR", vendor.id, region.id)
    setIsLoading(true)
    try {
    const { fetchVendorProductsClient } = await import("@lib/data/vendors-client")
      const products = await fetchVendorProductsClient(vendor.id, region.id)
      setVendorProducts(products)
    } catch {
      setVendorProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  load()
}, [vendor.id, region.id])

  // Fetch followers data
  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        //console.log("🔍 Fetching followers for vendor ID:", vendor.id)
        
        const { fetchVendorFollowersClient } = await import("@lib/data/vendors-client")
        const vendorFollowers = await fetchVendorFollowersClient(vendor.id)
        //console.log("📊 Followers response:", vendorFollowers)
        
        if (vendorFollowers && vendorFollowers.follow && Array.isArray(vendorFollowers.follow)) {
          const validFollowers = vendorFollowers.follow.filter(f => 
            f && f.follow && f.follow.customer
          )
          
          //console.log(`✅ Found ${validFollowers.length} valid followers`)
          setFollowers(validFollowers)
        } else {
          //console.log("📭 No followers in response")
          setFollowers([])
        }
        
      } catch (error) {
        //console.error("❌ Error fetching followers:", error)
        setFollowers([])
      }
    }

    if (vendor && vendor.id) {
      fetchFollowers()
    }
  }, [vendor?.id])

  // Fetch customer data separately from following status check
  useEffect(() => {
    const fetchCustomer = async () => {
      setIsLoadingAuth(true)
      try {
        const customer = await retrieveCustomer()
        //console.log("Retrieved customer:", customer)
        setCurrentCustomer(customer)
      } catch (error) {
        //console.error("Error retrieving customer:", error)
      } finally {
        setIsLoadingAuth(false)
      }
    }

    if (vendor && vendor.id) {
      fetchCustomer()
    }
  }, [vendor?.id])

  // Check following status when both customer and followers are available
  useEffect(() => {
    //console.log(followers)
    if (currentCustomer && followers.length > 0) {
      const isAlreadyFollowing = followers.some(
        (item) => item.follow?.customer_id === currentCustomer.id
      )
      //console.log("Following status checked:", isAlreadyFollowing)
      setIsFollowing(isAlreadyFollowing)
    }
  }, [currentCustomer, followers])

  // Updated follow/unfollow handler
const handleFollowToggle = async () => {
  if (!currentCustomer) {
    return toast("Please log in to follow/unfollow.", {
      icon: <AlertCircle className="text-white" size={20} />,
      style: {
        background: '#e65100',
        color: '#fff',
      },
    })
  }

    try {
      if (isFollowing) {
        //console.log("Unfollowing vendor:", vendor.id)
        await deletefollower(vendor.id)
        setIsFollowing(false)
      } else {
        //console.log("Following vendor:", vendor.id)
        await Addfollower(vendor.id)
        setIsFollowing(true)
      }

      // Refresh followers with delay
      setTimeout(async () => {
        const updatedFollowers = await retriveVendorsFollowers(vendor.id)
        if (updatedFollowers && updatedFollowers.follow) {
          setFollowers(updatedFollowers.follow.filter((f) => f && f.follow))
        }
      }, 1000)
    } catch (error) {
      //console.error("Error toggling follow status:", error)
    }
  }

  // Share functionality
  const handleShare = async (type: string) => {
    const url = window.location.href
    const text = `Check out ${creator.name}'s store on Junooni!`

    switch (type) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(url)
          toast.success('Link copied to clipboard!')
        } catch (error) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea')
          textArea.value = url
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          toast.success('Link copied to clipboard!')
        }
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`)
        break
    }
    setShowShareOptions(false)
  }

  // Close share dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showShareOptions && !target.closest('.share-dropdown')) {
        setShowShareOptions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showShareOptions])

  // Helper function to generate avatar colors based on user ID
  const generateAvatarColor = (userId: string): string => {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    }

    const r = ((hash & 0xff) % 200) + 55
    const g = (((hash >> 8) & 0xff) % 200) + 55
    const b = (((hash >> 16) & 0xff) % 200) + 55

    return `rgb(${r}, ${g}, ${b})`
  }

  // Fetch vendor products
  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     setIsLoading(true)
  //     try {
  //       if (vendor && !Array.isArray(vendor) && region) {
  //         //console.log("🔍 Fetching all products to filter by vendor:", vendor.id)
          
  //         const {
  //           response: { products: pricedProducts },
  //         } = await listProducts({
  //           regionId: region.id,
  //           queryParams: {
  //             fields: "*vendor,*tags,*metadata,*variants,*variants.prices,*variants.calculated_price",
  //             limit: 1000,
  //           },
  //         })
          
  //         //console.log("📦 Total products fetched:", pricedProducts?.length || 0)
          
  //         if (pricedProducts && Array.isArray(pricedProducts)) {
  //           //console.log("📦 Sample product structure:", pricedProducts[0])
            
  //           // 🎨 DEBUG: Log metadata structure for color debugging
  //           //console.log("🎨 DEBUGGING PRODUCT METADATA:")
  //           pricedProducts.forEach((product, index) => {
  //             if (product.metadata && Object.keys(product.metadata).length > 0) {
  //               //console.log(`Product ${index} "${product.title}" metadata:`, product.metadata)
                
  //               // Check for color-related keys
  //               const colorKeys = Object.keys(product.metadata).filter(key => 
  //                 key.toLowerCase().includes('color') || 
  //                 key.toLowerCase().includes('colour')
  //               )
  //               //console.log(`Color-related keys:`, colorKeys)
  //             }
  //           })
            
  //           // Filter products that belong to this vendor
  //           const vendorProducts = pricedProducts.filter(product => {
  //             // console.log(`🔍 Product "${product.title}":`, {
  //             //   vendor: product.vendor,
  //             //   vendor_id: product.vendor_id,
  //             //   metadata: product.metadata
  //             // })
              
  //             return (
  //               product.vendor?.id === vendor.id ||
  //               product.vendor_id === vendor.id ||
  //               product.creator_id === vendor.id ||
  //               product.seller_id === vendor.id ||
  //               (product.metadata && product.metadata.vendor_id === vendor.id) ||
  //               (product.metadata && product.metadata.creator_id === vendor.id)
  //             )
  //           })
            
  //           //console.log("✅ Vendor products found:", vendorProducts.length)
  //           if (vendorProducts.length > 0) {
  //             //console.log("📦 Sample vendor product:", vendorProducts[0])
  //           }
            
  //           setVendorProducts(vendorProducts)
  //         } else {
  //           //console.log("❌ No products in response")
  //           setVendorProducts([])
  //         }
  //       }
  //     } catch (error) {
  //       //console.error("❌ Error fetching products:", error)
  //       setVendorProducts([])
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }

  //   fetchProducts()
  // }, [vendor, region])

  // If this is the main page showing multiple vendors
  if (Array.isArray(vendor)) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="container px-4 py-12 mx-auto"
      >
        <motion.h1 variants={slideIn} className="mb-8 text-4xl font-bold">
          Creator Stores
        </motion.h1>
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {vendor.map((vendorItem: Vendor) => (
            <motion.div key={vendorItem.id} variants={slideIn}>
              <Link
                href={`/creator/${vendorItem.handle}`}
                className="block transform transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="overflow-hidden transition-shadow bg-white rounded-lg shadow-md hover:shadow-xl">
                  <div className="overflow-hidden h-52">
                    <Image
                      src={vendorItem.coverphoto}
                      alt={`${vendorItem.name} cover`}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center p-5">
                    <div className="relative w-16 h-16 mr-4 overflow-hidden border-2 border-white rounded-full shadow">
                      <div className="relative w-full h-full">
                        <Image
                          src={vendorItem.logo}
                          alt={vendorItem.name}
                          fill
                          className="object-cover object-center"
                        />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{vendorItem.name}</h2>
                      <p className="text-sm text-gray-600">
                        {vendorItem.creator_title || "Creator"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    )
  }

  // Calculate follower count for display purposes
  const followerCount = followers.length

  // Merge API data with sample data for missing fields
  const creator: Creator = {
    id: vendor.id,
    name: vendor.name,
    handle: vendor.handle,
    role: vendor.creator_title || "Music Artist & Visual Creator",
    verified: vendor.verified === "Yes" || vendor.verified === true,
    followers: followerCount,
    bio: vendor.creator_bio || "Artist bio not provided.",
    shortBio: vendor.creator_bio
      ? vendor.creator_bio.length > 150
        ? vendor.creator_bio.substring(0, 150) + "..."
        : vendor.creator_bio
      : "Artist bio not provided.",
    profileImage: vendor.logo,
    coverImage: vendor.coverphoto,
    socialMedia: {
      instagram: vendor.instagram || null,
      twitter: vendor.xtwitter || null,
      facebook: vendor.facebook || null,
      youtube: vendor.youtube || null,
      website: vendor.othersocial || null,
    },
    upcomingDrops: [
      { date: "Mar 28", title: "Summer Tour Collection" },
      { date: "Apr 15", title: "Limited Edition Vinyl + Merch Bundle" },
    ],
    stats: {
      products: Array.isArray(vendorProducts) ? vendorProducts.length : 0,
      limitedEditions: Array.isArray(vendorProducts)
        ? vendorProducts.filter((p) => p.status === "published").length
        : 0,
      exclusives: Array.isArray(vendorProducts)
        ? vendorProducts.filter((p) => p.is_giftcard).length
        : 0,
    },
  }


  // console.log("🔍 Vendor details:", vendor)
  // console.log("🔍 Creator verified status:", creator.verified)
  // console.log("🔍 Vendor data:", vendor)
  // console.log("🔍 Available vendor keys:", Object.keys(vendor))
  // console.log("🔍 Creator data:", creator)
  // console.log("🔍 Available creator keys:", Object.keys(creator))
  
  // Format large numbers with K/M suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  // Function to properly format social media URLs
  const formatSocialUrl = (
    type: string,
    username: string | null
  ): string | null => {
    if (!username) return null

    switch (type) {
      case "instagram":
        return username.startsWith("http")
          ? username
          : `https://instagram.com/${username}`
      case "twitter":
        return username.startsWith("http")
          ? username
          : `https://twitter.com/${username}`
      case "facebook":
        return username.startsWith("http")
          ? username
          : `https://facebook.com/${username}`
      case "youtube":
        return username.startsWith("http")
          ? username
          : `https://youtube.com/${username}`
      case "website":
        return username.startsWith("http") ? username : `https://${username}`
      default:
        return username
    }
  }

  // Function to check if a product has a certain badge characteristic
  const hasProductBadge = (product: Product, badgeType: string): boolean => {
    if (!product) return false

    switch (badgeType) {
      case "isNew":
        if (product.created_at) {
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const createdAt = new Date(product.created_at)
          return createdAt > thirtyDaysAgo
        }
        return false

      case "isLimited":
        return product.discountable === false

      case "isSigned":
        return product.material === "cotton"

      default:
        return false
    }
  }

  // Sort products based on selected option
  const sortProducts = (products: Product[], sortBy: string): Product[] => {
    const sortedProducts = [...products]
    
    switch (sortBy) {
      case "newest":
        return sortedProducts.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime()
          const dateB = new Date(b.created_at || 0).getTime()
          return dateB - dateA
        })
      
      case "price_low_high":
        return sortedProducts.sort((a, b) => {
          const priceA = a.variants?.[0]?.calculated_price?.calculated_amount || 0
          const priceB = b.variants?.[0]?.calculated_price?.calculated_amount || 0
          return priceA - priceB
        })
      
      case "price_high_low":
        return sortedProducts.sort((a, b) => {
          const priceA = a.variants?.[0]?.calculated_price?.calculated_amount || 0
          const priceB = b.variants?.[0]?.calculated_price?.calculated_amount || 0
          return priceB - priceA
        })
      
      case "featured":
      default:
        return sortedProducts // Keep original order for featured
    }
  }

  // Calculate pagination data
  const sortedProducts = sortProducts(vendorProducts, sortOption)
  const totalProducts = sortedProducts.length
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const endIndex = startIndex + PRODUCTS_PER_PAGE
  const currentProducts = sortedProducts.slice(startIndex, endIndex)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to products section
    const productsSection = document.getElementById('products-section')
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Handle sort change
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value)
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show smart pagination
      if (currentPage <= 3) {
        // Show first 5 pages
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        if (totalPages > 5) {
          pages.push('...')
          pages.push(totalPages)
        }
      } else if (currentPage >= totalPages - 2) {
        // Show last 5 pages
        pages.push(1)
        if (totalPages > 5) {
          pages.push('...')
        }
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Show pages around current page
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="min-h-screen pt-16 overflow-x-hidden bg-gray-50 md:pt-18"
    >
      {/* Cover Photo */}
      <motion.div
        variants={fadeIn}
        className="relative w-full h-64 overflow-hidden bg-gray-300 md:h-80 lg:h-96"
      >
        <Image
          src={creator.coverImage}
          alt={`${creator.name} cover`}
          fill
          className="object-cover"
        />

        {/* Dark gradient overlay - only shown when no cover image */}
        {!creator.coverImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#e65100] to-[#ffb74d] opacity-90"></div>
        )}
      </motion.div>
      
      <div className="w-full px-0 mx-auto max-w-7xl sm:px-4 lg:px-8">
        {/* creator profile section */}
         <motion.div variants={slideIn} className="relative w-full mb-8 -mt-12 md:-mt-16">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 md:p-6 md:pb-0">
              <div className="flex flex-col gap-6 md:flex-row">
                {/* Profile Picture with proper styling */}
               <motion.div
                  variants={fadeIn}
                  className="relative flex-shrink-0 w-32 h-32 -mt-8 md:w-40 md:h-40 md:-mt-16"
                >
                  <div className="w-full h-full overflow-hidden border-4 border-white rounded-full shadow-lg">
                    <div className="relative w-full h-full">
                      <Image
                        src={creator.profileImage || profileplaceholder.src}
                        alt={creator.name}
                        fill
                        className="object-cover object-center"
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
                          <p className="px-4 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
                            @ {creator.handle}
                          </p>
                          {creator.verified && (
                            <svg
                              className="inline-block ml-2 align-middle"
                              width="18"
                              height="18"
                              viewBox="0 0 20 20"
                              preserveAspectRatio="xMidYMid meet"
                              aria-label="Verified"
                            >
                              {/* Verified badge shape (clean + symmetrical) */}
                              <path
                                fill="#e65100"
                                d="
                                  M10 0.8
                                  L12.2 2.2
                                  L14.9 1.9
                                  L16.1 4.4
                                  L18.6 5.6
                                  L17.9 8.3
                                  L19.2 10
                                  L17.9 11.7
                                  L18.6 14.4
                                  L16.1 15.6
                                  L14.9 18.1
                                  L12.2 17.8
                                  L10 19.2
                                  L7.8 17.8
                                  L5.1 18.1
                                  L3.9 15.6
                                  L1.4 14.4
                                  L2.1 11.7
                                  L0.8 10
                                  L2.1 8.3
                                  L1.4 5.6
                                  L3.9 4.4
                                  L5.1 1.9
                                  L7.8 2.2
                                  Z"
                              />

                              {/* Check */}
                              <path
                                d="M6.2 10.2l2.1 2.2 4.5-4.6"
                                fill="none"
                                stroke="white"
                                strokeWidth="1.9"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
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
                          disabled={isLoadingAuth}
                          className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition ${
                            isLoadingAuth
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : isFollowing
                              ? "bg-white text-[#e65100] border border-[#e65100] hover:bg-gray-300"
                              : "bg-[#e65100] text-white hover:bg-[#d84315]"
                          }`}
                        >
                          {isLoadingAuth
                            ? "Loading..."
                            : isFollowing
                            ? "Following"
                            : "Follow"}
                          {!isFollowing && !isLoadingAuth && (
                            <Bell size={16} className="ml-2" />
                          )}
                        </motion.button>

                        <div className="relative share-dropdown">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setShowShareOptions(!showShareOptions)
                            }
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
                              className="absolute right-0 z-10 w-48 mt-2 bg-white border border-gray-200 rounded-md shadow-lg"
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => handleShare('copy')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <MessageCircleMore
                                    size={16}
                                    className="mr-2"
                                  />
                                  Copy Link
                                </button>
                                <button
                                  onClick={() => handleShare('twitter')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Image src={Twittericon} alt="Twitter" width={16} height={16} className="mr-2" />
                                  Share on Twitter
                                </button>
                                <button
                                  onClick={() => handleShare('facebook')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <ExternalLink size={16} className="mr-2" />
                                  Share on Facebook
                                </button>
                                <button
                                  onClick={() => handleShare('email')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Mail size={16} className="mr-2" />
                                  Email
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Mobile Creator Name & Info */}
                  <div className="md:hidden">
                    <motion.div variants={slideIn} className="mb-4">
                      <h1 className="text-2xl font-bold">{creator.name}</h1>
                      <div className="flex items-center mt-1">
                        <p className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
                          @ {creator.handle}
                        </p>
                        {creator.verified && (
                          <span className="ml-2 bg-[#e65100] text-white text-xs px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                    </motion.div>
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
                  <motion.div variants={slideIn} className="mb-4">
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
                        {showFullBio ? "Show less" : "Read more"}
                      </motion.button>
                    )}
                  </motion.div>

                  {/* Social Media Links - Enhanced with handles */}
                  <motion.div variants={slideIn} className="flex flex-wrap items-center gap-0 mb-0">
                    {creator.socialMedia.instagram && (
                      <a
                        href={formatSocialUrl('instagram', creator.socialMedia.instagram)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-3 text-gray-700 transition-colors bg-white rounded-full hover:bg-gray-200"
                      >
                        <Instagram size={22} className="text-grey-400" />
                        {/* <span className="text-sm font-medium">
                          @{creator.socialMedia.instagram.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '').replace(/\/$/, '')}
                        </span> */}
                      </a>
                    )}
                    
                    {creator.socialMedia.twitter && (
                      <a
                        href={formatSocialUrl('twitter', creator.socialMedia.twitter)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-3 text-gray-700 transition-colors bg-white rounded-full hover:bg-gray-200"
                      >
                        <Image src={Twittericon} alt="Twitter" width={20} height={20} />
                        {/* <span className="text-sm font-medium">
                          @{creator.socialMedia.twitter.replace(/^(https?:\/\/)?(www\.)?(twitter|x)\.com\//i, '').replace(/\/$/, '')}
                        </span> */}
                      </a>
                    )}
                    
                    {creator.socialMedia.facebook && (
                      <a
                        href={formatSocialUrl('facebook', creator.socialMedia.facebook)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-3 text-gray-700 transition-colors bg-white rounded-full hover:bg-gray-200"
                      >
                        <Facebook size={22} className="text-grey-400" />
                        {/* <span className="text-sm font-medium">
                          {creator.socialMedia.facebook.replace(/^(https?:\/\/)?(www\.)?facebook\.com\//i, '').replace(/\/$/, '')}
                        </span> */}
                      </a>
                    )}
                    
                    {creator.socialMedia.youtube && (
                      <a
                        href={formatSocialUrl('youtube', creator.socialMedia.youtube)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-3 text-gray-700 transition-colors bg-white rounded-full hover:bg-gray-200"
                      >
                        <Youtube size={22} className="text-grey-400" />
                        {/* <span className="text-sm font-medium">
                          {creator.socialMedia.youtube.replace(/^(https?:\/\/)?(www\.)?youtube\.com\/(c\/|@)?/i, '').replace(/\/$/, '')}
                        </span> */}
                      </a>
                    )}
                    
                    {creator.socialMedia.website && (
                      <a
                        href={formatSocialUrl('website', creator.socialMedia.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-3 text-gray-700 transition-colors bg-gray-100 rounded-full hover:bg-gray-200"
                      >
                        <ExternalLink size={22} className="text-gray-600" />
                        <span className="text-sm font-medium">
                          {creator.socialMedia.website.replace(/^(https?:\/\/)?(www\.)?/i, '').split('/')[0]}
                        </span>
                      </a>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <motion.div
                variants={slideIn}
                className="flex gap-3 mt-4 md:hidden"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFollowToggle}
                  disabled={isLoadingAuth}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-full text-sm font-medium transition ${
                    isLoadingAuth
                      ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                      : isFollowing
                      ? "bg-white text-[#e65100] border border-[#e65100] hover:bg-gray-50"
                      : "bg-[#e65100] text-white hover:bg-[#d84315]"
                  }`}
                >
                  {isLoadingAuth
                    ? "Loading..."
                    : isFollowing
                    ? "Following"
                    : "Follow"}
                  {!isFollowing && !isLoadingAuth && (
                    <Bell size={16} className="ml-2" />
                  )}
                </motion.button>

                <div className="relative share-dropdown">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="flex items-center justify-center px-6 py-3 text-sm font-medium bg-white border border-gray-300 rounded-full hover:bg-gray-50"
                  >
                    <Share2 size={16} className="mr-2" />
                    Share
                  </motion.button>

                  {/* Mobile Share Dropdown */}
                  {showShareOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 z-20 w-48 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
                    >
                      <div className="py-2">
                        <button
                          onClick={() => handleShare('copy')}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <MessageCircleMore size={16} className="mr-3" />
                          Copy Link
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <X size={16} className="mr-3" />
                          Share on Twitter
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <ExternalLink size={16} className="mr-3" />
                          Share on Facebook
                        </button>
                        <button
                          onClick={() => handleShare('email')}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Mail size={16} className="mr-3" />
                          Email
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

             {/* Fans Section */}
              <motion.div
                variants={fadeIn}
                className="my-8 bg-gradient-to-r from-[#e65100] to-[#ff9800] rounded-lg overflow-hidden shadow-md"
              >
                <div className="flex flex-col items-center justify-between px-6 py-8 text-white md:flex-row">
                  <div className="mb-4 md:mb-0">
                    <h2 className="mb-2 text-xl font-bold">From the Fans</h2>
                    
                    {followers.length > 0 ? (
                      <>
                        <p>
                          Join {followers.length} fans who love {creator.name}'s exclusive merchandise
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
                      </>
                    ) : (
                      <p className="text-lg">
                        Be the first one to follow {creator.name} and show your support!
                      </p>
                    )}
                  </div>

                  <div className="flex -space-x-4">
                    {followers.length > 0 ? (
                      <>
                        {followers
                          .slice(0, 5)
                          .map((followerData, i) => {
                            try {
                              const follower = followerData?.follow?.customer

                              if (!follower || !follower.id) {
                                return null
                              }

                              const firstName = follower.first_name || ""
                              const lastName = follower.last_name || ""
                              const initials =
                                (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "?"

                              const avatarColor = generateAvatarColor(follower.id)

                              return (
                                <motion.div
                                  key={`follower-${follower.id}-${i}`}
                                  whileHover={{ y: -5, zIndex: 10 }}
                                  className="relative w-10 h-10 overflow-hidden transition-all border-2 border-white rounded-full cursor-pointer"
                                  title={`${firstName} ${lastName}`}
                                >
                                  <div
                                    className="flex items-center justify-center w-full h-full text-xs font-bold text-white"
                                    style={{ backgroundColor: avatarColor }}
                                  >
                                    {initials}
                                  </div>

                                  <div className="absolute z-20 w-32 p-2 text-xs text-gray-800 transition-opacity transform -translate-x-1/2 bg-white rounded shadow-md opacity-0 pointer-events-none hover:opacity-100 -bottom-16 left-1/2">
                                    <p className="font-semibold text-center">
                                      {firstName || "Fan"} {lastName || ""}
                                    </p>
                                    <p className="text-center text-gray-500 truncate">
                                      {follower.email || "No email available"}
                                    </p>
                                  </div>
                                </motion.div>
                              )
                            } catch (error) {
                              //console.error("Error rendering follower:", error)
                              return null
                            }
                          })
                          .filter(Boolean)}

                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-10 h-10 rounded-full bg-white text-[#e65100] font-bold flex items-center justify-center text-sm border-2 border-white"
                        >
                          {followers.length > 5 ? `+${followers.length - 5}` : "+"}
                        </motion.div>
                      </>
                    ) : (
                      // Enhanced empty state with clickable section + button
                      <div className="flex flex-col items-center space-y-4">
                        {/* Clickable animated heart section */}
                        <motion.div
                          onClick={handleFollowToggle}
                          disabled={isLoadingAuth}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`flex items-center space-x-4 cursor-pointer group ${
                            isLoadingAuth ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {/* Animated heart with ripple effect */}
                          <motion.div
                            className="relative"
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ 
                              duration: 1.5, 
                              repeat: Infinity, 
                              ease: "easeInOut" 
                            }}
                          >
                            <div className="flex items-center justify-center border-2 border-white rounded-full w-14 h-14 bg-white/20 backdrop-blur-sm">
                              <Heart
                                size={24}
                                fill="currentColor"
                                className="text-white transition-colors duration-300 group-hover:text-[#e65100]"
                              />
                            </div>

                            {/* Ripple effect */}
                            <motion.div
                              className="absolute inset-0 border-2 rounded-full border-white/50"
                              animate={{ 
                                scale: [1, 1.8], 
                                opacity: [0.6, 0] 
                              }}
                              transition={{ 
                                duration: 1.5, 
                                repeat: Infinity, 
                                ease: "easeOut" 
                              }}
                            />
                          </motion.div>

                          {/* Text content */}
                          <div>
                            <p className="text-base font-bold text-white">No fans yet!</p>
                            <p className="text-sm text-white/80">Be the first to follow</p>
                            <p className="mt-1 text-xs text-white/80">Click here!</p>
                          </div>
                        </motion.div>

                        {/* Follow Button */}
                        {/* <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleFollowToggle}
                          disabled={isLoadingAuth}
                          className={`flex items-center px-6 py-2.5 bg-white text-[#e65100] rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-shadow ${
                            isLoadingAuth ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isLoadingAuth ? (
                            <>
                              <div className="w-4 h-4 mr-2 border-2 border-[#e65100] border-t-transparent rounded-full animate-spin"></div>
                              Loading...
                            </>
                          ) : (
                            <>
                              <Heart size={14} className="mr-2" />
                              Follow Now
                            </>
                          )}
                        </motion.button> */}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Products Section */}
              <motion.div variants={slideIn} className="mb-12" id="products-section">
                <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-xl font-bold md:text-2xl">All Products</h2>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <span className="text-xs text-gray-500 sm:text-sm sm:mr-2">
                      {totalProducts > 0 ? (
                        <>
                          <span className="hidden sm:inline">
                            {startIndex + 1}-{Math.min(endIndex, totalProducts)} of {totalProducts} items
                          </span>
                          <span className="sm:hidden">
                            {totalProducts} items
                          </span>
                        </>
                      ) : '0 items'}
                    </span>
                    <select 
                      value={sortOption}
                      onChange={handleSortChange}
                      className="md:w-full w-1/2 border rounded-md p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#e65100] sm:w-auto bg-white hover:bg-gray-50"
                      style={{
                        backgroundColor: '#e65100',
                        color: 'white'
                      }}
                    >
                      <option value="featured" style={{backgroundColor: 'white', color: 'black'}}>Sort: Featured</option>
                      <option value="newest" style={{backgroundColor: 'white', color: 'black'}}>Newest</option>
                      <option value="price_low_high" style={{backgroundColor: 'white', color: 'black'}}>Price: Low to High</option>
                      <option value="price_high_low" style={{backgroundColor: 'white', color: 'black'}}>Price: High to Low</option>
                    </select>
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-2 gap-0 -mx-4 md:grid-cols-3 sm:-mx-6 lg:grid-cols-4 md:gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="p-1 sm:p-3">
                        {/* Image skeleton */}
                        <div
                          className="w-full mb-4 bg-gray-100 rounded-lg animate-pulse"
                          style={{
                            aspectRatio: "4/5",
                            animationDelay: `${i * 60}ms`,
                          }}
                        />
                        {/* Vendor name */}
                        <div className="w-1/3 h-3 mb-2 bg-gray-100 rounded animate-pulse" />
                        {/* Product title */}
                        <div className="w-3/4 h-4 mb-2 bg-gray-100 rounded animate-pulse" />
                        {/* Color dots */}
                        <div className="flex gap-1.5 mb-2">
                          {[1,2,3].map(j => (
                            <div key={j} className="w-5 h-5 bg-gray-100 rounded-full animate-pulse" />
                          ))}
                        </div>
                        {/* Price */}
                        <div className="w-1/4 h-4 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : !Array.isArray(vendorProducts) ||
                  vendorProducts.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-lg text-gray-500">No products found.</p>
                  </div>
                ) : (
                  <>
                    <motion.div
                      variants={staggerContainer}
                      className="grid grid-cols-2 gap-0 -mx-4 md:grid-cols-3 sm:-mx-6 lg:grid-cols-4 md:gap-6"
                    >
                      {currentProducts.map((product: Product) => (
                        <DynamicProductCard
                          key={product.id}
                          product={product}
                          hasProductBadge={hasProductBadge}
                          region={region}
                          reviewData={reviewsMap[product.id]}
                        />
                      ))}
                    </motion.div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col items-center pb-8 mt-8 space-y-4"
                      >
                        {/* Page Info */}
                        <div className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center space-x-2">
                          {/* Previous Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md border transition ${
                              currentPage === 1
                                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'text-gray-700 border-gray-300 hover:text-[#e65100] hover:border-[#e65100] hover:bg-gray-50'
                            }`}
                          >
                            <ChevronLeft size={16} className="mr-1" />
                            Previous
                          </motion.button>

                          {/* Page Numbers */}
                          <div className="flex items-center space-x-1">
                            {generatePageNumbers().map((page, index) => (
                              <motion.div key={index}>
                                {page === '...' ? (
                                  <span className="px-3 py-2 text-sm text-gray-400">...</span>
                                ) : (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handlePageChange(page as number)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                                      currentPage === page
                                        ? 'bg-[#e65100] text-white shadow-md'
                                        : 'text-gray-700 hover:text-[#e65100] hover:bg-gray-50'
                                    }`}
                                  >
                                    {page}
                                  </motion.button>
                                )}
                              </motion.div>
                            ))}
                          </div>

                          {/* Next Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md border transition ${
                              currentPage === totalPages
                                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'text-gray-700 border-gray-300 hover:text-[#e65100] hover:border-[#e65100] hover:bg-gray-50'
                            }`}
                          >
                            Next
                            <ChevronRight size={16} className="ml-1" />
                          </motion.button>
                        </div>

                        {/* Quick Jump (for mobile) */}
                        {totalPages > 10 && (
                          <div className="flex items-center space-x-2 md:hidden">
                            <span className="text-sm text-gray-500">Go to page:</span>
                            <select
                              value={currentPage}
                              onChange={(e) => handlePageChange(parseInt(e.target.value))}
                              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#e65100]"
                            >
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <option key={page} value={page}>
                                  {page}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Component for FAQ Items
const FAQItem: React.FC<FAQItemProps> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

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
        animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? "auto" : 0 }}
        transition={{ duration: 0.3 }}
        className="pt-3 pl-4 text-gray-600"
      >
        {children}
      </motion.div>
    </motion.details>
  )
}

// Dynamic Product Card Component
const DynamicProductCard: React.FC<ExtendedProductCardProps> = ({
  product,
  hasProductBadge,
  region,
  reviewData,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [hoveredColor, setHoveredColor] = useState<string | null>(null) // Add this line
  // Review state
  // const [averageRating, setAverageRating] = useState(0)
  // const [reviewCount, setReviewCount] = useState(0)
  // const [isLoadingReviews, setIsLoadingReviews] = useState(true)

  // Extract required info from product with safety checks
  const productName = product?.title || "Product"
  const productImage = product?.thumbnail
  const productHandle = product?.handle || ""

  // Fetch actual review data
  // useEffect(() => {
  //   setIsLoadingReviews(true)
  //   getProductReviews({
  //     productId: product.id,
  //     limit: 100,
  //     offset: 0,
  //   })
  //     .then(({ reviews: paginatedReviews, average_rating, count }) => {
  //       setAverageRating(average_rating || 0)
  //       const actualCount = paginatedReviews?.length || 0
  //       setReviewCount(actualCount)
  //     })
  //     .catch((error) => {
  //       //console.error("Error fetching product reviews in card:", error)
  //       setAverageRating(0)
  //       setReviewCount(0)
  //     })
  //     .finally(() => {
  //       setIsLoadingReviews(false)
  //     })
  // }, [product.id])

  const [averageRating, setAverageRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)

  useEffect(() => {
    // Only fetch if no server data provided
    if (reviewData) {
      setAverageRating(reviewData.averageRating)
      setReviewCount(reviewData.reviewCount)
      setIsLoadingReviews(false)
      return
    }
    getProductReviews({ productId: product.id, limit: 100, offset: 0 })
      .then(({ average_rating, reviews }) => {
        setAverageRating(average_rating ?? 0)
        setReviewCount(reviews?.length ?? 0)
      })
      .catch(() => {})
      .finally(() => setIsLoadingReviews(false))
  }, [product.id])


  // ADD STEP 3 FUNCTION HERE:
// Function to get the appropriate image based on selected color
// Function to get the appropriate image based on selected color
const getVariantImage = () => {
  // Use hovered color if available, otherwise use selected color
  const activeColor = hoveredColor || selectedColor
  
  if (!activeColor) {
    return productImage
  }

  // Find the color name that matches the active hex
  const activeColorName = productColors.find(c => c.hex === activeColor)?.name

  if (!activeColorName) {
    return productImage
  }

  //console.log('🖼️ Looking for images for color:', activeColorName)

  // Strategy 1: Check variant metadata for color-specific images
  if (product?.variants && Array.isArray(product.variants)) {
    for (const variant of product.variants) {
      const variantMetadata = (variant as any)?.metadata

      if (variantMetadata) {
        // Check color_images field
        if (variantMetadata.color_images) {
          try {
            const colorImages = JSON.parse(variantMetadata.color_images)
            
            if (Array.isArray(colorImages)) {
              const matchingColorImage = colorImages.find((img: any) => 
                img.color?.toLowerCase() === activeColorName.toLowerCase()
              )
              
              if (matchingColorImage && matchingColorImage.url) {
                //console.log('🖼️ Found matching color image:', matchingColorImage.url)
                return matchingColorImage.url
              }
            }
          } catch (error) {
            //console.log('🖼️ Error parsing color_images:', error)
          }
        }

        // Check variant_images field
        if (variantMetadata.variant_images) {
          try {
            const variantImages = JSON.parse(variantMetadata.variant_images)
            
            if (Array.isArray(variantImages) && variantImages.length > 0) {
              const variantColors = extractProductColors(variantMetadata)
              const hasMatchingColor = variantColors.some(color => 
                color.hex.toLowerCase() === activeColor.toLowerCase()
              )
              
              if (hasMatchingColor && variantImages[0]) {
                //console.log('🖼️ Found matching variant image:', variantImages[0])
                return variantImages[0]
              }
            }
          } catch (error) {
            //console.log('🖼️ Error parsing variant_images:', error)
          }
        }
      }
    }
  }

  // Strategy 2: Search product images for color-specific filenames
  if (product?.images && Array.isArray(product.images) && product.images.length > 1) {
    const colorVariations = [
      activeColorName.toLowerCase(),
      activeColorName.toLowerCase().replace(/\s+/g, ''),
      activeColorName.toLowerCase().replace(/\s+/g, '-'),
      activeColorName.toLowerCase().replace(/\s+/g, '_'),
    ]
    
    const colorImage = product.images.find((img: any) => {
      const imageUrl = img.url || ''
      return colorVariations.some(variation => 
        imageUrl.toLowerCase().includes(variation)
      )
    })
    
    if (colorImage) {
      //console.log('🖼️ Found filename-based color image:', colorImage.url)
      return colorImage.url
    }
  }

  //console.log('🖼️ No matching image found, returning default')
  return productImage
}
  // ADD STEP 5 USEEFFECT HERE:
  // Initialize with first available color

  // Updated to only show colors from color_hex_values field
  const getProductColors = () => {
    //console.log(`🎨 Getting colors for product: ${productName}`)
    
    // Get all colors using the enhanced extraction
    const allColors = getProductColorsEnhanced(product)
    
    // Filter to only keep colors that have color_hex_values in their key
    const filteredColors = allColors.filter(color => 
      color.key && color.key.includes('color_hex_values')
    )
    
    //console.log(`🎨 All colors found: ${allColors.length}`)
    //console.log(`🎨 Filtered colors (color_hex_values only): ${filteredColors.length}`)
    //console.log(`🎨 Final colors:`, filteredColors)
    
    return filteredColors
  }

  const productColors = getProductColors()

  // Enhanced getPriceData function with comprehensive debugging
  const getPriceData = () => {
    //console.log("💰 Getting price data for product:", product?.title)
    //console.log("💰 Product variants:", product?.variants)
    //console.log("💰 Region currency:", region?.currency_code)

    if (product?.variants?.length > 0) {
      const variant = product.variants[0]
      //console.log("💰 First variant:", variant)
      
      const currencyCode = region?.currency_code || "usd"
      
      // Method 1: Try calculated_price first
      if (variant?.calculated_price) {
        //console.log("💰 Using calculated_price:", variant.calculated_price)
        
        if (typeof variant.calculated_price === 'object') {
          const possiblePrices = [
            variant.calculated_price[currencyCode],
            variant.calculated_price.amount,
            variant.calculated_price.price_incl_tax,
            variant.calculated_price.price_excl_tax,
            variant.calculated_price.original_amount,
            variant.calculated_price.calculated_amount
          ]
          
          for (const priceValue of possiblePrices) {
            if (priceValue && typeof priceValue === 'number') {
              //console.log("💰 Found calculated price:", priceValue)
              return {
                amount: priceValue,
                currencyCode: currencyCode,
              }
            }
          }
        } else if (typeof variant.calculated_price === 'number') {
          //console.log("💰 Using direct calculated price:", variant.calculated_price)
          return {
            amount: variant.calculated_price,
            currencyCode: currencyCode,
          }
        }
      }
      
      // Method 2: Try standard prices array
      if (variant?.prices?.length > 0) {
        //console.log("💰 Using prices array:", variant.prices)
        
        const matchingPrice = variant.prices.find(
          (p) => p.currency_code?.toLowerCase() === currencyCode.toLowerCase()
        )
        
        const price = matchingPrice || variant.prices[0]
        
        if (price && typeof price.amount === "number") {
          //console.log("💰 Found price:", price)
          return {
            amount: price.amount,
            currencyCode: price.currency_code || currencyCode,
          }
        }
      }
      
      // Method 3: Try other common price fields
      const priceFields = ['price', 'unit_price', 'list_price', 'original_price', 'amount']
      for (const field of priceFields) {
        if (variant?.[field] && typeof variant[field] === 'number') {
          //console.log(`💰 Using ${field}:`, variant[field])
          return {
            amount: variant[field],
            currencyCode: currencyCode,
          }
        }
      }
      
      //console.log("❌ No price found in variant:", Object.keys(variant))
    }
    
    //console.log("❌ Returning default price 0")
    return { amount: 0, currencyCode: region?.currency_code || "usd" }
  }

  const priceData = getPriceData()
  //console.log("💰 Final price data:", priceData)

    useEffect(() => {
    if (productColors.length > 0 && !selectedColor) {
      setSelectedColor(productColors[0].hex)
    }
  }, [productColors])


  // Enhanced PreviewPrice component with debugging
  const PreviewPrice = ({ price }) => {
    //console.log("💰 PreviewPrice received:", price)
    
    const { amount, currencyCode } = price
    const symbol = getCurrencySymbol(currencyCode)
    
    if (amount === 0) {
      return <span className="text-black-500">N/A</span>
    }
    
    // Handle different price formats
    let displayAmount = amount
    
    // Convert from cents if amount is large (likely in cents)
    if (amount > 1000) {
      displayAmount = amount / 100
    }
    
    // For JPY, no decimal places
    const formattedPrice = currencyCode?.toLowerCase() === "jpy" 
      ? Math.round(displayAmount).toString()
      : displayAmount.toFixed(2)
    
    // console.log("💰 Displaying price:", {
    //   original: amount,
    //   converted: displayAmount,
    //   formatted: formattedPrice,
    //   symbol
    // })
    
    return (
      <span>
        {symbol}
        {formattedPrice}
      </span>
    )
  }

  // Enhanced Color Display Component
  // Enhanced Color Display Component
const ColorOptions = ({ colors }: { colors: Array<{name: string, hex: string, key?: string}> }) => {
  if (!colors || colors.length === 0) {
    return null
  }

  const handleColorHover = (colorHex: string) => {
    setHoveredColor(colorHex)
  }

  const handleColorLeave = () => {
    setHoveredColor(null)
  }

  return (
    <div className="pt-1 mt-auto">
      <ul className="flex items-center gap-x-1.5 flex-wrap">
        {colors.map((color, index) => (
          <li key={color.key || `color-${index}`}>
            <div
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-all border-2 rounded-full shadow-sm cursor-pointer hover:scale-125 hover:shadow-md ${
                selectedColor === color.hex 
                  ? 'border-gray-600 ' 
                  : hoveredColor === color.hex
                    ? 'border-white-500 '
                    : 'border-white-300 hover:border-white-500'
              }`}
              style={{ backgroundColor: color.hex }}
              title={`${color.name} (${color.hex})`}
              onClick={() => {
                setSelectedColor(color.hex)
                //console.log(`Selected color: ${color.name} (${color.hex})`)
              }}
              onMouseEnter={() => handleColorHover(color.hex)} // Add this
              onMouseLeave={handleColorLeave} // Add this
            >
              {/* Special handling for white and very light colors */}
              {(color.hex === '#FFFFFF' || color.hex === '#FFFFF0' || color.hex.toLowerCase() === '#ffe5ec') && (
                <div className="w-full h-full border border-gray-400 rounded-full"></div>
              )}
              
              {/* Selected indicator for dark colors */}
              {/* {(selectedColor === color.hex || hoveredColor === color.hex) && (color.hex === '#000000' || color.hex === '#780000') && (
                <div className="absolute w-2 h-2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full top-1/2 left-1/2"></div>
              )} */}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

  // UI Components
  const Wishlistbutton: React.FC<{ variantId: string | undefined }> = ({
    variantId,
  }) => (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="absolute z-20 p-2 bg-white rounded-full shadow-md right-3 top-3"
    >
    </motion.button>
  )

 const Thumbnail: React.FC<{
  thumbnail: string | null
  images: any[]
  size: string
  isFeatured: boolean
}> = ({ thumbnail }) => {
  const imageUrl = getVariantImage()
  
  return (
    <Image
      src={imageUrl || "/placeholder.png"}
      alt={productName}
      fill
      className={`object-cover transition-all duration-300 ${
        hoveredColor ? 'brightness-110' : ''
      }`}
      key={`${selectedColor}-${hoveredColor}`}
    />
  )
}
  const Text: React.FC<{
    className: string
    children: React.ReactNode
    [key: string]: any
  }> = ({ className, children, ...props }) => (
    <p className={className} {...props}>
      {children}
    </p>
  )

  const LocalizedClientLink: React.FC<{
    href: string
    children: React.ReactNode
  }> = ({ href, children }) => (
    // <Link href={href}>{children}</Link>
    <Link href={href} prefetch={true}>{children}</Link>
  )

  const productTags = product?.tags || []
  const vendorName = product?.vendor?.name || "Junooni"

  return (
    <motion.div
      variants={slideIn}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid="product-wrapper"
      className="relative flex flex-col h-full p-1 border border-gray-100 shadow-sm sm:p-3 group hover:shadow-md"
    >
      {/* Product image container */}
      <div className="relative overflow-hidden rounded-lg bg-gray-50 aspect-[4/5] mb-4">
        {/* <WishlistButton variantId={product.variants?.[0]?.id} /> */}

        {/* Product tags */}
        

        {/* Image with hover effect */}
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
          <Thumbnail
            thumbnail={productImage}
            images={product.images || []}
            size="full"
            isFeatured={false}
          />
        </div>
         <WishlistButton alwaysVisible={true} variantId={product.variants?.[0]?.id} />

        {/* Quick view overlay */}
        <motion.div
          className="absolute inset-x-0 bottom-0 flex items-center justify-center p-2 transition-all bg-white/90"
          initial={{ translateY: "100%", opacity: 0 }}
          animate={{
            translateY: isHovered ? 0 : "100%",
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <LocalizedClientLink href={`/products/${productHandle}`}>
            <span className="text-sm font-medium">Quick view</span>
          </LocalizedClientLink>
        </motion.div>
      </div>

      {/* Product info section */}
      <div className="flex flex-col pl-1 space-y-2 sm:pl-0">
        {/* Vendor name row */}
        <div className="flex items-center text-xs text-gray-600 sm:text-sm">
          <span className="mr-1">{vendorName}</span>
          {product.vendor?.verified === "Yes" && (
            <span className="text-[#e65100]">
              {/* <Check size={14} /> */}
              
                            <svg
                              className="inline-block ml-2 align-middle"
                              width="18"
                              height="18"
                              viewBox="0 0 20 20"
                              preserveAspectRatio="xMidYMid meet"
                              aria-label="Verified"
                            >
                              {/* Verified badge shape (clean + symmetrical) */}
                              <path
                                fill="#e65100"
                                d="
                                  M10 0.8
                                  L12.2 2.2
                                  L14.9 1.9
                                  L16.1 4.4
                                  L18.6 5.6
                                  L17.9 8.3
                                  L19.2 10
                                  L17.9 11.7
                                  L18.6 14.4
                                  L16.1 15.6
                                  L14.9 18.1
                                  L12.2 17.8
                                  L10 19.2
                                  L7.8 17.8
                                  L5.1 18.1
                                  L3.9 15.6
                                  L1.4 14.4
                                  L2.1 11.7
                                  L0.8 10
                                  L2.1 8.3
                                  L1.4 5.6
                                  L3.9 4.4
                                  L5.1 1.9
                                  L7.8 2.2
                                  Z"
                              />

                              {/* Check */}
                              <path
                                d="M6.2 10.2l2.1 2.2 4.5-4.6"
                                fill="none"
                                stroke="white"
                                strokeWidth="1.9"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          
            </span>
          )}
        </div>

        {/* Product title row */}
        <LocalizedClientLink href={`/products/${productHandle}`}>
          <Text
            className="text-sm font-medium leading-tight truncate sm:text-base"
            data-testid="product-title"
            title={productName}
          >
            {productName}
          </Text>
        </LocalizedClientLink>

        {/* Color options row */}
        <ColorOptions colors={productColors} />

        {/* Price row */}
        <div className="text-sm font-bold text-gray-900 sm:text-base">
          <PreviewPrice price={priceData} />
        </div>

        {/* Reviews section row */}
        <div className="flex items-center">
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
                    size={12}
                    className={i < Math.floor(averageRating) ? "text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">
                ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </>
          ) : (
            <div className="flex items-center">
              <div className="flex mr-1 text-gray-300">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    fill="none"
                    size={12}
                    className="text-gray-300"
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">No reviews</span>
            </div>
          )}
        </div>
      </div>

     
    </motion.div>
  )
}

export default CreatorStorePage