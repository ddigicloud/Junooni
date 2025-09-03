"use client"

import { useCallback, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"

type Collection = {
  value: string
  label: string
  count?: number  // ✅ NEW: Add count property
}

type CollectionFilterProps = {
  collections: Collection[]
  selectedCollections?: string  // Comma-separated string from URL
  setQueryParams: (name: string, value: string) => void
  collection?: HttpTypes.StoreProduct[]  // ✅ NEW: Add products for counting
  'data-testid'?: string
}

const CollectionFilter = ({ 
  collections = [],
  selectedCollections = "",
  setQueryParams,
  collection = [],  // ✅ NEW: Products array for counting
  'data-testid': dataTestId 
}: CollectionFilterProps) => {

  // Convert comma-separated string to array for easier handling
  const selectedArray = useMemo(() => {
    if (!selectedCollections) return []
    return selectedCollections.split(",").map(s => s.trim()).filter(Boolean)
  }, [selectedCollections])

  // ✅ NEW: Calculate product counts for each collection
  const collectionsWithCounts = useMemo(() => {
    //console.log('\n🏷️ CollectionFilter: Computing collection counts...')
    //console.log('- collections prop:', collections?.length)
    //console.log('- collection products:', collection?.length)

    // Filter out empty collections first
    const filtered = collections.filter(coll => coll.value !== "")
    
    // ✅ Count products for each collection
    const collectionCountMap = new Map<string, number>()

    if (Array.isArray(collection) && collection.length > 0) {
      //console.log('📊 Counting products for each collection...')
      
      collection.forEach((product, index) => {
        if (product.collection && product.collection.handle) {
          const collectionHandle = product.collection.handle
          collectionCountMap.set(collectionHandle, (collectionCountMap.get(collectionHandle) || 0) + 1)
          
          // Debug first few products
          if (index < 5) {
            //console.log(`  Product ${index + 1}: "${product.title}" -> Collection: "${collectionHandle}"`)
          }
        }
      })

      //console.log('📊 Collection count map:')
      collectionCountMap.forEach((count, handle) => {
        //console.log(`  - "${handle}": ${count} products`)
      })
    }

    // Convert to Collection format with counts
    const collectionsWithCounts: Collection[] = filtered.map(coll => {
      // ✅ CRITICAL: coll.value should be collection.handle for lookup
      const count = collectionCountMap.get(coll.value) || 0
      
      return {
        value: coll.value,  // collection.handle
        label: coll.label,  // collection.title
        count: count
      }
    })

    // Sort by count (descending) then by name
    const sortedCollections = collectionsWithCounts.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count // Higher count first
      }
      return a.label.localeCompare(b.label) // Alphabetical for same count
    })

    //console.log('🏷️ CollectionFilter: Final collections with counts:')
    sortedCollections.forEach((coll, index) => {
      //console.log(`  ${index + 1}. ${coll.label} (${coll.count} products) - value: "${coll.value}"`)
    })

    return sortedCollections
  }, [collections, collection])

  const handleCollectionChange = useCallback((collectionValue: string) => {
    // Handle "All Collections" (value="") - clear all filters
    if (collectionValue === "") {
      setQueryParams("collections", "")
      return
    }

    let newSelected: string[]

    if (selectedArray.includes(collectionValue)) {
      // Remove the collection if it's already selected
      newSelected = selectedArray.filter(val => val !== collectionValue)
    } else {
      // Add the collection if it's not selected
      newSelected = [...selectedArray, collectionValue]
    }

    // Convert back to comma-separated string for URL
    const newSelectedString = newSelected.join(",")
    setQueryParams("collections", newSelectedString)
  }, [selectedArray, setQueryParams])

  // Check if no specific collections are selected (showing all)
  const allSelected = selectedArray.length === 0

  if (!collectionsWithCounts || collectionsWithCounts.length === 0) {
    return null
  }

  //console.log('🔍 CollectionFilter Debug:')
  //console.log('- selectedCollections prop received:', selectedCollections)
  //console.log('- selectedCollections string:', selectedCollections)
  //console.log('- selectedArray after split:', selectedArray)
  //console.log('- allSelected calculated:', allSelected)
  //console.log('- collectionsWithCounts:', collectionsWithCounts)

  return (
    <div className="space-y-2" data-testid={dataTestId}>
      {collectionsWithCounts.map((coll) => {
        // Skip rendering "All Collections" option completely
        if (coll.value === "") {
          return null
        }

        // Handle individual collection options
        const isSelected = selectedArray.includes(coll.value)

        return (
          <label
            key={coll.value}
            className="flex items-center justify-between text-gray-600 hover:text-pink-500 py-1.4 group text-sm cursor-pointer"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                name={`collection-${coll.value}`}
                value={coll.value}
                checked={isSelected}
                onChange={() => handleCollectionChange(coll.value)}
                className="w-4 h-4 mr-3 border-gray-300 rounded"
                style={{ accentColor: isSelected ? '#e65100' : undefined }} // Custom color for checked state
              />
              <span className="text-black transition-colors">
                {coll.label}
              </span>
              <span className="ml-1 text-xs text-gray-500 ">
              ({coll.count})
            </span>
            </div>
          </label>
        )
      })}

      {/* Show selected count if multiple are selected */}
      {selectedArray.length > 0 && (
        <div className="pt-2 mt-2 text-xs text-gray-500 border-t border-gray-200">
          {selectedArray.length} collection{selectedArray.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  )
}

export default CollectionFilter