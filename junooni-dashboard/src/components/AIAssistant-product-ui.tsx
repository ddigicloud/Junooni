// ─── AIAssistant-product-ui.tsx ───────────────────────────────────────────────
// Drop these components into AIAssistant.tsx.
// They render inline inside the chat panel:
//   ProductCardList   → product search results as clickable cards
//   MockupPreview     → generated mockup image with approve/retry
//   DesignUploader    → file picker that sends design to backend
//   ProductCreatedCard → success card after product is created

import { useState, useRef, useCallback } from "react"

const BRAND = "#E8621A"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface InlineChatMessage {
  role:         "user" | "assistant"
  content:      string
  // new fields for product creation
  productCards?:     ProductCard[]
  mockupPreview?:    string          // base64 image
  showUpload?:       boolean
  createdProduct?:   CreatedProduct
  designSessionId?:  string         // set after upload completes
}

interface ProductCard {
  id:               string
  name:             string
  product_type:     string
  base_cost:        number
  color_count:      number
  colors:           Array<{ name: string; hex: string }>
  sizes:            string[]
  first_mockup_url: string | null
  technology_id:    string | null
}

interface CreatedProduct {
  product_id:    string
  title:         string
  dashboard_url: string
  variant_count: number
}

// ── ProductCardList ────────────────────────────────────────────────────────────

interface ProductCardListProps {
  products:  ProductCard[]
  onSelect:  (index: number, product: ProductCard) => void
}

