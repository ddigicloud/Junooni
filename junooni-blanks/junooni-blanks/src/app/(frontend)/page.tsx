import React from 'react'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import Image from 'next/image'
import drinkware_junooni from "../../../public/media/Drinkware_Junooni.png"
import drinkware_junooni_mobile from "../../../public/media/Drinkware_Junooni_mobile.png"
import apparels_junooni from "../../../public/media/Apparels_junooni banner.png"
import apparels_junooni_mobile from "../../../public/media/Apparels_junooni_mobile.png"

// Fetch collections directly from Payload
async function getCollectionsData() {
  try {
    //console.log('🔍 Starting to fetch collections data...')
    const payload = await getPayload({ config: configPromise })
    //console.log('✅ Payload instance obtained')
    
    // Fetch all categories
    //console.log('🔍 Fetching categories...')
    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
      depth: 2,
    })
    //console.log('✅ Categories fetched:', categories.totalDocs, 'total')

    if (!categories.docs || categories.docs.length === 0) {
      //console.warn('⚠️ No categories found in database')
      return []
    }

    // Get product count for each category
    //console.log('🔍 Fetching product counts for each category...')
    const categoriesWithProducts = await Promise.all(
      categories.docs.map(async (category) => {
        let productCount = 0
        try {
          const products = await payload.find({
            collection: 'blank-products',
            where: {
              category: {
                equals: category.id,
              },
            },
            limit: 0,
          })
          productCount = products.totalDocs
        } catch (queryError) {
          //console.warn(`⚠️ Could not query products by category for "${category.title}".`)
          productCount = 0
        }

        return {
          id: category.id,
          title: category.title,
          description: category.description || '',
          slug: category.slug,
          image: category.image,
          productCount: productCount,
          parent: category.parent || null,
          children: category.children || [],
        }
      })
    )

    //console.log('✅ All product counts fetched')
    return categoriesWithProducts
  } catch (error) {
    //console.error('❌ Error fetching collections:', error)
    return []
  }
}

// Fetch featured products
// Fetch featured collections
async function getFeaturedCollections() {
  try {
    //console.log('🔍 Starting to fetch featured collections...')
    const payload = await getPayload({ config: configPromise })
    
    const collections = await payload.find({
      collection: 'categories',
      where: {
        and: [
          {
            heroImage: {
              exists: true, // Only get categories that have a hero image
            },
          },
          {
            featuredCategory: {
              equals: true, // Only get categories marked as featured
            },
          },
        ],
      },
      limit: 8,
      depth: 2,
      sort: '-createdAt',
    })

    //console.log('✅ Featured collections fetched:', collections.totalDocs, 'total')
    return collections.docs
  } catch (error) {
    //console.error('❌ Error fetching featured collections:', error)
    return []
  }
}

// Fetch apparels products
// Fetch apparels products
async function getApparelsProducts() {
  try {
    //console.log('🔍 Starting to fetch apparels products...')
    const payload = await getPayload({ config: configPromise })
    
    // Fetch the apparels category with products populated
    const apparelsCategory = await payload.find({
      collection: 'categories',
      where: {
        slug: {
          equals: 'apparels',
        },
      },
      depth: 2, // Important: This will populate the products array
      limit: 1,
    })

    if (!apparelsCategory.docs || apparelsCategory.docs.length === 0) {
      //console.warn('⚠️ Apparels category not found')
      return []
    }

    const category = apparelsCategory.docs[0]
    //console.log('✅ Apparels category found:', category.id)
    
    // Get products from the category's products array
    const products = category.products || []
    //console.log('✅ Apparels products found:', products.length, 'total')
    
    // Return only the first 8 products
    return products
    .filter(product => product.status?.toLowerCase() !== 'draft')
    .slice(0, 8)
    
  } catch (error) {
    //console.error('❌ Error fetching apparels products:', error)
    return []
  }
}

