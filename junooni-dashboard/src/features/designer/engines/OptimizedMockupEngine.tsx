// src/components/Designer/engines/BalancedMockupEngine.tsx
import React, { useRef, useEffect, useState } from 'react';

interface BalancedMockupEngineProps {
  mockup: any;
  designElements: Record<string, any[]>;
  canvasConfigs: Record<string, any>;
  canvasPrintableAreas: Record<string, any>;
  displayDimensions: { width: number; height: number };
  productType: string;
  productColor: string;
  fabricSettings?: {
    enableRealisticFabric: boolean;
    dynamicVisibility: boolean;
    adaptiveBlending: boolean;
  };
}

/**
 * Balanced Mockup Engine - High Quality + Good Performance
 * Maintains professional print-ready quality while optimizing performance
 * Focus: Real print accuracy without unnecessary artifacts
 */
export const BalancedMockupEngine: React.FC<BalancedMockupEngineProps> = ({
  mockup,
  designElements,
  canvasConfigs,
  canvasPrintableAreas,
  displayDimensions,
  productType,
  productColor,
  fabricSettings
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [renderTime, setRenderTime] = useState<number>(0);
  
  useEffect(() => {
    if (!canvasRef.current || !mockup?.photo?.url) {
      setIsLoading(false);
      return;
    }
    
    const canvas = canvasRef.current;
    // Keep alpha enabled for PNG transparency quality
    const ctx = canvas.getContext('2d', { 
      willReadFrequently: false, 
      alpha: true, // KEEP for PNG quality
      desynchronized: true // Better performance
    });
    
    if (!ctx) {
      setRenderError('Failed to get canvas context');
      return;
    }
    
    const renderBalancedMockup = async () => {
      try {
        const startTime = performance.now();
        
        // Load mockup image with retry for reliability
        const mockupImg = await loadImageWithRetry(resolveImageUrl(mockup.photo.url));
        
        // Clear and draw mockup background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // HIGH QUALITY: Use best image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high'; // Maintain high quality
        
        ctx.drawImage(mockupImg, 0, 0, displayDimensions.width, displayDimensions.height);
        
        // Get fabric properties from PayloadCMS
        const fabricProperties = mockup.fabricProperties || getDefaultFabricProperties(productType);
        const lightingConditions = mockup.lightingConditions || getDefaultLightingConditions();
        
        console.log('🎯 Balanced rendering - Quality priority with performance optimizations');
        
        // Process visible areas with balanced approach
        if (mockup.visibleAreas && mockup.visibleAreas.length > 0) {
          for (const visibleArea of mockup.visibleAreas) {
            await renderBalancedVisibleArea(
              ctx,
              visibleArea,
              designElements,
              canvasConfigs,
              canvasPrintableAreas,
              displayDimensions,
              fabricProperties,
              lightingConditions,
              fabricSettings
            );
          }
        }
        
        // Apply minimal realistic effects that enhance quality
        if (fabricSettings?.enableRealisticFabric) {
          await applyQualityEnhancingEffects(
            ctx,
            displayDimensions,
            productType,
            fabricProperties,
            lightingConditions
          );
        }
        
        const endTime = performance.now();
        setRenderTime(endTime - startTime);
        console.log(`✅ Balanced render completed in ${(endTime - startTime).toFixed(2)}ms`);
        
        setIsLoading(false);
        
      } catch (error) {
        console.error('Balanced mockup render error:', error);
        setRenderError('Failed to render quality mockup');
        setIsLoading(false);
      }
    };
    
    renderBalancedMockup();
    
  }, [mockup, designElements, canvasConfigs, canvasPrintableAreas, displayDimensions, productType, productColor, fabricSettings]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Rendering professional quality mockup...</p>
          <p className="text-xs text-gray-500 mt-1">Optimized for print accuracy</p>
        </div>
      </div>
    );
  }
  
  if (renderError) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-sm text-gray-600">{renderError}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={displayDimensions.width}
        height={displayDimensions.height}
        className="w-full h-full object-contain"
      />
      {/* Quality indicator */}
      {renderTime > 0 && (
        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <span>🏆</span>
          <span>QUALITY: {renderTime.toFixed(0)}ms</span>
        </div>
      )}
    </div>
  );
};

/**
 * Render visible area with balanced quality and performance
 */
