import { useState, useRef, useEffect } from "react"
import JUNI from "../assets/JUNI.png"
import JUNI2 from "../assets/JUNI-video.mp4"

interface Message {
  role: "user" | "assistant"
  content: string
}

type TicketState = "idle" | "confirm" | "collect" | "sending"

interface Props {
  vendorId: string
}

const API_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL
  ? `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/ai-assistant`
  : "http://localhost:9000/vendors/ai-assistant"

const BRAND = "#E8621A"

const SUPPORT_TRIGGERS = [
  "talk to support", "contact support", "human support",
  "speak to someone", "talk to a person", "talk to human", "real person",
  "connect me to", "raise a ticket", "support ticket", "email support",
  "need help from", "contact a person", "i want to contact",
  "talk to someone", "speak with a human", "speak with support",
  "support@junooni.com",
  "not received my payment", "not received my payout", "payout not received",
  "payment not received", "where is my payout", "where is my payment",
  "when will i get my payout", "when will i get my payment",
  "my payout is pending", "payout pending", "payment pending",
  "last month payout", "last month payment", "payout of my last month",
  "not credited", "money not received",
  "baat karni hai", "support chahiye", "insaan se baat", "human se baat",
  "paise nahi aaye", "payment nahi aaya", "payout nahi aaya",
  "mujhe baat karni", "kisi se baat",
]

function detectsSupportIntent(msg: string) {
  const lower = msg.toLowerCase()
  return SUPPORT_TRIGGERS.some((t) => lower.includes(t))
}
function isYes(msg: string) {
  return ["yes","y","haan","ha","han","haa","ok","okay","sure","yeah","yep"].includes(msg.trim().toLowerCase())
}
function isNo(msg: string) {
  return ["no","n","nahi","nope","nah","na","not now","cancel"].includes(msg.trim().toLowerCase())
}

