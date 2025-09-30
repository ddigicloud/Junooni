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
    
    //console.log(logMessage, data || '');
    
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
      // Enhanced auto-detect from mockup type
      const mockupType = productType?.toLowerCase() || '';
      
      // ENHANCED: Better mug detection and settings
      if (mockupType.includes('mug') || 
          mockupType.includes('cup') || 
          mockupType.includes('tumbler') ||
          mockupType.includes('coffee') ||
          mockupType.includes('tea')) {
        return { 
          ...defaultConfig, 
          renderType: 'cylindrical' as const, 
          wrapIntensity: 0.9, // Higher intensity for professional look
          curvature: 0.8,
          perspective: 0.4,
          cylindricalCurve: 1.2 // Extra curvature for mugs
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
          // ENHANCED: Professional cylindrical displacement for mugs
          const normalizedX = (x - centerX) / (width / 2); // -1 to 1
          const normalizedY = (y - centerY) / (height / 2); // -1 to 1
          
          // Enhanced curvature calculation for professional look
          const curvatureIntensity = intensity * 1.8; // Increased for more pronounced effect
          
          // Create realistic cylindrical projection
          const cylinderAngle = normalizedX * Math.PI * 0.6; // Wider angle for better wrapping
          const cylinderFactor = Math.cos(cylinderAngle) * curvatureIntensity;
          
          // Apply perspective-based depth
          const depthFactor = Math.cos(normalizedX * Math.PI * 0.4);
          const perspectiveScale = 0.3 + (depthFactor * 0.7); // Varies from 0.3 to 1.0
          
          // Enhanced X displacement for outward curvature
          displacementX = 128 + (cylinderFactor * 127 * perspectiveScale);
          
          // Y displacement with perspective correction
          displacementY = 128 + (normalizedY * curvatureIntensity * 25 * depthFactor);
          
          // Add subtle edge fading for more realism
          const edgeFade = Math.max(0.2, 1 - Math.abs(normalizedX) * 0.4);
          displacementX = 128 + ((displacementX - 128) * edgeFade);
          
          // Add cylindrical curve enhancement for mugs
          if (surfaceConfig.cylindricalCurve) {
            const curveEnhancement = Math.sin(normalizedX * Math.PI * 0.5) * surfaceConfig.cylindricalCurve * 20;
            displacementX += curveEnhancement;
          }
          
        } else if (surfaceConfig.renderType === 'conical') {
          // Enhanced conical displacement for bottles
          const angle = Math.atan2(dy, dx);
          const coneFactor = (1 - normalizedDistance * 0.4) * intensity * 1.3;
          displacementX = 128 + (Math.cos(angle) * coneFactor * 127);
          displacementY = 128 + (Math.sin(angle) * coneFactor * 127);
        } else if (surfaceConfig.renderType === 'spherical') {
          // Enhanced spherical displacement for balls/ornaments
          const sphereFactor = Math.sqrt(Math.max(0, 1 - normalizedDistance * normalizedDistance));
          const sphereIntensity = intensity * 1.5;
          displacementX = 128 + (dx / radius * sphereFactor * sphereIntensity * 127);
          displacementY = 128 + (dy / radius * sphereFactor * sphereIntensity * 127);
        }
        
        // Ensure values stay within valid range
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
  // FIXED PIXI BLEND MODE CONVERSION WITH ROBUST FALLBACKS
  // =====================================
  
  const getPixiBlend = useCallback((blend: string): number => {
    // FIXED: Robust fallback for BLEND_MODES
    if (typeof PIXI?.BLEND_MODES === 'undefined') {
      //console.warn('PIXI.BLEND_MODES not available, using numeric fallbacks');
      // Use direct numeric values as fallback
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
        default: return 0; // NORMAL
      }
    }

    // Use PIXI.BLEND_MODES if available
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
  // ENHANCED DISPLACEMENT FILTER FOR PROFESSIONAL MOCKUPS
  // =====================================

const createDisplacementFilter = useCallback(async (
  wrapSettings: any,
  areaName: string,
  container: PIXI.Container,
  mockupDimensions: { width: number; height: number; x: number; y: number },
  stage: PIXI.Container
): Promise<PIXI.DisplacementFilter | null> => {
  if (!wrapSettings?.enableWrap) return null;

  try {
    debugMessage(`Creating enhanced displacement filter for ${areaName}`);
    
    // Check if DisplacementFilter is available
    if (!PIXI.DisplacementFilter) {
      debugMessage(`PIXI.DisplacementFilter not available, skipping displacement for ${areaName}`, 'warn');
      return null;
    }
    
    // ENHANCED: Get surface config with professional settings
    const surfaceConfig = getSurfaceConfig();
    
    // ENHANCED: Optimize displacement map size for better performance and quality
    const optimalWidth = Math.min(mockupDimensions.width, 1024);
    const optimalHeight = Math.min(mockupDimensions.height, 1024);
    
    // ENHANCED: Use improved displacement generation
    const displacementTexture = PIXI.Texture.from(generateDisplacementMap(
      wrapSettings.wrapAngle || 320,
      wrapSettings.wrapIntensity || 0.9,
      surfaceConfig,
      optimalWidth,
      optimalHeight
    ));

    const displacementSprite = new PIXI.Sprite(displacementTexture);
    displacementSprite.width = mockupDimensions.width;
    displacementSprite.height = mockupDimensions.height;
    displacementSprite.x = 0;
    displacementSprite.y = 0;
    
    // FIXED: Add to stage safely
    if (stage && !stage.destroyed) {
      stage.addChild(displacementSprite);
      debugMessage(`✅ Added displacement sprite to stage for ${areaName}`);
    } else {
      debugMessage(`Invalid stage for displacement sprite in ${areaName}`, 'warn');
      return null;
    }
    
    // ENHANCED: Professional filter settings for different surface types
    let scaleMultiplier = 1.0;
    if (surfaceConfig.renderType === 'cylindrical') {
      scaleMultiplier = 1.5; // Higher intensity for cylindrical surfaces (mugs)
    } else if (surfaceConfig.renderType === 'spherical') {
      scaleMultiplier = 1.8; // Even higher for spherical
    } else if (surfaceConfig.renderType === 'conical') {
      scaleMultiplier = 1.3; // Moderate for conical
    }
    
    // PIXI-ONLY FIX: Size-aware displacement scaling for thumbnails
    const baseScale = (wrapSettings.wrapIntensity || 0.9) * 40 * scaleMultiplier;
    
    // Calculate size factor based on display dimensions (only affects PIXI)
    const displayArea = displayDimensions.width * displayDimensions.height;
    const baselineArea = 400 * 400; // Reference size (main preview)
    const sizeFactor = Math.sqrt(displayArea / baselineArea);
    
    // Apply size-adjusted scaling only for small thumbnails to prevent distortion
    const isSmallThumbnail = displayDimensions.width < 200 || displayDimensions.height < 200;
    const sizeAdjustment = isSmallThumbnail ? Math.max(0.3, sizeFactor * 0.6) : sizeFactor;
    
    // ENHANCED: Calculate professional displacement scale with size awareness
    const professionalScale = {
      x: Math.max(5, Math.min(80, baseScale * sizeAdjustment)),
      y: Math.max(5, Math.min(80, baseScale * sizeAdjustment))
    };
    
    // FIXED: Create filter with enhanced validation
    const displacementFilter = new PIXI.DisplacementFilter({
      sprite: displacementSprite,
      scale: professionalScale
    });
    
    // FIXED: Validate filter was created properly
    if (!displacementFilter || typeof displacementFilter.apply !== 'function') {
      debugMessage(`Invalid displacement filter created for ${areaName}`, 'warn');
      return null;
    }
    
    debugMessage(`Created professional displacement filter for ${areaName} with scale: ${professionalScale.x.toFixed(1)} (size factor: ${sizeAdjustment.toFixed(2)})`);
    return displacementFilter;
    
  } catch (error) {
    debugMessage(`Failed to create displacement filter for ${areaName}`, 'error', error);
    return null;
  }
}, [generateDisplacementMap, getSurfaceConfig, debugMessage, displayDimensions]);

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

      // Create gradient mask for partial visibility
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
      //console.error('Error creating gradient mask:', error);
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
    
    // Execute custom cleanup functions first
    cleanupFunctions.current.forEach((fn, index) => {
      try {
        fn();
      } catch (error) {
        //console.error(`Cleanup function ${index} error:`, error);
      }
    });
    cleanupFunctions.current = [];
    
    // FIXED: Enhanced PIXI cleanup with better error handling
    if (appRef.current) {
      try {
        debugMessage('Destroying PIXI application with enhanced error handling');
        const app = appRef.current;
        
        // FIXED: Check if app is already destroyed
        if (app.destroyed) {
          debugMessage('App already destroyed, skipping cleanup');
          appRef.current = null;
          cleanupInProgressRef.current = false;
          return;
        }
        
        // Step 1: Stop ticker safely
        try {
          if (app.ticker && !app.ticker.destroyed && typeof app.ticker.stop === 'function') {
            app.ticker.stop();
            debugMessage('Ticker stopped successfully');
          }
        } catch (tickerError) {
          //console.warn('Error stopping ticker:', tickerError);
        }
        
        // Step 2: Clear stage safely
        try {
          if (app.stage && !app.stage.destroyed) {
            app.stage.removeChildren();
            debugMessage('Stage children removed');
          }
        } catch (stageError) {
          //console.warn('Error clearing stage:', stageError);
        }
        
        // Step 3: Destroy renderer safely
        try {
          if (app.renderer && !app.renderer.destroyed && typeof app.renderer.destroy === 'function') {
            app.renderer.destroy(true);
            debugMessage('Renderer destroyed successfully');
          }
        } catch (rendererError) {
          //console.warn('Error destroying renderer:', rendererError);
        }
        
        // Step 4: FIXED - Safer app destruction with method checks
        try {
          // Check if destroy method exists and hasn't been called
          if (typeof app.destroy === 'function' && !app.destroyed) {
            // FIXED: Use simpler destroy call to avoid _cancelResize error
            app.destroy(false, {
              children: false,
              texture: false,
              baseTexture: false
            });
            debugMessage('PIXI application destroyed successfully');
          }
        } catch (appDestroyError) {
          //console.warn('Error destroying PIXI application:', appDestroyError);
          
          // FIXED: Manual cleanup without calling problematic methods
          try {
            // Just null out the critical references
            if (app.stage) (app as any).stage = null;
            if (app.renderer) (app as any).renderer = null;
            if (app.ticker) (app as any).ticker = null;
            debugMessage('Manual PIXI cleanup completed');
          } catch (manualCleanupError) {
            //console.error('Manual cleanup also failed:', manualCleanupError);
          }
        }
        
        appRef.current = null;
        
      } catch (globalError) {
        //console.error('Global PIXI cleanup error:', globalError);
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
          //////console.warn(`Error destroying texture ${key}:`, textureError);
        }
      });
      textureCache.current.clear();
      debugMessage('Texture cache cleared');
    } catch (cacheError) {
      //console.warn('Error clearing texture cache:', cacheError);
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
      // FIXED: Check for WebGL support before creating app
      const canvas = canvasRef.current;
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        throw new Error('WebGL not supported');
      }
      
      // FIXED: Add WebGL context loss handlers
      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        debugMessage('WebGL context lost', 'warn');
        setError('WebGL context lost - please refresh');
      });
      
      canvas.addEventListener('webglcontextrestored', () => {
        debugMessage('WebGL context restored', 'info');
        // Reinitialize if needed
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
        // FIXED: Add these WebGL-specific options
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
            //console.warn('Error in cleanup function for app destroy:', error);
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
  // MAIN RENDERING FUNCTION - COMPLETELY FIXED ORDER OF OPERATIONS
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

      // STEP 2: Process visible areas and design elements WITH FIXED ORDER
      const area = mockup.area || [];
      debugMessage(`Processing ${area.length} visible areas`);
      debugMessage(`Available design element keys:`, Object.keys(designElements));

      for (let index = 0; index < area.length; index++) {
        if (!mountedRef.current || !renderingRef.current) break;
        
        const visibleArea = area[index];
        const areaName = visibleArea.areaName;
        
        debugMessage(`Processing area ${index + 1}/${area.length}: ${areaName}`);
        
        // Find design elements for this area
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
        
        // Skip area if no design elements
        if (areaDesignElements.length === 0) {
          debugMessage(`No design elements found for area ${areaName}, continuing`);
          continue;
        }

        try {
          // Create design container for this area
          const designContainer = new PIXI.Container();
          designContainer.zIndex = 10 + index;
          
          // Apply design placement from PayloadCMS
          const placement = visibleArea.design;
          
          if (!placement) {
            debugMessage(`No design placement found for area ${areaName}, skipping`, 'warn');
            continue;
          }
          
          // Convert PayloadCMS relative coordinates to absolute pixels
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
            }
          });
          
          // Use canvas config or fallback dimensions
          const canvasWidth = canvasConfig?.canvasPixWid || canvasConfig?.width || 850;
          const canvasHeight = canvasConfig?.canvasPixHeight || canvasConfig?.height || 360;
          
          // Validate dimensions
          if (mockupAreaWidth <= 0 || mockupAreaHeight <= 0 || canvasWidth <= 0 || canvasHeight <= 0) {
            debugMessage(`Invalid dimensions for area ${areaName}, skipping`, 'warn');
            continue;
          }
          
          // Calculate scaling from canvas to design area
          const scaleFactorX = mockupAreaWidth / canvasWidth;
          const scaleFactorY = mockupAreaHeight / canvasHeight;
          
          debugMessage(`Scale factors for ${areaName}: scaleX=${scaleFactorX.toFixed(4)}, scaleY=${scaleFactorY.toFixed(4)}`);
          
          // Render each design element
          for (const [elemIndex, element] of areaDesignElements.entries()) {
            if (!mountedRef.current || !renderingRef.current) break;
            
            try {
              debugMessage(`Rendering element ${elemIndex + 1}/${areaDesignElements.length}: ${element.id} (${element.type})`);
              
              if (element.type === 'image' && element.imageUrl) {
                const designTexture = await loadImageSafely(element.imageUrl, `design element ${element.id}`);
                
                if (designTexture && mountedRef.current) {
                  const designSprite = new PIXI.Sprite(designTexture);
                  
                  // Transform coordinates from canvas space to design area space
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
                  debugMessage(`✅ Added design element: ${element.id}`);
                } else {
                  debugMessage(`Failed to load texture for design element: ${element.id}`, 'warn');
                }
              }
              else if (element.type === 'text' && element.text) {
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
              continue;
            }
          }
          
          // FIXED: Position container relative to mockup
          try {
            designContainer.x = mockupSprite.x + mockupAreaX;
            designContainer.y = mockupSprite.y + mockupAreaY;
            
            // Apply placement transformations from PayloadCMS
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

          // CRITICAL FIX: Add to stage BEFORE applying effects
          app.stage.addChild(designContainer);
          debugMessage(`✅ Added container to stage for ${areaName}`);

          // FIXED: Apply advanced effects AFTER adding to stage with robust validation
          try {
            const filters: PIXI.Filter[] = [];
            
            // ENHANCED: Check for mug and enhance wrap settings
            const isMug = productType?.toLowerCase().includes('mug') || 
                         productType?.toLowerCase().includes('cup') ||
                         productType?.toLowerCase().includes('tumbler') ||
                         productType?.toLowerCase().includes('coffee');
            
            // Surface wrapping/displacement (now container has parent)
            if (visibleArea.surfaceWrapSettings?.enableWrap) {
              // ENHANCED: Force higher intensity for mugs for professional look
              if (isMug) {
                visibleArea.surfaceWrapSettings.wrapIntensity = Math.max(
                  visibleArea.surfaceWrapSettings.wrapIntensity || 0.5,
                  0.9 // Minimum 90% intensity for professional mug wrapping
                );
                visibleArea.surfaceWrapSettings.wrapAngle = visibleArea.surfaceWrapSettings.wrapAngle || 320;
                debugMessage(`Enhanced wrap intensity for mug: ${visibleArea.surfaceWrapSettings.wrapIntensity}`);
              }
              
              const displacementFilter = await createDisplacementFilter(
                visibleArea.surfaceWrapSettings,
                areaName,
                designContainer,
                mockupDimensions,
                app.stage
              );
              
              // FIXED: Validate filter before adding
              if (displacementFilter && 
                  typeof displacementFilter === 'object' && 
                  !displacementFilter.destroyed &&
                  typeof displacementFilter.apply === 'function') {
                filters.push(displacementFilter);
                debugMessage(`✅ Added displacement filter for ${areaName}`);
              } else {
                debugMessage(`Invalid displacement filter for ${areaName}, skipping`, 'warn');
              }
            } else if (isMug) {
              // ENHANCED: Auto-enable wrapping for mugs if not set
              debugMessage(`Auto-enabling surface wrapping for mug in ${areaName}`);
              const autoWrapSettings = {
                enableWrap: true,
                wrapAngle: 320,
                wrapIntensity: 0.9,
                dynamicWrap: true,
                wrapFalloff: 0.7
              };
              
              const displacementFilter = await createDisplacementFilter(
                autoWrapSettings,
                areaName,
                designContainer,
                mockupDimensions,
                app.stage
              );
              
              if (displacementFilter && 
                  typeof displacementFilter === 'object' && 
                  !displacementFilter.destroyed &&
                  typeof displacementFilter.apply === 'function') {
                filters.push(displacementFilter);
                debugMessage(`✅ Added auto-generated displacement filter for mug ${areaName}`);
              }
            }

            // FIXED: Only apply filters if we have valid ones
            if (filters.length > 0) {
              try {
                // Double-check each filter is valid before applying
                const validFilters = filters.filter(filter => 
                  filter && 
                  typeof filter === 'object' && 
                  !filter.destroyed &&
                  typeof filter.apply === 'function'
                );
                
                if (validFilters.length > 0) {
                  designContainer.filters = validFilters;
                  debugMessage(`✅ Applied ${validFilters.length} filters to ${areaName}`);
                }
              } catch (filterError) {
                debugMessage(`Error applying filters to ${areaName}`, 'error', filterError);
              }
            }

            // Set blend mode with robust error handling
            try {
              const blendMode = getPixiBlend(placement.blend || 'normal');
              designContainer.blendMode = blendMode;
              debugMessage(`✅ Applied blend mode "${placement.blend || 'normal'}" for ${areaName}`);
            } catch (blendError) {
              debugMessage(`Error setting blend mode for ${areaName}`, 'warn', blendError);
              designContainer.blendMode = 0; // NORMAL fallback
            }
          } catch (effectsError) {
            debugMessage(`Error applying effects for ${areaName}`, 'error', effectsError);
          }

          // Apply alpha masking LAST
          try {
            if (visibleArea.Config?.enableMasking || visibleArea.visibility === 'partial') {
              debugMessage(`Applying alpha masking for ${areaName}`);
              await createAlphaMask(visibleArea, areaName, designContainer, mockupDimensions);
            }
          } catch (maskError) {
            debugMessage(`Error applying mask for ${areaName}`, 'warn', maskError);
          }

          debugMessage(`✅ Completed processing for area: ${areaName}`);
          
        } catch (areaError) {
          debugMessage(`❌ Error processing area ${areaName}`, 'error', areaError);
          // console.error(`Detailed error for area ${areaName}:`, {
          //   error: areaError,
          //   areaName,
          //   foundAreaKey,
          //   hasDesignElements: areaDesignElements.length > 0,
          //   hasCanvasConfig: !!canvasConfig,
          //   hasPlacement: !!visibleArea.design,
          //   placement: visibleArea.design
          // });
          continue;
        }
      }

      // STEP 3: Apply lighting overlays
      updateProgress(85);
      debugMessage('STEP 3: Applying lighting overlays');
      
      if (mockup.light && mockup.light.length > 0) {
        for (const [overlayIndex, lightingOverlay] of mockup.light.entries()) {
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
              
              const lightingBlend = getPixiBlend(lightingOverlay.overbldMde);
              lightingSprite.blendMode = lightingBlend;
              
              app.stage.addChild(lightingSprite);
              debugMessage(`Added lighting overlay: ${lightingOverlay.overlayType}`);
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