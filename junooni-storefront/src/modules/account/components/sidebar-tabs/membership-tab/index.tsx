import React, { useState, useEffect } from "react"
import {
  Clock,
  Gift,
  Star,
  Truck,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
} from "lucide-react"

export default function MembershipTab({
  user = { joinDate: "2023" },
  currentTier = "Silver Fan",
  nextTier = "Gold Fan",
  loyalPoint = 1250,
  pointsToNextTier = 1250,
  overallPercentage = 12.5,
  progressPercentage = 50,
  getPercentageToNextTier = (points) => (points / 2500) * 100,
  tierPercentages = { SILVER: 0, GOLD: 25, PLATINUM: 50, DIAMOND: 75 },
  maxPoints = 10000,
  pointsHistory = [
    { id: 1, date: '2024-07-20', event: 'Purchase', description: 'Order #12345 - T-shirt', points: 25, balance: 1250, orderPrice: 25.00 },
    { id: 2, date: '2024-07-18', event: 'Event', description: 'Virtual meet & greet attendance', points: 100, balance: 1225, orderPrice: null },
    { id: 3, date: '2024-07-15', event: 'Review', description: 'Product review for hoodie', points: 50, balance: 1125, orderPrice: null },
    { id: 4, date: '2024-07-10', event: 'Purchase', description: 'Order #12344 - Cap', points: 15, balance: 1075, orderPrice: 15.00 },
    { id: 5, date: '2024-07-08', event: 'Share', description: 'Social media share', points: 25, balance: 1060, orderPrice: null },
    { id: 6, date: '2024-07-05', event: 'Purchase', description: 'Order #12343 - Poster', points: 10, balance: 1035, orderPrice: 10.00 },
    { id: 7, date: '2024-07-01', event: 'Event', description: 'Live stream participation', points: 75, balance: 1025, orderPrice: null },
    { id: 8, date: '2024-06-28', event: 'Purchase', description: 'Order #12342 - Stickers', points: 8, balance: 950, orderPrice: 8.00 },
    { id: 9, date: '2024-06-25', event: 'Review', description: 'Album review', points: 50, balance: 942, orderPrice: null },
    { id: 10, date: '2024-06-22', event: 'Purchase', description: 'Order #12341 - Limited edition tee', points: 40, balance: 892, orderPrice: 40.00 },
    { id: 11, date: '2024-06-20', event: 'Event', description: 'Q&A session attendance', points: 50, balance: 852, orderPrice: null },
    { id: 12, date: '2024-06-18', event: 'Share', description: 'Story repost', points: 15, balance: 802, orderPrice: null },
    { id: 13, date: '2024-06-15', event: 'Purchase', description: 'Order #12340 - Vinyl record', points: 35, balance: 787, orderPrice: 35.00 },
    { id: 14, date: '2024-06-12', event: 'Event', description: 'Exclusive preview access', points: 100, balance: 752, orderPrice: null },
    { id: 15, date: '2024-06-10', event: 'Purchase', description: 'Order #12339 - Merchandise bundle', points: 60, balance: 652, orderPrice: 60.00 },
  ],
  loading = false,
}) {
  // State for expanding points history sections
  const [expandedHistory, setExpandedHistory] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Calculate points earned in the last 30 days from real data
  const recentPoints = pointsHistory
    .filter((item) => {
      const itemDate = new Date(item.date)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return itemDate >= thirtyDaysAgo
    })
    .reduce((sum, item) => sum + item.points, 0)

  // Pagination calculations
  const totalPages = Math.ceil(pointsHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageData = pointsHistory.slice(startIndex, endIndex)

  // Reset to first page when pointsHistory changes
  useEffect(() => {
    setCurrentPage(1)
  }, [pointsHistory])

  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <div>
      <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-sm">
        {/* Membership Header */}
        <div className="p-6 text-white bg-gradient-to-r from-orange-600 to-orange-400">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold">{currentTier} Status</h1>
              <p>Unlocking exclusive perks since {user?.joinDate}</p>
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
              className="bg-orange-600 h-2.5 rounded-full"
              style={{ width: `${overallPercentage}%` }}
            ></div>
          </div>

          {/* Tier markers at their percentage positions */}
          <div className="relative w-full h-6 mb-1">
            <div className="absolute left-0 transform -translate-x-1/2" style={{ left: "0%" }}>
              <div className="w-1 h-3 mx-auto mb-1 bg-gray-400"></div>
              <span className="text-xs">0%</span>
            </div>
            <div className="absolute left-0 transform -translate-x-1/2" style={{ left: "25%" }}>
              <div className="w-1 h-3 mx-auto mb-1 bg-yellow-400"></div>
              <span className="text-xs">25%</span>
            </div>
            <div className="absolute left-0 transform -translate-x-1/2" style={{ left: "50%" }}>
              <div className="w-1 h-3 mx-auto mb-1 bg-purple-400"></div>
              <span className="text-xs">50%</span>
            </div>
            <div className="absolute left-0 transform -translate-x-1/2" style={{ left: "75%" }}>
              <div className="w-1 h-3 mx-auto mb-1 bg-blue-400"></div>
              <span className="text-xs">75%</span>
            </div>
            <div className="absolute right-0 transform translate-x-1/2" style={{ right: "0%" }}>
              <div className="w-1 h-3 mx-auto mb-1 bg-green-400"></div>
              <span className="text-xs">100%</span>
            </div>
          </div>

          <div className="flex justify-around text-xs">
            <span>Silver Fan<br />(0-25%)</span>
            <span>Gold Fan<br />(25-50%)</span>
            <span>Platinum Fan<br />(50-75%)</span>
            <span>Diamond Fan<br />(75-100%)</span>
          </div>
        </div>

        {/* Membership Benefits */}
        <div className="p-6 border-b">
          <h2 className="mb-4 text-lg font-semibold">Your {currentTier} Benefits</h2>

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
                        <span className="mr-2 text-orange-600">•</span>
                        <span>2x points multiplier on purchases</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-orange-600">•</span>
                        <span>Free standard shipping on all orders over $35</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-orange-600">•</span>
                        <span>Access to member-only merchandise</span>
                      </li>
                    </>
                  )}
                  {nextTier === "Platinum Fan" && (
                    <>
                      <li className="flex items-start">
                        <span className="mr-2 text-orange-600">•</span>
                        <span>Exclusive virtual meet & greets with select creators</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-orange-600">•</span>
                        <span>3x points multiplier on purchases</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-orange-600">•</span>
                        <span>Free expedited shipping on all orders</span>
                      </li>
                    </>
                  )}
                  {nextTier === "Diamond Fan" && (
                    <>
                      <li className="flex items-start">
                        <span className="mr-2 text-orange-600">•</span>
                        <span>VIP access to creator events and concerts</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-orange-600">•</span>
                        <span>4x points multiplier on purchases</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-orange-600">•</span>
                        <span>Free priority shipping on all orders</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Points History - Now with Pagination and Order Price Column */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Points Activity</h2>
            <div className="text-sm">
              <span className="font-medium">{recentPoints?.toLocaleString?.() || recentPoints}</span> points earned
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
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="flex items-center space-x-4 animate-pulse">
                        <div className="w-20 h-4 bg-gray-200 rounded"></div>
                        <div className="w-24 h-4 bg-gray-200 rounded"></div>
                        <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                        <div className="w-16 h-4 bg-gray-200 rounded"></div>
                        <div className="w-16 h-4 bg-gray-200 rounded"></div>
                        <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : pointsHistory && pointsHistory.length > 0 ? (
                  <div>
                    {/* Pagination Controls - Top */}
                    <div className="flex items-center justify-between pb-4 mb-4 border-b">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          Showing {startIndex + 1}-{Math.min(endIndex, pointsHistory.length)} of {pointsHistory.length} entries
                        </span>
                        <div className="flex items-center space-x-2">
                          <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                            Show:
                          </label>
                          <select
                            id="itemsPerPage"
                            value={itemsPerPage}
                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                          </select>
                          <span className="text-sm text-gray-600">per page</span>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="pb-2 font-medium text-left">Date</th>
                            <th className="pb-2 font-medium text-left">Event</th>
                            <th className="pb-2 font-medium text-left">Description</th>
                            <th className="pb-2 font-medium text-right">Points</th>
                            <th className="pb-2 font-medium text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentPageData.map((item) => (
                            <tr key={item.id} className="border-b last:border-0">
                              <td className="py-3">
                                {new Date(item.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="py-3">
                                <div className="flex items-center space-x-2">
                                  {/* Event type icon */}
                                  <span className="text-lg">
                                    {item.event?.toLowerCase() === 'purchase' && '🛒'}
                                    {item.event?.toLowerCase() === 'redemption' && '🎁'}
                                    {item.event?.toLowerCase() === 'bonus' && '🎉'}
                                    {item.event?.toLowerCase() === 'refund' && '↩️'}
                                    {item.event?.toLowerCase() === 'event' && '🎪'}
                                    {item.event?.toLowerCase() === 'review' && '⭐'}
                                    {item.event?.toLowerCase() === 'share' && '📤'}
                                    {!['purchase', 'redemption', 'bonus', 'refund', 'event', 'review', 'share'].includes(item.event?.toLowerCase()) && 
                                    (item.points >= 0 ? '➕' : '➖')}
                                  </span>
                                  <span>{item.event}</span>
                                </div>
                              </td>
                              <td className="py-3">
                                <div>
                                  <div className="font-medium">{item.description}</div>
                                  {/* Show reference info if available */}
                                  {item.reference_type && item.reference_id && (
                                    <div className="mt-1 text-xs text-gray-500">
                                      {item.reference_type}: {item.reference_id}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className={`py-3 text-right font-semibold ${item.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {(() => {
                                  const formattedPoints = item.points?.toLocaleString?.() || item.points;
                                  return item.points >= 0 ? `+${formattedPoints}` : formattedPoints;
                                })()}
                              </td>
                              <td className="py-3 text-right text-gray-600">
                                {item.balance?.toLocaleString?.() || item.balance}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls - Bottom */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 mt-6 border-t">
                        <div className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {/* Previous button */}
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft size={16} className="mr-1" />
                            Previous
                          </button>

                          {/* Page numbers */}
                          {getPageNumbers().map((page, index) => (
                            <span key={index}>
                              {page === '...' ? (
                                <span className="px-3 py-1 text-sm text-gray-500">...</span>
                              ) : (
                                <button
                                  onClick={() => handlePageChange(page)}
                                  className={`px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 ${
                                    currentPage === page
                                      ? 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700'
                                      : ''
                                  }`}
                                >
                                  {page}
                                </button>
                              )}
                            </span>
                          ))}

                          {/* Next button */}
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                            <ChevronRight size={16} className="ml-1" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <div className="mb-2">No points activity yet</div>
                    <div className="text-sm">
                      Start earning points by making purchases, attending events, and engaging with content!
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ways to Earn Points */}
        <div className="p-6 bg-gray-50">
          <h2 className="mb-4 text-lg font-semibold">Ways to Earn More Points</h2>
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