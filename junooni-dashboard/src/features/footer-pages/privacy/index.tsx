import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { 
  Shield,
  Lock,
  Eye,
  Users,
  Database,
  Globe,
  CheckCircle,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  MessageCircle,
  Briefcase,
  CreditCard,
  Cookie,
  Bell,
  Settings,
  Trash2,
  Download,
  UserX,
  Key,
  Share2,
  Server,
  ShieldCheck,
  Info,
  ExternalLink,
  Calendar,
  MapPin,
  Smartphone,
  Menu,
  X,
  ArrowRight
} from 'lucide-react';
import junoonilogo from '/src/assets/junooni_logo_brand_color.png';

export default function PrivacyPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHoveredRegister, setIsHoveredRegister] = useState(false);
  const [isHoveredLogin, setIsHoveredLogin] = useState(false);
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate({ to: '/sign-up' });
  };

  const handleLoginClick = () => {
    navigate({ to: '/sign-in' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* NAV - Mobile Optimized */}
      <nav className="fixed z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-2 sm:gap-3">
                <img src={junoonilogo} alt="Junooni" className="h-6 sm:h-8" />
                <span className="hidden text-xs font-semibold text-gray-700 sm:text-sm md:block">Creator Studio</span>
              </button>
            </div>

            <div className="items-center hidden gap-3 md:flex">
              <Button variant="ghost" onClick={() => navigate({ to: '/' })}>Home</Button>
              <Button variant="ghost" onClick={() => window.scrollTo({ top: document.getElementById('how-it-works')?.offsetTop || 0, behavior: 'smooth' })}>How it works</Button>
              <Button variant="outline" onClick={handleLoginClick} onMouseEnter={() => setIsHoveredLogin(true)} onMouseLeave={() => setIsHoveredLogin(false)}>
                Login {isHoveredLogin && <ArrowRight className="w-4 h-4 ml-2 animate-pulse" />}
              </Button>
              <Button onClick={handleRegisterClick} className="bg-[#e65100] text-white" onMouseEnter={() => setIsHoveredRegister(true)} onMouseLeave={() => setIsHoveredRegister(false)}>
                Start Selling {isHoveredRegister && <ArrowRight className="w-4 h-4 ml-2 animate-pulse" />}
              </Button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-gray-100">
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="py-4 border-t border-gray-100 md:hidden">
              <div className="flex flex-col gap-3 px-2">
                <Button variant="ghost" onClick={() => { setIsMenuOpen(false); navigate({ to: '/' }); }}>Home</Button>
                <Button variant="ghost" onClick={() => { setIsMenuOpen(false); handleLoginClick(); }}>Login</Button>
                <Button onClick={() => { setIsMenuOpen(false); handleRegisterClick(); }} className="bg-[#e65100] text-white">Start Selling</Button>
                <Button variant="ghost" onClick={() => { setIsMenuOpen(false); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>How it works</Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Add padding to account for fixed nav */}
      <div className="pt-16">
      {/* Hero Section */}
      <section className="py-16 text-white bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-12 h-12" />
              <h1 className="text-4xl font-bold md:text-5xl">Privacy Policy</h1>
            </div>
            <p className="mb-4 text-xl text-orange-50">
              We take your privacy seriously. This policy explains how we collect, use, and protect your personal information.
            </p>
            <div className="flex items-center gap-2 text-orange-100">
              <Calendar className="w-5 h-5" />
              <span>Last Updated: January 7, 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-12 border-b border-gray-200 bg-gray-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="p-6 border-l-4 border-blue-500 rounded-lg bg-blue-50">
            <div className="flex gap-3">
              <Info className="flex-shrink-0 w-6 h-6 mt-1 text-blue-600" />
              <div>
                <h3 className="mb-3 text-lg font-bold text-gray-900">Privacy at a Glance</h3>
                <div className="grid gap-4 text-sm text-gray-700 md:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>We never sell your personal data</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>You control your data and can delete it anytime</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>We use encryption to protect your information</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>We only collect data necessary to provide our services</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="p-8 bg-gray-50 rounded-xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Table of Contents</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { title: "Information We Collect", id: "information-collect" },
                { title: "How We Use Your Information", id: "how-we-use" },
                { title: "Information Sharing", id: "information-sharing" },
                { title: "Data Security", id: "data-security" },
                { title: "Your Rights and Choices", id: "your-rights" },
                { title: "Cookies and Tracking", id: "cookies" },
                { title: "Third-Party Services", id: "third-party" },
                { title: "Children's Privacy", id: "children" },
                { title: "International Data Transfers", id: "international" },
                { title: "Changes to Privacy Policy", id: "changes" },
                { title: "Contact Us", id: "contact" }
              ].map((item, index) => (
                <a 
                  key={index}
                  href={`#${item.id}`}
                  className="flex items-center gap-2 p-3 font-semibold text-orange-600 transition-colors rounded-lg hover:text-orange-700 hover:bg-orange-50"
                >
                  <span className="text-orange-400">{index + 1}.</span>
                  {item.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-4xl px-6 mx-auto space-y-16">
          
          {/* 1. Information We Collect */}
          <div id="information-collect" className="scroll-mt-20">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 p-3 bg-orange-100 rounded-lg">
                <Database className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h2 className="mb-2 text-3xl font-bold text-gray-900">1. Information We Collect</h2>
                <p className="text-gray-600">We collect information you provide directly and automatically when you use Junooni.</p>
              </div>
            </div>

            <div className="ml-16 space-y-6">
              <div className="p-6 bg-white shadow-md rounded-xl">
                <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900">
                  <Users className="w-6 h-6 text-purple-600" />
                  Information You Provide
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-semibold text-gray-900">Account Information:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Name, email address, phone number</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Username and password</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Profile picture and bio</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Social media links</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 font-semibold text-gray-900">Creator Store Information:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Store name and URL</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Product designs and descriptions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Brand logos and images</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Pricing and product information</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 font-semibold text-gray-900">Payment Information:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Bank account details for payouts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Billing address</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>GST/Tax information (if applicable)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Transaction history</span>
                      </li>
                    </ul>
                    <div className="p-4 mt-3 rounded-lg bg-blue-50">
                      <p className="text-sm text-gray-700">
                        <strong>Note:</strong> We use secure third-party payment processors (like Razorpay) 
                        and do not directly store your complete credit card information.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 font-semibold text-gray-900">Customer Order Information:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Shipping addresses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Order history and preferences</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Customer support communications</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 font-semibold text-gray-900">Communications:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Messages you send to us or other users</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Support tickets and feedback</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>Survey responses</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white shadow-md rounded-xl">
                <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                  Information Collected Automatically
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-semibold text-gray-900">Device and Usage Information:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>IP address and device identifiers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Browser type and version</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Operating system</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Pages visited and time spent</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Referring website</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Clicks, scrolls, and interactions</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 font-semibold text-gray-900">Location Information:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>General location based on IP address</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Precise location (only with your permission)</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 font-semibold text-gray-900">Cookies and Tracking Technologies:</h4>
                    <p className="mb-2 text-gray-700">
                      We use cookies, web beacons, and similar technologies to track activity and 
                      improve your experience. See our <a href="#cookies" className="font-semibold text-orange-600 hover:text-orange-700">Cookies section</a> for more details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white shadow-md rounded-xl">
                <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900">
                  <Share2 className="w-6 h-6 text-green-600" />
                  Information from Third Parties
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Social media profile information (when you sign up using social login)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Payment processing information from our payment partners</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Analytics data from third-party services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Publicly available information about your brand or business</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 2. How We Use Your Information */}
          <div id="how-we-use" className="scroll-mt-20">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="mb-2 text-3xl font-bold text-gray-900">2. How We Use Your Information</h2>
                <p className="text-gray-600">We use your information to provide, improve, and personalize our services.</p>
              </div>
            </div>

            <div className="ml-16 space-y-4">
              <div className="p-6 bg-white shadow-md rounded-xl">
                <h3 className="mb-4 text-lg font-bold text-gray-900">We use your information to:</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">Provide Our Services</h4>
                      <p className="text-sm text-gray-600">
                        Create and manage your account, process orders, fulfill products, handle payments, 
                        and provide customer support.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">Communicate With You</h4>
                      <p className="text-sm text-gray-600">
                        Send order confirmations, shipping updates, account notifications, promotional 
                        messages (with your consent), and respond to your inquiries.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">Improve and Personalize</h4>
                      <p className="text-sm text-gray-600">
                        Analyze usage patterns, personalize your experience, develop new features, 
                        and improve our platform performance.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">Marketing and Promotion</h4>
                      <p className="text-sm text-gray-600">
                        Send you marketing communications about new features, products, or offers 
                        (you can opt out anytime).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">Security and Fraud Prevention</h4>
                      <p className="text-sm text-gray-600">
                        Detect and prevent fraud, abuse, security incidents, and other harmful activity.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">Legal Compliance</h4>
                      <p className="text-sm text-gray-600">
                        Comply with legal obligations, enforce our terms, and protect our rights and property.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="mb-1 font-semibold text-gray-900">Analytics and Research</h4>
                      <p className="text-sm text-gray-600">
                        Conduct research, generate analytics, and create aggregated statistics 
                        (without identifying you personally).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Information Sharing */}
           <div id="information-sharing" className="scroll-mt-20">
             <div className="flex items-start gap-4 mb-6">
               <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
                 <Share2 className="w-8 h-8 text-purple-600" />
               </div>
               <div>
                 <h2 className="mb-2 text-3xl font-bold text-gray-900">3. Information Sharing</h2>
                 <p className="text-gray-600">We share your information only in specific circumstances.</p>
               </div>
             </div>

             <div className="ml-16 space-y-4">
               <div className="p-6 mb-6 border-l-4 border-red-500 rounded-lg bg-red-50">
                 <div className="flex gap-3">
                   <AlertCircle className="flex-shrink-0 w-6 h-6 text-red-600" />
                   <div>
                     <h3 className="mb-2 font-bold text-red-900">We Never Sell Your Data</h3>
                     <p className="text-red-800">
                       We do not and will never sell your personal information to third parties for their 
                       marketing purposes. Your trust is more valuable than any revenue from data sales.
                     </p>
                   </div>
                 </div>
               </div>
               <div className="p-6 bg-white shadow-md rounded-xl">
                 <h3 className="mb-4 text-lg font-bold text-gray-900">We may share your information with:</h3>
                 <div className="space-y-4">
                   <div>
                     <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                       <Server className="w-5 h-5 text-purple-600" />
                       Service Providers
                     </h4>
                     <p className="mb-2 text-gray-700">
                       Third-party companies that help us operate our business:
                     </p>
                     <ul className="space-y-1 text-sm text-gray-600 ml-7">
                       <li>• Payment processors (Razorpay, etc.)</li>
                       <li>• Cloud hosting providers (AWS, Google Cloud)</li>
                       <li>• Email service providers</li>
                       <li>• Analytics services (Google Analytics)</li>
                       <li>• Customer support tools</li>
                       <li>• Shipping and fulfillment partners</li>
                     </ul>
                     <p className="mt-2 text-sm text-gray-600">
                       These providers are contractually obligated to protect your data and use it only 
                       for the services they provide to us.
                     </p>
                   </div>

                   <div>
                     <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                       <Users className="w-5 h-5 text-blue-600" />
                       Other Users
                     </h4>
                     <p className="text-gray-700">
                       Your public profile, store information, and products are visible to other users 
                       and the public. Customers who purchase from you will see your store name and 
                       necessary shipping information.
                     </p>
                   </div>
                   <div>
                     <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                       <FileText className="w-5 h-5 text-green-600" />
                       Legal Requirements
                     </h4>
                     <p className="text-gray-700">
                       We may disclose your information if required by law, court order, or government 
                       request, or to protect our rights, safety, or property.
                     </p>
                   </div>
                   <div>
                     <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                      <Briefcase className="w-5 h-5 text-orange-600" />
                       Business Transfers
                     </h4>
                     <p className="text-gray-700">
                       If Junooni is involved in a merger, acquisition, or sale of assets, your information 
                       may be transferred. We'll notify you before your information becomes subject to a 
                       different privacy policy.
                     </p>
                   </div>

                   <div>
                     <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                       <CheckCircle className="w-5 h-5 text-pink-600" />
                       With Your Consent
                     </h4>
                     <p className="text-gray-700">
                       We may share your information with third parties when you give us explicit consent 
                       to do so.
                     </p>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           {/* 4. Data Security */}
           <div id="data-security" className="scroll-mt-20">
             <div className="flex items-start gap-4 mb-6">
               <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                 <ShieldCheck className="w-8 h-8 text-green-600" />
               </div>
               <div>
                 <h2 className="mb-2 text-3xl font-bold text-gray-900">4. Data Security</h2>
                 <p className="text-gray-600">We implement industry-standard security measures to protect your information.</p>
               </div>
             </div>
             <div className="ml-16 space-y-4">
               <div className="p-6 bg-white shadow-md rounded-xl">
                 <h3 className="mb-4 text-lg font-bold text-gray-900">Security Measures:</h3>
                 <div className="grid gap-4 md:grid-cols-2">
                   <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50">
                     <Lock className="flex-shrink-0 w-6 h-6 text-green-600" />
                     <div>
                       <h4 className="mb-1 font-semibold text-gray-900">Encryption</h4>
                       <p className="text-sm text-gray-600">
                         We use SSL/TLS encryption for data in transit and encryption at rest for stored data.
                       </p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50">
                     <Key className="flex-shrink-0 w-6 h-6 text-green-600" />
                     <div>
                       <h4 className="mb-1 font-semibold text-gray-900">Access Controls</h4>
                       <p className="text-sm text-gray-600">
                         Limited access to personal data, available only to authorized personnel.
                       </p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50">
                     <Server className="flex-shrink-0 w-6 h-6 text-green-600" />
                     <div>
                       <h4 className="mb-1 font-semibold text-gray-900">Secure Infrastructure</h4>
                       <p className="text-sm text-gray-600">
                         Industry-leading cloud providers with robust security certifications.
                       </p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50">
                     <Eye className="flex-shrink-0 w-6 h-6 text-green-600" />
                     <div>
                       <h4 className="mb-1 font-semibold text-gray-900">Regular Audits</h4>
                       <p className="text-sm text-gray-600">
                         Periodic security assessments and vulnerability testing.
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
               <div className="p-6 border-l-4 border-yellow-500 rounded-lg bg-yellow-50">
                 <div className="flex gap-3">
                   <AlertCircle className="flex-shrink-0 w-6 h-6 text-yellow-600" />
                   <div>
                     <h3 className="mb-2 font-bold text-yellow-900">Important Note</h3>
                     <p className="text-yellow-800">
                       While we implement strong security measures, no method of transmission over the 
                       internet or electronic storage is 100% secure. We cannot guarantee absolute security, 
                       but we continually work to protect your information.
                     </p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
           {/* 5. Your Rights and Choices */}
           <div id="your-rights" className="scroll-mt-20">
             <div className="flex items-start gap-4 mb-6">
               <div className="flex-shrink-0 p-3 bg-pink-100 rounded-lg">
                 <Settings className="w-8 h-8 text-pink-600" />
               </div>
               <div>
                 <h2 className="mb-2 text-3xl font-bold text-gray-900">5. Your Rights and Choices</h2>
                 <p className="text-gray-600">You have control over your personal information.</p>
               </div>
             </div>
             <div className="ml-16 space-y-4">
               <div className="p-6 bg-white shadow-md rounded-xl">
                 <h3 className="mb-4 text-lg font-bold text-gray-900">Your Rights Include:</h3>
                 <div className="space-y-4">
                   <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50">
                     <Eye className="flex-shrink-0 w-6 h-6 text-blue-600" />
                     <div>
                       <h4 className="mb-1 font-semibold text-gray-900">Access Your Data</h4>
                       <p className="mb-2 text-sm text-gray-600">
                         Request a copy of the personal information we hold about you.
                       </p>
                       <p className="text-xs text-gray-500">
                         Go to Settings → Privacy → Download My Data
                       </p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-50">
                     <Settings className="flex-shrink-0 w-6 h-6 text-purple-600" />
                     <div>
                       <h4 className="mb-1 font-semibold text-gray-900">Correct Your Data</h4>
                       <p className="mb-2 text-sm text-gray-600">
                         Update or correct inaccurate personal information.
                       </p>
                       <p className="text-xs text-gray-500">
                         Go to Settings → Account → Edit Profile
                       </p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50">
                     <Trash2 className="flex-shrink-0 w-6 h-6 text-red-600" />
                     <div>
                       <h4 className="mb-1 font-semibold text-gray-900">Delete Your Data</h4>
                       <p className="mb-2 text-sm text-gray-600">
                         Request deletion of your personal information (subject to legal obligations).
                       </p>
                       <p className="text-xs text-gray-500">
                         Go to Settings → Privacy → Delete Account
                       </p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50">
                     <Download className="flex-shrink-0 w-6 h-6 text-green-600" />
                     <div>
                       <h4 className="mb-1 font-semibold text-gray-900">Data Portability</h4>
                       <p className="mb-2 text-sm text-gray-600">
                         Receive your data in a structured, machine-readable format.
                       </p>
                       <p className="text-xs text-gray-500">
                         Contact support@junooni.com
                       </p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50">
                     <UserX className="flex-shrink-0 w-6 h-6 text-orange-600" />
                     <div>
                       <h4 className="mb-1 font-semibold text-gray-900">Opt-Out of Marketing</h4>
                       <p className="mb-2 text-sm text-gray-600">
                         Unsubscribe from promotional emails anytime.
                       </p>
                       <p className="text-xs text-gray-500">
                         Click "Unsubscribe" in any marketing email or go to Settings → Notifications
                       </p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50">
                     <Shield className="flex-shrink-0 w-6 h-6 text-yellow-600" />
                     <div>
                       <h4 className="mb-1 font-semibold text-gray-900">Object to Processing</h4>
                       <p className="mb-2 text-sm text-gray-600">
                         Object to certain uses of your personal information.
                       </p>
                       <p className="text-xs text-gray-500">
                         Contact privacy@junooni.com
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
               <div className="p-6 border-l-4 border-blue-500 rounded-lg bg-blue-50">
                 <h3 className="mb-2 font-bold text-gray-900">How to Exercise Your Rights</h3>
                 <p className="mb-3 text-gray-700">
                   To exercise any of these rights, you can:
                 </p>
                 <ul className="space-y-2 text-gray-700">
                   <li className="flex items-start gap-2">
                     <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                     <span>Use the self-service options in your account settings</span>
                   </li>
                   <li className="flex items-start gap-2">
                     <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                     <span>Email us at privacy@junooni.com</span>
                   </li>
                   <li className="flex items-start gap-2">
                     <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                     <span>Contact our support team via live chat</span>
                   </li>
                 </ul>
                 <p className="mt-3 text-sm text-gray-600">
                   We'll respond to your request within 30 days. We may need to verify your identity 
                   before processing certain requests.
                 </p>
               </div>
             </div>
           </div>
           {/* 6. Cookies and Tracking */}
           <div id="cookies" className="scroll-mt-20">
             <div className="flex items-start gap-4 mb-6">
               <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-lg">
                 <Cookie className="w-8 h-8 text-yellow-600" />
               </div>
               <div>
                 <h2 className="mb-2 text-3xl font-bold text-gray-900">6. Cookies and Tracking Technologies</h2>
                 <p className="text-gray-600">We use cookies and similar technologies to improve your experience.</p>
               </div>
             </div>
             <div className="ml-16 space-y-4">
               <div className="p-6 bg-white shadow-md rounded-xl">
                 <h3 className="mb-4 text-lg font-bold text-gray-900">Types of Cookies We Use:</h3>
                 <div className="space-y-4">
                   <div className="py-2 pl-4 border-l-4 border-green-500">
                     <h4 className="mb-1 font-semibold text-gray-900">Essential Cookies (Required)</h4>
                     <p className="text-sm text-gray-600">
                       Necessary for the website to function. Enable core features like security, 
                       authentication, and preferences.
                     </p>
                   </div>

                   <div className="py-2 pl-4 border-l-4 border-blue-500">
                     <h4 className="mb-1 font-semibold text-gray-900">Analytics Cookies (Optional)</h4>
                     <p className="text-sm text-gray-600">
                       Help us understand how visitors use our site. We use Google Analytics to track 
                       page views, sessions, and user behavior.
                     </p>
                   </div>
                   <div className="py-2 pl-4 border-l-4 border-purple-500">
                     <h4 className="mb-1 font-semibold text-gray-900">Functionality Cookies (Optional)</h4>
                     <p className="text-sm text-gray-600">
                       Remember your preferences and settings for a personalized experience.
                     </p>
                   </div>
                   <div className="py-2 pl-4 border-l-4 border-orange-500">
                     <h4 className="mb-1 font-semibold text-gray-900">Marketing Cookies (Optional)</h4>
                     <p className="text-sm text-gray-600">
                       Track visits across websites to show relevant ads. Used by advertising partners 
                       like Google Ads and Facebook Pixel.
                     </p>
                   </div>
                 </div>
               </div>
               <div className="p-6 bg-white shadow-md rounded-xl">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Managing Cookies:</h3>
                 <p className="mb-4 text-gray-700">
                   You can control cookies through:
                 </p>
                 <ul className="space-y-2 text-gray-700">
                   <li className="flex items-start gap-2">
                     <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                     <span>Our cookie consent banner (appears on first visit)</span>
                   </li>
                   <li className="flex items-start gap-2">
                     <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                     <span>Your browser settings (most browsers allow you to refuse cookies)</span>
                   </li>
                   <li className="flex items-start gap-2">
                     <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                     <span>Settings → Privacy → Cookie Preferences</span>
                   </li>
                 </ul>
                 <p className="mt-4 text-sm text-gray-600">
                   Note: Blocking certain cookies may affect site functionality.
                 </p>
               </div>
             </div>
           </div>
           {/* 7. Third-Party Services */}
           <div id="third-party" className="scroll-mt-20">
             <div className="flex items-start gap-4 mb-6">
               <div className="flex-shrink-0 p-3 bg-indigo-100 rounded-lg">
                 <Globe className="w-8 h-8 text-indigo-600" />
               </div>
               <div>
                 <h2 className="mb-2 text-3xl font-bold text-gray-900">7. Third-Party Services</h2>
                 <p className="text-gray-600">We integrate with third-party services that have their own privacy policies.</p>
               </div>
             </div>
             <div className="ml-16 space-y-4">
               <div className="p-6 bg-white shadow-md rounded-xl">
                 <h3 className="mb-4 text-lg font-bold text-gray-900">Third-Party Services We Use:</h3>
                 <div className="space-y-3">
                   <div className="p-4 rounded-lg bg-gray-50">
                     <h4 className="mb-2 font-semibold text-gray-900">Payment Processing</h4>
                     <p className="mb-2 text-sm text-gray-600">
                       Razorpay, Stripe - for secure payment processing
                     </p>
                     <a href="https://razorpay.com/privacy" target="_blank" rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700">
                       View Razorpay Privacy Policy
                       <ExternalLink className="w-3 h-3" />
                     </a>
                   </div>
                   <div className="p-4 rounded-lg bg-gray-50">
                     <h4 className="mb-2 font-semibold text-gray-900">Analytics</h4>
                     <p className="mb-2 text-sm text-gray-600">
                       Google Analytics - for website analytics
                     </p>
                     <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700">
                       View Google Privacy Policy
                       <ExternalLink className="w-3 h-3" />
                     </a>
                   </div>
                   <div className="p-4 rounded-lg bg-gray-50">
                     <h4 className="mb-2 font-semibold text-gray-900">Cloud Hosting</h4>
                     <p className="text-sm text-gray-600">
                       AWS, Google Cloud Platform - for hosting and infrastructure
                     </p>
                   </div>
                   <div className="p-4 rounded-lg bg-gray-50">
                     <h4 className="mb-2 font-semibold text-gray-900">Email Services</h4>
                     <p className="text-sm text-gray-600">
                       SendGrid, Amazon SES - for transactional and marketing emails
                     </p>
                   </div>
                   <div className="p-4 rounded-lg bg-gray-50">
                     <h4 className="mb-2 font-semibold text-gray-900">Customer Support</h4>
                     <p className="text-sm text-gray-600">
                       Intercom, Zendesk - for customer support and live chat
                     </p>
                   </div>
                 </div>
               </div>
               <div className="p-6 border-l-4 border-yellow-500 rounded-lg bg-yellow-50">
                 <p className="text-gray-700">
                   <strong>Important:</strong> These third-party services have their own privacy policies. 
                   We recommend reviewing their policies to understand how they handle your data.
                 </p>
               </div>
             </div>
           </div>
           {/* 8. Children's Privacy */}
           <div id="children" className="scroll-mt-20">
             <div className="flex items-start gap-4 mb-6">
               <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
                 <Users className="w-8 h-8 text-red-600" />
               </div>
               <div>
                 <h2 className="mb-2 text-3xl font-bold text-gray-900">8. Children's Privacy</h2>
                 <p className="text-gray-600">Junooni is not intended for users under 18 years of age.</p>
               </div>
             </div>

             <div className="ml-16">
               <div className="p-6 bg-white shadow-md rounded-xl">
                 <p className="mb-4 text-gray-700">
                   Our services are not directed to individuals under 18. We do not knowingly collect 
                   personal information from children under 18.
                 </p>
                 <p className="mb-4 text-gray-700">
                   If you are a parent or guardian and believe your child has provided us with personal 
                   information, please contact us at privacy@junooni.com.
                 </p>
                 <p className="text-gray-700">
                   If we learn that we have collected personal information from a child under 18, we will 
                   delete that information as quickly as possible.
                 </p>
               </div>
             </div>
           </div>

           {/* 9. International Data Transfers */}
           <div id="international" className="scroll-mt-20">
             <div className="flex items-start gap-4 mb-6">
               <div className="flex-shrink-0 p-3 bg-teal-100 rounded-lg">
                 <Globe className="w-8 h-8 text-teal-600" />
               </div>
               <div>
                 <h2 className="mb-2 text-3xl font-bold text-gray-900">9. International Data Transfers</h2>
                 <p className="text-gray-600">Your information may be transferred and stored in different countries.</p>
               </div>
             </div>

             <div className="ml-16">
               <div className="p-6 bg-white shadow-md rounded-xl">
                 <p className="mb-4 text-gray-700">
                   Junooni is based in India, but we use service providers around the world. Your information 
                   may be transferred to and processed in countries other than your own.
                 </p>
                 <p className="mb-4 text-gray-700">
                   These countries may have different data protection laws than your country. However, we 
                   take steps to ensure your data receives adequate protection wherever it is processed.
                 </p>
                 <p className="text-gray-700">
                   By using Junooni, you consent to the transfer of your information to countries outside 
                   of your residence, including India and the United States.
                 </p>
               </div>
             </div>
           </div>

           {/* 10. Changes to Privacy Policy */}
           <div id="changes" className="scroll-mt-20">
             <div className="flex items-start gap-4 mb-6">
               <div className="flex-shrink-0 p-3 rounded-lg bg-cyan-100">
                 <Bell className="w-8 h-8 text-cyan-600" />
               </div>
               <div>
                 <h2 className="mb-2 text-3xl font-bold text-gray-900">10. Changes to This Privacy Policy</h2>
                 <p className="text-gray-600">We may update this policy from time to time.</p>
               </div>
             </div>

             <div className="ml-16">
               <div className="p-6 bg-white shadow-md rounded-xl">
                 <p className="mb-4 text-gray-700">
                   We may update this Privacy Policy periodically to reflect changes in our practices, 
                   technology, legal requirements, or other factors.
                 </p>
                 <p className="mb-4 text-gray-700">
                   When we make material changes, we will:
                 </p>
                 <ul className="mb-4 space-y-2 text-gray-700">
                   <li className="flex items-start gap-2">
                     <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                     <span>Update the "Last Updated" date at the top of this policy</span>
                   </li>
                   <li className="flex items-start gap-2">
                     <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                     <span>Notify you via email or through a prominent notice on our platform</span>
                   </li>
                   <li className="flex items-start gap-2">
                     <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                     <span>Provide at least 30 days notice before changes take effect</span>
                   </li>
                 </ul>
                 <p className="text-gray-700">
                   Your continued use of Junooni after changes take effect constitutes acceptance of the 
                   updated policy. If you don't agree with changes, you may close your account.
                 </p>
               </div>
             </div>
           </div>

           {/* 11. Contact Us */}
           <div id="contact" className="scroll-mt-20">
             <div className="flex items-start gap-4 mb-6">
               <div className="flex-shrink-0 p-3 bg-orange-100 rounded-lg">
                 <Mail className="w-8 h-8 text-orange-600" />
               </div>
               <div>
                 <h2 className="mb-2 text-3xl font-bold text-gray-900">11. Contact Us</h2>
                 <p className="text-gray-600">Questions or concerns about privacy? We're here to help.</p>
               </div>
             </div>

             <div className="ml-16">
               <div className="p-6 bg-white shadow-md rounded-xl">
                 <p className="mb-6 text-gray-700">
                   If you have questions, concerns, or requests regarding this Privacy Policy or our 
                   data practices, please contact us:
                 </p>

                 <div className="grid gap-6 md:grid-cols-2">
                   <div className="flex items-start gap-3">
                     <Mail className="flex-shrink-0 w-6 h-6 text-orange-600" />
                     <div>
                       <h4 className="mb-1 font-semibold text-gray-900">Email</h4>
                       <a href="mailto:privacy@junooni.com" className="text-orange-600 hover:text-orange-700">
                         privacy@junooni.com
                       </a>
                       <p className="mt-1 text-sm text-gray-600">For privacy-related inquiries</p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3">
                     <Mail className="flex-shrink-0 w-6 h-6 text-blue-600" />
                     <div>
                       <h4 className="mb-1 font-semibold text-gray-900">Support</h4>
                       <a href="mailto:support@junooni.com" className="text-blue-600 hover:text-blue-700">
                         support@junooni.com
                       </a>
                       <p className="mt-1 text-sm text-gray-600">For general support</p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3">
                     <MessageCircle className="flex-shrink-0 w-6 h-6 text-green-600" />
                     <div>
                       <h4 className="mb-1 font-semibold text-gray-900">Live Chat</h4>
                       <a href="/support" className="text-green-600 hover:text-green-700">
                         Visit Support Center
                       </a>
                       <p className="mt-1 text-sm text-gray-600">Available 24/7</p>
                     </div>
                   </div>

                   <div className="flex items-start gap-3">
                     <MapPin className="flex-shrink-0 w-6 h-6 text-purple-600" />
                     <div>
                       <h4 className="mb-1 font-semibold text-gray-900">Mailing Address</h4>
                       <p className="text-gray-700">
                         Junooni Technologies Pvt Ltd<br />
                         Bangalore, Karnataka<br />
                         India
                       </p>
                     </div>
                   </div>
                 </div>

                 <div className="p-4 mt-6 rounded-lg bg-orange-50">
                   <p className="text-sm text-gray-700">
                     <strong>Response Time:</strong> We aim to respond to all privacy inquiries within 
                     48 hours and resolve issues within 30 days.
                   </p>
                 </div>
               </div>
             </div>
           </div>


          {/* Continue with remaining sections - 3 through 11 exactly as in original, keeping all IDs and content... */}
          {/* For brevity, I'll add the closing sections */}

          {/* Footer CTA */}
          <div className="py-12">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">Have Questions?</h2>
              <p className="mb-8 text-xl text-gray-600">
                Our privacy team is here to help you understand how we protect your information
              </p>
              <a 
                href="mailto:privacy@junooni.com" 
                className="inline-flex items-center gap-3 px-8 py-4 font-bold text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700"
              >
                <Mail className="w-6 h-6" />
                Contact Privacy Team
              </a>
            </div>
          </div>

        </div>
      </section>
      </div>

      {/* FOOTER - Mobile Optimized */}
      <footer className="py-8 text-white bg-gray-900 sm:py-10">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <img src={junoonilogo} alt="Junooni logo" className="h-6 sm:h-8" />
                <span className="text-xs text-gray-300 sm:text-sm">Creator Studio</span>
              </div>
              <p className="mt-3 text-xs text-gray-400 sm:mt-4 sm:text-sm">Empowering creators to design, publish and sell high-quality merchandise without inventory hassle.</p>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold sm:mb-3 sm:text-base">Platform</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="https://cms.junooni.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Product Catalog</a></li>
                <li><a href="/pages/fulfillment-page" className="hover:text-white">Fulfillments</a></li>
                <li><a href="/pages/creator-store" className="hover:text-white">Creator Store</a></li>
                <li><a href="https://junooni.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Marketplace</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold sm:mb-3 sm:text-base">Guide</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="/pages/getting-started" className="hover:text-white">Getting started</a></li>
                <li><a href="/pages/creating-products" className="hover:text-white">Creating products</a></li>
                <li><a href="/pages/make_your_brand" className="hover:text-white">Make your brand</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold sm:mb-3 sm:text-base">Social</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="https://www.instagram.com/bejunooni?igsh=MXV5MnNpeWNianNqeg==" target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a></li>
                <li><a href="https://www.facebook.com/p/Junooni-61577994639087/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook</a></li>
                <li><a href="https://youtube.com/@bejunooni?si=p96lWYtfDUMhsII3" target="_blank" rel="noopener noreferrer" className="hover:text-white">Youtube</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold sm:mb-3 sm:text-base">Company</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="/pages/about-us" className="hover:text-white">About us</a></li>
                <li><a href="/pages/careers" className="hover:text-white">Career</a></li>
                <li><a href="/pages/privacy" className="hover:text-white">Privacy</a></li>
                <li><a href="/pages/for-creators" className="hover:text-white">For Creators</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-4 mt-6 text-xs text-center text-gray-400 border-t border-gray-800 sm:pt-6 sm:mt-8 sm:text-sm">
            © {new Date().getFullYear()} Junooni Creator Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}