import { createLazyFileRoute } from '@tanstack/react-router'
// Import the default export
import ImprovedCreatorOnboarding from '@/features/auth/sign-up/onboarding'

export const Route = createLazyFileRoute('/(auth)/onboarding')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ImprovedCreatorOnboarding />
}
