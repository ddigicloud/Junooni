import { createLazyFileRoute } from '@tanstack/react-router'
import ForCreatorsPage from '@/features/footer-pages/for-creators'

export const Route = createLazyFileRoute('/pages/for-creators/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ForCreatorsPage />;
}
