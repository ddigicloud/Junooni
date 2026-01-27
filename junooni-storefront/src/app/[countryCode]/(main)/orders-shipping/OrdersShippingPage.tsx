'use client';

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, Package, Truck, MapPin, 
  Clock, CreditCard, RotateCcw, AlertCircle,
  CheckCircle, Info, XCircle, Calendar,
  Plus, Minus, Phone, Mail, Search,
  Edit, Ban, PackageCheck, Navigation,
  Box, Globe, DollarSign, FileText
} from "lucide-react";

const OrdersShippingPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Quick links navigation
  const quickLinks = [
    { id: "track-order", title: "Track Your Order", icon: <Package size={20} /> },
    { id: "shipping-options", title: "Shipping Options", icon: <Truck size={20} /> },
    { id: "delivery-time", title: "Delivery Times", icon: <Clock size={20} /> },
    { id: "shipping-costs", title: "Shipping Costs", icon: <DollarSign size={20} /> },
    { id: "modify-order", title: "Modify/Cancel Order", icon: <Edit size={20} /> },
    { id: "delivery-issues", title: "Delivery Issues", icon: <AlertCircle size={20} /> },
    { id: "international", title: "International Shipping", icon: <Globe size={20} /> },
    { id: "faqs", title: "FAQs", icon: <Info size={20} /> }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // FAQs
  const faqs = [
    {
      question: "How do I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email and SMS. Click the tracking link or enter the number on our Track Order page. You can also track orders from your account dashboard under 'My Orders'."
    },
    {
      question: "Can I change my delivery address after placing an order?",
      answer: "If your order hasn't shipped yet, contact us immediately and we'll update the address. Once shipped, address changes aren't possible, but you can work with the courier for delivery instructions or pickup options."
    },
    {
      question: "What if I'm not home during delivery?",
      answer: "The delivery partner will attempt delivery 2-3 times. If unsuccessful, they'll leave a note with instructions. You can also use the tracking link to schedule a redelivery, change delivery instructions, or arrange pickup from a nearby facility."
    },
    {
      question: "Do you ship on weekends and holidays?",
      answer: "We process orders Monday-Saturday. Deliveries happen Monday-Saturday depending on your location and courier availability. No shipping or delivery on national holidays."
    },
    {
      question: "Can I pick up my order instead of having it delivered?",
      answer: "Currently, we only offer delivery services. However, if you're in our serviceable area, we can arrange for quick delivery to your preferred location."
    },
    {
      question: "What happens if my package is lost?",
      answer: "If your package shows as delivered but you haven't received it, contact us within 48 hours. We'll investigate with the courier and either resend your order or process a full refund."
    },
    {
      question: "Can I order multiple items for delivery to different addresses?",
      answer: "Each order can be delivered to one address. To send items to multiple locations, place separate orders for each delivery address."
    },
    {
      question: "How is my package packed?",
      answer: "All items are carefully packed with protective materials. We use eco-friendly packaging whenever possible. Fragile items receive extra cushioning and 'Handle with Care' labels."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 py-4 bg-white shadow-sm">
        <div className="container px-4 mx-auto">
          <Link href="/" className="flex items-center">
            <ShoppingBag className="h-6 w-6 text-[#e65100] mr-2" />
            <span className="text-lg font-bold">JUNOONI</span>
          </Link>
        </div>
      </header>
      
      {/* Hero Section */}
      <div className="bg-[#e65100] text-white py-10 md:py-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white/20">
              <Truck size={32} />
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">Orders & Shipping</h1>
            <p className="text-lg opacity-90">
              Everything you need to know about tracking, delivery, and managing your orders
            </p>
          </div>
        </div>
      </div>
      
      <main className="container px-4 py-8 mx-auto md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
            <div className="p-6 text-center bg-white border-t-4 border-blue-500 rounded-lg shadow-sm">
              <Package size={32} className="mx-auto mb-3 text-blue-600" />
              <h3 className="mb-2 font-bold text-gray-900">Track Order</h3>
              <p className="mb-3 text-sm text-gray-600">Find your package in real-time</p>
              <button 
                onClick={() => scrollToSection('track-order')}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Track Now →
              </button>
            </div>
            
            <div className="p-6 text-center bg-white border-t-4 border-orange-500 rounded-lg shadow-sm">
              <Clock size={32} className="mx-auto mb-3 text-orange-600" />
              <h3 className="mb-2 font-bold text-gray-900">Delivery Time</h3>
              <p className="mb-3 text-sm text-gray-600">Check estimated delivery dates</p>
              <button 
                onClick={() => scrollToSection('delivery-time')}
                className="text-sm font-medium text-orange-600 hover:underline"
              >
                View Times →
              </button>
            </div>
            
            <div className="p-6 text-center bg-white border-t-4 border-green-500 rounded-lg shadow-sm">
              <Edit size={32} className="mx-auto mb-3 text-green-600" />
              <h3 className="mb-2 font-bold text-gray-900">Modify Order</h3>
              <p className="mb-3 text-sm text-gray-600">Cancel or change your order</p>
              <button 
                onClick={() => scrollToSection('modify-order')}
                className="text-sm font-medium text-green-600 hover:underline"
              >
                Learn How →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Sidebar Navigation - Hidden on mobile */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky p-4 bg-white rounded-lg shadow-sm top-24">
                <h3 className="mb-4 font-bold text-gray-900">Quick Navigation</h3>
                <nav className="space-y-2">
                  {quickLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => scrollToSection(link.id)}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#e65100] hover:bg-orange-50 px-3 py-2 rounded-md transition-colors w-full text-left"
                    >
                      {link.icon}
                      <span>{link.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="space-y-8">
                
                {/* 1. Track Your Order */}
                <section id="track-order" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Package size={24} className="text-[#e65100]" />
                    Track Your Order
                  </h2>
                  
                  <p className="mb-6 text-gray-600">
                    Stay updated on your order's journey from our warehouse to your doorstep.
                  </p>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">How to Track Your Order:</h3>
                  
                  <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
                    <h4 className="mb-3 font-semibold text-blue-900">Method 1: Using Tracking Link</h4>
                    <ol className="ml-2 space-y-2 text-sm text-gray-700 list-decimal list-inside">
                      <li>Check your email for "Order Shipped" notification</li>
                      <li>Click on the tracking link provided</li>
                      <li>View real-time updates of your package location</li>
                    </ol>
                  </div>

                  <div className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
                    <h4 className="mb-3 font-semibold text-green-900">Method 2: From Your Account</h4>
                    <ol className="ml-2 space-y-2 text-sm text-gray-700 list-decimal list-inside">
                      <li>Log into your Junooni account</li>
                      <li>Go to "My Orders"</li>
                      <li>Click on the order you want to track</li>
                      <li>View tracking details and delivery status</li>
                    </ol>
                  </div>

                  <div className="p-4 mb-6 border border-orange-200 rounded-lg bg-orange-50">
                    <h4 className="mb-3 font-semibold text-orange-900">Method 3: Using Tracking Number</h4>
                    <ol className="ml-2 space-y-2 text-sm text-gray-700 list-decimal list-inside">
                      <li>Find your tracking number in the shipping confirmation email</li>
                      <li>Visit our Track Order page</li>
                      <li>Enter your tracking number and email/order ID</li>
                      <li>Click "Track" to see your order status</li>
                    </ol>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Order Status Meanings:</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Clock size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Order Placed</p>
                        <p className="text-sm text-gray-600">We've received your order and payment is confirmed</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <PackageCheck size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Processing</p>
                        <p className="text-sm text-gray-600">Your order is being prepared and quality checked</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Box size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Packed</p>
                        <p className="text-sm text-gray-600">Your order is packed and ready for pickup by courier</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Truck size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Shipped</p>
                        <p className="text-sm text-gray-600">Your order is in transit to your delivery address</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Navigation size={20} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Out for Delivery</p>
                        <p className="text-sm text-gray-600">Your package is with the delivery agent and arriving today</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Delivered</p>
                        <p className="text-sm text-gray-600">Your order has been successfully delivered</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. Shipping Options */}
                <section id="shipping-options" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Truck size={24} className="text-[#e65100]" />
                    Shipping Options
                  </h2>
                  
                  <p className="mb-6 text-gray-600">
                    Choose the shipping method that best suits your needs.
                  </p>

                  <div className="space-y-4">
                    <div className="p-4 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="flex items-center gap-2 font-bold text-gray-900">
                          <Truck size={20} className="text-blue-600" />
                          Standard Delivery
                        </h3>
                        <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded">FREE</span>
                      </div>
                      <p className="mb-2 text-sm text-gray-700">
                        <strong>Delivery Time:</strong> 5-7 business days
                      </p>
                      <p className="text-sm text-gray-600">
                        Available for all orders above ₹499. Best for non-urgent deliveries.
                      </p>
                    </div>

                    <div className="p-4 border-l-4 border-orange-500 rounded-r-lg bg-orange-50">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="flex items-center gap-2 font-bold text-gray-900">
                          <Navigation size={20} className="text-orange-600" />
                          Express Delivery
                        </h3>
                        <span className="px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-200 rounded">₹99</span>
                      </div>
                      <p className="mb-2 text-sm text-gray-700">
                        <strong>Delivery Time:</strong> 2-3 business days
                      </p>
                      <p className="text-sm text-gray-600">
                        Faster delivery to major cities. Select at checkout for urgent orders.
                      </p>
                    </div>

                    <div className="p-4 border-l-4 border-red-500 rounded-r-lg bg-red-50">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="flex items-center gap-2 font-bold text-gray-900">
                          <Clock size={20} className="text-red-600" />
                          Same-Day Delivery
                        </h3>
                        <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded">₹199</span>
                      </div>
                      <p className="mb-2 text-sm text-gray-700">
                        <strong>Delivery Time:</strong> Within 24 hours (order before 12 PM)
                      </p>
                      <p className="text-sm text-gray-600">
                        Available in select metro cities. Check availability at checkout.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 mt-6 border border-yellow-200 rounded-lg bg-yellow-50">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> Delivery times are estimates and may vary based on your location, product availability, and courier availability. Remote areas may require additional 1-2 days.
                    </p>
                  </div>
                </section>

                {/* 3. Delivery Times */}
                <section id="delivery-time" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Clock size={24} className="text-[#e65100]" />
                    Delivery Times by Location
                  </h2>
                  
                  <p className="mb-6 text-gray-600">
                    Estimated delivery times based on your location and shipping method selected.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-sm font-semibold text-left text-gray-900 border-b">Location</th>
                          <th className="px-4 py-3 text-sm font-semibold text-left text-gray-900 border-b">Standard</th>
                          <th className="px-4 py-3 text-sm font-semibold text-left text-gray-900 border-b">Express</th>
                          <th className="px-4 py-3 text-sm font-semibold text-left text-gray-900 border-b">Same-Day</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-900">Metro Cities (Delhi, Mumbai, Bangalore, etc.)</td>
                          <td className="px-4 py-3 text-sm text-gray-600">3-5 days</td>
                          <td className="px-4 py-3 text-sm text-gray-600">1-2 days</td>
                          <td className="px-4 py-3 text-sm text-green-600">Available</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-900">Tier 1 Cities</td>
                          <td className="px-4 py-3 text-sm text-gray-600">4-6 days</td>
                          <td className="px-4 py-3 text-sm text-gray-600">2-3 days</td>
                          <td className="px-4 py-3 text-sm text-red-600">Not Available</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-900">Tier 2/3 Cities</td>
                          <td className="px-4 py-3 text-sm text-gray-600">5-7 days</td>
                          <td className="px-4 py-3 text-sm text-gray-600">3-4 days</td>
                          <td className="px-4 py-3 text-sm text-red-600">Not Available</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-900">Remote/Rural Areas</td>
                          <td className="px-4 py-3 text-sm text-gray-600">7-10 days</td>
                          <td className="px-4 py-3 text-sm text-gray-600">4-6 days</td>
                          <td className="px-4 py-3 text-sm text-red-600">Not Available</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-900">International</td>
                          <td className="px-4 py-3 text-sm text-gray-600">10-15 days</td>
                          <td className="px-4 py-3 text-sm text-gray-600">5-7 days</td>
                          <td className="px-4 py-3 text-sm text-red-600">Not Available</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="p-4 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
                      <p className="text-sm text-gray-700">
                        <strong>Business Days:</strong> Monday to Saturday (excluding Sundays and national holidays)
                      </p>
                    </div>
                    <div className="p-4 border-l-4 border-orange-500 rounded-r-lg bg-orange-50">
                      <p className="text-sm text-gray-700">
                        <strong>Processing Time:</strong> Orders placed before 12 PM are processed the same day. Orders after 12 PM are processed the next business day.
                      </p>
                    </div>
                    <div className="p-4 border-l-4 border-purple-500 rounded-r-lg bg-purple-50">
                      <p className="text-sm text-gray-700">
                        <strong>Peak Season:</strong> During festivals and sale periods, delivery may take 1-2 extra days due to high order volume.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 4. Shipping Costs */}
                <section id="shipping-costs" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <DollarSign size={24} className="text-[#e65100]" />
                    Shipping Costs
                  </h2>
                  
                  <div className="p-4 mb-6 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                    <p className="text-gray-700">
                      <strong>✓ FREE Standard Shipping</strong> on all orders above ₹499!
                    </p>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Shipping Charges:</h3>
                  
                  <div className="mb-6 space-y-3">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">Standard Delivery</h4>
                          <p className="text-sm text-gray-600">5-7 business days</p>
                        </div>
                        <span className="font-bold text-green-600">FREE*</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">*Free for orders ₹499 and above. ₹49 for orders below ₹499</p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">Express Delivery</h4>
                          <p className="text-sm text-gray-600">2-3 business days</p>
                        </div>
                        <span className="font-bold text-orange-600">₹99</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">Available in most cities across India</p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">Same-Day Delivery</h4>
                          <p className="text-sm text-gray-600">Within 24 hours</p>
                        </div>
                        <span className="font-bold text-red-600">₹199</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">Select metro cities only. Order before 12 PM.</p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">International Shipping</h4>
                          <p className="text-sm text-gray-600">10-15 business days</p>
                        </div>
                        <span className="font-bold text-blue-600">Varies</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">Based on destination country and package weight. Calculated at checkout.</p>
                    </div>
                  </div>

                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <h4 className="mb-2 font-semibold text-gray-900">Additional Charges:</h4>
                    <ul className="ml-4 space-y-1 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold mt-0.5">•</span>
                        <span>Remote area surcharge: ₹30-50 for certain PIN codes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold mt-0.5">•</span>
                        <span>Cash on Delivery (COD): ₹40 handling fee</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold mt-0.5">•</span>
                        <span>International orders: Customs duties and taxes (paid by recipient)</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 5. Modify or Cancel Order */}
                <section id="modify-order" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Edit size={24} className="text-[#e65100]" />
                    Modify or Cancel Your Order
                  </h2>
                  
                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded-r-lg mb-6">
                    <p className="text-sm text-gray-700">
                      <strong>Important:</strong> Changes can only be made before the order is shipped. Once shipped, modifications are not possible.
                    </p>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">How to Cancel Your Order:</h3>
                  
                  <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
                    <h4 className="mb-3 font-semibold text-blue-900">Self-Service Cancellation:</h4>
                    <ol className="ml-2 space-y-2 text-sm text-gray-700 list-decimal list-inside">
                      <li>Log into your Junooni account</li>
                      <li>Go to "My Orders"</li>
                      <li>Find the order you want to cancel</li>
                      <li>Click "Cancel Order" button</li>
                      <li>Select cancellation reason</li>
                      <li>Confirm cancellation</li>
                      <li>Refund will be processed within 5-7 business days</li>
                    </ol>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Cancellation Window:</h3>
                  <div className="mb-6 space-y-3">
                    <div className="flex items-start gap-3 p-3 border border-green-200 rounded-lg bg-green-50">
                      <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Order Placed / Processing</p>
                        <p className="text-sm text-gray-600">Can be cancelled anytime. Full refund within 5-7 days.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                      <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Shipped / In Transit</p>
                        <p className="text-sm text-gray-600">Cannot be cancelled. You can refuse delivery or initiate return after receiving.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border border-red-200 rounded-lg bg-red-50">
                      <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Delivered</p>
                        <p className="text-sm text-gray-600">Cannot be cancelled. Return within 7 days if unsatisfied.</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">How to Modify Your Order:</h3>
                  <div className="p-4 mb-6 border border-gray-200 rounded-lg">
                    <p className="mb-3 text-sm text-gray-700">
                      <strong>Possible Modifications:</strong>
                    </p>
                    <ul className="ml-4 space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Change delivery address (before shipping only)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Update phone number or email</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <span>Change items (not possible - cancel and reorder instead)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <span>Change shipping method after order placement</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-700">
                      <strong>Need Help?</strong> If you can't modify or cancel online, contact our support team immediately at 
                      <a href="tel:+918694062222" className="text-[#e65100] hover:underline ml-1">+91 8694062222</a> or 
                      <a href="mailto:orders@junooni.com" className="text-[#e65100] hover:underline ml-1">orders@junooni.com</a>
                    </p>
                  </div>
                </section>

                {/* 6. Delivery Issues */}
                <section id="delivery-issues" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <AlertCircle size={24} className="text-[#e65100]" />
                    Delivery Issues & Solutions
                  </h2>
                  
                  <p className="mb-6 text-gray-600">
                    Common delivery problems and how we can help resolve them.
                  </p>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Common Issues:</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 border-l-4 border-red-500 rounded-r-lg bg-red-50">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <XCircle size={18} className="text-red-600" />
                        Package Marked as Delivered but Not Received
                      </h4>
                      <p className="mb-2 text-sm text-gray-700">
                        <strong>What to do:</strong>
                      </p>
                      <ol className="ml-2 space-y-1 text-sm text-gray-600 list-decimal list-inside">
                        <li>Check with family members or neighbors</li>
                        <li>Look around delivery area (mailbox, porch, gate)</li>
                        <li>Contact courier partner using tracking number</li>
                        <li>If not found within 48 hours, contact us for investigation</li>
                        <li>We'll resend or refund if package is confirmed lost</li>
                      </ol>
                    </div>

                    <div className="p-4 border-l-4 border-orange-500 rounded-r-lg bg-orange-50">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <Package size={18} className="text-orange-600" />
                        Delayed Delivery
                      </h4>
                      <p className="mb-2 text-sm text-gray-700">
                        <strong>What to do:</strong>
                      </p>
                      <ol className="ml-2 space-y-1 text-sm text-gray-600 list-decimal list-inside">
                        <li>Check tracking for latest update</li>
                        <li>Delays may occur due to weather, festivals, or high demand</li>
                        <li>If delay exceeds 2 days beyond estimate, contact support</li>
                        <li>We'll expedite with courier or offer compensation</li>
                      </ol>
                    </div>

                    <div className="p-4 border-l-4 border-yellow-500 rounded-r-lg bg-yellow-50">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <AlertCircle size={18} className="text-yellow-600" />
                        Damaged Package
                      </h4>
                      <p className="mb-2 text-sm text-gray-700">
                        <strong>What to do:</strong>
                      </p>
                      <ol className="ml-2 space-y-1 text-sm text-gray-600 list-decimal list-inside">
                        <li>Don't accept if package appears severely damaged</li>
                        <li>If accepted, take photos immediately upon opening</li>
                        <li>Contact us within 48 hours with photos</li>
                        <li>We'll arrange return pickup and send replacement</li>
                        <li>No cost to you - we handle everything</li>
                      </ol>
                    </div>

                    <div className="p-4 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <MapPin size={18} className="text-blue-600" />
                        Wrong Address Delivery
                      </h4>
                      <p className="mb-2 text-sm text-gray-700">
                        <strong>What to do:</strong>
                      </p>
                      <ol className="ml-2 space-y-1 text-sm text-gray-600 list-decimal list-inside">
                        <li>Check if you entered the correct address</li>
                        <li>Contact delivery partner immediately</li>
                        <li>If package recoverable, we'll arrange correct delivery</li>
                        <li>If lost due to wrong address, customer responsibility</li>
                        <li>We provide address verification during checkout</li>
                      </ol>
                    </div>

                    <div className="p-4 border-l-4 border-purple-500 rounded-r-lg bg-purple-50">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <Ban size={18} className="text-purple-600" />
                        Unable to Deliver / Multiple Failed Attempts
                      </h4>
                      <p className="mb-2 text-sm text-gray-700">
                        <strong>What to do:</strong>
                      </p>
                      <ol className="ml-2 space-y-1 text-sm text-gray-600 list-decimal list-inside">
                        <li>Check phone for missed calls from delivery partner</li>
                        <li>Use tracking link to schedule redelivery</li>
                        <li>Update delivery instructions if needed</li>
                        <li>After 3 failed attempts, package returns to us</li>
                        <li>Contact us to arrange fresh dispatch or refund</li>
                      </ol>
                    </div>
                  </div>

                  <div className="p-4 mt-6 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                    <h4 className="mb-2 font-semibold text-gray-900">Our Delivery Guarantee:</h4>
                    <p className="text-sm text-gray-700">
                      We guarantee safe delivery of your orders. If any issue arises that's within our control, we'll make it right with a replacement or full refund. Your satisfaction is our priority.
                    </p>
                  </div>
                </section>

                {/* 7. International Shipping */}
                <section id="international" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Globe size={24} className="text-[#e65100]" />
                    International Shipping
                  </h2>
                  
                  <div className="p-4 mb-6 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
                    <p className="text-sm text-gray-700">
                      <strong>Good News!</strong> We ship to select international destinations. Bring a piece of India to wherever you are!
                    </p>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Serviceable Countries:</h3>
                  <div className="p-4 mb-6 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="grid gap-2 text-sm text-gray-700 md:grid-cols-3">
                      <div>✓ United States</div>
                      <div>✓ United Kingdom</div>
                      <div>✓ Canada</div>
                      <div>✓ Australia</div>
                      <div>✓ Germany</div>
                      <div>✓ France</div>
                      <div>✓ Singapore</div>
                      <div>✓ UAE</div>
                      <div>✓ Saudi Arabia</div>
                      <div>✓ Malaysia</div>
                      <div>✓ Netherlands</div>
                      <div>✓ Italy</div>
                    </div>
                    <p className="mt-3 text-xs text-gray-600">
                      Don't see your country? Contact us - we're constantly expanding our shipping network!
                    </p>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">International Shipping Details:</h3>
                  <div className="mb-6 space-y-3">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="mb-2 font-semibold text-gray-900">⏱️ Delivery Time</h4>
                      <p className="text-sm text-gray-600">10-15 business days for standard shipping, 5-7 days for express shipping</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="mb-2 font-semibold text-gray-900">💰 Shipping Cost</h4>
                      <p className="text-sm text-gray-600">Calculated at checkout based on destination and package weight. Typically starts from $15 USD</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="mb-2 font-semibold text-gray-900">📦 Tracking</h4>
                      <p className="text-sm text-gray-600">Full tracking available for all international orders via email and SMS updates</p>
                    </div>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Important Information:</h3>
                  <div className="mb-6 space-y-3">
                    <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                      <h4 className="mb-2 font-semibold text-yellow-900">Customs & Duties</h4>
                      <ul className="ml-4 space-y-1 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">•</span>
                          <span>International orders may be subject to import duties and taxes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">•</span>
                          <span>These charges are the recipient's responsibility</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">•</span>
                          <span>Amount varies by country and product value</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">•</span>
                          <span>We declare accurate product values on customs forms</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <h4 className="mb-2 font-semibold text-red-900">Restricted Items</h4>
                      <p className="mb-2 text-sm text-gray-700">Some items cannot be shipped internationally due to customs regulations:</p>
                      <ul className="ml-4 space-y-1 text-sm text-gray-700">
                        <li>✗ Liquids and aerosols</li>
                        <li>✗ Perishable food items</li>
                        <li>✗ Items with batteries (country-specific)</li>
                        <li>✗ Certain religious or cultural items</li>
                      </ul>
                      <p className="mt-2 text-xs text-gray-600">Check product page for international shipping eligibility</p>
                    </div>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">International Returns:</h3>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span>7-day return window applies to international orders</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <span>Return shipping cost is borne by the customer</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span>We provide pre-paid return labels for select countries</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <span>Refund processed after item reaches our warehouse (10-15 days)</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 8. FAQs */}
                <section id="faqs" className="scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Info size={24} className="text-[#e65100]" />
                    Frequently Asked Questions
                  </h2>
                  
                  <div className="space-y-3">
                    {faqs.map((faq, index) => (
                      <div 
                        key={index} 
                        className="overflow-hidden border border-gray-200 rounded-lg"
                      >
                        <button
                          onClick={() => toggleFaq(index)}
                          className="flex items-center justify-between w-full px-4 py-3 font-medium text-left transition-colors hover:bg-gray-50"
                        >
                          <span className="text-gray-900">{faq.question}</span>
                          {expandedFaq === index ? 
                            <Minus size={18} className="flex-shrink-0 text-[#e65100]" /> : 
                            <Plus size={18} className="flex-shrink-0 text-gray-400" />
                          }
                        </button>
                        {expandedFaq === index && (
                          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                            <p className="text-sm text-gray-600">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Contact Support */}
                <div className="pt-6 mt-8 border-t border-gray-200">
                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-6 rounded-r-lg">
                    <h3 className="flex items-center gap-2 mb-4 font-bold text-gray-900">
                      <Package size={24} className="text-[#e65100]" />
                      Need Help with Your Order?
                    </h3>
                    
                    <p className="mb-4 text-gray-700">
                      Our shipping support team is ready to assist you with tracking, delivery updates, or any order concerns.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail size={20} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <a href="mailto:orders@junooni.com" className="text-[#e65100] hover:underline">
                            orders@junooni.com
                          </a>
                          <p className="mt-1 text-xs text-gray-600">Response within 6 hours</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Phone size={20} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Phone</p>
                          <a href="tel:+918694062222" className="text-[#e65100] hover:underline">
                            +91 8694062222
                          </a>
                          <p className="mt-1 text-xs text-gray-600">Monday-Saturday, 9:00 AM - 7:00 PM IST</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back to Top Button */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="mt-6 w-full md:w-auto mx-auto flex items-center justify-center gap-2 bg-[#e65100] text-white px-6 py-3 rounded-lg hover:bg-[#d84315] transition-colors"
              >
                Back to Top
              </button>
            </div>
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default OrdersShippingPage;

