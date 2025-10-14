'use client'

import React, { useState, useEffect } from "react";
import { HttpTypes } from "@medusajs/types";
import { ArrowLeft, ArrowRight } from "lucide-react";

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[];
};

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  // If no images, display a placeholder
  if (!images.length) {
    return (
      <div className="relative aspect-[3/4] bg-gray-100 rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-400">No image available</span>
        </div>
      </div>
    );
  }

  // Navigation functions for main carousel
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  const setThumbnailImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Functions for lightbox
  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };
  
  const nextLightboxImage = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevLightboxImage = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  // Handle keyboard navigation in lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        nextLightboxImage();
      } else if (e.key === 'ArrowLeft') {
        prevLightboxImage();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex]);

  return (
    <div>
      {/* Mobile Layout - Main Image with Thumbnails */}
      <div className="block md:hidden">
        {/* Main Image Carousel - Fixed to ensure full visibility */}
        <div className="relative mb-4 overflow-hidden bg-gray-100 rounded-lg">
          <div className="w-full" style={{ height: '350px' }}>
            <img 
              src={images[currentImageIndex]?.url} 
              alt="Product image" 
              className="w-full h-full object-cover sm:object-contain"
            />
            
            {/* Image Navigation Arrows */}
            <button 
              className="absolute flex items-center justify-center w-8 h-8 transition -translate-y-1/2 bg-white rounded-full left-2 top-1/2 bg-opacity-70 hover:bg-opacity-100"
              onClick={prevImage}
              aria-label="Previous image"
            >
              <ArrowLeft size={16} />
            </button>
            <button 
              className="absolute flex items-center justify-center w-8 h-8 transition -translate-y-1/2 bg-white rounded-full right-2 top-1/2 bg-opacity-70 hover:bg-opacity-100"
              onClick={nextImage}
              aria-label="Next image"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
        
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 pb-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {images.map((image, index) => (
              <button 
                key={image.id}
                className={`min-w-[60px] w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                  currentImageIndex === index ? 'border-[#e65100]' : 'border-transparent'
                }`}
                onClick={() => setThumbnailImage(index)}
                aria-label={`View image ${index + 1}`}
              >
                {image.url && (
                  <img 
                    src={image.url} 
                    alt={`Thumbnail ${index + 1}`} 
                    className="object-cover w-full h-full"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Desktop Layout - Grid View */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 gap-1">
          {images.map((image, index) => (
            <div 
              key={image.id} 
              className="relative overflow-hidden rounded-sm shadow-sm cursor-pointer"
              style={{ height: '400px' }}
              onClick={() => openLightbox(index)}
            >
              {image.url && (
                <img 
                  src={image.url} 
                  alt={`Product image ${index + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox (shared between both layouts) */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-90"
          onClick={closeLightbox}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] w-[90vw]"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the content
          >
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            {/* Previous button */}
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3"
              onClick={(e) => {
                e.stopPropagation();
                prevLightboxImage();
              }}
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            {/* Next button */}
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3"
              onClick={(e) => {
                e.stopPropagation();
                nextLightboxImage();
              }}
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            
            {/* Image */}
            <div className="h-full w-full flex items-center justify-center">
              <img 
                src={images[selectedImageIndex].url} 
                alt="Product image enlarged" 
                className="object-contain max-h-[80vh] max-w-full"
              />
            </div>
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;