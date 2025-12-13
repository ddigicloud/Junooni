'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Filter, Grid, List, X } from 'lucide-react'

interface ProductSearchResultsProps {
  initialProducts: any[]
  categories: any[]
  initialQuery: string
}

export default function ProductSearchResults({ 
  initialProducts, 
  categories,
  initialQuery 
}: ProductSearchResultsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return initialProducts
    }

    return initialProducts.filter((product) => {
      const productCategoryId = typeof product.category === 'object' 
        ? product.category?.id 
        : product.category
      return productCategoryId === selectedCategory
    })
  }, [initialProducts, selectedCategory])

  return (
    <div className="container">
      {initialProducts.length > 0 ? (
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
              </div>
              
              <div className="p-4">
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                    Categories
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-orange-50 text-orange-600 font-medium dark:bg-orange-900/30 dark:text-orange-400'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      All Results ({initialProducts.length})
                    </button>
                    {categories.map((category) => {
                      const productCount = initialProducts.filter((p) => {
                        const pCatId = typeof p.category === 'object' ? p.category?.id : p.category
                        return pCatId === category.id
                      }).length

                      if (productCount === 0) return null

                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-orange-50 text-orange-600 font-medium dark:bg-orange-900/30 dark:text-orange-400'
                              : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          <span>{category.title}</span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            ({productCount})
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Toggle & View Mode */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg lg:hidden hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'}
                  {initialQuery && ` for "${initialQuery}"`}
                </span>
                
                {/* View Mode Toggle */}
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg dark:bg-gray-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${
                      viewMode === 'grid'
                        ? 'bg-white text-orange-600 dark:bg-gray-800 dark:text-orange-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${
                      viewMode === 'list'
                        ? 'bg-white text-orange-600 dark:bg-gray-800 dark:text-orange-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="p-4 mb-6 bg-white border border-gray-200 lg:hidden rounded-xl dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('all')
                      setShowFilters(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-orange-50 text-orange-600 font-medium dark:bg-orange-900/30 dark:text-orange-400'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    All Results ({initialProducts.length})
                  </button>
                  {categories.map((category) => {
                    const productCount = initialProducts.filter((p) => {
                      const pCatId = typeof p.category === 'object' ? p.category?.id : p.category
                      return pCatId === category.id
                    }).length

                    if (productCount === 0) return null

                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id)
                          setShowFilters(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-orange-50 text-orange-600 font-medium dark:bg-orange-900/30 dark:text-orange-400'
                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span>{category.title}</span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          ({productCount})
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Products Grid/List */}
            {filteredProducts.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
                    : 'space-y-4'
                }
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  No products in this category
                </h3>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  Try selecting a different category
                </p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white transition-all rounded-lg hover:opacity-90"
                  style={{ backgroundColor: '#e65100' }}
                >
                  Show All Results
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            No results found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {initialQuery ? `No products found for "${initialQuery}"` : 'Try searching for something'}
          </p>
        </div>
      )}
    </div>
  )
}

// Product Card Component
function ProductCard({ product, viewMode }: { product: any; viewMode: 'grid' | 'list' }) {
  const productName = product.name || product.title || 'Untitled Product'
  const productSlug = product.slug || ''

  let imageUrl = null
  if (product.displayImages && product.displayImages.length > 0) {
    const displayImg = product.displayImages[0]
    imageUrl =
      displayImg.image?.sizes?.medium?.url ||
      displayImg.image?.sizes?.small?.url ||
      displayImg.image?.url
  }

  if (!imageUrl && product.printT && product.printT.length > 0) {
    const printTech = product.printT[0]
    if (printTech.custAreas && printTech.custAreas.length > 0) {
      const custArea = printTech.custAreas[0]
      if (custArea.designCanvasPhotos && custArea.designCanvasPhotos.length > 0) {
        const photo = custArea.designCanvasPhotos[0].photo
        imageUrl = photo?.url || photo?.sizes?.medium?.url || photo?.sizes?.small?.url
      }
    }
  }

  const suggestedPrice = product.pricing?.suggestedRetail || product.price
  const cost = product.cost
  const categoryName =
    typeof product.category === 'object' ? product.category?.title : 'Uncategorized'

  if (viewMode === 'list') {
    return (
      <Link
        href={`/products/${productSlug}`}
        className="flex gap-4 p-4 transition-all duration-300 bg-white border border-gray-200 group rounded-xl hover:shadow-lg dark:bg-gray-800 dark:border-gray-700"
      >
        <div className="relative flex-shrink-0 w-24 h-24 overflow-hidden bg-gray-100 rounded-lg sm:w-32 sm:h-32 dark:bg-gray-700">
          {imageUrl ? (
            <img src={imageUrl} alt={productName} className="object-cover w-full h-full" />
          ) : (
            <div
              className="flex items-center justify-center w-full h-full text-2xl font-bold"
              style={{ color: '#e65100' }}
            >
              {productName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <h3 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg dark:text-white line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400">
              {productName}
            </h3>
            <p className="mb-2 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
              {categoryName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {cost && (
              <>
                <span className="text-lg font-bold sm:text-xl" style={{ color: '#e65100' }}>
                  ₹{cost}
                </span>   
              </>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/products/${productSlug}`}
      className="overflow-hidden transition-all duration-300 transform bg-white border border-gray-200 group rounded-xl hover:shadow-xl hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="relative bg-gray-100 aspect-square dark:bg-gray-700">
        {imageUrl ? (
          <img src={imageUrl} alt={productName} className="object-cover w-full h-full" />
        ) : (
          <div
            className="flex items-center justify-center w-full h-full text-3xl font-bold"
            style={{ color: '#e65100' }}
          >
            {productName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{categoryName}</p>
        <h3 className="mb-2 text-sm font-bold text-gray-900 sm:text-base dark:text-white line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400">
          {productName}
        </h3>
        {cost && (
          <div className="flex items-center gap-2">
            <span className="text-base font-bold sm:text-lg" style={{ color: '#e65100' }}>
              ₹{cost}
            </span>
            
          </div>
        )}
      </div>
    </Link>
  )
}