async function renderBalancedVisibleArea(
  ctx: CanvasRenderingContext2D,
  visibleArea: any,
  designElements: Record<string, any[]>,
  canvasConfigs: Record<string, any>,
  canvasPrintableAreas: Record<string, any>,
  displayDimensions: { width: number; height: number },
  fabricProperties: any,
  lightingConditions: any,
  fabricSettings?: any
) {
  const areaName = visibleArea.areaName.toLowerCase();
  const areaElements = designElements[areaName] || [];
  
  if (areaElements.length === 0) {
    console.log(`✨ Clean area ${areaName} - no design, maintaining product authenticity`);
    return; // Keep areas clean when no design - this IMPROVES quality
  }
  
  const canvasConfig = canvasConfigs[areaName];
  const printableArea = canvasPrintableAreas[areaName];
  const placement = visibleArea.desgnPlacment;
  
  if (!canvasConfig || !printableArea || !placement) return;

  // Calculate placement area
  const placementArea = {
    x: placement.coord.x * displayDimensions.width,
    y: placement.coord.y * displayDimensions.height,
    width: placement.coord.width * displayDimensions.width,
    height: placement.coord.height * displayDimensions.height
  };
  
  console.log(`🎨 Rendering balanced area: ${areaName} with ${areaElements.length} elements`);

  // Create high-quality design composite
  const designCanvas = await createQualityDesignComposite(
    areaElements,
    canvasConfig,
    printableArea,
    fabricProperties,
    visibleArea.fabricIntegration,
    fabricSettings
  );

  if (!designCanvas) return;

  // Apply professional visibility effects (quality-enhancing)
  if (fabricSettings?.dynamicVisibility && visibleArea.visibility !== 'full') {
    await applyProfessionalVisibilityEffects(
      designCanvas,
      visibleArea,
      fabricProperties
    );
  }

  // Apply realistic fabric effects (only where they improve accuracy)
  const fabricEffects = placement.surfSpecs?.fabricEffects;
  if (fabricEffects?.enableFolds && fabricSettings?.enableRealisticFabric) {
    await applyRealisticFabricEffects(
      designCanvas,
      fabricEffects,
      fabricProperties,
      lightingConditions
    );
  }

  // High-quality rendering with professional transforms
  ctx.save();
  
  // Calculate transform origin with precision
  const transformOriginX = placementArea.x + placementArea.width / 2;
  const transformOriginY = placementArea.y + placementArea.height / 2;
  
  ctx.translate(transformOriginX, transformOriginY);
  
  // Apply transforms with high precision
  if (placement.transforms?.rotation) {
    ctx.rotate(placement.transforms.rotation * Math.PI / 180);
  }
  
  if (placement.transforms?.skewX || placement.transforms?.skewY) {
    const skewX = (placement.transforms.skewX || 0) * Math.PI / 180;
    const skewY = (placement.transforms.skewY || 0) * Math.PI / 180;
    ctx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);
  }
  
  ctx.scale(placement.transforms?.scaleX || 1, placement.transforms?.scaleY || 1);
  ctx.translate(-placementArea.width / 2, -placementArea.height / 2);
  
  // Apply professional blending that matches real print output
  const blendMode = getProfessionalBlendMode(
    placement.renderSettings?.blendMode || 'normal',
    fabricProperties,
    visibleArea.fabricIntegration
  );
  
  ctx.globalCompositeOperation = blendMode;
  ctx.globalAlpha = placement.renderSettings?.opacity || 1;
  
  // Calculate effective printable area
  const effectivePrintableArea = {
    x: Math.max(0, printableArea.x),
    y: Math.max(0, printableArea.y),
    width: Math.min(printableArea.width, canvasConfig.width - Math.max(0, printableArea.x)),
    height: Math.min(printableArea.height, canvasConfig.height - Math.max(0, printableArea.y))
  };
  
  // HIGH QUALITY: Apply subtle quality-enhancing filters
  const qualityFilters = getQualityEnhancingFilters(fabricProperties, visibleArea.fabricIntegration);
  ctx.filter = qualityFilters;
  
  // Draw with maximum quality preservation
  ctx.drawImage(
    designCanvas,
    effectivePrintableArea.x, effectivePrintableArea.y, 
    effectivePrintableArea.width, effectivePrintableArea.height,
    0, 0, placementArea.width, placementArea.height
  );
  
  // Apply professional post-processing (shadows that match real print)
  await applyProfessionalPostProcessing(
    ctx,
    placementArea,
    fabricProperties,
    lightingConditions,
    visibleArea
  );
  
  ctx.restore();
}

/**
 * Create quality design composite with optimized performance
 */
