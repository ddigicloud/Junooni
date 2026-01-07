import { createLazyFileRoute } from '@tanstack/react-router'
import AboutUsPage from '@/features/about-us'

export const Route = createLazyFileRoute('/pages/about-us/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AboutUsPage />;
}
