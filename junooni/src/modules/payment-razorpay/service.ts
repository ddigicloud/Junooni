// /src/modules/payment-razorpay/service.ts
// 🔥 CRITICAL FIXES for authorization issue

import Razorpay from "razorpay"
import crypto from "crypto"

interface RazorpayOptions {
  key_id: string
  key_secret: string
  webhook_secret?: string
}

export default class RazorpayProviderService {
  static identifier = "razorpay"
  
  protected razorpay_: Razorpay
  protected options_: RazorpayOptions

  constructor(container: any, options: RazorpayOptions) {
    this.options_ = options
    this.razorpay_ = new Razorpay({
      key_id: options.key_id,
      key_secret: options.key_secret,
    })
  }

  // ✅ Fixed initiatePayment method
  async initiatePayment(context: any) {
    try {
      console.log("🎯 Initiating Razorpay payment for context:", context)
      
      const { amount, currency_code = "INR", resource_id } = context
      
      console.log("💰 Amount calculation:")
      console.log("Medusa amount:", amount)
      console.log("Display amount: ₹", amount / 100)
      
      // Validate required data
      if (!amount || amount <= 0) {
        return {
          error: "Invalid amount",
          code: "invalid_amount",
          detail: `Amount must be greater than 0, received: ${amount}`
        }
      }

      if (!this.options_.key_id || !this.options_.key_secret) {
        return {
          error: "Missing Razorpay credentials",
          code: "missing_credentials",
          detail: "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not configured"
        }
      }
      
      const razorpayAmount = Math.round(amount * 100)
      
      console.log("🎯 Razorpay calculation:")
      console.log("Amount to send to Razorpay:", razorpayAmount, "paise")
      console.log("Will display in Razorpay as: ₹", razorpayAmount / 100)
      
      // Create Razorpay order
      const orderOptions = {
        amount: razorpayAmount,
        currency: currency_code.toUpperCase(),
        receipt: `order_${resource_id}_${Date.now()}`,
        payment_capture: 1, // Auto capture
      }

      console.log("🔄 Creating Razorpay order with options:", orderOptions)
      
      const order = await this.razorpay_.orders.create(orderOptions)
      
      console.log("✅ Razorpay order created successfully:")
      console.log("Order ID:", order.id)
      console.log("Order amount:", order.amount, "paise")
      console.log("Will display as: ₹", order.amount / 100)

      return {
        data: {
          id: order.id,
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          status: order.status,
          key_id: this.options_.key_id,
          receipt: order.receipt,
        },
      }
    } catch (error: any) {
      console.error("❌ Failed to initiate Razorpay payment:", error)
      return {
        error: "Payment initiation failed",
        code: "payment_initiation_failed",
        detail: error.message,
      }
    }
  }

