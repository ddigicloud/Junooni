// src/scripts/add-store-password.ts
// Run: npx medusa exec src/scripts/add-store-password.ts

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function addStorePassword({ container }: ExecArgs) {
  // Medusa v2 exposes the raw pg client via the query module's internal manager
  // The correct way is to use the module's pgConnection directly
  const pgConnection = container.resolve("pgConnection") as any

  try {
    // Check existing columns
    const checkResult = await pgConnection.raw(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'vendor_store' 
      AND column_name IN ('password_enabled', 'store_password')
    `)

    const existingColumns = checkResult.rows.map((r: any) => r.column_name)
    console.log("Existing columns:", existingColumns)

    if (!existingColumns.includes("password_enabled")) {
      await pgConnection.raw(`
        ALTER TABLE vendor_store 
        ADD COLUMN password_enabled boolean NOT NULL DEFAULT false
      `)
      console.log("✅ Added password_enabled column")
    } else {
      console.log("⏭️  password_enabled already exists")
    }

    if (!existingColumns.includes("store_password")) {
      await pgConnection.raw(`
        ALTER TABLE vendor_store 
        ADD COLUMN store_password text NULL
      `)
      console.log("✅ Added store_password column")
    } else {
      console.log("⏭️  store_password already exists")
    }

    console.log("✅ Migration complete.")
  } catch (err) {
    console.error("❌ Migration failed:", err)
    throw err
  }
}