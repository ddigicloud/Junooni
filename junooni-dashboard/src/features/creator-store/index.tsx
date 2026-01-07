import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { 
  Store, 
  Sparkles, 
  Settings,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Palette,
  DollarSign,
  Users,
  Package,
  BarChart,
  Globe,
  Zap,
  ShoppingBag,
  Eye,
  Heart,
  Share2,
  Tag,
  CreditCard,
  Truck,
  Bell,
  MessageCircle,
  Image as ImageIcon,
  Layout,
  Link as LinkIcon,
  Star,
  TrendingDown,
  Award,
  Target,
  Megaphone,
  Calendar,
  Gift,
  Percent,
  LineChart,
  Download,
  Upload,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Lock,
  Unlock,
  AlertCircle,
  Lightbulb,
  Play,
  Menu,
  X
} from 'lucide-react';
import junoonilogo from '/src/assets/junooni_logo_brand_color.png';

export default function CreatorStorePage() {
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
                <Button variant="ghost" onClick={() => { setIsMenuOpen(false); handleLoginClick(); }}>Login</Button>
                <Button onClick={() => { setIsMenuOpen(false); handleRegisterClick(); }} className="bg-[#e65100] text-white">Start Selling</Button>
                <Button variant="ghost" onClick={() => { setIsMenuOpen(false); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>How it works</Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 pt-20 text-white bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/20 backdrop-blur">
              <Store className="w-5 h-5" />
              <span className="font-semibold">Complete Guide</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold">Your Creator Store on Junooni</h1>
            <p className="mb-8 text-xl text-orange-50">
              Everything you need to know about setting up, customizing, and growing your 
              personalized creator store. Your brand, your products, your way.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                onClick={handleRegisterClick}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-orange-600 transition-colors bg-white rounded-lg h-19 hover:bg-orange-50"
              >
                <Sparkles className="w-6 h-6" />
                Create Your Store
              </Button>
              <a 
                href="#getting-started" 
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white transition-colors bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-orange-600"
              >
                See How It Works
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What is Creator Store */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">What is a Creator Store?</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Your personal storefront on Junooni where you showcase and sell your branded merchandise
            </p>
          </div>

          <div className="grid gap-8 mb-12 md:grid-cols-3">
            <div className="p-8 text-center bg-white shadow-lg rounded-2xl">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-2xl">
                <Store className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Your Own Space</h3>
              <p className="text-gray-600">
                Get a personalized storefront with your branding, products, and custom URL 
                (junooni.com/yourname)
              </p>
            </div>

            <div className="p-8 text-center bg-white shadow-lg rounded-2xl">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-2xl">
                <Zap className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Easy Management</h3>
              <p className="text-gray-600">
                Manage products, orders, analytics, and customer relationships all from one 
                powerful dashboard
              </p>
            </div>

            <div className="p-8 text-center bg-white shadow-lg rounded-2xl">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-100 rounded-2xl">
                <TrendingUp className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Built-in Growth</h3>
              <p className="text-gray-600">
                Access marketing tools, analytics, and the Junooni marketplace to reach more 
                customers and grow sales
              </p>
            </div>
          </div>

          <div className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl md:p-12">
            <div className="flex flex-col items-center gap-8 md:flex-row">
              <div className="flex-1">
                <h3 className="mb-4 text-3xl font-bold text-gray-900">Creator Store vs Marketplace</h3>
                <p className="mb-6 text-lg text-gray-700">
                  Your Creator Store is your personal brand headquarters. The Marketplace is where 
                  you can also list products to reach Junooni's broader customer base. Use both for 
                  maximum visibility!
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="flex items-center gap-2 mb-2 font-bold text-gray-900">
                      <Store className="w-5 h-5 text-orange-600" />
                      Creator Store
                    </h4>
                    <p className="text-sm text-gray-600">Your branded space, your URL, full customization</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="flex items-center gap-2 mb-2 font-bold text-gray-900">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                      Marketplace
                    </h4>
                    <p className="text-sm text-gray-600">Discover platform, browse all creators, wider reach</p>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="max-w-sm p-6 bg-white shadow-lg rounded-xl">
                  <div className="mb-2 text-4xl font-bold text-orange-600">2X</div>
                  <p className="text-gray-600">Average sales increase when using both Creator Store and Marketplace</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section id="getting-started" className="py-20 scroll-mt-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Setting Up Your Store</h2>
            <p className="text-xl text-gray-600">Follow these steps to launch your creator store</p>
          </div>

          <div className="space-y-12">
            {/* Step 1: Store Setup */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl">
                    <span className="text-3xl font-bold text-orange-600">1</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">Choose Your Store Name & URL</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Pick a memorable name that represents your brand and claim your unique Junooni URL.
                  </p>

                  <div className="p-6 mb-6 bg-orange-50 rounded-xl">
                    <h4 className="mb-4 font-bold text-gray-900">Store URL Format:</h4>
                    <div className="p-4 bg-white border-2 border-orange-200 rounded-lg">
                      <code className="text-lg">
                        <span className="text-gray-500">https://junooni.com/</span>
                        <span className="font-bold text-orange-600">yourstore</span>
                      </code>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      Your store URL must be unique, 3-30 characters, and can include letters, numbers, 
                      and hyphens.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-green-600" />
                      <span className="text-gray-700">Navigate to Settings → Store Setup</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-green-600" />
                      <span className="text-gray-700">Enter your desired store name</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-green-600" />
                      <span className="text-gray-700">Check availability and claim your URL</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-green-600" />
                      <span className="text-gray-700">Optional: Connect a custom domain later</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Profile & Branding */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl">
                    <span className="text-3xl font-bold text-orange-600">2</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">Complete Your Store Profile</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Add your branding elements to make your store recognizable and professional.
                  </p>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="p-6 bg-blue-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <ImageIcon className="w-6 h-6 text-blue-600" />
                        <h4 className="font-bold text-gray-900">Profile Picture/Logo</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Square image (500x500px min)</li>
                        <li>• PNG format with transparency</li>
                        <li>• Represents your brand</li>
                        <li>• Shows on store and products</li>
                      </ul>
                    </div>

                    <div className="p-6 bg-purple-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <Layout className="w-6 h-6 text-purple-600" />
                        <h4 className="font-bold text-gray-900">Banner Image</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Wide format (1920x400px)</li>
                        <li>• Showcases your brand style</li>
                        <li>• Optional but recommended</li>
                        <li>• Updates anytime</li>
                      </ul>
                    </div>

                    <div className="p-6 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <MessageCircle className="w-6 h-6 text-green-600" />
                        <h4 className="font-bold text-gray-900">Store Description</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Tell your brand story</li>
                        <li>• 150-500 characters</li>
                        <li>• What makes you unique</li>
                        <li>• Shows to all visitors</li>
                      </ul>
                    </div>

                    <div className="p-6 bg-pink-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <Share2 className="w-6 h-6 text-pink-600" />
                        <h4 className="font-bold text-gray-900">Social Links</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Instagram, YouTube, Twitter</li>
                        <li>• Facebook, TikTok, Discord</li>
                        <li>• Link all your platforms</li>
                        <li>• Builds trust and community</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Add Products */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl">
                    <span className="text-3xl font-bold text-orange-600">3</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">Add Your Products</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Design and publish products to your store. They'll automatically appear in your storefront.
                  </p>

                  <div className="p-6 mb-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <h4 className="mb-4 font-bold text-gray-900">Quick Start Options:</h4>
                    <div className="space-y-3">
                      <a href="/studio" className="flex items-center gap-3 p-4 transition-shadow bg-white rounded-lg hover:shadow-md">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Palette className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">Create New Product</h5>
                          <p className="text-sm text-gray-600">Design from scratch using our studio</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-purple-600" />
                      </a>
                      <a href="/products" className="flex items-center gap-3 p-4 transition-shadow bg-white rounded-lg hover:shadow-md">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ShoppingBag className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">Browse Templates</h5>
                          <p className="text-sm text-gray-600">Start with pre-designed templates</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-blue-600" />
                      </a>
                    </div>
                  </div>

                  <div className="p-6 border-l-4 border-blue-500 rounded-lg bg-blue-50">
                    <div className="flex gap-3">
                      <Lightbulb className="flex-shrink-0 w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="mb-2 font-bold text-gray-900">Pro Tip: Start with 5-10 Products</h4>
                        <p className="text-sm text-gray-700">
                          Quality over quantity! Launch with your best designs. You can always add more 
                          products later. A focused initial collection performs better than overwhelming 
                          visitors with too many choices.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Customize Storefront */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl">
                    <span className="text-3xl font-bold text-orange-600">4</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">Customize Your Storefront</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Make your store uniquely yours with customization options.
                  </p>

                  <div className="grid gap-4 mb-6 md:grid-cols-3">
                    <div className="p-5 rounded-lg bg-orange-50">
                      <Palette className="w-8 h-8 mb-3 text-orange-600" />
                      <h4 className="mb-2 font-semibold text-gray-900">Brand Colors</h4>
                      <p className="text-sm text-gray-600">Customize button colors, accents, and theme</p>
                    </div>
                    <div className="p-5 rounded-lg bg-blue-50">
                      <Layout className="w-8 h-8 mb-3 text-blue-600" />
                      <h4 className="mb-2 font-semibold text-gray-900">Layout Options</h4>
                      <p className="text-sm text-gray-600">Grid or list view, featured sections</p>
                    </div>
                    <div className="p-5 rounded-lg bg-purple-50">
                      <Star className="w-8 h-8 mb-3 text-purple-600" />
                      <h4 className="mb-2 font-semibold text-gray-900">Featured Products</h4>
                      <p className="text-sm text-gray-600">Pin bestsellers and new arrivals</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Settings className="flex-shrink-0 w-5 h-5 mt-1 text-orange-600" />
                      <span className="text-gray-700">Go to Store Settings → Appearance</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Palette className="flex-shrink-0 w-5 h-5 mt-1 text-orange-600" />
                      <span className="text-gray-700">Choose your primary brand color</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Layout className="flex-shrink-0 w-5 h-5 mt-1 text-orange-600" />
                      <span className="text-gray-700">Select your preferred layout style</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Eye className="flex-shrink-0 w-5 h-5 mt-1 text-orange-600" />
                      <span className="text-gray-700">Preview changes before publishing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5: Launch */}
            <div className="p-8 text-white shadow-lg bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-white rounded-2xl">
                    <span className="text-3xl font-bold text-orange-600">5</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold">Launch Your Store!</h3>
                  <p className="mb-6 text-lg text-orange-50">
                    You're ready to go live! Share your store with the world and start selling.
                  </p>

                  <div className="p-6 mb-6 bg-white/10 backdrop-blur rounded-xl">
                    <h4 className="mb-4 font-bold">Before You Launch - Checklist:</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm">Store name and URL set</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm">Profile picture uploaded</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm">Store description written</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm">At least 3 products added</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm">Social links connected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm">Store theme customized</span>
                      </div>
                    </div>
                  </div>

                  <a 
                    href="/dashboard" 
                    className="inline-flex items-center gap-3 px-8 py-4 font-bold text-orange-600 transition-colors bg-white rounded-lg hover:bg-orange-50"
                  >
                    <Play className="w-6 h-6" />
                    Launch Your Store Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Management */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Managing Your Store</h2>
            <p className="text-xl text-gray-600">
              Everything you need to run your store efficiently
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Product Management */}
            <div className="p-8 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-purple-100 rounded-xl">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">Product Management</h3>
              <p className="mb-4 text-gray-600">
                Organize and manage all your products in one place.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Edit className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Edit products anytime</span>
                </li>
                <li className="flex items-start gap-2">
                  <Eye className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Show/hide products</span>
                </li>
                <li className="flex items-start gap-2">
                  <Copy className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Duplicate products</span>
                </li>
                <li className="flex items-start gap-2">
                  <Trash2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Delete unwanted items</span>
                </li>
                <li className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Organize with tags</span>
                </li>
              </ul>
            </div>

            {/* Order Management */}
            <div className="p-8 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-blue-100 rounded-xl">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">Order Management</h3>
              <p className="mb-4 text-gray-600">
                Track and manage all customer orders.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Bell className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Real-time order notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <Truck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Track shipment status</span>
                </li>
                <li className="flex items-start gap-2">
                  <Download className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Export order data</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Customer communication</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Order history & archive</span>
                </li>
              </ul>
            </div>

            {/* Analytics */}
            <div className="p-8 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-green-100 rounded-xl">
                <BarChart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">Analytics & Insights</h3>
              <p className="mb-4 text-gray-600">
                Understand your performance with detailed analytics.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Sales trends & revenue</span>
                </li>
                <li className="flex items-start gap-2">
                  <Eye className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Store visits & views</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Top performing products</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Customer insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <LineChart className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Growth metrics</span>
                </li>
              </ul>
            </div>

            {/* Customer Management */}
            <div className="p-8 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-pink-100 rounded-xl">
                <Users className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">Customer Management</h3>
              <p className="mb-4 text-gray-600">
                Build relationships with your buyers.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Customer database</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Direct messaging</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Reviews & ratings</span>
                </li>
                <li className="flex items-start gap-2">
                  <Gift className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Loyalty rewards</span>
                </li>
                <li className="flex items-start gap-2">
                  <Bell className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>Email notifications</span>
                </li>
              </ul>
            </div>

            {/* Marketing Tools */}
            <div className="p-8 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-orange-100 rounded-xl">
                <Megaphone className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">Marketing Tools</h3>
              <p className="mb-4 text-gray-600">
                Promote your store and drive sales.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Percent className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Discount codes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Share2 className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Social sharing tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <Gift className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Bundle offers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Bell className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Announcement banners</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Campaign tracking</span>
                </li>
              </ul>
            </div>

            {/* Payments & Payouts */}
            <div className="p-8 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-yellow-100 rounded-xl">
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">Payments & Payouts</h3>
              <p className="mb-4 text-gray-600">
                Manage your earnings and payment settings.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CreditCard className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>Automatic payouts</span>
                </li>
                <li className="flex items-start gap-2">
                  <BarChart className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>Revenue dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <Download className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>Invoice generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>Transaction history</span>
                </li>
                <li className="flex items-start gap-2">
                  <Settings className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>Bank details setup</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features - Truncated for brevity, continue with remaining sections... */}
      {/* I'll continue with the rest in the next part due to length */}

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-4xl px-6 mx-auto text-center">
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            Ready to Launch Your Creator Store?
          </h2>
          <p className="mb-8 text-xl text-orange-50">
            Join thousands of creators who are building their brand and earning with Junooni
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              onClick={handleRegisterClick}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-bold text-orange-600 transition-colors bg-white rounded-lg shadow-lg h-19 hover:bg-orange-50"
            >
              <Sparkles className="w-6 h-6" />
              Create Your Store Now
            </Button>
            <a 
              href="/pages/getting-started" 
              className="inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-bold text-white transition-colors bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-orange-600"
            >
              See Getting Started Guide
              <ArrowRight className="w-6 h-6" />
            </a>
          </div>
          <div className="flex flex-col items-center justify-center gap-6 mt-8 sm:flex-row text-orange-50">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>No technical skills needed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Launch in minutes</span>
            </div>
          </div>
        </div>
      </section>

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