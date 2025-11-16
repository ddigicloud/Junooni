// "use client"

// import React, { useState, useEffect } from "react"
// import {
//   Search,
//   ArrowLeft,
//   Heart,
//   Bell,
//   ChevronDown,
//   ChevronRight,
//   X,
//   Star,
//   TrendingUp,
//   Users,
//   Store,
//   Package,
//   ShoppingBag,
//   Truck,
// } from "lucide-react"
// import { followerList } from "@lib/data/customer"
// import { retriveVendorsFollowers, retriveVendors } from "@lib/data/vendors"
// import {
//   Addfollower,
//   deletefollower,
//   retrieveCustomer,
// } from "@lib/data/customer"
// import { assets } from "@assets/assets"
// import { toast } from "react-toastify"
// import Image from "next/image"
// import Link from "next/link"
// import { motion } from "framer-motion"

// // Cookie utility functions
// const getCookie = (name: string): string | null => {
//   if (typeof document === 'undefined') return null
//   const value = `; ${document.cookie}`
//   const parts = value.split(`; ${name}=`)
//   if (parts.length === 2) return parts.pop()?.split(';').shift() || null
//   return null
// }

// const setCookie = (name: string, value: string, days: number = 365) => {
//   if (typeof document === 'undefined') return
//   const expires = new Date()
//   expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
//   document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
// }

// // Cookie-based preference management
// const getUserPreferences = () => {
//   try {
//     const prefs = getCookie('userPreferences')
//     return prefs ? JSON.parse(decodeURIComponent(prefs)) : {
//       likedCategories: [],
//       viewedVendors: [],
//       interactions: {}
//     }
//   } catch (error) {
//     console.error('Error parsing user preferences:', error)
//     return {
//       likedCategories: [],
//       viewedVendors: [],
//       interactions: {}
//     }
//   }
// }

// const saveUserPreferences = (preferences: any) => {
//   try {
//     setCookie('userPreferences', encodeURIComponent(JSON.stringify(preferences)))
//   } catch (error) {
//     console.error('Error saving user preferences:', error)
//   }
// }

// const trackVendorInteraction = (vendorId: string, category: string, action: 'view' | 'follow' | 'like') => {
//   const prefs = getUserPreferences()
  
//   // Track category preference
//   if (category && !prefs.likedCategories.includes(category)) {
//     prefs.likedCategories.push(category)
//   }
  
//   // Track viewed vendors
//   if (!prefs.viewedVendors.includes(vendorId)) {
//     prefs.viewedVendors.push(vendorId)
//   }
  
//   // Track interaction type
//   if (!prefs.interactions[vendorId]) {
//     prefs.interactions[vendorId] = []
//   }
//   if (!prefs.interactions[vendorId].includes(action)) {
//     prefs.interactions[vendorId].push(action)
//   }
  
//   saveUserPreferences(prefs)
// }

// // Define interfaces for our data structures
// interface Vendor {
//   id: string
//   name: string
//   handle: string
//   logo?: string
//   coverphoto?: string
//   creator_title?: string
//   creator_bio?: string
//   popular_product?: string
// }

// interface AllVendor {
//   id: string
//   name: string
//   handle: string
//   logo?: string
//   coverphoto?: string
//   creator_title?: string
//   creator_bio?: string
//   popular_product?: string
// }

// interface VendorItem {
//   id: string
//   vendor: Vendor
// }

// interface FollowerResult {
//   follow?: boolean | any[]
// }

// interface CustomerFollowers {
//   follow?: {
//     creators?: VendorItem[]
//   }
// }

// interface Category {
//   id: string
//   name: string
//   icon: React.ReactNode
// }

// const VendorsDiscoveryPage = () => {
//   // State for search and filtering
//   const [searchQuery, setSearchQuery] = useState<string>("")
//   const [activeCategory, setActiveCategory] = useState<string>("all")
//   const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false)
//   const [customerVendors, setCustomerVendors] = useState<VendorItem[]>([])
//   const [filteredVendors, setFilteredVendors] = useState<VendorItem[]>([])
//   const [isLoading, setIsLoading] = useState<boolean>(true)
//   const [categories, setCategories] = useState<Category[]>([
//     { id: "all", name: "All Categories", icon: <Store size={18} /> },
//   ])
//   const [followerCounts, setFollowerCounts] = useState<Record<string, number>>(
//     {}
//   )
//   const [allVendors, setAllVendors] = useState<AllVendor[]>([])
//   const [recommendedVendors, setRecommendedVendors] = useState<AllVendor[]>([])

//   // State for follow/unfollow functionality
//   const [currentCustomer, setCurrentCustomer] = useState(null)
//   const [isLoadingFollow, setIsLoadingFollow] = useState<
//     Record<string, boolean>
//   >({})
//   const [followedVendors, setFollowedVendors] = useState<
//     Record<string, boolean>
//   >({})
//   const [userPreferences, setUserPreferences] = useState(getUserPreferences())

