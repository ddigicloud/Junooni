"use client"

import { clx } from "@medusajs/ui"
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

  // Helper function to render page numbers based on total pages
  const renderPageNumbers = () => {
    const pages = []

    if (totalPages <= 4) {
      // Show all pages when total pages <= 4
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            className={clx("px-4 py-2", {
              "bg-[#e65100] text-white hover:bg-[#d84315]": page === i,
              "border-r border-gray-300 hover:bg-gray-100": page !== i && i < totalPages,
              "hover:bg-gray-100": page !== i && i === totalPages
            })}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        )
      }
    } else {
      // When total pages > 4: show "1 2 3 ... lastpage"
      
      // Page 1
      pages.push(
        <button
          key={1}
          className={clx("px-4 py-2 border-r border-gray-300", {
            "bg-[#e65100] text-white hover:bg-[#d84315]": page === 1,
            "hover:bg-gray-100": page !== 1
          })}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      )

      // Page 2
      pages.push(
        <button
          key={2}
          className={clx("px-4 py-2 border-r border-gray-300", {
            "bg-[#e65100] text-white hover:bg-[#d84315]": page === 2,
            "hover:bg-gray-100": page !== 2
          })}
          onClick={() => handlePageChange(2)}
        >
          2
        </button>
      )

      // Page 3
      pages.push(
        <button
          key={3}
          className={clx("px-4 py-2 border-r border-gray-300", {
            "bg-[#e65100] text-white hover:bg-[#d84315]": page === 3,
            "hover:bg-gray-100": page !== 3
          })}
          onClick={() => handlePageChange(3)}
        >
          3
        </button>
      )

      // Ellipsis
      pages.push(
        <span key="ellipsis" className="px-4 py-2 text-gray-500 border-r border-gray-300">
          ...
        </span>
      )

      // Last page
      pages.push(
        <button
          key={totalPages}
          className={clx("px-4 py-2", {
            "bg-[#e65100] text-white hover:bg-[#d84315]": page === totalPages,
            "hover:bg-gray-100": page !== totalPages
          })}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      )
    }

    return pages
  }

  return (
    <div className="flex justify-center mt-10">
      <div className="flex overflow-hidden border border-gray-300 rounded-md" data-testid={dataTestid}>
        {/* Previous button */}
        <button 
          className={clx("px-4 py-2 border-r border-gray-300", {
            "text-gray-400 cursor-not-allowed": page === 1,
            "hover:bg-gray-100": page > 1
          })}
          onClick={() => page > 1 && handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        
        {/* Page numbers */}
        {renderPageNumbers()}
        
        {/* Next button */}
        <button 
          className={clx("px-4 py-2 border-l border-gray-300", {
            "text-gray-400 cursor-not-allowed": page === totalPages,
            "hover:bg-gray-100": page < totalPages
          })}
          onClick={() => page < totalPages && handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}