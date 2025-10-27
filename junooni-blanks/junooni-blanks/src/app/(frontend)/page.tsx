// import PageTemplate, { generateMetadata } from './[slug]/page'

// export default PageTemplate

// export { generateMetadata }

import React from 'react'
import type { Metadata } from 'next'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-4 lg:py4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h1 className="mb-6 text-5xl font-black md:text-7xl lg:text-8xl" style={{ color: '#e65100' }}>
              Junooni
            </h1>
            <p className="mb-4 text-xl font-semibold text-gray-700 md:text-3xl dark:text-gray-200">
              Your Gateway to Passionate Commerce
            </p>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 md:text-xl dark:text-gray-300">
              Discover amazing products or grow your business with our platform
            </p>
          </div>

          {/* Main CTA Cards */}
          <div className="grid max-w-5xl gap-8 mx-auto mt-16 md:grid-cols-2">
            {/* Customer Storefront Card */}
            <a 
              href="https://www.junooni.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-8 md:p-12 bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-[#e65100]"
            >
              <div className="text-center">
                <div className="mb-6 text-6xl md:text-7xl">🛍️</div>
                <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
                  Shop Now
                </h2>
                <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
                  Browse our curated collection of products
                </p>
                <div 
                  className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white transition-transform rounded-xl group-hover:scale-105"
                  style={{ backgroundColor: '#e65100' }}
                >
                  Visit Storefront
                  <svg 
                    className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </a>

            {/* creator Studio Card */}
            <a 
              href="https://www.studio.junooni.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-8 md:p-12 bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-[#e65100]"
            >
             <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-3 shadow-lg">
                    <svg className="w-8 h-8 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
                  Creator Studio
                </h2>
                <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
                  Manage your products and grow your business
                </p>
                <div 
                  className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white transition-transform rounded-xl group-hover:scale-105"
                  style={{ backgroundColor: '#e65100' }}
                >
                  Go to Studio
                  <svg 
                    className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-3xl font-bold text-center text-gray-900 md:text-4xl dark:text-white">
            Why Choose Junooni?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              title="Quality Products"
              description="Curated selection of high-quality items from trusted creators"
              icon="✨"
            />
            <FeatureCard
              title="creator Friendly"
              description="Powerful tools to help creators succeed and grow their business"
              icon="🤝"
            />
            <FeatureCard
              title="Secure Platform"
              description="Safe and secure transactions for both buyers and sellers"
              icon="🔒"
            />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-5xl dark:text-white">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
            Join thousands of happy customers and successful creators
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.junooni.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 text-lg font-semibold text-white transition-all shadow-lg rounded-xl hover:opacity-90"
              style={{ backgroundColor: '#e65100' }}
            >
              Start Shopping
            </a>
            <a
              href="https://www.studio.junooni.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 text-lg font-semibold text-gray-900 transition-all bg-gray-300 shadow-lg dark:bg-gray-700 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Become a Creator
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

// Feature Card Component
function FeatureCard({ 
  title, 
  description, 
  icon 
}: { 
  title: string
  description: string
  icon: string
}) {
  return (
    <div className="p-8 transition-all duration-300 transform bg-white shadow-md dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-1">
      <div className="mb-4 text-5xl">{icon}</div>
      <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-lg text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}

// Metadata for SEO
export const metadata: Metadata = {
  title: 'Junooni',
  description: 'Discover amazing products on Junooni or grow your business with our creator platform',
}