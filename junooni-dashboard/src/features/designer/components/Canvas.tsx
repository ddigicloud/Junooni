// ============================================================
// Canvas.tsx — COMPLETE with all render functions
// All heavy logic delegated to hooks and utility files.
// ============================================================

import React, {
  useState, useEffect, useCallback, useMemo,
  startTransition, useRef,
} from 'react';
import Konva from 'konva';
import {
  Stage, Layer, Image as KonvaImage, Rect, Group,
  Transformer, Text as KonvaText,
} from 'react-konva';
import { useNavigate } from '@tanstack/react-router';
import JunooniLogo from '@/assets/junooni_logo_brand_color.png';
import JUNO from '@/assets/JUNO.mp4';
import {
  Package, Palette, Ruler, Upload, Layers, IndianRupee,
  PenTool, Eye, Trash2, X, Calculator, ArrowLeft,
  Info, CheckCircle, Sparkles,
} from 'lucide-react';

import type { PayloadProductData, DesignElement, DynamicMockupPhoto, LayerInfo } from './types';
import {
  resolveImageUrl, isLightColor, VARIANT_HARD_LIMIT,
  calculateProjectedVariants, _renderCache, _getCacheKey, _hashDesignElements,
} from './utils';
import {
  extractAllMockupsFromPayload, getMockupsForColor,
  calculateTotalMockups, createDynamicNeutralDetector,
} from './mockup-engine-utils';
import { renderMockupDirectly, EnhancedMockupGenerator } from './MockupGeneratorClass';
import {
  extractDesignImages as extractDesignImagesUtil,
  exportAllCanvasImages as exportAllCanvasImagesUtil,
  generateDetailedAreaAnalysis as generateDetailedAreaAnalysisUtil,
} from './canvas-export-utils';
import { usePricing } from './hooks/usePricing';
import { useDesignElements } from './hooks/useDesignElements';
import { useStoreImport } from './hooks/useStoreImport';
import {
  AreaSelectionThumbnail, ThumbnailPreview, LayersPanel,
  StoreImportModal, MobileBottomTabBar, MobileBottomSheet,
} from './designer-components';
import EnhancedMockupEngine from '../engines/mockup/MockupEngine';

const BRAND = '#ec5100';

