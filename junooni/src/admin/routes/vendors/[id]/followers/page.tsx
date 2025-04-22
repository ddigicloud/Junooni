import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Heading, Text, Badge } from "@medusajs/ui";

// Simple display interface for a follower
interface FollowerDisplay {
  id: string;
  customer_id: string;
  created_at: string;
  customer_info: {
    name: string;
    email?: string;
    initials: string;
  };
}

const CreatorFollowersTab = () => {
  const { id } = useParams<{ id: string }>();
  const [followers, setFollowers] = useState<FollowerDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [rawResponse, setRawResponse] = useState<any>(null);

  useEffect(() => {
    fetchFollowers();
  }, [id]);

  const fetchFollowers = async () => {
    try {
      setIsLoading(true);
      setError(null);
  
      const url = `/vendors/${id}/followers?limit=10&offset=0`;
      console.log(`Fetching followers from: ${url}`);
  
      const response = await fetch(url, {
        credentials: "include",
      });
  
      console.log("API response status:", response.status);
  
      if (response.status === 404) {
        console.log("404 response - no followers");
        setFollowers([]);
        setTotalFollowers(0);
        return;
      }
  
      if (!response.ok) {
        throw new Error(`Failed to fetch followers: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Full API response:", JSON.stringify(data, null, 2));
      setRawResponse(data);
  
      if (!data || !Array.isArray(data.follow)) {
        console.log("Invalid or missing follow array");
        setFollowers([]);
        setTotalFollowers(0);
        return;
      }
  
      const parsedFollowers: FollowerDisplay[] = data.follow.map((f: any) => {
        const customer = f.follow?.customer || {};
        const name = `${customer.first_name || ""} ${customer.last_name || ""}`.trim();
        const initials = `${(customer.first_name || "").charAt(0)}${(customer.last_name || "").charAt(0)}`.toUpperCase() || "UC";
  
        return {
          id: f.id || "unknown-id",
          customer_id: customer.id || "unknown-customer",
          created_at: f.created_at || new Date().toISOString(),
          customer_info: {
            name: name || customer.email || "Unknown Customer",
            email: customer.email,
            initials: initials || "UC"
          }
        };
      });
  
      setFollowers(parsedFollowers);
      setTotalFollowers(parsedFollowers.length);
    } catch (error) {
      console.error("Error fetching creator followers:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      setFollowers([]);
      setTotalFollowers(0);
    } finally {
      setIsLoading(false);
    }
  };
  

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  return (
    <div className="p-6 mb-6 bg-white border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <Heading level="h2" className="text-xl">Creator Followers</Heading>
        <Badge className="px-3 py-1 text-blue-800 bg-blue-100">
          {totalFollowers} {totalFollowers === 1 ? 'Follower' : 'Followers'}
        </Badge>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Text>Loading followers...</Text>
        </div>
      ) : error ? (
        <div className="p-4 text-red-600 border border-red-300 rounded bg-red-50">
          <Heading level="h3" className="mb-2 text-lg">Error</Heading>
          <Text>{error}</Text>
        </div>
      ) : followers.length === 0 ? (
        <div className="p-6 text-center border rounded-lg bg-gray-50">
          <Text className="mb-2 text-gray-500">No followers yet</Text>
          <Text className="text-sm text-gray-400">
            Followers will appear here when customers follow this creator
          </Text>
          <div className="p-3 mt-4 overflow-auto text-left bg-gray-100 border border-gray-200 rounded max-h-40">
            <Text className="font-mono text-xs text-gray-600">Debug raw response: {rawResponse ? JSON.stringify(rawResponse, null, 2) : "No data"}</Text>
          </div>
        </div>
      ) : (
        <>
          <div className="divide-y">
            {followers.map((follower) => (
              <div key={follower.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
                        <span className="font-medium text-gray-600">
                          {follower.customer_info.initials}
                        </span>
                      </div>
                      <div>
                        <Text className="font-medium">
                          {follower.customer_info.name}
                        </Text>
                        {follower.customer_info.email && (
                          <Text className="text-sm text-gray-500">{follower.customer_info.email}</Text>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Text className="text-sm text-gray-500">
                      Following since {formatDate(follower.created_at)}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4 mt-6 text-sm text-gray-500 border-t border-gray-200">
            <Text className="text-center">
              {totalFollowers} {totalFollowers === 1 ? 'customer follows' : 'customers follow'} this creator
            </Text>
          </div>
        </>
      )}
    </div>
  );
};

export default CreatorFollowersTab;

