import create from '@/features/designer/components/create'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/designer/create')({
  component: create,
})


