import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, ArrowRight, ChevronLeft, Sparkles } from "lucide-react";

const BRAND_PRIMARY = "#e65100";

// ─── Types ────────────────────────────────────────────────────────────────────
type StepKind = "spotlight" | "instruction" | "modal-wait" | "modal-close-wait" | "dom-wait";

interface TourStep {
  id: string;
  kind: StepKind;
  targetId?: string;
  modalDetectId?: string;
  // For dom-wait: wait until this element EXISTS in DOM, then advance
  domWaitId?: string;
  title: string;
  description: string;
  emoji: string;
  requiresClick?: boolean;
  arrowDirection?: "left" | "right" | "top" | "bottom";
  preferSide?: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  // 1 — Both Stores badge (user must click it)
  {
    id: "both-stores-badge",
    kind: "spotlight",
    targetId: "tour-both-stores-badge",
    title: "Your Store Mode",
    description:
      "This badge shows where your products are listed. Click it now to see your selling options — marketplace, own store, or both.",
    emoji: "🏪",
    requiresClick: true,
    arrowDirection: "left",
    preferSide: "bottom",
  },
  // 2 — Wait for StoreTypeModal
  {
    id: "wait-store-modal",
    kind: "modal-wait",
    modalDetectId: "tour-store-modal",
    title: "", description: "", emoji: "",
  },
  // 3 — Marketplace card
  {
    id: "store-modal-marketplace",
    kind: "spotlight",
    targetId: "tour-store-modal-marketplace",
    title: "Junooni Marketplace",
    preferSide: "right",
    description:
      "List your merch on junooni.com instantly. Your fans can discover and buy directly through the platform — no domain or setup needed.",
    emoji: "🛒",
  },
  // 4 — Own Store card
  {
    id: "store-modal-ownstore",
    kind: "spotlight",
    targetId: "tour-store-modal-ownstore",
    title: "Your Own Store",
    preferSide: "left",
    description:
      "Get a fully branded storefront at your own domain. JUNOONI handles fulfillment invisibly — it's 100% your brand.",
    emoji: "🌐",
  },
  // 5 — Spotlight the modal close button
  {
    id: "close-store-modal",
    kind: "spotlight",
    targetId: "tour-store-modal-close",
    title: "Close this modal",
    description: "Click the ✕ to close this panel. Next we'll show you how to add your first product.",
    emoji: "👆",
    requiresClick: true,
    arrowDirection: "left",
    preferSide: "left",
  },
  // 6 — Wait for store modal to close
  {
    id: "wait-store-modal-close",
    kind: "modal-close-wait",
    modalDetectId: "tour-store-modal",
    title: "", description: "", emoji: "",
  },
  // 7 — Spotlight Add Product button
  {
    id: "spotlight-add-product",
    kind: "spotlight",
    targetId: "tour-add-product",
    title: "Add Your First Product",
    description: "Now click 'Add Product' to open the product picker and choose what you want to sell.",
    emoji: "🎨",
    requiresClick: true,
    arrowDirection: "left",
    preferSide: "bottom",
  },
  // 8 — Wait for Add Product modal
  {
    id: "wait-product-modal",
    kind: "modal-wait",
    modalDetectId: "tour-product-modal",
    title: "", description: "", emoji: "",
  },
  // 9 — Design Something Amazing
  {
    id: "product-modal-design",
    kind: "spotlight",
    targetId: "tour-product-modal-design",
    title: "Design Something Amazing",
    preferSide: "right",
    description:
      "Pick from 100+ products — T-shirts, mugs, hoodies, posters. Upload your art and JUNOONI prints & ships every order. Zero inventory.",
    emoji: "✨",
  },
  // 10 — List Existing Products
  {
    id: "product-modal-existing",
    kind: "spotlight",
    targetId: "tour-product-modal-existing",
    title: "List Your Existing Products",
    preferSide: "left",
    description:
      "Already have stock? List products you physically hold. GST verification is required to sell existing inventory — this ensures authenticity and builds buyer trust on the platform.",
    emoji: "📦",
  },
  // 11 — Spotlight the Add Product modal close button
  {
    id: "close-product-modal",
    kind: "spotlight",
    targetId: "tour-product-modal-close",
    title: "Close this popup",
    description: "Click ✕ to close. We'll walk you through the rest of your dashboard next.",
    emoji: "👆",
    requiresClick: true,
    arrowDirection: "left",
    preferSide: "bottom",
  },
  // 12 — Wait for product modal to close
  {
    id: "wait-product-modal-close",
    kind: "modal-close-wait",
    modalDetectId: "tour-product-modal",
    title: "", description: "", emoji: "",
  },
  // 13 — Today's Revenue
  {
    id: "today-revenue",
    kind: "spotlight",
    targetId: "tour-today-revenue",
    title: "Today's Earnings",
    description:
      "Your real-time revenue for today. Every sale you make — JUNOONI takes care of fulfillment and you keep up to 90% of every order.",
    emoji: "💰",
  },
  // 14 — Pending Orders
  {
    id: "pending-orders",
    kind: "spotlight",
    targetId: "tour-pending-orders",
    title: "Pending Orders",
    description:
      "New orders from your fans appear here. You don't need to lift a finger — JUNOONI picks, packs and ships every order for you.",
    emoji: "⏳",
  },
  // 15 — Recent Orders
  {
    id: "recent-orders",
    kind: "spotlight",
    targetId: "tour-recent-orders",
    title: "Recent Orders",
    description:
      "See every recent order — customer name, status, payment, and total. Click any row to view full order details.",
    emoji: "🔍",
  },
  // 16 — Your Products
  {
    id: "your-products",
    kind: "spotlight",
    targetId: "tour-your-products",
    title: "Your Products",
    description:
      "Your published products live here. The more designs you list, the more your fans can discover and buy from you.",
    emoji: "🛍️",
  },
  // 17 — Quick Actions
  {
    id: "quick-actions",
    kind: "spotlight",
    targetId: "tour-quick-actions",
    title: "Quick Actions",
    description:
      "Your shortcut panel. Add products, view orders, open settings, or change your store mode — all from one place.",
    emoji: "⚡",
  },
  // Sidebar steps
  { id: "sidebar-dashboard", kind: "spotlight", targetId: "tour-sidebar-dashboard", preferSide: "right", title: "Dashboard", description: "Your home base. Revenue, orders, and a quick overview of everything happening in your store.", emoji: "🏠" },
  { id: "sidebar-products",  kind: "spotlight", targetId: "tour-sidebar-products",  preferSide: "right", title: "Products",   description: "Manage all your listings — edit designs, update prices, toggle visibility, and add new products.", emoji: "📋" },
  { id: "sidebar-orders",    kind: "spotlight", targetId: "tour-sidebar-orders",    preferSide: "right", title: "Orders",     description: "Full order management. Filter by status, view tracking details, and handle returns or claims.", emoji: "📦" },