//   const avatarImage = assets.rabit
//   const CoverImage = assets.wishlistBanner

//   // Helper function to check if a vendor matches current filters
//   const matchesCurrentFilters = (vendor: any) => {
//     const matchesSearch =
//       searchQuery === "" ||
//       vendor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       false

//     const matchesCategory =
//       activeCategory === "all" ||
//       (vendor.creator_title &&
//         vendor.creator_title.toLowerCase() === activeCategory.toLowerCase())

//     return matchesSearch && matchesCategory
//   }

//   // Function to get related vendors based on followed vendors AND cookie preferences
//   const getRelatedVendors = (followedVendors: VendorItem[], allVendors: AllVendor[], preferences: any) => {
//     if (allVendors.length === 0) return []
    
//     const followedVendorIds = new Set<string>()
//     const followedCategories = new Set<string>()

//     // Get followed vendor IDs and categories from actual follows
//     followedVendors.forEach((item) => {
//       if (item.vendor?.id) {
//         followedVendorIds.add(item.vendor.id)
//       }
//       if (item.vendor?.creator_title) {
//         followedCategories.add(item.vendor.creator_title.toLowerCase())
//       }
//     })

//     // Add categories from cookie preferences
//     if (preferences?.likedCategories) {
//       preferences.likedCategories.forEach((cat: string) => {
//         followedCategories.add(cat.toLowerCase())
//       })
//     }

//     // Score-based recommendation system
//     const scoredVendors = allVendors
//       .filter((vendor) => !followedVendorIds.has(vendor.id))
//       .map((vendor) => {
//         let score = 0
        
//         // Higher score for matching category preferences
//         if (vendor.creator_title && followedCategories.has(vendor.creator_title.toLowerCase())) {
//           score += 10
//         }
        
//         // Bonus for popular products
//         if (vendor.popular_product) {
//           score += 3
//         }
        
//         // Small random factor for variety
//         score += Math.random() * 2
        
//         return { vendor, score }
//       })
//       .sort((a, b) => b.score - a.score)
//       .map(item => item.vendor)

//     return scoredVendors
//   }

//   // Get unique categories from followed vendors
//   const getFollowedCategories = () => {
//     const categories = new Set<string>()
//     customerVendors.forEach((item) => {
//       if (item.vendor?.creator_title) {
//         categories.add(item.vendor.creator_title)
//       }
//     })
//     return Array.from(categories)
//   }

//   // Fetch customer data
//   useEffect(() => {
//     const fetchCustomerData = async () => {
//       try {
//         const customer = await retrieveCustomer()
//         setCurrentCustomer(customer)
//       } catch (error) {
//         console.error("Error fetching customer:", error)
//       }
//     }
//     fetchCustomerData()
//   }, [])

//   // Fetch all vendors
//   useEffect(() => {
//     const fetchAllVendors = async () => {
//       try {
//         const vendors = await retriveVendors()
//         if (vendors && Array.isArray(vendors)) {
//           setAllVendors(vendors)
//         }
//       } catch (error) {
//         console.error("Error fetching all vendors:", error)
//       }
//     }
//     fetchAllVendors()
//   }, [])

//   // Fetch followed vendors for the customer
//   useEffect(() => {
//     const fetchFollowedVendors = async () => {
//       if (!currentCustomer) {
//         setIsLoading(false)
//         return
//       }

//       try {
//         const followData: CustomerFollowers = await followerList()

//         if (followData?.follow?.creators && Array.isArray(followData.follow.creators)) {
//           const vendors = followData.follow.creators
//           setCustomerVendors(vendors)
//           setFilteredVendors(vendors)

//           // Initialize follow states
//           const followStates: Record<string, boolean> = {}
//           vendors.forEach((item: VendorItem) => {
//             if (item.vendor?.id) {
//               followStates[item.vendor.id] = true
//             }
//           })
//           setFollowedVendors(followStates)
//         }
//       } catch (error) {
//         console.error("Error fetching followed vendors:", error)
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchFollowedVendors()
//   }, [currentCustomer])

//   // Extract and set categories dynamically
//   useEffect(() => {
//     if (allVendors.length > 0) {
//       const categorySet = new Set<string>()
//       allVendors.forEach((vendor) => {
//         if (vendor.creator_title) {
//           categorySet.add(vendor.creator_title)
//         }
//       })

//       const iconMap: Record<string, React.ReactNode> = {
//         default: <Store size={18} />,
//         electronics: <Package size={18} />,
//         fashion: <ShoppingBag size={18} />,
//         food: <Store size={18} />,
//         delivery: <Truck size={18} />,
//       }

//       const newCategories: Category[] = [
//         { id: "all", name: "All Categories", icon: <Store size={18} /> },
//         ...Array.from(categorySet).map((cat) => ({
//           id: cat.toLowerCase(),
//           name: cat,
//           icon: iconMap[cat.toLowerCase()] || iconMap.default,
//         })),
//       ]

