import React from 'react'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProductImage from './ProductImage'

// Studio Style Product Card Component
function CategoryProductCard({ product }: { product: any }) {
  const productName = product.name || product.title || 'Untitled Product'
  const productSlug = product.slug || ''
  
  // OPTIMIZED: Get smallest available image first for faster loading
  const getOptimizedImageUrl = () => {
    if (product.displayImages && product.displayImages.length > 0) {
      const displayImg = product.displayImages[0]
      // Priority: thumbnail → small → medium → original
      return displayImg.image?.sizes?.thumbnail?.url 
        || displayImg.image?.sizes?.small?.url 
        || displayImg.image?.sizes?.medium?.url 
        || displayImg.image?.url
        || null
    }
    
    // Fallback to printT images
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
  const status = product.status
  const shouldShowStatus = status && status.toLowerCase() !== 'active'

  // Status badge styling
  const getStatusStyle = (status: string) => {
    return {
      background: '#e65100',
      shadow: '0 4px 12px rgba(230, 81, 0, 0.4)'
    }
  }

  const statusStyle = shouldShowStatus ? getStatusStyle(status) : null

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
          
          {/* Status Badge - for non-active products */}
          {shouldShowStatus && statusStyle && (
            <div className="absolute top-2 right-2 z-10">
              <div 
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white rounded-lg backdrop-blur-sm"
                style={{ 
                  background: statusStyle.background,
                  boxShadow: statusStyle.shadow
                }}
              >
                {status.toLowerCase() === 'coming_soon' ? 'Coming Soon' : 
                 status.toLowerCase() === 'out_of_stock' ? 'Out of Stock' : 
                 status.toLowerCase() === 'discontinued' ? 'Discontinued' : 
                 status}
              </div>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
            {productName}
          </h3>

          {/* Print Technology Tags */}
          {product.printT && product.printT.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {product.printT.map((tech: any, index: number) => {
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

// Fetch category and its products
async function getCategoryData(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Get category by slug
    const categoryResult = await payload.find({
      collection: 'categories',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      depth: 0,
    })

    if (!categoryResult.docs[0]) {
      return null
    }

    const category = categoryResult.docs[0]

    console.log('=== CATEGORY DEBUG ===')
    console.log('Category ID:', category.id)
    console.log('Category Title:', category.title)

    // Re-fetch category with optimized depth to get product details
    const categoryWithProducts = await payload.find({
      collection: 'categories',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      depth: 2, // Changed from 3 to 2 for better performance
    })

    let products = []
    if (categoryWithProducts.docs[0]?.products) {
      const allProducts = Array.isArray(categoryWithProducts.docs[0].products) 
        ? categoryWithProducts.docs[0].products 
        : []
      
      // FILTER OUT DRAFT PRODUCTS
      products = allProducts.filter(product => 
        product.status && product.status.toLowerCase() !== 'draft'
      )
    }

    console.log(`✅ Found ${products.length} active products in category "${category.title}"`)

    return {
      category,
      products,
    }
  } catch (error) {
    console.error('Error fetching category data:', error)
    return null
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getCategoryData(slug)

  if (!data) {
    notFound()
  }

  const { category, products } = data

  let description = ''
  if (typeof category.description === 'string') {
    description = category.description
  } else if (category.description?.root?.children?.[0]?.children?.[0]?.text) {
    description = category.description.root.children[0].children[0].text
  }

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
            <Link href="/collection" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              Collections
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white">{category.title}</span>
          </nav>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {category.title}
          </h1>
          {description && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
          )}
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {products.length} {products.length === 1 ? 'product' : 'products'} available
          </p>
        </div>
      </header>

      {/* Products Grid */}
      <main className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <CategoryProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full dark:bg-gray-800">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No products found in this collection yet
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Check back soon for new products!
            </p>
            <Link
              href="/collection"
              className="inline-flex items-center gap-2 px-6 py-3 text-white transition-all rounded-lg hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#e65100' }}
            >
              Browse All Collections
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

// Generate metadata dynamically
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getCategoryData(slug)
  
  if (!data) {
    return {
      title: 'Category Not Found - Junooni',
    }
  }

  let description = `Shop ${data.category.title} products at Junooni`
  if (typeof data.category.description === 'string') {
    description = data.category.description
  } else if (data.category.description?.root?.children?.[0]?.children?.[0]?.text) {
    description = data.category.description.root.children[0].children[0].text
  }

  return {
    title: `${data.category.title} - Junooni`,
    description,
  }
}

// Generate static params for all categories
export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
    })

    return categories.docs.map((category) => ({
      slug: category.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}