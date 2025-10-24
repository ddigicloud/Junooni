'use client';

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, RefreshCcw, PackageCheck, XCircle, 
  CheckCircle, Clock, CreditCard, AlertCircle, 
  Package, Truck, Mail, Phone, MapPin, FileText
} from "lucide-react";

const RefundsReturnsPage = () => {
  const [activeTab, setActiveTab] = useState('returns');

  // Quick links navigation
  const quickLinks = [
    { id: "return-policy", title: "Return Policy", icon: <RefreshCcw size={20} /> },
    { id: "refund-policy", title: "Refund Policy", icon: <CreditCard size={20} /> },
    { id: "how-to-return", title: "How to Return", icon: <Package size={20} /> },
    { id: "exchange-policy", title: "Exchange Policy", icon: <PackageCheck size={20} /> },
    { id: "non-returnable", title: "Non-Returnable Items", icon: <XCircle size={20} /> },
    { id: "damaged-items", title: "Damaged/Defective Items", icon: <AlertCircle size={20} /> },
    { id: "contact", title: "Contact Support", icon: <Mail size={20} /> }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Return process steps
  const returnSteps = [
    {
      number: "1",
      title: "Initiate Return",
      description: "Log in to your account and go to 'My Orders'. Select the order and click 'Return Item'.",
      icon: <Package size={32} />
    },
    {
      number: "2",
      title: "Select Reason",
      description: "Choose a return reason and provide any additional details about the item.",
      icon: <FileText size={32} />
    },
    {
      number: "3",
      title: "Pack the Item",
      description: "Securely pack the item in its original packaging with all tags and accessories.",
      icon: <PackageCheck size={32} />
    },
    {
      number: "4",
      title: "Ship It Back",
      description: "Use our prepaid shipping label or arrange pickup. Track your return shipment.",
      icon: <Truck size={32} />
    },
    {
      number: "5",
      title: "Get Refund",
      description: "Once we receive and inspect the item, your refund will be processed within 5-7 days.",
      icon: <CreditCard size={32} />
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
              <RefreshCcw size={32} />
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">Returns & Refunds</h1>
            <p className="text-lg opacity-90">
              We want you to love your purchase! If you're not completely satisfied, we're here to help.
            </p>
            <p className="mt-2 text-sm opacity-75">Last Updated: October 22, 2025</p>
          </div>
        </div>
      </div>
      
      <main className="container px-4 py-8 mx-auto md:py-12">
        <div className="max-w-6xl mx-auto">
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
              {/* Policy Overview Cards */}
              <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
                <div className="bg-white rounded-lg shadow-sm p-6 text-center border-t-4 border-[#e65100]">
                  <Clock size={32} className="mx-auto text-[#e65100] mb-3" />
                  <h3 className="mb-2 font-bold text-gray-900">30-Day Window</h3>
                  <p className="text-sm text-gray-600">Return items within 30 days of delivery</p>
                </div>
                
                <div className="p-6 text-center bg-white border-t-4 border-green-500 rounded-lg shadow-sm">
                  <CheckCircle size={32} className="mx-auto mb-3 text-green-500" />
                  <h3 className="mb-2 font-bold text-gray-900">Easy Process</h3>
                  <p className="text-sm text-gray-600">Simple returns through your account</p>
                </div>
                
                <div className="p-6 text-center bg-white border-t-4 border-blue-500 rounded-lg shadow-sm">
                  <CreditCard size={32} className="mx-auto mb-3 text-blue-500" />
                  <h3 className="mb-2 font-bold text-gray-900">Quick Refunds</h3>
                  <p className="text-sm text-gray-600">Refunds processed in 5-7 business days</p>
                </div>
              </div>

              {/* Main Content Section */}
              <div className="p-6 bg-white rounded-lg shadow-sm md:p-8">
                
                {/* 1. Return Policy */}
                <section id="return-policy" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <RefreshCcw size={24} className="text-[#e65100]" />
                    Return Policy
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    At Junooni, we want you to be completely satisfied with your purchase. If for any reason you're not happy 
                    with your order, we accept returns within <strong>30 days</strong> of delivery date.
                  </p>

                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded mb-6">
                    <h3 className="mb-2 font-semibold text-gray-900">Return Eligibility Requirements:</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Item must be in original, unused condition</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>All original tags and labels must be attached</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Item must be in original packaging when possible</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Return must be initiated within 30 days of delivery</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Proof of purchase (order number) required</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <p className="flex items-start gap-2 text-sm text-gray-700">
                      <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Note:</strong> Items returned without meeting these requirements may not be accepted for refund. 
                        We reserve the right to refuse returns that don't meet our policy guidelines.
                      </span>
                    </p>
                  </div>
                </section>

                {/* 2. Refund Policy */}
                <section id="refund-policy" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <CreditCard size={24} className="text-[#e65100]" />
                    Refund Policy
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Once we receive and inspect your returned item, we will process your refund. Here's what you need to know:
                  </p>

                  <div className="mb-6 space-y-4">
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="mb-1 font-semibold text-gray-900">Processing Time</h4>
                      <p className="text-sm text-gray-600">
                        Refunds are processed within <strong>5-7 business days</strong> after we receive and inspect your return.
                      </p>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="mb-1 font-semibold text-gray-900">Refund Method</h4>
                      <p className="text-sm text-gray-600">
                        Refunds are issued to the original payment method used for the purchase. If you paid by credit/debit card, 
                        the refund will appear in your account within 7-10 business days depending on your bank.
                      </p>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="mb-1 font-semibold text-gray-900">Shipping Costs</h4>
                      <p className="text-sm text-gray-600">
                        Original shipping charges are non-refundable unless the return is due to our error (wrong item sent, 
                        defective product, etc.). Return shipping costs are the customer's responsibility.
                      </p>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="mb-1 font-semibold text-gray-900">Partial Refunds</h4>
                      <p className="text-sm text-gray-600">
                        In some cases, only partial refunds may be granted (e.g., items with obvious signs of use, items not in 
                        original condition, items with missing parts not due to our error).
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                      <Clock size={20} className="text-yellow-600" />
                      Refund Timeline Overview
                    </h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center justify-between">
                        <span>Return received and inspected:</span>
                        <span className="font-medium">1-2 business days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Refund processing:</span>
                        <span className="font-medium">5-7 business days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Bank processing time:</span>
                        <span className="font-medium">7-10 business days</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 mt-2 font-semibold border-t">
                        <span>Total estimated time:</span>
                        <span>13-19 business days</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 3. How to Return */}
                <section id="how-to-return" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Package size={24} className="text-[#e65100]" />
                    How to Return an Item
                  </h2>
                  
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Returning an item is easy! Follow these simple steps:
                  </p>

                  <div className="mb-6 space-y-4">
                    {returnSteps.map((step, index) => (
                      <div key={index} className="flex gap-4 p-4 rounded-lg bg-gray-50">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-[#e65100] text-white flex items-center justify-center font-bold text-lg">
                            {step.number}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <h3 className="mb-1 font-semibold text-gray-900">{step.title}</h3>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                        <div className="hidden md:flex items-center text-[#e65100]">
                          {step.icon}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                      <Truck size={20} className="text-green-600" />
                      Free Return Shipping Available
                    </h4>
                    <p className="text-sm text-gray-700">
                      For items that are defective, damaged, or incorrectly shipped, we provide a <strong>prepaid return shipping 
                      label</strong> at no cost to you. For other returns, standard return shipping charges apply.
                    </p>
                  </div>
                </section>

                {/* 4. Exchange Policy */}
                <section id="exchange-policy" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <PackageCheck size={24} className="text-[#e65100]" />
                    Exchange Policy
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    If you'd like to exchange an item for a different size, color, or variant, we're happy to help!
                  </p>

                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded mb-4">
                    <h4 className="mb-2 font-semibold text-gray-900">How Exchanges Work:</h4>
                    <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                      <li>Initiate a return request for the original item</li>
                      <li>Place a new order for the item you want</li>
                      <li>Once we receive your return, we'll process your refund</li>
                      <li>Your new order will be shipped separately</li>
                    </ol>
                  </div>

                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <p className="text-sm text-gray-700">
                      <strong>Why we do it this way:</strong> This ensures you get your new item as quickly as possible without 
                      waiting for the return to be processed first. If there's a price difference, you'll be charged or refunded 
                      accordingly.
                    </p>
                  </div>
                </section>

                {/* 5. Non-Returnable Items */}
                <section id="non-returnable" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <XCircle size={24} className="text-[#e65100]" />
                    Non-Returnable Items
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    For health, safety, and hygiene reasons, certain items cannot be returned unless defective or damaged upon arrival:
                  </p>

                  <div className="grid grid-cols-1 gap-3 mb-6 md:grid-cols-2">
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <XCircle size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Personal Care Items</h4>
                      <p className="text-xs text-gray-600">Cosmetics, fragrances, skincare products</p>
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <XCircle size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Undergarments & Swimwear</h4>
                      <p className="text-xs text-gray-600">If hygiene seal is broken</p>
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <XCircle size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Custom/Personalized Items</h4>
                      <p className="text-xs text-gray-600">Items made specifically for you</p>
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <XCircle size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Final Sale Items</h4>
                      <p className="text-xs text-gray-600">Items marked as "Final Sale" or "Clearance"</p>
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <XCircle size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Gift Cards</h4>
                      <p className="text-xs text-gray-600">Digital or physical gift cards</p>
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <XCircle size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Downloadable Products</h4>
                      <p className="text-xs text-gray-600">Digital content once accessed</p>
                    </div>
                  </div>

                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <p className="text-sm text-gray-700">
                      <strong>Exception:</strong> If any of these items arrive damaged, defective, or are not as described, 
                      please contact us immediately. We'll work with you to resolve the issue.
                    </p>
                  </div>
                </section>

                {/* 6. Damaged or Defective Items */}
                <section id="damaged-items" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <AlertCircle size={24} className="text-[#e65100]" />
                    Damaged or Defective Items
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We take great care in packaging and shipping your orders, but occasionally items may arrive damaged or 
                    have manufacturing defects. Here's what to do:
                  </p>

                  <div className="p-4 mb-4 border-l-4 border-red-600 rounded bg-red-50">
                    <h4 className="mb-2 font-semibold text-gray-900">Report Within 48 Hours</h4>
                    <p className="mb-3 text-sm text-gray-700">
                      Please inspect your order upon delivery and report any damage or defects within <strong>48 hours</strong> of 
                      receiving your package.
                    </p>
                    
                    <h4 className="mt-4 mb-2 font-semibold text-gray-900">What We Need From You:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-red-600">•</span>
                        <span>Clear photos of the damaged/defective item</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-red-600">•</span>
                        <span>Photos of the packaging (if damaged in shipping)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-red-600">•</span>
                        <span>Order number and description of the issue</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 pl-4 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                      <p className="text-sm text-gray-700">
                        <strong className="text-green-700">Free replacement:</strong> We'll send you a replacement at no cost, 
                        including free shipping.
                      </p>
                    </div>
                    
                    <div className="p-3 pl-4 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                      <p className="text-sm text-gray-700">
                        <strong className="text-green-700">Full refund option:</strong> If you prefer a refund instead of 
                        replacement, we'll process it immediately.
                      </p>
                    </div>
                    
                    <div className="p-3 pl-4 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                      <p className="text-sm text-gray-700">
                        <strong className="text-green-700">No return needed:</strong> In most cases, you can keep or dispose 
                        of the damaged item.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 7. International Returns */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">International Returns</h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    For orders shipped outside India, please note:
                  </p>

                  <ul className="mb-4 space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-[#e65100] font-bold mt-1">•</span>
                      <span>Return shipping costs are the customer's responsibility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#e65100] font-bold mt-1">•</span>
                      <span>Items must be shipped back to our India warehouse</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#e65100] font-bold mt-1">•</span>
                      <span>Customers are responsible for any customs duties or import taxes on returns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#e65100] font-bold mt-1">•</span>
                      <span>Original shipping charges are non-refundable unless the item is defective or was shipped incorrectly</span>
                    </li>
                  </ul>

                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <p className="text-sm text-gray-700">
                      We recommend using a trackable shipping service for international returns. Please contact our support team 
                      before shipping to receive detailed instructions and our return address.
                    </p>
                  </div>
                </section>

                {/* 8. Cancellations */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">Order Cancellations</h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Changed your mind? You can cancel your order, but timing is important:
                  </p>

                  <div className="mb-4 space-y-3">
                    <div className="p-4 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                      <h4 className="mb-1 font-semibold text-gray-900">Within 1 Hour of Order</h4>
                      <p className="text-sm text-gray-600">
                        You can cancel your order yourself through your account. Go to "My Orders" and click "Cancel Order". 
                        Full refund will be processed immediately.
                      </p>
                    </div>
                    
                    <div className="p-4 border-l-4 border-yellow-500 rounded-r-lg bg-yellow-50">
                      <h4 className="mb-1 font-semibold text-gray-900">After 1 Hour (Before Shipping)</h4>
                      <p className="text-sm text-gray-600">
                        Contact our customer support team immediately. If the order hasn't shipped yet, we may be able to cancel it. 
                        A full refund will be issued if successfully canceled.
                      </p>
                    </div>
                    
                    <div className="p-4 border-l-4 border-red-500 rounded-r-lg bg-red-50">
                      <h4 className="mb-1 font-semibold text-gray-900">After Shipping</h4>
                      <p className="text-sm text-gray-600">
                        Once an order has shipped, it cannot be canceled. You'll need to wait for delivery and then initiate a return 
                        following our standard return process.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 9. Creator-Specific Items */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">Creator Merchandise Returns</h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Some merchandise is produced specifically for individual creators. While our standard return policy applies, 
                    please note:
                  </p>

                  <ul className="mb-4 space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-[#e65100] font-bold mt-1">•</span>
                      <span>Limited edition or exclusive items may have modified return windows</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#e65100] font-bold mt-1">•</span>
                      <span>Pre-order items can be canceled before production begins</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#e65100] font-bold mt-1">•</span>
                      <span>Autographed items are final sale unless damaged or defective</span>
                    </li>
                  </ul>

                  <p className="text-sm italic text-gray-600">
                    Any special return conditions will be clearly stated on the product page before purchase.
                  </p>
                </section>

                {/* 10. Contact Support */}
                <section id="contact" className="scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Mail size={24} className="text-[#e65100]" />
                    Need Help with a Return?
                  </h2>
                  
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Our customer support team is here to assist you with any questions or concerns about returns and refunds.
                  </p>
                  
                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-6 rounded-lg">
                    <h3 className="mb-4 font-bold text-gray-900">Contact Our Returns Team</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail size={20} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <a href="mailto:support@junooni.com" className="text-[#e65100] hover:underline">
                            support@junooni.com
                          </a>
                          <p className="mt-1 text-xs text-gray-600">Response within 24 hours</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Phone size={20} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Phone</p>
                          <a href="tel:+918694062222" className="text-[#e65100] hover:underline">
                            +91 8694062222
                          </a>
                          <p className="mt-1 text-xs text-gray-600">Monday-Friday, 10:00 AM - 6:00 PM IST</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Return Address</p>
                          <p className="text-sm text-gray-600">
                            Junooni Returns Department<br />
                            Saharanpur, Uttar Pradesh, India
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-6 border-t border-orange-200">
                      <p className="text-sm text-gray-700">
                        <strong>Pro Tip:</strong> Have your order number ready when contacting us for faster assistance!
                      </p>
                    </div>
                  </div>
                </section>

                {/* FAQ Section */}
                <section className="pt-6 mt-8 border-t border-gray-200">
                  <h3 className="mb-4 text-xl font-bold text-gray-900">Frequently Asked Questions</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">Can I return an item I bought on sale?</h4>
                      <p className="text-sm text-gray-600">
                        Yes! Items purchased during sales or promotions can be returned following our standard return policy, 
                        unless marked as "Final Sale."
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">What if I lost my order confirmation?</h4>
                      <p className="text-sm text-gray-600">
                        No problem! You can find your order number by logging into your account, or contact our support team 
                        with your email address and they can help locate your order.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">Can I return part of my order?</h4>
                      <p className="text-sm text-gray-600">
                        Yes, you can return individual items from an order. You'll receive a refund for the returned items only.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">Will I be charged for return shipping?</h4>
                      <p className="text-sm text-gray-600">
                        For damaged, defective, or incorrectly shipped items, return shipping is free. For other returns, 
                        standard return shipping charges apply (typically ₹50-₹100 depending on location).
                      </p>
                    </div>
                  </div>
                </section>
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
      
      {/* Footer */}
      {/* <footer className="py-6 mt-12 bg-white border-t">
        <div className="container px-4 mx-auto text-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Junooni. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <Link href="/terms" className="text-sm text-gray-500 hover:text-[#e65100]">Terms of Service</Link>
            <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-[#e65100]">Privacy Policy</Link>
            <Link href="/refunds-returns" className="text-sm text-[#e65100] font-medium">Returns & Refunds</Link>
            <Link href="/help" className="text-sm text-gray-500 hover:text-[#e65100]">Help Center</Link>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default RefundsReturnsPage;

