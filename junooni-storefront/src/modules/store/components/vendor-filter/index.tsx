"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { ChevronDown, ChevronUp, Search, X } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import FilterCheckboxGroup from "@modules/store/components/filter-checkbox"

// ✅ ENHANCED: Add count to vendor option type
type VendorOption = {
  value: string
  label: string
  count: number // ✅ NEW: Add count property
}

// ✅ ENHANCED: Update checkbox component to show count
const VendorCheckbox = ({ vendor, isSelected, onToggle, context, stableId }: {
  vendor: VendorOption
  isSelected: boolean
  onToggle: (vendorValue: string, vendorLabel: string) => void
  context: string
  stableId: string
}) => {
  const checkboxId = `checkbox_${stableId}`
  
  return (
    <label className="flex items-center p-0 transition-colors duration-150 rounded cursor-pointer group hover:bg-gray-50" htmlFor={checkboxId}>
      <input
        id={checkboxId}
        type="checkbox"
        data-vendor-id={vendor.value}
        data-vendor-context={context}
        data-stable-id={stableId}
        checked={isSelected}
        onChange={() => onToggle(vendor.value, vendor.label)}
        className="mr-2 border-gray-300 rounded cursor-pointer"
        style={{
          accentColor: "#e65100",
          width: "16px",
          height: "16px"
        }}
      />
      {/* ✅ ENHANCED: Display vendor name with count (like ColorFilter) */}
      <div className="flex-grow min-w-0">
        <span className="text-sm font-small text-black-900">
          {vendor.label}
        </span>
        <span className="ml-1 text-sm text-gray-500">
          ({vendor.count.toLocaleString()})
        </span>
      </div>
    </label>
  )
}

// Generate stable ID for vendor
const generateVendorId = (vendor: VendorOption, context: string, index: number): string => {
  const cleanValue = (vendor.value || `unknown_${index}`).replace(/[^a-zA-Z0-9]/g, '_')
  const cleanContext = context.replace(/[^a-zA-Z0-9]/g, '_')
  return `vendor_${cleanContext}_${index}_${cleanValue}`
}

type VendorFilterProps = {
  vendors: { value: string; label: string }[] // ✅ Keep original prop format
  selectedVendors: string[]
  collection?: HttpTypes.StoreProduct[] // ✅ NEW: Products for counting
  setQueryParams: (name: string, value: string) => void
  "data-testid"?: string
  initialLimit?: number
  showAllOption?: boolean
  onVendorChange?: (selectedVendors: string[]) => void
}

