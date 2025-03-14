import ProductCatalog from '@/features/productCatalog'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/productCatalog/')({
  component: ProductCatalog
})


