import { 
  Container, 
  Heading, 
  Button,
  Input,
  Label,
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
          "password":password,
        }),
      })

      if (!registerResponse.ok) {
        const error = await registerResponse.json()
        console.error("Error during vendor registration:", error.message)
        return
      }

      const { token } = await registerResponse.json() // Extract the JWT token

      // Step 2: Create Vendor Details
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
            <div className="flex justify-end space-x-2">
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
