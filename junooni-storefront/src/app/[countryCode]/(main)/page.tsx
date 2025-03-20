import { Metadata } from "next"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import HomeCategories from "@modules/home/components/HomeCategories"
import VendorCreator from "@modules/home/components/vendorCreator"
import CollectionBanner from "@modules/home/components/CollectionBanner"
import Bestsellers from "@modules/home/components/BestSellers"
import Features from "@modules/home/components/Features"
import CreatorInstagram from "@modules/home/components/CreatorInstagram"
import FanContent from "@modules/home/components/FanContent"
import NewsLetter from "@modules/home/components/NewsLetter"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"


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

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title, *metadata",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      
          <Hero />
          <div className="flex flex-col min-h-screen bg-white">
            <main className="flex-grow">
              <VendorCreator />
              <div className="pt-12">
                <ul className="flex flex-col gap-x-6">
                  <FeaturedProducts collections={collections} region={region} />
                </ul>
              </div>

              <HomeCategories />
              <CollectionBanner />

              <div className="pt-12">
                <ul className="flex flex-col gap-x-6">
                  <Bestsellers collections={collections} region={region} />
                </ul>
              </div>

              <Features />
              <CreatorInstagram />
              <FanContent />
              <NewsLetter />
            </main>
          </div>
       
    </>
  )
}
