// src/scripts/add-pages-column.ts
// Run: npx medusa exec src/scripts/add-pages-column.ts

import pg from "pg"

export default async function addPagesColumn() {
  const dbUrl = process.env.DATABASE_URL

  if (!dbUrl) {
    throw new Error("DATABASE_URL not found in environment")
  }

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  try {
    const checkResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'vendor_store'
      AND column_name = 'pages'
    `)

    if (checkResult.rows.length > 0) {
      console.log("✓ Column 'pages' already exists — nothing to do")
    } else {
      await client.query(`
        ALTER TABLE vendor_store ADD COLUMN pages jsonb NULL
      `)
      console.log("✓ Added 'pages' column to vendor_store table successfully")
    }
  } finally {
    await client.end()
  }
}