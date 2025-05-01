// import React from "react"
// import { User, Package, Heart, Star, Settings, LogOut } from "lucide-react"
// import CustomerAvatar from "../get-initials"

// const AccountSidebar = ({
//   activeTab,
//   setActiveTab,
//   user,
//   customer,
//   handleSignOut,
//   isSigningOut,
// }) => {
//   return (
//     <div className="w-full p-4 bg-white rounded-lg shadow-sm md:w-1/4 lg:w-1/5 h-fit">
//       <div className="flex items-center gap-3 p-2 mb-6">
//         <CustomerAvatar
//           firstName={customer?.first_name || ""}
//           lastName={customer?.last_name || ""}
//           imageUrl={customer?.avatarImg || null}
//           size={48}
//           className="flex-shrink-0"
//         />
//         <div>
//           <h2 className="font-semibold">{user.name}</h2>
//           <div className="flex items-center">
//             <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
//               {user.membershipTier}
//             </span>
//           </div>
//         </div>
//       </div>

//       <nav>
//         <ul className="space-y-1">
//           <li>
//             <button
//               className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
//                 activeTab === "overview"
//                   ? "bg-[#e65100] text-white"
//                   : "hover:bg-gray-100"
//               }`}
//               onClick={() => setActiveTab("overview")}
//             >
//               <User size={18} />
//               <span>Dashboard</span>
//             </button>
//           </li>
//           <li>
//             <button
//               className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
//                 activeTab === "orders"
//                   ? "bg-[#e65100] text-white"
//                   : "hover:bg-gray-100"
//               }`}
//               onClick={() => setActiveTab("orders")}
//             >
//               <Package size={18} />
//               <span>My Orders</span>
//             </button>
//           </li>
//           <li>
//             <button
//               className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
//                 activeTab === "wishlist"
//                   ? "bg-[#e65100] text-white"
//                   : "hover:bg-gray-100"
//               }`}
//               onClick={() => setActiveTab("wishlist")}
//             >
//               <Heart size={18} />
//               <span>Wishlist</span>
//             </button>
//           </li>
//           <li>
//             <button
//               className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
//                 activeTab === "membership"
//                   ? "bg-[#e65100] text-white"
//                   : "hover:bg-gray-100"
//               }`}
//               onClick={() => setActiveTab("membership")}
//             >
//               <Star size={18} />
//               <span>Fan Membership</span>
//             </button>
//           </li>
//           <li>
//             <button
//               className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
//                 activeTab === "settings"
//                   ? "bg-[#e65100] text-white"
//                   : "hover:bg-gray-100"
//               }`}
//               onClick={() => setActiveTab("settings")}
//             >
//               <Settings size={18} />
//               <span>Account Settings</span>
//             </button>
//           </li>
//         </ul>

//         <div className="pt-6 mt-6 border-t">
//           <button
//             className="flex items-center w-full gap-3 px-4 py-2 text-gray-700 transition rounded-lg hover:bg-gray-100"
//             onClick={handleSignOut}
//             disabled={isSigningOut}
//           >
//             <LogOut size={18} />
//             <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
//           </button>
//         </div>
//       </nav>
//     </div>
//   )
// }

// export default AccountSidebar

// "use client"

// import React from "react"
// import {
//   User,
//   Package,
//   Heart,
//   Star,
//   Settings,
//   LogOut,
//   MapPin,
// } from "lucide-react"
// import { usePathname, useParams } from "next/navigation"
// import LocalizedClientLink from "@modules/common/components/localized-client-link"
// import CustomerAvatar from "../get-initials"

// interface AccountSidebarProps {
//   activeTab?: string
//   setActiveTab?: (tab: string) => void
//   user?: any
//   customer?: any
//   handleSignOut?: () => Promise<void>
//   isSigningOut?: boolean
// }

// const AccountSidebar: React.FC<AccountSidebarProps> = ({
//   activeTab = "overview",
//   setActiveTab,
//   user,
//   customer,
//   handleSignOut,
//   isSigningOut = false,
// }) => {
//   const pathname = usePathname()
//   const { countryCode } = useParams() as { countryCode?: string }

//   // Determine if we're using route-based navigation or tab-based navigation
//   const isRouteBasedNav = !setActiveTab

//   // Handle sign out if no handler is provided
//   const handleSignOutClick = async () => {
//     if (handleSignOut) {
//       await handleSignOut()
//     } else {
//       // Fallback behavior - redirect to login page or home
//       window.location.href = `/${countryCode || "en"}/account/login`
//     }
//   }

//   // Helper function to determine if a route is active
//   const isRouteActive = (route: string): boolean => {
//     if (!pathname) return false

//     // Check if the current pathname includes the route
//     return pathname.includes(route)
//   }

//   // Format the customer name
//   const customerName = user
//     ? user.name
//     : customer
//     ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
//     : "Customer"

//   // Navigation items with their routes and tab names
//   const navItems = [
//     {
//       icon: <User size={18} />,
//       label: "Dashboard",
//       route: "/account",
//       tab: "overview",
//       testId: "overview-link",
//     },
//     {
//       icon: <Package size={18} />,
//       label: "My Orders",
//       route: "/account/orders",
//       tab: "orders",
//       testId: "orders-link",
//     },
//     {
//       icon: <Heart size={18} />,
//       label: "Wishlist",
//       route: "/account/wishlist",
//       tab: "wishlist",
//     },
//     {
//       icon: <Star size={18} />,
//       label: "Fan Membership",
//       route: "/account/membership",
//       tab: "membership",
//     },
//     {
//       icon: <MapPin size={18} />,
//       label: "Addresses",
//       route: "/account/addresses",
//       tab: "addresses",
//       testId: "addresses-link",
//     },
//     {
//       icon: <Settings size={18} />,
//       label: "Account Settings",
//       route: "/account/profile",
//       tab: "settings",
//       testId: "profile-link",
//     },
//   ]

