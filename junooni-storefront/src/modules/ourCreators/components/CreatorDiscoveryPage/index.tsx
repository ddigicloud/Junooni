// "use client"

// import React, { useState, useEffect } from "react"
// import {
//   Search,
//   ArrowLeft,
//   Heart,
//   Bell,
//   ChevronDown,
//   ChevronRight,
//   Star,
//   TrendingUp,
//   Users,
//   Award,
//   Music,
//   Palette,
//   Video,
//   Camera,
//   MessageCircle,
//   X,
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

// interface Creator {
//   id: string
//   vendor: Vendor
// }

// interface FollowerResult {
//   follow?: boolean | any[]
// }

// interface CustomerFollowers {
//   follow?: {
//     creators?: Creator[]
//   }
// }

// interface Category {
//   id: string
//   name: string
//   icon: React.ReactNode
// }

// interface TrendingCreator {
//   id: string
//   name: string
//   handle: string
//   avatar: string
//   category: string
//   followers: string
//   isVerified: boolean
//   description: string
//   popularProduct: string
//   bannerImage: string
//   match: number
// }

// interface RisingCreator {
//   id: string
//   name: string
//   handle: string
//   avatar: string
//   category: string
//   followers: string
//   growth: string
//   description: string
//   bannerImage: string
// }

// interface ExclusiveCreator {
//   id: string
//   name: string
//   handle: string
//   avatar: string
//   category: string
//   followers: string
//   description: string
//   bannerImage: string
// }

// const CreatorDiscoveryPage = () => {
//   // State for search and filtering
//   const [searchQuery, setSearchQuery] = useState<string>("")
//   const [activeCategory, setActiveCategory] = useState<string>("all")
//   const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false)
//   const [customerVendors, setCustomerVendors] = useState<Creator[]>([])
//   const [filteredVendors, setFilteredVendors] = useState<Creator[]>([])
//   const [isLoading, setIsLoading] = useState<boolean>(true)
//   const [categories, setCategories] = useState<Category[]>([
//     { id: "all", name: "All Categories", icon: <Users size={18} /> },
//   ])
//   const [followerCounts, setFollowerCounts] = useState<Record<string, number>>(
//     {}
//   )
//   const [allVendors, setAllVendors] = useState([])
//   const [recommendedCreators, setRecommendedCreators] = useState([])

//   // State for follow/unfollow functionality
//   const [currentCustomer, setCurrentCustomer] = useState(null)
//   const [isLoadingFollow, setIsLoadingFollow] = useState<
//     Record<string, boolean>
//   >({})
//   const [followedCreators, setFollowedCreators] = useState<
//     Record<string, boolean>
//   >({})

//   const avatarImage = assets.rabit
//   const CoverImage = assets.wishlistBanner

//   // Helper function to check if a vendor matches current filters
//   const matchesCurrentFilters = (vendor) => {
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

//   // Function to get related creators based on followed creators
//   const getRelatedCreators = (followedCreators: Creator[], allVendors: any[]) => {
//     if (!followedCreators || followedCreators.length === 0) {
//       // If not following anyone, return a diverse mix of creators
//       return allVendors.slice(0, 8)
//     }

//     // Extract categories from followed creators
//     const followedCategories = new Set<string>()
//     const followedCreatorIds = new Set<string>()

//     followedCreators.forEach((creator) => {
//       if (creator.vendor?.creator_title) {
//         followedCategories.add(creator.vendor.creator_title.toLowerCase())
//       }
//       if (creator.vendor?.id) {
//         followedCreatorIds.add(creator.vendor.id)
//       }
//     })

//     // Filter vendors to get related creators
//     const relatedCreators = allVendors.filter((vendor) => {
//       // Exclude already followed creators
//       if (followedCreatorIds.has(vendor.id)) {
//         return false
//       }

//       // Include creators from the same categories as followed creators
//       if (vendor.creator_title) {
//         return followedCategories.has(vendor.creator_title.toLowerCase())
//       }

//       return false
//     })

//     // If we have related creators, return them (limited to 8)
//     if (relatedCreators.length > 0) {
//       return relatedCreators.slice(0, 8)
//     }

//     // If no related creators found, return unfollowed creators from all categories
//     const unfollowedCreators = allVendors.filter((vendor) => 
//       !followedCreatorIds.has(vendor.id)
//     )
    
//     return unfollowedCreators.slice(0, 8)
//   }

//   // Update recommended creators when followed creators or all vendors change
//   useEffect(() => {
//     if (allVendors.length > 0) {
//       const related = getRelatedCreators(customerVendors, allVendors)
//       setRecommendedCreators(related)
//     }
//   }, [customerVendors, allVendors])

//   // Fetch customer data
//   useEffect(() => {
//     const fetchCustomer = async () => {
//       try {
//         const customer = await retrieveCustomer()
        
//         setCurrentCustomer(customer)
//       } catch (error) {
       
//         setCurrentCustomer(null)
//       }
//     }

//     fetchCustomer()
//   }, [])

//   // Fetch customer vendors data
//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true)
//       try {
//         const customerFollowers = (await followerList()) as CustomerFollowers
//         const allCreators = await retriveVendors()
       

//         const newList = customerFollowers.follow?.creators || []
//         setCustomerVendors(newList)
//         setFilteredVendors(newList)
//         setAllVendors(allCreators)

//         // Extract categories from the fetched data
//         extractCategoriesFromCreators(newList, allCreators)

//         // Fetch follower counts for each creator
//         fetchFollowerCounts(newList, allCreators)

//         // Initialize follow status for all vendors
//         const followStatus = {}
//         if (Array.isArray(allCreators)) {
//           allCreators.forEach((creator) => {
//             if (creator && creator.id) {
//               // Check if this creator is in the followed list
//               const isFollowed = newList.some(
//                 (followed) =>
//                   followed.vendor && followed.vendor.id === creator.id
//               )
//               followStatus[creator.id] = isFollowed
//             }
//           })
//         }

//         setFollowedCreators(followStatus)
//       } catch (error) {
//         setCustomerVendors([])
//         setFilteredVendors([])
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchData()
//   }, [])

//   // Initialize follow status when both customer and follower data are available
//   useEffect(() => {
//     if (
//       currentCustomer &&
//       customerVendors.length > 0 &&
//       Array.isArray(allVendors)
//     ) {
//       const followStatus = {}

//       // Initialize all vendors as not followed
//       allVendors.forEach((vendor) => {
//         if (vendor && vendor.id) {
//           followStatus[vendor.id] = false
//         }
//       })

//       // Then mark followed vendors based on customerVendors
//       customerVendors.forEach((creator) => {
//         if (creator.vendor && creator.vendor.id) {
//           followStatus[creator.vendor.id] = true
//         }
//       })

//       setFollowedCreators(followStatus)
//     }
//   }, [currentCustomer, customerVendors, allVendors])

//   // Fetch follower counts for each creator
//   const fetchFollowerCounts = async (creators: Creator[], vendors = []) => {
//     const counts: Record<string, number> = {}

//     try {
//       // Process creators in parallel using Promise.all
//       if (creators.length > 0) {
//         await Promise.all(
//           creators.map(async (creator) => {
//             if (creator.vendor && creator.vendor.id) {
//               const result = (await retriveVendorsFollowers(
//                 creator.vendor.id
//               )) as FollowerResult

