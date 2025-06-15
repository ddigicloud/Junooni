"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Search, Clock, TrendingUp, ArrowRight, X } from "lucide-react"

export default function SearchBar({ categories }: { categories: any[] }) {
  const router = useRouter()
  const [showSearch, setShowSearch] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularSearches] = useState([
    "T-shirts", "Jeans", "Sneakers", "Dresses", "Jackets"
  ])
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading recent searches:', e)
      }
    }
  }, [])

  // Save search to recent searches
  const saveToRecentSearches = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    const updated = [
      searchQuery.trim(),
      ...recentSearches.filter(s => s.toLowerCase() !== searchQuery.toLowerCase())
    ].slice(0, 5) // Keep only 5 recent searches
    
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }, [recentSearches])

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }, [])

  // Fetch search suggestions
  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0) {
        setResults([])
        setIsLoading(false)
        return
      }

      if (query.trim().length < 2) {
        return // Don't search for single characters
      }

      setIsLoading(true)
      
      try {
        const res = await fetch("http://localhost:9000/store/products/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key":
              "pk_de22a6e19195388f210f847b142371b1bb3723cd97526e110fbe0bf5f44d9929",
          },
          body: JSON.stringify({ 
            query,
            limit: 5 // Only show 5 suggestions in dropdown
          }),
        })

        if (!res.ok) {
          console.error("API responded with error:", res.status)
          return
        }

        const data = await res.json()
        console.log("Received search suggestions:", data.hits)
        setResults(data.hits || [])
      } catch (err) {
        console.error("Search fetch error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(fetchResults, 300)
    return () => clearTimeout(debounce)
  }, [query])

  // Handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
      }
    }

    // Add event listener when dropdown is open
    if (showSearch) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSearch])

  // Focus input when dropdown opens
  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showSearch])

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    saveToRecentSearches(searchQuery)
    setShowSearch(false)
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  // Handle suggestion click
  const handleSuggestionClick = (searchTerm: string) => {
    setQuery(searchTerm)
    handleSearch(searchTerm)
  }

  // Handle product click
  const handleProductClick = (product: any) => {
    saveToRecentSearches(query)
    setShowSearch(false)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSearch(false)
    } else if (e.key === 'Enter') {
      handleSubmit(e as any)
    }
  }

  console.log("Current rendered results:", results)

  return (
    <div className="relative" ref={searchRef}>
      <button
        className="transition-colors duration-300 hover:text-[#e65100]"
        onClick={() => setShowSearch((prev) => !prev)}
        data-testid="nav-search-link"
      >
        <Search className="w-5 h-5 mt-1 md:h-6 md:w-6" />
      </button>

      {showSearch && (
        <div className="absolute left-1/2 transform -translate-x-1/2 sm:left-auto sm:right-0 sm:transform-none z-50 bg-white border border-gray-200 rounded-lg shadow-xl w-[calc(100vw-2rem)] max-w-80 top-8">
          {/* Search Input */}
          <form onSubmit={handleSubmit} className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          <div className="overflow-y-auto max-h-96">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#e65100]"></div>
                <span className="ml-2 text-sm text-gray-600">Searching...</span>
              </div>
            )}

            {/* Search Results */}
            {!isLoading && query && results.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Products
                </div>
                {results.map((hit: any) => {
                  const product = hit.document || hit
                  return (
                    <LocalizedClientLink
                      key={product.id}
                      href={`/products/${product.handle}`}
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-gray-50">
                        <div className="flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-100 rounded-lg">
                          {product.thumbnail && (
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="object-cover w-full h-full"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.title}
                          </p>
                          {product.price && (
                            <p className="text-sm text-[#e65100] font-semibold">
                              ${product.price}
                            </p>
                          )}
                        </div>
                      </div>
                    </LocalizedClientLink>
                  )
                })}
                
                {/* View All Results */}
                {query && (
                  <LocalizedClientLink href={`/search?q=${encodeURIComponent(query)}`}>
                    <div 
                      onClick={() => {
                        saveToRecentSearches(query)
                        setShowSearch(false)
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#e65100] hover:bg-gray-50 transition-colors duration-150 border-t border-gray-100"
                    >
                      <span>View all results for "{query}"</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </LocalizedClientLink>
                )}
              </div>
            )}

            {/* No Results */}
            {!isLoading && query && query.length >= 2 && results.length === 0 && (
              <div className="px-4 py-6 text-center">
                <p className="mb-2 text-sm text-gray-600">No products found for "{query}"</p>
                <button
                  onClick={() => handleSearch(query)}
                  className="text-sm text-[#e65100] hover:underline"
                >
                  Search anyway
                </button>
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="py-2">
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                      Recent
                    </span>
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full px-4 py-2 text-sm text-left text-gray-700 transition-colors duration-150 hover:bg-gray-50"
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {!query && (
              <div className="py-2 border-t border-gray-100">
                <div className="flex items-center gap-2 px-4 py-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Popular
                  </span>
                </div>
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full px-4 py-2 text-sm text-left text-gray-700 transition-colors duration-150 hover:bg-gray-50"
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}

            {/* Categories Quick Access */}
            {!query && categories && categories.length > 0 && (
              <div className="py-2 border-t border-gray-100">
                <div className="px-4 py-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Categories
                </div>
                {categories.slice(0, 4).map((category) => (
                  <LocalizedClientLink
                    key={category.id}
                    href={`/categories/${category.handle}`}
                    onClick={() => setShowSearch(false)}
                  >
                    <div className="px-4 py-2 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50">
                      {category.name}
                    </div>
                  </LocalizedClientLink>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}