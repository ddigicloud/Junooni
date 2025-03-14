
import Products from '@/features/productCatalog/components/Products'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute(
  '/_authenticated/productCatalog/products/',
)({
  component: Products,
})
