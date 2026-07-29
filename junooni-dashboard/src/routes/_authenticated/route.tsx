import Cookies from 'js-cookie'
import { createFileRoute, Outlet, useRouter, useRouterState } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import SkipToMain from '@/components/skip-to-main'
import { useMemo, useState, useEffect } from 'react'
import AIAssistant from '@/components/AIAssistant'

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
})

function RouteComponent() {
  const defaultOpen = Cookies.get('sidebar:state') !== 'false'
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [vendorId, setVendorId] = useState<string>(
    localStorage.getItem("vendorId") ?? ""
  )

  const routerState = useRouterState()
  const isPending = routerState.status === 'pending'

  const showSidebar = useMemo(() => {
    const path = router.state.location.pathname
    const hideSidebarRoutes = ['/productCatalog', '/designer', '/store/editor']
    const shouldHideSidebar = hideSidebarRoutes.some(route =>
      path === route || path.startsWith(`${route}/`)
    ) || path === '/'
    return !shouldHideSidebar
  }, [router.state.location.pathname])

  // ── Fetch vendorId once on mount ──────────────────────────────────────────
  useEffect(() => {
    const fetchVendorId = async () => {
      // Already cached — use immediately
      const cached = localStorage.getItem("vendorId")
      if (cached) {
        setVendorId(cached)
        setIsLoading(false)
        return
      }

      const token = localStorage.getItem('vendorToken')
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          setIsLoading(false)
          return
        }

        const data = await response.json()

        if (data?.vendor?.id) {
          localStorage.setItem("vendorId", data.vendor.id)
          setVendorId(data.vendor.id)
        }

        setIsLoading(false)
      } catch {
        setIsLoading(false)
      }
    }

    fetchVendorId()
  }, []) // runs once on mount

  // ── Check vendor exists + handle routing on path change ───────────────────
  useEffect(() => {
    const checkVendorExists = async () => {
      try {
        const token = localStorage.getItem('vendorToken')
        const path = router.state.location.pathname

        if (path === '/' || path.includes('/onboarding') || path.includes('/sign-in')) {
          setIsLoading(false)
          return
        }

        if (!token) {
          setIsLoading(false)
          return
        }

        const response = await fetch(
          `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          router.navigate({ to: '/onboarding', search: '?step=basic-info' } as any)
          return
        }

        const data = await response.json()

        if (!data?.vendor) {
          router.navigate({ to: '/onboarding', search: '?step=basic-info' } as any)
          return
        }

        // Keep vendorId fresh on every route change
        if (data.vendor.id) {
          localStorage.setItem("vendorId", data.vendor.id)
          setVendorId(data.vendor.id)
        }

        setIsLoading(false)
      } catch {
        setIsLoading(false)
      }
    }

    checkVendorExists()
  }, [router.state.location.pathname])

  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={showSidebar ? defaultOpen : false}>
        <SkipToMain />
        {showSidebar && <AppSidebar />}
        <div
          id='content'
          className={cn(
            'ml-auto w-full max-w-full',
            showSidebar && [
              'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
              'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            ],
            'transition-[width] duration-200 ease-linear',
            'flex h-svh flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh'
          )}
        >
          {isPending ? (
            <div className="flex items-center justify-center w-full h-full">
              <div className="w-12 h-12 border-t-2 border-b-2 border-orange-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>

        {/* JUNI AI Assistant — available on every authenticated page */}
        {vendorId && <AIAssistant vendorId={vendorId} />}

      </SidebarProvider>
    </SearchProvider>
  )
}