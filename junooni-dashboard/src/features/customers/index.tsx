import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useEffect } from 'react'
import { useToast } from "@/hooks/use-toast";
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
// import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'
import { userListSchema } from './data/schema'
import { users } from './data/users'

export default function Customers() {
  // Parse user list
  const userList = userListSchema.parse(users)
   const { toast } = useToast();
  // Add this useEffect near the top of your component, right after your state declarations
useEffect(() => {
  // Check if user is authenticated by looking for token
  const token = localStorage.getItem('vendorToken');
  
  // If no token is found, redirect to sign-in page
  if (!token) {
    // Show a toast notification
    toast({
      title: "Authentication Required",
      description: "Please sign in to access your profile.",
      variant: "destructive",
    });
    
    // Redirect to sign-in page
    window.location.href = '/sign-in';
    return;
  }
}, []); // Empty dependency array means this runs once when component mounts


  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='flex items-center ml-auto space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='flex flex-wrap items-center justify-between mb-2 space-y-2'>
          <div>
            <p className='text-muted-foreground'>
              Manage your customers here.
            </p>
          </div>
          {/* <UsersPrimaryButtons /> */}
        </div>
        <div className='flex-1 px-4 py-1 -mx-4 overflow-auto lg:flex-row lg:space-x-12 lg:space-y-0'>
          <UsersTable data={userList} columns={columns} />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
