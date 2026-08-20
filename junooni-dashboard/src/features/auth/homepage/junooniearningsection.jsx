// import React, { useState, useCallback } from 'react';

// const TIERS = [1000, 10000, 50000, 100000, 500000, 1000000, 5000000];
// const LABELS = ['1K', '10K', '50K', '1L', '5L', '10L', '50L'];

// const fmtINR = (v) => '₹' + Math.round(v).toLocaleString('en-IN');
// const fmtYearly = (v) => {
//   if (v >= 10000000) return (v / 10000000).toFixed(1) + ' Cr';
//   if (v >= 100000) return Math.round(v / 100000) + ' L';
//   if (v >= 1000) return Math.round(v / 1000) + 'K';
//   return v;
// };

// const JunooniEarningsSection = () => {
//   const [sliderIndex, setSliderIndex] = useState(3);

//   const followers = TIERS[sliderIndex];
//   const orders = Math.round(followers * 0.00623);
//   const revenue = orders * 900;
//   const profit = Math.round(revenue * 0.9);

//   const handleChange = useCallback((e) => {
//     setSliderIndex(Number(e.target.value));
//   }, []);

//   return (
//     <section
//       id="earnings"
//       style={{
//         padding: '72px 24px',
//         background: '#ffffff',
//       }}
//     >
//       <div style={{ maxWidth: 900, margin: '0 auto' }}>

//         {/* Header */}
//         <div style={{ textAlign: 'center', marginBottom: 56 }}>
//           <div style={{
//             display: 'inline-flex', alignItems: 'center', gap: 6,
//             background: '#FEE8D6', color: '#b84a00',
//             fontSize: 12, fontWeight: 600,
//             padding: '6px 14px', borderRadius: 999,
//             marginBottom: 18,
//           }}>
//             Calculate your potential
//           </div>
//           <h2 style={{
//             fontSize: 'clamp(26px, 4vw, 44px)',
//             fontWeight: 900, color: '#0d0d0d',
//             margin: '0 0 14px', lineHeight: 1.1, letterSpacing: -0.5,
//           }}>
//             How much can you earn?
//           </h2>
//           <p style={{
//             fontSize: 15, color: '#888', margin: 0,
//             lineHeight: 1.65, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto',
//           }}>
//             Move the slider to see your estimated monthly earnings based on your audience size.
//           </p>
//         </div>

//         {/* Calculator card */}
//         <div style={{
//           background: '#FAFAFA',
//           border: '1.5px solid #EFEFEF',
//           borderRadius: 24,
//           padding: '40px 48px',
//         }}>
//           <div style={{
//             display: 'grid',
//             gridTemplateColumns: '1fr 1px 1fr',
//             gap: '0 48px',
//             alignItems: 'center',
//           }}>

//             {/* Left — slider */}
//             <div>
//               <div style={{ fontSize: 13, color: '#aaa', marginBottom: 8, fontWeight: 500, letterSpacing: 0.3 }}>
//                 YOUR FOLLOWERS
//               </div>
//               <div style={{
//                 fontSize: 48, fontWeight: 900,
//                 color: '#0d0d0d', lineHeight: 1,
//                 marginBottom: 28, letterSpacing: -1,
//               }}>
//                 {followers.toLocaleString('en-IN')}
//               </div>

//               <input
//                 type="range"
//                 min="0"
//                 max="6"
//                 step="1"
//                 value={sliderIndex}
//                 onChange={handleChange}
//                 aria-label="Follower count"
//                 style={{
//                   width: '100%',
//                   accentColor: '#c94800',
//                   marginBottom: 10,
//                   cursor: 'pointer',
//                   height: 4,
//                 }}
//               />

//               {/* Tick labels */}
//               <div style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 fontSize: 11,
//                 color: '#bbb',
//                 fontWeight: 500,
//               }}>
//                 {LABELS.map((l, i) => (
//                   <span
//                     key={l}
//                     style={{
//                       color: i === sliderIndex ? '#c94800' : '#bbb',
//                       fontWeight: i === sliderIndex ? 700 : 500,
//                       transition: 'color 0.15s',
//                     }}
//                   >
//                     {l}
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {/* Divider */}
//             <div style={{ background: '#EFEFEF', height: '100%', minHeight: 140 }} />

//             {/* Right — metrics */}
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

//               {/* Monthly profit — hero number */}
//               <div>
//                 <div style={{ fontSize: 12, color: '#aaa', fontWeight: 500, letterSpacing: 0.3, marginBottom: 6 }}>
//                   EST. MONTHLY PROFIT (90% SHARE)
//                 </div>
//                 <div style={{
//                   fontSize: 40, fontWeight: 900,
//                   color: '#c94800', lineHeight: 1,
//                   letterSpacing: -1,
//                 }}>
//                   {fmtINR(profit)}
//                 </div>
//                 <div style={{ fontSize: 13, color: '#bbb', marginTop: 6 }}>
//                   ~₹{fmtYearly(profit * 12)} per year
//                 </div>
//               </div>

