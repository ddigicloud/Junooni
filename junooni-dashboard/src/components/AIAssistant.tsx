import { useState, useRef, useEffect, useCallback } from "react"
import JUNI from "../assets/JUNI.png"
import JUNI2 from "../assets/JUNI-video.mp4"
import { generateJuniMockupsAllColors, generateJuniCanvasLayout, generateJuniMockupsAllAreasAllColors } from '../features/designer/components/JuniMockupBridge'


// ── Types ─────────────────────────────────────────────────────────────────────

interface ActionButton { label: string; url: string; icon?: string }
interface ColorOption  { name: string; hex: string }
interface SizeOption   { name: string }

// FIX E3: Mockup slide uses a session ID url (fetched via GET), not base64
interface MockupSlide {
  // Either a blob URL (after fetch) or a session ID string pending fetch
  base64?:     string     // populated after GET fetch completes
  sessionId?:  string     // server-side session ID
  colorHex:    string
  colorName:   string
  area:        string
  loading?:    boolean
}

interface ProductSession {
  selectedColors: ColorOption[]
  selectedSizes:  string[]
  designSessionId?: string
  blankName?: string
  blankId?: string
  technologyId?: string
  area?: string
  position?: string
  // For client-side mockup generation via JuniMockupBridge
  blankData?: any         // full blank API response
  designBase64?: string   // primary design data URI (first or same-for-all)
  designsByArea?: Record<string, { sessionId: string; base64: string; filename: string }>  // per-area designs
  selectedAreas?: string[]  // all areas creator selected
  pendingAreaUploads?: string[]  // areas still waiting for design upload
  sameDesignForAllAreas?: boolean  // creator chose same image for all areas
  calculatedPrice?: number  // exact price from calculateJuniPricing (same as Canvas designer)
  priceBreakdown?: any    // full breakdown for display
  canvasLayoutBase64?: string  // primary canvas layout PNG
  allCanvasLayouts?: string[]   // one per area for multi-area products
}

interface Message {
  role:           "user" | "assistant"
  content:        string
  actions?:       ActionButton[]
  suggestions?:   string[]
  showUpload?:    boolean
  showColorPicker?:     { colors: ColorOption[]; multiSelect: boolean }
  showSizePicker?:      { sizes: SizeOption[] }
  showColorSizePicker?: { colors: ColorOption[]; sizes: SizeOption[] }
  showAreaPicker?:     { areas: string[] }
  showSameOrDifferent?: { areas: string[] }  // ask same/different design for multi-area
  showAreaUpload?:      { area: string; areaIndex: number; totalAreas: number }  // upload for specific area
  showPositionPicker?:  { area: string }
  productCards?:  ProductCard[]
  mockupPreview?: string
  mockupSlides?:  MockupSlide[]
  createdProduct?: CreatedProduct
}

interface ProductCard {
  id: string; name: string; product_type: string
  base_cost: number; color_count: number
  colors: ColorOption[]; sizes: string[]
  first_mockup_url: string | null; technology_id: string | null
}

interface CreatedProduct {
  product_id: string; title: string
  dashboard_url: string; variant_count: number
}

type TicketState = "idle" | "confirm" | "collect" | "sending"
interface Props { vendorId: string }

// ── Constants ─────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL
  ? `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/ai-assistant`
  : "http://localhost:9000/vendors/ai-assistant"

const BRAND = "#E8621A"

const TOOL_LABELS: Record<string, string> = {
  get_store_overview: "Checking your store...", get_orders: "Fetching your orders...",
  get_earnings: "Looking up your earnings...", get_products: "Checking your products...",
  get_order_detail: "Finding that order...", get_own_store: "Checking your storefront...",
  get_pending_actions: "Reviewing what needs attention...", detect_product_intent: "Understanding what you want...",
  search_blanks: "Searching product catalog...", get_blank_details: "Getting product details...",
  generate_inline_mockup: "Generating your preview...", calculate_real_price: "Calculating exact pricing...",
  remove_background: "Cleaning up your design...", create_product_from_chat: "Creating your product...",
}

const SUPPORT_TRIGGERS = [
  "talk to support","contact support","human support","speak to someone","talk to a person","talk to human","real person","connect me to","raise a ticket","support ticket","email support","need help from","i want to contact","talk to someone","speak with a human","speak with support","support@junooni.com","not received my payment","not received my payout","payout not received","payment not received","where is my payout","where is my payment","my payout is pending","payout pending","payment pending","not credited","money not received","baat karni hai","support chahiye","insaan se baat","human se baat","paise nahi aaye","payment nahi aaya","payout nahi aaya","mujhe baat karni","kisi se baat",
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectsSupportIntent(msg: string) { return SUPPORT_TRIGGERS.some(t => msg.toLowerCase().includes(t)) }
function isYes(msg: string) { return ["yes","y","haan","ha","han","haa","ok","okay","sure","yeah","yep"].includes(msg.trim().toLowerCase()) }
function isNo(msg: string)  { return ["no","n","nahi","nope","nah","na","not now","cancel"].includes(msg.trim().toLowerCase()) }

function parseMessageMarkers(text: string): {
  clean: string; showUpload: boolean
  showColorPicker?: { colors: ColorOption[]; multiSelect: boolean }
  showSizePicker?:  { sizes: SizeOption[] }
  showAreaPicker?:  { areas: string[] }
  showPositionPicker?: { area: string }
  showColorSizePicker?: { colors: ColorOption[]; sizes: SizeOption[] }
} {
  let clean = text, showUpload = false
  let showColorPicker: any, showSizePicker: any, showAreaPicker: any, showSameOrDifferent: any, showAreaUpload: any, showPositionPicker: any

  if (clean.includes("[SHOW_UPLOAD]")) { showUpload = true; clean = clean.replace(/\[SHOW_UPLOAD\]/g, "") }

  // Handle [SHOW_COLOR_SIZE:...] — Gemini sometimes emits this non-standard marker
  // Extract colors and sizes from it and hand off to the real pickers below
  const colorSizeMatch = clean.match(/\[SHOW_COLOR_SIZE:([^\]]+)\]/)
  if (colorSizeMatch) {
    const inner = colorSizeMatch[1]
    const colorPairs = [...inner.matchAll(/([A-Za-z][A-Za-z\s]+):#([0-9a-fA-F]{3,6})/g)]
    if (colorPairs.length > 0) {
      const colors: ColorOption[] = colorPairs.map(m => ({ name: m[1].trim(), hex: `#${m[2]}`, multiSelect: true }))
      if (colors.length > 0) showColorPicker = { colors, multiSelect: true }
    }
    const sizesSection = inner.match(/sizes=([^,\]]+(?:,[^,\]]+)*)/)
    if (sizesSection) {
      const sizes: SizeOption[] = sizesSection[1].split(",").map(s => ({ name: s.trim() })).filter(s => s.name)
      if (sizes.length > 0) showSizePicker = { sizes }
    }
    clean = clean.replace(/\[SHOW_COLOR_SIZE:[^\]]+\]/g, "")
  }

  const colorMatch = clean.match(/\[SHOW_COLORS(_MULTI)?:([^\]]+)\]/)
  if (colorMatch) {
    const colors: ColorOption[] = colorMatch[2].split(",").map(s => s.trim()).map(raw => {
      const parts = raw.split(":"); return { name: parts[0]?.trim() || raw, hex: parts[1]?.trim() || "#cccccc" }
    }).filter(c => c.name)
    if (colors.length > 0) showColorPicker = { colors, multiSelect: !!colorMatch[1] }
    clean = clean.replace(/\[SHOW_COLORS(_MULTI)?:[^\]]+\]/g, "")
  }

  const sizeMatch = clean.match(/\[SHOW_SIZES:([^\]]+)\]/)
  if (sizeMatch) {
    const sizes: SizeOption[] = sizeMatch[1].split(",").map(s => ({ name: s.trim() })).filter(s => s.name)
    if (sizes.length > 0) showSizePicker = { sizes }
    clean = clean.replace(/\[SHOW_SIZES:[^\]]+\]/g, "")
  }

  const areaMatch = clean.match(/\[SHOW_AREAS:([^\]]+)\]/)
  if (areaMatch) {
    const areas = areaMatch[1].split(",").map(s => s.trim()).filter(Boolean)
    if (areas.length > 0) showAreaPicker = { areas }
    clean = clean.replace(/\[SHOW_AREAS:[^\]]+\]/g, "")
  }

  const posMatch = clean.match(/\[SHOW_POSITION:([^\]]+)\]/)
  if (posMatch) { showPositionPicker = { area: posMatch[1].trim() }; clean = clean.replace(/\[SHOW_POSITION:[^\]]+\]/g, "") }

  // ⚠️ Catchall: strip any remaining unknown [SHOW_*:...] markers AFTER all real parsers
  // This must be LAST — if it runs first it eats valid markers before they can be parsed
  clean = clean.replace(/\[SHOW_[A-Z_]+:[^\]]*\]/g, "")

  // Multi-area markers (generated internally, not by Gemini)
  const sodMatch = clean.match(/\[SHOW_SAME_OR_DIFFERENT:([^\]]+)\]/)
  if (sodMatch) {
    const areas = sodMatch[1].split(",").map(s => s.trim()).filter(Boolean)
    if (areas.length > 0) showSameOrDifferent = { areas }
    clean = clean.replace(/\[SHOW_SAME_OR_DIFFERENT:[^\]]+\]/g, "")
  }
  const aupMatch = clean.match(/\[SHOW_AREA_UPLOAD:([^:]+):(\d+):(\d+)\]/)
  if (aupMatch) {
    showAreaUpload = { area: aupMatch[1].trim(), areaIndex: parseInt(aupMatch[2]), totalAreas: parseInt(aupMatch[3]) }
    clean = clean.replace(/\[SHOW_AREA_UPLOAD:[^\]]+\]/g, "")
  }

  const showColorSizePicker = (showColorPicker && showSizePicker) ? { colors: showColorPicker.colors, sizes: showSizePicker.sizes } : undefined
  return {
    clean: clean.trim(), showUpload,
    showColorPicker:     showColorSizePicker ? undefined : showColorPicker,
    showSizePicker:      showColorSizePicker ? undefined : showSizePicker,
    showColorSizePicker, showAreaPicker, showSameOrDifferent, showAreaUpload, showPositionPicker,
  }
}

