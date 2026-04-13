'use client'

import React from 'react'
import Image from 'next/image'
import collectionbanner from '@assets/collectionbanner.png'
import collectionbannermobile from '@assets/collectionbannermobile.png'

const CollectionBanner = () => {
  return (
    <section className="bg-white">
      <div className="container max-w-full">
        <div className="relative overflow-hidden">
          <div className="md:aspect-[21/9] aspect-[3/4] bg-gray-800">
            <div className="absolute inset-0 z-0 w-full h-full">

              {/* Mobile image — hidden on md+ */}
              <Image
                src={collectionbannermobile}
                alt="Collection Banner"
                fill
                className="object-cover w-full h-full md:hidden"
                style={{ objectPosition: 'center center' }}
                priority
              />

              {/* Desktop image — hidden below md */}
              <Image
                src={collectionbanner}
                alt="Collection Banner"
                fill
                className="hidden object-cover w-full h-full md:block"
                style={{ objectPosition: 'center center' }}
                priority
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 "></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CollectionBanner