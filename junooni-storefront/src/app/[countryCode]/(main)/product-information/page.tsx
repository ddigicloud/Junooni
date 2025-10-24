'use client';

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, Package, Ruler, Shirt, 
  AlertCircle, Info, Shield, Star,
  RefreshCw, Truck, Search, Plus, Minus,
  CheckCircle, XCircle, Tag, Heart, Award,
  HelpCircle, Clock, ThumbsUp, Camera, Phone
} from "lucide-react";

const ProductInformationPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Quick links navigation
  const quickLinks = [
    { id: "product-details", title: "Product Details", icon: <Info size={20} /> },
    { id: "sizing", title: "Size Guide", icon: <Ruler size={20} /> },
    { id: "materials", title: "Materials & Care", icon: <Shirt size={20} /> },
    { id: "quality", title: "Quality Assurance", icon: <Award size={20} /> },
    { id: "availability", title: "Availability", icon: <Package size={20} /> },
    { id: "reviews", title: "Reviews & Ratings", icon: <Star size={20} /> },
    { id: "product-policy", title: "Product Policy", icon: <Shield size={20} /> },
    { id: "faqs", title: "FAQs", icon: <HelpCircle size={20} /> }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // FAQs
  const faqs = [
    {
      question: "How do I know if a product is authentic?",
      answer: "All products on Junooni are 100% authentic and sourced directly from authorized distributors or brands. Each product comes with authenticity guarantees, and we conduct quality checks before shipping."
    },
    {
      question: "What if the product doesn't match the description?",
      answer: "If the product you receive doesn't match the description or images, you can return it within 7 days for a full refund or replacement. Contact our support team immediately with photos of the product."
    },
    {
      question: "Can I see more photos of the product?",
      answer: "Each product page includes multiple high-resolution images from different angles. You can click on any image to zoom in and see details. Some products also include 360° view or customer photos."
    },
    {
      question: "How accurate are the product colors?",
      answer: "We strive to display colors as accurately as possible. However, slight variations may occur due to different screen settings. Each product includes a detailed color description to help you make an informed choice."
    },
    {
      question: "What does 'handpicked' mean?",
      answer: "Handpicked products are personally selected by our team for their unique quality, design, or cultural significance. These items go through an additional quality verification process."
    },
    {
      question: "Are product dimensions accurate?",
      answer: "Yes, all dimensions are measured carefully and displayed in centimeters/inches. Minor variations (±1-2cm) may occur in handcrafted items. Always refer to the size guide for best fit."
    },
    {
      question: "Can I request custom modifications to a product?",
      answer: "For certain products, we offer customization options which will be clearly mentioned on the product page. For special requests, contact our support team before placing your order."
    },
    {
      question: "How do I know if a product is in stock?",
      answer: "Product availability is shown on each product page. 'In Stock' means immediate shipping, 'Low Stock' means limited quantities, and 'Out of Stock' items can be added to your wishlist for restock notifications."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 py-4 bg-white shadow-sm">
        <div className="container px-4 mx-auto">
          <Link href="/" className="flex items-center">
            <ShoppingBag className="h-6 w-6 text-[#e65100] mr-2" />
            <span className="text-lg font-bold">JUNOONI</span>
          </Link>
        </div>
      </header>
      
      {/* Hero Section */}
      <div className="bg-[#e65100] text-white py-10 md:py-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white/20">
              <Package size={32} />
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">Product Information</h1>
            <p className="text-lg opacity-90">
              Everything you need to know about our products, quality, and authenticity
            </p>
          </div>
        </div>
      </div>
      
      <main className="container px-4 py-8 mx-auto md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
            <div className="p-6 text-center bg-white border-t-4 border-blue-500 rounded-lg shadow-sm">
              <Ruler size={32} className="mx-auto mb-3 text-blue-600" />
              <h3 className="mb-2 font-bold text-gray-900">Size Guide</h3>
              <p className="mb-3 text-sm text-gray-600">Find your perfect fit</p>
              <button 
                onClick={() => scrollToSection('sizing')}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                View Guide →
              </button>
            </div>
            
            <div className="p-6 text-center bg-white border-t-4 border-orange-500 rounded-lg shadow-sm">
              <Shirt size={32} className="mx-auto mb-3 text-orange-600" />
              <h3 className="mb-2 font-bold text-gray-900">Materials & Care</h3>
              <p className="mb-3 text-sm text-gray-600">Keep your products lasting longer</p>
              <button 
                onClick={() => scrollToSection('materials')}
                className="text-sm font-medium text-orange-600 hover:underline"
              >
                Learn More →
              </button>
            </div>
            
            <div className="p-6 text-center bg-white border-t-4 border-green-500 rounded-lg shadow-sm">
              <Award size={32} className="mx-auto mb-3 text-green-600" />
              <h3 className="mb-2 font-bold text-gray-900">Quality Promise</h3>
              <p className="mb-3 text-sm text-gray-600">Authentic, verified products</p>
              <button 
                onClick={() => scrollToSection('quality')}
                className="text-sm font-medium text-green-600 hover:underline"
              >
                Our Promise →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Sidebar Navigation - Hidden on mobile */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky p-4 bg-white rounded-lg shadow-sm top-24">
                <h3 className="mb-4 font-bold text-gray-900">Quick Navigation</h3>
                <nav className="space-y-2">
                  {quickLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => scrollToSection(link.id)}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#e65100] hover:bg-orange-50 px-3 py-2 rounded-md transition-colors w-full text-left"
                    >
                      {link.icon}
                      <span>{link.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="space-y-8">
                
                {/* 1. Product Details */}
                <section id="product-details" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Info size={24} className="text-[#e65100]" />
                    Understanding Product Details
                  </h2>
                  
                  <p className="mb-6 text-gray-600">
                    Each product on Junooni comes with comprehensive information to help you make informed decisions.
                  </p>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">What's Included in Product Descriptions:</h3>
                  <div className="mb-6 space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Detailed Specifications</p>
                        <p className="text-sm text-gray-600">Dimensions, weight, materials, and technical details</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">High-Resolution Images</p>
                        <p className="text-sm text-gray-600">Multiple angles, zoom capability, and real-life context shots</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Key Features</p>
                        <p className="text-sm text-gray-600">Unique selling points and product highlights</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Usage Instructions</p>
                        <p className="text-sm text-gray-600">How to use, wear, or display the product</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">How to Read Product Tags:</h3>
                  <div className="p-4 space-y-2 text-sm border border-blue-200 rounded-lg bg-blue-50">
                    <p><span className="font-semibold text-blue-900">✓ Handpicked:</span> Personally curated by our team for quality and uniqueness</p>
                    <p><span className="font-semibold text-blue-900">✓ Best Seller:</span> Popular choice among customers</p>
                    <p><span className="font-semibold text-blue-900">✓ New Arrival:</span> Recently added to our collection</p>
                    <p><span className="font-semibold text-blue-900">✓ Limited Edition:</span> Available in limited quantities</p>
                    <p><span className="font-semibold text-blue-900">✓ Artisan Made:</span> Handcrafted by skilled artisans</p>
                  </div>
                </section>

                {/* 2. Size Guide */}
                <section id="sizing" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Ruler size={24} className="text-[#e65100]" />
                    Size Guide & Measurements
                  </h2>
                  
                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded-r-lg mb-6">
                    <p className="text-sm text-gray-700">
                      <strong>Pro Tip:</strong> Always check the specific size chart on each product page, as sizing may vary between brands and product types.
                    </p>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">How to Measure:</h3>
                  
                  <div className="mb-6 space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="mb-2 font-semibold text-gray-900">For Clothing:</h4>
                      <ul className="ml-4 space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">•</span>
                          <span><strong>Chest:</strong> Measure around the fullest part of your chest</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">•</span>
                          <span><strong>Waist:</strong> Measure around your natural waistline</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">•</span>
                          <span><strong>Hips:</strong> Measure around the widest part of your hips</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">•</span>
                          <span><strong>Length:</strong> Measure from shoulder to desired hem length</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="mb-2 font-semibold text-gray-900">For Jewelry:</h4>
                      <ul className="ml-4 space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">•</span>
                          <span><strong>Ring Size:</strong> Measure the inner diameter of a well-fitting ring</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">•</span>
                          <span><strong>Bracelet:</strong> Measure wrist circumference and add 1-2cm for comfort</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">•</span>
                          <span><strong>Necklace Length:</strong> Standard lengths range from 16" (choker) to 24" (long)</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="mb-2 font-semibold text-gray-900">For Home Decor:</h4>
                      <ul className="ml-4 space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">•</span>
                          <span>All dimensions are listed as Length × Width × Height</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">•</span>
                          <span>Measurements include any protruding parts or decorative elements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">•</span>
                          <span>Consider clearance space needed around the item</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> Handcrafted items may have slight variations (±1-2cm) due to their artisanal nature. This adds to their unique charm and authenticity.
                    </p>
                  </div>
                </section>

                {/* 3. Materials & Care */}
                <section id="materials" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Shirt size={24} className="text-[#e65100]" />
                    Materials & Care Instructions
                  </h2>
                  
                  <p className="mb-6 text-gray-600">
                    Understanding materials helps you care for your products properly and ensures they last longer.
                  </p>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Common Materials We Use:</h3>
                  
                  <div className="grid gap-4 mb-6 md:grid-cols-2">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <Shirt size={18} className="text-[#e65100]" />
                        Cotton & Natural Fibers
                      </h4>
                      <p className="mb-2 text-sm text-gray-600">Breathable, soft, and comfortable. Perfect for everyday wear.</p>
                      <p className="text-xs text-gray-500"><strong>Care:</strong> Machine wash cold, tumble dry low, iron on medium heat</p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <Star size={18} className="text-[#e65100]" />
                        Silk & Premium Fabrics
                      </h4>
                      <p className="mb-2 text-sm text-gray-600">Luxurious, delicate, and elegant. Requires gentle care.</p>
                      <p className="text-xs text-gray-500"><strong>Care:</strong> Hand wash or dry clean, avoid direct sunlight, iron on low</p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <Award size={18} className="text-[#e65100]" />
                        Metals & Jewelry
                      </h4>
                      <p className="mb-2 text-sm text-gray-600">Sterling silver, brass, copper - each with unique properties.</p>
                      <p className="text-xs text-gray-500"><strong>Care:</strong> Clean with soft cloth, avoid water/chemicals, store separately</p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <Package size={18} className="text-[#e65100]" />
                        Wood & Ceramics
                      </h4>
                      <p className="mb-2 text-sm text-gray-600">Natural, durable materials for home decor and utility items.</p>
                      <p className="text-xs text-gray-500"><strong>Care:</strong> Wipe with damp cloth, avoid harsh chemicals, keep dry</p>
                    </div>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">General Care Tips:</h3>
                  <div className="p-4 space-y-2 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Always check the care label on each product before cleaning</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Store products in a cool, dry place away from direct sunlight</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">For handcrafted items, gentle care preserves their artisanal quality</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Contact us if you need specific care instructions for any product</p>
                    </div>
                  </div>
                </section>

                {/* 4. Quality Assurance */}
                <section id="quality" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Award size={24} className="text-[#e65100]" />
                    Our Quality Promise
                  </h2>
                  
                  <div className="p-4 mb-6 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                    <p className="text-sm text-gray-700">
                      <strong>100% Authentic Guarantee:</strong> Every product on Junooni is authentic, sourced ethically, and verified for quality.
                    </p>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Our Quality Standards:</h3>
                  <div className="mb-6 space-y-4">
                    <div className="flex items-start gap-3 p-4 border-l-4 border-[#e65100] bg-orange-50 rounded-r-lg">
                      <Shield size={24} className="text-[#e65100] flex-shrink-0" />
                      <div>
                        <h4 className="mb-1 font-semibold text-gray-900">Authenticity Verification</h4>
                        <p className="text-sm text-gray-600">All products are sourced from authorized distributors, brands, or verified artisans. We maintain certificates of authenticity for premium items.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 border-l-4 border-blue-600 rounded-r-lg bg-blue-50">
                      <CheckCircle size={24} className="flex-shrink-0 text-blue-600" />
                      <div>
                        <h4 className="mb-1 font-semibold text-gray-900">Quality Inspection</h4>
                        <p className="text-sm text-gray-600">Every item undergoes a thorough quality check before shipping. We inspect for defects, verify specifications, and ensure products meet our standards.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 border-l-4 border-purple-600 rounded-r-lg bg-purple-50">
                      <ThumbsUp size={24} className="flex-shrink-0 text-purple-600" />
                      <div>
                        <h4 className="mb-1 font-semibold text-gray-900">Artisan Partnership</h4>
                        <p className="text-sm text-gray-600">We work directly with skilled artisans, ensuring fair trade practices and supporting traditional craftsmanship while maintaining quality.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 border-l-4 border-green-600 rounded-r-lg bg-green-50">
                      <Award size={24} className="flex-shrink-0 text-green-600" />
                      <div>
                        <h4 className="mb-1 font-semibold text-gray-900">Customer Satisfaction</h4>
                        <p className="text-sm text-gray-600">If you're not satisfied with the quality, we offer hassle-free returns within 7 days. Your satisfaction is our priority.</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">What Sets Us Apart:</h3>
                  <ul className="ml-4 space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 font-bold text-orange-600">•</span>
                      <span>Direct partnerships with brands and artisans eliminate middlemen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 font-bold text-orange-600">•</span>
                      <span>Transparent sourcing - we share the story behind each product</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 font-bold text-orange-600">•</span>
                      <span>Sustainable practices and eco-friendly packaging whenever possible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 font-bold text-orange-600">•</span>
                      <span>Regular quality audits and customer feedback integration</span>
                    </li>
                  </ul>
                </section>

                {/* 5. Availability */}
                <section id="availability" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Package size={24} className="text-[#e65100]" />
                    Product Availability
                  </h2>
                  
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Stock Status Indicators:</h3>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-start gap-3 p-3 border border-green-200 rounded-lg bg-green-50">
                      <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">In Stock</p>
                        <p className="text-sm text-gray-600">Available for immediate purchase and shipping. Usually ships within 1-2 business days.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                      <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Low Stock</p>
                        <p className="text-sm text-gray-600">Limited quantities available. Order soon to avoid missing out. We may not restock this item.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border border-red-200 rounded-lg bg-red-50">
                      <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Out of Stock</p>
                        <p className="text-sm text-gray-600">Currently unavailable. Add to wishlist to get notified when it's back in stock.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
                      <Clock size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Pre-Order</p>
                        <p className="text-sm text-gray-600">Available for pre-order. Expected delivery date will be shown on the product page.</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Restock Notifications:</h3>
                  <ol className="mb-6 ml-4 space-y-2 text-gray-600 list-decimal list-inside">
                    <li>Click "Notify Me" button on the out-of-stock product page</li>
                    <li>Enter your email address</li>
                    <li>Receive instant notification when the item is back in stock</li>
                    <li>Stock is limited, so act fast when you get the notification!</li>
                  </ol>

                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded-r-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Limited Edition Note:</strong> Products marked as "Limited Edition" are produced in small batches and may not be restocked once sold out. We recommend purchasing these items as soon as you see them.
                    </p>
                  </div>
                </section>

                {/* 6. Reviews & Ratings */}
                <section id="reviews" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Star size={24} className="text-[#e65100]" />
                    Reviews & Ratings
                  </h2>
                  
                  <p className="mb-6 text-gray-600">
                    Customer reviews help you make informed decisions and help us improve our products and services.
                  </p>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">How Our Rating System Works:</h3>
                  <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="space-y-2 text-sm">
                      <p><strong className="text-blue-900">⭐⭐⭐⭐⭐ (5 stars):</strong> Excellent - Exceeds expectations</p>
                      <p><strong className="text-blue-900">⭐⭐⭐⭐ (4 stars):</strong> Very Good - Meets expectations</p>
                      <p><strong className="text-blue-900">⭐⭐⭐ (3 stars):</strong> Good - Average experience</p>
                      <p><strong className="text-blue-900">⭐⭐ (2 stars):</strong> Fair - Below expectations</p>
                      <p><strong className="text-blue-900">⭐ (1 star):</strong> Poor - Unsatisfactory</p>
                    </div>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Leaving a Review:</h3>
                  <ol className="mb-6 ml-4 space-y-2 text-gray-600 list-decimal list-inside">
                    <li>You must have purchased and received the product to leave a review</li>
                    <li>Go to "My Orders" and select the product you want to review</li>
                    <li>Click "Write a Review"</li>
                    <li>Rate the product (1-5 stars) and write your experience</li>
                    <li>You can also upload photos of the product (optional but helpful!)</li>
                    <li>Submit your review - it will be visible after verification (24-48 hours)</li>
                  </ol>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Review Guidelines:</h3>
                  <div className="grid gap-4 mb-6 md:grid-cols-2">
                    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-green-900">
                        <CheckCircle size={18} />
                        Helpful Reviews Include:
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>✓ Honest opinions about quality</li>
                        <li>✓ Fit and sizing accuracy</li>
                        <li>✓ Material and build quality</li>
                        <li>✓ Value for money</li>
                        <li>✓ Photos of the actual product</li>
                      </ul>
                    </div>

                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-red-900">
                        <XCircle size={18} />
                        Please Avoid:
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>✗ Offensive language or personal attacks</li>
                        <li>✗ Spam or promotional content</li>
                        <li>✗ Complaints about shipping (use separate channel)</li>
                        <li>✗ Reviews for wrong products</li>
                        <li>✗ Duplicate reviews</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <p className="text-sm text-gray-700">
                      <strong>Verified Purchase Badge:</strong> Reviews marked with "Verified Purchase" are from customers who bought the product through Junooni, giving you extra confidence in their authenticity.
                    </p>
                  </div>
                </section>

                {/* 7. Product Policy */}
                <section id="product-policy" className="p-6 bg-white rounded-lg shadow-sm md:p-8 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Shield size={24} className="text-[#e65100]" />
                    Product Policy
                  </h2>
                  
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Return & Exchange Policy:</h3>
                  <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <span><strong>7-Day Return Window:</strong> Return unused products within 7 days of delivery</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Condition:</strong> Products must be in original condition with tags attached</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Free Returns:</strong> We provide free return pickup for most products</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Refund:</strong> Full refund to original payment method within 5-7 business days</span>
                      </li>
                    </ul>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Non-Returnable Items:</h3>
                  <ul className="mb-6 ml-4 space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <XCircle size={16} className="flex-shrink-0 mt-1 text-red-600" />
                      <span>Customized or personalized products</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle size={16} className="flex-shrink-0 mt-1 text-red-600" />
                      <span>Intimate wear and undergarments (hygiene reasons)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle size={16} className="flex-shrink-0 mt-1 text-red-600" />
                      <span>Items marked as "Final Sale" or "Non-Returnable"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle size={16} className="flex-shrink-0 mt-1 text-red-600" />
                      <span>Products with broken seals or tampered packaging</span>
                    </li>
                  </ul>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Damaged or Defective Products:</h3>
                  <div className="p-4 mb-6 border-l-4 border-red-500 rounded-r-lg bg-red-50">
                    <p className="mb-3 text-sm text-gray-700">
                      If you receive a damaged or defective product, contact us within 48 hours with photos:
                    </p>
                    <ol className="ml-2 space-y-1 text-sm text-gray-700 list-decimal list-inside">
                      <li>Take clear photos of the damage/defect</li>
                      <li>Contact support via email or phone</li>
                      <li>We'll arrange free pickup and provide replacement or refund</li>
                      <li>No questions asked - your satisfaction is guaranteed</li>
                    </ol>
                  </div>

                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Warranty Information:</h3>
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <p className="mb-2 text-sm text-gray-700">
                      Selected products come with manufacturer warranties. Check individual product pages for warranty details including:
                    </p>
                    <ul className="ml-4 space-y-1 text-sm text-gray-700">
                      <li>• Warranty duration (typically 6 months to 1 year)</li>
                      <li>• What's covered (manufacturing defects, material issues)</li>
                      <li>• Claim process and required documentation</li>
                      <li>• Service center locations or contact information</li>
                    </ul>
                  </div>
                </section>

                {/* 8. FAQs */}
                <section id="faqs" className="scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <HelpCircle size={24} className="text-[#e65100]" />
                    Frequently Asked Questions
                  </h2>
                  
                  <div className="space-y-3">
                    {faqs.map((faq, index) => (
                      <div 
                        key={index} 
                        className="overflow-hidden border border-gray-200 rounded-lg"
                      >
                        <button
                          onClick={() => toggleFaq(index)}
                          className="flex items-center justify-between w-full px-4 py-3 font-medium text-left transition-colors hover:bg-gray-50"
                        >
                          <span className="text-gray-900">{faq.question}</span>
                          {expandedFaq === index ? 
                            <Minus size={18} className="flex-shrink-0 text-[#e65100]" /> : 
                            <Plus size={18} className="flex-shrink-0 text-gray-400" />
                          }
                        </button>
                        {expandedFaq === index && (
                          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                            <p className="text-sm text-gray-600">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Contact Support */}
                <div className="pt-6 mt-8 border-t border-gray-200">
                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-6 rounded-r-lg">
                    <h3 className="flex items-center gap-2 mb-4 font-bold text-gray-900">
                      <Info size={24} className="text-[#e65100]" />
                      Have Questions About a Specific Product?
                    </h3>
                    
                    <p className="mb-4 text-gray-700">
                      Our product experts are here to help you find the perfect item and answer any questions.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Camera size={20} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Email Us</p>
                          <a href="mailto:products@junooni.com" className="text-[#e65100] hover:underline">
                            products@junooni.com
                          </a>
                          <p className="mt-1 text-xs text-gray-600">Response within 24 hours</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Phone size={20} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Call Us</p>
                          <a href="tel:+918694062222" className="text-[#e65100] hover:underline">
                            +91 8694062222
                          </a>
                          <p className="mt-1 text-xs text-gray-600">Monday-Friday, 10:00 AM - 6:00 PM IST</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back to Top Button */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="mt-6 w-full md:w-auto mx-auto flex items-center justify-center gap-2 bg-[#e65100] text-white px-6 py-3 rounded-lg hover:bg-[#d84315] transition-colors"
              >
                Back to Top
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      {/* <footer className="py-6 mt-12 bg-white border-t">
        <div className="container px-4 mx-auto text-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Junooni. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <Link href="/terms" className="text-sm text-gray-500 hover:text-[#e65100]">Terms & Conditions</Link>
            <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-[#e65100]">Privacy Policy</Link>
            <Link href="/product-info" className="text-sm text-[#e65100] font-medium">Product Information</Link>
            <Link href="/help" className="text-sm text-gray-500 hover:text-[#e65100]">Help Center</Link>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default ProductInformationPage;