  // ── My Store toggle — user MUST click to expand so My Collections becomes visible ──
  {
    id: "sidebar-mystore",
    kind: "spotlight",
    targetId: "tour-sidebar-mystore",
    preferSide: "right",
    title: "My Store",
    description:
      "Customise your storefront — logo, banner, colours, and page layout. Click the chevron now to expand and see My Collections inside.",
    emoji: "🎨",
    requiresClick: true,
    arrowDirection: "right",
  },

  // ── Wait until My Collections element appears in the DOM (toggle opened) ──
  {
    id: "wait-collections-visible",
    kind: "dom-wait",
    domWaitId: "tour-sidebar-collections",
    title: "", description: "", emoji: "",
  },

  // ── Now spotlight My Collections (it exists in DOM) ──
  { id: "sidebar-collections", kind: "spotlight", targetId: "tour-sidebar-collections", preferSide: "right", title: "My Collections", description: "Group products into collections — 'Summer Drop', 'Fan Merch', 'Limited Edition' — to make browsing easier for fans.", emoji: "📁" },
  { id: "sidebar-membership",  kind: "spotlight", targetId: "tour-sidebar-membership",  preferSide: "right", title: "Membership",     description: "Offer exclusive memberships to your fans — early access, special discounts, and member-only products.", emoji: "⭐" },
];

// ─── Geometry ─────────────────────────────────────────────────────────────────
interface SpotlightRect { top: number; left: number; width: number; height: number; }
interface TooltipPos    { top: number; left: number; arrowSide: "top"|"bottom"|"left"|"right"; arrowLeft: string; }

