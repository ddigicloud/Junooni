import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Heading, Label, Button, Input, Text } from "@medusajs/ui";

interface VendorDetail {
  vendor_id: string;
  vendor_name: string;
  vendor_handle: string;
  logo_url?: string;
  
  admins: Array<{
    id?: string;
    email: string;
    first_name?: string;
    last_name?: string;
  }>;
}

const EditVendorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  
  // Admin form state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [admins, setAdmins] = useState<VendorDetail["admins"]>([]);
  
  // Logo state
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  useEffect(() => {
    fetchVendorDetails();
  }, [id]);

  // Populate form with vendor data once loaded
  useEffect(() => {
    if (vendor) {
      setName(vendor.vendor_name || "");
      setHandle(vendor.vendor_handle || "");
      setAdmins(vendor.admins || []);
      setExistingLogoUrl(vendor.logo_url || null);
    }
  }, [vendor]);

  const fetchVendorDetails = async () => {
    try {
      const response = await fetch(`/vendors/${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vendor details");
      }

      const data = await response.json();
      console.log('Fetched vendor data:', data);
      setVendor(data.vendor);
    } catch (error) {
      console.error("Error fetching vendor details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setLogo(selectedFile);
      
      // Create a preview URL for the image
      const previewURL = URL.createObjectURL(selectedFile);
      setLogoPreview(previewURL);
      setExistingLogoUrl(null); // Clear existing logo since we're replacing it
    }
  };

  // Trigger file input click
  const handleLogoButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Clear selected logo
  const handleClearLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    setExistingLogoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Add a new admin to the list
  const handleAddAdmin = () => {
    if (adminEmail) {
      const newAdmin = {
        email: adminEmail,
        first_name: adminFirstName,
        last_name: adminLastName,
      };
      
      setAdmins([...admins, newAdmin]);
      setAdminEmail("");
      setAdminFirstName("");
      setAdminLastName("");
      setShowAddAdmin(false);
    }
  };

  // Remove an admin from the list
  const handleRemoveAdmin = (index: number) => {
    const updatedAdmins = [...admins];
    updatedAdmins.splice(index, 1);
    setAdmins(updatedAdmins);
  };

  // Save all vendor changes
  const handleSave = async () => {
    if (!vendor) return;
    
    setIsSaving(true);
    
    try {
      // First, upload logo if a new one was selected
      let logoUrl = existingLogoUrl;
      
      if (logo) {
        const formData = new FormData();
        formData.append("files", logo);
        
        const uploadResponse = await fetch("http://localhost:9000/vendors/uploads", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          if (uploadResult.result && uploadResult.result.uploads && uploadResult.result.uploads.length > 0) {
            logoUrl = uploadResult.result.uploads[0].url;
          } else {
            console.error("Logo upload successful but unexpected response format:", uploadResult);
          }
        } else {
          console.error("Error uploading logo:", await uploadResponse.text());
        }
      }
      
      // Then update the vendor with all changes
      const updateResponse = await fetch(`http://localhost:9000/vendors/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          handle: handle,
          admins: admins,
          ...(logoUrl && { logo: logoUrl }),
        }),
      });
      
      if (updateResponse.ok) {
        console.log("Vendor updated successfully");
        navigate("/vendors");
      } else {
        const error = await updateResponse.json();
        console.error("Error updating vendor:", error);
      }
    } catch (error) {
      console.error("Error during vendor update:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Container>Loading vendor details...</Container>;
  }

  if (!vendor) {
    return <Container>Vendor not found</Container>;
  }

  return (
    <Container>
      <Heading level="h1" className="mb-6">
        Edit Vendor
      </Heading>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Label htmlFor="vendorId">Vendor ID</Label>
          <Input id="vendorId" type="text" value={vendor.vendor_id} disabled />
        </div>

        <div>
          <Label htmlFor="name">Vendor Name</Label>
          <Input 
            id="name" 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="handle">Store Handle</Label>
          <Input 
            id="handle" 
            type="text" 
            value={handle} 
            onChange={(e) => setHandle(e.target.value)}
          />
          <Text className="mt-1 text-sm text-gray-500">
            This is used in URLs and should be URL-friendly (lowercase, no spaces)
          </Text>
        </div>

        {/* Logo upload section */}
        <div>
          <Label>Vendor Logo</Label>
          <div className="mt-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoChange}
              accept="image/*"
              className="hidden"
            />
            
            <div className="flex flex-col items-center">
              {logoPreview ? (
                <div className="relative mb-3">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="object-contain w-32 h-32 border rounded"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-0 right-0 p-1"
                    onClick={handleClearLogo}
                  >
                    ✕
                  </Button>
                </div>
              ) : existingLogoUrl ? (
                <div className="relative mb-3">
                  <img 
                    src={existingLogoUrl} 
                    alt="Current logo" 
                    className="object-contain w-32 h-32 border rounded"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-0 right-0 p-1"
                    onClick={handleClearLogo}
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-32 h-32 mb-3 border-2 border-dashed rounded-md">
                  <Text className="text-gray-400">No logo</Text>
                </div>
              )}
              
              <Button 
                variant="secondary" 
                type="button"
                onClick={handleLogoButtonClick}
              >
                {logoPreview || existingLogoUrl ? "Change Logo" : "Upload Logo"}
              </Button>
            </div>
          </div>
        </div>

        {/* Admins section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Admins</Label>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAddAdmin(true)}
              disabled={showAddAdmin}
            >
              Add Admin
            </Button>
          </div>
          
          {showAddAdmin && (
            <div className="p-4 mb-4 border rounded-md bg-gray-50">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="adminEmail">Email</Label>
                  <Input 
                    id="adminEmail" 
                    type="email" 
                    value={adminEmail} 
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="adminFirstName">First Name</Label>
                  <Input 
                    id="adminFirstName" 
                    type="text" 
                    value={adminFirstName} 
                    onChange={(e) => setAdminFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="adminLastName">Last Name</Label>
                  <Input 
                    id="adminLastName" 
                    type="text" 
                    value={adminLastName} 
                    onChange={(e) => setAdminLastName(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setShowAddAdmin(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={handleAddAdmin}
                    disabled={!adminEmail}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {admins.length > 0 ? (
            <div className="space-y-2">
              {admins.map((admin, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">
                      {admin.first_name} {admin.last_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {admin.email}
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleRemoveAdmin(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 border rounded">
              No admins assigned
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/vendors")}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default EditVendorPage;