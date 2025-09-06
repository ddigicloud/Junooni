// src/components/Designer/engines/ProfessionalMockupEngine.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';

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
}

// Enhanced PayloadCMS mockup data interface
interface PayloadCMSMockupData {
  id: string;
  title?: string;
  photo: {
    id: number;
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  viewAngle?: string;
  mockupType?: string;
  mockupStyle?: string; // For smart mockups
  photoColor: string;
  priority: number;
  
  // Standard visible areas with PayloadCMS field names
  area?: Array<{
    id: string;
    areaName: string;
    visibility: 'full' | 'partial' | 'edge' | 'sleeve' | 'shadow' | 'reflection';
    visibilityPercentage?: number;
    
    // PayloadCMS uses 'design' not 'designPlacement'
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
      blend: string; // PayloadCMS uses 'blend' not 'blendMode'
      opacity: number | null;
      preserveColors: boolean | null;
    };
    
    // PayloadCMS uses 'fbrc' not 'fabricIntegration'
    fbrc?: {
      enableFabricBlend: boolean;
      bfab: string; // PayloadCMS uses 'bfab' not 'bfabType'
      foldAwareness: boolean;
      seamAwareness: boolean;
      textureIntensity: number;
      fabricColor: string;
      fabricRoughness: number;
    };
    
    // PayloadCMS uses 'Config' not 'maskingConfiguration'
    Config?: {
      enableMasking: boolean;
      mask: string; // PayloadCMS uses 'mask' not 'maskTypes'
      maskPath?: string;
    };
    
    // PayloadCMS uses 'grdnmsk' not 'gradientMaskSettings'
    grdnmsk?: {
      grdn: string; // PayloadCMS uses 'grdn' not 'gradientDirection'
      gradientAngle: number;
      fadeStart: number;
      fadeEnd: number;
      fadeIntensity: number;
    };
    
    surfaceWrapSettings?: {
      enableWrap: boolean;
      wrapAngle: number;
      wrapIntensity: number;
      dynamicWrap: boolean;
      wrapFalloff: number;
    };
    
    perspectiveSettings?: {
      enablePerspective: boolean;
      perspectiveIntensity: number;
      dynamicPerspective: boolean;
    };
    
    edgeDetectionSettings?: {
      enableEdgeDetection: boolean;
      edgeThreshold: number;
      edgeSoftness: number;
    };
    
    // PayloadCMS uses 'fbrEft' not 'fabricEffectsSettings'
    fbrEft?: {
      enableFolds: boolean;
      foldIntensity: number;
      fold: string; // PayloadCMS uses 'fold' not 'foldDirection'
      seamDistrt: boolean;
      fabricDpth: number;
    };
  }>;
  
  // Smart visible areas (AI-powered) - keeping original structure
  smartVisA?: Array<{
    id: string;
    areaName: string;
    dataSource: 'ai_detected' | 'manual' | 'hybrid';
    appStat: 'pending_review' | 'approved' | 'rejected';
    visibility: 'full' | 'partial' | 'edge' | 'sleeve';
    visibilityPercentage: number;
    smartMasking: {
      enableSmartMask: boolean;
      maskingStrategy: 'ai_automatic' | 'manual' | 'hybrid';
    };
    aiMaskSettings: {
      edgeDetectLevel: 'soft' | 'medium' | 'sharp' | 'ultra';
      adaptToLighting: boolean;
      fabricAwareness: boolean;
      seamDetection: boolean;
    };
    generatedMask: {
      maskPath?: string;
      maskTypes?: string;
      maskConfidence?: number;
    };
    smartPlacement: {
      autoX?: number;
      autoY?: number;
      autoWidth?: number;
      autoHeight?: number;
      enableManualOverride: boolean;
      manualX?: number;
      manualY?: number;
      manualWidth?: number;
      manualHeight?: number;
      rotation: number;
      skewX: number;
      skewY: number;
      scaleX: number;
      scaleY: number;
    };
  }>;
  
  // PayloadCMS uses 'fbrcProp' not 'fabricProp'
  fbrcProp?: {
    mfab: string; // PayloadCMS uses 'mfab' not 'mfabType'
    fabricWeight: number;
    Texture: string; // PayloadCMS uses 'Texture' not 'surfaceTexture'
    stretchability: number;
    transparency: number;
  };
  
  // Lighting conditions from PayloadCMS
  lightingConditions?: {
    lightDirection: number;
    lightIntensity: number;
    ambientLight: number;
    shadowIntensity: number;
  };
  
  // AI analysis results for smart mockups
  aiAnalRes?: {
    analStat: 'pending' | 'completed' | 'failed';
    detProdTy?: string;
    confScore?: number;
    detAr: any[];
    dtcObs: any[];
  };
  
  // PayloadCMS uses 'surfConf' not 'surfaceConfiguration'
  surfConf?: {
    No_Mockup_Compatible?: boolean;
    renderType: 'flat' | 'cylindrical' | 'conical' | 'spherical' | 'complex_3d' | 'apparel_body' | 'sleeve_wrap';
    surfProp?: {
      wrapAngle?: number;
      curveInten?: number; // PayloadCMS uses 'curveInten' not 'curveIntensity'
      designRatio?: {
        widthRatio?: number;
        heightRatio?: number;
      };
    };
    blendSet?: {
      defaultBlendMode?: string;
      defaultOpacity?: number;
      preserveColors?: boolean;
    };
  };
  
  // PayloadCMS uses 'advanSurfMap' not 'advancedSurfaceMapping'
  advanSurfMap?: {
    curvProf: string; // PayloadCMS uses 'curvProf' not 'curveProfile'
    barrelDist: number;
    pincushiDistor: number;
    perspDis: number;
    hasSeams: boolean;
  };
  
  // Seam positions
  seamPositions?: any[];
  
  // Lighting configuration
  lightingConfiguration?: {
    lightDirection: number;
    lightIntensity: number;
    ambientLight: number;
    shadowIntensity: number;
  };
  
  // Materials from product data
  materials?: {
    primary: string;
    weight: string;
    construction: string;
    finish: string | null;
    efabType: string;
    fabricWeight: number;
    surfaceTexture: string;
    stretchability: number;
    transparency: number;
    reflectivity: number;
  };
  
  // Render settings
  render?: {
    pfEngine: string;
    enableAdvancedEffects: boolean;
    quality: string;
    exportRes: number;
    enableProgTrack: boolean;
  };
  
  // Display maps
  dispMaps?: any[];
  
  // Alpha masks
  alpMasks?: any[];
  
  // Light maps
  light?: any[];
  
  tags?: { tag: string }[];
}

interface CanvasConfig {
  width: number;
  height: number;
  realWorldWidth: number;
  realWorldHeight: number;
}

interface PrintableArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Enhanced surface configuration from PayloadCMS
interface SurfaceConfiguration {
  renderType: 'flat' | 'cylindrical' | 'conical' | 'spherical' | 'complex_3d' | 'apparel_body' | 'sleeve_wrap';
  surfProp?: {
    wrapAngle?: number;
    curveInten?: number; // PayloadCMS field name
    designRatio?: {
      widthRatio?: number;
      heightRatio?: number;
    };
  };
  blendSet?: {
    defaultBlendMode?: string;
    defaultOpacity?: number;
    preserveColors?: boolean;
  };
  // Advanced surface mapping from PayloadCMS
  advancedSurfaceMapping?: {
    curvProf: string;
    barrelDist: number;
    pincushiDistor: number;
    perspDis: number;
    hasSeams: boolean;
  };
  // Fabric properties from PayloadCMS materials
  fabricProperties?: {
    fabricType: string;
    fabricWeight: number;
    surfaceTexture: string;
    stretchability: number;
    transparency: number;
    reflectivity: number;
  };
  // Lighting configuration from PayloadCMS
  lightingConfiguration?: {
    lightDirection: number;
    lightIntensity: number;
    ambientLight: number;
    shadowIntensity: number;
  };
}

interface ProfessionalMockupEngineProps {
  mockup: PayloadCMSMockupData;
  designElements: Record<string, DesignElement[]>;
  canvasConfigs: Record<string, CanvasConfig>;
  canvasPrintableAreas: Record<string, PrintableArea>;
  displayDimensions: { width: number; height: number };
  productType: string;
  onRenderComplete?: (imageData: string) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: any) => void;
  productColor: string;
  // Surface configuration from PayloadCMS
  surfaceConfiguration?: SurfaceConfiguration;
  fabricSettings?: {
    enableRealisticFabric: boolean;
    dynamicVisibility: boolean;
    adaptiveBlending: boolean;
    globalFabricType?: string;
    fabricIntensity?: number;
    lightingIntensity?: number;
    shadowIntensity?: number;
    foldAwareness?: boolean;
    seamAwareness?: boolean;
    fabricRoughness?: number;
  };
}

/**
 * Enhanced Professional Mockup Engine - 100% Dynamic from PayloadCMS
 * Supports all surface types with advanced masking, wrapping, and AI features
 */
