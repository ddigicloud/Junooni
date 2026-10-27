// src/scripts/create-mcp-tokens-table.ts
// Run: npx medusa exec src/scripts/create-mcp-tokens-table.ts

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function createMcpTokensTable({ container }: ExecArgs) {
  const pgClient = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  console.log("Creating mcp_access_tokens table...")

  await pgClient.raw(`
    CREATE TABLE IF NOT EXISTS mcp_access_tokens (
      id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
      vendor_id     VARCHAR      NOT NULL,
      access_token  VARCHAR      UNIQUE NOT NULL,
      scope         VARCHAR      NOT NULL DEFAULT 'read',
      label         VARCHAR,
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      last_used_at  TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS idx_mcp_tokens_token
      ON mcp_access_tokens (access_token);

    CREATE INDEX IF NOT EXISTS idx_mcp_tokens_vendor
      ON mcp_access_tokens (vendor_id);
  `)

  console.log("✓ Done — mcp_access_tokens table created")
  console.log("  Columns: id, vendor_id, access_token, scope, label, created_at, last_used_at")
  console.log("  Indexes: access_token (unique lookup), vendor_id (list tokens per vendor)")
}