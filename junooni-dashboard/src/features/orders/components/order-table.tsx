// import React from "react";
// import { useNavigate } from "@tanstack/react-router";
// import {
//   Table,
//   TableHeader,
//   TableBody,
//   TableRow,
//   TableHead,
//   TableCell,
// } from "@/components/ui/table";

// interface Column {
//   header: string;
//   accessorKey: string;
//   cell?: (info: { getValue: () => any }) => React.ReactNode;
// }

// interface DataTableProps {
//   data: any[];
//   columns: Column[];
// }

// export const DataTable: React.FC<DataTableProps> = ({ data, columns }) => {
//   const navigate = useNavigate();

//   const handleRowClick = (rowData: any) => {
//     // Navigate to /orders/:id with rowData as state
//     navigate({ to: `/orders/${rowData.id}`, state: rowData });
//   };

//   return (
//     <Table>
//       <TableHeader>
//         <TableRow>
//           {columns.map((col) => (
//             <TableHead key={col.accessorKey}>{col.header}</TableHead>
//           ))}
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {data.map((row, rowIndex) => (
//           <TableRow
//             key={rowIndex}
//             onClick={() => handleRowClick(row)}
//             className="cursor-pointer"
//           >
//             {columns.map((col) => (
//               <TableCell key={col.accessorKey}>
//                 {col.cell
//                   ? col.cell({ getValue: () => row[col.accessorKey] })
//                   : row[col.accessorKey]}
//               </TableCell>
//             ))}
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   );
// };
import React, { useState, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { DataTable } from "../components/table/DataTable"
import { columns, VendorOrder } from "./order-columns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, AlertTriangle, ShoppingBag, TrendingUp, Clock, CircleCheck } from "lucide-react"

// ✅ Statistics interface for vendor dashboard
interface VendorStats {
  total_orders: number
  total_revenue: number
  paid_orders: number
  pending_orders: number
}

export const OrderTable: React.FC = () => {
  const [orders, setOrders] = useState<VendorOrder[]>([])
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // ✅ Fetch vendor-specific orders from the new API
  const fetchVendorOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("vendorToken")
      
      if (!token) {
        setError("Authentication required. Please log in.")
        return
      }

      console.log("🔍 Fetching vendor-specific orders...")

      // ✅ Use the new vendor-filtered API endpoint
      const response = await fetch(`http://localhost:9000/api/vendors/orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.")
        }
        throw new Error(`Failed to fetch orders: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Received vendor orders:", data)

      if (!data.orders || !Array.isArray(data.orders)) {
        throw new Error("Invalid order data received")
      }

      // ✅ Transform the vendor-filtered orders
      const transformedOrders = data.orders.map(transformVendorOrderData)
      setOrders(transformedOrders)

      // ✅ Calculate statistics from the filtered orders
      const calculatedStats = calculateStats(transformedOrders)
      setStats(calculatedStats)

    } catch (err: any) {
      console.error("❌ Error fetching vendor orders:", err)
      setError(err.message || "Failed to load vendor orders")
      setOrders([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Transform vendor order data to match our interface
  const transformVendorOrderData = (orderData: any): VendorOrder => {
    console.log("🔄 Transforming vendor order:", orderData.id)

    // Get display ID
    let display_id = 0
    if (orderData.display_id) {
      display_id = orderData.display_id
    } else {
      const allNumbers = orderData.id.match(/\d+/g)
      if (allNumbers && allNumbers.length > 0) {
        display_id = parseInt(allNumbers[allNumbers.length - 1])
      }
    }

    // Transform vendor items
    const vendorItems = (orderData.vendor_items || []).map((item: any, index: number) => {
      const unitPrice = 
        (typeof item.unit_price === 'number') ? item.unit_price :
        (item.unit_price?.value) ? parseFloat(item.unit_price.value) : 0

      const quantity = item.quantity || 1

      return {
        id: item.id || `item_${index}`,
        title: item.title || item.product_title || "Unknown Product",
        subtitle: item.subtitle || item.variant_title || "Handcrafted Item",
        quantity: quantity,
        unit_price: unitPrice,
        total: unitPrice * quantity
      }
    })

    // Get customer info
    const customer = {
      first_name: orderData.customer?.first_name || "Guest",
      last_name: orderData.customer?.last_name || "",
      email: orderData.customer?.email || orderData.email || "customer@example.com"
    }

    return {
      id: orderData.id,
      display_id: display_id,
      created_at: orderData.created_at || new Date().toISOString(),
      vendor_total: orderData.vendor_total || 0,
      vendor_subtotal: orderData.vendor_subtotal || 0,
      vendor_items: vendorItems,
      payment_status: orderData.payment_status || "pending",
      fulfillment_status: orderData.fulfillment_status || "not_fulfilled",
      currency_code: "INR",
      customer: customer,
      vendor_id: orderData.vendor_id || "",
      vendor_handle: orderData.vendor_handle || "unknown",
      vendor_payment_amount: orderData.vendor_payment_amount || orderData.vendor_total || 0
    }
  }

  // ✅ Calculate statistics from vendor orders
  const calculateStats = (orders: VendorOrder[]): VendorStats => {
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.vendor_total, 0)
    const paidOrders = orders.filter(order => 
      order.payment_status === "captured" || order.payment_status === "paid"
    ).length
    const pendingOrders = orders.filter(order => 
      order.fulfillment_status === "pending" || order.fulfillment_status === "not_fulfilled"
    ).length

    return {
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      paid_orders: paidOrders,
      pending_orders: pendingOrders
    }
  }

  // ✅ Format currency for display
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // ✅ Handle row clicks to navigate to order details
  const handleRowClick = (order: VendorOrder) => {
    console.log("🔗 Navigating to order details:", order.id)
    navigate({ to: `/orders/${order.id}` })
  }

  // Fetch orders on component mount
  useEffect(() => {
    fetchVendorOrders()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading Table */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-lg">Loading your orders...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader className="bg-red-50 border-b border-red-100">
          <CardTitle className="flex items-center text-red-700">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Error Loading Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="mb-4 text-red-600">{error}</p>
          <p className="mb-6 text-gray-600">
            We're having trouble loading your vendor orders. Please try again.
          </p>
          <Button onClick={fetchVendorOrders} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* ✅ Vendor Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Your Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(stats.total_revenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CircleCheck className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Paid Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.paid_orders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending_orders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ✅ Orders Table with vendor-filtered data */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Your Orders</CardTitle>
              <CardDescription className="mt-1">
                Orders containing your products (showing only your items and payment portion)
              </CardDescription>
            </div>
            <Button onClick={fetchVendorOrders} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length > 0 ? (
            <DataTable
              data={orders}
              columns={columns}
              onRowClick={handleRowClick}
              initialState={{
                columnVisibility: {
                  id: true,
                },
                pagination: {
                  pageSize: 10,
                },
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
              <p className="text-gray-600 mb-4">
                You don't have any orders yet. Orders containing your products will appear here.
              </p>
              <Button onClick={fetchVendorOrders} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ Info Card explaining vendor view */}
      {orders.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Vendor View Explanation
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  This table shows only your products and your portion of the payment from each order. 
                  Multi-vendor orders are filtered to display only your items. Click on any order to see detailed information about your products and payment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

