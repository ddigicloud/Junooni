"use client"

import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import UnderlineLink from "@modules/common/components/interactive-link"
import { HttpTypes } from "@medusajs/types"
import AccountSidebar from "../components/account-sidebar"
import { listOrders } from "@lib/data/orders"
import {
  wishlistItems,
  loyaltyPoints,
  followerList,
  signout,
} from "@lib/data/customer"
import { retriveVendorsFollowers } from "@lib/data/vendors"
import { assets } from "@assets/assets"

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
        console.error("Error fetching loyalty points:", error)
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
        console.error("Error fetching wishlist:", error)
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
          console.error("Error fetching orders:", error)
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
        console.error("Error fetching followed creators:", error)
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
      console.error("Error signing out:", error)
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
      <div className="flex flex-col flex-1 h-full mx-auto bg-white content-container">
        <div className="grid grid-cols-1 small:grid-cols-[240px_1fr] py-12">
          <div>
            {customer && (
              <AccountSidebar
                customer={customer}
                user={user}
                handleSignOut={handleSignOut}
                isSigningOut={isSigningOut}
              />
            )}
          </div>
          <div className="flex-1 px-0 md:px-4">
            {/* Pass important context to children if needed */}
            {React.isValidElement(children) &&
              React.cloneElement(children, commonProps)}
            {!React.isValidElement(children) && children}
          </div>
        </div>
        <div className="flex flex-col items-end justify-between gap-8 px-4 py-12 border-gray-200 small:flex-row small:border-t">
          <div>
            <h3 className="mb-4 text-xl-semi">Got questions?</h3>
            <span className="txt-medium">
              You can find frequently asked questions and answers on our
              customer service page.
            </span>
          </div>
          <div>
            
          <UnderlineLink href="/customer-service" className="text-[#e65100]">
            Customer Service
          </UnderlineLink>

          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
