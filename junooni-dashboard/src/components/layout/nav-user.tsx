import { Link } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useEffect, useState } from 'react'

type Vendor = {
  name: string
  handle: string
  logo?: string 
}


export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const navigate = useNavigate()
  const handleLogout = () => {
    localStorage.clear() // or remove specific keys like 'auth_token' & 'vendorToken'
    navigate({ to: '/sign-in-2' })
  }
  
useEffect(() => {
  const fetchVendor = async () => {
    const token = localStorage.getItem("vendorToken")
    try {
      const res = await fetch("http://localhost:9000/vendors/01JN475VCB34HJ702Q242JCDEZ", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()
      setVendor(data.vendor) // or setVendor(data) if it's a flat object
    } catch (err) {
      console.error("Failed to load vendor:", err)
    }
  }

  fetchVendor()
}, [])


  return (
    <SidebarMenu >
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='w-8 h-8 rounded-lg'>
                {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
                {/* <AvatarFallback className='rounded-lg'>SN</AvatarFallback> */}
              </Avatar>
              <div className='grid flex-1 text-sm leading-tight text-left'>
              <span className='font-semibold truncate'>
                {vendor?.name || 'Loading...'}
              </span>
              <span className='text-xs truncate'>
                @{vendor?.handle || '...'}
              </span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='w-8 h-8 rounded-lg'>
                <AvatarImage src={vendor?.logo || ''} alt={vendor?.name || 'Vendor'} />
                  <AvatarFallback className='rounded-lg'>
                    {vendor?.name?.charAt(0).toUpperCase() || 'V'}       
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-sm leading-tight text-left'>
                  <span className='font-semibold truncate'>
                    {vendor?.name || 'Loading...'}
                  </span>
                  <span className='text-xs truncate'>
                    @{vendor?.handle || '...'}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to='/settings/account'>
                  <BadgeCheck />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/settings'>
                  <CreditCard />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/settings/notifications'>
                  <Bell />
                  Notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