function parseActions(text: string): ActionButton[] {
  const actions: ActionButton[] = []
  text.replace(/\[ACTION:([^\]:]+):([^\]]+)\]/g, (_: string, label: string, url: string) => { actions.push({ label: label.trim(), url: url.trim() }); return "" })
  return actions
}

function detectRelevantActions(_text: string): ActionButton[] {
  // Action pills disabled — they clutter the product creation chat flow
  return []
}

function detectSuggestions(text: string): string[] {
  const lower = text.toLowerCase()
  if (lower.includes("product") || lower.includes("design")) return ["How do I set the price?", "What file format for designs?", "How long is product review?"]
  if (lower.includes("order") || lower.includes("fulfillment")) return ["How do I track orders?", "What is COD fee?", "What if customer returns?"]
  if (lower.includes("payout") || lower.includes("wallet") || lower.includes("earning")) return ["Minimum withdrawal amount?", "When do I get paid?", "How is GST handled?"]
  return ["Create a product", "Track my orders", "When will I get paid?"]
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
  return (0.299*r + 0.587*g + 0.114*b) > 160
}

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderMarkdown(text: string, isUser: boolean): React.ReactNode {
  const lines = text.split("\n"); const elements: React.ReactNode[] = []; let i = 0
  const parseInline = (line: string): React.ReactNode => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return (<>{parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) return <strong key={idx} style={{ fontWeight:700, color: isUser?"#fff":"#1a1a1a" }}>{part.slice(2,-2)}</strong>
      return <span key={idx}>{part}</span>
    })}</>)
  }
  while (i < lines.length) {
    const line = lines[i]
    if (/^---+$/.test(line.trim())) { i++; continue }
    if (line.startsWith("## ")) { elements.push(<div key={i} style={{ fontWeight:700, fontSize:"14px", color: isUser?"#fff":"#1a1a1a", marginTop:"8px", marginBottom:"3px" }}>{line.replace(/^## /,"")}</div>); i++; continue }
    if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\.\s(.*)/)
      if (num) elements.push(<div key={i} style={{ display:"flex", gap:"8px", marginBottom:"4px", alignItems:"flex-start" }}><span style={{ color: isUser?"rgba(255,255,255,0.75)":BRAND, fontWeight:700, fontSize:"12px", minWidth:"18px", flexShrink:0 }}>{num[1]}.</span><span style={{ flex:1, fontSize:"13.5px", lineHeight:"1.55" }}>{parseInline(num[2])}</span></div>)
      i++; continue
    }
    if (line.startsWith("- ") || line.startsWith("• ")) {
      const txt = line.replace(/^[-•]\s/,"")
      elements.push(<div key={i} style={{ display:"flex", gap:"8px", marginBottom:"4px", alignItems:"flex-start" }}><span style={{ color: isUser?"rgba(255,255,255,0.75)":BRAND, fontSize:"18px", lineHeight:"1", minWidth:"14px", flexShrink:0 }}>·</span><span style={{ flex:1, fontSize:"13.5px", lineHeight:"1.55" }}>{parseInline(txt)}</span></div>)
      i++; continue
    }
    if (line.trim() === "") { elements.push(<div key={i} style={{ height:"5px" }} />); i++; continue }
    elements.push(<div key={i} style={{ fontSize:"13.5px", lineHeight:"1.6", marginBottom:"1px" }}>{parseInline(line)}</div>)
    i++
  }
  return <>{elements}</>
}

function GeminiStar({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink:0 }}>
      <defs><linearGradient id="gstar" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF9A5C"/><stop offset="50%" stopColor="#E8621A"/><stop offset="100%" stopColor="#c94e10"/></linearGradient></defs>
      <path d="M12 2C12 2 13.2 9.5 17 12C13.2 14.5 12 22 12 22C12 22 10.8 14.5 7 12C10.8 9.5 12 2 12 2Z" fill="url(#gstar)"/>
      <path d="M5 5C5 5 5.8 8.5 8 10C5.8 11.5 5 15 5 15C5 15 4.2 11.5 2 10C4.2 8.5 5 5 5 5Z" fill="url(#gstar)" opacity="0.55"/>
    </svg>
  )
}