async function createQualityDesignComposite(
  elements: any[],
  canvasConfig: any,
  printableArea: any,
  fabricProperties: any,
  fabricIntegration?: any,
  fabricSettings?: any
): Promise<HTMLCanvasElement | null> {
  if (elements.length === 0) return null;

  const canvas = document.createElement('canvas');
  canvas.width = canvasConfig.width;
  canvas.height = canvasConfig.height;
  
  const ctx = canvas.getContext('2d', { 
    willReadFrequently: false,
    alpha: true, // KEEP for PNG quality
    desynchronized: true 
  });
  if (!ctx) return null;

  // MAXIMUM QUALITY settings for elements
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high'; // Best quality for design elements
  
  console.log(`🖼️ Creating quality design composite for ${elements.length} elements`);

  // Sort by z-index and draw with quality preservation
  const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  
  for (const element of sorted) {
    if (!element.image) continue;

    const elemX = element.x;
    const elemY = element.y;
    const elemWidth = element.width;
    const elemHeight = element.height;
    
    // Quality bounds checking
    if (elemX + elemWidth < printableArea.x || elemY + elemHeight < printableArea.y ||
        elemX > printableArea.x + printableArea.width || elemY > printableArea.y + printableArea.height) {
      continue;
    }

    ctx.save();
    
    // High-precision transforms
    const centerX = elemX + elemWidth / 2;
    const centerY = elemY + elemHeight / 2;
    
    ctx.translate(centerX, centerY);
    ctx.rotate((element.rotation || 0) * Math.PI / 180);
    ctx.scale(element.scaleX || 1, element.scaleY || 1);
    ctx.translate(-centerX, -centerY);
    
    // Render element with quality preservation
    await renderQualityElement(
      ctx,
      element,
      fabricProperties,
      fabricIntegration,
      fabricSettings
    );
    
    ctx.restore();
  }

  return canvas;
}

/**
 * Render individual element with maximum quality
 */
async function renderQualityElement(
  ctx: CanvasRenderingContext2D,
  element: any,
  fabricProperties: any,
  fabricIntegration?: any,
  fabricSettings?: any
) {
  // Check if image is PNG for quality handling
  const isPNG = element.imageUrl?.toLowerCase().includes('.png') || 
               element.imageName?.toLowerCase().includes('.png') ||
               await checkImageHasTransparency(element.image);
  
  if (isPNG) {
    // MAXIMUM QUALITY for PNG images - no effects that could degrade transparency
    console.log(`🖼️ High-quality PNG rendering`);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
    
    // Perfect quality PNG rendering
    ctx.drawImage(
      element.image,
      0, 0, element.image.width, element.image.height,
      element.x, element.y, element.width, element.height
    );
    
  } else {
    // Apply quality-enhancing effects for non-PNG images
    if (fabricIntegration?.enableFabricBlend && fabricSettings?.enableRealisticFabric) {
      const qualityFilters = getElementQualityFilters(fabricProperties, fabricIntegration);
      ctx.filter = qualityFilters;
    }
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(
      element.image,
      0, 0, element.image.width, element.image.height,
      element.x, element.y, element.width, element.height
    );
    
    // Apply subtle quality enhancement overlay (only on non-transparent images)
    if (fabricIntegration?.enableFabricBlend && fabricSettings?.enableRealisticFabric) {
      await applySubtleQualityOverlay(ctx, element, fabricProperties, fabricIntegration);
    }
    
    ctx.filter = 'none';
  }
}

/**
 * Check if image has transparency
 */
