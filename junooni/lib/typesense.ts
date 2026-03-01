// lib/typesense.ts - FIXED: Increased timeouts + batched imports to prevent 504 errors
import Typesense, { Client } from 'typesense'

// Initialize Typesense client
const client = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: parseInt(process.env.TYPESENSE_PORT || '8108'),
      protocol: process.env.TYPESENSE_PROTOCOL || 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || 'xyz123',
  connectionTimeoutSeconds: 120,      // ✅ FIX: was 10, increased to prevent 504 on large imports
  timeoutSeconds: 120,                // ✅ FIX: added explicit timeout
  healthcheckIntervalSeconds: 30,
  retryIntervalSeconds: 2,            // ✅ FIX: retry on transient failures
  numRetries: 3,                      // ✅ FIX: retry up to 3 times
})

// Batch size for imports — keeps each request small to avoid timeouts
const IMPORT_BATCH_SIZE = 50

// Complete product schema with ALL variant-specific image fields
const productSchema = {
  name: 'products',
  fields: [
    // Basic product fields
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'description', type: 'string', optional: true },
    { name: 'handle', type: 'string' },
    { name: 'status', type: 'string', facet: true },
    { name: 'thumbnail', type: 'string', optional: true },
    { name: 'first_image_url', type: 'string', optional: true },
    { name: 'created_at', type: 'int64' },
    { name: 'updated_at', type: 'int64' },
    
    // Collection fields
    { name: 'collection_title', type: 'string', facet: true, optional: true },
    { name: 'collection_handle', type: 'string', optional: true },
    { name: 'collection_id', type: 'string', optional: true },
    
    // Vendor fields
    { name: 'vendor_id', type: 'string', optional: true, facet: true },
    { name: 'vendor_name', type: 'string', optional: true, facet: true },
    { name: 'vendor_handle', type: 'string', optional: true },
    
    // Price fields
    { name: 'min_price_amount', type: 'int64', optional: true },
    { name: 'max_price_amount', type: 'int64', optional: true },
    { name: 'currency_code', type: 'string', optional: true, facet: true },
    
    // Variant information
    { name: 'variant_count', type: 'int32', optional: true },
    { name: 'variant_titles', type: 'string', optional: true },
    { name: 'has_variants', type: 'bool', optional: true },
    
    // Color and attributes
    { name: 'color_names', type: 'string', optional: true, facet: true },
    { name: 'color_hex_values', type: 'string', optional: true },
    { name: 'tags', type: 'string', facet: true, optional: true },
    { name: 'categories', type: 'string', facet: true, optional: true },
    
    // CRITICAL: Complete variant-specific image fields for color-based image selection
    { name: 'all_images', type: 'string', optional: true },
    { name: 'option_images', type: 'string', optional: true },
    { name: 'variant_images', type: 'string', optional: true },
    { name: 'variant_specific_image_option', type: 'string', optional: true },
    { name: 'fulfillment_type', type: 'string', optional: true },
    
    // CRITICAL: Complete variant and options data with METADATA preservation
    { name: 'variants_data', type: 'string', optional: true },
    { name: 'options_data', type: 'string', optional: true },
    
    // Search optimization
    { name: 'search_text', type: 'string', optional: true },
  ],
  default_sorting_field: 'created_at',
  token_separators: ['-', '_', '.', '/', '\\'],
  symbols_to_index: ['#', '+', '&', '@'],
}

class TypesenseService {
  public client: Client

  constructor() {
    this.client = client
  }

  async initializeSchema() {
    try {
      try {
        await this.client.collections('products').delete()
        console.log('🗑️ Deleted existing products collection')
      } catch (error) {
        console.log('ℹ️ No existing collection to delete')
      }

      await this.client.collections().create(productSchema)
      console.log('✅ Products collection created with COMPLETE variant-specific image support')
    } catch (createError) {
      console.error('❌ Error creating products collection:', createError)
      throw createError
    }
  }

  // Extract vendor information from product
  private extractVendorData(product: any) {
    const vendor = product.vendor || null
    
    if (!vendor) {
      return {
        vendor_id: '',
        vendor_name: '',
        vendor_handle: '',
      }
    }

    return {
      vendor_id: String(vendor.id || ''),
      vendor_name: String(vendor.name || ''),
      vendor_handle: String(vendor.handle || vendor.name?.toLowerCase().replace(/\s+/g, '-') || ''),
    }
  }

