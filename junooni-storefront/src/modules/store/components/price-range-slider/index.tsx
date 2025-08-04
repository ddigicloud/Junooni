"use client"

import { useState, useEffect, useRef } from "react"
import { Text, Input } from "@medusajs/ui"

type PriceRangeProps = {
  minPrice: number
  maxPrice: number
  currentMin: number
  currentMax: number
  handleChange: (min: number, max: number) => void
  "data-testid"?: string
}

const PriceRangeSlider = ({
  minPrice,
  maxPrice,
  currentMin,
  currentMax,
  handleChange,
  "data-testid": dataTestId,
}: PriceRangeProps) => {
  const [localMin, setLocalMin] = useState<number>(currentMin)
  const [localMax, setLocalMax] = useState<number>(currentMax)
  const [isDraggingMin, setIsDraggingMin] = useState<boolean>(false)
  const [isDraggingMax, setIsDraggingMax] = useState<boolean>(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Update local state when props change
  useEffect(() => {
    setLocalMin(currentMin)
    setLocalMax(currentMax)
  }, [currentMin, currentMax])

  // Convert price to percentage position on the slider
  const getPercentage = (value: number) => {
    return ((value - minPrice) / (maxPrice - minPrice)) * 100
  }

  // Convert percentage to price value
  const getValueFromPercent = (percent: number) => {
    return Math.round(((maxPrice - minPrice) * percent) / 100 + minPrice)
  }

  // Calculate the left position of the min thumb
  const minThumbPosition = getPercentage(localMin)
  
  // Calculate the right position of the max thumb
  const maxThumbPosition = getPercentage(localMax)

  // Apply changes after dragging stops or input blur
  const applyChanges = () => {
    // Ensure min is never less than the minimum allowed price
    const finalMin = Math.max(minPrice, localMin)
    
    // Ensure max is never more than the maximum allowed price
    const finalMax = Math.min(maxPrice, localMax)
    
    // Ensure min is never greater than max
    const validatedMin = Math.min(finalMin, finalMax)
    const validatedMax = Math.max(finalMin, finalMax)
    
    setLocalMin(validatedMin)
    setLocalMax(validatedMax)
    
    // Only trigger API call if values have changed
    if (validatedMin !== currentMin || validatedMax !== currentMax) {
      handleChange(validatedMin, validatedMax)
    }
  }

  // Handle min input change
  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || minPrice
    setLocalMin(value)
  }

  // Handle max input change
  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || maxPrice
    setLocalMax(value)
  }

  // Handle slider thumb dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingMin && !isDraggingMax) return
    if (!sliderRef.current) return

    // Get slider dimensions
    const sliderRect = sliderRef.current.getBoundingClientRect()
    const sliderWidth = sliderRect.width
    const sliderLeft = sliderRect.left

    // Calculate position as percentage of slider width
    const posX = Math.max(0, Math.min(e.clientX - sliderLeft, sliderWidth))
    const percentPosition = (posX / sliderWidth) * 100
    
    // Update the appropriate thumb position
    if (isDraggingMin) {
      const newMin = getValueFromPercent(percentPosition)
      // Don't let min go above max
      setLocalMin(Math.min(newMin, localMax))
    } else if (isDraggingMax) {
      const newMax = getValueFromPercent(percentPosition)
      // Don't let max go below min
      setLocalMax(Math.max(newMax, localMin))
    }
  }

  // Handle touch movement for mobile
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDraggingMin && !isDraggingMax) return
    if (!sliderRef.current) return

    // Get slider dimensions
    const sliderRect = sliderRef.current.getBoundingClientRect()
    const sliderWidth = sliderRect.width
    const sliderLeft = sliderRect.left

    // Calculate position as percentage of slider width
    const posX = Math.max(0, Math.min(e.touches[0].clientX - sliderLeft, sliderWidth))
    const percentPosition = (posX / sliderWidth) * 100
    
    // Update the appropriate thumb position
    if (isDraggingMin) {
      const newMin = getValueFromPercent(percentPosition)
      // Don't let min go above max
      setLocalMin(Math.min(newMin, localMax))
    } else if (isDraggingMax) {
      const newMax = getValueFromPercent(percentPosition)
      // Don't let max go below min
      setLocalMax(Math.max(newMax, localMin))
    }
  }

  // End dragging and apply changes
  const handleDragEnd = () => {
    if (isDraggingMin || isDraggingMax) {
      setIsDraggingMin(false)
      setIsDraggingMax(false)
      applyChanges()
    }
  }

  // Set up event listeners for dragging
  useEffect(() => {
    // Add event listeners when dragging starts
    if (isDraggingMin || isDraggingMax) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleDragEnd)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleDragEnd)
    }

    // Clean up event listeners
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleDragEnd)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleDragEnd)
    }
  }, [isDraggingMin, isDraggingMax, localMin, localMax])

  return (
    <div className="flex flex-col gap-y-4" data-testid={dataTestId}>
      {/* Price inputs */}
      <div className="flex items-center gap-x-2">
        <Input
          type="number"
          min={minPrice}
          max={localMax}
          value={localMin}
          onChange={handleMinInputChange}
          onBlur={applyChanges}
          placeholder="Min"
          className="w-20"
        />
        <Text className="text-ui-fg-muted">to</Text>
        <Input
          type="number"
          min={localMin}
          max={maxPrice}
          value={localMax}
          onChange={handleMaxInputChange}
          onBlur={applyChanges}
          placeholder="Max"
          className="w-20"
        />
      </div>
      
      {/* Slider */}
      <div className="relative w-full h-6" ref={sliderRef}>
        {/* Slider track */}
        <div className="absolute w-full h-1 -translate-y-1/2 rounded-full top-1/2 bg-gray-200">
          {/* Active range */}
          <div 
            className="absolute h-full rounded-full bg-[#e65100]"
            style={{
              left: `${minThumbPosition}%`,
              right: `${100 - maxThumbPosition}%`
            }}
          />
        </div>
        
        {/* Min thumb */}
        <div
          className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 cursor-grab bg-[#e65100] active:cursor-grabbing hover:scale-110 transition-transform"
          style={{ left: `${minThumbPosition}%` }}
          onMouseDown={() => setIsDraggingMin(true)}
          onTouchStart={() => setIsDraggingMin(true)}
          role="slider"
          aria-valuemin={minPrice}
          aria-valuemax={localMax}
          aria-valuenow={localMin}
          tabIndex={0}
        />
        
        {/* Max thumb */}
        <div
          className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 cursor-grab bg-[#e65100] active:cursor-grabbing hover:scale-110 transition-transform"
          style={{ left: `${maxThumbPosition}%` }}
          onMouseDown={() => setIsDraggingMax(true)}
          onTouchStart={() => setIsDraggingMax(true)}
          role="slider"
          aria-valuemin={localMin}
          aria-valuemax={maxPrice}
          aria-valuenow={localMax}
          tabIndex={0}
        />
      </div>
      
      {/* Price range labels */}
      <div className="w-full flex justify-between">
        <Text className="text-gray-500 text-sm">₹{minPrice}</Text>
        <Text className="text-gray-500 text-sm">₹{maxPrice}</Text>
      </div>
    </div>
  )
}

export default PriceRangeSlider