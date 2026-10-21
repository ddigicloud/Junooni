// DEBUG FILE — drop this in src/subscribers/debug-export.ts
// Delete after fixing the issue

import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"

export default async function debugExportSubscriber({
  event,
  container,
}: SubscriberArgs<any>) {
  console.log("\n========== EXPORT DEBUG ==========")
  console.log("Event:", event.name)
  console.log("Data:", JSON.stringify(event.data, null, 2))
  console.log("===================================\n")
}

export const config: SubscriberConfig = {
  event: [
    "notification.created",
    "product.export.completed",
    "product.export.failed",
    "product-export-job.completed",
    "product-export-job.failed",
  ],
}