  // Extract price information from variants
  private extractPriceData(product: any, region?: any) {
    const variants = product.variants || []
    
    if (variants.length === 0) {
      return {
        min_price_amount: 0,
        max_price_amount: 0,
        currency_code: region?.currency_code || 'INR',
      }
    }

    const prices = variants
      .map((variant: any) => {
        const calculatedPrice = variant.calculated_price?.calculated_amount
        const priceAmount = variant.prices?.[0]?.amount
        const directPrice = variant.price_amount
        
        const price = calculatedPrice || priceAmount || directPrice || 0
        return typeof price === 'number' ? price : 0
      })
      .filter((price: number) => price > 0)

    if (prices.length === 0) {
      return {
        min_price_amount: 0,
        max_price_amount: 0,
        currency_code: region?.currency_code || 'INR',
      }
    }

    return {
      min_price_amount: Math.min(...prices),
      max_price_amount: Math.max(...prices),
      currency_code: region?.currency_code || 'INR',
    }
  }

  // Extract complete metadata with ALL variant-specific image data
  private extractMetadata(product: any) {
    const metadata = product.metadata || {}
    
    let colorNames = ''
    let colorHexValues = ''
    let optionImages = ''
    let variantImages = ''
    let variantSpecificImageOption = ''
    let fulfillmentType = ''
    
    if (metadata.color_hex_values) {
      try {
        const colors = typeof metadata.color_hex_values === 'string' 
          ? JSON.parse(metadata.color_hex_values)
          : metadata.color_hex_values
          
        if (Array.isArray(colors)) {
          const names = colors.map((color: any) => color.name).filter(Boolean)
          colorNames = names.join(', ')
          colorHexValues = JSON.stringify(colors)
        }
      } catch (error) {
        console.warn('Error parsing color metadata:', error)
        if (typeof metadata.color_hex_values === 'string') {
          colorHexValues = metadata.color_hex_values
        }
      }
    }

    if (metadata.option_images) {
      try {
        const optionImagesData = typeof metadata.option_images === 'string' 
          ? JSON.parse(metadata.option_images)
          : metadata.option_images
        optionImages = JSON.stringify(optionImagesData)
      } catch (error) {
        console.warn('Error parsing option_images metadata:', error)
        optionImages = String(metadata.option_images || '')
      }
    }

    if (metadata.variant_images) {
      try {
        const variantImagesData = typeof metadata.variant_images === 'string' 
          ? JSON.parse(metadata.variant_images)
          : metadata.variant_images
        variantImages = JSON.stringify(variantImagesData)
      } catch (error) {
        console.warn('Error parsing variant_images metadata:', error)
        variantImages = String(metadata.variant_images || '')
      }
    }

    if (metadata.variant_specific_image_option) {
      try {
        const variantSpecificData = typeof metadata.variant_specific_image_option === 'string' 
          ? JSON.parse(metadata.variant_specific_image_option)
          : metadata.variant_specific_image_option
        variantSpecificImageOption = JSON.stringify(variantSpecificData)
      } catch (error) {
        console.warn('Error parsing variant_specific_image_option metadata:', error)
        variantSpecificImageOption = String(metadata.variant_specific_image_option || '')
      }
    }

    if (metadata.fulfillment_type) {
      try {
        const fulfillmentData = typeof metadata.fulfillment_type === 'string' 
          ? JSON.parse(metadata.fulfillment_type)
          : metadata.fulfillment_type
        fulfillmentType = JSON.stringify(fulfillmentData)
      } catch (error) {
        console.warn('Error parsing fulfillment_type metadata:', error)
        fulfillmentType = String(metadata.fulfillment_type || '')
      }
    }

    return {
      color_names: colorNames,
      color_hex_values: colorHexValues,
      option_images: optionImages,
      variant_images: variantImages,
      variant_specific_image_option: variantSpecificImageOption,
      fulfillment_type: fulfillmentType,
    }
  }

  // Extract complete image data for color-based switching
  private extractImageData(product: any) {
    const images = product.images || []
    
    const allImages = images.map((img: any) => ({
      id: img.id,
      url: img.url,
      metadata: img.metadata || null,
      rank: img.rank || 0,
      product_id: img.product_id || product.id,
      created_at: img.created_at || new Date().toISOString(),
      updated_at: img.updated_at || new Date().toISOString(),
      deleted_at: img.deleted_at || null
    }))

    return {
      all_images: JSON.stringify(allImages)
    }
  }

