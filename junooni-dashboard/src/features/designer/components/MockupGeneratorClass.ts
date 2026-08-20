// ============================================================
// MockupGeneratorClass.ts
// Contains:
//   1. renderMockupDirectly()  — pure canvas render function
//   2. EnhancedMockupGenerator — class for store import generation
//
// Place at: designer/components/MockupGeneratorClass.ts
// ============================================================

import React from 'react';
import EnhancedMockupEngine from '../engines/mockup/MockupEngine';
import type {
  DynamicMockupPhoto,
  DesignElement,
  StoreImportData,
  ImageGenerationProgress,
  MockupCalculationResult,
} from './types';
import {
  resolveImageUrl,
  _renderCache,
  _loadImageCached,
  _getCacheKey,
  _hashDesignElements,
} from './utils';

// ── Standalone canvas render (no React, no state) ────────────────────────────

export const renderMockupDirectly = async (
  mockup: DynamicMockupPhoto,
  designElements: Record<string, DesignElement[]>,
  canvasConfigs: Record<string, any>,
  printableAreas: Record<string, any>,
  productColor: string,
  targetResolution = 1000
): Promise<string> => {

  const cacheKey = _getCacheKey(
    mockup.id,
    mockup.viewAngle || 'front',
    productColor,
    _hashDesignElements(designElements),
    targetResolution
  );
  if (_renderCache.has(cacheKey)) return _renderCache.get(cacheKey)!;

  return new Promise(async (resolve, reject) => {
    try {
      const offscreen = document.createElement('canvas');
      offscreen.width = targetResolution;
      offscreen.height = targetResolution;
      const ctx = offscreen.getContext('2d', { alpha: true });
      if (!ctx) throw new Error('Failed to get 2D context');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Step 1: Draw base mockup photo (with optional colour masking)
      const requiresColorMasking =
        mockup.requiresColorMasking === true ||
        mockup.photoColor?.toLowerCase() === '#00000000';
      const maskColor = mockup.maskColor || productColor || '#ffffff';

      const mockupBaseImg = await _loadImageCached(resolveImageUrl(mockup.photo.url));

      if (requiresColorMasking) {
        ctx.fillStyle = maskColor;
        ctx.fillRect(0, 0, targetResolution, targetResolution);
        ctx.drawImage(mockupBaseImg, 0, 0, targetResolution, targetResolution);
      } else {
        ctx.drawImage(mockupBaseImg, 0, 0, targetResolution, targetResolution);
      }

      // Step 2: Composite design elements for each mockup area
      for (const mockupArea of mockup.area || []) {
        const areaName = mockupArea.areaName.toLowerCase();
        const elements = designElements[areaName] || [];
        const visibleElements = elements
          .filter(el => el.visible !== false && el.type === 'image')
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

        if (visibleElements.length === 0) continue;

        const canvasConfig = canvasConfigs[areaName];
        const printableArea = printableAreas[areaName];
        if (!canvasConfig || !printableArea) continue;

        const design = mockupArea.design;
        const mockupAreaX     = design.coordinateX      * targetResolution;
        const mockupAreaY     = design.coordinateY      * targetResolution;
        const mockupAreaWidth = design.coordinateWidth  * targetResolution;

        const uniformScale          = mockupAreaWidth / printableArea.width;
        const effectiveMockupHeight = printableArea.height * uniformScale;

        // 2a: Render design elements onto isolated transparent canvas
        const designCanvas = document.createElement('canvas');
        designCanvas.width  = Math.round(mockupAreaWidth);
        designCanvas.height = Math.round(effectiveMockupHeight);
        const dCtx = designCanvas.getContext('2d', { alpha: true });
        if (!dCtx) continue;

        dCtx.imageSmoothingEnabled = true;
        dCtx.imageSmoothingQuality = 'high';
        dCtx.clearRect(0, 0, designCanvas.width, designCanvas.height);

        for (const element of visibleElements) {
          if (!element.image) continue;
          dCtx.save();

          const elemLeftInPrintable = element.x - printableArea.x;
          const elemTopInPrintable  = element.y - printableArea.y;
          const renderedWidth       = element.width  * (element.scaleX || 1);
          const renderedHeight      = element.height * (element.scaleY || 1);
          const elemLeftInDesign    = elemLeftInPrintable * uniformScale;
          const elemTopInDesign     = elemTopInPrintable  * uniformScale;
          const elemWidthInDesign   = renderedWidth  * uniformScale;
          const elemHeightInDesign  = renderedHeight * uniformScale;
          const centerX             = elemLeftInDesign + elemWidthInDesign / 2;
          const centerY             = elemTopInDesign  + elemHeightInDesign / 2;

          dCtx.translate(centerX, centerY);
          if (element.rotation) dCtx.rotate((element.rotation * Math.PI) / 180);
          dCtx.globalAlpha = element.opacity || 1;
          dCtx.drawImage(
            element.image,
            -elemWidthInDesign / 2, -elemHeightInDesign / 2,
            elemWidthInDesign, elemHeightInDesign
          );
          dCtx.restore();
        }

        // 2b: Apply area transforms + alpha masks
        const maskedDesignCanvas = document.createElement('canvas');
        maskedDesignCanvas.width  = targetResolution;
        maskedDesignCanvas.height = targetResolution;
        const mCtx = maskedDesignCanvas.getContext('2d', { alpha: true });

        if (mCtx) {
          mCtx.imageSmoothingEnabled = true;
          mCtx.imageSmoothingQuality = 'high';

          const areaRotation = design.rotation || 0;
          const areaSkewX    = design.skewX    || 0;
          const areaSkewY    = design.skewY    || 0;
          const areaScaleX   = design.scaleX   || 1;
          const areaScaleY   = design.scaleY   || 1;
          const areaCentreX  = mockupAreaX + mockupAreaWidth       / 2;
          const areaCentreY  = mockupAreaY + effectiveMockupHeight / 2;

          const hasTransform = areaRotation !== 0 || areaSkewX !== 0 || areaSkewY !== 0
                            || areaScaleX  !== 1  || areaScaleY !== 1;

          if (hasTransform) {
            mCtx.save();
            mCtx.translate(areaCentreX, areaCentreY);
            if (areaRotation) mCtx.rotate((areaRotation * Math.PI) / 180);
            if (areaScaleX !== 1 || areaScaleY !== 1) mCtx.scale(areaScaleX, areaScaleY);
            if (areaSkewX || areaSkewY) {
              mCtx.transform(
                1, Math.tan((areaSkewY * Math.PI) / 180),
                Math.tan((areaSkewX * Math.PI) / 180), 1,
                0, 0
              );
            }
            mCtx.translate(-areaCentreX, -areaCentreY);
            mCtx.drawImage(designCanvas, mockupAreaX, mockupAreaY, mockupAreaWidth, effectiveMockupHeight);
            mCtx.restore();
          } else {
            mCtx.drawImage(designCanvas, mockupAreaX, mockupAreaY, mockupAreaWidth, effectiveMockupHeight);
          }

          // Alpha masks — clip design to garment silhouette
          const areaMasks = (mockup.alpMasks || []).filter(
            m => !m.alfarea || m.alfarea.toLowerCase() === areaName || m.alfarea === 'all'
          );

          for (const alphaMask of areaMasks) {
            try {
              const maskImg = await _loadImageCached(resolveImageUrl(alphaMask.maskImg.url));

              if (alphaMask.alfamask === 'luminance' || alphaMask.alfamask === 'red_channel') {
                const tmpCanvas = document.createElement('canvas');
                tmpCanvas.width = targetResolution;
                tmpCanvas.height = targetResolution;
                const tmpCtx = tmpCanvas.getContext('2d')!;
                tmpCtx.drawImage(maskImg, 0, 0, targetResolution, targetResolution);
                const imgData = tmpCtx.getImageData(0, 0, targetResolution, targetResolution);
                const d = imgData.data;
                for (let i = 0; i < d.length; i += 4) {
                  const val = alphaMask.alfamask === 'red_channel'
                    ? d[i]
                    : Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
                  d[i] = d[i + 1] = d[i + 2] = 0;
                  d[i + 3] = val;
                }
                tmpCtx.putImageData(imgData, 0, 0);
                mCtx.globalCompositeOperation = 'destination-in';
                mCtx.drawImage(tmpCanvas, 0, 0, targetResolution, targetResolution);
              } else {
                mCtx.globalCompositeOperation = 'destination-in';
                mCtx.drawImage(maskImg, 0, 0, targetResolution, targetResolution);
              }
              mCtx.globalCompositeOperation = 'source-over';
            } catch { /* skip failed mask */ }
          }
        }

        // 2c: Blend onto mockup (two-pass default: preserve colours + subtle shadow depth)
        const areaBlendMode = (design.blend && design.blend !== 'normal')
          ? design.blend as GlobalCompositeOperation
          : null;
        const areaOpacity = design.opacity != null && design.opacity !== 1
          ? design.opacity
          : null;

        ctx.save();
        if (areaBlendMode) {
          ctx.globalCompositeOperation = areaBlendMode;
          ctx.globalAlpha = areaOpacity ?? 0.92;
          ctx.drawImage(maskedDesignCanvas, 0, 0);
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = areaOpacity ?? 0.92;
          ctx.drawImage(maskedDesignCanvas, 0, 0);

          ctx.globalCompositeOperation = 'multiply';
          ctx.globalAlpha = 0.12;
          ctx.drawImage(maskedDesignCanvas, 0, 0);
        }
        ctx.restore();
      }

      // Step 3: Lighting / shadow overlays
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      for (const lightOverlay of mockup.light || []) {
        try {
          const lightImg = await _loadImageCached(resolveImageUrl(lightOverlay.overImage.url));
          ctx.globalAlpha = lightOverlay.ovlayOpa || 0.5;
          ctx.globalCompositeOperation = (lightOverlay.overbldMde as GlobalCompositeOperation) || 'normal';
          ctx.drawImage(lightImg, 0, 0, targetResolution, targetResolution);
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';
        } catch { /* skip failed overlay */ }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      // Output WebP directly — avoids a second compression pass later
      const supportsWebP = offscreen.toDataURL('image/webp').startsWith('data:image/webp');
      const imageData = supportsWebP
        ? offscreen.toDataURL('image/webp', 0.75)
        : offscreen.toDataURL('image/jpeg', 0.80);

      _renderCache.set(cacheKey, imageData);
      resolve(imageData);

    } catch (error) {
      reject(error);
    }
  });
};

// ── EnhancedMockupGenerator class ─────────────────────────────────────────────

export class EnhancedMockupGenerator {
  private isGenerating = false;
  private generationQueue = new Map<string, Promise<string | null>>();
  private renderCache    = new Map<string, string>();
  private productData: any = null;

  public setProductData(data: any) {
    this.productData = data;
  }

  public isGenerationInProgress(): boolean { return this.isGenerating; }
  public clearRenderCache(): void { this.renderCache.clear(); }

  // ── Engine selector ──────────────────────────────────────────────────────
  private determineEngine(mockup: DynamicMockupPhoto): 'canvas_professional' | 'pixi_dynamic' {
    const productType = this.productData?.productType?.toLowerCase() || '';
    const isApparel = ['shirt','tee','apparel','hoodie','tank','clothing'].some(t => productType.includes(t));
    if (isApparel) return 'canvas_professional';

    const hasComplexFeatures = !!(
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

    return hasComplexFeatures ? 'pixi_dynamic' : 'canvas_professional';
  }

  // ── Canvas engine via hidden DOM container ───────────────────────────────
  private captureWithCanvasSimplified = async (
    mockup: DynamicMockupPhoto,
    designElements: Record<string, DesignElement[]>,
    canvasConfigs: Record<string, any>,
    printableAreas: Record<string, any>,
    productColor: string,
    productData: any,
    targetResolution: number,
    isStoreImport = false
  ): Promise<string> => {

    return new Promise((resolve, reject) => {
      let renderCompleted = false;

      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed; top: -99999px; left: -99999px;
        width: ${targetResolution}px; height: ${targetResolution}px;
        background: white; z-index: -1; opacity: 0;
        pointer-events: none; visibility: hidden;
      `;
      document.body.appendChild(container);

      const cleanup = () => {
        setTimeout(() => {
          if (document.body.contains(container)) document.body.removeChild(container);
        }, 100);
      };

      const timeoutDuration = isStoreImport ? 90000 : 30000;
      const renderTimeout = setTimeout(() => {
        if (renderCompleted) return;
        renderCompleted = true;
        cleanup();
        reject(new Error(`Canvas timeout after ${timeoutDuration / 1000}s`));
      }, timeoutDuration);

      import('react-dom/client').then(async ({ createRoot }) => {
        try {
          const root = createRoot(container);

          const mockupComponent = React.createElement(EnhancedMockupEngine, {
            mockup,
            designElements,
            canvasConfigs,
            canvasPrintableAreas: printableAreas,
            displayDimensions: { width: targetResolution, height: targetResolution },
            productType: productData?.productType || 'apparel',
            productColor,
            renderEngine: 'canvas',
            enablePixiFeatures: false,
            pixelRatio: isStoreImport ? 2 : 1,
            showBadges: false,
            onRenderComplete: (imageData: string) => {
              if (renderCompleted) return;
              renderCompleted = true;
              clearTimeout(renderTimeout);
              cleanup();
              if (imageData?.length > 0) resolve(imageData);
              else reject(new Error('No image data received'));
            },
            onProgress: () => {},
            onError: (error: any) => {
              if (renderCompleted) return;
              renderCompleted = true;
              clearTimeout(renderTimeout);
              cleanup();
              reject(new Error(`Canvas error: ${error?.message || error}`));
            },
          });

          root.render(mockupComponent);
        } catch (err: any) {
          if (!renderCompleted) {
            renderCompleted = true;
            clearTimeout(renderTimeout);
            cleanup();
            reject(new Error(`Render error: ${err.message}`));
          }
        }
      }).catch((importError: any) => {
        if (!renderCompleted) {
          renderCompleted = true;
          clearTimeout(renderTimeout);
          cleanup();
          reject(new Error(`Import failed: ${importError.message}`));
        }
      });
    });
  };

  // ── PIXI engine ──────────────────────────────────────────────────────────
  private captureWithPixiContainer = async (
    mockup: DynamicMockupPhoto,
    designElements: Record<string, DesignElement[]>,
    canvasConfigs: Record<string, any>,
    printableAreas: Record<string, any>,
    productColor: string,
    productData: any,
    targetResolution: number
  ): Promise<string> => {

    return new Promise((resolve, reject) => {
      let renderCompleted = false;

      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed; top: -9999px; left: -9999px;
        width: 500px; height: 500px; background: white;
        z-index: -1; opacity: 0; pointer-events: none;
        visibility: hidden; overflow: hidden;
      `;
      document.body.appendChild(container);

      const renderTimeout = setTimeout(() => {
        if (renderCompleted) return;
        renderCompleted = true;
        if (document.body.contains(container)) document.body.removeChild(container);
        reject(new Error('PIXI timeout (20s)'));
      }, 20000);

      import('react-dom/client').then(async ({ createRoot }) => {
        const root = createRoot(container);

        root.render(React.createElement(EnhancedMockupEngine, {
          mockup,
          designElements,
          canvasConfigs,
          canvasPrintableAreas: printableAreas,
          displayDimensions: { width: targetResolution, height: targetResolution },
          productType: productData?.productType || 'drinkware',
          productColor,
          renderEngine: 'pixi',
          enablePixiFeatures: true,
          onRenderComplete: async (imageData: string) => {
            if (renderCompleted) return;
            renderCompleted = true;
            clearTimeout(renderTimeout);
            setTimeout(() => {
              try { root.unmount(); if (document.body.contains(container)) document.body.removeChild(container); } catch {}
            }, 200);
            resolve(imageData);
          },
          onProgress: () => {},
        }));
      }).catch((error: any) => {
        if (!renderCompleted) {
          renderCompleted = true;
          clearTimeout(renderTimeout);
          if (document.body.contains(container)) document.body.removeChild(container);
          reject(error);
        }
      });
    });
  };

  // ── Preview capture (chooses engine) ────────────────────────────────────
  private capturePreviewRender = async (
    mockup: DynamicMockupPhoto,
    designElements: Record<string, DesignElement[]>,
    canvasConfigs: Record<string, any>,
    printableAreas: Record<string, any>,
    productColor: string,
    productData: any,
    targetResolution: number,
    isStoreImport = false
  ): Promise<string> => {

    const selectedEngine = this.determineEngine(mockup);

    if (isStoreImport && selectedEngine === 'canvas_professional') {
      try {
        return await renderMockupDirectly(mockup, designElements, canvasConfigs, printableAreas, productColor, targetResolution);
      } catch {
        return await this.captureWithPixiContainer(mockup, designElements, canvasConfigs, printableAreas, productColor, productData, targetResolution);
      }
    }

    if (selectedEngine === 'canvas_professional') {
      return await this.captureWithCanvasSimplified(mockup, designElements, canvasConfigs, printableAreas, productColor, productData, targetResolution, isStoreImport);
    }

    return await this.captureWithPixiContainer(mockup, designElements, canvasConfigs, printableAreas, productColor, productData, targetResolution);
  };

  // ── Public: generate a single mockup ────────────────────────────────────
  public generateSingleMockup = async (
    mockup: DynamicMockupPhoto,
    designElements: Record<string, DesignElement[]>,
    canvasConfigs: Record<string, any>,
    printableAreas: Record<string, any>,
    productColor: string,
    productData: any,
    targetResolution = 1000,
    isStoreImport = false
  ): Promise<{ imageData: string; engine: 'canvas_professional' | 'pixi_dynamic'; metrics: any }> => {

    const startTime = performance.now();
    const engine    = this.determineEngine(mockup);

    const cacheKey = `${mockup.id}-${mockup.viewAngle || 'front'}-${productColor}-${Object.keys(designElements).length}-${targetResolution}-${isStoreImport ? 'store' : 'preview'}`;

    if (this.renderCache.has(cacheKey)) {
      const cached = this.renderCache.get(cacheKey)!;
      return { imageData: cached, engine, metrics: { render_time_ms: 0, image_size_kb: Math.round((cached.length * 3) / 4 / 1024), compression_ratio: 2.0, cached: true } };
    }

    const imageData = await this.capturePreviewRender(mockup, designElements, canvasConfigs, printableAreas, productColor, productData, targetResolution, isStoreImport);

    const renderTime = performance.now() - startTime;
    this.renderCache.set(cacheKey, imageData);

    return {
      imageData,
      engine,
      metrics: {
        render_time_ms: Math.round(renderTime),
        image_size_kb: Math.round((imageData.length * 3) / 4 / 1024),
        compression_ratio: 2.0,
        cached: false,
      },
    };
  };

  // ── Public: generate full store import batch ─────────────────────────────
  public generateForStoreImport = async (
    productData: any,
    selectedColors: Array<{ name: string; value: string }>,
    selectedSizes: string[],
    designElements: Record<string, DesignElement[]>,
    canvasConfigs: Record<string, any>,
    printableAreas: Record<string, any>,
    mockupCalculation: MockupCalculationResult,
    onProgress?: (progress: ImageGenerationProgress) => void
  ): Promise<StoreImportData> => {

    if (this.isGenerating) throw new Error('Generation already in progress');
    this.isGenerating = true;

    const generationStarted = new Date().toISOString();
    const generationStart   = performance.now();

    const totalCombinations = mockupCalculation.totalMockups;
    let completedCombinations = 0;
    const errors: string[] = [];
    const engineUsage = { canvas_professional: 0, pixi_dynamic: 0 };
    const mockupVariants: StoreImportData['mockup_variants'] = [];

    try {
      for (const colorBreakdown of mockupCalculation.calculationBreakdown) {
        const sizesToProcess = productData.size_Images ? selectedSizes : [null];

        for (const size of sizesToProcess) {
          const mockupsToProcess = productData.size_Images
            ? colorBreakdown.mockups.filter((m: any) => (m as any).photoSize === size)
            : colorBreakdown.mockups;

          for (const mockup of mockupsToProcess) {
            const smartColor = colorBreakdown.colorHex;
            const determinedEngine = this.determineEngine(mockup);
            const mockupSize = (mockup as any).photoSize;

            const colorCombinations: any[] = [{ color_name: colorBreakdown.color, color_hex: colorBreakdown.colorHex, size_variants: [] }];
            const combinationId = `${mockup.title}-${colorBreakdown.color}${size ? `-${size}` : ''}`;

            onProgress?.({
              total: totalCombinations,
              completed: completedCombinations,
              current_combination: combinationId,
              current_mockup: mockup.title,
              current_engine: determinedEngine,
              errors: [...errors],
            });

            try {
              const result = await this.generateSingleMockup(mockup, designElements, canvasConfigs, printableAreas, smartColor, productData, 1000, true);
              engineUsage[result.engine]++;

              const sizesForVariant = productData.size_Images ? [size!] : selectedSizes;
              sizesForVariant.forEach(sz => {
                colorCombinations[0].size_variants.push({
                  size_name: sz,
                  generated_images: [{
                    engine_used: result.engine,
                    image_data: result.imageData,
                    resolution: 1000,
                    generation_timestamp: new Date().toISOString(),
                    quality_metrics: result.metrics,
                  }],
                });
              });
              completedCombinations++;
            } catch (error: any) {
              errors.push(`Failed: ${combinationId} - ${error.message}`);
              const sizesForVariant = productData.size_Images ? [size!] : selectedSizes;
              sizesForVariant.forEach(sz => {
                colorCombinations[0].size_variants.push({ size_name: sz, generated_images: [] });
              });
            }

            mockupVariants.push({
              mockup_id: mockup.id,
              mockup_title: mockup.title,
              view_angle: mockup.viewAngle || 'front',
              mockup_color: mockup.photoColor,
              mockup_size: mockupSize,
              color_combinations: colorCombinations,
            });

            await new Promise(r => setTimeout(r, 200));
          }
        }
      }
    } catch (criticalError: any) {
      errors.push(`Critical error: ${criticalError.message}`);
    } finally {
      this.isGenerating = false;
      this.generationQueue.clear();
    }

    const totalTimeMs = Math.round(performance.now() - generationStart);
    const totalImagesGenerated = mockupVariants.reduce((t, mv) =>
      t + mv.color_combinations.reduce((ct, cc) =>
        ct + cc.size_variants.reduce((st, sv) => st + sv.generated_images.length, 0), 0), 0);

    return {
      product_id: productData.id || `product-${Date.now()}`,
      product_name: productData.name || 'Unnamed Product',
      product_type: productData.productType || 'custom',
      design_elements: designElements,
      design_configuration: {
        canvas_configs: canvasConfigs,
        printable_areas: printableAreas,
        design_metadata: {
          total_elements: Object.values(designElements).flat().length,
          areas_used: Object.keys(designElements).filter(a => designElements[a].length > 0),
          creation_timestamp: new Date().toISOString(),
          last_modified: new Date().toISOString(),
        },
      },
      mockup_variants: mockupVariants,
      generation_summary: {
        total_combinations: totalCombinations,
        total_images_generated: totalImagesGenerated,
        generation_started: generationStarted,
        generation_completed: new Date().toISOString(),
        total_time_ms: totalTimeMs,
        engine_usage: engineUsage,
        mockup_calculation: mockupCalculation,
        errors,
      },
    };
  };
}