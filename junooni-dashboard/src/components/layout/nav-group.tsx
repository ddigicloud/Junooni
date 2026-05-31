import { ReactNode } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { NavCollapsible, NavItem, NavLink, type NavGroup } from './types'

// ── Tour ID map ───────────────────────────────────────────────────────────────
const TOUR_IDS: Record<string, string> = {
  'Dashboard':      'tour-sidebar-dashboard',
  'Products':       'tour-sidebar-products',
  'Orders':         'tour-sidebar-orders',
  'My Store':       'tour-sidebar-mystore',
  'My Collections': 'tour-sidebar-collections',
  'Membership':     'tour-sidebar-membership',
}

export function NavGroup({ title, items }: NavGroup) {
  const { state } = useSidebar()
  const href = useLocation({ select: (location) => location.href })
  return (
    <SidebarGroup className="mb-6">
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`
          if (!item.items)
            return <SidebarMenuLink key={key} item={item} href={href} />
          if (state === 'collapsed')
            return <SidebarMenuCollapsedDropdown key={key} item={item} href={href} />
          return <SidebarMenuCollapsible key={key} item={item} href={href} />
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="rounded-full bg-[#e51000]/10 text-[#e51000] px-2 py-0.5 text-xs font-medium">
    {children}
  </Badge>
)

// ── Plain link item ───────────────────────────────────────────────────────────
const SidebarMenuLink = ({ item, href }: { item: NavLink; href: string }) => {
  const { setOpenMobile } = useSidebar()
  const isActive = checkIsActive(href, item)
  const tourId = TOUR_IDS[item.title]
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild isActive={isActive} tooltip={item.title}
        className="my-1 transition-all duration-200 rounded-md sidebar-menubutton"
      >
        <Link id={tourId} to={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && <item.icon className={isActive ? 'text-[#e51000]' : ''} />}
          <span className="font-medium">{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

// ── Collapsible item — title navigates, chevron toggles children ──────────────
const SidebarMenuCollapsible = ({
  item,
  href,
}: {
  item: NavCollapsible
  href: string
}) => {
  const { setOpenMobile } = useSidebar()
  const isActive = checkIsActive(href, item, true)
  const tourId = TOUR_IDS[item.title]

  return (
    <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        {/* Row: icon + navigable title + chevron toggle */}
        <div
          id={tourId}
          className={[
            'flex items-center w-full my-1 rounded-md sidebar-menubutton text-sm',
            'transition-all duration-200 cursor-pointer',
            isActive
              ? 'bg-[#e51000]/10 text-[#e51000] font-normal border-l-[3px] border-[#e51000]'
              : 'hover:bg-[#e51000]/5 hover:text-[#e51000]',
          ].join(' ')}
        >
          {/* Clicking icon/label navigates */}
          <Link
            to={item.url}
            onClick={() => setOpenMobile(false)}
            className="flex items-center flex-1 gap-2 px-3 py-2 min-w-0"
          >
            {item.icon && (
              <item.icon
                className={`shrink-0 w-4 h-4 ${isActive ? 'text-[#e51000]' : ''}`}
              />
            )}
            <span className="font-medium truncate">{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
          </Link>

          {/* Chevron toggles collapse — separate click zone */}
          <CollapsibleTrigger asChild>
            <button
              className="flex items-center justify-center w-8 h-8 shrink-0 rounded-md mr-1 hover:bg-[#e51000]/10"
              onClick={(e) => e.stopPropagation()}
              aria-label="Toggle submenu"
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 ${
                  isActive ? 'text-[#e51000]' : ''
                }`}
              />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub className="pl-2 border-l-2 ml-7 border-muted">
            {item.items.map((subItem) => {
              const subIsActive = checkIsActive(href, subItem)
              const subTourId = TOUR_IDS[subItem.title]
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild isActive={subIsActive}
                    className="py-2 transition-all duration-200 rounded-md"
                  >
                    <Link
                      id={subTourId}
                      to={subItem.url}
                      onClick={() => setOpenMobile(false)}
                    >
                      {subItem.icon && (
                        <subItem.icon className={subIsActive ? 'text-[#e51000]' : ''} />
                      )}
                      <span className="font-medium">{subItem.title}</span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

// ── Collapsed sidebar → dropdown ──────────────────────────────────────────────
const SidebarMenuCollapsedDropdown = ({
  item,
  href,
}: {
  item: NavCollapsible
  href: string
}) => {
  const isActive = checkIsActive(href, item)
  const tourId = TOUR_IDS[item.title]
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            id={tourId}
            tooltip={item.title}
            isActive={isActive}
            className="my-1 transition-all duration-200 rounded-md sidebar-menubutton"
          >
            {item.icon && <item.icon className={isActive ? 'text-[#e51000]' : ''} />}
            <span className="font-medium">{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className={`ml-auto transition-transform duration-200 ${isActive ? 'text-[#e51000]' : ''}`} />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4} className="rounded-md">
          <DropdownMenuLabel className="text-[#e51000] font-medium">
            {item.title} {item.badge ? `(${item.badge})` : ''}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* First item: navigate to the parent URL */}
          <DropdownMenuItem asChild>
            <Link to={item.url} className={checkIsActive(href, { ...item, items: undefined } as any) ? 'bg-[#e51000]/10 text-[#e51000] font-medium' : ''}>
              {item.icon && <item.icon />}
              <span className="max-w-52 text-wrap">{item.title}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {item.items.map((sub) => {
            const subIsActive = checkIsActive(href, sub)
            const subTourId = TOUR_IDS[sub.title]
            return (
              <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
                <Link
                  id={subTourId}
                  to={sub.url}
                  className={subIsActive ? 'bg-[#e51000]/10 text-[#e51000] font-medium' : ''}
                >
                  {sub.icon && <sub.icon />}
                  <span className="max-w-52 text-wrap">{sub.title}</span>
                  {sub.badge && <span className="ml-auto text-xs">{sub.badge}</span>}
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
    href === item.url ||
    href.split('?')[0] === item.url ||
    !!item?.items?.filter((i) => i.url === href).length ||
    (mainNav &&
      href.split('/')[1] !== '' &&
      href.split('/')[1] === item?.url?.split('/')[1])
  )
}