//       setCategories(newCategories)
//     }
//   }, [allVendors])

//   // Update recommendations when vendors or preferences change
//   useEffect(() => {
//     const prefs = getUserPreferences()
//     setUserPreferences(prefs)
    
//     if (allVendors.length > 0) {
//       const recommended = getRelatedVendors(customerVendors, allVendors, prefs)
//       setRecommendedVendors(recommended)
//     }
//   }, [customerVendors, allVendors])

//   // Fetch follower counts for all vendors
//   useEffect(() => {
//     const fetchFollowerCounts = async () => {
//       if (allVendors.length === 0) return

//       try {
//         const counts: Record<string, number> = {}
//         await Promise.all(
//           allVendors.map(async (vendor) => {
//             try {
//               const result: FollowerResult = await retriveVendorsFollowers(vendor.id)
//               if (result?.follow && typeof result.follow === "object" && Array.isArray(result.follow)) {
//                 counts[vendor.id] = result.follow.length
//               } else {
//                 counts[vendor.id] = 0
//               }
//             } catch (error) {
//               console.error(`Error fetching followers for vendor ${vendor.id}:`, error)
//               counts[vendor.id] = 0
//             }
//           })
//         )
//         setFollowerCounts(counts)
//       } catch (error) {
//         console.error("Error fetching follower counts:", error)
//       }
//     }

//     fetchFollowerCounts()
//   }, [allVendors])

//   // Apply filters to followed vendors
//   useEffect(() => {
//     if (customerVendors.length > 0) {
//       const filtered = customerVendors.filter((item) => {
//         if (!item.vendor) return false
//         return matchesCurrentFilters(item.vendor)
//       })
//       setFilteredVendors(filtered)
//     }
//   }, [searchQuery, activeCategory, customerVendors])

//   // Handle follow/unfollow
//   const handleFollowToggle = async (vendorId: string, vendorCategory?: string) => {
//     if (!currentCustomer) {
//       toast.error("Please log in to follow vendors")
//       return
//     }

//     setIsLoadingFollow((prev) => ({ ...prev, [vendorId]: true }))

//     try {
//       const isCurrentlyFollowed = followedVendors[vendorId]

//       if (isCurrentlyFollowed) {
//         await deletefollower(vendorId)
//         setFollowedVendors((prev) => ({ ...prev, [vendorId]: false }))
//         setCustomerVendors((prev) =>
//           prev.filter((item) => item.vendor?.id !== vendorId)
//         )
//         setFollowerCounts((prev) => ({
//           ...prev,
//           [vendorId]: Math.max(0, (prev[vendorId] || 0) - 1),
//         }))
//         toast.success("Vendor unfollowed")
//       } else {
//         await Addfollower(vendorId)
//         setFollowedVendors((prev) => ({ ...prev, [vendorId]: true }))
        
//         // Add to customer vendors list
//         const vendor = allVendors.find((v) => v.id === vendorId)
//         if (vendor) {
//           setCustomerVendors((prev) => [...prev, { id: vendorId, vendor }])
//         }
        
//         setFollowerCounts((prev) => ({
//           ...prev,
//           [vendorId]: (prev[vendorId] || 0) + 1,
//         }))
        
//         // Track the follow interaction
//         if (vendorCategory) {
//           trackVendorInteraction(vendorId, vendorCategory, 'follow')
//           setUserPreferences(getUserPreferences())
//         }
        
//         toast.success("Vendor followed successfully!")
//       }
//     } catch (error) {
//       console.error("Error toggling follow:", error)
//       toast.error("Failed to update follow status")
//     } finally {
//       setIsLoadingFollow((prev) => ({ ...prev, [vendorId]: false }))
//     }
//   }

//   // Vendor Card Component for followed vendors
//   const VendorCard = ({ vendor }: { vendor: VendorItem }) => {
//     if (!vendor.vendor) return null

//     const { id, name, handle, logo, coverphoto, creator_title, creator_bio } =
//       vendor.vendor
//     const isFollowed = followedVendors[id] || false
//     const isLoading = isLoadingFollow[id] || false
//     const followerCount = followerCounts[id] || 0

//     return (
//       <Link href={`/vendors/${handle}`}>
//         <motion.div
//           className="relative flex flex-col h-full overflow-hidden transition-all duration-300 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md group"
//           whileHover={{ y: -4 }}
//         >
//           {/* Cover Image */}
//           <div className="relative h-24 bg-gradient-to-br from-orange-400 to-orange-600">
//             {coverphoto && (
//               <Image
//                 src={coverphoto}
//                 alt={name}
//                 fill
//                 className="object-cover"
//               />
//             )}
//           </div>

//           {/* Logo/Avatar */}
//           <div className="absolute top-14 left-4">
//             <div className="w-16 h-16 overflow-hidden bg-white border-4 border-white rounded-full shadow-md">
//               <Image
//                 src={logo || avatarImage}
//                 alt={name}
//                 width={64}
//                 height={64}
//                 className="object-cover w-full h-full"
//               />
//             </div>
//           </div>