//               // If there's data and it has a followers array or count
//               if (result && result.follow) {
//                 if (Array.isArray(result.follow)) {
//                   counts[creator.vendor.id] = result.follow.filter(
//                     (f) => f && f.follow
//                   ).length
//                 } else {
//                   counts[creator.vendor.id] = result.follow ? 1 : 0
//                 }
//               } else {
//                 counts[creator.vendor.id] = 0
//               }
//             }
//           })
//         )
//       }

//       // Also fetch counts for all vendors
//       if (Array.isArray(vendors) && vendors.length > 0) {
//         await Promise.all(
//           vendors.map(async (vendor) => {
//             if (vendor && vendor.id && !counts[vendor.id]) {
//               const result = await retriveVendorsFollowers(vendor.id)
//               if (result && result.follow) {
//                 if (Array.isArray(result.follow)) {
//                   counts[vendor.id] = result.follow.filter(
//                     (f) => f && f.follow
//                   ).length
//                 } else {
//                   counts[vendor.id] = result.follow ? 1 : 0
//                 }
//               } else {
//                 counts[vendor.id] = 0
//               }
//             }
//           })
//         )
//       }

//       setFollowerCounts(counts)
//     } catch (error) {
     
//     }
//   }

//   // Extract unique categories from creators and set up the categories state
//   const extractCategoriesFromCreators = (creators: Creator[], vendors = []) => {
//     // Always include "all" category
//     const categoryData: Category[] = [
//       { id: "all", name: "All Categories", icon: <Users size={18} /> },
//     ]

//     // Create a Set to store unique category titles
//     const uniqueCategoryTitles = new Set<string>()

//     // Extract creator titles and add to the Set
//     creators.forEach((creator) => {
//       if (
//         creator.vendor &&
//         creator.vendor.creator_title &&
//         creator.vendor.creator_title.trim()
//       ) {
//         uniqueCategoryTitles.add(creator.vendor.creator_title.trim())
//       }
//     })

//     // Also check allVendors
//     if (Array.isArray(vendors)) {
//       vendors.forEach((vendor) => {
//         if (vendor && vendor.creator_title && vendor.creator_title.trim()) {
//           uniqueCategoryTitles.add(vendor.creator_title.trim())
//         }
//       })
//     }

//     // Map of common categories to icons
//     const categoryIconMap: Record<string, React.ReactNode> = {
//       music: <Music size={18} />,
//       "visual art": <Palette size={18} />,
//       video: <Video size={18} />,
//       photography: <Camera size={18} />,
//       writing: <MessageCircle size={18} />,
//     }

//     // Convert Set to array and map to category objects
//     Array.from(uniqueCategoryTitles).forEach((title) => {
//       const lowerTitle = title.toLowerCase()
//       const icon = categoryIconMap[lowerTitle] || <Star size={18} />

//       categoryData.push({
//         id: lowerTitle,
//         name: title,
//         icon: icon,
//       })
//     })

//     setCategories(categoryData)
//   }

//   // Update filtered vendors when search query or category changes
//   useEffect(() => {
//     if (!customerVendors) return

//     const filtered = customerVendors.filter((creator) => {
//       // Filter by name (search)
//       const matchesSearch =
//         searchQuery === "" ||
//         (creator.vendor && creator.vendor.name
//           ? creator.vendor.name
//               .toLowerCase()
//               .includes(searchQuery.toLowerCase())
//           : false)

//       // Filter by category
//       const matchesCategory =
//         activeCategory === "all" ||
//         (creator.vendor && creator.vendor.creator_title
//           ? creator.vendor.creator_title.toLowerCase() ===
//             activeCategory.toLowerCase()
//           : false)

//       return matchesSearch && matchesCategory
//     })

//     setFilteredVendors(filtered)
//   }, [searchQuery, activeCategory, customerVendors])

//   // Improved follow/unfollow functionality
//   const handleFollowToggle = async (vendorId) => {
//     // Check if user is logged in
//     if (!currentCustomer) {
      
//       return toast.warning("Please log in to follow/unfollow.")
//     }

//     // Set loading state for this specific creator
//     setIsLoadingFollow((prev) => ({ ...prev, [vendorId]: true }))

//     try {
//       // Check current following status and take appropriate action
//       const isCurrentlyFollowing = followedCreators[vendorId]

//       if (isCurrentlyFollowing) {
       
//         await deletefollower(vendorId)

//         // Update UI state immediately for better user experience
//         setFollowedCreators((prev) => ({
//           ...prev,
//           [vendorId]: false,
//         }))

//         // Remove from followed list
//         setCustomerVendors((prev) =>
//           prev.filter((creator) => creator.vendor?.id !== vendorId)
//         )
//         setFilteredVendors((prev) =>
//           prev.filter((creator) => creator.vendor?.id !== vendorId)
//         )
//       } else {
        
//         await Addfollower(vendorId)

//         // Update UI state immediately for better user experience
//         setFollowedCreators((prev) => ({
//           ...prev,
//           [vendorId]: true,
//         }))

//         // Add to followed list if not already there
//         const vendorToAdd = allVendors.find((v) => v.id === vendorId)
//         if (
//           vendorToAdd &&
//           !customerVendors.some((c) => c.vendor?.id === vendorId)
//         ) {
//           const newCreator = {
//             id: `temp-${Date.now()}`, // Temporary ID until we refresh
//             vendor: vendorToAdd,
//           }

//           setCustomerVendors((prev) => [...prev, newCreator])

//           // Update filtered vendors if it matches current filters
//           if (matchesCurrentFilters(vendorToAdd)) {
//             setFilteredVendors((prev) => [...prev, newCreator])
//           }
//         }
//       }

//       // Refresh follower counts with a slight delay
//       setTimeout(async () => {
//         try {
//           // Update follower count for this specific vendor
//           const updatedFollowers = await retriveVendorsFollowers(vendorId)
//           if (updatedFollowers && updatedFollowers.follow) {
//             // Update follower counts based on the response
//             const count = Array.isArray(updatedFollowers.follow)
//               ? updatedFollowers.follow.filter((f) => f && f.follow).length
//               : updatedFollowers.follow
//               ? 1
//               : 0

//             setFollowerCounts((prev) => ({
//               ...prev,
//               [vendorId]: count,
//             }))
//           }

//           // Also refresh the user's followed creators list
//           const updatedFollowerList = await followerList()
//           if (updatedFollowerList && updatedFollowerList.follow?.creators) {
//             const newList = updatedFollowerList.follow.creators || []
//             setCustomerVendors(newList)

//             // Apply current filters to the updated list
//             const filtered = newList.filter(
//               (creator) =>
//                 creator.vendor && matchesCurrentFilters(creator.vendor)
//             )
//             setFilteredVendors(filtered)

//             // Update follow status for all creators
//             const followStatus = { ...followedCreators }
//             if (Array.isArray(allVendors)) {
//               allVendors.forEach((creator) => {
//                 if (creator && creator.id) {
//                   const isFollowed = newList.some(
//                     (followed) =>
//                       followed.vendor && followed.vendor.id === creator.id
//                   )
//                   followStatus[creator.id] = isFollowed
//                 }
//               })
//               setFollowedCreators(followStatus)
//             }
//           }
//         } catch (error) {
          
