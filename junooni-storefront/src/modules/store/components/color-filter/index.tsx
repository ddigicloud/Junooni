"use client"

import ColorSelector from "@modules/store/components/color-selector"
import { useMemo } from "react"

type ColorFilterProps = {
  selectedColors: string[]
  collection?: any[] // Array of products
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
        // Extract colors from metadata
        Object.entries(product.metadata).forEach(([key, value]) => {
          if (key.startsWith("Color_")) {
            const colorName = key.replace("Color_", "").toLowerCase();
            const colorValue = String(value);
            
            // Format label with capitalized first letter
            const label = colorName.charAt(0).toUpperCase() + colorName.slice(1);
            
            // Add to map (this automatically handles duplicates)
            colorMap.set(colorName, {
              value: colorName,
              label: label,
              color: colorValue
            });
          }
        });
      }
    });

    // Convert map to array for component consumption
    return Array.from(colorMap.values());
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