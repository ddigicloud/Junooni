"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { HttpTypes } from "@medusajs/types"

import SortProducts, { SortOptions } from "./sort-products"
import CategoryFilter from "@modules/store/components/category-filter"
import VendorFilter from "@modules/store/components/vendor-filter"
import ColorFilter from "@modules/store/components/color-filter"
import PriceFilter from "@modules/store/components/price-filter"
import { Text } from "@medusajs/ui"

type Category = {
  id: string;
  name: string;
  handle: string;
  parent_category_id?: string;
  category_children?: Category[];
  mpath?: string;
}

type Vendor = {
  id: string;
  name: string;
  handle: string;
}

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  'data-testid'?: string
  categories?: Category[]
  vendors?: Vendor[]
  products?: HttpTypes.StoreProduct[]
}

const RefinementList = ({ 
  sortBy,
  categories = [],
  vendors = [],
  products,
  'data-testid': dataTestId 
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Flatten categories function
  const flattenCategories = (categoryList: Category[]): { value: string; label: string }[] => {
    const result: { value: string; label: string }[] = [
      { value: "", label: "All Categories" }
    ];
    
    const processedCategories = new Set<string>();
    
    const processCategory = (category: Category, level: number = 0) => {
      if (processedCategories.has(category.id)) {
        return;
      }
      
      processedCategories.add(category.id);
      
      const indent = "—".repeat(level);
      
      result.push({
        value: category.handle,
        label: `${indent} ${category.name}`
      });
      
      if (category.category_children && category.category_children.length > 0) {
        category.category_children.forEach(child => {
          processCategory(child, level + 1);
        });
      }
    };
    
    categoryList.forEach(category => {
      processCategory(category);
    });
    
    return result;
  };

  const formattedCategories = flattenCategories(categories);

  // Format vendors for display
  const formattedVendors = (() => {
    const result = [{ value: "", label: "All Vendors" }];
    
    const uniqueVendors = new Map<string, Vendor>();
    
    vendors.forEach(vendor => {
      if (!uniqueVendors.has(vendor.id)) {
        uniqueVendors.set(vendor.id, vendor);
      }
    });
    
    uniqueVendors.forEach(vendor => {
      result.push({
        value: vendor.name,
        label: vendor.name
      });
    });
    
    return result;
  })();

  const categoryHandle = searchParams.get("category") || ""
  const colorsParam = searchParams.get("colors") || ""
  const selectedColors = colorsParam ? colorsParam.split(",") : []
  const vendorsParam = searchParams.get("vendors") || ""
  const selectedVendors = vendorsParam ? vendorsParam.split(",") : []
  
  const priceParam = searchParams.get("price") || ""
  const [minPrice, maxPrice] = priceParam 
    ? priceParam.split("-").map(p => parseInt(p, 10)) 
    : [0, 1000]
  
  const PRICE_MIN = 0
  const PRICE_MAX = 1000

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      
      if (value === "") {
        params.delete(name)
      } else {
        if (name === "vendors" || name === "colors") {
          const currentValues = params.get(name)?.split(",") || []
          if (value.includes(",")) {
            params.set(name, value)
          } else {
            if (currentValues.includes(value)) {
              const newValues = currentValues.filter(v => v !== value)
              if (newValues.length > 0) {
                params.set(name, newValues.join(","))
              } else {
                params.delete(name)
              }
            } else {
              params.set(name, [...currentValues, value].join(","))
            }
          }
        } else {
          params.set(name, value)
        }
      }

      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`, { scroll: false })
  }

  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      <div className="flex flex-col gap-6">
        <Text className="txt-compact-medium-plus text-ui-fg-base">Filters</Text>
        
        <SortProducts 
          sortBy={sortBy} 
          setQueryParams={setQueryParams} 
          data-testid={`${dataTestId}-sort`} 
        />
        
        <CategoryFilter 
          categories={formattedCategories} 
          categoryId={categoryHandle} 
          setQueryParams={setQueryParams} 
          data-testid={`${dataTestId}-category`} 
        />
        
        <VendorFilter 
          vendors={formattedVendors}
          selectedVendors={selectedVendors}
          setQueryParams={setQueryParams} 
          data-testid={`${dataTestId}-vendor`}
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