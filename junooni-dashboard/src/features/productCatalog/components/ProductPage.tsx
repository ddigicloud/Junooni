// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "@tanstack/react-router";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
// import { ChevronDown, ChevronUp } from "lucide-react";
// import Navbar from "./Navbar";

// const vite_payload = import.meta.env.VITE_PAYLOAD_BASE_URL;

// // Interface definitions
// interface Image {
//   id: number;
//   alt: string;
//   url: string;
//   thumbnailURL: string | null;
//   filename: string;
//   mimeType: string;
//   filesize: number;
//   width: number;
//   height: number;
//   focalX: number;
//   focalY: number;
//   updatedAt: string;
//   createdAt: string;
// }

// interface DisplayImage {
//   id: string;
//   title: string | null;
//   image: Image;
//   caption: string | null;
// }

// interface ColorOption {
//   id: string;
//   colorName: string;
//   colorHex: string;
// }

// interface SizeOption {
//   id: string;
//   sizeName: string;
//   sizeDescription: string | null;
// }

// interface PrintingTechnology {
//   id: string;
//   technologyName: string;
//   customizationAreas: any[];
//   mockupPhotos: any[];
// }

// interface Dimensions {
//   x: number;
//   y: number;
//   customizableWidth: number;
//   customizableHeight: number;
// }

// interface ShippingInfo {
//   weight: number;
//   dimensions: string;
// }

// interface Category {
//   id: number;
//   title: string;
//   slug: string;
//   parent: Category | null;
//   breadcrumbs: Breadcrumb[];
//   updatedAt: string;
//   createdAt: string;
// }

// interface TextNode {
//   mode: string;
//   text: string;
//   type: string;
//   style: string;
//   detail: number;
//   format: number;
//   version: number;
// }

// interface ParagraphNode {
//   type: string;
//   format: string;
//   indent: number;
//   version: number;
//   children: TextNode[];
//   direction: string;
//   textStyle?: string;
//   textFormat?: number;
// }

// interface ListItem {
//   type: string;
//   value: number;
//   format: string;
//   indent: number;
//   version: number;
//   children: TextNode[];
//   direction: string;
// }

// interface ListNode {
//   tag: string;
//   type: string;
//   start: number;
//   format: string;
//   indent: number;
//   version: number;
//   children: ListItem[];
//   listType: string;
//   direction: string;
// }

// interface RootNode {
//   type: string;
//   format: string;
//   indent: number;
//   version: number;
//   children: (ListNode | ParagraphNode)[];
//   direction: string;
// }

// interface Features {
//   root: RootNode;
// }

// interface Breadcrumb {
//   id: string;
//   doc: number;
//   url: string;
//   label: string;
// }

// interface Product {
//   id: number;
//   name: string;
//   cost: number;
//   sku: string;
//   brand: string;
//   Brandsku: string | null;
//   dimensions: Dimensions;
//   categories: Category[];
//   colorOptions: ColorOption[];
//   sizeOptions: SizeOption[];
//   sizeChart: any | null;
//   description: string | null;
//   features: Features | null;
//   displayImages: DisplayImage[];
//   mockupImages: any[];
//   shippingInfo: ShippingInfo;
//   printingTechnologies: PrintingTechnology[];
//   updatedAt: string;
//   createdAt: string;
// }

// // Define the shape of our route parameters
// interface RouteParams {
//   id?: string;
// }

// const ProductPage = () => {
//   // Use the router instance
//   const router = useRouter();
  
//   // Get params from the current route with proper typing
//   const params = useParams({ strict: false }) as RouteParams;

//   const productId = params.id;
//   console.log(productId)
//   const [product, setProduct] = useState<Product | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [selectedImage, setSelectedImage] = useState<number>(0);
//   const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
//   const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
//   const [openSections, setOpenSections] = useState({
//     details: true,
//     features: false,
//     description: true,
//     shipping: false
//   });
  
//   // Try to load the product from session storage or fetch it
//   useEffect(() => {
//     const loadProduct = async () => {
//       // Safety check - if no productId, redirect to catalog
//       if (!productId) {
//         console.error("Product ID not found in URL parameters");
//         router.navigate({ to: '/productCatalog' });
//         return;
//       }
      
