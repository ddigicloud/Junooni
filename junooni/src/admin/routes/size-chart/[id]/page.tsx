import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Button,
  Text,
  Badge,
 
} from "@medusajs/ui";
import { ArrowLeft, PencilSquare, Trash, EyeMini } from "@medusajs/icons";

interface Product {
  id: string;
  title: string;
  handle: string;
  status: string;
}

interface SizeChart {
  id: string;
  chart_url: string | null;
  name: string | null;
  chart: string;
  sku: string;
  manufacturer: string | null;
  manufacturer_sku: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  products: Product[];
}

function ViewSizeChartPage() {
  const { id } = useParams<{ id: string }>();
  const [sizeChart, setSizeChart] = useState<SizeChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchSizeChart();
    }
  }, [id]);

  const fetchSizeChart = async () => {
    try {
      const response = await fetch(`/admin/size-chart/${id}`);
      
      if (!response.ok) {
        throw new Error("Size chart not found");
      }
      
      const data: SizeChart = await response.json();
      setSizeChart(data);
    } catch (error) {
      console.error("Failed to fetch size chart:", error);
      setError("Failed to load size chart");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/size-chart/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!sizeChart || !confirm("Are you sure you want to delete this size chart?")) {
      return;
    }

    try {
      await fetch(`/admin/size-chart/${id}`, {
        method: "DELETE",
      });
      navigate("/size-chart");
    } catch (error) {
      console.error("Failed to delete size chart:", error);
    }
  };

  const handleBack = () => {
    navigate("/size-chart");
  };

  if (loading) {
    return (
      <Container className="p-6">
        <div className="flex items-center justify-center h-64">
          Loading...
        </div>
      </Container>
    );
  }

  if (error || !sizeChart) {
    return (
      <Container className="p-6">
        <div className="text-center">
          <Heading level="h2" className="mb-2">Size Chart Not Found</Heading>
          <Text className="text-ui-fg-subtle mb-4">
            {error || "The size chart you're looking for doesn't exist."}
          </Text>
          <Button onClick={handleBack}>Back to Size Charts</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="p-6">
      <div className="mb-6">
        <Button
          variant="transparent"
          onClick={handleBack}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft />
          Back to Size Charts
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h1">Size Chart Details</Heading>
            <Text className="text-ui-fg-subtle mt-2">
              ID: {sizeChart.id}
            </Text>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              size="small" 
              color={sizeChart.deleted_at ? "red" : "green"}
            >
              {sizeChart.deleted_at ? "Deleted" : "Active"}
            </Badge>
            
            <Button
              variant="secondary"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <PencilSquare />
              Edit
            </Button>
            
            <Button
              variant="danger"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6">
            <Heading level="h3" className="mb-4">Chart Content</Heading>
            <div className="border rounded-lg p-4 bg-ui-bg-subtle">
              <div
                dangerouslySetInnerHTML={{ __html: sizeChart.chart }}
                className="prose prose-sm max-w-none"
              />
            </div>
          </div>

          {sizeChart.chart_url && (
            <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6">
              <Heading level="h3" className="mb-4">Additional Chart Content</Heading>
              <div className="border rounded-lg p-4 bg-ui-bg-subtle">
                <div
                  dangerouslySetInnerHTML={{ __html: sizeChart.chart_url }}
                  className="prose prose-sm max-w-none"
                />
              </div>
            </div>
          )}

          <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6">
            <Heading level="h3" className="mb-4">Raw HTML Content</Heading>
            <pre className="bg-ui-code-bg-base p-4 rounded-lg overflow-x-auto text-sm font-mono border">
              <code>{sizeChart.chart}</code>
            </pre>
            {sizeChart.chart_url && (
              <>
                <Text className="mt-4 mb-2" weight="plus">Chart URL Content:</Text>
                <pre className="bg-ui-code-bg-base p-4 rounded-lg overflow-x-auto text-sm font-mono border">
                  <code>{sizeChart.chart_url}</code>
                </pre>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6">
            <Heading level="h3" className="mb-4">Information</Heading>
            <div className="space-y-4">
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">
                  Name
                </Text>
                <Text>
                  {sizeChart.name || "Untitled"}
                </Text>
              </div>
              
              <hr className="border-ui-border-base" />
              
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">
                  SKU
                </Text>
                <Text>
                  <code className="text-xs bg-ui-bg-subtle px-1 py-0.5 rounded">
                    {sizeChart.sku}
                  </code>
                </Text>
              </div>
              
              <hr className="border-ui-border-base" />
              
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">
                  Manufacturer
                </Text>
                <Text>
                  {sizeChart.manufacturer || "-"}
                </Text>
              </div>
              
              <hr className="border-ui-border-base" />
              
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">
                  Manufacturer SKU
                </Text>
                <Text>
                  {sizeChart.manufacturer_sku || "-"}
                </Text>
              </div>
              
              <hr className="border-ui-border-base" />
              
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">
                  Created
                </Text>
                <Text>
                  {new Date(sizeChart.created_at).toLocaleString()}
                </Text>
              </div>
              
              <hr className="border-ui-border-base" />
              
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">
                  Last Updated
                </Text>
                <Text>
                  {new Date(sizeChart.updated_at).toLocaleString()}
                </Text>
              </div>
              
              {sizeChart.deleted_at && (
                <>
                  <hr className="border-ui-border-base" />
                  <div>
                    <Text size="small" weight="plus" className="text-ui-fg-subtle">
                      Deleted
                    </Text>
                    <Text>
                      {new Date(sizeChart.deleted_at).toLocaleString()}
                    </Text>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6">
            <Heading level="h3" className="mb-4">
              Associated Products ({sizeChart.products.length})
            </Heading>
            
            {sizeChart.products.length === 0 ? (
              <Text className="text-ui-fg-subtle">
                No products are currently using this size chart.
              </Text>
            ) : (
              <div className="space-y-3">
                {sizeChart.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <Text weight="plus">{product.title}</Text>
                      <Text size="small" className="text-ui-fg-subtle">
                        /{product.handle}
                      </Text>
                    </div>
                    <Badge 
                      size="2xsmall" 
                      color={product.status === "published" ? "green" : "grey"}
                    >
                      {product.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "View Size Chart",
  icon: EyeMini
})

export default ViewSizeChartPage