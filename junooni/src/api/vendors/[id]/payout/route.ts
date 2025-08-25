// import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
// import { MedusaError } from "@medusajs/framework/utils"

// const PAYOUT_MODULE = "payout"

// // GET /store/vendors/[id]/payout - Get vendor payout details with debugging
// export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
//   const { id } = req.params
//   const vendorId = id

//   console.log("🔍 Starting payout fetch for vendor:", vendorId)
//   console.log("📋 Request params:", req.params)

//   if (!vendorId) {
//     throw new MedusaError(
//       MedusaError.Types.INVALID_DATA,
//       "Vendor ID is required"
//     )
//   }

//   const payoutModuleService = req.scope.resolve(PAYOUT_MODULE)
  
//   // Debug: Check what methods are available on the service
//   console.log("🛠️ Available service methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(payoutModuleService)))

//   let debugInfo = {
//     vendorId,
//     service_calls: {},
//     errors: {},
//     raw_results: {}
//   }

//   try {
//     console.log(`🚀 Fetching payout data for vendor: ${vendorId}`)

//     // Debug each service call individually
    
//     // 1. Test getVendorPayout
//     console.log("📞 Calling getVendorPayout...")
//     let vendorPayout = null
//     try {
//       vendorPayout = await payoutModuleService.getVendorPayout(vendorId)
//       console.log("✅ getVendorPayout result:", vendorPayout ? "Found data" : "No data")
//       debugInfo.service_calls.getVendorPayout = "success"
//       debugInfo.raw_results.vendorPayout = vendorPayout
//     } catch (error) {
//       console.error("❌ getVendorPayout error:", error.message)
//       debugInfo.errors.getVendorPayout = error.message
//     }

//     // 2. Test getBalance
//     console.log("📞 Calling getBalance...")
//     let currentBalance = 0
//     try {
//       currentBalance = await payoutModuleService.getBalance(vendorId)
//       console.log("✅ getBalance result:", currentBalance)
//       debugInfo.service_calls.getBalance = "success"
//       debugInfo.raw_results.currentBalance = currentBalance
//     } catch (error) {
//       console.error("❌ getBalance error:", error.message)
//       debugInfo.errors.getBalance = error.message
//     }

//     // 3. Test listPayouts with detailed logging
//     console.log("📞 Calling listPayouts...")
//     let payoutHistory = []
//     try {
//       // Try without any options first
//       const basicList = await payoutModuleService.listPayouts({
//         vendor_id: vendorId,
//       })
//       console.log("✅ Basic listPayouts result:", basicList ? basicList.length : 0, "records")
      
//       // Try with options
//       payoutHistory = await payoutModuleService.listPayouts({
//         vendor_id: vendorId,
//       }, {
//         take: 20,
//         order: { created_at: "DESC" },
//       })
//       console.log("✅ Full listPayouts result:", payoutHistory ? payoutHistory.length : 0, "records")
      
//       debugInfo.service_calls.listPayouts = "success"
//       debugInfo.raw_results.payoutHistory = payoutHistory
//       debugInfo.raw_results.basicListCount = basicList ? basicList.length : 0
      
//       // If we got results, log the first one
//       if (payoutHistory && payoutHistory.length > 0) {
//         console.log("📄 Sample payout record:", {
//           id: payoutHistory[0].id,
//           vendor_id: payoutHistory[0].vendor_id,
//           type: payoutHistory[0].type,
//           amount: payoutHistory[0].amount,
//           status: payoutHistory[0].status
//         })
//       }
      
//     } catch (error) {
//       console.error("❌ listPayouts error:", error.message)
//       debugInfo.errors.listPayouts = error.message
//     }

//     // 4. Test listPayouts without filters to see if ANY data exists
//     console.log("📞 Calling listPayouts without vendor filter...")
//     try {
//       const allPayouts = await payoutModuleService.listPayouts({})
//       console.log("📊 Total payouts in system:", allPayouts ? allPayouts.length : 0)
//       debugInfo.raw_results.totalPayoutsInSystem = allPayouts ? allPayouts.length : 0
      
//       if (allPayouts && allPayouts.length > 0) {
//         const uniqueVendors = [...new Set(allPayouts.map(p => p.vendor_id))]
//         console.log("👥 Unique vendor IDs in system:", uniqueVendors.slice(0, 5))
//         debugInfo.raw_results.sampleVendorIds = uniqueVendors.slice(0, 5)
        
//         // Check if our vendor ID exists in any form
//         const vendorMatch = allPayouts.find(p => 
//           p.vendor_id === vendorId || 
//           p.vendor_id?.toString() === vendorId ||
//           vendorId.includes(p.vendor_id) ||
//           p.vendor_id?.includes(vendorId)
//         )
        
