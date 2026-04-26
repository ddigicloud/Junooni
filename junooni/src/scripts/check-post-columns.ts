// src/scripts/check-post-columns.ts
// Run: npx medusa exec src/scripts/check-post-columns.ts

import pg from "pg"

export default async function checkPostColumns() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not found")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  try {
    const result = await client.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_name = 'post'
       ORDER BY ordinal_position`
    )

    console.log("\n=== COLUMNS IN 'post' TABLE ===")
    for (const row of result.rows) {
      const nullable = row.is_nullable === "YES" ? "nullable" : "NOT NULL"
      console.log(`  ${row.column_name.padEnd(25)} ${row.data_type.padEnd(30)} (${nullable})`)
    }
    console.log(`\nTotal columns: ${result.rows.length}`)

    // Check specifically for our expected new columns
    const expected = ["category", "author_avatar", "seo_title", "seo_description", "read_time_minutes", "audience"]
    console.log("\n=== NEW FIELDS CHECK ===")
    for (const col of expected) {
      const found = result.rows.find((r) => r.column_name === col)
      console.log(`  ${col.padEnd(25)} ${found ? "✅ exists" : "❌ MISSING"}`)
    }
  } finally {
    await client.end()
  }
}