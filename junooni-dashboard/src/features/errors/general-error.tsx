import { useNavigate, useRouter } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { RefreshCw, Home, ArrowLeft, AlertTriangle, Wrench } from 'lucide-react'
import { useState, useEffect } from 'react'

interface GeneralErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  minimal?: boolean
}

export default function GeneralError({
  className,
  minimal = false,
}: GeneralErrorProps) {
  const navigate = useNavigate()
  const { history } = useRouter()
  const [isRetrying, setIsRetrying] = useState(false)

  // Animation trigger
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleRetry = async () => {
    setIsRetrying(true)
    // Simulate retry attempt
    await new Promise(resolve => setTimeout(resolve, 1500))
    window.location.reload()
  }

  const handleGoBack = () => {
    history.go(-1)
  }

  const handleGoHome = () => {
    navigate({ to: '/' })
  }

  return (
    <div className={cn('min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-orange-50', className)}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute rounded-full -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-100 to-orange-200 opacity-30 blur-3xl" />
        <div className="absolute rounded-full -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-100 to-orange-200 opacity-30 blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-16">
        <div className={cn(
          'w-full max-w-md text-center transition-all duration-1000 transform',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        )}>
          
          {/* Error Icon & Number */}
          <div className="flex flex-col items-center mb-8">
            {!minimal && (
              <div className="relative mb-6">
                <div className="absolute inset-0 scale-110 rounded-full bg-gradient-to-r from-orange-600 to-red-600 opacity-20 blur-xl" />
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full shadow-xl bg-gradient-to-r from-orange-500 to-red-500">
                  <AlertTriangle className="w-12 h-12 text-white animate-pulse" />
                </div>
              </div>
            )}
            
            {!minimal && (
              <div className="relative">
                <h1 className="font-bold leading-none tracking-tight text-transparent text-8xl md:text-9xl bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text">
                  500
                </h1>
                <div className="absolute -inset-2 bg-gradient-to-r from-orange-600 to-red-600 opacity-20 blur-2xl -z-10" />
              </div>
            )}
          </div>

          {/* Error Message */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-center mb-4 space-x-2">
              <Wrench className="w-5 h-5 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Something went wrong
              </h2>
            </div>
            
            <p className="text-lg leading-relaxed text-gray-600">
              We're experiencing some technical difficulties. 
            </p>
            <p className="max-w-sm mx-auto text-sm text-gray-500">
              Our team has been notified and we're working to fix this issue as quickly as possible.
            </p>
          </div>

          {/* Status indicators */}
          <div className="flex items-center justify-center mb-8 space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span>Service disrupted</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span>Team notified</span>
            </div>
          </div>

          {/* Action Buttons */}
          {!minimal && (
            <div className="space-y-4">
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="flex items-center space-x-2 text-white transition-all duration-200 transform shadow-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 hover:shadow-xl hover:scale-105"
                >
                  <RefreshCw className={cn('w-4 h-4', isRetrying && 'animate-spin')} />
                  <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleGoHome}
                  className="flex items-center space-x-2 text-orange-700 transition-all duration-200 border-orange-200 shadow-sm hover:bg-orange-50 hover:border-orange-300 hover:shadow-md"
                >
                  <Home className="w-4 h-4" />
                  <span>Back to Home</span>
                </Button>
              </div>
              
              <Button
                variant="ghost"
                onClick={handleGoBack}
                className="flex items-center space-x-2 text-gray-500 transition-all duration-200 hover:text-gray-700 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </Button>
            </div>
          )}

          {/* Error Code */}
          <div className="pt-8 mt-12 border-t border-gray-200">
            <div className="space-y-1 text-xs text-gray-400">
              <p>Error Reference: #500-{Date.now().toString().slice(-6)}</p>
              <p>If the problem persists, please contact our support team</p>
            </div>
          </div>

          {/* Optional: Support contact */}
          <div className="mt-4">
            <button 
              onClick={() => window.location.href = 'mailto:support@junooni.com'}
              className="text-xs text-orange-600 underline transition-colors duration-200 hover:text-orange-700 underline-offset-2"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Animated background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute w-1 h-1 bg-orange-600 rounded-full top-1/4 left-1/4 animate-ping" style={{ animationDelay: '0s' }} />
        <div className="absolute w-1 h-1 bg-orange-600 rounded-full top-3/4 right-1/4 animate-ping" style={{ animationDelay: '1s' }} />
        <div className="absolute w-1 h-1 bg-orange-600 rounded-full top-1/2 left-3/4 animate-ping" style={{ animationDelay: '2s' }} />
        <div className="absolute w-1 h-1 bg-orange-600 rounded-full bottom-1/4 left-1/2 animate-ping" style={{ animationDelay: '3s' }} />
      </div>
    </div>
  )
}
