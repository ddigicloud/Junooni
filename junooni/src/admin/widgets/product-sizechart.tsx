import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { clx, Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"

type AdminProductSizeChart = AdminProduct & {
  sizechart?: {
    id: string
    chart_url: string
  }
}

const ProductSizeChartWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const { data: queryResult } = useQuery<{ product: AdminProductSizeChart }>({
    queryFn: () =>
      sdk.admin.product.retrieve(product.id, {
        fields: "+sizechart.*",
      }),
    queryKey: [["product", product.id]],
  })

  const sizeChartUrl = queryResult?.product?.sizechart?.chart_url

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h3">Size Chart</Heading>
        </div>
      </div>
      <div className={clx("text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4")}>
        <Text size="small" weight="plus" leading="compact">
          Chart URL
        </Text>
        <Text size="small" leading="compact" className="whitespace-pre-line text-pretty">
          {sizeChartUrl || "-"}
        </Text>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ProductSizeChartWidget
