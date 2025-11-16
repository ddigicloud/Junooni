import React, { useState } from "react";
import { 
  Search, 
  Book, 
  Package, 
  Truck, 
  Palette, 
  Upload, 
  MessageCircle, 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ArrowLeft,
  Mail,
  Phone
} from "lucide-react";

import ChatwootWidget from '@/components/ChatwootWidget';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Brand colors - strictly using only defined brand colors
const BRAND = {
  primary: "#e65100", 
  secondary: "#ac1900", 
  accent: "#581845", 
  light: "#FFC300",
  background: "#FFEFD5", 
  warning: "#F39C12",
  error: "#E74C3C",
  textPrimary: "#333333",
  textSecondary: "#666666",
  textLight: "#999999"
};

// Simplified help article interface
interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

// Simplified FAQ interface
interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to open Chatwoot widget
  const openChatwoot = () => {
    // Check if the Chatwoot API is available
    if (window.$chatwoot && typeof window.$chatwoot.toggle === 'function') {
      // Use the confirmed working method
      window.$chatwoot.toggle();
    } else {
      //console.log('Chatwoot API not ready yet, waiting...');
      
      // Notify the user
      toast({
        title: "Opening Support Chat",
        description: "Please wait a moment while we connect you to support...",
      });
      
      // Try again after a short delay to allow for Chatwoot initialization
      setTimeout(() => {
        if (window.$chatwoot && typeof window.$chatwoot.toggle === 'function') {
          window.$chatwoot.toggle();
        } else {
          //console.error('Chatwoot API still not available after delay');
          toast({
            title: "Support Chat Issue",
            description: "The support chat couldn't be opened. Please refresh the page and try again.",
            variant: "destructive",
          });
        }
      }, 1500); // 1.5 second delay
    }
  };
  
  // Simplified essential articles
  const articles: HelpArticle[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Complete your profile and add your first product",
      category: "getting-started",
      readTime: "3 min read",
      icon: <CheckCircle2 className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="p-6 rounded-lg border-2" style={{ backgroundColor: `${BRAND.background}`, borderColor: BRAND.primary }}>
            <h3 className="text-xl font-semibold mb-3" style={{ color: BRAND.primary }}>
              Welcome to Junooni Creator Studio!
            </h3>
            <p className="text-gray-700">
              Follow these simple steps to set up your store and start selling.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Setup Steps</h4>
            <div className="space-y-3">
              {[
                "Complete your profile information",
                "Add your banking details for payments",
                "Upload your first product",
                "Choose fulfillment method",
                "Your store is ready!"
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div 
                    className="flex items-center justify-center w-6 h-6 rounded-full text-white text-sm font-medium"
                    style={{ backgroundColor: BRAND.primary }}
                  >
                    {index + 1}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg border" style={{ backgroundColor: `${BRAND.light}22`, borderColor: BRAND.light }}>
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 mt-0.5" style={{ color: BRAND.warning }} />
              <div>
                <h4 className="font-medium" style={{ color: BRAND.textPrimary }}>Need Help?</h4>
                <p className="text-sm mt-1" style={{ color: BRAND.textSecondary }}>
                  Contact our support team if you get stuck on any step.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "upload-products",
      title: "Upload Products",
      description: "Add products to your store step by step",
      category: "products",
      readTime: "5 min read",
      icon: <Upload className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4">Adding Your Product</h4>
              <div className="space-y-3">
                <p>From your dashboard, click "Add Product" button to get started.</p>
                <div className="p-3 rounded bg-gray-50">
                  <code className="text-sm">Dashboard → Add Product → Fill Details</code>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Required Information</h4>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Essential Fields:</h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Product Name</li>
                    <li>• Description</li>
                    <li>• Price</li>
                    <li>• At least 1 image</li>
                    <li>• Category</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Image Guidelines</h4>
              <div className="p-4 border rounded-lg">
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Good quality photos</li>
                  <li>• Multiple angles recommended</li>
                  <li>• JPG or PNG format</li>
                  <li>• Maximum 5MB per image</li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-lg border" style={{ backgroundColor: `${BRAND.primary}15`, borderColor: BRAND.primary }}>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: BRAND.primary }} />
                <div>
                  <h4 className="font-medium" style={{ color: BRAND.primary }}>Success!</h4>
                  <p className="text-sm mt-1" style={{ color: BRAND.textSecondary }}>
                    Your product will be live in your store once you save it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "fulfillment-options",
      title: "Fulfillment Options",
      description: "Choose how to handle your orders",
      category: "fulfillment",
      readTime: "4 min read",
      icon: <Truck className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2" style={{ borderColor: BRAND.accent }}>
              <CardHeader>
                <CardTitle style={{ color: BRAND.accent }}>Creator Fulfilled</CardTitle>
                <CardDescription>You handle everything yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Best For:</h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Handmade products</li>
                    <li>• Custom items</li>
                    <li>• Small quantities</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">You Handle:</h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Making the product</li>
                    <li>• Packing orders</li>
                    <li>• Shipping to customers</li>
                  </ul>
                </div>
                <div className="p-3 rounded" style={{ backgroundColor: `${BRAND.accent}15` }}>
                  <p className="text-sm font-medium" style={{ color: BRAND.accent }}>Commission: 5-8%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ borderColor: BRAND.primary }}>
              <CardHeader>
                <CardTitle style={{ color: BRAND.primary }}>Junooni Fulfilled</CardTitle>
                <CardDescription>We handle production and shipping</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Best For:</h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Print designs (t-shirts, mugs)</li>
                    <li>• Standard products</li>
                    <li>• Hands-off approach</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">We Handle:</h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Production</li>
                    <li>• Storage</li>
                    <li>• Shipping</li>
                  </ul>
                </div>
                <div className="p-3 rounded" style={{ backgroundColor: `${BRAND.primary}15` }}>
                  <p className="text-sm font-medium" style={{ color: BRAND.primary }}>Commission: 12-15%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 rounded-lg border" style={{ backgroundColor: `${BRAND.warning}22`, borderColor: BRAND.warning }}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: BRAND.warning }} />
              <div>
                <h4 className="font-medium" style={{ color: BRAND.textPrimary }}>Note</h4>
                <p className="text-sm mt-1" style={{ color: BRAND.textSecondary }}>
                  You can choose different fulfillment methods for different products in your store.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "designer-tool",
      title: "Using the Designer",
      description: "Create designs for print-on-demand products",
      category: "designer",
      readTime: "5 min read",
      icon: <Palette className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="p-6 rounded-lg border-2" style={{ backgroundColor: `${BRAND.background}`, borderColor: BRAND.light }}>
            <h3 className="text-xl font-semibold mb-3" style={{ color: BRAND.accent }}>
              Create Designs Easily
            </h3>
            <p style={{ color: BRAND.textSecondary }}>
              Use our designer tool to create designs for t-shirts, mugs, and other products.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4">How to Start</h4>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Access Designer",
                    description: "Click 'Add Product' → 'Use Designer'"
                  },
                  {
                    step: 2,
                    title: "Choose Product",
                    description: "Select what you want to design (t-shirt, mug, etc.)"
                  },
                  {
                    step: 3,
                    title: "Add Your Design",
                    description: "Upload images, add text, or use our tools"
                  },
                  {
                    step: 4,
                    title: "Preview & Save",
                    description: "Check how it looks and add to your store"
                  }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 p-4 rounded-lg bg-gray-50">
                    <div 
                      className="flex items-center justify-center w-8 h-8 rounded-full text-white font-medium text-sm"
                      style={{ backgroundColor: BRAND.primary }}
                    >
                      {item.step}
                    </div>
                    <div>
                      <h5 className="font-medium">{item.title}</h5>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Available Products</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "T-Shirts",
                  "Mugs", 
                  "Phone Cases",
                  "Posters",
                  "Bags",
                  "Stickers"
                ].map((item, index) => (
                  <div key={index} className="p-3 text-center border rounded-lg">
                    <p className="text-sm font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg border" style={{ backgroundColor: `${BRAND.primary}15`, borderColor: BRAND.primary }}>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5" style={{ color: BRAND.primary }} />
                <div>
                  <h4 className="font-medium" style={{ color: BRAND.primary }}>Tip</h4>
                  <p className="text-sm mt-1" style={{ color: BRAND.textSecondary }}>
                    Use high-quality images for the best print results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Simplified FAQs
  const faqs: FAQ[] = [
    {
      id: "pricing",
      question: "How much does Junooni charge?",
      answer: "We charge 5-8% commission for creator fulfilled products and 12-15% for Junooni fulfilled products. No upfront fees."
    },
    {
      id: "payments",
      question: "When do I get paid?",
      answer: "Payments are sent to your bank account weekly, every Friday, for orders from the previous week."
    },
    {
      id: "fulfillment",
      question: "Can I change fulfillment method later?",
      answer: "Yes, you can change fulfillment method for each product anytime from your product settings."
    },
    {
      id: "support",
      question: "How do I get help?",
      answer: "You can contact our support team through chat or email. We're here to help you succeed."
    }
  ];

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const selectedArticleData = articles.find(article => article.id === selectedArticle);

  if (selectedArticle && selectedArticleData) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/90">
          <div className="container px-4 py-3 mx-auto">
            <div className="flex items-center">
              <SidebarTrigger variant='outline' className='mr-2 scale-125 sm:scale-100' />
              <Separator orientation='vertical' className='h-6 ml-2' />
              <Button 
                variant="ghost" 
                onClick={() => setSelectedArticle(null)}
                className="ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Help Center
              </Button>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="container px-4 py-8 mx-auto max-w-4xl">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge style={{ backgroundColor: BRAND.primary, color: 'white' }}>
                {selectedArticleData.category.replace('-', ' ')}
              </Badge>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {selectedArticleData.readTime}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-3" style={{ color: BRAND.textPrimary }}>
              {selectedArticleData.title}
            </h1>
            <p className="text-lg text-gray-600">{selectedArticleData.description}</p>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-8">
              {selectedArticleData.content}
            </CardContent>
          </Card>
        </div>
        
        {/* Chatwoot Widget */}
        <ChatwootWidget />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/90">
        <div className="container px-4 py-3 mx-auto">
          <div className="flex items-center">
            <SidebarTrigger variant='outline' className='mr-2 scale-125 sm:scale-100' />
            <Separator orientation='vertical' className='h-6 ml-2' />
            <div className="ml-2">
              <h1 className="text-xl font-bold" style={{ color: BRAND.primary }}>
                Help Center
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: BRAND.textPrimary }}>
            How can we help?
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get started with Junooni Creator Studio
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-4 text-lg"
            />
          </div>
        </div>

        {/* Help Articles as Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: BRAND.textPrimary }}>
            Getting Started Guides
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredArticles.map(article => (
              <Card 
                key={article.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 text-center"
                onClick={() => setSelectedArticle(article.id)}
              >
                <CardContent className="p-6">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND.primary}15` }}
                  >
                    {React.cloneElement(article.icon, { 
                      style: { color: BRAND.primary },
                      className: "w-8 h-8"
                    })}
                  </div>
                  <h3 className="text-lg font-semibold mb-3">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{article.description}</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Common Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {faqs.map(faq => (
                  <div key={faq.id} className="border rounded-lg">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                    >
                      <span className="font-medium">{faq.question}</span>
                      {expandedFAQ === faq.id ? 
                        <ChevronDown className="w-5 h-5" /> : 
                        <ChevronRight className="w-5 h-5" />
                      }
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-4 pb-3 text-gray-600">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Need more help?</CardTitle>
              <CardDescription>
                Our support team is ready to assist you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="text-center p-6 rounded-lg border-2" style={{ borderColor: BRAND.primary, backgroundColor: `${BRAND.primary}05` }}>
                  <MessageCircle className="w-8 h-8 mx-auto mb-3" style={{ color: BRAND.primary }} />
                  <h4 className="font-medium mb-2">Live Chat</h4>
                  <p className="text-sm text-gray-600 mb-4">Get instant help</p>
                  <Button 
                    size="sm" 
                    style={{ backgroundColor: BRAND.primary }}
                    onClick={openChatwoot}
                  >
                    Start Chat
                  </Button>
                </div>
                <div className="text-center p-6 rounded-lg border-2" style={{ borderColor: BRAND.accent, backgroundColor: `${BRAND.accent}05` }}>
                  <Mail className="w-8 h-8 mx-auto mb-3" style={{ color: BRAND.accent }} />
                  <h4 className="font-medium mb-2">Email Support</h4>
                  <p className="text-sm text-gray-600 mb-4">Detailed assistance</p>
                  <a href="mailto:support@junooni.com">
                    <Button size="sm" variant="outline" style={{ borderColor: BRAND.accent, color: BRAND.accent }}>
                      Send Email
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Chatwoot Widget */}
      <ChatwootWidget />
    </div>
  );
};

export default HelpCenter;