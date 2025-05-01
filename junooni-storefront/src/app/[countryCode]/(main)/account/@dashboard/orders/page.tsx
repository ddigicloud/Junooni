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
    <div className="w-full  mx-auto" data-testid="orders-page-wrapper">
      {/* Page Header Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600">
                <ShoppingBag size={24} />
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
              <p className="text-sm text-gray-600 mt-1">
                View and manage your complete order history
              </p>
            </div>
          </div>

          <div className="mt-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-base text-gray-700">
              View your previous orders and their status. You can also create
              returns or exchanges for your orders if needed. For any
              order-related questions, please contact our customer support team.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
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

              <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
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

              <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                  <Package size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Support</h3>
                  <p className="text-xs text-gray-500">Get help with orders</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Overview Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="p-6">
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
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No orders yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't placed any orders yet.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Request Order Transfer
            </h2>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-700">
              If you've placed an order as a guest or on another account, you
              can request to have it transferred to your current account. Please
              fill out the form below with your order details.
            </p>
          </div>

          <TransferRequestForm />
        </div>
      </div>
    </div>
  )
}
