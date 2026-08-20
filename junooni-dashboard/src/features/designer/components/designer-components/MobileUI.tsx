import React, { useState } from 'react';
import { Package, Palette, Ruler, Upload, Layers, IndianRupee, X } from 'lucide-react';
import type { UploadedFile } from '../types';

// ── MobileBottomTabBar ────────────────────────────────────────────────────────

interface MobileBottomTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedColors: Array<{ name: string; value: string }>;
  selectedSizes: string[];
  uploadedFiles: UploadedFile[];
  layersCount: number;
  totalPrice: number;
}

export const MobileBottomTabBar: React.FC<MobileBottomTabBarProps> = ({
  activeTab, onTabChange, selectedColors, selectedSizes, uploadedFiles, layersCount, totalPrice,
}) => {
  const tabs = [
    { id: 'product',  icon: Package,      label: 'Product', count: 1 },
    { id: 'colors',   icon: Palette,      label: 'Colors',  count: selectedColors.length },
    { id: 'sizes',    icon: Ruler,        label: 'Sizes',   count: selectedSizes.length },
    { id: 'upload',   icon: Upload,       label: 'Upload',  count: uploadedFiles.length },
    { id: 'layers',   icon: Layers,       label: 'Layers',  count: layersCount },
    { id: 'pricing',  icon: IndianRupee,  label: 'Price',   count: totalPrice > 0 ? 1 : 0 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 sm:hidden">
      {totalPrice > 0 && (
        <div className="px-4 py-1 border-b border-green-200 bg-green-50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-700">Current Unit Price:</span>
            <span className="font-bold text-green-800">₹{totalPrice}</span>
          </div>
        </div>
      )}
      <div className="flex">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-2 px-1 flex flex-col items-center justify-center transition-colors touch-manipulation ${
                activeTab === tab.id ? 'text-[#e65100] bg-orange-50' : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                {tab.count > 0 && tab.id !== 'product' && (
                  <span className="absolute flex items-center justify-center w-3 h-3 text-xs font-bold text-white bg-orange-500 rounded-full -top-1 -right-1">
                    {tab.count > 9 ? '9+' : tab.count}
                  </span>
                )}
              </div>
              <span className="mt-1 text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── MobileBottomSheet ─────────────────────────────────────────────────────────

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen, onClose, title, children,
}) => {
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => setStartY(e.touches[0].clientY);
  const handleTouchMove = (e: React.TouchEvent) => { if (startY !== null) setCurrentY(e.touches[0].clientY); };
  const handleTouchEnd = () => {
    if (startY !== null && currentY !== null && currentY - startY > 100) onClose();
    setStartY(null); setCurrentY(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl max-h-[80vh] flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-center py-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 capitalize">{title}</h3>
          <button onClick={onClose} className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 touch-manipulation">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};