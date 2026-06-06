// junooni-dashboard/src/routes/_authenticated/store/membership/index.lazy.tsx
import { createLazyFileRoute } from '@tanstack/react-router'
import MembershipPage from '@/features/membership'

export const Route = createLazyFileRoute('/_authenticated/membership/')({
  component: MembershipPage,
})
