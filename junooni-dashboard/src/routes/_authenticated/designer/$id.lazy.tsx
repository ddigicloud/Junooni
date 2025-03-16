import Designer from '@/features/designer'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/designer/$id')({
  component: Designer,
})
