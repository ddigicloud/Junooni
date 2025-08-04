"use client"

import { HttpTypes } from "@medusajs/types"
import { useEffect, useMemo, useState } from "react"
import { applyLoyaltyPointsOnCart } from "../../../../lib/data/cart"
import { removeLoyaltyPointsOnCart } from "../../../../lib/data/cart"
import { getLoyaltyPoints } from "../../../../lib/data/customer"
import { Button, Heading } from "@medusajs/ui"
import Link from "next/link"

type LoyaltyPointsProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

const LoyaltyPoints = ({ cart }: LoyaltyPointsProps) => {
  const isLoyaltyPointsPromoApplied = useMemo(() => {
    return cart.promotions.find(
      (promo) => promo.id === cart.metadata?.loyalty_promo_id
    ) !== undefined
  }, [cart])
  
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getLoyaltyPoints()
      .then((points) => {
        console.log(points)
        setLoyaltyPoints(points)
      })
  }, [])

  const handleTogglePromotion = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (!isLoyaltyPointsPromoApplied) {
        await applyLoyaltyPointsOnCart()
      } else {
        await removeLoyaltyPointsOnCart()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      {/* <div className="flex items-center justify-between mb-4">
        <Heading className="text-lg font-medium text-gray-900">
          Loyalty Points
        </Heading>
        {loyaltyPoints !== null && (
          <span className="text-sm text-gray-600">
            {loyaltyPoints.toLocaleString()} points available
          </span>
        )}
      </div> */}

      {loyaltyPoints === null && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-700 mb-3">
            Sign in to your account to earn and redeem loyalty points on this order.
          </p>
          <Link 
            href="/account" 
            className="inline-flex items-center text-sm font-medium text-[#e65100] hover:text-[#d84400] transition-colors"
          >
            Sign in to account →
          </Link>
        </div>
      )}

      {loyaltyPoints !== null && (
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-[#e65100] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Loyalty Points
                </p>
                <p className="text-xs text-gray-600">
                  You have {loyaltyPoints.toLocaleString()} points
                </p>
              </div>
            </div>
            
            <Button
              variant={isLoyaltyPointsPromoApplied ? "secondary" : "default"}
              size="sm"
              onClick={handleTogglePromotion}
              disabled={isLoading}
              className={`
                ${isLoyaltyPointsPromoApplied 
                  ? 'bg-white border-gray-300 text-orange-700 hover:bg-gray-50 p-2' 
                  : 'bg-[#e65100] hover:bg-[#d84400] text-white border-[#e65100] p-2'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                min-w-[100px] text-sm font-medium
              `}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ...
                </span>
              ) : (
                `${isLoyaltyPointsPromoApplied ? "Remove" : "Apply"}`
              )}
            </Button>
          </div>

          {isLoyaltyPointsPromoApplied && (
            <div className="flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="ml-2 text-sm text-green-700 font-medium">
                Loyalty points applied to your order
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LoyaltyPoints