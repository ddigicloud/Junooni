// src/api/vendors/me/store/verify-domain/route.ts
//
// POST /vendors/me/store/verify-domain
// Verifies a custom domain by checking its A record points to our VPS IP.
// Supports both apex domains (yourdomain.com) and subdomains (store.yourdomain.com).
// A record is simpler and works universally — CNAME fails on apex domains.

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"
import dns from "dns"
import { promisify } from "util"
import MarketplaceModuleService from "../../../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"

const resolveA    = promisify(dns.resolve4)  // IPv4 A records
const resolveAAAA = promisify(dns.resolve6)  // IPv6 AAAA records (optional)

// Your VPS public IP — set in environment
const VPS_IP = process.env.VPS_PUBLIC_IP ?? ""

// ─── Helper ───────────────────────────────────────────────────────────────────

async function getVendorId(req: AuthenticatedMedusaRequest): Promise<string | null> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  if (req.auth_context?.actor_type === "vendor") {
    const { data: [vendorAdmin] } = await query.graph({
      entity: "vendor_admin",
      fields: ["vendor.id"],
      filters: { id: [req.auth_context.actor_id] },
    })
    return vendorAdmin?.vendor?.id ?? null
  }

  if (req.auth_context?.actor_type === "user") {
    return (req.query.vendor_id as string) ?? null
  }

  return null
}

// ─── POST /vendors/me/store/verify-domain ─────────────────────────────────────

const BodySchema = z.object({
  domain: z.string().min(3, "Domain is required"),
})

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  if (!VPS_IP) {
    return res.status(500).json({
      verified: false,
      message: "Server misconfiguration: VPS_PUBLIC_IP env variable not set.",
    })
  }

  const parsed = BodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      verified: false,
      message: parsed.error.errors[0]?.message ?? "Invalid request",
    })
  }

  const { domain } = parsed.data

  // ── 1. Get vendor store ───────────────────────────────────────────────────
  const vendorId = await getVendorId(req)
  if (!vendorId) {
    return res.status(404).json({ verified: false, message: "Vendor not found" })
  }

  const svc: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const vendor = await svc.retrieveVendor(vendorId, { relations: ["vendor_store"] })

  if (!vendor?.vendor_store) {
    return res.status(404).json({ verified: false, message: "Store not found" })
  }

  // ── 2. DNS lookup — check A record points to our VPS IP ──────────────────
  let aRecords: string[] = []
  let dnsError: string | null = null

  try {
    aRecords = await resolveA(domain)
  } catch (err: any) {
    if (err.code === "ENOTFOUND") {
      dnsError = `"${domain}" could not be found in DNS. Double-check the spelling, or the record hasn't propagated yet.`
    } else if (err.code === "ENODATA" || err.code === "ENORECORDS") {
      dnsError = `No A record found for "${domain}". Make sure you added the A record at your registrar pointing to ${VPS_IP}.`
    } else if (err.code === "ETIMEDOUT") {
      dnsError = "DNS lookup timed out. Try again in a moment."
    } else {
      dnsError = `DNS lookup failed (${err.code ?? err.message}). DNS changes can take up to 48 hours to propagate.`
    }
  }

  if (dnsError) {
    return res.json({ verified: false, message: dnsError })
  }

  // ── 3. Check if any resolved IP matches our VPS ───────────────────────────
  const matched = aRecords.includes(VPS_IP)

  if (!matched) {
    const found = aRecords.join(", ")
    return res.json({
      verified: false,
      message: `A record found but points to ${found} instead of ${VPS_IP}. Update the record at your registrar.`,
      found_ips: aRecords,
      expected_ip: VPS_IP,
    })
  }

  // ── 4. Mark as verified in DB ─────────────────────────────────────────────
  await svc.updateVendorStores({
    id: vendor.vendor_store.id,
    custom_domain: domain,
    domain_verified: true,
  })

  return res.json({
    verified: true,
    message: `Domain "${domain}" is correctly pointing to Junooni.`,
    domain,
  })
}