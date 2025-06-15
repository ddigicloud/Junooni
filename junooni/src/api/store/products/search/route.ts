// src/api/store/products/search/route.ts - COMPLETE ENHANCED WITH VARIANT-SPECIFIC IMAGE RECONSTRUCTION
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { typesenseService } from "../../../../../lib/typesense"

export const SearchSchema = z.object({
  query: z.string(),
  limit: z.number().optional().default(20),
  offset: z.number().optional().default(0),
  filter_by: z.string().optional(),
  colors: z.string().optional(),
  vendors: z.string().optional(),
  collections: z.string().optional(),
  price_min: z.number().optional(),
  price_max: z.number().optional(),
})

type SearchRequest = z.infer<typeof SearchSchema>

// ✅ ENHANCED: Color name normalizer (same as other templates)
const normalizeColorName = (colorName: string): string => {
  return colorName
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-z])/gi, '$1 $2')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ✅ ENHANCED: Safe JSON parser with detailed error handling
const safeJsonParse = (value: any, fallback: any = null, fieldName: string = 'unknown') => {
  if (!value) return fallback
  
  if (typeof value !== 'string') {
    return value // Already parsed
  }
  
  try {
    return JSON.parse(value)
  } catch (error) {
    console.warn(`[TRANSFORM] Error parsing ${fieldName}:`, error)
    return fallback
  }
}

