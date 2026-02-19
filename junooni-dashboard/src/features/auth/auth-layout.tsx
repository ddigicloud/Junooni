interface Props {
  children: React.ReactNode
}

import JunooniFavicon from '../../assets/junooni-favicon.png' // Adjust path as needed
import Junoonilogo from '../../assets/junooni_logo_brand_color.png' // Adjust path as needed

export default function AuthLayout({ children }: Props) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-10'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-4 sm:space-y-6 max-w-sm sm:max-w-md'>
        {/* Enhanced Branding - Mobile Responsive */}
        <div className='flex items-center justify-center mb-2 sm:mb-4'>
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-[#e65100] text-white shadow-xl mr-2 sm:mr-3">
            <img 
              src={JunooniFavicon} 
              alt="Junooni favicon" 
              className="h-5 w-5 sm:h-10 sm:w-10 object-contain" 
            />
          </div>
          <img 
            src={Junoonilogo} 
            alt="Junooni Logo" 
            className="h-6 sm:h-8 md:h-10 w-auto object-contain max-w-[120px] sm:max-w-[160px]" 
          />
        </div>
        
        {/* Enhanced Container - Mobile Responsive */}
        <div className="relative">
          {/* Brand accent line - Responsive */}
          {/* <div className="absolute -top-4 sm:-top-6 left-1/2 transform -translate-x-1/2 w-12 sm:w-16 h-0.5 sm:h-1 bg-gradient-to-r from-[#e65100] to-[#ff8a50] rounded-full shadow-lg"></div>
           */}
          <div className='bg-white shadow-xl sm:shadow-2xl border-0 rounded-xl sm:rounded-2xl relative overflow-hidden px-0 sm:p-8'>
            {/* Subtle gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e65100]/30 to-transparent"></div>
            
            <div className="w-full max-w-none">
              {children}
            </div>
          </div>
          
          {/* Decorative elements - Scaled for mobile */}
          <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-br from-[#e65100]/10 to-transparent rounded-full blur-xl"></div>
          <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-20 sm:w-32 h-20 sm:h-32 bg-gradient-to-bl from-[#ff8a50]/10 to-transparent rounded-full blur-xl"></div>
        </div>
        
        {/* Mobile-specific bottom spacing */}
        <div className="h-4 sm:h-0"></div>
      </div>
    </div>
  )
}