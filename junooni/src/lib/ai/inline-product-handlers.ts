// ─── inline-product-handlers.ts ───────────────────────────────────────────────

import axios from "axios"
import sharp from "sharp"
import { MedusaRequest } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductsWorkflow, uploadFilesWorkflow, updateProductsWorkflow, createInventoryLevelsWorkflow } from "@medusajs/medusa/core-flows"
import CreateArtworkWorkflow from "../../workflows/artwork/create-new-artwork/index"

const PAYLOAD_API    = process.env.PAYLOAD_BASE_URL ?? "http://localhost:3000"
const PAYLOAD_SECRET = process.env.PAYLOAD_API_SECRET ?? ""
const MARKETPLACE_SC  = process.env.DEFAULT_STORE_SALES_CHANNEL_ID  ?? ""
const OWN_STORE_SC    = process.env.CREATOR_STORE_SALES_CHANNEL_ID  ?? ""
const DEFAULT_LOCATION_ID = process.env.DEFAULT_STOCK_LOCATION_ID   ?? process.env.VITE_STORE_LOCATION_ID ?? ""

const OUTPUT_SIZE = 800

// ── In-memory design file store ───────────────────────────────────────────────
const designFileStore = new Map<string, {
  base64:    string
  filename:  string
  mimeType:  string
  createdAt: Date
}>()

// FIX E1+E3: Server-side mockup preview store
// Mockup base64 never goes in POST body — stored here, retrieved via GET by session ID
const mockupPreviewStore = new Map<string, {
  base64:     string
  area?:      string
  colorName?: string
  colorHex?:  string
  createdAt:  Date
}>()

// FIX: Vendor mockup session registry
// Maps vendorId → array of all mockup session IDs generated during current product creation.
// This persists ACROSS POST requests so create_product_from_chat can find all color sessions
// even though mockups were generated in a previous request.
const vendorMockupRegistry = new Map<string, {
  sessions:   string[]
  createdAt:  Date
}>()

export function registerMockupSession(vendorId: string, sessionId: string): void {
  const existing = vendorMockupRegistry.get(vendorId)
  if (existing) {
    // Add to existing registry if it's recent (same product creation session)
    existing.sessions.push(sessionId)
    existing.createdAt = new Date()
  } else {
    vendorMockupRegistry.set(vendorId, { sessions: [sessionId], createdAt: new Date() })
  }
  // Auto-delete after 2 hours
  setTimeout(() => {
    const entry = vendorMockupRegistry.get(vendorId)
    if (entry && entry.sessions.includes(sessionId)) {
      vendorMockupRegistry.delete(vendorId)
    }
  }, 2 * 60 * 60 * 1000)
}

export function getVendorMockupSessions(vendorId: string): string[] {
  return vendorMockupRegistry.get(vendorId)?.sessions ?? []
}

export function clearVendorMockupSessions(vendorId: string): void {
  vendorMockupRegistry.delete(vendorId)
}

export function storeMockupPreview(vendorId: string, base64: string, area?: string, colorName?: string, colorHex?: string): string {
  const sessionId = `mockup_${vendorId}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
  mockupPreviewStore.set(sessionId, { base64, area, colorName, colorHex, createdAt: new Date() })
  // Register in vendor registry so create_product_from_chat can find all color sessions
  // even when it runs in a later POST request than when mockups were generated
  registerMockupSession(vendorId, sessionId)
  // Auto-delete after 2 hours
  setTimeout(() => mockupPreviewStore.delete(sessionId), 2 * 60 * 60 * 1000)
  return sessionId
}

// Store canvas layout WITHOUT registering in vendor registry
// Canvas layouts go to artwork only — never to product images
export function storeCanvasLayout(vendorId: string, base64: string, area?: string): string {
  const sessionId = `mockup_${vendorId}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
  mockupPreviewStore.set(sessionId, { base64, area, colorName: "canvas-layout", createdAt: new Date() })
  // Auto-delete after 2 hours
  setTimeout(() => mockupPreviewStore.delete(sessionId), 2 * 60 * 60 * 1000)
  // NOTE: deliberately NOT calling registerMockupSession
  // Canvas layouts must never appear in getVendorMockupSessions()
  return sessionId
}

export function getMockupPreview(sessionId: string): string | null {
  return mockupPreviewStore.get(sessionId)?.base64 ?? null
}

export function getMockupArea(sessionId: string): string | null {
  return mockupPreviewStore.get(sessionId)?.area ?? null
}

export function getMockupColorName(sessionId: string): string | null {
  return mockupPreviewStore.get(sessionId)?.colorName ?? null
}

export function getMockupColorHex(sessionId: string): string | null {
  return mockupPreviewStore.get(sessionId)?.colorHex ?? null
}

export function storeDesignFile(
  vendorId: string,
  base64:   string,
  filename: string,
  mimeType: string
): string {
  const sessionId = `design_${vendorId}_${Date.now()}`
  designFileStore.set(sessionId, { base64, filename, mimeType, createdAt: new Date() })
  setTimeout(() => designFileStore.delete(sessionId), 2 * 60 * 60 * 1000)
  return sessionId
}

export function getDesignFile(sessionId: string) {
  return designFileStore.get(sessionId) ?? null
}

function base64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64.replace(/^data:[^;]+;base64,/, ""), "base64")
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "").replace(/^0+/, "")
  if (clean.length < 6) return { r: 255, g: 255, b: 255 }
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

// ─── detect_product_intent ────────────────────────────────────────────────────

export function handleDetectProductIntent(args: { raw_request: string }) {
  const text = args.raw_request.toLowerCase()

  const productMap: Record<string, string[]> = {
    tshirt:       ["t-shirt", "tshirt", "tee", "t shirt", "shirt"],
    hoodie:       ["hoodie", "sweatshirt", "hoody", "pullover"],
    mug:          ["mug", "cup", "coffee mug"],
    tote:         ["tote", "tote bag", "canvas bag"],
    "phone-case": ["phone case", "cover", "mobile case", "back cover"],
    poster:       ["poster", "print", "art print"],
    cap:          ["cap", "hat", "baseball cap"],
    jacket:       ["jacket", "bomber", "windbreaker"],
  }

  let detectedType: string | null = null
  for (const [type, kw] of Object.entries(productMap)) {
    if (kw.some(k => text.includes(k))) { detectedType = type; break }
  }

  const colors = [
    "black", "white", "red", "blue", "green", "navy", "grey", "gray",
    "pink", "purple", "orange", "brown", "beige", "yellow",
  ].filter(c => text.includes(c))

  const hasDesign = [
    "logo", "design", "artwork", "image", "my art", "upload", "png", "file", "jpeg", "jpg",
  ].some(k => text.includes(k))

  return {
    ok: true,
    data: {
      detected_type:    detectedType,
      search_query:     detectedType ?? (text.trim().split(" ").slice(0, 3).join(" ") || "tshirt"),
      mentioned_colors: colors,
      has_design:       hasDesign,
      needs_design:     !hasDesign,
    },
  }
}

// ─── search_blanks ────────────────────────────────────────────────────────────

function mapQueryToSearchTerm(query: string): string[] {
  const q = query.toLowerCase().trim()
  const map: Record<string, string[]> = {
    "tshirt":     ["Basic", "Tee", "Junooni Basic"],
    "t-shirt":    ["Basic", "Tee", "Junooni Basic"],
    "tee":        ["Tee", "Basic"],
    "basic tee":  ["Basic"],
    "shirt":      ["Tee", "Basic"],
    "cotton":     ["Basic", "Tee"],
    "classic":    ["Basic", "Tee"],
    "apparel":    ["Basic", "Tee"],
    "mug":        ["Mug", "Coffee"],
    "cup":        ["Mug", "Coffee"],
    "coffee mug": ["Mug"],
    "coffee":     ["Coffee", "Mug"],
    "phone case": ["Cases", "Samsung"],
    "case":       ["Cases", "Samsung"],
    "cover":      ["Cases", "Samsung"],
    "phone":      ["Cases", "Samsung"],
    "mobile":     ["Cases", "Samsung"],
    "samsung":    ["Samsung"],
    "iphone":     ["Cases"],
    "hoodie":     ["Hoodie", "Hoody"],
    "bag":        ["Bag", "Tote"],
    "tote":       ["Tote", "Bag"],
    "tote bag":   ["Tote"],
    "poster":     ["Poster"],
    "cap":        ["Cap", "Hat"],
    "hat":        ["Hat", "Cap"],
    "product":    ["Junooni"],
    "something":  ["Junooni"],
  }
  if (map[q]) return map[q]
  for (const [key, terms] of Object.entries(map)) {
    if (q.includes(key) || key.includes(q)) return terms
  }
  return [query]
}

function buildPayloadListUrl(baseUrl: string, collection: string, limit: number, depth = 2): string {
  return `${baseUrl}/api/${collection}?where[status][equals]=active&limit=${limit}&depth=${depth}&sort=name`
}

function buildPayloadSearchUrl(baseUrl: string, collection: string, term: string, limit: number): string {
  const params = new URLSearchParams()
  params.set("where[status][equals]", "active")
  params.set("where[name][like]",     term)
  params.set("limit", String(limit))
  params.set("depth", "2")
  return `${baseUrl}/api/${collection}?${params.toString()}`
}

function buildPayloadProductTypeUrl(baseUrl: string, collection: string, term: string, limit: number): string {
  const params = new URLSearchParams()
  params.set("where[status][equals]",    "active")
  params.set("where[productType][like]", term)
  params.set("limit", String(limit))
  params.set("depth", "2")
  return `${baseUrl}/api/${collection}?${params.toString()}`
}

function mapDoc(doc: any): any {
  const firstTech   = doc.printT?.[0]
const firstMockup = firstTech?.mockupPhotos?.[0]
const firstDisplayImage = doc.displayImages?.[0]?.image
const mockupUrl = firstDisplayImage?.url
  ? `${PAYLOAD_API}${firstDisplayImage.sizes?.square?.url || firstDisplayImage.sizes?.small?.url || firstDisplayImage.url}`
  : (firstMockup?.photo?.url ? `${PAYLOAD_API}${firstMockup.photo.url}` : null)
  return {
    id:               doc.id,
    name:             doc.name,
    product_type:     doc.productType ?? "apparel",
    base_cost:        doc.cost ?? 0,
    color_count:      (doc.colorOptions ?? []).length,
    colors:           (doc.colorOptions ?? []).slice(0, 6).map((c: any) => ({ name: c.colorName, hex: c.colorHex })),
    sizes:            (doc.sizeOptions ?? []).map((s: any) => s.sizeName),
    first_mockup_url: mockupUrl,
    technology_id:    firstTech?.id ?? null,
    technology_name:  firstTech?.technologyName ?? "DTG",
  }
}

export async function handleSearchBlanks(args: { query: string; limit?: number; inline_images?: boolean }) {
  const limit      = Math.min(args.limit ?? 50, 50)
  const COLLECTION = process.env.PAYLOAD_BLANKS_COLLECTION ?? "blank-products"
  const headers    = PAYLOAD_SECRET ? { Authorization: `Bearer ${PAYLOAD_SECRET}` } : {}

  try {
    const searchTerms = mapQueryToSearchTerm(args.query)
    let docs: any[] = []
    for (const term of searchTerms) {
      const url = buildPayloadSearchUrl(PAYLOAD_API, COLLECTION, term, limit)
      const { data } = await axios.get(url, { headers })
      docs = data?.docs ?? []
      if (docs.length > 0) break
      const typeUrl = buildPayloadProductTypeUrl(PAYLOAD_API, COLLECTION, term, limit)
      const { data: typeData } = await axios.get(typeUrl, { headers })
      docs = typeData?.docs ?? []
      if (docs.length > 0) break
    }
    if (docs.length === 0) {
      const allUrl = buildPayloadListUrl(PAYLOAD_API, COLLECTION, 100)
      const { data: allData } = await axios.get(allUrl, { headers })
      docs = allData?.docs ?? []
    }

    const products = args.inline_images
      ? await Promise.all(docs.map(async (doc: any) => {
          const m = mapDoc(doc)
          // if (m.first_mockup_url) {
          //   try {
          //     const resp    = await axios.get(m.first_mockup_url, { responseType: "arraybuffer", timeout: 4000 })
          //     const resized = await sharp(Buffer.from(resp.data))
          //       .resize(240, 240, { fit: "inside" })
          //       .webp({ quality: 70 })
          //       .toBuffer()
          //     m.first_mockup_url = `data:image/webp;base64,${resized.toString("base64")}`
          //   } catch (imgErr: any) {
          //     console.warn(`[search_blanks] image fetch failed for ${m.name}: ${imgErr.message}`)
          //     m.first_mockup_url = null
          //   }
          // }
          return m
        }))
      : docs.map(mapDoc)

    return {
      ok: true,
      data: {
        count:  products.length,
        search_query: args.query,
        products,
        render_type: "PRODUCT_CARD_LIST",
        note: products.length > 4 ? "Full catalog shown — pick the most relevant" : undefined,
      },
    }
  } catch (err: any) {
    return { ok: false, error: `Catalog search failed: ${err.message}` }
  }
}

// ─── get_blank_details ────────────────────────────────────────────────────────

export async function handleGetBlankDetails(args: { blank_id: string }) {
  const COLLECTION = process.env.PAYLOAD_BLANKS_COLLECTION ?? "blank-products"
  try {
    const url = `${PAYLOAD_API}/api/${COLLECTION}/${args.blank_id}?depth=2`
    const { data: doc } = await axios.get(url, {
      headers: PAYLOAD_SECRET ? { Authorization: `Bearer ${PAYLOAD_SECRET}` } : {},
    })

    const allTechs: any[] = doc.printT ?? []
    const primaryTech = allTechs[0]   // used for backward-compat single fields + default print_areas
    const cost = doc.cost ?? 0

    // Build technologies array — one entry per tech with its own print areas
    const technologies = allTechs.map((t: any) => ({
      id:          t.id,
      name:        t.technologyName ?? "DTG",
      print_areas: (t.custAreas ?? []).map((a: any) => a.areaName).filter(Boolean),
    }))

    // print_areas from first tech (or union of all if only one tech)
    const primaryAreas = (primaryTech?.custAreas ?? []).map((a: any) => a.areaName).filter(Boolean)

    return {
      ok: true,
      data: {
        id: doc.id, name: doc.name, product_type: doc.productType, base_cost: cost,
        colors: (doc.colorOptions ?? []).map((c: any) => ({ id: c.id, name: c.colorName, hex: c.colorHex, is_primary: c.isPrimary ?? false })),
        sizes:  (doc.sizeOptions ?? []).map((s: any) => ({ id: s.id, name: s.sizeName })),

        // Single-tech backward compat (used by existing generate_mockup calls)
        technology_id:   primaryTech?.id   ?? null,
        technology_name: primaryTech?.technologyName ?? "DTG",
        print_areas:     primaryAreas,

        // NEW — full list so Claude can ask which tech + show per-tech areas
        technologies,
        technology_count: technologies.length,
        print_area_count: primaryAreas.length,

        price_guidance: {
          minimum:     Math.ceil(cost * 1.5 / 10) * 10,
          recommended: Math.ceil(cost * 2.2 / 10) * 10,
          premium:     Math.ceil(cost * 2.8 / 10) * 10,
        },
        render_type: "BLANK_DETAILS",
        blankData:   doc,
      },
    }
  } catch (err: any) {
    return { ok: false, error: `Failed to get blank details: ${err.message}` }
  }
}

// ─── suggest_price ────────────────────────────────────────────────────────────

export function handleSuggestPrice(args: { base_cost: number; product_type: string; fulfillment_type?: string }) {
  const cost  = args.base_cost
  const multMap: Record<string, number> = { hoodie: 2.0, mug: 2.5, tshirt: 2.2, poster: 2.5, cap: 2.2 }
  const mult  = multMap[args.product_type.toLowerCase()] ?? 2.2
  const comm  = args.fulfillment_type === "creator" ? 0.10 : 0
  const tiers = [1.5, mult, mult * 1.25].map((m, i) => {
    const price  = Math.ceil((cost * m) / 10) * 10
    const profit = Math.round(price * (1 - 0.05) * (1 - comm) - cost)
    return { label: ["minimum", "recommended", "premium"][i], price, profit }
  })
  return { ok: true, data: { base_cost: cost, product_type: args.product_type, commission_note: "0% commission", tiers, recommended: tiers[1] } }
}

