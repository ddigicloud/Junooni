import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Heading, Text, Badge } from "@medusajs/ui";

// Display interface for payout information
interface PayoutDisplay {
  id: string;
  vendor_id: string;
  payout_period: string | null;
  scheduled_payout_date: string | null;
  payment_method: string | null;
  payout_total: number | null;
  current_balance: number;
  pending_balance: number;
  total_earned: number;
  total_paid: number;
  total_pending_payout: number;
  total_orders: number;
  avg_order_value: number;
  minimum_payout_amount: number;
  payout_schedule: string;
  last_payout_at: string | null;
  last_earning_at: string | null;
  next_payout_date: string | null;
  is_payout_enabled: boolean;
  hold_payouts: boolean;
  hold_reason: string | null;
  processed_at: string | null;
  created_at: string;
}

// Display interface for payout details
interface PayoutDetailDisplay {
  id: string;
  order_id: string;
  order_item_id: string;
  product_id: string;
  amount: number;
  tax_amount: number;
  tax_type: string;
  tds_percentage: number;
  tds_amount: number;
  type: "earning" | "payout" | "adjustment" | "refund";
  fulfillment_type: "creator_fulfillment" | "junooni_fulfillment" | null;
  cost_price: number | null;
  commission_rate: number | null;
  selling_price: number | null;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  reason: string;
  notes: string | null;
  created_at: string;
}

interface PayoutDetailsResponse {
  account: PayoutDisplay;
  transactions: PayoutDetailDisplay[];
  summary: {
    totalEarnings: number;
    totalPaid: number;
    currentBalance: number;
    totalOrders: number;
    totalTransactions: number;
  };
}

