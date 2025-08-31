import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { 
  Container, 
  Heading, 
  Button, 
  Textarea,
  IconButton,
  Text,
  Badge,
  DropdownMenu,
  useToggleState,
  Prompt,
  toast,
  Input
} from "@medusajs/ui";
import { 
  Photo, 
  ArrowLeft, 
  Trash,
  EllipsisHorizontal,
  PencilSquare,
  CheckCircleSolid,
  ExclamationCircle,
  DocumentSeries,
  ArrowDownTray,
  Eye
} from "@medusajs/icons";

interface ArtFileDetail {
  id: string;
  fileId: string;
  mimeType: string;
  filename: string;
  file_type: string;
  file_description?: string;
  vendor_artwork_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function ArtFileDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  
  // Debug all available parameters
  console.log("All URL params:", params);
  console.log("Current pathname:", window.location.pathname);
  
  // Extract parameters - try different naming patterns
  let artworkId: string | undefined;
  let artFileId: string | undefined;
  
  // Method 1: Direct parameter extraction
  artworkId = params.id || params.artworkId;
  artFileId = params.artfilesid || params.artfileid || params.fileid || params.mediaId;
  
  // Method 2: If parameters are not found, try parsing from URL
  if (!artworkId || !artFileId) {
    const pathParts = window.location.pathname.split('/');
    console.log("URL parts:", pathParts);
    
    // Find artwork and artfiles in the path
    const artworkIndex = pathParts.findIndex(part => part === 'artwork');
    const artfilesIndex = pathParts.findIndex(part => part === 'artfiles');
    
    if (artworkIndex !== -1 && artworkIndex + 1 < pathParts.length) {
      artworkId = pathParts[artworkIndex + 1];
    }
    
    if (artfilesIndex !== -1 && artfilesIndex + 1 < pathParts.length) {
      artFileId = pathParts[artfilesIndex + 1];
    }
  }
  
  console.log("Final extracted artworkId:", artworkId);
  console.log("Final extracted artFileId:", artFileId);
  
  const [artFile, setArtFile] = useState<ArtFileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");

  const {
    state: showDeletePrompt,
    open: openDeletePrompt,
    close: closeDeletePrompt,
  } = useToggleState();

  useEffect(() => {
    console.log("useEffect triggered - artworkId:", artworkId, "artFileId:", artFileId);
    if (artworkId && artFileId) {
      console.log("Making API call with:", { artworkId, artFileId });
      fetchArtFile(artworkId, artFileId);
    } else {
      console.log("Missing parameters - artworkId or artFileId is undefined");
      setLoading(false);
    }
  }, [artworkId, artFileId]);

