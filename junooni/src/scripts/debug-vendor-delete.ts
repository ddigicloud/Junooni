// src/scripts/debug-vendor-delete.ts
// Run: npx medusa exec src/scripts/debug-vendor-delete.ts

import pg from "pg"

const VENDOR_ID = "01KWRGBB84R8QJV8T0SX68H4WP" // the vendor you tried to delete

export default async function debugVendorDelete() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not found")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  const sep = () => console.log("\n" + "─".repeat(60))

  try {
    console.log("\n========================================")
    console.log("🔍 VENDOR DELETE — SCHEMA DEBUG")
    console.log("========================================")

    // ── 1. vendor_artwork columns ─────────────────────────────────────────────
    sep()
    console.log("1️⃣  Columns of vendor_artwork:")
    const artworkCols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'vendor_artwork'
      ORDER BY ordinal_position
    `)
    if (artworkCols.rows.length === 0) {
      console.log("   ❌ Table 'vendor_artwork' not found")
    } else {
      artworkCols.rows.forEach(c =>
        console.log(`   ${c.column_name.padEnd(30)} ${c.data_type.padEnd(20)} nullable=${c.is_nullable}`)
      )
    }

    // ── 2. Sample vendor_artwork rows for this vendor ─────────────────────────
    sep()
    console.log("2️⃣  Sample vendor_artwork rows (limit 5) — trying all likely vendor columns:")
    for (const col of ["vendor_id", "store_id", "owner_id", "creator_id"]) {
      try {
        const rows = await client.query(
          `SELECT * FROM vendor_artwork WHERE "${col}" = $1 LIMIT 5`,
          [VENDOR_ID]
        )
        console.log(`   ✅ Column "${col}" works — ${rows.rows.length} row(s) found`)
        if (rows.rows.length > 0) {
          console.log("      Sample:", JSON.stringify(rows.rows[0]))
        }
      } catch {
        console.log(`   ✗  Column "${col}" — doesn't exist or query failed`)
      }
    }

    // ── 3. All tables with "vendor" in the name ───────────────────────────────
    sep()
    console.log("3️⃣  All tables containing 'vendor' in name:")
    const vendorTables = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename ILIKE '%vendor%'
      ORDER BY tablename
    `)
    vendorTables.rows.forEach(r => console.log(`   ${r.tablename}`))

    // ── 4. All tables with "product" + "vendor" (join tables) ────────────────
    sep()
    console.log("4️⃣  Tables with both 'product' and 'vendor' in name (join tables):")
    const joinTables = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
        AND (
          (tablename ILIKE '%vendor%' AND tablename ILIKE '%product%')
        )
      ORDER BY tablename
    `)
    if (joinTables.rows.length === 0) {
      console.log("   ❌ None found — checking for product tables with a vendor column...")

      // Fallback: find any table with a vendor_id column
      const vendorColTables = await client.query(`
        SELECT table_name FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name ILIKE '%vendor%'
          AND table_name ILIKE '%product%'
        ORDER BY table_name
      `)
      if (vendorColTables.rows.length === 0) {
        console.log("   ❌ No product tables with a vendor column found either")
      } else {
        console.log("   Found product tables with a vendor-related column:")
        vendorColTables.rows.forEach(r => console.log(`   ${r.table_name}`))
      }
    } else {
      joinTables.rows.forEach(r => console.log(`   ${r.tablename}`))
      // Show columns of each
      for (const row of joinTables.rows) {
        const cols = await client.query(`
          SELECT column_name, data_type FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position
        `, [row.tablename])
        console.log(`\n   Columns of "${row.tablename}":`)
        cols.rows.forEach(c => console.log(`      ${c.column_name.padEnd(30)} ${c.data_type}`))

        const sample = await client.query(`SELECT * FROM "${row.tablename}" LIMIT 3`)
        console.log(`   Sample rows (${sample.rows.length}):`)
        sample.rows.forEach((r, i) => console.log(`      [${i+1}]`, JSON.stringify(r)))
      }
    }

    // ── 5. All FK constraints pointing AT vendor table ────────────────────────
    sep()
    console.log("5️⃣  All foreign keys that reference the 'vendor' table:")
    const fks = await client.query(`
      SELECT
        tc.table_name          AS "table",
        kcu.column_name        AS "column",
        tc.constraint_name     AS "constraint"
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema   = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name     = 'vendor'
      ORDER BY tc.table_name
    `)
    if (fks.rows.length === 0) {
      console.log("   ❌ No FK constraints found pointing at 'vendor'")
    } else {
      fks.rows.forEach(r =>
        console.log(`   ${r.table.padEnd(40)} column: ${r.column.padEnd(20)} constraint: ${r.constraint}`)
      )
    }

    // ── 6. vendor_store table ─────────────────────────────────────────────────
    sep()
    console.log("6️⃣  vendor_store — columns and sample rows:")
    try {
      const vsCols = await client.query(`
        SELECT column_name, data_type FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'vendor_store'
        ORDER BY ordinal_position
      `)
      if (vsCols.rows.length === 0) {
        console.log("   ❌ Table 'vendor_store' not found")
      } else {
        vsCols.rows.forEach(c => console.log(`   ${c.column_name.padEnd(30)} ${c.data_type}`))
        const vsRows = await client.query(
          `SELECT * FROM vendor_store WHERE vendor_id = $1 LIMIT 5`,
          [VENDOR_ID]
        )
        console.log(`\n   Rows for vendor ${VENDOR_ID}: ${vsRows.rows.length}`)
        vsRows.rows.forEach((r, i) => console.log(`   [${i+1}]`, JSON.stringify(r)))
      }
    } catch (err: any) {
      console.log(`   ❌ Error: ${err.message}`)
    }

    // ── 7. What products exist for this vendor (raw scan) ─────────────────────
    sep()
    console.log("7️⃣  Scanning all vendor-related tables for rows matching VENDOR_ID:")
    for (const row of vendorTables.rows) {
      try {
        // Check if table has any vendor-like column
        const colCheck = await client.query(`
          SELECT column_name FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
            AND column_name ILIKE '%vendor%'
        `, [row.tablename])

        for (const col of colCheck.rows) {
          const count = await client.query(
            `SELECT COUNT(*) FROM "${row.tablename}" WHERE "${col.column_name}" = $1`,
            [VENDOR_ID]
          )
          const n = parseInt(count.rows[0].count)
          if (n > 0) {
            console.log(`   ✅ ${row.tablename}.${col.column_name} = ${n} row(s)`)
          }
        }
      } catch {
        // skip tables that error
      }
    }

    sep()
    console.log("\n✅ Debug complete — paste output above to Claude\n")

  } finally {
    await client.end()
  }
}