//           {/* Content */}
//           <div className="flex flex-col flex-1 px-4 pt-10 pb-4">
//             <div className="flex-1">
//               <h3 className="mb-1 text-base font-semibold truncate">{name}</h3>
//               <p className="mb-2 text-xs text-gray-500">@{handle}</p>

//               {creator_title && (
//                 <span className="inline-block px-2 py-0.5 bg-orange-50 text-[#e65100] text-xs rounded-full mb-2">
//                   {creator_title}
//                 </span>
//               )}

//               {creator_bio && (
//                 <p className="mb-3 text-sm text-gray-600 line-clamp-2">
//                   {creator_bio}
//                 </p>
//               )}
//             </div>

//             {/* Stats and Actions */}
//             <div className="flex items-center justify-between pt-3 border-t">
//               <div className="flex items-center gap-1 text-xs text-gray-500">
//                 <Users size={14} />
//                 <span>{followerCount} followers</span>
//               </div>

//               <button
//                 onClick={(e) => {
//                   e.preventDefault()
//                   handleFollowToggle(id, creator_title)
//                 }}
//                 disabled={isLoading}
//                 className={`px-3 py-1 text-xs font-medium rounded-full transition ${
//                   isFollowed
//                     ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     : "bg-[#e65100] text-white hover:bg-[#d84315]"
//                 } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
//               >
//                 {isLoading ? "..." : isFollowed ? "Following" : "Follow"}
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       </Link>
//     )
//   }

//   // Recommended Vendor Card Component
//   const RecommendedVendorCard = ({ 
//     vendor, 
//     isRecommended = false 
//   }: { 
//     vendor: AllVendor
//     isRecommended?: boolean 
//   }) => {
//     const { id, name, handle, logo, coverphoto, creator_title, creator_bio, popular_product } = vendor
//     const isFollowed = followedVendors[id] || false
//     const isLoading = isLoadingFollow[id] || false
//     const followerCount = followerCounts[id] || 0

//     return (
//       <Link href={`/vendors/${handle}`}>
//         <motion.div
//           className="relative flex flex-col h-full overflow-hidden transition-all duration-300 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md group"
//           whileHover={{ y: -4 }}
//           onClick={() => trackVendorInteraction(id, creator_title || '', 'view')}
//         >
//           {isRecommended && (
//             <div className="absolute z-10 top-2 right-2">
//               <div className="bg-[#e65100] text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
//                 <Star size={12} fill="currentColor" />
//                 Recommended
//               </div>
//             </div>
//           )}

//           {/* Cover Image */}
//           <div className="relative h-24 bg-gradient-to-br from-orange-400 to-orange-600">
//             {coverphoto && (
//               <Image
//                 src={coverphoto}
//                 alt={name}
//                 fill
//                 className="object-cover"
//               />
//             )}
//           </div>

//           {/* Logo/Avatar */}
//           <div className="absolute top-14 left-4">
//             <div className="w-16 h-16 overflow-hidden bg-white border-4 border-white rounded-full shadow-md">
//               <Image
//                 src={logo || avatarImage}
//                 alt={name}
//                 width={64}
//                 height={64}
//                 className="object-cover w-full h-full"
//               />
//             </div>
//           </div>

//           {/* Content */}
//           <div className="flex flex-col flex-1 px-4 pt-10 pb-4">
//             <div className="flex-1">
//               <h3 className="mb-1 text-base font-semibold truncate">{name}</h3>
//               <p className="mb-2 text-xs text-gray-500">@{handle}</p>

//               {creator_title && (
//                 <span className="inline-block px-2 py-0.5 bg-orange-50 text-[#e65100] text-xs rounded-full mb-2">
//                   {creator_title}
//                 </span>
//               )}

//               {creator_bio && (
//                 <p className="mb-2 text-sm text-gray-600 line-clamp-2">
//                   {creator_bio}
//                 </p>
//               )}

//               {popular_product && (
//                 <div className="mb-2 text-xs text-gray-500">
//                   <span className="font-medium">Popular:</span> {popular_product}
//                 </div>
//               )}
//             </div>

//             {/* Stats and Actions */}
//             <div className="flex items-center justify-between pt-3 border-t">
//               <div className="flex items-center gap-1 text-xs text-gray-500">
//                 <Users size={14} />
//                 <span>{followerCount} followers</span>
//               </div>

//               <button
//                 onClick={(e) => {
//                   e.preventDefault()
//                   handleFollowToggle(id, creator_title)
//                 }}
//                 disabled={isLoading || !currentCustomer}
//                 className={`px-3 py-1 text-xs font-medium rounded-full transition ${
//                   isFollowed
//                     ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     : "bg-[#e65100] text-white hover:bg-[#d84315]"
//                 } ${isLoading || !currentCustomer ? "opacity-50 cursor-not-allowed" : ""}`}
//               >
//                 {isLoading ? "..." : isFollowed ? "Following" : "Follow"}
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       </Link>
//     )
//   }

//   // Skeleton Loading Component
//   const SkeletonGrid = () => (
//     <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
//       {[...Array(8)].map((_, i) => (
//         <div key={i} className="overflow-hidden bg-white rounded-lg shadow-sm animate-pulse">
//           <div className="h-24 bg-gray-200" />
//           <div className="px-4 pt-10 pb-4">
//             <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded" />
//             <div className="w-1/2 h-3 mb-4 bg-gray-200 rounded" />
//             <div className="w-full h-3 mb-2 bg-gray-200 rounded" />
//             <div className="w-5/6 h-3 bg-gray-200 rounded" />
//           </div>
//         </div>
//       ))}
//     </div>
//   )

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="sticky top-0 z-40 bg-white shadow-sm">
//         <div className="container px-4 py-4 mx-auto">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-3">
//               <Link href="/">
//                 <button className="p-2 rounded-full hover:bg-gray-100">
//                   <ArrowLeft size={20} />
//                 </button>
//               </Link>
//               <div>
//                 <h1 className="text-2xl font-bold">Discover Vendors</h1>
//                 <p className="text-sm text-gray-600">
//                   Explore and follow your favorite vendors
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Search and Filters */}
//           <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
//             <div className="relative flex-1">
//               <input
//                 type="text"
//                 placeholder="Search vendors..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full px-4 py-2 pl-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e65100]"
//               />
//               <Search
//                 className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
//                 size={18}
//               />
//               {searchQuery && (
//                 <button
//                   className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-500"
//                   onClick={() => setSearchQuery("")}
//                 >
//                   <X size={16} />
//                 </button>
//               )}
//             </div>
//             <div className="">
//               <button
//                 className="relative flex items-center gap-2 p-2 px-4 bg-gray-100 rounded-full"
//                 onClick={() => setIsFiltersOpen(!isFiltersOpen)}
//               >
//                 Filter
//                 <motion.div
//                   animate={{ rotate: isFiltersOpen ? 180 : 0 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   <ChevronDown size={20} />
//                 </motion.div>
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Filters panel - conditionally shown */}
//       {isFiltersOpen && (
//         <div className="bg-white border-t border-b shadow-sm">
//           <div className="container px-4 py-4 mx-auto">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="font-medium">Filter by Vendor Type</h3>
//               <button
//                 className="text-sm text-[#e65100] hover:underline"
//                 onClick={() => {
//                   setActiveCategory("all")
//                   setSearchQuery("")
//                 }}
//               >
//                 Reset Filters
//               </button>
//             </div>

//             <div className="flex flex-wrap gap-2">
//               {categories.map((category) => (
//                 <button
//                   key={category.id}
//                   className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition ${
//                     activeCategory === category.id
//                       ? "bg-[#e65100] text-white"
//                       : "bg-gray-100 text-gray-800 hover:bg-gray-200"
//                   }`}
//                   onClick={() => setActiveCategory(category.id)}
//                 >
//                   <span className="mr-1.5">{category.icon}</span>
//                   {category.name}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       <main className="container px-4 py-6 mx-auto">
//         {/* Followed Vendors Section - Only show if user is logged in */}
//         {currentCustomer && (
//           <section className="mb-10">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-2xl font-bold">Followed Vendors</h2>
//               {!isLoading && customerVendors && customerVendors.length > 0 && (
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">
//                     {filteredVendors.length} of {customerVendors.length}
//                   </span>
//                 </div>
//               )}
//             </div>

//             {/* Loading state */}
//             {isLoading ? (
//               <SkeletonGrid />
//             ) : customerVendors && customerVendors.length > 0 ? (
//               <>
//                 {filteredVendors.length > 0 ? (
//                   <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
//                     {filteredVendors.map((vendor) => (
//                       <VendorCard key={vendor.id} vendor={vendor} />
//                     ))}
//                   </div>
//                 ) : (
//                   // No results after filtering
//                   <div className="p-8 text-center bg-white rounded-lg shadow-sm">
//                     <div className="mb-4 text-gray-400">
//                       <Search size={64} className="mx-auto" />
//                     </div>
//                     <h3 className="mb-2 text-xl font-medium">
//                       No vendors match your filters
//                     </h3>
//                     <p className="mb-6 text-gray-600">
//                       Try adjusting your search terms or category filters to find
//                       the vendors you're looking for.
//                     </p>
//                     <button
//                       onClick={() => {
//                         setActiveCategory("all")
//                         setSearchQuery("")
//                       }}
//                       className="px-4 py-2 text-white bg-[#e65100] rounded-md hover:bg-[#d84315] transition"
//                     >
//                       Clear All Filters
//                     </button>
//                   </div>
//                 )}
//               </>
//             ) : (
//               // Empty state when no vendors are followed
//               <div className="p-8 text-center bg-white rounded-lg shadow-sm">
//                 <div className="mb-4 text-gray-400">
//                   <Store size={64} className="mx-auto" />
//                 </div>
//                 <h3 className="mb-2 text-xl font-medium">
//                   Not following any vendors yet
//                 </h3>
//                 <p className="mb-6 text-gray-600">
//                   Follow your favorite vendors to see their updates and new
//                   products in one place.
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   Discover vendors from the recommendations below and follow them
//                   to get started.
//                 </p>
//               </div>
//             )}
//           </section>
//         )}

