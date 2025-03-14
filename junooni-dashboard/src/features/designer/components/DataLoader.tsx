import React, { useState, useEffect } from 'react';
import DynamicTShirtDesigner from './Canvas';

// Type definitions for PayloadCMS API response - these match the ones in the designer component
interface ProductColor {
  id: string;
  colorName: string;
  colorHex: string;
}

interface ProductSize {
  id: string;
  sizeName: string;
  sizeDescription: string;
}

interface CustomizableArea {
  id: string;
  areaName: string;
  photos: Array<{
    id: string;
    photo: {
      id: number;
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    photoColor: string;
    customizableWidth: number;
    customizableHeight: number;
    x: number;
    y: number;
  }>;
}

interface MockupPhoto {
  id: string;
  title: string | null;
  photo: {
    id: number;
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  skew: number;
  scale: number;
  photoColor: string;
}

interface PrintingTechnology {
  id: string;
  technologyName: string;
  customizationAreas: CustomizableArea[];
  mockupPhotos: MockupPhoto[];
}

interface ProductData {
  id: number;
  name: string;
  sku: string;
  brand: string;
  cost: number;
  colorOptions: ProductColor[];
  sizeOptions: ProductSize[];
  printingTechnologies: PrintingTechnology[];
  displayImages: Array<{
    id: string;
    title: string;
    image: {
      id: number;
      url: string;
      alt: string;
    };
    caption: string;
  }>;
}

interface ProductDataLoaderProps {
  productId: string | number; // Required product ID to load
}

const ProductDataLoader: React.FC<ProductDataLoaderProps> = ({ productId }) => {
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to append base URL to relative image paths
    const processImageUrls = (data: any): ProductData => {
      const baseUrl = 'http://localhost:3000';
      
      // Helper function to process image URLs in nested objects
      const processUrl = (obj: any) => {
        if (!obj) return obj;
        
        // Create a new object to avoid mutating the original
        const newObj = { ...obj };
        
        // Process url property if it exists and starts with /
        if (newObj.url && typeof newObj.url === 'string' && newObj.url.startsWith('/')) {
          newObj.url = `${baseUrl}${newObj.url}`;
        }
        
        return newObj;
      };
      
      // Deep clone the data to avoid mutation
      const processedData = JSON.parse(JSON.stringify(data));
      
      // Process color options (no images here, just included for completeness)
      if (processedData.colorOptions) {
        processedData.colorOptions = processedData.colorOptions.map((color: any) => ({ ...color }));
      }
      
      // Process size options (no images here, just included for completeness)
      if (processedData.sizeOptions) {
        processedData.sizeOptions = processedData.sizeOptions.map((size: any) => ({ ...size }));
      }
      
      // Process displayImages
      if (processedData.displayImages) {
        processedData.displayImages = processedData.displayImages.map((item: any) => ({
          ...item,
          image: processUrl(item.image)
        }));
      }
      
      // Process printing technologies
      if (processedData.printingTechnologies) {
        processedData.printingTechnologies = processedData.printingTechnologies.map((tech: any) => {
          const newTech = { ...tech };
          
          // Process customizationAreas
          if (newTech.customizationAreas) {
            newTech.customizationAreas = newTech.customizationAreas.map((area: any) => {
              const newArea = { ...area };
              
              // Process photos in each area
              if (newArea.photos) {
                newArea.photos = newArea.photos.map((photo: any) => ({
                  ...photo,
                  photo: processUrl(photo.photo)
                }));
              }
              
              return newArea;
            });
          }
          
          // Process mockupPhotos
          if (newTech.mockupPhotos) {
            newTech.mockupPhotos = newTech.mockupPhotos.map((photo: any) => ({
              ...photo,
              photo: processUrl(photo.photo)
            }));
          }
          
          return newTech;
        });
      }
      
      return processedData as ProductData;
    };

    // Function to fetch product data from the API
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from the PayloadCMS API endpoint
        const response = await fetch(`http://localhost:3000/api/blank-products/4`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch product data: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process all image URLs to add the base URL
        const processedData = processImageUrls(data);
        
        setProductData(processedData);
        setLoading(false);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
        console.error('Error fetching product data:', err);
      }
    };

    fetchProductData();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-lg">Loading product data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center text-red-600 p-6 bg-red-50 rounded-lg max-w-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold mt-4">Error Loading Product</h2>
          <p className="mt-2">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center text-yellow-600 p-6 bg-yellow-50 rounded-lg max-w-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold mt-4">No Product Data</h2>
          <p className="mt-2">No product data was found. Please try again or contact support.</p>
        </div>
      </div>
    );
  }

  // If we have product data, render the designer
  return <DynamicTShirtDesigner productData={productData} />;
};

export default ProductDataLoader;