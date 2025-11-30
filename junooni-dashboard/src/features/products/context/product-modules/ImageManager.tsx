// ../context/product-components/ImageManager.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { IconPhotoPlus, IconTrash, IconInfoCircle, IconX } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { isColorOption } from './utils';
import { MediaItem, VariantInfo, Option, Variant } from './types';
import { NonColorButtonSelector } from './OptionComponents';
import { RobustOptionSelector } from './VariantComponents';

// Streamlined Image Manager Component for handling variant-specific uploads
export const StreamlinedImageManager: React.FC<{
  mediaItems: MediaItem[];
  setMediaItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  options: Option[];
  variants: Variant[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, variantInfo?: VariantInfo | null) => void;
}> = ({
  mediaItems,
  setMediaItems,
  options,
  variants,
  fileInputRef,
  handleFileChange
}) => {
  // State for selected variant or option values
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedOptionValues, setSelectedOptionValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  
  // Get valid options with values for filtering
  const validOptions = options.filter(opt => 
    opt.title && opt.optionValues && opt.optionValues.length > 0
  );

  // Find options that have imageAssociation set to true
  const imageAssociatedOptions = useMemo(() => {
    return validOptions.filter(opt => opt.imageAssociation === true);
  }, [validOptions]);

  // Determine association mode based on checked options and variant availability
  const associationMode = useMemo(() => {
    if (variants.length === 0 || imageAssociatedOptions.length === 0) {
      return 'none';
    } else if (imageAssociatedOptions.length === 1) {
      return 'single';
    } else {
      return 'combination';
    }
  }, [variants.length, imageAssociatedOptions.length]);

  // Filter variants to only show those with values for checked options
  const getFilteredVariants = useCallback(() => {
    if (associationMode !== 'combination' || variants.length === 0) return [];
  
    // Get the titles of options that have imageAssociation enabled
    const associatedOptionTitles = imageAssociatedOptions.map(opt => opt.title);
    
    // If no options are selected for association, return empty array
    if (associatedOptionTitles.length === 0) return [];
    
    try {
      // Filter variants that have ONLY the selected option values
      return variants.filter(variant => {
        // Skip variants without optionValues
        if (!variant.optionValues || !Array.isArray(variant.optionValues) || variant.optionValues.length === 0) {
          return false;
        }
  
        // Create a filtered set of option values that only includes the associated options
        const relevantOptionValues = variant.optionValues.filter(ov => 
          ov.optionName && associatedOptionTitles.includes(ov.optionName)
        );
        
        // If the filtered set doesn't contain all the associated options, exclude this variant
        if (relevantOptionValues.length !== associatedOptionTitles.length) {
          return false;
        }
        
        // Make sure every associated option is represented in this variant
        const variantHasAllAssociatedOptions = associatedOptionTitles.every(optTitle => 
          relevantOptionValues.some(ov => ov.optionName === optTitle)
        );
        
        return variantHasAllAssociatedOptions;
      });
    } catch (err) {
      console.error("Error filtering variants:", err);
      return [];
    }
  }, [associationMode, imageAssociatedOptions.map(opt => opt.title).join(','), variants]);

  // Function to filter images based on selected criteria
  const getFilteredImages = useCallback(() => {
    if (associationMode === 'none') {
      return mediaItems;
    } else if (associationMode === 'single') {
      // Filter for a single option value
      const option = imageAssociatedOptions[0];
      const value = selectedOptionValues[option?.title];
      if (!value) return [];
      
      return mediaItems.filter(item => 
        item.variantInfo?.optionName === option.title && 
        item.variantInfo?.optionValues?.includes(value)
      );
    } else if (associationMode === 'combination' && selectedVariantId) {
      // Filter for specific variant combination
      return mediaItems.filter(item => 
        item.variantInfo?.variantId === selectedVariantId
      );
    }
    return [];
  }, [associationMode, imageAssociatedOptions, mediaItems, selectedOptionValues, selectedVariantId]);

  // Pre-select first value and handle option changes properly
  useEffect(() => {
    // Clear error when mode changes
    setError(null);
    
    try {
      const newSelections: Record<string, string> = {};
      
      // Just collect selections, don't update state inside loop
      imageAssociatedOptions.forEach(option => {
        if (option.optionValues && option.optionValues.length > 0) {
          const currentSelection = selectedOptionValues[option.title];
          
          if (currentSelection && option.optionValues.includes(currentSelection)) {
            newSelections[option.title] = currentSelection;
          } else {
            newSelections[option.title] = option.optionValues[0];
          }
        }
      });
      
      // Only update state ONCE after processing all options
      if (Object.keys(newSelections).length > 0 && 
          JSON.stringify(newSelections) !== JSON.stringify(selectedOptionValues)) {
        setSelectedOptionValues(newSelections);
      }
      
      // If we switched to variant mode, pre-select first variant
      if (associationMode === 'combination') {
        const filteredVariants = getFilteredVariants();
        if (filteredVariants.length > 0) {
          // Use existing selection if it's still valid
          if (selectedVariantId && filteredVariants.some(v => v.id === selectedVariantId)) {
            // Keep current selection
          } else {
            // Default to first variant
            setSelectedVariantId(filteredVariants[0].id);
          }
        } else {
          setSelectedVariantId(null);
        }
      } else if (associationMode === 'single') {
        // For single mode, don't reset variant ID
        // This allows switching between options without losing selection
      } else {
        // For 'none' mode, clear selectedVariantId
        setSelectedVariantId(null);
      }
    } catch (err) {
      console.error("Error in preselection effect:", err);
      setError("Error setting up variant options. Please try again.");
    }
  }, [associationMode, imageAssociatedOptions, getFilteredVariants, selectedOptionValues]);

  // Handle option-specific upload with simplified metadata
  const handleOptionValueUpload = (
    optionName: string, 
    value: string, 
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!fileInputRef.current) return;
    
    //console.log(`Uploading for option: ${optionName}, value: ${value}`);
    
    // Clear any previous errors
    setError(null);
    
    try {
      // Use absolute minimal variantInfo - just name and value
      const variantInfo: VariantInfo = {
        optionName: optionName,
        optionValues: [value]
      };
  
      // Use a temporary fileInput
      const tempFileInput = document.createElement('input');
      tempFileInput.type = 'file';
      tempFileInput.multiple = true;
      tempFileInput.accept = 'image/*';
      
      tempFileInput.addEventListener('change', (e: Event) => {
        const inputElement = e.target as HTMLInputElement;
        if (inputElement.files) {
          const syntheticEvent = {
            target: inputElement
          } as React.ChangeEvent<HTMLInputElement>;
          
          handleFileChange(syntheticEvent, variantInfo);
        }
      });
      
      tempFileInput.click();
    } catch (err) {
      console.error("Error initiating option-specific upload:", err);
      setError("Error preparing upload. Please try again.");
    }
  };

  // Handle variant-specific upload with simplified metadata
  const handleVariantUpload = (variantId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!fileInputRef.current) return;
    
    // Clear any previous errors
    setError(null);
    
    try {
      const variant = variants.find(v => v.id === variantId);
      if (!variant) {
        console.error("Variant not found:", variantId);
        return;
      }
      
      // Validate that the variant has option values
      if (!variant.optionValues || !Array.isArray(variant.optionValues) || variant.optionValues.length === 0) {
        console.error("Variant has no option values:", variantId);
        setError("Selected variant is missing option values. Please try another variant.");
        return;
      }
      
      // Simplified structure for variant-specific uploads
      const variantInfo: VariantInfo = {
        variantId: variant.id,
        variantTitle: variant.title
      };

      // Use a temporary fileInput to avoid conflicts
      const tempFileInput = document.createElement('input');
      tempFileInput.type = 'file';
      tempFileInput.multiple = true;
      tempFileInput.accept = 'image/*';
      
      tempFileInput.addEventListener('change', (e: Event) => {
        const inputElement = e.target as HTMLInputElement;
        if (inputElement.files) {
          const syntheticEvent = {
            target: inputElement
          } as React.ChangeEvent<HTMLInputElement>;
          
          handleFileChange(syntheticEvent, variantInfo);
        }
      });
      
      tempFileInput.click();
    } catch (err) {
      console.error("Error initiating variant-specific upload:", err);
      setError("Error preparing upload. Please try again.");
    }
  };

  // Remove an image
  const handleRemoveImage = (index: number) => {
    setMediaItems((prev) => {
      const removed = prev[index];
      if (removed.file) {
        URL.revokeObjectURL(removed.url);
      }
      // Return filtered array with reordered ranks
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((item, i) => ({ ...item, rank: i }));
    });
  };

  // Move image up in order
  const handleMoveImageUp = (index: number) => {
    if (index === 0) return; // Already at the top
    
    setMediaItems((prev) => {
      const newMedia = [...prev];
      const temp = newMedia[index - 1];
      newMedia[index - 1] = { ...newMedia[index], rank: index - 1 };
      newMedia[index] = { ...temp, rank: index };
      return newMedia;
    });
  };

  // Move image down in order
  const handleMoveImageDown = (index: number) => {
    if (index === mediaItems.length - 1) return; // Already at the bottom
    
    setMediaItems((prev) => {
      const newMedia = [...prev];
      const temp = newMedia[index + 1];
      newMedia[index + 1] = { ...newMedia[index], rank: index + 1 };
      newMedia[index] = { ...temp, rank: index };
      return newMedia;
    });
  };

  // Get count of images
  const countImagesForOptionValue = (optionName: string, value: string): number => {
    return mediaItems.filter(item => 
      item.variantInfo?.optionName === optionName && 
      item.variantInfo?.optionValues?.includes(value)
    ).length;
  };

  // Count images for a specific variant
  const countImagesForVariant = (variantId: string): number => {
    return mediaItems.filter(item => item.variantInfo?.variantId === variantId).length;
  };

  // Render the filtered images
  const filteredImages = getFilteredImages();

  // Render the appropriate image upload interface based on association mode
  const renderUploadInterface = () => {
    // If no associations or no variants, return null as the parent component will handle upload
    if (variants.length === 0 || associationMode === 'none') {
      return null;
    } else if (associationMode === 'single') {
      // Single option selected - show option-specific selection
      const option = imageAssociatedOptions[0];
      if (!option) return null;
      
      const selectedValue = selectedOptionValues[option.title];
      
      return (
        <div className="space-y-4">
          {/* Option Selection UI */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Select {option.title}</h4>
              <Badge variant="outline" className="text-[#e65100] border-[#e65100] bg-orange-50 text-xs">
                Variant-specific
              </Badge>
            </div>
            
            {isColorOption(option.title) ? (
              // Color circles selector
              <div className="flex flex-wrap gap-3">
                {option.optionValues.map((value, index) => {
                  const isActive = selectedValue === value;
                  const imageCount = countImagesForOptionValue(option.title, value);
                  const hexValue = option.colorHexValues?.[value] || '#000000';
                  
                  return (
                    <div 
                      key={index}
                      onClick={() => {
                        //console.log(`Selecting color: ${value}`);
                        setSelectedOptionValues({
                          ...selectedOptionValues,
                          [option.title]: value
                        });
                      }}
                      className="text-center cursor-pointer"
                    >
                      <div 
                        className={`w-10 h-10 rounded-full mx-auto transition-all
                          ${isActive ? 'ring-2 ring-[#e65100] ring-offset-2' : 'border border-gray-200'}
                          ${imageCount > 0 ? 'shadow-md' : ''}`}
                        style={{ backgroundColor: hexValue }}
                      />
                      <span className="block text-xs mt-1 max-w-[60px] truncate">
                        {value}
                        {imageCount > 0 && <span className="ml-1 text-[#e65100]">({imageCount})</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Size or other dropdown with proper selection handling
              <NonColorButtonSelector
                option={option}
                selectedValue={selectedValue}
                setSelectedOptionValues={setSelectedOptionValues}
                countImagesForOptionValue={countImagesForOptionValue}
              />
            )}
          </div>
          
          {/* Upload area for selected option value */}
          {selectedValue && (
            <div 
              onClick={(e) => handleOptionValueUpload(option.title, selectedValue, e)}
              className="mt-4 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#e65100] hover:bg-orange-50 transition-all duration-200"
            >
              <div className="flex items-center justify-center w-12 h-12 mb-2 bg-orange-100 rounded-full">
                <IconPhotoPlus size={24} className="text-[#e65100]" />
              </div>
              {isColorOption(option.title) && option.colorHexValues?.[selectedValue] && (
                <div 
                  className="w-6 h-6 mb-2 border border-gray-300 rounded-full" 
                  style={{ backgroundColor: option.colorHexValues[selectedValue] }}
                />
              )}
              <p className="font-medium text-center text-gray-700">Upload images for {selectedValue} {option.title}</p>
              <p className="mt-1 text-xs text-center text-gray-500">
                Click to browse your files
              </p>
            </div>
          )}
        </div>
      );
    } else if (associationMode === 'combination') {
      // Multiple options selected - show robust selection interface that handles new options
      return (
        <div className="space-y-4">
          <RobustOptionSelector
            imageAssociatedOptions={imageAssociatedOptions}
            variants={variants}
            options={options}
            selectedVariantId={selectedVariantId}
            setSelectedVariantId={setSelectedVariantId}
            countImagesForVariant={countImagesForVariant}
            handleVariantUpload={handleVariantUpload}
          />
        </div>
      );
    }
    
    return null;
  };

  // Render the image gallery if there are images
  const renderImageGallery = () => {
    // Get filtered images based on current selection
    const imagesForSelection = getFilteredImages();
    
    // If no images match the current selection, show all images as fallback
    const displayImages = imagesForSelection.length > 0 ? imagesForSelection : mediaItems;
    
    if (displayImages.length === 0) {
      return (
        <div className="p-6 mt-4 text-center border border-gray-300 border-dashed rounded-md bg-gray-50">
          <p className="text-gray-500">No images added yet. {associationMode !== 'none' && 'Upload specific images for your selection.'}</p>
        </div>
      );
    }
      
    return (
      <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredImages.sort((a, b) => a.rank - b.rank).map((item, index) => {
          // Find the original index in the mediaItems array for remove/move operations
          const originalIndex = mediaItems.findIndex(mi => mi === item);
          
          return (
            <div
              key={`${item.url}-${index}`}
              className="relative flex flex-col overflow-hidden transition-all duration-200 bg-white border rounded-md group hover:shadow-md"
            >
              <div className="relative flex items-center justify-center md:h-52 h-72 overflow-hidden bg-gray-100">
                <img
                  src={item.url}
                  alt={`Product image ${index + 1}`}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 bg-black bg-opacity-0 opacity-0 group-hover:bg-opacity-20 group-hover:opacity-100">
                  {/* Trash button - top right corner */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(originalIndex)}
                    className="absolute top-2 right-2 p-1.5 text-red-500 bg-red-50 rounded-full hover:bg-red-100"
                  >
                    <IconTrash size={16} />
                  </button>
                  
                  {/* Move buttons - center */}
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => handleMoveImageUp(originalIndex)}
                      disabled={originalIndex === 0}
                      className="p-1 text-white bg-gray-800 rounded-full disabled:opacity-50 hover:bg-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveImageDown(originalIndex)}
                      disabled={originalIndex === mediaItems.length - 1}
                      className="p-1 text-white bg-gray-800 rounded-full disabled:opacity-50 hover:bg-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              {/* <div className="flex items-center justify-between p-3 border-t">
                <div className="flex-1 text-sm text-gray-600 truncate">
                  {item.file ? item.file.name.substring(0, 20) : `Image ${index + 1}`}
                  <div className="flex flex-wrap gap-1 mt-1">
                    Show variant title for variant-specific images
                    {item.variantInfo?.variantId && (
                      <Badge className="bg-[#e65100] text-white text-xs">
                        {item.variantInfo.variantTitle || 
                          variants.find(v => v.id === item.variantInfo?.variantId)?.title || 
                          'Variant'}
                      </Badge>
                    )}
                    
                    Show option value for option-specific images
                    {item.variantInfo?.optionName && item.variantInfo.optionValues?.[0] && !item.variantInfo.variantId && (
                      <Badge className="bg-[#e65100] text-white text-xs">
                        {isColorOption(item.variantInfo.optionName) && 
                          validOptions.find(opt => opt.title === item.variantInfo?.optionName)?.colorHexValues?.[item.variantInfo.optionValues[0]] && (
                          <span 
                            className="inline-block w-2 h-2 mr-1 rounded-full" 
                            style={{ backgroundColor: validOptions.find(opt => 
                              opt.title === item.variantInfo?.optionName
                            )?.colorHexValues?.[item.variantInfo.optionValues[0]] }}
                          />
                        )}
                        {item.variantInfo.optionName}: {item.variantInfo.optionValues[0]}
                      </Badge>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(originalIndex)}
                  className="p-1.5 text-red-500 bg-red-50 rounded-full hover:bg-red-100"
                >
                  <IconTrash size={16} />
                </button>
              </div> */}
              {/* {originalIndex === 0 && (
                <div className="absolute top-2 left-2 bg-[#e65100] text-white text-xs px-2 py-1 rounded-md">
                  Main
                </div>
              )} */}
            </div>
          );
        })}
      </div>
    );
  };

  // Main render
  return (
    <div className="space-y-6">
      {/* Error display */}
      {error && (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="flex items-start text-sm text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </p>
        </div>
      )}
      
      {/* Association description text based on mode */}
      {/* {associationMode !== 'none' && (
        <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
          <p className="flex items-start text-sm text-gray-700">
            <IconInfoCircle size={16} className="mt-0.5 mr-1.5 text-[#e65100]" />
            <span>
              {associationMode === 'single' && 
                `Images will be associated with specific ${imageAssociatedOptions[0]?.title} values`}
              {associationMode === 'combination' && 
                `Images will be associated with specific ${imageAssociatedOptions.map(o => o.title).join(' and ')} combinations`}
            </span>
          </p>
        </div>
      )} */}
      
      {/* Single upload interface based on the current mode */}
      {renderUploadInterface()}
      
      {/* Image gallery */}
      {renderImageGallery()}
    </div>
  );
};