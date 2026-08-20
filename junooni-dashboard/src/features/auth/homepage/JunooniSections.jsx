// ─────────────────────────────────────────────────────────────────────────────
// JunooniSections.jsx
// Three sections to paste directly below <JunooniHero /> in JunooniLandingPage.jsx
//
// Usage:
//   import JunooniSections from './JunooniSections';
//   ...
//   <JunooniHero ... />
//   <JunooniSections />
//
// Product carousel images: place your actual product photos in /src/assets/products/
// and update the `src` fields in PRODUCTS below. Until then the emoji fallback shows.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import tshirt   from '/src/assets/t-shirt.webp';
import hoodie   from '/src/assets/hoodie.webp';
import mug      from '/src/assets/mug.webp';
import phone    from '/src/assets/phone.webp';
import posters  from '/src/assets/posters.webp';
import bottle   from '/src/assets/bottle.webp';
import totebags from '/src/assets/tote-bags.webp';

// ── WHY JUNOONI — feature cards ───────────────────────────────────────────────
const WHY_CARDS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#e65100" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="7" width="20" height="16" rx="2" />
        <path d="M9 7V5a5 5 0 0 1 10 0v2" />
        <circle cx="14" cy="15" r="2" fill="#e65100" stroke="none" />
      </svg>
    ),
    title: 'Zero Inventory',
    desc: 'Never buy stock. We print only when you sell.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#e65100" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="14" r="10" />
        <path d="M14 8v6l4 2" />
        <path d="M10 14h4" strokeWidth="1.4" />
      </svg>
    ),
    title: '90% Revenue Share',
    desc: 'You keep what you earn. We grow together.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#e65100" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 14h3l2-7 4 14 3-10 2 3h4" />
      </svg>
    ),
    title: 'We Handle Fulfillment',
    desc: 'From printing to doorstep, we handle it all. You focus on creating.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#e65100" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="9" height="9" rx="1.5" />
        <rect x="15" y="4" width="9" height="9" rx="1.5" />
        <rect x="4" y="15" width="9" height="9" rx="1.5" />
        <rect x="15" y="15" width="9" height="9" rx="1.5" />
      </svg>
    ),
    title: 'Your Brand, Not Ours',
    desc: 'Every creator gets their own premium storefront and identity.',
  },
];

// ── PRODUCTS carousel ─────────────────────────────────────────────────────────
const PRODUCTS = [
  { label: 'T-Shirts',    src: tshirt,   bg: '#1a1a1a' },
  { label: 'Hoodies',     src: hoodie,   bg: '#e8e4de' },
  { label: 'Mugs',        src: mug,      bg: '#1c1c1c' },
  { label: 'Bottles',     src: bottle,   bg: '#1a1a1a' },
  { label: 'Posters',     src: posters,  bg: '#d6cfc8' },
  { label: 'Phone Cases', src: phone,    bg: '#1a1a1a' },
  { label: 'Tote Bags',   src: totebags, bg: '#1c1c1c' },
];

// ── HOW IT WORKS steps ────────────────────────────────────────────────────────
const HOW_STEPS = [
  {
    num: '1',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="10" r="5" />
        <path d="M6 28c0-5.523 4.477-10 10-10s10 4.477 10 10" />
      </svg>
    ),
    title: 'Create Account',
    desc: 'Sign up in minutes and set up your store.',
  },
  {
    num: '2',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="4" width="20" height="24" rx="2" />
        <path d="M16 14v8M12 18h8" />
        <path d="M11 4V2M21 4V2" />
      </svg>
    ),
    title: 'Upload Design',
    desc: 'Add your designs and choose products.',
  },
  {
    num: '3',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="24" height="18" rx="2" />
        <path d="M4 12h24M10 17h4M10 21h6" />
      </svg>
    ),
    title: 'Launch Store',
    desc: 'Your brand store goes live instantly.',
  },
  {
    num: '4',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 10h20M6 10l2-4h16l2 4M6 10l-2 12h24L26 10" />
        <circle cx="12" cy="26" r="2" />
        <circle cx="20" cy="26" r="2" />
      </svg>
    ),
    title: 'Fans Order',
    desc: 'Your fans place orders on your store.',
  },
  {
    num: '5',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="10" width="20" height="16" rx="2" />
        <path d="M6 15h20M10 10V8a6 6 0 0 1 12 0v2" />
      </svg>
    ),
    title: 'We Print & Ship',
    desc: 'We print, pack and ship across India & beyond.',
  },
  {
    num: '6',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="16" r="11" />
        <path d="M16 10v2M16 20v2M11.5 13.5l1.5 1M19 18.5l1.5 1M11.5 18.5l1.5-1M19 13.5l1.5-1" />
        <path d="M13 16a3 3 0 1 0 6 0 3 3 0 0 0-6 0" />
      </svg>
    ),
    title: 'You Get Paid',
    desc: 'You earn. We transfer your earnings.',
  },
];

