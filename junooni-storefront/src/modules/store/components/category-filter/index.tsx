// "use client"

// import { RadioGroup } from "@headlessui/react"
// import { useCallback } from "react"
// import { Heading } from "@medusajs/ui"

// type CategoryFilterProps = {
//   categories: { value: string; label: string }[]
//   categoryId: string
//   setQueryParams: (name: string, value: string) => void
//   'data-testid'?: string
// }

// const CategoryFilter = ({
//   categories,
//   categoryId,
//   setQueryParams,
//   'data-testid': dataTestId,
// }: CategoryFilterProps) => {
//   const handleCategoryChange = useCallback(
//     (id: string) => {
//       setQueryParams("category", id)
//     },
//     [setQueryParams]
//   )

//   if (!categories || categories.length <= 1) {
//     return null
//   }

//   return (
//     <div className="mb-6" data-testid={dataTestId}>
//       <Heading className="txt-compact-small-plus text-ui-fg-base mb-4">
//         Categories
//       </Heading>
//       <RadioGroup value={categoryId} onChange={handleCategoryChange}>
//         <div className="flex flex-col gap-2">
//           {categories.map((category) => {
//             return (
//               <RadioGroup.Option
//                 key={category.value}
//                 value={category.value}
//                 className="flex items-center gap-2 cursor-pointer"
//               >
//                 {({ checked }) => (
//                   <>
//                     <span
//                       className={`w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center ${
//                         checked && "border-gray-900"
//                       }`}
//                     >
//                       {checked && (
//                         <span className="w-2 h-2 rounded-full bg-gray-900" />
//                       )}
//                     </span>
//                     <span className="text-sm">{category.label}</span>
//                   </>
//                 )}
//               </RadioGroup.Option>
//             )
//           })}
//         </div>
//       </RadioGroup>
//     </div>
//   )
// }

// export default CategoryFilter

// @modules/store/components/subcategory-filter/index.tsx
"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SubcategoryFilterProps = {
  subcategories?: HttpTypes.StoreProductCategory[]
  'data-testid'?: string
}

const SubcategoryFilter = ({ 
  subcategories = [], 
  'data-testid': dataTestId 
}: SubcategoryFilterProps) => {
  const router = useRouter()
  const pathname = usePathname()
  
  if (!subcategories || subcategories.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col space-y-2" data-testid={dataTestId}>
      {subcategories.map((subcategory) => (
        <LocalizedClientLink
          key={subcategory.id}
          href={`/categories/${subcategory.handle}`}
          className="flex items-center py-1 px-2 text-sm text-gray-700 hover:bg-gray-50 rounded-sm hover:text-pink-600 transition-colors"
        >
          <span className="truncate">{subcategory.name}</span>
          <span className="ml-auto text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </LocalizedClientLink>
      ))}
    </div>
  )
}

export default SubcategoryFilter