// src/scripts/fix-export-orphaned-regions.ts
// Fixes: "Region with id X not found" error during product export
// Handles both hard-deleted AND soft-deleted (deleted_at) regions
//
// Run with:  npx medusa exec src/scripts/fix-export-orphaned-regions.ts

import pg from "pg"

export default async function fixExportOrphanedRegions() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not set")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  const sep = () => console.log("─".repeat(60))

  try {
    console.log("\n╔══════════════════════════════════════════════════╗")
    console.log("║   FIX: Orphaned Region Price Rules (Export Fix)  ║")
    console.log("╚══════════════════════════════════════════════════╝\n")

    // ── 1. Find ALL region IDs referenced in price_rule ──────────────────────
    sep()
    console.log("STEP 1 — Price rules that reference a region:")

    const referencedRegions = await client.query(`
      SELECT DISTINCT value AS region_id, COUNT(*) AS rule_count
      FROM price_rule
      WHERE attribute = 'region_id'
      GROUP BY value
      ORDER BY rule_count DESC
    `)

    if (referencedRegions.rows.length === 0) {
      console.log("  ✅ No region-based price rules found — nothing to fix.")
      return
    }

    console.log(`  Found ${referencedRegions.rows.length} unique region(s) in price_rule:`)
    for (const row of referencedRegions.rows) {
      console.log(`  • ${row.region_id}  (${row.rule_count} rule(s))`)
    }

    // ── 2. Find orphaned: hard-deleted OR soft-deleted (deleted_at IS NOT NULL)
    sep()
    console.log("STEP 2 — Checking for hard-deleted AND soft-deleted regions:")

    const regionIds = referencedRegions.rows.map((r: any) => r.region_id)

    // Check which region table columns exist (deleted_at may or may not be present)
    const colCheck = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'region'
    `)
    const cols = colCheck.rows.map((r: any) => r.column_name)
    const hasDeletedAt = cols.includes("deleted_at")

    console.log(`  region table has deleted_at column: ${hasDeletedAt}`)

    // Fetch ACTIVE regions only (not soft-deleted)
    const activeRegionsQuery = hasDeletedAt
      ? `SELECT id FROM region WHERE id = ANY($1::text[]) AND deleted_at IS NULL`
      : `SELECT id FROM region WHERE id = ANY($1::text[])`

    const activeRegions = await client.query(activeRegionsQuery, [regionIds])
    const activeIds = new Set(activeRegions.rows.map((r: any) => r.id))
    const orphanedIds = regionIds.filter((id: string) => !activeIds.has(id))

    // Also show soft-deleted ones specifically
    if (hasDeletedAt) {
      const softDeleted = await client.query(`
        SELECT id, deleted_at FROM region
        WHERE id = ANY($1::text[]) AND deleted_at IS NOT NULL
      `, [regionIds])

      if (softDeleted.rows.length > 0) {
        console.log(`\n  Soft-deleted regions (deleted_at IS NOT NULL):`)
        softDeleted.rows.forEach((r: any) =>
          console.log(`  • ${r.id}  deleted_at: ${r.deleted_at}`)
        )
      }
    }

    if (orphanedIds.length === 0) {
      console.log("\n  ✅ All referenced regions are active — unexpected.")
      console.log("  Check Medusa version — the export bug may be something else.")
      return
    }

    console.log(`\n  ⚠️  ${orphanedIds.length} orphaned region(s) found:`)
    for (const id of orphanedIds) {
      const count = referencedRegions.rows.find((r: any) => r.region_id === id)?.rule_count
      console.log(`  • ${id}  (${count} price_rule row(s) to clean)`)
    }

    // ── 3. Show affected price rules ──────────────────────────────────────────
    sep()
    console.log("STEP 3 — Affected price rules:")

    const affectedPrices = await client.query(`
      SELECT pr.id AS rule_id, pr.price_id, pr.value AS region_id
      FROM price_rule pr
      WHERE pr.attribute = 'region_id'
        AND pr.value = ANY($1::text[])
      ORDER BY pr.price_id
    `, [orphanedIds])

    console.log(`  ${affectedPrices.rows.length} price_rule row(s) to delete.`)
    const preview = affectedPrices.rows.slice(0, 5)
    preview.forEach((r: any) =>
      console.log(`  rule: ${r.rule_id}  price: ${r.price_id}  region: ${r.region_id}`)
    )
    if (affectedPrices.rows.length > 5) {
      console.log(`  ... and ${affectedPrices.rows.length - 5} more`)
    }

    // ── 4. Delete orphaned price_rules ────────────────────────────────────────
    sep()
    console.log("STEP 4 — Deleting orphaned price rules...")

    const deleteResult = await client.query(`
      DELETE FROM price_rule
      WHERE attribute = 'region_id'
        AND value = ANY($1::text[])
    `, [orphanedIds])

    console.log(`  ✅ Deleted ${deleteResult.rowCount} price_rule row(s).`)

    // ── 5. Clean up prices with no rules remaining ────────────────────────────
    sep()
    console.log("STEP 5 — Cleaning up prices with no rules left...")

    const affectedPriceIds = affectedPrices.rows.map((r: any) => r.price_id)

    const orphanedPrices = await client.query(`
      SELECT p.id
      FROM price p
      WHERE p.id = ANY($1::text[])
        AND NOT EXISTS (
          SELECT 1 FROM price_rule pr WHERE pr.price_id = p.id
        )
    `, [affectedPriceIds])

    if (orphanedPrices.rows.length === 0) {
      console.log("  ✅ No ruleless prices found.")
    } else {
      const ids = orphanedPrices.rows.map((r: any) => r.id)
      const del = await client.query(`DELETE FROM price WHERE id = ANY($1::text[])`, [ids])
      console.log(`  ✅ Deleted ${del.rowCount} ruleless price row(s).`)
    }

    // ── 6. Verify ─────────────────────────────────────────────────────────────
    sep()
    console.log("STEP 6 — Verifying...")

    const verifyQuery = hasDeletedAt
      ? `SELECT COUNT(*) AS count FROM price_rule pr
         WHERE pr.attribute = 'region_id'
           AND NOT EXISTS (
             SELECT 1 FROM region r
             WHERE r.id = pr.value AND r.deleted_at IS NULL
           )`
      : `SELECT COUNT(*) AS count FROM price_rule pr
         WHERE pr.attribute = 'region_id'
           AND NOT EXISTS (
             SELECT 1 FROM region r WHERE r.id = pr.value
           )`

    const remaining = await client.query(verifyQuery)
    const leftover = parseInt(remaining.rows[0].count)

    if (leftover === 0) {
      console.log("  ✅ All orphaned region price rules cleaned up.")
      console.log("  ✅ Product export should work now — try it in the admin.\n")
    } else {
      console.log(`  ⚠️  ${leftover} orphaned rule(s) still remain. Run again.`)
    }

    sep()

  } catch (err: any) {
    console.error("\n❌ Script failed:", err.message)
    throw err
  } finally {
    await client.end()
  }
}