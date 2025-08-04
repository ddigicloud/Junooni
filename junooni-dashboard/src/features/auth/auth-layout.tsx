interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center px-6 py-12'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[480px]'>
        {/* Enhanced Branding */}
        <div className='flex items-center justify-center mb-8'>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e65100] text-white shadow-xl mr-3">
            <span className="text-2xl font-black">J</span>
          </div>
          <h1 className='text-3xl font-black text-[#e65100] tracking-wide'>JUNOONI</h1>
        </div>
        
        {/* Enhanced Container */}
        <div className="relative">
          {/* Brand accent line */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[#e65100] to-[#ff8a50] rounded-full shadow-lg"></div>
          
          <div className='bg-white shadow-2xl border-0 rounded-2xl relative overflow-hidden p-8'>
            {/* Subtle gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e65100]/30 to-transparent"></div>
            
            {children}
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-[#e65100]/10 to-transparent rounded-full blur-xl"></div>
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-bl from-[#ff8a50]/10 to-transparent rounded-full blur-xl"></div>
        </div>
      </div>
    </div>
  )
}