'use client';

import React, { useState, useEffect, useRef } from "react";
import ChatwootWidget from '../chatwootWidget/page';
import Link from "next/link";
import { 
  ShoppingBag, Headphones, Mail, Phone, 
  MessageCircle, Clock, Send, User,
  Package, CreditCard, RotateCcw, AlertCircle,
  CheckCircle, Info, FileText, Search,
  Plus, Minus, MapPin, Calendar,
  ThumbsUp, Star, Users, Globe,
  Facebook, Twitter, Instagram, Linkedin, X, Youtube,
  Shield
} from "lucide-react";
import twitterIcon from "@assets/twitter.png"

const StillNeedHelpPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    category: '',
    message: '',
    honeypot: '', // Bot trap field
    isVerified: false // Human verification checkbox
  });
  
  // Track when form was first interacted with (bot protection)
  const formStartTime = useRef(null);
  const minFormTime = 3000; // Minimum 3 seconds to fill form (bots are faster)

  // Initialize form start time when component mounts
  useEffect(() => {
    formStartTime.current = Date.now();
  }, []);

  // Function to open Chatwoot widget
  const openChatwoot = () => {
    if (window.$chatwoot && typeof window.$chatwoot.toggle === 'function') {
      window.$chatwoot.toggle();
    } else {
      console.log('Chatwoot API not ready yet, waiting...');
      setTimeout(() => {
        if (window.$chatwoot && typeof window.$chatwoot.toggle === 'function') {
          window.$chatwoot.toggle();
        } else {
          console.error('Chatwoot API still not available after delay');
          alert("The support chat couldn't be opened. Please refresh the page and try again.");
        }
      }, 1500);
    }
  };

  // Quick links navigation
  const quickLinks = [
    { id: "contact-us", title: "Contact Us", icon: <Phone size={20} /> },
    { id: "support-channels", title: "Support Channels", icon: <MessageCircle size={20} /> },
    { id: "help-categories", title: "Help Categories", icon: <FileText size={20} /> },
    { id: "submit-request", title: "Submit Request", icon: <Send size={20} /> },
    { id: "support-hours", title: "Support Hours", icon: <Clock size={20} /> },
    { id: "faq", title: "Common Questions", icon: <Info size={20} /> },
    { id: "community", title: "Community", icon: <Users size={20} /> },
    { id: "feedback", title: "Feedback", icon: <ThumbsUp size={20} /> }
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Bot protection checks
    const formFillTime = Date.now() - formStartTime.current;
    
    // Check 1: Honeypot field (should be empty)
    if (formData.honeypot !== '') {
      console.log('Bot detected: honeypot field filled');
      return; // Silent fail for bots
    }
    
    // Check 2: Form filled too quickly (likely a bot)
    if (formFillTime < minFormTime) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 5000);
      return;
    }
    
    // Check 3: Human verification checkbox
    if (!formData.isVerified) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 5000);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Format the message for Chatwoot
      const messageBody = `
📋 **New Support Request**

**Name:** ${formData.name}
**Email:** ${formData.email}
${formData.orderNumber ? `**Order Number:** ${formData.orderNumber}` : ''}
**Category:** ${formData.category}

**Message:**
${formData.message}

---
*Submitted via Support Request Form*
*Form fill time: ${Math.round(formFillTime / 1000)}s*
      `.trim();

      // Send to your backend API endpoint that forwards to Chatwoot
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/chat-support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          orderNumber: formData.orderNumber,
          category: formData.category,
          message: formData.message,
          formattedMessage: messageBody,
          formFillTime: formFillTime // Send for server-side validation
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          orderNumber: '',
          category: '',
          message: '',
          honeypot: '',
          isVerified: false
        });
        
        // Reset form start time
        formStartTime.current = Date.now();

        // Auto-hide success message after 10 seconds
        setTimeout(() => {
          setSubmitStatus(null);
        }, 10000);
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      
      // Auto-hide error message after 10 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 10000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Help categories
  const helpCategories = [
    {
      title: "Account & Login",
      icon: <User size={24} className="text-blue-600" />,
      color: "blue",
      link: "/account-help",
      topics: ["Password reset", "Account creation", "Login issues", "Profile settings"]
    },
    {
      title: "Orders & Shipping",
      icon: <Package size={24} className="text-orange-600" />,
      color: "orange",
      link: "/orders-shipping",
      topics: ["Track order", "Delivery times", "Modify order", "Shipping costs"]
    },
    {
      title: "Product Information",
      icon: <Info size={24} className="text-green-600" />,
      color: "green",
      link: "/product-information",
      topics: ["Size guide", "Quality assurance", "Product details", "Reviews"]
    },
    {
      title: "Returns & Refunds",
      icon: <RotateCcw size={24} className="text-purple-600" />,
      color: "purple",
      link: "/refund-exchange",
      topics: ["Return process", "Refund status", "Exchange items", "Return policy"]
    },
    {
      title: "Payment & Billing",
      icon: <CreditCard size={24} className="text-red-600" />,
      color: "red",
      link: "/payment-methods",
      topics: ["Payment methods", "Failed payments", "Invoices", "Refunds"]
    },
    {
      title: "Technical Issues",
      icon: <AlertCircle size={24} className="text-yellow-600" />,
      color: "yellow",
      link: "/technical-support",
      topics: ["Website errors", "App issues", "Browser problems", "Checkout issues"]
    }
  ];

  // FAQs
  const faqs = [
    {
      question: "How quickly will I get a response?",
      answer: "Email: Within 24 hours | Phone: Immediate during business hours | WhatsApp: Within 2-4 hours | Chat: Within 5 minutes during business hours"
    },
    {
      question: "Do you offer 24/7 customer support?",
      answer: "Our phone and chat support is available Monday-Saturday, 9 AM - 7 PM IST. Email and WhatsApp support is monitored 7 days a week, though response times may be longer on Sundays and holidays."
    },
    {
      question: "What information should I have ready when contacting support?",
      answer: "Please have your order number (if applicable), registered email address, and a clear description of your issue. Screenshots or photos are helpful for technical or product-related queries."
    },
    {
      question: "Can I get support in languages other than English?",
      answer: "Yes! We offer support in Hindi, English, and several regional Indian languages. Let us know your preferred language when you contact us."
    },
    {
      question: "How do I escalate an unresolved issue?",
      answer: "If your issue isn't resolved satisfactorily, you can request to speak with a supervisor or senior support team member. You can also email escalations@junooni.com for urgent matters."
    },
    {
      question: "Is there a way to track my support request?",
      answer: "Yes! When you submit a support request via email or our form, you'll receive a ticket number. You can use this to track your request status in your account dashboard."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <header className="sticky top-0 z-10 py-4 bg-white shadow-sm">
        <div className="container px-4 mx-auto">
          <Link href="/" className="flex items-center">
            <ShoppingBag className="h-6 w-6 text-[#e65100] mr-2" />
            <span className="text-lg font-bold">JUNOONI</span>
          </Link>
        </div>
      </header> */}
      
      {/* Hero Section */}
      <div className="bg-[#e65100] text-white py-10 md:py-12 mt-8 md:mt-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white/20">
              <Headphones size={32} />
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">Still Need Help?</h1>
            <p className="text-lg opacity-90">
              We're here for you! Reach out through any channel that works best for you
            </p>
          </div>
        </div>
      </div>
      
      <main className="px-4 py-8 mx-auto md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
            <div className="p-6 text-center bg-white border-t-4 border-blue-500 rounded-lg shadow-sm">
              <Phone size={32} className="mx-auto mb-3 text-blue-600" />
              <h3 className="mb-2 font-bold text-gray-900">Call Us</h3>
              <p className="mb-3 text-sm text-gray-600">Speak directly with our team</p>
              <a 
                href="tel:+918694062222"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                +91 8694062222 →
              </a>
            </div>
            
            <div className="p-6 text-center bg-white border-t-4 border-orange-500 rounded-lg shadow-sm">
              <Mail size={32} className="mx-auto mb-3 text-orange-600" />
              <h3 className="mb-2 font-bold text-gray-900">Email Us</h3>
              <p className="mb-3 text-sm text-gray-600">Get detailed assistance</p>
              <a 
                href="mailto:support@junooni.com"
                className="text-sm font-medium text-orange-600 hover:underline"
              >
                support@junooni.com →
              </a>
            </div>
            
            <div className="p-6 text-center bg-white border-t-4 border-green-500 rounded-lg shadow-sm">
              <MessageCircle size={32} className="mx-auto mb-3 text-green-600" />
              <h3 className="mb-2 font-bold text-gray-900">Live Chat</h3>
              <p className="mb-3 text-sm text-gray-600">Quick answers, instant help</p>
              <button 
                onClick={openChatwoot}
                className="text-sm font-medium text-green-600 hover:underline"
              >
                Start Chat →
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
                
                {/* 1. Contact Us */}
                <section id="contact-us" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Phone size={24} className="text-[#e65100]" />
                    Contact Us
                  </h2>
                  
                  <p className="mb-6 text-gray-600">
                    Multiple ways to reach our support team. Choose the method that works best for you!
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-[#e65100] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Phone size={24} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1 font-semibold text-gray-900">Phone Support</h3>
                          <p className="mb-2 text-sm text-gray-600">Speak directly with our team</p>
                          <a href="tel:+918694062222" className="text-[#e65100] font-medium hover:underline">
                            +91 8694062222
                          </a>
                          <p className="mt-1 text-xs text-gray-500">Mon-Sat: 9 AM - 7 PM IST</p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 hover:border-[#e65100] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-orange-100 rounded-lg">
                          <Mail size={24} className="text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1 font-semibold text-gray-900">Email Support</h3>
                          <p className="mb-2 text-sm text-gray-600">Get detailed assistance</p>
                          <a href="mailto:support@junooni.com" className="text-[#e65100] font-medium hover:underline">
                            support@junooni.com
                          </a>
                          <p className="mt-1 text-xs text-gray-500">Response within 24 hours</p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 hover:border-[#e65100] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <MessageCircle size={24} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1 font-semibold text-gray-900">WhatsApp</h3>
                          <p className="mb-2 text-sm text-gray-600">Quick messages, fast replies</p>
                          <a href="https://wa.me/918694062222" className="text-[#e65100] font-medium hover:underline" target="_blank" rel="noopener noreferrer">
                            Chat on WhatsApp
                          </a>
                          <p className="mt-1 text-xs text-gray-500">Response within 2-4 hours</p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 hover:border-[#e65100] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <MessageCircle size={24} className="text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1 font-semibold text-gray-900">Live Chat</h3>
                          <p className="mb-2 text-sm text-gray-600">Instant help, real-time</p>
                          <button 
                            onClick={openChatwoot}
                            className="text-[#e65100] font-medium hover:underline"
                          >
                            Start Live Chat
                          </button>
                          <p className="mt-1 text-xs text-gray-500">Available during business hours</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 mt-6 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="mb-1 font-semibold text-gray-900">Visit Our Office</h4>
                        <p className="text-sm text-gray-700">
                          Junooni Office<br />
                          C-30, Vasant vihar<br />
                          Uttar Pradesh - 247001, India
                        </p>
                        <p className="mt-2 text-xs text-gray-600">Office Hours: Monday-Friday, 10 AM - 6 PM IST</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 4. Submit Support Request */}
                <section id="submit-request" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Send size={24} className="text-[#e65100]" />
                    Submit a Support Request
                  </h2>
                  
                  <p className="mb-6 text-gray-600">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Honeypot field - hidden from users, visible to bots */}
                    <div className="absolute opacity-0 pointer-events-none" aria-hidden="true">
                      <input
                        type="text"
                        name="honeypot"
                        value={formData.honeypot}
                        onChange={handleInputChange}
                        tabIndex="-1"
                        autoComplete="off"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent disabled:bg-gray-100"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent disabled:bg-gray-100"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Order Number (if applicable)
                        </label>
                        <input
                          type="text"
                          name="orderNumber"
                          value={formData.orderNumber}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent disabled:bg-gray-100"
                          placeholder="JUN-123456"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent disabled:bg-gray-100"
                        >
                          <option value="">Select a category</option>
                          <option value="Account & Login">Account & Login</option>
                          <option value="Orders & Shipping">Orders & Shipping</option>
                          <option value="Product Information">Product Information</option>
                          <option value="Returns & Refunds">Returns & Refunds</option>
                          <option value="Payment & Billing">Payment & Billing</option>
                          <option value="Technical Issues">Technical Issues</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        How can we help you? *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent disabled:bg-gray-100"
                        placeholder="Please describe your issue in detail. Include any relevant order numbers, error messages."
                      ></textarea>
                    </div>

                    {/* Human Verification Checkbox */}
                    <div className="p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="isVerified"
                          name="isVerified"
                          checked={formData.isVerified}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-5 h-5 mt-0.5 text-[#e65100] border-gray-300 rounded focus:ring-[#e65100] focus:ring-2 disabled:bg-gray-200"
                        />
                        <label htmlFor="isVerified" className="flex-1 text-sm text-gray-900 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <Shield size={18} className="text-[#e65100]" />
                            <span className="font-semibold">I'm not a robot *</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Please check this box to verify you're a human and help us prevent spam
                          </p>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                      <p className="text-sm text-gray-700">
                        <strong>💡 Tip:</strong> The more details you provide, the faster we can help! Include order numbers, and specific error messages if applicable.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.isVerified}
                      className="w-full md:w-auto px-8 py-3 bg-[#e65100] text-white font-medium rounded-lg hover:bg-[#d84315] transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Submit Request
                        </>
                      )}
                    </button>

                    {/* Success Message */}
                    {submitStatus === 'success' && (
                      <div className="p-4 border border-green-300 rounded-lg bg-green-50 animate-fadeIn">
                        <div className="flex items-start gap-3">
                          <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="mb-1 font-semibold text-green-900">Request Submitted Successfully!</h4>
                            <p className="text-sm text-green-700">
                              Thank you! Your request has been submitted. We'll get back to you within 24 hours.
                            </p>
                          </div>
                          <button
                            onClick={() => setSubmitStatus(null)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {submitStatus === 'error' && (
                      <div className="p-4 border border-red-300 rounded-lg bg-red-50 animate-fadeIn">
                        <div className="flex items-start gap-3">
                          <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="mb-1 font-semibold text-red-900">Submission Failed</h4>
                            <p className="text-sm text-red-700">
                              {!formData.isVerified 
                                ? "Please verify you're not a robot by checking the verification box above."
                                : "There was an error submitting your request. Please try again or contact us directly at "}
                              {formData.isVerified && (
                                <a href="mailto:support@junooni.com" className="underline font-medium">support@junooni.com</a>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => setSubmitStatus(null)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </section>

                {/* 5. Support Hours */}
                <section id="support-hours" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Clock size={24} className="text-[#e65100]" />
                    Support Hours & Response Times
                  </h2>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-sm font-semibold text-left text-gray-900 border-b">Support Channel</th>
                          <th className="px-4 py-3 text-sm font-semibold text-left text-gray-900 border-b">Availability</th>
                          <th className="px-4 py-3 text-sm font-semibold text-left text-gray-900 border-b">Response Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">Phone Support</td>
                          <td className="px-4 py-3 text-sm text-gray-600">Mon-Sat: 9 AM - 7 PM IST</td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600">Immediate</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">Live Chat</td>
                          <td className="px-4 py-3 text-sm text-gray-600">Mon-Sat: 9 AM - 7 PM IST</td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600">2-5 minutes</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">WhatsApp</td>
                          <td className="px-4 py-3 text-sm text-gray-600">7 days a week</td>
                          <td className="px-4 py-3 text-sm font-medium text-blue-600">2-4 hours</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">Email</td>
                          <td className="px-4 py-3 text-sm text-gray-600">7 days a week</td>
                          <td className="px-4 py-3 text-sm font-medium text-orange-600">6-24 hours</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">Support Form</td>
                          <td className="px-4 py-3 text-sm text-gray-600">7 days a week</td>
                          <td className="px-4 py-3 text-sm font-medium text-orange-600">12-24 hours</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="grid gap-4 mt-6 md:grid-cols-2">
                    <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <Calendar size={18} className="text-yellow-600" />
                        Holiday Schedule
                      </h4>
                      <p className="text-sm text-gray-700">
                        Support is limited on national holidays. Email and WhatsApp are monitored, but response times may be longer. We'll be back at full capacity the next business day!
                      </p>
                    </div>

                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <AlertCircle size={18} className="text-blue-600" />
                        Peak Season
                      </h4>
                      <p className="text-sm text-gray-700">
                        During festivals and sales (Diwali, New Year, etc.), response times may be slightly longer due to high volume. We appreciate your patience!
                      </p>
                    </div>
                  </div>
                </section>

                {/* 6. Common Questions */}
                <section id="faq" className="scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Info size={24} className="text-[#e65100]" />
                    Common Questions About Support
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

                {/* 7. Community & Social */}
                <section id="community" className="p-6 mt-8 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Users size={24} className="text-[#e65100]" />
                    Join Our Community
                  </h2>
                  
                  <p className="mb-6 text-gray-600">
                    Connect with us on social media for updates, tips, and inspiration!
                  </p>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <a 
                      href="https://www.facebook.com/p/Junooni-61577994639087/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 transition-colors border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50"
                    >
                      <Facebook size={32} className="text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Facebook</span>
                    </a>

                    <a 
                      href="https://www.instagram.com/bejunooni?utm_source=qr&igsh=YmI4eTJhazMxMHo0" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 transition-colors border border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50"
                    >
                      <Instagram size={32} className="text-pink-600" />
                      <span className="text-sm font-medium text-gray-900">Instagram</span>
                    </a>

                    <a
                      href="https://twitter.com/junooni"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 transition-colors border border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50"
                    >
                      <img src={twitterIcon.src} alt="X (Twitter)" className="w-8 h-8 object-contain" />
                      <span className="text-sm font-medium text-gray-900">X</span>
                    </a>

                    <a 
                      href="https://www.youtube.com/@bejunooni?si=p96lWYtfDUMhsII3" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 transition-colors border border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50"
                    >
                      <Youtube size={32} className="text-red-600" />
                      <span className="text-sm font-medium text-gray-900">Youtube</span>
                    </a>
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

      {/* Add animation style for fade-in */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
      
    </div>
  );
};

export default StillNeedHelpPage;