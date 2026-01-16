import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Palette, 
  Store, 
  Globe,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Users,
  MessageCircle,
  Share2,
  Heart,
  Eye,
  Zap,
  Trophy,
  Target,
  Megaphone,
  Camera,
  Layout,
  Type,
  Image as ImageIcon,
  Link as LinkIcon,
  Settings,
  BarChart,
  Award,
  Lightbulb,
  Rocket,
  Menu,
  X
} from 'lucide-react';
import junoonilogo from '/src/assets/junooni_logo_brand_color.png';

export default function MakeYourBrandPage() {
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
            <h1 className="mb-6 text-5xl font-bold">Build Your Creator Brand</h1>
            <p className="mb-8 text-xl text-orange-50">
              Transform your passion into a powerful brand. Create a unique identity, 
              connect with your audience, and stand out in the marketplace.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={handleRegisterClick}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-orange-600 transition-colors bg-white rounded-lg hover:bg-orange-50"
              >
                <Sparkles className="w-6 h-6" />
                Start Building Your Brand
              </button>
              <a 
                href="#branding-basics" 
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white transition-colors bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-orange-600"
              >
                Learn More
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Branding Matters */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Why Your Brand Matters</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              A strong brand is more than a logo—it's the story, values, and personality that make you memorable
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="p-8 text-center transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-2xl">
                <Users className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Build Trust</h3>
              <p className="text-gray-600">
                A professional, consistent brand builds credibility and trust with your audience, 
                making them more likely to buy from you.
              </p>
            </div>

            <div className="p-8 text-center transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-2xl">
                <Target className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Stand Out</h3>
              <p className="text-gray-600">
                In a crowded marketplace, a unique brand identity helps you differentiate 
                yourself and attract your ideal customers.
              </p>
            </div>

            <div className="p-8 text-center transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-100 rounded-2xl">
                <TrendingUp className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Drive Sales</h3>
              <p className="text-gray-600">
                Strong branding creates emotional connections that turn casual browsers 
                into loyal customers and brand advocates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Branding Basics */}
      <section id="branding-basics" className="py-20 scroll-mt-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Elements of Your Brand</h2>
            <p className="text-xl text-gray-600">
              These key components work together to create your unique brand identity
            </p>
          </div>

          <div className="space-y-12">
            {/* Brand Name */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl">
                    <Type className="w-10 h-10 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">Your Brand Name</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Your brand name is the foundation of your identity. It should be memorable, 
                    unique, and reflect your personality or niche.
                  </p>
                  
                  <div className="p-6 mb-6 bg-orange-50 rounded-xl">
                    <h4 className="flex items-center gap-2 mb-3 font-bold text-gray-900">
                      <Lightbulb className="w-5 h-5 text-orange-600" />
                      Tips for Choosing a Great Name:
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Keep it short and easy to spell (2-3 words max)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Make it memorable and pronounceable</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Ensure it's available as a domain and social handle</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Reflect your content style or personality</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Avoid generic names - be distinctive!</span>
                      </li>
                    </ul>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 border-l-4 border-green-500 rounded-lg bg-green-50">
                      <p className="mb-2 font-semibold text-green-900">Good Examples:</p>
                      <ul className="space-y-1 text-sm text-green-800">
                        <li>• TechWithTim</li>
                        <li>• StyleByMira</li>
                        <li>• FitnessPhilosophy</li>
                        <li>• TheArtistCollective</li>
                      </ul>
                    </div>
                    <div className="p-4 border-l-4 border-red-500 rounded-lg bg-red-50">
                      <p className="mb-2 font-semibold text-red-900">Avoid:</p>
                      <ul className="space-y-1 text-sm text-red-800">
                        <li>• Numbers: "Creator123"</li>
                        <li>• Too generic: "TheBestStuff"</li>
                        <li>• Hard to spell: "Phashionista"</li>
                        <li>• Too long: "TheAmazingContent..."</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logo & Visuals */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl">
                    <ImageIcon className="w-10 h-10 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">Logo & Visual Identity</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Your logo and visual style create instant recognition. They should be 
                    consistent across all platforms and touchpoints.
                  </p>

                  <div className="grid gap-4 mb-6 md:grid-cols-3">
                    <div className="p-5 rounded-lg bg-purple-50">
                      <Palette className="w-8 h-8 mb-3 text-purple-600" />
                      <h4 className="mb-2 font-semibold text-gray-900">Logo Design</h4>
                      <p className="text-sm text-gray-600">
                        Simple, scalable, and works in both color and black & white
                      </p>
                    </div>
                    <div className="p-5 rounded-lg bg-blue-50">
                      <Palette className="w-8 h-8 mb-3 text-blue-600" />
                      <h4 className="mb-2 font-semibold text-gray-900">Color Palette</h4>
                      <p className="text-sm text-gray-600">
                        Choose 2-3 primary colors that reflect your brand personality
                      </p>
                    </div>
                    <div className="p-5 rounded-lg bg-pink-50">
                      <Type className="w-8 h-8 mb-3 text-pink-600" />
                      <h4 className="mb-2 font-semibold text-gray-900">Typography</h4>
                      <p className="text-sm text-gray-600">
                        Select fonts that match your style - modern, classic, playful, etc.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 border-l-4 border-blue-500 rounded-lg bg-blue-50">
                    <h4 className="mb-3 font-bold text-gray-900">Logo Options:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="font-bold text-blue-600">1.</span>
                        <span><strong>DIY:</strong> Use free tools like Canva, LogoMaker, or Adobe Express</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold text-blue-600">2.</span>
                        <span><strong>Hire a Designer:</strong> Find affordable designers on Fiverr, Upwork, or Behance</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold text-blue-600">3.</span>
                        <span><strong>AI Tools:</strong> Try AI logo generators for quick initial concepts</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold text-blue-600">4.</span>
                        <span><strong>Text-Only:</strong> A well-designed wordmark can be just as effective!</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Story */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-purple-100 rounded-2xl">
                    <MessageCircle className="w-10 h-10 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">Your Brand Story</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    Your story creates emotional connections. Share your journey, values, and what drives you.
                  </p>

                  <div className="p-6 mb-6 bg-purple-50 rounded-xl">
                    <h4 className="mb-4 font-bold text-gray-900">What to Include in Your Story:</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-bold text-white bg-purple-600 rounded-full">
                          1
                        </div>
                        <div>
                          <h5 className="mb-1 font-semibold text-gray-900">Your Origin</h5>
                          <p className="text-sm text-gray-600">How and why did you start creating?</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-bold text-white bg-purple-600 rounded-full">
                          2
                        </div>
                        <div>
                          <h5 className="mb-1 font-semibold text-gray-900">Your Mission</h5>
                          <p className="text-sm text-gray-600">What problem do you solve or value do you provide?</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-bold text-white bg-purple-600 rounded-full">
                          3
                        </div>
                        <div>
                          <h5 className="mb-1 font-semibold text-gray-900">Your Values</h5>
                          <p className="text-sm text-gray-600">What do you stand for? What matters to you?</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-bold text-white bg-purple-600 rounded-full">
                          4
                        </div>
                        <div>
                          <h5 className="mb-1 font-semibold text-gray-900">What Makes You Different</h5>
                          <p className="text-sm text-gray-600">Your unique perspective or approach</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
                    <p className="italic text-gray-800">
                      <strong>Example:</strong> "I started [Brand Name] after struggling to find [problem]. 
                      As a [your background], I believe [your value]. My mission is to help [target audience] 
                      achieve [benefit] through [your unique approach]."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Voice */}
            <div className="p-8 bg-white shadow-lg rounded-2xl md:p-12">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl">
                    <Megaphone className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">Brand Voice & Personality</h3>
                  <p className="mb-6 text-lg text-gray-600">
                    How you communicate is as important as what you say. Your voice should be 
                    consistent and authentic across all channels.
                  </p>

                  <div className="grid gap-6 mb-6 md:grid-cols-2">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <h4 className="mb-4 font-bold text-gray-900">Voice Characteristics:</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded">
                            Professional
                          </div>
                          <span className="text-sm text-gray-600">vs</span>
                          <div className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded">
                            Casual
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1 text-sm font-semibold text-white bg-purple-600 rounded">
                            Serious
                          </div>
                          <span className="text-sm text-gray-600">vs</span>
                          <div className="px-3 py-1 text-sm font-semibold text-white bg-purple-600 rounded">
                            Playful
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded">
                            Formal
                          </div>
                          <span className="text-sm text-gray-600">vs</span>
                          <div className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded">
                            Friendly
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1 text-sm font-semibold text-white bg-orange-600 rounded">
                            Educational
                          </div>
                          <span className="text-sm text-gray-600">vs</span>
                          <div className="px-3 py-1 text-sm font-semibold text-white bg-orange-600 rounded">
                            Entertaining
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <h4 className="mb-4 font-bold text-gray-900">Consistency is Key:</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Use the same tone across all platforms</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Stay true to your personality</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Be authentic - don't force it</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Document your voice guidelines</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Adjust slightly for different platforms</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customize Your Junooni Store */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-orange-700 bg-orange-100 rounded-full">
              <Store className="w-5 h-5" />
              <span className="font-semibold">Your Junooni Store</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Customize Your Store</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Make your Junooni store an extension of your brand with these customization options
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-orange-100 rounded-xl">
                <Globe className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Custom URL</h3>
              <p className="mb-4 text-gray-600">
                Get your personalized store URL: junooni.com/yourbrand
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Easy to share and remember</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Professional appearance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Custom domain option available</span>
                </li>
              </ul>
            </div>

            <div className="p-8 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-blue-100 rounded-xl">
                <Layout className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Store Theme</h3>
              <p className="mb-4 text-gray-600">
                Customize colors, fonts, and layout to match your brand
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Brand color integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Custom banner images</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Typography selection</span>
                </li>
              </ul>
            </div>

            <div className="p-8 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-purple-100 rounded-xl">
                <Camera className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Profile & Bio</h3>
              <p className="mb-4 text-gray-600">
                Upload your logo and write a compelling bio
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Profile picture/logo</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Brand story and bio</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Social media links</span>
                </li>
              </ul>
            </div>

            <div className="p-8 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-green-100 rounded-xl">
                <ImageIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Featured Products</h3>
              <p className="mb-4 text-gray-600">
                Highlight your best sellers and new releases
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Pin products to top</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Create collections</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Organize by category</span>
                </li>
              </ul>
            </div>

            <div className="p-8 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-pink-100 rounded-xl">
                <MessageCircle className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Announcements</h3>
              <p className="mb-4 text-gray-600">
                Keep customers updated with store banners and messages
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Limited-time offers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>New product launches</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Shipping updates</span>
                </li>
              </ul>
            </div>

            <div className="p-8 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-yellow-100 rounded-xl">
                <Share2 className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Social Integration</h3>
              <p className="mb-4 text-gray-600">
                Connect your social media accounts seamlessly
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Link all platforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Easy sharing buttons</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Instagram feed integration</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Building Your Audience */}
      <section className="py-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Grow Your Brand Presence</h2>
            <p className="text-xl text-gray-600">
              Strategies to build awareness and connect with your audience
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Social Media */}
            <div className="p-8 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-pink-600 rounded-xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Social Media Marketing</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-pink-600" />
                  <span>Post consistently (3-5x per week minimum)</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-pink-600" />
                  <span>Share behind-the-scenes content</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-pink-600" />
                  <span>Engage with your community daily</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-pink-600" />
                  <span>Use relevant hashtags and trends</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-pink-600" />
                  <span>Pin your store link in bio/description</span>
                </li>
              </ul>
            </div>

            {/* Content Creation */}
            <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Content Strategy</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-blue-600" />
                  <span>Create product unboxing videos</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-blue-600" />
                  <span>Show your design process</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-blue-600" />
                  <span>Feature customer photos and reviews</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-blue-600" />
                  <span>Share your brand story authentically</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-blue-600" />
                  <span>Educational content about your niche</span>
                </li>
              </ul>
            </div>

            {/* Community Building */}
            <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-600 rounded-xl">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Community Engagement</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-purple-600" />
                  <span>Respond to all comments and messages</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-purple-600" />
                  <span>Run contests and giveaways</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-purple-600" />
                  <span>Create a Discord or Telegram group</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-purple-600" />
                  <span>Thank customers publicly</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-purple-600" />
                  <span>Collaborate with other creators</span>
                </li>
              </ul>
            </div>

            {/* Launch Campaigns */}
            <div className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-600 rounded-xl">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Product Launches</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-orange-600" />
                  <span>Build hype 1-2 weeks before launch</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-orange-600" />
                  <span>Offer early-bird/launch day discounts</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-orange-600" />
                  <span>Tease design concepts and sneak peeks</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-orange-600" />
                  <span>Create limited-edition releases</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="flex-shrink-0 w-5 h-5 mt-1 text-orange-600" />
                  <span>Email your list with exclusive access</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Success Metrics */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-green-700 bg-green-100 rounded-full">
              <BarChart className="w-5 h-5" />
              <span className="font-semibold">Track Your Growth</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Measure Your Success</h2>
            <p className="text-xl text-gray-600">
              Keep an eye on these metrics to understand how your brand is performing
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 bg-white shadow-md rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <Eye className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-blue-600">+50%</span>
              </div>
              <h3 className="mb-2 font-bold text-gray-900">Store Visits</h3>
              <p className="text-sm text-gray-600">Track how many people visit your store</p>
            </div>

            <div className="p-6 bg-white shadow-md rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-purple-600" />
                <span className="text-3xl font-bold text-purple-600">+30%</span>
              </div>
              <h3 className="mb-2 font-bold text-gray-900">Followers</h3>
              <p className="text-sm text-gray-600">Growing audience across all platforms</p>
            </div>

            <div className="p-6 bg-white shadow-md rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold text-green-600">+75%</span>
              </div>
              <h3 className="mb-2 font-bold text-gray-900">Sales Growth</h3>
              <p className="text-sm text-gray-600">Month-over-month revenue increase</p>
            </div>

            <div className="p-6 bg-white shadow-md rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <Star className="w-8 h-8 text-yellow-600" />
                <span className="text-3xl font-bold text-yellow-600">4.8★</span>
              </div>
              <h3 className="mb-2 font-bold text-gray-900">Customer Rating</h3>
              <p className="text-sm text-gray-600">Average review score from buyers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-yellow-700 bg-yellow-100 rounded-full">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Success Stories</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Creators Who Built Strong Brands</h2>
            <p className="text-xl text-gray-600">
              Learn from creators who turned their passion into thriving brands
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 text-2xl font-bold text-white rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                A
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Artistic Souls</h3>
              <p className="mb-4 text-gray-600">
                Started with simple art prints, now selling 500+ products monthly with a 
                loyal community of 50K+ followers.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Award className="w-4 h-4" />
                <span>Art & Design Category</span>
              </div>
            </div>

            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 text-2xl font-bold text-white rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                T
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">TechGeek Store</h3>
              <p className="mb-4 text-gray-600">
                Built a brand around tech humor and memes. Now has dedicated fans who 
                buy every new design within hours of launch.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Award className="w-4 h-4" />
                <span>Tech & Gaming Category</span>
              </div>
            </div>

            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 text-2xl font-bold text-white rounded-full bg-gradient-to-br from-orange-500 to-red-500">
                F
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Fitness Fam</h3>
              <p className="mb-4 text-gray-600">
                Created motivational fitness apparel. Strong brand identity led to 
                200% growth in 6 months and featured in fitness magazines.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Award className="w-4 h-4" />
                <span>Health & Fitness Category</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-4xl px-6 mx-auto text-center">
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            Ready to Build Your Brand?
          </h2>
          <p className="mb-8 text-xl text-orange-50">
            Join thousands of creators who are growing their brand and business with Junooni
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              onClick={handleRegisterClick}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-bold text-orange-600 transition-colors bg-white rounded-lg shadow-lg hover:bg-orange-50"
            >
              <Sparkles className="w-6 h-6" />
              Start Your Brand Today
            </button>
            <a 
              href="/getting-started" 
              className="inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-bold text-white transition-colors bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-orange-600"
            >
              See How It Works
              <ArrowRight className="w-6 h-6" />
            </a>
          </div>
          <div className="flex flex-col items-center justify-center gap-6 mt-8 sm:flex-row text-orange-50">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>No inventory needed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Full creative control</span>
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