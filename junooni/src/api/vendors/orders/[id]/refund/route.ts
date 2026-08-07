// /src/api/vendors/orders/[id]/refund/route.ts
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/utils"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import MarketplaceModuleService from "../../../../../modules/marketplace/service"
import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"

// ✅ Enhanced Razorpay configuration with validation
const RAZORPAY_CONFIG = {
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
  base_url: 'https://api.razorpay.com/v1'
}

// ✅ Validate Razorpay configuration
const validateRazorpayConfig = () => {
  console.log(`🔑 Validating Razorpay configuration...`)
  console.log(`📋 RAZORPAY_KEY_ID exists: ${!!RAZORPAY_CONFIG.key_id}`)
  console.log(`📋 RAZORPAY_KEY_SECRET exists: ${!!RAZORPAY_CONFIG.key_secret}`)
  
  if (RAZORPAY_CONFIG.key_id) {
    console.log(`📋 RAZORPAY_KEY_ID format: ${RAZORPAY_CONFIG.key_id.substring(0, 8)}...`)
    console.log(`📋 RAZORPAY_KEY_ID starts with 'rzp_': ${RAZORPAY_CONFIG.key_id.startsWith('rzp_')}`)
  }
  
  if (!RAZORPAY_CONFIG.key_id || !RAZORPAY_CONFIG.key_secret) {
    throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.')
  }
  
  return true
}