//       setLoading(true);
      
//       try {
//         // First try to get from sessionStorage
//         const storedProduct = sessionStorage.getItem(`product_${productId}`);
        
//         if (storedProduct) {
//           const parsedProduct = JSON.parse(storedProduct);
//           setProduct(parsedProduct);
          
//           // Set default selections
//           if (parsedProduct.colorOptions && parsedProduct.colorOptions.length > 0) {
//             setSelectedColor(parsedProduct.colorOptions[0]);
//           }
          
//           if (parsedProduct.sizeOptions && parsedProduct.sizeOptions.length > 0) {
//             setSelectedSize(parsedProduct.sizeOptions[0]);
//           }
          
//           setLoading(false);
//           return;
//         }
        
//         // If not in session storage, fetch from API
//         const response = await fetch(`${vite_payload}/api/blank-products/${productId}`, {
//           credentials: 'include',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });
       
//         if (!response.ok) {
//           throw new Error('Product not found');
//         }
        
//         const data = await response.json();
//         setProduct(data);
        
//         // Set default selections
//         if (data.colorOptions && data.colorOptions.length > 0) {
//           setSelectedColor(data.colorOptions[0]);
//         }
        
//         if (data.sizeOptions && data.sizeOptions.length > 0) {
//           setSelectedSize(data.sizeOptions[0]);
//         }
        
//         // Store in sessionStorage for future use
//         sessionStorage.setItem(`product_${productId}`, JSON.stringify(data));
//       } catch (error) {
//         console.error("Error loading product:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     loadProduct();
//   }, [productId, router]);

//   // Format currency for display
//   const formatCurrency = (amount: number): string => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//     }).format(amount);
//   };

//   // Extract features from the product data if available
//   const extractFeatures = (): string[] => {
//     if (product?.features && product.features.root && product.features.root.children) {
//       return product.features.root.children.map((node: ListNode | ParagraphNode) => {
//         // Handle different node types
//         if (node.type === "paragraph" && 'children' in node) {
//           // Extract text from paragraph nodes
//           const paragraphNode = node as ParagraphNode;
//           const textNodes = paragraphNode.children.filter((child: TextNode) => child.type === "text");
//           return textNodes.map((textNode: TextNode) => textNode.text).join(" ");
//         } else if (node.type === "list" && 'children' in node) {
//           // Extract text from list items (for backward compatibility)
//           const listNode = node as ListNode;
//           return listNode.children
//             .filter((item: ListItem) => item.type === "listitem")
//             .map((item: ListItem) => {
//               if (item.children && item.children.length > 0) {
//                 const textNode = item.children.find((child: TextNode) => child.type === "text");
//                 return textNode ? textNode.text : "";
//               }
//               return "";
//             })
//             .filter((text: string) => text !== "")
//             .join(", ");
//         }
//         return "";
//       }).filter((text: string) => text !== "");
//     }
//     return [];
//   };
  
//   // Extract and format the product description
//   const formatDescription = (): string[] => {
//     if (!product?.description) return [];
//     return product.description.split("\n").filter((line: string) => line.trim() !== "");
//   };

//   if (loading) {
//     return (
//       <div className="container p-4 mx-auto mt-16">
//         <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
//           <div>
//             {/* Image gallery skeleton */}
//             <div className="grid grid-cols-2 gap-2 mb-2">
//               {[...Array(4)].map((_, i) => (
//                 <Skeleton key={i} className="w-full h-40 rounded-md" />
//               ))}
//             </div>
//             {/* Thumbnails skeleton */}
//             <div className="flex gap-2 mt-2">
//               {[...Array(4)].map((_, i) => (
//                 <Skeleton key={i} className="rounded-md w-14 h-14" />
//               ))}
//             </div>
//           </div>
//           <div>
//             {/* Product info skeleton */}
//             <Skeleton className="w-3/4 h-8 mb-2" />
//             <Skeleton className="w-1/2 h-6 mb-4" />
//             <Skeleton className="w-1/3 h-8 mb-6" />
            
