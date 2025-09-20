import { assets } from '@assets/assets';
import Image from "next/image"
import headerbanner from '@assets/header-banner.png';
import Junoonilogo from '@assets/JUNOONI_logo.ico';

const Hero = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden border-b border-ui-border-base">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <Image 
          src={headerbanner} 
          alt="Header Banner" 
          className="object-cover w-full h-full object-right" 
          priority 
          fill 
        />
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      {/* Content positioned on left side */}
      <div className="relative z-10 flex items-center w-full h-full">
        <div className="max-w-7xl mx-auto px-4 mt-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Junooni Logo */}
            {/* <div className="mb-6 sm:mb-2">
              <div className="w-16 h-16 sm:w-16 sm:h-16 bg-[#e65100] rounded-2xl mt-4 flex items-center justify-center shadow-lg">
                <Image 
                  src={Junoonilogo} 
                  alt="Junooni Logo" 
                  width={40}
                  height={40}
                  className="w-14 h-14 sm:w-10 sm:h-10"
                />
              </div>
            </div> */}

            {/* Main Heading */}
            <h1 className="mb-6 sm:mb-0 sm:mt-0 pt-12 sm:pt-0">
              <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-2">
                Behind the
              </span>
              <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-white">Junooni.</span>
                <span className="text-[#e65100]">#BTJ</span>
              </span>
            </h1>

            {/* Descriptive Text */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-10 max-w-lg leading-relaxed">
              Uncover the stories behind every drop- 
              apparel, prints, tech & keepsakes.
            </p>

            {/* CTA Button */}
            <div className="mb-8">
              <a 
                href="/store" 
                className="inline-block bg-[#e65100] hover:bg-orange text-white px-8 py-4 sm:px-10 sm:py-5 text-lg sm:text-xl font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Collection shop
              </a>
            </div>

            {/* Additional Info - Mobile Optimized */}
            <div className="block sm:hidden">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
                <p className="text-white font-semibold text-sm">Limited Edition</p>
                <p className="text-white/80 text-xs">Exclusive drops available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Additional Info - Positioned Bottom Right */}
        <div className="absolute hidden sm:block bottom-8 right-8 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#e65100] rounded-lg flex items-center justify-center">
              <Image 
                src={Junoonilogo} 
                alt="Junooni" 
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Official Drop</p>
              <p className="text-gray-600 text-xs">Limited collection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;