import CategoryPage from '@/features/productCatalog/components/category'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute(
  '/_authenticated/productCatalog/category/$slug/',
)({
  component: CategoryPage,
})
