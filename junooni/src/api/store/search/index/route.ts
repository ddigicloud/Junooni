// // src/api/admin/products/force-reset/route.ts - PRODUCTION-READY VERSION
// // ✅ FIXED: Dynamic region handling, environment validation, dry run support

// import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
// import { typesenseService } from "../../../../../lib/typesense"

// // 🔧 CONFIGURATION: Replace with your production region ID
// // ===========================================================
// const PRODUCTION_REGION_ID = 'reg_01K4890NFNFQ6MQ9YPKBT2P001'  // ⚠️ CHANGE THIS!
// // ===========================================================

// export async function POST(
//   req: MedusaRequest,
//   res: MedusaResponse
// ): Promise<void> {
//   try {
//     // ✅ FIX 1: Environment validation - prevent indexing localhost data
//     console.log('🔍 [REINDEX] Environment Check:')
//     console.log('  NODE_ENV:', process.env.NODE_ENV)
//     console.log('  DATABASE:', process.env.DATABASE_URL?.split('@')[1]) // Only show host, hide credentials
//     console.log('  TYPESENSE_HOST:', process.env.TYPESENSE_HOST)
//     console.log('  TYPESENSE_PORT:', process.env.TYPESENSE_PORT)
//     console.log('  TYPESENSE_PROTOCOL:', process.env.TYPESENSE_PROTOCOL)
    
//     // Validate we're not accidentally indexing localhost data to production Typesense
//     const databaseUrl = process.env.DATABASE_URL || ''
//     if (databaseUrl.includes('127.0.0.1')) {
//       console.error('⚠️ [REINDEX] CRITICAL: Connected to LOCALHOST database!')
//       return res.status(400).json({
//         success: false,
//         error: 'Safety check failed: Cannot run reindexing while connected to localhost database',
//         current_database: databaseUrl.split('@')[1] || 'unknown',
//         advice: 'Make sure DATABASE_URL environment variable points to production database',
//         environment: {
//           NODE_ENV: process.env.NODE_ENV,
//           DATABASE: databaseUrl.split('@')[1],
//           TYPESENSE_HOST: process.env.TYPESENSE_HOST
//         }
//       })
//     }
    
//     console.log('✅ [REINDEX] Environment validation passed - using production database')
    
//     // ✅ FIX 2: Admin authentication (optional - comment out if not needed)
//     // Uncomment this section if you want to require admin authentication:
//     /*
//     const adminUser = req.auth_context?.actor_id
//     if (!adminUser) {
//       console.error('🔐 [REINDEX] Unauthorized access attempt')
//       return res.status(401).json({
//         success: false,
//         error: 'Unauthorized - Admin access required for reindexing'
//       })
//     }
//     console.log('🔐 [REINDEX] Admin user authenticated:', adminUser)
//     */
    
//     // ✅ FIX 3: Extract parameters with dry_run support
//     const { confirm_reset, region_id, dry_run = false } = req.body
//     const query = req.scope.resolve("query")

//     // ✅ FIX 4: Dynamic region handling with production fallback
//     let regionToUse = region_id
    
//     if (!regionToUse) {
//       console.log('📍 [REINDEX] No region_id provided, attempting to fetch default region...')
      
//       try {
//         // Try to get the default region from database
//         const { data: regions } = await query.graph({
//           entity: "region",
//           fields: ["id", "name", "currency_code"],
//           options: { take: 1 }
//         })
        
//         if (regions && regions.length > 0) {
//           regionToUse = regions[0].id
//           console.log(`✅ [REINDEX] Using fetched region: ${regionToUse} (${regions[0].name})`)
//         } else {
//           // Fallback to configured production region
//           regionToUse = PRODUCTION_REGION_ID
//           console.log(`⚠️ [REINDEX] No regions found in database, using configured production region: ${regionToUse}`)
//         }
//       } catch (regionError) {
//         console.error('❌ [REINDEX] Failed to fetch regions from database:', regionError.message)
        
//         // Fallback to configured production region
//         regionToUse = PRODUCTION_REGION_ID
//         console.log(`⚠️ [REINDEX] Using configured production region as fallback: ${regionToUse}`)
//       }
//     } else {
//       console.log(`📍 [REINDEX] Using provided region: ${regionToUse}`)
//     }
    
//     // Validate region was set
//     if (!regionToUse || regionToUse === 'reg_YOUR_PRODUCTION_REGION_ID_HERE') {
//       return res.status(400).json({
//         success: false,
//         error: 'No valid region configured',
//         advice: 'Please update PRODUCTION_REGION_ID in the route file or provide region_id in request body'
//       })
//     }

//     console.log('🔄 [REINDEX] FORCE RESET: Completely recreating Typesense collection with COMPLETE variant-specific image support...')

//     // ✅ FIX 5: Dry run mode - preview without making changes
//     if (dry_run) {
//       console.log('🧪 [REINDEX] DRY RUN MODE - No changes will be made')
      
//       // Fetch products to see what would be indexed
//       const { data: products } = await query.graph({
//         entity: "product",
//         fields: [
//           "id", "title", "subtitle", "description", "handle", "is_giftcard", "discountable", 
//           "status", "thumbnail", "created_at", "updated_at", "metadata", "type_id", "weight", 
//           "length", "height", "width", "hs_code", "origin_country", "mid_code", "material",
          
//           // Complete vendor data
//           "vendor.*", "vendor.id", "vendor.name", "vendor.handle", "vendor.logo", "vendor.coverphoto",
//           "vendor.youtube", "vendor.instagram", "vendor.xtwitter", "vendor.othersocial", 
//           "vendor.phonenumber", "vendor.GSTIN", "vendor.gst_verification_status", "vendor.companyname",
//           "vendor.pan_number", "vendor.city", "vendor.pincode", "vendor.state", "vendor.address",
//           "vendor.tan_number", "vendor.bank_account_holder_name", "vendor.bank_account_number",
//           "vendor.bank_account_ifsc_code", "vendor.bank_name", "vendor.bank_account_type",
//           "vendor.cancelled_checkque", "vendor.creator_bio", "vendor.creator_title", 
//           "vendor.creator_category", "vendor.verified", "vendor.metadata", "vendor.created_at", 
//           "vendor.updated_at", "vendor.deleted_at",
          
//           // Complete variant data with metadata
//           "variants.*", "variants.id", "variants.title", "variants.sku", "variants.barcode", 
//           "variants.ean", "variants.upc", "variants.allow_backorder", "variants.manage_inventory",
//           "variants.inventory_quantity", "variants.variant_rank", 
//           "variants.metadata", "variants.metadata.*",
//           "variants.weight", "variants.length", "variants.height", "variants.width", 
//           "variants.hs_code", "variants.origin_country", "variants.mid_code", "variants.material",
//           "variants.calculated_price", "variants.prices.*", "variants.options.*", "variants.options.option.*",
//           "variants.created_at", "variants.updated_at", "variants.deleted_at",
          
