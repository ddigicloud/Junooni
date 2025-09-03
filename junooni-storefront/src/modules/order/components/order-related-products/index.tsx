// import { listProducts } from "@lib/data/products"
// import { getRegion } from "@lib/data/regions"
// import { HttpTypes } from "@medusajs/types"
// import Product from "@modules/products/components/product-preview"

// type OrderRelatedProductsProps = {
//   order: HttpTypes.StoreOrder
//   countryCode: string
// }

// export default async function OrderRelatedProducts({
//   order,
//   countryCode,
// }: OrderRelatedProductsProps) {
//   const region = await getRegion(countryCode)

//   if (!region) {
//     return null
//   }

//   // Extract unique collection IDs and tag IDs from ordered items
//   const collectionIds = new Set<string>()
//   const tagIds = new Set<string>()
//   const orderedProductIds = new Set<string>()

//   order.items?.forEach((item) => {
//     if (item.product?.id) {
//       orderedProductIds.add(item.product.id)
//     }
//     if (item.product?.collection_id) {
//       collectionIds.add(item.product.collection_id)
//     }
//     if (item.product?.tags) {
//       item.product.tags.forEach((tag) => {
//         if (tag.id) {
//           tagIds.add(tag.id)
//         }
//       })
//     }
//   })

//   // Build query params for related products
//   const queryParams: HttpTypes.StoreProductParams = {}
//   if (region?.id) {
//     queryParams.region_id = region.id
//   }

//   // Try to find products from same collections first
//   if (collectionIds.size > 0) {
//     queryParams.collection_id = Array.from(collectionIds)
//   }

//   // If we have tags, include them
//   if (tagIds.size > 0) {
//     queryParams.tag_id = Array.from(tagIds)
//   }

//   queryParams.is_giftcard = false
//   queryParams.limit = 8 // Get more products to have options after filtering

//   const products = await listProducts({
//     queryParams,
//     countryCode,
//   }).then(({ response }) => {
//     return response.products.filter(
//       (responseProduct) => !orderedProductIds.has(responseProduct.id)
//     )
//   })

//   // If no products found with collections/tags, fallback to general recommendations
//   let fallbackProducts: HttpTypes.StoreProduct[] = []
//   if (products.length === 0) {
//     const fallbackQueryParams: HttpTypes.StoreProductParams = {
//       region_id: region.id,
//       is_giftcard: false,
//       limit: 4,
//     }

//     fallbackProducts = await listProducts({
//       queryParams: fallbackQueryParams,
//       countryCode,
//     }).then(({ response }) => {
//       return response.products.filter(
//         (responseProduct) => !orderedProductIds.has(responseProduct.id)
//       )
//     })
//   }

//   const finalProducts = products.length > 0 ? products.slice(0, 4) : fallbackProducts.slice(0, 4)

//   if (!finalProducts.length) {
//     return null
//   }

//   return (
//     <div className="product-page-constraint">
//       <div className="flex flex-col items-center text-center mb-16">
//         <span className="text-base-regular text-gray-600 mb-6">
//           You might also like
//         </span>
//         <p className="text-2xl-regular text-ui-fg-base max-w-lg">
//           Based on your recent order, here are some products you might enjoy.
//         </p>
//       </div>

//       <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
//         {finalProducts.map((product) => (
//           <li key={product.id}>
//             <Product region={region} product={product} />
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
// }


"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import Product from "@modules/products/components/product-preview"

type OrderRelatedProductsProps = {
  order: HttpTypes.StoreOrder
  countryCode?: string
}

export default function OrderRelatedProducts({
  order,
  countryCode,
}: OrderRelatedProductsProps) {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [region, setRegion] = useState<HttpTypes.StoreRegion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      
      try {
        setLoading(true)
        setError(null)
        
        // Extract collections and tags from ordered items for better recommendations
        const collectionIds = new Set<string>()
        const tagIds = new Set<string>()
        
        order.items?.forEach((item) => {
          if (item.product?.collection_id) {
            collectionIds.add(item.product.collection_id)
          }
          if (item.product?.tags) {
            item.product.tags.forEach((tag) => {
              if (tag.id) {
                tagIds.add(tag.id)
              }
            })
          }
        })

        // Call your API endpoint
        const response = await fetch('/api/products/related', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.id,
            countryCode: countryCode || 'in',
            limit: 4,
            collectionIds: Array.from(collectionIds),
            tagIds: Array.from(tagIds),
            excludeProductIds: order.items?.map(item => item.product?.id).filter(Boolean) || [],
          }),
        })

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        
        if (data.success) {
          setProducts(data.products || [])
          setRegion(data.regionData || null)
        } else {
          throw new Error(data.error || 'Failed to fetch products')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (order?.id) {
      fetchRelatedProducts()
    }
  }, [order.id, countryCode])

  // Loading state
  if (loading) {
    return (
      <div className="product-page-constraint">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="w-32 h-6 animate-pulse bg-gray-200 rounded mb-6"></div>
          <div className="w-96 h-10 animate-pulse bg-gray-200 rounded"></div>
        </div>
        
        <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
          {[1, 2, 3, 4].map((index) => (
            <li key={index}>
              <div className="animate-pulse">
                <div className="w-full aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // Error state
  if (error) {
    // Don't show error to users in production, just hide the section
    return null
  }

  // No products state
  if (!products.length) {
    return null
  }

  // Success state - render products using the existing Product component
  return (
    <div className="product-page-constraint">
      <div className="flex flex-col items-center text-center mb-16">
        <span className="text-base-regular text-gray-600 mb-6">
          You might also like
        </span>
        <p className="text-xl-regular text-ui-fg-base max-w-lg">
          Based on your recent order, here are some products you might enjoy.
        </p>
      </div>

      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
        {products.map((product) => (
          <li key={product.id}>
            <Product 
              region={region} 
              product={product} 
            />
          </li>
        ))}
      </ul>
    </div>
  )
}