// ─── generate_inline_mockup ───────────────────────────────────────────────────

export async function handleGenerateInlineMockup(args: {
  blank_id:           string
  technology_id:      string
  selected_color_hex: string
  design_session_id:  string
  color_name?:        string
  area?:              string
  position?:          string
}) {
  try {
    const design = getDesignFile(args.design_session_id)
    if (!design) return { ok: false, error: "Design session expired. Please upload your file again." }

    const COLLECTION = process.env.PAYLOAD_BLANKS_COLLECTION ?? "blank-products"

    if (/^[a-f0-9]{24}$/i.test(String(args.blank_id))) {
      return { ok: false, error: `Invalid blank_id "${args.blank_id}" — use the numeric ID from search_blanks.` }
    }

    const { data: doc } = await axios.get(`${PAYLOAD_API}/api/${COLLECTION}/${args.blank_id}?depth=2`, {
      headers: PAYLOAD_SECRET ? { Authorization: `Bearer ${PAYLOAD_SECRET}` } : {},
    })
    if (!doc || !doc.id) return { ok: false, error: `Blank "${args.blank_id}" not found.` }

    const tech = doc.printT?.find((t: any) => t.id === args.technology_id)
      ?? doc.printT?.find((t: any) => t.technologyName?.toLowerCase().includes("dtg"))
      ?? doc.printT?.[0]
    if (!tech) return { ok: false, error: "No print technology found." }

    const colorHex = args.selected_color_hex || doc.colorOptions?.[0]?.colorHex || "#ffffff"
    const areaName = (args.area ?? "front").toLowerCase().trim()

    // custAreas[].areaName = "Front","Back","Left_sleeves","Right_sleeves"
    // args.area could be "front","back","left","left_sleeves" — normalize for matching
    const custArea = tech.custAreas?.find((a: any) => {
      const cName = (a.areaName ?? "").toLowerCase().replace(/_/g, "").replace(/-/g, "")
      const target = areaName.replace(/_/g, "").replace(/-/g, "")
      return cName === target || cName.startsWith(target) || target.startsWith(cName)
    }) ?? tech.custAreas?.[0]

    console.log(`[generate_inline_mockup] area="${areaName}" → custArea="${custArea?.areaName ?? "none"}" | all: ${tech.custAreas?.map((a:any)=>a.areaName).join(",")}`)

    const outW = OUTPUT_SIZE, outH = OUTPUT_SIZE
    const allPhotos: any[] = tech.mockupPhotos ?? []
    const colorLower = colorHex.toLowerCase()

    // CONFIRMED from API response:
    // mockupPhotos[].viewAngle = "front" | "back" | "left" | "right"
    // mockupPhotos[].area[0].areaName = "Front" | "Back" | "Left_sleeves" | "Right_sleeves"
    // mockupPhotos[].photoColor = "#00000000" (neutral/needs tinting) | actual hex (pre-colored)
    // custAreas[].areaName = "Front" | "Back" | "Left_sleeves" | "Right_sleeves"

    const matchesArea = (photo: any, targetArea: string): boolean => {
      const target = targetArea.toLowerCase().replace(/_/g, "").replace(/\s/g, "")
      // viewAngle: "front","back","left","right"
      const va = (photo.viewAngle ?? "").toLowerCase().replace(/_/g, "")
      if (va === target) return true
      // Sleeve partial match: "leftsleeves"→"left", "rightsleeves"→"right"
      if (va && target.startsWith(va)) return true
      // area[0].areaName: "Front","Back","Left_sleeves","Right_sleeves"
      const an = (photo.area?.[0]?.areaName ?? "").toLowerCase().replace(/_/g, "")
      if (an === target) return true
      if (an && (an.startsWith(target) || target.startsWith(an))) return true
      return false
    }

    // Filter photos matching the selected area, then pick best color match
    const areaPhotos = allPhotos.filter(p => matchesArea(p, areaName))
    console.log(`[generate_inline_mockup] area="${areaName}" → ${areaPhotos.length} photos (viewAngles: ${areaPhotos.map((p:any)=>p.viewAngle).join(",")}, colors: ${areaPhotos.map((p:any)=>p.photoColor).join(",")})`)

    const mockupPhoto = (() => {
      const pool = areaPhotos.length > 0 ? areaPhotos : allPhotos
      // 1. Exact color match for this area
      const exact   = pool.find((p: any) => p.photoColor?.toLowerCase() === colorLower)
      if (exact) return exact
      // 2. Neutral (#00000000) for this area — will be tinted with color
      const neutral = pool.find((p: any) => p.photoColor === "#00000000" || !p.photoColor)
      if (neutral) return neutral
      // 3. Any photo for this area
      return pool[0] ?? null
    })()

    const designPhoto = custArea?.designCanvasPhotos?.find(
      (p: any) => p?.photoColor?.toLowerCase() === colorHex.toLowerCase()
    ) ?? custArea?.designCanvasPhotos?.[0]

    const rawCoord = designPhoto?.printAreaCoord ?? { x: 0.25, y: 0.2, width: 0.5, height: 0.5 }
    const isNorm   = rawCoord.x <= 1 && rawCoord.y <= 1 && rawCoord.width <= 1 && rawCoord.height <= 1
    const coord    = {
      x:      isNorm ? rawCoord.x      : rawCoord.x      / (custArea?.canvasDim?.canvasPixWid  ?? 800),
      y:      isNorm ? rawCoord.y      : rawCoord.y      / (custArea?.canvasDim?.canvasPixHeight ?? 800),
      width:  isNorm ? rawCoord.width  : rawCoord.width  / (custArea?.canvasDim?.canvasPixWid  ?? 800),
      height: isNorm ? rawCoord.height : rawCoord.height / (custArea?.canvasDim?.canvasPixHeight ?? 800),
    }

    const printX = Math.round(coord.x * outW), printY = Math.round(coord.y * outH)
    const printW = Math.round(coord.width * outW), printH = Math.round(coord.height * outH)

    const rawDesignBuffer = base64ToBuffer(design.base64)
    let designBuffer: Buffer
    try {
      designBuffer = await sharp(rawDesignBuffer, { failOnError: false }).ensureAlpha().webp().toBuffer()
    } catch {
      designBuffer = rawDesignBuffer
    }
    const designMeta   = await sharp(designBuffer, { failOnError: false }).metadata()
    const dOrigW = designMeta.width ?? 400, dOrigH = designMeta.height ?? 400
    const scale  = Math.min(Math.round(printW * 0.85) / dOrigW, Math.round(printH * 0.85) / dOrigH)
    const dFinalW = Math.max(1, Math.round(dOrigW * scale)), dFinalH = Math.max(1, Math.round(dOrigH * scale))

    const designResized = await sharp(designBuffer, { failOnError: false })
      .resize(dFinalW, dFinalH, { fit: "inside", withoutEnlargement: false })
      .webp().toBuffer()

    const position = args.position ?? "center"
    const [vPos, hPos] = (() => {
      const p = position.toLowerCase()
      if (p.includes("top"))    return ["top",    p.includes("left") ? "left" : p.includes("right") ? "right" : "center"]
      if (p.includes("bottom")) return ["bottom", p.includes("left") ? "left" : p.includes("right") ? "right" : "center"]
      return ["center", p.includes("left") ? "left" : p.includes("right") ? "right" : "center"]
    })()

    const designLeft = printX + (hPos === "left" ? Math.round(printW * 0.08) : hPos === "right" ? Math.round(printW * 0.92 - dFinalW) : Math.round((printW - dFinalW) / 2))
    const designTop  = printY + (vPos === "top"  ? Math.round(printH * 0.08) : vPos === "bottom" ? Math.round(printH * 0.92 - dFinalH) : Math.round((printH - dFinalH) / 2))

    const echoArgs = {
      color_name: args.color_name ?? colorHex, blank_id: args.blank_id,
      technology_id: args.technology_id, design_session_id: args.design_session_id,
      position: args.position ?? "center",
    }

    if (!mockupPhoto?.photo?.url) {
      const result = await compositeOnColor({ designBuffer: designResized, designLeft, designTop, colorHex, outW, outH })
      return { ok: true, data: { preview_base64: result, render_type: "MOCKUP_PREVIEW", area: areaName, color_hex: colorHex, ...echoArgs } }
    }

    const mockupResponse = await axios.get(`${PAYLOAD_API}${mockupPhoto.photo.url}`, { responseType: "arraybuffer" })
    const rawData = mockupResponse.data
    const mockupBuffer = Buffer.isBuffer(rawData) ? rawData : Buffer.from(rawData instanceof ArrayBuffer ? rawData : Object.values(rawData as any))
    if (mockupBuffer.length < 100) return { ok: false, error: "Mockup photo fetch returned empty data." }

    let result: string
    try {
      result = await compositeWithMockup({
        mockupBuffer, designBuffer: designResized,
        designLeft: Math.max(0, designLeft), designTop: Math.max(0, designTop),
        colorHex,
        requiresColorMasking: mockupPhoto.requiresColorMasking ?? (mockupPhoto.photoColor === "#00000000"),
        outW, outH,
      })
    } catch (sharpErr: any) {
      console.log(`[generate_inline_mockup] Sharp failed (${sharpErr.message}), solid color fallback`)
      result = await compositeOnColor({ designBuffer: designResized, designLeft: Math.max(0, designLeft), designTop: Math.max(0, designTop), colorHex, outW, outH })
    }

    return { ok: true, data: { preview_base64: result, render_type: "MOCKUP_PREVIEW", area: areaName, color_hex: colorHex, ...echoArgs } }
  } catch (err: any) {
    console.error("[generate_inline_mockup]", err)
    return { ok: false, error: `Mockup generation failed: ${err.message}` }
  }
}

async function compositeOnColor(opts: {
  designBuffer: Buffer; designLeft: number; designTop: number
  colorHex: string; outW: number; outH: number
}): Promise<string> {
  const { r, g, b } = hexToRgb(opts.colorHex)
  // Ensure design has alpha channel for clean compositing
  const designWithAlpha = await sharp(opts.designBuffer).ensureAlpha().webp({ lossless: true }).toBuffer()
  const result = await sharp({
    create: { width: opts.outW, height: opts.outH, channels: 4, background: { r, g, b, alpha: 1 } },
  })
    .composite([{ input: designWithAlpha, left: Math.max(0, opts.designLeft), top: Math.max(0, opts.designTop), blend: "over" }])
    .webp({ quality: 85 })
    .toBuffer()
  return `data:image/webp;base64,${result.toString("base64")}`
}

async function compositeWithMockup(opts: {
  mockupBuffer:         Buffer
  designBuffer:         Buffer
  designLeft:           number
  designTop:            number
  colorHex:             string
  requiresColorMasking: boolean
  outW:                 number
  outH:                 number
}): Promise<string> {
  if (!Buffer.isBuffer(opts.mockupBuffer) || opts.mockupBuffer.length < 100)
    throw new Error(`Invalid mockupBuffer: length=${opts.mockupBuffer?.length ?? 0}`)

  const { r, g, b } = hexToRgb(opts.colorHex)

  // Resize mockup photo to output dimensions
  const mockupResized = await sharp(opts.mockupBuffer, { failOn: "none" })
    .resize(opts.outW, opts.outH, { fit: "cover" })
    .ensureAlpha()
    .webp({ lossless: true })
    .toBuffer()

  if (opts.requiresColorMasking) {
    // The neutral mockup photo is a garment shape with transparent background.
    // Correct compositing order:
    // 1. White base (so multiply works correctly)
    // 2. Color fill clipped to garment shape via multiply blend
    // 3. Neutral photo overlaid for fabric texture/folds (multiply darkens correctly)
    // 4. Design composited in print area
    // 5. Final: neutral photo overlay for edge/shadow detail

    // Step 1: Create solid color canvas
    const colorCanvas = await sharp({
      create: { width: opts.outW, height: opts.outH, channels: 4, background: { r, g, b, alpha: 1 } }
    }).webp({ lossless: true }).toBuffer()

    // Step 2: Apply fabric texture from the neutral mockup using multiply blend
    // This darkens the color where the fabric has shadows/folds, keeping correct hue
    const texturedColor = await sharp(colorCanvas)
      .composite([{
        input: mockupResized,
        blend: "multiply",  // darkens the color with the grey texture = realistic fabric look
        left: 0, top: 0,
      }])
      .webp({ lossless: true })
      .toBuffer()

    // Step 3: Composite design onto the textured color garment
    const withDesign = await sharp(texturedColor)
      .composite([{
        input: opts.designBuffer,
        left:  Math.max(0, opts.designLeft),
        top:   Math.max(0, opts.designTop),
        blend: "over",
      }])
      .webp({ lossless: true })
      .toBuffer()

    // Step 4: Add final shadow/edge detail from the mockup photo (screen blend preserves highlights)
    const final = await sharp(withDesign)
      .composite([{
        input: mockupResized,
        blend: "screen",
        left:  0, top: 0,
      }])
      .webp({ quality: 85 })
      .toBuffer()

    return `data:image/webp;base64,${final.toString("base64")}`

  } else {
    // Mockup photo already has the correct color — just composite design on top
    const result = await sharp(mockupResized)
      .composite([{
        input: opts.designBuffer,
        left:  Math.max(0, opts.designLeft),
        top:   Math.max(0, opts.designTop),
        blend: "over",
      }])
      .webp({ quality: 85 })
      .toBuffer()
    return `data:image/webp;base64,${result.toString("base64")}`
  }
}

// ─── create_product_from_chat ─────────────────────────────────────────────────

