// src/api/admin/products/imports/[transaction_id]/confirm/route.ts
//
// Admin UI calls this after the upload step.
// Import already ran in the POST /admin/products/imports handler.
// Just acknowledge so the UI shows success.

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  return res.json({ acknowledged: true })
}