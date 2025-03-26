import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Heading, Label, Button, Text, Badge } from "@medusajs/ui";
import CreatorFollowersTab from "./followers/page"

// Define interfaces for the API response structure
interface Admin {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
}

interface Vendor {
  id: string;
  name: string;
  handle?: string;
  logo?: string;
  coverphoto?: string;
  youtube?: string;
  instagram?: string;
  xtwitter?: string;
  othersocial?: string;
  phonenumber?: string;
  GSTIN?: string;
  companyname?: string;
  pan_number?: string;
  city?: string;
  pincode?: string;
  state?: string;
  address?: string;
  tan_number?: string;
  bank_account_holder_name?: string;
  bank_account_number?: string;
  bank_account_ifsc_code?: string;
  bank_name?: string;
  bank_account_type?: "Saving" | "Current";
  cancelled_checkque?: string;
  creator_bio?: string;
  creator_title?: string;
  created_at: string;
  updated_at: string;
  admins?: Admin[];
  // Auth info
  login_email?: string;
  auth_enabled?: boolean;
  last_login?: string;
}

const CreatorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    fetchVendorDetails();
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/vendors?vendor_id=${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch creator details: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched vendor data:', data);
      
      if (data.vendor) {
        setVendor(data.vendor);
      } else {
        setError("Creator data not found in the response");
      }
    } catch (error) {
      console.error("Error fetching creator details:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format dates nicely
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center h-40">
          <Text>Loading creator details...</Text>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <div className="p-4 text-red-600 border border-red-300 rounded bg-red-50">
          <Heading level="h2" className="mb-2 text-lg">Error</Heading>
          <Text>{error}</Text>
          <Button 
            variant="secondary" 
            className="mt-4"
            onClick={() => navigate("/vendors")}
          >
            Back to Creators
          </Button>
        </div>
      </Container>
    );
  }

  if (!vendor) {
    return (
      <Container className="py-8">
        <div className="p-4 border border-gray-300 rounded bg-gray-50">
          <Heading level="h2" className="mb-2 text-lg">Creator Not Found</Heading>
          <Text>The requested creator could not be found.</Text>
          <Button 
            variant="secondary" 
            className="mt-4"
            onClick={() => navigate("/vendors")}
          >
            Back to Creators
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Header with creator name, cover photo and logo */}
      <div className="relative mb-8">
        <div className="h-48 overflow-hidden bg-gray-200 rounded-lg">
          {vendor.coverphoto ? (
            <img 
              src={vendor.coverphoto} 
              alt="Cover" 
              className="object-cover w-full h-full" 
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gray-100">
              Cover Photo Not Set
            </div>
          )}
        </div>
        
        <div className="absolute bottom-0 flex items-end transform translate-y-1/2 left-6">
          <div className="w-24 h-24 overflow-hidden bg-white border-4 border-white rounded-lg">
            {vendor.logo ? (
              <img 
                src={vendor.logo} 
                alt={`${vendor.name} logo`} 
                className="object-cover w-full h-full" 
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full font-bold text-gray-500 bg-gray-100">
                {vendor.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-2">
          <Button
            variant="secondary"
            onClick={() => navigate("/vendors")}
          >
            Back to Creators
          </Button>
        </div>
      </div>

      {/* Creator info and title */}
      <div className="pt-2 pl-32 mb-6">
        <Heading level="h1" className="text-2xl">{vendor.name}</Heading>
        <Text className="text-gray-500">
          {vendor.creator_title || "No professional title set"}
        </Text>
        {vendor.handle && (
          <Badge className="mt-2">@{vendor.handle}</Badge>
        )}
      </div>

      {/* Tabs navigation */}
      <div className="mb-6 border-b">
        <div className="flex gap-6">
          <Button 
            variant="transparent" 
            className={`py-2 px-1 border-b-2 rounded-none ${activeTab === "basic" ? "border-blue-500" : "border-transparent"}`}
            onClick={() => setActiveTab("basic")}
          >
            Basic Info
          </Button>
          <Button 
            variant="transparent" 
            className={`py-2 px-1 border-b-2 rounded-none ${activeTab === "profile" ? "border-blue-500" : "border-transparent"}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile & Social
          </Button>
          <Button 
            variant="transparent" 
            className={`py-2 px-1 border-b-2 rounded-none ${activeTab === "business" ? "border-blue-500" : "border-transparent"}`}
            onClick={() => setActiveTab("business")}
          >
            Business Details
          </Button>
          <Button 
            variant="transparent" 
            className={`py-2 px-1 border-b-2 rounded-none ${activeTab === "banking" ? "border-blue-500" : "border-transparent"}`}
            onClick={() => setActiveTab("banking")}
          >
            Banking Info
          </Button>
          <Button 
            variant="transparent" 
            className={`py-2 px-1 border-b-2 rounded-none ${activeTab === "followers" ? "border-blue-500" : "border-transparent"}`}
            onClick={() => setActiveTab("followers")}
          >
            Followers
          </Button>
          <Button 
            variant="transparent" 
            className={`py-2 px-1 border-b-2 rounded-none ${activeTab === "admins" ? "border-blue-500" : "border-transparent"}`}
            onClick={() => setActiveTab("admins")}
          >
            Account Admins
          </Button>
        </div>
      </div>

      {/* Basic Info Tab */}
      {activeTab === "basic" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="p-6 mb-6 bg-white border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <Heading level="h2" className="text-xl">Basic Information</Heading>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => navigate(`/vendors/${vendor.id}/edit?tab=basic`)}
                >
                  Edit Details
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="block mb-1 text-sm">Creator ID</Label>
                  <div className="p-2 overflow-x-auto font-mono text-sm border rounded bg-gray-50">
                    {vendor.id}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="block mb-1 text-sm">Creator Name</Label>
                    <div className="p-2 border rounded bg-gray-50">
                      {vendor.name}
                    </div>
                  </div>

                  <div>
                    <Label className="block mb-1 text-sm">Handle</Label>
                    <div className="p-2 border rounded bg-gray-50">
                      {vendor.handle || "Not set"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="block mb-1 text-sm">Created At</Label>
                    <div className="p-2 border rounded bg-gray-50">
                      {formatDate(vendor.created_at)}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="block mb-1 text-sm">Last Updated</Label>
                    <div className="p-2 border rounded bg-gray-50">
                      {formatDate(vendor.updated_at)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="block mb-1 text-sm">Professional Title</Label>
                  <div className="p-2 border rounded bg-gray-50">
                    {vendor.creator_title || "Not set"}
                  </div>
                </div>
              </div>
            </div>

            {/* Login Information */}
            <div className="p-6 mb-6 bg-white border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <Heading level="h2" className="text-xl">Login Information</Heading>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => navigate(`/vendors/${vendor.id}/auth`)}
                >
                  Manage Access
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Authentication Status</Label>
                  <Badge 
                    className={vendor.auth_enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {vendor.auth_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div>
                  <Label className="block mb-1 text-sm">Login Email</Label>
                  <div className="p-2 border rounded bg-gray-50">
                    {vendor.login_email || "No login email set"}
                  </div>
                </div>

                <div>
                  <Label className="block mb-1 text-sm">Last Login</Label>
                  <div className="p-2 border rounded bg-gray-50">
                    {vendor.last_login ? formatDate(vendor.last_login) : "Never logged in"}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={!vendor.auth_enabled}
                  >
                    Reset Password
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Creator Bio */}
          <div className="md:col-span-1">
            <div className="p-6 mb-6 bg-white border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <Heading level="h2" className="text-xl">Creator Bio</Heading>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => navigate(`/vendors/${vendor.id}/edit?tab=profile`)}
                >
                  Edit Bio
                </Button>
              </div>
              
              <div className="prose max-w-none">
                {vendor.creator_bio ? (
                  <p>{vendor.creator_bio}</p>
                ) : (
                  <p className="italic text-gray-500">No biography provided</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile & Social Tab */}
      {activeTab === "profile" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <Heading level="h2" className="text-xl">Social Media & Contact</Heading>
            <Button
              variant="secondary"
              size="small"
              onClick={() => navigate(`/vendors/${vendor.id}/edit?tab=profile`)}
            >
              Edit Social Media
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Heading level="h3" className="mb-3 text-lg">Social Profiles</Heading>
              <div className="space-y-4">
                <div>
                  <Label className="block mb-1 text-sm">YouTube</Label>
                  <div className="flex items-center p-2 border rounded bg-gray-50">
                    {vendor.youtube ? (
                      <>
                        <span className="mr-2 text-red-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                          </svg>
                        </span>
                        <span className="truncate">{vendor.youtube}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Not provided</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="block mb-1 text-sm">Instagram</Label>
                  <div className="flex items-center p-2 border rounded bg-gray-50">
                    {vendor.instagram ? (
                      <>
                        <span className="mr-2 text-pink-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </span>
                        <span className="truncate">{vendor.instagram}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Not provided</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="block mb-1 text-sm">X (Twitter)</Label>
                  <div className="flex items-center p-2 border rounded bg-gray-50">
                    {vendor.xtwitter ? (
                      <>
                        <span className="mr-2 text-black">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </span>
                        <span className="truncate">{vendor.xtwitter}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Not provided</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="block mb-1 text-sm">Other Social</Label>
                  <div className="p-2 border rounded bg-gray-50">
                    {vendor.othersocial || <span className="text-gray-500">Not provided</span>}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Heading level="h3" className="mb-3 text-lg">Contact Information</Heading>
              <div className="space-y-4">
                <div>
                  <Label className="block mb-1 text-sm">Phone Number</Label>
                  <div className="p-2 border rounded bg-gray-50">
                    {vendor.phonenumber || <span className="text-gray-500">Not provided</span>}
                  </div>
                </div>
                
                <div>
                  <Label className="block mb-1 text-sm">Address</Label>
                  <div className="p-2 border rounded bg-gray-50">
                    {vendor.address ? (
                      <div>
                        <p>{vendor.address}</p>
                        {vendor.city && vendor.state && (
                          <p>
                            {vendor.city}, {vendor.state}
                            {vendor.pincode && ` - ${vendor.pincode}`}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">Not provided</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Details Tab */}
      {activeTab === "business" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <Heading level="h2" className="text-xl">Business Information</Heading>
            <Button
              variant="secondary"
              size="small"
              onClick={() => navigate(`/vendors/${vendor.id}/edit?tab=business`)}
            >
              Edit Business Details
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Heading level="h3" className="mb-3 text-lg">Company Details</Heading>
              <div className="space-y-4">
                <div>
                  <Label className="block mb-1 text-sm">Company Name</Label>
                  <div className="p-2 border rounded bg-gray-50">
                    {vendor.companyname || <span className="text-gray-500">Not provided</span>}
                  </div>
                </div>
                
                <div>
                  <Label className="block mb-1 text-sm">GSTIN</Label>
                  <div className="p-2 font-mono border rounded bg-gray-50">
                    {vendor.GSTIN || <span className="text-gray-500">Not provided</span>}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Heading level="h3" className="mb-3 text-lg">Tax Information</Heading>
              <div className="space-y-4">
                <div>
                  <Label className="block mb-1 text-sm">PAN Number</Label>
                  <div className="p-2 font-mono border rounded bg-gray-50">
                    {vendor.pan_number || <span className="text-gray-500">Not provided</span>}
                  </div>
                </div>
                
                <div>
                  <Label className="block mb-1 text-sm">TAN Number</Label>
                  <div className="p-2 font-mono border rounded bg-gray-50">
                    {vendor.tan_number || <span className="text-gray-500">Not provided</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banking Info Tab */}
      {activeTab === "banking" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <Heading level="h2" className="text-xl">Banking Details</Heading>
            <Button
              variant="secondary"
              size="small"
              onClick={() => navigate(`/vendors/${vendor.id}/edit?tab=banking`)}
            >
              Edit Banking Details
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Heading level="h3" className="mb-3 text-lg">Account Information</Heading>
              <div className="space-y-4">
                <div>
                  <Label className="block mb-1 text-sm">Account Holder Name</Label>
                  <div className="p-2 border rounded bg-gray-50">
                    {vendor.bank_account_holder_name || <span className="text-gray-500">Not provided</span>}
                  </div>
                </div>
                
                <div>
                  <Label className="block mb-1 text-sm">Bank Name</Label>
                  <div className="p-2 border rounded bg-gray-50">
                    {vendor.bank_name || <span className="text-gray-500">Not provided</span>}
                  </div>
                </div>
                
                <div>
                  <Label className="block mb-1 text-sm">Account Type</Label>
                  <div className="p-2 border rounded bg-gray-50">
                    {vendor.bank_account_type || <span className="text-gray-500">Not provided</span>}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Heading level="h3" className="mb-3 text-lg">Account Details</Heading>
              <div className="space-y-4">
                <div>
                  <Label className="block mb-1 text-sm">Account Number</Label>
                  <div className="p-2 font-mono border rounded bg-gray-50">
                    {vendor.bank_account_number ? (
                      <span>
                        {/* Display last 4 digits, mask the rest */}
                        ••••••
                        {vendor.bank_account_number.slice(-4)}
                      </span>
                    ) : (
                      <span className="text-gray-500">Not provided</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="block mb-1 text-sm">IFSC Code</Label>
                  <div className="p-2 font-mono border rounded bg-gray-50">
                    {vendor.bank_account_ifsc_code || <span className="text-gray-500">Not provided</span>}
                  </div>
                </div>
                
                <div>
                  <Label className="block mb-1 text-sm">Cancelled Cheque</Label>
                  <div className="p-2 border rounded bg-gray-50">
                    {vendor.cancelled_checkque ? (
                      <Badge className="text-green-800 bg-green-100">Uploaded</Badge>
                    ) : (
                      <Badge className="text-red-800 bg-red-100">Not Uploaded</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === "followers" && <CreatorFollowersTab />}

      {/* Admins Tab */}
      {activeTab === "admins" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <Heading level="h2" className="text-xl">Account Administrators</Heading>
            <Button
              variant="secondary"
              size="small"
              onClick={() => navigate(`/vendors/${vendor.id}/admin/add`)}
            >
              Add New Admin
            </Button>
          </div>
          
          {vendor.admins && vendor.admins.length > 0 ? (
            <div className="space-y-4">
              {vendor.admins.map((admin) => (
                <div key={admin.id} className="p-4 transition-colors border rounded-lg bg-gray-50 hover:border-gray-300">
                  <div className="flex items-start justify-between">
                    <div>
                      <Text className="font-medium">
                        {admin.first_name || admin.last_name ? 
                          `${admin.first_name || ''} ${admin.last_name || ''}`.trim() : 
                          'Unnamed Admin'}
                      </Text>
                      <Text className="text-sm text-gray-600">{admin.email}</Text>
                      <Text className="mt-1 text-xs text-gray-500">
                        Added: {new Date(admin.created_at).toLocaleDateString()}
                      </Text>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => navigate(`/vendors/${vendor.id}/admin/${admin.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => {
                          if (confirm("Are you sure you want to remove this admin?")) {
                            // Handle admin deletion here
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center border rounded-lg bg-gray-50">
              <Text className="mb-2 text-gray-500">No admins assigned to this creator</Text>
              <Button 
                variant="secondary" 
                size="small"
                onClick={() => navigate(`/vendors/${vendor.id}/admin/add`)}
              >
                Add Admin
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 mt-8">
        <Button
          variant="primary"
          onClick={() => navigate(`/vendors/${vendor.id}/edit`)}
        >
          Edit Creator
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(`/vendors/${vendor.id}/products`)}
        >
          Manage Products
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(`/vendors/${vendor.id}/orders`)}
        >
          View Orders
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(`/vendors/${vendor.id}/analytics`)}
        >
          Analytics
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            if (confirm("Are you sure you want to deactivate this creator? This will hide their products from the marketplace.")) {
              // Handle deactivation logic
              console.log("Deactivating creator", vendor.id);
            }
          }}
        >
          Deactivate Creator
        </Button>
      </div>
    </Container>
  );
};

export default CreatorDetailPage;