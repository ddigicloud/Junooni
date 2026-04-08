"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import ProductCard from "@/components/ui/ProductCard"
import type { Product } from "@/lib/types"

interface Props {
  products: Product[]
  handle: string
  brandPrimary: string
  isDark: boolean
  initialQuery: string
}

export default function SearchClient({ products, handle, brandPrimary, isDark, initialQuery }: Props) {
  const [query, setQuery] = useState(initialQuery)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()
    return products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.categories?.some(c => c.name.toLowerCase().includes(q)) ||
      p.collection?.title.toLowerCase().includes(q)
    )
  }, [query, products])

  const textColor = isDark ? "text-white" : "text-gray-900"
  const subText = isDark ? "text-white/50" : "text-gray-500"
  const inputBg = isDark
    ? "bg-white/10 border-white/20 text-white placeholder-white/40"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"

  return (
    <div>
      {/* Search input */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-6 ${textColor}`}>Search</h1>
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-white/40" : "text-gray-400"}`} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products, categories..."
            autoFocus
            className={`w-full pl-12 pr-12 py-4 rounded-2xl border text-base ${inputBg} focus:outline-none focus:ring-2 transition-all`}
            style={{ "--tw-ring-color": brandPrimary } as any}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-700"} transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {!query.trim() ? (
        <div className="py-16 text-center">
          <Search className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-white/20" : "text-gray-200"}`} />
          <p className={`text-base ${subText}`}>Start typing to search products</p>
        </div>
      ) : results.length === 0 ? (
        <div className="py-16 text-center">
          <p className={`text-lg font-medium mb-2 ${textColor}`}>No results for "{query}"</p>
          <p className={`text-sm ${subText}`}>Try a different search term</p>
        </div>
      ) : (
        <div>
          <p className={`text-sm mb-5 ${subText}`}>
            {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
            <span className={`font-medium ${textColor}`}>"{query}"</span>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                handle={handle}
                brandPrimary={brandPrimary}
                variant={isDark ? "dark" : "light"}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
