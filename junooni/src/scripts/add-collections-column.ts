// src/scripts/add-collections-column.ts
// Run: npx medusa exec src/scripts/add-collections-column.ts

import pg from "pg"

export default async function addCollectionsColumn() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not found")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  try {
    const cols = [
      { name: "collections", type: "jsonb" },
      { name: "sticky_header", type: "boolean DEFAULT true" },
      { name: "sticky_announcement", type: "boolean DEFAULT true" },
    ]
    for (const col of cols) {
      const check = await client.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_name = $1 AND column_name = $2`,
        ["vendor_store", col.name]
      )
      if (check.rows.length > 0) {
        console.log(`✓ Column '${col.name}' already exists`)
      } else {
        await client.query(`ALTER TABLE vendor_store ADD COLUMN ${col.name} ${col.type} NULL`)
        console.log(`✓ Added '${col.name}' to vendor_store`)
      }
    }
  } finally {
    await client.end()
  }
}