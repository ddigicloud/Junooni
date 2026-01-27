'use client';

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, RefreshCcw, PackageCheck, XCircle, 
  CheckCircle, Clock, CreditCard, AlertCircle, 
  Package, Truck, Mail, Phone, MapPin, FileText, Video, Camera
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
    { id: "rto-orders", title: "Undelivered Orders (RTO)", icon: <Truck size={20} /> },
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
      title: "Contact Support Immediately",
      description: "Report the issue within 7 days of delivery. Delays beyond this will not be entertained.",
      icon: <Mail size={32} />
    },
    {
      number: "2",
      title: "Provide Evidence",
      description: "Submit unboxing video and clear images showing the defect, damage, or misprint along with original packaging.",
      icon: <Video size={32} />
    },
    {
      number: "3",
      title: "Verification Process",
      description: "Our team will review your claim and evidence. This typically takes 1-2 business days.",
      icon: <FileText size={32} />
    },
    {
      number: "4",
      title: "Reverse Pickup",
      description: "If approved, we'll arrange reverse pickup within 5 days of delivery. Return shipping cost equals forward shipping cost.",
      icon: <Truck size={32} />
    },
    {
      number: "5",
      title: "Resolution",
      description: "Upon verification, we'll reprint and ship a replacement at no cost, or process a refund within 5-7 business days.",
      icon: <CheckCircle size={32} />
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
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">Returns & Refunds Policy</h1>
            <p className="text-lg opacity-90">
              Quality is our priority! Learn about our print-on-demand return and refund policies.
            </p>
            <p className="mt-2 text-sm opacity-75">Last Updated: January 21, 2026</p>
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
                  <h3 className="mb-2 font-bold text-gray-900">7-Day Claim Window</h3>
                  <p className="text-sm text-gray-600">Report defects within 7 days of delivery</p>
                </div>
                
                <div className="p-6 text-center bg-white border-t-4 border-purple-500 rounded-lg shadow-sm">
                  <Video size={32} className="mx-auto mb-3 text-purple-500" />
                  <h3 className="mb-2 font-bold text-gray-900">Video Evidence Required</h3>
                  <p className="text-sm text-gray-600">Unboxing video mandatory for claims</p>
                </div>
                
                <div className="p-6 text-center bg-white border-t-4 border-blue-500 rounded-lg shadow-sm">
                  <PackageCheck size={32} className="mx-auto mb-3 text-blue-500" />
                  <h3 className="mb-2 font-bold text-gray-900">Quality Assured</h3>
                  <p className="text-sm text-gray-600">Free replacement for defective items</p>
                </div>
              </div>

              {/* Important Notice */}
              <div className="mb-8 p-6 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle size={24} className="text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Print-on-Demand Products - Important Notice</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      All products sold on Junooni are custom-made print-on-demand items. This means each product is 
                      created specifically for your order. Due to the customized nature of our products:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <XCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Returns are ONLY accepted for defective, damaged, or misprinted products</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>Wrong size, color preference, or change of mind are NOT valid return reasons</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>We use OEKO-TEX ECO PASSPORT-certified inks with world-class digital printers</span>
                      </li>
                    </ul>
                  </div>
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
                    At Junooni, we prioritize customer satisfaction and product quality. Our return policy is designed 
                    specifically for print-on-demand custom products.
                  </p>

                  <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded mb-6">
                    <h3 className="mb-3 font-semibold text-gray-900 flex items-center gap-2">
                      <AlertCircle size={20} className="text-red-600" />
                      When Returns Are Accepted:
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Defective products:</strong> Manufacturing defects or quality issues</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Damaged items:</strong> Products damaged during shipping</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Misprinted products:</strong> Incorrect designs or printing errors</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Wrong item sent:</strong> Different product than what was ordered</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded mb-6">
                    <h3 className="mb-3 font-semibold text-gray-900">Mandatory Requirements for Returns:</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <Video size={16} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <span><strong>Unboxing Video:</strong> Must show package opening and product condition (MANDATORY)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Camera size={16} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <span><strong>Clear Images:</strong> Photos of the defective item from multiple angles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Package size={16} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <span><strong>Original Packaging:</strong> Photos of the packaging (if damaged in shipping)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock size={16} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <span><strong>7-Day Window:</strong> Claims must be reported within 7 days of delivery</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FileText size={16} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <span><strong>Order Details:</strong> Order number and description of the issue</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <p className="flex items-start gap-2 text-sm text-gray-700">
                      <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>IMPORTANT:</strong> Claims made after 7 days from the delivery date will NOT be entertained. 
                        Returns without unboxing video and proper evidence will be rejected. Advise customers to unbox 
                        packages carefully - if damaged by scissors or sharp objects, refunds or replacements are not possible 
                        unless unpacking videos are provided.
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
                    Refunds are processed only for defective, damaged, or misprinted products after verification.
                  </p>

                  <div className="mb-6 space-y-4">
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="mb-1 font-semibold text-gray-900">Refund Eligibility</h4>
                      <p className="text-sm text-gray-600">
                        Refunds are <strong>ONLY</strong> issued for products that are defective, damaged, or misprinted. 
                        Personal preferences (wrong size, change of mind, color preference) are not eligible for refunds.
                      </p>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="mb-1 font-semibold text-gray-900">Processing Time</h4>
                      <p className="text-sm text-gray-600">
                        Once we receive and verify your return (damaged products will be processed within 7 days), 
                        refunds are processed and credited via the original payment method within <strong>5-7 business days</strong>.
                      </p>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="mb-1 font-semibold text-gray-900">Refund Method</h4>
                      <p className="text-sm text-gray-600">
                        Refunds are issued to the original payment method. Bank processing may take an additional 7-10 
                        business days depending on your financial institution.
                      </p>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="mb-1 font-semibold text-gray-900">Shipping Fees</h4>
                      <p className="text-sm text-gray-600">
                        Shipping fees are <strong>non-refundable</strong> unless the return is due to our error 
                        (defective product, misprint, wrong item sent). Return shipping cost equals forward shipping cost.
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
                        <span>Claim submission and verification:</span>
                        <span className="font-medium">1-2 business days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Return pickup and processing:</span>
                        <span className="font-medium">5-7 business days</span>
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
                        <span>18-26 business days</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 3. How to Return */}
                <section id="how-to-return" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Package size={24} className="text-[#e65100]" />
                    How to Return a Defective Item
                  </h2>
                  
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Follow these steps to report and return a defective, damaged, or misprinted product:
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

                  <div className="p-4 border border-green-200 rounded-lg bg-green-50 mb-4">
                    <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                      <PackageCheck size={20} className="text-green-600" />
                      What Happens After Verification?
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Upon verification of your claim, we will:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• Reprint and ship a replacement product at <strong>no additional cost</strong></li>
                      <li>• OR process a full refund if you prefer</li>
                      <li>• Cover all shipping costs for the replacement</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                      <Truck size={20} className="text-blue-600" />
                      Reverse Pickup Details
                    </h4>
                    <p className="text-sm text-gray-700">
                      A reverse pickup can be arranged within <strong>5 days of delivery</strong>. The reverse shipping 
                      cost is equal to the forward shipping cost and is deducted from the refund amount (unless the return 
                      is due to our error, in which case it's free).
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
                    Due to the custom nature of our print-on-demand products, direct exchanges are not available.
                  </p>

                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded mb-4">
                    <h4 className="mb-2 font-semibold text-gray-900">For Wrong Size or Personal Preference:</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      If you ordered the wrong size or want a different variant, you will need to:
                    </p>
                    <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside ml-4">
                      <li>Place a new order for the correct size/variant at your own expense</li>
                      <li>You may keep or donate the original item (no return needed)</li>
                    </ol>
                    <p className="text-sm text-gray-700 mt-3">
                      <strong>Important:</strong> Junooni does not provide refunds or exchanges for wrong size selections 
                      or change of mind. Please double-check size charts before ordering.
                    </p>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                    <h4 className="mb-2 font-semibold text-gray-900">For Defective/Damaged Products:</h4>
                    <p className="text-sm text-gray-700">
                      If the product is defective, damaged, or misprinted, we will provide a <strong>free replacement</strong> 
                      after verification. Follow the return process outlined above with unboxing video and images.
                    </p>
                  </div>
                </section>

                {/* 5. Non-Returnable Items */}
                <section id="non-returnable" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <XCircle size={24} className="text-[#e65100]" />
                    Non-Returnable Scenarios
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    The following situations are NOT eligible for returns or refunds:
                  </p>

                  <div className="grid grid-cols-1 gap-3 mb-6 md:grid-cols-2">
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <XCircle size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Wrong Size Selection</h4>
                      <p className="text-xs text-gray-600">Customer ordered incorrect size without defect</p>
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <XCircle size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Change of Mind</h4>
                      <p className="text-xs text-gray-600">Customer preference or style changes</p>
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <XCircle size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Color Variations</h4>
                      <p className="text-xs text-gray-600">Slight color differences due to digital printing (normal)</p>
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <XCircle size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Measurement Tolerance</h4>
                      <p className="text-xs text-gray-600">±0.5 inches variation is standard for apparel</p>
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <XCircle size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Claims After 7 Days</h4>
                      <p className="text-xs text-gray-600">Reports made beyond 7-day window</p>
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <XCircle size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Missing Evidence</h4>
                      <p className="text-xs text-gray-600">No unboxing video or insufficient proof</p>
                    </div>

                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <XCircle size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Customer-Inflicted Damage</h4>
                      <p className="text-xs text-gray-600">Damaged by scissors or improper handling</p>
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <XCircle size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Used Products</h4>
                      <p className="text-xs text-gray-600">Products that show signs of wear or use</p>
                    </div>
                  </div>

                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <h4 className="font-semibold text-gray-900 mb-2">About Color Variations & Print Quality:</h4>
                    <p className="text-sm text-gray-700">
                      We use world-class digital printers with <strong>OEKO-TEX ECO PASSPORT-certified inks</strong>. 
                      The colors may not always match the provided designs exactly and could slightly differ due to screen 
                      display variations and printing processes. This is normal for digital printing and not considered a defect. 
                      We recommend ordering test samples before placing large orders.
                    </p>
                  </div>
                </section>

                {/* 6. Damaged or Defective Items */}
                <section id="damaged-items" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <AlertCircle size={24} className="text-[#e65100]" />
                    Damaged, Defective or Misprinted Items
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We take quality seriously. If your product arrives damaged, defective, or misprinted, we'll make it right.
                  </p>

                  <div className="p-4 mb-4 border-l-4 border-red-600 rounded bg-red-50">
                    <h4 className="mb-2 font-semibold text-gray-900 flex items-center gap-2">
                      <Clock size={20} className="text-red-600" />
                      Report Within 7 Days - This is Mandatory
                    </h4>
                    <p className="mb-3 text-sm text-gray-700">
                      Please inspect your order immediately upon delivery and report any damage, defects, or printing 
                      errors within <strong>7 days</strong>. Claims made after 7 days will NOT be accepted.
                    </p>
                    
                    <h4 className="mt-4 mb-2 font-semibold text-gray-900 flex items-center gap-2">
                      <Video size={20} className="text-red-600" />
                      Required Evidence (MANDATORY):
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-red-600">•</span>
                        <span><strong>Unboxing video</strong> showing package opening and product condition</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-red-600">•</span>
                        <span>Clear photos of the damaged/defective item from multiple angles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-red-600">•</span>
                        <span>Photos of the original packaging (especially if damaged in shipping)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-red-600">•</span>
                        <span>Order number and detailed description of the issue</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="p-3 pl-4 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                      <p className="text-sm text-gray-700">
                        <strong className="text-green-700">Free replacement:</strong> We'll reprint and ship a replacement 
                        at no cost, including free shipping, once the claim is verified.
                      </p>
                    </div>
                    
                    <div className="p-3 pl-4 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                      <p className="text-sm text-gray-700">
                        <strong className="text-green-700">Full refund option:</strong> If you prefer a refund instead of 
                        replacement, we'll process it within 5-7 business days after verification.
                      </p>
                    </div>
                    
                    <div className="p-3 pl-4 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                      <p className="text-sm text-gray-700">
                        <strong className="text-green-700">Reverse pickup arranged:</strong> We'll coordinate pickup of the 
                        defective item within 5 days of delivery at no cost to you.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <AlertCircle size={20} className="text-amber-600" />
                      Important: Package Opening Instructions
                    </h4>
                    <p className="text-sm text-gray-700">
                      Customers should unbox packages carefully. If the product is damaged by scissors, knives, or sharp 
                      objects during unboxing, <strong>refunds or replacements are NOT possible</strong> unless unpacking 
                      videos are provided showing that the damage existed before opening.
                    </p>
                  </div>
                </section>

                {/* 7. RTO Orders */}
                <section id="rto-orders" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Truck size={24} className="text-[#e65100]" />
                    Undelivered Orders (RTO - Return to Origin)
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    If a courier company is unable to deliver an order, the status will be marked as "Undelivered" or 
                    "Return to Origin" (RTO), and the product will be sent back to our facility.
                  </p>

                  <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded mb-4">
                    <h4 className="mb-2 font-semibold text-gray-900">Common Reasons for RTO:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>Pincode not serviceable by courier</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>COD amount not ready with customer</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>Customer not contactable or unreachable</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>Incomplete or incorrect delivery address</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>Customer refused delivery</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>Door/premises/office closed during delivery attempts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>Poor weather conditions affecting delivery</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>Self-pickup or future delivery requested by customer</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="p-4 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
                      <h4 className="font-semibold text-gray-900 mb-1">RTO Return Address</h4>
                      <p className="text-sm text-gray-700">
                        RTO products are sent back to: <strong>Junooni Warehouse, Saharanpur, Uttar Pradesh, India</strong>
                      </p>
                    </div>

                    <div className="p-4 border-l-4 border-red-500 rounded-r-lg bg-red-50">
                      <h4 className="font-semibold text-gray-900 mb-1">RTO Charges & Refunds</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>No refunds are processed for RTO orders.</strong> If the pin code becomes unserviceable 
                        after placing the order, or if delivery fails due to incorrect address provided by the customer, 
                        Junooni is not responsible for the RTO.
                      </p>
                      <p className="text-sm text-gray-700">
                        However, if you would like to have the order re-shipped to the correct address, you can place a 
                        new order and cover the shipping costs for re-delivery.
                      </p>
                    </div>

                    <div className="p-4 border-l-4 border-purple-500 rounded-r-lg bg-purple-50">
                      <h4 className="font-semibold text-gray-900 mb-1">Custom Return Address Not Available</h4>
                      <p className="text-sm text-gray-700">
                        A custom return address is not possible because courier companies do not offer this option. 
                        All RTO shipments automatically return to our default warehouse address.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <h4 className="font-semibold text-gray-900 mb-2">How to Avoid RTO:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>✓ Double-check your delivery address before placing order</li>
                      <li>✓ Ensure your phone number is correct and reachable</li>
                      <li>✓ Verify that your pincode is serviceable</li>
                      <li>✓ Keep COD amount ready if you chose Cash on Delivery</li>
                      <li>✓ Be available during estimated delivery window</li>
                    </ul>
                  </div>
                </section>

                {/* 8. Lost Items */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">Lost or Missing Items</h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    In rare cases, items may be lost during shipping.
                  </p>

                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">For Items Lost During Shipping:</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Junooni issues a refund once the shipping status confirms the item is lost. This typically requires:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-700 ml-4">
                      <li>• Confirmation from courier partner that item is lost</li>
                      <li>• No delivery attempted within 15 days (Air) or 20 days (Surface)</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 pl-4 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                      <p className="text-sm text-gray-700">
                        <strong className="text-green-700">Option 1:</strong> We can reproduce and re-ship the product 
                        to you at no additional cost.
                      </p>
                    </div>
                    
                    <div className="p-3 pl-4 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                      <p className="text-sm text-gray-700">
                        <strong className="text-green-700">Option 2:</strong> Receive a full refund for the order.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 9. Delayed Deliveries */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">Delayed Order Delivery</h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    If an item isn't attempted for delivery within the expected timeframe, we have options to help you.
                  </p>

                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Timeframe for Escalation:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <Clock size={16} className="text-[#e65100]" />
                        <span><strong>Air Shipping:</strong> No delivery attempt within 15 days</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock size={16} className="text-[#e65100]" />
                        <span><strong>Surface Shipping:</strong> No delivery attempt within 20 days</span>
                      </li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 border-2 border-[#e65100] rounded-lg bg-orange-50">
                      <h4 className="font-semibold text-gray-900 mb-2">Resolution Option 1</h4>
                      <p className="text-sm text-gray-700">
                        Reproduce and re-ship the product to your address at no additional cost.
                      </p>
                    </div>
                    
                    <div className="p-4 border-2 border-[#e65100] rounded-lg bg-orange-50">
                      <h4 className="font-semibold text-gray-900 mb-2">Resolution Option 2</h4>
                      <p className="text-sm text-gray-700">
                        Receive a full refund for the order if you prefer not to wait for re-shipment.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 10. Order Cancellations */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">Order Cancellations</h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Due to our print-on-demand model, order cancellation options are limited.
                  </p>

                  <div className="mb-4 space-y-3">
                    <div className="p-4 border-l-4 border-red-600 rounded-r-lg bg-red-50">
                      <h4 className="mb-1 font-semibold text-gray-900">Once Order is Processed</h4>
                      <p className="text-sm text-gray-600">
                        <strong>Once an order is processed, it CANNOT be canceled.</strong> This is because we immediately 
                        begin custom printing your design on the selected product. Please review your order carefully before 
                        checkout.
                      </p>
                    </div>
                    
                    <div className="p-4 border-l-4 border-yellow-500 rounded-r-lg bg-yellow-50">
                      <h4 className="mb-1 font-semibold text-gray-900">Within 1 Hour of Order (Limited Window)</h4>
                      <p className="text-sm text-gray-600">
                        Contact our support team immediately if you need to cancel. If production hasn't started, 
                        we may be able to cancel your order. Full refund will be issued if successfully canceled.
                      </p>
                    </div>
                    
                    <div className="p-4 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                      <h4 className="mb-1 font-semibold text-gray-900">After Production/Shipping</h4>
                      <p className="text-sm text-gray-600">
                        Once production is complete or the order has shipped, cancellation is not possible. 
                        The order will be delivered as planned.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <p className="text-sm text-gray-700">
                      <strong>Pro Tip:</strong> Always double-check your design, size selection, and delivery address 
                      before placing your order. Once production starts, changes cannot be made.
                    </p>
                  </div>
                </section>

                {/* 11. Measurement Tolerance */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">Measurement Tolerance for Apparel</h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Please be aware of standard manufacturing variations for apparel products.
                  </p>

                  <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded">
                    <h4 className="font-semibold text-gray-900 mb-2">±0.5 Inch Tolerance is Standard</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      A measurement tolerance of <strong>±0.5 inches</strong> (approximately 1.27 cm) is standard for all 
                      apparel products and is NOT eligible for returns or refunds. This is normal manufacturing variation 
                      in the garment industry.
                    </p>
                    <p className="text-sm text-gray-700">
                      For example, if a t-shirt is listed as 28 inches in length, the actual measurement could be anywhere 
                      from 27.5 to 28.5 inches, and this is considered within acceptable tolerance.
                    </p>
                    <p className="text-sm text-gray-700 mt-3">
                      <strong>Please refer to our size chart guide</strong> and consider this tolerance when selecting sizes. 
                      If you're between sizes or prefer a specific fit, we recommend ordering accordingly.
                    </p>
                  </div>
                </section>

                {/* 12. Contact Support */}
                <section id="contact" className="scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Mail size={24} className="text-[#e65100]" />
                    Need Help with Returns or Refunds?
                  </h2>
                  
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Our customer support team is here to assist you with any questions about returns, refunds, or 
                    defective products. Have your order number ready for faster service!
                  </p>
                  
                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-6 rounded-lg">
                    <h3 className="mb-4 font-bold text-gray-900">Contact Our Support Team</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail size={20} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Email (Preferred for Returns)</p>
                          <a href="mailto:support@junooni.com" className="text-[#e65100] hover:underline">
                            support@junooni.com
                          </a>
                          <p className="mt-1 text-xs text-gray-600">
                            Send unboxing video and images for faster processing • Response within 24 hours
                          </p>
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
                          <p className="font-medium text-gray-900">Warehouse & Returns Address</p>
                          <p className="text-sm text-gray-600">
                            Junooni<br />
                            Saharanpur, Uttar Pradesh, India
                          </p>
                          <p className="mt-1 text-xs text-gray-600">
                            (RTO orders automatically returned here)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-6 border-t border-orange-200">
                      <p className="text-sm text-gray-700">
                        <strong>Important:</strong> When contacting support about a defective product, please include:
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-gray-700 ml-4">
                        <li>• Order number</li>
                        <li>• Unboxing video (mandatory)</li>
                        <li>• Clear photos of the issue</li>
                        <li>• Description of the problem</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* FAQ Section */}
                <section className="pt-6 mt-8 border-t border-gray-200">
                  <h3 className="mb-4 text-xl font-bold text-gray-900">Frequently Asked Questions</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">Can I return a product if I ordered the wrong size?</h4>
                      <p className="text-sm text-gray-600">
                        No, wrong size selections are not eligible for returns or refunds. You would need to place a new 
                        order for the correct size at your own expense. Please check our size charts carefully before ordering.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">What if the color looks different from the website?</h4>
                      <p className="text-sm text-gray-600">
                        Slight color variations are normal with digital printing and screen display differences. Minor 
                        color differences are not considered defects and are not eligible for returns. Significant 
                        misprints (wrong colors entirely) are eligible for return with video evidence.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">Do I need to provide an unboxing video for every return?</h4>
                      <p className="text-sm text-gray-600">
                        Yes, an unboxing video is <strong>mandatory</strong> for all return claims. Without video proof, 
                        we cannot verify the defect and claims will be rejected. Start recording before opening the package.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">What happens if my order is returned to origin (RTO)?</h4>
                      <p className="text-sm text-gray-600">
                        RTO orders are not eligible for refunds. If delivery failed due to incorrect address or 
                        unavailability, you can place a new order and pay for re-shipment. Always ensure your address 
                        and phone number are correct.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">How long does the entire refund process take?</h4>
                      <p className="text-sm text-gray-600">
                        From claim submission to refund in your account: approximately 18-26 business days. This includes 
                        verification (1-2 days), pickup and return processing (5-7 days), refund processing (5-7 days), 
                        and bank processing (7-10 days).
                      </p>
                    </div>

                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">Can I cancel my order after placing it?</h4>
                      <p className="text-sm text-gray-600">
                        Once an order is processed, it cannot be canceled as we immediately begin custom printing. 
                        Contact us within 1 hour if you need to cancel - we may be able to help if production hasn't started.
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
      
    </div>
  );
};

export default RefundsReturnsPage;