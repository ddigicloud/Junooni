import { 
  Container, 
  Heading, 
  Button,
  Input,
  Label,
  Text
} from "@medusajs/ui"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const NewVendorPage = () => {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // State for logo upload
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedLogo(file)
    
    // Create a preview of the selected image
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setLogoPreview(null)
    }
  }

  // Upload the logo and get its URL
  const uploadLogo = async (token: string): Promise<string | null> => {
    if (!selectedLogo) return null
    
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      // Create form data with the logo file
      const formData = new FormData()
      formData.append('files', selectedLogo)
      
      // Create an XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest()
      
      // Set up a promise to handle the response
      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(percentComplete)
          }
        })
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText)
              resolve(data)
            } catch (error) {
              reject(new Error('Invalid response format'))
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`))
          }
        })
        
        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred during upload'))
        })
        
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was aborted'))
        })
      })
      
      // Open and send the request with authentication
      xhr.open('POST', '/vendors/uploads', true)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.withCredentials = true
      xhr.send(formData)
      
      // Wait for the upload to complete
      const data = await uploadPromise
      console.log('Logo upload response:', data)
      
      // Extract the file URL from the response
      let logoUrl = null
      if (data.files && data.files.length > 0) {
        logoUrl = data.files[0].url || data.files[0].file_url || null
      }
      
      setUploadedLogoUrl(logoUrl)
      return logoUrl
    } catch (error) {
      console.error('Error uploading logo:', error)
      throw error
    } finally {
      setIsUploading(false)
      setUploadProgress(100)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Step 1: Register Vendor Credentials
      const registerResponse = await fetch("/auth/vendor/emailpass/register",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json()
        setError(`Registration error: ${errorData.message || registerResponse.status}`)
        return
      }

      const { token } = await registerResponse.json() // Extract the JWT token

      // Step 2: Upload logo if one was selected
      let logoUrl = null
      if (selectedLogo) {
        try {
          logoUrl = await uploadLogo(token)
        } catch (error) {
          console.error("Logo upload failed:", error)
          // Continue with vendor creation even if logo upload fails
        }
      }

      // Step 3: Create Vendor Details
      const createVendorResponse = await fetch(
        "/vendors",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            handle: name.toLowerCase().replace(/\s+/g, "-"),
            logo: logoUrl, // Include the logo URL if available
            admin: {
              email,
              first_name: firstName,
              last_name: lastName,
            },
          }),
        }
      )

      if (createVendorResponse.ok) {
        console.log("Vendor created successfully")
        navigate("/vendors")
      } else {
        const errorData = await createVendorResponse.json()
        setError(`Error creating vendor: ${errorData.message || createVendorResponse.status}`)
      }
    } catch (error) {
      console.error("Error during vendor creation:", error)
      setError("An unexpected error occurred during vendor creation")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container>
      <div className="max-w-lg mx-auto">
        <Heading level="h1" className="mb-6">Create New Vendor</Heading>
        
        {error && (
          <div className="p-4 mb-4 border border-red-300 rounded bg-red-50 text-red-600">
            <Text>{error}</Text>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
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
            
            {/* Logo upload section */}
            <div>
              <Label htmlFor="logo" className="mb-2 block">Vendor Logo</Label>
              
              {/* Logo preview */}
              {logoPreview && (
                <div className="mb-3">
                  <div className="w-24 h-24 rounded border overflow-hidden">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
              
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="mb-2"
              />
              
              <Text className="text-xs text-gray-500">
                Upload a square logo image (recommended size: 200x200px)
              </Text>
              
              {/* Upload progress indicator */}
              {isUploading && (
                <div className="mt-2">
                  <div className="w-full mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <Text className="text-xs text-gray-500 mt-1">
                    Uploading: {uploadProgress}%
                  </Text>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => navigate("/vendors")}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || isUploading}
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