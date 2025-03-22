'use client'

import React, { useState, useEffect } from 'react';

// Define TypeScript interfaces
interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  imageUrl: string;
}

const WishlistPage: React.FC = () => {
  // Sample wishlist data
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: '1',
      name: 'Yellow Wireless Headphone',
      price: 125.00,
      originalPrice: 160.00,
      category: 'Electronics',
      imageUrl: '/api/placeholder/150/150',
    },
    {
      id: '2',
      name: 'New Dress D Nice Elegant',
      price: 125.00,
      originalPrice: 160.00,
      category: 'Women Clothing',
      imageUrl: '/api/placeholder/150/150',
    },
    {
      id: '3',
      name: 'New Fashion D Nice Elegant',
      price: 125.00,
      originalPrice: 160.00,
      category: 'Men Clothing',
      imageUrl: '/api/placeholder/150/150',
    }
  ]);

  // Remove item from wishlist
  const handleRemoveItem = (id: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  // Clear entire wishlist
  const handleClearWishlist = () => {
    setWishlistItems([]);
  };

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price).replace('$', '');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header and navigation would go here */}
      
      {/* Breadcrumbs */}
      <div className="max-w-6xl px-4 py-4 mx-auto text-sm text-gray-500">
        <span>Home</span>
        <span className="mx-2">/</span>
        <span className="font-medium">Wishlist</span>
      </div>
      
      {/* Main content */}
      <div className="max-w-6xl px-4 py-8 mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-center">Wishlist</h1>
        
        {wishlistItems.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">Your wishlist is empty.</p>
          </div>
        ) : (
          <>
            {/* Wishlist items */}
            <div className="space-y-4">
              {wishlistItems.map((item) => (
                <div key={item.id} className="flex items-center p-6 border border-gray-200 rounded">
                  {/* Product image */}
                  <div className="flex-shrink-0 w-32 h-32">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  
                  {/* Product details */}
                  <div className="flex-grow ml-6">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                    <div className="mt-2">
                      <span className="font-medium text-red-500">${formatPrice(item.price)}</span>
                      <span className="ml-2 text-gray-400 line-through">${formatPrice(item.originalPrice)}</span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex space-x-2">
                    <button
                      className="px-4 py-2 text-white bg-orange-500 rounded hover:bg-orange-600"
                      onClick={() => alert(`Added ${item.name} to cart`)}
                    >
                      ADD TO CART
                    </button>
                    <button
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                      onClick={() => alert(`Viewing ${item.name}`)}
                    >
                      VIEW
                    </button>
                    <button
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Bottom actions */}
            <div className="flex items-center justify-between p-4 mt-8 bg-gray-100">
              <button
                className="flex items-center font-medium text-gray-700"
                onClick={() => alert('Continue shopping')}
              >
                <span className="mr-2">←</span>
                <span>CONTINUE SHOPPING</span>
              </button>
              <button
                className="flex items-center font-medium text-gray-700"
                onClick={handleClearWishlist}
              >
                <span className="mr-2">🗑️</span>
                <span>CLEAR WISHLIST</span>
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Footer would go here */}
    </div>
  );
};

export default WishlistPage;