// Fetch all blank products
// Fetch featured products from featured-products collection
async function getFeaturedBlankProducts() {
  try {
    //console.log('🔍 Starting to fetch featured products...')
    const payload = await getPayload({ config: configPromise })
    
    // Fetch the featured-products category with products populated
    const featuredCategory = await payload.find({
      collection: 'categories',
      where: {
        slug: {
          equals: 'featured-products',
        },
      },
      depth: 2, // This will populate the products array
      limit: 1,
    })

    if (!featuredCategory.docs || featuredCategory.docs.length === 0) {
      //console.warn('⚠️ Featured products category not found')
      return []
    }

    const category = featuredCategory.docs[0]
    //console.log('✅ Featured products category found:', category.id)
    
    // Get products from the category's products array
    const products = category.products || []
    //console.log('✅ Featured products found:', products.length, 'total')
    
    // Return only the first 6 products
    return products
  .filter(product => product.status?.toLowerCase() !== 'draft')
  .slice(0, 6)
    
  } catch (error) {
    //console.error('❌ Error fetching featured products:', error)
    return []
  }
}

// Fetch drinkware products
// Fetch drinkware products
async function getDrinkwareProducts() {
  try {
    //console.log('🔍 Starting to fetch drinkware products...')
    const payload = await getPayload({ config: configPromise })
    
    // Fetch the drinkware category with products populated
    const drinkwareCategory = await payload.find({
      collection: 'categories',
      where: {
        slug: {
          equals: 'drinkware',
        },
      },
      depth: 2, // Important: This will populate the products array
      limit: 1,
    })

    if (!drinkwareCategory.docs || drinkwareCategory.docs.length === 0) {
      //console.warn('⚠️ Drinkware category not found')
      return []
    }

    const category = drinkwareCategory.docs[0]
    //console.log('✅ Drinkware category found:', category.id)
    
    // Get products from the category's products array
    const products = category.products || []
    //console.log('✅ Drinkware products found:', products.length, 'total')
    
    // Return only the first 8 products
    return products
    .filter(product => product.status?.toLowerCase() !== 'draft')
    .slice(0, 8)
    
  } catch (error) {
    //console.error('❌ Error fetching drinkware products:', error)
    return []
  }
}

