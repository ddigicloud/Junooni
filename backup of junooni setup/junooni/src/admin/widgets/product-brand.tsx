import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { useEffect, useState } from "react"
import { Container, Heading } from "@medusajs/ui"

const ProductBrandWidget = ({ 
  data,
}: DetailWidgetProps<AdminProduct>) => {
  const [brand, setBrand] = useState<
    Record<string, string> | undefined
  >()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!loading) {
      return
    }

    fetch(`/admin/products/${data.id}/brand`, {
      credentials: "include",
    })
    .then((res) => res.json())
    .then(({ brand }) => {
      setBrand(brand)
      setLoading(false)
    })
  }, [loading])
  
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Brand</Heading>
      </div>
      {loading && <span>Loading...</span>}
      {brand && <span>Name: {brand.name}</span>}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.before",
})

export default ProductBrandWidget