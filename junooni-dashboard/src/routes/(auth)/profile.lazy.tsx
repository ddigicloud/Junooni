import { createLazyFileRoute } from '@tanstack/react-router'
import CreatorProfile from '@/features/auth/sign-up/profile'

export const Route = createLazyFileRoute('/(auth)/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreatorProfile />
}