// ── Simple markdown renderer ──────────────────────────────────────────────────
function renderMarkdown(text: string, isUser: boolean): React.ReactNode {
  const lines = text.split("\n")
  const elements: React.ReactNode[] = []
  let i = 0

  const parseInline = (line: string): React.ReactNode => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return (<>{parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx} style={{ fontWeight: 700, color: isUser ? "#fff" : "#1a1a1a" }}>{part.slice(2, -2)}</strong>
      }
      const iparts = part.split(/(\*[^*]+\*)/g)
      return (<span key={idx}>{iparts.map((ip, iidx) => {
        if (ip.startsWith("*") && ip.endsWith("*") && ip.length > 2) {
          return <em key={iidx}>{ip.slice(1, -1)}</em>
        }
        return <span key={iidx}>{ip}</span>
      })}</span>)
    })}</>)
  }

  while (i < lines.length) {
    const line = lines[i]
    if (/^---+$/.test(line.trim())) { i++; continue }

    if (line.startsWith("### ")) {
      elements.push(<div key={i} style={{ fontWeight: 700, fontSize: "11.5px", color: isUser ? "rgba(255,255,255,0.9)" : BRAND, marginTop: "10px", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{line.replace(/^### /, "")}</div>)
      i++; continue
    }
    if (line.startsWith("## ")) {
      elements.push(<div key={i} style={{ fontWeight: 700, fontSize: "14px", color: isUser ? "#fff" : "#1a1a1a", marginTop: "8px", marginBottom: "3px" }}>{line.replace(/^## /, "")}</div>)
      i++; continue
    }
    if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\.\s(.*)/)
      if (num) {
        elements.push(<div key={i} style={{ display: "flex", gap: "8px", marginBottom: "4px", alignItems: "flex-start" }}>
          <span style={{ color: isUser ? "rgba(255,255,255,0.75)" : BRAND, fontWeight: 700, fontSize: "12px", minWidth: "18px", paddingTop: "1px", flexShrink: 0 }}>{num[1]}.</span>
          <span style={{ flex: 1, fontSize: "13.5px", lineHeight: "1.55" }}>{parseInline(num[2])}</span>
        </div>)
      }
      i++; continue
    }
    if (line.startsWith("- ") || line.startsWith("• ")) {
      const txt = line.replace(/^[-•]\s/, "")
      elements.push(<div key={i} style={{ display: "flex", gap: "8px", marginBottom: "4px", alignItems: "flex-start" }}>
        <span style={{ color: isUser ? "rgba(255,255,255,0.75)" : BRAND, fontSize: "18px", lineHeight: "1", minWidth: "14px", flexShrink: 0 }}>·</span>
        <span style={{ flex: 1, fontSize: "13.5px", lineHeight: "1.55" }}>{parseInline(txt)}</span>
      </div>)
      i++; continue
    }
    if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: "5px" }} />)
      i++; continue
    }
    elements.push(<div key={i} style={{ fontSize: "13.5px", lineHeight: "1.6", marginBottom: "1px" }}>{parseInline(line)}</div>)
    i++
  }
  return <>{elements}</>
}


// ── Gemini-style 4-point star (static, used in header) ───────────────────────
function GeminiStar({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="gstar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9A5C" />
          <stop offset="50%" stopColor="#E8621A" />
          <stop offset="100%" stopColor="#c94e10" />
        </linearGradient>
      </defs>
      <path d="M12 2C12 2 13.2 9.5 17 12C13.2 14.5 12 22 12 22C12 22 10.8 14.5 7 12C10.8 9.5 12 2 12 2Z" fill="url(#gstar)" />
      <path d="M5 5C5 5 5.8 8.5 8 10C5.8 11.5 5 15 5 15C5 15 4.2 11.5 2 10C4.2 8.5 5 5 5 5Z" fill="url(#gstar)" opacity="0.55" />
      <path d="M20 14C20 14 20.6 16.5 22 17.5C20.6 18.5 20 21 20 21C20 21 19.4 18.5 18 17.5C19.4 16.5 20 14 20 14Z" fill="url(#gstar)" opacity="0.4" />
    </svg>
  )
}

// ── Gemini-style typing: animated gradient diamond ───────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
      <div style={{
        width: "28px", height: "28px", borderRadius: "50%",
        background: "linear-gradient(135deg, #fff5f0, #ffe0cc)",
        border: "1.5px solid #f0c8b0",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, overflow: "hidden",
      }}>
        <img src={JUNI} alt="JUNI"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement!.innerHTML = '<span style="color:#E8621A;font-size:11px;font-weight:700">J</span>' }}
        />
      </div>
      <div style={{
        background: "#fff", border: "1px solid #f0f0f0",
        borderRadius: "18px 18px 18px 4px",
        padding: "12px 18px",
        display: "flex", alignItems: "center", gap: "10px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      }}>
        <style>{`
          @keyframes juni-gem-1 { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.6)} }
          @keyframes juni-gem-2 { 0%,100%{opacity:0.3;transform:scale(0.6)} 50%{opacity:1;transform:scale(1)} }
          @keyframes juni-gem-gradient {
            0%   { stop-color: #E8621A; }
            25%  { stop-color: #FF7A35; }
            50%  { stop-color: #c94e10; }
            75%  { stop-color: #FF9A5C; }
            100% { stop-color: #E8621A; }
          }
          .gem-s1 { animation: juni-gem-gradient 2s linear infinite; }
          .gem-s2 { animation: juni-gem-gradient 2s linear infinite 0.5s; }
          .gem-star-big { animation: juni-gem-1 1.6s ease-in-out infinite; transform-origin: center; }
          .gem-star-sm1 { animation: juni-gem-2 1.6s ease-in-out infinite 0.3s; transform-origin: center; }
          .gem-star-sm2 { animation: juni-gem-2 1.6s ease-in-out infinite 0.6s; transform-origin: center; }
        `}</style>
        {/* Gemini-style multi-star with gradient animation */}
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <defs>
            <linearGradient id="tg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="gem-s1" />
              <stop offset="100%" className="gem-s2" />
            </linearGradient>
          </defs>
          {/* Main big star */}
          <g className="gem-star-big">
            <path d="M14 2C14 2 15.5 11 20 14C15.5 17 14 26 14 26C14 26 12.5 17 8 14C12.5 11 14 2 14 2Z" fill="url(#tg1)" />
          </g>
          {/* Small top-right star */}
          <g className="gem-star-sm1">
            <path d="M22 4C22 4 22.8 7.5 25 9C22.8 10.5 22 14 22 14C22 14 21.2 10.5 19 9C21.2 7.5 22 4 22 4Z" fill="url(#tg1)" opacity="0.7" />
          </g>
          {/* Small bottom-left star */}
          <g className="gem-star-sm2">
            <path d="M6 17C6 17 6.6 19.5 8 20.5C6.6 21.5 6 24 6 24C6 24 5.4 21.5 4 20.5C5.4 19.5 6 17 6 17Z" fill="url(#tg1)" opacity="0.5" />
          </g>
        </svg>
        <span style={{ fontSize: "13px", color: "#bbb", fontStyle: "italic", letterSpacing: "0.01em" }}>JUNI is thinking...</span>
      </div>
    </div>
  )
}

