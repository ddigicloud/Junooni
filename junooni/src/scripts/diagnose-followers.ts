// src/scripts/diagnose-followers.ts
// Run: npx medusa exec src/scripts/diagnose-followers.ts

import pg from "pg"

export default async function diagnoseFollowers() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not found")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  console.log("\n========== FOLLOWER DIAGNOSIS ==========\n")

  try {
    // 1. Find all tables with "follow" in their name
    console.log("--- Tables with 'follow' in name ---")
    const followTables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name ILIKE '%follow%'
      ORDER BY table_name
    `)
    if (followTables.rows.length === 0) {
      console.log("  ❌ No tables with 'follow' found at all")
    } else {
      followTables.rows.forEach(r => console.log(" ✅", r.table_name))
    }

    // 2. Check each follow-related table: columns + row count
    console.log("\n--- Follow table details ---")
    for (const row of followTables.rows) {
      const tableName = row.table_name

      const cols = await client.query(`
        SELECT column_name, data_type FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName])

      const countResult = await client.query(`SELECT COUNT(*) as total FROM "${tableName}"`)
      const total = countResult.rows[0].total

      console.log(`\n  Table: ${tableName}`)
      console.log(`  Row count: ${total}`)
      console.log(`  Columns:`)
      cols.rows.forEach(c => console.log(`    - ${c.column_name} (${c.data_type})`))

      // Show sample rows if any exist
      if (parseInt(total) > 0) {
        const sample = await client.query(`SELECT * FROM "${tableName}" LIMIT 3`)
        console.log(`  Sample rows:`, JSON.stringify(sample.rows, null, 2))
      }
    }

    // 3. Check if follow table has vendor_id column and query it
    console.log("\n--- Checking follow table for vendor_id column ---")
    const vendorColCheck = await client.query(`
      SELECT table_name, column_name FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name ILIKE '%follow%'
      AND column_name ILIKE '%vendor%'
    `)
    if (vendorColCheck.rows.length === 0) {
      console.log("  ❌ No vendor_id column found in any follow table")
    } else {
      vendorColCheck.rows.forEach(r =>
        console.log(`  ✅ Found: ${r.table_name}.${r.column_name}`)
      )
    }

    // 4. Check if follow table has customer_id column
    console.log("\n--- Checking follow table for customer_id column ---")
    const customerColCheck = await client.query(`
      SELECT table_name, column_name FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name ILIKE '%follow%'
      AND column_name ILIKE '%customer%'
    `)
    if (customerColCheck.rows.length === 0) {
      console.log("  ❌ No customer_id column found in any follow table")
    } else {
      customerColCheck.rows.forEach(r =>
        console.log(`  ✅ Found: ${r.table_name}.${r.column_name}`)
      )
    }

    // 5. Try to find follow records for a specific vendor
    console.log("\n--- Searching all follow tables for any vendor references ---")
    for (const row of followTables.rows) {
      const tableName = row.table_name
      const cols = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
      `, [tableName])
      const colNames = cols.rows.map(r => r.column_name)

      // Try text search across the whole table for any vendor-like IDs
      try {
        const textSearch = await client.query(`
          SELECT * FROM "${tableName}"
          LIMIT 5
        `)
        if (textSearch.rows.length > 0) {
          console.log(`\n  All rows in ${tableName}:`)
          console.log(JSON.stringify(textSearch.rows, null, 2))
        }
      } catch (e) {
        console.log(`  Could not query ${tableName}:`, e.message)
      }
    }

    // 6. Check the Addfollower API — look for any custom API tables
    console.log("\n--- Checking for custom module tables (vendor/follow related) ---")
    const customTables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND (
        table_name ILIKE '%vendor%'
        OR table_name ILIKE '%follow%'
        OR table_name ILIKE '%subscriber%'
        OR table_name ILIKE '%fan%'
      )
      ORDER BY table_name
    `)
    if (customTables.rows.length === 0) {
      console.log("  ❌ No custom module tables found")
    } else {
      for (const row of customTables.rows) {
        const countResult = await client.query(`SELECT COUNT(*) as total FROM "${row.table_name}"`)
        console.log(`  ${row.table_name} — ${countResult.rows[0].total} rows`)
      }
    }

    // 7. Check what the Addfollower/deletefollower endpoints hit
    // Look for any store route that might create follow records
    console.log("\n--- All tables with 'id' + 'created_at' (likely module tables) ---")
    const moduleTables = await client.query(`
      SELECT t.table_name
      FROM information_schema.tables t
      WHERE t.table_schema = 'public'
      AND EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_schema = 'public'
        AND c.table_name = t.table_name
        AND c.column_name = 'id'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_schema = 'public'
        AND c.table_name = t.table_name
        AND c.column_name = 'created_at'
      )
      AND t.table_name NOT IN (
        'product', 'customer', 'order', 'cart', 'region',
        'payment', 'shipping', 'address', 'store', 'user',
        'currency', 'country', 'tax_rate', 'discount',
        'gift_card', 'image', 'money_amount', 'price_list'
      )
      ORDER BY t.table_name
    `)
    console.log("  Candidate custom tables:")
    for (const row of moduleTables.rows) {
      const countResult = await client.query(`SELECT COUNT(*) as total FROM "${row.table_name}"`)
      const cols = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [row.table_name])
      const colNames = cols.rows.map(r => r.column_name).join(", ")
      console.log(`    ${row.table_name} [${colNames}] — ${countResult.rows[0].total} rows`)
    }

    console.log("\n========== END DIAGNOSIS ==========\n")
  } finally {
    await client.end()
  }
}