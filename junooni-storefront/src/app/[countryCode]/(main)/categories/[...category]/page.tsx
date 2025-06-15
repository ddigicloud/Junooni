// app/categories/[category]/[countryCode]/page.tsx
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: { category: string[]; countryCode: string }
  searchParams: {
    page?: string
    sortBy?: SortOptions
    vendors?: string
    colors?: string
    price?: string
    collections?: string  // ✅ ADD: Missing collections parameter
  }
}

export const PRODUCT_LIMIT = 12

export async function generateStaticParams() {
  try {
    const product_categories = await listCategories()
    if (!product_categories) {
      return []
    }
    const countryCodes = await listRegions().then(
      (regions: StoreRegion[]) =>
        regions
          ?.map((r) => r.countries?.map((c) => c.iso_2))
          .flat()
          .filter(Boolean) as string[]
    )
    const categoryHandles = product_categories.map(
      (category: any) => category.handle
    )
    const staticParams = countryCodes
      ?.map((countryCode: string) =>
        categoryHandles.map((handle: string) => ({
          countryCode,
          category: [handle],
        }))
      )
      .flat()
    return staticParams
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const productCategory = await getCategoryByHandle(params.category)
    if (!productCategory) {
      return {
        title: "Category Not Found | Medusa Store",
        description: "The requested category could not be found.",
      }
    }
    const title = productCategory.name
    const description = productCategory.description ?? `${title} category.`
    return {
      title: `${title} | Medusa Store`,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch (error) {
    return {
      title: "Error | Medusa Store",
      description: "An error occurred while retrieving category information.",
    }
  }
}

export default async function CategoryPage({ searchParams, params }: Props) {
  const {
    sortBy,
    page,
    vendors,
    colors,
    price,
    collections  // ✅ ADD: Extract collections from searchParams
  } = searchParams

  // ✅ ADD: Debug logging to verify collections extraction
  console.log('🔍 CategoryPage Debug:')
  console.log('- searchParams:', searchParams)
  console.log('- collections from searchParams:', collections)
  console.log('- typeof collections:', typeof collections)

  try {
    const productCategory = await getCategoryByHandle(params.category)
    if (!productCategory) {
      notFound()
    }

    console.log('🚀 CategoryPage about to render CategoryTemplate with collections:', collections)

    return (
      <CategoryTemplate
        category={productCategory}
        page={page}
        sortBy={sortBy}
        countryCode={params.countryCode}
        vendors={vendors}
        colors={colors}
        price={price}
        collections={collections}  // ✅ ADD: Pass collections to CategoryTemplate
      />
    )
  } catch (error) {
    console.error("Error loading category page:", error)
    notFound()
  }
}