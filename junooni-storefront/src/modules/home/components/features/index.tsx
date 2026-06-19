import React from 'react'
import india from '@assets/india.png'
import check from '@assets/check.png'
import diamond from '@assets/diamond.png'
import love from '@assets/love.png'
import Image from "next/image"

const Features = () => {
  const features = [
    { 
      title: "India's #1",
      subtitle: 'Marketplace For Merch',
      imageUrl: india // Replace with your image path
    },
    { 
      title: 'Authentic Merchandise',
      subtitle: 'Direct from creators, verified authenticity',
      imageUrl: check // Replace with your image path
    },
    { 
      title: 'Limited Editions',
      subtitle: 'Exclusive items in limited quantities',
      imageUrl: diamond // Replace with your image path
    },
    { 
      title: 'Lovdlens',
      subtitle: 'Fars',
      imageUrl: love // Replace with your image path
    }
  ];

  return (
    <section className="relative py-0 overflow-hidden bg-white">
      <div className="sm:px-4 md:px-4 px-2 mx-auto w-full">
        {/* Features grid */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center"
            >
              {/* Icon Image */}
              <div className="mb-6">
               <Image 
                  src={feature.imageUrl} 
                  alt={feature.title}
                  width={128}
                  height={128}
                  className="object-contain"
                />
              </div>
              
              {/* Content */}
              <h3 className="mb-2 text-2xl font-bold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-base text-gray-700 leading-relaxed max-w-xs">
                {feature.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features