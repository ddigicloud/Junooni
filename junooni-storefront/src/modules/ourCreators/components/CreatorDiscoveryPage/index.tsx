"use client"

import React, { useState, useEffect } from "react"
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

interface TrendingCreator {
  id: string
  name: string
  handle: string
  avatar: string
  category: string
  followers: string
  isVerified: boolean
  description: string
  popularProduct: string
  bannerImage: string
  match: number
}

interface RisingCreator {
  id: string
  name: string
  handle: string
  avatar: string
  category: string
  followers: string
  growth: string
  description: string
  bannerImage: string
}

interface ExclusiveCreator {
  id: string
  name: string
  handle: string
  avatar: string
  category: string
  followers: string
  description: string
  bannerImage: string
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
  const [allVendors, setAllVendors] = useState([])

  // State for follow/unfollow functionality
  const [currentCustomer, setCurrentCustomer] = useState(null)
  const [isLoadingFollow, setIsLoadingFollow] = useState<
    Record<string, boolean>
  >({})
  const [followedCreators, setFollowedCreators] = useState<
    Record<string, boolean>
  >({})

  const avatarImage = assets.rabit
  const CoverImage = assets.wishlistBanner

  // Helper function to check if a vendor matches current filters
  const matchesCurrentFilters = (vendor) => {
    const matchesSearch =
      searchQuery === "" ||
      vendor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false

    const matchesCategory =
      activeCategory === "all" ||
      (vendor.creator_title &&
        vendor.creator_title.toLowerCase() === activeCategory.toLowerCase())

    return matchesSearch && matchesCategory
  }

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const customer = await retrieveCustomer()
        
