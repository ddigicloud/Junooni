import Cookies from 'js-cookie'
import { createFileRoute, Outlet, useRouter, useRouterState } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import SkipToMain from '@/components/skip-to-main'
import { useMemo } from 'react'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
})

function RouteComponent() {
  const defaultOpen = Cookies.get('sidebar:state') !== 'false'
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  
  // Correctly detect loading state using TanStack Router's API
  const routerState = useRouterState()
  const isPending = routerState.status === 'pending'
  
  // Use useMemo to efficiently determine sidebar visibility based on current route
  const showSidebar = useMemo(() => {
    // Get the full URL path from the router
    const path = router.state.location.pathname
    
    // Define the list of routes where sidebar should be hidden
    const hideSidebarRoutes = ['/productCatalog','/designer']
    
    // Check if the current path starts with any of the hide routes
    const shouldHideSidebar = hideSidebarRoutes.some(route => 
      path === route || path.startsWith(`${route}/`)
    ) || path === '/'
    
    // Return the inverse of shouldHideSidebar
    return !shouldHideSidebar
  }, [router.state.location.pathname]) // Only recalculate when the path changes
  

  // Check if vendor exists
  useEffect(() => {
    const checkVendorExists = async () => {
      try {
        const token = localStorage.getItem('vendorToken')
        
        // if (!token) {
        //   // If no token, redirect to sign-in
        //   router.navigate({ to: '/sign-up' })
        //   return
        // }
        
        // Get the current path
        const path = router.state.location.pathname
        
        // Skip vendor check for onboarding and sign-in pages
        if (path.includes('/onboarding') || path.includes('/sign-in') || path.includes('/')) {
          setIsLoading(false)
          return
        }
        
        // Check if vendor exists using vendors/me endpoint
        const response = await fetch('${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        
        // If response is not ok or empty, redirect to onboarding
        if (!response.ok) {
          console.log("Vendor profile not found. Redirecting to onboarding page.")
            router.navigate({ to: '/onboarding', search: '?step=basic-info' } as any)
          return
        }
        
        const data = await response.json()
        
        // Check if vendor data exists in the response
        if (!data || !data.vendor) {
          console.log("Vendor data empty. Redirecting to onboarding page.")
           router.navigate({ to: '/onboarding', search: '?step=basic-info' } as any)
          return
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error("Error checking vendor existence:", error)
        setIsLoading(false)
      }
    }
    
    checkVendorExists()
  }, [router.state.location.pathname])


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
            <div className="flex items-center justify-center w-full h-full">
              <div className="w-12 h-12 border-t-2 border-b-2 border-orange-500 rounded-full animate-spin"></div>
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