const TW = 340, TH = 300, EP = 10, TO = 16, MG = 16;

function pickPos(sl: SpotlightRect, vw: number, vh: number, preferSide?: string): TooltipPos {
  const tw = Math.min(TW, vw - MG * 2);
  const slCenterX = sl.left + sl.width / 2;
  const slCenterY = sl.top + sl.height / 2;
  const spaceBelow = vh - (sl.top + sl.height) - TO - MG;
  const spaceAbove = sl.top - TO - MG;
  const spaceRight = vw - (sl.left + sl.width) - TO - MG;
  const spaceLeft  = sl.left - TO - MG;

  type Side = "top"|"bottom"|"left"|"right";
  const fits: Record<Side, boolean> = {
    bottom: spaceBelow >= TH,
    top:    spaceAbove >= TH,
    right:  spaceRight >= tw,
    left:   spaceLeft  >= tw,
  };

  let side: Side;
  if (preferSide && fits[preferSide as Side]) side = preferSide as Side;
  else if (fits.bottom) side = "bottom";
  else if (fits.top)    side = "top";
  else if (fits.right)  side = "right";
  else if (fits.left)   side = "left";
  else side = spaceBelow >= spaceAbove ? "bottom" : "top";

  let as: TooltipPos["arrowSide"];
  let rawTop: number, rawLeft: number;

  if (side === "bottom") { rawTop = sl.top + sl.height + TO; rawLeft = slCenterX - tw / 2; as = "top"; }
  else if (side === "top") { rawTop = sl.top - TH - TO; rawLeft = slCenterX - tw / 2; as = "bottom"; }
  else if (side === "right") { rawTop = slCenterY - TH / 2; rawLeft = sl.left + sl.width + TO; as = "left"; }
  else { rawTop = slCenterY - TH / 2; rawLeft = sl.left - tw - TO; as = "right"; }

  const cl = Math.max(MG, Math.min(rawLeft, vw - tw - MG));
  let ct = rawTop;
  ct = Math.min(ct, vh - TH - MG);
  ct = Math.max(ct, MG);

  let arrowPx: number;
  if (side === "bottom" || side === "top") arrowPx = slCenterX - cl;
  else arrowPx = slCenterY - ct;
  arrowPx = Math.max(20, Math.min(arrowPx, tw - 20));

  return { top: ct, left: cl, arrowSide: as, arrowLeft: `${arrowPx}px` };
}

function arrowStyle(side: TooltipPos["arrowSide"], al: string): React.CSSProperties {
  const b: React.CSSProperties = { position:"absolute", width:0, height:0, borderStyle:"solid" };
  const C = BRAND_PRIMARY;
  switch (side) {
    case "top":    return { ...b, top:-11, left:al, transform:"translateX(-50%)", borderWidth:"0 11px 11px", borderColor:`transparent transparent ${C}` };
    case "bottom": return { ...b, bottom:-11, left:al, transform:"translateX(-50%)", borderWidth:"11px 11px 0", borderColor:`${C} transparent transparent` };
    case "left":   return { ...b, left:-11, top:"50%", transform:"translateY(-50%)", borderWidth:"11px 11px 11px 0", borderColor:`transparent ${C} transparent transparent` };
    case "right":  return { ...b, right:-11, top:"50%", transform:"translateY(-50%)", borderWidth:"11px 0 11px 11px", borderColor:`transparent transparent transparent ${C}` };
  }
}

// ─── Click-me arrow ───────────────────────────────────────────────────────────
interface ClickArrowProps { sl: SpotlightRect; direction: "left"|"right"|"top"|"bottom"; }

