// src/components/Designer/engines/DynamicMockupEngine.tsx - COMPLETE FIX
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';

interface DesignElement {
  id: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  zIndex?: number;
  image?: HTMLImageElement;
  imageName?: string;
  imageUrl?: string;
  opacity?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
}

interface UVMapSettings {
  srfc: 'cylinder' | 'plane' | 'sphere' | 'cone';
  uStart: number;
  vStart: number;
  uSpan: number;
  vSpan: number;
  uRepeat: number;
  vRepeat: number;
  rotationDeg: number | null;
  orn: {
    type: string;
    featureName: string | null;
    angleDeg: number | null;
    pixelX: number | null;
  };
  wrpmdU: 'clamp' | 'repeat' | 'mirror';
  wpmdV: 'clamp' | 'repeat' | 'mirror';
}

interface PayloadCMSMockupData {
  id: string;
  photo: {
    id: number;
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  area: Array<{
    id: string;
    areaName: string;
    visibility: 'full' | 'partial' | 'edge' | 'sleeve';
    visibilityPercentage?: number;
    uvMap?: UVMapSettings;
    design: {
      coordinateX: number;
      coordinateY: number;
      coordinateWidth: number;
      coordinateHeight: number;
      rotation: number;
      skewX: number;
      skewY: number;
      scaleX: number;
      scaleY: number;
      blend: string;
      opacity: number | null;
      preserveColors: boolean | null;
    };
    surfaceWrapSettings?: {
      enableWrap: boolean;
      wrapAngle: number;
      wrapIntensity: number;
      dynamicWrap: boolean;
      wrapFalloff: number;
    };
    fbrc?: {
      enableFabricBlend: boolean;
      bfab: string;
      foldAwareness: boolean;
      seamAwareness: boolean;
      textureIntensity: number;
      fabricColor: string;
      fabricRoughness: number;
    };
    Config?: {
      enableMasking: boolean;
      mask: string;
      maskPath?: string;
    };
    grdnmsk?: {
      grdn: string;
      gradientAngle: number;
      fadeStart: number;
      fadeEnd: number;
      fadeIntensity: number;
    };
  }>;
  dispMaps?: Array<{
    id: string;
    dispImg: {
      id: number;
      url: string;
      alt: string;
      width: number;
      height: number;
      filename?: string;
    };
    dsrfaceTy?: 'cylindrical' | 'conical' | 'spherical';
    dsrface?: string;
    disint: number;
    disarea: string;
  }>;
  alpMasks?: Array<{
    id: string;
    maskImg: {
      id: number;
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    alfarea: string;
    alfamask: 'alpha' | 'luminance' | 'red_channel';
    featherEdge: number;
  }>;
  light?: Array<{
    id: string;
    overImage: {
      id: number;
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    overlayType: 'lighting' | 'shadow' | 'reflection' | 'ambient';
    overbldMde: string;
    ovlayOpa: number;
    overlayArea?: string;
  }>;
}

interface SurfaceConfiguration {
  renderType: 'flat' | 'cylindrical' | 'conical' | 'spherical' | 'complex_3d';
  [key: string]: any;
}

interface DynamicMockupEngineProps {
  mockup: PayloadCMSMockupData;
  designElements: Record<string, DesignElement[]>;
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
  surfaceConfiguration?: SurfaceConfiguration;
  onRenderComplete?: (imageData: string) => void;
  onProgress?: (progress: number) => void;
}

const DynamicMockupEngine: React.FC<DynamicMockupEngineProps> = ({
  mockup,
  designElements,
  canvasConfigs,
  canvasPrintableAreas,
  displayDimensions,
  productType,
  productColor,
  fabricSettings = {
    enableRealisticFabric: true,
    dynamicVisibility: true,
    adaptiveBlending: true
  },
  surfaceConfiguration,
  onRenderComplete,
  onProgress
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const mountedRef = useRef(true);
  const renderingRef = useRef(false);
  const cleanupInProgressRef = useRef(false);
  const textureCache = useRef<Map<string, PIXI.Texture>>(new Map());
  const cleanupFunctions = useRef<Array<() => void>>([]);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [renderCompleted, setRenderCompleted] = useState(false);
  const [lastMockupId, setLastMockupId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const debugMessage = useCallback((message: string, data?: any) => {
    console.log(`[DynamicMockup] ${message}`, data || '');
  }, []);

  const updateProgress = useCallback((progress: number) => {
    if (!mountedRef.current || !renderingRef.current) return;
    
    setRenderProgress(Math.min(100, Math.max(0, progress)));
    onProgress?.(progress);
    
    if (progress >= 100) {
      setTimeout(() => {
        if (mountedRef.current && renderingRef.current) {
          setIsRendering(false);
          setRenderCompleted(true);
          renderingRef.current = false;
        }
      }, 100);
    }
  }, [onProgress]);

  const resolveImageUrl = useCallback((url: string): string => {
    if (!url) return '';
    
    if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http')) {
      return url;
    }
    
    const backendUrl = import.meta.env?.VITE_PAYLOAD_BASE_URL;
    return url.startsWith('/') ? `${backendUrl}${url}` : `${backendUrl}/${url}`;
  }, []);

  const loadImageSafely = useCallback(async (url: string, description: string): Promise<PIXI.Texture | null> => {
    if (!url || !mountedRef.current) return null;

    const resolvedUrl = resolveImageUrl(url);
    const cacheKey = `${resolvedUrl}_${description}`;
    
    if (textureCache.current.has(cacheKey)) {
      const cachedTexture = textureCache.current.get(cacheKey);
      if (cachedTexture && !cachedTexture.destroyed) {
        return cachedTexture;
      } else {
        textureCache.current.delete(cacheKey);
      }
    }

    try {
      const loadPromise = new Promise<PIXI.Texture>((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error(`Timeout loading ${description}`)), 10000);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          clearTimeout(timeoutId);
          if (!mountedRef.current) {
            reject(new Error('Component unmounted'));
            return;
          }
          
          try {
            const texture = PIXI.Texture.from(img);
            textureCache.current.set(cacheKey, texture);
            resolve(texture);
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error(`Failed to load ${description}`));
        };
        
        img.src = resolvedUrl;
      });

      return await loadPromise;
      
    } catch (error) {
      console.error(`Failed to load ${description}:`, error);
      return null;
    }
  }, [resolveImageUrl]);

  const getPixiBlend = useCallback((blend: string): number => {
    if (typeof PIXI?.BLEND_MODES === 'undefined') {
      switch (blend?.toLowerCase()) {
        case 'multiply': return 2;
        case 'screen': return 3;
        case 'overlay': return 4;
        default: return 0;
      }
    }

    switch (blend?.toLowerCase()) {
      case 'multiply': return PIXI.BLEND_MODES.MULTIPLY || 2;
      case 'screen': return PIXI.BLEND_MODES.SCREEN || 3;
      case 'overlay': return PIXI.BLEND_MODES.OVERLAY || 4;
      default: return PIXI.BLEND_MODES.NORMAL || 0;
    }
  }, []);

  const createAlphaMask = useCallback(async (
    visibleArea: any,
    areaName: string,
    designContainer: PIXI.Container,
    mockupDimensions: { width: number; height: number; x: number; y: number }
  ): Promise<void> => {
    try {
      const alphaMask = mockup.alpMasks?.find(mask => 
        mask.alfarea.toLowerCase() === areaName.toLowerCase()
      );
      
      if (alphaMask?.maskImg?.url) {
        console.log(`🎭 Applying alpha mask for ${areaName}`);
        const maskTexture = await loadImageSafely(alphaMask.maskImg.url, `alpha mask for ${areaName}`);
        
        if (maskTexture) {
          const maskSprite = new PIXI.Sprite(maskTexture);
          maskSprite.width = mockupDimensions.width;
          maskSprite.height = mockupDimensions.height;
          maskSprite.x = -mockupDimensions.x;
          maskSprite.y = -mockupDimensions.y;
          
          designContainer.mask = maskSprite;
          if (designContainer.parent) {
            designContainer.parent.addChild(maskSprite);
          }
          
          console.log(`✅ Alpha mask applied for ${areaName}`);
        }
      }
    } catch (error) {
      console.error(`❌ Alpha mask error for ${areaName}:`, error);
    }
  }, [mockup.alpMasks, loadImageSafely]);

  const cleanup = useCallback(() => {
    if (cleanupInProgressRef.current) return;
    
    cleanupInProgressRef.current = true;
    mountedRef.current = false;
    renderingRef.current = false;
    
    cleanupFunctions.current.forEach((fn) => {
      try { fn(); } catch (error) {}
    });
    cleanupFunctions.current = [];
    
    if (appRef.current) {
      try {
        const app = appRef.current;
        if (!app.destroyed) {
          try { if (app.ticker) app.ticker.stop(); } catch (e) {}
          try { if (app.stage) app.stage.removeChildren(); } catch (e) {}
          try { if (app.renderer) app.renderer.destroy(true); } catch (e) {}
          try { app.destroy(false, { children: false, texture: false, baseTexture: false }); } catch (e) {}
        }
        appRef.current = null;
      } catch (error) {
        appRef.current = null;
      }
    }
    
    try {
      textureCache.current.forEach((texture) => {
        try { if (texture && !texture.destroyed) texture.destroy(); } catch (e) {}
      });
      textureCache.current.clear();
    } catch (e) {}
    
    setIsLoaded(false);
    setIsRendering(false);
    setRenderCompleted(false);
    setRenderProgress(0);
    setError(null);
    
    cleanupInProgressRef.current = false;
  }, []);

  const initializePixi = useCallback(async () => {
    if (!canvasRef.current || !mountedRef.current || renderingRef.current) return;

    if (appRef.current) {
      cleanup();
      await new Promise(resolve => requestAnimationFrame(resolve));
    }

    if (!mountedRef.current) return;

    console.log('🎨 Initializing PIXI');
    renderingRef.current = true;
    setIsRendering(true);
    setRenderCompleted(false);
    setError(null);
    updateProgress(10);

    try {
      const app = new PIXI.Application();
      
      await app.init({
        canvas: canvasRef.current,
        width: displayDimensions.width,
        height: displayDimensions.height,
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
        clearBeforeRender: true
      });

      if (!mountedRef.current) {
        app.destroy(true, true);
        return;
      }

      appRef.current = app;
      
      cleanupFunctions.current.push(() => {
        if (app && !app.destroyed) {
          try { app.destroy(true, true); } catch (error) {}
        }
      });
      
      updateProgress(20);
      await renderMockup(app);
      
      if (mountedRef.current) {
        setIsLoaded(true);
      }

    } catch (error) {
      console.error('❌ PIXI init failed:', error);
      setError(error instanceof Error ? error.message : 'PIXI initialization failed');
      renderingRef.current = false;
      setIsRendering(false);
      setRenderCompleted(true);
      updateProgress(0);
      onRenderComplete?.('');
    }
  }, [displayDimensions, updateProgress, onRenderComplete, cleanup]);

  const renderMockup = useCallback(async (app: PIXI.Application) => {
    if (!mountedRef.current || !renderingRef.current) return;
    
    console.log('\n🎬 ===== RENDERING MOCKUP =====\n');
    updateProgress(25);

    try {
      app.stage.removeChildren();
      app.stage.sortableChildren = true;

      // Load base mockup
      const mockupTexture = await loadImageSafely(mockup.photo.url, 'mockup photo');
      
      if (!mockupTexture || !mountedRef.current) {
        throw new Error('Failed to load mockup');
      }

      const mockupSprite = new PIXI.Sprite(mockupTexture);
      
      const mockupAspectRatio = mockup.photo.width / mockup.photo.height;
      const displayAspectRatio = displayDimensions.width / displayDimensions.height;
      
      let mockupDisplayWidth, mockupDisplayHeight;
      
      if (mockupAspectRatio > displayAspectRatio) {
        mockupDisplayWidth = displayDimensions.width;
        mockupDisplayHeight = displayDimensions.width / mockupAspectRatio;
      } else {
        mockupDisplayHeight = displayDimensions.height;
        mockupDisplayWidth = displayDimensions.height * mockupAspectRatio;
      }
      
      mockupSprite.width = mockupDisplayWidth;
      mockupSprite.height = mockupDisplayHeight;
      mockupSprite.x = (displayDimensions.width - mockupDisplayWidth) / 2;
      mockupSprite.y = (displayDimensions.height - mockupDisplayHeight) / 2;
      mockupSprite.zIndex = 0;
      
      app.stage.addChild(mockupSprite);
      console.log(`✅ Mockup: ${mockupDisplayWidth.toFixed(0)}x${mockupDisplayHeight.toFixed(0)}`);
      
      const mockupDimensions = {
        width: mockupDisplayWidth,
        height: mockupDisplayHeight,
        x: mockupSprite.x,
        y: mockupSprite.y
      };
      
      updateProgress(40);

      const area = mockup.area || [];
      console.log(`\n🗺️ Processing ${area.length} areas\n`);

      for (let index = 0; index < area.length; index++) {
        if (!mountedRef.current || !renderingRef.current) break;
        
        const visibleArea = area[index];
        const areaName = visibleArea.areaName;
        
        console.log(`\n📍 === AREA: ${areaName} ===`);
        
        const uvSettings = visibleArea.uvMap;
        
        if (!uvSettings) {
          console.log(`⚠️ No UV mapping`);
          continue;
        }
        
        // Find design elements
        const areaVariations = [areaName, areaName.toLowerCase(), 'front', 'Front'];
        
        let areaDesignElements: DesignElement[] = [];
        let foundAreaKey = '';
        let canvasConfig: any = null;
        
        for (const variation of areaVariations) {
          if (designElements[variation] && designElements[variation].length > 0) {
            areaDesignElements = designElements[variation];
            foundAreaKey = variation;
            canvasConfig = canvasConfigs[variation];
            break;
          }
        }
        
        if (!canvasConfig) {
          for (const variation of areaVariations) {
            if (canvasConfigs[variation]) {
              canvasConfig = canvasConfigs[variation];
              break;
            }
          }
        }
        
        if (areaDesignElements.length === 0) {
          console.log(`⚠️ No design elements`);
          continue;
        }

        console.log(`✅ Found ${areaDesignElements.length} elements`);

        try {
          const designContainer = new PIXI.Container();
          designContainer.zIndex = 10 + index;
          designContainer.sortableChildren = true;
          
          // Calculate UV area in pixels on mockup
          const uvAreaX = uvSettings.uStart * mockupDisplayWidth;
          const uvAreaY = uvSettings.vStart * mockupDisplayHeight;
          const uvAreaWidth = uvSettings.uSpan * mockupDisplayWidth;
          const uvAreaHeight = uvSettings.vSpan * mockupDisplayHeight;
          
          console.log(`📐 UV area: (${uvAreaX.toFixed(0)}, ${uvAreaY.toFixed(0)}) ${uvAreaWidth.toFixed(0)}x${uvAreaHeight.toFixed(0)}`);
          
          // Get canvas dimensions
          const canvasWidth = canvasConfig?.canvasPixWid || 500;
          const canvasHeight = canvasConfig?.canvasPixHeight || 500;
          
          // Get printable area
          const printableArea = canvasPrintableAreas?.[areaName] || canvasPrintableAreas?.[foundAreaKey];

          let printableX = 0;
          let printableY = 0;
          let printableWidth = canvasWidth;
          let printableHeight = canvasHeight;

          if (printableArea) {
            const rawX = printableArea.x || 0;
            const rawY = printableArea.y || 0;
            const rawWidth = printableArea.width || 1;
            const rawHeight = printableArea.height || 1;
            
            // Check if already in pixels
            if (rawWidth > 100 || rawHeight > 100) {
              printableX = rawX;
              printableY = rawY;
              printableWidth = rawWidth;
              printableHeight = rawHeight;
            } else {
              // Normalized coordinates
              printableX = rawX * canvasWidth;
              printableY = rawY * canvasHeight;
              printableWidth = rawWidth * canvasWidth;
              printableHeight = rawHeight * canvasHeight;
            }
            
            console.log(`📐 Printable: ${printableWidth.toFixed(0)}x${printableHeight.toFixed(0)} at (${printableX.toFixed(0)}, ${printableY.toFixed(0)})`);
          }

          // Calculate scale from canvas printable area to UV area
          const scaleX = uvAreaWidth / printableWidth;
          const scaleY = uvAreaHeight / printableHeight;
          
          console.log(`⚖️ Canvas→UV Scale: X=${scaleX.toFixed(4)}, Y=${scaleY.toFixed(4)}`);
          
          // Render design elements
          for (const [elemIndex, element] of areaDesignElements.entries()) {
            if (!mountedRef.current || !renderingRef.current) break;
            
            try {
              if (element.type === 'image' && element.imageUrl) {
                const designTexture = await loadImageSafely(element.imageUrl, `design ${element.id}`);
                
                if (designTexture && mountedRef.current) {
                  const designSprite = new PIXI.Sprite(designTexture);
                  
                  // Transform from canvas coordinates to UV container coordinates
                  const relativeX = (element.x || 0) - printableX;
                  const relativeY = (element.y || 0) - printableY;

                  // Scale elements from canvas space to UV space
                  designSprite.x = relativeX * scaleX;
                  designSprite.y = relativeY * scaleY;
                  designSprite.width = (element.width || 100) * scaleX;
                  designSprite.height = (element.height || 100) * scaleY;
                  
                  if (element.rotation) {
                    designSprite.anchor.set(0.5);
                    designSprite.x += designSprite.width / 2;
                    designSprite.y += designSprite.height / 2;
                    designSprite.rotation = element.rotation * Math.PI / 180;
                  }
                  
                  designSprite.alpha = element.opacity || 1;
                  designSprite.zIndex = element.zIndex || elemIndex;
                  
                  if (element.scaleX !== undefined) designSprite.scale.x *= element.scaleX;
                  if (element.scaleY !== undefined) designSprite.scale.y *= element.scaleY;
                  
                  designContainer.addChild(designSprite);
                  console.log(`  ✅ Added image at (${designSprite.x.toFixed(0)}, ${designSprite.y.toFixed(0)}) size=${designSprite.width.toFixed(0)}x${designSprite.height.toFixed(0)}`);
                }
              }
            } catch (elementError) {
              console.error(`❌ Element error:`, elementError);
              continue;
            }
          }
          
          // NOW position container at UV coordinates using mockupDimensions
          designContainer.x = mockupDimensions.x + uvAreaX;
          designContainer.y = mockupDimensions.y + uvAreaY;
          
          console.log(`📍 Container position: (${designContainer.x.toFixed(0)}, ${designContainer.y.toFixed(0)})`);
          
          // Apply design coordinate adjustments if present
          const placement = visibleArea.design;
          
          if (placement && placement.coordinateWidth && placement.coordinateHeight) {
            const designAreaX = placement.coordinateX * mockupDisplayWidth;
            const designAreaY = placement.coordinateY * mockupDisplayHeight;
            const designAreaWidth = placement.coordinateWidth * mockupDisplayWidth;
            const designAreaHeight = placement.coordinateHeight * mockupDisplayHeight;
            
            console.log(`📍 Design coords: (${designAreaX.toFixed(0)}, ${designAreaY.toFixed(0)}) ${designAreaWidth.toFixed(0)}x${designAreaHeight.toFixed(0)}`);
            
            // 🎯 FILL ENTIRE DESIGN AREA with non-uniform scaling
            // For mug wraps, we want to stretch the design to fill the entire printable area
            const designScaleX = designAreaWidth / uvAreaWidth;
            const designScaleY = designAreaHeight / uvAreaHeight;
            
            // Apply FULL scaling to fill entire area (stretch to fit)
            designContainer.scale.x *= designScaleX;
            designContainer.scale.y *= designScaleY;
            
            // Position at design coordinates using mockupDimensions (no centering - fill entire area)
            designContainer.x = mockupDimensions.x + designAreaX;
            designContainer.y = mockupDimensions.y + designAreaY;
            
            console.log(`✅ Applied FILL scale: X=${designScaleX.toFixed(4)}, Y=${designScaleY.toFixed(4)} (stretches to fill)`);
            console.log(`✅ Final position: (${designContainer.x.toFixed(0)}, ${designContainer.y.toFixed(0)}) size=${designAreaWidth.toFixed(0)}x${designAreaHeight.toFixed(0)}`);
            
            if (placement.blend) {
              designContainer.blendMode = getPixiBlend(placement.blend);
            }
            
            if (placement.opacity !== null && placement.opacity !== undefined && placement.opacity !== 1) {
              designContainer.alpha = Math.max(0, Math.min(1, placement.opacity));
            }
          }
          
          // ⭐ APPLY DISPLACEMENT (if available) ⭐
          // Apply AFTER all scaling/positioning but BEFORE adding to stage
          const displacementMap = mockup.dispMaps?.find(dm => 
            dm.disarea?.toLowerCase() === areaName.toLowerCase()
          );
          
          if (displacementMap?.dispImg?.url && placement) {
            try {
              const dispTexture = await loadImageSafely(displacementMap.dispImg.url, `displacement for ${areaName}`);
              
              if (dispTexture && mountedRef.current) {
                // Create displacement sprite
                const displacementSprite = new PIXI.Sprite(dispTexture);
                
                // Get current container bounds (after all scaling/positioning)
                const containerBounds = designContainer.getBounds();
                
                // Position and size displacement sprite to match the actual rendered container
                displacementSprite.x = containerBounds.x;
                displacementSprite.y = containerBounds.y;
                displacementSprite.width = containerBounds.width;
                displacementSprite.height = containerBounds.height;
                
                console.log(`🔄 Displacement sprite: pos=(${displacementSprite.x.toFixed(0)},${displacementSprite.y.toFixed(0)}) size=${displacementSprite.width.toFixed(0)}x${displacementSprite.height.toFixed(0)}`);
                
                // Calculate displacement strength based on design area
                const designAreaWidth = placement.coordinateWidth * mockupDisplayWidth;
                const intensity = displacementMap.disint || 0.8;
                
                // Use negative X for cylindrical wrap (edges curve inward)
                const displacementScale = {
                  x: -(designAreaWidth * intensity * 0.2),  // Negative for inward curve, 20% strength
                  y: 0  // No vertical displacement
                };
                
                console.log(`🔥 Applying displacement: X=${displacementScale.x.toFixed(1)}, Y=${displacementScale.y.toFixed(1)}`);
                
                // Create displacement filter
                const displacementFilter = new PIXI.DisplacementFilter({
                  sprite: displacementSprite,
                  scale: displacementScale
                });
                
                // Apply filter to container
                designContainer.filters = [displacementFilter];
                
                // Add displacement sprite to stage (required for filter to work)
                app.stage.addChild(displacementSprite);
                
                console.log(`✅ Displacement filter applied`);
              }
            } catch (dispError) {
              console.warn(`⚠️ Displacement error:`, dispError);
            }
          }
          
          // Add to stage
          app.stage.addChild(designContainer);

          // Apply alpha mask (last)
          try {
            if (visibleArea.Config?.enableMasking || mockup.alpMasks?.length) {
              await createAlphaMask(visibleArea, areaName, designContainer, mockupDimensions);
            }
          } catch (maskError) {
            console.warn(`⚠️ Mask error:`, maskError);
          }

          console.log(`✅ Completed ${areaName}\n`);
          
        } catch (areaError) {
          console.error(`❌ Area error:`, areaError);
          continue;
        }
      }

      updateProgress(95);

      if (mountedRef.current && renderingRef.current) {
        app.stage.sortChildren();
        app.render();
        
        updateProgress(100);
        
        try {
          const imageData = app.canvas.toDataURL();
          onRenderComplete?.(imageData);
        } catch (error) {
          onRenderComplete?.('');
        }
      }

      console.log('\n✅ ===== RENDER COMPLETE =====\n');

    } catch (error) {
      console.error('❌ Render failed:', error);
      setError(error instanceof Error ? error.message : 'Rendering failed');
      renderingRef.current = false;
      setIsRendering(false);
      setRenderCompleted(true);
      updateProgress(0);
      onRenderComplete?.('');
    }
  }, [
    mockup,
    designElements,
    canvasConfigs,
    canvasPrintableAreas,
    displayDimensions,
    loadImageSafely,
    updateProgress,
    onRenderComplete,
    createAlphaMask,
    getPixiBlend
  ]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (mockup?.id !== lastMockupId) {
      setLastMockupId(mockup?.id || '');
      
      if (mockup && mockup.photo?.url) {
        initializePixi();
      } else {
        setRenderCompleted(true);
        onRenderComplete?.('');
      }
    }

    return () => {
      cleanup();
    };
  }, [mockup?.id, initializePixi, cleanup, onRenderComplete]);

  useEffect(() => {
    if (!appRef.current || !isLoaded || renderingRef.current || !mountedRef.current) return;
    
    const hasDesignElements = Object.values(designElements).some(elements => elements.length > 0);
    
    if (hasDesignElements) {
      renderingRef.current = true;
      setIsRendering(true);
      setRenderCompleted(false);
      renderMockup(appRef.current);
    }
  }, [designElements, isLoaded, renderMockup]);

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full border border-red-200 rounded-lg bg-red-50">
        <div className="p-4 text-center">
          <div className="mb-2 text-lg text-red-600">⚠️</div>
          <div className="mb-1 font-medium text-red-800">Rendering Error</div>
          <div className="text-sm text-red-600">{error}</div>
          <button
            onClick={() => {
              setError(null);
              initializePixi();
            }}
            className="px-3 py-1 mt-2 text-xs text-white bg-red-600 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full border border-gray-200 rounded-lg"
        style={{ 
          imageRendering: 'auto',
          maxWidth: '100%',
          height: 'auto'
        }}
      />

      {isRendering && !renderCompleted && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-center w-full h-full">
            <div className="w-12 h-12 border-t-2 border-b-2 border-orange-500 rounded-full animate-spin"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicMockupEngine;
