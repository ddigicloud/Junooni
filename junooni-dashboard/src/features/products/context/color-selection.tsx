// SimplifiedColorManager.tsx
import React, { useState } from 'react';
import { IconCirclePlus, IconX, IconEdit, IconCheck } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HexColorPicker } from 'react-colorful';

interface Option {
  id: string;
  title: string;
  optionValues: string[];
  colorHexValues?: Record<string, string>;
  [key: string]: any;
}

interface SimplifiedColorManagerProps {
  optionIndex: number;
  currentOption: Option;
  updateOption: (index: number, value: Option) => void;
  handleGenerateVariants: () => void;
}

const SimplifiedColorManager: React.FC<SimplifiedColorManagerProps> = ({
  optionIndex,
  currentOption,
  updateOption,
  handleGenerateVariants
}) => {
  const [newColorValue, setNewColorValue] = useState<string>('');
  const [activeColorEdit, setActiveColorEdit] = useState<string | null>(null);
  const [tempHexValue, setTempHexValue] = useState<string>('');
  
  // Get color values from the option
  const colorValues = currentOption.optionValues || [];
  
  // Get color hex values from form state
  const [colorHexValues, setLocalColorHexValues] = useState<Record<string, string>>(
    currentOption.colorHexValues || {}
  );
  
  // Add a new color value
  const handleAddColorValue = () => {
    if (!newColorValue || newColorValue.trim() === '') return;
    
    // Check if color already exists
    if (colorValues.includes(newColorValue)) {
      // Show an error or alert here
      alert('This color already exists');
      return;
    }
    
    // Get current option values and add the new value
    const updatedValues = [...colorValues, newColorValue];
    
    // Initialize the hex value for this color
    const updatedHexValues = {
      ...colorHexValues,
      [newColorValue]: '#000000' // Default black
    };
    
    // Update the option in the form
    updateOption(optionIndex, {
      ...currentOption,
      optionValues: updatedValues,
      colorHexValues: updatedHexValues
    });
    
    // Clear the input
    setNewColorValue('');
    
    // Regenerate variants
    setTimeout(() => handleGenerateVariants(), 100);
  };
  
  // Remove a color value
  const handleRemoveColorValue = (valueIndex: number) => {
    const removedValue = colorValues[valueIndex];
    
    // Remove the value at the specified index
    const updatedValues = colorValues.filter((_, i) => i !== valueIndex);
    
    // Remove the hex value for this color
    const updatedHexValues = { ...colorHexValues };
    delete updatedHexValues[removedValue];
    
    // Update the option in the form
    updateOption(optionIndex, {
      ...currentOption,
      optionValues: updatedValues,
      colorHexValues: updatedHexValues
    });
    
    // Regenerate variants
    setTimeout(() => handleGenerateVariants(), 100);
  };
  
  // Start editing a color's hex value
  const handleEditColor = (colorName: string) => {
    setActiveColorEdit(colorName);
    setTempHexValue(colorHexValues[colorName] || '#000000');
  };
  
  // Save the edited hex value
  const handleSaveColor = (colorName: string) => {
    // Update hex values
    const updatedHexValues = {
      ...colorHexValues,
      [colorName]: tempHexValue
    };
    
    setLocalColorHexValues(updatedHexValues);
    
    // Update the option in the form with the new hex values
    updateOption(optionIndex, {
      ...currentOption,
      colorHexValues: updatedHexValues
    });
    
    // Exit edit mode
    setActiveColorEdit(null);
  };

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Color Management</h4>
        <span className="text-xs text-gray-500">Add colors and set their hex values</span>
      </div>
      
      {/* Add new color input */}
      <div className="mb-5 flex items-center gap-2">
        <Input 
          value={newColorValue}
          onChange={(e) => setNewColorValue(e.target.value)}
          placeholder="Enter a color name..."
          className="flex-1 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddColorValue();
            }
          }}
        />
        <Button 
          type="button" 
          onClick={handleAddColorValue}
          className="bg-[#e65100] hover:bg-[#d84315] text-white"
        >
          <IconCirclePlus size={18} className="mr-1.5" /> Add
        </Button>
      </div>
      
      {/* Color circles display */}
      {colorValues.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {colorValues.map((colorName, valueIndex) => (
            <div 
              key={valueIndex}
              className="flex flex-col items-center p-3 border rounded-lg hover:shadow-sm transition-all"
            >
              <div 
                className="w-12 h-12 rounded-full border border-gray-300 mb-2 cursor-pointer"
                style={{ backgroundColor: colorHexValues[colorName] || '#000000' }}
                onClick={() => handleEditColor(colorName)}
              />
              
              <div className="text-center">
                <div className="font-medium text-gray-700 mb-1">{colorName}</div>
                
                {activeColorEdit === colorName ? (
                  <div className="space-y-3 pt-2">
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
                        type="button"
                        size="sm"
                        onClick={() => handleSaveColor(colorName)}
                        className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <IconCheck size={16} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">{colorHexValues[colorName] || '#000000'}</div>
                )}
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveColorValue(valueIndex)}
                  className="mt-2 text-red-500 hover:bg-red-50 text-xs"
                >
                  <IconX size={14} className="mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 mb-2 text-center bg-orange-50 border border-orange-200 rounded-md">
          <p className="text-sm text-gray-600">
            No colors added yet. Add colors to help customers choose variants.
          </p>
        </div>
      )}
    </div>
  );
};

export default SimplifiedColorManager;