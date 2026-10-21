import { createLazyFileRoute } from '@tanstack/react-router'
import CreatingProductsPage from '@/features/footer-pages/creating-products'

export const Route = createLazyFileRoute('/pages/creating-products/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreatingProductsPage />
}
