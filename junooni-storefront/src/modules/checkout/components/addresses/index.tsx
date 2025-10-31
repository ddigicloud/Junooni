"use client"

import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text, useToggleState } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState, useState, useTransition } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  // Add loading states
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    startTransition(() => {
      router.push(pathname + "?step=address")
    })
  }

  const [message, formAction] = useActionState(setAddresses, null)

  // Enhanced form submission with loading state
  const handleFormSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      await formAction(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div 
      className={`overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md ${
        isPending || isSubmitting ? 'opacity-75 pointer-events-none' : ''
      }`}
    >
      {/* Loading overlay */}
      {(isPending || isSubmitting) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Spinner />
            <Text className="text-sm font-medium text-gray-600">
              {isSubmitting ? 'Saving addresses...' : 'Loading...'}
            </Text>
          </div>
        </div>
      )}
      
      <div className="relative p-6">
        <div className="flex flex-row items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              !isOpen && cart?.shipping_address 
                ? 'bg-orange-100 text-[#e65100]' 
                : isOpen 
                ? 'bg-[#e65100] text-white' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {!isOpen && cart?.shipping_address ? (
                <CheckCircleSolid className="w-5 h-5" />
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <Heading
              level="h2"
              className="text-xl font-semibold text-gray-900"
            >
              Shipping Address
            </Heading>
            {!isOpen && cart?.shipping_address && (
              <div className="px-2 py-1 text-xs font-medium text-white bg-[#e65100] rounded-full animate-in fade-in slide-in-from-left-2 duration-300">
                Completed
              </div>
            )}
          </div>
          {!isOpen && cart?.shipping_address && (
            <button
              onClick={handleEdit}
              disabled={isPending}
              className="text-[#e65100] hover:text-[#bf360c] font-medium text-sm transition-all duration-200 flex items-center gap-1 hover:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="edit-address-button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
        </div>

        {/* Smooth transition container */}
        <div className={`transition-all duration-500 ease-in-out ${
          isOpen ? 'opacity-100 max-h-none' : 'opacity-100 max-h-none'
        }`}>
          {isOpen ? (
            <form 
              action={handleFormSubmit} 
              className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500"
            >
              <div className="p-6 bg-gray-50 rounded-xl transition-all duration-300">
                <ShippingAddress
                  customer={customer}
                  checked={sameAsBilling}
                  onChange={toggleSameAsBilling}
                  cart={cart}
                />

                {!sameAsBilling && (
                  <div className="pt-8 mt-8 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-6 h-6 rounded-full bg-[#e65100] text-white flex items-center justify-center text-xs font-semibold">
                        2
                      </div>
                      <Heading
                        level="h3"
                        className="text-lg font-semibold text-gray-900"
                      >
                        Billing Address
                      </Heading>
                    </div>
                    <BillingAddress cart={cart} />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <SubmitButton 
                  className={`w-full bg-[#e65100] hover:bg-[#bf360c] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-none disabled:transform-none ${
                    isSubmitting ? 'animate-pulse' : ''
                  }`}
                  disabled={isSubmitting}
                  data-testid="submit-address-button"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </div>
                  ) : (
                    <>
                      Continue to Delivery Options
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </SubmitButton>
                <ErrorMessage error={message} data-testid="address-error-message" />
              </div>
            </form>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {cart && cart.shipping_address ? (
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-700" data-testid="shipping-address-summary">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#e65100] rounded-full animate-pulse"></div>
                      <Text className="font-medium text-gray-900">Shipping Address</Text>
                    </div>
                    <div className="p-4 space-y-1 transition-all duration-300 rounded-lg bg-gray-50 hover:bg-gray-100">
                      <Text className="font-medium text-gray-900">
                        {cart.shipping_address.first_name} {cart.shipping_address.last_name}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {cart.shipping_address.address_1} {cart.shipping_address.address_2}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {cart.shipping_address.postal_code}, {cart.shipping_address.city}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {cart.shipping_address.country_code?.toUpperCase()}
                      </Text>
                    </div>
                  </div>

                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100" data-testid="shipping-contact-summary">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#e65100] rounded-full animate-pulse delay-75"></div>
                      <Text className="font-medium text-gray-900">Contact Information</Text>
                    </div>
                    <div className="p-4 space-y-1 transition-all duration-300 rounded-lg bg-gray-50 hover:bg-gray-100">
                      <Text className="text-sm text-gray-600">
                        {cart.shipping_address.phone}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {cart.email}
                      </Text>
                    </div>
                  </div>

                  <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-700 delay-200" data-testid="billing-address-summary">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#e65100] rounded-full animate-pulse delay-150"></div>
                      <Text className="font-medium text-gray-900">Billing Address</Text>
                    </div>
                    <div className="p-4 transition-all duration-300 rounded-lg bg-gray-50 hover:bg-gray-100">
                      {sameAsBilling ? (
                        <Text className="text-sm text-gray-600">
                          Same as shipping address
                        </Text>
                      ) : (
                        <div className="space-y-1">
                          <Text className="font-medium text-gray-900">
                            {cart.billing_address?.first_name} {cart.billing_address?.last_name}
                          </Text>
                          <Text className="text-sm text-gray-600">
                            {cart.billing_address?.address_1} {cart.billing_address?.address_2}
                          </Text>
                          <Text className="text-sm text-gray-600">
                            {cart.billing_address?.postal_code}, {cart.billing_address?.city}
                          </Text>
                          <Text className="text-sm text-gray-600">
                            {cart.billing_address?.country_code?.toUpperCase()}
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3">
                    <Spinner />
                    <Text className="text-sm text-gray-600">Loading address information...</Text>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Addresses