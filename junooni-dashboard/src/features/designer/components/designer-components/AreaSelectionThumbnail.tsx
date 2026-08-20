import React, { useState, useEffect } from 'react';
import type { PayloadProductData } from '../types';

interface AreaSelectionThumbnailProps {
  areaId: string;
  areaName: string;
  isActive: boolean;
  onSelect: (areaId: string) => void;
  canvasImage: HTMLImageElement | null;
  activeColor: string;
  elementCount: number;
  productData: PayloadProductData;
  activeSize: string;
  allCanvasImages: Record<string, HTMLImageElement | null>;
}

export const AreaSelectionThumbnail: React.FC<AreaSelectionThumbnailProps> = ({
  areaId,
  areaName,
  isActive,
  onSelect,
  canvasImage,
  activeColor,
  elementCount,
  productData,
  activeSize,
  allCanvasImages,
}) => {
  const [isImageLoading, setIsImageLoading] = useState(!canvasImage);

  useEffect(() => {
    setIsImageLoading(!canvasImage);
  }, [canvasImage]);

  const getSizeAwareImage = () => {
    if (productData?.size_Images && activeSize) {
      const sizeImage = allCanvasImages[`${areaId}_${activeSize}`];
      if (sizeImage) return sizeImage;
    }
    if (productData?.color_Images && activeColor) {
      const colorImage = allCanvasImages[`${areaId}_${activeColor}`];
      if (colorImage) return colorImage;
    }
    return allCanvasImages[areaId] ?? canvasImage;
  };

  const displayImage = getSizeAwareImage();

  return (
    <button
      onClick={() => onSelect(areaId)}
      className={`w-full p-2 sm:px-6 sm:py-4 border rounded-lg transition-all touch-manipulation ${
        isActive
          ? 'border-orange-500 border-2'
          : 'hover:border-gray-300 hover:shadow-sm border-white'
      }`}
    >
      <div className="relative mb-2 overflow-hidden bg-gray-100 rounded aspect-square">
        {displayImage ? (
          <div className="relative w-full h-full">
            <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: activeColor }} />
            <img
              src={displayImage.src}
              alt={areaName}
              className="absolute inset-0 object-cover w-full h-full"
              style={{ mixBlendMode: 'normal' }}
              onLoad={() => setIsImageLoading(false)}
              onError={() => setIsImageLoading(false)}
            />
            <img
              src={displayImage.src}
              alt={areaName}
              className="absolute inset-0 object-cover w-full h-full opacity-5"
              style={{ mixBlendMode: 'multiply' }}
            />
            {elementCount > 0 && (
              <div className="absolute top-1 right-1">
                <div className="flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-orange-500 rounded-full sm:w-5 sm:h-5">
                  {elementCount}
                </div>
              </div>
            )}
            {productData?.size_Images && activeSize && (
              <div className="absolute bottom-1 left-1">
                <div className="px-1.5 py-0.5 text-xs font-medium text-white bg-blue-500 rounded">
                  {activeSize}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            {isImageLoading ? (
              <div className="text-center">
                <div className="w-3 h-3 mx-auto mb-1 border-b-2 border-gray-400 rounded-full sm:w-4 sm:h-4 animate-spin" />
                <span className="text-xs">Loading...</span>
              </div>
            ) : (
              <span className="text-xs">No Image</span>
            )}
          </div>
        )}
      </div>

      <p className="text-xs font-medium text-center sm:text-sm">
        {areaName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
      </p>
      {productData?.size_Images && activeSize && (
        <p className="text-xs text-center text-gray-500">{activeSize}</p>
      )}
    </button>
  );
};