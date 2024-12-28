import { 
    Container, 
    Heading, 
    Button,
    Input,
    Label,
    FocusModal,
  } from "@medusajs/ui"
  import { useState, useEffect } from "react"
  import { useLocation } from "react-router-dom"
  import { defineRouteConfig } from "@medusajs/admin-sdk"
  import { TagSolid } from "@medusajs/icons"
  
  interface Brand {
    id: string
    name: string
    handle: string
    created_at: string
    updated_at: string
  }
  
  const EditBrandPage = () => {
    const location = useLocation()
    const id = location.pathname.split('/').pop() // Get ID from URL
    
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState<Partial<Brand>>({
      name: "",
      handle: "",
    })
  
    useEffect(() => {
      if (id) {
        fetchBrandDetails()
      } else {
        setError("Brand ID not found")
        setIsLoading(false)
      }
    }, [id])
  
    const fetchBrandDetails = async () => {
      try {
        // Using the correct API endpoint format for Medusa
        const response = await fetch(`/api/admin/brands/${id}`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })
  
        if (!response.ok) {
          throw new Error(response.status === 404 ? "Brand not found" : "Failed to fetch brand details")
        }
  
        const data = await response.json()
        
        // Check if the response has the expected structure
        if (!data.brand) {
          throw new Error("Invalid response format")
        }
  
        setFormData({
          name: data.brand.name,
          handle: data.brand.handle,
        })
        setError(null)
      } catch (error) {
        console.error("Error fetching brand:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch brand details")
      } finally {
        setIsLoading(false)
      }
    }
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.name || !formData.handle) {
        setError("Please fill in all required fields.")
        return
      }
  
      setIsSaving(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/admin/brands/${id}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            handle: formData.handle,
          }),
        })
  
        if (!response.ok) {
          throw new Error("Failed to update brand")
        }
  
        const data = await response.json()
        
        if (data.brand) {
          window.location.href = "/a/brands"
        } else {
          throw new Error("Invalid response format")
        }
      } catch (error) {
        console.error("Error updating brand:", error)
        setError(error instanceof Error ? error.message : "Failed to update brand")
      } finally {
        setIsSaving(false)
      }
    }
  
    const handleDelete = async () => {
      try {
        const response = await fetch(`/api/admin/brands/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })
  
        if (!response.ok) {
          throw new Error("Failed to delete brand")
        }
  
        window.location.href = "/a/brands"
      } catch (error) {
        console.error("Error deleting brand:", error)
        setError(error instanceof Error ? error.message : "Failed to delete brand")
        setShowDeleteModal(false)
      }
    }
  
    if (isLoading) {
      return (
        <Container>
          <div className="flex items-center justify-center h-screen">
            Loading brand details...
          </div>
        </Container>
      )
    }
  
    return (
      <Container>
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Heading level="h1">Edit Brand</Heading>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(true)}
                className="text-red-500"
              >
                Delete
              </Button>
            </div>
          </div>
  
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
              {error}
            </div>
          )}
  
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">Brand Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter brand name"
                  required
                />
              </div>
  
              <div>
                <Label htmlFor="handle">Handle</Label>
                <Input
                  id="handle"
                  name="handle"
                  value={formData.handle}
                  onChange={handleInputChange}
                  placeholder="brand-handle"
                  required
                />
              </div>
  
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => window.location.href = "/a/brands"}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
  
          {showDeleteModal && (
            <FocusModal open onOpenChange={setShowDeleteModal}>
              <FocusModal.Content>
                <FocusModal.Header>
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Close
                  </Button>
                </FocusModal.Header>
                <div className="flex flex-col items-center p-6 space-y-4">
                  <TagSolid className="text-red-500 w-12 h-12" />
                  <Heading level="h2">Delete Brand</Heading>
                  <p className="text-center text-gray-600">
                    Are you sure you want to delete this brand? This action cannot be undone.
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      className="bg-red-500 hover:bg-red-600"
                      onClick={handleDelete}
                    >
                      Delete Brand
                    </Button>
                  </div>
                </div>
              </FocusModal.Content>
            </FocusModal>
          )}
        </div>
      </Container>
    )
  }
  
  export default EditBrandPage
  
  export const config = defineRouteConfig({
    label: "Edit Brand",
    icon: TagSolid,
  })