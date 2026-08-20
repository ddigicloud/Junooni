import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import type { LayerInfo, DesignElement } from '../types';

interface LayersPanelProps {
  layers: LayerInfo[];
  selectedId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
  onDuplicateLayer: (id: string) => void;
  // Custom dimensions
  customWidth: string;
  customHeight: string;
  lockAspectRatio: boolean;
  setCustomWidth: (v: string) => void;
  setCustomHeight: (v: string) => void;
  setLockAspectRatio: (v: boolean) => void;
  // Canvas context
  designElements: Record<string, DesignElement[]>;
  activeArea: string;
  activeColor: string;
  getCanvasConfig: (area: string) => any;
  getPrintableAreaFromPhoto: (area: string, color: string) => any;
  setDesignElements: React.Dispatch<React.SetStateAction<Record<string, DesignElement[]>>>;
  updatePricingData: () => void;
  triggerUpdate: () => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers, selectedId, onSelectLayer, onToggleVisibility, onToggleLock,
  onDeleteLayer, onMoveLayer, onDuplicateLayer,
  customWidth, customHeight, lockAspectRatio, setCustomWidth, setCustomHeight, setLockAspectRatio,
  designElements, activeArea, activeColor, getCanvasConfig, getPrintableAreaFromPhoto,
  setDesignElements, updatePricingData, triggerUpdate,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex !== dropIndex) {
      const draggedLayer = layers[dragIndex];
      if (draggedLayer) {
        const moves = Math.abs(dragIndex - dropIndex);
        const dir = dragIndex > dropIndex ? 'up' : 'down';
        for (let i = 0; i < moves; i++) onMoveLayer(draggedLayer.element.id, dir);
      }
    }
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Layers</h3>
        <div className="text-xs text-gray-500">Total: {layers.length}</div>
      </div>

      <div className="p-2 mb-2 text-xs text-gray-600 rounded bg-orange-50">
        Drag to reorder • Top = Front
      </div>

      <div className="space-y-1 overflow-y-auto max-h-64 sm:max-h-80">
        {layers.map((layer, index) => (
          <div
            key={layer.element.id}
            draggable
            onDragStart={e => handleDragStart(e, index)}
            onDragEnd={() => setDraggedIndex(null)}
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, index)}
            className={`group border rounded-lg p-2 sm:p-3 cursor-move transition-all hover:shadow-sm touch-manipulation ${
              selectedId === layer.element.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
            } ${draggedIndex === index ? 'opacity-50' : ''}`}
            onClick={() => onSelectLayer(layer.element.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="flex flex-col space-y-0.5 text-gray-400 group-hover:text-gray-600">
                  {[0,1,2,3].map(i => <div key={i} className="w-1 h-1 bg-current rounded-full" />)}
                </div>
                <div className="flex-shrink-0 w-6 h-6 overflow-hidden bg-gray-100 border rounded sm:w-8 sm:h-8">
                  {layer.element.type === 'image' && layer.element.image ? (
                    <img src={layer.element.imageBase64 || layer.element.imageUrl} alt={layer.element.layerName} className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-600">T</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-900 truncate sm:text-sm">
                    {layer.element.layerName || layer.element.imageName || layer.element.text || `Layer ${index + 1}`}
                  </div>
                  <div className="text-xs text-gray-500 uppercase">
                    {layer.element.type} • Z:{layer.element.zIndex || 0}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 transition-opacity opacity-0 group-hover:opacity-100">
                <button onClick={e => { e.stopPropagation(); onToggleVisibility(layer.element.id); }}
                  className={`p-1 rounded hover:bg-gray-200 touch-manipulation ${layer.element.visible !== false ? 'text-gray-700' : 'text-gray-400'}`}>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button onClick={e => { e.stopPropagation(); onToggleLock(layer.element.id); }}
                  className={`p-1 rounded hover:bg-gray-200 touch-manipulation ${layer.element.locked ? 'text-red-600' : 'text-gray-400'}`}>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </button>
                <button onClick={e => { e.stopPropagation(); onDeleteLayer(layer.element.id); }}
                  className="p-1 text-red-600 rounded hover:bg-red-50 touch-manipulation">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {layer.element.type === 'image' && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Print quality:</span>
                <span className={`font-medium ${layer.printQualityColor}`}>{layer.printQuality} / {layer.dpi} DPI</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Dimensions */}
      {selectedId && (() => {
        const selectedElement = designElements[activeArea]?.find(el => el.id === selectedId);
        if (!selectedElement) return null;

        const canvasConfig = getCanvasConfig(activeArea);
        const maxW = canvasConfig.realWorldWidth;
        const maxH = canvasConfig.realWorldHeight;
        const aspectRatio = selectedElement.width / selectedElement.height;

        const handleWidthChange = (value: string) => {
          const num = parseFloat(value);
          setCustomWidth(value);
          if (isNaN(num) || num <= 0) return;
          if (lockAspectRatio) {
            const newH = num / aspectRatio;
            setCustomHeight(newH > maxH ? (maxH).toFixed(2) : newH.toFixed(2));
          }
        };

        const handleHeightChange = (value: string) => {
          const num = parseFloat(value);
          setCustomHeight(value);
          if (isNaN(num) || num <= 0) return;
          if (lockAspectRatio) {
            const newW = num * aspectRatio;
            setCustomWidth(newW > maxW ? (maxW).toFixed(2) : newW.toFixed(2));
          }
        };

        const applyDimensions = () => {
          const wNum = parseFloat(customWidth);
          const hNum = parseFloat(customHeight);
          if (isNaN(wNum) || isNaN(hNum) || wNum <= 0 || hNum <= 0) { alert('⚠️ Enter valid dimensions'); return; }
          if (wNum > maxW || hNum > maxH) { alert(`⚠️ Exceeds printable area: ${maxW.toFixed(2)}" × ${maxH.toFixed(2)}"`); return; }

          const printableArea = getPrintableAreaFromPhoto(activeArea, activeColor);
          const avgPPI = ((printableArea.width / canvasConfig.realWorldWidth) + (printableArea.height / canvasConfig.realWorldHeight)) / 2;

          setDesignElements(prev => {
            const updated = { ...prev };
            if (updated[activeArea]) {
              updated[activeArea] = updated[activeArea].map(el =>
                el.id === selectedId
                  ? { ...el, width: wNum * avgPPI, height: hNum * avgPPI, x: printableArea.x + printableArea.width / 2 - (wNum * avgPPI) / 2, y: printableArea.y + printableArea.height / 2 - (hNum * avgPPI) / 2, scaleX: 1, scaleY: 1 }
                  : el
              );
            }
            return updated;
          });
          setTimeout(() => { updatePricingData(); triggerUpdate(); }, 100);
        };

        return (
          <div className="mt-4 border-0 rounded-lg" style={{ backgroundColor: '#fff3e0' }}
            onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" style={{ color: '#e65100' }} />
                  <h4 className="text-sm font-semibold" style={{ color: '#e65100' }}>Custom Dimensions</h4>
                </div>
                <button onClick={e => { e.stopPropagation(); setLockAspectRatio(!lockAspectRatio); }}
                  className="p-1 rounded transition-colors"
                  style={{ backgroundColor: lockAspectRatio ? '#e65100' : 'white', color: lockAspectRatio ? 'white' : '#e65100', border: lockAspectRatio ? 'none' : '1px solid #e65100' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </button>
              </div>

              <div className="px-2 py-1 mb-2 text-xs rounded" style={{ backgroundColor: '#ffe0b2', color: '#bf360c' }}>
                Max: {maxW.toFixed(2)}" × {maxH.toFixed(2)}"
              </div>

              {(['Width', 'Height'] as const).map(dim => (
                <div key={dim} className="flex items-center gap-2 mb-2">
                  <label className="w-16 text-xs font-medium" style={{ color: '#bf360c' }}>{dim}:</label>
                  <input
                    type="number" step="0.01" min="0.1" max={dim === 'Width' ? maxW : maxH}
                    value={dim === 'Width' ? customWidth : customHeight}
                    onChange={e => dim === 'Width' ? handleWidthChange(e.target.value) : handleHeightChange(e.target.value)}
                    onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}
                    onKeyDown={e => { e.stopPropagation(); }}
                    className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none"
                    style={{ borderColor: '#ffccbc' }}
                    placeholder={`${dim} in inches`}
                  />
                  <span className="text-xs font-semibold" style={{ color: '#e65100' }}>"</span>
                </div>
              ))}

              <button
                onClick={e => { e.stopPropagation(); applyDimensions(); }}
                onMouseDown={e => e.stopPropagation()}
                disabled={!customWidth || !customHeight}
                className="w-full px-3 py-2 text-sm font-medium text-white rounded disabled:bg-gray-400"
                style={{ backgroundColor: customWidth && customHeight ? '#e65100' : '#9e9e9e' }}>
                Apply Dimensions
              </button>
            </div>
          </div>
        );
      })()}

      {layers.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <div className="mb-2 text-2xl">📄</div>
          <p className="text-sm">No layers yet</p>
          <p className="mt-1 text-xs">Upload images to create layers</p>
        </div>
      )}
    </div>
  );
};