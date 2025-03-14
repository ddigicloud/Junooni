import { createLazyFileRoute } from '@tanstack/react-router'
import ProductPage from '@/features/productCatalog/components/ProductPage'

export const Route = createLazyFileRoute(
  '/_authenticated/productCatalog/products/$id',
)({
  component: ProductPage,
})

