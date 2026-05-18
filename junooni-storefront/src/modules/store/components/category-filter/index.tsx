// "use client"

// import { useCallback, useMemo } from "react"
// import { Heading } from "@medusajs/ui"
// import { HttpTypes } from "@medusajs/types"

// type CategoryOption = {
//   value: string
//   label: string
//   count: number
// }

// type CategoryFilterProps = {
//   categories: { value: string; label: string }[]
//   categoryId: string // Keep original prop name for compatibility
//   collection?: HttpTypes.StoreProduct[] // ✅ ADD: Products for counting
//   setQueryParams: (name: string, value: string) => void // Keep original signature
//   'data-testid'?: string
// }

// const CategoryFilter = ({
//   categories,
//   categoryId,
//   collection = [], // ✅ ADD: Default empty array
//   setQueryParams,
//   'data-testid': dataTestId,
// }: CategoryFilterProps) => {
//   // Parse comma-separated string into array for multiple selections
//   const selectedCategories = useMemo(() => {
//     if (!categoryId) return []
//     return typeof categoryId === 'string' 
//       ? categoryId.split(',').filter(Boolean) 
//       : []
//   }, [categoryId])

//   // ✅ ENHANCED: Calculate category options with product counts
//   const categoryOptionsWithCounts = useMemo(() => {
//     //console.log('\n🏷️ CategoryFilter: Computing category options with counts...')
//     //console.log('- categories prop:', categories?.length)
//     //console.log('- collection length:', collection?.length)

//     // Filter out "All categories" and other unwanted options first
//     const filteredCategories = categories.filter(category => {
//       const isAllCategories = 
//         category.value === '' || 
//         category.value === 'all' ||
//         category.value === 'all-categories' ||
//         category.label.toLowerCase().includes('all categories') ||
//         category.label.toLowerCase().includes('all') ||
//         category.label === ''
      
//       return !isAllCategories
//     })

//     //console.log('- Filtered categories:', filteredCategories.length)

//     // Count products for each category
//     const categoryCountMap = new Map<string, number>()

//     if (Array.isArray(collection) && collection.length > 0) {
//       //console.log('📊 Counting products for each category...')
      
//       collection.forEach((product, index) => {
//         if (product.categories && Array.isArray(product.categories)) {
//           product.categories.forEach(category => {
//             if (category?.handle) {
//               const categoryHandle = category.handle
//               categoryCountMap.set(categoryHandle, (categoryCountMap.get(categoryHandle) || 0) + 1)
//             }
//           })
//         }
//       })

//       //console.log('📊 Category count map:')
//       categoryCountMap.forEach((count, handle) => {
//         //console.log(`  - ${handle}: ${count} products`)
//       })
//     }

//     // Convert to CategoryOption format with counts
//     // Convert to CategoryOption format with counts and filter out categories with 0 count
// const optionsWithCounts: CategoryOption[] = filteredCategories
//   .map(category => {
//     const count = categoryCountMap.get(category.value) || 0

//     return {
//       value: category.value,
//       label: category.label,
//       count: count
//     }
//   })
//   .filter(option => option.count > 0) // ✅ Only keep categories with count > 0

//     // Sort by count (descending) then by name
//     const sortedOptions = optionsWithCounts.sort((a, b) => {
//       if (b.count !== a.count) {
//         return b.count - a.count // Higher count first
//       }
//       return a.label.localeCompare(b.label) // Alphabetical for same count
//     })

//     //console.log('🏷️ CategoryFilter: Final category options with counts:')
//     sortedOptions.forEach((option, index) => {
//       //console.log(`  ${index + 1}. ${option.label} (${option.count} products)`)
//     })

//     return sortedOptions
//   }, [categories, collection])

//   //console.log('🔍 categoryId from URL:', categoryId)
//   //console.log('🔍 parsed selectedCategories:', selectedCategories)

//   const handleCategoryChange = useCallback(
//     (id: string, isChecked: boolean) => {
//       //console.log('🏷️ CategoryFilter: Toggling category:', id, isChecked)
//       //console.log('- Current selectedCategories:', selectedCategories)
      
//       let updatedCategories: string[]
      
//       if (isChecked) {
//         updatedCategories = [...selectedCategories, id]
//         //console.log('  → Adding category')
//       } else {
//         updatedCategories = selectedCategories.filter(catId => catId !== id)
//         //console.log('  → Removing category')
//       }
      
//       //console.log('- New selectedCategories:', updatedCategories)
//       //console.log('- Setting category param to:', updatedCategories.join(','))
      
//       // Join array back to comma-separated string
//       setQueryParams("category", updatedCategories.join(','))
//     },
//     [selectedCategories, setQueryParams]
//   )

//   // Only render if there are category options available
//   if (!categoryOptionsWithCounts || categoryOptionsWithCounts.length <= 0) {
//     //console.log('❌ CategoryFilter: No category options available or only 1 category')
//     return null
//   }

//   //console.log('✅ CategoryFilter: Rendering with', categoryOptionsWithCounts.length, 'categories')

//   return (
//     <div className="mb-6" data-testid={dataTestId}>
//       {/* <Heading className="mb-4 txt-compact-small-plus text-ui-fg-base">
//         Categories
//       </Heading> */}
//       <div className="flex flex-col gap-2">
//         {categoryOptionsWithCounts.map((category) => {
//           const isChecked = selectedCategories.includes(category.value)
          
