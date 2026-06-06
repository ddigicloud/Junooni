import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Badge,
  CreditCard,
  LogOut,
  User,
  HelpCircle,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StoreModeBadge, type StorePreference } from '@/features/dashboard/components/StoreTypeModal'
import { getVendorMe, clearAuthCache } from '@/lib/authCache'

type Vendor = {
  name: string
  handle: string
  logo?: string
}

// Update component signature
type ProfileDropdownProps = {
  storePreference?: StorePreference | null
  onStoreChangeClick?: () => void
}

// Utility function to decode JWT token and check validity
const validateToken = () => {
  try {
    const token = localStorage.getItem('vendorToken');
    if (!token) return { isValid: false, hasActorId: false, actorId: null };

    // Decode JWT token
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return { isValid: false, hasActorId: false, actorId: null };
    }
    
    const actorId = payload.actor_id || payload.sub || payload.id;
    return { 
      isValid: true,
      hasActorId: !!actorId, 
      actorId: actorId 
    };
  } catch (error) {
    // Token is malformed/corrupted
    return { isValid: false, hasActorId: false, actorId: null };
  }
};

export function ProfileDropdown({ storePreference, onStoreChangeClick }: ProfileDropdownProps) {
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // ── FIX: clearAuthCache on logout so next login fetches fresh vendor data
  const handleLogout = () => {
    clearAuthCache()
    localStorage.clear()
    navigate({ to: '/sign-in' })
  }

  useEffect(() => {
    const validateAndFetchVendor = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("vendorToken")
        
        if (!token) {
          navigate({ to: '/sign-in' })
          return
        }
        
        // Validate token first (synchronous — no network needed)
        const { isValid, hasActorId } = validateToken()
        
        // If token is invalid or expired, go to sign-in
        if (!isValid) {
          localStorage.clear()
          navigate({ to: '/sign-in' })
          return
        }
        
        // If token is valid but no actor_id, go to onboarding
        if (!hasActorId) {
          navigate({ to: '/onboarding', search: { step: 'basic-info' } })
          return
        }
        
        // ── FIX: Use shared authCache instead of raw fetch
        // This deduplicates the /vendors/me call across Products.tsx,
        // ProfileDropdown, and any other component — only 1 network
        // request fires per page load, rest return from cache instantly.
        try {
          const res = await getVendorMe(token)

          if (!res) {
            // Network error — show fallback, don't redirect
            setVendor({
              name: 'Vendor Profile',
              handle: 'loading...',
              logo: undefined
            })
            return
          }

          if (res.status === 401) {
            // Token rejected by backend
            localStorage.clear()
            navigate({ to: '/sign-in' })
            return
          }

          if (res.vendor) {
            setVendor(res.vendor)
          } else {
            setVendor({
              name: 'Vendor Profile',
              handle: 'loading...',
              logo: undefined
            })
          }

        } catch (apiError) {
          console.error('Error fetching vendor:', apiError)
          setVendor({
            name: 'Vendor Profile',
            handle: 'loading...',
            logo: undefined
          })
        }
        
      } catch (err) {
        console.error('Authentication validation failed:', err)
        localStorage.clear()
        navigate({ to: '/sign-in' })
      } finally {
        setIsLoading(false)
      }
    }

    validateAndFetchVendor()
  }, [navigate])

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative w-8 h-8 rounded-full'>
          <Avatar className='w-8 h-8'>
            <AvatarImage src={vendor?.logo || ''} alt={vendor?.name || 'Vendor'} />
            <AvatarFallback>
              {vendor?.name?.charAt(0).toUpperCase() || 'V'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        {isLoading ? (
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>Loading...</p>
              <p className='text-xs leading-none text-muted-foreground'>Validating...</p>
            </div>
          </DropdownMenuLabel>
        ) : vendor ? (
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>{vendor.name}</p>
              <p className='text-xs leading-none text-muted-foreground'>
                @{vendor.handle}
              </p>
            </div>
          </DropdownMenuLabel>
        ) : (
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>Vendor Profile</p>
              <p className='text-xs leading-none text-muted-foreground'>@loading</p>
            </div>
          </DropdownMenuLabel>
        )}

        <DropdownMenuSeparator />

        {/* Mobile-only store badge */}
        {storePreference && onStoreChangeClick && (
          <div className="px-2 py-2 md:hidden">
            <StoreModeBadge pref={storePreference} onChangeClick={onStoreChangeClick} />
          </div>
        )}
        <DropdownMenuSeparator className="md:hidden" />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to='/profile' className='flex items-center gap-2'>
              <User className='w-4 h-4' />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to='/payouts' className='flex items-center gap-2'>
              <CreditCard className='w-4 h-4' />
              Payouts
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to='/help-center' className='flex items-center gap-2'>
              <HelpCircle className='w-4 h-4' />
              Help Center
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className='flex items-center gap-2'
        >
          <LogOut className='w-4 h-4' />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}