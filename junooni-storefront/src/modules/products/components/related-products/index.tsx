import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // edit this function to define your related products logic
  const queryParams: HttpTypes.StoreProductParams = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (!products.length) {
    return null
  }

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col items-center mb-16 text-center">
        <span className="mb-6 text-gray-600 text-base-regular">
          Related products
        </span>
        <p className="max-w-lg text-2xl-regular text-ui-fg-base">
          You might also want to check out these products.
        </p>
      </div>

      <ul className="grid grid-cols-2 px-2 small:px-6 small:grid-cols-3 medium:grid-cols-4 gap-x-2 gap-y-4 small:gap-x-6 small:gap-y-8">
        {products.map((product) => (
          <li key={product.id}>
            <Product region={region} 
            product={product} reviewData={{ averageRating: 0, reviewCount: 0, isLoading: false }}/>
          </li>
        ))}
      </ul>
    </div>
  )
}
