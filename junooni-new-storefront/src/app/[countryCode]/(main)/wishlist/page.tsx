import React from 'react'
import { getRegion } from '@lib/data/regions'
import Wishlist from '@modules/wishlists/components/wishlist'
import { listProducts } from '@lib/data/products'

const WishlistPage = async (props: {
  params: Promise<{ countryCode: string }>
}) => {

  const params = await props.params
  
    const { countryCode } = params
  
    const region = await getRegion(countryCode)

    
    // const products = await listProducts({
    //   queryParams: {
    //   fields: "*vendor,*tags,*metadata,*variants.calculated_price",
    // },
    // regionId: region.id
    // })

    // const productData = products.response.products

  return (
    <div>
      <Wishlist region={region} />
    </div>
  )
}

export default WishlistPage
