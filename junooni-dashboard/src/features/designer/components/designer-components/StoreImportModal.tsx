import React, { useCallback } from 'react';
import type { StoreImportData, ImageGenerationProgress, MockupCalculationResult } from '../types';

interface StoreImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  importData: StoreImportData | null;
  isGenerating: boolean;
  generationProgress: ImageGenerationProgress | null;
  mockupCalculation: MockupCalculationResult | null;
  setActiveView?: (view: 'design' | 'preview') => void;
  setActiveTab?: (tab: string) => void;
}

const RotatingMessage: React.FC = () => {
  const messages = [
    '✨ Magic is happening...', '🎨 Creating masterpieces...', '🚀 Generating awesomeness...',
    '☑️ Working our magic...', '🎪 Show time in progress...', '🌟 Crafting something special...',
    '🎯 Almost there...', '💌 Making it perfect...',
  ];
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setIdx(v => (v + 1) % messages.length), 2000);
    return () => clearInterval(id);
  }, []);
  return <span>{messages[idx]}</span>;
};

export const StoreImportModal: React.FC<StoreImportModalProps> = ({
  isOpen, onClose, importData, isGenerating, generationProgress, mockupCalculation,
  setActiveView, setActiveTab,
}) => {
  const BRAND = '#ec5100';
  const hasError = (importData?.generation_summary?.errors?.length ?? 0) > 0;

  const handleCloseAndNavigate = (tab: string) => {
    onClose();
    setActiveView?.('design');
    setActiveTab?.(tab);
  };

  const downloadImportData = useCallback(() => {
    if (!importData) return;
    try {
      const blob = new Blob([JSON.stringify(importData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${importData.product_name.replace(/\s+/g, '_')}_store_import.json`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 100);
    } catch { alert('Error downloading file.'); }
  }, [importData]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget && !isGenerating) onClose(); }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold" style={{ color: hasError ? '#dc2626' : BRAND }}>
            {hasError ? '⚠️ Limit Exceeded' : 'Store Import'}
          </h2>
          {!isGenerating && (
            <button onClick={onClose} className="p-1 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100">✕</button>
          )}
        </div>

        <div className="px-4 py-5 space-y-5">
          {/* Error state */}
          {hasError && !isGenerating && (
            <div className="p-6 space-y-4 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Too Many Mockups</h3>
                  <p className="mt-1 text-sm text-red-700">Please reduce selected colors to continue</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button onClick={() => handleCloseAndNavigate('product')}
                  className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700">
                  Reduce Colors
                </button>
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">Close</button>
              </div>
            </div>
          )}

          {/* Progress state */}
          {isGenerating && generationProgress && (
            <div className="p-6 border rounded bg-orange-50">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-t-2 border-b-2 border-[#e65100] rounded-full animate-spin" />
                <div className="text-center">
                  <div className="font-medium text-[#e65100] mb-1"><RotatingMessage /></div>
                  <div className="text-sm text-gray-600">{generationProgress.completed}/{generationProgress.total} images</div>
                </div>
                <div className="w-full max-w-md">
                  <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
                    <div
                      className="h-full transition-all duration-300 bg-[#e65100]"
                      style={{ width: `${generationProgress.total > 0 ? (generationProgress.completed / generationProgress.total) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-center text-gray-600">
                    {generationProgress.total > 0 ? Math.round((generationProgress.completed / generationProgress.total) * 100) : 0}% Complete
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Completed state */}
          {!isGenerating && importData && !hasError && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 border rounded bg-green-50">
                <span className="text-green-600">✅</span>
                <span className="text-sm text-green-700">
                  {importData.generation_summary.total_images_generated} images generated in {Math.round(importData.generation_summary.total_time_ms / 1000)}s
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-center">
                <div className="p-3 rounded bg-gray-50">
                  <div className="text-xl font-bold" style={{ color: BRAND }}>{importData.mockup_variants.length}</div>
                  <div className="text-gray-600">Variants</div>
                </div>
                <div className="p-3 rounded bg-gray-50">
                  <div className="text-xl font-bold" style={{ color: BRAND }}>{importData.generation_summary.total_images_generated}</div>
                  <div className="text-gray-600">Images</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button onClick={downloadImportData} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">Download</button>
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded hover:bg-gray-700">Close</button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isGenerating && !importData && !hasError && (
            <div className="py-6 text-sm text-center text-gray-600">
              <div className="mb-2 text-3xl">🎪</div>
              No import data yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};