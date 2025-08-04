// import React from 'react'
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarRail,
// } from '@/components/ui/sidebar'
// import { Separator } from '@/components/ui/separator'
// import { NavGroup } from '@/components/layout/nav-group'
// import { NavUser } from '@/components/layout/nav-user'
// import { sidebarData } from './data/sidebar-data'
// import { cn } from '@/lib/utils'

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   return (
//     <Sidebar 
//       collapsible='icon' 
//       variant='floating' 
//       className="bg-white border-r shadow-sm junooni-sidebar border-border/40" 
//       contentClassName="px-2" 
//       {...props}
//     >
//       {/* Junooni Brand Header */}
//       <div className="flex items-center h-16 gap-2 px-4 border-b border-border/40">
//         <div className="flex items-center">
//           <span className="text-2xl font-bold text-[#e51000]">JUNOONI</span>
//           <Separator orientation='vertical' className='h-6 ml-4 w-[2px] bg-muted-foreground' />
//           <div className="flex flex-col items-start ml-4 text-sm font-medium leading-tight text-muted-foreground">
//             <span className="ml-2">Creator</span>
//             <span>Dashboard</span>
//           </div>
//           {/* <span className="ml-4 text-sm font-medium text-muted-foreground">Creator Dashboard</span> */}
//         </div>
//       </div>
      
//       <SidebarContent className="py-4">
//         {sidebarData.navGroups.map((props) => (
//           <NavGroup key={props.title} {...props} />
//         ))}
//       </SidebarContent>
      
//       <SidebarFooter className="p-2 border-t border-border/40">
//         <NavUser user={sidebarData.user} />
//       </SidebarFooter>
      
//       <SidebarRail className="bg-white border-r border-border/40" />
      
//       {/* Global styles for sidebar */}
//       <style jsx global>{`
//         .junooni-sidebar .sidebar-menubutton[data-active="true"] {
//           background-color: rgba(229, 16, 0, 0.1);
//           color: #e51000;
//           font-weight: 500;
//         }
        
//         .junooni-sidebar .sidebar-menubutton:hover:not([data-active="true"]) {
//           background-color: rgba(229, 16, 0, 0.05);
//         }
        
//         .junooni-sidebar .sidebar-group-label {
//           color: #777;
//           font-weight: 600;
//           font-size: 0.8rem;
//           letter-spacing: 0.03em;
//           text-transform: uppercase;
//         }
//       `}</style>
//     </Sidebar>
//   )
// }

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
import { sidebarData } from './data/sidebar-data'
import { cn } from '@/lib/utils'
// Import your Junooni favicon
import JunooniFavicon from '../../assets/favicon-3.png' // Adjust path as needed
// import CreatorJunooni from '../../../assets/junooni-creators.png'

function SidebarHeader() {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <div className={`flex items-center h-16 border-b border-border/40 ${isCollapsed ? 'px-0' : 'px-4'}`}>
      <div className="flex items-center w-full h-full">
        {isCollapsed ? (
          // Collapsed state - show only favicon
          <div className="flex w-20 h-16 items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg shadow-sm">
              <img 
                src={JunooniFavicon} 
                alt="Junooni" 
                className="w-8 h-8 object-cover filter ml-1"
              />
            </div>
          </div>
        ) : (
          // Expanded state - show full brand
          <>
            {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e51000] shadow-sm mr-3">
              <img 
                src={JunooniFavicon} 
                alt="Junooni" 
                className="h-5 w-5 object-contain filter brightness-0 invert"
              />
            </div> */}
            <div className="flex items-center min-w-0 flex-1">
              <span className="text-xl font-bold text-[#e51000] tracking-tight">JUNOONI</span>
              <Separator orientation='vertical' className='h-6 ml-3 mr-3 w-[2px] bg-border' />
              <div className="flex flex-col items-start text-xs font-medium leading-tight text-muted-foreground">
                <span className="text-xs">Creator</span>
                <span className="text-xs">Dashboard</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar 
      collapsible='icon' 
      variant='floating' 
      className="bg-white border-r shadow-sm junooni-sidebar border-border/40" 
      contentClassName="px-2" 
      {...props}
    >
      {/* Enhanced Junooni Brand Header */}
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
      
      {/* Enhanced global styles for sidebar */}
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
        
        /* Smooth transitions for sidebar state changes */
        .junooni-sidebar {
          transition: width 0.2s ease-in-out;
        }
        
        /* Enhanced favicon container styling */
        .junooni-sidebar .favicon-container {
          transition: all 0.2s ease-in-out;
        }
        
        /* Ensure proper spacing in collapsed state */
        .junooni-sidebar[data-state="collapsed"] .sidebar-header {
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
      `}</style>
    </Sidebar>
  )
}