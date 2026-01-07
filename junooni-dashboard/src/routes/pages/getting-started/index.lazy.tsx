import { createLazyFileRoute } from '@tanstack/react-router'
import GettingStartedPage from '@/features/getting-started'

export const Route = createLazyFileRoute('/pages/getting-started/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <GettingStartedPage />
}
