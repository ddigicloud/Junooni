"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { 
  medusaClient, 
  createPaymentSession,
  getCart,
  submitShippingAddress
} from "@lib/data/customer"
import { CheckCircleSolid, CreditCard, Spinner, User, ShoppingBag, Link as LinkIcon } from "@medusajs/icons"
import { Badge } from "@medusajs/ui"
import Image from "next/image"
import Link from "next/link"

const CheckoutPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [cart, setCart] = useState(null)
  const [checkoutStep, setCheckoutStep] = useState("information") // information, shipping, payment
  const [shippingMethods, setShippingMethods] = useState([])
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null)
  const [contactEmail, setContactEmail] = useState("")
  const [formErrors, setFormErrors] = useState({})
  const [processingPayment, setProcessingPayment] = useState(false)
  
  // Sample shipping form data
  const [shippingAddress, setShippingAddress] = useState({
    first_name: "",
    last_name: "",
    company: "",
    address_1: "",
    address_2: "",
    city: "",
    country_code: "us",
    province: "",
    postal_code: "",
    phone: ""
  })

  // Track when forms have been touched for validation
  const [formTouched, setFormTouched] = useState({
    contact: false,
    shipping: {
      first_name: false,
      last_name: false,
      address_1: false,
      city: false,
      postal_code: false,
      country_code: false
    }
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Simulated cart data - in a real implementation, this would come from Medusa's getCart API
  const sampleCart = {
    id: "cart_123456",
    items: [
      {
        id: "item_1",
        title: "Limited Edition Tour Tee",
        variant: { 
          title: "Size M / Black", 
          product: { 
            creator: { name: "Alex Rivera" },
            thumbnail: "/api/placeholder/120/120"
          } 
        },
        quantity: 1,
        unit_price: 4500,
        total: 4500,
      },
      {
        id: "item_2",
        title: "Signed Vinyl Album",
        variant: { 
          title: "Standard Edition", 
          product: { 
            creator: { name: "DJ Cosmos" },
            thumbnail: "/api/placeholder/120/120"
          } 
        },
        quantity: 1,
        unit_price: 6000,
        total: 6000,
      }
    ],
    shipping_total: 1200,
    subtotal: 10500,
    discount_total: 0,
    tax_total: 1050,
    total: 12750
  }
  
  const sampleShippingMethods = [
    {
      id: "sm_1",
      name: "Standard Shipping",
      price: 1200,
      data: {
        estimated_delivery: "3-5 business days"
      }
    },
    {
      id: "sm_2",
      name: "Express Shipping",
      price: 2500,
      data: {
        estimated_delivery: "1-2 business days"
      }
    }
  ]

  // Format currency for display
  const formatAmount = (amount) => {
    return `$${(amount / 100).toFixed(2)}`
  }

  // Initialize checkout
  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setIsLoading(true)
        // In real implementation, fetch cart from Medusa
        // const { cart } = await getCart()
        setCart(sampleCart)
        setShippingMethods(sampleShippingMethods)
        setSelectedShippingMethod(sampleShippingMethods[0])
        setIsLoading(false)
      } catch (error) {
        console.error("Error initializing checkout:", error)
        setIsLoading(false)
      }
    }
    
    initializeCheckout()
  }, [])
  
  // Handle shipping address form changes
  const handleShippingAddressChange = (field, value) => {
    setShippingAddress({
      ...shippingAddress,
      [field]: value
    })
    
    // Mark field as touched
    if (!formTouched.shipping[field]) {
      setFormTouched({
        ...formTouched,
        shipping: {
          ...formTouched.shipping,
          [field]: true
        }
      })
    }
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: null
      })
    }
  }
  
  // Validate shipping information
  const validateShippingInfo = () => {
    const errors = {}
    
    if (!contactEmail) errors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(contactEmail)) errors.email = "Invalid email format"
    
    if (!shippingAddress.first_name) errors.first_name = "First name is required"
    if (!shippingAddress.last_name) errors.last_name = "Last name is required"
    if (!shippingAddress.address_1) errors.address_1 = "Address is required"
    if (!shippingAddress.city) errors.city = "City is required"
    if (!shippingAddress.postal_code) errors.postal_code = "Postal code is required"
    if (!shippingAddress.country_code) errors.country_code = "Country is required"
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  // Handle submission of shipping info
  const handleSubmitShippingInfo = async (e) => {
    e.preventDefault()
    
    // Mark all fields as touched for validation
    setFormTouched({
      contact: true,
      shipping: {
        first_name: true,
        last_name: true,
        address_1: true,
        city: true,
        postal_code: true,
        country_code: true
      }
    })
    
    if (!validateShippingInfo()) {
      return
    }
    
    try {
      // In real implementation, submit to Medusa
      // await submitShippingAddress({
      //   ...shippingAddress,
      //   email: contactEmail
      // })
      
      // Move to shipping method selection
      setCheckoutStep("shipping")
    } catch (error) {
      console.error("Error submitting shipping info:", error)
    }
  }
  
  // Handle selection of shipping method
  const handleSelectShippingMethod = async (method) => {
    setSelectedShippingMethod(method)
    // In real implementation, submit to Medusa
    // await medusaClient.carts.setShippingMethod(cart.id, {
    //   option_id: method.id
    // })
  }
  
  // Handle submission of shipping method
  const handleSubmitShippingMethod = () => {
    if (!selectedShippingMethod) return
    
    // Move to payment step
    setCheckoutStep("payment")
  }
  
  // Handle submission of payment
  const handleSubmitPayment = async () => {
    try {
      setProcessingPayment(true)
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In real implementation, submit to Medusa
      // await createPaymentSession(cart.id)
      
      // Redirect to order confirmation
      router.push("/order/confirmation?order_id=order_123456")
    } catch (error) {
      console.error("Error processing payment:", error)
      setProcessingPayment(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e65100]"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="py-4 bg-white border-b">
        <div className="container px-4 mx-auto">
          <Link href="/" className="flex items-center">
            <ShoppingBag className="h-6 w-6 mr-2 text-[#e65100]" />
            <span className="text-xl font-bold">JUNOONI</span>
          </Link>
        </div>
      </header>
      
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left section - Checkout forms */}
          <div className="lg:col-span-7">
            <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
              {/* Checkout progress */}
              <div className="flex items-center mb-8">
                <div className={`flex flex-col items-center ${checkoutStep === 'information' ? 'text-[#e65100]' : (checkoutStep === 'shipping' || checkoutStep === 'payment') ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${checkoutStep === 'information' ? 'bg-[#e65100] text-white' : (checkoutStep === 'shipping' || checkoutStep === 'payment') ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {checkoutStep === 'information' ? '1' : <CheckCircleSolid />}
                  </div>
                  <span className="text-xs">Information</span>
                </div>
                
                <div className="w-12 h-px mx-1 bg-gray-300"></div>
                
                <div className={`flex flex-col items-center ${checkoutStep === 'shipping' ? 'text-[#e65100]' : checkoutStep === 'payment' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${checkoutStep === 'shipping' ? 'bg-[#e65100] text-white' : checkoutStep === 'payment' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {checkoutStep === 'shipping' ? '2' : checkoutStep === 'payment' ? <CheckCircleSolid /> : '2'}
                  </div>
                  <span className="text-xs">Shipping</span>
                </div>
                
                <div className="w-12 h-px mx-1 bg-gray-300"></div>
                
                <div className={`flex flex-col items-center ${checkoutStep === 'payment' ? 'text-[#e65100]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${checkoutStep === 'payment' ? 'bg-[#e65100] text-white' : 'bg-gray-200 text-gray-600'}`}>
                    3
                  </div>
                  <span className="text-xs">Payment</span>
                </div>
              </div>
              
              {/* Information step */}
              {checkoutStep === 'information' && (
                <form onSubmit={handleSubmitShippingInfo}>
                  {/* Contact information */}
                  <div className="mb-6">
                    <h3 className="mb-4 font-medium text-gray-900">Contact information</h3>
                    <div className="mb-4">
                      <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          value={contactEmail}
                          onChange={(e) => {
                            setContactEmail(e.target.value)
                            setFormTouched({...formTouched, contact: true})
                            if (formErrors.email) setFormErrors({...formErrors, email: null})
                          }}
                          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100] ${formTouched.contact && formErrors.email ? 'border-red-300' : 'border-gray-300'}`}
                          placeholder="your@email.com"
                        />
                      </div>
                      {formTouched.contact && formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Shipping address */}
                  <div>
                    <h3 className="mb-4 font-medium text-gray-900">Shipping address</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="first_name" className="block mb-1 text-sm font-medium text-gray-700">
                          First name
                        </label>
                        <input
                          type="text"
                          id="first_name"
                          value={shippingAddress.first_name}
                          onChange={(e) => handleShippingAddressChange('first_name', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100] ${formTouched.shipping.first_name && formErrors.first_name ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        {formTouched.shipping.first_name && formErrors.first_name && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.first_name}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="last_name" className="block mb-1 text-sm font-medium text-gray-700">
                          Last name
                        </label>
                        <input
                          type="text"
                          id="last_name"
                          value={shippingAddress.last_name}
                          onChange={(e) => handleShippingAddressChange('last_name', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100] ${formTouched.shipping.last_name && formErrors.last_name ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        {formTouched.shipping.last_name && formErrors.last_name && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.last_name}</p>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="company" className="block mb-1 text-sm font-medium text-gray-700">
                          Company (optional)
                        </label>
                        <input
                          type="text"
                          id="company"
                          value={shippingAddress.company}
                          onChange={(e) => handleShippingAddressChange('company', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="address_1" className="block mb-1 text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <input
                          type="text"
                          id="address_1"
                          value={shippingAddress.address_1}
                          onChange={(e) => handleShippingAddressChange('address_1', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100] ${formTouched.shipping.address_1 && formErrors.address_1 ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        {formTouched.shipping.address_1 && formErrors.address_1 && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.address_1}</p>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="address_2" className="block mb-1 text-sm font-medium text-gray-700">
                          Apartment, suite, etc. (optional)
                        </label>
                        <input
                          type="text"
                          id="address_2"
                          value={shippingAddress.address_2}
                          onChange={(e) => handleShippingAddressChange('address_2', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="city" className="block mb-1 text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100] ${formTouched.shipping.city && formErrors.city ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        {formTouched.shipping.city && formErrors.city && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="postal_code" className="block mb-1 text-sm font-medium text-gray-700">
                          Postal code
                        </label>
                        <input
                          type="text"
                          id="postal_code"
                          value={shippingAddress.postal_code}
                          onChange={(e) => handleShippingAddressChange('postal_code', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100] ${formTouched.shipping.postal_code && formErrors.postal_code ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        {formTouched.shipping.postal_code && formErrors.postal_code && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.postal_code}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="country_code" className="block mb-1 text-sm font-medium text-gray-700">
                          Country
                        </label>
                        <select
                          id="country_code"
                          value={shippingAddress.country_code}
                          onChange={(e) => handleShippingAddressChange('country_code', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100] ${formTouched.shipping.country_code && formErrors.country_code ? 'border-red-300' : 'border-gray-300'}`}
                        >
                          <option value="us">United States</option>
                          <option value="ca">Canada</option>
                          <option value="gb">United Kingdom</option>
                          <option value="au">Australia</option>
                          {/* Additional countries would be added here */}
                        </select>
                        {formTouched.shipping.country_code && formErrors.country_code && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.country_code}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="province" className="block mb-1 text-sm font-medium text-gray-700">
                          State / Province
                        </label>
                        <input
                          type="text"
                          id="province"
                          value={shippingAddress.province}
                          onChange={(e) => handleShippingAddressChange('province', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="phone" className="block mb-1 text-sm font-medium text-gray-700">
                          Phone (optional)
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={shippingAddress.phone}
                          onChange={(e) => handleShippingAddressChange('phone', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                          placeholder="For shipping updates"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-8">
                    <button
                      type="submit"
                      className="bg-[#e65100] hover:bg-[#d84315] text-white px-6 py-2 rounded-md font-medium transition-colors"
                    >
                      Continue to shipping
                    </button>
                  </div>
                </form>
              )}
              
              {/* Shipping step */}
              {checkoutStep === 'shipping' && (
                <div>
                  {/* Contact and address summary */}
                  <div className="p-4 mb-6 rounded-md bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Contact</h4>
                        <p className="text-sm text-gray-600">{contactEmail}</p>
                      </div>
                      <button 
                        className="text-sm text-[#e65100] hover:underline"
                        onClick={() => setCheckoutStep('information')}
                      >
                        Change
                      </button>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <h4 className="mb-1 text-sm font-medium text-gray-700">Ship to</h4>
                      <p className="text-sm text-gray-600">
                        {shippingAddress.address_1}, {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postal_code}, {shippingAddress.country_code.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Shipping method selection */}
                  <div>
                    <h3 className="mb-4 font-medium text-gray-900">Shipping method</h3>
                    <div className="space-y-3">
                      {shippingMethods.map((method) => (
                        <div 
                          key={method.id}
                          className={`border rounded-md p-4 cursor-pointer ${selectedShippingMethod?.id === method.id ? 'border-[#e65100] bg-orange-50' : 'border-gray-200 hover:border-gray-400'}`}
                          onClick={() => handleSelectShippingMethod(method)}
                        >
                          <div className="flex items-center">
                            <div className="mr-3">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedShippingMethod?.id === method.id ? 'border-[#e65100]' : 'border-gray-300'}`}>
                                {selectedShippingMethod?.id === method.id && (
                                  <div className="w-3 h-3 rounded-full bg-[#e65100]"></div>
                                )}
                              </div>
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between">
                                <span className="font-medium">{method.name}</span>
                                <span className="font-medium">{formatAmount(method.price)}</span>
                              </div>
                              <p className="text-sm text-gray-500">{method.data.estimated_delivery}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      className="text-[#e65100] hover:underline flex items-center"
                      onClick={() => setCheckoutStep('information')}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                        <path d="M15.8337 10.0001H4.16699M4.16699 10.0001L10.0003 15.8334M4.16699 10.0001L10.0003 4.16675" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Return to information
                    </button>
                    <button
                      type="button"
                      className="bg-[#e65100] hover:bg-[#d84315] text-white px-6 py-2 rounded-md font-medium transition-colors"
                      onClick={handleSubmitShippingMethod}
                    >
                      Continue to payment
                    </button>
                  </div>
                </div>
              )}
              
              {/* Payment step */}
              {checkoutStep === 'payment' && (
                <div>
                  {/* Contact and shipping method summary */}
                  <div className="p-4 mb-6 rounded-md bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Contact</h4>
                        <p className="text-sm text-gray-600">{contactEmail}</p>
                      </div>
                      <button 
                        className="text-sm text-[#e65100] hover:underline"
                        onClick={() => setCheckoutStep('information')}
                      >
                        Change
                      </button>
                    </div>
                    <div className="pt-3 mb-3 border-t border-gray-200">
                      <h4 className="mb-1 text-sm font-medium text-gray-700">Ship to</h4>
                      <p className="text-sm text-gray-600">
                        {shippingAddress.address_1}, {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postal_code}, {shippingAddress.country_code.toUpperCase()}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <h4 className="mb-1 text-sm font-medium text-gray-700">Method</h4>
                      <p className="text-sm text-gray-600">
                        {selectedShippingMethod?.name} · {formatAmount(selectedShippingMethod?.price)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Payment method */}
                  <div>
                    <h3 className="mb-4 font-medium text-gray-900">Payment method</h3>
                    <div className="border rounded-md p-4 mb-4 bg-orange-50 border-[#e65100]">
                      <div className="flex items-center mb-4">
                        <div className="mr-3">
                          <div className="w-5 h-5 rounded-full border border-[#e65100] flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-[#e65100]"></div>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Credit card</span>
                        </div>
                      </div>
                      
                      {/* Credit card form fields would be implemented here */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Card number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                              placeholder="1234 5678 9012 3456"
                            />
                            <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                              <CreditCard size={20} className="text-gray-400" />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Expiration date (MM/YY)
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                            placeholder="MM/YY"
                          />
                        </div>
                        
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Security code
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                            placeholder="CVC"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Name on card
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Billing address selection */}
                    <div>
                      <h3 className="mb-3 font-medium text-gray-900">Billing address</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="same_as_shipping"
                            name="billing_address_option"
                            className="h-4 w-4 text-[#e65100] focus:ring-[#e65100] border-gray-300"
                            defaultChecked
                          />
                          <label htmlFor="same_as_shipping" className="ml-3 text-sm text-gray-700">
                            Same as shipping address
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="different_billing"
                            name="billing_address_option"
                            className="h-4 w-4 text-[#e65100] focus:ring-[#e65100] border-gray-300"
                          />
                          <label htmlFor="different_billing" className="ml-3 text-sm text-gray-700">
                            Use a different billing address
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      className="text-[#e65100] hover:underline flex items-center"
                      onClick={() => setCheckoutStep('shipping')}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                        <path d="M15.8337 10.0001H4.16699M4.16699 10.0001L10.0003 15.8334M4.16699 10.0001L10.0003 4.16675" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Return to shipping
                    </button>
                    <button
                      type="button"
                      className={`bg-[#e65100] hover:bg-[#d84315] text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center ${processingPayment ? 'opacity-70 cursor-not-allowed' : ''}`}
                      onClick={handleSubmitPayment}
                      disabled={processingPayment}
                    >
                      {processingPayment ? (
                        <>
                          <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Complete order'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Creator attribution banner */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#e65100]">
              <div className="flex items-center">
                <LinkIcon className="text-[#e65100] mr-3" />
                <div>
                  <h3 className="font-medium">Creator Connection</h3>
                  <p className="text-sm text-gray-600">
                    Your purchase directly supports the creators behind these items
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right section - Order summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-[#e65100] sticky top-20">
              <h2 className="mb-6 text-xl font-bold">Order summary</h2>
              
              {/* Cart items */}
              <div className="mb-6 divide-y">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex py-4">
                    <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden border border-gray-200 rounded-md">
                      <div className="flex items-center justify-center w-full h-full bg-gray-100">
                        <ShoppingBag className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs text-white bg-gray-700 rounded-bl">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-grow ml-4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <div className="text-sm text-gray-500">
                            {item.variant.title}
                          </div>
                          <div className="text-xs text-[#e65100] mt-1">
                            By {item.variant.product.creator.name}
                          </div>
                        </div>
                        <div className="font-medium">
                          {formatAmount(item.total)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Discount code */}
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <h3 className="font-medium">Discount code</h3>
                </div>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                    placeholder="Enter code"
                  />
                  <button className="px-4 py-2 font-medium text-gray-800 transition-colors bg-gray-200 rounded-r-md hover:bg-gray-300">
                    Apply
                  </button>
                </div>
              </div>
              
              {/* Order totals */}
              <div className="pt-4 space-y-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatAmount(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{formatAmount(cart.shipping_total)}</span>
                </div>
                {cart.discount_total > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">-{formatAmount(cart.discount_total)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatAmount(cart.tax_total)}</span>
                </div>
                <div className="flex justify-between pt-4 text-lg border-t border-gray-200">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">{formatAmount(cart.total)}</span>
                </div>
              </div>
              
              {/* Order guarantees */}
              <div className="mt-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-start">
                    <div className="p-2 mr-3 bg-gray-100 rounded-full">
                      <Truck className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Free shipping</h4>
                      <p className="text-xs text-gray-500">On orders over $100</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="p-2 mr-3 bg-gray-100 rounded-full">
                      <svg width="20" height="20" className="text-gray-600" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 10.8333L9.16667 12.5L12.5 9.16667M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">30-day returns</h4>
                      <p className="text-xs text-gray-500">No questions asked</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-6 mt-12 bg-white border-t">
        <div className="container px-4 mx-auto text-sm text-center text-gray-500">
          <p>© {new Date().getFullYear()} Junooni. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPage;

