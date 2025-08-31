import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { 
  Container, 
  Heading, 
  Button, 
  Input,
  Textarea,
  IconButton,
  Text,
  Badge,
  DropdownMenu,
  useToggleState,
  Prompt,
  toast
} from "@medusajs/ui";
import { 
  Photo, 
  ArrowLeft, 
  Trash,
  EllipsisHorizontal,
  PencilSquare,
  CheckCircleSolid,
  Link
} from "@medusajs/icons";

interface ArtworkMedia {
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

interface Product {
  id: string;
  title: string;
  handle: string;
  status: string;
  thumbnail?: string;
  created_at: string;
}

interface VendorArtwork {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  medias: ArtworkMedia[];
  products?: Product[];
}

type ArtworkDetailResponse = VendorArtwork;

interface FormData {
  name: string;
  description: string;
}

function ArtworkEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<VendorArtwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteMediaId, setDeleteMediaId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: ""
  });

  const {
    state: showDeletePrompt,
    open: openDeletePrompt,
    close: closeDeletePrompt,
  } = useToggleState();

  useEffect(() => {
    if (id) {
      fetchArtwork(id);
    }
  }, [id]);

  const fetchArtwork = async (artworkId: string) => {
    try {
      const response = await fetch(`/admin/artwork/${artworkId}`);
      if (!response.ok) {
        throw new Error('Artwork not found');
      }
      const data: ArtworkDetailResponse = await response.json();
      setArtwork(data);
      setFormData({
        name: data.name,
        description: data.description || ""
      });
    } catch (error) {
      console.error("Failed to fetch artwork:", error);
      toast.error("Failed to load artwork");
      navigate("/artwork");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artwork || !formData.name.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`/admin/artwork/${artwork.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update artwork');
      }

      toast.success("Artwork updated successfully");
      navigate(`/artwork/${artwork.id}`);
    } catch (error) {
      console.error("Failed to update artwork:", error);
      toast.error("Failed to update artwork");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !artwork) return;

    setUploading(true);
    try {
      for (let file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('file_description', '');
        formData.append('vendor_artwork_id', artwork.id);

        const response = await fetch(`/admin/artwork/${artwork.id}/media`, {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      await fetchArtwork(artwork.id);
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error("Failed to upload files:", error);
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteMedia = async () => {
    if (!deleteMediaId) return;
    
    try {
      await fetch(`/admin/artwork/media/${deleteMediaId}`, {
        method: "DELETE",
      });
      
      if (artwork) {
        await fetchArtwork(artwork.id);
      }
      toast.success("Media file deleted");
    } catch (error) {
      console.error("Failed to delete media:", error);
      toast.error("Failed to delete media file");
    } finally {
      closeDeletePrompt();
      setDeleteMediaId(null);
    }
  };

  const openDeleteDialog = (mediaId: string) => {
    setDeleteMediaId(mediaId);
    openDeletePrompt();
  };

  const getMediaTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Photo className="w-5 h-5 text-ui-fg-interactive" />;
    return <Photo className="w-5 h-5 text-ui-fg-muted" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { color: "green" as const, text: "Published" },
      draft: { color: "orange" as const, text: "Draft" },
      rejected: { color: "red" as const, text: "Rejected" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: "grey" as const, text: status };
    return <Badge size="2xsmall" color={config.color}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <Container className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ui-fg-interactive mx-auto mb-4"></div>
            <Text className="text-ui-fg-subtle">Loading artwork...</Text>
          </div>
        </div>
      </Container>
    );
  }

  if (!artwork) {
    return (
      <Container className="p-6">
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="bg-ui-bg-subtle rounded-full p-6 mb-6">
            <Photo className="w-16 h-16 text-ui-fg-muted" />
          </div>
          <Heading level="h2" className="mb-2">Artwork not found</Heading>
          <Text className="text-ui-fg-subtle mb-6">The artwork you're looking for doesn't exist or has been removed.</Text>
          <Button onClick={() => navigate("/artwork")}>
            Back to Artwork List
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="p-6 max-w-6xl">
      {/* Enhanced Header with better visual hierarchy */}
      <div className="bg-ui-bg-base border-b border-ui-border-base pb-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <IconButton 
              onClick={() => navigate(`/artwork/${artwork.id}`)}
              variant="transparent"
              className="hover:bg-ui-bg-subtle"
            >
              <ArrowLeft />
            </IconButton>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Heading level="h1">Edit Artwork</Heading>
                <Badge size="small" color={artwork.deleted_at ? "red" : "green"}>
                  {artwork.deleted_at ? "Deleted" : "Active"}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-ui-fg-subtle">
                <Text size="small">{artwork.name}</Text>
                <span className="w-1 h-1 bg-ui-fg-muted rounded-full"></span>
                <Text size="small">{artwork.medias.length} media files</Text>
                <span className="w-1 h-1 bg-ui-fg-muted rounded-full"></span>
                <Text size="small">{artwork.products?.length || 0} linked products</Text>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate(`/artwork/${artwork.id}`)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !formData.name.trim()}
              isLoading={saving}
              className="bg-ui-bg-interactive text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <form onSubmit={handleSubmit}>
            <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <PencilSquare className="w-5 h-5 text-ui-fg-interactive" />
                <Heading level="h2">Basic Information</Heading>
              </div>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold mb-3">
                    Artwork Name *
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter a descriptive name for your artwork"
                    required
                    className="text-base"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold mb-3">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your artwork, its inspiration, techniques used, or any other relevant details..."
                    rows={5}
                    className="text-base resize-none"
                  />
                  <Text size="xsmall" className="text-ui-fg-subtle mt-2">
                    This description will help customers understand and connect with your artwork.
                  </Text>
                </div>
              </div>
            </div>
          </form>

          {/* Media Files Section */}
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-6 shadow-sm" id="media">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Photo className="w-5 h-5 text-ui-fg-interactive" />
                <Heading level="h2">Media Gallery</Heading>
                <Badge size="small" color="blue">{artwork.medias.length} files</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={uploading}
                  isLoading={uploading}
                  size="small"
                >
                  {uploading ? "Uploading..." : "Add Files"}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {artwork.medias.length === 0 ? (
              <div className="border-2 border-dashed border-ui-border-base rounded-xl p-12 text-center bg-ui-bg-subtle/30">
                <div className="bg-ui-bg-base rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <Photo className="w-8 h-8 text-ui-fg-muted mx-auto" />
                </div>
                <Heading level="h3" className="mb-2">No media files yet</Heading>
                <Text className="text-ui-fg-subtle mb-6 max-w-sm mx-auto">
                  Upload images, videos, or other media files to showcase your artwork
                </Text>
                <Button 
                  type="button"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  size="small"
                  className="bg-ui-bg-interactive text-white"
                >
                  Upload Your First File
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artwork.medias.map((media, index) => (
                  <div key={media.id} className="border border-ui-border-base rounded-xl overflow-hidden bg-white hover:shadow-md transition-all duration-200">
                    {/* Image Preview */}
                    {media.mimeType.startsWith('image/') ? (
                      <div className="relative aspect-video bg-ui-bg-subtle">
                        <img
                          src={`/static/${media.fileId}`}
                          alt={media.filename || `Media ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        {/* Fallback for failed image loads */}
                        <div className="absolute inset-0 bg-ui-bg-subtle hidden items-center justify-center">
                          <div className="text-center">
                            <Photo className="w-12 h-12 text-ui-fg-muted mx-auto mb-2" />
                            <Text size="small" className="text-ui-fg-muted">
                              Image not found
                            </Text>
                          </div>
                        </div>
                        {/* Image Actions Overlay */}
                        <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenu.Trigger asChild>
                              <IconButton variant="transparent" size="small" className="bg-white/90 hover:bg-white">
                                <EllipsisHorizontal />
                              </IconButton>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                              <DropdownMenu.Item
                                onClick={() => window.open(`/static/${media.fileId}`, '_blank')}
                              >
                                View Full Size
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onClick={() => navigate(`/artwork/${artwork.id}/artfiles/${media.id}`)}
                              >
                                View Details
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator />
                              <DropdownMenu.Item
                                onClick={() => openDeleteDialog(media.id)}
                                className="text-ui-fg-error"
                              >
                                <Trash className="mr-2 w-4 h-4" />
                                Delete
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu>
                        </div>
                        {/* File Type Badge */}
                        <div className="absolute bottom-2 left-2">
                          <Badge size="2xsmall" className="bg-black/70 text-white border-none">
                            {media.mimeType.split('/')[1].toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      /* Non-image file preview */
                      <div className="aspect-video bg-ui-bg-subtle flex items-center justify-center relative">
                        <div className="text-center">
                          {getMediaTypeIcon(media.mimeType)}
                          <Text size="small" className="text-ui-fg-muted mt-2">
                            {media.mimeType.split('/')[1].toUpperCase()}
                          </Text>
                        </div>
                        <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenu.Trigger asChild>
                              <IconButton variant="transparent" size="small">
                                <EllipsisHorizontal />
                              </IconButton>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                              <DropdownMenu.Item
                                onClick={() => window.open(`/static/${media.fileId}`, '_blank')}
                              >
                                Download File
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onClick={() => navigate(`/artwork/${artwork.id}/artfiles/${media.id}`)}
                              >
                                View Details
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator />
                              <DropdownMenu.Item
                                onClick={() => openDeleteDialog(media.id)}
                                className="text-ui-fg-error"
                              >
                                <Trash className="mr-2 w-4 h-4" />
                                Delete
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu>
                        </div>
                      </div>
                    )}
                    
                    {/* File Information */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0 flex-1">
                          <Text size="small" weight="plus" className="truncate block mb-1">
                            {media.filename || `Media ${index + 1}`}
                          </Text>
                          <div className="flex items-center gap-2">
                            <Badge size="2xsmall" color="blue">
                              {media.mimeType}
                            </Badge>
                            <Text size="xsmall" className="text-ui-fg-muted">
                              ID: {media.fileId.substring(0, 8)}...
                            </Text>
                          </div>
                        </div>
                      </div>
                      
                      {media.file_description && (
                        <div className="mb-3 p-2 bg-ui-bg-subtle/50 rounded-md">
                          <Text size="small" className="text-ui-fg-subtle italic">
                            "{media.file_description}"
                          </Text>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-ui-fg-muted pt-2 border-t border-ui-border-base">
                        <Text size="xsmall">
                          {new Date(media.created_at).toLocaleDateString()}
                        </Text>
                        <Text size="xsmall">
                          {new Date(media.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-ui-bg-subtle/50 rounded-lg border border-ui-border-base">
              <div className="flex items-start gap-3">
                <CheckCircleSolid className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <Text size="small" weight="plus" className="block mb-1">Upload Tips</Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    • Supported formats: JPG, PNG, GIF, WebP, MP4, MOV
                    <br />• Maximum file size: 10MB per file
                    <br />• You can select and upload multiple files at once
                    <br />• Images will automatically display as previews
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Linked Products */}
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Link className="w-5 h-5 text-ui-fg-interactive" />
              <Heading level="h3">Linked Products</Heading>
              <Badge size="small" color={artwork.products?.length ? "green" : "orange"}>
                {artwork.products?.length || 0}
              </Badge>
            </div>
            
            {artwork.products && artwork.products.length > 0 ? (
              <div className="space-y-3">
                {artwork.products.map((product) => (
                  <div 
                    key={product.id} 
                    className="border border-ui-border-base rounded-lg p-4 hover:bg-ui-bg-subtle/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Text size="small" weight="plus" className="truncate">
                        {product.title}
                      </Text>
                      <ArrowLeft className="w-4 h-4 text-ui-fg-muted rotate-180" />
                    </div>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(product.status)}
                      <Text size="xsmall" className="text-ui-fg-muted">
                        /{product.handle}
                      </Text>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="secondary" 
                  size="small" 
                  className="w-full"
                  onClick={() => navigate(`/products?artwork=${artwork.id}`)}
                >
                  Manage Product Links
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="bg-ui-bg-subtle rounded-full p-3 w-12 h-12 mx-auto mb-3">
                  <Link className="w-6 h-6 text-ui-fg-muted mx-auto" />
                </div>
                <Text size="small" className="text-ui-fg-subtle mb-4">
                  No products linked to this artwork yet
                </Text>
                <Button 
                  variant="secondary" 
                  size="small"
                  onClick={() => navigate(`/products/new?artwork=${artwork.id}`)}
                >
                  Link to Product
                </Button>
              </div>
            )}
          </div>

          {/* Artwork Stats */}
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-6 shadow-sm">
            <Heading level="h3" className="mb-4">Artwork Details</Heading>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Text size="small" className="text-ui-fg-subtle">Created</Text>
                <Text size="small" weight="plus">
                  {new Date(artwork.created_at).toLocaleDateString()}
                </Text>
              </div>
              <div className="flex justify-between items-center">
                <Text size="small" className="text-ui-fg-subtle">Last Updated</Text>
                <Text size="small" weight="plus">
                  {new Date(artwork.updated_at).toLocaleDateString()}
                </Text>
              </div>
              <div className="flex justify-between items-center">
                <Text size="small" className="text-ui-fg-subtle">Media Files</Text>
                <Badge size="small" color="blue">
                  {artwork.medias.length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <Text size="small" className="text-ui-fg-subtle">Status</Text>
                <Badge size="small" color={artwork.deleted_at ? "red" : "green"}>
                  {artwork.deleted_at ? "Deleted" : "Active"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-6 shadow-sm">
            <Heading level="h3" className="mb-4">Quick Actions</Heading>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate(`/artwork/${artwork.id}`)}
                variant="secondary" 
                className="w-full"
              >
                View Artwork
              </Button>
              <Button 
                onClick={() => navigate("/artwork/new")}
                variant="secondary" 
                className="w-full"
              >
                Create New Artwork
              </Button>
              <Button 
                onClick={() => navigate("/artwork")}
                variant="secondary" 
                className="w-full"
              >
                Back to List
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Delete Confirmation */}
      <Prompt open={showDeletePrompt} onOpenChange={closeDeletePrompt}>
        <Prompt.Content>
          <Prompt.Header>
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-full p-2">
                <Trash className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <Prompt.Title>Delete Media File</Prompt.Title>
                <Prompt.Description className="mt-1">
                  This action cannot be undone. The media file will be permanently removed from your artwork.
                </Prompt.Description>
              </div>
            </div>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel>Keep File</Prompt.Cancel>
            <Prompt.Action onClick={handleDeleteMedia} className="bg-red-600">
              Delete File
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "Edit Artwork",
  icon: Photo
});

export default ArtworkEditPage;