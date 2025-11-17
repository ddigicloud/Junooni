// import React from 'react'

// const Features = () => {
//   const features = [
//     { 
//       title: 'Authentic Merchandise', 
//       description: 'Direct from creators, verified authenticity',
//       detail: 'Every product verified and shipped directly from creator partners',
//       icon: (
//         <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//           <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//       ),
//       gradient: 'from-green-400 to-emerald-600',
//       bgLight: 'bg-green-50',
//       iconBg: 'bg-gradient-to-br from-green-400 to-emerald-600'
//     },
//     { 
//       title: 'Limited Editions', 
//       description: 'Exclusive items in limited quantities',
//       detail: 'Get access to drops that won\'t be restocked',
//       icon: (
//         <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//           <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//       ),
//       gradient: 'from-purple-400 to-indigo-600',
//       bgLight: 'bg-purple-50',
//       iconBg: 'bg-gradient-to-br from-purple-400 to-indigo-600'
//     },
//     { 
//       title: 'Creator Support', 
//       description: 'Your purchase directly supports creators',
//       detail: '100% of profits go directly to your favorite creators',
//       icon: (
//         <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//           <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor" />
//         </svg>
//       ),
//       gradient: 'from-pink-400 to-red-600',
//       bgLight: 'bg-pink-50',
//       iconBg: 'bg-gradient-to-br from-pink-400 to-red-600'
//     }
//   ];

//   return (
//     <section className="relative py-12 overflow-hidden sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
//       {/* Background decoration */}
//       <div className="absolute inset-0 pointer-events-none">
//         <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 bg-orange-100 rounded-full w-72 h-72 blur-3xl opacity-20"></div>
//         <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 bg-purple-100 rounded-full w-96 h-96 blur-3xl opacity-20"></div>
//       </div>
      
//       <div className="container relative px-4 mx-auto">
//         {/* Section header */}
//         <div className="mb-12 text-center sm:mb-16">
//           <div className="inline-flex items-center justify-center px-4 py-1.5 mb-4 text-xs font-semibold text-orange-600 bg-orange-100 rounded-full">
//             WHY CHOOSE JUNOONI
//           </div>
//           <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
//             The Creator Marketplace
//             <span className="block mt-2 text-2xl text-transparent sm:text-3xl lg:text-4xl bg-gradient-to-r from-[#e65100] to-[#e65100] bg-clip-text">
//               You Can Trust
//             </span>
//           </h2>
//           <p className="max-w-2xl mx-auto text-base text-gray-600 sm:text-lg">
//             Join thousands of fans supporting their favorite creators while getting exclusive, authentic merchandise
//           </p>
//         </div>

//         {/* Features grid */}
//         <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
//           {features.map((feature, index) => (
//             <div 
//               key={index} 
//               className="relative group"
//             >
//               {/* Card */}
//               <div className="flex flex-col justify-center items-center h-full p-6 overflow-hidden transition-all duration-300 transform bg-white rounded-2xl sm:p-8 hover:shadow-2xl hover:-translate-y-1">
//                 {/* Hover gradient effect */}
//                 <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
//                 {/* Icon container */}
//                 <div className="flex justify-center mb-6">
//                   <div className={`inline-flex p-4 rounded-2xl ${feature.iconBg} text-white shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
//                     {feature.icon}
//                   </div>
//                   {/* Icon background decoration */}
//                   <div className={`absolute inset-0  rounded-2xl blur-2xl opacity-20 scale-150`}></div>
//                 </div>
                
//                 {/* Content */}
//                 <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors duration-300 sm:text-2xl group-hover:text-orange-600">
//                   {feature.title}
//                 </h3>
//                 <p className="mb-4 leading-relaxed text-gray-600">
//                   {feature.description}
//                 </p>
                
//                 {/* Additional detail - shows on hover for desktop */}
//                 <div className="transition-opacity duration-300">
//                   <div className="h-0.5 w-12 bg-gradient-to-r from-orange-400 to-pink-400 mb-3"></div>
//                   <p className="text-sm text-gray-500">
//                     {feature.detail}
//                   </p>
//                 </div>
                
//                 {/* Index number decoration */}
//                 <div className="absolute text-6xl font-bold text-white select-none top-6 right-6">
//                   {String(index + 1).padStart(2, '0')}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }

// export default Features

import React from 'react'
import india from '@assets/india.png'
import check from '@assets/check.png'
import diamond from '@assets/diamond.png'
import love from '@assets/love.png'

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
                <img 
                  src={feature.imageUrl.src} 
                  alt={feature.title}
                  className="w-32 h-32 object-contain"
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