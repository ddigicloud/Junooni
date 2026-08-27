// ─── JuniMockupBridge.ts ──────────────────────────────────────────────────────
// Bridges JUNI AI chat to the Canvas designer's existing functions.
// Three responsibilities:
//   1. buildDesignElement()     — same image processing as useDesignElements.ts addImageToCanvas()
//   2. calculateJuniPricing()   — exact same pricing as usePricing.ts calculateTotalPricing()
//   3. generateJuniMockup()     — calls renderMockupDirectly() from MockupGeneratorClass.ts
//
// ALL logic is ported directly from existing hooks — zero new logic.
//
// Place at: designer/components/JuniMockupBridge.ts
// ─────────────────────────────────────────────────────────────────────────────

import { renderMockupDirectly } from './MockupGeneratorClass'
import type { DesignElement, TotalPricingBreakdown, AreaPricingInfo } from './types'
import { resolveImageUrl, optimizeImage, cropTransparentPixels } from './utils'

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: Data helpers (same as Canvas.tsx getCanvasConfig / getPrintableAreaFromPhoto)
// ─────────────────────────────────────────────────────────────────────────────

function buildCanvasConfig(custArea: any) {
  const dims = custArea?.canvasDim
  return {
    width:           dims?.canvasPixWid    ?? 800,
    height:          dims?.canvasPixHeight ?? 800,
    realWorldWidth:  dims?.widthInch       ?? 8,
    realWorldHeight: dims?.heightInch      ?? 8,
  }
}

function buildPrintableArea(
  custArea: any,
  canvasConfig: ReturnType<typeof buildCanvasConfig>
) {
  const fallback = { x: 0, y: 0, width: canvasConfig.width, height: canvasConfig.height }
  const photos: any[] = custArea?.designCanvasPhotos ?? []
  if (!photos.length) return fallback

  const photo = photos.find((p: any) =>
    ['#ffffff', 'white'].includes(p?.photoColor?.toLowerCase() ?? '')
  ) ?? photos[0]

  if (!photo?.printAreaCoord) return fallback
  const coord = photo.printAreaCoord
  const isNorm = coord.x <= 1 && coord.y <= 1 && coord.width <= 1 && coord.height <= 1

  return {
    x:      (isNorm ? coord.x      : coord.x / canvasConfig.width)  * canvasConfig.width,
    y:      (isNorm ? coord.y      : coord.y / canvasConfig.height) * canvasConfig.height,
    width:  (isNorm ? coord.width  : coord.width)  * canvasConfig.width,
    height: (isNorm ? coord.height : coord.height) * canvasConfig.height,
  }
}

function findMockupPhoto(mockupPhotos: any[], areaName: string, colorHex: string): any | null {
  const colorLower = colorHex.toLowerCase()
  const areaNorm   = areaName.toLowerCase().replace(/_/g, '').replace(/-/g, '')

  const matchesArea = (p: any) => {
    const va = (p.viewAngle ?? '').toLowerCase().replace(/_/g, '')
    const an = (p.area?.[0]?.areaName ?? '').toLowerCase().replace(/_/g, '')
    return va === areaNorm || an === areaNorm ||
           va.startsWith(areaNorm) || areaNorm.startsWith(va) ||
           an.startsWith(areaNorm) || areaNorm.startsWith(an)
  }

  const pool = mockupPhotos.filter(matchesArea)
  const src  = pool.length > 0 ? pool : mockupPhotos

  return (
    src.find((p: any) => p.photoColor?.toLowerCase() === colorLower) ??
    src.find((p: any) => p.photoColor === '#00000000' || !p.photoColor) ??
    src[0] ?? null
  )
}

function getCustArea(tech: any, areaName: string): any | null {
  const norm = areaName.toLowerCase().replace(/_/g, '').replace(/-/g, '')
  return tech?.custAreas?.find((a: any) => {
    const cn = (a.areaName ?? '').toLowerCase().replace(/_/g, '').replace(/-/g, '')
    return cn === norm || cn.startsWith(norm) || norm.startsWith(cn)
  }) ?? tech?.custAreas?.[0] ?? null
}

