"use client"

import { Text, Button } from "@medusajs/ui"
import { User, ShoppingCart, Home, ArrowUpRight, Star, Heart, Zap } from "lucide-react"
import Link from "next/link"
import { retrieveCustomer } from "@lib/data/customer"
import { useEffect, useState } from "react"
import Spinner from "@modules/common/icons/spinner"

export default function NotFound() {
  const [customer, setCustomer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkCustomer = async () => {
      try {
        const customerData = await retrieveCustomer()
        setCustomer(customerData)
      } catch (error) {
        setCustomer(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkCustomer()
  }, [])

  // Show loading state to prevent hydration mismatch
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] w-full text-ui-fg-base">
        <Spinner size={36} />
      </div>
    )
  }
  
  // If user is not logged in, always show login prompt regardless of the page
  if (!customer) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 relative overflow-hidden">
        {/* Very Subtle Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/6 w-2 h-2 bg-[#e65100] opacity-20 rounded-full animate-pulse"></div>
          <div className="absolute top-2/3 right-1/5 w-3 h-3 bg-[#ff8a50] opacity-15 rounded-full animate-bounce" style={{animationDuration: '4s'}}></div>
          <div className="absolute top-1/5 right-1/3 w-1 h-1 bg-[#e65100] opacity-30 rounded-full animate-ping" style={{animationDuration: '3s'}}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <div className="w-full max-w-md space-y-8 text-center">
            {/* Animated Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-[#e65100] to-[#ff8a50] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#e65100] rounded-full animate-ping"></div>
              </div>
            </div>
            
            {/* Heading with Animation */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#e65100] to-[#ff8a50] bg-clip-text text-transparent animate-pulse">
                Welcome Back!
              </h1>
              <p className="text-lg text-gray-600 animate-fade-in">
                Please sign in to access this page and unlock your personalized experience.
              </p>
            </div>

            {/* Action Button with Hover Effects */}
            <div className="space-y-4">
              <Link href="/account" className="block w-full">
                <Button 
                  className="w-full bg-gradient-to-r from-[#e65100] to-[#ff8a50] hover:from-[#d84315] hover:to-[#e65100] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl" 
                  size="large"
                >
                  <span className="flex items-center gap-2">
                    Sign In to Your Account
                    <Zap className="w-4 h-4 animate-pulse" />
                  </span>
                </Button>
              </Link>
            </div>

            {/* Additional Links */}
            <div className="pt-6 space-y-4">
              <Link
                className="flex items-center justify-center gap-x-2 text-[#e65100] hover:text-[#d84315] transition-all duration-300 transform hover:scale-105"
                href="/"
              >
                <Home className="w-5 h-5" />
                <Text className="font-medium text-[#e65100]">Return to Homepage</Text>
              </Link>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 1s ease-out;
          }
        `}</style>
      </div>
    )
  }

  // User is logged in but page doesn't exist - show enhanced 404
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/6 animate-float">
          <Star className="w-6 h-6 text-[#e65100] opacity-10" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float" style={{animationDelay: '1s'}}>
          <Heart className="w-5 h-5 text-[#e65100] opacity-15" />
        </div>
        <div className="absolute bottom-1/4 left-1/3 animate-float" style={{animationDelay: '2s'}}>
          <Zap className="w-7 h-7 text-[#e65100] opacity-8" />
        </div>
        <div className="absolute top-1/2 right-1/6 animate-float" style={{animationDelay: '0.5s'}}>
          <ShoppingCart className="w-5 h-5 text-[#e65100] opacity-12" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="w-full max-w-2xl space-y-12 text-center">
          {/* Creative 404 Animation */}
          <div className="space-y-6">
            <div className="relative">
              {/* Main 404 with cool animation */}
              <div className="text-9xl font-black text-transparent bg-gradient-to-r from-[#e65100] via-[#ff8a50] to-[#e65100] bg-clip-text animate-gradient-x">
                404
              </div>
              
              {/* Floating Elements around 404 */}
              <div className="absolute -top-4 left-1/4 animate-bounce">
                <div className="w-4 h-4 bg-[#e65100] rounded-full opacity-60"></div>
              </div>
              <div className="absolute top-8 right-1/3 animate-bounce" style={{animationDelay: '0.5s'}}>
                <div className="w-3 h-3 bg-[#ff8a50] rounded-full opacity-80"></div>
              </div>
              <div className="absolute -bottom-2 left-1/3 animate-bounce" style={{animationDelay: '1s'}}>
                <div className="w-5 h-5 bg-[#e65100] rounded-full opacity-40"></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-800 animate-fade-in">
                Oops! Page Not Found
              </h1>
              <p className="max-w-lg mx-auto text-xl text-gray-600 animate-fade-in" style={{animationDelay: '0.3s'}}>
                The page you're looking for seems to have gone on an adventure. Let's get you back on track!
              </p>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="grid max-w-md grid-cols-1 gap-6 mx-auto sm:grid-cols-2">
            <Link href="/" className="w-full">
              <Button 
                variant="default" 
                className="w-full bg-gradient-to-r text-white from-[#e65100] to-[#ff8a50] hover:from-[#d84315] hover:to-[#e65100] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl" 
                size="large"
              >
                <Home className="w-5 h-5 mr-2" />
                Homepage
              </Button>
            </Link>
            
            <Link href="/store" className="w-full">
              <Button 
                variant="outline" 
                className="w-full border-[#e65100] text-[#e65100] hover:bg-[#e65100] hover:text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl" 
                size="large"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Shop Now
              </Button>
            </Link>
          </div>

          

          {/* Customer Account Links */}
          {customer && (
            <div className="pt-8 space-y-6 border-t border-gray-200">
              <Text className="text-lg font-semibold text-gray-700">
                Your Account
              </Text>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { href: "/account", label: "Dashboard", icon: "📊" },
                  { href: "/account/orders", label: "Orders", icon: "📦" },
                  { href: "/account/profile", label: "Profile", icon: "⚙️" }
                ].map((item, index) => (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className="px-5 py-2 bg-gradient-to-r from-[#e65100] to-[#ff8a50] hover:from-[#d84315] hover:to-[#e65100] text-white rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    <span className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="pt-8 border-t border-gray-200">
            <Text className="mb-4 text-gray-600">
              Need help? Our support team is here for you
            </Text>
            <div className="flex justify-center gap-6">
              <Link 
                href="/contact" 
                className="text-[#e65100] hover:text-[#d84315] transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
              >
                Contact Us
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <span className="text-gray-400">•</span>
              <Link 
                href="/help" 
                className="text-[#e65100] hover:text-[#d84315] transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
              >
                Help Center
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-size: 200% 200%; background-position: left center; }
          50% { background-size: 200% 200%; background-position: right center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}