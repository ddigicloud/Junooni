"use client"

// HomeCategories needs to be a client component so we can use router.push
// for instant URL navigation. The data fetch is lifted to the parent server
// component (page.tsx) and passed as props — OR we keep the async fetch
// by splitting into server + client parts.
//
// SIMPLEST FIX: Keep as server component for data fetch, but wrap each
// Link in a client click handler for instant navigation.
// We use a hybrid: server component fetches data, renders client CategoryLink.

import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface CategoryMetadata {
  featured_image?: string
  [key: string]: any
}

interface Category {
  id: string
  name: string
  handle: string
  metadata: CategoryMetadata | null
  parent_category: any | null
}

interface Props {
  categories: Category[]
}

// ── Client component: handles instant navigation on click ─────────────────────
function CategoryCard({ category }: { category: Category }) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Instantly updates URL → loading.tsx skeleton shows immediately
    // Server fetches category data in background
    router.push(`/categories/${category.handle}`)
  }

  return (
    <Link
      href={`/categories/${category.handle}`}
      prefetch={true}       // preloads on hover
      onClick={handleClick} // instant URL on click
      className="group"
    >
      <div className="overflow-hidden transition-all duration-300">
        <div className="relative bg-gray-100 aspect-square">
          {category.metadata?.featured_image && (
            <Image
              src={category.metadata.featured_image}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          )}
          <div className="absolute inset-0 transition-all duration-300 bg-black bg-opacity-0 group-hover:bg-opacity-10 group-hover:scale-105" />
        </div>

        <div className="px-4 py-2 sm:p-4 md:p-4 text-center">
          <h3 className="text-lg font-medium transition-colors duration-300 group-hover:text-orange-primary">
            {category.name}
          </h3>
          <div className="mt-2 h-0.5 w-0 bg-orange-primary mx-auto transition-all duration-300 group-hover:w-12" />
        </div>
      </div>
    </Link>
  )
}

// ── Main component — receives categories as prop ───────────────────────────────
export default function HomeCategoriesClient({ categories }: Props) {
  const categoriesWithImages = categories.filter(
    (c) =>
      c.metadata !== null &&
      typeof c.metadata.featured_image === "string" &&
      c.metadata.featured_image.length > 0
  )

  return (
    <section className="py-10 bg-gray-50">
      <div className="mx-auto w-full max-w-full px-0 sm:px-4">
        <h2 className="mb-12 text-3xl font-bold text-center">
          <span className="inline-block pb-2">Shop by Category</span>
        </h2>

        <div className="grid grid-cols-2 gap-1 sm:gap-3 md:grid-cols-4 md:gap-2">
          {categoriesWithImages.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  )
}