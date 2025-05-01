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
} from "lucide-react"
import Thumbnail from "@modules/products/components/thumbnail"
import { convertToLocale } from "@lib/util/money"

type OrderOverviewProps = {
  orders: HttpTypes.StoreOrder[]
}

const OrderOverview = ({ orders }: OrderOverviewProps) => {
  // State to track how many orders to show
  const [displayCount, setDisplayCount] = useState(6)

  // Function to load more orders
  const handleLoadMore = () => {
    setDisplayCount((prevCount) => prevCount + 6)
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

  // Get status badge based on order status
  const getStatusBadge = (status: string = "pending") => {
    const statusMap: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-blue-100 text-blue-800", label: "Pending" },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
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

  if (orders?.length) {
    // Get the subset of orders to display based on the current displayCount
    const displayedOrders = orders.slice(0, displayCount)

    return (
      <div className="w-full">
        <div className="space-y-4">
          {displayedOrders.map((order) => {
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
                    {order.status && (
                      <span>{getStatusBadge(order.status)}</span>
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
          })}
        </div>

        {/* Load more button - only show if there are more orders to load */}
        {displayCount < orders.length && (
          <div className="flex justify-center mt-8">
            <Button
              variant="secondary"
              onClick={handleLoadMore}
              className="flex items-center px-6 py-2"
            >
              Load more orders
              <ArrowDown size={16} className="ml-2" />
            </Button>
          </div>
        )}

        {/* Order count summary */}
        <div className="mt-4 text-sm text-center text-gray-500">
          Showing {Math.min(displayCount, orders.length)} of {orders.length}{" "}
          orders
        </div>
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
        <div className="flex items-center justify-center w-20 h-20 mb-5 text-indigo-600 bg-indigo-100 rounded-full">
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