//         {/* Recommended Vendors Section - Always visible */}
//         <section className="mb-10">
//           <h2 className="mb-6 text-2xl font-bold">
//             {currentCustomer ? "Recommended for You" : "Discover Vendors"}
//           </h2>

//           {/* Personalized Recommendations */}
//           <div className="mb-8">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <h3 className="flex items-center text-lg font-semibold">
//                   <Star size={18} className="text-[#e65100] mr-2" />
//                   {currentCustomer && getFollowedCategories().length > 0 ? (
//                     <>
//                       Because You Like
//                       <span className="ml-2 text-sm font-normal text-gray-500">
//                         ({getFollowedCategories().join(", ")})
//                       </span>
//                     </>
//                   ) : (
//                     "Featured Vendors"
//                   )}
//                 </h3>
//                 <p className="mt-1 text-sm text-gray-600">
//                   {currentCustomer && customerVendors.length > 0
//                     ? "More vendors from categories you enjoy"
//                     : "Explore quality vendors across various categories"}
//                 </p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
//               {recommendedVendors.length > 0 ? (
//                 recommendedVendors
//                   .slice(0, 8)
//                   .map((vendor) => (
//                     <RecommendedVendorCard key={vendor.id} vendor={vendor} isRecommended={true} />
//                   ))
//               ) : isLoading ? (
//                 <SkeletonGrid />
//               ) : (
//                 <div className="col-span-4 p-6 text-center bg-white rounded-lg shadow-sm">
//                   <div className="mb-4 text-gray-400">
//                     <Star size={48} className="mx-auto" />
//                   </div>
//                   <h3 className="mb-2 text-lg font-medium">
//                     {currentCustomer 
//                       ? "Start following vendors to get recommendations"
//                       : "No vendors available at the moment"}
//                   </h3>
//                   <p className="text-gray-600">
//                     {currentCustomer
//                       ? "Follow some vendors to see personalized recommendations"
//                       : "Check back soon for exciting vendor content"}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* All Vendors Section */}
//           {allVendors.length > 8 && (
//             <div className="mt-10">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold">More Vendors to Explore</h3>
//               </div>
//               <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
//                 {allVendors
//                   .filter(v => !recommendedVendors.some(rc => rc.id === v.id))
//                   .filter(v => activeCategory === 'all' || v.creator_title?.toLowerCase() === activeCategory)
//                   .filter(v => searchQuery === '' || v.name.toLowerCase().includes(searchQuery.toLowerCase()))
//                   .slice(0, 8)
//                   .map((vendor) => (
//                     <RecommendedVendorCard key={vendor.id} vendor={vendor} />
//                   ))}
//               </div>
//             </div>
//           )}
//         </section>
//       </main>
//     </div>
//   )
// }

// export default VendorsDiscoveryPage

"use client"

