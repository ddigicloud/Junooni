// src/scripts/restore-auth-metadata.ts
// Run: npx medusa exec src/scripts/restore-auth-metadata.ts
//
// PURPOSE: Restore vendor_id in auth_identity.app_metadata for all vendors
// whose metadata was wiped by the broken clean-stale-auth-metadata script.
//
// HOW IT WORKS:
// - For each provider_identity row, finds the matching vendor_admin by email
// - If vendor_admin exists but auth_identity.app_metadata has no vendor_id → restores it
// - Only restores; never deletes or overwrites a vendor_id that is already set

import pg from "pg"

export default async function restoreAuthMetadata() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not found")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  try {
    console.log("\n========================================")
    console.log("🔧 AUTH METADATA RESTORE SCRIPT")
    console.log("========================================\n")

    // 1. Find all auth_identities that are MISSING vendor_id in app_metadata
    //    but have a matching vendor_admin (by email via provider_identity)
    console.log("1️⃣  Finding auth_identities with missing vendor_id...")
    const missing = await client.query(`
      SELECT DISTINCT
        ai.id as auth_identity_id,
        ai.app_metadata,
        pi.entity_id as email,
        pi.provider
      FROM auth_identity ai
      JOIN provider_identity pi ON pi.auth_identity_id = ai.id
      WHERE (
        ai.app_metadata->>'vendor_id' IS NULL
        OR ai.app_metadata->>'vendor_id' = ''
      )
      ORDER BY ai.id
    `)

    console.log(`   Found ${missing.rows.length} auth_identities missing vendor_id\n`)

    if (missing.rows.length === 0) {
      console.log("✅ All auth_identities already have vendor_id set. Nothing to restore.\n")
      return
    }

    let restored = 0
    let skipped = 0
    let notFound = 0

    for (const row of missing.rows) {
      // Extract email — for Google, entity_id is the Google sub ID, not email
      // So check user_metadata->>'email' first, then entity_id
      const emailResult = await client.query(`
        SELECT
          COALESCE(user_metadata->>'email', entity_id) as email,
          provider
        FROM provider_identity
        WHERE auth_identity_id = $1
        LIMIT 1
      `, [row.auth_identity_id])

      const email = emailResult.rows[0]?.email
      const provider = emailResult.rows[0]?.provider

      if (!email || !email.includes('@')) {
        console.log(`   ⏭️  SKIP  auth_identity: ${row.auth_identity_id} — no email found (provider: ${provider})`)
        skipped++
        continue
      }

      // Find vendor_admin by email
      const adminResult = await client.query(`
        SELECT va.id as admin_id, va.vendor_id, v.name as vendor_name, v.handle
        FROM vendor_admin va
        LEFT JOIN vendor v ON v.id = va.vendor_id
        WHERE LOWER(va.email) = LOWER($1)
        LIMIT 1
      `, [email])

      if (adminResult.rows.length === 0) {
        console.log(`   ❓ NO MATCH  auth_identity: ${row.auth_identity_id} | email: ${email} — no vendor_admin found`)
        notFound++
        continue
      }

      const admin = adminResult.rows[0]

      // Restore: set vendor_id to vendor_admin.id, keep existing app_metadata fields
      const currentMeta = row.app_metadata || {}
      const newMeta = {
        ...currentMeta,
        vendor_id: admin.admin_id,
        actor_type: "vendor",
      }

      await client.query(`
        UPDATE auth_identity
        SET app_metadata = $1::jsonb
        WHERE id = $2
      `, [JSON.stringify(newMeta), row.auth_identity_id])

      const label = admin.vendor_name || admin.handle || admin.vendor_id || 'unknown'
      console.log(`   ✅ RESTORED  auth_identity: ${row.auth_identity_id} | email: ${email} | vendor_admin.id: ${admin.admin_id} | vendor: ${label}`)
      restored++
    }

    // 2. Summary
    console.log("\n========================================")
    console.log("📋 RESTORE SUMMARY")
    console.log("========================================")
    console.log(`   ✅ Restored : ${restored}`)
    console.log(`   ⏭️  Skipped  : ${skipped}  (no email in provider_identity)`)
    console.log(`   ❓ Not found: ${notFound}  (no vendor_admin with that email)`)

    // 3. Final verification
    console.log("\n4️⃣  Final verification...")
    const finalCheck = await client.query(`
      SELECT COUNT(*) as count
      FROM auth_identity ai
      JOIN provider_identity pi ON pi.auth_identity_id = ai.id
      WHERE (
        ai.app_metadata->>'vendor_id' IS NULL
        OR ai.app_metadata->>'vendor_id' = ''
      )
    `)
    const stillMissing = parseInt(finalCheck.rows[0].count)
    console.log(`   Auth identities still missing vendor_id: ${stillMissing}`)

    if (stillMissing === 0) {
      console.log("\n   ✅ All auth_identities restored. Vendors can sign in again.\n")
    } else {
      console.log(`\n   ⚠️  ${stillMissing} identities still missing vendor_id.`)
      console.log("   These may be sign-up-only accounts that never completed onboarding.\n")
    }

    console.log("========================================\n")

  } finally {
    await client.end()
  }
}