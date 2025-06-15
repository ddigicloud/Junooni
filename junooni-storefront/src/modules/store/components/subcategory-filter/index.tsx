// "use client"

// import { useCallback } from "react"
// import { Heading } from "@medusajs/ui"
// import { usePathname, useRouter } from "next/navigation"

// type Category = {
//   id: string
//   name: string
//   handle: string
//   parent_category_id?: string
//   category_children?: Category[]
// }

// type SubcategoryFilterProps = {
//   subcategories: Category[]
//   'data-testid'?: string
// }

// const SubcategoryFilter = ({ 
//   subcategories = [],
//   'data-testid': dataTestId 
// }: SubcategoryFilterProps) => {
//   const router = useRouter()
//   const pathname = usePathname()
  
//   // Navigate to subcategory page
//   const navigateToSubcategory = useCallback((handle: string) => {
//     // Extract the base path up to /categories/
//     const basePath = pathname.split('/categories/')[0] + '/categories/'
//     router.push(`${basePath}${handle}`)
//   }, [pathname, router])

//   if (!subcategories || subcategories.length === 0) {
//     return null
//   }

//   return (
//     <div className="mb-6" data-testid={dataTestId}>
//       <Heading className="mb-4 txt-compact-small-plus text-ui-fg-base">
//         Subcategories
//       </Heading>
//       <div className="flex flex-col gap-2">
//         {subcategories.map((subcategory) => (
//           <button
//             key={subcategory.id}
//             className="px-2 py-1 text-left rounded hover:bg-gray-50"
//             onClick={() => navigateToSubcategory(subcategory.handle)}
//           >
//             <span>{subcategory.name}</span>
//           </button>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default SubcategoryFilter

"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Category = {
  id: string
  name: string
  handle: string
  parent_category_id?: string
  category_children?: Category[]
}

type SubcategoryFilterProps = {
  subcategories: Category[]
  'data-testid'?: string
}

const SubcategoryFilter = ({ 
  subcategories = [],
  'data-testid': dataTestId 
}: SubcategoryFilterProps) => {
  const router = useRouter()
  
  if (!subcategories || subcategories.length === 0) {
    return null
  }

  return (
    <div className="space-y-2" data-testid={dataTestId}>
      {subcategories.map((subcategory) => (
        <LocalizedClientLink
          key={subcategory.id}
          href={`/categories/${subcategory.handle}`}
          className="flex items-center text-gray-600 hover:text-pink-500 py-1.5 group text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3 text-gray-400 group-hover:text-pink-500">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{subcategory.name}</span>
        </LocalizedClientLink>
      ))}
    </div>
  )
}

export default SubcategoryFilter