//             {/* Options skeleton */}
//             <Skeleton className="w-full h-6 mb-2" />
//             <div className="grid grid-cols-4 gap-2 mb-6">
//               {[...Array(4)].map((_, i) => (
//                 <Skeleton key={i} className="w-full h-10" />
//               ))}
//             </div>
            
//             {/* Buttons skeleton */}
//             <Skeleton className="w-full h-12 mb-3" />
//             <Skeleton className="w-full h-12 mb-6" />
            
//             {/* Collapsible content skeleton */}
//             <div className="space-y-2">
//               {[...Array(3)].map((_, i) => (
//                 <Skeleton key={i} className="w-full h-16" />
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="container p-4 mx-auto mt-16">
//         <Card className="max-w-md mx-auto">
//           <CardHeader>
//             <CardTitle className="text-2xl font-semibold">Product Not Found</CardTitle>
//             <CardDescription>
//               The product you're looking for doesn't exist or has been removed.
//             </CardDescription>
//           </CardHeader>
//           <CardFooter>
//             <Button 
//               onClick={() => router.navigate({ to: '/productCatalog' })}
//               className="w-full"
//             >
//               Back to Catalog
//             </Button>
//           </CardFooter>
//         </Card>
//       </div>
//     );
//   }

//   const features = extractFeatures();
//   const descriptionParagraphs = formatDescription();
  
//   // Get primary category for breadcrumbs (most specific)
//   const getPrimaryCategoryPath = (): { url: string, label: string }[] => {
//     if (!product?.categories || product.categories.length === 0) {
//       return [{ url: '/productCatalog', label: 'Catalog' }];
//     }
    
//     // Find the category with the most breadcrumbs (likely the most specific)
//     const primaryCategory = product.categories.reduce((prev: Category, current: Category) => 
//       (prev.breadcrumbs.length > current.breadcrumbs.length) ? prev : current
//     );
    
//     // Return formatted breadcrumbs
//     return [
//       { url: '/productCatalog', label: 'Catalog' },
//       ...primaryCategory.breadcrumbs.map((crumb: Breadcrumb) => ({ 
//         url: crumb.url, 
//         label: crumb.label 
//       }))
//     ];
//   };
  
//   const breadcrumbs = getPrimaryCategoryPath();
  
//   const toggleSection = (section: keyof typeof openSections): void => {
//     setOpenSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   };
  
//   return (
//     <>
//       <Navbar />
//       <div className=" w-[100%] max-w-[95%] mx-auto p-4 mt-20">
//         {/* Breadcrumbs */}
//         <nav className="flex flex-wrap mb-4 text-sm text-gray-500">
//           {breadcrumbs.map((crumb, index) => (
//             <div key={index} className="flex items-center">
//               {index > 0 && <span className="mx-2">/</span>}
//               {index === breadcrumbs.length - 1 ? (
//                 <span className="text-gray-900">{crumb.label}</span>
//               ) : (
//                 <Button 
//                   variant="link" 
//                   className="h-auto p-0"
//                   onClick={() => router.navigate({ to: crumb.url })}
//                 >
//                   {crumb.label}
//                 </Button>
//               )}
//             </div>
//           ))}
//         </nav>

//         <div className="grid grid-cols-1 md:flex lg:w-[100%] gap-8">
//           {/* Left Column - Product Images (now in 2 columns) */}
//           <div className="md:w-[60%]">
//             {/* Main Product Images - 2 column grid */}
//             {product.displayImages && product.displayImages.length > 0 ? (
//            <div>
//               <div className="hidden grid-cols-2 gap-2 mb-4 md:grid">
//                  {product.displayImages.map((img: DisplayImage, index: number) => (
//                   <div 
//                     key={img.id}
//                     className={`
//                       cursor-pointer bg-gray-50 overflow-hidden relative
//                       ${selectedImage === index ? '' : 'hover:opacity-90 transition-opacity'}
//                     `}
//                     onClick={() => setSelectedImage(index)}
//                   >
//                     <img
//                       src={`${vite_payload}${img.image.url}`}
//                       alt={img.image.alt || `${product.name} view ${index + 1}`}
//                       className="w-full h-[400px] object-cover "
//                     />
                   
