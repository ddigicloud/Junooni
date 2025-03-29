'use client'

import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Heart, Bell, Filter, ChevronRight, Star, TrendingUp, Users, Award, Music, Palette, Video, Camera, MessageCircle, X } from 'lucide-react';
import { followerList } from '@lib/data/customer';
import { assets } from '@assets/assets';
import Image from 'next/image';

const CreatorDiscoveryPage =  () => {
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [customerVendors, setCustomerVendors] = useState([]);

  
  useEffect(()=>{
    const fetchData = async ()=>{
        const customerFollowers = await followerList();
        const newList = customerFollowers.follow?.creators
        setCustomerVendors(newList)
    }
    fetchData()
  },[])
  

  console.log(customerVendors)

  const avatarImage = assets.rabit;
  const CoverImage = assets.wishlistBanner;


  // Sample data for followed creators
  const followedCreators = [
    {
      id: 'creator-1',
      name: 'Alex Rivera',
      handle: '@alexcreates',
      avatar: avatarImage,
      category: 'Music',
      isOnline: true,
      isVerified: true,
      stats: {
        followers: '1.2M',
        products: 24
      },
      description: 'Electronic music producer & visual artist. Creator of the Neon Dreams album.',
      recentActivity: 'Released a new limited edition vinyl set',
      bannerImage: CoverImage,
      favorite: true
    },
    {
      id: 'creator-2',
      name: 'Maya Johnson',
      handle: '@mayacreates',
      avatar: avatarImage,
      category: 'Visual Art',
      isOnline: true,
      isVerified: true,
      stats: {
        followers: '850K',
        products: 36
      },
      description: 'Digital artist bringing vibrant worlds to life through illustration and animation.',
      recentActivity: 'Launched a new art print collection',
      bannerImage: CoverImage,
      favorite: false
    },
    {
      id: 'creator-3',
      name: 'DJ Cosmos',
      handle: '@djcosmos',
      avatar: avatarImage,
      category: 'Music',
      isOnline: false,
      isVerified: true,
      stats: {
        followers: '2.4M',
        products: 18
      },
      description: 'International DJ and producer known for genre-bending electronic music.',
      recentActivity: 'Announced upcoming merchandise drop',
      bannerImage: CoverImage,
      favorite: true
    },
    {
      id: 'creator-4',
      name: 'Sarah Styles',
      handle: '@sarahstyles',
      avatar: avatarImage,
      category: 'Fashion',
      isOnline: false,
      isVerified: true,
      stats: {
        followers: '1.8M',
        products: 42
      },
      description: 'Fashion designer and style influencer creating sustainable streetwear collections.',
      recentActivity: 'Restocked popular hoodie designs',
      bannerImage: CoverImage,
      favorite: false
    },
    {
      id: 'creator-5',
      name: 'Tech Tom',
      handle: '@techtom',
      avatar: avatarImage,
      category: 'Technology',
      isOnline: true,
      isVerified: true,
      stats: {
        followers: '925K',
        products: 15
      },
      description: 'Tech reviewer and gadget designer specializing in custom peripherals.',
      recentActivity: 'Launched limited edition mechanical keyboards',
      bannerImage: CoverImage,
      favorite: false
    }
  ];
  
  // Sample recommended creators
  const trendingCreators = [
    {
      id: 'trending-1',
      name: 'Emma Beats',
      handle: '@emmabeats',
      avatar: avatarImage,
      category: 'Music',
      followers: '3.4M',
      isVerified: true,
      description: 'Hip hop producer and songwriter with a unique blend of electronic and traditional sounds.',
      popularProduct: 'Studio Sessions Bundle',
      bannerImage: CoverImage,
      match: 92
    },
    {
      id: 'trending-2',
      name: 'Pixel Pete',
      handle: '@pixelpete',
      avatar: avatarImage,
      category: 'Visual Art',
      followers: '1.1M',
      isVerified: true,
      description: 'Digital artist specializing in pixel art and retro-inspired game aesthetics.',
      popularProduct: 'Limited Edition Art Prints',
      bannerImage: CoverImage,
      match: 88
    },
    {
      id: 'trending-3',
      name: 'Lucia Lens',
      handle: '@lucialens',
      avatar: avatarImage,
      category: 'Photography',
      followers: '750K',
      isVerified: true,
      description: 'Travel photographer capturing breathtaking landscapes and cultural moments.',
      popularProduct: 'Photography Collection Book',
      bannerImage: CoverImage,
      match: 85
    },
    {
      id: 'trending-4',
      name: 'Script Master',
      handle: '@scriptmaster',
      avatar: avatarImage,
      category: 'Writing',
      followers: '620K',
      isVerified: false,
      description: 'Author and screenwriter known for compelling character-driven stories.',
      popularProduct: 'Signed Book Collection',
      bannerImage: CoverImage,
      match: 79
    }
  ];
  
  const risingCreators = [
    {
      id: 'rising-1',
      name: 'Nova Sounds',
      handle: '@novasounds',
      avatar: avatarImage,
      category: 'Music',
      followers: '245K',
      growth: '+127% this month',
      description: 'Ambient music composer creating immersive soundscapes.',
      bannerImage: CoverImage
    },
    {
      id: 'rising-2',
      name: 'Sketch Daily',
      handle: '@sketchdaily',
      avatar: avatarImage,
      category: 'Visual Art',
      followers: '180K',
      growth: '+94% this month',
      description: 'Traditional artist sharing daily sketches and art tutorials.',
      bannerImage: CoverImage
    },
    {
      id: 'rising-3',
      name: 'Culinary Creations',
      handle: '@culinarycreations',
      avatar: avatarImage,
      category: 'Food',
      followers: '320K',
      growth: '+86% this month',
      description: 'Chef and food stylist sharing unique recipes and kitchen essentials.',
      bannerImage: CoverImage
    },
    {
      id: 'rising-4',
      name: 'Street Flow',
      handle: '@streetflow',
      avatar: avatarImage,
      category: 'Fashion',
      followers: '210K',
      growth: '+78% this month',
      description: 'Urban fashion designer with a focus on sustainable streetwear.',
      bannerImage: CoverImage
    }
  ];
  
  const exclusiveCreators = [
    {
      id: 'exclusive-1',
      name: 'Melody Craft',
      handle: '@melodycraft',
      avatar: avatarImage,
      category: 'Music',
      followers: '1.7M',
      description: 'Singer-songwriter with Junooni-exclusive merchandise and limited vinyl releases.',
      bannerImage: CoverImage
    },
    {
      id: 'exclusive-2',
      name: 'Digital Dreams',
      handle: '@digitaldreams',
      avatar: avatarImage,
      category: 'Digital Art',
      followers: '890K',
      description: 'Digital artist creating exclusive NFT collections and limited prints.',
      bannerImage: CoverImage
    },
    {
      id: 'exclusive-3',
      name: 'Thread Master',
      handle: '@threadmaster',
      avatar: avatarImage,
      category: 'Fashion',
      followers: '1.2M',
      description: 'Clothing designer with platform-exclusive collections and custom pieces.',
      bannerImage: CoverImage
    },
    {
      id: 'exclusive-4',
      name: 'Beat Sculptor',
      handle: '@beatsculptor',
      avatar: avatarImage,
      category: 'Music Production',
      followers: '950K',
      description: 'Music producer offering exclusive sample packs and production tutorials.',
      bannerImage: CoverImage
    }
  ];
  
  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Categories', icon: <Users size={18} /> },
    { id: 'music', name: 'Music', icon: <Music size={18} /> },
    { id: 'art', name: 'Visual Art', icon: <Palette size={18} /> },
    { id: 'video', name: 'Video Content', icon: <Video size={18} /> },
    { id: 'photo', name: 'Photography', icon: <Camera size={18} /> },
    { id: 'writing', name: 'Writing', icon: <MessageCircle size={18} /> }
  ];
  
  // Filter followed creators based on search and category
  // const filteredFollowedCreators = followedCreators.filter(creator => {
  //   const matchesSearch = creator.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
  //                        creator.handle.toLowerCase().includes(searchQuery.toLowerCase());
    
  //   const matchesCategory = activeCategory === 'all' || 
  //                          creator.category.toLowerCase() === activeCategory.toLowerCase();
    
  //   return matchesSearch && matchesCategory;
  // });
  
  // Toggle creator favorite status
  const toggleFavorite = (creatorId) => {
    // This would update the actual data in a real implementation
    console.log(`Toggled favorite status for creator ${creatorId}`);
  };
  
  // Follow a creator
  const followCreator = (creatorId) => {
    // This would update the actual data in a real implementation
    console.log(`Following creator ${creatorId}`);
  };
  
  return (
    <div className="min-h-screen mt-16 bg-gray-50">
      {/* Header with back button and title */}
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="container px-4 py-3 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <a href="/dashboard" className="p-2 mr-3 rounded-full hover:bg-gray-100">
                <ArrowLeft size={20} />
              </a>
              <h1 className="text-xl font-bold">Creators</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                className="relative p-2 rounded-full hover:bg-gray-100"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              >
                <Filter size={20} />
              </button>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search creators..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#e65100] focus:border-transparent w-40 md:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={18} />
                {searchQuery && (
                  <button 
                    className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-500"
                    onClick={() => setSearchQuery('')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Filters panel - conditionally shown */}
      {isFiltersOpen && (
        <div className="bg-white border-t border-b shadow-sm">
          <div className="container px-4 py-4 mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Filter Creators</h3>
              <button 
                className="text-sm text-[#e65100] hover:underline"
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    activeCategory === category.id
                      ? 'bg-[#e65100] text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className="mr-1.5">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <main className="container px-4 py-6 mx-auto">
        {/* Followed Creators Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Followed Creators</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">
                {followedCreators.length}
              </span>
              
              <div className="relative group">
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 text-sm flex items-center">
                  <Filter size={16} className="mr-1" />
                  Sort
                </button>
                <div className="absolute right-0 z-10 invisible w-40 py-1 mt-1 bg-white rounded-md shadow-lg group-hover:visible">
                  <button className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100">Recently Active</button>
                  <button className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100">Alphabetical (A-Z)</button>
                  <button className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100">Favorites First</button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Followed Creators Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* {filteredFollowedCreators.map(creator => (
              <div 
                key={creator.id} 
                className="overflow-hidden transition bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
              >
                <div className="relative h-24 bg-gray-200">
                  <Image 
                    src={creator.bannerImage} 
                    alt={`${creator.name} banner`} 
                    className="object-cover w-full h-full"
                  />
                  <button 
                    className={`absolute top-3 right-3 p-2 rounded-full ${
                      creator.favorite 
                        ? 'bg-white text-[#e65100]' 
                        : 'bg-white/70 text-gray-600 hover:bg-white hover:text-[#e65100]'
                    }`}
                    onClick={() => toggleFavorite(creator.id)}
                  >
                    <Heart size={18} fill={creator.favorite ? '#e65100' : 'none'} />
                  </button>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="relative mr-4 -mt-12">
                      <div className="w-16 h-16 overflow-hidden bg-white border-2 border-white rounded-full">
                        <Image 
                          src={creator.avatar} 
                          alt={creator.name} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        creator.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    
                    <div className="flex-grow mt-1">
                      <div className="flex items-center">
                        <h3 className="font-bold">{creator.name}</h3>
                        {creator.isVerified && (
                          <span className="ml-1 text-[#e65100]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{creator.handle}</div>
                    </div>
                    
                    <button className="px-4 py-1.5 border border-[#e65100] text-[#e65100] rounded-full text-sm hover:bg-[#e65100] hover:text-white transition">
                      Following
                    </button>
                  </div>
                  
                  <p className="mt-3 mb-3 text-sm text-gray-600 line-clamp-2">{creator.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4">
                      <div className="text-gray-600">
                        <span className="font-semibold text-gray-900">{creator.stats.followers}</span> followers
                      </div>
                      <div className="text-gray-600">
                        <span className="font-semibold text-gray-900">{creator.stats.products}</span> products
                      </div>
                    </div>
                    <div className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                      {creator.category}
                    </div>
                  </div>
                  
                  <div className="pt-3 mt-4 text-sm border-t">
                    <div className="text-[#e65100] font-medium">Recent Activity:</div>
                    <p className="text-gray-600">{creator.recentActivity}</p>
                  </div>
                </div>
              </div>
            ))} */}

             {customerVendors.map(creator => (
              <div 
                key={creator.id} 
                className="overflow-hidden transition bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
              >
                <div className="relative h-24 bg-gray-200">
                  <Image 
                    src={creator.vendor.coverphoto} 
                    alt={`${creator.vendor.handle} banner`} 
                    className="object-cover w-full h-full"
                    width={100}
                          height={100}
                  />
                  <button 
                    className={`absolute top-3 right-3 p-2 rounded-full 
                         bg-white text-[#e65100]
                         bg-white/70  hover:bg-white hover:text-[#e65100]
                    }`}
                    
                  >
                    
                  </button>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="relative mr-4 -mt-12">
                      <div className="w-16 h-16 overflow-hidden bg-white border-2 border-white rounded-full">
                        <Image 
                          src={creator.vendor.logo} 
                          alt={creator.vendor.handle} 
                          className="object-cover w-full h-full"
                          width={100}
                          height={100}
                        />
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                         bg-green-500 
                      `}></div>
                    </div>
                    
                    <div className="flex-grow mt-1">
                      <div className="flex items-center">
                        <h3 className="font-bold">{creator.vendor.name}</h3>
                        
                          <span className="ml-1 text-[#e65100]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        
                      </div>
                      <div className="text-sm text-gray-600">@{creator.vendor.name}</div>
                    </div>
                    
                    <button className="px-4 py-1.5 border border-[#e65100] text-[#e65100] rounded-full text-sm hover:bg-[#e65100] hover:text-white transition">
                      Following
                    </button>
                  </div>
                  
                  <p className="mt-3 mb-3 text-sm text-gray-600 line-clamp-2">{creator.vendor.creator_bio}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4">
                      {/* <div className="text-gray-600">
                        <span className="font-semibold text-gray-900">{creator.stats.followers}</span> followers
                      </div>
                      <div className="text-gray-600">
                        <span className="font-semibold text-gray-900">{creator.stats.products}</span> products
                      </div> */}
                    </div>
                    <div className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                      {creator.vendor.creator_title}
                    </div>
                  </div>
                  
                  <div className="pt-3 mt-4 text-sm border-t">
                    <div className="text-[#e65100] font-medium">Recent Activity:</div>
                    <p className="text-gray-600">{creator.recentActivity}</p>
                  </div>
                </div>
              </div>
            ))} 
          </div>
          
          {/* {filteredFollowedCreators.length === 0 && (
            <div className="p-8 text-center bg-white rounded-lg shadow-sm">
              <div className="mb-4 text-gray-400">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium">No creators found</h3>
              <p className="mb-4 text-gray-600">Try adjusting your filters or search criteria.</p>
              <button 
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="text-[#e65100] font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )} */}


        </section>
        
        {/* Recommended Creators Section */}
        <section className="mb-10">
          <h2 className="mb-6 text-2xl font-bold">Recommended for You</h2>
          
          {/* Because You Follow */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center text-lg font-semibold">
                <Star size={18} className="text-[#e65100] mr-2" />
                Because You Follow
              </h3>
              <a href="#" className="text-sm text-[#e65100] hover:underline flex items-center">
                View All
                <ChevronRight size={16} className="ml-1" />
              </a>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {trendingCreators.map(creator => (
                <div 
                  key={creator.id} 
                  className="overflow-hidden transition bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
                >
                  <div className="relative h-32 bg-gray-200">
                    <Image 
                      src={creator.bannerImage} 
                      alt={`${creator.name} banner`} 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute px-2 py-1 text-xs text-white rounded-full top-3 right-3 bg-black/70 backdrop-blur-sm">
                      {creator.match}% Match
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 mr-3 overflow-hidden rounded-full">
                        <Image 
                          src={creator.avatar} 
                          alt={creator.name} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-semibold">{creator.name}</h3>
                          {creator.isVerified && (
                            <span className="ml-1 text-[#e65100]">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{creator.category}</span>
                          <span className="mx-1">•</span>
                          <span>{creator.followers} followers</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="mt-3 mb-3 text-sm text-gray-600 line-clamp-2">{creator.description}</p>
                    
                    <div className="mb-3 text-xs text-gray-600">
                      <span className="font-medium">Popular:</span> {creator.popularProduct}
                    </div>
                    
                    <button 
                      className="w-full py-2 bg-[#e65100] text-white rounded-md text-sm font-medium hover:bg-[#d84315] transition"
                      onClick={() => followCreator(creator.id)}
                    >
                      Follow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Rising Stars */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center text-lg font-semibold">
                <TrendingUp size={18} className="text-[#e65100] mr-2" />
                Rising Stars
              </h3>
              <a href="#" className="text-sm text-[#e65100] hover:underline flex items-center">
                View All
                <ChevronRight size={16} className="ml-1" />
              </a>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {risingCreators.map(creator => (
                <div 
                  key={creator.id} 
                  className="overflow-hidden transition bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
                >
                  <div className="relative h-32 bg-gray-200">
                    <Image 
                      src={creator.bannerImage} 
                      alt={`${creator.name} banner`} 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute px-2 py-1 text-xs text-white bg-green-500 rounded-full top-3 right-3">
                      {creator.growth}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 mr-3 overflow-hidden rounded-full">
                        <Image 
                          src={creator.avatar} 
                          alt={creator.name} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">{creator.name}</h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{creator.category}</span>
                          <span className="mx-1">•</span>
                          <span>{creator.followers} followers</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="mt-3 mb-4 text-sm text-gray-600 line-clamp-2">{creator.description}</p>
                    
                    <button 
                      className="w-full py-2 bg-[#e65100] text-white rounded-md text-sm font-medium hover:bg-[#d84315] transition"
                      onClick={() => followCreator(creator.id)}
                    >
                      Follow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Exclusive to Junooni */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center text-lg font-semibold">
                <Award size={18} className="text-[#e65100] mr-2" />
                Exclusive to Junooni
              </h3>
              <a href="#" className="text-sm text-[#e65100] hover:underline flex items-center">
                View All
                <ChevronRight size={16} className="ml-1" />
              </a>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {exclusiveCreators.map(creator => (
                <div 
                  key={creator.id} 
                  className="overflow-hidden transition bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
                >
                  <div className="relative h-32 bg-gray-200">
                    <Image 
                      src={creator.bannerImage} 
                      alt={`${creator.name} banner`} 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 bg-[#e65100] text-white text-xs px-2 py-1 rounded-full">
                      Junooni Exclusive
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 mr-3 overflow-hidden rounded-full">
                        <Image 
                          src={creator.avatar} 
                          alt={creator.name} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">{creator.name}</h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{creator.category}</span>
                          <span className="mx-1">•</span>
                          <span>{creator.followers} followers</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="mt-3 mb-4 text-sm text-gray-600 line-clamp-2">{creator.description}</p>
                    
                    <button 
                      className="w-full py-2 bg-[#e65100] text-white rounded-md text-sm font-medium hover:bg-[#d84315] transition"
                      onClick={() => followCreator(creator.id)}
                    >
                      Follow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Browse by Category */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Browse by Category</h2>
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.slice(1).map(category => (
              <a 
                key={category.id}
                href={`#${category.id}`}
                className="flex flex-col items-center p-6 overflow-hidden text-center transition bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
              >
                <div className="w-16 h-16 rounded-full bg-[#e65100]/10 flex items-center justify-center mb-4 text-[#e65100]">
                  {category.icon}
                </div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="mt-1 text-sm text-gray-500">120+ creators</p>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CreatorDiscoveryPage;