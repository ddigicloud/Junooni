// import { Link } from '@tanstack/react-router'
// import { useEffect, useState } from 'react'
// import { useNavigate } from '@tanstack/react-router'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { Button } from '@/components/ui/button'
// import {
//   Badge,
//   CreditCard,
//   LogOut,
//   User,
//   HelpCircle,
// } from 'lucide-react'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'

// type Vendor = {
//   name: string
//   handle: string
//   logo?: string
// }

// export function ProfileDropdown() {
//   const [vendor, setVendor] = useState<Vendor | null>(null)
//   const navigate = useNavigate()

//   const handleLogout = () => {
//     localStorage.removeItem('auth_token')
//     localStorage.clear()
//     navigate({ to: '/sign-in' })
//   }

//   useEffect(() => {
//     const fetchVendor = async () => {
//       const token = localStorage.getItem('vendorToken')
//       try {
//         const response = await fetch(
//           `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`,
//           {
//             method: 'GET',
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         )

//         if (!response.ok) {
//           const text = await response.text()
//           throw new Error('Failed to fetch vendor: ' + text)
//         }

//         const data = await response.json()
//         setVendor(data.vendor)
//       } catch (err) {
//         console.error('Error fetching vendor:', err)
//       }
//     }

//     fetchVendor()
//   }, [])

//   return (
//     <DropdownMenu modal={false}>
//       <DropdownMenuTrigger asChild>
//         <Button variant='ghost' className='relative w-8 h-8 rounded-full'>
//           <Avatar className='w-8 h-8'>
//             <AvatarImage src={vendor?.logo || ''} alt={vendor?.name || 'Vendor'} />
//             <AvatarFallback>
//               {vendor?.name?.charAt(0).toUpperCase() || 'V'}
//             </AvatarFallback>
//           </Avatar>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent className='w-56' align='end' forceMount>
//         {vendor ? (
//           <DropdownMenuLabel className='font-normal'>
//             <div className='flex flex-col space-y-1'>
//               <p className='text-sm font-medium leading-none'>{vendor.name}</p>
//               <p className='text-xs leading-none text-muted-foreground'>
//                 @{vendor.handle}
//               </p>
//             </div>
//           </DropdownMenuLabel>
//         ) : (
//           <DropdownMenuLabel className='font-normal'>
//             <div className='flex flex-col space-y-1'>
//               <p className='text-sm font-medium leading-none'>Loading...</p>
//               <p className='text-xs leading-none text-muted-foreground'>@loading</p>
//             </div>
//           </DropdownMenuLabel>
//         )}

//         <DropdownMenuSeparator />

//         <DropdownMenuGroup>
//           <DropdownMenuItem asChild>
//             <Link to='/profile' className='flex items-center gap-2'>
//               <User className='h-4 w-4' />
//               Profile
//             </Link>
//           </DropdownMenuItem>
//           <DropdownMenuItem asChild>
//             <Link to='/payouts' className='flex items-center gap-2'>
//               <CreditCard className='h-4 w-4' />
//               Payouts
//             </Link>
//           </DropdownMenuItem>
//           <DropdownMenuItem asChild>
//             <Link to='/help-center' className='flex items-center gap-2'>
//               <HelpCircle className='h-4 w-4' />
//               Help Center
//             </Link>
//           </DropdownMenuItem>
//         </DropdownMenuGroup>

//         <DropdownMenuSeparator />

//         <DropdownMenuItem
//           onClick={handleLogout}
//           className='flex items-center gap-2'
//         >
//           <LogOut className='h-4 w-4' />
//           Log out
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }

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

type Vendor = {
  name: string
  handle: string
  logo?: string
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

export function ProfileDropdown() {
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const handleLogout = () => {
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
        
        // Validate token first
        const { isValid, hasActorId, actorId } = validateToken()
        
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
        
        // Token is valid with actor_id, fetch vendor data
        try {
          const response = await fetch(
            `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          )

          if (response.ok) {
            const data = await response.json()
            if (data?.vendor) {
              setVendor(data.vendor)
            } else {
              setVendor({
                name: 'Vendor Profile',
                handle: 'loading...',
                logo: undefined
              })
            }
          } else if (response.status === 401) {
            // Token rejected by backend (expired/invalid)
            localStorage.clear()
            navigate({ to: '/sign-in' })
            return
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

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to='/profile' className='flex items-center gap-2'>
              <User className='h-4 w-4' />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to='/payouts' className='flex items-center gap-2'>
              <CreditCard className='h-4 w-4' />
              Payouts
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to='/help-center' className='flex items-center gap-2'>
              <HelpCircle className='h-4 w-4' />
              Help Center
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className='flex items-center gap-2'
        >
          <LogOut className='h-4 w-4' />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}