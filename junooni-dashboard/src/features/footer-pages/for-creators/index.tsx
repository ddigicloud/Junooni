import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { 
  Sparkles,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Zap,
  Heart,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Trophy,
  Target,
  Palette,
  Store,
  BarChart,
  Rocket,
  Gift,
  Percent,
  Globe,
  MessageCircle,
  Award,
  Lightbulb,
  Camera,
  Megaphone,
  Share2,
  Truck,
  CreditCard,
  Eye,
  ThumbsUp,
  Briefcase,
  TrendingDown,
  Play,
  Download,
  Settings,
  Book,
  Video,
  Headphones,
  Code,
  Smartphone,
  Layers,
  FileText,
  Menu,
  X
} from 'lucide-react';
import junoonilogo from '/src/assets/junooni_logo_brand_color.png';

export default function ForCreatorsPage() {
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
      <section className="relative py-20 overflow-hidden text-white bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-64 h-64 bg-white rounded-full top-10 left-10 blur-3xl"></div>
          <div className="absolute bg-white rounded-full bottom-10 right-10 w-96 h-96 blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl px-6 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/20 backdrop-blur">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Built for Creators Like You</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">
              Turn Your Creativity Into Income
            </h1>
            <p className="mb-8 text-xl md:text-2xl text-orange-50">
              Design, sell, and earn from custom merchandise—all without inventory, upfront costs, 
              or complicated logistics. Start your merch business in minutes.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={handleRegisterClick}
                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-bold text-orange-600 transition-colors bg-white rounded-lg shadow-lg hover:bg-orange-50"
              >
                <Rocket className="w-6 h-6" />
                Start Creating Free
              </button>
              <a 
                href="#how-it-works" 
                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-bold text-white transition-colors bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-orange-600"
              >
                See How It Works
                <Play className="w-6 h-6" />
              </a>
            </div>
            <div className="flex flex-col items-center justify-center gap-6 mt-8 sm:flex-row text-orange-50">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>₹0 upfront costs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Setup in 5 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Stats */}
      <section className="py-16 border-b border-gray-200 bg-gray-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-bold text-gray-900">Join 50,000+ Successful Creators</h2>
            <p className="text-lg text-gray-600">Creators across India are building thriving merch businesses with Junooni</p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="p-6 bg-white shadow-md rounded-2xl">
                <div className="mb-2 text-4xl font-bold text-orange-600">₹100Cr+</div>
                <div className="font-semibold text-gray-600">Creator Earnings</div>
              </div>
            </div>
            <div className="text-center">
              <div className="p-6 bg-white shadow-md rounded-2xl">
                <div className="mb-2 text-4xl font-bold text-blue-600">1M+</div>
                <div className="font-semibold text-gray-600">Products Sold</div>
              </div>
            </div>
            <div className="text-center">
              <div className="p-6 bg-white shadow-md rounded-2xl">
                <div className="mb-2 text-4xl font-bold text-green-600">500+</div>
                <div className="font-semibold text-gray-600">Product Options</div>
              </div>
            </div>
            <div className="text-center">
              <div className="p-6 bg-white shadow-md rounded-2xl">
                <div className="mb-2 text-4xl font-bold text-purple-600">4.8★</div>
                <div className="font-semibold text-gray-600">Creator Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Creators Choose Junooni */}
      <section className="py-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Why Creators Choose Junooni</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              We've built the most creator-friendly merchandise platform in India
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Zero Risk */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-green-100 rounded-2xl">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Zero Financial Risk</h3>
              <p className="mb-4 text-gray-600">
                No inventory to buy, no upfront investment, no storage costs. We only produce when 
                customers order, so you never lose money.
              </p>
              <div className="p-4 rounded-lg bg-green-50">
                <div className="flex items-center gap-2 font-semibold text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span>Start with ₹0</span>
                </div>
              </div>
            </div>

            {/* High Margins */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-orange-100 rounded-2xl">
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Industry-Best Margins</h3>
              <p className="mb-4 text-gray-600">
                Keep 35-45% of every sale—far more than other platforms. You set your prices, 
                you control your profits.
              </p>
              <div className="p-4 rounded-lg bg-orange-50">
                <div className="flex items-center gap-2 font-semibold text-orange-800">
                  <TrendingUp className="w-5 h-5" />
                  <span>3x higher than competitors</span>
                </div>
              </div>
            </div>

            {/* Quality */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-purple-100 rounded-2xl">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Premium Quality</h3>
              <p className="mb-4 text-gray-600">
                We use only high-quality materials and professional printing. Every product is 
                quality-checked before shipping.
              </p>
              <div className="p-4 rounded-lg bg-purple-50">
                <div className="flex items-center gap-2 font-semibold text-purple-800">
                  <Star className="w-5 h-5" />
                  <span>4.8/5 quality rating</span>
                </div>
              </div>
            </div>

            {/* Easy to Use */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-blue-100 rounded-2xl">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Incredibly Easy</h3>
              <p className="mb-4 text-gray-600">
                No design skills needed. Our intuitive tools let you create professional products 
                in minutes, not hours.
              </p>
              <div className="p-4 rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 font-semibold text-blue-800">
                  <Rocket className="w-5 h-5" />
                  <span>Launch in 5 minutes</span>
                </div>
              </div>
            </div>

            {/* Full Support */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-pink-100 rounded-2xl">
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">24/7 Support</h3>
              <p className="mb-4 text-gray-600">
                Real humans who actually care about your success. Quick responses, helpful guidance, 
                and dedicated creator support.
              </p>
              <div className="p-4 rounded-lg bg-pink-50">
                <div className="flex items-center gap-2 font-semibold text-pink-800">
                  <MessageCircle className="w-5 h-5" />
                  <span>Avg 2hr response time</span>
                </div>
              </div>
            </div>

            {/* Fast Fulfillment */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-yellow-100 rounded-2xl">
                <Truck className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Lightning Fast</h3>
              <p className="mb-4 text-gray-600">
                We produce and ship orders in 5-10 days. Happy customers mean repeat sales and 
                glowing reviews.
              </p>
              <div className="p-4 rounded-lg bg-yellow-50">
                <div className="flex items-center gap-2 font-semibold text-yellow-800">
                  <Clock className="w-5 h-5" />
                  <span>5-10 day delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 scroll-mt-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600">
              From idea to income in four simple steps
            </p>
          </div>

          <div className="relative grid gap-8 md:grid-cols-4">
            {/* Connecting Line */}
            <div className="absolute left-0 right-0 hidden h-1 md:block top-16 bg-gradient-to-r from-orange-200 via-orange-300 to-orange-200 -z-10" 
                 style={{width: 'calc(100% - 8rem)', left: '4rem'}}></div>

            {/* Step 1 */}
            <div className="relative">
              <div className="p-8 text-center transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full shadow-lg bg-gradient-to-br from-orange-500 to-orange-600">
                  <Palette className="w-8 h-8 text-white" />
                </div>
                <div className="inline-block px-4 py-1 mb-4 text-sm font-bold text-orange-600 bg-orange-100 rounded-full">
                  Step 1
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">Design Your Products</h3>
                <p className="text-gray-600">
                  Use our easy design studio to upload your artwork or create designs with our tools. 
                  No design skills required.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="p-8 text-center transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <div className="inline-block px-4 py-1 mb-4 text-sm font-bold text-blue-600 bg-blue-100 rounded-full">
                  Step 2
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">Launch Your Store</h3>
                <p className="text-gray-600">
                  Get your personalized store URL instantly. Customize your brand and publish products 
                  in minutes.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="p-8 text-center transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full shadow-lg bg-gradient-to-br from-green-500 to-green-600">
                  <Megaphone className="w-8 h-8 text-white" />
                </div>
                <div className="inline-block px-4 py-1 mb-4 text-sm font-bold text-green-600 bg-green-100 rounded-full">
                  Step 3
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">Promote & Sell</h3>
                <p className="text-gray-600">
                  Share your store link with your audience on social media, YouTube, or anywhere you 
                  create content.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="p-8 text-center transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full shadow-lg bg-gradient-to-br from-purple-500 to-purple-600">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="inline-block px-4 py-1 mb-4 text-sm font-bold text-purple-600 bg-purple-100 rounded-full">
                  Step 4
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">Earn Automatically</h3>
                <p className="text-gray-600">
                  We handle production, shipping, and customer service. You just earn money with every 
                  sale. Simple!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a 
              href="/getting-started" 
              className="inline-flex items-center gap-2 text-lg font-bold text-orange-600 hover:text-orange-700"
            >
              View Complete Getting Started Guide
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Perfect For */}
      <section className="py-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Perfect For Every Type of Creator</h2>
            <p className="text-xl text-gray-600">
              No matter what content you create, merch is a powerful revenue stream
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* YouTubers */}
            <div className="p-8 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl">
              <div className="flex items-center justify-center mb-4 bg-red-500 w-14 h-14 rounded-xl">
                <Video className="text-white w-7 h-7" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">YouTubers</h3>
              <p className="mb-4 text-gray-700">
                Turn your catchphrases, inside jokes, and channel branding into products your 
                subscribers will love to wear and use.
              </p>
              <div className="text-sm text-gray-600">
                <strong>Popular products:</strong> T-shirts, hoodies, phone cases, stickers
              </div>
            </div>

            {/* Instagram Creators */}
            <div className="p-8 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl">
              <div className="flex items-center justify-center mb-4 bg-gradient-to-br from-purple-500 to-pink-500 w-14 h-14 rounded-xl">
                <Camera className="text-white w-7 h-7" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">Instagram Creators</h3>
              <p className="mb-4 text-gray-700">
                Monetize your aesthetic and style. Create merch that matches your feed's vibe and 
                resonates with your followers.
              </p>
              <div className="text-sm text-gray-600">
                <strong>Popular products:</strong> Tote bags, posters, notebooks, accessories
              </div>
            </div>

            {/* Podcasters */}
            <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
              <div className="flex items-center justify-center mb-4 bg-purple-500 w-14 h-14 rounded-xl">
                <Headphones className="text-white w-7 h-7" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">Podcasters</h3>
              <p className="mb-4 text-gray-700">
                Give listeners a way to support your show and rep their favorite podcast. Perfect for 
                building community.
              </p>
              <div className="text-sm text-gray-600">
                <strong>Popular products:</strong> Mugs, t-shirts, stickers, hoodies
              </div>
            </div>

            {/* Streamers/Gamers */}
            <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <div className="flex items-center justify-center mb-4 bg-blue-500 w-14 h-14 rounded-xl">
                <Play className="text-white w-7 h-7" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">Streamers & Gamers</h3>
              <p className="mb-4 text-gray-700">
                Your fans want to support you and show they're part of your community. Give them 
                high-quality merch to do both.
              </p>
              <div className="text-sm text-gray-600">
                <strong>Popular products:</strong> Hoodies, mousepads, phone cases, t-shirts
              </div>
            </div>

            {/* Artists */}
            <div className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
              <div className="flex items-center justify-center mb-4 bg-orange-500 w-14 h-14 rounded-xl">
                <Palette className="text-white w-7 h-7" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">Artists & Designers</h3>
              <p className="mb-4 text-gray-700">
                Showcase your art on physical products. From prints to apparel, turn your creativity 
                into a sustainable income.
              </p>
              <div className="text-sm text-gray-600">
                <strong>Popular products:</strong> Posters, t-shirts, phone cases, tote bags
              </div>
            </div>

            {/* Educators */}
            <div className="p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
              <div className="flex items-center justify-center mb-4 bg-green-500 w-14 h-14 rounded-xl">
                <Book className="text-white w-7 h-7" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">Educators & Coaches</h3>
              <p className="mb-4 text-gray-700">
                Create branded merchandise that reinforces your message and helps students feel 
                connected to your community.
              </p>
              <div className="text-sm text-gray-600">
                <strong>Popular products:</strong> Notebooks, mugs, t-shirts, water bottles
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="max-w-4xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Your Potential Earnings</h2>
            <p className="text-xl text-gray-600">
              See how much you could earn with Junooni's creator-friendly margins
            </p>
          </div>

          <div className="p-8 bg-white shadow-2xl rounded-2xl md:p-12">
            <div className="space-y-6">
              {/* Example 1 */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Example: Basic T-Shirt</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Production Cost:</span>
                      <span className="font-semibold text-gray-900">₹299</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Your Markup:</span>
                      <span className="font-semibold text-green-600">₹300</span>
                    </div>
                    <div className="flex items-center justify-between py-2 pt-2 border-t">
                      <span className="font-bold text-gray-900">Selling Price:</span>
                      <span className="text-xl font-bold text-orange-600">₹599</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <div className="text-center">
                      <div className="mb-2 text-sm text-gray-600">Your Profit Per Sale</div>
                      <div className="mb-2 text-4xl font-bold text-green-600">₹300</div>
                      <div className="text-sm text-gray-600">50% profit margin!</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Earnings */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-gray-900">Monthly Earning Potential</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-6 text-center bg-blue-50 rounded-xl">
                    <div className="mb-2 text-sm text-gray-600">10 sales/month</div>
                    <div className="text-3xl font-bold text-blue-600">₹3,000</div>
                  </div>
                  <div className="p-6 text-center bg-purple-50 rounded-xl">
                    <div className="mb-2 text-sm text-gray-600">50 sales/month</div>
                    <div className="text-3xl font-bold text-purple-600">₹15,000</div>
                  </div>
                  <div className="p-6 text-center bg-orange-50 rounded-xl">
                    <div className="mb-2 text-sm text-gray-600">100 sales/month</div>
                    <div className="text-3xl font-bold text-orange-600">₹30,000</div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="p-8 text-center text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl">
                <p className="mb-4 text-lg">
                  These are just examples. With higher-priced products like hoodies and multiple items, 
                  top creators earn <strong>₹50,000-₹2,00,000+ per month!</strong>
                </p>
                <button
                  onClick={handleRegisterClick}
                  className="inline-flex items-center gap-2 px-8 py-3 font-bold text-orange-600 transition-colors bg-white rounded-lg hover:bg-orange-50"
                >
                  Start Earning Today
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600">
              We've built comprehensive tools to help you design, sell, and grow
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Design Studio */}
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-purple-100 rounded-xl">
                  <Palette className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Design Studio</h3>
                  <p className="mb-4 text-gray-600">
                    Professional design tools that anyone can use. Upload artwork, add text, 
                    preview on realistic mockups.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Drag-and-drop editor</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">500+ fonts and design elements</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Realistic 3D mockups</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Quality check system</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Your Store */}
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-xl">
                  <Store className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Your Branded Store</h3>
                  <p className="mb-4 text-gray-600">
                    Get a beautiful, customizable store with your own URL. Mobile-optimized and 
                    ready to sell.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Custom URL (junooni.com/you)</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Brand colors and theme</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Social media integration</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Mobile-responsive design</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Marketing Tools */}
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-orange-100 rounded-xl">
                  <Megaphone className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Marketing Tools</h3>
                  <p className="mb-4 text-gray-600">
                    Built-in tools to promote your products and drive sales.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Discount codes & promotions</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Social sharing buttons</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Email marketing integration</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Campaign tracking</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-green-100 rounded-xl">
                  <BarChart className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Analytics Dashboard</h3>
                  <p className="mb-4 text-gray-600">
                    Understand your performance with detailed insights and reports.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Sales and revenue tracking</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Top products and trends</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Store visit analytics</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Customer insights</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-yellow-700 bg-yellow-100 rounded-full">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Success Stories</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Creators Thriving on Junooni</h2>
            <p className="text-xl text-gray-600">
              Real creators, real results
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Story 1 */}
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-white rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                  R
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Rohan Verma</h3>
                  <p className="text-sm text-gray-600">Gaming YouTuber</p>
                </div>
              </div>
              <p className="mb-4 italic text-gray-700">
                "I started with just 3 designs. Now I'm earning ₹80,000+ per month from merch alone. 
                My fans love the quality, and I love the margins!"
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="px-3 py-1 font-semibold text-green-700 rounded-full bg-green-50">
                  ₹80K+/month
                </div>
                <div className="text-gray-500">
                  150K subscribers
                </div>
              </div>
            </div>

            {/* Story 2 */}
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-white rounded-full bg-gradient-to-br from-orange-500 to-red-500">
                  P
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Priya Sharma</h3>
                  <p className="text-sm text-gray-600">Art & Design Creator</p>
                </div>
              </div>
              <p className="mb-4 italic text-gray-700">
                "Junooni turned my art into a business. The print quality is amazing, and I can finally 
                focus on creating while earning consistently."
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="px-3 py-1 font-semibold text-green-700 rounded-full bg-green-50">
                  ₹1.2L+/month
                </div>
                <div className="text-gray-500">
                  50K followers
                </div>
              </div>
            </div>

            {/* Story 3 */}
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-white rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                  A
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Arjun Mehta</h3>
                  <p className="text-sm text-gray-600">Fitness Coach</p>
                </div>
              </div>
              <p className="mb-4 italic text-gray-700">
                "My community wanted a way to support me beyond likes and comments. Merch was the 
                perfect solution. Zero hassle for me!"
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="px-3 py-1 font-semibold text-green-700 rounded-full bg-green-50">
                  ₹45K+/month
                </div>
                <div className="text-gray-500">
                  80K followers
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Resources to Help You Grow</h2>
            <p className="text-xl text-gray-600">
              We're committed to your success beyond just the platform
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <a href="/guide" className="p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg group">
              <Book className="w-12 h-12 mb-4 text-purple-600" />
              <h3 className="mb-2 font-bold text-gray-900 group-hover:text-orange-600">Creator Guide</h3>
              <p className="text-sm text-gray-600">Complete tutorials and best practices</p>
            </a>

            <a href="/blog" className="p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg group">
              <FileText className="w-12 h-12 mb-4 text-blue-600" />
              <h3 className="mb-2 font-bold text-gray-900 group-hover:text-orange-600">Blog & Tips</h3>
              <p className="text-sm text-gray-600">Marketing strategies and growth hacks</p>
            </a>

            <a href="/community" className="p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg group">
              <Users className="w-12 h-12 mb-4 text-green-600" />
              <h3 className="mb-2 font-bold text-gray-900 group-hover:text-orange-600">Creator Community</h3>
              <p className="text-sm text-gray-600">Connect with other creators</p>
            </a>

            <a href="/support" className="p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg group">
              <MessageCircle className="w-12 h-12 mb-4 text-orange-600" />
              <h3 className="mb-2 font-bold text-gray-900 group-hover:text-orange-600">24/7 Support</h3>
              <p className="text-sm text-gray-600">Help whenever you need it</p>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Common Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know before starting</p>
          </div>

          <div className="space-y-4">
            <details className="p-6 bg-white rounded-lg shadow-md group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                Do I need design skills to create products?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Not at all! Our design studio is built for creators, not designers. You can upload your 
                own artwork, use our templates, or simply add text to products. If you can use Instagram, 
                you can use Junooni.
              </p>
            </details>

            <details className="p-6 bg-white rounded-lg shadow-md group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                How much does it cost to start?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Absolutely nothing! Setting up your store and designing products is 100% free. You only 
                pay production costs when you make a sale (with Junooni Fulfillment), and that comes out 
                of the selling price before your profit is paid to you.
              </p>
            </details>

            <details className="p-6 bg-white rounded-lg shadow-md group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                How much can I really earn?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                It depends on your audience size and engagement. Small creators (5-10K followers) typically 
                earn ₹10,000-30,000/month. Mid-sized creators (50-100K) earn ₹50,000-1,50,000/month. Large 
                creators (500K+) can earn ₹2,00,000+/month. You set your prices and control your margins.
              </p>
            </details>

            <details className="p-6 bg-white rounded-lg shadow-md group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                Do I have to handle shipping and customer service?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                With Junooni Fulfillment, we handle everything! We produce, pack, ship, and provide customer 
                service for every order. You just design, promote, and earn. If you prefer, you can also use 
                Creator Fulfillment and handle it yourself for higher margins.
              </p>
            </details>

            <details className="p-6 bg-white rounded-lg shadow-md group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                How long does shipping take?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                For Junooni Fulfillment orders, production takes 2-3 business days, then shipping adds 3-7 days 
                depending on location. Total delivery time is typically 5-10 days. We provide tracking for all orders.
              </p>
            </details>

            <details className="p-6 bg-white rounded-lg shadow-md group">
              <summary className="flex items-center justify-between text-lg font-semibold text-gray-900 cursor-pointer">
                What if my design doesn't sell?
                <span className="text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-600">
                That's the beauty of print-on-demand—there's zero risk! If a design doesn't sell, you haven't 
                lost any money. Just try a new design. We only produce when customers order, so you never have 
                unsold inventory sitting around.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-4xl px-6 mx-auto text-center">
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            Ready to Start Your Merch Business?
          </h2>
          <p className="mb-8 text-xl md:text-2xl text-orange-50">
            Join 50,000+ creators who are earning with Junooni. Setup takes just 5 minutes.
          </p>
          <button
            onClick={handleRegisterClick}
            className="inline-flex items-center gap-3 px-10 py-5 text-xl font-bold text-orange-600 transition-colors bg-white rounded-lg shadow-lg hover:bg-orange-50"
          >
            <Sparkles className="w-7 h-7" />
            Create Your Store Free
            <ArrowRight className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center justify-center gap-6 mt-8 sm:flex-row text-orange-50">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>₹0 to start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Cancel anytime</span>
            </div>
          </div>
          
          <div className="pt-12 mt-12 border-t border-orange-400">
            <p className="mb-4 text-orange-100">Questions before starting?</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a 
                href="/support" 
                className="inline-flex items-center gap-2 font-semibold text-white hover:text-orange-100"
              >
                <MessageCircle className="w-5 h-5" />
                Chat with Support
              </a>
              <span className="hidden text-orange-300 sm:inline">•</span>
              <a 
                href="/getting-started" 
                className="inline-flex items-center gap-2 font-semibold text-white hover:text-orange-100"
              >
                <Book className="w-5 h-5" />
                View Getting Started Guide
              </a>
            </div>
          </div>
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