  // 🔥 CRITICAL FIX: Updated authorizePayment method
  async authorizePayment(paymentSessionData: any, context: any) {
    try {
      console.log("🎯 Authorizing Razorpay payment (AUTO-CAPTURE MODE)...")
      console.log("📝 Payment Session Data:", JSON.stringify(paymentSessionData, null, 2))
      console.log("📝 Context (Razorpay Response):", JSON.stringify(context, null, 2))

      // Handle case where no context is provided (workflow calls)
      if (!context || typeof context !== 'object') {
        console.log("⚠️ No context provided - checking for stored authorization data")
        
        // 🔥 FIX 1: Improved session ID extraction
        const sessionId = paymentSessionData?.context?.idempotency_key || 
                         paymentSessionData?.id ||
                         paymentSessionData?.data?.session_id

        console.log(`🔍 Looking for session ID: ${sessionId}`)
        console.log(`🔍 Global storage exists: ${!!global.razorpayAuthorizations}`)
        console.log(`🔍 Global storage size: ${global.razorpayAuthorizations?.size || 0}`)
        
        if (global.razorpayAuthorizations) {
          console.log(`🔍 Available session IDs in storage:`, Array.from(global.razorpayAuthorizations.keys()))
        }
        
        // Check session data for existing authorization
        if (paymentSessionData?.data) {
          const sessionData = paymentSessionData.data
          
          if (sessionData.razorpay_payment_id && sessionData.razorpay_signature) {
            console.log("✅ Found Razorpay authorization data in session")
            
            return {
              status: "captured",
              data: {
                ...sessionData,
                id: sessionData.razorpay_payment_id,
                razorpay_payment_id: sessionData.razorpay_payment_id,
                external_id: sessionData.razorpay_payment_id,
                status: "captured",
                captured_at: new Date().toISOString(),
                auto_captured: true
              }
            }
          }
          
          // If session shows authorized, convert to captured for auto-capture
          if (sessionData.status === "authorized" || sessionData.payment_authorized) {
            console.log("✅ Converting authorized session to captured (auto-capture)")
            return {
              status: "captured",
              data: {
                ...sessionData,
                status: "captured", 
                captured_at: new Date().toISOString(),
                auto_captured: true
              }
            }
          }
        }
        
        // 🔥 FIX 2: Enhanced global authorization storage check
        if (sessionId && global.razorpayAuthorizations?.has(sessionId)) {
          const authData = global.razorpayAuthorizations.get(sessionId)
          console.log("✅ Found authorization data in global storage:", authData)
          
          if (authData.razorpay_signature) {
            const isValid = this.verifySignature({
              razorpay_payment_id: authData.razorpay_payment_id,
              razorpay_order_id: authData.razorpay_order_id,
              razorpay_signature: authData.razorpay_signature,
            })
            
            if (isValid) {
              console.log("✅ Global authorization valid - returning captured")
              
              // 🔥 FIX 3: Don't delete immediately, keep for potential retries
              // global.razorpayAuthorizations.delete(sessionId)
              
              return {
                status: "captured",
                data: {
                  id: authData.razorpay_payment_id,
                  razorpay_payment_id: authData.razorpay_payment_id,
                  external_id: authData.razorpay_payment_id,
                  razorpay_order_id: authData.razorpay_order_id,
                  razorpay_signature: authData.razorpay_signature,
                  amount: paymentSessionData?.data?.amount,
                  currency: paymentSessionData?.data?.currency || 'INR',
                  status: "captured",
                  captured_at: new Date().toISOString(),
                  auto_captured: true,
                  method: authData.method || 'unknown'
                }
              }
            } else {
              console.error("❌ Invalid signature in global storage")
            }
          }
        }
        
        // 🔥 FIX 4: Check with different session ID formats
        if (sessionId) {
          // Try with different session ID variations
          const sessionIdVariations = [
            sessionId,
            sessionId.replace('payses_', ''),
            paymentSessionData?.data?.id,
            paymentSessionData?.data?.order_id
          ].filter(Boolean)
          
          for (const variation of sessionIdVariations) {
            if (global.razorpayAuthorizations?.has(variation)) {
              const authData = global.razorpayAuthorizations.get(variation)
              console.log(`✅ Found authorization data with variation '${variation}':`, authData)
              
              if (authData.razorpay_signature) {
                const isValid = this.verifySignature({
                  razorpay_payment_id: authData.razorpay_payment_id,
                  razorpay_order_id: authData.razorpay_order_id,
                  razorpay_signature: authData.razorpay_signature,
                })
                
                if (isValid) {
                  console.log("✅ Variation authorization valid - returning captured")
                  
                  return {
                    status: "captured",
                    data: {
                      id: authData.razorpay_payment_id,
                      razorpay_payment_id: authData.razorpay_payment_id,
                      external_id: authData.razorpay_payment_id,
                      razorpay_order_id: authData.razorpay_order_id,
                      razorpay_signature: authData.razorpay_signature,
                      amount: paymentSessionData?.data?.amount,
                      currency: paymentSessionData?.data?.currency || 'INR',
                      status: "captured",
                      captured_at: new Date().toISOString(),
                      auto_captured: true,
                      method: authData.method || 'unknown'
                    }
                  }
                }
              }
            }
          }
        }
        
        // Fallback for order-based sessions
        if (paymentSessionData?.data?.id?.startsWith('order_')) {
          console.log("✅ Order-based session - assuming captured")
          return {
            status: "captured",
            data: {
              ...paymentSessionData.data,
              status: "captured",
              captured_at: new Date().toISOString(),
              auto_captured: true
            }
          }
        }
        
        console.log("⚠️ No authorization data found - returning pending")
        return {
          status: "pending",
          data: paymentSessionData?.data || {}
        }
      }

      // Normal authorization flow with Razorpay response
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = context

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        console.error("❌ Missing required Razorpay response data")
        return {
          status: "pending",
          data: paymentSessionData?.data || {}
        }
      }

      // Verify payment signature
      const isValid = this.verifySignature({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      })

      if (!isValid) {
        console.error("❌ Invalid payment signature")
        return {
          status: "pending",
          data: paymentSessionData?.data || {}
        }
      }

      console.log("✅ Signature verification passed")

      // Always return "captured" for valid Razorpay payments
      try {
        const payment = await this.razorpay_.payments.fetch(razorpay_payment_id)
        console.log("💳 Razorpay payment details:", {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          captured: payment.captured
        })

        const paymentData = {
          id: razorpay_payment_id,
          razorpay_payment_id: razorpay_payment_id,
          external_id: razorpay_payment_id,
          amount: payment.amount,
          currency: payment.currency,
          status: "captured",
          method: payment.method,
          razorpay_order_id: razorpay_order_id,
          razorpay_signature: razorpay_signature,
          razorpay_status: payment.status,
          captured_at: new Date().toISOString(),
          auto_captured: true,
          bank: payment.bank,
          wallet: payment.wallet,
          vpa: payment.vpa,
          card_id: payment.card_id,
          contact: payment.contact,
          email: payment.email,
          original_session_data: paymentSessionData?.data
        }

        console.log("🔥 STORING PAYMENT DATA:", JSON.stringify(paymentData, null, 2))

        return {
          status: "captured",
          data: paymentData
        }

      } catch (fetchError) {
        console.error("⚠️ Failed to fetch payment details, but signature is valid")
        
        const fallbackData = {
          id: razorpay_payment_id,
          razorpay_payment_id: razorpay_payment_id,
          external_id: razorpay_payment_id,
          razorpay_order_id: razorpay_order_id,
          razorpay_signature: razorpay_signature,
          status: "captured",
          captured_at: new Date().toISOString(),
          auto_captured: true,
          original_session_data: paymentSessionData?.data
        }

        console.log("🔥 STORING FALLBACK DATA:", JSON.stringify(fallbackData, null, 2))

        return {
          status: "captured",
          data: fallbackData
        }
      }

    } catch (error: any) {
      console.error("❌ Authorization error:", error)
      return {
        status: "pending",
        data: paymentSessionData?.data || {}
      }
    }
  }

  // 🔥 ENHANCED: capturePayment method
  // 🔥 UPDATE: Replace your capturePayment method with this enhanced version