  // Extract complete variant and options data with FULL metadata preservation
  private extractVariantAndOptionsData(product: any) {
    const variants = product.variants || []
    const options = product.options || []

    const variantsData = variants.map((variant: any) => ({
      id: variant.id,
      title: variant.title,
      sku: variant.sku,
      barcode: variant.barcode,
      ean: variant.ean,
      upc: variant.upc,
      allow_backorder: variant.allow_backorder || false,
      manage_inventory: variant.manage_inventory || false,
      inventory_quantity: variant.inventory_quantity || 0,
      variant_rank: variant.variant_rank || 0,
      metadata: variant.metadata || {},
      options: (variant.options || []).map((opt: any) => ({
        id: opt.id,
        value: opt.value,
        metadata: opt.metadata || null,
        option_id: opt.option_id,
        option: opt.option ? {
          id: opt.option.id,
          title: opt.option.title,
          metadata: opt.option.metadata || null,
          product_id: opt.option.product_id
        } : null,
        created_at: opt.created_at,
        updated_at: opt.updated_at,
        deleted_at: opt.deleted_at
      })),
      calculated_price: variant.calculated_price,
      prices: variant.prices || [],
      weight: variant.weight,
      length: variant.length,
      height: variant.height,
      width: variant.width,
      hs_code: variant.hs_code,
      origin_country: variant.origin_country,
      mid_code: variant.mid_code,
      material: variant.material,
      created_at: variant.created_at,
      updated_at: variant.updated_at,
      deleted_at: variant.deleted_at
    }))

    const optionsData = options.map((option: any) => ({
      id: option.id,
      title: option.title,
      metadata: option.metadata || null,
      product_id: option.product_id,
      created_at: option.created_at,
      updated_at: option.updated_at,
      deleted_at: option.deleted_at,
      values: (option.values || []).map((value: any) => ({
        id: value.id,
        value: value.value,
        metadata: value.metadata || null,
        option_id: value.option_id,
        created_at: value.created_at,
        updated_at: value.updated_at,
        deleted_at: value.deleted_at
      }))
    }))

    return {
      variants_data: JSON.stringify(variantsData),
      options_data: JSON.stringify(optionsData)
    }
  }

  // Extract categories and tags
  private extractTaxonomyData(product: any) {
    const categories = product.categories || []
    const tags = product.tags || []
    
    const categoryNames = categories
      .map((cat: any) => cat.name || cat.title || '')
      .filter(Boolean)
      .join(', ')
    
    const tagValues = tags
      .map((tag: any) => tag.value || tag.name || '')
      .filter(Boolean)
      .join(', ')

    return {
      categories: categoryNames,
      tags: tagValues,
    }
  }

  // Build comprehensive search text
  private buildSearchText(product: any, vendorData: any, taxonomyData: any) {
    const searchParts = [
      product.title,
      product.description,
      product.handle,
      vendorData.vendor_name,
      product.collection?.title,
      taxonomyData.categories,
      taxonomyData.tags,
    ].filter(Boolean)

    return searchParts.join(' ').toLowerCase()
  }

  // Transform a single product into a Typesense document
  private buildDocument(product: any, region?: any) {
    const vendorData = this.extractVendorData(product)
    const priceData = this.extractPriceData(product, region)
    const metadataData = this.extractMetadata(product)
    const imageData = this.extractImageData(product)
    const variantOptionsData = this.extractVariantAndOptionsData(product)
    const taxonomyData = this.extractTaxonomyData(product)
    const searchText = this.buildSearchText(product, vendorData, taxonomyData)

    return {
      id: String(product.id || ''),
      title: String(product.title || ''),
      description: String(product.description || '').replace(/<[^>]*>/g, ''),
      handle: String(product.handle || ''),
      status: String(product.status || 'draft'),
      thumbnail: String(product.thumbnail || ''),
      first_image_url: String(product.images?.[0]?.url || product.thumbnail || ''),
      collection_id: String(product.collection?.id || ''),
      collection_title: String(product.collection?.title || ''),
      collection_handle: String(product.collection?.handle || ''),
      ...vendorData,
      ...priceData,
      ...metadataData,
      ...imageData,
      ...variantOptionsData,
      ...taxonomyData,
      variant_count: product.variants ? product.variants.length : 0,
      variant_titles: product.variants 
        ? product.variants.map((v: any) => String(v.title || '')).join(', ') 
        : '',
      has_variants: product.variants ? product.variants.length > 1 : false,
      search_text: searchText,
      created_at: Math.floor(new Date(product.created_at || new Date()).getTime() / 1000),
      updated_at: Math.floor(new Date(product.updated_at || new Date()).getTime() / 1000),
    }
  }

