// import React, { useState } from 'react';
// import { useNavigate } from '@tanstack/react-router';
// import {
//   Card,
//   CardContent
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import {
//   ShoppingBag,
//   Store,
//   Package,
//   Shirt,
//   ChevronRight,
//   ArrowRight,
//   ExternalLink,
//   Users,
//   BarChart3,
//   BookOpen,
//   Truck,
//   Palette,
//   DollarSign,
//   Clock,
//   Shield,
//   Zap
// } from 'lucide-react';


// const JunooniLandingPage = () => {
//   // Interactive hover states
//   const [isHoveredRegister, setIsHoveredRegister] = useState(false);
//   const [isHoveredLogin, setIsHoveredLogin] = useState(false);
//   const [activeFeature, setActiveFeature] = useState(0);
 
//   // Use TanStack Router for navigation
//   const navigate = useNavigate();
 
//   const handleRegisterClick = () => {
//     navigate({ to: '/sign-up' });
//   };


//   const handleLoginClick = () => {
//     navigate({ to: '/sign-in' });
//   };


//   // Features data for cards
//   const features = [
//     {
//       icon: <Store className="w-10 h-10 text-[#e65100]" />,
//       title: "No Inventory Required",
//       description: "We handle production, inventory, and shipping so you can focus on creating and marketing your products."
//     },
//     {
//       icon: <Shirt className="w-10 h-10 text-[#e65100]" />,
//       title: "Custom Merchandise",
//       description: "Create custom apparel, accessories, and more with your unique designs and branding."
//     },
//     {
//       icon: <Package className="w-10 h-10 text-[#e65100]" />,
//       title: "Quick Shipping",
//       description: "Products are printed and shipped within 2-3 business days with tracking provided to your customers."
//     }
//   ];


//   // Testimonials data
//   const testimonials = [
//     {
//       quote: "Launching my merchandise store was one of the best decisions I've made for my channel. The process was incredibly simple.",
//       author: "Alex Chen",
//       role: "YouTube Creator, 1.2M Subscribers"
//     },
//     {
//       quote: "My fans love the quality of the products, and I love that I don't have to worry about inventory or shipping.",
//       author: "Priya Sharma",
//       role: "Podcaster, The Daily Mindful"
//     },
//     {
//       quote: "The platform made it easy to design, list, and sell products. My community was excited to support the brand.",
//       author: "Marcus Johnson",
//       role: "Twitch Streamer, 500K Followers"
//     }
//   ];


//   // Enhanced key benefits
//   const benefits = [
//     {
//       icon: <Palette className="w-8 h-8 text-[#e65100]" />,
//       title: "Design Made Simple",
//       description: "Intuitive design tools with templates to create professional merchandise",
//       metric: "50+ Templates"
//     },
//     {
//       icon: <DollarSign className="w-8 h-8 text-[#e65100]" />,
//       title: "Zero Upfront Cost",
//       description: "No inventory investment required - we only produce when you get orders",
//       metric: "0% Risk"
//     },
//     {
//       icon: <Truck className="w-8 h-8 text-[#e65100]" />,
//       title: "Global Fulfillment",
//       description: "Worldwide shipping network ensures fast delivery to your customers",
//       metric: "150+ Countries"
//     },
//     {
//       icon: <Shield className="w-8 h-8 text-[#e65100]" />,
//       title: "Quality Guaranteed",
//       description: "Premium products with quality assurance and hassle-free returns",
//       metric: "99.9% Uptime"
//     }
//   ];


//   return (
//     <div className="flex flex-col min-h-screen">
//       {/* Header */}
//       <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
//         <div className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
//           <div className="flex items-center space-x-3">
//             {/* <div className="bg-[#e65100] text-white p-2 rounded-lg transform transition-transform hover:scale-110 duration-300">
//               <ShoppingBag className="w-6 h-6" />
//             </div> */}
//             {/* <h1 className="text-xl font-bold text-gray-900"></h1> */}
//             <img src="/src/assets/junooni_logo_brand_color.png" alt="Junooni Logo" className="h-8" />
//           </div>
//           <div className="space-x-4">
//             <Button
//               variant="outline"
//               onClick={handleLoginClick}
//               onMouseEnter={() => setIsHoveredLogin(true)}
//               onMouseLeave={() => setIsHoveredLogin(false)}
//               className="transition-all duration-300"
//             >
//               Login
//               {isHoveredLogin && <ArrowRight className="w-4 h-4 ml-2 animate-pulse" />}
//             </Button>
//             <Button
//               onClick={handleRegisterClick}
//               onMouseEnter={() => setIsHoveredRegister(true)}
//               onMouseLeave={() => setIsHoveredRegister(false)}
//               className="transition-all duration-300 bg-[#e65100] hover:bg-[#d84315]"
//             >
//               Register
//               {isHoveredRegister && <ArrowRight className="w-4 h-4 ml-2 animate-pulse" />}
//             </Button>
//           </div>
//         </div>
//       </header>


//       {/* Hero Section */}
//       <div className="py-20 bg-gradient-to-b from-orange-50 to-amber-50">
//         <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
//           <div className="flex flex-col items-center md:flex-row">
//             <div className="mb-10 md:w-1/2 md:mb-0">
//               <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900">
//                 Create Your <span className="text-[#e65100]">Merchandise Store</span> for Your Brand
//               </h1>
//               <p className="mb-8 text-lg leading-relaxed text-gray-600">
//                 Join thousands of creators, influencers, and businesses who sell custom merchandise to their audience without the hassle of inventory management or shipping.
//               </p>
//               <div className="flex flex-col gap-4 sm:flex-row">
//                 <Button
//                   size="lg"
//                   onClick={handleRegisterClick}
//                   className="px-8 py-6 text-lg bg-[#e65100] hover:bg-[#d84315] transform transition hover:-translate-y-1 hover:shadow-xl"
//                 >
//                   Start Selling Today
//                   <ChevronRight className="w-5 h-5 ml-2" />
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   onClick={() => window.location.href = '#learn-more'}
//                   className="px-8 py-6 text-lg border-[#e65100] text-[#e65100] hover:bg-orange-50"
//                 >
//                   Learn More
//                   <ExternalLink className="w-4 h-4 ml-2" />
//                 </Button>
//               </div>
//             </div>
//             <div className="flex justify-center md:w-1/2">
//               <div className="relative">
//                 <div className="absolute -inset-1 bg-gradient-to-r from-[#e65100] to-amber-500 rounded-lg blur opacity-25 animate-pulse"></div>
//                 <img
//                   src="/api/placeholder/600/500"
//                   alt="Merchandise store illustration"
//                   className="relative transition duration-500 transform rounded-lg shadow-2xl hover:scale-105"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>


//       {/* Features Section */}
//       <div className="py-20 bg-white" id="learn-more">
//         <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
//           <div className="mb-16 text-center">
//             <h2 className="mb-4 text-3xl font-bold text-gray-900">Why Choose JUNOONI?</h2>
//             <p className="max-w-3xl mx-auto text-lg text-gray-600">
//               We provide everything you need to create, sell, and deliver custom merchandise to your audience.
//             </p>
//           </div>


//           <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
//             {features.map((feature, index) => (
//               <Card
//                 key={index}
//                 className={`p-6 transition-all duration-300 hover:shadow-lg hover:border-[#e65100]/50 ${
//                   activeFeature === index ? 'border-[#e65100] shadow-lg' : ''
//                 }`}
//                 onMouseEnter={() => setActiveFeature(index)}
//               >
//                 <div className="flex flex-col items-center text-center">
//                   <div className="mb-4 transition duration-300 transform hover:scale-110">{feature.icon}</div>
//                   <h3 className="mb-2 text-xl font-bold text-gray-900">{feature.title}</h3>
//                   <p className="text-gray-600">{feature.description}</p>
//                 </div>
//               </Card>
//             ))}
//           </div>


//           {/* Additional Features */}
//           <div className="p-8 mt-16 shadow-md bg-orange-50 rounded-xl">
//             <div className="mb-8 text-center">
//               <h3 className="text-2xl font-bold text-gray-900">Seller Portal Features</h3>
//               <p className="mt-2 text-gray-600">Powerful tools to manage your merchandise business</p>
//             </div>
           
//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
//               <div className="p-6 transition-all bg-white rounded-lg shadow-sm hover:shadow-md group">
//                 <div className="bg-orange-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 group-hover:bg-[#e65100] transition-colors">
//                   <BarChart3 className="h-7 w-7 text-[#e65100] group-hover:text-white transition-colors" />
//                 </div>
//                 <h4 className="mb-2 text-lg font-semibold">Analytics Dashboard</h4>
//                 <p className="text-gray-600">Track sales, monitor performance, and gain insights to grow your business.</p>
//               </div>
             
//               <div className="p-6 transition-all bg-white rounded-lg shadow-sm hover:shadow-md group">
//                 <div className="bg-orange-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 group-hover:bg-[#e65100] transition-colors">
//                   <Users className="h-7 w-7 text-[#e65100] group-hover:text-white transition-colors" />
//                 </div>
//                 <h4 className="mb-2 text-lg font-semibold">Customer Management</h4>
//                 <p className="text-gray-600">Manage customer data, track order history, and provide better service.</p>
//               </div>
             
//               <div className="p-6 transition-all bg-white rounded-lg shadow-sm hover:shadow-md group">
//                 <div className="bg-orange-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 group-hover:bg-[#e65100] transition-colors">
//                   <Shirt className="h-7 w-7 text-[#e65100] group-hover:text-white transition-colors" />
//                 </div>
//                 <h4 className="mb-2 text-lg font-semibold">Product Design Tools</h4>
//                 <p className="text-gray-600">Create and customize products with our easy-to-use design tools.</p>
//               </div>
             
//               <div className="p-6 transition-all bg-white rounded-lg shadow-sm hover:shadow-md group">
//                 <div className="bg-orange-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 group-hover:bg-[#e65100] transition-colors">
//                   <BookOpen className="h-7 w-7 text-[#e65100] group-hover:text-white transition-colors" />
//                 </div>
//                 <h4 className="mb-2 text-lg font-semibold">Order Management</h4>
//                 <p className="text-gray-600">View and manage orders, track fulfillment, and handle customer requests.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>


//       {/* Social Proof */}
//       <div className="py-20 bg-gradient-to-b from-white to-orange-50">
//         <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
//           <div className="mb-16 text-center">
//             <h2 className="mb-4 text-3xl font-bold text-gray-900">Trusted by Creators Worldwide</h2>
//             <p className="max-w-3xl mx-auto text-lg text-gray-600">
//               Join thousands of content creators who have launched successful merchandise stores.
//             </p>
//           </div>


//           <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
//             {testimonials.map((testimonial, index) => (
//               <Card
//                 key={index}
//                 className="p-6 hover:shadow-lg transition-all hover:border-[#e65100]/30 hover:-translate-y-1 transform duration-300"
//               >
//                 <div className="flex flex-col h-full">
//                   <div className="mb-2">
//                     {[...Array(5)].map((_, i) => (
//                       <span key={i} className="text-amber-400">★</span>
//                     ))}
//                   </div>
//                   <p className="flex-grow mb-4 italic text-gray-600">"{testimonial.quote}"</p>
//                   <div className="pt-4 mt-auto border-t border-gray-100">
//                     <p className="font-semibold text-gray-900">{testimonial.author}</p>
//                     <p className="text-sm text-gray-500">{testimonial.role}</p>
//                   </div>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </div>


//       {/* Key Benefits Section */}
//       <div className="py-20 bg-white">
//         <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
//           <div className="mb-16 text-center">
//             <h2 className="mb-4 text-3xl font-bold text-gray-900">Everything You Need to Succeed</h2>
//             <p className="max-w-3xl mx-auto text-lg text-gray-600">
//               Our platform provides comprehensive features to help you grow your merchandise business
//             </p>
//           </div>
         
//           <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
//             {benefits.map((benefit, index) => (
//               <div
//                 key={index}
//                 className="p-6 transition-all bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:from-orange-50/50 hover:to-orange-100/30 hover:shadow-lg"
//               >
//                 <div className="flex flex-col items-center text-center">
//                   <div className="p-4 mb-4 bg-white rounded-full shadow-sm">
//                     {benefit.icon}
//                   </div>
//                   <h3 className="mb-2 text-xl font-bold text-gray-900">{benefit.title}</h3>
//                   <p className="mb-4 text-gray-600">{benefit.description}</p>
//                   <div className="mt-auto">
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#e65100] text-white">
//                       {benefit.metric}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>


//       {/* CTA Section */}
//       <div className="bg-[#e65100] py-20">
//         <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
//           <h2 className="mb-4 text-3xl font-bold text-white">Ready to Start Selling?</h2>
//           <p className="max-w-3xl mx-auto mb-8 text-xl text-white/90">
//             Create your account today and launch your merchandise store within minutes.
//           </p>
//           <Button
//             size="lg"
//             variant="secondary"
//             onClick={handleRegisterClick}
//             className="px-8 py-6 text-lg bg-white text-[#e65100] hover:bg-gray-100 hover:shadow-xl transition transform hover:-translate-y-1"
//           >
//             Create Your Store
//             <ChevronRight className="w-5 h-5 ml-2" />
//           </Button>
//           <p className="mt-6 text-sm text-white/80">No credit card required. Get started for free.</p>
//         </div>
//       </div>


//       {/* Footer */}
//       <footer className="py-12 text-white bg-gray-900">
//         <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
//           <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
//             <div>
//               <div className="flex items-center mb-4 space-x-3">
//                 {/* <div className="bg-[#e65100] text-white p-2 rounded-lg">
//                   <ShoppingBag className="w-6 h-6" />
//                 </div> */}
//                 {/* <h3 className="text-xl font-bold">JUNOONI</h3> */}
//                 <img src="/src/assets/junooni_logo_brand_color.png" alt="Junooni Logo" className="h-8" />
//               </div>
//               <p className="text-gray-400">
//                 The easiest way for creators to sell custom merchandise.
//               </p>
//               <div className="flex mt-4 space-x-4">
//                 <a href="#" className="text-gray-400 transition-colors hover:text-white">
//                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
//                 </a>
//                 <a href="#" className="text-gray-400 transition-colors hover:text-white">
//                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
//                 </a>
//                 <a href="#" className="text-gray-400 transition-colors hover:text-white">
//                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path></svg>
//                 </a>
//               </div>
//             </div>
//             <div>
//               <h4 className="mb-4 text-lg font-semibold">Company</h4>
//               <ul className="space-y-2">
//                 <li><a href="#" className="text-gray-400 transition-colors hover:text-white">About Us</a></li>
//                 <li><a href="#" className="text-gray-400 transition-colors hover:text-white">Careers</a></li>
//                 <li><a href="#" className="text-gray-400 transition-colors hover:text-white">Press</a></li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="mb-4 text-lg font-semibold">Resources</h4>
//               <ul className="space-y-2">
//                 <li><a href="#" className="text-gray-400 transition-colors hover:text-white">Help Center</a></li>
//                 <li><a href="#" className="text-gray-400 transition-colors hover:text-white">Blog</a></li>
//                 <li><a href="#" className="text-gray-400 transition-colors hover:text-white">Design Templates</a></li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="mb-4 text-lg font-semibold">Legal</h4>
//               <ul className="space-y-2">
//                 <li><a href="#" className="text-gray-400 transition-colors hover:text-white">Terms of Service</a></li>
//                 <li><a href="#" className="text-gray-400 transition-colors hover:text-white">Privacy Policy</a></li>
//                 <li><a href="#" className="text-gray-400 transition-colors hover:text-white">Cookie Policy</a></li>
//               </ul>
//             </div>
//           </div>
//           <div className="pt-8 mt-8 text-center border-t border-gray-800">
//             <p className="text-gray-400">© {new Date().getFullYear()} JUNOONI. All rights reserved.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };


// export default JunooniLandingPage;

import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  Store,
  Package,
  Shirt,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Users,
  BarChart3,
  BookOpen,
  Truck,
  Palette,
  DollarSign,
  Clock,
  Shield,
  Zap
} from 'lucide-react';


