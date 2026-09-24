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
import { isAOPMockup } from './mockup-engine-utils';

// ── Standalone canvas render (no React, no state) ────────────────────────────

export const renderMockupDirectly = async (
  mockup: DynamicMockupPhoto,
  designElements: Record<string, DesignElement[]>,
  canvasConfigs: Record<string, any>,
  printableAreas: Record<string, any>,
  productColor: string,
  targetResolution = 3000
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
      // ─── QUALITY: Supersample at 2× then downsample ──────────────────────
      const SUPERSAMPLE = 2;
      const renderRes   = targetResolution * SUPERSAMPLE;

      const offscreen   = document.createElement('canvas');
      offscreen.width   = renderRes;
      offscreen.height  = renderRes;
      const ctx = offscreen.getContext('2d', { alpha: true });
      if (!ctx) throw new Error('Failed to get 2D context');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // ─── Step 1: Load base mockup photo ──────────────────────────────────
      const requiresColorMasking =
        mockup.requiresColorMasking === true ||
        mockup.photoColor?.toLowerCase() === '#00000000';
      const maskColor = mockup.maskColor || productColor || '#ffffff';

      const mockupBaseImg = await _loadImageCached(resolveImageUrl(mockup.photo.url));

      // ─── AOP PATH ────────────────────────────────────────────────────────
      // AOP products are identified by "AOP" in the product name
      // photoColor #00000000 alone is not enough — embroidery mockups also use it
      const isAOPProduct = /aop/i.test(mockup.title || '') || /aop/i.test(mockup.mockupType || '');
      if (isAOPProduct && mockup.photoColor?.toLowerCase().replace('#', '').trim() === '00000000') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, renderRes, renderRes);

        for (const [areaName, elements] of Object.entries(designElements)) {
          const canvasConfig = canvasConfigs[areaName];
          if (!canvasConfig) continue;
          const visibleEls = (elements as DesignElement[])
            .filter(el => el.visible !== false && el.type === 'image')
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
          for (const el of visibleEls) {
            if (!el.image) continue;
            const scaleX = renderRes / canvasConfig.width;
            const scaleY = renderRes / canvasConfig.height;
            const dW = el.width * (el.scaleX || 1) * scaleX;
            const dH = el.height * (el.scaleY || 1) * scaleY;
            const cX = (el.x + el.width * (el.scaleX || 1) / 2) * scaleX;
            const cY = (el.y + el.height * (el.scaleY || 1) / 2) * scaleY;
            ctx.save();
            ctx.translate(cX, cY);
            if (el.rotation) ctx.rotate((el.rotation * Math.PI) / 180);
            ctx.globalAlpha = el.opacity || 1;
            ctx.drawImage(el.image as HTMLImageElement, -dW / 2, -dH / 2, dW, dH);
            ctx.restore();
          }
        }

                ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(mockupBaseImg, 0, 0, renderRes, renderRes);
        ctx.globalCompositeOperation = 'source-over';

        // ─── Lighting overlays for AOP/transparent mockups ────────────────
        for (const lightOverlay of mockup.light || []) {
          try {
            const lightImg = await _loadImageCached(resolveImageUrl(lightOverlay.overImage.url));
            const overlayArea = lightOverlay.overlayArea?.toLowerCase()?.trim();

            ctx.globalAlpha = lightOverlay.ovlayOpa || 0.5;
            ctx.globalCompositeOperation = (lightOverlay.overbldMde as GlobalCompositeOperation) || 'normal';

            if (overlayArea && overlayArea !== 'full' && overlayArea !== 'all') {
              // Find design elements bounding box for this area
              const areaElements = Object.entries(designElements)
                .find(([key]) => key.toLowerCase() === overlayArea)?.[1] || [];
              const canvasCfg = Object.entries(canvasConfigs)
                .find(([key]) => key.toLowerCase() === overlayArea)?.[1];

              if (canvasCfg && areaElements.length > 0) {
                const scale = renderRes / canvasCfg.width;
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                (areaElements as DesignElement[]).forEach(el => {
                  if (el.visible === false) return;
                  const dW = el.width * (el.scaleX || 1);
                  const dH = el.height * (el.scaleY || 1);
                  minX = Math.min(minX, el.x);
                  minY = Math.min(minY, el.y);
                  maxX = Math.max(maxX, el.x + dW);
                  maxY = Math.max(maxY, el.y + dH);
                });

              if (minX !== Infinity) {
                // Draw texture only over non-transparent design pixels
                const texCanvas = document.createElement('canvas');
                texCanvas.width = renderRes;
                texCanvas.height = renderRes;
                const texCtx = texCanvas.getContext('2d', { alpha: true })!;
                texCtx.imageSmoothingEnabled = true;
                texCtx.imageSmoothingQuality = 'high';

                // Draw texture clipped to bounding box
                texCtx.save();
                texCtx.beginPath();
                texCtx.rect(minX * scale, minY * scale, (maxX - minX) * scale, (maxY - minY) * scale);
                texCtx.clip();
                texCtx.drawImage(lightImg, 0, 0, renderRes, renderRes);
                texCtx.restore();

                // Mask texture to only show over design pixels (non-transparent)
                texCtx.globalCompositeOperation = 'destination-in';
                texCtx.drawImage(offscreen, 0, 0);
                texCtx.globalCompositeOperation = 'source-over';

                // Composite masked texture onto main canvas
                ctx.save();
                ctx.drawImage(texCanvas, 0, 0);
                ctx.restore();
                } else {
                  ctx.drawImage(lightImg, 0, 0, renderRes, renderRes);
                }
              } else {
                ctx.drawImage(lightImg, 0, 0, renderRes, renderRes);
              }
            } else {
              ctx.drawImage(lightImg, 0, 0, renderRes, renderRes);
            }

            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
          } catch { /* skip failed overlay */ }
        }

        const out = document.createElement('canvas');
        out.width = targetResolution;
        out.height = targetResolution;
        const oCtx = out.getContext('2d', { alpha: true })!;
        oCtx.imageSmoothingEnabled = true;
        oCtx.imageSmoothingQuality = 'high';
        oCtx.drawImage(offscreen, 0, 0, targetResolution, targetResolution);
        const dataUrl = out.toDataURL('image/png');
        _renderCache.set(cacheKey, dataUrl);
        resolve(dataUrl);
        return;
      }
      // ─── END AOP PATH ────────────────────────────────────────────────────

      // ─── Normal path: draw base photo (with optional colour masking) ──────
      if (requiresColorMasking) {
        ctx.fillStyle = productColor || '#ffffff';
        ctx.fillRect(0, 0, renderRes, renderRes);
        ctx.drawImage(mockupBaseImg, 0, 0, renderRes, renderRes);
      } else {
        ctx.drawImage(mockupBaseImg, 0, 0, renderRes, renderRes);
      }

      // ─── Step 2: Composite design elements for each mockup area ──────────
      for (const mockupArea of mockup.area || []) {
        const areaName = mockupArea.areaName.toLowerCase();
        const elements = designElements[areaName] || [];
        const visibleElements = elements
          .filter(el => el.visible !== false && el.type === 'image')
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

        if (visibleElements.length === 0) continue;

        const canvasConfig  = canvasConfigs[areaName];
        const printableArea = printableAreas[areaName];
        if (!canvasConfig || !printableArea) continue;

        const design = mockupArea.design;

        const mockupAreaX     = design.coordinateX      * renderRes;
        const mockupAreaY     = design.coordinateY      * renderRes;
        const mockupAreaWidth = design.coordinateWidth  * renderRes;

        const uniformScale          = mockupAreaWidth / printableArea.width;
        const effectiveMockupHeight = printableArea.height * uniformScale;

        let nativeWidth  = Math.round(mockupAreaWidth);
        let nativeHeight = Math.round(effectiveMockupHeight);

        for (const element of visibleElements) {
          if (!element.image) continue;
          const src = element.image as HTMLImageElement;
          if (!src.naturalWidth || src.naturalWidth === 0) continue;

          const renderedWidth  = element.width  * (element.scaleX || 1);
          const renderedHeight = element.height * (element.scaleY || 1);
          const elemPixelW = renderedWidth  * uniformScale;
          const elemPixelH = renderedHeight * uniformScale;
          const srcToOutputRatio = src.naturalWidth / elemPixelW;

          if (srcToOutputRatio > 1) {
            const nW = Math.min(8192, Math.round(nativeWidth  * srcToOutputRatio));
            const nH = Math.min(8192, Math.round(nativeHeight * srcToOutputRatio));
            nativeWidth  = Math.max(nativeWidth,  nW);
            nativeHeight = Math.max(nativeHeight, nH);
          }
        }

        nativeWidth  = Math.min(8192, nativeWidth);
        nativeHeight = Math.min(8192, nativeHeight);

        const designCanvas   = document.createElement('canvas');
        designCanvas.width   = nativeWidth;
        designCanvas.height  = nativeHeight;
        const dCtx = designCanvas.getContext('2d', { alpha: true });
        if (!dCtx) continue;

        dCtx.imageSmoothingEnabled = true;
        dCtx.imageSmoothingQuality = 'high';
        dCtx.clearRect(0, 0, nativeWidth, nativeHeight);

        const toNativeX = nativeWidth  / printableArea.width;
        const toNativeY = nativeHeight / printableArea.height;

        for (const element of visibleElements) {
          if (!element.image) continue;
          dCtx.save();

          const src = element.image as HTMLImageElement;

          const elemLeftInPrintable = element.x - printableArea.x;
          const elemTopInPrintable  = element.y - printableArea.y;
          const renderedWidth       = element.width  * (element.scaleX || 1);
          const renderedHeight      = element.height * (element.scaleY || 1);

          const elemLeftInDesign   = elemLeftInPrintable * toNativeX;
          const elemTopInDesign    = elemTopInPrintable  * toNativeY;
          const elemWidthInDesign  = renderedWidth       * toNativeX;
          const elemHeightInDesign = renderedHeight      * toNativeY;

          const centerX = elemLeftInDesign + elemWidthInDesign  / 2;
          const centerY = elemTopInDesign  + elemHeightInDesign / 2;

          dCtx.translate(centerX, centerY);
          if (element.rotation) dCtx.rotate((element.rotation * Math.PI) / 180);
          dCtx.globalAlpha = element.opacity || 1;

          if (src.naturalWidth && src.naturalWidth > 0) {
            dCtx.drawImage(src, -elemWidthInDesign / 2, -elemHeightInDesign / 2, elemWidthInDesign, elemHeightInDesign);
          } else {
            dCtx.drawImage(element.image, -elemWidthInDesign / 2, -elemHeightInDesign / 2, elemWidthInDesign, elemHeightInDesign);
          }

          dCtx.restore();
        }

        const maskedDesignCanvas   = document.createElement('canvas');
        maskedDesignCanvas.width   = renderRes;
        maskedDesignCanvas.height  = renderRes;
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

          const areaMasks = (mockup.alpMasks || []).filter(
            m => !m.alfarea || m.alfarea.toLowerCase() === areaName || m.alfarea === 'all'
          );

          for (const alphaMask of areaMasks) {
            try {
              const maskImg = await _loadImageCached(resolveImageUrl(alphaMask.maskImg.url));

              if (alphaMask.alfamask === 'luminance' || alphaMask.alfamask === 'red_channel') {
                const tmpCanvas   = document.createElement('canvas');
                tmpCanvas.width   = renderRes;
                tmpCanvas.height  = renderRes;
                const tmpCtx = tmpCanvas.getContext('2d')!;
                tmpCtx.imageSmoothingEnabled = true;
                tmpCtx.imageSmoothingQuality = 'high';
                tmpCtx.drawImage(maskImg, 0, 0, renderRes, renderRes);
                const imgData = tmpCtx.getImageData(0, 0, renderRes, renderRes);
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
                mCtx.drawImage(tmpCanvas, 0, 0, renderRes, renderRes);
                mCtx.globalCompositeOperation = 'source-over';
              } else {
                mCtx.globalCompositeOperation = 'destination-in';
                mCtx.drawImage(maskImg, 0, 0, renderRes, renderRes);
                mCtx.globalCompositeOperation = 'source-over';
              }
              mCtx.globalCompositeOperation = 'source-over';
            } catch { /* skip failed mask */ }
          }
        }

        const areaBlendMode = (design.blend && design.blend !== 'normal')
          ? design.blend as GlobalCompositeOperation
          : null;
        const areaOpacity = design.opacity != null && design.opacity !== 1
          ? design.opacity
          : null;

        ctx.save();
        ctx.globalCompositeOperation = areaBlendMode ?? 'source-over';
        ctx.globalAlpha = areaOpacity ?? 1.0;
        ctx.drawImage(maskedDesignCanvas, 0, 0);
        ctx.restore();
      }

           // ─── Step 3: Lighting / shadow overlays ──────────────────────────────
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      for (const lightOverlay of mockup.light || []) {
        try {
          const lightImg = await _loadImageCached(resolveImageUrl(lightOverlay.overImage.url));
          const overlayArea = lightOverlay.overlayArea?.toLowerCase()?.trim();

          if (overlayArea && overlayArea !== 'full' && overlayArea !== 'all') {
            const targetMockupArea = mockup.area?.find((a: any) =>
              a.areaName?.toLowerCase()?.trim() === overlayArea
            );
            const areaElements = Object.entries(designElements)
              .find(([key]) => key.toLowerCase() === overlayArea)?.[1] || [];
            const canvasCfg = Object.entries(canvasConfigs)
              .find(([key]) => key.toLowerCase() === overlayArea)?.[1];
            const printArea = Object.entries(printableAreas)
              .find(([key]) => key.toLowerCase() === overlayArea)?.[1];

            if (targetMockupArea && canvasCfg && areaElements.length > 0 && printArea) {
              const mAX = targetMockupArea.design.coordinateX * renderRes;
              const mAY = targetMockupArea.design.coordinateY * renderRes;
              const mAW = targetMockupArea.design.coordinateWidth * renderRes;
              const uniformScale = mAW / printArea.width;

              // Step 1: Render design elements onto isolated transparent canvas
              // using exact same coordinate system as Step 2 normal render
              const designMaskCanvas = document.createElement('canvas');
              designMaskCanvas.width = renderRes;
              designMaskCanvas.height = renderRes;
              const dmCtx = designMaskCanvas.getContext('2d', { alpha: true })!;
              dmCtx.imageSmoothingEnabled = true;
              dmCtx.imageSmoothingQuality = 'high';

              (areaElements as DesignElement[]).forEach(el => {
                if (el.visible === false || !el.image) return;
                const elemLeft = (el.x - printArea.x) * uniformScale + mAX;
                const elemTop  = (el.y - printArea.y) * uniformScale + mAY;
                const dW = el.width  * (el.scaleX || 1) * uniformScale;
                const dH = el.height * (el.scaleY || 1) * uniformScale;
                const cX = elemLeft + dW / 2;
                const cY = elemTop  + dH / 2;
                dmCtx.save();
                dmCtx.translate(cX, cY);
                if (el.rotation) dmCtx.rotate((el.rotation * Math.PI) / 180);
                dmCtx.globalAlpha = el.opacity || 1;
                dmCtx.drawImage(el.image as HTMLImageElement, -dW / 2, -dH / 2, dW, dH);
                dmCtx.restore();
              });

              // Step 2: Draw texture on isolated canvas at full size
              const texCanvas = document.createElement('canvas');
              texCanvas.width = renderRes;
              texCanvas.height = renderRes;
              const texCtx = texCanvas.getContext('2d', { alpha: true })!;
              texCtx.imageSmoothingEnabled = true;
              texCtx.imageSmoothingQuality = 'high';
              const mAH = targetMockupArea.design.coordinateHeight * renderRes;
              texCtx.drawImage(lightImg, mAX, mAY, mAW, mAH);

              // Step 3: Use design mask — destination-in keeps texture
              // only where design has non-transparent pixels
              texCtx.globalCompositeOperation = 'destination-in';
              texCtx.drawImage(designMaskCanvas, 0, 0);
              texCtx.globalCompositeOperation = 'source-over';

              // Step 4: Composite onto main canvas
              ctx.save();
              ctx.globalAlpha = lightOverlay.ovlayOpa || 0.7;
              ctx.globalCompositeOperation = (lightOverlay.overbldMde as GlobalCompositeOperation) || 'multiply';
              ctx.drawImage(texCanvas, 0, 0);
              ctx.restore();
            } else if (areaElements.length === 0) {
              // No design elements in this area — skip overlay entirely
              // This prevents thread texture showing when no design is uploaded
            } else {
              ctx.save();
              ctx.globalAlpha = lightOverlay.ovlayOpa || 0.5;
              ctx.globalCompositeOperation = (lightOverlay.overbldMde as GlobalCompositeOperation) || 'normal';
              ctx.drawImage(lightImg, 0, 0, renderRes, renderRes);
              ctx.restore();
            }
          } else {
            ctx.save();
            ctx.globalAlpha = lightOverlay.ovlayOpa || 0.5;
            ctx.globalCompositeOperation = (lightOverlay.overbldMde as GlobalCompositeOperation) || 'normal';
            ctx.drawImage(lightImg, 0, 0, renderRes, renderRes);
            ctx.restore();
          }

          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';
        } catch { /* skip failed overlay */ }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      // ─── Final step: Downsample ───────────────────────────────────────────
      let finalDataUrl: string;

      if (SUPERSAMPLE > 1) {
        const outputCanvas   = document.createElement('canvas');
        outputCanvas.width   = targetResolution;
        outputCanvas.height  = targetResolution;
        const oCtx = outputCanvas.getContext('2d', { alpha: true })!;
        oCtx.imageSmoothingEnabled = true;
        oCtx.imageSmoothingQuality = 'high';
        oCtx.drawImage(offscreen, 0, 0, targetResolution, targetResolution);
        finalDataUrl = outputCanvas.toDataURL('image/png');
      } else {
        finalDataUrl = offscreen.toDataURL('image/png');
      }

      _renderCache.set(cacheKey, finalDataUrl);
      resolve(finalDataUrl);

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
    // AOP mockups always use canvas (transparent overlay, design fills behind)
    if (isAOPMockup(mockup)) return 'canvas_professional';

    // Respect explicit engine override from PayloadCMS
    if (mockup.render?.pfEngine === 'canvas') return 'canvas_professional';
    if (mockup.render?.pfEngine === 'pixi')   return 'pixi_dynamic';

    // Product type check for apparel
    const productType = this.productData?.productType?.toLowerCase() || '';
    const isApparel = ['shirt','tee','apparel','hoodie','tank','clothing','tote','bag','accessories'].some(t => productType.includes(t));
    if (isApparel) return 'canvas_professional';

    // Complex features check
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

    // AOP and canvas-engine mockups: use renderMockupDirectly (handles AOP path internally)
    if (isStoreImport && selectedEngine === 'canvas_professional') {
      try {
        return await renderMockupDirectly(mockup, designElements, canvasConfigs, printableAreas, productColor, targetResolution);
      } catch {
        return await this.captureWithPixiContainer(mockup, designElements, canvasConfigs, printableAreas, productColor, productData, targetResolution);
      }
    }

    if (selectedEngine === 'canvas_professional') {
      try {
        return await renderMockupDirectly(mockup, designElements, canvasConfigs, printableAreas, productColor, targetResolution);
      } catch {
        return await this.captureWithCanvasSimplified(mockup, designElements, canvasConfigs, printableAreas, productColor, productData, targetResolution, isStoreImport);
      }
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
              const result = await this.generateSingleMockup(mockup, designElements, canvasConfigs, printableAreas, smartColor, productData, 3000, true);
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