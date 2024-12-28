import { Table, Container, Heading, Button } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { TagSolid } from "@medusajs/icons"
import { Link } from "react-router-dom"

// Define the Brand interface
interface Brand {
  id: string
  name: string
  handle: string
  created_at: string
  updated_at: string
}

const BrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const response = await fetch(`/admin/brand`, {
        credentials: "include",
      })
      const data = await response.json()
      setBrands(data.brands)
    } catch (error) {
      console.error("Error fetching brands:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <Heading level="h1">Brands</Heading>
        <Link to="/brand/new">
          <Button variant="primary">Create Brand</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          Loading brands...
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Handle</Table.HeaderCell>
              <Table.HeaderCell>Created At</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {brands.map((brand) => (
              <Table.Row key={brand.id}>
                <Table.Cell>{brand.id}</Table.Cell>
                <Table.Cell>{brand.name}</Table.Cell>
                <Table.Cell>{brand.handle}</Table.Cell>
                <Table.Cell>
                  {new Date(brand.created_at).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/brand/${brand.id}`}>
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

export default BrandsPage

export const config = defineRouteConfig({
  label: "Brands",
  icon: TagSolid,
})