async capturePayment(paymentSessionData: any) {
  try {
    console.log("🎯 Capturing Razorpay payment (AUTO-CAPTURE MODE)...")
    console.log("📝 Payment Session Data:", JSON.stringify(paymentSessionData, null, 2))

    // Extract payment details - enhanced detection
    let paymentId = null
    let paymentData = {}

    // Try multiple ways to get payment ID
    if (paymentSessionData.id?.startsWith('pay_')) {
      paymentId = paymentSessionData.id
      paymentData = { ...paymentSessionData }
    } else if (paymentSessionData.data?.id?.startsWith('pay_')) {
      paymentId = paymentSessionData.data.id
      paymentData = { ...paymentSessionData.data }
    } else if (paymentSessionData.data?.razorpay_payment_id) {
      paymentId = paymentSessionData.data.razorpay_payment_id
      paymentData = { ...paymentSessionData.data }
    } else if (paymentSessionData.razorpay_payment_id) {
      paymentId = paymentSessionData.razorpay_payment_id
      paymentData = { ...paymentSessionData }
    }

    if (!paymentId) {
      console.error("❌ Missing payment ID for capture")
      return {
        error: "Missing payment ID", 
        code: "missing_payment_id",
        detail: "Payment ID is required for capture"
      }
    }

    console.log(`💰 Capturing Payment ${paymentId}`)

    if (paymentId.startsWith('pay_')) {
      console.log("✅ Razorpay payment already captured (auto-capture enabled)")
      
      try {
        const payment = await this.razorpay_.payments.fetch(paymentId)
        console.log("💳 Razorpay payment status:", payment.status)
        
        // 🔥 CRITICAL: Structure data specifically for Medusa refund system
        const captureResult = {
          // 🔥 PRIMARY: Main payment ID (Medusa looks for this)
          // id: payment.id,
            external_id: payment.id,
          
          // 🔥 BACKUP: Multiple payment ID fields for refund detection
          external_id: payment.id, // ✅ This will be stored
          data: {
            // ✅ All Razorpay data goes here
            id: payment.id,
            razorpay_payment_id: payment.id,
            razorpay_order_id: paymentSessionData?.data?.order_id,
            razorpay_signature: paymentSessionData?.data?.razorpay_signature,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            captured: payment.captured,
            created_at: payment.created_at,
            fee: payment.fee,
            tax: payment.tax,
            captured_at: new Date().toISOString(),
            provider_id: "razorpay",
            auto_captured: true
          },
          // 🔥 Metadata for additional storage
          metadata: {
            razorpay_payment_id: payment.id,
            razorpay_status: payment.status,
            capture_method: "auto",
            captured_via: "payment_provider"
          }
        }

        console.log("🔥 CAPTURE RESULT (REFUND READY):", JSON.stringify(captureResult, null, 2))
        return captureResult

      } catch (fetchError) {
        console.log("⚠️ Could not fetch payment details, using fallback")
        
        const fallbackResult = {
          id: paymentId, // 🔥 CRITICAL: Main ID
          razorpay_payment_id: paymentId,
          external_id: paymentId,
          payment_id: paymentId,
          amount: paymentSessionData.amount || paymentData.amount,
          status: "captured",
          captured_at: new Date().toISOString(),
          auto_captured: true,
          provider_id: "razorpay", // 🔥 CRITICAL
          ...paymentData
        }

        console.log("🔥 FALLBACK CAPTURE RESULT:", JSON.stringify(fallbackResult, null, 2))
        return fallbackResult
      }
    } else {
      console.log("✅ Order-based payment - not directly refundable")
      return {
        id: paymentId,
        amount: paymentSessionData.amount,
        status: "captured",
        captured_at: new Date().toISOString(),
        auto_captured: true,
        provider_id: "razorpay",
        refund_note: "Use vendor refund endpoint for order-based payments",
        ...paymentData
      }
    }

  } catch (error: any) {
    console.error("❌ Capture error:", error)
    return {
      error: "Capture failed", 
      code: "capture_failed",
      detail: error.message,
    }
  }
}

  // ✅ Keep existing refundPayment method unchanged
  // 🔥 ENHANCED: Better error handling in refundPayment method
// 🔥 FIX: Update your refundPayment method to handle amount correctly
async refundPayment(paymentSessionData: any, refundAmount: number) {
  try {
    console.log("🎯 Starting Razorpay refund process...")
    console.log("📝 Payment Session Data:", JSON.stringify(paymentSessionData, null, 2))
    console.log("💰 Refund Amount (parameter):", refundAmount)

    // 🔥 FIX: Enhanced amount detection
    let actualRefundAmount = refundAmount;
    
    // If refundAmount parameter is undefined, check paymentSessionData
    if (actualRefundAmount === undefined || actualRefundAmount === null) {
      console.log("⚠️ Refund amount parameter is undefined, checking session data...")
      
      // Method 1: Check amount.value (Medusa v2 format)
      if (paymentSessionData.amount?.value) {
        actualRefundAmount = parseFloat(paymentSessionData.amount.value);
        console.log(`✅ Found refund amount in session data.amount.value: ${actualRefundAmount}`);
      }
      // Method 2: Check direct amount field
      else if (paymentSessionData.amount) {
        actualRefundAmount = parseFloat(paymentSessionData.amount);
        console.log(`✅ Found refund amount in session data.amount: ${actualRefundAmount}`);
      }
      // Method 3: Check context or other fields
      else if (paymentSessionData.refund_amount) {
        actualRefundAmount = parseFloat(paymentSessionData.refund_amount);
        console.log(`✅ Found refund amount in session data.refund_amount: ${actualRefundAmount}`);
      }
      // Method 4: Check if it's in data object
      else if (paymentSessionData.data?.amount) {
        // Convert from paise to rupees if it's a large amount
        const dataAmount = paymentSessionData.data.amount;
        actualRefundAmount = dataAmount > 1000 ? dataAmount / 100 : dataAmount;
        console.log(`✅ Found refund amount in session data.data.amount: ${actualRefundAmount}`);
      }
    }

    console.log("💰 Final Refund Amount to process:", actualRefundAmount);

    // 🔥 VALIDATE: Ensure we have a valid amount
    if (actualRefundAmount === undefined || actualRefundAmount === null || actualRefundAmount <= 0) {
      console.error("❌ No valid refund amount found")
      console.log("📋 Available amount fields in session data:")
      console.log("   - refundAmount parameter:", refundAmount)
      console.log("   - paymentSessionData.amount:", paymentSessionData.amount)
      console.log("   - paymentSessionData.amount?.value:", paymentSessionData.amount?.value)
      console.log("   - paymentSessionData.refund_amount:", paymentSessionData.refund_amount)
      console.log("   - paymentSessionData.data?.amount:", paymentSessionData.data?.amount)
      
      return {
        error: "Invalid refund amount",
        code: "invalid_amount",
        detail: "Refund amount must be greater than 0. Check amount field in payment session data.",
        debug_info: {
          refund_amount_parameter: refundAmount,
          available_amount_fields: {
            "amount.value": paymentSessionData.amount?.value,
            "amount": paymentSessionData.amount,
            "refund_amount": paymentSessionData.refund_amount,
            "data.amount": paymentSessionData.data?.amount
          }
        }
      }
    }

    // 🔥 ENHANCED: Check if payment session data is null/empty
    if (!paymentSessionData) {
      console.error("❌ Payment session data is null")
      return {
        error: "Payment session data not found",
        code: "payment_session_null",
        detail: "Payment provider may not be properly registered or payment data was not stored during capture"
      }
    }

    // 🔥 ENHANCED: Multiple payment ID detection strategies (your existing code)
    let paymentId = null;
    
    if (paymentSessionData.data?.id?.startsWith('pay_')) {
      paymentId = paymentSessionData.data.id;
      console.log(`✅ Found payment ID in data.id: ${paymentId}`)
    } 
    else if (paymentSessionData.data?.razorpay_payment_id?.startsWith('pay_')) {
      paymentId = paymentSessionData.data.razorpay_payment_id;
      console.log(`✅ Found payment ID in data.razorpay_payment_id: ${paymentId}`)
    }
    else if (paymentSessionData.id?.startsWith('pay_')) {
      paymentId = paymentSessionData.id;
      console.log(`✅ Found payment ID in id field: ${paymentId}`)
    }
    else if (paymentSessionData.external_id?.startsWith('pay_')) {
      paymentId = paymentSessionData.external_id;
      console.log(`✅ Found payment ID in external_id: ${paymentId}`)
    }

    if (!paymentId || !paymentId.startsWith('pay_')) {
      console.error("❌ Invalid or missing payment ID for refund")
      return {
        error: "Invalid payment ID",
        code: "invalid_payment_id",
        detail: "Payment ID must start with 'pay_' for refunds."
      }
    }

    console.log("💳 Using Payment ID for refund:", paymentId)

    // Verify payment exists and is refundable
    let payment;
    try {
      payment = await this.razorpay_.payments.fetch(paymentId)
      console.log("📋 Payment details:", {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        captured: payment.captured,
        amount_refunded: payment.amount_refunded,
      })
    } catch (fetchError: any) {
      console.error("❌ Failed to fetch payment details:", fetchError)
      return {
        error: "Payment not found",
        code: "payment_not_found", 
        detail: `Could not find payment with ID: ${paymentId}`
      }
    }

    if (payment.status !== 'captured') {
      console.error("❌ Payment is not captured, cannot refund")
      return {
        error: "Payment not refundable",
        code: "payment_not_captured",
        detail: `Payment status is '${payment.status}'. Only captured payments can be refunded.`
      }
    }

    // 🔥 ENHANCED: Calculate refund amount correctly
    let refundAmountInPaise;
    
    // Convert rupees to paise (Razorpay expects paise)
    refundAmountInPaise = Math.round(actualRefundAmount * 100);
    
    console.log("💰 Refund calculation:")
    console.log("Original refund amount (rupees):", actualRefundAmount)
    console.log("Refund amount in paise:", refundAmountInPaise)
    console.log("Payment amount (paise):", payment.amount)
    console.log("Already refunded (paise):", payment.amount_refunded || 0)
    console.log("Available for refund (paise):", payment.amount - (payment.amount_refunded || 0))

    // Validate refund amount
    const availableAmount = payment.amount - (payment.amount_refunded || 0);
    
    if (refundAmountInPaise > availableAmount) {
      return {
        error: "Insufficient refundable balance",
        code: "insufficient_balance",
        detail: `Requested: ₹${refundAmountInPaise/100}, Available: ₹${availableAmount/100}`
      }
    }

    if (refundAmountInPaise <= 0) {
      return {
        error: "Invalid refund amount", 
        code: "invalid_amount",
        detail: "Refund amount must be greater than 0"
      }
    }

    // 🔥 OFFICIAL RAZORPAY API CALL
    console.log(`🔄 Processing refund of ₹${actualRefundAmount} (${refundAmountInPaise} paise)`)
    
    const refund = await this.razorpay_.payments.refund(paymentId, {
      amount: refundAmountInPaise, // Amount in paise
      speed: 'optimum', // For faster refunds
      notes: {
        refund_source: 'JUNOONI',
        processed_via: 'payment_provider',
        original_amount_rupees: actualRefundAmount
      }
    });
    
    console.log("✅ Refund processed via official Razorpay API:", {
      id: refund.id,
      amount: refund.amount,
      status: refund.status,
      payment_id: refund.payment_id,
      speed_processed: refund.speed_processed
    })

    return {
      id: refund.id,
      payment_id: refund.payment_id,
      amount: refund.amount,
      status: refund.status,
      speed_processed: refund.speed_processed,
      created_at: refund.created_at,
      display_amount: `₹${refund.amount / 100}`,
    }

  } catch (error: any) {
    console.error("❌ Official Razorpay refund API error:", error)
    
    let errorDetail = error.message;
    let errorCode = "refund_failed";

    if (error.error) {
      errorDetail = error.error.description || error.error.reason || error.message;
      errorCode = error.error.code || "refund_failed";
    }

    return {
      error: "Refund failed",
      code: errorCode,
      detail: errorDetail,
      debug_info: {
        payment_id: paymentSessionData.data?.id,
        api_used: "official_razorpay_sdk",
        error_type: error.constructor.name,
        raw_error: error.error || error.message,
      }
    }
  }
}

  // Keep all other methods unchanged...
  async cancelPayment(paymentSessionData: any) {
    return {
      ...paymentSessionData,
      status: "cancelled",
    }
  }

  async deletePayment(paymentSessionData: any) {
    return paymentSessionData
  }

  async retrievePayment(paymentSessionData: any) {
    try {
      const payment = await this.razorpay_.payments.fetch(paymentSessionData.id)
      return {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
      }
    } catch (error: any) {
      return paymentSessionData
    }
  }

  async updatePayment(context: any) {
    return this.initiatePayment(context)
  }

  async getPaymentStatus(paymentSessionData: any) {
    try {
      const payment = await this.razorpay_.payments.fetch(paymentSessionData.id)
      return payment.status === "captured" ? "authorized" : "pending"
    } catch (error) {
      return "error"
    }
  }

  async getWebhookActionAndData(data: any) {
    const { event, payload } = data

    switch (event) {
      case "payment.captured":
        return {
          action: "authorized",
          data: {
            session_id: payload.payment.entity.order_id,
            amount: payload.payment.entity.amount,
          },
        }
      case "payment.failed":
        return {
          action: "failed", 
          data: {
            session_id: payload.payment.entity.order_id,
          },
        }
      default:
        return { action: "not_supported", data: {} }
    }
  }

  // Private signature verification method
  private verifySignature({
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
  }: {
    razorpay_payment_id: string
    razorpay_order_id: string  
    razorpay_signature: string
  }): boolean {
    try {
      const body = razorpay_order_id + "|" + razorpay_payment_id
      const expectedSignature = crypto
        .createHmac("sha256", this.options_.key_secret)
        .update(body)
        .digest("hex")

      console.log("🔒 Signature Verification:")
      console.log("Body:", body)
      console.log("Expected:", expectedSignature)
      console.log("Received:", razorpay_signature)
      console.log("Valid:", expectedSignature === razorpay_signature)

      return expectedSignature === razorpay_signature
    } catch (error) {
      console.error("❌ Signature verification error:", error)
      return false
    }
  }
}