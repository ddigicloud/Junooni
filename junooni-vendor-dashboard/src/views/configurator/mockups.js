/* eslint-disable prettier/prettier */
import React, { useState, useRef } from "react";
import { Stage, Layer, Image, Text, Group } from "react-konva";

const MockupGenerator = ({ designElements, currentView, baseImages, printingArea }) => {
  const [mockupType, setMockupType] = useState("flat");
  const mockupStageRef = useRef(null);
  
  const mockupImages = {
    flat: {
      front: '/designer-canvas/tshirt-flat-front.png',
      back: '/designer-canvas/tshirt-flat-back.png',
      mask: '/designer-canvas/flat-mask.png'
    },
    lifestyle: {
      front: '/designer-canvas/tshirt-lifestyle-front.png',
      back: '/designer-canvas/tshirt-lifestyle-back.png',
      mask: '/designer-canvas/lifestyle-mask.png'
    },
    folded: {
      front: '/mockups/tshirt-folded-front.png',
      back: '/mockups/tshirt-folded-back.png',
      mask: '/mockups/folded-mask.png'
    },
    hanging: {
      front: '/mockups/tshirt-hanging-front.png',
      back: '/mockups/tshirt-hanging-back.png',
      mask: '/mockups/hanging-mask.png'
    }
  };

  const [loadedAssets, setLoadedAssets] = useState({
    mockups: {},
    masks: {}
  });

  const mockupConfig = {
    flat: {
      width: 800,
      height: 800,
      designArea: {
        x: printingArea.x,
        y: printingArea.y,
        width: printingArea.width,
        height: printingArea.height,
        rotation: 0,
        scale: 1
      }
    },
    lifestyle: {
        width: 800,
        height: 800,
        designArea: {
          x: printingArea.x,
          y: printingArea.y,
          width: printingArea.width,
          height: printingArea.height,
          skewX: 0.7,
          rotation: 0,
          scale: 1
      }
    },
    folded: {
      width: 900,
      height: 1000,
      designArea: {
        x: 350,
        y: 250,
        width: 250,
        height: 350,
        rotation: -5,
        scale: 0.7,
        skewX: 0.15,
        skewY: 0.1
      }
    },
    hanging: {
      width: 800,
      height: 1100,
      designArea: {
        x: 300,
        y: 200,
        width: 280,
        height: 380,
        rotation: 5,
        scale: 0.75,
        skewX: -0.05,
        skewY: 0.08
      }
    }
  };

  React.useEffect(() => {
    Object.entries(mockupImages).forEach(([type, paths]) => {
      const mockupImg = new window.Image();
      mockupImg.src = paths[currentView];
      mockupImg.onload = () => {
        setLoadedAssets(prev => ({
          ...prev,
          mockups: {
            ...prev.mockups,
            [type]: mockupImg
          }
        }));
      };

      const maskImg = new window.Image();
      maskImg.src = paths.mask;
      maskImg.onload = () => {
        setLoadedAssets(prev => ({
          ...prev,
          masks: {
            ...prev.masks,
            [type]: maskImg
          }
        }));
      };
    });
  }, [currentView]);

  const applyPerspectiveTransform = (element, config) => {
    const { x, y, width, height, rotation, scale, skewX = 0, skewY = 0 } = config;
    const relativeX = element.x - printingArea.x;
    const relativeY = element.y - printingArea.y;
    const transformedX = x + (relativeX * scale);
    const transformedY = y + (relativeY * scale);
    
    return {
      x: transformedX + (transformedY * skewX),
      y: transformedY + (transformedX * skewY),
      width: element.width * scale,
      height: element.height * scale,
      rotation: element.rotation + rotation,
      skewX,
      skewY
    };
  };

  const renderDesignElements = () => {
    const config = mockupConfig[mockupType].designArea;
    
    return designElements[currentView]?.map((el) => {
      const transformed = applyPerspectiveTransform(el, config);
      
      if (el.type === 'image') {
        return (
          <Image
            key={el.id}
            {...transformed}
            image={el.image}
            scaleX={el.scaleX * config.scale}
            scaleY={el.scaleY * config.scale}
          />
        );
      }
      
      if (el.type === 'text') {
        return (
          <Text
            key={el.id}
            {...transformed}
            text={el.text}
            fontSize={el.fontSize * config.scale}
            scaleX={el.scaleX * config.scale}
            scaleY={el.scaleY * config.scale}
          />
        );
      }
      return null;
    });
  };

  const generateMockup = () => {
    if (!mockupStageRef.current) return;
    
    const dataURL = mockupStageRef.current.toDataURL({
      pixelRatio: 3
    });

    const link = document.createElement('a');
    link.download = `tshirt-${mockupType}-${currentView}-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ width: '100%', maxWidth: '1024px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {Object.keys(mockupImages).map((type) => (
          <button
            key={type}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              backgroundColor: mockupType === type ? '#3B82F6' : '#E5E7EB',
              color: mockupType === type ? 'white' : 'black',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => setMockupType(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)} Mockup
          </button>
        ))}
        <button
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            backgroundColor: '#22C55E',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={generateMockup}
        >
          Download Mockup
        </button>
      </div>

      <Stage
        width={mockupConfig[mockupType].width}
        height={mockupConfig[mockupType].height}
        ref={mockupStageRef}
      >
        {/* Base Layer for T-shirt mockup */}
        <Layer>
          {loadedAssets.mockups[mockupType] && (
            <Image
              image={loadedAssets.mockups[mockupType]}
              width={mockupConfig[mockupType].width}
              height={mockupConfig[mockupType].height}
            />
          )}
        </Layer>

        {/* Separate Layer for masked design */}
        <Layer>
          <Group>
            {renderDesignElements()}
            {loadedAssets.masks[mockupType] && (
              <Image
                image={loadedAssets.masks[mockupType]}
                width={mockupConfig[mockupType].width}
                height={mockupConfig[mockupType].height}
                globalCompositeOperation="destination-in"
              />
            )}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
};

export default MockupGenerator;