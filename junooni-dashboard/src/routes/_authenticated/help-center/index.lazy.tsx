import { createLazyFileRoute } from '@tanstack/react-router'
import HelpCenter from '@/features/help-center'

export const Route = createLazyFileRoute('/_authenticated/help-center/')({
  component: HelpCenter,
})
