 "use client"

import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import UnderlineLink from "@modules/common/components/interactive-link"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import AccountSidebar from "../components/account-sidebar"
import { listOrders } from "@lib/data/orders"
import Help from "@modules/order/components/help"
import {
  wishlistItems,
  loyaltyPoints,
  followerList,
  signout,
} from "@lib/data/customer"
import { retriveVendorsFollowers } from "@lib/data/vendors"
import { assets } from "@assets/assets"
import { User, Package, Heart, Star, LogOut, MapPin, Settings, ChevronRight } from "lucide-react"

// Import tier calculation functions
import {
  getUserTier,
  getNextTier,
  getPointsToNextTier,
  pointsToPercentage,
  calculateProgressPercentage,
  getPercentageToNextTier,
} from "@modules/account/components/tier-calculation"

const AccountLayout = ({ customer, children, creatorList }) => {
  // Get the current path for determining active tab
  const pathname = usePathname()

  // State for data that needs to be fetched and managed
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [wishlistData, setWishlistData] = useState([])
  const [ordersData, setOrdersData] = useState([])
  const [followedCreatorsData, setFollowedCreatorsData] = useState([])
  const [followersCount, setFollowersCount] = useState({})
  const [upcomingEventsData, setUpcomingEventsData] = useState([])
  const [loyalPoint, setLoyalPoint] = useState(0)
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  // Used for order details view
  const [activeOrder, setActiveOrder] = useState(null)

  // Get current tier based on loyalty points
  const currentTier = getUserTier ? getUserTier(loyalPoint) : "Member"
  const nextTier = getUserTier && getNextTier ? getNextTier(currentTier) : null
  const pointsToNextTier =
    getUserTier && getPointsToNextTier ? getPointsToNextTier(loyalPoint) : 0
  const overallPercentage = pointsToPercentage
    ? pointsToPercentage(loyalPoint)
    : 0
  const progressPercentage = calculateProgressPercentage
    ? calculateProgressPercentage(loyalPoint)
    : 0

  // Get list of followed creators from props or state
  const followedCreators =
    followedCreatorsData.length > 0
      ? followedCreatorsData
      : creatorList?.follow?.creators || []

  // Effect 1: Fetch loyalty points
  useEffect(() => {
    const fetchLoyaltyPoints = async () => {
      try {
        if (typeof loyaltyPoints === "function") {
          const fetchedPoints = await loyaltyPoints()
          const points = fetchedPoints.points
          setLoyalPoint(points)
        }
      } catch (error) {
        //console.error("Error fetching loyalty points:", error)
      }
    }

    if (customer) {
      fetchLoyaltyPoints()
    }
  }, [customer])

  // Effect 2: Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await wishlistItems()
        if (data && data !== "please login") {
          setWishlistData(data)
        }
      } catch (error) {
        //console.error("Error fetching wishlist:", error)
      }
    }

    if (customer) {
      fetchWishlist()
    }
  }, [customer])

  // Effect 3: Fetch orders if not in customer object
  useEffect(() => {
    const fetchOrders = async () => {
      if (!customer?.orders || customer.orders.length === 0) {
        try {
          const orders = await listOrders()
          if (orders && orders.length > 0) {
            setOrdersData(orders)
          }
        } catch (error) {
          //console.error("Error fetching orders:", error)
        }
      }
    }

    if (customer) {
      fetchOrders()
    }
  }, [customer?.orders, customer])

  // Effect 4: Fetch followed creators
  useEffect(() => {
    const fetchFollowedCreators = async () => {
      try {
        const followedData = await followerList()
        if (
          followedData &&
          followedData.follow &&
          followedData.follow.creators
        ) {
          setFollowedCreatorsData(followedData.follow.creators)

          // Fetch follower counts for each creator
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
        //console.error("Error fetching followed creators:", error)
      }
    }

    if (customer) {
      fetchFollowedCreators()
    }
  }, [customer])

  // Effect 5: Setup upcoming events
  useEffect(() => {
    // Simulate upcoming events data using followedCreatorsData
    const simulateUpcomingEvents = () => {
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
        // Fallback to sample data if no creators are followed
        setUpcomingEventsData([
          {
            id: "ev-1",
            type: "merch-drop",
            title: "Summer Tour Collection",
            creator: "Alex Rivera",
            date: "April 15, 2025",
            countdown: 12,
          },
          {
            id: "ev-2",
            type: "livestream",
            title: "Studio Session + Q&A",
            creator: "Maya Johnson",
            date: "April 8, 2025",
            countdown: 5,
          },
          {
            id: "ev-3",
            type: "merch-drop",
            title: "Limited Edition Vinyls",
            creator: "DJ Cosmos",
            date: "April 20, 2025",
            countdown: 17,
          },
        ])
      }
    }

    simulateUpcomingEvents()
  }, [followedCreatorsData])

  // Handle sign out
  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signout("en") // Using 'en' as the default country code
      // The page should automatically redirect after successful logout
    } catch (error) {
      //console.error("Error signing out:", error)
      setIsSigningOut(false)
    }
  }

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

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

  // Construct user object with all required data
  const user = customer
    ? {
        id: customer?.id || "cus-12345",
        name:
          `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
          "Customer",
        email: customer?.email || "",
        avatar: customer?.avatarImg || assets?.rabit || null,
        membershipTier: currentTier,
        joinDate: customer?.created_at
          ? formatDate(customer.created_at)
          : formatDate(new Date()),
        points: loyalPoint,
        following: followedCreators,
        addresses: customer?.addresses || [],
        company: customer?.company_name || "Personal Account",
      }
    : null

  // Get orders from either customer prop or fetched orders
  const orders =
    customer?.orders?.length > 0
      ? customer.orders
      : ordersData.length > 0
      ? ordersData
      : []

  // Props to pass to children
  const commonProps = {
    customer,
    user,
    orders,
    wishlistData,
    setWishlistData,
    activeOrder,
    setActiveOrder,
    followedCreators,
    upcomingEvents: upcomingEventsData,
    formatDate,
    getStatusColor,
    currentTier,
    nextTier,
    loyalPoint,
    pointsToNextTier,
    overallPercentage,
    progressPercentage,
    getPercentageToNextTier,
  }

  return (
    <div className="flex-1 small:py-12" data-testid="account-page">
      {/* Mobile Layout */}
      <div className="md:hidden">
        {customer && (
          <>
            {/* Mobile Header and Quick Actions Only */}
            <div className="w-full min-h-screen pb-0 bg-gray-50">
              {/* Header */}
              <div className="sticky top-0 z-10 px-4 mt-16 rounde-sm pg-white">
                <div className="flex items-center justify-between px-2 py-2 bg-white border border-gray-200 rounded-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-[#4c5cbf] rounded-full">
                      <span className="text-lg font-semibold text-white">
                        {customer?.first_name?.charAt(0) || 'U'}{customer?.last_name?.charAt(0) || ''}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {user?.name ||
                          `${customer?.first_name || ""} ${customer?.last_name || ""}`.trim() ||
                          "Customer"}
                      </h2>
                      {user?.membershipTier && (
                        <p className="flex items-center text-sm text-orange-600">
                          <Star className="w-3 h-3 mr-1" />
                          {user.membershipTier}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="p-4">
                {/* <h3 className="mb-3 font-semibold text-gray-900">Quick Actions</h3> */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Dashboard */}
                  <LocalizedClientLink href="/account" className="block p-4 text-left transition-transform bg-white border border-gray-200 shadow-sm rounded-xl active:scale-95">
                    <div className="flex items-center justify-center mb-2">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-center text-gray-900">Dashboard</p>
                  </LocalizedClientLink>

                  {/* My Orders */}
                  <LocalizedClientLink
                    href="/account/orders"
                    className="block p-4 text-left transition-transform bg-white border border-gray-200 shadow-sm rounded-xl active:scale-95"
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className="relative flex items-center justify-center w-10 h-10 bg-orange-500 rounded-lg">
                        <Package className="w-5 h-5 text-white" />
                        {orders?.length > 0 && (
                          <span className="absolute -top-3 -right-3 px-1 py-1 text-[10px] font-bold text-white bg-orange-500 rounded-full leading-none">
                            {orders.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-center text-gray-900">My Orders</p>
                  </LocalizedClientLink>

                  {/* Wishlist */}
                  <LocalizedClientLink href="/account/wishlist" className="block p-4 text-left transition-transform bg-white border border-gray-200 shadow-sm rounded-xl active:scale-95">
                    <div className="flex items-center justify-center mb-2">
                      <div className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-lg">
                         <Heart className="w-5 h-5 text-white" />
                      </div>
                      {wishlistData?.length > 0 && (
                        <span className="absolute -top-3 -right-3 px-1 py-1 text-[10px] font-bold text-white bg-orange-500 rounded-full leading-none">
                            {wishlistData.length}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-center text-gray-900">Wishlist</p>
                  </LocalizedClientLink>

                  {/* Fan Membership */}
                  <LocalizedClientLink href="/account/membership" className="block p-4 text-left transition-transform bg-white border border-gray-200 shadow-sm rounded-xl active:scale-95">
                    <div className="flex items-center justify-center mb-2">
                      <div className="flex items-center justify-center w-10 h-10 bg-purple-500 rounded-lg">
                       <Star className="w-5 h-5 text-white" />
                      </div>
                      {/* <div className="w-2 h-2 bg-orange-500 rounded-full"></div> */}
                    </div>
                    <p className="text-sm font-medium text-center text-gray-900">Fan Membership</p>
                  </LocalizedClientLink>
                </div>

                {/* Main Content Area */}
                <div className="px-0 py-0 bg-white border border-gray-200 shadow-sm sm:p-4 smb-4 rounded-xl">
                  {React.isValidElement(children) &&
                    React.cloneElement(children, commonProps)}
                  {!React.isValidElement(children) && children}
                  <Help/>
                </div>

                {/* More Options Section - Now at bottom */}
                <div className="mt-8 mb-0 bg-white border border-gray-200 shadow-sm rounded-xl">
                  <div className="p-4 border-b border-gray-200">
                    <button 
                      onClick={() => setShowMoreOptions(!showMoreOptions)}
                      className="flex items-center justify-between w-full"
                    >
                      <h3 className="font-semibold text-gray-900">More Options</h3>
                     <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          showMoreOptions ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                  </div>
                  
                  {showMoreOptions && (
                    <div className="border-b border-gray-200">
                      {/* Addresses */}
                      <LocalizedClientLink href="/account/addresses" className="block w-full p-4 transition-colors border-b border-gray-200 active:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                               <MapPin className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="font-medium text-gray-900">Addresses</span>
                          </div>
                           <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </LocalizedClientLink>

                      {/* Account Settings */}
                      <LocalizedClientLink href="/account/profile" className="block w-full p-4 transition-colors active:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                              <Settings className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="font-medium text-gray-900">Account Settings</span>
                          </div>
                           <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </LocalizedClientLink>
                    </div>
                  )}
                  
                  <div className="p-4">
                    <button 
                      className="flex items-center w-full p-2 -m-2 space-x-3 text-orange-600 transition-colors rounded-lg active:bg-orange-50"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                    >
                       <LogOut className="w-5 h-5" />
                      <span className="font-medium">
                        {isSigningOut ? "Signing out..." : "Sign Out"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="flex-col flex-1 hidden h-full pt-4 mx-auto bg-white md:flex content-container">
        <div className="grid grid-cols-1 small:grid-cols-[240px_1fr] py-12">
          <div>
            {customer && (
              <AccountSidebar
                customer={customer}
                user={user}
                handleSignOut={handleSignOut}
                isSigningOut={isSigningOut}
                ordersCount={orders?.length}
                wishlistCount={wishlistData?.length}
              />
            )}
          </div>
          <div className="flex-1 px-0 md:px-4">
            {/* Pass important context to children if needed */}
            {React.isValidElement(children) &&
              React.cloneElement(children, commonProps)}
            {!React.isValidElement(children) && children}
            <Help/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout