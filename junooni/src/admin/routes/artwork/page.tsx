// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { defineRouteConfig } from "@medusajs/admin-sdk"
// import { 
//   Container, 
//   Heading, 
//   Button, 
//   Table,
//   Badge,
//   DropdownMenu,
//   useToggleState,
//   Prompt,
//   Text,
//   IconButton
// } from "@medusajs/ui";
// import { PencilSquare, Trash, Plus, EllipsisHorizontal, ChevronDownMini, ChevronUpMini, Photo, Eye } from "@medusajs/icons";

// interface ArtworkMedia {
//   id: string;
//   fileId: string;
//   mimeType: string;
//   filename: string;
//   file_type: string;
//   file_description?: string;
//   vendor_artwork_id: string;
//   created_at: string;
//   updated_at: string;
//   deleted_at: string | null;
// }

// interface Product {
//   id: string;
//   title: string;
//   handle: string;
//   status: string;
// }

// interface VendorArtwork {
//   id: string;
//   name: string;
//   description?: string;
//   created_at: string;
//   updated_at: string;
//   deleted_at: string | null;
//   medias: ArtworkMedia[];
//   product?: Product;
// }

// interface ArtworkResponse {
//   vendor_artworks: VendorArtwork[];
//   count: number;
//   limit: number;
//   offset: number;
// }

// function ArtworkListPage() {
//   const [artworks, setArtworks] = useState<VendorArtwork[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [deleteId, setDeleteId] = useState<string | null>(null);
//   const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
//   const navigate = useNavigate();
  
//   const {
//     state: showDeletePrompt,
//     open: openDeletePrompt,
//     close: closeDeletePrompt,
//   } = useToggleState();

//   useEffect(() => {
//     fetchArtworks();
//   }, []);

//   const fetchArtworks = async () => {
//     try {
//       const response = await fetch("/admin/artwork");
//       const data: ArtworkResponse = await response.json();
//       setArtworks(data.vendor_artworks || []);
//     } catch (error) {
//       console.error("Failed to fetch artworks:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!deleteId) return;
    
//     try {
//       await fetch(`/admin/artwork/${deleteId}`, {
//         method: "DELETE",
//       });
//       setArtworks(prev => prev.filter(artwork => artwork.id !== deleteId));
//       closeDeletePrompt();
//       setDeleteId(null);
//     } catch (error) {
//       console.error("Failed to delete artwork:", error);
//     }
//   };

//   const openDeleteDialog = (id: string) => {
//     setDeleteId(id);
//     openDeletePrompt();
//   };

//   const toggleRowExpansion = (id: string) => {
//     setExpandedRows(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(id)) {
//         newSet.delete(id);
//       } else {
//         newSet.add(id);
//       }
//       return newSet;
//     });
//   };

//   const getMediaTypeIcon = (mimeType: string) => {
//     if (mimeType.startsWith('image/')) return <Photo className="w-4 h-4" />;
//     return <Photo className="w-4 h-4" />;
//   };

//   if (loading) {
//     return (
//       <Container className="p-6">
//         <div className="flex items-center justify-center h-64">
//           Loading...
//         </div>
//       </Container>
//     );
//   }

//   return (
//     <Container className="p-6">
//       <div className="flex items-center justify-between mb-6">
//         <Heading level="h1">Artwork Collection</Heading>
//         <Button
//           onClick={() => navigate("/artwork/new")}
//           className="flex items-center gap-2"
//         >
//           <Plus />
//           Create Artwork
//         </Button>
//       </div>

//       {artworks.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-64 text-center">
//           <Photo className="w-12 h-12 text-ui-fg-subtle mb-4" />
//           <p className="text-ui-fg-subtle mb-4">No artworks created yet</p>
//           <Button onClick={() => navigate("/artwork/new")}>
//             Create your first artwork
//           </Button>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           <Table>
//             <Table.Header>
//               <Table.Row>
//                 <Table.HeaderCell className="w-8"></Table.HeaderCell>
//                 <Table.HeaderCell>Name</Table.HeaderCell>
//                 <Table.HeaderCell>Description</Table.HeaderCell>
//                 <Table.HeaderCell>Media Files</Table.HeaderCell>
//                 <Table.HeaderCell>Product</Table.HeaderCell>
//                 <Table.HeaderCell>Created</Table.HeaderCell>
//                 <Table.HeaderCell>Status</Table.HeaderCell>
//                 <Table.HeaderCell className="w-8"></Table.HeaderCell>
//               </Table.Row>
//             </Table.Header>
//             <Table.Body>
//               {artworks.map((artwork) => (
//                 <Table.Row key={artwork.id} className="cursor-pointer hover:bg-ui-bg-subtle">
//                   <Table.Cell>
//                     <IconButton
//                       onClick={() => toggleRowExpansion(artwork.id)}
//                       variant="transparent"
//                     >
//                       {expandedRows.has(artwork.id) ? (
//                         <ChevronUpMini className="w-4 h-4" />
//                       ) : (
//                         <ChevronDownMini className="w-4 h-4" />
//                       )}
//                     </IconButton>
//                   </Table.Cell>
//                   <Table.Cell>
//                     <div 
//                       className="font-medium cursor-pointer hover:text-ui-fg-interactive"
//                       onClick={() => navigate(`/artwork/${artwork.id}`)}
//                     >
//                       {artwork.name}
//                     </div>
//                   </Table.Cell>
//                   <Table.Cell>
//                     <div className="max-w-xs truncate">
//                       {artwork.description || "-"}
//                     </div>
//                   </Table.Cell>
//                   <Table.Cell>
//                     <Badge size="2xsmall" color="blue">
//                       {artwork.medias.length} files
//                     </Badge>
//                   </Table.Cell>
//                   <Table.Cell>
//                     {artwork.product ? (
//                       <div>
//                         <Text size="small">{artwork.product.title}</Text>
//                       </div>
//                     ) : (
//                       <Text size="small" className="text-ui-fg-subtle">
//                         No product
//                       </Text>
//                     )}
//                   </Table.Cell>
//                   <Table.Cell>
//                     {new Date(artwork.created_at).toLocaleDateString()}
//                   </Table.Cell>
//                   <Table.Cell>
//                     <Badge 
//                       size="2xsmall" 
//                       color={artwork.deleted_at ? "red" : "green"}
//                     >
//                       {artwork.deleted_at ? "Deleted" : "Active"}
//                     </Badge>
//                   </Table.Cell>
//                   <Table.Cell>
//                     <DropdownMenu>
//                       <DropdownMenu.Trigger asChild>
//                         <Button variant="transparent" size="small">
//                           <EllipsisHorizontal />
//                         </Button>
//                       </DropdownMenu.Trigger>
//                       <DropdownMenu.Content>
//                         <DropdownMenu.Item
//                           onClick={() => navigate(`/artwork/${artwork.id}`)}
//                         >
//                           <Eye className="mr-2" />
//                           View
//                         </DropdownMenu.Item>
//                         <DropdownMenu.Item
//                           onClick={() => navigate(`/artwork/edit/${artwork.id}`)}
//                         >
//                           <PencilSquare className="mr-2" />
//                           Edit
//                         </DropdownMenu.Item>
//                         <DropdownMenu.Separator />
//                         <DropdownMenu.Item
//                           onClick={() => openDeleteDialog(artwork.id)}
//                           className="text-ui-fg-error"
//                         >
//                           <Trash className="mr-2" />
//                           Delete
//                         </DropdownMenu.Item>
//                       </DropdownMenu.Content>
//                     </DropdownMenu>
//                   </Table.Cell>
//                 </Table.Row>
//               ))}
//             </Table.Body>
//           </Table>

