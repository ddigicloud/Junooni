import { assets } from '@assets/assets';

const Hero = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden border-b border-ui-border-base">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="object-cover w-full h-full"
        >
          <source src={assets.video1} type="video/mp4" />
        </video>
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      
      {/* Content centered on top of video */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 text-center">
        <div className="max-w-3xl px-4 mt-16 sm:mt-0">
          <div className="mb-4 sm:mb-6">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-black rounded-full">
              EXCLUSIVE DROP
            </span>
          </div>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Limited Edition Collection by <span className="text-[#e65100]">ArtistName</span>
          </h1>
          <p className="max-w-md mx-auto mb-6 text-base text-white sm:max-w-xl sm:text-lg md:text-xl">
            Exclusive merchandise designed by your favorite creator. Available for a limited time only.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <a 
              href="#" 
              className="px-6 py-2 text-sm font-medium text-white transition bg-black rounded-md sm:px-8 sm:py-3 sm:text-base hover:bg-gray-800"
            >
              Shop Collection
            </a>
            <a 
              href="#" 
              className="bg-[#e65100] text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-md hover:bg-[#d84315] transition"
            >
              Meet Creator
            </a>
          </div>
          
          {/* Signed Editions Badge */}
          <div className="absolute hidden p-3 text-xs bg-white rounded-lg shadow-lg sm:block bottom-6 right-6 sm:bottom-8 sm:right-8 sm:p-4 sm:text-sm md:text-base">
            <p className="font-semibold">Signed Editions</p>
            <p className="text-gray-500">Limited to 1000</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
