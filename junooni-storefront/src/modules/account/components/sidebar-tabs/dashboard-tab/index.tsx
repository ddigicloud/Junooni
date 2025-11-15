// import React, { useState } from "react"
// import {
//   Package,
//   ShoppingBag,
//   Calendar,
//   ChevronRight,
//   Check,
// } from "lucide-react"
// import Link from "next/link"
// import Image from "next/image"
// import { WishlistProducts } from "@modules/wishlists/components/wishlistProducts"
// import LocalizedClientLink from "@modules/common/components/localized-client-link"

// /**
//  * CreatorAvatar Component
//  * Fixed version that ensures consistent sizing between images and initials
//  */
// const CreatorAvatar = ({ creator, size = 40 }) => {
//   const [imageError, setImageError] = useState(false)
//   const [isLoading, setIsLoading] = useState(true)
  
//   // Extract vendor information with safe fallbacks
//   const vendorName = creator.vendor?.name || "Creator"
//   const nameParts = vendorName.split(" ")
//   const firstName = nameParts[0] || ""
//   const lastName = nameParts.slice(1).join(" ") || ""

//   // Helper function to generate initials
//   const getInitials = (firstName, lastName) => {
//     let initials = ""
    
//     if (firstName) initials += firstName.charAt(0).toUpperCase()
//     if (lastName) initials += lastName.charAt(0).toUpperCase()
    
//     return initials || "C" // "C" for Creator
//   }

//   // Helper function to generate a consistent color based on name
//   const getAvatarColor = (name) => {
//     let hash = 0
//     if (!name) return "#e65100" // Default brand color

//     for (let i = 0; i < name.length; i++) {
//       hash = name.charCodeAt(i) + ((hash << 5) - hash)
//     }

//     let color = "#"
//     for (let i = 0; i < 3; i++) {
//       const value = (hash >> (i * 8)) & 0xff
//       color += ("00" + value.toString(16)).substr(-2)
//     }

//     return color
//   }

//   // Generate initials and color for the fallback display
//   const initials = getInitials(firstName, lastName)
//   const bgColor = getAvatarColor(vendorName)
  
//   // Calculate proportional font size
//   const fontSize = Math.max(Math.floor(size * 0.4), 12)

//   // Check if we should display an image or initials
//   const hasValidLogo = creator.vendor?.logo && !imageError

//   // Common container styles for both image and initials
//   const containerStyle = {
//     width: size,
//     height: size,
//     position: 'relative',
//     overflow: 'hidden',
//     borderRadius: '50%',
//     flexShrink: 0
//   }

//   return (
//     <div style={containerStyle}>
//       {hasValidLogo ? (
//         <div style={{ width: '100%', height: '100%', position: 'relative' }}>
//           <Image
//             src={creator.vendor.logo}
//             alt={vendorName}
//             fill
//             className="object-cover"
//             sizes={`${size}px`}
//             onLoad={() => setIsLoading(false)}
//             onError={() => {
//               setImageError(true)
//               setIsLoading(false)
//             }}
//             style={{
//               opacity: isLoading ? 0 : 1,
//               transition: 'opacity 0.2s ease-in-out',
//               objectFit: 'cover'
//             }}
//           />
//         </div>
//       ) : (
//         <div
//           className="flex items-center justify-center font-medium text-white"
//           style={{
//             backgroundColor: bgColor,
//             fontSize: `${fontSize}px`,
//             width: '100%',
//             height: '100%',
//             position: 'absolute',
//             top: 0,
//             left: 0
//           }}
//         >
//           {initials}
//         </div>
//       )}
//     </div>
//   )
// }

// /**
//  * DashboardTab Component
//  * The main dashboard view for customer accounts, showing recent orders, 
//  * followed creators, and upcoming events.
//  */
// const DashboardTab = ({
//   user,
//   orders,
//   getStatusColor,
//   setActiveTab,
//   setActiveOrder,
//   upcomingEvents,
// }) => {
//   // Add safety checks for null/undefined values
//   const safeUser = user || { name: "Customer", following: [] }
//   const safeOrders = orders || []
//   const safeUpcomingEvents = upcomingEvents || []
//   //console.log("Safe Orders:", safeOrders)
//   //console.log("Original Orders:", orders)
//   //console.log("Order fulfillment status:", safeOrders.length > 0 ? safeOrders[0].fulfillment_status : "N/A")

