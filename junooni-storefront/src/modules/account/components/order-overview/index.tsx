"use client"

import { useState } from "react"
import { Button } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ShoppingBag,
  Calendar,
  CreditCard,
  Package,
  ChevronRight,
  Eye,
  ArrowDown,
  ChevronLeft,
  MoreHorizontal,
} from "lucide-react"
import Thumbnail from "@modules/products/components/thumbnail"
import { convertToLocale } from "@lib/util/money"

type OrderOverviewProps = {
  orders: HttpTypes.StoreOrder[]
}

const OrderOverview = ({ orders }: OrderOverviewProps) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [ordersPerPage, setOrdersPerPage] = useState(6)
  const [viewMode, setViewMode] = useState<'pagination' | 'loadMore'>('pagination')

  // Calculate pagination values
  const totalPages = Math.ceil(orders.length / ordersPerPage)
  const startIndex = (currentPage - 1) * ordersPerPage
  const endIndex = startIndex + ordersPerPage
  const currentOrders = orders.slice(startIndex, endIndex)

  // Load more functionality for alternative view
  const [displayCount, setDisplayCount] = useState(6)
  const loadMoreOrders = orders.slice(0, displayCount)

  // Function to load more orders (for load more mode)
  const handleLoadMore = () => {
    setDisplayCount((prevCount) => prevCount + 6)
  }

  // Pagination functions
  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToPrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const goToNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
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
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('ellipsis')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Function to get the correct display status based on fulfillment and order status
  const getDisplayStatus = (order: HttpTypes.StoreOrder) => {
    // Priority: fulfillment_status > order.status
    if (order.fulfillment_status) {
      return order.fulfillment_status
    }
    return order.status || 'pending'
  }

  // Get status badge based on order status
  const getStatusBadge = (order: HttpTypes.StoreOrder) => {
    const status = getDisplayStatus(order)
    
    const statusMap: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-blue-100 text-blue-800", label: "Pending" },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      fulfilled: { color: "bg-green-100 text-green-800", label: "Fulfilled" },
      delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
      shipped: { color: "bg-purple-100 text-purple-800", label: "Shipped" },
      canceled: { color: "bg-red-100 text-red-800", label: "Canceled" },
      requires_action: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Action Required",
      },
    }

    const { color, label } = statusMap[status] || {
      color: "bg-gray-100 text-gray-800",
      label: status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
      >
        {label}
      </span>
    )
  }

  // Render order card
  const renderOrderCard = (order: HttpTypes.StoreOrder) => {
    const numberOfLines =
      order.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0

    return (
      <div
        key={order.id}
        className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
        data-testid="order-card"
      >
        {/* Order Header */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <span
              className="text-lg font-semibold text-gray-900"
              data-testid="order-display-id"
            >
              Order #{order.display_id}
            </span>
            {getDisplayStatus(order) && (
              <span>{getStatusBadge(order)}</span>
            )}
          </div>

          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="flex items-center" title="Order Date">
              <Calendar size={14} className="mr-1 text-gray-400" />
              <span data-testid="order-created-at">
                {formatDate(order.created_at)}
              </span>
            </div>

            <div className="flex items-center" title="Order Total">
              <CreditCard size={14} className="mr-1 text-gray-400" />
              <span data-testid="order-amount" className="font-medium">
                {convertToLocale({
                  amount: order.total,
                  currency_code: order.currency_code,
                })}
              </span>
            </div>

            <div className="flex items-center" title="Items">
              <Package size={14} className="mr-1 text-gray-400" />
              <span>{`${numberOfLines} ${
                numberOfLines > 1 ? "items" : "item"
              }`}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="p-4">
          <div className="flex pb-2 -mx-1 overflow-x-auto">
            {order.items?.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex flex-col flex-shrink-0 px-1"
                style={{ width: "100px" }}
                data-testid="order-item"
              >
                <div className="w-full mb-1 overflow-hidden border border-gray-100 rounded aspect-square bg-gray-50">
                  <Thumbnail
                    thumbnail={item.thumbnail}
                    images={[]}
                    size="full"
                  />
                </div>
                <div className="flex items-center overflow-hidden text-xs text-gray-700 whitespace-nowrap">
                  <span
                    className="truncate"
                    data-testid="item-title"
                    title={item.title}
                    style={{ maxWidth: "80px" }}
                  >
                    {item.title}
                  </span>
                  <span className="flex-shrink-0 ml-1 text-gray-500">
                    ×{item.quantity}
                  </span>
                </div>
              </div>
            ))}

            {(order.items?.length || 0) > 5 && (
              <div
                className="flex items-center justify-center flex-shrink-0 px-1"
                style={{ width: "100px" }}
              >
                <div className="flex flex-col items-center justify-center w-full text-gray-500 border border-gray-100 rounded aspect-square bg-gray-50">
                  <span className="text-sm font-medium">
                    +{(order.items?.length || 0) - 5}
                  </span>
                  <span className="text-xs">more</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {order.shipping_address && (
              <div className="flex items-center">
                <span className="mr-1 font-medium">Delivery:</span>
                {order.shipping_address.address_1},
                {order.shipping_address.city}
                {order.shipping_address.postal_code &&
                  `, ${order.shipping_address.postal_code}`}
              </div>
            )}
          </div>

          <LocalizedClientLink
            href={`/account/orders/details/${order.id}`}
          >
            <Button
              data-testid="order-details-link"
              variant="secondary"
              className="flex items-center"
            >
              <Eye size={16} className="mr-1" />
              View Details
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  if (orders?.length) {
    const ordersToDisplay = viewMode === 'pagination' ? currentOrders : loadMoreOrders

    return (
      <div className="w-full">
        {/* Controls Section */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('pagination')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'pagination'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pages
              </button>
              <button
                onClick={() => setViewMode('loadMore')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'loadMore'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Load More
              </button>
            </div>
          </div>

          {/* Orders per page selector (only for pagination mode) */}
          {viewMode === 'pagination' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={ordersPerPage}
                onChange={(e) => {
                  setOrdersPerPage(Number(e.target.value))
                  setCurrentPage(1) // Reset to first page when changing page size
                }}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value={6}>6 orders</option>
                <option value={12}>12 orders</option>
                <option value={24}>24 orders</option>
                <option value={50}>50 orders</option>
              </select>
            </div>
          )}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {ordersToDisplay.map(renderOrderCard)}
        </div>

        {/* Pagination Controls */}
        {viewMode === 'pagination' && totalPages > 1 && (
          <div className="flex flex-col items-center justify-between mt-8 space-y-4 sm:flex-row sm:space-y-0">
            {/* Page Info */}
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, orders.length)} of {orders.length} orders
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center space-x-1">
              {/* Previous Button */}
              <button
                onClick={goToPrevious}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {generatePageNumbers().map((page, index) => (
                  <div key={index}>
                    {page === 'ellipsis' ? (
                      <span className="px-3 py-2 text-gray-400">
                        <MoreHorizontal size={16} />
                      </span>
                    ) : (
                      <button
                        onClick={() => goToPage(page as number)}
                        className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                          currentPage === page
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={goToNext}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Load More Controls */}
        {viewMode === 'loadMore' && (
          <div className="flex flex-col items-center mt-8 space-y-4">
            {/* Load more button - only show if there are more orders to load */}
            {displayCount < orders.length && (
              <Button
                variant="secondary"
                onClick={handleLoadMore}
                className="flex items-center px-6 py-2"
              >
                Load more orders
                <ArrowDown size={16} className="ml-2" />
              </Button>
            )}

            {/* Order count summary */}
            <div className="text-sm text-gray-500">
              Showing {Math.min(displayCount, orders.length)} of {orders.length} orders
            </div>
          </div>
        )}
      </div>
    )
  }

  // Empty state when no orders
  return (
    <div
      className="flex flex-col items-center justify-center w-full px-4 py-16 text-center border border-gray-300 border-dashed rounded-lg bg-gray-50"
      data-testid="no-orders-container"
    >
      <div className="flex flex-col items-center max-w-md">
        <div className="flex items-center justify-center w-20 h-20 mb-5 text-orange-600 bg-indigo-100 rounded-full">
          <ShoppingBag size={32} />
        </div>

        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          No orders yet
        </h2>

        <p className="mb-8 text-base text-gray-600">
          You haven't placed any orders yet. Browse our collection and find
          something you love!
        </p>

        <LocalizedClientLink href="/" passHref>
          <Button
            data-testid="continue-shopping-button"
            className="flex items-center px-6 py-3"
          >
            Start Shopping Now
            <ChevronRight size={16} className="ml-2" />
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderOverview