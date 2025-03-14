import Cookies from 'js-cookie'
import { createFileRoute, Outlet, useRouter, useRouterState } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import SkipToMain from '@/components/skip-to-main'
import { useMemo } from 'react'

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
})

function RouteComponent() {
  const defaultOpen = Cookies.get('sidebar:state') !== 'false'
  const router = useRouter()
  
  // Correctly detect loading state using TanStack Router's API
  const routerState = useRouterState()
  const isPending = routerState.status === 'pending'
  
  // Use useMemo to efficiently determine sidebar visibility based on current route
  const showSidebar = useMemo(() => {
    // Get the full URL path from the router
    const path = router.state.location.pathname
    
    // Define the list of routes where sidebar should be hidden
    const hideSidebarRoutes = ['/productCatalog']
    
    // Check if the current path starts with any of the hide routes
    const shouldHideSidebar = hideSidebarRoutes.some(route => 
      path === route || path.startsWith(`${route}/`)
    ) || path === '/'
    
    // Return the inverse of shouldHideSidebar
    return !shouldHideSidebar
  }, [router.state.location.pathname]) // Only recalculate when the path changes
  
  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={showSidebar ? defaultOpen : false}>
        <SkipToMain />
        {/* Only show sidebar when showSidebar is true */}
        {showSidebar && <AppSidebar />}
        <div
          id='content'
          className={cn(
            'ml-auto w-full max-w-full',
            // Only apply sidebar offset if sidebar is shown
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
            // Loading state - display while route is changing
            <div className="flex items-center justify-center h-full w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            // Render the actual route content when loading is complete
            <Outlet />
          )}
        </div>
      </SidebarProvider>
    </SearchProvider>
  )
}