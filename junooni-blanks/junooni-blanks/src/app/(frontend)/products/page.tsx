import React from 'react'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import ProductImage from './ProductImage'

// Studio Style Product Card Component (remains a Server Component)
function ProductCard({ product }: { product: any }) {
  const productName = product.name || product.title || 'Untitled Product'
  const productSlug = product.slug || ''
  const status = product.status || ''
  const shouldShowStatus = status && status.toLowerCase() !== 'active'
  
  const getStatusStyle = (statusValue: string) => {
    const statusLower = statusValue.toLowerCase()
    
    if (statusLower === 'coming soon' || statusLower === 'coming_soon') {
      return {
        background: '#e65100',
        shadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
      }
    }
    
    if (statusLower === 'draft') {
      return {
       background: '#e65100',
        shadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
      }
    }
    
    if (statusLower === 'discontinued') {
      return {
        background: '#e65100',
        shadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
      }
    }
    
    if (statusLower === 'out of stock' || statusLower === 'out_of_stock') {
      return {
        background: '#e65100',
        shadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
      }
    }
    
    return {
      background: '#e65100',
      shadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
    }
  }

  const statusStyle = shouldShowStatus ? getStatusStyle(status) : null
  
  // OPTIMIZED: Get smallest available image first for faster loading
  const getOptimizedImageUrl = () => {
    if (product.displayImages && product.displayImages.length > 0) {
      const displayImg = product.displayImages[0]
      return displayImg.image?.sizes?.thumbnail?.url 
        || displayImg.image?.sizes?.small?.url 
        || displayImg.image?.sizes?.medium?.url 
        || displayImg.image?.url
        || null
    }
    
    if (product.printT && product.printT.length > 0) {
      const printTech = product.printT[0]
      if (printTech.custAreas && printTech.custAreas.length > 0) {
        const custArea = printTech.custAreas[0]
        if (custArea.designCanvasPhotos && custArea.designCanvasPhotos.length > 0) {
          const photo = custArea.designCanvasPhotos[0].photo
          return photo?.sizes?.thumbnail?.url 
            || photo?.sizes?.small?.url 
            || photo?.url 
            || null
        }
      }
    }
    
    return null
  }
  
  const imageUrl = getOptimizedImageUrl()
  const suggestedPrice = product.pricing?.suggestedRetail || product.price
  const cost = product.cost
  const colorOptions = product.colorOptions || []

  return (
    <Link
      href={`/products/${productSlug}`}
      className="group"
    >
      <div className="overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 rounded-xl hover:shadow-xl">
        {/* Image Container */}
        <div className="relative w-full overflow-hidden bg-gray-50 dark:bg-gray-700" style={{ paddingBottom: '125%' }}>
          <ProductImage 
            imageUrl={imageUrl}
            productName={productName}
            className="absolute inset-0 object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          
          {shouldShowStatus && statusStyle && (
            <div className="absolute top-2 right-2 z-10 sm:top-3 sm:right-3">
              <div 
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white rounded-lg backdrop-blur-sm sm:px-4 sm:py-2"
                style={{ 
                  background: statusStyle.background,
                  boxShadow: statusStyle.shadow
                }}
              >
                 {status.toLowerCase() === 'coming_soon' ? 'Coming Soon' : status}
              </div>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Brand */}
          {product.brand && (
            <span className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
              {product.brand}
            </span>
          )}

          <h3 className="mt-1 mb-3 text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
            {productName}
          </h3>

          {/* Print Technology Tags */}
          {product.printT && product.printT.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {product.printT.slice(0, 2).map((tech: any, index: number) => {
                const techName = typeof tech === 'object' 
                  ? (tech.technologyName || tech.name || tech.title || tech)
                  : tech;
                
                const formatTechName = (name: string) => {
                  const upperName = String(name).toUpperCase();
                  
                  if (upperName === 'DTG' || upperName === 'DTF') {
                    return upperName;
                  }
                  
                  return String(name)
                    .toLowerCase()
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                };
                
                return (
                  <span
                    key={tech.id || index}
                    className="px-2 py-1 text-xs font-medium rounded"
                    style={{ 
                      backgroundColor: index === 0 ? '#FFF4E6' : '#E3F2FD',
                      color: index === 0 ? '#E65100' : '#1976D2'
                    }}
                  >
                    {formatTechName(techName)}
                  </span>
                );
              })}
            </div>
          )}

          {/* Colors */}
          {colorOptions.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Colors:</span>
                <div className="flex gap-1.5">
                  {colorOptions.slice(0, 6).map((color: any, index: number) => (
                    <div
                      key={color.id || index}
                      className="w-6 h-6 border-2 border-gray-300 rounded-full dark:border-gray-600"
                      style={{ backgroundColor: color.colorHex || '#cccccc' }}
                      title={color.colorName}
                    />
                  ))}
                  {colorOptions.length > 6 && (
                    <div className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-gray-600 bg-gray-200 border-2 border-gray-300 rounded-full dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                      +{colorOptions.length - 6}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div>
              {cost ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ₹{cost}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">Price on request</span>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">no minimum</p>
            </div>
            
            {product.status === 'active' && (
              <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full dark:text-green-400 dark:bg-green-900/30">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                In Stock
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// OPTIMIZED: Fetch all products with reduced depth
async function getAllProducts() {
  try {
    const payload = await getPayload({ config: configPromise })
    
    const products = await payload.find({
      collection: 'blank-products',
      limit: 100,
      depth: 1,
      sort: '-createdAt',
      where: {
        status: {
          not_equals: 'draft'
        }
      }
    })

    return products.docs
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

// OPTIMIZED: Fetch categories without deep nesting
async function getAllCategories() {
  try {
    const payload = await getPayload({ config: configPromise })
    
    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
      depth: 0,
      sort: 'title',
    })

    return categories.docs
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function ProductsPage() {
  const products = await getAllProducts()
  const categories = await getAllCategories()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-4 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              Home
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white">All Products</span>
          </nav>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                All Blank Products
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                Browse {products.length}+ blank merchandise ready for customization
              </p>
            </div>

            {/* View Collections Link */}
            <Link
              href="/collection"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-lg hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#e65100' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              View Collections
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Filter by:
            </span>
            
            {/* Category Filter Pills */}
            <Link
              href="/products"
              className="px-4 py-2 text-sm font-medium text-white transition-all rounded-full whitespace-nowrap hover:opacity-90"
              style={{ backgroundColor: '#e65100' }}
            >
              All Products
            </Link>
            
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/collection/${category.slug}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-orange-500 dark:hover:text-orange-500 whitespace-nowrap"
              >
                {category.title}
              </Link>
            ))}

            {categories.length > 8 && (
              <Link
                href="/collection"
                className="px-4 py-2 text-sm font-medium text-gray-500 transition-all border border-gray-300 rounded-full hover:border-gray-400 dark:text-gray-400 dark:border-gray-600 dark:hover:border-gray-500 whitespace-nowrap"
              >
                +{categories.length - 8} more
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {products.length > 0 ? (
          <>
            {/* Product Count */}
            <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Showing {products.length} products
            </div>

            {/* Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full dark:bg-gray-800">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No products found yet
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Check back soon for new products!
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'All Products - Junooni',
  description: 'Browse all blank products available at Junooni. Shop from our complete collection of customizable merchandise.',
}