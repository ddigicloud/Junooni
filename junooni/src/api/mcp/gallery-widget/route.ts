import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { GALLERY_WIDGET_HTML } from "../../../lib/mcp/galleryWidget"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Content-Type", "text/html")
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("X-Frame-Options", "ALLOWALL")
  res.setHeader("Content-Security-Policy", "frame-ancestors *")
  return res.send(GALLERY_WIDGET_HTML)
}