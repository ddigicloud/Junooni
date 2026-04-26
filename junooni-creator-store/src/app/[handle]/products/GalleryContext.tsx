// src/components/product/GalleryContext.tsx
"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface GalleryImage {
  id?: string
  url: string
}

interface GalleryContextValue {
  images: GalleryImage[]
  activeIndex: number
  setImages: (images: GalleryImage[], activeIndex?: number) => void
  setActiveIndex: (index: number) => void
}

const GalleryContext = createContext<GalleryContextValue | null>(null)

export function GalleryProvider({
  children,
  initialImages,
}: {
  children: ReactNode
  initialImages: GalleryImage[]
}) {
  const [images, setImagesState] = useState<GalleryImage[]>(initialImages)
  const [activeIndex, setActiveIndex] = useState(0)

  const setImages = useCallback((imgs: GalleryImage[], idx = 0) => {
    setImagesState(imgs)
    setActiveIndex(idx)
  }, [])

  return (
    <GalleryContext.Provider value={{ images, activeIndex, setImages, setActiveIndex }}>
      {children}
    </GalleryContext.Provider>
  )
}

export function useGallery() {
  const ctx = useContext(GalleryContext)
  if (!ctx) throw new Error("useGallery must be used within GalleryProvider")
  return ctx
}