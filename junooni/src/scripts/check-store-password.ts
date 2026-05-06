// src/scripts/check-store-password.ts
// Run: npx medusa exec src/scripts/check-store-password.ts

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function checkStorePassword({ container }: ExecArgs) {
  const vendorId = "01KJ50176GDA5B0W7228VZNSR8"

  try {
    // Medusa v2 latest — use the query module
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: stores } = await query.graph({
      entity: "vendor_store",
      fields: [
        "id",
        "subdomain",
        "custom_domain",
        "status",
        "template",
        "domain_verified",
        "password_enabled",
        "store_password",
        "vendor.id",
        "vendor.name",
      ],
      filters: {
        vendor: {
          id: vendorId,
        },
      },
    })

    if (!stores || stores.length === 0) {
      console.log("❌ No store found for vendor:", vendorId)
      return
    }

    const store = stores[0]
    console.log("\n📦 Store Data for vendor:", vendorId)
    console.log("─────────────────────────────────────────")
    console.log("Store ID        :", store.id)
    console.log("Vendor Name     :", store.vendor?.name)
    console.log("Subdomain       :", store.subdomain)
    console.log("Custom Domain   :", store.custom_domain)
    console.log("Status          :", store.status)
    console.log("Template        :", store.template)
    console.log("Domain Verified :", store.domain_verified)
    console.log("Password Enabled:", store.password_enabled)
    console.log("Store Password  :", store.store_password ?? "(not set)")
    console.log("─────────────────────────────────────────\n")
  } catch (err) {
    console.error("❌ Query failed:", err)
    throw err
  }
}