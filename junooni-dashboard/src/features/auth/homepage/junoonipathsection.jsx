import React from 'react';
import { ArrowRight, CheckCircle2, Store, Layers } from 'lucide-react';
import ownstore from '/src/assets/own-store.png';
import marketplacestore from '/src/assets/marketplace-stores.png';

// ─── Marketplace mockup ───────────────────────────────────────────────────────
const MarketplaceMockup = () => (
  <div style={{ background: '#FFF8F0', padding: '18px 18px 0', width: '100%', boxSizing: 'border-box' }}>
    <img
      src={marketplacestore}
      alt="JUNOONI Marketplace preview"
      style={{
        width: '100%',
        display: 'block',
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
        objectFit: 'cover',
        objectPosition: 'top',
      }}
    />
  </div>
);

// ─── Own Store mockup ─────────────────────────────────────────────────────────
const OwnStoreMockup = () => (
  <div style={{ background: '#eee8fd', padding: '18px 18px 0', width: '100%', boxSizing: 'border-box' }}>
    <img
      src={ownstore}
      alt="JUNOONI Own Store preview"
      style={{
        width: '100%',
        display: 'block',
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        objectFit: 'cover',
        objectPosition: 'top',
      }}
    />
  </div>
);

// ─── Main section ─────────────────────────────────────────────────────────────
const JunooniPathsSection = ({ handleRegisterClick }) => {
  return (
    <section id="paths" style={{ padding: '64px 24px 72px', background: '#FFF8F0', position: 'relative', overflow: 'hidden' }}>

      {/* Subtle background blob */}
      <div style={{
        position: 'absolute', bottom: -120, left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(200,100,20,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          {/* Eyebrow pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: '#FEE8D6', color: '#b84a00',
            fontSize: 12.5, fontWeight: 600,
            padding: '7px 16px', borderRadius: 999, marginBottom: 20,
            border: '1px solid rgba(200,100,30,0.15)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
            Two ways to sell, one engine underneath
          </div>

          {/* Main heading with underline accent */}
          <h2 style={{
            fontSize: 'clamp(30px, 5vw, 56px)',
            fontWeight: 900, color: '#0d0d0d',
            lineHeight: 1.05, margin: '0 0 8px',
            letterSpacing: -1,
            position: 'relative', display: 'inline-block',
          }}>
            Marketplace or Own Store — you choose
            {/* Orange underline accent under "you choose" */}
            {/* <svg
              viewBox="0 0 260 14"
              style={{
                position: 'absolute',
                bottom: -8, right: 0,
                width: '38%', height: 'auto',
                overflow: 'visible',
              }}
              preserveAspectRatio="none"
            >
              <path
                d="M4 7 Q 65 2, 130 7 Q 195 12, 256 7"
                stroke="#c94800"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg> */}
          </h2>

          <p style={{
            color: '#666', fontSize: 15.5,
            maxWidth: 580, margin: '20px auto 0',
            lineHeight: 1.7,
          }}>
            Whichever path you pick, JUNOONI still handles production, fulfillment, ops,
            logistics, and customer service. Zero inventory risk either way.
          </p>
        </div>

        {/* ── Two cards ── */}
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60 }}>

          {/* OR badge — centered between cards */}
          <div style={{
            position: 'absolute', left: '50%', top: '44%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            width: 44, height: 44, borderRadius: '50%',
            background: '#fff',
            border: '1.5px solid #ddd',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#888',
            boxShadow: '0 2px 12px rgba(0,0,0,0.09)',
          }}>
            OR
          </div>

          {/* ── LEFT: Marketplace ── */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            background: '#fff',
            border: '1.5px solid #e8ddd6',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}>
            <div style={{ padding: '28px 28px 20px' }}>
              {/* Icon */}
              <div style={{
                width: 50, height: 50, borderRadius: 14,
                background: '#FEE8D6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Store size={24} color="#c94800" />
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>Marketplace</span>
              </div>
              <div style={{ fontSize: 12.5, color: '#bbb', marginBottom: 16, fontWeight: 500 }}>junooni.com</div>

              <div style={{ fontSize: 14.5, fontWeight: 700, color: '#c94800', marginBottom: 10 }}>
                List once, get discovered
              </div>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: '0 0 22px' }}>
                Your products go live inside the JUNOONI marketplace where creator-shoppers are already browsing. Fastest way to your first sale.
              </p>

              {['Live on junooni.com in minutes', 'Built-in discovery & search', 'Starting from 0% commission'].map(pt => (
                <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <CheckCircle2 size={16} color="#c94800" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#333' }}>{pt}</span>
                </div>
              ))}
            </div>

            <div style={{ flex: 1 }} />

            <MarketplaceMockup />

            <button
              onClick={handleRegisterClick}
              style={{
                width: '100%', padding: '18px 20px',
                background: '#e65100', color: '#fff',
                fontSize: 14.5, fontWeight: 700,
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                letterSpacing: 0.1,
              }}
            >
              Start with Marketplace <ArrowRight size={16} />
            </button>
          </div>

          {/* ── RIGHT: Own Store ── */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            background: '#fff',
            border: '1.5px solid #e0d8f5',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}>
            <div style={{ padding: '28px 28px 20px' }}>
              {/* Icon */}
              <div style={{
                width: 50, height: 50, borderRadius: 14,
                background: '#eee8fd',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Layers size={24} color="#5b35c2" />
              </div>

              <div style={{ marginBottom: 2 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>Own Store</span>
              </div>
              <div style={{ fontSize: 12.5, color: '#bbb', marginBottom: 16, fontWeight: 500 }}>yourbrand.com</div>

              <div style={{ fontSize: 14.5, fontWeight: 700, color: '#5b35c2', marginBottom: 10 }}>
                Your brand, your domain
              </div>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: '0 0 22px' }}>
                A fully branded storefront on your own custom domain. Same zero-inventory engine underneath — design, fulfillment, ops, logistics, and customer service, all still on us.
              </p>

              {['Custom domain & branding', 'Full storefront design control', 'Same 90% revenue share'].map(pt => (
                <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <CheckCircle2 size={16} color="#5b35c2" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#333' }}>{pt}</span>
                </div>
              ))}
            </div>

            <div style={{ flex: 1 }} />

            <OwnStoreMockup />

            <button
              onClick={handleRegisterClick}
              style={{
                width: '100%', padding: '18px 20px',
                background: '#e65100', color: '#fff',
                fontSize: 14.5, fontWeight: 700,
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                letterSpacing: 0.1,
              }}
            >
              Start with Own Store <ArrowRight size={16} />
            </button>
          </div>

        </div>{/* end grid */}

        {/* ── Feature strip ── */}
        {/* <div style={{
          marginTop: 20,
          background: '#fff',
          border: '1.5px solid #e8ddd6',
          borderRadius: 16,
          padding: '18px 28px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 14,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          {[
            {
              icon: (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c94800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                  <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                </svg>
              ),
              label: 'Zero inventory risk',
            },
            {
              icon: (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c94800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="1"/>
                  <path d="M16 8h4l3 5v3h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              ),
              label: 'Production & fulfillment',
            },
            {
              icon: (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c94800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z"/>
                </svg>
              ),
              label: 'Customer support & returns',
            },
            {
              icon: (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c94800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                </svg>
              ),
              label: 'Pan-India shipping coverage',
            },
            {
              icon: (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c94800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              ),
              label: '100% operational support',
            },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 11, flex: '1 1 150px' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: '#FEE8D6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {icon}
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#333', lineHeight: 1.3 }}>{label}</span>
            </div>
          ))}
        </div> */}

      </div>
    </section>
  );
};

export default JunooniPathsSection;