export default async function LandingPage() {
  //console.log('🚀 LandingPage component rendering...')
  
  const collections = await getCollectionsData()
   const featuredCollections = await getFeaturedCollections() // Changed from featuredProducts
  const blankProducts = await getFeaturedBlankProducts()
  const drinkwareProducts = await getDrinkwareProducts()
  const apparelsProducts = await getApparelsProducts()

  //console.log("Apparel products fetched:", apparelsProducts.length);
  //console.log("Apparel products array:", apparelsProducts);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative px-4 py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="mx-auto max-w-7xl">
          {/* Hero Content */}
          <div className="mb-8 text-center sm:mb-10 md:mb-12">
            <div className="mb-4 sm:mb-6">
             {/* Brand Logo */}
              <div className="flex justify-center mb-2">
                <img
                  src="https://studio.junooni.com/assets/junooni_logo_brand_color-FiOJAWKM.png"
                  alt="Junooni"
                  className="h-12 sm:h-20 md:h-24 lg:h-26 object-contain"
                />
              </div>
              <div className="flex items-center justify-center gap-2 px-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <span className="inline-block w-6 sm:w-8 h-px bg-gray-300 dark:bg-gray-600"></span>
                <span className="font-medium tracking-wider uppercase text-center">India's #1 Marketplace For Merch</span>
                <span className="inline-block w-6 sm:w-8 h-px bg-gray-300 dark:bg-gray-600"></span>
              </div>
            </div>
            
            <p className="mb-2 text-xl font-semibold text-gray-700 px-4 sm:mb-3 sm:text-2xl md:text-3xl lg:text-4xl dark:text-gray-200">
              Your Gateway to Passionate Commerce
            </p>
            <p className="max-w-2xl mx-auto px-4 text-base text-gray-600 sm:text-lg md:text-xl dark:text-gray-300">
              Build your personal merch brand, customize products, manage orders, and grow your business — all from one platform
            </p>
          </div>

        </div>
      </section>

      {/* Featured Collections Section */}
      {featuredCollections.length > 0 && (
        <section className="px-4 py-4 sm:py-8 md:py-10 lg:py-12 bg-gray-50 dark:bg-gray-900/50">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 text-center sm:mb-8 md:mb-12">
              <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:mb-3 sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
                Featured Collections
              </h2>
              <p className="max-w-2xl mx-auto px-4 text-sm text-gray-600 sm:text-base md:text-lg lg:text-xl dark:text-gray-300">
                Explore our curated collections of amazing products
              </p>
            </div>

            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:gap-4 sm:mx-0 sm:px-0">
              {featuredCollections.map((collection) => (
                <div key={collection.id} className="min-w-[220px] sm:min-w-[250px] flex-shrink-0 first:ml-0 last:mr-0">
                  <CollectionCard collection={collection} />
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* Blank Products Section */}
      {blankProducts.length > 0 && (
        <section className="px-4 py-4 sm:py-8 md:py-10 lg:py-12 bg-white dark:bg-gray-900">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col items-start justify-between gap-3 mb-4 sm:gap-4 md:flex-row md:items-center sm:mb-6">
                <div>
                  <h2 className="mb-1 text-2xl font-bold text-gray-900 sm:mb-2 sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
                    Blank Products Catalog
                  </h2>
                  <p className="text-sm text-gray-600 sm:text-base md:text-lg dark:text-gray-300">
                    Browse our curated catalogs ready for your custom designs
                  </p>
                </div>
                
                <Link
                  href="/products"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all shadow-lg rounded-xl hover:opacity-90 active:scale-95 whitespace-nowrap"
                  style={{ backgroundColor: '#e65100' }}
                >
                  <span>View All</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="relative -mx-4 sm:mx-0">
              <div className="flex gap-4 pb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:gap-6 sm:px-0">
                {blankProducts.map((product) => (
                  <StudioStyleProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none" />
            </div>
          </div>
        </section>
      )}

     {/* Drinkware Banner Section */}
      <section className="relative px-4 py-3 overflow-hidden sm:py-6 md:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative h-[280px] overflow-hidden sm:h-96 md:h-[32rem] lg:h-[36rem] rounded-2xl sm:rounded-3xl">
            {/* Desktop Image - hidden on mobile */}
            <Image
              src={drinkware_junooni}
              alt="Drinkware Collection"
              fill
              className="hidden sm:block object-cover"
              priority
            />
            
            {/* Mobile Image - visible only on mobile */}
            <Image
              src={drinkware_junooni_mobile}
              alt="Drinkware Collection"
              fill
              className="block sm:hidden object-contain"
              priority
            />
            
            {/* Content wrapper */}
            <div className="relative z-10 flex flex-col justify-between h-full px-5 py-12 sm:justify-center sm:px-8 md:px-12 lg:px-16">
              {/* Text content */}
              <div className="pt-4 sm:pt-0">
                <h2 className="mb-2 text-2xl font-black text-white sm:mb-3 sm:text-3xl md:text-4xl lg:text-5xl drop-shadow-lg">
                  Drinkware <br className="block sm:hidden" />Collection
                </h2>
                <p className="max-w-xl mb-0 sm:mb-4 text-sm text-white sm:text-base md:text-lg lg:text-xl drop-shadow-md hidden sm:block">
                  Discover our premium collection of custom drinkware - mugs, bottles, and more!
                </p>
              </div>
              
              {/* Button */}
              <div className="pb-4 sm:pb-0 sm:mt-4">
              <Link
                href="/collection/drinkware"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white transition-all duration-300 transform shadow-2xl sm:gap-3 sm:px-8 sm:py-4 sm:text-base md:text-lg rounded-lg sm:rounded-xl hover:scale-105 hover:shadow-orange-500/50 active:scale-95"
                style={{ backgroundColor: '#e65100' }}
              >
                <span>Explore Now</span>
                <svg
                  className="w-3.5 h-3.5 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Drinkware Products Section */}
      <section className="px-4 py-3 bg-gray-50 sm:py-6 md:py-8 lg:py-10 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl">
          
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              
              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
                  Drinkware Products
                </h2>
                <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base md:text-lg dark:text-gray-300">
                  Premium quality drinkware for every occasion
                </p>
              </div>

              {/* View All Button */}
              <Link
                href="/collection/drinkware"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-opacity shadow-lg rounded-xl hover:opacity-90 active:scale-95 whitespace-nowrap self-start"
                style={{ backgroundColor: "#e65100" }}
              >
                <span>View All</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Products Horizontal Scroll */}
          {drinkwareProducts.length > 0 ? (
            <div className="relative -mx-4 sm:mx-0">
              <div className="flex gap-4 pb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:gap-6 sm:px-0">
                {drinkwareProducts.map((product) => (
                  <StudioStyleProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 dark:from-gray-900/50 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-base text-gray-500 sm:text-lg dark:text-gray-400">
                No drinkware products available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Apparels Banner Section */}
      <section className="relative px-4 py-3 overflow-hidden sm:py-6 md:py-8 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="relative h-[280px] overflow-hidden sm:h-96 md:h-[32rem] lg:h-[36rem] rounded-2xl sm:rounded-3xl">
            {/* Desktop Image - hidden on mobile */}
            <Image
              src={apparels_junooni}
              alt="Apparels Collection"
              fill
              className="hidden sm:block object-cover"
              priority
            />
            
            {/* Mobile Image - visible only on mobile */}
            <Image
              src={apparels_junooni_mobile}
              alt="Apparels Collection"
              fill
              className="block sm:hidden object-contain"
              priority
            />
            
            {/* Content wrapper */}
            <div className="relative z-10 flex flex-col justify-between h-full px-5 py-12 sm:justify-center sm:px-8 md:px-12 lg:px-16">
              {/* Text content */}
              <div className="pt-2 sm:pt-0">
                <h2 className="mb-2 text-2xl font-black text-white sm:mb-3 sm:text-3xl md:text-4xl lg:text-5xl drop-shadow-lg">
                  Apparels <br className="block sm:hidden" /> Collection
                </h2>
                <p className="max-w-xl hidden sm:block mb-0 sm:mb-4 text-sm text-white sm:text-base md:text-lg lg:text-xl drop-shadow-md">
                  Explore our premium collection of custom apparel - t-shirts, hoodies, and more!
                </p>
              </div>
              
              {/* Button */}
             <div className="pb-8 sm:pb-0 sm:mt-4">
              <Link
                href="/collection/apparels"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white transition-all duration-300 transform shadow-2xl sm:gap-3 sm:px-8 sm:py-4 sm:text-base md:text-lg rounded-lg sm:rounded-xl hover:scale-105 hover:shadow-orange-500/50 active:scale-95"
                style={{ backgroundColor: '#e65100' }}
              >
                <span>Explore Now</span>
                <svg
                  className="w-3.5 h-3.5 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
            </div>
          </div>
        </div>
      </section>
      

      {/* Apparels Products Section */}
      <section className="px-4 py-3 bg-white sm:py-6 md:py-8 lg:py-10 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col items-start justify-between gap-3 mb-4 sm:gap-4 md:flex-row md:items-center sm:mb-6">
              <div>
                <h2 className="mb-1 text-2xl font-bold text-gray-900 sm:mb-2 sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
                  Apparels Products
                </h2>
                <p className="text-sm text-gray-600 sm:text-base md:text-lg dark:text-gray-300">
                  Premium quality apparels for every style
                </p>
              </div>
              
              <Link
                href="/collection/apparels"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all shadow-lg rounded-xl hover:opacity-90 active:scale-95 whitespace-nowrap"
                style={{ backgroundColor: '#e65100' }}
              >
                <span>View All</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Products Horizontal Scroll */}
          {apparelsProducts.length > 0 ? (
            <div className="relative -mx-4 sm:mx-0">
              <div className="flex gap-4 pb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:gap-6 sm:px-0">
                {apparelsProducts.map((product) => (
                  <StudioStyleProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-base text-gray-500 sm:text-lg dark:text-gray-400">
                No apparel products available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-8 sm:py-12 md:py-16 lg:py-20 bg-white dark:bg-gray-900 hidden sm:block">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-900 sm:mb-8 md:mb-12 sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
            Why Choose Junooni?
          </h2>
          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Quality Products"
              description="Curated selection of high-quality merchandise from verified creators"
              icon="✨"
            />
            <FeatureCard
              title="Creator Friendly"
              description="Powerful tools and analytics to help creators succeed and grow"
              icon="🚀"
            />
            <FeatureCard
              title="Secure Platform"
              description="Safe and secure transactions with buyer protection guarantee"
              icon="🔒"
            />
            <FeatureCard
              title="Fast Shipping"
              description="Quick and reliable delivery across India with tracking"
              icon="📦"
            />
            <FeatureCard
              title="Custom Designs"
              description="Personalize products with unique designs and artwork"
              icon="🎨"
            />
            <FeatureCard
              title="24/7 Support"
              description="Always here to help with any questions or concerns"
              icon="💬"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-900 sm:mb-8 md:mb-12 sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
            How Creators Sell on Junooni
          </h2>

          <div className="grid gap-6 sm:gap-8 md:gap-12 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <StepCard
              step="1"
              title="Create Your Store"
              description="Sign up, set up your creator profile, and launch your store on marketplace"
            />
            <StepCard
              step="2"
              title="Design & Publish"
              description="Use our easy design tools to create merch and publish products in minutes"
            />
            <StepCard
              step="3"
              title="Sell & Earn"
              description="We handle production, payments, and delivery while you earn from every sale"
            />
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="px-4 py-8 sm:py-12 md:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-900 sm:mb-8 md:mb-12 sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
            What Creators Say
          </h2>

          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <TestimonialCard
              quote="Junooni made it incredibly easy to launch my merch store. The platform is intuitive and the support is fantastic."
              author="Priya S."
              role="Content Creator"
              rating={5}
            />
            <TestimonialCard
              quote="From designing products to tracking sales, everything is seamless. Junooni handles the hard work for creators."
              author="Rahul K."
              role="Instagram Creator"
              rating={5}
            />
            <TestimonialCard
              quote="Junooni helped me monetize my audience without worrying about inventory or logistics. The analytics are super helpful."
              author="Amit M."
              role="YouTuber"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 py-10 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-3 text-2xl font-bold text-white sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl">
            Ready to Get Started?
          </h2>
          <p className="mb-5 text-base text-orange-100 sm:mb-6 sm:text-lg md:text-xl lg:text-2xl px-4">
            Join thousands of happy customers and successful creators
          </p>
          <div className="flex flex-col gap-3 px-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <Link
              href="/products"
              className="px-6 py-3 text-base font-semibold transition-all bg-white shadow-lg sm:px-8 sm:py-4 sm:text-lg rounded-xl hover:bg-gray-100 active:scale-95"
              style={{ color: '#e65100' }}
            >
              Start Shopping
            </Link>
            <a
              href="https://studio.junooni.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 text-base font-semibold text-white transition-all border-2 border-white shadow-lg sm:px-8 sm:py-4 sm:text-lg rounded-xl hover:bg-white/10 active:scale-95"
            >
              Become a Creator
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}

    </div>
  )
}

// Collection Card Component
function CollectionCard({ collection }: { collection: any }) {
  const collectionName = collection.title || 'Untitled Collection'
  const collectionSlug = collection.slug || ''
  
  // OPTIMIZED: Use smaller image sizes first
  const getOptimizedImageUrl = () => {
    if (!collection.heroImage) return null
    
    return collection.heroImage.sizes?.thumbnail?.url 
      || collection.heroImage.sizes?.small?.url 
      || collection.heroImage.sizes?.medium?.url 
      || collection.heroImage.url
  }
  
  const imageUrl = getOptimizedImageUrl()
  const productCount = collection.productCount || 0

  return (
    <Link
      href={`/collection/${collectionSlug}`}
      className="group relative overflow-hidden transition-all duration-300 transform bg-white shadow-lg dark:bg-gray-800 rounded-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 md:active:scale-100 md:hover:-translate-y-2"
    >
      <div className="relative w-full h-48 overflow-hidden rounded-md sm:h-48 md:h-64">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={collectionName}
            loading="lazy" // Add lazy loading
            decoding="async" // Add async decoding
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-2xl font-bold sm:text-3xl" style={{ color: '#e65100' }}>
            {collectionName.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Product count badge */}
        {productCount > 0 && (
          <div className="absolute top-2 right-2 px-2 py-0.5 text-xs font-bold text-white rounded-full backdrop-blur-sm sm:top-3 sm:right-3 sm:px-3 sm:py-1" style={{ backgroundColor: 'rgba(230, 81, 0, 0.9)' }}>
            {productCount} {productCount === 1 ? 'Product' : 'Products'}
          </div>
        )}
      </div>
      
      <div className="p-3 sm:p-4">
        <h3 className="text-sm font-bold text-gray-900 sm:text-base md:text-lg dark:text-white line-clamp-2 group-hover:text-[#e65100] transition-colors">
          {collectionName}
        </h3>
        
        {collection.description?.root?.children?.[0]?.children?.[0]?.text && (
          <p className="mt-1.5 text-xs text-gray-600 sm:mt-2 sm:text-sm dark:text-gray-400 line-clamp-2">
            {collection.description.root.children[0].children[0].text}
          </p>
        )}
        
        <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold sm:gap-2 sm:mt-3 sm:text-sm" style={{ color: '#e65100' }}>
          <span>Explore Collection</span>
          <svg className="w-3 h-3 transition-transform sm:w-4 sm:h-4 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

// Studio Style Product Card Component (Used for ALL product sections now)
function StudioStyleProductCard({ product }: { product: any }) {
  const productName = product.name || product.title || 'Untitled Product'
  const productSlug = product.slug || ''
  
   // OPTIMIZED: Extract image URL with proper fallback hierarchy
  const getOptimizedImageUrl = () => {
    if (product.displayImages && product.displayImages.length > 0) {
      const displayImg = product.displayImages[0]
      // Use thumbnail or small size first for faster loading
      return displayImg.image?.sizes?.thumbnail?.url 
        || displayImg.image?.sizes?.small?.url 
        || displayImg.image?.sizes?.medium?.url 
        || displayImg.image?.url
        || null
    }
    
    // Fallback to printT images
    if (product.printT && product.printT.length > 0) {
      const printTech = product.printT[0]
      if (printTech.custAreas && printTech.custAreas.length > 0) {
        const custArea = printTech.custAreas[0]
        if (custArea.designCanvasPhotos && custArea.designCanvasPhotos.length > 0) {
          const photo = custArea.designCanvasPhotos[0].photo
          return photo?.sizes?.thumbnail?.url 
            || photo?.sizes?.small?.url 
            || photo?.url 
            || null
        }
      }
    }
    
    return null
  }
  
  const imageUrl = getOptimizedImageUrl()
  const suggestedPrice = product.pricing?.suggestedRetail || product.price
  const cost = product.cost
  const colorOptions = product.colorOptions || []
  const status = product.status
  const shouldShowStatus = status && status.toLowerCase() !== 'active'

  const getStatusStyle = (status: string) => {
    const statusLower = status.toLowerCase()
    
    if (statusLower === 'coming soon' || statusLower === 'coming_soon') {
      return {
        background: '#e65100',
        shadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
      }
    }
    
    if (statusLower === 'draft') {
      return {
       background: '#e65100',
        shadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
      }
    }
    
    if (statusLower === 'discontinued') {
      return {
        background: '#e65100',
        shadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
      }
    }
    
    if (statusLower === 'out of stock' || statusLower === 'out_of_stock') {
      return {
        background: '#e65100',
        shadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
      }
    }
    
    return {
      background: '#e65100',
      shadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
    }
  }

  const statusStyle = shouldShowStatus ? getStatusStyle(status) : null

  return (
    <Link
      href={`/products/${productSlug}`}
      className="flex-shrink-0 w-64 sm:w-72 md:w-80 group snap-start"
    >
      <div className="overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 rounded-xl hover:shadow-xl active:scale-95 md:active:scale-100">
        <div className="relative w-full overflow-hidden bg-gray-50 dark:bg-gray-700" style={{ paddingBottom: '125%' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={productName}
              loading="lazy" // Add lazy loading
              decoding="async" // Add async decoding
              className="absolute inset-0 object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold" style={{ color: '#e65100' }}>
              {productName.charAt(0).toUpperCase()}
            </div>
          )}
          
          {shouldShowStatus && statusStyle && (
            <div className="absolute top-2 right-2 z-10 sm:top-3 sm:right-3">
              <div 
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white rounded-lg backdrop-blur-sm sm:px-4 sm:py-2"
                style={{ 
                  background: statusStyle.background,
                  boxShadow: statusStyle.shadow
                }}
              >
                 {status.toLowerCase() === 'coming_soon' ? 'Coming Soon' : status}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 sm:p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900 sm:mb-3 sm:text-base dark:text-white line-clamp-2">
            {productName}
          </h3>

          {product.printT && product.printT.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 sm:gap-2 sm:mb-3">
            {product.printT.map((tech: any, index: number) => {
              // Get the technology name - check if it's a nested object or direct value
              const techName = typeof tech === 'object' 
                ? (tech.technologyName || tech.name || tech.title || tech)
                : tech;
              
              // Format the technology name
              const formatTechName = (name: string) => {
                const upperName = String(name).toUpperCase();
                
                // Keep DTG and DTF in all caps
                if (upperName === 'DTG' || upperName === 'DTF') {
                  return upperName;
                }
                
                // Capitalize first letter of each word
                return String(name)
                  .toLowerCase()
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
              };
              
              return (
                <span
                  key={tech.id || index}
                  className="px-2 py-0.5 text-xs font-medium rounded sm:py-1"
                  style={{ 
                    backgroundColor: index === 0 ? '#FFF4E6' : '#E3F2FD',
                    color: index === 0 ? '#E65100' : '#1976D2'
                  }}
                >
                  {formatTechName(techName)}
                </span>
              );
            })}
          </div>
        )}

          {colorOptions.length > 0 && (
            <div className="mb-2 sm:mb-3">
              <div className="flex items-center gap-1.5 mb-1.5 sm:gap-2 sm:mb-2">
                <span className="text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">Colors:</span>
                <div className="flex gap-1 sm:gap-1.5">
                  {colorOptions.slice(0, 6).map((color: any, index: number) => (
                    <div
                      key={color.id || index}
                      className="w-5 h-5 border-2 border-gray-300 rounded-full sm:w-6 sm:h-6 dark:border-gray-600"
                      style={{ backgroundColor: color.colorHex || '#cccccc' }}
                      title={color.colorName}
                    />
                  ))}
                  {colorOptions.length > 6 && (
                    <div className="flex items-center justify-center w-5 h-5 text-xs font-semibold text-gray-600 bg-gray-200 border-2 border-gray-300 rounded-full sm:w-6 sm:h-6 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-600">
                      +{colorOptions.length - 6}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-200 sm:pt-3 dark:border-gray-700">
            <div>
              {cost ? (
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
                    ₹{cost}
                  </span>
                  
                </div>
              ) : (
                <span className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">Price on request</span>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">no minimum</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Feature Card Component
function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="p-5 transition-all duration-300 transform bg-white shadow-md sm:p-6 md:p-8 dark:bg-gray-800 rounded-xl sm:rounded-2xl hover:shadow-xl hover:-translate-y-1 active:scale-95 md:active:scale-100">
      <div className="mb-3 text-3xl sm:mb-4 sm:text-4xl md:text-5xl">{icon}</div>
      <h3 className="mb-2 text-lg font-bold text-gray-900 sm:mb-3 sm:text-xl md:text-2xl dark:text-white">{title}</h3>
      <p className="text-sm text-gray-600 sm:text-base dark:text-gray-300">{description}</p>
    </div>
  )
}

// Stat Card Component
function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="mb-1 text-2xl font-bold sm:mb-2 sm:text-3xl md:text-4xl" style={{ color: '#e65100' }}>
        {number}
      </div>
      <div className="text-xs text-gray-600 sm:text-sm md:text-base dark:text-gray-400">{label}</div>
    </div>
  )
}

// Step Card Component
function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div 
        className="inline-flex items-center justify-center w-12 h-12 mx-auto mb-3 text-xl font-bold text-white rounded-full sm:w-14 sm:h-14 sm:mb-4 sm:text-2xl md:w-16 md:h-16 md:text-3xl"
        style={{ backgroundColor: '#e65100' }}
      >
        {step}
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-900 sm:mb-3 sm:text-xl md:text-2xl dark:text-white">{title}</h3>
      <p className="text-sm text-gray-600 sm:text-base dark:text-gray-300">{description}</p>
    </div>
  )
}

// Testimonial Card Component
function TestimonialCard({ quote, author, role, rating }: { quote: string; author: string; role: string; rating: number }) {
  return (
    <div className="p-5 bg-white shadow-md sm:p-6 md:p-8 dark:bg-gray-800 rounded-xl sm:rounded-2xl">
      <div className="flex gap-0.5 mb-3 sm:gap-1 sm:mb-4">
        {[...Array(rating)].map((_, i) => (
          <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5" fill="#e65100" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="mb-3 text-sm italic text-gray-600 sm:mb-4 sm:text-base dark:text-gray-300">
        "{quote}"
      </p>
      <div>
        <p className="text-sm font-semibold text-gray-900 sm:text-base dark:text-white">{author}</p>
        <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">{role}</p>
      </div>
    </div>
  )
}

// Metadata for SEO
export const metadata: Metadata = {
  title: 'Junooni - India\'s #1 Marketplace For Merch',
  description: 'Discover amazing creator merchandise on Junooni or grow your business with our creator platform. Shop from thousands of products or start selling today.',
  keywords: ['merchandise', 'creator marketplace', 'custom merch', 'India', 'online store'],
  openGraph: {
    title: 'Junooni - India\'s #1 Marketplace For Merch',
    description: 'Your gateway to passionate commerce. Shop creator merchandise or start your own merch business.',
    type: 'website',
  },
}