// ✅ COMPLETE: Transform Typesense document back to Medusa product format with COMPLETE variant-specific image data
const transformTypesenseToProduct = (hit: any) => {
  const doc = hit.document

  console.log('\n🔄 [TRANSFORM] Starting transformation for:', doc.title)
  console.log('📊 [TRANSFORM] Document structure analysis:', {
    id: doc.id,
    title: doc.title,
    has_option_images: !!doc.option_images,
    has_variant_images: !!doc.variant_images,
    has_variants_data: !!doc.variants_data,
    has_options_data: !!doc.options_data,
    has_all_images: !!doc.all_images,
    option_images_type: typeof doc.option_images,
    variant_images_type: typeof doc.variant_images,
    variants_data_type: typeof doc.variants_data
  })

  // ✅ CRITICAL: Reconstruct complete metadata with ALL variant-specific image data
  let metadata: any = {}
  
  // Reconstruct color_hex_values
  if (doc.color_hex_values) {
    try {
      metadata.color_hex_values = doc.color_hex_values
      console.log('🎨 [TRANSFORM] Preserved color_hex_values:', typeof doc.color_hex_values === 'string' ? 'STRING' : 'OBJECT')
    } catch (error) {
      console.warn('[TRANSFORM] Error parsing color_hex_values from search result:', error)
    }
  }

  // ✅ CRITICAL: Reconstruct option_images for color-based image switching
  if (doc.option_images) {
    try {
      metadata.option_images = doc.option_images
      console.log('🎨 [TRANSFORM] Preserved option_images:', typeof doc.option_images === 'string' ? 'STRING' : 'OBJECT')
      
      // Try to parse to verify structure
      const parsedOptionImages = safeJsonParse(doc.option_images, {}, 'option_images')
      if (parsedOptionImages && parsedOptionImages.color) {
        console.log('✅ [TRANSFORM] Option images structure verified - contains color mappings')
      }
    } catch (error) {
      console.warn('[TRANSFORM] Error parsing option_images from search result:', error)
    }
  }

  // ✅ CRITICAL: Reconstruct variant_images mapping (product-level)
  if (doc.variant_images) {
    try {
      metadata.variant_images = doc.variant_images
      console.log('🎨 [TRANSFORM] Preserved variant_images:', typeof doc.variant_images === 'string' ? 'STRING' : 'OBJECT')
      
      // Try to parse to verify structure
      const parsedVariantImages = safeJsonParse(doc.variant_images, {}, 'variant_images')
      if (parsedVariantImages && Object.keys(parsedVariantImages).length > 0) {
        console.log('✅ [TRANSFORM] Variant images structure verified - contains variant mappings')
      }
    } catch (error) {
      console.warn('[TRANSFORM] Error parsing variant_images from search result:', error)
    }
  }

  // ✅ ENHANCED: Reconstruct other metadata fields
  if (doc.variant_specific_image_option) {
    metadata.variant_specific_image_option = doc.variant_specific_image_option
  }

  if (doc.fulfillment_type) {
    metadata.fulfillment_type = doc.fulfillment_type
  }

  // ✅ CRITICAL: Reconstruct vendor object
  let vendor = null
  if (doc.vendor_id && doc.vendor_name) {
    vendor = {
      id: doc.vendor_id,
      name: doc.vendor_name,
      handle: doc.vendor_handle
    }
  }

  // ✅ CRITICAL: Reconstruct collection object
  let collection = null
  if (doc.collection_id && doc.collection_title) {
    collection = {
      id: doc.collection_id,
      title: doc.collection_title,
      handle: doc.collection_handle
    }
  }

  // ✅ CRITICAL: Reconstruct complete images array from stored data
  let images = []
  if (doc.all_images) {
    try {
      const allImagesData = safeJsonParse(doc.all_images, [], 'all_images')
      images = Array.isArray(allImagesData) ? allImagesData : []
      console.log(`🖼️ [TRANSFORM] Reconstructed ${images.length} images from all_images data`)
    } catch (error) {
      console.warn('[TRANSFORM] Error parsing all_images from search result:', error)
      // Fallback to single image
      if (doc.first_image_url) {
        images = [{
          id: `${doc.id}_image_1`,
          url: doc.first_image_url,
          rank: 0,
          metadata: null,
          product_id: doc.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        }]
      }
    }
  } else if (doc.first_image_url) {
    // Fallback to single image
    images = [{
      id: `${doc.id}_image_1`,
      url: doc.first_image_url,
      rank: 0,
      metadata: null,
      product_id: doc.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }]
  }

  // ✅ ENHANCED: Reconstruct categories and tags arrays
  const categories = doc.categories ? 
    doc.categories.split(', ').map((name: string, index: number) => ({
      id: `${doc.id}_cat_${index}`,
      name: name.trim(),
      handle: name.toLowerCase().replace(/\s+/g, '-')
    })) : []

  const tags = doc.tags ? 
    doc.tags.split(', ').map((value: string, index: number) => ({
      id: `${doc.id}_tag_${index}`,
      value: value.trim()
    })) : []

  // ✅ CRITICAL: Reconstruct complete variants array with ALL metadata (including variant-specific images!)
  let variants = []
  if (doc.variants_data) {
    try {
      const variantsData = safeJsonParse(doc.variants_data, [], 'variants_data')
      if (Array.isArray(variantsData)) {
        variants = variantsData.map((variant: any) => ({
          ...variant,
          // Ensure calculated_price structure is correct
          calculated_price: variant.calculated_price || {
            calculated_amount: doc.min_price_amount || 0,
            currency_code: doc.currency_code || 'USD'
          },
          // Ensure prices array exists
          prices: variant.prices || [{
            amount: doc.min_price_amount || 0,
            currency_code: doc.currency_code || 'USD'
          }],
          // ✅ CRITICAL: Preserve ALL variant metadata (including variant_images!)
          metadata: variant.metadata || {},
        }))
        
        // ✅ DEBUG: Log variants with image metadata
        const variantsWithImages = variants.filter(v => 
          v.metadata && (v.metadata.variant_images || v.metadata.variant_image_ids)
        )
        
        if (variantsWithImages.length > 0) {
          console.log(`🎨 [TRANSFORM] Found ${variantsWithImages.length} variants with image metadata:`)
          variantsWithImages.forEach(variant => {
            console.log(`  - Variant ${variant.id} (${variant.title}):`, {
              has_variant_images: !!variant.metadata.variant_images,
              has_variant_image_ids: !!variant.metadata.variant_image_ids,
              variant_images: variant.metadata.variant_images,
              variant_image_ids: variant.metadata.variant_image_ids
            })
          })
        } else {
          console.log('⚠️ [TRANSFORM] No variants found with image metadata')
        }
      }
    } catch (error) {
      console.warn('[TRANSFORM] Error parsing variants_data from search result:', error)
    }
  }

  // Fallback variant creation if no variants_data
  if (variants.length === 0 && doc.min_price_amount && doc.min_price_amount > 0) {
    variants.push({
      id: `${doc.id}_variant_1`,
      title: 'Default Variant',
      calculated_price: {
        calculated_amount: doc.min_price_amount,
        currency_code: doc.currency_code || 'USD'
      },
      prices: [{
        amount: doc.min_price_amount,
        currency_code: doc.currency_code || 'USD'
      }],
      options: [],
      metadata: {}
    })
  }

  // ✅ CRITICAL: Reconstruct product options for variant functionality
  let options = []
  if (doc.options_data) {
    try {
      const optionsData = safeJsonParse(doc.options_data, [], 'options_data')
      if (Array.isArray(optionsData)) {
        options = optionsData
        console.log(`⚙️ [TRANSFORM] Reconstructed ${options.length} product options`)
      }
    } catch (error) {
      console.warn('[TRANSFORM] Error parsing options_data from search result:', error)
    }
  }

  // ✅ ENHANCED: Return product in complete format expected by ProductPreview with ALL variant-specific image data
  const reconstructedProduct = {
    id: doc.id,
    title: doc.title,
    subtitle: '',
    description: doc.description,
    handle: doc.handle,
    is_giftcard: false,
    discountable: true,
    status: doc.status,
    thumbnail: doc.thumbnail,
    
    // Collection and vendor
    collection_id: collection?.id || null,
    collection,
    vendor,
    
    // Categories and tags
    categories,
    tags,
    
    // Product type and weights
    type_id: null,
    type: null,
    weight: '0',
    length: '0',
    height: '0',
    width: '0',
    hs_code: null,
    origin_country: null,
    mid_code: null,
    material: null,
    
    // ✅ CRITICAL: Complete metadata with ALL variant-specific image mappings
    metadata,
    
    // ✅ CRITICAL: Complete images array
    images,
    
    // ✅ CRITICAL: Complete variants array with ALL metadata (including variant_images!)
    variants,
    
    // ✅ CRITICAL: Complete options array for variant functionality
    options,
    
    // Timestamps
    created_at: new Date(doc.created_at * 1000).toISOString(),
    updated_at: new Date(doc.updated_at * 1000).toISOString(),
    
    // Search-specific metadata
    _search_score: hit.text_match_info?.score || 0,
    _search_highlights: hit.highlights || []
  }

  console.log('✅ [TRANSFORM] Product transformation complete:', {
    id: reconstructedProduct.id,
    title: reconstructedProduct.title,
    has_metadata: !!reconstructedProduct.metadata,
    has_option_images: !!reconstructedProduct.metadata?.option_images,
    has_variant_images: !!reconstructedProduct.metadata?.variant_images,
    has_color_hex_values: !!reconstructedProduct.metadata?.color_hex_values,
    images_count: reconstructedProduct.images.length,
    variants_count: reconstructedProduct.variants.length,
    variants_with_image_metadata: reconstructedProduct.variants.filter(v => 
      v.metadata && (v.metadata.variant_images || v.metadata.variant_image_ids)
    ).length,
    options_count: reconstructedProduct.options.length,
    has_vendor: !!reconstructedProduct.vendor,
    ready_for_color_image_switching: !!(
      reconstructedProduct.metadata?.option_images || 
      reconstructedProduct.metadata?.variant_images ||
      reconstructedProduct.variants.some(v => v.metadata?.variant_images)
    )
  })

  return reconstructedProduct
}

