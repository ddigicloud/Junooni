'use client'
import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, Heart, Menu, X, ChevronRight,
         ArrowRight, ChevronDown, ChevronUp, Filter, SlidersHorizontal,
         Check, Grid, List, Star } from 'lucide-react';


const CategoryPage = () => {
  // State management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    categories: [],
    creators: [],
    colors: [],
    price: [0, 200],
  });
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortOption, setSortOption] = useState('featured');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [expandedFilterSections, setExpandedFilterSections] = useState({
    categories: true,
    creators: true,
    colors: true,
    price: true
  });
 
  // Sample data
  const categoryData = {
    title: "Apparel",
    description: "Authentic apparel designed by your favorite creators. Limited edition shirts, hoodies, and more.",
    totalItems: 156,
    filters: {
      categories: [
        { id: 'tshirts', name: 'T-Shirts', count: 48 },
        { id: 'hoodies', name: 'Hoodies & Sweatshirts', count: 36 },
        { id: 'jackets', name: 'Jackets', count: 12 },
        { id: 'hats', name: 'Hats & Accessories', count: 24 },
        { id: 'limited', name: 'Limited Edition', count: 36 }
      ],
      creators: [
        { id: 'creator1', name: 'Alex Rivera', count: 24, image: '/api/placeholder/40/40' },
        { id: 'creator2', name: 'Jamie Chen', count: 18, image: '/api/placeholder/40/40' },
        { id: 'creator3', name: 'Taylor North', count: 15, image: '/api/placeholder/40/40' },
        { id: 'creator4', name: 'Sam Lopez', count: 12, image: '/api/placeholder/40/40' },
        { id: 'creator5', name: 'Jordan Blake', count: 10, image: '/api/placeholder/40/40' },
      ],
      colors: [
        { id: 'black', name: 'Black', hex: '#000000', count: 42 },
        { id: 'white', name: 'White', hex: '#FFFFFF', count: 38 },
        { id: 'gray', name: 'Gray', hex: '#808080', count: 24 },
        { id: 'blue', name: 'Blue', hex: '#0000FF', count: 18 },
        { id: 'red', name: 'Red', hex: '#FF0000', count: 14 },
        { id: 'green', name: 'Green', hex: '#008000', count: 10 },
        { id: 'purple', name: 'Purple', hex: '#800080', count: 8 },
      ]
    },
    products: [
      {
        id: 'product1',
        name: 'Limited Edition Tour Tee',
        creator: 'Alex Rivera',
        verified: true,
        price: 59.99,
        comparePrice: 79.99,
        discount: 25,
        isNew: true,
        isLimited: true,
        image: '/api/placeholder/500/650',
        colors: ['black', 'white'],
        rating: 4.8,
        reviewCount: 86,
        stockPercentage: 25
      },
      {
        id: 'product2',
        name: 'Signature Hoodie',
        creator: 'Jamie Chen',
        verified: true,
        price: 89.99,
        isLimited: false,
        image: '/api/placeholder/500/650',
        colors: ['black', 'gray'],
        rating: 4.6,
        reviewCount: 42
      },
      {
        id: 'product3',
        name: 'Artist Series Tee',
        creator: 'Taylor North',
        verified: true,
        price: 49.99,
        isNew: true,
        image: '/api/placeholder/500/650',
        colors: ['white', 'blue', 'red'],
        rating: 4.7,
        reviewCount: 38
      },
      {
        id: 'product4',
        name: 'Vintage Inspired Cap',
        creator: 'Sam Lopez',
        verified: true,
        price: 34.99,
        image: '/api/placeholder/500/650',
        colors: ['black', 'blue'],
        rating: 4.5,
        reviewCount: 24
      },
      {
        id: 'product5',
        name: 'Exclusive Zip Jacket',
        creator: 'Jordan Blake',
        verified: true,
        price: 129.99,
        isLimited: true,
        image: '/api/placeholder/500/650',
        colors: ['black', 'green'],
        rating: 4.9,
        reviewCount: 56,
        stockPercentage: 10
      },
      {
        id: 'product6',
        name: 'Graphic Print Tee',
        creator: 'Alex Rivera',
        verified: true,
        price: 44.99,
        image: '/api/placeholder/500/650',
        colors: ['white', 'gray'],
        rating: 4.4,
        reviewCount: 32
      },
      {
        id: 'product7',
        name: 'Embroidered Crewneck',
        creator: 'Jamie Chen',
        verified: true,
        price: 79.99,
        isNew: true,
        image: '/api/placeholder/500/650',
        colors: ['purple', 'black'],
        rating: 4.7,
        reviewCount: 28
      },
      {
        id: 'product8',
        name: 'Limited Collab Hoodie',
        creator: 'Taylor North',
        verified: true,
        price: 99.99,
        comparePrice: 129.99,
        discount: 23,
        isLimited: true,
        image: '/api/placeholder/500/650',
        colors: ['black', 'red'],
        rating: 4.8,
        reviewCount: 64,
        stockPercentage: 15
      },
    ]
  };
 
  // Toggle filter sections
  const toggleFilterSection = (section) => {
    setExpandedFilterSections({
      ...expandedFilterSections,
      [section]: !expandedFilterSections[section]
    });
  };
 
  // Handle filter changes
  const toggleCategoryFilter = (categoryId) => {
    setActiveFilters(prev => {
      if (prev.categories.includes(categoryId)) {
        return {...prev, categories: prev.categories.filter(id => id !== categoryId)};
      } else {
        return {...prev, categories: [...prev.categories, categoryId]};
      }
    });
  };
 
  const toggleCreatorFilter = (creatorId) => {
    setActiveFilters(prev => {
      if (prev.creators.includes(creatorId)) {
        return {...prev, creators: prev.creators.filter(id => id !== creatorId)};
      } else {
        return {...prev, creators: [...prev.creators, creatorId]};
      }
    });
  };
 
  const toggleColorFilter = (colorId) => {
    setActiveFilters(prev => {
      if (prev.colors.includes(colorId)) {
        return {...prev, colors: prev.colors.filter(id => id !== colorId)};
      } else {
        return {...prev, colors: [...prev.colors, colorId]};
      }
    });
  };
 
  const handlePriceChange = (values) => {
    setPriceRange(values);
    setActiveFilters(prev => ({...prev, price: values}));
  };
 
  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({
      categories: [],
      creators: [],
      colors: [],
      price: [0, 200],
    });
    setPriceRange([0, 200]);
  };


  // Format currency
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };
 
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        {/* Announcement Bar */}
        <div className="bg-black text-white py-2 px-4 text-center text-sm font-medium">
          Limited edition drops from your favorite creators • Exclusive to Junooni
        </div>
       
        {/* Main Header */}
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
         
          {/* Logo */}
          <div className="flex-shrink-0 text-2xl font-bold tracking-tight">
            JUNOONI
          </div>
         
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8 text-gray-700">
            <a href="#" className="font-medium hover:text-black transition">Creators</a>
            <a href="#" className="font-medium hover:text-black transition">Apparel</a>
            <a href="#" className="font-medium hover:text-black transition">Collectibles</a>
            <a href="#" className="font-medium hover:text-black transition">Limited Drops</a>
            <a href="#" className="font-medium hover:text-black transition">Exclusives</a>
          </nav>
         
          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search size={22} />
            </button>
            <a href="#" className="hidden md:block">
              <Heart size={22} />
            </a>
            <a href="#">
              <User size={22} />
            </a>
            <a href="#" className="relative">
              <ShoppingCart size={22} />
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span>
            </a>
          </div>
        </div>
       
        {/* Search Bar (Toggle) */}
        {isSearchOpen && (
          <div className="border-t py-3 px-4 bg-white">
            <div className="container mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for creators or merchandise..."
                  className="w-full py-2 px-4 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>
          </div>
        )}
       
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t fixed inset-0 bg-white z-50 pt-16">
            <div className="container mx-auto px-4 py-4">
              <button
                className="absolute top-4 right-4"
                onClick={() => setIsMenuOpen(false)}
              >
                <X size={24} />
              </button>
             
              <nav className="flex flex-col space-y-6 text-lg">
                <a href="#" className="flex justify-between items-center py-2 border-b">
                  Creators <ChevronRight size={20} />
                </a>
                <a href="#" className="flex justify-between items-center py-2 border-b">
                  Apparel <ChevronRight size={20} />
                </a>
                <a href="#" className="flex justify-between items-center py-2 border-b">
                  Collectibles <ChevronRight size={20} />
                </a>
                <a href="#" className="flex justify-between items-center py-2 border-b">
                  Limited Drops <ChevronRight size={20} />
                </a>
                <a href="#" className="flex justify-between items-center py-2 border-b">
                  Exclusives <ChevronRight size={20} />
                </a>
              </nav>
            </div>
          </div>
        )}
      </header>
     
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600">
          <a href="#" className="hover:text-[#e65100]">Home</a> /
          <span className="text-gray-900 ml-1">{categoryData.title}</span>
        </div>
       
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{categoryData.title}</h1>
          <p className="text-gray-600 mb-0">{categoryData.description}</p>
        </div>
       
        {/* Mobile Filters Toggle */}
        <div className="lg:hidden mb-4">
          <button
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-6 rounded-md font-medium"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          >
            <Filter size={18} />
            Filters & Sort
          </button>
        </div>
       
        {/* Mobile Filters (Slide-in panel) */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
            <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl flex flex-col h-full">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-bold text-lg">Filters</h2>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-2"
                >
                  <X size={20} />
                </button>
              </div>
             
              <div className="flex-grow overflow-y-auto p-4">
                {/* Filters content here - same as desktop but styled for mobile */}
                {/* Categories */}
                <div className="mb-6">
                  <button
                    className="flex justify-between items-center w-full mb-3"
                    onClick={() => toggleFilterSection('categories')}
                  >
                    <h3 className="font-medium text-lg">Categories</h3>
                    {expandedFilterSections.categories ?
                      <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                 
                  {expandedFilterSections.categories && (
                    <div className="space-y-2">
                      {categoryData.filters.categories.map(category => (
                        <label key={category.id} className="flex items-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 mr-2"
                            checked={activeFilters.categories.includes(category.id)}
                            onChange={() => toggleCategoryFilter(category.id)}
                          />
                          <span>{category.name}</span>
                          <span className="ml-1 text-gray-500 text-sm">({category.count})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
               
                {/* Creators */}
                <div className="mb-6">
                  <button
                    className="flex justify-between items-center w-full mb-3"
                    onClick={() => toggleFilterSection('creators')}
                  >
                    <h3 className="font-medium text-lg">Creators</h3>
                    {expandedFilterSections.creators ?
                      <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                 
                  {expandedFilterSections.creators && (
                    <div className="space-y-2">
                      {categoryData.filters.creators.map(creator => (
                        <label key={creator.id} className="flex items-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 mr-2"
                            checked={activeFilters.creators.includes(creator.id)}
                            onChange={() => toggleCreatorFilter(creator.id)}
                          />
                          <img
                            src={creator.image}
                            alt={creator.name}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span>{creator.name}</span>
                          <span className="ml-1 text-gray-500 text-sm">({creator.count})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
               
                {/* Colors */}
                <div className="mb-6">
                  <button
                    className="flex justify-between items-center w-full mb-3"
                    onClick={() => toggleFilterSection('colors')}
                  >
                    <h3 className="font-medium text-lg">Colors</h3>
                    {expandedFilterSections.colors ?
                      <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                 
                  {expandedFilterSections.colors && (
                    <div className="flex flex-wrap gap-3">
                      {categoryData.filters.colors.map(color => (
                        <button
                          key={color.id}
                          className={`
                            w-9 h-9 rounded-full flex items-center justify-center
                            ${color.hex === '#FFFFFF' ? 'border border-gray-300' : ''}
                            ${activeFilters.colors.includes(color.id) ? 'ring-2 ring-[#e65100] ring-offset-2' : ''}
                          `}
                          style={{ backgroundColor: color.hex }}
                          onClick={() => toggleColorFilter(color.id)}
                          title={`${color.name} (${color.count})`}
                        >
                          {activeFilters.colors.includes(color.id) && (
                            <Check size={16} color={['white', '#FFFFFF'].includes(color.hex) ? 'black' : 'white'} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
               
                {/* Price Range */}
                <div className="mb-6">
                  <button
                    className="flex justify-between items-center w-full mb-3"
                    onClick={() => toggleFilterSection('price')}
                  >
                    <h3 className="font-medium text-lg">Price Range</h3>
                    {expandedFilterSections.price ?
                      <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                 
                  {expandedFilterSections.price && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={priceRange[0]}
                        onChange={(e) => handlePriceChange([parseInt(e.target.value), priceRange[1]])}
                        className="w-full mb-4"
                      />
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceChange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
             
              <div className="p-4 border-t flex gap-2">
                <button
                  className="flex-1 py-2 border border-gray-300 rounded-md"
                  onClick={clearAllFilters}
                >
                  Clear All
                </button>
                <button
                  className="flex-1 py-2 bg-black text-white rounded-md"
                  onClick={() => setIsMobileFiltersOpen(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
       
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-xl">Filters</h2>
                {(activeFilters.categories.length > 0 ||
                  activeFilters.creators.length > 0 ||
                  activeFilters.colors.length > 0 ||
                  priceRange[0] > 0 ||
                  priceRange[1] < 200) && (
                    <button
                      className="text-sm text-[#e65100] hover:underline"
                      onClick={clearAllFilters}
                    >
                      Clear All
                    </button>
                )}
              </div>
             
              {/* Categories */}
              <div className="mb-6">
                <button
                  className="flex justify-between items-center w-full mb-3"
                  onClick={() => toggleFilterSection('categories')}
                >
                  <h3 className="font-medium">Categories</h3>
                  {expandedFilterSections.categories ?
                    <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
               
                {expandedFilterSections.categories && (
                  <div className="space-y-2">
                    {categoryData.filters.categories.map(category => (
                      <label key={category.id} className="flex items-center group cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 mr-2 accent-[#e65100]"
                          checked={activeFilters.categories.includes(category.id)}
                          onChange={() => toggleCategoryFilter(category.id)}
                        />
                        <span className="group-hover:text-[#e65100]">{category.name}</span>
                        <span className="ml-1 text-gray-500 text-sm">({category.count})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
             
              {/* Creators */}
              <div className="mb-6">
                <button
                  className="flex justify-between items-center w-full mb-3"
                  onClick={() => toggleFilterSection('creators')}
                >
                  <h3 className="font-medium">Creators</h3>
                  {expandedFilterSections.creators ?
                    <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
               
                {expandedFilterSections.creators && (
                  <div className="space-y-2">
                    {categoryData.filters.creators.map(creator => (
                      <label key={creator.id} className="flex items-center group cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 mr-2 accent-[#e65100]"
                          checked={activeFilters.creators.includes(creator.id)}
                          onChange={() => toggleCreatorFilter(creator.id)}
                        />
                        <img
                          src={creator.image}
                          alt={creator.name}
                          className="w-5 h-5 rounded-full mr-2"
                        />
                        <span className="group-hover:text-[#e65100]">{creator.name}</span>
                        <span className="ml-1 text-gray-500 text-sm">({creator.count})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
             
              {/* Colors */}
              <div className="mb-6">
                <button
                  className="flex justify-between items-center w-full mb-3"
                  onClick={() => toggleFilterSection('colors')}
                >
                  <h3 className="font-medium">Colors</h3>
                  {expandedFilterSections.colors ?
                    <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
               
                {expandedFilterSections.colors && (
                  <div className="flex flex-wrap gap-2">
                    {categoryData.filters.colors.map(color => (
                      <button
                        key={color.id}
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          ${color.hex === '#FFFFFF' ? 'border border-gray-300' : ''}
                          ${activeFilters.colors.includes(color.id) ? 'ring-2 ring-[#e65100] ring-offset-1' : ''}
                        `}
                        style={{ backgroundColor: color.hex }}
                        onClick={() => toggleColorFilter(color.id)}
                        title={`${color.name} (${color.count})`}
                      >
                        {activeFilters.colors.includes(color.id) && (
                          <Check size={14} color={['white', '#FFFFFF'].includes(color.hex) ? 'black' : 'white'} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
             
              {/* Price Range */}
              <div className="mb-6">
                <button
                  className="flex justify-between items-center w-full mb-3"
                  onClick={() => toggleFilterSection('price')}
                >
                  <h3 className="font-medium">Price Range</h3>
                  {expandedFilterSections.price ?
                    <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
               
                {expandedFilterSections.price && (
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceChange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full mb-4 accent-[#e65100]"
                    />
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-[#e65100]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
         
          {/* Product Grid */}
          <div className="flex-grow">
            {/* Sort & View Options */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <p className="text-gray-600">
                Showing <span className="font-medium">{categoryData.products.length}</span> of <span className="font-medium">{categoryData.totalItems}</span> products
              </p>
             
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    className="appearance-none bg-white border border-gray-300 py-2 pl-4 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e65100] text-sm"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="best-selling">Best Selling</option>
                    <option value="top-rated">Top Rated</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 pointer-events-none text-gray-500" />
                </div>
               
                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                  <button
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>
           
            {/* Applied Filters */}
            {(activeFilters.categories.length > 0 ||
              activeFilters.creators.length > 0 ||
              activeFilters.colors.length > 0 ||
              priceRange[0] > 0 ||
              priceRange[1] < 200) && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Applied Filters:</h3>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.categories.map(catId => {
                      const category = categoryData.filters.categories.find(c => c.id === catId);
                      return (
                        <button
                          key={`cat-${catId}`}
                          className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                          onClick={() => toggleCategoryFilter(catId)}
                        >
                          {category?.name}
                          <X size={14} />
                        </button>
                      );
                    })}
                   
                    {activeFilters.creators.map(creatorId => {
                      const creator = categoryData.filters.creators.find(c => c.id === creatorId);
                      return (
                        <button
                          key={`creator-${creatorId}`}
                          className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                          onClick={() => toggleCreatorFilter(creatorId)}
                        >
                          {creator?.name}
                          <X size={14} />
                        </button>
                      );
                    })}
                   
                    {activeFilters.colors.map(colorId => {
                      const color = categoryData.filters.colors.find(c => c.id === colorId);
                      return (
                        <button
                          key={`color-${colorId}`}
                          className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                          onClick={() => toggleColorFilter(colorId)}
                        >
                          <span
                            className="w-3 h-3 rounded-full inline-block"
                            style={{ backgroundColor: color?.hex }}
                          ></span>
                          {color?.name}
                          <X size={14} />
                        </button>
                      );
                    })}
                   
                    {(priceRange[0] > 0 || priceRange[1] < 200) && (
                      <button
                        className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                        onClick={() => handlePriceChange([0, 200])}
                      >
                        ${priceRange[0]} - ${priceRange[1]}
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
           
            {/* Products */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {categoryData.products.map(product => (
                  <div key={product.id} className="group bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Product Image */}
                    <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                     
                      {/* Badges */}
                      <div className="absolute left-3 top-3 flex flex-col gap-2">
                        {product.isNew && (
                          <span className="bg-black text-white text-xs px-2 py-1 rounded">
                            New
                          </span>
                        )}
                        {product.isLimited && (
                          <span className="bg-[#e65100] text-white text-xs px-2 py-1 rounded">
                            Limited Edition
                          </span>
                        )}
                      </div>
                     
                      {/* Quick actions */}
                      <button className="absolute right-3 top-3 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <Heart size={18} />
                      </button>
                     
                      {/* Add to cart */}
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-full bg-white text-black font-medium py-2 rounded-md hover:bg-gray-100 transition">
                          Add to Cart
                        </button>
                      </div>
                     
                      {/* Stock indicator */}
                      {product.stockPercentage && (
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-gray-300">
                          <div
                            className="h-full bg-[#e65100]"
                            style={{ width: `${product.stockPercentage}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                   
                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium mb-1 hover:text-[#e65100] transition">{product.name}</h3>
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <span className="mr-1">{product.creator}</span>
                            {product.verified && (
                              <span className="text-[#e65100]">
                                <Check size={14} />
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatPrice(product.price)}</div>
                          {product.comparePrice && (
                            <div className="text-sm">
                              <span className="text-gray-500 line-through">
                                {formatPrice(product.comparePrice)}
                              </span>
                              <span className="ml-1 text-red-600">-{product.discount}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                     
                      {/* Ratings */}
                      <div className="flex items-center mt-2">
                        <div className="flex text-yellow-400 mr-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                              size={14}
                              className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          ({product.reviewCount})
                        </span>
                      </div>
                     
                      {/* Color options */}
                      {product.colors && (
                        <div className="flex mt-2 gap-1">
                          {product.colors.map(colorId => {
                            const color = categoryData.filters.colors.find(c => c.id === colorId);
                            return color ? (
                              <div
                                key={`p-${product.id}-${colorId}`}
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              ></div>
                            ) : null;
                          })}
                          <span className="text-xs text-gray-500 ml-1">
                            {product.colors.length} {product.colors.length === 1 ? 'color' : 'colors'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List view
              <div className="space-y-4">
                {categoryData.products.map(product => (
                  <div key={product.id} className="flex bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Product Image */}
                    <div className="w-1/3 relative">
                      <div className="aspect-[3/4] h-full">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                     
                      {/* Badges */}
                      <div className="absolute left-3 top-3 flex flex-col gap-2">
                        {product.isNew && (
                          <span className="bg-black text-white text-xs px-2 py-1 rounded">
                            New
                          </span>
                        )}
                        {product.isLimited && (
                          <span className="bg-[#e65100] text-white text-xs px-2 py-1 rounded">
                            Limited Edition
                          </span>
                        )}
                      </div>
                     
                      {/* Stock indicator */}
                      {product.stockPercentage && (
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-gray-300">
                          <div
                            className="h-full bg-[#e65100]"
                            style={{ width: `${product.stockPercentage}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                   
                    {/* Product Info */}
                    <div className="w-2/3 p-4 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-lg hover:text-[#e65100] transition">{product.name}</h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-1">By {product.creator}</span>
                            {product.verified && (
                              <span className="text-[#e65100]">
                                <Check size={14} />
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-semibold">{formatPrice(product.price)}</div>
                          {product.comparePrice && (
                            <div>
                              <span className="text-gray-500 line-through">
                                {formatPrice(product.comparePrice)}
                              </span>
                              <span className="ml-1 text-red-600">-{product.discount}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                     
                      {/* Ratings */}
                      <div className="flex items-center mb-3">
                        <div className="flex text-yellow-400 mr-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                              size={16}
                              className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {product.rating} ({product.reviewCount} reviews)
                        </span>
                      </div>
                     
                      {/* Color options */}
                      {product.colors && (
                        <div className="flex items-center mb-3">
                          <span className="text-sm mr-2">Colors:</span>
                          <div className="flex gap-1">
                            {product.colors.map(colorId => {
                              const color = categoryData.filters.colors.find(c => c.id === colorId);
                              return color ? (
                                <div
                                  key={`p-${product.id}-${colorId}`}
                                  className="w-5 h-5 rounded-full border border-gray-300"
                                  style={{ backgroundColor: color.hex }}
                                  title={color.name}
                                ></div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                     
                      {/* Product may have more details in list view */}
                      {product.stockPercentage && (
                        <p className="text-sm text-red-600 mb-3">
                          Low stock - only {product.stockPercentage}% left
                        </p>
                      )}
                     
                      {/* Actions - pushes to bottom with flex-grow */}
                      <div className="flex gap-2 mt-auto">
                        <button className="flex-grow bg-[#e65100] text-white px-6 py-2 rounded-md font-medium hover:bg-[#d84315] transition flex items-center justify-center">
                          <ShoppingCart size={16} className="mr-2" />
                          Add to Cart
                        </button>
                        <button className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center text-gray-700 hover:border-[#e65100] hover:text-[#e65100] transition">
                          <Heart size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
           
            {/* Pagination */}
            <div className="mt-10 flex justify-center">
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button className="px-4 py-2 border-r border-gray-300 hover:bg-gray-100">
                  Previous
                </button>
                <button className="px-4 py-2 bg-[#e65100] text-white hover:bg-[#d84315]">
                  1
                </button>
                <button className="px-4 py-2 border-r border-l border-gray-300 hover:bg-gray-100">
                  2
                </button>
                <button className="px-4 py-2 border-r border-gray-300 hover:bg-gray-100">
                  3
                </button>
                <button className="px-4 py-2 hover:bg-gray-100">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
     
      {/* Footer - simplified for this example */}
      <footer className="bg-gray-100 pt-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div>
              <h3 className="text-lg font-bold mb-4">JUNOONI</h3>
              <p className="text-gray-600 mb-6">
                The premiere marketplace for authentic creator merchandise.
              </p>
              <div className="flex space-x-4">
                {/* Social icons would go here */}
              </div>
            </div>
           
            <div>
              <h3 className="text-lg font-bold mb-4">Shop</h3>
              <ul className="space-y-3 text-gray-600">
                <li><a href="#" className="hover:text-black transition">All Creators</a></li>
                <li><a href="#" className="hover:text-black transition">Apparel</a></li>
                <li><a href="#" className="hover:text-black transition">Collectibles</a></li>
                <li><a href="#" className="hover:text-black transition">Limited Drops</a></li>
                <li><a href="#" className="hover:text-black transition">Gift Cards</a></li>
              </ul>
            </div>
           
            <div>
              <h3 className="text-lg font-bold mb-4">Help</h3>
              <ul className="space-y-3 text-gray-600">
                <li><a href="#" className="hover:text-black transition">My Orders</a></li>
                <li><a href="#" className="hover:text-black transition">Shipping & Returns</a></li>
                <li><a href="#" className="hover:text-black transition">FAQs</a></li>
                <li><a href="#" className="hover:text-black transition">Contact Support</a></li>
                <li><a href="#" className="hover:text-black transition">Authenticity Guarantee</a></li>
              </ul>
            </div>
           
            <div>
              <h3 className="text-lg font-bold mb-4">Junooni</h3>
              <ul className="space-y-3 text-gray-600">
                <li><a href="#" className="hover:text-black transition">About Us</a></li>
                <li><a href="#" className="hover:text-black transition">For Creators</a></li>
                <li><a href="#" className="hover:text-black transition">Careers</a></li>
                <li><a href="#" className="hover:text-black transition">Press</a></li>
                <li><a href="#" className="hover:text-black transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-black transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
         
          <div className="border-t border-gray-200 py-8">
            <p className="text-gray-500 text-sm text-center">
              © 2025 Junooni. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};


export default CategoryPage;

