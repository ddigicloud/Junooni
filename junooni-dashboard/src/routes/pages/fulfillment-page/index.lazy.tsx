import { createLazyFileRoute } from '@tanstack/react-router'
import FulfillmentsPage from '@/features/footer-pages/fulfillment-page'

export const Route = createLazyFileRoute('/pages/fulfillment-page/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <FulfillmentsPage />
}
