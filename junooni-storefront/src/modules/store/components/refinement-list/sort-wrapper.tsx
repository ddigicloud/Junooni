"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import SortProducts, { SortOptions } from "./sort-products"

type SortWrapperProps = {
  sortBy: SortOptions
  "data-testid"?: string
  onSortChange?: (sort: SortOptions) => void  // ← add this
}

const SortWrapper = ({ sortBy, "data-testid": dataTestId, onSortChange }: SortWrapperProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setQueryParams = (name: string, value: string) => {
    // If ClientStoreShell passed onSortChange, use it (client-side, instant)
    // Otherwise fall back to router.push (server round-trip, for other pages)
    if (name === "sortBy" && onSortChange) {
      onSortChange(value as SortOptions)
      return
    }
    const params = new URLSearchParams(searchParams)
    if (value === "") params.delete(name)
    else params.set(name, value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <SortProducts
      sortBy={sortBy}
      setQueryParams={setQueryParams}
      data-testid={dataTestId}
    />
  )
}

export default SortWrapper
