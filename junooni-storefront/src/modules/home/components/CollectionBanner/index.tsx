import React from 'react'
import { assets } from '@assets/assets'

const CollectionBanner = () => {
  return (
    <section className="bg-white ">
    <div className="container max-w-full">
      <div className="relative overflow-hidden ">
        <div className="md:aspect-[21/9] aspect-[3/4] bg-gray-800">
          <div className="absolute inset-0 z-0 w-full h-full">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="object-cover w-full h-full"
                  >
                    <source src={assets.video3} type="video/mp4" />
                  </video>
                  </div>

        </div>
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16">
          <div className="max-w-lg">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-white rounded-full bg-orange-primary">
              EXCLUSIVE COLLABORATION
            </span>
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Creator x Creator Collection</h2>
            <p className="mb-6 text-lg text-white">Two of your favorite creators team up for an unprecedented limited merchandise collection.</p>
            <a 
              href="#" 
              className="inline-block px-8 py-3 font-medium text-black transition bg-white rounded-md hover:bg-gray-100"
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
