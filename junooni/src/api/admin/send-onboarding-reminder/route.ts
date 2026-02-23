// src/api/admin/send-onboarding-reminder/route.ts

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { email } = req.body as { email: string }

  if (!email) {
    return res.status(400).json({ error: "Email is required" })
  }

  try {
    const notificationService = req.scope.resolve(Modules.NOTIFICATION)

    await notificationService.createNotifications({
      to: email,
      channel: "email",
      template: "onboarding-reminder", // matches your notification provider template key
      data: {
        email,
        studio_url: "https://studio.junooni.com",
        store_url: "https://junooni.com",
        subject: "Complete your Junooni Creator onboarding 🎨",
      },
    })

    return res.json({
      success: true,
      message: `Onboarding reminder sent to ${email}`,
    })
  } catch (error) {
    console.error("Failed to send onboarding reminder:", error)
    return res.status(500).json({
      error: "Failed to send email",
      details: error.message,
    })
  }
}