//                   </div>
//                 ))}
//               </div>


//               <div className="grid gap-2 mb-4 md:hidden">
//                 {product.displayImages && product.displayImages.length > 0 && (
//                     <div 
//                     className="relative overflow-hidden cursor-pointer bg-gray-50"
//                     >
//                     <img
//                         src={`${vite_payload}${product.displayImages[selectedImage].image.url}`}
//                         alt={product.displayImages[selectedImage].image.alt || `${product.name} view`}
//                         className="w-full h-[400px] object-cover"
//                     />
//                     </div>
//                 )}
//                 </div>
//            </div> 

//             ) : (
//               <div className="flex items-center justify-center h-48 mb-4 bg-gray-100 rounded-lg">
//                 <p className="text-gray-400">No Images Available</p>
//               </div>
//             )}
            
//             {/* Thumbnail navigation - horizontal scrolling */}
//             {product.displayImages && product.displayImages.length > 1 && (
//             <div className="flex items-center justify-center gap-2 py-4 overflow-x-auto md:hidden hide-scrollbar">
//                 {product.displayImages.map((img: DisplayImage, index: number) => (
//                 <div 
//                     key={`thumb-${img.id}`}
//                     className={`
//                     cursor-pointer bg-gray-50 rounded-md overflow-hidden flex-shrink-0
//                     ${selectedImage === index ? 'ring-2 ring-black' : ''}
//                     transition-all duration-200
//                     `}
//                     onClick={() => setSelectedImage(index)}
//                     style={{ width: '60px', height: '60px' }}
//                 >
//                     <img
//                     src={`${vite_payload}${img.image.url}`}
//                     alt={img.image.alt || `Thumbnail ${index + 1}`}
//                     className="object-cover w-full h-full"
//                     />
//                 </div>
//                 ))}
//             </div>
//             )}
//           </div>
          
//           {/* Right Column - Product Details */}
//           <div className="md:w-[40%]">
//             <Card className="border-0 shadow-none">
//               <CardHeader className="px-0 pt-0 pb-3">
//                 {/* Categories and Brand */}
//                 <div className="flex gap-2 mb-1">
//                   {product.categories && product.categories.slice(0, 2).map((category: Category) => (
//                     <Badge key={category.id} variant="outline">
//                       {category.title}
//                     </Badge>
//                   ))}
//                 </div>
                
//                 {/* Product Name */}
//                 <CardTitle className="text-2xl font-medium text-gray-900">
//                   {product.name}
//                 </CardTitle>
                
//                 {/* SKU and Brand */}
//                 <CardDescription className="flex items-center gap-2 text-sm">
//                   <span>Brand: {product.brand}</span>
//                   <span>•</span>
//                   <span>SKU: {product.sku}</span>
//                 </CardDescription>

//                 {/* Price */}
//                 <div className="mt-2 text-2xl font-bold">
//                   {formatCurrency(product.cost)}
//                 </div>
//               </CardHeader>
              
//               <CardContent className="px-0">
//                 <div className="space-y-4">
//                   {/* Color Options */}
//                   {product.colorOptions && product.colorOptions.length > 0 && (
//                     <div>
//                       <h3 className="mb-2 text-sm font-medium text-gray-900">Color</h3>
//                       <div className="flex flex-wrap gap-2">
//                         {product.colorOptions.map((color: ColorOption) => (
//                           <TooltipProvider key={color.id}>
//                             <Tooltip>
//                               <TooltipTrigger asChild>
//                                 <div
//                                   onClick={() => setSelectedColor(color)}
//                                   className={`
//                                     w-8 h-8 rounded-full cursor-pointer border transition-all duration-200
//                                     ${selectedColor?.id === color.id ? 'ring-2 ring-offset-1 ring-black scale-110' : 'border-gray-300 hover:scale-105'}
//                                   `}
//                                   style={{ 
//                                     backgroundColor: color.colorHex,
//                                     border: color.colorHex.toLowerCase() === '#ffffff' ? '1px solid #e5e7eb' : 'none' 
//                                   }}
//                                 ></div>
//                               </TooltipTrigger>
//                               <TooltipConte
//                                 <p>{color.colorName}</p>
//                               </TooltipContent>
//                             </Tooltip>
//                           </TooltipProvider>
//                         ))}
//                       </div>
//                       {selectedColor && (
//                         <p className="mt-1 text-sm text-gray-500">Selected: {selectedColor.colorName}</p>
//                       )}
//                     </div>
//                   )}
                  
