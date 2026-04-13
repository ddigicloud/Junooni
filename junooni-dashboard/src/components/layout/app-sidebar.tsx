import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { getSidebarData } from './data/sidebar-data'
import { X } from 'lucide-react'

import JunooniFavicon from '../../assets/favicon-3.png'
import Junoonilogo from '../../assets/junooni_logo_brand_color.png'

function SidebarHeader() {
  const { state, isMobile, setOpenMobile } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const handleClose = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <div className={`flex items-center h-16 border-b border-border/40 ${isCollapsed ? 'px-0' : 'px-4'}`}>
      <div className="flex items-center w-full h-full">
        {isCollapsed ? (
          <div className="flex items-center justify-center w-20 h-16">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg shadow-sm">
              <img
                src={JunooniFavicon}
                alt="Junooni"
                className="object-cover w-8 h-8 ml-1 filter"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center flex-1 min-w-0">
              <img src={Junoonilogo} alt="Junooni Logo" className="h-6 ml-1 -mr-0 sm:h-8 w-26" />
              <Separator orientation='vertical' className='h-6 ml-3 mr-3 w-[2px] bg-border' />
              <div className="flex flex-col items-start text-xs font-medium leading-tight text-muted-foreground">
                <span className="text-xs">Creator</span>
                <span className="text-xs">Studio</span>
              </div>
              <button
                onClick={handleClose}
                className="ml-auto p-2 rounded-md hover:bg-gray-100 transition-colors md:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [vendorId, setVendorId] = React.useState<string | undefined>()

  React.useEffect(() => {
    const token = localStorage.getItem('vendorToken')
    if (!token) return

    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        console.warn('[Sidebar] Token is not a JWT')
        return
      }
      const payload = JSON.parse(atob(parts[1]))
      const id = payload.actor_id ?? payload.app_metadata?.vendor_id
      console.log('[Sidebar] resolved vendor_id:', id)
      setVendorId(id)
    } catch (e) {
      console.warn('[Sidebar] JWT decode failed:', e)
    }
  }, [])

  const sidebarData = getSidebarData(vendorId)

  return (
    <Sidebar
      collapsible='icon'
      variant='floating'
      className="bg-white border-r shadow-sm junooni-sidebar border-border/40"
      contentClassName="px-2"
      {...props}
    >
      <SidebarHeader />

      <SidebarContent className="py-4">
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border/40">
        <NavUser user={sidebarData.user} />
      </SidebarFooter>

      <SidebarRail className="bg-white border-r border-border/40" />

      <style jsx global>{`
        .junooni-sidebar .sidebar-menubutton[data-active="true"] {
          background-color: rgba(229, 16, 0, 0.1);
          color: #e51000;
          font-weight: 500;
          border-left: 3px solid #e51000;
        }

        .junooni-sidebar .sidebar-menubutton:hover:not([data-active="true"]) {
          background-color: rgba(229, 16, 0, 0.05);
          color: #e51000;
        }

        .junooni-sidebar .sidebar-group-label {
          color: #777;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .junooni-sidebar {
          transition: width 0.2s ease-in-out;
        }

        .junooni-sidebar .favicon-container {
          transition: all 0.2s ease-in-out;
        }

        .junooni-sidebar[data-state="collapsed"] .sidebar-header {
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
      `}</style>
    </Sidebar>
  )
}