//   // Helper function to get most recent order display
//   // This handles both API and fallback data formats
//   const getRecentOrderDisplay = () => {
//     if (!safeOrders || safeOrders.length === 0) return null

//     const recentOrder = safeOrders[0]

//     // Extract order information with proper fallbacks
//     const orderId = recentOrder.display_id || recentOrder.id
//     const orderDate = recentOrder.created_at
//       ? new Date(recentOrder.created_at).toLocaleDateString()
//       : recentOrder.date
//     const orderStatus =
//       recentOrder.status || recentOrder.fulfillment_status || "Processing"

//     return (
//       <div className="flex items-center gap-4">
//         <div className="flex items-center justify-center flex-shrink-0 bg-blue-100 rounded-full w-14 h-14">
//           <Package size={24} className="text-orange-600" />
//         </div>
//         <div>
//           <div className="font-medium">#{orderId}</div>
//           <div className="mb-1 text-sm text-gray-600">{orderDate}</div>
//           <div className="flex items-center">
//             <span
//               className={`inline-block w-2 h-2 rounded-full mr-1 ${
//                 getStatusColor ? getStatusColor(orderStatus) : "bg-gray-500"
//               }`}
//             ></span>
//             <span className="text-sm">{orderStatus}</span>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Get the first name safely
//   const firstName = safeUser.name ? safeUser.name.split(" ")[0] : "Customer"

//   return (
//     <div>
//       {/* Welcome Banner */}
//       <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
//         <h1 className="mb-2 text-2xl font-bold">Welcome back, {firstName}!</h1>
//         <p className="text-gray-600">
//           Here's what's happening with your orders and followed creators.
//         </p>
//       </div>

//       {/* Stats/Quick Info */}
//       <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
//         <div className="p-5 bg-white rounded-lg shadow-sm">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-medium">Recent Order</h3>
//             {/* Updated View All button to navigate to orders page */}
//             <LocalizedClientLink 
//               href="/account/orders"
//               className="text-sm text-[#e65100] hover:underline"
//             >
//               View All
//             </LocalizedClientLink>
//           </div>

//           {safeOrders && safeOrders.length > 0 ? (
//             getRecentOrderDisplay()
//           ) : (
//             <div className="text-sm text-gray-500">No orders yet</div>
//           )}
//         </div>

//         <div className="p-5 bg-white rounded-lg shadow-sm">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-medium">Followed Creators</h3>
//             <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">
//               {safeUser.following ? safeUser.following.length : 0}
//             </span>
//           </div>

//           <div className="flex flex-wrap gap-2">
//             {safeUser.following &&
//               safeUser.following.map((creator) => (
//                 <Link
//                   key={
//                     creator.id || creator.vendor?.id || Math.random().toString()
//                   }
//                   href={`/creator/${creator.vendor?.handle || ""}`}
//                   className="flex flex-col items-center"
//                 >
//                   <CreatorAvatar creator={creator} size={40} />
//                 </Link>
//               ))}
//             <Link
//               href="/ourcreators"
//               className="flex items-center justify-center w-10 h-10 text-gray-400 border-2 border-gray-300 border-dashed rounded-full hover:border-gray-400 hover:text-gray-500"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="w-5 h-5"
//                 viewBox="0 0 20 20"
//                 fill="currentColor"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Tracking Latest Order */}
//       {safeOrders.length > 0 && safeOrders[0].status !== "Delivered" && (
//         <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold">Track Your Order</h2>
//             <span className="text-sm text-gray-500">
//               {safeOrders[0].display_id || safeOrders[0].id}
//             </span>
//           </div>

//           <div className="relative">
//             <div className="absolute left-0 ml-4 mt-2 h-full w-0.5 bg-gray-200"></div>

//             <div className="relative space-y-6">
//               {safeOrders[0].timeline &&
//               Array.isArray(safeOrders[0].timeline) ? (
//                 safeOrders[0].timeline.slice(0, 4).map((event, index) => (
//                   <div key={index} className="flex">
//                     <div
//                       className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 flex-shrink-0 ${
//                         index === 0
//                           ? "bg-[#e65100] text-white"
//                           : "bg-gray-200 text-gray-500"
//                       }`}
//                     >
//                       {index === 0 ? (
//                         <Check size={16} />
//                       ) : (
//                         <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
//                       )}
//                     </div>

