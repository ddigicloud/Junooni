import { createLazyFileRoute } from '@tanstack/react-router'
import CreatorStorePage from '@/features/creator-store'

export const Route = createLazyFileRoute('/pages/creator-store/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreatorStorePage />
}