//           {/* Expanded sections for media files */}
//           {artworks.map((artwork) => (
//             expandedRows.has(artwork.id) && (
//               <div key={`expanded-${artwork.id}`} className="bg-ui-bg-subtle border border-ui-border-base rounded-lg p-6">
//                 <Heading level="h3" className="mb-4">Media Files for "{artwork.name}"</Heading>
//                 {artwork.medias.length === 0 ? (
//                   <Text className="text-ui-fg-subtle">No media files uploaded</Text>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {artwork.medias.map((media) => (
//                       <div key={media.id} className="border rounded-lg p-3 bg-ui-bg-base">
//                         <div className="flex items-center gap-2 mb-2">
//                           {getMediaTypeIcon(media.mimeType)}
//                           <Text size="small" weight="plus">
//                             {media.filename || `Media ${media.id.substring(0, 8)}`}
//                           </Text>
//                         </div>
//                         <div className="space-y-1">
//                           <Text size="xsmall" className="text-ui-fg-subtle">
//                             Type: {media.mimeType}
//                           </Text>
//                           <Text size="xsmall" className="text-ui-fg-subtle">
//                             File ID: {media.fileId.substring(0, 12)}...
//                           </Text>
//                           {media.file_description && (
//                             <Text size="xsmall">
//                               {media.file_description}
//                             </Text>
//                           )}
//                           <Text size="xsmall" className="text-ui-fg-subtle">
//                             Added: {new Date(media.created_at).toLocaleDateString()}
//                           </Text>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )
//           ))}
//         </div>
//       )}

//       <Prompt open={showDeletePrompt} onOpenChange={closeDeletePrompt}>
//         <Prompt.Content>
//           <Prompt.Header>
//             <Prompt.Title>Delete Artwork</Prompt.Title>
//             <Prompt.Description>
//               Are you sure you want to delete this artwork and all its media files? This action cannot be undone.
//             </Prompt.Description>
//           </Prompt.Header>
//           <Prompt.Footer>
//             <Prompt.Cancel>Cancel</Prompt.Cancel>
//             <Prompt.Action onClick={handleDelete}>Delete</Prompt.Action>
//           </Prompt.Footer>
//         </Prompt.Content>
//       </Prompt>
//     </Container>
//   );
// }

// export const config = defineRouteConfig({
//   label: "Artwork",
//   icon: Photo
// })

// export default ArtworkListPage



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
  Prompt,
  Text,
  IconButton
} from "@medusajs/ui";
import { PencilSquare, Trash, Plus, EllipsisHorizontal, ChevronDownMini, ChevronUpMini, Photo, Eye, ChevronLeft, ChevronRight } from "@medusajs/icons";

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
}

interface VendorArtwork {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  medias: ArtworkMedia[];
  product?: Product;
}

interface ArtworkResponse {
  vendor_artworks: VendorArtwork[];
  count: number;
  limit: number;
  offset: number;
}

