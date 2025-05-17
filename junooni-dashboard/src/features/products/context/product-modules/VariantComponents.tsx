// ../context/product-components/VariantComponents.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { IconPhotoPlus } from '@tabler/icons-react';
import { isColorOption } from './utils';
import { Option, Variant } from './types';

// Variant selector that uses a combination of storefront-style layout
export const SimplifiedStorefrontSelector = ({
  imageAssociatedOptions,
  variants,
  options,
  selectedVariantId,
  setSelectedVariantId,
  countImagesForVariant,
  handleVariantUpload
}) => {
  // Split options by type
  const colorOption = imageAssociatedOptions.find(opt => isColorOption(opt.title));
  const nonColorOptions = imageAssociatedOptions.filter(opt => !isColorOption(opt.title));
  
  // Simple state for selections - one state per option
  const [colorSelection, setColorSelection] = useState('');
  const [sizeSelection, setSizeSelection] = useState('');
  const [otherSelection, setOtherSelection] = useState('');
  const [initialized, setInitialized] = useState(false);
  
  // Initialize with first values
  useEffect(() => {
    if (initialized) return;
    
    // Only run once
    setInitialized(true);
    
    // Set initial values if options exist
    if (colorOption && colorOption.optionValues && colorOption.optionValues.length > 0) {
      console.log("Preselecting color:", colorOption.optionValues[0]);
      setColorSelection(colorOption.optionValues[0]);
    }
    
    if (nonColorOptions.length > 0 && nonColorOptions[0].optionValues.length > 0) {
      console.log("Preselecting size:", nonColorOptions[0].optionValues[0]);
      setSizeSelection(nonColorOptions[0].optionValues[0]);
    }
    
    if (nonColorOptions.length > 1 && nonColorOptions[1].optionValues.length > 0) {
      console.log("Preselecting other:", nonColorOptions[1].optionValues[0]);
      setOtherSelection(nonColorOptions[1].optionValues[0]);
    }
  }, [colorOption, nonColorOptions, initialized]);
  
  // Find matching variant when selections change
  useEffect(() => {
    console.log("Selections:", { colorSelection, sizeSelection, otherSelection });
    
    // Only proceed if we have at least one selection
    if (!colorSelection && !sizeSelection && !otherSelection) {
      return;
    }
    
    // Find the matching variant
    let matchingVariantId = null;
    
    for (const variant of variants) {
      let isMatch = true;
      
      // Check color match if we have a color option and selection
      if (colorOption && colorSelection) {
        const colorMatch = variant.optionValues.some(ov => 
          ov.optionName === colorOption.title && ov.value === colorSelection
        );
        if (!colorMatch) {
          isMatch = false;
          continue;
        }
      }
      
      // Check size match if we have size selection
      if (sizeSelection) {
        const sizeOption = nonColorOptions[0]; // Assuming first non-color is size
        if (sizeOption) {
          const sizeMatch = variant.optionValues.some(ov => 
            ov.optionName === sizeOption.title && ov.value === sizeSelection
          );
          if (!sizeMatch) {
            isMatch = false;
            continue;
          }
        }
      }
      
      // Check other match if we have other selection
      if (otherSelection) {
        const otherOption = nonColorOptions[1]; // Assuming second non-color is other
        if (otherOption) {
          const otherMatch = variant.optionValues.some(ov => 
            ov.optionName === otherOption.title && ov.value === otherSelection
          );
          if (!otherMatch) {
            isMatch = false;
            continue;
          }
        }
      }
      
      // If we got here, we have a match
      if (isMatch) {
        matchingVariantId = variant.id;
        break;
      }
    }
    
    console.log("Matching variant ID:", matchingVariantId);
    setSelectedVariantId(matchingVariantId);
    
  }, [colorSelection, sizeSelection, otherSelection, colorOption, nonColorOptions, variants, setSelectedVariantId]);
  
  // Helper function to get current selection text
  const getSelectionText = () => {
    const parts = [];
    if (colorSelection) parts.push(colorSelection);
    if (sizeSelection) parts.push(sizeSelection);
    if (otherSelection) parts.push(otherSelection);
    return parts.join(' / ');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Select Options</h4>
        <Badge variant="outline" className="text-[#e65100] border-[#e65100] bg-orange-50 text-xs">
          {imageAssociatedOptions.map(o => o.title).join(' + ')}
        </Badge>
      </div>
      
      {/* Color Selection (if present) */}
      {colorOption && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select {colorOption.title}
          </label>
          <div className="flex flex-wrap gap-3">
            {colorOption.optionValues.map((value, index) => {
              const isActive = colorSelection === value;
              const hexValue = colorOption.colorHexValues?.[value] || '#000000';
              
              return (
                <div 
                  key={index}
                  onClick={() => setColorSelection(value)}
                  className="cursor-pointer text-center"
                >
                  <div 
                    className={`w-10 h-10 rounded-full mx-auto transition-all
                      ${isActive ? 'ring-2 ring-[#e65100] ring-offset-2' : 'border border-gray-200'}
                    `}
                    style={{ backgroundColor: hexValue }}
                  />
                  <span className="block text-xs mt-1 max-w-[60px] truncate">
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* First non-color option (likely Size) */}
      {nonColorOptions.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select {nonColorOptions[0].title}
          </label>
          <div className="flex flex-wrap gap-2">
            {nonColorOptions[0].optionValues.map((value, valueIndex) => {
              const isActive = sizeSelection === value;
              
              return (
                <button
                  key={valueIndex}
                  type="button"
                  onClick={() => setSizeSelection(value)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    isActive 
                      ? 'bg-orange-100 text-[#e65100] border border-orange-200' 
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Second non-color option (if exists) */}
      {nonColorOptions.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select {nonColorOptions[1].title}
          </label>
          <div className="flex flex-wrap gap-2">
            {nonColorOptions[1].optionValues.map((value, valueIndex) => {
              const isActive = otherSelection === value;
              
              return (
                <button
                  key={valueIndex}
                  type="button"
                  onClick={() => setOtherSelection(value)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    isActive 
                      ? 'bg-orange-100 text-[#e65100] border border-orange-200' 
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Upload button */}
      <div 
        onClick={(e) => selectedVariantId ? handleVariantUpload(selectedVariantId, e) : e.preventDefault()}
        className={`mt-6 flex flex-col items-center justify-center p-6 border-2 border-dashed 
          ${selectedVariantId ? 'border-gray-300 hover:border-[#e65100] hover:bg-orange-50 cursor-pointer' : 'border-gray-200 bg-gray-50 cursor-not-allowed'} 
          rounded-lg transition-all duration-200`}
      >
        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-2">
          <IconPhotoPlus size={24} className="text-[#e65100]" />
        </div>
        
        {/* Show color circle if available */}
        {colorOption && colorSelection && (
          <div 
            className="w-6 h-6 rounded-full border border-gray-300 mb-2" 
            style={{ backgroundColor: colorOption.colorHexValues?.[colorSelection] || '#000000' }}
          />
        )}
        
        {selectedVariantId ? (
          <>
            <p className="text-gray-700 font-medium text-center">
              Upload images for {getSelectionText()}
            </p>
            <p className="mt-1 text-xs text-gray-500 text-center">
              Click to browse your files
            </p>
            
            {/* Show existing image count if any */}
            {countImagesForVariant(selectedVariantId) > 0 && (
              <Badge className="mt-2 bg-[#e65100] text-white">
                {countImagesForVariant(selectedVariantId)} existing images
              </Badge>
            )}
          </>
        ) : (
          <p className="text-gray-500 font-medium text-center">
            Select options above to upload images
          </p>
        )}
      </div>
    </div>
  );
};

// More flexible variant selector that can handle dynamic option changes
export const RobustOptionSelector = ({
  imageAssociatedOptions,
  variants,
  options,
  selectedVariantId,
  setSelectedVariantId,
  countImagesForVariant,
  handleVariantUpload
}) => {
  // Split options by type
  const colorOption = imageAssociatedOptions.find(opt => isColorOption(opt.title));
  const nonColorOptions = imageAssociatedOptions.filter(opt => !isColorOption(opt.title));
  
  // Dynamic state for selections
  const [selections, setSelections] = useState({});
  
  // THIS IS THE KEY FIX: Run whenever imageAssociatedOptions changes
  // This ensures we catch newly added options
  useEffect(() => {
    console.log("Options changed, checking for new options to preselect");
    
    // Get all available option titles
    const allOptionTitles = imageAssociatedOptions.map(opt => opt.title);
    console.log("All option titles:", allOptionTitles);
    
    // Get currently selected option titles
    const selectedOptionTitles = Object.keys(selections);
    console.log("Currently selected option titles:", selectedOptionTitles);
    
    // Identify options that need to be preselected
    const optionsToPreselect = imageAssociatedOptions.filter(opt => 
      !selectedOptionTitles.includes(opt.title) && 
      opt.optionValues && 
      opt.optionValues.length > 0
    );
    
    console.log("Options to preselect:", optionsToPreselect.map(o => o.title));
    
    // If we found options that need preselection, update the selections
    if (optionsToPreselect.length > 0) {
      const newSelections = { ...selections };
      
      optionsToPreselect.forEach(option => {
        console.log(`Preselecting ${option.title}: ${option.optionValues[0]}`);
        newSelections[option.title] = option.optionValues[0];
      });
      
      setSelections(newSelections);
    }
  }, [imageAssociatedOptions]);
  
  // Handle selecting an option value
  const handleSelect = (optionTitle, value) => {
    console.log(`Selecting ${optionTitle}: ${value}`);
    setSelections(prev => ({
      ...prev,
      [optionTitle]: value
    }));
  };
  
  // Find matching variant when selections change
  useEffect(() => {
    console.log("Selections changed:", selections);
    
    // Only proceed if we have selections
    if (Object.keys(selections).length === 0) {
      return;
    }
    
    // Find the matching variant
    const optionTitles = imageAssociatedOptions.map(opt => opt.title);
    let matchingVariantId = null;
    
    for (const variant of variants) {
      let isMatch = true;
      
      // Check all selected options
      for (const optionTitle of optionTitles) {
        const selectedValue = selections[optionTitle];
        if (!selectedValue) continue; // Skip if no selection for this option
        
        const optionMatch = variant.optionValues.some(ov => 
          ov.optionName === optionTitle && ov.value === selectedValue
        );
        
        if (!optionMatch) {
          isMatch = false;
          break;
        }
      }
      
      // If we got here with isMatch still true, we have a full match
      if (isMatch) {
        matchingVariantId = variant.id;
        break;
      }
    }
    
    console.log("Matching variant ID:", matchingVariantId);
    setSelectedVariantId(matchingVariantId);
    
  }, [selections, imageAssociatedOptions, variants, setSelectedVariantId]);
  
  // Helper function to get current selection text
  const getSelectionText = () => {
    return Object.values(selections).join(' / ');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Select Options</h4>
        <Badge variant="outline" className="text-[#e65100] border-[#e65100] bg-orange-50 text-xs">
          {imageAssociatedOptions.map(o => o.title).join(' + ')}
        </Badge>
      </div>
      
      {/* Color Option (if present) */}
      {colorOption && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select {colorOption.title}
          </label>
          <div className="flex flex-wrap gap-3">
            {colorOption.optionValues.map((value, index) => {
              const isActive = selections[colorOption.title] === value;
              const hexValue = colorOption.colorHexValues?.[value] || '#000000';
              
              return (
                <div 
                  key={index}
                  onClick={() => handleSelect(colorOption.title, value)}
                  className="cursor-pointer text-center"
                >
                  <div 
                    className={`w-10 h-10 rounded-full mx-auto transition-all
                      ${isActive ? 'ring-2 ring-[#e65100] ring-offset-2' : 'border border-gray-200'}
                    `}
                    style={{ backgroundColor: hexValue }}
                  />
                  <span className="block text-xs mt-1 max-w-[60px] truncate">
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Non-Color Options */}
      {nonColorOptions.map((option, optIndex) => (
        <div key={option.id || optIndex} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select {option.title}
          </label>
          <div className="flex flex-wrap gap-2">
            {option.optionValues.map((value, valueIndex) => {
              const isActive = selections[option.title] === value;
              
              return (
                <button
                  key={valueIndex}
                  type="button"
                  onClick={() => handleSelect(option.title, value)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    isActive 
                      ? 'bg-orange-100 text-[#e65100] border border-orange-200' 
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Upload button */}
      <div 
        onClick={(e) => selectedVariantId ? handleVariantUpload(selectedVariantId, e) : e.preventDefault()}
        className={`mt-6 flex flex-col items-center justify-center p-6 border-2 border-dashed 
          ${selectedVariantId ? 'border-gray-300 hover:border-[#e65100] hover:bg-orange-50 cursor-pointer' : 'border-gray-200 bg-gray-50 cursor-not-allowed'} 
          rounded-lg transition-all duration-200`}
      >
        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-2">
          <IconPhotoPlus size={24} className="text-[#e65100]" />
        </div>
        
        {/* Show color circle if available */}
        {colorOption && selections[colorOption.title] && (
          <div 
            className="w-6 h-6 rounded-full border border-gray-300 mb-2" 
            style={{ backgroundColor: colorOption.colorHexValues?.[selections[colorOption.title]] || '#000000' }}
          />
        )}
        
        {selectedVariantId ? (
          <>
            <p className="text-gray-700 font-medium text-center">
              Upload images for {getSelectionText()}
            </p>
            <p className="mt-1 text-xs text-gray-500 text-center">
              Click to browse your files
            </p>
            
            {/* Show existing image count if any */}
            {countImagesForVariant(selectedVariantId) > 0 && (
              <Badge className="mt-2 bg-[#e65100] text-white">
                {countImagesForVariant(selectedVariantId)} existing images
              </Badge>
            )}
          </>
        ) : (
          <p className="text-gray-500 font-medium text-center">
            Select options above to upload images
          </p>
        )}
      </div>
    </div>
  );
};

// Component for the variant selection in combination mode
export const VariantCombinationButtonSelector = ({ 
  filteredVariants, 
  selectedVariantId, 
  setSelectedVariantId, 
  imageAssociatedOptions, 
  countImagesForVariant 
}) => {
  // Extract just the titles of the associated options
  const associatedOptionTitles = imageAssociatedOptions.map(opt => opt.title);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Select Combination</h4>
        <Badge variant="outline" className="text-[#e65100] border-[#e65100] bg-orange-50 text-xs">
          {associatedOptionTitles.join(' + ')}
        </Badge>
      </div>
      
      {filteredVariants.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {filteredVariants.map(variant => {
            const isActive = selectedVariantId === variant.id;
            const imageCount = countImagesForVariant(variant.id);
            
            // Create a filtered title showing only the associated options
            const filteredOptionValues = variant.optionValues
              .filter(ov => associatedOptionTitles.includes(ov.optionName))
              .map(ov => ov.value);
            
            const filteredTitle = filteredOptionValues.join(' / ');
            
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                className={`px-3 py-2 rounded-md text-sm ${
                  isActive 
                    ? 'bg-orange-100 text-[#e65100] border border-orange-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                {filteredTitle}
                {imageCount > 0 && (
                  <span className="ml-1 text-[#e65100]">({imageCount})</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-4 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-md">
          No combinations available. Please check your option selections.
        </div>
      )}
    </div>
  );
};