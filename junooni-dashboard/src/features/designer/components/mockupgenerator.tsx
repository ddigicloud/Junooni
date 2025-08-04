import React, { useRef, useState, useEffect } from 'react';
import Konva from 'konva';
import { Stage, Layer, Image as KonvaImage,  Text as KonvaText, Rect } from 'react-konva';

export interface DesignElement {
  id: string;
  type: 'text' | 'image';
  text?: string;
  image?: HTMLImageElement;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  draggable?: boolean;
  selected?: boolean;
}

export type ShirtSide = 'front' | 'back' | 'left' | 'right';
export type MockupTemplate = 'flat' | 'model-male' | 'model-female' | 'hanging' | 'folded';

interface RealisticMockupProps {
  activeSide: ShirtSide;
  designElements: DesignElement[];
  mockupTemplate: MockupTemplate;
  stageWidth: number;
  stageHeight: number;
  printingArea: { x: number; y: number; width: number; height: number };
  shirtColor: string;
  allColors?: { value: string; name: string }[];
}

// For debugging - enable console logs
const DEBUG = true;
const log = (...args: any[]) => {
  if (DEBUG) {
    console.log('[MockupGenerator]', ...args);
  }
};

// Simplified mock paths - these should be replaced with actual paths
const mockupImages: Record<MockupTemplate, Record<ShirtSide, string>> = {
  flat: {
    front: '/designer/tshirt-flat-front.png', // Fallback to basic t-shirt
    back: '/designer/tshirt-flat-back.png',
    left: '/designer/tshirt-left.png',
    right: '/designer/tshirt-right.png',
  },
  'model-male': {
    front: '/designer/tshirt-lifestyle-front.png',
    back: '/designer/tshirt-back.png',
    left: '/designer/tshirt-left.png',
    right: '/designer/tshirt-right.png',
  },
  'model-female': {
    front: '/designer/tshirt-front.png',
    back: '/designer/tshirt-back.png',
    left: '/designer/tshirt-left.png',
    right: '/designer/tshirt-right.png',
  },
  hanging: {
    front: '/designer/tshirt-front.png',
    back: '/designer/tshirt-back.png',
    left: '/designer/tshirt-left.png',
    right: '/designer/tshirt-right.png',
  },
  folded: {
    front: '/designer/tshirt-front.png',
    back: '/designer/tshirt-back.png',
    left: '/designer/tshirt-left.png',
    right: '/designer/tshirt-right.png',
  },
};

// Fallback printing area placement
const defaultPrintingArea = { 
  x: 250, 
  y: 150, 
  width: 300, 
  height: 300,
  scaleX: 1,
  scaleY: 1,
  rotation: 0 
};