export const ProfessionalMockupEngine: React.FC<ProfessionalMockupEngineProps> = ({
  mockup,
  designElements,
  canvasConfigs,
  canvasPrintableAreas,
  displayDimensions,
  productType,
  productColor,
  surfaceConfiguration,
  fabricSettings = {
    enableRealisticFabric: true,
    dynamicVisibility: true,
    adaptiveBlending: true,
    globalFabricType: 'cotton',
    fabricIntensity: 0.5,
    lightingIntensity: 0.8,
    shadowIntensity: 0.4,
    foldAwareness: true,
    seamAwareness: true,
    fabricRoughness: 0.3
  }
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [renderProgress, setRenderProgress] = useState(0);

  const log = useCallback((message: string, data?: any) => {
    console.log(`🎯 Professional Mockup: ${message}`, data || '');
  }, []);

  // Enhanced validation utilities
  const validateDimensions = useCallback((width: number, height: number, context: string) => {
    if (!width || !height || width <= 0 || height <= 0) {
      throw new Error(`Invalid dimensions in ${context}: ${width}x${height}`);
    }
    if (width > 8000 || height > 8000) {
      throw new Error(`Dimensions too large in ${context}: ${width}x${height} (max: 8000x8000)`);
    }
    return true;
  }, []);

  const validateCanvas = useCallback((canvas: HTMLCanvasElement, context: string) => {
    if (!canvas) throw new Error(`Missing canvas in ${context}`);
    validateDimensions(canvas.width, canvas.height, `${context} canvas`);
    return true;
  }, [validateDimensions]);

  const safeCreateCanvas = useCallback((width: number, height: number, context: string) => {
    validateDimensions(width, height, context);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(Math.max(1, Math.min(8000, width)));
    canvas.height = Math.round(Math.max(1, Math.min(8000, height)));
    const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: false });
    if (!ctx) throw new Error(`Failed to get 2D context for ${context}`);
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    log(`Created safe canvas for ${context}`, { width: canvas.width, height: canvas.height });
    return { canvas, ctx };
  }, [validateDimensions, log]);

  const normalizeCoordinates = useCallback((coords: any, referenceWidth: number, referenceHeight: number) => {
    // If coordinates are already normalized (0-1), return as-is
    if (coords.x <= 1 && coords.y <= 1 && coords.width <= 1 && coords.height <= 1) {
      return coords;
    }
    
    // If coordinates are absolute pixels, convert to relative (0-1)
    return {
      x: Math.max(0, Math.min(1, coords.x / referenceWidth)),
      y: Math.max(0, Math.min(1, coords.y / referenceHeight)), 
      width: Math.max(0.01, Math.min(1, coords.width / referenceWidth)),
      height: Math.max(0.01, Math.min(1, coords.height / referenceHeight))
    };
  }, []);


  // Enhanced surface type detection from PayloadCMS
  const getSurfaceTypeFromPayloadCMS = useCallback(() => {
  // Priority 1: Use surface configuration from PayloadCMS 'surfConf'
  if (mockup.surfConf?.renderType) {
    return mockup.surfConf.renderType;
  }
  
  // Priority 2: Use surface configuration from props
  if (surfaceConfiguration?.renderType) {
    return surfaceConfiguration.renderType;
  }
  
  // Priority 3: Detect from product type
  const productTypeLower = productType.toLowerCase();
  if (productTypeLower.includes('mug') || productTypeLower.includes('bottle') || productTypeLower.includes('tumbler')) {
    return 'cylindrical';
  }
  if (productTypeLower.includes('tshirt') || productTypeLower.includes('hoodie') || productTypeLower.includes('apparel')) {
    return 'apparel_body';
  }
  if (productTypeLower.includes('phone_case') || productTypeLower.includes('case')) {
    return 'flat';
  }
  
  // Priority 4: Default fallback
  return 'flat';
}, [surfaceConfiguration, productType, mockup]);

  // Get dynamic surface properties from PayloadCMS
  const getDynamicSurfaceProperties = useCallback(() => {
  const surfaceType = getSurfaceTypeFromPayloadCMS();
  
  return {
    renderType: surfaceType,
    // Use PayloadCMS 'surfConf' field
    wrapAngle: mockup.surfConf?.surfProp?.wrapAngle || surfaceConfiguration?.surfProp?.wrapAngle || 280,
    curveIntensity: mockup.surfConf?.surfProp?.curveInten || surfaceConfiguration?.surfProp?.curveInten || 0.8,
    designRatio: mockup.surfConf?.surfProp?.designRatio || surfaceConfiguration?.surfProp?.designRatio || { widthRatio: 1.0, heightRatio: 1.0 },
    blendMode: mockup.surfConf?.blendSet?.defaultBlendMode || surfaceConfiguration?.blendSet?.defaultBlendMode || 'normal',
    opacity: mockup.surfConf?.blendSet?.defaultOpacity || surfaceConfiguration?.blendSet?.defaultOpacity || 1.0,
    preserveColors: mockup.surfConf?.blendSet?.preserveColors !== false,
    // Advanced properties from PayloadCMS 'advanSurfMap'
    barrelDistortion: mockup.advanSurfMap?.barrelDist || surfaceConfiguration?.advancedSurfaceMapping?.barrelDist || 0,
    pincushionDistortion: mockup.advanSurfMap?.pincushiDistor || surfaceConfiguration?.advancedSurfaceMapping?.pincushiDistor || 0,
    perspectiveDistortion: mockup.advanSurfMap?.perspDis || surfaceConfiguration?.advancedSurfaceMapping?.perspDis || 1,
    hasSeams: mockup.advanSurfMap?.hasSeams || surfaceConfiguration?.advancedSurfaceMapping?.hasSeams || false,
    curveProfile: mockup.advanSurfMap?.curvProf || surfaceConfiguration?.advancedSurfaceMapping?.curvProf || 'smooth'
  };
}, [surfaceConfiguration, getSurfaceTypeFromPayloadCMS, mockup]);

  // Get dynamic fabric properties from PayloadCMS
  const getDynamicFabricProperties = useCallback(() => {
  // Priority 1: From mockup fabric properties (PayloadCMS uses 'fbrcProp')
  if (mockup.fbrcProp) {
    return {
      fabricType: mockup.fbrcProp.mfab, // PayloadCMS uses 'mfab' not 'mfabType'
      fabricWeight: mockup.fbrcProp.fabricWeight,
      surfaceTexture: mockup.fbrcProp.Texture, // PayloadCMS uses 'Texture' not 'surfaceTexture'
      stretchability: mockup.fbrcProp.stretchability,
      transparency: mockup.fbrcProp.transparency
    };
  }
  
  // Priority 2: From surface configuration
  if (surfaceConfiguration?.fabricProperties) {
    return surfaceConfiguration.fabricProperties;
  }
  
  // Priority 3: From product materials field
  if (mockup.materials) {
    return {
      fabricType: mockup.materials.efabType || 'cotton',
      fabricWeight: mockup.materials.fabricWeight || 180,
      surfaceTexture: mockup.materials.surfaceTexture || 'smooth',
      stretchability: mockup.materials.stretchability || 0.1,
      transparency: mockup.materials.transparency || 0.05,
      reflectivity: mockup.materials.reflectivity || 0.1
    };
  }
  
  // Priority 4: Default based on product type
  const productTypeLower = productType.toLowerCase();
  if (productTypeLower.includes('mug') || productTypeLower.includes('ceramic')) {
    return {
      fabricType: 'ceramic',
      fabricWeight: 180,
      surfaceTexture: 'glossy',
      stretchability: 0,
      transparency: 0,
      reflectivity: 0.3
    };
  }
  
  return {
    fabricType: 'cotton',
    fabricWeight: 180,
    surfaceTexture: 'smooth',
    stretchability: 0.1,
    transparency: 0.05,
    reflectivity: 0.1
  };
}, [mockup, surfaceConfiguration, productType]);

  // Get dynamic lighting from PayloadCMS
  const getDynamicLighting = useCallback(() => {
    // Priority 1: From mockup lighting conditions
    if (mockup.lightingConditions) {
      return mockup.lightingConditions;
    }
    
    // Priority 2: From surface configuration
    if (surfaceConfiguration?.lightingConfiguration) {
      return surfaceConfiguration.lightingConfiguration;
    }
    
    // Priority 3: Default based on surface type
    const surfaceType = getSurfaceTypeFromPayloadCMS();
    if (surfaceType === 'cylindrical') {
      return {
        lightDirection: 45,
        lightIntensity: 0.9,
        ambientLight: 0.4,
        shadowIntensity: 0.6
      };
    }
    
    return {
      lightDirection: 45,
      lightIntensity: 0.8,
      ambientLight: 0.3,
      shadowIntensity: 0.4
    };
  }, [mockup, surfaceConfiguration, getSurfaceTypeFromPayloadCMS]);

  // Determine if using smart mockups
  const isSmartMockup = useCallback(() => {
    return !!(mockup.smartVisA && mockup.smartVisA.length > 0);
  }, [mockup]);

  // Get visible areas (standard or smart)
  const getVisibleAreas = useCallback(() => {
  if (isSmartMockup()) {
    // Convert smart visible areas to standard format
    return mockup.smartVisA?.map(smartArea => ({
      id: smartArea.id,
      areaName: smartArea.areaName,
      visibility: smartArea.visibility,
      visibilityPercentage: smartArea.visibilityPercentage,
      designPlacement: {
        // Use auto placement if available, otherwise manual override
        coordinateX: smartArea.smartPlacement.enableManualOverride && smartArea.smartPlacement.manualX !== null 
          ? smartArea.smartPlacement.manualX 
          : (smartArea.smartPlacement.autoX || 0.3),
        coordinateY: smartArea.smartPlacement.enableManualOverride && smartArea.smartPlacement.manualY !== null 
          ? smartArea.smartPlacement.manualY 
          : (smartArea.smartPlacement.autoY || 0.3),
        coordinateWidth: smartArea.smartPlacement.enableManualOverride && smartArea.smartPlacement.manualWidth !== null 
          ? smartArea.smartPlacement.manualWidth 
          : (smartArea.smartPlacement.autoWidth || 0.4),
        coordinateHeight: smartArea.smartPlacement.enableManualOverride && smartArea.smartPlacement.manualHeight !== null 
          ? smartArea.smartPlacement.manualHeight 
          : (smartArea.smartPlacement.autoHeight || 0.4),
        rotation: smartArea.smartPlacement.rotation,
        skewX: smartArea.smartPlacement.skewX,
        skewY: smartArea.smartPlacement.skewY,
        scaleX: smartArea.smartPlacement.scaleX,
        scaleY: smartArea.smartPlacement.scaleY,
        blendMode: 'normal',
        opacity: 1,
        preserveColors: true
      },
      // Convert smart masking to standard masking
      maskingConfiguration: {
        enableMasking: smartArea.smartMasking.enableSmartMask,
        maskTypes: smartArea.generatedMask.maskTypes || 'gradient'
      },
      gradientMaskSettings: {
        gradientDirection: 'horizontal', // Default for smart
        gradientAngle: 0,
        fadeStart: 0.7,
        fadeEnd: 1.0,
        fadeIntensity: 0.8
      },
      // Smart areas get enhanced wrapping by default
      surfaceWrapSettings: {
        enableWrap: true,
        wrapAngle: 280,
        wrapIntensity: 0.8,
        dynamicWrap: true,
        wrapFalloff: 0.8
      }
    })) || [];
  } else {
    // Map standard PayloadCMS area structure to expected format
    return mockup.area?.map(payloadArea => ({
      id: payloadArea.id,
      areaName: payloadArea.areaName,
      visibility: payloadArea.visibility,
      visibilityPercentage: payloadArea.visibilityPercentage,
      
      // Map PayloadCMS 'design' field to 'designPlacement'
      designPlacement: {
        coordinateX: payloadArea.design?.coordinateX || 0.3,
        coordinateY: payloadArea.design?.coordinateY || 0.3,
        coordinateWidth: payloadArea.design?.coordinateWidth || 0.4,
        coordinateHeight: payloadArea.design?.coordinateHeight || 0.4,
        rotation: payloadArea.design?.rotation || 0,
        skewX: payloadArea.design?.skewX || 0,
        skewY: payloadArea.design?.skewY || 0,
        scaleX: payloadArea.design?.scaleX || 1,
        scaleY: payloadArea.design?.scaleY || 1,
        blendMode: payloadArea.design?.blend || 'normal', // PayloadCMS uses 'blend' not 'blendMode'
        opacity: payloadArea.design?.opacity !== null ? payloadArea.design.opacity : 1,
        preserveColors: payloadArea.design?.preserveColors !== false
      },
      
      // Map PayloadCMS 'fbrc' field to 'fabricIntegration'
      fabricIntegration: payloadArea.fbrc ? {
        enableFabricBlend: payloadArea.fbrc.enableFabricBlend || true,
        bfabType: payloadArea.fbrc.bfab || 'cotton', // PayloadCMS uses 'bfab' not 'bfabType'
        foldAwareness: payloadArea.fbrc.foldAwareness || false,
        seamAwareness: payloadArea.fbrc.seamAwareness || false,
        textureIntensity: payloadArea.fbrc.textureIntensity || 0.3,
        fabricColor: payloadArea.fbrc.fabricColor || '#ffffff',
        fabricRoughness: payloadArea.fbrc.fabricRoughness || 0.3
      } : undefined,
      
      // Map PayloadCMS 'Config' field to 'maskingConfiguration'
      maskingConfiguration: payloadArea.Config ? {
        enableMasking: payloadArea.Config.enableMasking || false,
        maskTypes: payloadArea.Config.mask || 'gradient', // PayloadCMS uses 'mask' not 'maskTypes'
        maskPath: payloadArea.Config.maskPath || undefined
      } : {
        enableMasking: false,
        maskTypes: 'gradient'
      },
      
      // Map PayloadCMS 'grdnmsk' field to 'gradientMaskSettings'
      gradientMaskSettings: payloadArea.grdnmsk ? {
        gradientDirection: payloadArea.grdnmsk.grdn || 'horizontal', // PayloadCMS uses 'grdn' not 'gradientDirection'
        gradientAngle: payloadArea.grdnmsk.gradientAngle || 0,
        fadeStart: payloadArea.grdnmsk.fadeStart || 0.7,
        fadeEnd: payloadArea.grdnmsk.fadeEnd || 1.0,
        fadeIntensity: payloadArea.grdnmsk.fadeIntensity || 0.8
      } : {
        gradientDirection: 'horizontal',
        gradientAngle: 0,
        fadeStart: 0.7,
        fadeEnd: 1.0,
        fadeIntensity: 0.8
      },
      
      // Map surface wrap settings
      surfaceWrapSettings: payloadArea.surfaceWrapSettings || {
        enableWrap: false,
        wrapAngle: 280,
        wrapIntensity: 0.8,
        dynamicWrap: false,
        wrapFalloff: 0.8
      },
      
      // Map perspective settings
      perspectiveSettings: payloadArea.perspectiveSettings || {
        enablePerspective: false,
        perspectiveIntensity: 0.5,
        dynamicPerspective: false
      },
      
      // Map edge detection settings
      edgeDetectionSettings: payloadArea.edgeDetectionSettings || {
        enableEdgeDetection: false,
        edgeThreshold: 128,
        edgeSoftness: 2
      },
      
      // Map PayloadCMS 'fbrEft' field to 'fabricEffectsSettings'
      fabricEffectsSettings: payloadArea.fbrEft ? {
        enableFolds: payloadArea.fbrEft.enableFolds || false,
        foldIntensity: payloadArea.fbrEft.foldIntensity || 0.3,
        foldDirection: payloadArea.fbrEft.fold || 'horizontal', // PayloadCMS uses 'fold' not 'foldDirection'
        seamDistrt: payloadArea.fbrEft.seamDistrt || false,
        fabricDpth: payloadArea.fbrEft.fabricDpth || 1
      } : {
        enableFolds: false,
        foldIntensity: 0.3,
        foldDirection: 'horizontal',
        seamDistrt: false,
        fabricDpth: 1
      }
    })) || [];
  }
}, [mockup, isSmartMockup]);

  useEffect(() => {
  if (!canvasRef.current || !mockup?.photo?.url) {
    log('Missing canvas or mockup photo URL');
    setIsLoading(false);
    return;
  }

  const renderProfessionalMockup = async () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d', {
      willReadFrequently: false,
      alpha: true,
      desynchronized: true
    });

    if (!ctx) {
      setRenderError('Failed to get canvas context');
      return;
    }

    try {
      log('Starting professional mockup render');
      setRenderProgress(10);

      validateDimensions(displayDimensions.width, displayDimensions.height, 'display');

      const mockupImg = await loadImageWithProgress(
        resolveImageUrl(mockup.photo.url),
        (progress) => setRenderProgress(10 + progress * 0.2)
      );
      
      log('Mockup image loaded', { 
        width: mockupImg.width, 
        height: mockupImg.height,
        isSmartMockup: isSmartMockup(),
        aiAnalysisStatus: mockup.aiAnalRes?.analStat
      });
      setRenderProgress(30);

      canvas.width = displayDimensions.width;
      canvas.height = displayDimensions.height;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw base mockup
      ctx.drawImage(mockupImg, 0, 0, displayDimensions.width, displayDimensions.height);
      log('Base mockup drawn');
      setRenderProgress(40);

      // Get dynamic configurations from PayloadCMS
      const surfaceProps = getDynamicSurfaceProperties();
      const fabricProps = getDynamicFabricProperties();
      const lightingProps = getDynamicLighting();
      const visibleAreas = getVisibleAreas(); // FIXED: Call the function and assign to variable

      log('Dynamic PayloadCMS configurations loaded', {
        surfaceType: surfaceProps.renderType,
        fabricType: fabricProps.fabricType,
        lighting: lightingProps,
        isSmartMockup: isSmartMockup(),
        areaCount: visibleAreas.length
      });

      // Process visible areas with professional rendering
      if (visibleAreas && visibleAreas.length > 0) {
        log(`Processing ${visibleAreas.length} visible areas (${isSmartMockup() ? 'Smart AI' : 'Standard'})`);
        
        console.log(`👁️ Visible areas:`, visibleAreas.map(visibleArea => ({
          areaName: visibleArea.areaName,
          visibility: visibleArea.visibility,
          hasDesignPlacement: !!visibleArea.designPlacement,
          wrapEnabled: visibleArea.surfaceWrapSettings?.enableWrap || false,
          wrapAngle: visibleArea.surfaceWrapSettings?.wrapAngle,
          wrapIntensity: visibleArea.surfaceWrapSettings?.wrapIntensity,
          maskingEnabled: visibleArea.maskingConfiguration?.enableMasking || false
        })));
        
        console.log(`🎨 Available design element areas:`, Object.entries(designElements).map(([areaName, elems]) => ({
          area: areaName,
          count: elems.length,
          elementIds: elems.map(el => el.id)
        })));
        
        for (let i = 0; i < visibleAreas.length; i++) {
          const currentArea = visibleAreas[i]; // FIXED: Use currentArea instead of area
          log(`Processing area ${i + 1}/${visibleAreas.length}: ${currentArea.areaName}`);
          
          await renderDynamicProfessionalArea(
            ctx,
            currentArea, // FIXED: Pass currentArea
            designElements,
            canvasConfigs,
            canvasPrintableAreas,
            displayDimensions,
            mockup,
            surfaceProps,
            fabricProps,
            lightingProps,
            fabricSettings,
            validateCanvas,
            safeCreateCanvas,
            normalizeCoordinates
          );
          
          setRenderProgress(40 + ((i + 1) / visibleAreas.length) * 50);
        }
      } else {
        console.warn(`⚠️ No visible areas found in mockup data`);
      }

      await applyFinalEnhancements(ctx, displayDimensions, mockup, surfaceProps, lightingProps);
      setRenderProgress(100);

      log(`Professional mockup render complete (${isSmartMockup() ? 'Smart AI' : 'Standard'})`);
      setIsLoading(false);

    } catch (error) {
      console.error('Professional mockup render error:', error);
      setRenderError(`Render failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  renderProfessionalMockup();
}, [mockup, designElements, canvasConfigs, canvasPrintableAreas, displayDimensions, productType, productColor, surfaceConfiguration, fabricSettings, log, validateDimensions, validateCanvas, safeCreateCanvas, getDynamicSurfaceProperties, getDynamicFabricProperties, getDynamicLighting, getVisibleAreas, isSmartMockup]);
// FIXED: Updated dependency array to use getVisibleAreas instead of getarea

  if (isLoading) {
    const smartStatus = isSmartMockup() ? 'Smart AI' : 'Standard';
    const aiStatus = mockup.aiAnalRes?.analStat || 'N/A';
    
    return (
      <div className="flex items-center justify-center w-full h-full rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="p-6 text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-30"></div>
            <div className="relative p-3 bg-white rounded-full shadow-lg">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="mb-1 text-sm font-semibold text-gray-700">Professional Rendering</p>
          <p className="mb-1 text-xs text-gray-500">PayloadCMS Dynamic Configuration</p>
          <p className="mb-3 text-xs text-blue-600">{smartStatus} Mockup • AI: {aiStatus}</p>
          
          <div className="w-48 h-2 mx-auto bg-gray-200 rounded-full">
            <div 
              className="h-2 transition-all duration-300 bg-blue-600 rounded-full"
              style={{ width: `${renderProgress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-gray-400">{renderProgress}%</p>
        </div>
      </div>
    );
  }

  if (renderError) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <div className="max-w-md p-6 text-center">
          <div className="mb-3 text-2xl text-red-500">⚠️</div>
          <p className="mb-2 text-sm font-medium text-gray-700">Render Error</p>
          <p className="mb-4 text-xs text-gray-500">{renderError}</p>
        </div>
      </div>
    );
  }

  const surfaceType = getSurfaceTypeFromPayloadCMS();
  const smartStatus = isSmartMockup();
  const aiStatus = mockup.aiAnalRes?.analStat;

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={displayDimensions.width}
        height={displayDimensions.height}
        className="object-contain w-full h-full"
      />
      
      <div className="absolute flex items-center gap-2 top-3 right-3">
        {/* <div className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-green-600 rounded-full shadow-lg">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">PRO</span>
        </div>
         */}
        {/* Smart/AI indicator */}
        {/* {smartStatus && (
          <div className={`text-white text-xs px-2 py-1 rounded-full shadow-lg ${
            aiStatus === 'completed' ? 'bg-green-600' :
            aiStatus === 'pending' ? 'bg-yellow-600' :
            aiStatus === 'failed' ? 'bg-red-600' :
            'bg-purple-600'
          }`}>
            <span className="font-medium">🤖 AI</span>
          </div>
        )} */}
        
        {/* Dynamic surface type indicator */}
        {/* <div className={`text-white text-xs px-2 py-1 rounded-full shadow-lg ${
          surfaceType === 'cylindrical' ? 'bg-purple-600' :
          surfaceType === 'apparel_body' ? 'bg-indigo-600' :
          surfaceType === 'sleeve_wrap' ? 'bg-orange-600' :
          'bg-gray-600'
        }`}>
          <span className="font-medium">{surfaceType.toUpperCase()}</span>
        </div> */}
        
        {/* {fabricSettings.enableRealisticFabric && (
          <div className="px-2 py-1 text-xs text-white bg-blue-600 rounded-full shadow-lg">
            <span className="font-medium">FABRIC</span>
          </div>
        )} */}
      </div>
    </div>
  );
};