//                   {/* Size Options */}
//                   {product.sizeOptions && product.sizeOptions.length > 0 && (
//                     <div>
//                       <div className="flex items-center justify-between mb-2">
//                         <h3 className="text-sm font-medium text-gray-900">Size</h3>
//                         <Button variant="link" className="h-auto p-0 text-sm">Size Guide</Button>
//                       </div>
//                       <div className="grid grid-cols-4 gap-2 mb-1 sm:grid-cols-6">
//                         {product.sizeOptions.map((size: SizeOption) => (
//                           <div
//                             key={size.id}
//                             onClick={() => setSelectedSize(size)}
//                             className={`
//                               py-1 px-2 border rounded text-center cursor-pointer 
//                               transition-all duration-200 text-sm
//                               ${selectedSize?.id === size.id 
//                                 ? 'border-black bg-black text-white scale-105' 
//                                 : 'border-gray-300 hover:border-gray-400 hover:scale-105'}
//                             `}
//                           >
//                             {size.sizeName}
//                           </div>
//                         ))}
//                       </div>
//                       {selectedSize?.sizeDescription && (
//                         <p className="mt-1 text-xs text-gray-500">{selectedSize.sizeDescription}</p>
//                       )}
//                     </div>
//                   )}

//                   {/* Collapsible Sections with smooth animation */}
//                   <div className="mt-4 space-y-1">
//                     {/* Product Details */}
//                     <Collapsible 
//                       open={openSections.details} 
//                       onOpenChange={() => toggleSection('details')}
//                       className="overflow-hidden transition-all duration-300 border rounded-md"
//                     >
//                       <CollapsibleTrigger className="flex items-center justify-between w-full p-3 font-medium transition-colors bg-gray-50 hover:bg-gray-100">
//                         <span>Product Details</span>
//                         <span className="transition-transform duration-300">
//                           {openSections.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//                         </span>
//                       </CollapsibleTrigger>
//                       <CollapsibleContent className="p-3 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
//                         {/* Description */}
//                         {descriptionParagraphs.length > 0 && (
//                           <div className="mb-3">
//                             <div className="space-y-1 text-gray-700">
//                               {descriptionParagraphs.map((paragraph: string, index: number) => (
//                                 <p key={index} className="text-sm">{paragraph}</p>
//                               ))}
//                             </div>
//                           </div>
//                         )}
                        
//                         {/* Dimensions */}
//                         {product.dimensions && (
//                           <div className="mb-3">
//                             <h4 className="mb-1 text-xs font-semibold">Dimensions</h4>
//                             <div className="grid grid-cols-2 text-xs gap-x-4 gap-y-1">
//                               <div>Width: {product.dimensions.x} units</div>
//                               <div>Height: {product.dimensions.y} units</div>
//                               <div>Customizable Width: {product.dimensions.customizableWidth} px</div>
//                               <div>Customizable Height: {product.dimensions.customizableHeight} px</div>
//                             </div>
//                           </div>
//                         )}
                        
//                         {/* Categories */}
//                         {product.categories && product.categories.length > 0 && (
//                           <div>
//                             <h4 className="mb-1 text-xs font-semibold">Categories</h4>
//                             <div className="flex flex-wrap gap-1">
//                               {product.categories.map((category: Category) => (
//                                 <Badge 
//                                   key={category.id}
//                                   variant="outline"
//                                   className="text-xs"
//                                 >
//                                   {category.title}
//                                 </Badge>
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                       </CollapsibleContent>
//                     </Collapsible>
                    
