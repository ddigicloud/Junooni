// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Container, Heading, Label, Button, Input, Text, Textarea, Switch, Badge, Select} from "@medusajs/ui";

// // Define interfaces for the API response structure
// interface Admin {
//   id: string;
//   email: string;
//   first_name?: string;
//   last_name?: string;
//   created_at: string;
//   updated_at: string;
// }

// interface Vendor {
//   id: string;
//   name: string;
//   handle?: string;
//   logo?: string;
//   coverphoto?: string;
//   youtube?: string;
//   instagram?: string;
//   xtwitter?: string;
//   facebook?: string;
//   othersocial?: string;
//   phonenumber?: string;
//   GSTIN?: string;
//   companyname?: string;
//   pan_number?: string;
//   city?: string;
//   pincode?: string;
//   state?: string;
//   address?: string;
//   tan_number?: string;
//   bank_account_holder_name?: string;
//   bank_account_number?: string;
//   bank_account_ifsc_code?: string;
//   bank_name?: string;
//   bank_account_type?: "Saving" | "Current";
//   cancelled_checkque?: string;
//   creator_bio?: string;
//   creator_title?: string;
//   created_at: string;
//   updated_at: string;
//   admins?: Admin[];
//   // Auth info
//   login_email?: string;
//   auth_enabled?: boolean;
//   last_login?: string;
//   // Verification status - using the correct enum types
//   verified?: "Yes" | "No";
//   gst_verification_status?: "pending" | "verified" | "failed";
//   // Metadata for additional custom fields
//   metadata?: Record<string, any>;
// }

// // Form data interface
// interface VendorFormData {
//   name: string;
//   handle: string;
//   logo?: string;
//   coverphoto?: string;
//   youtube?: string;
//   instagram?: string;
//   xtwitter?: string;
//   facebook?: string;
//   othersocial?: string;
//   phonenumber?: string;
//   GSTIN?: string;
//   companyname?: string;
//   pan_number?: string;
//   city?: string;
//   pincode?: string;
//   state?: string;
//   address?: string;
//   tan_number?: string;
//   bank_account_holder_name?: string;
//   bank_account_number?: string;
//   bank_account_ifsc_code?: string;
//   bank_name?: string;
//   bank_account_type?: "Saving" | "Current";
//   cancelled_checkque?: string;
//   creator_bio?: string;
//   creator_title?: string;
//   login_email?: string;
//   auth_enabled?: boolean;
//   // Verification status - using the correct enum types
//   verified?: "Yes" | "No";
//   gst_verification_status?: "pending" | "verified" | "failed";
//   // Metadata
//   metadata?: Record<string, any>;
// }

// interface AdminFormData {
//   email: string;
//   first_name: string;
//   last_name: string;
// }

// // Interface for metadata key-value pairs
// interface MetadataItem {
//   key: string;
//   value: string;
// }

// const CreatorEditPage = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const urlParams = new URLSearchParams(window.location.search);
//   const tabParam = urlParams.get('tab');

//   // State for vendor data
//   const [vendor, setVendor] = useState<Vendor | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  
//   // State for active tab
//   const [activeTab, setActiveTab] = useState(tabParam || "basic");
  
//   // State for form data
//   const [formData, setFormData] = useState<VendorFormData>({
//     name: "",
//     handle: "",
//   });
  
//   // State for adding new admin
//   const [showAddAdmin, setShowAddAdmin] = useState(false);
//   const [newAdmin, setNewAdmin] = useState<AdminFormData>({
//     email: "",
//     first_name: "",
//     last_name: ""
//   });
  
//   // State for form submission
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveError, setSaveError] = useState<string | null>(null);
//   const [saveSuccess, setSaveSuccess] = useState(false);
  
//   // State for image uploads
//   const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
//   const [selectedCoverPhoto, setSelectedCoverPhoto] = useState<File | null>(null);
//   const [selectedCheque, setSelectedCheque] = useState<File | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [uploadType, setUploadType] = useState<string>("");

//   // State for metadata
//   const [metadataItems, setMetadataItems] = useState<MetadataItem[]>([{ key: "", value: "" }]);

//   useEffect(() => {
//     fetchVendorDetails();
//   }, [id]);

//   const fetchVendorDetails = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       const response = await fetch(`/vendors?vendor_id=${id}`, {
//         credentials: "include",
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to fetch creator details: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('Fetched vendor data:', data);
      
//       if (data.vendor) {
//         setVendor(data.vendor);
        
//         // Initialize form data with all fields
//         setFormData({
//           name: data.vendor.name || "",
//           handle: data.vendor.handle || "",
//           logo: data.vendor.logo || "",
//           coverphoto: data.vendor.coverphoto || "",
//           youtube: data.vendor.youtube || "",
//           instagram: data.vendor.instagram || "",
//           xtwitter: data.vendor.xtwitter || "",
//           facebook: data.vendor.facebook || "",
//           othersocial: data.vendor.othersocial || "",
//           phonenumber: data.vendor.phonenumber || "",
//           GSTIN: data.vendor.GSTIN || "",
//           companyname: data.vendor.companyname || "",
//           pan_number: data.vendor.pan_number || "",
//           city: data.vendor.city || "",
//           pincode: data.vendor.pincode || "",
//           state: data.vendor.state || "",
//           address: data.vendor.address || "",
//           tan_number: data.vendor.tan_number || "",
//           bank_account_holder_name: data.vendor.bank_account_holder_name || "",
//           bank_account_number: data.vendor.bank_account_number || "",
//           bank_account_ifsc_code: data.vendor.bank_account_ifsc_code || "",
//           bank_name: data.vendor.bank_name || "",
//           bank_account_type: data.vendor.bank_account_type || "Saving",
//           cancelled_checkque: data.vendor.cancelled_checkque || "",
//           creator_bio: data.vendor.creator_bio || "",
//           creator_title: data.vendor.creator_title || "",
//           login_email: data.vendor.login_email || "",
//           auth_enabled: data.vendor.auth_enabled || false,
//           verified: data.vendor.verified || "No",
//           gst_verification_status: data.vendor.gst_verification_status || "pending",
//           metadata: data.vendor.metadata || {}
//         });

//         // Initialize metadata items from the vendor data
//         if (data.vendor.metadata) {
//           const metadataArray = Object.entries(data.vendor.metadata).map(([key, value]) => ({
//             key,
//             value: String(value)
//           }));
          
//           // Add an empty item if the array is empty
//           if (metadataArray.length === 0) {
//             metadataArray.push({ key: "", value: "" });
//           }
          
//           setMetadataItems(metadataArray);
//         }
//       } else {
//         setError("Creator data not found in the response");
//       }
//     } catch (error) {
//       console.error("Error fetching creator details:", error);
//       setError(error instanceof Error ? error.message : "Unknown error occurred");
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   // Form change handlers
//   const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };
  
//   // Special handler for verified status 
//   const handleVerifiedToggle = () => {
//     setFormData(prev => ({
//       ...prev,
//       verified: prev.verified === "Yes" ? "No" : "Yes"
//     }));
//   };
  
//   // Handle GST verification status change
//   const handleGstStatusChange = (value: "pending" | "verified" | "failed") => {
//     setFormData(prev => ({
//       ...prev,
//       gst_verification_status: value
//     }));
//   };
  
//   // Handle switch change for auth_enabled
//   const handleAuthEnabledChange = (checked: boolean) => {
//     setFormData(prev => ({
//       ...prev,
//       auth_enabled: checked
//     }));
//   };
  
//   const handleNewAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setNewAdmin(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };
  
//   // Metadata handlers
//   const handleMetadataChange = (index: number, field: 'key' | 'value', newValue: string) => {
//     const updatedItems = [...metadataItems];
//     updatedItems[index][field] = newValue;
//     setMetadataItems(updatedItems);
    
//     // Update formData metadata object
//     const newMetadata: Record<string, any> = {};
//     updatedItems.forEach(item => {
//       if (item.key.trim() !== '') {
//         newMetadata[item.key] = item.value;
//       }
//     });
    
//     setFormData(prev => ({
//       ...prev,
//       metadata: newMetadata
//     }));
//   };
  
//   const addMetadataItem = () => {
//     setMetadataItems([...metadataItems, { key: "", value: "" }]);
//   };
  
//   const removeMetadataItem = (index: number) => {
//     const updatedItems = [...metadataItems];
//     updatedItems.splice(index, 1);
    
//     // Make sure there's always at least one empty field
//     if (updatedItems.length === 0) {
//       updatedItems.push({ key: "", value: "" });
//     }
    
//     setMetadataItems(updatedItems);
    
//     // Update formData metadata object
//     const newMetadata: Record<string, any> = {};
//     updatedItems.forEach(item => {
//       if (item.key.trim() !== '') {
//         newMetadata[item.key] = item.value;
//       }
//     });
    
//     setFormData(prev => ({
//       ...prev,
//       metadata: newMetadata
//     }));
//   };
  
//   // File upload handlers
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
//     if (e.target.files && e.target.files.length > 0) {
//       switch (fileType) {
//         case 'logo':
//           setSelectedLogo(e.target.files[0]);
//           break;
//         case 'coverphoto':
//           setSelectedCoverPhoto(e.target.files[0]);
//           break;
//         case 'cheque':
//           setSelectedCheque(e.target.files[0]);
//           break;
//       }
//     }
//   };
  
//   const handleFileUpload = async (fileType: string) => {
//     let selectedFile: File | null = null;
    
//     switch (fileType) {
//       case 'logo':
//         selectedFile = selectedLogo;
//         break;
//       case 'coverphoto':
//         selectedFile = selectedCoverPhoto;
//         break;
//       case 'cheque':
//         selectedFile = selectedCheque;
//         break;
//     }
    
//     if (!selectedFile) return;
    
//     try {
//       setIsUploading(true);
//       setUploadProgress(0);
//       setUploadType(fileType);
//       setSaveError(null);
      
//       // Create form data for file upload
//       const formData = new FormData();
//       formData.append('files', selectedFile);
      
//       // Get the admin token for authentication
//       const adminToken = localStorage.getItem('adminAuthToken');
      
