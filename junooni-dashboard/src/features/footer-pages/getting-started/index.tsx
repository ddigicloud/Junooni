import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Palette, 
  Store, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Users,
  Shirt,
  ShoppingBag,
  Zap,
  Target,
  Rocket,
  MessageCircle,
  FileText,
  Package,
  Menu,
  X
} from 'lucide-react';
import junoonilogo from '/src/assets/junooni_logo_brand_color.png';

export default function GettingStartedPage() {
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
            <h1 className="mt-8 mb-6 text-5xl font-bold">Start Your Creator Merchandise Journey</h1>
            <p className="mb-8 text-xl text-orange-50">
              Turn your creative ideas into a thriving merchandise business in minutes. 
              No inventory, no upfront costs, no hassle.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                onClick={handleRegisterClick}
                className="inline-flex items-center justify-center h-20 gap-2 px-8 py-4 text-lg font-bold text-orange-600 transition-colors bg-white rounded-lg hover:bg-orange-50"
              >
                <Sparkles className="w-5 h-5" />
                Start Creating Free
              </Button>
              <a 
                href="#how-it-works" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white transition-colors bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-orange-600"
              >
                See How It Works
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            <p className="mt-6 text-orange-100">Join 50,000+ creators • No credit card required</p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 border-b border-gray-200 bg-gray-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-orange-600">50,000+</div>
              <div className="text-gray-600">Active Creators</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-orange-600">500+</div>
              <div className="text-gray-600">Product Options</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-orange-600">₹0</div>
              <div className="text-gray-600">Upfront Cost</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-orange-600">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 scroll-mt-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">How Junooni Works</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              From design to delivery, we've made it simple to start selling your merchandise
            </p>
          </div>

          <div className="relative grid gap-8 md:grid-cols-4">
            {/* Connecting Line */}
            <div className="absolute left-0 right-0 hidden h-1 md:block top-16 bg-gradient-to-r from-orange-200 via-orange-300 to-orange-200 -z-10" style={{width: 'calc(100% - 8rem)', left: '4rem'}}></div>
            
            {/* Step 1 */}
            <div className="relative">
              <div className="p-8 text-center transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full shadow-lg bg-gradient-to-br from-orange-500 to-orange-600">
                  <Palette className="w-8 h-8 text-white" />
                </div>
                <div className="inline-block px-4 py-1 mb-4 text-sm font-bold text-orange-600 bg-orange-100 rounded-full">
                  Step 1
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">Design Your Products</h3>
                <p className="text-gray-600">
                  Use our intuitive design studio to create stunning merchandise. Upload your artwork, add text, and customize products.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="p-8 text-center transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full shadow-lg bg-gradient-to-br from-orange-500 to-orange-600">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <div className="inline-block px-4 py-1 mb-4 text-sm font-bold text-orange-600 bg-orange-100 rounded-full">
                  Step 2
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">Set Up Your Store</h3>
                <p className="text-gray-600">
                  Create your branded store or list products on the Junooni marketplace. Set your prices and profit margins.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="p-8 text-center transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full shadow-lg bg-gradient-to-br from-orange-500 to-orange-600">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="inline-block px-4 py-1 mb-4 text-sm font-bold text-orange-600 bg-orange-100 rounded-full">
                  Step 3
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">Promote & Sell</h3>
                <p className="text-gray-600">
                  Share your store with your audience. Use our marketing tools to drive sales and grow your brand.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="p-8 text-center transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full shadow-lg bg-gradient-to-br from-orange-500 to-orange-600">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div className="inline-block px-4 py-1 mb-4 text-sm font-bold text-orange-600 bg-orange-100 rounded-full">
                  Step 4
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">We Handle the Rest</h3>
                <p className="text-gray-600">
                  We print, pack, and ship orders automatically. You focus on creating while we fulfill and you earn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Step-by-Step Guide */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Step-by-Step Guide</h2>
            <p className="text-xl text-gray-600">Everything you need to know to launch successfully</p>
          </div>

          <div className="space-y-12">
            {/* Step 1 Detailed */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl">
                    <Palette className="w-10 h-10 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">1. Create Your Account</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Sign up for free in seconds. No credit card required to get started.
                  </p>
                  <div className="mb-6 space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-green-600" />
                      <span className="text-gray-700">Enter your email and create a password</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-green-600" />
                      <span className="text-gray-700">Set up your creator profile with brand name and bio</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-green-600" />
                      <span className="text-gray-700">Choose your store URL (e.g., junooni.com/yourname)</span>
                    </div>
                  </div>
                  <button onClick={handleRegisterClick} className="inline-flex items-center gap-2 font-semibold text-orange-600 hover:text-orange-700">
                    Create Your Account <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 Detailed */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl">
                    <Shirt className="w-10 h-10 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">2. Browse & Select Products</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Choose from hundreds of high-quality products ready for your designs.
                  </p>
                  <div className="grid gap-4 mb-6 sm:grid-cols-2">
                    <div className="p-4 rounded-lg bg-orange-50">
                      <h4 className="mb-2 font-semibold text-gray-900">Apparel</h4>
                      <p className="text-sm text-gray-600">T-shirts, hoodies, tank tops, long sleeves</p>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-50">
                      <h4 className="mb-2 font-semibold text-gray-900">Accessories</h4>
                      <p className="text-sm text-gray-600">Mugs, phone cases, tote bags, hats</p>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-50">
                      <h4 className="mb-2 font-semibold text-gray-900">Home & Living</h4>
                      <p className="text-sm text-gray-600">Posters, cushions, wall art, stickers</p>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-50">
                      <h4 className="mb-2 font-semibold text-gray-900">Stationery</h4>
                      <p className="text-sm text-gray-600">Notebooks, planners, greeting cards</p>
                    </div>
                  </div>
                  <a href="/products" className="inline-flex items-center gap-2 font-semibold text-orange-600 hover:text-orange-700">
                    Explore Product Catalog <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Step 3 Detailed */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl">
                    <Zap className="w-10 h-10 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">3. Design Your Products</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Use our powerful yet simple design studio to bring your vision to life.
                  </p>
                  <div className="mb-6 space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-green-600" />
                      <span className="text-gray-700">Upload your own artwork, logos, or photos</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-green-600" />
                      <span className="text-gray-700">Add custom text with hundreds of fonts</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-green-600" />
                      <span className="text-gray-700">Preview your design on realistic mockups</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 mt-1 text-green-600" />
                      <span className="text-gray-700">Adjust colors, sizes, and placement perfectly</span>
                    </div>
                  </div>
                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <p className="text-sm text-blue-900">
                      <strong>Pro Tip:</strong> High-resolution images (at least 300 DPI) ensure the best print quality. Our design studio will alert you if your image resolution is too low.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 Detailed */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl">
                    <Store className="w-10 h-10 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">4. Set Up Your Store</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Launch your branded store or list products on our marketplace.
                  </p>
                  <div className="mb-6 space-y-4">
                    <div className="pl-4 border-l-4 border-orange-500">
                      <h4 className="mb-1 font-semibold text-gray-900">Option 1: Your Own Store</h4>
                      <p className="text-gray-600">Get a dedicated storefront with your branding, custom domain option, and full control</p>
                    </div>
                    <div className="pl-4 border-l-4 border-blue-500">
                      <h4 className="mb-1 font-semibold text-gray-900">Option 2: Junooni Marketplace</h4>
                      <p className="text-gray-600">List your products alongside thousands of creators and get discovered by new customers</p>
                    </div>
                    <div className="pl-4 border-l-4 border-green-500">
                      <h4 className="mb-1 font-semibold text-gray-900">Option 3: Both!</h4>
                      <p className="text-gray-600">Many creators use both to maximize reach and sales opportunities</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 Detailed */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl">
                    <Target className="w-10 h-10 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">5. Set Your Prices</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    You control your profit margins. We show you production costs upfront.
                  </p>
                  <div className="p-6 mb-6 rounded-lg bg-gray-50">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                        <span className="text-gray-600">Base Cost (Production + Shipping)</span>
                        <span className="font-semibold text-gray-900">₹399</span>
                      </div>
                      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                        <span className="text-gray-600">Your Profit Margin</span>
                        <span className="font-semibold text-green-600">₹300</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-lg font-semibold text-gray-900">Selling Price</span>
                        <span className="text-2xl font-bold text-orange-600">₹699</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Set competitive prices that work for your audience. You can adjust prices anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 6 Detailed */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl">
                    <Rocket className="w-10 h-10 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">6. Launch & Promote</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Time to share your store with the world! Use these proven strategies to drive sales.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <Users className="w-5 h-5 text-pink-600" />
                        Social Media
                      </h4>
                      <p className="text-sm text-gray-600">Share on Instagram, Twitter, Facebook, YouTube</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                        Community
                      </h4>
                      <p className="text-sm text-gray-600">Announce in Discord, Telegram, WhatsApp groups</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <FileText className="w-5 h-5 text-purple-600" />
                        Content
                      </h4>
                      <p className="text-sm text-gray-600">Create behind-the-scenes content, unboxing videos</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                      <h4 className="flex items-center gap-2 mb-2 font-semibold text-gray-900">
                        <ShoppingBag className="w-5 h-5 text-green-600" />
                        Email
                      </h4>
                      <p className="text-sm text-gray-600">Send to your email list with special launch offers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600">We provide all the tools and support for your merchandise business</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-orange-100 rounded-xl">
                <Palette className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Design Studio</h3>
              <p className="mb-4 text-gray-600">
                Professional design tools with mockup previews, font library, and drag-and-drop simplicity.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Unlimited designs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Realistic mockups
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Design templates
                </li>
              </ul>
            </div>

            <div className="p-8 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-blue-100 rounded-xl">
                <Store className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Your Storefront</h3>
              <p className="mb-4 text-gray-600">
                Beautiful, customizable store with your branding. Mobile-optimized and ready to sell.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Custom domain option
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Brand customization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Analytics dashboard
                </li>
              </ul>
            </div>

            <div className="p-8 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-green-100 rounded-xl">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Fulfillment</h3>
              <p className="mb-4 text-gray-600">
                We print, pack, and ship every order. Quality-checked and delivered on time.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Premium printing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Quality control
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Fast shipping
                </li>
              </ul>
            </div>

            <div className="p-8 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-purple-100 rounded-xl">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Marketing Tools</h3>
              <p className="mb-4 text-gray-600">
                Built-in tools to help you promote and grow your merchandise business.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Discount codes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Social sharing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Email tools
                </li>
              </ul>
            </div>

            <div className="p-8 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-yellow-100 rounded-xl">
                <Users className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">24/7 Support</h3>
              <p className="mb-4 text-gray-600">
                Our team is here to help you succeed with quick responses and expert guidance.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Live chat support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Help center
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Video tutorials
                </li>
              </ul>
            </div>

            <div className="p-8 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-pink-100 rounded-xl">
                <Sparkles className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Creator Community</h3>
              <p className="mb-4 text-gray-600">
                Join a thriving community of creators sharing tips, designs, and success stories.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Creator forum
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Success stories
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Best practices
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Success Tips */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="max-w-4xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Tips for Success</h2>
            <p className="text-xl text-gray-600">Learn from our top-performing creators</p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 p-6 bg-white shadow-md rounded-xl">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
                  <Sparkles className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">Start with your best designs</h3>
                <p className="text-gray-600">Launch with 5-10 strong products rather than flooding your store. Quality over quantity always wins.</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-white shadow-md rounded-xl">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">Know your audience</h3>
                <p className="text-gray-600">Create designs that resonate with your specific community. Inside jokes and references perform best.</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-white shadow-md rounded-xl">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">Promote consistently</h3>
                <p className="text-gray-600">Share your products regularly across all your platforms. Pin your store link in your bio and video descriptions.</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-white shadow-md rounded-xl">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">Engage with buyers</h3>
                <p className="text-gray-600">Thank customers who share photos wearing your merch. User-generated content is the best marketing.</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-white shadow-md rounded-xl">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-pink-100 rounded-lg">
                  <Rocket className="w-6 h-6 text-pink-600" />
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">Launch with momentum</h3>
                <p className="text-gray-600">Build hype before launch. Tease designs, offer early-bird discounts, and make your launch an event.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Common Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know before starting</p>
          </div>

          <div className="space-y-4">
            <details className="p-6 rounded-lg bg-gray-50 group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                How much does it cost to get started?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Absolutely nothing! Creating an account, designing products, and setting up your store is completely free. You only pay production costs when you make a sale (with Junooni Fulfillment), or handle your own costs (with Creator Fulfillment).
              </p>
            </details>

            <details className="p-6 rounded-lg bg-gray-50 group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                Do I need to buy inventory upfront?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Not with Junooni Fulfillment! We use print-on-demand technology, meaning products are only made after a customer orders. No inventory risk, no storage costs. If you choose Creator Fulfillment, you manage your own inventory.
              </p>
            </details>

            <details className="p-6 rounded-lg bg-gray-50 group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                How long does shipping take?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                For Junooni Fulfillment orders, production takes 2-3 business days, then shipping adds 3-7 days depending on location. Customers receive tracking information automatically.
              </p>
            </details>

            <details className="p-6 rounded-lg bg-gray-50 group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                What if I'm not good at design?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Our design studio is beginner-friendly! Start with simple text designs using our font library, or upload photos and logos. We also offer design templates to help you get started. Many successful creators use very simple designs.
              </p>
            </details>

            <details className="p-6 rounded-lg bg-gray-50 group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                When do I get paid?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                With Junooni Fulfillment, you receive your profit margin automatically after order fulfillment. Creator Fulfillment payments go directly to you. We handle all payment processing securely.
              </p>
            </details>

            <details className="p-6 rounded-lg bg-gray-50 group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                Can I sell internationally?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Currently, we focus on serving customers across India with fast, reliable shipping. International expansion is on our roadmap based on creator demand.
              </p>
            </details>

            <details className="p-6 rounded-lg bg-gray-50 group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                What if I need help?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Our support team is available 24/7 via live chat, email, and our help center. We also have video tutorials, a creator community forum, and regular webinars to help you succeed.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-4xl px-6 mx-auto text-center">
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">Ready to Launch Your Store?</h2>
          <p className="mb-8 text-xl text-orange-50">
            Join 50,000+ creators who are already earning from their designs
          </p>
          <Button
            onClick={handleRegisterClick}
            className="inline-flex items-center h-20 gap-3 px-10 py-5 text-xl font-bold text-orange-600 transition-colors bg-white rounded-lg shadow-lg hover:bg-orange-50"
          >
            <Sparkles className="w-6 h-6" />
            Start Creating Free
            <ArrowRight className="w-6 h-6" />
          </Button>
          <div className="flex flex-col items-center justify-center gap-6 mt-8 sm:flex-row text-orange-50">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Cancel anytime</span>
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