// ── Section 1: Why Creators Choose JUNOONI ───────────────────────────────────
function WhyJunooni() {
  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-gray-900 mb-10 sm:mb-14">
          Why Creators Choose{' '}
          <span className="text-[#e65100]">JUNOONI</span>
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_CARDS.map((c) => (
            <div
              key={c.title}
              className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-7 hover:border-orange-200 hover:shadow-md transition-all duration-200 group"
            >
              {/* Icon circle */}
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                {c.icon}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{c.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 2: Premium Merchandise carousel ───────────────────────────────────
function PremiumMerchandise() {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  return (
    <section className="py-14 sm:py-10 ">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-gray-900 mb-10 sm:mb-14">
          Premium Merchandise.{' '}
          <span className="text-[#e65100]">Made for Your Fans.</span>
        </h2>

        {/* Carousel wrapper */}
        <div className="relative">
          {/* Left arrow */}
          <button
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:border-orange-300 hover:text-[#e65100] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Scrollable track */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {PRODUCTS.map((p) => (
              <div
                key={p.label}
                className="flex-shrink-0 flex flex-col items-center gap-3 cursor-pointer group"
                style={{ width: 160 }}
              >
                {/* Card — image covers full tile, no padding, bg is fallback colour */}
                <div
                  className="w-full rounded-2xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]"
                  style={{ height: 200, background: p.bg }}
                >
                  <img
                    src={p.src}
                    alt={p.label}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      display: 'block',
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-800">{p.label}</span>
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:border-orange-300 hover:text-[#e65100] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* CTA */}
        {/* <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 mb-4">And many more products — new ones added regularly.</p>
          <a
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-[#e65100] text-white font-bold text-base px-8 py-3.5 rounded-xl hover:bg-orange-700 transition-colors"
          >
            Start Designing Now <ArrowRight className="w-4 h-4" />
          </a>
        </div> */}
      </div>
    </section>
  );
}

// ── Section 3: How It Works ───────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section id="how-it-works" className="py-14 sm:py-20 bg-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-gray-900 mb-12 sm:mb-16">
          How It Works
        </h2>

        {/* Steps row — horizontal on desktop, stacked 2-col on mobile */}
        <div className="relative">
          {/* Dashed connector line — desktop only */}
          <div
            className="hidden lg:block absolute top-[38px] left-[10%] right-[10%] h-px"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to right, #e65100 0, #e65100 8px, transparent 8px, transparent 18px)',
              opacity: 0.35,
            }}
          />

          <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 lg:gap-x-2">
            {HOW_STEPS.map((s, i) => (
              <div key={s.title} className="flex flex-col items-center text-center relative">
                {/* Circle */}
                <div className="relative mb-4">
                  <div
                    className="w-[72px] h-[72px] rounded-full border-2 border-dashed border-[#e65100] flex items-center justify-center bg-white text-[#e65100] transition-all hover:bg-orange-50"
                    style={{ borderStyle: 'dashed', borderSpacing: '6px' }}
                  >
                    {s.icon}
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#e65100] text-white text-[10px] font-black flex items-center justify-center shadow">
                    {s.num}
                  </div>
                  {/* Arrow between steps — desktop inline */}
                  {i < HOW_STEPS.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 left-full items-center" style={{ width: 'calc(100% - 72px)', marginLeft: 4 }}>
                      {/* intentionally empty — dashed line is the bg rule above */}
                    </div>
                  )}
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">{s.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[110px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        {/* <div className="mt-12 text-center">
          <a
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-[#e65100] text-white font-bold text-base px-8 py-3.5 rounded-xl hover:bg-orange-700 transition-colors"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </a>
          <p className="mt-3 text-xs text-gray-400">No credit card required · Starting from 0% commission</p>
        </div> */}
      </div>
    </section>
  );
}

// ── Combined export ───────────────────────────────────────────────────────────
export default function JunooniSections() {
  return (
    <>
      <WhyJunooni />
      <PremiumMerchandise />
      <HowItWorks />
    </>
  );
}