// lib/typesense.ts - ENHANCED WITH COMPLETE VARIANT-SPECIFIC IMAGE SUPPORT
import Typesense from 'typesense'

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
  connectionTimeoutSeconds: 10,
  healthcheckIntervalSeconds: 30,
})

// ✅ ENHANCED: Complete product schema with ALL variant-specific image fields
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
    
    // ✅ CRITICAL: COMPLETE variant-specific image fields for color-based image selection
    { name: 'all_images', type: 'string', optional: true }, // Complete images array JSON
    { name: 'option_images', type: 'string', optional: true }, // Product-level option→image mappings
    { name: 'variant_images', type: 'string', optional: true }, // Product-level variant→image mappings
    { name: 'variant_specific_image_option', type: 'string', optional: true }, // Image option settings
    { name: 'fulfillment_type', type: 'string', optional: true }, // Additional metadata
    
    // ✅ CRITICAL: Complete variant and options data with METADATA preservation
    { name: 'variants_data', type: 'string', optional: true }, // Complete variants with variant.metadata
    { name: 'options_data', type: 'string', optional: true }, // Complete options with values
    
    // Search optimization
    { name: 'search_text', type: 'string', optional: true },
  ],
  default_sorting_field: 'created_at',
  token_separators: ['-', '_', '.', '/', '\\'],
  symbols_to_index: ['#', '+', '&', '@'],
}

class TypesenseService {
  public client: Typesense.Client

  constructor() {
    this.client = client
  }

  async initializeSchema() {
    try {
      // Delete existing collection to recreate with new schema
      try {
        await this.client.collections('products').delete()
        console.log('🗑️ Deleted existing products collection')
      } catch (error) {
        console.log('ℹ️ No existing collection to delete')
      }

      // Create new collection with enhanced schema
      await this.client.collections().create(productSchema)
      console.log('✅ Products collection created with COMPLETE variant-specific image support')
    } catch (createError) {
      console.error('❌ Error creating products collection:', createError)
      throw createError
    }
  }

  // ✅ ENHANCED: Extract vendor information from product
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

  // ✅ ENHANCED: Extract price information from variants
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