//         }
//       }, 1000)
//     } catch (error) {
      
//       toast.error("Failed to update follow status")
//     } finally {
//       // Clear loading state
//       setIsLoadingFollow((prev) => ({ ...prev, [vendorId]: false }))
//     }
//   }

//   const risingCreators: RisingCreator[] = [
//     {
//       id: "rising-1",
//       name: "Nova Sounds",
//       handle: "@novasounds",
//       avatar: avatarImage,
//       category: "Music",
//       followers: "245K",
//       growth: "+127% this month",
//       description: "Ambient music composer creating immersive soundscapes.",
//       bannerImage: CoverImage,
//     },
//     {
//       id: "rising-2",
//       name: "Sketch Daily",
//       handle: "@sketchdaily",
//       avatar: avatarImage,
//       category: "Visual Art",
//       followers: "180K",
//       growth: "+94% this month",
//       description:
//         "Traditional artist sharing daily sketches and art tutorials.",
//       bannerImage: CoverImage,
//     },
//     {
//       id: "rising-3",
//       name: "Culinary Creations",
//       handle: "@culinarycreations",
//       avatar: avatarImage,
//       category: "Food",
//       followers: "320K",
//       growth: "+86% this month",
//       description:
//         "Chef and food stylist sharing unique recipes and kitchen essentials.",
//       bannerImage: CoverImage,
//     },
//     {
//       id: "rising-4",
//       name: "Street Flow",
//       handle: "@streetflow",
//       avatar: avatarImage,
//       category: "Fashion",
//       followers: "210K",
//       growth: "+78% this month",
//       description:
//         "Urban fashion designer with a focus on sustainable streetwear.",
//       bannerImage: CoverImage,
//     },
//   ]

//   const exclusiveCreators: ExclusiveCreator[] = [
//     {
//       id: "exclusive-1",
//       name: "Melody Craft",
//       handle: "@melodycraft",
//       avatar: avatarImage,
//       category: "Music",
//       followers: "1.7M",
//       description:
//         "Singer-songwriter with Junooni-exclusive merchandise and limited vinyl releases.",
//       bannerImage: CoverImage,
//     },
//     {
//       id: "exclusive-2",
//       name: "Digital Dreams",
//       handle: "@digitaldreams",
//       avatar: avatarImage,
//       category: "Digital Art",
//       followers: "890K",
//       description:
//         "Digital artist creating exclusive NFT collections and limited prints.",
//       bannerImage: CoverImage,
//     },
//     {
//       id: "exclusive-3",
//       name: "Thread Master",
//       handle: "@threadmaster",
//       avatar: avatarImage,
//       category: "Fashion",
//       followers: "1.2M",
//       description:
//         "Clothing designer with platform-exclusive collections and custom pieces.",
//       bannerImage: CoverImage,
//     },
//     {
//       id: "exclusive-4",
//       name: "Beat Sculptor",
//       handle: "@beatsculptor",
//       avatar: avatarImage,
//       category: "Music Production",
//       followers: "950K",
//       description:
//         "Music producer offering exclusive sample packs and production tutorials.",
//       bannerImage: CoverImage,
//     },
//   ]

//   // Skeleton loader for creator cards
//   const SkeletonCard = () => (
//     <div className="overflow-hidden transition bg-white border border-gray-200 rounded-lg shadow-sm">
//       {/* Banner skeleton */}
//       <div className="h-32 bg-gray-200 animate-pulse"></div>

//       <div className="p-4">
//         {/* Profile picture and name skeleton */}
//         <div className="flex items-center">
//           <div className="w-12 h-12 mr-3 bg-gray-300 rounded-full animate-pulse"></div>
//           <div className="flex-1">
//             <div className="w-24 h-4 mb-2 bg-gray-300 rounded animate-pulse"></div>
//             <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
//           </div>
//         </div>

//         {/* Bio skeleton */}
//         <div className="mt-3 mb-3">
//           <div className="w-full h-3 mb-2 bg-gray-200 rounded animate-pulse"></div>
//           <div className="w-2/3 h-3 bg-gray-200 rounded animate-pulse"></div>
//         </div>

//         {/* Popular product skeleton */}
//         <div className="mb-3">
//           <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse"></div>
//         </div>

//         {/* Button skeleton */}
//         <div className="w-full bg-gray-300 rounded-md h-9 animate-pulse"></div>
//       </div>
//     </div>
//   )

//   // Grid of skeleton loaders
//   const SkeletonGrid = () => (
//     <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
//       {[...Array(4)].map((_, index) => (
//         <SkeletonCard key={`skeleton-${index}`} />
//       ))}
//     </div>
//   )

//   // Updated Creator Card Component
//   const CreatorCard = ({ creator, vendor, isRecommended = false }) => {
//     // Handle both formats (standalone vendor or creator with vendor property)
//     const vendorData = vendor || (creator ? creator.vendor : null)
//     const vendorId = vendorData?.id

//     if (!vendorId) return null

//     const isFollowLoading = isLoadingFollow[vendorId] || false
//     const isFollowed = followedCreators[vendorId] || false
//     const followerCount = followerCounts[vendorId] || 0

//     return (
//       <div
//         key={vendorId}
//         className="overflow-hidden transition bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
//       >
//         <div className="relative h-32 bg-gray-200">
//           <div className="relative w-full h-full">
//             <Image
//               src={vendorData.coverphoto || CoverImage}
//               alt={`${vendorData.name} banner`}
//               className="object-cover"
//               fill={true}
//               sizes="(max-width: 768px) 100vw, 25vw"
//               priority={true}
//             />
//           </div>
//           {vendorData.creator_title && (
//             <div className="absolute px-2 py-1 text-xs text-white rounded-full top-3 right-3 bg-black/70 backdrop-blur-sm">
//               {vendorData.creator_title}
//             </div>
//           )}
//         </div>

//         <div className="p-4">
//           <div className="flex items-center">
//             <div className="relative w-12 h-12 mr-3 overflow-hidden rounded-full">
//               <Image
//                 src={vendorData.logo || avatarImage}
//                 alt={vendorData.name}
//                 className="object-cover"
//                 fill={true}
//                 sizes="48px"
//                 priority={true}
//               />
//             </div>

//             <div>
//               <div className="flex items-center">
//                 <Link href={`/creator/${vendorData.handle}`}>
//                   <h3 className="font-semibold">{vendorData.name}</h3>
//                 </Link>
//                 <span className="ml-1 text-[#e65100]">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="w-4 h-4"
//                     viewBox="0 0 20 20"
//                     fill="currentColor"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </span>
//               </div>
//               <div className="flex items-center text-xs text-gray-500">
//                 <span>{vendorData.creator_title || "Creator"}</span>
//                 <span className="mx-1">•</span>
//                 <span>
//                   {followerCount} follower{followerCount !== 1 ? "s" : ""}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <p className="mt-3 mb-3 text-sm text-gray-600 line-clamp-2">
//             {vendorData.creator_bio || "No bio available"}
//           </p>

//           <div className="mb-3 text-xs text-gray-600">
//             <span className="font-medium">Popular:</span>{" "}
//             {vendorData.popular_product || "Creator products"}
//           </div>

