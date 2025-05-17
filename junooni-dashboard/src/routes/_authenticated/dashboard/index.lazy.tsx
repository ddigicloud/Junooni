import DashboardPage from '@/features/dashboard'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/dashboard/')({
  component: DashboardPage,
})


