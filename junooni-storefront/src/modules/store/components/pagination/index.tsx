// "use client"

// import { clx } from "@medusajs/ui"
// import { usePathname, useRouter, useSearchParams } from "next/navigation"

// export function Pagination({
//   page,
//   totalPages,
//   'data-testid': dataTestid
// }: {
//   page: number
//   totalPages: number
//   'data-testid'?: string
// }) {
//   const router = useRouter()
//   const pathname = usePathname()
//   const searchParams = useSearchParams()

//   // Helper function to generate an array of numbers within a range
//   const arrayRange = (start: number, stop: number) =>
//     Array.from({ length: stop - start + 1 }, (_, index) => start + index)

//   // Function to handle page changes
//   const handlePageChange = (newPage: number) => {
//     const params = new URLSearchParams(searchParams)
//     params.set("page", newPage.toString())
//     router.push(`${pathname}?${params.toString()}`)
//   }

//   // Function to render a page button
//   const renderPageButton = (
//     p: number,
//     label: string | number,
//     isCurrent: boolean
//   ) => (
//     <button
//       key={p}
//       className={clx("txt-xlarge-plus text-ui-fg-muted", {
//         "text-ui-fg-base hover:text-ui-fg-subtle": isCurrent,
//       })}
//       disabled={isCurrent}
//       onClick={() => handlePageChange(p)}
//     >
//       {label}
//     </button>
//   )

//   // Function to render ellipsis
//   const renderEllipsis = (key: string) => (
//     <span
//       key={key}
//       className="items-center cursor-default txt-xlarge-plus text-ui-fg-muted"
//     >
//       ...
//     </span>
//   )

//   // Function to render page buttons based on the current page and total pages
//   const renderPageButtons = () => {
//     const buttons = []

//     if (totalPages <= 7) {
//       // Show all pages
//       buttons.push(
//         ...arrayRange(1, totalPages).map((p) =>
//           renderPageButton(p, p, p === page)
//         )
//       )
//     } else {
//       // Handle different cases for displaying pages and ellipses
//       if (page <= 4) {
//         // Show 1, 2, 3, 4, 5, ..., lastpage
//         buttons.push(
//           ...arrayRange(1, 5).map((p) => renderPageButton(p, p, p === page))
//         )
//         buttons.push(renderEllipsis("ellipsis1"))
//         buttons.push(
//           renderPageButton(totalPages, totalPages, totalPages === page)
//         )
//       } else if (page >= totalPages - 3) {
//         // Show 1, ..., lastpage - 4, lastpage - 3, lastpage - 2, lastpage - 1, lastpage
//         buttons.push(renderPageButton(1, 1, 1 === page))
//         buttons.push(renderEllipsis("ellipsis2"))
//         buttons.push(
//           ...arrayRange(totalPages - 4, totalPages).map((p) =>
//             renderPageButton(p, p, p === page)
//           )
//         )
//       } else {
//         // Show 1, ..., page - 1, page, page + 1, ..., lastpage
//         buttons.push(renderPageButton(1, 1, 1 === page))
//         buttons.push(renderEllipsis("ellipsis3"))
//         buttons.push(
//           ...arrayRange(page - 1, page + 1).map((p) =>
//             renderPageButton(p, p, p === page)
//           )
//         )
//         buttons.push(renderEllipsis("ellipsis4"))
//         buttons.push(
//           renderPageButton(totalPages, totalPages, totalPages === page)
//         )
//       }
//     }

//     return buttons
//   }

//   // Render the component
//   return (
//     <div className="flex justify-center w-full mt-12">
//       <div className="flex items-end gap-3" data-testid={dataTestid}>{renderPageButtons()}</div>
//     </div>
//   )
// }


"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function Pagination({
  page,
  totalPages,
  'data-testid': dataTestid
}: {
  page: number
  totalPages: number
  'data-testid'?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Function to handle page changes
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  // Skip rendering pagination if only one page
  if (totalPages <= 1) {
    return null
  }

  // Create pagination display with ellipsis
  const renderPagination = () => {
    const items = [];
    const rangeSize = 2; // Number of pages to show on each side of current page
    
    // Always show first page
    items.push({
      type: 'page',
      number: 1,
      isCurrent: page === 1
    });
    
    // Show ellipsis if needed
    if (page > rangeSize + 2) {
      items.push({ type: 'ellipsis' });
    }
    
    // Show pages around current page
    const start = Math.max(2, page - rangeSize);
    const end = Math.min(totalPages - 1, page + rangeSize);
    
    for (let i = start; i <= end; i++) {
      items.push({
        type: 'page',
        number: i,
        isCurrent: page === i
      });
    }
    
    // Show ellipsis if needed
    if (page < totalPages - rangeSize - 1) {
      items.push({ type: 'ellipsis' });
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1) {
      items.push({
        type: 'page',
        number: totalPages,
        isCurrent: page === totalPages
      });
    }
    
    return items;
  };

  const paginationItems = renderPagination();

  return (
    <div className="flex items-center justify-center my-10" data-testid={dataTestid}>
      {/* Previous button */}
      <button
        className="px-3 py-2 border border-gray-300 rounded-l-sm mr-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      {/* Page numbers */}
      <div className="flex">
        {paginationItems.map((item, index) => (
          item.type === 'ellipsis' ? (
            <span 
              key={`ellipsis-${index}`} 
              className="w-10 h-10 flex items-center justify-center text-gray-500"
            >
              ...
            </span>
          ) : (
            <button
              key={`page-${item.number}`}
              className={`w-10 h-10 flex items-center justify-center border mx-0.5 ${
                item.isCurrent 
                  ? 'bg-pink-500 text-white border-pink-500' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => !item.isCurrent && handlePageChange(item.number)}
              disabled={item.isCurrent}
              aria-current={item.isCurrent ? 'page' : undefined}
              aria-label={`Page ${item.number}`}
            >
              {item.number}
            </button>
          )
        ))}
      </div>
      
      {/* Next button */}
      <button
        className="px-3 py-2 border border-gray-300 rounded-r-sm ml-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}