//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={() => handleFollowToggle(vendorId)}
//             disabled={isFollowLoading}
//             className={`w-full py-2 text-sm font-medium transition rounded-md ${
//               isFollowLoading
//                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                 : isFollowed
//                 ? "border border-[#e65100] text-[#e65100] hover:bg-[#e65100] hover:text-white"
//                 : "bg-[#e65100] text-white hover:bg-[#d84315]"
//             }`}
//           >
//             {isFollowLoading
//               ? "Processing..."
//               : isFollowed
//               ? "Following"
//               : "Follow"}
//           </motion.button>
//         </div>
//       </div>
//     )
//   }

//   // Handle following for sample creators
//   const handleSampleCreatorFollow = (creatorId) => {
//     toast.info("This is a sample creator. Follow functionality is simulated.")
//     // Simulate follow behavior for demo purposes
//   }

//   // Get followed categories for display
//   const getFollowedCategories = () => {
//     const categories = new Set<string>()
//     customerVendors.forEach((creator) => {
//       if (creator.vendor?.creator_title) {
//         categories.add(creator.vendor.creator_title)
//       }
//     })
//     return Array.from(categories)
//   }

//   return (
//     <div className="min-h-screen mt-16 bg-gray-50">
//       {/* Header with search and filter */}
//       <header className="sticky top-0 z-30 bg-white shadow">
//         <div className="container px-4 py-3 mx-auto">
//           <div className="flex items-center justify-between">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search creators..."
//                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#e65100] focus:border-transparent w-40 md:w-64"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
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
//               <h3 className="font-medium">Filter by Creator Type</h3>
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
//         {/* Followed Creators Section with loading state */}
//         <section className="mb-10">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold">Followed Creators</h2>
//             {!isLoading && customerVendors && customerVendors.length > 0 && (
//               <div className="flex items-center gap-2">
//                 <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">
//                   {filteredVendors.length} of {customerVendors.length}
//                 </span>

//                 <div className="relative group">
//                   <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 text-sm flex items-center">
//                     Sort
//                     <ChevronDown size={16} className="ml-1" />
//                   </button>
//                   <div className="absolute right-0 z-10 invisible w-40 py-1 mt-1 bg-white rounded-md shadow-lg group-hover:visible">
//                     <button className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100">
//                       Recently Active
//                     </button>
//                     <button className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100">
//                       Alphabetical (A-Z)
//                     </button>
//                     <button className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100">
//                       Favorites First
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Loading state */}
//           {isLoading ? (
//             <SkeletonGrid />
//           ) : customerVendors && customerVendors.length > 0 ? (
//             <>
//               {filteredVendors.length > 0 ? (
//                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
//                   {filteredVendors.map((creator) => (
//                     <CreatorCard key={creator.id} creator={creator} />
//                   ))}
//                 </div>
//               ) : (
//                 // No results after filtering
//                 <div className="p-8 text-center bg-white rounded-lg shadow-sm">
//                   <div className="mb-4 text-gray-400">
//                     <Search size={64} className="mx-auto" />
//                   </div>
//                   <h3 className="mb-2 text-xl font-medium">
//                     No creators match your filters
//                   </h3>
//                   <p className="mb-6 text-gray-600">
//                     Try adjusting your search terms or category filters to find
//                     the creators you're looking for.
//                   </p>
//                   <button
//                     onClick={() => {
//                       setActiveCategory("all")
//                       setSearchQuery("")
//                     }}
//                     className="px-4 py-2 text-white bg-[#e65100] rounded-md hover:bg-[#d84315] transition"
//                   >
//                     Clear All Filters
//                   </button>
//                 </div>
//               )}
//             </>
//           ) : (
//             // Empty state when no creators are followed
//             <div className="p-8 text-center bg-white rounded-lg shadow-sm">
//               <div className="mb-4 text-gray-400">
//                 <Users size={64} className="mx-auto" />
//               </div>
//               <h3 className="mb-2 text-xl font-medium">
//                 Not following any creators yet
//               </h3>
//               <p className="mb-6 text-gray-600">
//                 Follow your favorite creators to see their updates and new
//                 releases in one place.
//               </p>
//               <p className="text-sm text-gray-500">
//                 Discover creators from the recommendations below and follow them
//                 to get started.
//               </p>
//             </div>
//           )}
//         </section>

//         {/* Recommended Creators Section */}
//         <section className="mb-10">
//           <h2 className="mb-6 text-2xl font-bold">Recommended for You</h2>

//           {/* Because You Follow */}
//           <div className="mb-8">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <h3 className="flex items-center text-lg font-semibold">
//                   <Star size={18} className="text-[#e65100] mr-2" />
//                   Because You Follow
//                   {customerVendors.length > 0 && (
//                     <span className="ml-2 text-sm font-normal text-gray-500">
//                       ({getFollowedCategories().join(", ")})
//                     </span>
//                   )}
//                 </h3>
//                 {customerVendors.length > 0 && (
//                   <p className="mt-1 text-sm text-gray-600">
//                     More creators from the categories you follow
//                   </p>
//                 )}
//               </div>
//               <a
//                 href="#"
//                 className="text-sm text-[#e65100] hover:underline flex items-center"
//               >
//                 View All
//                 <ChevronRight size={16} className="ml-1" />
//               </a>
//             </div>

//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
//               {recommendedCreators.length > 0 ? (
//                 recommendedCreators
//                   .slice(0, 4)
//                   .map((vendor) => (
//                     <CreatorCard key={vendor.id} vendor={vendor} isRecommended={true} />
//                   ))
//               ) : customerVendors.length === 0 ? (
//                 <div className="col-span-4 p-6 text-center bg-white rounded-lg shadow-sm">
//                   <div className="mb-4 text-gray-400">
//                     <Star size={48} className="mx-auto" />
//                   </div>
//                   <h3 className="mb-2 text-lg font-medium">
//                     Start following creators to get recommendations
//                   </h3>
//                   <p className="text-gray-600">
//                     Follow some creators above to see personalized recommendations here
//                   </p>
//                 </div>
//               ) : (
//                 <div className="col-span-4 p-4 text-center text-gray-500">
//                   <div className="mb-4 text-gray-400">
//                     <Search size={48} className="mx-auto" />
//                   </div>
//                   <p>No related creators found. Explore more creators to get better recommendations!</p>
//                 </div>
//               )}
//             </div>
//           </div>        
//         </section>
//       </main>
//     </div>
//   )
// }

// export default CreatorDiscoveryPage

"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Search,
  ArrowLeft,
  Heart,
  Bell,
  ChevronDown,
  ChevronRight,
  Star,
  TrendingUp,
  Users,
  Award,
  Music,
  Palette,
  Video,
  Camera,
  MessageCircle,
  X,
} from "lucide-react"
import { followerList } from "@lib/data/customer"
import { retriveVendorsFollowers, retriveVendors } from "@lib/data/vendors"
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
import { useRouter } from "next/navigation"

// Cookie utility functions
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

