import { createLazyFileRoute } from '@tanstack/react-router'
import CareersPage from '@/features/careers'

export const Route = createLazyFileRoute('/pages/careers/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CareersPage />;
}
