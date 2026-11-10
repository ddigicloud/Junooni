// src/lib/mcp/uploadTokenStore.ts
// In-memory store for artwork upload sessions (MCP widget upload flow)

export interface UploadTokenData {
  vendorId: string
  createdAt: number
}

export interface UploadResult {
  design_session_id: string
  filename: string
  completedAt: number
}

/** Tokens issued by create_upload_session — deleted the moment the file arrives */
export const uploadTempTokens = new Map<string, UploadTokenData>()

/** Results stored after the browser widget uploads — Claude reads these via check_upload */
export const uploadResults = new Map<string, UploadResult>()

export function generateUploadToken(): string {
  return "up_" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

// Purge stale entries every 5 minutes (tokens expire after 1 hour)
setInterval(() => {
  const cutoff = Date.now() - 3_600_000
  for (const [k, v] of uploadTempTokens) {
    if (v.createdAt < cutoff) uploadTempTokens.delete(k)
  }
  for (const [k, v] of uploadResults) {
    if (v.completedAt < cutoff) uploadResults.delete(k)
  }
}, 300_000)