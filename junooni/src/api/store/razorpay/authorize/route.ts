// src/api/store/razorpay/authorize/route.ts - With auto-capture

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      collection_id,
      session_id
    } = req.body

    console.log("🔄 Razorpay Authorization Request:", req.body)

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        error: "Missing required Razorpay parameters"
      })
    }

    if (!collection_id || !session_id) {
      return res.status(400).json({
        error: "Missing collection_id or session_id"
      })
    }

    // Get the Razorpay secret key
    const razorpaySecret = process.env.RAZORPAY_SECRET
    if (!razorpaySecret) {
      console.error("❌ RAZORPAY_KEY_SECRET environment variable is not set")
      return res.status(500).json({
        error: "Payment configuration error",
        details: "Razorpay secret key is not configured"
      })
    }

    try {
      // Verify signature manually for security
      const crypto = require("crypto")
      const expectedSignature = crypto
        .createHmac("sha256", razorpaySecret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex")

      console.log("🔒 Manual signature verification:")
      console.log("Expected:", expectedSignature)
      console.log("Received:", razorpay_signature)

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          error: "Invalid payment signature",
          code: "invalid_signature"
        })
      }

      console.log("✅ Manual signature verification passed")

      // ✅ Store authorization data with capture flag
      if (!global.razorpayAuthorizations) {
        global.razorpayAuthorizations = new Map()
      }
      
      // Store with both authorization and capture data
      global.razorpayAuthorizations.set(session_id, {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        status: "captured", // ✅ CHANGED: Set as captured for auto-capture
        authorized_at: new Date().toISOString(),
        captured_at: new Date().toISOString(),
        auto_captured: true
      })
      
      console.log("✅ Authorization data stored globally with capture flag for session:", session_id)

      return res.status(200).json({
        success: true,
        method: "global_storage_with_capture",
        message: "Payment verified, authorized, and marked for auto-capture",
        razorpay_payment_id,
        razorpay_order_id,
        session_id,
        auto_captured: true
      })

    } catch (error: any) {
      console.error("❌ Authorization process error:", error)
      return res.status(500).json({
        error: "Authorization process failed",
        details: error.message
      })
    }

  } catch (error: any) {
    console.error("❌ Authorization error:", error)
    return res.status(500).json({
      error: "Internal server error",
      details: error.message
    })
  }
}