// ─────────────────────────────────────────────────────────────────────────────
const EnhancedCanvas: React.FC<{ productData: PayloadProductData }> = ({ productData }) => {
  const navigate = useNavigate();

  // ── View / tab ────────────────────────────────────────────────────────────
  const [activeView, setActiveView]       = useState<'design' | 'preview'>('design');
  const [activeTab, setActiveTab]         = useState<'product' | 'colors' | 'sizes' | 'upload' | 'layers' | 'pricing'>('product');
  const [isMobile, setIsMobile]           = useState(false);
  const [isTablet, setIsTablet]           = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileBottomSheet, setShowMobileBottomSheet] = useState(false);
  const [debugMode, setDebugMode]         = useState(false);

  // ── Active selections ─────────────────────────────────────────────────────
  const [activeTechnology, setActiveTechnology] = useState<string>(() =>
    productData?.printT?.[0]?.id || productData?.printT?.[0]?.technologyName || 'dtg'
  );
  const [activeArea, setActiveArea] = useState<string>('front');
  const [activeColor, setActiveColor] = useState<string>(() => {
    const p = productData?.colorOptions?.find(c => c.isPrimary) ?? productData?.colorOptions?.[0];
    return p?.colorHex ?? '#ffffff';
  });
  const [highlightedColor, setHighlightedColor] = useState<string>(activeColor);
  const [activeSize, setActiveSize] = useState<string>(() =>
    productData?.sizeOptions?.[0]?.sizeName ?? ''
  );
  const [selectedColors, setSelectedColors] = useState<Array<{ name: string; value: string }>>(() => {
    const p = productData?.colorOptions?.find(c => c.isPrimary) ?? productData?.colorOptions?.[0];
    return p ? [{ name: p.colorName, value: p.colorHex }] : [{ name: 'Default', value: '#ffffff' }];
  });
  const [selectedSizes, setSelectedSizes] = useState<string[]>(() =>
    (productData?.sizeOptions ?? []).map(s => s.sizeName)
  );
  const [selectedHeroMockup, setSelectedHeroMockup] = useState<DynamicMockupPhoto | null>(null);
  const [userSelectedMockupInPreview, setUserSelectedMockupInPreview] = useState(false);
  const [variantLimitWarning, setVariantLimitWarning] = useState<string | null>(null);

  // Custom dimensions (for LayersPanel)
  const [customWidth, setCustomWidth]   = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  // Alignment panel drag
  const [alignmentPanelPos, setAlignmentPanelPos] = useState({ x: 500, y: 320 });
  const [isDraggingPanel, setIsDraggingPanel]       = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panelX: 0, panelY: 0 });
  const panelRef     = useRef<HTMLDivElement>(null);
  const prevSelectedIdRef = useRef<string | null>(null);

  // ── Konva refs ────────────────────────────────────────────────────────────
  const stageRef     = useRef<Konva.Stage>(null);
  const layerRef     = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);

  // ── Product helpers ───────────────────────────────────────────────────────
  const getCurrentTechnology = useCallback(() =>
    productData?.printT?.find(t => t.id === activeTechnology || t.technologyName === activeTechnology),
    [productData, activeTechnology]
  );

  const getAvailableAreas = useCallback(() => {
    const tech = getCurrentTechnology();
    if (!tech?.custAreas?.length) return ['front'];
    const areas = tech.custAreas.filter((a: any) => a?.areaName).map((a: any) => a.areaName.toLowerCase());
    return areas.length > 0 ? areas : ['front'];
  }, [getCurrentTechnology]);

  const availableAreas = useMemo(() => getAvailableAreas(), [getAvailableAreas]);

  const getCustomizationAreaByName = useCallback((target: string) => {
    const tech = getCurrentTechnology();
    if (!tech || !target) return null;
    return tech.custAreas?.find((a: any) => a.areaName?.toLowerCase().trim() === target.toLowerCase().trim()) ?? null;
  }, [getCurrentTechnology]);

  const getCanvasConfig = useCallback((areaId: string, _colorHex?: string) => {
    const area = getCustomizationAreaByName(areaId);
    const dims = area?.canvasDim;
    return {
      width: dims?.canvasPixWid ?? 800,
      height: dims?.canvasPixHeight ?? 600,
      realWorldWidth: dims?.widthInch ?? 8,
      realWorldHeight: dims?.heightInch ?? 12,
    };
  }, [getCustomizationAreaByName]);

  const getPrintableAreaFromPhoto = useCallback((areaId: string, colorHex?: string, sizeId?: string) => {
    const area = getCustomizationAreaByName(areaId);
    const canvasConfig = getCanvasConfig(areaId, colorHex);
    const fallback = { x: 0, y: 0, width: canvasConfig.width, height: canvasConfig.height };
    if (!area?.designCanvasPhotos?.length) return fallback;

    const targetColor = colorHex || activeColor;
    const targetSize  = sizeId   || activeSize;

    let photo = area.designCanvasPhotos.find((p: any) => {
      if (productData?.size_Images && targetSize)
        return p?.photoColor?.toLowerCase() === targetSize.toLowerCase();
      if (productData?.color_Images && targetColor) {
        const pc = p?.photoColor?.toLowerCase() || '';
        return pc === targetColor.toLowerCase() || pc === `${targetColor.toLowerCase()}-aop`;
      }
      return false;
    })
      ?? area.designCanvasPhotos.find((p: any) => ['#ffffff', 'white'].includes(p?.photoColor?.toLowerCase() || ''))
      ?? area.designCanvasPhotos[0];

    if (!photo?.printAreaCoord) return fallback;
    const coord = photo.printAreaCoord;
    const isNorm = coord.x <= 1 && coord.y <= 1 && coord.width <= 1 && coord.height <= 1;
    return {
      x: coord.x * canvasConfig.width,
      y: coord.y * canvasConfig.height,
      width: (isNorm ? coord.width : coord.width) * canvasConfig.width,
      height: (isNorm ? coord.height : coord.height) * canvasConfig.height,
    };
  }, [getCustomizationAreaByName, getCanvasConfig, activeColor, activeSize, productData]);

  const getSurfaceConfiguration = useCallback(() => {
    const type = productData?.productType?.toLowerCase() || '';
    if (['mug', 'bottle', 'tumbler'].some(t => type.includes(t))) return { renderType: 'cylindrical' as const };
    if (['hat', 'cap'].some(t => type.includes(t))) return { renderType: 'conical' as const };
    return { renderType: 'flat' as const };
  }, [productData]);

  const shouldSkipMockupGeneration = useCallback((): boolean => {
    if (productData?.surfConf?.No_Mockup_Compatible === true) return true;
    const tech = getCurrentTechnology();
    return ['embroidery', 'vinyl/heat transfer'].includes(tech?.technologyName?.toLowerCase().trim() || '');
  }, [productData, getCurrentTechnology]);

  const isProductMockupCompatible = useCallback((): boolean =>
    !productData?.surfConf?.No_Mockup_Compatible, [productData]);

  const getAllCanvasConfigs = useMemo(() => {
    const cfg: Record<string, any> = {};
    availableAreas.forEach(a => { cfg[a] = getCanvasConfig(a); });
    return cfg;
  }, [availableAreas, getCanvasConfig]);

  const getAllPrintableAreas = useMemo(() => {
    const areas: Record<string, any> = {};
    availableAreas.forEach(a => { areas[a] = getPrintableAreaFromPhoto(a); });
    return areas;
  }, [availableAreas, getPrintableAreaFromPhoto]);

  const getAreaDisplayData = useCallback((areaId: string) => {
    const tech = getCurrentTechnology();
    const custArea = tech?.custAreas?.find((a: any) => a.areaName?.toLowerCase() === areaId.toLowerCase());
    return {
      id: areaId,
      displayName: custArea?.areaName || areaId.charAt(0).toUpperCase() + areaId.slice(1),
      designCanvasPhotos: custArea?.designCanvasPhotos || [],
    };
  }, [getCurrentTechnology]);

  // ── DPI calculation ───────────────────────────────────────────────────────
  const calculateDPI = useCallback((element: DesignElement) => {
    if (!element.image || !element.originalImageWidth || !element.originalImageHeight)
      return { dpi: 0, quality: 'Poor' as const, color: 'text-red-600' };
    const cfg = getCanvasConfig(activeArea);
    const wInches = (element.width  / cfg.width)  * cfg.realWorldWidth;
    const hInches = (element.height / cfg.height) * cfg.realWorldHeight;
    const dpi = Math.round(Math.min(element.originalImageWidth / wInches, element.originalImageHeight / hInches));
    const tech = getCurrentTechnology();
    const min = tech?.printingConstraints?.dpiRequirements?.minimum    ?? 150;
    const rec = tech?.printingConstraints?.dpiRequirements?.recommended ?? 300;
    if (dpi >= rec) return { dpi, quality: 'Excellent' as const, color: 'text-green-600' };
    if (dpi >= min) return { dpi, quality: 'Good'      as const, color: 'text-yellow-600' };
    return       { dpi, quality: 'Poor'      as const, color: 'text-red-600' };
  }, [activeArea, getCanvasConfig, getCurrentTechnology]);

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const designHook = useDesignElements({
    activeArea, activeColor, activeSize,
    getCanvasConfig, getPrintableAreaFromPhoto,
    onElementsChanged: () => {},
  });

  const pricingHook = usePricing({
    designElements: designHook.designElements,
    activeTechnology, activeColor, activeArea, productData,
    availableAreas, getCanvasConfig, getPrintableAreaFromPhoto,
    getCustomizationAreaByName, getCurrentTechnology, calculateDPI,
  });

  const allMockups = useMemo(() => extractAllMockupsFromPayload(productData), [productData]);

  const mockupCalculation = useMemo(() => {
    if (!selectedColors.length || !selectedSizes.length) return null;
    return calculateTotalMockups(productData, selectedColors, selectedSizes, activeTechnology);
  }, [productData, selectedColors, selectedSizes, activeTechnology]);

  const mockupGenerator = useMemo(() => new EnhancedMockupGenerator(), []);

  // Wrappers so useStoreImport gets real implementations
  const extractDesignImagesCb = useCallback(() =>
    extractDesignImagesUtil(designHook.designElements, getCanvasConfig, getPrintableAreaFromPhoto),
    [designHook.designElements, getCanvasConfig, getPrintableAreaFromPhoto]
  );

  const exportAllCanvasImagesCb = useCallback(async () =>
    exportAllCanvasImagesUtil(
      designHook.designElements, activeColor, designHook.canvasImages,
      getCanvasConfig, getPrintableAreaFromPhoto, getCustomizationAreaByName, calculateDPI
    ),
    [designHook.designElements, activeColor, designHook.canvasImages, getCanvasConfig, getPrintableAreaFromPhoto, getCustomizationAreaByName, calculateDPI]
  );

  const generateDetailedAreaAnalysisCb = useCallback((pricingData: any) =>
    generateDetailedAreaAnalysisUtil(
      pricingData, designHook.designElements, availableAreas,
      getCanvasConfig, getPrintableAreaFromPhoto, calculateDPI,
      pricingHook.calculateElementRealWorldDimensions
    ),
    [designHook.designElements, availableAreas, getCanvasConfig, getPrintableAreaFromPhoto, calculateDPI, pricingHook.calculateElementRealWorldDimensions]
  );

  const storeImportHook = useStoreImport({
    productData, activeTechnology, selectedColors, selectedSizes,
    allMockups, designElements: designHook.designElements,
    getAllCanvasConfigs, getAllPrintableAreas, mockupCalculation,
    hasDesignElements: designHook.hasDesignElements,
    getCurrentTechnology, getVisibleDesignElements: designHook.getVisibleDesignElements,
    getSurfaceConfiguration, extractDesignImages: extractDesignImagesCb,
    exportAllCanvasImages: exportAllCanvasImagesCb,
    calculateTotalPricing: pricingHook.calculateTotalPricing,
    generateDetailedAreaAnalysis: generateDetailedAreaAnalysisCb,
    mockupGenerator, navigate, shouldSkipMockupGeneration,
  });

  // ── Layer info for LayersPanel ────────────────────────────────────────────
  const getLayersInfo = useCallback((): LayerInfo[] => {
    const elements   = designHook.designElements[activeArea] || [];
    const canvasConfig = getCanvasConfig(activeArea);
    return elements
      .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
      .map(element => {
        const dpiInfo    = calculateDPI(element);
        const wInches    = (element.width  / canvasConfig.width)  * canvasConfig.realWorldWidth;
        const hInches    = (element.height / canvasConfig.height) * canvasConfig.realWorldHeight;
        return {
          element: { ...element, layerName: element.imageName || element.text || `Layer ${element.id.slice(-4)}`, visible: element.visible !== false, locked: element.locked || false },
          dpi: dpiInfo.dpi,
          printQuality: dpiInfo.quality,
          printQualityColor: dpiInfo.color,
          dimensions: { widthInches: wInches, heightInches: hInches, widthUnits: element.width / canvasConfig.width, heightUnits: element.height / canvasConfig.height },
        };
      });
  }, [designHook.designElements, activeArea, calculateDPI, getCanvasConfig]);

  // ── Mockup dimension helper ───────────────────────────────────────────────
  const getMockupDimensions = (mockup: DynamicMockupPhoto, type: 'thumbnail' | 'mockup') =>
    type === 'thumbnail'
      ? { width: mockup.tmbwidthpx || 220,  height: mockup.tmbhigtpx || 220 }
      : { width: mockup.mocwidthpx || 500,  height: mockup.mochigtpx || 500 };

  const determineRequiredEngine = useCallback((mockup: DynamicMockupPhoto): 'canvas' | 'pixi' => {
    if (mockup.render?.pfEngine === 'canvas') return 'canvas';
    if (mockup.render?.pfEngine === 'pixi')   return 'pixi';
    const type = productData?.productType?.toLowerCase() || '';
    if (['shirt','tee','apparel','hoodie','tank','clothing'].some(t => type.includes(t))) return 'canvas';
    const hasPixi = !!(
      mockup.dispMaps?.length || mockup.alpMasks?.length || mockup.light?.length ||
      mockup.area?.some(a => a.surfaceWrapSettings?.enableWrap || a.perspectiveSettings?.enablePerspective || a.fbrc?.enableFabricBlend || a.Config?.enableMasking) ||
      mockup.render?.enableAdvancedEffects
    );
    return hasPixi ? 'pixi' : 'canvas';
  }, [productData]);

  // ── Color management ──────────────────────────────────────────────────────
  const handleColorChange = useCallback((colorHex: string, colorName: string) => {
    const isAlreadySelected = selectedColors.some(c => c.value === colorHex);
    if (isAlreadySelected) {
      if (selectedColors.length === 1) return;
      setVariantLimitWarning(null);
      setSelectedColors(prev => prev.filter(c => c.value !== colorHex));
      if (activeColor === colorHex) {
        const next = selectedColors.find(c => c.value !== colorHex);
        if (next) { setHighlightedColor(next.value); startTransition(() => setActiveColor(next.value)); }
      }
    } else {
      const projected = calculateProjectedVariants([...selectedColors, { name: colorName, value: colorHex }], selectedSizes);
      if (projected > VARIANT_HARD_LIMIT) {
        setVariantLimitWarning(`Adding "${colorName}" would create ${projected} variants — limit is ${VARIANT_HARD_LIMIT}.`);
        return;
      }
      setVariantLimitWarning(null);
      setSelectedColors(prev => [...prev, { name: colorName, value: colorHex }]);
      setHighlightedColor(colorHex);
      startTransition(() => setActiveColor(colorHex));
    }
  }, [selectedColors, selectedSizes, activeColor]);

  const handlePreviewColorClick = useCallback((colorValue: string) => {
    setHighlightedColor(colorValue);
    startTransition(() => setActiveColor(colorValue));
  }, []);

  const removeColor = useCallback((colorHex: string) => {
    if (selectedColors.length <= 1) return;
    setVariantLimitWarning(null);
    setSelectedColors(prev => prev.filter(c => c.value !== colorHex));
    if (activeColor === colorHex) {
      const next = selectedColors.find(c => c.value !== colorHex);
      if (next) setActiveColor(next.value);
    }
  }, [selectedColors, activeColor]);

  const toggleSizeSelection = useCallback((sizeName: string) => {
    const isSelected = selectedSizes.includes(sizeName);
    if (isSelected) {
      if (selectedSizes.length === 1) return;
      setSelectedSizes(prev => prev.filter(s => s !== sizeName));
      if (activeSize === sizeName) {
        const remaining = selectedSizes.filter(s => s !== sizeName);
        if (remaining.length > 0) setActiveSize(remaining[0]);
      }
    } else {
      setSelectedSizes(prev => [...prev, sizeName]);
      setActiveSize(sizeName);
    }
  }, [selectedSizes, activeSize]);

  const handleTechnologyChange = useCallback((newTechId: string) => {
    setActiveTechnology(newTechId);
    pricingHook.clearPricing();
    const newAreas = getAvailableAreas();
    if (!newAreas.includes(activeArea) && newAreas.length > 0) setActiveArea(newAreas[0]);
    setTimeout(() => {
      if (Object.values(designHook.designElements).some(els => els.some(el => el.visible !== false)))
        pricingHook.updatePricingData();
    }, 800);
  }, [activeTechnology, getAvailableAreas, activeArea, designHook.designElements, pricingHook]);

  // ── Alignment panel drag ──────────────────────────────────────────────────
  const handlePanelDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-drag-handle]')) return;
    e.preventDefault(); e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const left = panelRef.current ? parseFloat(panelRef.current.style.left || '0') : alignmentPanelPos.x;
    const top  = panelRef.current ? parseFloat(panelRef.current.style.top  || '0') : alignmentPanelPos.y;
    dragStartRef.current = { x: clientX, y: clientY, panelX: left, panelY: top };
    setIsDraggingPanel(true);
  }, [alignmentPanelPos]);

  const handlePanelDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingPanel) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const newX = Math.max(16, Math.min(dragStartRef.current.panelX + clientX - dragStartRef.current.x, window.innerWidth  - (panelRef.current?.offsetWidth  || 250) - 16));
    const newY = Math.max(16, Math.min(dragStartRef.current.panelY + clientY - dragStartRef.current.y, window.innerHeight - (panelRef.current?.offsetHeight || 200) - 16));
    if (panelRef.current) { panelRef.current.style.left = `${newX}px`; panelRef.current.style.top = `${newY}px`; }
    setAlignmentPanelPos({ x: newX, y: newY });
  }, [isDraggingPanel]);

  const handlePanelDragEnd = useCallback(() => setIsDraggingPanel(false), []);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => { setIsMobile(window.innerWidth < 768); setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024); };
    check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    _renderCache.clear();
    const hasVisible = Object.values(designHook.designElements).some(els => els.some(el => el.visible !== false));
    if (hasVisible) { const id = setTimeout(() => pricingHook.updatePricingData(), 300); return () => clearTimeout(id); }
    else pricingHook.clearPricing();
  }, [designHook.designElements, activeTechnology]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && designHook.selectedId) designHook.deleteSelectedElement();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [designHook.selectedId, designHook.deleteSelectedElement]);

  useEffect(() => {
    const t = transformerRef.current; const l = layerRef.current;
    if (!t || !l) return;
    if (designHook.selectedId) {
      const node = l.findOne(`#${designHook.selectedId}`);
      if (node) { t.nodes([node as Konva.Node]); t.getLayer()?.batchDraw(); } else t.nodes([]);
    } else { t.nodes([]); t.getLayer()?.batchDraw(); }
  }, [designHook.selectedId, designHook.designElements, activeArea, isMobile]);

  useEffect(() => {
    designHook.setDesignElements(prev => {
      const next = { ...prev }; let changed = false;
      availableAreas.forEach(area => { if (!next[area]) { next[area] = []; changed = true; } });
      return changed ? next : prev;
    });
  }, [availableAreas]);

  useEffect(() => {
    const currentAreas = getAvailableAreas();
    if (!currentAreas.includes(activeArea) && currentAreas.length > 0) setActiveArea(currentAreas[0]);
  }, [activeTechnology]);

  useEffect(() => { if (activeView === 'preview') setUserSelectedMockupInPreview(false); }, [activeView]);

  useEffect(() => {
    if (selectedSizes.length > 0 && !selectedSizes.includes(activeSize)) setActiveSize(selectedSizes[0]);
  }, [selectedSizes]);

  useEffect(() => {
    if (isDraggingPanel) {
      document.addEventListener('mousemove', handlePanelDragMove, { capture: true });
      document.addEventListener('mouseup',   handlePanelDragEnd,  { capture: true });
      document.addEventListener('touchmove', handlePanelDragMove, { capture: true, passive: false });
      document.addEventListener('touchend',  handlePanelDragEnd,  { capture: true });
      document.body.style.userSelect = 'none';
      return () => {
        document.removeEventListener('mousemove', handlePanelDragMove, { capture: true });
        document.removeEventListener('mouseup',   handlePanelDragEnd,  { capture: true });
        document.removeEventListener('touchmove', handlePanelDragMove, { capture: true });
        document.removeEventListener('touchend',  handlePanelDragEnd,  { capture: true });
        document.body.style.userSelect = '';
      };
    }
  }, [isDraggingPanel, handlePanelDragMove, handlePanelDragEnd]);

  // Auto-load canvas images when color/size/area changes
  useEffect(() => {
    const loadAllAreaImages = async () => {
      const technology = getCurrentTechnology();
      if (!technology?.custAreas?.length) return;
      for (const area of availableAreas) {
        try {
          const custArea = getCustomizationAreaByName(area);
          if (!custArea?.designCanvasPhotos?.length) continue;
          let photo = custArea.designCanvasPhotos.find((p: any) => {
            if (productData?.size_Images && activeSize) return p?.photoColor?.toLowerCase() === activeSize.toLowerCase();
            return p?.photoColor?.toLowerCase() === activeColor.toLowerCase();
          }) ?? custArea.designCanvasPhotos.find((p: any) => ['#ffffff', 'white'].includes(p?.photoColor?.toLowerCase() || ''))
            ?? custArea.designCanvasPhotos[0];
          if (!photo?.photo?.url) continue;
          const img = new Image(); img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              const key = productData?.size_Images ? `${area}_${activeSize}` : productData?.color_Images ? `${area}_${activeColor}` : area;
              designHook.setCanvasImages(prev => ({ ...prev, [key]: img, [area]: img }));
              resolve();
            };
            img.onerror = reject;
            img.src = resolveImageUrl(photo.photo.url);
          });
        } catch {}
      }
    };
    loadAllAreaImages();
  }, [activeColor, activeSize, activeTechnology, availableAreas]);

  // Auto-select hero mockup based on active color/area
  useEffect(() => {
    if (!allMockups.length || !activeColor || !activeArea) return;
    setHighlightedColor(activeColor);
    if (userSelectedMockupInPreview && activeView === 'preview') return;
    const colorMockups = getMockupsForColor(productData, activeColor, activeTechnology, productData?.size_Images ? activeSize : undefined);
    const areaSpecific = colorMockups.filter(m => m.area?.some(a => a.areaName?.toLowerCase() === activeArea.toLowerCase()));
    const best = areaSpecific[0] || colorMockups[0];
    if (best) setSelectedHeroMockup(best);
  }, [activeColor, activeArea, allMockups, productData, activeTechnology, activeSize, userSelectedMockupInPreview, activeView]);

  useEffect(() => {
  if (designHook.selectedId) {
    const el = designHook.designElements[activeArea]?.find(e => e.id === designHook.selectedId);
    if (el?.realWorldDimensions) {
      setCustomWidth(el.realWorldDimensions.widthInches.toFixed(2));
      setCustomHeight(el.realWorldDimensions.heightInches.toFixed(2));
    }
    // Reset panel position when element selected, keeping it on-screen
    if (prevSelectedIdRef.current !== designHook.selectedId) {
      const panelW = isMobile ? 260 : 250;
      const panelH = isMobile ? 160 : 200;
      const safeX = Math.max(8, Math.min(window.innerWidth  - panelW - 8, isMobile ? (window.innerWidth  - panelW) / 2 : 500));
      const safeY = Math.max(8, Math.min(window.innerHeight - panelH - 8, isMobile ? window.innerHeight * 0.35 : 320));
      setAlignmentPanelPos({ x: safeX, y: safeY });
      if (panelRef.current) {
        panelRef.current.style.left = `${safeX}px`;
        panelRef.current.style.top  = `${safeY}px`;
      }
    }
  } else {
    setCustomWidth('');
    setCustomHeight('');
  }
  prevSelectedIdRef.current = designHook.selectedId;
}, [designHook.selectedId, activeArea, designHook.designElements, isMobile]);