  // Index a single product
  async indexProduct(product: any, region?: any) {
    try {
      console.log(`🔄 [INDEXING] Processing product: ${product.title} (${product.id})`)
      const typesenseDoc = this.buildDocument(product, region)
      await this.client.collections('products').documents().upsert(typesenseDoc)
      console.log(`✅ [INDEXING] Product ${product.id} indexed successfully`)
      return typesenseDoc
    } catch (error) {
      console.error(`❌ [INDEXING] Error indexing product ${product.id}:`, error)
      throw error
    }
  }

  // ✅ FIX: Batch index products in chunks to prevent 504 timeouts
  async indexProducts(products: any[], region?: any) {
    try {
      console.log(`🔄 [BATCH INDEXING] Starting batch indexing of ${products.length} products (batch size: ${IMPORT_BATCH_SIZE})...`)

      // Build all documents first (CPU only, no network)
      const documents = products.map(product => this.buildDocument(product, region))

      // Log data quality summary
      const withVendor = documents.filter(doc => doc.vendor_name).length
      const withPrice = documents.filter(doc => doc.min_price_amount > 0).length
      const withOptionImages = documents.filter(doc => doc.option_images).length
      const withVariantImages = documents.filter(doc => doc.variant_images).length
      const withCompleteVariantData = documents.filter(doc => doc.variants_data && doc.options_data).length
      
      console.log(`📊 [BATCH INDEXING] Data quality:`)
      console.log(`  - With vendor:          ${withVendor}/${documents.length}`)
      console.log(`  - With price:           ${withPrice}/${documents.length}`)
      console.log(`  - With option images:   ${withOptionImages}/${documents.length}`)
      console.log(`  - With variant images:  ${withVariantImages}/${documents.length}`)
      console.log(`  - With variant data:    ${withCompleteVariantData}/${documents.length}`)

      // ✅ FIX: Import in batches instead of one giant request
      let totalIndexed = 0
      const errors: Array<{ batch: number; error: string }> = []

      for (let i = 0; i < documents.length; i += IMPORT_BATCH_SIZE) {
        const batch = documents.slice(i, i + IMPORT_BATCH_SIZE)
        const batchNumber = Math.floor(i / IMPORT_BATCH_SIZE) + 1
        const totalBatches = Math.ceil(documents.length / IMPORT_BATCH_SIZE)

        try {
          const results = await this.client
            .collections('products')
            .documents()
            .import(batch, { action: 'upsert' })

          // Check for per-document errors in the response
          const failedDocs = results.filter((r: any) => !r.success)
          if (failedDocs.length > 0) {
            console.warn(`⚠️ [BATCH INDEXING] Batch ${batchNumber}: ${failedDocs.length} documents failed`)
            failedDocs.forEach((doc: any) => {
              console.warn(`  - Error: ${doc.error} | Doc ID: ${doc.document?.id}`)
            })
          }

          totalIndexed += batch.length - failedDocs.length
          console.log(`✅ [BATCH INDEXING] Batch ${batchNumber}/${totalBatches} done — ${totalIndexed}/${documents.length} total indexed`)
        } catch (batchError: any) {
          console.error(`❌ [BATCH INDEXING] Batch ${batchNumber} failed:`, batchError.message)
          errors.push({ batch: batchNumber, error: batchError.message })
          // Continue with next batch instead of crashing everything
        }
      }

      if (errors.length > 0) {
        console.warn(`⚠️ [BATCH INDEXING] Completed with ${errors.length} failed batches:`, errors)
      } else {
        console.log(`✅ [BATCH INDEXING] All ${totalIndexed} products indexed successfully`)
      }

      return { 
        success: errors.length === 0, 
        total_indexed: totalIndexed,
        total_products: documents.length,
        failed_batches: errors
      }
    } catch (error) {
      console.error('❌ [BATCH INDEXING] Fatal error during batch indexing:', error)
      throw error
    }
  }

  async searchProducts(query: string, options: any = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        filter_by = '',
        vendor_names = [],
        price_range = {},
        colors = [],
        collections = [],
        sort_by = 'created_at:desc',
        facet_by = 'vendor_name,collection_title,color_names,currency_code,status'
      } = options

