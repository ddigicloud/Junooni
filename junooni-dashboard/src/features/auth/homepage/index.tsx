import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowRight, Play, Star, TrendingUp, Users, Package, Palette, Camera, Video, 
  Smartphone, Globe, Shield, Zap, ChevronRight, Menu, X, Shirt, Coffee, 
  MousePointer, Sparkles, Heart, Edit3, Eye, Layers, Download, Share2,
  BarChart3, BookOpen, Store, ExternalLink
} from 'lucide-react';

const JunooniLandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const [currentMerch, setCurrentMerch] = useState(0);
  const [isHoveredRegister, setIsHoveredRegister] = useState(false);
  const [isHoveredLogin, setIsHoveredLogin] = useState(false);

  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate({ to: '/sign-up' });
  };

  const handleLoginClick = () => {
    navigate({ to: '/sign-in' });
  };

  const stats = [
    { number: "50K+", label: "Active Creators", icon: Users },
    { number: "2M+", label: "Designs Created", icon: Palette },
    { number: "500K+", label: "Merch Sold", icon: Package },
    { number: "4.9★", label: "Creator Rating", icon: Star }
  ];

  const merchTypes = [
    { name: "T-Shirts", icon: "👕", color: "bg-orange-100", shadow: "shadow-orange-200" },
    { name: "Mugs", icon: "☕", color: "bg-orange-200", shadow: "shadow-orange-200" },
    { name: "Hoodies", icon: "🧥", color: "bg-orange-50", shadow: "shadow-orange-200" },
    { name: "Stickers", icon: "🏷️", color: "bg-amber-100", shadow: "shadow-amber-200" },
    { name: "Posters", icon: "🖼️", color: "bg-orange-100", shadow: "shadow-orange-200" },
    { name: "Phone Cases", icon: "📱", color: "bg-amber-50", shadow: "shadow-amber-200" }
  ];

  const steps = [
    {
      step: "01",
      title: "Sign Up",
      description: "Create your creator account and join our marketplace community",
      icon: Users
    },
    {
      step: "02", 
      title: "Choose & Design Your Merch",
      description: "Select products and upload your graphics to create amazing merchandise",
      icon: Palette
    },
    {
      step: "03",
      title: "Start Earning",
      description: "Publish to Junooni marketplace and start earning from your designs",
      icon: TrendingUp
    }
  ];

  const testimonials = [
    {
      quote: "Junooni Creator Studio changed my life! I went from hobby designer to full-time creator in just 3 months.",
      author: "Arjun Mehta",
      role: "Graphic Designer",
      avatar: "👨‍🎨",
      earnings: "₹75,000/month",
      products: "T-shirts & Stickers"
    },
    {
      quote: "The marketplace made it so easy to upload my designs and start selling immediately.",
      author: "Priya Sharma",
      role: "Digital Artist",
      avatar: "👩‍💻",
      earnings: "₹95,000/month",
      products: "Posters & Mugs"
    },
    {
      quote: "Finally, a platform that understands creators. The community and support are amazing!",
      author: "Rohan Gupta",
      role: "Illustrator",
      avatar: "👨‍🎨",
      earnings: "₹120,000/month",
      products: "Hoodies & Cases"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMerch((prev) => (prev + 1) % merchTypes.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="/src/assets/junooni_logo_brand_color.png" alt="Junooni Logo" className="h-8" />
              <div className="hidden sm:block text-sm text-gray-600">Creator Studio</div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleLoginClick}
                onMouseEnter={() => setIsHoveredLogin(true)}
                onMouseLeave={() => setIsHoveredLogin(false)}
                className="transition-all duration-300"
              >
                Login
                {isHoveredLogin && <ArrowRight className="w-4 h-4 ml-2 animate-pulse" />}
              </Button>
              <Button
                onClick={handleRegisterClick}
                onMouseEnter={() => setIsHoveredRegister(true)}
                onMouseLeave={() => setIsHoveredRegister(false)}
                className="transition-all duration-300 bg-[#e65100] hover:bg-[#d84315]"
              >
                Start Selling
                {isHoveredRegister && <ArrowRight className="w-4 h-4 ml-2 animate-pulse" />}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 py-4">
              <div className="space-y-4 px-4">
                <Button
                  variant="outline"
                  onClick={handleLoginClick}
                  className="w-full"
                >
                  Login
                </Button>
                <Button 
                  onClick={handleRegisterClick}
                  className="w-full bg-[#e65100] hover:bg-[#d84315]"
                >
                  Start Selling
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-orange-50 via-white to-orange-100 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full text-sm font-medium text-orange-800 mb-6">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Join 50,000+ successful creators
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Design Amazing
                  <br />
                  <span style={{ color: '#e65100' }} className="relative">
                    Merchandise
                    <div className="absolute -bottom-2 left-0 w-full h-3 bg-orange-200 opacity-30 -skew-x-12"></div>
                  </span>
                  <br />
                  In Minutes
                </h1>
                <p className="text-xl text-gray-600 mt-6">
                  Upload your designs to our product catalog and sell on Junooni marketplace. 
                  Turn your creativity into income with zero inventory hassle.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={handleRegisterClick}
                  className="px-8 py-4 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-all transform hover:scale-105 hover:shadow-xl group"
                  style={{ backgroundColor: '#e65100' }}
                >
                  Start Designing Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center group"
                >
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </div>

              {/* Animated Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
                {stats.map((stat, index) => (
                  <div 
                    key={index}
                    className={`text-center transition-all duration-500 transform ${
                      currentStat === index ? 'scale-110 -rotate-2' : 'scale-100'
                    }`}
                  >
                    <div className={`p-3 rounded-full mx-auto mb-2 w-12 h-12 flex items-center justify-center transition-all duration-500 ${
                      currentStat === index ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      <stat.icon 
                        className={`h-6 w-6 transition-colors duration-500 ${
                          currentStat === index ? 'text-orange-600' : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              {/* Main Design Canvas */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform hover:rotate-2 transition-transform duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                
                {/* Design Tools Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-500">Junooni Creator Studio</div>
                </div>

                {/* Canvas Area */}
                <div className="bg-gray-100 rounded-lg p-8 mb-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform skew-x-12"></div>
                  
                  {/* Animated Merch Preview */}
                  <div className="relative">
                    {merchTypes.map((merch, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                          currentMerch === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}
                      >
                        <div className={`${merch.color} ${merch.shadow} shadow-lg rounded-xl p-6 transform hover:scale-105 transition-transform`}>
                          <div className="text-4xl mb-2">{merch.icon}</div>
                          <div className="text-lg font-semibold text-gray-800">{merch.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Design Tools */}
                <div className="grid grid-cols-4 gap-2">
                  {[Palette, Layers, Edit3, Share2].map((Icon, index) => (
                    <div key={index} className="bg-gray-50 hover:bg-orange-50 p-3 rounded-lg transition-colors cursor-pointer group">
                      <Icon className="h-6 w-6 text-gray-600 group-hover:text-orange-600 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg">
                <Heart className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-orange-600 text-white p-4 rounded-full shadow-lg">
                <Star className="h-6 w-6" />
              </div>
              <div className="absolute top-1/2 -right-4 bg-orange-500 text-white p-3 rounded-full shadow-lg">
                <Zap className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Start Creating in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              From idea to income in minutes, not months
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center group">
                {/* Step Card */}
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  {/* Step Number */}
                  <div className="relative mb-6">
                    <div 
                      className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white text-2xl font-bold hover:scale-110 transition-transform duration-300 shadow-lg"
                      style={{ backgroundColor: '#e65100' }}
                    >
                      {step.step}
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <step.icon className="h-8 w-8 text-white rounded-full p-1.5" style={{ backgroundColor: '#d84315' }} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{step.description}</p>
                </div>
                
                {/* Arrow connector */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="h-8 w-8 text-orange-300" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA after steps */}
          <div className="text-center mt-16">
            <Button
              size="lg"
              onClick={handleRegisterClick}
              className="px-8 py-4 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-all transform hover:scale-105 hover:shadow-xl"
              style={{ backgroundColor: '#e65100' }}
            >
              Start Your Journey Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="community" className="py-20 bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Success Stories from Our Creators
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of creators already earning from their designs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-6">
                  <div className="text-4xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.author}</div>
                    <div className="text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.products}</div>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="font-bold text-lg" style={{ color: '#e65100' }}>
                    {testimonial.earnings}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Ready to Turn Your Ideas Into Income?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of successful creators who are already designing and selling amazing merchandise. 
            Start your creative journey today - it's completely free!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={handleRegisterClick}
              className="px-10 py-4 bg-white text-orange-600 rounded-lg font-bold text-lg hover:bg-gray-50 transition-all transform hover:scale-105 hover:shadow-xl border-2 border-white"
            >
              Start Creating Free
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="px-10 py-4 border-2 border-white bg-transparent text-white rounded-lg font-bold text-lg hover:bg-white hover:text-orange-600 transition-all transform hover:scale-105"
            >
              Explore Products
              <Eye className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <p className="mt-6 text-white/80 text-sm">
            No credit card required • Start designing in 2 minutes • Join 50,000+ creators
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img src="/src/assets/junooni_logo_brand_color.png" alt="Junooni Logo" className="h-8" />
                <div className="text-sm text-gray-400">Creator Studio</div>
              </div>
              <p className="text-gray-400 max-w-sm">
                Empowering creators worldwide to design, create, and sell amazing merchandise with zero inventory risk.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-4">Platform</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Product Catalog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Upload Designs</a></li>
                <li><a href="https://junooni.com" className="hover:text-white transition-colors">Marketplace</a></li>
               
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-4">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Creator Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Junooni Creator Studio. All rights reserved. Made with ❤️ for creators.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JunooniLandingPage;