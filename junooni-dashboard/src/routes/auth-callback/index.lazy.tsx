import { createLazyFileRoute } from '@tanstack/react-router'
import GoogleAuthCallback from '@/features/auth-callback'

export const Route = createLazyFileRoute('/auth-callback/')({
  component: GoogleAuthCallback,
})
