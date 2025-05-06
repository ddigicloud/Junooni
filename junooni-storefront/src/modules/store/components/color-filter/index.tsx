"use client"

import ColorSelector from "@modules/store/components/color-selector"
import { useMemo } from "react"
import { HttpTypes } from "@medusajs/types"

type ColorFilterProps = {
  selectedColors: string[]
  collection?: HttpTypes.StoreProduct[] // Array of products
  setQueryParams: (name: string, value: string) => void
  "data-testid"?: string
}

const ColorFilter = ({
  selectedColors,
  collection = [],
  setQueryParams,
  "data-testid": dataTestId,
}: ColorFilterProps) => {
  // Extract dynamic colors from product metadata
  const colorOptions = useMemo(() => {
    // If collection is not an array or is empty, return empty array
    if (!Array.isArray(collection) || collection.length === 0) {
      return [];
    }
    
    // Use Map to ensure uniqueness of colors
    const colorMap = new Map();
    
    // Process each product in the collection
    collection.forEach(product => {
      if (product.metadata) {
        // First, try to parse color_hex_values JSON
        if (product.metadata.color_hex_values) {
          try {
            const parsedColors = JSON.parse(product.metadata.color_hex_values);
            if (Array.isArray(parsedColors)) {
              parsedColors.forEach(color => {
                if (color && color.name && color.hex) {
                  colorMap.set(color.name.toLowerCase(), {
                    value: color.name.toLowerCase(),
                    label: color.name.charAt(0).toUpperCase() + color.name.slice(1),
                    color: color.hex
                  });
                }
              });
            }
          } catch (e) {
            console.error('Failed to parse color_hex_values:', e);
          }
        }
        
    
      }
      
      // Check product variant options for color info
      if (product.options) {
        const colorOptions = product.options.filter(option => 
          option.title.toLowerCase() === "color"
        );
        
        colorOptions.forEach(option => {
          if (option.values) {
            option.values.forEach(value => {
              if (value.value) {
                const colorName = value.value.toLowerCase();
                colorMap.set(colorName, {
                  value: colorName,
                  label: value.value, // Use original value for label
                  color: "#000000" // Default color if not specified
                });
              }
            });
          }
        });
      }
    });
    
    // Convert map to array for component consumption and sort alphabetically
    return Array.from(colorMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [collection]);

  const handleChange = (values: string[]) => {
    if (values.length > 0) {
      // Join multiple selected colors with comma
      setQueryParams("colors", values.join(","));
    } else {
      // If no colors selected, remove the parameter
      setQueryParams("colors", "");
    }
  };

  // Only render the color selector if there are color options available
  if (colorOptions.length === 0) {
    return null;
  }

  return (
    <ColorSelector
      title="Colors"
      items={colorOptions}
      values={selectedColors}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  );
};

export default ColorFilter;