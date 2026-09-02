// src/scripts/debug-product-media.ts
// Run: npx medusa exec src/scripts/debug-product-media.ts

import pg from "pg"

// Paste a real product ID from this vendor to inspect
const SAMPLE_PRODUCT_ID = "prod_01M0MGRH6JY9WV58XB7JWJY5AY" // replace with a real one

export default async function debugProductMedia() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not found")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  const sep = (title: string) => {
    console.log("\n" + "─".repeat(60))
    console.log(title)
    console.log("─".repeat(60))
  }

  try {
    console.log("\n========================================")
    console.log("🔍 PRODUCT MEDIA & MOCKUP DEBUG")
    console.log("========================================")

    // ── 1. All product-related tables ────────────────────────────────────────
    sep("1️⃣  All tables with 'product' in name")
    const productTables = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename ILIKE '%product%'
      ORDER BY tablename
    `)
    productTables.rows.forEach(r => console.log(`   ${r.tablename}`))

    // ── 2. All tables with 'image' or 'media' or 'mockup' in name ─────────
    sep("2️⃣  All tables with 'image', 'media', or 'mockup' in name")
    const mediaTables = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
        AND (
          tablename ILIKE '%image%'
          OR tablename ILIKE '%media%'
          OR tablename ILIKE '%mockup%'
          OR tablename ILIKE '%thumbnail%'
          OR tablename ILIKE '%photo%'
        )
      ORDER BY tablename
    `)
    if (mediaTables.rows.length === 0) {
      console.log("   ❌ No media/image/mockup tables found")
    } else {
      mediaTables.rows.forEach(r => console.log(`   ${r.tablename}`))
    }

    // ── 3. Columns of product_image (standard Medusa) ─────────────────────
    sep("3️⃣  Columns of 'product_image' (standard Medusa table)")
    try {
      const cols = await client.query(`
        SELECT column_name, data_type FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'product_image'
        ORDER BY ordinal_position
      `)
      if (cols.rows.length === 0) {
        console.log("   ❌ Table not found")
      } else {
        cols.rows.forEach(c => console.log(`   ${c.column_name.padEnd(30)} ${c.data_type}`))

        // Sample rows
        const sample = await client.query(`SELECT * FROM product_image LIMIT 3`)
        console.log(`\n   Sample rows (${sample.rows.length}):`)
        sample.rows.forEach((r, i) => console.log(`   [${i+1}]`, JSON.stringify(r)))
      }
    } catch (err: any) {
      console.log(`   ❌ Error: ${err.message}`)
    }

    // ── 4. FK constraints on product table ───────────────────────────────
    sep("4️⃣  All FK constraints referencing 'product' table")
    const fks = await client.query(`
      SELECT
        tc.table_name          AS "child_table",
        kcu.column_name        AS "child_column",
        ccu.table_name         AS "parent_table",
        tc.constraint_name     AS "constraint"
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema   = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name IN ('product', 'product_variant')
      ORDER BY tc.table_name
    `)
    if (fks.rows.length === 0) {
      console.log("   ❌ No FK constraints found")
    } else {
      fks.rows.forEach(r =>
        console.log(`   ${r.child_table.padEnd(50)} .${r.child_column.padEnd(20)} → ${r.parent_table}`)
      )
    }

    // ── 5. Inspect sample product's images/media ──────────────────────────
    sep(`5️⃣  Checking images for sample product: ${SAMPLE_PRODUCT_ID}`)

    // product_image
    try {
      const imgs = await client.query(
        `SELECT * FROM product_image WHERE product_id = $1`,
        [SAMPLE_PRODUCT_ID]
      )
      console.log(`\n   product_image rows: ${imgs.rows.length}`)
      imgs.rows.forEach((r, i) => console.log(`   [${i+1}]`, JSON.stringify(r)))
    } catch (err: any) {
      console.log(`   product_image error: ${err.message}`)
    }

    // Any table with product_id column that has media/image/url fields
    const mediaLikeTables = await client.query(`
      SELECT DISTINCT t.table_name
      FROM information_schema.tables t
      JOIN information_schema.columns c1
        ON c1.table_name = t.table_name AND c1.column_name = 'product_id'
      JOIN information_schema.columns c2
        ON c2.table_name = t.table_name
        AND (c2.column_name ILIKE '%url%' OR c2.column_name ILIKE '%file%'
          OR c2.column_name ILIKE '%image%' OR c2.column_name ILIKE '%media%')
      WHERE t.table_schema = 'public'
      ORDER BY t.table_name
    `)
    console.log(`\n   Tables with both product_id AND a url/file/image column:`)
    if (mediaLikeTables.rows.length === 0) {
      console.log("   ❌ None found")
    } else {
      for (const row of mediaLikeTables.rows) {
        console.log(`\n   📋 ${row.table_name}:`)
        const cols = await client.query(`
          SELECT column_name, data_type FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position
        `, [row.table_name])
        cols.rows.forEach(c => console.log(`      ${c.column_name.padEnd(30)} ${c.data_type}`))

        try {
          const sample = await client.query(
            `SELECT * FROM "${row.table_name}" WHERE product_id = $1 LIMIT 3`,
            [SAMPLE_PRODUCT_ID]
          )
          console.log(`      Sample rows for product (${sample.rows.length}):`)
          sample.rows.forEach((r, i) => console.log(`      [${i+1}]`, JSON.stringify(r)))
        } catch {}
      }
    }

    // ── 6. canvas_designer / mockup tables ───────────────────────────────
    sep("6️⃣  All tables with 'canvas', 'design', 'mockup' in name + columns")
    const designTables = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
        AND (
          tablename ILIKE '%canvas%'
          OR tablename ILIKE '%design%'
          OR tablename ILIKE '%mockup%'
          OR tablename ILIKE '%render%'
        )
      ORDER BY tablename
    `)
    if (designTables.rows.length === 0) {
      console.log("   ❌ None found")
    } else {
      for (const row of designTables.rows) {
        console.log(`\n   📋 ${row.tablename}:`)
        const cols = await client.query(`
          SELECT column_name, data_type FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position
        `, [row.tablename])
        cols.rows.forEach(c => console.log(`      ${c.column_name.padEnd(30)} ${c.data_type}`))

        const sample = await client.query(`SELECT * FROM "${row.tablename}" LIMIT 2`)
        console.log(`      Sample rows (${sample.rows.length}):`)
        sample.rows.forEach((r, i) => console.log(`      [${i+1}]`, JSON.stringify(r)))
      }
    }

    // ── 7. Variants and their media ───────────────────────────────────────
    sep("7️⃣  product_variant columns + sample")
    try {
      const varCols = await client.query(`
        SELECT column_name, data_type FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'product_variant'
        ORDER BY ordinal_position
      `)
      varCols.rows.forEach(c => console.log(`   ${c.column_name.padEnd(30)} ${c.data_type}`))

      const varSample = await client.query(
        `SELECT id, product_id, title, metadata FROM product_variant WHERE product_id = $1 LIMIT 3`,
        [SAMPLE_PRODUCT_ID]
      )
      console.log(`\n   Variants for sample product (${varSample.rows.length}):`)
      varSample.rows.forEach((r, i) => console.log(`   [${i+1}]`, JSON.stringify(r)))
    } catch (err: any) {
      console.log(`   ❌ Error: ${err.message}`)
    }

    sep("✅ Debug complete — paste full output to Claude")

  } finally {
    await client.end()
  }
}