const setCookie = (name: string, value: string, days: number = 365) => {
  if (typeof document === 'undefined') return
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

// Cookie-based preference management
const getUserPreferences = () => {
  try {
    const prefs = getCookie('userPreferences')
    return prefs ? JSON.parse(decodeURIComponent(prefs)) : {
      likedCategories: [],
      viewedCreators: [],
      interactions: {}
    }
  } catch (error) {
    //console.error('Error parsing user preferences:', error)
    return {
      likedCategories: [],
      viewedCreators: [],
      interactions: {}
    }
  }
}

const saveUserPreferences = (preferences: any) => {
  try {
    setCookie('userPreferences', encodeURIComponent(JSON.stringify(preferences)))
  } catch (error) {
    //console.error('Error saving user preferences:', error)
  }
}

const trackCreatorInteraction = (creatorId: string, category: string, action: 'view' | 'follow' | 'like') => {
  const prefs = getUserPreferences()
  
  // Track category preference
  if (category && !prefs.likedCategories.includes(category)) {
    prefs.likedCategories.push(category)
  }
  
  // Track viewed creators
  if (!prefs.viewedCreators.includes(creatorId)) {
    prefs.viewedCreators.push(creatorId)
  }
  
  // Track interaction type
  if (!prefs.interactions[creatorId]) {
    prefs.interactions[creatorId] = []
  }
  if (!prefs.interactions[creatorId].includes(action)) {
    prefs.interactions[creatorId].push(action)
  }
  
  saveUserPreferences(prefs)
}

// Define interfaces for our data structures
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

interface AllVendor {
  id: string
  name: string
  handle: string
  logo?: string
  coverphoto?: string
  creator_title?: string
  creator_bio?: string
  popular_product?: string
}

interface Creator {
  id: string
  vendor: Vendor
}

interface FollowerResult {
  follow?: boolean | any[]
}

interface CustomerFollowers {
  follow?: {
    creators?: Creator[]
  }
}

interface Category {
  id: string
  name: string
  icon: React.ReactNode
}

const CreatorDiscoveryPage = () => {
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false)
  const [customerVendors, setCustomerVendors] = useState<Creator[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Creator[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", name: "All Categories", icon: <Users size={18} /> },
  ])
  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>(
    {}
  )
  const [allVendors, setAllVendors] = useState<AllVendor[]>([])
  const [recommendedCreators, setRecommendedCreators] = useState<AllVendor[]>([])

  // State for follow/unfollow functionality
  const [currentCustomer, setCurrentCustomer] = useState(null)
  const [isLoadingFollow, setIsLoadingFollow] = useState<
    Record<string, boolean>
  >({})
  const [followedCreators, setFollowedCreators] = useState<
    Record<string, boolean>
  >({})
  const [userPreferences, setUserPreferences] = useState(getUserPreferences())
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const avatarImage = assets.rabit
  const CoverImage = assets.wishlistBanner
  const router = useRouter()
  const showSuccessToast = (message: string) => {
  toast.success(message, {
    style: {
      background: '#e65100',
      color: '#fff',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#e65100',
    },
  })
}

  // Helper function to safely get string value from potentially nested data
  const safeString = (value: any, fallback: string = ""): string => {
    if (value === null || value === undefined) return fallback
    if (typeof value === "string") return value
    if (typeof value === "number") return String(value)
    if (typeof value === "object") {
      // If it's an object, try to extract a meaningful string
      if (value.name) return String(value.name)
      if (value.title) return String(value.title)
      if (value.value) return String(value.value)
      return fallback
    }
    return String(value)
  }

  // Helper to safely get number
  const safeNumber = (value: any, fallback: number = 0): number => {
    if (value === null || value === undefined) return fallback
    const num = typeof value === "number" ? value : Number(value)
    return isNaN(num) ? fallback : num
  }

  // Helper function to check if a vendor matches current filters
  const matchesCurrentFilters = (vendor: any) => {
    const vendorName = safeString(vendor.name).toLowerCase()
    const searchLower = searchQuery.toLowerCase()
    
    const matchesSearch =
      searchQuery === "" ||
      vendorName.includes(searchLower)

    const vendorCategory = safeString(vendor.creator_title).toLowerCase()
    const matchesCategory =
      activeCategory === "all" ||
      vendorCategory === activeCategory.toLowerCase()

    return matchesSearch && matchesCategory
  }

  // Function to refetch followed creators
  const refetchFollowedCreators = useCallback(async () => {
    if (!currentCustomer) return
    
    try {
      //console.log("Refetching followed creators...")
      const result = await retriveVendorsFollowers()
      
      let creators: Creator[] = []
      
      // Enhanced parsing to handle various API response structures
      if (result) {
        //console.log("Refetch - Raw API result:", JSON.stringify(result, null, 2))
        
        if (typeof result === 'object' && 'follow' in result) {
          const followerResult = result as CustomerFollowers
          
          if (followerResult.follow?.creators && Array.isArray(followerResult.follow.creators)) {
            creators = followerResult.follow.creators
          } else if (Array.isArray(followerResult.follow)) {
            creators = followerResult.follow.map((item: any) => ({
              id: item.vendor?.id || item.id,
              vendor: item.vendor || item
            }))
          }
        } else if (Array.isArray(result)) {
          creators = result.map((item: any) => ({
            id: item.vendor?.id || item.id,
            vendor: item.vendor || item
          }))
        }
      }
      
      //console.log("Refetch - Parsed creators:", creators)
      setCustomerVendors(creators)
      setFilteredVendors(creators)
      
      // Update followed creators map
      const followedMap: Record<string, boolean> = {}
      creators.forEach((creator) => {
        if (creator.vendor?.id) {
          followedMap[creator.vendor.id] = true
        }
      })
      setFollowedCreators(followedMap)
      //console.log("Refetch - Updated followed map:", followedMap)
    } catch (error) {
      //console.error("Error refetching followed creators:", error)
    }
  }, [currentCustomer])

  // Function to get related creators based on followed creators AND cookie preferences
  const getRelatedCreators = (followedCreators: Creator[], allVendors: AllVendor[], preferences: any) => {
    if (allVendors.length === 0) return []
    
    const followedCreatorIds = new Set<string>()
    const followedCategories = new Set<string>()

    // Get followed creator IDs and categories from actual follows
    followedCreators.forEach((creator) => {
      if (creator.vendor?.id) {
        followedCreatorIds.add(creator.vendor.id)
      }
      const creatorTitle = safeString(creator.vendor?.creator_title).toLowerCase()
      if (creatorTitle) {
        followedCategories.add(creatorTitle)
      }
    })

    // Add categories from cookie preferences
    if (preferences?.likedCategories) {
      preferences.likedCategories.forEach((cat: string) => {
        const catStr = safeString(cat).toLowerCase()
        if (catStr) {
          followedCategories.add(catStr)
        }
      })
    }

    // Score-based recommendation system
    const scoredVendors = allVendors
      .filter((vendor) => !followedCreatorIds.has(vendor.id))
      .map((vendor) => {
        let score = 0
        
        const vendorCategory = safeString(vendor.creator_title).toLowerCase()
        
        // Higher score for matching category preferences
        if (vendorCategory && followedCategories.has(vendorCategory)) {
          score += 10
        }
        
        // Bonus for previously viewed creators (shows interest)
        if (preferences?.viewedCreators?.includes(vendor.id)) {
          score += 5
        }
        
        // Bonus for creators with interactions
        if (preferences?.interactions?.[vendor.id]) {
          score += preferences.interactions[vendor.id].length * 3
        }
        
        return { vendor, score }
      })
      .sort((a, b) => b.score - a.score)
      .map(({ vendor }) => vendor)

    // If no scored recommendations, return a diverse mix
    if (scoredVendors.length === 0) {
      return allVendors.filter((v) => !followedCreatorIds.has(v.id)).slice(0, 8)
    }

    return scoredVendors.slice(0, 8)
  }

  // Get followed categories for display
  const getFollowedCategories = () => {
    const categories = new Set<string>()
    
    // From actual follows
    customerVendors.forEach((creator) => {
      const title = safeString(creator.vendor?.creator_title)
      if (title) {
        categories.add(title)
      }
    })
    
    // From cookie preferences
    if (userPreferences?.likedCategories) {
      userPreferences.likedCategories.forEach((cat: string) => {
        const title = safeString(cat)
        if (title) {
          categories.add(title)
        }
      })
    }
    
    return Array.from(categories)
  }

  // Update recommended creators when data changes
  useEffect(() => {
    if (allVendors.length > 0) {
      const related = getRelatedCreators(customerVendors, allVendors, userPreferences)
      setRecommendedCreators(related)
    }
  }, [customerVendors, allVendors, userPreferences])

  // Fetch customer data (optional - works for non-logged-in users)
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const customer = await retrieveCustomer()
        //console.log("Customer fetched:", customer)
        setCurrentCustomer(customer)
      } catch (error) {
        //console.log('User not logged in, using cookie-based preferences')
        setCurrentCustomer(null)
      }
    }

    fetchCustomer()
  }, [])

  // Fetch ALL vendors (always load, regardless of login status)
  useEffect(() => {
    const fetchAllVendors = async () => {
      try {
        const vendors = await retriveVendors()
        //console.log("All vendors fetched:", vendors?.length || 0)
        if (vendors && Array.isArray(vendors)) {
          setAllVendors(vendors)
          
          // Extract unique categories from vendors - using safe string helper
          const uniqueCategories = new Set<string>()
          vendors.forEach((vendor) => {
            const title = safeString(vendor.creator_title)
            if (title) {
              uniqueCategories.add(title)
            }
          })

          const categoryList = [
            { id: "all", name: "All Categories", icon: <Users size={18} /> },
            ...Array.from(uniqueCategories).map((cat) => ({
              id: cat.toLowerCase(),
              name: cat,
              icon: getCategoryIcon(cat),
            })),
          ]
          setCategories(categoryList)
        }
      } catch (error) {
        //console.error("Error fetching vendors:", error)
        toast.error("Failed to load creators")
      }
    }

    fetchAllVendors()
  }, [])

  // ADD THE NEW USEEFFECT HERE - RIGHT AFTER THE ABOVE ONE
