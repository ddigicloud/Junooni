'use client';

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, CreditCard, Smartphone, Building2, 
  Wallet, DollarSign, Shield, Lock, CheckCircle, 
  AlertCircle, Clock, Info, Zap, Globe, 
  FileText, Mail, Phone, MapPin, ArrowRight
} from "lucide-react";

const PaymentMethodsPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Quick links navigation
  const quickLinks = [
    { id: "accepted-methods", title: "Accepted Methods", icon: <CreditCard size={20} /> },
    { id: "how-to-pay", title: "How to Pay", icon: <FileText size={20} /> },
    { id: "security", title: "Security", icon: <Shield size={20} /> },
    { id: "currency", title: "Currency & Pricing", icon: <DollarSign size={20} /> },
    { id: "payment-issues", title: "Payment Issues", icon: <AlertCircle size={20} /> },
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

  // Payment methods data
  const paymentMethods = [
    {
      category: "Credit & Debit Cards",
      icon: <CreditCard size={40} />,
      color: "blue",
      methods: [
        { name: "Visa", available: true },
        { name: "Mastercard", available: true },
        { name: "RuPay", available: true },
        { name: "American Express", available: true },
        { name: "Maestro", available: true }
      ],
      description: "We accept all major credit and debit cards. Your card information is encrypted and secure.",
      processingTime: "Instant"
    },
    {
      category: "UPI (Unified Payments Interface)",
      icon: <Smartphone size={40} />,
      color: "green",
      methods: [
        { name: "Google Pay", available: true },
        { name: "PhonePe", available: true },
        { name: "Paytm", available: true },
        { name: "BHIM", available: true },
        { name: "Other UPI Apps", available: true }
      ],
      description: "Fast, secure, and convenient payment using your UPI ID or QR code.",
      processingTime: "Instant"
    },
    {
      category: "Net Banking",
      icon: <Building2 size={40} />,
      color: "purple",
      methods: [
        { name: "SBI", available: true },
        { name: "HDFC Bank", available: true },
        { name: "ICICI Bank", available: true },
        { name: "Axis Bank", available: true },
        { name: "50+ Other Banks", available: true }
      ],
      description: "Direct payment from your bank account using internet banking credentials.",
      processingTime: "Instant"
    },
    {
      category: "Digital Wallets",
      icon: <Wallet size={40} />,
      color: "orange",
      methods: [
        { name: "Paytm Wallet", available: true },
        { name: "PhonePe Wallet", available: true },
        { name: "Mobikwik", available: true },
        { name: "Freecharge", available: true },
        { name: "Amazon Pay", available: true }
      ],
      description: "Pay using your digital wallet balance for quick checkout.",
      processingTime: "Instant"
    },
    {
      category: "Cash on Delivery (COD)",
      icon: <DollarSign size={40} />,
      color: "red",
      methods: [
        { name: "Pay on Delivery", available: true }
      ],
      description: "Pay with cash when your order is delivered to your doorstep. Available in select locations.",
      processingTime: "On Delivery",
      note: "COD charges may apply. Limited to orders below ₹10,000."
    },
    {
      category: "EMI Options",
      icon: <CreditCard size={40} />,
      color: "indigo",
      methods: [
        { name: "Credit Card EMI", available: true },
        { name: "Debit Card EMI", available: true },
        { name: "Bajaj Finserv", available: true },
        { name: "ZestMoney", available: true }
      ],
      description: "Convert your purchases into easy monthly installments (available on orders above ₹3,000).",
      processingTime: "Instant",
      note: "Interest rates and tenure vary by provider"
    }
  ];

  // FAQs
  const faqs = [
    {
      question: "Is it safe to use my credit/debit card on Junooni?",
      answer: "Yes, absolutely! We use industry-standard SSL encryption and comply with PCI-DSS security standards. Your card information is never stored on our servers and is processed through secure payment gateways."
    },
    {
      question: "Why was my payment declined?",
      answer: "Payment declines can happen for several reasons: insufficient funds, incorrect card details, bank security restrictions, or card limits. Please verify your details and try again. If the issue persists, contact your bank or try an alternative payment method."
    },
    {
      question: "How long does it take for payment to be processed?",
      answer: "Most payments (cards, UPI, net banking, wallets) are processed instantly. You'll receive an order confirmation immediately after successful payment. Bank statement updates may take 2-3 business days."
    },
    {
      question: "Can I save my card details for future purchases?",
      answer: "Yes, you can securely save your card information during checkout for faster future payments. We use tokenization technology to keep your card details safe and encrypted."
    },
    {
      question: "What if I'm charged but didn't receive order confirmation?",
      answer: "If payment was deducted but you didn't receive confirmation, please don't retry. Wait 30 minutes and check your order history. If still not showing, contact our support with your transaction details. We'll verify and resolve within 24 hours."
    },
    {
      question: "Are there any additional charges or hidden fees?",
      answer: "The price you see at checkout is the final price you pay. We don't add hidden fees. Some payment methods like COD may have nominal charges which are clearly displayed before you confirm."
    },
    {
      question: "Can I use multiple payment methods for one order?",
      answer: "Currently, we don't support split payments. You can use only one payment method per order. However, you can use gift cards in combination with other payment methods."
    },
    {
      question: "What happens if my payment fails?",
      answer: "If payment fails, your order won't be placed and no amount will be deducted. You can retry with the same or different payment method. If amount was deducted but order failed, it will be automatically refunded within 5-7 business days."
    }
  ];

  // Color mapping
  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-600', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-600', icon: 'text-green-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-600', icon: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-600', icon: 'text-orange-600' },
    red: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-600', icon: 'text-red-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-500', text: 'text-indigo-600', icon: 'text-indigo-600' }
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
              <CreditCard size={32} />
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">Payment Methods</h1>
            <p className="text-lg opacity-90">
              Multiple secure payment options for your convenience. Shop with confidence!
            </p>
          </div>
        </div>
      </div>
      
      <main className="container px-4 py-8 mx-auto md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
            <div className="p-4 text-center bg-white rounded-lg shadow-sm">
              <Shield size={32} className="mx-auto mb-2 text-green-600" />
              <h3 className="text-sm font-bold text-gray-900">100% Secure</h3>
              <p className="text-xs text-gray-600">SSL Encrypted</p>
            </div>
            
            <div className="p-4 text-center bg-white rounded-lg shadow-sm">
              <Zap size={32} className="mx-auto mb-2 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">Instant Processing</h3>
              <p className="text-xs text-gray-600">Real-time payments</p>
            </div>
            
            <div className="p-4 text-center bg-white rounded-lg shadow-sm">
              <Lock size={32} className="mx-auto mb-2 text-purple-600" />
              <h3 className="text-sm font-bold text-gray-900">PCI Compliant</h3>
              <p className="text-xs text-gray-600">Industry standards</p>
            </div>
            
            <div className="p-4 text-center bg-white rounded-lg shadow-sm">
              <CheckCircle size={32} className="mx-auto mb-2 text-orange-600" />
              <h3 className="text-sm font-bold text-gray-900">Multiple Options</h3>
              <p className="text-xs text-gray-600">Choose your way</p>
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
              <div className="p-6 bg-white rounded-lg shadow-sm md:p-8">
                
                {/* Introduction */}
                <section className="mb-8">
                  <p className="mb-4 leading-relaxed text-gray-600">
                    At Junooni, we believe in providing you with flexible and secure payment options. Whether you prefer 
                    cards, UPI, net banking, or cash on delivery, we've got you covered. All transactions are protected 
                    by advanced encryption technology.
                  </p>

                  <div className="p-4 border-l-4 border-green-500 rounded bg-green-50">
                    <p className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Zero Payment Gateway Charges:</strong> We don't charge any additional fees for using 
                        credit/debit cards, UPI, or net banking. The price you see is what you pay!
                      </span>
                    </p>
                  </div>
                </section>

                {/* 1. Accepted Payment Methods */}
                <section id="accepted-methods" className="mb-8 scroll-mt-24">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">Accepted Payment Methods</h2>
                  
                  <div className="space-y-6">
                    {paymentMethods.map((method, index) => (
                      <div 
                        key={index}
                        className={`${colorClasses[method.color].bg} border-l-4 ${colorClasses[method.color].border} rounded-r-lg p-6`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`${colorClasses[method.color].icon} flex-shrink-0`}>
                            {method.icon}
                          </div>
                          
                          <div className="flex-grow">
                            <h3 className="mb-2 text-xl font-bold text-gray-900">{method.category}</h3>
                            <p className="mb-3 text-sm text-gray-700">{method.description}</p>
                            
                            <div className="grid grid-cols-2 gap-2 mb-3 md:grid-cols-3">
                              {method.methods.map((m, idx) => (
                                <div key={idx} className="flex items-center gap-1 text-sm text-gray-700">
                                  <CheckCircle size={14} className="flex-shrink-0 text-green-600" />
                                  <span>{m.name}</span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock size={16} className={colorClasses[method.color].text} />
                                <span className="text-gray-600">
                                  <strong>Processing:</strong> {method.processingTime}
                                </span>
                              </div>
                            </div>
                            
                            {method.note && (
                              <div className="p-2 mt-3 text-xs text-gray-700 border border-yellow-200 rounded bg-yellow-50">
                                <strong>Note:</strong> {method.note}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 2. How to Pay */}
                <section id="how-to-pay" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <FileText size={24} className="text-[#e65100]" />
                    How to Make a Payment
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Making a payment on Junooni is quick and easy. Follow these simple steps:
                  </p>

                  <div className="space-y-4">
                    <div className="flex gap-4 p-4 rounded-lg bg-gray-50">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-[#e65100] text-white flex items-center justify-center font-bold">
                          1
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-gray-900">Add Items to Cart</h3>
                        <p className="text-sm text-gray-600">Browse our collection and add your favorite items to the shopping cart.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-lg bg-gray-50">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-[#e65100] text-white flex items-center justify-center font-bold">
                          2
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-gray-900">Proceed to Checkout</h3>
                        <p className="text-sm text-gray-600">Review your order, apply any promo codes, and enter your shipping address.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-lg bg-gray-50">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-[#e65100] text-white flex items-center justify-center font-bold">
                          3
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-gray-900">Choose Payment Method</h3>
                        <p className="text-sm text-gray-600">Select your preferred payment method from the available options.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-lg bg-gray-50">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-[#e65100] text-white flex items-center justify-center font-bold">
                          4
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-gray-900">Enter Payment Details</h3>
                        <p className="text-sm text-gray-600">Provide the required information securely through our encrypted payment gateway.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-lg bg-gray-50">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-[#e65100] text-white flex items-center justify-center font-bold">
                          5
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-gray-900">Complete & Confirm</h3>
                        <p className="text-sm text-gray-600">Complete the payment and receive instant order confirmation via email and SMS.</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 3. Security & Protection */}
                <section id="security" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Shield size={24} className="text-[#e65100]" />
                    Security & Protection
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Your payment security is our top priority. We implement multiple layers of security to protect your 
                    financial information:
                  </p>

                  <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                    <div className="p-3 pl-4 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                      <h4 className="flex items-center gap-2 mb-1 font-semibold text-gray-900">
                        <Lock size={18} className="text-green-600" />
                        SSL Encryption
                      </h4>
                      <p className="text-sm text-gray-600">
                        All data transmitted between your browser and our servers is encrypted using 256-bit SSL technology.
                      </p>
                    </div>

                    <div className="p-3 pl-4 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
                      <h4 className="flex items-center gap-2 mb-1 font-semibold text-gray-900">
                        <Shield size={18} className="text-blue-600" />
                        PCI-DSS Compliant
                      </h4>
                      <p className="text-sm text-gray-600">
                        We comply with Payment Card Industry Data Security Standards for handling card information.
                      </p>
                    </div>

                    <div className="p-3 pl-4 border-l-4 border-purple-500 rounded-r-lg bg-purple-50">
                      <h4 className="flex items-center gap-2 mb-1 font-semibold text-gray-900">
                        <CreditCard size={18} className="text-purple-600" />
                        Tokenization
                      </h4>
                      <p className="text-sm text-gray-600">
                        Card details are tokenized - we never store your actual card numbers on our servers.
                      </p>
                    </div>

                    <div className="p-3 pl-4 border-l-4 border-orange-500 rounded-r-lg bg-orange-50">
                      <h4 className="flex items-center gap-2 mb-1 font-semibold text-gray-900">
                        <CheckCircle size={18} className="text-orange-600" />
                        Fraud Detection
                      </h4>
                      <p className="text-sm text-gray-600">
                        Advanced fraud detection systems monitor transactions for suspicious activity 24/7.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <h4 className="mb-2 font-semibold text-gray-900">Trusted Payment Partners</h4>
                    <p className="text-sm text-gray-700">
                      We partner with leading payment gateways like Razorpay, Stripe, and PayU that are trusted by 
                      millions of users worldwide. Your payment information is processed through their secure servers, 
                      not stored by us.
                    </p>
                  </div>
                </section>

                {/* 4. Currency & Pricing */}
                <section id="currency" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Globe size={24} className="text-[#e65100]" />
                    Currency & Pricing Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="mb-1 font-semibold text-gray-900">Default Currency</h4>
                      <p className="text-sm text-gray-600">
                        All prices are displayed in Indian Rupees (₹ INR). This is our primary currency for domestic 
                        transactions within India.
                      </p>
                    </div>

                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="mb-1 font-semibold text-gray-900">International Orders</h4>
                      <p className="text-sm text-gray-600">
                        For international customers, prices will be converted to your local currency at the current exchange 
                        rate. Additional customs duties and taxes may apply based on your country's regulations.
                      </p>
                    </div>

                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="mb-1 font-semibold text-gray-900">Price Includes</h4>
                      <p className="text-sm text-gray-600">
                        All prices include applicable GST and taxes. The final price shown at checkout is what you pay - 
                        no hidden charges (except COD charges where applicable).
                      </p>
                    </div>

                    <div className="pl-4 border-l-4 border-gray-300">
                      <h4 className="mb-1 font-semibold text-gray-900">Dynamic Pricing</h4>
                      <p className="text-sm text-gray-600">
                        Prices may vary during sales and promotions. The price at the time of order placement is the final 
                        price, even if it changes later.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 5. Payment Issues & Troubleshooting */}
                <section id="payment-issues" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <AlertCircle size={24} className="text-[#e65100]" />
                    Common Payment Issues & Solutions
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 border-l-4 border-red-500 rounded-r-lg bg-red-50">
                      <h4 className="mb-2 font-semibold text-gray-900">Payment Declined</h4>
                      <p className="mb-2 text-sm text-gray-700">
                        <strong>Possible reasons:</strong>
                      </p>
                      <ul className="ml-4 space-y-1 text-sm text-gray-700">
                        <li>• Insufficient balance in account/card</li>
                        <li>• Incorrect card details (number, CVV, expiry date)</li>
                        <li>• Card not enabled for online transactions</li>
                        <li>• Daily transaction limit exceeded</li>
                        <li>• Bank server temporarily down</li>
                      </ul>
                      <p className="mt-2 text-sm text-gray-700">
                        <strong>Solution:</strong> Verify your details, contact your bank, or try a different payment method.
                      </p>
                    </div>

                    <div className="p-4 border-l-4 border-yellow-500 rounded-r-lg bg-yellow-50">
                      <h4 className="mb-2 font-semibold text-gray-900">Payment Pending</h4>
                      <p className="mb-2 text-sm text-gray-700">
                        If your payment is showing as pending:
                      </p>
                      <ul className="ml-4 space-y-1 text-sm text-gray-700">
                        <li>• Wait 30 minutes for payment gateway to update</li>
                        <li>• Check your bank account/card statement</li>
                        <li>• Check spam folder for confirmation email</li>
                        <li>• Contact support if status doesn't update after 2 hours</li>
                      </ul>
                    </div>

                    <div className="p-4 border-l-4 border-orange-500 rounded-r-lg bg-orange-50">
                      <h4 className="mb-2 font-semibold text-gray-900">Double Charge</h4>
                      <p className="text-sm text-gray-700">
                        If you see duplicate charges, don't worry. One is usually a temporary authorization hold that will 
                        be released by your bank within 5-7 business days. If both charges post, contact us immediately with 
                        transaction details for a refund.
                      </p>
                    </div>

                    <div className="p-4 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
                      <h4 className="mb-2 font-semibold text-gray-900">OTP Not Received</h4>
                      <p className="mb-2 text-sm text-gray-700">
                        If you're not receiving OTP:
                      </p>
                      <ul className="ml-4 space-y-1 text-sm text-gray-700">
                        <li>• Check your phone number is entered correctly</li>
                        <li>• Ensure network connectivity</li>
                        <li>• Wait 1-2 minutes, OTPs may be delayed</li>
                        <li>• Request OTP resend</li>
                        <li>• Try alternative payment method if issue persists</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 mt-6 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                      <Info size={20} className="text-[#e65100]" />
                      Still Having Issues?
                    </h4>
                    <p className="mb-3 text-sm text-gray-700">
                      If you continue to experience payment problems, our support team is here to help:
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <a 
                        href="mailto:payments@junooni.com" 
                        className="inline-flex items-center gap-2 text-[#e65100] font-medium hover:underline text-sm"
                      >
                        <Mail size={16} />
                        payments@junooni.com
                      </a>
                      <a 
                        href="tel:+918694062222" 
                        className="inline-flex items-center gap-2 text-[#e65100] font-medium hover:underline text-sm"
                      >
                        <Phone size={16} />
                        +91 8694062222
                      </a>
                    </div>
                  </div>
                </section>

                {/* 6. Refunds & Failed Payments */}
                <section className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">Refunds for Failed Payments</h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    If money was deducted from your account but the order was not placed:
                  </p>

                  <div className="p-4 mb-4 border-l-4 border-green-500 rounded bg-green-50">
                    <h4 className="mb-2 font-semibold text-gray-900">Automatic Refund Process</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Refund is initiated automatically within 24 hours</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Credit/Debit Cards: 5-7 business days</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>UPI/Net Banking: 3-5 business days</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Wallets: 1-3 business days</span>
                      </li>
                    </ul>
                  </div>

                  <p className="text-sm italic text-gray-600">
                    If you don't receive your refund within the specified timeframe, please contact our support team with 
                    your transaction details.
                  </p>
                </section>

                {/* 7. FAQs */}
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
                          <span className="text-[#e65100] text-xl flex-shrink-0 ml-2">
                            {expandedFaq === index ? '−' : '+'}
                          </span>
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
                      <Mail size={24} className="text-[#e65100]" />
                      Need Payment Assistance?
                    </h3>
                    
                    <p className="mb-4 text-gray-700">
                      Our payment support team is available to help you with any payment-related queries or issues.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail size={20} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <a href="mailto:payments@junooni.com" className="text-[#e65100] hover:underline">
                            payments@junooni.com
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
                          <p className="mt-1 text-xs text-gray-600">Monday-Friday, 10:00 AM - 6:00 PM IST</p>
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

export default PaymentMethodsPage;