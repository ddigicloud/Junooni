// src/scripts/debug-variant-image-table.ts
// Run: npx medusa exec src/scripts/debug-variant-image-table.ts

import pg from "pg"

// ── Fill these in before running ─────────────────────────────────────────────
const TEST_VARIANT_ID = ""   // optional: paste a real variant ID to test INSERT
const TEST_IMAGE_ID   = ""   // optional: paste a real image ID to test INSERT

export default async function debugVariantImageTable() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not found")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  try {
    console.log("\n========================================")
    console.log("🔍 VARIANT-IMAGE JOIN TABLE DEBUG")
    console.log("========================================\n")

    // ── 1. Find all variant-image join tables ─────────────────────────────────
    console.log("1️⃣  Looking for variant-image join tables...")
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND (
          tablename LIKE '%variant%image%'
          OR tablename LIKE '%image%variant%'
          OR tablename LIKE '%variant%media%'
          OR tablename LIKE '%media%variant%'
          OR tablename LIKE '%variant%photo%'
        )
      ORDER BY tablename
    `)

    if (tablesResult.rows.length === 0) {
      console.log("❌ No variant-image join tables found!\n")
    } else {
      console.log(`✅ Found ${tablesResult.rows.length} table(s):`)
      tablesResult.rows.forEach((r, i) => console.log(`   [${i + 1}] ${r.tablename}`))
      console.log()
    }

    // ── 2. Inspect columns of each table ─────────────────────────────────────
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

      colResult.rows.forEach(c => {
        console.log(`   ${c.column_name.padEnd(30)} ${c.data_type.padEnd(20)} nullable=${c.is_nullable}  default=${c.column_default ?? "none"}`)
      })
      console.log()

      // ── 3. Show existing rows ─────────────────────────────────────────────
      console.log(`3️⃣  Existing rows in "${tableName}" (limit 5):`)
      try {
        const rowsResult = await client.query(`SELECT * FROM "${tableName}" LIMIT 5`)
        if (rowsResult.rows.length === 0) {
          console.log("   (empty)\n")
        } else {
          rowsResult.rows.forEach((r, i) => console.log(`   [${i + 1}]`, JSON.stringify(r)))
          console.log()
        }
      } catch (err: any) {
        console.log(`   ❌ Could not read rows: ${err.message}\n`)
      }

      // ── 4. Test INSERT if IDs provided ────────────────────────────────────
      if (TEST_VARIANT_ID && TEST_IMAGE_ID) {
        console.log(`4️⃣  Testing INSERT into "${tableName}"...`)

        const colNames   = colResult.rows.map(c => c.column_name)
        const hasId      = colNames.includes("id")
        const idInfo     = colResult.rows.find(c => c.column_name === "id")
        const idHasDefault = !!idInfo?.column_default

        // Detect the image column name (could be image_id, media_id, photo_id)
        const imageCol = colNames.find(c =>
          c === "image_id" || c === "media_id" || c === "photo_id"
        )
        const variantCol = colNames.find(c => c === "variant_id")

        if (!variantCol || !imageCol) {
          console.log(`   ⚠️  Could not find variant_id or image/media column.`)
          console.log(`   Columns found: ${colNames.join(", ")}\n`)
          continue
        }

        console.log(`   Using columns: variant_id="${variantCol}", image="${imageCol}"`)

        try {
          if (hasId && !idHasDefault) {
            // Need to generate ID manually — same format as Medusa
            const chars  = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
            let t = Date.now(), timeStr = ""
            for (let i = 9; i >= 0; i--) { timeStr = chars[t % 32] + timeStr; t = Math.floor(t / 32) }
            let rand = ""
            for (let i = 0; i < 16; i++) rand += chars[Math.floor(Math.random() * 32)]
            const newId = (timeStr + rand).slice(0, 26)

            await client.query(
              `INSERT INTO "${tableName}" (id, ${variantCol}, ${imageCol})
               VALUES ($1, $2, $3)
               ON CONFLICT DO NOTHING`,
              [newId, TEST_VARIANT_ID, TEST_IMAGE_ID]
            )
          } else {
            await client.query(
              `INSERT INTO "${tableName}" (${variantCol}, ${imageCol})
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING`,
              [TEST_VARIANT_ID, TEST_IMAGE_ID]
            )
          }
          console.log(`   ✅ INSERT succeeded!\n`)

          // Verify
          const verifyResult = await client.query(
            `SELECT * FROM "${tableName}" WHERE ${variantCol} = $1 AND ${imageCol} = $2`,
            [TEST_VARIANT_ID, TEST_IMAGE_ID]
          )
          if (verifyResult.rows.length > 0) {
            console.log(`   ✅ Verified:`, JSON.stringify(verifyResult.rows[0]))
          } else {
            console.log(`   ⚠️  Row not found after insert (ON CONFLICT may have skipped — already existed)`)
          }
          console.log()

        } catch (insertErr: any) {
          console.log(`   ❌ INSERT failed: ${insertErr.message}\n`)
        }
      } else {
        console.log(`4️⃣  Skipping INSERT test — set TEST_VARIANT_ID and TEST_IMAGE_ID at top of script\n`)
      }
    }

    // ── 5. Constraints ────────────────────────────────────────────────────────
    for (const row of tablesResult.rows) {
      const tableName = row.tablename
      console.log(`5️⃣  Constraints on "${tableName}":`)
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
      `, [tableName])

      if (constraintResult.rows.length === 0) {
        console.log("   (no constraints found)\n")
      } else {
        constraintResult.rows.forEach(c => {
          console.log(`   ${c.constraint_type.padEnd(15)} ${c.constraint_name.padEnd(50)} column=${c.column_name}`)
        })
        console.log()
      }
    }

    // ── 6. Summary ────────────────────────────────────────────────────────────
    console.log("========================================")
    console.log("📋 SUMMARY — Correct INSERT for handleCreateProduct")
    console.log("========================================\n")

    for (const row of tablesResult.rows) {
      const tableName = row.tablename
      const colResult = await client.query(`
        SELECT column_name, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName])

      const cols       = colResult.rows.map(c => c.column_name)
      const hasId      = cols.includes("id")
      const idHasDefault = !!colResult.rows.find(c => c.column_name === "id")?.column_default
      const imageCol   = cols.find(c => c === "image_id" || c === "media_id" || c === "photo_id") ?? "image_id"
      const variantCol = cols.find(c => c === "variant_id") ?? "variant_id"

      console.log(`Table: "${tableName}"`)
      console.log(`All columns: ${cols.join(", ")}`)
      console.log(`variant column: "${variantCol}", image column: "${imageCol}"`)
      console.log()

      if (hasId && !idHasDefault) {
        console.log(`✅ Use this in handleCreateProduct:`)
        console.log(`
for (const img of matchingImgs) {
  const chars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
  let t = Date.now(), timeStr = ""
  for (let i = 9; i >= 0; i--) { timeStr = chars[t % 32] + timeStr; t = Math.floor(t / 32) }
  let rand = ""
  for (let i = 0; i < 16; i++) rand += chars[Math.floor(Math.random() * 32)]
  const newId = (timeStr + rand).slice(0, 26)

  await pgClient.raw(
    \`INSERT INTO "${tableName}" (id, ${variantCol}, ${imageCol})
     VALUES (?, ?, ?)
     ON CONFLICT DO NOTHING\`,
    [newId, variant.id, img.id]
  )
}`)
      } else {
        console.log(`✅ Use this in handleCreateProduct:`)
        console.log(`
for (const img of matchingImgs) {
  await pgClient.raw(
    \`INSERT INTO "${tableName}" (${variantCol}, ${imageCol})
     VALUES (?, ?)
     ON CONFLICT DO NOTHING\`,
    [variant.id, img.id]
  )
}`)
      }
      console.log()
    }

    console.log("========================================\n")

  } finally {
    await client.end()
  }
}