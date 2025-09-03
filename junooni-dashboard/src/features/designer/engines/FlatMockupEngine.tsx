// src/components/Designer/engines/FlatMockupEngine.tsx
import React, { useRef, useEffect, useState } from 'react';

interface FlatMockupEngineProps {
  mockup: any;
  designElements: any[];
  canvasDimensions: { width: number; height: number };
  canvasPrintableArea: { x: number; y: number; width: number; height: number };
  displayDimensions: { width: number; height: number };
  productType: string;
  productColor: string;
}

/**
 * Professional Flat Surface Rendering Engine
 * Handles t-shirts, posters, business cards, and other flat products
 * Provides pixel-perfect rendering with professional blend modes and transforms
 */
export const FlatMockupEngine: React.FC<FlatMockupEngineProps> = ({
  mockup,
  designElements,
  canvasDimensions,
  canvasPrintableArea,
  displayDimensions,
  productType,
  productColor
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !mockup?.photo?.url) {
      setIsLoading(false);
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      setRenderError('Failed to get canvas context');
      return;
    }
    
    // Enable high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Load mockup image
    const mockupImg = new Image();
    mockupImg.crossOrigin = 'anonymous';
    mockupImg.src = resolveImageUrl(mockup.photo.url);
    
    mockupImg.onload = async () => {
      setIsLoading(false);
      setRenderError(null);
      
      try {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw mockup background
        ctx.drawImage(mockupImg, 0, 0, displayDimensions.width, displayDimensions.height);
        
        // Get placement configuration
        const placement = mockup.designPlacementArea;
        if (!placement?.coordinates) {
          console.warn('No placement coordinates found');
          return;
        }
        
        const placementArea = {
          x: placement.coordinates.x * displayDimensions.width,
          y: placement.coordinates.y * displayDimensions.height,
          width: placement.coordinates.width * displayDimensions.width,
          height: placement.coordinates.height * displayDimensions.height
        };
        
        // Create off-screen canvas for design composition
        const designCanvas = document.createElement('canvas');
        designCanvas.width = placementArea.width;
        designCanvas.height = placementArea.height;
        const designCtx = designCanvas.getContext('2d');
        
        if (!designCtx) {
          setRenderError('Failed to create design canvas');
          return;
        }
        
        // Enable high quality rendering on design canvas
        designCtx.imageSmoothingEnabled = true;
        designCtx.imageSmoothingQuality = 'high';
        
        // Clear design canvas
        designCtx.clearRect(0, 0, designCanvas.width, designCanvas.height);
        
        // Calculate scale factors
        const scaleX = placementArea.width / canvasPrintableArea.width;
        const scaleY = placementArea.height / canvasPrintableArea.height;
        
        // Sort elements by z-index
        const sortedElements = [...designElements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        
        // Render each design element
        for (const element of sortedElements) {
          if (!element.image || !element.width || !element.height) continue;
          
          // Calculate element position relative to printable area
          const relativeX = element.x - canvasPrintableArea.x;
          const relativeY = element.y - canvasPrintableArea.y;
          
          // Check if element is within printable area
          if (relativeX + element.width < 0 || relativeY + element.height < 0 ||
              relativeX > canvasPrintableArea.width || relativeY > canvasPrintableArea.height) {
            continue;
          }
          
          // Calculate clipped dimensions
          const clipX = Math.max(0, -relativeX);
          const clipY = Math.max(0, -relativeY);
          const clipWidth = Math.min(element.width - clipX, canvasPrintableArea.width - Math.max(0, relativeX));
          const clipHeight = Math.min(element.height - clipY, canvasPrintableArea.height - Math.max(0, relativeY));
          
          if (clipWidth <= 0 || clipHeight <= 0) continue;
          
          // Calculate destination position and size
          const destX = Math.max(0, relativeX) * scaleX;
          const destY = Math.max(0, relativeY) * scaleY;
          const destWidth = clipWidth * scaleX;
          const destHeight = clipHeight * scaleY;
          
          // Save context state
          designCtx.save();
          
          // Apply element transforms
          const centerX = destX + destWidth / 2;
          const centerY = destY + destHeight / 2;
          
          designCtx.translate(centerX, centerY);
          designCtx.rotate((element.rotation || 0) * Math.PI / 180);
          designCtx.scale(element.scaleX || 1, element.scaleY || 1);
          designCtx.translate(-centerX, -centerY);
          
          // Draw element with clipping
          try {
            designCtx.drawImage(
              element.image,
              clipX, clipY, clipWidth, clipHeight,
              destX, destY, destWidth, destHeight
            );
          } catch (err) {
            console.error('Error drawing element:', err);
          }
          
          // Restore context state
          designCtx.restore();
        }
        
        // Apply any surface-specific effects
        if (productType === 'apparel_tshirt' || productType === 'apparel_hoodie') {
          applyFabricTexture(designCtx, designCanvas.width, designCanvas.height);
        }
        
        // Draw the design onto the main canvas with transforms and blend modes
        ctx.save();
        
        // Calculate transform origin
        const transformOriginX = placementArea.x + placementArea.width / 2;
        const transformOriginY = placementArea.y + placementArea.height / 2;
        
        // Apply placement transforms
        ctx.translate(transformOriginX, transformOriginY);
        
        // Apply rotation
        if (placement.transforms?.rotation) {
          ctx.rotate(placement.transforms.rotation * Math.PI / 180);
        }
        
        // Apply skew
        if (placement.transforms?.skewX || placement.transforms?.skewY) {
          const skewX = (placement.transforms.skewX || 0) * Math.PI / 180;
          const skewY = (placement.transforms.skewY || 0) * Math.PI / 180;
          ctx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);
        }
        
        // Apply scale
        if (placement.transforms?.scaleX || placement.transforms?.scaleY) {
          ctx.scale(placement.transforms.scaleX || 1, placement.transforms.scaleY || 1);
        }
        
        ctx.translate(-placementArea.width / 2, -placementArea.height / 2);
        
        // Set blend mode and opacity
        const blendMode = placement.renderingSettings?.blendMode || 'normal';
        const opacity = placement.renderingSettings?.opacity ?? 1.0;
        
        ctx.globalCompositeOperation = getCanvasBlendMode(blendMode);
        ctx.globalAlpha = opacity;
        
        // Draw the design
        ctx.drawImage(designCanvas, 0, 0);
        
        // Apply color preservation if enabled
        if (placement.renderingSettings?.preserveColors && blendMode !== 'normal') {
          // Create a color-preserved version
          const preservedCanvas = preserveColors(designCanvas, blendMode, opacity);
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = 1.0;
          ctx.drawImage(preservedCanvas, 0, 0);
        }
        
        ctx.restore();
        
        // Apply post-processing effects
        if (productType === 'print_poster' || productType === 'print_business_card') {
          applyPrintEffects(ctx, placementArea);
        }
        
      } catch (error) {
        console.error('Error rendering mockup:', error);
        setRenderError('Failed to render mockup');
      }
    };
    
    mockupImg.onerror = () => {
      console.error('Failed to load mockup image:', mockup.photo.url);
      setIsLoading(false);
      setRenderError('Failed to load mockup image');
    };
    
    // Cleanup function
    return () => {
      if (mockupImg.src) {
        mockupImg.onload = null;
        mockupImg.onerror = null;
      }
    };
    
  }, [mockup, designElements, canvasDimensions, canvasPrintableArea, displayDimensions, productType]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-gray-600">Rendering mockup...</p>
        </div>
      </div>
    );
  }
  
  if (renderError) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="mb-2 text-xl text-red-500"> </div>
          <p className="text-sm text-gray-600">{renderError}</p>
        </div>
      </div>
    );
  }
  
  return (
    <canvas
      ref={canvasRef}
      width={displayDimensions.width}
      height={displayDimensions.height}
      className="object-contain w-full h-full rounded-lg"
      style={{ maxWidth: '100%', maxHeight: '100%' }}
    />
  );
};