//           // Complete collection, categories, tags
//           "collection.*", "collection.id", "collection.title", "collection.handle", "collection.metadata",
//           "collection.created_at", "collection.updated_at", "collection.deleted_at",
//           "categories.*", "categories.id", "categories.name", "categories.handle", "categories.description",
//           "categories.mpath", "categories.is_active", "categories.is_internal", "categories.rank",
//           "categories.metadata", "categories.parent_category_id", "categories.parent_category.*",
//           "categories.created_at", "categories.updated_at", "categories.deleted_at",
//           "tags.*", "tags.id", "tags.value", "tags.created_at", "tags.updated_at", "tags.deleted_at",
          
//           // Complete images array
//           "images.*", "images.id", "images.url", "images.metadata", "images.rank", "images.product_id",
//           "images.created_at", "images.updated_at", "images.deleted_at",
          
//           // Complete product options
//           "options.*", "options.id", "options.title", "options.metadata", "options.product_id",
//           "options.created_at", "options.updated_at", "options.deleted_at",
//           "options.values.*", "options.values.id", "options.values.value", "options.values.metadata",
//           "options.values.option_id", "options.values.created_at", "options.values.updated_at", 
//           "options.values.deleted_at"
//         ],
//         filters: { status: 'published' },
//         options: { region_id: regionToUse }
//       })

//       const dataQuality = await analyzeCompleteDataQuality(products)
//       const variantImageAnalysis = analyzeCompleteVariantSpecificImageData(products)

//       return res.json({
//         dry_run: true,
//         success: true,
//         message: '🧪 DRY RUN COMPLETED - No changes were made to Typesense',
//         preview: {
//           would_index: products.length,
//           region_used: regionToUse,
//           data_quality: dataQuality,
//           variant_image_analysis: variantImageAnalysis,
//           sample_products: products.slice(0, 3).map(p => ({
//             id: p.id,
//             title: p.title,
//             has_vendor: !!p.vendor?.name,
//             has_images: !!p.images?.length,
//             has_variants: !!p.variants?.length,
//             has_metadata: !!p.metadata,
//             has_option_images: !!p.metadata?.option_images,
//             has_variant_images: !!p.metadata?.variant_images
//           }))
//         },
//         environment: {
//           database: process.env.DATABASE_URL?.split('@')[1],
//           typesense_host: process.env.TYPESENSE_HOST,
//           node_env: process.env.NODE_ENV
//         },
//         next_steps: [
//           'Review the preview data above',
//           'If everything looks correct, run again with {"confirm_reset": true}',
//           'Make sure the database and region are correct'
//         ]
//       })
//     }

//     // ✅ Require confirmation for actual reindexing
//     if (!confirm_reset) {
//       return res.json({
//         message: 'Force collection reset with COMPLETE VARIANT-SPECIFIC IMAGE SUPPORT',
//         warning: '⚠️ This will completely delete and recreate the products collection',
//         new_features: [
//           '✅ COMPLETE color-based image switching support',
//           '✅ Option images mapping (color -> image)',
//           '✅ Variant images mapping (variant ID -> image)',
//           '✅ COMPLETE variant metadata preservation (variant.metadata.variant_images)',
//           '✅ COMPLETE variant image IDs preservation (variant.metadata.variant_image_ids)',
//           '✅ Enhanced metadata for ProductPreview integration',
//           '✅ Variant-specific image option settings',
//           '✅ Fulfillment type metadata',
//           '✅ COMPLETE vendor, collection, categories structure',
//           '✅ Robust JSON parsing and error handling',
//           '✅ ALL images array with complete properties'
//         ],
//         safety_features: [
//           '🔒 Environment validation (prevents localhost data indexing)',
//           '🧪 Dry run mode (preview before committing)',
//           '📍 Dynamic region handling',
//           '🔐 Admin authentication support (optional)'
//         ],
//         usage: {
//           dry_run: 'Send POST with {"dry_run": true} to preview without changes',
//           confirm: 'Send POST with {"confirm_reset": true} to proceed with reindexing',
//           with_region: 'Send POST with {"confirm_reset": true, "region_id": "reg_xxx"} to use specific region'
//         },
//         current_environment: {
//           database: process.env.DATABASE_URL?.split('@')[1],
//           typesense_host: process.env.TYPESENSE_HOST,
//           region_to_use: regionToUse
//         },
//         current_schema_info: await getCurrentSchemaInfo()
//       })
//     }

//     console.log('🗑️ [REINDEX] STEP 1: Force deleting existing collection...')
    
//     // Force delete existing collection
//     try {
//       await typesenseService.client.collections('products').delete()
//       console.log('✅ [REINDEX] Collection deleted successfully')
//     } catch (deleteError) {
//       console.log('ℹ️ [REINDEX] Collection might not exist or already deleted:', deleteError.message)
//     }

//     // Wait for deletion to complete
//     await new Promise(resolve => setTimeout(resolve, 1000))

//     console.log('🏗️ [REINDEX] STEP 2: Creating COMPLETE collection schema with VARIANT-SPECIFIC IMAGE support...')
    
//     // Complete schema with all variant-specific image fields
//     const completeSchemaWithVariantSpecificImages = {
//       name: 'products',
//       fields: [
//         // Basic product fields
//         { name: 'id', type: 'string' },
//         { name: 'title', type: 'string' },
//         { name: 'description', type: 'string', optional: true },
//         { name: 'handle', type: 'string' },
//         { name: 'status', type: 'string', facet: true },
//         { name: 'thumbnail', type: 'string', optional: true },
//         { name: 'first_image_url', type: 'string', optional: true },
//         { name: 'created_at', type: 'int64' },
//         { name: 'updated_at', type: 'int64' },
        
//         // Collection fields
//         { name: 'collection_title', type: 'string', facet: true, optional: true },
//         { name: 'collection_handle', type: 'string', optional: true },
//         { name: 'collection_id', type: 'string', optional: true },
        
//         // Vendor fields
//         { name: 'vendor_id', type: 'string', optional: true, facet: true },
//         { name: 'vendor_name', type: 'string', optional: true, facet: true },
//         { name: 'vendor_handle', type: 'string', optional: true },
        