export async function POST(
  req: MedusaRequest<SearchRequest>,
  res: MedusaResponse
) {
  try {
    const { 
      query: searchTerm, 
      limit, 
      offset, 
      filter_by,
      colors,
      vendors,
      collections,
      price_min,
      price_max
    } = req.validatedBody
    
    console.log("🔍 [SEARCH API] COMPLETE Enhanced Typesense Search with variant-specific images:", { 
      searchTerm, 
      limit, 
      offset, 
      colors, 
      vendors, 
      collections,
      price_range: { min: price_min, max: price_max }
    })
    
    if (!searchTerm || searchTerm.trim().length === 0) {
      return res.json({
        hits: [],
        products: [],
        total: 0,
        query: searchTerm,
        processingTimeMs: 0,
      })
    }

    // ✅ Check collection schema to determine available fields
    let searchFields = 'title,description'
    let availableSchema = null
    
    try {
      availableSchema = await typesenseService.client.collections('products').retrieve()
      const fieldNames = availableSchema.fields.map(f => f.name)
      
      console.log('📋 [SEARCH API] Available Typesense fields:', fieldNames)
      console.log('🎨 [SEARCH API] Has COMPLETE variant-specific image fields:', {
        option_images: fieldNames.includes('option_images'),
        variant_images: fieldNames.includes('variant_images'),
        variants_data: fieldNames.includes('variants_data'),
        options_data: fieldNames.includes('options_data'),
        all_images: fieldNames.includes('all_images'),
        variant_specific_image_option: fieldNames.includes('variant_specific_image_option'),
        fulfillment_type: fieldNames.includes('fulfillment_type')
      })
      
      // Build search fields based on what's available
      const possibleSearchFields = [
        'title',
        'description', 
        'search_text',
        'vendor_name',
        'collection_title',
        'tags',
        'categories'
      ]
      
      const availableSearchFields = possibleSearchFields.filter(field => fieldNames.includes(field))
      searchFields = availableSearchFields.join(',')
      
      console.log(`🔍 [SEARCH API] Using search fields: ${searchFields}`)
      
    } catch (schemaError) {
      console.warn('⚠️ [SEARCH API] Could not retrieve schema, using basic fields:', schemaError.message)
    }

    // ✅ ENHANCED: Build filters from query parameters
    const filters = [filter_by].filter(Boolean)
    
    // Add color filter
    if (colors) {
      const colorArray = colors.split(',').map(color => normalizeColorName(color.trim()))
      if (colorArray.length > 0) {
        const colorFilter = colorArray.map(color => `color_names:${color}`).join(' || ')
        filters.push(`(${colorFilter})`)
        console.log('🎨 [SEARCH API] Applied color filter:', colorArray)
      }
    }
    
    // Add vendor filter
    if (vendors) {
      const vendorArray = vendors.split(',').map(v => v.trim())
      if (vendorArray.length > 0) {
        const vendorFilter = vendorArray.map(vendor => `vendor_name:=${vendor}`).join(' || ')
        filters.push(`(${vendorFilter})`)
        console.log('🏪 [SEARCH API] Applied vendor filter:', vendorArray)
      }
    }
    
    // Add collection filter
    if (collections) {
      const collectionArray = collections.split(',').map(c => c.trim())
      if (collectionArray.length > 0) {
        const collectionFilter = collectionArray.map(col => `collection_handle:=${col}`).join(' || ')
        filters.push(`(${collectionFilter})`)
        console.log('🏷️ [SEARCH API] Applied collection filter:', collectionArray)
      }
    }
    
    // Add price range filter
    if (price_min !== undefined || price_max !== undefined) {
      const priceFilters = []
      if (price_min !== undefined) {
        priceFilters.push(`min_price_amount:>=${price_min * 100}`)
      }
      if (price_max !== undefined) {
        priceFilters.push(`max_price_amount:<=${price_max * 100}`)
      }
      if (priceFilters.length > 0) {
        filters.push(priceFilters.join(' && '))
        console.log('💰 [SEARCH API] Applied price filter:', { min: price_min, max: price_max })
      }
    }

    // ✅ ENHANCED: Perform search with filters
    const searchParams = {
      q: searchTerm,
      query_by: searchFields,
      filter_by: filters.join(' && '),
      facet_by: availableSchema?.fields
        .filter(f => f.facet === true)
        .map(f => f.name)
        .join(',') || 'status,collection_title,vendor_name,color_names',
      max_facet_values: 100,
      page: Math.floor(offset / limit) + 1,
      per_page: limit,
      sort_by: 'created_at:desc',
      num_typos: 2,
      typo_tokens_threshold: 2,
    }
    
    console.log('🔍 [SEARCH API] COMPLETE search parameters with variant-specific image support:', searchParams)

    const typesenseResults = await typesenseService.client
      .collections('products')
      .documents()
      .search(searchParams)
    
    console.log(`✅ [SEARCH API] Typesense found ${typesenseResults.found} results in ${typesenseResults.search_time_ms}ms`)
    
    // ✅ ENHANCED: Transform search results back to COMPLETE product format with ALL variant-specific images
    const transformedProducts = (typesenseResults.hits || []).map(transformTypesenseToProduct)
    
    console.log('🔄 [SEARCH API] Transformed search results to COMPLETE product format with ALL variant-specific images')
    console.log('📦 [SEARCH API] Sample transformed product:', {
      id: transformedProducts[0]?.id,
      title: transformedProducts[0]?.title,
      hasVendor: !!transformedProducts[0]?.vendor,
      hasColorMetadata: !!transformedProducts[0]?.metadata?.color_hex_values,
      hasOptionImages: !!transformedProducts[0]?.metadata?.option_images,
      hasVariantImages: !!transformedProducts[0]?.metadata?.variant_images,
      imagesCount: transformedProducts[0]?.images?.length || 0,
      variantsCount: transformedProducts[0]?.variants?.length || 0,
      variantsWithImageMetadata: transformedProducts[0]?.variants?.filter(v => 
        v.metadata && (v.metadata.variant_images || v.metadata.variant_image_ids)
      ).length || 0,
      optionsCount: transformedProducts[0]?.options?.length || 0,
      readyForColorImageSwitching: !!(
        transformedProducts[0]?.metadata?.option_images || 
        transformedProducts[0]?.metadata?.variant_images ||
        transformedProducts[0]?.variants?.some(v => v.metadata?.variant_images)
      )
    })

    // ✅ ENHANCED: Extract available colors for filter display
    const colorFacets = typesenseResults.facet_counts?.find(f => f.field_name === 'color_names')?.counts || []
    const availableColors = colorFacets.map((facet: any) => ({
      name: facet.value,
      count: facet.count,
    }))

    // Transform Typesense response to frontend-compatible format
    const standardizedResponse = {
      hits: typesenseResults.hits || [],
      products: transformedProducts, // ✅ COMPLETE: Products in complete Medusa format with ALL variant-specific images
      total: typesenseResults.found || 0,
      nbHits: typesenseResults.found || 0,
      query: searchTerm,
      processingTimeMs: typesenseResults.search_time_ms || 0,
      page: typesenseResults.page || 1,
      out_of: typesenseResults.out_of || 0,
      facet_counts: typesenseResults.facet_counts || [],
      
      // ✅ ENHANCED: Add structured filter data
      filters_applied: {
        colors: colors ? colors.split(',').map(c => c.trim()) : [],
        vendors: vendors ? vendors.split(',').map(v => v.trim()) : [],
        collections: collections ? collections.split(',').map(c => c.trim()) : [],
        price_range: {
          min: price_min,
          max: price_max
        }
      },
      
      // ✅ ENHANCED: Add available filter options
      available_filters: {
        colors: availableColors,
        vendors: typesenseResults.facet_counts?.find(f => f.field_name === 'vendor_name')?.counts || [],
        collections: typesenseResults.facet_counts?.find(f => f.field_name === 'collection_title')?.counts || []
      },
      
      // ✅ Debug info with COMPLETE variant-specific image support status
      debug: {
        schema_detected: !!availableSchema,
        search_fields_used: searchFields,
        filters_applied: filters,
        enhanced_fields_available: availableSchema?.fields
          .filter(f => ['vendor_name', 'min_price_amount', 'search_text', 'color_names', 'option_images', 'variant_images'].includes(f.name))
          .map(f => f.name) || [],
        complete_variant_specific_image_support: {
          has_option_images: availableSchema?.fields.some(f => f.name === 'option_images') || false,
          has_variant_images: availableSchema?.fields.some(f => f.name === 'variant_images') || false,
          has_variants_data: availableSchema?.fields.some(f => f.name === 'variants_data') || false,
          has_options_data: availableSchema?.fields.some(f => f.name === 'options_data') || false,
          has_all_images: availableSchema?.fields.some(f => f.name === 'all_images') || false,
          has_variant_specific_image_option: availableSchema?.fields.some(f => f.name === 'variant_specific_image_option') || false,
          has_fulfillment_type: availableSchema?.fields.some(f => f.name === 'fulfillment_type') || false
        },
        transformation_successful: transformedProducts.length === (typesenseResults.hits || []).length,
        products_with_complete_variant_specific_images: transformedProducts.filter(p => 
          p.metadata?.option_images || 
          p.metadata?.variant_images ||
          p.variants?.some(v => v.metadata?.variant_images)
        ).length
      }
    }
    
    console.log("📤 [SEARCH API] Sending COMPLETE response with variant-specific image support:", {
      hitsCount: standardizedResponse.hits.length,
      productsCount: standardizedResponse.products.length,
      total: standardizedResponse.total,
      query: standardizedResponse.query,
      filtersApplied: standardizedResponse.filters_applied,
      completeVariantSpecificImageSupport: standardizedResponse.debug.complete_variant_specific_image_support,
      productsWithCompleteVariantSpecificImages: standardizedResponse.debug.products_with_complete_variant_specific_images,
      transformationOk: standardizedResponse.debug.transformation_successful
    })
    
    res.json(standardizedResponse)
    
  } catch (error) {
    console.error("❌ [SEARCH API] COMPLETE Enhanced Search Error:", error)
    res.status(500).json({
      error: "Search failed",
      message: error.message,
      hits: [],
      products: [],
      total: 0,
      query: req.validatedBody?.query || "",
    })
  }
}

