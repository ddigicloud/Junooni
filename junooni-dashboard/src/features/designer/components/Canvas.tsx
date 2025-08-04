// src/components/Designer/EnhancedDynamicDesigner.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Konva from 'konva';
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Rect,
  Group,
  Transformer,
} from 'react-konva';

// Import the enhanced professional mockup engines
import { EnhancedMockupEngine } from '../engines/MockupEngine';

// =====================================
// DYNAMIC TYPE DEFINITIONS FROM PAYLOADCMS
// =====================================

interface EnhancedDesignElement {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  draggable: boolean;
  selected: boolean;
  zIndex: number;
  image?: HTMLImageElement;
  imageName?: string;
  imageUrl?: string;
  originalImageWidth?: number;
  originalImageHeight?: number;
}

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

// =====================================
// DYNAMIC CONFIGURATION UTILITIES
// =====================================

const getDynamicApiConfig = () => {
  // Get from environment or fallback to localhost
  const backendUrl = import.meta.env?.VITE_PAYLOAD_BASE_URL || 'http://localhost:3000';
  return { BACKEND_URL: backendUrl };
};

const resolveDynamicImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const config = getDynamicApiConfig();
  if (url.startsWith('/')) return `${config.BACKEND_URL}${url}`;
  return `${config.BACKEND_URL}/api/media/file/${url}`;
};

// =====================================
// ENHANCED THUMBNAIL COMPONENT
// =====================================

interface EnhancedDynamicThumbnailProps {
  mockup: DynamicMockupPhoto;
  designElements: Record<string, EnhancedDesignElement[]>;
  canvasConfigs: Record<string, any>;
  canvasPrintableAreas: Record<string, any>;
  surfaceConfig: any;
  productColor: string;
  isSelected: boolean;
  onSelect: () => void;
  fabricSettings: {
    enableRealisticFabric: boolean;
    dynamicVisibility: boolean;
    adaptiveBlending: boolean;
  };
}

