import { Table, Container, Heading, Button } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BuildingsSolid } from "@medusajs/icons"
import { Link } from "react-router-dom"

// Define the Vendor interface
interface Vendor {
  vendor_id: string
  vendor_name: string
  admins: {
    email: string
    first_name?: string
    last_name?: string
  }[]
}

const VendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      const response = await fetch(`http://localhost:9000/vendors`)
      console.log(response)
      const data = await response.json()
      setVendors(data.vendors)
    } catch (error) {
      console.error("Error fetching vendors:", error)
    } finally {
      setIsLoading(false)
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
          Loading vendors...
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Vendor ID</Table.HeaderCell>
              <Table.HeaderCell>Vendor Name</Table.HeaderCell>
              <Table.HeaderCell>Admins</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {vendors.map((vendor) => (
              <Table.Row key={vendor.vendor_id}>
                <Table.Cell>{vendor.vendor_id}</Table.Cell>
                <Table.Cell>{vendor.vendor_name}</Table.Cell>
                <Table.Cell>
                  {vendor.admins.map((admin, index) => (
                    <div key={index}>
                      <p>
                        {admin.first_name} {admin.last_name} - {admin.email}
                      </p>
                    </div>
                  ))}
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/vendors/${vendor.vendor_id}`}>
                    <Button variant="secondary" size="small">
                      Edit
                    </Button>
                  </Link>
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