export default function AIAssistant({ vendorId }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Hey! I'm JUNI ✦\nYour JUNOONI store assistant. Ask me anything about your store, orders, earnings, or the platform!",
  }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [ticketState, setTicketState] = useState<TicketState>("idle")
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [messages, loading, open])

  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { role, content }])
  }

  const sendToBackend = async (msgs: Message[], extra?: Record<string, any>) => {
  const token = localStorage.getItem("vendorToken") ?? ""
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    credentials: "include",
    body: JSON.stringify({
      messages: msgs,
      vendorId,
      currentPage: window.location.pathname, // ← tells JUNI which page the creator is on
      ...extra,
    }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

  const sendMessage = async (overrideText?: string) => {
    const userText = (overrideText ?? input).trim()
    if (!userText || loading) return
    setInput("")
    setLoading(true)
    const userMsg: Message = { role: "user", content: userText }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)

    try {
      if (ticketState === "confirm") {
        if (isYes(userText)) {
          setTicketState("collect")
          addMessage("assistant", "Please describe your issue below in detail and I'll send it directly to our support team at support@junooni.com ✍️\n\nThe more detail you give, the faster they can help!")
        } else if (isNo(userText)) {
          setTicketState("idle")
          addMessage("assistant", "No problem! Is there anything else I can help you with? 😊")
        } else {
          addMessage("assistant", "Please reply with Yes or No — would you like to raise a support ticket?")
        }
        setLoading(false); return
      }

      if (ticketState === "collect") {
        setTicketState("sending")
        addMessage("assistant", "Got it! Sending your message to our support team... ⏳")
        try {
          await sendToBackend(newMessages, { action: "send_support_email", supportMessage: userText })
          setTicketState("idle")
          addMessage("assistant", "✅ Your message has been sent to our support team!\n\n📧 A ticket has been raised at support@junooni.com\n\nOur team will get back to you within 24–48 hours. Is there anything else I can help you with?")
        } catch {
          setTicketState("idle")
          addMessage("assistant", "Sorry, there was an issue sending your message. Please email us directly at support@junooni.com 🙏")
        }
        setLoading(false); return
      }

      if (ticketState === "idle" && detectsSupportIntent(userText)) {
        setTicketState("confirm")
        addMessage("assistant", "I can connect you with our support team! 🙋\n\nWould you like to raise a support ticket? They'll get back to you within 24–48 hours.\n\nReply with Yes or No.")
        setLoading(false); return
      }

      const data = await sendToBackend(newMessages)
      addMessage("assistant", data.reply)
    } catch {
      addMessage("assistant", "Sorry, kuch issue ho gaya. Please try again ya support@junooni.com pe reach out karo!")
      setTicketState("idle")
    } finally {
      setLoading(false)
    }
  }

  const getPlaceholder = () => {
    if (ticketState === "confirm") return "Type 'yes' to raise a ticket or 'no' to cancel..."
    if (ticketState === "collect") return "Describe your issue in detail..."
    return "Ask JUNI anything..."
  }

  return (
    <>
      <style>{`
        @keyframes juni-panel-in {
          0%  { opacity:0; transform:scale(0.88) translateY(18px); }
          100%{ opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes juni-msg-in {
          from { opacity:0; transform:translateY(5px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .juni-panel  { animation: juni-panel-in 0.22s cubic-bezier(0.34,1.5,0.64,1) forwards; }
        .juni-msg    { animation: juni-msg-in 0.16s ease forwards; }
        .juni-qbtn:hover { opacity:0.88; transform:translateY(-1px); }
        .juni-send:hover:not(:disabled) { filter:brightness(1.1); transform:scale(1.06); }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#e0d0c8; border-radius:4px; }
        @keyframes juni-cloud-pulse {
          0%,100% { box-shadow: 0 4px 20px rgba(232,98,26,0.35), 0 0 0 0 rgba(232,98,26,0.2); }
          50%      { box-shadow: 0 4px 24px rgba(232,98,26,0.5), 0 0 0 6px rgba(232,98,26,0.08); }
        }
        
        .juni-cloud-fab:hover { transform: scale(1.04) translateY(-2px) !important; }
      `}</style>

      {/* FAB: JUNI image circle + "Ask JUNI" cloud tooltip above */}
      {!open && (
        <div
          onClick={() => setOpen(true)}
          style={{
            position: "fixed", bottom: "24px", right: "24px",
            zIndex: 9999, display: "flex", flexDirection: "column",
            alignItems: "center", gap: "6px", cursor: "pointer",
          }}
        >
          {/* White cloud with "Ask JUNI" */}
          {/* Thinking-cloud "Ask JUNI" bubble, offset left with trailing circles */}
          <div style={{ position: "relative", width: "100%", height: "26px" }}>
            <div style={{
              position: "absolute",
              bottom: "6px",
              left: "-14px",
              background: "#fff",
              borderRadius: "16px",
              padding: "6px 13px",
              boxShadow: "0 3px 16px rgba(0,0,0,0.12)",
              border: "1px solid rgba(232,98,26,0.15)",
              whiteSpace: "nowrap",
            }}>
              <span style={{
                color: BRAND, fontWeight: 700, fontSize: "13px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                letterSpacing: "0.01em",
              }}>Ask JUNI</span>
            </div>

            {/* trailing thought circles cascading toward JUNI's head */}
            <div style={{
              position: "absolute", bottom: "-6px", left: "8px",
              width: "10px", height: "10px", borderRadius: "50%",
              background: "#fff",
              border: "1px solid rgba(232,98,26,0.15)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }} />
            <div style={{
              position: "absolute", bottom: "-13px", left: "20px",
              width: "6px", height: "6px", borderRadius: "50%",
              background: "#fff",
              border: "1px solid rgba(232,98,26,0.15)",
              boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
            }} />
          </div>

          {/* JUNI circle image */}
          <div className="juni-cloud-fab" style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: "linear-gradient(135deg, #fff5f0, #ffe0cc)",
            // border: "2.5px solid #E8621A",
            // boxShadow: "0 4px 20px rgba(232,98,26,0.4)",
            overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform 0.2s ease",
          }}>
            <video
              src={JUNI2}
              autoPlay loop muted playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      )}

      {/* Close button when panel is open */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", bottom: "24px", right: "24px",
            width: "52px", height: "52px", borderRadius: "50%",
            background: "#1a1a1a",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 9999,
            transition: "all 0.2s ease",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </div>
      )}

      {/* ── Chat panel ────────────────────────────────────────────────────────── */}
      {open && (
        <div className="juni-panel" style={{
          position: "fixed", bottom: "88px", right: "24px",
          width: "370px", height: "450px",
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 12px 48px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)",
          zIndex: 9998,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          border: "1px solid rgba(0,0,0,0.06)",
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #FF7A35 0%, #E8621A 60%, #c94e10 100%)",
            padding: "14px 16px",
            display: "flex", alignItems: "center", gap: "12px",
            flexShrink: 0, position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: "-40px", right: "-20px",
              width: "120px", height: "120px",
              background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            {/* JUNI avatar */}
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.45)",
              overflow: "hidden", flexShrink: 0,
            }}>
              {/* <img src={JUNI} alt="JUNI"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { e.currentTarget.style.display="none"; e.currentTarget.parentElement!.innerHTML='<div style="color:white;font-size:18px;font-weight:700;display:flex;align-items:center;justify-content:center;height:100%">J</div>' }}
              /> */}
              <video
              src={JUNI2}
              autoPlay muted playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                color: "#fff", fontWeight: 700, fontSize: "15px",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                JUNI <GeminiStar size={14} />
              </div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "11.5px", marginTop: "2px", display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#7dff9a", boxShadow: "0 0 6px #7dff9a",
                  display: "inline-block",
                }} />
                {ticketState === "confirm" ? "Raising a support ticket..." :
                 ticketState === "collect" ? "Write your support message" :
                 "Your JUNOONI store assistant"}
              </div>
            </div>

            <button onClick={() => setOpen(false)} style={{
              background: "rgba(255,255,255,0.2)", border: "none",
              borderRadius: "50%", width: "28px", height: "28px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0, transition: "background 0.15s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.35)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto",
            padding: "16px 14px",
            display: "flex", flexDirection: "column", gap: "12px",
            background: "#fafafa",
          }}>
            {messages.map((msg, i) => (
              <div key={i} className="juni-msg" style={{
                display: "flex",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                alignItems: "flex-end", gap: "8px",
              }}>
                {msg.role === "assistant" && (
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #fff5f0, #ffe0cc)",
                    // border: "1.5px solid #f0c8b0",
                    flexShrink: 0, overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <img src={JUNI} alt="JUNI"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => { e.currentTarget.style.display="none"; e.currentTarget.parentElement!.innerHTML='<span style="color:#E8621A;font-size:11px;font-weight:700">J</span>' }}
                    />
                  </div>
                )}
                <div style={{
                  maxWidth: "78%", padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #FF7A35, #E8621A)"
                    : "#fff",
                  color: msg.role === "user" ? "#fff" : "#1a1a1a",
                  fontSize: "13.5px", lineHeight: "1.6",
                  boxShadow: msg.role === "user"
                    ? "0 2px 12px rgba(232,98,26,0.3)"
                    : "0 1px 4px rgba(0,0,0,0.08)",
                  border: msg.role === "assistant" ? "1px solid #f0f0f0" : "none",
                }}>
                  {renderMarkdown(msg.content, msg.role === "user")}
                </div>
              </div>
            ))}

            {/* Yes/No quick replies */}
            {ticketState === "confirm" && !loading && (
              <div style={{ display: "flex", gap: "8px", paddingLeft: "36px" }}>
                <button className="juni-qbtn"
                  onMouseDown={() => sendMessage("yes")}
                  style={{
                    padding: "8px 16px",
                    background: "linear-gradient(135deg, #FF7A35, #E8621A)",
                    color: "#fff", border: "none", borderRadius: "20px",
                    cursor: "pointer", fontSize: "13px", fontWeight: 600,
                    boxShadow: "0 2px 10px rgba(232,98,26,0.3)",
                    transition: "all 0.15s ease",
                  }}
                >✅ Yes, raise a ticket</button>
                <button className="juni-qbtn"
                  onMouseDown={() => sendMessage("no")}
                  style={{
                    padding: "8px 16px", background: "#f0f0f0",
                    color: "#555", border: "none", borderRadius: "20px",
                    cursor: "pointer", fontSize: "13px", fontWeight: 600,
                    transition: "all 0.15s ease",
                  }}
                >✕ No thanks</button>
              </div>
            )}

            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "10px 12px",
            borderTop: ticketState === "collect" ? "2px solid #E8621A" : "1px solid #efefef",
            display: "flex", gap: "8px", flexShrink: 0,
            background: ticketState === "collect" ? "#fff8f5" : "#fff",
            transition: "background 0.2s, border-color 0.2s",
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder={getPlaceholder()}
              style={{
                flex: 1, padding: "10px 14px", borderRadius: "22px",
                border: ticketState === "collect" ? "1.5px solid #E8621A" : "1.5px solid #e8e8e8",
                fontSize: "13.5px", outline: "none",
                background: "#fafafa", color: "#1a1a1a",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { if (ticketState !== "collect") e.currentTarget.style.borderColor = "#E8621A" }}
              onBlur={(e) => { if (ticketState !== "collect") e.currentTarget.style.borderColor = "#e8e8e8" }}
            />
            <button className="juni-send"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim()
                  ? "#e0e0e0"
                  : "linear-gradient(135deg, #FF7A35, #E8621A)",
                color: "#fff", border: "none", borderRadius: "50%",
                width: "38px", height: "38px",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                boxShadow: loading || !input.trim() ? "none" : "0 2px 10px rgba(232,98,26,0.35)",
                transition: "all 0.15s ease",
              }}
            >
              {ticketState === "collect"
                ? <span style={{ fontSize: "16px" }}>📨</span>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
              }
            </button>
          </div>

          {/* Footer */}
          <div style={{
            padding: "5px 12px 8px", textAlign: "center",
            fontSize: "10.5px", color: "#ccc", background: "#fff", flexShrink: 0,
          }}>
            Powered by JUNOONI
          </div>
        </div>
      )}
    </>
  )
}