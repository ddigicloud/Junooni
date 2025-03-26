import { Table, Container, Heading, Button, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BuildingsSolid } from "@medusajs/icons"
import { Link } from "react-router-dom"

// Updated interface to match API response structure
interface Vendor {
  id: string
  name: string
  handle?: string
  logo?: string
  admins: {
    email: string
    first_name?: string
    last_name?: string
  }[]
}

const VendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/vendors`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("API Response:", data)
      
      // Check if data has expected structure
      if (data.vendors && Array.isArray(data.vendors)) {
        setVendors(data.vendors)
      } else {
        console.error("Unexpected data format:", data)
        setError("Received unexpected data format from API")
        setVendors([])
      }
    } catch (error) {
      console.error("Error fetching vendors:", error)
      setError(`Failed to load vendors: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setVendors([])
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to render vendor logo or placeholder
  const renderLogo = (vendor: Vendor) => {
    if (vendor.logo) {
      return (
        <div className="flex items-center justify-center w-10 h-10 overflow-hidden border rounded">
          <img 
            src={vendor.logo} 
            alt={`${vendor.name} logo`} 
            className="object-contain max-w-full max-h-full"
            onError={(e) => {
              // If image fails to load, replace with vendor initials
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.textContent = vendor.name.substring(0, 2).toUpperCase();
              target.parentElement!.classList.add('bg-gray-100', 'text-gray-500');
            }}
          />
        </div>
      )
    } else {
      // Show initials if no logo
      return (
        <div className="flex items-center justify-center w-10 h-10 text-gray-500 bg-gray-100 rounded">
          {vendor.name.substring(0, 2).toUpperCase()}
        </div>
      )
    }
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">Vendors</Heading>
        <Link to="/vendors/register">
          <Button variant="primary">Create Vendor</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Text>Loading vendors...</Text>
        </div>
      ) : error ? (
        <div className="p-4 text-red-500 border border-red-300 rounded bg-red-50">
          <Text>{error}</Text>
        </div>
      ) : vendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-4">
          <Text className="text-gray-500">No vendors found</Text>
          <Link to="/vendors/register">
            <Button variant="secondary">Create your first vendor</Button>
          </Link>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Logo</Table.HeaderCell>
              <Table.HeaderCell>Vendor Name</Table.HeaderCell>
              <Table.HeaderCell>Handle</Table.HeaderCell>
              <Table.HeaderCell>Admins</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {vendors.map((vendor) => (
              <Table.Row key={vendor.id}>
                <Table.Cell>
                  {renderLogo(vendor)}
                </Table.Cell>
                <Table.Cell>
                  <div>
                    <Text className="font-medium">{vendor.name}</Text>
                    <Text className="text-xs text-gray-500">{vendor.id.substring(0, 10)}...</Text>
                  </div>
                </Table.Cell>
                <Table.Cell>{vendor.handle || "-"}</Table.Cell>
                <Table.Cell>
                  {vendor.admins && vendor.admins.length > 0 ? (
                    <div className="space-y-1">
                      {vendor.admins.map((admin, index) => (
                        <div key={index} className="text-sm">
                          {admin.first_name || admin.last_name ? (
                            <Text>
                              {[admin.first_name, admin.last_name].filter(Boolean).join(" ")} - {admin.email}
                            </Text>
                          ) : (
                            <Text>{admin.email}</Text>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Text className="text-gray-400">No admins</Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Link to={`/vendors/${vendor.id}`}>
                      <Button variant="secondary" size="small">
                        View
                      </Button>
                    </Link>
                    <Link to={`/vendors/${vendor.id}/edit`}>
                      <Button variant="secondary" size="small">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  )
}

export default VendorsPage

export const config = defineRouteConfig({
  label: "Vendors",
  icon: BuildingsSolid,
})