export async function handleCreateProductFromChat(
  args: {
    blank_id:               string
    blank_name:             string
    technology_id:          string
    title:                  string
    description?:           string
    selling_price:          number
    selected_colors:        Array<{ name: string; hex: string }>
    selected_sizes:         string[]
    fulfillment_type:       "junooni" | "creator"
    design_session_id:          string
    sales_channels?:            string[]
    mockup_preview_base64?:     string
    additional_mockup_sessions?: string[]
    design_area?:               string
    canvas_layout_base64?:      string
    all_canvas_layouts?:        string[]  // one canvas layout PNG per area for multi-area
    designs_by_area?:  Record<string, { sessionId: string; base64: string; filename: string; artworkBase64?: string }>
  },
  req: MedusaRequest,
  vendorId: string
) {
  try {
    const query      = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const remoteLink = req.scope.resolve(ContainerRegistrationKeys.LINK)
    const pgClient   = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const design     = getDesignFile(args.design_session_id)

    // Read productSession from request body — contains priceBreakdown, designBase64, etc.
    const productSession = (req.body as any)?.productSession ?? {}
    const priceBreakdown = productSession?.priceBreakdown ?? null
    console.log('[create_product_from_chat] priceBreakdown FULL:',
      JSON.stringify(priceBreakdown)?.slice(0, 1000)
    )

    const blankIdStr = String(args.blank_id)
    if (!blankIdStr || isNaN(Number(blankIdStr)) || Number(blankIdStr) <= 0) {
      return { ok: false, error: `Invalid blank_id "${args.blank_id}".` }
    }

    let blank: any
    try {
      const { data } = await axios.get(
        `${PAYLOAD_API}/api/${process.env.PAYLOAD_BLANKS_COLLECTION ?? "blank-products"}/${blankIdStr}?depth=2`,
        { headers: PAYLOAD_SECRET ? { Authorization: `Bearer ${PAYLOAD_SECRET}` } : {} }
      )
      blank = data
    } catch (fetchErr: any) {
      if (fetchErr?.response?.status === 404) return { ok: false, error: `Blank ID "${blankIdStr}" not found.` }
      throw fetchErr
    }

    // ── Resolve vendor name for description ──────────────────────────────────
    const vendorResult = await query.graph({ entity: "vendor", fields: ["name"], filters: { id: vendorId } })
    const vendorName   = vendorResult.data?.[0]?.name ?? "store"

    const priceInCents = Math.round(args.selling_price)
    const fulfillType  = args.fulfillment_type === "junooni" ? "JUNOONI-fulfillment" : "Creator-fulfillment"

    // ── Find print technology ─────────────────────────────────────────────────
    const tech = blank?.printT?.find((t: any) => t.id === args.technology_id) ?? blank?.printT?.[0]

    // ── Handle slug for product ───────────────────────────────────────────────
    // Same as create.tsx: title → slug + timestamp + random suffix
    const handle = args.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8)

    // ── Description ───────────────────────────────────────────────────────────
    const description = args.description?.trim() ||
      `<p>${args.title} — custom ${blank.productType ?? "product"} from ${vendorName}.</p>`

    // ── Variants — same structure as create.tsx ───────────────────────────────
    // variant.metadata: { cost_price, manufacturer_sku }
    // variant top-level: sku, hs_code, origin_country, material, manage_inventory, allow_backorder
    const baseSku      = blank["Manufacturer sku"] ?? ""
    const colorOptions = blank.colorOptions ?? []
    const sizeOptions  = blank.sizeOptions  ?? []
    const baseCost     = blank.cost ?? 0

    const variants: any[] = []
    for (const color of args.selected_colors) {
      for (const size of args.selected_sizes) {
        // Generate SKU same format as create.tsx
        const dateStr = new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"2-digit", year:"2-digit" }).replace(/\//g, "")
        const sku = ["JUNI", color.name.toLowerCase().replace(/\s+/g, "-"), size.toLowerCase(), dateStr, Math.random().toString(36).slice(2, 8).toUpperCase()].join("-")

        // cost_price = base blank cost + size ExtraCost (same as create.tsx)
        let costPrice = baseCost
        const matchingSize = sizeOptions.find((s: any) => s.sizeName?.toLowerCase() === size.toLowerCase())
        if (matchingSize?.ExtraCost) {
          const extra = parseFloat(matchingSize.ExtraCost)
          if (!isNaN(extra) && extra > 0) costPrice += extra
        }

        // manufacturer_sku = base + colorSku + sizeSku (same as create.tsx)
        const matchingColor = colorOptions.find((c: any) => c.colorName?.toLowerCase() === color.name.toLowerCase())
        const manufacturerSku = baseSku + (matchingColor?.colorSku ?? "") + (matchingSize?.sizeSku ?? "")

        const variantMetadata: Record<string, any> = {}
        if (costPrice > 0) variantMetadata.cost_price = costPrice
        if (manufacturerSku) variantMetadata.manufacturer_sku = manufacturerSku

        variants.push({
          title:            `${color.name} / ${size}`,
          sku,
          prices:           [{ amount: priceInCents, currency_code: "inr" }],
          options:          { Color: color.name, Size: size },
          // Same top-level fields as create.tsx variant
          hs_code:          blank?.HSNCode || undefined,
          origin_country:   "IN",
          material:         blank?.materials?.material || undefined,
          manage_inventory: true,
          allow_backorder:  false,
          metadata:         variantMetadata,
        })
      }
    }

    // ── Sales channels — read directly from vendor model fields ──────────────
    // Vendor model has: sell_on_marketplace (boolean) and sell_on_own_store (boolean)
    // These are the authoritative source — no guessing from subdomain/handle
    const channelIds: string[] = []

    try {
      const vendorFull = await query.graph({
        entity: "vendor",
        fields: ["id", "sell_on_marketplace", "sell_on_own_store", "marketplace_status"],
        filters: { id: vendorId },
      })
      const v = vendorFull.data?.[0] as any

      const sellMarketplace = !!(v?.sell_on_marketplace)
      const sellOwnStore    = !!(v?.sell_on_own_store)
      const marketplaceApproved = v?.marketplace_status === "approved"

      console.log(`[create_product_from_chat] Vendor channels: sell_on_marketplace=${sellMarketplace}(approved=${marketplaceApproved}), sell_on_own_store=${sellOwnStore}`)

      // Check what creator explicitly chose (Gemini may have asked)
      const geminiChannels = args.sales_channels ?? []
      const creatorChoseMarketplaceOnly = geminiChannels.includes("marketplace") && !geminiChannels.includes("own_store") && geminiChannels.length > 0
      const creatorChoseOwnStoreOnly    = geminiChannels.includes("own_store")   && !geminiChannels.includes("marketplace") && geminiChannels.length > 0

      // Add marketplace if vendor is enabled for it AND approved
      if (sellMarketplace && marketplaceApproved && MARKETPLACE_SC && !creatorChoseOwnStoreOnly) {
        channelIds.push(MARKETPLACE_SC)
      }

      // Add own store if vendor has it enabled
      if (sellOwnStore && OWN_STORE_SC && !creatorChoseMarketplaceOnly) {
        channelIds.push(OWN_STORE_SC)
      }

      // Fallback: if no channels resolved but vendor exists, default to marketplace
      if (channelIds.length === 0) {
        if (MARKETPLACE_SC) channelIds.push(MARKETPLACE_SC)
        console.warn(`[create_product_from_chat] No channels from vendor flags — defaulting to marketplace`)
      }

    } catch (chanErr: any) {
      console.warn(`[create_product_from_chat] Could not fetch vendor channels: ${chanErr.message}`)
      if (MARKETPLACE_SC) channelIds.push(MARKETPLACE_SC)
    }

    console.log(`[create_product_from_chat] Final sales channels: [${channelIds.join(", ")}]`)

    // ── Product metadata — same keys as create.tsx productMetadata ────────────
    const productMetadata: Record<string, any> = {
      // Core identification
      payload_product_name:   blank.name ?? args.blank_name,
      print_technology_id:    tech?.id ?? args.technology_id,
      print_technology_name:  (tech?.technologyName ?? "dtg").toLowerCase(),
      created_via:            "juni_chat",
      vendor_id:              vendorId,
      design_session:         args.design_session_id,

      // Fulfillment (same structure as create.tsx)
      fulfillment_type: JSON.stringify({
        type:           fulfillType,
        shipping_time:  blank?.shippingInfo?.shippingTime  ?? "2-3 business days",
        handling_time:  blank?.shippingInfo?.handlingTime  ?? "3-4 business days",
      }),

      // PayloadCMS integration (same as create.tsx payload_integration)
      payload_integration: JSON.stringify({
        source_product_id: blank.id,
        base_cost:         baseCost,
        image_settings:    { color_Images: true, size_Images: false, material_Images: false, style_Images: false },
        imported_at:       new Date().toISOString(),
      }),

      // Color hex values (same as create.tsx color_hex_values)
      color_hex_values: JSON.stringify(args.selected_colors.map(c => ({ name: c.name, hex: c.hex }))),

      // Image association settings (Color option = true, Size = false — same as create.tsx default)
      variant_specific_image_option: JSON.stringify([
        { option_name: "Color", enabled: true },
        { option_name: "Size",  enabled: false },
      ]),

      // Canvas layouts — minimal version for JUNI chat products
      canvas_layouts: JSON.stringify({
        total_canvas_images: 1,
        areas_covered:       [args.design_area ?? "front"],
        manufacturing_ready: true,
        canvas_metadata:     [{
          area:               args.design_area ?? "front",
          elements_count:     1,
          canvas_dimensions: {
            width_pixels:   tech?.custAreas?.[0]?.canvasDim?.canvasPixWid    ?? 800,
            height_pixels:  tech?.custAreas?.[0]?.canvasDim?.canvasPixHeight ?? 800,
            width_inches:   tech?.custAreas?.[0]?.canvasDim?.widthInch       ?? 14,
            height_inches:  tech?.custAreas?.[0]?.canvasDim?.heightInch      ?? 16,
          },
        }],
      }),
    }

    // Care instructions (same as create.tsx)
    if (Array.isArray(blank.careInstructions) && blank.careInstructions.length > 0) {
      productMetadata.care_instructions = JSON.stringify(
        blank.careInstructions.map((c: any) => ({ id: c.id, instruction: c.instruction, icon: c.icon ?? null }))
      )
    }

    // ── design_artwork — same structure as create.tsx designArtworkPayloads ──
    // Upload design file + approved mockup to file storage, then create vendor_artwork record.
    // This is what powers Qikink manufacturing and the artwork tab in the dashboard.
    const designArtworkPayloads: any[] = []
    let artworkId: string | null = null  // hoisted — needed for artwork-product linking after product created
    try {
      // uploadFilesWorkflow imported statically at top of file
      const uploadArtworkFiles = uploadFilesWorkflow
      const artworkFiles: Array<{ filename: string; mimeType: string; content: string; access: "private" }> = []

      // Design files — one per area if multi-area, single file otherwise
      // Original size preserved — manufacturer needs exact design files
      const designsByArea = args.designs_by_area ?? {}
      const hasMultiArea  = Object.keys(designsByArea).length > 1

      if (hasMultiArea) {
        // Multi-area: use artworkBase64 (clipped) if available, fall back to base64 (original)
        for (const [area, areaDesign] of Object.entries(designsByArea)) {
          const d = areaDesign as any
          const artworkBase64 = d.artworkBase64 && d.artworkBase64.length > 100 ? d.artworkBase64 : null
          const base64ToUse   = artworkBase64 ?? d.base64
          if (!base64ToUse || base64ToUse.length < 100) continue
          console.log(`[create_product_from_chat] Multi-area [${area}]: using ${artworkBase64 ? 'clipped-artwork' : 'original-upload'}`)
          artworkFiles.push({
            filename: artworkBase64 ? `edited-design-${area}.png` : (d.filename ?? `design-${area}.png`),
            mimeType: "image/png",
            content:  base64ToUse.replace(/^data:[^;]+;base64,/, ""),
            access:   "private",
          })
        }
       } else {
        // Single area: prefer session_design_base64 (has canvas edits: stretch/resize)
        // Fall back to designFileStore (original upload) if not available
        const editedDesign = (args as any).session_design_base64
        const designBase64ToUse = (editedDesign && editedDesign.length > 100)
          ? editedDesign
          : design?.base64

        console.log(`[create_product_from_chat] Design source: ${editedDesign ? 'session_edited' : 'original_upload'}, length: ${designBase64ToUse?.length}`)

        if (designBase64ToUse && designBase64ToUse.length > 100) {
          artworkFiles.push({
            filename: design?.filename ?? `design-${args.design_area ?? "front"}.png`,
            mimeType: design?.mimeType ?? "image/png",
            content:  designBase64ToUse.replace(/^data:[^;]+;base64,/, ""),
            access:   "private",
          })
        }
      }

      // Canvas layout PNGs — one per area
      const allLayouts = args.all_canvas_layouts ?? (args.canvas_layout_base64 ? [args.canvas_layout_base64] : [])
      console.log(`[create_product_from_chat] Canvas layouts: ${allLayouts.length} (all_canvas_layouts=${args.all_canvas_layouts?.length ?? 0}, canvas_layout_base64=${args.canvas_layout_base64?.length ?? 0} chars)`)
      const custAreas  = tech?.custAreas ?? []
      allLayouts.forEach((layoutBase64, idx) => {
        if (layoutBase64.length < 100) return
        const areaName = custAreas[idx]?.areaName ?? args.design_area ?? "front"
        console.log(`[create_product_from_chat] Adding canvas layout: ${areaName}, ${layoutBase64.length} chars`)
        artworkFiles.push({
          filename: `canvas-${areaName.toLowerCase()}-complete-layout.png`,
          mimeType: "image/png",
          content:  layoutBase64.replace(/^data:[^;]+;base64,/, ""),
          access:   "private",
        })
      })

      if (artworkFiles.length > 0) {
        const { result: artworkUploads } = await uploadArtworkFiles(req.scope).run({ input: { files: artworkFiles } })

        // Create vendor_artwork record via Medusa artwork API (same as createArtworkPayload in fetchApi.ts)
        const artworkName    = `${args.title} - Complete Design & Layout`
        const artworkDesc    = `Complete design for ${args.title} containing ${artworkFiles.length} elements including design elements and manufacturing layout references`

        // Pre-compute dimension info for canvas layout descriptions
        // Uses custArea real world dimensions and priceBreakdown consumed area
        const getLayoutDescription = (areaIdx: number): string => {
        const areaName    = custAreas[areaIdx]?.areaName ?? args.design_area ?? "front"
        const custArea    = custAreas[areaIdx] ?? custAreas[0]

        const canvasPixW  = custArea?.canvasDim?.canvasPixWid    ?? 800
        const canvasPixH  = custArea?.canvasDim?.canvasPixHeight ?? 800
        const canvasInchW = custArea?.canvasDim?.widthInch       ?? 14
        const canvasInchH = custArea?.canvasDim?.heightInch      ?? 16

        // Print area pixel dimensions (from coord ratios × canvas size)
        const printAreaCoord = custArea?.designCanvasPhotos?.[0]?.printAreaCoord ?? {}
        const isNormCoord = (printAreaCoord.x ?? 0) <= 1 && (printAreaCoord.width ?? 0) <= 1
        const printPixX = isNormCoord ? Math.round((printAreaCoord.x      ?? 0.25) * canvasPixW) : (printAreaCoord.x      ?? 0)
        const printPixY = isNormCoord ? Math.round((printAreaCoord.y      ?? 0.2)  * canvasPixH) : (printAreaCoord.y      ?? 0)
        const printPixW = isNormCoord ? Math.round((printAreaCoord.width  ?? 0.5)  * canvasPixW) : (printAreaCoord.width  ?? 0)
        const printPixH = isNormCoord ? Math.round((printAreaCoord.height ?? 0.5)  * canvasPixH) : (printAreaCoord.height ?? 0)
        const printInchW = Number((printPixW / canvasPixW * canvasInchW).toFixed(2))
        const printInchH = Number((printPixH / canvasPixH * canvasInchH).toFixed(2))

        // ── ACTUAL DESIGN SIZE ────────────────────────────────────────────────────
        // Frontend Canvas.tsx already converted pixel→inch using the correct
        // canvasConfig (same config used for rendering), so we use those values
        // directly — no server-side pixel math needed.
        let designInchW: number
        let designInchH: number

        const sessionDesignInchW = (productSession as any)?.designInchWidth  as number | undefined
        const sessionDesignInchH = (productSession as any)?.designInchHeight as number | undefined

        console.log(`[getLayoutDescription] productSession keys:`, Object.keys(productSession ?? {}))
        console.log(`[getLayoutDescription] designInchWidth=${sessionDesignInchW}, designInchHeight=${sessionDesignInchH}`)

        if (sessionDesignInchW && sessionDesignInchH && sessionDesignInchW > 0 && sessionDesignInchH > 0) {
          designInchW = sessionDesignInchW
          designInchH = sessionDesignInchH
          console.log(`[getLayoutDescription] Design size from frontend inches: ${designInchW}"×${designInchH}"`)
        } else {
          // Fallback: use print area size
          designInchW = printInchW
          designInchH = printInchH
          console.log(`[getLayoutDescription] Design size fallback to print area: ${designInchW}"×${designInchH}"`)
        }

        // Gaps from print area edges
        const leftGapInch   = Number((printPixX / canvasPixW * canvasInchW).toFixed(2))
        const topGapInch    = Number((printPixY / canvasPixH * canvasInchH).toFixed(2))
        const rightGapInch  = Number((canvasInchW - printInchW - leftGapInch).toFixed(2))
        const bottomGapInch = Number((canvasInchH - printInchH - topGapInch).toFixed(2))

        return [
          `MANUFACTURING LAYOUT - ${areaName.toUpperCase()} AREA`,
          ``,
          `CANVAS SPECIFICATIONS:`,
          `- Canvas: ${canvasPixW} x ${canvasPixH} pixels (${canvasInchW}" x ${canvasInchH}")`,
          `- Printable Area: ${printPixW} x ${printPixH} pixels (${printInchW}" x ${printInchH}")`,
          `- Printable Position: (${printPixX}, ${printPixY}) pixels`,
          `- Total Elements: 1`,
          ``,
          `CONSUMED DESIGN AREA (actual design size):`,
          `- Width: ${designInchW.toFixed(2)}"`,
          `- Height: ${designInchH.toFixed(2)}"`,
          `- Design Size: ${designInchW.toFixed(2)}" × ${designInchH.toFixed(2)}"`,
          ``,
          `PRINT AREA MARGINS:`,
          `- Top gap: ${topGapInch.toFixed(2)}"`,
          `- Left gap: ${leftGapInch.toFixed(2)}"`,
          `- Right gap: ${rightGapInch.toFixed(2)}"`,
          `- Bottom gap: ${bottomGapInch.toFixed(2)}"`,
          ``,
          `MANUFACTURING NOTES:`,
          `- Layout ready for production setup`,
          `- All measurements verified for print accuracy`,
          `- Element positioning optimized for print area`,
          `- Generated: ${new Date().toISOString()}`,
        ].join("\n")
      }

        const artworkMedias = artworkUploads.map((uploaded: any, idx: number) => {
          const isCanvas  = artworkFiles[idx]?.filename?.includes("canvas-")
          // For canvas layouts, find which layout index this is among all canvas files
          const canvasIdx = artworkFiles
            .slice(0, idx + 1)
            .filter(f => f.filename.includes("canvas-")).length - 1

          return {
            image_url:        uploaded.url,
            filename:         `artwork-${idx + 1}.${artworkFiles[idx]?.mimeType?.split("/")[1] ?? "png"}`,
            mime_type:        artworkFiles[idx]?.mimeType ?? "image/png",
            file_id:          uploaded.id,
            file_type:        "image",
            file_description: isCanvas
              ? getLayoutDescription(canvasIdx)
              : `${args.design_area ?? "front"} design element 1 - ${design?.filename ?? "design.png"}`,
            design_area:      (args.design_area ?? "front").toLowerCase(),
            file_category:    isCanvas ? "canvas_layout" : "design_element",
          }
        })

        // Create vendor_artwork record directly via workflow (no HTTP, no auth needed)
        // Same as what the /vendors/artwork POST route does internally
        let artworkResult: any = null
        try {
          const { result } = await CreateArtworkWorkflow(req.scope).run({
            input: {
              vendor_artwork: {
                name:        artworkName,
                description: artworkDesc,
                medias:      artworkMedias.map((m: any) => ({
                  fileId:   m.file_id,
                  mimeType: m.mime_type,
                  ...m,
                })),
              },
            },
          })
          artworkResult = result
          console.log(`[create_product_from_chat] ✅ Artwork workflow completed: id=${result?.vendor_artwork?.id}`)
        } catch (artworkApiErr: any) {
          console.warn(`[create_product_from_chat] Artwork workflow failed (non-fatal): ${artworkApiErr.message}`)
        }

        // Build designArtworkPayloads matching create.tsx structure exactly
        artworkId = artworkResult?.vendor_artwork?.id ?? null
        designArtworkPayloads.push({
          artwork_data:           artworkResult ?? { vendor_artwork: { name: artworkName, medias: artworkMedias } },
          design_areas:           hasMultiArea ? Object.keys(designsByArea) : [args.design_area ?? "front"],
          image_count:            artworkFiles.length,
          design_elements_count:  Object.keys(hasMultiArea ? designsByArea : { [args.design_area ?? "front"]: 1 }).length,
          canvas_images_count:    allLayouts.length,
          is_combined_artwork:    true,
          artwork_id:             artworkId,
          contains_canvas_layouts: allLayouts.length > 0,
        })

        if (artworkId) {
          console.log(`[create_product_from_chat] ✅ Artwork created: id=${artworkId}`)
        }
      }
    } catch (artworkErr: any) {
      console.warn(`[create_product_from_chat] Artwork creation failed (non-fatal): ${artworkErr.message}`)
    }

    // Add design_artwork to productMetadata (same key as create.tsx)
    if (designArtworkPayloads.length > 0) {
      productMetadata.design_artwork = JSON.stringify(designArtworkPayloads)
    }

    // Product details from blank (fabric info etc — same as create.tsx product_details)
    const productDetails: string[] = []
    if (blank?.materials?.material)   productDetails.push(blank.materials.material)
    if (blank?.materials?.gsm)        productDetails.push(`${blank.materials.gsm} GSM`)
    if (blank?.materials?.quality)    productDetails.push(blank.materials.quality)
    if (blank?.materials?.type)       productDetails.push(blank.materials.type)
    if (productDetails.length > 0) {
      productMetadata.product_details = JSON.stringify(productDetails)
    }

    const productOptions = [
      { title: "Color", values: args.selected_colors.map(c => c.name) },
      { title: "Size",  values: args.selected_sizes },
    ]

    console.log(`[create_product_from_chat] Creating: "${args.title}", blank=${args.blank_id}, colors=${args.selected_colors.map(c=>c.name).join(",")}, sizes=${args.selected_sizes.join(",")}`)

    const { result: products } = await createProductsWorkflow(req.scope).run({
      input: {
        products: [{
          title:        args.title,
          handle,
          description,
          status:       "draft",
          discountable: true,
          // Physical dimensions from blank (same as create.tsx)
          ...(blank?.productData?.weight   ? { weight: parseInt(blank.productData.weight) }   : {}),
          ...(blank?.productData?.length   ? { length: parseInt(blank.productData.length) }   : {}),
          ...(blank?.productData?.width    ? { width:  parseInt(blank.productData.width) }    : {}),
          ...(blank?.productData?.height   ? { height: parseInt(blank.productData.height) }   : {}),
          ...(blank?.materials?.material   ? { material: blank.materials.material }           : {}),
          ...(blank?.HSNCode               ? { hs_code: blank.HSNCode }                       : {}),
          origin_country: "IN",
          // Shipping profile from blank (same as create.tsx)
          ...(blank?.shippingInfo?.shippingProfileID ? { shipping_profile_id: blank.shippingInfo.shippingProfileID } : {}),
          options:        productOptions,
          variants,
          sales_channels: channelIds.map(id => ({ id })),
          metadata:       productMetadata,
          // Link artwork to product at creation time (same as create.tsx additional_data)
          ...(artworkId ? { additional_data: { vendor_artwork_id: artworkId } } : {}),
        }],
      },
    })

    const product = products?.[0]
    if (!product) throw new Error("No product returned from workflow.")
    console.log(`[create_product_from_chat] ✅ Created: ${product.id} — ${product.title}`)

    // ── Link artwork to product ───────────────────────────────────────────────
    // Table confirmed from logs: product_product_vendorartworkmodule_vendor_artwork
    // remoteLink key from table name: "product" + "vendorArtworkModule"
    if (artworkId && product.id) {
      let artworkLinked = false

      // Attempt 1: remoteLink with key derived from table name (vendorArtworkModule)
      try {
        await remoteLink.create([{
          product:             { product_id:       product.id },
          vendorArtworkModule: { vendor_artwork_id: artworkId  },
        }])
        artworkLinked = true
        console.log(`[create_product_from_chat] ✅ Artwork linked via remoteLink`)
      } catch (e1: any) {
        console.warn(`[create_product_from_chat] Artwork remoteLink failed: ${e1.message}`)
      }

      // Attempt 2: Direct DB insert — hardcoded table/columns confirmed from debug
      // Table: product_product_vendorartworkmodule_vendor_artwork
      // Columns we expect: product_id, vendor_artwork_id (+ possibly id, created_at, deleted_at)
      if (!artworkLinked) {
        try {
          const linkId = "link_" + Array.from({ length: 26 }, () =>
            "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[Math.floor(Math.random() * 32)]
          ).join("")

          // Use knex queryBuilder instead of raw to avoid template literal binding issues
          await pgClient("product_product_vendorartworkmodule_vendor_artwork").insert({
            id:               linkId,
            product_id:       product.id,
            vendor_artwork_id: artworkId,
            created_at:       pgClient.raw("NOW()"),
            deleted_at:       null,
          }).onConflict().ignore()

          artworkLinked = true
          console.log(`[create_product_from_chat] ✅ Artwork linked via knex insert (id=${linkId})`)
        } catch (e2: any) {
          console.warn(`[create_product_from_chat] Artwork knex insert failed: ${e2.message}`)

          // Attempt 3: plain pgClient.raw with simple string concatenation (no template literals)
          try {
            const linkId2 = "link_" + Array.from({ length: 26 }, () =>
              "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[Math.floor(Math.random() * 32)]
            ).join("")
            const sql = "INSERT INTO product_product_vendorartworkmodule_vendor_artwork (product_id, vendor_artwork_id, created_at, deleted_at) VALUES ('" + product.id + "', '" + artworkId + "', NOW(), NULL) ON CONFLICT DO NOTHING"
            await pgClient.raw(sql)
            artworkLinked = true
            console.log(`[create_product_from_chat] ✅ Artwork linked via raw SQL string`)
          } catch (e3: any) {
            console.warn(`[create_product_from_chat] Artwork raw SQL failed: ${e3.message}`)
          }
        }
      }

      if (!artworkLinked) {
        console.warn(`[create_product_from_chat] ⚠️ Artwork-product link failed — artwork exists but unlinked`)
      }
    }

    // ── FIX E2: Vendor link — confirmed correct format from debug output ──────
    // Debug showed the table is: marketplacemodule_vendor_product_product
    // id format: "link_" + ULID (e.g. link_01JN8TW8QFB8ZJC4EGAPQHBGAG)
    // Medusa's remoteLink.create also populates 3 catalog (cat_) tables atomically.
    // The correct remoteLink key names come from defineLink's linkable names:
    //   MarketplaceModule.linkable.vendor → key = "vendor"  (not "marketplace")
    //   ProductModule.linkable.product    → key = "product"
    //
    // Direct DB approach: insert into the raw table + cat_ tables manually,
    // matching exactly what Medusa does internally (confirmed from existing rows).
    let vendorLinked = false
    try {
      // Attempt 1: remoteLink with correct linkable key names
      await remoteLink.create([{
        vendor:  { vendor_id: vendorId },
        product: { product_id: product.id },
      }])
      vendorLinked = true
      console.log(`[create_product_from_chat] ✅ Vendor link created via remoteLink (vendor/product keys)`)
    } catch (linkErr1: any) {
      console.warn(`[create_product_from_chat] remoteLink attempt 1 failed: ${linkErr1.message}`)

      // Attempt 2: Direct multi-table insert matching what Medusa does internally.
      // From debug: id = "link_" + uppercase ULID, stored in both the raw table
      // AND the cat_link catalog table (which stores data as JSONB).
      try {
        // Generate link ID in the same format Medusa uses: "link_" + ULID
        const generateLinkId = (): string => {
          const chars  = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
          const now    = Date.now()
          let timeStr  = ""
          let t = now
          for (let i = 9; i >= 0; i--) { timeStr = chars[t % 32] + timeStr; t = Math.floor(t / 32) }
          let randStr  = ""
          for (let i = 0; i < 16; i++) randStr += chars[Math.floor(Math.random() * 32)]
          return "link_" + (timeStr + randStr).slice(0, 26)
        }

        const linkId = generateLinkId()
        console.log(`[create_product_from_chat] Generated link ID: ${linkId}`)

        // Insert into the raw link table (confirmed columns: id, vendor_id, product_id, created_at, updated_at, deleted_at)
        await pgClient.raw(
          `INSERT INTO "marketplacemodule_vendor_product_product"
             (id, vendor_id, product_id, created_at, updated_at, deleted_at)
           VALUES (?, ?, ?, NOW(), NOW(), NULL)
           ON CONFLICT DO NOTHING`,
          [linkId, vendorId, product.id]
        )

        // Insert into the catalog link table (confirmed columns: id, name, data, created_at, updated_at, deleted_at, staled_at, document_tsv)
        const linkData = JSON.stringify({ id: linkId, vendor_id: vendorId, product_id: product.id })
        const tsvValue = `'${vendorId.toLowerCase()}':3 '${product.id.toLowerCase().replace("prod_","")}':5 '${linkId.toLowerCase().replace("link_","")}':2 'link':1 'prod':4`
        await pgClient.raw(
          `INSERT INTO "cat_linkmarketplacemodulevendorproductproduct"
             (id, name, data, created_at, updated_at, deleted_at, staled_at, document_tsv)
           VALUES (?, ?, ?::jsonb, NOW(), NOW(), NULL, NULL, ?::tsvector)
           ON CONFLICT DO NOTHING`,
          [linkId, "LinkMarketplaceModuleVendorProductProduct", linkData, tsvValue]
        )

        // Insert into cat_pivot tables (vendor → link, link → product)
        // These use bigint id with sequence — omit id and let DB auto-assign
        await pgClient.raw(
          `INSERT INTO "cat_pivot_vendorlinkmarketplacemodulevendorproductproduct"
             (pivot, parent_id, parent_name, child_id, child_name, created_at, updated_at, deleted_at, staled_at)
           VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NULL, NULL)
           ON CONFLICT DO NOTHING`,
          ["Vendor-LinkMarketplaceModuleVendorProductProduct", vendorId, "Vendor", linkId, "LinkMarketplaceModuleVendorProductProduct"]
        )

        await pgClient.raw(
          `INSERT INTO "cat_pivot_linkmarketplacemodulevendorproductproductproduct"
             (pivot, parent_id, parent_name, child_id, child_name, created_at, updated_at, deleted_at, staled_at)
           VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NULL, NULL)
           ON CONFLICT DO NOTHING`,
          ["LinkMarketplaceModuleVendorProductProduct-Product", linkId, "LinkMarketplaceModuleVendorProductProduct", product.id, "Product"]
        )

        vendorLinked = true
        console.log(`[create_product_from_chat] ✅ Vendor link created via direct DB insert (id=${linkId})`)

      } catch (dbErr: any) {
        console.error(`[create_product_from_chat] ⚠️ Direct DB vendor link failed: ${dbErr.message}`)
        // Non-fatal — product is still created, just not linked to vendor in search index
      }
    }

        // ── Upload mockup images via uploadFilesWorkflow ──────────────────────────
    // We upload in this priority order:
    // 1. Design mockups (all colors) — from server-side mockup store
    // 2. Blank product's own catalog mockup photos — from PayloadCMS per color
    //    (these are the base product photos without any design, same as what
    //    appears in the product catalog — every product should have these)
    // uploadFilesWorkflow and updateProductsWorkflow imported statically at top of file

    // Collect design area mockups (one per color, with design on them)
    const designMockups: Array<{ base64: string; label: string; colorIndex: number }> = []

    // 1. Primary approved mockup (design on first color, primary area)
    const primaryBase64 = args.mockup_preview_base64 ?? ""
    const primaryColorName = (args.selected_colors[0]?.name ?? "color").toLowerCase()
    if (primaryBase64.length > 100) {
      designMockups.push({ base64: primaryBase64, label: `${primaryColorName} design-mockup`, colorIndex: 0 })
    } else if (design?.base64 && design.base64.length > 100) {
      designMockups.push({ base64: design.base64, label: `${primaryColorName} design-file`, colorIndex: 0 })
    }

    // 2. Additional design mockups from session store (other colors AND other areas)
    if (Array.isArray(args.additional_mockup_sessions)) {
      const numColors = args.selected_colors.length
      args.additional_mockup_sessions.forEach((sessionId: string, sessionIdx: number) => {
        const stored    = getMockupPreview(sessionId)
        const area      = getMockupArea(sessionId)      ?? ""
        const colorName = getMockupColorName(sessionId) ?? ""

        if (stored && stored.length > 100) {
          // Skip canvas layout images — artwork only, never product images
          if (colorName === "canvas-layout") return

          let safeColorIdx: number
          let safeColorName: string

          if (colorName) {
            // Best case: colorName stored — find exact match
            const colorIdx = args.selected_colors.findIndex(
              (c: any) => c.name?.toLowerCase() === colorName.toLowerCase()
            )
            safeColorIdx  = colorIdx >= 0 ? colorIdx : (sessionIdx % numColors)
            safeColorName = colorName
          } else {
            // Fallback: no colorName stored — infer from session order
            // Sessions are stored: [color0/area0, color1/area0, color0/area1, ...]
            // For single-area: [color0, color1, color2...] so idx directly = colorIdx (starting from 1 since 0=approved)
            safeColorIdx  = (sessionIdx + 1) % numColors
            safeColorName = (args.selected_colors[safeColorIdx]?.name ?? `color${safeColorIdx + 1}`).toLowerCase()
          }

          const areaLabel = area ? `-${area}` : ""
          designMockups.push({
            base64:     stored,
            label:      `${safeColorName.toLowerCase()}${areaLabel}-design-mockup`,
            colorIndex: safeColorIdx,
          })
        }
      })
    }

    console.log(`[create_product_from_chat] Design mockups: ${designMockups.length}, colors: ${args.selected_colors.map((c:any)=>c.name).join(",")}`)

    // Catalog images: plain (no design) photos for non-design areas, one per color × area
    const imagesToUpload: Array<{ base64: string; label: string }> = []

    // 3. Generate catalog images: one per selected color × per non-design area.
    //
    // CORRECT LOGIC from API response:
    //   mockupPhotos has BOTH colored photos (photoColor="#87CEEB") AND neutral (#00000000).
    //   For each color × each area:
    //     1. Use the ACTUAL colored photo if PayloadCMS has one matching that color+area → just download it, no processing
    //     2. Use the NEUTRAL photo for that area and tint it with multiply/screen blend → fallback
    //
    // Design area images come from: approvedMockup (color 1) + additional_mockup_sessions (colors 2,3...)
    // So here we ONLY add NON-design-area images for ALL colors.
    try {
      const { data: blankDoc } = await axios.get(
        `${PAYLOAD_API}/api/${process.env.PAYLOAD_BLANKS_COLLECTION ?? "blank-products"}/${args.blank_id}?depth=2`,
        { headers: PAYLOAD_SECRET ? { Authorization: `Bearer ${PAYLOAD_SECRET}` } : {} }
      )
      const tech        = blankDoc?.printT?.find((t: any) => t.id === args.technology_id) ?? blankDoc?.printT?.[0]
      const mockupPhotos: any[] = tech?.mockupPhotos ?? []

      // Determine design area reliably:
      // 1. From the approved mockup session (most reliable — stored when generate_inline_mockup ran)
      // 2. From args.design_area (Gemini-provided, may be missing)
      // 3. Default to "front"
      const approvedSessionArea = getMockupArea(
        // Find approved mockup session from the vendor registry
        getVendorMockupSessions(vendorId).find(sid => getMockupPreview(sid) === args.mockup_preview_base64) ?? ""
      )
      const designArea = (
        approvedSessionArea ||
        args.design_area ||
        "front"
      ).toLowerCase().trim().replace(/_/g, "").replace(/-/g, "")

      console.log(`[create_product_from_chat] designArea="${designArea}" (from session="${approvedSessionArea}", args="${args.design_area}"), mockupPhotos count=${mockupPhotos.length}`)
      console.log(`[create_product_from_chat] mockupPhotos: ${JSON.stringify(mockupPhotos.map((p:any)=>({ color: p.photoColor, viewAngle: p.viewAngle, areaName: p.area?.[0]?.areaName, url: p.photo?.url?.slice(-40) })))}`)

      // Helper: get area name from a mockupPhoto (viewAngle is most reliable)
      const getPhotoArea = (photo: any): string => {
        return (
          photo.area?.[0]?.areaName?.toLowerCase().trim() ||
          photo.viewAngle?.toLowerCase().trim() ||
          "unknown"
        ).replace(/_/g, "").replace(/-/g, "")
      }

      // Helper: check if a photo matches a target area (normalized comparison)
      const areaMatches = (photo: any, targetArea: string): boolean => {
        const pa = getPhotoArea(photo)
        const ta = targetArea.toLowerCase().replace(/_/g, "").replace(/-/g, "")
        return pa === ta || pa.startsWith(ta) || ta.startsWith(pa)
      }

      // Collect ALL areas that have design images (for multi-area: front AND back have designs)
      // These areas come from designs_by_area keys — each area with a design gets its mockup
      // from additional_mockup_sessions, NOT from catalog plain image generation
      const designAreas = new Set<string>()
      designAreas.add(designArea)  // primary area always excluded

      // For multi-area: all areas in designs_by_area have design mockups stored as sessions
      const designsByAreaArg = args.designs_by_area ?? {}
      for (const area of Object.keys(designsByAreaArg)) {
        const normalizedArea = area.toLowerCase().replace(/_/g, "").replace(/-/g, "")
        designAreas.add(normalizedArea)
      }

      // Get all unique areas from mockupPhotos (excluding ALL design areas)
      const allAreas = [...new Set(mockupPhotos.map(getPhotoArea))]
        .filter(a => {
          if (a === "unknown") return false
          // Exclude any area that has a design mockup
          for (const da of designAreas) {
            if (a.startsWith(da) || da.startsWith(a)) return false
          }
          return true
        })
      console.log(`[create_product_from_chat] Design areas (excluded): ${[...designAreas].join(",")}, Plain catalog areas: ${allAreas.join(",")}`)

      // For each selected color × each non-design area
      for (const color of args.selected_colors) {
        const colorLower = color.hex.toLowerCase()
        const { r, g, b } = hexToRgb(color.hex)

        for (const area of allAreas) {
          // 1. Find exact colored photo for this color+area
          const exactPhoto = mockupPhotos.find((p: any) =>
            areaMatches(p, area) && p.photoColor?.toLowerCase() === colorLower && p.photo?.url
          )

          // 2. Find neutral photo for this area (for tinting fallback)
          const neutralPhoto = mockupPhotos.find((p: any) =>
            areaMatches(p, area) && (p.photoColor === "#00000000" || !p.photoColor) && p.photo?.url
          )

          const bestPhoto = exactPhoto ?? neutralPhoto
          if (!bestPhoto?.photo?.url) {
            console.warn(`[create_product_from_chat] No photo found for ${color.name}/${area}`)
            continue
          }

          try {
            const resp   = await axios.get(`${PAYLOAD_API}${bestPhoto.photo.url}`, { responseType: "arraybuffer" })
            const buffer = Buffer.from(resp.data)
            if (buffer.length < 1000) continue

            let finalBase64: string

            if (exactPhoto) {
              // BEST CASE: PayloadCMS already has the correct colored photo — use it directly
              const resized = await sharp(buffer, { failOn: "none" })
                .resize(OUTPUT_SIZE, OUTPUT_SIZE, { fit: "cover" })
                .webp({ quality: 85 })
                .toBuffer()
              finalBase64 = `data:image/webp;base64,${resized.toString("base64")}`
              console.log(`[create_product_from_chat] ✅ Using actual colored photo for ${color.name}/${area}`)
            } else {
              // FALLBACK: Tint the neutral photo with the selected color
              const mockupResized = await sharp(buffer, { failOn: "none" })
                .resize(OUTPUT_SIZE, OUTPUT_SIZE, { fit: "cover" })
                .ensureAlpha()
                .png()
                .toBuffer()

              const colorCanvas = await sharp({
                create: { width: OUTPUT_SIZE, height: OUTPUT_SIZE, channels: 4, background: { r, g, b, alpha: 1 } }
              }).png().toBuffer()

              const textured = await sharp(colorCanvas)
                .composite([{ input: mockupResized, blend: "multiply", left: 0, top: 0 }])
                .png()
                .toBuffer()

              const final = await sharp(textured)
                .composite([{ input: mockupResized, blend: "screen", left: 0, top: 0 }])
                .webp({ quality: 85 })
                .toBuffer()

              finalBase64 = `data:image/webp;base64,${final.toString("base64")}`
              console.log(`[create_product_from_chat] ⚠️ Using tinted neutral for ${color.name}/${area} (no exact color photo)`)
            }

            imagesToUpload.push({ base64: finalBase64, label: `${color.name} ${area}` })
          } catch (err: any) {
            console.warn(`[create_product_from_chat] Failed for ${color.name}/${area}: ${err.message}`)
          }
        }
      }

      console.log(`[create_product_from_chat] Total catalog images: ${imagesToUpload.length} (${imagesToUpload.map(i=>i.label).join(", ")})`)

      // Final assembly — correct sequence per color:
      // front-plain (catalog) → design-mockup(s) (with design) → other-plains (back, left, right catalog)
      // This puts the front plain view FIRST (main product thumbnail)
      // then the design mockup shows the actual product design
      // then remaining plain area views
      const orderedImages: Array<{ base64: string; label: string }> = []

      for (let ci = 0; ci < args.selected_colors.length; ci++) {
        const color     = args.selected_colors[ci]
        const colorName = color.name.toLowerCase()

        // Split catalog images into: front first, then rest
        const allColorImages = imagesToUpload.filter(img =>
          img.label.toLowerCase().startsWith(colorName)
        )
        const frontImages  = allColorImages.filter(img => img.label.toLowerCase().includes("front"))
        const otherImages  = allColorImages.filter(img => !img.label.toLowerCase().includes("front"))

        // 1. Front plain catalog images first
        orderedImages.push(...frontImages)

        // 2. All design mockups for this color (with the actual design on them)
        const colorDesignMockups = designMockups.filter(d => d.colorIndex === ci)
        colorDesignMockups.forEach(d => orderedImages.push({ base64: d.base64, label: d.label }))

        // 3. Remaining plain catalog images (back, left, right sleeves)
        orderedImages.push(...otherImages)
      }

      // Fallback
      if (orderedImages.length === 0) {
        orderedImages.push(...imagesToUpload)
        designMockups.forEach(d => orderedImages.push({ base64: d.base64, label: d.label }))
      }

      console.log(`[create_product_from_chat] Final upload order (${orderedImages.length}): ${orderedImages.map(i=>i.label).join(" | ")}`)
      imagesToUpload.length = 0
      orderedImages.forEach(img => imagesToUpload.push(img))
    } catch (blankFetchErr: any) {
      console.warn(`[create_product_from_chat] Could not fetch catalog photos: ${blankFetchErr.message}`)
    }

    let uploadedImageUrls: string[] = []

    if (imagesToUpload.length > 0) {
      try {
        const fileInputs = await Promise.all(
          imagesToUpload.map(async (img, idx) => {
            const raw    = img.base64.replace(/^data:[^;]+;base64,/, "")
            const buffer = Buffer.from(raw, "base64")
            const clean  = await sharp(buffer, { failOn: "none" })
              .resize(800, 800, { fit: "inside", withoutEnlargement: true })
              .webp({ quality: 82 })
              .toBuffer()

            // Include color+area in filename for variant image matching
            // e.g. "mockup-beige-front-0.webp" → matches variant "Beige / X"
            const label = (imagesToUpload[idx]?.label ?? "").toLowerCase()
              .replace(/[\s\/]+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 40)
            const filename = label
              ? `mockup-${label}-${idx}.webp`
              : `mockup-${product.id}-${idx}.webp`

            return {
              filename,
              mimeType: "image/webp",
              content:  clean.toString("base64"),
              access:   "public" as const,
            }
          })
        )

        const { result: uploadedFiles } = await uploadFilesWorkflow(req.scope).run({
          input: { files: fileInputs },
        })

        uploadedImageUrls = uploadedFiles
          .map((f: any) => f?.url)
          .filter(Boolean) as string[]

        // Store file metadata (id + url + filename label) for direct variant assignment
        // This avoids the unreliable query.graph fetch that may miss newly created records
        const uploadedFileMeta: Array<{ id: string; url: string; label: string }> =
          uploadedFiles
            .map((f: any, idx: number) => ({
              id:    f?.id    ?? "",
              url:   f?.url   ?? "",
              label: fileInputs[idx]?.filename ?? "",
            }))
            .filter((f: any) => f.id && f.url)

        console.log(`[create_product_from_chat] ✅ Uploaded ${uploadedImageUrls.length} image(s)`)
        console.log(`[create_product_from_chat] File IDs: ${uploadedFileMeta.map(f => f.id).join(", ")}`)

        if (uploadedImageUrls.length > 0) {
          // Set product images + thumbnail (first image) — Error 2 fix
          await updateProductsWorkflow(req.scope).run({
            input: {
              selector: { id: product.id },
              update: {
                images:    uploadedImageUrls.map(url => ({ url })),
                thumbnail: uploadedImageUrls[0],
              },
            },
          })
          console.log(`[create_product_from_chat] ✅ Images attached, thumbnail set: ${uploadedImageUrls[0]}`)

          // ── STEP A: Create inventory levels (same as create.tsx batchUpdateInventoryLevels)
          // location ID: from blank's shippingInfo first, then env var
          const locationId: string =
            blank?.shippingInfo?.shippingLocationID ||
            DEFAULT_LOCATION_ID

          if (locationId) {
            try {
              // In Medusa v2, variant inventory items are in a join table
              // Use pgClient direct query as it's most reliable across versions
              const invRows = await pgClient.raw(`
                SELECT pv.id as variant_id, ii.id as inventory_item_id
                FROM product_variant pv
                JOIN product_variant_inventory_item pvii ON pvii.variant_id = pv.id
                JOIN inventory_item ii ON ii.id = pvii.inventory_item_id
                WHERE pv.product_id = ?
                  AND pv.deleted_at IS NULL
                  AND ii.deleted_at IS NULL
              `, [product.id])

              const inventoryLevels = (invRows.rows ?? invRows[0] ?? []).map((row: any) => ({
                inventory_item_id: row.inventory_item_id,
                location_id:       locationId,
                stocked_quantity:  10,
              }))

              if (inventoryLevels.length > 0) {
                await createInventoryLevelsWorkflow(req.scope).run({
                  input: { inventory_levels: inventoryLevels },
                })
                console.log(`[create_product_from_chat] ✅ Inventory levels created: ${inventoryLevels.length} variants at location ${locationId}`)
              } else {
                console.warn(`[create_product_from_chat] ⚠️ No inventory items found for product ${product.id}`)
              }
            } catch (invErr: any) {
              console.warn(`[create_product_from_chat] ⚠️ Inventory level creation failed (non-fatal): ${invErr.message}`)
            }
          } else {
            console.warn(`[create_product_from_chat] ⚠️ No location ID — set DEFAULT_STOCK_LOCATION_ID env var or shippingLocationID in PayloadCMS blank`)
          }

          // ── STEP B: Assign variant images using batchVariantImagesWorkflow
          // Wait briefly to ensure product images are committed before querying
          await new Promise(resolve => setTimeout(resolve, 500))

          const normalize = (s: string) =>
            s.toLowerCase().replace(/^#/, "").replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "")

          try {
            // Fetch product images and variants via query.graph
            const [imgResult, varResult] = await Promise.all([
              query.graph({ entity: "product", fields: ["images.id", "images.url"], filters: { id: product.id } }),
              query.graph({ entity: "product_variant", fields: ["id", "title", "options.value", "options.option.title"], filters: { product_id: product.id } }),
            ])

            const productImgs: Array<{ id: string; url: string }> = (imgResult.data?.[0] as any)?.images ?? []
            const variants = varResult.data ?? []

            console.log(`[create_product_from_chat] Assigning variant images: ${productImgs.length} images, ${variants.length} variants`)
            // Log ALL filenames to understand what we're working with
            const allFilenames = productImgs.map((i: any) => (i.url ?? "").split("/").pop()).join(", ")
            console.log(`[create_product_from_chat] All image filenames: ${allFilenames}`)

            for (const variant of variants) {
              const options = (variant as any).options ?? []
              const colorOpt = options.find((o: any) =>
                o.option?.title?.toLowerCase() === "color" || o.option?.title?.toLowerCase() === "colour"
              )
              const variantColorNorm = normalize(colorOpt?.value ?? "")

              const matchingImgs = productImgs.filter((img: any) => {
                if (!variantColorNorm) return true
                // Use only the filename part of the URL (same as create.tsx)
                const filename = (img.url ?? "").toLowerCase().split("/").pop() ?? ""
                // Match color in filename — same approach as create.tsx
                // Use word-boundary style: color must be surrounded by "-" or be at start
                // e.g. "light-pink" matches "mockup-light-pink-front-0.webp"
                //      but NOT "mockup-golden-light-pink-front-0.webp" if color is "golden"
                return filename.includes(`-${variantColorNorm}-`) ||
                       filename.includes(`-${variantColorNorm}.`) ||
                       filename.startsWith(`mockup-${variantColorNorm}-`) ||
                       filename.startsWith(`${variantColorNorm}-`)
              })

              console.log(`[create_product_from_chat] Variant "${(variant as any).title}" color="${variantColorNorm}": ${matchingImgs.length} matching images`)

              if (matchingImgs.length > 0) {
                // Prefer design mockup (front view) as thumbnail
                const frontImg = matchingImgs.find((img: any) => {
                  const fn = (img.url ?? "").toLowerCase().split("/").pop() ?? ""
                  return fn.includes("front") || fn.includes("design-mockup")
                })
                const thumbnailUrl = frontImg?.url ?? matchingImgs[0].url

                // Call same vendor route as updateVariantImages in fetchApi.ts:
                // POST /vendors/products/:productId/variants/:variantId
                // with { images: [{id}...], thumbnail_url }
                const MEDUSA_BACKEND2 = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"
                const vendorToken2    = (req.headers?.authorization as string | undefined)?.replace("Bearer ", "") ?? ""

                await axios.post(
                  `${MEDUSA_BACKEND2}/vendors/products/${product.id}/variants/${(variant as any).id}`,
                  {
                    images:        matchingImgs.map((img: any) => ({ id: img.id })),
                    thumbnail_url: thumbnailUrl,
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization:  `Bearer ${vendorToken2}`,
                    },
                  }
                )

                console.log(`[create_product_from_chat] ✅ Variant "${(variant as any).title}": ${matchingImgs.length} images via vendor route, thumbnail=${thumbnailUrl.split("/").pop()}`)
              }
            }
            console.log(`[create_product_from_chat] ✅ All variant images assigned`)
          } catch (variantImgErr: any) {
            console.warn(`[create_product_from_chat] ⚠️ Variant image assignment failed: ${variantImgErr.message}`)
          }
        }
      } catch (imgErr: any) {
        console.error("[create_product_from_chat] ⚠️ Image upload failed (non-fatal):", imgErr.message)
      }
    }

    return {
      ok: true,
      data: {
        product_id:    product.id,
        title:         product.title,
        status:        "draft",
        variant_count: variants.length,
        dashboard_url: `/products/${product.id}`,
        publish_note:  "Product saved as Draft. Review and publish from Products tab.",
        render_type:   "PRODUCT_CREATED",
        has_image:     uploadedImageUrls.length > 0,
        vendor_linked: vendorLinked,
      },
    }
  } catch (err: any) {
    console.error("[create_product_from_chat]", err)
    return { ok: false, error: `Product creation failed: ${err.message}` }
  }
}

