import { createFileRoute } from '@tanstack/react-router'
import Homepage from '@/features/auth/homepage'

export const Route = createFileRoute('/_authenticated/')({
  component: Homepage
})
