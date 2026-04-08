'use client';

import React from "react";
import Link from "next/link";
import {
  Heart, Users, Sparkles, Target, Globe, ShoppingBag,
  Music, Star, Zap, Award, ArrowRight, Mail, Phone, MapPin, Instagram, Youtube
} from "lucide-react";

const AboutUsPage = () => {
  const quickLinks = [
    { id: "our-story", title: "Our Story", icon: <Sparkles size={20} /> },
    { id: "what-we-do", title: "What We Do", icon: <ShoppingBag size={20} /> },
    { id: "for-creators", title: "For Creators", icon: <Star size={20} /> },
    { id: "for-fans", title: "For Fans", icon: <Heart size={20} /> },
    { id: "our-mission", title: "Our Mission", icon: <Target size={20} /> },
    { id: "why-junooni", title: "Why Junooni", icon: <Award size={20} /> },
    { id: "contact", title: "Get in Touch", icon: <Mail size={20} /> },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const highlights = [
    { icon: <Zap size={20} className="text-[#e65100]" />, label: "Launched December 2025" },
    { icon: <Globe size={20} className="text-[#e65100]" />, label: "Pan-India Shipping" },
    { icon: <Music size={20} className="text-[#e65100]" />, label: "Music & Content Creators" },
    { icon: <Award size={20} className="text-[#e65100]" />, label: "100% Official & Verified" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#e65100] text-white py-10 md:py-12 mt-8 md:mt-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white/20">
              <Heart size={32} />
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">About Junooni</h1>
            <p className="text-lg opacity-90">
              India's creator merchandise marketplace — made by creators, loved by fans.
            </p>
            <p className="mt-2 text-sm opacity-75">Building the future of Indian creator culture, one drop at a time.</p>
          </div>
        </div>
      </div>

      <main className="px-2 md:px-4 py-8 mx-auto md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">

            {/* Sidebar Navigation */}
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
              <div className="p-6 bg-white rounded-lg shadow-sm md:p-8">

                {/* Intro callout */}
                <div className="p-4 mb-8 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
                  <p className="text-sm text-gray-700">
                    <strong>Welcome to Junooni</strong> — India's first dedicated creator merchandise marketplace, where every product tells a story and every purchase supports an independent Indian creator.
                  </p>
                </div>

                {/* Highlights Strip */}
                <div className="grid grid-cols-2 gap-3 mb-10 md:grid-cols-4">
                  {highlights.map((item) => (
                    <div key={item.label} className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-orange-50 border border-orange-100">
                      {item.icon}
                      <p className="text-xs font-medium text-gray-700 leading-snug">{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* Our Story */}
                <section id="our-story" className="mb-10 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Sparkles size={24} className="text-[#e65100]" />
                    Our Story
                  </h2>
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Junooni was born from a simple truth — Indian creators were building massive fan communities, but there was no dedicated, trustworthy platform for those fans to own a piece of what they love. International platforms didn't understand the Indian creator economy. Generic print-on-demand sites lacked the authenticity fans craved.
                  </p>
                  <p className="mb-4 leading-relaxed text-gray-600">
                    We launched in December 2025 with one belief: <strong>merch should feel like it actually came from the creator.</strong> Not a stock template with a logo slapped on it — but a real, limited-edition collectible that reflects the creator's identity, music, art, or personality.
                  </p>
                  <p className="leading-relaxed text-gray-600">
                    From Bollywood music producers to YouTube creators to Instagram artists — Junooni is where Indian creator culture meets its fans in the most tangible way possible: through merchandise they can wear, hold, and treasure.
                  </p>
                </section>

                {/* What We Do */}
                <section id="what-we-do" className="mb-10 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <ShoppingBag size={24} className="text-[#e65100]" />
                    What We Do
                  </h2>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Junooni is a multi-creator merchandise marketplace built specifically for the Indian creator economy. We handle everything from production to delivery — so creators focus on creating, and fans focus on supporting.
                  </p>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg bg-orange-50 border-l-4 border-[#e65100]">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={18} className="text-[#e65100]" />
                        <h4 className="font-semibold text-gray-900">Official Creator Drops</h4>
                      </div>
                      <p className="text-sm text-gray-600">Limited-edition merchandise drops directly licensed from creators — apparel, posters, accessories, and more.</p>
                    </div>

                    <div className="p-4 rounded-lg bg-orange-50 border-l-4 border-[#e65100]">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe size={18} className="text-[#e65100]" />
                        <h4 className="font-semibold text-gray-900">Pan-India Delivery</h4>
                      </div>
                      <p className="text-sm text-gray-600">Fast, reliable shipping across India with real-time order tracking so fans know exactly when their merch arrives.</p>
                    </div>

                    <div className="p-4 rounded-lg bg-orange-50 border-l-4 border-[#e65100]">
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={18} className="text-[#e65100]" />
                        <h4 className="font-semibold text-gray-900">Multi-Creator Marketplace</h4>
                      </div>
                      <p className="text-sm text-gray-600">Shop from multiple creators in one place — discover new artists, musicians, and content creators all in one cart.</p>
                    </div>

                    <div className="p-4 rounded-lg bg-orange-50 border-l-4 border-[#e65100]">
                      <div className="flex items-center gap-2 mb-2">
                        <Award size={18} className="text-[#e65100]" />
                        <h4 className="font-semibold text-gray-900">Verified Authenticity</h4>
                      </div>
                      <p className="text-sm text-gray-600">Every product is officially licensed. No fakes, no knock-offs — only authentic merch from creators you love.</p>
                    </div>
                  </div>
                </section>

                {/* For Creators */}
                <section id="for-creators" className="mb-10 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Star size={24} className="text-[#e65100]" />
                    For Creators
                  </h2>
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Junooni is built for Indian creators who want to turn their community into a revenue stream — without the headache of inventory, logistics, or e-commerce setup. Whether you're a music producer, a YouTuber, an illustrator, or a filmmaker, Junooni gives you a fully managed merch store.
                  </p>

                  <div className="bg-gray-50 rounded-lg p-5 mb-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">What creators get on Junooni:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-[#e65100] font-bold mt-0.5">→</span>
                        <span>Your own branded storefront at junooni.com — no setup cost, no technical knowledge needed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#e65100] font-bold mt-0.5">→</span>
                        <span>Print-on-demand fulfillment — zero inventory risk, products made only when ordered</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#e65100] font-bold mt-0.5">→</span>
                        <span>Revenue dashboard with transparent payout reports, GST-compliant invoicing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#e65100] font-bold mt-0.5">→</span>
                        <span>Design tools to upload custom artwork and create product mockups instantly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#e65100] font-bold mt-0.5">→</span>
                        <span>Dedicated support to help onboard, launch, and grow your merch line</span>
                      </li>
                    </ul>
                  </div>

                  <Link
                    href="https://studio.junooni.com"
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-[#e65100] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#d84315] transition-colors text-sm"
                  >
                    Join as a Creator
                    <ArrowRight size={16} />
                  </Link>
                </section>

                {/* For Fans */}
                <section id="for-fans" className="mb-10 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Heart size={24} className="text-[#e65100]" />
                    For Fans
                  </h2>
                  <p className="mb-4 leading-relaxed text-gray-600">
                    Being a fan is more than just watching, streaming, or following. Junooni gives you a way to carry a piece of your favourite creator's world — in your wardrobe, on your desk, in your hands.
                  </p>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Every purchase on Junooni directly supports the creator behind the collection. When you buy a Tanishk Bagchi hoodie or a limited-edition Kiran Raj print, you're not just getting merch — you're fuelling the music, content, and art you love.
                  </p>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="p-4 text-center rounded-lg bg-gray-50 border border-gray-200">
                      <Music size={24} className="text-[#e65100] mx-auto mb-2" />
                      <h4 className="font-semibold text-gray-900 text-sm">Music Artists</h4>
                      <p className="text-xs text-gray-600 mt-1">Bollywood, indie, and electronic music creators</p>
                    </div>
                    <div className="p-4 text-center rounded-lg bg-gray-50 border border-gray-200">
                      <Youtube size={24} className="text-[#e65100] mx-auto mb-2" />
                      <h4 className="font-semibold text-gray-900 text-sm">Content Creators</h4>
                      <p className="text-xs text-gray-600 mt-1">YouTube, Instagram, and digital creators</p>
                    </div>
                    <div className="p-4 text-center rounded-lg bg-gray-50 border border-gray-200">
                      <Sparkles size={24} className="text-[#e65100] mx-auto mb-2" />
                      <h4 className="font-semibold text-gray-900 text-sm">Artists & Illustrators</h4>
                      <p className="text-xs text-gray-600 mt-1">Visual artists and graphic creators</p>
                    </div>
                  </div>
                </section>

                {/* Our Mission */}
                <section id="our-mission" className="mb-10 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Target size={24} className="text-[#e65100]" />
                    Our Mission
                  </h2>

                  <div className="bg-[#e65100] text-white rounded-lg p-6 mb-6">
                    <p className="text-lg font-semibold leading-relaxed">
                      "To build India's most trusted creator merchandise platform — where every drop is authentic, every creator earns fairly, and every fan feels connected."
                    </p>
                  </div>

                  <p className="mb-4 leading-relaxed text-gray-600">
                    We believe the Indian creator economy is one of the most powerful cultural forces in the world right now. With 500M+ internet users, a booming music and content industry, and fans who are deeply passionate — the infrastructure for creators to monetise that passion has been missing.
                  </p>
                  <p className="leading-relaxed text-gray-600">
                    Junooni exists to fill that gap. We're building the rails for creator merchandise in India — making it as easy as possible for creators to launch and for fans to support, all within a platform they can trust.
                  </p>
                </section>

                {/* Why Junooni */}
                <section id="why-junooni" className="mb-10 scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Award size={24} className="text-[#e65100]" />
                    Why Junooni?
                  </h2>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    "Junooni" (جنونی) means someone who is passionately, obsessively in love with something — a fanatic, a devotee. It's the perfect word for what we're building: a home for fans who are truly <em>junooni</em> about their favourite creators.
                  </p>

                  <div className="space-y-3">
                    <div className="p-4 border-l-4 border-[#e65100] rounded-r-lg bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-1">India-first</h4>
                      <p className="text-sm text-gray-600">Built specifically for the Indian creator ecosystem — Indian payment methods, Indian logistics, Indian fan culture.</p>
                    </div>
                    <div className="p-4 border-l-4 border-[#e65100] rounded-r-lg bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-1">Creator-first revenue model</h4>
                      <p className="text-sm text-gray-600">Transparent payouts, fair margins, and GST-compliant accounting — creators always know what they're earning and when.</p>
                    </div>
                    <div className="p-4 border-l-4 border-[#e65100] rounded-r-lg bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-1">No inventory risk</h4>
                      <p className="text-sm text-gray-600">Powered by print-on-demand fulfillment — products are made only when ordered, so creators never lose money on unsold stock.</p>
                    </div>
                    <div className="p-4 border-l-4 border-[#e65100] rounded-r-lg bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-1">Premium quality</h4>
                      <p className="text-sm text-gray-600">We work with trusted fulfillment partners to ensure every product meets quality standards fans expect from official merch.</p>
                    </div>
                  </div>
                </section>

                {/* Contact */}
                <section id="contact" className="scroll-mt-24">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <Mail size={24} className="text-[#e65100]" />
                    Get in Touch
                  </h2>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Whether you're a creator looking to launch your merch, a fan with a question, or a brand wanting to collaborate — we'd love to hear from you.
                  </p>

                  <div className="bg-orange-50 border-l-4 border-[#e65100] p-6 rounded-lg">
                    <h3 className="mb-4 font-bold text-gray-900">Junooni Team</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail size={20} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <a href="mailto:support@junooni.com" className="text-[#e65100] hover:underline text-sm">
                            support@junooni.com
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone size={20} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Phone</p>
                          <a href="tel:+918694062222" className="text-[#e65100] hover:underline text-sm">
                            +91 8694062222
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Address</p>
                          <p className="text-sm text-gray-600">
                            Junooni<br />
                            Saharanpur, Uttar Pradesh, India
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Instagram size={20} className="text-[#e65100] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Instagram</p>
                          <a
                            href="https://www.instagram.com/bejunooni?utm_source=qr&igsh=YmI4eTJhazMxMHo0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#e65100] hover:underline text-sm"
                          >
                            @junooni.in
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* CTA */}
                <div className="pt-6 mt-8 border-t border-gray-200">
                  <div className="p-4 border border-orange-200 rounded-lg bg-orange-50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-700">
                      <strong>Ready to explore?</strong> Discover official creator merchandise from your favourite Indian creators.
                    </p>
                    <Link
                      href="/in"
                      className="inline-flex items-center gap-2 bg-[#e65100] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#d84315] transition-colors text-sm whitespace-nowrap"
                    >
                      Shop Now <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Back to Top */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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

export default AboutUsPage;