// src/components/Designer/engines/DynamicMockupEngine.tsx - FIXED CLEANUP ISSUES
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as PIXI from 'pixi.js';

// =====================================
// TYPES FROM EXISTING SYSTEM (unchanged)
// =====================================

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

interface PayloadCMSMockupData {
  id: string;
  photo: {
    id: number;
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  visibleAreas: Array<{
    id: string;
    areaName: string;
    visibility: 'full' | 'partial' | 'edge' | 'sleeve';
    visibilityPercentage?: number;
    designPlacement: {
      coordinateX: number;
      coordinateY: number;
      coordinateWidth: number;
      coordinateHeight: number;
      rotation: number;
      skewX: number;
      skewY: number;
      scaleX: number;
      scaleY: number;
      blendMode: string;
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
    fabricIntegration?: {
      enableFabricBlend: boolean;
      bfabType: string;
      foldAwareness: boolean;
      seamAwareness: boolean;
      textureIntensity: number;
      fabricColor: string;
      fabricRoughness: number;
    };
    maskingConfiguration?: {
      enableMasking: boolean;
      maskType: string;
      maskPath?: string;
    };
    gradientMaskSettings?: {
      gradientDirection: string;
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
    };
    dsrfaceTy: 'cylindrical' | 'conical' | 'spherical';
    disint: number;
    disarea: string;
  }>;
  alphaMasks?: Array<{
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
  lightingOverlays?: Array<{
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

// =====================================
// ENHANCED PIXI.JS MOCKUP ENGINE WITH FIXED CLEANUP
// =====================================

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
  // =====================================
  // REFS & STATE WITH ENHANCED STABILITY TRACKING
  // =====================================
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const mountedRef = useRef(true);
  const renderingRef = useRef(false);
  const cleanupInProgressRef = useRef(false);
  const textureCache = useRef<Map<string, PIXI.Texture>>(new Map());
  const cleanupFunctions = useRef<Array<() => void>>([]);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [renderCompleted, setRenderCompleted] = useState(false);
  const [lastMockupId, setLastMockupId] = useState('');
  const [error, setError] = useState<string | null>(null);

  // =====================================
  // ENHANCED DEBUGGING WITH THROTTLING
  // =====================================
  
  const debugMessage = useCallback((message: string, type: 'info' | 'warn' | 'error' = 'info', data?: any) => {
    if (!mountedRef.current) return;
    
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const icon = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '✅';
    const logMessage = `${timestamp} ${icon} ${message}`;
    
    console.log(logMessage, data || '');
    
    setDebugLog(prev => {
      const newLog = [...prev.slice(-15), logMessage];
      return newLog;
    });
  }, []);

  // =====================================
  // PROGRESS HANDLER WITH RACE CONDITION PREVENTION
  // =====================================
  
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
          debugMessage('Rendering completed successfully!');
        }
      }, 100);
    }
  }, [onProgress, debugMessage]);

  // =====================================
  // ENHANCED IMAGE LOADING WITH CACHING
  // =====================================
  
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
        debugMessage(`Using cached texture for ${description}`);
        return cachedTexture;
      } else {
        textureCache.current.delete(cacheKey);
      }
    }

    try {
      debugMessage(`Loading image: ${description} from ${resolvedUrl}`);
      
      const loadPromise = new Promise<PIXI.Texture>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Timeout loading ${description}`));
        }, 10000);

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
      debugMessage(`Failed to load ${description}`, 'error', error);
      return null;
    }
  }, [resolveImageUrl, debugMessage]);

  // =====================================
  // SURFACE CONFIGURATION UTILITIES
  // =====================================
  
  const getSurfaceConfig = useCallback(() => {
    const defaultConfig = {
      renderType: 'flat' as const,
      wrapIntensity: 0.5,
      curvature: 0.3,
      perspective: 0.2,
      distortion: 0.1
    };

    if (!surfaceConfiguration) {
      // Auto-detect from mockup type
      const mockupType = productType?.toLowerCase() || '';
      if (mockupType.includes('mug') || mockupType.includes('cup')) {
        return { ...defaultConfig, renderType: 'cylindrical' as const, wrapIntensity: 0.8, curvature: 0.6 };
      } else if (mockupType.includes('bottle')) {
        return { ...defaultConfig, renderType: 'conical' as const, wrapIntensity: 0.7, curvature: 0.5 };
      } else if (mockupType.includes('ball') || mockupType.includes('sphere')) {
        return { ...defaultConfig, renderType: 'spherical' as const, wrapIntensity: 0.9, curvature: 0.8 };
      }
    }

    return { ...defaultConfig, ...surfaceConfiguration };
  }, [surfaceConfiguration, productType]);

  // =====================================
  // DISPLACEMENT MAP GENERATION
  // =====================================
  
  const generateDisplacementMap = useCallback((
    wrapAngle: number,
    intensity: number,
    surfaceConfig: any,
    width: number,
    height: number
  ): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        let displacementX = 128;
        let displacementY = 128;
        
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = Math.min(distance / radius, 1);
        
        if (surfaceConfig.renderType === 'cylindrical') {
          // Cylindrical displacement for mugs
          const angle = Math.atan2(dy, dx);
          const cylinderFactor = Math.cos(angle) * intensity;
          displacementX = 128 + (cylinderFactor * normalizedDistance * 127);
          displacementY = 128 + (Math.sin(angle * 2) * intensity * 20);
        } else if (surfaceConfig.renderType === 'conical') {
          // Conical displacement for bottles
          const angle = Math.atan2(dy, dx);
          const coneFactor = (1 - normalizedDistance * 0.3) * intensity;
          displacementX = 128 + (Math.cos(angle) * coneFactor * 127);
          displacementY = 128 + (Math.sin(angle) * coneFactor * 127);
        } else if (surfaceConfig.renderType === 'spherical') {
          // Spherical displacement for balls
          const sphereFactor = Math.sqrt(1 - normalizedDistance * normalizedDistance);
          displacementX = 128 + (dx / radius * sphereFactor * intensity * 127);
          displacementY = 128 + (dy / radius * sphereFactor * intensity * 127);
        }
        
        data[index] = Math.max(0, Math.min(255, displacementX));     // R
        data[index + 1] = Math.max(0, Math.min(255, displacementY)); // G
        data[index + 2] = 128;                                       // B
        data[index + 3] = 255;                                       // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }, []);

  // =====================================
  // PIXI BLEND MODE CONVERSION
  // =====================================
  
  const getPixiBlendMode = useCallback((blendMode: string): PIXI.BLEND_MODES => {
    switch (blendMode?.toLowerCase()) {
      case 'multiply': return PIXI.BLEND_MODES.MULTIPLY;
      case 'screen': return PIXI.BLEND_MODES.SCREEN;
      case 'overlay': return PIXI.BLEND_MODES.OVERLAY;
      case 'soft-light': return PIXI.BLEND_MODES.SOFT_LIGHT;
      case 'hard-light': return PIXI.BLEND_MODES.HARD_LIGHT;
      case 'color-dodge': return PIXI.BLEND_MODES.COLOR_DODGE;
      case 'color-burn': return PIXI.BLEND_MODES.COLOR_BURN;
      case 'darken': return PIXI.BLEND_MODES.DARKEN;
      case 'lighten': return PIXI.BLEND_MODES.LIGHTEN;
      case 'difference': return PIXI.BLEND_MODES.DIFFERENCE;
      case 'exclusion': return PIXI.BLEND_MODES.EXCLUSION;
      default: return PIXI.BLEND_MODES.NORMAL;
    }
  }, []);

  // =====================================
  // DISPLACEMENT FILTER CREATION
  // =====================================
  
  const createDisplacementFilter = useCallback(async (
    wrapSettings: any,
    areaName: string,
    container: PIXI.Container,
    mockupDimensions: { width: number; height: number; x: number; y: number }
  ): Promise<PIXI.DisplacementFilter | null> => {
    if (!wrapSettings?.enableWrap) return null;

    try {
      debugMessage(`Creating displacement filter for ${areaName}`);
      
      let displacementTexture: PIXI.Texture;
      const surfaceConfig = getSurfaceConfig();
      
      const dispMap = mockup.dispMaps?.find(map => 
        map.disarea.toLowerCase() === areaName.toLowerCase()
      );
      
      if (dispMap?.dispImg?.url) {
        debugMessage(`Using PayloadCMS displacement map for ${areaName}`);
        const loadedTexture = await loadImageSafely(
          dispMap.dispImg.url, 
          `displacement map for ${areaName}`
        );
        
        if (loadedTexture) {
          displacementTexture = loadedTexture;
        } else {
          debugMessage(`Failed to load PayloadCMS displacement, generating fallback`, 'warn');
          displacementTexture = PIXI.Texture.from(generateDisplacementMap(
            wrapSettings.wrapAngle || 280,
            wrapSettings.wrapIntensity || 0.8,
            surfaceConfig,
            mockupDimensions.width,
            mockupDimensions.height
          ));
        }
      } else {
        debugMessage(`Generating displacement map for ${areaName}`);
        displacementTexture = PIXI.Texture.from(generateDisplacementMap(
          wrapSettings.wrapAngle || 280,
          wrapSettings.wrapIntensity || 0.8,
          surfaceConfig,
          mockupDimensions.width,
          mockupDimensions.height
        ));
      }

      const displacementSprite = new PIXI.Sprite(displacementTexture);
      displacementSprite.width = mockupDimensions.width;
      displacementSprite.height = mockupDimensions.height;
      displacementSprite.x = -mockupDimensions.x;
      displacementSprite.y = -mockupDimensions.y;
      
      if (container.parent) {
        container.parent.addChild(displacementSprite);
      }
      
      const displacementFilter = new PIXI.DisplacementFilter({
        sprite: displacementSprite,
        scale: {
          x: (wrapSettings.wrapIntensity || 0.5) * 50,
          y: (wrapSettings.wrapIntensity || 0.5) * 50
        }
      });
      
      debugMessage(`Created displacement filter for ${areaName} with intensity ${wrapSettings.wrapIntensity}`);
      return displacementFilter;
      
    } catch (error) {
      debugMessage(`Failed to create displacement filter for ${areaName}`, 'error', error);
      return null;
    }
  }, [mockup.dispMaps, generateDisplacementMap, getSurfaceConfig, loadImageSafely, debugMessage]);

  // =====================================
  // ALPHA MASK CREATION
  // =====================================
  
  const createAlphaMask = useCallback(async (
    visibleArea: any,
    areaName: string,
    designContainer: PIXI.Container,
    mockupDimensions: { width: number; height: number; x: number; y: number }
  ): Promise<void> => {
    try {
      debugMessage(`Creating alpha mask for ${areaName}`);
      
      const alphaMask = mockup.alphaMasks?.find(mask => 
        mask.alfarea.toLowerCase() === areaName.toLowerCase()
      );
      
      if (alphaMask?.maskImg?.url) {
        debugMessage(`Using PayloadCMS alpha mask for ${areaName}`);
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
          
          debugMessage(`Applied PayloadCMS alpha mask for ${areaName}`);
          return;
        }
      }

      // Create gradient mask for partial visibility
      if (visibleArea.gradientMaskSettings || visibleArea.visibility === 'partial') {
        debugMessage(`Creating gradient mask for ${areaName}`);
        
        const gradientMask = createGradientMask(
          mockupDimensions.width,
          mockupDimensions.height,
          visibleArea.gradientMaskSettings,
          visibleArea.visibilityPercentage,
          visibleArea.visibility
        );
        
        if (gradientMask) {
          const maskTexture = PIXI.Texture.from(gradientMask);
          const maskSprite = new PIXI.Sprite(maskTexture);
          maskSprite.width = mockupDimensions.width;
          maskSprite.height = mockupDimensions.height;
          maskSprite.x = -mockupDimensions.x;
          maskSprite.y = -mockupDimensions.y;
          
          designContainer.mask = maskSprite;
          if (designContainer.parent) {
            designContainer.parent.addChild(maskSprite);
          }
          
          debugMessage(`Applied gradient mask for ${areaName} with ${visibleArea.visibilityPercentage}% visibility`);
          return;
        }
      }

      if (visibleArea.visibility === 'partial' && visibleArea.visibilityPercentage) {
        const alpha = visibleArea.visibilityPercentage / 100;
        designContainer.alpha = alpha;
        debugMessage(`Applied simple alpha for ${areaName} (${alpha})`);
      }

    } catch (error) {
      debugMessage(`Failed to create alpha mask for ${areaName}`, 'error', error);
    }
  }, [mockup.alphaMasks, loadImageSafely, debugMessage]);

  // =====================================
  // GRADIENT MASK GENERATION
  // =====================================
  
  const createGradientMask = useCallback((
    width: number,
    height: number,
    gradientSettings: any,
    visibilityPercentage?: number,
    visibility?: string
  ): HTMLCanvasElement | null => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      
      const fadeStart = gradientSettings?.fadeStart || 0.7;
      const fadeEnd = gradientSettings?.fadeEnd || 1.0;
      const intensity = (visibilityPercentage || 80) / 100;
      
      gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
      gradient.addColorStop(fadeStart, `rgba(255, 255, 255, ${intensity})`);
      gradient.addColorStop(fadeEnd, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      return canvas;
    } catch (error) {
      console.error('Error creating gradient mask:', error);
      return null;
    }
  }, []);

  // =====================================
  // ROBUST CLEANUP FUNCTION WITH BETTER ERROR HANDLING
  // =====================================
  
  const cleanup = useCallback(() => {
    // Prevent multiple simultaneous cleanup attempts
    if (cleanupInProgressRef.current) {
      debugMessage('Cleanup already in progress, skipping');
      return;
    }
    
    cleanupInProgressRef.current = true;
    debugMessage('Starting comprehensive cleanup');
    
    mountedRef.current = false;
    renderingRef.current = false;
    
    // Execute custom cleanup functions first
    cleanupFunctions.current.forEach((fn, index) => {
      try {
        fn();
      } catch (error) {
        console.error(`Cleanup function ${index} error:`, error);
      }
    });
    cleanupFunctions.current = [];
    
    // Enhanced PIXI cleanup with individual error handling
    if (appRef.current) {
      try {
        debugMessage('Destroying PIXI application with enhanced error handling');
        const app = appRef.current;
        
        // Step 1: Stop ticker safely
        try {
          if (app.ticker && typeof app.ticker.stop === 'function') {
            app.ticker.stop();
            debugMessage('Ticker stopped successfully');
          }
        } catch (tickerError) {
          console.warn('Error stopping ticker:', tickerError);
        }
        
        // Step 2: Clear stage safely
        try {
          if (app.stage) {
            app.stage.removeChildren();
            debugMessage('Stage children removed');
            
            // Safely destroy stage if it has destroy method
            if (typeof app.stage.destroy === 'function') {
              app.stage.destroy({ 
                children: true, 
                texture: false, 
                baseTexture: false 
              });
              debugMessage('Stage destroyed successfully');
            }
          }
        } catch (stageError) {
          console.warn('Error destroying stage:', stageError);
        }
        
        // Step 3: Destroy renderer safely
        try {
          if (app.renderer && typeof app.renderer.destroy === 'function') {
            app.renderer.destroy(true);
            debugMessage('Renderer destroyed successfully');
          }
        } catch (rendererError) {
          console.warn('Error destroying renderer:', rendererError);
        }
        
        // Step 4: Destroy ticker safely (separate from stopping)
        try {
          if (app.ticker && typeof app.ticker.destroy === 'function') {
            app.ticker.destroy();
            debugMessage('Ticker destroyed successfully');
          }
        } catch (tickerDestroyError) {
          console.warn('Error destroying ticker:', tickerDestroyError);
        }
        
        // Step 5: Finally destroy the app itself
        try {
          if (typeof app.destroy === 'function') {
            app.destroy(true, { 
              children: true, 
              texture: false, 
              baseTexture: false 
            });
            debugMessage('PIXI application destroyed successfully');
          }
        } catch (appDestroyError) {
          console.warn('Error destroying PIXI application:', appDestroyError);
          
          // If the main destroy fails, try alternative cleanup
          try {
            // Manual cleanup of critical properties
            if (app.stage) app.stage = null as any;
            if (app.renderer) app.renderer = null as any;
            if (app.ticker) app.ticker = null as any;
            debugMessage('Manual PIXI cleanup completed');
          } catch (manualCleanupError) {
            console.error('Manual cleanup also failed:', manualCleanupError);
          }
        }
        
        appRef.current = null;
        
      } catch (globalError) {
        console.error('Global PIXI cleanup error:', globalError);
        // Force null the ref even if cleanup failed
        appRef.current = null;
      }
    }
    
    // Clear texture cache safely
    try {
      textureCache.current.forEach((texture, key) => {
        try {
          if (texture && !texture.destroyed && typeof texture.destroy === 'function') {
            texture.destroy();
          }
        } catch (textureError) {
          console.warn(`Error destroying texture ${key}:`, textureError);
        }
      });
      textureCache.current.clear();
      debugMessage('Texture cache cleared');
    } catch (cacheError) {
      console.warn('Error clearing texture cache:', cacheError);
    }
    
    // Reset component state
    setIsLoaded(false);
    setIsRendering(false);
    setRenderCompleted(false);
    setRenderProgress(0);
    setError(null);
    
    cleanupInProgressRef.current = false;
    debugMessage('Comprehensive cleanup completed successfully');
  }, [debugMessage]);

  // =====================================
  // PIXI APPLICATION INITIALIZATION
  // =====================================
  
  const initializePixi = useCallback(async () => {
    if (!canvasRef.current || !mountedRef.current || renderingRef.current) {
      debugMessage('Skipping initialization - invalid state');
      return;
    }

    if (appRef.current) {
      debugMessage('PIXI app already exists, cleaning up first');
      cleanup();
      await new Promise(resolve => requestAnimationFrame(resolve));
    }

    if (!mountedRef.current) return;

    debugMessage('Starting PIXI initialization');
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
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        powerPreference: 'high-performance'
      });

      if (!mountedRef.current) {
        app.destroy(true, true);
        return;
      }

      debugMessage('PIXI Application created successfully');
      appRef.current = app;
      
      cleanupFunctions.current.push(() => {
        if (app && !app.destroyed) {
          try {
            app.destroy(true, true);
          } catch (error) {
            console.warn('Error in cleanup function for app destroy:', error);
          }
        }
      });
      
      updateProgress(20);
      await renderMockup(app);
      
      if (mountedRef.current) {
        setIsLoaded(true);
        debugMessage('PIXI initialization completed successfully');
      }

    } catch (error) {
      debugMessage('PIXI initialization failed', 'error', error);
      setError(error instanceof Error ? error.message : 'PIXI initialization failed');
      renderingRef.current = false;
      setIsRendering(false);
      setRenderCompleted(true);
      updateProgress(0);
      onRenderComplete?.('');
    }
  }, [displayDimensions, updateProgress, onRenderComplete, debugMessage, cleanup]);

  // =====================================
  // MAIN RENDERING FUNCTION (unchanged from original)
  // =====================================
  
  const renderMockup = useCallback(async (app: PIXI.Application) => {
    if (!mountedRef.current || !renderingRef.current) return;
    
    debugMessage('=== STARTING ENHANCED MOCKUP RENDER ===');
    updateProgress(25);

    try {
      app.stage.removeChildren();
      app.stage.sortableChildren = true;

      // STEP 1: Load and render base mockup
      debugMessage('STEP 1: Loading base mockup image');
      const mockupTexture = await loadImageSafely(mockup.photo.url, 'mockup photo');
      
      if (!mockupTexture || !mountedRef.current) {
        throw new Error('Failed to load base mockup image or component unmounted');
      }

      const mockupSprite = new PIXI.Sprite(mockupTexture);
      
      // Calculate proper scaling
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
      debugMessage(`Base mockup rendered: ${mockupDisplayWidth}x${mockupDisplayHeight}`);
      
      const mockupDimensions = {
        width: mockupDisplayWidth,
        height: mockupDisplayHeight,
        x: mockupSprite.x,
        y: mockupSprite.y
      };
      
      updateProgress(40);

      // STEP 2: Process visible areas and design elements WITH RESTORED COORDINATE TRANSFORMATION
      const visibleAreas = mockup.visibleAreas || [];
      debugMessage(`Processing ${visibleAreas.length} visible areas`);
      debugMessage(`Available design element keys:`, Object.keys(designElements));
      debugMessage(`Design elements summary:`, Object.keys(designElements).map(key => ({
        key,
        count: designElements[key]?.length || 0,
        elements: designElements[key]?.map(el => el.id) || []
      })));

      for (let index = 0; index < visibleAreas.length; index++) {
        if (!mountedRef.current || !renderingRef.current) break;
        
        const visibleArea = visibleAreas[index];
        const areaName = visibleArea.areaName;
        
        debugMessage(`Processing area ${index + 1}/${visibleAreas.length}: ${areaName}`);
        
        // Find design elements for this area with extensive variations
        const areaVariations = [
          areaName,                           // "Front"
          areaName.toLowerCase(),             // "front"
          areaName.toUpperCase(),             // "FRONT"
          'front',                            // Default fallback
          'Front',                            // Capital fallback
          areaName === 'Body' ? 'front' : areaName.toLowerCase(),
          areaName === 'body' ? 'front' : areaName.toLowerCase()
        ];
        
        let areaDesignElements: DesignElement[] = [];
        let foundAreaKey = '';
        let canvasConfig: any = null;
        
        // More robust area matching
        for (const variation of areaVariations) {
          if (designElements[variation] && designElements[variation].length > 0) {
            areaDesignElements = designElements[variation];
            foundAreaKey = variation;
            canvasConfig = canvasConfigs[variation];
            debugMessage(`Matched design elements using key "${foundAreaKey}" for area "${areaName}"`);
            break;
          }
        }
        
        // Also check canvas configs for area
        if (!canvasConfig) {
          for (const variation of areaVariations) {
            if (canvasConfigs[variation]) {
              canvasConfig = canvasConfigs[variation];
              debugMessage(`Found canvas config using key "${variation}" for area "${areaName}"`);
              break;
            }
          }
        }
        
        debugMessage(`Found ${areaDesignElements.length} design elements for area "${areaName}" using key "${foundAreaKey}"`);
        debugMessage(`Canvas config for ${areaName}:`, canvasConfig);
        
        // Skip area if no design elements, but continue processing
        if (areaDesignElements.length === 0) {
          debugMessage(`No design elements found for area ${areaName}, but continuing processing for other areas`);
          continue;
        }

        try {
          // Create design container for this area
          const designContainer = new PIXI.Container();
          designContainer.zIndex = 10 + index;
          
          // RESTORED: Apply design placement from PayloadCMS with CORRECT coordinate transformation
          const placement = visibleArea.designPlacement;
          
          if (!placement) {
            debugMessage(`No design placement found for area ${areaName}, skipping`, 'warn');
            continue;
          }
          
          // Convert PayloadCMS relative coordinates (0-1) to absolute pixels on the scaled mockup
          const mockupAreaX = (placement.coordinateX || 0) * mockupDisplayWidth;
          const mockupAreaY = (placement.coordinateY || 0) * mockupDisplayHeight;
          const mockupAreaWidth = (placement.coordinateWidth || 0.5) * mockupDisplayWidth;
          const mockupAreaHeight = (placement.coordinateHeight || 0.5) * mockupDisplayHeight;
          
          debugMessage(`PayloadCMS placement for ${areaName}:`, {
            payloadCoords: { 
              x: placement.coordinateX || 0, 
              y: placement.coordinateY || 0, 
              w: placement.coordinateWidth || 0.5, 
              h: placement.coordinateHeight || 0.5 
            },
            mockupPixels: { 
              x: mockupAreaX, 
              y: mockupAreaY, 
              w: mockupAreaWidth, 
              h: mockupAreaHeight 
            },
            mockupDisplaySize: { w: mockupDisplayWidth, h: mockupDisplayHeight }
          });
          
          // Use canvas config or fallback dimensions
          const canvasWidth = canvasConfig?.canvasPixWid || canvasConfig?.width || 850;
          const canvasHeight = canvasConfig?.canvasPixHeight || canvasConfig?.height || 360;
          
          debugMessage(`Canvas dimensions for ${foundAreaKey}: ${canvasWidth}x${canvasHeight}`);
          
          // Validate dimensions
          if (mockupAreaWidth <= 0 || mockupAreaHeight <= 0 || canvasWidth <= 0 || canvasHeight <= 0) {
            debugMessage(`Invalid dimensions for area ${areaName}, skipping`, 'warn');
            continue;
          }
          
          // Calculate proper scaling from canvas to design area
          const scaleFactorX = mockupAreaWidth / canvasWidth;
          const scaleFactorY = mockupAreaHeight / canvasHeight;
          
          debugMessage(`Scale factors for ${areaName}: scaleX=${scaleFactorX.toFixed(4)}, scaleY=${scaleFactorY.toFixed(4)}`);
          
          // Render each design element with proper scaling and error handling
          for (const [elemIndex, element] of areaDesignElements.entries()) {
            if (!mountedRef.current || !renderingRef.current) break;
            
            try {
              debugMessage(`Rendering element ${elemIndex + 1}/${areaDesignElements.length}: ${element.id} (${element.type})`);
              
              if (element.type === 'image' && element.imageUrl) {
                const designTexture = await loadImageSafely(element.imageUrl, `design element ${element.id}`);
                
                if (designTexture && mountedRef.current) {
                  const designSprite = new PIXI.Sprite(designTexture);
                  
                  // RESTORED: Transform coordinates from canvas space to design area space
                  designSprite.x = (element.x || 0) * scaleFactorX;
                  designSprite.y = (element.y || 0) * scaleFactorY;
                  designSprite.width = (element.width || 100) * scaleFactorX;
                  designSprite.height = (element.height || 100) * scaleFactorY;
                  
                  // Apply element transformations
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
                  debugMessage(`✅ Added design element: ${element.id} at (${designSprite.x.toFixed(2)}, ${designSprite.y.toFixed(2)}) size (${designSprite.width.toFixed(2)}x${designSprite.height.toFixed(2)})`);
                } else {
                  debugMessage(`Failed to load texture for design element: ${element.id}`, 'warn');
                }
              }
              else if (element.type === 'text' && element.text) {
                // RESTORED: Text rendering with error handling
                try {
                  const textStyle = new PIXI.TextStyle({
                    fontSize: Math.max(8, (element.fontSize || 16) * Math.min(scaleFactorX, scaleFactorY)),
                    fontFamily: element.fontFamily || 'Arial',
                    fill: element.fill || '#000000',
                    wordWrap: true,
                    wordWrapWidth: (element.width || 100) * scaleFactorX
                  });
                  
                  const textSprite = new PIXI.Text({text: element.text, style: textStyle});
                  textSprite.x = (element.x || 0) * scaleFactorX;
                  textSprite.y = (element.y || 0) * scaleFactorY;
                  textSprite.alpha = element.opacity || 1;
                  textSprite.zIndex = element.zIndex || elemIndex;
                  
                  if (element.rotation) {
                    textSprite.anchor.set(0.5);
                    textSprite.x += ((element.width || 100) * scaleFactorX) / 2;
                    textSprite.y += ((element.height || 100) * scaleFactorY) / 2;
                    textSprite.rotation = element.rotation * Math.PI / 180;
                  }
                  
                  designContainer.addChild(textSprite);
                  debugMessage(`✅ Added text element: ${element.id}`);
                } catch (textError) {
                  debugMessage(`Failed to create text element ${element.id}`, 'error', textError);
                }
              }
            } catch (elementError) {
              debugMessage(`Error rendering element ${element.id}`, 'error', elementError);
              continue; // Continue with next element
            }
          }
          
          // RESTORED: Position design container relative to mockup with error handling
          try {
            designContainer.x = mockupSprite.x + mockupAreaX;
            designContainer.y = mockupSprite.y + mockupAreaY;
            
            // RESTORED: Apply placement transformations from PayloadCMS
            if (placement.scaleX && placement.scaleX !== 1) designContainer.scale.x *= placement.scaleX;
            if (placement.scaleY && placement.scaleY !== 1) designContainer.scale.y *= placement.scaleY;
            
            if (placement.rotation && placement.rotation !== 0) {
              designContainer.pivot.set(mockupAreaWidth / 2, mockupAreaHeight / 2);
              designContainer.x += mockupAreaWidth / 2;
              designContainer.y += mockupAreaHeight / 2;
              designContainer.rotation = placement.rotation * Math.PI / 180;
            }
            
            if (placement.skewX && placement.skewX !== 0) designContainer.skew.x = placement.skewX * Math.PI / 180;
            if (placement.skewY && placement.skewY !== 0) designContainer.skew.y = placement.skewY * Math.PI / 180;
            if (placement.opacity !== null && placement.opacity !== undefined && placement.opacity !== 1) {
              designContainer.alpha = Math.max(0, Math.min(1, placement.opacity));
            }
            
            debugMessage(`✅ Positioned container for ${areaName} at (${designContainer.x.toFixed(2)}, ${designContainer.y.toFixed(2)})`);
          } catch (positionError) {
            debugMessage(`Error positioning container for ${areaName}`, 'error', positionError);
          }
          
          // RESTORED: Apply advanced effects with error handling
          try {
            const filters: PIXI.Filter[] = [];
            
            // Surface wrapping/displacement
            if (visibleArea.surfaceWrapSettings?.enableWrap) {
              const displacementFilter = await createDisplacementFilter(
                visibleArea.surfaceWrapSettings,
                areaName,
                designContainer,
                mockupDimensions
              );
              if (displacementFilter) {
                filters.push(displacementFilter);
                debugMessage(`✅ Added displacement filter for ${areaName}`);
              }
            }

            if (filters.length > 0) {
              designContainer.filters = filters;
            }

            // RESTORED: Set blend mode
            try {
              const blendMode = getPixiBlendMode(placement.blendMode || 'normal');
              designContainer.blendMode = blendMode;
              debugMessage(`✅ Applied blend mode "${placement.blendMode || 'normal'}" for ${areaName}`);
            } catch (blendError) {
              debugMessage(`Error setting blend mode for ${areaName}`, 'warn', blendError);
              designContainer.blendMode = PIXI.BLEND_MODES.NORMAL;
            }
          } catch (effectsError) {
            debugMessage(`Error applying effects for ${areaName}`, 'error', effectsError);
          }

          // Add to stage before applying mask
          app.stage.addChild(designContainer);

          // RESTORED: Apply alpha masking with error handling
          try {
            if (visibleArea.maskingConfiguration?.enableMasking || visibleArea.visibility === 'partial') {
              debugMessage(`Applying alpha masking for ${areaName}`);
              await createAlphaMask(visibleArea, areaName, designContainer, mockupDimensions);
            }
          } catch (maskError) {
            debugMessage(`Error applying mask for ${areaName}`, 'warn', maskError);
          }

          debugMessage(`✅ Completed processing for area: ${areaName}`);
          
        } catch (areaError) {
          debugMessage(`❌ Error processing area ${areaName}`, 'error', areaError);
          console.error(`Detailed error for area ${areaName}:`, {
            error: areaError,
            areaName,
            foundAreaKey,
            hasDesignElements: areaDesignElements.length > 0,
            hasCanvasConfig: !!canvasConfig,
            hasPlacement: !!visibleArea.designPlacement,
            placement: visibleArea.designPlacement
          });
          // Continue processing other areas even if this one fails
          continue;
        }
      }

      // STEP 3: Apply lighting overlays
      updateProgress(85);
      debugMessage('STEP 3: Applying lighting overlays');
      
      if (mockup.lightingOverlays && mockup.lightingOverlays.length > 0) {
        for (const [overlayIndex, lightingOverlay] of mockup.lightingOverlays.entries()) {
          if (!mountedRef.current || !renderingRef.current) break;
          
          if (lightingOverlay.overImage?.url) {
            debugMessage(`Loading lighting overlay ${overlayIndex + 1}: ${lightingOverlay.overlayType}`);
            
            const lightingTexture = await loadImageSafely(
              lightingOverlay.overImage.url,
              `lighting overlay ${lightingOverlay.overlayType}`
            );
            
            if (lightingTexture && mountedRef.current) {
              const lightingSprite = new PIXI.Sprite(lightingTexture);
              
              lightingSprite.width = mockupDisplayWidth;
              lightingSprite.height = mockupDisplayHeight;
              lightingSprite.x = mockupSprite.x;
              lightingSprite.y = mockupSprite.y;
              lightingSprite.alpha = lightingOverlay.ovlayOpa || 0.5;
              lightingSprite.zIndex = 100 + overlayIndex;
              
              const lightingBlendMode = getPixiBlendMode(lightingOverlay.overbldMde);
              lightingSprite.blendMode = lightingBlendMode;
              
              app.stage.addChild(lightingSprite);
              debugMessage(`Added lighting overlay: ${lightingOverlay.overlayType} with blend mode ${lightingOverlay.overbldMde}`);
            }
          }
        }
      }

      updateProgress(95);

      // Final render
      if (mountedRef.current && renderingRef.current) {
        app.stage.sortChildren();
        app.render();
        
        updateProgress(100);
        
        // Extract image data
        try {
          const imageData = app.canvas.toDataURL();
          onRenderComplete?.(imageData);
        } catch (error) {
          debugMessage('Failed to extract image data', 'warn', error);
          onRenderComplete?.('');
        }
      }

    } catch (error) {
      debugMessage('Mockup rendering failed', 'error', error);
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
    displayDimensions, 
    loadImageSafely, 
    updateProgress, 
    onRenderComplete, 
    debugMessage,
    createDisplacementFilter,
    createAlphaMask,
    getPixiBlendMode
  ]);

  // =====================================
  // EFFECT HOOKS WITH ENHANCED STABILITY
  // =====================================

  useEffect(() => {
    mountedRef.current = true;
    
    if (mockup?.id !== lastMockupId) {
      debugMessage(`Mockup changed from ${lastMockupId} to ${mockup?.id}`);
      setLastMockupId(mockup?.id || '');
      
      if (mockup && mockup.photo?.url) {
        initializePixi();
      } else {
        debugMessage('Cannot initialize: Missing mockup photo URL', 'error');
        setRenderCompleted(true);
        onRenderComplete?.('');
      }
    }

    return () => {
      debugMessage('Component unmounting, starting cleanup');
      cleanup();
    };
  }, [mockup?.id, initializePixi, cleanup, debugMessage, onRenderComplete]);

  useEffect(() => {
    if (!appRef.current || !isLoaded || renderingRef.current || !mountedRef.current) return;
    
    const hasDesignElements = Object.values(designElements).some(elements => elements.length > 0);
    
    if (hasDesignElements) {
      debugMessage('Design elements changed, re-rendering...');
      renderingRef.current = true;
      setIsRendering(true);
      setRenderCompleted(false);
      renderMockup(appRef.current);
    }
  }, [designElements, isLoaded, renderMockup, debugMessage]);

  // =====================================
  // RENDER (unchanged)
  // =====================================

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
          imageRendering: 'high-quality',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      
      {isRendering && !renderCompleted && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 min-w-[400px] shadow-2xl border">
            <div className="mb-4 text-center">
              <div className="mb-2 text-lg font-semibold text-gray-900">
                {renderProgress < 20 ? 'Initializing Engine...' :
                 renderProgress < 40 ? 'Loading Mockup...' :
                 renderProgress < 60 ? 'Processing Design...' :
                 renderProgress < 85 ? 'Applying Surface Effects...' :
                 renderProgress < 95 ? 'Adding Lighting...' :
                 'Finalizing...'}
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full">
                <div 
                  className="h-3 transition-all duration-300 ease-out rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                  style={{ width: `${Math.max(5, renderProgress)}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-600">{Math.round(renderProgress)}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicMockupEngine;