// ─── pricing-engine.ts ────────────────────────────────────────────────────────
// Server-side port of usePricing.ts calculateTotalPricing().
// Uses the SAME formula as Canvas.tsx — reads the same PayloadCMS fields:
//   custArea['Minimum printing price']
//   custArea['Per sq inch printing price']
//   blank.additionalCosts.setupFee
//   blank.additionalCosts.printingGST
//   blank['GST Cost']
//   blank.shippingInfo.shippingCharges
//
// Key difference vs usePricing.ts:
//   usePricing.ts knows exact element positions (design was placed in Canvas).
//   Here we don't have element positions — so we use the FULL print area
//   as the "consumed area" (worst case / maximum cost). This is conservative
//   and matches what Fourthwall shows: "starting from ₹X" before design placement.
//
// Place at: junooni/src/lib/ai/pricing-engine.ts

import axios from "axios"

const PAYLOAD_API    = process.env.PAYLOAD_BASE_URL ?? "http://localhost:3000"
const PAYLOAD_SECRET = process.env.PAYLOAD_API_SECRET ?? ""

// ─── Types (matches usePricing.ts output shape) ───────────────────────────────

export interface AreaCostBreakdown {
  areaName:             string
  minimumPrice:         number
  pricePerSquareInch:   number
  isFixedPrice:         boolean
  printableWidthInch:   number
  printableHeightInch:  number
  fullAreaSquareInches: number
  // Cost assuming full print area is used
  estimatedPrintCost:   number
}

export interface RealPriceBreakdown {
  blank_id:              string
  technology_id:         string
  blank_name:            string
  // Production costs
  blank_product_cost:    number          // PayloadCMS doc.cost
  printing_cost:         number          // sum of all area printing costs
  setup_fee:             number          // additionalCosts.setupFee
  technology_fee:        number          // additionalCosts.rushSurcharge
  // GST
  printing_gst_percent:  number
  printing_gst_amount:   number
  product_gst_percent:   number
  product_gst_amount:    number
  // Shipping
  shipping_charges:      number
  // Totals
  total_cost_price:      number          // everything above added up — your true cost
  // Pricing guidance
  recommended_sell_price: number         // 2.2× total_cost_price rounded to nearest ₹10
  minimum_sell_price:     number         // 1.5× total_cost_price
  premium_sell_price:     number         // 2.8× total_cost_price
  // Profit at recommended price
  profit_at_recommended:  number
  margin_at_recommended:  number         // percent
  // Per-area breakdown
  areas:                 AreaCostBreakdown[]
  // Human-readable note
  note:                  string
}

// ─── Main function ────────────────────────────────────────────────────────────

