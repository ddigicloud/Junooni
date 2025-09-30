'use client'

import React from 'react'
import Image from 'next/image'
import { assets } from '@assets/assets'
import collectionbanner from '@assets/collectionbanner.png'

const CollectionBanner = () => {
  return (
    <section className="bg-white ">
      <div className="container max-w-full">
        <div className="relative overflow-hidden ">
          <div className="md:aspect-[21/9] aspect-[3/4] bg-gray-800">
            <div className="absolute inset-0 z-0 w-full h-full">
              <Image 
                src={collectionbanner}
                alt="Collection Banner"
                fill
                className="object-cover w-full h-full"
                style={{
                  objectPosition: '15% center', // Mobile: shifted left (20% from left edge)
                }}
                priority
              />
              {/* Override object position for desktop */}
              <style jsx>{`
                @media (min-width: 768px) {
                  img {
                    object-position: center center !important;
                  }
                }
              `}</style>
              {/* Dark overlay for better text visibility */}
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </div>
          </div>
          
          {/* Content positioned responsively */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 md:items-end sm:px-6 md:px-16">
            <div className="w-full max-w-lg text-center md:text-right">
              <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4 text-xs sm:text-sm font-semibold text-white rounded-full" style={{ backgroundColor: '#e65100' }}>
                EXCLUSIVE COLLABORATION
              </span>
              <h2 className="mb-3 text-2xl font-bold leading-tight text-white sm:mb-4 sm:text-3xl md:text-4xl">
                Creator x Creator Collection
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-white sm:mb-6 sm:text-base md:text-lg">
                Two of your favorite creators team up for an unprecedented limited merchandise collection.
              </p>
              <a 
                href="#" 
                className="inline-block px-6 py-2.5 sm:px-8 sm:py-3 text-sm sm:text-base font-medium text-white transition rounded-md hover:opacity-90 shadow-lg"
                style={{ backgroundColor: '#e65100' }}
              >
                Shop Collection
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CollectionBanner