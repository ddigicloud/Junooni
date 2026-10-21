import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, Play, Package, ShoppingBag, Truck, Users,
  Menu, X, Star, TrendingUp, Palette, Heart, BarChart3,
  Shield, Store, CheckCircle2, Receipt,
  ChevronLeft, ChevronRight, Minus, Plus, Pencil, Shirt , Rocket,
  Camera, Award, ChevronDown, Linkedin, Twitter, Instagram,
} from 'lucide-react';

import junoonilogo    from '/src/assets/junooni_logo_brand_color.png';
import creatorbanner  from '/src/assets/creator-banner-pic.png';
import herobanneritems from '/src/assets/hero-banner-items.png';
import JunooniEarningsSection from './junooniearningsection.tsx';
import LaptopDashboard from './LaptopDashboard.tsx';
import tanishqpic from '/src/assets/tanishq-cover-photo.png';
import shadabpic from '/src/assets/shadab-cover-photo.png';
import communitymerch from '/src/assets/community-merch.png';
import junoonibanner from '/src/assets/junooni-banner.png';
import junoonifulfillment from '/src/assets/junooni-fulfillment.png';
import creatorfulfillment from '/src/assets/creator-fulfillment.png';
import tanishkbagchi from '/src/assets/tanishk-bagchi.png';
import shadabjakati from '/src/assets/shadab-jakati.png';
import varunbudhadev from '/src/assets/varun-budhadev.jpg';
import manansachdeva from '/src/assets/manan-sachdeva.jpeg';
import posters from '/src/assets/posters.webp';
import phone from '/src/assets/phone.webp';
import Mug from '/src/assets/mug.webp';
import tshirt from '/src/assets/t-shirt.webp';
import hoodie from '/src/assets/hoodie.webp';
import bottle from '/src/assets/bottle.webp';
import totebag from '/src/assets/tote-bags.webp';
import cap from '/src/assets/cap.webp';
import junoonibannermobile from '/src/assets/junooni-bannermobile.png';
import communitymerchmobile from '/src/assets/community-merchmobile.png';
import tanishqbagchi from '/src/assets/tanishq-bagchi.png';
import creatorMerchVideo from '/src/assets/creator-merch-video.mp4'; 

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const PRODUCTS = {
  tshirt:  { label: 'T-Shirt',  cost: 350, shipping: 50  },
  hoodie:  { label: 'Hoodie',   cost: 550, shipping: 60  },
  cap:     { label: 'Cap',      cost: 250, shipping: 40  },
  mug:     { label: 'Mug',      cost: 200, shipping: 45  },
  totebag: { label: 'Tote Bag', cost: 180, shipping: 40  },
};

const DEFAULT_PRICES = { tshirt: 999, hoodie: 1299, cap: 699, mug: 499, totebag: 599 };

const CREATOR_CATS = [
  { label: 'Fitness',     emoji: '💪', bg: 'bg-orange-100' },
  { label: 'Comedy',      emoji: '😄', bg: 'bg-yellow-100' },
  { label: 'Gaming',      emoji: '🎮', bg: 'bg-purple-100' },
  { label: 'Kids',        emoji: '🧸', bg: 'bg-pink-100'   },
  { label: 'Lifestyle',   emoji: '✨', bg: 'bg-green-100'  },
  { label: 'Music',       emoji: '🎵', bg: 'bg-blue-100'   },
  { label: 'Art & Design',emoji: '🎨', bg: 'bg-red-100'    },
  { label: 'Motivation',  emoji: '🔥', bg: 'bg-amber-100'  },
  { label: 'Food',        emoji: '🍕', bg: 'bg-lime-100'   },
  { label: 'and Many More',emoji:'🌟', bg: 'bg-indigo-100' },
];

