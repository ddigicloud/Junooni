import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Vendor = {
  name: string
  handle: string
  logo?:string
}

export function ProfileDropdown() {
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const navigate = useNavigate()
  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.clear()
    navigate({ to: '/sign-in' })
  }
  useEffect(() => {
    const fetchVendor = async () => {
      const token = localStorage.getItem("vendorToken");
      try {
        const token = localStorage.getItem("vendorToken")
        //console.log("Using token:", token)
      
        const response = await fetch("http://localhost:9000/vendors/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      
        //console.log("Raw response:", response)
      
        if (!response.ok) {
          const text = await response.text()
          //console.error("Server returned error:", text)
          throw new Error("Failed to fetch vendor")
        }
      
        const data = await response.json()
        setVendor(data.vendor)
      } catch (err) {
        //console.error("Error fetching vendor:", err)
      }
          
    };
  
    fetchVendor();
  }, []);
  
  //console.log("Vendor data:", vendor)
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative w-8 h-8 rounded-full'>
          <Avatar className='w-8 h-8'>
          <AvatarImage src={vendor?.logo || ''} alt={vendor?.name || 'Vendor'} />
            <AvatarFallback>{vendor?.name?.charAt(0).toUpperCase() || 'V'} </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        {/* <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>satnaing</p>
            <p className='text-xs leading-none text-muted-foreground'>
              satnaingdev@gmail.com
            </p>
          </div>
        </DropdownMenuLabel> */}
          {vendor ? (
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
                <p className='text-sm font-medium leading-none'>Loading...</p>
                <p className='text-xs leading-none text-muted-foreground'>@loading</p>
              </div>
            </DropdownMenuLabel>
          )}

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to='/settings'>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to='/settings'>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to='/settings'>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>New Team</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
