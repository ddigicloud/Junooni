// junooni-dashboard/src/routes/_authenticated/store/billing-history/index.lazy.tsx
import { createLazyFileRoute } from "@tanstack/react-router"
import BillingHistoryPage from "@/features/billing-history"

export const Route = createLazyFileRoute("/_authenticated/store/billing-history/")({
  component: BillingHistoryPage,
})