const CREATORS_SPOTLIGHT = [
  {
    name: 'Tanishk Bagchi',
    role: 'Music Producer',
    category: 'MUSIC',
    categoryIcon: '🎵',
    banner: tanishkbagchi,
    products: [tshirt, hoodie, Mug],
    storeUrl: 'https://tanishkbagchi.junooni.com/',
    bg: 'from-orange-900 to-black',
  },
  {
    name: 'Shadab Jakati',
    role: 'Digital Creator',
    category: 'CREATOR',
    categoryIcon: '😊',
    banner: shadabjakati,
    products: [tshirt, cap, Mug],
    storeUrl: 'https://shadabjakati.junooni.com/',
    bg: 'from-yellow-900 to-black',
  },
  {
    name: 'Varun Budhadev',
    role: 'Actor and V Clothing',
    category: 'ACTOR',
    categoryIcon: '🎬',
    banner: varunbudhadev,
    products: [tshirt, hoodie, cap],
    storeUrl: 'https://varunbudhadev.junooni.com/',
    bg: 'from-gray-900 to-black',
  },
];

const CREATORS = [
  { img: tanishkbagchi,  name: 'Music'  },
  { img: shadabjakati,   name: 'Comedy'   },
  { img: varunbudhadev,  name: 'Fitness'  },
  { img: manansachdeva,  name: 'Motivation'  },
];

const MERCH = [
  { label: 'T-Shirts',    img: tshirt  },
  { label: 'Hoodies',     img: hoodie  },
  { label: 'Caps',        img: cap     },
  { label: 'Mugs',        img: Mug     },
  { label: 'Bottles',     img: bottle  },
  { label: 'Tote Bags',   img: totebag },
  { label: 'Wall Art',    img: posters },
  { label: 'Phone Cases', img: phone   },
];

const TESTIMONIALS = [
  { quote: 'Super easy to set up and the team handles everything. My fans love the merch!',
    name: 'Rohit Singh',  role: 'Fitness Creator',  initials: 'RS', color: 'bg-orange-500' },
  { quote: 'Finally a platform that understands creators. Smooth process and amazing quality.',
    name: 'Ananya',       role: 'Gaming Creator',   initials: 'AN', color: 'bg-purple-500' },
  { quote: "My merch never looked this good. Highly recommend Junooni!",
    name: 'Kabir Verma',  role: 'Comedy Creator',   initials: 'KV', color: 'bg-blue-500'   },
];

const FAQS_L = [
  { q: 'Is it really free to start?',       a: 'Yes! Creating your store and listing products on JUNOONI is completely free. You pay nothing until you make a sale.' },
  { q: 'Do I need any technical skills?',   a: 'Not at all. JUNOONI is built for creators — not developers. If you can upload a photo, you can set up your store.' },
  { q: 'How do I get paid?',                a: 'Earnings are transferred directly to your bank account on a regular payout schedule after order fulfillment.' },
  { q: 'Can I design my own products?',     a: 'Yes. Upload your own artwork or use our canvas designer to create something unique.' },
  { q: 'How long does shipping take?',      a: 'Most orders are delivered within 5–7 business days across India.' },
];