//                     {/* Features */}
//                     <Collapsible 
//                       open={openSections.features} 
//                       onOpenChange={() => toggleSection('features')}
//                       className="overflow-hidden transition-all duration-300 border rounded-md"
//                     >
//                       <CollapsibleTrigger className="flex items-center justify-between w-full p-3 font-medium transition-colors bg-gray-50 hover:bg-gray-100">
//                         <span>Features & Materials</span>
//                         <span className="transition-transform duration-300">
//                           {openSections.features ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//                         </span>
//                       </CollapsibleTrigger>
//                       <CollapsibleContent className="p-3 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
//                         {features.length > 0 ? (
//                           <ul className="pl-4 space-y-1 text-xs list-disc">
//                             {features.map((feature: string, index: number) => (
//                               <li key={index}>{feature}</li>
//                             ))}
//                           </ul>
//                         ) : (
//                           <Alert className="py-2">
//                             <AlertDescription className="text-xs">
//                               No product features available at this time.
//                             </AlertDescription>
//                           </Alert>
//                         )}
//                       </CollapsibleContent>
//                     </Collapsible>
                    
//                     {/* Shipping */}
//                     <Collapsible 
//                       open={openSections.shipping} 
//                       onOpenChange={() => toggleSection('shipping')}
//                       className="overflow-hidden transition-all duration-300 border rounded-md"
//                     >
//                       <CollapsibleTrigger className="flex items-center justify-between w-full p-3 font-medium transition-colors bg-gray-50 hover:bg-gray-100">
//                         <span>Shipping Information</span>
//                         <span className="transition-transform duration-300">
//                           {openSections.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//                         </span>
//                       </CollapsibleTrigger>
//                       <CollapsibleContent className="p-3 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
//                         {product.shippingInfo ? (
//                           <div className="space-y-2 text-xs">
//                             <div className="grid grid-cols-2 gap-3 p-2 rounded-lg bg-gray-50">
//                               <div>
//                                 <span className="font-medium">Weight:</span> {product.shippingInfo.weight} g
//                               </div>
//                               <div>
//                                 <span className="font-medium">Package Dimensions:</span> {product.shippingInfo.dimensions}
//                               </div>
//                             </div>
//                             <p className="text-xs text-gray-500">
//                               Shipping costs calculated at checkout.
//                             </p>
//                           </div>
//                         ) : (
//                           <Alert className="py-2">
//                             <AlertDescription className="text-xs">
//                               No shipping information available.
//                             </AlertDescription>
//                           </Alert>
//                         )}
//                       </CollapsibleContent>
//                     </Collapsible>
//                   </div>

//                   <Separator className="my-4" />
                  
//                   {/* Product Customization Alert */}
//                   <Alert className="p-3 border-gray-200 bg-gray-50">
//                     <AlertDescription className="text-xs">
//                       This product can be customized with your own designs. Select color and size to continue.
//                     </AlertDescription>
//                   </Alert>
//                 </div>
//               </CardContent>
              
//               <CardFooter className="flex flex-col gap-2 px-0 pt-4">
//                 {/* Action Buttons */}
//                 <Button 
//                   className="w-full"
//                   size="lg"
//                   disabled={!selectedColor || !selectedSize}
//                   onClick={() => {
                  
                    
//                     // Navigate with just the color name in URL
//                     router.navigate({ 
//                       to: `/designer/${productId}`, 
//                       search: { 
//                         color: selectedColor?.id,
                        
//                       }
//                     });
//                   }}
//                 >
//                   Start Designing 
//                 </Button>
                
//                 <Button 
//                   onClick={() => router.navigate({ to: '/productCatalog' })}
//                   variant="outline"
//                   className="w-full"
//                 >
//                   Back to Catalog
//                 </Button>
//               </CardFooter>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ProductPage;

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
import { ChevronDown, ChevronUp, Star, Shield, Truck, Palette, Tag } from "lucide-react";
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
  tag: string; // Note: field name is 'tag' not 'name'
}

interface PrintingTechnology {
  id: string;
  technologyName: string;
  mockupPhotos: MockupPhoto[];
  custAreas: CustomizationArea[];
  tags: ProductTag[];
  // ... other fields from printT
}

