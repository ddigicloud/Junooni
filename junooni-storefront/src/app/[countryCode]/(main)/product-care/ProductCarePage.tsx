'use client';

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, Shirt, Droplets, Wind, Flame, 
  Sun, Snowflake, AlertCircle, CheckCircle, 
  Package, Sparkles, Heart, Shield, Info,
  Scissors, Archive, ThermometerSun, WashingMachine
} from "lucide-react";

const ProductCarePage = () => {
  const [activeCategory, setActiveCategory] = useState('apparel');

  // Quick links navigation
  const quickLinks = [
    { id: "apparel", title: "Apparel Care", icon: <Shirt size={20} /> },
    { id: "printed-items", title: "Printed Items", icon: <Sparkles size={20} /> },
    { id: "accessories", title: "Accessories", icon: <Package size={20} /> },
    { id: "special-materials", title: "Special Materials", icon: <Shield size={20} /> },
    { id: "storage", title: "Storage Tips", icon: <Archive size={20} /> },
    { id: "dos-donts", title: "Do's & Don'ts", icon: <AlertCircle size={20} /> }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Product categories for tabs
  const productCategories = [
    { id: 'apparel', name: 'Apparel', icon: <Shirt size={20} /> },
    { id: 'hoodies', name: 'Hoodies & Sweatshirts', icon: <Wind size={20} /> },
    { id: 'accessories', name: 'Accessories', icon: <Package size={20} /> },
    { id: 'special', name: 'Special Items', icon: <Sparkles size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <header className="bg-white shadow-sm py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <Link href="/" className="flex items-center">
            <ShoppingBag className="h-6 w-6 text-[#e65100] mr-2" />
            <span className="font-bold text-lg">JUNOONI</span>
          </Link>
        </div>
      </header> */}
      
      {/* Hero Section */}
      <div className="bg-[#e65100] text-white py-10 md:py-12 mt-8 md:mt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Heart size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Product Care Guide</h1>
            <p className="text-lg opacity-90">
              Keep your merchandise looking fresh and lasting longer with our care tips.
            </p>
          </div>
        </div>
      </div>
      
      <main className="mx-auto px-3 md:px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Quick Care Tips Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4 text-center border-t-4 border-blue-500">
              <Droplets size={32} className="mx-auto text-blue-500 mb-2" />
              <h3 className="font-bold text-gray-900 text-sm mb-1">Wash Cold</h3>
              <p className="text-xs text-gray-600">Use cold water to preserve colors</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 text-center border-t-4 border-green-500">
              <Wind size={32} className="mx-auto text-green-500 mb-2" />
              <h3 className="font-bold text-gray-900 text-sm mb-1">Air Dry</h3>
              <p className="text-xs text-gray-600">Hang or lay flat to dry</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 text-center border-t-4 border-orange-500">
              <Flame size={32} className="mx-auto text-orange-500 mb-2" />
              <h3 className="font-bold text-gray-900 text-sm mb-1">Low Heat</h3>
              <p className="text-xs text-gray-600">Iron inside-out on low setting</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 text-center border-t-4 border-purple-500">
              <AlertCircle size={32} className="mx-auto text-purple-500 mb-2" />
              <h3 className="font-bold text-gray-900 text-sm mb-1">No Bleach</h3>
              <p className="text-xs text-gray-600">Avoid harsh chemicals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation - Hidden on mobile */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
                <h3 className="font-bold mb-4 text-gray-900">Quick Navigation</h3>
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
              <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
                
                {/* Introduction */}
                <section className="mb-8">
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Your Junooni merchandise is made with quality materials and care. Follow these guidelines to keep your 
                    products looking their best and extend their lifespan. Proper care ensures vibrant colors, sharp prints, 
                    and lasting comfort.
                  </p>

                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded">
                    <p className="text-sm text-gray-700 flex items-start gap-2">
                      <Info size={20} className="text-[#e65100] flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Important:</strong> Always check the care label inside your product for specific instructions. 
                        Different materials and prints may require special care.
                      </span>
                    </p>
                  </div>
                </section>

                {/* 1. Apparel Care (T-Shirts, Shirts) */}
                <section id="apparel" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <Shirt size={24} className="text-[#e65100]" />
                    General Apparel Care
                  </h2>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    For t-shirts, shirts, and other standard clothing items:
                  </p>

                  <div className="space-y-4 mb-6">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        <Droplets size={24} className="text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Washing Instructions</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Turn garments inside-out before washing to protect prints and colors</li>
                            <li>• Wash in cold water (30°C/86°F or below) with similar colors</li>
                            <li>• Use mild detergent - avoid bleach or harsh chemicals</li>
                            <li>• Machine wash on gentle/delicate cycle</li>
                            <li>• Wash dark colors separately for the first few washes</li>
                            <li>• Close all zippers and buttons to prevent snagging</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        <Wind size={24} className="text-green-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Drying Instructions</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Air dry whenever possible - hang or lay flat</li>
                            <li>• Avoid direct sunlight to prevent fading</li>
                            <li>• If using a dryer, use low heat setting</li>
                            <li>• Remove from dryer while slightly damp to prevent shrinkage</li>
                            <li>• Never wring or twist wet garments</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        <Flame size={24} className="text-orange-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Ironing Instructions</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Iron inside-out to protect prints and graphics</li>
                            <li>• Use low to medium heat setting</li>
                            <li>• Never iron directly on printed areas</li>
                            <li>• Use a pressing cloth if needed</li>
                            <li>• Steam is usually safe for most fabrics</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Pro Tip:</strong> For the first wash, add a cup of white vinegar to help set the colors and 
                      prevent bleeding. This is especially important for vibrant or dark-colored items.
                    </p>
                  </div>
                </section>

                {/* 2. Printed Items (Screen Print, DTG, etc.) */}
                <section id="printed-items" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <Sparkles size={24} className="text-[#e65100]" />
                    Printed & Graphic Items
                  </h2>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Items with prints, graphics, or embroidery require special attention to maintain their quality:
                  </p>

                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Essential Print Care Rules</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Always wash inside-out</strong> - This is the most important step for print longevity</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Cold water only</strong> - Hot water can cause prints to crack or peel</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Gentle cycle</strong> - Reduces friction that can damage prints</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Air dry preferred</strong> - Heat from dryers can deteriorate print quality</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span><strong>Never iron prints directly</strong> - Always iron from the inside or use a cloth barrier</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Print Types & Special Care</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-1">Screen Printed Graphics</h4>
                      <p className="text-sm text-gray-600">
                        Durable and long-lasting. Wash inside-out in cold water. Avoid fabric softeners as they can break 
                        down the ink over time.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-1">Direct-to-Garment (DTG) Prints</h4>
                      <p className="text-sm text-gray-600">
                        Soft and detailed prints. Extra gentle care needed. Wash inside-out on delicate cycle, air dry only, 
                        and avoid direct heat.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-1">Embroidered Items</h4>
                      <p className="text-sm text-gray-600">
                        Very durable. Can be washed normally, but turn inside-out to protect threads. Avoid excessive heat 
                        when drying or ironing.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-1">Vinyl/Heat Transfer Prints</h4>
                      <p className="text-sm text-gray-600">
                        Requires gentle care. Always wash inside-out in cold water. Air dry or tumble dry on lowest setting. 
                        Never iron directly on the print.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 3. Hoodies and Sweatshirts */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <Wind size={24} className="text-[#e65100]" />
                    Hoodies & Sweatshirts
                  </h2>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Heavier garments like hoodies and sweatshirts need special attention:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="border-l-4 border-[#e65100] pl-4 bg-orange-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Before Washing</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Turn inside-out</li>
                        <li>• Zip up all zippers</li>
                        <li>• Tie drawstrings to prevent tangling</li>
                        <li>• Empty all pockets</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-[#e65100] pl-4 bg-orange-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Washing</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Cold water on gentle cycle</li>
                        <li>• Use mild detergent</li>
                        <li>• Wash with similar colors</li>
                        <li>• Don't overload the machine</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-[#e65100] pl-4 bg-orange-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Drying</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Air dry by hanging or laying flat</li>
                        <li>• Reshape while damp</li>
                        <li>• If using dryer: low heat, remove promptly</li>
                        <li>• Avoid over-drying to prevent shrinkage</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-[#e65100] pl-4 bg-orange-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Maintenance</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Remove pilling with fabric shaver</li>
                        <li>• Store folded or hanging</li>
                        <li>• Steam to remove wrinkles</li>
                        <li>• Spot clean small stains when possible</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Important:</strong> Hoodies with prints or graphics should NEVER be dried on high heat. The 
                      combination of heavy fabric and heat can cause prints to crack or peel prematurely.
                    </p>
                  </div>
                </section>

                {/* 4. Accessories */}
                <section id="accessories" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <Package size={24} className="text-[#e65100]" />
                    Accessories Care
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircle size={20} className="text-[#e65100]" />
                        Caps & Hats
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Hand wash or spot clean only. Use mild soap and cold water. Air dry on a towel or form to maintain 
                        shape. Never put caps in washing machine or dryer.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircle size={20} className="text-[#e65100]" />
                        Bags & Backpacks
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Spot clean with damp cloth. For deeper cleaning, hand wash in cold water with mild detergent. Air dry 
                        completely before use. Empty all pockets before cleaning.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircle size={20} className="text-[#e65100]" />
                        Stickers & Decals
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Clean surface before applying. Press firmly and smooth out bubbles. Once applied, wipe gently with 
                        damp cloth. Avoid harsh chemicals and abrasive cleaners.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircle size={20} className="text-[#e65100]" />
                        Phone Cases & Tech Accessories
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Wipe with soft, slightly damp cloth. Use isopropyl alcohol for stubborn stains. Avoid excessive 
                        moisture near ports and openings. Air dry completely.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircle size={20} className="text-[#e65100]" />
                        Pins & Badges
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Wipe with soft cloth. Avoid water for enamel pins. Handle by edges to prevent fingerprints. Store 
                        in cool, dry place when not in use.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 5. Special Materials */}
                <section id="special-materials" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <Shield size={24} className="text-[#e65100]" />
                    Special Materials Guide
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">100% Cotton</h4>
                      <p className="text-sm text-gray-700">
                        Breathable and comfortable. May shrink slightly on first wash. Wash in cold water and reshape while 
                        damp. Can handle regular ironing.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Cotton Blends</h4>
                      <p className="text-sm text-gray-700">
                        Durable with less shrinkage. Wash in cold water. Resists wrinkles better than 100% cotton. Dry on 
                        low heat or air dry.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Polyester</h4>
                      <p className="text-sm text-gray-700">
                        Low maintenance and quick-drying. Wash in warm water. Can tumble dry on low. Avoid high heat as it 
                        can melt fibers or set stains.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Fleece</h4>
                      <p className="text-sm text-gray-700">
                        Soft and warm. Wash inside-out in cold water. Air dry or tumble dry on low. Use fabric softener 
                        sparingly to maintain softness.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Tri-Blend</h4>
                      <p className="text-sm text-gray-700">
                        Ultra-soft vintage feel. Delicate - wash in cold water on gentle cycle. Air dry recommended. Handle 
                        with extra care to maintain texture.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Performance/Athletic</h4>
                      <p className="text-sm text-gray-700">
                        Moisture-wicking materials. Wash in cold water after each use. Avoid fabric softeners - they clog 
                        moisture-wicking properties. Air dry.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 6. Storage Tips */}
                <section id="storage" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <Archive size={24} className="text-[#e65100]" />
                    Storage & Maintenance Tips
                  </h2>
                  
                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Proper Storage Techniques:</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Archive size={20} className="text-[#e65100] flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-gray-900 text-sm">Hanging vs. Folding</h5>
                          <p className="text-sm text-gray-600">
                            <strong>Hang:</strong> Button-up shirts, jackets, hoodies<br />
                            <strong>Fold:</strong> T-shirts, sweatshirts, sweaters (to prevent stretching)
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Sun size={20} className="text-[#e65100] flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-gray-900 text-sm">Avoid Direct Sunlight</h5>
                          <p className="text-sm text-gray-600">
                            Store in cool, dark place to prevent fading. UV rays can damage colors and prints over time.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Droplets size={20} className="text-[#e65100] flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-gray-900 text-sm">Keep Dry</h5>
                          <p className="text-sm text-gray-600">
                            Ensure items are completely dry before storing to prevent mildew and odors. Use moisture 
                            absorbers in humid climates.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Sparkles size={20} className="text-[#e65100] flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-gray-900 text-sm">Keep It Fresh</h5>
                          <p className="text-sm text-gray-600">
                            Use cedar blocks or lavender sachets to keep clothes fresh and protect from moths. Avoid 
                            mothballs with printed items.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Seasonal Storage</h4>
                    <p className="text-sm text-gray-700">
                      When storing seasonal items (like winter hoodies), wash first, then store in breathable garment bags 
                      or containers. Avoid plastic bags which can trap moisture. Add silica gel packets to prevent humidity 
                      damage.
                    </p>
                  </div>
                </section>

                {/* 7. Do's and Don'ts */}
                <section id="dos-donts" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <AlertCircle size={24} className="text-[#e65100]" />
                    Do's & Don'ts
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Do's */}
                    <div>
                      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                        <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                          <CheckCircle size={24} />
                          Always DO This
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span>Read and follow care labels</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span>Turn printed items inside-out before washing</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span>Use cold water for most items</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span>Separate colors, especially for first washes</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span>Air dry when possible</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span>Treat stains promptly</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span>Store properly in cool, dry place</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span>Use gentle/delicate cycle for printed items</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span>Remove items from washer/dryer promptly</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Don'ts */}
                    <div>
                      <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
                        <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                          <AlertCircle size={24} />
                          Never DO This
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">✗</span>
                            <span>Use bleach on colored or printed items</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">✗</span>
                            <span>Dry clean unless specifically stated</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">✗</span>
                            <span>Iron directly on prints or graphics</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">✗</span>
                            <span>Use high heat in dryer</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">✗</span>
                            <span>Overload washing machine</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">✗</span>
                            <span>Wring or twist wet garments</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">✗</span>
                            <span>Store in damp or humid areas</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">✗</span>
                            <span>Use fabric softener on performance fabrics</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold">✗</span>
                            <span>Leave wet items in machine overnight</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 8. Stain Removal Guide */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Stain Removal Guide</h2>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-4">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Golden Rule:</strong> Treat stains as soon as possible! The longer a stain sets, the harder 
                      it is to remove.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Food & Beverage Stains</h4>
                      <p className="text-sm text-gray-600">
                        Rinse with cold water immediately. Apply mild detergent or stain remover. Gently blot (don't rub). 
                        Wash as normal.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Oil & Grease Stains</h4>
                      <p className="text-sm text-gray-600">
                        Apply dish soap or chalk to absorb oil. Let sit for 5-10 minutes. Rinse with hot water. Wash in 
                        hottest water safe for fabric.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Ink Stains</h4>
                      <p className="text-sm text-gray-600">
                        Apply rubbing alcohol or hand sanitizer to stain. Blot with clean cloth. Repeat until stain lifts. 
                        Rinse and wash normally.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Sweat & Deodorant Marks</h4>
                      <p className="text-sm text-gray-600">
                        Mix baking soda with water to form paste. Apply to stain, let sit 30 minutes. Wash in cold water 
                        with vinegar added to rinse.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 bg-red-50 border border-red-200 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Warning:</strong> Never put stained items in the dryer before the stain is completely removed. 
                      Heat will set the stain permanently.
                    </p>
                  </div>
                </section>

                {/* 9. FAQ */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-gray-300 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-1">Will my item shrink?</h4>
                      <p className="text-sm text-gray-600">
                        Some shrinkage (typically 3-5%) is normal, especially with 100% cotton items. Wash in cold water 
                        and air dry to minimize shrinkage. Follow care instructions carefully.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-gray-300 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-1">How can I prevent fading?</h4>
                      <p className="text-sm text-gray-600">
                        Wash inside-out in cold water, use color-safe detergent, avoid direct sunlight when drying, and 
                        limit exposure to harsh chemicals. Adding vinegar to the first wash helps set colors.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-gray-300 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-1">Can I use fabric softener?</h4>
                      <p className="text-sm text-gray-600">
                        Use sparingly or avoid entirely on printed items and performance fabrics. Fabric softener can 
                        break down prints over time and reduce moisture-wicking properties.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-gray-300 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-1">How do I remove pilling?</h4>
                      <p className="text-sm text-gray-600">
                        Use a fabric shaver or sweater stone gently on affected areas. Prevent pilling by washing inside-out, 
                        using gentle cycle, and avoiding excessive friction.
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-gray-300 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-1">What if care instructions conflict?</h4>
                      <p className="text-sm text-gray-600">
                        Always follow the care label on your specific item - it supersedes general guidance. When in doubt, 
                        choose the most gentle option (cold water, air dry, low heat).
                      </p>
                    </div>
                  </div>
                </section>

                {/* Contact Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-4 rounded">
                    <h3 className="font-semibold text-gray-900 mb-2">Need More Help?</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      If you have specific questions about caring for your Junooni merchandise, our customer support team 
                      is here to help!
                    </p>
                    <Link 
                      href="/help" 
                      className="inline-flex items-center gap-2 text-[#e65100] font-medium hover:underline text-sm"
                    >
                      Contact Customer Support →
                    </Link>
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
      
    </div>
  );
};

export default ProductCarePage;