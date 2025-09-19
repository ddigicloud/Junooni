import { Link } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { IconHelp } from '@tabler/icons-react'
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  User,
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

// Utility function to decode JWT token and check for actor_id
const checkTokenForActorId = () => {
  try {
    const token = localStorage.getItem('vendorToken');
    if (!token) return { hasActorId: false, actorId: null };

    // Decode JWT token (assuming it's base64 encoded)
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    
    const actorId = payload.actor_id || payload.sub || payload.id;
    return { 
      hasActorId: !!actorId, 
      actorId: actorId 
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return { hasActorId: false, actorId: null };
  }
};

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
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  
  const handleLogout = () => {
    localStorage.clear() // or remove specific keys like 'auth_token' & 'vendorToken'
    navigate({ to: '/sign-in' })
  }
  
  useEffect(() => {
    const validateAndFetchVendor = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("vendorToken")
        
        if (!token) {
          console.error("No vendor token found")
          navigate({ to: '/sign-in' })
          return
        }
        
        // Check if token has actor_id
        const { hasActorId, actorId } = checkTokenForActorId()
        
        if (!hasActorId) {
          console.log("No actor_id in token. Redirecting to onboarding.")
          window.location.href = '/onboarding?step=basic-info'
          return
        }
        
        console.log("Valid vendor token found with actor_id:", actorId)
        
        // Only fetch vendor data if token is valid (has actor_id)
        // This call is now just for getting display data, not for validation
        try {
          const res = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          })

          if (res.ok) {
            const data = await res.json()
            if (data?.vendor) {
              setVendor(data.vendor)
            } else {
              // Even if API fails, we know user is valid from token
              // Set fallback vendor data
              setVendor({
                name: 'Vendor Profile',
                handle: 'loading...',
                logo: undefined
              })
            }
          } else {
            // API failed but token is valid, set fallback
            console.warn("Failed to fetch vendor profile, but token is valid")
            setVendor({
              name: 'Vendor Profile',
              handle: 'loading...',
              logo: undefined
            })
          }
        } catch (apiError) {
          console.error("API error:", apiError)
          // Even if API fails, we know user is valid from token
          setVendor({
            name: 'Vendor Profile',
            handle: 'loading...',
            logo: undefined
          })
        }
        
      } catch (err) {
        console.error("Token validation error:", err)
        // If token validation fails, redirect to sign-in
        navigate({ to: '/sign-in' })
      } finally {
        setIsLoading(false)
      }
    }

    validateAndFetchVendor()
  }, [navigate])

  // Show loading state while validating
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' disabled>
            <Avatar className='w-8 h-8 rounded-lg'>
              <AvatarFallback className='rounded-lg'>...</AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-sm leading-tight text-left'>
              <span className='font-semibold truncate'>Loading...</span>
              <span className='text-xs truncate'>Validating...</span>
            </div>
            <ChevronsUpDown className='ml-auto size-4' />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='w-8 h-8 rounded-lg'>
                <AvatarImage src={vendor?.logo || ''} alt={vendor?.name || 'Vendor'} />
                <AvatarFallback className='rounded-lg'>
                  {vendor?.name?.charAt(0).toUpperCase() || 'V'}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-sm leading-tight text-left'>
                <span className='font-semibold truncate'>
                  {vendor?.name || 'Vendor Profile'}
                </span>
                <span className='text-xs truncate'>
                  @{vendor?.handle || 'loading...'}
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
                    {vendor?.name || 'Vendor Profile'}
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
                  <User />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/payouts'>
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