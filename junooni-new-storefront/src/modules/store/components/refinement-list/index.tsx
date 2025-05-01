"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import SortProducts, { SortOptions } from "./sort-products"
import CategoryFilter from "@modules/store/components/category-filter"
import BrandFilter from "@modules/store/components/brand-filter"
import ColorFilter from "@modules/store/components/color-filter"
import PriceFilter from "@modules/store/components/price-filter"
import { Text } from "@medusajs/ui"

interface CategoryLevel3 {
  id: string;
  name: string;
  handle: string;
}

interface CategoryLevel2 {
  id: string;
  name: string;
  handle: string;
  category_children?: CategoryLevel3[];
}

interface CategoryLevel1 {
  id: string;
  name: string;
  handle: string;
  parent_category?: any;
  category_children?: CategoryLevel2[];
}


type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  'data-testid'?: string
  categories?: Array<{id: string; name: string; handle: string; parent_category?: any}>
  brands?:  Array<{vendor_id: string; vendor_name: string; vendor_handle: string;}>
  products?: any
  parents?: Array<{id: string; name: string; handle: string;}>
  categoryChildren?: Array<{ id: string; name: string; handle: string }> 
}

const RefinementList = ({ 
  sortBy,
  categories = [],
  brands = [],
  products,
  parents,
  categoryChildren = [],
  'data-testid': dataTestId 
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Format categories with handle as value and name as label
  const formattedCategories = [
    { value: "", label: "All Categories" },
    ...(Array.isArray(categories) ? categories.map(category => ({
      value: category.handle,
      label: category.name
    })) : [])
  ]

  // Process brands to ensure unique handles
  const formattedBrands = (() => {
    const handleCounts = {};
    const result = [{ value: "", label: "All brands" }];
    
    // Process each brand to create unique handles
    brands.forEach(brand => {
      const { vendor_handle, vendor_name } = brand;
      
      // Initialize or increment the count for this handle
      handleCounts[vendor_handle] = (handleCounts[vendor_handle] || 0) + 1;
      
      // Create a unique value based on the handle and its count
      const uniqueValue = handleCounts[vendor_handle] === 1 
        ? vendor_handle 
        : `${vendor_handle}-${handleCounts[vendor_handle]}`;
      
      result.push({
        value: uniqueValue,
        label: vendor_name
      });
    });
    
    return result;
  })();

  // Extract filter values from URL
  const categoryId = searchParams.get("category") || ""
  const colorsParam = searchParams.get("colors") || ""
  const selectedColors = colorsParam ? colorsParam.split(",") : []
  const brandsParam = searchParams.get("brands") || ""
  const selectedBrands = brandsParam ? brandsParam.split(",") : []
  
  // Extract price range values from URL
  const priceParam = searchParams.get("price") || ""
  const [minPrice, maxPrice] = priceParam 
    ? priceParam.split("-").map(p => parseInt(p, 10)) 
    : [0, 1000] // Default price range - adjust based on your product prices
  
  // Shop-wide price range - should ideally come from your API
  const PRICE_MIN = 0
  const PRICE_MAX = 1000

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      
      // If value is empty, remove the parameter
      if (value === "") {
        params.delete(name)
      } else {
        params.set(name, value)
      }

      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      <div className="flex flex-col gap-6">
        <Text className="txt-compact-medium-plus text-ui-fg-base">Filters</Text>
        
        {/* <SortProducts 
          sortBy={sortBy} 
          setQueryParams={setQueryParams} 
          data-testid={`${dataTestId}-sort`} 
        /> */}
        
        <CategoryFilter 
        categories={formattedCategories} 
        categoryId={categoryId} 
        setQueryParams={setQueryParams} 
        parents={parents}  
        categoryChildren={categoryChildren} 
        data-testid={`${dataTestId}-category`} 
      />
        <BrandFilter 
          brands={formattedBrands} 
          selectedBrands={selectedBrands} 
          setQueryParams={setQueryParams} 
          data-testid={`${dataTestId}-brand`} 
        />
        
        <ColorFilter 
          collection={products} 
          selectedColors={selectedColors} 
          setQueryParams={setQueryParams} 
          data-testid={`${dataTestId}-color`} 
        />
        
        <PriceFilter
          min={PRICE_MIN}
          max={PRICE_MAX}
          currentMin={minPrice}
          currentMax={maxPrice}
          setQueryParams={setQueryParams}
          data-testid={`${dataTestId}-price`}
        />
      </div>
    </div>
  )
}

export default RefinementList