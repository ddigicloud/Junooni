// src/scripts/clean-stale-auth-metadata.ts
// Run: npx medusa exec src/scripts/clean-stale-auth-metadata.ts

import pg from "pg"

export default async function cleanStaleAuthMetadata() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not found")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  try {
    console.log("\n========================================")
    console.log("🔍 STALE AUTH METADATA CLEANER")
    console.log("========================================\n")

    // 1. Find all auth identities that have a vendor_id in app_metadata
    console.log("1️⃣  Finding all auth identities with vendor_id in app_metadata...")
    const authResult = await client.query(`
      SELECT
        id,
        app_metadata,
        app_metadata->>'vendor_id' as vendor_id
      FROM auth_identity
      WHERE app_metadata->>'vendor_id' IS NOT NULL
        AND app_metadata->>'vendor_id' != ''
    `)

    console.log(`   Found ${authResult.rows.length} auth identities with vendor_id\n`)

    if (authResult.rows.length === 0) {
      console.log("✅ No auth identities with vendor_id found. Nothing to clean.\n")
      return
    }

    // 2. For each, check if the vendor_id exists in EITHER vendor OR vendor_admin table
    //    NOTE: setAuthAppMetadataStep stores vendor_admin.id (actor_id) as vendor_id,
    //    NOT vendor.id — so we must check both tables.
    const stale: any[] = []
    const valid: any[] = []

    for (const row of authResult.rows) {
      // Check vendor table (some older flows may have stored vendor.id)
      const vendorCheck = await client.query(
        `SELECT id, name, handle FROM vendor WHERE id = $1`,
        [row.vendor_id]
      )
      const vendorExists = vendorCheck.rows.length > 0

      // Check vendor_admin table (setAuthAppMetadataStep stores vendor_admin.id here)
      const adminCheck = await client.query(
        `SELECT va.id, va.vendor_id as linked_vendor_id, v.name as vendor_name, v.handle as vendor_handle
         FROM vendor_admin va
         LEFT JOIN vendor v ON v.id = va.vendor_id
         WHERE va.id = $1`,
        [row.vendor_id]
      )
      const adminExists = adminCheck.rows.length > 0

      if (!vendorExists && !adminExists) {
        stale.push(row)
        console.log(`   ❌ STALE  auth_identity: ${row.id} → vendor_id: ${row.vendor_id} (NOT in vendor or vendor_admin)`)
      } else {
        valid.push(row)
        if (vendorExists) {
          console.log(`   ✅ VALID  auth_identity: ${row.id} → vendor_id: ${row.vendor_id} (vendor: ${vendorCheck.rows[0].name || vendorCheck.rows[0].handle})`)
        } else {
          const admin = adminCheck.rows[0]
          const label = admin.vendor_name || admin.vendor_handle || admin.linked_vendor_id || 'unknown vendor'
          console.log(`   ✅ VALID  auth_identity: ${row.id} → vendor_id: ${row.vendor_id} (vendor_admin → vendor: ${label})`)
        }
      }
    }

    console.log(`\n   Summary: ${valid.length} valid, ${stale.length} stale\n`)

    if (stale.length === 0) {
      console.log("✅ No stale entries found. Nothing to clean.\n")
      // Still run orphan check below
    } else {
      // 3. Clean all stale entries in one SQL statement
      console.log(`2️⃣  Cleaning ${stale.length} stale auth_identity entries...`)

      const cleanResult = await client.query(`
        UPDATE auth_identity
        SET app_metadata = app_metadata - 'vendor_id'
        WHERE app_metadata->>'vendor_id' IS NOT NULL
          AND app_metadata->>'vendor_id' != ''
          AND app_metadata->>'vendor_id' NOT IN (
            SELECT id FROM vendor
          )
          AND app_metadata->>'vendor_id' NOT IN (
            SELECT id FROM vendor_admin
          )
      `)

      console.log(`   🧹 Cleaned ${cleanResult.rowCount} stale entries.\n`)
    }

    // 4. Check for orphaned vendor_admin rows
    console.log("3️⃣  Checking vendor_admin rows for orphaned vendor_id references...")
    const orphanedAdmins = await client.query(`
      SELECT va.id, va.email, va.vendor_id
      FROM vendor_admin va
      LEFT JOIN vendor v ON v.id = va.vendor_id
      WHERE va.vendor_id IS NOT NULL
        AND v.id IS NULL
    `)

    if (orphanedAdmins.rows.length === 0) {
      console.log("   ✅ No orphaned vendor_admin rows found.\n")
    } else {
      console.log(`   Found ${orphanedAdmins.rows.length} orphaned vendor_admin rows:`)
      for (const row of orphanedAdmins.rows) {
        console.log(`   ⚠️  vendor_admin: ${row.id} | email: ${row.email} | stale vendor_id: ${row.vendor_id}`)
      }
      console.log(`\n   These vendor_admin rows point to non-existent vendors.\n`)
    }

    // 5. Verify final state
    console.log("4️⃣  Verifying final state...")

    // Remaining stale = not in vendor AND not in vendor_admin
    const remainingStale = await client.query(`
      SELECT COUNT(*) as count
      FROM auth_identity
      WHERE app_metadata->>'vendor_id' IS NOT NULL
        AND app_metadata->>'vendor_id' != ''
        AND app_metadata->>'vendor_id' NOT IN (
          SELECT id FROM vendor
        )
        AND app_metadata->>'vendor_id' NOT IN (
          SELECT id FROM vendor_admin
        )
    `)

    const remaining = parseInt(remainingStale.rows[0].count)

    // Still valid = in vendor OR in vendor_admin
    const finalValid = await client.query(`
      SELECT COUNT(*) as count
      FROM auth_identity
      WHERE app_metadata->>'vendor_id' IS NOT NULL
        AND app_metadata->>'vendor_id' != ''
        AND (
          app_metadata->>'vendor_id' IN (SELECT id FROM vendor)
          OR app_metadata->>'vendor_id' IN (SELECT id FROM vendor_admin)
        )
    `)

    const stillValid = parseInt(finalValid.rows[0].count)

    console.log("\n========================================")
    console.log("📋 FINAL STATE")
    console.log("========================================")
    console.log(`   ✅ Valid auth identities with vendor_id : ${stillValid}`)
    console.log(`   ${remaining === 0 ? '✅' : '❌'} Remaining stale entries            : ${remaining}`)

    if (remaining === 0) {
      console.log("\n   ✅ All stale entries cleaned successfully.")
      console.log("   Google auth flow should now work correctly.\n")
    } else {
      console.log("\n   ⚠️  Some stale entries remain. Please investigate manually.\n")
    }

    console.log("========================================\n")

  } finally {
    await client.end()
  }
}