import { createLazyFileRoute } from '@tanstack/react-router'
import CreatorStorePage from '@/features/footer-pages/creator-store'

export const Route = createLazyFileRoute('/pages/creator-store/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreatorStorePage />
}
