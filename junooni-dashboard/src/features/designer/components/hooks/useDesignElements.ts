// ============================================================
// hooks/useDesignElements.ts
// Manages design element CRUD, layer ordering, visibility,
// locking, file upload/processing, and canvas image state.
// ============================================================

import { useState, useRef, useCallback } from 'react';
import type { DesignElement, UploadedFile, PayloadProductData } from '../types';
import { validateImageFile, optimizeImage, cropTransparentPixels, convertImageToBase64 } from '../utils';

interface UseDesignElementsOptions {
  activeArea: string;
  activeColor: string;
  activeSize: string;
  getCanvasConfig: (areaId: string, colorHex?: string) => any;
  getPrintableAreaFromPhoto: (areaId: string, colorHex?: string, sizeId?: string) => any;
  onElementsChanged?: () => void;
}

export const useDesignElements = ({
  activeArea,
  activeColor,
  activeSize,
  getCanvasConfig,
  getPrintableAreaFromPhoto,
  onElementsChanged,
}: UseDesignElementsOptions) => {
  const [designElements, setDesignElements] = useState<Record<string, DesignElement[]>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [canvasImages, setCanvasImages] = useState<Record<string, HTMLImageElement | null>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageProcessingStep, setImageProcessingStep] = useState('Processing image...');
  const [imageProcessingPct, setImageProcessingPct] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  const designElementsRef = useRef<Record<string, DesignElement[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerUpdate = useCallback(() => setForceUpdate(v => v + 1), []);

  // ── Internal helpers ──────────────────────────────────────────────────────
  const addImageToCanvas = useCallback(async (
    imageSrc: string,
    imageName: string,
    targetArea: string,
    base64Data: string,
    overlayAlreadyShowing = false
  ): Promise<boolean> => {
    if (!overlayAlreadyShowing) {
      setIsProcessingImage(true);
      setImageProcessingStep('Loading image...');
      setImageProcessingPct(10);
      await new Promise(r => setTimeout(r, 16));
    }

    const areaToUse = targetArea || activeArea;
    let processingDone = false;
    const hardTimeout = setTimeout(() => {
      if (!processingDone) { processingDone = true; setIsProcessingImage(false); setImageProcessingPct(0); setImageProcessingStep(''); }
    }, 45000);

    const cleanup = () => {
      if (processingDone) return;
      processingDone = true;
      clearTimeout(hardTimeout);
      setIsProcessingImage(false);
      setImageProcessingPct(0);
      setImageProcessingStep('');
      setIsImageLoading(false);
    };

    return new Promise(async (resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const imgLoadTimeout = setTimeout(() => { cleanup(); reject(new Error('Image decode timeout')); }, 20000);

      img.onload = async () => {
        clearTimeout(imgLoadTimeout);
        try {
          let finalImage = img;
          let finalBase64 = base64Data || imageSrc;
          const imageSize = (img.naturalWidth || img.width) * (img.naturalHeight || img.height);

          setImageProcessingStep('Optimizing...');
          setImageProcessingPct(60);
          await new Promise(r => setTimeout(r, 16));

          if (imageSize > 2_000_000) {
            try {
              const result = await Promise.race([
                optimizeImage(img, 1500, 0.85),
                new Promise<never>((_, rej) => setTimeout(() => rej(new Error('Optimize timeout')), 12000)),
              ]);
              finalImage = result.optimizedImage;
              finalBase64 = result.optimizedBase64;
            } catch {}
          }

          setImageProcessingStep('Processing transparency...');
          setImageProcessingPct(80);
          await new Promise(r => setTimeout(r, 16));

          try {
            const cropResult = cropTransparentPixels(finalImage);
            const origArea = (finalImage.naturalWidth || finalImage.width) * (finalImage.naturalHeight || finalImage.height);
            const reduction = 1 - (cropResult.bounds.width * cropResult.bounds.height) / origArea;
            if (reduction > 0.05) {
              const croppedImg = new Image();
              croppedImg.src = cropResult.croppedBase64;
              await new Promise(r => { croppedImg.onload = r; });
              finalImage = croppedImg;
              finalBase64 = cropResult.croppedBase64;
            }
          } catch {}

          setImageProcessingStep('Placing on canvas...');
          setImageProcessingPct(95);
          await new Promise(r => setTimeout(r, 16));

          const canvasConfig = getCanvasConfig(areaToUse);
          const printableArea = getPrintableAreaFromPhoto(areaToUse, activeColor);
          const maxWidth = printableArea.width * 0.8;
          const maxHeight = printableArea.height * 0.8;
          const aspectRatio = (finalImage.naturalWidth || finalImage.width) / (finalImage.naturalHeight || finalImage.height);

          let width = maxWidth, height = maxWidth / aspectRatio;
          if (height > maxHeight) { height = maxHeight; width = maxHeight * aspectRatio; }

          const element: DesignElement = {
            id: `img-${Date.now()}-${Math.random()}`,
            type: 'image',
            x: printableArea.x + (printableArea.width - width) / 2,
            y: printableArea.y + (printableArea.height - height) / 2,
            width, height, rotation: 0, scaleX: 1, scaleY: 1,
            draggable: true, selected: false, zIndex: 1,
            image: finalImage, imageName: imageName || 'Uploaded Image',
            imageUrl: imageSrc, imageBase64: finalBase64,
            originalImageWidth: finalImage.naturalWidth || finalImage.width,
            originalImageHeight: finalImage.naturalHeight || finalImage.height,
            opacity: 1, visible: true, locked: false,
          };

          setDesignElements(prev => {
            const updated = { ...prev };
            if (!updated[areaToUse]) updated[areaToUse] = [];
            const existing = updated[areaToUse];
            const maxZ = existing.reduce((mx, el) => Math.max(mx, el.zIndex || 0), 0);
            element.zIndex = maxZ + 1;
            updated[areaToUse] = [...existing, element];
            return updated;
          });

          cleanup();
          onElementsChanged?.();
          resolve(true);
        } catch (error) { cleanup(); reject(error); }
      };

      img.onerror = () => { clearTimeout(imgLoadTimeout); cleanup(); reject(new Error('Failed to load image')); };
      img.src = base64Data || imageSrc;
    });
  }, [activeArea, activeColor, getCanvasConfig, getPrintableAreaFromPhoto, onElementsChanged]);

  // ── File upload handler ───────────────────────────────────────────────────
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsImageLoading(true);

    for (const file of Array.from(files)) {
      try {
        const validation = validateImageFile(file);
        if (!validation.valid) { alert(`❌ ${file.name}: ${validation.error}`); continue; }

        setIsProcessingImage(true);
        setImageProcessingStep('Reading file...');
        setImageProcessingPct(10);
        await new Promise(r => setTimeout(r, 16));

        setImageProcessingStep('Loading image...');
        setImageProcessingPct(20);

        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target!.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        setImageProcessingStep('Processing...');
        setImageProcessingPct(40);
        await new Promise(r => setTimeout(r, 16));

        const blobUrl = URL.createObjectURL(new Blob([file], { type: file.type }));
        const uniqueId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        setUploadedFiles(prev => [...prev, {
          id: uniqueId, file, url: blobUrl, base64Data, name: file.name,
          size: file.size, type: file.type, uploadProgress: 100, isUploading: false, targetArea: activeArea,
        }]);

        await addImageToCanvas(base64Data, file.name, activeArea, base64Data, true);
      } catch (error: any) {
        setIsProcessingImage(false);
        setImageProcessingPct(0);
        setImageProcessingStep('');
        alert(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    setIsImageLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [activeArea, addImageToCanvas]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false); handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  // ── Layer CRUD ────────────────────────────────────────────────────────────
  const handleToggleVisibility = useCallback((layerId: string) => {
    setDesignElements(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(area => {
        updated[area] = updated[area].map(el =>
          el.id === layerId ? { ...el, visible: el.visible !== false ? false : true } : el
        );
      });
      return updated;
    });
    triggerUpdate();
  }, [triggerUpdate]);

  const handleToggleLock = useCallback((layerId: string) => {
    setDesignElements(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(area => {
        updated[area] = updated[area].map(el =>
          el.id === layerId ? { ...el, locked: !el.locked, draggable: !!el.locked } : el
        );
      });
      return updated;
    });
    triggerUpdate();
  }, [triggerUpdate]);

  const handleDeleteLayer = useCallback((layerId: string) => {
    setDesignElements(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(area => {
        updated[area] = updated[area].filter(el => el.id !== layerId);
      });
      return updated;
    });
    if (selectedId === layerId) setSelectedId(null);
  }, [selectedId]);

  const handleMoveLayer = useCallback((layerId: string, direction: 'up' | 'down') => {
    setDesignElements(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(area => {
        const elements = [...updated[area]];
        const el = elements.find(e => e.id === layerId);
        if (!el) return;
        if (direction === 'up') el.zIndex = Math.max(...elements.map(e => e.zIndex || 0)) + 1;
        else el.zIndex = Math.max(0, Math.min(...elements.map(e => e.zIndex || 0)) - 1);
        updated[area] = elements;
      });
      return updated;
    });
    triggerUpdate();
  }, [triggerUpdate]);

  const handleDuplicateLayer = useCallback((layerId: string) => {
    setDesignElements(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(area => {
        const src = updated[area].find(el => el.id === layerId);
        if (src) {
          const maxZ = updated[area].reduce((mx, el) => Math.max(mx, el.zIndex || 0), 0);
          const dup: DesignElement = { ...src, id: `${src.type}-${Date.now()}-${Math.random()}`, x: src.x + 20, y: src.y + 20, zIndex: maxZ + 1, selected: false };
          updated[area] = [...updated[area], dup];
          setSelectedId(dup.id);
        }
      });
      return updated;
    });
    triggerUpdate();
  }, [triggerUpdate]);

  const deleteSelectedElement = useCallback(() => {
    if (!selectedId) return;
    handleDeleteLayer(selectedId);
  }, [selectedId, handleDeleteLayer]);

  const centerElement = useCallback((alignment: 'horizontal' | 'vertical' | 'both' | 'left' | 'right' | 'top' | 'bottom' | 'hcenter' | 'vcenter') => {
    if (!selectedId) return;
    const printableArea = getPrintableAreaFromPhoto(activeArea, activeColor);
    if (!printableArea) return;

    setDesignElements(prev => {
      const updated = { ...prev };
      if (!updated[activeArea]) return updated;
      updated[activeArea] = updated[activeArea].map(el => {
        if (el.id !== selectedId) return el;
        let newX = el.x, newY = el.y;
        if (alignment === 'horizontal' || alignment === 'both' || alignment === 'hcenter')
          newX = printableArea.x + (printableArea.width - (el.width || 0)) / 2;
        if (alignment === 'vertical' || alignment === 'both' || alignment === 'vcenter')
          newY = printableArea.y + (printableArea.height - (el.height || 0)) / 2;
        if (alignment === 'left') newX = printableArea.x;
        if (alignment === 'right') newX = printableArea.x + printableArea.width - (el.width || 0);
        if (alignment === 'top') newY = printableArea.y;
        if (alignment === 'bottom') newY = printableArea.y + printableArea.height - (el.height || 0);
        return { ...el, x: newX, y: newY };
      });
      return updated;
    });
    triggerUpdate();
  }, [selectedId, activeArea, activeColor, getPrintableAreaFromPhoto, triggerUpdate]);

  // ── Visible elements helper ───────────────────────────────────────────────
  const getVisibleDesignElements = useCallback((elements: Record<string, DesignElement[]>) => {
    const result: Record<string, DesignElement[]> = {};
    Object.keys(elements).forEach(area => {
      result[area] = (elements[area] || []).filter(el => el.visible !== false);
    });
    return result;
  }, []);

  const hasDesignElements = Object.values(designElements).some(els => els.length > 0);

  return {
    // State
    designElements, setDesignElements,
    selectedId, setSelectedId,
    uploadedFiles, setUploadedFiles,
    canvasImages, setCanvasImages,
    isDragging, isProcessingImage, imageProcessingStep, imageProcessingPct, isImageLoading,
    forceUpdate, triggerUpdate,
    fileInputRef, designElementsRef,
    hasDesignElements,

    // Handlers
    addImageToCanvas,
    handleFileUpload,
    handleDrop, handleDragOver, handleDragLeave,
    handleToggleVisibility, handleToggleLock, handleDeleteLayer,
    handleMoveLayer, handleDuplicateLayer, deleteSelectedElement, centerElement,
    getVisibleDesignElements,
  };
};