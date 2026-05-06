// src/scripts/debug-vendor.ts
// Run: npx medusa exec src/scripts/debug-vendor.ts

import pg from "pg"

const VENDOR_ADMIN_ID = "01KJ501781WNWNKR5CKJZDHDPA"

export default async function debugVendor() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not found")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  try {
    console.log("\n========================================")
    console.log("🔍 VENDOR DEBUG SCRIPT")
    console.log("========================================\n")

    // 1. Check vendor_admin record
    console.log(`1️⃣  Looking up vendor_admin: ${VENDOR_ADMIN_ID}`)
    const vaResult = await client.query(
      `SELECT id, email, first_name, last_name, vendor_id, created_at
       FROM vendor_admin
       WHERE id = $1`,
      [VENDOR_ADMIN_ID]
    )

    if (vaResult.rows.length === 0) {
      console.log("❌ NO vendor_admin found with this ID!")
      console.log("   → This means the JWT actor_id does not match any vendor_admin row.")
      console.log("   → The token may be stale or from a deleted account.\n")
    } else {
      const va = vaResult.rows[0]
      console.log("✅ vendor_admin found:")
      console.log(`   id         : ${va.id}`)
      console.log(`   email      : ${va.email}`)
      console.log(`   name       : ${va.first_name} ${va.last_name}`)
      console.log(`   vendor_id  : ${va.vendor_id ?? "⚠️  NULL — not linked to any vendor!"}`)
      console.log(`   created_at : ${va.created_at}\n`)

      // 2. If vendor_id exists, fetch vendor
      if (va.vendor_id) {
        console.log(`2️⃣  Looking up vendor: ${va.vendor_id}`)
        const vResult = await client.query(
          `SELECT id, name, handle, plan, sell_on_marketplace, sell_on_own_store, created_at
           FROM vendor
           WHERE id = $1`,
          [va.vendor_id]
        )

        if (vResult.rows.length === 0) {
          console.log("❌ NO vendor found with vendor_id from vendor_admin!")
          console.log("   → vendor_admin.vendor_id points to a non-existent vendor row.\n")
        } else {
          const v = vResult.rows[0]
          console.log("✅ vendor found:")
          console.log(`   id                   : ${v.id}`)
          console.log(`   name                 : ${v.name}`)
          console.log(`   handle               : ${v.handle}`)
          console.log(`   plan                 : ${v.plan ?? "not set"}`)
          console.log(`   sell_on_marketplace  : ${v.sell_on_marketplace}`)
          console.log(`   sell_on_own_store    : ${v.sell_on_own_store}`)
          console.log(`   created_at           : ${v.created_at}\n`)
        }
      } else {
        console.log("⏭️  Skipping vendor lookup — vendor_admin.vendor_id is NULL\n")
      }
    }

    // 3. Also look up vendor by the known correct ID from admin panel
    const KNOWN_VENDOR_ID = "01KJ50176GDA5B0W7228VZNSR8"
    console.log(`3️⃣  Looking up known vendor ID from admin panel: ${KNOWN_VENDOR_ID}`)
    const knownVResult = await client.query(
      `SELECT id, name, handle, plan, sell_on_marketplace, sell_on_own_store
       FROM vendor
       WHERE id = $1`,
      [KNOWN_VENDOR_ID]
    )

    if (knownVResult.rows.length === 0) {
      console.log("❌ No vendor found with the known vendor ID either!\n")
    } else {
      const kv = knownVResult.rows[0]
      console.log("✅ Known vendor found:")
      console.log(`   id                   : ${kv.id}`)
      console.log(`   name                 : ${kv.name}`)
      console.log(`   handle               : ${kv.handle}`)
      console.log(`   plan                 : ${kv.plan ?? "not set"}`)
      console.log(`   sell_on_marketplace  : ${kv.sell_on_marketplace}`)
      console.log(`   sell_on_own_store    : ${kv.sell_on_own_store}\n`)
    }

    // 4. Check what vendor_admins are linked to the known vendor
    console.log(`4️⃣  vendor_admins linked to known vendor ${KNOWN_VENDOR_ID}:`)
    const linkedAdmins = await client.query(
      `SELECT id, email, first_name, last_name, vendor_id
       FROM vendor_admin
       WHERE vendor_id = $1`,
      [KNOWN_VENDOR_ID]
    )

    if (linkedAdmins.rows.length === 0) {
      console.log("❌ No vendor_admins linked to this vendor!\n")
    } else {
      linkedAdmins.rows.forEach((a, i) => {
        console.log(`   [${i + 1}] id: ${a.id} | email: ${a.email} | vendor_id: ${a.vendor_id}`)
      })
      console.log()
    }

    // 5. Summary diagnosis
    console.log("========================================")
    console.log("📋 DIAGNOSIS SUMMARY")
    console.log("========================================")

    const vaRow = vaResult.rows[0]
    if (!vaRow) {
      console.log("🔴 ISSUE: JWT actor_id has no matching vendor_admin row.")
      console.log("   FIX   : Check if this vendor_admin was deleted, or if the wrong token is being used.")
    } else if (!vaRow.vendor_id) {
      console.log("🔴 ISSUE: vendor_admin exists but vendor_id is NULL.")
      console.log(`   FIX   : Run this SQL to link it:`)
      console.log(`   UPDATE vendor_admin SET vendor_id = '${KNOWN_VENDOR_ID}' WHERE id = '${VENDOR_ADMIN_ID}';`)
    } else if (vaRow.vendor_id !== KNOWN_VENDOR_ID) {
      console.log("🟡 ISSUE: vendor_admin.vendor_id does not match the known correct vendor ID.")
      console.log(`   vendor_admin.vendor_id : ${vaRow.vendor_id}`)
      console.log(`   known correct vendor   : ${KNOWN_VENDOR_ID}`)
      console.log(`   FIX   : Run this SQL to correct it:`)
      console.log(`   UPDATE vendor_admin SET vendor_id = '${KNOWN_VENDOR_ID}' WHERE id = '${VENDOR_ADMIN_ID}';`)
    } else {
      console.log("✅ vendor_admin.vendor_id correctly points to the known vendor.")
      console.log("   The /vendors/me route should work. Check server logs for other errors.")
    }

    console.log("\n========================================\n")

  } finally {
    await client.end()
  }
}