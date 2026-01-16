import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { 
  Palette, 
  Upload, 
  Type, 
  Layers, 
  Eye, 
  Sparkles,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Zap,
  Video,
  Download,
  MousePointer,
  Move,
  RotateCw,
  Maximize,
  Play,
  FileImage,
  ArrowRight,
  Lightbulb,
  Settings,
  Menu,
  X
} from 'lucide-react';
import junoonilogo from '/src/assets/junooni_logo_brand_color.png';

export default function CreatingProductsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHoveredRegister, setIsHoveredRegister] = useState(false);
  const [isHoveredLogin, setIsHoveredLogin] = useState(false);
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate({ to: '/sign-up' });
  };

  const handleLoginClick = () => {
    navigate({ to: '/sign-in' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* NAV - Mobile Optimized */}
      <nav className="fixed z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button onClick={() => navigate({ to: '/' })} className="flex items-center gap-2 sm:gap-3">
                <img src={junoonilogo} alt="Junooni" className="h-6 sm:h-8" />
                <span className="hidden text-xs font-semibold text-gray-700 sm:text-sm md:block">Creator Studio</span>
              </button>
            </div>

            <div className="items-center hidden gap-3 md:flex">
              <Button variant="ghost" onClick={() => navigate({ to: '/' })}>Home</Button>
              <Button variant="ghost" onClick={() => window.scrollTo({ top: document.getElementById('how-it-works')?.offsetTop || 0, behavior: 'smooth' })}>How it works</Button>
              <Button variant="outline" onClick={handleLoginClick} onMouseEnter={() => setIsHoveredLogin(true)} onMouseLeave={() => setIsHoveredLogin(false)}>
                Login {isHoveredLogin && <ArrowRight className="w-4 h-4 ml-2 animate-pulse" />}
              </Button>
              <Button onClick={handleRegisterClick} className="bg-[#e65100] text-white" onMouseEnter={() => setIsHoveredRegister(true)} onMouseLeave={() => setIsHoveredRegister(false)}>
                Start Selling {isHoveredRegister && <ArrowRight className="w-4 h-4 ml-2 animate-pulse" />}
              </Button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-gray-100">
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="py-4 border-t border-gray-100 md:hidden">
              <div className="flex flex-col gap-3 px-2">
                <Button variant="ghost" onClick={() => { setIsMenuOpen(false); navigate({ to: '/' }); }}>Home</Button>
                <Button variant="ghost" onClick={() => { setIsMenuOpen(false); handleLoginClick(); }}>Login</Button>
                <Button onClick={() => { setIsMenuOpen(false); handleRegisterClick(); }} className="bg-[#e65100] text-white">Start Selling</Button>
                <Button variant="ghost" onClick={() => { setIsMenuOpen(false); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>How it works</Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Add padding to account for fixed nav */}
      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20 text-white bg-gradient-to-r from-orange-600 to-orange-500">
          <div className="max-w-6xl px-6 mx-auto">
            <div className="max-w-3xl">
              <h1 className="mb-6 text-5xl font-bold">Create Stunning Products</h1>
              <p className="mb-8 text-xl text-orange-50">
                Learn how to design professional merchandise using our easy-to-use creator studio. 
                No design experience needed!
              </p>
              <a 
                href="#video-tutorial" 
                className="inline-flex items-center gap-3 px-8 py-4 text-lg font-bold text-orange-600 transition-colors bg-white rounded-lg hover:bg-orange-50"
              >
                <Play className="w-6 h-6" />
                Watch Video Tutorial
              </a>
            </div>
          </div>
        </section>

      {/* Video Tutorial Section */}
      <section id="video-tutorial" className="py-20 bg-gray-50 scroll-mt-20">
        <div className="max-w-5xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-red-700 bg-red-100 rounded-full">
              <Video className="w-5 h-5" />
              <span className="font-semibold">Video Tutorial</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Watch & Learn</h2>
            <p className="text-xl text-gray-600">
              Follow along with our step-by-step video guide to create your first product
            </p>
          </div>

          {/* YouTube Video Embed */}
          <div className="overflow-hidden bg-white shadow-2xl rounded-2xl">
            <div className="relative flex items-center justify-center bg-gray-900 aspect-video">
              {/* YouTube iframe - MUST come after fallback to be on top */}
              <div className="absolute inset-0 z-10 bg-gradient-to-br from-orange-600 to-orange-500">
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <Play className="w-20 h-20 mx-auto mb-4 text-white" />
                    <p className="text-xl font-semibold text-white">Product Creation Tutorial</p>
                  </div>
                </div>
              </div>
              {/* Actual iframe - higher z-index to appear on top */}
              <iframe
                className="absolute inset-0 z-20 w-full h-full"
                src="https://www.youtube.com/embed/ot3yhQVVmv4"
                title="Junooni Product Creation Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-8">
              <h3 className="mb-3 text-2xl font-bold text-gray-900">Complete Design Studio Tutorial</h3>
              <p className="mb-6 text-gray-600">
                In this comprehensive tutorial, you'll learn everything from uploading your designs to 
                previewing mockups and publishing your products. Perfect for beginners!
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 text-sm font-semibold text-orange-700 bg-orange-100 rounded-full">
                  Beginner Friendly
                </span>
                <span className="px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
                  10 Minutes
                </span>
                <span className="px-4 py-2 text-sm font-semibold text-green-700 bg-green-100 rounded-full">
                  Step-by-Step
                </span>
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="grid gap-6 mt-8 md:grid-cols-3">
            <a href="https://youtube.com/@bejunooni?si=p96lWYtfDUMhsII3" target="_blank" rel="noopener noreferrer" 
               className="p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Video className="w-6 h-6 text-red-600" />
                </div>
                <h4 className="font-bold text-gray-900">YouTube Channel</h4>
              </div>
              <p className="mb-2 text-sm text-gray-600">Subscribe for more tutorials and tips</p>
              <span className="text-sm font-semibold text-orange-600 group-hover:underline">
                Visit Channel →
              </span>
            </a>

            <a href="#design-tips" 
               className="p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-bold text-gray-900">Design Tips</h4>
              </div>
              <p className="mb-2 text-sm text-gray-600">Best practices for great designs</p>
              <span className="text-sm font-semibold text-orange-600 group-hover:underline">
                Read Tips →
              </span>
            </a>

            <a href="#troubleshooting" 
               className="p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900">Troubleshooting</h4>
              </div>
              <p className="mb-2 text-sm text-gray-600">Common issues and solutions</p>
              <span className="text-sm font-semibold text-orange-600 group-hover:underline">
                Get Help →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Design Studio Overview</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Our creator studio gives you everything you need to design professional merchandise
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-2xl">
                <Upload className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">Upload Designs</h3>
              <p className="text-sm text-gray-600">Import your artwork, logos, or photos</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-2xl">
                <Type className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">Add Text</h3>
              <p className="text-sm text-gray-600">Use hundreds of fonts and customization options</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-green-100 rounded-2xl">
                <Eye className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">Preview Mockups</h3>
              <p className="text-sm text-gray-600">See realistic product visualizations</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-purple-100 rounded-2xl">
                <Sparkles className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">Publish</h3>
              <p className="text-sm text-gray-600">Launch products to your store instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Step-by-Step Guide</h2>
            <p className="text-xl text-gray-600">Follow these steps to create your first product</p>
          </div>

          <div className="space-y-12">
            {/* Step 1: Choose a Product */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl">
                    <span className="text-3xl font-bold text-orange-600">1</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">Choose Your Product</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Start by selecting the product you want to design. Browse our catalog and pick the perfect canvas for your creativity.
                  </p>
                  
                  <div className="p-6 mb-6 border-l-4 border-orange-500 rounded-lg bg-orange-50">
                    <h4 className="flex items-center gap-2 mb-3 font-bold text-gray-900">
                      <Lightbulb className="w-5 h-5 text-orange-600" />
                      Popular Starting Products
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="p-3 text-sm bg-white rounded-lg">
                        <strong className="text-gray-900">T-Shirts:</strong>
                        <span className="text-gray-600"> Perfect for text-based designs and logos</span>
                      </div>
                      <div className="p-3 text-sm bg-white rounded-lg">
                        <strong className="text-gray-900">Hoodies:</strong>
                        <span className="text-gray-600"> Great for bold artwork and graphics</span>
                      </div>
                      <div className="p-3 text-sm bg-white rounded-lg">
                        <strong className="text-gray-900">Mugs:</strong>
                        <span className="text-gray-600"> Ideal for photos and wrapped designs</span>
                      </div>
                      <div className="p-3 text-sm bg-white rounded-lg">
                        <strong className="text-gray-900">Phone Cases:</strong>
                        <span className="text-gray-600"> Best for compact, detailed designs</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-green-600" />
                      <span className="text-gray-700">Click "Create New Product" from your dashboard</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-green-600" />
                      <span className="text-gray-700">Browse product categories (Apparel, Accessories, Home & Living)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-green-600" />
                      <span className="text-gray-700">Select your product and choose color/size options</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Upload Your Design */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl">
                    <span className="text-3xl font-bold text-orange-600">2</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">Upload Your Design</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Import your artwork, logo, photo, or any image you want to print on your product.
                  </p>

                  <div className="grid gap-6 mb-6 md:grid-cols-2">
                    <div className="p-6 bg-blue-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <Upload className="w-6 h-6 text-blue-600" />
                        <h4 className="font-bold text-gray-900">How to Upload</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          Click the "Upload Image" button
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          Select files from your computer
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          Or drag and drop files directly
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          Multiple uploads supported
                        </li>
                      </ul>
                    </div>

                    <div className="p-6 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <FileImage className="w-6 h-6 text-green-600" />
                        <h4 className="font-bold text-gray-900">Supported Formats</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          PNG (recommended for transparency)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          JPG/JPEG (photos and artwork)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          SVG (vector graphics)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          Max file size: 50MB
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 border-l-4 border-yellow-500 rounded-lg bg-yellow-50">
                    <div className="flex gap-3">
                      <AlertCircle className="flex-shrink-0 w-6 h-6 text-yellow-600" />
                      <div>
                        <h4 className="mb-2 font-bold text-gray-900">Image Quality Requirements</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li><strong>Minimum resolution:</strong> 300 DPI (dots per inch)</li>
                          <li><strong>Recommended size:</strong> 4500 x 5400 pixels for best quality</li>
                          <li><strong>Our system will alert you</strong> if your image resolution is too low</li>
                          <li><strong>Tip:</strong> Larger is better - you can always scale down!</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Position & Edit */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl">
                    <span className="text-3xl font-bold text-orange-600">3</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">Position & Edit Your Design</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Use our intuitive tools to perfect your design placement and appearance.
                  </p>

                  <div className="grid gap-4 mb-6 md:grid-cols-2">
                    <div className="p-5 transition-colors bg-white border-2 border-gray-200 rounded-xl hover:border-orange-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Move className="w-5 h-5 text-purple-600" />
                        </div>
                        <h4 className="font-bold text-gray-900">Move</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Click and drag your design to position it anywhere on the product
                      </p>
                    </div>

                    <div className="p-5 transition-colors bg-white border-2 border-gray-200 rounded-xl hover:border-orange-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Maximize className="w-5 h-5 text-blue-600" />
                        </div>
                        <h4 className="font-bold text-gray-900">Resize</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Drag corner handles to make your design larger or smaller
                      </p>
                    </div>

                    <div className="p-5 transition-colors bg-white border-2 border-gray-200 rounded-xl hover:border-orange-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <RotateCw className="w-5 h-5 text-green-600" />
                        </div>
                        <h4 className="font-bold text-gray-900">Rotate</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Rotate your design to any angle for creative positioning
                      </p>
                    </div>

                    <div className="p-5 transition-colors bg-white border-2 border-gray-200 rounded-xl hover:border-orange-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-pink-100 rounded-lg">
                          <Layers className="w-5 h-5 text-pink-600" />
                        </div>
                        <h4 className="font-bold text-gray-900">Layer</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Add multiple design elements and arrange their order
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <h4 className="flex items-center gap-2 mb-4 font-bold text-gray-900">
                      <Zap className="w-5 h-5 text-purple-600" />
                      Design Canvas Tools
                    </h4>
                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Snap-to-grid for perfect alignment</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Smart guides for centering</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Zoom in/out for precision</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Undo/redo unlimited times</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Copy/paste elements</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Flip horizontal/vertical</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Add Text (Optional) */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl">
                    <span className="text-3xl font-bold text-orange-600">4</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">Add Text (Optional)</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Enhance your design with custom text using our typography tools.
                  </p>

                  <div className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <h4 className="mb-4 font-bold text-gray-900">Text Customization Options</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h5 className="mb-2 text-sm font-semibold text-gray-900">Font Styles</h5>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>• 500+ professional fonts</li>
                          <li>• Script, serif, sans-serif</li>
                          <li>• Bold, italic, regular weights</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="mb-2 text-sm font-semibold text-gray-900">Text Effects</h5>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>• Custom colors (RGB/HEX)</li>
                          <li>• Outline/stroke effects</li>
                          <li>• Shadow and glow</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="mb-2 text-sm font-semibold text-gray-900">Formatting</h5>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>• Size adjustment</li>
                          <li>• Letter spacing</li>
                          <li>• Line height control</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="mb-2 text-sm font-semibold text-gray-900">Alignment</h5>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>• Left, center, right</li>
                          <li>• Curved text paths</li>
                          <li>• Multi-line support</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-bold text-orange-600 bg-orange-100 rounded-full">1</span>
                      <span className="text-gray-700">Click "Add Text" button in the editor</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-bold text-orange-600 bg-orange-100 rounded-full">2</span>
                      <span className="text-gray-700">Type your message or slogan</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-bold text-orange-600 bg-orange-100 rounded-full">3</span>
                      <span className="text-gray-700">Choose font, size, and color from the toolbar</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-bold text-orange-600 bg-orange-100 rounded-full">4</span>
                      <span className="text-gray-700">Position and style your text just like images</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5: Preview Mockups */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl">
                    <span className="text-3xl font-bold text-orange-600">5</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">Preview Your Mockups</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    See how your design looks on realistic product photos before publishing.
                  </p>

                  <div className="grid gap-4 mb-6 sm:grid-cols-2">
                    <div className="p-6 bg-green-50 rounded-xl">
                      <Eye className="w-8 h-8 mb-3 text-green-600" />
                      <h4 className="mb-2 font-bold text-gray-900">Realistic Views</h4>
                      <p className="text-sm text-gray-600">
                        See your design on professional product photography from multiple angles
                      </p>
                    </div>
                    <div className="p-6 bg-purple-50 rounded-xl">
                      <ImageIcon className="w-8 h-8 mb-3 text-purple-600" />
                      <h4 className="mb-2 font-bold text-gray-900">All Colors & Sizes</h4>
                      <p className="text-sm text-gray-600">
                        Preview how your design looks on different product colors and variants
                      </p>
                    </div>
                  </div>

                  <div className="p-6 border-l-4 border-blue-500 rounded-lg bg-blue-50">
                    <h4 className="mb-3 font-bold text-gray-900">What to Check:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        Design placement looks centered and balanced
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        Image quality is sharp and clear (no pixelation)
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        Colors look good on all product variants
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        Text is readable and properly sized
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        Design works well on all angles/sides (for apparel)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 6: Set Product Details */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl">
                    <span className="text-3xl font-bold text-orange-600">6</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">Set Product Details</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Add information that helps customers discover and understand your product.
                  </p>

                  <div className="space-y-6">
                    <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
                      <h4 className="mb-3 font-bold text-gray-900">Required Information:</h4>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg h-fit">
                            <Type className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h5 className="mb-1 font-semibold text-gray-900">Product Title</h5>
                            <p className="text-sm text-gray-600">
                              Create a clear, descriptive name (e.g., "Motivational Quote T-Shirt" or "Custom Logo Hoodie")
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg h-fit">
                            <FileImage className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h5 className="mb-1 font-semibold text-gray-900">Description</h5>
                            <p className="text-sm text-gray-600">
                              Explain what makes your product special, materials, sizing info, and care instructions
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="p-2 bg-green-100 rounded-lg h-fit">
                            <Sparkles className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h5 className="mb-1 font-semibold text-gray-900">Tags & Categories</h5>
                            <p className="text-sm text-gray-600">
                              Add relevant tags to help customers find your product in searches
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                      <h4 className="mb-3 font-bold text-gray-900">Pricing Your Product:</h4>
                      <p className="mb-4 text-sm text-gray-600">
                        We show you the base cost (production + shipping). You set your profit margin on top of that.
                      </p>
                      <div className="p-4 space-y-2 bg-white rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Base Cost:</span>
                          <span className="font-semibold">₹399</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Your Profit:</span>
                          <span className="font-semibold text-green-600">₹300</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-bold">Selling Price:</span>
                          <span className="text-lg font-bold text-orange-600">₹699</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 7: Publish */}
            <div className="p-8 text-white shadow-lg bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-white rounded-2xl">
                    <span className="text-3xl font-bold text-orange-600">7</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold">Publish Your Product</h3>
                  <p className="mb-6 text-lg text-orange-50">
                    You're ready to go! Hit publish and your product goes live instantly.
                  </p>

                  <div className="p-6 mb-6 bg-white/10 backdrop-blur rounded-xl">
                    <h4 className="mb-4 font-bold">After Publishing:</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1" />
                        <span>Product appears in your store immediately</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1" />
                        <span>Can be listed on Junooni Marketplace</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1" />
                        <span>Ready to share with your audience</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1" />
                        <span>You can edit anytime (price, description, design)</span>
                      </div>
                    </div>
                  </div>

                  <a 
                    href="/sign-up" 
                    className="inline-flex items-center gap-3 px-8 py-4 font-bold text-orange-600 transition-colors bg-white rounded-lg hover:bg-orange-50"
                  >
                    <Sparkles className="w-6 h-6" />
                    Start Creating Now
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Design Tips Section */}
      <section id="design-tips" className="py-20 scroll-mt-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-purple-700 bg-purple-100 rounded-full">
              <Lightbulb className="w-5 h-5" />
              <span className="font-semibold">Pro Tips</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Design Best Practices</h2>
            <p className="text-xl text-gray-600">
              Follow these tips to create designs that sell
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="p-8 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-green-100 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">DO: High Resolution Images</h3>
              <p className="mb-4 text-gray-600">
                Always use images with at least 300 DPI resolution. Larger files (4500x5400 pixels) ensure crisp, professional prints.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Use PNG for transparent backgrounds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Export designs at highest quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Our editor will warn you if resolution is low</span>
                </li>
              </ul>
            </div>

            <div className="p-8 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-red-100 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">DON'T: Low Quality Images</h3>
              <p className="mb-4 text-gray-600">
                Avoid small, pixelated, or blurry images. They'll look unprofessional when printed and hurt your brand.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>Don't upscale small images</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>Avoid heavily compressed JPGs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>Don't use screenshots or web images</span>
                </li>
              </ul>
            </div>

            <div className="p-8 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-green-100 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">DO: Consider Contrast</h3>
              <p className="mb-4 text-gray-600">
                Make sure your design stands out on the product color. Dark designs on dark products (or light on light) won't pop.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Test multiple product colors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>White designs work great on dark products</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Add borders or outlines for better visibility</span>
                </li>
              </ul>
            </div>

            <div className="p-8 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-green-100 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">DO: Keep It Simple</h3>
              <p className="mb-4 text-gray-600">
                Often, the simplest designs perform best. A clear message or bold graphic beats cluttered, complex layouts.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>One focal point works best</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Clean, minimal designs are timeless</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Use white space effectively</span>
                </li>
              </ul>
            </div>

            <div className="p-8 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-green-100 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">DO: Think About Placement</h3>
              <p className="mb-4 text-gray-600">
                Center chest placement works for most designs. Consider side prints, back designs, or sleeve graphics for variety.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Use mockups to visualize final product</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Small chest logos look professional</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Large back prints make bold statements</span>
                </li>
              </ul>
            </div>

            <div className="p-8 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-green-100 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">DO: Test Readability</h3>
              <p className="mb-4 text-gray-600">
                If your design has text, make sure it's large enough to read from a few feet away. Avoid tiny fonts.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Bold fonts are easier to read</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Keep text short and punchy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Test at different zoom levels</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Troubleshooting Section */}
      <section id="troubleshooting" className="py-20 bg-gray-50 scroll-mt-20">
        <div className="max-w-4xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-blue-700 bg-blue-100 rounded-full">
              <Settings className="w-5 h-5" />
              <span className="font-semibold">Need Help?</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Common Issues & Solutions</h2>
            <p className="text-xl text-gray-600">Quick fixes for frequently encountered problems</p>
          </div>

          <div className="space-y-4">
            <details className="p-6 bg-white rounded-lg shadow-md group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                My design looks pixelated or blurry
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4 space-y-2 text-gray-600">
                <p><strong>Problem:</strong> Your image resolution is too low for printing.</p>
                <p><strong>Solution:</strong></p>
                <ul className="ml-6 space-y-1 list-disc">
                  <li>Use an image with at least 300 DPI</li>
                  <li>Recommended size: 4500 x 5400 pixels</li>
                  <li>Export your design at the highest quality settings</li>
                  <li>If you're using a logo, request a high-res version from your designer</li>
                </ul>
              </div>
            </details>

            <details className="p-6 bg-white rounded-lg shadow-md group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                I can't upload my image file
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4 space-y-2 text-gray-600">
                <p><strong>Possible causes:</strong></p>
                <ul className="ml-6 space-y-1 list-disc">
                  <li>File is too large (max 50MB)</li>
                  <li>File format not supported (use PNG, JPG, or SVG)</li>
                  <li>File is corrupted</li>
                </ul>
                <p><strong>Solutions:</strong></p>
                <ul className="ml-6 space-y-1 list-disc">
                  <li>Compress your file using online tools</li>
                  <li>Convert to PNG or JPG format</li>
                  <li>Try re-exporting from your design software</li>
                </ul>
              </div>
            </details>

            <details className="p-6 bg-white rounded-lg shadow-md group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                Design doesn't look right on different product colors
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4 space-y-2 text-gray-600">
                <p><strong>Problem:</strong> Lack of contrast between design and product color.</p>
                <p><strong>Solutions:</strong></p>
                <ul className="ml-6 space-y-1 list-disc">
                  <li>Create separate versions for light and dark products</li>
                  <li>Add a white or black outline to your design</li>
                  <li>Use bold, high-contrast colors</li>
                  <li>Preview on all color variants before publishing</li>
                </ul>
              </div>
            </details>

            <details className="p-6 bg-white rounded-lg shadow-md group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                My text looks distorted or stretched
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4 space-y-2 text-gray-600">
                <p><strong>Problem:</strong> Text aspect ratio not locked when resizing.</p>
                <p><strong>Solution:</strong></p>
                <ul className="ml-6 space-y-1 list-disc">
                  <li>Hold Shift while dragging corners to maintain proportions</li>
                  <li>Use the size slider instead of manual dragging</li>
                  <li>Click "Reset" to restore original proportions</li>
                  <li>Delete and re-add text if severely distorted</li>
                </ul>
              </div>
            </details>

            <details className="p-6 bg-white rounded-lg shadow-md group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                Editor is running slow or freezing
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4 space-y-2 text-gray-600">
                <p><strong>Common causes & fixes:</strong></p>
                <ul className="ml-6 space-y-1 list-disc">
                  <li>Too many layers - merge or delete unused elements</li>
                  <li>Very large file sizes - compress images before uploading</li>
                  <li>Browser cache - clear cache and refresh page</li>
                  <li>Outdated browser - update to latest version</li>
                  <li>Try using Chrome or Firefox for best performance</li>
                </ul>
              </div>
            </details>

            <details className="p-6 bg-white rounded-lg shadow-md group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                I accidentally deleted my design, can I recover it?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4 space-y-2 text-gray-600">
                <p><strong>Recovery options:</strong></p>
                <ul className="ml-6 space-y-1 list-disc">
                  <li>Use Ctrl+Z (Windows) or Cmd+Z (Mac) to undo</li>
                  <li>Check your browser's back button if you've navigated away</li>
                  <li>Look in "Drafts" - we auto-save your work</li>
                  <li>Contact support if you published the product - we may have backups</li>
                </ul>
              </div>
            </details>
          </div>

          {/* <div className="p-8 mt-12 text-center text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl">
            <h3 className="mb-4 text-2xl font-bold">Still Need Help?</h3>
            <p className="mb-6 text-orange-50">
              Our support team is here 24/7 to help you create amazing products
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a 
                href="/support" 
                className="px-6 py-3 font-bold text-orange-600 transition-colors bg-white rounded-lg hover:bg-orange-50"
              >
                Contact Support
              </a>
              <a 
                href="/help" 
                className="px-6 py-3 font-bold text-white transition-colors bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-orange-600"
              >
                Visit Help Center
              </a>
            </div>
          </div> */}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl px-6 mx-auto text-center">
          <h2 className="mb-6 text-4xl font-bold text-gray-900">Ready to Create Your First Product?</h2>
          <p className="mb-8 text-xl text-gray-600">
            Start designing now and see your ideas come to life
          </p>
          <a 
            href="/sign-up" 
            className="inline-flex items-center gap-3 px-10 py-5 text-xl font-bold text-white transition-colors bg-orange-600 rounded-lg shadow-lg hover:bg-orange-700"
          >
            <Palette className="w-6 h-6" />
            Open Design Studio
            <ArrowRight className="w-6 h-6" />
          </a>
        </div>
      </section>
      </div>

      {/* FOOTER - Mobile Optimized */}
      <footer className="py-8 text-white bg-gray-900 sm:py-10">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <img src={junoonilogo} alt="Junooni logo" className="h-6 sm:h-8" />
                <span className="text-xs text-gray-300 sm:text-sm">Creator Studio</span>
              </div>
              <p className="mt-3 text-xs text-gray-400 sm:mt-4 sm:text-sm">Empowering creators to design, publish and sell high-quality merchandise without inventory hassle.</p>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold sm:mb-3 sm:text-base">Platform</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="https://cms.junooni.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Product Catalog</a></li>
                <li><a href="/pages/fulfillment-page" className="hover:text-white">Fulfillments</a></li>
                <li><a href="/pages/creator-store" className="hover:text-white">Creator Store</a></li>
                <li><a href="https://junooni.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Marketplace</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold sm:mb-3 sm:text-base">Guide</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="/pages/getting-started" className="hover:text-white">Getting started</a></li>
                <li><a href="/pages/creating-products" className="hover:text-white">Creating products</a></li>
                <li><a href="/pages/make_your_brand" className="hover:text-white">Make your brand</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold sm:mb-3 sm:text-base">Social</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="https://www.instagram.com/bejunooni?igsh=MXV5MnNpeWNianNqeg==" target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a></li>
                <li><a href="https://www.facebook.com/p/Junooni-61577994639087/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook</a></li>
                <li><a href="https://youtube.com/@bejunooni?si=p96lWYtfDUMhsII3" target="_blank" rel="noopener noreferrer" className="hover:text-white">Youtube</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold sm:mb-3 sm:text-base">Company</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="/pages/about-us" className="hover:text-white">About us</a></li>
                <li><a href="/pages/careers" className="hover:text-white">Career</a></li>
                <li><a href="/pages/privacy" className="hover:text-white">Privacy</a></li>
                <li><a href="/pages/for-creators" className="hover:text-white">For Creators</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-4 mt-6 text-xs text-center text-gray-400 border-t border-gray-800 sm:pt-6 sm:mt-8 sm:text-sm">
            © {new Date().getFullYear()} Junooni Creator Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}