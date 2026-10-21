import { retriveVendors } from "@lib/data/vendors"
import FeaturedCreatorsStrip from "./index"

// Skeleton shown while vendor data is loading
export function FeaturedCreatorsSkeleton() {
  return (
    <div className="w-full bg-[#FFF7F4] border-b border-orange-100 px-4 py-5 small:px-6 animate-pulse">
      <div className="content-container">
        <div className="h-3 w-24 bg-orange-100 rounded mb-2" />
        <div className="h-5 w-64 bg-gray-200 rounded mb-1" />
        <div className="h-3 w-48 bg-gray-100 rounded mb-4" />
        <div className="flex gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
              <div
                className="w-16 h-16 rounded-full bg-gray-200"
                style={{ animationDelay: `${i * 60}ms` }}
              />
              <div className="h-2.5 w-14 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Server component — fetches and passes data to the client carousel
export default async function FeaturedCreatorsFetcher() {
  const vendors = await retriveVendors()
  if (!vendors?.length) return null
  return <FeaturedCreatorsStrip creators={vendors} />
}