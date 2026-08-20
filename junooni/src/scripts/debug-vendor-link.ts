// src/scripts/debug-vendor-link.ts
// Run: npx medusa exec src/scripts/debug-vendor-link.ts

import pg from "pg"

// ── Fill these in before running ─────────────────────────────────────────────
const KNOWN_VENDOR_ID  = "01KJ50176GDA5B0W7228VZNSR8"  // your vendor ID
const TEST_PRODUCT_ID  = ""  // optional: paste a real product ID to test the insert

export default async function debugVendorLink() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not found")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  try {
    console.log("\n========================================")
    console.log("🔍 VENDOR-PRODUCT LINK TABLE DEBUG")
    console.log("========================================\n")

    // ── 1. Find the link table ────────────────────────────────────────────────
    console.log("1️⃣  Looking for vendor-product link tables...")
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND (
          tablename LIKE '%vendor%product%'
          OR tablename LIKE '%product%vendor%'
        )
      ORDER BY tablename
    `)

    if (tablesResult.rows.length === 0) {
      console.log("❌ No vendor-product link tables found!\n")
    } else {
      console.log(`✅ Found ${tablesResult.rows.length} table(s):`)
      tablesResult.rows.forEach((r, i) => console.log(`   [${i+1}] ${r.tablename}`))
      console.log()
    }

    // ── 2. Inspect columns of each table found ────────────────────────────────
    for (const row of tablesResult.rows) {
      const tableName = row.tablename
      console.log(`2️⃣  Columns of "${tableName}":`)

      const colResult = await client.query(`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = $1
        ORDER BY ordinal_position
      `, [tableName])

      if (colResult.rows.length === 0) {
        console.log("   (no columns found — unusual)\n")
      } else {
        colResult.rows.forEach(c => {
          console.log(`   ${c.column_name.padEnd(30)} ${c.data_type.padEnd(20)} nullable=${c.is_nullable}  default=${c.column_default ?? "none"}`)
        })
        console.log()
      }

      // ── 3. Show existing rows ───────────────────────────────────────────────
      console.log(`3️⃣  Existing rows in "${tableName}" (limit 10):`)
      try {
        const rowsResult = await client.query(`SELECT * FROM "${tableName}" LIMIT 10`)
        if (rowsResult.rows.length === 0) {
          console.log("   (empty — no vendor-product links exist yet)\n")
        } else {
          rowsResult.rows.forEach((r, i) => console.log(`   [${i+1}]`, JSON.stringify(r)))
          console.log()
        }
      } catch (err: any) {
        console.log(`   ❌ Could not read rows: ${err.message}\n`)
      }

      // ── 4. Test insert (only if TEST_PRODUCT_ID is provided) ───────────────
      if (TEST_PRODUCT_ID) {
        console.log(`4️⃣  Testing INSERT into "${tableName}"...`)

        // Detect column names dynamically
        const colNames = colResult.rows.map(c => c.column_name)
        const hasId    = colNames.includes("id")
        const vendorCol  = colNames.find(c => c === "vendor_id")
        const productCol = colNames.find(c => c === "product_id")

        if (!vendorCol || !productCol) {
          console.log(`   ⚠️  Could not find vendor_id or product_id columns. Columns found: ${colNames.join(", ")}\n`)
          continue
        }

        // Check if id column has a default (auto-generate)
        const idColInfo = colResult.rows.find(c => c.column_name === "id")
        const idHasDefault = !!idColInfo?.column_default

        try {
          if (hasId && !idHasDefault) {
            // Need to generate ULID manually
            // Use a timestamp-based ID similar to Medusa's format
            const { ulid } = await import("ulid").catch(() => ({ ulid: null }))
            let newId: string
            if (ulid) {
              newId = ulid()
            } else {
              // Fallback: generate a 26-char ULID-like string
              const ts    = Date.now().toString(36).toUpperCase().padStart(10, "0")
              const rand  = Math.random().toString(36).slice(2).toUpperCase().padStart(16, "0").slice(0, 16)
              newId = (ts + rand).slice(0, 26)
            }

            console.log(`   Generated id: ${newId}`)
            await client.query(
              `INSERT INTO "${tableName}" (id, vendor_id, product_id, created_at, deleted_at)
               VALUES ($1, $2, $3, NOW(), NULL)
               ON CONFLICT DO NOTHING`,
              [newId, KNOWN_VENDOR_ID, TEST_PRODUCT_ID]
            )
          } else if (hasId && idHasDefault) {
            await client.query(
              `INSERT INTO "${tableName}" (vendor_id, product_id, created_at, deleted_at)
               VALUES ($1, $2, NOW(), NULL)
               ON CONFLICT DO NOTHING`,
              [KNOWN_VENDOR_ID, TEST_PRODUCT_ID]
            )
          } else {
            await client.query(
              `INSERT INTO "${tableName}" (vendor_id, product_id)
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING`,
              [KNOWN_VENDOR_ID, TEST_PRODUCT_ID]
            )
          }
          console.log(`   ✅ INSERT succeeded!\n`)

          // Verify it's there
          const verifyResult = await client.query(
            `SELECT * FROM "${tableName}" WHERE vendor_id = $1 AND product_id = $2`,
            [KNOWN_VENDOR_ID, TEST_PRODUCT_ID]
          )
          if (verifyResult.rows.length > 0) {
            console.log(`   ✅ Verified row exists:`, JSON.stringify(verifyResult.rows[0]))
          } else {
            console.log(`   ⚠️  Row not found after insert — ON CONFLICT may have skipped it (already existed)`)
          }
          console.log()

        } catch (insertErr: any) {
          console.log(`   ❌ INSERT failed: ${insertErr.message}`)
          console.log(`   → This tells us exactly what column/constraint is failing\n`)
        }
      } else {
        console.log(`4️⃣  Skipping INSERT test — set TEST_PRODUCT_ID at top of script to test\n`)
      }
    }

    // ── 5. Also check constraints ─────────────────────────────────────────────
    if (tablesResult.rows.length > 0) {
      const mainTable = tablesResult.rows[0].tablename
      console.log(`5️⃣  Constraints on "${mainTable}":`)
      const constraintResult = await client.query(`
        SELECT
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema   = kcu.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name   = $1
        ORDER BY tc.constraint_type, kcu.column_name
      `, [mainTable])

      if (constraintResult.rows.length === 0) {
        console.log("   (no constraints found)\n")
      } else {
        constraintResult.rows.forEach(c => {
          console.log(`   ${c.constraint_type.padEnd(15)} ${c.constraint_name.padEnd(50)} column=${c.column_name}`)
        })
        console.log()
      }
    }

    // ── 6. Summary: print the correct INSERT statement to use ─────────────────
    console.log("========================================")
    console.log("📋 SUMMARY — Correct INSERT for your table")
    console.log("========================================")

    if (tablesResult.rows.length > 0) {
      const mainTable  = tablesResult.rows[0].tablename
      const colResult2 = await client.query(`
        SELECT column_name, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [mainTable])

      const cols          = colResult2.rows.map(c => c.column_name)
      const hasId         = cols.includes("id")
      const idHasDefault  = !!colResult2.rows.find(c => c.column_name === "id")?.column_default
      const hasCreatedAt  = cols.includes("created_at")
      const hasDeletedAt  = cols.includes("deleted_at")

      console.log(`\nTable: "${mainTable}"`)
      console.log(`All columns: ${cols.join(", ")}`)
      console.log()

      if (hasId && !idHasDefault) {
        console.log("✅ Correct INSERT (id must be manually provided — use ulid()):")
        console.log(`
import { ulid } from "ulid"

await pgClient.raw(
  \`INSERT INTO "${mainTable}" (id, vendor_id, product_id${hasCreatedAt?", created_at":""}${hasDeletedAt?", deleted_at":""})
   VALUES (?, ?, ?${hasCreatedAt?", NOW()":""}${hasDeletedAt?", NULL":""})
   ON CONFLICT DO NOTHING\`,
  [ulid(), vendorId, productId]
)`)
      } else if (hasId && idHasDefault) {
        console.log("✅ Correct INSERT (id is auto-generated):")
        console.log(`
await pgClient.raw(
  \`INSERT INTO "${mainTable}" (vendor_id, product_id${hasCreatedAt?", created_at":""}${hasDeletedAt?", deleted_at":""})
   VALUES (?, ?${hasCreatedAt?", NOW()":""}${hasDeletedAt?", NULL":""})
   ON CONFLICT DO NOTHING\`,
  [vendorId, productId]
)`)
      } else {
        console.log("✅ Correct INSERT (no id column):")
        console.log(`
await pgClient.raw(
  \`INSERT INTO "${mainTable}" (vendor_id, product_id)
   VALUES (?, ?)
   ON CONFLICT DO NOTHING\`,
  [vendorId, productId]
)`)
      }
    }

    console.log("\n========================================\n")

  } finally {
    await client.end()
  }
}