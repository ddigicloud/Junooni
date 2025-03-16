'use client'

import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, Heart, Menu, X, ChevronRight, ArrowRight, ChevronDown } from 'lucide-react';

// Main Homepage Component
const JunooniHomepage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
   
      
      <main className="flex-grow">
        {/* Hero Section with Featured Creator */}
        <section className="relative bg-gray-50">
          <div className="container flex flex-col items-center px-4 py-16 mx-auto md:py-24 md:flex-row">
            <div className="mb-10 md:w-1/2 md:mb-0 md:pr-10">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-black rounded-full">
                  EXCLUSIVE DROP
                </span>
              </div>
              <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Limited Edition Collection by <span className="text-[#e65100]">ArtistName</span>
              </h1>
              <p className="max-w-lg mb-8 text-xl text-gray-600">
                Exclusive merchandise designed by your favorite creator. Available for a limited time only.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="#" 
                  className="px-8 py-3 font-medium text-white transition bg-black rounded-md hover:bg-gray-800"
                >
                  Shop Collection
                </a>
                <a 
                  href="#" 
                  className="bg-[#e65100] text-white px-8 py-3 font-medium rounded-md hover:bg-[#d84315] transition"
                >
                  Meet Creator
                </a>
              </div>
            </div>
            <div className="relative md:w-1/2">
              <div className="bg-gray-200 rounded-lg overflow-hidden aspect-[3/4] w-full">
                <img 
                  src="/api/placeholder/800/1000" 
                  alt="Featured creator collection" 
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="absolute hidden p-4 bg-white rounded-lg shadow-lg -bottom-6 -left-6 md:block">
                <p className="font-semibold">Signed Editions</p>
                <p className="text-gray-500">Limited to 1000</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Creators Section */}
        <section className="py-16 bg-white">
          <div className="container px-4 mx-auto">
            <h2 className="mb-10 text-3xl font-bold text-center">Featured Creators</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((creator) => (
                <a href="#" key={creator} className="text-center group">
                  <div className="relative w-4/5 mx-auto mb-3 overflow-hidden bg-gray-100 rounded-full aspect-square">
                    <img 
                      src={`/api/placeholder/${200}/${200}`} 
                      alt={`Creator ${creator}`} 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black opacity-0 bg-opacity-20 group-hover:opacity-100">
                      <span className="px-4 py-2 text-xs font-medium text-white bg-black bg-opacity-50 rounded-full">
                        View Shop
                      </span>
                    </div>
                  </div>
                  <h3 className="font-medium text-md">Creator {creator}</h3>
                  <p className="text-sm text-gray-500">Musician</p>
                </a>
              ))}
            </div>
          </div>
        </section>
        
        {/* New Drops Section */}
        <section className="py-16 bg-gray-50">
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold">Latest Drops</h2>
              <a href="#" className="flex items-center font-medium text-black hover:underline">
                View all <ArrowRight size={16} className="ml-2" />
              </a>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {[1, 2, 3, 4].map((product) => (
                <div key={product} className="group">
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                    <img 
                      src={`/api/placeholder/${500}/${650}`} 
                      alt={`Product ${product}`} 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute flex flex-col gap-2 left-3 top-3">
                      <span className="px-2 py-1 text-xs text-white bg-black rounded">
                        New Drop
                      </span>
                      <span className="bg-[#e65100] text-white text-xs px-2 py-1 rounded">
                        Creator Name
                      </span>
                    </div>
                    <button className="absolute p-2 transition-opacity bg-white rounded-full shadow-md opacity-0 right-3 top-3 group-hover:opacity-100">
                      <Heart size={18} />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 p-4 transition-opacity opacity-0 bg-gradient-to-t from-black to-transparent group-hover:opacity-100">
                      <button className="w-full py-2 font-medium text-black transition bg-white rounded-md hover:bg-gray-100">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 text-lg font-medium">Limited Edition Tee</h3>
                      <p className="text-sm text-gray-500">By Creator Name</p>
                    </div>
                    <p className="font-semibold text-gray-900">$59.00</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Upcoming Drops Calendar */}
        <section className="py-16 bg-white">
          <div className="container px-4 mx-auto">
            <h2 className="mb-10 text-3xl font-bold text-center">Upcoming Drops</h2>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                { date: "Mar 20", creator: "Creator Name 1", type: "Limited Edition Apparel" },
                { date: "Mar 25", creator: "Creator Name 2", type: "Signed Collectibles" },
                { date: "Apr 02", creator: "Creator Name 3", type: "Exclusive Accessories" }
              ].map((drop, index) => (
                <div key={index} className="overflow-hidden transition duration-300 border rounded-lg group hover:shadow-lg">
                  <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
                    <div>
                      <p className="text-sm text-gray-500">Dropping on</p>
                      <p className="text-xl font-bold">{drop.date}</p>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 text-white bg-black rounded-full">
                      <span className="font-medium countdown-days">{15 - index * 5}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 mr-4 overflow-hidden bg-gray-200 rounded-full">
                        <img src={`/api/placeholder/${50}/${50}`} alt={drop.creator} className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{drop.creator}</h3>
                        <p className="text-sm text-gray-500">{drop.type}</p>
                      </div>
                    </div>
                    <button className="w-full py-2 mt-2 font-medium text-black transition bg-white border border-black rounded-md hover:bg-gray-50">
                      Set Reminder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="container px-4 mx-auto">
            <h2 className="mb-10 text-3xl font-bold text-center">Shop by Category</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {[
                { name: 'Apparel', icon: '👕' },
                { name: 'Collectibles', icon: '🏆' },
                { name: 'Digital Items', icon: '💿' },
                { name: 'Accessories', icon: '🧢' }
              ].map((category) => (
                <a href="#" key={category.name} className="overflow-hidden transition bg-white rounded-lg shadow-sm group hover:shadow-md">
                  <div className="flex items-center justify-center p-6 text-5xl bg-gray-100 aspect-square">
                    {category.icon}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-medium">{category.name}</h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
        
        {/* Featured Collection Banner */}
        <section className="py-16 bg-white">
          <div className="container px-4 mx-auto">
            <div className="relative overflow-hidden rounded-lg">
              <div className="md:aspect-[21/9] aspect-[3/4] bg-gray-800">
                <img 
                  src="/api/placeholder/1200/600" 
                  alt="Special collection" 
                  className="object-cover w-full h-full mix-blend-overlay opacity-80"
                />
              </div>
              <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16">
                <div className="max-w-lg">
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-[#e65100] text-white rounded-full mb-4">
                    EXCLUSIVE COLLABORATION
                  </span>
                  <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Creator x Creator Collection</h2>
                  <p className="mb-6 text-lg text-white">Two of your favorite creators team up for an unprecedented limited merchandise collection.</p>
                  <a 
                    href="#" 
                    className="inline-block px-8 py-3 font-medium text-black transition bg-white rounded-md hover:bg-gray-100"
                  >
                    Shop Collection
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Bestsellers Section */}
        <section className="py-16 bg-gray-50">
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold">Fan Favorites</h2>
              <a href="#" className="flex items-center font-medium text-black hover:underline">
                View all <ArrowRight size={16} className="ml-2" />
              </a>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {[1, 2, 3, 4].map((product) => (
                <div key={product} className="group">
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                    <img 
                      src={`/api/placeholder/${500}/${650}`} 
                      alt={`Product ${product}`} 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute right-3 top-3">
                      <span className="flex items-center px-2 py-1 text-xs text-white bg-red-500 rounded">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Almost Gone
                      </span>
                    </div>
                    <button className="absolute p-2 transition-opacity bg-white rounded-full shadow-md opacity-0 right-3 top-12 group-hover:opacity-100">
                      <Heart size={18} />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 p-4 transition-opacity opacity-0 bg-gradient-to-t from-black to-transparent group-hover:opacity-100">
                      <button className="w-full py-2 font-medium text-black transition bg-white rounded-md hover:bg-gray-100">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 text-lg font-medium">Bestseller Item {product}</h3>
                      <p className="text-sm text-gray-500">By Creator Name</p>
                    </div>
                    <p className="font-semibold text-gray-900">$49.00</p>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1 text-xs text-gray-500">(42)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Features/Benefits Section */}
        <section className="py-16 bg-white">
          <div className="container px-4 mx-auto">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                { 
                  title: 'Authentic Merchandise', 
                  description: 'Direct from creators, verified authenticity',
                  icon: (
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) 
                },
                { 
                  title: 'Limited Editions', 
                  description: 'Exclusive items in limited quantities',
                  icon: (
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) 
                },
                { 
                  title: 'Creator Support', 
                  description: 'Your purchase directly supports creators',
                  icon: (
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor" />
                    </svg>
                  ) 
                }
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-center p-6 text-center border rounded-lg">
                  <div className="mb-4 text-purple-600">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Creator Spotlight */}
        <section className="py-16 bg-purple-50">
          <div className="container px-4 mx-auto">
            <h2 className="mb-10 text-3xl font-bold text-center">Creator Spotlight</h2>
            
            <div className="flex flex-col items-center overflow-hidden bg-white shadow-lg md:flex-row rounded-xl">
              <div className="md:w-2/5">
                <div className="bg-gray-200 aspect-square">
                  <img 
                    src="/api/placeholder/600/600" 
                    alt="Creator spotlight" 
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <div className="p-6 md:w-3/5 md:p-10">
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-800 bg-purple-100 rounded-full">
                    FEATURED CREATOR
                  </span>
                </div>
                <h3 className="mb-4 text-2xl font-bold md:text-3xl">Creator Name</h3>
                <p className="mb-6 text-lg text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus.
                </p>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                    </svg>
                    <span className="text-gray-600">1.2M followers</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="text-gray-600">950K followers</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="p-3 text-center bg-gray-100 rounded-lg">
                      <img src={`/api/placeholder/${150}/${150}`} alt={`Item ${item}`} className="object-cover w-full mb-2 rounded aspect-square" />
                      <p className="text-sm font-medium">Item {item}</p>
                      <p className="text-xs text-gray-500">$49.00</p>
                    </div>
                  ))}
                </div>
                <a 
                  href="#" 
                  className="inline-block bg-[#e65100] text-white px-8 py-3 font-medium rounded-md hover:bg-[#d84315] transition"
                >
                  Shop Collection
                </a>
              </div>
            </div>
          </div>
        </section>
        
        {/* Fan Content Section */}
        <section className="py-16 bg-gray-50">
          <div className="container px-4 mx-auto">
            <h2 className="mb-4 text-3xl font-bold text-center">Fan Gallery</h2>
            <p className="max-w-xl mx-auto mb-10 text-center text-gray-600">
              See how other fans are styling their creator merchandise. Tag your photos with #Junooni to be featured.
            </p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
              {[1, 2, 3, 4, 5, 6].map((img) => (
                <a href="#" key={img} className="relative block overflow-hidden group aspect-square">
                  <img 
                    src={`/api/placeholder/${300}/${300}`} 
                    alt={`Fan content ${img}`} 
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black opacity-0 bg-opacity-30 group-hover:opacity-100">
                    <div className="text-center text-white">
                      <p className="font-medium">@username</p>
                      <div className="flex items-center justify-center mt-2">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                        </svg>
                        <span className="text-sm">256</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-8 text-center">
              <a href="#" className="inline-block text-[#e65100] font-medium hover:underline">
                View More Fan Content
              </a>
            </div>
          </div>
        </section>
        
        {/* Newsletter Section */}
        <section className="py-16 text-white bg-black">
          <div className="container px-4 mx-auto text-center">
            <h2 className="mb-4 text-3xl font-bold">Never Miss a Drop</h2>
            <p className="max-w-md mx-auto mb-8 text-gray-300">
              Subscribe to get notified about new creators, exclusive merchandise, and limited-time drops.
            </p>
            <form className="flex flex-col max-w-md gap-3 mx-auto md:flex-row">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e65100] text-white"
              />
              <button 
                type="submit" 
                className="px-6 py-3 font-medium text-white transition bg-purple-600 rounded-md hover:bg-purple-700"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      {/* <footer className="pt-16 bg-gray-100">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 gap-8 mb-16 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold">JUNOONI</h3>
              <p className="mb-6 text-gray-600">
                The premiere marketplace for authentic creator merchandise.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 transition hover:text-black">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-600 transition hover:text-black">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-600 transition hover:text-black">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-600 transition hover:text-black">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="mb-4 text-lg font-bold">Shop</h3>
              <ul className="space-y-3 text-gray-600">
                <li><a href="#" className="transition hover:text-black">All Creators</a></li>
                <li><a href="#" className="transition hover:text-black">Apparel</a></li>
                <li><a href="#" className="transition hover:text-black">Collectibles</a></li>
                <li><a href="#" className="transition hover:text-black">Limited Drops</a></li>
                <li><a href="#" className="transition hover:text-black">Gift Cards</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="mb-4 text-lg font-bold">Help</h3>
              <ul className="space-y-3 text-gray-600">
                <li><a href="#" className="transition hover:text-black">My Orders</a></li>
                <li><a href="#" className="transition hover:text-black">Shipping & Returns</a></li>
                <li><a href="#" className="transition hover:text-black">FAQs</a></li>
                <li><a href="#" className="transition hover:text-black">Contact Support</a></li>
                <li><a href="#" className="transition hover:text-black">Authenticity Guarantee</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="mb-4 text-lg font-bold">Junooni</h3>
              <ul className="space-y-3 text-gray-600">
                <li><a href="#" className="transition hover:text-black">About Us</a></li>
                <li><a href="#" className="transition hover:text-black">For Creators</a></li>
                <li><a href="#" className="transition hover:text-black">Careers</a></li>
                <li><a href="#" className="transition hover:text-black">Press</a></li>
                <li><a href="#" className="transition hover:text-black">Privacy Policy</a></li>
                <li><a href="#" className="transition hover:text-black">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="py-8 border-t border-gray-200">
            <div className="flex flex-col items-center justify-between md:flex-row">
              <p className="mb-4 text-sm text-gray-500 md:mb-0">
                © 2025 Junooni. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <img src="/api/placeholder/40/25" alt="Visa" className="h-6" />
                <img src="/api/placeholder/40/25" alt="Mastercard" className="h-6" />
                <img src="/api/placeholder/40/25" alt="American Express" className="h-6" />
                <img src="/api/placeholder/40/25" alt="PayPal" className="h-6" />
              </div>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default JunooniHomepage;