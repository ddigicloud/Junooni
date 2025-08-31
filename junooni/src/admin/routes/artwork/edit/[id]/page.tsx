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
  PencilSquare
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

interface VendorArtwork {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  medias: ArtworkMedia[];
}

interface ArtworkDetailResponse {
  vendor_artwork: VendorArtwork;
}

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
      setArtwork(data.vendor_artwork);
      setFormData({
        name: data.vendor_artwork.name,
        description: data.vendor_artwork.description || ""
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

      // Refresh artwork data
      await fetchArtwork(artwork.id);
      toast.success("Files uploaded successfully");
    } catch (error) {
      console.error("Failed to upload files:", error);
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
      // Clear the input
      e.target.value = '';
    }
  };

  const handleDeleteMedia = async () => {
    if (!deleteMediaId) return;
    
    try {
      await fetch(`/admin/artwork/media/${deleteMediaId}`, {
        method: "DELETE",
      });
      
      // Refresh artwork data
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
    if (mimeType.startsWith('image/')) return <Photo className="w-5 h-5" />;
    return <Photo className="w-5 h-5" />;
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

  if (!artwork) {
    return (
      <Container className="p-6">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Photo className="w-12 h-12 text-ui-fg-subtle mb-4" />
          <Text className="text-ui-fg-subtle mb-4">Artwork not found</Text>
          <Button onClick={() => navigate("/artwork")}>
            Back to Artwork List
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <IconButton 
            onClick={() => navigate(`/artwork/${artwork.id}`)}
            variant="transparent"
          >
            <ArrowLeft />
          </IconButton>
          <div>
            <Heading level="h1">Edit Artwork</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {artwork.name}
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
          >
            Save Changes
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6">
          <Heading level="h2" className="mb-4">Basic Information</Heading>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name *
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter artwork name"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter artwork description"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Media Files */}
        <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6" id="media">
          <div className="flex items-center justify-between mb-4">
            <Heading level="h2">Media Files ({artwork.medias.length})</Heading>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={uploading}
                isLoading={uploading}
              >
                {uploading ? "Uploading..." : "Upload Files"}
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {artwork.medias.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-ui-border-base rounded-lg">
              <Photo className="w-12 h-12 text-ui-fg-subtle mb-4" />
              <Text className="text-ui-fg-subtle mb-4">No media files uploaded</Text>
              <Button 
                type="button"
                onClick={() => document.getElementById('file-upload')?.click()}
                size="small"
              >
                Add Media Files
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artwork.medias.map((media) => (
                <div key={media.id} className="border rounded-lg p-4 bg-ui-bg-base">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getMediaTypeIcon(media.mimeType)}
                      <Text size="small" weight="plus" className="truncate">
                        {media.filename || `Media ${media.id.substring(0, 8)}`}
                      </Text>
                    </div>
                    <DropdownMenu>
                      <DropdownMenu.Trigger asChild>
                        <IconButton variant="transparent" size="small">
                          <EllipsisHorizontal />
                        </IconButton>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content>
                        <DropdownMenu.Item
                          onClick={() => openDeleteDialog(media.id)}
                          className="text-ui-fg-error"
                        >
                          <Trash className="mr-2" />
                          Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <Badge size="2xsmall" color="blue">
                        {media.mimeType}
                      </Badge>
                    </div>
                    {media.file_description && (
                      <Text size="small" className="text-ui-fg-subtle">
                        {media.file_description}
                      </Text>
                    )}
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      Added {new Date(media.created_at).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-4 bg-ui-bg-subtle rounded-lg">
            <Text size="small" className="text-ui-fg-subtle">
              <strong>Tip:</strong> You can upload multiple files at once. Supported formats: JPG, PNG, GIF, WebP
            </Text>
          </div>
        </div>
      </form>

      {/* Delete Media Confirmation */}
      <Prompt open={showDeletePrompt} onOpenChange={closeDeletePrompt}>
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Delete Media File</Prompt.Title>
            <Prompt.Description>
              Are you sure you want to delete this media file? This action cannot be undone.
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel>Cancel</Prompt.Cancel>
            <Prompt.Action onClick={handleDeleteMedia}>Delete</Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "Edit Artwork",
  icon: PencilSquare
});

export default ArtworkEditPage;