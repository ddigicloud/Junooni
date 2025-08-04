"use client"

import React, { useState, useEffect } from "react"
import MembershipTab from "@modules/account/components/sidebar-tabs/membership-tab"
import { useRouter } from "next/navigation"
import { retrieveCustomer, loyaltyPointsHistory, loyaltyPoints } from "@lib/data/customer"
import { sdk } from "@lib/config"

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

const Membership = () => {
  // State for loading and error handling
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State for user data and membership info
  const [user, setUser] = useState(null)
  const [loyalPoint, setLoyalPoint] = useState(0)
  const [pointsHistory, setPointsHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [pointsLoading, setPointsLoading] = useState(false)
  const [dataSource, setDataSource] = useState({ points: 'loading', history: 'loading' })
  const [isSigningOut, setIsSigningOut] = useState(false)

  // ✅ NEW: Fetch loyalty points using server action (same pattern as history)
  const fetchLoyaltyPointsFromServerAction = async () => {
    try {
      setPointsLoading(true)
      console.log('🌐 Fetching loyalty points using server action...')
      
      // Use the server action from customer.ts (same as history)
      const data = await loyaltyPoints()

      if (data && typeof data.points !== 'undefined') {
        setLoyalPoint(data.points)
        setDataSource(prev => ({ ...prev, points: 'server-action' }))
        
        // Update localStorage as backup
        const membershipInfo = { loyalPoint: data.points }
        localStorage.setItem("membershipInfo", JSON.stringify(membershipInfo))
        
        console.log('✅ REAL loyalty points from server action:', data.points)
        return data.points
      } else {
        console.log('⚠️ Server action returned invalid loyalty points data, using fallback')
        return false
      }
    } catch (error) {
      console.error('❌ Error fetching loyalty points from server action:', error)
      return false
    } finally {
      setPointsLoading(false)
    }
  }

  // Fetch loyalty points from localStorage (existing working approach as fallback)
  const fetchLoyaltyPointsFromLocalStorage = () => {
    try {
      console.log('💾 Fetching loyalty points from localStorage...')
      
      const storedMembershipInfo = window.localStorage.getItem("membershipInfo")
        ? JSON.parse(window.localStorage.getItem("membershipInfo"))
        : { loyalPoint: 0 } // Changed from 68454 to 0 for more realistic fallback
      
      setLoyalPoint(storedMembershipInfo.loyalPoint)
      console.log('✅ Loyalty points loaded from localStorage:', storedMembershipInfo.loyalPoint)
      
      setDataSource(prev => ({ ...prev, points: 'localStorage' }))
      return storedMembershipInfo.loyalPoint
    } catch (error) {
      console.error('❌ Error fetching loyalty points from localStorage:', error)
      setLoyalPoint(0) // Changed from 68454 to 0
      setDataSource(prev => ({ ...prev, points: 'fallback' }))
      return 0
    }
  }

  // ✅ UPDATED: Main function to fetch loyalty points (server action first, then localStorage fallback)
  const fetchLoyaltyPoints = async () => {
    try {
      // 1. Try to fetch from server action first (same as history)
      const serverActionPoints = await fetchLoyaltyPointsFromServerAction()
      
      if (serverActionPoints !== false) {
        return serverActionPoints
      }
      
      // 2. If server action fails, fall back to localStorage
      console.log('🔄 Falling back to localStorage for loyalty points...')
      return fetchLoyaltyPointsFromLocalStorage()
      
    } catch (error) {
      console.error('❌ Error in fetchLoyaltyPoints:', error)
      return fetchLoyaltyPointsFromLocalStorage()
    }
  }

  // ✅ FIXED: Update your transformation logic in fetchPointsHistoryFromServerAction

const fetchPointsHistoryFromServerAction = async () => {
  try {
    setHistoryLoading(true)
    console.log('🌐 Fetching points history using server action...')
    
    // Use the server action from customer.ts
    const data = await loyaltyPointsHistory(50, 0)
    
    console.log('🔍 Raw API response from customer.ts:', data) // Debug log
    
    // Check if we got valid data structure
    if (data && data.transactions) {
      console.log('✅ Valid API response structure detected')
      console.log('📊 Number of transactions:', data.transactions.length)
      console.log('💰 Current balance from API:', data.current_balance)
      
      if (data.transactions.length > 0) {
        console.log('🎉 REAL transactions found!')
        
        // ✅ FIXED: Transform the API data to match the component's expected format
        const transformedHistory = data.transactions.map((transaction) => ({
          id: transaction.id,
          date: transaction.created_at,
          event: transaction.event_type.charAt(0).toUpperCase() + transaction.event_type.slice(1),
          description: transaction.description,
          points: transaction.points,
          balance: transaction.balance_after,
          reference_id: transaction.reference_id,
          reference_type: transaction.reference_type,
          is_credit: transaction.is_credit,
          is_debit: transaction.is_debit,
          // ✅ ADD THIS: Map order price from API response
          orderPrice: transaction.order_amount || transaction.order_price || transaction.amount || null
        }))

        setPointsHistory(transformedHistory)
        setDataSource(prev => ({ ...prev, history: 'server-action' }))
        
        console.log('✅ Transformed and set real history data:', transformedHistory)
        console.log('🎉 SUCCESS: Using real server action history data!')
        
        return true // SUCCESS - real data loaded
      } else {
        console.log('⚠️ API returned valid structure but EMPTY transactions array')
        console.log('🔍 This means you have no transaction records in your database yet')
        
        // Set empty array (don't fall back to fake data)
        setPointsHistory([])
        setDataSource(prev => ({ ...prev, history: 'server-action-empty' }))
        
        return true // Still success - just empty data
      }
    } else {
      console.log('❌ Invalid API response structure:', data)
      return false // Let it fall back
    }
    
  } catch (error) {
    console.error('❌ Error fetching history from server action:', error)
    return false // Let it fall back
  } finally {
    setHistoryLoading(false)
  }
}

 // Also update your fetchPointsHistoryFallback to NOT create fake data:
const fetchPointsHistoryFallback = (currentPoints) => {
  console.log('⚠️ Using fallback - but NOT creating fake data anymore')
  
  // Check localStorage first
  const storedHistory = localStorage.getItem("pointsHistory")
  if (storedHistory) {
    try {
      const parsedHistory = JSON.parse(storedHistory)
      console.log('📦 Found history in localStorage:', parsedHistory.length)
      setPointsHistory(parsedHistory)
      setDataSource(prev => ({ ...prev, history: 'localStorage' }))
      return
    } catch (error) {
      console.error('❌ Error parsing localStorage history:', error)
    }
  }

  // Instead of creating fake data, just set empty with a message
  console.log('📭 No fallback data available - showing empty state')
  setPointsHistory([])
  setDataSource(prev => ({ ...prev, history: 'no-data' }))
}

  // Update your main fetchAllData function to be more explicit:
const fetchAllData = async () => {
  try {
    setLoading(true)
    setError(null)
    console.log('🔄 Starting fetchAllData...')

    // 1. Fetch user data
    const customerData = await retrieveCustomer()
    if (customerData) {
      const transformedUser = {
        name: `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() || 'Customer',
        email: customerData.email || '',
        following: [],
        joinDate: customerData.created_at ? new Date(customerData.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : 'Unknown',
      }
      setUser(transformedUser)
      console.log('👤 User data loaded')
    }

    // 2. Fetch loyalty points - TRY SERVER ACTION FIRST
    console.log('💰 Fetching loyalty points...')
    const serverActionPointsSuccess = await fetchLoyaltyPointsFromServerAction()
    if (!serverActionPointsSuccess) {
      console.log('⚠️ Server action points failed, trying localStorage...')
      fetchLoyaltyPointsFromLocalStorage()
    }

    // 3. Fetch points history - TRY SERVER ACTION FIRST  
    console.log('📊 Fetching points history...')
    const serverActionHistorySuccess = await fetchPointsHistoryFromServerAction()
    if (!serverActionHistorySuccess) {
      console.log('⚠️ Server action history failed, using fallback...')
      fetchPointsHistoryFallback(loyalPoint)
    }

    setLoading(false)
    console.log('✅ fetchAllData completed')
    
  } catch (err) {
    console.error('❌ Error in fetchAllData:', err)
    setError(err.message || "Failed to load membership data")
    setLoading(false)
  }
}

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData()
  }, [])

  // ✅ UPDATED: Function to refresh loyalty points (retry server action)
  const refreshLoyaltyPoints = async () => {
    const serverActionSuccess = await fetchLoyaltyPointsFromServerAction()
    if (serverActionSuccess === false) {
      fetchLoyaltyPointsFromLocalStorage()
    }
  }

  // Function to refresh points history (retry server action)
  const refreshPointsHistory = async () => {
    const serverActionSuccess = await fetchPointsHistoryFromServerAction()
    if (!serverActionSuccess) {
      fetchPointsHistoryFallback(loyalPoint)
    }
  }

  // Function to add test entry (for testing localStorage approach)
  const addTestEntry = async () => {
    try {
      // Add to both localStorage and current state
      const currentHistory = JSON.parse(localStorage.getItem("pointsHistory") || "[]")
      const newEntry = {
        id: `ph-test-${Date.now()}`,
        date: new Date().toISOString(),
        event: "Test",
        description: "Manual test entry (+100 points)",
        points: 100,
        balance: loyalPoint + 100,
      }
      
      const updatedHistory = [newEntry, ...currentHistory]
      localStorage.setItem("pointsHistory", JSON.stringify(updatedHistory))
      
      // Update loyalty points in localStorage
      const membershipInfo = { loyalPoint: loyalPoint + 100 }
      localStorage.setItem("membershipInfo", JSON.stringify(membershipInfo))
      
      // Update state
      setLoyalPoint(loyalPoint + 100)
      setPointsHistory(updatedHistory)
      setDataSource(prev => ({ ...prev, history: 'localStorage' }))
      
      console.log('✅ Added test entry to localStorage')
    } catch (error) {
      console.error('❌ Error adding test entry:', error)
    }
  }

  // Calculate tier information
  const overallPercentage = pointsToPercentage(loyalPoint)
  const currentTier = getUserTier(loyalPoint)
  const nextTier = getNextTier(currentTier)
  const pointsToNextTier = getPointsToNextTier(loyalPoint)
  const progressPercentage = calculateProgressPercentage(loyalPoint)

  // Handle sign out
  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      // Clear all data
      localStorage.clear()
      setTimeout(() => {
        setIsSigningOut(false)
        window.location.href = '/account/login'
      }, 1000)
    } catch (err) {
      console.error("Error signing out:", err)
      setIsSigningOut(false)
    }
  }

  // Render loading state
  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="w-full md:w-1/4">
            <div className="w-full h-64 p-4 bg-white rounded-lg shadow-sm animate-pulse">
              <div className="w-3/4 h-4 mb-4 bg-gray-300 rounded"></div>
              <div className="w-1/2 h-3 mb-2 bg-gray-300 rounded"></div>
              <div className="w-2/3 h-3 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="w-full md:w-3/4">
            <div className="w-full bg-white rounded-lg shadow-sm h-96 animate-pulse">
              <div className="p-6">
                <div className="w-1/2 h-8 mb-4 bg-gray-300 rounded"></div>
                <div className="w-full h-2 mb-6 bg-gray-300 rounded"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-gray-300 rounded"></div>
                  <div className="h-24 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="p-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
          <h2 className="mb-2 text-lg font-semibold">Error</h2>
          <p>{error}</p>
          <div className="flex gap-4 mt-4">
            <button
              className="px-4 py-2 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
            <button
              className="px-4 py-2 text-red-600 transition bg-white border border-red-600 rounded-lg hover:bg-red-50"
              onClick={() => window.location.href = '/account/login'}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render main content
  return (
    <div className="">
      
      
      <div className="flex">
        <div className="w-full">
          {user && (
            <MembershipTab
              user={user}
              currentTier={currentTier}
              nextTier={nextTier}
              loyalPoint={loyalPoint}
              pointsToNextTier={pointsToNextTier}
              overallPercentage={overallPercentage}
              progressPercentage={progressPercentage}
              getPercentageToNextTier={getPercentageToNextTier}
              tierPercentages={TIER_PERCENTAGES}
              maxPoints={MAX_POSSIBLE_POINTS}
              pointsHistory={pointsHistory}
              loading={historyLoading}
              onRefreshHistory={refreshPointsHistory}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Membership


// "use client"

// import React, { useState, useEffect } from "react"
// import MembershipTab from "@modules/account/components/sidebar-tabs/membership-tab"
// import { useRouter } from "next/navigation"

// // Import tier calculation functions from the utility file
// import {
//   TIER_PERCENTAGES,
//   MAX_POSSIBLE_POINTS,
//   pointsToPercentage,
//   getUserTier,
//   getNextTier,
//   getPointsToNextTier,
//   getPercentageToNextTier,
//   calculateProgressPercentage,
//   TIERS,
// } from "@modules/account/components/tier-calculation"

// const Membership = () => {
//   // State for loading and error handling
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   // State for user data and membership info
//   const [user, setUser] = useState(null)
//   const [loyalPoint, setLoyalPoint] = useState(0)
//   const [isSigningOut, setIsSigningOut] = useState(false)

//   // Fetch user data and membership info
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         setLoading(true)

//         // Example API calls - replace with your actual data fetching logic
//         // const userResponse = await fetch('/api/user')
//         // const userData = await userResponse.json()
//         // setUser(userData)

//         // const membershipResponse = await fetch('/api/membership')
//         // const membershipData = await membershipResponse.json()
//         // setLoyalPoint(membershipData.loyalPoint)

//         // For development, we'll simulate the API response
//         // In production, use the commented code above instead
//         setTimeout(() => {
//           // This is just for simulation - replace with real API calls
//           const storedUser = window.localStorage.getItem("user")
//             ? JSON.parse(window.localStorage.getItem("user"))
//             : {
//                 name: "Customer",
//                 email: "",
//                 following: [],
//                 joinDate: "March 15, 2025",
//               }

//           setUser(storedUser)

//           const storedMembershipInfo = window.localStorage.getItem(
//             "membershipInfo"
//           )
//             ? JSON.parse(window.localStorage.getItem("membershipInfo"))
//             : { loyalPoint: 1500 }

//           setLoyalPoint(storedMembershipInfo.loyalPoint)
//           setLoading(false)
//         }, 500)
//       } catch (err) {
//         console.error("Error fetching user data:", err)
//         setError("Failed to load membership data. Please try again later.")
//         setLoading(false)
//       }
//     }

//     fetchUserData()
//   }, [])

//   // Calculate tier information based on loyalty points and percentage system
//   const overallPercentage = pointsToPercentage(loyalPoint)
//   const currentTier = getUserTier(loyalPoint)
//   const nextTier = getNextTier(currentTier)
//   const pointsToNextTier = getPointsToNextTier(loyalPoint)
//   const progressPercentage = calculateProgressPercentage(loyalPoint)

//   // Handle sign out function
//   const handleSignOut = async () => {
//     setIsSigningOut(true)
//     try {
//       // Replace with your actual sign out logic
//       // await fetch('/api/auth/signout', { method: 'POST' })

//       // For development, simulate sign out process
//       setTimeout(() => {
//         setIsSigningOut(false)
//         // In production, redirect to login page
//         // router.push('/login')
//       }, 1000)
//     } catch (err) {
//       console.error("Error signing out:", err)
//       setIsSigningOut(false)
//     }
//   }

//   // Render loading state
//   if (loading) {
//     return (
//       <div className="container px-4 py-8 mx-auto">
//         <div className="flex flex-col gap-6 md:flex-row">
//           <div className="w-full md:w-1/4">
//             <div className="w-full h-64 p-4 bg-white rounded-lg shadow-sm animate-pulse"></div>
//           </div>
//           <div className="w-full md:w-3/4">
//             <div className="w-full bg-white rounded-lg shadow-sm h-96 animate-pulse"></div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Render error state
//   if (error) {
//     return (
//       <div className="container px-4 py-8 mx-auto">
//         <div className="p-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
//           <h2 className="mb-2 text-lg font-semibold">Error</h2>
//           <p>{error}</p>
//           <button
//             className="px-4 py-2 mt-4 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
//             onClick={() => window.location.reload()}
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     )
//   }

//   // Render the actual content once data is loaded
//   return (
//     <div className="">
//       <div className="flex ">
//         {/* Main Content */}
//         <div className="w-full ">
//           {user && (
//             <MembershipTab
//               user={user}
//               currentTier={currentTier}
//               nextTier={nextTier}
//               loyalPoint={loyalPoint}
//               pointsToNextTier={pointsToNextTier}
//               overallPercentage={overallPercentage}
//               progressPercentage={progressPercentage}
//               getPercentageToNextTier={getPercentageToNextTier}
//               tierPercentages={TIER_PERCENTAGES}
//               maxPoints={MAX_POSSIBLE_POINTS}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Membership


// "use client"

// import React, { useState, useEffect } from "react"
// import MembershipTab from "@modules/account/components/sidebar-tabs/membership-tab"
// import { useRouter } from "next/navigation"
// import { retrieveCustomer } from "@lib/data/customer"

// // Import tier calculation functions from the utility file
// import {
//   TIER_PERCENTAGES,
//   MAX_POSSIBLE_POINTS,
//   pointsToPercentage,
//   getUserTier,
//   getNextTier,
//   getPointsToNextTier,
//   getPercentageToNextTier,
//   calculateProgressPercentage,
//   TIERS,
// } from "@modules/account/components/tier-calculation"

// const Membership = () => {
//   // State for loading and error handling
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   // State for user data and membership info
//   const [user, setUser] = useState(null)
//   const [loyalPoint, setLoyalPoint] = useState(0)
//   const [isSigningOut, setIsSigningOut] = useState(false)

//   // Helper function to fetch loyalty points
//   const fetchLoyaltyPoints = async () => {
//     // Use relative URL to avoid CORS issues - should be proxied to the correct port
//     const loyaltyResponse = await fetch('http://localhost:9000/api/store/customers/me/loyalty-points', {
//       method: 'GET',
//       credentials: 'include',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })

//     if (!loyaltyResponse.ok) {
//       if (loyaltyResponse.status === 401) {
//         throw new Error('Please log in to view your loyalty points')
//       }
//       throw new Error(`Failed to fetch loyalty data: ${loyaltyResponse.statusText}`)
//     }

//     const loyaltyData = await loyaltyResponse.json()
//     console.log("Loyalty data from API:", loyaltyData) // Debug log
//     return loyaltyData.points || 0
//   }

//   // Fetch user data and membership info from real API
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         setLoading(true)
//         setError(null)

//         // Fetch user profile data using the existing data layer function
//         const customerData = await retrieveCustomer()
//         console.log("Raw customer data:", customerData) // Debug log
        
//         if (!customerData) {
//           throw new Error("No customer data found. Please log in.")
//         }

//         // Transform the customer data to match what your component expects
//         const transformedUser = {
//           name: `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() || 'Customer',
//           email: customerData.email || '',
//           following: [], // This might need to come from a different endpoint
//           joinDate: customerData.created_at ? new Date(customerData.created_at).toLocaleDateString('en-US', { 
//             year: 'numeric', 
//             month: 'long', 
//             day: 'numeric' 
//           }) : 'Unknown',
//         }
//         console.log("Transformed user data:", transformedUser) // Debug log
//         setUser(transformedUser)

//         // Fetch loyalty points data from the real API
//         const points = await fetchLoyaltyPoints()
//         setLoyalPoint(points)

//         setLoading(false)
//       } catch (err) {
//         console.error("Error fetching user or loyalty data:", err)
//         setError(err.message || "Failed to load membership data. Please try again later.")
//         setLoading(false)
//       }
//     }

//     fetchUserData()
//   }, [])

//   // Function to refresh loyalty points (useful after purchases, etc.)
//   const refreshLoyaltyPoints = async () => {
//     try {
//       const points = await fetchLoyaltyPoints()
//       setLoyalPoint(points)
//     } catch (err) {
//       console.error("Error refreshing loyalty points:", err)
//     }
//   }

//   // Calculate tier information based on loyalty points and percentage system
//   const overallPercentage = pointsToPercentage(loyalPoint)
//   const currentTier = getUserTier(loyalPoint)
//   const nextTier = getNextTier(currentTier)
//   const pointsToNextTier = getPointsToNextTier(loyalPoint)
//   const progressPercentage = calculateProgressPercentage(loyalPoint)

//   // Handle sign out function
//   const handleSignOut = async () => {
//     setIsSigningOut(true)
//     try {
//       const response = await fetch('/api/store/auth/session', { 
//         method: 'DELETE',
//         credentials: 'include',
//       })

//       if (response.ok) {
//         // Redirect to login page after successful sign out
//         window.location.href = '/account/login'
//       } else {
//         throw new Error('Sign out failed')
//       }
//     } catch (err) {
//       console.error("Error signing out:", err)
//       setError("Failed to sign out. Please try again.")
//     } finally {
//       setIsSigningOut(false)
//     }
//   }

//   // Render loading state
//   if (loading) {
//     return (
//       <div className="container px-4 py-8 mx-auto">
//         <div className="flex flex-col gap-6 md:flex-row">
//           <div className="w-full md:w-1/4">
//             <div className="w-full h-64 p-4 bg-white rounded-lg shadow-sm animate-pulse">
//               <div className="w-3/4 h-4 mb-4 bg-gray-300 rounded"></div>
//               <div className="w-1/2 h-3 mb-2 bg-gray-300 rounded"></div>
//               <div className="w-2/3 h-3 bg-gray-300 rounded"></div>
//             </div>
//           </div>
//           <div className="w-full md:w-3/4">
//             <div className="w-full bg-white rounded-lg shadow-sm h-96 animate-pulse">
//               <div className="p-6">
//                 <div className="w-1/2 h-8 mb-4 bg-gray-300 rounded"></div>
//                 <div className="w-full h-2 mb-6 bg-gray-300 rounded"></div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="h-24 bg-gray-300 rounded"></div>
//                   <div className="h-24 bg-gray-300 rounded"></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Render error state
//   if (error) {
//     return (
//       <div className="container px-4 py-8 mx-auto">
//         <div className="p-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
//           <h2 className="mb-2 text-lg font-semibold">Error</h2>
//           <p>{error}</p>
//           <div className="flex gap-4 mt-4">
//             <button
//               className="px-4 py-2 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
//               onClick={() => window.location.reload()}
//             >
//               Try Again
//             </button>
//             {error.includes('log in') && (
//               <button
//                 className="px-4 py-2 text-red-600 transition bg-white border border-red-600 rounded-lg hover:bg-red-50"
//                 onClick={() => window.location.href = '/account/login'}
//               >
//                 Go to Login
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Render the actual content once data is loaded
//   return (
//     <div className="">
//       <div className="flex">
//         {/* Main Content */}
//         <div className="w-full">
//           {user && (
//             <MembershipTab
//               user={user}
//               currentTier={currentTier}
//               nextTier={nextTier}
//               loyalPoint={loyalPoint}
//               pointsToNextTier={pointsToNextTier}
//               overallPercentage={overallPercentage}
//               progressPercentage={progressPercentage}
//               getPercentageToNextTier={getPercentageToNextTier}
//               tierPercentages={TIER_PERCENTAGES}
//               maxPoints={MAX_POSSIBLE_POINTS}
//               onRefreshPoints={refreshLoyaltyPoints} // Optional: pass refresh function
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Membership