import ProductPage from '@/features/productCatalog/components/ProductPage'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/productCatalog/$id')({
  component: ProductPage,
})
