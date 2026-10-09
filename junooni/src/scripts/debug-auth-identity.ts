// src/scripts/debug-auth-identity.ts
// Run: npx medusa exec src/scripts/debug-auth-identity.ts

import pg from "pg"

const EMAIL = "mdigicloud@gmail.com"

export default async function debugAuthIdentity() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not found")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  try {
    console.log("\n========================================")
    console.log("🔍 AUTH IDENTITY DEBUGGER")
    console.log(`   Email: ${EMAIL}`)
    console.log("========================================\n")

    // 1. Find all provider_identities for this email
    console.log("1️⃣  Finding all provider_identities for this email...")
    const piResult = await client.query(`
      SELECT 
        pi.id as pi_id,
        pi.provider,
        pi.entity_id,
        pi.auth_identity_id,
        pi.user_metadata,
        ai.id as ai_id,
        ai.app_metadata
      FROM provider_identity pi
      JOIN auth_identity ai ON ai.id = pi.auth_identity_id
      WHERE 
        pi.entity_id ILIKE $1
        OR (pi.user_metadata->>'email') ILIKE $1
    `, [EMAIL])

    console.log(`   Found ${piResult.rows.length} provider_identity entries\n`)

    for (const row of piResult.rows) {
      console.log(`   ── Provider Identity ──────────────────`)
      console.log(`   pi_id              : ${row.pi_id}`)
      console.log(`   provider           : ${row.provider}`)
      console.log(`   entity_id          : ${row.entity_id}`)
      console.log(`   auth_identity_id   : ${row.ai_id}`)
      console.log(`   user_metadata      : ${JSON.stringify(row.user_metadata)}`)
      console.log(`   app_metadata       : ${JSON.stringify(row.app_metadata)}`)
      console.log(`   vendor_id in meta  : ${row.app_metadata?.vendor_id ?? '❌ NOT SET'}`)
      console.log()
    }

    // 2. Check all auth_identities with vendor_id set
    console.log("2️⃣  All auth_identities with vendor_id in app_metadata...")
    const allStaleResult = await client.query(`
      SELECT 
        ai.id,
        ai.app_metadata,
        ai.app_metadata->>'vendor_id' as vendor_id,
        array_agg(pi.entity_id) as entity_ids,
        array_agg(pi.provider) as providers
      FROM auth_identity ai
      LEFT JOIN provider_identity pi ON pi.auth_identity_id = ai.id
      WHERE ai.app_metadata->>'vendor_id' IS NOT NULL
        AND ai.app_metadata->>'vendor_id' != ''
      GROUP BY ai.id, ai.app_metadata
      ORDER BY ai.id
    `)

    console.log(`   Found ${allStaleResult.rows.length} auth_identities with vendor_id\n`)

    for (const row of allStaleResult.rows) {
      const vendorCheck = await client.query(
        `SELECT id FROM vendor WHERE id = $1`,
        [row.vendor_id]
      )
      const vendorExists = vendorCheck.rows.length > 0

      const adminCheck = await client.query(
        `SELECT id, vendor_id FROM vendor_admin WHERE id = $1`,
        [row.vendor_id]
      )
      const isAdminId = adminCheck.rows.length > 0

      console.log(`   auth_identity: ${row.id}`)
      console.log(`   providers    : ${row.providers?.join(', ')}`)
      console.log(`   entity_ids   : ${row.entity_ids?.join(', ')}`)
      console.log(`   vendor_id    : ${row.vendor_id}`)
      console.log(`   vendor exists: ${vendorExists ? '✅ YES' : '❌ NO — STALE'}`)
      console.log(`   is admin id  : ${isAdminId ? `⚠️  YES (vendor_admin.vendor_id = ${adminCheck.rows[0]?.vendor_id})` : 'no'}`)
      console.log()
    }

    // 3. Specifically find all auth_identities linked to this email
    console.log("3️⃣  All auth_identities linked to this email...")
    const emailResult = await client.query(`
      SELECT DISTINCT ai.id, ai.app_metadata
      FROM auth_identity ai
      JOIN provider_identity pi ON pi.auth_identity_id = ai.id
      WHERE 
        pi.entity_id ILIKE $1
        OR (pi.user_metadata->>'email') ILIKE $1
    `, [EMAIL])

    console.log(`   Found ${emailResult.rows.length} auth_identity rows for this email\n`)
    for (const row of emailResult.rows) {
      console.log(`   auth_identity: ${row.id}`)
      console.log(`   app_metadata : ${JSON.stringify(row.app_metadata)}`)
      console.log()
    }

    // 4. Summary
    console.log("========================================")
    console.log("📋 DIAGNOSIS")
    console.log("========================================")

    if (piResult.rows.length === 0) {
      console.log("❌ No provider_identity found for this email.")
    } else {
      const withVendorId = piResult.rows.filter(r => r.app_metadata?.vendor_id)
      console.log(`   Total provider_identities found : ${piResult.rows.length}`)
      console.log(`   With vendor_id set              : ${withVendorId.length}`)

      if (withVendorId.length > 1) {
        console.log(`\n⚠️  MULTIPLE identities with vendor_id — this is the bug!`)
        console.log(`   Run this SQL to clean all of them:\n`)
        for (const row of withVendorId) {
          console.log(`   UPDATE auth_identity SET app_metadata = app_metadata - 'vendor_id' WHERE id = '${row.ai_id}';`)
        }
      } else if (withVendorId.length === 1) {
        console.log(`\n   Only 1 identity has vendor_id — the second stale one`)
        console.log(`   must be under a different email or auth_identity not linked`)
        console.log(`   to any provider_identity. Check section 2 output above.`)
      } else {
        console.log(`\n✅ No vendor_id set on any identity for this email — looks clean.`)
      }
    }

    console.log("\n========================================\n")

  } finally {
    await client.end()
  }
}