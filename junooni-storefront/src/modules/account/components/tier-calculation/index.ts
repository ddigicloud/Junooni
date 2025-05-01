// // Define tier percentages (out of 100%)
// const TIER_PERCENTAGES = {
//   SILVER: 0, // 0-25%
//   GOLD: 25, // 25-50%
//   PLATINUM: 50, // 50-75%
//   DIAMOND: 75, // 75-100%
// }

// // Maximum possible points (can be adjusted based on system design)
// const MAX_POSSIBLE_POINTS = 10000

// // Helper function to convert points to percentage of maximum
// export const pointsToPercentage = (points) => {
//   return Math.min(100, (points / MAX_POSSIBLE_POINTS) * 100)
// }

// // Helper function to determine tier based on percentage
// export const getUserTier = (points) => {
//   const percentage = pointsToPercentage(points)

//   if (percentage >= TIER_PERCENTAGES.DIAMOND) return "Diamond Fan"
//   if (percentage >= TIER_PERCENTAGES.PLATINUM) return "Platinum Fan"
//   if (percentage >= TIER_PERCENTAGES.GOLD) return "Gold Fan"
//   return "Silver Fan"
// }

// // Helper function to get next tier based on current tier
// export const getNextTier = (currentTier) => {
//   switch (currentTier) {
//     case "Silver Fan":
//       return "Gold Fan"
//     case "Gold Fan":
//       return "Platinum Fan"
//     case "Platinum Fan":
//       return "Diamond Fan"
//     default:
//       return null // No next tier for Diamond
//   }
// }

// // Helper function to get percentage needed for next tier
// export const getPercentageToNextTier = (points) => {
//   const currentPercentage = pointsToPercentage(points)

//   if (currentPercentage >= TIER_PERCENTAGES.DIAMOND) {
//     return 100 - currentPercentage // Progress to max (100%)
//   }
//   if (currentPercentage >= TIER_PERCENTAGES.PLATINUM) {
//     return TIER_PERCENTAGES.DIAMOND - currentPercentage
//   }
//   if (currentPercentage >= TIER_PERCENTAGES.GOLD) {
//     return TIER_PERCENTAGES.PLATINUM - currentPercentage
//   }
//   return TIER_PERCENTAGES.GOLD - currentPercentage
// }

// // Helper function to get points needed for next tier
// export const getPointsToNextTier = (points) => {
//   const percentageNeeded = getPercentageToNextTier(points)
//   return Math.ceil((percentageNeeded / 100) * MAX_POSSIBLE_POINTS)
// }

// // Helper function to calculate progress percentage within current tier
// export const calculateProgressPercentage = (points) => {
//   const currentPercentage = pointsToPercentage(points)

//   // For Diamond tier (at or above 75%)
//   if (currentPercentage >= TIER_PERCENTAGES.DIAMOND) {
//     // Calculate progress from Diamond (75%) to max (100%)
//     const tierWidth = 100 - TIER_PERCENTAGES.DIAMOND
//     const progressInTier = currentPercentage - TIER_PERCENTAGES.DIAMOND
//     return Math.min(100, (progressInTier / tierWidth) * 100)
//   }

//   // For Platinum tier (50-75%)
//   if (currentPercentage >= TIER_PERCENTAGES.PLATINUM) {
//     // Calculate progress from Platinum to Diamond
//     const tierWidth = TIER_PERCENTAGES.DIAMOND - TIER_PERCENTAGES.PLATINUM
//     const progressInTier = currentPercentage - TIER_PERCENTAGES.PLATINUM
//     return Math.min(100, (progressInTier / tierWidth) * 100)
//   }

//   // For Gold tier (25-50%)
//   if (currentPercentage >= TIER_PERCENTAGES.GOLD) {
//     // Calculate progress from Gold to Platinum
//     const tierWidth = TIER_PERCENTAGES.PLATINUM - TIER_PERCENTAGES.GOLD
//     const progressInTier = currentPercentage - TIER_PERCENTAGES.GOLD
//     return Math.min(100, (progressInTier / tierWidth) * 100)
//   }

//   // For Silver tier (0-25%)
//   const tierWidth = TIER_PERCENTAGES.GOLD - TIER_PERCENTAGES.SILVER
//   const progressInTier = currentPercentage - TIER_PERCENTAGES.SILVER
//   return Math.min(100, (progressInTier / tierWidth) * 100)
// }

