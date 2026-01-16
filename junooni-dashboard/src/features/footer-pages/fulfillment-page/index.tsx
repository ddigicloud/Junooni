import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Truck, Package, Clock, DollarSign, CheckCircle, AlertCircle, Menu, X, ArrowRight } from 'lucide-react';
import junoonilogo from '/src/assets/junooni_logo_brand_color.png';

export default function FulfillmentsPage() {
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
                <Button variant="ghost" onClick={() => { setIsMenuOpen(false); handleLoginClick(); }}>Login</Button>
                <Button onClick={() => { setIsMenuOpen(false); handleRegisterClick(); }} className="bg-[#e65100] text-white">Start Selling</Button>
                <Button variant="ghost" onClick={() => { setIsMenuOpen(false); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>How it works</Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 pt-20 text-white bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-6xl px-6 mx-auto">
          <h1 className="mt-8 mb-6 text-5xl font-bold">Choose Your Fulfillment Model</h1>
          <p className="max-w-3xl text-xl text-orange-50">
            Whether you want full control or hands-free selling, we've got you covered. 
            Pick the fulfillment option that works best for your business.
          </p>
        </div>
      </section>

      {/* Comparison Overview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Creator Fulfillment Card */}
            <div className="p-8 transition-all bg-white border-2 border-orange-200 shadow-lg rounded-2xl hover:border-orange-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Package className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Creator Fulfillment</h2>
              </div>
              <p className="mb-6 text-lg text-gray-600">
                You handle production and shipping. Maximum control and profit margins.
              </p>
              <div className="p-4 mb-6 rounded-lg bg-orange-50">
                <p className="text-2xl font-bold text-orange-600">Keep more profits</p>
                <p className="text-sm text-gray-600">Set your own prices and margins</p>
              </div>
              <a 
                href="#creator-details" 
                className="block w-full py-3 font-semibold text-center text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700"
              >
                Learn More
              </a>
            </div>

            {/* Junooni Fulfillment Card */}
            <div className="p-8 transition-all bg-white border-2 border-blue-200 shadow-lg rounded-2xl hover:border-blue-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Junooni Fulfillment</h2>
              </div>
              <p className="mb-6 text-lg text-gray-600">
                We handle everything. Focus on creating while we fulfill orders.
              </p>
              <div className="p-4 mb-6 rounded-lg bg-blue-50">
                <p className="text-2xl font-bold text-blue-600">100% hands-free</p>
                <p className="text-sm text-gray-600">No inventory, no shipping hassles</p>
              </div>
              <a 
                href="#junooni-details" 
                className="block w-full py-3 font-semibold text-center text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Fulfillment Details */}
      <section id="creator-details" className="py-20 scroll-mt-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 bg-orange-100 rounded-full">
              <Package className="w-6 h-6 text-orange-600" />
              <span className="font-semibold text-orange-900">Creator Fulfillment</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Maximum Control, Maximum Profit</h2>
            <p className="text-xl text-gray-600">
              Take charge of your production and shipping process. Perfect for creators who want 
              full control over quality and customer experience.
            </p>
          </div>

          {/* How It Works */}
          <div className="mb-12">
            <h3 className="mb-6 text-2xl font-bold text-gray-900">How It Works</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-6 bg-white shadow-md rounded-xl">
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-orange-100 rounded-full">
                  <span className="text-2xl font-bold text-orange-600">1</span>
                </div>
                <h4 className="mb-2 text-lg font-semibold">Receive Orders</h4>
                <p className="text-gray-600">Get instant notifications when customers buy your products</p>
              </div>
              <div className="p-6 bg-white shadow-md rounded-xl">
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-orange-100 rounded-full">
                  <span className="text-2xl font-bold text-orange-600">2</span>
                </div>
                <h4 className="mb-2 text-lg font-semibold">Produce & Package</h4>
                <p className="text-gray-600">Create your merchandise with your preferred suppliers</p>
              </div>
              <div className="p-6 bg-white shadow-md rounded-xl">
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-orange-100 rounded-full">
                  <span className="text-2xl font-bold text-orange-600">3</span>
                </div>
                <h4 className="mb-2 text-lg font-semibold">Ship Direct</h4>
                <p className="text-gray-600">Send products directly to your customers</p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-12">
            <h3 className="mb-6 text-2xl font-bold text-gray-900">Benefits</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { icon: DollarSign, text: "Higher profit margins - keep more of what you earn" },
                { icon: CheckCircle, text: "Complete quality control over your products" },
                { icon: Package, text: "Use your own suppliers and production partners" },
                { icon: Clock, text: "Flexible production timelines that work for you" },
                { icon: Truck, text: "Choose your preferred shipping methods" },
                { icon: CheckCircle, text: "Build direct relationships with customers" }
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-orange-50">
                  <benefit.icon className="flex-shrink-0 w-6 h-6 mt-1 text-orange-600" />
                  <p className="text-gray-700">{benefit.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Best For */}
          <div className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
            <h3 className="mb-4 text-2xl font-bold text-gray-900">Best For:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-orange-600" />
                <span>Creators who already have production partnerships or capabilities</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-orange-600" />
                <span>Those wanting maximum control over product quality and branding</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-orange-600" />
                <span>Creators with unique or specialized products requiring custom handling</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-orange-600" />
                <span>Businesses ready to manage order fulfillment operations</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Junooni Fulfillment Details */}
      <section id="junooni-details" className="py-20 bg-gray-50 scroll-mt-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 bg-blue-100 rounded-full">
              <Truck className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-blue-900">Junooni Fulfillment</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Hands-Free, Hassle-Free Selling</h2>
            <p className="text-xl text-gray-600">
              Focus on what you do best - creating content. We handle production, quality control, 
              packaging, and shipping for you.
            </p>
          </div>

          {/* How It Works */}
          <div className="mb-12">
            <h3 className="mb-6 text-2xl font-bold text-gray-900">How It Works</h3>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="p-6 bg-white shadow-md rounded-xl">
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-full">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="mb-2 text-lg font-semibold">Design</h4>
                <p className="text-gray-600">Create your designs using our studio tools</p>
              </div>
              <div className="p-6 bg-white shadow-md rounded-xl">
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-full">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h4 className="mb-2 text-lg font-semibold">List</h4>
                <p className="text-gray-600">Publish products to your store or marketplace</p>
              </div>
              <div className="p-6 bg-white shadow-md rounded-xl">
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-full">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h4 className="mb-2 text-lg font-semibold">Sell</h4>
                <p className="text-gray-600">We produce and ship automatically when you make a sale</p>
              </div>
              <div className="p-6 bg-white shadow-md rounded-xl">
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-full">
                  <span className="text-2xl font-bold text-blue-600">4</span>
                </div>
                <h4 className="mb-2 text-lg font-semibold">Earn</h4>
                <p className="text-gray-600">Get paid your profit margin on every sale</p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-12">
            <h3 className="mb-6 text-2xl font-bold text-gray-900">Benefits</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { icon: Clock, text: "Zero upfront inventory costs or risks" },
                { icon: Truck, text: "No warehouse or storage needed" },
                { icon: CheckCircle, text: "Professional quality control and packaging" },
                { icon: Package, text: "Fast, reliable shipping to customers nationwide" },
                { icon: DollarSign, text: "Automated payout processing" },
                { icon: CheckCircle, text: "Focus 100% on content creation and marketing" }
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-blue-50">
                  <benefit.icon className="flex-shrink-0 w-6 h-6 mt-1 text-blue-600" />
                  <p className="text-gray-700">{benefit.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Best For */}
          <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
            <h3 className="mb-4 text-2xl font-bold text-gray-900">Best For:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-blue-600" />
                <span>Creators who want to start selling without any upfront investment</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-blue-600" />
                <span>Those who prefer to focus entirely on content and marketing</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-blue-600" />
                <span>Creators testing new product ideas without financial risk</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-blue-600" />
                <span>Anyone wanting a truly passive merchandise income stream</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Side-by-Side Comparison */}
      <section className="py-20">
        <div className="max-w-6xl px-6 mx-auto">
          <h2 className="mb-12 text-4xl font-bold text-center text-gray-900">Quick Comparison</h2>
          <div className="overflow-hidden overflow-x-auto bg-white shadow-xl rounded-2xl">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-left text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-sm font-semibold text-center text-orange-600">Creator Fulfillment</th>
                  <th className="px-6 py-4 text-sm font-semibold text-center text-blue-600">Junooni Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: "Upfront costs", creator: "Your inventory investment", junooni: "Zero - print on demand" },
                  { feature: "Production", creator: "You handle", junooni: "We handle" },
                  { feature: "Quality control", creator: "You control", junooni: "We ensure quality" },
                  { feature: "Packaging", creator: "You design & pack", junooni: "Professional packaging" },
                  { feature: "Shipping", creator: "You arrange", junooni: "We ship automatically" },
                  { feature: "Profit margins", creator: "Higher - you set prices", junooni: "Fixed - competitive rates" },
                  { feature: "Risk", creator: "Inventory risk", junooni: "Zero risk" },
                  { feature: "Time investment", creator: "Moderate to high", junooni: "Minimal - just design" }
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-600">{row.creator}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-600">{row.junooni}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl px-6 mx-auto">
          <h2 className="mb-12 text-4xl font-bold text-center text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <details className="p-6 bg-white rounded-lg shadow-md group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                Can I switch between fulfillment methods?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Yes! You can choose different fulfillment methods for different products. Some creators use 
                Creator Fulfillment for premium items they want to handle personally, and Junooni Fulfillment 
                for standard merchandise.
              </p>
            </details>

            <details className="p-6 bg-white rounded-lg shadow-md group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                How do payments work with each fulfillment type?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                With Creator Fulfillment, you receive the full order amount and manage your own costs. With 
                Junooni Fulfillment, we deduct production and shipping costs, then pay you your profit margin 
                through our automated payout system.
              </p>
            </details>

            <details className="p-6 bg-white rounded-lg shadow-md group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                What products are available for Junooni Fulfillment?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                We offer a wide range of products including t-shirts, hoodies, mugs, phone cases, posters, 
                stickers, and more. Our product catalog is constantly expanding based on creator demand.
              </p>
            </details>

            <details className="p-6 bg-white rounded-lg shadow-md group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                How long does shipping take?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                For Junooni Fulfillment, typical production takes 2-3 business days, with shipping adding 
                3-7 days depending on location. Creator Fulfillment timelines depend on your own production 
                and shipping arrangements.
              </p>
            </details>

            <details className="p-6 bg-white rounded-lg shadow-md group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                Do I need a business registration to use Creator Fulfillment?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                While not always required, we recommend having proper business documentation for Creator 
                Fulfillment, especially for tax purposes and as your volume grows. Junooni handles all 
                compliance for Junooni Fulfillment orders.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-4xl px-6 mx-auto text-center">
          <h2 className="mb-6 text-4xl font-bold text-white">Ready to Start Selling?</h2>
          <p className="mb-8 text-xl text-orange-50">
            Join 50,000+ creators who trust Junooni to power their merchandise business
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button 
              onClick={handleRegisterClick}
              className="px-8 py-4 text-lg font-bold text-orange-600 bg-white rounded-lg hover:bg-orange-50"
            >
              Start Creating Free
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate({ to: '/products' })}
              className="px-8 py-4 text-lg font-bold text-white bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-orange-600"
            >
              Explore Products
            </Button>
          </div>
          <p className="mt-6 text-sm text-orange-100">No credit card required • Cancel anytime</p>
        </div>
      </section>

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