const EnhancedDynamicThumbnail: React.FC<EnhancedDynamicThumbnailProps> = ({
  mockup,
  designElements,
  canvasConfigs,
  canvasPrintableAreas,
  surfaceConfig,
  productColor,
  isSelected,
  onSelect,
  fabricSettings
}) => {
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
        isSelected 
          ? 'border-blue-600 shadow-lg transform scale-105' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="w-full aspect-square">
        <EnhancedMockupEngine
          mockup={mockup}
          designElements={designElements}
          canvasConfigs={canvasConfigs}
          canvasPrintableAreas={canvasPrintableAreas}
          displayDimensions={{ width: 120, height: 120 }}
          productType={surfaceConfig.renderType}
          productColor={productColor}
          fabricSettings={fabricSettings}
        />
      </div>
      
      {/* Enhanced selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Dynamic title overlay with fabric info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
        <p className="text-xs font-medium text-white truncate">
          {mockup.title || `${mockup.viewAngle || 'View'}`}
        </p>
        <div className="flex items-center justify-between mt-1">
          <div className="flex gap-1">
            {mockup.visibleAreas?.map((area, idx) => (
              <span key={idx} className={`text-xs px-1 rounded text-white ${
                area.visibility === 'full' ? 'bg-green-600' :
                area.visibility === 'partial' ? 'bg-yellow-600' :
                'bg-red-600'
              }`}>
                {area.areaName}
              </span>
            ))}
          </div>
          {mockup.fabricProperties && (
            <span className="text-xs bg-purple-600 text-white px-1 rounded">
              {mockup.fabricProperties.fabricType.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// =====================================
// MAIN ENHANCED DYNAMIC DESIGNER COMPONENT
// =====================================

interface EnhancedDynamicDesignerProps {
  productData: any;
}

const EnhancedDynamicDesigner: React.FC<EnhancedDynamicDesignerProps> = ({ productData }) => {
  const brandColor = '#e51000';
  
  // =====================================
  // DYNAMIC STATE MANAGEMENT
  // =====================================
  
  const [activeView, setActiveView] = useState<'design' | 'preview'>('design');
  const [activeTab, setActiveTab] = useState<'colors' | 'sizes' | 'upload' | 'library' | 'fabric'>('upload');
  const [debugMode, setDebugMode] = useState(false);
  
  // Dynamic technology selection based on PayloadCMS data
  const [activeTechnology, setActiveTechnology] = useState<string>(() => {
    return productData?.printTech?.[0]?.id || '';
  });
  
  // Dynamic size selection
  const allSizes = (productData?.sizeOptions || [])
    .filter((size: any) => size?.sizeName)
    .map((size: any) => size.sizeName);
  
  const [selectedSizes, setSelectedSizes] = useState<string[]>(allSizes);
  
  // Dynamic color selection
  const [selectedColors, setSelectedColors] = useState<{value: string, name: string}[]>(() => {
    const primaryColor = productData?.colorOptions?.find((color: any) => color?.isPrimary);
    const firstColor = primaryColor || productData?.colorOptions?.[0];
    if (firstColor?.colorHex && firstColor?.colorName) {
      return [{ value: firstColor.colorHex, name: firstColor.colorName }];
    }
    return [];
  });
  
  const [activeColor, setActiveColor] = useState<string>(() => {
    const primaryColor = productData?.colorOptions?.find((color: any) => color?.isPrimary);
    const firstColor = primaryColor || productData?.colorOptions?.[0];
    return firstColor?.colorHex || '#ffffff';
  });
  
  // Dynamic fabric settings based on product material properties
  const [fabricSettings, setFabricSettings] = useState(() => {
    const defaultFabricType = productData?.materials?.primary?.toLowerCase().includes('cotton') ? 'cotton' :
                             productData?.materials?.primary?.toLowerCase().includes('polyester') ? 'polyester' :
                             productData?.materials?.primary?.toLowerCase().includes('canvas') ? 'canvas' :
                             productData?.materials?.primary?.toLowerCase().includes('leather') ? 'leather' :
                             'cotton';
    
    return {
      enableRealisticFabric: true,
      dynamicVisibility: true,
      adaptiveBlending: true,
      globalFabricType: defaultFabricType,
      fabricIntensity: 0.5,
      lightingIntensity: 0.8,
      shadowIntensity: 0.4
    };
  });
  
  // Get dynamic surface configuration from PayloadCMS
  const getDynamicSurfaceConfiguration = useCallback(() => {
    const baseConfig = productData?.surfaceConf || {
      renderType: 'flat',
      surfaceProp: {
        wrapAngle: 280,
        curveIntnsty: 0.8,
        designRatio: {
          widthRatio: 1.0,
          heightRatio: 1.0
        }
      },
      blendSetting: {
        defBlendMode: 'normal',
        defaultOpacity: 1.0,
        preserveColors: true
      }
    };
    
    // Enhanced with dynamic fabric properties from PayloadCMS
    const fabricType = productData?.materials?.primary?.toLowerCase().includes('cotton') ? 'cotton' :
                      productData?.materials?.primary?.toLowerCase().includes('polyester') ? 'polyester' :
                      productData?.materials?.primary?.toLowerCase().includes('canvas') ? 'canvas' :
                      productData?.materials?.primary?.toLowerCase().includes('leather') ? 'leather' :
                      'cotton';
    
    const fabricWeight = parseInt(productData?.materials?.weight?.replace(/[^\d]/g, '')) || 200;
    
    return {
      ...baseConfig,
      fabricProperties: {
        fabricType,
        fabricWeight,
        surfaceTexture: productData?.materials?.finish?.toLowerCase().includes('smooth') ? 'smooth' : 'textured',
        stretchability: fabricType === 'cotton' ? 0.3 : fabricType === 'polyester' ? 0.4 : 0.2,
        transparency: 0.05
      },
      lightingConditions: {
        lightDirection: 45,
        lightIntensity: fabricSettings.lightingIntensity,
        ambientLight: 0.3,
        shadowIntensity: fabricSettings.shadowIntensity
      }
    };
  }, [productData, fabricSettings]);
  
  // Dynamic available areas from PayloadCMS
  const getAvailableAreas = useCallback(() => {
    try {
      const technology = productData?.printTech?.find((tech: any) => tech?.id === activeTechnology);
      if (!technology?.customizationAreas?.length) {
        return ['front'];
      }
      
      const areas = technology.customizationAreas
        .filter((area: any) => area?.areaName)
        .map((area: any) => area.areaName.toLowerCase());
      
      return areas.length > 0 ? areas : ['front'];
    } catch (error) {
      console.error('Error getting available areas:', error);
      return ['front'];
    }
  }, [productData, activeTechnology]);
  
  const availableAreas = getAvailableAreas();
  const [activeArea, setActiveArea] = useState(availableAreas[0] || 'front');
  
  const [canvasImages, setCanvasImages] = useState<Record<string, HTMLImageElement | null>>({});
  
  const [designElements, setDesignElements] = useState<Record<string, EnhancedDesignElement[]>>(() => {
    const initialElements: Record<string, EnhancedDesignElement[]> = {};
    availableAreas.forEach(area => {
      initialElements[area] = [];
    });
    return initialElements;
  });
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedHeroMockup, setSelectedHeroMockup] = useState<DynamicMockupPhoto | null>(null);
  
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  
  // Force re-render trigger
  const [forceUpdate, setForceUpdate] = useState(0);
  const triggerUpdate = useCallback(() => {
    setForceUpdate(prev => prev + 1);
  }, []);
  
  // =====================================
  // DYNAMIC HELPER FUNCTIONS
  // =====================================
  
  const getCurrentTechnology = useCallback(() => {
    return productData?.printTech?.find((tech: any) => tech.id === activeTechnology);
  }, [productData, activeTechnology]);
  
  const getCurrentCustomizationArea = useCallback(() => {
    const technology = getCurrentTechnology();
    if (!technology) return null;
    return technology.customizationAreas?.find((area: any) => 
      area.areaName?.toLowerCase() === activeArea.toLowerCase()
    );
  }, [getCurrentTechnology, activeArea]);
  
  const getCurrentCanvasDimensions = useCallback(() => {
    const area = getCurrentCustomizationArea();
    return area?.canvasDimensions || {
      widthInches: 8,
      heightInches: 12,
      canvasPixelWidth: 800,
      canvasPixelHeight: 600,
      aspectRatioLocked: true
    };
  }, [getCurrentCustomizationArea]);
  
  const getDesignCanvasPhoto = useCallback(() => {
    const area = getCurrentCustomizationArea();
    if (!area?.designCanvasPhotos?.length) return null;
    
    const photo = area.designCanvasPhotos.find((p: any) => 
      p?.photoColor?.toLowerCase() === activeColor?.toLowerCase()
    ) || area.designCanvasPhotos[0];
    
    return photo;
  }, [getCurrentCustomizationArea, activeColor]);
  
  // =====================================
  // DYNAMIC CANVAS CONFIGURATION
  // =====================================
  
  const getCanvasConfig = useCallback(() => {
    const canvasDimensions = getCurrentCanvasDimensions();
    return {
      width: canvasDimensions.canvasPixelWidth,
      height: canvasDimensions.canvasPixelHeight,
      realWorldWidth: canvasDimensions.widthInches,
      realWorldHeight: canvasDimensions.heightInches
    };
  }, [getCurrentCanvasDimensions]);
  
  const getPrintableAreaFromPhoto = useCallback(() => {
    const photo = getDesignCanvasPhoto();
    const canvasConfig = getCanvasConfig();
    
    if (!photo?.printableAreaCoordinates) {
      // Dynamic default based on surface type and fabric from PayloadCMS
      const surfaceConfig = getDynamicSurfaceConfiguration();
      let margin = 0.1;
      
      if (surfaceConfig.renderType === 'cylindrical') {
        margin = 0.15;
      } else if (surfaceConfig.fabricProperties?.fabricType === 'leather') {
        margin = 0.12; // Leather needs more margin for stitching
      } else if (surfaceConfig.fabricProperties?.fabricType === 'canvas') {
        margin = 0.08; // Canvas can go closer to edges
      }
      
      return {
        x: canvasConfig.width * margin,
        y: canvasConfig.height * margin,
        width: canvasConfig.width * (1 - margin * 2),
        height: canvasConfig.height * (1 - margin * 2)
      };
    }
    
    const coords = photo.printableAreaCoordinates;
    
    // Convert proportional to absolute
    return {
      x: coords.x * canvasConfig.width,
      y: coords.y * canvasConfig.height,
      width: coords.width * canvasConfig.width,
      height: coords.height * canvasConfig.height
    };
  }, [getDesignCanvasPhoto, getCanvasConfig, getDynamicSurfaceConfiguration]);
  
  // =====================================
  // DYNAMIC MOCKUP FUNCTIONS (NO HARDCODED DATA)
  // =====================================
  
  const getDynamicMockupsForColor = useCallback((colorHex: string): DynamicMockupPhoto[] => {
    const technology = getCurrentTechnology();
    if (!technology?.mockupPhotos?.length) {
      console.warn('No mockup photos found in PayloadCMS for this technology');
      return [];
    }
    
    // Filter mockups for selected color from PayloadCMS data
    const colorMockups = technology.mockupPhotos
      .filter((mockup: DynamicMockupPhoto) => {
        if (!mockup.photoColor || mockup.photoColor === '#ffffff' || mockup.photoColor === '#000000') {
          return true; // Include neutral mockups
        }
        return mockup.photoColor.toLowerCase() === colorHex.toLowerCase();
      })
      .map((mockup: DynamicMockupPhoto) => enhanceMockupWithDynamicFabricProperties(mockup));
    
    // Sort by priority from PayloadCMS
    return colorMockups.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }, [getCurrentTechnology]);
  
  const enhanceMockupWithDynamicFabricProperties = useCallback((mockup: DynamicMockupPhoto): DynamicMockupPhoto => {
    const surfaceConfig = getDynamicSurfaceConfiguration();
    
    return {
      ...mockup,
      fabricProperties: mockup.fabricProperties || surfaceConfig.fabricProperties,
      lightingConditions: mockup.lightingConditions || surfaceConfig.lightingConditions,
      visibleAreas: mockup.visibleAreas.map(area => ({
        ...area,
        fabricIntegration: area.fabricIntegration || {
          enableFabricBlend: fabricSettings.enableRealisticFabric,
          fabricType: surfaceConfig.fabricProperties.fabricType,
          foldAwareness: true,
          seamAwareness: true,
          textureIntensity: fabricSettings.fabricIntensity,
          fabricColor: activeColor,
          fabricRoughness: 0.3
        }
      }))
    };
  }, [getDynamicSurfaceConfiguration, fabricSettings, activeColor]);
  
  // =====================================
  // DYNAMIC CANVAS CONFIGURATIONS
  // =====================================
  
  const getAllCanvasConfigs = useCallback(() => {
    const configs: Record<string, any> = {};
    const technology = getCurrentTechnology();
    
    if (technology?.customizationAreas) {
      technology.customizationAreas.forEach((area: any) => {
        const canvasDims = area.canvasDimensions || {
          widthInches: 8,
          heightInches: 12,
          canvasPixelWidth: 800,
          canvasPixelHeight: 600,
          aspectRatioLocked: true
        };
        
        configs[area.areaName.toLowerCase()] = {
          width: canvasDims.canvasPixelWidth,
          height: canvasDims.canvasPixelHeight,
          realWorldWidth: canvasDims.widthInches,
          realWorldHeight: canvasDims.heightInches
        };
      });
    }
    
    return configs;
  }, [getCurrentTechnology]);
  
  const getAllPrintableAreas = useCallback(() => {
    const areas: Record<string, any> = {};
    const technology = getCurrentTechnology();
    const surfaceConfig = getDynamicSurfaceConfiguration();
    
    if (technology?.customizationAreas) {
      technology.customizationAreas.forEach((area: any) => {
        const areaName = area.areaName.toLowerCase();
        const canvasDims = area.canvasDimensions || {
          canvasPixelWidth: 800,
          canvasPixelHeight: 600
        };
        
        // Dynamic margin calculation based on fabric type and area from PayloadCMS
        let marginFactor = 0.1;
        if (surfaceConfig.fabricProperties?.fabricType === 'leather') {
          marginFactor = 0.12; // More margin for stitching
        } else if (surfaceConfig.fabricProperties?.fabricType === 'canvas') {
          marginFactor = 0.08; // Canvas can go closer to edges
        } else if (surfaceConfig.renderType === 'cylindrical') {
          marginFactor = 0.15; // More margin for wrapping
        }
        
        let printableArea = {
          x: canvasDims.canvasPixelWidth * marginFactor,
          y: canvasDims.canvasPixelHeight * marginFactor,
          width: canvasDims.canvasPixelWidth * (1 - marginFactor * 2),
          height: canvasDims.canvasPixelHeight * (1 - marginFactor * 2)
        };
        
        // Use area-specific photo from PayloadCMS if available
        if (area.designCanvasPhotos?.length > 0) {
          const photo = area.designCanvasPhotos[0];
          if (photo.printableAreaCoordinates) {
            const coords = photo.printableAreaCoordinates;
            printableArea = {
              x: coords.x * canvasDims.canvasPixelWidth,
              y: coords.y * canvasDims.canvasPixelHeight,
              width: coords.width * canvasDims.canvasPixelWidth,
              height: coords.height * canvasDims.canvasPixelHeight
            };
          }
        }
        
        areas[areaName] = printableArea;
      });
    }
    
    return areas;
  }, [getCurrentTechnology, getDynamicSurfaceConfiguration]);
  
  // =====================================
  // ENHANCED INTERACTION FUNCTIONS WITH PROPER PNG HANDLING
  // =====================================
  
  const handleSelect = useCallback((id: string, e?: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e) {
      e.cancelBubble = true;
      e.evt?.stopPropagation();
    }
    setSelectedId(id);
  }, []);

  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const target = e.target;
    const stage = e.target.getStage();
    
    if (target === stage || target.name() === 'canvas-bg' || target.constructor.name === 'Stage') {
      setSelectedId(null);
    }
  }, []);
  
  const handleColorChange = useCallback((colorValue: string, colorName: string) => {
    if (!colorValue || !colorName) return;
    
    setActiveColor(colorValue);
    
    const isAlreadySelected = selectedColors.some(color => color?.value === colorValue);
    if (!isAlreadySelected) {
      setSelectedColors(prev => [...prev, { value: colorValue, name: colorName }]);
    }
  }, [selectedColors]);
  
  const removeColor = useCallback((colorValue: string) => {
    setSelectedColors(prev => prev.filter(color => color.value !== colorValue));
    
    if (activeColor === colorValue && selectedColors.length > 1) {
      const newActiveColor = selectedColors.find(color => color.value !== colorValue)?.value || '#ffffff';
      setActiveColor(newActiveColor);
    }
  }, [activeColor, selectedColors]);

  const toggleSizeSelection = useCallback((size: string) => {
    setSelectedSizes(prev => {
      if (prev.includes(size)) {
        return prev.filter(s => s !== size);
      }
      return [...prev, size];
    });
  }, []);
  
  // Enhanced image addition with proper PNG transparency handling
  const addImage = useCallback((imageSrc: string, imageName?: string) => {
    const printableArea = getPrintableAreaFromPhoto();
    const canvasConfig = getCanvasConfig();
    const surfaceConfig = getDynamicSurfaceConfiguration();
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    const resolvedSrc = imageSrc.startsWith('blob:') ? imageSrc : resolveDynamicImageUrl(imageSrc);
    img.src = resolvedSrc;
    
    img.onload = () => {
      try {
        // Create a canvas to handle PNG transparency properly
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.error('Could not get canvas context for PNG processing');
          return;
        }
        
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Clear canvas to ensure transparency
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw image with proper alpha handling
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img, 0, 0);
        
        // Create new image from processed canvas
        const processedImg = new Image();
        processedImg.crossOrigin = "anonymous";
        processedImg.src = canvas.toDataURL('image/png');
        
        processedImg.onload = () => {
          // Dynamic sizing based on surface type and fabric from PayloadCMS
          let maxWidth, maxHeight;
          
          if (surfaceConfig.renderType === 'cylindrical') {
            maxWidth = printableArea.width * 0.8;
            maxHeight = printableArea.height * 0.7;
          } else if (surfaceConfig.fabricProperties?.fabricType === 'leather') {
            maxWidth = printableArea.width * 0.75; // Leave more space for stitching
            maxHeight = printableArea.height * 0.75;
          } else {
            maxWidth = printableArea.width * 0.7;
            maxHeight = printableArea.height * 0.7;
          }
          
          const scaleFactor = Math.min(maxWidth / processedImg.width, maxHeight / processedImg.height);
          const newWidth = processedImg.width * scaleFactor;
          const newHeight = processedImg.height * scaleFactor;
          
          const maxZIndex = designElements[activeArea]?.reduce(
            (max, element) => Math.max(max, element.zIndex || 0), 
            0
          ) || 0;
          
          const newImage: EnhancedDesignElement = {
            id: `image-${Date.now()}`,
            type: 'image',
            image: processedImg,
            x: printableArea.x + (printableArea.width - newWidth) / 2,
            y: printableArea.y + (printableArea.height - newHeight) / 2,
            width: newWidth,
            height: newHeight,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            draggable: true,
            selected: false,
            zIndex: maxZIndex + 1,
            imageName: imageName || `Image ${Date.now()}`,
            imageUrl: imageSrc,
            originalImageWidth: processedImg.width,
            originalImageHeight: processedImg.height,
          };
          
          setDesignElements(prev => ({
            ...prev,
            [activeArea]: [...(prev[activeArea] || []), newImage],
          }));
          
          setSelectedId(newImage.id);
          triggerUpdate();
        };
      } catch (error) {
        console.error('Error processing image with transparency:', error);
        alert('Error processing image. Please try again.');
      }
    };
    
    img.onerror = () => {
      console.error('Could not load image:', resolvedSrc);
      alert('Failed to load image. Please try a different image.');
    };
  }, [getPrintableAreaFromPhoto, getCanvasConfig, getDynamicSurfaceConfiguration, designElements, activeArea, triggerUpdate]);
  
  const deleteSelectedElement = useCallback(() => {
    if (!selectedId) return;
    
    setDesignElements((prev) => ({
      ...prev,
      [activeArea]: prev[activeArea].filter((el) => el.id !== selectedId),
    }));
    
    setSelectedId(null);
    triggerUpdate();
  }, [selectedId, activeArea, triggerUpdate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        deleteSelectedElement();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, deleteSelectedElement]);
  
  // =====================================
  // ENHANCED CANVAS RENDERING WITH PROPER TRANSPARENCY
  // =====================================
  
  const renderEnhancedCanvas = useCallback(() => {
    const canvasConfig = getCanvasConfig();
    const printableArea = getPrintableAreaFromPhoto();
    const canvasKey = `${activeArea}_${activeColor}`;
    const canvasImage = canvasImages[canvasKey] || canvasImages[activeArea];
    const surfaceConfig = getDynamicSurfaceConfiguration();
    
    return (
      <Stage
        ref={stageRef}
        width={canvasConfig.width}
        height={canvasConfig.height}
        onMouseDown={handleStageClick}
        onTouchStart={handleStageClick}
        className="border border-gray-200 rounded-md overflow-hidden shadow-sm"
      >
        <Layer ref={layerRef}>
          {/* Enhanced background with fabric consideration */}
          <Rect
            x={0}
            y={0}
            width={canvasConfig.width}
            height={canvasConfig.height}
            fill={surfaceConfig.fabricProperties?.fabricType === 'paper' ? '#f8f8f8' : '#f5f5f5'}
          />
          
          {/* Enhanced product background */}
          {canvasImage ? (
            <>
              <Group>
                <Rect
                  x={0}
                  y={0}
                  width={canvasConfig.width}
                  height={canvasConfig.height}
                  fill={activeColor}
                />
                
                <KonvaImage
                  name="canvas-bg"
                  image={canvasImage}
                  x={0}
                  y={0}
                  width={canvasConfig.width}
                  height={canvasConfig.height}
                  globalCompositeOperation="destination-in"
                />
              </Group>
              
              <KonvaImage
                image={canvasImage}
                x={0}
                y={0}
                width={canvasConfig.width}
                height={canvasConfig.height}
                opacity={surfaceConfig.fabricProperties?.fabricType === 'leather' ? 0.12 : 0.08}
                globalCompositeOperation="multiply"
              />
            </>
          ) : (
            <Rect
              x={0}
              y={0}
              width={canvasConfig.width}
              height={canvasConfig.height}
              fill={activeColor}
              opacity={0.3}
            />
          )}
          
          {/* Enhanced printable area indicator */}
          <Rect
            x={printableArea.x}
            y={printableArea.y}
            width={printableArea.width}
            height={printableArea.height}
            stroke={brandColor}
            strokeWidth={2}
            dash={[6, 4]}
            listening={false}
          />
          
          {/* Fabric-specific guides from PayloadCMS configuration */}
          {fabricSettings.enableRealisticFabric && surfaceConfig.fabricProperties?.fabricType === 'leather' && (
            <Rect
              x={printableArea.x - 10}
              y={printableArea.y - 10}
              width={printableArea.width + 20}
              height={printableArea.height + 20}
              stroke="#8B4513"
              strokeWidth={1}
              dash={[2, 2]}
              listening={false}
              opacity={0.5}
            />
          )}
          
          {/* Design elements with enhanced clipping and proper transparency */}
          <Group
            clipFunc={(ctx) => {
              ctx.beginPath();
              ctx.rect(printableArea.x, printableArea.y, printableArea.width, printableArea.height);
              ctx.closePath();
              ctx.clip();
            }}
          >
            {renderEnhancedDesignElements()}
          </Group>
          
          {/* Enhanced transformer */}
          <Transformer
            ref={transformerRef}
            anchorStroke={brandColor}
            anchorFill="#FFFFFF"
            anchorSize={8}
            borderStroke={brandColor}
            borderDash={[4, 4]}
            rotateAnchorOffset={25}
            enabledAnchors={[
              'top-left', 'top-center', 'top-right',
              'middle-left', 'middle-right',
              'bottom-left', 'bottom-center', 'bottom-right',
            ]}
          />
        </Layer>
      </Stage>
    );
  }, [getCanvasConfig, getPrintableAreaFromPhoto, canvasImages, activeArea, activeColor, handleStageClick, brandColor, forceUpdate, getDynamicSurfaceConfiguration, fabricSettings]);
  
  const renderEnhancedDesignElements = useCallback(() => {
    const sortedElements = [...(designElements[activeArea] || [])].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    const printableArea = getPrintableAreaFromPhoto();
    const surfaceConfig = getDynamicSurfaceConfiguration();
    
    return sortedElements.map(el => {
      if (el.type === 'image' && el.image) {
        // Enhanced element effects based on fabric type from PayloadCMS
        let elementOpacity = 1;
        let elementFilters = '';
        
        if (fabricSettings.enableRealisticFabric) {
          switch (surfaceConfig.fabricProperties?.fabricType) {
            case 'cotton':
              elementOpacity = 0.98;
              break;
            case 'leather':
              elementOpacity = 0.95;
              elementFilters = 'contrast(1.1) brightness(0.95)';
              break;
            case 'canvas':
              elementOpacity = 0.96;
              elementFilters = 'contrast(1.15) brightness(0.92)';
              break;
          }
        }
        
        return (
          <KonvaImage
            key={el.id}
            id={el.id}
            image={el.image}
            x={el.x}
            y={el.y}
            width={el.width}
            height={el.height}
            rotation={el.rotation}
            scaleX={el.scaleX}
            scaleY={el.scaleY}
            draggable={true}
            visible={true}
            listening={true}
            perfectDrawEnabled={false}
            opacity={elementOpacity}
            // Enhanced PNG transparency handling
            globalCompositeOperation="source-over"
            onClick={(e) => handleSelect(el.id, e)}
            onTap={(e) => handleSelect(el.id, e)}
            onMouseDown={(e) => handleSelect(el.id, e)}
            onDragEnd={(e) => {
              const node = e.target;
              const newX = node.x();
              const newY = node.y();
              
              // Enhanced constraint with fabric considerations from PayloadCMS
              let marginX = 0;
              let marginY = 0;
              
              if (fabricSettings.enableRealisticFabric && surfaceConfig.fabricProperties?.fabricType === 'leather') {
                marginX = 5; // Extra margin for stitching
                marginY = 5;
              }
              
              const constrainedX = Math.max(printableArea.x + marginX, 
                Math.min(newX, printableArea.x + printableArea.width - el.width - marginX));
              const constrainedY = Math.max(printableArea.y + marginY, 
                Math.min(newY, printableArea.y + printableArea.height - el.height - marginY));
              
              node.x(constrainedX);
              node.y(constrainedY);
              
              setDesignElements(prev => {
                const updated = (prev[activeArea] || []).map(element => {
                  if (element.id !== el.id) return element;
                  return { ...element, x: constrainedX, y: constrainedY };
                });
                return { ...prev, [activeArea]: updated };
              });
              
              triggerUpdate();
            }}
            onTransformEnd={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              const newWidth = Math.max(20, node.width() * scaleX);
              const newHeight = Math.max(20, node.height() * scaleY);
              
              // Reset scale and update dimensions
              node.scaleX(1);
              node.scaleY(1);
              node.width(newWidth);
              node.height(newHeight);
              
              setDesignElements(prev => {
                const updated = (prev[activeArea] || []).map(element => {
                  if (element.id !== el.id) return element;
                  return {
                    ...element,
                    x: node.x(),
                    y: node.y(),
                    rotation: node.rotation(),
                    width: newWidth,
                    height: newHeight,
                    scaleX: 1,
                    scaleY: 1,
                  };
                });
                return { ...prev, [activeArea]: updated };
              });
              
              triggerUpdate();
            }}
          />
        );
      }
      return null;
    });
  }, [designElements, activeArea, handleSelect, getPrintableAreaFromPhoto, getDynamicSurfaceConfiguration, fabricSettings, triggerUpdate]);

  
  // =====================================
  // ENHANCED PREVIEW RENDERING WITH DYNAMIC DATA
  // =====================================
  
  const renderEnhancedPreview = useCallback(() => {
    const surfaceConfig = getDynamicSurfaceConfiguration();
    const allMockups = getDynamicMockupsForColor(activeColor);
    const currentHero = selectedHeroMockup || allMockups[0] || null;
    
    if (allMockups.length > 0 && currentHero) {
      const canvasConfigs = getAllCanvasConfigs();
      const printableAreas = getAllPrintableAreas();
      
      return (
        <div className="flex justify-center items-center p-6 overflow-y-auto h-full">
          <div className="relative">
            <div className="w-[500px] h-[500px]">
              <EnhancedMockupEngine
                key={`${currentHero.id}-${activeColor}-${forceUpdate}`}
                mockup={currentHero}
                designElements={designElements}
                canvasConfigs={canvasConfigs}
                canvasPrintableAreas={printableAreas}
                displayDimensions={{ width: 500, height: 500 }}
                productType={productData.productType || surfaceConfig.renderType}
                productColor={activeColor}
                fabricSettings={fabricSettings}
              />
            </div>
            
            {/* Enhanced debug toggle with dynamic data */}
            {debugMode && (
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-95 text-white text-xs p-4 rounded-lg max-w-xs">
                <div className="font-bold text-blue-300 mb-2">🔧 DYNAMIC DEBUG INFO</div>
                <div>Surface: {surfaceConfig.renderType}</div>
                <div>Fabric: {surfaceConfig.fabricProperties?.fabricType}</div>
                <div>Fabric Effects: {fabricSettings.enableRealisticFabric ? 'ON' : 'OFF'}</div>
                <div>Product Type: {productData.productType}</div>
                <div>Brand: {productData.brand}</div>
                <div>Material: {productData.materials?.primary}</div>
                <div>Visible Areas: {currentHero.visibleAreas?.map(a => a.areaName).join(', ')}</div>
                <div>Total Elements: {Object.values(designElements).flat().length}</div>
                <div>Color: {activeColor}</div>
                <div>Mockup Type: {currentHero.mockupType}</div>
                <div>View Angle: {currentHero.viewAngle}</div>
                <div>Force Update: {forceUpdate}</div>
                <div>Lighting: {currentHero.lightingConditions?.lightIntensity}</div>
                <div>Fabric Weight: {currentHero.fabricProperties?.fabricWeight}g</div>
                <div>Technology: {activeTechnology}</div>
              </div>
            )}
            
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={() => setDebugMode(!debugMode)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  debugMode 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {debugMode ? 'Hide Debug' : 'Show Debug'}
              </button>
              
              <button
                onClick={() => setFabricSettings(prev => ({ ...prev, enableRealisticFabric: !prev.enableRealisticFabric }))}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  fabricSettings.enableRealisticFabric 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {fabricSettings.enableRealisticFabric ? 'Fabric: ON' : 'Fabric: OFF'}
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <div className="text-4xl mb-4">🎨</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Dynamic Professional Preview</h2>
          <p className="text-gray-600 mb-8">
            Create your design first, then preview with realistic fabric integration powered by PayloadCMS
          </p>
          <button
            onClick={() => setActiveView('design')}
            className="px-6 py-2 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            style={{ backgroundColor: brandColor }}
          >
            ← Back to Design
          </button>
        </div>
      </div>
    );
  }, [
    getDynamicSurfaceConfiguration,
    getDynamicMockupsForColor,
    activeColor,
    selectedHeroMockup,
    designElements,
    getAllCanvasConfigs,
    getAllPrintableAreas,
    debugMode,
    setActiveView,
    brandColor,
    productData,
    forceUpdate,
    fabricSettings,
    activeTechnology
  ]);
  
  // Get dynamic library images from PayloadCMS (if available)
  const getDynamicLibraryImages = useCallback(() => {
    // Check if there's a library configuration in PayloadCMS
    if (productData?.displayImages?.length > 0) {
      return productData.displayImages.map((img: any, index: number) => ({
        id: `library_${index}`,
        src: img.image?.url || '',
        name: img.title || `Library Image ${index + 1}`
      }));
    }
    
    // Fallback to empty array instead of hardcoded images
    return [];
  }, [productData]);
  
  // =====================================
  // DYNAMIC SIDEBAR CONTENT
  // =====================================
  
  const renderDynamicSidebarContent = () => {
    switch (activeTab) {
      case 'colors':
        return (
          <div className="p-4">
            <h3 className="mb-3 text-lg font-medium">Product Colors</h3>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {productData.colorOptions?.map((color: any) => (
                <button
                  key={color.id}
                  onClick={() => handleColorChange(color.colorHex, color.colorName)}
                  className={`flex items-center justify-center w-10 h-10 border rounded-full transition-all ${
                    selectedColors.some(c => c.value === color.colorHex) 
                      ? 'border-2 border-red-600 scale-110' 
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.colorHex }}
                  title={color.colorName}
                >
                  {selectedColors.some(c => c.value === color.colorHex) && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
                         fill={color.colorHex === '#ffffff' ? 'black' : 'white'} width="12" height="12">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            
            <h3 className="mb-3 text-lg font-medium">Selected Colors</h3>
            <div className="space-y-2">
              {selectedColors.map(color => (
                <div key={color.value} className="flex items-center justify-between p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 mr-3 border border-gray-200 rounded-full"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="font-medium">{color.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveColor(color.value)}
                      className={`p-1 rounded transition-colors ${activeColor === color.value ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:bg-gray-200'}`}
                      title="Set as active color"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    {selectedColors.length > 1 && (
                      <button 
                        onClick={() => removeColor(color.value)}
                        className="p-1 text-red-600 rounded hover:bg-red-50 transition-colors"
                        title="Remove color"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
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
          <div className="p-4">
            <h3 className="mb-3 text-lg font-medium">Available Sizes</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {productData.sizeOptions?.map((size: any) => (
                <button
                  key={size.id}
                  onClick={() => toggleSizeSelection(size.sizeName)}
                  className={`py-2 px-3 rounded-md border text-sm font-medium transition-all ${
                    selectedSizes.includes(size.sizeName) 
                      ? 'text-white border-red-600 transform scale-105' 
                      : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400 hover:scale-105'
                  }`}
                  style={{ 
                    backgroundColor: selectedSizes.includes(size.sizeName) ? brandColor : ''
                  }}
                  title={size.sizeDescription || size.sizeName}
                >
                  {size.sizeName}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedSizes(allSizes)}
                className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={() => setSelectedSizes([])}
                className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        );
        
      case 'fabric':
        return (
          <div className="p-4">
            <h3 className="mb-3 text-lg font-medium">Fabric Settings</h3>
            
            {/* Display dynamic material info from PayloadCMS */}
            {productData?.materials && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Product Material Info</h4>
                <div className="text-sm text-blue-700">
                  <div>Primary: {productData.materials.primary}</div>
                  {productData.materials.weight && <div>Weight: {productData.materials.weight}</div>}
                  {productData.materials.construction && <div>Construction: {productData.materials.construction}</div>}
                  {productData.materials.finish && <div>Finish: {productData.materials.finish}</div>}
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={fabricSettings.enableRealisticFabric}
                    onChange={(e) => setFabricSettings(prev => ({ ...prev, enableRealisticFabric: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Enable Realistic Fabric</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={fabricSettings.dynamicVisibility}
                    onChange={(e) => setFabricSettings(prev => ({ ...prev, dynamicVisibility: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Dynamic Visibility</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={fabricSettings.adaptiveBlending}
                    onChange={(e) => setFabricSettings(prev => ({ ...prev, adaptiveBlending: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Adaptive Blending</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Global Fabric Type</label>
                <select
                  value={fabricSettings.globalFabricType}
                  onChange={(e) => setFabricSettings(prev => ({ ...prev, globalFabricType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="cotton">Cotton</option>
                  <option value="polyester">Polyester</option>
                  <option value="canvas">Canvas</option>
                  <option value="leather">Leather</option>
                  <option value="paper">Paper</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fabric Intensity: {Math.round(fabricSettings.fabricIntensity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={fabricSettings.fabricIntensity}
                  onChange={(e) => setFabricSettings(prev => ({ ...prev, fabricIntensity: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Lighting Intensity: {Math.round(fabricSettings.lightingIntensity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={fabricSettings.lightingIntensity}
                  onChange={(e) => setFabricSettings(prev => ({ ...prev, lightingIntensity: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Shadow Intensity: {Math.round(fabricSettings.shadowIntensity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={fabricSettings.shadowIntensity}
                  onChange={(e) => setFabricSettings(prev => ({ ...prev, shadowIntensity: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        );
        
      case 'upload':
        return (
          <div className="p-4">
            <h3 className="mb-3 text-lg font-medium">Add Images</h3>
            
            <div className="mb-4">
              <label className="block w-full px-4 py-8 text-center border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50 hover:border-red-300 transition-all">
                <svg className="w-12 h-12 mx-auto text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="block mt-2 text-sm font-medium">Click to upload image</span>
                <span className="block text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      addImage(URL.createObjectURL(file), file.name);
                    }
                  }}
                />
              </label>
            </div>
            
            <div>
              <h4 className="mb-2 text-sm font-medium">Design Layers ({activeArea})</h4>
              <div className="space-y-2">
                {(designElements[activeArea] || []).length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-4">No elements added yet</p>
                ) : (
                  [...(designElements[activeArea] || [])].sort((a, b) => b.zIndex - a.zIndex).map((element) => (
                    <div 
                      key={element.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedId === element.id ? 'border-red-600 bg-red-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedId(element.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {element.image && (
                            <div className="w-12 h-12 bg-gray-100 rounded border overflow-hidden">
                              <img 
                                src={element.imageUrl || ''} 
                                alt={element.imageName || 'Image'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium truncate">
                              {element.imageName || 'Image'}
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setDesignElements(prev => ({
                                  ...prev,
                                  [activeArea]: (prev[activeArea] || []).filter(el => el.id !== element.id),
                                }));
                                if (selectedId === element.id) setSelectedId(null);
                                triggerUpdate();
                              }}
                              className="p-1 text-red-600 rounded hover:bg-red-100 transition-colors"
                              title="Delete element"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="text-xs text-gray-500 mt-1">
                            Layer {element.zIndex + 1} • {element.width && element.height ? `${Math.round(element.width)}×${Math.round(element.height)}px` : 'No size'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'library':
        const libraryImages = getDynamicLibraryImages();
        return (
          <div className="p-4">
            <h3 className="mb-3 text-lg font-medium">Image Library</h3>
            {libraryImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {libraryImages.map(img => (
                  <div 
                    key={img.id}
                    className="p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 hover:shadow-sm transition-all"
                    onClick={() => addImage(img.src, img.name)}
                  >
                    <img 
                      src={resolveDynamicImageUrl(img.src)} 
                      alt={img.name} 
                      className="object-contain w-full aspect-square rounded"
                      onError={(e) => {
                        e.currentTarget.src = img.src;
                      }}
                    />
                    <p className="mt-1 text-xs text-center text-gray-600 font-medium">{img.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No library images available</p>
                <p className="text-xs text-gray-400">Configure display images in PayloadCMS</p>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  // Update selected element tracking
  useEffect(() => {
    const transformer = transformerRef.current;
    const layer = layerRef.current;
    if (!transformer || !layer) return;

    if (selectedId) {
      const selectedNode = layer.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformer.nodes([selectedNode as Konva.Node]);
        transformer.getLayer()?.batchDraw();
      } else {
        transformer.nodes([]);
      }
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedId, designElements, activeArea]);
  
  // Load canvas images dynamically from PayloadCMS
  useEffect(() => {
    const loadCanvasImages = async () => {
      const technology = getCurrentTechnology();
      if (!technology?.customizationAreas) return;
      
      for (const area of technology.customizationAreas) {
        const areaName = area.areaName.toLowerCase();
        
        try {
          if (!area.designCanvasPhotos?.length) continue;
          
          let photo = area.designCanvasPhotos.find((p: any) => 
            p?.photoColor?.toLowerCase() === activeColor?.toLowerCase()
          );
          
          if (!photo && area.designCanvasPhotos.length > 0) {
            photo = area.designCanvasPhotos[0];
          }
          
          if (!photo?.photo?.url) continue;
          
          const img = new Image();
          img.crossOrigin = "anonymous";
          const resolvedUrl = resolveDynamicImageUrl(photo.photo.url);
          img.src = resolvedUrl;
          
          img.onload = () => {
            const key = `${areaName}_${activeColor}`;
            setCanvasImages(prev => ({ ...prev, [key]: img }));
          };
          
          img.onerror = (error) => {
            console.error(`Could not load canvas image for ${areaName} at: ${resolvedUrl}`, error);
          };
        } catch (error) {
          console.error(`Error loading canvas image for ${areaName}:`, error);
        }
      }
    };
    
    loadCanvasImages();
  }, [activeColor, activeTechnology, getCurrentTechnology]);
  
  // Update active area when technology changes
  useEffect(() => {
    const currentAreas = getAvailableAreas();
    if (!currentAreas.includes(activeArea) && currentAreas.length > 0) {
      setActiveArea(currentAreas[0]);
    }
  }, [activeTechnology, getAvailableAreas, activeArea]);
  
  // Clear selection when switching to preview
  useEffect(() => {
    if (activeView === 'preview') {
      setSelectedId(null);
    }
  }, [activeView]);
  
  // Initialize design elements for new areas
  useEffect(() => {
    setDesignElements(prev => {
      const newElements = { ...prev };
      availableAreas.forEach(area => {
        if (!newElements[area]) {
          newElements[area] = [];
        }
      });
      return newElements;
    });
  }, [availableAreas]);
  
  // Force update when switching views to ensure preview updates
  useEffect(() => {
    triggerUpdate();
  }, [activeView, fabricSettings, triggerUpdate]);
  
  if (!productData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading dynamic professional designer...</p>
        </div>
      </div>
    );
  }
  
  // =====================================
  // DYNAMIC MAIN RENDER
  // =====================================
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Dynamic Sidebar - Design Mode Only */}
      {activeView === 'design' && (
        <div className="flex flex-col w-1/4 bg-white border-r border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">{productData.name}</h1>
              <p className="text-xs text-gray-500">Dynamic Professional Designer</p>
              <p className="text-xs text-blue-600">Brand: {productData.brand}</p>
            </div>
            <div className="flex gap-2">
              <div className="text-xs text-gray-500 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {getDynamicSurfaceConfiguration().renderType.toUpperCase()}
              </div>
              {fabricSettings.enableRealisticFabric && (
                <div className="text-xs text-gray-500 bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  FABRIC
                </div>
              )}
            </div>
          </div>
          
          <div className="flex border-b border-gray-200">
            {(['colors', 'sizes', 'upload', 'library', 'fabric'] as const).map(tab => (
              <button
                key={tab}
                className={`flex-1 py-3 text-sm font-medium capitalize transition-all ${
                  activeTab === tab 
                    ? 'border-b-2 text-red-600 bg-red-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                style={{ 
                  borderColor: activeTab === tab ? brandColor : '',
                  color: activeTab === tab ? brandColor : ''
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'fabric' ? '🧵' : ''} {tab}
              </button>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {renderDynamicSidebarContent()}
          </div>
        </div>
      )}

      {/* Dynamic Preview Sidebar */}
      {activeView === 'preview' && (
        <div className="w-80 bg-white border-r border-gray-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Dynamic Professional Preview</h2>
            <p className="text-sm text-gray-600">Realistic fabric integration from PayloadCMS</p>
            {fabricSettings.enableRealisticFabric && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-700 font-medium">Fabric Effects Active</span>
              </div>
            )}
          </div>
          
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Selected Colors</h3>
            <div className="grid grid-cols-4 gap-2">
              {selectedColors.map(color => (
                <button
                  key={color.value}
                  onClick={() => {
                    setActiveColor(color.value);
                    setSelectedHeroMockup(null);
                    triggerUpdate();
                  }}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                    activeColor === color.value
                      ? 'bg-blue-50 shadow-md ring-2 ring-blue-600'
                      : 'hover:bg-gray-50 hover:shadow-sm'
                  }`}
                  title={color.name}
                >
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-xs mt-1 font-medium truncate">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Dynamic Professional Views</h3>
            <div className="space-y-4">
              {(() => {
                const mockups = getDynamicMockupsForColor(activeColor);
                
                if (mockups.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-500 mt-2">No mockups available for this color</p>
                      <p className="text-xs text-gray-400">Configure mockup photos in PayloadCMS</p>
                    </div>
                  );
                }
                
                return (
                  <div className="grid grid-cols-2 gap-2">
                    {mockups.map((mockup: DynamicMockupPhoto) => (
                      <EnhancedDynamicThumbnail
                        key={`${mockup.id}-${forceUpdate}`}
                        mockup={mockup}
                        designElements={designElements}
                        canvasConfigs={getAllCanvasConfigs()}
                        canvasPrintableAreas={getAllPrintableAreas()}
                        surfaceConfig={getDynamicSurfaceConfiguration()}
                        productColor={activeColor}
                        isSelected={selectedHeroMockup?.id === mockup.id}
                        onSelect={() => {
                          setSelectedHeroMockup(mockup);
                          triggerUpdate();
                        }}
                        fabricSettings={fabricSettings}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-100 space-y-2">
            <button
              onClick={() => setActiveView('design')}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
            >
              ← Back to Design
            </button>
            
            <button
              className="w-full px-4 py-2 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              style={{ backgroundColor: brandColor }}
              onClick={() => {
                alert('Dynamic mockup export functionality will be integrated here');
              }}
            >
              Export Dynamic Mockups →
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Main Content Area */}
      <div className={`flex flex-col ${activeView === 'design' ? 'w-3/4' : 'flex-1'}`}>
        {/* Dynamic Header - Design Mode Only */}
        {activeView === 'design' && (
          <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="mr-2 text-sm font-medium">Technology:</span>
                <select
                  value={activeTechnology}
                  onChange={(e) => setActiveTechnology(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {productData.printTech?.map((tech: any) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.techName.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <span className="mr-2 text-sm font-medium">Area:</span>
                <div className="flex space-x-1">
                  {availableAreas.map(area => (
                    <button
                      key={area}
                      onClick={() => setActiveArea(area)}
                      className={`px-3 py-1 text-sm rounded capitalize transition-all ${
                        activeArea === area ? 'text-white shadow-sm' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                      style={{ 
                        backgroundColor: activeArea === area ? brandColor : ''
                      }}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveView('design')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  activeView === 'design' 
                    ? 'text-white shadow-sm' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                style={{ 
                  backgroundColor: activeView === 'design' ? brandColor : ''
                }}
              >
                Design
              </button>
              <button
                onClick={() => {
                  setActiveView('preview');
                  triggerUpdate();
                }}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  activeView === 'preview' 
                    ? 'text-white shadow-sm' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                style={{ 
                  backgroundColor: activeView === 'preview' ? brandColor : ''
                }}
              >
                🧵 Dynamic Preview
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Canvas/Preview Area */}
        <div className="flex-1 min-h-0">
          {activeView === 'preview' ? (
            renderEnhancedPreview()
          ) : (
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex justify-center">
                <div className="relative">
                  {renderEnhancedCanvas()}
                  
                  {/* Dynamic design controls */}
                  {selectedId && (
                    <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-3">
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-2">Alignment</div>
                          <div className="grid grid-cols-3 gap-1">
                            <button 
                              onClick={() => {
                                if (!selectedId) return;
                                const printableArea = getPrintableAreaFromPhoto();
                                setDesignElements(prev => {
                                  const updated = (prev[activeArea] || []).map(el => {
                                    if (el.id !== selectedId) return el;
                                    const newX = printableArea.x + (printableArea.width - (el.width || 0)) / 2;
                                    return { ...el, x: newX };
                                  });
                                  return { ...prev, [activeArea]: updated };
                                });
                                triggerUpdate();
                              }}
                              className="p-2 text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              title="Center horizontally"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 17h8M12 3v18" />
                              </svg>
                            </button>
                            
                            <button 
                              onClick={() => {
                                if (!selectedId) return;
                                const printableArea = getPrintableAreaFromPhoto();
                                setDesignElements(prev => {
                                  const updated = (prev[activeArea] || []).map(el => {
                                    if (el.id !== selectedId) return el;
                                    const newX = printableArea.x + (printableArea.width - (el.width || 0)) / 2;
                                    const newY = printableArea.y + (printableArea.height - (el.height || 0)) / 2;
                                    return { ...el, x: newX, y: newY };
                                  });
                                  return { ...prev, [activeArea]: updated };
                                });
                                triggerUpdate();
                              }}
                              className="p-2 text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              title="Center both"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18M3 12h18" />
                              </svg>
                            </button>
                            
                            <button 
                              onClick={() => {
                                if (!selectedId) return;
                                const printableArea = getPrintableAreaFromPhoto();
                                setDesignElements(prev => {
                                  const updated = (prev[activeArea] || []).map(el => {
                                    if (el.id !== selectedId) return el;
                                    const newY = printableArea.y + (printableArea.height - (el.height || 0)) / 2;
                                    return { ...el, y: newY };
                                  });
                                  return { ...prev, [activeArea]: updated };
                                });
                                triggerUpdate();
                              }}
                              className="p-2 text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              title="Center vertically"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8v8M17 8v8M3 12h18" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-3">
                          <div className="text-xs font-medium text-gray-700 mb-2">Tools</div>
                          <div className="flex space-x-1">
                            <button 
                              onClick={deleteSelectedElement}
                              className="p-2 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                              title="Delete element"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Dynamic info panel with PayloadCMS data */}
                  <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 font-medium">Canvas:</span> 
                        <div className="text-gray-800">{getCurrentCanvasDimensions().canvasPixelWidth}×{getCurrentCanvasDimensions().canvasPixelHeight}px</div>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Real Size:</span> 
                        <div className="text-gray-800">{getCurrentCanvasDimensions().widthInches}"×{getCurrentCanvasDimensions().heightInches}"</div>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Elements:</span> 
                        <div className="text-gray-800">{(designElements[activeArea] || []).length}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Fabric:</span> 
                        <div className="text-gray-800">{fabricSettings.globalFabricType.toUpperCase()}</div>
                      </div>
                    </div>
                    
                    {/* Dynamic fabric status indicators with PayloadCMS data */}
                    {fabricSettings.enableRealisticFabric && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-4 gap-4 text-xs">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-gray-600">Fabric: Active</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-gray-600">Lighting: {Math.round(fabricSettings.lightingIntensity * 100)}%</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                            <span className="text-gray-600">Intensity: {Math.round(fabricSettings.fabricIntensity * 100)}%</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                            <span className="text-gray-600">Material: {productData?.materials?.primary || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDynamicDesigner;