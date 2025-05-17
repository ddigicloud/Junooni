'use client';

import React, { useState } from "react";
import ChatwootWidget from '../chatwootWidget/page'
import Link from "next/link";
import { 
  ShoppingBag, Search, ChevronRight, Mail, Phone, 
  MessageSquare, FileText, Package, RefreshCcw, 
  CreditCard, HelpCircle, User, Plus, Minus
} from "lucide-react";

const HelpdeskPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // In production, this would search help articles
  };
  
  // Toggle FAQ expansion
  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Common help categories
  const helpCategories = [
    { icon: <Package size={24} />, title: "Orders & Shipping", url: "/help/orders" },
    { icon: <RefreshCcw size={24} />, title: "Returns & Refunds", url: "/help/returns" },
    { icon: <CreditCard size={24} />, title: "Payment Issues", url: "/help/payment" },
    { icon: <User size={24} />, title: "Account Help", url: "/help/account" },
    { icon: <FileText size={24} />, title: "Product Information", url: "/help/products" },
    { icon: <HelpCircle size={24} />, title: "Other Questions", url: "/help/other" }
  ];
  
  // FAQ items
  const faqs = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by logging into your account and navigating to 'My Orders'. Click on the specific order to view its current status and tracking information. Alternatively, you can use the tracking number provided in your shipping confirmation email."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns within 30 days of delivery. Items must be in their original condition with tags attached. To initiate a return, log into your account, go to 'My Orders', and select the 'Return' option for the relevant order."
    },
    {
      question: "How do I contact a creator directly?",
      answer: "While you cannot contact creators directly through our platform, you can follow their profiles to stay updated on new merchandise and announcements. For specific product questions, our customer service team can help connect you with the creator's team if necessary."
    },
    {
      question: "Can I change or cancel my order?",
      answer: "You can modify or cancel your order within 1 hour of placing it. After that time, if the order hasn't shipped, please contact our customer support team immediately for assistance. Once an order has shipped, it cannot be canceled."
    },
    {
      question: "How do I redeem a gift card or promo code?",
      answer: "During checkout, you'll find a field labeled 'Gift card or promo code' where you can enter your code. Click 'Apply' to add the discount to your order. Please note that some promotional codes cannot be combined with other offers."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <Link href="/" className="flex items-center">
            <ShoppingBag className="h-6 w-6 text-[#e65100] mr-2" />
            <span className="font-bold text-lg">JUNOONI</span>
          </Link>
        </div>
      </header>
      
      {/* Hero Section */}
      <div className="bg-[#e65100] text-white py-10 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Find answers to frequently asked questions or contact our support team.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="flex">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  className="pl-10 py-3 pr-4 w-full border-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="bg-white text-[#e65100] px-6 font-medium py-3 rounded-r-md hover:bg-gray-100 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Help Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Browse Help Topics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {helpCategories.map((category, index) => (
              <Link 
                href={category.url} 
                key={index}
                className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow transition-shadow border border-gray-100 flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-[#fff8f3] flex items-center justify-center mb-3 text-[#e65100]">
                  {category.icon}
                </div>
                <h3 className="font-medium">{category.title}</h3>
              </Link>
            ))}
          </div>
        </section>
        
        {/* Frequently Asked Questions */}
        <section className="mb-12 bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex justify-between items-center w-full px-4 py-3 text-left font-medium hover:bg-gray-50 transition-colors"
                >
                  {faq.question}
                  {expandedFaq === index ? 
                    <Minus size={18} className="flex-shrink-0 text-[#e65100]" /> : 
                    <Plus size={18} className="flex-shrink-0 text-gray-400" />
                  }
                </button>
                {expandedFaq === index && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
        
        {/* Contact Options */}
        <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">Still Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 text-blue-600">
                <MessageSquare size={24} />
              </div>
              <h3 className="font-medium mb-2">Start a Chat</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Chat with our support team in real-time.
              </p>
              <p className="text-sm text-gray-500 mb-2">Available Monday-Friday</p>
              <p className="text-sm font-medium">9:00 AM - 6:00 PM ET</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Start Chat
              </button>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-[#fff8f3] flex items-center justify-center mb-3 text-[#e65100]">
                <Mail size={24} />
              </div>
              <h3 className="font-medium mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Send us an email and we'll respond within 24 hours.
              </p>
              <Link 
                href="mailto:support@junooni.com" 
                className="text-[#e65100] font-medium hover:underline"
              >
                support@junooni.com
              </Link>
              <button className="mt-4 px-4 py-2 bg-[#e65100] text-white rounded-md hover:bg-[#d84315] transition-colors">
                Send Email
              </button>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3 text-green-600">
                <Phone size={24} />
              </div>
              <h3 className="font-medium mb-2">Call Us</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Speak with a support representative.
              </p>
              <p className="text-sm text-gray-500 mb-2">Available Monday-Friday</p>
              <p className="text-sm font-medium">10:00 AM - 4:00 PM ET</p>
              <Link 
                href="tel:+18001234567" 
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors inline-block"
              >
                Call (800) 123-4567
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Junooni. All rights reserved.</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link href="/terms" className="text-sm text-gray-500 hover:text-[#e65100]">Terms</Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-[#e65100]">Privacy</Link>
            <Link href="/contact" className="text-sm text-gray-500 hover:text-[#e65100]">Contact</Link>
          </div>
        </div>
      </footer>
      <ChatwootWidget/>
    </div>
  );
};

export default HelpdeskPage;