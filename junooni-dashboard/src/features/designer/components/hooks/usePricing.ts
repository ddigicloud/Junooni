// ============================================================
// hooks/usePricing.ts
// Encapsulates all pricing state + calculation logic.
// Replaces the ~400 lines of pricing code in EnhancedCanvas.
// ============================================================

import { useState, useCallback } from 'react';
import type { DesignElement, AreaPricingInfo, TotalPricingBreakdown, PayloadProductData } from '../types';
import { cropTransparentPixels } from '../utils';

interface UsePricingOptions {
  designElements: Record<string, DesignElement[]>;
  activeTechnology: string;
  activeColor: string;
  activeArea: string;
  productData: PayloadProductData;
  availableAreas: string[];
  getCanvasConfig: (areaId: string, colorHex?: string) => { width: number; height: number; realWorldWidth: number; realWorldHeight: number };
  getPrintableAreaFromPhoto: (areaId: string, colorHex?: string, sizeId?: string) => { x: number; y: number; width: number; height: number };
  getCustomizationAreaByName: (areaId: string) => any;
  getCurrentTechnology: () => any;
  calculateDPI: (element: DesignElement) => { dpi: number; quality: 'Poor' | 'Good' | 'Excellent'; color: string };
}

export const usePricing = ({
  designElements,
  activeTechnology,
  activeColor,
  activeArea,
  productData,
  availableAreas,
  getCanvasConfig,
  getPrintableAreaFromPhoto,
  getCustomizationAreaByName,
  getCurrentTechnology,
  calculateDPI,
}: UsePricingOptions) => {
  const [pricingData, setPricingData] = useState<Record<string, AreaPricingInfo>>({});
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [pricingBreakdown, setPricingBreakdown] = useState<TotalPricingBreakdown | null>(null);
  const [priceCalculationLoading, setPriceCalculationLoading] = useState(false);

  // ── Pricing info per area ─────────────────────────────────────────────────
  const getPricingInfoForArea = useCallback((areaId: string): {
    minimumPrice: number; pricePerSquareInch: number; isFixedPrice: boolean;
  } => {
    try {
      const technology = getCurrentTechnology();
      if (technology?.custAreas) {
        const area = technology.custAreas.find(
          (a: any) => a.areaName.toLowerCase() === areaId.toLowerCase()
        );
        if (area) {
          const minimumPrice = parseFloat(area['Minimum printing price'] || '0');
          const pricePerSquareInch = parseFloat(area['Per sq inch printing price'] || '0');
          if (area['Minimum printing price'] && area['Per sq inch printing price'])
            return { minimumPrice, pricePerSquareInch, isFixedPrice: false };
          if (area['Minimum printing price'] && !area['Per sq inch printing price'])
            return { minimumPrice, pricePerSquareInch: 0, isFixedPrice: true };
          if (!area['Minimum printing price'] && area['Per sq inch printing price'])
            return { minimumPrice: 0, pricePerSquareInch, isFixedPrice: false };
        }
      }
      return { minimumPrice: 0, pricePerSquareInch: 0, isFixedPrice: true };
    } catch { return { minimumPrice: 0, pricePerSquareInch: 0, isFixedPrice: true }; }
  }, [getCurrentTechnology]);

  // ── Real-world dimensions per element ────────────────────────────────────
  const calculateElementRealWorldDimensions = useCallback((element: DesignElement, areaId: string) => {
    const canvasConfig = getCanvasConfig(areaId);
    const printableArea = getPrintableAreaFromPhoto(areaId);

    let effectiveWidth = element.width * (element.scaleX || 1);
    let effectiveHeight = element.height * (element.scaleY || 1);

    if (element.type === 'image' && element.image) {
      try {
        const { bounds } = cropTransparentPixels(element.image);
        const origW = element.originalImageWidth || element.image.naturalWidth || element.width;
        const origH = element.originalImageHeight || element.image.naturalHeight || element.height;
        const visibleRatio = (bounds.width * bounds.height) / (origW * origH);
        effectiveWidth = element.width * (element.scaleX || 1) * Math.sqrt(visibleRatio);
        effectiveHeight = element.height * (element.scaleY || 1) * Math.sqrt(visibleRatio);
      } catch {}
    }

    const intersectionLeft = Math.max(element.x, printableArea.x);
    const intersectionTop = Math.max(element.y, printableArea.y);
    const intersectionRight = Math.min(element.x + effectiveWidth, printableArea.x + printableArea.width);
    const intersectionBottom = Math.min(element.y + effectiveHeight, printableArea.y + printableArea.height);

    if (intersectionLeft >= intersectionRight || intersectionTop >= intersectionBottom)
      return { widthInches: 0, heightInches: 0, xInches: 0, yInches: 0, areaSquareInches: 0 };

    const avgPPI = ((printableArea.width / canvasConfig.realWorldWidth) + (printableArea.height / canvasConfig.realWorldHeight)) / 2;
    const widthInches = (intersectionRight - intersectionLeft) / avgPPI;
    const heightInches = (intersectionBottom - intersectionTop) / avgPPI;

    return {
      widthInches: Number(widthInches.toFixed(3)),
      heightInches: Number(heightInches.toFixed(3)),
      xInches: Number(((intersectionLeft - printableArea.x) / printableArea.width * canvasConfig.realWorldWidth).toFixed(3)),
      yInches: Number(((intersectionTop - printableArea.y) / printableArea.height * canvasConfig.realWorldHeight).toFixed(3)),
      areaSquareInches: Number((widthInches * heightInches).toFixed(3)),
    };
  }, [getCanvasConfig, getPrintableAreaFromPhoto]);

  // ── Per-area pricing ──────────────────────────────────────────────────────
  const calculateAreaPricing = useCallback((areaId: string): AreaPricingInfo => {
    const elements = designElements[areaId] || [];
    const visibleElements = elements.filter(el => el.visible !== false);
    const empty = {
      areaId, areaName: areaId.charAt(0).toUpperCase() + areaId.slice(1),
      minimumPrice: 0, pricePerSquareInch: 0, designAreaSquareInches: 0,
      currentImageArea: 0, calculatedPrice: 0, finalPrice: 0,
      consumedWidth: 0, consumedHeight: 0, elements: [],
    };

    if (visibleElements.length === 0) return empty;

    const sortedElements = [...visibleElements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    const canvasConfig = getCanvasConfig(areaId);
    const printableArea = getPrintableAreaFromPhoto(areaId, activeColor);
    if (!canvasConfig || !printableArea) return empty;

    const isAOPProduct = (() => {
      try {
        const area = getCustomizationAreaByName(areaId);
        return area?.designCanvasPhotos?.some((p: any) => p?.photoColor?.toLowerCase().includes('-aop')) ?? false;
      } catch { return false; }
    })();

    // AABB bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    sortedElements.forEach(el => {
      const w = el.width * (el.scaleX || 1);
      const h = el.height * (el.scaleY || 1);
      const cx = el.x + w / 2, cy = el.y + h / 2;
      const rot = el.rotation || 0;
      if (Math.abs(rot) > 0.1) {
        const rad = rot * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
        [{ x: -w/2, y: -h/2 }, { x: w/2, y: -h/2 }, { x: w/2, y: h/2 }, { x: -w/2, y: h/2 }].forEach(c => {
          const rx = cx + c.x * cos - c.y * sin, ry = cy + c.x * sin + c.y * cos;
          minX = Math.min(minX, rx); maxX = Math.max(maxX, rx);
          minY = Math.min(minY, ry); maxY = Math.max(maxY, ry);
        });
      } else {
        minX = Math.min(minX, el.x); maxX = Math.max(maxX, el.x + w);
        minY = Math.min(minY, el.y); maxY = Math.max(maxY, el.y + h);
      }
    });

    // Clamp to printable area
    minX = Math.max(minX, printableArea.x); minY = Math.max(minY, printableArea.y);
    maxX = Math.min(maxX, printableArea.x + printableArea.width);
    maxY = Math.min(maxY, printableArea.y + printableArea.height);
    if (minX >= maxX || minY >= maxY) return empty;

    const avgPPI = ((printableArea.width / canvasConfig.realWorldWidth) + (printableArea.height / canvasConfig.realWorldHeight)) / 2;
    const consumedWidth = Math.min((maxX - minX) / avgPPI, canvasConfig.realWorldWidth);
    const consumedHeight = Math.min((maxY - minY) / avgPPI, canvasConfig.realWorldHeight);

    const totalCurrentImageArea = isAOPProduct
      ? canvasConfig.realWorldWidth * canvasConfig.realWorldHeight
      : consumedWidth * consumedHeight;

    const { minimumPrice, pricePerSquareInch, isFixedPrice } = getPricingInfoForArea(areaId);
    const totalCost = isFixedPrice ? minimumPrice : Math.max(minimumPrice, totalCurrentImageArea * pricePerSquareInch);

    const breakdown = sortedElements.map(el => {
      const dims = calculateElementRealWorldDimensions(el, areaId);
      const elementArea = dims.widthInches * dims.heightInches;
      const proportion = totalCurrentImageArea > 0 ? elementArea / totalCurrentImageArea : 0;
      return {
        elementId: el.id,
        elementName: el.imageName || 'Unnamed Element',
        areaSquareInches: elementArea,
        elementPrice: isFixedPrice ? totalCost / sortedElements.length : totalCost * proportion,
        originalArea: elementArea,
        extraArea: 0,
      };
    });

    return {
      areaId, areaName: areaId.charAt(0).toUpperCase() + areaId.slice(1),
      minimumPrice, pricePerSquareInch,
      designAreaSquareInches: canvasConfig.realWorldWidth * canvasConfig.realWorldHeight,
      currentImageArea: totalCurrentImageArea, calculatedPrice: totalCost, finalPrice: totalCost,
      consumedWidth: Number(consumedWidth.toFixed(2)), consumedHeight: Number(consumedHeight.toFixed(2)),
      elements: breakdown,
    };
  }, [designElements, getCanvasConfig, getPrintableAreaFromPhoto, activeColor, getCustomizationAreaByName, getPricingInfoForArea, calculateElementRealWorldDimensions]);

  // ── Total pricing (all areas) ─────────────────────────────────────────────
  const calculateTotalPricing = useCallback((): TotalPricingBreakdown => {
    setPriceCalculationLoading(true);
    const areas: Record<string, AreaPricingInfo> = {};
    let totalDesignArea = 0, totalElements = 0, basePrintingCost = 0;

    Object.keys(designElements).forEach(areaId => {
      const visible = (designElements[areaId] || []).filter(el => el.visible !== false);
      if (visible.length > 0) {
        const areaPricing = calculateAreaPricing(areaId);
        areas[areaId] = areaPricing;
        totalDesignArea += areaPricing.designAreaSquareInches;
        totalElements += visible.length;
        basePrintingCost += areaPricing.finalPrice;
      }
    });

    const blankProductCost = productData?.cost || 0;
    const additionalCosts = (productData as any)?.additionalCosts || {};
    const setupFee = parseFloat(additionalCosts.setupFee || '0');
    const technologyFee = parseFloat(additionalCosts.rushSurcharge || '0');
    const printingGSTPercent = parseFloat(additionalCosts.printingGST || '0');
    const productGSTPercent = parseFloat((productData as any)?.['GST Cost'] || '0');
    const shippingCharges = parseFloat((productData as any)?.shippingInfo?.shippingCharges || '0');
    const printingGSTAmount = printingGSTPercent > 0 ? basePrintingCost * printingGSTPercent / 100 : 0;
    const productGSTAmount = productGSTPercent > 0 ? blankProductCost * productGSTPercent / 100 : 0;
    const finalPrice = basePrintingCost + printingGSTAmount + blankProductCost + productGSTAmount + setupFee + technologyFee + shippingCharges;

    const breakdown: TotalPricingBreakdown = {
      areas,
      calculation: {
        subtotal: basePrintingCost, setupFee, technologyFee,
        printingGSTAmount: Number(printingGSTAmount.toFixed(2)),
        productGSTAmount: Number(productGSTAmount.toFixed(2)),
        shippingCharges: Number(shippingCharges.toFixed(2)),
        totalBeforeMarkup: finalPrice, markup: 0,
        finalTotal: Number(finalPrice.toFixed(2)),
      },
      technology: activeTechnology,
      totalElements, totalDesignArea: Number(totalDesignArea.toFixed(3)),
      priceBreakdown: {
        basePrintingCost: Number(basePrintingCost.toFixed(2)),
        blankProductCost: Number(blankProductCost.toFixed(2)),
        printingGSTAmount: Number(printingGSTAmount.toFixed(2)),
        productGSTAmount: Number(productGSTAmount.toFixed(2)),
        setupFees: setupFee, additionalCosts: technologyFee,
        shippingCharges: Number(shippingCharges.toFixed(2)),
        markup: 0, finalPrice: Number(finalPrice.toFixed(2)),
      },
    };

    setPriceCalculationLoading(false);
    return breakdown;
  }, [designElements, calculateAreaPricing, productData, activeTechnology]);

  const updatePricingData = useCallback(() => {
    const breakdown = calculateTotalPricing();
    setPricingBreakdown(breakdown);
    setPricingData(breakdown.areas);
    setTotalPrice(breakdown.calculation.finalTotal);
  }, [calculateTotalPricing]);

  return {
    pricingData, totalPrice, pricingBreakdown, priceCalculationLoading,
    updatePricingData, calculateAreaPricing, calculateElementRealWorldDimensions,
    getPricingInfoForArea, calculateTotalPricing,
    clearPricing: () => { setPricingData({}); setTotalPrice(0); setPricingBreakdown(null); },
  };
};