// src/scripts/debug-gallery-table.ts
// Run: npx medusa exec src/scripts/debug-gallery-table.ts

import pg from "pg"

export default async function debugGalleryTable() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not found")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  const sep = () => console.log("\n" + "─".repeat(60))

  try {
    console.log("\n========================================")
    console.log("🔍 GALLERY TABLE — SCHEMA DEBUG")
    console.log("========================================")

    // ── 1. All tables with "gallery" in the name ──────────────────────────────
    sep()
    console.log("1️⃣  All tables containing 'gallery' in name:")
    const galleryTables = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename ILIKE '%gallery%'
      ORDER BY tablename
    `)
    if (galleryTables.rows.length === 0) {
      console.log("   ❌ No tables with 'gallery' found — checking for 'image' or 'asset' tables...")
    } else {
      galleryTables.rows.forEach(r => console.log(`   ✅ ${r.tablename}`))
    }

    // ── 2. Columns + sample rows for each gallery table ───────────────────────
    for (const row of galleryTables.rows) {
      sep()
      console.log(`2️⃣  Columns of "${row.tablename}":`)
      const cols = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [row.tablename])
      cols.rows.forEach(c =>
        console.log(`   ${c.column_name.padEnd(30)} ${c.data_type.padEnd(20)} nullable=${c.is_nullable}`)
      )

      const sample = await client.query(`SELECT * FROM "${row.tablename}" LIMIT 3`)
      console.log(`\n   Sample rows (${sample.rows.length}):`)
      sample.rows.forEach((r, i) => console.log(`   [${i + 1}]`, JSON.stringify(r)))

      // Check row count
      const count = await client.query(`SELECT COUNT(*) FROM "${row.tablename}"`)
      console.log(`\n   Total rows: ${count.rows[0].count}`)
    }

    // ── 3. Check if vendor_id column exists in gallery tables ─────────────────
    sep()
    console.log("3️⃣  Gallery tables with a vendor-related column:")
    for (const row of galleryTables.rows) {
      const vendorCols = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
          AND column_name ILIKE '%vendor%'
      `, [row.tablename])

      if (vendorCols.rows.length > 0) {
        console.log(`   ✅ "${row.tablename}" has vendor column(s): ${vendorCols.rows.map(c => c.column_name).join(", ")}`)
      } else {
        console.log(`   ✗  "${row.tablename}" — no vendor column found`)
      }
    }

    // ── 4. Fallback: tables with 'image' or 'asset' or 'design' ──────────────
    sep()
    console.log("4️⃣  Other possible upload/asset tables (image, asset, design, upload):")
    const assetTables = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
        AND (
          tablename ILIKE '%image%'
          OR tablename ILIKE '%asset%'
          OR tablename ILIKE '%upload%'
          OR tablename ILIKE '%design%'
          OR tablename ILIKE '%artwork%'
        )
        AND tablename NOT ILIKE '%gallery%'
      ORDER BY tablename
    `)
    if (assetTables.rows.length === 0) {
      console.log("   ❌ None found")
    } else {
      assetTables.rows.forEach(r => console.log(`   ${r.tablename}`))
    }

    // ── 5. All vendor-related tables (for full picture) ───────────────────────
    sep()
    console.log("5️⃣  All tables containing 'vendor' in name:")
    const vendorTables = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename ILIKE '%vendor%'
      ORDER BY tablename
    `)
    vendorTables.rows.forEach(r => console.log(`   ${r.tablename}`))

    sep()
    console.log("\n✅ Debug complete — paste output above to Claude\n")

  } finally {
    await client.end()
  }
}