// // Export the constants for use in other components if needed
// export const TIERS = {
//   PERCENTAGES: TIER_PERCENTAGES,
//   MAX_POINTS: MAX_POSSIBLE_POINTS,
// }

// @modules/account/utils/tier-calculations.js

// Define tier percentages (out of 100%)
export const TIER_PERCENTAGES = {
  SILVER: 0, // 0-25%
  GOLD: 25, // 25-50%
  PLATINUM: 50, // 50-75%
  DIAMOND: 75, // 75-100%
}

// Maximum possible points (can be adjusted based on system design)
export const MAX_POSSIBLE_POINTS = 10000

// Helper function to convert points to percentage of maximum
export const pointsToPercentage = (points) => {
  return Math.min(100, (points / MAX_POSSIBLE_POINTS) * 100)
}

// Helper function to determine tier based on percentage
export const getUserTier = (points) => {
  const percentage = pointsToPercentage(points)
  if (percentage >= TIER_PERCENTAGES.DIAMOND) return "Diamond Fan"
  if (percentage >= TIER_PERCENTAGES.PLATINUM) return "Platinum Fan"
  if (percentage >= TIER_PERCENTAGES.GOLD) return "Gold Fan"
  return "Silver Fan"
}

// Helper function to get next tier based on current tier
export const getNextTier = (currentTier) => {
  switch (currentTier) {
    case "Silver Fan":
      return "Gold Fan"
    case "Gold Fan":
      return "Platinum Fan"
    case "Platinum Fan":
      return "Diamond Fan"
    default:
      return null // No next tier for Diamond
  }
}

// Helper function to get percentage needed for next tier
export const getPercentageToNextTier = (points) => {
  const currentPercentage = pointsToPercentage(points)
  if (currentPercentage >= TIER_PERCENTAGES.DIAMOND) {
    return 100 - currentPercentage // Progress to max (100%)
  }
  if (currentPercentage >= TIER_PERCENTAGES.PLATINUM) {
    return TIER_PERCENTAGES.DIAMOND - currentPercentage
  }
  if (currentPercentage >= TIER_PERCENTAGES.GOLD) {
    return TIER_PERCENTAGES.PLATINUM - currentPercentage
  }
  return TIER_PERCENTAGES.GOLD - currentPercentage
}

// Helper function to get points needed for next tier
export const getPointsToNextTier = (points) => {
  const percentageNeeded = getPercentageToNextTier(points)
  return Math.ceil((percentageNeeded / 100) * MAX_POSSIBLE_POINTS)
}

// Helper function to calculate progress percentage within current tier
export const calculateProgressPercentage = (points) => {
  const currentPercentage = pointsToPercentage(points)
  // For Diamond tier (at or above 75%)
  if (currentPercentage >= TIER_PERCENTAGES.DIAMOND) {
    // Calculate progress from Diamond (75%) to max (100%)
    const tierWidth = 100 - TIER_PERCENTAGES.DIAMOND
    const progressInTier = currentPercentage - TIER_PERCENTAGES.DIAMOND
    return Math.min(100, (progressInTier / tierWidth) * 100)
  }
  // For Platinum tier (50-75%)
  if (currentPercentage >= TIER_PERCENTAGES.PLATINUM) {
    // Calculate progress from Platinum to Diamond
    const tierWidth = TIER_PERCENTAGES.DIAMOND - TIER_PERCENTAGES.PLATINUM
    const progressInTier = currentPercentage - TIER_PERCENTAGES.PLATINUM
    return Math.min(100, (progressInTier / tierWidth) * 100)
  }
  // For Gold tier (25-50%)
  if (currentPercentage >= TIER_PERCENTAGES.GOLD) {
    // Calculate progress from Gold to Platinum
    const tierWidth = TIER_PERCENTAGES.PLATINUM - TIER_PERCENTAGES.GOLD
    const progressInTier = currentPercentage - TIER_PERCENTAGES.GOLD
    return Math.min(100, (progressInTier / tierWidth) * 100)
  }
  // For Silver tier (0-25%)
  const tierWidth = TIER_PERCENTAGES.GOLD - TIER_PERCENTAGES.SILVER
  const progressInTier = currentPercentage - TIER_PERCENTAGES.SILVER
  return Math.min(100, (progressInTier / tierWidth) * 100)
}

// Export the constants for use in other components if needed
export const TIERS = {
  PERCENTAGES: TIER_PERCENTAGES,
  MAX_POINTS: MAX_POSSIBLE_POINTS,
}
