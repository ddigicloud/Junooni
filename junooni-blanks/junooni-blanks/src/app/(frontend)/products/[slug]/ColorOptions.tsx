'use client'

import React, { useState } from 'react'

interface ColorOption {
  id: string
  colorName: string
  colorHex: string
}

interface ColorOptionsProps {
  colorOptions: ColorOption[]
}

export default function ColorOptions({ colorOptions }: ColorOptionsProps) {
  const [showAllColors, setShowAllColors] = useState(false)
  const INITIAL_COLORS_TO_SHOW = 12

  if (colorOptions.length === 0) {
    return null
  }

  const displayedColors = showAllColors 
    ? colorOptions 
    : colorOptions.slice(0, INITIAL_COLORS_TO_SHOW)
  
  const hasMoreColors = colorOptions.length > INITIAL_COLORS_TO_SHOW

  return (
    <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
      <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
        Colors 
      </h3>
      <div className="flex flex-wrap items-center gap-3">
        {displayedColors.map((color: ColorOption, index: number) => (
          <div
            key={color.id || index}
            className="relative group"
          >
            <div
              className="w-12 h-12 border-2 border-gray-300 rounded-full dark:border-gray-600 hover:scale-110 transition-transform cursor-pointer"
              style={{ backgroundColor: color.colorHex || '#cccccc' }}
            />
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {color.colorName}
            </span>
          </div>
        ))}
        
        {hasMoreColors && (
          <button
            onClick={() => setShowAllColors(!showAllColors)}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ color: '#e65100' }}
          >
            {showAllColors ? (
              <>
                See less
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                See more (+{colorOptions.length - INITIAL_COLORS_TO_SHOW})
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}