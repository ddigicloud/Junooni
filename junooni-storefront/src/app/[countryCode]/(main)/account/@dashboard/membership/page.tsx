"use client"

import React, { useState, useEffect } from "react"
import MembershipTab from "@modules/account/components/sidebar-tabs/membership-tab"
import { useRouter } from "next/navigation"

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
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Fetch user data and membership info
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)

        // Example API calls - replace with your actual data fetching logic
        // const userResponse = await fetch('/api/user')
        // const userData = await userResponse.json()
        // setUser(userData)

        // const membershipResponse = await fetch('/api/membership')
        // const membershipData = await membershipResponse.json()
        // setLoyalPoint(membershipData.loyalPoint)

        // For development, we'll simulate the API response
        // In production, use the commented code above instead
        setTimeout(() => {
          // This is just for simulation - replace with real API calls
          const storedUser = window.localStorage.getItem("user")
            ? JSON.parse(window.localStorage.getItem("user"))
            : {
                name: "Customer",
                email: "",
                following: [],
                joinDate: "March 15, 2025",
              }

          setUser(storedUser)

          const storedMembershipInfo = window.localStorage.getItem(
            "membershipInfo"
          )
            ? JSON.parse(window.localStorage.getItem("membershipInfo"))
            : { loyalPoint: 1500 }

          setLoyalPoint(storedMembershipInfo.loyalPoint)
          setLoading(false)
        }, 500)
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Failed to load membership data. Please try again later.")
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Calculate tier information based on loyalty points and percentage system
  const overallPercentage = pointsToPercentage(loyalPoint)
  const currentTier = getUserTier(loyalPoint)
  const nextTier = getNextTier(currentTier)
  const pointsToNextTier = getPointsToNextTier(loyalPoint)
  const progressPercentage = calculateProgressPercentage(loyalPoint)

  // Handle sign out function
  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      // Replace with your actual sign out logic
      // await fetch('/api/auth/signout', { method: 'POST' })

      // For development, simulate sign out process
      setTimeout(() => {
        setIsSigningOut(false)
        // In production, redirect to login page
        // router.push('/login')
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
            <div className="w-full h-64 p-4 bg-white rounded-lg shadow-sm animate-pulse"></div>
          </div>
          <div className="w-full md:w-3/4">
            <div className="w-full bg-white rounded-lg shadow-sm h-96 animate-pulse"></div>
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
          <button
            className="px-4 py-2 mt-4 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Render the actual content once data is loaded
  return (
    <div className="">
      <div className="flex ">
        {/* Main Content */}
        <div className="w-full ">
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
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Membership
