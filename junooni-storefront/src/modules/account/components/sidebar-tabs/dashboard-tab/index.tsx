import React from "react"
import {
  Package,
  ShoppingBag,
  Calendar,
  ChevronRight,
  Check,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { WishlistProducts } from "@modules/wishlists/components/wishlistProducts"

const DashboardTab = ({
  user,
  orders,
  getStatusColor,
  setActiveTab,
  setActiveOrder,
  upcomingEvents,
}) => {
  // Add safety checks for null/undefined values
  const safeUser = user || { name: "Customer", following: [] }
  const safeOrders = orders || []
  const safeUpcomingEvents = upcomingEvents || []

  // Helper function to get most recent order display
  const getRecentOrderDisplay = () => {
    if (!safeOrders || safeOrders.length === 0) return null

    const recentOrder = safeOrders[0]

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
              className={`inline-block w-2 h-2 rounded-full mr-1 ${
                getStatusColor ? getStatusColor(orderStatus) : "bg-gray-500"
              }`}
            ></span>
            <span className="text-sm">{orderStatus}</span>
          </div>
        </div>
      </div>
    )
  }

  // Get the first name safely
  const firstName = safeUser.name ? safeUser.name.split(" ")[0] : "Customer"

  return (
    <div>
      {/* Welcome Banner */}
      <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">Welcome back, {firstName}!</h1>
        <p className="text-gray-600">
          Here's what's happening with your orders and followed creators.
        </p>
      </div>

      {/* Stats/Quick Info */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
        <div className="p-5 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Recent Order</h3>
            <button className="text-sm text-[#e65100] hover:underline">
              View All
            </button>
          </div>

          {safeOrders && safeOrders.length > 0 ? (
            getRecentOrderDisplay()
          ) : (
            <div className="text-sm text-gray-500">No orders yet</div>
          )}
        </div>

        <div className="p-5 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Followed Creators</h3>
            <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">
              {safeUser.following ? safeUser.following.length : 0}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {safeUser.following &&
              safeUser.following.map((creator) => (
                <Link
                  key={
                    creator.id || creator.vendor?.id || Math.random().toString()
                  }
                  href={`/creator/${creator.vendor?.handle || ""}`}
                  className="flex flex-col items-center"
                >
                  <div className="relative">
                    <Image
                      src={
                        creator.vendor?.logo
                          ? creator.vendor?.logo
                          : "/api/placeholder/40/40"
                      }
                      alt={creator.vendor?.name || "Creator"}
                      className="object-cover w-10 h-10 rounded-full"
                      width={40}
                      height={40}
                    />
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
      {safeOrders.length > 0 && safeOrders[0].status !== "Delivered" && (
        <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Track Your Order</h2>
            <span className="text-sm text-gray-500">
              {safeOrders[0].display_id || safeOrders[0].id}
            </span>
          </div>

          <div className="relative">
            <div className="absolute left-0 ml-4 mt-2 h-full w-0.5 bg-gray-200"></div>

            <div className="relative space-y-6">
              {safeOrders[0].timeline &&
              Array.isArray(safeOrders[0].timeline) ? (
                safeOrders[0].timeline.slice(0, 4).map((event, index) => (
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
                          index === 0 ? "text-[#e65100]" : "text-gray-800"
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
                if (setActiveTab) setActiveTab("orders")
                if (setActiveOrder) setActiveOrder(safeOrders[0].id)
              }}
            >
              View full tracking history
              <ChevronRight size={16} className="ml-1" />
            </button>

            {safeOrders[0].carrier && safeOrders[0].trackingNumber ? (
              <a
                href={`https://www.${safeOrders[0].carrier.toLowerCase()}.com/track?tracknum=${
                  safeOrders[0].trackingNumber
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm text-white transition bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Track on {safeOrders[0].carrier}
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

        {safeUser.following && safeUser.following.length > 0 ? (
          <div className="space-y-4">
            {safeUpcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center p-3 transition border border-gray-100 rounded-lg hover:border-gray-200"
              >
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mr-4 bg-gray-100 rounded-lg">
                  {event.type === "merch-drop" ? (
                    <ShoppingBag size={20} className="text-[#e65100]" />
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
                    <Calendar size={14} className="mr-1 text-gray-400" />
                    <span className="text-gray-600">{event.date}</span>
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
          <div className="p-6 text-center rounded-lg bg-gray-50">
            <p className="mb-3 text-gray-500">
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
            onClick={() => setActiveTab && setActiveTab("/account/wishlist")}
          >
            View All
          </button>
        </div>

        <div className="">
          <WishlistProducts isEmbedded={true} />
        </div>
      </div>
    </div>
  )
}

export default DashboardTab