export async function calculateRealCostPrice(
  blankId:      string,
  technologyId: string,
  areas:        string[]                 // e.g. ['front'] or ['front', 'back']
): Promise<RealPriceBreakdown> {

  // 1. Fetch blank from PayloadCMS (same depth=2 as Canvas.tsx uses)
  const { data: doc } = await axios.get(`${PAYLOAD_API}/api/products/${blankId}`, {
    headers: PAYLOAD_SECRET ? { Authorization: `Bearer ${PAYLOAD_SECRET}` } : {},
    params: { depth: 2 },
  })

  // 2. Find the technology
  const tech = doc.printT?.find(
    (t: any) => t.id === technologyId || t.technologyName === technologyId
  ) ?? doc.printT?.[0]

  if (!tech) throw new Error(`Technology ${technologyId} not found in blank ${blankId}`)

  // 3. Blank product cost
  const blankCost = parseFloat(doc.cost ?? "0")

  // 4. Additional costs (same fields usePricing.ts reads)
  const additionalCosts  = doc.additionalCosts ?? {}
  const setupFee         = parseFloat(additionalCosts.setupFee      ?? "0")
  const technologyFee    = parseFloat(additionalCosts.rushSurcharge  ?? "0")
  const printingGSTPct   = parseFloat(additionalCosts.printingGST   ?? "0")
  const productGSTPct    = parseFloat(doc["GST Cost"]               ?? "0")
  const shippingCharges  = parseFloat(doc.shippingInfo?.shippingCharges ?? "0")

  // 5. Per-area printing cost (exact same logic as getPricingInfoForArea + calculateAreaPricing)
  const areaBreakdowns: AreaCostBreakdown[] = []
  let totalPrintingCost = 0

  const targetAreas = areas.length > 0 ? areas : ["front"]

  for (const areaName of targetAreas) {
    const custArea = tech.custAreas?.find(
      (a: any) => a.areaName?.toLowerCase() === areaName.toLowerCase()
    ) ?? tech.custAreas?.[0]

    if (!custArea) continue

    // Canvas dimensions and real-world size (same as getCanvasConfig)
    const canvasDim    = custArea.canvasDim ?? {}
    const canvasPixW   = parseFloat(canvasDim.canvasPixWid    ?? "800")
    const canvasPixH   = parseFloat(canvasDim.canvasPixHeight ?? "800")
    const realWorldW   = parseFloat(canvasDim.widthInch       ?? "8")
    const realWorldH   = parseFloat(canvasDim.heightInch      ?? "12")

    // Printable area coordinates (same as getPrintableAreaFromPhoto)
    const designPhoto   = custArea.designCanvasPhotos?.[0]
    const rawCoord      = designPhoto?.printAreaCoord ?? { x: 0, y: 0, width: 1, height: 1 }
    const isNorm        = rawCoord.x <= 1 && rawCoord.y <= 1
    const printW        = (isNorm ? rawCoord.width  : rawCoord.width  / canvasPixW) * realWorldW
    const printH        = (isNorm ? rawCoord.height : rawCoord.height / canvasPixH) * realWorldH
    const fullAreaSqIn  = Number((printW * printH).toFixed(3))

    // Pricing model (same as getPricingInfoForArea in usePricing.ts)
    const minPriceStr   = custArea["Minimum printing price"]
    const perSqInStr    = custArea["Per sq inch printing price"]
    const minimumPrice  = parseFloat(minPriceStr  ?? "0")
    const perSqIn       = parseFloat(perSqInStr   ?? "0")
    const isFixedPrice  = !!(minPriceStr && !perSqInStr)

    // Cost assuming full print area consumed (conservative estimate)
    // This mirrors calculateAreaPricing(areaId) when the design fills the entire area
    let estimatedPrintCost: number
    if (isFixedPrice || (minimumPrice > 0 && perSqIn === 0)) {
      estimatedPrintCost = minimumPrice
    } else if (perSqIn > 0) {
      estimatedPrintCost = Math.max(minimumPrice, fullAreaSqIn * perSqIn)
    } else {
      estimatedPrintCost = 0
    }

    totalPrintingCost += estimatedPrintCost

    areaBreakdowns.push({
      areaName:             areaName.charAt(0).toUpperCase() + areaName.slice(1),
      minimumPrice,
      pricePerSquareInch:   perSqIn,
      isFixedPrice,
      printableWidthInch:   Number(printW.toFixed(2)),
      printableHeightInch:  Number(printH.toFixed(2)),
      fullAreaSquareInches: fullAreaSqIn,
      estimatedPrintCost:   Number(estimatedPrintCost.toFixed(2)),
    })
  }

  // 6. GST amounts (same formula as calculateTotalPricing in usePricing.ts)
  const printingGSTAmount = printingGSTPct > 0
    ? Number((totalPrintingCost * printingGSTPct / 100).toFixed(2))
    : 0
  const productGSTAmount  = productGSTPct > 0
    ? Number((blankCost * productGSTPct / 100).toFixed(2))
    : 0

  // 7. Total cost price (your actual cost to produce one unit)
  const totalCostPrice = Number((
    totalPrintingCost +
    printingGSTAmount +
    blankCost         +
    productGSTAmount  +
    setupFee          +
    technologyFee     +
    shippingCharges
  ).toFixed(2))

  // 8. Suggested selling prices (same multipliers as handleSuggestPrice)
  const minimum     = Math.ceil(totalCostPrice * 1.5 / 10) * 10
  const recommended = Math.ceil(totalCostPrice * 2.2 / 10) * 10
  const premium     = Math.ceil(totalCostPrice * 2.8 / 10) * 10
  const profit      = Math.round(recommended - totalCostPrice)
  const margin      = Math.round((profit / recommended) * 100)

  return {
    blank_id:              blankId,
    technology_id:         tech.id,
    blank_name:            doc.name,
    blank_product_cost:    Number(blankCost.toFixed(2)),
    printing_cost:         Number(totalPrintingCost.toFixed(2)),
    setup_fee:             Number(setupFee.toFixed(2)),
    technology_fee:        Number(technologyFee.toFixed(2)),
    printing_gst_percent:  printingGSTPct,
    printing_gst_amount:   printingGSTAmount,
    product_gst_percent:   productGSTPct,
    product_gst_amount:    productGSTAmount,
    shipping_charges:      Number(shippingCharges.toFixed(2)),
    total_cost_price:      totalCostPrice,
    recommended_sell_price: recommended,
    minimum_sell_price:    minimum,
    premium_sell_price:    premium,
    profit_at_recommended: profit,
    margin_at_recommended: margin,
    areas:                 areaBreakdowns,
    note: `Cost calculated assuming full print area used on: ${targetAreas.join(", ")}. Actual cost may be lower if design doesn't fill the full area.`,
  }
}