interface MockupPhoto {
  id: string;
  title: string;
  photo: Image;
  viewAngle: string;
  mockupType: string;
  photoColor: string;
  priority: number;
  // ... other fields
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
  tags: ProductTag[]; // Top-level tags (currently empty in API)
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
  printT: PrintingTechnology[]; // Note: field name is 'printT' not 'printingTechnologies'
  custAreas: CustomizationArea[];
  displayImages: DisplayImage[];
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

  // Get all tags from product and printing technologies
  const getAllTags = (): ProductTag[] => {
    if (!product) return [];
    
    const allTags: ProductTag[] = [];
    
    // Add top-level product tags
    if (product.tags && product.tags.length > 0) {
      allTags.push(...product.tags);
    }
    
    // Add tags from printing technologies
    if (product.printT && product.printT.length > 0) {
      product.printT.forEach(tech => {
        if (tech.tags && tech.tags.length > 0) {
          allTags.push(...tech.tags);
        }
      });
    }
    
    // Remove duplicates based on id
    const uniqueTags = allTags.filter((tag, index, self) => 
      index === self.findIndex(t => t.id === tag.id)
    );
    
    return uniqueTags;
  };

  // Get icon for tag based on common tag names
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

  // Render dynamic tags
  const renderTags = () => {
    const allTags = getAllTags();
    
    if (allTags.length === 0) {
      // Fallback to default tag if no tags available
      return (
        <div className="flex items-center gap-1 text-[#e65100]">
          {/* <Star className="w-4 h-4 fill-current" /> */}
          <span className="text-sm font-semibold"></span>
        </div>
      );
    }

    // Display first tag prominently, others as smaller badges
    const [primaryTag, ...otherTags] = allTags;
    
    return (
      <div className="flex items-center gap-2">
        {/* Primary tag with icon */}
        <div className="flex items-center gap-1 text-[#e65100]">
          {getTagIcon(primaryTag.tag)}
          <span className="text-sm font-semibold">{primaryTag.tag}</span>
        </div>
        
        {/* Additional tags as small badges */}
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

  // Extract features from the product data if available
  const extractFeatures = (): string[] => {
    if (product?.features && product.features.root && product.features.root.children) {
      return product.features.root.children.map((node: ParagraphNode) => {
        // Extract text from paragraph nodes
        if (node.type === "paragraph" && node.children) {
          const textNodes = node.children.filter((child: TextNode) => child.type === "text");
          return textNodes.map((textNode: TextNode) => textNode.text).join(" ");
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
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container p-4 pt-24 mx-auto">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                {/* Image gallery skeleton */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-40 rounded-xl" />
                  ))}
                </div>
                {/* Thumbnails skeleton */}
                <div className="flex gap-2 mt-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="rounded-xl w-14 h-14" />
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full p-4 pt-24 mx-auto max-w-7xl">
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
              {/* Main Product Images - 2 column grid */}
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
                    <div className="flex gap-2">
                      {product.categories && product.categories.slice(0, 2).map((category: Category) => (
                        <Badge key={category.id} className="bg-[#e65100]/10 text-[#e65100] border-[#e65100]/20 hover:bg-[#e65100]/20 transition-colors duration-200">
                          {category.title}
                        </Badge>
                      ))}
                    </div>
                    {/* Dynamic Tags Section */}
                    {renderTags()}
                  </div>
                  
                  {/* Product Name */}
                  <CardTitle className="text-2xl font-bold leading-tight text-gray-900">
                    {product.name}
                  </CardTitle>
                  
                  {/* SKU and Brand */}
                  <CardDescription className="flex items-center gap-3 px-3 py-2 text-sm bg-white border rounded-lg">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-[#e65100]" />
                      <span className="font-medium">Brand:</span> 
                      <span className="text-[#e65100] font-semibold">{product.brand}</span>
                    </div>
                    <span>•</span>
                    <span><span className="font-medium">SKU:</span> {product.sku}</span>
                  </CardDescription>

                  {/* Price with offer highlight */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-[#e65100]/5 to-[#ff7043]/5 rounded-xl border border-[#e65100]/20">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[#e65100]">
                        {formatCurrency(product.cost)}
                      </span>
                      <span className="px-2 py-1 text-sm font-semibold text-green-600 rounded-full bg-green-50">
                        ✓ Best Price
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">No minimum order • Free design consultation</p>
                  </div>
                </CardHeader>
                
                <CardContent className="px-6 pb-6">
                  <div className="space-y-6">
                    {/* Color Options */}
                    {product.colorOptions && product.colorOptions.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-[#e65100]" />
                          <h3 className="text-sm font-semibold text-gray-900">Choose Your Color</h3>
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
                        {selectedColor && (
                          <div className="flex items-center gap-2 p-3 bg-[#e65100]/5 rounded-lg border border-[#e65100]/20">
                            <div 
                              className="w-4 h-4 border border-gray-300 rounded-full"
                              style={{ backgroundColor: selectedColor.colorHex }}
                            />
                            <span className="text-sm font-medium text-[#e65100]">
                              Selected: {selectedColor.colorName}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Size Options */}
                    {product.sizeOptions && product.sizeOptions.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">Select Size</h3>
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
                          {descriptionParagraphs.length > 0 && (
                            <div className="p-3 mb-4 rounded-lg bg-gray-50">
                              <h4 className="mb-2 text-sm font-semibold text-gray-900">Product Description</h4>
                              <div className="space-y-2 text-gray-700">
                                {descriptionParagraphs.map((paragraph: string, index: number) => (
                                  <p key={index} className="text-sm leading-relaxed">{paragraph}</p>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Physical Dimensions */}
                          {/* {product.physicalDimensions && (
                            <div className="mb-4 p-3 bg-[#e65100]/5 rounded-lg border border-[#e65100]/20">
                              <h4 className="text-sm font-semibold text-[#e65100] mb-2">📐 Physical Dimensions</h4>
                              <div className="grid grid-cols-2 text-sm gap-x-4 gap-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Width:</span>
                                  <span className="font-medium">{product.physicalDimensions.widthInches} {product.physicalDimensions.units}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Height:</span>
                                  <span className="font-medium">{product.physicalDimensions.heightInches} {product.physicalDimensions.units}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Depth:</span>
                                  <span className="font-medium">{product.physicalDimensions.depthInches} {product.physicalDimensions.units}</span>
                                </div>
                              </div>
                            </div>
                          )} */}

                          {/* Materials */}
                          {/* {product.materials && (
                            <div className="p-3 mb-4 border border-blue-200 rounded-lg bg-orange-50">
                              <h4 className="mb-2 text-sm font-semibold text-orange-700">🧵 Materials & Fabric</h4>
                              <div className="grid grid-cols-1 text-sm gap-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Primary Material:</span>
                                  <span className="font-medium">{product.materials.primary}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Construction:</span>
                                  <span className="font-medium">{product.materials.construction}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Fabric Weight:</span>
                                  <span className="font-medium">{product.materials.fabricWeight}gsm</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Surface:</span>
                                  <span className="font-medium">{product.materials.surfaceTexture}</span>
                                </div>
                              </div>
                            </div>
                          )} */}
                          
                          {/* Categories */}
                          {product.categories && product.categories.length > 0 && (
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
                          )}
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
                    <Alert className="p-4 border-[#e65100]/30 bg-gradient-to-r from-[#e65100]/10 to-[#ff7043]/10">
                      <Palette className="w-5 h-5 text-[#e65100]" />
                      <AlertDescription className="ml-2 text-sm font-medium text-gray-700">
                        🎨 <span className="font-semibold text-[#e65100]">Ready to customize?</span> This premium product awaits your unique design. Select your preferred color and size to unleash your creativity with our professional design tools.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-3 px-6 pb-6 bg-gradient-to-r from-gray-50 to-white">
                  {/* Action Buttons */}
                  <Button 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#e65100] to-[#ff7043] hover:from-[#d84315] hover:to-[#e65100] transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                    size="lg"
                    disabled={!selectedColor || !selectedSize}
                    onClick={() => {
                      router.navigate({ 
                        to: `/designer/${productId}`, 
                        search: { 
                          color: selectedColor?.id,
                        }
                      });
                    }}
                  >
                    🎨 Start Creating Magic
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
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;