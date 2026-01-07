import { createLazyFileRoute } from '@tanstack/react-router'
import PrivacyPage from '@/features/privacy'

export const Route = createLazyFileRoute('/pages/privacy/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PrivacyPage />
}
