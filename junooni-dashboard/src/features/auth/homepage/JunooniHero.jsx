// ─────────────────────────────────────────────────────────────────────────────
// JunooniHero.jsx  — drop-in replacement for the <header> block.
// Replace the old <header>…</header> with:
//   <JunooniHero onRegister={handleRegisterClick} onScrollPaths={() => scrollTo('paths')} />
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import herobanneritems from '/src/assets/hero-banner-items.png';

const BRAND = '#e65100';

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard',  label: 'Dashboard',  icon: '⊞' },
  { id: 'products',   label: 'Products',   icon: '◻' },
  { id: 'orders',     label: 'Orders',     icon: '📋' },
  { id: 'mystore',    label: 'My Store',   icon: '🏪' },
  { id: 'membership', label: 'Membership', icon: '👑' },
];

// ── Shared tiny badge ─────────────────────────────────────────────────────────
const Badge = ({ type, children }) => {
  const map = {
    pending:   'bg-orange-50 text-orange-600 border border-orange-200',
    paid:      'bg-green-50 text-green-700 border border-green-200',
    published: 'bg-green-50 text-green-700',
    proposed:  'bg-purple-50 text-purple-700',
    draft:     'bg-gray-100 text-gray-400',
    cod:       'bg-orange-50 text-orange-600 border border-orange-200',
  };
  return (
    <span className={`inline-flex items-center gap-[1px] text-[5.5px] px-[3px] py-[1px] rounded font-medium whitespace-nowrap ${map[type] ?? 'bg-gray-100 text-gray-500'}`}>
      {(type === 'pending' || type === 'cod') && <span className="text-[4px]">⏱</span>}
      {type === 'paid' && <span className="text-[4px]">💳</span>}
      {children}
    </span>
  );
};

// ── Shared metric card (matches real dashboard cards) ─────────────────────────
const MetricCard = ({ label, value, sub, icon, iconBg, valueColor, highlight }) => (
  <div className={`bg-white rounded border flex items-center justify-between px-1.5 py-1 ${highlight ? 'border-orange-200' : 'border-gray-100'}`}>
    <div>
      <div className="text-[5.5px] text-gray-400 font-medium mb-0.5 leading-tight">{label}</div>
      <div className={`text-[11px] font-black leading-none ${valueColor ?? 'text-gray-900'}`}>{value}</div>
      {sub && <div className="text-[5.5px] text-gray-400 mt-0.5 leading-tight">{sub}</div>}
    </div>
    {icon && (
      <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] flex-shrink-0 ${iconBg ?? 'bg-orange-50'}`}>
        {icon}
      </div>
    )}
  </div>
);

// ── Top nav bar ───────────────────────────────────────────────────────────────
const TopBar = ({ items, active, cta, breadcrumb }) => (
  <div className="bg-white border-b border-gray-100 px-2 py-[3px] flex items-center justify-between flex-shrink-0" style={{ minHeight: 18 }}>
    <div className="flex items-center gap-2">
      {breadcrumb ? (
        <div className="flex items-center gap-1.5">
          {breadcrumb.map((b, i) => (
            <span key={b.label} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-300 text-[6px]">·</span>}
              <span className={`text-[6.5px] ${b.active ? 'text-[#e65100] font-bold' : 'text-gray-400'}`}>{b.label}</span>
            </span>
          ))}
        </div>
      ) : (
        items?.map((item) => (
          <span
            key={item}
            className={`text-[6.5px] font-medium ${item === active ? 'text-[#e65100] font-bold' : 'text-gray-400'}`}
          >
            {item}
          </span>
        ))
      )}
    </div>
    <div className="flex items-center gap-1.5">
      {cta && (
        <button className="bg-[#e65100] text-white text-[6px] font-bold px-1.5 py-[2px] rounded">
          {cta}
        </button>
      )}
      <div className="w-3.5 h-3.5 rounded-full bg-[#e65100] text-white text-[6px] font-bold flex items-center justify-center flex-shrink-0">
        M
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: Dashboard
// ─────────────────────────────────────────────────────────────────────────────
function PageDashboard() {
  const orders = [
    { id: '#JUSPV', name: 'Customer', amt: '₹111', items: '1 item' },
    { id: '#MDM3J', name: 'Customer', amt: '₹111', items: '1 item' },
    { id: '#GG24T', name: 'Customer', amt: '₹111', items: '1 item' },
    { id: '#8F0IM', name: 'Customer', amt: '₹412', items: '2 items' },
    { id: '#O7OQ9', name: 'Customer', amt: '₹126', items: '1 item' },
  ];
  const products = [
    { name: 'Junooni Party wear',   color: '#b5c0c5' },
    { name: 'Junooni Merchandise',  color: '#c4813f' },
    { name: 'CREATOR IMPERSONATER', color: '#b05c34' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <TopBar
        items={['Dashboard', '⊕ Both stores', 'Products', 'Orders', 'Help']}
        active="Dashboard"
        cta="+ Add Product"
      />

      <div className="flex flex-col gap-1.5 px-2 py-1.5 flex-1 overflow-hidden">
        <div>
          <div className="text-[9px] font-black text-gray-900 leading-tight">Good Afternoon, Creator!</div>
          <div className="text-[5.5px] text-gray-400 leading-tight mt-[1px]">Welcome to your JUNOONI dashboard. Here's an overview of your store performance.</div>
        </div>

        <div className="grid grid-cols-4 gap-1">
          <MetricCard label="Today's Revenue"  value="₹0"   sub="0 orders today"    icon="📈" iconBg="bg-orange-50" />
          <MetricCard label="Revenue (Last 5)" value="₹872" sub="5 recent orders"   icon="💳" iconBg="bg-green-50" />
          <MetricCard label="Pending Orders"   value="5"    sub="In last 5 orders"  icon="⏱" iconBg="bg-amber-50" />
          <MetricCard label="Your Products"    value="3"    sub="Recently added"    icon="📦" iconBg="bg-indigo-50" />
        </div>

        <div className="grid grid-cols-2 gap-1.5 flex-1 min-h-0">
          <div className="bg-white border border-gray-100 rounded p-1.5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1">
                <span className="text-[7px] text-[#e65100]">⊙</span>
                <span className="text-[7px] font-bold text-gray-900">Recent Orders</span>
              </div>
              <span className="text-[5.5px] text-[#e65100] font-semibold">View All</span>
            </div>
            <div className="text-[5.5px] text-gray-400 mb-1">Latest orders containing your products</div>
            <div className="flex flex-col gap-[2px] overflow-hidden flex-1">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center gap-1 py-[2px] border-b border-gray-50 last:border-0">
                  <div className="w-3 h-3 rounded bg-gray-100 flex items-center justify-center text-[6px] flex-shrink-0">📦</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[6px] leading-tight">
                      <span className="text-[#e65100] font-bold">{o.id}</span>
                      <span className="text-gray-400"> · {o.name}</span>
                    </div>
                    <div className="flex gap-0.5 mt-[1px]">
                      <Badge type="pending">Pending</Badge>
                      <Badge type="paid">Paid</Badge>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[6.5px] font-bold text-gray-800">{o.amt}</div>
                    <div className="text-[5px] text-gray-400">{o.items}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 overflow-hidden">
            <div className="bg-white border border-gray-100 rounded p-1.5">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1">
                  <span className="text-[7px] text-[#e65100]">⊙</span>
                  <span className="text-[7px] font-bold text-gray-900">Your Products</span>
                </div>
                <span className="text-[5.5px] text-[#e65100] font-semibold">View All</span>
              </div>
              <div className="text-[5.5px] text-gray-400 mb-1">Recently added products to your store</div>
              {products.map((p) => (
                <div key={p.name} className="flex items-center gap-1 py-[2px] border-b border-gray-50 last:border-0">
                  <div className="w-3.5 h-3.5 rounded flex items-center justify-center text-[7px] flex-shrink-0" style={{ background: p.color + '33' }}>
                    <span style={{ filter: 'grayscale(0)' }}>👕</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[6px] font-semibold text-gray-700 truncate">{p.name}</div>
                    <div className="text-[5.5px] text-[#e65100] font-semibold">Published</div>
                  </div>
                  <span className="text-[8px] text-gray-300 flex-shrink-0">›</span>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-100 rounded p-1.5 flex-1">
              <div className="text-[7px] font-bold text-gray-900 mb-0.5">Quick Actions</div>
              <div className="text-[5.5px] text-gray-400 mb-1">Common tasks to manage your store</div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { icon: '+', label: 'Add Product',  bg: 'bg-orange-50 border border-orange-100', tc: 'text-[#e65100]' },
                  { icon: '📋', label: 'View Orders', bg: 'bg-gray-50 border border-gray-100',     tc: 'text-gray-600' },
                  { icon: '⚙', label: 'Settings',    bg: 'bg-gray-50 border border-gray-100',     tc: 'text-gray-600' },
                  { icon: '🏪', label: 'Store mode',  bg: 'bg-gray-50 border border-gray-100',     tc: 'text-gray-600' },
                ].map((q) => (
                  <div key={q.label} className={`${q.bg} rounded py-1.5 flex flex-col items-center justify-center cursor-pointer`}>
                    <div className="text-[8px] mb-[1px]">{q.icon}</div>
                    <div className={`text-[5.5px] font-semibold ${q.tc}`}>{q.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: Products
// ─────────────────────────────────────────────────────────────────────────────
function PageProducts() {
  const rows = [
    { name: 'Junooni Party wear',                        status: 'published', date: 'Feb 23, 2026', color: '#b5c0c5' },
    { name: 'Junooni Merchandise',                       status: 'published', date: 'Mar 01, 2026', color: '#c4813f' },
    { name: 'CREATOR IMPERSONATER',                      status: 'published', date: 'Mar 07, 2026', color: '#b05c34' },
    { name: 'basic creaTOR IMPERSONATE TEST',            status: 'published', date: 'Mar 07, 2026', color: '#a3785e' },
    { name: 'IMPERONATE creaTOR - TEST FOR IMPERSONATEING - Basic T-Shirt PC', status: 'proposed', date: 'Mar 07, 2026', color: '#e8d5c4' },
    { name: 'Junooni Basic Teeee 6669',                  status: 'published', date: 'Mar 12, 2026', color: '#b5c4d4' },
    { name: 'Junooni Basic Teeee 893',                   status: 'proposed', date: 'Mar 12, 2026',  color: '#c4b5d4' },
    { name: 'Junooni Basic Teeee 89432',                 status: 'published', date: 'Mar 20, 2026', color: '#d4c4b5' },
    { name: 'Junooni Basic Teeee 78432',                 status: 'published', date: 'Mar 30, 2026', color: '#c9a96e' },
    { name: 'Junooni Basic Teeee',                       status: 'proposed', date: 'Mar 31, 2026',  color: '#c4813f' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <TopBar items={['Dashboard', 'Products', 'Orders', 'Help']} active="Products" cta="Add Product" />

      <div className="flex flex-col gap-1.5 px-2 py-1.5 flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] font-black text-gray-900">Your Products</div>
            <div className="text-[5.5px] text-gray-400">Manage your product inventory and listings</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1">
          <MetricCard label="Total Products" value="63" icon="📦" iconBg="bg-orange-50" valueColor="text-gray-900" />
          <MetricCard label="Published"      value="18" icon="✅" iconBg="bg-green-50"  valueColor="text-gray-900" />
          <MetricCard label="Draft"          value="2"  icon="⏸" iconBg="bg-amber-50"  valueColor="text-gray-900" />
          <MetricCard label="Categories"     value="1"  icon="🏷" iconBg="bg-blue-50"   valueColor="text-gray-900" />
        </div>

        <div className="bg-white border border-gray-100 rounded p-1.5 flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center gap-1 mb-1.5">
            <div className="w-4 h-4 bg-orange-50 rounded-full flex items-center justify-center text-[7px] flex-shrink-0">
              <span className="text-[#e65100]">⊙</span>
            </div>
            <div>
              <div className="text-[7px] font-bold text-[#e65100]">Product Management</div>
              <div className="text-[5.5px] text-gray-300">Manage 63 products</div>
            </div>
          </div>

          <div className="grid items-center border-b border-gray-100 pb-[3px] mb-[2px]"
            style={{ gridTemplateColumns: '16px 1fr 42px 54px' }}>
            <div className="text-[5.5px] text-gray-400 font-semibold">Image</div>
            <div className="text-[5.5px] text-gray-400 font-semibold">Product Name</div>
            <div className="text-[5.5px] text-gray-400 font-semibold">Status</div>
            <div className="text-[5.5px] text-gray-400 font-semibold text-right">Created At</div>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden">
            {rows.map((r) => (
              <div key={r.name + r.date}
                className="grid items-center py-[2px] border-b border-gray-50 last:border-0"
                style={{ gridTemplateColumns: '16px 1fr 42px 54px' }}>
                <div
                  className="w-3 h-3 rounded flex items-center justify-center text-[6px] flex-shrink-0"
                  style={{ background: r.color + '44' }}
                >
                  👕
                </div>
                <div className="text-[6px] text-gray-700 font-medium pr-1 truncate">{r.name}</div>
                <div>
                  <span className={`text-[5.5px] font-medium px-[3px] py-[1px] rounded ${
                    r.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'
                  }`}>{r.status}</span>
                </div>
                <div className="text-[5.5px] text-gray-400 text-right">{r.date}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-100">
            <div className="text-[5.5px] text-gray-400">Showing 1 to 10 of 63 results</div>
            <div className="flex items-center gap-[2px]">
              <span className="text-[6px] text-gray-300">‹</span>
              {['1','2','3','4','…','7'].map((p, i) => (
                <div key={p+i} className={`w-3 h-3 rounded text-[5.5px] flex items-center justify-center font-semibold ${
                  p === '1' ? 'bg-[#e65100] text-white' : 'bg-gray-100 text-gray-500'
                }`}>{p}</div>
              ))}
              <span className="text-[6px] text-gray-300">›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: Orders
// ─────────────────────────────────────────────────────────────────────────────
function PageOrders() {
  const rows = [
    { id: '#D7OQ9', customer: 'Customer', items: 1, date: '7 Aug 2026',  total: '₹126.07', pay: 'COD' },
    { id: '#8F0IM', customer: 'Customer', items: 2, date: '6 Aug 2026',  total: '₹412.33', pay: 'COD' },
    { id: '#GG24T', customer: 'Customer', items: 1, date: '30 Jul 2026', total: '₹111.36', pay: 'COD' },
    { id: '#MDM3J', customer: 'Customer', items: 1, date: '30 Jul 2026', total: '₹111.36', pay: 'COD' },
    { id: '#JUSPV', customer: 'Customer', items: 1, date: '30 Jul 2026', total: '₹111.36', pay: 'COD' },
    { id: '#BT2R9', customer: 'Customer', items: 1, date: '30 Jul 2026', total: '₹111.36', pay: 'COD' },
    { id: '#UR4BL', customer: 'Customer', items: 1, date: '30 Jul 2026', total: '₹111.36', pay: 'COD' },
    { id: '#IEBC4', customer: 'Customer', items: 1, date: '30 Jul 2026', total: '₹111.36', pay: 'COD' },
    { id: '#E12U0', customer: 'Customer', items: 1, date: '29 Jul 2026', total: '₹94.84',  pay: 'Paid' },
    { id: '#JP0FL', customer: 'Customer', items: 1, date: '29 Jul 2026', total: '₹111.36', pay: 'COD' },
    { id: '#HOR7P', customer: 'Customer', items: 1, date: '22 Jul 2026', total: '₹161.36', pay: 'COD' },
    { id: '#0WI3Y', customer: 'Customer', items: 1, date: '22 Jul 2026', total: '₹111.36', pay: 'COD' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <TopBar items={['Dashboard', 'Products', 'Orders', 'Help']} active="Orders" />

      <div className="flex flex-col gap-1 px-2 py-1 flex-1 overflow-hidden">
        <div>
          <div className="text-[9px] font-black text-gray-900">Your Orders</div>
          <div className="text-[5.5px] text-[#e65100]">View and track orders containing your products</div>
        </div>

        <div className="grid grid-cols-4 gap-1">
          <MetricCard label="Today's Orders"      value="0"    sub="Revenue: ₹0.00"           icon="📦" iconBg="bg-orange-50" />
          <MetricCard label="Pending Orders"      value="17"   sub="Your products to fulfill" icon="⏱" iconBg="bg-amber-50" valueColor="text-amber-600" />
          <MetricCard label="Creator Fulfillment" value="0"    sub="Products to fulfill"      icon="📬" iconBg="bg-blue-50" />
          <MetricCard label="Your Revenue (7d)"   value="₹538" sub="From 2 orders"            icon="💳" iconBg="bg-green-50" valueColor="text-green-700" />
        </div>

        <div className="flex items-center gap-[2px] bg-gray-100 rounded p-[2px]">
          {[
            { label: 'All Orders',          cnt: '20', active: true,  cntBg: 'bg-[#e65100]' },
            { label: 'Pending',             cnt: '17', cntBg: 'bg-[#e65100]' },
            { label: 'Creator Fulfillment', cnt: '0',  cntBg: 'bg-gray-400' },
            { label: 'Shipped',             cnt: '0',  cntBg: 'bg-gray-400' },
            { label: 'Completed',           cnt: '3',  cntBg: 'bg-green-600' },
            { label: 'Cancelled',           cnt: '0',  cntBg: 'bg-gray-400' },
          ].map((t) => (
            <div key={t.label}
              className={`flex items-center gap-[2px] text-[5.5px] px-1 py-[1.5px] rounded cursor-pointer font-medium ${t.active ? 'bg-white text-gray-800 font-bold shadow-sm' : 'text-gray-500'}`}
            >
              {t.label}
              <span className={`${t.cntBg} text-white text-[4.5px] px-[2.5px] py-[0.5px] rounded-full font-bold leading-tight`}>{t.cnt}</span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded px-1.5 py-[2px] flex items-center gap-1">
          <span className="text-gray-300 text-[7px]">🔍</span>
          <span className="text-[5.5px] text-gray-300">Search orders by ID, customer name, or email...</span>
          <div className="ml-auto flex items-center gap-1">
            <span className="text-[5.5px] text-gray-400 border border-gray-200 rounded px-1 py-[1px]">📅 Select Date</span>
            <span className="text-[5.5px] text-gray-400 border border-gray-200 rounded px-1 py-[1px]">Status ▾</span>
            <span className="text-[5.5px] text-gray-400 border border-gray-200 rounded px-1 py-[1px]">Payment ▾</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded p-1.5 flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 bg-[#e65100] rounded flex items-center justify-center text-[6px]">📋</div>
              <div>
                <div className="text-[7px] font-bold text-gray-900">Your Orders</div>
                <div className="text-[5.5px] text-gray-400">Showing 20 of 62 orders with your products</div>
              </div>
            </div>
            <div className="text-[5.5px] text-[#e65100] font-semibold flex items-center gap-0.5">
              <span>⬇</span> Export Page
            </div>
          </div>

          <table className="w-full" style={{ tableLayout: 'fixed', borderCollapse: 'collapse' }}>
            <colgroup>
              <col style={{ width: '32px' }} />
              <col style={{ width: '48px' }} />
              <col style={{ width: '60px' }} />
              <col style={{ width: '18px' }} />
              <col style={{ width: '40px' }} />
              <col style={{ width: '36px' }} />
              <col style={{ width: '28px' }} />
              <col style={{ width: '28px' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-100">
                {['Order #', 'Customer', 'Email', 'Items', 'Date', 'Total', 'Status', 'Payment'].map((h) => (
                  <th key={h} className="text-left text-[5.5px] font-bold text-gray-400 pb-[3px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="text-[6px] text-[#e65100] font-bold py-[2px]">{r.id}</td>
                  <td className="text-[6px] text-gray-700 py-[2px] truncate">{r.customer}</td>
                  <td className="text-[5.5px] text-gray-400 py-[2px] truncate">ddigicloud@gmail.com</td>
                  <td className="text-[6px] text-gray-700 py-[2px] text-center">{r.items}</td>
                  <td className="text-[5.5px] text-[#e65100] py-[2px] truncate">{r.date}</td>
                  <td className="text-[6px] text-gray-800 font-semibold py-[2px]">{r.total}</td>
                  <td className="py-[2px]"><Badge type="pending">Pending</Badge></td>
                  <td className="py-[2px]">
                    {r.pay === 'Paid'
                      ? <Badge type="paid">Paid</Badge>
                      : <Badge type="cod">COD</Badge>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: My Store
// ─────────────────────────────────────────────────────────────────────────────
function PageMyStore() {
  const options = [
    { icon: '🎨', bg: 'bg-purple-50', title: 'Store Editor',       desc: 'Design your store layout, hero section, product grid & more', arrow: true },
    { icon: '✦',  bg: 'bg-pink-50',   title: 'Branding & Identity', desc: 'Upload logo, choose colors, add tagline & announcement',       arrow: false },
    { icon: '📄', bg: 'bg-blue-50',   title: 'Custom Pages',        desc: 'Create custom pages like About Us, FAQ, Shipping, Returns & more', arrow: true },
    { icon: '🌐', bg: 'bg-green-50',  title: 'Domain & SEO',        desc: 'Connect custom domain and optimise your store for search engines', arrow: false },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <div className="bg-white border-b border-gray-100 px-2 py-[3px] flex items-center justify-between flex-shrink-0" style={{ minHeight: 18 }}>
        <div className="flex items-center gap-1.5">
          <span className="text-[6.5px] font-semibold text-gray-800">My Store</span>
          <span className="text-[5.5px] bg-green-50 text-green-700 px-1 py-[1px] rounded-full font-bold">● Live</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="bg-[#e65100] text-white text-[5.5px] font-bold px-1.5 py-[2px] rounded flex items-center gap-0.5">
            <span>🏪</span> Store editor
          </button>
          <div className="w-3.5 h-3.5 rounded-full bg-[#e65100] text-white text-[6px] font-bold flex items-center justify-center">M</div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 px-2 py-1.5 flex-1 overflow-hidden">
        <div className="relative rounded overflow-hidden flex-shrink-0" style={{ background: '#fff5ee', border: '1px solid #ffd4b0', minHeight: 72 }}>
          <div className="p-1.5 pr-24 relative z-10">
            <div className="inline-flex items-center gap-0.5 bg-green-50 text-green-700 text-[5px] font-bold px-1 py-[1px] rounded-full mb-0.5">
              📍 You're Live!
            </div>
            <div className="text-[9px] font-black text-gray-900 leading-tight mb-[2px]">You're live, Creator!</div>
            <div className="text-[5.5px] text-[#e65100] font-semibold mb-1">Your fans can shop your awesome products now 🚀</div>
            <div className="text-[5.5px] text-[#e65100] underline mb-1">Creatorhandle.junooni.com</div>
            <div className="flex gap-1">
              <span className="text-[5px] border border-gray-300 text-gray-600 rounded px-1 py-[1px]">⊙ Preview Store</span>
              <span className="text-[5px] border border-gray-300 text-gray-600 rounded px-1 py-[1px]">⊘ Unpublish Store</span>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-end pr-1 overflow-hidden">
            <div className="flex items-end gap-0.5 opacity-70">
              <div className="text-2xl">👜</div>
              <div className="text-xl">☕</div>
              <div className="text-2xl">🎙</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[7.5px] font-black text-gray-900 mb-[1px]">Customize Your Store</div>
          <div className="text-[5.5px] text-gray-400 mb-1">Make your store truly yours with powerful customization options</div>
          <div className="grid grid-cols-2 gap-1">
            {options.map((o) => (
              <div key={o.title}
                className="bg-white border border-gray-100 rounded p-1.5 flex items-start gap-1 cursor-pointer">
                <div className={`w-4 h-4 ${o.bg} rounded flex items-center justify-center text-[8px] flex-shrink-0`}>{o.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-[6.5px] font-bold text-gray-800">{o.title}</div>
                    {o.arrow && <span className="text-gray-300 text-[8px]">›</span>}
                  </div>
                  <div className="text-[5px] text-gray-400 leading-tight">{o.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded p-1.5 flex items-center gap-1.5">
          <span className="text-[8px] flex-shrink-0">👑</span>
          <div className="text-[5.5px] text-amber-800 font-medium flex-1 leading-tight">
            <span className="font-bold text-[#e65100]">Unlock your full store potential</span> — Remove Junooni branding, connect a custom domain, and get priority payouts.
          </div>
          <button className="bg-[#e65100] text-white text-[5.5px] font-bold px-1.5 py-1 rounded flex-shrink-0 flex items-center gap-0.5">
            <span>🏆</span> View plans
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: Membership
// ─────────────────────────────────────────────────────────────────────────────
function PageMembership() {
  const plans = [
    {
      icon: '🔥', name: 'Free', tagline: 'Get started for free', price: 'Free',
      features: [
        'Up to 10 products', 'Junooni subdomain', 'Store stays in Draft',
        'Junooni branding on store', 'Standard payouts (T+7)', 'Email support',
      ],
      featureOk: [true, true, false, false, true, true],
      btnLabel: 'Current plan ›', btnClass: 'bg-[#e65100] text-white',
    },
    {
      icon: '⚡', name: 'Starter', tagline: 'For growing creators', price: '₹899', priceSub: '/mo',
      active: true,
      features: [
        'Up to 50 products', 'Store goes live', 'No Junooni branding',
        'Custom domain', 'Standard payouts (T+7)', 'Priority email support',
      ],
      featureOk: [true, true, true, true, true, true],
      btnLabel: 'Current plan', btnClass: 'bg-gray-100 text-gray-400 border border-gray-200',
    },
    {
      icon: '🏢', name: 'Enterprise', tagline: 'Custom for large teams', price: 'Custom',
      features: [
        'Everything in Pro', 'White label options', 'Custom contract & pricing',
        'Dedicated account manager', 'SLA guarantee', 'Phone & WhatsApp support',
      ],
      featureOk: [true, true, true, true, true, true],
      btnLabel: 'Contact us', btnClass: 'bg-white text-[#e65100] border border-[#e65100]',
    },
  ];

  const compRows = [
    { feature: 'Products',              free: '10', starter: '50', enterprise: 'Unlimited' },
    { feature: 'Store live',            free: '—',  starter: '✓',  enterprise: '✓' },
    { feature: 'Custom domain',         free: '—',  starter: '—',  enterprise: '✓' },
    { feature: 'Remove Junooni branding', free: '—', starter: '✓', enterprise: '✓' },
    { feature: 'Priority payouts',      free: '—',  starter: '—',  enterprise: '✓' },
    { feature: 'Support',               free: 'Email', starter: 'Priority email', enterprise: 'Phone + WhatsApp' },
    { feature: 'Price/month',           free: 'Free', starter: '₹899', enterprise: 'Custom' },
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="bg-white border-b border-gray-100 px-2 py-[3px] flex items-center justify-between flex-shrink-0" style={{ minHeight: 18 }}>
        <div className="flex items-center gap-1.5">
          <span className="text-[6px] text-gray-400 cursor-pointer">← Back</span>
          <span className="text-[6.5px] font-bold text-[#e65100]">👑 Membership</span>
          <span className="text-[6px] text-gray-400">📋 Billing history</span>
        </div>
        <div className="w-3.5 h-3.5 rounded-full bg-[#e65100] text-white text-[6px] font-bold flex items-center justify-center">M</div>
      </div>

      <div className="flex flex-col items-center gap-1 px-2 py-1 flex-1 overflow-auto">
        <div className="inline-flex items-center gap-0.5 bg-orange-50 text-[#e65100] text-[5.5px] font-bold px-2 py-[2px] rounded-full">
          ✦ Creator Plans
        </div>
        <div className="text-[9px] font-black text-gray-900 text-center leading-tight">Grow your creator business</div>
        <div className="text-[5.5px] text-gray-400 text-center leading-tight max-w-[200px]">
          Unlock more products, remove Junooni branding, get a custom domain and priority payouts — everything you need to scale.
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded w-full px-1.5 py-1 flex items-center justify-between">
          <div className="text-[5.5px] text-gray-600">
            You're on the <strong>Starter plan</strong> — Renews on 1 May 2026
          </div>
          <div className="text-[5.5px] text-gray-400 cursor-pointer">Cancel plan</div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[6px] text-gray-700 font-medium">Monthly</span>
          <div className="w-6 h-3 bg-gray-200 rounded-full flex items-center px-[2px]">
            <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
          </div>
          <span className="text-[6px] text-gray-400">Annual</span>
        </div>

        <div className="grid grid-cols-3 gap-1 w-full">
          {plans.map((p) => (
            <div key={p.name}
              className={`rounded p-1.5 flex flex-col ${
                p.active
                  ? 'border-[1.5px] border-[#e65100] bg-orange-50/20'
                  : 'border border-gray-100 bg-white'
              }`}
            >
              <div className="text-[8px] mb-[2px]">{p.icon}</div>
              <div className="flex items-center gap-0.5 mb-[1px]">
                <div className={`text-[7px] font-bold ${p.active ? 'text-[#e65100]' : 'text-gray-800'}`}>{p.name}</div>
                {p.active && <span className="bg-[#e65100] text-white text-[4.5px] font-bold px-[3px] py-[0.5px] rounded leading-tight">Active</span>}
              </div>
              <div className="text-[5px] text-gray-400 mb-0.5">{p.tagline}</div>
              <div className="text-[11px] font-black text-gray-900 leading-none mb-1">
                {p.price}
                {p.priceSub && <span className="text-[5.5px] font-normal text-gray-400">{p.priceSub}</span>}
              </div>
              <div className="flex-1">
                {p.features.map((f, i) => (
                  <div key={f} className="flex items-center gap-0.5 mb-[2px]">
                    <span className={`text-[6px] leading-none ${p.featureOk[i] ? 'text-green-600' : 'text-gray-300'}`}>
                      {p.featureOk[i] ? '✓' : '—'}
                    </span>
                    <span className="text-[5px] text-gray-600 leading-tight">{f}</span>
                  </div>
                ))}
              </div>
              <button className={`w-full mt-1 py-[3px] text-[6px] font-bold rounded ${p.btnClass}`}>
                {p.btnLabel}
              </button>
            </div>
          ))}
        </div>

        <div className="w-full mt-0.5">
          <div className="text-[7px] font-bold text-gray-900 mb-1">Full comparison</div>
          <div className="grid text-[5.5px] border-b border-gray-100 pb-[2px] mb-[2px]"
            style={{ gridTemplateColumns: '1fr 30px 38px 48px' }}>
            <div className="text-gray-400 font-bold">FEATURE</div>
            <div className="text-gray-600 font-bold text-center">Free</div>
            <div className="text-[#e65100] font-bold text-center">Starter</div>
            <div className="text-orange-700 font-bold text-center">Enterprise</div>
          </div>
          {compRows.map((r) => (
            <div key={r.feature}
              className="grid items-center py-[2px] border-b border-gray-50 last:border-0"
              style={{ gridTemplateColumns: '1fr 30px 38px 48px' }}>
              <div className="text-[5.5px] text-gray-600">{r.feature}</div>
              <div className={`text-[5.5px] text-center ${r.free === '—' ? 'text-gray-300' : r.free === '✓' ? 'text-green-600' : 'text-gray-600'}`}>{r.free}</div>
              <div className={`text-[5.5px] text-center font-medium ${r.starter === '—' ? 'text-gray-300' : r.starter === '✓' ? 'text-green-600' : 'text-[#e65100]'}`}>{r.starter}</div>
              <div className={`text-[5.5px] text-center font-medium ${r.enterprise === '—' ? 'text-gray-300' : r.enterprise === '✓' ? 'text-green-600' : 'text-orange-700'}`}>{r.enterprise}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page registry ─────────────────────────────────────────────────────────────
const PAGES = {
  dashboard:  PageDashboard,
  products:   PageProducts,
  orders:     PageOrders,
  mystore:    PageMyStore,
  membership: PageMembership,
};

// ─────────────────────────────────────────────────────────────────────────────
// Laptop frame wrapper
// ─────────────────────────────────────────────────────────────────────────────
function LaptopDashboard() {
  const [active, setActive] = useState('dashboard');
  const ActivePage = PAGES[active];

  // Inject nav animation styles once on mount
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'junooni-nav-animations';
    style.textContent = `
      @keyframes jn-pulse {
        0%   { box-shadow: 0 0 0 0 rgba(230,81,0,0.4); }
        70%  { box-shadow: 0 0 0 5px rgba(230,81,0,0); }
        100% { box-shadow: 0 0 0 0 rgba(230,81,0,0); }
      }
      @keyframes jn-bounce {
        0%, 100% { transform: translateX(0); }
        50%       { transform: translateX(2px); }
      }
      @keyframes jn-hint {
        0%, 100% { opacity: 0.5; }
        50%       { opacity: 1; }
      }
      .jn-nav-active::after {
        content: '';
        position: absolute;
        inset: 1px;
        border-radius: 3px;
        pointer-events: none;
        animation: jn-pulse 2.2s ease-out infinite;
      }
      .jn-nav-arr {
        opacity: 0;
        transition: opacity 0.15s;
        animation: none;
        color: #e65100;
        font-size: 10px;
        margin-left: auto;
        flex-shrink: 0;
      }
      .jn-nav-item:hover .jn-nav-arr { opacity: 0.5; }
      .jn-nav-active .jn-nav-arr {
        opacity: 1;
        animation: jn-bounce 1.4s ease-in-out infinite;
      }
      .jn-nav-active .jn-nav-arr { animation-delay: 0s; }
      .jn-hint { animation: jn-hint 2.5s ease-in-out infinite; }
     .jn-hint-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #e65100;
        animation: jn-pulse 1.5s ease-out infinite;
        flex-shrink: 0;
      }
      @keyframes jn-marquee {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .jn-marquee-track {
        display: flex;
        width: max-content;
        animation: jn-marquee 40s linear infinite;
      }
      .jn-marquee-track:hover {
        animation-play-state: paused;
      }
    `;
    if (!document.getElementById('junooni-nav-animations')) {
      document.head.appendChild(style);
    }
    return () => {
      document.getElementById('junooni-nav-animations')?.remove();
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Screen lid */}
      <div
        className="relative rounded-t-xl rounded-b-sm w-full"
        style={{
          background: '#1e1e1e',
          padding: '7px 7px 0',
          maxWidth: 460,
          boxShadow: '0 12px 40px rgba(0,0,0,0.28)',
        }}
      >
        {/* Webcam dot */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: 4, width: 5, height: 5, background: '#333', borderRadius: '50%' }}
        />

        {/* Screen area */}
        <div className="flex overflow-hidden rounded-t-md" style={{ height: 295, background: '#fff' }}>

          {/* Sidebar */}
          <div className="flex flex-col flex-shrink-0 bg-white border-r border-gray-100" style={{ width: 80 }}>
            {/* Logo */}
            <div className="flex items-center gap-1 px-1.5 py-1.5 border-b border-gray-100">
              <div className="bg-[#e65100] text-white text-[6px] font-black px-[3px] py-[2px] rounded flex-shrink-0">J</div>
              <div>
                <div className="text-[7px] font-black text-[#e65100] leading-none">JUNOONI</div>
                <div className="text-[4.5px] text-gray-400 leading-tight">Creator Studio</div>
              </div>
            </div>

            {/* Nav links */}
            <div className="flex-1 py-0.5">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`jn-nav-item w-full flex items-center gap-1 px-1.5 py-[4px] text-[7px] font-medium text-left transition-colors border-l-[2px] relative
                    ${active === item.id
                      ? 'jn-nav-active bg-orange-50 text-[#e65100] font-bold border-[#e65100]'
                      : 'text-gray-400 hover:bg-orange-50 hover:text-[#e65100] hover:border-[#e65100] border-transparent'
                    }`}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="text-[9px] w-3 text-center flex-shrink-0">{item.icon}</span>
                  <span className="leading-tight flex-1">{item.label}</span>
                  <span className="jn-nav-arr">›</span>
                </button>
              ))}
            </div>

            {/* User footer */}
            <div className="flex flex-col gap-[3px] px-1.5 py-1 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-3.5 rounded-full bg-[#e65100] text-white text-[5.5px] font-bold flex items-center justify-center flex-shrink-0">M</div>
                <span className="text-[6px] text-gray-500 font-medium">Creator</span>
              </div>
              {/* Clickability hint chip */}
              <div
                className="jn-hint inline-flex items-center gap-[3px] rounded-full px-[5px] py-[2px]"
                style={{
                  background: '#fff7f0',
                  border: '0.5px solid #f5b98a',
                  fontSize: '4.5px',
                  color: '#e65100',
                  fontWeight: 600,
                }}
              >
                <div className="jn-hint-dot" />
                Click to explore
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="flex-1 min-w-0 bg-gray-50 overflow-hidden">
            <ActivePage />
          </div>

        </div>
      </div>

      {/* Laptop base/hinge */}
      <div style={{ width: '100%', maxWidth: 460, background: 'linear-gradient(180deg,#2a2a2a,#222)', height: 8, borderRadius: '0 0 7px 7px' }}>
        <div style={{ height: 2, background: '#333', margin: '0 18px', borderRadius: '0 0 2px 2px' }} />
      </div>
      <div style={{ width: '80%', maxWidth: 368, background: '#1d1d1d', height: 4, borderRadius: '0 0 10px 10px' }} />
      <div style={{ width: '60%', maxWidth: 276, background: '#111', height: 2, borderRadius: '0 0 4px 4px', boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }} />

      {/* Hero items strip overlapping bottom of laptop */}
      <div className="relative z-10 w-full flex justify-center" style={{ marginTop: '-120px' }}>
        <div
          className="bg-transparent rounded-2xl overflow-hidden"
          style={{ width: '92%', maxWidth: 430, padding: '10px 8px 6px' }}
        >
          <img
            src={herobanneritems}
            alt="Creator merchandise — hoodies, caps, mugs, boxes"
            style={{
              width: '100%',
              height: 'auto',
              minHeight: 160,
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero export
// ─────────────────────────────────────────────────────────────────────────────
export default function JunooniHero({ onRegister, onScrollPaths }) {
  return (
    <header className="pt-20 pb-4 sm:pt-24 sm:pb-8">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid items-center grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">

          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 text-xs font-semibold text-orange-800 bg-orange-100 rounded-full">
              <Sparkles className="w-3 h-3" /> India's #1 Creator Commerce Platform
            </div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl xl:text-[52px] text-gray-900">
              Build Your Creator Brand.
              <span className="block text-[#e65100] mt-1">We Handle Everything Else.</span>
            </h1>
            <p className="max-w-lg mt-5 text-sm leading-relaxed text-gray-600 sm:text-base">
              Launch your official merchandise store in minutes. We handle design, manufacturing,
              fulfillment, shipping, customer support, and payments — so you can focus on what you do best.
            </p>
            <div className="flex flex-col gap-3 mt-6 sm:flex-row sm:mt-8">
              <Button
                size="lg"
                onClick={onRegister}
                className="px-6 py-3 text-base font-bold text-white rounded-lg sm:px-8 sm:text-lg"
                style={{ backgroundColor: BRAND }}
              >
                Launch Your Store <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onScrollPaths}
                className="px-6 py-3 text-base font-semibold rounded-lg border-[#e65100] text-[#e65100] sm:px-8 sm:text-lg"
              >
                ▶ See How It Works
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 mt-6">
              {['Zero inventory risk', 'GST-compliant', 'Pan-India delivery'].map((c) => (
                <div key={c} className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-[#e65100]" /> {c}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-5 mt-7 pt-6 border-t border-orange-100">
              {[
                { icon: '👥', strong: '500+',     sub: 'Creators'         },
                { icon: '📦', strong: '1M+',      sub: 'Orders Fulfilled' },
                { icon: '🚚', strong: 'PAN India', sub: 'Delivery'        },
                { icon: '⭐', strong: '4.8/5',    sub: 'Creator Rating'   },
              ].map((s) => (
                <div key={s.sub} className="flex items-center gap-2">
                  <span className="text-lg">{s.icon}</span>
                  <div className="leading-tight">
                    <div className="text-sm font-bold text-gray-900">{s.strong}</div>
                    <div className="text-[11px] text-gray-500">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-gray-400">Trusted by creators across India</p>
          </div>

          {/* Right: Laptop */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-[460px]">
              <LaptopDashboard />
            </div>
          </div>

        </div>
      </div>
        {/* Creator category ticker strip */}
        <div
          className="mt-10 sm:mt-14 overflow-hidden border-t border-b border-orange-100 py-3"
          style={{ background: '#fff' }}
        >
          <div className="jn-marquee-track">
            {[
              'MUSICIANS', 'ACTORS', 'YOUTUBERS', 'GAMERS',
              'INFLUENCERS', 'PODCASTERS', 'ARTISTS', 'STREAMERS',
              'COMEDIANS', 'ATHLETES', 'EDUCATORS', 'DANCERS',
              // duplicate set for seamless loop
              'MUSICIANS', 'ACTORS', 'YOUTUBERS', 'GAMERS',
              'INFLUENCERS', 'PODCASTERS', 'ARTISTS', 'STREAMERS',
              'COMEDIANS', 'ATHLETES', 'EDUCATORS', 'DANCERS',
            ].map((label, i) => (
              <div
                key={label + i}
                className="flex items-center gap-4 px-6"
              >
                <span
                  className="text-sm font-black tracking-widest whitespace-nowrap"
                  style={{
                    color: i % 3 === 0 ? '#111' : i % 3 === 1 ? '#e65100' : '#bbb',
                    fontFamily: 'inherit',
                  }}
                >
                  {label}
                </span>
                <span style={{ color: '#e65100', fontSize: 8 }}>✦</span>
              </div>
            ))}
          </div>
        </div>
    </header>
  );
}