      const filters = [filter_by].filter(Boolean)
      
      if (vendor_names.length > 0) {
        const vendorFilter = vendor_names.map((name: string) => `vendor_name:=${name}`).join(' || ')
        filters.push(`(${vendorFilter})`)
      }
      
      if (price_range.min !== undefined || price_range.max !== undefined) {
        const priceFilters = []
        if (price_range.min !== undefined) {
          priceFilters.push(`min_price_amount:>=${price_range.min * 100}`)
        }
        if (price_range.max !== undefined) {
          priceFilters.push(`max_price_amount:<=${price_range.max * 100}`)
        }
        if (priceFilters.length > 0) {
          filters.push(priceFilters.join(' && '))
        }
      }
      
      if (colors.length > 0) {
        const colorFilter = colors.map((color: string) => `color_names:${color}`).join(' || ')
        filters.push(`(${colorFilter})`)
      }
      
      if (collections.length > 0) {
        const collectionFilter = collections.map((col: string) => `collection_handle:=${col}`).join(' || ')
        filters.push(`(${collectionFilter})`)
      }

      const searchParameters = {
        q: query || '*',
        query_by: 'title,description,search_text,vendor_name,collection_title,tags,categories',
        filter_by: filters.join(' && '),
        facet_by,
        max_facet_values: options.max_facet_values || 100,
        page: Math.floor(offset / limit) + 1,
        per_page: limit,
        sort_by,
        num_typos: 2,
        typo_tokens_threshold: 2,
        drop_tokens_threshold: 0,
      }

      console.log('🔍 [SEARCH] Typesense search params:', searchParameters)

      const searchResults = await this.client
        .collections('products')
        .documents()
        .search(searchParameters)

      console.log(`✅ [SEARCH] ${searchResults.found} results found in ${searchResults.search_time_ms}ms`)

      return searchResults
    } catch (error) {
      console.error('❌ [SEARCH] Error searching products:', error)
      throw error
    }
  }

  async deleteProduct(productId: string) {
    try {
      await this.client.collections('products').documents(productId).delete()
      console.log(`✅ Product ${productId} deleted from search index`)
    } catch (error) {
      console.error(`❌ Error deleting product ${productId}:`, error)
      throw error
    }
  }

  async clearIndex() {
    try {
      await this.client.collections('products').delete()
      console.log('✅ Products collection deleted')
    } catch (error) {
      console.error('❌ Error deleting products collection:', error)
      throw error
    }
  }

  async getStats() {
    try {
      const stats = await this.client.collections('products').retrieve()
      console.log('📊 [STATS] Collection stats:', {
        name: stats.name,
        num_documents: stats.num_documents,
        has_variant_image_fields: stats.fields.some((f: any) => 
          ['option_images', 'variant_images', 'variants_data', 'options_data', 'all_images'].includes(f.name)
        )
      })
      return stats
    } catch (error) {
      console.error('❌ [STATS] Error getting collection stats:', error)
      throw error
    }
  }

  async healthCheck() {
    try {
      const health = await this.client.health.retrieve()
      console.log('✅ [HEALTH] Typesense health:', health)
      return health
    } catch (error) {
      console.error('❌ [HEALTH] Typesense health check failed:', error)
      throw error
    }
  }
}

export const typesenseService = new TypesenseService()
export const typesenseClient = client
export { client }
export default typesenseService

export async function reindexAllProductsWithCompleteVariantImages() {
  console.log('🔄 [REINDEX] Starting complete product reindexing...')
  
  try {
    await typesenseService.initializeSchema()
    
    const { products, region } = await fetchProductsWithCompleteVariantImageData()
    
    if (products.length === 0) {
      console.log('⚠️ [REINDEX] No products found to index')
      return
    }
    
    console.log(`📦 [REINDEX] Found ${products.length} products to index`)
    
    await typesenseService.indexProducts(products, region)
    
    console.log('✅ [REINDEX] Complete reindexing finished!')
    
  } catch (error) {
    console.error('❌ [REINDEX] Reindexing failed:', error)
    throw error
  }
}

async function fetchProductsWithCompleteVariantImageData() {
  console.log('⚠️ [REINDEX] fetchProductsWithCompleteVariantImageData not implemented yet')
  return {
    products: [],
    region: { currency_code: 'INR' }
  }
}