//                     <div className="ml-4">
//                       <div
//                         className={`font-medium ${
//                           index === 0 ? "text-[#e65100]" : "text-gray-800"
//                         }`}
//                       >
//                         {event.status}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {event.date} • {event.time}
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="py-3 text-center text-gray-500">
//                   No tracking information available
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="flex justify-between mt-6">
//             <button
//               className="text-sm text-[#e65100] hover:underline flex items-center"
//               onClick={() => {
//                 if (setActiveTab) setActiveTab("orders")
//                 if (setActiveOrder) setActiveOrder(safeOrders[0].id)
//               }}
//             >
//               View full tracking history
//               <ChevronRight size={16} className="ml-1" />
//             </button>

//             {safeOrders[0].carrier && safeOrders[0].trackingNumber ? (
//               <a
//                 href={`https://www.${safeOrders[0].carrier.toLowerCase()}.com/track?tracknum=${
//                   safeOrders[0].trackingNumber
//                 }`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="px-4 py-2 text-sm text-white transition bg-blue-500 rounded-md hover:bg-blue-600"
//               >
//                 Track on {safeOrders[0].carrier}
//               </a>
//             ) : (
//               <button className="px-4 py-2 text-sm text-white transition bg-gray-400 rounded-md cursor-not-allowed">
//                 Tracking Unavailable
//               </button>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Upcoming Events/Drops */}
//       {/* <div className="p-4 mb-4 bg-white rounded-lg shadow-sm sm:p-6 sm:mb-6">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-base font-semibold sm:text-lg">
//             Upcoming from Creators You Follow
//           </h2>
//           <button className="text-xs text-[#e65100] hover:underline sm:text-sm">
//             View Calendar
//           </button>
//         </div>

//         {safeUser.following && safeUser.following.length > 0 ? (
//           <div className="space-y-3 sm:space-y-4">
//             {safeUpcomingEvents.map((event) => (
//               <div
//                 key={event.id}
//                 className="flex flex-col p-3 transition border border-gray-100 rounded-lg hover:border-gray-200 sm:flex-row sm:items-center"
//               >
//                 <div className="flex items-start mb-3 sm:items-center sm:mb-0">
//                   <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-3 bg-gray-100 rounded-lg sm:w-12 sm:h-12 sm:mr-4">
//                     {event.type === "merch-drop" ? (
//                       <ShoppingBag size={18} className="text-[#e65100] sm:w-5 sm:h-5" />
//                     ) : (
//                       <Calendar size={18} className="text-purple-600 sm:w-5 sm:h-5" />
//                     )}
//                   </div>

//                   <div className="flex-grow min-w-0">
//                     <div className="flex items-center mb-1 text-xs text-gray-500">
//                       <span className="truncate">{event.creator}</span>
//                       <span className="mx-2">•</span>
//                       <span className="text-xs">
//                         {event.type === "merch-drop"
//                           ? "Merchandise Drop"
//                           : "Livestream Event"}
//                       </span>
//                     </div>
//                     <div className="text-sm font-medium truncate sm:text-base">
//                       {event.title}
//                     </div>
//                     <div className="flex items-center text-xs sm:text-sm">
//                       <Calendar size={12} className="mr-1 text-gray-400 sm:w-3.5 sm:h-3.5" />
//                       <span className="text-gray-600">{event.date}</span>
//                       <span className="mx-2 text-gray-400">•</span>
//                       <span className="text-[#e65100]">
//                         {event.countdown} days left
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <button className="self-start px-3 py-2 text-xs border border-[#e65100] text-[#e65100] rounded-full hover:bg-[#e65100] hover:text-white transition sm:ml-4 sm:self-center sm:px-3 sm:py-1 min-w-max">
//                   Remind Me
//                 </button>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="p-4 text-center rounded-lg bg-gray-50 sm:p-6">
//             <p className="mb-3 text-sm text-gray-500 sm:text-base">
//               You're not following any creators yet
//             </p>
//             <Link
//               href="/ourcreators"
//               className="inline-flex items-center gap-2 text-sm text-[#e65100] hover:underline sm:text-base"
//             >
//               <span>Discover creators</span>
//               <ChevronRight size={14} className="sm:w-4 sm:h-4" />
//             </Link>
//           </div>
//         )}
//       </div> */}
      