// Close alignment panel when clicking outside it
useEffect(() => {
  if (!designHook.selectedId) return;

  const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
    const target = e.target as Node;

    // Don't close if clicking inside the panel itself
    if (panelRef.current?.contains(target)) return;

    // Don't close if clicking inside the Konva stage canvas
    // (Konva handles its own click → setSelectedId(null) already)
    const stageCanvas = stageRef.current?.container();
    if (stageCanvas?.contains(target)) return;

    // Anything else (sidebar, thumbnails, header, etc.) → deselect
    designHook.setSelectedId(null);
  };

  // Use capture phase so it fires before other handlers
  document.addEventListener('mousedown', handleOutsideClick, true);
  document.addEventListener('touchstart', handleOutsideClick, { capture: true, passive: true });

  return () => {
    document.removeEventListener('mousedown', handleOutsideClick, true);
    document.removeEventListener('touchstart', handleOutsideClick, { capture: true });
  };
}, [designHook.selectedId, designHook.setSelectedId]);

  // ── renderDesignElements ──────────────────────────────────────────────────
  const renderDesignElements = useCallback((areaId: string) => {
    const elements = designHook.designElements[areaId] || [];
    return elements
      .filter(el => el.visible !== false)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      .map(element => {
        const isLocked = element.locked || false;
        if (element.type === 'image' && element.image) {
          return (
            <KonvaImage
              key={element.id} id={element.id} image={element.image}
              x={element.x + element.width / 2} y={element.y + element.height / 2}
              offsetX={element.width / 2} offsetY={element.height / 2}
              width={element.width} height={element.height}
              rotation={element.rotation} scaleX={element.scaleX} scaleY={element.scaleY}
              draggable={element.draggable && !isLocked} opacity={element.opacity || 1} listening={!isLocked}
              onClick={() => !isLocked && designHook.setSelectedId(element.id)}
              onTap={() => !isLocked && designHook.setSelectedId(element.id)}
              onDragEnd={e => {
                if (isLocked) return;
                designHook.setDesignElements(prev => {
                  const updated = { ...prev };
                  if (updated[areaId]) updated[areaId] = updated[areaId].map(el => el.id === element.id ? { ...el, x: e.target.x() - element.width / 2, y: e.target.y() - element.height / 2 } : el);
                  return updated;
                });
                setTimeout(() => pricingHook.updatePricingData(), 100);
              }}
              onTransformEnd={e => {
                if (isLocked) return;
                const node = e.target;
                const newW = Math.max(10, node.width()  * node.scaleX());
                const newH = Math.max(10, node.height() * node.scaleY());
                designHook.setDesignElements(prev => {
                  const updated = { ...prev };
                  if (updated[areaId]) updated[areaId] = updated[areaId].map(el => el.id === element.id ? { ...el, x: node.x() - newW / 2, y: node.y() - newH / 2, rotation: node.rotation(), width: newW, height: newH, scaleX: 1, scaleY: 1 } : el);
                  return updated;
                });
                node.scaleX(1); node.scaleY(1);
                setTimeout(() => pricingHook.updatePricingData(), 150);
              }}
            />
          );
        }
        if (element.type === 'text') {
          return (
            <KonvaText
              key={element.id} id={element.id} text={element.text || 'Text'}
              x={element.x + element.width / 2} y={element.y + (element.height || element.fontSize || 20) / 2}
              offsetX={element.width / 2} offsetY={(element.height || element.fontSize || 20) / 2}
              width={element.width} fontSize={element.fontSize || 20}
              fontFamily={element.fontFamily || 'Arial'} fill={element.fill || '#000000'}
              rotation={element.rotation} scaleX={element.scaleX} scaleY={element.scaleY}
              draggable={element.draggable && !isLocked} opacity={element.opacity || 1} listening={!isLocked}
              onClick={() => !isLocked && designHook.setSelectedId(element.id)}
              onDragEnd={e => {
                designHook.setDesignElements(prev => {
                  const updated = { ...prev };
                  if (updated[areaId]) updated[areaId] = updated[areaId].map(el => el.id === element.id ? { ...el, x: e.target.x() - element.width / 2, y: e.target.y() - (element.height || element.fontSize || 20) / 2 } : el);
                  return updated;
                });
              }}
              onTransformEnd={e => {
                const node = e.target;
                designHook.setDesignElements(prev => {
                  const updated = { ...prev };
                  if (updated[areaId]) updated[areaId] = updated[areaId].map(el => el.id === element.id ? { ...el, x: node.x() - element.width / 2, y: node.y() - (element.height || element.fontSize || 20) / 2, rotation: node.rotation(), scaleX: node.scaleX(), scaleY: node.scaleY() } : el);
                  return updated;
                });
              }}
            />
          );
        }
        return null;
      });
  }, [designHook.designElements, designHook.selectedId, pricingHook.updatePricingData]);

  // ── renderCanvas ──────────────────────────────────────────────────────────
  const renderCanvas = useCallback(() => {
    const canvasConfig  = getCanvasConfig(activeArea, activeColor);
    const printableArea = getPrintableAreaFromPhoto(activeArea, activeColor, activeSize);
    const cacheKey      = productData?.size_Images ? `${activeArea}_${activeSize}` : productData?.color_Images ? `${activeArea}_${activeColor}` : activeArea;
    const canvasImage   = designHook.canvasImages[cacheKey] || designHook.canvasImages[activeArea];
    const surfaceConfig = getSurfaceConfiguration();

    const isAOPProduct = (() => {
      try {
        const area = getCustomizationAreaByName(activeArea);
        return area?.designCanvasPhotos?.some((p: any) => p?.photoColor?.toLowerCase().includes('-aop')) ?? false;
      } catch { return false; }
    })();

    const baseWidth   = canvasConfig.width;
    const baseHeight  = canvasConfig.height;
    const maxWidth    = isMobile ? window.innerWidth - 40 : baseWidth;
    const maxHeight   = isMobile ? window.innerHeight * 0.6 : baseHeight;
    const scale       = Math.min(maxWidth / baseWidth, maxHeight / baseHeight, 1);
    const displayW    = baseWidth  * scale;
    const displayH    = baseHeight * scale;

    return (
      <div className="relative">
        <Stage
          ref={stageRef} width={displayW} height={displayH} scaleX={scale} scaleY={scale}
          onClick={e => { if (e.target === e.target.getStage()) designHook.setSelectedId(null); }}
          onTap={e => { if (e.target === e.target.getStage()) designHook.setSelectedId(null); }}
          className="bg-white border border-none rounded-lg shadow-sm touch-manipulation"
        >
          {isAOPProduct ? (
            <>
              <Layer><Rect x={0} y={0} width={canvasConfig.width} height={canvasConfig.height} fill={activeColor} listening={false} /></Layer>
              <Layer ref={layerRef}>
                <Group clipFunc={ctx => { ctx.beginPath(); ctx.rect(printableArea.x, printableArea.y, printableArea.width, printableArea.height); ctx.closePath(); }}>
                  {renderDesignElements(activeArea)}
                </Group>
              </Layer>
              {canvasImage && <Layer><KonvaImage image={canvasImage} x={0} y={0} width={canvasConfig.width} height={canvasConfig.height} listening={false} /></Layer>}
              <Layer><Rect x={printableArea.x} y={printableArea.y} width={printableArea.width} height={printableArea.height} stroke={BRAND} strokeWidth={2} dash={[6, 4]} listening={false} /></Layer>
            </>
          ) : (
            <>
              <Layer><Rect x={0} y={0} width={canvasConfig.width} height={canvasConfig.height} fill={activeColor} listening={false} /></Layer>
              {canvasImage && (
                <>
                  <Layer><KonvaImage image={canvasImage} x={0} y={0} width={canvasConfig.width} height={canvasConfig.height} listening={false} /></Layer>
                  <Layer><KonvaImage image={canvasImage} x={0} y={0} width={canvasConfig.width} height={canvasConfig.height} opacity={0.08} globalCompositeOperation="multiply" listening={false} /></Layer>
                </>
              )}
              <Layer><Rect x={printableArea.x} y={printableArea.y} width={printableArea.width} height={printableArea.height} stroke={BRAND} strokeWidth={2} dash={[6, 4]} listening={false} /></Layer>
              <Layer ref={layerRef}>
                <Group clipFunc={ctx => { ctx.beginPath(); ctx.rect(printableArea.x, printableArea.y, printableArea.width, printableArea.height); ctx.closePath(); }}>
                  {renderDesignElements(activeArea)}
                </Group>
              </Layer>
            </>
          )}
          <Layer listening={true}>
            <Transformer
              ref={transformerRef} anchorStroke={BRAND} anchorFill="#FFFFFF"
              anchorSize={isMobile ? 12 : 8} borderStroke={BRAND} borderDash={[4, 4]}
              rotateAnchorOffset={25} keepRatio={true}
              boundBoxFunc={(oldBox, newBox) => (newBox.width < 10 || newBox.height < 10) ? oldBox : newBox}
              enabledAnchors={['top-left','top-center','top-right','middle-left','middle-right','bottom-left','bottom-center','bottom-right']}
            />
          </Layer>
        </Stage>

        {/* Image processing overlay */}
        {designHook.isProcessingImage && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', zIndex: 50 }}>
            <div style={{ position: 'relative', width: 52, height: 52 }}>
              <svg width="52" height="52" viewBox="0 0 52 52" style={{ animation: 'spin 1.1s linear infinite' }}>
                <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4"/>
                <circle cx="26" cy="26" r="22" fill="none" stroke="#e65100" strokeWidth="4" strokeDasharray="80 60" strokeLinecap="round"/>
              </svg>
              <Upload size={18} color="white" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'white', fontWeight: 500, fontSize: 14, margin: '0 0 3px' }}>{designHook.imageProcessingStep}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>Large images take a moment</p>
            </div>
            <div style={{ width: 140, height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${designHook.imageProcessingPct}%`, background: '#e65100', borderRadius: 99, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        {/* Alignment panel */}
        {designHook.selectedId && (
          <div
            ref={panelRef}
            className="fixed sm:p-3 px-3 py-0 bg-white border-2 border-orange-500 shadow-xl rounded-xl z-[60]"
            style={{ 
                left: `${alignmentPanelPos.x}px`, 
                top: `${alignmentPanelPos.y}px`, 
                userSelect: 'none', 
                touchAction: 'none', 
                maxWidth: isMobile ? '260px' : '250px',
                width: isMobile ? '260px' : 'auto',
                }}
            onClick={e => e.stopPropagation()}
            onMouseDown={handlePanelDragStart}
            onTouchStart={handlePanelDragStart}
          >
            <div data-drag-handle="true" className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200 cursor-grab hover:bg-gray-50 rounded-t-lg px-2 py-1">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">{[0,1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-gray-400" />)}</div>
                <span className="text-xs font-medium text-gray-500">Drag to move</span>
              </div>
            </div>
            <div className="space-y-0 md:space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 md:flex-col md:gap-0">
                <div className="flex items-center gap-1 md:w-full">
                  <div className="text-xs font-medium text-gray-700">Alignment</div>
                  <div className="grid grid-cols-3 gap-1 ml-1">
                    {[
                      { align: 'left',    title: 'Align left',           d: 'M11 17l-5-5 5-5M6 12h12' },
                      { align: 'hcenter', title: 'Center horizontally',  d: 'M12 4v16M4 12h5M7 9l3 3-3 3M20 12h-5M17 9l-3 3 3 3' },
                      { align: 'right',   title: 'Align right',          d: 'M13 7l5 5-5 5M6 12h12' },
                      { align: 'top',     title: 'Align top',            d: 'M12 11V3m0 0L7 7m5-4 5 4M4 21h16' },
                      { align: 'vcenter', title: 'Center vertically',    d: 'M12 5v5M9 8l3 3 3-3M4 12h16M12 19v-5M9 16l3-3 3 3' },
                      { align: 'bottom',  title: 'Align bottom',         d: 'M12 13v8m0 0l5-4m-5 4-5-4M4 3h16' },
                    ].map(({ align, title, d }) => (
                      <button key={align} onClick={() => designHook.centerElement(align as any)} className="p-2 text-gray-600 rounded-md hover:bg-orange-50 hover:text-orange-600 touch-manipulation" title={title}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} /></svg>
                      </button>
                    ))}
                  </div>
                </div>
                {(() => {
                  const el = designHook.designElements[activeArea]?.find(e => e.id === designHook.selectedId);
                  const rotation = el?.rotation || 0;
                  return (
                    <div className="flex items-center justify-between w-1/2 pt-2 pb-2 border-t border-gray-200 sm:w-full">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <span className="text-xs font-medium text-gray-700">Rotation</span>
                      </div>
                      <span className="text-sm font-semibold text-orange-600">{Math.round(rotation)}°</span>
                    </div>
                  );
                })()}
                <div className="flex items-center gap-2 md:w-full md:pt-3 md:border-t md:border-gray-200">
                  <button onClick={designHook.deleteSelectedElement} className="p-2 text-red-600 rounded-md hover:bg-red-50 touch-manipulation" title="Delete element"><Trash2 size={14} /></button>
                  <button onClick={() => designHook.setSelectedId(null)} className="p-2 text-orange-500 rounded-md hover:bg-orange-50"><X size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, [getCanvasConfig, getPrintableAreaFromPhoto, activeArea, activeColor, activeSize, designHook, renderDesignElements, getSurfaceConfiguration, isMobile, isDraggingPanel, alignmentPanelPos, pricingHook.updatePricingData, handlePanelDragStart, getCustomizationAreaByName, productData]);

  // ── renderPreview ─────────────────────────────────────────────────────────
  const renderPreview = useCallback(() => {
    if (shouldSkipMockupGeneration()) {
      return (
        <div className="flex items-center justify-center h-full mt-4 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 sm:mt-0">
          <div className="w-full max-w-xl px-4">
            <div className="relative overflow-hidden bg-white shadow-xl rounded-2xl">
              <div className="relative p-6">
                <div className="flex justify-center mt-4">
                  <video src={JUNO} autoPlay loop muted playsInline className="object-contain rounded-md w-36 h-36" />
                </div>
                <h2 className="mb-0 text-2xl font-bold text-center text-gray-900">JUNO Will Create Your Mockup</h2>
                <p className="mb-1 text-sm text-center text-gray-600">We don't have the ability to create mockups for this tech, but JUNO does</p>
                <button onClick={() => setActiveView('design')} className="flex items-center justify-center w-full gap-2 px-5 py-3 text-sm font-semibold text-white transition-all rounded-lg hover:shadow-lg" style={{ backgroundColor: '#e65100' }}>
                  <ArrowLeft className="w-4 h-4" /><span>Continue Designing</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!selectedColors.length || !selectedSizes.length) {
      return <div className="flex items-center justify-center h-full"><div className="text-center text-gray-500"><div className="mb-4 text-4xl">🎨</div><p className="font-medium">Select colors and sizes to see preview</p></div></div>;
    }
    if (!allMockups.length) {
      return <div className="flex items-center justify-center h-full"><div className="text-center text-gray-500"><p className="font-medium">No mockups available</p></div></div>;
    }

    const canvasConfigs    = getAllCanvasConfigs;
    const printableAreas   = getAllPrintableAreas;

    const heroMockup = (() => {
      if (selectedHeroMockup) return selectedHeroMockup;
      const heroSize = productData?.size_Images ? activeSize : undefined;
      const colorMockups = getMockupsForColor(productData, activeColor, activeTechnology, heroSize);
      const areaSpecific  = colorMockups.filter(m => m.area?.some(a => a.areaName?.toLowerCase() === activeArea.toLowerCase()));
      return areaSpecific[0] || colorMockups[0] || null;
    })();

    return (
      <div className="flex h-full">
        {/* Desktop thumbnail strip */}
        {!isMobile && (
          <div className="hidden w-56 p-4 bg-white border-r border-gray-200 sm:block overflow-y-auto">
            <div className="space-y-2">
              {(productData?.size_Images
                ? selectedSizes.flatMap(size =>
                    getMockupsForColor(productData, activeColor, activeTechnology, size)
                      .map(m => ({ ...m, _sizeLabel: size }))
                  )
                : getMockupsForColor(productData, activeColor, activeTechnology, undefined)
              ).map((mockup, index) => {
                const isSelected = selectedHeroMockup?.id === mockup.id || (!selectedHeroMockup && index === 0);
                const thumbnailDims = getMockupDimensions(mockup, 'thumbnail');
                const engineType = determineRequiredEngine(mockup);
                const mockupAreaNames = mockup.area?.map((a: any) => a.areaName?.toLowerCase()) || [];
                const filteredElements: Record<string, DesignElement[]> = {};
                mockupAreaNames.forEach((a: string) => { if (designHook.designElements[a]) filteredElements[a] = designHook.designElements[a]; });
                return (
                  <button key={`${mockup.id}-${(mockup as any)._sizeLabel ?? ''}`} onClick={() => {
                      setUserSelectedMockupInPreview(true);
                      setSelectedHeroMockup(mockup);
                      if (productData?.size_Images && (mockup as any)._sizeLabel) {
                        setActiveSize((mockup as any)._sizeLabel);
                      }
                    }}
                    className={`w-full p-2 border rounded-lg transition-all ${isSelected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-none hover:shadow-sm'}`}>
                    <div className="relative mb-2 overflow-hidden rounded bg-white aspect-square">
                      <ThumbnailPreview
                        key={engineType === 'pixi' ? `thumb-${mockup.id}-${activeColor}-${isSelected}` : undefined}
                        mockup={mockup} designElements={designHook.getVisibleDesignElements(filteredElements)}
                        canvasConfigs={canvasConfigs} canvasPrintableAreas={printableAreas}
                        productColor={activeColor} displayDimensions={thumbnailDims}
                        isSelected={isSelected} isMainPreview={false}
                        onSelect={() => { setUserSelectedMockupInPreview(true); setSelectedHeroMockup(mockup); }}
                        productData={productData}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main preview */}
        <div className="flex flex-col flex-1 p-2 overflow-y-auto sm:px-4 sm:pb-2 sm:pt-0">
          <div className="flex items-start justify-center flex-1">
            <div className="flex flex-col items-center gap-4">
              {/* Mobile color circles (above) */}
              {isMobile && productData?.color_Images && (
                <div className="w-[300px]">
                  <div className="flex flex-wrap justify-center gap-3 py-2">
                    {selectedColors.map(color => (
                      <button key={color.value} onClick={() => handlePreviewColorClick(color.value)} title={color.name}>
                        <div className="w-10 h-10 rounded-full border-3 transition-all"
                          style={{ backgroundColor: color.value, borderColor: highlightedColor === color.value ? '#e65100' : '#d1d5db', boxShadow: highlightedColor === color.value ? '0 0 0 4px rgba(230,81,0,0.3)' : undefined }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile size pills (above, shown when size_Images true) */}
              {isMobile && productData?.size_Images && (
                <div className="w-[300px]">
                  <div className="flex flex-wrap justify-center gap-2 py-2">
                    {selectedSizes.map(size => {
                      const isActive = activeSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => setActiveSize(size)}
                          className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 transition-all touch-manipulation ${
                            isActive
                              ? 'bg-orange-500 text-white border-orange-500 ring-2 ring-orange-200'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Main preview image */}
              <div className="relative">
                <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] relative bg-white rounded-lg overflow-hidden">
                  {heroMockup ? (() => {
                    const dims = getMockupDimensions(heroMockup, 'mockup');
                    const engineType = determineRequiredEngine(heroMockup);
                    const mockupAreaNames = heroMockup.area?.map((a: any) => a.areaName?.toLowerCase()) || [];
                    const filteredElements: Record<string, DesignElement[]> = {};
                    mockupAreaNames.forEach((a: string) => { if (designHook.designElements[a]) filteredElements[a] = designHook.designElements[a]; });
                    return (
                      <ThumbnailPreview
                        key={engineType === 'pixi' ? `main-${heroMockup.id}-${activeColor}` : undefined}
                        mockup={heroMockup} designElements={designHook.getVisibleDesignElements(filteredElements)}
                        canvasConfigs={canvasConfigs} canvasPrintableAreas={printableAreas}
                        productColor={activeColor} displayDimensions={dims}
                        isMainPreview={true} isSelected={true} onSelect={() => {}} productData={productData}
                      />
                    );
                  })() : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                      <p className="text-sm">No preview for {activeColor}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop color circles (below) */}
              {!isMobile && productData?.color_Images && (
                <div className="w-[400px]">
                  <div className="flex flex-wrap justify-center gap-3 py-0">
                    {selectedColors.map(color => {
                      const isLight = isLightColor(color.value);
                      const isActive = highlightedColor === color.value;
                      return (
                        <button key={color.value} onClick={() => handlePreviewColorClick(color.value)} title={color.name} className="flex flex-col items-center group">
                          <div className="w-10 h-10 rounded-full transition-all transform hover:scale-110 shadow-md"
                            style={{ backgroundColor: color.value, border: isActive ? `3px solid #e65100` : isLight ? '2px solid #9ca3af' : '2px solid #d1d5db', boxShadow: isActive ? '0 0 0 4px rgba(230,81,0,0.3)' : undefined, transform: isActive ? 'scale(1.1)' : undefined }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Desktop size pills (below, shown when size_Images true) */}
              {!isMobile && productData?.size_Images && (
                <div className="w-[400px]">
                  <div className="flex flex-wrap justify-center gap-2 py-2">
                    {selectedSizes.map(size => {
                      const isActive = activeSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => setActiveSize(size)}
                          className={`px-4 py-1.5 text-sm font-semibold rounded-lg border-2 transition-all touch-manipulation ${
                            isActive
                              ? 'bg-orange-500 text-white border-orange-500 ring-2 ring-orange-200 scale-105'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:scale-105'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mobile mockup thumbnails (below) */}
              {isMobile && productData?.color_Images && (
                <div className="w-[300px]">
                  <div className="flex gap-3 pb-2 overflow-x-auto">
                    {getMockupsForColor(productData, activeColor, activeTechnology, productData?.size_Images ? activeSize : undefined).map((mockup, index) => {
                      const isSelected = selectedHeroMockup?.id === mockup.id || (!selectedHeroMockup && index === 0);
                      const thumbnailDims = getMockupDimensions(mockup, 'thumbnail');
                      const engineType = determineRequiredEngine(mockup);
                      const mockupAreaNames = mockup.area?.map((a: any) => a.areaName?.toLowerCase()) || [];
                      const filteredElements: Record<string, DesignElement[]> = {};
                      mockupAreaNames.forEach((a: string) => { if (designHook.designElements[a]) filteredElements[a] = designHook.designElements[a]; });
                      return (
                        <div key={mockup.id} className="flex-shrink-0">
                          <button onClick={() => {
                              setUserSelectedMockupInPreview(true);
                              setSelectedHeroMockup(mockup);
                              if (productData?.size_Images && (mockup as any)._sizeLabel) {
                                setActiveSize((mockup as any)._sizeLabel);
                              }
                            }}
                            className={`w-20 h-20 p-1 border rounded-lg touch-manipulation ${isSelected ? 'border-orange-500' : 'border-none'}`}>
                            <div className="relative w-full h-full overflow-hidden bg-gray-100 rounded">
                              <ThumbnailPreview
                                key={engineType === 'pixi' ? `mob-${mockup.id}-${activeColor}` : undefined}
                                mockup={mockup} designElements={designHook.getVisibleDesignElements(filteredElements)}
                                canvasConfigs={canvasConfigs} canvasPrintableAreas={printableAreas}
                                productColor={activeColor} displayDimensions={thumbnailDims}
                                isSelected={isSelected} isMainPreview={false}
                                onSelect={() => { setUserSelectedMockupInPreview(true); setSelectedHeroMockup(mockup); }}
                                productData={productData}
                              />
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }, [shouldSkipMockupGeneration, selectedColors, selectedSizes, allMockups, getAllCanvasConfigs, getAllPrintableAreas, selectedHeroMockup, activeColor, activeSize, activeArea, activeTechnology, isMobile, highlightedColor, productData, designHook, handlePreviewColorClick, determineRequiredEngine, getMockupDimensions]);

  // ── renderTechnologySelector ──────────────────────────────────────────────
  const renderTechnologySelector = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium tracking-wider text-gray-500 uppercase">Current Technology</label>
        <span className="px-2 py-1 text-xs font-medium text-white rounded" style={{ backgroundColor: BRAND }}>Active</span>
      </div>
      <select value={activeTechnology} onChange={e => handleTechnologyChange(e.target.value)}
        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 touch-manipulation"
        disabled={pricingHook.priceCalculationLoading}>
        {productData?.printT?.map((tech: any) => (
          <option key={tech.id} value={tech.id}>{tech.technologyName.toUpperCase()}</option>
        ))}
      </select>
      {pricingHook.priceCalculationLoading && (
        <div className="flex items-center gap-2 text-xs text-orange-600">
          <div className="w-3 h-3 border-b-2 border-orange-500 rounded-full animate-spin" />
          <span>Updating pricing...</span>
        </div>
      )}
    </div>
  );

  // ── renderPricingPanel ────────────────────────────────────────────────────
  const renderPricingPanel = () => {
    if (!pricingHook.pricingBreakdown) {
      return (
        <div className="space-y-4">
          <div className="p-8 text-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-orange-50">
              <Calculator className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">Pricing Calculator</h3>
            <p className="text-sm text-gray-600">Add design elements to see pricing breakdown</p>
          </div>
        </div>
      );
    }
    const { areas, priceBreakdown } = pricingHook.pricingBreakdown;
    return (
      <div className="space-y-4">
        <div className="relative p-5 overflow-hidden border-2 border-green-300 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Final Price per Unit</span>
              <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                <CheckCircle size={12} /> Ready
              </div>
            </div>
            <div className="text-3xl font-bold text-green-800">₹{priceBreakdown.finalPrice}</div>
            <p className="mt-1 text-xs text-green-600">Technology: {getCurrentTechnology()?.technologyName || activeTechnology}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-orange-50">
            <div className="flex items-center gap-2 mb-1"><Layers size={14} className="text-orange-600" /><span className="text-xs font-medium text-orange-700">Elements</span></div>
            <div className="text-xl font-bold text-orange-800">{pricingHook.pricingBreakdown.totalElements}</div>
          </div>
          <div className="p-3 rounded-lg bg-orange-50">
            <div className="flex items-center gap-2 mb-1"><Ruler size={14} className="text-orange-600" /><span className="text-xs font-medium text-orange-700">Design Size</span></div>
            {(() => {
              const ap = pricingHook.pricingBreakdown?.areas?.[activeArea];
              if (ap?.consumedWidth && ap?.consumedHeight) {
                return <div className="text-base font-bold text-orange-800">{ap.consumedWidth}" × {ap.consumedHeight}"</div>;
              }
              return <div className="text-base font-bold text-orange-800">0"</div>;
            })()}
          </div>
        </div>

        <div className="p-4 space-y-3 bg-white border-2 border-gray-200 rounded-xl">
          <div className="flex items-center gap-2 pb-2 border-b"><IndianRupee size={16} className="text-gray-700" /><h4 className="text-sm font-semibold text-gray-800">Cost Breakdown</h4></div>
          <div className="space-y-2 text-sm">
            <div className="p-2 space-y-1 rounded bg-orange-50">
              <div className="flex justify-between font-medium text-orange-800"><span>Base Printing</span><span>₹{priceBreakdown.basePrintingCost}</span></div>
              {(priceBreakdown.printingGSTAmount || 0) > 0 && <div className="flex justify-between pl-4 text-xs text-orange-600"><span>+ GST</span><span>₹{priceBreakdown.printingGSTAmount?.toFixed(2)}</span></div>}
            </div>
            <div className="p-2 rounded bg-orange-50">
              <div className="flex justify-between font-medium text-orange-800"><span>Blank Product</span><span>₹{priceBreakdown.blankProductCost}</span></div>
              {(priceBreakdown.productGSTAmount || 0) > 0 && <div className="flex justify-between pl-4 text-xs text-orange-600"><span>+ GST</span><span>₹{priceBreakdown.productGSTAmount?.toFixed(2)}</span></div>}
            </div>
            {(priceBreakdown.shippingCharges || 0) > 0 && <div className="flex justify-between p-2 text-gray-700 rounded bg-gray-50"><span>Shipping</span><span>₹{priceBreakdown.shippingCharges}</span></div>}
            <div className="flex justify-between pt-3 text-base font-bold text-green-800 border-t-2 border-green-300"><span>Total per Unit</span><span>₹{priceBreakdown.finalPrice}</span></div>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 border border-orange-200 rounded-lg bg-orange-50">
          <Info size={14} className="flex-shrink-0 mt-0.5 text-orange-600" />
          <p className="text-xs text-orange-700">Pricing updates automatically when you modify designs.</p>
        </div>
      </div>
    );
  };

  // ── renderUploadPanel ─────────────────────────────────────────────────────
  const renderUploadPanel = () => (
    <div className="space-y-4 sm:space-y-6">
      <div
        onDrop={designHook.handleDrop} onDragOver={designHook.handleDragOver} onDragLeave={designHook.handleDragLeave}
        className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${designHook.isDragging ? 'border-orange-400 bg-orange-50' : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50/30'}`}
      >
        <div className="p-8 text-center sm:py-12 sm:px-8">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${designHook.isDragging ? 'bg-orange-100' : 'bg-gray-100'}`}>
            <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${designHook.isDragging ? 'text-orange-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">{designHook.isDragging ? 'Drop your images here' : 'Upload design images'}</h3>
          <p className="mb-4 text-xs text-gray-500 sm:mb-6">Supports PNG, JPG, GIF up to 30MB each</p>
          <button onClick={() => designHook.fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg touch-manipulation"
            style={{ backgroundColor: BRAND }}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Choose Files
          </button>
        </div>
      </div>
      <input ref={designHook.fileInputRef} type="file" multiple accept="image/*"
        onChange={e => designHook.handleFileUpload(e.target.files)} className="hidden" />
      {designHook.uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">Recent Uploads ({designHook.uploadedFiles.length})</h4>
          {designHook.uploadedFiles.map(file => (
            <div key={file.id} className="flex items-center p-2 bg-white border border-gray-200 rounded-lg sm:p-3">
              <img src={file.url} alt={file.name} className="object-cover w-10 h-10 mr-3 border border-gray-200 rounded-lg sm:w-12 sm:h-12" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>{file.name.length > 25 ? `${file.name.substring(0, 20)}...${file.name.split('.').pop()}` : file.name}</p>
                <div className="flex items-center mt-1 space-x-2 text-xs text-gray-500">
                  <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  <span className={file.base64Data ? 'text-green-600' : 'text-orange-600'}>{file.base64Data ? 'Stored' : 'Processing'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── renderSettingsPanel ───────────────────────────────────────────────────
  const renderSettingsPanel = () => {
    switch (activeTab) {
      case 'product':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{productData?.name || 'Unnamed Product'}</h3>
            <div className="space-y-2">
              <div><label className="text-xs font-medium tracking-wider text-black uppercase">Product Type</label><p className="mt-1 text-sm text-black capitalize">{productData?.productType || 'Unknown'}</p></div>
              {pricingHook.totalPrice > 0 && (
                <div className="p-2 border border-green-200 rounded bg-green-50">
                  <label className="text-xs font-medium tracking-wider text-green-700 uppercase">Current Price</label>
                  <p className="mt-1 text-lg font-bold text-green-800">₹{pricingHook.totalPrice}</p>
                  <p className="text-xs text-green-600">per unit</p>
                </div>
              )}
            </div>
            <div className="p-2 rounded-lg">{renderTechnologySelector()}</div>
          </div>
        );

      case 'colors':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Color Selection</h3>
            {/* Variant counter */}
            {(() => {
              const current = calculateProjectedVariants(selectedColors, selectedSizes);
              const isAtLimit  = current >= VARIANT_HARD_LIMIT;
              const isNearLimit= current >= Math.round(VARIANT_HARD_LIMIT * 0.8);
              const pct = Math.min(100, Math.round((current / VARIANT_HARD_LIMIT) * 100));
              return (
                <div className={`p-3 rounded-lg border ${isAtLimit ? 'bg-red-50 border-red-300' : isNearLimit ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Variants</span>
                    <span className={`text-xs font-bold ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-gray-600'}`}>{current} / {VARIANT_HARD_LIMIT}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-400' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">{selectedColors.length} color{selectedColors.length !== 1 ? 's' : ''} × {selectedSizes.length} size{selectedSizes.length !== 1 ? 's' : ''}</p>
                  {variantLimitWarning && <p className="mt-2 text-xs font-medium text-red-600">⚠️ {variantLimitWarning}</p>}
                </div>
              );
            })()}
            <div className="flex flex-wrap gap-2 mb-4">
              {productData?.colorOptions?.map((color: any) => {
                const isSelected  = selectedColors.some(c => c.value === color.colorHex);
                const projected   = calculateProjectedVariants([...selectedColors, { name: color.colorName, value: color.colorHex }], selectedSizes);
                const isDisabled  = !isSelected && projected > VARIANT_HARD_LIMIT;
                const tickColor   = isLightColor(color.colorHex) ? '#000000' : '#FFFFFF';
                return (
                  <button key={color.colorHex} onClick={() => { if (!isDisabled) handleColorChange(color.colorHex, color.colorName); }} title={color.colorName}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 transition-all flex items-center justify-center touch-manipulation ${isSelected ? 'border-orange-500 ring-2 ring-orange-200 scale-110' : isDisabled ? 'border-gray-200 opacity-30 cursor-not-allowed' : 'border-gray-300 hover:border-gray-400 hover:scale-105'}`}
                    style={{ backgroundColor: color.colorHex }}>
                    {isSelected && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={tickColor} width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
                  </button>
                );
              })}
            </div>
            <div className="space-y-2">
              {selectedColors.map(color => (
                <div key={color.value} className="flex items-center justify-between p-2 rounded-md bg-gray-50 hover:bg-gray-100">
                  <div className="flex items-center">
                    <div className="w-6 h-6 mr-3 border border-gray-200 rounded-full sm:w-8 sm:h-8" style={{ backgroundColor: color.value }} />
                    <span className="text-sm font-medium">{color.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setHighlightedColor(color.value); startTransition(() => setActiveColor(color.value)); }}
                      className={`p-1 rounded touch-manipulation ${activeColor === color.value ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-200'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                    {selectedColors.length > 1 && (
                      <button onClick={() => removeColor(color.value)} className="p-1 text-red-600 rounded hover:bg-red-50 touch-manipulation">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'sizes':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Size Selection</h3>
            {productData?.size_Images && activeSize && (
              <div className="flex items-center justify-between p-2 border border-orange-200 rounded-lg bg-orange-50">
                <span className="text-sm font-medium text-gray-700">Active Size</span>
                <span className="text-sm font-bold text-orange-600">{activeSize}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-4 mb-4">
              {productData?.sizeOptions?.map((size: any) => {
                const isSelected = selectedSizes.includes(size.sizeName);
                return (
                  <button key={size.sizeName} onClick={() => toggleSizeSelection(size.sizeName)}
                    className={`relative px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all hover:scale-105 touch-manipulation min-w-[70px] ${isSelected ? 'bg-orange-500 text-white border-orange-500 ring-2 ring-orange-200 scale-110' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}>
                    {isSelected && <svg className="absolute w-4 h-4 text-white top-1 right-1" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
                    <span>{size.sizeName}</span>
                  </button>
                );
              })}
            </div>
            <div className="space-y-2">
              {selectedSizes.map(size => (
                <div key={size} className="flex items-center justify-between p-2 rounded-md bg-gray-50 hover:bg-gray-100">
                  <span className="text-sm font-medium">{size}</span>
                  <div className="flex gap-2">
                    {productData?.size_Images && (
                      <button onClick={() => setActiveSize(size)} className={`p-1 rounded touch-manipulation ${activeSize === size ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-200'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </button>
                    )}
                    {selectedSizes.length > 1 && (
                      <button onClick={() => setSelectedSizes(prev => prev.filter(s => s !== size))} className="p-1 text-red-600 rounded hover:bg-red-50 touch-manipulation">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'upload':   return renderUploadPanel();
      case 'layers':   return (
        <LayersPanel
          layers={getLayersInfo()} selectedId={designHook.selectedId}
          onSelectLayer={designHook.setSelectedId} onToggleVisibility={designHook.handleToggleVisibility}
          onToggleLock={designHook.handleToggleLock} onDeleteLayer={designHook.handleDeleteLayer}
          onMoveLayer={designHook.handleMoveLayer} onDuplicateLayer={designHook.handleDuplicateLayer}
          customWidth={customWidth} customHeight={customHeight} lockAspectRatio={lockAspectRatio}
          setCustomWidth={setCustomWidth} setCustomHeight={setCustomHeight} setLockAspectRatio={setLockAspectRatio}
          designElements={designHook.designElements} activeArea={activeArea} activeColor={activeColor}
          getCanvasConfig={getCanvasConfig} getPrintableAreaFromPhoto={getPrintableAreaFromPhoto}
          setDesignElements={designHook.setDesignElements} updatePricingData={pricingHook.updatePricingData}
          triggerUpdate={designHook.triggerUpdate}
        />
      );
      case 'pricing':  return renderPricingPanel();
      default:         return null;
    }
  };

  // ── Main render ───────────────────────────────────────────────────────────
  if (!productData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-b-2 rounded-full animate-spin" style={{ borderColor: BRAND }} />
          <p className="mt-2 text-sm text-gray-600">Loading designer...</p>
        </div>
      </div>
    );
  }

  const SIDEBAR_TABS = [
    { id: 'product',  icon: Package,     label: 'Product', count: 1 },
    { id: 'colors',   icon: Palette,     label: 'Colors',  count: selectedColors.length },
    { id: 'sizes',    icon: Ruler,       label: 'Sizes',   count: selectedSizes.length },
    { id: 'upload',   icon: Upload,      label: 'Upload',  count: designHook.uploadedFiles.length },
    { id: 'layers',   icon: Layers,      label: 'Layers',  count: getLayersInfo().length },
    { id: 'pricing',  icon: IndianRupee, label: 'Pricing', count: pricingHook.totalPrice > 0 ? 1 : 0 },
  ] as const;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      {/* ── Header ── */}
      <div className="px-1 py-4 bg-white border-b border-gray-200 shadow-sm sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center ml-2">
            <img src={JunooniLogo} alt="Junooni" className="h-8 sm:h-8" />
          </div>
          <div className="flex p-0.5 bg-gray-100 border border-gray-200 rounded-lg">
            {(['design', 'preview'] as const).map(view => (
              <button key={view} onClick={() => setActiveView(view)}
                className="flex items-center gap-0.5 sm:gap-2 px-2 md:px-4 py-1.5 md:py-2 text-[12px] sm:text-sm font-medium rounded-md transition-all"
                style={{ backgroundColor: activeView === view ? BRAND : 'transparent', color: activeView === view ? 'white' : undefined }}>
                {!isMobile && (view === 'design' ? <PenTool size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />)}
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-0 sm:gap-3">
            <button
              onClick={storeImportHook.handleImportToStore}
              disabled={(!designHook.hasDesignElements && !shouldSkipMockupGeneration()) || storeImportHook.isGeneratingForStore || (!mockupCalculation && !shouldSkipMockupGeneration())}
              className="flex items-center gap-1 px-2 py-2 text-xs font-medium text-white rounded-lg shadow-sm sm:gap-2 sm:px-4 sm:text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation ml-0.5"
              style={{ backgroundColor: BRAND }}>
              {storeImportHook.isGeneratingForStore
                ? <><div className="w-3 h-3 border-b-2 border-white rounded-full sm:w-4 sm:h-4 animate-spin" /><span className="hidden sm:inline">Generating...</span></>
                : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg><span className="hidden sm:inline">Import to Store</span></>
              }
            </button>
            <button onClick={() => window.history.back()} className="p-2 text-gray-500 rounded-lg hover:text-gray-700 hover:bg-gray-100 touch-manipulation">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile area thumbnails ── */}
      {activeView === 'design' && isMobile && availableAreas.length > 1 && (
        <div className="w-full bg-white">
          <div className="px-4 pt-2 pb-0">
            <div className="flex pb-0 space-x-3 overflow-x-auto">
              {availableAreas.map(area => {
                const areaData   = getAreaDisplayData(area);
                const elementCount = designHook.designElements[area]?.length || 0;
                const canvasImage  = designHook.canvasImages[`${area}_${activeColor}`] || designHook.canvasImages[area];
                return (
                  <div key={area} className="flex-shrink-0">
                    <button onClick={() => setActiveArea(area)}
                      className={`flex flex-col items-center p-2 rounded-lg touch-manipulation min-w-[80px] ${activeArea === area ? 'border-orange-500 border-2 bg-orange-50' : 'bg-white border-none'}`}>
                      <div className="relative w-16 h-16 mb-0 overflow-hidden bg-white rounded">
                        {canvasImage ? (
                          <div className="relative w-full h-full">
                            <div className="absolute inset-0" style={{ backgroundColor: activeColor }} />
                            <img src={canvasImage.src} alt={areaData.displayName} className="absolute inset-0 object-cover w-full h-full" />
                            {elementCount > 0 && <div className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-orange-500 rounded-full">{elementCount}</div>}
                          </div>
                        ) : <div className="flex items-center justify-center w-full h-full text-gray-400"><span className="text-xs">...</span></div>}
                      </div>
                      <p className="text-xs font-medium leading-tight text-center text-gray-700">{areaData.displayName}</p>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar toggle button */}
        {activeView === 'design' && !isMobile && (
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`fixed z-40 p-2 bg-white border border-gray-300 rounded-r-lg shadow-md hover:bg-gray-50 transition-all duration-300 ${sidebarCollapsed ? 'left-20 md:left-27' : 'left-80 lg:left-96'} top-[calc(50%+4rem)] -translate-y-1/2`}>
            <svg className={`w-3 h-3 text-[#e65100] transition-transform duration-300 ${sidebarCollapsed ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        )}

        {/* Desktop sidebar */}
        {activeView === 'design' && !isMobile && (
          <div className="flex bg-white border-r border-gray-200 shadow-sm">
            {/* Tab icons */}
            <div className="flex flex-col w-16 border-r border-gray-200 md:w-20" style={{ backgroundColor: '#e65100' }}>
              <nav className="flex flex-col flex-1 p-2 space-y-1">
                {SIDEBAR_TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                      className={`relative group flex flex-col items-center justify-center p-3 rounded-lg transition-all touch-manipulation ${activeTab === tab.id ? 'bg-white text-[#e65100] shadow-sm' : 'text-white hover:text-[#e65100] hover:bg-white/70'}`}>
                      <div className="relative">
                        <Icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                        {tab.count > 0 && tab.id !== 'product' && (
                          <span className="absolute flex items-center justify-center w-4 h-4 text-xs font-bold text-orange-600 bg-white rounded-full -top-3 -right-1">{tab.count > 99 ? '99+' : tab.count}</span>
                        )}
                      </div>
                      <span className="mt-1 text-xs font-medium">{tab.label}</span>
                      {activeTab === tab.id && <div className="absolute left-0 w-1 h-8 transform -translate-y-1/2 bg-white rounded-r-full top-1/2" />}
                    </button>
                  );
                })}
              </nav>
            </div>
            {/* Content panel */}
            <div className={`flex flex-col transition-all duration-300 overflow-hidden h-full ${sidebarCollapsed ? 'w-0' : 'w-72 md:w-64 lg:w-80'}`}>
              <div className="px-6 py-4 border-b-2 border-[#e65100] bg-[#fed7aa]">
                <h2 className="text-lg font-semibold text-gray-900 capitalize">{activeTab}</h2>
              </div>
              <div className="flex-1 overflow-y-auto bg-[#fed7aa] [scrollbar-width:thin] [scrollbar-color:#4B4B4B_#ffccbc]">
                <div className="px-3 py-3">{renderSettingsPanel()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop area thumbnails */}
          {activeView === 'design' && !isMobile && availableAreas.length > 1 && (
            <div className="w-32 p-2 overflow-y-auto bg-white md:w-32 lg:w-44 md:p-3">
              <div className="space-y-2">
                {availableAreas.map(area => {
                  const areaData   = getAreaDisplayData(area);
                  const elementCount = designHook.designElements[area]?.length || 0;
                  const canvasImage  = designHook.canvasImages[`${area}_${activeColor}`] || designHook.canvasImages[area];
                  return (
                    <AreaSelectionThumbnail key={area} areaId={area} areaName={areaData.displayName}
                      isActive={activeArea === area} onSelect={setActiveArea} canvasImage={canvasImage}
                      activeColor={activeColor} elementCount={elementCount} productData={productData}
                      activeSize={activeSize} allCanvasImages={designHook.canvasImages} />
                  );
                })}
              </div>
            </div>
          )}

          {/* Canvas / Preview */}
          <div className="flex-1 px-2 pt-0 pb-2 overflow-y-auto bg-white sm:p-2">
            {activeView === 'design' ? (
              <div className={`flex items-center justify-center h-auto overflow-y-auto ${isMobile ? 'px-2 pt-8 pb-20' : 'px-3 md:px-4 pt-0 pb-2 sm:p-3 md:p-6'}`}>
                <div className="relative">{renderCanvas()}</div>
              </div>
            ) : (
              storeImportHook.isGeneratingForStore || storeImportHook.showStoreImportModal ? (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-orange-500 rounded-full border-t-transparent animate-spin" />
                    <p className="text-xl font-semibold text-gray-900">Store Import in Progress</p>
                    <p className="mt-2 text-gray-600">Preview temporarily paused</p>
                  </div>
                </div>
              ) : renderPreview()
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      {isMobile && activeView === 'design' && (
        <MobileBottomTabBar
          activeTab={activeTab}
          onTabChange={(tab) => { setActiveTab(tab as any); setShowMobileBottomSheet(true); }}
          selectedColors={selectedColors} selectedSizes={selectedSizes}
          uploadedFiles={designHook.uploadedFiles} layersCount={getLayersInfo().length}
          totalPrice={pricingHook.totalPrice}
        />
      )}

      {/* Mobile bottom sheet */}
      {isMobile && (
        <MobileBottomSheet isOpen={showMobileBottomSheet} onClose={() => setShowMobileBottomSheet(false)} title={activeTab}>
          {renderSettingsPanel()}
        </MobileBottomSheet>
      )}

      {/* Store import modal */}
      <StoreImportModal
        isOpen={storeImportHook.showStoreImportModal}
        onClose={() => storeImportHook.setShowStoreImportModal(false)}
        importData={storeImportHook.storeImportData}
        isGenerating={storeImportHook.isGeneratingForStore}
        generationProgress={storeImportHook.storeGenerationProgress}
        mockupCalculation={mockupCalculation}
        setActiveView={setActiveView}
        setActiveTab={setActiveTab}
      />

      {/* Hidden debug toggle */}
      <button onClick={() => setDebugMode(!debugMode)} className="fixed w-4 h-4 transition-opacity opacity-0 bottom-4 right-4 hover:opacity-100" />
    </div>
  );
};

export default EnhancedCanvas;
