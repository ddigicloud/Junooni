import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  Container, 
  Heading, 
  Label, 
  Button, 
  Input, 
  Textarea
} from "@medusajs/ui"

interface BrandDetails {
  id: string
  name: string
  handle: string
  description?: string
  created_at: string
  updated_at: string
}

const BrandEditPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [brand, setBrand] = useState<BrandDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<Partial<BrandDetails>>({})

  useEffect(() => {
    fetchBrandDetails()
  }, [id])

  const fetchBrandDetails = async () => {
    try {
      const response = await fetch(`/admin/brand/${id}`, {
        credentials: "include"
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch brand details')
      }

      const data = await response.json()
      setBrand(data.brand)
      setFormData({
        name: data.brand.name,
        handle: data.brand.handle,
        description: data.brand.description
      })
    } catch (error) {
      console.error("Error fetching brand details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/admin/brand/${id}`, {
        method: 'PUT',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update brand')
      }

      navigate('/brand')
    } catch (error) {
      console.error("Error updating brand:", error)
    }
  }

  if (isLoading) {
    return <Container>Loading brand details...</Container>
  }

  if (!brand) {
    return <Container>Brand not found</Container>
  }

  return (
    <Container>
      <Heading level="h1" className="mb-6">Edit Brand</Heading>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <Label>Brand ID</Label>
            <Input 
              type="text" 
              value={brand.id} 
              disabled 
            />
          </div>

          <div>
            <Label>Name</Label>
            <Input 
              type="text" 
              name="name"
              value={formData.name || ''} 
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label>Handle</Label>
            <Input 
              type="text" 
              name="handle"
              value={formData.handle || ''} 
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea 
              name="description"
              value={formData.description || ''} 
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label>Created At</Label>
            <Input 
              type="text" 
              value={new Date(brand.created_at).toLocaleString()} 
              disabled 
            />
          </div>

          <div>
            <Label>Last Updated</Label>
            <Input 
              type="text" 
              value={new Date(brand.updated_at).toLocaleString()} 
              disabled 
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="primary">
              Update Brand
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => navigate('/brand')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </Container>
  )
}

export default BrandEditPage