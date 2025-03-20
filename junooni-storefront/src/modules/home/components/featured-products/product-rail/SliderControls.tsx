"use client"

import { useCallback, useEffect, useState } from "react"

interface SliderControlsProps {
  sliderId: string
  itemCount: number
}

export default function SliderControls({ sliderId, itemCount }: SliderControlsProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  
  // Check if controls should be shown (only if content exceeds container)
  const [showControls, setShowControls] = useState(false)
  
  useEffect(() => {
    const sliderContainer = document.getElementById(sliderId)
    if (!sliderContainer) return
    
    // Add CSS to hide scrollbar but maintain functionality
    const style = document.createElement('style')
    style.textContent = `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `
    document.head.appendChild(style)
    
    // Get initial measurements
    setContainerWidth(sliderContainer.clientWidth)
    setMaxScroll(sliderContainer.scrollWidth - sliderContainer.clientWidth)
    
    // Determine if controls should be shown
    setShowControls(sliderContainer.scrollWidth > sliderContainer.clientWidth)
    
    // Update scroll position when scrolling
    const handleScroll = () => {
      setScrollPosition(sliderContainer.scrollLeft)
    }
    
    // Update measurements on resize
    const handleResize = () => {
      setContainerWidth(sliderContainer.clientWidth)
      setMaxScroll(sliderContainer.scrollWidth - sliderContainer.clientWidth)
      setShowControls(sliderContainer.scrollWidth > sliderContainer.clientWidth)
    }
    
    sliderContainer.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    
    return () => {
      sliderContainer.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize) // Fixed: was addEventListener
      document.head.removeChild(style)
    }
  }, [sliderId])
  
  const scrollPrev = useCallback(() => {
    const sliderContainer = document.getElementById(sliderId)
    if (!sliderContainer) return
    
    // Scroll back by 1/2 of container width
    const scrollAmount = containerWidth / 2
    sliderContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  }, [sliderId, containerWidth])
  
  const scrollNext = useCallback(() => {
    const sliderContainer = document.getElementById(sliderId)
    if (!sliderContainer) return
    
    // Scroll forward by 1/2 of container width
    const scrollAmount = containerWidth / 2
    sliderContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }, [sliderId, containerWidth])
  
  // Don't render controls if not needed
  if (!showControls || itemCount <= 2) {
    return null
  }
  
  // Calculate progress percentage for the progress indicator
  const progressPercentage = (scrollPosition / maxScroll) * 100
  
  return (
    <>
      {/* Progress indicator */}
      {/* <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 rounded-full">
        <div 
          className="h-full bg-black rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div> */}
      
      {/* Navigation buttons */}
      <button
        onClick={scrollPrev}
        disabled={scrollPosition <= 0}
        className="absolute -left-5 z-10 p-3 transform -translate-y-1/2 bg-white rounded-full shadow-md top-[40%] disabled:opacity-30 hover:bg-gray-50 transition duration-200 focus:outline-none focus:ring-2 focus:ring-black"
        aria-label="Previous products"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button
        onClick={scrollNext}
        disabled={scrollPosition >= maxScroll - 10}
        className="absolute z-10 p-3 transform -translate-y-1/2 bg-white rounded-full shadow-md -right-5 top-[40%] disabled:opacity-30 hover:bg-gray-50 transition duration-200 focus:outline-none focus:ring-2 focus:ring-black"
        aria-label="Next products"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </>
  )
}