//       // Use your existing upload endpoint
//       const response = await fetch('/vendors/uploads', {
//         method: 'POST',
//         headers: {
//           'Authorization': adminToken ? `Bearer ${adminToken}` : '',
//           'x-medusa-admin': 'true'
//         },
//         body: formData,
//         credentials: 'include',
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `Upload failed: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('Upload response:', data);
      
//       // Extract the file URL from the response based on its structure
//       let fileUrl = '';
      
//       if (data.files && data.files.length > 0) {
//         // If response has a files array with URLs
//         fileUrl = data.files[0].url || data.files[0].file_url || '';
//       } else if (data.url) {
//         // If response has a direct URL property
//         fileUrl = data.url;
//       }
      
//       console.log(`Extracted ${fileType} URL:`, fileUrl);
      
//       if (fileUrl) {
//         // Update form data with the file URL
//         setFormData(prev => {
//           const updatedData = {
//             ...prev,
//             [fileType]: fileUrl
//           };
          
//           return updatedData;
//         });
        
//         // Show success message
//         setSaveSuccess(true);
//         setTimeout(() => setSaveSuccess(false), 3000);
        
//         // Reset file selection
//         switch (fileType) {
//           case 'logo':
//             setSelectedLogo(null);
//             break;
//           case 'coverphoto':
//             setSelectedCoverPhoto(null);
//             break;
//           case 'cheque':
//             setSelectedCheque(null);
//             break;
//         }
//       } else {
//         throw new Error('Could not extract file URL from upload response');
//       }
//     } catch (error) {
//       console.error('Error uploading file:', error);
//       setSaveError(error instanceof Error ? error.message : 'Upload failed');
//     } finally {
//       setIsUploading(false);
//       setUploadProgress(100);
//       setUploadType("");
//     }
//   };
  
//   // Form submission handlers
//   const handleSaveVendor = async () => {
//     try {
//       setIsSaving(true);
//       setSaveError(null);
      
//       // Get the admin token
//       const adminToken = localStorage.getItem('adminAuthToken');
      
//       // Determine which fields to update based on the active tab
//       let updateData: Partial<VendorFormData> = {};
      
//       switch (activeTab) {
//         case 'basic':
//           updateData = {
//             name: formData.name,
//             handle: formData.handle,
//             logo: formData.logo,
//             coverphoto: formData.coverphoto,
//             creator_title: formData.creator_title,
//             creator_bio: formData.creator_bio,
//             login_email: formData.login_email,
//             auth_enabled: formData.auth_enabled,
//             verified: formData.verified
//           };
//           break;
//         case 'profile':
//           updateData = {
//             youtube: formData.youtube,
//             instagram: formData.instagram,
//             xtwitter: formData.xtwitter,
//             facebook: formData.facebook,
//             othersocial: formData.othersocial,
//             phonenumber: formData.phonenumber,
//             address: formData.address,
//             city: formData.city,
//             state: formData.state,
//             pincode: formData.pincode
//           };
//           break;
//         case 'business':
//           updateData = {
//             companyname: formData.companyname,
//             GSTIN: formData.GSTIN,
//             pan_number: formData.pan_number,
//             tan_number: formData.tan_number,
//             gst_verification_status: formData.gst_verification_status
//           };
//           break;
//         case 'banking':
//           updateData = {
//             bank_account_holder_name: formData.bank_account_holder_name,
//             bank_account_number: formData.bank_account_number,
//             bank_account_ifsc_code: formData.bank_account_ifsc_code,
//             bank_name: formData.bank_name,
//             bank_account_type: formData.bank_account_type,
//             cancelled_checkque: formData.cancelled_checkque
//           };
//           break;
//         case 'metadata':
//           updateData = {
//             metadata: formData.metadata
//           };
//           break;
//         default:
//           // If no specific tab, update all fields
//           updateData = { ...formData };
//       }
      
//       console.log(`Sending vendor update for tab ${activeTab} with data:`, updateData);
      
//       const response = await fetch(`/vendors/${id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': adminToken ? `Bearer ${adminToken}` : '',
//           'x-medusa-admin': 'true'
//         },
//         body: JSON.stringify(updateData),
//         credentials: 'include',
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `Failed to update creator: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('Creator update response:', data);
      
//       // Show success message
//       setSaveSuccess(true);
//       setTimeout(() => setSaveSuccess(false), 3000);
      
//       // Refresh vendor data
//       fetchVendorDetails();
//     } catch (error) {
//       console.error('Error saving creator:', error);
//       setSaveError(error instanceof Error ? error.message : 'Save failed');
//     } finally {
//       setIsSaving(false);
//     }
//   };
  
//   // Admin management
//   const handleAddAdmin = async () => {
//     try {
//       setIsSaving(true);
//       setSaveError(null);
      
//       // Enhanced validation
//       if (!newAdmin.email.trim()) {
//         setSaveError('Email address is required');
//         return;
//       }
      
//       if (!newAdmin.email.includes('@') || !newAdmin.email.includes('.')) {
//         setSaveError('Please enter a valid email address');
//         return;
//       }
      
//       // Prepare the request body
//       const adminData = {
//         admin: {
//           email: newAdmin.email.trim(),
//           first_name: newAdmin.first_name.trim(),
//           last_name: newAdmin.last_name.trim(),
//         }
//       };
      
//       console.log('Adding new admin:', adminData);
      
//       // Send request to add admin
//       const response = await fetch(`/vendors/${id}/admins`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(adminData),
//         credentials: 'include',
//       });
      
//       // Handle non-OK responses
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         const errorMessage = errorData.message || `Failed to add admin: ${response.status}`;
//         throw new Error(errorMessage);
//       }
      
//       // Parse the successful response
//       const data = await response.json();
//       console.log('Admin creation response:', data);
      
//       // Reset form and hide it
//       setNewAdmin({
//         email: "",
//         first_name: "",
//         last_name: ""
//       });
//       setShowAddAdmin(false);
      
//       // Show success message
//       setSaveSuccess(true);
//       setTimeout(() => setSaveSuccess(false), 3000);
      
//       // Refresh vendor data
//       fetchVendorDetails();
//     } catch (error) {
//       console.error('Error adding admin:', error);
//       setSaveError(error instanceof Error ? error.message : 'Failed to add admin');
//     } finally {
//       setIsSaving(false);
//     }
//   };
  
//   const handleDeleteAdmin = async (adminId: string) => {
//     // Confirm before deleting
//     if (!window.confirm("Are you sure you want to remove this admin?")) {
//       return;
//     }
    
//     try {
//       setIsSaving(true);
//       setSaveError(null);
      
//       const response = await fetch(`/vendors/admins/${adminId}`, {
//         method: 'DELETE',
//         credentials: 'include',
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `Failed to remove admin: ${response.status}`);
//       }
      
//       // Show success message
//       setSaveSuccess(true);
//       setTimeout(() => setSaveSuccess(false), 3000);
      
//       // Refresh vendor data
//       fetchVendorDetails();
//     } catch (error) {
//       console.error('Error removing admin:', error);
//       setSaveError(error instanceof Error ? error.message : 'Failed to remove admin');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Manage auth settings
//   const handleManageAuth = async () => {
//     try {
//       setIsSaving(true);
//       setSaveError(null);
      
//       const authData = {
//         login_email: formData.login_email,
//         auth_enabled: formData.auth_enabled
//       };
      
//       console.log('Updating auth settings:', authData);
      
//       const response = await fetch(`/vendors/${id}/auth`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(authData),
//         credentials: 'include',
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `Failed to update auth settings: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('Auth update response:', data);
      
//       // Show success message
//       setSaveSuccess(true);
//       setTimeout(() => setSaveSuccess(false), 3000);
      
//       // Refresh vendor data
//       fetchVendorDetails();
//     } catch (error) {
//       console.error('Error updating auth settings:', error);
//       setSaveError(error instanceof Error ? error.message : 'Failed to update auth settings');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Handle tab change
//   const handleTabChange = (tab: string) => {
//     setActiveTab(tab);
//     // Update URL without reloading the page
//     const url = new URL(window.location.href);
//     url.searchParams.set('tab', tab);
//     window.history.pushState({}, '', url.toString());
//   };

//   if (isLoading) {
//     return (
//       <Container className="py-8">
//         <div className="flex items-center justify-center h-40">
//           <Text>Loading creator details...</Text>
//         </div>
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container className="py-8">
//         <div className="p-4 text-red-600 border border-red-300 rounded bg-red-50">
//           <Heading level="h2" className="mb-2 text-lg">Error</Heading>
//           <Text>{error}</Text>
//           <Button 
//             variant="secondary" 
//             className="mt-4"
//             onClick={() => navigate(`/vendors/${id}`)}
//           >
//             Back to Creator Details
//           </Button>
//         </div>
//       </Container>
//     );
//   }

//   if (!vendor) {
//     return (
//       <Container className="py-8">
//         <div className="p-4 border border-gray-300 rounded bg-gray-50">
//           <Heading level="h2" className="mb-2 text-lg">Creator Not Found</Heading>
//           <Text>The requested creator could not be found.</Text>
//           <Button 
//             variant="secondary" 
//             className="mt-4"
//             onClick={() => navigate("/vendors")}
//           >
//             Back to Creators
//           </Button>
//         </div>
//       </Container>
//     );
//   }

//   return (
//     <Container className="py-8">
//       <div className="flex items-center justify-between mb-6">
//         <Heading level="h1">Edit {vendor.name}</Heading>
//         <div className="flex gap-2">
//           <Button
//             variant="secondary"
//             onClick={() => navigate(`/vendors/${id}`)}
//           >
//             Back to Creator Details
//           </Button>
//           <Button
//             variant="secondary"
//             onClick={() => navigate("/vendors")}
//           >
//             All Creators
//           </Button>
//         </div>
//       </div>
      
//       {/* Success message */}
//       {saveSuccess && (
//         <div className="p-4 mb-4 text-green-600 border border-green-300 rounded bg-green-50">
//           <div className="flex items-center gap-2">
//             <span className="font-bold">Success:</span>
//             <span>Changes saved successfully!</span>
//           </div>
//         </div>
//       )}
      
//       {/* Error message */}
//       {saveError && (
//         <div className="p-4 mb-4 text-red-600 border border-red-300 rounded bg-red-50">
//           <Heading level="h2" className="mb-2 text-lg">Error</Heading>
//           <Text>{saveError}</Text>
//         </div>
//       )}

//       {/* Verification Status Badge */}
//       <div className="mb-6">
//         <div className="flex items-center gap-2">
//           <Badge 
//             className={vendor.verified === "Yes" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
//           >
//             {vendor.verified === "Yes" ? "Verified Creator" : "Unverified Creator"}
//           </Badge>
          
//           {vendor.gst_verification_status === "verified" && (
//             <Badge className="text-blue-800 bg-blue-100">
//               GST Verified
//             </Badge>
//           )}
//         </div>
//       </div>

//       {/* Tabs navigation */}
//       <div className="mb-6 border-b">
//         <div className="flex gap-6">
//           <Button 
//             variant="transparent" 
//             className={`py-2 px-1 border-b-2 rounded-none ${activeTab === "basic" ? "border-blue-500" : "border-transparent"}`}
//             onClick={() => handleTabChange("basic")}
//           >
//             Basic Info
//           </Button>
//           <Button 
//             variant="transparent" 
//             className={`py-2 px-1 border-b-2 rounded-none ${activeTab === "profile" ? "border-blue-500" : "border-transparent"}`}
//             onClick={() => handleTabChange("profile")}
//           >
//             Profile & Social
//           </Button>
//           <Button 
//             variant="transparent" 
//             className={`py-2 px-1 border-b-2 rounded-none ${activeTab === "business" ? "border-blue-500" : "border-transparent"}`}
//             onClick={() => handleTabChange("business")}
//           >
//             Business Details
//           </Button>
//           <Button 
//             variant="transparent" 
//             className={`py-2 px-1 border-b-2 rounded-none ${activeTab === "banking" ? "border-blue-500" : "border-transparent"}`}
//             onClick={() => handleTabChange("banking")}
//           >
//             Banking Info
//           </Button>
//           <Button 
//             variant="transparent" 
//             className={`py-2 px-1 border-b-2 rounded-none ${activeTab === "admins" ? "border-blue-500" : "border-transparent"}`}
//             onClick={() => handleTabChange("admins")}
//           >
//             Account Admins
//           </Button>
//           <Button 
//             variant="transparent" 
//             className={`py-2 px-1 border-b-2 rounded-none ${activeTab === "metadata" ? "border-blue-500" : "border-transparent"}`}
//             onClick={() => handleTabChange("metadata")}
//           >
//             Metadata
//           </Button>
//         </div>
//       </div>
      
//       {/* Basic Info Tab */}
//       {activeTab === "basic" && (
//         <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//           <div className="md:col-span-2">
//             <div className="p-6 mb-6 bg-white border rounded-lg">
//               <Heading level="h2" className="mb-4">Basic Information</Heading>
              
//               <div className="space-y-6">
//                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                   <div>
//                     <Label htmlFor="name" className="block mb-2">Creator Name*</Label>
//                     <Input 
//                       id="name"
//                       name="name"
//                       type="text" 
//                       value={formData.name} 
//                       onChange={handleFormChange}
//                       placeholder="Enter creator name"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <Label htmlFor="handle" className="block mb-2">Handle</Label>
//                     <Input 
//                       id="handle"
//                       name="handle"
//                       type="text" 
//                       value={formData.handle || ''} 
//                       onChange={handleFormChange}
//                       placeholder="Enter handle (URL-friendly name)"
//                     />
//                     <Text className="mt-1 text-xs text-gray-500">
//                       Will be displayed as @{formData.handle || 'handle'}
//                     </Text>
//                   </div>
//                 </div>
                
//                 <div>
//                   <Label htmlFor="creator_title" className="block mb-2">Professional Title</Label>
//                   <Input 
//                     id="creator_title"
//                     name="creator_title"
//                     type="text" 
//                     value={formData.creator_title || ''} 
//                     onChange={handleFormChange}
//                     placeholder="Enter professional title"
//                   />
//                 </div>
                
//                 {/* Verification Status */}
//                 <div className="pt-4 border-t">
//                   <Heading level="h3" className="mb-3 text-lg">Verification Status</Heading>
                  
//                   <div className="space-y-4">
//                     <div>
//                       <div className="flex items-center justify-between mb-2">
//                         <div>
//                           <Label htmlFor="verified" className="block mb-1">Creator Verification</Label>
//                           <Text className="text-sm text-gray-500">
//                             Mark this creator as verified
//                           </Text>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Switch
//                             checked={formData.verified === "Yes"}
//                             onCheckedChange={handleVerifiedToggle}
//                           />
//                           <Button 
//                             variant="secondary"
//                             size="small"
//                             disabled={formData.verified === "Yes"}
//                             onClick={() => setFormData(prev => ({ ...prev, verified: "Yes" }))}
//                           >
//                             Verify Now
//                           </Button>
//                         </div>
//                       </div>
                      
//                       {/* Display current verification status */}
//                       <div className="p-2 border rounded bg-gray-50">
//                         <Badge 
//                           className={formData.verified === "Yes" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
//                         >
//                           {formData.verified === "Yes" ? "Verified" : "Unverified"}
//                         </Badge>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="pt-4 border-t">
//                   <Heading level="h3" className="mb-3 text-lg">Creator Images</Heading>
                  
//                   <div className="space-y-4">
//                     <div>
//                       <Label htmlFor="logo" className="block mb-2">Logo URL</Label>
//                       <Input 
//                         id="logo"
//                         name="logo"
//                         type="text" 
//                         value={formData.logo || ''} 
//                         onChange={handleFormChange}
//                         placeholder="Enter logo URL"
//                       />
                      
//                       {/* Logo preview */}
//                       {formData.logo && (
//                         <div className="mt-2">
//                           <Label className="block mb-2">Logo Preview</Label>
//                           <div className="w-20 h-20 overflow-hidden border rounded">
//                             <img 
//                               src={formData.logo} 
//                               alt="Creator logo" 
//                               className="object-contain w-full h-full"
//                               onError={(e) => {
//                                 (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Error';
//                               }}
//                             />
//                           </div>
//                         </div>
//                       )}
                      
//                       {/* Logo upload */}
//                       <div className="mt-2">
//                         <Label htmlFor="logoFile" className="block mb-2">Upload New Logo</Label>
//                         <div className="flex items-center gap-2">
//                           <Input 
//                             id="logoFile"
//                             type="file" 
//                             accept="image/*"
//                             onChange={(e) => handleFileChange(e, 'logo')}
//                             disabled={isUploading && uploadType === 'logo'}
//                           />
//                           <Button
//                             variant="secondary"
//                             onClick={() => handleFileUpload('logo')}
//                             disabled={!selectedLogo || (isUploading && uploadType === 'logo')}
//                           >
//                             {isUploading && uploadType === 'logo' ? 'Uploading...' : 'Upload'}
//                           </Button>
//                         </div>
                        
//                         {/* Upload progress */}
//                         {isUploading && uploadType === 'logo' && (
//                           <div className="mt-2">
//                             <div className="w-full bg-gray-200 rounded-full h-2.5">
//                               <div 
//                                 className="bg-blue-600 h-2.5 rounded-full" 
//                                 style={{ width: `${uploadProgress}%` }}
//                               ></div>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
                    
//                     <div>
//                       <Label htmlFor="coverphoto" className="block mb-2">Cover Photo URL</Label>
//                       <Input 
//                         id="coverphoto"
//                         name="coverphoto"
//                         type="text" 
//                         value={formData.coverphoto || ''} 
//                         onChange={handleFormChange}
//                         placeholder="Enter cover photo URL"
//                       />
                      
//                       {/* Cover photo preview */}
//                       {formData.coverphoto && (
//                         <div className="mt-2">
//                           <Label className="block mb-2">Cover Photo Preview</Label>
//                           <div className="w-full h-32 overflow-hidden border rounded">
//                             <img 
//                               src={formData.coverphoto} 
//                               alt="Cover photo" 
//                               className="object-cover w-full h-full"
//                               onError={(e) => {
//                                 (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x200?text=Error';
//                               }}
//                             />
//                           </div>
//                         </div>
//                       )}
                      
//                       {/* Cover photo upload */}
//                       <div className="mt-2">
//                         <Label htmlFor="coverFile" className="block mb-2">Upload New Cover Photo</Label>
//                         <div className="flex items-center gap-2">
//                           <Input 
//                             id="coverFile"
//                             type="file" 
//                             accept="image/*"
//                             onChange={(e) => handleFileChange(e, 'coverphoto')}
//                             disabled={isUploading && uploadType === 'coverphoto'}
//                           />
//                           <Button
//                             variant="secondary"
//                             onClick={() => handleFileUpload('coverphoto')}
//                             disabled={!selectedCoverPhoto || (isUploading && uploadType === 'coverphoto')}
//                           >
//                             {isUploading && uploadType === 'coverphoto' ? 'Uploading...' : 'Upload'}
//                           </Button>
//                         </div>
                        
//                         {/* Upload progress */}
//                         {isUploading && uploadType === 'coverphoto' && (
//                           <div className="mt-2">
//                             <div className="w-full bg-gray-200 rounded-full h-2.5">
//                               <div 
//                                 className="bg-blue-600 h-2.5 rounded-full" 
//                                 style={{ width: `${uploadProgress}%` }}
//                               ></div>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             {/* Login Information */}
//             <div className="p-6 mb-6 bg-white border rounded-lg">
//               <Heading level="h2" className="mb-4">Login Information</Heading>
              
//               <div className="space-y-4">
//                 <div>
//                   <div className="flex items-center justify-between mb-2">
//                     <Label htmlFor="auth_enabled" className="mb-0">Authentication Status</Label>
//                     <Switch
//                       checked={formData.auth_enabled || false}
//                       onCheckedChange={handleAuthEnabledChange}
//                     />
//                   </div>
//                   <Badge 
//                     className={formData.auth_enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
//                   >
//                     {formData.auth_enabled ? "Enabled" : "Disabled"}
//                   </Badge>
//                 </div>
                
//                 <div>
//                   <Label htmlFor="login_email" className="block mb-2">Login Email</Label>
//                   <Input 
//                     id="login_email"
//                     name="login_email"
//                     type="email" 
//                     value={formData.login_email || ''} 
//                     onChange={handleFormChange}
//                     placeholder="Enter login email"
//                     disabled={!formData.auth_enabled}
//                   />
//                   <Text className="mt-1 text-xs text-gray-500">
//                     The creator will use this email to log in to their account
//                   </Text>
//                 </div>
                
//                 <div className="pt-2">
//                   <Button
//                     variant="secondary"
//                     size="small"
//                     onClick={handleManageAuth}
//                     disabled={isSaving}
//                   >
//                     {isSaving ? 'Saving...' : 'Update Auth Settings'}
//                   </Button>
                  
//                   {formData.auth_enabled && formData.login_email && (
//                     <Button
//                       variant="secondary"
//                       size="small"
//                       className="ml-2"
//                       onClick={() => {
//                         if (confirm("This will send a password reset email to the creator. Continue?")) {
//                           // Add reset password logic here
//                           console.log("Sending password reset to", formData.login_email);
//                         }
//                       }}
//                     >
//                       Reset Password
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Creator Bio */}
//           <div className="md:col-span-1">
//             <div className="p-6 mb-6 bg-white border rounded-lg">
//               <Heading level="h2" className="mb-4">Creator Bio</Heading>
              