const CreatorPayoutTab = () => {
  const { id } = useParams<{ id: string }>();
  const [payout, setPayout] = useState<PayoutDisplay | null>(null);
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetailDisplay[]>([]);
  const [summary, setSummary] = useState<PayoutDetailsResponse['summary'] | null>(null);
  const [isLoadingPayout, setIsLoadingPayout] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit] = useState(20);
  const [activeSection, setActiveSection] = useState<"overview" | "details">("overview");

  useEffect(() => {
    fetchPayout();
  }, [id]);

  useEffect(() => {
    if (payout && activeSection === "details") {
      fetchPayoutDetails();
    }
  }, [payout, currentPage, activeSection]);

  const fetchPayout = async () => {
    try {
      setIsLoadingPayout(true);
      setError(null);

      const url = `/vendors/${id}/payout`;
      console.log(`Fetching payout from: ${url}`);

      const response = await fetch(url, {
        credentials: "include",
      });

      console.log("Payout API response status:", response.status);

      if (response.status === 404) {
        console.log("404 response - no payout data");
        setPayout(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch payout: ${response.status}`);
      }

      const data = await response.json();
      console.log("Payout API response:", JSON.stringify(data, null, 2));

      if (!data || !data.payout) {
        console.log("Invalid or missing payout data");
        setPayout(null);
        return;
      }

      setPayout(data.payout);
    } catch (error) {
      console.error("Error fetching creator payout:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      setPayout(null);
    } finally {
      setIsLoadingPayout(false);
    }
  };

  const fetchPayoutDetails = async () => {
    if (!payout) return;

    try {
      setIsLoadingDetails(true);
      setDetailsError(null);

      const offset = (currentPage - 1) * limit;
      const url = `/vendors/${id}/payout/${payout.id}/payout-details?limit=${limit}&offset=${offset}`;
      console.log(`Fetching payout details from: ${url}`);

      const response = await fetch(url, {
        credentials: "include",
      });

      console.log("Details API response status:", response.status);

      if (response.status === 404) {
        console.log("404 response - no payout details");
        setPayoutDetails([]);
        setTotalRecords(0);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch payout details: ${response.status}`);
      }

      const data = await response.json();
      console.log("Full Details API response:", JSON.stringify(data, null, 2));

      // Debug the actual structure we're getting
      console.log("Data keys:", Object.keys(data));
      console.log("Account exists:", !!data.account);
      console.log("Transactions exists:", !!data.transactions);
      console.log("Transactions type:", typeof data.transactions);
      console.log("Transactions length:", data.transactions?.length);

      // Handle different possible response structures
      let transactions = [];
      let summary = null;

      if (data.transactions && Array.isArray(data.transactions)) {
        transactions = data.transactions;
        summary = data.summary;
        console.log("Using data.transactions structure");
      } else if (data.payout_details) {
        // Alternative structure - maybe the API returns payout_details instead
        if (data.payout_details.transactions && Array.isArray(data.payout_details.transactions)) {
          transactions = data.payout_details.transactions;
          summary = data.payout_details.summary;
          console.log("Using data.payout_details.transactions structure");
        } else if (Array.isArray(data.payout_details)) {
          transactions = data.payout_details;
          console.log("Using data.payout_details array structure");
        }
      }

      console.log("Final transactions array:", transactions);
      console.log("Final transactions length:", transactions.length);

      setPayoutDetails(transactions);
      setSummary(summary || {
        totalEarnings: payout.total_earned,
        totalPaid: payout.total_paid,
        currentBalance: payout.current_balance,
        totalOrders: payout.total_orders,
        totalTransactions: transactions.length
      });
      setTotalRecords(summary?.totalTransactions || transactions.length);
      
    } catch (error) {
      console.error("Error fetching payout details:", error);
      setDetailsError(error instanceof Error ? error.message : "Unknown error occurred");
      setPayoutDetails([]);
      setTotalRecords(0);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  const getPayoutStatusBadge = () => {
    if (!payout) return null;
    
    if (payout.hold_payouts) {
      return <Badge className="bg-red-100 text-red-800">Payouts Held</Badge>;
    }
    if (!payout.is_payout_enabled) {
      return <Badge className="bg-gray-100 text-gray-800">Payouts Disabled</Badge>;
    }
    if (payout.current_balance >= payout.minimum_payout_amount) {
      return <Badge className="bg-green-100 text-green-800">Ready for Payout</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Below Minimum</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      earning: "bg-green-100 text-green-800",
      payout: "bg-blue-100 text-blue-800",
      adjustment: "bg-yellow-100 text-yellow-800",
      refund: "bg-red-100 text-red-800"
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800"
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getFulfillmentBadge = (fulfillmentType: string | null) => {
    if (!fulfillmentType) return <Text className="text-gray-400 text-sm">-</Text>;
    
    const colors = {
      creator_fulfillment: "bg-purple-100 text-purple-800",
      junooni_fulfillment: "bg-indigo-100 text-indigo-800"
    };
    
    return (
      <Badge className={colors[fulfillmentType as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {fulfillmentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const totalPages = Math.ceil(totalRecords / limit);

  if (isLoadingPayout) {
    return (
      <div className="bg-white p-6 border rounded-lg mb-6">
        <div className="flex items-center justify-center h-40">
          <Text>Loading payout information...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 border rounded-lg mb-6">
        <div className="p-4 border border-red-300 rounded bg-red-50 text-red-600">
          <Heading level="h3" className="text-lg mb-2">Error</Heading>
          <Text>{error}</Text>
        </div>
      </div>
    );
  }

  if (!payout) {
    return (
      <div className="bg-white p-6 border rounded-lg mb-6">
        <div className="p-6 border rounded-lg bg-gray-50 text-center">
          <Text className="text-gray-500 mb-2">No payout information available</Text>
          <Text className="text-sm text-gray-400">
            Payout data will appear here once the creator starts earning
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white border rounded-lg">
        <div className="flex border-b">
          <button
            onClick={() => setActiveSection("overview")}
            className={`px-6 py-3 text-sm font-medium ${
              activeSection === "overview"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Payout Overview
          </button>
          <button
            onClick={() => setActiveSection("details")}
            className={`px-6 py-3 text-sm font-medium ${
              activeSection === "details"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Transaction Details ({totalRecords})
          </button>
        </div>

        <div className="p-6">
          {activeSection === "overview" && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <Heading level="h2" className="text-xl">Payout Information</Heading>
                {getPayoutStatusBadge()}
              </div>

              {/* Balance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border rounded-lg bg-green-50">
                  <Text className="text-sm text-green-600 font-medium">Current Balance</Text>
                  <Text className="text-2xl font-bold text-green-700">
                    {formatCurrency(payout.current_balance)}
                  </Text>
                </div>
                <div className="p-4 border rounded-lg bg-yellow-50">
                  <Text className="text-sm text-yellow-600 font-medium">Pending Balance</Text>
                  <Text className="text-2xl font-bold text-yellow-700">
                    {formatCurrency(payout.pending_balance)}
                  </Text>
                </div>
                <div className="p-4 border rounded-lg bg-blue-50">
                  <Text className="text-sm text-blue-600 font-medium">Total Earned</Text>
                  <Text className="text-2xl font-bold text-blue-700">
                    {formatCurrency(payout.total_earned)}
                  </Text>
                </div>
              </div>

              {/* Payout Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <Heading level="h3" className="text-lg">Payout Settings</Heading>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Text className="text-gray-600">Schedule:</Text>
                      <Text className="font-medium capitalize">{payout.payout_schedule}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text className="text-gray-600">Minimum Amount:</Text>
                      <Text className="font-medium">{formatCurrency(payout.minimum_payout_amount)}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text className="text-gray-600">Payment Method:</Text>
                      <Text className="font-medium capitalize">{payout.payment_method || "Not set"}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text className="text-gray-600">Payout Period:</Text>
                      <Text className="font-medium">{payout.payout_period || "Not set"}</Text>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Heading level="h3" className="text-lg">Statistics</Heading>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Text className="text-gray-600">Total Paid:</Text>
                      <Text className="font-medium">{formatCurrency(payout.total_paid)}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text className="text-gray-600">Pending Payout:</Text>
                      <Text className="font-medium">{formatCurrency(payout.total_pending_payout)}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text className="text-gray-600">Total Orders:</Text>
                      <Text className="font-medium">{payout.total_orders}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text className="text-gray-600">Avg Order Value:</Text>
                      <Text className="font-medium">{formatCurrency(payout.avg_order_value)}</Text>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Dates */}
              <div className="border-t pt-4">
                <Heading level="h3" className="text-lg mb-4">Important Dates</Heading>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Text className="text-gray-600 text-sm">Last Payout</Text>
                    <Text className="font-medium">{formatDate(payout.last_payout_at)}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-600 text-sm">Last Earning</Text>
                    <Text className="font-medium">{formatDate(payout.last_earning_at)}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-600 text-sm">Next Payout</Text>
                    <Text className="font-medium">{formatDate(payout.next_payout_date)}</Text>
                  </div>
                </div>
              </div>

              {/* Hold Information */}
              {(payout.hold_payouts || !payout.is_payout_enabled) && (
                <div className="mt-4 p-4 border border-red-300 rounded bg-red-50">
                  <Heading level="h3" className="text-lg text-red-700 mb-2">Payout Status</Heading>
                  {payout.hold_payouts && (
                    <div>
                      <Text className="text-red-600 font-medium">Payouts are currently on hold</Text>
                      {payout.hold_reason && (
                        <Text className="text-red-600 text-sm mt-1">Reason: {payout.hold_reason}</Text>
                      )}
                    </div>
                  )}
                  {!payout.is_payout_enabled && (
                    <Text className="text-red-600">Payouts are disabled for this vendor</Text>
                  )}
                </div>
              )}
            </>
          )}

          {activeSection === "details" && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <Heading level="h2" className="text-xl">Transaction Details</Heading>
                <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                  {totalRecords} {totalRecords === 1 ? 'Record' : 'Records'}
                </Badge>
              </div>

              {isLoadingDetails ? (
                <div className="flex items-center justify-center h-40">
                  <Text>Loading transaction details...</Text>
                </div>
              ) : detailsError ? (
                <div className="p-4 border border-red-300 rounded bg-red-50 text-red-600">
                  <Heading level="h3" className="text-lg mb-2">Error Loading Details</Heading>
                  <Text>{detailsError}</Text>
                </div>
              ) : payoutDetails.length === 0 ? (
                <div className="p-6 border rounded-lg bg-gray-50 text-center">
                  <Text className="text-gray-500 mb-2">No transaction details available</Text>
                  <Text className="text-sm text-gray-400">
                    Transaction details will appear here once orders are processed
                  </Text>
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-3 border rounded-lg bg-green-50">
                        <Text className="text-xs text-green-600">Total Earnings</Text>
                        <Text className="text-lg font-bold text-green-700">
                          {formatCurrency(summary.totalEarnings)}
                        </Text>
                      </div>
                      <div className="p-3 border rounded-lg bg-blue-50">
                        <Text className="text-xs text-blue-600">Total Paid</Text>
                        <Text className="text-lg font-bold text-blue-700">
                          {formatCurrency(summary.totalPaid)}
                        </Text>
                      </div>
                      <div className="p-3 border rounded-lg bg-purple-50">
                        <Text className="text-xs text-purple-600">Current Balance</Text>
                        <Text className="text-lg font-bold text-purple-700">
                          {formatCurrency(summary.currentBalance)}
                        </Text>
                      </div>
                      <div className="p-3 border rounded-lg bg-yellow-50">
                        <Text className="text-xs text-yellow-600">Total Orders</Text>
                        <Text className="text-lg font-bold text-yellow-700">
                          {summary.totalOrders}
                        </Text>
                      </div>
                    </div>
                  )}

                  {/* Transaction Table */}
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-medium">Date</th>
                          <th className="text-left p-3 font-medium">Type</th>
                          <th className="text-left p-3 font-medium">Order ID</th>
                          <th className="text-right p-3 font-medium">Amount</th>
                          <th className="text-right p-3 font-medium">Tax</th>
                          <th className="text-right p-3 font-medium">TDS</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Fulfillment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payoutDetails.map((detail) => (
                          <tr key={detail.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <Text className="text-sm">{formatDate(detail.created_at)}</Text>
                            </td>
                            <td className="p-3">
                              {getTypeBadge(detail.type)}
                            </td>
                            <td className="p-3">
                              <Text className="text-sm font-mono">{detail.order_id}</Text>
                            </td>
                            <td className="p-3 text-right">
                              <Text className={`font-medium ${detail.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {detail.amount >= 0 ? '+' : ''}{formatCurrency(detail.amount)}
                              </Text>
                            </td>
                            <td className="p-3 text-right">
                              <Text className="text-sm">{formatCurrency(detail.tax_amount)}</Text>
                              <Text className="text-xs text-gray-500 uppercase">{detail.tax_type}</Text>
                            </td>
                            <td className="p-3 text-right">
                              {detail.tds_amount > 0 ? (
                                <div>
                                  <Text className="text-sm text-red-600">{formatCurrency(detail.tds_amount)}</Text>
                                  <Text className="text-xs text-gray-500">{detail.tds_percentage}%</Text>
                                </div>
                              ) : (
                                <Text className="text-gray-400">-</Text>
                              )}
                            </td>
                            <td className="p-3">
                              {getStatusBadge(detail.status)}
                            </td>
                            <td className="p-3">
                              {getFulfillmentBadge(detail.fulfillment_type)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center border-t pt-4">
                      <Text className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages} ({totalRecords} total records)
                      </Text>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorPayoutTab;