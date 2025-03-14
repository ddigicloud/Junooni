import EditProduct from '@/features/products/components/edit-product'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/products/$id')({
  component: EditProduct,
})