/**
 * Enhanced render area function with full PayloadCMS dynamic configuration
 */
async function renderDynamicProfessionalArea(
  ctx: CanvasRenderingContext2D,
  visibleArea: any,
  designElements: Record<string, DesignElement[]>,
  canvasConfigs: Record<string, CanvasConfig>,
  canvasPrintableAreas: Record<string, PrintableArea>,
  displayDimensions: { width: number; height: number },
  mockup: PayloadCMSMockupData,
  surfaceProps: any,
  fabricProps: any,
  lightingProps: any,
  fabricSettings: any,
  validateCanvas: (canvas: HTMLCanvasElement, context: string) => boolean,
  safeCreateCanvas: (width: number, height: number, context: string) => { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D },
  normalizeCoordinates: (coords: any, refWidth: number, refHeight: number) => any
) {
  const originalAreaName = visibleArea.areaName;
  const areaName = originalAreaName.toLowerCase();
  
  console.log(`🎨 Processing visible area: "${originalAreaName}" (normalized: "${areaName}")`);
  console.log(`🔧 Surface Props:`, surfaceProps);
  console.log(`🧵 Fabric Props:`, fabricProps);
  console.log(`💡 Lighting Props:`, lightingProps);
  
  // Try multiple area name variations to find elements
  let elements: DesignElement[] = [];
  let foundAreaKey = '';
  
  const areaVariations = [
    areaName,
    originalAreaName,
    areaName.charAt(0).toUpperCase() + areaName.slice(1),
    originalAreaName.toLowerCase(),
    originalAreaName.toUpperCase(),
    areaName === 'left' ? 'sleeve' : areaName,
    areaName === 'left' ? 'left_sleeve' : areaName,
    areaName === 'left' ? 'leftsleeve' : areaName,
    areaName === 'sleeve' ? 'left' : areaName,
    areaName === 'front' ? 'body' : areaName,
    areaName === 'body' ? 'front' : areaName
  ];
  
  for (const variation of areaVariations) {
    if (designElements[variation] && designElements[variation].length > 0) {
      elements = designElements[variation];
      foundAreaKey = variation;
      console.log(`✅ Found elements using area key: "${variation}"`);
      break;
    }
  }
  
  console.log(`🔍 Found ${elements.length} elements for area "${originalAreaName}" using key "${foundAreaKey}"`);
  
  if (elements.length === 0) {
    console.log(`⚪ No elements found for area: ${originalAreaName}`);
    return;
  }

  elements.forEach((el, idx) => {
    console.log(`   Element ${idx + 1}: ${el.id} (${el.width}x${el.height}) at (${el.x}, ${el.y}) - hasImage: ${!!el.image}`);
  });

  // Find canvas config with flexible matching
  let canvasConfig = canvasConfigs[areaName] || canvasConfigs[originalAreaName] || canvasConfigs[foundAreaKey];
  let printableArea = canvasPrintableAreas[areaName] || canvasPrintableAreas[originalAreaName] || canvasPrintableAreas[foundAreaKey];
  
  if (!canvasConfig && Object.keys(canvasConfigs).length > 0) {
    const firstConfigKey = Object.keys(canvasConfigs)[0];
    canvasConfig = canvasConfigs[firstConfigKey];
    console.log(`🔄 Using fallback canvas config from "${firstConfigKey}" for area "${originalAreaName}"`);
  }
  
  if (!printableArea && Object.keys(canvasPrintableAreas).length > 0) {
    const firstAreaKey = Object.keys(canvasPrintableAreas)[0];
    printableArea = canvasPrintableAreas[firstAreaKey];
    console.log(`🔄 Using fallback printable area from "${firstAreaKey}" for area "${originalAreaName}"`);
  }
  
  // Create default config if still missing
  if (!canvasConfig) {
    canvasConfig = {
      width: 800,
      height: 600,
      realWorldWidth: 8,
      realWorldHeight: 6
    };
  }
  
  if (!printableArea) {
    if (originalAreaName.toLowerCase().includes('left') || originalAreaName.toLowerCase().includes('sleeve')) {
      printableArea = {
        x: canvasConfig.width * 0.05,
        y: canvasConfig.height * 0.3,
        width: canvasConfig.width * 0.25,
        height: canvasConfig.height * 0.2
      };
    } else {
      printableArea = {
        x: canvasConfig.width * 0.1,
        y: canvasConfig.height * 0.1,
        width: canvasConfig.width * 0.8,
        height: canvasConfig.height * 0.8
      };
    }
  }

  try {
    // STEP 1: Create design composite
    console.log(`🎯 Step 1: Creating design composite for ${elements.length} elements`);
    const designComposite = await createCleanDesignComposite(elements, canvasConfig, safeCreateCanvas);
    if (!designComposite) {
      console.error(`❌ Failed to create design composite for area: ${originalAreaName}`);
      return;
    }

    // STEP 2: Transform to print area coordinates
    console.log(`🎯 Step 2: Transforming to print area`);
    const printAreaCanvas = await transformToPrintAreaSafe(
      designComposite,
      canvasConfig,
      printableArea,
      safeCreateCanvas,
      normalizeCoordinates
    );

    // STEP 3: Apply dynamic surface effects from PayloadCMS
    console.log(`🎯 Step 3: Applying dynamic surface effects`);
    const wrappedCanvas = await applyDynamicSurfaceEffects(
      printAreaCanvas,
      visibleArea,
      surfaceProps,
      fabricProps,
      lightingProps,
      fabricSettings,
      safeCreateCanvas,
      normalizeCoordinates
    );

    // STEP 4: Apply final placement with PayloadCMS coordinates
    console.log(`🎯 Step 4: Applying final placement (PayloadCMS coordinates)`);
    await applyDynamicPlacement(
      ctx,
      wrappedCanvas,
      visibleArea,
      displayDimensions,
      surfaceProps,
      fabricSettings,
      validateCanvas
    );

    console.log(`✅ Final placement completed for area: ${originalAreaName}`);

  } catch (error) {
    console.error(`❌ Error rendering area ${originalAreaName}:`, error);
  }
}

