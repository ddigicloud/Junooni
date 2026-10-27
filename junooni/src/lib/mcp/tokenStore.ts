/**
 * JUNOONI MCP Token Store
 *
 * Two-layer auth:
 *   1. Auth codes   — in-memory, 15-min TTL  (OAuth Authorization Code flow)
 *   2. Access tokens — Medusa module service  (persistent, revocable)
 *
 * Pass `req.scope.resolve("mcpModule")` from your route wherever mcpService is needed.
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
 * Persist a new access token via the MCP module service.
 * Usage: const mcpService = req.scope.resolve("mcpModule")
 */
export async function saveAccessToken(
  mcpService: any,
  vendorId:   string,
  token:      string,
  scope:      string,
  label?:     string,
): Promise<void> {
  await mcpService.createMcpAccessTokens({
    vendor_id:    vendorId,
    access_token: token,
    scope,
    label:        label ?? null,
  })
}

/**
 * Validate a Bearer token and return { vendorId, scope } or null.
 * Also bumps last_used_at (fire-and-forget).
 */
export async function validateAccessToken(
  mcpService: any,
  token:      string,
): Promise<{ vendorId: string; scope: string } | null> {
  try {
    const [record] = await mcpService.listMcpAccessTokens(
      { access_token: token },
      { take: 1 },
    )
    if (!record) return null

    // Bump last_used_at — fire-and-forget
    mcpService.updateMcpAccessTokens(
      { id: record.id },
      { last_used_at: new Date() },
    ).catch(() => {})

    return { vendorId: record.vendor_id, scope: record.scope }
  } catch {
    return null
  }
}

/**
 * List all active tokens for a vendor (for the Studio "Connected apps" page).
 */
export async function listVendorTokens(
  mcpService: any,
  vendorId:   string,
): Promise<Array<{ id: string; scope: string; label: string | null; createdAt: Date; lastUsedAt: Date | null }>> {
  try {
    const records = await mcpService.listMcpAccessTokens({ vendor_id: vendorId })
    return records.map((r: any) => ({
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
 * vendorId check ensures a creator can only revoke their own tokens.
 */
export async function revokeToken(
  mcpService: any,
  id:         string,
  vendorId:   string,
): Promise<boolean> {
  try {
    const [record] = await mcpService.listMcpAccessTokens(
      { id, vendor_id: vendorId },
      { take: 1 },
    )
    if (!record) return false
    await mcpService.deleteMcpAccessTokens([id])
    return true
  } catch { return false }
}