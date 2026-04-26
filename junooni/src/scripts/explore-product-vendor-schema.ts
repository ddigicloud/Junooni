// src/scripts/explore-product-vendor-schema.ts
// Run: npx medusa exec src/scripts/explore-product-vendor-schema.ts

import pg from "pg"

export default async function exploreProductVendorSchema() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not found")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  try {
    // ── 1. All product-related tables ─────────────────────────────────────
    console.log("\n📦 PRODUCT-RELATED TABLES:")
    const productTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND (table_name LIKE '%product%' OR table_name LIKE '%vendor%')
      ORDER BY table_name
    `)
    productTables.rows.forEach(r => console.log("  →", r.table_name))

    // ── 2. Columns of each product/vendor table ───────────────────────────
    console.log("\n🔍 COLUMNS OF EACH TABLE:")
    for (const { table_name } of productTables.rows) {
      const cols = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table_name])
      console.log(`\n  [${table_name}]`)
      cols.rows.forEach(c => console.log(`    - ${c.column_name} (${c.data_type})`))
    }

    // ── 3. product_sales_channel table specifically ───────────────────────
    console.log("\n🛒 PRODUCT_SALES_CHANNEL SAMPLE (5 rows):")
    try {
      const psc = await client.query(`
        SELECT * FROM product_sales_channel LIMIT 5
      `)
      console.log("  columns:", Object.keys(psc.rows[0] ?? {}))
      psc.rows.forEach(r => console.log("  →", r))
    } catch (e: any) {
      console.log("  ✗ Table not found:", e.message)
    }

    // ── 4. Find how vendors link to products ──────────────────────────────
    console.log("\n🔗 FOREIGN KEYS LINKING VENDORS → PRODUCTS:")
    const fks = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name  AS foreign_table,
        ccu.column_name AS foreign_column
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND (
          tc.table_name   LIKE '%vendor%' OR tc.table_name   LIKE '%product%' OR
          ccu.table_name  LIKE '%vendor%' OR ccu.table_name  LIKE '%product%'
        )
      ORDER BY tc.table_name
    `)
    fks.rows.forEach(r =>
      console.log(`  ${r.table_name}.${r.column_name} → ${r.foreign_table}.${r.foreign_column}`)
    )

    // ── 5. Sample vendor_admin → product path ─────────────────────────────
    console.log("\n👤 VENDOR_ADMIN SAMPLE (2 rows):")
    try {
      const va = await client.query(`SELECT * FROM vendor_admin LIMIT 2`)
      console.log("  columns:", Object.keys(va.rows[0] ?? {}))
      va.rows.forEach(r => console.log("  →", r))
    } catch (e: any) {
      console.log("  ✗", e.message)
    }

    // ── 6. Try to find a direct vendor_product or product_vendor table ─────
    console.log("\n🔎 CHECKING FOR DIRECT VENDOR-PRODUCT JOIN TABLE:")
    for (const name of ["vendor_product", "product_vendor", "vendor_admin_product", "product_vendor_admin"]) {
      try {
        const res = await client.query(`SELECT * FROM ${name} LIMIT 3`)
        console.log(`  ✓ Found [${name}]:`, Object.keys(res.rows[0] ?? {}))
        res.rows.forEach(r => console.log("    →", r))
      } catch {
        console.log(`  ✗ [${name}] does not exist`)
      }
    }

    // ── 7. Sample the sales channel ID we care about ──────────────────────
    console.log("\n📡 SALES CHANNELS:")
    try {
      const sc = await client.query(`SELECT id, name FROM sales_channel LIMIT 10`)
      sc.rows.forEach(r => console.log(`  → ${r.id}  |  ${r.name}`))
    } catch (e: any) {
      console.log("  ✗", e.message)
    }

  } finally {
    await client.end()
    console.log("\n✅ Done\n")
  }
}