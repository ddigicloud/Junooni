// src/modules/vendorCreator/templates/index.tsx
import CreatorStorePage from '../components/CreatorStorePage'

export default function VendorTemplate({ 
  vendor, 
  region 
}: { 
  vendor: any, 
  region: any 
}) {
  return (
    <div>
      <CreatorStorePage 
        vendor={vendor} 
        region={region} 
      />
    </div>
  )
}