// ✅ Test Razorpay connection
const testRazorpayConnection = async () => {
  console.log(`🔗 Testing Razorpay API connection...`)
  
  try {
    const auth = Buffer.from(`${RAZORPAY_CONFIG.key_id}:${RAZORPAY_CONFIG.key_secret}`).toString('base64')
    console.log(`🔑 Authorization header created: Basic ${auth.substring(0, 20)}...`)
    
    // Test with a simple API call (fetch payments - this won't create anything)
    const testResponse = await fetch(`${RAZORPAY_CONFIG.base_url}/payments?count=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`📡 Test API response status: ${testResponse.status}`)
    console.log(`📡 Test API response headers:`, Object.fromEntries(testResponse.headers.entries()))
    
    if (!testResponse.ok) {
      const errorData = await testResponse.text()
      console.error(`❌ Razorpay connection test failed:`, errorData)
      throw new Error(`Razorpay API connection failed: ${testResponse.status} - ${errorData}`)
    }
    
    const testData = await testResponse.json()
    console.log(`✅ Razorpay connection successful! Found ${testData.count} payments in account.`)
    return true
    
  } catch (error) {
    console.error(`❌ Razorpay connection test error:`, error)
    throw error
  }
}

// ✅ Enhanced Razorpay refund with extensive logging
const createRazorpayRefund = async (paymentId: string, refundData: {
  amount: number
  reason?: string
  receipt?: string
  speed?: 'normal' | 'optimum'
  notes?: Record<string, string>
}) => {
  console.log(`\n🚀 STARTING RAZORPAY REFUND PROCESS`)
  console.log(`📋 Payment ID: ${paymentId}`)
  console.log(`📋 Refund Data:`, JSON.stringify(refundData, null, 2))
  
  // Validate payment ID format
  if (!paymentId || !paymentId.startsWith('pay_')) {
    throw new Error(`Invalid Razorpay payment ID format: ${paymentId}. Expected format: pay_xxxxx`)
  }
  
  try {
    const auth = Buffer.from(`${RAZORPAY_CONFIG.key_id}:${RAZORPAY_CONFIG.key_secret}`).toString('base64')
    console.log(`🔑 Auth token created: Basic ${auth.substring(0, 20)}...`)
    
    const refundPayload = {
      amount: refundData.amount, // Amount in paise
      speed: refundData.speed || 'optimum', // Use optimum for instant refunds
      notes: refundData.notes || {},
      receipt: refundData.receipt
    }
    
    console.log(`📦 Refund payload:`, JSON.stringify(refundPayload, null, 2))
    
    // 🚨 CRITICAL FIX: Corrected URL from "payment-razorpay" to "payments"
    const refundUrl = `${RAZORPAY_CONFIG.base_url}/payments/${paymentId}/refund`
    console.log(`🌐 Refund URL: ${refundUrl}`)
    
    console.log(`📡 Making API call to Razorpay...`)
    const startTime = Date.now()
    
    const response = await fetch(refundUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Medusa-Vendor-Portal/1.0'
      },
      body: JSON.stringify(refundPayload)
    })
    
    const endTime = Date.now()
    console.log(`⏱️ API call completed in ${endTime - startTime}ms`)
    console.log(`📡 Response status: ${response.status} ${response.statusText}`)
    console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log(`📄 Raw response body:`, responseText)

    if (!response.ok) {
      console.error(`❌ RAZORPAY REFUND FAILED`)
      console.error(`📋 Status: ${response.status}`)
      console.error(`📋 Status Text: ${response.statusText}`)
      console.error(`📋 Response Body: ${responseText}`)
      
      let errorMessage = `Razorpay API Error: ${response.status} - ${response.statusText}`
      
      try {
        const errorData = JSON.parse(responseText)
        if (errorData.error) {
          errorMessage = `${errorData.error.code}: ${errorData.error.description}`
        }
      } catch (parseError) {
        console.log(`⚠️ Could not parse error response as JSON`)
      }
      
      throw new Error(errorMessage)
    }

    const refundResult = JSON.parse(responseText)
    console.log(`✅ RAZORPAY REFUND SUCCESSFUL!`)
    console.log(`📋 Refund ID: ${refundResult.id}`)
    console.log(`📋 Status: ${refundResult.status}`)
    console.log(`📋 Amount: ₹${refundResult.amount / 100}`)
    console.log(`📋 Speed Processed: ${refundResult.speed_processed}`)
    console.log(`📋 Full Response:`, JSON.stringify(refundResult, null, 2))
    
    return refundResult
  } catch (error) {
    console.error(`❌ CRITICAL ERROR in createRazorpayRefund:`)
    console.error(`📋 Error name: ${error.name}`)
    console.error(`📋 Error message: ${error.message}`)
    console.error(`📋 Error stack:`, error.stack)
    throw error
  }
}

// ✅ Enhanced payment info finder with extensive logging
const findOrderPaymentInfo = async (order: any, scope: any) => {
  console.log(`\n🔍 DETAILED PAYMENT INFO SEARCH for order ${order.id}`)
  
  // ✅ Enhanced payment debugging
  console.log(`📋 Order payment status: ${order.payment_status}`)
  console.log(`📋 Order total: ₹${order.total}`)
  console.log(`📋 Order currency: ${order.currency_code}`)
  console.log(`📋 Payment collections count: ${order.payment_collections?.length || 0}`)
  
  // ✅ STEP 1: Check payment collections for Razorpay payment ID
  if (order.payment_collections && order.payment_collections.length > 0) {
    console.log(`\n📍 Checking Payment Collections...`)
    
    for (let collectionIndex = 0; collectionIndex < order.payment_collections.length; collectionIndex++) {
      const collection = order.payment_collections[collectionIndex]
      console.log(`\n📦 Payment Collection ${collectionIndex + 1}:`)
      console.log(`   - ID: ${collection.id}`)
      console.log(`   - Amount: ₹${collection.amount}`)
      console.log(`   - Status: ${collection.status}`)
      console.log(`   - Currency: ${collection.currency_code}`)
      console.log(`   - Payments count: ${collection.payments?.length || 0}`)
      
      if (collection.payments && collection.payments.length > 0) {
        for (let paymentIndex = 0; paymentIndex < collection.payments.length; paymentIndex++) {
          const payment = collection.payments[paymentIndex]
          console.log(`\n   💳 Payment ${paymentIndex + 1}:`)
          console.log(`      - ID: ${payment.id}`)
          console.log(`      - Provider ID: ${payment.provider_id}`)
          console.log(`      - Amount: ₹${payment.amount}`)
          console.log(`      - Currency: ${payment.currency_code}`)
          console.log(`      - External ID: ${payment.external_id}`)
          console.log(`      - Status: ${payment.status}`)
          console.log(`      - Captured Amount: ${payment.captured_amount}`)
          console.log(`      - Created At: ${payment.created_at}`)
          console.log(`      - Metadata keys: [${Object.keys(payment.metadata || {}).join(', ')}]`)
          console.log(`      - Data keys: [${Object.keys(payment.data || {}).join(', ')}]`)
          
          // ✅ Enhanced Razorpay detection with payment provider fallback
          let isRazorpayPayment = false
          let razorpayPaymentId = null
          
          // Method 1: Check provider_id
          if (payment.provider_id === 'razorpay' || payment.provider_id?.includes('razorpay')) {
            isRazorpayPayment = true
            console.log(`      ✅ Identified as Razorpay payment via provider_id`)
          }
          
          // Method 2: Check external_id format
          if (payment.external_id && payment.external_id.startsWith('pay_')) {
            isRazorpayPayment = true
            razorpayPaymentId = payment.external_id
            console.log(`      ✅ Found Razorpay payment ID in external_id: ${razorpayPaymentId}`)
          }
          
          // Method 3: Check metadata
          if (payment.metadata) {
            console.log(`      📋 Payment metadata:`, JSON.stringify(payment.metadata, null, 8))
            
            if (payment.metadata.razorpay_payment_id) {
              isRazorpayPayment = true
              razorpayPaymentId = payment.metadata.razorpay_payment_id
              console.log(`      ✅ Found Razorpay payment ID in metadata: ${razorpayPaymentId}`)
            }
            
            // Check for other common fields
            const possibleFields = ['payment_id', 'razorpay_id', 'gateway_payment_id', 'transaction_id']
            for (const field of possibleFields) {
              if (payment.metadata[field] && payment.metadata[field].startsWith('pay_')) {
                isRazorpayPayment = true
                razorpayPaymentId = payment.metadata[field]
                console.log(`      ✅ Found Razorpay payment ID in metadata.${field}: ${razorpayPaymentId}`)
                break
              }
            }
          }
          
          // Method 4: Check data field
          if (payment.data) {
            console.log(`      📋 Payment data:`, JSON.stringify(payment.data, null, 8))
            
            if (payment.data.id && payment.data.id.startsWith('pay_')) {
              isRazorpayPayment = true
              razorpayPaymentId = payment.data.id
              console.log(`      ✅ Found Razorpay payment ID in data.id: ${razorpayPaymentId}`)
            }
            
            // Check for other fields in data
            const possibleDataFields = ['payment_id', 'razorpay_payment_id', 'transaction_id']
            for (const field of possibleDataFields) {
              if (payment.data[field] && payment.data[field].startsWith('pay_')) {
                isRazorpayPayment = true
                razorpayPaymentId = payment.data[field]
                console.log(`      ✅ Found Razorpay payment ID in data.${field}: ${razorpayPaymentId}`)
                break
              }
            }
          }
          
          // 🆕 NEW: Payment provider fallback - try to get payment ID via provider
          if (isRazorpayPayment && !razorpayPaymentId && payment.provider_id === 'razorpay') {
            console.log(`      🔄 Attempting payment provider retrieval...`)
            try {
              const paymentProvider = scope.resolve("razorpay")
              if (paymentProvider && paymentProvider.retrievePayment) {
                const retrievedPayment = await paymentProvider.retrievePayment(payment)
                if (retrievedPayment && retrievedPayment.id && retrievedPayment.id.startsWith('pay_')) {
                  razorpayPaymentId = retrievedPayment.id
                  console.log(`      ✅ Retrieved Razorpay payment ID via provider: ${razorpayPaymentId}`)
                }
              }
            } catch (providerError) {
              console.log(`      ⚠️ Payment provider retrieval failed:`, providerError.message)
            }
          }
          
          if (isRazorpayPayment && razorpayPaymentId) {
            console.log(`\n🎯 RAZORPAY PAYMENT FOUND!`)
            const paymentInfo = {
              medusa_payment_id: payment.id,
              razorpay_payment_id: razorpayPaymentId,
              total_amount: payment.amount,
              currency: payment.currency_code || 'INR',
              captured_amount: payment.captured_amount || payment.amount
            }
            console.log(`📋 Payment Info:`, JSON.stringify(paymentInfo, null, 2))
            return paymentInfo
          } else {
            console.log(`      ❌ Not a Razorpay payment or no payment ID found`)
          }
        }
      } else {
        console.log(`   ⚠️ No payments in this collection`)
      }
    }
  } else {
    console.log(`⚠️ No payment collections found`)
  }
  
  // ✅ STEP 2: Check in order metadata (unchanged)
  console.log(`\n📍 Checking Order Metadata...`)
  if (order.metadata) {
    console.log(`📋 Order metadata keys: [${Object.keys(order.metadata).join(', ')}]`)
    console.log(`📋 Full order metadata:`, JSON.stringify(order.metadata, null, 2))
    
    if (order.metadata.payment_info) {
      console.log(`📋 Found payment_info in metadata:`, order.metadata.payment_info)
      const paymentInfo = order.metadata.payment_info
      
      if (paymentInfo.razorpay_payment_id) {
        console.log(`✅ Found Razorpay payment ID in order metadata: ${paymentInfo.razorpay_payment_id}`)
        return {
          medusa_payment_id: paymentInfo.medusa_payment_id || 'unknown',
          razorpay_payment_id: paymentInfo.razorpay_payment_id,
          total_amount: order.total,
          currency: order.currency_code || 'INR',
          captured_amount: order.total
        }
      }
    }
    
    if (order.metadata.razorpay_payment_id) {
      console.log(`✅ Found Razorpay payment ID directly in order metadata: ${order.metadata.razorpay_payment_id}`)
      return {
        medusa_payment_id: 'unknown',
        razorpay_payment_id: order.metadata.razorpay_payment_id,
        total_amount: order.total,
        currency: order.currency_code || 'INR',
        captured_amount: order.total
      }
    }
    
    // Check for other possible fields in metadata
    const possibleMetadataFields = ['payment_id', 'razorpay_id', 'gateway_payment_id', 'transaction_id']
    for (const field of possibleMetadataFields) {
      if (order.metadata[field] && order.metadata[field].startsWith('pay_')) {
        console.log(`✅ Found Razorpay payment ID in order metadata.${field}: ${order.metadata[field]}`)
        return {
          medusa_payment_id: 'unknown',
          razorpay_payment_id: order.metadata[field],
          total_amount: order.total,
          currency: order.currency_code || 'INR',
          captured_amount: order.total
        }
      }
    }
  } else {
    console.log(`⚠️ No metadata found in order`)
  }

  // 🆕 NEW: Final fallback - check for any payment that might be Razorpay based on amount/currency
  console.log(`\n📍 STEP 3: Final Fallback - Checking for Potential Razorpay Payments`)
  if (order.payment_collections?.length > 0) {
    for (const collection of order.payment_collections) {
      if (collection.payments?.length > 0) {
        for (const payment of collection.payments) {
          // If payment amount matches order total and no provider specified, 
          // it might be a Razorpay payment with missing provider info
          if (payment.amount === order.total && 
              payment.status === 'captured' && 
              !payment.provider_id) {
            console.log(`⚠️ Found potential Razorpay payment without provider info:`)
            console.log(`   Payment ID: ${payment.id}`)
            console.log(`   Amount: ₹${payment.amount}`)
            console.log(`   External ID: ${payment.external_id}`)
            
            // Check if external_id might be payment ID
            if (payment.external_id?.startsWith('pay_')) {
              console.log(`✅ Using external_id as Razorpay payment ID: ${payment.external_id}`)
              return {
                medusa_payment_id: payment.id,
                razorpay_payment_id: payment.external_id,
                total_amount: payment.amount,
                currency: payment.currency_code || order.currency_code || 'INR',
                captured_amount: payment.captured_amount || payment.amount
              }
            }
          }
        }
      }
    }
  }
  
  console.log(`\n❌ NO RAZORPAY PAYMENT INFORMATION FOUND`)
  console.log(`📋 Searched in:`)
  console.log(`   - Payment collections: ${order.payment_collections?.length || 0}`)
  console.log(`   - Order metadata: ${order.metadata ? 'Yes' : 'No'}`)
  console.log(`   - Payment provider fallback: Attempted`)
  console.log(`\n💡 To fix this issue:`)
  console.log(`   1. Ensure the order was paid through Razorpay`)
  console.log(`   2. Check that the Razorpay payment ID is stored in payment metadata`)
  console.log(`   3. Verify the payment provider_id is set to 'razorpay'`)
  console.log(`   4. Consider manually adding payment info via admin endpoint`)
  
  return null
}

// ✅ ENHANCED: Add manual payment ID injection as emergency fallback
const getPaymentIdFromRazorpayDashboard = async (orderTotal: number, orderCurrency: string, orderDate: string) => {
  console.log(`\n🆘 EMERGENCY: Attempting to find payment via Razorpay dashboard search`)
  console.log(`   Order total: ₹${orderTotal}`)
  console.log(`   Currency: ${orderCurrency}`)
  console.log(`   Order date: ${orderDate}`)
  
  try {
    const auth = Buffer.from(`${RAZORPAY_CONFIG.key_id}:${RAZORPAY_CONFIG.key_secret}`).toString('base64')
    
    // Search for payments around the order date with matching amount
    const searchDate = new Date(orderDate)
    const fromDate = Math.floor((searchDate.getTime() - 24 * 60 * 60 * 1000) / 1000) // 24 hours before
    const toDate = Math.floor((searchDate.getTime() + 24 * 60 * 60 * 1000) / 1000) // 24 hours after
    
    const searchUrl = `${RAZORPAY_CONFIG.base_url}/payments?from=${fromDate}&to=${toDate}&count=100`
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const searchData = await response.json()
      const matchingPayments = searchData.items?.filter(payment => 
        payment.amount === Math.round(orderTotal * 100) && // Convert to paise for comparison
        payment.status === 'captured'
      ) || []
      
      if (matchingPayments.length === 1) {
        console.log(`✅ Found matching payment in Razorpay: ${matchingPayments[0].id}`)
        return matchingPayments[0].id
      } else if (matchingPayments.length > 1) {
        console.log(`⚠️ Multiple matching payments found, using the most recent`)
        const sortedPayments = matchingPayments.sort((a, b) => b.created_at - a.created_at)
        return sortedPayments[0].id
      }
    }
  } catch (error) {
    console.log(`❌ Emergency payment search failed:`, error.message)
  }
  
  return null
}

// ✅ Calculate vendor-specific refund amount
const calculateVendorRefundAmount = (vendorItems: any[], refundItems: { item_id: string, quantity: number, reason?: string }[]) => {
  console.log(`💰 Calculating vendor refund amount...`)
  
  let totalRefundAmount = 0
  const refundedItems = []
  
  refundItems.forEach(refundItem => {
    const vendorItem = vendorItems.find(vi => vi.id === refundItem.item_id)
    if (vendorItem) {
      const refundQuantity = Math.min(refundItem.quantity, vendorItem.quantity)
      const itemRefundAmount = (vendorItem.unit_price * refundQuantity)
      
      totalRefundAmount += itemRefundAmount
      refundedItems.push({
        ...vendorItem,
        refund_quantity: refundQuantity,
        refund_amount: itemRefundAmount,
        reason: refundItem.reason || 'Vendor refund'
      })
      
      console.log(`📦 Item ${vendorItem.title}: ${refundQuantity} × ₹${vendorItem.unit_price} = ₹${itemRefundAmount}`)
    }
  })
  
  console.log(`✅ Total vendor refund amount: ₹${totalRefundAmount}`)
  return { totalRefundAmount, refundedItems }
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  console.log(`\n🔥 ============ REFUND REQUEST STARTED ============`)
  console.log(`📅 Timestamp: ${new Date().toISOString()}`)
  
  try {
    const { id: orderId } = req.params
    const { 
      items, // Array of { item_id, quantity, reason }
      refund_reason,
      notes 
    } = req.body || {}

    console.log(`📋 Request Details:`)
    console.log(`   - Order ID: ${orderId}`)
    console.log(`   - Items to refund: ${items?.length || 0}`)
    console.log(`   - Refund reason: ${refund_reason}`)
    console.log(`   - Request body:`, JSON.stringify(req.body, null, 2))

    // ✅ STEP 1: Validate Razorpay configuration
    console.log(`\n📍 STEP 1: Validating Razorpay Configuration`)
    validateRazorpayConfig()

    // ✅ STEP 2: Test Razorpay connection
    console.log(`\n📍 STEP 2: Testing Razorpay Connection`)
    await testRazorpayConnection()

    // ✅ STEP 3: Validate request
    console.log(`\n📍 STEP 3: Validating Request Data`)
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Items array is required for refund"
      )
    }

    // ✅ STEP 4: Get vendor information
    console.log(`\n📍 STEP 4: Getting Vendor Information`)
    const marketplaceModuleService: MarketplaceModuleService =
      req.scope.resolve(MARKETPLACE_MODULE)

    const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
      req.auth_context.actor_id,
      { relations: ["vendor"] }
    )

    const vendorId = vendorAdmin.vendor.id
    console.log(`🏪 Vendor ID: ${vendorId}`)
    console.log(`🏪 Vendor Name: ${vendorAdmin.vendor.name || 'N/A'}`)

    // ✅ STEP 5: Get order with payment information
    console.log(`\n📍 STEP 5: Fetching Order Data`)
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    
    const { data: [order] } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "custom_display_id",
        "total",
        "currency_code",
        "metadata",
        "payment_status",
        "items.*",
        "payment_collections.*",
        "payment_collections.payments.*",
        "payment_collections.payments.metadata",
        "payment_collections.payments.data"
      ],
      filters: { id: [orderId] }
    })

    if (!order) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Order ${orderId} not found`
      )
    }

    console.log(`📄 Order Details:`)
    console.log(`   - Order ID: ${order.id}`)
    console.log(`   - Display ID: ${order.custom_display_id}`)
    console.log(`   - Payment Status: ${order.payment_status}`)
    console.log(`   - Total: ₹${order.total}`)
    console.log(`   - Currency: ${order.currency_code}`)
    console.log(`   - Payment Collections: ${order.payment_collections?.length || 0}`)

    // ✅ STEP 6: Get vendor items from order
    console.log(`\n📍 STEP 6: Getting Vendor Items`)
    const vendorOrders = (order.metadata?.vendor_orders || []) as any[]
    console.log(`📦 Vendor orders in metadata: ${vendorOrders.length}`)
    
    const vendorInfo = vendorOrders.find((vo: any) => vo.vendor_id === vendorId)
    
    if (!vendorInfo) {
      console.log(`❌ No vendor info found for vendor ${vendorId}`)
      console.log(`📋 Available vendor IDs in order:`, vendorOrders.map(vo => vo.vendor_id))
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `No products found for vendor ${vendorId} in order ${orderId}`
      )
    }

    const vendorItems = vendorInfo.vendor_items || []
    console.log(`📦 Vendor items found: ${vendorItems.length}`)
    vendorItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title} - ₹${item.unit_price} × ${item.quantity}`)
    })

    // ✅ STEP 7: Calculate refund amount
    console.log(`\n📍 STEP 7: Calculating Refund Amount`)
    const { totalRefundAmount, refundedItems } = calculateVendorRefundAmount(vendorItems, items)
    
    if (totalRefundAmount <= 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Refund amount must be greater than 0"
      )
    }

    console.log(`💰 Refund calculation complete:`)
    console.log(`   - Total refund amount: ₹${totalRefundAmount}`)
    console.log(`   - Items being refunded: ${refundedItems.length}`)

    // ✅ STEP 8: Find payment information
    console.log(`\n📍 STEP 8: Finding Payment Information`)
    const paymentInfo = await findOrderPaymentInfo(order, req.scope)
    
    if (!paymentInfo) {
      console.log(`❌ No payment information found`)
      console.log(`📋 Order payment collections:`, order.payment_collections?.length || 0)
      console.log(`📋 Order metadata keys:`, Object.keys(order.metadata || {}))
      
      // ✅ Enhanced payment debugging
      if (order.payment_collections?.length > 0) {
        order.payment_collections.forEach((collection, idx) => {
          console.log(`📋 Payment Collection ${idx + 1}:`, {
            id: collection.id,
            amount: collection.amount,
            status: collection.status,
            payments_count: collection.payments?.length || 0
          })
          
          if (collection.payments?.length > 0) {
            collection.payments.forEach((payment, pidx) => {
              console.log(`   💳 Payment ${pidx + 1}:`, {
                id: payment.id,
                provider_id: payment.provider_id,
                amount: payment.amount,
                external_id: payment.external_id,
                metadata_keys: Object.keys(payment.metadata || {}),
                data_keys: Object.keys(payment.data || {})
              })
            })
          }
        })
      }
      
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Payment information not found for this order. Please ensure the order was paid through Razorpay."
      )
    }

    console.log(`💳 Payment info found:`)
    console.log(`   - Medusa Payment ID: ${paymentInfo.medusa_payment_id}`)
    console.log(`   - Razorpay Payment ID: ${paymentInfo.razorpay_payment_id}`)
    console.log(`   - Total Amount: ₹${paymentInfo.total_amount}`)
    console.log(`   - Currency: ${paymentInfo.currency}`)

    // ✅ STEP 9: Create refund in Razorpay
    console.log(`\n📍 STEP 9: Creating Razorpay Refund`)
    const refundAmountInPaise = Math.round(totalRefundAmount * 100) // Convert to paise
    console.log(`💰 Refund amount in paise: ${refundAmountInPaise}`)
    
    const razorpayRefund = await createRazorpayRefund(paymentInfo.razorpay_payment_id, {
      amount: refundAmountInPaise,
      speed: 'optimum', // For instant refunds
      receipt: `refund_${orderId}_${vendorId}_${Date.now()}`,
      notes: {
        vendor_id: vendorId,
        order_id: orderId,
        refund_reason: refund_reason || 'Vendor initiated refund',
        items_count: refundedItems.length.toString(),
        medusa_order_id: orderId,
        medusa_vendor_id: vendorId,
        ...notes
      }
    })

    // ✅ STEP 10: Log success and return response
    console.log(`\n📍 STEP 10: Refund Processing Complete`)
    console.log(`✅ SUCCESS! Refund processed successfully:`)
    console.log(`   - Razorpay Refund ID: ${razorpayRefund.id}`)
    console.log(`   - Amount: ₹${totalRefundAmount}`)
    console.log(`   - Status: ${razorpayRefund.status}`)
    console.log(`   - Speed Processed: ${razorpayRefund.speed_processed}`)
    console.log(`   - Created At: ${new Date(razorpayRefund.created_at * 1000).toISOString()}`)

    console.log(`🔥 ============ REFUND REQUEST COMPLETED ============\n`)

    // ✅ Return success response
    res.status(201).json({
      success: true,
      refund: {
        id: razorpayRefund.id,
        order_id: orderId,
        vendor_id: vendorId,
        amount: totalRefundAmount,
        currency: paymentInfo.currency,
        status: razorpayRefund.status,
        speed_processed: razorpayRefund.speed_processed,
        created_at: new Date(razorpayRefund.created_at * 1000).toISOString(),
        razorpay_refund_id: razorpayRefund.id,
        razorpay_payment_id: paymentInfo.razorpay_payment_id,
        items: refundedItems.map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.refund_quantity,
          amount: item.refund_amount,
          reason: item.reason
        }))
      },
      message: `Refund of ₹${totalRefundAmount} processed successfully${razorpayRefund.speed_processed === 'instant' ? ' and will be credited instantly' : ' and will be credited in 5-7 working days'}`,
      debug_info: {
        razorpay_connected: true,
        payment_found: true,
        refund_created: true,
        razorpay_refund_id: razorpayRefund.id
      }
    })

  } catch (error: any) {
    console.error(`\n🔥 ============ REFUND REQUEST FAILED ============`)
    console.error(`❌ Error occurred at: ${new Date().toISOString()}`)
    console.error(`📋 Error Type: ${error.constructor.name}`)
    console.error(`📋 Error Message: ${error.message}`)
    console.error(`📋 Error Stack:`, error.stack)
    console.error(`🔥 ===============================================\n`)
    
    if (error instanceof MedusaError) {
      throw error
    }
    
    // Handle Razorpay-specific errors
    if (error.message?.includes('Razorpay') || error.message?.includes('payment')) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Payment gateway error: ${error.message}`
      )
    }
    
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Failed to process refund: ${error.message}`
    )
  }
}