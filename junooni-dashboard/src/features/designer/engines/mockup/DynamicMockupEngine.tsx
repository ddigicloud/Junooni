// src/components/Designer/engines/DynamicMockupEngine.tsx - COMPLETELY FIXED VERSION
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
    };
    dsrfaceTy: 'cylindrical' | 'conical' | 'spherical';
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

// =====================================
// ENHANCED PIXI.JS MOCKUP ENGINE WITH COMPLETE FIXES
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
  // ENHANCED SURFACE CONFIGURATION FOR PROFESSIONAL MOCKUPS
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
      const mockupType = productType?.toLowerCase() || '';
      
      if (mockupType.includes('mug') || 
          mockupType.includes('cup') || 
          mockupType.includes('tumbler') ||
          mockupType.includes('coffee') ||
          mockupType.includes('tea')) {
        return { 
          ...defaultConfig, 
          renderType: 'cylindrical' as const, 
          wrapIntensity: 0.9,
          curvature: 0.8,
          perspective: 0.4,
          cylindricalCurve: 1.2
        };
      } else if (mockupType.includes('bottle') || mockupType.includes('thermos')) {
        return { 
          ...defaultConfig, 
          renderType: 'conical' as const, 
          wrapIntensity: 0.85, 
          curvature: 0.7,
          perspective: 0.3
        };
      } else if (mockupType.includes('ball') || mockupType.includes('sphere') || mockupType.includes('ornament')) {
        return { 
          ...defaultConfig, 
          renderType: 'spherical' as const, 
          wrapIntensity: 0.95, 
          curvature: 0.9,
          perspective: 0.5
        };
      }
    }

    return { ...defaultConfig, ...surfaceConfiguration };
  }, [surfaceConfiguration, productType]);

  // =====================================
  // ENHANCED DISPLACEMENT MAP GENERATION FOR PROFESSIONAL MOCKUPS
  // =====================================
  
  const generateDisplacementMapFromUV = useCallback((
    uvSettings: UVMapSettings,
    intensity: number,
    width: number,
    height: number
  ): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        const u = (x / width) * uvSettings.uSpan + uvSettings.uStart;
        const v = (y / height) * uvSettings.vSpan + uvSettings.vStart;
        
        let displacementX = 128;
        let displacementY = 128;
        
        if (uvSettings.srfc === 'cylinder') {
          const angle = (u - 0.25) * Math.PI * 2;
          const radius = intensity * 127;
          
          const curveFactor = Math.cos(angle);
          displacementX = 128 + (curveFactor * radius);
          displacementY = 128 + (v - 0.5) * intensity * 20;
          
        } else if (uvSettings.srfc === 'plane') {
          displacementX = 128;
          displacementY = 128;
        }
        
        const clampValue = (val: number) => Math.max(0, Math.min(255, val));
        data[index] = clampValue(displacementX);
        data[index + 1] = clampValue(displacementY);
        data[index + 2] = 128;
        data[index + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }, []);

  // =====================================
  // FIXED PIXI BLEND MODE CONVERSION WITH ROBUST FALLBACKS
  // =====================================
  
  const getPixiBlend = useCallback((blend: string): number => {
    if (typeof PIXI?.BLEND_MODES === 'undefined') {
      switch (blend?.toLowerCase()) {
        case 'multiply': return 2;
        case 'screen': return 3;
        case 'overlay': return 4;
        case 'soft-light': return 5;
        case 'hard-light': return 6;
        case 'color-dodge': return 7;
        case 'color-burn': return 8;
        case 'darken': return 9;
        case 'lighten': return 10;
        case 'difference': return 11;
        case 'exclusion': return 12;
        case 'add': return 1;
        default: return 0;
      }
    }

    switch (blend?.toLowerCase()) {
      case 'multiply': return PIXI.BLEND_MODES.MULTIPLY || 2;
      case 'screen': return PIXI.BLEND_MODES.SCREEN || 3;
      case 'overlay': return PIXI.BLEND_MODES.OVERLAY || 4;
      case 'soft-light': return PIXI.BLEND_MODES.SOFT_LIGHT || 5;
      case 'hard-light': return PIXI.BLEND_MODES.HARD_LIGHT || 6;
      case 'color-dodge': return PIXI.BLEND_MODES.COLOR_DODGE || 7;
      case 'color-burn': return PIXI.BLEND_MODES.COLOR_BURN || 8;
      case 'darken': return PIXI.BLEND_MODES.DARKEN || 9;
      case 'lighten': return PIXI.BLEND_MODES.LIGHTEN || 10;
      case 'difference': return PIXI.BLEND_MODES.DIFFERENCE || 11;
      case 'exclusion': return PIXI.BLEND_MODES.EXCLUSION || 12;
      case 'add': return PIXI.BLEND_MODES.ADD || 1;
      default: return PIXI.BLEND_MODES.NORMAL || 0;
    }
  }, []);

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
      
      const alphaMask = mockup.alpMasks?.find(mask => 
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

      if (visibleArea.grdnmsk || visibleArea.visibility === 'partial') {
        debugMessage(`Creating gradient mask for ${areaName}`);
        
        const gradientMask = createGradientMask(
          mockupDimensions.width,
          mockupDimensions.height,
          visibleArea.grdnmsk,
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
  }, [mockup.alpMasks, loadImageSafely, debugMessage]);

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
      return null;
    }
  }, []);

  // =====================================
  // ROBUST CLEANUP FUNCTION WITH ENHANCED ERROR HANDLING
  // =====================================
  
  const cleanup = useCallback(() => {
    if (cleanupInProgressRef.current) {
      debugMessage('Cleanup already in progress, skipping');
      return;
    }
    
    cleanupInProgressRef.current = true;
    debugMessage('Starting comprehensive cleanup');
    
    mountedRef.current = false;
    renderingRef.current = false;
    
    cleanupFunctions.current.forEach((fn, index) => {
      try {
        fn();
      } catch (error) {
        // Silent cleanup
      }
    });
    cleanupFunctions.current = [];
    
    if (appRef.current) {
      try {
        debugMessage('Destroying PIXI application with enhanced error handling');
        const app = appRef.current;
        
        if (app.destroyed) {
          debugMessage('App already destroyed, skipping cleanup');
          appRef.current = null;
          cleanupInProgressRef.current = false;
          return;
        }
        
        try {
          if (app.ticker && !app.ticker.destroyed && typeof app.ticker.stop === 'function') {
            app.ticker.stop();
            debugMessage('Ticker stopped successfully');
          }
        } catch (tickerError) {
          // Silent
        }
        
        try {
          if (app.stage && !app.stage.destroyed) {
            app.stage.removeChildren();
            debugMessage('Stage children removed');
          }
        } catch (stageError) {
          // Silent
        }
        
        try {
          if (app.renderer && !app.renderer.destroyed && typeof app.renderer.destroy === 'function') {
            app.renderer.destroy(true);
            debugMessage('Renderer destroyed successfully');
          }
        } catch (rendererError) {
          // Silent
        }
        
        try {
          if (typeof app.destroy === 'function' && !app.destroyed) {
            app.destroy(false, {
              children: false,
              texture: false,
              baseTexture: false
            });
            debugMessage('PIXI application destroyed successfully');
          }
        } catch (appDestroyError) {
          try {
            if (app.stage) (app as any).stage = null;
            if (app.renderer) (app as any).renderer = null;
            if (app.ticker) (app as any).ticker = null;
            debugMessage('Manual PIXI cleanup completed');
          } catch (manualCleanupError) {
            // Silent
          }
        }
        
        appRef.current = null;
        
      } catch (globalError) {
        appRef.current = null;
      }
    }
    
    try {
      textureCache.current.forEach((texture, key) => {
        try {
          if (texture && !texture.destroyed && typeof texture.destroy === 'function') {
            texture.destroy();
          }
        } catch (textureError) {
          // Silent
        }
      });
      textureCache.current.clear();
      debugMessage('Texture cache cleared');
    } catch (cacheError) {
      // Silent
    }
    
    setIsLoaded(false);
    setIsRendering(false);
    setRenderCompleted(false);
    setRenderProgress(0);
    setError(null);
    
    cleanupInProgressRef.current = false;
    debugMessage('Comprehensive cleanup completed successfully');
  }, [debugMessage]);

  // =====================================
  // PIXI APPLICATION INITIALIZATION WITH WEBGL FIXES
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
      const canvas = canvasRef.current;
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        throw new Error('WebGL not supported');
      }
      
      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        debugMessage('WebGL context lost', 'warn');
        setError('WebGL context lost - please refresh');
      });
      
      canvas.addEventListener('webglcontextrestored', () => {
        debugMessage('WebGL context restored', 'info');
        if (mountedRef.current) {
          initializePixi();
        }
      });

      const app = new PIXI.Application();
      
      await app.init({
        canvas: canvasRef.current,
        width: displayDimensions.width,
        height: displayDimensions.height,
        backgroundColor: 0x000000,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
        clearBeforeRender: true,
        forceFXAA: false
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
            // Silent
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
  // MAIN RENDERING FUNCTION - UV MAPPING IMPLEMENTATION
  // =====================================

  const renderMockup = useCallback(async (app: PIXI.Application) => {
    if (!mountedRef.current || !renderingRef.current) return;
    
    debugMessage('=== STARTING UV-MAPPED MOCKUP RENDER ===');
    updateProgress(25);

    try {
      app.stage.removeChildren();
      app.stage.sortableChildren = true;

      debugMessage('STEP 1: Loading base mockup image');
      const mockupTexture = await loadImageSafely(mockup.photo.url, 'mockup photo');
      
      if (!mockupTexture || !mountedRef.current) {
        throw new Error('Failed to load base mockup image or component unmounted');
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
      debugMessage(`Base mockup rendered: ${mockupDisplayWidth}x${mockupDisplayHeight}`);
      
      const mockupDimensions = {
        width: mockupDisplayWidth,
        height: mockupDisplayHeight,
        x: mockupSprite.x,
        y: mockupSprite.y
      };
      
      updateProgress(40);

      const area = mockup.area || [];
      debugMessage(`Processing ${area.length} visible areas with UV mapping`);

      for (let index = 0; index < area.length; index++) {
        if (!mountedRef.current || !renderingRef.current) break;
        
        const visibleArea = area[index];
        const areaName = visibleArea.areaName;
        
        debugMessage(`\n=== Processing area ${index + 1}/${area.length}: ${areaName} ===`);
        
        const uvSettings = visibleArea.uvMap;
        
        if (!uvSettings) {
          debugMessage(`No UV mapping found for ${areaName}, skipping`, 'warn');
          continue;
        }
        
        debugMessage(`UV Settings: surface=${uvSettings.srfc}, U[${uvSettings.uStart}, ${uvSettings.uStart + uvSettings.uSpan}], V[${uvSettings.vStart}, ${uvSettings.vStart + uvSettings.vSpan}]`);
        
        const areaVariations = [
          areaName,
          areaName.toLowerCase(),
          areaName.toUpperCase(),
          'front',
          'Front',
          areaName === 'Body' ? 'front' : areaName.toLowerCase(),
          areaName === 'body' ? 'front' : areaName.toLowerCase()
        ];
        
        let areaDesignElements: DesignElement[] = [];
        let foundAreaKey = '';
        let canvasConfig: any = null;
        
        for (const variation of areaVariations) {
          if (designElements[variation] && designElements[variation].length > 0) {
            areaDesignElements = designElements[variation];
            foundAreaKey = variation;
            canvasConfig = canvasConfigs[variation];
            debugMessage(`Matched design elements using key "${foundAreaKey}"`);
            break;
          }
        }
        
        if (!canvasConfig) {
          for (const variation of areaVariations) {
            if (canvasConfigs[variation]) {
              canvasConfig = canvasConfigs[variation];
              debugMessage(`Found canvas config using key "${variation}"`);
              break;
            }
          }
        }
        
        if (areaDesignElements.length === 0) {
          debugMessage(`No design elements for ${areaName}, skipping`);
          continue;
        }

        debugMessage(`Found ${areaDesignElements.length} design elements for "${areaName}"`);

        try {
          const designContainer = new PIXI.Container();
          designContainer.zIndex = 10 + index;
          designContainer.sortableChildren = true;
          
          const uvAreaX = uvSettings.uStart * mockupDisplayWidth;
          const uvAreaY = uvSettings.vStart * mockupDisplayHeight;
          const uvAreaWidth = uvSettings.uSpan * mockupDisplayWidth;
          const uvAreaHeight = uvSettings.vSpan * mockupDisplayHeight;
          
          debugMessage(`UV pixel area: X=${uvAreaX.toFixed(1)}, Y=${uvAreaY.toFixed(1)}, W=${uvAreaWidth.toFixed(1)}, H=${uvAreaHeight.toFixed(1)}`);
          
          const canvasWidth = canvasConfig?.canvasPixWid || canvasConfig?.width || 850;
          const canvasHeight = canvasConfig?.canvasPixHeight || canvasConfig?.height || 360;
          
          if (uvAreaWidth <= 0 || uvAreaHeight <= 0 || canvasWidth <= 0 || canvasHeight <= 0) {
            debugMessage(`Invalid dimensions for ${areaName}, skipping`, 'warn');
            continue;
          }
          
          const printableArea = canvasPrintableAreas?.[areaName] || canvasPrintableAreas?.[foundAreaKey];

          let actualCanvasWidth = 850;
          let actualCanvasHeight = 360;

          if (canvasConfig) {
            const rawCanvasWidth = canvasConfig.canvasPixWid || canvasConfig.width || canvasWidth;
            const rawCanvasHeight = canvasConfig.canvasPixHeight || canvasConfig.height || canvasHeight;
            
            debugMessage(`Raw canvas dimensions from config: ${rawCanvasWidth}x${rawCanvasHeight}`);
            
            if (rawCanvasWidth > 0 && rawCanvasWidth < 5000) {
              actualCanvasWidth = rawCanvasWidth;
            }
            if (rawCanvasHeight > 0 && rawCanvasHeight < 5000) {
              actualCanvasHeight = rawCanvasHeight;
            }
            
            debugMessage(`Using canvas dimensions: ${actualCanvasWidth}x${actualCanvasHeight}`);
          } else {
            debugMessage(`No canvasConfig found for ${areaName}, using defaults: ${actualCanvasWidth}x${actualCanvasHeight}`);
          }

          let printableX = 0;
          let printableY = 0;
          let printableWidth = actualCanvasWidth;
          let printableHeight = actualCanvasHeight;

          if (printableArea) {
            const rawX = printableArea.x || 0;
            const rawY = printableArea.y || 0;
            const rawWidth = printableArea.width || 1;
            const rawHeight = printableArea.height || 1;
            
            if (rawWidth > 100 || rawHeight > 100 || rawX > 100 || rawY > 100) {
              const scaleX = actualCanvasWidth / canvasWidth;
              const scaleY = actualCanvasHeight / canvasHeight;
              
              printableX = rawX * scaleX;
              printableY = rawY * scaleY;
              printableWidth = rawWidth * scaleX;
              printableHeight = rawHeight * scaleY;
              
              debugMessage(`Scaled inflated printable area by ${scaleX.toFixed(6)}x, ${scaleY.toFixed(6)}y`);
            } else {
              printableX = rawX * actualCanvasWidth;
              printableY = rawY * actualCanvasHeight;
              printableWidth = rawWidth * actualCanvasWidth;
              printableHeight = rawHeight * actualCanvasHeight;
              
              debugMessage(`Using normalized printable area coordinates`);
            }
            
            debugMessage(`Printable area: ${printableWidth.toFixed(1)}x${printableHeight.toFixed(1)} at (${printableX.toFixed(1)}, ${printableY.toFixed(1)})`);
          }

          const scaleFactorX = uvAreaWidth / printableWidth;
          const scaleFactorY = uvAreaHeight / printableHeight;

          debugMessage(`UV scale factors: X=${scaleFactorX.toFixed(4)}, Y=${scaleFactorY.toFixed(4)} (printable: ${printableWidth.toFixed(0)}x${printableHeight.toFixed(0)})`);
          
          // CRITICAL FIX: Create transparent background
          const backgroundCanvas = document.createElement('canvas');
          backgroundCanvas.width = Math.max(printableWidth, 1);
          backgroundCanvas.height = Math.max(printableHeight, 1);
          const bgCtx = backgroundCanvas.getContext('2d')!;

          bgCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
          bgCtx.fillStyle = 'rgba(0, 0, 0, 0)';
          bgCtx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

          const bgTexture = PIXI.Texture.from(backgroundCanvas);
          const bgSprite = new PIXI.Sprite(bgTexture);
          bgSprite.width = printableWidth * scaleFactorX;
          bgSprite.height = printableHeight * scaleFactorY;
          bgSprite.x = 0;
          bgSprite.y = 0;
          bgSprite.zIndex = -1;

          designContainer.addChild(bgSprite);
          debugMessage(`Added transparent background layer for proper wrapping`);
          
          // Render design elements
          for (const [elemIndex, element] of areaDesignElements.entries()) {
            if (!mountedRef.current || !renderingRef.current) break;
            
            try {
              debugMessage(`  Rendering element ${elemIndex + 1}: ${element.id} (${element.type})`);
              
              if (element.type === 'image' && element.imageUrl) {
                const designTexture = await loadImageSafely(element.imageUrl, `design ${element.id}`);
                
                if (designTexture && mountedRef.current) {
                  const designSprite = new PIXI.Sprite(designTexture);
                  
                  const relativeX = (element.x || 0) - printableX;
                  const relativeY = (element.y || 0) - printableY;

                  designSprite.x = relativeX * scaleFactorX;
                  designSprite.y = relativeY * scaleFactorY;
                  designSprite.width = (element.width || 100) * scaleFactorX;
                  designSprite.height = (element.height || 100) * scaleFactorY;
                  
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
                  debugMessage(`  Added image element: ${element.id} at (${designSprite.x.toFixed(1)}, ${designSprite.y.toFixed(1)})`);
                }
              } else if (element.type === 'text' && element.text) {
                try {
                  const textStyle = new PIXI.TextStyle({
                    fontSize: Math.max(8, (element.fontSize || 16) * Math.min(scaleFactorX, scaleFactorY)),
                    fontFamily: element.fontFamily || 'Arial',
                    fill: element.fill || '#000000',
                    wordWrap: true,
                    wordWrapWidth: (element.width || 100) * scaleFactorX
                  });
                  
                  const textSprite = new PIXI.Text({text: element.text, style: textStyle});

                  const relativeX = (element.x || 0) - printableX;
                  const relativeY = (element.y || 0) - printableY;

                  textSprite.x = relativeX * scaleFactorX;
                  textSprite.y = relativeY * scaleFactorY;
                  textSprite.alpha = element.opacity || 1;
                  textSprite.zIndex = element.zIndex || elemIndex;
                  
                  if (element.rotation) {
                    textSprite.anchor.set(0.5);
                    textSprite.x += ((element.width || 100) * scaleFactorX) / 2;
                    textSprite.y += ((element.height || 100) * scaleFactorY) / 2;
                    textSprite.rotation = element.rotation * Math.PI / 180;
                  }
                  
                  designContainer.addChild(textSprite);
                  debugMessage(`  Added text element: ${element.id}`);
                } catch (textError) {
                  debugMessage(`Failed to create text ${element.id}`, 'error', textError);
                }
              }
            } catch (elementError) {
              debugMessage(`Error rendering element ${element.id}`, 'error', elementError);
              continue;
            }
          }
          
          // Apply clipping mask
          const clipMask = new PIXI.Graphics();
          clipMask.rect(0, 0, uvAreaWidth, uvAreaHeight);
          clipMask.fill(0xffffff);
          designContainer.mask = clipMask;
          designContainer.addChild(clipMask);

          debugMessage(`Clipping mask at (0, 0) size ${uvAreaWidth.toFixed(1)}x${uvAreaHeight.toFixed(1)}`);

          const placement = visibleArea.design;

          // Apply design coordinate transformations
          if (placement && placement.coordinateWidth && placement.coordinateHeight) {
            const mockupWidth = mockupSprite.width;
            const mockupHeight = mockupSprite.height;
            
            const designAreaX = placement.coordinateX * mockupWidth;
            const designAreaY = placement.coordinateY * mockupHeight;
            const designAreaWidth = placement.coordinateWidth * mockupWidth;
            const designAreaHeight = placement.coordinateHeight * mockupHeight;
            
            debugMessage(`Design area: (${designAreaX.toFixed(1)}, ${designAreaY.toFixed(1)}) ${designAreaWidth.toFixed(1)}x${designAreaHeight.toFixed(1)}`);
            debugMessage(`UV area: ${uvAreaWidth.toFixed(1)}x${uvAreaHeight.toFixed(1)}`);
            
            const scaleX = designAreaWidth / uvAreaWidth;
            const scaleY = designAreaHeight / uvAreaHeight;
            
            debugMessage(`Design scale factors: X=${scaleX.toFixed(4)}, Y=${scaleY.toFixed(4)}`);
            
            designContainer.scale.x = scaleX;
            designContainer.scale.y = scaleY;
            
            const offsetX = designAreaX - uvAreaX;
            const offsetY = designAreaY - uvAreaY;

            designContainer.x += offsetX;
            designContainer.y += offsetY;

            debugMessage(`Applied offset: (${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`);
            
            if (placement.scaleX && placement.scaleX !== 1) {
              designContainer.scale.x *= placement.scaleX;
            }
            if (placement.scaleY && placement.scaleY !== 1) {
              designContainer.scale.y *= placement.scaleY;
            }
            
            if (placement.rotation && placement.rotation !== 0) {
              designContainer.pivot.set(uvAreaWidth / 2, uvAreaHeight / 2);
              designContainer.x += (uvAreaWidth * scaleX) / 2;
              designContainer.y += (uvAreaHeight * scaleY) / 2;
              designContainer.rotation = placement.rotation * Math.PI / 180;
            }
            
            if (placement.skewX && placement.skewX !== 0) {
              designContainer.skew.x = placement.skewX * Math.PI / 180;
            }
            if (placement.skewY && placement.skewY !== 0) {
              designContainer.skew.y = placement.skewY * Math.PI / 180;
            }
            
            if (placement.opacity !== null && placement.opacity !== undefined && placement.opacity !== 1) {
              designContainer.alpha = Math.max(0, Math.min(1, placement.opacity));
            }
            
            debugMessage(`Final position: (${designContainer.x.toFixed(1)}, ${designContainer.y.toFixed(1)}) scale: (${designContainer.scale.x.toFixed(4)}, ${designContainer.scale.y.toFixed(4)})`);
          } else {
            if (placement) {
              if (placement.scaleX && placement.scaleX !== 1) designContainer.scale.x *= placement.scaleX;
              if (placement.scaleY && placement.scaleY !== 1) designContainer.scale.y *= placement.scaleY;
              
              if (placement.rotation && placement.rotation !== 0) {
                designContainer.pivot.set(uvAreaWidth / 2, uvAreaHeight / 2);
                designContainer.x += uvAreaWidth / 2;
                designContainer.y += uvAreaHeight / 2;
                designContainer.rotation = placement.rotation * Math.PI / 180;
              }
              
              if (placement.skewX && placement.skewX !== 0) designContainer.skew.x = placement.skewX * Math.PI / 180;
              if (placement.skewY && placement.skewY !== 0) designContainer.skew.y = placement.skewY * Math.PI / 180;
              
              if (placement.opacity !== null && placement.opacity !== undefined && placement.opacity !== 1) {
                designContainer.alpha = Math.max(0, Math.min(1, placement.opacity));
              }
            }
            
            debugMessage(`Using UV coordinates only (no design coordinates found)`);
          }
          
          debugMessage(`Positioned container at (${designContainer.x.toFixed(1)}, ${designContainer.y.toFixed(1)})`);

          // Add to stage
          app.stage.addChild(designContainer);
          debugMessage(`Added container to stage for ${areaName}`);

          // CRITICAL FIX: Apply displacement filter AFTER container is positioned
          // CRITICAL FIX: Apply displacement filter AFTER container is positioned
          // CRITICAL FIX: Apply displacement filter AFTER container is positioned
try {
  const filters: PIXI.Filter[] = [];
  
  if (visibleArea.surfaceWrapSettings?.enableWrap && uvSettings.srfc === 'cylinder') {
    debugMessage(`Creating UV-based cylindrical displacement for ${areaName}`);
    
    const wrapSettings = visibleArea.surfaceWrapSettings;
    const wrapIntensity = wrapSettings.wrapIntensity || 0.9;
    const wrapAngle = wrapSettings.wrapAngle || 360;
    const wrapFalloff = wrapSettings.wrapFalloff || 0.8;
    const dynamicWrap = wrapSettings.dynamicWrap !== false;
    
    debugMessage(`Wrap parameters: angle=${wrapAngle}°, intensity=${wrapIntensity}, falloff=${wrapFalloff}`);
    
    // CRITICAL FIX: Use the actual rendered dimensions of the design container
    const containerBounds = designContainer.getBounds();
    const displacementWidth = Math.min(Math.ceil(containerBounds.width), 2048);
    const displacementHeight = Math.min(Math.ceil(containerBounds.height), 2048);
    
    const displacementCanvas = document.createElement('canvas');
    displacementCanvas.width = displacementWidth;
    displacementCanvas.height = displacementHeight;
    const ctx = displacementCanvas.getContext('2d')!;
    const imageData = ctx.createImageData(displacementCanvas.width, displacementCanvas.height);
    const data = imageData.data;
    
    const wrapAngleRad = (wrapAngle * Math.PI) / 180;
    
    for (let y = 0; y < displacementCanvas.height; y++) {
      for (let x = 0; x < displacementCanvas.width; x++) {
        const idx = (y * displacementCanvas.width + x) * 4;
        
        const u = (x / displacementCanvas.width) * uvSettings.uSpan + uvSettings.uStart;
        const v = (y / displacementCanvas.height) * uvSettings.vSpan + uvSettings.vStart;
        
        // Map U to wrap angle - center the wrap
        const normalizedU = (u - 0.5) * 2; // -1 to 1
        const angle = normalizedU * (wrapAngleRad / 2);
        
        const curveFactor = Math.cos(angle);
        
        // Apply edge falloff
        let edgeFalloff = 1.0;
        if (dynamicWrap && wrapFalloff > 0) {
          const distFromCenter = Math.abs(normalizedU);
          if (distFromCenter > (1 - wrapFalloff)) {
            const t = (distFromCenter - (1 - wrapFalloff)) / wrapFalloff;
            edgeFalloff = 1 - (3 * t * t - 2 * t * t * t);
          }
        }
        
        // Create strong horizontal displacement for cylindrical effect
        const baseIntensity = wrapIntensity * 127 * edgeFalloff;
        const displacementX = 128 + (curveFactor * baseIntensity);
        const displacementY = 128; // Keep Y neutral for cylindrical wrap
        
        data[idx] = Math.max(0, Math.min(255, displacementX));
        data[idx + 1] = Math.max(0, Math.min(255, displacementY));
        data[idx + 2] = 128;
        data[idx + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const displacementTexture = PIXI.Texture.from(displacementCanvas);
    const displacementSprite = new PIXI.Sprite(displacementTexture);
    
    // CRITICAL FIX: Position displacement sprite in LOCAL coordinates
    // The displacement filter works relative to the filtered object's coordinate space
    displacementSprite.width = designContainer.width;
    displacementSprite.height = designContainer.height;
    displacementSprite.x = 0;  // Local coordinates
    displacementSprite.y = 0;  // Local coordinates
    
    // CRITICAL FIX: Add displacement sprite as a CHILD of the design container
    // This ensures it moves/scales/rotates with the container
    designContainer.addChild(displacementSprite);
    
    // Calculate appropriate displacement scale
    const displayArea = displayDimensions.width * displayDimensions.height;
    const baselineArea = 400 * 400;
    const sizeFactor = Math.sqrt(displayArea / baselineArea);
    
    // Scale for visible cylindrical wrapping
    const baseScale = wrapIntensity * 150; // Increased for more visible effect
    const professionalScale = {
      x: Math.max(30, Math.min(250, baseScale * sizeFactor)),
      y: Math.max(5, Math.min(50, baseScale * sizeFactor * 0.3)) // Less Y displacement
    };
    
    const displacementFilter = new PIXI.DisplacementFilter({
      sprite: displacementSprite,
      scale: professionalScale
    });
    
    if (displacementFilter && typeof displacementFilter.apply === 'function') {
      filters.push(displacementFilter);
      debugMessage(`✅ Cylindrical displacement applied: scale=(${professionalScale.x.toFixed(1)}, ${professionalScale.y.toFixed(1)})`);
    }
  }

  if (filters.length > 0) {
    const validFilters = filters.filter(f => 
      f && typeof f === 'object' && !f.destroyed && typeof f.apply === 'function'
    );
    
    if (validFilters.length > 0) {
      designContainer.filters = validFilters;
      debugMessage(`Applied ${validFilters.length} filters to ${areaName}`);
    }
  }

  try {
    const blendMode = getPixiBlend(placement?.blend || 'normal');
    designContainer.blendMode = blendMode;
    debugMessage(`Applied blend mode "${placement?.blend || 'normal'}"`);
  } catch (blendError) {
    debugMessage(`Error setting blend mode`, 'warn', blendError);
    designContainer.blendMode = 0;
  }
} catch (effectsError) {
  debugMessage(`Error applying effects for ${areaName}`, 'error', effectsError);
}
          try {
            if (visibleArea.Config?.enableMasking || visibleArea.visibility === 'partial') {
              await createAlphaMask(visibleArea, areaName, designContainer, mockupDimensions);
            }
          } catch (maskError) {
            debugMessage(`Error applying mask for ${areaName}`, 'warn', maskError);
          }

          debugMessage(`Completed processing ${areaName}\n`);
          
        } catch (areaError) {
          debugMessage(`Error processing area ${areaName}`, 'error', areaError);
          continue;
        }
      }

      updateProgress(85);
      debugMessage('STEP 3: Applying lighting overlays');
      
      if (mockup.light && mockup.light.length > 0) {
        for (const [overlayIndex, lightingOverlay] of mockup.light.entries()) {
          if (!mountedRef.current || !renderingRef.current) break;
          
          if (lightingOverlay.overImage?.url) {
            const lightingTexture = await loadImageSafely(
              lightingOverlay.overImage.url,
              `lighting ${lightingOverlay.overlayType}`
            );
            
            if (lightingTexture && mountedRef.current) {
              const lightingSprite = new PIXI.Sprite(lightingTexture);
              lightingSprite.width = mockupDisplayWidth;
              lightingSprite.height = mockupDisplayHeight;
              lightingSprite.x = mockupSprite.x;
              lightingSprite.y = mockupSprite.y;
              lightingSprite.alpha = lightingOverlay.ovlayOpa || 0.5;
              lightingSprite.zIndex = 100 + overlayIndex;
              lightingSprite.blendMode = getPixiBlend(lightingOverlay.overbldMde);
              
              app.stage.addChild(lightingSprite);
              debugMessage(`Added lighting: ${lightingOverlay.overlayType}`);
            }
          }
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
    canvasPrintableAreas,
    displayDimensions,
    loadImageSafely,
    updateProgress,
    onRenderComplete,
    debugMessage,
    createAlphaMask,
    getPixiBlend
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
  // RENDER
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

      {/* {isRendering && !renderCompleted && (
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
      )} */}
    </div>
  );
};

export default DynamicMockupEngine;