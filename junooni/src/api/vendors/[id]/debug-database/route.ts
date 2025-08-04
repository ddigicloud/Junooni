// src/api/admin/debug-database/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const PAYOUT_MODULE = "payout"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  console.log("🔍 === DATABASE DIAGNOSTIC ===")
  
  let diagnosticResults = {
    step1_service_resolution: null,
    step2_database_connection: null,
    step3_table_structure: null,
    step4_basic_query: null,
    step5_service_methods: null
  }
  
  try {
    // STEP 1: Check if payout service can be resolved
    console.log("🔧 STEP 1: Testing service resolution...")
    try {
      const payoutModuleService = req.scope.resolve(PAYOUT_MODULE)
      
      diagnosticResults.step1_service_resolution = {
        success: true,
        service_type: typeof payoutModuleService,
        available_methods: Object.getOwnPropertyNames(Object.getPrototypeOf(payoutModuleService))
      }
      
      console.log("✅ Payout service resolved successfully")
      console.log("📋 Available methods:", diagnosticResults.step1_service_resolution.available_methods)
      
    } catch (error) {
      console.error("❌ Service resolution failed:", error.message)
      diagnosticResults.step1_service_resolution = {
        success: false,
        error: error.message
      }
      
      // If service can't be resolved, return early
      return res.json({
        success: false,
        error: "Payout service cannot be resolved",
        diagnostic_results: diagnosticResults
      })
    }
    
    // STEP 2: Test database connection through known working service
    console.log("\n🔌 STEP 2: Testing database connection...")
    try {
      // Use a known working service to test database
      const orderService = req.scope.resolve("orderModuleService")
      const testQuery = await orderService.listOrders({}, { take: 1 })
      
      diagnosticResults.step2_database_connection = {
        success: true,
        connection_working: true,
        test_query_result: testQuery.length
      }
      
      console.log("✅ Database connection working")
      
    } catch (error) {
      console.error("❌ Database connection failed:", error.message)
      diagnosticResults.step2_database_connection = {
        success: false,
        error: error.message
      }
    }
    
    // STEP 3: Check table structure using raw database access
    console.log("\n🗄️ STEP 3: Checking payout table structure...")
    try {
      // Try to access database through different methods
      let dbAccess = null
      
      // Method 1: Try to get database connection through order service
      try {
        const orderService = req.scope.resolve("orderModuleService")
        if (orderService.manager_) {
          dbAccess = orderService.manager_
        }
      } catch (e) {
        console.log("Could not access DB through orderService")
      }
      
      if (dbAccess) {
        // Check if payout table exists
        const tableCheck = await dbAccess.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'payout'
        `)
        
        diagnosticResults.step3_table_structure = {
          success: true,
          payout_table_exists: tableCheck.length > 0,
          table_info: tableCheck
        }
        
        if (tableCheck.length > 0) {
          // Get column information
          const columns = await dbAccess.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'payout' 
            AND table_schema = 'public'
            ORDER BY ordinal_position
          `)
          
          diagnosticResults.step3_table_structure.columns = columns
          console.log("✅ Payout table exists with", columns.length, "columns")
        } else {
          console.log("❌ Payout table does not exist")
        }
        
      } else {
        diagnosticResults.step3_table_structure = {
          success: false,
          error: "Could not access database for table structure check"
        }
      }
      
    } catch (error) {
      console.error("❌ Table structure check failed:", error.message)
      diagnosticResults.step3_table_structure = {
        success: false,
        error: error.message
      }
    }
    
    // STEP 4: Test basic payout service query
    console.log("\n📊 STEP 4: Testing basic payout service query...")
    try {
      const payoutModuleService = req.scope.resolve(PAYOUT_MODULE)
      
      // Try the simplest possible query
      console.log("🧪 Attempting listPayouts() with no parameters...")
      const basicQuery = await payoutModuleService.listPayouts({})
      
      diagnosticResults.step4_basic_query = {
        success: true,
        result_count: basicQuery.length,
        first_result: basicQuery[0] || null
      }
      
      console.log("✅ Basic query successful, found", basicQuery.length, "records")
      
    } catch (error) {
      console.error("❌ Basic query failed:", error.message)
      diagnosticResults.step4_basic_query = {
        success: false,
        error: error.message,
        error_stack: error.stack
      }
    }
    
    // STEP 5: Test individual service methods
    console.log("\n🎯 STEP 5: Testing individual service methods...")
    try {
      const payoutModuleService = req.scope.resolve(PAYOUT_MODULE)
      const vendorId = "01JN475VCB34HJ702Q242JCDEZ"
      
      const methodTests = {}
      
      // Test getBalance
      try {
        const balance = await payoutModuleService.getBalance(vendorId)
        methodTests['getBalance'] = { success: true, result: balance }
        console.log("✅ getBalance:", balance)
      } catch (error) {
        methodTests['getBalance'] = { success: false, error: error.message }
        console.log("❌ getBalance failed:", error.message)
      }
      
      // Test getVendorPayout
      try {
        const vendorPayout = await payoutModuleService.getVendorPayout(vendorId)
        methodTests['getVendorPayout'] = { success: true, result: vendorPayout }
        console.log("✅ getVendorPayout:", vendorPayout ? "Found" : "Not found")
      } catch (error) {
        methodTests['getVendorPayout'] = { success: false, error: error.message }
        console.log("❌ getVendorPayout failed:", error.message)
      }
      
      diagnosticResults.step5_service_methods = {
        success: true,
        method_tests: methodTests
      }
      
    } catch (error) {
      console.error("❌ Service methods test failed:", error.message)
      diagnosticResults.step5_service_methods = {
        success: false,
        error: error.message
      }
    }
    
    console.log("🔍 === DATABASE DIAGNOSTIC COMPLETED ===")
    
    res.json({
      success: true,
      diagnostic_results: diagnosticResults,
      recommendations: generateDatabaseRecommendations(diagnosticResults)
    })
    
  } catch (error) {
    console.error("💥 Diagnostic error:", error)
    res.json({
      success: false,
      error: error.message,
      diagnostic_results: diagnosticResults
    })
  }
}

function generateDatabaseRecommendations(results: any) {
  const recommendations = []
  
  if (!results.step1_service_resolution?.success) {
    recommendations.push("Payout module is not properly registered - check medusa-config.js")
  }
  
  if (!results.step2_database_connection?.success) {
    recommendations.push("Database connection issue - check DATABASE_URL and database server")
  }
  
  if (results.step3_table_structure?.success && !results.step3_table_structure?.payout_table_exists) {
    recommendations.push("Payout table missing - run 'npx medusa db:migrate' or create tables manually")
  }
  
  if (!results.step4_basic_query?.success) {
    recommendations.push("Payout service database queries failing - check service implementation")
  }
  
  if (results.step5_service_methods?.success) {
    const failedMethods = Object.entries(results.step5_service_methods.method_tests)
      .filter(([_, test]: [string, any]) => !test.success)
      .map(([method, _]) => method)
    
    if (failedMethods.length > 0) {
      recommendations.push(`Service methods failing: ${failedMethods.join(', ')}`)
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Database and service appear to be working - check workflow logic")
  }
  
  return recommendations
}