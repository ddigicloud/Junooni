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
      try {
        const fetchedPoints = await loyaltyPoints()
        const points = fetchedPoints.points
        setLoyalPoint(points)

        // Store in localStorage for Membership component
        storeMembershipInfo(points)

        // Also store user info for Membership component
        const userInfo = {
          id: customer?.id || "cus-12345",
          name: customer
            ? `${customer.first_name} ${customer.last_name}`
            : "Jamie Smith",
          email: customer?.email || "jamie.smith@example.com",
          avatar: customer?.avatarImg || assets.rabit,
          points: points,
          following: followedCreators,
          joinDate: customer?.created_at
            ? formatDate(customer.created_at)
            : "March 15, 2025",
        }
        window.localStorage.setItem("user", JSON.stringify(userInfo))
      } catch (error) {
        console.error("Error fetching loyalty points:", error)
      }
    }

    fetchLoyaltyPoints()
  }, []) // Empty dependency array - only run once

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

    fetchWishlist()
  }, []) // Empty dependency array - only run once

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

    fetchOrders()
  }, [customer?.orders]) // Only re-run if customer.orders changes

  // Effect 4: Fetch followed creators and their follower counts
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
      }
    }

    fetchFollowedCreators()
  }, []) // Empty dependency array - only run once

  // Effect 5: Setup upcoming events (only when followedCreatorsData changes)
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

  // User data - integrating dynamic customer data where available
  const user = {
    id: customer?.id || "cus-12345",
    name: customer
      ? `${customer.first_name} ${customer.last_name}`
      : "Jamie Smith",
    email: customer?.email || "jamie.smith@example.com",
    avatar: customer?.avatarImg || assets.rabit,
    membershipTier: currentTier,
    joinDate: customer?.created_at
      ? formatDate(customer.created_at)
      : "March 15, 2025",
    points: loyalPoint,
    following: followedCreators,
    addresses:
      customer?.addresses && customer.addresses.length > 0
        ? customer.addresses
        : [
            {
              id: "addr-1",
              default: true,
              name: customer
                ? `${customer.first_name} ${customer.last_name}`
                : "Jamie Smith",
              street: "123 Main Street",
              city: "Los Angeles",
              state: "CA",
              zipCode: "90210",
              country: "United States",
              phone: customer?.phone || "(555) 123-4567",
            },
            {
              id: "addr-2",
              default: false,
              name: customer
                ? `${customer.first_name} ${customer.last_name}`
                : "Jamie Smith",
              street: "456 Work Avenue, Suite 7B",
              city: "Los Angeles",
              state: "CA",
              zipCode: "90001",
              country: "United States",
              phone: customer?.phone || "(555) 123-4567",
            },
          ],
    paymentMethods: [
      {
        id: "pm-1",
        default: true,
        type: "visa",
        lastFour: "4242",
        expiryDate: "05/26",
      },
      {
        id: "pm-2",
        default: false,
        type: "mastercard",
        lastFour: "8790",
        expiryDate: "12/25",
      },
    ],
    company: customer?.company_name || "Personal Account",
  }

  // Get orders from either customer prop, fetched orders, or fallback to dummy data
  const orders =
    customer?.orders?.length > 0
      ? customer.orders
      : ordersData.length > 0
      ? ordersData
      : [
          {
            id: "ORD-9876",
            date: "March 15, 2025",
            status: "Out for Delivery",
            trackingNumber: "1Z999AA10123456784",
            carrier: "UPS",
            total: 79.98,
            paymentMethod: "Visa •••• 4242",
            items: [
              {
                id: "item-1",
                name: "Tour Graphic Tee",
                creator: "Alex Rivera",
                price: 45.0,
                quantity: 1,
                image: "/api/placeholder/100/100",
              },
              {
                id: "item-2",
                name: "Digital Album Download",
                creator: "Alex Rivera",
                price: 14.99,
                quantity: 1,
                image: "/api/placeholder/100/100",
              },
              {
                id: "item-3",
                name: "Exclusive Sticker Pack",
                creator: "Alex Rivera",
                price: 9.99,
                quantity: 2,
                image: "/api/placeholder/100/100",
              },
            ],
            shippingAddress: {
              name: customer
                ? `${customer.first_name} ${customer.last_name}`
                : "Jamie Smith",
              street: "123 Main Street",
              city: "Los Angeles",
              state: "CA",
              zipCode: "90210",
              country: "United States",
            },
            timeline: [
              {
                date: "March 15, 2025",
                status: "Out for Delivery",
                time: "9:45 AM",
              },
              {
                date: "March 14, 2025",
                status: "Package Arrived at Local Facility",
                time: "10:32 PM",
              },
              {
                date: "March 12, 2025",
                status: "Package Shipped",
                time: "3:15 PM",
              },
              {
                date: "March 11, 2025",
                status: "Order Processed",
                time: "11:30 AM",
              },
              {
                date: "March 10, 2025",
                status: "Order Placed",
                time: "2:45 PM",
              },
            ],
          },
        ]

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

  // Generate props for all tabs
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
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="px-4 py-8">
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
