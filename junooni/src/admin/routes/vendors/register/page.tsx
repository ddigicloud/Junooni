import { 
  Container, 
  Heading, 
  Button,
  Input,
  Label,
  Text,
} from "@medusajs/ui"
import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"

const NewVendorPage = () => {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setLogo(selectedFile)
      
      // Create a preview URL for the image
      const previewURL = URL.createObjectURL(selectedFile)
      setLogoPreview(previewURL)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Step 1: Register Vendor Credentials
      const registerResponse = await fetch("http://localhost:9000/auth/vendor/emailpass/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "email": email,
          "password": password,
        }),
      })

      if (!registerResponse.ok) {
        const error = await registerResponse.json()
        console.error("Error during vendor registration:", error.message)
        return
      }

      const { token } = await registerResponse.json() // Extract the JWT token

      // Step 2: Upload logo if one was selected
      let logoUrl = null
      if (logo) {
        const formData = new FormData()
        formData.append("files", logo)
        
        const uploadResponse = await fetch("http://localhost:9000/vendors/uploads", {
          method: "POST",
          credentials: "include",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        })
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          // Based on the server implementation, we expect a result object from the workflow
          if (uploadResult.result && uploadResult.result.uploads && uploadResult.result.uploads.length > 0) {
            // The uploadFilesWorkflow likely returns an array of file data
            logoUrl = uploadResult.result.uploads[0].url
          } else {
            console.error("Logo upload successful but unexpected response format:", uploadResult)
          }
        } else {
          console.error("Error uploading logo:", await uploadResponse.text())
        }
      }

      // Step 3: Create Vendor Details
      const createVendorResponse = await fetch("/vendors", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          handle: name.toLowerCase().replace(/\s+/g, "-"),
          admin: {
            email,
            first_name: firstName,
            last_name: lastName,
          },
          // Include logo URL if one was uploaded
          ...(logoUrl && { logo: logoUrl }),
        }),
      })

      if (createVendorResponse.ok) {
        console.log("Vendor created successfully")
        navigate("/vendors")
      } else {
        const error = await createVendorResponse.json()
        console.error("Error creating vendor:", error.message)
      }
    } catch (error) {
      console.error("Error during vendor creation:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Trigger file input click
  const handleLogoButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Clear selected logo
  const handleClearLogo = () => {
    setLogo(null)
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Container>
      <div className="max-w-lg mx-auto">
        <Heading level="h1" className="mb-6">Create New Vendor</Heading>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Vendor Store Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter vendor store name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Vendor Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter vendor email"
                type="email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                type="password"
                required
              />
            </div>
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
            
            {/* Logo upload section */}
            <div>
              <Label>Vendor Logo</Label>
              <div className="mt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <div className="flex flex-col items-center">
                  {logoPreview ? (
                    <div className="relative mb-3">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="object-contain w-32 h-32 border rounded"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-0 right-0 p-1"
                        onClick={handleClearLogo}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-32 h-32 mb-3 border-2 border-dashed rounded-md">
                      <Text className="text-gray-400">No logo</Text>
                    </div>
                  )}
                  
                  <Button 
                    variant="secondary" 
                    type="button"
                    onClick={handleLogoButtonClick}
                  >
                    {logo ? "Change Logo" : "Upload Logo"}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 space-x-2">
              <Button
                variant="secondary"
                onClick={() => navigate("/vendors")}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Vendor"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Container>
  )
}

export default NewVendorPage