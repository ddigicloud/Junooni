import React, { useRef, useState, useEffect } from 'react';
import Konva from 'konva';
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text as KonvaText,
  Rect,
  Group,
  Transformer,
} from 'react-konva';
import RealisticMockupGenerator, { ShirtSide, DesignElement, MockupTemplate } from './mockupgenerator';

// import {useSearch} from "@tansktack/react-router";

// const {color : selectedColor} = useSearch();

// Type definitions for PayloadCMS API response
interface ProductColor {
  id: string;
  colorName: string;
  colorHex: string;
}

interface ProductSize {
  id: string;
  sizeName: string;
  sizeDescription: string;
}

interface CustomizableArea {
  id: string;
  areaName: string;
  photos: Array<{
    id: string;
    photo: {
      id: number;
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    photoColor: string;
    customizableWidth: number;
    customizableHeight: number;
    x: number;
    y: number;
  }>;
}

interface MockupPhoto {
  id: string;
  title: string | null;
  photo: {
    id: number;
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  skew: number;
  scale: number;
  photoColor: string;
}

interface PrintingTechnology {
  id: string;
  technologyName: string;
  customizationAreas: CustomizableArea[];
  mockupPhotos: MockupPhoto[];
}

interface ProductData {
  id: number;
  name: string;
  sku: string;
  brand: string;
  colorOptions: ProductColor[];
  sizeOptions: ProductSize[];
  printingTechnologies: PrintingTechnology[];
  displayImages: Array<{
    id: string;
    title: string;
    image: {
      id: number;
      url: string;
      alt: string;
    };
    caption: string;
  }>;
}

// Sample library images for testing (can be replaced with API data)
const sampleLibraryImages = [
  { id: 'img1', src: '/images/library/logo1.png', name: 'Logo 1' },
  { id: 'img2', src: '/images/library/logo2.png', name: 'Logo 2' },
  { id: 'img3', src: '/images/library/pattern1.png', name: 'Pattern 1' },
  { id: 'img4', src: '/images/library/icon1.png', name: 'Icon 1' },
  { id: 'img5', src: '/images/library/design1.png', name: 'Design 1' },
  { id: 'img6', src: '/images/library/text1.png', name: 'Text Art 1' },
];

interface TShirtDesignerProps {
  productData: ProductData;
}

const DynamicTShirtDesigner: React.FC<TShirtDesignerProps> = ({ productData }) => {
  // Active view (design or preview)
  const [activeView, setActiveView] = useState<'design' | 'preview'>('design');
  
  // Active tab in the sidebar
  const [activeTab, setActiveTab] = useState<'colors' | 'sizes' | 'upload' | 'library'>('colors');
  
  // Selected printing technology
  const [activeTechnology, setActiveTechnology] = useState<string>(
    productData.printingTechnologies[0]?.id || ''
  );
  
  // Get all available sizes from product data
  const allSizes = productData.sizeOptions.map(size => size.sizeName);
  
  // Selected sizes (now multi-select)
  const [selectedSizes, setSelectedSizes] = useState<string[]>(allSizes);
  
  // Store T-shirt images for each side
  const [shirtImages, setShirtImages] = useState<{
    front: HTMLImageElement | null;
    back: HTMLImageElement | null;
    left: HTMLImageElement | null;
    right: HTMLImageElement | null;
  }>({
    front: null,
    back: null,
    left: null,
    right: null,
  });

  // Active side (front, back, left, right)
  const [activeSide, setActiveSide] = useState<ShirtSide>('front');
  
  // Active mockup template
  const [mockupTemplate, setMockupTemplate] = useState<MockupTemplate>('model-male');
  
  // Multiple color selection
  const [selectedColors, setSelectedColors] = useState<{value: string, name: string}[]>(
    productData.colorOptions.length > 0 
      ? [{ value: productData.colorOptions[0].colorHex, name: productData.colorOptions[0].colorName }]
      : []
  );
  
  // Active color (the one currently being displayed/edited)
  const [activeColor, setActiveColor] = useState<string>(
    productData.colorOptions.length > 0 ? productData.colorOptions[0].colorHex : '#000000'
  );

  // Design elements for each side
  const [designElements, setDesignElements] = useState<{
    front: DesignElement[];
    back: DesignElement[];
    left: DesignElement[];
    right: DesignElement[];
  }>({
    front: [],
    back: [],
    left: [],
    right: [],
  });

  // Track selected element id for Transformer
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Konva refs
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Stage dimensions
  const stageWidth = 600;
  const stageHeight = 600;

  // Get the current technology data
  const getCurrentTechnology = () => {
    return productData.printingTechnologies.find(tech => tech.id === activeTechnology);
  };

  // Get customization areas for the current technology
  const getCustomizationAreas = () => {
    const technology = getCurrentTechnology();
    return technology?.customizationAreas || [];
  };

  // Get the appropriate customization area for the active side
  const getCustomizationAreaForSide = (side: ShirtSide) => {
    const areas = getCustomizationAreas();
    // Map side to area name
    const areaName = side.charAt(0).toUpperCase() + side.slice(1); // Capitalize first letter
    return areas.find(area => area.areaName === areaName);
  };

  // Get the appropriate photo for the active side and color
  const getPhotoForSideAndColor = (side: ShirtSide, color: string) => {
    const area = getCustomizationAreaForSide(side);
    if (!area) return null;
    
    // First try to find an exact color match
    let photo = area.photos.find(p => p.photoColor.toLowerCase() === color.toLowerCase());
    
    // If no exact match, try to find the closest or default to the first photo
    if (!photo && area.photos.length > 0) {
      // For simplicity, just use the first available photo
      photo = area.photos[0];
    }
    
    return photo;
  };

  // Calculate printing area based on customization data
  const calculatePrintingArea = (side: ShirtSide) => {
    const photo = getPhotoForSideAndColor(side, activeColor);
    if (!photo) {
      // Default values if no customization data is available
      return { x: 180, y: 120, width: 240, height: 320 };
    }
    
    // Calculate position and dimensions based on API data
    // Scale the values to match the stage dimensions
    const scaleX = stageWidth / photo.photo.width;
    const scaleY = stageHeight / photo.photo.height;
    
    return {
      x: photo.x * scaleX,
      y: photo.y * scaleY,
      width: photo.customizableWidth * scaleX,
      height: photo.customizableHeight * scaleY
    };
  };

  // Dynamic printing areas based on selected technology and color
  const getPrintingAreas = () => {
    const areas: Record<ShirtSide, { x: number; y: number; width: number; height: number }> = {
      front: calculatePrintingArea('front'),
      back: calculatePrintingArea('back'),
      left: calculatePrintingArea('left'),
      right: calculatePrintingArea('right'),
    };
    
    return areas;
  };

  // Get the dynamic printing area for the active side
  const printingAreas = getPrintingAreas();

  // Load T-shirt images based on product data
  useEffect(() => {
    // Load images based on current technology, side, and color
    const loadShirtImage = (side: ShirtSide) => {
      const photo = getPhotoForSideAndColor(side, activeColor);
      if (!photo) return;
      
      const img = new Image();
      img.src = photo.photo.url; // URL should already include base URL
      img.onload = () => {
        setShirtImages((prev) => ({ ...prev, [side]: img }));
      };
      
      img.onerror = () => {
        console.error(`Could not load the T-shirt image for ${side} at: ${photo.photo.url}`);
      };
    };

    // Try to load images for all sides
    loadShirtImage('front');
    loadShirtImage('back');
    loadShirtImage('left');
    loadShirtImage('right');
  }, [activeColor, activeTechnology]); // Reload when color or technology changes

  // Keep the Transformer in sync with the selected node
  useEffect(() => {
    const transformer = transformerRef.current;
    const layer = layerRef.current;
    if (!transformer || !layer) return;

    if (selectedId) {
      const selectedNode = layer.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformer.nodes([selectedNode as Konva.Node]);
        transformer.getLayer()?.batchDraw();
      }
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedId, activeSide]);

  // Add Text to the active side
  const addText = () => {
    const area = printingAreas[activeSide];
    const newText: DesignElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'New Text',
      x: area.x + area.width / 2 - 40,
      y: area.y + area.height / 2 - 12,
      fontSize: 24,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      draggable: true,
      selected: false,
    };
    setDesignElements((prev) => ({
      ...prev,
      [activeSide]: [...prev[activeSide], newText],
    }));
  };

