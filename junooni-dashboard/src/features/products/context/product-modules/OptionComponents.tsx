// ../context/product-components/OptionComponents.tsx

import React, { useState, useEffect } from 'react';
import { IconCirclePlus, IconX, IconEdit, IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { HexColorPicker } from 'react-colorful';

import { isColorOption } from './utils';
import type { Option } from './types';


// Enhanced Option Component with consistent layout and image association checkbox
export const EnhancedOptionComponent = ({ 
  optionIndex, 
  currentOption, 
  updateOption,
  handleGenerateVariants,
  form
}: { 
  optionIndex: number, 
  currentOption: Option, 
  updateOption: (index: number, value: Option) => void,
  handleGenerateVariants: () => void,
  form: any
}) => {
  const [newOptionValue, setNewOptionValue] = useState<string>('');
  const [activeColorEdit, setActiveColorEdit] = useState<string | null>(null);
  const [tempHexValue, setTempHexValue] = useState<string>('#000000');
  
  // IMPORTANT: Get the initial state from the current option
  const [showImageAssociation, setShowImageAssociation] = useState<boolean>(
    Boolean(currentOption.imageAssociation) // Use Boolean to ensure it's a boolean
  );
  
  // Check if this is a color option
  const isColorOpt = isColorOption(currentOption.title);
  
  // Get option values
  const optionValues = currentOption.optionValues || [];
  
  // Get color hex values if this is a color option
  const colorHexValues = isColorOpt ? (currentOption.colorHexValues || {}) : {};
  
  // Add a new option value
  const handleAddOptionValue = () => {
    if (!newOptionValue || newOptionValue.trim() === '') return;
    
    try {
      // Check if value already exists
      if (optionValues.includes(newOptionValue)) {
        alert(`This ${isColorOpt ? 'color' : 'value'} already exists`);
        return;
      }
      
      // Get current option values and add the new value
      const updatedValues = [...optionValues, newOptionValue];
      
      // Create a deep copy to prevent reference issues
      const updatedOption = JSON.parse(JSON.stringify(currentOption));
      
      // Update option with new values
      if (isColorOpt) {
        // For color options, also add hex value
        if (!updatedOption.colorHexValues) updatedOption.colorHexValues = {};
        updatedOption.colorHexValues[newOptionValue] = tempHexValue; // Use selected hex value
        updatedOption.optionValues = updatedValues;
      } else {
        // For non-color options
        updatedOption.optionValues = updatedValues;
      }
      
      updateOption(optionIndex, updatedOption);
      
      // Clear inputs
      setNewOptionValue('');
      
      // Regenerate variants
      setTimeout(() => handleGenerateVariants(), 100);
    } catch (err) {
      console.error("Error adding option value:", err);
      alert("Error adding option value. Please try again.");
    }
  };

  // Remove an option value
  const handleRemoveOptionValue = (valueIndex: number) => {
    try {
      const removedValue = optionValues[valueIndex];
      
      // Remove the value
      const updatedValues = optionValues.filter((_, i) => i !== valueIndex);
      
      // Create a deep copy to prevent reference issues
      const updatedOption = JSON.parse(JSON.stringify(currentOption));
      
      if (isColorOpt) {
        // Also remove hex value for color options
        if (updatedOption.colorHexValues && updatedOption.colorHexValues[removedValue]) {
          delete updatedOption.colorHexValues[removedValue];
        }
        updatedOption.optionValues = updatedValues;
      } else {
        updatedOption.optionValues = updatedValues;
      }
      
      updateOption(optionIndex, updatedOption);
      
      // Regenerate variants
      setTimeout(() => handleGenerateVariants(), 100);
    } catch (err) {
      console.error("Error removing option value:", err);
      alert("Error removing option value. Please try again.");
    }
  };

  // Save color for a color option value
  const handleSaveColor = (colorName: string, hexValue: string) => {
    try {
      // Create a deep copy to prevent reference issues
      const updatedOption = JSON.parse(JSON.stringify(currentOption));
      
      // Ensure colorHexValues exists
      if (!updatedOption.colorHexValues) updatedOption.colorHexValues = {};
      
      // Update hex values
      updatedOption.colorHexValues[colorName] = hexValue;
      
      // Update the option in the form with the new hex values
      updateOption(optionIndex, updatedOption);
      
      // Exit edit mode
      setActiveColorEdit(null);
    } catch (err) {
      console.error("Error saving color:", err);
      alert("Error saving color. Please try again.");
    }
  };
  
  // Updated add option value UI with color picker on the right
  const ColorOptionInput = () => (
    <div className="flex items-center gap-2 mb-5">
      <Input
        defaultValue={newOptionValue}
        placeholder="Enter a color name..."
        className="flex-1 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // Get the current value directly from the input element
            setNewOptionValue(e.currentTarget.value);
            handleAddOptionValue();
          }
        }}
        // Add onBlur to capture the value when the input loses focus
        onBlur={(e) => {
          setNewOptionValue(e.currentTarget.value);
        }}
      />
      
      <div className="flex-shrink-0">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              type="button" 
              variant="outline" 
              className="w-10 h-10 p-0 border-2 border-gray-300 rounded-full"
              style={{ backgroundColor: tempHexValue }}
            >
              <span className="sr-only">Pick color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-3 w-52">
            <HexColorPicker 
              color={tempHexValue} 
              onChange={setTempHexValue}
              className="w-full" 
            />
            <div className="flex items-center gap-2 mt-2">
              <Input 
                value={tempHexValue}
                onChange={(e) => setTempHexValue(e.target.value)}
                className="flex-1 h-8 text-sm"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <Button 
        type="button" 
        onClick={handleAddOptionValue}
        className="bg-[#e65100] hover:bg-[#d84315] text-white"
      >
        <IconCirclePlus size={18} className="mr-1.5" /> Add
      </Button>
    </div>
  );

  const RegularOptionInput = () => (
    <div className="flex items-center gap-2 mb-5">
      <Input
        defaultValue={newOptionValue}
        onBlur={(e) => setNewOptionValue(e.target.value)}
        placeholder="Enter a new value..."
        className="flex-1 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            setNewOptionValue(e.currentTarget.value);
            handleAddOptionValue();
          }
        }}
      />
      <Button 
        type="button" 
        onClick={handleAddOptionValue}
        className="bg-[#e65100] hover:bg-[#d84315] text-white"
      >
        <IconCirclePlus size={18} className="mr-1.5" /> Add
      </Button>
    </div>
  );
  
  // Update image association
  const handleImageAssociationChange = (checked: boolean) => {
    setShowImageAssociation(checked);
    
    try {
      // Create a properly initialized Option object
      const flatOption: Option = {
        id: currentOption.id,
        title: currentOption.title,
        optionValues: [...currentOption.optionValues],
        imageAssociation: checked
      };
      
      // For color options, preserve color hex values
      if (isColorOpt && currentOption.colorHexValues) {
        flatOption.colorHexValues = { ...currentOption.colorHexValues };
      }
      
      // Update with the flat structure
      updateOption(optionIndex, flatOption);
      
      console.log("Updated image association to:", checked);
    } catch (err) {
      console.error("Error updating option imageAssociation:", err);
      setShowImageAssociation(!checked);
      alert("Error updating image association. Please try again.");
    }
  };
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">
          {isColorOpt ? 'Color Options' : 'Option values'}
        </h4>
        {isColorOpt && (
          <span className="text-xs text-gray-500">Add colors with hex values</span>
        )}
      </div>
      
      {/* Add new option value input - UPDATED FOR COLOR PICKER ON RIGHT */}
      {isColorOpt ? <ColorOptionInput /> : <RegularOptionInput />}
      
      {/* Display option values - CONSISTENT UI FOR ALL OPTIONS */}
      {optionValues.length > 0 ? (
        <div className="flex flex-wrap gap-3 mb-4">
          {optionValues.map((value: string, valueIndex: number) => (
            <div key={valueIndex} className="relative">
              {isColorOpt ? (
                // Color option value display
                <Popover open={activeColorEdit === value} onOpenChange={(open) => {
                  if (open) {
                    setActiveColorEdit(value);
                    setTempHexValue(colorHexValues[value] || '#000000');
                  } else {
                    setActiveColorEdit(null);
                  }
                }}>
                  <PopoverTrigger asChild>
                    <div className="relative cursor-pointer group">
                      <div 
                        className="w-10 h-10 transition-all border-2 border-gray-200 rounded-full shadow-sm hover:shadow-md"
                        style={{ backgroundColor: colorHexValues[value] || '#000000' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="flex items-center justify-center w-5 h-5 bg-white rounded-full shadow-sm">
                          <IconEdit size={12} />
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveOptionValue(valueIndex);
                        }}
                        className="absolute -top-1.5 -right-1.5 bg-white text-red-500 rounded-full w-4 h-4 flex items-center justify-center shadow-sm hover:bg-red-50"
                      >
                        <IconX size={12} />
                      </button>
                      <span className="block text-xs text-center mt-1.5 whitespace-nowrap overflow-hidden truncate text-ellipsis max-w-[60px]">{value}</span>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-3 w-52">
                    <div className="space-y-3">
                      <div className="text-sm font-medium">{value}</div>
                      <HexColorPicker 
                        color={tempHexValue} 
                        onChange={setTempHexValue}
                        className="w-full" 
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <Input 
                          value={tempHexValue}
                          onChange={(e) => setTempHexValue(e.target.value)}
                          className="flex-1 h-8 text-sm"
                        />
                        <Button 
                          size="sm"
                          onClick={() => handleSaveColor(value, tempHexValue)}
                          className="h-8 text-white bg-green-500 hover:bg-green-600"
                        >
                          <IconCheck size={14} />
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                // Non-color option value display as pills
                <span 
                  className="flex items-center px-3 py-1.5 text-sm bg-orange-100 text-[#d84315] rounded-full"
                >
                  {value}
                  <button
                    type="button"
                    onClick={() => handleRemoveOptionValue(valueIndex)}
                    className="ml-1.5 text-[#d84315] hover:text-red-700"
                  >
                    <IconX size={14} />
                  </button>
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 mb-2 text-center border border-orange-200 rounded-md bg-orange-50">
          <p className="text-sm text-gray-600">
            No {isColorOpt ? 'colors' : 'values'} added yet. 
            Add {isColorOpt ? 'colors' : 'values'} to create product variants.
          </p>
        </div>
      )}
      
      {/* Only show image association checkbox when we have at least one option value */}
      {optionValues.length > 0 && (
        <div className="flex items-center p-3 mt-4 space-x-2 border border-gray-200 rounded-md bg-gray-50">
          <Checkbox
            id={`image-association-${optionIndex}`}
            checked={showImageAssociation}
            onCheckedChange={(checked) => {
              // Cast to boolean - otherwise it might be "indeterminate"
              handleImageAssociationChange(Boolean(checked));
            }}
            className="text-[#e65100]"
          />
          <label 
            htmlFor={`image-association-${optionIndex}`} 
            className="text-sm text-gray-700 cursor-pointer"
          >
            Associate images with these {isColorOpt ? 'color' : 'option'} values
          </label>
        </div>
      )}
      
      {/* Show a help message when image association is enabled */}
      {showImageAssociation && (
        <div className="p-2 mt-2 text-xs text-orange-700 border border-orange-200 rounded-md bg-orange-50">
          <IconInfoCircle size={14} className="inline-block mr-1" />
          Image association enabled. Now you can upload separate images for each {isColorOpt ? 'color' : 'option value'}.
        </div>
      )}
    </div>
  );
};

// Non-color option selector component
export const NonColorButtonSelector = ({ 
  option, 
  selectedValue, 
  setSelectedOptionValues, 
  countImagesForOptionValue 
}: {
  option: Option;
  selectedValue: string;
  setSelectedOptionValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  countImagesForOptionValue: (optionName: string, value: string) => number;
}) => {
  return (
    <div className="space-y-3">
      {/* Simple buttons instead of complex dropdown */}
      <div className="flex flex-wrap gap-2">
        {option.optionValues && option.optionValues.map((value: string, index: number) => {
          const isActive = selectedValue === value;
          const imageCount = countImagesForOptionValue(option.title, value);
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                console.log(`Selecting ${option.title}: ${value}`);
                setSelectedOptionValues(prev => ({
                  ...prev,
                  [option.title]: value
                }));
              }}
              className={`px-3 py-1 rounded-md text-sm ${
                isActive 
                  ? 'bg-orange-100 text-[#e65100] border border-orange-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              {value}
              {imageCount > 0 && (
                <span className="ml-1 text-[#e65100]">({imageCount})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};