"use client"
import React, { useState, useEffect } from "react"
import { LogOut } from "lucide-react"
import { listOrders } from "@lib/data/orders"
import { wishlistItems } from "@lib/data/customer"
import { followerList, loyaltyPoints } from "@lib/data/customer"
import { retriveVendorsFollowers } from "@lib/data/vendors"
import { signout } from "@lib/data/customer"
import { assets } from "@assets/assets"

// Import tab components
import AccountSidebar from "@modules/account/components/account-sidebar"
import DashboardTab from "@modules/account/components/sidebar-tabs/dashboard-tab"
import OrdersTab from "@modules/account/components/sidebar-tabs/order-tab"
import WishlistTab from "@modules/account/components/sidebar-tabs/wishlist-tab"
import MembershipTab from "@modules/account/components/sidebar-tabs/membership-tab"
import SettingsTab from "@modules/account/components/sidebar-tabs/setting-tab"

// Import tier calculation functions from the utility file
import {
  TIER_PERCENTAGES,
  MAX_POSSIBLE_POINTS,
  pointsToPercentage,
  getUserTier,
  getNextTier,
  getPointsToNextTier,
  getPercentageToNextTier,
  calculateProgressPercentage,
  TIERS,
} from "@modules/account/components/tier-calculation"

// Store membership info in localStorage for development
// This helps the Membership component access the data
const storeMembershipInfo = (points) => {
  // Calculate all tier data based on percentage system
  const overallPercentage = pointsToPercentage(points)
  const currentTier = getUserTier(points)
  const nextTier = getNextTier(currentTier)
  const pointsToNextTier = getPointsToNextTier(points)
  const progressPercentage = calculateProgressPercentage(points)

  const membershipInfo = {
    loyalPoint: points,
    currentTier,
    nextTier,
    pointsToNextTier,
    overallPercentage,
    progressPercentage,
    tierPercentages: TIER_PERCENTAGES,
    maxPoints: MAX_POSSIBLE_POINTS,
  }

  window.localStorage.setItem("membershipInfo", JSON.stringify(membershipInfo))
}

