'use client';

import React from "react";
import Link from "next/link";
import { 
  ShoppingBag, Shield, Lock, Eye, UserCheck, 
  FileText, Mail, Globe, Cookie, Database, MapPin, Phone 
} from "lucide-react";

const PrivacyPolicyPage = () => {
  // Section data for easy navigation
  const sections = [
    { id: "information-collection", title: "Information We Collect", icon: <Database size={20} /> },
    { id: "how-we-use", title: "How We Use Your Information", icon: <Eye size={20} /> },
    { id: "information-sharing", title: "Information Sharing", icon: <Globe size={20} /> },
    { id: "data-security", title: "Data Security", icon: <Lock size={20} /> },
    { id: "cookies", title: "Cookies & Tracking", icon: <Cookie size={20} /> },
    { id: "your-rights", title: "Your Rights", icon: <UserCheck size={20} /> },
    { id: "childrens-privacy", title: "Children's Privacy", icon: <Shield size={20} /> },
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
                <section className="mb-8">
                  <p className="leading-relaxed text-gray-600">
                    At Junooni, we are committed to protecting your privacy and ensuring the security of your personal information. 
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our 
                    website and use our services. Please read this policy carefully to understand our practices regarding your 
                    personal data.
                  </p>
                </section>

                {/* 1. Information We Collect */}
                <section id="information-collection" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Database size={24} className="text-[#e65100]" />
                    1. Information We Collect
                  </h2>
                  
                  <h3 className="mb-3 text-xl font-semibold text-gray-800">Personal Information</h3>
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We collect personal information that you voluntarily provide to us when you:
                  </p>
                  <ul className="mb-6 ml-4 space-y-2 text-gray-600 list-disc list-inside">
                    <li>Create an account on our platform</li>
                    <li>Make a purchase or place an order</li>
                    <li>Subscribe to our newsletter or marketing communications</li>
                    <li>Contact our customer support team</li>
                    <li>Participate in surveys, contests, or promotions</li>
                    <li>Leave reviews or comments on products</li>
                  </ul>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    This information may include:
                  </p>
                  <ul className="mb-6 ml-4 space-y-2 text-gray-600 list-disc list-inside">
                    <li>Name and contact information (email address, phone number, shipping address)</li>
                    <li>Payment information (credit card details, billing address)</li>
                    <li>Account credentials (username, password)</li>
                    <li>Order history and preferences</li>
                    <li>Communication preferences</li>
                  </ul>

                  <h3 className="mb-3 text-xl font-semibold text-gray-800">Automatically Collected Information</h3>
                  <p className="mb-4 leading-relaxed text-gray-600">
                    When you visit our website, we automatically collect certain information about your device and browsing behavior, including:
                  </p>
                  <ul className="ml-4 space-y-2 text-gray-600 list-disc list-inside">
                    <li>IP address and location data</li>
                    <li>Browser type and version</li>
                    <li>Device information (type, operating system)</li>
                    <li>Pages visited and time spent on pages</li>
                    <li>Referring website addresses</li>
                    <li>Clickstream data</li>
                  </ul>
                </section>

                {/* 2. How We Use Your Information */}
                <section id="how-we-use" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Eye size={24} className="text-[#e65100]" />
                    2. How We Use Your Information
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We use the information we collect for various purposes, including:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded">
                      <h4 className="mb-2 font-semibold text-gray-900">Order Processing & Fulfillment</h4>
                      <p className="text-sm text-gray-600">
                        To process your orders, arrange shipping, handle returns, and provide customer support related to your purchases.
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded">
                      <h4 className="mb-2 font-semibold text-gray-900">Account Management</h4>
                      <p className="text-sm text-gray-600">
                        To create and manage your account, authenticate your identity, and provide you with access to our services.
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded">
                      <h4 className="mb-2 font-semibold text-gray-900">Communication</h4>
                      <p className="text-sm text-gray-600">
                        To send you order confirmations, shipping updates, customer service messages, and respond to your inquiries.
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded">
                      <h4 className="mb-2 font-semibold text-gray-900">Marketing & Promotions</h4>
                      <p className="text-sm text-gray-600">
                        To send you newsletters, promotional offers, and information about new products (with your consent, where required).
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded">
                      <h4 className="mb-2 font-semibold text-gray-900">Platform Improvement</h4>
                      <p className="text-sm text-gray-600">
                        To analyze website usage, improve our services, develop new features, and personalize your experience.
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded">
                      <h4 className="mb-2 font-semibold text-gray-900">Legal Compliance</h4>
                      <p className="text-sm text-gray-600">
                        To comply with legal obligations, resolve disputes, enforce our terms and conditions, and prevent fraud.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 3. Information Sharing */}
                <section id="information-sharing" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Globe size={24} className="text-[#e65100]" />
                    3. Information Sharing and Disclosure
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We may share your information with third parties in the following circumstances:
                  </p>
                  
                  <div className="mb-6 space-y-4">
                    <div>
                      <h4 className="mb-2 font-semibold text-gray-900">Service Providers</h4>
                      <p className="text-sm leading-relaxed text-gray-600">
                        We work with third-party service providers to help us operate our business, including payment processors, 
                        shipping companies, email service providers, and analytics providers. These providers have access to your 
                        information only to perform specific tasks on our behalf and are obligated to protect your information.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="mb-2 font-semibold text-gray-900">Creator Partners</h4>
                      <p className="text-sm leading-relaxed text-gray-600">
                        When you purchase merchandise from a specific creator, we may share relevant order information with that 
                        creator or their authorized representatives for fulfillment and customer service purposes.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="mb-2 font-semibold text-gray-900">Legal Requirements</h4>
                      <p className="text-sm leading-relaxed text-gray-600">
                        We may disclose your information if required to do so by law or in response to valid requests by public 
                        authorities (e.g., a court, government agency, or law enforcement).
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="mb-2 font-semibold text-gray-900">Business Transfers</h4>
                      <p className="text-sm leading-relaxed text-gray-600">
                        In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of 
                        that transaction. We will notify you of any such change in ownership or control of your personal information.
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
                    </p>
                  </div>
                </section>

                {/* 4. Data Security */}
                <section id="data-security" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Lock size={24} className="text-[#e65100]" />
                    4. Data Security
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We implement appropriate technical and organizational security measures to protect your personal information 
                    against unauthorized access, alteration, disclosure, or destruction. These measures include:
                  </p>
                  
                  <ul className="mb-6 ml-4 space-y-2 text-gray-600 list-disc list-inside">
                    <li>Encryption of sensitive data during transmission (SSL/TLS)</li>
                    <li>Secure storage of payment information with PCI-DSS compliant payment processors</li>
                    <li>Regular security assessments and updates</li>
                    <li>Access controls and authentication requirements</li>
                    <li>Employee training on data protection practices</li>
                  </ul>
                  
                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <p className="text-sm text-gray-700">
                      <strong>Important:</strong> While we strive to protect your personal information, no method of transmission 
                      over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your data.
                    </p>
                  </div>
                </section>

                {/* 5. Cookies & Tracking */}
                <section id="cookies" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Cookie size={24} className="text-[#e65100]" />
                    5. Cookies and Tracking Technologies
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We use cookies and similar tracking technologies to collect and track information about your activity on our website. 
                    Cookies are small data files stored on your device that help us improve your experience.
                  </p>
                  
                  <h3 className="mb-3 text-xl font-semibold text-gray-800">Types of Cookies We Use:</h3>
                  
                  <div className="mb-6 space-y-3">
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="font-semibold text-gray-900">Essential Cookies</h4>
                      <p className="text-sm text-gray-600">Required for the website to function properly (e.g., shopping cart, login)</p>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                      <p className="text-sm text-gray-600">Help us understand how visitors use our website (e.g., Google Analytics)</p>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="font-semibold text-gray-900">Functionality Cookies</h4>
                      <p className="text-sm text-gray-600">Remember your preferences and personalize your experience</p>
                    </div>
                    
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="font-semibold text-gray-900">Marketing Cookies</h4>
                      <p className="text-sm text-gray-600">Track your browsing to display relevant advertisements</p>
                    </div>
                  </div>
                  
                  <p className="leading-relaxed text-gray-600">
                    You can control cookie settings through your browser preferences. However, disabling certain cookies may 
                    affect the functionality of our website.
                  </p>
                </section>

                {/* 6. Your Rights */}
                <section id="your-rights" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <UserCheck size={24} className="text-[#e65100]" />
                    6. Your Privacy Rights
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Depending on your location, you may have certain rights regarding your personal information:
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-semibold text-gray-900">Access</h4>
                      <p className="text-sm text-gray-600">Request access to your personal information</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-semibold text-gray-900">Correction</h4>
                      <p className="text-sm text-gray-600">Request correction of inaccurate data</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-semibold text-gray-900">Deletion</h4>
                      <p className="text-sm text-gray-600">Request deletion of your personal information</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-semibold text-gray-900">Opt-Out</h4>
                      <p className="text-sm text-gray-600">Opt out of marketing communications</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-semibold text-gray-900">Portability</h4>
                      <p className="text-sm text-gray-600">Request a copy of your data in a portable format</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-semibold text-gray-900">Restriction</h4>
                      <p className="text-sm text-gray-600">Request restriction of processing your data</p>
                    </div>
                  </div>
                  
                  <p className="leading-relaxed text-gray-600">
                    To exercise any of these rights, please contact us using the information provided in the "Contact Us" section below. 
                    We will respond to your request within 30 days.
                  </p>
                </section>

                {/* 7. Children's Privacy */}
                <section id="childrens-privacy" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Shield size={24} className="text-[#e65100]" />
                    7. Children's Privacy
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Our services are not intended for children under the age of 13. We do not knowingly collect personal information 
                    from children under 13. If you are a parent or guardian and believe that your child has provided us with personal 
                    information, please contact us immediately. If we become aware that we have collected personal information from 
                    a child under 13 without parental consent, we will take steps to remove that information from our servers.
                  </p>
                  
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <p className="text-sm text-gray-700">
                      <strong>Age Requirement:</strong> You must be at least 13 years old to use our services. Users between 13-18 
                      should have parental or guardian consent.
                    </p>
                  </div>
                </section>

                {/* 8. International Data Transfers */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">8. International Data Transfers</h2>
                  
                  <p className="leading-relaxed text-gray-600">
                    Your information may be transferred to and maintained on servers located outside of your country, where data 
                    protection laws may differ. By using our services, you consent to the transfer of your information to India 
                    and other countries where we operate. We ensure appropriate safeguards are in place to protect your information 
                    in accordance with this Privacy Policy.
                  </p>
                </section>

                {/* 9. Third-Party Links */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">9. Third-Party Links</h2>
                  
                  <p className="leading-relaxed text-gray-600">
                    Our website may contain links to third-party websites, social media platforms, or services that are not operated 
                    by us. We are not responsible for the privacy practices of these third parties. We encourage you to review the 
                    privacy policies of any third-party sites you visit.
                  </p>
                </section>

                {/* 10. Data Retention */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">10. Data Retention</h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, 
                    unless a longer retention period is required or permitted by law. When we no longer need your information, we will 
                    securely delete or anonymize it.
                  </p>
                  
                  <p className="leading-relaxed text-gray-600">
                    Typical retention periods include:
                  </p>
                  <ul className="ml-4 space-y-2 text-gray-600 list-disc list-inside">
                    <li>Account information: Until account deletion + 30 days</li>
                    <li>Order history: 7 years (for tax and legal purposes)</li>
                    <li>Marketing communications: Until unsubscribe + 30 days</li>
                    <li>Website analytics: 26 months</li>
                  </ul>
                </section>

                {/* 11. Changes to Privacy Policy */}
                <section id="changes" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <FileText size={24} className="text-[#e65100]" />
                    11. Changes to This Privacy Policy
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal 
                    requirements, or other factors. We will notify you of any material changes by:
                  </p>
                  
                  <ul className="mb-4 ml-4 space-y-2 text-gray-600 list-disc list-inside">
                    <li>Posting the updated policy on this page with a new "Last Updated" date</li>
                    <li>Sending you an email notification (if you have an account with us)</li>
                    <li>Displaying a prominent notice on our website</li>
                  </ul>
                  
                  <p className="leading-relaxed text-gray-600">
                    We encourage you to review this Privacy Policy periodically. Your continued use of our services after any 
                    changes indicates your acceptance of the updated policy.
                  </p>
                </section>

                {/* 12. Contact Us */}
                <section id="contact" className="scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Mail size={24} className="text-[#e65100]" />
                    12. Contact Us
                  </h2>
                  
                  <p className="mb-6 leading-relaxed text-gray-600">
                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                    please contact us:
                  </p>
                  
                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-6 rounded-lg">
                    <h3 className="mb-4 font-bold text-gray-900">Junooni Privacy Team</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail size={20} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <a href="mailto:privacy@junooni.com" className="text-[#e65100] hover:underline">
                            privacy@junooni.com
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
                          <p className="text-gray-600">
                            Junooni<br />
                            Saharanpur, Uttar Pradesh, India
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="mt-6 text-sm text-gray-500">
                    We will respond to all legitimate requests within 30 days. If you are not satisfied with our response, 
                    you have the right to lodge a complaint with your local data protection authority.
                  </p>
                </section>

                {/* Acknowledgment */}
                <div className="pt-6 mt-8 border-t border-gray-200">
                  <p className="text-sm text-center text-gray-500">
                    By using Junooni's services, you acknowledge that you have read and understood this Privacy Policy and 
                    agree to the collection, use, and disclosure of your information as described herein.
                  </p>
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
            <Link href="/terms" className="text-sm text-gray-500 hover:text-[#e65100]">Terms of Service</Link>
            <Link href="/privacy-policy" className="text-sm text-[#e65100] font-medium">Privacy Policy</Link>
            <Link href="/contact" className="text-sm text-gray-500 hover:text-[#e65100]">Contact</Link>
            <Link href="/help" className="text-sm text-gray-500 hover:text-[#e65100]">Help Center</Link>
          </div>
        </div>
      </footer> */}
    </div>
  );
};


export default PrivacyPolicyPage;