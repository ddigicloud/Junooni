// src/api/admin/products/imports/route.ts   ← "imports" plural
//
// Overrides /admin/products/imports so the admin UI's Import button
// handles ALL columns including Variant Metadata.*, Variant Thumbnail,
// Variant Image 1-8.

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { parse } from "csv-parse/sync"
import { randomUUID } from "crypto"
import fs from "fs"
import path from "path"

// ── Field maps ────────────────────────────────────────────────────────────────

const PRODUCT_FIELD_MAP: Record<string, string> = {
  "Product Title":          "title",
  "Product Subtitle":       "subtitle",
  "Product Status":         "status",
  "Product Description":    "description",
  "Product Is Giftcard":    "is_giftcard",
  "Product Discountable":   "discountable",
  "Product Thumbnail":      "thumbnail",
  "Product Weight":         "weight",
  "Product Length":         "length",
  "Product Height":         "height",
  "Product Width":          "width",
  "Product Hs Code":        "hs_code",
  "Product Origin Country": "origin_country",
  "Product Material":       "material",
}

const VARIANT_FIELD_MAP: Record<string, string> = {
  "Variant Title":           "title",
  "Variant Sku":             "sku",
  "Variant Barcode":         "barcode",
  "Variant Ean":             "ean",
  "Variant Upc":             "upc",
  "Variant Allow Backorder": "allow_backorder",
  "Variant Manage Inventory":"manage_inventory",
  "Variant Hs Code":         "hs_code",
  "Variant Origin Country":  "origin_country",
  "Variant Material":        "material",
  "Variant Weight":          "weight",
  "Variant Length":          "length",
  "Variant Height":          "height",
  "Variant Width":           "width",
}

const BOOL_FIELDS = new Set(["is_giftcard","discountable","allow_backorder","manage_inventory"])
const NUM_FIELDS  = new Set(["weight","length","height","width"])

function coerce(field: string, raw?: string): any {
  if (!raw?.trim()) return undefined
  const v = raw.trim()
  if (BOOL_FIELDS.has(field)) return v === "true" || v === "TRUE" || v === "1"
  if (NUM_FIELDS.has(field))  { const n = Number(v); return isNaN(n) ? undefined : n }
  return v
}

function priceColumns(headers: string[]) {
  return headers
    .filter(h => /^Variant Price\s+\w+$/i.test(h))
    .map(h => ({
      column:        h,
      currency_code: h.replace(/^Variant Price\s+/i, "").trim().toLowerCase(),
    }))
}

async function readCsvContent(fileKey: string, req: MedusaRequest): Promise<string> {
  // Strategy 1: file module URL
  try {
    const fileSvc = req.scope.resolve(Modules.FILE)
    const { url } = await (fileSvc as any).retrieveFile(fileKey)
    if (url) {
      const resp = await fetch(url)
      if (resp.ok) return await resp.text()
    }
  } catch { /* fall through */ }

  // Strategy 2: static/ dir (local dev default)
  const staticPath = path.join(process.cwd(), "static", fileKey)
  if (fs.existsSync(staticPath)) return fs.readFileSync(staticPath, "utf-8")

  // Strategy 3: uploads/ dir
  const uploadsPath = path.join(process.cwd(), "uploads", fileKey)
  if (fs.existsSync(uploadsPath)) return fs.readFileSync(uploadsPath, "utf-8")

  throw new Error(`Cannot locate file for key: ${fileKey}`)
}

