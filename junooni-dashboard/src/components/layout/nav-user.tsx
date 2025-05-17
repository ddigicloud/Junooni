import { Link } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { IconHelp } from '@tabler/icons-react'
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
    navigate({ to: '/sign-in' })
  }
  
useEffect(() => {
  const fetchVendor = async () => {
    const token = localStorage.getItem("vendorToken")
    
    if (!token) {
      console.error("No vendor token found")
      navigate({ to: '/sign-in' })
      return
    }
    
    try {
      // Try to fetch vendor profile directly from /vendors/me
      const res = await fetch("http://localhost:9000/vendors/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      })

      // If response is not ok (e.g. 401, 404)
      if (!res.ok) {
        console.log("Vendor profile not found. Redirecting to onboarding page.")
        window.location.href = '/onboarding?step=basic-info'
        return
      }

      const data = await res.json()
      
      // Check if vendor data exists in the response
      if (!data || !data.vendor) {
        console.log("Vendor data empty. Redirecting to onboarding page.")
        window.location.href = '/onboarding?step=basic-info'
        return
      }
      
      setVendor(data.vendor)
    } catch (err) {
      console.error("Failed to load vendor:", err)
      // You might want to handle the error differently, maybe show an error state
      // instead of redirecting immediately
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
                    @{vendor?.handle || 'loading...'}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {/* <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem> */}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to='/profile'>
                  <BadgeCheck />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/settings'>
                  <CreditCard />
                  Payout
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/help-center'>
                  <IconHelp />
                  Help Center
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
