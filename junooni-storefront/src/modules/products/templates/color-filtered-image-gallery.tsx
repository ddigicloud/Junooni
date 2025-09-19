"use client"

import React, { useState, useEffect } from "react";
import { HttpTypes } from "@medusajs/types";
import ProductImageGallery from "@modules/products/components/image-gallery";

type ColorFilteredImageGalleryProps = {
  product: HttpTypes.StoreProduct;
};

const ColorFilteredImageGallery: React.FC<ColorFilteredImageGalleryProps> = ({ product }) => {
  // Get the color option from product options
  const colorOption = product.options?.find(option => 
    option.title?.toLowerCase() === 'color'
  );
  
  // Initialize selectedColor with first color option immediately (no useEffect delay)
  const initialColor = colorOption?.values?.[0]?.value || "";
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);
  
  console.log('🖼️ ColorFilteredImageGallery rendered');
  console.log('🖼️ Product title:', product.title);
  console.log('🖼️ Initial/Current selectedColor:', selectedColor);
  console.log('🖼️ Product images count:', product.images?.length || 0);
  
  // CHECK PRODUCT METADATA
  console.log('📦 PRODUCT METADATA:', JSON.stringify(product.metadata, null, 2));
  
  // CHECK PRODUCT IMAGES (shorter version)
  console.log('🖼️ Images summary:', product.images?.map(img => ({
    id: img.id,
    url: img.url.split('/').pop(),
    rank: img.rank
  })));
  
  console.log('🎨 Color option found:', colorOption);
  
  // Dispatch initial color event when component mounts (only if we have an initial color)
  useEffect(() => {
    if (initialColor) {
      console.log('🚀 Dispatching initial color event:', initialColor);
      try {
        const event = new CustomEvent('colorOptionChanged', {
          detail: { color: initialColor }
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error('❌ Failed to dispatch initial color event:', error);
      }
    }
  }, []); // Empty dependency array - runs only once on mount

  // Function to filter images based on selected color
  const getFilteredImages = () => {
    console.log('🔍 getFilteredImages called with selectedColor:', selectedColor);
    
    if (!selectedColor || !colorOption) {
      console.log('⚠️ No selectedColor or colorOption, returning all images');
      return product.images || [];
    }
    
    console.log('🔍 Filtering images for color:', selectedColor);
    
    // Parse the option_images from product metadata
    try {
      const optionImagesString = product.metadata?.option_images;
      console.log('📦 Raw option_images string:', optionImagesString);
      
      if (!optionImagesString) {
        console.log('⚠️ No option_images in product metadata, returning all images');
        return product.images || [];
      }
      
      const optionImages = JSON.parse(optionImagesString);
      console.log('📦 Parsed option_images:', optionImages);
      
      const colorImages = optionImages.Color || optionImages.color;
      console.log('🎨 Color to image mapping:', colorImages);
      
      if (!colorImages) {
        console.log('⚠️ No Color mapping found in option_images');
        return product.images || [];
      }
      
      // Get the URL for the selected color
      const targetImageUrl = colorImages[selectedColor] || colorImages[selectedColor.toLowerCase()];
      console.log('🎯 Target image URL for color', selectedColor, ':', targetImageUrl);
      
      if (!targetImageUrl) {
        console.log('⚠️ No image URL found for color:', selectedColor);
        return product.images || [];
      }
      
      // Find the image that matches this URL
      const filteredImages = (product.images || []).filter(image => {
        const matches = image.url === targetImageUrl;
        console.log(`🔍 Image ${image.url} matches target ${targetImageUrl}?`, matches);
        return matches;
      });
      
      console.log('✅ Filtered images result:', filteredImages.length, 'out of', product.images?.length || 0);
      console.log('📷 Filtered image URLs:', filteredImages.map(img => img.url));
      
      // Return filtered images or all images as fallback
      const finalImages = filteredImages.length > 0 ? filteredImages : product.images || [];
      console.log('🎯 Final images to display:', finalImages.length);
      return finalImages;
      
    } catch (error) {
      console.error('❌ Error parsing option_images:', error);
      return product.images || [];
    }
  };

  // Listen for color selection changes via custom events
  useEffect(() => {
    console.log('👂 Setting up event listener for colorOptionChanged');
    
    const handleColorChange = (event: CustomEvent) => {
      console.log('📩 Received colorOptionChanged event:', event.detail);
      console.log('📩 Event color:', event.detail.color);
      console.log('📩 Current selectedColor before update:', selectedColor);
      setSelectedColor(event.detail.color);
    };

    window.addEventListener('colorOptionChanged', handleColorChange as EventListener);
    
    return () => {
      console.log('🧹 Cleaning up event listener');
      window.removeEventListener('colorOptionChanged', handleColorChange as EventListener);
    };
  }, []);

  const filteredImages = getFilteredImages();

  console.log('🎬 Rendering ProductImageGallery with', filteredImages.length, 'images');

  return <ProductImageGallery images={filteredImages} />;
};

export default ColorFilteredImageGallery;