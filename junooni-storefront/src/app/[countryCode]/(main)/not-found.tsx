// import { Metadata } from "next"

// import InteractiveLink from "@modules/common/components/interactive-link"

// export const metadata: Metadata = {
//   title: "404",
//   description: "Something went wrong",
// }

// export default function NotFound() {
//   return (
//     <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
//       <h1 className="text-2xl-semi text-ui-fg-base">Page not found</h1>
//       <p className="text-small-regular text-ui-fg-base">
//         The page you tried to access does not exist.
//       </p>
//       <InteractiveLink href="/">Go to frontpage</InteractiveLink>
//     </div>
//   )
// }


"use client"

import { Text, Button } from "@medusajs/ui"
import { User, ShoppingCart, Home, ArrowUpRight } from "lucide-react"
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
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] w-full text-ui-fg-base">
        <Spinner size={36} />
      </div>
    )
  }
  
  // If user is not logged in, always show login prompt regardless of the page
  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-ui-bg-subtle rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-ui-fg-subtle" />
            </div>
          </div>
          
          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-ui-fg-base">
              Please Sign In
            </h1>
            <p className="text-ui-fg-subtle">
              You need to be logged in to access this page.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/account" className="w-full">
              <Button className="w-full" size="large">
                Sign In to Your Account
              </Button>
            </Link>
          </div>

          {/* Additional Links */}
          <div className="pt-4 space-y-2">
            <Link
              className="flex items-center justify-center gap-x-2 text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-colors"
              href="/"
            >
              <Home className="w-4 h-4 text-[#e65100]" />
              <Text className="text-[#e65100]">Return to Homepage</Text>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // User is logged in but page doesn't exist - show 404
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* 404 Illustration */}
        <div className="space-y-4">
          <div className="text-8xl font-bold text-ui-fg-subtle opacity-50">
            404
          </div>
          <h1 className="text-3xl font-semibold text-ui-fg-base">
            Page Not Found
          </h1>
          <p className="text-lg text-ui-fg-subtle max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. 
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <Link href="/" className="w-full">
            <Button variant="secondary" className="w-full" size="large">
              <Home className="w-4 h-4 mr-2" />
              Homepage
            </Button>
          </Link>
          
          <Link href="/store" className="w-full">
            <Button variant="secondary" className="w-full" size="large">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Shop Now
            </Button>
          </Link>
        </div>

        {/* Popular Categories */}
        <div className="space-y-4">
          <Text className="text-ui-fg-subtle font-medium">
            Popular Categories
          </Text>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/collections/men" 
                  className="px-4 py-2 bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover rounded-full text-sm text-ui-fg-base transition-colors">
              Men
            </Link>
            <Link href="/collections/women" 
                  className="px-4 py-2 bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover rounded-full text-sm text-ui-fg-base transition-colors">
              Women
            </Link>
            <Link href="/collections/kids" 
                  className="px-4 py-2 bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover rounded-full text-sm text-ui-fg-base transition-colors">
              Kids
            </Link>
            <Link href="/collections/official-merchandise" 
                  className="px-4 py-2 bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover rounded-full text-sm text-ui-fg-base transition-colors">
              Official Merchandise
            </Link>
          </div>
        </div>

        {/* Customer-specific links if logged in */}
        {customer && (
          <div className="space-y-4 pt-4 border-t border-ui-border-base">
            <Text className="text-ui-fg-subtle font-medium">
              Your Account
            </Text>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/account" 
                    className="px-4 py-2 bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover rounded-full text-sm text-ui-fg-base transition-colors">
                Account Dashboard
              </Link>
              <Link href="/account/orders" 
                    className="px-4 py-2 bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover rounded-full text-sm text-ui-fg-base transition-colors">
                Order History
              </Link>
              <Link href="/account/profile" 
                    className="px-4 py-2 bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover rounded-full text-sm text-ui-fg-base transition-colors">
                Profile Settings
              </Link>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="pt-6 border-t border-ui-border-base">
          <Text className="text-ui-fg-subtle mb-3">
            Need help? Contact our support team
          </Text>
          <div className="flex justify-center gap-4">
            <Link href="/contact" 
                  className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-colors flex items-center gap-1">
              Contact Us
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <span className="text-ui-fg-subtle">•</span>
            <Link href="/help" 
                  className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-colors flex items-center gap-1">
              Help Center
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}