import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Button,
  Input,
  Textarea,
  Label,
  Table,
  Text
} from "@medusajs/ui";
import { ArrowLeft } from "@medusajs/icons";

function NewSizeChartPage() {
  const [name, setName] = useState("");
  const [chart, setChart] = useState("");
  const [sku, setSku] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [manufacturerSku, setManufacturerSku] = useState("");
  const [chartUrl, setChartUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chart.trim() || !sku.trim()) {
      setError("Chart content and SKU are required");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/admin/size-chart", {
        method: "POST",
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
        throw new Error("Failed to create size chart");
      }

      
      navigate("/size-chart");
    } catch (error) {
      console.error("Failed to create size chart:", error);
      setError("Failed to create size chart");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/size-chart");
  };

  return (
    <Container className="p-6">
      <div className="mb-6">
        <Button
          variant="transparent"
          onClick={handleCancel}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft />
          Back to Size Charts
        </Button>
        
        <Heading level="h1">Create New Size Chart</Heading>
        <Text className="text-ui-fg-subtle mt-2">
          Create a new size chart with HTML content that can be associated with products.
        </Text>
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
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                type="submit"
                isLoading={loading}
                disabled={!chart.trim() || !sku.trim()}
              >
                Create Size Chart
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
                Preview of how your size chart will appear
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
          </div>
        )}
      </div>
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "Create Size Chart",
  icon: Table
})

export default NewSizeChartPage