import { IconPlanet } from '@tabler/icons-react'
import { useEffect } from 'react'
import { useToast } from "@/hooks/use-toast";

export default function ComingSoon() {
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
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <IconPlanet size={72} />
        <h1 className='text-4xl font-bold leading-tight'>Coming Soon 👀</h1>
        <p className='text-center text-muted-foreground'>
          This page has not been created yet. <br />
          Stay tuned though!
        </p>
      </div>
    </div>
  )
}