//   return (
//     <div className="w-full p-4 bg-white rounded-lg shadow-sm h-fit">
//       {/* User Profile Header */}
//       {user && (
//         <div className="flex items-center gap-3 p-2 mb-6">
//           <CustomerAvatar
//             firstName={customer?.first_name || ""}
//             lastName={customer?.last_name || ""}
//             imageUrl={user?.avatar || null}
//             size={48}
//             className="flex-shrink-0"
//           />
//           <div>
//             <h2 className="font-semibold">{customerName}</h2>
//             {user.membershipTier && (
//               <div className="flex items-center">
//                 <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
//                   {user.membershipTier}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Navigation */}
//       <nav>
//         <ul className="space-y-1">
//           {navItems.map((item) => (
//             <li key={item.tab}>
//               {isRouteBasedNav ? (
//                 // Route-based navigation (traditional links)
//                 <LocalizedClientLink
//                   href={item.route}
//                   className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
//                     isRouteActive(item.route)
//                       ? "bg-[#e65100] text-white"
//                       : "hover:bg-gray-100"
//                   }`}
//                   data-testid={item.testId}
//                 >
//                   {item.icon}
//                   <span>{item.label}</span>
//                 </LocalizedClientLink>
//               ) : (
//                 // Tab-based navigation (state management)
//                 <button
//                   className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
//                     activeTab === item.tab
//                       ? "bg-[#e65100] text-white"
//                       : "hover:bg-gray-100"
//                   }`}
//                   onClick={() => setActiveTab(item.tab)}
//                   data-testid={item.testId}
//                 >
//                   {item.icon}
//                   <span>{item.label}</span>
//                 </button>
//               )}
//             </li>
//           ))}
//         </ul>

//         {/* Sign Out Button */}
//         <div className="pt-6 mt-6 border-t">
//           <button
//             className="flex items-center w-full gap-3 px-4 py-2 text-gray-700 transition rounded-lg hover:bg-gray-100"
//             onClick={handleSignOutClick}
//             disabled={isSigningOut}
//             data-testid="logout-button"
//           >
//             <LogOut size={18} />
//             <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
//           </button>
//         </div>
//       </nav>
//     </div>
//   )
// }

// export default AccountSidebar

"use client"

import React from "react"
import {
  User,
  Package,
  Heart,
  Star,
  Settings,
  LogOut,
  MapPin,
} from "lucide-react"
import { usePathname, useParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CustomerAvatar from "../get-initials"

const AccountSidebar = ({
  customer,
  user,
  isSigningOut = false,
  handleSignOut,
}) => {
  const pathname = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  // Map paths to tabs for active state determination
  const pathToTabMap = {
    "/account": "overview",
    "/account/profile": "settings",
    "/account/orders": "orders",
    "/account/wishlist": "wishlist",
    "/account/membership": "membership",
    "/account/addresses": "addresses",
  }

  // Function to determine if a tab is active based on the current path
  const isTabActive = (tabPath) => {
    // Get the specific path without countryCode
    const currentPath = pathname.split(countryCode)[1] || ""
    // Check if current path matches the tab path
    return currentPath === tabPath
  }

  // Format the customer name
  const customerName =
    user?.name ||
    (customer
      ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
      : "Customer")

  // Navigation items with their routes and tab names
  const navItems = [
    {
      icon: <User size={18} />,
      label: "Dashboard",
      path: "/account",
      testId: "overview-link",
    },
    {
      icon: <Package size={18} />,
      label: "My Orders",
      path: "/account/orders",
      testId: "orders-link",
    },
    {
      icon: <Heart size={18} />,
      label: "Wishlist",
      path: "/account/wishlist",
    },
    {
      icon: <Star size={18} />,
      label: "Fan Membership",
      path: "/account/membership",
    },
    {
      icon: <MapPin size={18} />,
      label: "Addresses",
      path: "/account/addresses",
      testId: "addresses-link",
    },
    {
      icon: <Settings size={18} />,
      label: "Account Settings",
      path: "/account/profile",
      testId: "profile-link",
    },
  ]

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm h-fit">
      {/* User Profile Header */}
      {(user || customer) && (
        <div className="flex items-center gap-3 p-2 mb-6">
          <CustomerAvatar
            firstName={customer?.first_name || ""}
            lastName={customer?.last_name || ""}
            imageUrl={user?.avatar || null}
            size={48}
            className="flex-shrink-0"
          />
          <div>
            <h2 className="font-semibold">{customerName}</h2>
            {user?.membershipTier && (
              <div className="flex items-center">
                <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                  {user.membershipTier}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <LocalizedClientLink
                href={item.path}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  isTabActive(item.path)
                    ? "bg-[#e65100] text-white"
                    : "hover:bg-gray-100"
                }`}
                data-testid={item.testId}
              >
                {item.icon}
                <span>{item.label}</span>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>

        {/* Sign Out Button */}
        <div className="pt-6 mt-6 border-t">
          <button
            className="flex items-center w-full gap-3 px-4 py-2 text-gray-700 transition rounded-lg hover:bg-gray-100"
            onClick={handleSignOut}
            disabled={isSigningOut}
            data-testid="logout-button"
          >
            <LogOut size={18} />
            <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default AccountSidebar
