import React from 'react'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Studio Style Product Card Component
function CategoryProductCard({ product }: { product: any }) {
  const productName = product.name || product.title || 'Untitled Product'
  const productSlug = product.slug || ''
  
  // Get image from displayImages
  let imageUrl = null
  if (product.displayImages && product.displayImages.length > 0) {
    const displayImg = product.displayImages[0]
    imageUrl = displayImg.image?.sizes?.medium?.url 
      || displayImg.image?.sizes?.small?.url 
      || displayImg.image?.url
  }
  
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
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={productName}
              className="absolute inset-0 object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold" style={{ color: '#e65100' }}>
              {productName.charAt(0).toUpperCase()}
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
              {product.printT.map((tech: any, index: number) => (
                <span
                  key={tech.id || index}
                  className="px-2 py-1 text-xs font-medium rounded"
                  style={{ 
                    backgroundColor: index === 0 ? '#FFF4E6' : '#E3F2FD',
                    color: index === 0 ? '#E65100' : '#1976D2'
                  }}
                >
                  {tech.technologyName === 'dtf' ? 'Direct to Film' : 
                   tech.technologyName === 'sublimation' ? 'Direct to Garment' : 
                   tech.technologyName}
                </span>
              ))}
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
                    <div className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-gray-600 bg-gray-200 border-2 border-gray-300 rounded-full">
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
                <span className="text-sm text-gray-500">Price on request</span>
              )}
              <p className="text-xs text-gray-500">no minimum</p>
            </div>
            
            {product.status === 'active' && (
              <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
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
      depth: 1,
    })

    if (!categoryResult.docs[0]) {
      return null
    }

    const category = categoryResult.docs[0]

    console.log('=== CATEGORY DEBUG ===')
    console.log('Category ID:', category.id)
    console.log('Category Title:', category.title)

    // Get products directly from the category's products field
    // The category already has products attached to it
    let products = []
    
    // Re-fetch category with depth to get full product details
    const categoryWithProducts = await payload.find({
      collection: 'categories',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      depth: 3, // Increased depth to get full product details
    })

    if (categoryWithProducts.docs[0]?.products) {
      products = Array.isArray(categoryWithProducts.docs[0].products) 
        ? categoryWithProducts.docs[0].products 
        : []
    }

    console.log(`✅ Found ${products.length} products attached to category "${category.title}"`)

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
  // Await params before accessing properties
  const { slug } = await params
  const data = await getCategoryData(slug)

  if (!data) {
    notFound()
  }

  const { category, products } = data

  let description = ''
  if (typeof category.description === 'string') {
    description = category.description
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-4 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
              Home
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/collection" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
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
            {products.length} products available
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
            <p className="text-lg text-gray-600 dark:text-gray-300">
              No products found in this collection yet.
            </p>
            <Link
              href="/collection"
              className="inline-block px-6 py-3 mt-4 text-white transition-all rounded-lg"
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

// Note: Remove this function if you have a static metadata export in this file
// Generate metadata dynamically
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  // Await params before accessing properties
  const { slug } = await params
  const data = await getCategoryData(slug)
  
  if (!data) {
    return {
      title: 'Category Not Found - Junooni',
    }
  }

  return {
    title: `${data.category.title} - Junooni`,
    description: data.category.description || `Shop ${data.category.title} products at Junooni`,
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