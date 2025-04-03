import React from 'react'

const Features = () => {
  return (
    <section className="py-16 bg-white">
    <div className="container px-4 mx-auto">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {[
          { 
            title: 'Authentic Merchandise', 
            description: 'Direct from creators, verified authenticity',
            icon: (
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) 
          },
          { 
            title: 'Limited Editions', 
            description: 'Exclusive items in limited quantities',
            icon: (
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) 
          },
          { 
            title: 'Creator Support', 
            description: 'Your purchase directly supports creators',
            icon: (
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor" />
              </svg>
            ) 
          }
        ].map((feature, index) => (
          <div key={index} className="flex flex-col items-center p-6 text-center border rounded-lg">
            <div className="mb-4 text-orange-primary">
              {feature.icon}
            </div>
            <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  )
}

export default Features
