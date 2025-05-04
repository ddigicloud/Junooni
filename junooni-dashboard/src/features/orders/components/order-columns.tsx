import { ColumnDef } from "@tanstack/react-table"
import { Order } from "@/types/order"

// Helper to safely format dates
const formatDate = (dateString?: string) => {
  if (!dateString) return "–"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "–"
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export const columns: ColumnDef<Order>[] = [
  {
    header: "Order ID",
    accessorKey: "id",
    cell: info => <code>{info.getValue() as string}</code>,
  },
  {
    header: "Order Date",
    accessorKey: "created_at",
    cell: info => {
      const dateStr = info.getValue() as string | undefined
      return <span>{formatDate(dateStr)}</span>
    }
  },
  {
    header: "Order Total",
    accessorKey: "total",
    cell: info => {
      const rawValue = info.getValue();
      console.log("Raw total value:", rawValue, "Type:", typeof rawValue);
      
      // Handle null, undefined or non-numeric values
      if (rawValue === null || rawValue === undefined || isNaN(Number(rawValue))) {
        console.log("Invalid total value detected");
        return <span>$0.00</span>;
      }
      
      // Ensure we're working with a number
      const amount = Number(rawValue);
      console.log("Converted number value:", amount);
      
      return <span>${amount.toFixed(2)}</span>;
    }
  },
  {
    header: "First Item",
    accessorKey: "items",
    cell: info => {
      const items = info.getValue() as Order["items"]
      if (!items || items.length === 0) return "–"
      const item = items[0]
      return (
        <div>
          <div className="font-medium">{item.title}</div>
          <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
        </div>
      )
    }
  },
  {
    header: "Fulfillment Status",
    accessorKey: "fulfillment_status",
    cell: info => {
      const status = info.getValue() as string
      return <span className="capitalize">{status.replace(/_/g, " ")}</span>
    }
  }
]