const VendorFilter = ({
  vendors,
  selectedVendors,
  collection = [], // ✅ NEW: Default empty array
  setQueryParams,
  "data-testid": dataTestId,
  initialLimit = 10,
  showAllOption = true,
  onVendorChange
}: VendorFilterProps) => {
  // Internal state for instant UI updates
  const [internalSelectedVendors, setInternalSelectedVendors] = useState<string[]>([])
  const [showAll, setShowAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("")
  const lastNotifiedState = useRef<string>("")
  const isInternalUpdate = useRef(false)
  
  // ✅ CRITICAL FIX: Always sync internal state with props changes
  useEffect(() => {
    // Skip sync if this change came from our own internal update
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }
    
    //console.log("🔄 Syncing internal vendor state with props:", selectedVendors)
    const cleanVendors = selectedVendors.filter(v => v !== "")
    
    // Only update if the values are actually different
    const currentInternalString = internalSelectedVendors.join(',')
    const newPropsString = cleanVendors.join(',')
    
    if (currentInternalString !== newPropsString) {
      //console.log("📝 Internal state updating from:", currentInternalString, "to:", newPropsString)
      setInternalSelectedVendors(cleanVendors)
      lastNotifiedState.current = newPropsString
    }
  }, [selectedVendors]) // ✅ Remove initRef guard - sync on every prop change

  // Simplified parent notification
  const notifyParent = useCallback((newVendors: string[]) => {
    const vendorParam = newVendors.join(',')
    
    // Skip if already notified about this exact state
    if (lastNotifiedState.current === vendorParam) {
      return
    }
    
    //console.log("📡 Notifying parent of vendor change:", vendorParam)
    lastNotifiedState.current = vendorParam
    
    // Mark that this is an internal update to prevent sync loop
    isInternalUpdate.current = true
    
    // Update query params
    setQueryParams("vendors", vendorParam)
    
    // Call callback if provided
    if (onVendorChange) {
      onVendorChange(newVendors)
    }
    
  }, [setQueryParams, onVendorChange])

  // Clean selected vendors - use internal state
  const cleanSelectedVendors = useMemo(() => {
    return Array.from(new Set(internalSelectedVendors.filter(v => v !== "")))
  }, [internalSelectedVendors])

  // ✅ ENHANCED: Process vendor options WITH COUNTS (like ColorFilter)
  const vendorOptions = useMemo(() => {
    // console.log('\n🏪 VendorFilter: Computing vendor options with counts...')
    // console.log('- vendors prop:', vendors?.length)
    // console.log('- collection length:', collection?.length)

    // Filter out empty vendors first
     const filtered = vendors.filter(vendor => !!vendor.value?.trim() && !!vendor.label?.trim())
    
    // Count products for each vendor
    const vendorCountMap = new Map<string, number>()

    if (Array.isArray(collection) && collection.length > 0) {
      //console.log('📊 Counting products for each vendor...')
      
      collection.forEach((product, index) => {
        if (product.vendor && product.vendor.name) {
          const vendorName = product.vendor.name
          vendorCountMap.set(vendorName, (vendorCountMap.get(vendorName) || 0) + 1)
        }
      })

      //console.log('📊 Vendor count map:')
      vendorCountMap.forEach((count, handle) => {
        //console.log(`  - ${handle}: ${count} products`)
      })
    }

    // Convert to VendorOption format with counts
    const optionsWithCounts: VendorOption[] = filtered.map(vendor => {
      const count = vendorCountMap.get(vendor.value) || 0
      
      return {
        value: vendor.value,
        label: vendor.label,
        count: count
      }
    })

    // Sort by count (descending) then by name
    const sortedOptions = optionsWithCounts.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count // Higher count first
      }
      return a.label.localeCompare(b.label) // Alphabetical for same count
    })

    //console.log('🏪 VendorFilter: Final vendor options with counts:')
    sortedOptions.forEach((option, index) => {
      //console.log(`  ${index + 1}. ${option.label} (${option.count} products)`)
    })

    return sortedOptions
  }, [vendors, collection])
  
  const hasAllOption = vendors.find(vendor => vendor.value === "")
  
  // Determine displayed vendors
  const displayedVendors = useMemo(() => {
    return showAll ? vendorOptions : vendorOptions.slice(0, initialLimit)
  }, [vendorOptions, showAll, initialLimit])
  
  const hasMore = vendorOptions.length > initialLimit

  // Search and filter logic
  const filteredVendors = useMemo(() => {
    if (!searchTerm) return vendorOptions
    return vendorOptions.filter(vendor => 
      vendor.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [vendorOptions, searchTerm])

  // Group vendors alphabetically
  const groupedVendors = useMemo(() => {
    const groups: { [key: string]: typeof vendorOptions } = {}
    
    const allKeys = ["#", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
    allKeys.forEach(key => {
      groups[key] = []
    })
    
    vendorOptions.forEach(vendor => {
      const cleanName = (vendor.label || "").trim()
      if (!cleanName) return
      
      const firstChar = cleanName.charAt(0).toUpperCase()
      const key = /^[A-Z]$/.test(firstChar) ? firstChar : "#"
      groups[key].push(vendor)
    })
    
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => (a.label || "").trim().localeCompare((b.label || "").trim()))
    })
    
    return groups
  }, [vendorOptions])

  const availableTabs = useMemo(() => {
    const allTabs = ["#", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
    return allTabs.filter(tab => groupedVendors[tab]?.length > 0)
  }, [groupedVendors])

  const effectiveActiveTab = useMemo(() => {
    if (activeTab === "") return ""
    if (availableTabs.includes(activeTab)) return activeTab
    return availableTabs[0] || "#"
  }, [activeTab, availableTabs])

  const activeTabVendors = useMemo(() => {
    if (searchTerm) {
      return filteredVendors
    } else if (effectiveActiveTab === "") {
      return vendorOptions
    } else {
      return groupedVendors[effectiveActiveTab] || []
    }
  }, [groupedVendors, effectiveActiveTab, searchTerm, filteredVendors, vendorOptions])

  // ✅ SIMPLIFIED: Clean toggle function
  const handleVendorToggle = useCallback((vendorValue: string, vendorLabel: string) => {
    //console.log(`🔄 TOGGLE: ${vendorLabel} (${vendorValue})`)
    //console.log(`📋 Current selected:`, cleanSelectedVendors)
    
    let newValues: string[]
    if (cleanSelectedVendors.includes(vendorValue)) {
      //console.log(`❌ Removing ${vendorValue}`)
      newValues = cleanSelectedVendors.filter(v => v !== vendorValue)
    } else {
      //console.log(`✅ Adding ${vendorValue}`)
      newValues = [...cleanSelectedVendors, vendorValue]
    }
    
    //console.log(`✅ New selected:`, newValues)
    
    // Update internal state immediately for responsive UI
    setInternalSelectedVendors(newValues)
    
    // Notify parent
    notifyParent(newValues)
    
  }, [cleanSelectedVendors, notifyParent])

  const handleSelectAll = useCallback(() => {
    const allVendorValues = vendorOptions.map(vendor => vendor.value)
    setInternalSelectedVendors(allVendorValues)
    notifyParent(allVendorValues)
  }, [vendorOptions, notifyParent])

  const handleClearAll = useCallback(() => {
    setInternalSelectedVendors([])
    notifyParent([])
  }, [notifyParent])

  // ✅ ENHANCED: Update FilterCheckboxGroup to handle counts (if needed for simple cases)
  const needsCustomRendering = hasMore || (showAllOption && hasAllOption) || vendorOptions.length > initialLimit

  // Only render if there are vendor options available
  if (vendorOptions.length === 0) {
    //console.log('❌ VendorFilter: No vendor options available')
    return null
  }

  //console.log('✅ VendorFilter: Rendering with', vendorOptions.length, 'vendors')

  if (!needsCustomRendering) {
    // Convert back to simple format for FilterCheckboxGroup
    const simpleVendors = vendorOptions.map(vendor => ({
      value: vendor.value,
      label: `${vendor.label} (${vendor.count.toLocaleString()})`
    }))

    return (
      <FilterCheckboxGroup
        title="Vendors"
        items={simpleVendors}
        values={cleanSelectedVendors}
        handleChange={(values: string[]) => {
          setInternalSelectedVendors(values)
          notifyParent(values)
        }}
        data-testid={dataTestId}
      />
    )
  }

  return (
    <div data-testid={dataTestId}>
      {/* Control buttons */}
      {vendorOptions.length > 0 && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-black-600">
            {cleanSelectedVendors.length > 0 ? `${cleanSelectedVendors.length} selected` : "Select creators"}
          </span>
          {cleanSelectedVendors.length > 0 && (
            <div className="flex gap-2 text-xs">
              <button
                onClick={handleSelectAll}
                className="text-[#e65100] hover:underline"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={handleClearAll}
                className="text-red-600 hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Initial vendors list */}
      <div className="space-y-2 overflow-y-auto max-h-66">
        {displayedVendors.map((vendor, index) => {
          const stableKey = `initial_${index}_${vendor.value}`
          const stableId = generateVendorId(vendor, 'initial', index)
          
          return (
            <div key={stableKey}>
              <VendorCheckbox
                vendor={vendor}
                isSelected={cleanSelectedVendors.includes(vendor.value)}
                onToggle={handleVendorToggle}
                context={`initial_${index}`}
                stableId={stableId}
              />
            </div>
          )
        })}
      </div>

      {/* Load more button */}
      {hasMore && !showAll && (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            setShowAll(true)
          }}
          className="mt-3 w-1/2 flex items-center justify-center px-1 py-2 rounded-md text-sm font-medium text-[#e65100] bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e65100] transition-colors cursor-pointer no-underline mr-2"
        >
           ({vendorOptions.length - initialLimit} more)
          <ChevronDown className="w-4 h-4 ml-1" />
        </a>
      )}

      {/* Show less button */}
      {showAll && hasMore && (
        <button
          onClick={() => {
            setShowAll(false)
            setSearchTerm("")
            setActiveTab("#")
          }}
          className="mt-3 w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e65100] transition-colors"
        >
          Show less
          <ChevronUp className="w-4 h-4 ml-1" />
        </button>
      )}

      {/* Advanced Expanded View */}
      {showAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black bg-opacity-50 mt-14">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[82vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="text-lg font-semibold">Select Creators</h3>
              <button
                onClick={() => {
                  setShowAll(false)
                  setSearchTerm("")
                  setActiveTab("")
                }}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search Brand"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                />
              </div>
            </div>

            {/* Alphabetical Tabs */}
            <div className="px-4 py-2 border-b bg-gray-50">
              <div className="flex flex-wrap gap-1">
                {["#", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"].map((letter) => (
                  <button
                    key={letter}
                    onClick={() => {
                      setActiveTab(letter)
                      setSearchTerm("")
                    }}
                    disabled={!availableTabs.includes(letter)}
                    className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
                      effectiveActiveTab === letter && !searchTerm
                        ? "bg-[#e65100] text-white"
                        : availableTabs.includes(letter)
                        ? "text-gray-700 hover:bg-gray-200"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {letter}
                  </button>
                ))}
                {effectiveActiveTab !== "" && (
                  <button
                    onClick={() => {
                      setActiveTab("")
                      setSearchTerm("")
                    }}
                    className="px-2 py-1 ml-2 text-sm font-medium text-gray-500 transition-colors rounded hover:bg-gray-200"
                  >
                    Show All
                  </button>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-3 overflow-auto">
              {searchTerm ? (
                /* Search Results */
                <div>
                  <div className="mb-4 text-sm text-gray-600">
                    {filteredVendors.length} creators found for "{searchTerm}"
                  </div>
                  <div className="space-y-6">
                    {Object.entries(groupedVendors)
                      .filter(([letter, vendors]) => {
                        return vendors.some(vendor => 
                          vendor.label.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                      })
                      .sort(([a], [b]) => {
                        if (a === "#") return -1
                        if (b === "#") return 1
                        return a.localeCompare(b)
                      })
                      .map(([letter, vendors]) => {
                        const searchFilteredVendors = vendors.filter(vendor => 
                          vendor.label.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        
                        return (
                          <div key={`search-group-${letter}`}>
                            <h4 className="pb-1 mb-3 text-lg font-semibold text-gray-900 border-b">
                              {letter}
                            </h4>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                              {searchFilteredVendors.map((vendor, index) => {
                                const stableKey = `search_${letter}_${index}_${vendor.value}`
                                const stableId = generateVendorId(vendor, `search_${letter}`, index)
                                return (
                                  <div key={stableKey}>
                                    <VendorCheckbox
                                      vendor={vendor}
                                      isSelected={cleanSelectedVendors.includes(vendor.value)}
                                      onToggle={handleVendorToggle}
                                      context={`search_${letter}_${index}`}
                                      stableId={stableId}
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              ) : effectiveActiveTab === "" ? (
                /* Show All Vendors */
                <div>
                  <div className="mb-2">
                    <div className="text-base text-black-600">
                      {activeTabVendors.length} creator{activeTabVendors.length !== 1 ? 's' : ''} total
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {activeTabVendors.map((vendor, index) => {
                      const stableKey = `expanded_all_${index}_${vendor.value}`
                      const stableId = generateVendorId(vendor, 'expanded_all', index)
                      return (
                        <div key={stableKey}>
                          <VendorCheckbox
                            vendor={vendor}
                            isSelected={cleanSelectedVendors.includes(vendor.value)}
                            onToggle={handleVendorToggle}
                            context={`expanded_all_${index}`}
                            stableId={stableId}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                /* Alphabetical View */
                <div>
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {effectiveActiveTab === "#" ? "Numbers & Symbols" : `Creators starting with "${effectiveActiveTab}"`}
                    </h4>
                    <div className="mt-1 text-sm text-gray-600">
                      {activeTabVendors.length} creator{activeTabVendors.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {activeTabVendors.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {activeTabVendors.map((vendor, index) => {
                        const stableKey = `expanded_tab_${effectiveActiveTab}_${index}_${vendor.value}`
                        const stableId = generateVendorId(vendor, `expanded_tab_${effectiveActiveTab}`, index)
                        return (
                          <div key={stableKey}>
                            <VendorCheckbox
                              vendor={vendor}
                              isSelected={cleanSelectedVendors.includes(vendor.value)}
                              onToggle={handleVendorToggle}
                              context={`expanded_tab_${effectiveActiveTab}_${index}`}
                              stableId={stableId}
                            />
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      No creators found for "{effectiveActiveTab}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-3 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                {cleanSelectedVendors.length} creator{cleanSelectedVendors.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 text-sm font-medium text-[#e65100] hover:bg-orange-50 rounded-md transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 text-sm font-medium text-red-600 transition-colors rounded-md hover:bg-red-50"
                >
                  Clear All
                </button>
                <button
                  onClick={() => {
                    setShowAll(false)
                    setSearchTerm("")
                    setActiveTab("")
                  }}
                  className="px-4 py-2 text-sm font-medium bg-[#e65100] text-white rounded-md hover:bg-[#d84315] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW: Selected vendors summary (for debugging) */}
      {/* {cleanSelectedVendors.length > 0 && process.env.NODE_ENV === 'development' && (
        <div className="p-2 mt-2 text-xs text-gray-500 rounded bg-gray-50">
          <strong>Selected:</strong> {cleanSelectedVendors.join(', ')}
        </div>
      )} */}
    </div>
  )
}

export default VendorFilter