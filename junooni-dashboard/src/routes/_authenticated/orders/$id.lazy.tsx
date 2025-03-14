import OrderDetail from '@/features/orders/components/order-details'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/orders/$id')({
  component: OrderDetail,
})


