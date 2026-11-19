import { Table, Container, Heading, Button, Text, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BuildingsSolid } from "@medusajs/icons"
import { Link } from "react-router-dom"
import { SendEmailModal } from "./send-email-modal"
import type { Vendor } from "./send-email-modal"

const StoreModeCell = ({ vendor }: { vendor: Vendor }) => {
  const both = vendor.sell_on_marketplace && vendor.sell_on_own_store

  if (both) {
    return (
      <div className="flex flex-col gap-1">
        <Badge color="orange" size="small">Marketplace</Badge>
        <Badge color="green" size="small">Own store</Badge>
      </div>
    )
  }
  if (vendor.sell_on_own_store) return <Badge color="green" size="small">Own store</Badge>
  if (vendor.sell_on_marketplace) return <Badge color="orange" size="small">Marketplace</Badge>
  return <Badge color="grey" size="small">Not set</Badge>
}

const VendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set())
  const [showEmailModal, setShowEmailModal] = useState(false)

  useEffect(() => { fetchVendors() }, [])

  const fetchVendors = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/vendors`)
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      if (data.vendors && Array.isArray(data.vendors)) {
        setVendors(data.vendors)
      } else {
        setError("Received unexpected data format from API")
        setVendors([])
      }
    } catch (error) {
      setError(`Failed to load vendors: ${error instanceof Error ? error.message : "Unknown error"}`)
      setVendors([])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVendor = (id: string) => {
    setSelectedVendors(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedVendors.size === vendors.length) {
      setSelectedVendors(new Set())
    } else {
      setSelectedVendors(new Set(vendors.map(v => v.id)))
    }
  }

  const openEmailModalForAll = () => {
    setSelectedVendors(new Set()) // clear so modal defaults to "all"
    setShowEmailModal(true)
  }

  const renderLogo = (vendor: Vendor) => {
    if (vendor.logo) {
      return (
        <div className="flex items-center justify-center w-10 h-10 overflow-hidden border rounded">
          <img
            src={vendor.logo}
            alt={`${vendor.name} logo`}
            className="object-contain max-w-full max-h-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = "none"
              target.parentElement!.textContent = vendor.name.substring(0, 2).toUpperCase()
              target.parentElement!.classList.add("bg-gray-100", "text-gray-500")
            }}
          />
        </div>
      )
    }
    return (
      <div className="flex items-center justify-center w-10 h-10 text-gray-500 bg-gray-100 rounded">
        {vendor.name.substring(0, 2).toUpperCase()}
      </div>
    )
  }

  const marketplaceCount = vendors.filter((v) => v.sell_on_marketplace).length
  const ownStoreCount = vendors.filter((v) => v.sell_on_own_store).length
  const notSetCount = vendors.filter((v) => !v.sell_on_marketplace && !v.sell_on_own_store).length
  const allSelected = vendors.length > 0 && selectedVendors.size === vendors.length
  const someSelected = selectedVendors.size > 0 && !allSelected

  return (
    <Container>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">Vendors</Heading>
        <div className="flex items-center gap-2">
          {/* Send to selected — only shown when rows are checked */}
          {selectedVendors.size > 0 && (
            <Button
              variant="secondary"
              onClick={() => setShowEmailModal(true)}
            >
              Email selected ({selectedVendors.size})
            </Button>
          )}
          {/* Always-visible "Email all" shortcut */}
          {!isLoading && vendors.length > 0 && (
            <Button variant="secondary" onClick={openEmailModalForAll}>
              Email all vendors
            </Button>
          )}
          <Link to="/vendors/register">
            <Button variant="primary">Create Vendor</Button>
          </Link>
        </div>
      </div>

      {/* Store mode summary */}
      {!isLoading && !error && vendors.length > 0 && (
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border rounded-lg">
            <Badge color="orange" size="small">Marketplace</Badge>
            <Text className="text-sm font-medium">{marketplaceCount}</Text>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border rounded-lg">
            <Badge color="green" size="small">Own store</Badge>
            <Text className="text-sm font-medium">{ownStoreCount}</Text>
          </div>
          {notSetCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border rounded-lg">
              <Badge color="grey" size="small">Not set</Badge>
              <Text className="text-sm font-medium">{notSetCount}</Text>
            </div>
          )}
        </div>
      )}

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
              {/* Select-all checkbox */}
              <Table.HeaderCell className="w-10">
                <input
                  type="checkbox"
                  className="accent-black cursor-pointer"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected }}
                  onChange={toggleAll}
                  title={allSelected ? "Deselect all" : "Select all"}
                />
              </Table.HeaderCell>
              <Table.HeaderCell>Logo</Table.HeaderCell>
              <Table.HeaderCell>Vendor Name</Table.HeaderCell>
              <Table.HeaderCell>Handle</Table.HeaderCell>
              <Table.HeaderCell>Store mode</Table.HeaderCell>
              <Table.HeaderCell>Admins</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {vendors.map((vendor) => (
              <Table.Row
                key={vendor.id}
                className={selectedVendors.has(vendor.id) ? "bg-blue-50/50" : undefined}
              >
                <Table.Cell>
                  <input
                    type="checkbox"
                    className="accent-black cursor-pointer"
                    checked={selectedVendors.has(vendor.id)}
                    onChange={() => toggleVendor(vendor.id)}
                  />
                </Table.Cell>
                <Table.Cell>{renderLogo(vendor)}</Table.Cell>
                <Table.Cell>
                  <div>
                    <Text className="font-medium">{vendor.name}</Text>
                    <Text className="text-xs text-gray-500">{vendor.id.substring(0, 10)}...</Text>
                  </div>
                </Table.Cell>
                <Table.Cell>{vendor.handle || "-"}</Table.Cell>
                <Table.Cell>
                  <StoreModeCell vendor={vendor} />
                </Table.Cell>
                <Table.Cell>
                  {vendor.admins && vendor.admins.length > 0 ? (
                    <div className="space-y-1">
                      {vendor.admins.map((admin, index) => (
                        <div key={index} className="text-sm">
                          {admin.first_name || admin.last_name ? (
                            <Text>
                              {[admin.first_name, admin.last_name].filter(Boolean).join(" ")} —{" "}
                              {admin.email}
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
                      <Button variant="secondary" size="small">View</Button>
                    </Link>
                    <Link to={`/vendors/${vendor.id}/edit`}>
                      <Button variant="secondary" size="small">Edit</Button>
                    </Link>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {/* Email modal — rendered at root level so it overlays everything */}
      {showEmailModal && (
        <SendEmailModal
          vendors={vendors}
          selectedIds={selectedVendors}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </Container>
  )
}

export default VendorsPage

export const config = defineRouteConfig({
  label: "Vendors",
  icon: BuildingsSolid,
})