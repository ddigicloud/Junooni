import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Heading, Text, Badge } from "@medusajs/ui";

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

const CreatorPayoutDetailsTab = () => {
  const { id } = useParams<{ id: string }>();
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetailDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    fetchPayoutDetails();
  }, [id, currentPage]);

  const fetchPayoutDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const offset = (currentPage - 1) * limit;
      const url = `/vendors/${id}/payout-details?limit=${limit}&offset=${offset}`;
      console.log(`Fetching payout details from: ${url}`);

      const response = await fetch(url, {
        credentials: "include",
      });

      console.log("API response status:", response.status);

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
      console.log("Full API response:", JSON.stringify(data, null, 2));
      setRawResponse(data);

      if (!data || !Array.isArray(data.payout_details)) {
        console.log("Invalid or missing payout_details array");
        setPayoutDetails([]);
        setTotalRecords(0);
        return;
      }

      setPayoutDetails(data.payout_details);
      setTotalRecords(data.count || data.payout_details.length);
    } catch (error) {
      console.error("Error fetching payout details:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      setPayoutDetails([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
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

  return (
    <div className="bg-white p-6 border rounded-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <Heading level="h2" className="text-xl">Payout Details</Heading>
        <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
          {totalRecords} {totalRecords === 1 ? 'Record' : 'Records'}
        </Badge>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Text>Loading payout details...</Text>
        </div>
      ) : error ? (
        <div className="p-4 border border-red-300 rounded bg-red-50 text-red-600">
          <Heading level="h3" className="text-lg mb-2">Error</Heading>
          <Text>{error}</Text>
        </div>
      ) : payoutDetails.length === 0 ? (
        <div className="p-6 border rounded-lg bg-gray-50 text-center">
          <Text className="text-gray-500 mb-2">No payout details available</Text>
          <Text className="text-sm text-gray-400">
            Transaction details will appear here once orders are processed
          </Text>
          <div className="mt-4 p-3 border border-gray-200 rounded bg-gray-100 text-left overflow-auto max-h-40">
            <Text className="text-xs text-gray-600 font-mono">Debug raw response: {rawResponse ? JSON.stringify(rawResponse, null, 2) : "No data"}</Text>
          </div>
        </div>
      ) : (
        <>
          {/* Table View for Payout Details */}
          <div className="overflow-x-auto">
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

          {/* Expandable Details */}
          <div className="mt-6">
            <Heading level="h3" className="text-lg mb-4">Detailed Breakdown</Heading>
            <div className="space-y-4">
              {payoutDetails.map((detail) => (
                <details key={detail.id} className="border rounded-lg">
                  <summary className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {getTypeBadge(detail.type)}
                      <Text className="font-medium">Order: {detail.order_id}</Text>
                      <Text className="text-sm text-gray-500">{formatDate(detail.created_at)}</Text>
                    </div>
                    <Text className={`font-bold ${detail.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {detail.amount >= 0 ? '+' : ''}{formatCurrency(detail.amount)}
                    </Text>
                  </summary>
                  <div className="p-4 border-t bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Text className="text-sm text-gray-600">Order Item ID</Text>
                      <Text className="font-mono text-sm">{detail.order_item_id}</Text>
                    </div>
                    <div>
                      <Text className="text-sm text-gray-600">Product ID</Text>
                      <Text className="font-mono text-sm">{detail.product_id}</Text>
                    </div>
                    {detail.cost_price && (
                      <div>
                        <Text className="text-sm text-gray-600">Cost Price</Text>
                        <Text className="text-sm">{formatCurrency(detail.cost_price)}</Text>
                      </div>
                    )}
                    {detail.selling_price && (
                      <div>
                        <Text className="text-sm text-gray-600">Selling Price</Text>
                        <Text className="text-sm">{formatCurrency(detail.selling_price)}</Text>
                      </div>
                    )}
                    {detail.commission_rate && (
                      <div>
                        <Text className="text-sm text-gray-600">Commission Rate</Text>
                        <Text className="text-sm">{detail.commission_rate}%</Text>
                      </div>
                    )}
                    <div>
                      <Text className="text-sm text-gray-600">Status</Text>
                      {getStatusBadge(detail.status)}
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <Text className="text-sm text-gray-600">Reason</Text>
                      <Text className="text-sm">{detail.reason}</Text>
                    </div>
                    {detail.notes && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <Text className="text-sm text-gray-600">Notes</Text>
                        <Text className="text-sm italic">{detail.notes}</Text>
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center border-t pt-4">
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

          {/* Summary Stats */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-t border-blue-200">
            <Text className="text-center text-sm text-blue-700">
              Showing {payoutDetails.length} of {totalRecords} payout transactions for this vendor
            </Text>
          </div>
        </>
      )}
    </div>
  );
};

export default CreatorPayoutDetailsTab;