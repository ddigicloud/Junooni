import { Heading, Text, Button } from "@medusajs/ui"
import { ShoppingBag, Heart, TrendingUp, Sparkles } from "lucide-react"

import InteractiveLink from "@modules/common/components/interactive-link"

const EmptyCartMessage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16" data-testid="empty-cart-message">
      {/* Main Content Container */}
      <div className="max-w-md text-center space-y-6">
        
        {/* Icon with Background */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full"></div>
          <div className="relative flex items-center justify-center w-full h-full">
            <ShoppingBag className="w-12 h-12 text-[#e65100]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <Heading level="h1" className="text-2xl font-semibold text-gray-900">
            Your cart is empty
          </Heading>
          <Text className="text-gray-600 text-base leading-relaxed">
            Looks like you haven't added anything to your cart yet. 
            Discover our amazing products and find something you love!
          </Text>
        </div>

        {/* Primary CTA */}
        <div className="pt-4 flex justify-center">
          <a href="/store" className="focus:outline-none focus:ring-0 no-underline">
            <Button
              size="large"
              className="w-full bg-[#e65100] hover:bg-[#d84315] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] border-none outline-none focus:ring-0 focus:border-none shadow-none"
            >
              Start Shopping
            </Button>
          </a>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a href="/collections/latestdrops" className="flex-1">
            <Button 
              variant="secondary" 
              className="w-full border-2 border-[#e65100] hover:bg-[#e65100] text-[#e65100] hover:text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-md shadow-none"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Browse Collections
            </Button>
          </a>
          
          <a href="/wishlist" className="flex-1">
            <Button 
              variant="secondary" 
              className="w-full border-2 border-[#e65100] hover:border-[#e65100] hover:bg-[#e65100] text-gray-700 hover:text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-md shadow-none"
            >
              <Heart className="w-4 h-4 mr-2" />
              View Wishlist
            </Button>
          </a>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="mt-16 w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-[#e65100] bg-opacity-10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 mr-2 text-[#e65100]" />
            <Text className="text-[#e65100] font-semibold">
              Popular Categories
            </Text>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Men", href: "/categories/men", emoji: "👔", gradient: "from-blue-50 to-blue-100" },
            { name: "Women", href: "/categories/women", emoji: "👗", gradient: "from-pink-50 to-pink-100" },
            { name: "Kids", href: "/categories/kids", emoji: "🧸", gradient: "from-yellow-50 to-yellow-100" },
            { name: "Official Merchandise", href: "/categories/merch", emoji: "⭐", gradient: "from-purple-50 to-purple-100" }
          ].map((category) => (
            <a 
              key={category.name} 
              href={category.href}
              className="group"
            >
              <div className={`bg-gradient-to-br ${category.gradient} border-2 border-transparent hover:border-[#e65100] rounded-xl p-6 text-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg cursor-pointer`}>
                <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                  {category.emoji}
                </div>
                <Text className="font-semibold text-gray-900 group-hover:text-[#e65100] transition-colors duration-200">
                  {category.name}
                </Text>
              </div>
            </a>
          ))}
        </div>
      </div>


    </div>
  )
}

export default EmptyCartMessage