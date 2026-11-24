import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

type BulkEmailBody = {
  emails: string[]
  vendor_names?: Record<string, string>   // email → vendor name, for personalisation
  subject: string
  html_content: string
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { emails, vendor_names = {}, subject, html_content } =
    req.body as BulkEmailBody

  // ── Validate ──────────────────────────────────────────────────────────────
  if (!Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: "emails[] is required and must be non-empty." })
  }
  if (!subject?.trim()) {
    return res.status(400).json({ error: "subject is required." })
  }
  if (!html_content?.trim()) {
    return res.status(400).json({ error: "html_content is required." })
  }

  // ── Deduplicate ───────────────────────────────────────────────────────────
  const uniqueEmails = [...new Set(emails.map(e => e.trim().toLowerCase()).filter(Boolean))]

  // ── Send via Medusa notification module → ResendNotificationProviderService ─
  const notificationService = req.scope.resolve(Modules.NOTIFICATION)

  const results = { sent: 0, failed: 0, errors: [] as { email: string; error: string }[] }

  // Send concurrently in batches of 10 to respect Resend rate limits
  const BATCH_SIZE = 10
  const BATCH_DELAY_MS = 1200  // Resend cap: 10 req/s — 1.2s gives headroom

  for (let i = 0; i < uniqueEmails.length; i += BATCH_SIZE) {
    const batch = uniqueEmails.slice(i, i + BATCH_SIZE)
    await Promise.allSettled(
      batch.map(async (email) => {
        try {
          await notificationService.createNotifications({
            to: email,
            channel: "email",
            template: "custom-html",
            data: {
              subject: subject.trim(),
              html_content,
              vendor_name: vendor_names[email] ?? "",
            },
          })
          results.sent++
        } catch (err: any) {
          results.failed++
          results.errors.push({ email, error: err?.message ?? "unknown error" })
        }
      })
    )
    // Pause between batches to stay under Resend's 10 req/s limit
    if (i + BATCH_SIZE < uniqueEmails.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
    }
  }

  return res.json({
    success: true,
    sent: results.sent,
    failed: results.failed,
    ...(results.errors.length > 0 ? { errors: results.errors } : {}),
  })
}