  // ✅ ENHANCED: Extract complete metadata with ALL variant-specific image data
  private extractMetadata(product: any) {
    const metadata = product.metadata || {}
    
    let colorNames = ''
    let colorHexValues = ''
    let optionImages = ''
    let variantImages = ''
    let variantSpecificImageOption = ''
    let fulfillmentType = ''
    
    // Extract colors from metadata
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
        // Store as string if JSON parsing fails
        if (typeof metadata.color_hex_values === 'string') {
          colorHexValues = metadata.color_hex_values
        }
      }
    }

    // ✅ CRITICAL: Extract option_images for color-based image switching
    if (metadata.option_images) {
      try {
        const optionImagesData = typeof metadata.option_images === 'string' 
          ? JSON.parse(metadata.option_images)
          : metadata.option_images
        optionImages = JSON.stringify(optionImagesData)
        console.log('🎨 [INDEXING] Extracted option_images:', optionImagesData)
      } catch (error) {
        console.warn('Error parsing option_images metadata:', error)
        // Store as string if JSON parsing fails
        optionImages = String(metadata.option_images || '')
      }
    }

    // ✅ CRITICAL: Extract variant_images mapping (product-level)
    if (metadata.variant_images) {
      try {
        const variantImagesData = typeof metadata.variant_images === 'string' 
          ? JSON.parse(metadata.variant_images)
          : metadata.variant_images
        variantImages = JSON.stringify(variantImagesData)
        console.log('🎨 [INDEXING] Extracted variant_images:', variantImagesData)
      } catch (error) {
        console.warn('Error parsing variant_images metadata:', error)
        // Store as string if JSON parsing fails
        variantImages = String(metadata.variant_images || '')
      }
    }

    // ✅ ENHANCED: Extract variant_specific_image_option
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

    // ✅ ENHANCED: Extract fulfillment_type
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

  // ✅ ENHANCED: Extract complete image data for color-based switching
  private extractImageData(product: any) {
    const images = product.images || []
    
    // All product images with complete structure
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

  // ✅ CRITICAL: Extract complete variant and options data with FULL metadata preservation
  private extractVariantAndOptionsData(product: any) {
    const variants = product.variants || []
    const options = product.options || []

    // ✅ CRITICAL: Complete variant data with ALL metadata (including variant_images!)
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
      
      // ✅ CRITICAL: COMPLETE metadata preservation including variant-specific images!
      metadata: variant.metadata || {}, // This includes variant_images and variant_image_ids!
      
      // ✅ CRITICAL: Complete options with option details
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
      
      // ✅ CRITICAL: Complete pricing data
      calculated_price: variant.calculated_price,
      prices: variant.prices || [],
      
      // Additional variant fields
      weight: variant.weight,
      length: variant.length,
      height: variant.height,
      width: variant.width,
      hs_code: variant.hs_code,
      origin_country: variant.origin_country,
      mid_code: variant.mid_code,
      material: variant.material,
      
      // Timestamps
      created_at: variant.created_at,
      updated_at: variant.updated_at,
      deleted_at: variant.deleted_at
    }))

    // ✅ CRITICAL: Complete options data with full values
    const optionsData = options.map((option: any) => ({
      id: option.id,
      title: option.title,
      metadata: option.metadata || null,
      product_id: option.product_id,
      created_at: option.created_at,
      updated_at: option.updated_at,
      deleted_at: option.deleted_at,
      
      // ✅ CRITICAL: Complete values array
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

    // ✅ DEBUG: Log variant-specific image data during indexing
    const variantsWithImages = variantsData.filter(v => 
      v.metadata && (v.metadata.variant_images || v.metadata.variant_image_ids)
    )
    
    if (variantsWithImages.length > 0) {
      console.log(`🎨 [INDEXING] Product ${product.id} has ${variantsWithImages.length} variants with image metadata:`)
      variantsWithImages.forEach(variant => {
        console.log(`  - Variant ${variant.id} (${variant.title}):`, {
          has_variant_images: !!variant.metadata.variant_images,
          has_variant_image_ids: !!variant.metadata.variant_image_ids,
          variant_images: variant.metadata.variant_images,
          variant_image_ids: variant.metadata.variant_image_ids
        })
      })
    }

    return {
      variants_data: JSON.stringify(variantsData),
      options_data: JSON.stringify(optionsData)
    }
  }

  // ✅ ENHANCED: Extract categories and tags
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

  // ✅ ENHANCED: Build comprehensive search text
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

  // ✅ ENHANCED: Index single product with COMPLETE variant-specific image data
  async indexProduct(product: any, region?: any) {
    try {
      console.log(`🔄 [INDEXING] Processing product with COMPLETE variant-specific images: ${product.title} (${product.id})`)

      // Extract all data including COMPLETE variant-specific images
      const vendorData = this.extractVendorData(product)
      const priceData = this.extractPriceData(product, region)
      const metadataData = this.extractMetadata(product)
      const imageData = this.extractImageData(product)
      const variantOptionsData = this.extractVariantAndOptionsData(product)
      const taxonomyData = this.extractTaxonomyData(product)
      const searchText = this.buildSearchText(product, vendorData, taxonomyData)

      // ✅ ENHANCED: Transform to complete flat structure with ALL variant-specific image support
      const typesenseDoc = {
        id: String(product.id || ''),
        title: String(product.title || ''),
        description: String(product.description || '').replace(/<[^>]*>/g, ''),
        handle: String(product.handle || ''),
        status: String(product.status || 'draft'),
        
        // Image info
        thumbnail: String(product.thumbnail || ''),
        first_image_url: String(product.images?.[0]?.url || product.thumbnail || ''),
        
        // Collection info
        collection_id: String(product.collection?.id || ''),
        collection_title: String(product.collection?.title || ''),
        collection_handle: String(product.collection?.handle || ''),
        
        // Vendor data
        ...vendorData,
        
        // Price data
        ...priceData,
        
        // Variant info
        variant_count: product.variants ? product.variants.length : 0,
        variant_titles: product.variants ? 
          product.variants.map((variant: any) => String(variant.title || '')).join(', ') : '',
        has_variants: product.variants ? product.variants.length > 1 : false,
        
        // ✅ CRITICAL: Complete metadata with ALL variant-specific image mappings
        ...metadataData,
        
        // ✅ CRITICAL: Complete image data for color-based switching
        ...imageData,
        
        // ✅ CRITICAL: COMPLETE variant and options data with variant.metadata preservation
        ...variantOptionsData,
        
        // Categories and tags
        ...taxonomyData,
        
        // Search optimization
        search_text: searchText,
        
        // Timestamps
        created_at: Math.floor(new Date(product.created_at || new Date()).getTime() / 1000),
        updated_at: Math.floor(new Date(product.updated_at || new Date()).getTime() / 1000),
      }

      console.log(`🎨 [INDEXING] Product variant-specific image data:`)
      console.log(`  - has_option_images: ${!!metadataData.option_images}`)
      console.log(`  - has_variant_images: ${!!metadataData.variant_images}`)
      console.log(`  - variant_count: ${typesenseDoc.variant_count}`)
      console.log(`  - has_variants_data: ${!!variantOptionsData.variants_data}`)
      console.log(`  - has_options_data: ${!!variantOptionsData.options_data}`)

      // Index the document
      await this.client.collections('products').documents().upsert(typesenseDoc)
      console.log(`✅ [INDEXING] Product ${product.id} indexed successfully with COMPLETE variant-specific image support`)
      
      return typesenseDoc
    } catch (error) {
      console.error(`❌ [INDEXING] Error indexing product ${product.id}:`, error)
      throw error
    }
  }

  // ✅ ENHANCED: Batch index products with COMPLETE variant-specific image data
  async indexProducts(products: any[], region?: any) {
    try {
      console.log(`🔄 [BATCH INDEXING] Starting batch indexing of ${products.length} products with COMPLETE variant-specific image support...`)

      const documents = products.map(product => {
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
          
          // Enhanced data with COMPLETE variant-specific images
          ...vendorData,
          ...priceData,
          ...metadataData,
          ...imageData,
          ...variantOptionsData,
          ...taxonomyData,
          
          variant_count: product.variants ? product.variants.length : 0,
          variant_titles: product.variants ? 
            product.variants.map((variant: any) => String(variant.title || '')).join(', ') : '',
          has_variants: product.variants ? product.variants.length > 1 : false,
          
          search_text: searchText,
          
          created_at: Math.floor(new Date(product.created_at || new Date()).getTime() / 1000),
          updated_at: Math.floor(new Date(product.updated_at || new Date()).getTime() / 1000),
        }
      })

      console.log('📋 [BATCH INDEXING] Sample enhanced product with COMPLETE variant-specific images:')
      console.log(JSON.stringify({
        id: documents[0]?.id,
        title: documents[0]?.title,
        has_option_images: !!documents[0]?.option_images,
        has_variant_images: !!documents[0]?.variant_images,
        has_variants_data: !!documents[0]?.variants_data,
        has_options_data: !!documents[0]?.options_data,
        has_all_images: !!documents[0]?.all_images,
        vendor: documents[0]?.vendor_name
      }, null, 2))

      // Count products with various data types
      const withVendor = documents.filter(doc => doc.vendor_name).length
      const withPrice = documents.filter(doc => doc.min_price_amount > 0).length
      const withOptionImages = documents.filter(doc => doc.option_images).length
      const withVariantImages = documents.filter(doc => doc.variant_images).length
      const withCompleteVariantData = documents.filter(doc => doc.variants_data && doc.options_data).length
      
      console.log(`📊 [BATCH INDEXING] Data quality analysis:`)
      console.log(`  - Products with vendor data: ${withVendor}/${documents.length}`)
      console.log(`  - Products with price data: ${withPrice}/${documents.length}`)
      console.log(`  - Products with option images: ${withOptionImages}/${documents.length}`)
      console.log(`  - Products with variant images: ${withVariantImages}/${documents.length}`)
      console.log(`  - Products with complete variant data: ${withCompleteVariantData}/${documents.length}`)

      // Batch import
      const importResults = await this.client
        .collections('products')
        .documents()
        .import(documents, { action: 'upsert' })

      console.log(`✅ [BATCH INDEXING] Complete indexing finished: ${products.length} products with FULL variant-specific image support`)
      return importResults
    } catch (error) {
      console.error('❌ [BATCH INDEXING] Error indexing products:', error)
      throw error
    }
  }

  // Keep existing search, delete, clear, stats, and health check methods...
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

      // Build enhanced filters
      const filters = [filter_by].filter(Boolean)
      
      // Add vendor filter
      if (vendor_names.length > 0) {
        const vendorFilter = vendor_names.map((name: string) => `vendor_name:=${name}`).join(' || ')
        filters.push(`(${vendorFilter})`)
      }
      
      // Add price range filter
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
      
      // Add color filter
      if (colors.length > 0) {
        const colorFilter = colors.map((color: string) => `color_names:${color}`).join(' || ')
        filters.push(`(${colorFilter})`)
      }
      
      // Add collection filter
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

      console.log('🔍 [SEARCH] Enhanced Typesense search with COMPLETE variant-specific image support:', searchParameters)

      const searchResults = await this.client
        .collections('products')
        .documents()
        .search(searchParameters)

      console.log(`✅ [SEARCH] Search completed: ${searchResults.found} results found in ${searchResults.search_time_ms}ms`)

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
      console.log('📊 [STATS] Complete collection stats with variant-specific images:', {
        name: stats.name,
        num_documents: stats.num_documents,
        fields: stats.fields.map(f => f.name),
        has_complete_variant_image_fields: stats.fields.some(f => 
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
      console.log('✅ [HEALTH] Typesense health check:', health)
      return health
    } catch (error) {
      console.error('❌ [HEALTH] Typesense health check failed:', error)
      throw error
    }
  }
}

// ✅ ENHANCED: Export complete service with variant-specific image support
export const typesenseService = new TypesenseService()
export const typesenseClient = client
export { client }
export default typesenseService

// ✅ ENHANCED: Reindexing utility for COMPLETE variant-specific image data
export async function reindexAllProductsWithCompleteVariantImages() {
  console.log('🔄 [REINDEX] Starting complete product reindexing with FULL variant-specific image support...')
  
  try {
    // Initialize complete schema
    await typesenseService.initializeSchema()
    
    // TODO: Fetch products with COMPLETE variant-specific image data
    const { products, region } = await fetchProductsWithCompleteVariantImageData()
    
    if (products.length === 0) {
      console.log('⚠️ [REINDEX] No products found to index')
      return
    }
    
    console.log(`📦 [REINDEX] Found ${products.length} products to index with COMPLETE variant-specific image support`)
    
    // Batch index with complete data
    await typesenseService.indexProducts(products, region)
    
    console.log('✅ [REINDEX] Complete reindexing finished with FULL variant-specific image support!')
    
  } catch (error) {
    console.error('❌ [REINDEX] Complete reindexing failed:', error)
    throw error
  }
}

// ✅ TODO: Implement this function based on your Medusa setup
async function fetchProductsWithCompleteVariantImageData() {
  console.log('⚠️ [REINDEX] fetchProductsWithCompleteVariantImageData not implemented yet')
  console.log('📝 [REINDEX] You need to implement this function to fetch products with COMPLETE data:')
  console.log('   - vendor.* fields with ALL vendor properties')
  console.log('   - variants.* with metadata.variant_images AND metadata.variant_image_ids (CRITICAL!)')
  console.log('   - variants.calculated_price fields') 
  console.log('   - metadata.option_images field with color->image mappings')
  console.log('   - metadata.variant_images field with variant->image mappings')
  console.log('   - metadata.variant_specific_image_option field')
  console.log('   - metadata.fulfillment_type field')
  console.log('   - complete images array with all properties')
  console.log('   - options.* with values.* (complete option structure)')
  console.log('   - categories.* and tags.* with all properties')
  
  return {
    products: [],
    region: { currency_code: 'INR' }
  }
}