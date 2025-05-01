"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import SortProducts, { SortOptions } from "./sort-products"

type SortWrapperProps = {
  sortBy: SortOptions
  "data-testid"?: string
}

const SortWrapper = ({ sortBy, "data-testid": dataTestId }: SortWrapperProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setQueryParams = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams)

    if (value === "") {
      params.delete(name)
    } else {
      params.set(name, value)
    }

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
