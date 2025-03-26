'use client'
import React, { useState } from 'react';
import { 
  Package, ShoppingBag, Heart, Bell, User, Settings, Gift, Calendar, ChevronRight, 
  ChevronDown, Search, Eye, Download, Star, MessageCircle, Share2, Clock, 
  CreditCard, LogOut, AlertCircle, Check, X, MapPin, Truck
} from 'lucide-react';

const CustomerDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [activeOrder, setActiveOrder] = useState(null);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  
  // Sample user data
  const user = {
    id: 'usr-12345',
    name: 'Jamie Smith',
    email: 'jamie.smith@example.com',
    avatar: '/api/placeholder/100/100',
    membershipTier: 'Gold Fan',
    joinDate: 'December 2023',
    points: 2450,
    following: [
      { id: 'cr-1', name: 'Alex Rivera', avatar: '/api/placeholder/50/50' },
      { id: 'cr-2', name: 'Maya Johnson', avatar: '/api/placeholder/50/50' },
      { id: 'cr-3', name: 'DJ Cosmos', avatar: '/api/placeholder/50/50' }
    ],
    addresses: [
      { 
        id: 'addr-1', 
        default: true,
        name: 'Jamie Smith',
        street: '123 Main Street',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'United States',
        phone: '(555) 123-4567'
      },
      { 
        id: 'addr-2', 
        default: false,
        name: 'Jamie Smith',
        street: '456 Work Avenue, Suite 7B',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'United States',
        phone: '(555) 987-6543'
      }
    ],
    paymentMethods: [
      {
        id: 'pm-1',
        default: true,
        type: 'visa',
        lastFour: '4242',
        expiryDate: '05/26'
      },
      {
        id: 'pm-2',
        default: false,
        type: 'mastercard',
        lastFour: '8790',
        expiryDate: '12/25'
      }
    ]
  };
  
  // Sample orders data
  const orders = [
    {
      id: 'ORD-9876',
      date: 'March 15, 2025',
      status: 'Out for Delivery',
      trackingNumber: '1Z999AA10123456784',
      carrier: 'UPS',
      total: 79.98,
      paymentMethod: 'Visa •••• 4242',
      items: [
        { 
          id: 'item-1', 
          name: 'Tour Graphic Tee', 
          creator: 'Alex Rivera', 
          price: 45.00, 
          quantity: 1,
          image: '/api/placeholder/100/100'
        },
        { 
          id: 'item-2', 
          name: 'Digital Album Download', 
          creator: 'Alex Rivera', 
          price: 14.99, 
          quantity: 1,
          image: '/api/placeholder/100/100'
        },
        { 
          id: 'item-3', 
          name: 'Exclusive Sticker Pack', 
          creator: 'Alex Rivera', 
          price: 9.99, 
          quantity: 2,
          image: '/api/placeholder/100/100'
        }
      ],
      shippingAddress: {
        name: 'Jamie Smith',
        street: '123 Main Street',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'United States'
      },
      timeline: [
        { date: 'March 15, 2025', status: 'Out for Delivery', time: '9:45 AM' },
        { date: 'March 14, 2025', status: 'Package Arrived at Local Facility', time: '10:32 PM' },
        { date: 'March 12, 2025', status: 'Package Shipped', time: '3:15 PM' },
        { date: 'March 11, 2025', status: 'Order Processed', time: '11:30 AM' },
        { date: 'March 10, 2025', status: 'Order Placed', time: '2:45 PM' }
      ]
    },
    {
      id: 'ORD-9875',
      date: 'February 28, 2025',
      status: 'Delivered',
      trackingNumber: '1Z999AA10123456650',
      carrier: 'UPS',
      total: 129.99,
      paymentMethod: 'Mastercard •••• 8790',
      items: [
        { 
          id: 'item-1', 
          name: 'Signed Vinyl Record', 
          creator: 'DJ Cosmos', 
          price: 59.99, 
          quantity: 1,
          image: '/api/placeholder/100/100'
        },
        { 
          id: 'item-2', 
          name: 'Limited Edition Hoodie', 
          creator: 'DJ Cosmos', 
          price: 70.00, 
          quantity: 1,
          image: '/api/placeholder/100/100'
        }
      ],
      shippingAddress: {
        name: 'Jamie Smith',
        street: '123 Main Street',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'United States'
      },
      timeline: [
        { date: 'March 3, 2025', status: 'Delivered', time: '2:20 PM' },
        { date: 'March 3, 2025', status: 'Out for Delivery', time: '8:30 AM' },
        { date: 'March 2, 2025', status: 'Package Arrived at Local Facility', time: '11:45 PM' },
        { date: 'March 1, 2025', status: 'Package in Transit', time: '5:23 PM' },
        { date: 'February 28, 2025', status: 'Package Shipped', time: '9:12 AM' },
        { date: 'February 28, 2025', status: 'Order Processed', time: '7:30 AM' },
        { date: 'February 27, 2025', status: 'Order Placed', time: '10:15 PM' }
      ]
    },
    {
      id: 'ORD-9738',
      date: 'January 15, 2025',
      status: 'Delivered',
      trackingNumber: '1Z999AA10123445784',
      carrier: 'USPS',
      total: 35.99,
      paymentMethod: 'Visa •••• 4242',
      items: [
        { 
          id: 'item-1', 
          name: 'Art Print (Signed)', 
          creator: 'Maya Johnson', 
          price: 35.99, 
          quantity: 1,
          image: '/api/placeholder/100/100'
        }
      ],
      shippingAddress: {
        name: 'Jamie Smith',
        street: '123 Main Street',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'United States'
      },
      timeline: [
        { date: 'January 20, 2025', status: 'Delivered', time: '3:45 PM' },
        { date: 'January 20, 2025', status: 'Out for Delivery', time: '9:12 AM' },
        { date: 'January 19, 2025', status: 'Package Arrived at Local Facility', time: '10:30 PM' },
        { date: 'January 17, 2025', status: 'Package in Transit', time: '2:45 PM' },
        { date: 'January 16, 2025', status: 'Package Shipped', time: '11:20 AM' },
        { date: 'January 16, 2025', status: 'Order Processed', time: '8:30 AM' },
        { date: 'January 15, 2025', status: 'Order Placed', time: '7:15 PM' }
      ]
    }
  ];
  
  // Sample notifications
  const notifications = [
    {
      id: 'notif-1',
      type: 'shipping',
      title: 'Your order is out for delivery',
      message: 'Order #ORD-9876 is out for delivery and should arrive today.',
      time: '2 hours ago',
      read: false
    },
    {
      id: 'notif-2',
      type: 'creator',
      title: 'New drop from Alex Rivera',
      message: 'Check out the new Summer Tour Collection just released!',
      time: '1 day ago',
      read: true
    },
    {
      id: 'notif-3',
      type: 'order',
      title: 'Order confirmed',
      message: 'Your order #ORD-9876 has been confirmed and is being processed.',
      time: '5 days ago',
      read: true
    },
    {
      id: 'notif-4',
      type: 'membership',
      title: 'You\'ve reached Gold Fan status!',
      message: 'Congratulations! You now have access to exclusive perks.',
      time: '2 weeks ago',
      read: true
    }
  ];
  
  // Sample wishlist items
  const wishlistItems = [
    {
      id: 'wl-1',
      name: 'Neon Dreams Vinyl Box Set',
      creator: 'Alex Rivera',
      price: 89.99,
      image: '/api/placeholder/300/300',
      inStock: true
    },
    {
      id: 'wl-2',
      name: 'Limited Edition Tour Jacket',
      creator: 'Maya Johnson',
      price: 129.99,
      image: '/api/placeholder/300/300',
      inStock: true
    },
    {
      id: 'wl-3',
      name: 'Signed Poster',
      creator: 'DJ Cosmos',
      price: 49.99,
      image: '/api/placeholder/300/300',
      inStock: false
    },
    {
      id: 'wl-4',
      name: 'VIP Meet & Greet Package',
      creator: 'Alex Rivera',
      price: 299.99,
      image: '/api/placeholder/300/300',
      inStock: true
    }
  ];
  
  // Upcoming events/drops for followed creators
  const upcomingEvents = [
    {
      id: 'ev-1',
      type: 'merch-drop',
      title: 'Summer Tour Collection',
      creator: 'Alex Rivera',
      date: 'April 15, 2025',
      countdown: 12
    },
    {
      id: 'ev-2',
      type: 'livestream',
      title: 'Studio Session + Q&A',
      creator: 'Maya Johnson',
      date: 'April 8, 2025',
      countdown: 5
    },
    {
      id: 'ev-3',
      type: 'merch-drop',
      title: 'Limited Edition Vinyls',
      creator: 'DJ Cosmos',
      date: 'April 20, 2025',
      countdown: 17
    }
  ];
  
  // Format currency
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered':
        return 'bg-green-500';
      case 'Out for Delivery':
        return 'bg-blue-500';
      case 'Package in Transit':
        return 'bg-purple-500';
      case 'Order Placed':
      case 'Order Processed':
      case 'Package Shipped':
      case 'Package Arrived at Local Facility':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Toggle order details
  const toggleOrderDetails = (orderId) => {
    if (activeOrder === orderId) {
      setActiveOrder(null);
    } else {
      setActiveOrder(orderId);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">
              junooni
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                >
                  <Bell size={20} />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-[#e65100] rounded-full"></span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotificationCenter && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Notifications</h3>
                        <button className="text-sm text-[#e65100] hover:underline">
                          Mark all as read
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="divide-y">
                          {notifications.map(notification => (
                            <div 
                              key={notification.id} 
                              className={`p-4 hover:bg-gray-50 ${notification.read ? '' : 'bg-orange-50'}`}
                            >
                              <div className="flex gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  notification.type === 'shipping' ? 'bg-blue-100 text-blue-500' :
                                  notification.type === 'creator' ? 'bg-purple-100 text-purple-500' :
                                  notification.type === 'order' ? 'bg-green-100 text-green-500' :
                                  'bg-yellow-100 text-yellow-500'
                                }`}>
                                  {notification.type === 'shipping' && <Truck size={18} />}
                                  {notification.type === 'creator' && <Star size={18} />}
                                  {notification.type === 'order' && <Package size={18} />}
                                  {notification.type === 'membership' && <Gift size={18} />}
                                </div>
                                
                                <div>
                                  <h4 className="font-medium text-sm">{notification.title}</h4>
                                  <p className="text-sm text-gray-600">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No notifications
                        </div>
                      )}
                    </div>
                    
                    <div className="p-2 border-t text-center">
                      <button className="text-sm text-[#e65100] hover:underline">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Menu */}
              <div className="flex items-center">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="ml-2 font-medium">{user.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-1/4 lg:w-1/5 bg-white rounded-lg shadow-sm p-4 h-fit">
            <div className="flex items-center gap-3 mb-6 p-2">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h2 className="font-semibold">{user.name}</h2>
                <div className="flex items-center">
                  <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                    {user.membershipTier}
                  </span>
                </div>
              </div>
            </div>
            
            <nav>
              <ul className="space-y-1">
                <li>
                  <button 
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                      activeTab === 'overview' ? 'bg-[#e65100] text-white' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <User size={18} />
                    <span>Dashboard</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                      activeTab === 'orders' ? 'bg-[#e65100] text-white' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('orders')}
                  >
                    <Package size={18} />
                    <span>My Orders</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                      activeTab === 'wishlist' ? 'bg-[#e65100] text-white' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('wishlist')}
                  >
                    <Heart size={18} />
                    <span>Wishlist</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                      activeTab === 'membership' ? 'bg-[#e65100] text-white' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('membership')}
                  >
                    <Star size={18} />
                    <span>Fan Membership</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                      activeTab === 'settings' ? 'bg-[#e65100] text-white' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings size={18} />
                    <span>Account Settings</span>
                  </button>
                </li>
              </ul>
              
              <div className="mt-6 pt-6 border-t">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </aside>
          
          {/* Main Content Area */}
          <main className="flex-grow">
            {/* Dashboard Overview */}
            {activeTab === 'overview' && (
              <div>
                {/* Welcome Banner */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name.split(' ')[0]}!</h1>
                  <p className="text-gray-600">
                    Here's what's happening with your orders and followed creators.
                  </p>
                </div>
                
                {/* Stats/Quick Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Recent Order</h3>
                      <button 
                        className="text-sm text-[#e65100] hover:underline"
                        onClick={() => setActiveTab('orders')}
                      >
                        View All
                      </button>
                    </div>
                    
                    {orders.length > 0 ? (
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Package size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{orders[0].id}</div>
                          <div className="text-sm text-gray-600 mb-1">{orders[0].date}</div>
                          <div className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${getStatusColor(orders[0].status)}`}></span>
                            <span className="text-sm">{orders[0].status}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">No orders yet</div>
                    )}
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Fan Rewards</h3>
                      <button 
                        className="text-sm text-[#e65100] hover:underline"
                        onClick={() => setActiveTab('membership')}
                      >
                        Details
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star size={24} className="text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium">{user.points} Points</div>
                        <div className="text-sm text-gray-600 mb-1">{user.membershipTier} Member</div>
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">50 points</span> until next reward
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Followed Creators</h3>
                      <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">{user.following.length}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {user.following.map(creator => (
                        <a key={creator.id} href="#" className="flex flex-col items-center">
                          <div className="relative">
                            <img 
                              src={creator.avatar} 
                              alt={creator.name} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                          <span className="text-xs mt-1">{creator.name.split(' ')[0]}</span>
                        </a>
                      ))}
                      <button className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Tracking Latest Order */}
                {orders.length > 0 && orders[0].status !== 'Delivered' && (
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Track Your Order</h2>
                      <span className="text-sm text-gray-500">{orders[0].id}</span>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute left-0 ml-4 mt-2 h-full w-0.5 bg-gray-200"></div>
                      
                      <div className="space-y-6 relative">
                        {orders[0].timeline.slice(0, 4).map((event, index) => (
                          <div key={index} className="flex">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 flex-shrink-0 ${
                              index === 0 ? 'bg-[#e65100] text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                              {index === 0 ? (
                                <Check size={16} />
                              ) : (
                                <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                              )}
                            </div>
                            
                            <div className="ml-4">
                              <div className={`font-medium ${index === 0 ? 'text-[#e65100]' : 'text-gray-800'}`}>
                                {event.status}
                              </div>
                              <div className="text-sm text-gray-500">
                                {event.date} • {event.time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                      <button 
                        className="text-sm text-[#e65100] hover:underline flex items-center"
                        onClick={() => {
                          setActiveTab('orders');
                          setActiveOrder(orders[0].id);
                        }}
                      >
                        View full tracking history
                        <ChevronRight size={16} className="ml-1" />
                      </button>
                      
                      <a 
                        href={`https://www.${orders[0].carrier.toLowerCase()}.com/track?tracknum=${orders[0].trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition"
                      >
                        Track on {orders[0].carrier}
                      </a>
                    </div>
                  </div>
                )}
                
                {/* Upcoming Events/Drops */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Upcoming from Creators You Follow</h2>
                    <button className="text-sm text-[#e65100] hover:underline">View Calendar</button>
                  </div>
                  
                  <div className="space-y-4">
                    {upcomingEvents.map(event => (
                      <div key={event.id} className="flex items-center border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mr-4">
                          {event.type === 'merch-drop' ? (
                            <ShoppingBag size={20} className="text-[#e65100]" />
                          ) : (
                            <Calendar size={20} className="text-purple-600" />
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex items-center text-xs text-gray-500 mb-1">
                            <span>{event.creator}</span>
                            <span className="mx-2">•</span>
                            <span>{event.type === 'merch-drop' ? 'Merchandise Drop' : 'Livestream Event'}</span>
                          </div>
                          <div className="font-medium">{event.title}</div>
                          <div className="flex items-center text-sm">
                            <Calendar size={14} className="mr-1 text-gray-400" />
                            <span className="text-gray-600">{event.date}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-[#e65100]">{event.countdown} days left</span>
                          </div>
                        </div>
                        
                        <button className="ml-4 px-3 py-1 text-xs border border-[#e65100] text-[#e65100] rounded-full hover:bg-[#e65100] hover:text-white transition">
                          Remind Me
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Wishlist Preview */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Your Wishlist</h2>
                    <button 
                      className="text-sm text-[#e65100] hover:underline"
                      onClick={() => setActiveTab('wishlist')}
                    >
                      View All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {wishlistItems.slice(0, 4).map(item => (
                      <div key={item.id} className="border border-gray-200 rounded-lg group hover:border-gray-300 transition">
                        <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden relative">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          {!item.inStock && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white bg-black bg-opacity-70 px-3 py-1 rounded text-sm">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-3">
                          <div className="text-xs text-gray-500 mb-1">{item.creator}</div>
                          <h3 className="font-medium text-sm mb-1">{item.name}</h3>
                          <div className="flex justify-between items-center">
                            <div className="font-semibold">{formatPrice(item.price)}</div>
                            <button className="text-[#e65100] hover:text-[#d84315]">
                              <ShoppingBag size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Orders History */}
            {activeTab === 'orders' && (
              <div>
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">My Orders</h1>
                    
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Search orders..." 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Order Header */}
                        <div 
                          className="p-4 bg-gray-50 border-b flex flex-col md:flex-row md:items-center gap-4 cursor-pointer"
                          onClick={() => toggleOrderDetails(order.id)}
                        >
                          <div className="flex-grow">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="font-semibold">{order.id}</h3>
                              <span className="text-sm text-gray-500">{order.date}</span>
                              <div className={`px-2 py-0.5 text-white text-xs rounded-full ${getStatusColor(order.status)}`}>
                                {order.status}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap text-sm text-gray-600 gap-4">
                              <div className="flex items-center">
                                <Package size={14} className="mr-1" />
                                <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                              </div>
                              
                              <div className="flex items-center">
                                <CreditCard size={14} className="mr-1" />
                                <span>{order.paymentMethod}</span>
                              </div>
                              
                              <div className="font-medium">
                                Total: {formatPrice(order.total)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 md:self-start">
                            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                              <Eye size={16} />
                            </button>
                            
                            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                              <Download size={16} />
                            </button>
                            
                            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                              <ChevronDown 
                                size={16} 
                                className={`transform transition ${activeOrder === order.id ? 'rotate-180' : ''}`} 
                              />
                            </button>
                          </div>
                        </div>
                        
                        {/* Order Details (collapsible) */}
                        {activeOrder === order.id && (
                          <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Order Items */}
                              <div className="md:col-span-2">
                                <h4 className="font-medium mb-3">Order Items</h4>
                                <div className="space-y-3">
                                  {order.items.map(item => (
                                    <div key={item.id} className="flex gap-3 p-3 border border-gray-100 rounded-lg">
                                      <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-16 h-16 object-cover rounded"
                                      />
                                      
                                      <div className="flex-grow">
                                        <div className="flex justify-between">
                                          <div>
                                            <h5 className="font-medium">{item.name}</h5>
                                            <p className="text-sm text-gray-500">{item.creator}</p>
                                          </div>
                                          <div className="text-right">
                                            <div>{formatPrice(item.price * item.quantity)}</div>
                                            <div className="text-sm text-gray-500">
                                              {item.quantity} × {formatPrice(item.price)}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="mt-2 flex gap-2">
                                          {item.name.toLowerCase().includes('digital') ? (
                                            <button className="text-xs text-[#e65100] hover:underline flex items-center">
                                              <Download size={12} className="mr-1" />
                                              Download
                                            </button>
                                          ) : (
                                            <>
                                              <button className="text-xs text-[#e65100] hover:underline">
                                                Buy Again
                                              </button>
                                              <button className="text-xs text-gray-600 hover:underline">
                                                Review
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Order Timeline */}
                                <h4 className="font-medium mt-6 mb-3">Tracking History</h4>
                                <div className="relative pl-6 pb-2">
                                  <div className="absolute left-0 top-1 bottom-0 w-0.5 bg-gray-200"></div>
                                  
                                  <div className="space-y-4">
                                    {order.timeline.map((event, index) => (
                                      <div key={index} className="relative">
                                        <div className={`absolute left-0 w-3 h-3 rounded-full -ml-1.5 ${
                                          index === 0 ? 'bg-[#e65100]' : 'bg-gray-300'
                                        }`}></div>
                                        <div className="pl-4">
                                          <div className={`font-medium ${index === 0 ? 'text-[#e65100]' : ''}`}>
                                            {event.status}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            {event.date} • {event.time}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Order Information */}
                              <div className="md:col-span-1">
                                <div className="space-y-6">
                                  {/* Shipping Address */}
                                  <div>
                                    <h4 className="font-medium mb-2">Shipping Address</h4>
                                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                                      <div className="font-medium">{order.shippingAddress.name}</div>
                                      <div>{order.shippingAddress.street}</div>
                                      <div>
                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                      </div>
                                      <div>{order.shippingAddress.country}</div>
                                    </div>
                                  </div>
                                  
                                  {/* Payment Method */}
                                  <div>
                                    <h4 className="font-medium mb-2">Payment Method</h4>
                                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-5 bg-blue-600 rounded-sm"></div>
                                        <div>{order.paymentMethod}</div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Order Summary */}
                                  <div>
                                    <h4 className="font-medium mb-2">Order Summary</h4>
                                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                                      <div className="space-y-2">
                                        <div className="flex justify-between">
                                          <span>Subtotal:</span>
                                          <span>{formatPrice(order.total - 10)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Shipping:</span>
                                          <span>{formatPrice(10)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Tax:</span>
                                          <span>Included</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2 font-medium flex justify-between">
                                          <span>Total:</span>
                                          <span>{formatPrice(order.total)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  <div className="space-y-2">
                                    {order.status !== 'Delivered' && (
                                      <a 
                                        href={`https://www.${order.carrier.toLowerCase()}.com/track?tracknum=${order.trackingNumber}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full py-2 bg-blue-500 text-white rounded-lg text-center hover:bg-blue-600 transition"
                                      >
                                        Track Package
                                      </a>
                                    )}
                                    
                                    {order.status === 'Delivered' && (
                                      <button className="block w-full py-2 border border-gray-300 rounded-lg text-center hover:bg-gray-50 transition">
                                        Return Items
                                      </button>
                                    )}
                                    
                                    <button className="block w-full py-2 border border-gray-300 rounded-lg text-center hover:bg-gray-50 transition">
                                      Contact Support
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Wishlist */}
            {activeTab === 'wishlist' && (
              <div>
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">My Wishlist</h1>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{wishlistItems.length} items</span>
                      
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Search wishlist..." 
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {wishlistItems.map(item => (
                      <div key={item.id} className="border border-gray-200 rounded-lg group hover:border-gray-300 transition">
                        <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden relative">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          
                          {!item.inStock && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white bg-black bg-opacity-70 px-3 py-1 rounded text-sm">
                                Out of Stock
                              </span>
                            </div>
                          )}
                          
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100">
                              <Share2 size={14} />
                            </button>
                            <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100">
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="text-sm text-gray-500 mb-1">{item.creator}</div>
                          <h3 className="font-medium mb-2">{item.name}</h3>
                          <div className="flex justify-between items-center">
                            <div className="font-semibold">{formatPrice(item.price)}</div>
                            
                            <button 
                              className={`px-3 py-1.5 rounded text-sm font-medium ${
                                item.inStock 
                                  ? 'bg-[#e65100] text-white hover:bg-[#d84315]' 
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              } transition`}
                              disabled={!item.inStock}
                            >
                              {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Saved for Later */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Recommended Based on Your Wishlist</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="border border-gray-200 rounded-lg group hover:border-gray-300 transition">
                        <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden relative">
                          <img 
                            src={`/api/placeholder/${300}/${300}`} 
                            alt={`Recommended item ${i}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          
                          <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100">
                            <Heart size={14} />
                          </button>
                        </div>
                        
                        <div className="p-4">
                          <div className="text-sm text-gray-500 mb-1">Creator Name</div>
                          <h3 className="font-medium mb-2">Recommended Item {i}</h3>
                          <div className="flex justify-between items-center">
                            <div className="font-semibold">{formatPrice(49.99 + i * 10)}</div>
                            
                            <button className="px-3 py-1.5 bg-[#e65100] text-white rounded text-sm font-medium hover:bg-[#d84315] transition">
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Fan Membership */}
            {activeTab === 'membership' && (
              <div>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                  {/* Membership Header */}
                  <div className="bg-gradient-to-r from-[#e65100] to-[#ff9800] text-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold mb-2">Gold Fan Status</h1>
                        <p>Unlocking exclusive perks since {user.joinDate}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-3xl font-bold">{user.points}</div>
                        <div>Fan Points</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Membership Progress */}
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Current Tier: Gold Fan</span>
                      <span className="text-sm text-gray-500">50 points until Platinum Fan</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <div className="bg-[#e65100] h-2.5 rounded-full" style={{ width: '83%' }}></div>
                    </div>
                    
                    <div className="flex justify-between text-xs">
                      <span>Silver Fan</span>
                      <span>Gold Fan</span>
                      <span>Platinum Fan</span>
                      <span>Diamond Fan</span>
                    </div>
                  </div>
                  
                  {/* Membership Benefits */}
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Your Gold Fan Benefits</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start p-4 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mr-4">
                          <Clock size={20} className="text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">Early Access</h3>
                          <p className="text-sm text-gray-600">
                            Get access to new merchandise 24 hours before general release
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-4 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mr-4">
                          <Gift size={20} className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">Exclusive Content</h3>
                          <p className="text-sm text-gray-600">
                            Access behind-the-scenes content from your favorite creators
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-4 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mr-4">
                          <Star size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">Points Multiplier</h3>
                          <p className="text-sm text-gray-600">
                            Earn 2x fan points on all purchases, limited drops, and events
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-4 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mr-4">
                          <Truck size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">Free Shipping</h3>
                          <p className="text-sm text-gray-600">
                            Free standard shipping on all orders over $35
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="font-medium mb-3">Next Tier: Platinum Fan (2,500 points)</h3>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li className="flex items-start">
                            <span className="text-[#e65100] mr-2">•</span>
                            <span>Exclusive virtual meet & greets with select creators</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#e65100] mr-2">•</span>
                            <span>3x points multiplier on purchases</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#e65100] mr-2">•</span>
                            <span>Free expedited shipping on all orders</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#e65100] mr-2">•</span>
                            <span>Monthly exclusive drops only for Platinum and Diamond fans</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Points History */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Points History</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left">Date</th>
                          <th className="py-3 px-4 text-left">Activity</th>
                          <th className="py-3 px-4 text-right">Points</th>
                          <th className="py-3 px-4 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="py-3 px-4 text-sm">March 15, 2025</td>
                          <td className="py-3 px-4">
                            <div className="font-medium">Purchase</div>
                            <div className="text-sm text-gray-500">Order #ORD-9876</div>
                          </td>
                          <td className="py-3 px-4 text-right text-green-600">+160</td>
                          <td className="py-3 px-4 text-right font-medium">2,450</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-sm">March 10, 2025</td>
                          <td className="py-3 px-4">
                            <div className="font-medium">Review Bonus</div>
                            <div className="text-sm text-gray-500">Art Print by Maya Johnson</div>
                          </td>
                          <td className="py-3 px-4 text-right text-green-600">+50</td>
                          <td className="py-3 px-4 text-right font-medium">2,290</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-sm">February 28, 2025</td>
                          <td className="py-3 px-4">
                            <div className="font-medium">Purchase</div>
                            <div className="text-sm text-gray-500">Order #ORD-9875</div>
                          </td>
                          <td className="py-3 px-4 text-right text-green-600">+260</td>
                          <td className="py-3 px-4 text-right font-medium">2,240</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-sm">February 15, 2025</td>
                          <td className="py-3 px-4">
                            <div className="font-medium">Social Share Bonus</div>
                            <div className="text-sm text-gray-500">Shared purchase on Instagram</div>
                          </td>
                          <td className="py-3 px-4 text-right text-green-600">+25</td>
                          <td className="py-3 px-4 text-right font-medium">1,980</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-sm">January 15, 2025</td>
                          <td className="py-3 px-4">
                            <div className="font-medium">Purchase</div>
                            <div className="text-sm text-gray-500">Order #ORD-9738</div>
                          </td>
                          <td className="py-3 px-4 text-right text-green-600">+72</td>
                          <td className="py-3 px-4 text-right font-medium">1,955</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Fan Exclusives */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Available Fan Exclusives</h2>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Gold Access</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(item => (
                      <div key={item} className="border border-gray-200 rounded-lg overflow-hidden group">
                        <div className="aspect-video relative">
                          <img 
                            src={`/api/placeholder/${400}/${225}`} 
                            alt={`Exclusive ${item}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                          <div className="absolute bottom-0 left-0 w-full p-4">
                            <div className="text-white font-medium">Exclusive Content {item}</div>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Creator Name</span>
                            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                              Gold+
                            </span>
                          </div>
                          
                          <button className="w-full py-2 bg-[#e65100] text-white rounded text-sm font-medium hover:bg-[#d84315] transition">
                            Access Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Account Settings */}
            {activeTab === 'settings' && (
              <div>
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
                  
                  {/* Profile Settings */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-3/4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              First Name
                            </label>
                            <input 
                              type="text" 
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                              defaultValue="Jamie"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Last Name
                            </label>
                            <input 
                              type="text" 
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                              defaultValue="Smith"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Address
                            </label>
                            <input 
                              type="email" 
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                              defaultValue="jamie.smith@example.com"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number
                            </label>
                            <input 
                              type="tel" 
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                              defaultValue="(555) 123-4567"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <button className="px-6 py-2 bg-[#e65100] text-white rounded-lg hover:bg-[#d84315] transition">
                            Save Changes
                          </button>
                        </div>
                      </div>
                      
                      <div className="md:w-1/4 flex flex-col items-center">
                        <div className="relative mb-4">
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-24 h-24 rounded-full object-cover"
                          />
                          <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#e65100] text-white rounded-full flex items-center justify-center border-2 border-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                        </div>
                        
                        <button className="text-sm text-[#e65100] hover:underline">
                          Upload New Photo
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Password Settings */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                    
                    <div className="max-w-lg">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input 
                            type="password" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                            placeholder="••••••••"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input 
                            type="password" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                            placeholder="••••••••"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input 
                            type="password" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <button className="px-6 py-2 bg-[#e65100] text-white rounded-lg hover:bg-[#d84315] transition">
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Addresses */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Saved Addresses</h2>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add New Address
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.addresses.map(address => (
                        <div 
                          key={address.id} 
                          className={`p-4 border rounded-lg relative ${address.default ? 'border-[#e65100]' : 'border-gray-200'}`}
                        >
                          {address.default && (
                            <span className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-[#e65100] text-white rounded">
                              Default
                            </span>
                          )}
                          
                          <div className="font-medium mb-1">{address.name}</div>
                          <div className="text-sm text-gray-600">
                            <div>{address.street}</div>
                            <div>{address.city}, {address.state} {address.zipCode}</div>
                            <div>{address.country}</div>
                            <div className="mt-1">{address.phone}</div>
                          </div>
                          
                          <div className="mt-4 flex gap-2">
                            <button className="text-sm text-gray-600 hover:text-gray-900">
                              Edit
                            </button>
                            <span className="text-gray-300">|</span>
                            <button className="text-sm text-gray-600 hover:text-gray-900">
                              Delete
                            </button>
                            {!address.default && (
                              <>
                                <span className="text-gray-300">|</span>
                                <button className="text-sm text-[#e65100] hover:text-[#d84315]">
                                  Set as Default
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Payment Methods */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Payment Methods</h2>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Payment Method
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {user.paymentMethods.map(method => (
                        <div 
                          key={method.id} 
                          className={`p-4 border rounded-lg relative ${method.default ? 'border-[#e65100]' : 'border-gray-200'}`}
                        >
                          {method.default && (
                            <span className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-[#e65100] text-white rounded">
                              Default
                            </span>
                          )}
                          
                          <div className="flex items-center">
                            <div className="w-10 h-6 bg-blue-600 rounded mr-3"></div>
                            <div>
                              <div className="font-medium">
                                {method.type === 'visa' ? 'Visa' : 'Mastercard'} ending in {method.lastFour}
                              </div>
                              <div className="text-sm text-gray-600">
                                Expires {method.expiryDate}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex gap-2">
                            <button className="text-sm text-gray-600 hover:text-gray-900">
                              Edit
                            </button>
                            <span className="text-gray-300">|</span>
                            <button className="text-sm text-gray-600 hover:text-gray-900">
                              Delete
                            </button>
                            {!method.default && (
                              <>
                                <span className="text-gray-300">|</span>
                                <button className="text-sm text-[#e65100] hover:text-[#d84315]">
                                  Set as Default
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Notification Preferences */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Order Updates</h3>
                            <p className="text-sm text-gray-600">
                              Receive notifications about your order status and tracking
                            </p>
                          </div>
                          
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e65100]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e65100]"></div>
                          </label>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Creator Updates</h3>
                            <p className="text-sm text-gray-600">
                              Receive notifications when creators you follow release new merchandise
                            </p>
                          </div>
                          
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e65100]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e65100]"></div>
                          </label>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Membership Rewards</h3>
                            <p className="text-sm text-gray-600">
                              Receive notifications about points earned and special offers
                            </p>
                          </div>
                          
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e65100]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e65100]"></div>
                          </label>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Marketing Communications</h3>
                            <p className="text-sm text-gray-600">
                              Receive newsletters and promotional offers from Junooni
                            </p>
                          </div>
                          
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" value="" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e65100]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e65100]"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button className="px-6 py-2 bg-[#e65100] text-white rounded-lg hover:bg-[#d84315] transition">
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;