//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="creator_bio" className="block mb-2">Biography</Label>
//                   <Textarea
//                     id="creator_bio"
//                     name="creator_bio"
//                     value={formData.creator_bio || ''}
//                     onChange={handleFormChange}
//                     placeholder="Enter creator biography"
//                     rows={10}
//                   />
//                   <Text className="mt-1 text-xs text-gray-500">
//                     Describe the creator's background, expertise, and story
//                   </Text>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           <div className="md:col-span-3">
//             <div className="flex justify-end pt-4 border-t">
//               <Button
//                 variant="primary"
//                 onClick={handleSaveVendor}
//                 disabled={isSaving}
//               >
//                 {isSaving ? 'Saving...' : 'Save Basic Info'}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
      
//       {/* Profile & Social Tab */}
//       {activeTab === "profile" && (
//         <div className="p-6 mb-6 bg-white border rounded-lg">
//           <Heading level="h2" className="mb-4">Social Media & Contact</Heading>
          
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//             <div>
//               <Heading level="h3" className="mb-3 text-lg">Social Profiles</Heading>
//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="youtube" className="block mb-2">YouTube</Label>
//                   <Input 
//                     id="youtube"
//                     name="youtube"
//                     type="text" 
//                     value={formData.youtube || ''} 
//                     onChange={handleFormChange}
//                     placeholder="Enter YouTube channel URL"
//                   />
//                 </div>
                
