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

// ── extractDesignImages ───────────────────────────────────────────────────────
// Renders all visible image elements per area into a single manufacturing-film
// PNG, capturing exactly what the creator sees (position, size, rotation,
// opacity, scaleX/scaleY) — clamped to the printable area.
// Output is at the highest pixel density the source images can provide,
// but the LAYOUT always matches canvas display exactly.

export const extractDesignImages = (
  designElements: Record<string, DesignElement[]>,
  getCanvasConfig: (areaId: string, colorHex?: string) => any,
  getPrintableAreaFromPhoto: (areaId: string, colorHex?: string, sizeId?: string) => any
): any[] => {
  const designImages: any[] = [];

  Object.entries(designElements).forEach(([area, elements]) => {
    if (!Array.isArray(elements)) return;

    const visibleImageElements = elements.filter(
      el => el.type === 'image' && el.visible !== false && el.image
    );
    if (visibleImageElements.length === 0) return;

    const canvasConfig  = getCanvasConfig(area);
    const printableArea = getPrintableAreaFromPhoto(area);

    try {
      const sortedElements = [...visibleImageElements].sort(
        (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
      );

      // ── Step 1: Calculate AABB of all elements (display size, with rotation) ──
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      sortedElements.forEach(element => {
        // displayW/displayH = what's visible on canvas (respects scaleX/scaleY)
        const displayW = element.width  * (element.scaleX || 1);
        const displayH = element.height * (element.scaleY || 1);
        const cx = element.x + displayW / 2;
        const cy = element.y + displayH / 2;
        const rotation = element.rotation || 0;

        if (Math.abs(rotation) > 0.1) {
          const rad = (rotation * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          const hw = displayW / 2;
          const hh = displayH / 2;
          // All 4 rotated corners
          [
            { x: -hw, y: -hh }, { x: hw, y: -hh },
            { x:  hw, y:  hh }, { x: -hw, y: hh },
          ].forEach(c => {
            const rx = cx + c.x * cos - c.y * sin;
            const ry = cy + c.x * sin + c.y * cos;
            minX = Math.min(minX, rx); maxX = Math.max(maxX, rx);
            minY = Math.min(minY, ry); maxY = Math.max(maxY, ry);
          });
        } else {
          minX = Math.min(minX, element.x);            maxX = Math.max(maxX, element.x + displayW);
          minY = Math.min(minY, element.y);            maxY = Math.max(maxY, element.y + displayH);
        }
      });

      // ── Step 2: Clamp to printable area ──────────────────────────────────────
      const pL = printableArea.x;
      const pR = printableArea.x + printableArea.width;
      const pT = printableArea.y;
      const pB = printableArea.y + printableArea.height;

      const wasCropped = minX < pL || maxX > pR || minY < pT || maxY > pB;
      minX = Math.max(minX, pL); maxX = Math.min(maxX, pR);
      minY = Math.max(minY, pT); maxY = Math.min(maxY, pB);

      if (minX >= maxX || minY >= maxY) return;

      const bwCanvas = maxX - minX; // bounding box width  in canvas pixels
      const bhCanvas = maxY - minY; // bounding box height in canvas pixels

      // ── Step 3: Choose output scale ───────────────────────────────────────────
      // We want the highest quality possible without distorting the layout.
      // Strategy: for each element, find how many original pixels fit into one
      // canvas pixel of its display area → that's the quality multiplier.
      // Cap at 4× to avoid insane canvas sizes; floor at 1×.
      let maxQualityScale = 1;
      sortedElements.forEach(el => {
        const origW    = el.originalImageWidth  || el.image!.naturalWidth  || el.image!.width;
        const origH    = el.originalImageHeight || el.image!.naturalHeight || el.image!.height;
        const displayW = el.width  * (el.scaleX || 1);
        const displayH = el.height * (el.scaleY || 1);
        if (displayW > 0 && displayH > 0) {
          const scaleX = origW / displayW;
          const scaleY = origH / displayH;
          // Use the smaller axis so we never upscale beyond true resolution
          maxQualityScale = Math.max(maxQualityScale, Math.min(scaleX, scaleY));
        }
      });

      // Cap: 4× max; if creator zoomed in past original resolution, stay at 1×
      const outputScale  = Math.min(Math.max(maxQualityScale, 1), 4);
      const outputWidth  = Math.round(bwCanvas * outputScale);
      const outputHeight = Math.round(bhCanvas * outputScale);

      // ── Step 4: Render each element exactly as the creator positioned it ──────
      const mergedCanvas = document.createElement('canvas');
      mergedCanvas.width  = outputWidth;
      mergedCanvas.height = outputHeight;
      const mergedCtx = mergedCanvas.getContext('2d', { alpha: true });
      if (!mergedCtx) return;

      mergedCtx.imageSmoothingEnabled = true;
      mergedCtx.imageSmoothingQuality = 'high';

      sortedElements.forEach(element => {
        if (!element.image) return;

        // Display dimensions on canvas (what creator sees inside the 8 handles)
        const displayW = element.width  * (element.scaleX || 1);
        const displayH = element.height * (element.scaleY || 1);

        // Center of this element in canvas-space, shifted to bounding-box origin,
        // then scaled to output pixels
        const centerX = ((element.x + displayW / 2) - minX) * outputScale;
        const centerY = ((element.y + displayH / 2) - minY) * outputScale;

        // How large to draw the image in output pixels — exactly matches the
        // canvas display size, scaled up by outputScale for quality
        const drawW = displayW * outputScale;
        const drawH = displayH * outputScale;

        mergedCtx.save();
        mergedCtx.translate(centerX, centerY);
        if (element.rotation) {
          mergedCtx.rotate((element.rotation * Math.PI) / 180);
        }
        mergedCtx.globalAlpha = element.opacity ?? 1;

        // Draw centered on the translated origin at display dimensions × outputScale
        mergedCtx.drawImage(
          element.image,
          -drawW / 2, -drawH / 2,
          drawW, drawH
        );
        mergedCtx.restore();
      });

      const mergedBase64 = mergedCanvas.toDataURL('image/png', 1.0);

      // ── Step 5: Physical dimension metadata ───────────────────────────────────
      const avgPPI = (
        (printableArea.width  / canvasConfig.realWorldWidth) +
        (printableArea.height / canvasConfig.realWorldHeight)
      ) / 2;
      const widthInches  = bwCanvas / avgPPI;
      const heightInches = bhCanvas / avgPPI;
      const dpi = Math.round(
        (outputWidth / widthInches + outputHeight / heightInches) / 2
      );
      const quality = dpi >= 300 ? 'Excellent' : dpi >= 150 ? 'Good' : 'Poor';

      designImages.push({
        id:   `film-${area}-${Date.now()}`,
        name: `${area}-manufacturing-film${wasCropped ? '-cropped' : ''}.png`,
        type: 'image/png',
        base64Data: mergedBase64,
        originalWidth:  outputWidth,
        originalHeight: outputHeight,
        area,
        position:   { x: minX, y: minY },
        dimensions: { width: bwCanvas, height: bhCanvas },
        physicalDimensions: {
          widthInches:  Number(widthInches.toFixed(3)),
          heightInches: Number(heightInches.toFixed(3)),
          xInches: Number(
            ((minX - printableArea.x) / printableArea.width  * canvasConfig.realWorldWidth ).toFixed(3)
          ),
          yInches: Number(
            ((minY - printableArea.y) / printableArea.height * canvasConfig.realWorldHeight).toFixed(3)
          ),
        },
        isMerged:          true,
        isManufacturingFilm: true,
        wasCropped,
        elementCount:   sortedElements.length,
        dpi,
        printQuality:   quality,
        outputScale,
        description: `Manufacturing film for ${area.toUpperCase()}. ${sortedElements.length} element(s). ${wasCropped ? 'Cropped to printable area.' : ''} DPI: ${dpi} (${quality}).`,
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

    // ── Clean panel (left) ────────────────────────────────────────────────────
    const stageClean  = new Konva.Stage({ container: document.createElement('div'), width: canvasConfig.width, height: canvasConfig.height, pixelRatio: 2 });
    const layerClean  = new Konva.Layer();
    stageClean.add(layerClean);
    buildLayer(layerClean);
    layerClean.add(new Konva.Rect({ x: printableArea.x, y: printableArea.y, width: printableArea.width, height: printableArea.height, stroke: '#e65100', strokeWidth: 2, dash: [6, 4], listening: false }));
    layerClean.draw();
    await new Promise(r => setTimeout(r, 100));
    const cleanDataURL = stageClean.toDataURL({ mimeType: 'image/png', quality: 1.0, pixelRatio: 2 });
    stageClean.destroy();

    // ── Annotated panel (right) ───────────────────────────────────────────────
    // Compute actual element bounding box (consumed design area, mirrors extractDesignImages)
    let bbMinX = Infinity, bbMinY = Infinity, bbMaxX = -Infinity, bbMaxY = -Infinity;
    sortedElements.forEach(element => {
      const displayW = element.width  * (element.scaleX || 1);
      const displayH = element.height * (element.scaleY || 1);
      const cx = element.x + displayW / 2;
      const cy = element.y + displayH / 2;
      const rotation = element.rotation || 0;
      if (Math.abs(rotation) > 0.1) {
        const rad = (rotation * Math.PI) / 180;
        const cos = Math.cos(rad), sin = Math.sin(rad);
        const hw = displayW / 2, hh = displayH / 2;
        [{ x: -hw, y: -hh }, { x: hw, y: -hh }, { x: hw, y: hh }, { x: -hw, y: hh }].forEach(c => {
          const rx = cx + c.x * cos - c.y * sin;
          const ry = cy + c.x * sin + c.y * cos;
          bbMinX = Math.min(bbMinX, rx); bbMaxX = Math.max(bbMaxX, rx);
          bbMinY = Math.min(bbMinY, ry); bbMaxY = Math.max(bbMaxY, ry);
        });
      } else {
        bbMinX = Math.min(bbMinX, element.x);             bbMaxX = Math.max(bbMaxX, element.x + displayW);
        bbMinY = Math.min(bbMinY, element.y);             bbMaxY = Math.max(bbMaxY, element.y + displayH);
      }
    });
    // Clamp bounding box to printable area
    bbMinX = Math.max(bbMinX, printableArea.x);  bbMaxX = Math.min(bbMaxX, printableArea.x + printableArea.width);
    bbMinY = Math.max(bbMinY, printableArea.y);  bbMaxY = Math.min(bbMaxY, printableArea.y + printableArea.height);
    const bbW = bbMaxX - bbMinX; // consumed width  in canvas pixels
    const bbH = bbMaxY - bbMinY; // consumed height in canvas pixels

    // Convert bounding box to inches (same avgPPI formula as extractDesignImages)
    const avgPPI       = ((printableArea.width / canvasConfig.realWorldWidth) + (printableArea.height / canvasConfig.realWorldHeight)) / 2;
    const bbWidthInch  = (bbW / avgPPI).toFixed(2);
    const bbHeightInch = (bbH / avgPPI).toFixed(2);
    const sizeLabel    = `${bbWidthInch}" × ${bbHeightInch}"`;

    const stageAnnotated = new Konva.Stage({ container: document.createElement('div'), width: canvasConfig.width, height: canvasConfig.height, pixelRatio: 2 });
    const layerAnnotated = new Konva.Layer();
    stageAnnotated.add(layerAnnotated);
    buildLayer(layerAnnotated);

    // 1. Full printable area boundary — light grey dashed
    layerAnnotated.add(new Konva.Rect({
      x: printableArea.x, y: printableArea.y,
      width: printableArea.width, height: printableArea.height,
      stroke: '#aaaaaa', strokeWidth: 1.5, dash: [5, 5], listening: false,
    }));

    // 2. Consumed design area — orange dashed rectangle
    layerAnnotated.add(new Konva.Rect({
      x: bbMinX, y: bbMinY, width: bbW, height: bbH,
      stroke: '#e65100', strokeWidth: 2.5, dash: [8, 5],
      fill: 'rgba(230,81,0,0.04)', listening: false,
    }));

    // 3. Consumed size badge — centred directly above the consumed box top edge
    const badgeH    = 22;
    const badgePadX = 10;
    const badgeW    = sizeLabel.length * 7.5 + badgePadX * 2;
    const badgeX    = bbMinX + bbW / 2 - badgeW / 2;
    const badgeY    = bbMinY - badgeH - 6;
    layerAnnotated.add(new Konva.Rect({
      x: badgeX, y: badgeY, width: badgeW, height: badgeH,
      fill: '#e65100', cornerRadius: 4, listening: false,
    }));
    layerAnnotated.add(new Konva.Text({
      text: sizeLabel, x: badgeX + badgePadX, y: badgeY + 5,
      fontSize: 12, fontFamily: 'Arial', fontStyle: 'bold', fill: '#ffffff', listening: false,
    }));

        // 4. Orange consumed-size arrows — drawn OUTSIDE the grey printable boundary
    const GAP_FROM_PRINTABLE = 14;
    const TICK  = 6;
    const aY = printableArea.y - GAP_FROM_PRINTABLE;
    const aX = printableArea.x - GAP_FROM_PRINTABLE;

    // Horizontal: bbMinX ←→ bbMaxX, above printable area (blue)
    layerAnnotated.add(new Konva.Line({ points: [bbMinX, aY, bbMaxX, aY], stroke: '#1565c0', strokeWidth: 1.5, listening: false }));
    layerAnnotated.add(new Konva.Line({ points: [bbMinX + 8, aY - 4, bbMinX, aY, bbMinX + 8, aY + 4], stroke: '#1565c0', strokeWidth: 1.5, lineJoin: 'round', lineCap: 'round', listening: false }));
    layerAnnotated.add(new Konva.Line({ points: [bbMaxX - 8, aY - 4, bbMaxX, aY, bbMaxX - 8, aY + 4], stroke: '#1565c0', strokeWidth: 1.5, lineJoin: 'round', lineCap: 'round', listening: false }));
    layerAnnotated.add(new Konva.Line({ points: [bbMinX, aY - TICK, bbMinX, aY + TICK], stroke: '#1565c0', strokeWidth: 1.5, listening: false }));
    layerAnnotated.add(new Konva.Line({ points: [bbMaxX, aY - TICK, bbMaxX, aY + TICK], stroke: '#1565c0', strokeWidth: 1.5, listening: false }));
    layerAnnotated.add(new Konva.Line({ points: [bbMinX, aY + TICK, bbMinX, printableArea.y], stroke: '#1565c0', strokeWidth: 0.8, dash: [3, 3], listening: false }));
    layerAnnotated.add(new Konva.Line({ points: [bbMaxX, aY + TICK, bbMaxX, printableArea.y], stroke: '#1565c0', strokeWidth: 0.8, dash: [3, 3], listening: false }));

    // Vertical: bbMinY ↕ bbMaxY, left of printable area (orange)
    layerAnnotated.add(new Konva.Line({ points: [aX, bbMinY, aX, bbMaxY], stroke: '#e65100', strokeWidth: 1.5, listening: false }));
    layerAnnotated.add(new Konva.Line({ points: [aX - 4, bbMinY + 8, aX, bbMinY, aX + 4, bbMinY + 8], stroke: '#e65100', strokeWidth: 1.5, lineJoin: 'round', lineCap: 'round', listening: false }));
    layerAnnotated.add(new Konva.Line({ points: [aX - 4, bbMaxY - 8, aX, bbMaxY, aX + 4, bbMaxY - 8], stroke: '#e65100', strokeWidth: 1.5, lineJoin: 'round', lineCap: 'round', listening: false }));
    layerAnnotated.add(new Konva.Line({ points: [aX - TICK, bbMinY, aX + TICK, bbMinY], stroke: '#e65100', strokeWidth: 1.5, listening: false }));
    layerAnnotated.add(new Konva.Line({ points: [aX - TICK, bbMaxY, aX + TICK, bbMaxY], stroke: '#e65100', strokeWidth: 1.5, listening: false }));
    layerAnnotated.add(new Konva.Line({ points: [aX + TICK, bbMinY, printableArea.x, bbMinY], stroke: '#e65100', strokeWidth: 0.8, dash: [3, 3], listening: false }));
    layerAnnotated.add(new Konva.Line({ points: [aX + TICK, bbMaxY, printableArea.x, bbMaxY], stroke: '#e65100', strokeWidth: 0.8, dash: [3, 3], listening: false }));

    // 5. Blue leftover gap indicators — one per side, each isolated, no overlaps
    const LO_COLOR  = '#1565c0';
    const LO_STROKE = 1.5;
    const LO_TICK   = 5;
    const LO_DASH   = [5, 4] as number[];
    const LB_H      = 20;
    const LB_PAD    = 8;
    const LB_FS     = 10;
    const CHAR_W    = 7;

    const pRight  = printableArea.x + printableArea.width;
    const pBottom = printableArea.y + printableArea.height;

    const leftoverLeft   = bbMinX - printableArea.x;
    const leftoverRight  = pRight  - bbMaxX;
    const leftoverTop    = bbMinY  - printableArea.y;
    const leftoverBottom = pBottom - bbMaxY;

    // Badge helper — label + value on two lines for clarity
    const drawGapBadge = (label: string, value: string, cx: number, cy: number) => {
      const longerLen = Math.max(label.length, value.length);
      const bw = longerLen * CHAR_W + LB_PAD * 2;
      const bh = LB_H + 14; // two-line badge
      layerAnnotated.add(new Konva.Rect({
        x: cx - bw / 2, y: cy - bh / 2,
        width: bw, height: bh,
        fill: LO_COLOR, cornerRadius: 3, listening: false,
      }));
      layerAnnotated.add(new Konva.Text({
        text: label,
        fontSize: 9, fontFamily: 'Arial', fill: 'rgba(255,255,255,0.75)',
        x: cx - bw / 2 + LB_PAD, y: cy - bh / 2 + 4,
        listening: false,
      }));
      layerAnnotated.add(new Konva.Text({
        text: value,
        fontSize: LB_FS, fontFamily: 'Arial', fontStyle: 'bold', fill: '#ffffff',
        x: cx - bw / 2 + LB_PAD, y: cy - bh / 2 + 16,
        listening: false,
      }));
    };

    // LEFT gap — horizontal line at mid-height of the left gap, badge to its left
    if (leftoverLeft > 4) {
      const ly = printableArea.y + leftoverTop + leftoverBottom > 0
        ? bbMinY + bbH / 2   // vertically centred on consumed box
        : printableArea.y + printableArea.height / 2;
      layerAnnotated.add(new Konva.Line({ points: [printableArea.x, ly, bbMinX, ly], stroke: LO_COLOR, strokeWidth: LO_STROKE, dash: LO_DASH, listening: false }));
      layerAnnotated.add(new Konva.Line({ points: [printableArea.x, ly - LO_TICK, printableArea.x, ly + LO_TICK], stroke: LO_COLOR, strokeWidth: LO_STROKE, listening: false }));
      layerAnnotated.add(new Konva.Line({ points: [bbMinX, ly - LO_TICK, bbMinX, ly + LO_TICK], stroke: LO_COLOR, strokeWidth: LO_STROKE, listening: false }));
      drawGapBadge('Left gap', `${(leftoverLeft / avgPPI).toFixed(2)}"`, printableArea.x + leftoverLeft / 2, ly);
    }

    // RIGHT gap — horizontal line at mid-height of consumed box, badge to its right
    if (leftoverRight > 4) {
      const ly = bbMinY + bbH / 2;
      layerAnnotated.add(new Konva.Line({ points: [bbMaxX, ly, pRight, ly], stroke: LO_COLOR, strokeWidth: LO_STROKE, dash: LO_DASH, listening: false }));
      layerAnnotated.add(new Konva.Line({ points: [bbMaxX, ly - LO_TICK, bbMaxX, ly + LO_TICK], stroke: LO_COLOR, strokeWidth: LO_STROKE, listening: false }));
      layerAnnotated.add(new Konva.Line({ points: [pRight,  ly - LO_TICK, pRight,  ly + LO_TICK], stroke: LO_COLOR, strokeWidth: LO_STROKE, listening: false }));
      drawGapBadge('Right gap', `${(leftoverRight / avgPPI).toFixed(2)}"`, bbMaxX + leftoverRight / 2, ly);
    }

    // TOP gap — vertical line near the right edge of consumed box, badge right-aligned to avoid orange badge
    if (leftoverTop > 4) {
      const lx = bbMaxX - 16; // near right edge of consumed box, away from centre where orange badge sits
      layerAnnotated.add(new Konva.Line({ points: [lx, printableArea.y, lx, bbMinY], stroke: LO_COLOR, strokeWidth: LO_STROKE, dash: LO_DASH, listening: false }));
      layerAnnotated.add(new Konva.Line({ points: [lx - LO_TICK, printableArea.y, lx + LO_TICK, printableArea.y], stroke: LO_COLOR, strokeWidth: LO_STROKE, listening: false }));
      layerAnnotated.add(new Konva.Line({ points: [lx - LO_TICK, bbMinY,          lx + LO_TICK, bbMinY         ], stroke: LO_COLOR, strokeWidth: LO_STROKE, listening: false }));
      drawGapBadge('Top gap', `${(leftoverTop / avgPPI).toFixed(2)}"`, lx, printableArea.y + leftoverTop / 2);
    }

    // BOTTOM gap — vertical line at mid-width of consumed box, badge below it
    if (leftoverBottom > 4) {
      const lx = bbMinX + bbW / 2;
      layerAnnotated.add(new Konva.Line({ points: [lx, bbMaxY, lx, pBottom], stroke: LO_COLOR, strokeWidth: LO_STROKE, dash: LO_DASH, listening: false }));
      layerAnnotated.add(new Konva.Line({ points: [lx - LO_TICK, bbMaxY,  lx + LO_TICK, bbMaxY ], stroke: LO_COLOR, strokeWidth: LO_STROKE, listening: false }));
      layerAnnotated.add(new Konva.Line({ points: [lx - LO_TICK, pBottom, lx + LO_TICK, pBottom], stroke: LO_COLOR, strokeWidth: LO_STROKE, listening: false }));
      drawGapBadge('Bottom gap', `${(leftoverBottom / avgPPI).toFixed(2)}"`, lx, bbMaxY + leftoverBottom / 2);
    }

    layerAnnotated.draw();
    await new Promise(r => setTimeout(r, 100));
    const annotatedDataURL = stageAnnotated.toDataURL({ mimeType: 'image/png', quality: 1.0, pixelRatio: 2 });
    stageAnnotated.destroy();

    // ── Composite side-by-side ────────────────────────────────────────────────
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
