'use client';

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, Headphones, Mail, Phone, 
  MessageCircle, Clock, Send, User,
  Package, CreditCard, RotateCcw, AlertCircle,
  CheckCircle, Info, FileText, Search,
  Plus, Minus, MapPin, Calendar,
  ThumbsUp, Star, Users, Globe,
  Facebook, Twitter, Instagram, Linkedin
} from "lucide-react";

const StillNeedHelpPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    category: '',
    message: ''
  });

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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    //console.log('Form submitted:', formData);
    alert('Thank you! Your request has been submitted. We\'ll get back to you within 24 hours.');
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
              <Headphones size={32} />
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">Still Need Help?</h1>
            <p className="text-lg opacity-90">
              We're here for you! Reach out through any channel that works best for you
            </p>
          </div>
        </div>
      </div>
      
      <main className="container px-4 py-8 mx-auto md:py-12">
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
                onClick={() => alert('Live chat will open here')}
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
                            onClick={() => alert('Live chat feature')}
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

                {/* 2. Support Channels */}
                <section id="support-channels" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <MessageCircle size={24} className="text-[#e65100]" />
                    Choose Your Support Channel
                  </h2>
                  
                  <p className="mb-6 text-gray-600">
                    Different channels for different needs. Here's how to choose:
                  </p>

                  <div className="space-y-4">
                    <div className="p-4 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                      <h3 className="flex items-center gap-2 mb-2 font-bold text-gray-900">
                        <CheckCircle size={20} className="text-green-600" />
                        Best for Urgent Issues: Phone or Live Chat
                      </h3>
                      <p className="text-sm text-gray-700">
                        Need immediate help? Call us or use live chat for real-time assistance with order issues, payment problems, or urgent delivery concerns.
                      </p>
                    </div>

                    <div className="p-4 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
                      <h3 className="flex items-center gap-2 mb-2 font-bold text-gray-900">
                        <FileText size={20} className="text-blue-600" />
                        Best for Detailed Queries: Email
                      </h3>
                      <p className="text-sm text-gray-700">
                        Have a complex question or need to attach documents? Email gives you space to explain your issue fully and allows us to provide detailed responses.
                      </p>
                    </div>

                    <div className="p-4 border-l-4 border-purple-500 rounded-r-lg bg-purple-50">
                      <h3 className="flex items-center gap-2 mb-2 font-bold text-gray-900">
                        <MessageCircle size={20} className="text-purple-600" />
                        Best for Quick Questions: WhatsApp
                      </h3>
                      <p className="text-sm text-gray-700">
                        Short questions or quick updates? WhatsApp is perfect for tracking orders, checking product availability, or getting quick answers.
                      </p>
                    </div>

                    <div className="p-4 border-l-4 border-orange-500 rounded-r-lg bg-orange-50">
                      <h3 className="flex items-center gap-2 mb-2 font-bold text-gray-900">
                        <Send size={20} className="text-orange-600" />
                        Best for Non-Urgent Issues: Support Form
                      </h3>
                      <p className="text-sm text-gray-700">
                        Want to submit a request at your convenience? Use our support form below. We'll review and respond within 24 hours.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 3. Help Categories */}
                <section id="help-categories" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <FileText size={24} className="text-[#e65100]" />
                    Browse Help by Category
                  </h2>
                  
                  <p className="mb-6 text-gray-600">
                    Find answers quickly by exploring our help categories:
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    {helpCategories.map((category, index) => (
                      <div 
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:border-[#e65100] hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`bg-${category.color}-100 p-2 rounded-lg`}>
                            {category.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="mb-1 font-semibold text-gray-900">{category.title}</h3>
                            <Link 
                              href={category.link}
                              className="text-sm text-[#e65100] hover:underline"
                            >
                              View Guide →
                            </Link>
                          </div>
                        </div>
                        <ul className="space-y-1 text-xs text-gray-600 ml-11">
                          {category.topics.map((topic, topicIndex) => (
                            <li key={topicIndex} className="flex items-center gap-1">
                              <span className="text-orange-600">•</span>
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                        >
                          <option value="">Select a category</option>
                          <option value="account">Account & Login</option>
                          <option value="order">Orders & Shipping</option>
                          <option value="product">Product Information</option>
                          <option value="return">Returns & Refunds</option>
                          <option value="payment">Payment & Billing</option>
                          <option value="technical">Technical Issues</option>
                          <option value="other">Other</option>
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
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                        placeholder="Please describe your issue in detail. Include any relevant order numbers, error messages, or screenshots."
                      ></textarea>
                    </div>

                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <p className="text-sm text-gray-700">
                        <strong>💡 Tip:</strong> The more details you provide, the faster we can help! Include order numbers, screenshots, and specific error messages if applicable.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full md:w-auto px-8 py-3 bg-[#e65100] text-white font-medium rounded-lg hover:bg-[#d84315] transition-colors flex items-center justify-center gap-2"
                    >
                      <Send size={20} />
                      Submit Request
                    </button>
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
                      href="https://facebook.com/junooni" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 transition-colors border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50"
                    >
                      <Facebook size={32} className="text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Facebook</span>
                    </a>

                    <a 
                      href="https://instagram.com/junooni" 
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
                      className="flex flex-col items-center gap-2 p-4 transition-colors border border-gray-200 rounded-lg hover:border-sky-500 hover:bg-sky-50"
                    >
                      <Twitter size={32} className="text-sky-600" />
                      <span className="text-sm font-medium text-gray-900">Twitter</span>
                    </a>

                    <a 
                      href="https://linkedin.com/company/junooni" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 transition-colors border border-gray-200 rounded-lg hover:border-blue-700 hover:bg-blue-50"
                    >
                      <Linkedin size={32} className="text-blue-700" />
                      <span className="text-sm font-medium text-gray-900">LinkedIn</span>
                    </a>
                  </div>
                </section>

                {/* 8. Feedback */}
                <section id="feedback" className="p-6 mt-8 rounded-lg shadow-sm bg-gradient-to-r from-orange-50 to-red-50 md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <ThumbsUp size={24} className="text-[#e65100]" />
                    We Value Your Feedback
                  </h2>
                  
                  <p className="mb-6 text-gray-700">
                    Your feedback helps us improve! Let us know how we're doing and what we can do better.
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                      <h3 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <Star size={20} className="text-yellow-500" />
                        Rate Your Experience
                      </h3>
                      <p className="mb-3 text-sm text-gray-600">
                        How was your support experience? Your rating helps us serve you better.
                      </p>
                      <button className="text-[#e65100] font-medium hover:underline text-sm">
                        Leave a Rating →
                      </button>
                    </div>

                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                      <h3 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <MessageCircle size={20} className="text-blue-500" />
                        Share Suggestions
                      </h3>
                      <p className="mb-3 text-sm text-gray-600">
                        Have ideas to improve Junooni? We'd love to hear them!
                      </p>
                      <a 
                        href="mailto:feedback@junooni.com" 
                        className="text-[#e65100] font-medium hover:underline text-sm"
                      >
                        Send Feedback →
                      </a>
                    </div>
                  </div>
                </section>

                {/* Final CTA */}
                <div className="mt-8 bg-[#e65100] text-white rounded-lg shadow-lg p-6 md:p-8 text-center">
                  <h3 className="mb-3 text-2xl font-bold">We're Here to Help!</h3>
                  <p className="mb-6 opacity-90">
                    Don't hesitate to reach out. Our team is dedicated to ensuring you have the best experience with Junooni.
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <a 
                      href="tel:+918694062222"
                      className="px-6 py-3 bg-white text-[#e65100] font-medium rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <Phone size={20} />
                      Call Now
                    </a>
                    <a 
                      href="mailto:support@junooni.com"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 font-medium text-white transition-colors rounded-lg bg-white/20 hover:bg-white/30"
                    >
                      <Mail size={20} />
                      Email Us
                    </a>
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
            <Link href="/terms" className="text-sm text-gray-500 hover:text-[#e65100]">Terms & Conditions</Link>
            <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-[#e65100]">Privacy Policy</Link>
            <Link href="/help" className="text-sm text-[#e65100] font-medium">Help Center</Link>
            <Link href="/contact" className="text-sm text-gray-500 hover:text-[#e65100]">Contact Us</Link>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default StillNeedHelpPage;