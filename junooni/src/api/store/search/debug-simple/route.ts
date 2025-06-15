import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { typesenseService } from "../../../../../lib/typesense"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    console.log('🧪 DEBUG: Testing with typesenseService...')
    
    // Test connection first
    console.log('🔌 Testing Typesense connection...')
    const health = await typesenseService.healthCheck()
    console.log('✅ Typesense health:', health)

    // Test with simple hardcoded products
    const testProducts = [
      {
        id: "test-1",
        title: "Test Product 1",
        handle: "test-product-1",
        description: "Simple test product",
        status: "published",
        tags: [{ value: "test" }, { value: "debug" }],
        variants: [
          { id: "var-1", title: "Variant 1" },
          { id: "var-2", title: "Variant 2" }
        ],
        collection: { title: "Test Collection", handle: "test-collection" },
        images: [{ url: "https://example.com/image1.jpg" }],
        thumbnail: "https://example.com/thumb1.jpg",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "test-2", 
        title: "Junooni Test Product",
        handle: "junooni-test",
        description: "Another test product with Junooni name",
        status: "published",
        tags: [{ value: "junooni" }, { value: "test" }],
        variants: [
          { id: "var-3", title: "Small" },
          { id: "var-4", title: "Large" }
        ],
        collection: { title: "Junooni Collection", handle: "junooni" },
        images: [{ url: "https://example.com/image2.jpg" }],
        thumbnail: "https://example.com/thumb2.jpg",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    console.log('📋 Test products to index:')
    console.log(JSON.stringify(testProducts.map(p => ({ id: p.id, title: p.title })), null, 2))

    // Try to index using the fixed service
    console.log('🔄 Indexing test products...')
    const result = await typesenseService.indexProducts(testProducts)

    console.log('✅ Indexing successful!')

    // Test search
    console.log('🔍 Testing search for "Junooni"...')
    const searchResult = await typesenseService.searchProducts('Junooni')
    console.log('✅ Search result:', {
      found: searchResult.found,
      hits: searchResult.hits.length
    })

    res.json({
      message: 'DEBUG: Indexing and search successful',
      health: health,
      indexed_count: testProducts.length,
      search_results: {
        query: 'Junooni',
        found: searchResult.found,
        hits: searchResult.hits.map(hit => ({
          id: hit.document.id,
          title: hit.document.title,
          tags: hit.document.tags
        }))
      },
      typesense_result: result
    })

  } catch (error) {
    console.error('❌ DEBUG: Error details:')
    console.error('- Message:', error.message)
    console.error('- Stack:', error.stack)
    console.error('- Type:', error.constructor.name)
    
    res.status(500).json({ 
      error: 'DEBUG: Operation failed',
      details: error.message,
      errorType: error.constructor.name,
      stack: error.stack
    })
  }
}