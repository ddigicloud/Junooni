import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { 
  Container, 
  Heading, 
  Button, 
  Table,
  Badge,
  DropdownMenu,
  useToggleState,
  Prompt
} from "@medusajs/ui";
import { PencilSquare, Trash, Plus, EllipsisHorizontal } from "@medusajs/icons";

interface SizeChart {
  id: string;
  chart_url: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  products: any[];
}

interface SizeChartResponse {
  sizeChart: SizeChart[];
}

function SizeChartListPage() {
  const [sizeCharts, setSizeCharts] = useState<SizeChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const {
    state: showDeletePrompt,
    open: openDeletePrompt,
    close: closeDeletePrompt,
  } = useToggleState();

  useEffect(() => {
    fetchSizeCharts();
  }, []);

  const fetchSizeCharts = async () => {
    try {
      const response = await fetch("/admin/size-chart");
      const data: SizeChartResponse = await response.json();
      setSizeCharts(data.sizeChart || []);
    } catch (error) {
      console.error("Failed to fetch size charts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await fetch(`/admin/size-chart/${deleteId}`, {
        method: "DELETE",
      });
      setSizeCharts(prev => prev.filter(chart => chart.id !== deleteId));
      closeDeletePrompt();
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete size chart:", error);
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    openDeletePrompt();
  };

  const getPreviewText = (htmlContent: string) => {
    const div = document.createElement("div");
    div.innerHTML = htmlContent;
    return div.textContent || div.innerText || "";
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

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">Size Charts</Heading>
        <Button
          onClick={() => navigate("/size-chart/new")}
          className="flex items-center gap-2"
        >
          <Plus />
          Create Size Chart
        </Button>
      </div>

      {sizeCharts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-ui-fg-subtle mb-4">No size charts created yet</p>
          <Button onClick={() => navigate("/size-chart/new")}>
            Create your first size chart
          </Button>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Content Preview</Table.HeaderCell>
              <Table.HeaderCell>Products</Table.HeaderCell>
              <Table.HeaderCell>Created</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell className="w-8"></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sizeCharts.map((chart) => (
              <Table.Row key={chart.id}>
                <Table.Cell className="font-mono text-xs">
                  {chart.id.substring(0, 8)}...
                </Table.Cell>
                <Table.Cell>
                  <div className="max-w-xs truncate">
                    {getPreviewText(chart.chart_url)}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge size="2xsmall" color="grey">
                    {chart.products.length} products
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {new Date(chart.created_at).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  <Badge 
                    size="2xsmall" 
                    color={chart.deleted_at ? "red" : "green"}
                  >
                    {chart.deleted_at ? "Deleted" : "Active"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <DropdownMenu>
                    <DropdownMenu.Trigger asChild>
                      <Button variant="transparent" size="small">
                        <EllipsisHorizontal />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item
                        onClick={() => navigate(`/size-chart/${chart.id}`)}
                      >
                        View
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onClick={() => navigate(`/size-chart/edit/${chart.id}`)}
                      >
                        <PencilSquare className="mr-2" />
                        Edit
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item
                        onClick={() => openDeleteDialog(chart.id)}
                        className="text-ui-fg-error"
                      >
                        <Trash className="mr-2" />
                        Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <Prompt open={showDeletePrompt} onOpenChange={closeDeletePrompt}>
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Delete Size Chart</Prompt.Title>
            <Prompt.Description>
              Are you sure you want to delete this size chart? This action cannot be undone.
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel>Cancel</Prompt.Cancel>
            <Prompt.Action onClick={handleDelete}>Delete</Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "Size Charts",
  icon: EllipsisHorizontal
})

export default SizeChartListPage