async function checkImageHasTransparency(image: HTMLImageElement): Promise<boolean> {
  if (!image) return false;
  
  try {
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(image.width, 50); // Small sample for performance
    canvas.height = Math.min(image.height, 50);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return false;
    
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Check for any transparent pixels
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Apply subtle quality overlay that enhances realism
 */
async function applySubtleQualityOverlay(
  ctx: CanvasRenderingContext2D,
  element: any,
  fabricProperties: any,
  fabricIntegration: any
) {
  // Create minimal texture for quality enhancement
  const overlayCanvas = createQualityTexture(
    element.width, 
    element.height, 
    fabricProperties, 
    fabricIntegration
  );
  
  ctx.save();
  
  // Clip to element bounds
  ctx.beginPath();
  ctx.rect(element.x, element.y, element.width, element.height);
  ctx.clip();
  
  // Apply very subtle overlay that enhances quality
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.03; // Extremely subtle
  ctx.drawImage(overlayCanvas, element.x, element.y, element.width, element.height);
  
  ctx.restore();
}

/**
 * Create quality-enhancing texture
 */
function createQualityTexture(
  width: number,
  height: number,
  fabricProperties: any,
  fabricIntegration: any
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  const fabricType = fabricProperties.fabricType || 'cotton';
  
  // Create very subtle, quality-enhancing texture
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor((i / 4) / width);
    
    let texture = 0;
    
    switch (fabricType) {
      case 'cotton':
        texture = Math.sin(x * 0.03) * Math.cos(y * 0.025) * 3;
        break;
      case 'polyester':
        texture = Math.sin(x * 0.02) * Math.cos(y * 0.015) * 2;
        break;
      case 'canvas':
        texture = Math.sin(x * 0.01) * Math.cos(y * 0.008) * 4;
        break;
      default:
        texture = Math.sin(x * 0.025) * Math.cos(y * 0.02) * 2.5;
    }
    
    const baseColor = 248;
    const finalColor = Math.max(0, Math.min(255, baseColor + texture));
    
    data[i] = finalColor;
    data[i + 1] = finalColor;
    data[i + 2] = finalColor;
    data[i + 3] = 255;
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Apply professional visibility effects
 */
async function applyProfessionalVisibilityEffects(
  canvas: HTMLCanvasElement,
  visibleArea: any,
  fabricProperties: any
) {
  const ctx = canvas.getContext('2d')!;
  
  if (visibleArea.visibility === 'partial') {
    const percentage = visibleArea.visibilityPercentage || 50;
    applyProfessionalPartialEffect(ctx, canvas.width, canvas.height, percentage);
  } else if (visibleArea.visibility === 'edge') {
    applyProfessionalEdgeEffect(ctx, canvas.width, canvas.height);
  }
}

/**
 * Apply professional partial visibility effect
 */
function applyProfessionalPartialEffect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  percentage: number
) {
  const opacity = (100 - percentage) / 200; // Gentle transition
  const fadeRadius = Math.max(width, height) * 0.7;
  
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, fadeRadius
  );
  
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.6, `rgba(0, 0, 0, ${opacity * 0.15})`);
  gradient.addColorStop(1, `rgba(0, 0, 0, ${opacity * 0.4})`);
  
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Apply professional edge effect
 */
function applyProfessionalEdgeEffect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const edgeGradient = ctx.createLinearGradient(0, 0, width, 0);
  edgeGradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  edgeGradient.addColorStop(0.15, 'rgba(0, 0, 0, 0.2)');
  edgeGradient.addColorStop(0.85, 'rgba(0, 0, 0, 0.2)');
  edgeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = edgeGradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

// Helper functions for quality and defaults

function getDefaultFabricProperties(productType: string) {
  const properties = {
    'apparel_tshirt': { fabricType: 'cotton', fabricWeight: 180, surfaceTexture: 'textured', stretchability: 0.3, transparency: 0.02 },
    'apparel_hoodie': { fabricType: 'cotton', fabricWeight: 280, surfaceTexture: 'textured', stretchability: 0.2, transparency: 0.01 },
    'drinkware_mug': { fabricType: 'ceramic', fabricWeight: 400, surfaceTexture: 'smooth', stretchability: 0.0, transparency: 0.0 },
    'accessories_bag': { fabricType: 'canvas', fabricWeight: 350, surfaceTexture: 'rough', stretchability: 0.1, transparency: 0.005 },
    'print_poster': { fabricType: 'paper', fabricWeight: 200, surfaceTexture: 'smooth', stretchability: 0.05, transparency: 0.05 }
  };
  return properties[productType as keyof typeof properties] || properties['apparel_tshirt'];
}

function getDefaultLightingConditions() {
  return {
    lightDirection: 45,
    lightIntensity: 0.7,
    ambientLight: 0.4,
    shadowIntensity: 0.3
  };
}

function getProfessionalBlendMode(
  baseBlendMode: string,
  fabricProperties: any,
  fabricIntegration?: any
): GlobalCompositeOperation {
  // Use source-over for maximum quality unless specifically needed
  if (!fabricIntegration?.enableFabricBlend || baseBlendMode === 'normal') {
    return 'source-over';
  }
  
  const blendModes: Record<string, GlobalCompositeOperation> = {
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'soft_light': 'soft-light'
  };
  
  return blendModes[baseBlendMode] || 'source-over';
}

function getQualityEnhancingFilters(fabricProperties: any, fabricIntegration?: any): string {
  if (!fabricIntegration?.enableFabricBlend) return 'none';
  
  // Very subtle filters that enhance quality
  const fabricType = fabricProperties.fabricType;
  
  switch (fabricType) {
    case 'cotton':
      return 'contrast(1.02) brightness(0.99) saturate(1.01)';
    case 'polyester':
      return 'contrast(1.01) brightness(1.01) saturate(1.02)';
    case 'canvas':
      return 'contrast(1.03) brightness(0.98) saturate(0.99)';
    case 'leather':
      return 'contrast(1.04) brightness(0.97) saturate(0.98)';
    default:
      return 'contrast(1.01) brightness(0.995)';
  }
}

function getElementQualityFilters(fabricProperties: any, fabricIntegration: any): string {
  const baseFilters = getQualityEnhancingFilters(fabricProperties, fabricIntegration);
  return baseFilters !== 'none' ? baseFilters + ' blur(0.1px)' : 'none'; // Tiny blur for anti-aliasing
}

async function applyRealisticFabricEffects(
  canvas: HTMLCanvasElement,
  fabricEffects: any,
  fabricProperties: any,
  lightingConditions: any
) {
  // Only apply effects that improve realism without artifacts
  const ctx = canvas.getContext('2d')!;
  const foldIntensity = Math.min(0.05, fabricEffects.foldIntensity || 0.02);
  
  if (foldIntensity > 0.01) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue; // Skip transparent pixels
      
      const x = (i / 4) % canvas.width;
      const y = Math.floor((i / 4) / canvas.width);
      
      const foldEffect = Math.sin(y * 0.01) * foldIntensity;
      const adjustment = foldEffect * 8;
      
      data[i] = Math.max(0, Math.min(255, data[i] + adjustment));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjustment));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjustment));
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
}

