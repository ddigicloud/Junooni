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
import { ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "./Navbar";

const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;

// Interface definitions
interface Image {
  id: number;
  alt: string;
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
}

interface SizeOption {
  id: string;
  sizeName: string;
  sizeDescription: string | null;
}

interface PrintingTechnology {
  id: string;
  technologyName: string;
  customizationAreas: any[];
  mockupPhotos: any[];
}

interface Dimensions {
  x: number;
  y: number;
  customizableWidth: number;
  customizableHeight: number;
}

interface ShippingInfo {
  weight: number;
  dimensions: string;
}

interface Category {
  id: number;
  title: string;
  slug: string;
  parent: Category | null;
  breadcrumbs: Breadcrumb[];
  updatedAt: string;
  createdAt: string;
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

interface ListItem {
  type: string;
  value: number;
  format: string;
  indent: number;
  version: number;
  children: TextNode[];
  direction: string;
}

interface ListNode {
  tag: string;
  type: string;
  start: number;
  format: string;
  indent: number;
  version: number;
  children: ListItem[];
  listType: string;
  direction: string;
}

interface RootNode {
  type: string;
  format: string;
  indent: number;
  version: number;
  children: (ListNode | ParagraphNode)[];
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
  cost: number;
  sku: string;
  brand: string;
  Brandsku: string | null;
  dimensions: Dimensions;
  categories: Category[];
  colorOptions: ColorOption[];
  sizeOptions: SizeOption[];
  sizeChart: any | null;
  description: string | null;
  features: Features | null;
  displayImages: DisplayImage[];
  mockupImages: any[];
  shippingInfo: ShippingInfo;
  printingTechnologies: PrintingTechnology[];
  updatedAt: string;
  createdAt: string;
}

// Define the shape of our route parameters
interface RouteParams {
  id?: string;
}

const ProductPage = () => {
  // Use the router instance
  const router = useRouter();
  
  // Get params from the current route with proper typing
  const params = useParams({ strict: false }) as RouteParams;

  const productId = params.id;
  console.log(productId)
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [openSections, setOpenSections] = useState({
    details: true,
    features: false,
    description: true,
    shipping: false
  });
  
  // Try to load the product from session storage or fetch it
  useEffect(() => {
    const loadProduct = async () => {
      // Safety check - if no productId, redirect to catalog
      if (!productId) {
        console.error("Product ID not found in URL parameters");
        router.navigate({ to: '/productCatalog' });
        return;
      }
      
      setLoading(true);
      
      try {
        // First try to get from sessionStorage
        const storedProduct = sessionStorage.getItem(`product_${productId}`);
        
        if (storedProduct) {
          const parsedProduct = JSON.parse(storedProduct);
          setProduct(parsedProduct);
          
          // Set default selections
          if (parsedProduct.colorOptions && parsedProduct.colorOptions.length > 0) {
            setSelectedColor(parsedProduct.colorOptions[0]);
          }
          
          if (parsedProduct.sizeOptions && parsedProduct.sizeOptions.length > 0) {
            setSelectedSize(parsedProduct.sizeOptions[0]);
          }
          
          setLoading(false);
          return;
        }
        
        // If not in session storage, fetch from API
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
        if (data.colorOptions && data.colorOptions.length > 0) {
          setSelectedColor(data.colorOptions[0]);
        }
        
        if (data.sizeOptions && data.sizeOptions.length > 0) {
          setSelectedSize(data.sizeOptions[0]);
        }
        
        // Store in sessionStorage for future use
        sessionStorage.setItem(`product_${productId}`, JSON.stringify(data));
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [productId, router]);

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Extract features from the product data if available
  const extractFeatures = (): string[] => {
    if (product?.features && product.features.root && product.features.root.children) {
      return product.features.root.children.map((node: ListNode | ParagraphNode) => {
        // Handle different node types
        if (node.type === "paragraph" && 'children' in node) {
          // Extract text from paragraph nodes
          const paragraphNode = node as ParagraphNode;
          const textNodes = paragraphNode.children.filter((child: TextNode) => child.type === "text");
          return textNodes.map((textNode: TextNode) => textNode.text).join(" ");
        } else if (node.type === "list" && 'children' in node) {
          // Extract text from list items (for backward compatibility)
          const listNode = node as ListNode;
          return listNode.children
            .filter((item: ListItem) => item.type === "listitem")
            .map((item: ListItem) => {
              if (item.children && item.children.length > 0) {
                const textNode = item.children.find((child: TextNode) => child.type === "text");
                return textNode ? textNode.text : "";
              }
              return "";
            })
            .filter((text: string) => text !== "")
            .join(", ");
        }
        return "";
      }).filter((text: string) => text !== "");
    }
    return [];
  };
  
  // Extract and format the product description
  const formatDescription = (): string[] => {
    if (!product?.description) return [];
    return product.description.split("\n").filter((line: string) => line.trim() !== "");
  };

  if (loading) {
    return (
      <div className="container p-4 mx-auto mt-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            {/* Image gallery skeleton */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-full h-40 rounded-md" />
              ))}
            </div>
            {/* Thumbnails skeleton */}
            <div className="flex gap-2 mt-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="rounded-md w-14 h-14" />
              ))}
            </div>
          </div>
          <div>
            {/* Product info skeleton */}
            <Skeleton className="w-3/4 h-8 mb-2" />
            <Skeleton className="w-1/2 h-6 mb-4" />
            <Skeleton className="w-1/3 h-8 mb-6" />
            
            {/* Options skeleton */}
            <Skeleton className="w-full h-6 mb-2" />
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-full h-10" />
              ))}
            </div>
            
            {/* Buttons skeleton */}
            <Skeleton className="w-full h-12 mb-3" />
            <Skeleton className="w-full h-12 mb-6" />
            
            {/* Collapsible content skeleton */}
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="w-full h-16" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container p-4 mx-auto mt-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Product Not Found</CardTitle>
            <CardDescription>
              The product you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => router.navigate({ to: '/productCatalog' })}
              className="w-full"
            >
              Back to Catalog
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const features = extractFeatures();
  const descriptionParagraphs = formatDescription();
  
  // Get primary category for breadcrumbs (most specific)
  const getPrimaryCategoryPath = (): { url: string, label: string }[] => {
    if (!product?.categories || product.categories.length === 0) {
      return [{ url: '/productCatalog', label: 'Catalog' }];
    }
    
    // Find the category with the most breadcrumbs (likely the most specific)
    const primaryCategory = product.categories.reduce((prev: Category, current: Category) => 
      (prev.breadcrumbs.length > current.breadcrumbs.length) ? prev : current
    );
    
    // Return formatted breadcrumbs
    return [
      { url: '/productCatalog', label: 'Catalog' },
      ...primaryCategory.breadcrumbs.map((crumb: Breadcrumb) => ({ 
        url: crumb.url, 
        label: crumb.label 
      }))
    ];
  };
  
  const breadcrumbs = getPrimaryCategoryPath();
  
  const toggleSection = (section: keyof typeof openSections): void => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  return (
    <>
      <Navbar />
      <div className=" w-[100%] max-w-[95%] mx-auto p-4 mt-20">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap mb-4 text-sm text-gray-500">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900">{crumb.label}</span>
              ) : (
                <Button 
                  variant="link" 
                  className="h-auto p-0"
                  onClick={() => router.navigate({ to: crumb.url })}
                >
                  {crumb.label}
                </Button>
              )}
            </div>
          ))}
        </nav>

        <div className="grid grid-cols-1 md:flex lg:w-[100%] gap-8">
          {/* Left Column - Product Images (now in 2 columns) */}
          <div className="md:w-[60%]">
            {/* Main Product Images - 2 column grid */}
            {product.displayImages && product.displayImages.length > 0 ? (
           <div>
              <div className="hidden grid-cols-2 gap-2 mb-4 md:grid">
                 {product.displayImages.map((img: DisplayImage, index: number) => (
                  <div 
                    key={img.id}
                    className={`
                      cursor-pointer bg-gray-50 overflow-hidden relative
                      ${selectedImage === index ? '' : 'hover:opacity-90 transition-opacity'}
                    `}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={`${vite_payload}${img.image.url}`}
                      alt={img.image.alt || `${product.name} view ${index + 1}`}
                      className="w-full h-[400px] object-cover "
                    />
                   
                  </div>
                ))}
              </div>


              <div className="grid gap-2 mb-4 md:hidden">
                {product.displayImages && product.displayImages.length > 0 && (
                    <div 
                    className="relative overflow-hidden cursor-pointer bg-gray-50"
                    >
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
              <div className="flex items-center justify-center h-48 mb-4 bg-gray-100 rounded-lg">
                <p className="text-gray-400">No Images Available</p>
              </div>
            )}
            
            {/* Thumbnail navigation - horizontal scrolling */}
            {product.displayImages && product.displayImages.length > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 overflow-x-auto md:hidden hide-scrollbar">
                {product.displayImages.map((img: DisplayImage, index: number) => (
                <div 
                    key={`thumb-${img.id}`}
                    className={`
                    cursor-pointer bg-gray-50 rounded-md overflow-hidden flex-shrink-0
                    ${selectedImage === index ? 'ring-2 ring-black' : ''}
                    transition-all duration-200
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
            <Card className="border-0 shadow-none">
              <CardHeader className="px-0 pt-0 pb-3">
                {/* Categories and Brand */}
                <div className="flex gap-2 mb-1">
                  {product.categories && product.categories.slice(0, 2).map((category: Category) => (
                    <Badge key={category.id} variant="outline">
                      {category.title}
                    </Badge>
                  ))}
                </div>
                
                {/* Product Name */}
                <CardTitle className="text-2xl font-medium text-gray-900">
                  {product.name}
                </CardTitle>
                
                {/* SKU and Brand */}
                <CardDescription className="flex items-center gap-2 text-sm">
                  <span>Brand: {product.brand}</span>
                  <span>•</span>
                  <span>SKU: {product.sku}</span>
                </CardDescription>

                {/* Price */}
                <div className="mt-2 text-2xl font-bold">
                  {formatCurrency(product.cost)}
                </div>
              </CardHeader>
              
              <CardContent className="px-0">
                <div className="space-y-4">
                  {/* Color Options */}
                  {product.colorOptions && product.colorOptions.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-gray-900">Color</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.colorOptions.map((color: ColorOption) => (
                          <TooltipProvider key={color.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  onClick={() => setSelectedColor(color)}
                                  className={`
                                    w-8 h-8 rounded-full cursor-pointer border transition-all duration-200
                                    ${selectedColor?.id === color.id ? 'ring-2 ring-offset-1 ring-black scale-110' : 'border-gray-300 hover:scale-105'}
                                  `}
                                  style={{ 
                                    backgroundColor: color.colorHex,
                                    border: color.colorHex.toLowerCase() === '#ffffff' ? '1px solid #e5e7eb' : 'none' 
                                  }}
                                ></div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{color.colorName}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                      {selectedColor && (
                        <p className="mt-1 text-sm text-gray-500">Selected: {selectedColor.colorName}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Size Options */}
                  {product.sizeOptions && product.sizeOptions.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900">Size</h3>
                        <Button variant="link" className="h-auto p-0 text-sm">Size Guide</Button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mb-1 sm:grid-cols-6">
                        {product.sizeOptions.map((size: SizeOption) => (
                          <div
                            key={size.id}
                            onClick={() => setSelectedSize(size)}
                            className={`
                              py-1 px-2 border rounded text-center cursor-pointer 
                              transition-all duration-200 text-sm
                              ${selectedSize?.id === size.id 
                                ? 'border-black bg-black text-white scale-105' 
                                : 'border-gray-300 hover:border-gray-400 hover:scale-105'}
                            `}
                          >
                            {size.sizeName}
                          </div>
                        ))}
                      </div>
                      {selectedSize?.sizeDescription && (
                        <p className="mt-1 text-xs text-gray-500">{selectedSize.sizeDescription}</p>
                      )}
                    </div>
                  )}

                  {/* Collapsible Sections with smooth animation */}
                  <div className="mt-4 space-y-1">
                    {/* Product Details */}
                    <Collapsible 
                      open={openSections.details} 
                      onOpenChange={() => toggleSection('details')}
                      className="overflow-hidden transition-all duration-300 border rounded-md"
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 font-medium transition-colors bg-gray-50 hover:bg-gray-100">
                        <span>Product Details</span>
                        <span className="transition-transform duration-300">
                          {openSections.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-3 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
                        {/* Description */}
                        {descriptionParagraphs.length > 0 && (
                          <div className="mb-3">
                            <div className="space-y-1 text-gray-700">
                              {descriptionParagraphs.map((paragraph: string, index: number) => (
                                <p key={index} className="text-sm">{paragraph}</p>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Dimensions */}
                        {product.dimensions && (
                          <div className="mb-3">
                            <h4 className="mb-1 text-xs font-semibold">Dimensions</h4>
                            <div className="grid grid-cols-2 text-xs gap-x-4 gap-y-1">
                              <div>Width: {product.dimensions.x} units</div>
                              <div>Height: {product.dimensions.y} units</div>
                              <div>Customizable Width: {product.dimensions.customizableWidth} px</div>
                              <div>Customizable Height: {product.dimensions.customizableHeight} px</div>
                            </div>
                          </div>
                        )}
                        
                        {/* Categories */}
                        {product.categories && product.categories.length > 0 && (
                          <div>
                            <h4 className="mb-1 text-xs font-semibold">Categories</h4>
                            <div className="flex flex-wrap gap-1">
                              {product.categories.map((category: Category) => (
                                <Badge 
                                  key={category.id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {category.title}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                    
                    {/* Features */}
                    <Collapsible 
                      open={openSections.features} 
                      onOpenChange={() => toggleSection('features')}
                      className="overflow-hidden transition-all duration-300 border rounded-md"
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 font-medium transition-colors bg-gray-50 hover:bg-gray-100">
                        <span>Features & Materials</span>
                        <span className="transition-transform duration-300">
                          {openSections.features ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-3 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
                        {features.length > 0 ? (
                          <ul className="pl-4 space-y-1 text-xs list-disc">
                            {features.map((feature: string, index: number) => (
                              <li key={index}>{feature}</li>
                            ))}
                          </ul>
                        ) : (
                          <Alert className="py-2">
                            <AlertDescription className="text-xs">
                              No product features available at this time.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                    
                    {/* Shipping */}
                    <Collapsible 
                      open={openSections.shipping} 
                      onOpenChange={() => toggleSection('shipping')}
                      className="overflow-hidden transition-all duration-300 border rounded-md"
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 font-medium transition-colors bg-gray-50 hover:bg-gray-100">
                        <span>Shipping Information</span>
                        <span className="transition-transform duration-300">
                          {openSections.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-3 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
                        {product.shippingInfo ? (
                          <div className="space-y-2 text-xs">
                            <div className="grid grid-cols-2 gap-3 p-2 rounded-lg bg-gray-50">
                              <div>
                                <span className="font-medium">Weight:</span> {product.shippingInfo.weight} g
                              </div>
                              <div>
                                <span className="font-medium">Package Dimensions:</span> {product.shippingInfo.dimensions}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              Shipping costs calculated at checkout.
                            </p>
                          </div>
                        ) : (
                          <Alert className="py-2">
                            <AlertDescription className="text-xs">
                              No shipping information available.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  <Separator className="my-4" />
                  
                  {/* Product Customization Alert */}
                  <Alert className="p-3 border-gray-200 bg-gray-50">
                    <AlertDescription className="text-xs">
                      This product can be customized with your own designs. Select color and size to continue.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-2 px-0 pt-4">
                {/* Action Buttons */}
                <Button 
                  className="w-full"
                  size="lg"
                  disabled={!selectedColor || !selectedSize}
                >
                  Start Designing
                </Button>
                
                <Button 
                  onClick={() => router.navigate({ to: '/productCatalog' })}
                  variant="outline"
                  className="w-full"
                >
                  Back to Catalog
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;