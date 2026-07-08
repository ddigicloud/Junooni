import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowRight, Star, TrendingUp, Users, Package, Palette, Sparkles,
  Menu, X, Heart, BarChart3, Shield, Globe, Store, Layers, Ticket,
  CheckCircle2, Receipt, Truck
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

// ---------------------------------------------------------------------------
// Design tokens (see inline comments) — kept as plain values so this file
// drops into the existing Tailwind + shadcn setup without new config.
//   Ink       #1B1330  (section contrast, footer, dark panels)
// Saffron   #E65100  (primary brand / CTA — unchanged from existing brand)
//   Marigold  #F5A623  (secondary accent, highlights, "own store" path)
//   Cream     #FFF8F0  (base background, replaces flat white)
// ---------------------------------------------------------------------------

const JunooniLandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentMerch, setCurrentMerch] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const navigate = useNavigate();

  const handleRegisterClick = () => {
    window.location.href = '/sign-up';
  };

  const handleLoginClick = () => {
    navigate({ to: '/sign-in' });
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const merchTypes = [
    { name: 'T-Shirts', icon: '👕', color: 'bg-orange-100', shadow: 'shadow-orange-200' },
    { name: 'Mugs', icon: '☕', color: 'bg-orange-200', shadow: 'shadow-orange-200' },
    { name: 'Hoodies', icon: '🧥', color: 'bg-orange-50', shadow: 'shadow-orange-200' },
    { name: 'Stickers', icon: '🏷️', color: 'bg-amber-100', shadow: 'shadow-amber-200' },
    { name: 'Posters', icon: '🖼️', color: 'bg-orange-100', shadow: 'shadow-orange-200' },
    { name: 'Phone Cases', icon: '📱', color: 'bg-amber-50', shadow: 'shadow-amber-200' },
  ];

  // The two paths — this is the core new fact: JUNOONI is not one thing,
  // it's two ways to sell, both backed by the same zero-inventory engine.
  const paths = [
    {
      key: 'marketplace',
      icon: Store,
      label: 'Marketplace',
      domain: 'junooni.com',
      tagline: 'List once, get discovered',
      description:
        'Your products go live inside the JUNOONI marketplace where creator-shoppers are already browsing. Fastest way to your first sale.',
      points: ['Live on junooni.com in minutes', 'Built-in discovery & search', 'Starting from 0% commission'],
    },
    {
      key: 'ownstore',
      icon: Layers,
      label: 'Own Store',
      domain: 'yourbrand.com',
      tagline: 'Your brand, your domain',
      description:
        'A fully branded storefront on your own custom domain. Same zero-inventory engine underneath — design, fulfillment, ops, logistics, and customer service, all still on us.',
      points: ['Custom domain & branding', 'Full storefront design control', 'Same 90% revenue share'],
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Sign up',
      description: 'Create your creator account — no paperwork, no inventory to plan for.',
      image: step1Img,
    },
    {
      step: '02',
      title: 'Pick your path & design',
      description:
        'Go live on the Marketplace, spin up your Own Store, or both. Upload your art and place it on real products.',
      image: step2Img,
    },
    {
      step: '03',
      title: 'JUNOONI handles everything',
      description:
        'Production, fulfillment, GST-compliant invoicing, pan-India delivery, and customer service — you just keep 90% and watch it earn.',
      image: step3Img,
    },
  ];

  const faqs = [
    {
      q: 'Marketplace or Own Store — which one is for me?',
      a: 'Start on the Marketplace (junooni.com) if you want fast discovery from day one. Choose Own Store if you want a fully branded storefront on your own domain. Most creators use both — the backend (fulfillment, ops, logistics, customer service) is identical either way.',
    },
    {
      q: 'Do I need to hold inventory?',
      a: 'No. JUNOONI runs on a zero inventory risk, print-on-demand model. Products are made only after a customer orders, so there is no stock, no warehousing, and no upfront cost to you.',
    },
    {
      q: 'What does JUNOONI actually handle for me?',
      a: 'Design tools, production, fulfillment, GST-compliant invoicing, pan-India delivery, and customer service. JUNOONI does everything. Takes nothing beyond a starting commission of 0%.',
    },
    {
      q: 'How much do I earn, and how are payouts handled?',
      a: 'You keep up to 90% of your revenue, with commission starting from 0%. A payout dashboard shows sales and fees before every transfer, on a regular payout schedule.',
    },
    {
      q: 'What file formats and sizes do you accept?',
      a: 'High-resolution PNG, JPEG, and vector SVG for print. For apparel, 300 DPI at final print size is recommended for a crisp result.',
    },
    {
      q: 'Are invoices GST-compliant?',
      a: 'Yes. Every order generates a GST-compliant invoice automatically — no manual bookkeeping on your end.',
    },
    {
      q: 'What if a customer gets a damaged or misprinted item?',
      a: 'JUNOONI\'s customer service team handles it end-to-end — replacement or refund per policy. You are never in the middle of a returns conversation.',
    },
    {
      q: 'Can I sell products I already make myself, not just print-on-demand?',
      a: 'Yes. Alongside POD creators, JUNOONI also supports creators selling their own products — we still run the operations, logistics, and customer service on your behalf.',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMerch((prev) => (prev + 1) % merchTypes.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen text-gray-900 bg-[#FFF8F0]">
      {/* NAV */}
      <nav className="fixed z-50 w-full border-b border-orange-100/70 bg-[#FFF8F0]/95 backdrop-blur-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-2 sm:gap-3">
                <img src={junoonilogo} alt="Junooni" className="h-6 sm:h-8" />
                <span className="hidden text-xs font-semibold text-gray-700 sm:text-sm md:block">Creator Studio</span>
              </button>
            </div>

            <div className="items-center hidden gap-1 md:flex">
              <Button variant="ghost" onClick={() => scrollTo('paths')}>Marketplace vs Own Store</Button>
              <Button variant="ghost" onClick={() => scrollTo('how-it-works')}>How it works</Button>
              <Button variant="outline" onClick={handleLoginClick} className="ml-2">Login</Button>
              <Button onClick={handleRegisterClick} className="bg-[#e65100] text-white">
                Start Selling <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-orange-50">
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="py-4 border-t border-orange-100 md:hidden">
              <div className="flex flex-col gap-3 px-2">
                <Button variant="ghost" onClick={() => { setIsMenuOpen(false); scrollTo('paths'); }}>Marketplace vs Own Store</Button>
                <Button variant="ghost" onClick={() => { setIsMenuOpen(false); scrollTo('how-it-works'); }}>How it works</Button>
                <Button variant="ghost" onClick={() => { setIsMenuOpen(false); handleLoginClick(); }}>Login</Button>
                <Button onClick={() => { setIsMenuOpen(false); handleRegisterClick(); }} className="bg-[#e65100] text-white">Start Selling</Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <header className="pt-20 pb-8 sm:pt-24 sm:pb-12 bg-gradient-to-br from-orange-50 via-[#FFF8F0] to-amber-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center grid-cols-1 gap-6 sm:gap-10 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:gap-3 sm:px-4 sm:py-2 mb-4 sm:mb-6 text-xs sm:text-sm font-medium text-orange-800 bg-orange-100 rounded-full">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" /> India's end-to-end creator commerce platform
              </div>

              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl xl:text-6xl">
                Design it. Sell it everywhere.
                <span className="block text-[#e65100] mt-1 sm:mt-2">Keep 90%.</span>
              </h1>

              <div className="block my-4 sm:my-6 lg:hidden">
                <img
                  src={heroVisual}
                  alt="Junooni creator mockup"
                  className="w-full max-w-xs mx-auto shadow-lg rounded-2xl"
                />
              </div>

              <p className="max-w-2xl mt-4 text-base leading-relaxed text-gray-600 sm:mt-6 sm:text-lg">
                Sell on the JUNOONI Marketplace, launch your own branded store, or both. JUNOONI handles design tools, production, fulfillment, GST-compliant invoicing, and customer service — with zero inventory risk, starting from 0% commission.
              </p>

              <div className="flex flex-col gap-3 mt-6 sm:flex-row sm:gap-4 sm:mt-8">
                <Button size="lg" onClick={handleRegisterClick} className="px-6 py-3 text-base font-semibold text-white rounded-lg sm:px-8 sm:py-4 sm:text-lg" style={{ backgroundColor: '#e65100' }}>
                  Start Designing <ArrowRight className="w-4 h-4 ml-2 sm:w-5 sm:h-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => scrollTo('paths')} className="px-6 py-3 text-base font-semibold rounded-lg border-[#e65100] text-[#e65100] sm:px-8 sm:py-4 sm:text-lg">
                  Compare Marketplace vs Own Store
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 mt-6 sm:mt-8">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-[#e65100]" /> Zero inventory risk</div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-[#e65100]" /> GST-compliant</div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-[#e65100]" /> Pan-India delivery</div>
              </div>
            </div>

            <div className="items-center justify-center hidden lg:flex">
              <div className="w-full max-w-md overflow-hidden transition transform rounded-3xl hover:scale-[1.01]">
                <img src={heroVisual} alt="Junooni creator mockup" className="object-cover w-full" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* TWO PATHS — signature section: Marketplace vs Own Store as ticket-stub cards */}
      <section id="paths" className="py-12 sm:py-16 bg-[#FFF8F0]">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4 text-xs sm:text-sm font-semibold text-orange-800 bg-orange-100 rounded-full">
              <Ticket className="w-3.5 h-3.5" /> Two ways to sell, one engine underneath
            </div>
            <h2 className="mb-3 text-2xl font-extrabold sm:text-3xl md:text-4xl lg:text-5xl sm:mb-4">
              Marketplace or Own Store — you choose
            </h2>
            <p className="max-w-2xl mx-auto text-sm text-gray-600 sm:text-base lg:text-lg">
              Whichever path you pick, JUNOONI still handles production, fulfillment, ops, logistics, and customer service. Zero inventory risk either way.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {paths.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.key}
                  className="relative p-6 bg-white border-2 border-dashed sm:p-8 rounded-2xl border-orange-300"
                >
                  {/* ticket-stub notches */}
                  <div className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFF8F0] top-1/2 left-0" />
                  <div className="absolute w-6 h-6 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFF8F0] top-1/2 right-0" />

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 text-[#e65100]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold sm:text-xl">{p.label}</h3>
                      <p className="text-xs text-gray-500 sm:text-sm">{p.domain}</p>
                    </div>
                  </div>

                  <p className="mb-3 text-sm font-semibold text-[#e65100] sm:text-base">{p.tagline}</p>
                  <p className="mb-5 text-sm leading-relaxed text-gray-600 sm:text-base">{p.description}</p>

                  <ul className="mb-6 space-y-2">
                    {p.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700 sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-[#e65100] mt-0.5 flex-shrink-0" /> {pt}
                      </li>
                    ))}
                  </ul>

                  <Button onClick={handleRegisterClick} className="w-full bg-[#e65100] text-white font-semibold">
                    Start with {p.label} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="py-8 sm:py-12">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col items-start gap-3">
                <Package className="w-6 h-6 text-[#e65100] sm:w-8 sm:h-8" />
                <div>
                  <h4 className="text-base font-semibold sm:text-lg">Zero Inventory Risk</h4>
                  <p className="mt-1 text-xs text-gray-600 sm:text-sm">Nothing is made until it's ordered. No stock, no upfront cost.</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="flex flex-col items-start gap-3">
                <Receipt className="w-6 h-6 text-[#e65100] sm:w-8 sm:h-8" />
                <div>
                  <h4 className="text-base font-semibold sm:text-lg">GST-Compliant</h4>
                  <p className="mt-1 text-xs text-gray-600 sm:text-sm">Every order generates a compliant invoice automatically.</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="flex flex-col items-start gap-3">
                <Truck className="w-6 h-6 text-[#e65100] sm:w-8 sm:h-8" />
                <div>
                  <h4 className="text-base font-semibold sm:text-lg">Pan-India Delivery</h4>
                  <p className="mt-1 text-xs text-gray-600 sm:text-sm">Reliable shipping to every pincode, handled for you.</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="flex flex-col items-start gap-3">
                <BarChart3 className="w-6 h-6 text-[#e65100] sm:w-8 sm:h-8" />
                <div>
                  <h4 className="text-base font-semibold sm:text-lg">Keep Up to 90%</h4>
                  <p className="mt-1 text-xs text-gray-600 sm:text-sm">Starting from 0% commission, with a clear payout dashboard.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-12 overflow-hidden sm:py-16 lg:py-20 bg-gradient-to-b from-[#FFF8F0] to-orange-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:mb-16">
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4 text-xs sm:text-sm font-semibold text-orange-800 bg-orange-100 rounded-full">
              From sign-up to sale
            </div>
            <h2 className="mb-3 text-2xl font-extrabold sm:text-3xl md:text-4xl lg:text-5xl sm:mb-4">
              JUNOONI does everything. Takes nothing.
            </h2>
            <p className="max-w-2xl mx-auto text-sm text-gray-600 sm:text-base lg:text-lg">
              Three steps between you and your first sale — the rest is on us.
            </p>
          </div>

          <div className="relative space-y-12 sm:space-y-16 lg:space-y-20">
            <div className="absolute left-1/2 top-0 bottom-0 hidden lg:block w-0.5 bg-gradient-to-b from-orange-200 via-orange-300 to-orange-200 transform -translate-x-1/2">
              <div className="absolute top-[10%] left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#e65100] rounded-full border-4 border-[#FFF8F0] shadow-lg"></div>
              <div className="absolute top-[48%] left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#e65100] rounded-full border-4 border-[#FFF8F0] shadow-lg"></div>
              <div className="absolute top-[86%] left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#e65100] rounded-full border-4 border-[#FFF8F0] shadow-lg"></div>
            </div>

            {steps.map((s, i) => (
              <div
                key={i}
                className={`relative flex flex-col gap-6 sm:gap-8 items-center ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
              >
                <div className="flex-1 w-full">
                  <div className="relative group">
                    <div className="absolute inset-0 transition-opacity bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl sm:rounded-3xl opacity-20 blur-xl sm:blur-2xl group-hover:opacity-30"></div>
                    <div className="relative overflow-hidden shadow-xl sm:shadow-2xl rounded-2xl sm:rounded-3xl">
                      <img
                        src={s.image}
                        alt={s.title}
                        className="object-cover w-full h-[300px] sm:h-[400px] lg:h-[500px] transform group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full">
                  <div className="relative px-4 sm:px-0">
                    <div className="absolute -left-2 sm:-left-4 -top-6 sm:-top-8 text-[80px] sm:text-[120px] font-black text-orange-100 opacity-50 select-none">
                      {s.step}
                    </div>

                    <div className="relative z-10">
                      <div className="inline-flex items-center justify-center w-12 h-12 mb-4 text-xl font-black text-white shadow-lg sm:w-16 sm:h-16 sm:mb-6 sm:text-2xl rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600">
                        {s.step}
                      </div>

                      <h3 className="mb-3 text-2xl font-extrabold text-gray-900 sm:text-3xl md:text-4xl sm:mb-4">
                        {s.title}
                      </h3>

                      <p className="mb-4 text-base leading-relaxed text-gray-600 sm:text-lg sm:mb-6">
                        {s.description}
                      </p>

                      {i === steps.length - 1 && (
                        <Button
                          onClick={handleRegisterClick}
                          size="lg"
                          className="bg-[#e65100] text-white px-6 py-3 sm:px-8 sm:py-6 text-base sm:text-lg font-semibold hover:bg-orange-700 transition-all hover:shadow-xl w-full sm:w-auto"
                        >
                          Get Started Now <ArrowRight className="w-4 h-4 ml-2 sm:w-5 sm:h-5" />
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
      <section className="py-8 sm:py-12">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <Card className="overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="grid items-center grid-cols-1 gap-6 p-6 sm:gap-8 sm:p-8 lg:grid-cols-2 lg:p-12">
              <div>
                <div className="inline-block px-3 py-1 mb-3 text-xs font-semibold text-orange-800 bg-white rounded-full shadow-sm sm:mb-4 sm:text-sm">
                  Built to fit how you sell
                </div>
                <h3 className="mb-3 text-2xl font-extrabold text-gray-900 sm:text-3xl sm:mb-4">
                  Crafted as per your needs
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-700 sm:text-base lg:text-lg sm:mb-6">
                  Content creator, artist, entrepreneur, or community builder — Marketplace or Own Store, JUNOONI scales with you, from your first design to your thousandth sale, with zero inventory risk throughout.
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white rounded-full shadow-sm">
                    <Users className="w-3 h-3 text-orange-600 sm:w-4 sm:h-4" />
                    <span className="text-xs font-medium text-gray-700 sm:text-sm">For Creators</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white rounded-full shadow-sm">
                    <Palette className="w-3 h-3 text-orange-600 sm:w-4 sm:h-4" />
                    <span className="text-xs font-medium text-gray-700 sm:text-sm">For Artists</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white rounded-full shadow-sm">
                    <TrendingUp className="w-3 h-3 text-orange-600 sm:w-4 sm:h-4" />
                    <span className="text-xs font-medium text-gray-700 sm:text-sm">For Entrepreneurs</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white rounded-full shadow-sm">
                    <Heart className="w-3 h-3 text-orange-600 sm:w-4 sm:h-4" />
                    <span className="text-xs font-medium text-gray-700 sm:text-sm">For Communities</span>
                  </div>
                </div>
              </div>
              <div className="relative order-first lg:order-last">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl sm:rounded-2xl opacity-20 blur-2xl sm:blur-3xl"></div>
                <img
                  src={gallery4}
                  alt="Crafted for creators"
                  className="relative object-cover w-full h-48 shadow-xl sm:shadow-2xl rounded-xl sm:rounded-2xl sm:h-64 lg:h-84"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* WE ARE BUILT DIFFERENTLY */}
      <section className="py-12 bg-[#FFF8F0] sm:py-16 lg:py-20">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:mb-16">
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4 text-xs sm:text-sm font-semibold text-orange-800 bg-orange-100 rounded-full">
              End-to-end, by design
            </div>
            <h2 className="text-2xl font-extrabold sm:text-3xl md:text-4xl lg:text-5xl">
              We are built differently
            </h2>
          </div>

          <div className="space-y-12 sm:space-y-16 lg:space-y-24">
            <div className="relative grid items-center grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
              <div className="max-w-xl px-4 sm:px-0">
                <h3 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl sm:mb-4">Premium quality products</h3>
                <p className="text-sm leading-relaxed text-gray-600 sm:text-base lg:text-lg">
                  Choose from hundreds of premium-quality products to design and start selling. Production, quality checks, packaging, and shipping are ours to handle — designing is yours.
                </p>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 transition-opacity bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl sm:rounded-3xl opacity-20 blur-xl sm:blur-2xl group-hover:opacity-30"></div>
                <div className="relative overflow-hidden shadow-lg sm:shadow-xl rounded-2xl sm:rounded-3xl">
                  <img
                    src={gallery1}
                    alt="Premium Quality Products"
                    className="object-fill w-full h-[300px] sm:h-[400px] lg:h-[500px] transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            <div className="relative grid items-center grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
              <div className="relative group lg:order-1">
                <div className="absolute inset-0 transition-opacity bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl sm:rounded-3xl opacity-20 blur-xl sm:blur-2xl group-hover:opacity-30"></div>
                <div className="relative overflow-hidden shadow-lg sm:shadow-xl rounded-2xl sm:rounded-3xl">
                  <img
                    src={gallery2}
                    alt="End-to-end operations"
                    className="object-cover w-full h-[300px] sm:h-[400px] lg:h-[500px] transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="max-w-xl px-4 sm:px-0 lg:order-2">
                <h3 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl sm:mb-4">Operations, logistics & customer service — covered</h3>
                <p className="text-sm leading-relaxed text-gray-600 sm:text-base lg:text-lg">
                  From production through delivery to every customer query, JUNOONI runs it end-to-end. GST-compliant invoicing and a clear payout dashboard mean you always know where you stand.
                </p>
              </div>
            </div>

            <div className="relative grid items-center grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
              <div className="max-w-xl px-4 sm:px-0">
                <h3 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl sm:mb-4">Build your community</h3>
                <p className="text-sm leading-relaxed text-gray-600 sm:text-base lg:text-lg">
                  Reward your fans and grow your audience with custom merchandise, exclusive drops, promotional codes, and limited editions — on the Marketplace, your Own Store, or both.
                </p>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 transition-opacity bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl sm:rounded-3xl opacity-20 blur-xl sm:blur-2xl group-hover:opacity-30"></div>
                <div className="relative overflow-hidden shadow-lg sm:shadow-xl rounded-2xl sm:rounded-3xl">
                  <img
                    src={gallery3}
                    alt="Build Your Community"
                    className="object-cover w-full h-[300px] sm:h-[400px] lg:h-[500px] transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products We Offer */}
      <section id="gallery" className="py-12 sm:py-16 bg-gradient-to-b from-[#FFF8F0] to-orange-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-12">
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4 text-xs sm:text-sm font-semibold text-orange-800 bg-orange-100 rounded-full">
              Product Catalog
            </div>
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl lg:text-4xl sm:mb-4">Choose Your Products</h2>
            <p className="max-w-2xl mx-auto text-sm text-gray-600 sm:text-base lg:text-lg">
              Select from our wide range of premium-quality products to bring your designs to life — on the Marketplace or your Own Store.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {merchTypes.map((merch, idx) => (
              <div
                key={idx}
                className={`${merch.color} ${merch.shadow} p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all hover:scale-105 hover:shadow-lg cursor-pointer group`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2 text-3xl transition-transform sm:text-4xl lg:text-5xl sm:mb-3 group-hover:scale-110">
                    {merch.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 sm:text-base">{merch.name}</h3>
                  <p className="mt-1 text-[10px] sm:text-xs text-gray-600">Premium Quality</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center sm:mt-12">
            <p className="mb-3 text-sm text-gray-600 sm:mb-4 sm:text-base">And many more products coming soon!</p>
            <Button
              onClick={handleRegisterClick}
              size="lg"
              className="bg-[#e65100] text-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold hover:shadow-xl transition-all w-full sm:w-auto"
            >
              Start Designing Now <ArrowRight className="w-4 h-4 ml-2 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-12 bg-[#FFF8F0] sm:py-16">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-6 text-center sm:mb-8">
            <h2 className="text-2xl font-bold sm:text-3xl">Why Choose Junooni?</h2>
            <p className="max-w-2xl mx-auto mt-2 text-sm text-gray-600 sm:text-base">
              Built for creators — from design tools and print-quality mockups to GST-compliant payouts and reliable fulfillment.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 transition bg-white border border-orange-100 sm:p-6 rounded-xl sm:rounded-2xl hover:shadow-lg">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-orange-50 text-[#e65100] flex-shrink-0">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold sm:text-base">End-to-end fulfillment</h3>
                  <p className="mt-1 text-xs text-gray-600 sm:text-sm">Production, packing, and shipping — with zero inventory risk to you.</p>
                </div>
              </div>
            </div>

            <div className="p-4 transition bg-white border border-orange-100 sm:p-6 rounded-xl sm:rounded-2xl hover:shadow-lg">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-orange-50 text-[#e65100] flex-shrink-0">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold sm:text-base">Creator analytics</h3>
                  <p className="mt-1 text-xs text-gray-600 sm:text-sm">Actionable sales and payout insights to help you grow smarter.</p>
                </div>
              </div>
            </div>

            <div className="p-4 transition bg-white border border-orange-100 sm:p-6 rounded-xl sm:rounded-2xl hover:shadow-lg">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-orange-50 text-[#e65100] flex-shrink-0">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold sm:text-base">GST-compliant payouts</h3>
                  <p className="mt-1 text-xs text-gray-600 sm:text-sm">Transparent schedule, compliant invoicing, up to 90% revenue share.</p>
                </div>
              </div>
            </div>

            <div className="p-4 transition bg-white border border-orange-100 sm:p-6 rounded-xl sm:rounded-2xl hover:shadow-lg">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-orange-50 text-[#e65100] flex-shrink-0">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold sm:text-base">Marketplace + Own Store reach</h3>
                  <p className="mt-1 text-xs text-gray-600 sm:text-sm">Built-in discovery on junooni.com, or a fully branded store on your domain.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center sm:mt-8">
            <p className="mb-3 text-xs text-gray-600 sm:mb-4 sm:text-sm">Fast onboarding, no hidden fees, starting from 0% commission.</p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Button onClick={handleRegisterClick} className="bg-[#e65100] text-white px-6 py-3 font-semibold w-full sm:w-auto">
                Start Selling
              </Button>
              <Button variant="outline" onClick={() => scrollTo('how-it-works')} className="w-full sm:w-auto border-[#e65100] text-[#e65100]">
                Learn How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-8 bg-[#FFF8F0] sm:py-12">
        <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <div className="inline-block px-3 py-1 rounded-full bg-[#e65100] text-white text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            FAQ
          </div>

          <h2 className="text-2xl font-extrabold mb-2 text-[#e65100] sm:text-3xl">
            Frequently asked questions
          </h2>
          <p className="mb-6 text-sm text-gray-600 sm:text-base">
            Quick answers to what creators ask most — if you don't find what you need, reach out to Support.
          </p>

          <div className="text-left">
            <div className="space-y-2">
              {faqs.map((item, idx) => {
                const open = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="relative overflow-hidden bg-white border border-orange-100 rounded-lg"
                  >
                    <button
                      onClick={() => setOpenFaq(open ? null : idx)}
                      aria-expanded={open}
                      className="flex items-start justify-between w-full gap-3 px-4 py-3 sm:gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e65100]"
                    >
                      <div className="flex-1 pr-2 sm:pr-4">
                        <div className="text-sm font-medium text-left text-gray-900 sm:text-base">
                          {item.q}
                        </div>
                      </div>

                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border transition-transform flex-shrink-0 ${
                          open
                            ? 'bg-[#e65100] text-white border-transparent rotate-45'
                            : 'bg-white text-gray-700 border-gray-300'
                        }`}
                        aria-hidden="true"
                      >
                        <span className="text-base select-none sm:text-lg">+</span>
                      </div>
                    </button>

                    <div
                      className={`px-4 pb-3 transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${
                        open ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'
                      }`}
                    >
                      <div className="text-xs text-gray-600 sm:text-sm">{item.a}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-center">
              <p className="mb-3 text-xs text-gray-600 sm:text-sm">Still have a question?</p>
              <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
                <Button
                  onClick={handleRegisterClick}
                  className="bg-[#e65100] text-white px-5 py-2 text-sm sm:text-base font-semibold rounded-md hover:bg-white hover:text-[#e65100] hover:border-[#e65100] w-full sm:w-auto"
                >
                  Create an account
                </Button>
                <Button
                  variant="outline"
                  className="border-[#e65100] text-[#e65100] px-5 py-2 text-sm sm:text-base font-semibold rounded-md w-full sm:w-auto"
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
      <section className="py-12 text-white sm:py-16 bg-gradient-to-r from-[#e65100] to-orange-800">
        <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl md:text-4xl sm:mb-4">Ready to turn ideas into income?</h2>
          <p className="mb-6 text-sm text-orange-100 sm:text-base sm:mb-8">Marketplace or Own Store — start designing and publishing in minutes, with zero inventory risk and full control.</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Button size="lg" onClick={handleRegisterClick} className="px-6 py-3 text-base font-bold text-orange-600 bg-white sm:px-8 sm:py-4 sm:text-lg">Start Creating Free</Button>
            <Button size="lg" variant="outline" onClick={() => scrollTo('gallery')} className="px-6 py-3 text-base text-white border-white sm:px-8 sm:py-4 sm:text-lg">Explore Products</Button>
          </div>
          <p className="mt-4 text-xs sm:mt-6 sm:text-sm text-orange-100/80">No credit card required • Starting from 0% commission</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 text-white bg-[#1B1330] sm:py-10">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <img src={junoonilogo} alt="Junooni logo" className="h-6 sm:h-8" />
                <span className="text-xs text-gray-300 sm:text-sm">Creator Studio</span>
              </div>
              <p className="mt-3 text-xs text-gray-400 sm:mt-4 sm:text-sm">India's end-to-end creator commerce platform — design, fulfillment, ops, logistics, and customer service, with zero inventory risk.</p>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold sm:mb-3 sm:text-base">Platform</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="https://cms.junooni.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Product Catalog</a></li>
                <li><a href="/pages/fulfillment-page" className="hover:text-white">Fulfillment</a></li>
                <li><a href="/pages/own-store" className="hover:text-white">Own Store</a></li>
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
                <li><a href="#" className="hover:text-white">Instagram</a></li>
                <li><a href="#" className="hover:text-white">Facebook</a></li>
                <li><a href="https://youtube.com/@bejunooni?si=p96lWYtfDUMhsII3" className="hover:text-white">Youtube</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold sm:mb-3 sm:text-base">Company</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="/pages/about-us" className="hover:text-white">About us</a></li>
                <li><a href="#" className="hover:text-white">Career</a></li>
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
};

export default JunooniLandingPage;