import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowRight, Play, Star, TrendingUp, Users, Package, Palette, Sparkles,
  Menu, X, Heart, Edit3, Layers, Share2, BarChart3, Shield, ChevronRight, Eye , Globe
} from 'lucide-react';

// Images: place files into /src/assets/ as described above
import heroVisual from '/src/assets/hero-visual.png';
import step1Img from '/src/assets/step-1.jpg';
import step2Img from '/src/assets/step-2.png';
import step3Img from '/src/assets/step-3.png';
import gallery1 from '/src/assets/gallery-1.png';
import gallery2 from '/src/assets/gallery-2.png';
import gallery3 from '/src/assets/gallery-3.jpg';
import gallery4 from '/src/assets/gallery-4.jpg';

const JunooniLandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const [currentMerch, setCurrentMerch] = useState(0);
  const [isHoveredRegister, setIsHoveredRegister] = useState(false);
  const [isHoveredLogin, setIsHoveredLogin] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    a: 'No — we operate on a print-on-demand model. Items are produced after a customer places an order, so you don’t need to manage stock or warehousing.'
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
    a: 'Use the built-in promotion tools, shareable storefront links, and analytics to understand what’s selling. We also run seasonal campaigns creators can opt into for extra visibility.'
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
    <div className="min-h-screen bg-white text-gray-900">
      {/* NAV */}
      <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-3">
                <img src="/src/assets/junooni_logo_brand_color.png" alt="Junooni" className="h-8" />
                <span className="hidden sm:block text-sm font-semibold text-gray-700">Creator Studio</span>
              </button>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" onClick={() => window.scrollTo({ top: document.getElementById('how-it-works')?.offsetTop || 0, behavior: 'smooth' })}>How it works</Button>
              <Button variant="ghost" onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}>Gallery</Button>
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
            <div className="md:hidden py-4 border-t border-gray-100">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-orange-100 text-orange-800 font-medium text-sm mb-6">
                <Sparkles className="w-4 h-4" /> Join 50,000+ creators
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                Design. Publish. Earn.
                <span className="block text-[#e65100] mt-2">Merchandise, simplified for creators</span>
              </h1>

              <p className="mt-6 text-lg text-gray-600 max-w-2xl">
                Upload your artwork, apply it to high-quality product templates, and sell without managing inventory. Seamless onboarding and fast payouts.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={handleRegisterClick} className="px-8 py-4 text-white rounded-lg font-semibold text-lg" style={{ backgroundColor: '#e65100' }}>
                  Start Designing Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <Button variant="outline" size="lg" onClick={() => {}} className="px-6 py-4 text-gray-700 rounded-lg flex items-center gap-2">
                  <Play className="w-5 h-5" /> Watch Demo
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className={`flex flex-col items-start p-3 rounded-lg border ${currentStat === i ? 'bg-white shadow-md -translate-y-1 border-orange-100' : 'bg-gray-50 border-gray-100'} transition-transform`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${currentStat === i ? 'bg-orange-50' : 'bg-white'}`}>
                          <Icon className={`w-5 h-5 ${currentStat === i ? 'text-orange-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                      <div className="mt-2 text-lg font-bold">{stat.number}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* NEW: bright hero image that matches our work */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.01] transition">
                <img src={heroVisual} alt="Junooni creator mockup" className="w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURE GRID */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Package className="w-8 h-8 text-orange-500" />
                <div>
                  <h4 className="font-semibold text-lg">Zero Inventory</h4>
                  <p className="text-sm text-gray-600 mt-1">We print, pack, and ship — you focus on designs.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <BarChart3 className="w-8 h-8 text-orange-500" />
                <div>
                  <h4 className="font-semibold text-lg">Creator Analytics</h4>
                  <p className="text-sm text-gray-600 mt-1">Sales and payout insights at a glance.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-orange-500" />
                <div>
                  <h4 className="font-semibold text-lg">Secure Payouts</h4>
                  <p className="text-sm text-gray-600 mt-1">Fast, transparent payouts via bank transfer.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS with images for each step */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-3">Start Creating in 3 Simple Steps</h2>
          <p className="text-gray-600 mb-8">From idea to income — simple, visual, fast.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {steps.map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="mb-4">
                  <img src={s.image} alt={s.title} className="w-full h-40 object-cover rounded-md" />
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-50 text-[#e65100] font-bold">{s.step}</div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">{s.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{s.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Creator Spotlight / Gallery (replaces Testimonial section) */}
      <section id="gallery" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">Creator Spotlight</h2>
              <p className="text-gray-600">Handpicked designs and mockups from creators on Junooni.</p>
            </div>
            <Button variant="ghost" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it works <ChevronRight /></Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[gallery1, gallery2, gallery3, gallery4].map((img, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
                <img src={img} alt={`gallery-${idx}`} className="w-full h-56 object-cover" />
                <div className="p-4 bg-white">
                  <div className="font-semibold">Creator Work {idx + 1}</div>
                  <div className="text-sm text-gray-500">High-quality mockup • Bestsellers</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- WHY CHOOSE US ---------- */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Why Choose Junooni?</h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Built for creators — from easy design tools and print-quality mockups to fast payouts and reliable fulfillment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-orange-50 text-[#e65100]">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">End-to-end Fulfillment</h3>
                  <p className="text-sm text-gray-600 mt-1">We print, pack and ship so you don’t manage inventory — quality checks included.</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-orange-50 text-[#e65100]">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Creator Analytics</h3>
                  <p className="text-sm text-gray-600 mt-1">Actionable sales and payout insights to help you grow smarter and faster.</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-orange-50 text-[#e65100]">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Secure & Fast Payouts</h3>
                  <p className="text-sm text-gray-600 mt-1">Transparent payout schedule and secure bank transfers — you get paid reliably.</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-orange-50 text-[#e65100]">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Marketplace Reach</h3>
                  <p className="text-sm text-gray-600 mt-1">Expose your designs to a broad audience — built-in discovery and storefront support.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">Trusted by thousands of creators — fast onboarding, no hidden fees.</p>
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
  <div className="max-w-4xl mx-auto px-3 sm:px-5 lg:px-6 text-center">
    {/* Label */}
    <div className="inline-block px-3 py-1 rounded-full bg-[#e65100] text-white font-semibold mb-4">
      FAQ
    </div>

    {/* Heading */}
    <h2 className="text-3xl font-extrabold mb-2 text-[#e65100]">
      Frequently asked questions:
    </h2>
    <p className="text-gray-600 mb-6">
      Quick answers to the questions creators ask most — if you don’t find what you need, hit Contact and we’ll help.
    </p>

    <div className="text-left">
      <div className="space-y-2">
        {faqs.map((item, idx) => {
          const open = openFaq === idx;
          return (
            <div
              key={idx}
              className="relative bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(open ? null : idx)}
                aria-expanded={open}
                className="w-full px-4 py-2 flex items-start justify-between gap-4 focus:outline-none"
              >
                <div className="flex-1 pr-4">
                  <div className="text-base font-medium text-gray-900">
                    {item.q}
                  </div>
                </div>

                {/* right-aligned toggle circle */}
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

              {/* animated answer area */}
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

      {/* footer */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-3">Still have a question?</p>
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
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to turn ideas into income?</h2>
          <p className="mb-8 text-orange-100">Start designing and publishing in minutes — zero inventory, full control.</p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={handleRegisterClick} className="bg-white text-orange-600 px-8 py-4 font-bold">Start Creating Free</Button>
            <Button variant="outline" onClick={() => {}} className="px-8 py-4 border-white text-orange-600">Explore Products</Button>
          </div>
          <p className="mt-6 text-sm text-orange-100/80">No credit card required • Join 50,000+ creators</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3">
                <img src="/src/assets/junooni_logo_brand_color.png" alt="Junooni logo" className="h-8" />
                <span className="text-sm text-gray-300">Creator Studio</span>
              </div>
              <p className="text-gray-400 mt-4 text-sm">Empowering creators to design, publish and sell high-quality merchandise without inventory hassle.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <ul className="text-gray-400 space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Product Catalog</a></li>
                <li><a href="#" className="hover:text-white">Upload Designs</a></li>
                <li><a href="https://junooni.com" className="hover:text-white">Marketplace</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="text-gray-400 space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Creator Guide</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="text-gray-400 space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Junooni Creator Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JunooniLandingPage;
