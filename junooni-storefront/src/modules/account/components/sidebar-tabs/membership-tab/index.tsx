import React, { useState } from "react"
import {
  Clock,
  Gift,
  Star,
  Truck,
  ChevronRight,
  ChevronDown,
} from "lucide-react"

const MembershipTab = ({
  user,
  currentTier,
  nextTier,
  loyalPoint,
  pointsToNextTier,
  overallPercentage,
  progressPercentage,
  getPercentageToNextTier,
  tierPercentages = { SILVER: 0, GOLD: 25, PLATINUM: 50, DIAMOND: 75 }, // Default values
  maxPoints = 10000,
}) => {
  // State for expanding points history sections
  const [expandedHistory, setExpandedHistory] = useState(false)

  // Sample points history data (replace with real data in production)
  const pointsHistory = [
    {
      id: "ph-1",
      date: "April 12, 2025",
      event: "Purchase",
      description: "Tour Collector's Edition Bundle",
      points: 450,
      balance: loyalPoint,
    },
    {
      id: "ph-2",
      date: "March 28, 2025",
      event: "Event Attendance",
      description: "Livestream Q&A Session",
      points: 250,
      balance: loyalPoint - 450,
    },
    {
      id: "ph-3",
      date: "March 15, 2025",
      event: "Purchase",
      description: "Limited Edition Vinyl",
      points: 350,
      balance: loyalPoint - 450 - 250,
    },
    {
      id: "ph-4",
      date: "February 27, 2025",
      event: "Social Share",
      description: "Shared new release on social media",
      points: 100,
      balance: loyalPoint - 450 - 250 - 350,
    },
    {
      id: "ph-5",
      date: "February 10, 2025",
      event: "Review",
      description: "Product review",
      points: 150,
      balance: loyalPoint - 450 - 250 - 350 - 100,
    },
  ]

  // Calculate points earned in the last 30 days
  const recentPoints = pointsHistory
    .filter((item) => {
      const itemDate = new Date(item.date)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return itemDate >= thirtyDaysAgo
    })
    .reduce((sum, item) => sum + item.points, 0)

  return (
    <div>
      <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-sm">
        {/* Membership Header */}
        <div className="bg-gradient-to-r from-[#e65100] to-[#ff9800] text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold">{currentTier} Status</h1>
              <p>Unlocking exclusive perks since {user.joinDate}</p>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold">{loyalPoint}</div>
              <div>Fan Points</div>
              <div className="mt-1 text-sm">
                ({Math.round(overallPercentage)}% of max)
              </div>
            </div>
          </div>
        </div>

        {/* Membership Progress */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">
              Current Tier: {currentTier} ({Math.round(overallPercentage)}%)
            </span>
            {nextTier && (
              <span className="text-sm text-gray-500">
                {pointsToNextTier} points (
                {Math.round(getPercentageToNextTier(loyalPoint))}%) until{" "}
                {nextTier}
              </span>
            )}
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-[#e65100] h-2.5 rounded-full"
              style={{ width: `${overallPercentage}%` }}
            ></div>
          </div>

          {/* Tier markers at their percentage positions */}
          <div className="relative w-full h-6 mb-1">
            {/* Silver marker at 0% */}
            <div
              className="absolute left-0 transform -translate-x-1/2"
              style={{ left: "0%" }}
            >
              <div className="w-1 h-3 mx-auto mb-1 bg-gray-400"></div>
              <span className="text-xs">0%</span>
            </div>

            {/* Gold marker at 25% */}
            <div
              className="absolute left-0 transform -translate-x-1/2"
              style={{ left: "25%" }}
            >
              <div className="w-1 h-3 mx-auto mb-1 bg-yellow-400"></div>
              <span className="text-xs">25%</span>
            </div>

            {/* Platinum marker at 50% */}
            <div
              className="absolute left-0 transform -translate-x-1/2"
              style={{ left: "50%" }}
            >
              <div className="w-1 h-3 mx-auto mb-1 bg-purple-400"></div>
              <span className="text-xs">50%</span>
            </div>

            {/* Diamond marker at 75% */}
            <div
              className="absolute left-0 transform -translate-x-1/2"
              style={{ left: "75%" }}
            >
              <div className="w-1 h-3 mx-auto mb-1 bg-blue-400"></div>
              <span className="text-xs">75%</span>
            </div>

            {/* Max marker at 100% */}
            <div
              className="absolute right-0 transform translate-x-1/2"
              style={{ right: "0%" }}
            >
              <div className="w-1 h-3 mx-auto mb-1 bg-green-400"></div>
              <span className="text-xs">100%</span>
            </div>
          </div>

          <div className="flex justify-around text-xs">
            <span>
              Silver Fan
              <br />
              (0-25%)
            </span>
            <span>
              Gold Fan
              <br />
              (25-50%)
            </span>
            <span>
              Platinum Fan
              <br />
              (50-75%)
            </span>
            <span>
              Diamond Fan
              <br />
              (75-100%)
            </span>
          </div>
        </div>

        {/* Membership Benefits */}
        <div className="p-6 border-b">
          <h2 className="mb-4 text-lg font-semibold">
            Your {currentTier} Benefits
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-start p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-4 bg-yellow-100 rounded-full">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div>
                <h3 className="mb-1 font-medium">Early Access</h3>
                <p className="text-sm text-gray-600">
                  Get access to new merchandise 24 hours before general release
                </p>
              </div>
            </div>

            <div className="flex items-start p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-4 bg-green-100 rounded-full">
                <Gift size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="mb-1 font-medium">Exclusive Content</h3>
                <p className="text-sm text-gray-600">
                  Access behind-the-scenes content from your favorite creators
                </p>
              </div>
            </div>

            <div className="flex items-start p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-4 bg-purple-100 rounded-full">
                <Star size={20} className="text-purple-600" />
              </div>
              <div>
                <h3 className="mb-1 font-medium">Points Multiplier</h3>
                <p className="text-sm text-gray-600">
                  Earn{" "}
                  {currentTier === "Silver Fan"
                    ? "1x"
                    : currentTier === "Gold Fan"
                    ? "2x"
                    : currentTier === "Platinum Fan"
                    ? "3x"
                    : "4x"}
                  fan points on all purchases, limited drops, and events
                </p>
              </div>
            </div>

            <div className="flex items-start p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-4 bg-blue-100 rounded-full">
                <Truck size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="mb-1 font-medium">
                  {currentTier === "Silver Fan" ? "Standard" : "Free"} Shipping
                </h3>
                <p className="text-sm text-gray-600">
                  {currentTier === "Silver Fan"
                    ? "Standard shipping rates apply"
                    : currentTier === "Gold Fan"
                    ? "Free standard shipping on all orders over $35"
                    : currentTier === "Platinum Fan"
                    ? "Free expedited shipping on all orders"
                    : "Free priority shipping on all orders"}
                </p>
              </div>
            </div>
          </div>

          {nextTier && (
            <div className="mt-6">
              <h3 className="mb-3 font-medium">
                Next Tier: {nextTier} (
                {nextTier === "Gold Fan"
                  ? "25-50%"
                  : nextTier === "Platinum Fan"
                  ? "50-75%"
                  : "75-100%"}
                )
              </h3>
              <div className="p-4 border border-gray-200 rounded-lg">
                <ul className="space-y-2 text-sm text-gray-600">
                  {nextTier === "Gold Fan" && (
                    <>
                      <li className="flex items-start">
                        <span className="text-[#e65100] mr-2">•</span>
                        <span>2x points multiplier on purchases</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#e65100] mr-2">•</span>
                        <span>
                          Free standard shipping on all orders over $35
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#e65100] mr-2">•</span>
                        <span>Access to member-only merchandise</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#e65100] mr-2">•</span>
                        <span>
                          Tier represents 25-50% of maximum loyalty level
                        </span>
                      </li>
                    </>
                  )}

                  {nextTier === "Platinum Fan" && (
                    <>
                      <li className="flex items-start">
                        <span className="text-[#e65100] mr-2">•</span>
                        <span>
                          Exclusive virtual meet & greets with select creators
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
                          Monthly exclusive drops only for Platinum and Diamond
                          fans
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#e65100] mr-2">•</span>
                        <span>
                          Tier represents 50-75% of maximum loyalty level
                        </span>
                      </li>
                    </>
                  )}

                  {nextTier === "Diamond Fan" && (
                    <>
                      <li className="flex items-start">
                        <span className="text-[#e65100] mr-2">•</span>
                        <span>VIP access to creator events and concerts</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#e65100] mr-2">•</span>
                        <span>4x points multiplier on purchases</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#e65100] mr-2">•</span>
                        <span>Free priority shipping on all orders</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#e65100] mr-2">•</span>
                        <span>Personalized shopping concierge service</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#e65100] mr-2">•</span>
                        <span>
                          Tier represents 75-100% of maximum loyalty level
                        </span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Points History */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Points Activity</h2>
            <div className="text-sm">
              <span className="font-medium">{recentPoints}</span> points earned
              in the last 30 days
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg">
            <div className="px-4 py-3 bg-gray-50">
              <button
                className="flex items-center justify-between w-full text-left focus:outline-none"
                onClick={() => setExpandedHistory(!expandedHistory)}
              >
                <span className="font-medium">Recent Activity</span>
                {expandedHistory ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>
            </div>

            {expandedHistory && (
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-2 font-medium text-left">Date</th>
                        <th className="pb-2 font-medium text-left">Event</th>
                        <th className="pb-2 font-medium text-left">
                          Description
                        </th>
                        <th className="pb-2 font-medium text-right">Points</th>
                        <th className="pb-2 font-medium text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pointsHistory.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-3">{item.date}</td>
                          <td className="py-3">{item.event}</td>
                          <td className="py-3">{item.description}</td>
                          <td className="py-3 text-right text-green-600">
                            +{item.points}
                          </td>
                          <td className="py-3 text-right">{item.balance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ways to Earn Points */}
        <div className="p-6 bg-gray-50">
          <h2 className="mb-4 text-lg font-semibold">
            Ways to Earn More Points
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <h3 className="mb-1 font-medium">Make a Purchase</h3>
              <p className="text-sm text-gray-600">
                Earn{" "}
                {currentTier === "Silver Fan"
                  ? "1x"
                  : currentTier === "Gold Fan"
                  ? "2x"
                  : currentTier === "Platinum Fan"
                  ? "3x"
                  : "4x"}{" "}
                points for every $1 spent
              </p>
            </div>

            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <h3 className="mb-1 font-medium">Attend Events</h3>
              <p className="text-sm text-gray-600">
                Earn 100-500 points for virtual and in-person events
              </p>
            </div>

            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <h3 className="mb-1 font-medium">Share & Review</h3>
              <p className="text-sm text-gray-600">
                Earn 50-150 points for social shares and product reviews
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Membership FAQ</h2>
        <div className="space-y-4">
          <div>
            <h3 className="mb-1 font-medium">How are tiers calculated?</h3>
            <p className="text-sm text-gray-600">
              Tiers are based on the percentage of maximum points ({maxPoints}).
              Silver Fan (0-25%), Gold Fan (25-50%), Platinum Fan (50-75%), and
              Diamond Fan (75-100%).
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-medium">Do my points expire?</h3>
            <p className="text-sm text-gray-600">
              Points are valid for 12 months from the date they were earned.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-medium">
              How do I reach the next membership tier?
            </h3>
            <p className="text-sm text-gray-600">
              Continue earning points through purchases, attending events, and
              engaging with your favorite creators. You need {pointsToNextTier}{" "}
              more points to reach {nextTier || "maximum status"}.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MembershipTab
