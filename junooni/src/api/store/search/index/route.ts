import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { typesenseService } from "../../../../../lib/typesense"

const PRODUCTION_REGION_ID = 'reg_01K4890NFNFQ6MQ9YPKBT2P001'
const BATCH_SIZE = 20  // ✅ Reduced from 50 — each product is heavy with images/variants

// ─── Job state (poll via GET) ────────────────────────────────────────────────
const reindexJobState: {
  running: boolean
  startedAt: string | null
  finishedAt: string | null
  success: boolean | null
  message: string
  stats: any
} = {
  running: false,
  startedAt: null,
  finishedAt: null,
  success: null,
  message: 'No job run yet',
  stats: null
}

// ─── Trimmed fields — only what typesense.ts actually reads ──────────────────
// ✅ REMOVED: variants.calculated_price, variants.prices.* — these trigger
//    Medusa's pricing engine per-variant and are the main cause of OOM.
//    extractPriceData() falls back to prices[0].amount which we keep below.
// ✅ REMOVED: variants.weight/length/height/width/hs_code/origin_country/mid_code/material
//    — stored in variants_data but never used in Typesense schema fields
// ✅ REMOVED: images.product_id/created_at/updated_at/deleted_at — not needed
// ✅ REMOVED: options timestamps — not needed
// ✅ REMOVED: vendor.logo/creator_bio/creator_title/verified/city/state — not in schema
const PRODUCT_FIELDS = [
  "id", "title", "description", "handle", "status",
  "thumbnail", "created_at", "updated_at", "metadata",

  // Vendor — only what schema uses
  "vendor.id", "vendor.name", "vendor.handle",
  "vendor.creator_category",

  // Variants — NO calculated_price, NO prices.* (saves massive memory)
  // Keep prices.amount + prices.currency_code only for extractPriceData fallback
  "variants.id", "variants.title", "variants.sku",
  "variants.allow_backorder", "variants.manage_inventory",
  "variants.inventory_quantity", "variants.variant_rank",
  "variants.metadata",
  "variants.prices.amount", "variants.prices.currency_code",
  "variants.options.id", "variants.options.value", "variants.options.metadata",
  "variants.options.option_id",
  "variants.options.option.id", "variants.options.option.title",
  "variants.options.option.metadata", "variants.options.option.product_id",

  // Collection
  "collection.id", "collection.title", "collection.handle",

  // Categories + tags
  "categories.id", "categories.name", "categories.handle",
  "tags.id", "tags.value",

  // Images — only what extractImageData uses
  "images.id", "images.url", "images.metadata", "images.rank",

  // Options
  "options.id", "options.title", "options.metadata", "options.product_id",
  "options.values.id", "options.values.value", "options.values.metadata",
  "options.values.option_id",
]

// ─── Collection schema ────────────────────────────────────────────────────────
const COLLECTION_SCHEMA = {
  name: 'products',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'description', type: 'string', optional: true },
    { name: 'handle', type: 'string' },
    { name: 'status', type: 'string', facet: true },
    { name: 'thumbnail', type: 'string', optional: true },
    { name: 'first_image_url', type: 'string', optional: true },
    { name: 'created_at', type: 'int64' },
    { name: 'updated_at', type: 'int64' },
    { name: 'collection_title', type: 'string', facet: true, optional: true },
    { name: 'collection_handle', type: 'string', optional: true },
    { name: 'collection_id', type: 'string', optional: true },
    { name: 'vendor_id', type: 'string', optional: true, facet: true },
    { name: 'vendor_name', type: 'string', optional: true, facet: true },
    { name: 'vendor_handle', type: 'string', optional: true },
    { name: 'min_price_amount', type: 'int64', optional: true },
    { name: 'max_price_amount', type: 'int64', optional: true },
    { name: 'currency_code', type: 'string', optional: true, facet: true },
    { name: 'variant_count', type: 'int32', optional: true },
    { name: 'variant_titles', type: 'string', optional: true },
    { name: 'has_variants', type: 'bool', optional: true },
    { name: 'color_names', type: 'string', optional: true, facet: true },
    { name: 'color_hex_values', type: 'string', optional: true },
    { name: 'tags', type: 'string', facet: true, optional: true },
    { name: 'categories', type: 'string', facet: true, optional: true },
    { name: 'all_images', type: 'string', optional: true },
    { name: 'option_images', type: 'string', optional: true },
    { name: 'variant_images', type: 'string', optional: true },
    { name: 'variant_specific_image_option', type: 'string', optional: true },
    { name: 'fulfillment_type', type: 'string', optional: true },
    { name: 'variants_data', type: 'string', optional: true },
    { name: 'options_data', type: 'string', optional: true },
    { name: 'search_text', type: 'string', optional: true },
  ],
  default_sorting_field: 'created_at',
  token_separators: ['-', '_', '.', '/', '\\'],
  symbols_to_index: ['#', '+', '&', '@'],
}

