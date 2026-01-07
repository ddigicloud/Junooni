import { createLazyFileRoute } from '@tanstack/react-router'
import ForCreatorsPage from '@/features/for-creators'

export const Route = createLazyFileRoute('/pages/for-creators/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ForCreatorsPage />;
}