function ArtworkListPage() {
  const [artworks, setArtworks] = useState<VendorArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10); // Items per page
  const navigate = useNavigate();
  
  const {
    state: showDeletePrompt,
    open: openDeletePrompt,
    close: closeDeletePrompt,
  } = useToggleState();

  useEffect(() => {
    fetchArtworks();
  }, [currentPage]);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * pageSize;
      const response = await fetch(`/admin/artwork?limit=${pageSize}&offset=${offset}`);
      const data: ArtworkResponse = await response.json();
      setArtworks(data.vendor_artworks || []);
      setTotalCount(data.count || 0);
    } catch (error) {
      console.error("Failed to fetch artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await fetch(`/admin/artwork/${deleteId}`, {
        method: "DELETE",
      });
      
      // After deletion, refresh the current page or go to previous page if current page becomes empty
      const newTotalCount = totalCount - 1;
      const totalPages = Math.ceil(newTotalCount / pageSize);
      
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      } else {
        await fetchArtworks();
      }
      
      closeDeletePrompt();
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete artwork:", error);
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    openDeletePrompt();
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getMediaTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Photo className="w-4 h-4" />;
    return <Photo className="w-4 h-4" />;
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
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
        <Heading level="h1">Artwork Collection</Heading>
        <Button
          onClick={() => navigate("/artwork/new")}
          className="flex items-center gap-2"
        >
          <Plus />
          Create Artwork
        </Button>
      </div>

      {totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Photo className="w-12 h-12 text-ui-fg-subtle mb-4" />
          <p className="text-ui-fg-subtle mb-4">No artworks created yet</p>
          <Button onClick={() => navigate("/artwork/new")}>
            Create your first artwork
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Results summary */}
          <div className="flex items-center justify-between">
            <Text className="text-ui-fg-subtle">
              Showing {startItem}-{endItem} of {totalCount} artworks
            </Text>
          </div>

          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell className="w-8"></Table.HeaderCell>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Description</Table.HeaderCell>
                <Table.HeaderCell>Media Files</Table.HeaderCell>
                <Table.HeaderCell>Product</Table.HeaderCell>
                <Table.HeaderCell>Created</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell className="w-8"></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {artworks.map((artwork) => (
                <Table.Row key={artwork.id} className="cursor-pointer hover:bg-ui-bg-subtle">
                  <Table.Cell>
                    <IconButton
                      onClick={() => toggleRowExpansion(artwork.id)}
                      variant="transparent"
                    >
                      {expandedRows.has(artwork.id) ? (
                        <ChevronUpMini className="w-4 h-4" />
                      ) : (
                        <ChevronDownMini className="w-4 h-4" />
                      )}
                    </IconButton>
                  </Table.Cell>
                  <Table.Cell>
                    <div 
                      className="font-medium cursor-pointer hover:text-ui-fg-interactive"
                      onClick={() => navigate(`/artwork/${artwork.id}`)}
                    >
                      {artwork.name}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="max-w-xs truncate">
                      {artwork.description || "-"}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge size="2xsmall" color="blue">
                      {artwork.medias.length} files
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {artwork.product ? (
                      <div>
                        <Text size="small">{artwork.product.title}</Text>
                      </div>
                    ) : (
                      <Text size="small" className="text-ui-fg-subtle">
                        No product
                      </Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(artwork.created_at).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge 
                      size="2xsmall" 
                      color={artwork.deleted_at ? "red" : "green"}
                    >
                      {artwork.deleted_at ? "Deleted" : "Active"}
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
                          onClick={() => navigate(`/artwork/${artwork.id}`)}
                        >
                          <Eye className="mr-2" />
                          View
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          onClick={() => navigate(`/artwork/edit/${artwork.id}`)}
                        >
                          <PencilSquare className="mr-2" />
                          Edit
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item
                          onClick={() => openDeleteDialog(artwork.id)}
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

          {/* Expanded sections for media files */}
          {artworks.map((artwork) => (
            expandedRows.has(artwork.id) && (
              <div key={`expanded-${artwork.id}`} className="bg-ui-bg-subtle border border-ui-border-base rounded-lg p-6">
                <Heading level="h3" className="mb-4">Media Files for "{artwork.name}"</Heading>
                {artwork.medias.length === 0 ? (
                  <Text className="text-ui-fg-subtle">No media files uploaded</Text>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {artwork.medias.map((media) => (
                      <div key={media.id} className="border rounded-lg p-3 bg-ui-bg-base">
                        <div className="flex items-center gap-2 mb-2">
                          {getMediaTypeIcon(media.mimeType)}
                          <Text size="small" weight="plus">
                            {media.filename || `Media ${media.id.substring(0, 8)}`}
                          </Text>
                        </div>
                        <div className="space-y-1">
                          <Text size="xsmall" className="text-ui-fg-subtle">
                            Type: {media.mimeType}
                          </Text>
                          <Text size="xsmall" className="text-ui-fg-subtle">
                            File ID: {media.fileId.substring(0, 12)}...
                          </Text>
                          {media.file_description && (
                            <Text size="xsmall">
                              {media.file_description}
                            </Text>
                          )}
                          <Text size="xsmall" className="text-ui-fg-subtle">
                            Added: {new Date(media.created_at).toLocaleDateString()}
                          </Text>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={goToPreviousPage}
                  disabled={!hasPreviousPage}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "primary" : "secondary"}
                      size="small"
                      onClick={() => goToPage(pageNum)}
                      className="min-w-[2rem]"
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="secondary"
                  size="small"
                  onClick={goToNextPage}
                  disabled={!hasNextPage}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <Text className="text-ui-fg-subtle">
                Page {currentPage} of {totalPages}
              </Text>
            </div>
          )}
        </div>
      )}

      <Prompt open={showDeletePrompt} onOpenChange={closeDeletePrompt}>
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Delete Artwork</Prompt.Title>
            <Prompt.Description>
              Are you sure you want to delete this artwork and all its media files? This action cannot be undone.
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
  label: "Artwork",
  icon: Photo
})

export default ArtworkListPage