function TypingIndicator({ toolName }: { toolName?: string }) {
  const label = toolName ? (TOOL_LABELS[toolName] ?? "Working on it...") : "JUNI is thinking..."
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:"8px" }}>
      <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#fff5f0,#ffe0cc)", border:"1.5px solid #f0c8b0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
        <img src={JUNI} alt="JUNI" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{ e.currentTarget.style.display="none"; e.currentTarget.parentElement!.innerHTML='<span style="color:#E8621A;font-size:11px;font-weight:700">J</span>' }} />
      </div>
      <div style={{ background:"#fff", border:"1px solid #f0f0f0", borderRadius:"18px 18px 18px 4px", padding:"10px 16px", display:"flex", alignItems:"center", gap:"8px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
        <style>{`.juni-dot{width:7px;height:7px;border-radius:50%;background:${BRAND};animation:juni-bounce 1.2s infinite}.juni-dot:nth-child(2){animation-delay:.2s}.juni-dot:nth-child(3){animation-delay:.4s}@keyframes juni-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
        <div className="juni-dot" /><div className="juni-dot" /><div className="juni-dot" />
        <span style={{ fontSize:"12px", color:"#aaa", marginLeft:"4px" }}>{label}</span>
      </div>
    </div>
  )
}

// ── ColorSizePicker ───────────────────────────────────────────────────────────

function ColorSizePicker({ colors, sizes, onConfirm }: { colors: ColorOption[]; sizes: SizeOption[]; onConfirm: (colors: ColorOption[], sizes: string[]) => void }) {
  const colorsOnly = sizes.length === 0
  const [selColors, setSelColors] = useState<Set<string>>(new Set())
  const [selSizes, setSelSizes]   = useState<Set<string>>(new Set())
  const [done, setDone]           = useState(false)
  if (done) return null
  const toggleColor = (c: ColorOption) => { const n = new Set(selColors); if (n.has(c.name)) { if (n.size > 1) n.delete(c.name) } else n.add(c.name); setSelColors(n) }
  const toggleSize  = (s: string)      => { const n = new Set(selSizes);  if (n.has(s))      { if (n.size > 1) n.delete(s) }      else n.add(s);      setSelSizes(n)  }
  const canConfirm  = selColors.size > 0 && (colorsOnly || selSizes.size > 0)
  const confirm = () => { if (!canConfirm) return; setDone(true); onConfirm(colors.filter(c => selColors.has(c.name)), [...selSizes]) }
  return (
    <div style={{ background:"#fff", border:"1.5px solid #f0f0f0", borderRadius:"14px", padding:"12px", marginTop:"4px" }}>
      <div style={{ marginBottom:"14px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
          <p style={{ margin:0, fontSize:"12px", fontWeight:600, color:"#444" }}>🎨 Colors</p>
          <span style={{ fontSize:"11px", color:"#aaa" }}>{selColors.size} selected</span>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
          {colors.map(color => {
            const isSelected = selColors.has(color.name); const isLight = isLightColor(color.hex)
            return (
              <button key={color.name} onClick={() => toggleColor(color)} title={color.name} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", background:"none", border:"none", cursor:"pointer", padding:"4px" }}>
                <div style={{ width:"38px", height:"38px", borderRadius:"50%", background:color.hex, border: isSelected ? `3px solid ${BRAND}` : isLight ? "2px solid #ddd" : "2px solid #eee", boxShadow: isSelected ? `0 0 0 3px rgba(232,98,26,0.25)` : "none", transform: isSelected ? "scale(1.15)" : "scale(1)", transition:"all 0.15s ease", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {isSelected && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isLight?"#333":"#fff"} strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                </div>
                <span style={{ fontSize:"9.5px", color:"#666", maxWidth:"42px", textAlign:"center", lineHeight:"1.2", wordBreak:"break-word" }}>{color.name}</span>
              </button>
            )
          })}
        </div>
      </div>
      {!colorsOnly && <div style={{ height:"1px", background:"#f0f0f0", margin:"0 -12px 14px" }} />}
      {!colorsOnly && (
        <div style={{ marginBottom:"12px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
            <p style={{ margin:0, fontSize:"12px", fontWeight:600, color:"#444" }}>📐 Sizes</p>
            <button onClick={() => setSelSizes(new Set(sizes.map(s => s.name)))} style={{ fontSize:"11px", color:BRAND, background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>Select all</button>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"7px" }}>
            {sizes.map(size => { const isSel = selSizes.has(size.name); return (
              <button key={size.name} onClick={() => toggleSize(size.name)} style={{ minWidth:"42px", padding:"7px 11px", background: isSel?BRAND:"#f5f5f5", color: isSel?"#fff":"#444", border: isSel?`2px solid ${BRAND}`:"2px solid #e8e8e8", borderRadius:"10px", fontWeight:600, fontSize:"13px", cursor:"pointer", transform: isSel?"scale(1.05)":"scale(1)", transition:"all 0.15s ease" }}>{size.name}</button>
            )})}
          </div>
        </div>
      )}
      <button onClick={confirm} disabled={!canConfirm} style={{ width:"100%", padding:"10px", background: canConfirm?BRAND:"#e0e0e0", color:"#fff", border:"none", borderRadius:"20px", fontWeight:600, fontSize:"13px", cursor: canConfirm?"pointer":"not-allowed", transition:"background 0.2s" }}>
        {canConfirm ? colorsOnly ? `Confirm ${selColors.size} color${selColors.size>1?"s":""}` : `Confirm — ${selColors.size} color${selColors.size>1?"s":""}, ${selSizes.size} size${selSizes.size>1?"s":""}` : `Select ${selColors.size===0?"colors":"sizes"} to continue`}
      </button>
    </div>
  )
}

function SizePicker({ sizes, onSelect }: { sizes: SizeOption[]; onSelect: (selected: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set()); const [confirmed, setConfirmed] = useState(false)
  if (confirmed) return null
  const toggle = (s: string) => { const n=new Set(selected); if(n.has(s)){if(n.size>1)n.delete(s)}else n.add(s); setSelected(n) }
  return (
    <div style={{ background:"#fff", border:"1.5px solid #f0f0f0", borderRadius:"14px", padding:"12px", marginTop:"4px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
        <p style={{ margin:0, fontSize:"12px", fontWeight:600, color:"#444" }}>📐 Sizes</p>
        <button onClick={() => setSelected(new Set(sizes.map(s=>s.name)))} style={{ fontSize:"11px", color:BRAND, background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>Select all</button>
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"7px", marginBottom:"12px" }}>
        {sizes.map(size => { const isSel=selected.has(size.name); return <button key={size.name} onClick={() => toggle(size.name)} style={{ minWidth:"42px", padding:"7px 11px", background:isSel?BRAND:"#f5f5f5", color:isSel?"#fff":"#444", border:isSel?`2px solid ${BRAND}`:"2px solid #e8e8e8", borderRadius:"10px", fontWeight:600, fontSize:"13px", cursor:"pointer", transition:"all 0.15s" }}>{size.name}</button> })}
      </div>
      <button onClick={() => { if(selected.size>0){setConfirmed(true); onSelect([...selected])} }} disabled={selected.size===0} style={{ width:"100%", padding:"9px", background:selected.size>0?BRAND:"#e0e0e0", color:"#fff", border:"none", borderRadius:"20px", fontWeight:600, fontSize:"13px", cursor:selected.size>0?"pointer":"not-allowed" }}>Confirm sizes {selected.size>0?`(${selected.size} selected)`:""}</button>
    </div>
  )
}

const AREA_ICONS: Record<string, string> = { front:"👕", back:"👘", "left-chest":"📌", sleeve:"💪", "right-chest":"📌", hood:"🧢", pocket:"🔲" }

function AreaPicker({ areas, onSelect }: { areas: string[]; onSelect: (areas: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set()); const [confirmed, setConfirmed] = useState(false)
  if (confirmed) return null
  const toggle = (area: string) => { const n = new Set(selected); if (n.has(area)) { if (n.size > 1) n.delete(area) } else n.add(area); setSelected(n) }
  return (
    <div style={{ background:"#fff", border:"1.5px solid #f0f0f0", borderRadius:"14px", padding:"12px", marginTop:"4px" }}>
      <p style={{ margin:"0 0 10px", fontSize:"12px", color:"#888" }}>Where do you want to print? (select all that apply)</p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginBottom:"12px" }}>
        {areas.map(area => { const isSel = selected.has(area); return (
          <button key={area} onClick={() => toggle(area)} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"10px 14px", background: isSel?"#fff5f0":"#f8f8f8", border: isSel?`2px solid ${BRAND}`:"1.5px solid #e8e8e8", borderRadius:"12px", cursor:"pointer", fontSize:"13px", fontWeight:600, color: isSel?BRAND:"#333", transform: isSel?"scale(1.03)":"scale(1)", transition:"all 0.15s ease" }}>
            <span>{AREA_ICONS[area] ?? "🖨️"}</span><span style={{ textTransform:"capitalize" }}>{area.replace(/-/g," ")}</span>{isSel && <span style={{ fontSize:"10px" }}>✓</span>}
          </button>
        )})}
      </div>
      <button onClick={() => { if(selected.size>0){setConfirmed(true); onSelect([...selected])} }} disabled={selected.size===0} style={{ width:"100%", padding:"9px", background:selected.size>0?BRAND:"#e0e0e0", color:"#fff", border:"none", borderRadius:"20px", fontWeight:600, fontSize:"13px", cursor:selected.size>0?"pointer":"not-allowed" }}>
        Confirm {selected.size > 0 ? `(${[...selected].map(a=>a.replace(/-/g," ")).join(", ")})` : "selection"}
      </button>
    </div>
  )
}

const POSITIONS = [
  { label:"Top Left", value:"top-left" }, { label:"Top Center", value:"top-center" }, { label:"Top Right", value:"top-right" },
  { label:"Center Left", value:"center-left" }, { label:"Center", value:"center" }, { label:"Center Right", value:"center-right" },
  { label:"Bottom Left", value:"bottom-left" }, { label:"Bottom Center", value:"bottom-center" }, { label:"Bottom Right", value:"bottom-right" },
]

function PositionPicker({ area, onSelect }: { area: string; onSelect: (position: string) => void }) {
  const [selected, setSelected] = useState<string|null>(null); const [confirmed, setConfirmed] = useState(false)
  if (confirmed) return null
  const pick = (val: string) => { setSelected(val); setTimeout(() => { setConfirmed(true); onSelect(val) }, 200) }
  return (
    <div style={{ background:"#fff", border:"1.5px solid #f0f0f0", borderRadius:"14px", padding:"12px", marginTop:"4px" }}>
      <p style={{ margin:"0 0 10px", fontSize:"12px", color:"#888" }}>Where on the <strong style={{color:"#1a1a1a",textTransform:"capitalize"}}>{area.replace(/-/g," ")}</strong> should the design go?</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"6px", background:"#f8f5ff", borderRadius:"12px", padding:"10px", border:"1.5px dashed #d0b8f0" }}>
        {POSITIONS.map(pos => { const isSel = selected === pos.value; return (
          <button key={pos.value} onClick={() => pick(pos.value)} style={{ aspectRatio:"1", borderRadius:"8px", border:"none", cursor:"pointer", background: isSel ? BRAND : "rgba(255,255,255,0.8)", transition:"all 0.15s ease", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"2px", boxShadow: isSel ? `0 2px 8px rgba(232,98,26,0.4)` : "none", transform: isSel ? "scale(1.05)" : "scale(1)" }} title={pos.label}>
            <div style={{ width:"16px", height:"16px", borderRadius:"4px", background: isSel?"rgba(255,255,255,0.9)":"rgba(0,0,0,0.12)" }} />
            <span style={{ fontSize:"8px", color: isSel?"#fff":"#888", fontWeight:600, lineHeight:1.2, textAlign:"center", maxWidth:"40px" }}>{pos.label}</span>
          </button>
        )})}
      </div>
    </div>
  )
}

function SameOrDifferentPicker({ areas, onSelect }: {
  areas: string[]
  onSelect: (same: boolean) => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "4px 0" }}>
      <div style={{ fontSize: "13px", color: "#555", marginBottom: "4px" }}>
        You selected {areas.length} areas: <strong>{areas.join(", ")}</strong>
      </div>
      <button onClick={() => onSelect(true)} style={{ padding: "10px 16px", background: BRAND, color: "#fff", border: "none", borderRadius: "20px", fontWeight: 600, fontSize: "13px", cursor: "pointer", textAlign: "left" }}>
        🖼️ Same design for all areas
      </button>
      <button onClick={() => onSelect(false)} style={{ padding: "10px 16px", background: "#f5f5f5", color: "#333", border: "1.5px solid #e0e0e0", borderRadius: "20px", fontWeight: 600, fontSize: "13px", cursor: "pointer", textAlign: "left" }}>
        🎨 Different design for each area
      </button>
    </div>
  )
}

function DesignUploader({ vendorId, onUploadComplete, onSkip }: { vendorId: string; onUploadComplete: (sessionId: string, filename: string, base64: string) => void; onSkip: () => void }) {
  const [state, setState] = useState<"idle"|"uploading"|"done"|"error">("idle")
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string|null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { setState("error"); return }
    if (file.size > 30 * 1024 * 1024) { setState("error"); return }
    setState("uploading"); setProgress(20)
    const base64 = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = e => res(e.target!.result as string); r.onerror = rej; r.readAsDataURL(file) })
    setPreview(base64); setProgress(60)
    try {
      const token = localStorage.getItem("vendorToken") ?? ""
      const resp = await fetch(API_URL, { method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`}, credentials:"include", body: JSON.stringify({ action:"upload_design", vendorId, base64, filename: file.name, mimeType: file.type, messages:[] }) })
      if (!resp.ok) throw new Error("Upload failed")
      const data = await resp.json()
      setProgress(100); setState("done")
      onUploadComplete(data.sessionId, file.name, base64)  // pass base64 for client-side mockup generation
    } catch { setState("error") }
  }

  return (
    <div style={{ background:"#fff", border:`1.5px dashed ${state==="error"?"#e53e3e":BRAND}`, borderRadius:"14px", padding:"14px", marginTop:"4px" }}>
      {state === "idle" && (<>
        <p style={{ margin:"0 0 4px", fontSize:"13px", fontWeight:600, color:"#1a1a1a" }}>Upload your design</p>
        <p style={{ margin:"0 0 10px", fontSize:"12px", color:"#888" }}>PNG or JPG · max 30MB · transparent background recommended</p>
        <div style={{ display:"flex", gap:"8px" }}>
          <label style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"9px 16px", background:BRAND, color:"#fff", borderRadius:"20px", fontSize:"13px", fontWeight:600, cursor:"pointer" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            Choose file
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" style={{ display:"none" }} onChange={e => { const f=e.target.files?.[0]; if(f) handleFile(f) }} />
          </label>
          <button onClick={onSkip} style={{ padding:"9px 14px", background:"#f5f5f5", color:"#888", border:"none", borderRadius:"20px", fontSize:"13px", cursor:"pointer" }}>Skip for now</button>
        </div>
      </>)}
      {state === "uploading" && (<div>{preview && <img src={preview} alt="preview" style={{ width:"52px", height:"52px", objectFit:"cover", borderRadius:"8px", marginBottom:"8px" }} />}<p style={{ margin:"0 0 6px", fontSize:"13px", color:"#555" }}>Uploading...</p><div style={{ height:"4px", background:"#f0f0f0", borderRadius:"99px", overflow:"hidden" }}><div style={{ height:"100%", width:`${progress}%`, background:BRAND, borderRadius:"99px", transition:"width 0.3s ease" }} /></div></div>)}
      {state === "done" && (<div style={{ display:"flex", alignItems:"center", gap:"8px" }}>{preview && <img src={preview} alt="preview" style={{ width:"48px", height:"48px", objectFit:"cover", borderRadius:"8px", flexShrink:0 }} />}<div><p style={{ margin:0, fontSize:"13px", color:"#1a1a1a", fontWeight:600 }}>✅ Design uploaded!</p><p style={{ margin:"2px 0 0", fontSize:"12px", color:"#888" }}>Cleaning up and generating preview...</p></div></div>)}
      {state === "error" && (<div><p style={{ margin:"0 0 8px", fontSize:"13px", color:"#e53e3e" }}>❌ Upload failed — please try again.</p><button onClick={() => setState("idle")} style={{ padding:"6px 14px", background:BRAND, color:"#fff", border:"none", borderRadius:"16px", fontSize:"12px", cursor:"pointer" }}>Try again</button></div>)}
    </div>
  )
}

