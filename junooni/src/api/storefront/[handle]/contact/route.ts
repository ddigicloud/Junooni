import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import nodemailer from "nodemailer"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  try {
    const { handle } = req.params
    const { name, email, orderNumber, category, message, storeName } = req.body as any

    // Validate required fields
    if (!name || !email || !message) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: name, email, and message are required"
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, error: "Invalid email format" })
      return
    }

    const SMTP_HOST    = process.env.SMTP_HOST
    const SMTP_PORT    = parseInt(process.env.SMTP_PORT || "587")
    const SMTP_USER    = process.env.SMTP_USER
    const SMTP_PASS    = process.env.SMTP_PASS
    const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@junooni.com"

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      res.status(500).json({ success: false, error: "Email system configuration error" })
      return
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      authMethod: "LOGIN",
      tls: { rejectUnauthorized: false },
    })

    await transporter.verify()

    const displayStoreName = storeName || handle
    const submittedAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

    // ── Email to support@junooni.com ────────────────────────────────────────
    const supportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .header { background: linear-gradient(135deg, #e65100, #ac1900); padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .header h2 { margin: 0; color: white; }
          .store-badge { display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; margin-top: 8px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .value { margin-top: 4px; font-size: 15px; }
          .message-box { background: #f8f9fa; padding: 15px; border-left: 4px solid #e65100; margin-top: 8px; border-radius: 0 5px 5px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📋 New Contact Form Submission</h2>
            <div class="store-badge">From: ${displayStoreName} Store</div>
          </div>
          <div class="field">
            <div class="label">Name</div>
            <div class="value">${name}</div>
          </div>
          <div class="field">
            <div class="label">Email</div>
            <div class="value"><a href="mailto:${email}">${email}</a></div>
          </div>
          ${orderNumber ? `
          <div class="field">
            <div class="label">Order Number</div>
            <div class="value">${orderNumber}</div>
          </div>` : ""}
          ${category ? `
          <div class="field">
            <div class="label">Category</div>
            <div class="value">${category}</div>
          </div>` : ""}
          <div class="field">
            <div class="label">Message</div>
            <div class="message-box">${message.replace(/\n/g, "<br>")}</div>
          </div>
          <div class="footer">
            <p>Submitted via <strong>${displayStoreName}</strong> creator store contact form</p>
            <p>Store handle: <strong>${handle}</strong></p>
            <p>Received at: ${submittedAt}</p>
          </div>
        </div>
      </body>
      </html>
    `

    // ── Confirmation email to customer ──────────────────────────────────────
    const customerHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0; }
          .header h2 { color: #e65100; margin: 0; }
          .content { background: #f8f9fa; padding: 24px; border-radius: 8px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ We got your message!</h2>
            <p style="color:#666">From ${displayStoreName}</p>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thanks for reaching out! We've received your message and our team will get back to you within <strong>24-48 hours</strong>.</p>
            ${category ? `<p><strong>Category:</strong> ${category}</p>` : ""}
            ${orderNumber ? `<p><strong>Order Number:</strong> ${orderNumber}</p>` : ""}
            <p><strong>Your message:</strong></p>
            <blockquote style="background:white;padding:15px;border-radius:5px;border-left:3px solid #e65100;margin:10px 0;">
              ${message.replace(/\n/g, "<br>")}
            </blockquote>
            <p style="margin-top:20px">Need faster help? Email us directly at <a href="mailto:support@junooni.com" style="color:#e65100">support@junooni.com</a></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} JUNOONI · India's Creator Commerce Platform</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send to support
    await transporter.sendMail({
      from: `"${displayStoreName} Store" <${SMTP_USER}>`,
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `[Creator Store] ${category ? `${category} - ` : ""}${name} (${handle})`,
      html: supportHTML,
      text: `New contact from ${displayStoreName} store\n\nName: ${name}\nEmail: ${email}\n${orderNumber ? `Order: ${orderNumber}\n` : ""}${category ? `Category: ${category}\n` : ""}\nMessage:\n${message}\n\nSubmitted: ${submittedAt}`,
    })

    // Send confirmation to customer
    await transporter.sendMail({
      from: `"${displayStoreName} Support" <${SMTP_USER}>`,
      to: email,
      subject: `We received your message — ${displayStoreName}`,
      html: customerHTML,
      text: `Hi ${name},\n\nWe got your message and will reply within 24-48 hours.\n\nFor urgent help: support@junooni.com\n\n— JUNOONI Team`,
    })

    res.status(200).json({
      success: true,
      message: "Your message has been sent! Check your email for confirmation."
    })

  } catch (error) {
    console.error("[storefront-contact] error:", error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to send message. Please try support@junooni.com directly."
    })
  }
}