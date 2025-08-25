import { NextRequest, NextResponse } from 'next/server'
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      orderId, 
      countryCode = 'in', 
      limit = 4,
      collectionIds = [],
      tagIds = [],
      excludeProductIds = []
    } = body

    console.log('API /api/products/related - Request:', { 
      orderId, 
      countryCode, 
      limit,
      collectionIds,
      tagIds,
      excludeProductIds 
    })

    // Get region
    let region
    try {
      region = await getRegion(countryCode)
    } catch (error) {
      // Try fallback regions
      const fallbackCountries = ['in', 'us', 'gb']
      for (const country of fallbackCountries) {
        try {
          region = await getRegion(country)
          if (region) {
            console.log('API - Using fallback region:', country, region.id)
            break
          }
        } catch (err) {
          console.log('API - Fallback failed for:', country)
        }
      }
    }

    if (!region) {
      return NextResponse.json(
        { error: 'No region found', products: [] },
        { status: 400 }
      )
    }

    console.log('API - Using region:', region.id)

    // Try to get products from same collections first
    let products: any[] = []
    
    if (collectionIds.length > 0) {
      console.log('API - Trying products from same collections:', collectionIds)
      
      try {
        const collectionResult = await listProducts({
          queryParams: {
            region_id: region.id,
            collection_id: collectionIds,
            limit: limit * 2, // Get more to filter out purchased items
            is_giftcard: false,
          },
          countryCode,
        })
        
        products = collectionResult?.response?.products || []
        console.log('API - Products from collections:', products.length)
      } catch (error) {
        console.log('API - Collection query failed:', error)
      }
    }

    // If not enough products from collections, try with tags
    if (products.length < limit && tagIds.length > 0) {
      console.log('API - Trying products with same tags:', tagIds)
      
      try {
        const tagResult = await listProducts({
          queryParams: {
            region_id: region.id,
            tag_id: tagIds,
            limit: limit * 2,
            is_giftcard: false,
          },
          countryCode,
        })
        
        const tagProducts = tagResult?.response?.products || []
        console.log('API - Products from tags:', tagProducts.length)
        
        // Merge with collection products, avoiding duplicates
        const existingIds = new Set(products.map(p => p.id))
        const newTagProducts = tagProducts.filter(p => !existingIds.has(p.id))
        products = [...products, ...newTagProducts]
      } catch (error) {
        console.log('API - Tag query failed:', error)
      }
    }

    // If still not enough products, get general recommendations
    if (products.length < limit) {
      console.log('API - Getting general recommendations')
      
      try {
        const generalResult = await listProducts({
          queryParams: {
            region_id: region.id,
            limit: limit * 2,
            is_giftcard: false,
          },
          countryCode,
        })
        
        const generalProducts = generalResult?.response?.products || []
        console.log('API - General products found:', generalProducts.length)
        
        // Merge, avoiding duplicates
        const existingIds = new Set(products.map(p => p.id))
        const newGeneralProducts = generalProducts.filter(p => !existingIds.has(p.id))
        products = [...products, ...newGeneralProducts]
      } catch (error) {
        console.log('API - General query failed:', error)
      }
    }

    // Filter out products that were in the order
    const filteredProducts = products.filter(product => 
      !excludeProductIds.includes(product.id)
    )

    console.log('API - Filtered products (excluding ordered):', filteredProducts.length)

    // Return the top products
    const finalProducts = filteredProducts.slice(0, parseInt(limit))
    
    return NextResponse.json({
      success: true,
      products: finalProducts,
      region: region.id,
      regionData: region, // Include full region data for Product component
      debug: {
        totalFound: products.length,
        afterFiltering: filteredProducts.length,
        returned: finalProducts.length,
        collectionIds,
        tagIds,
        excludeProductIds,
      }
    })

  } catch (error) {
    console.error('API /api/products/related - Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch products', 
        message: error instanceof Error ? error.message : 'Unknown error',
        products: [] 
      },
      { status: 500 }
    )
  }
}

// Also support GET for testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const countryCode = searchParams.get('countryCode') || 'in'
  const limit = searchParams.get('limit') || '4'

  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({
      orderId: 'test',
      countryCode,
      limit: parseInt(limit),
      collectionIds: [],
      tagIds: [],
      excludeProductIds: [],
    }),
  }))
}