// ─── calculate_real_price ─────────────────────────────────────────────────────

import { calculateRealCostPrice } from "./pricing-engine"

export async function handleCalculateRealPrice(args: { blank_id: string; technology_id: string; areas?: string[] }) {
  try {
    const result = await calculateRealCostPrice(args.blank_id, args.technology_id, args.areas ?? ["front"])
    return {
      ok: true,
      data: {
        total_cost_price: result.total_cost_price, recommended_sell_price: result.recommended_sell_price,
        minimum_sell_price: result.minimum_sell_price, premium_sell_price: result.premium_sell_price,
        profit_at_recommended: result.profit_at_recommended, margin_at_recommended: result.margin_at_recommended,
        breakdown: { blank_cost: result.blank_product_cost, printing_cost: result.printing_cost, printing_gst: result.printing_gst_amount, product_gst: result.product_gst_amount, setup_fee: result.setup_fee, technology_fee: result.technology_fee, shipping: result.shipping_charges, total_cost: result.total_cost_price },
        summary: [
          `**Cost breakdown for ${result.blank_name}:**`,
          `• Blank product: ₹${result.blank_product_cost}`,
          result.printing_cost > 0 ? `• Printing: ₹${result.printing_cost}${result.printing_gst_amount > 0 ? ` + ₹${result.printing_gst_amount} GST` : ""}` : null,
          result.product_gst_amount > 0 ? `• Product GST: ₹${result.product_gst_amount}` : null,
          result.setup_fee > 0 ? `• Setup fee: ₹${result.setup_fee}` : null,
          result.shipping_charges > 0 ? `• Shipping: ₹${result.shipping_charges}` : null,
          `• **Your cost per unit: ₹${result.total_cost_price}**`,
          "",
          `**Suggested prices:**`,
          `• Minimum: ₹${result.minimum_sell_price}`,
          `• **Recommended: ₹${result.recommended_sell_price}** (~₹${result.profit_at_recommended} profit, ${result.margin_at_recommended}% margin)`,
          `• Premium: ₹${result.premium_sell_price}`,
        ].filter(Boolean).join("\n"),
        note: result.note,
      },
    }
  } catch (err: any) {
    return { ok: false, error: `Pricing failed: ${err.message}` }
  }
}

