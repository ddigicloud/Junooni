import { useState, useRef, useEffect } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface Props {
  vendorId: string
}

const API_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL ? `${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/ai-assistant`: "http://localhost:9000/vendors/ai-assistant"

export default function AIAssistant({ vendorId }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm JUNI ✦\nYour JUNOONI store assistant. Ask me anything about your store, orders, earnings, or the platform!",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, loading, open])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = { role: "user", content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: newMessages, vendorId }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reply },
      ])
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Sorry, kuch issue ho gaya. Please try again ya support@junooni.com pe reach out karo!",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen(!open)}
        title="JUNI — Store Assistant"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "#E8621A",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: "20px",
          boxShadow: "0 4px 20px rgba(232,98,26,0.45)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.15s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "scale(1.08)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "scale(1)")
        }
      >
        {open ? "✕" : "✦"}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "88px",
            right: "24px",
            width: "360px",
            height: "480px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#E8621A",
              padding: "14px 16px",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            <div
              style={{ fontWeight: 700, fontSize: "15px", letterSpacing: "0.01em" }}
            >
              JUNI ✦
            </div>
            <div style={{ fontSize: "12px", opacity: 0.85, marginTop: "2px" }}>
              Your JUNOONI store assistant
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  background:
                    msg.role === "user" ? "#E8621A" : "#f3f3f3",
                  color: msg.role === "user" ? "#fff" : "#111",
                  padding: "10px 14px",
                  borderRadius:
                    msg.role === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                  maxWidth: "82%",
                  fontSize: "13.5px",
                  lineHeight: "1.55",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#f3f3f3",
                  padding: "10px 14px",
                  borderRadius: "16px 16px 16px 4px",
                  fontSize: "14px",
                  color: "#999",
                  letterSpacing: "2px",
                }}
              >
                •••
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "10px 12px",
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: "20px",
                border: "1px solid #e0e0e0",
                fontSize: "13.5px",
                outline: "none",
                background: "#fafafa",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                background:
                  loading || !input.trim() ? "#ccc" : "#E8621A",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                cursor:
                  loading || !input.trim() ? "not-allowed" : "pointer",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.15s ease",
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  )
}