import React, { useState, useEffect } from "react"
import {
  Search,
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  Store,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react"
import { retriveVendorsFollowers, retriveVendors } from "@lib/data/vendors"
import { followerList } from "@lib/data/customer"
import {
  Addfollower,
  deletefollower,
  retrieveCustomer,
} from "@lib/data/customer"
import { assets } from "@assets/assets"
import { toast } from "react-toastify"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

// Define interfaces
interface Vendor {
  id: string
  name: string
  handle: string
  logo?: string
  coverphoto?: string
  creator_title?: string
  creator_bio?: string
  popular_product?: string
}

interface Category {
  id: string
  name: string
  icon: React.ReactNode
}

const VendorsDiscoveryPage = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false)
  const [allVendors, setAllVendors] = useState<Vendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", name: "All Categories", icon: <Store size={18} /> },
  ])
  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>({})
  const [currentCustomer, setCurrentCustomer] = useState(null)
  const [isLoadingFollow, setIsLoadingFollow] = useState<Record<string, boolean>>({})
  const [followedVendors, setFollowedVendors] = useState<Record<string, boolean>>({})

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [vendorsPerPage] = useState<number>(12) // Show 12 vendors per page

  const avatarImage = assets.rabit
  const CoverImage = assets.wishlistBanner

  // Pagination calculations
  const indexOfLastVendor = currentPage * vendorsPerPage
  const indexOfFirstVendor = indexOfLastVendor - vendorsPerPage
  const currentVendors = filteredVendors.slice(indexOfFirstVendor, indexOfLastVendor)
  const totalPages = Math.ceil(filteredVendors.length / vendorsPerPage)

  // Pagination handlers
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Get page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('...')
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1)
        pageNumbers.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        pageNumbers.push(1)
        pageNumbers.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('...')
        pageNumbers.push(totalPages)
      }
    }
    
    return pageNumbers
  }

  // Fetch customer data
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const customer = await retrieveCustomer()
        setCurrentCustomer(customer)
      } catch (error) {
        //console.error("Error fetching customer:", error)
      }
    }
    fetchCustomerData()
  }, [])

  // Fetch all vendors
  useEffect(() => {
    const fetchAllVendors = async () => {
      setIsLoading(true)
      try {
        const vendors = await retriveVendors()
        if (vendors && Array.isArray(vendors)) {
          setAllVendors(vendors)
          setFilteredVendors(vendors)
        }
      } catch (error) {
        //console.error("Error fetching vendors:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAllVendors()
  }, [])

  // Fetch followed vendors status
  useEffect(() => {
    const fetchFollowedVendors = async () => {
      if (!currentCustomer) return

      try {
        const followData = await followerList()
        if (followData?.follow?.creators && Array.isArray(followData.follow.creators)) {
          const followStates: Record<string, boolean> = {}
          followData.follow.creators.forEach((item: any) => {
            if (item.vendor?.id) {
              followStates[item.vendor.id] = true
            }
          })
          setFollowedVendors(followStates)
        }
      } catch (error) {
        //console.error("Error fetching followed vendors:", error)
      }
    }

    fetchFollowedVendors()
  }, [currentCustomer])

  // Extract and set categories dynamically
  useEffect(() => {
    if (allVendors.length > 0) {
      const categorySet = new Set<string>()
      allVendors.forEach((vendor) => {
        if (vendor.creator_title) {
          categorySet.add(vendor.creator_title)
        }
      })

      const iconMap: Record<string, React.ReactNode> = {
        default: <Store size={18} />,
        electronics: <Package size={18} />,
        fashion: <ShoppingBag size={18} />,
        food: <Store size={18} />,
        delivery: <Truck size={18} />,
      }

      const newCategories: Category[] = [
        { id: "all", name: "All Categories", icon: <Store size={18} /> },
        ...Array.from(categorySet).map((cat) => ({
          id: cat.toLowerCase(),
          name: cat,
          icon: iconMap[cat.toLowerCase()] || iconMap.default,
        })),
      ]

      setCategories(newCategories)
    }
  }, [allVendors])

  // Fetch follower counts
  useEffect(() => {
    const fetchFollowerCounts = async () => {
      if (allVendors.length === 0) return

      try {
        const counts: Record<string, number> = {}
        await Promise.all(
          allVendors.map(async (vendor) => {
            try {
              const result = await retriveVendorsFollowers(vendor.id)
              if (result?.follow && typeof result.follow === "object" && Array.isArray(result.follow)) {
                counts[vendor.id] = result.follow.length
              } else {
                counts[vendor.id] = 0
              }
            } catch (error) {
              counts[vendor.id] = 0
            }
          })
        )
        setFollowerCounts(counts)
      } catch (error) {
        //console.error("Error fetching follower counts:", error)
      }
    }

    fetchFollowerCounts()
  }, [allVendors])

  // Apply filters
  useEffect(() => {
    let filtered = allVendors

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((vendor) =>
        vendor.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (vendor) =>
          vendor.creator_title?.toLowerCase() === activeCategory.toLowerCase()
      )
    }

    setFilteredVendors(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, activeCategory, allVendors])

  // Handle follow/unfollow
  const handleFollowToggle = async (vendorId: string) => {
    if (!currentCustomer) {
      toast.error("Please log in to follow creator")
      return
    }

    setIsLoadingFollow((prev) => ({ ...prev, [vendorId]: true }))

    try {
      const isCurrentlyFollowed = followedVendors[vendorId]

      if (isCurrentlyFollowed) {
        await deletefollower(vendorId)
        setFollowedVendors((prev) => ({ ...prev, [vendorId]: false }))
        setFollowerCounts((prev) => ({
          ...prev,
          [vendorId]: Math.max(0, (prev[vendorId] || 0) - 1),
        }))
        toast.success("Vendor unfollowed")
      } else {
        await Addfollower(vendorId)
        setFollowedVendors((prev) => ({ ...prev, [vendorId]: true }))
        setFollowerCounts((prev) => ({
          ...prev,
          [vendorId]: (prev[vendorId] || 0) + 1,
        }))
        toast.success("Vendor followed successfully!")
      }
    } catch (error) {
      //console.error("Error toggling follow:", error)
      toast.error("Failed to update follow status")
    } finally {
      setIsLoadingFollow((prev) => ({ ...prev, [vendorId]: false }))
    }
  }

  // Vendor Card Component
  const VendorCard = ({ vendor }: { vendor: Vendor }) => {
    const { id, name, handle, logo, coverphoto, creator_title, creator_bio } = vendor
    const isFollowed = followedVendors[id] || false
    const isLoading = isLoadingFollow[id] || false
    const followerCount = followerCounts[id] || 0

    return (
      <Link href={`/creator/${handle}`}>
        <motion.div
          className="relative flex flex-col h-full overflow-hidden transition-all duration-300 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md group"
          whileHover={{ y: -4 }}
        >
          {/* Cover Image */}
          <div className="relative h-24 bg-gradient-to-br from-orange-400 to-orange-600">
            {coverphoto && (
              <img
                src={coverphoto}
                alt={name}
                className="object-cover"
              />
            )}
          </div>

          {/* Logo/Avatar */}
          <div className="absolute top-14 left-4">
            <div className="w-16 h-16 overflow-hidden bg-white border-4 border-white rounded-full shadow-md">
              <img
                src={logo || avatarImage.src}
                alt={name}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 px-4 pt-10 pb-4">
            <div className="flex-1">
              <h3 className="mb-1 text-base font-semibold truncate">{name}</h3>
              <p className="mb-2 text-xs text-gray-500">@{handle}</p>

              {creator_title && (
                <span className="inline-block px-2 py-0.5 bg-orange-50 text-[#e65100] text-xs rounded-full mb-2">
                  {creator_title}
                </span>
              )}

              {creator_bio && (
                <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                  {creator_bio}
                </p>
              )}
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users size={14} />
                <span>{followerCount} followers</span>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleFollowToggle(id)
                }}
                disabled={isLoading || !currentCustomer}
                className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                  isFollowed
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-[#e65100] text-white hover:bg-[#d84315]"
                } ${isLoading || !currentCustomer ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isLoading ? "..." : isFollowed ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        </motion.div>
      </Link>
    )
  }

  // Skeleton Loading Component
  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="overflow-hidden bg-white rounded-lg shadow-sm animate-pulse">
          <div className="h-24 bg-gray-200" />
          <div className="px-4 pt-10 pb-4">
            <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded" />
            <div className="w-1/2 h-3 mb-4 bg-gray-200 rounded" />
            <div className="w-full h-3 mb-2 bg-gray-200 rounded" />
            <div className="w-5/6 h-3 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 mt-16 bg-white shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <ArrowLeft size={20} />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">All Creators</h1>
                {/* <p className="text-sm text-gray-600">
                  {filteredVendors.length} {filteredVendors.length === 1 ? 'vendor' : 'vendors'} available
                </p> */}
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e65100]"
              />
              <Search
                className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                size={18}
              />
              {searchQuery && (
                <button
                  className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-500"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="">
              <button
                className="relative flex items-center gap-2 p-2 px-4 bg-gray-100 rounded-full"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              >
                Filter
                <motion.div
                  animate={{ rotate: isFiltersOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={20} />
                </motion.div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters panel */}
      {isFiltersOpen && (
        <div className="bg-white border-t border-b shadow-sm">
          <div className="container px-4 py-4 mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Filter by Category</h3>
              <button
                className="text-sm text-[#e65100] hover:underline"
                onClick={() => {
                  setActiveCategory("all")
                  setSearchQuery("")
                }}
              >
                Reset Filters
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    activeCategory === category.id
                      ? "bg-[#e65100] text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className="mr-1.5">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container px-4 py-6 mx-auto">
        {isLoading ? (
          <SkeletonGrid />
        ) : filteredVendors.length > 0 ? (
          <>
            {/* Vendors Grid */}
            <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4">
              {currentVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {/* Previous Button */}
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum, index) => (
                    pageNum === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum as number)}
                        className={`px-3 py-2 rounded-lg border transition ${
                          currentPage === pageNum
                            ? "bg-[#e65100] text-white border-[#e65100]"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Results info */}
            <div className="mt-4 text-sm text-center text-gray-600">
              Showing {indexOfFirstVendor + 1} to {Math.min(indexOfLastVendor, filteredVendors.length)} of {filteredVendors.length} creators
            </div>
          </>
        ) : (
          // Empty state
          <div className="p-8 text-center bg-white rounded-lg shadow-sm">
            <div className="mb-4 text-gray-400">
              <Search size={64} className="mx-auto" />
            </div>
            <h3 className="mb-2 text-xl font-medium">No creators found</h3>
            <p className="mb-6 text-gray-600">
              {searchQuery || activeCategory !== 'all'
                ? "Try adjusting your search terms or filters"
                : "No creators are available at the moment"}
            </p>
            {(searchQuery || activeCategory !== 'all') && (
              <button
                onClick={() => {
                  setActiveCategory("all")
                  setSearchQuery("")
                }}
                className="px-4 py-2 text-white bg-[#e65100] rounded-md hover:bg-[#d84315] transition"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default VendorsDiscoveryPage