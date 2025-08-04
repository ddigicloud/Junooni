import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Clock, CircleCheck, RefreshCw, AlertTriangle, CreditCard } from "lucide-react"

// ✅ Updated Order interface for vendor-filtered data
export interface VendorOrder {
  id: string
  display_id: number
  created_at: string
  vendor_total: number // ✅ Vendor-specific total
  vendor_subtotal: number
  vendor_items: Array<{
    id: string
    title: string
    subtitle?: string
    quantity: number
    unit_price: number
    total: number
  }>
  payment_status: string
  fulfillment_status: string
  currency_code: string
  customer: {
    first_name: string
    last_name: string
    email: string
  }
  vendor_id: string
  vendor_handle: string
  vendor_payment_amount: number
}

// Helper to safely format dates
const formatDate = (dateString?: string) => {
  if (!dateString) return "–"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "–"
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// ✅ Helper to format currency for Indian locale
const formatPrice = (amount: number, currencyCode: string = "INR") => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "₹0"
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(Number(amount))
}

// ✅ Status Badge component with proper styling
const StatusBadge = ({ status, type = "general" }: { status: string, type?: "payment" | "fulfillment" | "general" }) => {
  const normalizedStatus = status.toLowerCase()
  
  const getStatusProps = () => {
    if (type === "payment") {
      switch (normalizedStatus) {
        case "captured":
        case "paid":
          return { 
            variant: "outline" as const,
            className: "text-green-700 bg-green-50 border-green-200 font-medium",
            icon: <CreditCard className="w-3 h-3 mr-1" />,
            text: "Paid"
          }
        case "pending":
        case "requires_action":
          return { 
            variant: "outline" as const,
            className: "text-amber-700 bg-amber-50 border-amber-200 font-medium",
            icon: <Clock className="w-3 h-3 mr-1" />,
            text: "Pending"
          }
        default:
          return { 
            variant: "outline" as const,
            className: "text-gray-700 bg-gray-50 border-gray-200 font-medium",
            icon: null,
            text: status
          }
      }
    }
    
    if (type === "fulfillment") {
      switch (normalizedStatus) {
        case "not_fulfilled":
        case "pending":
          return { 
            variant: "outline" as const,
            className: "text-amber-700 bg-amber-50 border-amber-200 font-medium",
            icon: <Clock className="w-3 h-3 mr-1" />,
            text: "Pending"
          }
        case "partially_fulfilled":
        case "processing":
          return { 
            variant: "outline" as const,
            className: "text-blue-700 bg-blue-50 border-blue-200 font-medium",
            icon: <RefreshCw className="w-3 h-3 mr-1" />,
            text: "Processing"
          }
        case "fulfilled":
        case "shipped":
        case "delivered":
          return { 
            variant: "outline" as const,
            className: "text-green-700 bg-green-50 border-green-200 font-medium",
            icon: <CircleCheck className="w-3 h-3 mr-1" />,
            text: "Fulfilled"
          }
        case "cancelled":
        case "canceled":
          return { 
            variant: "outline" as const,
            className: "text-red-700 bg-red-50 border-red-200 font-medium",
            icon: <AlertTriangle className="w-3 h-3 mr-1" />,
            text: "Cancelled"
          }
        default:
          return { 
            variant: "outline" as const,
            className: "text-gray-700 bg-gray-50 border-gray-200 font-medium",
            icon: null,
            text: status
          }
      }
    }
    
    return { 
      variant: "outline" as const,
      className: "text-gray-700 bg-gray-50 border-gray-200 font-medium",
      icon: null,
      text: status
    }
  }

  const { variant, className, icon, text } = getStatusProps()

  return (
    <Badge variant={variant} className={className}>
      {icon}
      {text}
    </Badge>
  )
}

// ✅ Updated columns for vendor-specific order display
export const columns: ColumnDef<VendorOrder>[] = [
  {
    header: "Order ID",
    accessorKey: "id",
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className="space-y-1">
          <code className="text-sm font-mono">{order.display_id}</code>
          <div className="text-xs text-gray-500">
            Your Products Only
          </div>
        </div>
      )
    },
  },
  {
    header: "Order Date",
    accessorKey: "created_at",
    cell: info => {
      const dateStr = info.getValue() as string | undefined
      return <span className="text-sm">{formatDate(dateStr)}</span>
    }
  },
  {
    header: "Customer",
    accessorKey: "customer",
    cell: ({ row }) => {
      const customer = row.original.customer
      if (!customer) return "–"
      
      return (
        <div className="space-y-1">
          <div className="font-medium text-sm">
            {`${customer.first_name} ${customer.last_name}`.trim()}
          </div>
          <div className="text-xs text-gray-500">
            {customer.email}
          </div>
        </div>
      )
    }
  },
  {
    header: "Your Products",
    accessorKey: "vendor_items",
    cell: ({ row }) => {
      const items = row.original.vendor_items
      if (!items || items.length === 0) return "–"
      
      const firstItem = items[0]
      const totalItems = items.length
      
      return (
        <div className="space-y-1">
          <div className="font-medium text-sm">{firstItem.title}</div>
          {firstItem.subtitle && (
            <div className="text-xs text-gray-500">{firstItem.subtitle}</div>
          )}
          <div className="text-xs text-gray-500">
            Qty: {firstItem.quantity}
            {totalItems > 1 && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                +{totalItems - 1} more
              </span>
            )}
          </div>
        </div>
      )
    }
  },
  {
    header: "Your Total",
    accessorKey: "vendor_total",
    cell: ({ row }) => {
      const order = row.original
      const amount = order.vendor_total
      
      return (
        <div className="space-y-1 text-right">
          <div className="font-semibold text-sm">
            {formatPrice(amount, order.currency_code)}
          </div>
          <div className="text-xs text-gray-500">
            {order.vendor_items.length} {order.vendor_items.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      )
    }
  },
  {
    header: "Payment",
    accessorKey: "payment_status",
    cell: ({ row }) => {
      const paymentStatus = row.original.payment_status
      return <StatusBadge status={paymentStatus} type="payment" />
    }
  },
  {
    header: "Status",
    accessorKey: "fulfillment_status",
    cell: ({ row }) => {
      const fulfillmentStatus = row.original.fulfillment_status
      return <StatusBadge status={fulfillmentStatus} type="fulfillment" />
    }
  }
]