  // Add Image to the active side
  const addImage = (imageSrc: string) => {
    const area = printingAreas[activeSide];
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const scaleFactor = Math.min(
        (area.width * 0.7) / img.width,
        (area.height * 0.7) / img.height
      );
      const newWidth = img.width * scaleFactor;
      const newHeight = img.height * scaleFactor;

      const newImage: DesignElement = {
        id: `image-${Date.now()}`,
        type: 'image',
        image: img,
        x: area.x + (area.width - newWidth) / 2,
        y: area.y + (area.height - newHeight) / 2,
        width: newWidth,
        height: newHeight,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        draggable: true,
        selected: false,
      };
      setDesignElements((prev) => ({
        ...prev,
        [activeSide]: [...prev[activeSide], newImage],
      }));
    };
    img.onerror = () => {
      console.log('Could not load user-uploaded image:', imageSrc);
    };
  };

  // Selection logic
  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const target = e.target;
    if (target === e.target.getStage() || target.name() === 'tshirt-bg') {
      setSelectedId(null);
    }
  };

  // Handle transform/drag end (normalize scale)
  const handleTransformEnd = (elementId: string, e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const newWidth = node.width() * scaleX;
    const newHeight = node.height() * scaleY;
    node.scaleX(1);
    node.scaleY(1);

    setDesignElements((prev) => {
      const updated = prev[activeSide].map((el) => {
        if (el.id !== elementId) return el;
        return {
          ...el,
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          width: el.type === 'image' ? newWidth : el.width,
          height: el.type === 'image' ? newHeight : el.height,
          scaleX: 1,
          scaleY: 1,
        };
      });
      return { ...prev, [activeSide]: updated };
    });
  };

  // Handle changing shirt color
  const handleColorChange = (colorValue: string, colorName: string) => {
    // Set the active color for display
    setActiveColor(colorValue);
    
    // Check if this color is already selected
    const isAlreadySelected = selectedColors.some(color => color.value === colorValue);
    
    if (isAlreadySelected) {
      // If already selected, make it the active color but don't add it again
      return;
    }
    
    // Add to selected colors
    setSelectedColors(prev => [...prev, { value: colorValue, name: colorName }]);
  };
  
  // Remove a color from selected colors
  const removeColor = (colorValue: string) => {
    setSelectedColors(prev => prev.filter(color => color.value !== colorValue));
    
    // If we're removing the active color, select another one if available
    if (activeColor === colorValue && selectedColors.length > 1) {
      const newActiveColor = selectedColors.find(color => color.value !== colorValue)?.value || '#000000';
      setActiveColor(newActiveColor);
    }
  };

  // Handle size selection (now multi-select)
  const toggleSizeSelection = (size: string) => {
    setSelectedSizes(prev => {
      // If size is already selected, remove it
      if (prev.includes(size)) {
        return prev.filter(s => s !== size);
      }
      // Otherwise add it
      return [...prev, size];
    });
  };

  // Render design elements for the active side
  const renderDesignElements = () => {
    return designElements[activeSide].map((el) => {
      if (el.type === 'text') {
        return (
          <KonvaText
            key={el.id}
            id={el.id}
            text={el.text || ''}
            x={el.x}
            y={el.y}
            fontSize={el.fontSize}
            rotation={el.rotation}
            scaleX={el.scaleX}
            scaleY={el.scaleY}
            draggable
            onClick={() => handleSelect(el.id)}
            onTap={() => handleSelect(el.id)}
            onDragEnd={(e) => handleTransformEnd(el.id, e)}
            onTransformEnd={(e) => handleTransformEnd(el.id, e)}
          />
        );
      } else if (el.type === 'image' && el.image) {
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
            draggable
            onClick={() => handleSelect(el.id)}
            onTap={() => handleSelect(el.id)}
            onDragEnd={(e) => handleTransformEnd(el.id, e)}
            onTransformEnd={(e) => handleTransformEnd(el.id, e)}
          />
        );
      }
      return null;
    });
  };

  // Delete selected element
  const deleteSelectedElement = () => {
    if (!selectedId) return;
    
    setDesignElements((prev) => ({
      ...prev,
      [activeSide]: prev[activeSide].filter((el) => el.id !== selectedId),
    }));
    
    setSelectedId(null);
  };

  // Keyboard shortcut for delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        deleteSelectedElement();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  // Handle changing printing technology
  const handleTechnologyChange = (technologyId: string) => {
    setActiveTechnology(technologyId);
  };

  // Sidebar content based on active tab and view
  const renderSidebarContent = () => {
    // Special sidebar content for Preview view - Simplified version
    if (activeView === 'preview') {
      return (
        <div className="p-4">
          <h3 className="mb-4 text-lg font-medium">Product Configuration</h3>
          
          {/* Available Colors */}
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-medium">Available Colors</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedColors.map((color) => (
                <div
                  key={color.value}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                    activeColor === color.value ? 'border-blue-500' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setActiveColor(color.value)}
                >
                  {activeColor === color.value && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color.value === '#ffffff' ? 'black' : 'white'} width="14" height="14">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Available Sizes */}
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-medium">Available Sizes</h4>
            <div className="grid grid-cols-4 gap-2">
              {selectedSizes.map((size) => (
                <div
                  key={size}
                  className="px-3 py-2 text-center border border-gray-300 rounded-md bg-gray-50"
                >
                  {size}
                </div>
              ))}
            </div>
          </div>
          
          {/* Price Information */}
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-medium">Price</h4>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold">${productData.cost || 24.99}</p>
                <p className="text-xs text-gray-500">Price per shirt</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">${productData.cost || 24.99}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </div>
          
          {/* Add to Store Button */}
          <button className="w-full py-3 mb-3 font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
            ADD TO STORE
          </button>
          
          <button className="w-full py-2 font-medium text-blue-500 border border-blue-500 rounded-md hover:bg-blue-50">
            Save Design
          </button>
        </div>
      );
    }
    
    // Default Design view sidebar content
    switch (activeTab) {
      case 'colors':
        return (
          <div className="p-4">
            <h3 className="mb-3 text-lg font-medium">Select colors</h3>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {productData.colorOptions.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleColorChange(color.colorHex, color.colorName)}
                  className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-full"
                  style={{ backgroundColor: color.colorHex }}
                  title={color.colorName}
                >
                  {selectedColors.some(c => c.value === color.colorHex) && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color.colorHex === '#ffffff' ? 'black' : 'white'} width="12" height="12">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            
            <h3 className="mb-3 text-lg font-medium">Selected colors</h3>
            <div className="space-y-2">
              {selectedColors.map((color) => (
                <div key={color.value} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 mr-3 border border-gray-200 rounded-full"
                      style={{ backgroundColor: color.value }}
                    />
                    <span>{color.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveColor(color.value)}
                      className={`p-1 rounded ${activeColor === color.value ? 'text-blue-500' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    {selectedColors.length > 1 && (
                      <button 
                        onClick={() => removeColor(color.value)}
                        className="p-1 text-red-600 rounded hover:bg-red-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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
            <h3 className="mb-3 text-lg font-medium">Select Sizes</h3>
            <div className="grid grid-cols-3 gap-2">
              {productData.sizeOptions.map((size) => (
                <button
                  key={size.id}
                  onClick={() => toggleSizeSelection(size.sizeName)}
                  className={`py-2 px-3 rounded-md border ${
                    selectedSizes.includes(size.sizeName) 
                      ? 'bg-blue-500 text-white border-blue-600' 
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  }`}
                  title={size.sizeDescription}
                >
                  {size.sizeName}
                </button>
              ))}
            </div>
            
            <div className="mt-4">
              <button
                onClick={() => setSelectedSizes(allSizes)} // Select all
                className="px-4 py-2 mr-2 text-gray-800 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Select All
              </button>
              <button
                onClick={() => setSelectedSizes([])} // Clear selection
                className="px-4 py-2 text-gray-800 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Clear All
              </button>
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="p-4">
            <h3 className="mb-3 text-lg font-medium">Upload Image</h3>
            <div className="mb-4">
              <label className="block w-full px-4 py-8 text-center border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                <svg className="w-12 h-12 mx-auto text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="block mt-2 text-sm font-medium text-gray-900">
                  Click to upload
                </span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      addImage(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </label>
            </div>
            <button
              onClick={addText}
              className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Add Text
            </button>
          </div>
        );

      case 'library':
        return (
          <div className="p-4">
            <h3 className="mb-3 text-lg font-medium">Image Library</h3>
            <div className="grid grid-cols-2 gap-2">
              {sampleLibraryImages.map((img) => (
                <div 
                  key={img.id}
                  className="p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                  onClick={() => addImage(img.src)}
                >
                  <img src={img.src} alt={img.name} className="object-contain w-full aspect-square" />
                  <p className="mt-1 text-xs text-center text-gray-600">{img.name}</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Left Sidebar (1/4 width) */}
      <div className="flex flex-col w-1/4 bg-white border-r border-gray-200">
        {/* Sidebar Tabs - Only visible in Design view */}
        {activeView === 'design' && (
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'colors' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('colors')}
            >
              Colors
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'sizes' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('sizes')}
            >
              Sizes
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('upload')}
            >
              Add
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'library' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('library')}
            >
              Library
            </button>
          </div>
        )}
        
        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          {renderSidebarContent()}
        </div>
      </div>
      
      {/* Main Content Area (3/4 width) */}
      <div className="flex flex-col w-3/4">
        {/* Top Navigation */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h1 className="text-xl font-bold">{productData.name} Designer</h1>
          
          {/* Printing Technology Selection */}
          {activeView === 'design' && (
            <div className="flex items-center mr-4">
              <span className="mr-2 text-sm font-medium">Print Method:</span>
              <select
                value={activeTechnology}
                onChange={(e) => handleTechnologyChange(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md"
              >
                {productData.printingTechnologies.map(tech => (
                  <option key={tech.id} value={tech.id}>
                    {tech.technologyName.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* View Toggle Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveView('design')}
              className={`px-4 py-2 rounded-md ${
                activeView === 'design' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Design
            </button>
            <button
              onClick={() => setActiveView('preview')}
              className={`px-4 py-2 rounded-md ${
                activeView === 'preview' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {activeView === 'design' ? (
            <div className="flex flex-col h-full">
              {/* Side Selector */}
              <div className="p-3 mb-4 bg-white rounded-lg shadow-sm">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveSide('front')}
                    className={`px-3 py-1 rounded ${activeSide === 'front' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    disabled={!getCustomizationAreaForSide('front')}
                  >
                    Front
                  </button>
                  <button
                    onClick={() => setActiveSide('back')}
                    className={`px-3 py-1 rounded ${activeSide === 'back' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    disabled={!getCustomizationAreaForSide('back')}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActiveSide('left')}
                    className={`px-3 py-1 rounded ${activeSide === 'left' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    disabled={!getCustomizationAreaForSide('left')}
                  >
                    Left
                  </button>
                  <button
                    onClick={() => setActiveSide('right')}
                    className={`px-3 py-1 rounded ${activeSide === 'right' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    disabled={!getCustomizationAreaForSide('right')}
                  >
                    Right
                  </button>
                </div>
              </div>
              
              {/* Design Canvas */}
              <div className="flex justify-center flex-1 p-4 bg-white rounded-lg shadow-sm">
                <div className="relative">
                  <Stage
                    ref={stageRef}
                    width={stageWidth}
                    height={stageHeight}
                    onMouseDown={handleStageClick}
                    onTouchStart={handleStageClick}
                    className="border border-gray-200 rounded-md"
                  >
                    <Layer ref={layerRef}>
                      {/* White background */}
                      <Rect
                        x={0}
                        y={0}
                        width={stageWidth}
                        height={stageHeight}
                        fill="#f8f8f8"
                      />
                      
                      {shirtImages[activeSide] && (
                        <>
                          {/* Colored T-shirt using mask technique */}
                          <Group>
                            {/* Colored rectangle that will be masked by the t-shirt silhouette */}
                            <Rect
                              x={0}
                              y={0}
                              width={stageWidth}
                              height={stageHeight}
                              fill={activeColor}
                            />
                            
                            {/* T-shirt image as a mask */}
                            <KonvaImage
                              name="tshirt-bg"
                              image={shirtImages[activeSide]}
                              x={0}
                              y={0}
                              width={stageWidth}
                              height={stageHeight}
                              globalCompositeOperation="destination-in"
                            />
                          </Group>
                          
                          {/* Shadow/Details Layer - Only for non-white shirts */}
                          {activeColor !== '#ffffff' && (
                            <KonvaImage
                              image={shirtImages[activeSide]}
                              x={0}
                              y={0}
                              width={stageWidth}
                              height={stageHeight}
                              opacity={0.3}
                              globalCompositeOperation="multiply"
                            />
                          )}
                        </>
                      )}

                      {/* Printable area outline */}
                      <Rect
                        x={printingAreas[activeSide].x}
                        y={printingAreas[activeSide].y}
                        width={printingAreas[activeSide].width}
                        height={printingAreas[activeSide].height}
                        stroke="blue"
                        strokeWidth={2}
                        dash={[4, 4]}
                        listening={false}
                      />

                      {/* Design elements clipped to the printing area */}
                      <Group
                        clipFunc={(ctx) => {
                          const area = printingAreas[activeSide];
                          ctx.beginPath();
                          ctx.rect(area.x, area.y, area.width, area.height);
                          ctx.closePath();
                          ctx.clip();
                        }}
                      >
                        {renderDesignElements()}
                      </Group>

                      {/* Transformer for selected elements */}
                      <Transformer
                        ref={transformerRef}
                        anchorStroke="#0000FF"
                        anchorFill="#FFFFFF"
                        anchorSize={8}
                        borderStroke="#0000FF"
                        borderDash={[3, 3]}
                        rotateAnchorOffset={30}
                        enabledAnchors={[
                          'top-left',
                          'top-center',
                          'top-right',
                          'middle-left',
                          'middle-right',
                          'bottom-left',
                          'bottom-center',
                          'bottom-right',
                        ]}
                      />
                    </Layer>
                  </Stage>
                  
                  {/* Design Controls */}
                  {selectedId && (
                    <div className="absolute flex p-2 space-x-2 bg-white rounded-md shadow-md top-4 right-4">
                      <button 
                        onClick={deleteSelectedElement}
                        className="p-1 text-red-600 rounded-md hover:bg-red-50"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>Drag elements to position. Select an element to resize or rotate it.</p>
                <p>The blue outline shows the printable area on each side.</p>
              </div>
            </div>
          ) : (
            // Preview View
            <div className="flex flex-col h-full">
              {/* Side & Style Selector */}
              <div className="p-3 mb-4 bg-white rounded-lg shadow-sm">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center">
                    <span className="mr-2 text-sm font-medium">Side:</span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setActiveSide('front')}
                        className={`px-3 py-1 rounded ${activeSide === 'front' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        disabled={!getCustomizationAreaForSide('front')}
                      >
                        Front
                      </button>
                      <button
                        onClick={() => setActiveSide('back')}
                        className={`px-3 py-1 rounded ${activeSide === 'back' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        disabled={!getCustomizationAreaForSide('back')}
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setActiveSide('left')}
                        className={`px-3 py-1 rounded ${activeSide === 'left' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        disabled={!getCustomizationAreaForSide('left')}
                      >
                        Left
                      </button>
                      <button
                        onClick={() => setActiveSide('right')}
                        className={`px-3 py-1 rounded ${activeSide === 'right' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        disabled={!getCustomizationAreaForSide('right')}
                      >
                        Right
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center ml-auto">
                    <span className="mr-2 text-sm font-medium">Style:</span>
                    <select
                      value={mockupTemplate}
                      onChange={(e) => setMockupTemplate(e.target.value as MockupTemplate)}
                      className="p-2 border border-gray-300 rounded-md"
                    >
                      <option value="flat">Flat Lay</option>
                      <option value="model-male">Male Model</option>
                      <option value="model-female">Female Model</option>
                      <option value="hanging">Hanging</option>
                      <option value="folded">Folded</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Mockup Preview */}
              <div className="flex items-center justify-center flex-1 p-4 bg-white rounded-lg shadow-sm">
                <div className="w-full max-w-xl">
                  <RealisticMockupGenerator
                    activeSide={activeSide}
                    designElements={designElements[activeSide]}
                    mockupTemplate={mockupTemplate}
                    stageWidth={stageWidth}
                    stageHeight={stageHeight}
                    printingArea={printingAreas[activeSide]}
                    shirtColor={activeColor}
                    allColors={selectedColors}
                  />
                </div>
              </div>
              
              {/* Product Details */}
              <div className="p-4 mt-4 bg-white rounded-lg shadow-sm">
                <h3 className="mb-2 font-medium text-md">Product Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Color:</p>
                    <p className="font-medium">
                      {productData.colorOptions.find(c => c.colorHex === activeColor)?.colorName || 'Custom'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sizes:</p>
                    <p className="font-medium">{selectedSizes.join(', ') || 'None selected'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Brand:</p>
                    <p className="font-medium">{productData.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">SKU:</p>
                    <p className="font-medium">{productData.sku}</p>
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

export default DynamicTShirtDesigner;