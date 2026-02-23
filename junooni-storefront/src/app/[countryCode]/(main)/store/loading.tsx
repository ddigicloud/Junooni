import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

export default function Loading() {
  return (
    <div className="flex flex-col px-0 py-0 small:py-6 small:px-6 small:flex-row small:items-start content-container">
      {/* Sidebar placeholder */}
      <div className="hidden w-64 md:block shrink-0" />
      <div className="w-full px-0 ml-0 md:ml-4">
        <div className="px-2 mt-0 mb-0 small:mt-12">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="mt-4 mb-6" />
        <SkeletonProductGrid />
      </div>
    </div>
  )
}