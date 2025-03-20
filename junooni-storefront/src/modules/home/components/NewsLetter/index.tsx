import React from 'react'

const NewsLetter = () => {
  return (
    <section className="py-16 text-white bg-black">
          <div className="container px-4 mx-auto text-center">
            <h2 className="mb-4 text-3xl font-bold">Never Miss a Drop</h2>
            <p className="max-w-md mx-auto mb-8 text-gray-300">
              Subscribe to get notified about new creators, exclusive merchandise, and limited-time drops.
            </p>
            <form className="flex flex-col max-w-md gap-3 mx-auto md:flex-row">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e65100] text-white"
              />
              <button 
                type="submit" 
                className="px-6 py-3 font-medium text-white transition bg-purple-600 rounded-md hover:bg-purple-700"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
  )
}

export default NewsLetter
