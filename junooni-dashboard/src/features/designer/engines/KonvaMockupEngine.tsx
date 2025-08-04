// src/components/Designer/engines/KonvaMockupEngine.tsx
import React, { useRef, useState, useEffect } from 'react';
import Konva from 'konva';
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Group,
  Shape,
} from 'react-konva';

interface KonvaMockupEngineProps {
  mockup: any;
  designElements: any[];
  canvasDimensions: { width: number; height: number };
  canvasPrintableArea: { x: number; y: number; width: number; height: number };
  displayDimensions: { width: number; height: number };
  productType: string;
  productColor: string;
}

/**
 * Professional Konva-based Rendering Engine
 * Handles complex 3D surfaces, phone cases, pillows, and advanced transformations
 */
export const KonvaMockupEngine: React.FC<KonvaMockupEngineProps> = ({
  mockup,
  designElements,
  canvasDimensions,
  canvasPrintableArea,
  displayDimensions,
  productType,
  productColor
}) => {
  const [mockupImage, setMockupImage] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const stageRef = useRef<Konva.Stage>(null);
  
  // Load mockup image
  useEffect(() => {
    if (!mockup?.photo?.url) {
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = resolveImageUrl(mockup.photo.url);
    
    img.onload = () => {
      setMockupImage(img);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      console.error('Failed to load mockup:', mockup.photo.url);
      setIsLoading(false);
    };
  }, [mockup?.photo?.url]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100">
        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!mockupImage) {
    return <div>Failed to load mockup</div>;
  }
  
  // Get placement configuration
  const placement = mockup.designPlacementArea;
  if (!placement?.coordinates) {
    return <div>Invalid placement configuration</div>;
  }
  
  // Calculate placement area
  const placementArea = {
    x: placement.coordinates.x * displayDimensions.width,
    y: placement.coordinates.y * displayDimensions.height,
    width: placement.coordinates.width * displayDimensions.width,
    height: placement.coordinates.height * displayDimensions.height
  };
  
  return (
    <Stage
      ref={stageRef}
      width={displayDimensions.width}
      height={displayDimensions.height}
      className="mockup-stage"
    >
      <Layer>
        {/* Mockup background */}
        <KonvaImage
          image={mockupImage}
          x={0}
          y={0}
          width={displayDimensions.width}
          height={displayDimensions.height}
        />
        
        {/* Design group with clipping and effects */}
        <Group
          x={placementArea.x + placementArea.width / 2}
          y={placementArea.y + placementArea.height / 2}
          offsetX={placementArea.width / 2}
          offsetY={placementArea.height / 2}
          rotation={placement.transforms?.rotation || 0}
          scaleX={placement.transforms?.scaleX || 1}
          scaleY={placement.transforms?.scaleY || 1}
          skewX={(placement.transforms?.skewX || 0) * Math.PI / 180}
          skewY={(placement.transforms?.skewY || 0) * Math.PI / 180}
          opacity={placement.renderingSettings?.opacity || 1}
        >
          {/* Clipping mask for complex shapes */}
          {productType === 'accessories_phone_case' && (
            <Shape
              sceneFunc={(context, shape) => {
                drawPhoneCaseClip(context, placementArea.width, placementArea.height);
                context.clip();
              }}
            />
          )}
          
          {/* Render design elements */}
          {renderDesignElements(
            designElements,
            canvasPrintableArea,
            placementArea,
            placement,
            productType
          )}
        </Group>
        
        {/* Overlay effects for realism */}
        {productType === 'home_pillow' && (
          <PillowOverlay
            x={placementArea.x}
            y={placementArea.y}
            width={placementArea.width}
            height={placementArea.height}
          />
        )}
      </Layer>
    </Stage>
  );
};

/**
 * Render design elements with proper transformations
 */
function renderDesignElements(
  elements: any[],
  canvasPrintableArea: any,
  placementArea: any,
  placement: any,
  productType: string
) {
  return elements.map((element, index) => {
    if (!element.image || !element.width || !element.height) return null;
    
    // Calculate relative position
    const relX = (element.x - canvasPrintableArea.x) / canvasPrintableArea.width;
    const relY = (element.y - canvasPrintableArea.y) / canvasPrintableArea.height;
    const relW = element.width / canvasPrintableArea.width;
    const relH = element.height / canvasPrintableArea.height;
    
    // Scale to placement area
    const elemX = relX * placementArea.width;
    const elemY = relY * placementArea.height;
    const elemW = relW * placementArea.width;
    const elemH = relH * placementArea.height;
    
    // Apply product-specific transformations
    let additionalProps: any = {};
    
    if (productType === 'home_pillow') {
      // Add bulge effect for pillow
      additionalProps = {
        ...getBulgeEffect(elemX, elemY, elemW, elemH, placementArea)
      };
    } else if (productType === 'accessories_phone_case') {
      // Add slight curve for phone case
      additionalProps = {
        shadowBlur: 2,
        shadowOpacity: 0.3,
        shadowOffsetX: 1,
        shadowOffsetY: 1
      };
    }
    
    return (
      <KonvaImage
        key={element.id}
        image={element.image}
        x={elemX}
        y={elemY}
        width={elemW}
        height={elemH}
        rotation={element.rotation || 0}
        scaleX={element.scaleX || 1}
        scaleY={element.scaleY || 1}
        globalCompositeOperation={getKonvaBlendMode(placement.renderingSettings?.blendMode)}
        {...additionalProps}
      />
    );
  });
}

/**
 * Draw phone case clipping path
 */
function drawPhoneCaseClip(ctx: any, width: number, height: number) {
  const cornerRadius = width * 0.1;
  const cameraHoleRadius = width * 0.08;
  const cameraHoleX = width * 0.15;
  const cameraHoleY = height * 0.1;
  
  // Draw rounded rectangle
  ctx.beginPath();
  ctx.moveTo(cornerRadius, 0);
  ctx.lineTo(width - cornerRadius, 0);
  ctx.arc(width - cornerRadius, cornerRadius, cornerRadius, -Math.PI/2, 0);
  ctx.lineTo(width, height - cornerRadius);
  ctx.arc(width - cornerRadius, height - cornerRadius, cornerRadius, 0, Math.PI/2);
  ctx.lineTo(cornerRadius, height);
  ctx.arc(cornerRadius, height - cornerRadius, cornerRadius, Math.PI/2, Math.PI);
  ctx.lineTo(0, cornerRadius);
  ctx.arc(cornerRadius, cornerRadius, cornerRadius, Math.PI, -Math.PI/2);
  ctx.closePath();
  
  // Cut out camera hole
  ctx.moveTo(cameraHoleX + cameraHoleRadius, cameraHoleY);
  ctx.arc(cameraHoleX, cameraHoleY, cameraHoleRadius, 0, Math.PI * 2, true);
  ctx.closePath();
}

/**
 * Pillow overlay component for realistic effect
 */
const PillowOverlay: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
}> = ({ x, y, width, height }) => {
  return (
    <Shape
      sceneFunc={(context, shape) => {
        // Create gradient for pillow edges
        const gradient = context.createRadialGradient(
          width / 2, height / 2, 0,
          width / 2, height / 2, Math.max(width, height) / 2
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.05)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      }}
      x={x}
      y={y}
      width={width}
      height={height}
      listening={false}
    />
  );
};

