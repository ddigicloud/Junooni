// src/scripts/add-logo-favicon-columns.ts
// Run: npx medusa exec src/scripts/add-logo-favicon-columns.ts

import pg from "pg"

export default async function addLogoFaviconColumns() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not found")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  try {
    const cols = ["store_logo", "store_favicon"]
    for (const col of cols) {
      const check = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'vendor_store' AND column_name = $1
      `, [col])
      if (check.rows.length > 0) {
        console.log(`✓ Column '${col}' already exists`)
      } else {
        await client.query(`ALTER TABLE vendor_store ADD COLUMN ${col} text NULL`)
        console.log(`✓ Added '${col}' column to vendor_store`)
      }
    }
  } finally {
    await client.end()
  }
}