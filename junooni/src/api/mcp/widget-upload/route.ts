/**
 * POST /api/mcp/widget-upload
 *
 * Receives a file from the gallery widget iframe, validates the temp token,
 * uploads via uploadFilesWorkflow, saves to vendor_gallery_image, and returns
 * the public URL so the widget can notify the MCP host.
 *
 * Place this file at:  src/api/mcp/widget-upload/route.ts
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/utils"
import multer from "multer"
import { uploadTempTokens } from "../../../lib/mcp/uploadTokenStore"
import { uploadFilesWorkflow } from "@medusajs/core-flows"

// multer keeps file in memory — fine for design images (< 20 MB typically)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } })

// ── CORS helper ──────────────────────────────────────────────────────────────
function cors(res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

// ── OPTIONS pre-flight ───────────────────────────────────────────────────────
export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  cors(res)
  return res.status(204).end()
}

// ── POST ─────────────────────────────────────────────────────────────────────
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  cors(res)

  // 1 — validate token
  const token = String((req.query as any).token ?? "")
  const tokenData = uploadTempTokens.get(token)
  if (!tokenData) {
    return res.status(401).json({ ok: false, error: "Invalid or expired upload token" })
  }

  const vendorId = tokenData.vendorId

  // 2 — parse multipart via multer (promisified)
  await new Promise<void>((resolve, reject) => {
    upload.single("file")(req as any, res as any, (err: any) => {
      if (err) reject(err)
      else resolve()
    })
  }).catch((err) => {
    return res.status(400).json({ ok: false, error: "Multipart parse error: " + err.message })
  })

  const file = (req as any).file as Express.Multer.File | undefined
  if (!file) {
    return res.status(400).json({ ok: false, error: "No file provided" })
  }

  // 3 — upload to public file storage
  let publicUrl: string
  try {
    const { result } = await uploadFilesWorkflow(req.scope).run({
      input: {
        files: [
          {
            filename: file.originalname,
            mimeType: file.mimetype,
            content: file.buffer.toString("base64"),
            access: "public",
          },
        ],
      },
    })
    publicUrl = (result as any)[0]?.url
    if (!publicUrl) throw new Error("No URL returned from upload workflow")
  } catch (e: any) {
    console.error("[widget-upload] uploadFilesWorkflow error:", e)
    return res.status(500).json({ ok: false, error: "File upload failed: " + e.message })
  }

  // 4 — save to vendor_gallery_image
  try {
    const pgClient = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    await pgClient.raw(
      `INSERT INTO vendor_gallery_image (vendor_id, url, filename, size, mime_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [vendorId, publicUrl, file.originalname, file.size, file.mimetype]
    )
    console.log(`[widget-upload] saved gallery image for vendor=${vendorId} url=${publicUrl}`)
  } catch (e: any) {
    // Don't fail — the file is already uploaded; just warn
    console.warn("[widget-upload] DB insert failed:", e.message)
  }

  return res.json({ ok: true, url: publicUrl, filename: file.originalname })
}