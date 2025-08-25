// import { useNavigate, useRouter } from '@tanstack/react-router'
// import { Button } from '@/components/ui/button'

// export default function NotFoundError() {
//   const navigate = useNavigate()
//   const { history } = useRouter()
//   return (
//     <div className='h-svh'>
//       <div className='flex flex-col items-center justify-center w-full h-full gap-2 m-auto'>
//         <h1 className='text-[7rem] font-bold leading-tight'>404</h1>
//         <span className='font-medium'>Oops! Page Not Found!</span>
//         <p className='text-center text-muted-foreground'>
//           It seems like the page you're looking for <br />
//           does not exist or might have been removed.
//         </p>
//         <div className='flex gap-4 mt-6'>
//           <Button variant='outline' onClick={() => history.go(-1)}>
//             Go Back
//           </Button>
//           <Button onClick={() => navigate({ to: '/' })}>Back to Home</Button>
//         </div>
//       </div>
//     </div>
//   )
// }


import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Search, FileX } from 'lucide-react'

export default function NotFoundError() {
  const navigate = useNavigate()
  const { history } = useRouter()

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-2xl mx-auto space-y-8 text-center">
        {/* Animated 404 with brand color */}
        <div className="relative">
          <div className="absolute inset-0 animate-pulse">
            <div className="w-32 h-32 mx-auto bg-orange-100 rounded-full opacity-50"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-center mb-6">
              <FileX className="w-16 h-16 text-[#e65100] animate-bounce" />
            </div>
            <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#e65100] to-orange-400 leading-none tracking-tight">
              404
            </h1>
          </div>
        </div>

        {/* Error message */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold md:text-3xl text-slate-800">
            Oops! Page Not Found
          </h2>
          <p className="max-w-md mx-auto text-lg leading-relaxed text-slate-600">
            The page you're looking for seems to have wandered off into the digital void. 
            Don't worry, it happens to the best of us!
          </p>
        </div>

        {/* Suggestion box */}
        <div className="max-w-md p-6 mx-auto bg-white border shadow-lg rounded-2xl border-slate-200">
          <h3 className="flex items-center justify-center gap-2 mb-3 font-semibold text-slate-800">
            <Search className="w-5 h-5 text-[#e65100]" />
            What you can do:
          </h3>
          <ul className="space-y-2 text-sm text-left text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e65100] mt-2 flex-shrink-0"></span>
              Check the URL for any typos
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e65100] mt-2 flex-shrink-0"></span>
              Go back to the previous page
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e65100] mt-2 flex-shrink-0"></span>
              Visit our homepage
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={() => history.go(-1)}
            className="group border-slate-300 hover:border-[#e65100] hover:text-[#e65100] transition-all duration-200 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
            Go Back
          </Button>
          <Button 
            onClick={() => navigate({ to: '/dashboard' })}
            className="bg-[#e65100] hover:bg-[#d84315] text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto group"
          >
            <Home className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
            Back to Dashboard
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center pt-8 space-x-4 opacity-30">
          <div className="w-2 h-2 rounded-full bg-[#e65100] animate-ping"></div>
          <div className="w-2 h-2 rounded-full bg-[#e65100] animate-ping" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-[#e65100] animate-ping" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[#e65100] opacity-5 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#e65100] opacity-3 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  )
}