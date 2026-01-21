'use client';

import React from "react";
import Link from "next/link";
import { 
  ShoppingBag, Shield, Lock, Eye, UserCheck, 
  FileText, Mail, Globe, Cookie, Database, MapPin, Phone,
  AlertCircle, CheckCircle, Clock, Scale, Users, Bell
} from "lucide-react";

const PrivacyPolicyPage = () => {
  // Section data for easy navigation
  const sections = [
    { id: "introduction", title: "Introduction", icon: <FileText size={20} /> },
    { id: "information-collection", title: "Information We Collect", icon: <Database size={20} /> },
    { id: "legal-basis", title: "Legal Basis for Processing", icon: <Scale size={20} /> },
    { id: "how-we-use", title: "How We Use Your Information", icon: <Eye size={20} /> },
    { id: "information-sharing", title: "Information Sharing", icon: <Globe size={20} /> },
    { id: "data-security", title: "Data Security", icon: <Lock size={20} /> },
    { id: "data-retention", title: "Data Retention", icon: <Clock size={20} /> },
    { id: "your-rights", title: "Your Rights (DPDPA)", icon: <UserCheck size={20} /> },
    { id: "consent", title: "Consent Management", icon: <CheckCircle size={20} /> },
    { id: "cookies", title: "Cookies & Tracking", icon: <Cookie size={20} /> },
    { id: "childrens-privacy", title: "Children's Privacy", icon: <Shield size={20} /> },
    { id: "data-breach", title: "Data Breach Notification", icon: <Bell size={20} /> },
    { id: "grievance", title: "Grievance Redressal", icon: <AlertCircle size={20} /> },
    { id: "changes", title: "Policy Changes", icon: <FileText size={20} /> },
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
              <Shield size={32} />
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">Privacy Policy</h1>
            <p className="text-lg opacity-90">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <p className="mt-2 text-sm opacity-75">Last Updated: January 21, 2026</p>
            <p className="mt-1 text-xs opacity-75">Effective Date: January 21, 2026</p>
          </div>
        </div>
      </div>
      
      <main className="container px-4 py-8 mx-auto md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* DPDPA Compliance Notice */}
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield size={24} className="text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">DPDPA 2023 Compliance</h3>
                <p className="text-sm text-gray-700">
                  This Privacy Policy is compliant with India's Digital Personal Data Protection Act, 2023 (DPDPA) 
                  and Consumer Protection (E-Commerce) Rules, 2020. We are committed to protecting your personal data 
                  and respecting your privacy rights under Indian law.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Sidebar Navigation - Hidden on mobile */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky p-4 bg-white rounded-lg shadow-sm top-24">
                <h3 className="mb-4 font-bold text-gray-900">Quick Navigation</h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#e65100] hover:bg-orange-50 px-3 py-2 rounded-md transition-colors w-full text-left"
                    >
                      {section.icon}
                      <span>{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="p-6 bg-white rounded-lg shadow-sm md:p-8">
                
                {/* Introduction */}
                <section id="introduction" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <FileText size={24} className="text-[#e65100]" />
                    Introduction
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Welcome to Junooni, a creator merchandise marketplace platform operating in India. We are committed to 
                    protecting your privacy and ensuring the security of your personal data in accordance with India's 
                    Digital Personal Data Protection Act, 2023 (DPDPA) and all applicable Indian laws.
                  </p>

                  {/* <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Who We Are (Data Fiduciary)</h3>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Legal Name:</strong> Junooni<br />
                      <strong>Business Type:</strong> E-Commerce Marketplace (Print-on-Demand)<br />
                      <strong>Registered Address:</strong> Saharanpur, Uttar Pradesh, India<br />
                      <strong>Website:</strong> https://junooni.com<br />
                      <strong>Email:</strong> support@junooni.com<br />
                      <strong>Phone:</strong> +91 8694062222
                    </p>
                    <p className="text-sm text-gray-700">
                      Under DPDPA 2023, Junooni acts as a "Data Fiduciary" - we determine the purposes and means 
                      of processing your personal data.
                    </p>
                  </div> */}

                  <p className="leading-relaxed text-gray-600">
                    This Privacy Policy explains how we collect, use, disclose, store, and protect your personal data 
                    when you use our website, mobile applications, and services. Please read this policy carefully to 
                    understand our practices regarding your personal data and how we will treat it.
                  </p>
                </section>

                {/* 1. Information We Collect */}
                <section id="information-collection" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Database size={24} className="text-[#e65100]" />
                    1. What Personal Data We Collect
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Under DPDPA 2023, "personal data" means any data about an individual who is identifiable by or in 
                    relation to such data. We collect the following categories of personal data:
                  </p>

                  <h3 className="mb-3 text-xl font-semibold text-gray-800">A. Information You Provide to Us</h3>
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We collect personal data that you voluntarily provide when you:
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Account Registration</h4>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                        <li>Full name</li>
                        <li>Email address</li>
                        <li>Phone number (mobile)</li>
                        <li>Password (encrypted)</li>
                        <li>Date of birth (to verify age 18+)</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Order & Delivery Information</h4>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                        <li>Shipping address (name, street, city, state, PIN code)</li>
                        <li>Billing address</li>
                        <li>Order details and preferences</li>
                        <li>Product customizations (designs, text, images you upload)</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Payment Information</h4>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                        <li>Payment method details (processed securely by Razorpay)</li>
                        <li>Transaction history</li>
                        <li>Billing information</li>
                      </ul>
                      <p className="text-xs text-gray-500 mt-2">
                        Note: We do NOT store full credit/debit card numbers. Payment processing is handled by our 
                        PCI-DSS compliant payment processor, Razorpay.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Communications</h4>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                        <li>Customer service inquiries and correspondence</li>
                        <li>Product reviews and ratings</li>
                        <li>Survey responses</li>
                        <li>Feedback and complaints</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Marketing Preferences (Optional)</h4>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                        <li>Newsletter subscription preferences</li>
                        <li>Communication channel preferences (email, SMS, WhatsApp)</li>
                        <li>Product and creator interests</li>
                      </ul>
                    </div>
                  </div>

                  <h3 className="mb-3 text-xl font-semibold text-gray-800">B. Information Collected Automatically</h3>
                  <p className="mb-4 leading-relaxed text-gray-600">
                    When you visit our website or use our services, we automatically collect certain technical information:
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <ul className="text-sm text-gray-600 space-y-2 ml-4 list-disc">
                      <li><strong>Device Information:</strong> Device type, operating system, browser type and version, device identifiers</li>
                      <li><strong>Usage Data:</strong> Pages visited, time spent on pages, navigation paths, features used</li>
                      <li><strong>Location Data:</strong> IP address, approximate geographic location (city/state level)</li>
                      <li><strong>Cookies & Tracking:</strong> Cookie identifiers, session data (see Cookie Policy section)</li>
                      <li><strong>Analytics Data:</strong> Aggregated website performance and user behavior metrics</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <AlertCircle size={20} className="text-blue-600" />
                      Data Minimization Principle
                    </h4>
                    <p className="text-sm text-gray-700">
                      In compliance with DPDPA 2023, we only collect personal data that is necessary for the specific 
                      purposes outlined in this policy. We do not collect excessive or irrelevant information.
                    </p>
                  </div>
                </section>

                {/* 2. Legal Basis for Processing */}
                <section id="legal-basis" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Scale size={24} className="text-[#e65100]" />
                    2. Legal Basis for Processing Your Data
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Under DPDPA 2023, we can only process your personal data based on one of the following legal grounds:
                  </p>

                  <div className="space-y-4">
                    <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                      <h4 className="font-semibold text-gray-900 mb-2">1. Your Consent</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        For most processing activities, we rely on your explicit, informed, and freely given consent. 
                        This includes:
                      </p>
                      <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                        <li>Marketing communications (newsletters, promotional offers)</li>
                        <li>Non-essential cookies and analytics</li>
                        <li>Sharing data with third-party partners (beyond essential service providers)</li>
                      </ul>
                      <p className="text-xs text-gray-600 mt-2">
                        You can withdraw your consent at any time (see Section 9: Consent Management).
                      </p>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                      <h4 className="font-semibold text-gray-900 mb-2">2. Legitimate Uses (Without Consent)</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        We may process your data without explicit consent for certain legitimate purposes under DPDPA 2023:
                      </p>
                      <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                        <li><strong>Order Fulfillment:</strong> Processing orders and delivering products you purchased</li>
                        <li><strong>Legal Compliance:</strong> Complying with tax, accounting, and regulatory obligations</li>
                        <li><strong>Fraud Prevention:</strong> Preventing fraud, unauthorized transactions, and security threats</li>
                        <li><strong>Contractual Necessity:</strong> Performing our contract with you (Terms of Service)</li>
                        <li><strong>Voluntary Data Sharing:</strong> When you voluntarily provide data and do not indicate non-consent</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 3. How We Use Your Information */}
                <section id="how-we-use" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Eye size={24} className="text-[#e65100]" />
                    3. How We Use Your Personal Data (Purposes)
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We use your personal data only for the specific purposes for which it was collected, as disclosed 
                    at the time of collection. These purposes include:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded">
                      <h4 className="font-semibold text-gray-900 mb-2">A. Order Processing & Fulfillment</h4>
                      <p className="text-sm text-gray-700">
                        To process your orders, coordinate with our fulfillment partner (Qikink), arrange shipping with 
                        logistics providers, handle returns/refunds, and provide customer support related to your purchases.
                      </p>
                      <p className="text-xs text-gray-600 mt-1"><strong>Legal Basis:</strong> Contractual necessity</p>
                    </div>
                    
                    <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded">
                      <h4 className="font-semibold text-gray-900 mb-2">B. Account Management & Authentication</h4>
                      <p className="text-sm text-gray-700">
                        To create and manage your account, verify your identity, enable secure login, maintain order history, 
                        and provide personalized account features.
                      </p>
                      <p className="text-xs text-gray-600 mt-1"><strong>Legal Basis:</strong> Contractual necessity</p>
                    </div>
                    
                    <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded">
                      <h4 className="font-semibold text-gray-900 mb-2">C. Transaction Processing & Payment</h4>
                      <p className="text-sm text-gray-700">
                        To process payments securely through Razorpay, maintain transaction records, detect fraudulent 
                        transactions, and comply with financial regulations.
                      </p>
                      <p className="text-xs text-gray-600 mt-1"><strong>Legal Basis:</strong> Contractual necessity, Legal compliance</p>
                    </div>
                    
                    <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded">
                      <h4 className="font-semibold text-gray-900 mb-2">D. Communication & Customer Service</h4>
                      <p className="text-sm text-gray-700">
                        To send order confirmations, shipping notifications, delivery updates, respond to inquiries, 
                        provide technical support, and communicate important service changes.
                      </p>
                      <p className="text-xs text-gray-600 mt-1"><strong>Legal Basis:</strong> Contractual necessity</p>
                    </div>
                    
                    <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded">
                      <h4 className="font-semibold text-gray-900 mb-2">E. Marketing & Promotional Communications (WITH CONSENT)</h4>
                      <p className="text-sm text-gray-700">
                        To send newsletters, promotional offers, personalized product recommendations, new creator 
                        announcements, and special deals. <strong>You must opt-in to receive marketing communications.</strong>
                      </p>
                      <p className="text-xs text-gray-600 mt-1"><strong>Legal Basis:</strong> Explicit consent (can be withdrawn anytime)</p>
                    </div>
                    
                    <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded">
                      <h4 className="font-semibold text-gray-900 mb-2">F. Platform Improvement & Analytics</h4>
                      <p className="text-sm text-gray-700">
                        To analyze website usage patterns, understand user preferences, improve our services, develop 
                        new features, optimize user experience, and fix technical issues.
                      </p>
                      <p className="text-xs text-gray-600 mt-1"><strong>Legal Basis:</strong> Consent (for analytics cookies)</p>
                    </div>
                    
                    <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded">
                      <h4 className="font-semibold text-gray-900 mb-2">G. Security & Fraud Prevention</h4>
                      <p className="text-sm text-gray-700">
                        To detect and prevent fraud, unauthorized access, security threats, spam, and abuse of our platform. 
                        To maintain security logs and conduct security audits.
                      </p>
                      <p className="text-xs text-gray-600 mt-1"><strong>Legal Basis:</strong> Legitimate use (security)</p>
                    </div>
                    
                    <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded">
                      <h4 className="font-semibold text-gray-900 mb-2">H. Legal Compliance & Regulatory Requirements</h4>
                      <p className="text-sm text-gray-700">
                        To comply with tax regulations (GST), maintain financial records, respond to legal requests, 
                        enforce our Terms of Service, and fulfill regulatory obligations under Indian law.
                      </p>
                      <p className="text-xs text-gray-600 mt-1"><strong>Legal Basis:</strong> Legal compliance</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle size={20} className="text-purple-600" />
                      Purpose Limitation Principle
                    </h4>
                    <p className="text-sm text-gray-700">
                      We will ONLY use your personal data for the specific purposes disclosed in this policy. We will 
                      NOT use your data for any other purpose without obtaining your fresh consent.
                    </p>
                  </div>
                </section>

                {/* 4. Information Sharing */}
                <section id="information-sharing" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Globe size={24} className="text-[#e65100]" />
                    4. How We Share Your Personal Data (Data Processors)
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We share your personal data with trusted third-party service providers ("Data Processors" under DPDPA 2023) 
                    who help us operate our business. All data processors are contractually obligated to protect your data 
                    and use it only for the specific purposes we authorize.
                  </p>

                  {/* <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">A. Order Fulfillment Partner</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Service Provider:</strong> Qikink (Print-on-Demand fulfillment)<br />
                        <strong>Data Shared:</strong> Name, phone, shipping address, order details, product customizations<br />
                        <strong>Purpose:</strong> Manufacturing and shipping your custom products<br />
                        <strong>Location:</strong> India
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">B. Payment Processing</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Service Provider:</strong> Razorpay (Payment Gateway)<br />
                        <strong>Data Shared:</strong> Payment information, billing address, transaction amount<br />
                        <strong>Purpose:</strong> Secure payment processing<br />
                        <strong>Security:</strong> PCI-DSS Level 1 compliant<br />
                        <strong>Location:</strong> India
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">C. Shipping & Logistics Partners</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Service Providers:</strong> Various courier companies (BlueDart, Delhivery, etc.)<br />
                        <strong>Data Shared:</strong> Name, phone number, delivery address, order ID<br />
                        <strong>Purpose:</strong> Package delivery and tracking<br />
                        <strong>Location:</strong> India
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">D. Communication Services</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Service Providers:</strong> Email service providers (for transactional emails)<br />
                        <strong>Data Shared:</strong> Email address, name, order information<br />
                        <strong>Purpose:</strong> Sending order confirmations, shipping updates, support communications<br />
                        <strong>Location:</strong> May include servers outside India (with appropriate safeguards)
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">E. Analytics & Performance Monitoring</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Service Providers:</strong> Analytics platforms (if used)<br />
                        <strong>Data Shared:</strong> Anonymized usage data, device information, browsing behavior<br />
                        <strong>Purpose:</strong> Website performance analysis and improvement<br />
                        <strong>Note:</strong> Only shared with your consent for analytics cookies
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">F. Customer Support Tools</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Service Providers:</strong> Customer service platforms<br />
                        <strong>Data Shared:</strong> Name, email, order history, support inquiries<br />
                        <strong>Purpose:</strong> Providing efficient customer support<br />
                        <strong>Location:</strong> India
                      </p>
                    </div>
                  </div> */}

                  {/* <h3 className="mb-3 text-xl font-semibold text-gray-800">Other Disclosures</h3> */}
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Creator Partners (Limited)</h4>
                      <p className="text-sm text-gray-600">
                        For creator-specific merchandise, we may share minimal order information (order ID, product, status) 
                        with the relevant creator. We do NOT share your personal contact details or payment information with creators.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Legal Authorities</h4>
                      <p className="text-sm text-gray-600">
                        We may disclose your information if required by law, court order, government investigation, or to 
                        protect our legal rights, prevent fraud, or ensure public safety.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Business Transfers</h4>
                      <p className="text-sm text-gray-600">
                        In the event of a merger, acquisition, or sale of assets, your information may be transferred. 
                        We will notify you via email and website notice before such transfer.
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <AlertCircle size={20} className="text-red-600" />
                      What We DO NOT Do
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                      <li>We do NOT sell your personal data to third parties</li>
                      <li>We do NOT rent or trade your information for marketing purposes</li>
                      <li>We do NOT share your data for purposes other than those disclosed in this policy</li>
                    </ul>
                  </div>
                </section>

                {/* 5. Data Security */}
                <section id="data-security" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Lock size={24} className="text-[#e65100]" />
                    5. Data Security Measures
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We implement appropriate technical and organizational security measures to protect your personal data 
                    against unauthorized access, accidental loss, destruction, or damage, as required by DPDPA 2023:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Technical Measures</h4>
                      <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                        <li>SSL/TLS encryption for data transmission</li>
                        <li>Encrypted storage of sensitive data</li>
                        <li>Secure password hashing (bcrypt)</li>
                        <li>Firewall protection</li>
                        <li>Regular security updates and patches</li>
                        <li>Intrusion detection systems</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Organizational Measures</h4>
                      <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                        <li>Access controls and authentication</li>
                        <li>Employee data protection training</li>
                        <li>Confidentiality agreements</li>
                        <li>Regular security audits</li>
                        <li>Incident response procedures</li>
                        <li>Data minimization practices</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Payment Security</h4>
                    <p className="text-sm text-gray-700">
                      All payment transactions are processed through Razorpay, a PCI-DSS Level 1 certified payment gateway. 
                      We do NOT store your complete credit/debit card numbers on our servers. Only the last 4 digits are 
                      stored for order reference purposes.
                    </p>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                    <h4 className="font-semibold text-gray-900 mb-2">Security Logging & Monitoring</h4>
                    <p className="text-sm text-gray-700">
                      In compliance with DPDPA 2023, we maintain security logs to detect and prevent unauthorized access 
                      to personal data. These logs are retained for a minimum of one (1) year.
                    </p>
                  </div>
                  
                  <div className="mt-4 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <p className="text-sm text-gray-700">
                      <strong>Important Disclaimer:</strong> While we implement industry-standard security measures, 
                      no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee 
                      absolute security. You are responsible for maintaining the confidentiality of your account password 
                      and for any activities under your account.
                    </p>
                  </div>
                </section>

                {/* 6. Data Retention */}
                <section id="data-retention" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Clock size={24} className="text-[#e65100]" />
                    6. Data Retention & Deletion
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Under DPDPA 2023, we must delete your personal data once the purpose for which it was collected has 
                    been fulfilled, unless retention is required by law. Here are our retention periods:
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                      <h4 className="font-semibold text-gray-900">Account Information</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Retention:</strong> Until account deletion + 30 days for backup removal<br />
                        <strong>Deletion Trigger:</strong> When you delete your account or request data deletion
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                      <h4 className="font-semibold text-gray-900">Order & Transaction Data</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Retention:</strong> 7 years from transaction date<br />
                        <strong>Legal Basis:</strong> Required for tax compliance (GST, Income Tax Act), accounting records, 
                        and dispute resolution
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                      <h4 className="font-semibold text-gray-900">Marketing Communications Data</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Retention:</strong> Until unsubscribe + 30 days<br />
                        <strong>Deletion Trigger:</strong> When you withdraw marketing consent or unsubscribe
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                      <h4 className="font-semibold text-gray-900">Customer Service Communications</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Retention:</strong> 3 years from last interaction<br />
                        <strong>Purpose:</strong> Quality assurance, dispute resolution, service improvement
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                      <h4 className="font-semibold text-gray-900">Security Logs</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Retention:</strong> Minimum 1 year (as required by DPDPA Rules)<br />
                        <strong>Purpose:</strong> Security monitoring, breach detection, compliance verification
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                      <h4 className="font-semibold text-gray-900">Website Analytics Data</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Retention:</strong> 26 months (anonymized after 14 months)<br />
                        <strong>Purpose:</strong> Website improvement, user experience optimization
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                      <h4 className="font-semibold text-gray-900">Cookie Data</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Retention:</strong> Varies by cookie type (see Cookie Policy)<br />
                        <strong>Typical Range:</strong> Session cookies (deleted on browser close) to 2 years (persistent cookies)
                      </p>
                    </div>
                  </div>

                  <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
                    <h4 className="font-semibold text-gray-900 mb-2">Automated Deletion Workflows</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      We have implemented automated systems to delete personal data when retention periods expire:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                      <li>Automated account data deletion 30 days after account closure</li>
                      <li>Automated marketing list cleanup after unsubscribe</li>
                      <li>Scheduled purging of expired cookies and session data</li>
                      <li>48-hour advance notice before automated deletion (as required by DPDPA)</li>
                    </ul>
                  </div>
                </section>

                {/* 7. Your Rights (DPDPA) */}
                <section id="your-rights" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <UserCheck size={24} className="text-[#e65100]" />
                    7. Your Rights Under DPDPA 2023
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    As a "Data Principal" under India's Digital Personal Data Protection Act, 2023, you have the following rights:
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                      <div className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Right to Access</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Request a summary of your personal data we have processed, details about how we use it, 
                            and a list of all data processors who have access to your data.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                      <div className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Right to Correction</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Request correction or completion of inaccurate or incomplete personal data. You can also 
                            update most information directly in your account settings.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                      <div className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Right to Erasure (Deletion)</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Request deletion of your personal data when it is no longer necessary for the purpose 
                            collected, or when you withdraw consent (subject to legal retention requirements).
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                      <div className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Right to Data Portability</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Request a copy of your personal data in a structured, commonly used, and machine-readable 
                            format (such as CSV or JSON) to transfer to another service provider.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                      <div className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Right to Withdraw Consent</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Withdraw your consent for any processing activities based on consent (e.g., marketing, 
                            analytics cookies). Withdrawal does not affect past processing but stops future processing.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                      <div className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Right to Nominate</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Nominate another individual (during your lifetime) to exercise your rights in the event 
                            of death or incapacity. Contact us to set up a nominee.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                      <div className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Right to Grievance Redressal</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            File complaints with our Grievance Officer or with the Data Protection Board of India 
                            if you believe your rights have been violated.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">How to Exercise Your Rights</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      To exercise any of the above rights, please contact us:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li><strong>Email:</strong> <a href="mailto:support@junooni.com" className="text-[#e65100] hover:underline">support@junooni.com</a></li>
                      <li><strong>Subject Line:</strong> Include "DPDPA Rights Request" with specific right (e.g., "Right to Access")</li>
                      <li><strong>Information Needed:</strong> Your full name, registered email, order ID (if applicable), and specific request details</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Response Timeline</h4>
                    <p className="text-sm text-gray-700">
                      We will respond to your request within a <strong>reasonable timeframe</strong> as required by DPDPA 2023. 
                      In most cases, we aim to respond within <strong>30 days</strong> of receiving your complete request. 
                      Complex requests may require additional time, and we will notify you of any extension.
                    </p>
                  </div>
                </section>

                {/* 8. Consent Management */}
                <section id="consent" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <CheckCircle size={24} className="text-[#e65100]" />
                    9. Consent Management
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Under DPDPA 2023, your consent must be free, specific, informed, unconditional, and unambiguous. 
                    Here's how we obtain and manage your consent:
                  </p>

                  <div className="space-y-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                      <h4 className="font-semibold text-gray-900 mb-2">How We Obtain Consent</h4>
                      <ul className="text-sm text-gray-700 space-y-2 ml-4 list-disc">
                        <li><strong>Clear Affirmative Action:</strong> You must actively check boxes or click buttons - no pre-checked boxes</li>
                        <li><strong>Granular Consent:</strong> Separate consent options for different purposes (e.g., separate checkboxes for marketing emails vs SMS)</li>
                        <li><strong>Informed Notice:</strong> We provide clear information about what data we collect and why before asking for consent</li>
                        <li><strong>Easy to Understand:</strong> Consent requests use simple, plain language (no legal jargon)</li>
                        <li><strong>No Bundling:</strong> Consent for one purpose is not bundled with consent for unrelated purposes</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                      <h4 className="font-semibold text-gray-900 mb-2">Types of Consent We Seek</h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p><strong>1. Account Creation:</strong> Consent to create account and process your data for service delivery</p>
                        <p><strong>2. Marketing Communications:</strong> Separate consent for email newsletters, SMS, and WhatsApp promotions</p>
                        <p><strong>3. Analytics Cookies:</strong> Consent for non-essential cookies that track website usage</p>
                        <p><strong>4. Third-Party Data Sharing:</strong> Consent for sharing data with partners beyond essential service providers</p>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                      <h4 className="font-semibold text-gray-900 mb-2">How to Withdraw Consent</h4>
                      <p className="text-sm text-gray-700 mb-3">
                        You can withdraw your consent at any time, easily and free of charge:
                      </p>
                      <ul className="text-sm text-gray-700 space-y-2 ml-4 list-disc">
                        <li><strong>Marketing Emails:</strong> Click "Unsubscribe" link in any marketing email</li>
                        <li><strong>Account Settings:</strong> Manage communication preferences in your account dashboard</li>
                        <li><strong>Cookies:</strong> Adjust cookie preferences through our cookie banner or browser settings</li>
                        <li><strong>Email Request:</strong> Send withdrawal request to <a href="mailto:support@junooni.com" className="text-[#e65100] hover:underline">support@junooni.com</a></li>
                      </ul>
                      <p className="text-xs text-gray-600 mt-3">
                        <strong>Note:</strong> Withdrawing consent does not affect the lawfulness of processing before withdrawal 
                        and does not affect processing based on other legal grounds (contractual necessity, legal compliance).
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded">
                    <h4 className="font-semibold text-gray-900 mb-2">Consequences of Withdrawing Consent</h4>
                    <p className="text-sm text-gray-700">
                      If you withdraw consent for essential services (e.g., order processing, account management), we may 
                      not be able to provide you with our services. However, you can always withdraw consent for non-essential 
                      activities like marketing communications without affecting your ability to use the platform.
                    </p>
                  </div>
                </section>

                {/* 9. Cookies & Tracking */}
                <section id="cookies" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Cookie size={24} className="text-[#e65100]" />
                    10. Cookies and Tracking Technologies
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We use cookies and similar tracking technologies to enhance your browsing experience, analyze website 
                    traffic, and deliver personalized content. Cookies are small text files stored on your device.
                  </p>
                  
                  <h3 className="mb-3 text-xl font-semibold text-gray-800">Types of Cookies We Use:</h3>
                  
                  <div className="mb-6 space-y-3">
                    <div className="p-4 rounded-lg bg-gray-50 border-l-4 border-green-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">Essential Cookies (No Consent Required)</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Strictly necessary for website functionality. Cannot be disabled.
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            <strong>Examples:</strong> Shopping cart, login session, security, load balancing
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50 border-l-4 border-blue-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">Functionality Cookies (Consent Required)</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Remember your preferences and choices (language, region, display settings).
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            <strong>Examples:</strong> Language preference, currency selection, saved filters
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50 border-l-4 border-purple-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">Analytics Cookies (Consent Required)</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Help us understand how visitors use our website (pages visited, time spent, errors).
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            <strong>Examples:</strong> Google Analytics (if used), website performance monitoring
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50 border-l-4 border-orange-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">Marketing Cookies (Consent Required)</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Track your browsing across websites to display relevant advertisements.
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            <strong>Examples:</strong> Facebook Pixel, Google Ads (if used), retargeting cookies
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Cookie Consent Management</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      When you first visit our website, you will see a cookie consent banner allowing you to:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                      <li>Accept all cookies</li>
                      <li>Reject non-essential cookies</li>
                      <li>Customize cookie preferences (granular control)</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">How to Control Cookies</h4>
                    <ul className="text-sm text-gray-700 space-y-2 ml-4 list-disc">
                      <li><strong>Browser Settings:</strong> Configure your browser to block or delete cookies (Note: This may affect website functionality)</li>
                      <li><strong>Cookie Preferences:</strong> Change your choices anytime through our cookie settings (link in footer)</li>
                      <li><strong>Third-Party Opt-Outs:</strong> Opt out of interest-based advertising through industry platforms</li>
                    </ul>
                  </div>
                </section>

                {/* 10. Children's Privacy */}
                <section id="childrens-privacy" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Shield size={24} className="text-[#e65100]" />
                    11. Children's Privacy & Age Verification
                  </h2>
                  
                  <div className="bg-red-50 border-2 border-red-600 p-6 rounded-lg mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={32} className="text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2">AGE REQUIREMENT: 18 Years and Above</h3>
                        <p className="text-sm text-gray-700 mb-3">
                          Our services are intended ONLY for individuals who are <strong>18 years of age or older</strong>. 
                          Under DPDPA 2023, individuals under 18 are considered "children" and require verifiable parental 
                          consent for data processing.
                        </p>
                        <p className="text-sm text-gray-700 font-semibold">
                          WE DO NOT KNOWINGLY COLLECT PERSONAL DATA FROM ANYONE UNDER 18 YEARS OF AGE.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                      <h4 className="font-semibold text-gray-900 mb-2">Age Verification</h4>
                      <p className="text-sm text-gray-700">
                        During account registration, you must confirm that you are at least 18 years old. By creating an 
                        account, you represent and warrant that you meet this age requirement.
                      </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-[#e65100]">
                      <h4 className="font-semibold text-gray-900 mb-2">If You Are a Parent or Guardian</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        If you believe your child under 18 has provided us with personal data without your knowledge:
                      </p>
                      <ol className="text-sm text-gray-700 space-y-1 ml-4 list-decimal">
                        <li>Contact us immediately at <a href="mailto:support@junooni.com" className="text-[#e65100] hover:underline">support@junooni.com</a></li>
                        <li>Provide proof of parental authority</li>
                        <li>We will verify and delete the account and all associated data within 48 hours</li>
                      </ol>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                      <h4 className="font-semibold text-gray-900 mb-2">DPDPA 2023 Compliance for Children's Data</h4>
                      <p className="text-sm text-gray-700">
                        If we become aware that we have collected personal data from anyone under 18 without verifiable 
                        parental consent, we will:
                      </p>
                      <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc mt-2">
                        <li>Immediately cease processing the data</li>
                        <li>Delete all personal data from our systems</li>
                        <li>Notify the Data Protection Board of India if required</li>
                        <li>Take steps to prevent future collection</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 11. Data Breach Notification */}
                <section id="data-breach" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Bell size={24} className="text-[#e65100]" />
                    12. Data Breach Notification Protocol
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Under DPDPA 2023, we have implemented a comprehensive data breach response protocol to protect your 
                    personal data and notify you promptly in case of any breach.
                  </p>

                  <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">72-Hour Notification Requirement</h4>
                    <p className="text-sm text-gray-700">
                      If we detect a data breach that poses a risk to your rights, we will notify the <strong>Data Protection 
                      Board of India within 72 hours</strong> of becoming aware of the breach, as required by DPDPA Rules.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">What Constitutes a Data Breach</h4>
                      <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                        <li>Unauthorized access to personal data</li>
                        <li>Accidental loss or destruction of personal data</li>
                        <li>Unlawful disclosure or sharing of personal data</li>
                        <li>Alteration or modification of personal data without authorization</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">How We Will Notify You</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        If a breach affects your personal data, we will notify you promptly through:
                      </p>
                      <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                        <li>Email to your registered email address</li>
                        <li>Prominent notice on our website homepage</li>
                        <li>In-app notification (if applicable)</li>
                        <li>SMS notification (for high-risk breaches)</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Information We Will Provide</h4>
                      <p className="text-sm text-gray-700 mb-2">Our breach notification will include:</p>
                      <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                        <li>Description of the breach and types of data affected</li>
                        <li>Estimated number of affected users</li>
                        <li>Potential consequences and risks</li>
                        <li>Actions we have taken to address the breach</li>
                        <li>Steps you should take to protect yourself</li>
                        <li>Contact information for questions and concerns</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Our Breach Response Procedures</h4>
                      <ol className="text-sm text-gray-700 space-y-2 ml-4 list-decimal">
                        <li><strong>Detection & Containment:</strong> Identify and contain the breach immediately</li>
                        <li><strong>Assessment:</strong> Evaluate the scope, severity, and affected data</li>
                        <li><strong>Notification:</strong> Notify DPB within 72 hours and affected users promptly</li>
                        <li><strong>Remediation:</strong> Fix vulnerabilities and strengthen security measures</li>
                        <li><strong>Documentation:</strong> Maintain detailed records of the breach and response</li>
                        <li><strong>Review:</strong> Conduct post-incident review to prevent future breaches</li>
                      </ol>
                    </div>
                  </div>
                </section>

                {/* 12. Grievance Redressal */}
                <section id="grievance" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <AlertCircle size={24} className="text-[#e65100]" />
                    13. Grievance Redressal Mechanism
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    In compliance with Consumer Protection (E-Commerce) Rules 2020 and DPDPA 2023, we have established a 
                    comprehensive grievance redressal mechanism to address your concerns and complaints.
                  </p>

                  <div className="bg-orange-50 border-2 border-[#e65100] p-6 rounded-lg mb-6">
                    <h3 className="font-bold text-gray-900 mb-4">Grievance Officer Details</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Name:</strong> Meenal Aggarwal</p>
                      <p><strong>Designation:</strong> Grievance Officer - Data Privacy & Consumer Protection</p>
                      <p><strong>Email:</strong> <a href="mailto:grievance@junooni.com" className="text-[#e65100] hover:underline">grievance@junooni.com</a></p>
                      <p><strong>Phone:</strong> <a href="tel:+918694062222" className="text-[#e65100] hover:underline">+91 8694062222</a></p>
                      <p><strong>Address:</strong> Junooni, Saharanpur, Uttar Pradesh, India</p>
                      <p><strong>Working Hours:</strong> Monday-Friday, 10:00 AM - 6:00 PM IST</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                      <h4 className="font-semibold text-gray-900 mb-2">How to File a Complaint</h4>
                      <ol className="text-sm text-gray-700 space-y-2 ml-4 list-decimal">
                        <li>Send an email to <a href="mailto:grievance@junooni.com" className="text-[#e65100] hover:underline">grievance@junooni.com</a></li>
                        <li>Include "Privacy Complaint" or "Consumer Complaint" in the subject line</li>
                        <li>Provide your full name, registered email, order ID (if applicable)</li>
                        <li>Describe your complaint in detail with supporting documents/screenshots</li>
                        <li>State the resolution you are seeking</li>
                      </ol>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                      <h4 className="font-semibold text-gray-900 mb-2">Response Timeline</h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p><strong>Acknowledgment:</strong> Within <span className="font-bold text-green-700">48 hours</span> of receiving your complaint</p>
                        <p><strong>Resolution:</strong> Within <span className="font-bold text-green-700">30 days (1 month)</span> of acknowledgment</p>
                        <p><strong>Complex Cases:</strong> May require additional time; we will inform you of any extension</p>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                      <h4 className="font-semibold text-gray-900 mb-2">Complaint Tracking</h4>
                      <p className="text-sm text-gray-700">
                        Upon filing a complaint, you will receive a unique complaint ID. You can track the status of your 
                        complaint by emailing our Grievance Officer with this ID.
                      </p>
                    </div>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Scale size={20} className="text-red-600" />
                      Escalation to Data Protection Board of India
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      If you are not satisfied with our response or resolution, you have the right to file a complaint 
                      with the <strong>Data Protection Board of India (DPB)</strong>.
                    </p>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p><strong>Data Protection Board of India</strong></p>
                      <p>Website: [DPB website will be announced by government]</p>
                      <p>Contact: [DPB contact details will be published upon establishment]</p>
                      <p className="text-xs mt-3 text-gray-600">
                        Note: The Data Protection Board of India was established on November 13, 2025. Contact details 
                        and complaint procedures will be available on their official website.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 13. International Data Transfers */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">14. International Data Transfers</h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Your personal data is primarily stored and processed in India. However, some of our service providers 
                    (such as cloud hosting or email services) may process data outside India.
                  </p>

                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Countries Where Data May Be Transferred</h4>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                      <li><strong>Primary Location:</strong> India (all core data)</li>
                      <li><strong>Cloud Services:</strong> May use servers in USA, Singapore (with appropriate safeguards)</li>
                      <li><strong>Email Services:</strong> May process through servers globally</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Safeguards for International Transfers</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      When transferring data outside India, we ensure:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                      <li>Data Processing Agreements with all international processors</li>
                      <li>Compliance with DPDPA 2023 requirements for cross-border transfers</li>
                      <li>Encryption during transfer and storage</li>
                      <li>Equivalent level of data protection as in India</li>
                    </ul>
                  </div>
                </section>

                {/* 14. Third-Party Links */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">15. Third-Party Websites and Links</h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Our website may contain links to third-party websites, social media platforms, or services that are 
                    not operated or controlled by Junooni. This includes:
                  </p>

                  <ul className="mb-4 ml-4 space-y-2 text-gray-600 list-disc list-inside">
                    <li>Creator social media profiles (Instagram, YouTube, Twitter, etc.)</li>
                    <li>Payment gateway interfaces (Razorpay)</li>
                    <li>Third-party product or service recommendations</li>
                    <li>External blog posts or articles</li>
                  </ul>
                  
                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <p className="text-sm text-gray-700">
                      <strong>Important:</strong> We are not responsible for the privacy practices or content of these 
                      third-party websites. When you click on external links, you leave our website and are subject to 
                      the privacy policies and terms of those sites. We strongly encourage you to review their privacy 
                      policies before providing any personal information.
                    </p>
                  </div>
                </section>

                {/* 15. Changes to Privacy Policy */}
                <section id="changes" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <FileText size={24} className="text-[#e65100]" />
                    16. Changes to This Privacy Policy
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We may update this Privacy Policy from time to time to reflect changes in our practices, technology, 
                    legal requirements, or business operations. Any changes will be posted on this page with an updated 
                    "Last Updated" date.
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">How We Notify You of Changes</h4>
                    <ul className="text-sm text-gray-700 space-y-2 ml-4 list-disc">
                      <li><strong>Minor Changes:</strong> Posted on this page with new "Last Updated" date</li>
                      <li><strong>Material Changes:</strong> Email notification to registered users + prominent website banner</li>
                      <li><strong>Changes Requiring New Consent:</strong> Explicit consent request before applying changes</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-[#e65100]">
                    <h4 className="font-semibold text-gray-900 mb-2">Your Rights Regarding Changes</h4>
                    <p className="text-sm text-gray-700">
                      If you do not agree with any changes to this Privacy Policy, you have the right to:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc mt-2">
                      <li>Request deletion of your account and personal data</li>
                      <li>Withdraw consent for specific processing activities</li>
                      <li>Stop using our services</li>
                    </ul>
                    <p className="text-xs text-gray-600 mt-3">
                      Your continued use of our services after policy changes indicates acceptance of the updated policy.
                    </p>
                  </div>
                  
                  <p className="mt-4 leading-relaxed text-gray-600">
                    We encourage you to review this Privacy Policy periodically to stay informed about how we protect 
                    your personal data. The "Last Updated" date at the top of this page indicates when the policy was 
                    last revised.
                  </p>
                </section>

                {/* 16. Contact Us */}
                <section id="contact" className="scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Mail size={24} className="text-[#e65100]" />
                    17. Contact Information
                  </h2>
                  
                  <p className="mb-6 leading-relaxed text-gray-600">
                    If you have any questions, concerns, or requests regarding this Privacy Policy, your personal data, 
                    or our privacy practices, please contact us:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-orange-50 border-l-4 border-[#e65100] p-6 rounded-lg">
                      <h3 className="font-bold text-gray-900 mb-4">General Privacy Inquiries</h3>
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
                            <p className="font-medium text-gray-900">Address</p>
                            <p className="text-gray-600 text-sm">
                              Junooni<br />
                              Saharanpur, Uttar Pradesh, India
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
                      <h3 className="font-bold text-gray-900 mb-4">Grievance Officer</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium text-gray-900">Name</p>
                          <p className="text-gray-600 text-sm">Meenal Aggarwal</p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <a href="mailto:grievance@junooni.com" className="text-blue-600 hover:underline text-sm">
                            grievance@junooni.com
                          </a>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900">Response Time</p>
                          <p className="text-gray-600 text-sm">48 hours acknowledgment</p>
                          <p className="text-gray-600 text-sm">30 days resolution</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Data Subject Rights Requests</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      For requests to access, correct, delete, or port your data, please email:
                    </p>
                    <p className="text-sm">
                      <a href="mailto:support@junooni.com" className="text-purple-600 hover:underline font-medium">
                        support@junooni.com
                      </a> with subject line: "DPDPA Rights Request - [Your Request Type]"
                    </p>
                  </div>
                  
                  <p className="mt-6 text-sm text-gray-500">
                    We aim to respond to all legitimate requests within 30 days. If you are not satisfied with our response, 
                    you have the right to lodge a complaint with the Data Protection Board of India.
                  </p>
                </section>

                {/* Acknowledgment & Legal */}
                <div className="pt-8 mt-8 border-t-2 border-gray-200">
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
                    <h3 className="font-bold text-gray-900 mb-3 text-center">Legal Compliance Statement</h3>
                    <p className="text-sm text-gray-700 text-center mb-2">
                      This Privacy Policy is compliant with:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>✓ Digital Personal Data Protection Act, 2023 (DPDPA)</li>
                      <li>✓ Consumer Protection (E-Commerce) Rules, 2020</li>
                      <li>✓ Information Technology Act, 2000</li>
                      <li>✓ Information Technology (Reasonable Security Practices) Rules, 2011</li>
                    </ul>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Governing Law:</strong> This Privacy Policy is governed by the laws of India.
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Jurisdiction:</strong> Courts of Saharanpur, Uttar Pradesh, India shall have exclusive jurisdiction.
                    </p>
                    <p className="text-sm text-gray-500">
                      By using Junooni's services, you acknowledge that you have read and understood this Privacy Policy and 
                      agree to the collection, use, and disclosure of your personal data as described herein.
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
    </div>
  );
};

export default PrivacyPolicyPage;