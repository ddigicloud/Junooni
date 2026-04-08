import CollectionsPage from '@/features/collections'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/store/collections/')({
  component: CollectionsPage,
})
