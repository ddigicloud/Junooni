import CreateProduct from '@/features/products/components/create-product'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute(
  '/_authenticated/products/createproduct',
)({
  component: CreateProduct,
})

