// "use client"

// import { useState, useEffect, createContext, useContext, ReactNode } from "react"

// // Create context to manage hover state across components
// interface NavContextType {
//   isAnyMenuHovered: boolean
//   setAnyMenuHovered: (hovered: boolean) => void
// }

// const NavContext = createContext<NavContextType>({
//   isAnyMenuHovered: false,
//   setAnyMenuHovered: () => {},
// })

// export const useNavContext = () => useContext(NavContext)

// interface NavContainerProps {
//   children: ReactNode
//   isHomePage?: boolean // New prop to determine if we're on the home page
// }

// export function NavContainer({ children, isHomePage = false }: NavContainerProps) {
//   const [isAnyMenuHovered, setAnyMenuHovered] = useState(false)
//   const [isVisible, setIsVisible] = useState(true)
//   const [lastScrollY, setLastScrollY] = useState(0)
//   const [isPast10vh, setIsPast10vh] = useState(false) // Renamed to reflect new threshold
  
//   // Handle scroll events to control navbar visibility and background
//   useEffect(() => {
//     // Throttle function to improve performance, especially on mobile
//     const throttle = (callback: Function, delay: number) => {
//       let lastCall = 0;
//       return function(...args: any[]) {
//         const now = new Date().getTime();
//         if (now - lastCall >= delay) {
//           lastCall = now;
//           callback(...args);
//         }
//       };
//     };
    
//     const controlNavbar = throttle(() => {
//       const currentScrollY = window.scrollY
//       const viewportHeight = window.innerHeight
      
//       // Check if scrolled past 10vh - only track this on home page
//       if (isHomePage) {
//         setIsPast10vh(currentScrollY > viewportHeight * 0.1) // Changed from 100vh to 10vh
//       } else {
//         setIsPast10vh(false) // Always false on non-home pages
//       }
      
//       // Determine if scrolling up or down - this applies to all pages
//       if (currentScrollY > lastScrollY && currentScrollY > 50) {
//         // Scrolling down & past threshold - hide navbar
//         // Lower threshold (50px) for mobile for quicker response
//         setIsVisible(false)
//       } else {
//         // Scrolling up or at the top - show navbar
//         setIsVisible(true)
//       }
      
//       // Update last scroll position
//       setLastScrollY(currentScrollY)
//     }, 100); // 100ms throttle for smooth performance
    
//     // Add scroll event listener
//     window.addEventListener("scroll", controlNavbar)
    
//     // Set initial state based on current scroll position
//     controlNavbar();
    
//     // Clean up event listener on component unmount
//     return () => {
//       window.removeEventListener("scroll", controlNavbar)
//     }
//   }, [lastScrollY, isHomePage]) // Re-run effect when lastScrollY or isHomePage changes
  
//   // Handle window resize to re-calculate viewports - only matters for home page
//   useEffect(() => {
//     if (!isHomePage) return; // Skip this effect on non-home pages
    
//     const handleResize = () => {
//       const currentScrollY = window.scrollY
//       const viewportHeight = window.innerHeight
//       setIsPast10vh(currentScrollY > viewportHeight * 0.1) // Changed from 100vh to 10vh
//     }
    
//     window.addEventListener('resize', handleResize)
    
//     return () => {
//       window.removeEventListener('resize', handleResize)
//     }
//   }, [isHomePage])

//   return (
//     <NavContext.Provider value={{ isAnyMenuHovered, setAnyMenuHovered }}>
//       <div className={`fixed inset-x-0 top-0 z-[1000] transition-transform duration-100 ${
//         isVisible ? 'transform-none' : 'transform -translate-y-full'
//       }`}>
//         <header 
//           className={`relative h-16 mx-auto duration-100 transition-all w-full ${
//             isHomePage 
//               ? isAnyMenuHovered || isPast10vh // Updated variable name
//                 ? 'bg-white text-black shadow-sm' 
//                 : 'bg-transparent text-white hover:text-black hover:bg-white'
//               : 'bg-white text-black shadow-sm' // Always white background with black text on non-home pages
//           }`}
//         >
//           {children}
//         </header>
//       </div>
//     </NavContext.Provider>
//   )
// }



"use client"

import { useState, useEffect, createContext, useContext, ReactNode, useRef } from "react"

// Create context to manage hover state across components
interface NavContextType {
  isAnyMenuHovered: boolean
  setAnyMenuHovered: (hovered: boolean) => void
}

const NavContext = createContext<NavContextType>({
  isAnyMenuHovered: false,
  setAnyMenuHovered: () => {},
})

export const useNavContext = () => useContext(NavContext)

interface NavContainerProps {
  children: ReactNode
  isHomePage?: boolean // New prop to determine if we're on the home page
}

export function NavContainer({ children, isHomePage = false }: NavContainerProps) {
  const [isAnyMenuHovered, setAnyMenuHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isPast10vh, setIsPast10vh] = useState(false)
  const lastScrollYRef = useRef(0)
  const ticking = useRef(false)
  
  // Handle scroll events to control navbar visibility and background
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY
      const viewportHeight = window.innerHeight
      
      // Check if scrolled past 10vh - only track this on home page
      if (isHomePage) {
        const threshold = viewportHeight * 0.1
        // More aggressive threshold - must be clearly above 10vh to trigger white background
        const newIsPast10vh = currentScrollY > threshold + 10
        setIsPast10vh(newIsPast10vh)
      } else {
        setIsPast10vh(false)
      }
      
      // Determine if scrolling up or down - this applies to all pages
      if (currentScrollY > lastScrollYRef.current && currentScrollY > 50) {
        // Scrolling down & past threshold - hide navbar
        setIsVisible(false)
      } else {
        // Scrolling up or at the top - show navbar
        setIsVisible(true)
      }
      
      // Update last scroll position using ref
      lastScrollYRef.current = currentScrollY
      ticking.current = false
    }
    
    const requestTick = () => {
      if (!ticking.current) {
        requestAnimationFrame(controlNavbar)
        ticking.current = true
      }
    }
    
    // Add scroll event listener with requestAnimationFrame for smooth performance
    const handleScroll = () => {
      requestTick()
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    
    // Set initial state based on current scroll position
    controlNavbar()
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isHomePage]) // Only depend on isHomePage, not lastScrollY
  
  // Handle window resize to re-calculate viewports - only matters for home page
  useEffect(() => {
    if (!isHomePage) return
    
    const handleResize = () => {
      const currentScrollY = window.scrollY
      const viewportHeight = window.innerHeight
      const threshold = viewportHeight * 0.1
      setIsPast10vh(currentScrollY > threshold + 10)
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [isHomePage])

  return (
    <NavContext.Provider value={{ isAnyMenuHovered, setAnyMenuHovered }}>
      <div className={`fixed inset-x-0 top-0 z-[1000] transition-transform duration-100 ${
        isVisible ? 'transform-none' : 'transform -translate-y-full'
      }`}>
        <header 
          className={`relative h-16 mx-auto duration-100 transition-all w-full ${
            isHomePage 
              ? isAnyMenuHovered || isPast10vh
                ? 'bg-white text-black shadow-sm' 
                : 'bg-transparent text-white hover:text-black hover:bg-white'
              : 'bg-white text-black shadow-sm'
          }`}
        >
          {children}
        </header>
      </div>
    </NavContext.Provider>
  )
}