//         // Price fields (stored as integers in cents)
//         { name: 'min_price_amount', type: 'int64', optional: true },
//         { name: 'max_price_amount', type: 'int64', optional: true },
//         { name: 'currency_code', type: 'string', optional: true, facet: true },
        
//         // Variant information
//         { name: 'variant_count', type: 'int32', optional: true },
//         { name: 'variant_titles', type: 'string', optional: true },
//         { name: 'has_variants', type: 'bool', optional: true },
        
//         // Enhanced metadata
//         { name: 'color_names', type: 'string', optional: true, facet: true },
//         { name: 'color_hex_values', type: 'string', optional: true },
//         { name: 'tags', type: 'string', facet: true, optional: true },
//         { name: 'categories', type: 'string', facet: true, optional: true },
        
//         // COMPLETE VARIANT-SPECIFIC IMAGE FIELDS
//         { name: 'all_images', type: 'string', optional: true },
//         { name: 'option_images', type: 'string', optional: true },
//         { name: 'variant_images', type: 'string', optional: true },
//         { name: 'variant_specific_image_option', type: 'string', optional: true },
//         { name: 'fulfillment_type', type: 'string', optional: true },
        
//         // COMPLETE VARIANT DATA with metadata preservation
//         { name: 'variants_data', type: 'string', optional: true },
//         { name: 'options_data', type: 'string', optional: true },
        
//         // Search optimization
//         { name: 'search_text', type: 'string', optional: true },
//       ],
//       default_sorting_field: 'created_at',
//       token_separators: ['-', '_', '.', '/', '\\'],
//       symbols_to_index: ['#', '+', '&', '@'],
//     }

//     // Create the new collection
//     const newCollection = await typesenseService.client.collections().create(completeSchemaWithVariantSpecificImages)
//     console.log('✅ [REINDEX] Complete collection with VARIANT-SPECIFIC IMAGE support created successfully')

//     console.log('📊 [REINDEX] STEP 3: Verifying new schema with complete variant-specific image fields...')
//     const verifySchema = await typesenseService.client.collections('products').retrieve()
//     const enhancedFields = verifySchema.fields.filter(f => 
//       ['vendor_name', 'min_price_amount', 'search_text', 'color_names'].includes(f.name)
//     )
//     const completeVariantSpecificImageFields = verifySchema.fields.filter(f => 
//       ['option_images', 'variant_images', 'variants_data', 'options_data', 'all_images', 'variant_specific_image_option', 'fulfillment_type'].includes(f.name)
//     )

//     console.log(`✅ [REINDEX] Schema verified: ${enhancedFields.length}/4 enhanced fields + ${completeVariantSpecificImageFields.length}/7 complete variant-specific image fields created`)
//     enhancedFields.forEach(field => {
//       console.log(`  ✅ ${field.name} (${field.type}${field.facet ? ', facetable' : ''})`)
//     })
//     completeVariantSpecificImageFields.forEach(field => {
//       console.log(`  🎨 ${field.name} (${field.type}) - COMPLETE VARIANT-SPECIFIC IMAGE SUPPORT`)
//     })

//     console.log('📦 [REINDEX] STEP 4: Fetching products with COMPLETE variant-specific image data...')
    
//     // Fetch products with ALL required fields
//     const { data: products } = await query.graph({
//       entity: "product",
//       fields: [
//         "id", "title", "subtitle", "description", "handle", "is_giftcard", "discountable", 
//         "status", "thumbnail", "created_at", "updated_at", "metadata", "type_id", "weight", 
//         "length", "height", "width", "hs_code", "origin_country", "mid_code", "material",
        
//         // Complete vendor data
//         "vendor.*", "vendor.id", "vendor.name", "vendor.handle", "vendor.logo", "vendor.coverphoto",
//         "vendor.youtube", "vendor.instagram", "vendor.xtwitter", "vendor.othersocial", 
//         "vendor.phonenumber", "vendor.GSTIN", "vendor.gst_verification_status", "vendor.companyname",
//         "vendor.pan_number", "vendor.city", "vendor.pincode", "vendor.state", "vendor.address",
//         "vendor.tan_number", "vendor.bank_account_holder_name", "vendor.bank_account_number",
//         "vendor.bank_account_ifsc_code", "vendor.bank_name", "vendor.bank_account_type",
//         "vendor.cancelled_checkque", "vendor.creator_bio", "vendor.creator_title", 
//         "vendor.creator_category", "vendor.verified", "vendor.metadata", "vendor.created_at", 
//         "vendor.updated_at", "vendor.deleted_at",
        
//         // Complete variant data with metadata
//         "variants.*", "variants.id", "variants.title", "variants.sku", "variants.barcode", 
//         "variants.ean", "variants.upc", "variants.allow_backorder", "variants.manage_inventory",
//         "variants.inventory_quantity", "variants.variant_rank", 
//         "variants.metadata", "variants.metadata.*",
//         "variants.weight", "variants.length", "variants.height", "variants.width", 
//         "variants.hs_code", "variants.origin_country", "variants.mid_code", "variants.material",
//         "variants.calculated_price", "variants.prices.*", "variants.options.*", "variants.options.option.*",
//         "variants.created_at", "variants.updated_at", "variants.deleted_at",
        
//         // Complete collection, categories, tags
//         "collection.*", "collection.id", "collection.title", "collection.handle", "collection.metadata",
//         "collection.created_at", "collection.updated_at", "collection.deleted_at",
//         "categories.*", "categories.id", "categories.name", "categories.handle", "categories.description",
//         "categories.mpath", "categories.is_active", "categories.is_internal", "categories.rank",
//         "categories.metadata", "categories.parent_category_id", "categories.parent_category.*",
//         "categories.created_at", "categories.updated_at", "categories.deleted_at",
//         "tags.*", "tags.id", "tags.value", "tags.created_at", "tags.updated_at", "tags.deleted_at",
        
//         // Complete images array
//         "images.*", "images.id", "images.url", "images.metadata", "images.rank", "images.product_id",
//         "images.created_at", "images.updated_at", "images.deleted_at",
        
//         // Complete product options
//         "options.*", "options.id", "options.title", "options.metadata", "options.product_id",
//         "options.created_at", "options.updated_at", "options.deleted_at",
//         "options.values.*", "options.values.id", "options.values.value", "options.values.metadata",
//         "options.values.option_id", "options.values.created_at", "options.values.updated_at", 
//         "options.values.deleted_at"
//       ],
//       filters: { status: 'published' },
//       options: { region_id: regionToUse }
//     })

//     console.log(`📦 [REINDEX] Found ${products.length} published products`)