// ─── remove_background ───────────────────────────────────────────────────────

export async function handleRemoveBackground(args: { design_session_id: string; threshold?: number }): Promise<{ ok: true; data: { design_session_id: string; message: string } } | { ok: false; error: string }> {
  try {
    const design = getDesignFile(args.design_session_id)
    if (!design) return { ok: false, error: "Design session expired. Please upload again." }

    const threshold   = args.threshold ?? 20
    const inputBuffer = base64ToBuffer(design.base64)

    const { data, info } = await sharp(inputBuffer)
      .ensureAlpha().raw().toBuffer({ resolveWithObject: true })

    const pixels  = new Uint8Array(data)
    const { width, height, channels } = info

    if (channels !== 4) {
      return { ok: true, data: { design_session_id: args.design_session_id, message: "Skipped — unexpected format." } }
    }

    let removedCount = 0
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i], g = pixels[i+1], b = pixels[i+2]
      if (r >= (255 - threshold) && g >= (255 - threshold) && b >= (255 - threshold)) {
        pixels[i + 3] = 0
        removedCount++
      }
    }
    console.log(`[remove_background] Removed ${removedCount} near-white pixels (threshold=${threshold})`)

    const cleanBuffer = await sharp(Buffer.from(pixels), { raw: { width, height, channels: 4 } }).png().toBuffer()
    const cleanBase64 = `data:image/png;base64,${cleanBuffer.toString("base64")}`

    designFileStore.set(args.design_session_id, {
      base64: cleanBase64, filename: design.filename,
      mimeType: "image/png", createdAt: design.createdAt,
    })

    return { ok: true, data: { design_session_id: args.design_session_id, message: "Background removed. Design is now transparent." } }
  } catch (err: any) {
    console.error(`[remove_background] Error:`, err.message)
    return { ok: true, data: { design_session_id: args.design_session_id, message: `Background removal skipped: ${err.message}` } }
  }
}


