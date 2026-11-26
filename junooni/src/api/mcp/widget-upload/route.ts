/**
 * POST /api/mcp/widget-upload
 *
 * Receives a file from the JUNOONI gallery widget (MCP App iframe), validates the
 * temp token, uploads via uploadFilesWorkflow, saves it to the creator's gallery,
 * and returns the public URL so the widget can tell Claude which design to use.
 *
 * Place this file at:  src/api/mcp/widget-upload/route.ts
 *
 * Model (marketplace module):
 *   vendor_gallery_image { id, url, file_id (required), filename, size?, mime_type?, vendor → Vendor }
 *
 * Gallery save strategy:
 *   1. Preferred — the module service's createVendorGalleryImages() (generates id,
 *      timestamps, defaults). Set GALLERY_MODULE_KEY to your module's registration
 *      name (the string exported from src/modules/<module>/index.ts); until then it
 *      is auto-discovered from the container.
 *   2. Fallback — raw insert with a Medusa-style generated id.
 *   Logs always say which path was used.
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, generateEntityId } from "@medusajs/utils"
import multer from "multer"
import { uploadTempTokens } from "../../../lib/mcp/uploadTokenStore"
import { uploadFilesWorkflow } from "@medusajs/core-flows"

// ── Config ────────────────────────────────────────────────────────────────────
// Pin once known: the module name exported from the index.ts next to models/vendor.ts
// (e.g. export const MARKETPLACE_MODULE = "marketplace"  →  "marketplace")
const GALLERY_MODULE_KEY: string | null    = null
const GALLERY_CREATE_METHOD                = "createVendorGalleryImages"
const GALLERY_ID_PREFIX                    = "vgimg"

const MAX_BYTES     = 20 * 1024 * 1024
const ALLOWED_MIME  = /^image\/(png|jpe?g|webp|gif|svg\+xml)$/i

// multer keeps the file in memory — fine for design images
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_BYTES } })

// ── CORS ──────────────────────────────────────────────────────────────────────
function cors(res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  cors(res)
  return res.status(204).end()
}

// ── Gallery service discovery (cached after first success) ───────────────────
let cachedGalleryKey: string | null | undefined // undefined = not looked up yet

function findGalleryService(scope: any): { key: string; service: any } | null {
  const tryKey = (key: string) => {
    try {
      const svc = scope.resolve(key)
      if (svc && typeof svc[GALLERY_CREATE_METHOD] === "function") return { key, service: svc }
    } catch { /* not resolvable */ }
    return null
  }

  if (GALLERY_MODULE_KEY) return tryKey(GALLERY_MODULE_KEY)
  if (cachedGalleryKey === null) return null
  if (cachedGalleryKey) return tryKey(cachedGalleryKey)

  const keys: string[] = Object.keys(scope.registrations ?? {})
    .filter((k) => /gallery|marketplace|vendor/i.test(k))
  for (const k of keys) {
    const hit = tryKey(k)
    if (hit) {
      cachedGalleryKey = k
      console.log(`[widget-upload] gallery service discovered: "${k}" — pin it in GALLERY_MODULE_KEY`)
      return hit
    }
  }
  cachedGalleryKey = null
  console.warn(`[widget-upload] no gallery service with ${GALLERY_CREATE_METHOD}() found (checked: ${keys.join(", ") || "none"}) — using raw insert`)
  return null
}

async function saveToGallery(
  scope: any,
  row: { vendor_id: string; url: string; file_id: string; filename: string; size: number; mime_type: string },
): Promise<{ id?: string; via: "service" | "sql" }> {
  const found = findGalleryService(scope)
  if (found) {
    const created = await found.service[GALLERY_CREATE_METHOD]([row])
    const first = Array.isArray(created) ? created[0] : created
    return { id: first?.id, via: "service" }
  }

  const pg = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const id = generateEntityId(undefined, GALLERY_ID_PREFIX)
  await pg.raw(
    `INSERT INTO vendor_gallery_image (id, vendor_id, url, file_id, filename, size, mime_type, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [id, row.vendor_id, row.url, row.file_id, row.filename, row.size, row.mime_type],
  )
  return { id, via: "sql" }
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  cors(res)

  // 1 — validate token
  const token = String((req.query as any).token ?? "")
  const tokenData = uploadTempTokens.get(token)
  if (!tokenData) {
    return res.status(401).json({ ok: false, error: "Upload link expired — ask Claude to reopen the gallery" })
  }
  const vendorId = tokenData.vendorId

  // 2 — parse multipart (return on failure so we never respond twice)
  try {
    await new Promise<void>((resolve, reject) =>
      upload.single("file")(req as any, res as any, (err: any) => (err ? reject(err) : resolve())),
    )
  } catch (err: any) {
    const tooBig = err?.code === "LIMIT_FILE_SIZE"
    return res.status(tooBig ? 413 : 400).json({
      ok: false,
      error: tooBig ? "File too large (max 20 MB)" : "Could not read upload: " + err.message,
    })
  }

  const file = (req as any).file as Express.Multer.File | undefined
  if (!file) {
    return res.status(400).json({ ok: false, error: "No file provided" })
  }
  if (!ALLOWED_MIME.test(file.mimetype)) {
    return res.status(415).json({ ok: false, error: `Unsupported file type: ${file.mimetype}` })
  }

  // 3 — upload to public file storage
  let publicUrl: string
  let fileId: string
  try {
    const { result } = await uploadFilesWorkflow(req.scope).run({
      input: {
        files: [{
          filename: file.originalname,
          mimeType: file.mimetype,
          content:  file.buffer.toString("base64"),
          access:   "public",
        }],
      },
    })
    const uploaded = (result as any)[0]
    publicUrl = uploaded?.url
    fileId    = uploaded?.id   // storage file id — needed later to delete the file
    if (!publicUrl || !fileId) throw new Error("Upload workflow returned no url/id")
  } catch (e: any) {
    console.error("[widget-upload] ❌ uploadFilesWorkflow error:", e)
    return res.status(500).json({ ok: false, error: "File upload failed: " + e.message })
  }

  // 4 — save to the creator's gallery
  let savedToGallery = false
  let galleryId: string | undefined
  let galleryError: string | undefined
  try {
    const saved = await saveToGallery(req.scope, {
      vendor_id: vendorId,
      url:       publicUrl,
      file_id:   fileId,
      filename:  file.originalname,
      size:      file.size,
      mime_type: file.mimetype,
    })
    savedToGallery = true
    galleryId = saved.id
    console.log(`[widget-upload] ✅ saved via ${saved.via} id=${saved.id} vendor=${vendorId} url=${publicUrl}`)
  } catch (e: any) {
    // File is already in storage, so still return its URL — but say the gallery save failed
    galleryError = e.message
    console.error(`[widget-upload] ❌ gallery save failed vendor=${vendorId}:`, e.message)
  }

  return res.json({
    ok:               true,
    url:              publicUrl,
    filename:         file.originalname,
    saved_to_gallery: savedToGallery,
    ...(galleryId    ? { gallery_id: galleryId }       : {}),
    ...(galleryError ? { gallery_error: galleryError } : {}),
  })
}