"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

type SimpleTestProductsProps = {
  order: HttpTypes.StoreOrder
  countryCode?: string
}

export default function SimpleTestProducts({
  order,
  countryCode,
}: SimpleTestProductsProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      console.log('=== SimpleTestProducts Client Component ===')
      console.log('Order ID:', order?.id)
      
      try {
        setLoading(true)
        setError(null)
        
        // Call your API endpoint instead of server functions
        const response = await fetch('/api/products/related', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.id,
            countryCode: countryCode || 'in',
            limit: 4,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('SimpleTestProducts - API response:', data)
        
        setProducts(data.products || [])
      } catch (err) {
        console.error('SimpleTestProducts - Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (order?.id) {
      fetchProducts()
    }
  }, [order.id, countryCode])

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4 w-48"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded">
        <h2 className="text-red-800 font-bold">Error Loading Products</h2>
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-red-500 mt-2">
          Make sure you have an API endpoint at /api/products/related
        </p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <h2 className="text-gray-600">No products found</h2>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">
        Related Products ({products.length} found)
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <div key={product.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
            {product.thumbnail && (
              <img 
                src={product.thumbnail} 
                alt={product.title}
                className="w-full h-32 object-cover rounded mb-2"
              />
            )}
            <h3 className="font-medium text-sm truncate">{product.title}</h3>
            <p className="text-xs text-gray-600 truncate">ID: {product.id}</p>
            {product.variants?.[0]?.prices?.[0] && (
              <p className="text-sm font-semibold text-green-600">
                ₹{(product.variants[0].prices[0].amount / 100).toFixed(2)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}