/**
 * Apply fabric texture effect for apparel products
 */
function applyFabricTexture(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Add subtle texture noise
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 10;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
    // Alpha remains unchanged
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply print effects for paper products
 */
function applyPrintEffects(ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }) {
  // Add subtle shadow for depth
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  
  // Draw a transparent rectangle to apply the shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
  ctx.fillRect(area.x, area.y, area.width, area.height);
  ctx.restore();
}

/**
 * Preserve original colors when using blend modes
 */
function preserveColors(
  sourceCanvas: HTMLCanvasElement,
  blendMode: string,
  opacity: number
): HTMLCanvasElement {
  const preservedCanvas = document.createElement('canvas');
  preservedCanvas.width = sourceCanvas.width;
  preservedCanvas.height = sourceCanvas.height;
  const ctx = preservedCanvas.getContext('2d');
  
  if (!ctx) return sourceCanvas;
  
  // Copy the original with adjusted opacity
  ctx.globalAlpha = opacity;
  ctx.drawImage(sourceCanvas, 0, 0);
  
  // Apply color correction based on blend mode
  if (blendMode === 'multiply' || blendMode === 'darken') {
    // Brighten the result slightly to preserve color vibrancy
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, preservedCanvas.width, preservedCanvas.height);
  }
  
  return preservedCanvas;
}

/**
 * Convert blend mode to canvas composite operation
 */
function getCanvasBlendMode(blendMode: string): GlobalCompositeOperation {
  const blendModeMap: Record<string, GlobalCompositeOperation> = {
    'normal': 'source-over',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'soft_light': 'soft-light',
    'hard_light': 'hard-light',
    'darken': 'darken',
    'lighten': 'lighten',
    'color-dodge': 'color-dodge',
    'color-burn': 'color-burn',
    'difference': 'difference',
    'exclusion': 'exclusion'
  };
  
  return blendModeMap[blendMode] || 'source-over';
}

/**
 * Resolve image URL to absolute path
 */
function resolveImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  const baseUrl = import.meta.env.VITE_PAYLOAD_BASE_URL;
  
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/api/media/file/${url}`;
}

export default FlatMockupEngine;