//     if (products.length === 0) {
//       return res.json({
//         success: true,
//         message: 'Complete collection with variant-specific images created but no products to index',
//         warning: '⚠️ No published products found in database',
//         schema_info: {
//           total_fields: verifySchema.fields.length,
//           enhanced_fields: enhancedFields.map(f => f.name),
//           complete_variant_specific_image_fields: completeVariantSpecificImageFields.map(f => f.name)
//         },
//         advice: 'Check if products exist and are published in your database'
//       })
//     }

//     // Get region data
//     let regionData = { currency_code: 'USD' }
//     try {
//       const regionQuery = await query.graph({
//         entity: "region",
//         fields: ["id", "name", "currency_code"],
//         filters: { id: regionToUse }
//       })
//       regionData = regionQuery.data?.[0] || regionData
//       console.log(`💱 [REINDEX] Using region currency: ${regionData.currency_code}`)
//     } catch (e) {
//       console.warn('[REINDEX] Using default region data:', regionData)
//     }

//     console.log('🔍 [REINDEX] STEP 5: Analyzing products for COMPLETE variant-specific image data...')
//     const completeVariantSpecificImageAnalysis = analyzeCompleteVariantSpecificImageData(products)
//     console.log('🎨 [REINDEX] Complete Variant-Specific Image Analysis:', completeVariantSpecificImageAnalysis)

//     // Index products using the enhanced service
//     console.log('🔄 [REINDEX] STEP 6: Indexing products with COMPLETE variant-specific image support...')
//     await typesenseService.indexProducts(products, regionData)

//     // Final verification
//     console.log('✅ [REINDEX] STEP 7: Verifying indexed data with complete variant-specific image support...')
//     const finalStats = await typesenseService.client.collections('products').retrieve()
    
//     // Test search functionality
//     console.log('🧪 [REINDEX] STEP 8: Testing complete color-based search functionality...')
//     const testSearchResults = await testCompleteColorBasedSearch()
    
//     console.log('✅ [REINDEX] FORCE RESET COMPLETE WITH COMPLETE VARIANT-SPECIFIC IMAGE SUPPORT!')

//     res.json({
//       success: true,
//       message: '🎉 Collection force reset completed successfully with COMPLETE VARIANT-SPECIFIC IMAGE SUPPORT',
//       steps_completed: [
//         '✅ Environment validated (production database confirmed)',
//         '✅ Old collection deleted',
//         '✅ Complete schema with variant-specific images created', 
//         '✅ Products fetched with complete variant-specific image data',
//         '✅ Complete indexing with variant-specific image support completed',
//         '✅ Complete color-based search functionality verified'
//       ],
//       final_stats: {
//         collection_name: finalStats.name,
//         total_documents: finalStats.num_documents,
//         total_fields: finalStats.fields.length,
//         region_used: regionToUse,
//         enhanced_fields_created: enhancedFields.map(f => ({ 
//           name: f.name, 
//           type: f.type, 
//           facet: f.facet 
//         })),
//         complete_variant_specific_image_fields_created: completeVariantSpecificImageFields.map(f => ({ 
//           name: f.name, 
//           type: f.type 
//         }))
//       },
//       data_quality: await analyzeCompleteDataQuality(products),
//       complete_variant_specific_image_analysis: completeVariantSpecificImageAnalysis,
//       color_search_test: testSearchResults,
//       environment: {
//         database: process.env.DATABASE_URL?.split('@')[1],
//         typesense_host: process.env.TYPESENSE_HOST,
//         node_env: process.env.NODE_ENV
//       },
//       next_steps: [
//         '🔍 Test search with: POST /store/products/search',
//         '📊 Check schema: GET /store/products/search',
//         '🎯 Use color filtering: {"query": "test", "colors": "blue,red"}',
//         '🎨 Verify COMPLETE variant-specific image switching in ProductPreview components',
//         '🔧 Test COMPLETE color-based image variants in search results',
//         '🏪 Test vendor filtering: {"query": "test", "vendors": "vendorname"}',
//         '💰 Test price filtering: {"query": "test", "price_min": 10, "price_max": 100}'
//       ],
//       complete_variant_specific_image_features: {
//         color_based_image_switching: true,
//         option_images_support: completeVariantSpecificImageAnalysis.products_with_option_images > 0,
//         variant_images_support: completeVariantSpecificImageAnalysis.products_with_variant_images > 0,
//         variant_specific_metadata_support: completeVariantSpecificImageAnalysis.products_with_variant_specific_metadata > 0,
//         complete_image_data: completeVariantSpecificImageAnalysis.products_with_complete_image_data > 0,
//         complete_variant_data: completeVariantSpecificImageAnalysis.products_with_complete_variant_data > 0,
//         complete_options_data: completeVariantSpecificImageAnalysis.products_with_complete_options_data > 0,
//         vendor_data_support: completeVariantSpecificImageAnalysis.products_with_vendor_data > 0,
//         collection_data_support: completeVariantSpecificImageAnalysis.products_with_collection_data > 0,
//         ready_for_production: completeVariantSpecificImageAnalysis.ready_for_complete_functionality
//       }
//     })

//   } catch (error) {
//     console.error('❌ [REINDEX] Force reset with complete variant-specific images failed:', error)
//     res.status(500).json({
//       success: false,
//       error: 'Force reset with complete variant-specific image support failed',
//       details: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     })
//   }
// }

// // Helper function to get current schema info
// async function getCurrentSchemaInfo() {
//   try {
//     const collection = await typesenseService.client.collections('products').retrieve()
//     const enhancedFields = collection.fields.filter(f => 
//       ['vendor_name', 'min_price_amount', 'search_text', 'color_names'].includes(f.name)
//     )
//     const completeVariantSpecificImageFields = collection.fields.filter(f => 
//       ['option_images', 'variant_images', 'variants_data', 'options_data', 'all_images', 'variant_specific_image_option', 'fulfillment_type'].includes(f.name)
//     )
    
//     return {
//       exists: true,
//       total_fields: collection.fields.length,
//       total_documents: collection.num_documents,
//       enhanced_fields: enhancedFields.length,
//       complete_variant_specific_image_fields: completeVariantSpecificImageFields.length,
//       missing_enhanced_fields: 4 - enhancedFields.length,
//       missing_complete_variant_specific_image_fields: 7 - completeVariantSpecificImageFields.length,
//       needs_reset: enhancedFields.length < 4 || completeVariantSpecificImageFields.length < 5,
//       has_complete_variant_specific_image_support: completeVariantSpecificImageFields.length >= 5,
//       current_enhanced_fields: enhancedFields.map(f => f.name),
//       current_complete_variant_specific_image_fields: completeVariantSpecificImageFields.map(f => f.name)
//     }
//   } catch (error) {
//     return {
//       exists: false,
//       error: error.message,
//       needs_reset: true,
//       has_complete_variant_specific_image_support: false
//     }
//   }
// }

