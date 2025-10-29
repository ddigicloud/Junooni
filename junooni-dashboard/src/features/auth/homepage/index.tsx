import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowRight, Play, Star, TrendingUp, Users, Package, Palette, Sparkles,
  Menu, X, Heart, Edit3, Layers, Share2, BarChart3, Shield, ChevronRight, Eye , Globe
} from 'lucide-react';

// Images: place files into /src/assets/ as described above
import heroVisual from '/src/assets/hero-visual.gif';
import step1Img from '/src/assets/step-1.png';
import step2Img from '/src/assets/step-2.png';
import step3Img from '/src/assets/step-3.png';
import junoonilogo from '/src/assets/junooni_logo_brand_color.png';
import gallery1 from '/src/assets/gallery-1.png';
import gallery2 from '/src/assets/gallery-2.png';
import gallery3 from '/src/assets/gallery-3.png';
import gallery4 from '/src/assets/gallery-4.png';

const JunooniLandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const [currentMerch, setCurrentMerch] = useState(0);
  const [isHoveredRegister, setIsHoveredRegister] = useState(false);
  const [isHoveredLogin, setIsHoveredLogin] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate({ to: '/sign-up' });
  };

  const handleLoginClick = () => {
    navigate({ to: '/sign-in' });
  };

  const stats = [
    { number: "50K+", label: "Active Creators", icon: Users },
    { number: "2M+", label: "Designs Created", icon: Palette },
    { number: "500K+", label: "Merch Sold", icon: Package },
    { number: "4.9★", label: "Creator Rating", icon: Star }
  ];

  const merchTypes = [
    { name: "T-Shirts", icon: "👕", color: "bg-orange-100", shadow: "shadow-orange-200" },
    { name: "Mugs", icon: "☕", color: "bg-orange-200", shadow: "shadow-orange-200" },
    { name: "Hoodies", icon: "🧥", color: "bg-orange-50", shadow: "shadow-orange-200" },
    { name: "Stickers", icon: "🏷️", color: "bg-amber-100", shadow: "shadow-amber-200" },
    { name: "Posters", icon: "🖼️", color: "bg-orange-100", shadow: "shadow-orange-200" },
    { name: "Phone Cases", icon: "📱", color: "bg-amber-50", shadow: "shadow-amber-200" }
  ];

  const steps = [
    {
      step: "01",
      title: "Sign Up",
      description: "Create your creator account and join our marketplace community",
      image: step1Img
    },
    {
      step: "02",
      title: "Choose & Design Your Merch",
      description: "Select products and upload your graphics to create amazing merchandise",
      image: step2Img
    },
    {
      step: "03",
      title: "Start Earning",
      description: "Publish to Junooni marketplace and start earning from your designs",
      image: step3Img
    }
  ];

  const faqs = [
    {
      q: 'How quickly can I publish my first product?',
      a: 'From account creation to publishing a product can take as little as 10 minutes — upload your art, place it on a template, and publish. We handle printing and shipping automatically.'
    },
    {
      q: 'Do I need to hold inventory?',
      a: 'No — we operate on a print-on-demand model. Items are produced after a customer places an order, so you do not need to manage stock or warehousing.'
    },
    {
      q: 'What file formats and sizes do you accept?',
      a: 'We accept high-resolution PNG, JPEG, and vector SVG for print. For apparel, 300 DPI at final print size is recommended to ensure crisp results.'
    },
    {
      q: 'How are royalties and payouts handled?',
      a: 'You set your margin and payouts are processed on your chosen schedule. We provide a payout dashboard showing sales, commissions, and fees before transfer.'
    },
    {
      q: 'Can I sell on my own storefront as well as the marketplace?',
      a: 'Yes — each creator gets a storefront to list their products, and items can optionally be discoverable on the marketplace for additional reach.'
    },
    {
      q: 'What is your return & quality policy?',
      a: 'We quality-check every order. If an item arrives damaged or has a print defect, we replace it or refund the customer per our returns policy — creators are not burdened with returns handling.'
    },
    {
      q: 'Is there any onboarding or design help available?',
      a: 'We provide templates, design guides, and quick tutorials inside the Creator Studio to help you prepare print-ready artwork and mockups.'
    },
    {
      q: 'How can I market my products?',
      a: 'Use the built-in promotion tools, shareable storefront links, and analytics to understand what is selling. We also run seasonal campaigns creators can opt into for extra visibility.'
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMerch((prev) => (prev + 1) % merchTypes.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen text-gray-900 bg-white">
      {/* NAV */}
      <nav className="fixed z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-3">
                <img src={junoonilogo} alt="Junooni" className="h-8" />
                <span className="hidden text-sm font-semibold text-gray-700 sm:block">Creator Studio</span>
              </button>
            </div>

            <div className="items-center hidden gap-3 md:flex">
              <Button variant="ghost" onClick={() => window.scrollTo({ top: document.getElementById('how-it-works')?.offsetTop || 0, behavior: 'smooth' })}>How it works</Button>
              {/* <Button variant="ghost" onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}>Gallery</Button> */}
              <Button variant="outline" onClick={handleLoginClick} onMouseEnter={() => setIsHoveredLogin(true)} onMouseLeave={() => setIsHoveredLogin(false)}>
                Login {isHoveredLogin && <ArrowRight className="w-4 h-4 ml-2 animate-pulse" />}
              </Button>
              <Button onClick={handleRegisterClick} className="bg-[#e65100] text-white" onMouseEnter={() => setIsHoveredRegister(true)} onMouseLeave={() => setIsHoveredRegister(false)}>
                Start Selling {isHoveredRegister && <ArrowRight className="w-4 h-4 ml-2 animate-pulse" />}
              </Button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-gray-100">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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

      {/* HERO */}
      <header className="pt-24 pb-12 bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center grid-cols-1 gap-10 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-3 px-4 py-2 mb-6 text-sm font-medium text-orange-800 bg-orange-100 rounded-full">
                <Sparkles className="w-4 h-4" /> Join 50,000+ creators
              </div>

              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Design. Publish. Earn.
                <span className="block text-[#e65100] mt-2">Merchandise, simplified for creators</span>
              </h1>

              {/* 👇 Image visible only on mobile */}
              <div className="block my-6 sm:hidden">
                <img 
                  src={heroVisual} 
                  alt="Junooni creator mockup" 
                  className="w-full max-w-xs mx-auto shadow-lg rounded-2xl" 
                />
              </div>

              <p className="max-w-2xl mt-6 text-lg text-gray-600">
                Upload your artwork, apply it to high-quality product, and sell without managing inventory. Seamless onboarding and fast payouts.
              </p>

              <div className="flex flex-col gap-4 mt-8 sm:flex-row">
                <Button size="lg" onClick={handleRegisterClick} className="px-8 py-4 text-lg font-semibold text-white rounded-lg" style={{ backgroundColor: '#e65100' }}>
                  Start Designing Here <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                {/* <Button variant="outline" size="lg" onClick={() => {}} className="flex items-center gap-2 px-6 py-4 text-gray-700 rounded-lg">
                  <Play className="w-5 h-5" /> Watch Demo
                </Button> */}
              </div>

            </div>

            <div className="items-center justify-center hidden sm:flex -pt-4">
              <div className="w-full max-w-md rounded-3xl overflow-hidden transform hover:scale-[1.01] transition">
                <img src={heroVisual} alt="Junooni creator mockup" className="object-cover w-full" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURE GRID */}
      <section className="py-12">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Package className="w-8 h-8 text-orange-500" />
                <div>
                  <h4 className="text-lg font-semibold">Zero Inventory</h4>
                  <p className="mt-1 text-sm text-gray-600">We print, pack, and ship — you focus on designs.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <BarChart3 className="w-8 h-8 text-orange-500" />
                <div>
                  <h4 className="text-lg font-semibold">Creator Analytics</h4>
                  <p className="mt-1 text-sm text-gray-600">Sales and payout insights at a glance.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-orange-500" />
                <div>
                  <h4 className="text-lg font-semibold">Secure Payouts</h4>
                  <p className="mt-1 text-sm text-gray-600">Fast, transparent payouts via bank transfer.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - Blinkstore inspired alternating layout */}
      <section id="how-it-works" className="py-20 overflow-hidden bg-gradient-to-b from-white to-orange-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="inline-block px-4 py-2 mb-4 text-sm font-semibold text-orange-800 bg-orange-100 rounded-full">
              Very Simple
            </div>
            <h2 className="mb-4 text-4xl font-extrabold md:text-5xl">
              Easy to Setup Online Print on Demand Store
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Launch your creator business in minutes with our streamlined process
            </p>
          </div>

          {/* Steps - Alternating Layout with Connecting Line */}
          <div className="relative space-y-20">
            {/* Connecting Line - Hidden on mobile, visible on lg screens */}
            <div className="absolute left-1/2 top-0 bottom-0 hidden lg:block w-0.5 bg-gradient-to-b from-orange-200 via-orange-300 to-orange-200 transform -translate-x-1/2">
              {/* Connection dots */}
              <div className="absolute top-[10%] left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-lg"></div>
              <div className="absolute top-[48%] left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-lg"></div>
              <div className="absolute top-[86%] left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-lg"></div>
            </div>

            {steps.map((s, i) => (
              <div 
                key={i} 
                className={`relative flex flex-col gap-8 items-center ${
                  i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Image Side */}
                <div className="flex-1 w-full">
                  <div className="relative group">
                    <div className="absolute inset-0 transition-opacity bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl opacity-20 blur-2xl group-hover:opacity-30"></div>
                    <div className="relative overflow-hidden shadow-2xl rounded-3xl">
                      <img 
                        src={s.image} 
                        alt={s.title} 
                        className="object-cover w-full h-[550px] transform group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 w-full">
                  <div className="relative">
                    {/* Large Step Number */}
                    <div className="absolute -left-4 -top-8 text-[120px] font-black text-orange-100 opacity-50 select-none">
                      {s.step}
                    </div>
                    
                    <div className="relative z-10">
                      {/* Step Badge */}
                      <div className="inline-flex items-center justify-center w-16 h-16 mb-6 text-2xl font-black text-white shadow-lg rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600">
                        {s.step}
                      </div>

                      {/* Title */}
                      <h3 className="mb-4 text-3xl font-extrabold text-gray-900 md:text-4xl">
                        {s.title}
                      </h3>

                      {/* Description */}
                      <p className="mb-6 text-lg leading-relaxed text-gray-600">
                        {s.description}
                      </p>

                      {/* Optional CTA for last step */}
                      {i === steps.length - 1 && (
                        <Button 
                          onClick={handleRegisterClick}
                          size="lg"
                          className="bg-[#e65100] text-white px-8 py-6 text-lg font-semibold hover:bg-orange-700 transition-all hover:shadow-xl"
                        >
                          Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Bottom Feature Highlight */}
          <div className="mt-12">
            <Card className="overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50">
              <div className="grid items-center grid-cols-1 gap-8 p-8 lg:grid-cols-2 lg:p-12">
                <div>
                  <div className="inline-block px-3 py-1 mb-4 text-sm font-semibold text-orange-800 bg-white rounded-full shadow-sm">
                    With Beauty
                  </div>
                  <h3 className="mb-4 text-3xl font-extrabold text-gray-900">
                    Crafted as per your needs
                  </h3>
                  <p className="mb-6 text-lg leading-relaxed text-gray-700">
                    Whether you're a content creator, artist, entrepreneur, or building a community — Junooni adapts to your unique vision. Our platform scales with you, from your first design to your thousandth sale.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                      <Users className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">For Creators</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                      <Palette className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">For Artists</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">For Entrepreneurs</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                      <Heart className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">For Communities</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl opacity-20 blur-3xl"></div>
                  <img 
                    src={gallery4} 
                    alt="Crafted for creators" 
                    className="relative object-cover w-full shadow-2xl rounded-2xl h-84" 
                  />
                </div>
              </div>
            </Card>
          </div>
          

      {/* WE ARE BUILT DIFFERENTLY - With Connecting Line */}
      <section className="py-20 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="inline-block px-4 py-2 mb-4 text-sm font-semibold text-orange-800 bg-orange-100 rounded-full">
              Amazingly
            </div>
            <h2 className="text-4xl font-extrabold md:text-5xl">
              We are built differently
            </h2>
          </div>

          {/* Features - Side by Side Layout */}
          <div className="space-y-24">
            {/* Feature 1 */}
            <div className="relative grid items-center grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="max-w-xl">
                <h3 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">Premium Quality Products</h3>
                <p className="text-lg leading-relaxed text-gray-600">
                  Choose from hundreds of premium-quality products to design and start selling. We handle the print-on-demand, quality checks, packaging, and shipping — so you can focus on what you do best: creating.
                </p>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 transition-opacity bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl opacity-20 blur-2xl group-hover:opacity-30"></div>
                <div className="relative overflow-hidden shadow-xl rounded-3xl">
                  <img 
                    src={gallery1} 
                    alt="Premium Quality Products" 
                    className="object-fill w-full h-[550px] transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative grid items-center grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="relative group lg:order-1">
                <div className="absolute inset-0 transition-opacity bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl opacity-20 blur-2xl group-hover:opacity-30"></div>
                <div className="relative overflow-hidden shadow-xl rounded-3xl">
                  <img 
                    src={gallery2} 
                    alt="Creator-First Support" 
                    className="object-cover w-full h-[550px] transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>
              </div>
              <div className="max-w-xl lg:order-2">
                <h3 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">Creator-First Support</h3>
                <p className="text-lg leading-relaxed text-gray-600">
                  From handling customer inquiries to helping you optimize your store for success, Junooni is your partner at every step. We provide dedicated support, analytics insights, and growth strategies tailored for creators.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative grid items-center grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="max-w-xl">
                <h3 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">Build Your Community</h3>
                <p className="text-lg leading-relaxed text-gray-600">
                  Reward your fans and grow your audience with custom merchandise, exclusive drops, promotional codes, and limited editions. Turn your supporters into brand ambassadors with products they'll love to share.
                </p>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 transition-opacity bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl opacity-20 blur-2xl group-hover:opacity-30"></div>
                <div className="relative overflow-hidden shadow-xl rounded-3xl">
                  <img 
                    src={gallery3} 
                    alt="Build Your Community" 
                    className="object-cover w-full h-[550px] transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Products We Offer */}
      <section id="gallery" className="py-16 bg-gradient-to-b from-white to-orange-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="inline-block px-4 py-2 mb-4 text-sm font-semibold text-orange-800 bg-orange-100 rounded-full">
              Product Catalog
            </div>
            <h2 className="mb-4 text-4xl font-bold">Choose Your Products</h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Select from our wide range of premium-quality products to bring your designs to life
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {merchTypes.map((merch, idx) => (
              <div 
                key={idx} 
                className={`${merch.color} ${merch.shadow} p-6 rounded-2xl transition-all hover:scale-105 hover:shadow-lg cursor-pointer group`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 text-5xl transition-transform group-hover:scale-110">
                    {merch.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">{merch.name}</h3>
                  <p className="mt-1 text-xs text-gray-600">Premium Quality</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="mb-4 text-gray-600">And many more products coming soon!</p>
            <Button 
              onClick={handleRegisterClick} 
              size="lg"
              className="bg-[#e65100] text-white px-8 py-4 font-semibold hover:shadow-xl transition-all"
            >
              Start Designing Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-16 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">Why Choose Junooni?</h2>
            <p className="max-w-2xl mx-auto mt-2 text-gray-600">
              Built for creators — from easy design tools and print-quality mockups to fast payouts and reliable fulfillment.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 transition border border-gray-100 rounded-2xl hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-orange-50 text-[#e65100]">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">End-to-end Fulfillment</h3>
                  <p className="mt-1 text-sm text-gray-600">We print, pack and ship so you don't manage inventory — quality checks included.</p>
                </div>
              </div>
            </div>

            <div className="p-6 transition border border-gray-100 rounded-2xl hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-orange-50 text-[#e65100]">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Creator Analytics</h3>
                  <p className="mt-1 text-sm text-gray-600">Actionable sales and payout insights to help you grow smarter and faster.</p>
                </div>
              </div>
            </div>

            <div className="p-6 transition border border-gray-100 rounded-2xl hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-orange-50 text-[#e65100]">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Secure & Fast Payouts</h3>
                  <p className="mt-1 text-sm text-gray-600">Transparent payout schedule and secure bank transfers — you get paid reliably.</p>
                </div>
              </div>
            </div>

            <div className="p-6 transition border border-gray-100 rounded-2xl hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-orange-50 text-[#e65100]">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Marketplace Reach</h3>
                  <p className="mt-1 text-sm text-gray-600">Expose your designs to a broad audience — built-in discovery and storefront support.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="mb-4 text-sm text-gray-600">Trusted by thousands of creators — fast onboarding, no hidden fees.</p>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={handleRegisterClick} className="bg-[#e65100] text-white px-6 py-3 font-semibold">
                Start Selling
              </Button>
              <Button variant="outline" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                Learn How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-4 bg-white">
        <div className="max-w-4xl px-3 mx-auto text-center sm:px-5 lg:px-6">
          <div className="inline-block px-3 py-1 rounded-full bg-[#e65100] text-white font-semibold mb-4">
            FAQ
          </div>

          <h2 className="text-3xl font-extrabold mb-2 text-[#e65100]">
            Frequently asked questions:
          </h2>
          <p className="mb-6 text-gray-600">
            Quick answers to the questions creators ask most — if you don't find what you need, hit Contact and we'll help.
          </p>

          <div className="text-left">
            <div className="space-y-2">
              {faqs.map((item, idx) => {
                const open = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="relative overflow-hidden bg-white border border-gray-200 rounded-lg"
                  >
                    <button
                      onClick={() => setOpenFaq(open ? null : idx)}
                      aria-expanded={open}
                      className="flex items-start justify-between w-full gap-4 px-4 py-2 focus:outline-none"
                    >
                      <div className="flex-1 pr-4">
                        <div className="text-base font-medium text-gray-900">
                          {item.q}
                        </div>
                      </div>

                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full border transition-transform ${
                          open
                            ? 'bg-[#e65100] text-white border-transparent rotate-45'
                            : 'bg-white text-gray-700 border-gray-300'
                        }`}
                        aria-hidden="true"
                      >
                        <span className="text-lg select-none">+</span>
                      </div>
                    </button>

                    <div
                      className={`px-4 pb-3 transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${
                        open ? 'opacity-100 max-h-64' : 'opacity-0 max-h-0'
                      }`}
                    >
                      <div className="text-sm text-gray-600">{item.a}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-center">
              <p className="mb-3 text-sm text-gray-600">Still have a question?</p>
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={handleRegisterClick}
                  className="bg-[#e65100] text-white px-5 py-2 font-semibold rounded-md hover:bg-white hover:text-[#e65100] hover:border-[#e65100]"
                >
                  Create an account
                </Button>
                <Button
                  variant="outline"
                  className="border-[#e65100] text-[#e65100] px-5 py-2 font-semibold rounded-md"
                  onClick={() => window.open('/contact', '_blank')}
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 text-white bg-gradient-to-r from-orange-600 to-orange-800">
        <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to turn ideas into income?</h2>
          <p className="mb-8 text-orange-100">Start designing and publishing in minutes — zero inventory, full control.</p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={handleRegisterClick} className="px-8 py-4 font-bold text-orange-600 bg-white">Start Creating Free</Button>
            <Button variant="outline" onClick={() => {}} className="px-8 py-4 text-orange-600 border-white">Explore Products</Button>
          </div>
          <p className="mt-6 text-sm text-orange-100/80">No credit card required • Join 50,000+ creators</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-white bg-gray-900">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <img src={junoonilogo} alt="Junooni logo" className="h-8" />
                <span className="text-sm text-gray-300">Creator Studio</span>
              </div>
              <p className="mt-4 text-sm text-gray-400">Empowering creators to design, publish and sell high-quality merchandise without inventory hassle.</p>
            </div>

            <div>
              <h4 className="mb-3 font-semibold">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Product Catalog</a></li>
                <li><a href="#" className="hover:text-white">Upload Designs</a></li>
                <li><a href="https://junooni.com" className="hover:text-white">Marketplace</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 font-semibold">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Creator Guide</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 mt-8 text-sm text-center text-gray-400 border-t border-gray-800">
            © {new Date().getFullYear()} Junooni Creator Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JunooniLandingPage;