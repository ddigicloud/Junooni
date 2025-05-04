import { createLazyFileRoute } from '@tanstack/react-router'
import Homepage from '@/features/auth/homepage'

export const Route = createLazyFileRoute('/(auth)/homepage')({
  component: Homepage,
})
