import React from 'react'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

// Fetch all categories
async function getAllCategories() {
  try {
    const payload = await getPayload({ config: configPromise })
    
    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
      depth: 1,
      sort: 'title',
    })

    // Get product count for each category
    const categoriesWithCount = await Promise.all(
      categories.docs.map(async (category) => {
        try {
          const products = await payload.find({
            collection: 'blank-products',
            where: {
              category: {
                equals: category.id,
              },
            },
            limit: 0,
          })

          return {
            ...category,
            productCount: products.totalDocs,
          }
        } catch {
          return {
            ...category,
            productCount: 0,
          }
        }
      })
    )

    return categoriesWithCount
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function CollectionsPage() {
  const categories = await getAllCategories()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            All Collections
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Browse through our {categories.length} product collections
          </p>
        </div>
      </header>

      {/* Collections Grid */}
      <main className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/collection/${category.slug}`}
              className="group relative overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 rounded-2xl hover:shadow-xl hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative aspect-square bg-gradient-to-br from-orange-100 to-orange-200 dark:from-gray-700 dark:to-gray-600">
                {category.heroImage?.url ? (
                  <img
                    src={category.heroImage.url}
                    alt={category.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-6xl font-bold" style={{ color: '#e65100' }}>
                    {category.title.charAt(0)}
                  </div>
                )}
                
                {/* Product Count Badge */}
                {category.productCount > 0 && (
                  <div className="absolute px-3 py-1 text-sm font-semibold text-white rounded-lg top-3 right-3 bg-black/60 backdrop-blur-sm">
                    {category.productCount} products
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#e65100] transition-colors">
                  {category.title}
                </h2>
                {category.description && typeof category.description === 'string' && (
                    <p>{category.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'All Collections - Junooni',
  description: 'Browse all product collections at Junooni',
}