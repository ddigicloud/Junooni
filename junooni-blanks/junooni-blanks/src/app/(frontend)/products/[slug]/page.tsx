import React from 'react'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Fetch product by slug
async function getProductData(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    
    const result = await payload.find({
      collection: 'blank-products',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      depth: 3,
    })

    if (!result.docs[0]) {
      return null
    }

    return result.docs[0]
  } catch (error) {
    //console.error('Error fetching product:', error)
    return null
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductData(params.slug)

  if (!product) {
    notFound()
  }

  const productName = product.name || product.title || 'Untitled Product'
  const suggestedPrice = product.pricing?.suggestedRetail || product.price
  const cost = product.cost
  const colorOptions = product.colorOptions || []
  const sizeOptions = product.sizeOptions || []

  // Get all display images
  const displayImages = product.displayImages || []

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Breadcrumb */}
      <nav className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link href="/products" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            Products
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white">{productName}</span>
        </div>
      </nav>

      {/* Product Content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            {displayImages.length > 0 && displayImages[0]?.image ? (
              <div className="relative w-full overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-2xl" style={{ paddingBottom: '125%' }}>
                <img
                  src={displayImages[0].image.sizes?.large?.url || displayImages[0].image.url}
                  alt={productName}
                  className="absolute inset-0 object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="relative w-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl" style={{ paddingBottom: '125%' }}>
                <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold" style={{ color: '#e65100' }}>
                  {productName.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            {/* Thumbnail Gallery */}
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {displayImages.map((img: any, index: number) => (
                  <div
                    key={img.id || index}
                    className="relative overflow-hidden bg-gray-100 border-2 border-gray-200 cursor-pointer aspect-square dark:bg-gray-800 dark:border-gray-700 rounded-lg hover:border-orange-500"
                  >
                    {img.image?.url && (
                      <img
                        src={img.image.sizes?.thumbnail?.url || img.image.url}
                        alt={`${productName} view ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand & SKU */}
            <div className="flex items-center gap-4">
              {product.brand && (
                <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-gray-300">
                  {product.brand}
                </span>
              )}
              {product.status === 'active' && (
                <span className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-green-700 bg-green-50 rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  In Stock
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
              {productName}
            </h1>

            {/* SKU */}
            {product.sku && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                SKU: {product.sku}
              </p>
            )}

            {/* Price */}
            <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
              {cost ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ₹{cost}
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-gray-900 dark:text-white">Price on request</span>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No minimum order quantity</p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
                <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
              </div>
            )}

            {/* Print Technologies */}
            {product.printT && product.printT.length > 0 && (
              <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Print Technologies</h3>
                <div className="flex flex-wrap gap-3">
                  {product.printT.map((tech: any, index: number) => (
                    <span
                      key={tech.id || index}
                      className="px-4 py-2 text-sm font-medium rounded-lg"
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
              </div>
            )}

            {/* Colors */}
            {colorOptions.length > 0 && (
              <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Available Colors ({colorOptions.length})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map((color: any, index: number) => (
                    <div
                      key={color.id || index}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-12 h-12 border-2 border-gray-300 rounded-full dark:border-gray-600"
                        style={{ backgroundColor: color.colorHex || '#cccccc' }}
                        title={color.colorName}
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {color.colorName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {sizeOptions.length > 0 && (
              <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Available Sizes ({sizeOptions.length})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {sizeOptions.map((size: any, index: number) => (
                    <div
                      key={size.id || index}
                      className="px-4 py-2 text-sm font-medium text-gray-700 border-2 border-gray-300 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                      title={size.sizeDescription}
                    >
                      {size.sizeName}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Material Info */}
            {product.materials?.primary && (
              <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Material</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Primary Material:</span> {product.materials.primary}
                  </p>
                  {product.materials.weight && (
                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Weight:</span> {product.materials.weight}g
                    </p>
                  )}
                  {product.materials.finish && (
                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Finish:</span> {product.materials.finish}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="https://www.studio.junooni.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-8 py-4 text-center text-lg font-semibold text-white transition-all rounded-xl"
                style={{ backgroundColor: '#e65100' }}
              >
                Customize This Product
              </a>
              {/* <a
                href="https://www.junooni.com/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-8 py-4 text-center text-lg font-semibold text-gray-900 transition-all border-2 border-gray-300 rounded-xl hover:border-gray-400 dark:text-white dark:border-gray-600"
              >
                Request Quote
              </a> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Generate metadata
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductData(params.slug)
  
  if (!product) {
    return {
      title: 'Product Not Found - Junooni',
    }
  }

  const productName = product.name || product.title || 'Product'

  return {
    title: `${productName} - Junooni`,
    description: product.description || `Shop ${productName} at Junooni. Customize and order high-quality blank merchandise.`,
  }
}

// Generate static params for all products
export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const products = await payload.find({
      collection: 'blank-products',
      limit: 100,
    })

    return products.docs.map((product) => ({
      slug: product.slug,
    }))
  } catch (error) {
    //console.error('Error generating static params:', error)
    return []
  }
}