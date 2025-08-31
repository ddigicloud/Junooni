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
  Text,
  IconButton,
  Badge
} from "@medusajs/ui";
import { ArrowLeft, Photo, Plus, Trash, CloudArrowUp } from "@medusajs/icons";

interface MediaFile {
  id: string;
  file_id: string;
  mime_type: string;
  name: string;
  description: string;
  file?: File;
  previewUrl?: string;
}

function NewArtworkPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!name.trim()) {
    setError("Artwork name is required");
    return;
  }

  if (mediaFiles.length === 0) {
    setError("At least one media file is required");
    return;
  }

  // Check if all files have been processed
  const unprocessedFiles = mediaFiles.filter(media => !media.file_id && media.file);
  if (unprocessedFiles.length > 0) {
    setError("Please wait for all files to finish uploading");
    return;
  }

  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch("/admin/artwork", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        medias: mediaFiles.map(media => ({
          file_id: media.file_id,
          mime_type: media.mime_type,
          filename: media.name || media.file?.name || "untitled", // Schema expects 'filename' not 'name'
          file_type: media.mime_type, // Schema expects 'file_type' (same as mime_type)
          file_description: media.description || "", // Schema expects 'file_description' not 'description'
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to create artwork");
    }

    navigate("/artwork");
  } catch (error) {
    console.error("Failed to create artwork:", error);
    setError(error instanceof Error ? error.message : "Failed to create artwork");
  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    navigate("/artwork");
  };

  const addMediaFile = () => {
    const newMedia: MediaFile = {
      id: Math.random().toString(36).substring(7),
      file_id: "",
      mime_type: "",
      name: "",
      description: "",
    };
    setMediaFiles(prev => [...prev, newMedia]);
  };

  const updateMediaFile = (id: string, updates: Partial<MediaFile>) => {
    setMediaFiles(prev => 
      prev.map(media => 
        media.id === id ? { ...media, ...updates } : media
      )
    );
  };

  const removeMediaFile = (id: string) => {
    setMediaFiles(prev => prev.filter(media => media.id !== id));
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('files', file); // Use 'files' instead of 'file'
    
    const response = await fetch('/admin/artwork/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', errorText);
      throw new Error(`Failed to upload file: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Upload result:', result);
    
    // Handle different possible response structures
    if (result.uploads && result.uploads.length > 0) {
      return result.uploads[0].id;
    }
    if (result.files && result.files.length > 0) {
      return result.files[0].id;
    }
    if (result.file?.id) {
      return result.file.id;
    }
    if (result.id) {
      return result.id;
    }
    
    throw new Error('Upload response does not contain file ID');
  };

  const handleFileChange = async (mediaId: string, file: File) => {
    const mimeType = file.type;
    const fileName = file.name.split('.')[0]; // Remove extension for display name
    
    // Create preview URL for images
    let previewUrl: string | undefined;
    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
    }
    
    // Update media file with file info
    updateMediaFile(mediaId, {
      file,
      mime_type: mimeType,
      name: fileName,
      previewUrl,
    });

    // Start upload process
    setUploading(prev => new Set([...prev, mediaId]));
    setError(null);
    
    try {
      const fileId = await uploadFile(file);
      updateMediaFile(mediaId, { file_id: fileId });
    } catch (error) {
      console.error('Upload failed:', error);
      setError(`Failed to upload ${file.name}`);
      // Remove the file on upload failure
      updateMediaFile(mediaId, { 
        file: undefined, 
        file_id: "",
        previewUrl: undefined 
      });
    } finally {
      setUploading(prev => {
        const newSet = new Set(prev);
        newSet.delete(mediaId);
        return newSet;
      });
    }
  };

 

  const getFileTypeBadge = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return { color: "green" as const, label: "Image" };
    if (mimeType.startsWith('video/')) return { color: "blue" as const, label: "Video" };
    if (mimeType.startsWith('audio/')) return { color: "purple" as const, label: "Audio" };
    return { color: "grey" as const, label: "File" };
  };

  const isFormValid = name.trim() && 
    mediaFiles.length > 0 && 
    mediaFiles.every(media => media.file_id) &&
    uploading.size === 0;

  return (
    <Container className="p-6">
      <div className="mb-6">
        <Button
          variant="transparent"
          onClick={handleCancel}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft />
          Back to Artwork
        </Button>
        
        <Heading level="h1">Create New Artwork</Heading>
        <Text className="text-ui-fg-subtle mt-2">
          Create a new artwork collection with media files that can be associated with products.
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-ui-bg-error-subtle border border-ui-border-error rounded-lg p-3">
                  <Text className="text-ui-fg-error">{error}</Text>
                </div>
              )}

              {/* Artwork Details */}
              <div className="space-y-4">
                <Heading level="h3">Artwork Information</Heading>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Artwork Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter artwork collection name"
                    required
                  />
                  <Text size="small" className="text-ui-fg-subtle">
                    Give your artwork collection a descriptive name
                  </Text>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this artwork collection..."
                    rows={4}
                  />
                  <Text size="small" className="text-ui-fg-subtle">
                    Optional description of the artwork collection
                  </Text>
                </div>
              </div>

              {/* Media Files Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Heading level="h3">Media Files *</Heading>
                  <Button
                    type="button"
                    onClick={addMediaFile}
                    variant="secondary"
                    size="small"
                    className="flex items-center gap-2"
                  >
                    <Plus />
                    Add Media
                  </Button>
                </div>

                {mediaFiles.length === 0 ? (
                  <div className="border-2 border-dashed border-ui-border-base rounded-lg p-8 text-center">
                    <Photo className="w-12 h-12 text-ui-fg-subtle mx-auto mb-4" />
                    <Text className="text-ui-fg-subtle mb-4">No media files added yet</Text>
                    <Text size="small" className="text-ui-fg-subtle mb-4">
                      Add images, videos, or audio files to your artwork collection
                    </Text>
                    <Button
                      type="button"
                      onClick={addMediaFile}
                      variant="secondary"
                    >
                      Add First Media File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mediaFiles.map((media, index) => {
                      const isUploading = uploading.has(media.id);
                      const { color, label } = getFileTypeBadge(media.mime_type);

                      return (
                        <div key={media.id} className="border border-ui-border-base rounded-lg p-4 bg-ui-bg-subtle">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Text weight="plus">Media File #{index + 1}</Text>
                              {media.mime_type && (
                                <Badge size="2xsmall" color={color}>
                                  {label}
                                </Badge>
                              )}
                              {isUploading && (
                                <Badge size="2xsmall" color="orange">
                                  Uploading...
                                </Badge>
                              )}
                              {media.file_id && (
                                <Badge size="2xsmall" color="green">
                                  Ready
                                </Badge>
                              )}
                            </div>
                            <IconButton
                              onClick={() => removeMediaFile(media.id)}
                              variant="transparent"
                            >
                              <Trash className="w-4 h-4 text-ui-fg-error" />
                            </IconButton>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* File Upload */}
                            <div className="space-y-2">
                              <Label htmlFor={`file-${media.id}`}>File *</Label>
                              <div className="relative">
                                <input
                                  id={`file-${media.id}`}
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleFileChange(media.id, file);
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  accept="image/*,video/*,audio/*"
                                  disabled={isUploading}
                                />
                                <div className={`border border-ui-border-base rounded-lg p-3 flex items-center gap-2 ${
                                  isUploading ? 'bg-ui-bg-disabled' : 'bg-ui-bg-base cursor-pointer hover:bg-ui-bg-subtle'
                                }`}>
                                  <CloudArrowUp className="w-4 h-4 text-ui-fg-subtle" />
                                  <Text size="small" className="text-ui-fg-subtle truncate">
                                    {isUploading 
                                      ? "Uploading..." 
                                      : media.file 
                                        ? media.file.name 
                                        : "Choose file..."
                                    }
                                  </Text>
                                </div>
                              </div>
                            </div>

                            {/* Display Name */}
                            <div className="space-y-2">
                              <Label htmlFor={`name-${media.id}`}>Display Name</Label>
                              <Input
                                id={`name-${media.id}`}
                                value={media.name}
                                onChange={(e) => updateMediaFile(media.id, { name: e.target.value })}
                                placeholder="Media display name"
                              />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2 space-y-2">
                              <Label htmlFor={`description-${media.id}`}>Description</Label>
                              <Textarea
                                id={`description-${media.id}`}
                                value={media.description}
                                onChange={(e) => updateMediaFile(media.id, { description: e.target.value })}
                                placeholder="Describe this media file..."
                                rows={2}
                              />
                            </div>

                            {/* File Info */}
                            {media.mime_type && (
                              <div className="md:col-span-2 space-y-1">
                                <Text size="small" className="text-ui-fg-subtle">
                                  Type: {media.mime_type}
                                </Text>
                                {media.file && (
                                  <Text size="small" className="text-ui-fg-subtle">
                                    Size: {(media.file.size / 1024 / 1024).toFixed(2)} MB
                                  </Text>
                                )}
                                {media.file_id && (
                                  <Text size="small" className="text-ui-fg-subtle">
                                    File ID: {media.file_id}
                                  </Text>
                                )}
                              </div>
                            )}

                            {/* Image Preview */}
                            {media.previewUrl && (
                              <div className="md:col-span-2">
                                <Label>Preview</Label>
                                <div className="mt-1 w-32 h-32 border border-ui-border-base rounded-lg overflow-hidden">
                                  <img 
                                    src={media.previewUrl} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  isLoading={loading}
                  disabled={!isFormValid}
                  className="flex items-center gap-2"
                >
                  <Photo />
                  Create Artwork
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

              {/* Upload Progress */}
              {uploading.size > 0 && (
                <div className="bg-ui-bg-highlight border border-ui-border-base rounded-lg p-3">
                  <Text size="small" className="text-ui-fg-subtle">
                    Uploading {uploading.size} file{uploading.size > 1 ? 's' : ''}...
                  </Text>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6">
            <Heading level="h3" className="mb-4">Summary</Heading>
            <div className="space-y-3">
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">
                  Artwork Name
                </Text>
                <Text>
                  {name || "Untitled"}
                </Text>
              </div>
              
              <hr className="border-ui-border-base" />
              
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">
                  Media Files
                </Text>
                <Text>
                  {mediaFiles.length} files
                </Text>
              </div>

              <hr className="border-ui-border-base" />
              
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">
                  Uploaded Files
                </Text>
                <Text>
                  {mediaFiles.filter(m => m.file_id).length} / {mediaFiles.length}
                </Text>
              </div>
              
              <hr className="border-ui-border-base" />
              
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-subtle">
                  Status
                </Text>
                <Text>
                  {isFormValid 
                    ? "Ready to create" 
                    : uploading.size > 0 
                      ? "Uploading files..." 
                      : "Incomplete"
                  }
                </Text>
              </div>
            </div>
          </div>

          <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6">
            <Heading level="h3" className="mb-3">File Types Supported</Heading>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Photo className="w-4 h-4 text-blue-500" />
                <Text size="small">Images: JPG, PNG, GIF, WebP, SVG</Text>
              </div>
              <div className="flex items-center gap-2">
                <Photo className="w-4 h-4 text-purple-500" />
                <Text size="small">Videos: MP4, WebM, MOV, AVI</Text>
              </div>
              <div className="flex items-center gap-2">
                <Photo className="w-4 h-4 text-green-500" />
                <Text size="small">Audio: MP3, WAV, OGG, FLAC</Text>
              </div>
            </div>
            
            <hr className="border-ui-border-base my-4" />
            
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-subtle mb-2">
                Tips
              </Text>
              <div className="space-y-1">
                <Text size="small">• Files are uploaded automatically</Text>
                <Text size="small">• Max file size: 50MB per file</Text>
                <Text size="small">• Add descriptive names for better organization</Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "Create Artwork",
  icon: Photo
})

export default NewArtworkPage