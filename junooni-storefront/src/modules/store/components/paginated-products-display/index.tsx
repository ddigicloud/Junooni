// PaginatedProductsDisplay.tsx - PURE DISPLAY COMPONENT (for client components)
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { HttpTypes } from "@medusajs/types"

type PaginatedProductsDisplayProps = {
  products: any[]
  totalCount: number
  currentPage: number
  totalPages: number
  region: HttpTypes.StoreRegion
  selectedColors?: string[] // ✅ NEW: Add selectedColors prop for image selection
}

export default function PaginatedProductsDisplay({
  products = [],
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  region,
  selectedColors = [] // ✅ NEW: Accept selectedColors with default empty array
}: PaginatedProductsDisplayProps) {
  console.log('📦 PaginatedProductsDisplay:')
  console.log('- products length:', products.length)
  console.log('- totalCount:', totalCount)
  console.log('- currentPage:', currentPage)
  console.log('- totalPages:', totalPages)
  console.log('- selectedColors for image selection:', selectedColors) // ✅ NEW: Log selected colors

   // ✅ ENHANCED DEBUGGING WITH COLOR INFO:
  console.log('\n🔍 PAGINATEDPRODUCTSDISPLAY DETAILED DEBUG:')
  console.log('- region received:', region ? {
    id: region.id,
    currency_code: region.currency_code,
    name: region.name
  } : 'NULL REGION')
  console.log('- selectedColors for ProductPreview:', selectedColors)
  console.log('- Color-based image selection:', selectedColors.length > 0 ? 'ENABLED' : 'DISABLED')
  
  if (products.length > 0) {
    const sampleProduct = products[0]
    console.log('- First product title:', sampleProduct.title)
    console.log('- First product has variants:', !!sampleProduct.variants)
    console.log('- First product variants length:', sampleProduct.variants?.length || 0)
    
    if (sampleProduct.variants?.[0]?.calculated_price) {
      console.log('- First product calculated_amount:', sampleProduct.variants[0].calculated_price.calculated_amount)
      console.log('- First product currency_code:', sampleProduct.variants[0].calculated_price.currency_code)
      console.log('✅ PRODUCT DATA LOOKS CORRECT FOR PRODUCTPREVIEW')
    } else {
      console.log('❌ PRODUCT MISSING PRICE DATA - PRODUCTPREVIEW WILL SHOW N/A')
    }
    
    // ✅ NEW: Check if product has color data for the selected colors
    if (selectedColors.length > 0 && sampleProduct.metadata?.color_hex_values) {
      console.log('- First product has color metadata for image selection')
      try {
        const colorData = typeof sampleProduct.metadata.color_hex_values === 'string' 
          ? JSON.parse(sampleProduct.metadata.color_hex_values)
          : sampleProduct.metadata.color_hex_values
        console.log('- Available colors in first product:', Array.isArray(colorData) ? colorData.map(c => c.name) : 'Invalid format')
      } catch (e) {
        console.log('- Color data parsing failed for first product')
      }
    }
  }
  
  // Safety checks
  if (!region) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-12">
        <h2 className="text-2xl font-medium text-gray-900">Loading...</h2>
        <p className="mt-2 text-base text-gray-500">Please wait while we load the products.</p>
      </div>
    )
  }

  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-12">
        <h2 className="text-2xl font-medium text-gray-900">No products found</h2>
        <p className="mt-2 text-base text-gray-500">Try adjusting your filters to find what you're looking for.</p>
        {selectedColors.length > 0 && (
          <p className="mt-1 text-sm text-orange-600">
            No products found with {selectedColors.join(', ')} color variant{selectedColors.length > 1 ? 's' : ''}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Sort & View Options */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-gray-600">
            Showing <span className="font-medium">{products.length}</span> of <span className="font-medium">{totalCount}</span> products
          </p>
          {/* ✅ NEW: Color selection indicator */}
          {/* {selectedColors.length > 0 && (
            <p className="text-sm text-[#e65100]">
              🎨 Images showing {selectedColors.join(', ')} variant{selectedColors.length > 1 ? 's' : ''} when available
            </p>
          )} */}
        </div>
      </div>
      
      {/* Products Grid */}
      <ul
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        data-testid="products-list"
      >
        {products.map((product, index) => {
          if (!product || !product.id) return null
          
          // ✅ ENHANCED DEBUG FOR COLOR-BASED IMAGE SELECTION:
          if (index === 0) { // Only log first product to avoid spam
            console.log(`\n🎯 PASSING TO PRODUCTPREVIEW #${index}:`)
            console.log('- Product:', product.title)
            console.log('- Region:', region?.currency_code || 'NO REGION')
            console.log('- Has price data:', !!product.variants?.[0]?.calculated_price?.calculated_amount)
            console.log('- selectedColors passed:', selectedColors) // ✅ NEW: Log colors being passed
            console.log('- Color-based image selection:', selectedColors.length > 0 ? 'ENABLED' : 'DISABLED')
          }
          
          return (
            <li key={product.id} className="overflow-hidden transition-shadow bg-white border border-gray-100 rounded-lg shadow-sm group hover:shadow-md">
              <ProductPreview 
                product={product} 
                region={region}
                selectedColors={selectedColors} // ✅ CRITICAL: Pass selected colors for image selection
              />
            </li>
          )
        })}
      </ul>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={currentPage}
          totalPages={totalPages}
        />
      )}
      
      {/* ✅ NEW: Development debugging info */}
      {/* {selectedColors.length > 0 && process.env.NODE_ENV === 'development' && (
        <div className="p-3 mt-6 border-l-4 border-blue-400 rounded bg-blue-50">
          <div className="text-sm">
            <p className="font-medium text-blue-800">🔧 Developer Info:</p>
            <p className="text-blue-700">
              Color-based image selection is active for: <strong>{selectedColors.join(', ')}</strong>
            </p>
            <p className="mt-1 text-xs text-blue-600">
              Products will display variant images matching these colors when available
            </p>
          </div>
        </div>
      )} */}
    </div>
  )
}