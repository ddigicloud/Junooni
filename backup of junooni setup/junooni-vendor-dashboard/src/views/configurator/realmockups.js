/* eslint-disable prettier/prettier */
import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image, Group } from 'react-konva';

const RealisticMockupGenerator = ({ designElements, currentView, productId = 'tshirt' }) => {
  const [mockupType, setMockupType] = useState('flat');
  const stageRef = useRef(null);
  
  const [loadedAssets, setLoadedAssets] = useState({
    mockup: null,
    mask: null,
    wrinkles: null,
    fabric: null,
    normalMap: null,
    aoMap: null,
    displacement: null, // Added displacement map
  });

  const assetPaths = {
    flat: {
      mockup: '/designer-canvas/tshirt-flat-front.png',
      mask: '/designer-canvas/tshirt-flat-mask.png',
      wrinkles: '/designer-canvas/tshirt-flat-displacement.png',
      fabric: '/designer-canvas/tshirt-flat-front.png',
      normalMap: '/designer-canvas/tshirt-flat-front.png',
      aoMap: '/designer-canvas/tshirt-flat-displacement.png',
      displacement: '/designer-canvas/tshirt-flat-displacement.png'
    },
    lifestyle: {
      mockup: '/designer-canvas/tshirt-lifestyle-front.png',
      mask: '/designer-canvas/lifestyle-mask.png',
      wrinkles: '/designer-canvas/tshirt-lifestyle-front.png',
      fabric: '/designer-canvas/tshirt-flat-displacement.png',
      normalMap: '/designer-canvas/tshirt-lifestyle-front.png',
      aoMap: '/designer-canvas/tshirt-flat-displacement.png',
      displacement: '/designer-canvas/tshirt-flat-displacement.png'
    }
  };

  useEffect(() => {
    const loadImage = (path, key) => {
        console.log(`Attempting to load ${key} from: ${path}`);
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.src = path;
          img.onload = () => {
            console.log(`Successfully loaded ${key} from: ${path}`);
            resolve(img);
          };
          img.onerror = (err) => {
            console.error(`Failed to load ${key} from path: ${path}`);
            console.error('Error details:', err);
            reject(new Error(`Failed to load ${key}`));
          };
        });
      };

    const loadAllAssets = async () => {
      try {
        const paths = assetPaths[mockupType];
        const loaded = {};
        
        for (const [key, path] of Object.entries(paths)) {
          loaded[key] = await loadImage(path, key);
        }
        
        setLoadedAssets(loaded);
      } catch (error) {
        console.error('Error loading assets:', error);
      }
    };

    loadAllAssets();
  }, [mockupType]);

  const createOffscreenCanvas = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  };

  // Improved blending function
  const applyRealisticBlending = (design, assets) => {
    const { width, height } = design;
    const mainCanvas = createOffscreenCanvas(width, height);
    const ctx = mainCanvas.getContext('2d');

    // Create temporary canvases for processing
    const tempCanvas = createOffscreenCanvas(width, height);
    const tempCtx = tempCanvas.getContext('2d');

    // Draw original design
    ctx.drawImage(design, 0, 0, width, height);

    // Apply displacement mapping
    const displacementAmount = 3; // Adjust this value for more/less displacement
    tempCtx.drawImage(assets.displacement, 0, 0, width, height);
    const displacementData = tempCtx.getImageData(0, 0, width, height).data;
    const originalImageData = ctx.getImageData(0, 0, width, height);
    const newImageData = new ImageData(new Uint8ClampedArray(originalImageData.data), width);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const dx = (displacementData[i] / 255.0 - 0.5) * displacementAmount;
        const dy = (displacementData[i + 1] / 255.0 - 0.5) * displacementAmount;
        
        const sourceX = Math.round(x + dx);
        const sourceY = Math.round(y + dy);
        
        if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
          const sourceI = (sourceY * width + sourceX) * 4;
          newImageData.data[i] = originalImageData.data[sourceI];
          newImageData.data[i + 1] = originalImageData.data[sourceI + 1];
          newImageData.data[i + 2] = originalImageData.data[sourceI + 2];
          newImageData.data[i + 3] = originalImageData.data[sourceI + 3];
        }
      }
    }
    ctx.putImageData(newImageData, 0, 0);

    // Apply fabric texture with overlay blend
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.4; // Reduced opacity for subtler effect
    ctx.drawImage(assets.fabric, 0, 0, width, height);
    ctx.globalAlpha = 1.0;

    // Apply wrinkles with multiple blend modes
    // First pass - multiply blend for shadows
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.3;
    ctx.drawImage(assets.wrinkles, 0, 0, width, height);

    // Second pass - overlay blend for highlights
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.2;
    ctx.drawImage(assets.wrinkles, 0, 0, width, height);

    // Apply normal mapping for 3D effect
    tempCtx.drawImage(assets.normalMap, 0, 0, width, height);
    const normalData = tempCtx.getImageData(0, 0, width, height).data;

    // Apply ambient occlusion
    tempCtx.drawImage(assets.aoMap, 0, 0, width, height);
    const aoData = tempCtx.getImageData(0, 0, width, height).data;

    // Final lighting pass
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Enhanced lighting calculation
    const lightAngle = Math.PI / 4; // 45 degrees
    const lightDir = {
      x: Math.cos(lightAngle),
      y: Math.sin(lightAngle),
      z: 1.0
    };

    for (let i = 0; i < data.length; i += 4) {
      const normalX = (normalData[i] / 255) * 2 - 1;
      const normalY = (normalData[i + 1] / 255) * 2 - 1;
      const normalZ = normalData[i + 2] / 255;

      // Calculate lighting with softer falloff
      const lightDot = (normalX * lightDir.x + normalY * lightDir.y + normalZ * lightDir.z);
      const lightIntensity = Math.pow(Math.max(0.4, lightDot), 1.5);

      // Apply ambient occlusion with reduced intensity
      const ao = 0.4 + (aoData[i] / 255) * 0.6;

      // Apply lighting and AO to colors
      data[i] = data[i] * lightIntensity * ao;
      data[i + 1] = data[i + 1] * lightIntensity * ao;
      data[i + 2] = data[i + 2] * lightIntensity * ao;
    }

    ctx.putImageData(imageData, 0, 0);
    return mainCanvas;
  };

  const renderDesign = () => {
    if (!loadedAssets.mockup) return null;

    const { width, height } = loadedAssets.mockup;
    const designConfig = {
      flat: {
        scale: 1,
        x: width * 0.25,
        y: height * 0.2,
        width: width * 0.5,
        height: height * 0.6
      },
      lifestyle: {
        scale: 0.9,
        x: width * 0.23,
        y: height * 0.18,
        width: width * 0.48,
        height: height * 0.58
      }
    }[mockupType];

    return (
      <Group>
        <Image image={loadedAssets.mockup} width={width} height={height} />
        
        <Group {...designConfig}>
          {designElements?.[currentView]?.map((element, index) => (
            <Image
              key={element.id || index}
              image={element.image}
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              scaleX={element.scaleX}
              scaleY={element.scaleY}
              rotation={element.rotation}
              filters={[
                (imageData) => {
                  const canvas = applyRealisticBlending(
                    element.image,
                    loadedAssets
                  );
                  return canvas.getContext('2d').getImageData(0, 0, imageData.width, imageData.height);
                }
              ]}
            />
          ))}
        </Group>

        <Image
          image={loadedAssets.mask}
          width={width}
          height={height}
          globalCompositeOperation="destination-in"
        />
      </Group>
    );
  };

  const downloadMockup = () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({
        pixelRatio: 3,
        mimeType: 'image/png'
      });
      const link = document.createElement('a');
      link.download = `mockup-${mockupType}-${Date.now()}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex gap-4 mb-4 flex-wrap">
        <button
          className={`px-4 py-2 rounded ${
            mockupType === 'flat' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setMockupType('flat')}
        >
          Flat View
        </button>
        <button
          className={`px-4 py-2 rounded ${
            mockupType === 'lifestyle' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setMockupType('lifestyle')}
        >
          Lifestyle View
        </button>
        <button
          className="px-4 py-2 rounded bg-green-500 text-white"
          onClick={downloadMockup}
        >
          Download Mockup
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Stage
          ref={stageRef}
          width={800}
          height={800}
        >
          <Layer>
            {renderDesign()}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default RealisticMockupGenerator;