'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, Lock, CreditCard, Truck, MapPin, 
  User, Mail, Phone, Check, ChevronLeft, 
  AlertCircle, Gift, Percent, Plus, Minus
} from "lucide-react";

const CheckoutPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  
  // Form states
  const [customerInfo, setCustomerInfo] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: ""
  });
  
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States"
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    billingIsSameAsShipping: true
  });
  
  // Sample cart items
  const cartItems = [
    {
      id: 1,
      name: "Limited Edition Tour T-Shirt",
      creator: "Alex Rivera",
      size: "Medium",
      color: "Black",
      price: 45.00,
      quantity: 2,
      image: "/placeholder-tshirt.jpg"
    },
    {
      id: 2,
      name: "Signature Hoodie",
      creator: "Maya Johnson",
      size: "Large",
      color: "Navy",
      price: 75.00,
      quantity: 1,
      image: "/placeholder-hoodie.jpg"
    }
  ];
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = promoApplied ? 15.00 : 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;
  
  const handlePromoCode = () => {
    if (promoCode.toLowerCase() === "welcome15") {
      setPromoApplied(true);
      setPromoCode("");
    }
  };
  
  const handleQuantityChange = (itemId, newQuantity) => {
    // In production, this would update the cart
    console.log(`Update item ${itemId} to quantity ${newQuantity}`);
  };
  
  const handleStepChange = (step) => {
    setCurrentStep(step);
  };
  
  const handlePlaceOrder = () => {
    // In production, this would process the payment
    console.log("Processing order...");
    router.push("/order-confirmation");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 py-4 bg-white shadow-sm">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <ShoppingBag className="h-6 w-6 text-[#e65100] mr-2" />
              <span className="text-lg font-bold">JUNOONI</span>
            </Link>
            
            <div className="flex items-center text-sm text-gray-600">
              <Lock size={16} className="mr-2" />
              Secure Checkout
            </div>
          </div>
        </div>
      </header>
      
      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: "Information", icon: <User size={16} /> },
              { step: 2, title: "Shipping", icon: <Truck size={16} /> },
              { step: 3, title: "Payment", icon: <CreditCard size={16} /> }
            ].map((item) => (
              <div key={item.step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 ${
                  currentStep >= item.step 
                    ? 'bg-[#e65100] text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > item.step ? (
                    <Check size={16} />
                  ) : (
                    item.icon
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  currentStep >= item.step ? 'text-[#e65100]' : 'text-gray-600'
                }`}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <main className="container px-4 py-6 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              {/* Back Button */}
              <button 
                onClick={() => router.back()}
                className="flex items-center text-[#e65100] hover:underline mb-6"
              >
                <ChevronLeft size={16} className="mr-1" />
                Back to cart
              </button>
              
              {/* Step 1: Customer Information */}
              {currentStep === 1 && (
                <div>
                  <h2 className="mb-6 text-xl font-bold">Customer Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          First name
                        </label>
                        <input
                          type="text"
                          value={customerInfo.firstName}
                          onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Last name
                        </label>
                        <input
                          type="text"
                          value={customerInfo.lastName}
                          onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Phone number (optional)
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleStepChange(2)}
                    className="mt-6 w-full bg-[#e65100] text-white py-3 rounded-md font-medium hover:bg-[#d84315] transition-colors"
                  >
                    Continue to shipping
                  </button>
                </div>
              )}
              
              {/* Step 2: Shipping Information */}
              {currentStep === 2 && (
                <div>
                  <h2 className="mb-6 text-xl font-bold">Shipping Address</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                        placeholder="Street address"
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Apartment, suite, etc. (optional)
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.apartment}
                        onChange={(e) => setShippingInfo({...shippingInfo, apartment: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                        placeholder="Apartment, suite, etc."
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          State
                        </label>
                        <select
                          value={shippingInfo.state}
                          onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                        >
                          <option value="">Select state</option>
                          <option value="CA">California</option>
                          <option value="NY">New York</option>
                          <option value="TX">Texas</option>
                          <option value="FL">Florida</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          ZIP code
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.zipCode}
                          onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                          placeholder="ZIP code"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => handleStepChange(1)}
                      className="flex-1 py-3 font-medium text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => handleStepChange(3)}
                      className="flex-1 bg-[#e65100] text-white py-3 rounded-md font-medium hover:bg-[#d84315] transition-colors"
                    >
                      Continue to payment
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 3: Payment Information */}
              {currentStep === 3 && (
                <div>
                  <h2 className="mb-6 text-xl font-bold">Payment Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Card number
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Expiry date
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.cvv}
                          onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                          placeholder="123"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Name on card
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.nameOnCard}
                        onChange={(e) => setPaymentInfo({...paymentInfo, nameOnCard: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100]/20 focus:border-[#e65100]"
                        placeholder="Name as it appears on card"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => handleStepChange(2)}
                      className="flex-1 py-3 font-medium text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      className="flex-1 bg-[#e65100] text-white py-3 rounded-md font-medium hover:bg-[#d84315] transition-colors"
                    >
                      Place order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky p-6 bg-white rounded-lg shadow-sm top-24">
              <h3 className="mb-4 text-lg font-bold">Order Summary</h3>
              
              {/* Cart Items */}
              <div className="mb-6 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-md">
                      <ShoppingBag className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-medium">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.creator}</p>
                      <p className="text-xs text-gray-500">{item.size} • {item.color}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="flex items-center justify-center w-6 h-6 border border-gray-300 rounded"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="flex items-center justify-center w-6 h-6 border border-gray-300 rounded"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#e65100]"
                  />
                  <button
                    onClick={handlePromoCode}
                    className="px-4 py-2 text-sm text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <div className="flex items-center mt-2 text-sm text-green-600">
                    <Check size={14} className="mr-1" />
                    Promo code applied
                  </div>
                )}
              </div>
              
              {/* Order Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 font-bold border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Security Notice */}
              <div className="flex items-center mt-6 text-xs text-gray-500">
                <Lock size={14} className="mr-2" />
                Your payment information is secure and encrypted
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;