  const fetchArtFile = async (artworkId: string, artFileId: string) => {
    const apiUrl = `/admin/artwork/${artworkId}/artfiles/${artFileId}`;
    console.log("Fetching art file from:", apiUrl);
    
    try {
      const response = await fetch(apiUrl);
      console.log("API Response status:", response.status);
      
      if (!response.ok) {
        console.error("API Error:", response.status, response.statusText);
        throw new Error(`Art file not found (${response.status})`);
      }
      
      const data: ArtFileDetail = await response.json();
      console.log("Art file data received:", data);
      
      setArtFile(data);
      setDescription(data.file_description || "");
      setOriginalDescription(data.file_description || "");
    } catch (error) {
      console.error("Failed to fetch art file:", error);
      toast.error(`Failed to load art file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      navigate(`/artwork/${artworkId}/edit`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDescription = async () => {
    if (!artFile || !artworkId) return;

    setSaving(true);
    try {
      const response = await fetch(`/admin/artwork/${artworkId}/artfiles/${artFile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_description: description
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update description');
      }

      setOriginalDescription(description);
      setIsEditing(false);
      toast.success("Description updated successfully");
      
      // Refresh the data
      await fetchArtFile(artworkId, artFile.id);
    } catch (error) {
      console.error("Failed to update description:", error);
      toast.error("Failed to update description");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setDescription(originalDescription);
    setIsEditing(false);
  };

  const handleDeleteFile = async () => {
    if (!artFile) return;
    
    try {
      await fetch(`/admin/artwork/media/${artFile.id}`, {
        method: "DELETE",
      });
      
      toast.success("Art file deleted successfully");
      navigate(`/artwork/${artworkId}/edit`);
    } catch (error) {
      console.error("Failed to delete art file:", error);
      toast.error("Failed to delete art file");
    } finally {
      closeDeletePrompt();
    }
  };

  const handleDownload = () => {
    if (!artFile) return;
    const link = document.createElement('a');
    link.href = `/static/${artFile.fileId}`;
    link.download = artFile.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyFileId = async () => {
    if (!artFile) return;
    try {
      await navigator.clipboard.writeText(artFile.fileId);
      toast.success("File ID copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy file ID");
    }
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Photo className="w-6 h-6 text-ui-fg-interactive" />;
    return <DocumentSeries className="w-6 h-6 text-ui-fg-muted" />;
  };

  const getFileSize = (fileId: string) => {
    // This would typically come from your API, but for now we'll show a placeholder
    return "Unknown size";
  };

  const formatFileType = (mimeType: string) => {
    const parts = mimeType.split('/');
    return parts[1]?.toUpperCase() || mimeType.toUpperCase();
  };

  if (loading) {
    return (
      <Container className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ui-fg-interactive mx-auto mb-4"></div>
            <Text className="text-ui-fg-subtle">Loading art file...</Text>
            <Text size="small" className="text-ui-fg-muted mt-2">
              Artwork ID: {artworkId || 'Missing'}
            </Text>
            <Text size="small" className="text-ui-fg-muted">
              Art File ID: {artFileId || 'Missing'}
            </Text>
          </div>
        </div>
      </Container>
    );
  }

  if (!artworkId || !artFileId) {
    return (
      <Container className="p-6">
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="bg-ui-bg-subtle rounded-full p-6 mb-6">
            <ExclamationCircle className="w-16 h-16 text-ui-fg-muted" />
          </div>
          <Heading level="h2" className="mb-2">Invalid URL</Heading>
          <Text className="text-ui-fg-subtle mb-6">
            Missing required parameters in the URL.
          </Text>
          <Text size="small" className="text-ui-fg-muted mb-6">
            Expected: /artwork/[artworkId]/artfiles/[artfileId]<br/>
            Current URL: {window.location.pathname}
          </Text>
          <Button onClick={() => navigate("/artwork")}>
            Back to Artwork List
          </Button>
        </div>
      </Container>
    );
  }

  if (!artFile) {
    return (
      <Container className="p-6">
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="bg-ui-bg-subtle rounded-full p-6 mb-6">
            <ExclamationCircle className="w-16 h-16 text-ui-fg-muted" />
          </div>
          <Heading level="h2" className="mb-2">Art file not found</Heading>
          <Text className="text-ui-fg-subtle mb-6">The art file you're looking for doesn't exist or has been removed.</Text>
          <Button onClick={() => navigate(`/artwork/${artworkId}/edit`)}>
            Back to Artwork
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="p-6 max-w-6xl">
      {/* Header */}
      <div className="bg-ui-bg-base border-b border-ui-border-base pb-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <IconButton 
              onClick={() => navigate(`/artwork/${artworkId}/edit`)}
              variant="transparent"
              className="hover:bg-ui-bg-subtle"
            >
              <ArrowLeft />
            </IconButton>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Heading level="h1">Art File Details</Heading>
                <Badge size="small" color={artFile.deleted_at ? "red" : "green"}>
                  {artFile.deleted_at ? "Deleted" : "Active"}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-ui-fg-subtle">
                <Text size="small">{artFile.filename}</Text>
                <span className="w-1 h-1 bg-ui-fg-muted rounded-full"></span>
                <Text size="small">{formatFileType(artFile.mimeType)}</Text>
                <span className="w-1 h-1 bg-ui-fg-muted rounded-full"></span>
                <Text size="small">
                  Created {new Date(artFile.created_at).toLocaleDateString()}
                </Text>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <IconButton variant="primary">
                  <EllipsisHorizontal />
                </IconButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item onClick={() => window.open(`/static/${artFile.fileId}`, '_blank')}>
                  <Eye className="mr-2 w-4 h-4" />
                  View Full Size
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={handleDownload}>
                  <ArrowDownTray className="mr-2 w-4 h-4" />
                  Download File
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={handleCopyFileId}>
                  <DocumentSeries className="mr-2 w-4 h-4" />
                  Copy File ID
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item 
                  onClick={openDeletePrompt}
                  className="text-ui-fg-error"
                >
                  <Trash className="mr-2 w-4 h-4" />
                  Delete File
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
            <Button
              onClick={() => navigate(`/artwork/${artworkId}/edit`)}
              variant="secondary"
            >
              Back to Artwork
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - File Preview */}
        <div className="lg:col-span-2 space-y-8">
          {/* File Preview */}
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              {getFileTypeIcon(artFile.mimeType)}
              <Heading level="h2">File Preview</Heading>
            </div>
            
            <div className="bg-ui-bg-subtle/30 rounded-xl overflow-hidden">
              {artFile.mimeType.startsWith('image/') ? (
                <div className="relative">
                  <img
                    src={`/static/${artFile.fileId}`}
                    alt={artFile.filename}
                    className="w-full h-auto max-h-96 object-contain mx-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="absolute inset-0 bg-ui-bg-subtle hidden items-center justify-center">
                    <div className="text-center">
                      <Photo className="w-16 h-16 text-ui-fg-muted mx-auto mb-4" />
                      <Text className="text-ui-fg-muted">Failed to load image</Text>
                      <Button 
                        variant="secondary" 
                        size="small"
                        className="mt-4"
                        onClick={() => window.open(`/static/${artFile.fileId}`, '_blank')}
                      >
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center">
                    {getFileTypeIcon(artFile.mimeType)}
                    <Heading level="h3" className="mt-4 mb-2">
                      {formatFileType(artFile.mimeType)} File
                    </Heading>
                    <Text className="text-ui-fg-subtle mb-6">
                      Preview not available for this file type
                    </Text>
                    <div className="flex gap-3 justify-center">
                      <Button 
                        variant="secondary"
                        onClick={() => window.open(`/static/${artFile.fileId}`, '_blank')}
                      >
                        <Eye className="mr-2 w-4 h-4" />
                        Open File
                      </Button>
                      <Button 
                        variant="secondary"
                        onClick={handleDownload}
                      >
                        <ArrowDownTray className="mr-2 w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* File Description */}
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <PencilSquare className="w-5 h-5 text-ui-fg-interactive" />
                <Heading level="h2">File Description</Heading>
              </div>
              {!isEditing && (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setIsEditing(true)}
                >
                  <PencilSquare className="mr-2 w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description for this file..."
                  rows={4}
                  className="text-base"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveDescription}
                    disabled={saving}
                    isLoading={saving}
                    size="small"
                  >
                    Save Description
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    size="small"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {artFile.file_description ? (
                  <div className="p-4 bg-ui-bg-subtle/50 rounded-lg border border-ui-border-base">
                    <Text>{artFile.file_description}</Text>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-ui-bg-subtle rounded-full p-3 w-12 h-12 mx-auto mb-3">
                      <PencilSquare className="w-6 h-6 text-ui-fg-muted mx-auto" />
                    </div>
                    <Text className="text-ui-fg-subtle mb-4">No description added yet</Text>
                    <Button 
                      variant="secondary" 
                      size="small"
                      onClick={() => setIsEditing(true)}
                    >
                      Add Description
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - File Information */}
        <div className="space-y-6">
          {/* File Details */}
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-6 shadow-sm">
            <Heading level="h3" className="mb-4">File Information</Heading>
            <div className="space-y-4">
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-1">Filename</Text>
                <Text size="small" weight="plus" className="break-all">
                  {artFile.filename}
                </Text>
              </div>
              
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-1">File ID</Text>
                <div className="flex items-center justify-between">
                  <Text size="small" weight="plus" className="break-all mr-2">
                    {artFile.fileId.substring(0, 20)}...
                  </Text>
                  <IconButton 
                    size="small" 
                    variant="transparent"
                    onClick={handleCopyFileId}
                    title="Copy full file ID"
                  >
                    <DocumentSeries className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>

              <div>
                <Text size="small" className="text-ui-fg-subtle mb-1">File Type</Text>
                <div className="flex items-center gap-2">
                  <Badge size="small" color="blue">
                    {formatFileType(artFile.mimeType)}
                  </Badge>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {artFile.mimeType}
                  </Text>
                </div>
              </div>

              <div>
                <Text size="small" className="text-ui-fg-subtle mb-1">Size</Text>
                <Text size="small" weight="plus">
                  {getFileSize(artFile.fileId)}
                </Text>
              </div>

              <div>
                <Text size="small" className="text-ui-fg-subtle mb-1">Status</Text>
                <Badge size="small" color={artFile.deleted_at ? "red" : "green"}>
                  {artFile.deleted_at ? "Deleted" : "Active"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-6 shadow-sm">
            <Heading level="h3" className="mb-4">Timeline</Heading>
            <div className="space-y-4">
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-1">Created</Text>
                <Text size="small" weight="plus">
                  {new Date(artFile.created_at).toLocaleDateString()}
                </Text>
                <Text size="xsmall" className="text-ui-fg-muted">
                  {new Date(artFile.created_at).toLocaleTimeString()}
                </Text>
              </div>
              
              <div>
                <Text size="small" className="text-ui-fg-subtle mb-1">Last Updated</Text>
                <Text size="small" weight="plus">
                  {new Date(artFile.updated_at).toLocaleDateString()}
                </Text>
                <Text size="xsmall" className="text-ui-fg-muted">
                  {new Date(artFile.updated_at).toLocaleTimeString()}
                </Text>
              </div>

              {artFile.deleted_at && (
                <div>
                  <Text size="small" className="text-ui-fg-subtle mb-1">Deleted</Text>
                  <Text size="small" weight="plus" className="text-ui-fg-error">
                    {new Date(artFile.deleted_at).toLocaleDateString()}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {new Date(artFile.deleted_at).toLocaleTimeString()}
                  </Text>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-6 shadow-sm">
            <Heading level="h3" className="mb-4">Actions</Heading>
            <div className="space-y-3">
              <Button 
                onClick={() => window.open(`/static/${artFile.fileId}`, '_blank')}
                variant="secondary" 
                className="w-full"
              >
                <Eye className="mr-2 w-4 h-4" />
                View Full Size
              </Button>
              <Button 
                onClick={handleDownload}
                variant="secondary" 
                className="w-full"
              >
                <ArrowDownTray className="mr-2 w-4 h-4" />
                Download File
              </Button>
              <Button 
                onClick={() => navigate(`/artwork/${artworkId}`)}
                variant="secondary" 
                className="w-full"
              >
                View Artwork
              </Button>
              <Button 
                onClick={openDeletePrompt}
                variant="secondary" 
                className="w-full text-ui-fg-error hover:bg-red-50"
              >
                <Trash className="mr-2 w-4 h-4" />
                Delete File
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Prompt open={showDeletePrompt} onOpenChange={closeDeletePrompt}>
        <Prompt.Content>
          <Prompt.Header>
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-full p-2">
                <Trash className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <Prompt.Title>Delete Art File</Prompt.Title>
                <Prompt.Description className="mt-1">
                  Are you sure you want to delete "{artFile.filename}"? This action cannot be undone and the file will be permanently removed.
                </Prompt.Description>
              </div>
            </div>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel>Cancel</Prompt.Cancel>
            <Prompt.Action onClick={handleDeleteFile} className="bg-red-600">
              Delete File
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "Art File Details",
  icon: Photo
});

export default ArtFileDetailPage;