//       {/* Wishlist Preview */}
//       <div className="p-6 bg-white rounded-lg shadow-sm">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold">Your Wishlist</h2>
//           {/* Updated View All button to navigate to wishlist page */}
//           <LocalizedClientLink
//             href="/account/wishlist"
//             className="text-sm text-[#e65100] hover:underline"
//           >
//             View All
//           </LocalizedClientLink>
//         </div>

//         <div className="">
//           <WishlistProducts isEmbedded={true} />
//         </div>
//       </div>
//     </div>
//   )
// }

// export default DashboardTab

import React, { useState, useEffect } from "react"
import {
  Package,
  ShoppingBag,
  Calendar,
  ChevronRight,
  Check,
  Truck,
  PackageCheck,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { WishlistProducts } from "@modules/wishlists/components/wishlistProducts"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { retrieveOrder } from "@lib/data/orders"

const CreatorAvatar = ({ creator, size = 40 }) => {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const vendorName = creator.vendor?.name || "Creator"
  const nameParts = vendorName.split(" ")
  const firstName = nameParts[0] || ""
  const lastName = nameParts.slice(1).join(" ") || ""

  const getInitials = (firstName, lastName) => {
    let initials = ""
    if (firstName) initials += firstName.charAt(0).toUpperCase()
    if (lastName) initials += lastName.charAt(0).toUpperCase()
    return initials || "C"
  }

  const getAvatarColor = (name) => {
    let hash = 0
    if (!name) return "#e65100"
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    let color = "#"
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff
      color += ("00" + value.toString(16)).substr(-2)
    }
    return color
  }

  const initials = getInitials(firstName, lastName)
  const bgColor = getAvatarColor(vendorName)
  const fontSize = Math.max(Math.floor(size * 0.4), 12)
  const hasValidLogo = creator.vendor?.logo && !imageError

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '50%',
    flexShrink: 0
  }

  return (
    <div style={containerStyle}>
      {hasValidLogo ? (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <img
            src={creator.vendor.logo}
            alt={vendorName}
            className="object-cover"
            sizes={`${size}px`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setImageError(true)
              setIsLoading(false)
            }}
            style={{
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.2s ease-in-out',
              objectFit: 'cover'
            }}
          />
        </div>
      ) : (
        <div
          className="flex items-center justify-center font-medium text-white"
          style={{
            backgroundColor: bgColor,
            fontSize: `${fontSize}px`,
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          {initials}
        </div>
      )}
    </div>
  )
}

