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
  
  // console.log('🖼️ ColorFilteredImageGallery rendered');
  // console.log('🖼️ Product title:', product.title);
  // console.log('🖼️ Initial/Current selectedColor:', selectedColor);
  // console.log('🖼️ Product images count:', product.images?.length || 0);
  // console.log('🎨 Available colors:', colorOption?.values?.map(v => v.value));
  
  // Dispatch initial color event when component mounts (only if we have an initial color)
  useEffect(() => {
    if (initialColor) {
      //console.log('🚀 Dispatching initial color event:', initialColor);
      try {
        const event = new CustomEvent('colorOptionChanged', {
          detail: { color: initialColor }
        });
        window.dispatchEvent(event);
      } catch (error) {
        //console.error('❌ Failed to dispatch initial color event:', error);
      }
    }
  }, []); // Empty dependency array - runs only once on mount

  // Function to filter images based on selected color
    const getFilteredImages = () => {
    if (!selectedColor || !colorOption) {
      return product.images || [];
    }

    // Find the variant matching the selected color
    const matchingVariant = product.variants?.find(variant =>
      variant.options?.some(opt =>
        opt.option?.title?.toLowerCase() === 'color' &&
        opt.value?.toLowerCase() === selectedColor.toLowerCase()
      )
    );

    if (!matchingVariant) {
      return product.images || [];
    }

    // PRIORITY 1: Native variant images (Medusa v2.11.2+)
    // variant.images[] contains images associated with this specific variant
    const nativeVariantImages = (matchingVariant as any).images;
    if (nativeVariantImages && Array.isArray(nativeVariantImages) && nativeVariantImages.length > 0) {
      const variantImageIds = new Set(nativeVariantImages.map((img: any) => img.id));
      const filtered = (product.images || []).filter(img => variantImageIds.has(img.id));
      if (filtered.length > 0) return filtered;
    }

    // PRIORITY 2: URL-based fallback (color name in image URL)
    const urlFiltered = (product.images || []).filter(image =>
      image.url.toLowerCase().includes(selectedColor.toLowerCase().replace(/\s+/g, '_')) ||
      image.url.toLowerCase().includes(selectedColor.toLowerCase().replace(/\s+/g, '-')) ||
      image.url.toLowerCase().includes(selectedColor.toLowerCase())
    );
    if (urlFiltered.length > 0) return urlFiltered;

    // PRIORITY 3: Legacy metadata fallback (for older products)
    try {
      const metadata = matchingVariant.metadata;
      if (metadata?.variant_images) {
        const variantImages = JSON.parse(metadata.variant_images as string);
        if (Array.isArray(variantImages) && variantImages.length > 0) {
          const filtered = (product.images || []).filter(img => variantImages.includes(img.url));
          if (filtered.length > 0) return filtered;
        }
      }
      if (metadata?.option_images) {
        const optionImages = JSON.parse(metadata.option_images as string);
        if (Array.isArray(optionImages)) {
          const urls = optionImages.map((img: any) => img.url);
          const filtered = (product.images || []).filter(img => urls.includes(img.url));
          if (filtered.length > 0) return filtered;
        }
      }
    } catch {}

    return product.images || [];
  };

  // Listen for color selection changes via custom events
  useEffect(() => {
    //console.log('👂 Setting up event listener for colorOptionChanged');
    
    const handleColorChange = (event: CustomEvent) => {
      // console.log('📩 Received colorOptionChanged event:', event.detail);
      // console.log('📩 Event color:', event.detail.color);
      // console.log('📩 Current selectedColor before update:', selectedColor);
      setSelectedColor(event.detail.color);
    };

    window.addEventListener('colorOptionChanged', handleColorChange as EventListener);
    
    return () => {
      //console.log('🧹 Cleaning up event listener');
      window.removeEventListener('colorOptionChanged', handleColorChange as EventListener);
    };
  }, []);

  const filteredImages = getFilteredImages();

  //console.log('🎬 Rendering ProductImageGallery with', filteredImages.length, 'images');

  return <ProductImageGallery images={filteredImages} />;
};

export default ColorFilteredImageGallery;
