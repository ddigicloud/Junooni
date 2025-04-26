"use client"
import React, { useState, useEffect, useRef } from "react"
import {
  Package,
  ShoppingBag,
  Heart,
  Bell,
  User,
  Settings,
  Gift,
  Calendar,
  ChevronRight,
  ChevronDown,
  Search,
  Eye,
  Download,
  Star,
  MessageCircle,
  Share2,
  Clock,
  CreditCard,
  LogOut,
  AlertCircle,
  Check,
  X,
  MapPin,
  Truck,
} from "lucide-react"
import OrderOverview from "@modules/account/components/order-overview"
import OrderCard from "@modules/account/components/order-card"
import { Button } from "@medusajs/ui"
import Link from "next/link"
import { assets } from "@assets/assets"
import Image from "next/image"
import { WishlistProducts } from "@modules/wishlists/components/wishlistProducts"
import { listOrders } from "@lib/data/orders"
import { wishlistItems, ItemDelete } from "@lib/data/customer"
import { followerList, Addfollower, deletefollower } from "@lib/data/customer"
import { retriveVendors, retriveVendorsFollowers } from "@lib/data/vendors"
import { signout } from "@lib/data/customer"
import CustomerAvatar from "../get-initials"

const CustomerAccount = ({ customer, order, creatorList }) => {
  // State management
  const [activeTab, setActiveTab] = useState("overview")
  const [activeOrder, setActiveOrder] = useState(null)
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const [wishlistData, setWishlistData] = useState([])
  const [ordersData, setOrdersData] = useState([])
  const [followedCreatorsData, setFollowedCreatorsData] = useState([])
  const [followersCount, setFollowersCount] = useState({})
  const [upcomingEventsData, setUpcomingEventsData] = useState([])
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Address management states
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [showEditAddressForm, setShowEditAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [isAddressSubmitting, setIsAddressSubmitting] = useState(false)
  const [addressFormError, setAddressFormError] = useState("")
  const [formState, setFormState] = useState({
    isDefaultBilling: false,
    isDefaultShipping: false,
    addressId: "",
  })

  // Refs for form
  const addressFormRef = useRef(null)

  // Get list of followed creators from props or state
  const followedCreators =
    followedCreatorsData.length > 0
      ? followedCreatorsData
      : creatorList?.follow?.creators || []

  useEffect(() => {
    // Fetch wishlist items when component mounts
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

    // Fetch orders if they aren't available in the customer object
    const fetchOrders = async () => {
      if (!customer?.orders || customer.orders.length === 0) {
        try {
          const orders = await listOrders(10, 0)
          if (orders && orders.length > 0) {
            setOrdersData(orders)
          }
        } catch (error) {
          console.error("Error fetching orders:", error)
        }
      }
    }

    // Fetch followed creators if not provided in props
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

    // Simulate upcoming events data
    // In a real application, you would fetch this from an API
    const simulateUpcomingEvents = () => {
      // Use real followed creators' data to create more realistic upcoming events
      if (followedCreators && followedCreators.length > 0) {
        const events = followedCreators.slice(0, 3).map((creator, index) => {
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

    fetchWishlist()
    fetchOrders()
    fetchFollowedCreators()
    simulateUpcomingEvents()
  }, [customer, creatorList])

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

  // Handle following/unfollowing a creator
  const handleFollowToggle = async (vendorId) => {
    try {
      // Check if this creator is already followed
      const isFollowed = followedCreators.some(
        (creator) => creator.vendor && creator.vendor.id === vendorId
      )

      if (isFollowed) {
        await deletefollower(vendorId)
        // Update local state by removing the unfollowed creator
        setFollowedCreatorsData((prev) =>
          prev.filter(
            (creator) => creator.vendor && creator.vendor.id !== vendorId
          )
        )
      } else {
        await Addfollower(vendorId)
        // Refresh followed creators list
        const followedData = await followerList()
        if (
          followedData &&
          followedData.follow &&
          followedData.follow.creators
        ) {
          setFollowedCreatorsData(followedData.follow.creators)
        }
      }
    } catch (error) {
      console.error("Error toggling follow status:", error)
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
    membershipTier: "Gold Fan",
    joinDate: customer?.created_at
      ? formatDate(customer.created_at)
      : "March 15, 2025",
    points: 2450,
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
          // ... other orders would be here
        ]

  // Sample notifications data
  const notifications = [
    {
      id: "notif-1",
      type: "shipping",
      title: "Your order is out for delivery",
      message: "Order #ORD-9876 is out for delivery and should arrive today.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: "notif-2",
      type: "creator",
      title: "New drop from Alex Rivera",
      message: "Check out the new Summer Tour Collection just released!",
      time: "1 day ago",
      read: true,
    },
    {
      id: "notif-3",
      type: "order",
      title: "Order confirmed",
      message:
        "Your order #ORD-9876 has been confirmed and is being processed.",
      time: "5 days ago",
      read: true,
    },
    {
      id: "notif-4",
      type: "membership",
      title: "You've reached Gold Fan status!",
      message: "Congratulations! You now have access to exclusive perks.",
      time: "2 weeks ago",
      read: true,
    },
  ]

  // Get wishlist items from API data
  const wishlistItemsData =
    wishlistData && wishlistData.length > 0
      ? wishlistData?.wishlist?.items.map((item) => ({
          id: item.id,
          name: item.product?.title || "Product",
          creator: item.product?.vendor?.name || "Creator",
          price: item.product?.variants[0]?.prices[0]?.amount || 0,
          image: item.product?.thumbnail || "/api/placeholder/300/300",
          inStock: item.product?.variants[0]?.inventory_quantity > 0,
        }))
      : [
          {
            id: "wl-1",
            name: "Neon Dreams Vinyl Box Set",
            creator: "Alex Rivera",
            price: 89.99,
            image: "/api/placeholder/300/300",
            inStock: true,
          },
          {
            id: "wl-2",
            name: "Limited Edition Tour Jacket",
            creator: "Maya Johnson",
            price: 129.99,
            image: "/api/placeholder/300/300",
            inStock: true,
          },
          {
            id: "wl-3",
            name: "Signed Poster",
            creator: "DJ Cosmos",
            price: 49.99,
            image: "/api/placeholder/300/300",
            inStock: false,
          },
          {
            id: "wl-4",
            name: "VIP Meet & Greet Package",
            creator: "Alex Rivera",
            price: 299.99,
            image: "/api/placeholder/300/300",
            inStock: true,
          },
        ]

  // Use upcoming events from state
  const upcomingEvents = upcomingEventsData

  // Format currency
  const formatPrice = (price) => {
    // Handle both cents (from API) and dollars (from mock data)
    const amount = price > 100 && Number.isInteger(price) ? price / 100 : price
    return `$${parseFloat(amount).toFixed(2)}`
  }

  // Get status color
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

  // Toggle order details
  const toggleOrderDetails = (orderId) => {
    if (activeOrder === orderId) {
      setActiveOrder(null)
    } else {
      setActiveOrder(orderId)
    }
  }

  // Helper function to get most recent order display
  const getRecentOrderDisplay = () => {
    if (!orders || orders.length === 0) return null

    const recentOrder = orders[0]

    // Handle both API and fallback data formats
    const orderId = recentOrder.display_id || recentOrder.id
    const orderDate = recentOrder.created_at
      ? new Date(recentOrder.created_at).toLocaleDateString()
      : recentOrder.date
    const orderStatus =
      recentOrder.status || recentOrder.fulfillment_status || "Processing"

    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center flex-shrink-0 bg-blue-100 rounded-full w-14 h-14">
          <Package size={24} className="text-blue-600" />
        </div>
        <div>
          <div className="font-medium">#{orderId}</div>
          <div className="mb-1 text-sm text-gray-600">{orderDate}</div>
          <div className="flex items-center">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-1 ${getStatusColor(
                orderStatus
              )}`}
            ></span>
            <span className="text-sm">{orderStatus}</span>
          </div>
        </div>
      </div>
    )
  }

  // Delete wishlist item
  const handleDeleteWishlistItem = async (itemId) => {
    try {
      await ItemDelete(itemId)
      // Update local state
      setWishlistData((prev) => prev.filter((item) => item.id !== itemId))
    } catch (error) {
      console.error("Error deleting wishlist item:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className=" px-4 py-8 ">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Sidebar Navigation */}
          <div className="w-full p-4 bg-white rounded-lg shadow-sm md:w-1/4 lg:w-1/5 h-fit">
            <div className="flex items-center gap-3 p-2 mb-6">
              <CustomerAvatar
                firstName={customer?.first_name || ""}
                lastName={customer?.last_name || ""}
                imageUrl={customer?.avatarImg || null}
                size={48}
                className="flex-shrink-0"
              />
              <div>
                <h2 className="font-semibold">{user.name}</h2>
                <div className="flex items-center">
                  <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                    {user.membershipTier}
                  </span>
                </div>
              </div>
            </div>

            <nav>
              <ul className="space-y-1">
                <li>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                      activeTab === "overview"
                        ? "bg-[#e65100] text-white"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("overview")}
                  >
                    <User size={18} />
                    <span>Dashboard</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                      activeTab === "orders"
                        ? "bg-[#e65100] text-white"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("orders")}
                  >
                    <Package size={18} />
                    <span>My Orders</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                      activeTab === "wishlist"
                        ? "bg-[#e65100] text-white"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("wishlist")}
                  >
                    <Heart size={18} />
                    <span>Wishlist</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                      activeTab === "membership"
                        ? "bg-[#e65100] text-white"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("membership")}
                  >
                    <Star size={18} />
                    <span>Fan Membership</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                      activeTab === "settings"
                        ? "bg-[#e65100] text-white"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings size={18} />
                    <span>Account Settings</span>
                  </button>
                </li>
              </ul>

              <div className="pt-6 mt-6 border-t">
                <button
                  className="flex items-center w-full gap-3 px-4 py-2 text-gray-700 transition rounded-lg hover:bg-gray-100"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  <LogOut size={18} />
                  <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content Area */}
          <main className="flex-grow">
            {/* Dashboard Overview */}
            {activeTab === "overview" && (
              <div>
                {/* Welcome Banner */}
                <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
                  <h1 className="mb-2 text-2xl font-bold">
                    Welcome back, {user.name.split(" ")[0]}!
                  </h1>
                  <p className="text-gray-600">
                    Here's what's happening with your orders and followed
                    creators.
                  </p>
                </div>

                {/* Stats/Quick Info */}
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                  <div className="p-5 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Recent Order</h3>
                      <button
                        className="text-sm text-[#e65100] hover:underline"
                        onClick={() => setActiveTab("orders")}
                      >
                        View All
                      </button>
                    </div>

                    {orders && orders.length > 0 ? (
                      getRecentOrderDisplay()
                    ) : (
                      <div className="text-sm text-gray-500">No orders yet</div>
                    )}
                  </div>

                  <div className="p-5 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Followed Creators</h3>
                      <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">
                        {user.following.length}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {user.following.map((creator) => (
                        <Link
                          key={creator.id || creator.vendor?.id}
                          href={`creator/${creator.vendor?.handle || ""}`}
                          className="flex flex-col items-center"
                        >
                          <div className="relative">
                            <Image
                              src={
                                creator.vendor?.logo
                                  ? creator.vendor?.logo
                                  : assets.rabit
                              }
                              alt={creator.vendor?.name || "Creator"}
                              className="object-cover w-10 h-10 rounded-full"
                              width={40}
                              height={40}
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                        </Link>
                      ))}
                      <Link
                        href="/ourcreators"
                        className="flex items-center justify-center w-10 h-10 text-gray-400 border-2 border-gray-300 border-dashed rounded-full hover:border-gray-400 hover:text-gray-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Tracking Latest Order */}
                {orders.length > 0 && orders[0].status !== "Delivered" && (
                  <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">
                        Track Your Order
                      </h2>
                      <span className="text-sm text-gray-500">
                        {orders[0].display_id || orders[0].id}
                      </span>
                    </div>

                    <div className="relative">
                      <div className="absolute left-0 ml-4 mt-2 h-full w-0.5 bg-gray-200"></div>

                      <div className="relative space-y-6">
                        {orders[0].timeline &&
                        Array.isArray(orders[0].timeline) ? (
                          orders[0].timeline.slice(0, 4).map((event, index) => (
                            <div key={index} className="flex">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 flex-shrink-0 ${
                                  index === 0
                                    ? "bg-[#e65100] text-white"
                                    : "bg-gray-200 text-gray-500"
                                }`}
                              >
                                {index === 0 ? (
                                  <Check size={16} />
                                ) : (
                                  <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                                )}
                              </div>

                              <div className="ml-4">
                                <div
                                  className={`font-medium ${
                                    index === 0
                                      ? "text-[#e65100]"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {event.status}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {event.date} • {event.time}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-3 text-center text-gray-500">
                            No tracking information available
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between mt-6">
                      <button
                        className="text-sm text-[#e65100] hover:underline flex items-center"
                        onClick={() => {
                          setActiveTab("orders")
                          setActiveOrder(orders[0].id)
                        }}
                      >
                        View full tracking history
                        <ChevronRight size={16} className="ml-1" />
                      </button>

                      {orders[0].carrier && orders[0].trackingNumber ? (
                        <a
                          href={`https://www.${orders[0].carrier.toLowerCase()}.com/track?tracknum=${
                            orders[0].trackingNumber
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 text-sm text-white transition bg-blue-500 rounded-md hover:bg-blue-600"
                        >
                          Track on {orders[0].carrier}
                        </a>
                      ) : (
                        <button className="px-4 py-2 text-sm text-white transition bg-gray-400 rounded-md cursor-not-allowed">
                          Tracking Unavailable
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Upcoming Events/Drops */}
                <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                      Upcoming from Creators You Follow
                    </h2>
                    <button className="text-sm text-[#e65100] hover:underline">
                      View Calendar
                    </button>
                  </div>

                  {user.following && user.following.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center p-3 transition border border-gray-100 rounded-lg hover:border-gray-200"
                        >
                          <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mr-4 bg-gray-100 rounded-lg">
                            {event.type === "merch-drop" ? (
                              <ShoppingBag
                                size={20}
                                className="text-[#e65100]"
                              />
                            ) : (
                              <Calendar size={20} className="text-purple-600" />
                            )}
                          </div>

                          <div className="flex-grow">
                            <div className="flex items-center mb-1 text-xs text-gray-500">
                              <span>{event.creator}</span>
                              <span className="mx-2">•</span>
                              <span>
                                {event.type === "merch-drop"
                                  ? "Merchandise Drop"
                                  : "Livestream Event"}
                              </span>
                            </div>
                            <div className="font-medium">{event.title}</div>
                            <div className="flex items-center text-sm">
                              <Calendar
                                size={14}
                                className="mr-1 text-gray-400"
                              />
                              <span className="text-gray-600">
                                {event.date}
                              </span>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="text-[#e65100]">
                                {event.countdown} days left
                              </span>
                            </div>
                          </div>

                          <button className="ml-4 px-3 py-1 text-xs border border-[#e65100] text-[#e65100] rounded-full hover:bg-[#e65100] hover:text-white transition">
                            Remind Me
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-gray-50 rounded-lg">
                      <p className="text-gray-500 mb-3">
                        You're not following any creators yet
                      </p>
                      <Link
                        href="/ourcreators"
                        className="inline-flex items-center gap-2 text-[#e65100] hover:underline"
                      >
                        <span>Discover creators</span>
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Wishlist Preview */}
                <div className="p-6 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Your Wishlist</h2>
                    <button
                      className="text-sm text-[#e65100] hover:underline"
                      onClick={() => setActiveTab("wishlist")}
                    >
                      View All
                    </button>
                  </div>

                  <div className="">
                    <WishlistProducts isEmbedded={true} />
                  </div>
                </div>
              </div>
            )}

            {/* Orders History */}
            {activeTab === "orders" && (
              <div>
                <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">My Orders</h1>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search orders..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                      />
                      <Search
                        className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                        size={18}
                      />
                    </div>
                  </div>

                  {/* Using OrderOverview component for API orders */}
                  {customer?.orders?.length > 0 || ordersData.length > 0 ? (
                    <OrderOverview
                      orders={
                        customer?.orders?.length > 0
                          ? customer.orders
                          : ordersData
                      }
                    />
                  ) : (
                    <div className="w-full flex flex-col items-center gap-y-4 py-8">
                      <h2 className="text-large-semi">Nothing to see here</h2>
                      <p className="text-base-regular text-center">
                        You don&apos;t have any orders yet, let&apos;s change
                        that :)
                      </p>
                      <div className="mt-4">
                        <Link href="/">
                          <Button className="px-6 py-3 bg-[#e65100] text-white rounded-lg hover:bg-[#d84315] transition">
                            Continue shopping
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Fallback to default order display if needed */}
                  {!customer?.orders &&
                    !ordersData.length &&
                    orders &&
                    orders.length > 0 && (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="overflow-hidden border border-gray-200 rounded-lg"
                          >
                            {/* Order Header */}
                            <div
                              className="flex flex-col gap-4 p-4 border-b cursor-pointer bg-gray-50 md:flex-row md:items-center"
                              onClick={() => toggleOrderDetails(order.id)}
                            >
                              <div className="flex-grow">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                  <h3 className="font-semibold">{order.id}</h3>
                                  <span className="text-sm text-gray-500">
                                    {order.date ||
                                      new Date(
                                        order.created_at
                                      ).toLocaleDateString()}
                                  </span>
                                  <div
                                    className={`px-2 py-0.5 text-white text-xs rounded-full ${getStatusColor(
                                      order.status ||
                                        order.fulfillment_status ||
                                        "Processing"
                                    )}`}
                                  >
                                    {order.status ||
                                      order.fulfillment_status ||
                                      "Processing"}
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Package size={14} className="mr-1" />
                                    <span>
                                      {order.items?.length || 0}{" "}
                                      {(order.items?.length || 0) === 1
                                        ? "item"
                                        : "items"}
                                    </span>
                                  </div>

                                  <div className="flex items-center">
                                    <CreditCard size={14} className="mr-1" />
                                    <span>
                                      {order.paymentMethod || "Credit Card"}
                                    </span>
                                  </div>

                                  <div className="font-medium">
                                    Total: {formatPrice(order.total)}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 md:self-start">
                                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                                  <Eye size={16} />
                                </button>

                                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                                  <Download size={16} />
                                </button>

                                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                                  <ChevronDown
                                    size={16}
                                    className={`transform transition ${
                                      activeOrder === order.id
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>

                            {/* Order Details (collapsible) */}
                            {activeOrder === order.id && (
                              <div className="p-4">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                  {/* Order Items */}
                                  <div className="md:col-span-2">
                                    <h4 className="mb-3 font-medium">
                                      Order Items
                                    </h4>
                                    <div className="space-y-3">
                                      {order.items?.map((item) => (
                                        <div
                                          key={item.id}
                                          className="flex gap-3 p-3 border border-gray-100 rounded-lg"
                                        >
                                          <img
                                            src={item.thumbnail || item.image}
                                            alt={item.title || item.name}
                                            className="object-cover w-16 h-16 rounded"
                                          />

                                          <div className="flex-grow">
                                            <div className="flex justify-between">
                                              <div>
                                                <h5 className="font-medium">
                                                  {item.title || item.name}
                                                </h5>
                                                <p className="text-sm text-gray-500">
                                                  {item.variant?.product?.vendor
                                                    ?.name ||
                                                    item.creator ||
                                                    "Creator"}
                                                </p>
                                              </div>
                                              <div className="text-right">
                                                <div>
                                                  {formatPrice(
                                                    item.unit_price
                                                      ? item.unit_price *
                                                          item.quantity
                                                      : item.price *
                                                          item.quantity
                                                  )}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                  {item.quantity} ×{" "}
                                                  {formatPrice(
                                                    item.unit_price ||
                                                      item.price
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            <div className="flex gap-2 mt-2">
                                              {(item.title || item.name)
                                                .toLowerCase()
                                                .includes("digital") ? (
                                                <button className="text-xs text-[#e65100] hover:underline flex items-center">
                                                  <Download
                                                    size={12}
                                                    className="mr-1"
                                                  />
                                                  Download
                                                </button>
                                              ) : (
                                                <>
                                                  <button className="text-xs text-[#e65100] hover:underline">
                                                    Buy Again
                                                  </button>
                                                  <button className="text-xs text-gray-600 hover:underline">
                                                    Review
                                                  </button>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Order Timeline */}
                                    {order.timeline &&
                                      Array.isArray(order.timeline) && (
                                        <>
                                          <h4 className="mt-6 mb-3 font-medium">
                                            Tracking History
                                          </h4>
                                          <div className="relative pb-2 pl-6">
                                            <div className="absolute left-0 top-1 bottom-0 w-0.5 bg-gray-200"></div>

                                            <div className="space-y-4">
                                              {order.timeline.map(
                                                (event, index) => (
                                                  <div
                                                    key={index}
                                                    className="relative"
                                                  >
                                                    <div
                                                      className={`absolute left-0 w-3 h-3 rounded-full -ml-1.5 ${
                                                        index === 0
                                                          ? "bg-[#e65100]"
                                                          : "bg-gray-300"
                                                      }`}
                                                    ></div>
                                                    <div className="pl-4">
                                                      <div
                                                        className={`font-medium ${
                                                          index === 0
                                                            ? "text-[#e65100]"
                                                            : ""
                                                        }`}
                                                      >
                                                        {event.status}
                                                      </div>
                                                      <div className="text-sm text-gray-500">
                                                        {event.date} •{" "}
                                                        {event.time}
                                                      </div>
                                                    </div>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        </>
                                      )}
                                  </div>

                                  {/* Order Information */}
                                  <div className="md:col-span-1">
                                    <div className="space-y-6">
                                      {/* Shipping Address */}
                                      <div>
                                        <h4 className="mb-2 font-medium">
                                          Shipping Address
                                        </h4>
                                        <div className="p-3 text-sm rounded-lg bg-gray-50">
                                          <div className="font-medium">
                                            {order.shipping_address
                                              ?.first_name ||
                                              order.shippingAddress?.name ||
                                              `${customer?.first_name || ""} ${
                                                customer?.last_name || ""
                                              }`}
                                          </div>
                                          <div>
                                            {order.shipping_address
                                              ?.address_1 ||
                                              order.shippingAddress?.street}
                                          </div>
                                          <div>
                                            {order.shipping_address?.city ||
                                              order.shippingAddress?.city}
                                            ,{" "}
                                            {order.shipping_address?.province ||
                                              order.shippingAddress?.state}{" "}
                                            {order.shipping_address
                                              ?.postal_code ||
                                              order.shippingAddress?.zipCode}
                                          </div>
                                          <div>
                                            {order.shipping_address
                                              ?.country_code ||
                                              order.shippingAddress?.country}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Payment Method */}
                                      <div>
                                        <h4 className="mb-2 font-medium">
                                          Payment Method
                                        </h4>
                                        <div className="p-3 text-sm rounded-lg bg-gray-50">
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-5 bg-blue-600 rounded-sm"></div>
                                            <div>
                                              {order.paymentMethod ||
                                                "Credit Card"}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Order Summary */}
                                      <div>
                                        <h4 className="mb-2 font-medium">
                                          Order Summary
                                        </h4>
                                        <div className="p-3 text-sm rounded-lg bg-gray-50">
                                          <div className="space-y-2">
                                            <div className="flex justify-between">
                                              <span>Subtotal:</span>
                                              <span>
                                                {formatPrice(
                                                  order.subtotal ||
                                                    order.total - 10
                                                )}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>Shipping:</span>
                                              <span>
                                                {formatPrice(
                                                  order.shipping_total || 10
                                                )}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>Tax:</span>
                                              <span>
                                                {order.tax_total
                                                  ? formatPrice(order.tax_total)
                                                  : "Included"}
                                              </span>
                                            </div>
                                            <div className="flex justify-between pt-2 mt-2 font-medium border-t">
                                              <span>Total:</span>
                                              <span>
                                                {formatPrice(order.total)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="space-y-2">
                                        {order.status !== "Delivered" &&
                                          order.carrier &&
                                          order.trackingNumber && (
                                            <a
                                              href={`https://www.${order.carrier.toLowerCase()}.com/track?tracknum=${
                                                order.trackingNumber
                                              }`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="block w-full py-2 text-center text-white transition bg-blue-500 rounded-lg hover:bg-blue-600"
                                            >
                                              Track Package
                                            </a>
                                          )}

                                        {order.status === "Delivered" && (
                                          <button className="block w-full py-2 text-center transition border border-gray-300 rounded-lg hover:bg-gray-50">
                                            Return Items
                                          </button>
                                        )}

                                        <button className="block w-full py-2 text-center transition border border-gray-300 rounded-lg hover:bg-gray-50">
                                          Contact Support
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Wishlist */}
            {activeTab === "wishlist" && <WishlistProducts isEmbedded={true} />}

            {/* Fan Membership */}
            {activeTab === "membership" && (
              <div>
                <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-sm">
                  {/* Membership Header */}
                  <div className="bg-gradient-to-r from-[#e65100] to-[#ff9800] text-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="mb-2 text-2xl font-bold">
                          Gold Fan Status
                        </h1>
                        <p>Unlocking exclusive perks since {user.joinDate}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-bold">{user.points}</div>
                        <div>Fan Points</div>
                      </div>
                    </div>
                  </div>

                  {/* Membership Progress */}
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        Current Tier: Gold Fan
                      </span>
                      <span className="text-sm text-gray-500">
                        50 points until Platinum Fan
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <div
                        className="bg-[#e65100] h-2.5 rounded-full"
                        style={{ width: "83%" }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span>Silver Fan</span>
                      <span>Gold Fan</span>
                      <span>Platinum Fan</span>
                      <span>Diamond Fan</span>
                    </div>
                  </div>

                  {/* Membership Benefits */}
                  <div className="p-6">
                    <h2 className="mb-4 text-lg font-semibold">
                      Your Gold Fan Benefits
                    </h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-start p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-4 bg-yellow-100 rounded-full">
                          <Clock size={20} className="text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="mb-1 font-medium">Early Access</h3>
                          <p className="text-sm text-gray-600">
                            Get access to new merchandise 24 hours before
                            general release
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-4 bg-green-100 rounded-full">
                          <Gift size={20} className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="mb-1 font-medium">
                            Exclusive Content
                          </h3>
                          <p className="text-sm text-gray-600">
                            Access behind-the-scenes content from your favorite
                            creators
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-4 bg-purple-100 rounded-full">
                          <Star size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <h3 className="mb-1 font-medium">
                            Points Multiplier
                          </h3>
                          <p className="text-sm text-gray-600">
                            Earn 2x fan points on all purchases, limited drops,
                            and events
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-4 bg-blue-100 rounded-full">
                          <Truck size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="mb-1 font-medium">Free Shipping</h3>
                          <p className="text-sm text-gray-600">
                            Free standard shipping on all orders over $35
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="mb-3 font-medium">
                        Next Tier: Platinum Fan (2,500 points)
                      </h3>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start">
                            <span className="text-[#e65100] mr-2">•</span>
                            <span>
                              Exclusive virtual meet & greets with select
                              creators
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#e65100] mr-2">•</span>
                            <span>3x points multiplier on purchases</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#e65100] mr-2">•</span>
                            <span>Free expedited shipping on all orders</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#e65100] mr-2">•</span>
                            <span>
                              Monthly exclusive drops only for Platinum and
                              Diamond fans
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Points History */}
                <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold">Points History</h2>

                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Activity</th>
                          <th className="px-4 py-3 text-right">Points</th>
                          <th className="px-4 py-3 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="px-4 py-3 text-sm">March 15, 2025</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">Purchase</div>
                            <div className="text-sm text-gray-500">
                              Order #ORD-9876
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-green-600">
                            +160
                          </td>
                          <td className="px-4 py-3 font-medium text-right">
                            2,450
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm">March 10, 2025</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">Review Bonus</div>
                            <div className="text-sm text-gray-500">
                              Art Print by Maya Johnson
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-green-600">
                            +50
                          </td>
                          <td className="px-4 py-3 font-medium text-right">
                            2,290
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm">
                            February 28, 2025
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">Purchase</div>
                            <div className="text-sm text-gray-500">
                              Order #ORD-9875
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-green-600">
                            +260
                          </td>
                          <td className="px-4 py-3 font-medium text-right">
                            2,240
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm">
                            February 15, 2025
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">
                              Social Share Bonus
                            </div>
                            <div className="text-sm text-gray-500">
                              Shared purchase on Instagram
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-green-600">
                            +25
                          </td>
                          <td className="px-4 py-3 font-medium text-right">
                            1,980
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm">
                            January 15, 2025
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">Purchase</div>
                            <div className="text-sm text-gray-500">
                              Order #ORD-9738
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-green-600">
                            +72
                          </td>
                          <td className="px-4 py-3 font-medium text-right">
                            1,955
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Fan Exclusives */}
                <div className="p-6 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                      Available Fan Exclusives
                    </h2>
                    <span className="px-3 py-1 text-sm text-yellow-800 bg-yellow-100 rounded-full">
                      Gold Access
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="overflow-hidden border border-gray-200 rounded-lg group"
                      >
                        <div className="relative aspect-video">
                          <img
                            src={`/api/placeholder/${400}/${225}`}
                            alt={`Exclusive ${item}`}
                            className="object-cover w-full h-full transition duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                          <div className="absolute bottom-0 left-0 w-full p-4">
                            <div className="font-medium text-white">
                              Exclusive Content {item}
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">
                              Creator Name
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                              Gold+
                            </span>
                          </div>

                          <button className="w-full py-2 bg-[#e65100] text-white rounded text-sm font-medium hover:bg-[#d84315] transition">
                            Access Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Account Settings */}
            {activeTab === "settings" && (
              <div>
                <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
                  <h1 className="mb-6 text-2xl font-bold">Account Settings</h1>

                  {/* Profile Settings */}
                  <div className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold">
                      Profile Information
                    </h2>

                    <div className="flex flex-col gap-6 md:flex-row">
                      <div className="md:w-3/4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                              First Name
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                              defaultValue={customer?.first_name || ""}
                            />
                          </div>

                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                              Last Name
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                              defaultValue={customer?.last_name || ""}
                            />
                          </div>

                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                              Email Address
                            </label>
                            <input
                              type="email"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                              defaultValue={customer?.email || ""}
                            />
                          </div>

                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                              defaultValue={customer?.phone || ""}
                            />
                          </div>
                        </div>

                        <div className="mt-6">
                          <button className="px-6 py-2 bg-[#e65100] text-white rounded-lg hover:bg-[#d84315] transition">
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Password Settings */}
                  <div className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold">
                      Change Password
                    </h2>

                    <div className="max-w-lg">
                      <div className="space-y-4">
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                            placeholder="••••••••"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                            placeholder="••••••••"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <button className="px-6 py-2 bg-[#e65100] text-white rounded-lg hover:bg-[#d84315] transition">
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Saved Addresses</h2>
                      <button
                        className="flex items-center px-4 py-2 text-sm transition border border-gray-300 rounded-lg hover:bg-gray-50"
                        onClick={() => setShowNewAddressForm(true)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Add New Address
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {user.addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`p-4 border rounded-lg relative ${
                            address.default
                              ? "border-[#e65100]"
                              : "border-gray-200"
                          }`}
                        >
                          {address.default && (
                            <span className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-[#e65100] text-white rounded">
                              Default
                            </span>
                          )}

                          <div className="mb-1 font-medium">{address.name}</div>
                          <div className="text-sm text-gray-600">
                            <div>{address.street || address.address_1}</div>
                            <div>
                              {address.city},{" "}
                              {address.state || address.province}{" "}
                              {address.zipCode || address.postal_code}
                            </div>
                            <div>{address.country}</div>
                            <div className="mt-1">{address.phone}</div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <button
                              className="text-sm text-gray-600 hover:text-gray-900"
                              onClick={() => {
                                setEditingAddress(address)
                                setShowEditAddressForm(true)
                              }}
                            >
                              Edit
                            </button>
                            <span className="text-gray-300">|</span>
                            <button className="text-sm text-gray-600 hover:text-gray-900">
                              Delete
                            </button>
                            {!address.default && (
                              <>
                                <span className="text-gray-300">|</span>
                                <button className="text-sm text-[#e65100] hover:text-[#d84315]">
                                  Set as Default
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Payment Methods</h2>
                      <button className="flex items-center px-4 py-2 text-sm transition border border-gray-300 rounded-lg hover:bg-gray-50">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Add Payment Method
                      </button>
                    </div>

                    <div className="space-y-4">
                      {user.paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`p-4 border rounded-lg relative ${
                            method.default
                              ? "border-[#e65100]"
                              : "border-gray-200"
                          }`}
                        >
                          {method.default && (
                            <span className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-[#e65100] text-white rounded">
                              Default
                            </span>
                          )}

                          <div className="flex items-center">
                            <div className="w-10 h-6 mr-3 bg-blue-600 rounded"></div>
                            <div>
                              <div className="font-medium">
                                {method.type === "visa" ? "Visa" : "Mastercard"}{" "}
                                ending in {method.lastFour}
                              </div>
                              <div className="text-sm text-gray-600">
                                Expires {method.expiryDate}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <button className="text-sm text-gray-600 hover:text-gray-900">
                              Edit
                            </button>
                            <span className="text-gray-300">|</span>
                            <button className="text-sm text-gray-600 hover:text-gray-900">
                              Delete
                            </button>
                            {!method.default && (
                              <>
                                <span className="text-gray-300">|</span>
                                <button className="text-sm text-[#e65100] hover:text-[#d84315]">
                                  Set as Default
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div>
                    <h2 className="mb-4 text-lg font-semibold">
                      Notification Preferences
                    </h2>

                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Order Updates</h3>
                            <p className="text-sm text-gray-600">
                              Receive notifications about your order status and
                              tracking
                            </p>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              value=""
                              className="sr-only peer"
                              defaultChecked
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e65100]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e65100]"></div>
                          </label>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Creator Updates</h3>
                            <p className="text-sm text-gray-600">
                              Receive notifications when creators you follow
                              release new merchandise
                            </p>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              value=""
                              className="sr-only peer"
                              defaultChecked
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e65100]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e65100]"></div>
                          </label>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Membership Rewards</h3>
                            <p className="text-sm text-gray-600">
                              Receive notifications about points earned and
                              special offers
                            </p>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              value=""
                              className="sr-only peer"
                              defaultChecked
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e65100]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e65100]"></div>
                          </label>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">
                              Marketing Communications
                            </h3>
                            <p className="text-sm text-gray-600">
                              Receive newsletters and promotional offers from
                              Junooni
                            </p>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              value=""
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e65100]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e65100]"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button className="px-6 py-2 bg-[#e65100] text-white rounded-lg hover:bg-[#d84315] transition">
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default CustomerAccount
