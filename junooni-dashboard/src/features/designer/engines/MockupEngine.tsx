// src/components/Designer/engines/MockupEngine.tsx
import React from 'react';
import BalancedMockupEngine from './OptimizedMockupEngine';

interface DynamicVisibleArea {
  areaName: string;
  visibility: 'full' | 'partial' | 'edge';
  visibilityPercentage?: number;
  fabricIntegration?: {
    enableFabricBlend: boolean;
    fabricType: string;
    foldAwareness: boolean;
    seamAwareness: boolean;
    textureIntensity: number;
    fabricColor: string;
    fabricRoughness: number;
  };
  desgnPlacment: {
    coord: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    transforms: {
      rotation: number;
      skewX: number;
      skewY: number;
      scaleX: number;
      scaleY: number;
    };
    renderSettings: {
      blendMode: string;
      opacity: number;
      preserveColors: boolean;
    };
    surfSpecs: {
      wrapSettng: {
        enableWrap: boolean;
        wrapAngle: number;
        wrapIntensity: number;
        dynamicWrap?: boolean;
        wrapFalloff?: number;
      };
      perspCorrection: {
        enablePersp: boolean;
        perspIntensity: number;
        dynamicPerspective?: boolean;
      };
      fabricEffects?: {
        enableFolds: boolean;
        foldIntensity: number;
        foldDirection: 'horizontal' | 'vertical' | 'radial';
        seamDistortion: boolean;
        fabricDepth: number;
      };
    };
  };
}

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
  fabricProperties?: {
    fabricType: string;
    fabricWeight: number;
    surfaceTexture: string;
    stretchability: number;
    transparency: number;
  };
  lightingConditions?: {
    lightDirection: number;
    lightIntensity: number;
    ambientLight: number;
    shadowIntensity: number;
  };
  visibleAreas: DynamicVisibleArea[];
  priority: number;
  tags?: { tag: string }[];
}

interface EnhancedMockupEngineProps {
  mockup: DynamicMockupPhoto;
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
 * Professional Mockup Engine - Balanced Quality + Performance
 * 
 * QUALITY PRIORITIES:
 * ✅ Maximum quality for PNG transparency (perfect logos/graphics)
 * ✅ High-resolution image smoothing for crisp designs
 * ✅ Accurate print representation (no unrealistic patterns)
 * ✅ Professional shadows and lighting that match real products
 * ✅ Clean areas when no design is placed (product authenticity)
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * ⚡ Smart canvas context settings for better speed
 * ⚡ Efficient image loading with retry logic
 * ⚡ Minimal texture processing (only where it improves quality)
 * ⚡ Optimized transform calculations
 * ⚡ Performance timing for monitoring
 * 
 * RESULT: Professional print-ready mockups with good performance
 */
export const EnhancedMockupEngine: React.FC<EnhancedMockupEngineProps> = (props) => {
  console.log('🏆 Professional MockupEngine - Quality priority with performance optimization');
  
  try {
    return (
      <div className="relative">
        <BalancedMockupEngine {...props} />
        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <span>🏆</span>
          <span>PROFESSIONAL</span>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Professional engine error:', error);
    
    // Safe fallback with quality preservation
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-orange-500 text-xl mb-2">🔧</div>
          <p className="text-sm text-gray-600">Loading Professional Mockup...</p>
          <p className="text-xs text-gray-400 mt-1">Optimizing for quality</p>
        </div>
      </div>
    );
  }
};

export default EnhancedMockupEngine;