/**
 * JUNOONI MCP Token Store
 *
 * Two-layer auth:
 *   1. Auth codes  — in-memory, 15-min TTL  (OAuth Authorization Code flow)
 *   2. Access tokens — Postgres via pgClient.raw  (persistent, revocable)
 *
 * Table (run once in psql / migration):
 *   CREATE TABLE IF NOT EXISTS mcp_access_tokens (
 *     id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     vendor_id     VARCHAR NOT NULL,
 *     access_token  VARCHAR UNIQUE NOT NULL,
 *     scope         VARCHAR NOT NULL DEFAULT 'read',
 *     label         VARCHAR,
 *     created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *     last_used_at  TIMESTAMPTZ
 *   );
 *   CREATE INDEX IF NOT EXISTS idx_mcp_tokens_token
 *     ON mcp_access_tokens (access_token);
 */

import crypto from "crypto"

// ── Auth code store (in-memory, 15 min TTL) ──────────────────────────────────

interface AuthCodeEntry {
  vendorId:    string
  scope:       string
  redirectUri: string
  expiresAt:   number
}

const authCodeStore = new Map<string, AuthCodeEntry>()
const AUTH_CODE_TTL = 15 * 60 * 1000  // 15 minutes

// Purge expired codes every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [code, entry] of authCodeStore.entries()) {
    if (entry.expiresAt < now) authCodeStore.delete(code)
  }
}, 5 * 60 * 1000)

export function createAuthCode(
  vendorId:    string,
  scope:       string,
  redirectUri: string,
): string {
  const code = "ac_" + crypto.randomBytes(24).toString("hex")
  authCodeStore.set(code, {
    vendorId, scope, redirectUri,
    expiresAt: Date.now() + AUTH_CODE_TTL,
  })
  return code
}

export function redeemAuthCode(code: string): AuthCodeEntry | null {
  const entry = authCodeStore.get(code)
  if (!entry) return null
  if (entry.expiresAt < Date.now()) { authCodeStore.delete(code); return null }
  authCodeStore.delete(code)   // single-use
  return entry
}

// ── Access token helpers ──────────────────────────────────────────────────────

export function generateAccessToken(): string {
  return "jmcp_" + crypto.randomBytes(32).toString("hex")
}

/**
 * Persist a new access token to Postgres.
 * Call this after a successful code exchange.
 */
export async function saveAccessToken(
  pgClient:  any,
  vendorId:  string,
  token:     string,
  scope:     string,
  label?:    string,
): Promise<void> {
  await pgClient.raw(
    `INSERT INTO mcp_access_tokens (vendor_id, access_token, scope, label)
     VALUES (?, ?, ?, ?)`,
    [vendorId, token, scope, label ?? null],
  )
}

/**
 * Validate a Bearer token and return { vendorId, scope } or null.
 * Also bumps last_used_at.
 */
export async function validateAccessToken(
  pgClient: any,
  token:    string,
): Promise<{ vendorId: string; scope: string } | null> {
  try {
    const result = await pgClient.raw(
      `UPDATE mcp_access_tokens
          SET last_used_at = NOW()
        WHERE access_token = ?
       RETURNING vendor_id, scope`,
      [token],
    )
    const row = result.rows?.[0] ?? result[0]?.[0]
    if (!row) return null
    return { vendorId: row.vendor_id, scope: row.scope }
  } catch {
    return null
  }
}

/**
 * List all active tokens for a vendor (for the Studio "Connected apps" page).
 */
export async function listVendorTokens(
  pgClient:  any,
  vendorId:  string,
): Promise<Array<{ id: string; scope: string; label: string | null; createdAt: string; lastUsedAt: string | null }>> {
  try {
    const result = await pgClient.raw(
      `SELECT id, scope, label, created_at, last_used_at
         FROM mcp_access_tokens
        WHERE vendor_id = ?
        ORDER BY created_at DESC`,
      [vendorId],
    )
    const rows = result.rows ?? result[0] ?? []
    return rows.map((r: any) => ({
      id:         r.id,
      scope:      r.scope,
      label:      r.label ?? null,
      createdAt:  r.created_at,
      lastUsedAt: r.last_used_at ?? null,
    }))
  } catch { return [] }
}

/**
 * Revoke a token by ID (not by token value, to avoid leaking it in URLs).
 */
export async function revokeToken(
  pgClient: any,
  id:       string,
  vendorId: string,
): Promise<boolean> {
  try {
    const result = await pgClient.raw(
      `DELETE FROM mcp_access_tokens WHERE id = ? AND vendor_id = ? RETURNING id`,
      [id, vendorId],
    )
    const rows = result.rows ?? result[0] ?? []
    return rows.length > 0
  } catch { return false }
}