function getAllConfigs(tech: any) {
  const canvasConfigs:  Record<string, any> = {}
  const printableAreas: Record<string, any> = {}
  ;(tech?.custAreas ?? []).forEach((ca: any) => {
    const key = (ca.areaName ?? '').toLowerCase().trim()
    if (!key) return
    const cfg = buildCanvasConfig(ca)
    canvasConfigs[key]  = cfg
    printableAreas[key] = buildPrintableArea(ca, cfg)
  })
  return { canvasConfigs, printableAreas }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: Design element creation
// Ported directly from useDesignElements.ts → addImageToCanvas()
// Same pipeline: load → optimize if large → crop transparent pixels → center in printable area
// ─────────────────────────────────────────────────────────────────────────────

async function buildDesignElementFromBase64(
  designBase64: string,
  printableArea: { x: number; y: number; width: number; height: number }
): Promise<DesignElement> {
  // Load image (same as useDesignElements img.onload)
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.crossOrigin = 'anonymous'
    i.onload  = () => resolve(i)
    i.onerror = () => reject(new Error('Failed to load design image'))
    i.src = designBase64
  })

  let finalImage = img
  let finalBase64 = designBase64

  // Optimize if large (same threshold as useDesignElements: 2_000_000 pixels)
  const imageSize = (img.naturalWidth || img.width) * (img.naturalHeight || img.height)
  if (imageSize > 2_000_000) {
    try {
      const result = await Promise.race([
        optimizeImage(img, 1500, 0.85),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error('Timeout')), 12000)),
      ])
      finalImage  = result.optimizedImage
      finalBase64 = result.optimizedBase64
    } catch { /* keep original */ }
  }

  // Crop transparent pixels (same as useDesignElements: only if reduction > 5%)
  try {
    const cropResult = cropTransparentPixels(finalImage)
    const origArea   = (finalImage.naturalWidth || finalImage.width) * (finalImage.naturalHeight || finalImage.height)
    const reduction  = 1 - (cropResult.bounds.width * cropResult.bounds.height) / origArea
    if (reduction > 0.05) {
      const croppedImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const ci = new Image()
        ci.onload  = () => resolve(ci)
        ci.onerror = () => reject(new Error('Crop failed'))
        ci.src = cropResult.croppedBase64
      })
      finalImage  = croppedImg
      finalBase64 = cropResult.croppedBase64
    }
  } catch { /* keep original */ }

  // Calculate size — fit within 80% of printable area preserving aspect ratio
  // (same as useDesignElements: maxWidth = printableArea.width * 0.8)
  const aspectRatio = (finalImage.naturalWidth || finalImage.width) / (finalImage.naturalHeight || finalImage.height)
  const maxWidth    = printableArea.width  * 0.8
  const maxHeight   = printableArea.height * 0.8
  let w = maxWidth, h = maxWidth / aspectRatio
  if (h > maxHeight) { h = maxHeight; w = maxHeight * aspectRatio }

  // Center in printable area (same as useDesignElements)
  const x = printableArea.x + (printableArea.width  - w) / 2
  const y = printableArea.y + (printableArea.height - h) / 2

  return {
    id:       `juni-${Date.now()}-${Math.random()}`,
    type:     'image',
    x, y, width: w, height: h,
    rotation: 0, scaleX: 1, scaleY: 1,
    draggable: false, selected: false, zIndex: 1,
    image:     finalImage,
    imageName: 'JUNI Design',
    imageBase64: finalBase64,
    originalImageWidth:  finalImage.naturalWidth  || finalImage.width,
    originalImageHeight: finalImage.naturalHeight || finalImage.height,
    opacity: 1, visible: true, locked: false,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: Pricing calculation
// Ported directly from usePricing.ts → calculateTotalPricing()
// Every field reads from the same PayloadCMS blank data fields.
// ─────────────────────────────────────────────────────────────────────────────

export interface JuniPricingResult {
  basePrintingCost: number
  blankProductCost: number
  printingGSTAmount: number
  productGSTAmount: number
  setupFee: number
  technologyFee: number
  shippingCharges: number
  finalPrice: number   // basePrinting + GSTs + blank + setup + tech + shipping
  suggestedSellingPrice: number  // finalPrice × 2 rounded to nearest 10
  breakdown: TotalPricingBreakdown
}

export function calculateJuniPricing(
  blankData:    any,    // full blank API response
  tech:         any,    // the selected technology object (tech.custAreas etc.)
  designElement: DesignElement,
  area:         string, // e.g. "front"
  colorHex:     string,
): JuniPricingResult {
  // Read custArea for this area
  const custArea    = getCustArea(tech, area)
  const canvasConfig  = buildCanvasConfig(custArea)
  const printableArea = buildPrintableArea(custArea, canvasConfig)

  // ── getPricingInfoForArea (same as usePricing.ts) ─────────────────────────
  const minimumPrice     = parseFloat(custArea?.['Minimum printing price'] ?? '0')
  const pricePerSqIn     = parseFloat(custArea?.['Per sq inch printing price'] ?? '0')
  const isFixedPrice     = !!(minimumPrice && !pricePerSqIn)

  // ── calculateAreaPricing AABB (same as usePricing.ts) ────────────────────
  const el = designElement
  const ew = el.width  * (el.scaleX || 1)
  const eh = el.height * (el.scaleY || 1)

  // AABB for single element (no rotation needed for JUNI — always 0)
  let minX = el.x, minY = el.y, maxX = el.x + ew, maxY = el.y + eh

  // Clamp to printable area
  minX = Math.max(minX, printableArea.x)
  minY = Math.max(minY, printableArea.y)
  maxX = Math.min(maxX, printableArea.x + printableArea.width)
  maxY = Math.min(maxY, printableArea.y + printableArea.height)

  let basePrintingCost = 0

  if (minX < maxX && minY < maxY) {
    const avgPPI = (
      (printableArea.width  / canvasConfig.realWorldWidth) +
      (printableArea.height / canvasConfig.realWorldHeight)
    ) / 2
    const consumedW = Math.min((maxX - minX) / avgPPI, canvasConfig.realWorldWidth)
    const consumedH = Math.min((maxY - minY) / avgPPI, canvasConfig.realWorldHeight)
    const consumedSqIn = consumedW * consumedH

    basePrintingCost = isFixedPrice
      ? minimumPrice
      : Math.max(minimumPrice, consumedSqIn * pricePerSqIn)
  }

  // ── calculateTotalPricing (same formula as usePricing.ts) ────────────────
  const blankProductCost    = blankData?.cost ?? 0
  const additionalCosts     = blankData?.additionalCosts ?? {}
  const setupFee            = parseFloat(additionalCosts.setupFee        ?? '0')
  const technologyFee       = parseFloat(additionalCosts.rushSurcharge   ?? '0')
  const printingGSTPercent  = parseFloat(additionalCosts.printingGST     ?? '0')
  const productGSTPercent   = parseFloat(blankData?.['GST Cost']         ?? '0')
  const shippingCharges     = parseFloat(blankData?.shippingInfo?.shippingCharges ?? '0')

  const printingGSTAmount   = printingGSTPercent > 0 ? basePrintingCost * printingGSTPercent / 100 : 0
  const productGSTAmount    = productGSTPercent  > 0 ? blankProductCost * productGSTPercent  / 100 : 0

  const finalPrice = Number((
    basePrintingCost + printingGSTAmount +
    blankProductCost + productGSTAmount  +
    setupFee + technologyFee + shippingCharges
  ).toFixed(2))

  // Suggested selling = finalPrice × 2.2 rounded to nearest 10 (creator margin ~55%)
  const suggestedSellingPrice = Math.ceil(finalPrice * 2.2 / 10) * 10

  // Build TotalPricingBreakdown matching usePricing.ts structure
  const areaKey = area.toLowerCase()
  const areaInfo: AreaPricingInfo = {
    areaId: areaKey,
    areaName: custArea?.areaName ?? area,
    minimumPrice, pricePerSquareInch: pricePerSqIn,
    designAreaSquareInches: canvasConfig.realWorldWidth * canvasConfig.realWorldHeight,
    currentImageArea: 0, calculatedPrice: basePrintingCost, finalPrice: basePrintingCost,
    consumedWidth: 0, consumedHeight: 0, elements: [],
  }

  const breakdown: TotalPricingBreakdown = {
    areas: { [areaKey]: areaInfo },
    calculation: {
      subtotal: basePrintingCost, setupFee, technologyFee,
      printingGSTAmount: Number(printingGSTAmount.toFixed(2)),
      productGSTAmount:  Number(productGSTAmount.toFixed(2)),
      shippingCharges:   Number(shippingCharges.toFixed(2)),
      totalBeforeMarkup: finalPrice, markup: 0,
      finalTotal: finalPrice,
    },
    technology: tech?.technologyName ?? '',
    totalElements: 1,
    totalDesignArea: canvasConfig.realWorldWidth * canvasConfig.realWorldHeight,
    priceBreakdown: {
      basePrintingCost: Number(basePrintingCost.toFixed(2)),
      blankProductCost: Number(blankProductCost.toFixed(2)),
      printingGSTAmount: Number(printingGSTAmount.toFixed(2)),
      productGSTAmount:  Number(productGSTAmount.toFixed(2)),
      setupFees: setupFee, additionalCosts: technologyFee,
      shippingCharges: Number(shippingCharges.toFixed(2)),
      markup: 0, finalPrice,
    },
  }

  return {
    basePrintingCost: Number(basePrintingCost.toFixed(2)),
    blankProductCost: Number(blankProductCost.toFixed(2)),
    printingGSTAmount: Number(printingGSTAmount.toFixed(2)),
    productGSTAmount:  Number(productGSTAmount.toFixed(2)),
    setupFee, technologyFee,
    shippingCharges: Number(shippingCharges.toFixed(2)),
    finalPrice, suggestedSellingPrice,
    breakdown,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: Mockup generation
// Calls renderMockupDirectly() — same function Canvas.tsx uses for store import
// ─────────────────────────────────────────────────────────────────────────────

export interface JuniMockupOptions {
  blankData:         any
  technologyId:      string
  selectedColorHex:  string
  designBase64:      string
  area:              string
  position:          string
  targetResolution?: number
}

export interface JuniMockupResult {
  base64:   string
  pricing:  JuniPricingResult
  element:  DesignElement
}

export async function generateJuniMockup(opts: JuniMockupOptions): Promise<JuniMockupResult> {
  const { blankData, technologyId, selectedColorHex, designBase64, area, targetResolution = 1000 } = opts

  // Find technology
  const tech = blankData?.printT?.find((t: any) =>
    t.id === technologyId || t.technologyName === technologyId
  ) ?? blankData?.printT?.[0]
  if (!tech) throw new Error(`Technology "${technologyId}" not found`)

  // Find custArea and build canvas/printable configs
  const custArea    = getCustArea(tech, area)
  if (!custArea) throw new Error(`Area "${area}" not found in custAreas`)

  const canvasConfig  = buildCanvasConfig(custArea)
  const printableArea = buildPrintableArea(custArea, canvasConfig)

  // Find the right mockup photo for this area + color
  const mockupPhoto = findMockupPhoto(tech.mockupPhotos ?? [], area, selectedColorHex)
  if (!mockupPhoto?.photo?.url && typeof mockupPhoto?.photo !== 'object') {
    throw new Error(`No mockup photo URL for area "${area}". Ensure blank fetched with depth=2.`)
  }

  // Build design element using same logic as useDesignElements.addImageToCanvas
  const designElement = await buildDesignElementFromBase64(designBase64, printableArea)

  // Build all configs for renderMockupDirectly (it iterates ALL areas in mockup.area[])
  const { canvasConfigs, printableAreas } = getAllConfigs(tech)

  // Place element in the correct area
  const areaKey = area.toLowerCase().trim()
  const designElements: Record<string, DesignElement[]> = { [areaKey]: [designElement] }

  // Call renderMockupDirectly — same as Canvas.tsx store import
  const base64 = await renderMockupDirectly(
    mockupPhoto, designElements, canvasConfigs, printableAreas, selectedColorHex, targetResolution
  )

  // Calculate exact pricing using same formula as usePricing.calculateTotalPricing
  const pricing = calculateJuniPricing(blankData, tech, designElement, area, selectedColorHex)

  return { base64, pricing, element: designElement }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: Generate all color variants (for MockupSlider)
// ─────────────────────────────────────────────────────────────────────────────

export async function generateJuniMockupsAllColors(opts: {
  blankData:         any
  technologyId:      string
  selectedColors:    Array<{ name: string; hex: string }>
  designBase64:      string
  area:              string
  position:          string
  targetResolution?: number
  onProgress?:       (done: number, total: number, colorName: string) => void
}): Promise<Array<{ colorName: string; colorHex: string; base64: string; pricing: JuniPricingResult }>> {
  const results: Array<{ colorName: string; colorHex: string; base64: string; pricing: JuniPricingResult }> = []

  for (let i = 0; i < opts.selectedColors.length; i++) {
    const color = opts.selectedColors[i]
    opts.onProgress?.(i, opts.selectedColors.length, color.name)

    try {
      const result = await generateJuniMockup({
        blankData:        opts.blankData,
        technologyId:     opts.technologyId,
        selectedColorHex: color.hex,
        designBase64:     opts.designBase64,
        area:             opts.area,
        position:         opts.position,
        targetResolution: opts.targetResolution ?? 1000,
      })
      results.push({ colorName: color.name, colorHex: color.hex, base64: result.base64, pricing: result.pricing })
    } catch (err: any) {
      console.error(`[JuniMockupBridge] Failed for ${color.name}:`, err.message)
    }
  }

  opts.onProgress?.(opts.selectedColors.length, opts.selectedColors.length, 'done')
  return results
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7: Generate mockups for multiple areas with per-area designs
// Used when creator uploads different designs for front/back/sleeves
// ─────────────────────────────────────────────────────────────────────────────

export interface AreaDesignMap {
  [area: string]: { sessionId: string; base64: string; filename: string }
}

export async function generateJuniMockupsAllAreasAllColors(opts: {
  blankData:         any
  technologyId:      string
  selectedColors:    Array<{ name: string; hex: string }>
  designsByArea:     AreaDesignMap   // area → design data
  defaultDesignBase64: string        // fallback if area not in map
  targetResolution?: number
  onProgress?:       (done: number, total: number, label: string) => void
}): Promise<Array<{ colorName: string; colorHex: string; area: string; base64: string; pricing?: JuniPricingResult }>> {
  const results: Array<{ colorName: string; colorHex: string; area: string; base64: string; pricing?: JuniPricingResult }> = []
  const areas   = Object.keys(opts.designsByArea)
  const total   = areas.length * opts.selectedColors.length
  let   done    = 0

  for (const area of areas) {
    const areaDesign = opts.designsByArea[area]?.base64 ?? opts.defaultDesignBase64
    for (const color of opts.selectedColors) {
      opts.onProgress?.(done, total, `${color.name} / ${area}`)
      try {
        const result = await generateJuniMockup({
          blankData:        opts.blankData,
          technologyId:     opts.technologyId,
          selectedColorHex: color.hex,
          designBase64:     areaDesign,
          area,
          position:         "center",
          targetResolution: opts.targetResolution ?? 1000,
        })
        results.push({ colorName: color.name, colorHex: color.hex, area, base64: result.base64, pricing: result.pricing })
      } catch (err: any) {
        console.error(`[JuniMockupBridge] Failed for ${color.name}/${area}:`, err.message)
      }
      done++
    }
  }

  opts.onProgress?.(total, total, 'done')
  return results
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: Canvas layout screenshot for manufacturer
// Calls captureCanvasImageForArea from canvas-export-utils.ts
// Generates the same side-by-side "For Manufacturer / Internal Reference" PNG
// that the Canvas designer creates when exporting artwork.
// ─────────────────────────────────────────────────────────────────────────────

export async function generateJuniCanvasLayout(opts: {
  blankData:        any
  technologyId:     string
  selectedColorHex: string
  designBase64:     string
  area:             string
}): Promise<string | null> {
  const { blankData, technologyId, selectedColorHex, designBase64, area } = opts

  const tech = blankData?.printT?.find((t: any) =>
    t.id === technologyId || t.technologyName === technologyId
  ) ?? blankData?.printT?.[0]
  if (!tech) return null

  const custArea    = getCustArea(tech, area)
  if (!custArea) return null

  const canvasConfig  = buildCanvasConfig(custArea)
  const printableArea = buildPrintableArea(custArea, canvasConfig)

  // Build designElements the same way generateJuniMockup does
  const designElement = await buildDesignElementFromBase64(designBase64, printableArea)
  const areaKey       = area.toLowerCase().trim()
  const designElements: Record<string, DesignElement[]> = { [areaKey]: [designElement] }

  // captureCanvasImageForArea needs canvasImages — for JUNI chat we load the mockup photo
  // as the background canvas image (same role as the loaded mockup in Canvas.tsx)
  const mockupPhoto = findMockupPhoto(tech.mockupPhotos ?? [], area, selectedColorHex)
  let canvasImages: Record<string, HTMLImageElement | null> = {}

  if (mockupPhoto?.photo?.url) {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image()
        i.crossOrigin = 'anonymous'
        i.onload  = () => resolve(i)
        i.onerror = () => reject(new Error('Failed to load mockup for canvas layout'))
        // Resolve URL relative to blankscms/PayloadCMS
        const base = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_PAYLOAD_URL : null)
          ?? 'http://localhost:3000'
        i.src = mockupPhoto.photo.url.startsWith('http') ? mockupPhoto.photo.url : `${base}${mockupPhoto.photo.url}`
      })
      canvasImages[areaKey]                              = img
      canvasImages[`${areaKey}_${selectedColorHex}`]    = img
    } catch { /* canvas layout works without background image */ }
  }

  // Generate the side-by-side canvas layout using pure Canvas 2D API
  // (no Konva dependency — works reliably in the JUNI chat browser context)
  try {
    // Left panel: clean mockup (design on garment, no annotations)
    const { canvasConfigs, printableAreas } = getAllConfigs(tech)
    const mockupPhoto = findMockupPhoto(tech.mockupPhotos ?? [], area, selectedColorHex)
    if (!mockupPhoto) return null

    const cleanBase64 = await renderMockupDirectly(
      mockupPhoto, designElements, canvasConfigs, printableAreas, selectedColorHex, canvasConfig.width
    )
    if (!cleanBase64) return null

    // Load the clean panel image
    const loadImg = (src: string): Promise<HTMLImageElement> =>
      new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src })

    const cleanImg = await loadImg(cleanBase64)

    // Build side-by-side composite using Canvas 2D
    const panelW  = cleanImg.width
    const panelH  = cleanImg.height
    const DIVIDER = 2
    const GAP     = 24
    const HEADER  = 36
    const TOTAL_W = panelW * 2 + GAP * 2 + DIVIDER
    const TOTAL_H = panelH + HEADER

    const offscreen = document.createElement('canvas')
    offscreen.width  = TOTAL_W
    offscreen.height = TOTAL_H
    const ctx = offscreen.getContext('2d')!

    // Dark header bar
    ctx.fillStyle = '#222222'
    ctx.fillRect(0, 0, TOTAL_W, HEADER)
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${Math.round(HEADER * 0.45)}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('For Manufacturer (Clean)', panelW / 2, HEADER / 2)
    ctx.fillText('Internal Reference (With Dimensions)', panelW + GAP * 2 + DIVIDER + panelW / 2, HEADER / 2)

    // Divider
    ctx.fillStyle = '#888888'
    ctx.fillRect(panelW + GAP, 0, DIVIDER, TOTAL_H)

    // Left: clean panel
    ctx.fillStyle = '#f8f8f8'
    ctx.fillRect(0, HEADER, panelW, panelH)
    ctx.drawImage(cleanImg, 0, HEADER, panelW, panelH)

    // Left: dashed orange print area box
    const pa = printableArea
    const scale = panelW / canvasConfig.width
    ctx.strokeStyle = '#e65100'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.strokeRect(pa.x * scale, HEADER + pa.y * scale, pa.width * scale, pa.height * scale)
    ctx.setLineDash([])

    // Right: annotated panel (same image + dimension badge)
    ctx.fillStyle = '#f8f8f8'
    ctx.fillRect(panelW + GAP * 2 + DIVIDER, HEADER, panelW, panelH)
    ctx.drawImage(cleanImg, panelW + GAP * 2 + DIVIDER, HEADER, panelW, panelH)

    // Right: red dashed print area box
    const rx = panelW + GAP * 2 + DIVIDER
    ctx.strokeStyle = '#FF0000'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.strokeRect(rx + pa.x * scale, HEADER + pa.y * scale, pa.width * scale, pa.height * scale)
    ctx.setLineDash([])

    // Dimension badge
    const avgPPI = ((pa.width / canvasConfig.realWorldWidth) + (pa.height / canvasConfig.realWorldHeight)) / 2
    const wIn    = (pa.width  / avgPPI).toFixed(2)
    const hIn    = (pa.height / avgPPI).toFixed(2)
    const label  = `${wIn}" × ${hIn}"`
    const badgeW = label.length * 7 + 14
    const bx     = rx + pa.x * scale
    const by     = HEADER + pa.y * scale + 4
    ctx.fillStyle = '#e65100'
    ctx.beginPath()
    ctx.roundRect?.(bx, by, badgeW, 22, 3) ?? ctx.rect(bx, by, badgeW, 22)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px Arial'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, bx + 7, by + 11)

    const layoutBase64 = offscreen.toDataURL('image/png', 1.0)
    console.log(`[JuniMockupBridge] Canvas layout generated: ${layoutBase64.length} chars for area="${area}"`)
    return layoutBase64

  } catch (err: any) {
    console.error('[JuniMockupBridge] Canvas layout generation failed:', err.message)
    return null
  }
}