//               {/* Orders + Revenue row */}
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//                 <div style={{
//                   background: '#fff',
//                   border: '1.5px solid #EFEFEF',
//                   borderRadius: 12,
//                   padding: '14px 16px',
//                 }}>
//                   <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500, letterSpacing: 0.3, marginBottom: 6 }}>
//                     MONTHLY ORDERS
//                   </div>
//                   <div style={{ fontSize: 22, fontWeight: 700, color: '#0d0d0d' }}>
//                     {orders.toLocaleString('en-IN')}
//                   </div>
//                 </div>
//                 <div style={{
//                   background: '#fff',
//                   border: '1.5px solid #EFEFEF',
//                   borderRadius: 12,
//                   padding: '14px 16px',
//                 }}>
//                   <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500, letterSpacing: 0.3, marginBottom: 6 }}>
//                     GROSS REVENUE
//                   </div>
//                   <div style={{ fontSize: 22, fontWeight: 700, color: '#1a7a5e' }}>
//                     {fmtINR(revenue)}
//                   </div>
//                 </div>
//               </div>

//             </div>
//           </div>
//         </div>

//         {/* Disclaimer */}
//         <p style={{
//           textAlign: 'center', fontSize: 12,
//           color: '#ccc', marginTop: 16, marginBottom: 0,
//         }}>
//           *Estimates based on average conversion rates. Actual results vary.
//         </p>

//       </div>
//     </section>
//   );
// };

// export default JunooniEarningsSection;




