import { createLazyFileRoute } from '@tanstack/react-router'
import MakeYourBrandPage from '@/features/make_your_brand'

export const Route = createLazyFileRoute('/pages/make_your_brand/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <MakeYourBrandPage /> 
}