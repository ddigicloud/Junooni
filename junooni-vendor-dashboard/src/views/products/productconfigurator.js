/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react';

const ProductConfigurator = () => {
  useEffect(() => {
    const container = document.getElementById('designer-container');
    if (container) {
      new FancyProductDesigner(container, {
        stageHeight: 500,
        stageWidth: 800,
        fonts: ['Arial', 'Verdana', 'Times New Roman'],
        editorMode: false,
      });
    }
  }, []);

  return <div id="designer-container"></div>;
};

export default ProductConfigurator
