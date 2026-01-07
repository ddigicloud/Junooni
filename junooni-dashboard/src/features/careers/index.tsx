import React from 'react';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { 
  Briefcase,
  Heart,
  Users,
  TrendingUp,
  Sparkles,
  Target,
  Globe,
  Mail,
  Award,
  FileText,
  Zap,
  Coffee,
  Lightbulb,
  Rocket,
  Star,
  CheckCircle,
  ArrowRight,
  Code,
  Palette,
  Megaphone,
  BarChart,
  Package,
  MessageCircle,
  Shield,
    Menu,
  DollarSign,
  Clock,
  Home,
  GraduationCap,
  Headphones,
  Laptop,
  MapPin,
  Calendar,
  Smile,
  ThumbsUp,
  Trophy,
  Settings,
  BookOpen,
  Plane,
  UtensilsCrossed,
  HeartPulse,
  Baby,
  Dumbbell,
  Sun,
  Moon,
  Users as UsersIcon,
  PartyPopper,
  Gift,
  Music
} from 'lucide-react';
import junoonilogo from '/src/assets/junooni_logo_brand_color.png';


export default function CareersPage() {
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
              <span className="font-semibold">Join Our Mission</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">
              Build the Future of Creator Commerce
            </h1>
            <p className="mb-8 text-xl md:text-2xl text-orange-50">
              Help us empower millions of creators to turn their passion into income. 
              Join a team that's changing the game for creators across India.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a 
                href="#open-positions" 
                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-bold text-orange-600 transition-colors bg-white rounded-lg shadow-lg hover:bg-orange-50"
              >
                <Briefcase className="w-6 h-6" />
                View Open Positions
              </a>
              <a 
                href="#life-at-junooni" 
                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-bold text-white transition-colors bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-orange-600"
              >
                Life at Junooni
                <ArrowRight className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 border-b border-gray-200 bg-gray-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-orange-600">50+</div>
              <div className="font-semibold text-gray-600">Team Members</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-blue-600">4.5★</div>
              <div className="font-semibold text-gray-600">Glassdoor Rating</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-green-600">95%</div>
              <div className="font-semibold text-gray-600">Employee Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-purple-600">Remote-First</div>
              <div className="font-semibold text-gray-600">Work Culture</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Junooni */}
      <section className="py-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Why Join Junooni?</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              We're building something special—a platform that genuinely puts creators first. 
              Be part of that mission.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Mission-Driven */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-orange-100 rounded-2xl">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Mission-Driven Work</h3>
              <p className="text-gray-600">
                We're not just building software—we're empowering creators to build sustainable 
                businesses. Your work directly impacts thousands of lives.
              </p>
            </div>

            {/* Growth */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-green-100 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Rapid Growth</h3>
              <p className="text-gray-600">
                Join a high-growth startup where you'll wear multiple hats, learn constantly, 
                and see the direct impact of your work.
              </p>
            </div>

            {/* Innovation */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-purple-100 rounded-2xl">
                <Lightbulb className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Innovation Culture</h3>
              <p className="text-gray-600">
                We encourage experimentation and creative problem-solving. Your ideas can become 
                features used by millions.
              </p>
            </div>

            {/* Ownership */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-blue-100 rounded-2xl">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Real Ownership</h3>
              <p className="text-gray-600">
                Own your projects end-to-end. We trust our team to make decisions and take 
                responsibility for outcomes.
              </p>
            </div>

            {/* Work-Life Balance */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-pink-100 rounded-2xl">
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Work-Life Balance</h3>
              <p className="text-gray-600">
                Remote-first culture, flexible hours, and generous time off. We believe sustainable 
                work leads to better outcomes.
              </p>
            </div>

            {/* Great Team */}
            <div className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 mb-6 bg-yellow-100 rounded-2xl">
                <Users className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Amazing Team</h3>
              <p className="text-gray-600">
                Work with talented, passionate people who genuinely care about each other and 
                our mission. Low ego, high output.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Life at Junooni */}
      <section id="life-at-junooni" className="py-20 bg-gradient-to-br from-orange-50 to-orange-100 scroll-mt-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-orange-800 bg-orange-200 rounded-full">
              <Coffee className="w-5 h-5" />
              <span className="font-semibold">Our Culture</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Life at Junooni</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              We've built a culture that attracts the best talent and keeps them happy
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Remote-First */}
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-xl">
                  <Home className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Remote-First, Always</h3>
                  <p className="mb-4 text-gray-600">
                    Work from anywhere in India. We have a beautiful office in Bangalore if you prefer, 
                    but remote is the default.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Home office setup stipend</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Flexible working hours</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Quarterly team offsites</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Learning & Growth */}
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-purple-100 rounded-xl">
                  <GraduationCap className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Learning & Development</h3>
                  <p className="mb-4 text-gray-600">
                    We invest heavily in your growth. Learn new skills, attend conferences, 
                    and level up constantly.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">₹50,000/year learning budget</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Conference attendance</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Internal workshops & mentorship</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Transparency */}
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-green-100 rounded-xl">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Radical Transparency</h3>
                  <p className="mb-4 text-gray-600">
                    Everyone has access to company metrics, financials, and strategic decisions. 
                    No secrets, no politics.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Monthly all-hands meetings</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Open financial dashboards</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Direct access to leadership</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Celebration */}
            <div className="p-8 bg-white shadow-lg rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-pink-100 rounded-xl">
                  <PartyPopper className="w-8 h-8 text-pink-600" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Celebrate Wins</h3>
                  <p className="mb-4 text-gray-600">
                    We celebrate milestones, both professional and personal. Success should be fun!
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-pink-600" />
                      <span className="text-sm">Team events & offsites</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-pink-600" />
                      <span className="text-sm">Birthday & anniversary gifts</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-pink-600" />
                      <span className="text-sm">Recognition programs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits & Perks */}
      <section className="py-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Benefits & Perks</h2>
            <p className="text-xl text-gray-600">
              We take care of our team so they can focus on doing their best work
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Compensation */}
            <div className="p-6 bg-white shadow-md rounded-xl">
              <DollarSign className="w-12 h-12 mb-4 text-green-600" />
              <h3 className="mb-2 font-bold text-gray-900">Competitive Pay</h3>
              <p className="text-sm text-gray-600">Market-leading salaries plus equity options for early employees</p>
            </div>

            {/* Health Insurance */}
            <div className="p-6 bg-white shadow-md rounded-xl">
              <HeartPulse className="w-12 h-12 mb-4 text-red-600" />
              <h3 className="mb-2 font-bold text-gray-900">Health Insurance</h3>
              <p className="text-sm text-gray-600">Comprehensive medical insurance for you and your family</p>
            </div>

            {/* Time Off */}
            <div className="p-6 bg-white shadow-md rounded-xl">
              <Calendar className="w-12 h-12 mb-4 text-blue-600" />
              <h3 className="mb-2 font-bold text-gray-900">Generous Time Off</h3>
              <p className="text-sm text-gray-600">30 days paid leave + unlimited sick days + public holidays</p>
            </div>

            {/* Work From Anywhere */}
            <div className="p-6 bg-white shadow-md rounded-xl">
              <Globe className="w-12 h-12 mb-4 text-purple-600" />
              <h3 className="mb-2 font-bold text-gray-900">Work From Anywhere</h3>
              <p className="text-sm text-gray-600">Remote-first with home office setup budget</p>
            </div>

            {/* Parental Leave */}
            <div className="p-6 bg-white shadow-md rounded-xl">
              <Baby className="w-12 h-12 mb-4 text-pink-600" />
              <h3 className="mb-2 font-bold text-gray-900">Parental Leave</h3>
              <p className="text-sm text-gray-600">20 weeks for primary caregivers, 8 weeks for secondary</p>
            </div>

            {/* Learning Budget */}
            <div className="p-6 bg-white shadow-md rounded-xl">
              <BookOpen className="w-12 h-12 mb-4 text-indigo-600" />
              <h3 className="mb-2 font-bold text-gray-900">Learning Budget</h3>
              <p className="text-sm text-gray-600">₹50,000/year for courses, books, and conferences</p>
            </div>

            {/* Wellness */}
            <div className="p-6 bg-white shadow-md rounded-xl">
              <Dumbbell className="w-12 h-12 mb-4 text-orange-600" />
              <h3 className="mb-2 font-bold text-gray-900">Wellness Program</h3>
              <p className="text-sm text-gray-600">Gym membership, mental health support, yoga classes</p>
            </div>

            {/* Food & Snacks */}
            <div className="p-6 bg-white shadow-md rounded-xl">
              <UtensilsCrossed className="w-12 h-12 mb-4 text-yellow-600" />
              <h3 className="mb-2 font-bold text-gray-900">Food & Snacks</h3>
              <p className="text-sm text-gray-600">Catered lunches in office + monthly food stipend for remote</p>
            </div>

            {/* Flexible Hours */}
            <div className="p-6 bg-white shadow-md rounded-xl">
              <Clock className="w-12 h-12 mb-4 text-teal-600" />
              <h3 className="mb-2 font-bold text-gray-900">Flexible Schedule</h3>
              <p className="text-sm text-gray-600">Choose your hours, work when you're most productive</p>
            </div>

            {/* Latest Tech */}
            <div className="p-6 bg-white shadow-md rounded-xl">
              <Laptop className="w-12 h-12 mb-4 text-gray-600" />
              <h3 className="mb-2 font-bold text-gray-900">Latest Tech</h3>
              <p className="text-sm text-gray-600">MacBook Pro or laptop of your choice + accessories</p>
            </div>

            {/* Team Events */}
            <div className="p-6 bg-white shadow-md rounded-xl">
              <Music className="w-12 h-12 mb-4 text-purple-600" />
              <h3 className="mb-2 font-bold text-gray-900">Team Events</h3>
              <p className="text-sm text-gray-600">Quarterly offsites, team dinners, and celebrations</p>
            </div>

            {/* Workation */}
            <div className="p-6 bg-white shadow-md rounded-xl">
              <Plane className="w-12 h-12 mb-4 text-blue-600" />
              <h3 className="mb-2 font-bold text-gray-900">Workation Policy</h3>
              <p className="text-sm text-gray-600">Work from anywhere for up to 3 months/year</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Our Values</h2>
            <p className="text-xl text-gray-600">
              These principles guide how we work and make decisions
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="p-8 bg-white shadow-md rounded-xl">
              <div className="flex items-center justify-center mb-4 bg-orange-100 w-14 h-14 rounded-xl">
                <Users className="text-orange-600 w-7 h-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Creators First</h3>
              <p className="text-gray-600">
                Every decision starts with: "Does this help creators?" Our users' success is our success.
              </p>
            </div>

            <div className="p-8 bg-white shadow-md rounded-xl">
              <div className="flex items-center justify-center mb-4 bg-blue-100 w-14 h-14 rounded-xl">
                <Zap className="text-blue-600 w-7 h-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Move Fast</h3>
              <p className="text-gray-600">
                Speed is a feature. We ship quickly, learn from feedback, and iterate constantly.
              </p>
            </div>

            <div className="p-8 bg-white shadow-md rounded-xl">
              <div className="flex items-center justify-center mb-4 bg-green-100 w-14 h-14 rounded-xl">
                <Award className="text-green-600 w-7 h-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Excellence Matters</h3>
              <p className="text-gray-600">
                We're not satisfied with "good enough." We push for excellence in everything we build.
              </p>
            </div>

            <div className="p-8 bg-white shadow-md rounded-xl">
              <div className="flex items-center justify-center mb-4 bg-purple-100 w-14 h-14 rounded-xl">
                <Shield className="text-purple-600 w-7 h-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Radical Honesty</h3>
              <p className="text-gray-600">
                We communicate openly, give direct feedback, and don't play political games.
              </p>
            </div>

            <div className="p-8 bg-white shadow-md rounded-xl">
              <div className="flex items-center justify-center mb-4 bg-pink-100 w-14 h-14 rounded-xl">
                <Heart className="text-pink-600 w-7 h-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Care Deeply</h3>
              <p className="text-gray-600">
                We care about our work, our team, and our creators. Empathy drives everything we do.
              </p>
            </div>

            <div className="p-8 bg-white shadow-md rounded-xl">
              <div className="flex items-center justify-center mb-4 bg-yellow-100 w-14 h-14 rounded-xl">
                <Lightbulb className="text-yellow-600 w-7 h-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Think Long-Term</h3>
              <p className="text-gray-600">
                We optimize for sustainable growth, not quick wins. Building for the decade, not the quarter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-positions" className="py-20 scroll-mt-20">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-orange-700 bg-orange-100 rounded-full">
              <Briefcase className="w-5 h-5" />
              <span className="font-semibold">We're Hiring!</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Open Positions</h2>
            <p className="text-xl text-gray-600">
              Join us in building the future of creator commerce
            </p>
          </div>

          <div className="space-y-6">
            {/* Engineering Roles */}
            <div>
              <h3 className="flex items-center gap-3 mb-6 text-2xl font-bold text-gray-900">
                <Code className="w-8 h-8 text-purple-600" />
                Engineering
              </h3>
              <div className="space-y-4">
                <a href="/careers/senior-fullstack-engineer" className="block p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-orange-600">Senior Full-Stack Engineer</h4>
                      <p className="mb-4 text-gray-600">
                        Build scalable features across our web platform. React, Node.js, PostgreSQL.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 text-sm text-purple-700 bg-purple-100 rounded-full">Full-time</span>
                        <span className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-full">Remote</span>
                        <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">3-5 years exp</span>
                      </div>
                    </div>
                    <ArrowRight className="flex-shrink-0 w-6 h-6 ml-4 text-gray-400 group-hover:text-orange-600" />
                  </div>
                </a>

                <a href="/careers/backend-engineer" className="block p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-orange-600">Backend Engineer</h4>
                      <p className="mb-4 text-gray-600">
                        Design and build APIs, microservices, and infrastructure. Node.js, Python, AWS.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 text-sm text-purple-700 bg-purple-100 rounded-full">Full-time</span>
                        <span className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-full">Remote</span>
                        <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">2-4 years exp</span>
                      </div>
                    </div>
                    <ArrowRight className="flex-shrink-0 w-6 h-6 ml-4 text-gray-400 group-hover:text-orange-600" />
                  </div>
                </a>

                <a href="/careers/frontend-engineer" className="block p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-orange-600">Frontend Engineer</h4>
                      <p className="mb-4 text-gray-600">
                        Create beautiful, performant user interfaces. React, TypeScript, Tailwind CSS.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 text-sm text-purple-700 bg-purple-100 rounded-full">Full-time</span>
                        <span className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-full">Remote</span>
                        <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">2-4 years exp</span>
                      </div>
                    </div>
                    <ArrowRight className="flex-shrink-0 w-6 h-6 ml-4 text-gray-400 group-hover:text-orange-600" />
                  </div>
                </a>
              </div>
            </div>

            {/* Design Roles */}
            <div>
              <h3 className="flex items-center gap-3 mb-6 text-2xl font-bold text-gray-900">
                <Palette className="w-8 h-8 text-blue-600" />
                Design
              </h3>
              <div className="space-y-4">
                <a href="/careers/product-designer" className="block p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-orange-600">Product Designer</h4>
                      <p className="mb-4 text-gray-600">
                        Design delightful experiences for creators and customers. UI/UX, user research.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 text-sm text-purple-700 bg-purple-100 rounded-full">Full-time</span>
                        <span className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-full">Remote</span>
                        <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">3-5 years exp</span>
                      </div>
                    </div>
                    <ArrowRight className="flex-shrink-0 w-6 h-6 ml-4 text-gray-400 group-hover:text-orange-600" />
                  </div>
                </a>
              </div>
            </div>

            {/* Marketing Roles */}
            <div>
              <h3 className="flex items-center gap-3 mb-6 text-2xl font-bold text-gray-900">
                <Megaphone className="w-8 h-8 text-pink-600" />
                Marketing
              </h3>
              <div className="space-y-4">
                <a href="/careers/growth-marketing-manager" className="block p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-orange-600">Growth Marketing Manager</h4>
                      <p className="mb-4 text-gray-600">
                        Drive creator acquisition and engagement. SEO, content, paid ads, partnerships.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 text-sm text-purple-700 bg-purple-100 rounded-full">Full-time</span>
                        <span className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-full">Remote</span>
                        <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">3-5 years exp</span>
                      </div>
                    </div>
                    <ArrowRight className="flex-shrink-0 w-6 h-6 ml-4 text-gray-400 group-hover:text-orange-600" />
                  </div>
                </a>

                <a href="/careers/content-marketing-specialist" className="block p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-orange-600">Content Marketing Specialist</h4>
                      <p className="mb-4 text-gray-600">
                        Create content that educates and inspires creators. Blog, social media, video.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 text-sm text-purple-700 bg-purple-100 rounded-full">Full-time</span>
                        <span className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-full">Remote</span>
                        <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">2-4 years exp</span>
                      </div>
                    </div>
                    <ArrowRight className="flex-shrink-0 w-6 h-6 ml-4 text-gray-400 group-hover:text-orange-600" />
                  </div>
                </a>
              </div>
            </div>

            {/* Operations */}
            <div>
              <h3 className="flex items-center gap-3 mb-6 text-2xl font-bold text-gray-900">
                <Package className="w-8 h-8 text-green-600" />
                Operations
              </h3>
              <div className="space-y-4">
                <a href="/careers/operations-manager" className="block p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-orange-600">Operations Manager</h4>
                      <p className="mb-4 text-gray-600">
                        Optimize fulfillment, vendor relationships, and operational efficiency.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 text-sm text-purple-700 bg-purple-100 rounded-full">Full-time</span>
                        <span className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-full">Bangalore</span>
                        <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">3-5 years exp</span>
                      </div>
                    </div>
                    <ArrowRight className="flex-shrink-0 w-6 h-6 ml-4 text-gray-400 group-hover:text-orange-600" />
                  </div>
                </a>
              </div>
            </div>

            {/* Customer Success */}
            <div>
              <h3 className="flex items-center gap-3 mb-6 text-2xl font-bold text-gray-900">
                <Headphones className="w-8 h-8 text-orange-600" />
                Customer Success
              </h3>
              <div className="space-y-4">
                <a href="/careers/creator-success-manager" className="block p-6 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-orange-600">Creator Success Manager</h4>
                      <p className="mb-4 text-gray-600">
                        Help creators succeed on Junooni. Support, onboarding, community management.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 text-sm text-purple-700 bg-purple-100 rounded-full">Full-time</span>
                        <span className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-full">Remote</span>
                        <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">2-3 years exp</span>
                      </div>
                    </div>
                    <ArrowRight className="flex-shrink-0 w-6 h-6 ml-4 text-gray-400 group-hover:text-orange-600" />
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Don't see your role */}
          <div className="p-8 mt-12 text-center text-white bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl md:p-12">
            <h3 className="mb-4 text-3xl font-bold">Don't See Your Role?</h3>
            <p className="mb-6 text-xl text-orange-50">
              We're always looking for exceptional talent. Even if we don't have an open position that 
              fits your background, we'd love to hear from you!
            </p>
            <a 
              href="mailto:careers@junooni.com" 
              className="inline-flex items-center gap-3 px-8 py-4 font-bold text-orange-600 transition-colors bg-white rounded-lg hover:bg-orange-50"
            >
              <Mail className="w-6 h-6" />
              Send Your Resume
            </a>
          </div>
        </div>
      </section>

      {/* Hiring Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Our Hiring Process</h2>
            <p className="text-xl text-gray-600">
              Transparent, respectful, and designed to get to know you well
            </p>
          </div>

          <div className="relative grid gap-8 md:grid-cols-4">
            {/* Connecting Line */}
            <div className="absolute left-0 right-0 hidden h-1 md:block top-16 bg-gradient-to-r from-orange-200 via-orange-300 to-orange-200 -z-10" 
                 style={{width: 'calc(100% - 8rem)', left: '4rem'}}></div>

            <div className="relative">
              <div className="p-8 text-center bg-white shadow-lg rounded-2xl">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full shadow-lg bg-gradient-to-br from-orange-500 to-orange-600">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div className="inline-block px-4 py-1 mb-4 text-sm font-bold text-orange-600 bg-orange-100 rounded-full">
                  Step 1
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">Apply</h3>
                <p className="text-sm text-gray-600">
                  Submit your application with resume and portfolio/links to your work
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="p-8 text-center bg-white shadow-lg rounded-2xl">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <div className="inline-block px-4 py-1 mb-4 text-sm font-bold text-blue-600 bg-blue-100 rounded-full">
                  Step 2
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">Initial Call</h3>
                <p className="text-sm text-gray-600">
                  30-min chat with our team to learn about you and answer your questions
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="p-8 text-center bg-white shadow-lg rounded-2xl">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full shadow-lg bg-gradient-to-br from-green-500 to-green-600">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <div className="inline-block px-4 py-1 mb-4 text-sm font-bold text-green-600 bg-green-100 rounded-full">
                  Step 3
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">Skills Assessment</h3>
                <p className="text-sm text-gray-600">
                  Take-home project or technical interview based on the role
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="p-8 text-center bg-white shadow-lg rounded-2xl">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full shadow-lg bg-gradient-to-br from-purple-500 to-purple-600">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="inline-block px-4 py-1 mb-4 text-sm font-bold text-purple-600 bg-purple-100 rounded-full">
                  Step 4
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">Team Interviews</h3>
                <p className="text-sm text-gray-600">
                  Meet the team, discuss your work, and assess cultural fit
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 mt-12 border-l-4 border-blue-500 rounded-lg bg-blue-50">
            <p className="text-gray-700">
              <strong>Our commitment:</strong> We'll get back to you within 5 business days at each stage. 
              We respect your time and believe you deserve clear, timely communication throughout the process.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-4xl px-6 mx-auto text-center">
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            Ready to Make an Impact?
          </h2>
          <p className="mb-8 text-xl md:text-2xl text-orange-50">
            Join us in building the future of creator commerce. Let's change the game together.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a 
              href="#open-positions" 
              className="inline-flex items-center gap-3 px-10 py-5 text-xl font-bold text-orange-600 transition-colors bg-white rounded-lg shadow-lg hover:bg-orange-50"
            >
              <Briefcase className="w-6 h-6" />
              View Open Positions
            </a>
            <a 
              href="mailto:careers@junooni.com" 
              className="inline-flex items-center gap-3 px-10 py-5 text-xl font-bold text-white transition-colors bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-orange-600"
            >
              <MessageCircle className="w-6 h-6" />
              Get in Touch
            </a>
          </div>
          <div className="mt-8 text-orange-100">
            <p>Questions? Email us at <a href="mailto:careers@junooni.com" className="font-semibold text-white hover:underline">careers@junooni.com</a></p>
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