// ── Main handler ──────────────────────────────────────────────────────────────

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body    = req.body as Record<string, string>
    const fileKey = body.file_key || body.fileKey

    if (!fileKey) {
      return res.status(400).json({ error: "Missing file_key in request body." })
    }

    console.log(`[imports] file_key: ${fileKey}`)

    // ── Read & parse CSV ──────────────────────────────────────────────────────
    const csvContent = await readCsvContent(fileKey, req)

    let rows: Record<string, string>[]
    try {
      rows = parse(csvContent, {
        columns: true, skip_empty_lines: true, trim: true, bom: true,
      })
    } catch (e: any) {
      return res.status(400).json({ error: `CSV parse error: ${e.message}` })
    }

    if (!rows.length) return res.status(400).json({ error: "CSV is empty." })

    const headers   = Object.keys(rows[0])
    const priceCols = priceColumns(headers)

    console.log(`[imports] ${rows.length} rows, price cols: ${priceCols.map(p => p.column).join(", ") || "none"}`)

    // ── Group by Product Handle ───────────────────────────────────────────────
    const groups = new Map<string, Record<string, string>[]>()
    for (const row of rows) {
      const h = row["Product Handle"]?.trim()
      if (!h) continue
      if (!groups.has(h)) groups.set(h, [])
      groups.get(h)!.push(row)
    }

    console.log(`[imports] ${groups.size} unique handle(s):`, Array.from(groups.keys()))

    // ── Services ──────────────────────────────────────────────────────────────
    const productSvc = req.scope.resolve(Modules.PRODUCT)
    const pricingSvc = req.scope.resolve(Modules.PRICING)
    const query      = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const results = { updated: 0, created: 0, errors: [] as string[], warnings: [] as string[] }

    // ── Process each product ──────────────────────────────────────────────────
    for (const [handle, productRows] of groups) {
      try {
        const first = productRows[0]

        // ── Product fields ────────────────────────────────────────────────────
        const productData: Record<string, any> = { handle }
        for (const [col, field] of Object.entries(PRODUCT_FIELD_MAP)) {
          const v = coerce(field, first[col])
          if (v !== undefined) productData[field] = v
        }

        // ── Collect option names (for CREATE path) ────────────────────────────
        const optionNamesList: string[] = []
        const optionNamesSet  = new Set<string>()
        for (const row of productRows) {
          for (let i = 1; i <= 3; i++) {
            const n = row[`Variant Option ${i} Name`]?.trim()
            if (n && !optionNamesSet.has(n)) {
              optionNamesSet.add(n)
              optionNamesList.push(n)
            }
          }
        }

        const variantsRaw = productRows.filter(r => r["Variant Sku"]?.trim())

        // ── Fetch existing product (one at a time to avoid MikroORM array bug) ─
        let existing: any = null
        console.log(`[imports] Looking up product with handle="${handle}"`)
        try {
          const found = await productSvc.listProducts(
            { handle },
            { select: ["id", "handle"] }
          )
          existing = found?.[0] ?? null
          console.log(`[imports] listProducts("${handle}") →`, existing ? `id=${existing.id}` : "NOT FOUND")
        } catch (listErr: any) {
          console.error(`[imports] listProducts ERROR for "${handle}":`, listErr.message, listErr.stack)
          throw listErr
        }

        // ── Fetch existing variants (scalar product_id, not array) ────────────
        let existingVariants: any[] = []
        if (existing) {
          console.log(`[imports] Fetching variants for product id=${existing.id}`)
          try {
            // Use query.graph to avoid any MikroORM array-filter bugs
            const { data: variantRows } = await query.graph({
              entity:  "product_variant",
              filters: { product_id: existing.id },
              fields:  ["id", "sku"],
            })
            existingVariants = variantRows as any[]
            console.log(`[imports] Found ${existingVariants.length} existing variant(s):`, existingVariants.map((v: any) => ({ id: v.id, sku: v.sku })))
          } catch (varErr: any) {
            console.error(`[imports] listProductVariants ERROR:`, varErr.message, varErr.stack)
            throw varErr
          }
        }

        const savedVariantsForPricing: Array<{ id: string, sku: string, _prices: any[] }> = []

        if (existing) {
          // ── UPDATE existing product ───────────────────────────────────────
          const variantsToUpdate = variantsRaw.map(row => {
            const v: Record<string, any> = {}

            for (const [col, field] of Object.entries(VARIANT_FIELD_MAP)) {
              const val = coerce(field, row[col])
              if (val !== undefined) v[field] = val
            }

            // ── metadata ──────────────────────────────────────────────────────
            const meta: Record<string, any> = {}
            const cp = row["Variant Metadata.cost_price"]?.trim()
            if (cp) { const n = Number(cp); meta.cost_price = isNaN(n) ? cp : n }
            const ms = row["Variant Metadata.manufacturer_sku"]?.trim()
            if (ms) meta.manufacturer_sku = ms
            // const varImgs: string[] = []
            // for (let i = 1; i <= 8; i++) {
            //   const img = row[`Variant Image ${i}`]?.trim()
            //   if (img) varImgs.push(img)
            // }
            // if (varImgs.length) meta.images = varImgs
            if (Object.keys(meta).length) v.metadata = meta

            // ── thumbnail ─────────────────────────────────────────────────────
            const thumb = row["Variant Thumbnail"]?.trim()
            if (thumb) v.thumbnail = thumb

            // ── rank ──────────────────────────────────────────────────────────
            const rank = row["Variant Variant Rank"]?.trim()
            if (rank) { const n = Number(rank); if (!isNaN(n)) v.variant_rank = n }

            // ── prices (handled later) ────────────────────────────────────────
            const _prices = priceCols
              .map(({ column, currency_code }) => ({ currency_code, amount: Number(row[column]) || 0 }))
              .filter(p => p.amount > 0)

            // ── match existing variant by SKU ─────────────────────────────────
            const match = existingVariants.find((ev: any) => ev.sku === v.sku)
            console.log(`[imports]   SKU="${v.sku}" → match:`, match ? `id=${match.id}` : "NO MATCH (will skip)")

            if (match) {
              savedVariantsForPricing.push({ id: match.id, sku: v.sku, _prices })
              return { id: match.id, ...v }     // ← no options; id drives the update
            }

            results.warnings.push(`[${handle}] Variant SKU "${v.sku}" not found — skipped (add via admin UI)`)
            return null
          }).filter((x): x is Record<string, any> => x !== null)

          // ── Step A: update product-level fields ONLY (no variants) ──────────
          // Passing variants to updateProducts causes Medusa to include the
          // variants array in an internal WHERE clause, triggering MikroORM's
          // "not existing property Product.0" error.
          //const { handle: _h, ...productDataWithoutHandle } = productData
          const { handle: _h, ...productDataWithoutHandle } = productData
          console.log(`[imports] updateProducts payload (product fields only):`, JSON.stringify({ id: existing.id, ...productDataWithoutHandle }, null, 2))

          try {
            await productSvc.updateProducts(existing.id, productDataWithoutHandle)
          } catch (updateErr: any) {
            console.error(`[imports] updateProducts ERROR:`, updateErr.message, updateErr.stack)
            throw updateErr
          }

          // ── Step B: update variants separately ───────────────────────────────
          if (variantsToUpdate.length > 0) {
            console.log(`[imports] updateProductVariants (${variantsToUpdate.length} variants)`)
            try {
              for (const { id, ...vData } of variantsToUpdate) {
                await productSvc.updateProductVariants(id, vData)
              }
            } catch (varUpdateErr: any) {
              console.error(`[imports] updateProductVariants ERROR:`, varUpdateErr.message, varUpdateErr.stack)
              throw varUpdateErr
            }
          }

          results.updated++
          console.log(`[imports] ✅ Updated "${handle}" (${variantsToUpdate.length} variant(s))`)

        } else {
          // ── CREATE new product ────────────────────────────────────────────
          const variantsToCreate = variantsRaw.map(row => {
            const v: Record<string, any> = {}

            for (const [col, field] of Object.entries(VARIANT_FIELD_MAP)) {
              const val = coerce(field, row[col])
              if (val !== undefined) v[field] = val
            }

            const meta: Record<string, any> = {}
            const cp = row["Variant Metadata.cost_price"]?.trim()
            if (cp) { const n = Number(cp); meta.cost_price = isNaN(n) ? cp : n }
            const ms = row["Variant Metadata.manufacturer_sku"]?.trim()
            if (ms) meta.manufacturer_sku = ms
            // const varImgs: string[] = []
            // for (let i = 1; i <= 8; i++) {
            //   const img = row[`Variant Image ${i}`]?.trim()
            //   if (img) varImgs.push(img)
            // }
            // if (varImgs.length) meta.images = varImgs
            if (Object.keys(meta).length) v.metadata = meta

            const thumb = row["Variant Thumbnail"]?.trim()
            if (thumb) v.thumbnail = thumb

            const rank = row["Variant Variant Rank"]?.trim()
            if (rank) { const n = Number(rank); if (!isNaN(n)) v.variant_rank = n }

            v._prices = priceCols
              .map(({ column, currency_code }) => ({ currency_code, amount: Number(row[column]) || 0 }))
              .filter(p => p.amount > 0)

            // ── options: correct format [{ value: "..." }] ────────────────────
            if (optionNamesList.length) {
              v.options = optionNamesList
                .map((name, idx) => {
                  // try column-indexed first, then by matching name column
                  let val = row[`Variant Option ${idx + 1} Value`]?.trim()
                  if (!val) {
                    for (let i = 1; i <= 3; i++) {
                      if (row[`Variant Option ${i} Name`]?.trim() === name) {
                        val = row[`Variant Option ${i} Value`]?.trim()
                        break
                      }
                    }
                  }
                  return { value: val || "" }
                })
                .filter(o => o.value)
            }

            return v
          })

          const productImages: string[] = []
          for (let i = 1; i <= 12; i++) {
            const img = first[`Product Image ${i}`]?.trim()
            if (img) productImages.push(img)
          }

          const createPayload = {
            ...productData,
            ...(productImages.length ? { images: productImages.map(url => ({ url })) } : {}),
            options:  optionNamesList.map(title => ({ title })),
            variants: variantsToCreate.map(({ _prices, ...rest }) => rest),
          }
          console.log(`[imports] createProducts payload:`, JSON.stringify(createPayload, null, 2))

          try {
            const [created] = await productSvc.createProducts([createPayload])

            ;(created as any).variants?.forEach((sv: any) => {
              const csv = variantsToCreate.find(v => v.sku === sv.sku)
              if (csv?._prices?.length) {
                savedVariantsForPricing.push({ id: sv.id, sku: sv.sku, _prices: csv._prices })
              }
            })
          } catch (createErr: any) {
            console.error(`[imports] createProducts ERROR:`, createErr.message, createErr.stack)
            throw createErr
          }

          results.created++
          console.log(`[imports] ✅ Created "${handle}"`)
        }

        // ── Update prices via Pricing module ──────────────────────────────────
        if (priceCols.length && savedVariantsForPricing.length) {
          try {
            const { data: linked } = await query.graph({
              entity:  "product_variant",
              filters: { id: savedVariantsForPricing.map(v => v.id) },
              fields:  ["id", "sku", "price_set.id"],
            })
            for (const lv of linked) {
              const psId = (lv as any).price_set?.id
              if (!psId) continue
              const cv = savedVariantsForPricing.find(v => v.sku === (lv as any).sku)
              if (!cv?._prices?.length) continue
              await pricingSvc.addPrices([{ priceSetId: psId, prices: cv._prices }])
            }
          } catch (pe: any) {
            results.warnings.push(`[${handle}] Prices: ${pe.message}`)
          }
        }

      } catch (err: any) {
        console.error(`[imports] ❌ Error on "${handle}":`, err.message)
        results.errors.push(`[${handle}] ${err.message}`)
      }
    }

    console.log(`[imports] Done — updated:${results.updated} created:${results.created} errors:${results.errors.length}`)
    if (results.errors.length)   console.error("[imports] Errors:", results.errors)
    if (results.warnings.length) console.warn("[imports] Warnings:", results.warnings)

    return res.json({ transaction_id: randomUUID() })

  } catch (err: any) {
    console.error("[imports] Fatal:", err)
    return res.status(500).json({ error: err.message })
  }
}