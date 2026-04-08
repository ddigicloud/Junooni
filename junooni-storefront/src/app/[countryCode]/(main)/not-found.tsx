"use client"

import { Text, Button } from "@medusajs/ui"
import { User, ShoppingCart, Home, ArrowUpRight, Package, Heart, Search, Sparkles } from "lucide-react"
import { Metadata } from "next"
import Link from "next/link"
import { retrieveCustomer } from "@lib/data/customer"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Spinner from "@modules/common/icons/spinner"

export const metadata: Metadata = {
  title: "Page Not Found | JUNOONI",
  description: "The page you're looking for doesn't exist",
}

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
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] w-full bg-gradient-to-br from-orange-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={36} />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  // ✅ ALWAYS show 404 page not found - regardless of login status
  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-purple-50">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-orange-200 rounded-full opacity-20 -ml-32 -mt-32 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full opacity-20 -mr-48 -mb-48 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-200 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-4xl space-y-8">
        {/* 404 Header */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="text-[120px] md:text-[180px] font-bold bg-gradient-to-br from-[#e65100] to-[#f57c00] bg-clip-text text-transparent leading-none">
              404
            </div>
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#e65100] rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-[#f57c00] rounded-full opacity-20 blur-2xl"></div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Page Not Found
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Oops! The page you're looking for seems to have wandered off. 
            Let's get you back on track.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid max-w-2xl grid-cols-1 gap-4 mx-auto sm:grid-cols-2">
          <Link href="/" className="group">
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:border-[#e65100]">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg group-hover:bg-[#e65100] transition-colors duration-200">
                  <Home className="w-6 h-6 text-[#e65100] group-hover:text-white transition-colors duration-200" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Homepage</h3>
                  <p className="text-sm text-gray-600">Start fresh from home</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/store" className="group">
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:border-[#e65100]">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg group-hover:bg-[#e65100] transition-colors duration-200">
                  <ShoppingCart className="w-6 h-6 text-[#e65100] group-hover:text-white transition-colors duration-200" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Shop Now</h3>
                  <p className="text-sm text-gray-600">Browse our products</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Customer-specific links if logged in */}
        {customer && (
          <div className="max-w-2xl p-6 mx-auto bg-white border border-gray-200 shadow-lg md:p-8 rounded-2xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <User className="w-5 h-5 text-[#e65100]" />
              <h3 className="text-lg font-semibold text-gray-900">
                Your Account
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Link href="/account" 
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-2 border-gray-200 rounded-xl hover:border-[#e65100] hover:bg-orange-50 text-gray-700 hover:text-[#e65100]">
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/account/orders" 
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-2 border-gray-200 rounded-xl hover:border-[#e65100] hover:bg-orange-50 text-gray-700 hover:text-[#e65100]">
                <Package className="w-4 h-4" />
                Orders
              </Link>
              <Link href="/account/profile" 
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-2 border-gray-200 rounded-xl hover:border-[#e65100] hover:bg-orange-50 text-gray-700 hover:text-[#e65100]">
                <User className="w-4 h-4" />
                Profile
              </Link>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="pt-6 text-center border-t border-gray-200">
          <p className="mb-4 text-gray-600">
            Need help? Our support team is here for you
          </p>
          <div className="flex items-center justify-center gap-6">
            <Link href="/contact-us" 
                  className="flex items-center gap-2 text-[#e65100] hover:text-[#d84315] font-medium transition-colors">
              Contact Us
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/support" 
                  className="flex items-center gap-2 text-[#e65100] hover:text-[#d84315] font-medium transition-colors">
              Help Center
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}