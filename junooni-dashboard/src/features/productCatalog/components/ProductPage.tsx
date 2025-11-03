import { useEffect, useState } from "react";
import { useParams, useRouter } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Star, Shield, Truck, Palette, Tag, Settings, Zap, Info } from "lucide-react";
import Navbar from "./Navbar";

const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;

// Updated interfaces based on actual API response
interface Image {
  id: number;
  alt: string | null;
  caption: string | null;
  url: string;
  thumbnailURL: string | null;
  filename: string;
  mimeType: string;
  filesize: number;
  width: number;
  height: number;
  focalX: number;
  focalY: number;
  updatedAt: string;
  createdAt: string;
  sizes: {
    thumbnail?: ImageSize;
    square?: ImageSize;
    small?: ImageSize;
    medium?: ImageSize;
    large?: ImageSize;
    xlarge?: ImageSize;
    og?: ImageSize;
  };
}

interface ImageSize {
  url: string | null;
  width: number | null;
  height: number | null;
  mimeType: string | null;
  filesize: number | null;
  filename: string | null;
}

interface DisplayImage {
  id: string;
  title: string | null;
  image: Image;
  caption: string | null;
}

interface ColorOption {
  id: string;
  colorName: string;
  colorHex: string;
  isPrimary: boolean | null;
  fabricInteraction: {
    absorptionRate: number;
    blendMode: string;
    colorShift: {
      hueShift: number;
      saturationShift: number;
      lightnessShift: number;
    };
  };
}

interface SizeOption {
  id: string;
  sizeName: string;
  sizeDescription: string | null;
  dimensions: {
    width: number;
    height: number;
  };
}

interface PhysicalDimensions {
  widthInches: number;
  heightInches: number;
  depthInches: number;
  diameter: number | null;
  units: string;
}

interface ShippingInfo {
  weight: number;
  shippingDimensions: string;
  shippingLocationID: string;
  packageType: string;
}

interface Category {
  id: number;
  title: string;
  slug: string;
  slugLock: boolean;
  parent: Category | null;
  breadcrumbs: Breadcrumb[];
  updatedAt: string;
  createdAt: string;
}

interface ProductTag {
  id: string;
  tag: string;
}

interface PrintingTechnology {
  id: string;
  technologyName: string;
  description?: string;
  mockupPhotos: MockupPhoto[];
  custAreas: CustomizationArea[];
  tags: ProductTag[];
  // Additional fields for better display
  features?: string[];
  durability?: string;
  finishQuality?: string;
  costEffective?: boolean;
}

interface MockupPhoto {
  id: string;
  title: string;
  photo: Image;
  viewAngle: string;
  mockupType: string;
  photoColor: string;
  priority: number;
}

interface CustomizationArea {
  id: string;
  areaId: string;
  areaName: string;
  areaType: string;
  designCanvasPhotos: any[];
  canvasDim: {
    widthInch: number;
    heightInch: number;
    canvasPixWid: number;
    canvasPixHeight: number;
    aspectRatioLocked: boolean;
  };
  restrictions: any;
}

interface Materials {
  primary: string;
  weight: string;
  construction: string;
  finish: string | null;
  efabType: string;
  fabricWeight: number;
  surfaceTexture: string;
  stretchability: number;
  transparency: number;
  reflectivity: number;
}

interface CareInstruction {
  id: string;
  instruction: string;
  icon: string;
}

interface VendorInfo {
  supplier: string;
  supplierProductId: string | null;
  countryOrigin: string | null;
}

interface Pricing {
  markupType: string;
  markupValue: number;
  suggestedRetail: number;
}

interface AdditionalCosts {
  printingCostPerArea: number;
  setupFee: number;
  printingGST: number;
  rushSurcharge: number | null;
}

interface TextNode {
  mode: string;
  text: string;
  type: string;
  style: string;
  detail: number;
  format: number;
  version: number;
}

interface ParagraphNode {
  type: string;
  format: string;
  indent: number;
  version: number;
  children: TextNode[];
  direction: string;
  textStyle?: string;
  textFormat?: number;
}

interface RootNode {
  type: string;
  format: string;
  indent: number;
  version: number;
  children: ParagraphNode[];
  direction: string;
}

interface Features {
  root: RootNode;
}

