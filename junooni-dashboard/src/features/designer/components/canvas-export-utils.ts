// ============================================================
// canvas-export-utils.ts
// Standalone export utilities used in handleImportToStore.
// These functions are pure (take all needed data as params)
// so they can be called from useStoreImport or Canvas.tsx.
//
// Place at: designer/components/canvas-export-utils.ts
// ============================================================

import Konva from 'konva';
import type { DesignElement, CanvasImageMetadata, PayloadProductData } from './types';
import { cropTransparentPixels } from './utils';

// ── extractDesignImages ───────────────────────────────────────────────────────
// Merges all visible image elements per area into a single axis-aligned
// bounding-box (AABB) "manufacturing film" PNG, clamped to the printable area.

export const extractDesignImages = (
  designElements: Record<string, DesignElement[]>,
  getCanvasConfig: (areaId: string, colorHex?: string) => any,
  getPrintableAreaFromPhoto: (areaId: string, colorHex?: string, sizeId?: string) => any
): any[] => {
  const designImages: any[] = [];

  Object.entries(designElements).forEach(([area, elements]) => {
    if (!Array.isArray(elements)) return;

    const visibleImageElements = elements.filter(el => el.type === 'image' && el.visible !== false && el.image);
    if (visibleImageElements.length === 0) return;

    const canvasConfig  = getCanvasConfig(area);
    const printableArea = getPrintableAreaFromPhoto(area);

    try {
      const sortedElements = [...visibleImageElements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

      // Calculate AABB including rotation
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      sortedElements.forEach(element => {
        const w  = element.width  * (element.scaleX || 1);
        const h  = element.height * (element.scaleY || 1);
        const cx = element.x + w / 2;
        const cy = element.y + h / 2;
        const rotation = element.rotation || 0;

        if (Math.abs(rotation) > 0.1) {
          const rad = (rotation * Math.PI) / 180;
          const cos = Math.cos(rad), sin = Math.sin(rad);
          [{ x: -w/2, y: -h/2 }, { x: w/2, y: -h/2 }, { x: w/2, y: h/2 }, { x: -w/2, y: h/2 }].forEach(c => {
            minX = Math.min(minX, cx + c.x * cos - c.y * sin);
            maxX = Math.max(maxX, cx + c.x * cos - c.y * sin);
            minY = Math.min(minY, cx + c.x * sin + c.y * cos);  // intentional: cx for y keeps symmetry
            maxY = Math.max(maxY, cy + c.x * sin + c.y * cos);
          });
          // Redo correctly
          minX = Infinity; minY = Infinity; maxX = -Infinity; maxY = -Infinity;
          [{ x: -w/2, y: -h/2 }, { x: w/2, y: -h/2 }, { x: w/2, y: h/2 }, { x: -w/2, y: h/2 }].forEach(c => {
            const rx = cx + c.x * cos - c.y * sin;
            const ry = cy + c.x * sin + c.y * cos;
            minX = Math.min(minX, rx); maxX = Math.max(maxX, rx);
            minY = Math.min(minY, ry); maxY = Math.max(maxY, ry);
          });
        } else {
          minX = Math.min(minX, element.x);       maxX = Math.max(maxX, element.x + w);
          minY = Math.min(minY, element.y);       maxY = Math.max(maxY, element.y + h);
        }
      });

      // Clamp to printable area
      const pL = printableArea.x, pR = printableArea.x + printableArea.width;
      const pT = printableArea.y, pB = printableArea.y + printableArea.height;
      const wasCropped = minX < pL || maxX > pR || minY < pT || maxY > pB;
      minX = Math.max(minX, pL); maxX = Math.min(maxX, pR);
      minY = Math.max(minY, pT); maxY = Math.min(maxY, pB);

      if (minX >= maxX || minY >= maxY) return;

      const bwCanvas = maxX - minX;
      const bhCanvas = maxY - minY;

      // Calculate output scale to preserve original pixel density
      let maxRequiredScale = 0;
      sortedElements.forEach(el => {
        const origW = el.originalImageWidth || el.image!.naturalWidth || el.image!.width;
        const origH = el.originalImageHeight || el.image!.naturalHeight || el.image!.height;
        const displayW = el.width  * (el.scaleX || 1);
        const displayH = el.height * (el.scaleY || 1);
        const scaleNeeded = Math.max(origW / displayW, origH / displayH);
        maxRequiredScale = Math.max(maxRequiredScale, scaleNeeded);
      });

      const outputScale  = Math.max(maxRequiredScale, 1);
      const outputWidth  = Math.round(bwCanvas * outputScale);
      const outputHeight = Math.round(bhCanvas * outputScale);

      const mergedCanvas = document.createElement('canvas');
      mergedCanvas.width  = outputWidth;
      mergedCanvas.height = outputHeight;
      const mergedCtx = mergedCanvas.getContext('2d', { alpha: true });
      if (!mergedCtx) return;

      mergedCtx.imageSmoothingEnabled = true;
      mergedCtx.imageSmoothingQuality = 'high';

      sortedElements.forEach(element => {
        if (!element.image) return;
        mergedCtx.save();

        const displayW = element.width  * (element.scaleX || 1);
        const displayH = element.height * (element.scaleY || 1);
        const centerX  = ((element.x + displayW / 2) - minX) * outputScale;
        const centerY  = ((element.y + displayH / 2) - minY) * outputScale;

        mergedCtx.translate(centerX, centerY);
        if (element.rotation) mergedCtx.rotate((element.rotation * Math.PI) / 180);
        mergedCtx.globalAlpha = element.opacity || 1;

        const origW = element.originalImageWidth  || element.image.naturalWidth  || element.image.width;
        const origH = element.originalImageHeight || element.image.naturalHeight || element.image.height;
        mergedCtx.drawImage(element.image, -origW / 2, -origH / 2, origW, origH);
        mergedCtx.restore();
      });

      const mergedBase64 = mergedCanvas.toDataURL('image/png', 1.0);

      const avgPPI = ((printableArea.width / canvasConfig.realWorldWidth) + (printableArea.height / canvasConfig.realWorldHeight)) / 2;
      const widthInches  = bwCanvas / avgPPI;
      const heightInches = bhCanvas / avgPPI;
      const dpi = Math.round((outputWidth / widthInches + outputHeight / heightInches) / 2);
      const quality = dpi >= 300 ? 'Excellent' : dpi >= 150 ? 'Good' : 'Poor';

      designImages.push({
        id: `film-${area}-${Date.now()}`,
        name: `${area}-manufacturing-film${wasCropped ? '-cropped' : ''}.png`,
        type: 'image/png',
        base64Data: mergedBase64,
        originalWidth: outputWidth,
        originalHeight: outputHeight,
        area,
        position: { x: minX, y: minY },
        dimensions: { width: bwCanvas, height: bhCanvas },
        physicalDimensions: {
          widthInches: Number(widthInches.toFixed(3)),
          heightInches: Number(heightInches.toFixed(3)),
          xInches: Number(((minX - printableArea.x) / printableArea.width * canvasConfig.realWorldWidth).toFixed(3)),
          yInches: Number(((minY - printableArea.y) / printableArea.height * canvasConfig.realWorldHeight).toFixed(3)),
        },
        isMerged: true,
        isManufacturingFilm: true,
        wasCropped,
        elementCount: sortedElements.length,
        dpi,
        printQuality: quality,
        outputScale,
        description: `Manufacturing film for ${area.toUpperCase()}. ${sortedElements.length} element(s) merged. ${wasCropped ? 'Cropped to printable area.' : ''} DPI: ${dpi} (${quality}).`,
      });

    } catch (error) {
      console.error(`Failed to create manufacturing film for area ${area}:`, error);
    }
  });

  return designImages;
};

// ── generateCanvasMetadata ────────────────────────────────────────────────────

export const generateCanvasMetadata = (
  areaId: string,
  activeColor: string,
  designElements: Record<string, DesignElement[]>,
  getCanvasConfig: (areaId: string, colorHex?: string) => any,
  getPrintableAreaFromPhoto: (areaId: string, colorHex?: string) => any,
  calculateDPI: (element: DesignElement) => { dpi: number; quality: string }
): CanvasImageMetadata => {
  const canvasConfig  = getCanvasConfig(areaId, activeColor);
  const printableArea = getPrintableAreaFromPhoto(areaId, activeColor);
  const elements      = designElements[areaId] || [];
  const visible       = elements.filter(el => el.visible !== false);

  const designElementsData = visible.map((element, index) => {
    const xInches      = (element.x     / canvasConfig.width)  * canvasConfig.realWorldWidth;
    const yInches      = (element.y     / canvasConfig.height) * canvasConfig.realWorldHeight;
    const widthInches  = (element.width / canvasConfig.width)  * canvasConfig.realWorldWidth;
    const heightInches = (element.height/ canvasConfig.height) * canvasConfig.realWorldHeight;

    const base: any = {
      element_id: element.id,
      element_index: index,
      type: element.type,
      position: { x: Math.round(element.x * 100) / 100, y: Math.round(element.y * 100) / 100, x_inches: Math.round(xInches * 1000) / 1000, y_inches: Math.round(yInches * 1000) / 1000 },
      dimensions: { width_pixels: Math.round(element.width), height_pixels: Math.round(element.height), width_inches: Math.round(widthInches * 1000) / 1000, height_inches: Math.round(heightInches * 1000) / 1000 },
      transformations: { rotation: element.rotation || 0, scale_x: element.scaleX || 1, scale_y: element.scaleY || 1, opacity: element.opacity || 1 },
    };

    if (element.type === 'image') {
      const dpiInfo = calculateDPI(element);
      base.image_info = { original_name: element.imageName || 'Unknown', original_width: element.originalImageWidth || element.width, original_height: element.originalImageHeight || element.height, print_quality: dpiInfo.quality, print_dpi: dpiInfo.dpi };
    } else if (element.type === 'text') {
      base.text_info = { content: element.text || '', font_size: element.fontSize || 20, font_family: element.fontFamily || 'Arial', color: element.fill || '#000000' };
    }

    return base;
  });

  return {
    area_name: areaId,
    canvas_dimensions: { width_pixels: canvasConfig.width, height_pixels: canvasConfig.height, width_inches: canvasConfig.realWorldWidth, height_inches: canvasConfig.realWorldHeight },
    printable_area: { x: Math.round(printableArea.x * 100) / 100, y: Math.round(printableArea.y * 100) / 100, width: Math.round(printableArea.width * 100) / 100, height: Math.round(printableArea.height * 100) / 100 },
    design_elements: designElementsData,
    canvas_settings: { active_color: activeColor, total_elements: elements.length, visible_elements: visible.length },
  };
};

// ── captureCanvasImageForArea ─────────────────────────────────────────────────
// Creates a side-by-side PNG: left = clean manufacturer view, right = annotated.

export const captureCanvasImageForArea = async (
  areaId: string,
  designElements: Record<string, DesignElement[]>,
  activeColor: string,
  canvasImages: Record<string, HTMLImageElement | null>,
  getCanvasConfig: (areaId: string, colorHex?: string) => any,
  getPrintableAreaFromPhoto: (areaId: string, colorHex?: string) => any,
  getCustomizationAreaByName: (areaId: string) => any
): Promise<string | null> => {
  try {
    const elements        = designElements[areaId] || [];
    const visibleElements = elements.filter(el => el.visible !== false);
    if (visibleElements.length === 0) return null;

    const sortedElements = [...visibleElements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    const canvasConfig   = getCanvasConfig(areaId, activeColor);
    const printableArea  = getPrintableAreaFromPhoto(areaId, activeColor);
    const canvasImage    = canvasImages[`${areaId}_${activeColor}`] || canvasImages[areaId];

    const isAOPProduct = (() => {
      try {
        const area = getCustomizationAreaByName(areaId);
        return area?.designCanvasPhotos?.some((p: any) => p?.photoColor?.toLowerCase().includes('-aop')) ?? false;
      } catch { return false; }
    })();

    const buildLayer = (layer: Konva.Layer) => {
      layer.add(new Konva.Rect({ x: 0, y: 0, width: canvasConfig.width, height: canvasConfig.height, fill: 'transparent', listening: false }));

      if (isAOPProduct) {
        layer.add(new Konva.Rect({ x: 0, y: 0, width: canvasConfig.width, height: canvasConfig.height, fill: activeColor, listening: false }));
        const group = new Konva.Group({ clipFunc: ctx => { ctx.beginPath(); ctx.rect(printableArea.x, printableArea.y, printableArea.width, printableArea.height); ctx.closePath(); } });
        layer.add(group);
        sortedElements.forEach(el => addElementToGroup(group, el));
        if (canvasImage) layer.add(new Konva.Image({ image: canvasImage, x: 0, y: 0, width: canvasConfig.width, height: canvasConfig.height, listening: false }));
      } else {
        layer.add(new Konva.Rect({ x: 0, y: 0, width: canvasConfig.width, height: canvasConfig.height, fill: activeColor, listening: false }));
        if (canvasImage) {
          layer.add(new Konva.Image({ image: canvasImage, x: 0, y: 0, width: canvasConfig.width, height: canvasConfig.height, listening: false }));
          layer.add(new Konva.Image({ image: canvasImage, x: 0, y: 0, width: canvasConfig.width, height: canvasConfig.height, opacity: 0.08, globalCompositeOperation: 'multiply', listening: false }));
        }
        const group = new Konva.Group({ clipFunc: ctx => { ctx.beginPath(); ctx.rect(printableArea.x, printableArea.y, printableArea.width, printableArea.height); ctx.closePath(); } });
        layer.add(group);
        sortedElements.forEach(el => addElementToGroup(group, el));
      }
    };

    // Clean panel (left)
    const stageClean  = new Konva.Stage({ container: document.createElement('div'), width: canvasConfig.width, height: canvasConfig.height, pixelRatio: 2 });
    const layerClean  = new Konva.Layer();
    stageClean.add(layerClean);
    buildLayer(layerClean);
    layerClean.add(new Konva.Rect({ x: printableArea.x, y: printableArea.y, width: printableArea.width, height: printableArea.height, stroke: '#e65100', strokeWidth: 2, dash: [6, 4], listening: false }));
    layerClean.draw();
    await new Promise(r => setTimeout(r, 100));
    const cleanDataURL = stageClean.toDataURL({ mimeType: 'image/png', quality: 1.0, pixelRatio: 2 });
    stageClean.destroy();

    // Annotated panel (right) — simplified: same as clean + orange size badge
    const stageAnnotated = new Konva.Stage({ container: document.createElement('div'), width: canvasConfig.width, height: canvasConfig.height, pixelRatio: 2 });
    const layerAnnotated = new Konva.Layer();
    stageAnnotated.add(layerAnnotated);
    buildLayer(layerAnnotated);
    layerAnnotated.add(new Konva.Rect({ x: printableArea.x, y: printableArea.y, width: printableArea.width, height: printableArea.height, stroke: '#FF0000', strokeWidth: 2, dash: [6, 4], listening: false }));

    const avgPPI = ((printableArea.width / canvasConfig.realWorldWidth) + (printableArea.height / canvasConfig.realWorldHeight)) / 2;
    const paWidthInch  = (printableArea.width  / avgPPI).toFixed(2);
    const paHeightInch = (printableArea.height / avgPPI).toFixed(2);
    const sizeLabel    = `${paWidthInch}" × ${paHeightInch}"`;

    layerAnnotated.add(new Konva.Rect({ x: printableArea.x, y: printableArea.y + 4, width: sizeLabel.length * 7 + 14, height: 22, fill: '#e65100', cornerRadius: 3, listening: false }));
    layerAnnotated.add(new Konva.Text({ text: sizeLabel, x: printableArea.x + 7, y: printableArea.y + 11, fontSize: 12, fontFamily: 'Arial', fill: '#ffffff', listening: false }));

    layerAnnotated.draw();
    await new Promise(r => setTimeout(r, 100));
    const annotatedDataURL = stageAnnotated.toDataURL({ mimeType: 'image/png', quality: 1.0, pixelRatio: 2 });
    stageAnnotated.destroy();

    // Composite side-by-side
    const panelW  = canvasConfig.width  * 2;
    const panelH  = canvasConfig.height * 2;
    const DIVIDER = 2;
    const GAP     = 24;
    const HEADER  = 36;
    const TOTAL_W = panelW * 2 + GAP * 2 + DIVIDER;
    const TOTAL_H = panelH + HEADER;

    const offscreen = document.createElement('canvas');
    offscreen.width  = TOTAL_W;
    offscreen.height = TOTAL_H;
    const ctx = offscreen.getContext('2d')!;

    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, TOTAL_W, TOTAL_H);
    ctx.fillStyle = '#222222';
    ctx.fillRect(0, 0, TOTAL_W, HEADER);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(HEADER * 0.48)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('For Manufacturer (Clean)', panelW / 2, HEADER / 2);
    ctx.fillText('Internal Reference (With Dimensions)', panelW + GAP * 2 + DIVIDER + panelW / 2, HEADER / 2);
    ctx.fillStyle = '#888888';
    ctx.fillRect(panelW + GAP, 0, DIVIDER, TOTAL_H);

    const loadImg = (src: string): Promise<HTMLImageElement> =>
      new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

    const [cleanImg, annotatedImg] = await Promise.all([loadImg(cleanDataURL), loadImg(annotatedDataURL)]);
    ctx.drawImage(cleanImg,     0,                           HEADER, panelW, panelH);
    ctx.drawImage(annotatedImg, panelW + GAP * 2 + DIVIDER, HEADER, panelW, panelH);

    return offscreen.toDataURL('image/png');
  } catch (error) {
    console.error(`Error capturing canvas image for ${areaId}:`, error);
    return null;
  }
};

// Helper — add a design element to a Konva group
const addElementToGroup = (group: Konva.Group, element: DesignElement) => {
  if (element.type === 'image' && element.image) {
    group.add(new Konva.Image({
      image: element.image,
      x: element.x + element.width / 2,
      y: element.y + element.height / 2,
      offsetX: element.width / 2,
      offsetY: element.height / 2,
      width: element.width,
      height: element.height,
      rotation: element.rotation  || 0,
      scaleX:   element.scaleX    || 1,
      scaleY:   element.scaleY    || 1,
      opacity:  element.opacity   || 1,
      listening: false,
    }));
  } else if (element.type === 'text') {
    group.add(new Konva.Text({
      text:       element.text || 'Text',
      x:          element.x + element.width / 2,
      y:          element.y + (element.height || element.fontSize || 20) / 2,
      offsetX:    element.width / 2,
      offsetY:    (element.height || element.fontSize || 20) / 2,
      width:      element.width,
      fontSize:   element.fontSize   || 20,
      fontFamily: element.fontFamily || 'Arial',
      fill:       element.fill       || '#000000',
      rotation:   element.rotation   || 0,
      scaleX:     element.scaleX     || 1,
      scaleY:     element.scaleY     || 1,
      opacity:    element.opacity    || 1,
      listening: false,
    }));
  }
};

// ── exportAllCanvasImages ─────────────────────────────────────────────────────

export const exportAllCanvasImages = async (
  designElements: Record<string, DesignElement[]>,
  activeColor: string,
  canvasImages: Record<string, HTMLImageElement | null>,
  getCanvasConfig: (areaId: string, colorHex?: string) => any,
  getPrintableAreaFromPhoto: (areaId: string, colorHex?: string) => any,
  getCustomizationAreaByName: (areaId: string) => any,
  calculateDPI: (element: DesignElement) => { dpi: number; quality: string }
): Promise<Array<{ area_id: string; image_data: string; metadata: CanvasImageMetadata; description: string }>> => {
  const results: Array<{ area_id: string; image_data: string; metadata: CanvasImageMetadata; description: string }> = [];

  for (const areaId of Object.keys(designElements)) {
    const elements = designElements[areaId] || [];
    if (elements.filter(el => el.visible !== false).length === 0) continue;

    try {
      const imageData = await captureCanvasImageForArea(
        areaId, designElements, activeColor, canvasImages,
        getCanvasConfig, getPrintableAreaFromPhoto, getCustomizationAreaByName
      );

      if (imageData) {
        const metadata = generateCanvasMetadata(areaId, activeColor, designElements, getCanvasConfig, getPrintableAreaFromPhoto, calculateDPI);
        results.push({
          area_id: areaId,
          image_data: imageData,
          metadata,
          description: `Canvas capture for ${areaId.toUpperCase()}. ${elements.filter(el => el.visible !== false).length} visible element(s).`,
        });
      }
    } catch (error) {
      console.error(`Error exporting canvas image for ${areaId}:`, error);
    }
  }

  return results;
};

// ── generateDetailedAreaAnalysis ──────────────────────────────────────────────

export const generateDetailedAreaAnalysis = (
  pricingData: any,
  designElements: Record<string, DesignElement[]>,
  availableAreas: string[],
  getCanvasConfig: (areaId: string) => any,
  getPrintableAreaFromPhoto: (areaId: string) => any,
  calculateDPI: (element: DesignElement) => { dpi: number; quality: string; color: string },
  calculateElementRealWorldDimensions: (element: DesignElement, areaId: string) => any
) => {
  const analysis: any = {
    total_design_area_available: 0,
    current_image_area_used: 0,
    area_utilization_percentage: 0,
    all_available_areas: availableAreas,
    areas_with_elements: [] as string[],
    areas_without_elements: [] as string[],
    detailed_areas_breakdown: {} as Record<string, any>,
    element_details: {} as Record<string, any[]>,
    area_summary: {},
  };

  availableAreas.forEach(areaId => {
    const elements        = designElements[areaId] || [];
    const visibleElements = elements.filter(el => el.visible !== false);
    const canvasConfig    = getCanvasConfig(areaId);
    const printableArea   = getPrintableAreaFromPhoto(areaId);
    const areaDesignAvailable = canvasConfig.realWorldWidth * canvasConfig.realWorldHeight;
    let areaCurrentImageUsed = 0;
    const elementDetails: any[] = [];

    const areaPricing       = pricingData?.areas?.[areaId];
    const consumedWidthInch = areaPricing?.consumedWidth  || 0;
    const consumedHeightInch= areaPricing?.consumedHeight || 0;

    visibleElements.forEach((element, index) => {
      const realWorldDims = calculateElementRealWorldDimensions(element, areaId);
      areaCurrentImageUsed += realWorldDims.areaSquareInches;

      const dpiInfo = calculateDPI(element);
      elementDetails.push({
        element_id:   element.id,
        element_name: element.imageName || element.text || `Element ${index + 1}`,
        element_type: element.type,
        physical_dimensions: {
          width_inches:  Number(realWorldDims.widthInches.toFixed(3)),
          height_inches: Number(realWorldDims.heightInches.toFixed(3)),
          area_square_inches: Number(realWorldDims.areaSquareInches.toFixed(3)),
          position_x_inches:  Number(realWorldDims.xInches.toFixed(3)),
          position_y_inches:  Number(realWorldDims.yInches.toFixed(3)),
        },
        pixel_dimensions: {
          width_pixels:  Math.round(element.width  * (element.scaleX || 1)),
          height_pixels: Math.round(element.height * (element.scaleY || 1)),
          position_x_pixels: Math.round(element.x),
          position_y_pixels: Math.round(element.y),
        },
        original_image_info: {
          original_width_pixels:  element.originalImageWidth  || element.width,
          original_height_pixels: element.originalImageHeight || element.height,
          original_aspect_ratio: Number(((element.originalImageWidth || element.width) / (element.originalImageHeight || element.height)).toFixed(3)),
        },
        transformations: {
          rotation_degrees: Number((element.rotation || 0).toFixed(2)),
          scale_x:  Number((element.scaleX  || 1).toFixed(3)),
          scale_y:  Number((element.scaleY  || 1).toFixed(3)),
          opacity:  Number((element.opacity || 1).toFixed(2)),
          is_rotated: Math.abs(element.rotation || 0) > 0.1,
          is_scaled:  Math.abs((element.scaleX || 1) - 1) > 0.01 || Math.abs((element.scaleY || 1) - 1) > 0.01,
        },
        print_quality: { dpi: dpiInfo.dpi, quality_rating: dpiInfo.quality, is_print_ready: dpiInfo.quality !== 'Poor' },
        state: { visible: element.visible !== false, locked: element.locked || false, z_index: element.zIndex || 0, has_base64: !!element.imageBase64 },
      });
    });

    const areaUtil = areaDesignAvailable > 0 ? (areaCurrentImageUsed / areaDesignAvailable) * 100 : 0;

    if (visibleElements.length > 0) analysis.areas_with_elements.push(areaId);
    else analysis.areas_without_elements.push(areaId);

    analysis.detailed_areas_breakdown[areaId] = {
      area_id: areaId,
      area_name: areaId.charAt(0).toUpperCase() + areaId.slice(1),
      has_elements: visibleElements.length > 0,
      capacity: {
        design_area_available_sq_inches: Number(areaDesignAvailable.toFixed(3)),
        current_image_area_used_sq_inches: Number(areaCurrentImageUsed.toFixed(3)),
        remaining_area_sq_inches: Number((areaDesignAvailable - areaCurrentImageUsed).toFixed(3)),
        utilization_percentage: Number(areaUtil.toFixed(2)),
      },
      area_specifications: {
        canvas_width_pixels:  canvasConfig.width,
        canvas_height_pixels: canvasConfig.height,
        canvas_width_inches:  canvasConfig.realWorldWidth,
        canvas_height_inches: canvasConfig.realWorldHeight,
        printable_area: {
          x_pixels: printableArea.x,
          y_pixels: printableArea.y,
          width_pixels:  printableArea.width,
          height_pixels: printableArea.height,
          width_inches:  Number(consumedWidthInch.toFixed(3)),
          height_inches: Number(consumedHeightInch.toFixed(3)),
          full_printable_width_inches:  Number(canvasConfig.realWorldWidth.toFixed(3)),
          full_printable_height_inches: Number(canvasConfig.realWorldHeight.toFixed(3)),
        },
      },
      element_statistics: {
        total_elements:    elements.length,
        visible_elements:  visibleElements.length,
        hidden_elements:   elements.length - visibleElements.length,
        image_elements:    visibleElements.filter(el => el.type === 'image').length,
        text_elements:     visibleElements.filter(el => el.type === 'text').length,
        rotated_elements:  visibleElements.filter(el => Math.abs(el.rotation || 0) > 0.1).length,
        scaled_elements:   visibleElements.filter(el => Math.abs((el.scaleX || 1) - 1) > 0.01 || Math.abs((el.scaleY || 1) - 1) > 0.01).length,
      },
      elements: elementDetails,
    };

    analysis.element_details[areaId] = elementDetails;
    analysis.total_design_area_available += areaDesignAvailable;
    analysis.current_image_area_used    += areaCurrentImageUsed;
  });

  analysis.area_utilization_percentage = analysis.total_design_area_available > 0
    ? Number((analysis.current_image_area_used / analysis.total_design_area_available * 100).toFixed(2))
    : 0;

  analysis.area_summary = {
    total_areas:         availableAreas.length,
    areas_with_content:  analysis.areas_with_elements.length,
    areas_empty:         analysis.areas_without_elements.length,
    total_elements_across_all_areas: Object.values(designElements).flat().length,
    total_visible_elements: Object.values(designElements).flat().filter(el => el.visible !== false).length,
  };

  return analysis;
};