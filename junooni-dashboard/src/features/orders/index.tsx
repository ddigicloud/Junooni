// src/features/orders/components/orders-page.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  Download,
  Plus, 
  Search,
  MoreHorizontal,
  Filter,
  Loader2
} from "lucide-react"
import { Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Define order types
interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  display_id: number
  customer: {
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
  
  created_at: string
  total: number
  items: OrderItem[]
  payment_status: string
  fulfillment_status: string
  currency_code: string
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status.toLowerCase();
  
  const getStatusProps = (status: string) => {
    switch (status) {
      case "not_fulfilled":
      case "pending":
        return { variant: "outline" as const, className: "text-amber-700 bg-amber-50 border-amber-200" };
      case "partially_fulfilled":
      case "requires_action":
      case "processing":
        return { variant: "outline" as const, className: "text-blue-700 bg-blue-50 border-blue-200" };
      case "partially_shipped":
      case "shipped":
        return { variant: "outline" as const, className: "text-purple-700 bg-purple-50 border-purple-200" };
      case "fulfilled":
      case "delivered":
      case "completed":
        return { variant: "outline" as const, className: "text-green-700 bg-green-50 border-green-200" };
      case "cancelled":
      case "canceled":
        return { variant: "outline" as const, className: "text-red-700 bg-red-50 border-red-200" };
      default:
        return { variant: "outline" as const, className: "text-gray-700 bg-gray-50 border-gray-200" };
    }
  };

  const { variant, className } = getStatusProps(normalizedStatus);

  // Format status text for display
  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "not_fulfilled":
        return "Pending";
      case "partially_fulfilled":
        return "Processing";
      case "fulfilled":
        return "Fulfilled";
      case "partially_shipped":
        return "Partially Shipped";
      case "shipped":
        return "Shipped";
      case "requires_action":
        return "Action Required";
      default:
        return status.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }
  };

  return (
    <Badge variant={variant} className={className}>
      {formatStatus(status)}
    </Badge>
  );
};

// Payment badge component
const PaymentBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status.toLowerCase();
  
  const getStatusProps = (status: string) => {
    switch (status) {
      case "captured":
      case "paid":
        return { variant: "outline" as const, className: "text-green-700 bg-green-50 border-green-200" };
      case "awaiting":
      case "pending":
      case "requires_action":
        return { variant: "outline" as const, className: "text-amber-700 bg-amber-50 border-amber-200" };
      case "failed":
      case "canceled":
      case "not_paid":
        return { variant: "outline" as const, className: "text-red-700 bg-red-50 border-red-200" };
      case "refunded":
        return { variant: "outline" as const, className: "text-blue-700 bg-blue-50 border-blue-200" };
      default:
        return { variant: "outline" as const, className: "text-gray-700 bg-gray-50 border-gray-200" };
    }
  };

  const { variant, className } = getStatusProps(normalizedStatus);

  // Format payment status text for display
  const formatPaymentStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "captured":
        return "Paid";
      case "not_paid":
        return "Unpaid";
      case "requires_action":
        return "Action Required";
      default:
        return status.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }
  };

  return (
    <Badge variant={variant} className={className}>
      {formatPaymentStatus(status)}
    </Badge>
  );
};

// Format price based on currency
const formatPrice = (amount: number, currencyCode: string = "USD") => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount); // API stores amounts in cents
};

