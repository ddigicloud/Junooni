import React from "react"
import { Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@medusajs/ui"
import OrderOverview from "@modules/account/components/order-overview"

const OrdersTab = ({ orders, customer }) => {
  return (
    <div>
      <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Orders</h1>

          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
            />
            <Search
              className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
              size={18}
            />
          </div>
        </div>

        {/* Using OrderOverview component for API orders */}
        {customer?.orders?.length > 0 || orders.length > 0 ? (
          <OrderOverview orders={orders} />
        ) : (
          <div className="flex flex-col items-center w-full py-8 gap-y-4">
            <h2 className="text-large-semi">Nothing to see here</h2>
            <p className="text-center text-base-regular">
              You don&apos;t have any orders yet, let&apos;s change that :)
            </p>
            <div className="mt-4">
              <Link href="/">
                <Button className="px-6 py-3 bg-[#e65100] text-white rounded-lg hover:bg-[#d84315] transition">
                  Continue shopping
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersTab
