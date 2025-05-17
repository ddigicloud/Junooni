import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { sidebarData } from './data/sidebar-data'
import { cn } from '@/lib/utils'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar 
      collapsible='icon' 
      variant='floating' 
      className="bg-white border-r shadow-sm junooni-sidebar border-border/40" 
      contentClassName="px-2" 
      {...props}
    >
      {/* Junooni Brand Header */}
      <div className="flex items-center h-16 gap-2 px-4 border-b border-border/40">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-[#e51000]">JUNOONI</span>
          <Separator orientation='vertical' className='h-6 ml-4 w-[2px] bg-muted-foreground' />
          <div className="flex flex-col items-start ml-4 text-sm font-medium leading-tight text-muted-foreground">
            <span className="ml-2">Creator</span>
            <span>Dashboard</span>
          </div>
          {/* <span className="ml-4 text-sm font-medium text-muted-foreground">Creator Dashboard</span> */}
        </div>
      </div>
      
      <SidebarContent className="py-4">
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      
      <SidebarFooter className="p-2 border-t border-border/40">
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      
      <SidebarRail className="bg-white border-r border-border/40" />
      
      {/* Global styles for sidebar */}
      <style jsx global>{`
        .junooni-sidebar .sidebar-menubutton[data-active="true"] {
          background-color: rgba(229, 16, 0, 0.1);
          color: #e51000;
          font-weight: 500;
        }
        
        .junooni-sidebar .sidebar-menubutton:hover:not([data-active="true"]) {
          background-color: rgba(229, 16, 0, 0.05);
        }
        
        .junooni-sidebar .sidebar-group-label {
          color: #777;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
      `}</style>
    </Sidebar>
  )
}
