"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Create a context to manage navbar appearance across components
interface NavContextType {
  isAnyMenuHovered: boolean;
  setAnyMenuHovered: (isHovered: boolean) => void;
  isPast100vh: boolean;
  isHomePage: boolean;
}

const NavContext = createContext<NavContextType>({
  isAnyMenuHovered: false,
  setAnyMenuHovered: () => {},
  isPast100vh: false,
  isHomePage: false,
});

// Hook for components to easily use the NavContext
export const useNavContext = () => useContext(NavContext);

// Provider component to wrap around our navigation system
interface NavProviderProps {
  children: ReactNode;
  isHomePage?: boolean;
}

export function NavProvider({ children, isHomePage = false }: NavProviderProps) {
  const [isAnyMenuHovered, setAnyMenuHovered] = useState(false);
  const [isPast100vh, setIsPast100vh] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Handle scroll events to detect when we've scrolled past 100vh
  useEffect(() => {
    // Only track 100vh crossing on homepage
    if (!isHomePage) return;
    
    // Throttle function to improve performance on scroll events
    const throttle = (callback: Function, delay: number) => {
      let lastCall = 0;
      return function(...args: any[]) {
        const now = new Date().getTime();
        if (now - lastCall >= delay) {
          lastCall = now;
          callback(...args);
        }
      };
    };
    
    const handleScroll = throttle(() => {
      const currentScrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Set isPast100vh based on current scroll position
      setIsPast100vh(currentScrollY > viewportHeight);
      
      // Update the last scroll position
      setLastScrollY(currentScrollY);
    }, 100); // 100ms throttle for performance
    
    // Set initial state based on current scroll position
    handleScroll();
    
    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage, lastScrollY]);
  
  // Handle window resize to re-calculate viewports
  useEffect(() => {
    if (!isHomePage) return; // Skip if not homepage
    
    const handleResize = () => {
      const currentScrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      setIsPast100vh(currentScrollY > viewportHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isHomePage]);

  return (
    <NavContext.Provider 
      value={{ 
        isAnyMenuHovered, 
        setAnyMenuHovered,
        isPast100vh,
        isHomePage
      }}
    >
      {children}
    </NavContext.Provider>
  );
}