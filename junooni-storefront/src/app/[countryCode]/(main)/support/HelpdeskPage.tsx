'use client';

import React, { useState } from "react";
import ChatwootWidget from '../chatwootWidget/page'
import Link from "next/link";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
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

  // Function to open Chatwoot widget
  const openChatwoot = () => {
    // Check if the Chatwoot API is available
    if (window.$chatwoot && typeof window.$chatwoot.toggle === 'function') {
      // Use the confirmed working method
      window.$chatwoot.toggle();
    } else {
      console.log('Chatwoot API not ready yet, waiting...');
      
      // If you have a toast notification system, you can use it here:
      // toast({
      //   title: "Opening Support Chat",
      //   description: "Please wait a moment while we connect you to support...",
      // });
      
      // Try again after a short delay to allow for Chatwoot initialization
      setTimeout(() => {
        if (window.$chatwoot && typeof window.$chatwoot.toggle === 'function') {
          window.$chatwoot.toggle();
        } else {
          console.error('Chatwoot API still not available after delay');
          // If you have a toast notification system, you can use it here:
          // toast({
          //   title: "Support Chat Issue",
          //   description: "The support chat couldn't be opened. Please refresh the page and try again.",
          //   variant: "destructive",
          // });
          alert("The support chat couldn't be opened. Please refresh the page and try again.");
        }
      }, 1500); // 1.5 second delay
    }
  };

  // Common help categories
  const helpCategories = [
    { icon: <Package size={24} />, title: "Orders & Shipping", url: "/orders-shipping" },
    { icon: <RefreshCcw size={24} />, title: "Returns & Refunds", url: "/refund-exchange" },
    { icon: <CreditCard size={24} />, title: "Payment Issues", url: "/payment-methods" },
    { icon: <User size={24} />, title: "Account Help", url: "/account-help" },
    { icon: <FileText size={24} />, title: "Product Information", url: "/product-information" },
    { icon: <HelpCircle size={24} />, title: "Still Need Help?", url: "/contact-us" }
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
      {/* <header className="py-4 bg-white shadow-sm">
        <div className="container px-4 mx-auto">
          <Link href="/" className="flex items-center">
            <ShoppingBag className="h-6 w-6 text-[#e65100] mr-2" />
            <span className="text-lg font-bold">JUNOONI</span>
          </Link>
        </div>
      </header> */}
      
      {/* Hero Section */}
      <div className="bg-[#e65100] text-white py-10 md:py-16 mt-8 md:mt-12">
        <div className="container px-4 mx-auto text-center">
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">How can we help you?</h1>
          <p className="max-w-2xl mx-auto mb-6 text-lg">
            Find answers to frequently asked questions or contact our support team.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="flex">
              <div className="relative flex-grow">
                <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={20} />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  className="w-full py-3 pl-10 pr-4 text-gray-900 border-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-white placeholder:text-gray-400"
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
      
      <main className="px-2 md:px-4 py-8 mx-auto md:py-12">
        {/* Help Categories */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-center">Browse Help Topics</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {helpCategories.map((category, index) => (
              <LocalizedClientLink
                href={category.url} 
                key={index}
                className="flex flex-col items-center p-4 text-center transition-shadow bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow"
              >
                <div className="w-12 h-12 rounded-full bg-[#fff8f3] flex items-center justify-center mb-3 text-[#e65100]">
                  {category.icon}
                </div>
                <h3 className="font-medium">{category.title}</h3>
              </LocalizedClientLink>
            ))}
          </div>
        </section>
        
        {/* Frequently Asked Questions */}
        <section className="p-6 mb-12 bg-white rounded-lg shadow-sm md:p-8">
          <h2 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h2>
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
                  {faq.question}
                  {expandedFaq === index ? 
                    <Minus size={18} className="flex-shrink-0 text-[#e65100]" /> : 
                    <Plus size={18} className="flex-shrink-0 text-gray-400" />
                  }
                </button>
                {expandedFaq === index && (
                  <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
        
        {/* Contact Options */}
        <section className="p-6 bg-white rounded-lg shadow-sm md:p-8">
          <h2 className="mb-6 text-2xl font-bold">Still Need Help?</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center p-4 text-center border border-gray-200 rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 mb-3 text-orange-600 bg-orange-100 rounded-full">
                <MessageSquare size={24} />
              </div>
              <h3 className="mb-2 font-medium">Start a Chat</h3>
              <p className="mb-4 text-sm text-gray-600">
                Chat with our support team in real-time.
              </p>
              <p className="mb-2 text-sm text-gray-500">Available Monday-Friday</p>
              <p className="text-sm font-medium">9:00 AM - 6:00 PM IST</p>
              <button 
                onClick={openChatwoot}
                className="px-4 py-2 mt-4 text-white transition-colors bg-orange-600 rounded-md hover:bg-orange-700"
              >
                Start Chat
              </button>
            </div>
            
            <div className="flex flex-col items-center p-4 text-center border border-gray-200 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-[#fff8f3] flex items-center justify-center mb-3 text-[#e65100]">
                <Mail size={24} />
              </div>
              <h3 className="mb-2 font-medium">Email Support</h3>
              <p className="mb-4 text-sm text-gray-600">
                Send us an email and we'll respond within 24 hours.
              </p>
               <p className="mb-2 text-sm text-gray-500">Available Monday-Friday</p>
              <Link 
                href="mailto:support@junooni.com" 
                className="text-[#e65100] font-medium hover:underline"
              >
                <button className="mt-4 px-4 py-2 bg-[#e65100] text-white rounded-md hover:bg-[#d84315] transition-colors">
                Send Email
                </button>
              </Link>
            </div>
            
            <div className="flex flex-col items-center p-4 text-center border border-gray-200 rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 mb-3 text-orange-600 bg-orange-100 rounded-full">
                <Phone size={24} />
              </div>
              <h3 className="mb-2 font-medium">Call Us</h3>
              <p className="mb-4 text-sm text-gray-600">
                Speak with a support representative.
              </p>
              <p className="mb-2 text-sm text-gray-500">Available Monday-Friday</p>
              <p className="text-sm font-medium">10:00 AM - 4:00 PM IST</p>
              <Link 
                href="tel:+918694062222"
                className="inline-block px-4 py-2 mt-4 text-white transition-colors bg-orange-600 rounded-md hover:bg-orange-700"
              >
                Call +91 8694062222
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      
      <ChatwootWidget/>
    </div>
  );
};

export default HelpdeskPage;