/**
 * Create clean design composite without debug elements
 */
async function createCleanDesignComposite(
  elements: DesignElement[],
  canvasConfig: CanvasConfig,
  safeCreateCanvas: (width: number, height: number, context: string) => { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }
): Promise<HTMLCanvasElement | null> {
  if (elements.length === 0) {
    return null;
  }

  console.log(`🎨 Creating clean composite with ${elements.length} elements`);

  try {
    const { canvas, ctx } = safeCreateCanvas(
      canvasConfig.width,
      canvasConfig.height,
      'design composite'
    );

    const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    let successfulDraws = 0;

    for (let i = 0; i < sortedElements.length; i++) {
      const element = sortedElements[i];
      
      if (!element.image) {
        if (element.imageUrl) {
          try {
            const img = await loadImageSync(element.imageUrl);
            element.image = img;
          } catch (loadError) {
            continue;
          }
        } else {
          continue;
        }
      }

      // Validate element dimensions
      if (!element.width || !element.height || element.width <= 0 || element.height <= 0) {
        continue;
      }
      
      // Ensure minimum size for visibility
      let adjustedWidth = Math.max(element.width, 30);
      let adjustedHeight = Math.max(element.height, 30);

      if (typeof element.x !== 'number' || typeof element.y !== 'number') {
        continue;
      }

      try {
        ctx.save();

        const centerX = element.x + adjustedWidth / 2;
        const centerY = element.y + adjustedHeight / 2;
        
        ctx.translate(centerX, centerY);
        if (element.rotation) {
          const rotation = Math.max(-360, Math.min(360, element.rotation)) * Math.PI / 180;
          ctx.rotate(rotation);
        }
        ctx.scale(element.scaleX || 1, element.scaleY || 1);
        ctx.globalAlpha = Math.max(0, Math.min(1, element.opacity || 1));
        ctx.translate(-adjustedWidth / 2, -adjustedHeight / 2);

        if (element.image.complete && element.image.naturalWidth > 0) {
          ctx.drawImage(element.image, 0, 0, adjustedWidth, adjustedHeight);
          successfulDraws++;
        }
        
        ctx.restore();

      } catch (elementError) {
        console.error(`❌ Error drawing element ${element.id}:`, elementError);
        ctx.restore();
        continue;
      }
    }

    console.log(`✅ Clean composite completed: ${successfulDraws}/${sortedElements.length} elements drawn`);
    
    if (successfulDraws === 0) {
      return null;
    }

    return canvas;

  } catch (error) {
    console.error('❌ Error creating design composite:', error);
    return null;
  }
}