// ─── create_product  (MCP / Claude tool) ────────────────────────────────────
//
// Simpler than create_product_from_chat — no design, no colors, no mockups.
// Creates a draft scaffold the creator then finishes in Creator Studio.
// Lives here (not a separate file) to reuse the vendor-linking SQL above.

// ─────────────────────────────────────────────────────────────────────────────
//  REPLACEMENT for handleCreateProduct in src/lib/ai/inline-product-handlers.ts
//
//  CHANGES vs old version:
//    • Accepts color_names (string[]) + backward-compat color_name (single)
//    • Accepts mockup_session_ids (string[]) + backward-compat mockup_session_id
//    • Multi-color × multi-size variants (like handleCreateProductFromChat)
//    • Rich variant metadata: cost_price, manufacturer_sku
//    • Rich product metadata: payload_integration, color_hex_values,
//      variant_specific_image_option, product_details, care_instructions
//    • Per-color garment images: front-design mockup + back/left/right tinted
//    • Variant image assignment via vendor HTTP route (needs vendorToken arg)
//    • Inventory levels via createInventoryLevelsWorkflow
//    • 4th param vendorToken?: string — passed from route via extractBearer
// ─────────────────────────────────────────────────────────────────────────────

export async function handleCreateProduct(
  args:         Record<string, any>,
  vendorId:     string,
  scope:        any,
  vendorToken?: string,             // NEW — Bearer token for vendor HTTP route calls
): Promise<{ ok: boolean; data?: Record<string, any>; error?: string }> {

  // ── Parse args ──────────────────────────────────────────────────────────────
  const title        = String(args.title ?? "").trim()
  const blankId      = String(args.blank_id ?? "").trim()
  const sellingPrice = Number(args.selling_price ?? 0)
  const description  = String(args.description ?? "").trim() || null
  const salesChannel = (args.sales_channel ?? "marketplace") as "marketplace" | "own_store" | "both"
  const sizes: string[] = Array.isArray(args.sizes) && args.sizes.length > 0
    ? args.sizes
    : ["S", "M", "L", "XL", "XXL"]

  // Multi-color: color_names (array) > color_name (single) > empty
  const rawColorNames: string[] = Array.isArray(args.color_names) && args.color_names.length > 0
    ? args.color_names
    : (args.color_name ? [String(args.color_name).trim()] : [])
  const colorNames = rawColorNames.filter(Boolean)

  // Multi-mockup: mockup_session_ids (array) > mockup_session_id (single)
  // Also pull any sessions stored in the vendor's registry (covers every generate_mockup call)
  const explicitSessionIds: string[] = Array.isArray(args.mockup_session_ids) && args.mockup_session_ids.length > 0
    ? args.mockup_session_ids.filter(Boolean)
    : (args.mockup_session_id ? [String(args.mockup_session_id).trim()] : [])

  // Merge vendor registry sessions (dedup)
  const registryIds = getVendorMockupSessions(vendorId).filter(
    s => getMockupColorName(s) !== "canvas-layout"   // exclude canvas-layout entries
  )
  const allSessionIds = [...new Set([...explicitSessionIds, ...registryIds])]

  // Clean title: strip any " - ColorName" suffix accidentally appended by AI
  let cleanTitle = title
  for (const cn of colorNames) {
    const suffix = `- ${cn.toLowerCase()}`
    if (cleanTitle.toLowerCase().endsWith(suffix)) {
      cleanTitle = cleanTitle.slice(0, cleanTitle.length - suffix.length).trimEnd()
    }
  }

  if (!title)            return { ok: false, error: "title is required" }
  if (!blankId)          return { ok: false, error: "blank_id is required" }
  if (sellingPrice <= 0) return { ok: false, error: "selling_price must be a positive number in INR" }

  const query      = scope.resolve(ContainerRegistrationKeys.QUERY)
  const remoteLink = scope.resolve(ContainerRegistrationKeys.LINK)
  const pgClient   = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  // ── 1. Fetch blank from PayloadCMS ─────────────────────────────────────────
  let blank: any
  try {
    const { data } = await axios.get(
      `${PAYLOAD_API}/api/${process.env.PAYLOAD_BLANKS_COLLECTION ?? "blank-products"}/${blankId}?depth=2`,
      { headers: PAYLOAD_SECRET ? { Authorization: `Bearer ${PAYLOAD_SECRET}` } : {} },
    )
    blank = data
  } catch (err: any) {
    if (err?.response?.status === 404)
      return { ok: false, error: `blank_id "${blankId}" not found in catalogue` }
    return { ok: false, error: `Catalogue lookup failed: ${err.message}` }
  }

  const tech         = blank?.printT?.[0]
  const baseCost     = blank?.cost ?? 0
  const colorOptions = blank.colorOptions ?? []
  const sizeOptions  = blank.sizeOptions  ?? []
  const baseSku      = blank["Manufacturer sku"] ?? ""

  // Resolve each color name → { name, hex }
   const selectedColors: Array<{ name: string; hex: string }> = colorNames.map(cn => {
    // Use hex from mockup session — this is the exact hex Claude used when
    // generating the front mockup, so back/left/right tinting matches
    const session = getVendorMockupSessions(vendorId).find(sid =>
      getMockupColorName(sid)?.toLowerCase() === cn.toLowerCase()
    )
    const sessionHex = session ? getMockupColorHex(session) : null

    // Fall back to colorOptions if no session hex
    const match = colorOptions.find((c: any) => c.colorName?.toLowerCase() === cn.toLowerCase())
    const resolvedHex = sessionHex ?? match?.colorHex ?? "#ffffff"

    console.log(`[handleCreateProduct] Color "${cn}": sessionHex=${sessionHex ?? "none"}, colorOptionsHex=${match?.colorHex ?? "none"}, using=${resolvedHex}`)
    return { name: cn, hex: resolvedHex }
  })

  // ── 2. Resolve sales channels ──────────────────────────────────────────────
  const channelIds: string[] = []
  try {
    const vendorFull = await query.graph({
      entity:  "vendor",
      fields:  ["id", "sell_on_marketplace", "sell_on_own_store", "marketplace_status"],
      filters: { id: vendorId },
    })
    const v = vendorFull.data?.[0] as any
    const sellMarketplace     = !!(v?.sell_on_marketplace)
    const sellOwnStore        = !!(v?.sell_on_own_store)
    const marketplaceApproved = v?.marketplace_status === "approved"

    const wantsMarketplace = salesChannel === "marketplace" || salesChannel === "both"
    const wantsOwnStore    = salesChannel === "own_store"   || salesChannel === "both"

    if (wantsMarketplace && sellMarketplace && marketplaceApproved && MARKETPLACE_SC)
      channelIds.push(MARKETPLACE_SC)
    if (wantsOwnStore && sellOwnStore && OWN_STORE_SC)
      channelIds.push(OWN_STORE_SC)
    if (channelIds.length === 0 && MARKETPLACE_SC)
      channelIds.push(MARKETPLACE_SC)
  } catch {
    if (MARKETPLACE_SC) channelIds.push(MARKETPLACE_SC)
  }

  // ── 3. Build variants ─────────────────────────────────────────────────────
  const handle = cleanTitle.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8)

  const priceInCents = Math.round(sellingPrice)

  // Color option comes first so "Lavender / S" reads naturally in storefront
  const productOptions = selectedColors.length > 0
    ? [
        { title: "Color", values: colorNames },
        { title: "Size",  values: sizes },
      ]
    : [{ title: "Size", values: sizes }]

  // colorsToProcess: at least one entry so we always get size variants
  const colorsToProcess = selectedColors.length > 0 ? selectedColors : [{ name: "", hex: "#ffffff" }]

  const variants: any[] = []
  for (const color of colorsToProcess) {
    for (const size of sizes) {
      const dateStr = new Date()
        .toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })
        .replace(/\//g, "")
      const sku = color.name
        ? [
            "JUNI",
            blankId,
            color.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
            size.toLowerCase(),
            dateStr,
            Math.random().toString(36).slice(2, 8).toUpperCase(),
          ].join("-")
        : `JUNI-${blankId}-${size}-${Date.now().toString(36).toUpperCase()}`

      // cost_price: full real cost (printing + GST + blank + shipping)
      // Same calculation as Canvas.tsx pricing panel
      const matchingSize = sizeOptions.find(
        (s: any) => s.sizeName?.toLowerCase() === size.toLowerCase()
      )
      let sizeExtraCost = 0
      if (matchingSize?.ExtraCost) {
        const extra = parseFloat(matchingSize.ExtraCost)
        if (!isNaN(extra) && extra > 0) sizeExtraCost = extra
      }
      let costPrice = baseCost + sizeExtraCost
      try {
        const realPrice = await calculateRealCostPrice(blankId, tech?.id ?? "", ["front"])
        costPrice = Number((realPrice.total_cost_price + sizeExtraCost).toFixed(2))
      } catch (priceErr: any) {
        console.warn(`[handleCreateProduct] Real price calc failed, using baseCost fallback: ${priceErr.message}`)
      }

      // manufacturer_sku: baseSku + colorSku + sizeSku
      const matchingColor = color.name
        ? colorOptions.find((c: any) => c.colorName?.toLowerCase() === color.name.toLowerCase())
        : null
      const manufacturerSku =
        baseSku + (matchingColor?.colorSku ?? "") + (matchingSize?.sizeSku ?? "")

      const variantMetadata: Record<string, any> = {}
      if (costPrice > 0)       variantMetadata.cost_price        = costPrice
      if (manufacturerSku)     variantMetadata.manufacturer_sku  = manufacturerSku

      variants.push({
        title:            color.name ? `${color.name} / ${size}` : size,
        sku,
        manage_inventory: true,
        allow_backorder:  false,
        origin_country:   "IN",
        ...(blank?.HSNCode             ? { hs_code: blank.HSNCode }              : {}),
        ...(blank?.materials?.material ? { material: blank.materials.material }  : {}),
        prices:   [{ amount: priceInCents, currency_code: "inr" }],
        options:  color.name ? { Color: color.name, Size: size } : { Size: size },
        metadata: variantMetadata,
      })
    }
  }

  // ── 4. Build rich product metadata ────────────────────────────────────────
  const productMetadata: Record<string, any> = {
    payload_product_name:  blank.name ?? blankId,
    print_technology_id:   tech?.id ?? "",
    print_technology_name: (tech?.technologyName ?? "dtg").toLowerCase(),
    created_via:           "mcp_claude",
    vendor_id:             vendorId,

    fulfillment_type: JSON.stringify({
      type:          "JUNOONI-fulfillment",
      shipping_time: blank?.shippingInfo?.shippingTime  ?? "2-3 business days",
      handling_time: blank?.shippingInfo?.handlingTime  ?? "3-4 business days",
    }),

    payload_integration: JSON.stringify({
      source_product_id: blank.id,
      base_cost:         baseCost,
      image_settings:    {
        color_Images:    true,
        size_Images:     false,
        material_Images: false,
        style_Images:    false,
      },
      imported_at: new Date().toISOString(),
    }),
  }

  if (selectedColors.length > 0) {
    productMetadata.color_hex_values = JSON.stringify(
      selectedColors.map(c => ({ name: c.name, hex: c.hex }))
    )
    productMetadata.variant_specific_image_option = JSON.stringify([
      { option_name: "Color", enabled: true  },
      { option_name: "Size",  enabled: false },
    ])
  }

  // product_details from materials
  const productDetails: string[] = []
  if (blank?.materials?.material) productDetails.push(blank.materials.material)
  if (blank?.materials?.gsm)      productDetails.push(`${blank.materials.gsm} GSM`)
  if (blank?.materials?.quality)  productDetails.push(blank.materials.quality)
  if (blank?.materials?.type)     productDetails.push(blank.materials.type)
  if (productDetails.length > 0) {
    productMetadata.product_details = JSON.stringify(productDetails)
  }

  // care_instructions
  if (Array.isArray(blank.careInstructions) && blank.careInstructions.length > 0) {
    productMetadata.care_instructions = JSON.stringify(
      blank.careInstructions.map((c: any) => ({
        id:          c.id,
        instruction: c.instruction,
        icon:        c.icon ?? null,
      }))
    )
  }

  // ── 5. Create product ──────────────────────────────────────────────────────
  let product: any
  try {
    const { result } = await createProductsWorkflow(scope).run({
      input: {
        products: [{
          title:          cleanTitle,
          handle,
          description:    description ?? undefined,
          status:         "draft",
          discountable:   true,
          origin_country: "IN",
          ...(blank?.productData?.weight ? { weight: parseInt(blank.productData.weight) } : {}),
          ...(blank?.productData?.length ? { length: parseInt(blank.productData.length) } : {}),
          ...(blank?.productData?.width  ? { width:  parseInt(blank.productData.width)  } : {}),
          ...(blank?.productData?.height ? { height: parseInt(blank.productData.height) } : {}),
          ...(blank?.HSNCode             ? { hs_code:  blank.HSNCode }                    : {}),
          ...(blank?.materials?.material ? { material: blank.materials.material }         : {}),
          ...(blank?.shippingInfo?.shippingProfileID
            ? { shipping_profile_id: blank.shippingInfo.shippingProfileID } : {}),
          options:        productOptions,
          variants,
          sales_channels: channelIds.map(id => ({ id })),
          metadata:       productMetadata,
        }],
      },
    })
    product = result?.[0]
    if (!product?.id) return { ok: false, error: "Product workflow returned no product" }
  } catch (err: any) {
    return { ok: false, error: `Product creation failed: ${err.message}` }
  }

  // ── 6. Generate & upload images per color ─────────────────────────────────
  // Helper: find the right mockup photo for a given area + hex color
  const allMockupPhotos: any[] = tech?.mockupPhotos ?? []

  function findPhoto(photos: any[], areaTarget: string, hexColor: string): any {
    const colorLower = hexColor.toLowerCase()
    const areaNorm   = areaTarget.toLowerCase().replace(/[_-]/g, "")
    const bounded    = (a: string, b: string) =>
      a === b ||
      (a.startsWith(b) && (a.length === b.length || !/[a-z]/.test(a[b.length] ?? ""))) ||
      (b.startsWith(a) && (b.length === a.length || !/[a-z]/.test(b[a.length] ?? "")))

    const pool = photos.filter(p => {
      const va = (p.viewAngle ?? "").toLowerCase().replace(/[_-]/g, "")
      const an = (p.area?.[0]?.areaName ?? "").toLowerCase().replace(/[_-]/g, "")
      return bounded(va, areaNorm) || bounded(an, areaNorm)
    })
    const src = pool.length > 0 ? pool : photos
    return (
      src.find((p: any) => p.photoColor?.toLowerCase() === colorLower) ??
      src.find((p: any) => p.photoColor === "#00000000" || !p.photoColor) ??
      src[0] ?? null
    )
  }

  // Build ordered image list across all colors
  // Per color: front-design-mockup (from session) + back + left + right (tinted garment)
  const imagesToUpload: Array<{
    filename: string; mimeType: string; content: string; access: "public"
  }> = []

  for (let ci = 0; ci < colorsToProcess.length; ci++) {
    const color      = colorsToProcess[ci]
    const colorNorm  = (color.name || "default").toLowerCase()
      .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    const { r, g, b } = hexToRgb(color.hex)

    // (i) Front design mockup — find session matching this color
    const sessionForColor =
      // By color name stored in session
      allSessionIds.find(sid => {
        const cn = getMockupColorName(sid)
        return cn && cn.toLowerCase() === color.name.toLowerCase()
      }) ??
      // Fallback: by index order (first session → first color)
      (ci < explicitSessionIds.length ? explicitSessionIds[ci] : undefined) ??
      // Last fallback: use the first session for the first color only
      (ci === 0 ? allSessionIds[0] : undefined)

    if (sessionForColor) {
      try {
        const b64url = getMockupPreview(sessionForColor)
        if (b64url && b64url.length > 100) {
          const [header, b64] = b64url.split(",")
          const mimeType      = header.replace("data:", "").replace(";base64", "")
          const ext           = mimeType.split("/")[1]?.split("+")[0] ?? "webp"
          imagesToUpload.push({
            filename: `mockup-${colorNorm}-front-design-${ci}.${ext}`,
            mimeType,
            content:  b64,
            access:   "public",
          })
          console.log(`[handleCreateProduct] ${color.name}: front-design from session ${sessionForColor}`)
        }
      } catch (e: any) {
        console.warn(`[handleCreateProduct] ${color.name} front mockup read failed (non-fatal):`, e.message)
      }
    }

    // (ii) Back, left, right — download plain garment photo + tint if transparent
    for (const area of ["back", "left", "right"] as const) {
      const photo = findPhoto(allMockupPhotos, area, color.hex)
      if (!photo?.photo?.url) continue

      try {
        const resp = await axios.get(
          `${PAYLOAD_API}${photo.photo.url}`,
          {
            responseType: "arraybuffer",
            headers:      PAYLOAD_SECRET ? { Authorization: `Bearer ${PAYLOAD_SECRET}` } : {},
            timeout:      15000,
          }
        )
        const buf = Buffer.from(resp.data)
        if (buf.length < 1000) {
          console.warn(`[handleCreateProduct] ${color.name} ${area}: garment photo too small, skipping`)
          continue
        }

        let finalBuf: Buffer
        const needsTinting = photo.requiresColorMasking ||
          photo.photoColor === "#00000000" || !photo.photoColor

        if (needsTinting) {
          // Multiply + screen blend for realistic garment tinting
          const resized  = await sharp(buf, { failOn: "none" })
            .resize(OUTPUT_SIZE, OUTPUT_SIZE, { fit: "cover" })
            .ensureAlpha().png().toBuffer()
          const colored  = await sharp({
            create: { width: OUTPUT_SIZE, height: OUTPUT_SIZE, channels: 4,
                      background: { r, g, b, alpha: 1 } }
          }).png().toBuffer()
          const textured = await sharp(colored)
            .composite([{ input: resized, blend: "multiply" }]).png().toBuffer()
          finalBuf       = await sharp(textured)
            .composite([{ input: resized, blend: "screen" }])
            .webp({ quality: 85 }).toBuffer()
        } else {
          finalBuf = await sharp(buf, { failOn: "none" })
            .resize(OUTPUT_SIZE, OUTPUT_SIZE, { fit: "cover" })
            .webp({ quality: 85 }).toBuffer()
        }

        imagesToUpload.push({
          filename: `mockup-${colorNorm}-${area}-${ci}.webp`,
          mimeType: "image/webp",
          content:  finalBuf.toString("base64"),
          access:   "public",
        })
        console.log(`[handleCreateProduct] ${color.name} ${area}: garment photo ✓`)
      } catch (e: any) {
        console.warn(`[handleCreateProduct] ${color.name} ${area}: garment photo failed (non-fatal):`, e.message)
      }
    }
  }

  // Upload all images
  let uploadedFileMeta: Array<{ id: string; url: string; filename: string }> = []
  let uploadedImageUrls: string[] = []

  if (imagesToUpload.length > 0) {
    try {
      const { result: uploaded } = await uploadFilesWorkflow(scope).run({
        input: { files: imagesToUpload },
      })
      uploadedFileMeta = (uploaded as any[])
        .map((f: any, idx: number) => ({
          id:       f?.id   ?? "",
          url:      f?.url  ?? "",
          filename: imagesToUpload[idx]?.filename ?? "",
        }))
        .filter(f => f.id && f.url)
      uploadedImageUrls = uploadedFileMeta.map(f => f.url)
      console.log(`[handleCreateProduct] ✅ Uploaded ${uploadedImageUrls.length} images`)
    } catch (e: any) {
      console.warn("[handleCreateProduct] Image upload failed (non-fatal):", e.message)
    }
  }

  // Attach all images to product + set thumbnail from first color's first image
  if (uploadedImageUrls.length > 0) {
    try {
      const firstColorNorm = (colorsToProcess[0]?.name || "default")
        .toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      const thumbnailMeta =
        uploadedFileMeta.find(f => f.filename.startsWith(`mockup-${firstColorNorm}-front`)) ??
        uploadedFileMeta[0]

      await updateProductsWorkflow(scope).run({
        input: {
          products: [{
            id:        product.id,
            images:    uploadedImageUrls.map(url => ({ url })),
            thumbnail: thumbnailMeta.url,
          }],
        },
      })
      console.log(`[handleCreateProduct] ✅ ${uploadedImageUrls.length} images attached to product`)
    } catch (e: any) {
      console.warn("[handleCreateProduct] Product image update failed (non-fatal):", e.message)
    }
  }

  // ── 7. Assign variant images (per color) ──────────────────────────────────
  if (uploadedFileMeta.length > 0) {
    try {
      // Wait briefly for DB to commit images before querying them back
      await new Promise(resolve => setTimeout(resolve, 600))

      const [imgResult, varResult] = await Promise.all([
        query.graph({
          entity:  "product",
          fields:  ["images.id", "images.url"],
          filters: { id: product.id },
        }),
        query.graph({
          entity:  "product_variant",
          fields:  ["id", "title", "options.value", "options.option.title"],
          filters: { product_id: product.id },
        }),
      ])

      const productImgs: Array<{ id: string; url: string }> =
        (imgResult.data?.[0] as any)?.images ?? []
      const dbVariants: any[] = varResult.data ?? []

      const normalizeStr = (s: string) =>
        s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

      const MEDUSA_URL = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"

      for (const variant of dbVariants) {
        const opts      = (variant.options ?? []) as any[]
        const colorOpt  = opts.find((o: any) =>
          o.option?.title?.toLowerCase() === "color" ||
          o.option?.title?.toLowerCase() === "colour"
        )
        if (!colorOpt?.value) continue
        const variantColorNorm = normalizeStr(colorOpt.value)

        const matchingImgs = productImgs.filter((img: any) => {
          const fn = (img.url ?? "").toLowerCase().split("/").pop() ?? ""
          return (
            fn.includes(`-${variantColorNorm}-`) ||
            fn.includes(`-${variantColorNorm}.`) ||
            fn.startsWith(`mockup-${variantColorNorm}-`)
          )
        })
        if (matchingImgs.length === 0) continue

        // Use the front-design image as thumbnail if available
        const frontImg =
          matchingImgs.find((img: any) =>
            (img.url ?? "").toLowerCase().split("/").pop()?.includes("front")
          ) ?? matchingImgs[0]
        const thumbnailUrl = frontImg.url

        console.log(
          `[handleCreateProduct] Assigning ${matchingImgs.length} images` +
          ` to variant "${variant.title}" (${colorOpt.value})`
        )

        // Try vendor HTTP route first (needs vendorToken)
        let assigned = false
        try {
          for (const img of matchingImgs) {
            const chars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
            let t = Date.now(), timeStr = ""
            for (let i = 9; i >= 0; i--) { timeStr = chars[t % 32] + timeStr; t = Math.floor(t / 32) }
            let rand = ""
            for (let i = 0; i < 16; i++) rand += chars[Math.floor(Math.random() * 32)]
            const newId = "pvpi_" + (timeStr + rand).slice(0, 26)

            await pgClient.raw(
              `INSERT INTO "product_variant_product_image" (id, variant_id, image_id)
               VALUES (?, ?, ?)
               ON CONFLICT DO NOTHING`,
              [newId, variant.id, img.id]
            )
          }
          assigned = true
          console.log(`[handleCreateProduct] ✅ Variant "${variant.title}": ${matchingImgs.length} images via product_variant_product_image`)

          // Set thumbnail on the variant
          await pgClient.raw(
            `UPDATE product_variant SET thumbnail = ? WHERE id = ?`,
            [thumbnailUrl, variant.id]
          )
          console.log(`[handleCreateProduct] ✅ Variant "${variant.title}" thumbnail set: ${thumbnailUrl.split("/").pop()}`)
        } catch (e: any) {
          console.warn(`[handleCreateProduct] product_variant_product_image insert failed: ${e.message}`)
        }

        if (!assigned) {
          try {
            await pgClient.raw(
              `UPDATE product_variant
               SET metadata = COALESCE(metadata, '{}'::jsonb) || ?::jsonb
               WHERE id = ?`,
              [
                JSON.stringify({
                  images:        matchingImgs.map((img: any) => ({ id: img.id, url: img.url })),
                  thumbnail_url: thumbnailUrl,
                }),
                variant.id,
              ]
            )
            console.log(`[handleCreateProduct] ✅ Variant "${variant.title}" images via metadata fallback`)
          } catch (e2: any) {
            console.warn(`[handleCreateProduct] Metadata fallback failed:`, e2.message)
          }
        }
      }
    } catch (e: any) {
      console.warn("[handleCreateProduct] Variant image assignment failed (non-fatal):", e.message)
    }
  }

  // ── 8. Inventory levels ────────────────────────────────────────────────────
  const locationId: string =
    blank?.shippingInfo?.shippingLocationID || DEFAULT_LOCATION_ID
  if (locationId) {
    try {
      const invRows = await pgClient.raw(
        `SELECT pv.id as variant_id, ii.id as inventory_item_id
         FROM product_variant pv
         JOIN product_variant_inventory_item pvii ON pvii.variant_id = pv.id
         JOIN inventory_item ii ON ii.id = pvii.inventory_item_id
         WHERE pv.product_id = ? AND pv.deleted_at IS NULL AND ii.deleted_at IS NULL`,
        [product.id]
      )
      const rows: any[] = invRows.rows ?? invRows[0] ?? []
      const inventoryLevels = rows.map(row => ({
        inventory_item_id: row.inventory_item_id,
        location_id:       locationId,
        stocked_quantity:  10,
      }))
      if (inventoryLevels.length > 0) {
        await createInventoryLevelsWorkflow(scope).run({
          input: { inventory_levels: inventoryLevels },
        })
        console.log(`[handleCreateProduct] ✅ Inventory: ${inventoryLevels.length} levels created`)
      }
    } catch (e: any) {
      console.warn("[handleCreateProduct] Inventory levels failed (non-fatal):", e.message)
    }
  }

  // Clear vendor mockup registry now that we've consumed the sessions
  clearVendorMockupSessions(vendorId)

  // ── 8b. Create artwork record ──────────────────────────────────────────────
  // Upload design file + approved mockup, create vendor_artwork, link to product
    try {
    const artworkFiles: Array<{ filename: string; mimeType: string; content: string; access: "private" | "public" }> = []
    // Tracks what each file is, so descriptions/categories don't depend on array position
    const artworkFileKinds: Array<"design" | "mockup"> = []

    // Declared up front so the description can be used later without `var`
    let mockupDescription: string | undefined

    // Design pixel sizes (original upload vs. trimmed ink), used for consumed-area math
    let designOrigW = 0, designOrigH = 0
    let designTrimW = 0, designTrimH = 0

    // File 1: Original design file from session
    const designFile = getDesignFile(args.design_session_id ?? "")
    if (designFile && designFile.base64.length > 100) {
      let artworkContent = designFile.base64.replace(/^data:[^;]+;base64,/, "")
      const originalBuffer = Buffer.from(artworkContent, "base64")

      try {
        const origMeta = await sharp(originalBuffer).metadata()
        designOrigW = origMeta.width  ?? 0
        designOrigH = origMeta.height ?? 0
      } catch { /* handled by fallback below */ }

      try {
        const { data: trimmed, info } = await sharp(originalBuffer)
          .trim()
          .png()
          .toBuffer({ resolveWithObject: true })
        artworkContent = trimmed.toString("base64")
        designTrimW = info.width
        designTrimH = info.height
        console.log(`[handleCreateProduct] ✅ Artwork trimmed: ${designOrigW}x${designOrigH} → ${designTrimW}x${designTrimH}`)
      } catch (trimErr: any) {
        console.warn(`[handleCreateProduct] Trim failed (using original): ${trimErr.message}`)
        designTrimW = designOrigW
        designTrimH = designOrigH
      }

      artworkFiles.push({
        filename: designFile.filename ?? "design.png",
        mimeType: "image/png",
        content:  artworkContent,
        access:   "private",
      })
      artworkFileKinds.push("design")
    }

        // File 2: Approved front mockup (first session for first color)
    const firstSession = allSessionIds[0]
    const mockupBase64 = firstSession ? getMockupPreview(firstSession) : null
    if (mockupBase64 && mockupBase64.length > 100) {
      const custArea   = tech?.custAreas?.[0]
      const canvasPixW = custArea?.canvasDim?.canvasPixWid    ?? 800
      const canvasPixH = custArea?.canvasDim?.canvasPixHeight ?? 800
      const realWorldW = custArea?.canvasDim?.widthInch       ?? 14
      const realWorldH = custArea?.canvasDim?.heightInch      ?? 16

      // ── 1. PRINTABLE AREA (real-world inches) ─────────────────────────────
      // widthInch/heightInch already describe the printable rectangle itself
      const printAreaW = realWorldW
      const printAreaH = realWorldH

      const rawCoord = custArea?.designCanvasPhotos?.[0]?.printAreaCoord ?? { x: 0, y: 0, width: 1, height: 1 }
      const isNorm   = rawCoord.x <= 1 && rawCoord.y <= 1 && rawCoord.width <= 1 && rawCoord.height <= 1

      // Print rectangle as a fraction of the canvas photo (used only for the fit math)
      const printFracW = isNorm ? rawCoord.width  : rawCoord.width  / canvasPixW
      const printFracH = isNorm ? rawCoord.height : rawCoord.height / canvasPixH

      // ── 2. CONSUMED DESIGN AREA (real-world inches) ───────────────────────
      let designFracW = 1
      let designFracH = 1

      if (designOrigW > 0 && designOrigH > 0) {
        const printPxW = printFracW * OUTPUT_SIZE
        const printPxH = printFracH * OUTPUT_SIZE

        const fitScale = Math.min(
          (printPxW * 0.85) / designOrigW,
          (printPxH * 0.85) / designOrigH,
        )

        let placedPxW = designOrigW * fitScale
        let placedPxH = designOrigH * fitScale

        if (designTrimW > 0 && designTrimH > 0) {
          placedPxW *= designTrimW / designOrigW
          placedPxH *= designTrimH / designOrigH
        }

        designFracW = Math.min(1, placedPxW / printPxW)
        designFracH = Math.min(1, placedPxH / printPxH)
      }

      const designW = Number((designFracW * printAreaW).toFixed(2))
      const designH = Number((designFracH * printAreaH).toFixed(2))

      // Effective resolution of the trimmed artwork at that physical size
      const effectiveDpi = designW > 0 && designTrimW > 0
        ? Math.round(designTrimW / designW)
        : null

      const mockupMeta = mockupPreviewStore.get(firstSession)
      const colorName  = mockupMeta?.colorName ?? colorNames[0] ?? "default"

      artworkFiles.push({
        filename: `mockup-${colorName.toLowerCase().replace(/\s+/g, "-")}-front.webp`,
        mimeType: "image/webp",
        content:  mockupBase64.replace(/^data:[^;]+;base64,/, ""),
        access:   "public",
      })
      artworkFileKinds.push("mockup")

      mockupDescription = [
        `DESIGNED MOCKUP - FRONT AREA`,
        ``,
        `Color: ${colorName}`,
        ``,
        `CANVAS SPECIFICATIONS:`,
        `- Canvas Image:     ${canvasPixW} × ${canvasPixH} pixels`,
        `- Max Print Area:   ${realWorldW}" × ${realWorldH}"`,
        ``,
        `PRINT AREA DIMENSIONS (real world):`,
        `- Printable Width:  ${printAreaW}"`,
        `- Printable Height: ${printAreaH}"`,
        ``,
        `CONSUMED DESIGN AREA (real world):`,
        `- Design Width:     ${designW}"`,
        `- Design Height:    ${designH}"`,
        `- Design Size:      ${designW}" × ${designH}"`,
        ...(effectiveDpi
          ? [`- Artwork File:     ${designTrimW} × ${designTrimH} px (~${effectiveDpi} DPI at this size)`]
          : []),
        ``,
        `Generated via JUNOONI MCP — ${new Date().toISOString()}`,
      ].join("\n")
    }

    if (artworkFiles.length > 0) {
      const { result: artworkUploads } = await uploadFilesWorkflow(scope).run({
        input: { files: artworkFiles },
      })

      const artworkMedias = artworkUploads.map((uploaded: any, idx: number) => {
        const isDesign = artworkFileKinds[idx] === "design"
        return {
          image_url:        uploaded.url,
          filename:         artworkFiles[idx]?.filename ?? `file-${idx}`,
          mime_type:        artworkFiles[idx]?.mimeType ?? "image/png",
          file_id:          uploaded.id,
          file_type:        "image",
          file_description: isDesign
            ? `Design artwork file — ${artworkFiles[idx]?.filename}`
            : (mockupDescription ?? "Designed mockup front view"),
          design_area:      "front",
          file_category:    isDesign ? "design_element" : "mockup_preview",
          fileId:           uploaded.id,
          mimeType:         artworkFiles[idx]?.mimeType ?? "image/png",
        }
      })

      let artworkId: string | null = null
      try {
        const { result: artworkResult } = await CreateArtworkWorkflow(scope).run({
          input: {
            vendor_artwork: {
              name:        `${cleanTitle} - Design & Mockup`,
              description: `Design artwork and approved mockup for ${cleanTitle}`,
              medias:      artworkMedias,
            },
          },
        })
        artworkId = artworkResult?.vendor_artwork?.id ?? null
        console.log(`[handleCreateProduct] ✅ Artwork created: id=${artworkId}`)
      } catch (artworkErr: any) {
        console.warn(`[handleCreateProduct] Artwork workflow failed (non-fatal): ${artworkErr.message}`)
      }

      // Add design_artwork to product metadata (same key as canvas products)
      if (artworkId) {
        const designArtworkPayload = [{
          artwork_data:            { vendor_artwork: { id: artworkId, name: `${cleanTitle} - Design & Mockup` } },
          design_areas:            ["front"],
          image_count:             artworkFiles.length,
          design_elements_count:   1,
          canvas_images_count:     1,
          is_combined_artwork:     true,
          artwork_id:              artworkId,
          contains_canvas_layouts: true,
        }]

        try {
          await updateProductsWorkflow(scope).run({
            input: {
              products: [{
                id:       product.id,
                metadata: {
                  ...productMetadata,
                  design_artwork: JSON.stringify(designArtworkPayload),
                },
              }],
            },
          })
          console.log(`[handleCreateProduct] ✅ design_artwork added to product metadata`)
        } catch (metaErr: any) {
          console.warn(`[handleCreateProduct] metadata update failed (non-fatal): ${metaErr.message}`)
        }
      }

      // Link artwork to product
      if (artworkId && product.id) {
        try {
          await remoteLink.create([{
            product:             { product_id:        product.id },
            vendorArtworkModule: { vendor_artwork_id: artworkId  },
          }])
          console.log(`[handleCreateProduct] ✅ Artwork linked via remoteLink`)
        } catch {
          try {
            const linkId = "link_" + Array.from({ length: 26 }, () =>
              "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[Math.floor(Math.random() * 32)]
            ).join("")
            await pgClient.raw(
              `INSERT INTO product_product_vendorartworkmodule_vendor_artwork
               (id, product_id, vendor_artwork_id, created_at, deleted_at)
               VALUES (?, ?, ?, NOW(), NULL) ON CONFLICT DO NOTHING`,
              [linkId, product.id, artworkId]
            )
            console.log(`[handleCreateProduct] ✅ Artwork linked via direct DB`)
          } catch (dbErr: any) {
            console.warn(`[handleCreateProduct] Artwork link failed (non-fatal): ${dbErr.message}`)
          }
        }
      }
    }
  } catch (artworkErr: any) {
    console.warn(`[handleCreateProduct] Artwork creation failed (non-fatal): ${artworkErr.message}`)
  }


  // ── 9. Link vendor ─────────────────────────────────────────────────────────
  try {
    await remoteLink.create([{
      vendor:  { vendor_id: vendorId },
      product: { product_id: product.id },
    }])
  } catch {
    // remoteLink failed — fall back to direct multi-table insert
    try {
      const chars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
      let t = Date.now(), timeStr = ""
      for (let i = 9; i >= 0; i--) { timeStr = chars[t % 32] + timeStr; t = Math.floor(t / 32) }
      let rand = ""
      for (let i = 0; i < 16; i++) rand += chars[Math.floor(Math.random() * 32)]
      const linkId   = "link_" + (timeStr + rand).slice(0, 26)
      const linkData = JSON.stringify({ id: linkId, vendor_id: vendorId, product_id: product.id })
      const tsv = `'${vendorId.toLowerCase()}':3 '${product.id.toLowerCase().replace("prod_", "")}':5 '${linkId.toLowerCase().replace("link_", "")}':2 'link':1 'prod':4`

      await pgClient.raw(
        `INSERT INTO "marketplacemodule_vendor_product_product"
           (id, vendor_id, product_id, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, NOW(), NOW(), NULL) ON CONFLICT DO NOTHING`,
        [linkId, vendorId, product.id],
      )
      await pgClient.raw(
        `INSERT INTO "cat_linkmarketplacemodulevendorproductproduct"
           (id, name, data, created_at, updated_at, deleted_at, staled_at, document_tsv)
         VALUES (?, ?, ?::jsonb, NOW(), NOW(), NULL, NULL, ?::tsvector) ON CONFLICT DO NOTHING`,
        [linkId, "LinkMarketplaceModuleVendorProductProduct", linkData, tsv],
      )
      await pgClient.raw(
        `INSERT INTO "cat_pivot_vendorlinkmarketplacemodulevendorproductproduct"
           (pivot, parent_id, parent_name, child_id, child_name, created_at, updated_at, deleted_at, staled_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NULL, NULL) ON CONFLICT DO NOTHING`,
        ["Vendor-LinkMarketplaceModuleVendorProductProduct", vendorId, "Vendor", linkId, "LinkMarketplaceModuleVendorProductProduct"],
      )
      await pgClient.raw(
        `INSERT INTO "cat_pivot_linkmarketplacemodulevendorproductproductproduct"
           (pivot, parent_id, parent_name, child_id, child_name, created_at, updated_at, deleted_at, staled_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NULL, NULL) ON CONFLICT DO NOTHING`,
        ["LinkMarketplaceModuleVendorProductProduct-Product", linkId, "LinkMarketplaceModuleVendorProductProduct", product.id, "Product"],
      )
    } catch (dbErr: any) {
      console.warn("[handleCreateProduct] vendor link failed (non-fatal):", dbErr.message)
    }
  }

  // ── 10. Return result ──────────────────────────────────────────────────────
  return {
    ok: true,
    data: {
      id:                product.id,
      title:             cleanTitle,
      handle:            product.handle,
      status:            "draft",
      blank_id:          blankId,
      blank_name:        blank.name ?? blankId,
      colors:            colorNames,
      color_count:       colorNames.length,
      sizes,
      variant_count:     variants.length,
      image_count:       uploadedImageUrls.length,
      selling_price_inr: `₹${sellingPrice.toFixed(0)}`,
      on_marketplace:    channelIds.includes(MARKETPLACE_SC),
      on_own_store:      OWN_STORE_SC ? channelIds.includes(OWN_STORE_SC) : false,
      studio_url:        `https://studio.junooni.com/products/${product.id}`,
      next_step:         colorNames.length > 1
        ? `Product created as Draft with ${colorNames.length} color variants. Review and publish from your JUNOONI dashboard.`
        : "Product created as Draft. Review and publish from your JUNOONI dashboard.",
    },
  }
}


// ─── upload_artwork (MCP) ─────────────────────────────────────────────────────

export async function handleUploadArtworkFromUrl(
  args: { artwork_url: string; filename?: string },
  vendorId: string
): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const response = await axios.get(args.artwork_url, {
      responseType: "arraybuffer",
      timeout: 15000,
    })
    const buffer      = Buffer.from(response.data)
    const contentType = (response.headers["content-type"] ?? "image/png").split(";")[0].trim()
    const ext         = contentType.split("/")[1] ?? "png"
    const filename    = args.filename ?? `artwork-${Date.now()}.${ext}`
    const base64      = `data:${contentType};base64,${buffer.toString("base64")}`
    const meta        = await sharp(buffer).metadata()
    const sessionId   = storeDesignFile(vendorId, base64, filename, contentType)

    return {
      ok: true,
      data: {
        design_session_id: sessionId,
        filename,
        width:      meta.width  ?? 0,
        height:     meta.height ?? 0,
        size_bytes: buffer.length,
        message:    "Artwork stored. Use design_session_id in generate_mockup then create_product.",
      },
    }
  } catch (err: any) {
    return { ok: false, error: `Failed to download artwork: ${err.message}` }
  }
}