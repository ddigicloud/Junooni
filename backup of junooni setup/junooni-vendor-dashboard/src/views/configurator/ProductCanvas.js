/* eslint-disable prettier/prettier */
import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Image, Text, Transformer, Group } from 'react-konva';
import MockupGenerator from './mockups';
import RealisticMockupGenerator from './realmockups';
import ProductConfigurationForm from './product-creation';

const ProductCanvas = () => {
    const [showForm, setShowForm] = useState(false);
  // Existing states
  const [designElements, setDesignElements] = useState({
    front: [],
    back: [],
    leftSleeve: [],
    rightSleeve: []
  });
  const [baseImages, setBaseImages] = useState({
    front: null,
    back: null,
    leftSleeve: null,
    rightSleeve: null
  });
  
  const [maskImages, setMaskImages] = useState({
    front: null,
    back: null,
    leftSleeve: null,
    rightSleeve: null
  });

  
  const [selectedColor, setSelectedColor] = useState('#ffffff'); // Default white
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [currentView, setCurrentView] = useState('front');
  
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const transformerRef = useRef(null);

  // Predefined color options
  const colorOptions = [
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Navy', value: '#000080' },
    { name: 'Red', value: '#ff0000' },
    { name: 'Green', value: '#008000' },
    { name: 'Yellow', value: '#ffff00' },
    { name: 'Purple', value: '#800080' },
    { name: 'Orange', value: '#ffa500' },
  ];

  const tshirtDimensions = {
    width: 600,
    height: 600,
    x: 100,
    y: 50,
  };

  const printingArea = {
    x: tshirtDimensions.x + 180,
    y: tshirtDimensions.y + 220,
    width: 200,
    height: 220,
  };

  const tshirtImages = {
    front: '/designer-canvas/tshirt-front.png',
    back: '/designer-canvas/tshirt-back.png',
    leftSleeve: '/designer-canvas/tshirt-left-sleeve.png',
    rightSleeve: '/designer-canvas/tshirt-right-sleeve.png',
  };
const maskPaths = {
    front: '/designer-canvas/tshirt-front.png',
    back: '/designer-canvas/tshirt-back.png',
    leftSleeve: '/designer-canvas/tshirt-left-mask.png',
    rightSleeve: '/designer-canvas/tshirt-right-mask.png',
  };
  // Load base images
  useEffect(() => {
    Object.entries(tshirtImages).forEach(([view, src]) => {
        const baseImg = new window.Image();
        baseImg.src = src;
        baseImg.onload = () => {
          setBaseImages(prev => ({
            ...prev,
            [view]: baseImg
          }));
        };
  
        // Load mask images
        const maskImg = new window.Image();
        maskImg.src = maskPaths[view];
        maskImg.onload = () => {
          setMaskImages(prev => ({
            ...prev,
            [view]: maskImg
          }));
        };
      });
    }, []);


  const addText = () => {
    const newText = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'New Text',
      x: printingArea.x + 50,
      y: printingArea.y + 50,
      fontSize: 24,
      draggable: true,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };
    setDesignElements(prev => ({
      ...prev,
      [currentView]: [...prev[currentView], newText]
    }));
  };

  const addImage = (imageSrc) => {
    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      const newImage = {
        id: `image-${Date.now()}`,
        type: 'image',
        image: img,
        x: printingArea.x + 50,
        y: printingArea.y + 50,
        width: 100,
        height: (img.height / img.width) * 100,
        draggable: true,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      };
      setDesignElements(prev => ({
        ...prev,
        [currentView]: [...prev[currentView], newImage]
      }));
    };
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleSelect = (id) => {
    setSelectedElementId(id);
    const selectedNode = layerRef.current.findOne(`#${id}`);
    if (selectedNode) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer().batchDraw();
    }
  };

  const deselect = () => {
    setSelectedElementId(null);
    if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    deselect();
  };

  const getCurrentViewElements = () => {
    return designElements[currentView] || [];
  };

  const handleTransformEnd = (e, elementId) => {
    const node = e.target;
    const updatedElements = designElements[currentView].map(el => {
      if (el.id === elementId) {
        return {
          ...el,
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          width: el.type === 'image' ? el.width * node.scaleX() : el.width,
          height: el.type === 'image' ? el.height * node.scaleY() : el.height,
        };
      }
      return el;
    });

    setDesignElements(prev => ({
      ...prev,
      [currentView]: updatedElements
    }));
  };

  const handleDragEnd = (e, elementId) => {
    const node = e.target;
    const updatedElements = designElements[currentView].map(el => {
      if (el.id === elementId) {
        return {
          ...el,
          x: node.x(),
          y: node.y(),
        };
      }
      return el;
    });

    setDesignElements(prev => ({
      ...prev,
      [currentView]: updatedElements
    }));
  };

  if (!baseImages[currentView] || !maskImages[currentView]) {
    return <div>Loading...</div>;
  }

  return showForm ? (
    <ProductConfigurationForm
      designElements={designElements}
      currentView={currentView}
      baseImages={baseImages}
      printingArea={printingArea}
    />
  ) : (
    <div>
        
      <div>
        <button onClick={() => handleViewChange('front')}>Front View</button>
        <button onClick={() => handleViewChange('back')}>Back View</button>
        <button onClick={() => handleViewChange('leftSleeve')}>Left Sleeve</button>
        <button onClick={() => handleViewChange('rightSleeve')}>Right Sleeve</button>
      </div>
      <div style={{ marginBottom: '10px' }}>
        {colorOptions.map((color) => (
          <button
            key={color.value}
            onClick={() => handleColorChange(color.value)}
            style={{
              backgroundColor: color.value,
              width: '30px',
              height: '30px',
              margin: '0 5px',
              border: selectedColor === color.value ? '2px solid #000' : '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            title={color.name}
          />
        ))}
      </div>
      <button onClick={addText}>Add Text</button>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => addImage(URL.createObjectURL(e.target.files[0]))}
      />
      <Stage
        width={800}
        height={700}
        ref={stageRef}
        style={{ border: '1px solid #ccc' }}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) deselect();
        }}
      >
        <Layer ref={layerRef}>
          {/* White background */}
          <Rect
            x={0}
            y={0}
            width={800}
            height={700}
            fill="#ffffff"
          />
          
          {/* Colored area using mask */}
          <Group>
            {/* This is the colored rectangle that will be masked */}
            <Rect
              {...tshirtDimensions}
              fill={selectedColor}
            />
            
            {/* This is the mask image */}
            <Image
              {...tshirtDimensions}
              image={baseImages[currentView]}
              globalCompositeOperation="destination-in"
            />
          </Group>

          {/* Shadow/Details Layer */}
          <Image
            {...tshirtDimensions}
            image={baseImages[currentView]}
            globalCompositeOperation="multiply"
          />

         
         {/* Design Elements and Printing Area */}
         <Rect
            {...printingArea}
            stroke="blue"
            strokeWidth={2}
            dash={[4, 4]}
          />

          {/* Design Elements */}
          {getCurrentViewElements().map((el) => {
            if (el.type === 'image') {
              return (
                <Group key={el.id}>
                  <Group
                    clipFunc={(ctx) => {
                      ctx.rect(
                        printingArea.x,
                        printingArea.y,
                        printingArea.width,
                        printingArea.height
                      );
                      ctx.clip();
                    }}
                  >
                    <Image
                      {...el}
                      id={el.id}
                      draggable
                      onClick={() => handleSelect(el.id)}
                      onTap={() => handleSelect(el.id)}
                      onDragEnd={(e) => handleDragEnd(e, el.id)}
                      onTransformEnd={(e) => handleTransformEnd(e, el.id)}
                    />
                  </Group>
                  {/*<Rect
                    x={el.x}
                    y={el.y}
                    width={el.width * el.scaleX}
                    height={el.height * el.scaleY}
                    rotation={el.rotation}
                    fill="rgba(255, 0, 0, 0.5)"
                    visible={
                      el.x < printingArea.x ||
                      el.y < printingArea.y ||
                      el.x + (el.width * el.scaleX) > printingArea.x + printingArea.width ||
                      el.y + (el.height * el.scaleY) > printingArea.y + printingArea.height
                    }
                  />*/}
                </Group>
              );
            }
            if (el.type === 'text') {
              return (
                <Group key={el.id}>
                  <Group
                    clipFunc={(ctx) => {
                      ctx.rect(
                        printingArea.x,
                        printingArea.y,
                        printingArea.width,
                        printingArea.height
                      );
                      ctx.clip();
                    }}
                  >
                    <Text
                      {...el}
                      id={el.id}
                      draggable
                      onClick={() => handleSelect(el.id)}
                      onTap={() => handleSelect(el.id)}
                      onDragEnd={(e) => handleDragEnd(e, el.id)}
                      onTransformEnd={(e) => handleTransformEnd(e, el.id)}
                    />
                  </Group>
                  <Rect
                    x={el.x}
                    y={el.y}
                    width={(el.width || 100) * el.scaleX}
                    height={(el.height || 30) * el.scaleY}
                    rotation={el.rotation}
                    fill="rgba(255, 0, 0, 0.5)"
                    visible={
                      el.x < printingArea.x ||
                      el.y < printingArea.y ||
                      el.x + ((el.width || 100) * el.scaleX) > printingArea.x + printingArea.width ||
                      el.y + ((el.height || 30) * el.scaleY) > printingArea.y + printingArea.height
                    }
                  />
                </Group>
              );
            }
            return null;
          })}
          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>
      <button 
  onClick={() => setShowForm(true)}
  className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
>
  Next
</button>
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Preview Mockups
        </h2>
        <MockupGenerator
          designElements={designElements}
          currentView={currentView}
          baseImages={baseImages}
          printingArea={printingArea} // Pass the printing area configuration
        />
       
      </div>
    </div>
  );
};

export default ProductCanvas;