// // Helper function to analyze data quality
// async function analyzeCompleteDataQuality(products: any[]) {
//   const withVendor = products.filter(p => p.vendor?.name).length
//   const withPrice = products.filter(p => 
//     p.variants?.[0]?.calculated_price?.calculated_amount || 
//     p.variants?.[0]?.prices?.[0]?.amount
//   ).length
//   const withColors = products.filter(p => p.metadata?.color_hex_values).length
//   const withImages = products.filter(p => p.images && p.images.length > 0).length
//   const withCollection = products.filter(p => p.collection?.title).length
//   const withCategories = products.filter(p => p.categories && p.categories.length > 0).length
//   const withTags = products.filter(p => p.tags && p.tags.length > 0).length
//   const withVariants = products.filter(p => p.variants && p.variants.length > 0).length
//   const withOptions = products.filter(p => p.options && p.options.length > 0).length
  
//   return {
//     total_products: products.length,
//     with_vendor: withVendor,
//     with_vendor_percentage: Math.round(withVendor/products.length*100),
//     with_price: withPrice,
//     with_price_percentage: Math.round(withPrice/products.length*100),
//     with_colors: withColors,
//     with_colors_percentage: Math.round(withColors/products.length*100),
//     with_images: withImages,
//     with_images_percentage: Math.round(withImages/products.length*100),
//     with_collection: withCollection,
//     with_collection_percentage: Math.round(withCollection/products.length*100),
//     with_categories: withCategories,
//     with_categories_percentage: Math.round(withCategories/products.length*100),
//     with_tags: withTags,
//     with_tags_percentage: Math.round(withTags/products.length*100),
//     with_variants: withVariants,
//     with_variants_percentage: Math.round(withVariants/products.length*100),
//     with_options: withOptions,
//     with_options_percentage: Math.round(withOptions/products.length*100)
//   }
// }

// // Analyze complete variant-specific image data
// function analyzeCompleteVariantSpecificImageData(products: any[]) {
//   let products_with_option_images = 0
//   let products_with_variant_images = 0
//   let products_with_variant_specific_metadata = 0
//   let products_with_complete_image_data = 0
//   let products_with_complete_variant_data = 0
//   let products_with_complete_options_data = 0
//   let products_with_vendor_data = 0
//   let products_with_collection_data = 0
//   let total_color_variants = 0
//   let products_with_variants = 0
//   let products_with_options = 0
//   let products_with_variant_specific_image_option = 0
//   let products_with_fulfillment_type = 0
  
//   const color_image_mappings: Array<{product_id: string; colors: string[]; images: string[]}> = []
//   const variant_image_mappings: Array<{product_id: string; variant_id: string; images: string[]}> = []
//   const variant_specific_metadata_samples: Array<{product_id: string; variant_id: string; metadata: any}> = []
  
//   products.forEach(product => {
//     if (product.variants && product.variants.length > 0) {
//       products_with_variants++
      
//       const hasCompleteVariantData = product.variants.some((variant: any) => 
//         variant.metadata && Object.keys(variant.metadata).length > 0
//       )
//       if (hasCompleteVariantData) {
//         products_with_complete_variant_data++
//       }
      
//       const hasVariantSpecificMetadata = product.variants.some((variant: any) => 
//         variant.metadata && (variant.metadata.variant_images || variant.metadata.variant_image_ids)
//       )
//       if (hasVariantSpecificMetadata) {
//         products_with_variant_specific_metadata++
        
//         product.variants.forEach((variant: any) => {
//           if (variant.metadata && (variant.metadata.variant_images || variant.metadata.variant_image_ids)) {
//             variant_specific_metadata_samples.push({
//               product_id: product.id,
//               variant_id: variant.id,
//               metadata: variant.metadata
//             })
//           }
//         })
//       }
//     }
    
//     if (product.options && product.options.length > 0) {
//       products_with_options++
      
//       const hasCompleteOptionsData = product.options.some((option: any) => 
//         option.values && option.values.length > 0
//       )
//       if (hasCompleteOptionsData) {
//         products_with_complete_options_data++
//       }
//     }
    
//     if (product.vendor && product.vendor.name) {
//       products_with_vendor_data++
//     }
    
//     if (product.collection && product.collection.title) {
//       products_with_collection_data++
//     }
    
//     if (product.metadata?.variant_specific_image_option) {
//       products_with_variant_specific_image_option++
//     }
    
//     if (product.metadata?.fulfillment_type) {
//       products_with_fulfillment_type++
//     }
    
//     if (product.metadata?.option_images) {
//       try {
//         const optionImages = typeof product.metadata.option_images === 'string' 
//           ? JSON.parse(product.metadata.option_images)
//           : product.metadata.option_images
          
//         if (optionImages && optionImages.color) {
//           products_with_option_images++
//           const colors = Object.keys(optionImages.color)
//           const images = Object.values(optionImages.color) as string[]
//           total_color_variants += colors.length
          
//           color_image_mappings.push({
//             product_id: product.id,
//             colors,
//             images
//           })
//         }
//       } catch (error) {
//         console.warn(`[REINDEX] Error parsing option_images for product ${product.id}:`, error)
//       }
//     }
    
//     if (product.metadata?.variant_images) {
//       try {
//         const variantImages = typeof product.metadata.variant_images === 'string' 
//           ? JSON.parse(product.metadata.variant_images)
//           : product.metadata.variant_images
          
//         if (variantImages && Object.keys(variantImages).length > 0) {
//           products_with_variant_images++
          
//           Object.entries(variantImages).forEach(([variantId, imageUrl]) => {
//             variant_image_mappings.push({
//               product_id: product.id,
//               variant_id: variantId,
//               images: Array.isArray(imageUrl) ? imageUrl : [imageUrl as string]
//             })
//           })
//         }
//       } catch (error) {
//         console.warn(`[REINDEX] Error parsing variant_images for product ${product.id}:`, error)
//       }
//     }
    
//     if ((product.metadata?.option_images || product.metadata?.variant_images) && 
//         product.metadata?.color_hex_values && 
//         product.images && product.images.length > 0 &&
//         product.variants && product.variants.length > 0 &&
//         product.variants.some((v: any) => v.metadata && Object.keys(v.metadata).length > 0)) {
//       products_with_complete_image_data++
//     }
//   })
  