const CustomerAccount = ({ customer, creatorList, Orders }) => {
  // State management
  const [activeTab, setActiveTab] = useState("overview")
  const [activeOrder, setActiveOrder] = useState(null)
  const [wishlistData, setWishlistData] = useState([])
  const [ordersData, setOrdersData] = useState([])
  const [followedCreatorsData, setFollowedCreatorsData] = useState([])
  const [followersCount, setFollowersCount] = useState({})
  const [upcomingEventsData, setUpcomingEventsData] = useState([])
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [loyalPoint, setLoyalPoint] = useState(0)
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true)
  const [isLoadingCreators, setIsLoadingCreators] = useState(true)
  const [isLoadingPoints, setIsLoadingPoints] = useState(true)

  // Get current tier based on loyalty points using the percentage system
  const overallPercentage = pointsToPercentage(loyalPoint)
  const currentTier = getUserTier(loyalPoint)
  const nextTier = getNextTier(currentTier)
  const pointsToNextTier = getPointsToNextTier(loyalPoint)
  const progressPercentage = calculateProgressPercentage(loyalPoint)

  // Get list of followed creators from props or state
  const followedCreators =
    followedCreatorsData.length > 0
      ? followedCreatorsData
      : creatorList?.follow?.creators || []

  // Effect 1: Fetch loyalty points
  useEffect(() => {
    const fetchLoyaltyPoints = async () => {
      setIsLoadingPoints(true)
      try {
        const fetchedPoints = await loyaltyPoints()
        const points = fetchedPoints.points || 0
        setLoyalPoint(points)

        // Store in localStorage for Membership component
        storeMembershipInfo(points)

        // Also store user info for Membership component - only with available data
        const userInfo = {
          id: customer?.id || "",
          name: customer
            ? `${customer.first_name} ${customer.last_name}`
            : "",
          email: customer?.email || "",
          avatar: customer?.avatarImg || "",
          points: points,
          following: followedCreators,
          joinDate: customer?.created_at
            ? formatDate(customer.created_at)
            : "",
        }
        if (userInfo.id || userInfo.name || userInfo.email) {
          window.localStorage.setItem("user", JSON.stringify(userInfo))
        }
      } catch (error) {
        console.error("Error fetching loyalty points:", error)
      } finally {
        setIsLoadingPoints(false)
      }
    }

    fetchLoyaltyPoints()
  }, []) // Empty dependency array - only run once

  // Effect 2: Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      setIsLoadingWishlist(true)
      try {
        const data = await wishlistItems()
        if (data && data !== "please login") {
          setWishlistData(data)
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error)
      } finally {
        setIsLoadingWishlist(false)
      }
    }

    fetchWishlist()
  }, []) // Empty dependency array - only run once

  // Effect 3: Fetch orders if not in customer object
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoadingOrders(true)
      try {
        if (!customer?.orders || customer.orders.length === 0) {
          const orders = await listOrders()
          if (orders && orders.length > 0) {
            setOrdersData(orders)
          }
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setIsLoadingOrders(false)
      }
    }

    fetchOrders()
  }, [customer?.orders]) // Only re-run if customer.orders changes

  // Effect 4: Fetch followed creators and their follower counts
  useEffect(() => {
    const fetchFollowedCreators = async () => {
      setIsLoadingCreators(true)
      try {
        const followedData = await followerList()
        if (
          followedData &&
          followedData.follow &&
          followedData.follow.creators
        ) {
          setFollowedCreatorsData(followedData.follow.creators)

          // Fetch follower counts for each creator (only once)
          const counts = {}
          await Promise.all(
            followedData.follow.creators.map(async (creator) => {
              if (creator.vendor && creator.vendor.id) {
                const result = await retriveVendorsFollowers(creator.vendor.id)
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
          setFollowersCount(counts)
        }
      } catch (error) {
        console.error("Error fetching followed creators:", error)
      } finally {
        setIsLoadingCreators(false)
      }
    }

    fetchFollowedCreators()
  }, []) // Empty dependency array - only run once

  // Effect 5: Setup upcoming events (only when followedCreatorsData changes)
  useEffect(() => {
    // Generate upcoming events from followed creators (no hardcoded fallback)
    if (followedCreatorsData && followedCreatorsData.length > 0) {
      const events = followedCreatorsData
        .slice(0, 3)
        .map((creator, index) => {
          const daysAhead = 5 + index * 7
          const eventDate = new Date()
          eventDate.setDate(eventDate.getDate() + daysAhead)

          return {
            id: `ev-${index + 1}`,
            type: index % 2 === 0 ? "merch-drop" : "livestream",
            title:
              index % 2 === 0
                ? `${creator.vendor?.name || "Creator"} Collection`
                : `Live Session with ${creator.vendor?.name || "Creator"}`,
            creator: creator.vendor?.name || "Creator",
            date: eventDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            countdown: daysAhead,
          }
        })
      setUpcomingEventsData(events)
    } else {
      // Clear upcoming events if no creators are followed
      setUpcomingEventsData([])
    }
  }, [followedCreatorsData]) // Only run when followedCreatorsData changes

  // Handle sign out
  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signout("en") // Using 'en' as the default country code
    } catch (error) {
      console.error("Error signing out:", error)
      setIsSigningOut(false)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // User data - using only available customer data
  const user = {
    id: customer?.id || "",
    name: customer
      ? `${customer.first_name} ${customer.last_name}`
      : "",
    email: customer?.email || "",
    avatar: customer?.avatarImg || "",
    membershipTier: currentTier,
    joinDate: customer?.created_at
      ? formatDate(customer.created_at)
      : "",
    points: loyalPoint,
    following: followedCreators,
    addresses: customer?.addresses || [],
    paymentMethods: customer?.paymentMethods || [],
    company: customer?.company_name || "",
  }

  // Get orders from either customer prop, fetched orders, or empty array
  const orders =
    customer?.orders?.length > 0
      ? customer.orders
      : ordersData.length > 0
      ? ordersData
      : []

  // Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500"
      case "Out for Delivery":
        return "bg-blue-500"
      case "Package in Transit":
        return "bg-purple-500"
      case "Order Placed":
      case "Order Processed":
      case "Package Shipped":
      case "Package Arrived at Local Facility":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  // Format currency
  const formatPrice = (price) => {
    // Handle both cents (from API) and dollars (from mock data)
    const amount = price > 100 && Number.isInteger(price) ? price / 100 : price
    return `$${parseFloat(amount).toFixed(2)}`
  }

  // Loading state component
  const LoadingState = () => (
    <div className="animate-pulse">
      <div className="w-1/4 h-4 mb-2 bg-gray-200 rounded"></div>
      <div className="w-1/3 h-4 mb-2 bg-gray-200 rounded"></div>
      <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
    </div>
  )

  // Empty state component
  const EmptyState = ({ message = "No data available" }) => (
    <div className="py-8 text-center text-gray-500">
      <p>{message}</p>
    </div>
  )

  // Generate props for all tabs - including loading states
  const tabProps = {
    user,
    orders,
    customer,
    followedCreators,
    upcomingEvents: upcomingEventsData,
    wishlistData,
    setWishlistData,
    activeOrder,
    setActiveOrder,
    setActiveTab,
    formatDate,
    formatPrice,
    getStatusColor,
    currentTier,
    nextTier,
    loyalPoint,
    pointsToNextTier,
    overallPercentage,
    progressPercentage,
    getPercentageToNextTier,
    tierPercentages: TIER_PERCENTAGES,
    maxPoints: MAX_POSSIBLE_POINTS,
    // Loading states
    isLoadingOrders,
    isLoadingWishlist,
    isLoadingCreators,
    isLoadingPoints,
    // Component states
    LoadingState,
    EmptyState,
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="px-2 py-3 sm:px-4">
        <div className="">
          {/* Sidebar Navigation */}

          {/* Main Content Area */}
          <main className="flex-grow">
            {activeTab === "overview" && <DashboardTab {...tabProps} />}
            {activeTab === "orders" && <OrdersTab {...tabProps} />}
            {activeTab === "wishlist" && <WishlistTab {...tabProps} />}
            {activeTab === "membership" && <MembershipTab {...tabProps} />}
            {activeTab === "settings" && <SettingsTab {...tabProps} />}
          </main>
        </div>
      </div>
    </div>
  )
}

export default CustomerAccount