export default function OrdersPage() {
  // State for orders data
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [authError, setAuthError] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("latest");
  
  // Fetch orders from the API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get the vendor token from local storage
        const token = localStorage.getItem("vendorToken");
        
        if (!token) {
          setAuthError(true);
          setError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }
      
        // Make the API request with the token in the Authorization header
        const response = await fetch(`http://localhost:9000/vendors/orders?limit=${limit}&offset=${(page - 1) * limit}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
      
        if (!response.ok) {
          if (response.status === 401) {
            setAuthError(true);
            setError("Your session has expired. Please log in again.");
          } else {
            setError(`Error fetching orders: ${response.statusText}`);
          }
          setLoading(false);
          return;
        }
      
        const data = await response.json();
        console.log("Raw API response:", data);
    
  
        if (data && data.orders) {
          // Transform the API response to match the expected Order format
          const transformedOrders = data.orders.map((order, index) => {
            // Calculate the total without dividing by 100
            let totalAmount = 0;
            
            if (typeof order.total === 'number') {
              totalAmount = order.total;
            } else if (order.total && typeof order.total.value === 'string') {
              totalAmount = parseFloat(order.total.value);
            } else {
              // Calculate from items
              totalAmount = (order.items || []).reduce((sum, item) => {
                const itemPrice = 
                  (typeof item.unit_price === 'number') ? item.unit_price :
                  (item.unit_price?.value) ? parseFloat(item.unit_price.value) :
                  (item.raw_unit_price?.value) ? parseFloat(item.raw_unit_price.value) : 0;
                
                const quantity = item.quantity || 1;
                
                return sum + (itemPrice * quantity);
              }, 0);
            }
            
            // Get shipping total
            const shippingTotal = 
              (typeof order.shipping_total === 'number') ? order.shipping_total :
              (order.shipping_total?.value) ? parseFloat(order.shipping_total.value) : 0;
            
            // Transform shipping methods
            const shippingMethods = (order.shipping_methods || []).map(method => ({
              id: method.id,
              name: method.name || "Standard Shipping",
              amount: typeof method.amount === 'number' ? method.amount : 
                (method.amount?.value ? parseFloat(method.amount.value) : 0)
            }));
            
            // Transform items
            const transformedItems = (order.items || []).map(item => {
              const unitPrice = 
                (typeof item.unit_price === 'number') ? item.unit_price :
                (item.unit_price?.value) ? parseFloat(item.unit_price.value) :
                (item.raw_unit_price?.value) ? parseFloat(item.raw_unit_price.value) : 0;
              
              const quantity = item.quantity || 1;
              
              return {
                id: item.id,
                title: item.title || item.product_title || "Unknown Product",
                quantity: quantity,
                unit_price: unitPrice,
                total: unitPrice * quantity // Calculate item total
              };
            });
            
            // Transform payment collections
            const paymentCollections = (order.payment_collections || []).map(pc => ({
              id: pc.id,
              status: pc.status || "unknown",
              amount: typeof pc.amount === 'number' ? pc.amount : 
                (pc.amount?.value ? parseFloat(pc.amount.value) : 0)
            }));
             // Get display_id - default to offset + index + 1 to ensure uniqueness
             const baseIndex = (page - 1) * limit;
             let display_id;
             
             // Try to extract a unique number from the order ID
             // Extract all numbers and use the last one for uniqueness
             const allNumbers = order.id.match(/\d+/g);
             if (allNumbers && allNumbers.length > 0) {
               // Use the last number found as it's more likely to be unique
               display_id = parseInt(allNumbers[allNumbers.length - 1]);
             } else {
               // Fallback to a unique incrementing number
               display_id = baseIndex + index + 1;
             }
             return {
              id: order.id,
              display_id: display_id,
              customer: {
                first_name: order.customer?.first_name || order.customer?.billing_address?.first_name || order.billing_address?.first_name || "Guest",
                last_name: order.customer?.last_name || order.customer?.billing_address?.last_name || order.billing_address?.last_name || "",
                email: order.customer?.email || order.email || "—",
                phone: order.customer?.phone || order.phone || order.billing_address?.phone || order.shipping_address?.phone || undefined
              },
            // return {
            //   id: order.id,
            //   display_id: parseInt(order.id.split('_')[1] || '0') || (1000 + index),
            //   customer: {
            //     first_name: "Customer",
            //     last_name: "",
            //     email: "customer@example.com"
            //   },
              // created_at: order.created_at || new Date().toISOString(),
              created_at: order.created_at || order.createdAt || order.date_created || 
                (order.items?.[0]?.created_at) || null,
              total: totalAmount,
              shipping_total: shippingTotal,
              status: order.status || "pending",
              items: transformedItems,
              payment_status: order.payment_status || "pending",
              fulfillment_status: order.fulfillment_status || "not_fulfilled",
              currency_code: "USD",
              shipping_methods: shippingMethods,
              payment_collections: paymentCollections
            };
          });
          
          console.log("Final transformed orders:", transformedOrders);
          setOrders(transformedOrders);
          setCount(data.count || transformedOrders.length);
        }
      } catch (err) {
        // Error handling remains the same
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [page, limit]);
  
  // Filter and sort orders
  const filteredOrders = orders.filter(order => {
    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const customerName = `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim().toLowerCase();
      if (
        !order.id.toLowerCase().includes(lowerSearch) &&
        !String(order.display_id).includes(lowerSearch) &&
        !customerName.includes(lowerSearch) &&
        !order.customer?.email.toLowerCase().includes(lowerSearch)
      ) {
        return false;
      }
    }
    
    // Apply status filter
    if (statusFilter !== "all" && order.fulfillment_status !== statusFilter) {
      return false;
    }
    
    // Apply payment filter
    if (paymentFilter !== "all" && order.payment_status !== paymentFilter) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Apply sorting
    switch (sortOrder) {
      case "latest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "highest":
        return b.total - a.total;
      case "lowest":
        return a.total - b.total;
      default:
        return 0;
    }
  });

  // Handle login redirect if authentication fails
  const handleLoginRedirect = () => {
    window.location.href = "/login";
  };
  
  // Get unique values for filter dropdowns
  const fulfillmentStatusOptions = [...new Set(orders.map(order => order.fulfillment_status))];
  const paymentStatusOptions = [...new Set(orders.map(order => order.payment_status))];
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return "—"
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d)
  }
 
  
  

  return (
    <div className="container py-6 space-y-6">
      <AlertDialog open={authError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              {error || "You must be logged in to view this page."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleLoginRedirect}>Log In</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">Manage and track all vendor orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Order
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3 md:flex-nowrap">
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-36">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Status</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {fulfillmentStatusOptions.map(status => (
                <SelectItem key={status} value={status}>
                  {status.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={paymentFilter} 
            onValueChange={setPaymentFilter}
          >
            <SelectTrigger className="w-36">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Payment</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              {paymentStatusOptions.map(status => (
                <SelectItem key={status} value={status}>
                  {status.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={sortOrder}
            onValueChange={setSortOrder}
          >
            <SelectTrigger className="w-36">
              <span>Sort By</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest">Highest Total</SelectItem>
              <SelectItem value="lowest">Lowest Total</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            {loading ? (
              "Loading orders..."
            ) : (
              `Showing ${filteredOrders.length} of ${count} orders`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error && !authError ? (
            <div className="py-8 text-center text-destructive">
              <p>{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[100px]">Order #</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center w-[80px]">Items</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Payment</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="group">
                        <TableCell className="font-medium">
                          <Link to={`/orders/${order.id}`} className="text-primary hover:underline">
                            #{order.display_id}
                          </Link>
                        </TableCell>
                        <TableCell>{order.customer.first_name} {order.customer.last_name}</TableCell>
                        <TableCell>{order.customer.email}</TableCell>
                        <TableCell>{order.customer.phone || "N/A"}</TableCell>
                        {/* <TableCell>
                          <div>{`${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim() || 'Guest'}</div>
                          <div className="text-xs text-muted-foreground">{order.customer?.email || 'N/A'}</div>
                        </TableCell> */}
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell className="font-medium text-right">
                          {formatPrice(order.total, order.currency_code)}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.items.reduce((acc, item) => acc + item.quantity, 0)}
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={order.fulfillment_status} />
                        </TableCell>
                        <TableCell className="text-center">
                          <PaymentBadge status={order.payment_status} />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="w-4 h-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Link to={`/orders/${order.id}`} className="flex w-full">
                                  View details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Update status</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Cancel order</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-center p-4 border-t">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(Math.ceil(count / limit), 5) }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          isActive={page === i + 1}
                          onClick={() => setPage(i + 1)}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    {Math.ceil(count / limit) > 5 && (
                      <PaginationItem>
                        <PaginationLink>...</PaginationLink>
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(count / limit)))}
                        className={page >= Math.ceil(count / limit) ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}