// GET endpoint to check search stats with COMPLETE variant-specific image support
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const collections = await typesenseService.client.collections().retrieve()
    
    let productCollection = null
    let enhancedFields = []
    let completeVariantSpecificImageFields = []
    
    try {
      productCollection = await typesenseService.client.collections('products').retrieve()
      enhancedFields = productCollection.fields.filter(f => 
        ['vendor_name', 'min_price_amount', 'search_text', 'color_names', 'currency_code'].includes(f.name)
      )
      completeVariantSpecificImageFields = productCollection.fields.filter(f => 
        ['option_images', 'variant_images', 'variants_data', 'options_data', 'all_images', 'variant_specific_image_option', 'fulfillment_type'].includes(f.name)
      )
    } catch (error) {
      console.warn('Products collection not found')
    }
    
    res.json({
      status: "OK",
      service: "Typesense",
      collections_count: collections.length,
      products_collection: productCollection ? {
        name: productCollection.name,
        num_documents: productCollection.num_documents,
        total_fields: productCollection.fields.length,
        enhanced_fields: enhancedFields.map(f => ({ name: f.name, type: f.type, facet: f.facet })),
        complete_variant_specific_image_fields: completeVariantSpecificImageFields.map(f => ({ name: f.name, type: f.type })),
        has_enhanced_schema: enhancedFields.length > 0,
        has_complete_variant_specific_image_support: completeVariantSpecificImageFields.length >= 5,
        supports_color_filtering: enhancedFields.some(f => f.name === 'color_names'),
        supports_vendor_filtering: enhancedFields.some(f => f.name === 'vendor_name'),
        supports_price_filtering: enhancedFields.some(f => f.name === 'min_price_amount'),
        supports_complete_color_image_switching: completeVariantSpecificImageFields.some(f => f.name === 'option_images') && completeVariantSpecificImageFields.some(f => f.name === 'variants_data')
      } : 'Not found',
      message: productCollection && completeVariantSpecificImageFields.length >= 5 ? 
        "COMPLETE search endpoint with FULL variant-specific image support for color-based image switching" : 
        productCollection && enhancedFields.length > 0 ?
        "Enhanced search endpoint with vendor, price & color support - reindex needed for COMPLETE variant-specific images" :
        "Basic search endpoint - run COMPLETE reindexing to get FULL functionality"
    })
  } catch (error) {
    console.error("❌ [SEARCH API] Stats Error:", error)
    res.status(500).json({
      error: "Failed to get search stats",
      message: error.message,
    })
  }
}