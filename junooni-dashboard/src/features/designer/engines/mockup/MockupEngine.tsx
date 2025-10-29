// src/components/Designer/engines/MockupEngine.tsx - Updated Integration
import React, { useState, useCallback } from 'react';
import ProfessionalMockupEngine from './ProfessionalMockupEngine';
import DynamicMockupEngine from './DynamicMockupEngine';


interface DynamicMockupPhoto {
  id: string;
  title: string;
  photo: {
    id: number;
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  viewAngle: string;
  mockupType: string;
  photoColor: string;
  priority: number;
  
  // Optional PayloadCMS fields
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
  
  render?: {
    pfEngine: 'auto' | 'canvas' | 'pixi';
    enableAdvancedEffects: boolean;
    quality: 'draft' | 'standard' | 'high' | 'ultra';
    exportRes: number;
    enableProgTrack: boolean;
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
    fbrc?: {
      enableFabricBlend: boolean;
      bfab: string;
      foldAwareness: boolean;
      seamAwareness: boolean;
      textureIntensity: number;
      fabricColor: string;
      fabricRoughness: number;
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
    Config?: {
      enableMasking: boolean;
      mask: string;
    };
    grdnmsk?: {
      grdn: string;
      gradientAngle: number;
      fadeStart: number;
      fadeEnd: number;
      fadeIntensity: number;
    };
  }>;
  
  fbrcProp?: {
    mfab: string;
    fabricWeight: number;
    Texture: string;
    stretchability: number;
    transparency: number;
  };
  
  lightingConditions?: {
    lightDirection: number;
    lightIntensity: number;
    ambientLight: number;
    shadowIntensity: number;
  };
}

// FIXED: Missing SurfaceConfiguration interface
interface SurfaceConfiguration {
  renderType: 'flat' | 'cylindrical' | 'conical' | 'spherical' | 'complex_3d';
  productCategory?: 'mug' | 'apparel' | 'bottle' | 'flat' | string;
  
  surfProp?: {
    wrapAngle: number;
    curveInten: number;
    designRatio: { 
      widthRatio: number; 
      heightRatio: number; 
    };
  };
  
  blendSet?: {
    defaultBlendMode: string;
    defaultOpacity: number;
    preserveColors: boolean;
  };
  
  renderingPrefs?: {
    pfEngine: 'auto' | 'canvas' | 'pixi';
    enableAdvancedEffects: boolean;
    enableDynamicFeatures: boolean;
    stabilityMode: boolean;
  };
  
  // MUG-specific properties
  mugSpecific?: {
    enableCylindricalProjection: boolean;
    handleWrapCorrection: boolean;
    perspectiveCorrection: number;
    curvatureIntensity: number;
  };
}


interface EnhancedMockupEngineProps {
  mockup: DynamicMockupPhoto;   
  designElements: Record<string, any[]>;
  canvasConfigs: Record<string, any>;
  canvasPrintableAreas: Record<string, any>;
  displayDimensions: { width: number; height: number };
  productType: string;
  showBadges?: boolean;
  productColor: string;
  fabricSettings?: {
    enableRealisticFabric: boolean;
    dynamicVisibility: boolean;
    adaptiveBlending: boolean;
  };
  surfaceConfiguration?: SurfaceConfiguration;
  // New props for engine selection
  renderEngine?: 'canvas' | 'pixi' | 'auto';
  enablePixiFeatures?: boolean;
  onRenderComplete?: (imageData: string) => void;
}

/**
 * Enhanced Mockup Engine Wrapper - Supports Both Canvas and Pixi.js Engines
 * 
 * This wrapper automatically selects the best rendering engine based on:
 * - Product complexity (displacement needed, advanced masking, etc.)
 * - Performance requirements
 * - Feature availability
 * 
 * Features:
 * ✅ Automatic engine selection (Canvas vs Pixi.js)
 * ✅ Feature detection from PayloadCMS
 * ✅ Fallback support for compatibility
 * ✅ Progress tracking and error handling
 */
const EnhancedMockupEngine: React.FC<EnhancedMockupEngineProps> = ({
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
  renderEngine = 'auto',
   showBadges = true,
  enablePixiFeatures = true,
  onRenderComplete
}) => {
  const [selectedEngine, setSelectedEngine] = useState<'canvas' | 'pixi'>('canvas');
  const [engineError, setEngineError] = useState<string | null>(null);
  const [isPixiSupported, setIsPixiSupported] = useState(true);

  // 🆕 NEW: Check if mockup requires color masking
  const requiresColorMasking = React.useMemo(() => {
    return mockup.photoColor?.toLowerCase() === '#00000000';
  }, [mockup.photoColor]);

  // 🆕 NEW: Get the color for masking
  const maskColor = React.useMemo(() => {
    return productColor || '#ffffff';
  }, [productColor]);

  // 🆕 NEW: Log color masking info
  React.useEffect(() => {
    if (requiresColorMasking) {
      console.log('🎨 MockupEngine: Transparent mockup detected - applying color masking');
      console.log('   Mockup color:', mockup.photoColor);
      console.log('   Mask color:', maskColor);
      console.log('   Design elements:', designElements);
    }
  }, [requiresColorMasking, maskColor, mockup.photoColor, designElements]);

  // Determine optimal rendering engine with enhanced error detection
  const determineOptimalEngine = useCallback(() => {
    if (renderEngine !== 'auto') {
      return renderEngine;
    }

    // Check browser compatibility first
    if (!isPixiSupported) {
      return 'canvas';
    }

    // Check if Pixi.js features are needed
    const needsPixiFeatures = mockup.area.some(area => 
      area.surfaceWrapSettings?.enableWrap ||
      area.perspectiveSettings?.enablePerspective ||
      (area.Config?.enableMasking && area.Config.mask !== 'gradient') ||
      area.fbrc?.enableFabricBlend
    );

    // Check for PayloadCMS Pixi.js assets
    const hasPixiAssets = !!(mockup as any).dispMaps?.length || 
                         !!(mockup as any).alpMasks?.length || 
                         !!(mockup as any).light?.length;

    // Check surface complexity
    const surfaceType = surfaceConfiguration?.renderType || 'flat';
    const isComplexSurface = ['cylindrical', 'conical', 'spherical', 'complex_3d'].includes(surfaceType);

    // Check for advanced lighting
    const hasAdvancedLighting = mockup.lightingConditions && 
      (mockup.lightingConditions.lightIntensity > 0.5 || mockup.lightingConditions.shadowIntensity > 0.3);

    // Use Pixi.js if advanced features are needed and supported
    if (enablePixiFeatures && (needsPixiFeatures || hasPixiAssets || isComplexSurface || hasAdvancedLighting)) {
      return 'pixi';
    }

    // Fallback to Canvas for simpler mockups or if Pixi.js isn't needed
    return 'canvas';
  }, [mockup, surfaceConfiguration, renderEngine, enablePixiFeatures, isPixiSupported]);

  // Initialize engine selection
  React.useEffect(() => {
    const optimalEngine = determineOptimalEngine();
    setSelectedEngine(optimalEngine);
  }, [determineOptimalEngine]);

  // Handle Pixi.js errors and fallback with enhanced error reporting
  const handlePixiError = useCallback((error: any) => {
    let errorType = 'Unknown error';
    if (error.message?.includes('WebGL')) {
      errorType = 'WebGL compatibility issue';
    } else if (error.message?.includes('load') || error.message?.includes('texture')) {
      errorType = 'Image loading failure';
    } else if (error.message?.includes('filter')) {
      errorType = 'Filter/effect error';
    }
    
    setEngineError(`Pixi.js error (${errorType}): ${error.message || 'Unknown error'}`);
    setIsPixiSupported(false);
    setSelectedEngine('canvas');
  }, []);

  // Render progress handler
  const handleProgress = useCallback((progress: number) => {
    //console.log(`Rendering progress: ${progress}%`);
  }, []);

  // Enhanced render complete handler
  const handleRenderComplete = useCallback((imageData: string) => {
    onRenderComplete?.(imageData);
  }, [selectedEngine, onRenderComplete]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 🆕 LAYER 0: Base color layer for transparent mockups */}
      {requiresColorMasking && (
        <div 
          className="absolute inset-0 w-full h-full"
          style={{ 
            backgroundColor: maskColor,
            zIndex: 0
          }}
        />
      )}

      {/* LAYER 1: Mockup engine with design elements */}
      <div className="relative w-full h-full" style={{ zIndex: 1 }}>
        {/* Render with selected engine */}
        {selectedEngine === 'pixi' ? (
          <ErrorBoundary onError={handlePixiError}>
            <DynamicMockupEngine
              mockup={mockup}
              designElements={designElements}
              canvasConfigs={canvasConfigs}
              canvasPrintableAreas={canvasPrintableAreas}
              displayDimensions={displayDimensions}
              productType={productType}
              productColor={productColor}
              fabricSettings={fabricSettings}
              surfaceConfiguration={surfaceConfiguration}
              onRenderComplete={handleRenderComplete}
              onProgress={handleProgress}
            />
          </ErrorBoundary>
        ) : (
          <ProfessionalMockupEngine
            mockup={mockup}
            designElements={designElements}
            canvasConfigs={canvasConfigs}
            canvasPrintableAreas={canvasPrintableAreas}
            displayDimensions={displayDimensions}
            productType={productType}
            productColor={productColor}
            fabricSettings={fabricSettings}
            surfaceConfiguration={surfaceConfiguration}
            onRenderComplete={handleRenderComplete}
            onProgress={handleProgress}
          />
        )}
      </div>
    </div>
  );
};

// Error boundary for Pixi.js fallback
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: any) => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Will trigger fallback to Canvas engine
    }

    return this.props.children;
  }
}

