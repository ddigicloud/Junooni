import { createLazyFileRoute } from '@tanstack/react-router'
import CreatingProductsPage from '@/features/creating-products'

export const Route = createLazyFileRoute('/pages/creating-products/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreatingProductsPage />
}
