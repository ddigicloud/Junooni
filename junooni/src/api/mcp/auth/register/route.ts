import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS(_req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  return res.status(204).send("")
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  const body = req.body as any

  return res.status(201).json({
    client_id:                  body?.client_name ?? "chatgpt",
    client_secret:              null,
    redirect_uris:              body?.redirect_uris ?? [],
    token_endpoint_auth_method: "none",
  })
}