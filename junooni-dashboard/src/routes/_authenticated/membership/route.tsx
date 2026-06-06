// route.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/membership')({
  component: Outlet, // ← was () => null, change to Outlet
})
