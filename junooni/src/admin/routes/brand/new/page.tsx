import { 
    Container, 
    Heading, 
    Button,
    Input,
    Label,
  } from "@medusajs/ui"
  import { useState } from "react"
  import { useNavigate } from "react-router-dom"
  
  const NewBrandPage = () => {
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [handle, setHandle] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
  
      try {
        const response = await fetch("/admin/brand", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            handle: handle || name.toLowerCase().replace(/\s+/g, "-"),
          }),
        })
  
        if (response.ok) {
          navigate("/brand")
        } else {
          console.error("Failed to create brand")
        }
      } catch (error) {
        console.error("Error creating brand:", error)
      } finally {
        setIsSubmitting(false)
      }
    }
  
    return (
      <Container>
        <div className="max-w-lg mx-auto">
          <Heading level="h1" className="mb-6">Create New Brand</Heading>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Brand Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter brand name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="handle">Handle (optional)</Label>
                <Input
                  id="handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="brand-handle"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => navigate("/brand")}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Brand"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Container>
    )
  }
  
  export default NewBrandPage
  
  