"use client"

import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Search } from "lucide-react"

export default function SearchBar({ categories }: { categories: any[] }) {
  const [showSearch, setShowSearch] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0) {
        setResults([])
        return
      }
  
      try {
        const res = await fetch("http://localhost:9000/store/products/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key":
              "pk_de22a6e19195388f210f847b142371b1bb3723cd97526e110fbe0bf5f44d9929",
          },
          body: JSON.stringify({ query }),
        })
  
        if (!res.ok) {
          console.error("API responded with error:", res.status)
          return
        }
  
        const data = await res.json()
        console.log("Received hits:", data.hits)
        setResults(data.hits || [])
      } catch (err) {
        console.error("Search fetch error:", err)
      }
    }
  
    const debounce = setTimeout(fetchResults, 300)
    return () => clearTimeout(debounce)
  }, [query])
  
  
  console.log("Current rendered results:", results)

  return (
    <div className="relative">
      <button
        className="transition-colors duration-300"
        onClick={() => setShowSearch((prev) => !prev)}
        data-testid="nav-search-link"
      >
        <Search className="w-5 h-5" />
      </button>

      {showSearch && (
        <div className="absolute right-0 z-50 w-64 p-3 bg-white border border-gray-300 rounded shadow-lg top-8">
        <input
          type="text"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#e65100]"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="mt-3 space-y-1 overflow-y-auto max-h-64">
          {results.map((product) => (
            <li
              key={product.id}
              className="text-sm rounded px-2 py-2 hover:bg-[#e65100] hover:text-white transition-colors duration-200"
            >
              <LocalizedClientLink href={`/products/${product.handle}`}>
                {product.title}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>
      
      )}
    </div>
  )
}
