import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Button,
  Input,
  Textarea,
  Label,
  Text,
  Badge
} from "@medusajs/ui";
import { ArrowLeft, PencilSquare } from "@medusajs/icons";

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

function EditSizeChartPage() {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [chart, setChart] = useState("");
  const [sku, setSku] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [manufacturerSku, setManufacturerSku] = useState("");
  const [chartUrl, setChartUrl] = useState("");
  const [originalChart, setOriginalChart] = useState<SizeChart | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
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
      setOriginalChart(data);
      setName(data.name || "");
      setChart(data.chart);
      setSku(data.sku);
      setManufacturer(data.manufacturer || "");
      setManufacturerSku(data.manufacturer_sku || "");
      setChartUrl(data.chart_url || "");
    } catch (error) {
      console.error("Failed to fetch size chart:", error);
      setError("Failed to load size chart");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chart.trim() || !sku.trim()) {
      setError("Chart content and SKU are required");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/admin/size-chart/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim() || null,
          chart: chart,
          sku: sku,
          manufacturer: manufacturer.trim() || null,
          manufacturer_sku: manufacturerSku.trim() || null,
          chart_url: chartUrl.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update size chart");
      }

      //const data = await response.json();
      navigate(`/size-chart/${id}`);
    } catch (error) {
      console.error("Failed to update size chart:", error);
      setError("Failed to update size chart");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/size-chart/${id}`);
  };

  const handleBack = () => {
    navigate("/size-chart");
  };

  const hasChanges = originalChart && (
    name !== (originalChart.name || "") ||
    chart !== originalChart.chart ||
    sku !== originalChart.sku ||
    manufacturer !== (originalChart.manufacturer || "") ||
    manufacturerSku !== (originalChart.manufacturer_sku || "") ||
    chartUrl !== (originalChart.chart_url || "")
  );

  if (fetchLoading) {
    return (
      <Container className="p-6">
        <div className="flex items-center justify-center h-64">
          Loading...
        </div>
      </Container>
    );
  }

  if (error || !originalChart) {
    return (
      <Container className="p-6">
        <div className="text-center">
          <Heading level="h2" className="mb-2">Size Chart Not Found</Heading>
          <Text className="text-ui-fg-subtle mb-4">
            {error || "The size chart you're trying to edit doesn't exist."}
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
            <Heading level="h1">Edit Size Chart</Heading>
            <Text className="text-ui-fg-subtle mt-2">
              ID: {originalChart.id}
            </Text>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              size="small" 
              color={originalChart.deleted_at ? "red" : "green"}
            >
              {originalChart.deleted_at ? "Deleted" : "Active"}
            </Badge>
            
            {hasChanges && (
              <Badge size="small" color="orange">
                Unsaved Changes
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-ui-bg-error-subtle border border-ui-border-error rounded-lg p-3">
                <Text className="text-ui-fg-error">{error}</Text>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter size chart name"
              />
              <Text size="small" className="text-ui-fg-subtle">
                Optional descriptive name for the size chart
              </Text>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="CHART-001"
                required
              />
              <Text size="small" className="text-ui-fg-subtle">
                Unique identifier for this size chart
              </Text>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="Manufacturer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer-sku">Manufacturer SKU</Label>
                <Input
                  id="manufacturer-sku"
                  value={manufacturerSku}
                  onChange={(e) => setManufacturerSku(e.target.value)}
                  placeholder="MFG-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chart-content">Chart Content (HTML) *</Label>
              <Textarea
                id="chart-content"
                value={chart}
                onChange={(e) => setChart(e.target.value)}
                placeholder="<div><h1>Size Chart</h1><table>...</table></div>"
                rows={8}
                className="font-mono text-sm"
                required
              />
              <Text size="small" className="text-ui-fg-subtle">
                Main HTML content for the size chart
              </Text>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chart-url">Chart URL</Label>
              <Textarea
                id="chart-url"
                value={chartUrl}
                onChange={(e) => setChartUrl(e.target.value)}
                placeholder="Optional additional HTML content or URL"
                rows={4}
                className="font-mono text-sm"
              />
              <Text size="small" className="text-ui-fg-subtle">
                Optional additional HTML content
              </Text>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? "Hide Preview" : "Show Preview"}
              </Button>
              
              {hasChanges && (
                <Text size="small" className="text-ui-fg-subtle">
                  You have unsaved changes
                </Text>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-xs text-ui-fg-subtle">
                <div><strong>Created:</strong> {new Date(originalChart.created_at).toLocaleString()}</div>
                <div><strong>Last Updated:</strong> {new Date(originalChart.updated_at).toLocaleString()}</div>
                <div><strong>Associated Products:</strong> {originalChart.products.length}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                type="submit"
                isLoading={loading}
                disabled={!chart.trim() || !sku.trim() || !hasChanges}
              >
                {hasChanges ? "Save Changes" : "No Changes"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        {(previewMode || chart) && (
          <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6">
            <div className="mb-4">
              <Heading level="h3">Preview</Heading>
              <Text className="text-ui-fg-subtle">
                Preview of how your updated size chart will appear
              </Text>
            </div>
            
            <div className="border rounded-lg p-4 bg-ui-bg-subtle min-h-[200px]">
              {chart ? (
                <div
                  dangerouslySetInnerHTML={{ __html: chart }}
                  className="prose prose-sm max-w-none"
                />
              ) : (
                <div className="flex items-center justify-center h-32 text-ui-fg-muted">
                  Enter HTML content to see preview
                </div>
              )}
            </div>
            
            {chartUrl && (
              <div className="mt-4 border rounded-lg p-4 bg-ui-bg-subtle">
                <Text size="small" weight="plus" className="mb-2">Chart URL Content:</Text>
                <div
                  dangerouslySetInnerHTML={{ __html: chartUrl }}
                  className="prose prose-sm max-w-none"
                />
              </div>
            )}
            
            {hasChanges && (
              <div className="mt-4 p-3 bg-ui-bg-highlight rounded-lg">
                <Text size="small" className="text-ui-fg-subtle">
                  <strong>Note:</strong> This preview shows your changes. 
                  Click "Save Changes" to apply them.
                </Text>
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "Edit Size Chart",
  icon: PencilSquare
})

export default EditSizeChartPage