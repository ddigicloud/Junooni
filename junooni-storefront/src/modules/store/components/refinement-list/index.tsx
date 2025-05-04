"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { HttpTypes } from "@medusajs/types"

import SortProducts, { SortOptions } from "./sort-products"
import CategoryFilter from "@modules/store/components/category-filter"
import CreatorFilter from "@modules/store/components/creator-filter"
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

type Creator = {
  id: string;
  name: string;
  handle: string;
}

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  'data-testid'?: string
  categories?: Category[]
  creators?: Creator[]
  products?: HttpTypes.StoreProduct[]
}

const RefinementList = ({ 
  sortBy,
  categories = [],
  creators = [],
  products,
  'data-testid': dataTestId 
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  console.log(products)
  
  // Function to flatten nested categories with proper hierarchy
  const flattenCategories = (categoryList: Category[]): { value: string; label: string }[] => {
    const result: { value: string; label: string }[] = [
      { value: "", label: "All Categories" }
    ];
    
    // Keep track of processed categories to avoid duplicates
    const processedCategories = new Set<string>();
    
    const processCategory = (category: Category, level: number = 0) => {
      // Skip if we've already processed this category
      if (processedCategories.has(category.id)) {
        return;
      }
      
      processedCategories.add(category.id);
      
      // Add spaces for visual indentation in UI
      const indent = "—".repeat(level);
      
      // Use category handle as the value
      result.push({
        value: category.handle,
        label: `${indent} ${category.name}`
      });
      
      // Process child categories recursively
      if (category.category_children && category.category_children.length > 0) {
        category.category_children.forEach(child => {
          processCategory(child, level + 1);
        });
      }
    };
    
    // Process all categories
    categoryList.forEach(category => {
      processCategory(category);
    });
    
    return result;
  };

  // Format categories with handle as value and name as label
  const formattedCategories = flattenCategories(categories);

  // Process creators to use vendor IDs for filtering
  const formattedCreators = (() => {
    const result = [{ value: "", label: "All Creators" }];
    
    // Ensure unique creators based on ID
    const uniqueCreators = new Map<string, Creator>();
    
    creators.forEach(creator => {
      if (!uniqueCreators.has(creator.id)) {
        uniqueCreators.set(creator.id, creator);
      }
    });
    
    // Add each unique creator with ID as value
    uniqueCreators.forEach(creator => {
      result.push({
        value: creator.id,
        label: creator.name
      });
    });
    
    return result;
  })();

  // Extract filter values from URL
  const categoryHandle = searchParams.get("category") || ""
  const colorsParam = searchParams.get("colors") || ""
  const selectedColors = colorsParam ? colorsParam.split(",") : []
  const creatorsParam = searchParams.get("creators") || ""
  const selectedCreators = creatorsParam ? creatorsParam.split(",") : []
  
  // Extract price range values from URL
  const priceParam = searchParams.get("price") || ""
  const [minPrice, maxPrice] = priceParam 
    ? priceParam.split("-").map(p => parseInt(p, 10)) 
    : [0, 1000]
  
  // Shop-wide price range
  const PRICE_MIN = 0
  const PRICE_MAX = 1000

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      
      // If value is empty, remove the parameter
      if (value === "") {
        params.delete(name);
      } else {
        // For multi-select filters (creators, colors)
        params.set(name, value);
      }

      return params.toString();
    },
    [searchParams]
  );

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value);
    router.push(`${pathname}?${query}`, { scroll: false });
  };

  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      <div className="flex flex-col gap-6">
        <Text className="txt-compact-medium-plus text-ui-fg-base">Filters</Text>
        
        <SortProducts 
          sortBy={sortBy} 
          setQueryParams={setQueryParams} 
          data-testid={`${dataTestId}-sort`} 
        />
        
        {formattedCategories.length > 1 && (
          <CategoryFilter 
            categories={formattedCategories} 
            categoryId={categoryHandle} 
            setQueryParams={setQueryParams} 
            data-testid={`${dataTestId}-category`} 
          />
        )}
        
        {formattedCreators.length > 1 && (
          <CreatorFilter 
            creators={formattedCreators} 
            selectedCreators={selectedCreators} 
            setQueryParams={setQueryParams} 
            data-testid={`${dataTestId}-creator`} 
          />
        )}
        
        <ColorFilter 
          collection={products} 
          selectedColors={selectedColors} 
          setQueryParams={setQueryParams} 
          data-testid={`${dataTestId}-color`} 
        />
        
        <PriceFilter
          min={PRICE_MIN}
          max={PRICE_MAX}
          currentMin={minPrice || PRICE_MIN}
          currentMax={maxPrice || PRICE_MAX}
          setQueryParams={setQueryParams}
          data-testid={`${dataTestId}-price`}
        />
      </div>
    </div>
  )
}

export default RefinementList