const RealisticMockupGenerator: React.FC<RealisticMockupProps> = ({
  activeSide,
  designElements,
  mockupTemplate,
  stageWidth,
  stageHeight,
  printingArea,
  shirtColor,
  allColors = []
}) => {
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [compositeImage, setCompositeImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the current shirt color by default
  const [activeColorInMockup, setActiveColorInMockup] = useState<string>(shirtColor);

  // Update active color when shirtColor prop changes
  useEffect(() => {
    setActiveColorInMockup(shirtColor);
  }, [shirtColor]);

  // Load the mockup background image based on template and active side
  useEffect(() => {
    const loadImage = () => {
      setIsGenerating(true);
      setError(null);
      
      // Path to the image
      const imagePath = mockupImages[mockupTemplate][activeSide];
      log('Loading image from path:', imagePath);
      
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Enable CORS if needed
      
      img.onload = () => {
        log('Image loaded successfully');
        setBackgroundImage(img);
        setIsGenerating(false);
      };
      
      img.onerror = (e) => {
        console.error('Error loading mockup image:', e);
        setError(`Error loading mockup image: ${imagePath}`);
        setIsGenerating(false);
        
        // Try to load a fallback image
        const fallbackImg = new Image();
        fallbackImg.src = '/designer/tshirt-front.png'; // Simple fallback
        fallbackImg.onload = () => {
          log('Fallback image loaded');
          setBackgroundImage(fallbackImg);
        };
      };
      
      img.src = imagePath;
    };

    loadImage();
  }, [activeSide, mockupTemplate]);

  // Generate mockup effect
  useEffect(() => {
    if (backgroundImage && !isGenerating) {
      log('Triggering mockup generation...');
      generateMockup();
    }
  }, [backgroundImage, designElements, activeColorInMockup]);

  // Map design elements from designer to mockup
 const renderDesignElements = () => {
  if (!backgroundImage) return null;
  
  // Use the actual printing area passed from the parent component
  // Don't force a different area - this causes the scaling mismatch
  
  return designElements.map((el) => {
    // Calculate relative position within the printing area
    const relativeX = (el.x - printingArea.x) / printingArea.width;
    const relativeY = (el.y - printingArea.y) / printingArea.height;
    
    // Position within the mockup stage (center the printing area)
    const mockupPrintingAreaX = stageWidth / 2 - printingArea.width / 2;
    const mockupPrintingAreaY = stageHeight / 2 - printingArea.height / 2;
    
    const newX = mockupPrintingAreaX + (relativeX * printingArea.width);
    const newY = mockupPrintingAreaY + (relativeY * printingArea.height);
    
    console.log('Element positioning:', {
      original: { x: el.x, y: el.y },
      relative: { x: relativeX, y: relativeY },
      new: { x: newX, y: newY },
      printingArea: printingArea
    });
      
    if (el.type === 'text') {
      return (
        <KonvaText
          key={el.id}
          text={el.text || ''}
          x={newX}
          y={newY}
          fontSize={el.fontSize}
          rotation={el.rotation}
          scaleX={el.scaleX}
          scaleY={el.scaleY}
        />
      );
    } else if (el.type === 'image' && el.image) {
      return (
        <KonvaImage
          key={el.id}
          image={el.image}
          x={newX}
          y={newY}
          width={el.width}    // Keep original dimensions
          height={el.height}  // Keep original dimensions
          rotation={el.rotation}
          scaleX={el.scaleX}
          scaleY={el.scaleY}
        />
      );
    }
    return null;
  });
};

  // Generate the mockup image
  const generateMockup = () => {
    if (!stageRef.current || isGenerating) return;
    
    log('Starting mockup generation');
    setIsGenerating(true);
    
    // Add a delay to ensure the stage is ready
    setTimeout(() => {
      try {
        if (!stageRef.current) {
          throw new Error('Stage reference not available');
        }
        
        log('Capturing stage as image...');
        const dataURL = stageRef.current.toDataURL({ 
          pixelRatio: 2,
          mimeType: 'image/png'
        });
        
        log('Image captured successfully, length:', dataURL.length);
        setCompositeImage(dataURL);
      } catch (err: any) {
        console.error('Error generating mockup:', err);
        setError(`Failed to generate mockup: ${err.message}`);
        
        // Use a simple colored rectangle as fallback
        setCompositeImage(createFallbackImage());
      } finally {
        setIsGenerating(false);
      }
    }, 500); // Increased delay for better reliability
  };

  // Create a fallback image if all else fails
  const createFallbackImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = stageWidth;
    canvas.height = stageHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Fill with the shirt color
      ctx.fillStyle = activeColorInMockup;
      ctx.fillRect(0, 0, stageWidth, stageHeight);
      
      // Add a label
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Mockup Preview', stageWidth / 2, stageHeight / 2);
    }
    return canvas.toDataURL();
  };

  return (
    <div className="relative mockup-container">
      {/* Hidden stage for generating the mockup */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <Stage ref={stageRef} width={stageWidth} height={stageHeight}>
          <Layer>
            {/* Background color */}
            <Rect
              x={0}
              y={0}
              width={stageWidth}
              height={stageHeight}
              fill={activeColorInMockup}
            />
            
            {/* T-shirt image */}
            {backgroundImage && (
              <KonvaImage 
                image={backgroundImage} 
                x={0} 
                y={0} 
                width={stageWidth} 
                height={stageHeight}
                globalCompositeOperation="destination-in"
              />
            )}
            
            {/* Shadow/Details Layer */}
            {backgroundImage && activeColorInMockup !== '#ffffff' && (
              <KonvaImage
                image={backgroundImage}
                x={0}
                y={0}
                width={stageWidth}
                height={stageHeight}
                opacity={0.3}
                globalCompositeOperation="multiply"
              />
            )}
            
            {/* Design elements */}
            {renderDesignElements()}
          </Layer>
        </Stage>
      </div>
      
      {/* Display area */}
      <div className="relative w-full overflow-hidden bg-gray-100 rounded-lg h-96">
        {isGenerating ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <span className="text-gray-600">Generating mockup...</span>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gray-200">
            <span className="mb-2 text-red-600">Error generating mockup</span>
            <span className="text-sm text-center text-gray-600">{error}</span>
            <button 
              onClick={generateMockup}
              className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : compositeImage ? (
          <img 
            src={compositeImage} 
            alt={`T-shirt mockup - ${mockupTemplate} ${activeSide}`} 
            className="object-contain w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <span className="text-gray-600">Loading...</span>
          </div>
        )}
      </div>
      
      // Add this button to debug
      <button onClick={() => {
        console.log('Printing area for current color:', printingArea);
        console.log('Stage dimensions:', { width: stageWidth, height: stageHeight });
        console.log('Design elements:', designElements);
      }}>
        Debug Printing Area
      </button>
      {/* Debug information - only in development */}
      {DEBUG && (
        <div className="p-2 mt-2 text-xs text-gray-700 bg-gray-100 rounded">
          <div>Template: {mockupTemplate}</div>
          <div>Side: {activeSide}</div>
          <div>Color: {activeColorInMockup}</div>
          <div>Elements: {designElements.length}</div>
          <div>Status: {isGenerating ? 'Generating' : error ? 'Error' : compositeImage ? 'Ready' : 'Loading'}</div>
          {error && <div className="text-red-500">Error: {error}</div>}
        </div>
        
      )}
    </div>
  );
};

export default RealisticMockupGenerator;