//         if (vendorMatch) {
//           console.log("🎯 Found potential vendor match:", vendorMatch.vendor_id)
//           debugInfo.raw_results.potentialMatch = vendorMatch.vendor_id
//         } else {
//           console.log("❌ No vendor match found for:", vendorId)
//         }
//       }
//     } catch (error) {
//       console.error("❌ Error getting all payouts:", error.message)
//       debugInfo.errors.getAllPayouts = error.message
//     }

//     // 5. Test if the service has the expected methods
//     const serviceMethods = [
//       'getVendorPayout',
//       'getBalance', 
//       'listPayouts',
//       'addEarnings',
//       'processPayout'
//     ]
    
//     debugInfo.raw_results.availableMethods = serviceMethods.filter(method => 
//       typeof payoutModuleService[method] === 'function'
//     )
    
//     console.log("🔧 Available expected methods:", debugInfo.raw_results.availableMethods)

//     res.status(200).json({
//       success: true,
//       data: {
//         vendorId,
//         currentBalance,
//         vendorPayout,
//         recentPayouts: payoutHistory,
//       },
//       debug_info: debugInfo,
//       message: "Check server console for detailed debugging logs"
//     })

//   } catch (error) {
//     console.error(`💥 Fatal error fetching vendor payout data for ${vendorId}:`, error)
    
//     res.status(200).json({
//       success: false,
//       error: error.message,
//       debug_info: debugInfo,
//       message: "Check server console for detailed error logs"
//     })
//   }
// }
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

const PAYOUT_MODULE = "payout"

// GET /store/vendors/[id]/payout - Get vendor payout details
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const vendorId = id

  if (!vendorId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Vendor ID is required"
    )
  }

  try {
    const payoutModuleService = req.scope.resolve(PAYOUT_MODULE)
    
    console.log(`🚀 Fetching payout data for vendor: ${vendorId}`)

    // DEBUG: Let's see what's actually in the database
    console.log("🔍 DEBUG: Getting all payouts for vendor...")
    const allVendorPayouts = await payoutModuleService.listPayouts({
      vendor_id: vendorId,
    })
    console.log(`📊 Found ${allVendorPayouts?.length || 0} payout records for vendor ${vendorId}`)
    
    if (allVendorPayouts && allVendorPayouts.length > 0) {
      console.log("📋 Sample records:")
      allVendorPayouts.slice(0, 3).forEach((payout, index) => {
        console.log(`  Record ${index + 1}:`, {
          id: payout.id,
          vendor_id: payout.vendor_id,
          type: payout.type,
          amount: payout.amount,
          status: payout.status,
          current_balance: payout.current_balance,
          total_earned: payout.total_earned,
          total_paid: payout.total_paid,
          total_orders: payout.total_orders,
        })
      })
    }

    // DEBUG: Check if there are ANY payouts in the system
    const allPayouts = await payoutModuleService.listPayouts({})
    console.log(`🌍 Total payouts in entire system: ${allPayouts?.length || 0}`)
    
    if (allPayouts && allPayouts.length > 0) {
      const uniqueVendors = [...new Set(allPayouts.map(p => p.vendor_id))]
      console.log(`👥 Unique vendors with payouts: ${uniqueVendors.length}`)
      console.log(`🔍 Our vendor ID "${vendorId}" exists in system:`, uniqueVendors.includes(vendorId))
      
      // Show sample vendor IDs to compare format
      console.log("📝 Sample vendor IDs in system:", uniqueVendors.slice(0, 5))
    }

    // Get vendor's main payout record
    const vendorPayout = await payoutModuleService.getVendorPayout(vendorId)
    console.log("🎯 getVendorPayout result:", vendorPayout ? {
      id: vendorPayout.id,
      current_balance: vendorPayout.current_balance,
      total_earned: vendorPayout.total_earned,
      has_balance_data: vendorPayout.current_balance !== undefined && vendorPayout.current_balance !== null
    } : "null")
    
    // Get current balance
    const currentBalance = await payoutModuleService.getBalance(vendorId)
    console.log("💰 getBalance result:", currentBalance)
    
    // Get recent payout history
    const payoutHistory = await payoutModuleService.listPayouts(
      {
        vendor_id: vendorId,
      },
      {
        take: 20,
        order: { created_at: "DESC" },
      }
    )
    console.log("📚 payoutHistory length:", payoutHistory?.length || 0)

    // Calculate summary statistics
    const totalEarned = vendorPayout?.total_earned || 0
    const totalPaid = vendorPayout?.total_paid || 0
    const totalOrders = vendorPayout?.total_orders || 0
    
    // Separate transaction types
    const earnings = payoutHistory.filter(p => p.type === "earning")
    const payouts = payoutHistory.filter(p => p.type === "payout")
    const adjustments = payoutHistory.filter(p => p.type === "adjustment")

    // Get pending payouts
    const pendingPayouts = payouts.filter(p => 
      p.status === "pending" || p.status === "processing"
    )

    const response = {
      success: true,
      data: {
        vendorId,
        currentBalance,
        
        // Main vendor payout settings
        payoutSettings: {
          isPayoutEnabled: vendorPayout?.is_payout_enabled ?? false,
          holdPayouts: vendorPayout?.hold_payouts ?? false,
          holdReason: vendorPayout?.hold_reason || null,
          minimumPayoutAmount: vendorPayout?.minimum_payout_amount || 0,
          nextPayoutDate: vendorPayout?.next_payout_date || null,
        },
        
        // Summary statistics  
        summary: {
          totalEarned,
          totalPaid,
          totalOrders,
          availableBalance: currentBalance,
          pendingPayoutAmount: pendingPayouts.reduce((sum, p) => sum + Math.abs(p.amount), 0),
        },
        
        // Transaction history
        transactions: {
          recent: payoutHistory.slice(0, 10), // Most recent 10
          earnings: earnings.slice(0, 5),     // Recent 5 earnings
          payouts: payouts.slice(0, 5),       // Recent 5 payouts
          adjustments: adjustments.slice(0, 5), // Recent 5 adjustments
        },
        
        // Payout eligibility
        eligibility: {
          eligible: vendorPayout?.is_payout_enabled && 
                   !vendorPayout?.hold_payouts && 
                   currentBalance >= (vendorPayout?.minimum_payout_amount || 0),
          reasons: vendorPayout ? [
            !vendorPayout.is_payout_enabled && "Payouts disabled",
            vendorPayout.hold_payouts && `Payouts on hold: ${vendorPayout.hold_reason}`,
            currentBalance < (vendorPayout.minimum_payout_amount || 0) && 
              `Balance below minimum (₹${vendorPayout.minimum_payout_amount})`,
          ].filter(Boolean) : ["No payout record found"],
        },
        
        // Timestamps
        lastActivity: {
          lastEarning: vendorPayout?.last_earning_at || null,
          lastPayout: vendorPayout?.last_payout_at || null,
        },
      },
      
      // DEBUG INFO - Remove this after fixing
      debug: {
        rawVendorPayout: vendorPayout,
        rawPayoutHistory: payoutHistory,
        payoutHistoryCount: payoutHistory?.length || 0,
        foundVendorPayout: !!vendorPayout,
        vendorPayoutFields: vendorPayout ? Object.keys(vendorPayout) : [],
      }
    }

    console.log(`✅ Successfully fetched payout data for vendor ${vendorId}:`, {
      balance: currentBalance,
      historyCount: payoutHistory?.length || 0,
      hasPayoutRecord: !!vendorPayout
    })

    res.status(200).json(response)

  } catch (error) {
    console.error(`💥 Error fetching vendor payout data for ${vendorId}:`, error)
    
    // Handle specific errors
    if (error instanceof MedusaError) {
      throw error
    }
    
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Failed to fetch payout data: ${error.message}`
    )
  }
}

// POST /store/vendors/[id]/payout/request - Request payout
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const { amount, paymentMethod, reason } = req.body as {
    amount: number
    paymentMethod: "bank_transfer" | "paypal" | "razorpay" | "manual"
    reason?: string
  }
  const vendorId = id

  if (!vendorId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Vendor ID is required"
    )
  }

  if (!amount || amount <= 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Valid amount is required"
    )
  }

  const allowedMethods = ["bank_transfer", "paypal", "razorpay", "manual"] as const
  if (!paymentMethod || !allowedMethods.includes(paymentMethod)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Payment method is required and must be one of: bank_transfer, paypal, razorpay, manual"
    )
  }

  try {
    const payoutModuleService = req.scope.resolve(PAYOUT_MODULE)
    
    console.log(`💳 Processing payout request for vendor ${vendorId}:`, {
      amount,
      paymentMethod,
      reason: reason || 'Vendor payout request'
    })

    const payoutTransaction = await payoutModuleService.processPayout(
      vendorId,
      amount,
      paymentMethod,
      reason || 'Vendor payout request'
    )

    console.log(`✅ Payout request created:`, payoutTransaction.id)

    res.status(201).json({
      success: true,
      data: {
        payout: payoutTransaction,
        message: "Payout request submitted successfully"
      }
    })

  } catch (error) {
    console.error(`💥 Error processing payout request for ${vendorId}:`, error)
    
    if (error instanceof MedusaError) {
      throw error
    }
    
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Failed to process payout: ${error.message}`
    )
  }
}