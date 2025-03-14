import Dashboard from '@/features/dashboard'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/dashboard/')({
  component: Dashboard,
})


