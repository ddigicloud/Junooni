// import { Metadata } from "next"
// import { notFound } from "next/navigation"
// import { getCategoryByHandle, listCategories } from "@lib/data/categories"
// import { listRegions } from "@lib/data/regions"
// import { StoreRegion } from "@medusajs/types"
// import CategoryTemplate from "@modules/categories/templates"
// import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

// type Props = {
//   params: { category: string[]; countryCode: string }
//   searchParams: {
//     page?: string
//     sortBy?: SortOptions
//     vendors?: string
//     colors?: string
//     price?: string
//   }
// }

// export const PRODUCT_LIMIT = 12

// export async function generateStaticParams() {
//   try {
//     const product_categories = await listCategories()
//     if (!product_categories) {
//       return []
//     }
//     const countryCodes = await listRegions().then(
//       (regions: StoreRegion[]) =>
//         regions
//           ?.map((r) => r.countries?.map((c) => c.iso_2))
//           .flat()
//           .filter(Boolean) as string[]
//     )
//     const categoryHandles = product_categories.map(
//       (category: any) => category.handle
//     )
//     const staticParams = countryCodes
//       ?.map((countryCode: string) =>
//         categoryHandles.map((handle: string) => ({
//           countryCode,
//           category: [handle],
//         }))
//       )
//       .flat()
//     return staticParams
//   } catch (error) {
//     console.error("Error generating static params:", error)
//     return []
//   }
// }

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   try {
//     const productCategory = await getCategoryByHandle(params.category)
//     if (!productCategory) {
//       return {
//         title: "Category Not Found | Medusa Store",
//         description: "The requested category could not be found.",
//       }
//     }
//     const title = productCategory.name
//     const description = productCategory.description ?? `${title} category.`
//     return {
//       title: `${title} | Medusa Store`,
//       description,
//       alternates: {
//         canonical: `${params.category.join("/")}`,
//       },
//     }
//   } catch (error) {
//     return {
//       title: "Error | Medusa Store",
//       description: "An error occurred while retrieving category information.",
//     }
//   }
// }

// export default async function CategoryPage({ searchParams, params }: Props) {
//   const { 
//     sortBy, 
//     page,
//     vendors,
//     colors,
//     price 
//   } = searchParams
  
//   try {
//     const productCategory = await getCategoryByHandle(params.category)
//     if (!productCategory) {
//       notFound()
//     }
    
//     return (
//       <div className="bg-white min-h-screen">
//         <CategoryTemplate
//           category={productCategory}
//           page={page}
//           sortBy={sortBy}
//           countryCode={params.countryCode}
//           vendors={vendors}
//           colors={colors}
//           price={price}
//         />
//       </div>
//     )
//   } catch (error) {
//     console.error("Error loading category page:", error)
//     notFound()
//   }
// }

// import { Metadata } from "next"
// import { notFound } from "next/navigation"
// import { getCategoryByHandle, listCategories } from "@lib/data/categories"
// import { listRegions } from "@lib/data/regions"
// import { StoreRegion } from "@medusajs/types"
// import CategoryTemplate from "@modules/categories/templates"
// import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
// import MobileFilters from "@modules/store/components/mobile-filters"

// type Props = {
//   params: { category: string[]; countryCode: string }
//   searchParams: {
//     page?: string
//     sortBy?: SortOptions
//     vendors?: string
//     colors?: string
//     price?: string
//     showMobileFilters?: string
//   }
// }

// export const PRODUCT_LIMIT = 12

// export async function generateStaticParams() {
//   try {
//     const product_categories = await listCategories()
//     if (!product_categories) {
//       return []
//     }
//     const countryCodes = await listRegions().then(
//       (regions: StoreRegion[]) =>
//         regions
//           ?.map((r) => r.countries?.map((c) => c.iso_2))
//           .flat()
//           .filter(Boolean) as string[]
//     )
//     const categoryHandles = product_categories.map(
//       (category: any) => category.handle
//     )
//     const staticParams = countryCodes
//       ?.map((countryCode: string) =>
//         categoryHandles.map((handle: string) => ({
//           countryCode,
//           category: [handle],
//         }))
//       )
//       .flat()
//     return staticParams
//   } catch (error) {
//     console.error("Error generating static params:", error)
//     return []
//   }
// }

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   try {
//     const productCategory = await getCategoryByHandle(params.category)
//     if (!productCategory) {
//       return {
//         title: "Category Not Found | Medusa Store",
//         description: "The requested category could not be found.",
//       }
//     }
//     const title = productCategory.name
//     const description = productCategory.description ?? `${title} category.`
//     return {
//       title: `${title} | Medusa Store`,
//       description,
//       alternates: {
//         canonical: `${params.category.join("/")}`,
//       },
//     }
//   } catch (error) {
//     return {
//       title: "Error | Medusa Store",
//       description: "An error occurred while retrieving category information.",
//     }
//   }
// }

// export default async function CategoryPage({ searchParams, params }: Props) {
//   const { 
//     sortBy, 
//     page,
//     vendors,
//     colors,
//     price,
//     showMobileFilters 
//   } = searchParams
  
//   try {
//     const productCategory = await getCategoryByHandle(params.category)
//     if (!productCategory) {
//       notFound()
//     }
    
//     // If showing mobile filters, render the mobile filter component
//     if (showMobileFilters === "true") {
//       return (
//         <MobileFilters
//           sortBy={sortBy || "created_at"}
//           vendors={[]} // These will be fetched inside the component
//           products={productCategory.products || []}
//           currentCategory={productCategory}
//           subcategories={productCategory.category_children || []}
//           isCollectionPage={false}
//         />
//       )
//     }
    
//     return (
//       <div className="bg-white min-h-screen">
//         <CategoryTemplate
//           category={productCategory}
//           page={page}
//           sortBy={sortBy}
//           countryCode={params.countryCode}
//           vendors={vendors}
//           colors={colors}
//           price={price}
//         />
//       </div>
//     )
//   } catch (error) {
//     console.error("Error loading category page:", error)
//     notFound()
//   }
// }

// src/app/[countryCode]/categories/[handle]/page.tsx

import { HttpTypes } from "@medusajs/types"
import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import CategoryTemplate from "@modules/categories/templates/"
import { notFound } from "next/navigation"

type CategoryPageProps = {
  params: {
    handle: string
    countryCode: string
  }
  searchParams: {
    sortBy?: string
    page?: string
    vendors?: string
    colors?: string
    price?: string
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { handle, countryCode } = params
  
  // Fetch the category by handle
  const category = await getCategoryByHandle(handle).catch(() => null)
  
  if (!category) {
    notFound()
  }
  
  // Get all categories to build parent-child relationships
  const categories = await listCategories()
  
  // Find parent categories (for breadcrumbs)
  const parentCategories: HttpTypes.StoreCategory[] = []
  if (category.parent_category_id) {
    let parentId = category.parent_category_id
    while (parentId) {
      const parent = categories.find(c => c.id === parentId)
      if (parent) {
        parentCategories.unshift(parent) // Add to front of array
        parentId = parent.parent_category_id
      } else {
        parentId = null
      }
    }
  }
  
  // Find child categories
  const childCategories = categories.filter(
    c => c.parent_category_id === category.id
  )
  
  return (
    <CategoryTemplate
      category={category}
      parentCategories={parentCategories}
      childCategories={childCategories}
      countryCode={countryCode}
      sortBy={searchParams.sortBy as any}
      page={searchParams.page}
      vendors={searchParams.vendors}
      colors={searchParams.colors}
      price={searchParams.price}
    />
  )
} 