const JunooniLandingPage = () => {
  // Interactive hover states
  const [isHoveredRegister, setIsHoveredRegister] = useState(false);
  const [isHoveredLogin, setIsHoveredLogin] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
 
  // Use TanStack Router for navigation
  const navigate = useNavigate();
 
  const handleRegisterClick = () => {
    navigate({ to: '/sign-up' });
  };


  const handleLoginClick = () => {
    navigate({ to: '/sign-in' });
  };


  // Features data for cards
  const features = [
    {
      icon: <Store className="w-8 h-8 sm:w-10 sm:h-10 text-[#e65100]" />,
      title: "No Inventory Required",
      description: "We handle production, inventory, and shipping so you can focus on creating and marketing your products."
    },
    {
      icon: <Shirt className="w-8 h-8 sm:w-10 sm:h-10 text-[#e65100]" />,
      title: "Custom Merchandise",
      description: "Create custom apparel, accessories, and more with your unique designs and branding."
    },
    {
      icon: <Package className="w-8 h-8 sm:w-10 sm:h-10 text-[#e65100]" />,
      title: "Quick Shipping",
      description: "Products are printed and shipped within 2-3 business days with tracking provided to your customers."
    }
  ];


  // Testimonials data
  const testimonials = [
    {
      quote: "Launching my merchandise store was one of the best decisions I've made for my channel. The process was incredibly simple.",
      author: "Alex Chen",
      role: "YouTube Creator, 1.2M Subscribers"
    },
    {
      quote: "My fans love the quality of the products, and I love that I don't have to worry about inventory or shipping.",
      author: "Priya Sharma",
      role: "Podcaster, The Daily Mindful"
    },
    {
      quote: "The platform made it easy to design, list, and sell products. My community was excited to support the brand.",
      author: "Marcus Johnson",
      role: "Twitch Streamer, 500K Followers"
    }
  ];


  // Enhanced key benefits
  const benefits = [
    {
      icon: <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-[#e65100]" />,
      title: "Design Made Simple",
      description: "Intuitive design tools with templates to create professional merchandise",
      metric: "50+ Templates"
    },
    {
      icon: <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-[#e65100]" />,
      title: "Zero Upfront Cost",
      description: "No inventory investment required - we only produce when you get orders",
      metric: "0% Risk"
    },
    {
      icon: <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-[#e65100]" />,
      title: "Global Fulfillment",
      description: "Worldwide shipping network ensures fast delivery to your customers",
      metric: "150+ Countries"
    },
    {
      icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-[#e65100]" />,
      title: "Quality Guaranteed",
      description: "Premium products with quality assurance and hassle-free returns",
      metric: "99.9% Uptime"
    }
  ];


  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-4">
          <div className="flex items-center space-x-3">
            <img src="/src/assets/junooni_logo_brand_color.png" alt="Junooni Logo" className="h-6 sm:h-8" />
          </div>
          <div className="flex space-x-2 sm:space-x-4">
            <Button
              variant="outline"
              onClick={handleLoginClick}
              onMouseEnter={() => setIsHoveredLogin(true)}
              onMouseLeave={() => setIsHoveredLogin(false)}
              className="px-3 py-2 text-sm transition-all duration-300 sm:text-base sm:px-4 sm:py-2"
              size="sm"
            >
              <span className="hidden sm:inline">Login</span>
              <span className="sm:hidden">Log In</span>
              {isHoveredLogin && <ArrowRight className="w-3 h-3 ml-1 sm:w-4 sm:h-4 sm:ml-2 animate-pulse" />}
            </Button>
            <Button
              onClick={handleRegisterClick}
              onMouseEnter={() => setIsHoveredRegister(true)}
              onMouseLeave={() => setIsHoveredRegister(false)}
              className="transition-all duration-300 bg-[#e65100] hover:bg-[#d84315] text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2"
              size="sm"
            >
              <span className="hidden sm:inline">Register</span>
              <span className="sm:hidden">Sign Up</span>
              {isHoveredRegister && <ArrowRight className="w-3 h-3 ml-1 sm:w-4 sm:h-4 sm:ml-2 animate-pulse" />}
            </Button>
          </div>
        </div>
      </header>


      {/* Hero Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-orange-50 to-amber-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center md:flex-row">
            <div className="mb-8 sm:mb-10 md:w-1/2 md:mb-0">
              <h1 className="mb-4 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
                Create Your <span className="text-[#e65100]">Merchandise Store</span> for Your Brand
              </h1>
              <p className="mb-6 text-base leading-relaxed text-gray-600 sm:mb-8 sm:text-lg">
                Join thousands of creators, influencers, and businesses who sell custom merchandise to their audience without the hassle of inventory management or shipping.
              </p>
              <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row">
                <Button
                  size="lg"
                  onClick={handleRegisterClick}
                  className="px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg bg-[#e65100] hover:bg-[#d84315] transform transition hover:-translate-y-1 hover:shadow-xl w-full sm:w-auto"
                >
                  Start Selling Today
                  <ChevronRight className="w-4 h-4 ml-2 sm:w-5 sm:h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.location.href = '#learn-more'}
                  className="px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg border-[#e65100] text-[#e65100] hover:bg-orange-50 w-full sm:w-auto"
                >
                  Learn More
                  <ExternalLink className="w-3 h-3 ml-2 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-center md:w-1/2">
              <div className="relative max-w-sm sm:max-w-md lg:max-w-lg">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#e65100] to-amber-500 rounded-lg blur opacity-25 animate-pulse"></div>
                <img
                  src="/api/placeholder/600/500"
                  alt="Merchandise store illustration"
                  className="relative w-full h-auto transition duration-500 transform rounded-lg shadow-2xl hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Features Section */}
      <div className="py-12 bg-white sm:py-16 lg:py-20" id="learn-more">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">Why Choose JUNOONI?</h2>
            <p className="max-w-3xl mx-auto text-base text-gray-600 sm:text-lg">
              We provide everything you need to create, sell, and deliver custom merchandise to your audience.
            </p>
          </div>


          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:border-[#e65100]/50 ${
                  activeFeature === index ? 'border-[#e65100] shadow-lg' : ''
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 transition duration-300 transform sm:mb-4 hover:scale-110">{feature.icon}</div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">{feature.title}</h3>
                  <p className="text-sm text-gray-600 sm:text-base">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>


          {/* Additional Features */}
          <div className="p-6 mt-12 shadow-md sm:p-8 sm:mt-16 bg-orange-50 rounded-xl">
            <div className="mb-6 text-center sm:mb-8">
              <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">Seller Portal Features</h3>
              <p className="mt-2 text-sm text-gray-600 sm:text-base">Powerful tools to manage your merchandise business</p>
            </div>
           
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 transition-all bg-white rounded-lg shadow-sm sm:p-6 hover:shadow-md group">
                <div className="bg-orange-100 p-2 sm:p-3 rounded-full w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[#e65100] transition-colors">
                  <BarChart3 className="h-5 w-5 sm:h-7 sm:w-7 text-[#e65100] group-hover:text-white transition-colors" />
                </div>
                <h4 className="mb-2 text-base font-semibold sm:text-lg">Analytics Dashboard</h4>
                <p className="text-sm text-gray-600 sm:text-base">Track sales, monitor performance, and gain insights to grow your business.</p>
              </div>
             
              <div className="p-4 transition-all bg-white rounded-lg shadow-sm sm:p-6 hover:shadow-md group">
                <div className="bg-orange-100 p-2 sm:p-3 rounded-full w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[#e65100] transition-colors">
                  <Users className="h-5 w-5 sm:h-7 sm:w-7 text-[#e65100] group-hover:text-white transition-colors" />
                </div>
                <h4 className="mb-2 text-base font-semibold sm:text-lg">Customer Management</h4>
                <p className="text-sm text-gray-600 sm:text-base">Manage customer data, track order history, and provide better service.</p>
              </div>
             
              <div className="p-4 transition-all bg-white rounded-lg shadow-sm sm:p-6 hover:shadow-md group">
                <div className="bg-orange-100 p-2 sm:p-3 rounded-full w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[#e65100] transition-colors">
                  <Shirt className="h-5 w-5 sm:h-7 sm:w-7 text-[#e65100] group-hover:text-white transition-colors" />
                </div>
                <h4 className="mb-2 text-base font-semibold sm:text-lg">Product Design Tools</h4>
                <p className="text-sm text-gray-600 sm:text-base">Create and customize products with our easy-to-use design tools.</p>
              </div>
             
              <div className="p-4 transition-all bg-white rounded-lg shadow-sm sm:p-6 hover:shadow-md group">
                <div className="bg-orange-100 p-2 sm:p-3 rounded-full w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[#e65100] transition-colors">
                  <BookOpen className="h-5 w-5 sm:h-7 sm:w-7 text-[#e65100] group-hover:text-white transition-colors" />
                </div>
                <h4 className="mb-2 text-base font-semibold sm:text-lg">Order Management</h4>
                <p className="text-sm text-gray-600 sm:text-base">View and manage orders, track fulfillment, and handle customer requests.</p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Social Proof */}
      <div className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-orange-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">Trusted by Creators Worldwide</h2>
            <p className="max-w-3xl mx-auto text-base text-gray-600 sm:text-lg">
              Join thousands of content creators who have launched successful merchandise stores.
            </p>
          </div>


          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-4 sm:p-6 hover:shadow-lg transition-all hover:border-[#e65100]/30 hover:-translate-y-1 transform duration-300"
              >
                <div className="flex flex-col h-full">
                  <div className="mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-sm text-amber-400 sm:text-base">★</span>
                    ))}
                  </div>
                  <p className="flex-grow mb-4 text-sm italic text-gray-600 sm:text-base">"{testimonial.quote}"</p>
                  <div className="pt-4 mt-auto border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 sm:text-base">{testimonial.author}</p>
                    <p className="text-xs text-gray-500 sm:text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>


      {/* Key Benefits Section */}
      <div className="py-12 bg-white sm:py-16 lg:py-20">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">Everything You Need to Succeed</h2>
            <p className="max-w-3xl mx-auto text-base text-gray-600 sm:text-lg">
              Our platform provides comprehensive features to help you grow your merchandise business
            </p>
          </div>
         
          <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-4 transition-all sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:from-orange-50/50 hover:to-orange-100/30 hover:shadow-lg"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 mb-3 bg-white rounded-full shadow-sm sm:p-4 sm:mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">{benefit.title}</h3>
                  <p className="mb-4 text-sm text-gray-600 sm:text-base">{benefit.description}</p>
                  <div className="mt-auto">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[#e65100] text-white">
                      {benefit.metric}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* CTA Section */}
      <div className="bg-[#e65100] py-12 sm:py-16 lg:py-20">
        <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">Ready to Start Selling?</h2>
          <p className="max-w-3xl mx-auto mb-6 text-lg sm:mb-8 sm:text-xl text-white/90">
            Create your account today and launch your merchandise store within minutes.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={handleRegisterClick}
            className="px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg bg-white text-[#e65100] hover:bg-gray-100 hover:shadow-xl transition transform hover:-translate-y-1"
          >
            Create Your Store
            <ChevronRight className="w-4 h-4 ml-2 sm:w-5 sm:h-5" />
          </Button>
          <p className="mt-4 text-xs sm:mt-6 sm:text-sm text-white/80">No credit card required. Get started for free.</p>
        </div>
      </div>


      {/* Footer */}
      <footer className="py-8 text-white bg-gray-900 sm:py-12">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="flex items-center mb-4 space-x-3">
                <img src="/src/assets/junooni_logo_brand_color.png" alt="Junooni Logo" className="h-6 sm:h-8" />
              </div>
              <p className="text-sm text-gray-400 sm:text-base">
                The easiest way for creators to sell custom merchandise.
              </p>
              <div className="flex mt-4 space-x-4">
                <a href="#" className="text-gray-400 transition-colors hover:text-white">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                </a>
                <a href="#" className="text-gray-400 transition-colors hover:text-white">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="text-gray-400 transition-colors hover:text-white">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"></path></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 transition-colors sm:text-base hover:text-white">About Us</a></li>
                <li><a href="#" className="text-sm text-gray-400 transition-colors sm:text-base hover:text-white">Careers</a></li>
                <li><a href="#" className="text-sm text-gray-400 transition-colors sm:text-base hover:text-white">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 transition-colors sm:text-base hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-400 transition-colors sm:text-base hover:text-white">Blog</a></li>
                <li><a href="#" className="text-sm text-gray-400 transition-colors sm:text-base hover:text-white">Design Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 transition-colors sm:text-base hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-gray-400 transition-colors sm:text-base hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-gray-400 transition-colors sm:text-base hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 mt-6 text-center border-t border-gray-800 sm:pt-8 sm:mt-8">
            <p className="text-sm text-gray-400 sm:text-base">© {new Date().getFullYear()} JUNOONI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};


export default JunooniLandingPage;