// ─── Background reindex logic ─────────────────────────────────────────────────
async function runReindex(query: any, regionId?: string) {
  reindexJobState.running = true
  reindexJobState.startedAt = new Date().toISOString()
  reindexJobState.finishedAt = null
  reindexJobState.success = null
  reindexJobState.message = 'Running...'
  reindexJobState.stats = null

  try {
    console.log('🔄 [REINDEX] Background reindex started...')

    // STEP 1: Delete old collection + fetch region IN PARALLEL
    console.log('🗑️ [REINDEX] STEP 1: Deleting old collection + fetching region in parallel...')
    const [regionsResult] = await Promise.all([
      query.graph({
        entity: "region",
        fields: ["id", "name", "currency_code"],
        filters: regionId ? { id: regionId } : undefined,
        options: { take: 1 }
      }),
      typesenseService.client.collections('products').delete()
        .then(() => console.log('✅ [REINDEX] Old collection deleted'))
        .catch(() => console.log('ℹ️ [REINDEX] No existing collection to delete'))
    ])

    const regionData = regionsResult.data?.[0] || { id: PRODUCTION_REGION_ID, currency_code: 'INR', name: 'India' }
    const regionToUse = regionId || regionData.id
    console.log(`✅ [REINDEX] Region: ${regionToUse} (${regionData.currency_code})`)

    // Buffer to ensure Typesense deletion is fully propagated
    await new Promise(resolve => setTimeout(resolve, 500))

    // STEP 2: Create schema — sequential, before any indexing
    console.log('🏗️ [REINDEX] STEP 2: Creating collection schema...')
    await typesenseService.client.collections().create(COLLECTION_SCHEMA)
    console.log('✅ [REINDEX] New schema created')

    // STEP 3: Fetch + index in batches
    console.log(`🔄 [REINDEX] STEP 3: Batched fetch + index (batch size: ${BATCH_SIZE})...`)

    let totalIndexed = 0
    let offset = 0
    let hasMore = true
    let batchNum = 0

    while (hasMore) {
      batchNum++
      console.log(`📦 [REINDEX] Batch #${batchNum} — offset=${offset}, size=${BATCH_SIZE}...`)

      const result = await query.graph({
        entity: "product",
        fields: PRODUCT_FIELDS,
        filters: { status: 'published' },
        options: {
          region_id: regionToUse,
          take: BATCH_SIZE,
          skip: offset,
        }
      })

      const batch = result.data ?? []

      if (batch.length === 0) {
        console.log(`📭 [REINDEX] Batch #${batchNum} empty — done fetching`)
        break
      }

      // Index immediately — don't accumulate
      await typesenseService.indexProducts(batch, regionData)
      totalIndexed += batch.length

      console.log(`✅ [REINDEX] Batch #${batchNum} indexed — ${batch.length} products (${totalIndexed} total so far)`)

      offset += BATCH_SIZE
      hasMore = batch.length === BATCH_SIZE

      // Give Node.js GC breathing room between batches
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    if (totalIndexed === 0) {
      reindexJobState.success = true
      reindexJobState.message = 'Schema created but no published products found'
      reindexJobState.finishedAt = new Date().toISOString()
      reindexJobState.running = false
      return
    }

    // STEP 4: Verify final count
    const finalStats = await typesenseService.client.collections('products').retrieve()
    const elapsed = Date.now() - new Date(reindexJobState.startedAt!).getTime()

    console.log(`✅ [REINDEX] Complete! ${finalStats.num_documents} docs indexed in ${(elapsed / 1000).toFixed(1)}s across ${batchNum} batches`)

    reindexJobState.success = true
    reindexJobState.message = `Successfully indexed ${finalStats.num_documents} products`
    reindexJobState.stats = {
      total_documents: finalStats.num_documents,
      total_fields: finalStats.fields?.length ?? 0,
      batches_processed: batchNum,
      products_sent: totalIndexed,
      region_used: regionToUse,
      currency: regionData.currency_code,
      elapsed_seconds: parseFloat((elapsed / 1000).toFixed(1)),
    }

  } catch (error: any) {
    console.error('❌ [REINDEX] Background reindex failed:', error)
    reindexJobState.success = false
    reindexJobState.message = `Failed: ${error.message}`
  } finally {
    reindexJobState.running = false
    reindexJobState.finishedAt = new Date().toISOString()
  }
}

// ─── POST /admin/products/force-reset ────────────────────────────────────────
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    const databaseUrl = process.env.DATABASE_URL || ''

    if (databaseUrl.includes('127.0.0.1')) {
      return res.status(400).json({
        success: false,
        error: 'Safety check failed: Connected to 127.0.0.1 database',
        advice: 'Make sure DATABASE_URL points to your production database'
      })
    }

    const { confirm_reset, region_id, dry_run = false } = req.body
    const query = req.scope.resolve("query")

    // ── DRY RUN ──────────────────────────────────────────────────────────────
    if (dry_run) {
      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "title", "status", "metadata", "variants.id", "images.id", "vendor.name"],
        filters: { status: 'published' },
      })

      return res.json({
        dry_run: true,
        success: true,
        would_index: products.length,
        batch_size: BATCH_SIZE,
        estimated_batches: Math.ceil(products.length / BATCH_SIZE),
        sample: products.slice(0, 5).map((p: any) => ({
          id: p.id,
          title: p.title,
          has_vendor: !!p.vendor?.name,
          has_images: !!(p.images?.length),
          variant_count: p.variants?.length || 0,
        }))
      })
    }

    // ── STATUS CHECK ──────────────────────────────────────────────────────────
    if (!confirm_reset) {
      return res.json({
        message: 'Reindex utility — send {"confirm_reset": true} to start',
        current_job: reindexJobState,
        usage: {
          start: 'POST {"confirm_reset": true}',
          with_region: 'POST {"confirm_reset": true, "region_id": "reg_xxx"}',
          dry_run: 'POST {"dry_run": true}',
          check_status: 'GET this endpoint'
        }
      })
    }

    // ── PREVENT DOUBLE RUN ────────────────────────────────────────────────────
    if (reindexJobState.running) {
      return res.status(409).json({
        success: false,
        error: 'Reindex already in progress',
        started_at: reindexJobState.startedAt,
        message: 'Check GET /admin/products/force-reset for status'
      })
    }

    // ── FIRE AND FORGET ───────────────────────────────────────────────────────
    setImmediate(() => runReindex(query, region_id))

    return res.json({
      success: true,
      message: `🚀 Reindex started in background (batches of ${BATCH_SIZE})`,
      check_status: 'GET /admin/products/force-reset',
      monitor_logs: 'docker logs junooni-admin -f | grep REINDEX'
    })

  } catch (error: any) {
    console.error('❌ [REINDEX] Route error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ─── GET /admin/products/force-reset — poll job status ───────────────────────
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    let collectionInfo: any = { exists: false }
    try {
      const col = await typesenseService.client.collections('products').retrieve()
      collectionInfo = {
        exists: true,
        total_documents: col.num_documents,
        total_fields: col.fields?.length ?? 0,
      }
    } catch {
      // collection doesn't exist yet
    }

    res.json({
      job: reindexJobState,
      collection: collectionInfo,
      config: {
        batch_size: BATCH_SIZE,
      },
      environment: {
        database: process.env.DATABASE_URL?.split('@')[1],
        typesense_host: process.env.TYPESENSE_HOST,
        node_env: process.env.NODE_ENV,
      }
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}