async function applyProfessionalPostProcessing(
  ctx: CanvasRenderingContext2D,
  placementArea: any,
  fabricProperties: any,
  lightingConditions: any,
  visibleArea: any
) {
  // Apply realistic shadow that matches print depth
  const fabricDepth = visibleArea.desgnPlacment?.surfSpecs?.fabricEffects?.fabricDepth || 0;
  
  if (fabricDepth > 0.1) {
    ctx.save();
    
    const shadowIntensity = Math.min(0.15, lightingConditions.shadowIntensity * fabricDepth);
    ctx.shadowColor = `rgba(0, 0, 0, ${shadowIntensity})`;
    ctx.shadowBlur = fabricDepth * 4;
    ctx.shadowOffsetX = Math.cos(lightingConditions.lightDirection * Math.PI / 180) * fabricDepth * 1.5;
    ctx.shadowOffsetY = Math.sin(lightingConditions.lightDirection * Math.PI / 180) * fabricDepth * 1.5;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.001)';
    ctx.fillRect(placementArea.x, placementArea.y, placementArea.width, placementArea.height);
    ctx.restore();
  }
}

async function applyQualityEnhancingEffects(
  ctx: CanvasRenderingContext2D,
  displayDimensions: { width: number; height: number },
  productType: string,
  fabricProperties: any,
  lightingConditions: any
) {
  // Apply minimal global effects that enhance realism
  if (lightingConditions.ambientLight > 0.6) {
    const ambientGradient = ctx.createRadialGradient(
      displayDimensions.width / 2, displayDimensions.height / 2, 0,
      displayDimensions.width / 2, displayDimensions.height / 2, 
      Math.max(displayDimensions.width, displayDimensions.height) / 2
    );
    
    ambientGradient.addColorStop(0, `rgba(255, 255, 255, ${lightingConditions.ambientLight * 0.008})`);
    ambientGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = ambientGradient;
    ctx.fillRect(0, 0, displayDimensions.width, displayDimensions.height);
    ctx.restore();
  }
}

function loadImageWithRetry(url: string, retries: number = 2): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const attemptLoad = (attempt: number) => {
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, 8000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        if (attempt < retries) {
          setTimeout(() => attemptLoad(attempt + 1), 1000);
        } else {
          reject(new Error(`Failed to load image after ${retries} attempts`));
        }
      };
      
      img.src = url;
    };
    
    attemptLoad(1);
  });
}

function resolveImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  const baseUrl = import.meta.env?.VITE_PAYLOAD_BASE_URL || 'http://localhost:3000';
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/api/media/file/${url}`;
}

export default BalancedMockupEngine;