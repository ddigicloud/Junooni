import React from 'react'

const FanContent = () => {
  return (
    <section className="py-16 bg-gray-50">
    <div className="container px-4 mx-auto">
      <h2 className="mb-4 text-3xl font-bold text-center">Fan Gallery</h2>
      <p className="max-w-xl mx-auto mb-10 text-center text-gray-600">
        See how other fans are styling their creator merchandise. Tag your photos with #Junooni to be featured.
      </p>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((img) => (
          <a href="#" key={img} className="relative block overflow-hidden group aspect-square">
            <img 
              src={`/api/placeholder/${300}/${300}`} 
              alt={`Fan content ${img}`} 
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black opacity-0 bg-opacity-30 group-hover:opacity-100">
              <div className="text-center text-white">
                <p className="font-medium">@username</p>
                <div className="flex items-center justify-center mt-2">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-sm">256</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
      <div className="mt-8 text-center">
        <a href="#" className="inline-block text-[#e65100] font-medium hover:underline">
          View More Fan Content
        </a>
      </div>
    </div>
  </section>
  )
}

export default FanContent