//           return (
//             <label
//               key={category.value}
//               className="flex items-center gap-2 p-0 transition-colors duration-150 rounded cursor-pointer group hover:bg-gray-50"
//             >
//               <input
//                 type="checkbox"
//                 checked={isChecked}
//                 onChange={(e) => handleCategoryChange(category.value, e.target.checked)}
//                 className="w-4 h-4 accent-[#e65100] border-gray-400 rounded cursor-pointer"
//               />
              
//               {/* ✅ ENHANCED: Category name with count (like ColorFilter) */}
//               <div className="flex-grow min-w-0">
//                 <span className="text-sm text-black-600 font-small">
//                   {category.label}
//                 </span>
//                 <span className="ml-1 text-sm text-gray-500">
//                   ({category.count.toLocaleString()})
//                 </span>
//               </div>
//             </label>
//           )
//         })}
//       </div>

//       {/* ✅ ADD: Selected categories summary (for debugging) */}
//       {selectedCategories.length > 0 && process.env.NODE_ENV === 'development' && (
//         <div className="p-2 mt-2 text-xs text-gray-500 rounded bg-gray-50">
//           <strong>Selected:</strong> {selectedCategories.join(', ')}
//         </div>
//       )}
//     </div>
//   )
// }

// export default CategoryFilter

"use client"

import { useCallback, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"

type CategoryOption = {
  value: string
  label: string
  count: number
}

type CategoryFilterProps = {
  categories: { value: string; label: string }[]
  // BUG FIX 1: Accept selectedCategories as an array prop directly from
  // ClientStoreShell state — NOT from URL searchParams.
  // Previously used categoryId string from URL which lags behind after clear.
  selectedCategories?: string[]
  // Keep categoryId for backward compatibility with other pages
  categoryId?: string
  collection?: HttpTypes.StoreProduct[]
  setQueryParams: (name: string, value: string) => void
  'data-testid'?: string
}

const CategoryFilter = ({
  categories,
  selectedCategories: selectedCategoriesProp,
  categoryId = "",
  collection = [],
  setQueryParams,
  'data-testid': dataTestId,
}: CategoryFilterProps) => {

  // BUG FIX 1: Use prop array when provided (from ClientStoreShell state = instant),
  // fall back to parsing categoryId string (for other pages using URL params).
  const selectedCategories = useMemo(() => {
    if (selectedCategoriesProp !== undefined) return selectedCategoriesProp
    if (!categoryId) return []
    return categoryId.split(',').filter(Boolean)
  }, [selectedCategoriesProp, categoryId])

  const categoryOptionsWithCounts = useMemo(() => {
    const filteredCategories = categories.filter(category => {
      const isAll =
        category.value === '' ||
        category.value === 'all' ||
        category.value === 'all-categories' ||
        category.label.toLowerCase().includes('all categories') ||
        category.label === ''
      return !isAll
    })

    const categoryCountMap = new Map<string, number>()
    if (Array.isArray(collection) && collection.length > 0) {
      collection.forEach((product) => {
        if (product.categories && Array.isArray(product.categories)) {
          product.categories.forEach((category) => {
            if (category?.handle) {
              categoryCountMap.set(
                category.handle,
                (categoryCountMap.get(category.handle) || 0) + 1
              )
            }
          })
        }
      })
    }

    const optionsWithCounts: CategoryOption[] = filteredCategories
      .map((category) => ({
        value: category.value,
        label: category.label,
        count: categoryCountMap.get(category.value) || 0,
      }))
      .filter((option) => option.count > 0)

    return optionsWithCounts.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.label.localeCompare(b.label)
    })
  }, [categories, collection])

  const handleCategoryChange = useCallback(
    (id: string, isChecked: boolean) => {
      const updated = isChecked
        ? [...selectedCategories, id]
        : selectedCategories.filter((c) => c !== id)

      // BUG FIX 2: Use "categories" (plural) — matches ClientStoreShell's
      // setQueryParams switch case. Previously sent "category" (singular)
      // which ClientStoreShell didn't handle, so state never updated instantly.
      setQueryParams("categories", updated.join(','))
    },
    [selectedCategories, setQueryParams]
  )

  if (!categoryOptionsWithCounts || categoryOptionsWithCounts.length === 0) {
    return null
  }

  return (
    <div className="mb-6" data-testid={dataTestId}>
      <div className="flex flex-col gap-2">
        {categoryOptionsWithCounts.map((category) => {
          // BUG FIX 1 cont: isChecked reads from selectedCategories which is now
          // driven by ClientStoreShell state — updates instantly on clear/toggle,
          // no URL lag.
          const isChecked = selectedCategories.includes(category.value)

          return (
            <label
              key={category.value}
              className="flex items-center gap-2 p-0 transition-colors duration-150 rounded cursor-pointer group hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => handleCategoryChange(category.value, e.target.checked)}
                className="w-4 h-4 accent-[#e65100] border-gray-400 rounded cursor-pointer"
              />
              <div className="flex-grow min-w-0">
                <span className="text-sm text-black-600 font-small">
                  {category.label}
                </span>
                <span className="ml-1 text-sm text-gray-500">
                  ({category.count.toLocaleString()})
                </span>
              </div>
            </label>
          )
        })}
      </div>

      {selectedCategories.length > 0 && process.env.NODE_ENV === 'development' && (
        <div className="p-2 mt-2 text-xs text-gray-500 rounded bg-gray-50">
          <strong>Selected:</strong> {selectedCategories.join(', ')}
        </div>
      )}
    </div>
  )
}

export default CategoryFilter