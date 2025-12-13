// import { HeaderClient } from './Component.client'
// import { getCachedGlobal } from '@/utilities/getGlobals'
// import React from 'react'

// import type { Header } from '@/payload-types'

// export async function Header() {
//   const headerData: Header = await getCachedGlobal('header', 1)()

//   return <HeaderClient data={headerData} />
// }


import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Header as HeaderType } from '@/payload-types'

// Fetch categories function
async function fetchCategories() {
  try {
    //console.log('🔍 Header Component: Fetching categories...')
    const payload = await getPayload({ config: configPromise })
    
    // Fetch all categories
    const categoriesResult = await payload.find({
      collection: 'categories',
      limit: 100,
      depth: 2,
    })
    
    //console.log('✅ Header Component: Categories fetched:', categoriesResult.totalDocs)
    
    if (!categoriesResult.docs || categoriesResult.docs.length === 0) {
      //console.warn('⚠️ No categories found in database')
      return []
    }
    
    // Get product count for each category
    const categoriesWithProducts = await Promise.all(
      categoriesResult.docs.map(async (category) => {
        let productCount = 0
        
        try {
          const products = await payload.find({
            collection: 'blank-products',
            where: {
              category: {
                equals: category.id,
              },
            },
            limit: 0,
          })
          productCount = products.totalDocs
        } catch (error) {
          //console.warn(`⚠️ Could not query products for category: ${category.title}`)
          productCount = 0
        }
        
        return {
          id: category.id,
          title: category.title,
          description: category.description || '',
          slug: category.slug,
          image: category.image,
          productCount: productCount,
          parent: category.parent || null,
          children: category.children || [],
          featuredCategory: category.featuredCategory || false,  // ADD THIS LINE
        }
      })
    )
    
    //console.log('✅ Categories with product counts prepared:', categoriesWithProducts.length)
    //console.log('📦 Sample category:', categoriesWithProducts[0])
    
    return categoriesWithProducts
  } catch (error) {
    //console.error('❌ Error fetching categories in Header:', error)
    return []
  }
}

export async function Header() {
  const headerData: HeaderType = await getCachedGlobal('header', 1)()
  
  // Fetch categories
  const categories = await fetchCategories()
  
  //console.log('✅ Header Component: Passing', categories.length, 'categories to HeaderClient')

  return <HeaderClient data={headerData} categories={categories} />
}