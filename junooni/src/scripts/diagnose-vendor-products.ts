// src/scripts/diagnose-vendor-products.ts
// Run: npx medusa exec src/scripts/diagnose-vendor-products.ts

import pg from "pg"

export default async function diagnoseVendorProducts() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not found")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  console.log("\n========== VENDOR PRODUCT DIAGNOSIS ==========\n")

  try {
    // 1. Find all tables with "vendor" in their name
    console.log("--- Tables with 'vendor' in name ---")
    const vendorTables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name ILIKE '%vendor%'
      ORDER BY table_name
    `)
    vendorTables.rows.forEach(r => console.log(" ", r.table_name))

    // 2. Find all tables with "product" in their name
    console.log("\n--- Tables with 'product' in name ---")
    const productTables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name ILIKE '%product%'
      ORDER BY table_name
    `)
    productTables.rows.forEach(r => console.log(" ", r.table_name))

    // 3. Check vendor_product link table specifically
    console.log("\n--- vendor_product table check ---")
    const vpCheck = await client.query(`
      SELECT COUNT(*) as total FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'vendor_product'
    `)
    if (vpCheck.rows[0].total === '0') {
      console.log("  vendor_product table does NOT exist")
    } else {
      const vpCount = await client.query(`SELECT COUNT(*) as total FROM vendor_product`)
      console.log(`  vendor_product exists with ${vpCount.rows[0].total} rows`)
      if (parseInt(vpCount.rows[0].total) > 0) {
        const vpSample = await client.query(`SELECT * FROM vendor_product LIMIT 3`)
        console.log("  Sample rows:", JSON.stringify(vpSample.rows, null, 2))
      }
    }

    // 4. Check ALL link/pivot tables (tables with exactly 2-4 columns typically)
    console.log("\n--- All potential link tables (2-5 columns) ---")
    const linkTables = await client.query(`
      SELECT t.table_name, COUNT(c.column_name) as col_count
      FROM information_schema.tables t
      JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema = 'public'
      WHERE t.table_schema = 'public'
      GROUP BY t.table_name
      HAVING COUNT(c.column_name) BETWEEN 2 AND 6
      ORDER BY t.table_name
    `)
    for (const row of linkTables.rows) {
      const cols = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [row.table_name])
      const colNames = cols.rows.map(r => r.column_name).join(", ")
      // Only show tables that have both vendor and product related columns
      if (
        colNames.includes('vendor') || colNames.includes('product')
      ) {
        const countResult = await client.query(`SELECT COUNT(*) as total FROM "${row.table_name}"`)
        console.log(`  ${row.table_name} [${colNames}] — ${countResult.rows[0].total} rows`)
      }
    }

    // 5. Check product table for any vendor-related columns
    console.log("\n--- product table columns with 'vendor' ---")
    const productCols = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'product'
      AND column_name ILIKE '%vendor%'
    `)
    if (productCols.rows.length === 0) {
      console.log("  No vendor columns on product table")
    } else {
      productCols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`))
    }

    // 6. Check product metadata for vendor_id
    console.log("\n--- Products with vendor_id in metadata ---")
    const metaCheck = await client.query(`
      SELECT COUNT(*) as total FROM product
      WHERE metadata::text ILIKE '%vendor_id%'
    `)
    console.log(`  Products with vendor_id in metadata: ${metaCheck.rows[0].total}`)

    // Sample one to see structure
    if (parseInt(metaCheck.rows[0].total) > 0) {
      const metaSample = await client.query(`
        SELECT id, title, metadata FROM product
        WHERE metadata::text ILIKE '%vendor_id%'
        LIMIT 2
      `)
      metaSample.rows.forEach(r => {
        console.log(`  Product: ${r.title}`)
        console.log(`  Metadata: ${JSON.stringify(r.metadata)}`)
      })
    }

    // 7. Check for any column on product table that could be vendor reference
    console.log("\n--- All product table columns ---")
    const allProductCols = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'product'
      ORDER BY ordinal_position
    `)
    allProductCols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`))

    // 8. Sample a known vendor's products from any possible association
    const VENDOR_ID = '01JN46NEG5F64FJJN5NVT6RCH7'
    console.log(`\n--- Searching ALL tables for vendor ID ${VENDOR_ID} ---`)

    // Get all tables and check if they have a column that might contain this vendor ID
    const allTables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    for (const tableRow of allTables.rows) {
      const tableName = tableRow.table_name
      try {
        const count = await client.query(
          `SELECT COUNT(*) as total FROM "${tableName}" WHERE CAST("${tableName}"::text AS text) ILIKE $1`,
          [`%${VENDOR_ID}%`]
        )
        // simpler text search across the whole row
      } catch {}

      // Check if table has a vendor_id column
      const hasVendorCol = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name ILIKE '%vendor%'
      `, [tableName])

      if (hasVendorCol.rows.length > 0) {
        for (const col of hasVendorCol.rows) {
          try {
            const count = await client.query(
              `SELECT COUNT(*) as total FROM "${tableName}" WHERE "${col.column_name}" = $1`,
              [VENDOR_ID]
            )
            if (parseInt(count.rows[0].total) > 0) {
              console.log(`  ✅ FOUND: table="${tableName}" column="${col.column_name}" count=${count.rows[0].total}`)
              const sample = await client.query(
                `SELECT * FROM "${tableName}" WHERE "${col.column_name}" = $1 LIMIT 2`,
                [VENDOR_ID]
              )
              console.log(`  Sample:`, JSON.stringify(sample.rows[0]))
            }
          } catch {}
        }
      }
    }

    console.log("\n========== END DIAGNOSIS ==========\n")
  } finally {
    await client.end()
  }
}