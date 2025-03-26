// File: src/admin/routes/vendors/[id]/products/page.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Heading, Text, Button, Table, Badge } from "@medusajs/ui";

interface Product {
  id: string;
  title: string;
  thumbnail: string | null;
  handle: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const VendorProductsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch both vendor details and products
  useEffect(() => {
    if (id) {
      fetchVendorDetails();
      fetchVendorProducts();
    }
  }, [id]);

  // Fetch vendor details using the same approach as CreatorDetailPage
  const fetchVendorDetails = async () => {
    try {
      const response = await fetch(`/vendors?vendor_id=${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch creator details: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.vendor) {
        setVendor(data.vendor);
      } else {
        setError("Creator data not found in the response");
      }
    } catch (error) {
      console.error("Error fetching creator details:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    }
  };

  // Fetch vendor products
  const fetchVendorProducts = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/vendors/${id}/products`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data.products || []);
      // Note: Empty products array is not an error, it's just a state
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Format date (same helper as in CreatorDetailPage)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center h-40">
          <Text>Loading products...</Text>
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
            onClick={() => navigate(`/vendors/${id}`)}
          >
            Back to Creator
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Header with title and navigation */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h1" className="text-2xl">
            {vendor?.name || "Creator"} Products
          </Heading>
          <Text className="text-gray-500">
            Manage products for this creator
          </Text>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/vendors/${id}`)}
          >
            Back to Creator
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/products/new?vendor_id=${id}`)}
          >
            Add New Product
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="p-6 mb-6 bg-white border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <Heading level="h2" className="text-xl">Products</Heading>
          <Text className="text-gray-500">
            Total: {products.length} product{products.length !== 1 ? 's' : ''}
          </Text>
        </div>

        {products.length === 0 ? (
          <div className="p-6 text-center border rounded-lg bg-gray-50">
            <Text className="mb-4 text-gray-500">No products have been created by this creator yet</Text>
            <div className="flex justify-center gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate(`/vendors/${id}`)}
              >
                Back to Creator
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate(`/products/new?vendor_id=${id}`)}
              >
                Add First Product
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Image</Table.HeaderCell>
                <Table.HeaderCell>Product</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Created</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {products.map((product) => (
                <Table.Row key={product.id}>
                  <Table.Cell>
                    <div className="w-12 h-12 overflow-hidden bg-gray-100 rounded">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gray-100">
                          No img
                        </div>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <Text className="font-medium">{product.title}</Text>
                      <Text className="text-xs text-gray-500">{product.id}</Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge 
                      className={product.status === 'published' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                    >
                      {product.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {formatDate(product.created_at)}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        View Product
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => navigate(`/products/${product.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* Additional section for product stats - matching the layout pattern of the main Creator page */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-6 bg-white border rounded-lg">
          <Heading level="h3" className="mb-3 text-lg">Product Statistics</Heading>
          <div className="space-y-4">
            <div>
              <Text className="text-sm text-gray-500">Total Products</Text>
              <Heading level="h3" className="text-2xl">{products.length}</Heading>
            </div>
            <div>
              <Text className="text-sm text-gray-500">Published</Text>
              <Heading level="h3" className="text-2xl">
                {products.filter(p => p.status === 'published').length}
              </Heading>
            </div>
            <div>
              <Text className="text-sm text-gray-500">Drafts</Text>
              <Heading level="h3" className="text-2xl">
                {products.filter(p => p.status !== 'published').length}
              </Heading>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default VendorProductsPage;