import React from 'react'

const CreatorInstagram = ({vendorsList}) => {

console.log(vendorsList)

  
  

  return (
    <section className="py-16 bg-orange-50">
    <div className="container px-4 mx-auto">
      <h2 className="mb-10 text-3xl font-bold text-center">Creator Spotlight</h2>
      
      <div className="flex flex-col items-center overflow-hidden bg-white shadow-lg md:flex-row rounded-xl">
        <div className="md:w-2/5">
          <div className="bg-gray-200 aspect-square">
            <img 
              src="/api/placeholder/600/600" 
              alt="Creator spotlight" 
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        <div className="p-6 md:w-3/5 md:p-10">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-orange-100 rounded-full text-orange-primary">
              FEATURED CREATOR
            </span>
          </div>
          <h3 className="mb-4 text-2xl font-bold md:text-3xl">Creator Name</h3>
          <p className="mb-6 text-lg text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus.
          </p>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
              <span className="text-gray-600">1.2M followers</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="text-gray-600">950K followers</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-3 text-center bg-gray-100 rounded-lg">
                <img src={`/api/placeholder/${150}/${150}`} alt={`Item ${item}`} className="object-cover w-full mb-2 rounded aspect-square" />
                <p className="text-sm font-medium">Item {item}</p>
                <p className="text-xs text-gray-500">$49.00</p>
              </div>
            ))}
          </div>
          <a 
            href="#" 
            className="inline-block bg-[#e65100] text-white px-8 py-3 font-medium rounded-md hover:bg-[#d84315] transition"
          >
            Shop Collection
          </a>
        </div>
      </div>
    </div>
  </section>
  
  )
}

export default CreatorInstagram