const DashboardTab = ({
  user,
  orders,
  getStatusColor,
  setActiveTab,
  setActiveOrder,
  upcomingEvents,
}) => {
  const safeUser = user || { name: "Customer", following: [] }
  const safeUpcomingEvents = upcomingEvents || []

  // State for detailed order data
  const [latestOrderDetails, setLatestOrderDetails] = useState(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Sort orders (newest first)
  const safeOrders = React.useMemo(() => {
    if (!orders || !Array.isArray(orders)) return []
    
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateB - dateA
    })
  }, [orders])

  // Fetch detailed data for the latest order
  useEffect(() => {
    const fetchLatestOrderDetails = async () => {
      if (!safeOrders || safeOrders.length === 0) return
      
      setIsLoadingDetails(true)
      try {
        const latestOrderId = safeOrders[0].id
        //console.log("Fetching detailed order for:", latestOrderId)
        
        // Use your retrieveOrder server action
        const detailedOrder = await retrieveOrder(latestOrderId)
        
        //console.log("Detailed order received:", detailedOrder)
        //console.log("Fulfillment status:", detailedOrder?.fulfillment_status)
        
        setLatestOrderDetails(detailedOrder)
      } catch (error) {
        //console.error('Failed to fetch order details:', error)
      } finally {
        setIsLoadingDetails(false)
      }
    }

    fetchLatestOrderDetails()
  }, [safeOrders])

  // Use detailed order for tracking if available, otherwise fallback to basic order
  const orderForTracking = latestOrderDetails || (safeOrders.length > 0 ? safeOrders[0] : null)

  //console.log("Order for tracking:", orderForTracking)
  ////console.log("Has expanded data:", orderForTracking ? hasExpandedData(orderForTracking) : false)

  const buildTimelineFromFulfillments = (order) => {
    const timeline = []
    
    timeline.push({
      status: "Order Placed",
      date: new Date(order.created_at).toLocaleDateString(),
      time: new Date(order.created_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      completed: true,
      icon: "check"
    })

    if (order.fulfillments && order.fulfillments.length > 0) {
      const activeFulfillments = order.fulfillments.filter(f => !f.canceled_at)
      //console.log("Fulfillment status:", order.fulfillment_status)
      
      activeFulfillments.forEach(fulfillment => {
        if (fulfillment.packed_at) {
          const packedDate = new Date(fulfillment.packed_at)
          timeline.push({
            status: "Order Packed",
            date: packedDate.toLocaleDateString(),
            time: packedDate.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            completed: true,
            icon: "package"
          })
        }
        
        if (fulfillment.shipped_at) {
          const shippedDate = new Date(fulfillment.shipped_at)
          timeline.push({
            status: "Shipped",
            date: shippedDate.toLocaleDateString(),
            time: shippedDate.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            completed: true,
            icon: "truck"
          })
        }
        
        if (fulfillment.delivered_at) {
          const deliveredDate = new Date(fulfillment.delivered_at)
          timeline.push({
            status: "Delivered",
            date: deliveredDate.toLocaleDateString(),
            time: deliveredDate.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            completed: true,
            icon: "check"
          })
        }
      })
    }

    timeline.sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time)
      const dateB = new Date(b.date + ' ' + b.time)
      return dateB - dateA
    })

    return timeline
  }

  const getDisplayStatus = (order) => {
    // First, try to use fulfillment_status if it exists
    if (order.fulfillment_status) {
      const statusMap = {
        'not_fulfilled': 'Processing',
        'partially_fulfilled': 'Partially Fulfilled',
        'fulfilled': 'Fulfilled',
        'partially_shipped': 'Partially Shipped',
        'shipped': 'Shipped',
        'partially_delivered': 'Partially Delivered',
        'delivered': 'Delivered',
        'canceled': 'Canceled'
      }
      return statusMap[order.fulfillment_status] || 
             order.fulfillment_status.charAt(0).toUpperCase() + 
             order.fulfillment_status.slice(1).replace(/_/g, ' ')
    }

    // If not available, derive from fulfillments array
    if (order.fulfillments && order.fulfillments.length > 0) {
      const activeFulfillments = order.fulfillments.filter(f => !f.canceled_at)
      
      if (activeFulfillments.length === 0) {
        return 'Processing'
      }
      
      // Check if all items are delivered
      const allDelivered = activeFulfillments.every(f => f.delivered_at)
      if (allDelivered) {
        return 'Delivered'
      }
      
      // Check if any items are delivered
      const someDelivered = activeFulfillments.some(f => f.delivered_at)
      if (someDelivered) {
        return 'Partially Delivered'
      }
      
      // Check if all items are shipped
      const allShipped = activeFulfillments.every(f => f.shipped_at)
      if (allShipped) {
        return 'Shipped'
      }
      
      // Check if any items are shipped
      const someShipped = activeFulfillments.some(f => f.shipped_at)
      if (someShipped) {
        return 'Partially Shipped'
      }
      
      // Check if any items are packed
      const somePacked = activeFulfillments.some(f => f.packed_at)
      if (somePacked) {
        return 'Packed'
      }
      
      return 'Fulfilled'
    }

    // Fall back to order.status
    if (order.status) {
      const statusMap = {
        'pending': 'Processing',
        'completed': 'Completed',
        'canceled': 'Canceled',
        'requires_action': 'Requires Action'
      }
      return statusMap[order.status] || 
             order.status.charAt(0).toUpperCase() + order.status.slice(1)
    }

    return 'Processing'
  }

  const hasExpandedData = (order) => {
    return order.fulfillments !== undefined && 
           order.items !== undefined &&
           order.fulfillment_status !== undefined
  }

  const getStatusColorInternal = (status) => {
    const normalizedStatus = status.toLowerCase()
    
    if (normalizedStatus.includes('delivered')) return 'bg-green-500'
    if (normalizedStatus.includes('shipped')) return 'bg-blue-500'
    if (normalizedStatus.includes('fulfilled')) return 'bg-blue-500'
    if (normalizedStatus.includes('processing')) return 'bg-yellow-500'
    if (normalizedStatus.includes('canceled')) return 'bg-red-500'
    
    return 'bg-gray-500'
  }

  const getRecentOrderDisplay = () => {
  // Use orderForTracking if available (has full data), otherwise fallback to basic order
  const displayOrder = orderForTracking || safeOrders[0]
  
  if (!displayOrder) return null

  const orderId = displayOrder.display_id || displayOrder.id
  const orderDate = displayOrder.created_at
    ? new Date(displayOrder.created_at).toLocaleDateString()
    : "Recent"
  const orderStatus = getDisplayStatus(displayOrder)  // ✅ Now using detailed data

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center justify-center flex-shrink-0 bg-blue-100 rounded-full w-14 h-14">
        <Package size={24} className="text-orange-600" />
      </div>
      <div>
        <div className="font-medium">#{orderId}</div>
        <div className="mb-1 text-sm text-gray-600">{orderDate}</div>
        <div className="flex items-center">
          <span
            className={`inline-block w-2 h-2 rounded-full mr-1 ${
              getStatusColor ? getStatusColor(orderStatus) : getStatusColorInternal(orderStatus)
            }`}
          ></span>
          <span className="text-sm">{orderStatus}</span>
        </div>
      </div>
    </div>
  )
}

  const firstName = safeUser.name ? safeUser.name.split(" ")[0] : "Customer"

  const shouldShowTracking = (order) => {
    const status = order.fulfillment_status || order.status
    return status !== "canceled" && status !== "cancelled"
  }

  const getTimelineIcon = (iconType) => {
    switch (iconType) {
      case "check":
        return <Check size={16} />
      case "package":
        return <PackageCheck size={16} />
      case "truck":
        return <Truck size={16} />
      default:
        return <Check size={16} />
    }
  }

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
            <LocalizedClientLink 
              href="/account/orders"
              className="text-sm text-[#e65100] hover:underline"
            >
              View All
            </LocalizedClientLink>
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
                  key={creator.id || creator.vendor?.id || Math.random().toString()}
                  href={`/creator/${creator.vendor?.handle || ""}`}
                  className="flex flex-col items-center"
                >
                  <CreatorAvatar creator={creator} size={40} />
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
      {orderForTracking && shouldShowTracking(orderForTracking) && (
        <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Track Your Order</h2>
            <span className="text-sm text-gray-500">
              #{orderForTracking.display_id || orderForTracking.id}
            </span>
          </div>

          {/* Loading state */}
          {isLoadingDetails && (
            <div className="p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50">
              <p className="text-sm text-blue-800">
                ⏳ Loading detailed tracking information...
              </p>
            </div>
          )}

          {/* Show alert if data is not expanded */}
          {!isLoadingDetails && !hasExpandedData(orderForTracking) && (
            <div className="p-3 mb-4 border rounded-lg bg-amber-50 border-amber-200">
              <p className="text-sm text-amber-800">
                ⚠️ <strong>Limited tracking data available.</strong> Full tracking details will appear once the order data is properly loaded.
              </p>
            </div>
          )}

          <div className="relative">
            <div className="absolute left-0 ml-4 mt-2 h-full w-0.5 bg-gray-200"></div>

            <div className="relative space-y-6">
              {hasExpandedData(orderForTracking) ? (
                // Show real timeline from fulfillments
                buildTimelineFromFulfillments(orderForTracking).map((event, index) => (
                  <div key={index} className="flex">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 flex-shrink-0 ${
                        index === 0
                          ? "bg-[#e65100] text-white"
                          : event.completed
                          ? "bg-orange-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {getTimelineIcon(event.icon)}
                    </div>

                    <div className="ml-4">
                      <div
                        className={`font-medium ${
                          index === 0 ? "text-[#e65100]" : 
                          event.completed ? "text-orange-600" : "text-gray-800"
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
                // Basic fallback timeline
                <div className="flex">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center relative z-10 flex-shrink-0 bg-[#e65100] text-white">
                    <Check size={16} />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-[#e65100]">
                      {getDisplayStatus(orderForTracking)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {orderForTracking.created_at 
                        ? new Date(orderForTracking.created_at).toLocaleDateString() 
                        : "Recently"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              className="text-sm text-[#e65100] hover:underline flex items-center"
              onClick={() => {
                if (setActiveTab) setActiveTab("orders")
                if (setActiveOrder) setActiveOrder(orderForTracking.id)
              }}
            >
              View order details
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Wishlist Preview */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Wishlist</h2>
          <LocalizedClientLink
            href="/account/wishlist"
            className="text-sm text-[#e65100] hover:underline"
          >
            View All
          </LocalizedClientLink>
        </div>

        <div className="">
          <WishlistProducts isEmbedded={true} />
        </div>
      </div>
    </div>
  )
}

export default DashboardTab