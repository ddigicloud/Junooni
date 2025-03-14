import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Heading, Label, Button, Input } from "@medusajs/ui";

interface VendorDetail {
  vendor_id: string;
  vendor_name: string;
  vendor_handle: string;
  
  admins: Array<{
    email: string;
    first_name?: string;
    last_name?: string;
  }>;
}

const VendorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVendorDetails();
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      const response = await fetch(`/vendors/${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vendor details");
      }

      const data = await response.json();
      console.log('Fetched vendor data:', data);  // Log the data to debug
      setVendor(data.vendor);
    } catch (error) {
      console.error("Error fetching vendor details:", error);
    } finally {
      setIsLoading(false);
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
        Vendor Details
      </Heading>

      <div className="space-y-6">
        <div>
          <Label>Vendor ID</Label>
          <Input type="text" value={vendor?.vendor_id || "N/A"} disabled />
        </div>

        <div>
          <Label>Vendor Name</Label>
          <Input type="text" value={vendor?.vendor_name || "N/A"} disabled />
        </div>

        <div>
          <Label>Store Name (Handle)</Label>
          <Input type="text" value={vendor?.vendor_handle || "N/A"} disabled />
        </div>

       

        <div>
          <Label>Admins</Label>
          {vendor?.admins.length > 0 ? (
            <ul>
              {vendor.admins.map((admin, index) => (
                <li key={index}>
                  <strong>{admin.first_name} {admin.last_name}</strong>
                  <p>{admin.email}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No admins assigned</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/vendors")}
          >
            Back to Vendors
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default VendorDetailPage;
