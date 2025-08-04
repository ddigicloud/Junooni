'use client'

import { listCategories } from "@lib/data/categories";
import { Text, clx } from "@medusajs/ui";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { listCollections } from "@lib/data/collections";
import { useState, useEffect } from "react";
import NewsLetter from "@modules/home/components/NewsLetter";

// Add these icons - you can install react-icons or use your preferred icon library
// import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
// import { HiMail, HiPhone, HiLocationMarker } from "react-icons/hi";

export default async function MainFooter() {
  const productCategories = await listCategories();

  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      const data = await listCollections();
      setCollections(data.collections);
      setLoading(false);
    };

    fetchCollections();
  }, []);

  if (loading) {
    return (
      <footer className="w-full bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="container px-6 py-16 mx-auto">
          <div className="flex items-center justify-center">
            <div className="animate-pulse">
              <div className="w-32 h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full border-t bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 border-gray-200/60">
      {/* Newsletter Section */}
      <div className="border-b bg-white/80 backdrop-blur-sm border-gray-200/60">
        <NewsLetter />
      </div>

      {/* Main Footer Content */}
      <div className="container px-6 py-16 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-6 lg:gap-16">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">
                  JUNOONI
                </h2>
                <p className="max-w-sm mt-3 leading-relaxed text-gray-600">
                  Discover premium quality products crafted with passion. Your trusted partner for exceptional shopping experiences.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600 transition-colors hover:text-gray-900">
                  {/* <HiMail className="w-5 h-5 text-gray-400" /> */}
                  <span className="text-sm">support@junooni.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 transition-colors hover:text-gray-900">
                  {/* <HiPhone className="w-5 h-5 text-gray-400" /> */}
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-800">Follow Us</h4>
                <div className="flex gap-3">
                  {[
                    { name: 'Facebook', icon: 'F' },
                    { name: 'Twitter', icon: 'T' },
                    { name: 'Instagram', icon: 'I' },
                    { name: 'LinkedIn', icon: 'L' }
                  ].map((social) => (
                    <a
                      key={social.name}
                      href="#"
                      className="w-10 h-10 bg-white shadow-sm border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-white hover:bg-gray-900 hover:border-gray-900 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                      aria-label={social.name}
                    >
                      <span className="text-sm font-semibold">{social.icon}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              
              {/* Categories */}
              {productCategories?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="relative text-lg font-semibold text-gray-900">
                    Categories
                    <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-gray-400 to-transparent"></div>
                  </h3>
                  <ul className="space-y-3">
                    {productCategories.slice(0, 5).map((c) => {
                      if (c.parent_category) return null;
                      const children = c.category_children || [];

                      return (
                        <li key={c.id} className="group">
                          <LocalizedClientLink
                            className="inline-block text-sm font-medium text-gray-600 transition-colors transition-transform duration-200 hover:text-gray-900 group-hover:translate-x-1"
                            href={`/categories/${c.handle}`}
                          >
                            {c.name}
                          </LocalizedClientLink>
                          {children.length > 0 && (
                            <ul className="pl-3 mt-2 ml-4 space-y-2 border-l border-gray-200">
                              {children.slice(0, 3).map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink 
                                    href={`/categories/${child.handle}`} 
                                    className="text-xs text-gray-500 transition-colors duration-200 hover:text-gray-700"
                                  >
                                    {child.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Collections */}
              {collections && collections.length > 0 && (
                <div className="space-y-4">
                  <h3 className="relative text-lg font-semibold text-gray-900">
                    Collections
                    <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-gray-400 to-transparent"></div>
                  </h3>
                  <ul className="space-y-3">
                    {collections.slice(0, 6).map((c) => (
                      <li key={c.id} className="group">
                        <LocalizedClientLink
                          className="inline-block text-sm font-medium text-gray-600 transition-colors transition-transform duration-200 hover:text-gray-900 group-hover:translate-x-1"
                          href={`/collections/${c.handle}`}
                        >
                          {c.title}
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Customer Support */}
              <div className="space-y-4">
                <h3 className="relative text-lg font-semibold text-gray-900">
                  Support
                  <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-gray-400 to-transparent"></div>
                </h3>
                <ul className="space-y-3">
                  {[
                    { href: "/faqs", label: "FAQs" },
                    { href: "/orders-shipping", label: "Shipping Info" },
                    { href: "/payment-methods", label: "Payment Methods" },
                    { href: "/product-care", label: "Product Care" },
                    { href: "/track-order", label: "Track Order" },
                    { href: "/size-guide", label: "Size Guide" }
                  ].map((link) => (
                    <li key={link.href} className="group">
                      <LocalizedClientLink 
                        href={link.href} 
                        className="inline-block text-sm font-medium text-gray-600 transition-colors transition-transform duration-200 hover:text-gray-900 group-hover:translate-x-1"
                      >
                        {link.label}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Links */}
              <div className="space-y-4">
                <h3 className="relative text-lg font-semibold text-gray-900">
                  Quick Links
                  <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-gray-400 to-transparent"></div>
                </h3>
                <ul className="space-y-3">
                  {[
                    { href: "/about", label: "About Us" },
                    { href: "/contact", label: "Contact" },
                    { href: "/careers", label: "Careers" },
                    { href: "/blog", label: "Blog" },
                    { href: "/affiliate", label: "Affiliate Program" },
                    { href: "/gift-cards", label: "Gift Cards" }
                  ].map((link) => (
                    <li key={link.href} className="group">
                      <LocalizedClientLink 
                        href={link.href} 
                        className="inline-block text-sm font-medium text-gray-600 transition-colors transition-transform duration-200 hover:text-gray-900 group-hover:translate-x-1"
                      >
                        {link.label}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges / Features */}
        <div className="pt-12 mt-16 border-t border-gray-200/60">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Free Shipping", desc: "On orders over $99", icon: "🚚" },
              { title: "Easy Returns", desc: "30-day return policy", icon: "↩️" },
              { title: "Secure Payment", desc: "SSL encrypted checkout", icon: "🔒" },
              { title: "24/7 Support", desc: "Round-the-clock assistance", icon: "💬" }
            ].map((feature) => (
              <div key={feature.title} className="text-center group">
                <div className="mb-3 text-3xl transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>
                <h4 className="mb-1 text-sm font-semibold text-gray-900">{feature.title}</h4>
                <p className="text-xs text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer Bottom */}
      <div className="border-t bg-white/60 backdrop-blur-sm border-gray-200/60">
        <div className="container px-6 py-6 mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Text className="text-sm text-gray-600">
                © {new Date().getFullYear()} Junooni Store. All rights reserved.
              </Text>
              <div className="flex gap-1 text-xs text-gray-500">
                <span>Made with</span>
                <span className="text-red-500 animate-pulse">♥</span>
                <span>for amazing customers</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <LocalizedClientLink 
                href="/privacy-policy" 
                className="text-gray-600 transition-colors duration-200 hover:text-gray-900 hover:underline"
              >
                Privacy Policy
              </LocalizedClientLink>
              <LocalizedClientLink 
                href="/terms-conditions" 
                className="text-gray-600 transition-colors duration-200 hover:text-gray-900 hover:underline"
              >
                Terms & Conditions
              </LocalizedClientLink>
              <LocalizedClientLink 
                href="/cookie-policy" 
                className="text-gray-600 transition-colors duration-200 hover:text-gray-900 hover:underline"
              >
                Cookie Policy
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}