//   const ready_for_complete_functionality = 
//     products_with_option_images > 0 || 
//     products_with_variant_images > 0 ||
//     products_with_variant_specific_metadata > 0 ||
//     products_with_complete_image_data > 0
  
//   return {
//     total_products: products.length,
//     products_with_option_images,
//     products_with_variant_images,
//     products_with_variant_specific_metadata,
//     products_with_complete_image_data,
//     products_with_complete_variant_data,
//     products_with_complete_options_data,
//     products_with_vendor_data,
//     products_with_collection_data,
//     products_with_variants,
//     products_with_options,
//     products_with_variant_specific_image_option,
//     products_with_fulfillment_type,
//     total_color_variants,
//     color_image_mappings_sample: color_image_mappings.slice(0, 3),
//     variant_image_mappings_sample: variant_image_mappings.slice(0, 3),
//     variant_specific_metadata_samples: variant_specific_metadata_samples.slice(0, 3),
//     complete_variant_specific_image_support_percentage: Math.round((products_with_option_images + products_with_variant_images + products_with_variant_specific_metadata) / products.length * 100),
//     complete_functionality_percentage: Math.round(products_with_complete_image_data / products.length * 100),
//     vendor_support_percentage: Math.round(products_with_vendor_data / products.length * 100),
//     collection_support_percentage: Math.round(products_with_collection_data / products.length * 100),
//     ready_for_complete_functionality
//   }
// }

// // Test complete color-based search functionality
// async function testCompleteColorBasedSearch() {
//   try {
//     const basicSearch = await typesenseService.client
//       .collections('products')
//       .documents()
//       .search({
//         q: '*',
//         query_by: 'title,description',
//         per_page: 5
//       })
    
//     let colorSearch = null
//     let vendorSearch = null
//     let priceSearch = null
//     let variantSpecificImageTest = null
    
//     if (basicSearch.hits && basicSearch.hits.length > 0) {
//       const sampleProduct = basicSearch.hits[0].document
      
//       if (sampleProduct.color_names) {
//         const firstColor = sampleProduct.color_names.split(',')[0]?.trim()
//         if (firstColor) {
//           colorSearch = await typesenseService.client
//             .collections('products')
//             .documents()
//             .search({
//               q: '*',
//               query_by: 'title,description',
//               filter_by: `color_names:${firstColor}`,
//               per_page: 3
//             })
//         }
//       }
      
//       if (sampleProduct.vendor_name) {
//         vendorSearch = await typesenseService.client
//           .collections('products')
//           .documents()
//           .search({
//             q: '*',
//             query_by: 'title,description',
//             filter_by: `vendor_name:=${sampleProduct.vendor_name}`,
//             per_page: 3
//           })
//       }
      
//       if (sampleProduct.min_price_amount && sampleProduct.min_price_amount > 0) {
//         priceSearch = await typesenseService.client
//           .collections('products')
//           .documents()
//           .search({
//             q: '*',
//             query_by: 'title,description',
//             filter_by: `min_price_amount:>0`,
//             per_page: 3
//           })
//       }
      
//       if (sampleProduct.variants_data) {
//         try {
//           const variantsData = JSON.parse(sampleProduct.variants_data)
//           const variantsWithImageMetadata = variantsData.filter((v: any) => 
//             v.metadata && (v.metadata.variant_images || v.metadata.variant_image_ids)
//           )
          
//           variantSpecificImageTest = {
//             total_variants: variantsData.length,
//             variants_with_image_metadata: variantsWithImageMetadata.length,
//             sample_variant_metadata: variantsWithImageMetadata[0]?.metadata || null,
//             has_complete_variant_specific_images: variantsWithImageMetadata.length > 0
//           }
//         } catch (error) {
//           variantSpecificImageTest = {
//             error: 'Failed to parse variants_data',
//             message: error.message
//           }
//         }
//       }
//     }
    
//     return {
//       basic_search_results: basicSearch.found || 0,
//       color_search_tested: !!colorSearch,
//       color_search_results: colorSearch?.found || 0,
//       vendor_search_tested: !!vendorSearch,
//       vendor_search_results: vendorSearch?.found || 0,
//       price_search_tested: !!priceSearch,
//       price_search_results: priceSearch?.found || 0,
//       sample_product_has_complete_variant_specific_images: !!(
//         basicSearch.hits?.[0]?.document?.option_images || 
//         basicSearch.hits?.[0]?.document?.variant_images ||
//         basicSearch.hits?.[0]?.document?.variants_data
//       ),
//       sample_product_has_complete_data: !!(
//         basicSearch.hits?.[0]?.document?.vendor_name &&
//         basicSearch.hits?.[0]?.document?.variants_data &&
//         basicSearch.hits?.[0]?.document?.options_data
//       ),
//       variant_specific_image_test: variantSpecificImageTest,
//       test_successful: true
//     }
//   } catch (error) {
//     return {
//       test_successful: false,
//       error: error.message
//     }
//   }
// }

// export async function GET(req: MedusaRequest, res: MedusaResponse) {
//   try {
//     const currentInfo = await getCurrentSchemaInfo()
    
//     res.json({
//       message: 'Force Collection Reset Utility with COMPLETE VARIANT-SPECIFIC IMAGE SUPPORT',
//       current_collection: currentInfo,
//       purpose: 'Completely recreate Typesense collection with enhanced vendor, price & COMPLETE VARIANT-SPECIFIC IMAGE schema',
//       safety_features: [
//         '🔒 Environment validation (prevents localhost data indexing)',
//         '🧪 Dry run mode (preview before committing)',
//         '📍 Dynamic region handling',
//         '🔐 Admin authentication support (optional)'
//       ],
//       new_features: [
//         '🎨 COMPLETE color-based image switching support',
//         '📸 Option images mapping (color -> image)',
//         '🖼️ Variant images mapping (variant ID -> image)', 
//         '🔄 COMPLETE variant metadata preservation (variant.metadata.variant_images)',
//         '🆔 COMPLETE variant image IDs preservation (variant.metadata.variant_image_ids)',
//         '✨ Enhanced metadata for ProductPreview integration',
//         '🎯 Variant-specific image option settings',
//         '📦 Fulfillment type metadata support',
//         '🏪 Complete vendor data structure',
//         '🏷️ Complete collection data structure',
//         '📂 Complete categories and tags structure',
//         '🔍 Improved search with complete filtering',
//         '🛡️ Robust JSON parsing and error handling'
//       ],
//       usage: {
//         check_status: 'GET request shows current schema status',
//         dry_run: 'POST with {"dry_run": true} to preview without changes',
//         confirm: 'POST with {"confirm_reset": true} to proceed with reindexing',
//         with_region: 'POST with {"confirm_reset": true, "region_id": "reg_xxx"} to use specific region'
//       },
//       current_environment: {
//         database: process.env.DATABASE_URL?.split('@')[1],
//         typesense_host: process.env.TYPESENSE_HOST,
//         node_env: process.env.NODE_ENV,
//         configured_production_region: PRODUCTION_REGION_ID
//       },
//       warning: '⚠️ This will delete ALL existing search data and recreate from scratch',
//       schema_status: {
//         has_enhanced_fields: currentInfo.enhanced_fields === 4,
//         has_complete_variant_specific_image_fields: currentInfo.complete_variant_specific_image_fields >= 5,
//         ready_for_complete_color_image_switching: currentInfo.has_complete_variant_specific_image_support,
//         current_enhanced_fields: currentInfo.current_enhanced_fields || [],
//         current_complete_variant_specific_image_fields: currentInfo.current_complete_variant_specific_image_fields || [],
//         missing_fields: {
//           enhanced: Math.max(0, 4 - (currentInfo.enhanced_fields || 0)),
//           complete_variant_specific_images: Math.max(0, 7 - (currentInfo.complete_variant_specific_image_fields || 0))
//         }
//       }
//     })
//   } catch (error) {
//     res.status(500).json({
//       error: 'Failed to check collection status',
//       details: error.message
//     })
//   }
// }