//                 <div>
//                   <Label htmlFor="instagram" className="block mb-2">Instagram</Label>
//                   <Input 
//                     id="instagram"
//                     name="instagram"
//                     type="text" 
//                     value={formData.instagram || ''} 
//                     onChange={handleFormChange}
//                     placeholder="Enter Instagram handle or URL"
//                   />
//                 </div>
                
//                 <div>
//                   <Label htmlFor="xtwitter" className="block mb-2">X (Twitter)</Label>
//                   <Input 
//                     id="xtwitter"
//                     name="xtwitter"
//                     type="text" 
//                     value={formData.xtwitter || ''} 
//                     onChange={handleFormChange}
//                     placeholder="Enter X (Twitter) handle or URL"
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="facebook" className="block mb-2">Facebook</Label>
//                   <Input 
//                     id="facebook"
//                     name="facebook"
//                     type="text" 
//                     value={formData.facebook || ''} 
//                     onChange={handleFormChange}
//                     placeholder="Enter facebook handle or URL"
//                   />
//                 </div>
                
//                 <div>
//                   <Label htmlFor="othersocial" className="block mb-2">Other Social</Label>
//                   <Input 
//                     id="othersocial"
//                     name="othersocial"
//                     type="text" 
//                     value={formData.othersocial || ''} 
//                     onChange={handleFormChange}
//                     placeholder="Enter other social media profile"
//                   />
//                 </div>
//               </div>
//             </div>
            
//             <div>
//               <Heading level="h3" className="mb-3 text-lg">Contact Information</Heading>
//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="phonenumber" className="block mb-2">Phone Number</Label>
//                   <Input 
//                     id="phonenumber"
//                     name="phonenumber"
//                     type="tel" 
//                     value={formData.phonenumber || ''} 
//                     onChange={handleFormChange}
//                     placeholder="Enter phone number"
//                   />
//                 </div>
                
//                 <div>
//                   <Label htmlFor="address" className="block mb-2">Address</Label>
//                   <Textarea
//                     id="address"
//                     name="address"
//                     value={formData.address || ''}
//                     onChange={handleFormChange}
//                     placeholder="Enter street address"
//                     rows={3}
//                   />
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="city" className="block mb-2">City</Label>
//                     <Input 
//                       id="city"
//                       name="city"
//                       type="text" 
//                       value={formData.city || ''} 
//                       onChange={handleFormChange}
//                       placeholder="Enter city"
//                     />
//                   </div>
                  
//                   <div>
//                     <Label htmlFor="state" className="block mb-2">State</Label>
//                     <Input 
//                       id="state"
//                       name="state"
//                       type="text" 
//                       value={formData.state || ''} 
//                       onChange={handleFormChange}
//                       placeholder="Enter state"
//                     />
//                   </div>
//                 </div>
                
//                 <div>
//                   <Label htmlFor="pincode" className="block mb-2">Pincode</Label>
//                   <Input 
//                     id="pincode"
//                     name="pincode"
//                     type="text" 
//                     value={formData.pincode || ''} 
//                     onChange={handleFormChange}
//                     placeholder="Enter pincode"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           <div className="flex justify-end pt-4 mt-6 border-t">
//             <Button
//               variant="primary"
//               onClick={handleSaveVendor}
//               disabled={isSaving}
//             >
//               {isSaving ? 'Saving...' : 'Save Profile & Social'}
//             </Button>
//           </div>
//         </div>
//       )}
      
//       {/* Business Details Tab */}
//       {activeTab === "business" && (
//         <div className="p-6 mb-6 bg-white border rounded-lg">
//           <Heading level="h2" className="mb-4">Business Information</Heading>
          
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//             <div>
//               <Heading level="h3" className="mb-3 text-lg">Company Details</Heading>
//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="companyname" className="block mb-2">Company Name</Label>
//                   <Input 
//                     id="companyname"
//                     name="companyname"
//                     type="text" 
//                     value={formData.companyname || ''} 
//                     onChange={handleFormChange}
//                     placeholder="Enter company name"
//                   />
//                 </div>
                
//                 <div>
//                   <Label htmlFor="GSTIN" className="block mb-2">GSTIN</Label>
//                   <div className="flex items-center gap-2">
//                     <Input 
//                       id="GSTIN"
//                       name="GSTIN"
//                       type="text" 
//                       value={formData.GSTIN || ''} 
//                       onChange={handleFormChange}
//                       placeholder="Enter GSTIN"
//                     />
//                     {formData.gst_verification_status === "verified" && (
//                       <Badge className="text-green-800 bg-green-100 whitespace-nowrap">
//                         Verified
//                       </Badge>
//                     )}
//                   </div>
//                 </div>
                
//                 {/* GST Verification Status */}
//                 <div>
//                   <Label htmlFor="gst_verification_status" className="block mb-2">GST Verification Status</Label>
//                   <div className="relative">
//                     <select
//                       id="gst_verification_status"
//                       name="gst_verification_status"
//                       value={formData.gst_verification_status || 'pending'} 
//                       onChange={handleFormChange}
//                       className="block w-full px-3 py-2 text-sm border border-gray-200 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                     >
//                       <option value="pending">Pending</option>
//                       <option value="verified">Verified</option>
//                       <option value="failed">Failed</option>
//                     </select>
//                   </div>
                  
//                   {/* Display current verification status with badge */}
//                   <div className="mt-2">
//                     <Badge 
//                       className={
//                         formData.gst_verification_status === "verified" 
//                           ? "bg-green-100 text-green-800" 
//                           : formData.gst_verification_status === "failed"
//                             ? "bg-red-100 text-red-800"
//                             : "bg-yellow-100 text-yellow-800"
//                       }
//                     >
//                       {formData.gst_verification_status === "verified" 
//                         ? "Verified" 
//                         : formData.gst_verification_status === "failed" 
//                           ? "Failed" 
//                           : "Pending"
//                       }
//                     </Badge>
//                   </div>
                  
//                   {/* Quick action buttons */}
//                   <div className="flex gap-2 mt-2">
//                     <Button 
//                       variant="secondary"
//                       size="small"
//                       onClick={() => handleGstStatusChange("verified")}
//                       disabled={formData.gst_verification_status === "verified" || !formData.GSTIN}
//                     >
//                       Mark as Verified
//                     </Button>
//                     <Button 
//                       variant="secondary"
//                       size="small"
//                       onClick={() => handleGstStatusChange("failed")}
//                       disabled={formData.gst_verification_status === "failed" || !formData.GSTIN}
//                     >
//                       Mark as Failed
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             <div>
//               <Heading level="h3" className="mb-3 text-lg">Tax Information</Heading>
//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="pan_number" className="block mb-2">PAN Number</Label>
//                   <Input 
//                     id="pan_number"
//                     name="pan_number"
//                     type="text" 
//                     value={formData.pan_number || ''} 
//                     onChange={handleFormChange}
//                     placeholder="Enter PAN number"
//                   />
//                 </div>
                
//                 <div>
//                   <Label htmlFor="tan_number" className="block mb-2">TAN Number</Label>
//                   <Input 
//                     id="tan_number"
//                     name="tan_number"
//                     type="text" 
//                     value={formData.tan_number || ''} 
//                     onChange={handleFormChange}
//                     placeholder="Enter TAN number"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           <div className="flex justify-end pt-4 mt-6 border-t">
//             <Button
//               variant="primary"
//               onClick={handleSaveVendor}
//               disabled={isSaving}
//             >
//               {isSaving ? 'Saving...' : 'Save Business Details'}
//             </Button>
//           </div>
//         </div>
//       )}
      
//       {/* Banking Info Tab */}
//       {activeTab === "banking" && (
//         <div className="p-6 mb-6 bg-white border rounded-lg">
//           <Heading level="h2" className="mb-4">Banking Details</Heading>
          
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//             <div>
//               <Heading level="h3" className="mb-3 text-lg">Account Information</Heading>
//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="bank_account_holder_name" className="block mb-2">Account Holder Name</Label>
//                   <Input 
//                     id="bank_account_holder_name"
//                     name="bank_account_holder_name"
//                     type="text" 
//                     value={formData.bank_account_holder_name || ''} 
//                     onChange={handleFormChange}
//                     placeholder="Enter account holder name"
//                   />
//                 </div>
                