export function ProductCardList({ products, onSelect }: ProductCardListProps) {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
      {products.map((product, i) => (
        <button
          key={product.id}
          onClick={() => { setSelected(i); onSelect(i + 1, product) }}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 12px",
            background: selected === i ? "#fff5f0" : "#fff",
            border: selected === i ? `2px solid ${BRAND}` : "1.5px solid #f0f0f0",
            borderRadius: "12px", cursor: "pointer",
            textAlign: "left", transition: "all 0.15s ease",
            width: "100%",
          }}
        >
          {/* Mockup thumbnail */}
          <div style={{
            width: "52px", height: "52px", borderRadius: "8px",
            background: "#f5f5f5", flexShrink: 0, overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {product.first_mockup_url ? (
              <img src={product.first_mockup_url} alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "22px" }}>
                {{ tshirt: "👕", hoodie: "🧥", mug: "☕", tote: "👜", cap: "🧢", poster: "🖼️" }
                  [product.product_type?.toLowerCase()] ?? "📦"}
              </span>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: "13.5px", color: "#1a1a1a", marginBottom: "2px" }}>
              {i + 1}. {product.name}
            </div>
            <div style={{ fontSize: "12px", color: "#888" }}>
              ₹{product.base_cost} base · {product.color_count} colors · {product.sizes.slice(0, 4).join(", ")}{product.sizes.length > 4 ? "+" : ""}
            </div>
            {/* Color swatches */}
            <div style={{ display: "flex", gap: "3px", marginTop: "4px" }}>
              {product.colors.slice(0, 6).map((c, ci) => (
                <div key={ci} title={c.name} style={{
                  width: "12px", height: "12px", borderRadius: "50%",
                  background: c.hex,
                  border: "1px solid rgba(0,0,0,0.12)",
                  flexShrink: 0,
                }} />
              ))}
              {product.colors.length > 6 && (
                <span style={{ fontSize: "10px", color: "#aaa", alignSelf: "center" }}>
                  +{product.colors.length - 6}
                </span>
              )}
            </div>
          </div>

          {/* Arrow */}
          {selected === i && (
            <div style={{ color: BRAND, flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

// ── MockupPreview ──────────────────────────────────────────────────────────────

interface MockupPreviewProps {
  base64:      string
  colorHex?:  string
  area?:       string
  onApprove:   () => void
  onRetry:     () => void
  onChangeArea: (area: string) => void
  availableAreas: string[]
}

export function MockupPreview({ base64, colorHex, area, onApprove, onRetry, onChangeArea, availableAreas }: MockupPreviewProps) {
  return (
    <div style={{
      background: "#fff", border: "1.5px solid #f0f0f0",
      borderRadius: "14px", overflow: "hidden",
      marginTop: "4px", maxWidth: "280px",
    }}>
      {/* Mockup image */}
      <div style={{ position: "relative", background: "#f8f8f8" }}>
        <img src={base64} alt="Product preview"
          style={{ width: "100%", display: "block", borderRadius: "12px 12px 0 0" }} />
        {colorHex && (
          <div style={{
            position: "absolute", top: "8px", right: "8px",
            background: "rgba(255,255,255,0.9)", borderRadius: "20px",
            padding: "4px 8px", fontSize: "11px", color: "#555",
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: colorHex, border: "1px solid rgba(0,0,0,0.15)" }} />
            {colorHex}
          </div>
        )}
      </div>

      {/* Area tabs if multiple */}
      {availableAreas.length > 1 && (
        <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0", padding: "0 8px" }}>
          {availableAreas.map(a => (
            <button key={a} onClick={() => onChangeArea(a)} style={{
              padding: "6px 10px", fontSize: "12px", fontWeight: a === area ? 600 : 400,
              color: a === area ? BRAND : "#888",
              borderBottom: a === area ? `2px solid ${BRAND}` : "2px solid transparent",
              background: "none", border: "none", cursor: "pointer",
              transition: "all 0.15s", textTransform: "capitalize",
            }}>{a}</button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", padding: "10px 12px" }}>
        <button onClick={onApprove} style={{
          flex: 1, padding: "8px", background: BRAND, color: "#fff",
          border: "none", borderRadius: "20px", fontWeight: 600,
          fontSize: "13px", cursor: "pointer",
        }}>
          ✅ Looks good!
        </button>
        <button onClick={onRetry} style={{
          padding: "8px 12px", background: "#f5f5f5", color: "#666",
          border: "none", borderRadius: "20px", fontSize: "13px", cursor: "pointer",
        }}>
          🔄 Retry
        </button>
      </div>
    </div>
  )
}

// ── DesignUploader ─────────────────────────────────────────────────────────────

interface DesignUploaderProps {
  vendorId:         string
  apiUrl:           string
  onUploadComplete: (sessionId: string, filename: string, previewUrl: string) => void
  onSkip:           () => void
}

export function DesignUploader({ vendorId, apiUrl, onUploadComplete, onSkip }: DesignUploaderProps) {
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { setState("error"); return }
    if (file.size > 30 * 1024 * 1024) { setState("error"); return }

    setState("uploading")
    setProgress(20)

    // Read as base64
    const base64 = await new Promise<string>((res, rej) => {
      const reader = new FileReader()
      reader.onload = e => res(e.target!.result as string)
      reader.onerror = rej
      reader.readAsDataURL(file)
    })

    setPreview(base64)
    setProgress(60)

    // Upload to backend
    const token = localStorage.getItem("vendorToken") ?? ""
    const resp  = await fetch(apiUrl, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({
        action:   "upload_design",
        vendorId,
        base64,
        filename: file.name,
        mimeType: file.type,
        messages: [],
      }),
    })

    if (!resp.ok) { setState("error"); return }
    const data = await resp.json()
    setProgress(100)
    setState("done")
    onUploadComplete(data.sessionId, file.name, base64)
  }, [vendorId, apiUrl, onUploadComplete])

  return (
    <div style={{
      background: "#fff", border: `1.5px dashed ${state === "error" ? "#e53e3e" : BRAND}`,
      borderRadius: "14px", padding: "14px",
      marginTop: "4px", maxWidth: "280px",
    }}>
      {state === "idle" && (
        <>
          <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>
            Upload your design
          </p>
          <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#888" }}>
            PNG or JPG · min 300 DPI · max 30MB
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <label style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "8px 14px",
              background: BRAND, color: "#fff",
              borderRadius: "20px", fontSize: "13px",
              fontWeight: 600, cursor: "pointer",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              Choose file
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp"
                style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </label>
            <button onClick={onSkip} style={{
              padding: "8px 12px", background: "#f5f5f5", color: "#888",
              border: "none", borderRadius: "20px", fontSize: "13px", cursor: "pointer",
            }}>Skip</button>
          </div>
        </>
      )}

      {state === "uploading" && (
        <div>
          {preview && <img src={preview} alt="preview" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} />}
          <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#555" }}>Uploading...</p>
          <div style={{ height: "4px", background: "#f0f0f0", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: BRAND, borderRadius: "99px", transition: "width 0.3s ease" }} />
          </div>
        </div>
      )}

      {state === "done" && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {preview && <img src={preview} alt="preview" style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />}
          <div>
            <p style={{ margin: 0, fontSize: "13px", color: "#1a1a1a", fontWeight: 600 }}>✅ Design uploaded!</p>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#888" }}>Generating your preview...</p>
          </div>
        </div>
      )}

      {state === "error" && (
        <div>
          <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#e53e3e" }}>
            ❌ Upload failed. Please try again.
          </p>
          <button onClick={() => setState("idle")} style={{
            padding: "6px 12px", background: BRAND, color: "#fff",
            border: "none", borderRadius: "16px", fontSize: "12px", cursor: "pointer",
          }}>Try again</button>
        </div>
      )}
    </div>
  )
}

// ── ProductCreatedCard ─────────────────────────────────────────────────────────

interface ProductCreatedCardProps {
  product: CreatedProduct
  onViewProduct: (url: string) => void
  onCreateAnother: () => void
}

export function ProductCreatedCard({ product, onViewProduct, onCreateAnother }: ProductCreatedCardProps) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #f0fff4, #e6ffec)",
      border: "1.5px solid #9ae6b4",
      borderRadius: "14px", padding: "14px",
      marginTop: "4px", maxWidth: "280px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          background: "#38a169", display: "flex", alignItems: "center",
          justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: "#1a4731" }}>Product created!</p>
          <p style={{ margin: "1px 0 0", fontSize: "12px", color: "#276749" }}>{product.title}</p>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "8px", padding: "8px 10px", marginBottom: "10px" }}>
        <div style={{ fontSize: "12px", color: "#555" }}>
          <div>📦 {product.variant_count} variants created</div>
          <div style={{ marginTop: "2px" }}>📝 Saved as Draft — publish from Products tab</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => onViewProduct(product.dashboard_url)} style={{
          flex: 1, padding: "8px", background: "#38a169", color: "#fff",
          border: "none", borderRadius: "20px", fontWeight: 600,
          fontSize: "13px", cursor: "pointer",
        }}>
          View product
        </button>
        <button onClick={onCreateAnother} style={{
          padding: "8px 12px", background: "#f5f5f5", color: "#666",
          border: "none", borderRadius: "20px", fontSize: "13px", cursor: "pointer",
        }}>
          Make another
        </button>
      </div>
    </div>
  )
}

// ── parseMessageForProductUI ───────────────────────────────────────────────────
// Called after each AI reply. Detects render_type in tool results
// and decorates the message object with the right UI component props.

export function enrichMessageFromToolResult(
  message: InlineChatMessage,
  toolResultData: any
): InlineChatMessage {
  if (!toolResultData) return message

  switch (toolResultData.render_type) {
    case "PRODUCT_CARD_LIST":
      return { ...message, productCards: toolResultData.products }

    case "MOCKUP_PREVIEW":
      return { ...message, mockupPreview: toolResultData.preview_base64 }

    case "PRODUCT_CREATED":
      return {
        ...message,
        createdProduct: {
          product_id:    toolResultData.product_id,
          title:         toolResultData.title,
          dashboard_url: toolResultData.dashboard_url,
          variant_count: toolResultData.variant_count,
        },
      }

    default:
      return message
  }
}

// ── detectShowUpload ───────────────────────────────────────────────────────────
// Returns true if JUNI's reply contains [SHOW_UPLOAD] marker.

export function detectShowUpload(text: string): boolean {
  return text.includes("[SHOW_UPLOAD]")
}

export function cleanReplyText(text: string): string {
  return text.replace(/\[SHOW_UPLOAD\]/g, "").trim()
}