// =====================================
// FEATURE DETECTION UTILITIES
// =====================================

/**
 * Detect if mockup requires advanced Pixi.js features using actual PayloadCMS field names
 */
export function requiresPixiFeatures(mockup: DynamicMockupPhoto): boolean {
  return mockup.area.some(area => 
    // Surface wrapping/displacement
    area.surfaceWrapSettings?.enableWrap ||
    // Advanced perspective
    area.perspectiveSettings?.enablePerspective ||
    // Complex masking
    (area.Config?.enableMasking && area.Config.mask !== 'gradient') ||
    // Fabric integration
    area.fbrc?.enableFabricBlend ||
    // Complex visibility patterns
    area.visibility === 'edge' || area.visibility === 'sleeve'
  ) || 
  // Check for PayloadCMS Pixi.js assets
  !!(mockup as any).dispMaps?.length || 
  !!(mockup as any).alpMasks?.length || 
  !!(mockup as any).light?.length ||
  // Check rendering preferences
  (mockup as any).render?.pfEngine === 'pixi';
}

/**
 * Check browser Pixi.js support
 */
export function checkPixiSupport(): boolean {
  try {
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      //console.warn('WebGL not supported, Pixi.js features limited');
      return false;
    }

    // Check for required extensions
    const requiredExtensions = [
      'WEBGL_depth_texture',
      'OES_texture_float'
    ];

    for (const ext of requiredExtensions) {
      if (!gl.getExtension(ext)) {
        //console.warn(`WebGL extension ${ext} not supported`);
        return false;
      }
    }

    return true;
  } catch (error) {
    //console.error('Error checking Pixi.js support:', error);
    return false;
  }
}

/**
 * Performance-based engine recommendation
 */
export function getEngineRecommendation(
  mockup: DynamicMockupPhoto,
  displayDimensions: { width: number; height: number }
): 'canvas' | 'pixi' {
  const pixelCount = displayDimensions.width * displayDimensions.height;
  const elementCount = Object.values(mockup.area).flat().length;
  const hasComplexFeatures = requiresPixiFeatures(mockup);

  // High resolution with complex features = Pixi.js
  if (pixelCount > 500000 && hasComplexFeatures) {
    return 'pixi';
  }

  // Many elements = Pixi.js for better performance
  if (elementCount > 10) {
    return 'pixi';
  }

  // Simple mockups = Canvas for compatibility
  if (!hasComplexFeatures && elementCount < 5) {
    return 'canvas';
  }

  return 'pixi'; // Default to Pixi.js for better quality
}

export default EnhancedMockupEngine;


