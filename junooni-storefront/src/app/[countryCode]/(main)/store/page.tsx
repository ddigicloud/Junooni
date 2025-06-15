// import { Metadata } from "next"
// import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
// import StoreTemplate from "@modules/store/templates"

// export const metadata: Metadata = {
//   title: "Store",
//   description: "Explore all of our products.",
// }

// type Params = {
//   searchParams: Promise<{
//     sortBy?: SortOptions
//     page?: string
//     category?: string
//     vendors?: string  // Updated from creators to vendors
//     colors?: string
//     price?: string
//   }>
//   params: Promise<{
//     countryCode: string
//   }>
// }

// export default async function StorePage(props: Params) {
//   const params = await props.params;
//   const searchParams = await props.searchParams;
//   const { sortBy, page, category, vendors, colors, price } = searchParams  // Updated to vendors

//   return (
//     <StoreTemplate
//       sortBy={sortBy}
//       page={page}
//       countryCode={params.countryCode}
//       categoryHandle={category}
//       vendors={vendors}  // Updated to vendors
//       colors={colors}
//       price={price}
//     />
//   )
// }

import { Metadata } from "next"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

// ✅ CRITICAL: Force dynamic rendering for searchParams to work
export const dynamic = 'force-dynamic'

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    category?: string
    categories?: string // ✅ NEW: Added categories parameter
    vendors?: string
    colors?: string
    price?: string
    collections?: string
    collection_id?: string
    category_id?: string
    id?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  console.log('\n🏪 STORE PAGE - URL PARAMETER PARSING:')
  console.log('==========================================')
  console.log('- Raw searchParams:', searchParams)
  console.log('- Country code:', params.countryCode)
  
  // ✅ CRITICAL FIX: Parse price string into minPrice/maxPrice numbers
  let minPrice: number | undefined
  let maxPrice: number | undefined
  
  if (searchParams.price) {
    console.log('🎯 Parsing price parameter:', searchParams.price)
    const priceRange = searchParams.price.split('-')
    
    if (priceRange.length === 2) {
      const min = parseInt(priceRange[0], 10)
      const max = parseInt(priceRange[1], 10)
      
      if (!isNaN(min) && !isNaN(max)) {
        minPrice = min
        maxPrice = max
        console.log('✅ Price parsed successfully:', { minPrice, maxPrice })
      } else {
        console.log('❌ Failed to parse price numbers:', { priceRange, min, max })
      }
    } else {
      console.log('❌ Price not in expected format (min-max):', searchParams.price)
    }
  } else {
    console.log('❌ No price parameter found')
  }
  
  // ✅ CRITICAL FIX: Parse comma-separated strings into arrays
  const vendorsArray = searchParams.vendors 
    ? searchParams.vendors.split(',').filter(Boolean)
    : undefined
    
  const colorsArray = searchParams.colors 
    ? searchParams.colors.split(',').filter(Boolean)
    : undefined
    
  const collectionsArray = searchParams.collections 
    ? searchParams.collections.split(',').filter(Boolean)
    : undefined

  // ✅ NEW: Parse categories parameter (similar to CollectionTemplate categoryHandle parsing)
  const categoriesArray = searchParams.categories 
    ? searchParams.categories.split(',').map(c => c.trim()).filter(Boolean)
    : undefined
    
  // ✅ Parse page number properly
  const pageNumber = searchParams.page ? parseInt(searchParams.page, 10) : undefined
  
  // ✅ Parse specific product IDs
  const productsIds = searchParams.id?.split(',')
  
  console.log('\n🎯 PARSED VALUES FOR STORETEMPLATE:')
  console.log('- vendorsArray:', vendorsArray)
  console.log('- colorsArray:', colorsArray)
  console.log('- collectionsArray:', collectionsArray)
  console.log('- categoriesArray:', categoriesArray) // ✅ NEW: Log categories
  console.log('- minPrice:', minPrice, typeof minPrice)
  console.log('- maxPrice:', maxPrice, typeof maxPrice)
  console.log('- pageNumber:', pageNumber)
  console.log('- sortBy:', searchParams.sortBy)
  console.log('- category:', searchParams.category)
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    console.log('🎉 PRICE FILTERING ENABLED!')
    console.log(`   Range: ${minPrice || 0} - ${maxPrice || '∞'}`)
  } else {
    console.log('⚠️ No price filtering (price parameter missing or invalid)')
  }

  // ✅ NEW: Log category filtering status
  if (categoriesArray && categoriesArray.length > 0) {
    console.log('🎉 CATEGORY FILTERING ENABLED!')
    console.log(`   Categories: ${categoriesArray.join(', ')}`)
  } else {
    console.log('⚠️ No category filtering (categories parameter missing or empty)')
  }
  
  console.log('==========================================')

  return (
    <StoreTemplate
      sortBy={searchParams.sortBy}
      page={pageNumber}                    // ✅ Number instead of string
      countryCode={params.countryCode}
      categoryId={searchParams.category_id}  // ✅ Use categoryId for collection filtering
      collectionId={searchParams.collection_id}  // ✅ For single collection
      productsIds={productsIds}            // ✅ Array of product IDs
      vendors={vendorsArray}               // ✅ Array instead of string
      colors={colorsArray}                 // ✅ Array instead of string  
      collections={collectionsArray}       // ✅ Array instead of string
      categories={categoriesArray}         // ✅ NEW: Pass categories array to StoreTemplate
      minPrice={minPrice}                  // ✅ Number instead of string
      maxPrice={maxPrice}                  // ✅ Number instead of string
    />
  )
}