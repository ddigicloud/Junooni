import { Button } from "@medusajs/ui"
import { useMemo } from "react"
import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Package, Calendar, CreditCard, ExternalLink, Eye } from "lucide-react"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  // Calculate total number of items in the order
  const numberOfLines = useMemo(() => {
    return order.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0
  }, [order])

  // Calculate total number of different products
  const numberOfProducts = useMemo(() => {
    return order.items?.length ?? 0
  }, [order])

  // Format date for better readability
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

  return (
    <div
      className="overflow-hidden bg-white border border-gray-100 rounded-lg shadow-sm"
      data-testid="order-card"
    >
      {/* Order Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <span
              className="text-lg font-semibold text-gray-900"
              data-testid="order-display-id"
            >
              #{order.display_id}
            </span>
            {order.status && (
              <span className="ml-3">{getStatusBadge(order.status)}</span>
            )}
          </div>
          <LocalizedClientLink
            href={`/account/orders/details/${order.id}`}
            className="flex items-center text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800"
          >
            <Eye size={16} className="mr-1" />
            View Details
          </LocalizedClientLink>
        </div>
      </div>

      {/* Order Info */}
      <div className="p-4">
        {/* Order Metadata */}
        <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
          <div className="flex items-center" title="Order Date">
            <Calendar size={16} className="mr-1 text-gray-400" />
            <span data-testid="order-created-at">
              {formatDate(order.created_at)}
            </span>
          </div>
          <div className="flex items-center" title="Order Total">
            <CreditCard size={16} className="mr-1 text-gray-400" />
            <span data-testid="order-amount">
              {convertToLocale({
                amount: order.total,
                currency_code: order.currency_code,
              })}
            </span>
          </div>
          <div className="flex items-center" title="Items">
            <Package size={16} className="mr-1 text-gray-400" />
            <span>{`${numberOfLines} ${
              numberOfLines > 1 ? "items" : "item"
            }`}</span>
          </div>
        </div>

        {/* Order Items Grid */}
        <div className="mt-4">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {order.items?.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex flex-col"
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
                    className="font-medium truncate"
                    data-testid="item-title"
                    title={item.title}
                  >
                    {item.title}
                  </span>
                  <span className="flex-shrink-0 ml-1">×{item.quantity}</span>
                </div>
              </div>
            ))}

            {numberOfProducts > 5 && (
              <div className="flex flex-col items-center justify-center w-full text-gray-500 border border-gray-100 rounded aspect-square bg-gray-50">
                <span className="text-sm font-medium">
                  +{numberOfProducts - 5}
                </span>
                <span className="text-xs">more</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Footer */}
      <div className="flex justify-end px-4 py-3 border-t border-gray-100 bg-gray-50">
        <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
          <Button
            data-testid="order-details-link"
            variant="secondary"
            className="flex items-center"
          >
            See details
            <ExternalLink size={16} className="ml-1" />
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderCard
