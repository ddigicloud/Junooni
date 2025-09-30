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
          className="object-cover object-right w-full h-full" 
          priority 
          fill 
        />
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      {/* Content positioned on left side */}
      <div className="relative z-10 flex items-center w-full h-full">
        <div className="w-full px-4 mx-auto mt-4 max-w-7xl sm:px-6 lg:px-8">
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
            <h1 className="pt-12 mb-6 sm:mb-0 sm:mt-0 sm:pt-0">
              <span className="block mb-2 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Behind the
              </span>
              <span className="block text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="text-white">Junooni.</span>
                <span className="text-[#e65100]">#BTJ</span>
              </span>
            </h1>

            {/* Descriptive Text */}
            <p className="max-w-lg mb-8 text-lg leading-relaxed sm:text-xl md:text-2xl text-white/90 sm:mb-10">
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
              <div className="inline-flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="flex-shrink-0">
                  <Image 
                    src={Junoonilogo} 
                    alt="Junooni" 
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
                <div className="flex-shrink-0">
                  <p className="text-sm font-semibold text-white whitespace-nowrap">Limited Edition</p>
                  <p className="text-xs text-white/80 whitespace-nowrap">Exclusive drops available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Additional Info - Positioned Bottom Right */}
        <div className="absolute hidden max-w-xs p-4 bg-white rounded-lg shadow-lg sm:block bottom-8 right-8">
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
              <p className="text-sm font-semibold text-gray-900">Official Drop</p>
              <p className="text-xs text-gray-600">Limited collection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;