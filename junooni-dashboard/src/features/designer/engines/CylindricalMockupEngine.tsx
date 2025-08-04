// src/components/Designer/engines/CylindricalMockupEngine.tsx
import React, { useRef, useEffect, useState } from 'react';

interface CylindricalMockupEngineProps {
  mockup: any;
  designElements: any[];
  canvasDimensions: { width: number; height: number };
  canvasPrintableArea: { x: number; y: number; width: number; height: number };
  displayDimensions: { width: number; height: number };
  productType: string;
  productColor: string;
}

/**
 * Hybrid Cylindrical Mockup Engine - No Grid Lines
 * Uses overlapping strips with gradient blending for smooth curves
 */
export const CylindricalMockupEngine: React.FC<CylindricalMockupEngineProps> = ({
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

  useEffect(() => {
    const renderMockup = async () => {
      if (!canvasRef.current || !mockup?.photo?.url) {
        setIsLoading(false);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set high quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      try {
        // Load mockup image
        const mockupImg = await loadImage(resolveImageUrl(mockup.photo.url));
        
        // Draw mockup background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(mockupImg, 0, 0, displayDimensions.width, displayDimensions.height);

        // Get placement configuration
        const placement = mockup.designPlacementArea;
        if (!placement?.coordinates || designElements.length === 0) {
          setIsLoading(false);
          return;
        }

        // Create design composite
        const designCanvas = await createDesignComposite(
          designElements,
          canvasDimensions
        );

        // Apply cylindrical wrapping
        await renderCylindricalDesign(
          ctx,
          designCanvas,
          placement,
          displayDimensions
        );

        setIsLoading(false);

      } catch (error) {
        console.error('Render error:', error);
        setIsLoading(false);
      }
    };

    renderMockup();
  }, [mockup, designElements, canvasDimensions, displayDimensions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100">
        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={displayDimensions.width}
      height={displayDimensions.height}
      className="object-contain w-full h-full"
    />
  );
};

/**
 * Create design composite from elements
 */
async function createDesignComposite(
  elements: any[],
  canvasDimensions: any
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = canvasDimensions.width;
  canvas.height = canvasDimensions.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // High quality settings
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Sort by z-index and draw
  const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  
  for (const element of sorted) {
    if (!element.image) continue;

    ctx.save();
    
    const cx = element.x + element.width / 2;
    const cy = element.y + element.height / 2;
    
    ctx.translate(cx, cy);
    ctx.rotate((element.rotation || 0) * Math.PI / 180);
    ctx.scale(element.scaleX || 1, element.scaleY || 1);
    ctx.translate(-cx, -cy);
    
    ctx.drawImage(element.image, element.x, element.y, element.width, element.height);
    
    ctx.restore();
  }

  return canvas;
}

/**
 * Render cylindrical design with no grid lines
 */
async function renderCylindricalDesign(
  ctx: CanvasRenderingContext2D,
  designCanvas: HTMLCanvasElement,
  placement: any,
  displayDimensions: any
) {
  const wrapSettings = placement.surfaceSpecific?.wrapSettings || {};
  const wrapAngle = wrapSettings.wrapAngle || 280;
  const wrapIntensity = wrapSettings.wrapIntensity || 0.8;

  // Calculate placement area
  const area = {
    x: placement.coordinates.x * displayDimensions.width,
    y: placement.coordinates.y * displayDimensions.height,
    width: placement.coordinates.width * displayDimensions.width,
    height: placement.coordinates.height * displayDimensions.height
  };

  // Save context state
  ctx.save();

  // Apply transforms
  const centerX = area.x + area.width / 2;
  const centerY = area.y + area.height / 2;

  ctx.translate(centerX, centerY);

  if (placement.transforms?.rotation) {
    ctx.rotate(placement.transforms.rotation * Math.PI / 180);
  }

  if (placement.transforms?.skewX || placement.transforms?.skewY) {
    const skewX = (placement.transforms.skewX || 0) * Math.PI / 180;
    const skewY = (placement.transforms.skewY || 0) * Math.PI / 180;
    ctx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);
  }

  ctx.scale(placement.transforms?.scaleX || 1, placement.transforms?.scaleY || 1);
  ctx.translate(-area.width / 2, -area.height / 2);

  // Set blend mode
  ctx.globalCompositeOperation = getBlendMode(placement.renderingSettings?.blendMode);
  ctx.globalAlpha = placement.renderingSettings?.opacity || 1;

  // Create temporary canvas for smooth wrapping
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = area.width;
  tempCanvas.height = area.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  if (tempCtx) {
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';

    // Draw cylindrical wrap using hybrid technique
    drawSmoothCylinder(
      tempCtx,
      designCanvas,
      tempCanvas.width,
      tempCanvas.height,
      wrapAngle,
      wrapIntensity
    );

    // Draw the wrapped result
    ctx.drawImage(tempCanvas, 0, 0);
  }

  ctx.restore();
}

/**
 * Draw smooth cylindrical surface without grid lines
 */
function drawSmoothCylinder(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  width: number,
  height: number,
  wrapAngle: number,
  intensity: number
) {
  const wrapRad = (wrapAngle * Math.PI) / 180;
  const radius = width / (2 * Math.sin(wrapRad / 2));
  
  // Calculate visible portion of design
  const wrapRatio = wrapAngle / 360;
  const visibleSourceWidth = source.width * wrapRatio;
  const sourceOffsetX = (source.width - visibleSourceWidth) / 2;

  // Use many thin overlapping slices for smoothness
  const slices = 200; // High number eliminates grid lines
  const sliceWidth = width / slices;
  const overlap = 1.5; // Overlap factor to eliminate seams

  for (let i = 0; i < slices; i++) {
    const x = (i / slices) * width;
    const centerOffset = x - width / 2;
    
    // Calculate cylinder angle
    const angle = Math.asin(Math.max(-1, Math.min(1, centerOffset / radius)));
    
    if (Math.abs(angle) <= wrapRad / 2) {
      // Map to source texture
      const u = (angle + wrapRad / 2) / wrapRad;
      const sourceX = sourceOffsetX + u * visibleSourceWidth;
      
      // Calculate perspective effects
      const perspective = Math.cos(angle);
      const verticalScale = 0.7 + 0.3 * Math.pow(perspective, 0.6) * intensity;
      const brightness = 0.6 + 0.4 * perspective;
      
      // Vertical offset for perspective
      const yOffset = (height - height * verticalScale) / 2;
      
      // Draw slice with overlap
      ctx.save();
      
      // Create clipping region for smooth edges
      ctx.beginPath();
      ctx.rect(x - sliceWidth * overlap / 2, 0, sliceWidth * overlap, height);
      ctx.clip();
      
      // Apply effects
      ctx.globalAlpha = Math.pow(perspective, 0.3);
      ctx.filter = `brightness(${brightness})`;
      
      // Draw the slice
      ctx.drawImage(
        source,
        sourceX - (visibleSourceWidth / slices) * overlap / 2, 0,
        (visibleSourceWidth / slices) * overlap, source.height,
        x - sliceWidth * overlap / 2, yOffset,
        sliceWidth * overlap, height * verticalScale
      );
      
      ctx.restore();
    }
  }

  // Add edge shadows for depth
  const edgeGradient = ctx.createLinearGradient(0, 0, width, 0);
  edgeGradient.addColorStop(0, 'rgba(0,0,0,0.3)');
  edgeGradient.addColorStop(0.1, 'rgba(0,0,0,0)');
  edgeGradient.addColorStop(0.9, 'rgba(0,0,0,0)');
  edgeGradient.addColorStop(1, 'rgba(0,0,0,0.3)');
  
  ctx.fillStyle = edgeGradient;
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillRect(0, 0, width, height);
  
  // Add highlight for glossy effect
  const highlightGradient = ctx.createLinearGradient(0, 0, width, 0);
  highlightGradient.addColorStop(0, 'rgba(255,255,255,0)');
  highlightGradient.addColorStop(0.4, 'rgba(255,255,255,0.1)');
  highlightGradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
  highlightGradient.addColorStop(0.6, 'rgba(255,255,255,0.1)');
  highlightGradient.addColorStop(1, 'rgba(255,255,255,0)');
  
  ctx.fillStyle = highlightGradient;
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.3;
  ctx.fillRect(0, 0, width, height);
}

// Helper functions
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function getBlendMode(mode: string): GlobalCompositeOperation {
  const modes: Record<string, GlobalCompositeOperation> = {
    'normal': 'source-over',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'soft_light': 'soft-light',
    'hard_light': 'hard-light'
  };
  return modes[mode] || 'source-over';
}

function resolveImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `http://localhost:3000${url}`;
  return `http://localhost:3000/api/media/file/${url}`;
}

export default CylindricalMockupEngine;