interface Breadcrumb {
  id: string;
  doc: number;
  url: string;
  label: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  status: string;
  productType: string;
  categories: Category[];
  tags: ProductTag[];
  brand: string;
  brandSku: string;
  sku: string;
  vendorInfo: VendorInfo;
  cost: number;
  pricing: Pricing;
  additionalCosts: AdditionalCosts;
  description: string;
  features: Features;
  materials: Materials;
  careInstructions: CareInstruction[];
  physicalDimensions: PhysicalDimensions;
  shippingInfo: ShippingInfo;
  colorOptions: ColorOption[];
  color_Images: boolean;
  sizeOptions: SizeOption[];
  size_Images: boolean;
  sizeChart: any | null;
  sizeChartHtml: string;
  printT: PrintingTechnology[];
  custAreas: CustomizationArea[];
  displayImages: DisplayImage[];
  updatedAt: string;
  createdAt: string;
}

interface RouteParams {
  id?: string;
}

const ProductPage = () => {
  const router = useRouter();
  const params = useParams({ strict: false }) as RouteParams;
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [selectedTechnology, setSelectedTechnology] = useState<PrintingTechnology | null>(null);
  const [openSections, setOpenSections] = useState({
    details: true,
    features: false,
    description: true,
    shipping: false,
    technology: false
  });
  
  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        //console.error("Product ID not found in URL parameters");
        router.navigate({ to: '/productCatalog' });
        return;
      }
      
      setLoading(true);
      
      try {
        const storedProduct = sessionStorage.getItem(`product_${productId}`);
        
        if (storedProduct) {
          const parsedProduct = JSON.parse(storedProduct);
          setProduct(parsedProduct);
          
          // Set default selections
          if (parsedProduct.colorOptions?.length > 0) {
            setSelectedColor(parsedProduct.colorOptions[0]);
          }
          
          if (parsedProduct.sizeOptions?.length > 0) {
            setSelectedSize(parsedProduct.sizeOptions[0]);
          }

          // Set default printing technology
          if (parsedProduct.printT?.length > 0) {
            setSelectedTechnology(parsedProduct.printT[0]);
          }
          
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${vite_payload}/api/blank-products/${productId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
       
        if (!response.ok) {
          throw new Error('Product not found');
        }
        
        const data = await response.json();
        setProduct(data);
        
        // Set default selections
        if (data.colorOptions?.length > 0) {
          setSelectedColor(data.colorOptions[0]);
        }
        
        if (data.sizeOptions?.length > 0) {
          setSelectedSize(data.sizeOptions[0]);
        }

        // Set default printing technology
        if (data.printT?.length > 0) {
          setSelectedTechnology(data.printT[0]);
        }
        
        sessionStorage.setItem(`product_${productId}`, JSON.stringify(data));
      } catch (error) {
        //console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [productId, router]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Get technology icon based on technology name
  const getTechnologyIcon = (technologyName: string): React.ReactNode => {
    const name = technologyName.toLowerCase();
    if (name.includes('digital') || name.includes('dtg')) {
      return <Zap className="w-4 h-4 text-[#e65100]" />;
    } else if (name.includes('screen') || name.includes('silk')) {
      return <Settings className="w-4 h-4 text-[#e65100]" />;
    } else if (name.includes('vinyl') || name.includes('htv')) {
      return <Shield className="w-4 h-4 text-[#e65100]" />;
    } else if (name.includes('sublimation')) {
      return <Star className="w-4 h-4 text-[#e65100] fill-current" />;
    } else if (name.includes('embroidery')) {
      return <Palette className="w-4 h-4 text-[#e65100]" />;
    }
    return <Settings className="w-4 h-4 text-[#e65100]" />;
  };

  // Get technology quality indicators
  const getTechnologyQuality = (technology: PrintingTechnology) => {
    const name = technology.technologyName.toLowerCase();
    
    if (name.includes('digital') || name.includes('dtg')) {
      return { quality: "Premium", color: "text-purple-600 bg-purple-50", durability: "High" };
    } else if (name.includes('screen')) {
      return { quality: "Professional", color: "text-blue-600 bg-blue-50", durability: "Very High" };
    } else if (name.includes('sublimation')) {
      return { quality: "Vibrant", color: "text-pink-600 bg-pink-50", durability: "Excellent" };
    } else if (name.includes('vinyl')) {
      return { quality: "Durable", color: "text-green-600 bg-green-50", durability: "High" };
    } else if (name.includes('embroidery')) {
      return { quality: "Luxury", color: "text-indigo-600 bg-indigo-50", durability: "Premium" };
    }
    
    return { quality: "Standard", color: "text-gray-600 bg-gray-50", durability: "Good" };
  };

  // Get all tags from product and printing technologies
  const getAllTags = (): ProductTag[] => {
    if (!product) return [];
    
    const allTags: ProductTag[] = [];
    
    if (product.tags?.length > 0) {
      allTags.push(...product.tags);
    }
    
    if (product.printT?.length > 0) {
      product.printT.forEach(tech => {
        if (tech.tags?.length > 0) {
          allTags.push(...tech.tags);
        }
      });
    }
    
    const uniqueTags = allTags.filter((tag, index, self) => 
      index === self.findIndex(t => t.id === tag.id)
    );
    
    return uniqueTags;
  };

  // Get icon for tag
  const getTagIcon = (tagName: string): React.ReactNode => {
    const name = tagName.toLowerCase();
    if (name.includes('premium') || name.includes('quality') || name.includes('cloths')) {
      return <Star className="w-4 h-4 fill-current" />;
    } else if (name.includes('eco') || name.includes('sustainable')) {
      return <Shield className="w-4 h-4" />;
    } else if (name.includes('fast') || name.includes('quick')) {
      return <Truck className="w-4 h-4" />;
    } else if (name.includes('custom') || name.includes('design')) {
      return <Palette className="w-4 h-4" />;
    }
    return <Tag className="w-4 h-4" />;
  };

  // Render tags
  const renderTags = () => {
    const allTags = getAllTags();
    
    if (allTags.length === 0) {
      return (
        <div className="flex items-center gap-1 text-[#e65100]">
          <span className="text-sm font-semibold"></span>
        </div>
      );
    }

    const [primaryTag, ...otherTags] = allTags;
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-[#e65100]">
          {getTagIcon(primaryTag.tag)}
          <span className="text-sm font-semibold">{primaryTag.tag}</span>
        </div>
        
        {otherTags.length > 0 && (
          <div className="flex gap-1">
            {otherTags.slice(0, 2).map((tag) => (
              <Badge 
                key={tag.id}
                variant="secondary"
                className="text-xs h-5 px-2 bg-[#e65100]/10 text-[#e65100] border-[#e65100]/20"
              >
                {tag.tag}
              </Badge>
            ))}
            {otherTags.length > 2 && (
              <Badge 
                variant="secondary"
                className="h-5 px-2 text-xs text-gray-600 bg-gray-100"
              >
                +{otherTags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  };

  // Extract features
  const extractFeatures = (): string[] => {
    if (product?.features?.root?.children) {
      return product.features.root.children.map((node: ParagraphNode) => {
        if (node.type === "paragraph" && node.children) {
          const textNodes = node.children.filter((child: TextNode) => child.type === "text");
          return textNodes.map((textNode: TextNode) => textNode.text).join(" ");
        }
        return "";
      }).filter((text: string) => text !== "");
    }
    return [];
  };
  
  // Format description
  // const formatDescription = (): string[] => {
  //   if (!product?.description) return [];
  //   return product.description.split("\n").filter((line: string) => line.trim() !== "");
  // };
  const formatDescription = (): string => {
  if (!product?.description) return "";
  return product.description.replace(/\n/g, '<br />');
};

  // Get primary category path
  // const getPrimaryCategoryPath = (): { url: string, label: string }[] => {
  //   if (!product?.categories || product.categories.length === 0) {
  //     return [{ url: '/productCatalog', label: 'Catalog' }];
  //   }
    
  //   const primaryCategory = product.categories.reduce((prev: Category, current: Category) => 
  //     (prev.breadcrumbs.length > current.breadcrumbs.length) ? prev : current
  //   );
    
  //   return [
  //     { url: '/productCatalog', label: 'Catalog' },
  //     ...primaryCategory.breadcrumbs.map((crumb: Breadcrumb) => ({ 
  //       url: crumb.url, 
  //       label: crumb.label 
  //     }))
  //   ];
  // };
  // Get primary category path
// Get primary category path
const getPrimaryCategoryPath = (): { url: string, label: string }[] => {
  if (!product?.categories || product.categories.length === 0) {
    return [{ url: '/productCatalog', label: 'Catalog' }];
  }
  
  const primaryCategory = product.categories.reduce((prev: Category, current: Category) => 
    (prev.breadcrumbs.length > current.breadcrumbs.length) ? prev : current
  );
  
  return [
    { url: '/productCatalog', label: 'Catalog' },
    ...primaryCategory.breadcrumbs.map((crumb: Breadcrumb, index: number) => {
      // Check if this is the last breadcrumb (current page)
      const isLast = index === primaryCategory.breadcrumbs.length - 1;
      
      if (isLast) {
        // Last breadcrumb uses the URL as-is (it's the current page)
        return { 
          url: crumb.url, 
          label: crumb.label 
        };
      } else {
        // For category breadcrumbs, extract only the last segment of the path
        const urlPath = crumb.url.replace(/^\//, ''); // Remove leading slash
        const segments = urlPath.split('/');
        const slug = segments[segments.length - 1]; // Get the last segment
        
        return {
          url: `/productCatalog/category/${slug}`,
          label: crumb.label
        };
      }
    })
  ];
};
  
  const toggleSection = (section: keyof typeof openSections): void => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container p-4 pt-24 mx-auto">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-40 rounded-xl" />
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="rounded-xl w-14 h-14" />
                  ))}
                </div>
              </div>
              <div>
                <Skeleton className="w-3/4 h-8 mb-2" />
                <Skeleton className="w-1/2 h-6 mb-4" />
                <Skeleton className="w-1/3 h-8 mb-6" />
                <Skeleton className="w-full h-6 mb-2" />
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-10" />
                  ))}
                </div>
                <Skeleton className="w-full h-12 mb-3" />
                <Skeleton className="w-full h-12 mb-6" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-16" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container p-4 mx-auto">
            <Card className="max-w-md mx-auto border-0 shadow-xl">
              <CardHeader className="pb-4 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#e65100] to-[#ff7043] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900">Product Not Found</CardTitle>
                <CardDescription className="text-gray-600">
                  We couldn't find the product you're looking for. It may have been moved or is no longer available.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  onClick={() => router.navigate({ to: '/productCatalog' })}
                  className="w-full bg-gradient-to-r from-[#e65100] to-[#ff7043] hover:from-[#d84315] hover:to-[#e65100] transition-all duration-200"
                >
                  Explore Our Catalog
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const features = extractFeatures();
  const descriptionParagraphs = formatDescription();
  const allTags = getAllTags();
  const breadcrumbs = getPrimaryCategoryPath();
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full p-4 pt-16 mx-auto sm:pt-20 max-w-7xl">
          {/* Enhanced Breadcrumbs */}
          <nav className="flex flex-wrap items-center p-4 mt-4 mb-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-[#e65100] font-semibold">{crumb.label}</span>
                ) : (
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-gray-600 hover:text-[#e65100] transition-colors duration-200"
                    onClick={() => router.navigate({ to: crumb.url })}
                  >
                    {crumb.label}
                  </Button>
                )}
              </div>
            ))}
          </nav>

          <div className="grid grid-cols-1 gap-8 md:flex lg:w-full">
            {/* Left Column - Product Images */}
            <div className="md:w-[60%]">
              {product.displayImages && product.displayImages.length > 0 ? (
                <div>
                  <div className="hidden grid-cols-2 gap-3 mb-4 ml-2 md:grid">
                    {product.displayImages.map((img: DisplayImage, index: number) => (
                      <div 
                        key={img.id}
                        className={`
                          cursor-pointer bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group
                          ${selectedImage === index ? 'ring-2 ring-[#e65100] scale-105' : 'hover:scale-102'}
                        `}
                        onClick={() => setSelectedImage(index)}
                      >
                        <img
                          src={`${vite_payload}${img.image.url}`}
                          alt={img.image.alt || `${product.name} view ${index + 1}`}
                          className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-2 mb-4 md:hidden">
                    {product.displayImages && product.displayImages.length > 0 && (
                      <div className="relative overflow-hidden bg-white shadow-lg cursor-pointer rounded-xl">
                        <img
                          src={`${vite_payload}${product.displayImages[selectedImage].image.url}`}
                          alt={product.displayImages[selectedImage].image.alt || `${product.name} view`}
                          className="w-full h-[400px] object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div> 
              ) : (
                <div className="flex items-center justify-center h-48 mb-4 bg-white shadow-lg rounded-xl">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="font-medium text-gray-400">No Images Available</p>
                  </div>
                </div>
              )}
              
              {/* Enhanced Thumbnail navigation */}
              {product.displayImages && product.displayImages.length > 1 && (
                <div className="flex items-center justify-center gap-3 py-4 overflow-x-auto md:hidden hide-scrollbar">
                  {product.displayImages.map((img: DisplayImage, index: number) => (
                    <div 
                      key={`thumb-${img.id}`}
                      className={`
                        cursor-pointer bg-white rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 shadow-md
                        ${selectedImage === index ? 'ring-2 ring-[#e65100] scale-110' : 'hover:scale-105'}
                      `}
                      onClick={() => setSelectedImage(index)}
                      style={{ width: '60px', height: '60px' }}
                    >
                      <img
                        src={`${vite_payload}${img.image.url}`}
                        alt={img.image.alt || `Thumbnail ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Right Column - Product Details */}
            <div className="md:w-[40%]">
              <Card className="overflow-hidden bg-white border-0 shadow-xl rounded-2xl">
                <CardHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-gray-50 to-white">
                  {/* Categories and Dynamic Tags */}
                  <div className="flex items-center justify-between mb-3">
                    {/* <div className="flex gap-2">
                      {product.categories && product.categories.slice(0, 2).map((category: Category) => (
                        <Badge key={category.id} className="bg-[#e65100]/10 text-[#e65100] border-[#e65100]/20 hover:bg-[#e65100]/20 transition-colors duration-200">
                          {category.title}
                        </Badge>
                      ))}
                    </div> */}
                    {renderTags()}
                  </div>
                  
                  {/* Product Name */}
                  <CardTitle className="text-2xl font-bold leading-tight text-gray-900">
                    {product.name}
                  </CardTitle>
                  
                  {/* SKU and Brand */}
                  <CardDescription className="flex items-center gap-3 px-3 py-2 text-sm bg-white border rounded-lg">
                    <span><span className="font-medium">SKU:</span> {product.sku}</span>
                  </CardDescription>

                  {/* Price with offer highlight */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-[#e65100]/5 to-[#ff7043]/5 rounded-xl border border-[#e65100]/20">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[#e65100]">
                      {product?.additionalCosts?.printingGST > 0 
                        ? `From ${formatCurrency(product.cost)}` 
                        : formatCurrency(product.cost)}
                    </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="px-6 pb-6">
                  <div className="space-y-6">
                    {/* Color Options */}
                    {product.colorOptions && product.colorOptions.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-[#e65100]" />
                          <h3 className="text-sm font-semibold text-gray-900">Colors available</h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {product.colorOptions.map((color: ColorOption) => (
                            <TooltipProvider key={color.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    onClick={() => setSelectedColor(color)}
                                    className={`
                                      w-8 h-8 rounded-full cursor-pointer border-2 transition-all duration-200 shadow-md hover:shadow-lg
                                      ${selectedColor?.id === color.id 
                                        ? 'ring-4 ring-[#e65100]/30 ring-offset-1 scale-110 border-[#e65100]' 
                                        : 'border-gray-300 hover:scale-105 hover:border-[#e65100]/50'
                                      }
                                    `}
                                    style={{ 
                                      backgroundColor: color.colorHex,
                                      border: color.colorHex.toLowerCase() === '#ffffff' ? '2px solid #e5e7eb' : 'none' 
                                    }}
                                  ></div>
                                </TooltipTrigger>
                                <TooltipContent className="text-white bg-gray-900">
                                  <p>{color.colorName}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Size Options */}
                    {product.sizeOptions && product.sizeOptions.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">Size</h3>
                        </div>
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                          {product.sizeOptions.map((size: SizeOption) => (
                            <div
                              key={size.id}
                              onClick={() => setSelectedSize(size)}
                              className={`
                                py-2 px-3 border-2 rounded-lg text-center cursor-pointer 
                                transition-all duration-200 text-sm font-medium
                                ${selectedSize?.id === size.id 
                                  ? 'border-[#e65100] bg-[#e65100] text-white scale-105 shadow-md' 
                                  : 'border-gray-300 hover:border-[#e65100] hover:scale-105 hover:bg-[#e65100]/5'}
                              `}
                            >
                              {size.sizeName}
                            </div>
                          ))}
                        </div>
                        {selectedSize?.sizeDescription && (
                          <p className="p-2 text-xs text-gray-600 rounded-lg bg-gray-50">
                            💡 {selectedSize.sizeDescription}
                          </p>
                        )}
                      </div>
                    )}

                    {/* NEW: Printing Technology Selection */}
                    {product.printT && product.printT.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-[#e65100]" />
                          <h3 className="text-sm font-semibold text-gray-900">Printing Technology</h3>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-sm">Different printing technologies offer unique advantages for quality, durability, and cost-effectiveness.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <div className="space-y-3 flex flex-row gap-3 overflow-x-auto pb-2 hide-scrollbar">
                          {product.printT.map((tech: PrintingTechnology) => {
                            const isSelected = selectedTechnology?.id === tech.id;
                            const quality = getTechnologyQuality(tech);
                            
                            return (
                              <div
                                key={tech.id}
                                onClick={() => setSelectedTechnology(tech)}
                                className={`
                                  p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 w-fit
                                  ${isSelected 
                                    ? 'border-[#e65100] bg-[#e65100]/5 shadow-md scale-102' 
                                    : 'border-gray-200 hover:border-[#e65100]/50 hover:bg-[#e65100]/5'}
                                `}
                              >
                                <div className="flex items-start gap-3">
                                  {/* <div className="flex-shrink-0 mt-1">
                                    {getTechnologyIcon(tech.technologyName)}
                                  </div> */}
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                                        {tech.technologyName.toUpperCase()}
                                      </h4>
                                    </div>
                                    
                                    {/* Technology tags */}
                                    {tech.tags && tech.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-2">
                                        {tech.tags.slice(0, 3).map((tag) => (
                                          <Badge 
                                            key={tag.id}
                                            variant="outline"
                                            className="text-xs h-4 px-1.5 border-[#e65100]/30 text-[#e65100]"
                                          >
                                            {tag.tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                    
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Show all tags in a dedicated section if there are many */}
                    {allTags.length > 3 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900">Product Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {allTags.map((tag) => (
                            <Badge 
                              key={tag.id}
                              variant="outline"
                              className="text-xs border-[#e65100]/30 text-[#e65100] hover:bg-[#e65100]/10 transition-colors"
                            >
                              {tag.tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Enhanced Collapsible Sections */}
                    <div className="space-y-3">
                      {/* Printing Technology Details - NEW Collapsible Section */}
                      {product.printT && product.printT.length > 0 && (
                        <Collapsible 
                          open={openSections.technology} 
                          onOpenChange={() => toggleSection('technology')}
                          className="overflow-hidden transition-all duration-300 border border-gray-200 rounded-xl"
                        >
                          <CollapsibleContent className="p-4 bg-white">
                            <div className="space-y-4">
                              {product.printT.map((tech: PrintingTechnology) => {
                                const quality = getTechnologyQuality(tech);
                                
                                return (
                                  <div key={tech.id} className="p-3 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      {getTechnologyIcon(tech.technologyName)}
                                      <h4 className="font-semibold text-gray-900">{tech.technologyName}</h4>
                                      <Badge className={`text-xs ${quality.color}`}>
                                        {quality.quality}
                                      </Badge>
                                    </div>
                                    
                                    {tech.tags && tech.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-2">
                                        {tech.tags.map((tag) => (
                                          <Badge 
                                            key={tag.id}
                                            variant="outline"
                                            className="text-xs border-[#e65100]/30 text-[#e65100]"
                                          >
                                            {tag.tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                    
                                    <div className="text-xs text-gray-600">
                                      <p>Durability: {quality.durability}</p>
                                      {tech.custAreas && (
                                        <p>Customization Areas: {tech.custAreas.length}</p>
                                      )}
                                      {tech.mockupPhotos && (
                                        <p>Preview Options: {tech.mockupPhotos.length} mockup styles</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}

                      <CardFooter className="flex flex-col gap-3 px-0 pb-2 pt-2 bg-gradient-to-r from-white to-white">
                        {/* Action Buttons */}
                        <Button 
                          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#e65100] to-[#ff7043] hover:from-[#d84315] hover:to-[#e65100] transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                          size="lg"
                          disabled={!selectedColor || !selectedSize || !selectedTechnology}
                          onClick={() => {
                            router.navigate({ 
                              to: `/designer/${productId}`, 
                              search: { 
                                color: selectedColor?.id,
                                technology: selectedTechnology?.id,
                              }
                            });
                          }}
                        >
                          {!selectedColor || !selectedSize || !selectedTechnology 
                            ? 'Select Options Above' 
                            : '🎨 Start Creating Magic'
                          }
                        </Button>
                        
                        <Button 
                          onClick={() => router.navigate({ to: '/productCatalog' })}
                          variant="outline"
                          className="w-full h-11 border-[#e65100] text-[#e65100] hover:bg-[#e65100] hover:text-white transition-all duration-200"
                        >
                          ← Explore More Products
                        </Button>
                        
                        {/* Trust indicators */}
                        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-green-500" />
                            <span>Quality Guaranteed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span>Premium Service</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-blue-500" />
                            <span>Fast Delivery</span>
                          </div>
                        </div>
                      </CardFooter>

                      <Separator className="my-0" />

                      {/* <Alert className="p-4 border-[#e65100]/30 bg-gradient-to-r from-[#e65100]/10 to-[#ff7043]/10">
                        <Settings className="w-5 h-5 text-[#e65100]" />
                        <AlertDescription className="ml-2 text-sm font-medium text-gray-700">
                          🎨 <span className="font-semibold text-[#e65100]">Ready to customize?</span> Select your preferred color, size, and printing technology to start creating with our professional design tools.
                        </AlertDescription>
                      </Alert> */}

                      {/* Product Details */}
                      <Collapsible 
                        open={openSections.details} 
                        onOpenChange={() => toggleSection('details')}
                        className="overflow-hidden transition-all duration-300 border border-gray-200 rounded-xl"
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-semibold transition-colors bg-gradient-to-r from-gray-50 to-white hover:from-[#e65100]/5 hover:to-[#e65100]/5">
                          <span className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#e65100]" />
                            Product Specifications
                          </span>
                          <span className="transition-transform duration-300">
                            {openSections.details ? <ChevronUp className="w-5 h-5 text-[#e65100]" /> : <ChevronDown className="w-5 h-5 text-[#e65100]" />}
                          </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 bg-white">
                          {/* Description */}
                          {/* {descriptionParagraphs.length > 0 && (
                            <div className="p-3 mb-4 rounded-lg bg-gray-50">
                              <h4 className="mb-2 text-sm font-semibold text-gray-900">Product Description</h4>
                              <div className="space-y-2 text-gray-700">
                                {descriptionParagraphs.map((paragraph: string, index: number) => (
                                  <p key={index} className="text-sm leading-relaxed">{paragraph}</p>
                                ))}
                              </div>
                            </div>
                          )} */}
                          {descriptionParagraphs && (
                            <div className="p-3 mb-4 rounded-lg bg-gray-50">
                              <h4 className="mb-2 text-sm font-semibold text-gray-900">Product Description</h4>
                              <div 
                                className="space-y-2 text-sm leading-relaxed text-gray-700"
                                dangerouslySetInnerHTML={{ __html: descriptionParagraphs }}
                              />
                            </div>
                          )}
                          
                          {/* Categories */}
                          {/* {product.categories && product.categories.length > 0 && (
                            <div>
                              <h4 className="mb-2 text-sm font-semibold text-gray-900">Product Categories</h4>
                              <div className="flex flex-wrap gap-2">
                                {product.categories.map((category: Category) => (
                                  <Badge 
                                    key={category.id}
                                    variant="outline"
                                    className="text-xs border-[#e65100]/30 text-[#e65100]"
                                  >
                                    {category.title}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )} */}
                        </CollapsibleContent>
                      </Collapsible>
                      
                      {/* Features */}
                      <Collapsible 
                        open={openSections.features} 
                        onOpenChange={() => toggleSection('features')}
                        className="overflow-hidden transition-all duration-300 border border-gray-200 rounded-xl"
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-semibold transition-colors bg-gradient-to-r from-gray-50 to-white hover:from-[#e65100]/5 hover:to-[#e65100]/5">
                          <span className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-[#e65100] fill-current" />
                            Premium Features & Materials
                          </span>
                          <span className="transition-transform duration-300">
                            {openSections.features ? <ChevronUp className="w-5 h-5 text-[#e65100]" /> : <ChevronDown className="w-5 h-5 text-[#e65100]" />}
                          </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 bg-white">
                          {features.length > 0 ? (
                            <ul className="space-y-2">
                              {features.map((feature: string, index: number) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <span className="text-[#e65100] mt-1">✓</span>
                                  <span className="leading-relaxed text-gray-700">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <Alert className="border-[#e65100]/20 bg-[#e65100]/5">
                              <AlertDescription className="text-sm text-gray-700">
                                🎯 This premium product features high-quality materials and professional-grade construction for exceptional results.
                              </AlertDescription>
                            </Alert>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                      
                      {/* Shipping */}
                      <Collapsible 
                        open={openSections.shipping} 
                        onOpenChange={() => toggleSection('shipping')}
                        className="overflow-hidden transition-all duration-300 border border-gray-200 rounded-xl"
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-semibold transition-colors bg-gradient-to-r from-gray-50 to-white hover:from-[#e65100]/5 hover:to-[#e65100]/5">
                          <span className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-[#e65100]" />
                            Shipping & Delivery Information
                          </span>
                          <span className="transition-transform duration-300">
                            {openSections.shipping ? <ChevronUp className="w-5 h-5 text-[#e65100]" /> : <ChevronDown className="w-5 h-5 text-[#e65100]" />}
                          </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 bg-white">
                          {product.shippingInfo ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 gap-3 p-3 border border-orange-200 rounded-lg bg-gradient-to-r from-orange-50 to-orange-50">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">Package Weight:</span>
                                  <span className="text-sm font-semibold text-orange-700">{product.shippingInfo.weight}g</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">Dimensions:</span>
                                  <span className="text-sm font-semibold text-orange-700">{product.shippingInfo.shippingDimensions}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">Package Type:</span>
                                  <span className="text-sm font-semibold text-orange-700">{product.shippingInfo.packageType}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <Alert className="border-blue-200 bg-blue-50">
                              <AlertDescription className="text-sm text-blue-700">
                                📞 Contact our team for personalized shipping options and delivery estimates.
                              </AlertDescription>
                            </Alert>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>

                    <Separator className="my-6" />
                    
                    {/* Enhanced Product Customization Alert */}
                    {/* <Alert className="p-4 border-[#e65100]/30 bg-gradient-to-r from-[#e65100]/10 to-[#ff7043]/10">
                      <Settings className="w-5 h-5 text-[#e65100]" />
                      <AlertDescription className="ml-2 text-sm font-medium text-gray-700">
                        🎨 <span className="font-semibold text-[#e65100]">Ready to customize?</span> Select your preferred color, size, and printing technology to start creating with our professional design tools.
                      </AlertDescription>
                    </Alert> */}
                  </div>
                </CardContent>
                
                {/* <CardFooter className="flex flex-col gap-3 px-6 pb-6 bg-gradient-to-r from-gray-50 to-white">
                  
                  <Button 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#e65100] to-[#ff7043] hover:from-[#d84315] hover:to-[#e65100] transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                    size="lg"
                    disabled={!selectedColor || !selectedSize || !selectedTechnology}
                    onClick={() => {
                      router.navigate({ 
                        to: `/designer/${productId}`, 
                        search: { 
                          color: selectedColor?.id,
                          technology: selectedTechnology?.id,
                        }
                      });
                    }}
                  >
                    {!selectedColor || !selectedSize || !selectedTechnology 
                      ? 'Select Options Above' 
                      : '🎨 Start Creating Magic'
                    }
                  </Button>
                  
                  <Button 
                    onClick={() => router.navigate({ to: '/productCatalog' })}
                    variant="outline"
                    className="w-full h-11 border-[#e65100] text-[#e65100] hover:bg-[#e65100] hover:text-white transition-all duration-200"
                  >
                    ← Explore More Products
                  </Button>
                  
                  
                  <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-green-500" />
                      <span>Quality Guaranteed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span>Premium Service</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-blue-500" />
                      <span>Fast Delivery</span>
                    </div>
                  </div>
                </CardFooter> */}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;