// JunooniEarningsSection.jsx
// Qikink-style profit calculator using real JUNOONI catalog pricing from cms.junooni.com
// JunooniEarningsSection.jsx
// Qikink-style profit calculator using real JUNOONI catalog pricing from cms.junooni.com
import React, { useState, useCallback, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import tshirt         from '/src/assets/t-shirt.webp';
import oversizedshirt from '/src/assets/oversized-shirt.webp';
import hoodie         from '/src/assets/hoodie.webp';
import sweatshirt     from '/src/assets/sweatshirt.webp';
import whitemug       from '/src/assets/white-mug.webp';
import blackmug       from '/src/assets/mug.webp';
import bottle         from '/src/assets/bottle.webp';
import phone          from '/src/assets/phone.webp';

// Real base costs from https://cms.junooni.com/products
const PRODUCTS = [
  { label: 'T-Shirt',    img: tshirt,         name: 'Unisex Classic Crew T-Shirt',  base: 210, rec: 499,  tags: ['DTF', 'DTG', 'Embroidery'], minPrice: 250, maxPrice: 1200 },
  { label: 'Oversized',  img: oversizedshirt,  name: 'Unisex Oversized T-Shirt',     base: 295, rec: 649,  tags: ['DTF', 'DTG', 'Embroidery'], minPrice: 350, maxPrice: 1500 },
  { label: 'Hoodie',     img: hoodie,          name: 'Unisex Hoodie',                base: 540, rec: 1199, tags: ['DTF'],                      minPrice: 650, maxPrice: 2500 },
  { label: 'Sweatshirt', img: sweatshirt,      name: 'Unisex Sweatshirt',            base: 430, rec: 999,  tags: ['DTG', 'DTF'],               minPrice: 500, maxPrice: 2000 },
  { label: 'White Mug',  img: whitemug,        name: 'White Coffee Mug',             base: 130, rec: 349,  tags: ['Sublimation'],              minPrice: 180, maxPrice: 800  },
  { label: 'Black Mug',  img: blackmug,        name: 'Black Coffee Mug',             base: 198, rec: 449,  tags: ['Sublimation'],              minPrice: 250, maxPrice: 900  },
  { label: 'Bottle',     img: bottle,          name: 'Steel Water Bottle',           base: 275, rec: 699,  tags: ['Sublimation'],              minPrice: 350, maxPrice: 1500 },
  { label: 'Phone Case', img: phone,           name: 'iPhone Sublimation Case',      base: 120, rec: 349,  tags: ['Sublimation'],              minPrice: 150, maxPrice: 700  },
];

const lerp = (a, b, t) => Math.round(a + (b - a) * t);

const fmtINR = (v) => '₹' + Math.round(v).toLocaleString('en-IN');

const fmtYearly = (v) => {
  if (v >= 10000000) return (v / 10000000).toFixed(1) + ' Cr';
  if (v >= 100000)   return (v / 100000).toFixed(1) + ' L';
  if (v >= 1000)     return Math.round(v / 1000) + 'K';
  return v;
};

export default function JunooniEarningsSection() {
  const [selIdx,        setSelIdx]        = useState(0);
  const [priceSlider,   setPriceSlider]   = useState(60); // 0–100
  const [salesPerDay,   setSalesPerDay]   = useState(10);

  const p = PRODUCTS[selIdx];

  const sellingPrice = useMemo(
    () => lerp(p.minPrice, p.maxPrice, priceSlider / 100),
    [p, priceSlider]
  );

  const orders       = salesPerDay * 30;
  const grossRevenue = orders * sellingPrice;
  const profit       = Math.max(0, Math.round(grossRevenue * 0.9 - orders * p.base));
  const margin       = Math.max(0, Math.round(((sellingPrice - p.base) / sellingPrice) * 100));
  const isNearRec    = Math.abs(sellingPrice - p.rec) < (p.maxPrice - p.minPrice) * 0.12;

  const handleSelectProduct = useCallback((idx) => {
    setSelIdx(idx);
    const prod = PRODUCTS[idx];
    const newSlider = Math.round(((prod.rec - prod.minPrice) / (prod.maxPrice - prod.minPrice)) * 100);
    setPriceSlider(Math.max(0, Math.min(100, newSlider)));
  }, []);

  return (
    <section id="earnings" className="py-16 sm:py-24 bg-[#F7F6F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#FEE8D6] text-[#b84a00] text-xs font-bold px-4 py-2 rounded-full mb-4 tracking-wide">
            🧮 Profit calculator
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            See your profit before you sell
          </h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            Pick a product, set your selling price and daily sales — see exactly how much you make.
          </p>
        </div>

        {/* Product chips */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {PRODUCTS.map((prod, i) => (
            <button
              key={prod.label}
              onClick={() => handleSelectProduct(i)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150
                ${i === selIdx
                  ? 'bg-[#e65100] border-[#e65100] text-white font-bold'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-[#e65100] hover:text-[#e65100]'
                }`}
            >
              {prod.label}
            </button>
          ))}
        </div>

        {/* Main card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

          {/* Top: preview + controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* Left: product preview — light cream bg, large image */}
            <div className="flex flex-col items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
              <div className="w-64 h-64 rounded-2xl overflow-hidden mb-5 flex items-center justify-center bg-white shadow-sm">
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              </div>
              <div className="text-base font-bold text-gray-900 text-center mb-1">{p.name}</div>
              <div className="text-sm font-semibold text-[#e65100] mb-4">Starting from ₹{p.base}</div>
              <div className="flex gap-1.5 flex-wrap justify-center">
                {p.tags.map((t) => (
                  <span key={t} className="text-[10px] font-semibold bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: sliders */}
            <div className="p-8 flex flex-col gap-7">
              <div>
                <div className="text-base font-bold text-gray-900 mb-1">Price and Quantity</div>
                <div className="text-xs text-gray-400 leading-relaxed">
                  Fix the price and daily sales quantity to calculate your monthly profit.
                </div>
              </div>

              {/* Selling price slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Selling price</span>
                  <span className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm font-bold text-gray-900">
                    {fmtINR(sellingPrice)}
                  </span>
                </div>
                <input
                  type="range" min="0" max="100" step="1"
                  value={priceSlider}
                  onChange={(e) => setPriceSlider(Number(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ accentColor: '#e65100', height: 4 }}
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>₹{p.minPrice}</span>
                  {isNearRec && (
                    <span className="text-[#e65100] font-bold bg-[#FEE8D6] px-1.5 py-0.5 rounded-sm">
                      Recommended price
                    </span>
                  )}
                  <span>₹{p.maxPrice}</span>
                </div>

                {/* Margin bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-gray-400">Your margin</span>
                    <span className="text-[11px] font-bold text-[#e65100]">{margin}%</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-[#e65100] rounded-full transition-all duration-200"
                      style={{ width: `${Math.min(margin, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sales per day slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Sales per day</span>
                  <span className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm font-bold text-gray-900">
                    {salesPerDay}
                  </span>
                </div>
                <input
                  type="range" min="1" max="200" step="1"
                  value={salesPerDay}
                  onChange={(e) => setSalesPerDay(Number(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ accentColor: '#e65100', height: 4 }}
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>1/day</span>
                  <span>200/day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profit banner */}
          <div className="bg-[#1a1a1a] px-8 py-5 flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">
                Monthly profit (90% share)
              </div>
              <div className="text-4xl font-black text-white tracking-tight leading-none">
                {fmtINR(profit)}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                ~₹{fmtYearly(profit * 12)} per year
              </div>
            </div>

            <div className="flex gap-8">
              <div>
                <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Monthly orders</div>
                <div className="text-xl font-bold text-white">{orders.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Gross revenue</div>
                <div className="text-xl font-bold text-white">{fmtINR(grossRevenue)}</div>
              </div>
            </div>

            <a
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-[#e65100] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-orange-700 transition-colors whitespace-nowrap"
            >
              Start Selling Free <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-3">
          *Base costs sourced from the JUNOONI catalog. Estimates based on 90% revenue share. Actual results vary.
        </p>
      </div>
    </section>
  );
}