        setCurrentCustomer(customer)
      } catch (error) {
       
        setCurrentCustomer(null)
      }
    }

    fetchCustomer()
  }, [])

  // Fetch customer vendors data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const customerFollowers = (await followerList()) as CustomerFollowers
        const allCreators = await retriveVendors()
       

        const newList = customerFollowers.follow?.creators || []
        setCustomerVendors(newList)
        setFilteredVendors(newList)
        setAllVendors(allCreators)

        // Extract categories from the fetched data
        extractCategoriesFromCreators(newList, allCreators)

        // Fetch follower counts for each creator
        fetchFollowerCounts(newList, allCreators)

        // Initialize follow status for all vendors
        const followStatus = {}
        if (Array.isArray(allCreators)) {
          allCreators.forEach((creator) => {
            if (creator && creator.id) {
              // Check if this creator is in the followed list
              const isFollowed = newList.some(
                (followed) =>
                  followed.vendor && followed.vendor.id === creator.id
              )
              followStatus[creator.id] = isFollowed
            }
          })
        }

        setFollowedCreators(followStatus)
      } catch (error) {
        setCustomerVendors([])
        setFilteredVendors([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Initialize follow status when both customer and follower data are available
  useEffect(() => {
    if (
      currentCustomer &&
      customerVendors.length > 0 &&
      Array.isArray(allVendors)
    ) {
      const followStatus = {}

      // Initialize all vendors as not followed
      allVendors.forEach((vendor) => {
        if (vendor && vendor.id) {
          followStatus[vendor.id] = false
        }
      })

      // Then mark followed vendors based on customerVendors
      customerVendors.forEach((creator) => {
        if (creator.vendor && creator.vendor.id) {
          followStatus[creator.vendor.id] = true
        }
      })

      setFollowedCreators(followStatus)
    }
  }, [currentCustomer, customerVendors, allVendors])

  // Fetch follower counts for each creator
  const fetchFollowerCounts = async (creators: Creator[], vendors = []) => {
    const counts: Record<string, number> = {}

    try {
      // Process creators in parallel using Promise.all
      if (creators.length > 0) {
        await Promise.all(
          creators.map(async (creator) => {
            if (creator.vendor && creator.vendor.id) {
              const result = (await retriveVendorsFollowers(
                creator.vendor.id
              )) as FollowerResult

              // If there's data and it has a followers array or count
              if (result && result.follow) {
                if (Array.isArray(result.follow)) {
                  counts[creator.vendor.id] = result.follow.filter(
                    (f) => f && f.follow
                  ).length
                } else {
                  counts[creator.vendor.id] = result.follow ? 1 : 0
                }
              } else {
                counts[creator.vendor.id] = 0
              }
            }
          })
        )
      }

      // Also fetch counts for all vendors
      if (Array.isArray(vendors) && vendors.length > 0) {
        await Promise.all(
          vendors.map(async (vendor) => {
            if (vendor && vendor.id && !counts[vendor.id]) {
              const result = await retriveVendorsFollowers(vendor.id)
              if (result && result.follow) {
                if (Array.isArray(result.follow)) {
                  counts[vendor.id] = result.follow.filter(
                    (f) => f && f.follow
                  ).length
                } else {
                  counts[vendor.id] = result.follow ? 1 : 0
                }
              } else {
                counts[vendor.id] = 0
              }
            }
          })
        )
      }

      setFollowerCounts(counts)
    } catch (error) {
     
    }
  }

  // Extract unique categories from creators and set up the categories state
  const extractCategoriesFromCreators = (creators: Creator[], vendors = []) => {
    // Always include "all" category
    const categoryData: Category[] = [
      { id: "all", name: "All Categories", icon: <Users size={18} /> },
    ]

    // Create a Set to store unique category titles
    const uniqueCategoryTitles = new Set<string>()

    // Extract creator titles and add to the Set
    creators.forEach((creator) => {
      if (
        creator.vendor &&
        creator.vendor.creator_title &&
        creator.vendor.creator_title.trim()
      ) {
        uniqueCategoryTitles.add(creator.vendor.creator_title.trim())
      }
    })

    // Also check allVendors
    if (Array.isArray(vendors)) {
      vendors.forEach((vendor) => {
        if (vendor && vendor.creator_title && vendor.creator_title.trim()) {
          uniqueCategoryTitles.add(vendor.creator_title.trim())
        }
      })
    }

    // Map of common categories to icons
    const categoryIconMap: Record<string, React.ReactNode> = {
      music: <Music size={18} />,
      "visual art": <Palette size={18} />,
      video: <Video size={18} />,
      photography: <Camera size={18} />,
      writing: <MessageCircle size={18} />,
    }

    // Convert Set to array and map to category objects
    Array.from(uniqueCategoryTitles).forEach((title) => {
      const lowerTitle = title.toLowerCase()
      const icon = categoryIconMap[lowerTitle] || <Star size={18} />

      categoryData.push({
        id: lowerTitle,
        name: title,
        icon: icon,
      })
    })

    setCategories(categoryData)
  }

  // Update filtered vendors when search query or category changes
  useEffect(() => {
    if (!customerVendors) return

    const filtered = customerVendors.filter((creator) => {
      // Filter by name (search)
      const matchesSearch =
        searchQuery === "" ||
        (creator.vendor && creator.vendor.name
          ? creator.vendor.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          : false)

      // Filter by category
      const matchesCategory =
        activeCategory === "all" ||
        (creator.vendor && creator.vendor.creator_title
          ? creator.vendor.creator_title.toLowerCase() ===
            activeCategory.toLowerCase()
          : false)

      return matchesSearch && matchesCategory
    })

    setFilteredVendors(filtered)
  }, [searchQuery, activeCategory, customerVendors])

  // Improved follow/unfollow functionality
  const handleFollowToggle = async (vendorId) => {
    // Check if user is logged in
    if (!currentCustomer) {
      
      return toast.warning("Please log in to follow/unfollow.")
    }

    // Set loading state for this specific creator
    setIsLoadingFollow((prev) => ({ ...prev, [vendorId]: true }))

    try {
      // Check current following status and take appropriate action
      const isCurrentlyFollowing = followedCreators[vendorId]

      if (isCurrentlyFollowing) {
       
        await deletefollower(vendorId)

        // Update UI state immediately for better user experience
        setFollowedCreators((prev) => ({
          ...prev,
          [vendorId]: false,
        }))

        // Remove from followed list
        setCustomerVendors((prev) =>
          prev.filter((creator) => creator.vendor?.id !== vendorId)
        )
        setFilteredVendors((prev) =>
          prev.filter((creator) => creator.vendor?.id !== vendorId)
        )
      } else {
        
        await Addfollower(vendorId)

        // Update UI state immediately for better user experience
        setFollowedCreators((prev) => ({
          ...prev,
          [vendorId]: true,
        }))

        // Add to followed list if not already there
        const vendorToAdd = allVendors.find((v) => v.id === vendorId)
        if (
          vendorToAdd &&
          !customerVendors.some((c) => c.vendor?.id === vendorId)
        ) {
          const newCreator = {
            id: `temp-${Date.now()}`, // Temporary ID until we refresh
            vendor: vendorToAdd,
          }

          setCustomerVendors((prev) => [...prev, newCreator])

          // Update filtered vendors if it matches current filters
          if (matchesCurrentFilters(vendorToAdd)) {
            setFilteredVendors((prev) => [...prev, newCreator])
          }
        }
      }

      // Refresh follower counts with a slight delay
      setTimeout(async () => {
        try {
          // Update follower count for this specific vendor
          const updatedFollowers = await retriveVendorsFollowers(vendorId)
          if (updatedFollowers && updatedFollowers.follow) {
            // Update follower counts based on the response
            const count = Array.isArray(updatedFollowers.follow)
              ? updatedFollowers.follow.filter((f) => f && f.follow).length
              : updatedFollowers.follow
              ? 1
              : 0

            setFollowerCounts((prev) => ({
              ...prev,
              [vendorId]: count,
            }))
          }

          // Also refresh the user's followed creators list
          const updatedFollowerList = await followerList()
          if (updatedFollowerList && updatedFollowerList.follow?.creators) {
            const newList = updatedFollowerList.follow.creators || []
            setCustomerVendors(newList)

            // Apply current filters to the updated list
            const filtered = newList.filter(
              (creator) =>
                creator.vendor && matchesCurrentFilters(creator.vendor)
            )
            setFilteredVendors(filtered)

            // Update follow status for all creators
            const followStatus = { ...followedCreators }
            if (Array.isArray(allVendors)) {
              allVendors.forEach((creator) => {
                if (creator && creator.id) {
                  const isFollowed = newList.some(
                    (followed) =>
                      followed.vendor && followed.vendor.id === creator.id
                  )
                  followStatus[creator.id] = isFollowed
                }
              })
              setFollowedCreators(followStatus)
            }
          }
        } catch (error) {
          
        }
      }, 1000)
    } catch (error) {
      
      toast.error("Failed to update follow status")
    } finally {
      // Clear loading state
      setIsLoadingFollow((prev) => ({ ...prev, [vendorId]: false }))
    }
  }

  const risingCreators: RisingCreator[] = [
    {
      id: "rising-1",
      name: "Nova Sounds",
      handle: "@novasounds",
      avatar: avatarImage,
      category: "Music",
      followers: "245K",
      growth: "+127% this month",
      description: "Ambient music composer creating immersive soundscapes.",
      bannerImage: CoverImage,
    },
    {
      id: "rising-2",
      name: "Sketch Daily",
      handle: "@sketchdaily",
      avatar: avatarImage,
      category: "Visual Art",
      followers: "180K",
      growth: "+94% this month",
      description:
        "Traditional artist sharing daily sketches and art tutorials.",
      bannerImage: CoverImage,
    },
    {
      id: "rising-3",
      name: "Culinary Creations",
      handle: "@culinarycreations",
      avatar: avatarImage,
      category: "Food",
      followers: "320K",
      growth: "+86% this month",
      description:
        "Chef and food stylist sharing unique recipes and kitchen essentials.",
      bannerImage: CoverImage,
    },
    {
      id: "rising-4",
      name: "Street Flow",
      handle: "@streetflow",
      avatar: avatarImage,
      category: "Fashion",
      followers: "210K",
      growth: "+78% this month",
      description:
        "Urban fashion designer with a focus on sustainable streetwear.",
      bannerImage: CoverImage,
    },
  ]

  const exclusiveCreators: ExclusiveCreator[] = [
    {
      id: "exclusive-1",
      name: "Melody Craft",
      handle: "@melodycraft",
      avatar: avatarImage,
      category: "Music",
      followers: "1.7M",
      description:
        "Singer-songwriter with Junooni-exclusive merchandise and limited vinyl releases.",
      bannerImage: CoverImage,
    },
    {
      id: "exclusive-2",
      name: "Digital Dreams",
      handle: "@digitaldreams",
      avatar: avatarImage,
      category: "Digital Art",
      followers: "890K",
      description:
        "Digital artist creating exclusive NFT collections and limited prints.",
      bannerImage: CoverImage,
    },
    {
      id: "exclusive-3",
      name: "Thread Master",
      handle: "@threadmaster",
      avatar: avatarImage,
      category: "Fashion",
      followers: "1.2M",
      description:
        "Clothing designer with platform-exclusive collections and custom pieces.",
      bannerImage: CoverImage,
    },
    {
      id: "exclusive-4",
      name: "Beat Sculptor",
      handle: "@beatsculptor",
      avatar: avatarImage,
      category: "Music Production",
      followers: "950K",
      description:
        "Music producer offering exclusive sample packs and production tutorials.",
      bannerImage: CoverImage,
    },
  ]

  // Skeleton loader for creator cards
  const SkeletonCard = () => (
    <div className="overflow-hidden transition bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Banner skeleton */}
      <div className="h-32 bg-gray-200 animate-pulse"></div>

      <div className="p-4">
        {/* Profile picture and name skeleton */}
        <div className="flex items-center">
          <div className="w-12 h-12 mr-3 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="w-24 h-4 mb-2 bg-gray-300 rounded animate-pulse"></div>
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Bio skeleton */}
        <div className="mt-3 mb-3">
          <div className="w-full h-3 mb-2 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-2/3 h-3 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Popular product skeleton */}
        <div className="mb-3">
          <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Button skeleton */}
        <div className="w-full bg-gray-300 rounded-md h-9 animate-pulse"></div>
      </div>
    </div>
  )

  // Grid of skeleton loaders
  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <SkeletonCard key={`skeleton-${index}`} />
      ))}
    </div>
  )

  // Updated Creator Card Component
  const CreatorCard = ({ creator, vendor, isRecommended = false }) => {
    // Handle both formats (standalone vendor or creator with vendor property)
    const vendorData = vendor || (creator ? creator.vendor : null)
    const vendorId = vendorData?.id

    if (!vendorId) return null

    const isFollowLoading = isLoadingFollow[vendorId] || false
    const isFollowed = followedCreators[vendorId] || false
    const followerCount = followerCounts[vendorId] || 0

    return (
      <div
        key={vendorId}
        className="overflow-hidden transition bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
      >
        <div className="relative h-32 bg-gray-200">
          <div className="relative w-full h-full">
            <Image
              src={vendorData.coverphoto || CoverImage}
              alt={`${vendorData.name} banner`}
              className="object-cover"
              fill={true}
              sizes="(max-width: 768px) 100vw, 25vw"
              priority={true}
            />
          </div>
          {vendorData.creator_title && (
            <div className="absolute px-2 py-1 text-xs text-white rounded-full top-3 right-3 bg-black/70 backdrop-blur-sm">
              {vendorData.creator_title}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center">
            <div className="relative w-12 h-12 mr-3 overflow-hidden rounded-full">
              <Image
                src={vendorData.logo || avatarImage}
                alt={vendorData.name}
                className="object-cover"
                fill={true}
                sizes="48px"
                priority={true}
              />
            </div>

            <div>
              <div className="flex items-center">
                <Link href={`/creator/${vendorData.handle}`}>
                  <h3 className="font-semibold">{vendorData.name}</h3>
                </Link>
                <span className="ml-1 text-[#e65100]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span>{vendorData.creator_title || "Creator"}</span>
                <span className="mx-1">•</span>
                <span>
                  {followerCount} follower{followerCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-3 mb-3 text-sm text-gray-600 line-clamp-2">
            {vendorData.creator_bio || "No bio available"}
          </p>

          <div className="mb-3 text-xs text-gray-600">
            <span className="font-medium">Popular:</span>{" "}
            {vendorData.popular_product || "Creator products"}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleFollowToggle(vendorId)}
            disabled={isFollowLoading}
            className={`w-full py-2 text-sm font-medium transition rounded-md ${
              isFollowLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : isFollowed
                ? "border border-[#e65100] text-[#e65100] hover:bg-[#e65100] hover:text-white"
                : "bg-[#e65100] text-white hover:bg-[#d84315]"
            }`}
          >
            {isFollowLoading
              ? "Processing..."
              : isFollowed
              ? "Following"
              : "Follow"}
          </motion.button>
        </div>
      </div>
    )
  }

  // Handle following for sample creators
  const handleSampleCreatorFollow = (creatorId) => {
    toast.info("This is a sample creator. Follow functionality is simulated.")
    // Simulate follow behavior for demo purposes
  }

  return (
    <div className="min-h-screen mt-16 bg-gray-50">
      {/* Header with search and filter */}
      <header className="sticky top-0 z-30 bg-white shadow">
        <div className="container px-4 py-3 mx-auto">
          <div className="flex items-center justify-between">
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
        {/* Followed Creators Section with loading state */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Followed Creators</h2>
            {!isLoading && customerVendors && customerVendors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">
                  {filteredVendors.length} of {customerVendors.length}
                </span>

                <div className="relative group">
                  <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 text-sm flex items-center">
                    Sort
                    <ChevronDown size={16} className="ml-1" />
                  </button>
                  <div className="absolute right-0 z-10 invisible w-40 py-1 mt-1 bg-white rounded-md shadow-lg group-hover:visible">
                    <button className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100">
                      Recently Active
                    </button>
                    <button className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100">
                      Alphabetical (A-Z)
                    </button>
                    <button className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100">
                      Favorites First
                    </button>
                  </div>
                </div>
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

        {/* Recommended Creators Section */}
        <section className="mb-10">
          <h2 className="mb-6 text-2xl font-bold">Recommended for You</h2>

          {/* Because You Follow */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center text-lg font-semibold">
                <Star size={18} className="text-[#e65100] mr-2" />
                Because You Follow
              </h3>
              <a
                href="#"
                className="text-sm text-[#e65100] hover:underline flex items-center"
              >
                View All
                <ChevronRight size={16} className="ml-1" />
              </a>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.isArray(allVendors) && allVendors.length > 0 ? (
                allVendors
                  .slice(0, 4)
                  .map((vendor) => (
                    <CreatorCard key={vendor.id} vendor={vendor} />
                  ))
              ) : (
                <div className="col-span-4 p-4 text-center text-gray-500">
                  No recommendations available
                </div>
              )}
            </div>
          </div>

          {/* Rising Stars */}
          {/* <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center text-lg font-semibold">
                <TrendingUp size={18} className="text-[#e65100] mr-2" />
                Rising Stars
              </h3>
              <a
                href="#"
                className="text-sm text-[#e65100] hover:underline flex items-center"
              >
                View All
                <ChevronRight size={16} className="ml-1" />
              </a>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {risingCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="overflow-hidden transition bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
                >
                  <div className="relative h-32 bg-gray-200">
                    <div className="relative w-full h-full">
                      <Image
                        src={creator.bannerImage}
                        alt={`${creator.name} banner`}
                        className="object-cover"
                        fill={true}
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    </div>
                    <div className="absolute px-2 py-1 text-xs text-white bg-green-500 rounded-full top-3 right-3">
                      {creator.growth}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="relative w-12 h-12 mr-3 overflow-hidden rounded-full">
                        <Image
                          src={creator.avatar}
                          alt={creator.name}
                          className="object-cover"
                          fill={true}
                          sizes="48px"
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold">{creator.name}</h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{creator.category}</span>
                          <span className="mx-1">•</span>
                          <span>{creator.followers} followers</span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 mb-4 text-sm text-gray-600 line-clamp-2">
                      {creator.description}
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2 bg-[#e65100] text-white rounded-md text-sm font-medium hover:bg-[#d84315] transition"
                      onClick={() => handleSampleCreatorFollow(creator.id)}
                    >
                      Follow
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* Exclusive to Junooni */}
          {/* <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center text-lg font-semibold">
                <Award size={18} className="text-[#e65100] mr-2" />
                Exclusive to Junooni
              </h3>
              <a
                href="#"
                className="text-sm text-[#e65100] hover:underline flex items-center"
              >
                View All
                <ChevronRight size={16} className="ml-1" />
              </a>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {exclusiveCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="overflow-hidden transition bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
                >
                  <div className="relative h-32 bg-gray-200">
                    <div className="relative w-full h-full">
                      <Image
                        src={creator.bannerImage}
                        alt={`${creator.name} banner`}
                        className="object-cover"
                        fill={true}
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 bg-[#e65100] text-white text-xs px-2 py-1 rounded-full">
                      Junooni Exclusive
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="relative w-12 h-12 mr-3 overflow-hidden rounded-full">
                        <Image
                          src={creator.avatar}
                          alt={creator.name}
                          className="object-cover"
                          fill={true}
                          sizes="48px"
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold">{creator.name}</h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{creator.category}</span>
                          <span className="mx-1">•</span>
                          <span>{creator.followers} followers</span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 mb-4 text-sm text-gray-600 line-clamp-2">
                      {creator.description}
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2 bg-[#e65100] text-white rounded-md text-sm font-medium hover:bg-[#d84315] transition"
                      onClick={() => handleSampleCreatorFollow(creator.id)}
                    >
                      Follow
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </section>

        {/* Browse by Category - Dynamic based on creator titles */}
        {/* <section>
          <h2 className="mb-6 text-2xl font-bold">Browse by Creator Type</h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.slice(1).map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="flex flex-col items-center p-6 overflow-hidden text-center transition bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
                onClick={(e) => {
                  e.preventDefault()
                  setActiveCategory(category.id)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
              >
                <div className="w-16 h-16 rounded-full bg-[#e65100]/10 flex items-center justify-center mb-4 text-[#e65100]">
                  {category.icon}
                </div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="mt-1 text-sm text-gray-500">View creators</p>
              </a>
            ))}
          </div>
        </section> */}
      </main>
    </div>
  )
}

export default CreatorDiscoveryPage
