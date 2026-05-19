// // src/modules/vendorCreator/templates/index.tsx
// import CreatorStorePage from '../components/CreatorStorePage'

// export default function VendorTemplate({ 
//   vendor, 
//   region 
// }: { 
//   vendor: any, 
//   region: any 
// }) {
//   return (
//     <div>
//       <CreatorStorePage 
//         vendor={vendor} 
//         region={region} 
//       />
//     </div>
//   )
// }

// src/modules/vendorCreator/templates/index.tsx
import CreatorStorePage from '../components/CreatorStorePage'

export default function VendorTemplate({
  vendor,
  region,
  vendorProducts = [],
  reviewsMap = {},
}: {
  vendor: any
  region: any
  vendorProducts?: any[]
  reviewsMap?: Record<string, { averageRating: number; reviewCount: number }>
}) {
  return (
    <div>
      <CreatorStorePage
        vendor={vendor}
        region={region}
        vendorProducts={vendorProducts}
        reviewsMap={reviewsMap}
      />
    </div>
  )
}