/**
 * Synchronous image loading helper
 */
function loadImageSync(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(new Error(`Failed to load image: ${url}`));
    
    const resolvedUrl = resolveImageUrl(url);
    img.src = resolvedUrl;
  });
}

/**
 * Safe transform with proper coordinate system handling
 */
async function transformToPrintAreaSafe(
  designCanvas: HTMLCanvasElement,
  canvasConfig: CanvasConfig,
  printableArea: PrintableArea,
  safeCreateCanvas: (width: number, height: number, context: string) => { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D },
  normalizeCoordinates: (coords: any, refWidth: number, refHeight: number) => any
): Promise<HTMLCanvasElement> {
  
  if (!designCanvas || designCanvas.width <= 0 || designCanvas.height <= 0) {
    throw new Error(`Invalid design canvas: ${designCanvas?.width}x${designCanvas?.height}`);
  }

  const normalizedPrintableArea = normalizeCoordinates(printableArea, canvasConfig.width, canvasConfig.height);

  const maxWidth = Math.min(4000, canvasConfig.width);
  const maxHeight = Math.min(4000, canvasConfig.height);
  
  const printAreaPixelWidth = Math.max(50, Math.min(maxWidth, Math.round(normalizedPrintableArea.width * canvasConfig.width)));
  const printAreaPixelHeight = Math.max(50, Math.min(maxHeight, Math.round(normalizedPrintableArea.height * canvasConfig.height)));
  
  const { canvas, ctx } = safeCreateCanvas(
    printAreaPixelWidth,
    printAreaPixelHeight,
    'print area transform'
  );
  
  const sourceX = Math.max(0, Math.min(normalizedPrintableArea.x * canvasConfig.width, canvasConfig.width - 1));
  const sourceY = Math.max(0, Math.min(normalizedPrintableArea.y * canvasConfig.height, canvasConfig.height - 1));
  const sourceWidth = Math.min(printAreaPixelWidth, canvasConfig.width - sourceX);
  const sourceHeight = Math.min(printAreaPixelHeight, canvasConfig.height - sourceY);
  
  if (sourceWidth > 0 && sourceHeight > 0) {
    try {
      if (designCanvas.width <= printAreaPixelWidth && designCanvas.height <= printAreaPixelHeight) {
        ctx.drawImage(designCanvas, 0, 0);
      } else {
        ctx.drawImage(
          designCanvas,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, canvas.width, canvas.height
        );
      }
    } catch (error) {
      console.error('❌ Error in print area transform:', error);
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else {
    ctx.fillStyle = '#ffcccc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  return canvas;
}

/**
 * Apply dynamic surface effects based on PayloadCMS configuration
 */
async function applyDynamicSurfaceEffects(
  canvas: HTMLCanvasElement,
  visibleArea: any,
  surfaceProps: any,
  fabricProps: any,
  lightingProps: any,
  fabricSettings: any,
  safeCreateCanvas: (width: number, height: number, context: string) => { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D },
  normalizeCoordinates: (coords: any, refWidth: number, refHeight: number) => any
): Promise<HTMLCanvasElement> {
  
  if (!canvas || canvas.width <= 0 || canvas.height <= 0) {
    throw new Error(`Invalid input canvas for surface effects: ${canvas?.width}x${canvas?.height}`);
  }

  const { canvas: resultCanvas, ctx } = safeCreateCanvas(
    canvas.width,
    canvas.height,
    'surface effects'
  );

  try {
    // STEP 1: Start with the original design
    ctx.drawImage(canvas, 0, 0);

    // STEP 2: Apply dynamic surface wrapping based on PayloadCMS
    const shouldWrap = visibleArea.surfaceWrapSettings?.enableWrap || 
                      surfaceProps.renderType === 'cylindrical' ||
                      surfaceProps.renderType === 'sleeve_wrap';
    
    if (shouldWrap) {
      console.log(`🌯 Applying dynamic surface wrapping for ${visibleArea.areaName}`);
      console.log(`🔧 Wrap settings:`, visibleArea.surfaceWrapSettings);
      console.log(`🔧 Surface props:`, surfaceProps);
      
      await applyDynamicWrapping(ctx, canvas, visibleArea, surfaceProps, fabricProps);
    } else {
      console.log(`⚪ No wrapping enabled for ${visibleArea.areaName}`);
    }

    // STEP 3: Apply fabric integration based on PayloadCMS
    const shouldApplyFabric = fabricSettings.enableRealisticFabric && 
                             (visibleArea.fabricIntegration?.enableFabricBlend !== false);
    
    if (shouldApplyFabric) {
      console.log(`🧵 Applying fabric integration for ${visibleArea.areaName}`);
      await applyDynamicFabricIntegration(ctx, visibleArea.fabricIntegration, fabricProps, resultCanvas, fabricSettings);
    }

    // STEP 4: Apply advanced masking based on PayloadCMS
    if (visibleArea.visibility !== 'full' || visibleArea.maskingConfiguration?.enableMasking) {
      console.log(`🎭 Applying advanced masking for ${visibleArea.areaName}: ${visibleArea.visibility}`);
      await applyAdvancedMasking(ctx, visibleArea, resultCanvas, fabricProps);
    }

    // STEP 5: Apply lighting effects based on PayloadCMS
    if (lightingProps.lightIntensity > 0.5) {
      console.log(`💡 Applying lighting effects for ${visibleArea.areaName}`);
      await applyDynamicLighting(ctx, lightingProps, resultCanvas);
    }

  } catch (error) {
    console.error('❌ Error applying surface effects:', error);
    const fallbackCtx = resultCanvas.getContext('2d')!;
    fallbackCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
    fallbackCtx.drawImage(canvas, 0, 0);
  }

  return resultCanvas;
}

/**
 * Apply dynamic wrapping based on PayloadCMS surface configuration
 */
async function applyDynamicWrapping(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  visibleArea: any,
  surfaceProps: any,
  fabricProps: any
) {
  const wrapSettings = visibleArea.surfaceWrapSettings || {};
  const enableWrap = wrapSettings.enableWrap || surfaceProps.renderType === 'cylindrical';
  
  if (!enableWrap) {
    console.log(`⚪ Wrapping disabled for ${visibleArea.areaName}`);
    ctx.drawImage(source, 0, 0);
    return;
  }

  // Use PayloadCMS values with fallbacks
  const wrapAngle = Math.max(0, Math.min(360, 
    wrapSettings.wrapAngle || surfaceProps.wrapAngle || 280
  )) * Math.PI / 180;
  
  const wrapIntensity = Math.max(0, Math.min(1, 
    wrapSettings.wrapIntensity || surfaceProps.curveInten|| 0.8
  ));
  
  const dynamicWrap = wrapSettings.dynamicWrap || false;
  const wrapFalloff = wrapSettings.wrapFalloff || 0.8;
  
  console.log(`🌯 Applying dynamic wrapping to ${visibleArea.areaName}`, {
    renderType: surfaceProps.renderType,
    wrapAngle: wrapSettings.wrapAngle || surfaceProps.wrapAngle,
    wrapIntensity: wrapSettings.wrapIntensity || surfaceProps.curveIntensity,
    dynamicWrap,
    wrapFalloff,
    fabricType: fabricProps.fabricType
  });

  try {
    // Apply wrapping based on surface type
    switch (surfaceProps.renderType) {
      case 'cylindrical':
        await applyEnhancedCylindricalWrap(ctx, source, wrapAngle, wrapIntensity, wrapFalloff, fabricProps, visibleArea);
        break;
      case 'apparel_body':
        await applyEnhancedApparelWrap(ctx, source, wrapIntensity, fabricProps);
        break;
      case 'sleeve_wrap':
        await applyEnhancedSleeveWrap(ctx, source, wrapAngle, wrapIntensity, wrapFalloff, fabricProps);
        break;
      case 'conical':
        await applyEnhancedConicalWrap(ctx, source, wrapAngle, wrapIntensity, fabricProps);
        break;
      default:
        console.log(`⚪ No specific wrapping for ${surfaceProps.renderType}, using flat rendering`);
        ctx.drawImage(source, 0, 0);
    }
    
    console.log(`🔄 Applied ${surfaceProps.renderType} wrap for ${visibleArea.areaName}`);
  } catch (error) {
    console.error('Error in dynamic wrapping:', error);
    ctx.drawImage(source, 0, 0);
  }
}

/**
 * Enhanced cylindrical wrap with PayloadCMS configuration and visibility handling
 */
async function applyEnhancedCylindricalWrap(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  wrapAngle: number,
  intensity: number,
  falloff: number,
  fabricProps: any,
  visibleArea: any
) {
  const width = source.width;
  const height = source.height;
  
  try {
    console.log(`🌯 Applying enhanced cylindrical wrap: angle=${wrapAngle}, intensity=${intensity}, falloff=${falloff}`);
    
    // Enhanced sampling rate based on fabric type
    let sampleRate = Math.max(1, Math.min(8, Math.floor(width / 80)));
    if (fabricProps.fabricType === 'ceramic' || fabricProps.fabricType === 'metal') {
      sampleRate = Math.max(1, Math.floor(sampleRate / 2)); // Higher quality for hard surfaces
    }
    
    // Get visibility percentage for cylindrical surfaces (like mugs)
    const visibilityPercentage = visibleArea.visibilityPercentage || 100;
    const visibilityFactor = visibilityPercentage / 100;
    
    console.log(`🔍 Cylindrical visibility: ${visibilityPercentage}% (factor: ${visibilityFactor})`);
    
    for (let x = 0; x < width; x += sampleRate) {
      const relativeX = Math.max(-1, Math.min(1, (x - width / 2) / (width / 2)));
      const angle = relativeX * wrapAngle / 2;
      
      // Enhanced perspective calculation with visibility consideration
      let perspective = Math.max(0.2, Math.cos(angle) * intensity + (1 - intensity));
      const skew = Math.max(-0.4, Math.min(0.4, Math.sin(angle) * 0.3));
      
      // Apply fabric-specific adjustments
      if (fabricProps.fabricType === 'ceramic') {
        perspective = Math.max(0.3, perspective); // Ceramics maintain more shape
      } else if (fabricProps.fabricType === 'metal') {
        perspective = Math.max(0.4, perspective); // Metals are rigid
      }
      
      // Apply falloff
      const distanceFromCenter = Math.abs(relativeX);
      const falloffFactor = 1 - Math.pow(distanceFromCenter, 2) * (1 - falloff);
      perspective = perspective * falloffFactor + (1 - falloffFactor);
      
      // Apply visibility masking for partial visibility (like mug wrapping)
      let opacity = Math.max(0.5, 0.8 + perspective * 0.2);
      if (visibilityFactor < 1) {
        // For partial visibility, fade edges more aggressively
        const edgeFade = 1 - Math.pow(distanceFromCenter, 1.5);
        opacity *= Math.max(0.1, edgeFade * visibilityFactor);
      }
      
      if (fabricProps.fabricType === 'ceramic' || fabricProps.fabricType === 'metal') {
        opacity = Math.max(0.7, opacity); // Maintain more opacity for hard surfaces
      }
      
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, 0, sampleRate, height);
      ctx.clip();
      
      ctx.setTransform(1, 0, skew, perspective, 0, height * (1 - perspective) / 2);
      ctx.globalAlpha = opacity;
      
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    

  } catch (error) {
    
    ctx.drawImage(source, 0, 0);
  }
}

/**
 * Enhanced apparel wrap with PayloadCMS configuration
 */
async function applyEnhancedApparelWrap(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  intensity: number,
  fabricProps: any
) {
  try {
    ctx.save();
    
    // Fabric-specific transform adjustments
    let transform = {
      a: 1,
      b: Math.max(-0.05, Math.min(0.05, 0.01 * intensity)),
      c: Math.max(-0.05, Math.min(0.05, 0.02 * intensity)),
      d: Math.max(0.9, 0.98 + 0.02 * intensity),
      e: source.width * 0.005,
      f: source.height * 0.01
    };
    
    // Adjust based on fabric properties
    if (fabricProps.stretchability > 0.3) {
      // More stretchy fabrics have more pronounced wrapping
      transform.b *= 1.2;
      transform.c *= 1.2;
    } else if (fabricProps.fabricType === 'denim' || fabricProps.fabricType === 'canvas') {
      // Stiffer fabrics have less wrapping
      transform.b *= 0.7;
      transform.c *= 0.7;
    }
    
    ctx.setTransform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
    ctx.drawImage(source, 0, 0);
    
    ctx.restore();
    console.log(`✅ Enhanced apparel wrap applied for ${fabricProps.fabricType}`);
  } catch (error) {
    console.error('Error in enhanced apparel wrap:', error);
    ctx.drawImage(source, 0, 0);
  }
}

/**
 * Enhanced sleeve wrap with PayloadCMS configuration
 */
async function applyEnhancedSleeveWrap(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  wrapAngle: number,
  intensity: number,
  falloff: number,
  fabricProps: any
) {
  const width = source.width;
  const height = source.height;
  
  try {
    console.log(`👕 Applying enhanced sleeve wrap: angle=${wrapAngle}, intensity=${intensity}`);
    
    const sampleRate = Math.max(2, Math.floor(width / 50)); // Finer sampling for sleeves
    
    for (let x = 0; x < width; x += sampleRate) {
      const relativeX = (x - width / 2) / (width / 2);
      const angle = relativeX * wrapAngle / 3; // Sleeves have less dramatic wrapping
      
      let perspective = Math.max(0.4, Math.cos(angle) * intensity * 0.8 + 0.2);
      const skew = Math.sin(angle) * 0.15; // Less skew for sleeves
      
      // Apply fabric-specific adjustments for sleeves
      if (fabricProps.stretchability > 0.2) {
        perspective *= 0.9; // Stretchy fabrics conform more
      }
      
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, 0, sampleRate, height);
      ctx.clip();
      
      ctx.setTransform(1, 0, skew, perspective, 0, height * (1 - perspective) / 2);
      ctx.globalAlpha = Math.max(0.6, 0.85 + perspective * 0.15);
      
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    console.log(`✅ Enhanced sleeve wrap applied successfully`);
  } catch (error) {
    console.error('Error in enhanced sleeve wrap:', error);
    ctx.drawImage(source, 0, 0);
  }
}

/**
 * Enhanced conical wrap with PayloadCMS configuration
 */
async function applyEnhancedConicalWrap(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  wrapAngle: number,
  intensity: number,
  fabricProps: any
) {
  const width = source.width;
  const height = source.height;
  
  try {
    console.log(`🔺 Applying enhanced conical wrap`);
    
    const sampleRate = Math.max(1, Math.floor(width / 80));
    
    for (let x = 0; x < width; x += sampleRate) {
      const relativeX = (x - width / 2) / (width / 2);
      const angle = relativeX * wrapAngle / 2;
      
      // Conical surfaces have varying perspective along the height
      for (let y = 0; y < height; y += Math.max(5, Math.floor(height / 20))) {
        const relativeY = y / height;
        const conicalFactor = 1 - relativeY * 0.3; // Narrower at the top
        
        let perspective = Math.max(0.3, Math.cos(angle) * intensity * conicalFactor + (1 - intensity));
        const skew = Math.sin(angle) * 0.2 * conicalFactor;
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, sampleRate, Math.max(5, Math.floor(height / 20)));
        ctx.clip();
        
        ctx.setTransform(conicalFactor, 0, skew, perspective, 0, y * (1 - perspective) / 2);
        ctx.globalAlpha = Math.max(0.6, 0.8 + perspective * 0.2);
        
        ctx.drawImage(source, 0, 0);
        ctx.restore();
      }
    }
    
    console.log(`✅ Enhanced conical wrap applied successfully`);
  } catch (error) {
    console.error('Error in enhanced conical wrap:', error);
    ctx.drawImage(source, 0, 0);
  }
}

/**
 * Apply dynamic fabric integration based on PayloadCMS
 */
async function applyDynamicFabricIntegration(
  ctx: CanvasRenderingContext2D,
  fabricIntegration: any,
  fabricProps: any,
  canvas: HTMLCanvasElement,
  fabricSettings: any
) {
  const fabricType = fabricIntegration?.bfabType || fabricProps.fabricType || 'cotton';
  const textureIntensity = Math.max(0.1, Math.min(1, 
    fabricIntegration?.textureIntensity || fabricSettings.fabricIntensity || 0.5
  ));
  const fabricColor = fabricIntegration?.fabricColor || '#ffffff';
  
  console.log(`🧵 Applying dynamic fabric integration: ${fabricType}, intensity: ${textureIntensity}`);
  
  try {
    ctx.save();
    
    // Apply fabric-specific blending
    if (fabricType === 'ceramic' || fabricType === 'metal') {
      // Hard surfaces - minimal fabric integration
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = Math.max(0.05, Math.min(0.2, textureIntensity * 0.2));
    } else {
      // Soft fabrics - normal fabric integration
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = Math.max(0.15, Math.min(0.6, textureIntensity * 0.4));
    }
    
    const fabricTexture = createDynamicFabricTexture(
      canvas.width, 
      canvas.height, 
      fabricType, 
      fabricColor, 
      fabricProps,
      fabricSettings
    );
    ctx.drawImage(fabricTexture, 0, 0);
    
    // Apply fold awareness if enabled
    if (fabricIntegration?.foldAwareness && fabricType !== 'ceramic' && fabricType !== 'metal') {
      for (let layer = 0; layer < 2; layer++) {
        ctx.globalCompositeOperation = layer === 0 ? 'multiply' : 'overlay';
        ctx.globalAlpha = Math.max(0.1, Math.min(0.4, textureIntensity * (0.3 - layer * 0.08)));
        
        const wrinklePattern = createDynamicWrinklePattern(
          canvas.width, 
          canvas.height, 
          fabricType, 
          fabricProps,
          fabricSettings
        );
        ctx.drawImage(wrinklePattern, 0, 0);
      }
    }
    
    // Apply color interaction if specified
    if (fabricColor !== '#ffffff') {
      ctx.globalCompositeOperation = 'color';
      ctx.globalAlpha = Math.max(0.05, Math.min(0.25, 0.15));
      ctx.fillStyle = fabricColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Apply surface-specific finishing
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = Math.max(0.1, Math.min(0.3, textureIntensity * 0.2));
    
    let gradient;
    if (fabricType === 'ceramic') {
      // Ceramic gets a glossy finish
      gradient = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.3, 0,
        canvas.width * 0.7, canvas.height * 0.7, Math.max(canvas.width, canvas.height) * 0.8
      );
      gradient.addColorStop(0, 'rgba(255,255,255,0.4)');
      gradient.addColorStop(0.3, 'rgba(255,255,255,0.1)');
      gradient.addColorStop(0.7, 'rgba(0,0,0,0.1)');
      gradient.addColorStop(1, 'rgba(255,255,255,0.2)');
    } else if (fabricType === 'metal') {
      // Metal gets a metallic finish
      gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(255,255,255,0.3)');
      gradient.addColorStop(0.5, 'rgba(0,0,0,0.1)');
      gradient.addColorStop(1, 'rgba(255,255,255,0.25)');
    } else {
      // Fabric gets a textile finish
      gradient = ctx.createRadialGradient(
        canvas.width * 0.2, canvas.height * 0.2, 0,
        canvas.width * 0.8, canvas.height * 0.8, Math.max(canvas.width, canvas.height) * 1.2
      );
      gradient.addColorStop(0, 'rgba(255,255,255,0.25)');
      gradient.addColorStop(0.3, 'rgba(0,0,0,0.15)');
      gradient.addColorStop(0.7, 'rgba(255,255,255,0.2)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.restore();
    
    console.log(`✅ Dynamic fabric integration applied for ${fabricType}`);
    
  } catch (error) {
    console.error('❌ Error applying dynamic fabric integration:', error);
    ctx.restore();
  }
}

/**
 * Create dynamic fabric texture based on PayloadCMS properties
 */
function createDynamicFabricTexture(
  width: number,
  height: number,
  fabricType: string,
  fabricColor: string,
  fabricProps: any,
  fabricSettings: any
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;
  
  try {
    let r = 240, g = 240, b = 240;
    if (fabricColor && fabricColor.startsWith('#') && fabricColor.length >= 7) {
      const hexColor = fabricColor.replace('#', '');
      r = parseInt(hexColor.substr(0, 2), 16) || 240;
      g = parseInt(hexColor.substr(2, 2), 16) || 240;
      b = parseInt(hexColor.substr(4, 2), 16) || 240;
    }
    
    const roughness = Math.max(0, Math.min(1, 
      fabricProps.fabricRoughness || fabricSettings.fabricRoughness || 0.3
    ));
    
    const surfaceTexture = fabricProps.surfaceTexture || 'smooth';
    
    for (let i = 0; i < data.length; i += 4) {
      let noise = 240;
      
      // Apply texture based on fabric type and surface texture
      switch (fabricType) {
        case 'ceramic':
          noise = 250 + Math.random() * 5 * roughness;
          break;
        case 'metal':
          noise = 235 + Math.random() * 20 * roughness;
          break;
        case 'cotton':
          noise = 235 + Math.random() * 15 * roughness;
          break;
        case 'polyester':
          noise = 245 + Math.random() * 8 * roughness;
          break;
        case 'canvas':
          noise = 220 + Math.random() * 30 * roughness;
          break;
        case 'leather':
          noise = 210 + Math.random() * 40 * roughness;
          break;
        default:
          noise = 240 + Math.random() * 12 * roughness;
      }
      
      // Apply surface texture modifications
      if (surfaceTexture === 'glossy' && (fabricType === 'ceramic' || fabricType === 'metal')) {
        noise += Math.random() * 10 - 5; // More variation for glossy surfaces
      } else if (surfaceTexture === 'rough') {
        noise += Math.random() * 20 - 10; // More texture variation
      } else if (surfaceTexture === 'matte') {
        noise = Math.max(200, Math.min(250, noise + Math.random() * 10 - 5));
      }
      
      const factor = (noise - 240) / 255;
      data[i] = Math.max(0, Math.min(255, r + factor * 15));
      data[i + 1] = Math.max(0, Math.min(255, g + factor * 15));
      data[i + 2] = Math.max(0, Math.min(255, b + factor * 15));
      data[i + 3] = 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
  } catch (error) {
    console.error('Error creating dynamic fabric texture:', error);
    ctx.fillStyle = fabricColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  return canvas;
}

/**
 * Create dynamic wrinkle pattern based on PayloadCMS properties
 */
function createDynamicWrinklePattern(
  width: number,
  height: number,
  fabricType: string,
  fabricProps: any,
  fabricSettings: any
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  
  const ctx = canvas.getContext('2d')!;
  
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Don't apply wrinkles to hard surfaces
    if (fabricType === 'ceramic' || fabricType === 'metal') {
      return canvas;
    }
    
    const intensity = Math.max(0, Math.min(1, 
      fabricProps.fabricRoughness || fabricSettings.fabricRoughness || 0.3
    ));
    
    const stretchability = fabricProps.stretchability || 0.1;
    const wrinkleCount = Math.floor(3 + stretchability * 5); // More stretchy = more wrinkles
    
    for (let i = 0; i < wrinkleCount; i++) {
      ctx.save();
      
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * canvas.height;
      const endX = Math.random() * canvas.width;
      const endY = Math.random() * canvas.height;
      
      const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, `rgba(0,0,0,${intensity * 0.1})`);
      gradient.addColorStop(0.5, `rgba(255,255,255,${intensity * 0.15})`);
      gradient.addColorStop(1, `rgba(0,0,0,${intensity * 0.08})`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = Math.max(1, intensity * 8 * (1 + stretchability));
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      const midX = (startX + endX) / 2 + (Math.random() - 0.5) * canvas.width * 0.2;
      const midY = (startY + endY) / 2 + (Math.random() - 0.5) * canvas.height * 0.2;
      
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();
      
      ctx.restore();
    }
    
  } catch (error) {
    console.error('Error creating dynamic wrinkle pattern:', error);
  }
  
  return canvas;
}

/**
 * Apply advanced masking based on PayloadCMS configuration
 */
async function applyAdvancedMasking(
  ctx: CanvasRenderingContext2D,
  visibleArea: any,
  canvas: HTMLCanvasElement,
  fabricProps: any
) {
  if (!visibleArea.maskingConfiguration?.enableMasking && visibleArea.visibility === 'full') {
    return;
  }
  
  console.log(`🎭 Applying advanced ${visibleArea.visibility} masking`);
  
  try {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    
    const gradientSettings = visibleArea.gradientMaskSettings || {};
    const visibilityPercentage = visibleArea.visibilityPercentage || 100;
    const maskType = visibleArea.maskingConfiguration?.maskTypes || 'gradient';
    
    let gradient;
    
    // Enhanced masking based on mask type
    switch (maskType) {
      case 'fold':
        // Fabric fold masking
        gradient = createFoldMask(ctx, canvas, fabricProps);
        break;
      case 'sharp':
        // Sharp edge masking
        gradient = createSharpEdgeMask(ctx, canvas, visibleArea);
        break;
      case 'soft':
        // Soft edge masking
        gradient = createSoftEdgeMask(ctx, canvas, visibleArea);
        break;
      default:
        // Standard gradient masking
        gradient = createGradientMask(ctx, canvas, gradientSettings, visibilityPercentage, visibleArea.visibility);
    }
    
    if (gradient) {
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.restore();
    console.log(`✅ Advanced masking applied: ${visibleArea.visibility} (${maskType})`);
  } catch (error) {
    console.error('Error applying advanced masking:', error);
    ctx.restore();
  }
}

/**
 * Create gradient mask based on PayloadCMS settings
 */
function createGradientMask(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  gradientSettings: any,
  visibilityPercentage: number,
  visibility: string
): CanvasGradient {
  let gradient;
  
  switch (gradientSettings.grdn|| 'horizontal') {
    case 'vertical':
      gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      break;
    case 'radial':
      gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      break;
    case 'angle':
      const angle = (gradientSettings.gradientAngle || 0) * Math.PI / 180;
      const x1 = canvas.width / 2 - Math.cos(angle) * canvas.width / 2;
      const y1 = canvas.height / 2 - Math.sin(angle) * canvas.height / 2;
      const x2 = canvas.width / 2 + Math.cos(angle) * canvas.width / 2;
      const y2 = canvas.height / 2 + Math.sin(angle) * canvas.height / 2;
      gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      break;
    default: // horizontal
      gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  }
  
  if (visibility === 'edge') {
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  } else if (visibility === 'partial') {
    const visiblePercent = Math.max(0.1, Math.min(1, visibilityPercentage / 100));
    const fadeStart = gradientSettings.fadeStart || 0.7;
    const fadeEnd = gradientSettings.fadeEnd || 1.0;
    
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(fadeStart * visiblePercent, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(fadeEnd, 'rgba(255, 255, 255, 0)');
  } else if (visibility === 'sleeve') {
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
  }
  
  return gradient;
}

/**
 * Create fold mask for fabric fold effects
 */
function createFoldMask(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  fabricProps: any
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  
  // Fold masks vary based on fabric type
  if (fabricProps.stretchability > 0.3) {
    // More stretchy fabrics have softer folds
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.7)');
  } else {
    // Stiffer fabrics have sharper folds
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
  }
  
  return gradient;
}

/**
 * Create sharp edge mask
 */
function createSharpEdgeMask(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  visibleArea: any
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  
  const visibilityPercent = Math.max(0.1, Math.min(1, (visibleArea.visibilityPercentage || 100) / 100));
  
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(visibilityPercent * 0.9, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(visibilityPercent, 'rgba(255, 255, 255, 0)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  return gradient;
}

/**
 * Create soft edge mask
 */
function createSoftEdgeMask(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  visibleArea: any
): CanvasGradient {
  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.7
  );
  
  const visibilityPercent = Math.max(0.1, Math.min(1, (visibleArea.visibilityPercentage || 100) / 100));
  
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(visibilityPercent * 0.7, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(visibilityPercent, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  return gradient;
}

/**
 * Apply dynamic lighting based on PayloadCMS
 */
async function applyDynamicLighting(
  ctx: CanvasRenderingContext2D,
  lightingProps: any,
  canvas: HTMLCanvasElement
) {
  try {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = Math.max(0.1, Math.min(0.3, lightingProps.lightIntensity * 0.2));
    
    const lightDirection = (lightingProps.lightDirection || 45) * Math.PI / 180;
    const ambientLight = lightingProps.ambientLight || 0.3;
    
    // Create lighting gradient based on direction
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const lightX = centerX + Math.cos(lightDirection) * canvas.width * 0.3;
    const lightY = centerY + Math.sin(lightDirection) * canvas.height * 0.3;
    
    const gradient = ctx.createRadialGradient(
      lightX, lightY, 0,
      centerX, centerY, Math.max(canvas.width, canvas.height) * 0.8
    );
    
    gradient.addColorStop(0, `rgba(255, 255, 255, ${ambientLight})`);
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${lightingProps.shadowIntensity * 0.3})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.restore();
    console.log(`✅ Dynamic lighting applied`);
  } catch (error) {
    console.error('Error applying dynamic lighting:', error);
    ctx.restore();
  }
}

/**
 * Apply dynamic placement with PayloadCMS coordinates
 */
async function applyDynamicPlacement(
  ctx: CanvasRenderingContext2D,
  wrappedCanvas: HTMLCanvasElement,
  visibleArea: any,
  displayDimensions: { width: number; height: number },
  surfaceProps: any,
  fabricSettings: any,
  validateCanvas: (canvas: HTMLCanvasElement, context: string) => boolean
) {
  const placement = visibleArea.designPlacement;
  if (!placement) {
    console.error('❌ No design placement data found in visible area:', visibleArea);
    return;
  }

  console.log(`📍 Dynamic placement for ${visibleArea.areaName}:`, placement);
  console.log(`🔧 Surface props for placement:`, surfaceProps);

  try {
    validateCanvas(wrappedCanvas, 'wrapped canvas for placement');

    // Calculate placement area using PayloadCMS coordinates
    let placementArea = {
      x: placement.coordinateX * displayDimensions.width,
      y: placement.coordinateY * displayDimensions.height,
      width: placement.coordinateWidth * displayDimensions.width,
      height: placement.coordinateHeight * displayDimensions.height
    };
    
    // Apply surface-specific adjustments
    if (surfaceProps.renderType === 'cylindrical') {
      // Cylindrical surfaces may need width adjustment
      placementArea.width *= (surfaceProps.designRatio?.widthRatio || 1.0);
      placementArea.height *= (surfaceProps.designRatio?.heightRatio || 1.0);
    }
    
    // Ensure placement area is within bounds
    placementArea.x = Math.max(0, Math.min(placementArea.x, displayDimensions.width - placementArea.width));
    placementArea.y = Math.max(0, Math.min(placementArea.y, displayDimensions.height - placementArea.height));
    placementArea.width = Math.max(10, Math.min(placementArea.width, displayDimensions.width - placementArea.x));
    placementArea.height = Math.max(10, Math.min(placementArea.height, displayDimensions.height - placementArea.y));

    console.log(`📐 Final dynamic placement area:`, placementArea);

    ctx.save();

    const centerX = placementArea.x + placementArea.width / 2;
    const centerY = placementArea.y + placementArea.height / 2;

    ctx.translate(centerX, centerY);
    
    if (placement.rotation) {
      const rotation = Math.max(-360, Math.min(360, placement.rotation)) * Math.PI / 180;
      ctx.rotate(rotation);
    }

    if (placement.skewX || placement.skewY) {
      const skewX = Math.max(-45, Math.min(45, placement.skewX || 0)) * Math.PI / 180;
      const skewY = Math.max(-45, Math.min(45, placement.skewY || 0)) * Math.PI / 180;
      ctx.transform(1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0);
    }

    const scaleX = Math.max(0.1, Math.min(5, placement.scaleX || 1));
    const scaleY = Math.max(0.1, Math.min(5, placement.scaleY || 1));
    ctx.scale(scaleX, scaleY);

    // Use dynamic blend mode from PayloadCMS
    const blendMode = getDynamicBlendMode(placement.blendMode || surfaceProps.blendMode);
    let opacity = Math.max(0, Math.min(1, 
      placement.opacity !== null ? placement.opacity : (surfaceProps.opacity || 1)
    ));
    
    // Apply surface-specific opacity adjustments
    if (surfaceProps.renderType === 'cylindrical' && fabricSettings.enableRealisticFabric) {
      opacity *= 0.95; // Slight opacity reduction for cylindrical surfaces
    }
    
    ctx.globalCompositeOperation = blendMode;
    ctx.globalAlpha = opacity;

    const drawX = -placementArea.width / 2;
    const drawY = -placementArea.height / 2;
    const drawWidth = placementArea.width;
    const drawHeight = placementArea.height;

    // Draw the final design with dynamic configuration
    ctx.drawImage(
      wrappedCanvas,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    );

    console.log(`✅ Dynamic placement completed for ${visibleArea.areaName}`);

    ctx.restore();

  } catch (error) {
    console.error('❌ Error in dynamic placement:', error);
    ctx.restore();
  }
}

/**
 * Apply final professional enhancements with PayloadCMS lighting
 */
async function applyFinalEnhancements(
  ctx: CanvasRenderingContext2D,
  displayDimensions: { width: number; height: number },
  mockup: PayloadCMSMockupData,
  surfaceProps: any,
  lightingProps: any
) {
  console.log(`✨ Applying final enhancements with PayloadCMS lighting`);

  try {
    // Apply surface-specific final effects
    if (surfaceProps.renderType === 'cylindrical') {
      // Add cylindrical reflection
      const gradient = ctx.createRadialGradient(
        displayDimensions.width * 0.3,
        displayDimensions.height * 0.3,
        0,
        displayDimensions.width * 0.7,
        displayDimensions.height * 0.7,
        Math.max(displayDimensions.width, displayDimensions.height) * 0.8
      );

      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.02)');

      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, displayDimensions.width, displayDimensions.height);
      ctx.restore();
    }
    
    // Apply ambient lighting from PayloadCMS
    if (lightingProps.ambientLight > 0.2) {
      const ambientGradient = ctx.createRadialGradient(
        displayDimensions.width / 2,
        displayDimensions.height / 2,
        0,
        displayDimensions.width / 2,
        displayDimensions.height / 2,
        Math.max(displayDimensions.width, displayDimensions.height) * 0.9
      );

      ambientGradient.addColorStop(0, `rgba(255, 255, 255, ${lightingProps.ambientLight * 0.1})`);
      ambientGradient.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
      ambientGradient.addColorStop(1, `rgba(0, 0, 0, ${lightingProps.shadowIntensity * 0.05})`);

      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = ambientGradient;
      ctx.fillRect(0, 0, displayDimensions.width, displayDimensions.height);
      ctx.restore();
    }
    
    console.log(`✅ Final enhancements applied for ${surfaceProps.renderType} surface`);
  } catch (error) {
    console.error('Error applying final enhancements:', error);
  }
}

/**
 * Get dynamic blend mode from PayloadCMS configuration
 */
function getDynamicBlendMode(mode: string): GlobalCompositeOperation {
  const modes: Record<string, GlobalCompositeOperation> = {
    'normal': 'source-over',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'soft_light': 'soft-light',
    'soft-light': 'soft-light',
    'hard_light': 'hard-light',
    'hard-light': 'hard-light',
    'color_dodge': 'color-dodge',
    'color-dodge': 'color-dodge',
    'color_burn': 'color-burn',
    'color-burn': 'color-burn'
  };
  return modes[mode] || 'source-over';
}

/**
 * Enhanced image loading with progress tracking
 */
function loadImageWithProgress(
  url: string,
  onProgress?: (progress: number) => void
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      onProgress?.(100);
      resolve(img);
    };
    
    img.onerror = (error) => {
      console.error(`❌ Failed to load image: ${url}`, error);
      reject(new Error(`Failed to load image: ${url}`));
    };
    
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress >= 90) {
          clearInterval(interval);
        } else {
          onProgress(progress);
        }
      }, 50);
    }
    
    img.src = url;
  });
}


/**
 * Enhanced URL resolution for PayloadCMS
 */
function resolveImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  const baseUrl = import.meta.env?.VITE_PAYLOAD_BASE_URL || 
                  process.env.VITE_PAYLOAD_BASE_URL;
  
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/api/media/file/${url}`;
}

export default ProfessionalMockupEngine;