// src/api/admin/products/force-reset/route.ts
// src/api/admin/products/force-reset/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { typesenseService } from "../../../../../lib/typesense"

const PRODUCTION_REGION_ID = 'reg_01K4890NFNFQ6MQ9YPKBT2P001'

// ─── Job state (poll via GET) ────────────────────────────────────────────────
const reindexJobState: {
  running: boolean
  startedAt: string | null
  finishedAt: string | null
  success: boolean | null
  message: string
  stats: any
} = {
  running: false,
  startedAt: null,
  finishedAt: null,
  success: null,
  message: 'No job run yet',
  stats: null
}

// ─── Trimmed fields — only what typesense.ts actually reads ──────────────────
// Removed: vendor banking/GST/PAN/address fields (never read in extractVendorData)
// Removed: variants.barcode, ean, upc (never read in extractVariantAndOptionsData)
// Removed: categories.mpath, is_internal, rank, parent_category.*, description (only .name used)
// Removed: collection.metadata, timestamps (only id/title/handle used)
// Removed: tags timestamps (only .value used)
// Removed: product.is_giftcard, discountable, type_id, subtitle (never read)
// Removed: product-level weight/length/height/width/hs_code/origin_country (not used)
const PRODUCT_FIELDS = [
  // Product core — only fields read in buildDocument / extractMetadata
  "id", "title", "description", "handle", "status",
  "thumbnail", "created_at", "updated_at", "metadata",

  // Vendor — only id, name, handle used in extractVendorData
  "vendor.id", "vendor.name", "vendor.handle",
  // Keep these extra vendor fields in case storefront uses them via variants_data/options_data JSON blobs
  "vendor.logo", "vendor.creator_bio", "vendor.creator_title",
  "vendor.creator_category", "vendor.verified", "vendor.city", "vendor.state",

  // Variants — all fields used in extractVariantAndOptionsData
  "variants.id", "variants.title", "variants.sku",
  "variants.allow_backorder", "variants.manage_inventory",
  "variants.inventory_quantity", "variants.variant_rank",
  "variants.metadata",
  "variants.weight", "variants.length", "variants.height", "variants.width",
  "variants.hs_code", "variants.origin_country", "variants.mid_code", "variants.material",
  "variants.calculated_price", "variants.prices.*",
  "variants.options.*", "variants.options.option.*",
  "variants.created_at", "variants.updated_at", "variants.deleted_at",

  // Collection — only id, title, handle used in buildDocument
  "collection.id", "collection.title", "collection.handle",

  // Categories — only .name used in extractTaxonomyData join
  "categories.id", "categories.name", "categories.handle", "categories.is_active",

  // Tags — only .value used in extractTaxonomyData join
  "tags.id", "tags.value",

  // Images — all fields used in extractImageData
  "images.id", "images.url", "images.metadata", "images.rank",
  "images.product_id", "images.created_at", "images.updated_at", "images.deleted_at",

  // Options — all fields used in extractVariantAndOptionsData
  "options.id", "options.title", "options.metadata", "options.product_id",
  "options.created_at", "options.updated_at", "options.deleted_at",
  "options.values.id", "options.values.value", "options.values.metadata",
  "options.values.option_id", "options.values.created_at",
  "options.values.updated_at", "options.values.deleted_at",
]

// ─── Collection schema — unchanged ───────────────────────────────────────────
const COLLECTION_SCHEMA = {
  name: 'products',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'description', type: 'string', optional: true },
    { name: 'handle', type: 'string' },
    { name: 'status', type: 'string', facet: true },
    { name: 'thumbnail', type: 'string', optional: true },
    { name: 'first_image_url', type: 'string', optional: true },
    { name: 'created_at', type: 'int64' },
    { name: 'updated_at', type: 'int64' },
    { name: 'collection_title', type: 'string', facet: true, optional: true },
    { name: 'collection_handle', type: 'string', optional: true },
    { name: 'collection_id', type: 'string', optional: true },
    { name: 'vendor_id', type: 'string', optional: true, facet: true },
    { name: 'vendor_name', type: 'string', optional: true, facet: true },
    { name: 'vendor_handle', type: 'string', optional: true },
    { name: 'min_price_amount', type: 'int64', optional: true },
    { name: 'max_price_amount', type: 'int64', optional: true },
    { name: 'currency_code', type: 'string', optional: true, facet: true },
    { name: 'variant_count', type: 'int32', optional: true },
    { name: 'variant_titles', type: 'string', optional: true },
    { name: 'has_variants', type: 'bool', optional: true },
    { name: 'color_names', type: 'string', optional: true, facet: true },
    { name: 'color_hex_values', type: 'string', optional: true },
    { name: 'tags', type: 'string', facet: true, optional: true },
    { name: 'categories', type: 'string', facet: true, optional: true },
    { name: 'all_images', type: 'string', optional: true },
    { name: 'option_images', type: 'string', optional: true },
    { name: 'variant_images', type: 'string', optional: true },
    { name: 'variant_specific_image_option', type: 'string', optional: true },
    { name: 'fulfillment_type', type: 'string', optional: true },
    { name: 'variants_data', type: 'string', optional: true },
    { name: 'options_data', type: 'string', optional: true },
    { name: 'search_text', type: 'string', optional: true },
  ],
  default_sorting_field: 'created_at',
  token_separators: ['-', '_', '.', '/', '\\'],
  symbols_to_index: ['#', '+', '&', '@'],
}