function AreaDesignUploader({ area, areaIndex, totalAreas, vendorId, onUploadComplete }: {
  area: string
  areaIndex: number
  totalAreas: number
  vendorId: string
  onUploadComplete: (sessionId: string, filename: string, base64: string) => void
}) {
  return (
    <div>
      <div style={{ fontSize: "13px", fontWeight: 600, color: BRAND, marginBottom: "8px" }}>
        📐 Area {areaIndex + 1}/{totalAreas}: <span style={{ textTransform: "capitalize" }}>{area}</span>
      </div>
      <DesignUploader vendorId={vendorId} onUploadComplete={onUploadComplete} onSkip={() => {}} />
    </div>
  )
}

function ProductCardList({ products, onSelect, isLockedByParent }: {
  products:         ProductCard[]
  onSelect:         (index: number, product: ProductCard) => void
  isLockedByParent?: boolean  // FIX E3: parent controls lock so it survives re-renders
}) {
  const [selected, setSelected] = useState<number|null>(null)
  const [locked, setLocked]     = useState(false)
  // Sync with parent lock — if parent says locked, honour it even if local state reset
  const isLocked = locked || !!isLockedByParent
  const handleSelect = (i: number, product: ProductCard) => { if (isLocked) return; setSelected(i); setLocked(true); onSelect(i+1, product) }
  return (
    <div style={{ marginTop:"4px" }}>
      <div style={{ display:"flex", flexDirection:"row", gap:"10px", overflowX:"auto", paddingBottom:"6px", scrollbarWidth:"thin", scrollbarColor:"#e0d0c8 transparent" }}>
        {products.map((product, i) => (
          <button key={product.id} onClick={() => handleSelect(i, product)} disabled={isLocked} style={{ flexShrink:0, width:"148px", display:"flex", flexDirection:"column", alignItems:"stretch", padding:0, background: selected===i?"#fff5f0":"#fff", border: selected===i?`2px solid ${BRAND}`:"1.5px solid #f0f0f0", borderRadius:"12px", cursor: isLocked?"default":"pointer", textAlign:"left", transition:"all 0.15s", overflow:"hidden", opacity: isLocked && selected!==i ? 0.4 : 1 }}>
            <div style={{ width:"100%", height:"118px", background:"#f5f5f5", flexShrink:0, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {product.first_mockup_url ? <img src={product.first_mockup_url} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <span style={{ fontSize:"32px" }}>📦</span>}
            </div>
            <div style={{ padding:"8px 10px", flex:1 }}>
              <div style={{ fontWeight:600, fontSize:"12px", color:"#1a1a1a", marginBottom:"3px", lineHeight:"1.3" }}>{product.name}</div>
              <div style={{ fontSize:"11px", color:"#888", marginBottom:"4px" }}>₹{product.base_cost} base · {product.sizes.slice(0,3).join(",")}{product.sizes.length>3?"+":""}</div>
              <div style={{ display:"flex", gap:"3px", flexWrap:"wrap" }}>
                {product.colors.slice(0,7).map((c,ci) => <div key={ci} title={c.name} style={{ width:"11px", height:"11px", borderRadius:"50%", background:c.hex, border:"1px solid rgba(0,0,0,0.12)", flexShrink:0 }} />)}
                {product.colors.length > 7 && <span style={{ fontSize:"9px", color:"#aaa", alignSelf:"center" }}>+{product.colors.length-7}</span>}
              </div>
            </div>
            {selected === i && <div style={{ background:BRAND, color:"#fff", textAlign:"center", fontSize:"11px", fontWeight:700, padding:"5px" }}>✓ Selected</div>}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── MockupSlider — fetches images via GET, never stores base64 in POST body ────

function MockupSlider({ slides, onApprove, onRetry }: {
  slides:    MockupSlide[]
  onApprove: (approvedSessionId: string) => void
  onRetry:   () => void
}) {
  const [activeIdx, setActiveIdx] = useState(0)
  // Local state to track fetched blob URLs for each slide
  const [fetchedUrls, setFetchedUrls] = useState<Record<number, string>>({})
  const [fetching, setFetching]       = useState<Record<number, boolean>>({})

  // FIX E3: Fetch each mockup image via GET using its session ID
  // This avoids sending base64 in POST responses — prevents 413
  const fetchSlide = async (idx: number, slide: MockupSlide) => {
    if (fetchedUrls[idx] || fetching[idx]) return
    // If we already have base64 directly (legacy), use it
    if (slide.base64) { setFetchedUrls(prev => ({ ...prev, [idx]: slide.base64! })); return }
    if (!slide.sessionId) return

    setFetching(prev => ({ ...prev, [idx]: true }))
    try {
      const token = localStorage.getItem("vendorToken") ?? ""
      const resp  = await fetch(`${API_URL}/mockup?session=${encodeURIComponent(slide.sessionId)}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const blob   = await resp.blob()
      const objUrl = URL.createObjectURL(blob)
      setFetchedUrls(prev => ({ ...prev, [idx]: objUrl }))
    } catch (err) {
      console.error(`[MockupSlider] Failed to fetch slide ${idx}:`, err)
    } finally {
      setFetching(prev => ({ ...prev, [idx]: false }))
    }
  }

  // Eagerly fetch all slides
  useEffect(() => {
    slides.forEach((slide, idx) => fetchSlide(idx, slide))
  }, [slides])

  // Also fetch active slide immediately when it changes
  useEffect(() => {
    if (slides[activeIdx]) fetchSlide(activeIdx, slides[activeIdx])
  }, [activeIdx])

  const activeUrl   = fetchedUrls[activeIdx]
  const activeSlide = slides[activeIdx]
  const isLoading   = !activeUrl && (fetching[activeIdx] || !fetchedUrls[activeIdx])

  return (
    <div style={{ background:"#fff", border:"1.5px solid #f0f0f0", borderRadius:"14px", overflow:"hidden", marginTop:"4px", maxWidth:"300px" }}>
      <div style={{ position:"relative", background:"#f8f8f8", minHeight:"200px", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {isLoading ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", padding:"24px" }}>
            <div style={{ width:"32px", height:"32px", border:`3px solid ${BRAND}`, borderTop:"3px solid transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
            <span style={{ fontSize:"12px", color:"#aaa" }}>Loading {activeSlide?.colorName} preview...</span>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : activeUrl ? (
          <>
            <img src={activeUrl} alt={`${activeSlide?.colorName} mockup`} style={{ width:"100%", display:"block" }} />
            <div style={{ position:"absolute", top:"8px", right:"8px", background:"rgba(255,255,255,0.92)", borderRadius:"20px", padding:"4px 8px", fontSize:"11px", color:"#555", display:"flex", alignItems:"center", gap:"4px", boxShadow:"0 1px 4px rgba(0,0,0,0.12)" }}>
              <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:activeSlide?.colorHex, border:"1px solid rgba(0,0,0,0.15)", flexShrink:0 }} />
              <span>{activeSlide?.colorName}</span>
            </div>
          </>
        ) : (
          <div style={{ padding:"24px", color:"#aaa", fontSize:"12px" }}>Preview unavailable</div>
        )}
        {slides.length > 1 && (
          <div style={{ position:"absolute", bottom:"8px", left:"50%", transform:"translateX(-50%)", display:"flex", gap:"5px" }}>
            {slides.map((_,i) => <div key={i} onClick={() => setActiveIdx(i)} style={{ width:i===activeIdx?"18px":"6px", height:"6px", borderRadius:"3px", background:i===activeIdx?BRAND:"rgba(255,255,255,0.75)", cursor:"pointer", transition:"all 0.2s", border:"1px solid rgba(0,0,0,0.15)" }} />)}
          </div>
        )}
      </div>
      {slides.length > 1 && (
        <div style={{ display:"flex", gap:"6px", padding:"10px 10px 4px", overflowX:"auto", scrollbarWidth:"none" }}>
          {slides.map((slide, i) => (
            <button key={i} onClick={() => setActiveIdx(i)} title={slide.colorName} style={{ flexShrink:0, width:"48px", height:"48px", borderRadius:"8px", overflow:"hidden", border:i===activeIdx?`2px solid ${BRAND}`:"2px solid #f0f0f0", cursor:"pointer", padding:0, background:"#f5f5f5", transition:"border 0.15s", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {fetchedUrls[i] ? <img src={fetchedUrls[i]} alt={slide.colorName} style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <div style={{ width:"20px", height:"20px", borderRadius:"50%", background:slide.colorHex, border:"1px solid rgba(0,0,0,0.1)" }} />}
            </button>
          ))}
        </div>
      )}
      <div style={{ display:"flex", gap:"8px", padding:"10px 12px" }}>
        <button onClick={() => {
          // FIX E1+E3: Pass session ID of the first slide so server can find the base64
          const firstSessionId = slides[0]?.sessionId ?? ""
          onApprove(firstSessionId)
        }} style={{ flex:1, padding:"8px", background:BRAND, color:"#fff", border:"none", borderRadius:"20px", fontWeight:600, fontSize:"13px", cursor:"pointer" }}>✅ Looks good!</button>
        <button onClick={onRetry} style={{ padding:"8px 12px", background:"#f5f5f5", color:"#666", border:"none", borderRadius:"20px", fontSize:"13px", cursor:"pointer" }}>🔄 Retry</button>
      </div>
    </div>
  )
}

function ProductCreatedCard({ product, onView, onCreateAnother }: { product: CreatedProduct; onView: () => void; onCreateAnother: () => void }) {
  return (
    <div style={{ background:"linear-gradient(135deg,#f0fff4,#e6ffec)", border:"1.5px solid #9ae6b4", borderRadius:"14px", padding:"14px", marginTop:"4px", maxWidth:"260px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
        <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#38a169", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <div><p style={{ margin:0, fontSize:"13.5px", fontWeight:700, color:"#1a4731" }}>Product created! 🎉</p><p style={{ margin:"1px 0 0", fontSize:"12px", color:"#276749" }}>{product.title}</p></div>
      </div>
      <div style={{ background:"rgba(255,255,255,0.6)", borderRadius:"8px", padding:"8px 10px", marginBottom:"10px", fontSize:"12px", color:"#555" }}>
        <div>📦 {product.variant_count} variants created</div>
        <div style={{ marginTop:"2px" }}>📝 Saved as Draft — publish from Products tab</div>
      </div>
      <div style={{ display:"flex", gap:"8px" }}>
        <button onClick={onView} style={{ flex:1, padding:"8px", background:"#38a169", color:"#fff", border:"none", borderRadius:"20px", fontWeight:600, fontSize:"13px", cursor:"pointer" }}>View product</button>
        <button onClick={onCreateAnother} style={{ padding:"8px 12px", background:"#f5f5f5", color:"#666", border:"none", borderRadius:"20px", fontSize:"13px", cursor:"pointer" }}>Make another</button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AIAssistant({ vendorId }: Props) {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Hey! I'm JUNI ✦\nYour JUNOONI store assistant. Ask me anything about your store, orders, earnings — or say **create a product** to build one right here in chat!",
    suggestions: ["Create a product", "What are my pending orders?", "How do payouts work?", "How to promote my store?"],
  }])
  const [input, setInput]           = useState("")
  const [loading, setLoading]       = useState(false)
  const [ticketState, setTicketState] = useState<TicketState>("idle")
  const [activeTool, setActiveTool]   = useState<string|undefined>(undefined)

  // FIX E1+E3: Store approved mockup SESSION ID (not base64) — sent to backend on create
  const approvedMockupSessionIdRef = useRef<string>("")
  const productSessionRef          = useRef<ProductSession>({ selectedColors: [], selectedSizes: [] })
  // Track if any product card has been selected in current session.
  // A single boolean is enough — once any card is selected, ALL card lists lock.
  // This survives re-renders unlike per-index tracking.
  const productSelectedRef = useRef<boolean>(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); setTimeout(() => inputRef.current?.focus(), 100) }
  }, [messages, loading, open])

  // Typewriter effect — streams text character by character so it feels like AI is thinking/writing
  const addAssistantMessage = (content: string, extra?: Partial<Message>) => {
    const markers    = parseMessageMarkers(content)
    const parsedActs = parseActions(markers.clean)
    const autoActs   = parsedActs.length > 0 ? parsedActs : detectRelevantActions(markers.clean)
    const baseMsg: Message = {
      role: "assistant", content: "", actions: autoActs, suggestions: detectSuggestions(markers.clean),
      showUpload: markers.showUpload, showColorPicker: markers.showColorPicker,
      showSizePicker: markers.showSizePicker, showColorSizePicker: markers.showColorSizePicker,
      showAreaPicker: markers.showAreaPicker, showSameOrDifferent: markers.showSameOrDifferent,
      showAreaUpload: markers.showAreaUpload, showPositionPicker: markers.showPositionPicker,
      ...extra,
    }
    // Start with empty content, stream the text in
    const msgIndex = Date.now()
    setMessages(prev => [...prev, { ...baseMsg, _streamId: msgIndex } as any])

    const fullText = markers.clean
    const chunkSize = 1   // 1 char per tick — natural reading pace
    const delay     = 22  // ms between ticks — ~45 chars/sec, feels human

    let i = 0
    const tick = () => {
      i += chunkSize
      const partial = fullText.slice(0, i)
      setMessages(prev => prev.map(m => (m as any)._streamId === msgIndex
        ? { ...m, content: partial }
        : m
      ))
      if (i < fullText.length) setTimeout(tick, delay)
    }
    if (fullText.length > 0) setTimeout(tick, delay)
    else setMessages(prev => prev.map(m => (m as any)._streamId === msgIndex ? { ...m, content: fullText } : m))
  }

  // FIX E3: Send only session ID in body — never the base64 blob
  const sendToBackend = async (msgs: Message[], extra?: Record<string, any>) => {
    const token = localStorage.getItem("vendorToken") ?? ""
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({
        messages: msgs, vendorId,
        currentPage: window.location.pathname,
        // FIX E3: Only send session ID, never base64
        approvedMockupSessionId: approvedMockupSessionIdRef.current || undefined,
        productSession: productSessionRef.current,
        ...extra,
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }

  // FIX E1+E3: Store mockup server-side, get session ID back
  const storeApprovedMockup = async (sessionId: string) => {
    if (!sessionId) return
    // The sessionId already points to a server-stored mockup — just save the reference
    approvedMockupSessionIdRef.current = sessionId
    console.log(`[AIAssistant] Approved mockup session: ${sessionId}`)
  }

  // FIX E3: Process renderData — mockup slides now use session IDs not base64
  const processRenderData = (renderData: any[]): Partial<Message> => {
    const extra: Partial<Message> = {}
    const mockupSlides: MockupSlide[] = []
    // Capture blank data for client-side mockup generation
    for (const rd of renderData) {
      if (rd.render_type === "BLANK_DETAILS" && rd.blankData) {
        productSessionRef.current.blankData = rd.blankData
      }
    }

    for (const rd of renderData) {
      if (rd.render_type === "PRODUCT_CARD_LIST" && rd.products?.length > 0) {
        extra.productCards = rd.products
      }
      if (rd.render_type === "MOCKUP_PREVIEW") {
        // FIX E3: Use session ID — fetch the image lazily via GET in MockupSlider
        mockupSlides.push({
          sessionId: rd.mockup_session_id,    // server-side session ID
          base64:    rd.preview_base64,        // may be undefined (stripped server-side)
          colorHex:  rd.color_hex  ?? "#cccccc",
          colorName: rd.color_name ?? rd.color_hex ?? "Preview",
          area:      rd.area       ?? "front",
        })
      }
      if (rd.render_type === "PRODUCT_CREATED") {
        approvedMockupSessionIdRef.current = ""
        extra.createdProduct = {
          product_id: rd.product_id, title: rd.title,
          dashboard_url: rd.dashboard_url, variant_count: rd.variant_count,
        }
      }
    }

    if (mockupSlides.length > 0) {
      extra.mockupSlides  = mockupSlides
      extra.mockupPreview = mockupSlides[0].base64  // may be undefined
    }

    return extra
  }

  const sendMessage = async (overrideText?: string) => {
    const userText = (overrideText ?? input).trim()
    if (!userText || loading) return
    setInput(""); setLoading(true); setActiveTool(undefined)
    const newMessages = [...messages, { role:"user" as const, content: userText }]
    setMessages(newMessages)

    try {
      if (ticketState === "confirm") {
        if (isYes(userText)) { setTicketState("collect"); addAssistantMessage("Please describe your issue below in detail ✍️") }
        else if (isNo(userText)) { setTicketState("idle"); addAssistantMessage("No problem! Anything else I can help with? 😊") }
        else addAssistantMessage("Please reply with Yes or No.")
        setLoading(false); return
      }
      if (ticketState === "collect") {
        setTicketState("sending"); addAssistantMessage("Got it! Sending to support team... ⏳")
        try {
          await sendToBackend(newMessages, { action:"send_support_email", supportMessage: userText })
          setTicketState("idle"); addAssistantMessage("✅ Sent to support@junooni.com!\n\nThey'll get back to you within 24–48 hours.")
        } catch { setTicketState("idle"); addAssistantMessage("Sorry, issue sending email. Please contact support@junooni.com directly 🙏") }
        setLoading(false); return
      }
      if (ticketState === "idle" && detectsSupportIntent(userText)) {
        setTicketState("confirm"); addAssistantMessage("I can connect you with our support team! 🙋\n\nWould you like to raise a support ticket?\n\nReply **Yes** or **No**.")
        setLoading(false); return
      }

      const data = await sendToBackend(newMessages)
      if (data.toolCalled) setActiveTool(data.toolCalled)
      const extra: Partial<Message> = data.renderData?.length > 0 ? processRenderData(data.renderData) : {}
      addAssistantMessage(data.reply, extra)
    } catch {
      addAssistantMessage("Sorry, kuch issue ho gaya. Please try again ya support@junooni.com pe reach out karo!")
      setTicketState("idle")
    } finally { setLoading(false); setActiveTool(undefined) }
  }

  const sendMessageWithCleanHistory = async (userText: string, selectedProduct: ProductCard) => {
    if (loading) return
    setLoading(true); setActiveTool(undefined)
    productSessionRef.current = { selectedColors: [], selectedSizes: [], blankName: selectedProduct.name, blankId: selectedProduct.id, technologyId: selectedProduct.technology_id ?? "" }
    approvedMockupSessionIdRef.current = ""
    productSelectedRef.current = true  // lock all future card lists immediately
    const freshMessages: Message[] = [{ role:"user", content: userText }]
    setMessages([{ role:"assistant", content: `Getting details for **${selectedProduct.name}**...` }])
    try {
      const token = localStorage.getItem("vendorToken") ?? ""
      const res = await fetch(API_URL, {
        method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`}, credentials:"include",
        body: JSON.stringify({ messages: freshMessages, vendorId, currentPage: window.location.pathname, freshProductSession: true, productSession: productSessionRef.current }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const extra: Partial<Message> = data.renderData?.length > 0 ? processRenderData(data.renderData) : {}
      const markers = parseMessageMarkers(data.reply ?? "")
      setMessages([{ role:"user", content: userText }, { role:"assistant", content: markers.clean, actions: detectRelevantActions(markers.clean), suggestions: detectSuggestions(markers.clean), showUpload: markers.showUpload, showColorPicker: markers.showColorPicker, showSizePicker: markers.showSizePicker, showColorSizePicker: markers.showColorSizePicker, showAreaPicker: markers.showAreaPicker, showSameOrDifferent: markers.showSameOrDifferent, showAreaUpload: markers.showAreaUpload, showPositionPicker: markers.showPositionPicker, ...extra }])
    } catch { setMessages([{ role:"user", content: userText }, { role:"assistant", content: "Sorry, kuch issue ho gaya. Please try again!" }]) }
    finally { setLoading(false); setActiveTool(undefined) }
  }

  const getPlaceholder = () => {
    if (ticketState === "confirm") return "Type 'yes' to raise a ticket or 'no' to cancel..."
    if (ticketState === "collect") return "Describe your issue in detail..."
    return "Ask JUNI anything..."
  }

  return (
    <>
      <style>{`
        @keyframes juni-panel-in{0%{opacity:0;transform:scale(0.88) translateY(18px)}100%{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes juni-msg-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        .juni-panel{animation:juni-panel-in 0.22s cubic-bezier(0.34,1.5,0.64,1) forwards}
        .juni-msg{animation:juni-msg-in 0.16s ease forwards}
        .juni-action-btn:hover{background:#fff5f0 !important;border-color:#E8621A !important;color:#E8621A !important}
        .juni-suggest-btn:hover{background:#fff5f0 !important;border-color:#f0c8b0 !important;color:#E8621A !important}
        .juni-send:hover:not(:disabled){filter:brightness(1.1);transform:scale(1.06)}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#e0d0c8;border-radius:4px}
        .juni-cloud-fab:hover{transform:scale(1.04) translateY(-2px) !important}
      `}</style>

      {!open && (
        <div onClick={() => setOpen(true)} style={{ position:"fixed", bottom:"24px", right:"24px", zIndex:9999, display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", cursor:"pointer" }}>
          <div style={{ position:"relative", width:"100%", height:"26px" }}>
            <div style={{ position:"absolute", bottom:"6px", left:"-14px", background:"#fff", borderRadius:"16px", padding:"6px 13px", boxShadow:"0 3px 16px rgba(0,0,0,0.12)", border:"1px solid rgba(232,98,26,0.15)", whiteSpace:"nowrap" }}><span style={{ color:BRAND, fontWeight:700, fontSize:"13px" }}>Ask JUNI</span></div>
            <div style={{ position:"absolute", bottom:"-6px", left:"8px", width:"10px", height:"10px", borderRadius:"50%", background:"#fff", border:"1px solid rgba(232,98,26,0.15)" }} />
            <div style={{ position:"absolute", bottom:"-13px", left:"20px", width:"6px", height:"6px", borderRadius:"50%", background:"#fff", border:"1px solid rgba(232,98,26,0.15)" }} />
          </div>
          <div className="juni-cloud-fab" style={{ width:"56px", height:"56px", borderRadius:"50%", background:"linear-gradient(135deg,#fff5f0,#ffe0cc)", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", transition:"transform 0.2s ease" }}>
            <video src={JUNI2} autoPlay loop muted playsInline style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
        </div>
      )}

      {open && (
        <div onClick={() => setOpen(false)} style={{ position:"fixed", bottom:"24px", right:"24px", width:"52px", height:"52px", borderRadius:"50%", background:"#1a1a1a", boxShadow:"0 4px 20px rgba(0,0,0,0.25)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:9999 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </div>
      )}

      {open && (
        <div className="juni-panel" style={{ position:"fixed", bottom:"88px", right:"24px", width:"380px", height:"520px", background:"#fff", borderRadius:"20px", boxShadow:"0 12px 48px rgba(0,0,0,0.16)", zIndex:9998, display:"flex", flexDirection:"column", overflow:"hidden", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", border:"1px solid rgba(0,0,0,0.06)" }}>

          {/* Header */}
          <div style={{ background:"linear-gradient(135deg,#FF7A35 0%,#E8621A 60%,#c94e10 100%)", padding:"14px 16px", display:"flex", alignItems:"center", gap:"12px", flexShrink:0, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:"-40px", right:"-20px", width:"120px", height:"120px", background:"radial-gradient(circle,rgba(255,255,255,0.12) 0%,transparent 70%)", pointerEvents:"none" }} />
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:"rgba(255,255,255,0.2)", border:"2px solid rgba(255,255,255,0.45)", overflow:"hidden", flexShrink:0 }}>
              <video src={JUNI2} autoPlay muted playsInline style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:"#fff", fontWeight:700, fontSize:"15px", display:"flex", alignItems:"center", gap:"6px" }}>JUNI <GeminiStar size={14} /></div>
              <div style={{ color:"rgba(255,255,255,0.8)", fontSize:"11.5px", marginTop:"2px", display:"flex", alignItems:"center", gap:"5px" }}>
                <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#7dff9a", boxShadow:"0 0 6px #7dff9a", display:"inline-block" }} />
                Your JUNOONI store assistant
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:"50%", width:"28px", height:"28px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.35)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.2)")}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"16px 14px", display:"flex", flexDirection:"column", gap:"12px", background:"#fafafa" }}>
            {messages.map((msg, i) => (
              <div key={i} className="juni-msg" style={{ display:"flex", flexDirection: msg.role==="user"?"row-reverse":"row", alignItems:"flex-end", gap:"8px" }}>
                {msg.role === "assistant" && (
                  <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#fff5f0,#ffe0cc)", flexShrink:0, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <img src={JUNI} alt="JUNI" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{ e.currentTarget.style.display="none"; e.currentTarget.parentElement!.innerHTML='<span style="color:#E8621A;font-size:11px;font-weight:700">J</span>' }} />
                  </div>
                )}
                <div style={{ maxWidth:"84%", display:"flex", flexDirection:"column", gap:"6px" }}>
                  <div style={{ padding:"10px 14px", borderRadius: msg.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px", background: msg.role==="user"?"linear-gradient(135deg,#FF7A35,#E8621A)":"#fff", color: msg.role==="user"?"#fff":"#1a1a1a", fontSize:"13.5px", lineHeight:"1.6", boxShadow: msg.role==="user"?"0 2px 12px rgba(232,98,26,0.3)":"0 1px 4px rgba(0,0,0,0.08)", border: msg.role==="assistant"?"1px solid #f0f0f0":"none" }}>
                    {renderMarkdown(msg.content, msg.role==="user")}
                  </div>

                  {msg.showColorSizePicker && (
                    <ColorSizePicker colors={msg.showColorSizePicker.colors} sizes={msg.showColorSizePicker.sizes}
                      onConfirm={(colors, sizes) => {
                        productSessionRef.current.selectedColors = colors
                        productSessionRef.current.selectedSizes  = sizes
                        const colorStr = colors.map(c => `${c.name}:${c.hex}`).join(", ")
                        sendMessage(`Colors: ${colors.map(c=>c.name).join(", ")} | Sizes: ${sizes.join(", ")} | HEX: ${colorStr}`)
                      }}
                    />
                  )}

                  {msg.showColorPicker && !msg.showColorSizePicker && (
                    <ColorSizePicker colors={msg.showColorPicker.colors} sizes={[]}
                      onConfirm={(colors) => {
                        productSessionRef.current.selectedColors = colors
                        const colorStr = colors.map(c => `${c.name}:${c.hex}`).join(", ")
                        sendMessage(`I want these colors: ${colors.map(c=>c.name).join(", ")} (${colorStr})`)
                      }}
                    />
                  )}

                  {msg.showSizePicker && !msg.showColorSizePicker && (
                    <SizePicker sizes={msg.showSizePicker.sizes}
                      onSelect={(selected) => { productSessionRef.current.selectedSizes = selected; sendMessage(`I want these sizes: ${selected.join(", ")}`) }}
                    />
                  )}

                  {msg.showAreaPicker && (
                    <AreaPicker areas={msg.showAreaPicker.areas}
                      onSelect={(areas) => {
                        productSessionRef.current.selectedAreas = areas.map(a => a.toLowerCase())
                        productSessionRef.current.area = areas[0]?.toLowerCase()
                        productSessionRef.current.designsByArea = {}
                        productSessionRef.current.pendingAreaUploads = areas.map(a => a.toLowerCase())

                        if (areas.length > 1) {
                          // Multiple areas — show same/different question client-side ONLY
                          // DO NOT sendMessage to Gemini yet (it would show SHOW_POSITION before upload)
                          addAssistantMessage(
                            `You selected ${areas.length} areas: **${areas.join(", ")}**.\n\nDo you want to use the same design image for all areas, or upload different images for each?`,
                            { showSameOrDifferent: { areas } } as any
                          )
                          // Tell Gemini about selection silently (it won't respond to this — it's info only)
                          // We'll send the actual trigger after ALL uploads complete
                        } else {
                          // Single area — show uploader directly, then Gemini gets triggered after upload
                          addAssistantMessage(
                            `Got it! Upload your design for **${areas[0]}**:`,
                            { showAreaUpload: { area: areas[0].toLowerCase(), areaIndex: 0, totalAreas: 1 } } as any
                          )
                        }
                      }}
                    />
                  )}

                  {/* Multi-area: same or different design question */}
                  {msg.showSameOrDifferent && (
                    <SameOrDifferentPicker
                      areas={msg.showSameOrDifferent.areas}
                      onSelect={(same) => {
                        productSessionRef.current.sameDesignForAllAreas = same
                        const areas = productSessionRef.current.selectedAreas ?? []
                        if (same) {
                          // Same design — show single uploader, will be reused for all areas
                          addAssistantMessage(
                            `Got it! Upload your design once — it'll be placed on all ${areas.length} areas.`,
                            { showAreaUpload: { area: areas[0] ?? "front", areaIndex: 0, totalAreas: 1 } } as any
                          )
                        } else {
                          // Different designs — show uploader for first area
                          addAssistantMessage(
                            `Got it! Let's upload designs one by one. Starting with **${areas[0]}**:`,
                            { showAreaUpload: { area: areas[0] ?? "front", areaIndex: 0, totalAreas: areas.length } } as any
                          )
                        }
                      }}
                    />
                  )}

                  {/* Per-area design uploader */}
                  {msg.showAreaUpload && (
                    <AreaDesignUploader
                      area={msg.showAreaUpload.area}
                      areaIndex={msg.showAreaUpload.areaIndex}
                      totalAreas={msg.showAreaUpload.totalAreas}
                      vendorId={vendorId}
                      onUploadComplete={(sessionId, filename, base64) => {
                        const session = productSessionRef.current
                        const area    = msg.showAreaUpload!.area
                        const areas   = session.selectedAreas ?? [area]

                        // Store design for this area
                        if (!session.designsByArea) session.designsByArea = {}
                        session.designsByArea[area] = { sessionId, base64, filename }

                        // Primary design = first area's design
                        if (!session.designBase64) {
                          session.designBase64    = base64
                          session.designSessionId = sessionId
                        }

                        if (session.sameDesignForAllAreas) {
                          // Replicate to all other areas
                          for (const a of areas) {
                            session.designsByArea[a] = { sessionId, base64, filename }
                          }
                          session.pendingAreaUploads = []
                          sendMessage(`Design ready for ${areas ? areas[0] ?? "front" : "front"} area. Session: ${sessionId}. File: ${filename}`)
                        } else {
                          // Remove this area from pending
                          session.pendingAreaUploads = (session.pendingAreaUploads ?? []).filter(a => a !== area)

                          if (session.pendingAreaUploads.length > 0) {
                            // More areas to upload
                            const nextArea  = session.pendingAreaUploads[0]
                            const nextIdx   = areas.indexOf(nextArea)
                            addAssistantMessage(
                              `✅ Got the ${area} design! Now upload for **${nextArea}**:`,
                              { showAreaUpload: { area: nextArea, areaIndex: nextIdx, totalAreas: areas.length } } as any
                            )
                          } else {
                            // All areas uploaded — proceed
                            sendMessage(`All area designs ready. Session: ${sessionId}. Areas: ${areas.join(", ")}`)
                          }
                        }
                      }}
                    />
                  )}

                  {msg.showPositionPicker && (
                    <PositionPicker area={msg.showPositionPicker.area}
                      onSelect={async (position) => {
                        productSessionRef.current.position = position
                        const session = productSessionRef.current

                        // Generate mockups CLIENT-SIDE using the same renderMockupDirectly
                        // that the Canvas designer uses — zero new logic, pure reuse
                        if (
                          session.blankData &&
                          session.technologyId &&
                          session.selectedColors?.length > 0 &&
                          session.designBase64 &&
                          session.area
                        ) {
                          setLoading(true)
                          setActiveTool("generate_inline_mockup")
                          try {
                            const designsByArea = session.designsByArea ?? {}
                            const areaCount     = Object.keys(designsByArea).length
                            const isMultiArea   = areaCount > 1

                            // Multi-area: generate mockup per area × color
                            // Single-area: generate all color variants for the one area
                            const results = isMultiArea
                              ? await generateJuniMockupsAllAreasAllColors({
                                  blankData:          session.blankData,
                                  technologyId:       session.technologyId!,
                                  selectedColors:     session.selectedColors,
                                  designsByArea,
                                  defaultDesignBase64: session.designBase64!,
                                  targetResolution:   1000,
                                  onProgress: (_done, _total, label) => { if (label !== 'done') setActiveTool("generate_inline_mockup") },
                                })
                              : await generateJuniMockupsAllColors({
                                  blankData:      session.blankData,
                                  technologyId:   session.technologyId!,
                                  selectedColors: session.selectedColors,
                                  designBase64:   session.designBase64!,
                                  area:           session.area!,
                                  position,
                                  targetResolution: 1000,
                                  onProgress: (_done, _total, name) => { if (name !== 'done') setActiveTool("generate_inline_mockup") },
                                })

                            if (results.length > 0) {
                              // Upload all color mockups to backend store, get session IDs
                              const token = localStorage.getItem("vendorToken") ?? ""
                              const slides: MockupSlide[] = []

                              for (const result of results) {
                                try {
                                  const res = await fetch(API_URL, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                    credentials: "include",
                                    body: JSON.stringify({
                                      action:    "store_mockup",
                                      vendorId,
                                      base64:    result.base64,
                                      area:      (result as any).area ?? session.area ?? "front",
                                      colorName: result.colorName,
                                      messages:  [],
                                    }),
                                  })
                                  if (res.ok) {
                                    const data = await res.json()
                                    slides.push({
                                      sessionId: data.mockupSessionId,
                                      colorHex:  result.colorHex,
                                      colorName: (result as any).area
                                        ? `${result.colorName} / ${(result as any).area}`
                                        : result.colorName,
                                      area:      (result as any).area ?? session.area ?? "front",
                                    })
                                  }
                                } catch (uploadErr) {
                                  console.error("[JUNI] Failed to upload mockup:", uploadErr)
                                }
                              }

                              if (slides.length > 0) {
                                // Store first slide session as approved mockup
                                approvedMockupSessionIdRef.current = slides[0].sessionId ?? ""

                                // Store calculated pricing — sent in productSession POST body
                                const firstPricing = results[0]?.pricing
                                if (firstPricing) {
                                  productSessionRef.current.calculatedPrice = firstPricing.suggestedSellingPrice
                                  productSessionRef.current.priceBreakdown  = firstPricing
                                }

                                // Generate canvas layouts for ALL areas
                                // For multi-area: one layout per area; for single: one layout
                                const areasToLayout = Object.keys(session.designsByArea ?? {}).length > 1
                                  ? Object.keys(session.designsByArea ?? {})
                                  : [session.area ?? "front"]

                                const canvasLayouts: string[] = []
                                for (const layoutArea of areasToLayout) {
                                  try {
                                    const areaDesign = session.designsByArea?.[layoutArea]?.base64 ?? session.designBase64!
                                    const layoutBase64 = await generateJuniCanvasLayout({
                                      blankData:        session.blankData,
                                      technologyId:     session.technologyId!,
                                      selectedColorHex: session.selectedColors[0].hex,
                                      designBase64:     areaDesign,
                                      area:             layoutArea,
                                    })
                                    if (layoutBase64) {
                                      canvasLayouts.push(layoutBase64)
                                      console.log(`[JUNI] Canvas layout generated for area: ${layoutArea}`)
                                    }
                                  } catch (layoutErr: any) {
                                    console.warn(`[JUNI] Canvas layout failed for ${layoutArea}:`, layoutErr.message)
                                  }
                                }
                                // Store all canvas layouts as JSON array for backend
                                if (canvasLayouts.length > 0) {
                                  productSessionRef.current.canvasLayoutBase64 = canvasLayouts[0]  // primary
                                  productSessionRef.current.allCanvasLayouts = canvasLayouts        // all areas
                                }

                                addAssistantMessage(
                                  `Here's your preview! Swipe to see all ${slides.length > 1 ? `${slides.length} color variants` : 'options'} 👆

Does this look good?`,
                                  { mockupSlides: slides }
                                )
                                setLoading(false)
                                setActiveTool(undefined)
                                return
                              }
                            }
                          } catch (err: any) {
                            console.error("[JUNI] Client-side mockup generation failed:", err.message)
                            // Fall through to backend generation
                          }
                          setLoading(false)
                          setActiveTool(undefined)
                        }

                        // Fallback: let Gemini call generate_inline_mockup on backend
                        sendMessage(`Place the design at ${position}`)
                      }}
                    />
                  )}

                  {/* Lock ALL card lists once any product is selected */}
                  {msg.productCards && msg.productCards.length > 0 && (
                    <ProductCardList
                      products={msg.productCards}
                      isLockedByParent={productSelectedRef.current}
                      onSelect={(index, product) => {
                        productSelectedRef.current = true  // lock all card lists globally
                        sendMessageWithCleanHistory(`I want option ${index}: ${product.name}`, product)
                      }}
                    />
                  )}

                  {msg.showUpload && msg.role === "assistant" && (
                    <DesignUploader vendorId={vendorId}
                      onUploadComplete={(sessionId, filename, base64) => { productSessionRef.current.designSessionId = sessionId; productSessionRef.current.designBase64 = base64; sendMessage(`Design ready. Session: ${sessionId}. File: ${filename}`) }}
                      onSkip={() => sendMessage("I will skip the design for now, just create the product")}
                    />
                  )}

                  {/* FIX E3: MockupSlider fetches images via GET — no base64 in POST */}
                  {msg.mockupSlides && msg.mockupSlides.length > 0 && (
                    <MockupSlider
                      slides={msg.mockupSlides}
                      onApprove={(approvedSessionId) => {
                        storeApprovedMockup(approvedSessionId)
                        // Send approval with pricing context for Gemini's STEP 5
                        // Gemini will present the breakdown naturally and ask for selling price
                        // Pass pricing context silently in system field — not visible in chat
                        const p = productSessionRef.current.priceBreakdown
                        const pricingContext = p
                          ? ` CONTEXT_PRICING: blank=${p.blankProductCost} printing=${p.basePrintingCost} gst=${p.printingGSTAmount} shipping=${p.shippingCharges} cost=${p.finalPrice} suggested=${p.suggestedSellingPrice}`
                          : ""
                        sendMessage(`Preview approved.${pricingContext}`)
                      }}
                      onRetry={() => sendMessage("Please regenerate the mockup preview.")}
                    />
                  )}

                  {msg.createdProduct && (
                    <ProductCreatedCard product={msg.createdProduct}
                      onView={() => { window.location.href = msg.createdProduct!.dashboard_url }}
                      onCreateAnother={() => { productSessionRef.current = { selectedColors:[], selectedSizes:[] }; approvedMockupSessionIdRef.current = ""; productSelectedRef.current = false; sendMessage("I want to create another product") }}
                    />
                  )}

                  {msg.role==="assistant" && msg.actions && msg.actions.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", paddingLeft:"2px" }}>
                      {msg.actions.map((action, ai) => (
                        <a key={ai} href={action.url} className="juni-action-btn" style={{ display:"inline-flex", alignItems:"center", gap:"5px", padding:"6px 12px", background:"#fff", border:"1.5px solid #f0d0c0", borderRadius:"20px", color:BRAND, fontSize:"12.5px", fontWeight:600, textDecoration:"none", boxShadow:"0 1px 4px rgba(232,98,26,0.12)", transition:"all 0.15s ease" }}>
                          {action.icon && <span>{action.icon}</span>}<span>{action.label}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {msg.role==="assistant" && i===messages.length-1 && msg.suggestions && msg.suggestions.length>0 && !loading && ticketState==="idle" && !msg.showColorPicker && !msg.showSizePicker && !msg.showColorSizePicker && !msg.showAreaPicker && !msg.showPositionPicker && !msg.showUpload && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", paddingLeft:"2px", marginTop:"2px" }}>
                      {msg.suggestions.map((s,si) => <button key={si} onClick={() => sendMessage(s)} className="juni-suggest-btn" style={{ padding:"5px 11px", background:"#fafafa", border:"1px solid #e8e8e8", borderRadius:"16px", color:"#666", fontSize:"12px", cursor:"pointer", transition:"all 0.15s ease", fontFamily:"inherit" }}>{s}</button>)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {ticketState==="confirm" && !loading && (
              <div style={{ display:"flex", gap:"8px", paddingLeft:"36px" }}>
                <button onMouseDown={() => sendMessage("yes")} style={{ padding:"8px 16px", background:`linear-gradient(135deg,#FF7A35,${BRAND})`, color:"#fff", border:"none", borderRadius:"20px", cursor:"pointer", fontSize:"13px", fontWeight:600 }}>✅ Yes, raise a ticket</button>
                <button onMouseDown={() => sendMessage("no")} style={{ padding:"8px 16px", background:"#f0f0f0", color:"#555", border:"none", borderRadius:"20px", cursor:"pointer", fontSize:"13px", fontWeight:600 }}>✕ No thanks</button>
              </div>
            )}

            {loading && <TypingIndicator toolName={activeTool} />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding:"10px 12px", borderTop:"1px solid #efefef", display:"flex", gap:"8px", flexShrink:0, background:"#fff" }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder={getPlaceholder()}
              style={{ flex:1, padding:"10px 14px", borderRadius:"22px", border:"1.5px solid #e8e8e8", fontSize:"13.5px", outline:"none", background:"#fafafa", color:"#1a1a1a", fontFamily:"inherit" }}
              onFocus={e => e.currentTarget.style.borderColor=BRAND}
              onBlur={e => e.currentTarget.style.borderColor="#e8e8e8"}
            />
            <button className="juni-send" onClick={() => sendMessage()} disabled={loading || !input.trim()}
              style={{ background: loading||!input.trim()?"#e0e0e0":`linear-gradient(135deg,#FF7A35,${BRAND})`, color:"#fff", border:"none", borderRadius:"50%", width:"38px", height:"38px", cursor: loading||!input.trim()?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow: loading||!input.trim()?"none":"0 2px 10px rgba(232,98,26,0.35)", transition:"all 0.15s ease" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            </button>
          </div>
          <div style={{ padding:"5px 12px 8px", textAlign:"center", fontSize:"10.5px", color:"#ccc", background:"#fff", flexShrink:0 }}>Powered by JUNOONI</div>
        </div>
      )}
    </>
  )
}