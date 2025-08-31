import { createLazyFileRoute } from '@tanstack/react-router'
import PayoutPage  from '@/features/payouts'

export const Route = createLazyFileRoute('/_authenticated/payouts/')({
  component: PayoutPage,
})
