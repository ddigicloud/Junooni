// import { Metadata } from "next"
// import { listCollections } from "@lib/data/collections"
// import { getRegion } from "@lib/data/regions"
// import HomeCategories from "@modules/home/components/HomeCategories"
// import CollectionBanner from "@modules/home/components/CollectionBanner"
// import Bestsellers from "@modules/home/components/BestSellers"
// import Features from "@modules/home/components/Features"
// import CreatorInstagram from "@modules/home/components/CreatorInstagram"
// import FanContent from "@modules/home/components/FanContent"
// import NewsLetter from "@modules/home/components/NewsLetter"
// import FeaturedProducts from "@modules/home/components/featured-products"
// import Hero from "@modules/home/components/hero"
// import VendorList from "@modules/home/components/VendorList"
// import { retriveVendors } from "@lib/data/vendors"


// export const metadata: Metadata = {
//   title: "JUNOONI | HOME",
//   description:
//     "A performant frontend ecommerce starter template with Next.js 14 and Medusa.",
// }

// export default async function Home(props: {
//   params: Promise<{ countryCode: string }>
// }) {
//   const params = await props.params

//   const { countryCode } = params

//   const region = await getRegion(countryCode)

//   const { collections } = await listCollections({
//     fields: "id, handle, title, *metadata",
//   })

//   if (!collections || !region) {
//     return null
//   }


//   const vendorsList  = await retriveVendors()



//   return (
//     <>
      
//           <Hero />
//           <div className="flex flex-col min-h-screen bg-white">
//             <main className="flex-grow">
//               <VendorList />
//               <div className="pt-12">
//                 <ul className="flex flex-col gap-x-6">
//                   <FeaturedProducts collections={collections} region={region} />
//                 </ul>
//               </div>

//               <HomeCategories />
//               <CollectionBanner />

//               <div className="pt-12">
//                 <ul className="flex flex-col gap-x-6">
//                   <Bestsellers collections={collections} region={region} />
//                 </ul>
//               </div>

//               <Features />
//               <CreatorInstagram vendorsList={vendorsList} />
//               <FanContent />
//               <NewsLetter />
//             </main>
//           </div>
       
//     </>
//   )
// }

import { Metadata } from "next"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { retriveVendors } from "@lib/data/vendors"
import { Suspense } from "react"

// Fast components - load immediately  
import Hero from "@modules/home/components/hero"
import Features from "@modules/home/components/Features"
import FanContent from "@modules/home/components/FanContent"
import NewsLetter from "@modules/home/components/NewsLetter"
import VendorList from "@modules/home/components/VendorList"
import CreatorInstagram from "@modules/home/components/CreatorInstagram"
import HomeCategories from "@modules/home/components/HomeCategories"
import CollectionBanner from "@modules/home/components/CollectionBanner"

// Heavy components - product sections with API calls
import Bestsellers from "@modules/home/components/BestSellers"
import FeaturedProducts from "@modules/home/components/featured-products"

export const metadata: Metadata = {
  title: "JUNOONI | HOME",
  description:
    "A performant frontend ecommerce starter template with Next.js 14 and Medusa.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const [region, { collections }, vendorsList] = await Promise.all([
    getRegion(countryCode),
    listCollections({
      fields: "id, handle, title, *metadata",
    }),
    retriveVendors()
  ])

  if (!collections || !region) {
    return null
  }

  return (
    <>
      {/* TIER 1: Critical above-the-fold content */}
      <Hero />
      
      <div className="flex flex-col min-h-screen bg-white">
        <main className="flex-grow">
          {/* 1. VendorList - Fast component, loads immediately */}
          <VendorList />
          
          {/* 2. FeaturedProducts - Heavy component (API calls), wrapped in Suspense */}
          <Suspense fallback={<ProductsSkeleton title="Featured Products" />}>
            <div className="pt-12">
              <ul className="flex flex-col gap-x-6">
                <FeaturedProducts collections={collections} region={region} />
              </ul>
            </div>
          </Suspense>

          {/* 3. HomeCategories - Fast component, loads immediately */}
          <HomeCategories />

          {/* 4. CollectionBanner - Fast component, loads immediately */}
          <CollectionBanner />

          <Bestsellers collections={collections} region={region} />
            
          {/* 5. Bestsellers - Heavy component (API calls), wrapped in Suspense */}
          {/* <Suspense fallback={<ProductsSkeleton title="Bestsellers" />}>
            <div className="pt-12">
              <ul className="flex flex-col gap-x-6">
                <Bestsellers collections={collections} region={region} />
              </ul>
            </div>
          </Suspense> */}

          {/* 6-9. Fast components - All load immediately after heavy sections */}

          {/* 6. Features - Fast component, loads immediately */}
          <Features />
          
          {/* 7. CreatorInstagram - Fast component, loads immediately */}
          <CreatorInstagram vendorsList={vendorsList} />
          
          {/* 8. FanContent - Fast component, loads immediately */}
          <FanContent />
          
          {/* 9. NewsLetter - Fast component, loads immediately */}
          <NewsLetter />
        </main>
      </div>
    </>
  )
}

// Reusable skeleton components (Only for heavy components)
function ProductsSkeleton({ title }: { title: string }) {
  return (
    <div className="pt-12">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="w-48 h-8 mb-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex gap-6 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
              <div className="h-4 mb-2 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-center text-gray-500">
          Loading {title}...
        </div>
      </div>
    </div>
  )
}