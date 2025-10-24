'use client';

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, User, Lock, Mail, Key, 
  UserCheck, Settings, Eye, EyeOff, 
  AlertCircle, CheckCircle, Info, Shield,
  Trash2, Edit, Bell, CreditCard, Package,
  Phone, MapPin, Plus, Minus, LogIn, UserPlus
} from "lucide-react";

const AccountHelpPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Quick links navigation
  const quickLinks = [
    { id: "create-account", title: "Create Account", icon: <UserPlus size={20} /> },
    { id: "login-issues", title: "Login Issues", icon: <LogIn size={20} /> },
    { id: "password", title: "Password Help", icon: <Key size={20} /> },
    { id: "profile", title: "Profile Settings", icon: <User size={20} /> },
    { id: "security", title: "Security", icon: <Shield size={20} /> },
    { id: "preferences", title: "Preferences", icon: <Settings size={20} /> },
    { id: "delete-account", title: "Delete Account", icon: <Trash2 size={20} /> },
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

  // FAQs
  const faqs = [
    {
      question: "Do I need an account to shop on Junooni?",
      answer: "You can browse our products without an account, but you'll need to create one to complete a purchase. Having an account allows you to track orders, save addresses, and manage your preferences."
    },
    {
      question: "Is it free to create an account?",
      answer: "Yes! Creating a Junooni account is completely free. There are no membership fees or hidden charges."
    },
    {
      question: "Can I use my social media account to sign in?",
      answer: "Currently, we support email/password login. Social media login options (Google, Facebook) may be added in the future. Stay tuned!"
    },
    {
      question: "I forgot which email I used to register. How can I find it?",
      answer: "Try entering the email addresses you commonly use on the login page. If you're still unable to find it, contact our support team with your order number or phone number, and we'll help locate your account."
    },
    {
      question: "Can I change my email address?",
      answer: "Yes, you can update your email address in Account Settings > Profile Information. You'll receive a verification email to confirm the change."
    },
    {
      question: "How do I unsubscribe from marketing emails?",
      answer: "You can click the 'Unsubscribe' link at the bottom of any marketing email, or manage your email preferences in Account Settings > Communication Preferences."
    },
    {
      question: "What happens to my orders if I delete my account?",
      answer: "Deleting your account doesn't cancel active orders. You'll still receive your orders, but you won't be able to track them through your account. We recommend keeping your account active until all orders are delivered."
    },
    {
      question: "Can I have multiple accounts with the same email?",
      answer: "No, each email address can only be associated with one account. However, you can add multiple shipping addresses to a single account."
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
              <User size={32} />
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">Account Help</h1>
            <p className="text-lg opacity-90">
              Everything you need to know about managing your Junooni account
            </p>
          </div>
        </div>
      </div>
      
      <main className="container px-4 py-8 mx-auto md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
            <div className="p-6 text-center bg-white border-t-4 border-blue-500 rounded-lg shadow-sm">
              <UserPlus size={32} className="mx-auto mb-3 text-blue-600" />
              <h3 className="mb-2 font-bold text-gray-900">New User?</h3>
              <p className="mb-3 text-sm text-gray-600">Create your account in minutes</p>
              <button 
                onClick={() => scrollToSection('create-account')}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Get Started →
              </button>
            </div>
            
            <div className="p-6 text-center bg-white border-t-4 border-orange-500 rounded-lg shadow-sm">
              <Key size={32} className="mx-auto mb-3 text-orange-600" />
              <h3 className="mb-2 font-bold text-gray-900">Can't Sign In?</h3>
              <p className="mb-3 text-sm text-gray-600">Reset your password quickly</p>
              <button 
                onClick={() => scrollToSection('password')}
                className="text-sm font-medium text-orange-600 hover:underline"
              >
                Reset Password →
              </button>
            </div>
            
            <div className="p-6 text-center bg-white border-t-4 border-green-500 rounded-lg shadow-sm">
              <Settings size={32} className="mx-auto mb-3 text-green-600" />
              <h3 className="mb-2 font-bold text-gray-900">Manage Account</h3>
              <p className="mb-3 text-sm text-gray-600">Update your profile & settings</p>
              <button 
                onClick={() => scrollToSection('profile')}
                className="text-sm font-medium text-green-600 hover:underline"
              >
                Learn How →
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
              <div className="p-6 bg-white rounded-lg shadow-sm md:p-8">
                
                {/* 1. Creating an Account */}
                <section id="create-account" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <UserPlus size={24} className="text-[#e65100]" />
                    Creating an Account
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Creating a Junooni account is quick and easy! Follow these steps:
                  </p>

                  <div className="mb-6 space-y-4">
                    <div className="flex gap-4 p-4 rounded-lg bg-orange-50">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[#e65100] text-white flex items-center justify-center font-bold text-sm">
                          1
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-gray-900">Click "Sign Up"</h3>
                        <p className="text-sm text-gray-600">Find the Sign Up button in the top right corner of our website.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-lg bg-orange-50">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[#e65100] text-white flex items-center justify-center font-bold text-sm">
                          2
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-gray-900">Enter Your Information</h3>
                        <p className="text-sm text-gray-600">Provide your name, email address, and create a strong password.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-lg bg-orange-50">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[#e65100] text-white flex items-center justify-center font-bold text-sm">
                          3
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-gray-900">Verify Your Email</h3>
                        <p className="text-sm text-gray-600">Check your inbox for a verification email and click the confirmation link.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-lg bg-orange-50">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[#e65100] text-white flex items-center justify-center font-bold text-sm">
                          4
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-gray-900">Start Shopping!</h3>
                        <p className="text-sm text-gray-600">Your account is ready. Browse and add items to your cart.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
                    <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                      <Info size={20} className="text-blue-600" />
                      What You'll Need
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• A valid email address</li>
                      <li>• A password (minimum 8 characters with letters and numbers)</li>
                      <li>• Your name (as you'd like it to appear)</li>
                      <li>• Optional: Phone number for order updates</li>
                    </ul>
                  </div>
                </section>

                {/* 2. Login Issues */}
                <section id="login-issues" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <LogIn size={24} className="text-[#e65100]" />
                    Login Issues & Troubleshooting
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Having trouble signing in? Here are common issues and solutions:
                  </p>

                  <div className="space-y-4">
                    <div className="p-3 pl-4 border-l-4 border-red-500 rounded-r-lg bg-red-50">
                      <h4 className="mb-1 font-semibold text-gray-900">"Invalid Email or Password"</h4>
                      <p className="mb-2 text-sm text-gray-700">This usually means:</p>
                      <ul className="ml-4 space-y-1 text-sm text-gray-700">
                        <li>• You may have mistyped your email or password (check for typos)</li>
                        <li>• Your password may be incorrect (try resetting it)</li>
                        <li>• You might be using a different email than registered</li>
                        <li>• Caps Lock might be on</li>
                      </ul>
                    </div>

                    <div className="p-3 pl-4 border-l-4 border-yellow-500 rounded-r-lg bg-yellow-50">
                      <h4 className="mb-1 font-semibold text-gray-900">"Account Locked"</h4>
                      <p className="mb-2 text-sm text-gray-700">
                        After multiple failed login attempts, your account may be temporarily locked for security. 
                        Wait 30 minutes and try again, or reset your password.
                      </p>
                    </div>

                    <div className="p-3 pl-4 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
                      <h4 className="mb-1 font-semibold text-gray-900">"Email Not Verified"</h4>
                      <p className="mb-2 text-sm text-gray-700">
                        Check your inbox (and spam folder) for the verification email. Click "Resend Verification Email" 
                        on the login page if needed.
                      </p>
                    </div>

                    <div className="p-3 pl-4 border-l-4 border-purple-500 rounded-r-lg bg-purple-50">
                      <h4 className="mb-1 font-semibold text-gray-900">Can't Remember Email</h4>
                      <p className="mb-2 text-sm text-gray-700">
                        Try all email addresses you commonly use. If still unable to access, contact support with your 
                        full name and any previous order information.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 3. Password Help */}
                <section id="password" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Key size={24} className="text-[#e65100]" />
                    Password Help
                  </h2>
                  
                  <h3 className="mb-3 text-xl font-semibold text-gray-800">Forgot Your Password?</h3>
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Don't worry! Resetting your password is simple:
                  </p>

                  <div className="p-4 mb-6 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                    <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                      <li>Click "Forgot Password?" on the login page</li>
                      <li>Enter your registered email address</li>
                      <li>Check your email for a password reset link</li>
                      <li>Click the link (valid for 1 hour)</li>
                      <li>Create a new password</li>
                      <li>Log in with your new password</li>
                    </ol>
                  </div>

                  <h3 className="mb-3 text-xl font-semibold text-gray-800">Change Your Password</h3>
                  <p className="mb-4 leading-relaxed text-gray-600">
                    To change your password when logged in:
                  </p>
                  <ol className="mb-6 ml-4 space-y-2 text-gray-600 list-decimal list-inside">
                    <li>Go to Account Settings → Security</li>
                    <li>Click "Change Password"</li>
                    <li>Enter your current password</li>
                    <li>Enter your new password twice</li>
                    <li>Click "Update Password"</li>
                  </ol>

                  <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                    <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                      <Shield size={20} className="text-orange-600" />
                      Password Best Practices
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Use at least 8 characters</li>
                      <li>• Include uppercase and lowercase letters</li>
                      <li>• Include numbers and special characters</li>
                      <li>• Don't use common words or personal information</li>
                      <li>• Use a unique password (don't reuse from other sites)</li>
                      <li>• Change your password every 6-12 months</li>
                    </ul>
                  </div>
                </section>

                {/* 4. Profile Settings */}
                <section id="profile" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <User size={24} className="text-[#e65100]" />
                    Managing Your Profile
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    You can update your account information at any time:
                  </p>

                  <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3 mb-2">
                        <User size={20} className="text-[#e65100] mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Personal Information</h4>
                          <p className="mt-1 text-sm text-gray-600">Update your name, email, phone number, and date of birth.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3 mb-2">
                        <MapPin size={20} className="text-[#e65100] mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Addresses</h4>
                          <p className="mt-1 text-sm text-gray-600">Add, edit, or remove shipping and billing addresses.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3 mb-2">
                        <CreditCard size={20} className="text-[#e65100] mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Payment Methods</h4>
                          <p className="mt-1 text-sm text-gray-600">Save cards for faster checkout (stored securely).</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3 mb-2">
                        <Package size={20} className="text-[#e65100] mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Order History</h4>
                          <p className="mt-1 text-sm text-gray-600">View all your past orders and track current ones.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
                    <p className="text-sm text-gray-700">
                      <strong>How to update:</strong> Log in → Go to "My Account" → Select the section you want to update → 
                      Make changes → Click "Save"
                    </p>
                  </div>
                </section>

                {/* 5. Account Security */}
                <section id="security" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Shield size={24} className="text-[#e65100]" />
                    Account Security
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We take your security seriously. Here's how we protect your account:
                  </p>

                  <div className="mb-6 space-y-4">
                    <div className="p-4 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <Lock size={20} className="text-green-600" />
                        We Protect Your Data
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• 256-bit SSL encryption for all data transmission</li>
                        <li>• Passwords are hashed and never stored in plain text</li>
                        <li>• Two-factor authentication available (coming soon)</li>
                        <li>• Regular security audits and monitoring</li>
                        <li>• PCI-DSS compliant payment processing</li>
                      </ul>
                    </div>

                    <div className="p-4 border-l-4 border-yellow-500 rounded-r-lg bg-yellow-50">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <AlertCircle size={20} className="text-yellow-600" />
                        You Can Protect Your Account
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• Use a strong, unique password</li>
                        <li>• Never share your password with anyone</li>
                        <li>• Log out when using shared devices</li>
                        <li>• Be wary of phishing emails (we'll never ask for your password)</li>
                        <li>• Keep your email account secure</li>
                        <li>• Review your order history regularly for unauthorized purchases</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                      <AlertCircle size={20} className="text-red-600" />
                      Suspect Unauthorized Access?
                    </h4>
                    <p className="mb-2 text-sm text-gray-700">
                      If you notice suspicious activity on your account:
                    </p>
                    <ol className="ml-2 space-y-1 text-sm text-gray-700 list-decimal list-inside">
                      <li>Change your password immediately</li>
                      <li>Review recent orders and activity</li>
                      <li>Contact our support team right away</li>
                      <li>Check your payment methods for unauthorized charges</li>
                    </ol>
                  </div>
                </section>

                {/* 6. Email & Notification Preferences */}
                <section id="preferences" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Bell size={24} className="text-[#e65100]" />
                    Email & Notification Preferences
                  </h2>
                  
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Control what emails and notifications you receive from Junooni:
                  </p>

                  <div className="mb-6 space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Transactional Emails (Required)</h4>
                        <p className="text-sm text-gray-600">Order confirmations, shipping updates, receipts. These cannot be disabled.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Mail size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Marketing Emails (Optional)</h4>
                        <p className="text-sm text-gray-600">New products, sales, exclusive offers. You can opt-in or opt-out anytime.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Bell size={20} className="text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Creator Notifications (Optional)</h4>
                        <p className="text-sm text-gray-600">New drops from your favorite creators. Manage per creator.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Info size={20} className="text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Account Updates (Optional)</h4>
                        <p className="text-sm text-gray-600">Security alerts, policy updates, new features.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
                    <p className="mb-2 text-sm text-gray-700">
                      <strong>How to manage preferences:</strong>
                    </p>
                    <p className="text-sm text-gray-700">
                      Go to Account Settings → Communication Preferences, or click "Unsubscribe" at the bottom of any marketing email.
                    </p>
                  </div>
                </section>

                {/* 7. Deleting Your Account */}
                <section id="delete-account" className="mb-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Trash2 size={24} className="text-[#e65100]" />
                    Deleting Your Account
                  </h2>
                  
                  <div className="p-4 mb-4 border-l-4 border-red-500 rounded-r-lg bg-red-50">
                    <p className="mb-2 text-sm text-gray-700">
                      <strong>⚠️ Important:</strong> Deleting your account is permanent and cannot be undone.
                    </p>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Before You Delete:</h3>
                  <ul className="mb-6 ml-4 space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 font-bold text-orange-600">•</span>
                      <span>Complete or cancel all pending orders</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 font-bold text-orange-600">•</span>
                      <span>Download any order history or receipts you need</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 font-bold text-orange-600">•</span>
                      <span>Redeem any gift cards or store credit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 font-bold text-orange-600">•</span>
                      <span>Resolve any disputes or return issues</span>
                    </li>
                  </ul>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">What Gets Deleted:</h3>
                  <ul className="mb-6 ml-4 space-y-2 text-gray-600">
                    <li>✗ Your profile information and preferences</li>
                    <li>✗ Saved addresses and payment methods</li>
                    <li>✗ Order history (you won't be able to track or return items)</li>
                    <li>✗ Wishlist and saved items</li>
                    <li>✗ Reviews and ratings you've posted</li>
                  </ul>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">How to Delete Your Account:</h3>
                  <ol className="mb-6 ml-4 space-y-2 text-gray-600 list-decimal list-inside">
                    <li>Log into your account</li>
                    <li>Go to Account Settings → Privacy & Data</li>
                    <li>Scroll to "Delete Account"</li>
                    <li>Click "Request Account Deletion"</li>
                    <li>Confirm by entering your password</li>
                    <li>You'll receive a confirmation email</li>
                    <li>Your account will be deleted within 30 days</li>
                  </ol>

                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> We retain some information as required by law (purchase records for tax purposes, 
                      etc.) but your personal account access will be permanently removed.
                    </p>
                  </div>
                </section>

                {/* 8. FAQs */}
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

                {/* Contact Support */}
                <div className="pt-6 mt-8 border-t border-gray-200">
                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-6 rounded-r-lg">
                    <h3 className="flex items-center gap-2 mb-4 font-bold text-gray-900">
                      <Mail size={24} className="text-[#e65100]" />
                      Still Need Help?
                    </h3>
                    
                    <p className="mb-4 text-gray-700">
                      Our support team is here to assist you with any account-related questions.
                    </p>
                    
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
                          <a href="tel:+919557294610" className="text-[#e65100] hover:underline">
                            +91 9557294610
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
      
      {/* Footer */}
      {/* <footer className="py-6 mt-12 bg-white border-t">
        <div className="container px-4 mx-auto text-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Junooni. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <Link href="/terms" className="text-sm text-gray-500 hover:text-[#e65100]">Terms & Conditions</Link>
            <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-[#e65100]">Privacy Policy</Link>
            <Link href="/account-help" className="text-sm text-[#e65100] font-medium">Account Help</Link>
            <Link href="/help" className="text-sm text-gray-500 hover:text-[#e65100]">Help Center</Link>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default AccountHelpPage;