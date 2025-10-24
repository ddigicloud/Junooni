'use client';

import React from "react";
import Link from "next/link";
import { 
  ShoppingBag, FileText, Shield, AlertTriangle, 
  UserCheck, CreditCard, Package, Scale, 
  Lock, XCircle, CheckCircle, Mail, Phone, MapPin,
  Gavel, Globe, Eye, Ban
} from "lucide-react";

const TermsConditionsPage = () => {
  // Quick links navigation
  const quickLinks = [
    { id: "acceptance", title: "Acceptance of Terms", icon: <FileText size={20} /> },
    { id: "account", title: "Account Registration", icon: <UserCheck size={20} /> },
    { id: "user-conduct", title: "User Conduct", icon: <Shield size={20} /> },
    { id: "intellectual-property", title: "Intellectual Property", icon: <Lock size={20} /> },
    { id: "products", title: "Products & Pricing", icon: <Package size={20} /> },
    { id: "payment", title: "Payment Terms", icon: <CreditCard size={20} /> },
    { id: "disclaimer", title: "Disclaimers", icon: <AlertTriangle size={20} /> },
    { id: "liability", title: "Limitation of Liability", icon: <Scale size={20} /> },
    { id: "termination", title: "Termination", icon: <XCircle size={20} /> },
    { id: "governing-law", title: "Governing Law", icon: <Gavel size={20} /> },
    { id: "contact", title: "Contact Us", icon: <Mail size={20} /> }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
              <FileText size={32} />
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">Terms & Conditions</h1>
            <p className="text-lg opacity-90">
              Please read these terms carefully before using our platform and services.
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
              <div className="p-6 bg-white rounded-lg shadow-sm md:p-8">
                {/* Introduction */}
                <section className="mb-8">
                  <div className="p-4 mb-6 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
                    <p className="text-sm text-gray-700">
                      <strong>Important:</strong> By accessing and using Junooni's website and services, you agree to be bound 
                      by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.
                    </p>
                  </div>

                  <p className="mb-4 leading-relaxed text-gray-600">
                    Welcome to Junooni! These Terms and Conditions ("Terms") govern your use of our website, mobile application, 
                    and all related services (collectively, the "Platform"). These Terms constitute a legally binding agreement 
                    between you and Junooni.
                  </p>

                  <p className="leading-relaxed text-gray-600">
                    Throughout these Terms, "we," "us," and "our" refer to Junooni, and "you" and "your" refer to you as the user 
                    of our Platform.
                  </p>
                </section>

                {/* 1. Acceptance of Terms */}
                <section id="acceptance" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <FileText size={24} className="text-[#e65100]" />
                    1. Acceptance of Terms
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    By accessing or using our Platform, you acknowledge that you have read, understood, and agree to be bound by 
                    these Terms, as well as our Privacy Policy and any other policies referenced herein. These Terms apply to all 
                    visitors, users, and others who access or use the Platform.
                  </p>

                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded mb-4">
                    <h4 className="mb-2 font-semibold text-gray-900">You agree that:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>You are at least 13 years of age (or have parental consent if between 13-18)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>You have the legal capacity to enter into this binding agreement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>All information you provide is accurate and truthful</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>You will comply with all applicable laws and regulations</span>
                      </li>
                    </ul>
                  </div>

                  <p className="text-sm italic text-gray-600">
                    We reserve the right to modify these Terms at any time. Your continued use of the Platform after changes 
                    are posted constitutes acceptance of the modified Terms.
                  </p>
                </section>

                {/* 2. Account Registration */}
                <section id="account" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <UserCheck size={24} className="text-[#e65100]" />
                    2. Account Registration and Security
                  </h2>
                  
                  <h3 className="mb-3 text-xl font-semibold text-gray-800">Creating an Account</h3>
                  <p className="mb-4 leading-relaxed text-gray-600">
                    To access certain features of our Platform, you may be required to create an account. When creating an account, 
                    you agree to:
                  </p>

                  <ul className="mb-6 ml-4 space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-[#e65100] font-bold mt-1">•</span>
                      <span>Provide accurate, current, and complete information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#e65100] font-bold mt-1">•</span>
                      <span>Maintain and promptly update your account information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#e65100] font-bold mt-1">•</span>
                      <span>Maintain the security of your password and account</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#e65100] font-bold mt-1">•</span>
                      <span>Accept responsibility for all activities that occur under your account</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#e65100] font-bold mt-1">•</span>
                      <span>Notify us immediately of any unauthorized use of your account</span>
                    </li>
                  </ul>

                  <h3 className="mb-3 text-xl font-semibold text-gray-800">Account Restrictions</h3>
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <p className="mb-2 text-sm text-gray-700">
                      <strong>You may not:</strong>
                    </p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <XCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Create multiple accounts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Share your account credentials with others</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Use another person's account without permission</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Create an account using false information or impersonate others</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 3. User Conduct and Responsibilities */}
                <section id="user-conduct" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Shield size={24} className="text-[#e65100]" />
                    3. User Conduct and Responsibilities
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    You agree to use our Platform in a lawful and respectful manner. The following activities are strictly prohibited:
                  </p>

                  <div className="grid grid-cols-1 gap-3 mb-6 md:grid-cols-2">
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <Ban size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Illegal Activities</h4>
                      <p className="text-xs text-gray-600">Any unlawful or fraudulent purposes</p>
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <Ban size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Harmful Content</h4>
                      <p className="text-xs text-gray-600">Harassment, hate speech, or threats</p>
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <Ban size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Intellectual Property Violation</h4>
                      <p className="text-xs text-gray-600">Infringing on copyrights or trademarks</p>
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <Ban size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">System Interference</h4>
                      <p className="text-xs text-gray-600">Hacking, viruses, or platform disruption</p>
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <Ban size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Data Scraping</h4>
                      <p className="text-xs text-gray-600">Unauthorized data collection or mining</p>
                    </div>
                    
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <Ban size={20} className="mb-2 text-red-600" />
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">Spam & Abuse</h4>
                      <p className="text-xs text-gray-600">Unsolicited messages or system abuse</p>
                    </div>
                  </div>

                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <p className="text-sm text-gray-700">
                      <strong>Warning:</strong> Violation of these rules may result in immediate suspension or termination of 
                      your account, and we may report illegal activities to law enforcement authorities.
                    </p>
                  </div>
                </section>

                {/* 4. Intellectual Property Rights */}
                <section id="intellectual-property" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Lock size={24} className="text-[#e65100]" />
                    4. Intellectual Property Rights
                  </h2>
                  
                  <h3 className="mb-3 text-xl font-semibold text-gray-800">Our Content</h3>
                  <p className="mb-4 leading-relaxed text-gray-600">
                    All content on the Platform, including but not limited to text, graphics, logos, images, software, and 
                    design, is the property of Junooni or its content suppliers and is protected by Indian and international 
                    copyright, trademark, and other intellectual property laws.
                  </p>

                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded mb-6">
                    <h4 className="mb-2 font-semibold text-gray-900">You may not:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Reproduce, distribute, modify, or create derivative works</li>
                      <li>• Use any content for commercial purposes without written permission</li>
                      <li>• Remove or alter copyright notices or other proprietary markings</li>
                      <li>• Frame or mirror any part of the Platform</li>
                    </ul>
                  </div>

                  <h3 className="mb-3 text-xl font-semibold text-gray-800">Creator Content</h3>
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Merchandise and content associated with specific creators remain the intellectual property of those creators 
                    or their licensors. Purchasing merchandise does not grant you any intellectual property rights beyond 
                    personal use of the physical item.
                  </p>

                  <h3 className="mb-3 text-xl font-semibold text-gray-800">User-Generated Content</h3>
                  <p className="leading-relaxed text-gray-600">
                    If you submit reviews, comments, or other content to our Platform, you grant Junooni a non-exclusive, 
                    royalty-free, perpetual, and worldwide license to use, reproduce, modify, and display such content in 
                    connection with our business operations.
                  </p>
                </section>

                {/* 5. Products and Pricing */}
                <section id="products" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Package size={24} className="text-[#e65100]" />
                    5. Products, Pricing, and Availability
                  </h2>
                  
                  <div className="mb-6 space-y-4">
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="mb-1 font-semibold text-gray-900">Product Descriptions</h4>
                      <p className="text-sm text-gray-600">
                        We strive to provide accurate product descriptions and images. However, we do not warrant that product 
                        descriptions, colors, or other content is accurate, complete, or error-free. Product images are for 
                        illustrative purposes and may differ slightly from the actual product.
                      </p>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="mb-1 font-semibold text-gray-900">Pricing</h4>
                      <p className="text-sm text-gray-600">
                        All prices are displayed in Indian Rupees (₹) and are inclusive of applicable taxes unless otherwise 
                        stated. We reserve the right to change prices at any time without notice. However, changes will not 
                        affect orders already placed.
                      </p>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="mb-1 font-semibold text-gray-900">Product Availability</h4>
                      <p className="text-sm text-gray-600">
                        Product availability is subject to change. We do not guarantee that products displayed on the Platform 
                        will be available when you place an order. We reserve the right to limit quantities or discontinue 
                        products at any time.
                      </p>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="mb-1 font-semibold text-gray-900">Errors and Corrections</h4>
                      <p className="text-sm text-gray-600">
                        If a product is listed at an incorrect price or with incorrect information due to an error, we reserve 
                        the right to refuse or cancel any orders for that product, whether or not the order has been confirmed.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 6. Payment Terms */}
                <section id="payment" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <CreditCard size={24} className="text-[#e65100]" />
                    6. Payment Terms
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    When you make a purchase through our Platform, you agree to provide current, complete, and accurate purchase 
                    and account information.
                  </p>

                  <div className="p-4 mb-4 border-l-4 border-blue-500 rounded bg-blue-50">
                    <h4 className="mb-2 font-semibold text-gray-900">Accepted Payment Methods:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Credit and Debit Cards (Visa, Mastercard, RuPay, etc.)</li>
                      <li>• UPI (Unified Payments Interface)</li>
                      <li>• Net Banking</li>
                      <li>• Digital Wallets (Paytm, PhonePe, Google Pay, etc.)</li>
                      <li>• Cash on Delivery (where available)</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">Payment Processing</h4>
                      <p className="text-sm leading-relaxed text-gray-600">
                        Payments are processed through secure third-party payment gateways. We do not store your complete credit 
                        card information on our servers. You authorize us to charge your payment method for the total amount of 
                        your order, including applicable taxes and shipping fees.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">Order Confirmation</h4>
                      <p className="text-sm leading-relaxed text-gray-600">
                        An order confirmation email does not constitute acceptance of your order. We reserve the right to accept 
                        or decline your order for any reason, including product availability, errors in pricing or product 
                        information, or suspected fraud.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 7. Shipping and Delivery */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">7. Shipping and Delivery</h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We aim to process and ship orders within 2-5 business days. Delivery times vary based on your location 
                    and the shipping method selected:
                  </p>

                  <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-semibold text-gray-900">Standard Shipping</h4>
                      <p className="text-sm text-gray-600">5-7 business days within India</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-semibold text-gray-900">Express Shipping</h4>
                      <p className="text-sm text-gray-600">2-3 business days (major cities)</p>
                    </div>
                  </div>

                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <p className="text-sm text-gray-700">
                      <strong>Important:</strong> Delivery times are estimates and not guaranteed. We are not responsible for 
                      delays caused by shipping carriers, customs clearance, natural disasters, or other circumstances beyond 
                      our control. Title and risk of loss pass to you upon delivery to the carrier.
                    </p>
                  </div>
                </section>

                {/* 8. Returns and Refunds */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">8. Returns and Refunds</h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Our Returns and Refunds Policy is an integral part of these Terms. Please review our complete policy for 
                    detailed information about:
                  </p>

                  <ul className="mb-4 ml-4 space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span>30-day return window</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Refund processing timelines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Non-returnable items</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Exchange procedures</span>
                    </li>
                  </ul>

                  <Link 
                    href="/refunds-returns" 
                    className="inline-flex items-center gap-2 text-[#e65100] font-medium hover:underline"
                  >
                    View Full Returns & Refunds Policy
                    <span>→</span>
                  </Link>
                </section>

                {/* 9. Disclaimer of Warranties */}
                <section id="disclaimer" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <AlertTriangle size={24} className="text-[#e65100]" />
                    9. Disclaimer of Warranties
                  </h2>
                  
                  <div className="p-4 mb-4 bg-gray-100 border-l-4 border-gray-500 rounded">
                    <p className="mb-3 text-sm font-semibold text-gray-700 uppercase">
                      IMPORTANT LEGAL NOTICE
                    </p>
                    <p className="text-sm leading-relaxed text-gray-700">
                      THE PLATFORM AND ALL PRODUCTS AND SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES 
                      OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMISSIBLE UNDER APPLICABLE LAW, JUNOONI 
                      DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF 
                      MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                    </p>
                  </div>

                  <p className="mb-4 leading-relaxed text-gray-600">
                    We do not warrant that:
                  </p>

                  <ul className="mb-4 ml-4 space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-gray-400">•</span>
                      <span>The Platform will be uninterrupted, secure, or error-free</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-gray-400">•</span>
                      <span>Defects will be corrected</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-gray-400">•</span>
                      <span>The Platform is free of viruses or harmful components</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-gray-400">•</span>
                      <span>The results of using the Platform will meet your requirements</span>
                    </li>
                  </ul>

                  <p className="text-sm italic text-gray-600">
                    Your use of the Platform is at your sole risk. You are responsible for implementing sufficient procedures 
                    and checkpoints to satisfy your requirements for accuracy and security.
                  </p>
                </section>

                {/* 10. Limitation of Liability */}
                <section id="liability" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Scale size={24} className="text-[#e65100]" />
                    10. Limitation of Liability
                  </h2>
                  
                  <div className="p-4 mb-4 border-l-4 border-red-500 rounded bg-red-50">
                    <p className="mb-2 text-sm font-semibold text-gray-700 uppercase">
                      LIABILITY LIMITATION
                    </p>
                    <p className="text-sm leading-relaxed text-gray-700">
                      TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL JUNOONI, ITS DIRECTORS, EMPLOYEES, 
                      PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
                      OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER 
                      INTANGIBLE LOSSES, RESULTING FROM:
                    </p>
                  </div>

                  <ul className="mb-6 ml-4 space-y-2 text-gray-600">
                    <li>(i) Your access to or use of or inability to access or use the Platform</li>
                    <li>(ii) Any conduct or content of any third party on the Platform</li>
                    <li>(iii) Any content obtained from the Platform</li>
                    <li>(iv) Unauthorized access, use, or alteration of your transmissions or content</li>
                  </ul>

                  <p className="text-sm leading-relaxed text-gray-600">
                    Our total liability to you for all claims arising from or related to the Platform shall not exceed the 
                    amount you paid to us in the twelve (12) months preceding the claim, or ₹1,000, whichever is greater.
                  </p>
                </section>

                {/* 11. Indemnification */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">11. Indemnification</h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    You agree to defend, indemnify, and hold harmless Junooni and its officers, directors, employees, contractors, 
                    agents, licensors, and suppliers from and against any claims, liabilities, damages, judgments, awards, losses, 
                    costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to:
                  </p>

                  <ul className="ml-4 space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-[#e65100] font-bold mt-1">•</span>
                      <span>Your violation of these Terms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#e65100] font-bold mt-1">•</span>
                      <span>Your violation of any rights of another party</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#e65100] font-bold mt-1">•</span>
                      <span>Your violation of any applicable laws or regulations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#e65100] font-bold mt-1">•</span>
                      <span>Your use or misuse of the Platform</span>
                    </li>
                  </ul>
                </section>

                {/* 12. Termination */}
                <section id="termination" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <XCircle size={24} className="text-[#e65100]" />
                    12. Termination
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We reserve the right to suspend or terminate your account and access to the Platform at our sole discretion, 
                    without notice or liability, for any reason, including but not limited to:
                  </p>

                  <div className="grid grid-cols-1 gap-3 mb-6 md:grid-cols-2">
                    <div className="p-3 border-l-4 border-gray-400 rounded-r-lg bg-gray-50">
                      <p className="text-sm text-gray-700">Breach of these Terms</p>
                    </div>
                    <div className="p-3 border-l-4 border-gray-400 rounded-r-lg bg-gray-50">
                      <p className="text-sm text-gray-700">Fraudulent or illegal activity</p>
                    </div>
                    <div className="p-3 border-l-4 border-gray-400 rounded-r-lg bg-gray-50">
                      <p className="text-sm text-gray-700">Violation of laws or regulations</p>
                    </div>
                    <div className="p-3 border-l-4 border-gray-400 rounded-r-lg bg-gray-50">
                      <p className="text-sm text-gray-700">Prolonged inactivity</p>
                    </div>
                  </div>

                  <p className="leading-relaxed text-gray-600">
                    Upon termination, your right to use the Platform will immediately cease. All provisions of these Terms 
                    which by their nature should survive termination shall survive, including ownership provisions, warranty 
                    disclaimers, indemnity, and limitations of liability.
                  </p>
                </section>

                {/* 13. Governing Law and Dispute Resolution */}
                <section id="governing-law" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Gavel size={24} className="text-[#e65100]" />
                    13. Governing Law and Dispute Resolution
                  </h2>
                  
                  <h3 className="mb-3 text-xl font-semibold text-gray-800">Governing Law</h3>
                  <p className="mb-4 leading-relaxed text-gray-600">
                    These Terms shall be governed by and construed in accordance with the laws of India, without regard to its 
                    conflict of law provisions. The courts of Aligarh, Uttar Pradesh, India shall have exclusive jurisdiction 
                    over any disputes arising out of or relating to these Terms.
                  </p>

                  <h3 className="mb-3 text-xl font-semibold text-gray-800">Dispute Resolution</h3>
                  <p className="mb-4 leading-relaxed text-gray-600">
                    In the event of any dispute arising out of or relating to these Terms or your use of the Platform, you agree 
                    to first contact us to attempt to resolve the dispute informally. If we cannot resolve the dispute within 
                    30 days, either party may initiate formal proceedings.
                  </p>

                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <p className="text-sm text-gray-700">
                      <strong>Notice:</strong> Any claims or disputes must be filed within one (1) year after the claim or 
                      cause of action arises, or such claim shall be permanently barred.
                    </p>
                  </div>
                </section>

                {/* 14. Privacy */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">14. Privacy and Data Protection</h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Your privacy is important to us. Our Privacy Policy explains how we collect, use, disclose, and protect 
                    your personal information. By using our Platform, you agree to the collection and use of information in 
                    accordance with our Privacy Policy.
                  </p>

                  <Link 
                    href="/privacy-policy" 
                    className="inline-flex items-center gap-2 text-[#e65100] font-medium hover:underline"
                  >
                    Read Our Privacy Policy
                    <span>→</span>
                  </Link>
                </section>

                {/* 15. Modifications to Terms */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">15. Modifications to Terms</h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision 
                    is material, we will provide at least 30 days' notice before any new terms take effect. What constitutes 
                    a material change will be determined at our sole discretion.
                  </p>

                  <p className="leading-relaxed text-gray-600">
                    By continuing to access or use our Platform after revisions become effective, you agree to be bound by the 
                    revised Terms. If you do not agree to the new Terms, you must stop using the Platform.
                  </p>
                </section>

                {/* 16. Severability */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">16. Severability</h2>
                  
                  <p className="leading-relaxed text-gray-600">
                    If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent 
                    jurisdiction, such provision shall be modified to the minimum extent necessary to make it enforceable while 
                    preserving its intent, or if such modification is not possible, such provision shall be severed from these 
                    Terms. The remaining provisions shall continue in full force and effect.
                  </p>
                </section>

                {/* 17. Entire Agreement */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">17. Entire Agreement</h2>
                  
                  <p className="leading-relaxed text-gray-600">
                    These Terms, together with our Privacy Policy and Returns & Refunds Policy, constitute the entire agreement 
                    between you and Junooni regarding your use of the Platform and supersede all prior agreements, understandings, 
                    and communications, whether written or oral, regarding the subject matter herein.
                  </p>
                </section>

                {/* 18. Contact Information */}
                <section id="contact" className="scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Mail size={24} className="text-[#e65100]" />
                    18. Contact Information
                  </h2>
                  
                  <p className="mb-6 leading-relaxed text-gray-600">
                    If you have any questions, concerns, or comments about these Terms, please contact us:
                  </p>
                  
                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-6 rounded-lg">
                    <h3 className="mb-4 font-bold text-gray-900">Junooni Legal Team</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail size={20} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <a href="mailto:support@junooni.com" className="text-[#e65100] hover:underline">
                            support@junooni.com
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Phone size={20} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Phone</p>
                          <a href="tel:+918694062222" className="text-[#e65100] hover:underline">
                            +91 8694062222
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Junooni Address</p>
                          <p className="text-sm text-gray-600">
                            Junooni<br />
                            Saharanpur, Uttar Pradesh, India
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Acknowledgment */}
                <div className="pt-6 mt-8 border-t border-gray-200">
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <p className="text-sm text-gray-700">
                      <strong>Acknowledgment:</strong> BY USING OUR PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS 
                      AND CONDITIONS, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. IF YOU DO NOT AGREE TO THESE TERMS, YOU 
                      MUST NOT USE OUR PLATFORM.
                    </p>
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
      
      {/* Footer */}
      {/* <footer className="py-6 mt-12 bg-white border-t">
        <div className="container px-4 mx-auto text-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Junooni. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <Link href="/terms" className="text-sm text-[#e65100] font-medium">Terms & Conditions</Link>
            <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-[#e65100]">Privacy Policy</Link>
            <Link href="/refunds-returns" className="text-sm text-gray-500 hover:text-[#e65100]">Returns & Refunds</Link>
            <Link href="/help" className="text-sm text-gray-500 hover:text-[#e65100]">Help Center</Link>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default TermsConditionsPage;