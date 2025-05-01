  import { notFound } from "next/navigation"
  import { Suspense, useMemo } from "react"
  import SortWrapper from "@modules/store/components/refinement-list/sort-wrapper"


  import InteractiveLink from "@modules/common/components/interactive-link"
  import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
  import RefinementList from "@modules/store/components/refinement-list"
  import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
  import PaginatedProducts from "@modules/store/templates/paginated-products"
  import LocalizedClientLink from "@modules/common/components/localized-client-link"
  import { HttpTypes } from "@medusajs/types"

  export default function CategoryTemplate({
    category,
    sortBy,
    page,
    countryCode,
  }: {
    category: HttpTypes.StoreProductCategory
    sortBy?: SortOptions
    page?: string
    countryCode: string
  }) {
    const pageNumber = page ? parseInt(page) : 1
    const sort = sortBy || "created_at"

    if (!category || !countryCode) notFound()

    // const parents = [] as HttpTypes.StoreProductCategory[]

    // const getParents = (category: HttpTypes.StoreProductCategory) => {
    //   if (category.parent_category) {
    //     parents.push(category.parent_category)
    //     getParents(category.parent_category)
    //   }
    // }

    // getParents(category)

    const parents = useMemo(() => {
      const p: HttpTypes.StoreProductCategory[] = []
      let current = category.parent_category
      while (current) {
        p.unshift(current) // unshift ensures topmost parent comes first
        current = current.parent_category
      }
      console.log("Breadcrumb parents array:", p) // <-- Add this
      return p
    }, [category])
    
    return (
      <div className="py-6 mt-16 content-container">
        {/* 🥖 BREADCRUMBS SECTION */}
    <div className="flex flex-wrap items-center gap-2 mb-4 ml-4 text-sm text-ui-fg-muted">
      {parents.length > 0 && parents.map((parent, index) => (
        <span key={parent.id} className="flex items-center">
          <LocalizedClientLink
            className="hover:text-black"
            href={`/categories/${parent.handle}`}
            data-testid="breadcrumb-link"
          >
            {parent.name}
          </LocalizedClientLink>
          <span className="mx-2">/</span>
        </span>
      ))}
      {/* Current category name */}
      <span className="mb-1 text-3xl font-semibold text-black">{category.name}</span>
    </div>
        {/* DESCRIPTION BELOW HEADER */}
        {category.description && (
          <div className="mb-0 ml-4">
            <p>{category.description}</p>
          </div>
        )}
    
        {/* CATEGORY + SIDEBAR FLEX CONTAINER */}
        <div
          className="flex flex-col small:flex-row small:items-start"
          data-testid="category-container"
        >
          <RefinementList 
          sortBy={sort} 
          data-testid="sort-by-container"
          categoryChildren={category.category_children ?? []} // 🆕 Add this line
        />

          <div className="w-full">
            {/* <div className="flex flex-row gap-4 mb-8 text-2xl-semi">
              {parents &&
                parents.map((parent) => (
                  <span key={parent.id} className="text-ui-fg-subtle">
                    <LocalizedClientLink
                      className="mr-4 hover:text-black"
                      href={`/categories/${parent.handle}`}
                      data-testid="sort-by-link"
                    >
                      {parent.name}
                    </LocalizedClientLink>
                    /
                  </span>
                ))}
            </div> */}
           <div className="flex justify-end mb-6">
              <SortWrapper 
                sortBy={sort} 
                data-testid="sort-above-grid" 
              />
            </div>

            <Suspense
              fallback={
                <SkeletonProductGrid
                  numberOfProducts={category.products?.length ?? 8}
                />
              }
            >
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                categoryId={category.id}
                countryCode={countryCode}
              />
            </Suspense>
          </div>
        </div>
      </div>
    )
  }
    
  //   return (
  //     <div
  //       className="flex flex-col py-6 small:flex-row small:items-start content-container"
  //       data-testid="category-container"
  //     > 
  //       <RefinementList sortBy={sort} data-testid="sort-by-container" />
  //       <div className="w-full">
  //         <div className="flex flex-row gap-4 mb-8 text-2xl-semi">
  //           {parents &&
  //             parents.map((parent) => (
  //               <span key={parent.id} className="text-ui-fg-subtle">
  //                 <LocalizedClientLink
  //                   className="mr-4 hover:text-black"
  //                   href={`/categories/${parent.handle}`}
  //                   data-testid="sort-by-link"
  //                 >
  //                   {parent.name}
  //                 </LocalizedClientLink>
  //                 /
  //               </span>
  //             ))}
  //           <h1 data-testid="category-page-title">{category.name}</h1>
  //         </div>
  //         {category.description && (
  //           <div className="mb-8 text-base-regular">
  //             <p>{category.description}</p>
  //           </div>
  //         )}
  //         {category.category_children && (
  //           <div className="mb-8 text-base-large">
  //             <ul className="grid grid-cols-1 gap-2">
  //               {category.category_children?.map((c) => (
  //                 <li key={c.id}>
  //                   <InteractiveLink href={`/categories/${c.handle}`}>
  //                     {c.name}
  //                   </InteractiveLink>
  //                 </li>
  //               ))}
  //             </ul>
  //           </div>
  //         )}
  //         <Suspense
  //           fallback={
  //             <SkeletonProductGrid
  //               numberOfProducts={category.products?.length ?? 8}
  //             />
  //           }
  //         >
  //           <PaginatedProducts
  //             sortBy={sort}
  //             page={pageNumber}
  //             categoryId={category.id}
  //             countryCode={countryCode}
  //           />
  //         </Suspense>
  //       </div>
  //     </div>
  //   )
  // }
    