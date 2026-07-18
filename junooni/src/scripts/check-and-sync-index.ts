// src/scripts/check-and-sync-index.ts
// Run: npx medusa exec src/scripts/check-and-sync-index.ts

import pg from "pg"

export default async function checkAndSyncIndex({ container }: { container: any }) {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not found")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  try {
    // ── 1. Check if index_data table exists ───────────────────────────────
    console.log("\n📦 CHECKING INDEX TABLES:")
    const indexTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name LIKE '%index%'
      ORDER BY table_name
    `)
    if (indexTables.rows.length === 0) {
      console.log("  ✗ No index tables found — index module migrations may not have run")
    } else {
      indexTables.rows.forEach(r => console.log("  ✓", r.table_name))
    }

    // ── 2. Check what's currently in the index ────────────────────────────
    console.log("\n🔍 INDEX_DATA TABLE CONTENTS:")
    try {
      const indexCount = await client.query(`
        SELECT 
          name,
          COUNT(*) as count,
          MAX(updated_at) as last_updated
        FROM index_data
        GROUP BY name
        ORDER BY count DESC
      `)
      if (indexCount.rows.length === 0) {
        console.log("  ✗ index_data table is EMPTY — nothing has been indexed yet")
      } else {
        indexCount.rows.forEach(r =>
          console.log(`  → entity=${r.name} | count=${r.count} | last_updated=${r.last_updated}`)
        )
      }
    } catch (e: any) {
      console.log("  ✗ Could not query index_data:", e.message)
    }

    // ── 3. Check for vendor entity in index ───────────────────────────────
    console.log("\n🏪 VENDOR IN INDEX:")
    try {
      const vendorIndex = await client.query(`
        SELECT id, name, data
        FROM index_data
        WHERE name ILIKE '%vendor%'
        LIMIT 5
      `)
      if (vendorIndex.rows.length === 0) {
        console.log("  ✗ No vendor data in index — vendor entity NOT ingested yet")
      } else {
        console.log(`  ✓ Found ${vendorIndex.rows.length} vendor records in index`)
        vendorIndex.rows.forEach(r => console.log("  →", r.id, r.name))
      }
    } catch (e: any) {
      console.log("  ✗", e.message)
    }

    // ── 4. Check index sync status table ─────────────────────────────────
    console.log("\n🔄 INDEX SYNC STATUS:")
    try {
      const syncStatus = await client.query(`
        SELECT entity, status, COUNT(*) as count
        FROM index_sync
        GROUP BY entity, status
        ORDER BY entity
      `)
      if (syncStatus.rows.length === 0) {
        console.log("  ✗ index_sync table is empty")
      } else {
        syncStatus.rows.forEach(r =>
          console.log(`  → entity=${r.entity} | status=${r.status} | count=${r.count}`)
        )
      }
    } catch (e: any) {
      console.log("  ✗ Could not query index_sync:", e.message)
    }

    // ── 5. Check link table for vendor-product ────────────────────────────
    console.log("\n🔗 VENDOR-PRODUCT LINK TABLE:")
    try {
      const linkCount = await client.query(`
        SELECT COUNT(*) as total
        FROM marketplacemodule_vendor_product_product
        WHERE deleted_at IS NULL
      `)
      console.log(`  → Total active vendor-product links: ${linkCount.rows[0].total}`)

      const sample = await client.query(`
        SELECT vendor_id, product_id
        FROM marketplacemodule_vendor_product_product
        WHERE deleted_at IS NULL
        LIMIT 3
      `)
      sample.rows.forEach(r => console.log(`  → vendor_id=${r.vendor_id} product_id=${r.product_id}`))
    } catch (e: any) {
      console.log("  ✗", e.message)
    }

    // ── 6. Now trigger reindex via the container ──────────────────────────
    console.log("\n🚀 TRIGGERING REINDEX VIA INDEX MODULE:")
    try {
      const indexService = container.resolve("indexService", { allowUnregistered: true })
      if (!indexService) {
        console.log("  ✗ indexService not found in container — @medusajs/index may not be registered")
      } else {
        console.log("  ✓ indexService found:", Object.keys(indexService).join(", "))

        if (typeof indexService.sync === "function") {
          console.log("  → Calling indexService.sync()...")
          await indexService.sync()
          console.log("  ✓ Sync triggered successfully")
        } else if (typeof indexService.reindex === "function") {
          console.log("  → Calling indexService.reindex()...")
          await indexService.reindex()
          console.log("  ✓ Reindex triggered successfully")
        } else {
          console.log("  ✗ No sync/reindex method found. Available methods:", Object.keys(indexService))
        }
      }
    } catch (e: any) {
      console.log("  ✗ Error triggering reindex:", e.message)
    }

  } finally {
    await client.end()
    console.log("\n✅ Done\n")
  }
}