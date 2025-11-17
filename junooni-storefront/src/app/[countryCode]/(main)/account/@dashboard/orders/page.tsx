import { Metadata } from "next"
import { notFound } from "next/navigation"
import { ShoppingBag, Package, ArrowRight } from "lucide-react"
import OrderOverview from "@modules/account/components/order-overview"
import { listOrders } from "@lib/data/orders"
import Divider from "@modules/common/components/divider"
import TransferRequestForm from "@modules/account/components/transfer-request-form"

export const metadata: Metadata = {
  title: "Your Orders | My Store",
  description:
    "View and manage your order history, create returns or exchanges, and track shipments.",
}

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full mx-auto" data-testid="orders-page-wrapper">
      {/* Page Header Section */}
      <div className="mb-8 overflow-hidden bg-white rounded-lg shadow">
        <div className="px-2 py-4 sm:p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 text-indigo-600 bg-indigo-100 rounded-full">
                <ShoppingBag size={24} />
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
              <p className="mt-1 text-sm text-gray-600">
                View and manage your complete order history
              </p>
            </div>
          </div>

          <div className="p-4 mt-2 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-base text-gray-700">
              View your previous orders and their status. You can also create
              returns or exchanges for your orders if needed. For any
              order-related questions, please contact our customer support team.
            </p>

            {/* <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-3">
              <div className="flex items-center p-3 bg-white border border-gray-100 rounded-md shadow-sm">
                <div className="flex items-center justify-center w-8 h-8 mr-3 text-green-600 bg-green-100 rounded-full">
                  <Package size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Track Orders
                  </h3>
                  <p className="text-xs text-gray-500">Check shipping status</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-gray-400" />
              </div>

              <div className="flex items-center p-3 bg-white border border-gray-100 rounded-md shadow-sm">
                <div className="flex items-center justify-center w-8 h-8 mr-3 text-blue-600 bg-blue-100 rounded-full">
                  <Package size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Returns</h3>
                  <p className="text-xs text-gray-500">
                    Initiate return process
                  </p>
                </div>
                <ArrowRight size={16} className="ml-auto text-gray-400" />
              </div>

              <div className="flex items-center p-3 bg-white border border-gray-100 rounded-md shadow-sm">
                <div className="flex items-center justify-center w-8 h-8 mr-3 text-purple-600 bg-purple-100 rounded-full">
                  <Package size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Support</h3>
                  <p className="text-xs text-gray-500">Get help with orders</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-gray-400" />
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Orders Overview Section */}
      <div className="mb-8 overflow-hidden bg-white rounded-lg sm:shadow md:shadow-lg">
        <div className="px-0 py-2 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Order History
            </h2>
            {orders.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </span>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No orders yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't placed any orders yet.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-[#e65100] hover:bg-[#e65100] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e65100]"
                >
                  Start shopping
                </button>
              </div>
            </div>
          ) : (
            <OrderOverview orders={orders} />
          )}
        </div>
      </div>

      {/* Transfer Request Section */}
      {/* <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Request Order Transfer
            </h2>
          </div>

          <div className="p-4 mb-6 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-700">
              If you've placed an order as a guest or on another account, you
              can request to have it transferred to your current account. Please
              fill out the form below with your order details.
            </p>
          </div>

          <TransferRequestForm />
        </div>
      </div> */}
    </div>
  )
}
