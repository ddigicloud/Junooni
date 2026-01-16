import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { 
  Heart,
  Users,
  Target,
  Sparkles,
  TrendingUp,
  Globe,
  Award,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Rocket,
  Star,
  Package,
  Palette,
  MessageCircle,
  HandshakeIcon,
  Eye,
  Compass,
  Cpu,
  Store,
  DollarSign,
  ThumbsUp,
  Briefcase,
  GraduationCap,
  Coffee,
  Code,
  Megaphone,
  TrendingDown,
  Menu,
  X
} from 'lucide-react';
import junoonilogo from '/src/assets/junooni_logo_brand_color.png';

export default function AboutUsPage() {
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
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">
              Empowering Creators to Build Their Dreams
            </h1>
            <p className="mb-8 text-xl md:text-2xl text-orange-50">
              We're on a mission to democratize merchandise creation, making it possible for 
              every creator to turn their passion into a thriving business.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={handleRegisterClick}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-orange-600 transition-colors bg-white rounded-lg hover:bg-orange-50"
              >
                <Sparkles className="w-6 h-6" />
                Join Our Community
              </button>
              <a 
                href="#our-story" 
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white transition-colors bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-orange-600"
              >
                Our Story
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b border-gray-200 bg-gray-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-orange-600 md:text-5xl">50,000+</div>
              <div className="font-semibold text-gray-600">Active Creators</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-orange-600 md:text-5xl">500+</div>
              <div className="font-semibold text-gray-600">Products Available</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-orange-600 md:text-5xl">1M+</div>
              <div className="font-semibold text-gray-600">Orders Fulfilled</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-orange-600 md:text-5xl">₹100Cr+</div>
              <div className="font-semibold text-gray-600">Creator Earnings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section id="our-story" className="py-20 scroll-mt-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-orange-700 bg-orange-100 rounded-full">
              <Lightbulb className="w-5 h-5" />
              <span className="font-semibold">Our Journey</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">How Junooni Began</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Born from the frustration of creators who deserved better tools and opportunities
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="p-8 mb-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl md:p-12">
              <div className="prose prose-lg text-gray-800 max-w-none">
                <p className="mb-6 text-xl leading-relaxed">
                  In 2020, we noticed a problem. Talented creators across India were producing 
                  amazing content, building loyal communities, and inspiring millions—but they 
                  struggled to monetize their influence beyond brand deals and ads.
                </p>
                <p className="mb-6 text-lg leading-relaxed">
                  Merchandise seemed like the perfect solution, but the existing options were broken. 
                  Creators had to either invest thousands in inventory (risking their savings on products 
                  that might not sell), or use platforms that offered terrible quality and even worse margins.
                </p>
                <p className="mb-6 text-lg leading-relaxed">
                  We knew there had to be a better way. What if creators could design professional 
                  merchandise without any upfront investment? What if they could keep their profits 
                  instead of watching platforms take the majority? What if quality and creator control 
                  didn't have to be compromised?
                </p>
                <p className="text-lg font-semibold leading-relaxed text-orange-700">
                  That's why we built Junooni—a platform where creators come first, always.
                </p>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="p-8 text-center bg-white shadow-lg rounded-xl">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-2xl">
                  <Rocket className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">2020</h3>
                <p className="text-gray-600">Founded with a vision to empower Indian creators</p>
              </div>

              <div className="p-8 text-center bg-white shadow-lg rounded-xl">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-2xl">
                  <TrendingUp className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">2022</h3>
                <p className="text-gray-600">Reached 10,000 creators and 100K orders</p>
              </div>

              <div className="p-8 text-center bg-white shadow-lg rounded-xl">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-100 rounded-2xl">
                  <Award className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">2024</h3>
                <p className="text-gray-600">India's leading creator merchandise platform</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Mission */}
            <div className="p-8 bg-white shadow-xl rounded-2xl md:p-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-orange-100 rounded-2xl">
                  <Target className="w-10 h-10 text-orange-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="mb-6 text-lg leading-relaxed text-gray-700">
                To empower every creator in India to design, publish, and sell high-quality merchandise 
                without any barriers—no inventory, no upfront costs, no compromises on quality or earnings.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="flex-shrink-0 w-6 h-6 mt-1 text-orange-600" />
                  <span className="text-gray-700">Make merchandise creation accessible to all creators</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="flex-shrink-0 w-6 h-6 mt-1 text-orange-600" />
                  <span className="text-gray-700">Provide fair profit margins and transparent pricing</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="flex-shrink-0 w-6 h-6 mt-1 text-orange-600" />
                  <span className="text-gray-700">Deliver exceptional quality and customer service</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="flex-shrink-0 w-6 h-6 mt-1 text-orange-600" />
                  <span className="text-gray-700">Build tools that help creators grow their brand</span>
                </div>
              </div>
            </div>

            {/* Vision */}
            <div className="p-8 bg-white shadow-xl rounded-2xl md:p-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-blue-100 rounded-2xl">
                  <Eye className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="mb-6 text-lg leading-relaxed text-gray-700">
                To become the world's most creator-friendly merchandise platform, where millions of 
                creators build sustainable businesses and connect with their communities through 
                high-quality products.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Star className="flex-shrink-0 w-6 h-6 mt-1 text-blue-600" />
                  <span className="text-gray-700">Be the first choice for every creator in India</span>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="flex-shrink-0 w-6 h-6 mt-1 text-blue-600" />
                  <span className="text-gray-700">Expand globally while staying creator-first</span>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="flex-shrink-0 w-6 h-6 mt-1 text-blue-600" />
                  <span className="text-gray-700">Pioneer new ways for creators to monetize</span>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="flex-shrink-0 w-6 h-6 mt-1 text-blue-600" />
                  <span className="text-gray-700">Set industry standards for quality and ethics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-purple-700 bg-purple-100 rounded-full">
              <Heart className="w-5 h-5" />
              <span className="font-semibold">Our Values</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">What We Stand For</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              These principles guide every decision we make and define how we serve our creator community
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Value 1: Creator First */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-orange-100 rounded-2xl">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Creator First, Always</h3>
              <p className="leading-relaxed text-gray-600">
                Every feature, policy, and decision is made with creators' best interests in mind. 
                Your success is our success, and we never compromise on that.
              </p>
            </div>

            {/* Value 2: Transparency */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-blue-100 rounded-2xl">
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Radical Transparency</h3>
              <p className="leading-relaxed text-gray-600">
                No hidden fees, no fine print tricks. We show you exactly what you'll earn, what we 
                charge, and where your money goes. Honesty builds trust.
              </p>
            </div>

            {/* Value 3: Quality */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-green-100 rounded-2xl">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Uncompromising Quality</h3>
              <p className="leading-relaxed text-gray-600">
                From product materials to printing to packaging, we maintain the highest standards. 
                Your brand deserves nothing less than excellence.
              </p>
            </div>

            {/* Value 4: Innovation */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-purple-100 rounded-2xl">
                <Lightbulb className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Continuous Innovation</h3>
              <p className="leading-relaxed text-gray-600">
                We're constantly building new tools, features, and products to help you grow. 
                The creator economy evolves fast, and so do we.
              </p>
            </div>

            {/* Value 5: Community */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-pink-100 rounded-2xl">
                <HandshakeIcon className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Strong Community</h3>
              <p className="leading-relaxed text-gray-600">
                We're building more than a platform—we're building a family of creators who support, 
                inspire, and learn from each other.
              </p>
            </div>

            {/* Value 6: Sustainability */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-yellow-100 rounded-2xl">
                <Globe className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Responsible Business</h3>
              <p className="leading-relaxed text-gray-600">
                We're committed to sustainable practices, ethical manufacturing, and minimizing our 
                environmental impact. Good business means doing good.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-orange-800 bg-orange-200 rounded-full">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">Why Choose Junooni</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">What Makes Us Different</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              We're not just another platform—we're genuinely built for creators
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-orange-100 rounded-lg">
                  <DollarSign className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Fair Profit Margins</h3>
                  <p className="mb-4 text-gray-600">
                    Unlike other platforms that take 40-60% of sales, we give creators industry-leading 
                    profit margins. You set your prices, you keep more of what you earn.
                  </p>
                  <div className="p-4 rounded-lg bg-orange-50">
                    <div className="mb-2 text-sm text-gray-600">Average creator keeps:</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-orange-600">35-45%</span>
                      <span className="text-gray-600">of selling price</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Zero Risk Model</h3>
                  <p className="mb-4 text-gray-600">
                    No inventory to buy, no upfront costs, no financial risk. We only produce when 
                    customers order, so you can test ideas without betting your savings.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>No minimum orders</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>No storage costs</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>No unsold inventory</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
                  <Package className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Premium Quality</h3>
                  <p className="mb-4 text-gray-600">
                    We use only high-quality materials and printing methods. Every order goes through 
                    strict quality checks before shipping. Your brand reputation matters to us.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>Premium fabric & materials</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>Professional printing</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>Quality inspection</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Easy to Use</h3>
                  <p className="mb-4 text-gray-600">
                    Our design studio and store management tools are built for creators, not designers. 
                    If you can use social media, you can use Junooni.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Intuitive design tools</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Templates & mockups</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>24/7 support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-pink-100 rounded-lg">
                  <Clock className="w-8 h-8 text-pink-600" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Fast Fulfillment</h3>
                  <p className="mb-4 text-gray-600">
                    We produce and ship orders quickly so your customers get their products fast. 
                    Happy customers mean repeat business and great reviews.
                  </p>
                  <div className="p-4 rounded-lg bg-pink-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Production + Shipping:</span>
                      <span className="text-xl font-bold text-pink-600">5-10 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-lg">
                  <MessageCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Dedicated Support</h3>
                  <p className="mb-4 text-gray-600">
                    Real humans, real help. Our support team genuinely cares about your success and 
                    responds quickly when you need assistance.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-yellow-600" />
                      <span>Live chat support</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-yellow-600" />
                      <span>Video tutorials</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-yellow-600" />
                      <span>Creator community</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Commitment to Creators */}
      <section className="py-20">
        <div className="max-w-4xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-blue-700 bg-blue-100 rounded-full">
              <HandshakeIcon className="w-5 h-5" />
              <span className="font-semibold">Our Promise</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Our Commitment to You</h2>
            <p className="text-xl text-gray-600">
              These are the promises we make to every creator on Junooni
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-8 bg-white border-l-4 border-orange-500 shadow-lg rounded-xl">
              <h3 className="mb-3 text-xl font-bold text-gray-900">We'll Always Put Creators First</h3>
              <p className="text-gray-600">
                Every decision—from pricing to features to policies—will prioritize your success and 
                well-being. We won't sacrifice creator interests for short-term profits.
              </p>
            </div>

            <div className="p-8 bg-white border-l-4 border-blue-500 shadow-lg rounded-xl">
              <h3 className="mb-3 text-xl font-bold text-gray-900">We'll Stay Transparent</h3>
              <p className="text-gray-600">
                We'll never hide fees, change terms without notice, or use confusing pricing. You'll 
                always know exactly what you're paying for and what you'll earn.
              </p>
            </div>

            <div className="p-8 bg-white border-l-4 border-green-500 shadow-lg rounded-xl">
              <h3 className="mb-3 text-xl font-bold text-gray-900">We'll Maintain Quality Standards</h3>
              <p className="text-gray-600">
                Every product will meet our high standards before shipping. If something doesn't meet 
                our quality bar, we'll remake it—no questions asked.
              </p>
            </div>

            <div className="p-8 bg-white border-l-4 border-purple-500 shadow-lg rounded-xl">
              <h3 className="mb-3 text-xl font-bold text-gray-900">We'll Keep Innovating</h3>
              <p className="text-gray-600">
                We'll continuously build new features, add new products, and improve our platform based 
                on your feedback. We're never "done" building for you.
              </p>
            </div>

            <div className="p-8 bg-white border-l-4 border-pink-500 shadow-lg rounded-xl">
              <h3 className="mb-3 text-xl font-bold text-gray-900">We'll Support Your Growth</h3>
              <p className="text-gray-600">
                Beyond just tools, we'll provide resources, education, and a community to help you grow 
                your brand and business. Your success stories are our success stories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-purple-700 bg-purple-100 rounded-full">
              <Briefcase className="w-5 h-5" />
              <span className="font-semibold">Careers</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Join the Junooni Team</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Help us build the future of creator commerce. We're looking for passionate people who 
              believe creators deserve better.
            </p>
          </div>

          <div className="grid gap-8 mb-12 md:grid-cols-3">
            <div className="p-8 text-center bg-white shadow-md rounded-xl">
              <Code className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="mb-2 text-xl font-bold text-gray-900">Engineering</h3>
              <p className="mb-4 text-gray-600">Build scalable systems that serve millions</p>
              <a href="/careers#engineering" className="font-semibold text-orange-600 hover:text-orange-700">
                View Openings →
              </a>
            </div>

            <div className="p-8 text-center bg-white shadow-md rounded-xl">
              <Palette className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="mb-2 text-xl font-bold text-gray-900">Design</h3>
              <p className="mb-4 text-gray-600">Create beautiful, intuitive experiences</p>
              <a href="/careers#design" className="font-semibold text-orange-600 hover:text-orange-700">
                View Openings →
              </a>
            </div>

            <div className="p-8 text-center bg-white shadow-md rounded-xl">
              <Megaphone className="w-12 h-12 mx-auto mb-4 text-pink-600" />
              <h3 className="mb-2 text-xl font-bold text-gray-900">Marketing</h3>
              <p className="mb-4 text-gray-600">Help creators discover Junooni</p>
              <a href="/careers#marketing" className="font-semibold text-orange-600 hover:text-orange-700">
                View Openings →
              </a>
            </div>
          </div>

          <div className="p-8 text-center text-white bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl md:p-12">
            <h3 className="mb-4 text-3xl font-bold">Don't see your role?</h3>
            <p className="mb-6 text-xl text-orange-50">
              We're always looking for talented people who share our mission. Send us your resume!
            </p>
            <a 
              href="mailto:careers@junooni.com" 
              className="inline-flex items-center gap-2 px-8 py-4 font-bold text-orange-600 transition-colors bg-white rounded-lg hover:bg-orange-50"
            >
              <Coffee className="w-5 h-5" />
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-4xl px-6 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Get in Touch</h2>
            <p className="text-xl text-gray-600">
              We'd love to hear from you. Whether you're a creator, partner, or just curious about what we do.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <MessageCircle className="w-12 h-12 mb-4 text-orange-600" />
              <h3 className="mb-3 text-2xl font-bold text-gray-900">For Creators</h3>
              <p className="mb-4 text-gray-700">
                Questions about the platform, need help, or want to share feedback?
              </p>
              <a 
                href="/support" 
                className="inline-flex items-center gap-2 font-semibold text-orange-600 hover:text-orange-700"
              >
                Visit Support Center
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <Briefcase className="w-12 h-12 mb-4 text-blue-600" />
              <h3 className="mb-3 text-2xl font-bold text-gray-900">For Business</h3>
              <p className="mb-4 text-gray-700">
                Partnerships, press inquiries, or business opportunities?
              </p>
              <a 
                href="mailto:support@junooni.com" 
                className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
              >
                Email Us
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="p-8 mt-8 text-center bg-white shadow-lg rounded-xl">
            <div className="flex flex-wrap justify-center gap-8">
              <div>
                <div className="mb-1 text-sm text-gray-600">Email</div>
                <a href="mailto:hello@junooni.com" className="text-lg font-semibold text-orange-600 hover:text-orange-700">
                  hello@junooni.com
                </a>
              </div>
              <div>
                <div className="mb-1 text-sm text-gray-600">Support</div>
                <a href="mailto:support@junooni.com" className="text-lg font-semibold text-orange-600 hover:text-orange-700">
                  support@junooni.com
                </a>
              </div>
              <div>
                <div className="mb-1 text-sm text-gray-600">Careers</div>
                <a href="mailto:careers@junooni.com" className="text-lg font-semibold text-orange-600 hover:text-orange-700">
                  careers@junooni.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-4xl px-6 mx-auto text-center">
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            Ready to Start Your Creator Journey?
          </h2>
          <p className="mb-8 text-xl text-orange-50">
            Join 50,000+ creators who are building their brand and business with Junooni
          </p>
          <button
            onClick={handleRegisterClick}
            className="inline-flex items-center gap-3 px-10 py-5 text-xl font-bold text-orange-600 transition-colors bg-white rounded-lg shadow-lg hover:bg-orange-50"
          >
            <Sparkles className="w-6 h-6" />
            Get Started Free
            <ArrowRight className="w-6 h-6" />
          </button>
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
              <span>Setup in 5 minutes</span>
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