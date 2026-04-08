import StoreEditorPage from '@/features/store/editor'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/store/editor/')({
  component: StoreEditorPage,
})