/**
 * Calculate bulge effect for pillow products
 */
function getBulgeEffect(
  x: number,
  y: number,
  width: number,
  height: number,
  placementArea: any
) {
  const centerX = placementArea.width / 2;
  const centerY = placementArea.height / 2;
  
  const distX = (x + width / 2) - centerX;
  const distY = (y + height / 2) - centerY;
  
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
  const currentDist = Math.sqrt(distX * distX + distY * distY);
  
  const bulgeAmount = 1 - (currentDist / maxDist) * 0.2;
  
  return {
    scaleX: bulgeAmount,
    scaleY: bulgeAmount,
    offsetX: width / 2,
    offsetY: height / 2,
    x: x + width / 2,
    y: y + height / 2
  };
}

/**
 * Convert blend mode to Konva composite operation
 */
function getKonvaBlendMode(blendMode: string): GlobalCompositeOperation {
  const blendModeMap: Record<string, GlobalCompositeOperation> = {
    'normal': 'source-over',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'soft_light': 'soft-light',
    'hard_light': 'hard-light',
    'darken': 'darken',
    'lighten': 'lighten'
  };
  
  return blendModeMap[blendMode] || 'source-over';
}

function resolveImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `http://localhost:3000${url}`;
  return `http://localhost:3000/api/media/file/${url}`;
}

export default KonvaMockupEngine;