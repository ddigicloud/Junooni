// src/api/vendors/me/store/verify-domain/route.ts
//
// POST /vendors/me/store/verify-domain
// Checks if the creator's CNAME record is pointing to their junooni subdomain.
// Uses Node's dns.promises module — no external dependencies needed.

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"
import dns from "dns"
import { promisify } from "util"
import MarketplaceModuleService from "../../../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"

const resolveCname = promisify(dns.resolveCname)

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
  const parsed = BodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      verified: false,
      message: parsed.error.errors[0]?.message ?? "Invalid request",
    })
  }

  const { domain } = parsed.data

  // ── 1. Get vendor + their store ───────────────────────────────────────────
  const vendorId = await getVendorId(req)
  if (!vendorId) {
    return res.status(404).json({ verified: false, message: "Vendor not found" })
  }

  const svc: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const vendor = await svc.retrieveVendor(vendorId, { relations: ["vendor_store"] })

  if (!vendor?.vendor_store) {
    return res.status(404).json({ verified: false, message: "Store not found" })
  }

  const store = vendor.vendor_store
  const expectedTarget = `${store.subdomain ?? vendor.handle}.junooni.com`

  // ── 2. DNS lookup ─────────────────────────────────────────────────────────
  let cnameTargets: string[] = []
  let dnsError: string | null = null

  try {
    cnameTargets = await resolveCname(domain)
  } catch (err: any) {
    // ENOTFOUND = domain doesn't exist at all
    // ENODATA   = domain exists but no CNAME record
    if (err.code === "ENOTFOUND") {
      dnsError = `The domain "${domain}" could not be found. Double-check the spelling.`
    } else if (err.code === "ENODATA" || err.code === "ENORECORDS") {
      dnsError = `No CNAME record found for "${domain}". Make sure you added the CNAME record at your registrar.`
    } else if (err.code === "ETIMEDOUT") {
      dnsError = "DNS lookup timed out. Try again in a moment."
    } else {
      dnsError = `DNS lookup failed (${err.code ?? err.message}). The record may not have propagated yet — DNS changes can take up to 48 hours.`
    }
  }

  if (dnsError) {
    return res.json({ verified: false, message: dnsError })
  }

  // ── 3. Check if any CNAME target matches our expected subdomain ───────────
  // Normalize: strip trailing dot (DNS sometimes returns "host.junooni.com.")
  const normalize = (s: string) => s.toLowerCase().replace(/\.$/, "")

  const matched = cnameTargets.some(
    target => normalize(target) === normalize(expectedTarget)
  )

  if (!matched) {
    const found = cnameTargets.map(t => normalize(t)).join(", ")
    return res.json({
      verified: false,
      message: `CNAME found but points to "${found}" instead of "${expectedTarget}". Update the record at your registrar to point to ${expectedTarget}.`,
      found_targets: cnameTargets,
      expected_target: expectedTarget,
    })
  }

  // ── 4. Mark domain as verified in DB ─────────────────────────────────────
  await svc.updateVendorStores({
    id: store.id,
    custom_domain: domain,
    domain_verified: true,
  })

  return res.json({
    verified: true,
    message: `Domain "${domain}" is correctly pointing to ${expectedTarget}.`,
    domain,
    target: expectedTarget,
  })
}