//                 <div>
//                   <Label htmlFor="bank_name" className="block mb-2">Bank Name</Label>
//                   <Input 
//                     id="bank_name"
//                     name="bank_name"
//                     type="text" 
//                     value={formData.bank_name || ''} 
//                     onChange={handleFormChange}
//                     placeholder="Enter bank name"
//                   />
//                 </div>
                
//                 <div>
//                   <Label htmlFor="bank_account_type" className="block mb-2">Account Type</Label>
//                   <div className="relative">
//                     <select
//                       id="bank_account_type"
//                       name="bank_account_type"
//                       value={formData.bank_account_type || 'Saving'} 
//                       onChange={handleFormChange}
//                       className="block w-full px-3 py-2 text-sm border border-gray-200 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                     >
//                       <option value="Saving">Saving</option>
//                       <option value="Current">Current</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             <div>
//               <Heading level="h3" className="mb-3 text-lg">Account Details</Heading>
//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="bank_account_number" className="block mb-2">Account Number</Label>
//                   <Input 
//                     id="bank_account_number"
//                     name="bank_account_number"
//                     type="text" 
//                     value={formData.bank_account_number || ''} 
//                     onChange={handleFormChange}
//                     placeholder="Enter account number"
//                   />
//                 </div>
                
//                 <div>
//                   <Label htmlFor="bank_account_ifsc_code" className="block mb-2">IFSC Code</Label>
//                   <Input 
//                     id="bank_account_ifsc_code"
//                     name="bank_account_ifsc_code"
//                     type="text" 
//                     value={formData.bank_account_ifsc_code || ''} 
//                     onChange={handleFormChange}
//                     placeholder="Enter IFSC code"
//                   />
//                 </div>
                
//                 <div>
//                   <Label htmlFor="cancelled_checkque" className="block mb-2">Cancelled Cheque</Label>
//                   <Input 
//                     id="cancelled_checkque"
//                     name="cancelled_checkque"
//                     type="text" 
//                     value={formData.cancelled_checkque || ''} 
//                     onChange={handleFormChange}
//                     placeholder="Enter cancelled cheque URL"
//                     disabled={isUploading}
//                   />
                  
//                   {formData.cancelled_checkque && (
//                     <div className="mt-2">
//                       <Badge className="text-green-800 bg-green-100">Uploaded</Badge>
//                       <Button
//                         variant="secondary"
//                         size="small"
//                         className="ml-2"
//                         onClick={() => window.open(formData.cancelled_checkque, '_blank')}
//                       >
//                         View
//                       </Button>
//                     </div>
//                   )}
                  
//                   {/* Cheque upload */}
//                   <div className="mt-4">
//                     <Label htmlFor="chequeFile" className="block mb-2">Upload New Cheque</Label>
//                     <div className="flex items-center gap-2">
//                       <Input 
//                         id="chequeFile"
//                         type="file" 
//                         accept="image/*,application/pdf"
//                         onChange={(e) => handleFileChange(e, 'cheque')}
//                         disabled={isUploading && uploadType === 'cheque'}
//                       />
//                       <Button
//                         variant="secondary"
//                         onClick={() => handleFileUpload('cheque')}
//                         disabled={!selectedCheque || (isUploading && uploadType === 'cheque')}
//                       >
//                         {isUploading && uploadType === 'cheque' ? 'Uploading...' : 'Upload'}
//                       </Button>
//                     </div>
                    
//                     {/* Upload progress */}
//                     {isUploading && uploadType === 'cheque' && (
//                       <div className="mt-2">
//                         <div className="w-full bg-gray-200 rounded-full h-2.5">
//                           <div 
//                             className="bg-blue-600 h-2.5 rounded-full" 
//                             style={{ width: `${uploadProgress}%` }}
//                           ></div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           <div className="flex justify-end pt-4 mt-6 border-t">
//             <Button
//               variant="primary"
//               onClick={handleSaveVendor}
//               disabled={isSaving}
//             >
//               {isSaving ? 'Saving...' : 'Save Banking Details'}
//             </Button>
//           </div>
//         </div>
//       )}
      
//       {/* Admins Tab */}
//       {activeTab === "admins" && (
//         <div className="p-6 mb-6 bg-white border rounded-lg">
//           <div className="flex items-center justify-between mb-4">
//             <Heading level="h2">Account Administrators</Heading>
//             <Button
//               variant="secondary"
//               size="small"
//               onClick={() => setShowAddAdmin(!showAddAdmin)}
//             >
//               {showAddAdmin ? 'Cancel' : 'Add New Admin'}
//             </Button>
//           </div>
          
//           {/* Add admin form */}
//           {showAddAdmin && (
//             <div className="p-4 mb-6 border rounded-lg bg-gray-50">
//               <div className="flex items-center justify-between mb-4">
//                 <Heading level="h3" className="text-md">Add New Admin</Heading>
//                 <Button
//                   variant="secondary"
//                   size="small"
//                   onClick={() => setShowAddAdmin(false)}
//                 >
//                   Cancel
//                 </Button>
//               </div>
              
//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="adminEmail" className="block mb-2">Email Address*</Label>
//                   <Input 
//                     id="adminEmail"
//                     name="email"
//                     type="email" 
//                     value={newAdmin.email} 
//                     onChange={handleNewAdminChange}
//                     placeholder="Enter admin email"
//                     required
//                   />
//                   <Text className="mt-1 text-xs text-gray-500">
//                     The admin will receive an invitation email to join as a creator administrator.
//                   </Text>
//                 </div>
                
//                 <div>
//                   <Label htmlFor="adminFirstName" className="block mb-2">First Name</Label>
//                   <Input 
//                     id="adminFirstName"
//                     name="first_name"
//                     type="text" 
//                     value={newAdmin.first_name} 
//                     onChange={handleNewAdminChange}
//                     placeholder="Enter first name"
//                   />
//                 </div>
                
//                 <div>
//                   <Label htmlFor="adminLastName" className="block mb-2">Last Name</Label>
//                   <Input 
//                     id="adminLastName"
//                     name="last_name"
//                     type="text" 
//                     value={newAdmin.last_name} 
//                     onChange={handleNewAdminChange}
//                     placeholder="Enter last name"
//                   />
//                 </div>
                
//                 <div className="flex justify-end pt-2 mt-4 border-t">
//                   <Button
//                     variant="primary"
//                     size="small"
//                     onClick={handleAddAdmin}
//                     disabled={isSaving || !newAdmin.email}
//                     className="mt-2"
//                   >
//                     {isSaving ? 'Adding...' : 'Add Admin'}
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           )}
          
//           {/* Admin list */}
//           {vendor.admins && vendor.admins.length > 0 ? (
//             <div className="space-y-4">
//               {vendor.admins.map((admin) => (
//                 <div key={admin.id} className="p-4 border rounded-lg bg-gray-50">
//                   <div className="space-y-2">
//                     <div className="flex items-start justify-between">
//                       <div>
//                         <Text className="font-medium">
//                           {admin.first_name || admin.last_name ? 
//                             `${admin.first_name || ''} ${admin.last_name || ''}`.trim() : 
//                             'Unnamed Admin'}
//                         </Text>
//                         <Text>{admin.email}</Text>
//                         <Text className="text-sm text-gray-500">
//                           Added: {new Date(admin.created_at).toLocaleDateString()}
//                         </Text>
//                       </div>
//                       <div className="flex gap-2">
//                         <Button
//                           variant="danger"
//                           size="small"
//                           onClick={() => handleDeleteAdmin(admin.id)}
//                         >
//                           Remove
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="p-4 text-center border rounded-lg bg-gray-50">
//               <Text className="text-gray-500">No admins assigned to this creator</Text>
//             </div>
//           )}
//         </div>
//       )}
      
//       {/* Metadata Tab */}
//       {activeTab === "metadata" && (
//         <div className="p-6 mb-6 bg-white border rounded-lg">
//           <div className="flex items-center justify-between mb-4">
//             <Heading level="h2">Metadata</Heading>
//             <Button
//               variant="secondary"
//               size="small"
//               onClick={addMetadataItem}
//             >
//               Add Field
//             </Button>
//           </div>
          
//           <div className="mb-4">
//             <Text className="text-gray-600">
//               Use metadata to store additional custom information about this creator.
//               These are custom key-value pairs that can be used for any purpose.
//             </Text>
//           </div>
          
//           {/* Metadata list */}
//           <div className="space-y-4">
//             {metadataItems.map((item, index) => (
//               <div key={index} className="flex items-start gap-2">
//                 <div className="flex-1">
//                   <Label htmlFor={`meta-key-${index}`} className="block mb-1">Key</Label>
//                   <Input 
//                     id={`meta-key-${index}`}
//                     type="text" 
//                     value={item.key} 
//                     onChange={(e) => handleMetadataChange(index, 'key', e.target.value)}
//                     placeholder="Enter metadata key"
//                   />
//                 </div>
                
//                 <div className="flex-1">
//                   <Label htmlFor={`meta-value-${index}`} className="block mb-1">Value</Label>
//                   <Input 
//                     id={`meta-value-${index}`}
//                     type="text" 
//                     value={item.value} 
//                     onChange={(e) => handleMetadataChange(index, 'value', e.target.value)}
//                     placeholder="Enter metadata value"
//                   />
//                 </div>
                
//                 <div className="pt-6">
//                   <Button
//                     variant="secondary"
//                     size="small"
//                     onClick={() => removeMetadataItem(index)}
//                     disabled={metadataItems.length === 1 && item.key === '' && item.value === ''}
//                   >
//                     Remove
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
          
//           <div className="flex justify-end pt-4 mt-6 border-t">
//             <Button
//               variant="primary"
//               onClick={handleSaveVendor}
//               disabled={isSaving}
//             >
//               {isSaving ? 'Saving...' : 'Save Metadata'}
//             </Button>
//           </div>
//         </div>
//       )}
//     </Container>
//   );
// };

// export default CreatorEditPage;



import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Heading, Label, Button, Input, Text, Textarea, Switch, Badge } from "@medusajs/ui";

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
  facebook?: string;
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
  login_email?: string;
  auth_enabled?: boolean;
  last_login?: string;
  verified?: "Yes" | "No";
  gst_verification_status?: "pending" | "verified" | "failed";
  metadata?: Record<string, any>;
  // ── store mode ─────────────────────────────────────────────────────────────
  sell_on_marketplace?: boolean;
  sell_on_own_store?: boolean;
}

