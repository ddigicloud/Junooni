import React, { useState, useEffect, useCallback, useMemo } from 'react';
import EnhancedMockupEngine from '../../engines/mockup/MockupEngine';
import type { DynamicMockupPhoto, DesignElement } from '../types';
import { resolveImageUrl, _renderCache, _getCacheKey, _hashDesignElements } from '../utils';
import { renderMockupDirectly } from '../MockupGeneratorClass';

interface ThumbnailPreviewProps {
  mockup: DynamicMockupPhoto;
  designElements: Record<string, DesignElement[]>;
  canvasConfigs: Record<string, any>;
  canvasPrintableAreas: Record<string, any>;
  productColor: string;
  isSelected: boolean;
  onSelect: () => void;
  displayDimensions?: { width: number; height: number };
  isMainPreview?: boolean;
  productData: any;
}

export const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({
  mockup,
  designElements,
  canvasConfigs,
  canvasPrintableAreas,
  productColor,
  isSelected,
  onSelect,
  displayDimensions = { width: 275, height: 275 },
  isMainPreview = false,
  productData,
}) => {
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [renderComplete, setRenderComplete] = useState(false);
  const [forceRender, setForceRender] = useState(false);

  const determineRenderEngine = useCallback((): 'canvas' | 'pixi' | 'auto' => {
    if (mockup.render?.pfEngine === 'canvas') return 'canvas';
    if (mockup.render?.pfEngine === 'pixi') return 'pixi';
    const requiresPixi = !!(
      mockup.dispMaps?.length ||
      mockup.alpMasks?.length ||
      mockup.light?.length ||
      mockup.area?.some(area =>
        area.surfaceWrapSettings?.enableWrap ||
        area.perspectiveSettings?.enablePerspective ||
        area.fbrc?.enableFabricBlend ||
        area.Config?.enableMasking
      ) ||
      mockup.render?.enableAdvancedEffects
    );
    return requiresPixi ? 'pixi' : 'canvas';
  }, [mockup]);

  const renderEngine = determineRenderEngine();
  const shouldUseDirectRender = renderEngine === 'canvas';

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
  }, [onSelect]);

  // Canvas engine: use renderMockupDirectly
  useEffect(() => {
    if (!shouldUseDirectRender) { setIsRendering(false); return; }

    const cacheKey = _getCacheKey(
      mockup.id, mockup.viewAngle || 'front', productColor,
      _hashDesignElements(designElements), displayDimensions.width
    );
    if (_renderCache.has(cacheKey)) {
      setPreviewImage(_renderCache.get(cacheKey)!);
      setIsRendering(false);
      return;
    }

    let isMounted = true;
    const generate = async () => {
      try {
        setIsRendering(true);
        const imageData = await renderMockupDirectly(
          mockup, designElements, canvasConfigs, canvasPrintableAreas, productColor, displayDimensions.width
        );
        if (isMounted) { setPreviewImage(imageData); setIsRendering(false); }
      } catch {
        if (isMounted) { setThumbnailError('Failed to render preview'); setIsRendering(false); }
      }
    };
    generate();
    return () => { isMounted = false; };
  }, [mockup.id, productColor, shouldUseDirectRender, displayDimensions.width]);

  // PIXI engine: component-based rendering
  useEffect(() => {
    if (shouldUseDirectRender) return;
    const timer = setTimeout(() => setForceRender(true), 100);
    return () => clearTimeout(timer);
  }, [shouldUseDirectRender]);

  useEffect(() => {
    if (shouldUseDirectRender) return;
    if (mockup?.photo?.url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setRenderComplete(true);
      img.onerror = () => setThumbnailError('Failed to load base image');
      img.src = resolveImageUrl(mockup.photo.url);
    }
  }, [mockup?.photo?.url, shouldUseDirectRender]);

  const renderContent = useCallback(() => {
    if (!mockup?.photo?.url) {
      return <div className="flex items-center justify-center w-full h-full text-gray-400"><span className="text-xs">No Image</span></div>;
    }

    if (shouldUseDirectRender) {
      if (isRendering) {
        return (
          <div className="flex items-center justify-center w-full h-full">
            <div className="w-6 h-6 mx-auto mb-1 border-b-2 rounded-full border-orange-500 animate-spin" />
          </div>
        );
      }
      if (previewImage) {
        return <img src={previewImage} alt={mockup.title} className="object-contain w-full h-full" />;
      }
      return <div className="flex items-center justify-center w-full h-full text-gray-400"><span className="text-xs">No Preview</span></div>;
    }

    const hasElements = Object.values(designElements).some(els => els.length > 0);
    const requiresColorMasking = mockup.requiresColorMasking === true || mockup.photoColor?.toLowerCase() === '#00000000';
    const maskColor = mockup.maskColor || productColor || '#ffffff';

    if (!hasElements) {
      if (requiresColorMasking) {
        return (
          <div className="relative w-full h-full overflow-hidden">
            <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: maskColor }} />
            <img src={resolveImageUrl(mockup.photo.url)} alt={mockup.title} className="absolute inset-0 object-cover w-full h-full" onError={() => setThumbnailError('Failed')} />
          </div>
        );
      }
      return <img src={resolveImageUrl(mockup.photo.url)} alt={mockup.title} className="object-cover w-full h-full" onError={() => setThumbnailError('Failed')} />;
    }

    if (forceRender || renderComplete) {
      return (
        <EnhancedMockupEngine
          mockup={mockup} showBadges={false} designElements={designElements}
          canvasConfigs={canvasConfigs} canvasPrintableAreas={canvasPrintableAreas}
          displayDimensions={displayDimensions} productType={productData?.productType || 'flat'}
          productColor={productColor} renderEngine="pixi" enablePixiFeatures={true}
          pixelRatio={isMainPreview ? 2 : 1} onRenderComplete={() => {}} onProgress={() => {}}
        />
      );
    }

    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
          <div className="text-center">
            <div className="w-3 h-3 mx-auto mb-1 border-b-2 border-purple-500 rounded-full animate-spin" />
            <div className="text-xs text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    );
  }, [mockup, designElements, shouldUseDirectRender, isRendering, previewImage, forceRender, renderComplete, productColor, displayDimensions, isMainPreview, productData]);

  const engineLabel = useMemo(() => renderEngine === 'pixi' ? 'PIXI' : 'Canvas', [renderEngine]);

  if (thumbnailError) {
    return (
      <button onClick={onSelect} className={`w-full p-2 border rounded-lg touch-manipulation ${isSelected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-white hover:border-white'}`}>
        <div className="relative mb-2 overflow-hidden bg-gray-100 rounded aspect-square">
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            <span className="text-xs">⚠️ Error</span>
          </div>
        </div>
        <p className="text-xs font-medium text-center line-clamp-1">{mockup.title}</p>
        <p className="text-xs text-center text-gray-500">{mockup.viewAngle}</p>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`w-full p-0 sm:p-2 border rounded-lg transition-all relative touch-manipulation ${
        isSelected ? 'border-white bg-white ring-2 ring-white' : 'border-white hover:border-white hover:shadow-sm'
      }`}
    >
      <div className="relative mb-2 overflow-hidden bg-gray-100 rounded aspect-square">
        {renderContent()}
      </div>
      <p className="text-xs font-medium text-center line-clamp-1">{mockup.title}</p>
      <p className="text-xs text-center text-gray-500">{mockup.viewAngle}</p>
      <p className="text-xs text-center text-gray-400">{mockup.photoColor}</p>
      <div className="flex items-center justify-center mt-1 space-x-1">
        <span className={`text-xs px-1 py-0.5 rounded ${engineLabel === 'PIXI' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
          {engineLabel}
        </span>
        {mockup.dispMaps?.length > 0 && <span className="text-xs" title="Displacement Maps">🎨</span>}
        {mockup.alpMasks?.length > 0 && <span className="text-xs" title="Alpha Masks">🎉</span>}
        {mockup.light?.length > 0 && <span className="text-xs" title="Lighting">💡</span>}
      </div>
    </button>
  );
};