// ─── Background reindex logic ─────────────────────────────────────────────────
async function runReindex(query: any, regionId?: string) {
  reindexJobState.running = true
  reindexJobState.startedAt = new Date().toISOString()
  reindexJobState.finishedAt = null
  reindexJobState.success = null
  reindexJobState.message = 'Running...'
  reindexJobState.stats = null

  try {
    console.log('🔄 [REINDEX] Background reindex started...')

    // STEP 1: Delete old collection + fetch region IN PARALLEL
    console.log('🗑️ [REINDEX] STEP 1: Deleting old collection + fetching region in parallel...')
    const [regionsResult] = await Promise.all([
      query.graph({
        entity: "region",
        fields: ["id", "name", "currency_code"],
        filters: regionId ? { id: regionId } : undefined,
        options: { take: 1 }
      }),
      typesenseService.client.collections('products').delete()
        .then(() => console.log('✅ [REINDEX] Old collection deleted'))
        .catch(() => console.log('ℹ️ [REINDEX] No existing collection to delete'))
    ])

    const regionData = regionsResult.data?.[0] || { id: PRODUCTION_REGION_ID, currency_code: 'INR', name: 'India' }
    const regionToUse = regionId || regionData.id
    console.log(`✅ [REINDEX] Region: ${regionToUse} (${regionData.currency_code})`)

    // Small buffer to ensure Typesense deletion is fully propagated
    await new Promise(resolve => setTimeout(resolve, 500))

    // STEP 2: Create schema + fetch products IN PARALLEL
    console.log('🏗️ [REINDEX] STEP 2: Creating schema + fetching products in parallel...')
    const [, productsResult] = await Promise.all([
      typesenseService.client.collections().create(COLLECTION_SCHEMA)
        .then(() => console.log('✅ [REINDEX] New schema created')),
      query.graph({
        entity: "product",
        fields: PRODUCT_FIELDS,
        filters: { status: 'published' },
        options: { region_id: regionToUse }
      })
    ])

    const products = productsResult.data
    console.log(`📦 [REINDEX] Found ${products.length} published products`)

    if (products.length === 0) {
      reindexJobState.success = true
      reindexJobState.message = 'Schema created but no published products found'
      reindexJobState.finishedAt = new Date().toISOString()
      reindexJobState.running = false
      return
    }

    // STEP 3: Batch index
    console.log('🔄 [REINDEX] STEP 3: Indexing products...')
    const indexResult = await typesenseService.indexProducts(products, regionData)

    // STEP 4: Verify count only — no test searches
    const finalStats = await typesenseService.client.collections('products').retrieve()
    const elapsed = Date.now() - new Date(reindexJobState.startedAt!).getTime()

    console.log(`✅ [REINDEX] Complete! ${finalStats.num_documents} docs indexed in ${(elapsed / 1000).toFixed(1)}s`)

    reindexJobState.success = true
    reindexJobState.message = `Successfully indexed ${finalStats.num_documents} products`
    reindexJobState.stats = {
      total_documents: finalStats.num_documents,
      total_fields: finalStats.fields.length,
      region_used: regionToUse,
      currency: regionData.currency_code,
      elapsed_seconds: parseFloat((elapsed / 1000).toFixed(1)),
      index_result: indexResult
    }

  } catch (error: any) {
    console.error('❌ [REINDEX] Background reindex failed:', error)
    reindexJobState.success = false
    reindexJobState.message = `Failed: ${error.message}`
  } finally {
    reindexJobState.running = false
    reindexJobState.finishedAt = new Date().toISOString()
  }
}

// ─── POST /admin/products/force-reset ────────────────────────────────────────
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    const databaseUrl = process.env.DATABASE_URL || ''

    if (databaseUrl.includes('127.0.0.1')) {
      return res.status(400).json({
        success: false,
        error: 'Safety check failed: Connected to 127.0.0.1 database',
        advice: 'Make sure DATABASE_URL points to your production database'
      })
    }

    const { confirm_reset, region_id, dry_run = false } = req.body
    const query = req.scope.resolve("query")

    // ── DRY RUN ──────────────────────────────────────────────────────────────
    if (dry_run) {
      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "title", "status", "metadata", "variants.id", "images.id", "vendor.name"],
        filters: { status: 'published' },
      })

      return res.json({
        dry_run: true,
        success: true,
        would_index: products.length,
        sample: products.slice(0, 5).map((p: any) => ({
          id: p.id,
          title: p.title,
          has_vendor: !!p.vendor?.name,
          has_images: !!(p.images?.length),
          variant_count: p.variants?.length || 0,
        }))
      })
    }

    // ── STATUS CHECK ──────────────────────────────────────────────────────────
    if (!confirm_reset) {
      return res.json({
        message: 'Reindex utility — send {"confirm_reset": true} to start',
        current_job: reindexJobState,
        usage: {
          start: 'POST {"confirm_reset": true}',
          with_region: 'POST {"confirm_reset": true, "region_id": "reg_xxx"}',
          dry_run: 'POST {"dry_run": true}',
          check_status: 'GET this endpoint'
        }
      })
    }

    // ── PREVENT DOUBLE RUN ────────────────────────────────────────────────────
    if (reindexJobState.running) {
      return res.status(409).json({
        success: false,
        error: 'Reindex already in progress',
        started_at: reindexJobState.startedAt,
        message: 'Check GET /admin/products/force-reset for status'
      })
    }

    // ── FIRE AND FORGET ───────────────────────────────────────────────────────
    setImmediate(() => runReindex(query, region_id))

    return res.json({
      success: true,
      message: '🚀 Reindex started in background — no more 504s!',
      check_status: 'GET /admin/products/force-reset',
      monitor_logs: 'docker logs junooni-admin -f | grep REINDEX'
    })

  } catch (error: any) {
    console.error('❌ [REINDEX] Route error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// ─── GET /admin/products/force-reset — poll job status ───────────────────────
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    let collectionInfo: any = { exists: false }
    try {
      const col = await typesenseService.client.collections('products').retrieve()
      collectionInfo = {
        exists: true,
        total_documents: col.num_documents,
        total_fields: col.fields.length,
      }
    } catch {
      // collection doesn't exist yet
    }

    res.json({
      job: reindexJobState,
      collection: collectionInfo,
      environment: {
        database: process.env.DATABASE_URL?.split('@')[1],
        typesense_host: process.env.TYPESENSE_HOST,
        node_env: process.env.NODE_ENV,
      }
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}