// useEffect(() => {
//   const fetchAllFollowerCounts = async () => {
//     if (allVendors.length > 0) {
//       const countsPromises = allVendors.map(async (vendor) => {
//         const count = await retriveVendorsFollowers(vendor.id || "")
//         return { id: vendor.id || "", count: count || 0 }
//       })

//       const counts = await Promise.all(countsPromises)
//       const countsMap = counts.reduce(
//         (acc, { id, count }) => {
//           acc[id] = count
//           return acc
//         },
//         {} as Record<string, number>
//       )
//       setFollowerCounts(prev => ({ ...prev, ...countsMap }))
//     }
//   }

//   fetchAllFollowerCounts()
// }, [allVendors])

  // Fetch customer vendors data (only if logged in)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        if (currentCustomer) {
          // User is logged in - fetch their follows
          //const result = await retriveVendorsFollowers()
          const result = await followerList()
          
          
          let creators: Creator[] = []
          
          // Enhanced parsing to handle various API response structures
          if (result) {
            //console.log("Raw API result:", JSON.stringify(result, null, 2))
            
            // Try multiple possible response structures
            if (typeof result === 'object' && 'follow' in result) {
              const followerResult = result as CustomerFollowers
              
              // Pattern 1: follow.creators array
              if (followerResult.follow?.creators && Array.isArray(followerResult.follow.creators)) {
                creators = followerResult.follow.creators
                //console.log("Pattern 1: Found creators in follow.creators")
              }
              // Pattern 2: follow is directly an array
              else if (Array.isArray(followerResult.follow)) {
                creators = followerResult.follow.map((item: any) => ({
                  id: item.vendor?.id || item.id,
                  vendor: item.vendor || item
                }))
                //console.log("Pattern 2: Found creators in follow array")
              }
              // Pattern 3: follow is an object with vendor data
              else if (followerResult.follow && typeof followerResult.follow === 'object') {
                // Check if follow has vendor properties directly
                const followObj = followerResult.follow as any
                if (followObj.vendor || followObj.id) {
                  creators = [{
                    id: followObj.vendor?.id || followObj.id,
                    vendor: followObj.vendor || followObj
                  }]
                  //console.log("Pattern 3: Found single creator in follow object")
                }
              }
            }
            // Pattern 4: result is directly an array of creators
            else if (Array.isArray(result)) {
              creators = result.map((item: any) => ({
                id: item.vendor?.id || item.id,
                vendor: item.vendor || item
              }))
              //console.log("Pattern 4: Found creators in direct array")
            }
          }
          
          //console.log("Final parsed creators:", creators)
          //console.log("Number of creators found:", creators.length)

          setCustomerVendors(creators)
          setFilteredVendors(creators)

          // Initialize followed creators map
          const followedMap: Record<string, boolean> = {}
          creators.forEach((creator) => {
            if (creator.vendor?.id) {
              followedMap[creator.vendor.id] = true
            }
          })
          setFollowedCreators(followedMap)
          //console.log("Followed creators map:", followedMap)

          // Sync with cookies
          creators.forEach((creator) => {
            if (creator.vendor?.id && creator.vendor?.creator_title) {
              trackCreatorInteraction(creator.vendor.id, creator.vendor.creator_title, 'follow')
            }
          })

          // Fetch follower counts using the newly fetched creators (not old state)
          if (creators.length > 0) {
            const countsPromises = creators.map(async (creator) => {
              const count = await retriveVendorsFollowers(creator.vendor?.id || "")
              return { id: creator.vendor?.id || "", count: count || 0 }
            })

            const counts = await Promise.all(countsPromises)
            const countsMap = counts.reduce(
              (acc, { id, count }) => {
                acc[id] = count
                return acc
              },
              {} as Record<string, number>
            )
            setFollowerCounts(countsMap)
          }
        } else {
          // User not logged in - show no followed creators but still show recommendations
          setCustomerVendors([])
          setFilteredVendors([])
          setFollowedCreators({})
        }
      } catch (error) {
        //console.error("Error fetching followed creators:", error)
        // Log the full error for debugging
        //console.error("Full error details:", JSON.stringify(error, null, 2))
        toast.error("Failed to load your followed creators")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentCustomer, refetchTrigger])

  // Filter vendors based on search and category
  useEffect(() => {
    if (customerVendors && customerVendors.length > 0) {
      const filtered = customerVendors.filter((creator) =>
        matchesCurrentFilters(creator.vendor)
      )
      setFilteredVendors(filtered)
    }
  }, [searchQuery, activeCategory, customerVendors])

  // Get category icon based on category name
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    if (name.includes("music")) return <Music size={18} />
    if (name.includes("art") || name.includes("design"))
      return <Palette size={18} />
    if (name.includes("video") || name.includes("film"))
      return <Video size={18} />
    if (name.includes("photo")) return <Camera size={18} />
    return <Award size={18} />
  }

  // Handle follow/unfollow with cookie tracking
  const handleFollowToggle = async (vendorId: string, category: string) => {
    // Track interaction in cookies regardless of login status
    trackCreatorInteraction(vendorId, category, followedCreators[vendorId] ? 'view' : 'follow')
    
    if (!currentCustomer) {
      toast.info("Please log in to follow creators")
      return
    }

    setIsLoadingFollow((prev) => ({ ...prev, [vendorId]: true }))

    try {
      if (followedCreators[vendorId]) {
        // Unfollow
        //console.log("Unfollowing vendor:", vendorId)
        await deletefollower(vendorId)
        
        // Update local state immediately
        setFollowedCreators((prev) => ({ ...prev, [vendorId]: false }))
        
        // Remove from customer vendors
        setCustomerVendors((prev) =>
          prev.filter((creator) => creator.vendor?.id !== vendorId)
        )
        
        toast.success("Unfollowed successfully")
      } else {
        // Follow
        //console.log("Following vendor:", vendorId)
        await Addfollower(vendorId)
        
        // Update local state immediately
        setFollowedCreators((prev) => ({ ...prev, [vendorId]: true }))
        
        // Add to customer vendors
        const vendor = allVendors.find((v) => v.id === vendorId)
        if (vendor) {
          const newCreator = { id: vendorId, vendor }
          setCustomerVendors((prev) => [...prev, newCreator])
        }
        
        toast.success("Followed successfully")
        //showSuccessToast("Followed successfully")
      }
      
      // Refresh preferences
      setUserPreferences(getUserPreferences())
      
      // Trigger a refetch to ensure data consistency
      setTimeout(() => {
        setRefetchTrigger(prev => prev + 1)
      }, 500)
    } catch (error) {
      //console.error("Error toggling follow:", error)
      toast.error("Failed to update follow status")
      
      // Revert the optimistic update on error
      if (followedCreators[vendorId]) {
        setFollowedCreators((prev) => ({ ...prev, [vendorId]: true }))
      } else {
        setFollowedCreators((prev) => ({ ...prev, [vendorId]: false }))
      }
    } finally {
      setIsLoadingFollow((prev) => ({ ...prev, [vendorId]: false }))
    }
  }

  // Track creator view
  const handleCreatorView = (creatorId: string, category: string) => {
    trackCreatorInteraction(creatorId, category, 'view')
    setUserPreferences(getUserPreferences())
  }

  // Skeleton loading component
  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="overflow-hidden bg-white rounded-lg shadow-sm">
          <div className="w-full h-32 bg-gray-200 animate-pulse" />
          <div className="p-4">
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-full -mt-11 animate-pulse" />
            <div className="w-3/4 h-4 mx-auto mb-2 bg-gray-200 rounded animate-pulse" />
            <div className="w-1/2 h-3 mx-auto mb-3 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )

  // Creator Card Component for followed creators
  const CreatorCard = ({ creator }: { creator: Creator }) => {
    const vendor = creator.vendor
    const isFollowed = followedCreators[vendor.id] || false

    return (
      <Link
        href={`/creator/${safeString(vendor.handle) || vendor.id}`}
        onClick={() => handleCreatorView(vendor.id, safeString(vendor.creator_title))}
      >
        <motion.div
          className="flex flex-col h-full overflow-hidden transition-all duration-300 bg-white rounded-lg shadow-sm hover:shadow-md"
          whileHover={{ y: -4 }}
        >
          {/* Banner Image */}
          <div className="relative h-32 bg-gradient-to-r from-[#e65100] to-[#ff6d00] flex-shrink-0 overflow-hidden">
            {vendor.coverphoto ? (
              <img
                src={safeString(vendor.coverphoto)}
                alt={`${safeString(vendor.name)} banner`}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Users size={48} className="text-white opacity-50" />
              </div>
            )}
          </div>

          {/* Profile Content */}
          <div className="flex flex-col flex-grow p-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0 w-16 h-16 mx-auto mb-3 -mt-11">
              <div className="w-full h-full overflow-hidden bg-white border-4 border-white rounded-full">
                {vendor.logo ? (
                  <img
                    src={safeString(vendor.logo)}
                    alt={safeString(vendor.name)}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200">
                    <Users size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Creator Info - Fixed Height Container */}
            <div className="flex flex-col flex-grow">
              <h3 className="mb-1 text-lg font-semibold text-center line-clamp-1">
                {safeString(vendor.name, "Creator")}
              </h3>
              <p className="mb-1 text-sm text-center text-gray-600 truncate">
                @{safeString(vendor.handle) || vendor.id}
              </p>
              <div className="flex items-center justify-center h-5 mb-3">
                {vendor.creator_title && (
                  <p className="text-xs text-center text-[#e65100] truncate">
                    {safeString(vendor.creator_title)}
                  </p>
                )}
              </div>

              {/* Description - Fixed Height */}
              <div className="flex items-start justify-center h-10 mb-3">
                {vendor.creator_bio && (
                  <p className="text-sm text-center text-gray-600 line-clamp-2">
                    {safeString(vendor.creator_bio)}
                  </p>
                )}
              </div>

              {/* Stats - Fixed Height */}
              {/* <div className="flex items-center justify-center h-6 gap-4 mb-3 text-sm">
                <div className="flex items-center gap-1">
                  <Users size={14} className="flex-shrink-0 text-gray-400" />
                  <span>{safeNumber(followerCounts[vendor.id], 0)}</span>
                </div>
                {vendor.popular_product && (
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-[#e65100] flex-shrink-0" />
                    <span className="text-xs text-gray-500 truncate max-w-[100px]">
                      {safeString(vendor.popular_product)}
                    </span>
                  </div>
                )}
              </div> */}
            </div>

            {/* Follow Button - Fixed at Bottom */}
            <button
              onClick={(e) => {
                e.preventDefault()
                handleFollowToggle(vendor.id, safeString(vendor.creator_title))
              }}
              disabled={isLoadingFollow[vendor.id]}
              className={`w-full py-2 text-sm font-medium rounded-md transition flex-shrink-0 ${
                isFollowed
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-[#e65100] text-white hover:bg-[#d84315]"
              } ${isLoadingFollow[vendor.id] ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoadingFollow[vendor.id]
                ? "Loading..."
                : isFollowed
                  ? "Following"
                  : "Follow"}
            </button>
          </div>
        </motion.div>
      </Link>
    )
  }

  // Recommended Creator Card Component (for vendors from allVendors)
  const RecommendedCreatorCard = ({ vendor, isRecommended = false }: { vendor: AllVendor; isRecommended?: boolean }) => {
    const isFollowed = followedCreators[vendor.id] || false

    return (
      <Link
        href={`/creator/${safeString(vendor.handle) || vendor.id}`}
        onClick={() => handleCreatorView(vendor.id, safeString(vendor.creator_title))}
      >
        <motion.div
          className="flex flex-col h-full overflow-hidden transition-all duration-300 bg-white rounded-lg shadow-sm hover:shadow-md"
          whileHover={{ y: -4 }}
        >
          {/* Banner Image */}
          <div className="relative h-32 bg-gradient-to-r from-[#e65100] to-[#ff6d00] flex-shrink-0 overflow-hidden">
            {vendor.coverphoto ? (
              <img
                src={safeString(vendor.coverphoto)}
                alt={`${safeString(vendor.name)} banner`}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Users size={48} className="text-white opacity-50" />
              </div>
            )}
            {isRecommended && (
              <div className="absolute top-2 right-2">
                <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-[#e65100] flex items-center gap-1">
                  <Star size={12} fill="#e65100" />
                  Recommended
                </div>
              </div>
            )}
          </div>

          {/* Profile Content */}
          <div className="flex flex-col flex-grow p-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0 w-16 h-16 mx-auto mb-3 -mt-11">
              <div className="w-full h-full overflow-hidden bg-white border-4 border-white rounded-full">
                {vendor.logo ? (
                  <img
                    src={safeString(vendor.logo)}
                    alt={safeString(vendor.name)}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200">
                    <Users size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Creator Info - Fixed Height Container */}
            <div className="flex flex-col flex-grow">
              <h3 className="mb-1 text-lg font-semibold text-center line-clamp-1">
                {safeString(vendor.name, "Creator")}
              </h3>
              <p className="mb-1 text-sm text-center text-gray-600 truncate">
                @{safeString(vendor.handle) || vendor.id}
              </p>
              <div className="flex items-center justify-center h-5 mb-3">
                {vendor.creator_title && (
                  <p className="text-xs text-center text-[#e65100] truncate">
                    {safeString(vendor.creator_title)}
                  </p>
                )}
              </div>

              {/* Description - Fixed Height */}
              <div className="flex items-start justify-center h-10 mb-3">
                {vendor.creator_bio && (
                  <p className="text-sm text-center text-gray-600 line-clamp-2">
                    {safeString(vendor.creator_bio)}
                  </p>
                )}
              </div>

              {/* Popular Product - Fixed Height */}
              <div className="flex items-center justify-center h-6 mb-3">
                {vendor.popular_product && (
                  <div className="flex items-center justify-center gap-1">
                    <Star size={14} className="text-[#e65100] flex-shrink-0" />
                    <span className="text-xs text-gray-500 truncate max-w-[180px]">
                      {safeString(vendor.popular_product)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Follow Button - Fixed at Bottom */}
            <button
              onClick={(e) => {
                e.preventDefault()
                handleFollowToggle(vendor.id, safeString(vendor.creator_title))
              }}
              disabled={isLoadingFollow[vendor.id]}
              className={`w-full py-2 text-sm font-medium rounded-md transition flex-shrink-0 ${
                isFollowed
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-[#e65100] text-white hover:bg-[#d84315]"
              } ${isLoadingFollow[vendor.id] ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoadingFollow[vendor.id]
                ? "Loading..."
                : isFollowed
                  ? "Following"
                  : "Follow"}
            </button>
          </div>
        </motion.div>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 mt-16 bg-white border-b shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <button
                onClick={() => router.back()}
                className="p-2 transition-colors rounded-full hover:bg-gray-100"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-gray-700" />
              </button>
              
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search creators..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#e65100] focus:border-transparent w-40 md:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Filters panel - conditionally shown */}
      {isFiltersOpen && (
        <div className="bg-white border-t border-b shadow-sm">
          <div className="container px-4 py-4 mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Filter by Creator Type</h3>
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

      <main className="container px-4 py-6 mx-auto">
        {/* Followed Creators Section - Only show if user is logged in */}
        {currentCustomer && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Followed Creators</h2>
              {!isLoading && customerVendors && customerVendors.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">
                    {filteredVendors.length} of {customerVendors.length}
                  </span>
                </div>
              )}
            </div>

            {/* Loading state */}
            {isLoading ? (
              <SkeletonGrid />
            ) : customerVendors && customerVendors.length > 0 ? (
              <>
                {filteredVendors.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {filteredVendors.map((creator) => (
                      <CreatorCard key={creator.id} creator={creator} />
                    ))}
                  </div>
                ) : (
                  // No results after filtering
                  <div className="p-8 text-center bg-white rounded-lg shadow-sm">
                    <div className="mb-4 text-gray-400">
                      <Search size={64} className="mx-auto" />
                    </div>
                    <h3 className="mb-2 text-xl font-medium">
                      No creators match your filters
                    </h3>
                    <p className="mb-6 text-gray-600">
                      Try adjusting your search terms or category filters to find
                      the creators you're looking for.
                    </p>
                    <button
                      onClick={() => {
                        setActiveCategory("all")
                        setSearchQuery("")
                      }}
                      className="px-4 py-2 text-white bg-[#e65100] rounded-md hover:bg-[#d84315] transition"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Empty state when no creators are followed
              <div className="p-8 text-center bg-white rounded-lg shadow-sm">
                <div className="mb-4 text-gray-400">
                  <Users size={64} className="mx-auto" />
                </div>
                <h3 className="mb-2 text-xl font-medium">
                  Not following any creators yet
                </h3>
                <p className="mb-6 text-gray-600">
                  Follow your favorite creators to see their updates and new
                  releases in one place.
                </p>
                <p className="text-sm text-gray-500">
                  Discover creators from the recommendations below and follow them
                  to get started.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Recommended Creators Section - Always visible */}
        <section className="mb-10">
          <h2 className="mb-6 text-2xl font-bold">
            {currentCustomer ? "Recommended for You" : "Discover Creators"}
          </h2>

          {/* Personalized Recommendations */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="flex items-center text-lg font-semibold">
                  <Star size={18} className="text-[#e65100] mr-2" />
                  {currentCustomer && getFollowedCategories().length > 0 ? (
                    <>
                      Because You Like
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({getFollowedCategories().join(", ")})
                      </span>
                    </>
                  ) : (
                    "Featured Creators"
                  )}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {currentCustomer && customerVendors.length > 0
                    ? "More creators from categories you enjoy"
                    : "Explore talented creators across various categories"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {recommendedCreators.length > 0 ? (
                recommendedCreators
                  .slice(0, 8)
                  .map((vendor) => (
                    <RecommendedCreatorCard key={vendor.id} vendor={vendor} isRecommended={true} />
                  ))
              ) : isLoading ? (
                <SkeletonGrid />
              ) : (
                <div className="col-span-4 p-6 text-center bg-white rounded-lg shadow-sm">
                  <div className="mb-4 text-gray-400">
                    <Star size={48} className="mx-auto" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">
                    {currentCustomer 
                      ? "Start following creators to get recommendations"
                      : "No creators available at the moment"}
                  </h3>
                  <p className="text-gray-600">
                    {currentCustomer
                      ? "Follow some creators to see personalized recommendations"
                      : "Check back soon for exciting creator content"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* All Creators Section */}
          {allVendors.length > 8 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">More Creators to Explore</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {allVendors
                  .filter(v => !recommendedCreators.some(rc => rc.id === v.id))
                  .filter(v => {
                    const vCategory = safeString(v.creator_title).toLowerCase()
                    return activeCategory === 'all' || vCategory === activeCategory
                  })
                  .filter(v => {
                    const vName = safeString(v.name).toLowerCase()
                    const search = searchQuery.toLowerCase()
                    return searchQuery === '' || vName.includes(search)
                  })
                  .slice(0, 8)
                  .map((vendor) => (
                    <RecommendedCreatorCard key={vendor.id} vendor={vendor} />
                  ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default CreatorDiscoveryPage