const FAQS_R = [
  { q: 'What products can I sell?',                             a: 'T-shirts, hoodies, caps, mugs, bottles, tote bags, phone cases, wall art and more.' },
  { q: 'Can I connect my own domain?',                          a: 'Yes. With Own Store you can connect a custom domain so your fans shop at yourbrand.com.' },
  { q: 'Can I sell on both marketplace and my own store?',      a: 'Absolutely. Most creators use both — Marketplace for discovery and Own Store for brand building.' },
  { q: 'What if there is an issue with my order?',              a: "JUNOONI's customer service team handles all disputes, replacements and refunds end-to-end." },
  { q: 'Is there a minimum order quantity?',                    a: 'No. JUNOONI uses print-on-demand — every item is made to order, so there is no minimum.' },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
const JunooniLandingPage = () => {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [openFaqs,    setOpenFaqs]    = useState({});
  const [product,     setProduct]     = useState('tshirt');
  const [price,       setPrice]       = useState(999);
  const [tIdx,        setTIdx]        = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const navigate = useNavigate();
  const goRegister = () => { window.location.href = '/sign-up'; };
  const goLogin    = () => { navigate({ to: '/sign-in' }); };
  const scrollTo   = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const toggleFaq  = key => setOpenFaqs(p => ({ ...p, [key]: !p[key] }));

  const p          = PRODUCTS[product];
  const fees       = Math.round(price * 0.02 * 1.18);
  const profit     = price - p.cost - p.shipping - fees;

  /* helpers */
  const emojiFor = k =>
    ({ tshirt:'👕', hoodie:'🧥', cap:'🧢', mug:'☕', totebag:'👜' })[k];

  const FaqItem = ({ label, item, idx }) => {
    const key  = `${label}-${idx}`;
    const open = !!openFaqs[key];
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button onClick={() => toggleFaq(key)}
          className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left focus:outline-none">
          <span className="text-sm font-medium text-gray-900">{item.q}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{item.a}</div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen text-gray-900 bg-[#FFF8F0]">

      {/* ══════════════════════════════════════
          NAV
      ══════════════════════════════════════ */}
      <nav className="fixed z-50 w-full border-b border-orange-100/70 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-2">
              <img src={junoonilogo} alt="Junooni" className="h-7 sm:h-8" />
            </button>

            {/* Desktop centre links */}
            <div className="hidden lg:flex items-center gap-6">
              {[
                { label: 'Home',         id: null              },
                { label: 'Features',     id: 'features'        },
                { label: 'How It Works', id: 'how-it-works'    },
                { label: 'Products',     id: 'merch'           },
                { label: 'Pricing',      id: 'earnings'        },
                { label: 'FAQs',         id: 'faq'             },
              ].map(({ label, id }) => (
                <button key={label}
                  onClick={() => id && scrollTo(id)}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-[#e65100] font-medium transition-colors">
                  {label}
                </button>
              ))}
            </div>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-3">
              <button onClick={goLogin} className="text-sm text-gray-600 font-medium hover:text-[#e65100] transition-colors">
                Log In
              </button>
              <Button onClick={goRegister} className="bg-[#e65100] hover:bg-orange-700 text-white text-sm font-semibold">
                Create Your Store <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>

            {/* Mobile hamburger */}
            <button className="md:hidden p-2 rounded-md hover:bg-orange-50" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden py-4 border-t border-orange-100 flex flex-col gap-1 px-2">
              {['Home','Features','How It Works','Products','Pricing','FAQs'].map(label => (
                <button key={label} className="text-left px-3 py-2.5 text-sm text-gray-700 hover:text-[#e65100] hover:bg-orange-50 rounded-lg">
                  {label}
                </button>
              ))}
              <div className="pt-3 border-t border-orange-100 mt-1 space-y-2">
                <Button variant="outline" onClick={goLogin} className="w-full">Log In</Button>
                <Button onClick={goRegister} className="w-full bg-[#e65100] text-white">Create Your Store</Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative pt-2 overflow-hidden bg-[#FFF8F0]">
        {/* Glow blobs */}
        <div className="absolute top-20 right-0 w-[55%] h-[90%] bg-orange-200 rounded-full opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-amber-200 rounded-full opacity-15 blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                        flex flex-col lg:flex-row items-stretch min-h-[calc(100vh-64px)]">

          {/* ── Left 52% ── */}
          <div className="lg:w-[60%] flex flex-col justify-center py-16 lg:py-24 pr-0 lg:pr-8">

            <div className="inline-block self-start mb-5 px-4 py-1.5
                            bg-orange-100 text-[#e65100] text-xs font-bold
                            rounded-full tracking-widest uppercase border border-orange-200">
              Creator Studio
            </div>

            <h1 className="text-[2.8rem] sm:text-5xl lg:text-[3.5rem] xl:text-[4rem]
                          font-black leading-[1.05] mb-5">
              <span className="block text-gray-900">Your Fans.</span>
              <span className="block text-gray-900">Your Merch.</span>
              <span className="block text-[#e65100]">Your Brand.</span>
            </h1>

            <p className="text-gray-600 text-base sm:text-lg mb-8 max-w-md leading-relaxed">
              Launch your official merchandise store in minutes.
              No upfront investment. No inventory. We handle everything
              so you can focus on what you do best — creating.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Button onClick={goRegister} size="lg"
                className="bg-[#e65100] hover:bg-orange-700 text-white px-5 py-5
                          text-base font-bold shadow-lg shadow-orange-200/60 hover:shadow-xl transition-all rounded-xl w-full sm:w-auto">
                Create Your Store <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg"
                onClick={() => scrollTo('how-it-works')}
                className="px-5 py-5 text-base border-gray-300 text-gray-700 rounded-xl
                          hover:border-[#e65100] hover:text-[#e65100] transition-colors w-full sm:w-auto justify-center">
                <span className="w-7 h-7 bg-[#e65100] rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Play className="w-3 h-3 fill-white text-white" />
                </span>
                Watch How It Works
              </Button>
            </div>

            {/* Trust badges — 2 × 2 */}
            <div className="flex gap-4">
              {[
                { icon: Package,     label: 'No Upfront Costs' },
                { icon: ShoppingBag, label: 'Zero Inventory' },
                { icon: Truck,       label: 'End-to-End Fulfillment' },
                { icon: Users,       label: 'Built for Creators' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 w-20">
                  <div className="w-11 h-11 rounded-full bg-white shadow-sm border border-orange-100
                                  flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#e65100]" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right 48% — image fills full height ── */}
          <div className="lg:w-[40%] relative flex items-center justify-center
                          mt-8 lg:mt-0">
            <video
              src={creatorMerchVideo}
              autoPlay
              muted
              loop
              playsInline
              className="relative z-10 w-full h-auto lg:h-full
                        object-contain object-center
                        max-h-[50vh] lg:max-h-none"
            />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
          TRUSTED BY 50+ CREATORS
      ══════════════════════════════════════ */}
      <section className="py-10 sm:py-12 bg-white border-y border-gray-100 overflow-hidden">
        <p className="text-center text-xs sm:text-sm font-semibold text-gray-400
                      uppercase tracking-widest mb-7">
          Trusted by 50+ Creators Across India
        </p>

        {/* Row 1 — scrolls right to left */}
        <div className="relative mb-6">
          <div className="flex gap-8 animate-marquee-left w-max items-center">
            {[...CREATORS, ...CREATORS, ...CREATORS, ...CREATORS].map(({ img, name }, i) => (
              <div key={`r1-${i}`} className="flex items-center gap-3 flex-shrink-0">
                <div className="creator-card">
                  <div className="creator-card-img">
                    <img src={img} alt={name} />
                  </div>
                </div>
                <span className="text-lg font-semibold text-gray-700 whitespace-nowrap">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls left to right */}
        <div className="relative">
          <div className="flex gap-8 animate-marquee-right w-max items-center">
            {[...CREATORS, ...CREATORS, ...CREATORS, ...CREATORS].map(({ img, name }, i) => (
              <div key={`r2-${i}`} className="flex items-center gap-3 flex-shrink-0">
                <div className="creator-card">
                  <div className="creator-card-img">
                    <img src={img} alt={name} />
                  </div>
                </div>
                <span className="text-lg font-semibold text-gray-700 whitespace-nowrap">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-12 sm:py-16 bg-[#FFF8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-10 relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-100 text-[#e65100] text-xs font-bold
                            uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              <span>⭐</span> Creator Spotlight
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-3">
              Your favourite creators.<br />
              <span className="text-[#e65100]">Their world.</span> Your merch.
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              Explore official stores and wear what you love.
            </p>
            {/* View all link */}
            <a href="https://junooni.com/creators"
              className="absolute right-0 top-0 text-[#e65100] text-sm font-semibold
                        flex items-center gap-1 hover:underline hidden sm:flex">
              View all creators <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {CREATORS_SPOTLIGHT.map(({ name, role, category, categoryIcon, banner, products, storeUrl, bg }) => (
              <div key={name}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100
                          hover:shadow-lg transition-all">

                {/* Banner image */}
                <div className={`relative h-64 bg-gradient-to-br ${bg} overflow-hidden`}>
                  <img
                    src={banner}
                    alt={name}
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Category badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm
                                  text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    <span>{categoryIcon}</span>
                    <span>{category}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-extrabold text-gray-900">{name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{role}</p>

                  {/* Product thumbnails */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {products.map((img, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                        <img
                          src={img}
                          alt={`product-${i}`}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                    <Button
                      className="w-full bg-[#e65100] hover:bg-orange-700 text-white font-bold py-3 rounded-xl">
                      Explore Store <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile view all */}
          <div className="text-center mt-6 sm:hidden">
            <a href="https://junooni.com/creators"
              className="text-[#e65100] text-sm font-semibold flex items-center justify-center gap-1">
              View all creators <ArrowRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
          PREMIUM MERCHANDISE
      ══════════════════════════════════════ */}
      <section id="merch" className="py-12 sm:py-16 bg-[#FFF8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Premium Merchandise.{' '}
                <span className="text-[#e65100]">Made for Your Fans.</span>
              </h2>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                Wide range of high-quality, customisable products — all under one roof.
              </p>
            </div>
            <a href="https://cms.junooni.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline"
                className="border-[#e65100] text-[#e65100] whitespace-nowrap flex-shrink-0 self-start sm:self-auto hover:bg-orange-50">
                Explore All Products <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {MERCH.map(({ label, img }) => (
              <div key={label}
                className="flex flex-col items-center gap-3 bg-white rounded-2xl p-5 sm:p-8
                          shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md
                          transition-all cursor-pointer group flex-shrink-0 w-44 sm:w-52">
                <div className="w-36 h-36 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <img
                    src={img}
                    alt={label}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-base text-gray-600 font-medium text-center leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS  (4 steps horizontal)
      ══════════════════════════════════════ */}
      <section id="how-it-works" className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2">
            How It <span className="text-[#e65100]">Works</span>
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mb-12">
            Launch your merch store in 4 simple steps.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative">
            {[
              { icon: Store,   num: '1', title: 'Create Your Store', desc: 'Set up your store in minutes with your name, logo and style.' },
              { icon: Package, num: '2', title: 'Add Products',      desc: 'Choose from our wide range of high-quality merch.' },
              { icon: Rocket,  num: '3', title: 'Start Selling',     desc: 'Share your store with your fans and start getting orders.' },
              { icon: Truck,   num: '4', title: 'We Handle the Rest',desc: 'From production to delivery, we take care of everything.' },
            ].map(({ icon: Icon, num, title, desc }, i) => (
              <div key={i} className="flex flex-col items-center text-center relative">

                {/* Arrow connector — centered on circle */}
                {i < 3 && (
                  <div
                    className="hidden lg:flex absolute items-center justify-center pointer-events-none"
                    style={{
                      top: '48px',
                      left: 'calc(50% + 48px)',
                      width: 'calc(100% - 96px)',
                      transform: 'translateY(-50%)',
                    }}>
                    <ArrowRight className="w-7 h-7 text-[#e65100]" />
                  </div>
                )}

                {/* Big filled orange circle */}
                <div className="relative z-10 w-24 h-24 rounded-full bg-[#e65100]
                                flex items-center justify-center mb-4 shadow-lg shadow-orange-200">
                  <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                </div>

                {/* Number + Title inline */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#e65100] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-black">{num}</span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">{title}</h3>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-[180px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MARKETPLACE OR OWN STORE
      ══════════════════════════════════════ */}
      <section id="paths" className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-3">
            <span className="text-[#e65100]">JUNOONI Fulfillment</span>{' '}
            or{' '}
            <span className="text-purple-600">Creator Fulfillment</span>{' '}
            — you choose
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mb-10 max-w-2xl mx-auto">
            Let JUNOONI handle everything, or use your own fulfillment partner.<br />
            Both ways, you stay in control.
          </p>

          <div className="flex flex-col lg:flex-row items-stretch gap-0 relative lg:divide-x lg:divide-gray-100">

            {/* JUNOONI Fulfillment */}
            <div className="flex-1 flex flex-col rounded-2xl overflow-hidden bg-orange-50 p-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#e65100] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#e65100]">JUNOONI Fulfillment</h3>
                  <p className="text-gray-500 text-sm">We handle printing, packing, and shipping for you.</p>
                </div>
              </div>

              <ul className="space-y-2 mb-5">
                {['Print-on-demand handled by us', 'No inventory needed', 'Quality checked before dispatch', 'We handle everything end-to-end'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-base text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-[#e65100] flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="rounded-xl overflow-hidden border border-orange-100 mb-5 flex-1">
                <img
                  src={junoonifulfillment}
                  alt="JUNOONI Fulfillment Preview"
                  className="w-full object-cover"
                />
              </div>

              <Button
                onClick={goRegister}
                className="bg-[#e65100] hover:bg-orange-700 text-white font-bold w-full py-5 rounded-xl flex items-center justify-center gap-2"
              >
                Use JUNOONI Fulfillment <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* OR divider */}
            <div className="flex lg:flex-col items-center justify-center py-4 lg:py-0 lg:px-0 z-10">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200
                              flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-xs font-extrabold text-gray-500">OR</span>
              </div>
            </div>

            {/* Creator Fulfillment */}
            <div className="flex-1 flex flex-col rounded-2xl overflow-hidden bg-purple-50 p-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-purple-600">Creator Fulfillment</h3>
                  <p className="text-gray-500 text-sm">Use your own fulfillment partner and stay in full control.</p>
                </div>
              </div>

              <ul className="space-y-2 mb-5">
                {['Bring your own fulfillment partner', 'Set your own pricing and margins', 'Full control over production quality', 'Scale on your own terms'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-base text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="rounded-xl overflow-hidden border border-purple-100 mb-5 flex-1">
                <img
                  src={creatorfulfillment}
                  alt="Creator Fulfillment Preview"
                  className="w-full object-cover"
                />
              </div>

              <Button
                onClick={goRegister}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold w-full py-5 rounded-xl flex items-center justify-center gap-2"
              >
                Use Creator Fulfillment <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          EARNINGS CALCULATOR
      ══════════════════════════════════════ */}
      <JunooniEarningsSection />
      

      {/* ══════════════════════════════════════
          YOUR STUDIO. YOUR CONTROL.
      ══════════════════════════════════════ */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold">
              Your Studio.{' '}
              <span className="text-[#e65100]">Your Control.</span>
            </h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Manage everything from one simple dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Dashboard mockup */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-[460px]">
                <LaptopDashboard />
              </div>
            </div>

            {/* Feature list */}
            <div>
              <div className="space-y-5">
                {[
                  { icon: BarChart3, title: 'Track orders in real time',         desc: 'See every order as it comes in — status, customer, amount, all in one place.' },
                  { icon: Receipt,   title: 'View earnings and payouts',          desc: 'Clear payout dashboard with GST-compliant invoices generated automatically.' },
                  { icon: Package,   title: 'Add new products anytime',           desc: 'Upload designs and publish new products to your store in minutes.' },
                  { icon: Heart,     title: 'Launch exclusive drops anytime',            desc: 'Create limited edition collections and special drops to keep your fans excited and engaged.' },
                  { icon: Palette,   title: 'Customize your store settings',      desc: 'Update your banner, bio, links and theme any time you like.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#e65100]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">{title}</h4>
                      <p className="text-gray-500 text-xs sm:text-sm mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={goRegister} className="mt-8 bg-[#e65100] hover:bg-orange-700 text-white font-semibold">
                Explore Your Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          WHY CREATORS CHOOSE JUNOONI
      ══════════════════════════════════════ */}
      <section className="py-12 sm:py-16 bg-[#fefdfd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-10">
            Why Creators Choose{' '}
            <span className="text-[#e65100]">JUNOONI</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Camera,     title: 'Focus on Creating',              desc: 'We handle production, shipping and customer support.' },
              { icon: TrendingUp, title: 'Turn Your Audience Into Income', desc: 'Monetize your brand with official merchandise.' },
              { icon: Award,      title: 'High-Quality Products',          desc: 'Premium materials and vibrant prints your fans will love.' },
              { icon: Shield,     title: 'No Risk, All Opportunity',       desc: 'Start for free, with zero inventory and no hidden costs.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-9 h-9 text-[#e65100]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          LOVED BY CREATORS  (testimonials)
      ══════════════════════════════════════ */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                Loved by <span className="text-[#e65100]">Creators</span>
              </h2>
              <p className="text-gray-500 text-sm sm:text-base mt-1">
                See what creators are saying about their Junooni experience.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setTIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center
                          hover:border-[#e65100] hover:text-[#e65100] transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setTIdx(i => (i + 1) % TESTIMONIALS.length)}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center
                          hover:border-[#e65100] hover:text-[#e65100] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { ...TESTIMONIALS[0], img: tanishqpic },
              { ...TESTIMONIALS[1], img: shadabpic  },
              { ...TESTIMONIALS[2], img: tanishqpic },
            ].map(({ quote, name, role, img }, i) => (
              <div key={i} className="bg-[#FFF8F0] rounded-2xl p-6 border border-orange-100 shadow-sm
                                      flex flex-col justify-between">
                <p className="text-gray-700 text-sm leading-relaxed mb-6">
                  "{quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img src={img} alt={name}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0 border-2 border-orange-100" />
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{name}</div>
                    <div className="text-xs text-gray-500">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#FFF8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-center mb-10">
            How <span className="text-[#e65100]">JUNOONI</span> is Different
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* JUNOONI — highlighted */}
            <div className="rounded-2xl border-2 border-[#e65100] p-6 bg-orange-50">
              <h3 className="text-center font-extrabold text-[#e65100] text-lg mb-6">JUNOONI</h3>
              <div className="space-y-2">
                {[
                  'No upfront fees',
                  'Zero inventory',
                  'End-to-end fulfillment',
                  'Built for creators',
                  'Keep more earnings',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5">
                    <div className="w-6 h-6 rounded-full border-2 border-[#e65100] bg-[#e65100]
                                    flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[10px] font-black">✓</span>
                    </div>
                    <span className="text-sm text-gray-800 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Traditional Merch */}
            <div className="rounded-2xl border border-gray-200 p-6 bg-gray-100">
              <h3 className="text-center font-semibold text-gray-700 text-base mb-6">Traditional Merch</h3>
              <div className="space-y-2">
                {[
                  'High upfront costs',
                  'Manage inventory',
                  'Handle shipping yourself',
                  'Complex setup',
                  'Lower profit margins',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5">
                    <span className="text-gray-600 text-sm flex-shrink-0 font-medium">✕</span>
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Platforms */}
            <div className="rounded-2xl border border-gray-200 p-6 bg-gray-100">
              <h3 className="text-center font-semibold text-gray-700 text-base mb-6">Other Platforms</h3>
              <div className="space-y-2">
                {[
                  'Listing fees or commission',
                  'Limited product range',
                  'Minimal support',
                  'Generic templates',
                  'Less creator control',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5">
                    <span className="text-gray-600 text-sm flex-shrink-0 font-medium">✕</span>
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TURN YOUR COMMUNITY (dark CTA)
      ══════════════════════════════════════ */}
      <section className="overflow-hidden relative min-h-screen sm:min-h-0">
        {/* Desktop background image */}
        <img
          src={communitymerch}
          alt="JUNOONI merch products"
          className="absolute inset-0 w-full h-full object-cover object-center hidden sm:block"
        />
        {/* Mobile background image */}
        <img
          src={communitymerchmobile}
          alt="JUNOONI merch products"
          className="absolute inset-0 w-full h-full object-cover object-top block sm:hidden"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/10 sm:bg-transparent" />

        {/* Content */}
        <div className="relative z-10 px-8 sm:px-12 lg:px-16 py-16 sm:py-20 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3 leading-tight">
            Turn Your Community<br />
            <span className="text-[#e65100]">Into a Movement</span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base mb-7 max-w-md leading-relaxed">
            Join 50+ creators who are already building their official merch stores with Junooni.
            It's free to get started.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={goRegister}
              className="bg-[#e65100] hover:bg-orange-700 text-white font-bold
                        px-6 py-4 text-sm shadow-lg rounded-lg">
              Create Your Store <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowVideo(true)}
              className="border-white/60 text-white hover:bg-white/10 px-6 py-4 text-sm rounded-lg bg-black/30">
              <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                <Play className="w-3 h-3 fill-black text-black" />
              </span>
              Watch Demo
            </Button>
          </div>
        </div>

        {/* YouTube Modal */}
        {showVideo && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowVideo(false)}>
            <div
              className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/60 rounded-full
                          flex items-center justify-center text-white hover:bg-black transition-colors">
                ✕
              </button>
              <iframe
                src="https://www.youtube.com/embed/3RNUXNfmF0E?autoplay=1"
                title="JUNOONI Demo"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </section>
      

      {/* ══════════════════════════════════════
          FAQ  (two-column accordion)
      ══════════════════════════════════════ */}
      <section id="faq" className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-[#e65100]">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              Everything you need to know about starting and growing your merch store on Junooni.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="space-y-2">
              {FAQS_L.map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-orange-100 shadow-sm
                                          hover:shadow-md hover:border-orange-300 transition-all overflow-hidden">
                  <button onClick={() => toggleFaq(`L-${idx}`)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left focus:outline-none">
                    <span className="text-sm font-medium text-gray-900">{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200
                      ${openFaqs[`L-${idx}`] ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaqs[`L-${idx}`] && (
                    <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {FAQS_R.map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-orange-100 shadow-sm
                                          hover:shadow-md hover:border-orange-300 transition-all overflow-hidden">
                  <button onClick={() => toggleFaq(`R-${idx}`)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left focus:outline-none">
                    <span className="text-sm font-medium text-gray-900">{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200
                      ${openFaqs[`R-${idx}`] ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaqs[`R-${idx}`] && (
                    <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          NEWSLETTER / FINAL CTA
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden h-screen sm:h-auto">
        {/* Desktop banner */}
        <img
          src={junoonibanner}
          alt="JUNOONI banner"
          className="absolute inset-0 w-full h-full object-cover object-center hidden sm:block"
        />
        {/* Mobile banner */}
        <img
          src={junoonibannermobile}
          alt="JUNOONI banner"
          className="absolute inset-0 w-full h-full object-cover object-center block sm:hidden"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full h-full min-h-[inherit] py-14 sm:py-20">
          <h2 className="text-2xl sm:text-2xl font-extrabold text-white mb-2">
            Ready to turn ideas into income?
          </h2>
          <p className="text-white/90 text-sm sm:text-sm mb-7">
            Join Junooni today and launch your official merch store in minutes.
          </p>
          <Button onClick={goRegister}
            className="bg-white text-[#e65100] hover:bg-orange-50 font-bold px-6 py-4 text-sm rounded-lg">
            Create Your Store <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="py-10 sm:py-14 bg-[#1B1330] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">

            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <img src={junoonilogo} alt="Junooni" className="h-7 brightness-0 invert" />
                <span className="text-gray-400 text-sm">Creator<br />Studio</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Empowering creators to design, publish and sell high-quality merchandise without inventory hassle.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-sm font-bold mb-4">Platform</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><a href="https://cms.junooni.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Product Catalog</a></li>
                <li><a href="pages/fulfillment-page" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-bold text-white">Fulfillments</a></li>
                <li><a href="pages/creator-store" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Creator Store</a></li>
                <li><a href="https://junooni.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Marketplace</a></li>
              </ul>
            </div>

            {/* Guide */}
            <div>
              <h4 className="text-sm font-bold mb-4">Guide</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><a href="pages/getting-started" className="hover:text-white transition-colors">Getting started</a></li>
                <li><a href="pages/creating-products" className="hover:text-white transition-colors">Creating products</a></li>
                <li><a href="pages/make_your_brand" className="hover:text-white transition-colors">Make your brand</a></li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-sm font-bold mb-4">Social</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><a href="https://instagram.com/junooni" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="https://facebook.com/junooni" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a></li>
                <li><a href="https://youtube.com/@junooni" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Youtube</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-bold mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Career</a></li>
                <li><a href="/pages/privacy" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">For Creators</a></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Junooni. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default JunooniLandingPage;