interface VendorFormData {
  name: string;
  handle: string;
  logo?: string;
  coverphoto?: string;
  youtube?: string;
  instagram?: string;
  xtwitter?: string;
  facebook?: string;
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
  login_email?: string;
  auth_enabled?: boolean;
  verified?: "Yes" | "No";
  gst_verification_status?: "pending" | "verified" | "failed";
  metadata?: Record<string, any>;
  // ── store mode ─────────────────────────────────────────────────────────────
  sell_on_marketplace?: boolean;
  sell_on_own_store?: boolean;
}

interface AdminFormData {
  email: string;
  first_name: string;
  last_name: string;
}

interface MetadataItem {
  key: string;
  value: string;
}

// Coerce any DB value to a real boolean
const coerceBool = (val: any): boolean => {
  if (val === true  || val === 1 || val === "true"  || val === "1") return true
  return false
}

const CreatorEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get("tab");

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(tabParam || "basic");

  const [formData, setFormData] = useState<VendorFormData>({ name: "", handle: "" });

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState<AdminFormData>({ email: "", first_name: "", last_name: "" });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [selectedCoverPhoto, setSelectedCoverPhoto] = useState<File | null>(null);
  const [selectedCheque, setSelectedCheque] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState<string>("");

  const [metadataItems, setMetadataItems] = useState<MetadataItem[]>([{ key: "", value: "" }]);

  useEffect(() => { fetchVendorDetails(); }, [id]);

  const fetchVendorDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/vendors?vendor_id=${id}`, { credentials: "include" });
      if (!response.ok) throw new Error(`Failed to fetch creator details: ${response.status}`);
      const data = await response.json();

      if (data.vendor) {
        setVendor(data.vendor);
        setFormData({
          name: data.vendor.name || "",
          handle: data.vendor.handle || "",
          logo: data.vendor.logo || "",
          coverphoto: data.vendor.coverphoto || "",
          youtube: data.vendor.youtube || "",
          instagram: data.vendor.instagram || "",
          xtwitter: data.vendor.xtwitter || "",
          facebook: data.vendor.facebook || "",
          othersocial: data.vendor.othersocial || "",
          phonenumber: data.vendor.phonenumber || "",
          GSTIN: data.vendor.GSTIN || "",
          companyname: data.vendor.companyname || "",
          pan_number: data.vendor.pan_number || "",
          city: data.vendor.city || "",
          pincode: data.vendor.pincode || "",
          state: data.vendor.state || "",
          address: data.vendor.address || "",
          tan_number: data.vendor.tan_number || "",
          bank_account_holder_name: data.vendor.bank_account_holder_name || "",
          bank_account_number: data.vendor.bank_account_number || "",
          bank_account_ifsc_code: data.vendor.bank_account_ifsc_code || "",
          bank_name: data.vendor.bank_name || "",
          bank_account_type: data.vendor.bank_account_type || "Saving",
          cancelled_checkque: data.vendor.cancelled_checkque || "",
          creator_bio: data.vendor.creator_bio || "",
          creator_title: data.vendor.creator_title || "",
          login_email: data.vendor.login_email || "",
          auth_enabled: data.vendor.auth_enabled || false,
          verified: data.vendor.verified || "No",
          gst_verification_status: data.vendor.gst_verification_status || "pending",
          metadata: data.vendor.metadata || {},
          // Coerce booleans from DB
          sell_on_marketplace: coerceBool(data.vendor.sell_on_marketplace),
          sell_on_own_store:   coerceBool(data.vendor.sell_on_own_store),
        });

        if (data.vendor.metadata) {
          const arr = Object.entries(data.vendor.metadata).map(([key, value]) => ({ key, value: String(value) }));
          setMetadataItems(arr.length ? arr : [{ key: "", value: "" }]);
        }
      } else {
        setError("Creator data not found in the response");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVerifiedToggle = () =>
    setFormData(prev => ({ ...prev, verified: prev.verified === "Yes" ? "No" : "Yes" }));

  const handleGstStatusChange = (value: "pending" | "verified" | "failed") =>
    setFormData(prev => ({ ...prev, gst_verification_status: value }));

  const handleAuthEnabledChange = (checked: boolean) =>
    setFormData(prev => ({ ...prev, auth_enabled: checked }));

  const handleNewAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({ ...prev, [name]: value }));
  };

  const handleMetadataChange = (index: number, field: "key" | "value", newValue: string) => {
    const updated = [...metadataItems];
    updated[index][field] = newValue;
    setMetadataItems(updated);
    const newMeta: Record<string, any> = {};
    updated.forEach(item => { if (item.key.trim()) newMeta[item.key] = item.value; });
    setFormData(prev => ({ ...prev, metadata: newMeta }));
  };

  const addMetadataItem = () => setMetadataItems([...metadataItems, { key: "", value: "" }]);

  const removeMetadataItem = (index: number) => {
    const updated = [...metadataItems];
    updated.splice(index, 1);
    if (!updated.length) updated.push({ key: "", value: "" });
    setMetadataItems(updated);
    const newMeta: Record<string, any> = {};
    updated.forEach(item => { if (item.key.trim()) newMeta[item.key] = item.value; });
    setFormData(prev => ({ ...prev, metadata: newMeta }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    if (!e.target.files?.length) return;
    if (fileType === "logo") setSelectedLogo(e.target.files[0]);
    if (fileType === "coverphoto") setSelectedCoverPhoto(e.target.files[0]);
    if (fileType === "cheque") setSelectedCheque(e.target.files[0]);
  };

  const handleFileUpload = async (fileType: string) => {
    const file = fileType === "logo" ? selectedLogo : fileType === "coverphoto" ? selectedCoverPhoto : selectedCheque;
    if (!file) return;
    try {
      setIsUploading(true); setUploadProgress(0); setUploadType(fileType); setSaveError(null);
      const fd = new FormData();
      fd.append("files", file);
      const adminToken = localStorage.getItem("adminAuthToken");
      const response = await fetch("/vendors/uploads", {
        method: "POST",
        headers: { "Authorization": adminToken ? `Bearer ${adminToken}` : "", "x-medusa-admin": "true" },
        body: fd, credentials: "include",
      });
      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
      const data = await response.json();
      const fileUrl = data.files?.[0]?.url || data.url || "";
      if (!fileUrl) throw new Error("Could not extract file URL from upload response");
      setFormData(prev => ({ ...prev, [fileType]: fileUrl }));
      setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000);
      if (fileType === "logo") setSelectedLogo(null);
      if (fileType === "coverphoto") setSelectedCoverPhoto(null);
      if (fileType === "cheque") setSelectedCheque(null);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false); setUploadProgress(100); setUploadType("");
    }
  };

  const handleSaveVendor = async () => {
    try {
      setIsSaving(true); setSaveError(null);
      const adminToken = localStorage.getItem("adminAuthToken");

      let updateData: Partial<VendorFormData> = {};
      switch (activeTab) {
        case "basic":
          updateData = { name: formData.name, handle: formData.handle, logo: formData.logo, coverphoto: formData.coverphoto, creator_title: formData.creator_title, creator_bio: formData.creator_bio, login_email: formData.login_email, auth_enabled: formData.auth_enabled, verified: formData.verified };
          break;
        case "profile":
          updateData = { youtube: formData.youtube, instagram: formData.instagram, xtwitter: formData.xtwitter, facebook: formData.facebook, othersocial: formData.othersocial, phonenumber: formData.phonenumber, address: formData.address, city: formData.city, state: formData.state, pincode: formData.pincode };
          break;
        case "business":
          updateData = { companyname: formData.companyname, GSTIN: formData.GSTIN, pan_number: formData.pan_number, tan_number: formData.tan_number, gst_verification_status: formData.gst_verification_status };
          break;
        case "banking":
          updateData = { bank_account_holder_name: formData.bank_account_holder_name, bank_account_number: formData.bank_account_number, bank_account_ifsc_code: formData.bank_account_ifsc_code, bank_name: formData.bank_name, bank_account_type: formData.bank_account_type, cancelled_checkque: formData.cancelled_checkque };
          break;
        case "store-mode":
          updateData = { sell_on_marketplace: formData.sell_on_marketplace, sell_on_own_store: formData.sell_on_own_store };
          break;
        case "metadata":
          updateData = { metadata: formData.metadata };
          break;
        default:
          updateData = { ...formData };
      }

      const response = await fetch(`/vendors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": adminToken ? `Bearer ${adminToken}` : "", "x-medusa-admin": "true" },
        body: JSON.stringify(updateData), credentials: "include",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Failed to update creator: ${response.status}`);
      }
      setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000);
      fetchVendorDetails();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAdmin = async () => {
    try {
      setIsSaving(true); setSaveError(null);
      if (!newAdmin.email.trim()) { setSaveError("Email address is required"); return; }
      const response = await fetch(`/vendors/${id}/admins`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin: { email: newAdmin.email.trim(), first_name: newAdmin.first_name.trim(), last_name: newAdmin.last_name.trim() } }),
        credentials: "include",
      });
      if (!response.ok) { const err = await response.json().catch(() => ({})); throw new Error(err.message || `Failed to add admin: ${response.status}`); }
      setNewAdmin({ email: "", first_name: "", last_name: "" }); setShowAddAdmin(false);
      setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000);
      fetchVendorDetails();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to add admin");
    } finally { setIsSaving(false); }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!window.confirm("Are you sure you want to remove this admin?")) return;
    try {
      setIsSaving(true); setSaveError(null);
      const response = await fetch(`/vendors/admins/${adminId}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error(`Failed to remove admin: ${response.status}`);
      setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000);
      fetchVendorDetails();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to remove admin");
    } finally { setIsSaving(false); }
  };

  const handleManageAuth = async () => {
    try {
      setIsSaving(true); setSaveError(null);
      const response = await fetch(`/vendors/${id}/auth`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_email: formData.login_email, auth_enabled: formData.auth_enabled }),
        credentials: "include",
      });
      if (!response.ok) throw new Error(`Failed to update auth settings: ${response.status}`);
      setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000);
      fetchVendorDetails();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to update auth settings");
    } finally { setIsSaving(false); }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.pushState({}, "", url.toString());
  };

  if (isLoading) return <Container className="py-8"><div className="flex items-center justify-center h-40"><Text>Loading creator details...</Text></div></Container>;
  if (error) return <Container className="py-8"><div className="p-4 text-red-600 border border-red-300 rounded bg-red-50"><Heading level="h2" className="mb-2 text-lg">Error</Heading><Text>{error}</Text><Button variant="secondary" className="mt-4" onClick={() => navigate(`/vendors/${id}`)}>Back to Creator Details</Button></div></Container>;
  if (!vendor) return <Container className="py-8"><div className="p-4 border border-gray-300 rounded bg-gray-50"><Heading level="h2" className="mb-2 text-lg">Creator Not Found</Heading><Button variant="secondary" className="mt-4" onClick={() => navigate("/vendors")}>Back to Creators</Button></div></Container>;

  const neitherSelected = !formData.sell_on_marketplace && !formData.sell_on_own_store;

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">Edit {vendor.name}</Heading>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/vendors/${id}`)}>Back to Creator Details</Button>
          <Button variant="secondary" onClick={() => navigate("/vendors")}>All Creators</Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 mb-4 text-green-600 border border-green-300 rounded bg-green-50">
          <span className="font-bold">Success: </span>Changes saved successfully!
        </div>
      )}
      {saveError && (
        <div className="p-4 mb-4 text-red-600 border border-red-300 rounded bg-red-50">
          <Heading level="h2" className="mb-2 text-lg">Error</Heading><Text>{saveError}</Text>
        </div>
      )}

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={vendor.verified === "Yes" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
            {vendor.verified === "Yes" ? "Verified Creator" : "Unverified Creator"}
          </Badge>
          {vendor.gst_verification_status === "verified" && <Badge className="text-blue-800 bg-blue-100">GST Verified</Badge>}
          {coerceBool(vendor.sell_on_marketplace) && <Badge className="text-orange-800 bg-orange-100">Marketplace</Badge>}
          {coerceBool(vendor.sell_on_own_store)    && <Badge className="text-green-800 bg-green-100">Own store</Badge>}
        </div>
      </div>

      {/* Tab nav */}
      <div className="mb-6 border-b">
        <div className="flex flex-wrap gap-4">
          {[
            { key: "basic",       label: "Basic Info" },
            { key: "store-mode",  label: "Store mode" },   // ← NEW
            { key: "profile",     label: "Profile & Social" },
            { key: "business",    label: "Business Details" },
            { key: "banking",     label: "Banking Info" },
            { key: "admins",      label: "Account Admins" },
            { key: "metadata",    label: "Metadata" },
          ].map(tab => (
            <Button
              key={tab.key}
              variant="transparent"
              className={`py-2 px-1 border-b-2 rounded-none ${activeTab === tab.key ? "border-blue-500" : "border-transparent"}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ── STORE MODE TAB ────────────────────────────────────────────────── */}
      {activeTab === "store-mode" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <Heading level="h2" className="mb-1">Store mode</Heading>
          <Text className="mb-6 text-sm text-gray-500">
            Control where {vendor.name}'s merch is sold. Both can be active at the same time.
          </Text>

          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
            {/* Marketplace */}
            <label className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all ${formData.sell_on_marketplace ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}>
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 accent-orange-500"
                checked={!!formData.sell_on_marketplace}
                onChange={(e) => setFormData(prev => ({ ...prev, sell_on_marketplace: e.target.checked }))}
              />
              <div>
                <Text className="font-semibold">Junooni marketplace</Text>
                <Text className="mt-1 text-sm text-gray-500">
                  Products appear on junooni.com/store/{vendor.handle || vendor.id}. Fans discover them through the platform.
                </Text>
                <Badge className="mt-2 text-orange-800 bg-orange-100">junooni.com</Badge>
              </div>
            </label>

            {/* Own store */}
            <label className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all ${formData.sell_on_own_store ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}>
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 accent-green-600"
                checked={!!formData.sell_on_own_store}
                onChange={(e) => setFormData(prev => ({ ...prev, sell_on_own_store: e.target.checked }))}
              />
              <div>
                <Text className="font-semibold">Own branded store</Text>
                <Text className="mt-1 text-sm text-gray-500">
                  A fully branded storefront at the creator's own domain. JUNOONI handles fulfillment invisibly.
                </Text>
                <Badge className="mt-2 text-green-800 bg-green-100">Custom domain</Badge>
              </div>
            </label>
          </div>

          {/* Domain field when own store is on */}
          {formData.sell_on_own_store && (
            <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
              <Label className="block mb-2 text-sm font-medium text-blue-800">
                Custom domain (fill when domain is configured)
              </Label>
              <Input
                type="text"
                placeholder="e.g. merch.tanishkbagchi.com"
                defaultValue={(vendor.metadata?.custom_domain as string) ?? ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metadata: { ...prev.metadata, custom_domain: e.target.value }
                }))}
              />
              <Text className="mt-2 text-xs text-blue-600">
                Once set, this is where the creator's branded storefront will be live.
              </Text>
            </div>
          )}

          {/* Both selected note */}
          {formData.sell_on_marketplace && formData.sell_on_own_store && (
            <div className="p-4 mb-6 border border-yellow-200 rounded-lg bg-yellow-50">
              <Text className="text-sm font-medium text-yellow-800">
                Both selected — merch will appear on junooni.com AND on the creator's own branded storefront.
              </Text>
            </div>
          )}

          {/* Neither warning */}
          {neitherSelected && (
            <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
              <Text className="text-sm text-red-800">
                ⚠️ Neither option is selected — this creator's products won't be publicly visible anywhere. Select at least one.
              </Text>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="primary"
              onClick={handleSaveVendor}
              disabled={isSaving || neitherSelected}
            >
              {isSaving ? "Saving..." : "Save store mode"}
            </Button>
          </div>
        </div>
      )}

      {/* ── BASIC INFO TAB ────────────────────────────────────────────────── */}
      {activeTab === "basic" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="p-6 mb-6 bg-white border rounded-lg">
              <Heading level="h2" className="mb-4">Basic Information</Heading>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name" className="block mb-2">Creator Name*</Label>
                    <Input id="name" name="name" type="text" value={formData.name} onChange={handleFormChange} placeholder="Enter creator name" required />
                  </div>
                  <div>
                    <Label htmlFor="handle" className="block mb-2">Handle</Label>
                    <Input id="handle" name="handle" type="text" value={formData.handle || ""} onChange={handleFormChange} placeholder="Enter handle" />
                    <Text className="mt-1 text-xs text-gray-500">Will be displayed as @{formData.handle || "handle"}</Text>
                  </div>
                </div>

                <div>
                  <Label htmlFor="creator_title" className="block mb-2">Professional Title</Label>
                  <Input id="creator_title" name="creator_title" type="text" value={formData.creator_title || ""} onChange={handleFormChange} placeholder="Enter professional title" />
                </div>

                <div className="pt-4 border-t">
                  <Heading level="h3" className="mb-3 text-lg">Verification Status</Heading>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Label className="block mb-1">Creator Verification</Label>
                      <Text className="text-sm text-gray-500">Mark this creator as verified</Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={formData.verified === "Yes"} onCheckedChange={handleVerifiedToggle} />
                      <Button variant="secondary" size="small" disabled={formData.verified === "Yes"} onClick={() => setFormData(prev => ({ ...prev, verified: "Yes" }))}>Verify Now</Button>
                    </div>
                  </div>
                  <div className="p-2 border rounded bg-gray-50">
                    <Badge className={formData.verified === "Yes" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {formData.verified === "Yes" ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Heading level="h3" className="mb-3 text-lg">Creator Images</Heading>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="logo" className="block mb-2">Logo URL</Label>
                      <Input id="logo" name="logo" type="text" value={formData.logo || ""} onChange={handleFormChange} placeholder="Enter logo URL" />
                      {formData.logo && <div className="mt-2 w-20 h-20 overflow-hidden border rounded"><img src={formData.logo} alt="Creator logo" className="object-contain w-full h-full" /></div>}
                      <div className="flex items-center gap-2 mt-2">
                        <Input id="logoFile" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "logo")} disabled={isUploading && uploadType === "logo"} />
                        <Button variant="secondary" onClick={() => handleFileUpload("logo")} disabled={!selectedLogo || (isUploading && uploadType === "logo")}>
                          {isUploading && uploadType === "logo" ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="coverphoto" className="block mb-2">Cover Photo URL</Label>
                      <Input id="coverphoto" name="coverphoto" type="text" value={formData.coverphoto || ""} onChange={handleFormChange} placeholder="Enter cover photo URL" />
                      {formData.coverphoto && <div className="mt-2 w-full h-32 overflow-hidden border rounded"><img src={formData.coverphoto} alt="Cover photo" className="object-cover w-full h-full" /></div>}
                      <div className="flex items-center gap-2 mt-2">
                        <Input id="coverFile" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "coverphoto")} disabled={isUploading && uploadType === "coverphoto"} />
                        <Button variant="secondary" onClick={() => handleFileUpload("coverphoto")} disabled={!selectedCoverPhoto || (isUploading && uploadType === "coverphoto")}>
                          {isUploading && uploadType === "coverphoto" ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 mb-6 bg-white border rounded-lg">
              <Heading level="h2" className="mb-4">Login Information</Heading>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Authentication Status</Label>
                    <Switch checked={formData.auth_enabled || false} onCheckedChange={handleAuthEnabledChange} />
                  </div>
                  <Badge className={formData.auth_enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {formData.auth_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div>
                  <Label htmlFor="login_email" className="block mb-2">Login Email</Label>
                  <Input id="login_email" name="login_email" type="email" value={formData.login_email || ""} onChange={handleFormChange} placeholder="Enter login email" disabled={!formData.auth_enabled} />
                </div>
                <div className="pt-2">
                  <Button variant="secondary" size="small" onClick={handleManageAuth} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Update Auth Settings"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="p-6 mb-6 bg-white border rounded-lg">
              <Heading level="h2" className="mb-4">Creator Bio</Heading>
              <Label htmlFor="creator_bio" className="block mb-2">Biography</Label>
              <Textarea id="creator_bio" name="creator_bio" value={formData.creator_bio || ""} onChange={handleFormChange} placeholder="Enter creator biography" rows={10} />
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="flex justify-end pt-4 border-t">
              <Button variant="primary" onClick={handleSaveVendor} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Basic Info"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROFILE & SOCIAL TAB ─────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <Heading level="h2" className="mb-4">Social Media & Contact</Heading>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Heading level="h3" className="mb-3 text-lg">Social Profiles</Heading>
              <div className="space-y-4">
                {(["youtube", "instagram", "xtwitter", "facebook", "othersocial"] as const).map((field) => (
                  <div key={field}>
                    <Label htmlFor={field} className="block mb-2">{field === "xtwitter" ? "X (Twitter)" : field === "othersocial" ? "Other Social" : field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                    <Input id={field} name={field} type="text" value={formData[field] || ""} onChange={handleFormChange} placeholder={`Enter ${field}`} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Heading level="h3" className="mb-3 text-lg">Contact Information</Heading>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phonenumber" className="block mb-2">Phone Number</Label>
                  <Input id="phonenumber" name="phonenumber" type="tel" value={formData.phonenumber || ""} onChange={handleFormChange} placeholder="Enter phone number" />
                </div>
                <div>
                  <Label htmlFor="address" className="block mb-2">Address</Label>
                  <Textarea id="address" name="address" value={formData.address || ""} onChange={handleFormChange} placeholder="Enter street address" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="block mb-2">City</Label>
                    <Input id="city" name="city" type="text" value={formData.city || ""} onChange={handleFormChange} placeholder="Enter city" />
                  </div>
                  <div>
                    <Label htmlFor="state" className="block mb-2">State</Label>
                    <Input id="state" name="state" type="text" value={formData.state || ""} onChange={handleFormChange} placeholder="Enter state" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pincode" className="block mb-2">Pincode</Label>
                  <Input id="pincode" name="pincode" type="text" value={formData.pincode || ""} onChange={handleFormChange} placeholder="Enter pincode" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 mt-6 border-t">
            <Button variant="primary" onClick={handleSaveVendor} disabled={isSaving}>{isSaving ? "Saving..." : "Save Profile & Social"}</Button>
          </div>
        </div>
      )}

      {/* ── BUSINESS DETAILS TAB ─────────────────────────────────────────── */}
      {activeTab === "business" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <Heading level="h2" className="mb-4">Business Information</Heading>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Heading level="h3" className="mb-3 text-lg">Company Details</Heading>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyname" className="block mb-2">Company Name</Label>
                  <Input id="companyname" name="companyname" type="text" value={formData.companyname || ""} onChange={handleFormChange} placeholder="Enter company name" />
                </div>
                <div>
                  <Label htmlFor="GSTIN" className="block mb-2">GSTIN</Label>
                  <Input id="GSTIN" name="GSTIN" type="text" value={formData.GSTIN || ""} onChange={handleFormChange} placeholder="Enter GSTIN" />
                </div>
                <div>
                  <Label htmlFor="gst_verification_status" className="block mb-2">GST Verification Status</Label>
                  <select id="gst_verification_status" name="gst_verification_status" value={formData.gst_verification_status || "pending"} onChange={handleFormChange} className="block w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="failed">Failed</option>
                  </select>
                  <div className="flex gap-2 mt-2">
                    <Button variant="secondary" size="small" onClick={() => handleGstStatusChange("verified")} disabled={formData.gst_verification_status === "verified" || !formData.GSTIN}>Mark as Verified</Button>
                    <Button variant="secondary" size="small" onClick={() => handleGstStatusChange("failed")} disabled={formData.gst_verification_status === "failed" || !formData.GSTIN}>Mark as Failed</Button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Heading level="h3" className="mb-3 text-lg">Tax Information</Heading>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pan_number" className="block mb-2">PAN Number</Label>
                  <Input id="pan_number" name="pan_number" type="text" value={formData.pan_number || ""} onChange={handleFormChange} placeholder="Enter PAN number" />
                </div>
                <div>
                  <Label htmlFor="tan_number" className="block mb-2">TAN Number</Label>
                  <Input id="tan_number" name="tan_number" type="text" value={formData.tan_number || ""} onChange={handleFormChange} placeholder="Enter TAN number" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 mt-6 border-t">
            <Button variant="primary" onClick={handleSaveVendor} disabled={isSaving}>{isSaving ? "Saving..." : "Save Business Details"}</Button>
          </div>
        </div>
      )}

      {/* ── BANKING INFO TAB ─────────────────────────────────────────────── */}
      {activeTab === "banking" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <Heading level="h2" className="mb-4">Banking Details</Heading>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Heading level="h3" className="mb-3 text-lg">Account Information</Heading>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bank_account_holder_name" className="block mb-2">Account Holder Name</Label>
                  <Input id="bank_account_holder_name" name="bank_account_holder_name" type="text" value={formData.bank_account_holder_name || ""} onChange={handleFormChange} placeholder="Enter account holder name" />
                </div>
                <div>
                  <Label htmlFor="bank_name" className="block mb-2">Bank Name</Label>
                  <Input id="bank_name" name="bank_name" type="text" value={formData.bank_name || ""} onChange={handleFormChange} placeholder="Enter bank name" />
                </div>
                <div>
                  <Label htmlFor="bank_account_type" className="block mb-2">Account Type</Label>
                  <select id="bank_account_type" name="bank_account_type" value={formData.bank_account_type || "Saving"} onChange={handleFormChange} className="block w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="Saving">Saving</option>
                    <option value="Current">Current</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <Heading level="h3" className="mb-3 text-lg">Account Details</Heading>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bank_account_number" className="block mb-2">Account Number</Label>
                  <Input id="bank_account_number" name="bank_account_number" type="text" value={formData.bank_account_number || ""} onChange={handleFormChange} placeholder="Enter account number" />
                </div>
                <div>
                  <Label htmlFor="bank_account_ifsc_code" className="block mb-2">IFSC Code</Label>
                  <Input id="bank_account_ifsc_code" name="bank_account_ifsc_code" type="text" value={formData.bank_account_ifsc_code || ""} onChange={handleFormChange} placeholder="Enter IFSC code" />
                </div>
                <div>
                  <Label htmlFor="cancelled_checkque" className="block mb-2">Cancelled Cheque</Label>
                  <Input id="cancelled_checkque" name="cancelled_checkque" type="text" value={formData.cancelled_checkque || ""} onChange={handleFormChange} placeholder="Enter cancelled cheque URL" disabled={isUploading} />
                  {formData.cancelled_checkque && (
                    <div className="mt-2">
                      <Badge className="text-green-800 bg-green-100">Uploaded</Badge>
                      <Button variant="secondary" size="small" className="ml-2" onClick={() => window.open(formData.cancelled_checkque, "_blank")}>View</Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-4">
                    <Input id="chequeFile" type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, "cheque")} disabled={isUploading && uploadType === "cheque"} />
                    <Button variant="secondary" onClick={() => handleFileUpload("cheque")} disabled={!selectedCheque || (isUploading && uploadType === "cheque")}>
                      {isUploading && uploadType === "cheque" ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 mt-6 border-t">
            <Button variant="primary" onClick={handleSaveVendor} disabled={isSaving}>{isSaving ? "Saving..." : "Save Banking Details"}</Button>
          </div>
        </div>
      )}

      {/* ── ADMINS TAB ───────────────────────────────────────────────────── */}
      {activeTab === "admins" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <Heading level="h2">Account Administrators</Heading>
            <Button variant="secondary" size="small" onClick={() => setShowAddAdmin(!showAddAdmin)}>
              {showAddAdmin ? "Cancel" : "Add New Admin"}
            </Button>
          </div>
          {showAddAdmin && (
            <div className="p-4 mb-6 border rounded-lg bg-gray-50">
              <Heading level="h3" className="mb-4 text-md">Add New Admin</Heading>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="adminEmail" className="block mb-2">Email Address*</Label>
                  <Input id="adminEmail" name="email" type="email" value={newAdmin.email} onChange={handleNewAdminChange} placeholder="Enter admin email" required />
                </div>
                <div>
                  <Label htmlFor="adminFirstName" className="block mb-2">First Name</Label>
                  <Input id="adminFirstName" name="first_name" type="text" value={newAdmin.first_name} onChange={handleNewAdminChange} placeholder="Enter first name" />
                </div>
                <div>
                  <Label htmlFor="adminLastName" className="block mb-2">Last Name</Label>
                  <Input id="adminLastName" name="last_name" type="text" value={newAdmin.last_name} onChange={handleNewAdminChange} placeholder="Enter last name" />
                </div>
                <div className="flex justify-end pt-2 border-t">
                  <Button variant="primary" size="small" onClick={handleAddAdmin} disabled={isSaving || !newAdmin.email}>
                    {isSaving ? "Adding..." : "Add Admin"}
                  </Button>
                </div>
              </div>
            </div>
          )}
          {vendor.admins && vendor.admins.length > 0 ? (
            <div className="space-y-4">
              {vendor.admins.map((admin) => (
                <div key={admin.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <Text className="font-medium">{admin.first_name || admin.last_name ? `${admin.first_name || ""} ${admin.last_name || ""}`.trim() : "Unnamed Admin"}</Text>
                      <Text>{admin.email}</Text>
                      <Text className="text-sm text-gray-500">Added: {new Date(admin.created_at).toLocaleDateString()}</Text>
                    </div>
                    <Button variant="danger" size="small" onClick={() => handleDeleteAdmin(admin.id)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center border rounded-lg bg-gray-50">
              <Text className="text-gray-500">No admins assigned to this creator</Text>
            </div>
          )}
        </div>
      )}

      {/* ── METADATA TAB ─────────────────────────────────────────────────── */}
      {activeTab === "metadata" && (
        <div className="p-6 mb-6 bg-white border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <Heading level="h2">Metadata</Heading>
            <Button variant="secondary" size="small" onClick={addMetadataItem}>Add Field</Button>
          </div>
          <Text className="mb-4 text-gray-600">Custom key-value pairs for additional information about this creator.</Text>
          <div className="space-y-4">
            {metadataItems.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <Label htmlFor={`meta-key-${index}`} className="block mb-1">Key</Label>
                  <Input id={`meta-key-${index}`} type="text" value={item.key} onChange={(e) => handleMetadataChange(index, "key", e.target.value)} placeholder="Enter metadata key" />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`meta-value-${index}`} className="block mb-1">Value</Label>
                  <Input id={`meta-value-${index}`} type="text" value={item.value} onChange={(e) => handleMetadataChange(index, "value", e.target.value)} placeholder="Enter metadata value" />
                </div>
                <div className="pt-6">
                  <Button variant="secondary" size="small" onClick={() => removeMetadataItem(index)} disabled={metadataItems.length === 1 && item.key === "" && item.value === ""}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4 mt-6 border-t">
            <Button variant="primary" onClick={handleSaveVendor} disabled={isSaving}>{isSaving ? "Saving..." : "Save Metadata"}</Button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default CreatorEditPage;