const ArrowIcon = ({ rotate = 0, size = 26 }: { rotate?: number; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: `rotate(${rotate}deg)` }}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ClickArrow: React.FC<ClickArrowProps> = ({ sl, direction }) => {
  const btnSize = 46;
  const gap = 10;
  let containerStyle: React.CSSProperties = { position:"fixed", zIndex:10010, pointerEvents:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:6 };
  let animName: string, rotate = 0;

  if (direction === "left") {
    containerStyle.top  = sl.top + sl.height / 2 - btnSize / 2;
    containerStyle.left = sl.left - btnSize * 2 - gap * 2;
    containerStyle.flexDirection = "row"; animName = "tour-slide-right"; rotate = 0;
  } else if (direction === "right") {
    containerStyle.top  = sl.top + sl.height / 2 - btnSize / 2;
    containerStyle.left = sl.left + sl.width + gap;
    containerStyle.flexDirection = "row"; animName = "tour-slide-left"; rotate = 180;
  } else if (direction === "top") {
    containerStyle.top  = sl.top - btnSize - gap * 3;
    containerStyle.left = sl.left + sl.width / 2 - btnSize / 2;
    containerStyle.flexDirection = "column"; animName = "tour-slide-down"; rotate = 90;
  } else {
    containerStyle.top  = sl.top + sl.height + gap;
    containerStyle.left = sl.left + sl.width / 2 - btnSize / 2;
    containerStyle.flexDirection = "column"; animName = "tour-slide-up"; rotate = -90;
  }

  return (
    <div style={containerStyle}>
      <div style={{ display:"flex", flexDirection: direction === "top" || direction === "bottom" ? "column" : "row", gap:2, animation:`${animName} 0.55s ease-in-out infinite alternate` }}>
        <div style={{ width:btnSize, height:btnSize, borderRadius:"50%", background:BRAND_PRIMARY, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 0 0 4px ${BRAND_PRIMARY}44, 0 6px 20px ${BRAND_PRIMARY}88` }}>
          <ArrowIcon rotate={rotate} size={22} />
        </div>
      </div>
    </div>
  );
};

// ─── Tooltip card ─────────────────────────────────────────────────────────────
interface TooltipCardProps {
  step: TourStep; visibleIndex: number; visibleSteps: TourStep[]; progress: number;
  isTrans: boolean; isLast: boolean;
  // canSkipClick: true when requiresClick but the action is already done (e.g. toggle already open)
  canSkipClick?: boolean;
  onBack: () => void; onNext: () => void; onJump: (i: number) => void; onComplete: () => void;
}

const TooltipCard: React.FC<TooltipCardProps> = ({ step, visibleIndex, visibleSteps, progress, isTrans, isLast, canSkipClick, onBack, onNext, onJump, onComplete }) => {
  // Show normal Next/Back buttons if: not requiresClick, OR requiresClick but action already done
  const showNextButton = !step.requiresClick || canSkipClick;

  return (
  <div style={{ background:BRAND_PRIMARY, borderRadius:14, boxShadow:"0 24px 64px rgba(230,81,0,0.38), 0 4px 16px rgba(0,0,0,0.22)" }}>
    <div style={{ padding:"16px 18px 18px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:"0.09em", color:"rgba(255,255,255,0.68)", textTransform:"uppercase" }}>
            Step {visibleIndex + 1} of {visibleSteps.length}
          </span>
        </div>
      </div>
      <h3 style={{ margin:"0 0 7px", fontSize:16, fontWeight:700, color:"white", lineHeight:1.3 }}>{step.title}</h3>
      <p style={{ margin:"0 0 16px", fontSize:13, color:"rgba(255,255,255,0.88)", lineHeight:1.65 }}>
        {step.requiresClick && canSkipClick
          ? step.description.replace("Click the chevron now to expand and see My Collections inside.", "My Collections is already expanded. Click Next to continue.")
          : step.description}
      </p>

      {!showNextButton ? (
        // requiresClick and action NOT yet done — hide Next, only show Back
        <div>
          <div style={{ display:"flex", gap:4, marginBottom:10, flexWrap:"wrap" }}>
            {visibleSteps.map((s, i) => (
              <div key={s.id} style={{ width:i===visibleIndex?16:5, height:5, borderRadius:999, background:i===visibleIndex?"white":"rgba(255,255,255,0.32)", transition:"all 0.28s ease", flexShrink:0 }} />
            ))}
          </div>
          {visibleIndex > 0 && (
            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:4, padding:"7px 14px", background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.24)", borderRadius:8, color:"white", fontSize:12, fontWeight:500, cursor:"pointer", pointerEvents:"auto", whiteSpace:"nowrap" }}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.24)")}
                onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.14)")}
              ><ChevronLeft size={13} /> Back</button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ display:"flex", gap:4, marginBottom:10, flexWrap:"wrap" }}>
            {visibleSteps.map((s, i) => (
              <div key={s.id} onClick={() => onJump(i)} style={{ width:i===visibleIndex?16:5, height:5, borderRadius:999, background:i===visibleIndex?"white":"rgba(255,255,255,0.32)", transition:"all 0.28s ease", cursor:"pointer", flexShrink:0 }} />
            ))}
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            {visibleIndex > 0 && (
              <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:4, padding:"7px 14px", background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.24)", borderRadius:8, color:"white", fontSize:12, fontWeight:500, cursor:"pointer", whiteSpace:"nowrap" }}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.24)")}
                onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.14)")}
              ><ChevronLeft size={13} /> Back</button>
            )}
            <button onClick={isLast ? onComplete : onNext} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 18px", background:"white", border:"none", borderRadius:8, color:BRAND_PRIMARY, fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.14)", transition:"transform 0.14s, box-shadow 0.14s", whiteSpace:"nowrap" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="scale(1.04)"; e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.14)"; }}
            >{isLast ? <>🎉 Let's go!</> : <>Next <ArrowRight size={13} /></>}</button>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
interface DashboardTourProps { onComplete: () => void; }

const DashboardTour: React.FC<DashboardTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipPos, setTooltipPos]       = useState<TooltipPos | null>(null);
  const [isVisible, setIsVisible]         = useState(false);
  const [isTrans, setIsTrans]             = useState(false);
  const [canSkipClick, setCanSkipClick]   = useState(false);

  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef      = useRef<number>(0);
  const obsRef      = useRef<MutationObserver | null>(null);
  const pollRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  // Lock scroll
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = orig; };
  }, []);

  const clearWatchers = useCallback(() => {
    if (obsRef.current) { obsRef.current.disconnect(); obsRef.current = null; }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  // Compute spotlight + tooltip
  const computePositions = useCallback((idx: number) => {
    const step = TOUR_STEPS[idx];
    if (step.kind !== "spotlight" || !step.targetId) return;
    const el = document.getElementById(step.targetId);
    if (!el) return;

    el.scrollIntoView({ behavior:"smooth", block:"center" });
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const vw = window.innerWidth, vh = window.innerHeight;
        const sl: SpotlightRect = { top:r.top-EP, left:r.left-EP, width:r.width+EP*2, height:r.height+EP*2 };
        setSpotlightRect(sl);
        setTooltipPos(pickPos(sl, vw, vh, TOUR_STEPS[idx].preferSide));
      });
    }, 350);
  }, []);

  // ── dom-wait: wait until domWaitId appears in DOM, then advance ──
  const startDomWait = useCallback((idx: number) => {
    const step = TOUR_STEPS[idx];
    if (step.kind !== "dom-wait" || !step.domWaitId) return;
    clearWatchers();

    // Find next non-wait step
    let targetStep = idx + 1;
    while (targetStep < TOUR_STEPS.length &&
      (TOUR_STEPS[targetStep].kind === "modal-wait" ||
       TOUR_STEPS[targetStep].kind === "modal-close-wait" ||
       TOUR_STEPS[targetStep].kind === "dom-wait")) {
      targetStep++;
    }

    let triggered = false;
    const advance = () => {
      if (triggered) return;
      triggered = true;
      clearWatchers();
      setSpotlightRect(null); setTooltipPos(null); setIsTrans(true);
      setTimeout(() => { setCurrentStep(targetStep); setIsTrans(false); }, 400);
    };

    const check = () => {
      const el = document.getElementById(step.domWaitId!);
      if (el) advance();
    };

    const obs = new MutationObserver(check);
    obs.observe(document.body, { childList: true, subtree: true });
    obsRef.current = obs;
    pollRef.current = setInterval(check, 80);
    check();
  }, [clearWatchers]);

  // MutationObserver for modal-wait steps
  const startModalWatch = useCallback((idx: number) => {
    const step = TOUR_STEPS[idx];
    if (step.kind !== "modal-wait" || !step.modalDetectId) return;
    clearWatchers();

    let targetStep = idx + 1;
    while (targetStep < TOUR_STEPS.length && TOUR_STEPS[targetStep].kind === "modal-wait") targetStep++;

    let triggered = false;

    const advance = () => {
      if (triggered) return;
      triggered = true;
      clearWatchers();
      setSpotlightRect(null); setTooltipPos(null); setIsTrans(true);
      setTimeout(() => { setCurrentStep(targetStep); setIsTrans(false); }, 500);
    };

    const check = () => {
      let el = document.getElementById(step.modalDetectId!);
      if (!el && step.modalDetectId === "tour-store-modal") {
        const headings = document.querySelectorAll("h2");
        for (const h of headings) { if (h.textContent?.includes("Where do you want to sell")) { el = h as any; break; } }
      }
      if (!el && step.modalDetectId === "tour-product-modal") {
        const headings = document.querySelectorAll("h3");
        for (const h of headings) { if (h.textContent?.includes("Design Something Amazing")) { el = h as any; break; } }
      }
      if (el) advance();
    };

    const obs = new MutationObserver(check);
    obs.observe(document.body, { childList: true, subtree: true });
    obsRef.current = obs;
    pollRef.current = setInterval(check, 80);
    check();
  }, [clearWatchers]);

  // Watch for modal to DISAPPEAR
  const startModalCloseWatch = useCallback((idx: number) => {
    const step = TOUR_STEPS[idx];
    if (step.kind !== "modal-close-wait" || !step.modalDetectId) return;
    clearWatchers();

    let targetStep = idx + 1;
    while (targetStep < TOUR_STEPS.length &&
      (TOUR_STEPS[targetStep].kind === "modal-wait" || TOUR_STEPS[targetStep].kind === "modal-close-wait")) {
      targetStep++;
    }

    let triggered = false;
    const advance = () => {
      if (triggered) return;
      triggered = true;
      clearWatchers();
      setSpotlightRect(null); setTooltipPos(null); setIsTrans(true);
      setTimeout(() => { setCurrentStep(targetStep); setIsTrans(false); }, 400);
    };

    const check = () => {
      const el = document.getElementById(step.modalDetectId!);
      let foundByText = false;
      if (step.modalDetectId === "tour-store-modal") {
        const h2s = document.querySelectorAll("h2");
        for (const h of h2s) { if (h.textContent?.includes("Where do you want to sell")) { foundByText = true; break; } }
      }
      if (step.modalDetectId === "tour-product-modal") {
        const h3s = document.querySelectorAll("h3");
        for (const h of h3s) { if (h.textContent?.includes("Design Something Amazing")) { foundByText = true; break; } }
      }
      if (!el && !foundByText) advance();
    };

    const obs = new MutationObserver(check);
    obs.observe(document.body, { childList: true, subtree: true });
    obsRef.current = obs;
    pollRef.current = setInterval(check, 80);
    check();
  }, [clearWatchers]);

  // Per-step logic
  useEffect(() => {
    if (!isVisible) return;
    const step = TOUR_STEPS[currentStep];
    // Reset canSkipClick on every step change; will be set true below if needed
    setCanSkipClick(false);

    if (step.kind === "spotlight") {
      setSpotlightRect(null); setTooltipPos(null);
      computePositions(currentStep);
      if (step.requiresClick) {
        const nextStep = TOUR_STEPS[currentStep + 1];
        if (nextStep?.kind === "modal-wait") startModalWatch(currentStep + 1);
        else if (nextStep?.kind === "modal-close-wait") startModalCloseWatch(currentStep + 1);
        else if (nextStep?.kind === "dom-wait") {
          const domWaitTarget = TOUR_STEPS[currentStep + 1].domWaitId;
          const alreadyExists = domWaitTarget ? !!document.getElementById(domWaitTarget) : false;
          if (alreadyExists) {
            // Toggle already open — show Next button so user isn't stuck
            setCanSkipClick(true);
          } else {
            // Toggle not open yet — hide Next, wait for user to click
            setCanSkipClick(false);
            startDomWait(currentStep + 1);
          }
        }
      }
    } else if (step.kind === "modal-wait") {
      setSpotlightRect(null); setTooltipPos(null);
      startModalWatch(currentStep);
    } else if (step.kind === "modal-close-wait") {
      setSpotlightRect(null); setTooltipPos(null);
      startModalCloseWatch(currentStep);
    } else if (step.kind === "dom-wait") {
      setSpotlightRect(null); setTooltipPos(null);
      startDomWait(currentStep);
    } else {
      setSpotlightRect(null); setTooltipPos(null);
    }
  }, [currentStep, isVisible, computePositions, startModalWatch, startModalCloseWatch, startDomWait]);

  useEffect(() => { const t = setTimeout(() => setIsVisible(true), 150); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const onResize = () => { if (TOUR_STEPS[currentStep].kind === "spotlight") computePositions(currentStep); };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      clearWatchers();
    };
  }, [currentStep, computePositions, clearWatchers]);

  const advance = () => {
    if (isTrans) return;
    const nextIdx = currentStep + 1;
    if (nextIdx >= TOUR_STEPS.length) { handleComplete(); return; }

    const nextStep = TOUR_STEPS[nextIdx];

    // If next step is dom-wait and target already exists, skip straight past it
    if (nextStep?.kind === "dom-wait" && nextStep.domWaitId) {
      const el = document.getElementById(nextStep.domWaitId);
      if (el) {
        // Find the step after the dom-wait
        let skipTo = nextIdx + 1;
        while (skipTo < TOUR_STEPS.length && (
          TOUR_STEPS[skipTo].kind === "modal-wait" ||
          TOUR_STEPS[skipTo].kind === "modal-close-wait" ||
          TOUR_STEPS[skipTo].kind === "dom-wait"
        )) skipTo++;
        setIsTrans(true);
        setTimeout(() => { setCurrentStep(skipTo); setIsTrans(false); }, 200);
        return;
      }
    }

    if (nextIdx < TOUR_STEPS.length) {
      setIsTrans(true);
      setTimeout(() => { setCurrentStep(nextIdx); setIsTrans(false); }, 200);
    } else { handleComplete(); }
  };

  const goBack = () => {
    if (isTrans || currentStep === 0) return;
    clearWatchers();
    let prev = currentStep - 1;
    while (prev > 0 && (
      TOUR_STEPS[prev].kind === "modal-wait" ||
      TOUR_STEPS[prev].kind === "modal-close-wait" ||
      TOUR_STEPS[prev].kind === "dom-wait"
    )) prev--;
    setIsTrans(true);
    setTimeout(() => { setCurrentStep(prev); setIsTrans(false); }, 200);
  };

  const handleComplete = () => {
    clearWatchers();
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  // Visible steps (exclude wait steps from dots/count)
  const visibleSteps = TOUR_STEPS.filter(s => s.kind !== "modal-wait" && s.kind !== "modal-close-wait" && s.kind !== "dom-wait");
  const visibleIndex = visibleSteps.findIndex(s => s.id === TOUR_STEPS[currentStep]?.id);
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;
  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const jumpToVisible = (vi: number) => {
    const target = TOUR_STEPS.findIndex(s => s.id === visibleSteps[vi]?.id);
    if (target < 0 || isTrans) return;
    setIsTrans(true);
    setTimeout(() => { setCurrentStep(target); setIsTrans(false); }, 200);
  };

  return (
    <>
      <div style={{ position:"fixed", inset:0, zIndex:9998, opacity:isVisible?1:0, transition:"opacity 0.3s ease", pointerEvents:"none" }}>
        {/* Dark mask */}
        {spotlightRect ? (
          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}>
            <defs>
              <mask id="tour-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect x={spotlightRect.left} y={spotlightRect.top} width={spotlightRect.width} height={spotlightRect.height} rx="10" fill="black"
                  style={{ transition:isTrans?"none":"all 0.38s cubic-bezier(0.4,0,0.2,1)" }} />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.70)" mask="url(#tour-mask)" />
          </svg>
        ) : (
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.70)", pointerEvents:"none" }} />
        )}

        {/* Glow ring */}
        {spotlightRect && (
          <div style={{
            position:"absolute", top:spotlightRect.top, left:spotlightRect.left,
            width:spotlightRect.width, height:spotlightRect.height,
            borderRadius:10, border:`2.5px solid ${BRAND_PRIMARY}`,
            boxShadow:`0 0 0 4px ${BRAND_PRIMARY}33, 0 0 20px 6px ${BRAND_PRIMARY}44`,
            pointerEvents:"none",
            transition:isTrans?"none":"all 0.38s cubic-bezier(0.4,0,0.2,1)",
            animation:"tour-pulse 2.2s ease-in-out infinite",
          }} />
        )}

        {/* Skip button */}
        <button onClick={handleComplete} style={{
          position:"fixed", top:16, right:16, zIndex:10001,
          display:"flex", alignItems:"center", gap:6,
          padding:"8px 14px", background:"rgba(255,255,255,0.13)",
          backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.28)",
          borderRadius:999, color:"white", fontSize:13, fontWeight:500, cursor:"pointer", pointerEvents:"auto",
        }}>
          <X size={13} /> Skip tour
        </button>

        {/* Spotlight tooltip */}
        {tooltipPos && step.kind === "spotlight" && (
          <div style={{
            position:"fixed", top:tooltipPos.top, left:tooltipPos.left,
            width:Math.min(TW, window.innerWidth - MG * 2),
            zIndex:10000,
            opacity:isTrans?0:1,
            transform:isTrans?"scale(0.96)":"scale(1)",
            transition:isTrans
              ? "opacity 0.15s ease, transform 0.15s ease"
              : "top 0.38s cubic-bezier(0.4,0,0.2,1), left 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease, transform 0.2s ease",
            pointerEvents:"auto",
          }}>
            <div style={arrowStyle(tooltipPos.arrowSide, tooltipPos.arrowLeft)} />
            <TooltipCard
              step={step} visibleIndex={visibleIndex} visibleSteps={visibleSteps}
              progress={progress} isTrans={isTrans} isLast={isLast}
              canSkipClick={canSkipClick}
              onBack={goBack} onNext={advance} onJump={jumpToVisible} onComplete={handleComplete}
            />
          </div>
        )}

        {/* dom-wait / modal-wait indicator */}
        {(step.kind === "modal-wait" || step.kind === "dom-wait") && (
          <div style={{
            position:"fixed", bottom:32, left:"50%", transform:"translateX(-50%)",
            zIndex:10000, background:"rgba(255,255,255,0.13)", backdropFilter:"blur(10px)",
            border:"1px solid rgba(255,255,255,0.25)", borderRadius:999,
            padding:"10px 20px", color:"white", fontSize:13, fontWeight:500,
            display:"flex", alignItems:"center", gap:8,
            animation:"tour-fade-in 0.3s ease",
          }}>
            <span style={{ display:"inline-block", animation:"tour-spin 1.2s linear infinite", fontSize:16 }}>⏳</span>
            {step.kind === "dom-wait" ? "Click to expand My Store…" : "Waiting for you to open the panel…"}
          </div>
        )}
      </div>

      {/* Bouncing arrow — outside overlay so never clipped. Hide if action already done. */}
      {spotlightRect && step.requiresClick && step.arrowDirection && !canSkipClick && (
        <ClickArrow sl={spotlightRect} direction={step.arrowDirection} />
      )}

      <style>{`
        @keyframes tour-pulse {
          0%,100% { box-shadow: 0 0 0 4px ${BRAND_PRIMARY}33, 0 0 20px 6px ${BRAND_PRIMARY}44; }
          50%      { box-shadow: 0 0 0 8px ${BRAND_PRIMARY}1a, 0 0 30px 10px ${BRAND_PRIMARY}2a; }
        }
        @keyframes tour-slide-right { from { transform:translateX(0px);  opacity:0.75; } to { transform:translateX(9px);  opacity:1; } }
        @keyframes tour-slide-left  { from { transform:translateX(0px);  opacity:0.75; } to { transform:translateX(-9px); opacity:1; } }
        @keyframes tour-slide-down  { from { transform:translateY(0px);  opacity:0.75; } to { transform:translateY(9px);  opacity:1; } }
        @keyframes tour-slide-up    { from { transform:translateY(0px);  opacity:0.75; } to { transform:translateY(-9px); opacity:1; } }
        @keyframes tour-spin        { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes tour-fade-in     { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
      `}</style>
    </>
  );
};

export default DashboardTour;