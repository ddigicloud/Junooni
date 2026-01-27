import React from 'react'
import { Metadata } from 'next'
import { getRegion } from '@lib/data/regions'
import Wishlist from '@modules/wishlists/components/wishlist'

// Add metadata export
export const metadata: Metadata = {
  title: 'My Wishlist | Junooni Store',
  description: 'View and manage your saved favorite items. Shop your wishlist and turn your favorite creator merchandise into reality.',
  openGraph: {
    title: 'My Wishlist | Junooni Store',
    description: 'View and manage your saved favorite items from Junooni Store',
    type: 'website',
  },
}

const WishlistPage = async (props: {
  params: Promise<{ countryCode: string }>
}) => {
  const params = await props.params
  const { countryCode } = params
  const region = await getRegion(countryCode)

  return (
    <div>
      <Wishlist region={region} />
    </div>
  )
}

export default WishlistPage