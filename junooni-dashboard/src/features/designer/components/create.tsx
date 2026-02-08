import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearch, useLocation } from '@tanstack/react-router';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  IconCirclePlus, 
  IconX, 
  IconLink, 
  IconUpload, 
  IconCopy, 
  IconEdit, 
  IconCheck, 
  IconTrash, 
  IconPhotoPlus,
  IconInfoCircle,
  IconTruck,
  IconClock,
  IconExternalLink
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

// Import components from our new modules
import { StreamlinedImageManager } from '../../products/context/product-modules/ImageManager';
import { EnhancedOptionComponent } from '../../products/context/product-modules/OptionComponents';
import { ProductSchema } from '../../products/data/schema';
import { createProduct, uploadProductImage, fetchCategories, batchUpdateInventoryLevels, fetchProduct, submitArtwork, uploadArtworkFile, createArtworkPayload } from '../../products/context/fetchApi';
import HierarchicalCategorySelector from '../../products/context/HierarchicalCategorySelector';

// Import rich text editor component
import { TipTapEditor } from '../../products/context/editor';

// Import types and utilities
import { 
  MediaItem, 
  VariantInfo, 
  ProductFormValues,
  Option,
  Variant,
  OptionValue,
  ProductDetail
} from '../../products/context/product-modules/types';

import { 
  generateUUID,
  generateUniqueSku, 
  generateVariantsFromOptions,
  isColorOption,
  prepareVariantImageMetadata,
  getColorImagesMetadata
} from '../../products/context/product-modules/utils';

// ===== TYPE DEFINITIONS =====
interface PayloadImageSettings {
  color_Images: boolean;
  size_Images: boolean;
  material_Images: boolean;
  style_Images: boolean;
  pattern_Images?: boolean;
  finish_Images?: boolean;
}

interface PayloadProductData {
  id?: string;
  name?: string;
  HSNCode?: string;
  'Manufacturer sku'?: string; // 🔥 ADD THIS LINE
  cost?: number;
  dimensions?: {
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
  };
  materials?: {
    primary?: string;
    secondary?: string[];
  };
  pricing?: {
    suggestedRetail?: number;
    markupValue?: number;
    costBreakdown?: any;
  };
  fulfillmentSettings?: {
    handlingTime?: string;
    shippingTime?: string;
    provider?: string;
  };
  color_Images?: boolean;
  size_Images?: boolean;
  material_Images?: boolean;
  style_Images?: boolean;
  shippingInfo?: {
    weight?: number;
    shippingDimensions?: string;
    shippingLocationID?: string; // This is the correct path
    shippingProfileID?: string;
    packageType?: string;
  };
  payloadConfiguration?: {
    color_Images: boolean;
    size_Images: boolean;
    strategy: string;
    calculation_breakdown: Array<{
      color: string;
      mockupsForColor: number;
      sizesCount: number;
      subtotal: number;
    }>;
  };
  // Care instructions from PayloadCMS
  careInstructions?: Array<{
    id: string;
    instruction: string;
    icon?: string;
  }>;
   // ✅ ADD THESE MISSING FIELDS:
  sizeChartHtml?: string;
  vendorInfo?: {
    supplier?: string;
    supplierProductId?: string;
    countryOrigin?: string;
  };
}

interface ProcessedImage {
  file: File;
  url: string;
  colorValue?: string;
  size: number;
  dimensions?: { width: number; height: number };
  quality: 'high' | 'medium' | 'low';
}

interface SelectedProductInfo {
  color: string;
  colorName: string;
  productId: string;
  productName: string;
}

// Updated PayloadCMSProduct interface to match the actual API response
interface PayloadCMSProduct {
  id: number;
  name: string;
  slug: string;
  status: string;
  'Manufacturer sku': string; // Should already exist, verify it's there
  productType: string;
  brand: string;
  brandSku: string;
  sku: string;
  cost: number;
  
  // Pricing information
  pricing: {
    markupType: string;
    markupValue: number;
    suggestedRetail: number;
  };
  
  // Additional cost information
  additionalCosts?: {
    printingCostPerArea?: number;
    setupFee?: number;
    rushSurcharge?: number;
  };
  
  // Pricing tiers
  pricingTiers?: any[];
  
  // Product description
  description: string | RichTextContent; 
  
  // Features field - Rich text structure
  features?: {
    root?: {
      type: string;
      format: string;
      indent: number;
      version: number;
      children: Array<{
        type: string;
        format?: string;
        indent?: number;
        version?: number;
        children: Array<{
          mode?: string;
          text: string;
          type: string;
          style?: string;
          detail?: number;
          format?: number;
          version?: number;
        }>;
        direction?: string;
        textStyle?: string;
        textFormat?: number;
        tag?: string;
      }>;
      direction: string;
    };
  };
  
  // Materials information
  materials: {
    primary: string;
    weight?: string;
    construction?: string;
    finish?: string;
    efabType?: string;
    fabricWeight?: number;
    surfaceTexture?: string;
    stretchability?: number;
    transparency?: number;
    reflectivity?: number;
  };
  
  // Care instructions
  careInstructions?: Array<{
    id: string;
    instruction: string;
    icon?: string;
  }>;
  
  // Physical dimensions
  physicalDimensions: {
    widthInches: number;
    heightInches: number;
    depthInches: number;
    diameter?: number;
    units: string;
  };
  
  // Shipping information
  shippingInfo: {
    weight: number;
    shippingDimensions: string;
    shippingLocationID?: string;
    shippingProfileID?: string;
    packageType: string;
  };
  
  // Sourcing information
  sourcing?: {
    minOrderQty?: number;
    leadTimeDays?: string;      // Production/handling time
    shipTimeDays?: string; 
    rushAvailable?: boolean;
    rushLeadTimeDays?: number;
  };
  
  // Vendor information
  vendorInfo?: {
    supplier?: string;
    supplierProductId?: string;
    countryOrigin?: string;
  };
  
  // Color options
  colorOptions: Array<{
    id: string;
    colorName: string;
    colorHex: string;
    colorSku: string | null; // 🔥 VERIFY this exists
    isPrimary?: boolean;
    fabricInteraction?: {
      absorptionRate?: number;
      blendMode?: string;
      colorShift?: {
        hueShift: number;
        saturationShift: number;
        lightnessShift: number;
      };
    };
  }>;
  
  // Size options
  sizeOptions: Array<{
    id: string;
    sizeName: string;
    sizeSku: string | null; // 🔥 VERIFY this exists
    ExtraCost?: string;  // ADD THIS - stored as string in PayloadCMS
    sizeDescription?: string;
    dimensions?: {
      width: number;
      height: number;
    };
  }>;
  
  // Image settings
  color_Images: boolean;
  size_Images: boolean;
  
  // Size chart
  sizeChart?: string;
  sizeChartHtml?: string;
  
  // Categories
  categories: Array<{
    id: number;
    title: string;
    slug: string;
    description?: any;
    products?: any[];
    breadcrumbs?: any[];
    parent?: any;
    slugLock?: boolean;
    updatedAt?: string;
    createdAt?: string;
  }>;
  
  // Tags
  tags?: any[];
  
  // Surface configuration
  surfConf?: {
    No_Mockup_Compatible?: boolean;
    renderType?: string;
    surfProp?: {
      wrapAngle?: number;
      curveInten?: number;
      designRatio?: {
        widthRatio?: number;
        heightRatio?: number;
      };
    };
    blendSet?: {
      defaultBlendMode?: string;
      defaultOpacity?: number;
      preserveColors?: boolean;
    };
  };
  
  // Advanced surface mapping
  advanSurfMap?: {
    curvProf?: string;
    barrelDist?: number;
    pincushiDistor?: number;
    perspDis?: number;
    hasSeams?: boolean;
  };
  
  // Seam positions
  seamPositions?: any[];
  
  // Lighting configuration
  lightingConfiguration?: {
    lightDirection?: number;
    lightIntensity?: number;
    ambientLight?: number;
    shadowIntensity?: number;
  };
  
  // Print technologies
  printT?: Array<{
    id: string;
    technologyName: string;
    mockupPhotos?: any[];
    custAreas?: any[];
    areaSynchRules?: any[];
    printingConstraints?: {
      dpiRequirements?: {
        minimum?: number;
        recommended?: number;
        maximum?: number;
      };
      sizeLimits?: {
        minWidthInch?: number;
        minHeightInch?: number;
        maxWidthInch?: number;
        maxHeightInch?: number;
      };
      colorLimits?: {
        maxColors?: number;
        supportsFullColor?: boolean;
      };
      printBleeds?: {
        bleedMargin?: number;
        safetyMargin?: number;
        trimTolerance?: number;
      };
    };
  }>;
  
  // Custom areas
  custAreas?: Array<{
    id: string;
    areaId: string;
    areaName: string;
    areaType: string;
    designCanvasPhotos?: any[];
    canvasDim?: {
      widthInch: number;
      heightInch: number;
      canvasPixWid: number;
      canvasPixHeight: number;
      aspectRatioLocked: boolean;
    };
    restrictions?: {
      minElementSize?: {
        width?: number;
        height?: number;
      };
      maxElements?: number;
    };
  }>;
  
  // Area sync rules
  areaSynchRules?: any[];
  
  // Display images
  displayImages?: Array<{
    id: string;
    image: any;
    title?: string;
    caption?: string;
  }>;
  
  // SEO information
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  
  // Product integration settings
  prodInt?: {
    prodTemp?: string;
    autoDetSett?: {
      enImgAnal?: boolean;
      anAcc?: string;
      detThres?: number;
      manlReq?: boolean;
    };
    srtDef?: {
      intfrmTlt?: boolean;
      oMskRls?: {
        enablesMask?: boolean;
        edgeDetctMode?: string;
        occlDetct?: {
          detectCamHole?: boolean;
          detectSeams?: boolean;
          detectFolds?: boolean;
          detectShadows?: boolean;
        };
      };
    };
  };
  
  // Print techniques
  PrntTch?: any[];
  
  // Timestamps
  updatedAt: string;
  createdAt: string;
}

interface LexicalTextNode {
  type: "text";
  text: string;
  format?: number; // Bit flags for formatting: 1=bold, 2=italic, 4=strikethrough, 8=underline
  style?: string;
  mode?: string;
  detail?: number;
  version?: number;
}

interface LexicalElementNode {
  type: "paragraph" | "heading" | "list" | "listitem" | "linebreak" | "link";
  children?: (LexicalTextNode | LexicalElementNode)[];
  format?: string;
  indent?: number;
  version?: number;
  direction?: string;
  tag?: string; // for headings: h1, h2, h3, etc.
  listType?: "bullet" | "number"; // for lists
  start?: number; // for numbered lists
  url?: string; // for links
  target?: string; // for links
  rel?: string; // for links
}

interface LexicalRootNode {
  type: "root";
  format: string;
  indent: number;
  version: number;
  children: LexicalElementNode[];
  direction: string;
}

interface RichTextContent {
  root: LexicalRootNode;
}

// ===== ENHANCED TYPE DEFINITIONS =====
interface PayloadCMSLocationState {
  payloadProduct?: PayloadCMSProduct;
  designData?: DesignData;
  designImages?: Record<string, string>;
  mockupImages?: Record<string, string>;
  uniqueImages?: Record<string, {
    imageData: string;
    colorName: string;
    mockupTitle: string;
    sizeName?: string;
  }>;
}

interface DesignData {
  productInfo: {
    title: string;
    description: string;
    sku: string;
    brand: string;
  };
  options: {
    title: string;
    optionValues: string[];
  }[];
  designElements: Record<string, any[]>;
  colorDetails: {
    name: string;
    value: string;
  }[];
  printingTechnology: string;
  price: number;
  mockupData?: any;
  layersInfo?: any[];
  canvasConfigs?: Record<string, any>;
  printableAreas?: Record<string, any>;
  selectedProduct?: SelectedProductInfo;
}

// Update the LocationState interface to match actual data structure
interface LocationState {
  designData?: DesignData;
  designImages?: DesignImageItem[];
  mockupImages?: Record<string, string>;
  canvasImages?: Array<{
    area_id: string;
    image_data: string | Promise<string>;
    metadata: {
      area_name: string;
      canvas_dimensions: {
        width_pixels: number;
        height_pixels: number;
        width_inches: number;
        height_inches: number;
      };
      canvas_settings: {
        active_color: string;
        total_elements: number;
        visible_elements: number;
      };
      design_elements: any[];
      printable_area: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    };
    description: string;
  }>;
  uniqueImages?: Record<string, {
    imageData: string;
    colorName: string;
    mockupTitle: string;
    sizeName?: string;
  }>;
  uploadedFiles?: any[];
  selectedProduct?: SelectedProductInfo;
  enhancedProductData?: PayloadProductData;
  skipMockupGeneration?: boolean;
  availableMockups?: {
    all_available_areas: string[];
    all_mockups: Array<{
      mockup_id: string;
      mockup_title: string;
      mockup_photo_url: string;
      view_angle: string;
      mockup_type: string;
    }>;
    areas_with_elements: string[];
    areas_without_elements: string[];
    mockups_by_color: any[];
    selected_colors: any[];
    technology_id: string;
    technology_name: string;
    total_available_mockups: number;
  };
  imageAreaAnalysis?: {
    total_design_area_available: number;
    current_image_area_used: number;
    area_utilization_percentage: number;
    all_available_areas: string[];
    areas_with_elements: string[];
    areas_without_elements: string[];
    areas_breakdown?: any[];
    upload_summary?: any;
  };
  pricingData?: any;
  filteredProductData?: any;
  colorSpecificImages?: Record<string, any[]>;
  storeMetadata?: any;
  navigationContext?: any;
  enhancedImageAreaAnalysis?: {
    area_specifications: Record<string, {
      canvas_width_pixels: number;
      canvas_height_pixels: number;
      canvas_width_inches: number;
      canvas_height_inches: number;
      printable_area: {
        x_pixels: number;
        y_pixels: number;
        width_pixels: number;
        height_pixels: number;
        x_inches: number;
        y_inches: number;
        width_inches: number;
        height_inches: number;
      };
    }>;
    design_complexity: {
      complexity_rating: string;
      total_elements: number;
      complexity_factors: {
        has_rotations: boolean;
        has_scaling: boolean;
        high_utilization: boolean;
        multi_area_design: boolean;
      };
    };
    detailed_element_breakdown: Record<string, Array<{
      element_id: string;
      element_name: string;
      element_type: string;
      area_utilization: {
        design_area_consumed_percentage: number;
        printable_area_consumed_percentage: number;
      };
      physical_dimensions: {
        width_inches: number;
        height_inches: number;
        area_square_inches: number;
        position_x_inches: number;
        position_y_inches: number;
      };
      pixel_dimensions: {
        width_pixels: number;
        height_pixels: number;
        position_x_pixels: number;
        position_y_pixels: number;
      };
      print_quality: {
        dpi: number;
        quality_rating: string;
        is_print_ready: boolean;
      };
      transformations: {
        rotation_degrees: number;
        scale_x: number;
        scale_y: number;
        is_rotated: boolean;
        is_scaled: boolean;
      };
      positioning: {
        is_centered_horizontally: boolean;
        is_centered_vertically: boolean;
        distance_from_edges: {
          top: number;
          bottom: number;
          left: number;
          right: number;
        };
      };
      original_image_info?: {
        original_width_pixels: number;
        original_height_pixels: number;
        original_area_pixels: number;
        original_aspect_ratio: number;
      };
    }>>;
    elements_summary: Record<string, Array<{
      id: string;
      name: string;
      type: string;
      dimensions: {
        width_inches: number;
        height_inches: number;
        width_pixels: number;
        height_pixels: number;
        area_square_inches: number;
      };
      quality: {
        dpi: number;
        rating: string;
        is_print_ready: boolean;
      };
      positioning: {
        is_centered_horizontally: boolean;
        is_centered_vertically: boolean;
        distance_from_edges: {
          top: number;
          bottom: number;
          left: number;
          right: number;
        };
      };
      transformations: {
        rotation_degrees: number;
        scale_x: number;
        scale_y: number;
        is_rotated: boolean;
        is_scaled: boolean;
      };
    }>>;
  };
}

// Add the missing interface
interface DesignImageItem {
  area: string;
  base64Data: string;
  name: string;
  id?: string;
  originalWidth?: number;
  originalHeight?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  position?: {
    x: number;
    y: number;
  };
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  type?: string;
  opacity?: number;
}

interface SearchParams {
  fromDesigner?: string;
  from?: string;
}

interface ImageAssociationSettings {
  color_Images: boolean;
  size_Images: boolean;
  material_Images?: boolean;
  style_Images?: boolean;
}

// NEW: Pre-generated image lookup structure
interface PreGeneratedImageData {
  imageData: string;
  colorName: string;
  mockupTitle: string;
  sizeName?: string;
  key: string;
}
// Paste this AFTER the interfaces but BEFORE the ProductPage component (around line 300-400)
const RichTextRenderer: React.FC<{ content: RichTextContent | string }> = ({ content }) => {
  if (typeof content === 'string') {
    if (content.includes('<') && content.includes('>')) {
      return (
        <div 
          className="space-y-2 text-gray-700 rich-text-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    } else {
      return (
        <div className="space-y-2 text-gray-700 rich-text-content">
          {content.split('\n').map((line, index) => (
            <p key={index} className="text-sm leading-relaxed">
              {line || '\u00A0'}
            </p>
          ))}
        </div>
      );
    }
  }

  if (!content?.root?.children) {
    return <p className="text-sm text-gray-500">No description available.</p>;
  }

  const renderTextNode = (node: LexicalTextNode): JSX.Element => {
    let text = node.text;
    let className = "";
    let style: React.CSSProperties = {};

    if (node.format) {
      const formatFlags = node.format;
      if (formatFlags & 1) className += " font-bold";
      if (formatFlags & 2) className += " italic";
      if (formatFlags & 4) className += " line-through";
      if (formatFlags & 8) className += " underline";
    }

    if (node.style) {
      const styles = node.style.split(';').filter(s => s.trim());
      styles.forEach(styleRule => {
        const [property, value] = styleRule.split(':').map(s => s.trim());
        if (property && value) {
          const camelProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          style[camelProperty as any] = value;
        }
      });
    }

    return (
      <span key={Math.random()} className={className} style={style}>
        {text}
      </span>
    );
  };

  const renderElementNode = (node: LexicalElementNode, index: number): JSX.Element => {
    const children = node.children?.map((child, childIndex) => 
      child.type === "text" 
        ? renderTextNode(child as LexicalTextNode)
        : renderElementNode(child as LexicalElementNode, childIndex)
    ) || [];

    switch (node.type) {
      case "paragraph":
        return (
          <p key={index} className="mb-2 text-sm leading-relaxed">
            {children.length > 0 ? children : '\u00A0'}
          </p>
        );

      case "heading":
        const HeadingTag = (node.tag || 'h2') as keyof JSX.IntrinsicElements;
        const headingClasses = {
          h1: "text-2xl font-bold mb-3 text-gray-900",
          h2: "text-xl font-bold mb-2 text-gray-900", 
          h3: "text-lg font-semibold mb-2 text-gray-900",
          h4: "text-base font-semibold mb-1 text-gray-900",
          h5: "text-sm font-semibold mb-1 text-gray-900",
          h6: "text-xs font-semibold mb-1 text-gray-900"
        };
        return (
          <HeadingTag key={index} className={headingClasses[node.tag as keyof typeof headingClasses] || headingClasses.h2}>
            {children}
          </HeadingTag>
        );

      case "list":
        const ListTag = node.listType === "number" ? "ol" : "ul";
        const listClasses = node.listType === "number" 
          ? "list-decimal list-inside space-y-1 mb-3 ml-4" 
          : "list-disc list-inside space-y-1 mb-3 ml-4";
        return (
          <ListTag key={index} className={listClasses} start={node.start}>
            {children}
          </ListTag>
        );

      case "listitem":
        return (
          <li key={index} className="text-sm leading-relaxed">
            {children}
          </li>
        );

      case "linebreak":
        return <br key={index} />;

      case "link":
        return (
          <a 
            key={index}
            href={node.url}
            target={node.target || "_blank"}
            rel={node.rel || "noopener noreferrer"}
            className="text-[#e65100] hover:text-[#d84315] underline transition-colors duration-200"
          >
            {children}
          </a>
        );

      default:
        return (
          <span key={index}>
            {children}
          </span>
        );
    }
  };

  return (
    <div className="space-y-1 rich-text-content">
      {content.root.children.map((node, index) => renderElementNode(node, index))}
    </div>
  );
};

/**
 * Convert PayloadCMS Lexical rich text to HTML string for TipTapEditor
 */
/**
 * Enhanced conversion for mixed HTML and newline content
 */
const convertLexicalToHtml = (content: RichTextContent | string): string => {
  if (typeof content === 'string') {
    // Split by newlines first, then process each line
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) {
      return '<p></p>';
    }
    
    // Convert each line to a paragraph, preserving any HTML within the line
    return lines.map(line => `<p>${line}</p>`).join('');
  }

  // Lexical JSON processing remains the same...
  if (!content?.root?.children) {
    return '<p></p>';
  }

  const convertTextNode = (node: LexicalTextNode): string => {
    let text = node.text;
    
    if (node.format) {
      const formatFlags = node.format;
      if (formatFlags & 1) text = `<strong>${text}</strong>`;
      if (formatFlags & 2) text = `<em>${text}</em>`;
      if (formatFlags & 4) text = `<s>${text}</s>`;
      if (formatFlags & 8) text = `<u>${text}</u>`;
    }

    if (node.style) {
      text = `<span style="${node.style}">${text}</span>`;
    }

    return text;
  };

  const convertElementNode = (node: LexicalElementNode): string => {
    const children = node.children?.map(child => 
      child.type === "text" 
        ? convertTextNode(child as LexicalTextNode)
        : convertElementNode(child as LexicalElementNode)
    ).join('') || '';

    switch (node.type) {
      case "paragraph":
        return `<p>${children || '<br>'}</p>`;
      case "heading":
        const tag = node.tag || 'h2';
        return `<${tag}>${children}</${tag}>`;
      case "list":
        const listTag = node.listType === "number" ? "ol" : "ul";
        return `<${listTag}${node.start ? ` start="${node.start}"` : ''}>${children}</${listTag}>`;
      case "listitem":
        return `<li>${children}</li>`;
      case "linebreak":
        return '<br>';
      case "link":
        return `<a href="${node.url || '#'}"${node.target ? ` target="${node.target}"` : ''}${node.rel ? ` rel="${node.rel}"` : ''}>${children}</a>`;
      default:
        return children;
    }
  };

  return content.root.children.map(node => convertElementNode(node)).join('');
};

// ===== UTILITY FUNCTIONS =====

/**
 * Enhanced function to check if an option is a size option
 */


// ===== ADD THIS NEW HELPER FUNCTION =====
/**
 * Parse PayloadCMS rich text content to extract plain text
 * 
 * 
 */

// Add this helper function before the onSubmit function (around line 2800)


// Add this function to extract areas from location state
// Replace the extractAvailableAreas function with this corrected version
/**
 * Find a category by ID in the nested category tree
 */
const findCategoryById = (categories: any[], categoryId: string): any => {
  for (const category of categories) {
    if (category.id === categoryId) {
      return category;
    }
    if (category.category_children && category.category_children.length > 0) {
      const found = findCategoryById(category.category_children, categoryId);
      if (found) return found;
    }
  }
  return null;
};

// ADD this helper function to create detailed file descriptions
// CORRECTED createEnhancedFileDescription function
const createEnhancedFileDescription = (
  uploadedFile: any,
  enhancedImageAreaAnalysis: any,
  globalIndex: number
): string => {
  const area = uploadedFile.designArea;
  const fileType = uploadedFile.fileType;
  
  if (fileType === 'canvas_layout') {
    // For canvas layout files
    const areaSpec = enhancedImageAreaAnalysis?.area_specifications?.[area];
    const elementsInArea = enhancedImageAreaAnalysis?.detailed_element_breakdown?.[area] || [];
    const complexity = enhancedImageAreaAnalysis?.design_complexity;
    
    return `MANUFACTURING LAYOUT - ${area.toUpperCase()} AREA

CANVAS SPECIFICATIONS:
- Canvas: ${areaSpec?.canvas_width_pixels || 0} x ${areaSpec?.canvas_height_pixels || 0} pixels (${areaSpec?.canvas_width_inches || 0}" x ${areaSpec?.canvas_height_inches || 0}")
- Printable Area: ${areaSpec?.printable_area?.width_pixels || 0} x ${areaSpec?.printable_area?.height_pixels || 0} pixels (${areaSpec?.printable_area?.width_inches || 0}" x ${areaSpec?.printable_area?.height_inches || 0}")
- Printable Position: (${areaSpec?.printable_area?.x_pixels || 0}, ${areaSpec?.printable_area?.y_pixels || 0}) pixels

DESIGN ELEMENTS (${elementsInArea.length} total):
${elementsInArea.map((element, idx) => `
${idx + 1}. ${element.element_type.toUpperCase()} - ${element.element_name}
   • ID: ${element.element_id}
   • Dimensions: ${element.physical_dimensions?.width_inches?.toFixed(3) || 0}" x ${element.physical_dimensions?.height_inches?.toFixed(3) || 0}" (${element.physical_dimensions?.area_square_inches?.toFixed(2) || 0} sq in)
   • Position: (${element.physical_dimensions?.position_x_inches?.toFixed(3) || 0}", ${element.physical_dimensions?.position_y_inches?.toFixed(3) || 0}")
   • Print Quality: ${element.print_quality?.quality_rating || 'Unknown'} (${element.print_quality?.dpi || 0} DPI)
   • Area Usage: ${element.area_utilization?.printable_area_consumed_percentage?.toFixed(1) || 0}% of printable area
   • Transformations: ${element.transformations?.is_rotated ? `Rotated ${element.transformations.rotation_degrees?.toFixed(1) || 0}°` : 'No rotation'}${element.transformations?.is_scaled ? `, Scaled ${element.transformations.scale_x || 1}x` : ''}
   • Positioning: ${element.positioning?.is_centered_horizontally ? 'H-Centered' : 'Left-aligned'}, ${element.positioning?.is_centered_vertically ? 'V-Centered' : 'Top-aligned'}
`).join('')}

COMPLEXITY ANALYSIS:
- Overall Rating: ${complexity?.complexity_rating || 'Unknown'}
- Total Elements: ${complexity?.total_elements || 0}
- Has Rotations: ${complexity?.complexity_factors?.has_rotations ? 'Yes' : 'No'}
- Has Scaling: ${complexity?.complexity_factors?.has_scaling ? 'Yes' : 'No'}
- Multi-Area Design: ${complexity?.complexity_factors?.multi_area_design ? 'Yes' : 'No'}

MANUFACTURING NOTES:
- Layout ready for production setup
- All measurements verified for print accuracy
- Element positioning optimized for print area
- Generated: ${new Date().toISOString()}`;
  } else {
    // For design element files
    const elementDetails = enhancedImageAreaAnalysis?.detailed_element_breakdown?.[area]?.find(
      el => el.element_name === uploadedFile.originalMetadata?.originalFileName ||
           el.element_id === uploadedFile.originalMetadata?.elementId
    );
    
    if (elementDetails) {
      return `DESIGN ELEMENT - ${area.toUpperCase()} AREA

ELEMENT DETAILS:
- Name: ${elementDetails.element_name}
- Type: ${elementDetails.element_type.toUpperCase()}
- ID: ${elementDetails.element_id}

PHYSICAL SPECIFICATIONS:
- Dimensions: ${elementDetails.physical_dimensions?.width_inches?.toFixed(3) || 0}" x ${elementDetails.physical_dimensions?.height_inches?.toFixed(3) || 0}"
- Area: ${elementDetails.physical_dimensions?.area_square_inches?.toFixed(2) || 0} square inches
- Position: (${elementDetails.physical_dimensions?.position_x_inches?.toFixed(3) || 0}", ${elementDetails.physical_dimensions?.position_y_inches?.toFixed(3) || 0}")

PIXEL SPECIFICATIONS:
- Dimensions: ${elementDetails.pixel_dimensions?.width_pixels || 0} x ${elementDetails.pixel_dimensions?.height_pixels || 0} pixels
- Position: (${elementDetails.pixel_dimensions?.position_x_pixels || 0}, ${elementDetails.pixel_dimensions?.position_y_pixels || 0}) pixels

PRINT QUALITY:
- Resolution: ${elementDetails.print_quality?.dpi || 0} DPI
- Quality Rating: ${elementDetails.print_quality?.quality_rating || 'Unknown'}
- Print Ready: ${elementDetails.print_quality?.is_print_ready ? 'Yes' : 'No'}

TRANSFORMATIONS:
- Rotation: ${elementDetails.transformations?.rotation_degrees?.toFixed(1) || 0}° ${elementDetails.transformations?.is_rotated ? '(Rotated)' : '(No rotation)'}
- Scale: ${elementDetails.transformations?.scale_x || 1}x, ${elementDetails.transformations?.scale_y || 1}x ${elementDetails.transformations?.is_scaled ? '(Scaled)' : '(Original size)'}

POSITIONING:
- Horizontal: ${elementDetails.positioning?.is_centered_horizontally ? 'Centered' : 'Left-aligned'}
- Vertical: ${elementDetails.positioning?.is_centered_vertically ? 'Centered' : 'Top-aligned'}
- Edge Distances: Top ${elementDetails.positioning?.distance_from_edges?.top || 0}px, Right ${elementDetails.positioning?.distance_from_edges?.right || 0}px, Bottom ${elementDetails.positioning?.distance_from_edges?.bottom || 0}px, Left ${elementDetails.positioning?.distance_from_edges?.left || 0}px

AREA UTILIZATION:
- Printable Area Used: ${elementDetails.area_utilization?.printable_area_consumed_percentage?.toFixed(1) || 0}%
- Design Area Used: ${elementDetails.area_utilization?.design_area_consumed_percentage?.toFixed(1) || 0}%

ORIGINAL IMAGE INFO:${elementDetails.original_image_info ? `
- Original Dimensions: ${elementDetails.original_image_info.original_width_pixels} x ${elementDetails.original_image_info.original_height_pixels} pixels
- Original Area: ${elementDetails.original_image_info.original_area_pixels} pixels
- Aspect Ratio: ${elementDetails.original_image_info.original_aspect_ratio?.toFixed(3) || 0}` : `
- No original image data available`}

Generated: ${new Date().toISOString()}`;
    } else {
      // Fallback for elements without detailed breakdown
      return `${uploadedFile.designArea} design element ${uploadedFile.areaIndex + 1} - ${uploadedFile.originalMetadata?.originalFileName || 'Unknown file'}`;
    }
  }
};


const extractAvailableAreas = (locationState: LocationState): string[] => {
  const areas = new Set<string>();
  
  // Method 1: PRIORITY - Extract ONLY from areas that have design elements
  if (locationState.designData?.designElements) {
    Object.keys(locationState.designData.designElements).forEach(area => {
      const elements = locationState.designData.designElements[area];
      // Only add if the area actually has elements
      if (Array.isArray(elements) && elements.length > 0) {
        areas.add(area.toLowerCase());
      }
    });
    
    if (areas.size > 0) {
      //console.log('✅ Found areas WITH design elements:', Array.from(areas));
      return Array.from(areas);
    }
  }
  
  // Method 2: Extract from enhancedImageAreaAnalysis ONLY for areas with elements
  if (locationState.enhancedImageAreaAnalysis?.areas_with_elements) {
    locationState.enhancedImageAreaAnalysis.areas_with_elements.forEach(area => {
      areas.add(area.toLowerCase());
    });
    
    if (areas.size > 0) {
      //console.log('✅ Found areas from enhancedImageAreaAnalysis.areas_with_elements:', Array.from(areas));
      return Array.from(areas);
    }
  }
  
  // Method 3: Extract from canvasImages area_id (these have actual design data)
  if (locationState.canvasImages && Array.isArray(locationState.canvasImages)) {
    locationState.canvasImages.forEach(canvasImage => {
      if (canvasImage.area_id) {
        areas.add(canvasImage.area_id.toLowerCase());
      }
    });
    
    if (areas.size > 0) {
      //console.log('✅ Found areas from canvasImages:', Array.from(areas));
      return Array.from(areas);
    }
  }
  
  // Method 4: Extract from imageAreaAnalysis.areas_with_elements (fallback)
  if (locationState.imageAreaAnalysis?.areas_with_elements && 
      Array.isArray(locationState.imageAreaAnalysis.areas_with_elements)) {
    locationState.imageAreaAnalysis.areas_with_elements.forEach(area => {
      areas.add(area.toLowerCase());
    });
    
    if (areas.size > 0) {
      //console.log('✅ Found areas from imageAreaAnalysis.areas_with_elements:', Array.from(areas));
      return Array.from(areas);
    }
  }
  
  const finalAreas = Array.from(areas);
  //console.log('🎯 Final extracted areas WITH elements:', finalAreas);
  
  return finalAreas.length > 0 ? finalAreas : ['front']; // fallback only if nothing found
};

const parsePayloadRichText = (richTextObject: any): string[] => {
  if (!richTextObject || typeof richTextObject !== 'object') {
    return [];
  }

  const extractTextFromChildren = (children: any[]): string[] => {
    const texts: string[] = [];
    
    if (!Array.isArray(children)) return texts;
    
    children.forEach(child => {
      if (child.type === 'text' && child.text && child.text.trim()) {
        texts.push(child.text.trim());
      } else if (child.children && Array.isArray(child.children)) {
        // Recursively extract from nested children
        const nestedTexts = extractTextFromChildren(child.children);
        texts.push(...nestedTexts);
      }
    });
    
    return texts;
  };

  // Handle PayloadCMS rich text structure
  if (richTextObject.root && richTextObject.root.children) {
    return extractTextFromChildren(richTextObject.root.children);
  }
  
  // Handle direct children array
  if (richTextObject.children && Array.isArray(richTextObject.children)) {
    return extractTextFromChildren(richTextObject.children);
  }
  
  return [];
};

const createColorMatcher = (designData: DesignData) => {
  const availableColors = new Map<string, { name: string; hex?: string }>();
  
  // Get colors from colorDetails (primary source)
  if (designData.colorDetails && Array.isArray(designData.colorDetails)) {
    designData.colorDetails.forEach(color => {
      if (color.name) {
        availableColors.set(color.name.toLowerCase(), {
          name: color.name,
          hex: color.value
        });
      }
    });
  }
  
  // Get colors from options (fallback)
  if (designData.options && Array.isArray(designData.options)) {
    const colorOption = designData.options.find(opt => 
      opt.title && opt.title.toLowerCase().includes('color')
    );
    
    if (colorOption?.optionValues) {
      colorOption.optionValues.forEach(colorValue => {
        const key = colorValue.toLowerCase();
        if (!availableColors.has(key)) {
          availableColors.set(key, { name: colorValue });
        }
      });
    }
  }
  
  return {
    availableColors,
    
    matchColor: (variantKey: string): string => {
  const keyLower = variantKey.toLowerCase();
  const keyParts = variantKey.split(/[-_\s]+/).filter(p => p.length > 0);
  
  // Strategy 1: Exact match in full key
  if (availableColors.has(keyLower)) {
    const matched = availableColors.get(keyLower)!;
    return matched.name;
  }
  
  // Strategy 2: Match multi-word colors (e.g., "Sky Blue")
  for (const [colorKey, colorData] of availableColors) {
    if (keyLower.includes(colorKey.replace(/\s+/g, ''))) {
      return colorData.name;
    }
    
    const colorWords = colorKey.split(/\s+/);
    const allWordsPresent = colorWords.every(word => 
      keyParts.some(part => part.toLowerCase() === word)
    );
    
    if (allWordsPresent && colorWords.length > 1) {
      return colorData.name;
    }
  }
  
  // Strategy 3: Exact match in parts
  for (const part of keyParts) {
    const partLower = part.toLowerCase();
    if (availableColors.has(partLower)) {
      const matched = availableColors.get(partLower)!;
      return matched.name;
    }
  }
  
  // Strategy 4: Substring match
  for (const [colorKey, colorData] of availableColors) {
    if (keyLower.includes(colorKey)) {
      return colorData.name;
    }
  }
  
  // ✅ FIX: Return 'Unknown' instead of first color
  return 'Unknown';
},
    
    getAllColorNames: (): string[] => {
      return Array.from(availableColors.values()).map(c => c.name);
    },
    
    getHexForColor: (colorName: string): string | undefined => {
      const colorKey = colorName.toLowerCase();
      return availableColors.get(colorKey)?.hex;
    }
  };
};

// Add this function INSIDE the ProductPage component with your other helper functions
// const renderProductDescription = () => {
//   if (!product?.description) return null;

//   return (
//     <div className="p-3 mb-4 rounded-lg bg-gray-50">
//       <h4 className="mb-3 text-sm font-semibold text-gray-900">Product Description</h4>
//       <RichTextRenderer content={product.description} />
//     </div>
//   );
// };

const createCommonColorPatterns = (availableColors: Map<string, { name: string; hex?: string }>): Map<string, string> => {
  const patterns = new Map<string, string>();
  
  for (const [colorKey, colorData] of availableColors) {
    const colorName = colorData.name;
    const colorLower = colorKey;
    
    // Add common abbreviations and variations
    if (colorLower.includes('black') || colorLower === 'blk') {
      patterns.set('blk', colorName);
      patterns.set('black', colorName);
    }
    
    if (colorLower.includes('white') || colorLower === 'wht') {
      patterns.set('wht', colorName);
      patterns.set('white', colorName);
    }
    
    if (colorLower.includes('red') || colorLower === 'rd') {
      patterns.set('rd', colorName);
      patterns.set('red', colorName);
    }
    
    if (colorLower.includes('blue') || colorLower === 'bl' || colorLower === 'blu') {
      patterns.set('bl', colorName);
      patterns.set('blu', colorName);
      patterns.set('blue', colorName);
    }
    
    if (colorLower.includes('green') || colorLower === 'grn') {
      patterns.set('grn', colorName);
      patterns.set('green', colorName);
    }
    
    if (colorLower.includes('yellow') || colorLower === 'yel') {
      patterns.set('yel', colorName);
      patterns.set('yellow', colorName);
    }
    
    if (colorLower.includes('purple') || colorLower === 'pur') {
      patterns.set('pur', colorName);
      patterns.set('purple', colorName);
    }
    
    if (colorLower.includes('orange') || colorLower === 'org') {
      patterns.set('org', colorName);
      patterns.set('orange', colorName);
    }
    
    if (colorLower.includes('pink') || colorLower === 'pnk') {
      patterns.set('pnk', colorName);
      patterns.set('pink', colorName);
    }
    
    if (colorLower.includes('brown') || colorLower === 'brn') {
      patterns.set('brn', colorName);
      patterns.set('brown', colorName);
    }
    
    if (colorLower.includes('gray') || colorLower.includes('grey') || colorLower === 'gry') {
      patterns.set('gry', colorName);
      patterns.set('gray', colorName);
      patterns.set('grey', colorName);
    }
    
    // Add first 3 characters as abbreviation
    if (colorLower.length >= 3) {
      patterns.set(colorLower.substring(0, 3), colorName);
    }
    
    // Add full color name
    patterns.set(colorLower, colorName);
  }
  
  return patterns;
};

const isSizeOption = (optionTitle: string): boolean => {
  const sizeKeywords = [
    'size', 'sizes', 'dimension', 'dimensions', 
    'length', 'width', 'height', 'diameter',
    'small', 'medium', 'large', 'xl', 'xxl',
    's', 'm', 'l', 'xs'
  ];
  
  return sizeKeywords.some(keyword => 
    optionTitle.toLowerCase().includes(keyword)
  );
};

/**
 * Enhanced function to check if an option is a material option
 */
const isMaterialOption = (optionTitle: string): boolean => {
  const materialKeywords = [
    'material', 'materials', 'fabric', 'fabrics',
    'cotton', 'polyester', 'silk', 'wool', 'leather',
    'metal', 'plastic', 'wood', 'bamboo', 'glass'
  ];
  
  return materialKeywords.some(keyword => 
    optionTitle.toLowerCase().includes(keyword)
  );
};

/**
 * Enhanced function to check if an option is a style option
 */
const isStyleOption = (optionTitle: string): boolean => {
  const styleKeywords = [
    'style', 'styles', 'design', 'designs', 'pattern', 'patterns',
    'finish', 'finishes', 'type', 'types', 'variant', 'variants',
    'model', 'models', 'edition', 'editions'
  ];
  
  return styleKeywords.some(keyword => 
    optionTitle.toLowerCase().includes(keyword)
  );
};

/**
 * Determines if an option should have image association based on PayloadCMS settings
 */
const getImageAssociationForOption = (
  optionTitle: string, 
  settings: PayloadImageSettings
): boolean => {
  if (!optionTitle) return false;
  
  const normalizedTitle = optionTitle.toLowerCase().trim();
  
  // Color options
  if (isColorOption(optionTitle)) {
    const result = settings.color_Images;
    return result;
  }
  
  // Size options
  if (isSizeOption(normalizedTitle)) {
    const result = settings.size_Images;
    return result;
  }
  
  // Material options
  if (isMaterialOption(normalizedTitle)) {
    const result = settings.material_Images || false;
    return result;
  }
  
  // Style options
  if (isStyleOption(normalizedTitle)) {
    const result = settings.style_Images || false;

    return result;
  }
  return false;
};

/**
 * Generic function to check if an option should have images based on PayloadCMS settings
 */
const shouldOptionHaveImages = (
  optionTitle: string, 
  imageAssociationSettings: PayloadImageSettings
): boolean => {
  return getImageAssociationForOption(optionTitle, imageAssociationSettings);
};

// ✅ ADD THIS NEW FUNCTION HERE:
/**
 * Extract actual shipping/handling times from PayloadCMS only
 */
const extractFulfillmentTimesFromPayload = (payloadProduct: PayloadCMSProduct): {
  shippingTime: string | null;
  handlingTime: string | null;
  rushAvailable: boolean;
  rushTime: string | null;
} => {
  let shippingTime: string | null = null;
  let handlingTime: string | null = null;
  let rushAvailable = false;
  let rushTime: string | null = null;

  // 🔍 DEBUG: Log the raw data
  //console.log('🚀 PayloadCMS sourcing data:', payloadProduct.sourcing);

  // ✅ Extract HANDLING time from leadTimeDays (production time)
  if (payloadProduct.sourcing?.leadTimeDays) {
    handlingTime = `${payloadProduct.sourcing.leadTimeDays} business days`;
    //console.log('✅ Set handlingTime:', handlingTime);
  } else {
    //console.log('⚠️ No leadTimeDays found');
  }

  // ✅ Extract SHIPPING time from shipTimeDays (delivery time)
  if (payloadProduct.sourcing?.shipTimeDays) {
    shippingTime = `${payloadProduct.sourcing.shipTimeDays} business days`;
    //console.log('✅ Set shippingTime:', shippingTime);
  } else {
    //console.log('⚠️ No shipTimeDays found');
  }

  // Extract rush shipping if available
  if (payloadProduct.sourcing?.rushAvailable && payloadProduct.sourcing?.rushLeadTimeDays) {
    rushAvailable = true;
    rushTime = `${payloadProduct.sourcing.rushLeadTimeDays} business days`;
    //console.log('✅ Rush available:', rushTime);
  }

  // 🔍 DEBUG: Log final result
  //console.log('🎯 Final fulfillment data:', { shippingTime, handlingTime, rushAvailable, rushTime });

  return { shippingTime, handlingTime, rushAvailable, rushTime };
};

// Move this near other utility functions (around line 400-500)
const removeDuplicateDesignImages = (designImages: MediaItem[]): MediaItem[] => {
  //console.log('🔍 Starting deduplication with', designImages.length, 'images');
  
  const uniqueImages = [];
  const seenHashes = new Set();
  
  for (let i = 0; i < designImages.length; i++) {
    const image = designImages[i];
    
    // Create hash based on file content (ignore timestamps and random IDs)
    let contentHash = 'no-file';
    if (image.file) {
      const namePattern = image.file.name.replace(/[-_]\d+[-_]/g, '-X-'); // Remove timestamps
      contentHash = `${image.file.size}-${image.file.type}-${namePattern}`;
    }
    
    // Use original filename and area only
    const designContext = `${image.metadata?.designArea || 'unknown'}-${image.metadata?.originalFileName || 'unnamed'}`;
    const hash = `${contentHash}-${designContext}`;
    
    if (!seenHashes.has(hash)) {
      seenHashes.add(hash);
      uniqueImages.push(image);
      //console.log('✅ UNIQUE - Keeping image:', image.file?.name || 'unnamed');
    } else {
      //console.log('🚫 DUPLICATE - Removing image:', image.file?.name || 'unnamed');
      if (image.url?.startsWith('blob:')) {
        URL.revokeObjectURL(image.url);
      }
    }
  }
  
  //console.log('🎯 Deduplication result:', uniqueImages.length, 'unique images');
  return uniqueImages;
};
/**
 * Process base64 image data to File object
 */
const processBase64ToFile = async (
  base64Data: string, 
  fileName: string, 
  colorName?: string
): Promise<ProcessedImage | null> => {
  try {
    
    if (!base64Data) {
      throw new Error('Base64 data is empty');
    }
    
    if (!base64Data.startsWith('data:image/')) {
      throw new Error('Invalid data URL format - must start with data:image/');
    }
    
    if (!base64Data.includes('base64,')) {
      throw new Error('Invalid data URL format - missing base64 marker');
    }
    
    const [header, base64Content] = base64Data.split('base64,');
    
    if (!header || !base64Content) {
      throw new Error('Failed to split base64 data URL');
    }
    
    const mimeType = header.split(':')[1]?.split(';')[0];
    
    if (!mimeType || !mimeType.startsWith('image/')) {
      throw new Error(`Invalid MIME type: ${mimeType}`);
    }
    
    if (base64Content.length < 100) {
      throw new Error(`Base64 content too short: ${base64Content.length} characters`);
    }
    
    let binaryString: string;
    try {
      binaryString = atob(base64Content);
    } catch (atobError) {
      throw new Error(`Failed to decode base64: ${atobError.message}`);
    }
    
    if (binaryString.length < 100) {
      throw new Error(`Decoded binary too short: ${binaryString.length} bytes`);
    }
    
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: mimeType });
    
    if (blob.size < 1000) {
      throw new Error(`Generated blob too small: ${blob.size} bytes`);
    }
    
    const cleanFileName = fileName.replace(/[^a-z0-9.-]/gi, '_');
    const file = new File([blob], cleanFileName, { 
      type: mimeType,
      lastModified: Date.now()
    });
    
    
    const objectUrl = URL.createObjectURL(file);
    let dimensions: { width: number; height: number };
    
    try {
      dimensions = await validateImageDimensions(objectUrl);
    } catch (validationError) {
      URL.revokeObjectURL(objectUrl);
      throw new Error(`Image validation failed: ${validationError.message}`);
    }
    
    const result: ProcessedImage = {
      file,
      url: objectUrl,
      colorValue: colorName,
      size: file.size,
      dimensions,
      quality: file.size > 100000 ? 'high' : file.size > 50000 ? 'medium' : 'low'
    };
    
    return result;
    
  } catch (error) {
    return null;
  }
};

/**
 * Validate image dimensions
 */
const validateImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    const timeout = setTimeout(() => {
      reject(new Error('Image validation timeout (10s)'));
    }, 10000);
    
    img.onload = () => {
      clearTimeout(timeout);
      
      if (img.width < 10 || img.height < 10) {
        reject(new Error(`Invalid image dimensions: ${img.width}x${img.height}`));
        return;
      }
      
      if (img.width > 10000 || img.height > 10000) {
        reject(new Error(`Image too large: ${img.width}x${img.height}`));
        return;
      }
      
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to load image for dimension validation'));
    };
    
    img.src = url;
  });
};

// ===== SUCCESS NOTIFICATION COMPONENT =====
const DesignImportSuccessNotification: React.FC<{
  designData: DesignData | null;
  enhancedProductData?: PayloadProductData;
  onDismiss: () => void;
}> = ({ designData, enhancedProductData, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, [onDismiss]);
  
  if (!isVisible || !designData) return null;
  
  const layersCount = designData.layersInfo?.length || 0;
  const elementsCount = Object.values(designData.designElements || {}).flat().length;
  const hasGoodQuality = designData.layersInfo?.every(layer => 
    layer.printQuality === 'Good' || layer.printQuality === 'Excellent'
  );
  const avgDPI = designData.layersInfo?.length > 0 
    ? Math.round(designData.layersInfo.reduce((acc, layer) => acc + layer.dpi, 0) / designData.layersInfo.length)
    : 0;
  
  return (
    <div className={`fixed top-4 right-4 max-w-md bg-white border border-green-200 rounded-lg shadow-lg z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
    </div>
  );
};

// Default location ID for inventory management
//const defaultLocationId = "sloc_01JKWDDGKGCQFJANXV0CVJN2QW";

// ===== MAIN CREATE COMPONENT =====
const Create: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useSearch({
    from: undefined as any,
  }) as SearchParams;
  
  // ===== COMPONENT INITIALIZATION LOG =====
  
  // Designer data state
  const [designData, setDesignData] = useState<DesignData | null>(null);
  const [importedDesignImages, setImportedDesignImages] = useState<Record<string, string>>({});
  const [importedMockupImages, setImportedMockupImages] = useState<Record<string, string>>({});
  const [importedFiles, setImportedFiles] = useState<any[]>([]);
  const [showImportNotification, setShowImportNotification] = useState(false);
  const [enhancedProductData, setEnhancedProductData] = useState<PayloadProductData | null>(null);
  // Add this state variable with your other state declarations
  const [dynamicLocationId, setDynamicLocationId] = useState<string>('');
  // near other hooks at component top
const didPopulateRef = useRef(false);
// Canvas pricing and mockup data
  const [canvasPricingData, setCanvasPricingData] = useState<any>(null);
  const [canvasMockupData, setCanvasMockupData] = useState<any>(null);
  const [imageAreaAnalysis, setImageAreaAnalysis] = useState<any>(null);
  // Add this state variable with your other state declarations
const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  // Add these with your other state declarations
const [isProcessingDesignImages, setIsProcessingDesignImages] = useState<boolean>(false);
const [hasProcessedInitialData, setHasProcessedInitialData] = useState<boolean>(false);
const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
// ✅ ADD: New state for PayloadCMS fulfillment data
const [payloadFulfillmentData, setPayloadFulfillmentData] = useState<{
  shippingTime: string | null;
  handlingTime: string | null;
  rushAvailable: boolean;
  rushTime: string | null;
  hasData: boolean;
}>({
  shippingTime: null,
  handlingTime: null,
  rushAvailable: false,
  rushTime: null,
  hasData: false
});
// Add with your other state declarations
const [importedCanvasImages, setImportedCanvasImages] = useState<Array<{
  area_id: string;
  image_data: string;
  metadata: any;
  description: string;
}>>([]);

  // ===== NEW: PRE-GENERATED IMAGE MANAGEMENT STATE =====
  const [preGeneratedMockupImages, setPreGeneratedMockupImages] = useState<Record<string, string>>({});
  const [skipMockupGeneration, setSkipMockupGeneration] = useState<boolean>(false);
  const [imageReuseStats, setImageReuseStats] = useState({
    totalReceived: 0,
    reused: 0,
    regenerated: 0
  });

  // Main state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImageTab, setActiveImageTab] = useState<string>("upload");
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [payloadProduct, setPayloadProduct] = useState<PayloadCMSProduct | null>(null);
  
  // State for storing categories from API
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // For managing the new option value being added for each option
  const [newOptionValues, setNewOptionValues] = useState<Record<number, string>>({});
  
  // For images, we store objects with a file (if newly added) and URL and rank.
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  
  // Store uploaded image data (id to url mapping)
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});

  // For bulk editing variants
  const [bulkEditMode, setBulkEditMode] = useState<boolean>(false);
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkStock, setBulkStock] = useState<string>("");
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  // Ref for the hidden file input for drag-and-drop.
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for variant toggle
  const [hasVariants, setHasVariants] = useState<boolean>(false);
  const [payloadImageSettings, setPayloadImageSettings] = useState<ImageAssociationSettings>({
    color_Images: false,
    size_Images: false,
    material_Images: false,
    style_Images: false
  });
  
  // Initialize the form with default values based on the schema
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    shouldFocusError: false,
    mode: 'onSubmit', 
    defaultValues: {
      title: '',
      subtitle: '',
      handle: '',
      description: '',
      status: 'proposed',
      thumbnail: '',
      discountable: true,
      category_id: [],
      options: [
        {
          id: generateUUID(),
          title: 'Size',
          optionValues: [],
          colorHexValues: {},
          imageAssociation: false
        }
      ],
      variants: [],
      defaultVariantPrice: 0,
      defaultVariantSku: generateUniqueSku('default'),
      defaultVariantStock: 0,
      weight: '',
      length: '',
      width: '',
      height: '',
      material: '',
      origin_country: '',
      // Fields for metadata
      productDetails: [{ id: generateUUID(), text: '' }],
      storyBehindDesign: '',
      locationId: '',
    
      // Default shipping fields
      // shippingDays: '7-10',
      // handlingTime: '2-3',
    },
  });

  // Field arrays for options and variants.
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
    update: updateOption,
  } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const {
    fields: variantFields,
    replace: replaceVariants,
    remove: removeVariant,
    update: updateVariant,
  } = useFieldArray({
    control: form.control,
    name: 'variants',
  });
  
  // Field array for product details (bullet points)
  const {
    fields: productDetailFields,
    append: appendProductDetail,
    remove: removeProductDetail,
  } = useFieldArray({
    control: form.control,
    name: 'productDetails',
  });

  // ===== NEW: PRE-GENERATED IMAGE LOOKUP FUNCTION =====
  const getPreGeneratedImage = useCallback((mockupTitle: string, colorName: string, sizeName?: string): string | null => {
    if (Object.keys(preGeneratedMockupImages).length === 0) {
      return null;
    }
    
    // Create multiple possible keys to check
    const possibleKeys = [
      // Exact matches
      `${mockupTitle}_${colorName}${sizeName ? `_${sizeName}` : ''}`,
      `${mockupTitle}-${colorName}${sizeName ? `-${sizeName}` : ''}`,
      `${mockupTitle.toLowerCase()}_${colorName.toLowerCase()}${sizeName ? `_${sizeName.toLowerCase()}` : ''}`,
      `${mockupTitle.toLowerCase()}-${colorName.toLowerCase()}${sizeName ? `-${sizeName.toLowerCase()}` : ''}`,
      
      // Without size (for shared images)
      `${mockupTitle}_${colorName}`,
      `${mockupTitle}-${colorName}`,
      `${mockupTitle.toLowerCase()}_${colorName.toLowerCase()}`,
      `${mockupTitle.toLowerCase()}-${colorName.toLowerCase()}`,
      
      // Partial matches
      colorName,
      colorName.toLowerCase(),
    ];
    
    // Try each possible key
    for (const key of possibleKeys) {
      if (preGeneratedMockupImages[key]) {
        setImageReuseStats(prev => ({ ...prev, reused: prev.reused + 1 }));
        return preGeneratedMockupImages[key];
      }
    }
    
    // Check for partial key matches
    for (const [existingKey, imageData] of Object.entries(preGeneratedMockupImages)) {
      // Check if the existing key contains our search terms
      const keyLower = existingKey.toLowerCase();
      const mockupLower = mockupTitle.toLowerCase();
      const colorLower = colorName.toLowerCase();
      const sizeLower = sizeName?.toLowerCase();
      
      if (keyLower.includes(mockupLower) && keyLower.includes(colorLower)) {
        if (!sizeName || keyLower.includes(sizeLower!)) {
          setImageReuseStats(prev => ({ ...prev, reused: prev.reused + 1 }));
          return imageData;
        }
      }
    }
    
    setImageReuseStats(prev => ({ ...prev, regenerated: prev.regenerated + 1 }));
    return null;
  }, [preGeneratedMockupImages]);

  

  // ===== NEW: EXTRACT AND STORE PRE-GENERATED IMAGES =====
  const extractAndStorePreGeneratedImages = useCallback((locationState: LocationState) => {
    
    const extractedImages: Record<string, string> = {};
    let totalImages = 0;
    
    // Extract from mockupImages (legacy format)
    if (locationState.mockupImages) {
      
      Object.entries(locationState.mockupImages).forEach(([key, imageData]) => {
        if (imageData && typeof imageData === 'string' && imageData.startsWith('data:image/')) {
          extractedImages[key] = imageData;
          totalImages++;
        }
      });
    }
    
    // Extract from uniqueImages (enhanced format)
    if (locationState.uniqueImages) {
      
      Object.entries(locationState.uniqueImages).forEach(([key, imageInfo]) => {
        if (imageInfo?.imageData && imageInfo.imageData.startsWith('data:image/')) {
          // Create multiple key variations for better lookup
          const baseKey = key;
          const colorSizeKey = `${imageInfo.mockupTitle}_${imageInfo.colorName}${imageInfo.sizeName ? `_${imageInfo.sizeName}` : ''}`;
          const colorOnlyKey = `${imageInfo.mockupTitle}_${imageInfo.colorName}`;
          
          extractedImages[baseKey] = imageInfo.imageData;
          extractedImages[colorSizeKey] = imageInfo.imageData;
          extractedImages[colorOnlyKey] = imageInfo.imageData;
          
          totalImages++;
        }
      });
    }
    
    if (totalImages > 0) {
      setPreGeneratedMockupImages(extractedImages);
      setSkipMockupGeneration(true);
      setImageReuseStats({
        totalReceived: totalImages,
        reused: 0,
        regenerated: 0
      });
      
    } else {
      setSkipMockupGeneration(false);
    }
    
    return totalImages > 0;
  }, []);

  // ===== ENHANCED DESIGNER DATA HANDLING =====
  // Replace your existing useEffect with this corrected version
useEffect(() => {
  let isProcessing = false; // Add this line
  const processLocationState = async () => {
    
    if (location.state) {
      isProcessing = true; // Add this line
      const locationState = location.state as LocationState;
      // console.log("Location state", locationState);
      
      // STEP 1: Extract and store pre-generated images FIRST
      const hasPreGeneratedImages = extractAndStorePreGeneratedImages(locationState);
      
      // STEP 2: Check for skipMockupGeneration flag
      if (locationState.skipMockupGeneration !== undefined) {
        setSkipMockupGeneration(locationState.skipMockupGeneration);
      }
      
      // STEP 3A: Process designImages array (new format) - PROPERLY AWAITED
      // STEP 3: FIXED - Process design images ONLY ONCE
      let designImagesProcessed = false;

      // Option A: Process designImages array (new format) - HIGHEST PRIORITY
      if (locationState.designImages && Array.isArray(locationState.designImages) && locationState.designImages.length > 0) {
        await processDesignImagesArray(locationState.designImages);
        designImagesProcessed = true;
      }
       if (locationState.canvasImages && Array.isArray(locationState.canvasImages)) {
        //console.log('📸 Found', locationState.canvasImages.length, 'canvas images');
        setImportedCanvasImages(locationState.canvasImages);
      }
      // Option B: Process design elements (legacy format) - ONLY if new format not found
      else if (locationState.designData?.designElements && !designImagesProcessed) {
        
        let totalImages = 0;
        Object.entries(locationState.designData.designElements).forEach(([area, elements]) => {
          if (Array.isArray(elements)) {
            elements.forEach((element) => {
              if (element.type === 'image' && element.imageBase64) {
                totalImages++;
              }
            });
          }
        });
        
        if (totalImages > 0) {
          await processRawDesignImages(locationState.designData.designElements);
          designImagesProcessed = true;
        }
      }
      
     // STEP 4: Set design data and enhanced product data (do not populate form yet)
        if (locationState.designData) {
          //console.log('🎯 CREATE DEBUG: Setting design data');
           //console.log('🔍 FULL LOCATION STATE:', locationState);
          setDesignData(locationState.designData);
          setEnhancedProductData(locationState.enhancedProductData);

          // STEP 4.1: Extract canvas pricing data
          if (locationState.pricingData) {
            //console.log('💰 CREATE DEBUG: Setting canvas pricing data');
            setCanvasPricingData(locationState.pricingData);
          }

          // STEP 4.2: Extract canvas mockup data
          if (locationState.availableMockups) {
            //console.log('🖼️ CREATE DEBUG: Setting canvas mockup data');
            setCanvasMockupData(locationState.availableMockups);
          }

          // STEP 4.3: Extract image area analysis
          if (locationState.imageAreaAnalysis) {
            //console.log('📏 CREATE DEBUG: Setting image area analysis');
            setImageAreaAnalysis(locationState.imageAreaAnalysis);
          }

          const imageSettings = {
            color_Images: locationState.enhancedProductData?.color_Images || false,
            size_Images: locationState.enhancedProductData?.size_Images || false,
            material_Images: locationState.enhancedProductData?.material_Images || false,
            style_Images: locationState.enhancedProductData?.style_Images || false
          };

          setPayloadImageSettings(imageSettings);
        
        // Populate form - add delay to ensure processing completes
       // Populate form - add delay to ensure processing completes
      setTimeout(() => {
        // ALWAYS prioritize selected colors from canvas over PayloadCMS data
        if (locationState.designData?.colorDetails && 
            Array.isArray(locationState.designData.colorDetails) && 
            locationState.designData.colorDetails.length > 0) {
          
          // Use SELECTED colors from canvas - this handles both colors and sizes
          populateFormWithDesignData(locationState.designData, locationState.enhancedProductData, imageSettings);
          
        } else if (locationState.enhancedProductData && Object.keys(locationState.enhancedProductData).length > 10) {
          
          // Convert PayloadCMS to designData format and use populateFormWithDesignData
          const payloadProduct = locationState.enhancedProductData as PayloadCMSProduct;
          const { designData: convertedDesignData, enhancedProductData: convertedEnhanced } = convertPayloadCMSToFormData(payloadProduct);
          
          // Use the same function for consistency - no dual population
          populateFormWithDesignData(convertedDesignData, convertedEnhanced, imageSettings);
          
        } else {
          populateFormWithDesignData(locationState.designData, locationState.enhancedProductData, imageSettings);
        }
      }, 1000);
        
        setShowImportNotification(true);
      }
    }
  };
  
  // Execute the async processing
  processLocationState().catch(error => {
      isProcessing = false; // Add this
    setError('Failed to process imported design data');
  });
}, [location.state, extractAndStorePreGeneratedImages]);



  // ===== ENHANCED MOCKUP IMAGE PROCESSING WITH REUSE =====
  // REPLACE your handleMockupImagesEnhanced function


  
const handleMockupImagesEnhanced = async (
  locationState: LocationState,
  directImageSettings?: ImageAssociationSettings
) => {
  try {
    const { colorSpecificImages = {}, uniqueImages = {}, designData, enhancedProductData } = locationState;  // ✅ Use colorSpecificImages instead of mockupImages
    const settingsToUse = directImageSettings || payloadImageSettings;
    
    const extractedAreas = extractAvailableAreas(locationState);

    if (skipMockupGeneration && Object.keys(preGeneratedMockupImages).length > 0) {
      await reusePreGeneratedMockupImages(designData!, settingsToUse);
    } else {
      if (Object.keys(uniqueImages).length > 0) {
        await processUniqueImagesFromCanvas(uniqueImages, designData!, settingsToUse, extractedAreas);
      } else if (Object.keys(colorSpecificImages).length > 0) {  // ✅ Check colorSpecificImages
        await processColorSpecificImages(colorSpecificImages, designData!, settingsToUse, extractedAreas);  // ✅ New function
      } else {
        setError('No mockup images found from designer');
      }
    }
    
  } catch (error) {
    setError('Failed to process images from designer');
  }
};

  // ===== NEW: REUSE PRE-GENERATED MOCKUP IMAGES =====
  const reusePreGeneratedMockupImages = async (
    designData: DesignData,
    imageSettings: ImageAssociationSettings
  ) => {

    const processedImages: MediaItem[] = [];
    let currentRank = 1000; // Start after design images
    let reuseCount = 0;
    
    try {
      // Extract color and size info from design data for processing
      const colorDetails = designData.colorDetails || [];
      const sizeOption = designData.options?.find(opt => 
        opt.title.toLowerCase().includes('size')
      );
      const sizes = sizeOption?.optionValues || [];
      
      // Process each color
      for (const colorDetail of colorDetails) {
        if (imageSettings.size_Images && sizes.length > 0) {
          // Size-specific images
          for (const size of sizes) {
            const preGeneratedImage = getPreGeneratedImage('mockup', colorDetail.name, size);
            
            if (preGeneratedImage) {
              const fileName = `reused-mockup-${colorDetail.name.toLowerCase()}-${size.toLowerCase()}.png`;
              
              const processedImage = await processBase64ToFile(
                preGeneratedImage,
                fileName,
                colorDetail.name
              );
              
              if (processedImage) {
                const mediaItem: MediaItem = {
                  file: processedImage.file,
                  url: processedImage.url,
                  rank: currentRank++,
                  isNew: true,
                  variantInfo: {
                    optionName: 'Color',
                    optionValues: [colorDetail.name],
                    secondaryOptionName: 'Size',
                    secondaryOptionValues: [size]
                  },
                  colorValue: colorDetail.name,
                  metadata: {
                    isReuseImage: true,
                    reuseSource: 'pre_generated',
                    originalVariantKey: `${colorDetail.name}_${size}`,
                    extractedColorName: colorDetail.name,
                    extractedSizeName: size,
                    payloadSettings: { ...imageSettings }
                  }
                };
                
                processedImages.push(mediaItem);
                reuseCount++;
              }
            }
          }
        } else {
          // Color-specific, size-shared images
          const preGeneratedImage = getPreGeneratedImage('mockup', colorDetail.name);
          
          if (preGeneratedImage) {
            const fileName = `reused-mockup-${colorDetail.name.toLowerCase()}-shared.png`;
            
            const processedImage = await processBase64ToFile(
              preGeneratedImage,
              fileName,
              colorDetail.name
            );
            
            if (processedImage) {
              const mediaItem: MediaItem = {
                file: processedImage.file,
                url: processedImage.url,
                rank: currentRank++,
                isNew: true,
                variantInfo: {
                  optionName: 'Color',
                  optionValues: [colorDetail.name],
                  isSharedAcrossSizes: true,
                  coversSizes: sizes
                },
                colorValue: colorDetail.name,
                metadata: {
                  isReuseImage: true,
                  isSharedImage: true,
                  reuseSource: 'pre_generated',
                  originalVariantKey: colorDetail.name,
                  extractedColorName: colorDetail.name,
                  payloadSettings: { ...imageSettings },
                  allCoveredKeys: sizes.map(size => `${colorDetail.name}_${size}`)
                }
              };

              processedImages.push(mediaItem);
              reuseCount++;
            }
          }
        }
      }
      
      if (processedImages.length > 0) {
        setMediaItems(prev => [...prev, ...processedImages]);
        setTimeout(() => setActiveImageTab('upload'), 100);
        
      } else {
        setSkipMockupGeneration(false);
      }
      
      // Update reuse stats
      setImageReuseStats(prev => ({
        ...prev,
        reused: prev.reused + reuseCount
      }));
      
    } catch (error) {
      setSkipMockupGeneration(false);
    }
  };

  // ===== DESIGN IMAGE PROCESSING (UNCHANGED) =====
  const processRawDesignImages = async (designElements: Record<string, any[]>) => {
    
    if (!designElements || typeof designElements !== 'object') {
      return;
    }
    
    try {
      const rawDesignImages: MediaItem[] = [];
      let designImageRank = 0;
      let totalProcessed = 0;
      let totalFailed = 0;
      
      // Process each area
      for (const [areaName, elements] of Object.entries(designElements)) {       
        if (!Array.isArray(elements)) {
    
          continue;
        }
        
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          
          if (element.type === 'image' && element.imageBase64) {
            try {
              
              const timestamp = Date.now();
              const randomId = Math.random().toString(36).substring(2, 8);
              const cleanName = (element.imageName || 'design-image')
                .replace(/[^a-z0-9.-]/gi, '_')
                .toLowerCase();
              const fileName = `design-${cleanName}-${areaName}-${timestamp}-${randomId}.png`;
              
              const processedImage = await processBase64ToFile(
                element.imageBase64,
                fileName,
                undefined
              );
              
              if (!processedImage) {

                totalFailed++;
                continue;
              }
              
              const designMediaItem: MediaItem = {
                file: processedImage.file,
                url: processedImage.url,
                rank: designImageRank++,
                isNew: true,
                
                variantInfo: {
                  isRawDesignImage: true,
                  designArea: areaName,
                  originalFileName: element.imageName || 'Unnamed'
                },
                
                metadata: {
                  isRawDesignImage: true,
                  designArea: areaName,
                  originalFileName: element.imageName,
                  originalImageWidth: element.originalImageWidth || element.width,
                  originalImageHeight: element.originalImageHeight || element.height,
                  
                  canvasPosition: {
                    x: element.x || 0,
                    y: element.y || 0,
                    width: element.width || 0,
                    height: element.height || 0,
                    rotation: element.rotation || 0
                  },
                  
                  uploadValidation: {
                    hasFile: true,
                    fileSize: processedImage.file.size,
                    fileType: processedImage.file.type,
                    fileName: processedImage.file.name,
                    validForUpload: true
                  },
                  
                  debugInfo: {
                    source: 'canvas_design_element',
                    area: areaName,
                    elementId: element.id,
                    processed: true,
                    timestamp: new Date().toISOString(),
                    processedAt: 'processRawDesignImages'
                  }
                }
              };
              
              rawDesignImages.push(designMediaItem);
              totalProcessed++;
              
              
            } catch (error) {
              totalFailed++;
            }
          }
        }
      }
    
      
      if (rawDesignImages.length > 0) {

        
        setMediaItems(prev => {
          const combined = [...rawDesignImages, ...prev];
          
          const designImagesInState = combined.filter(item => item.metadata?.isRawDesignImage);
          
          return combined;
        });
        
        setTimeout(() => {
          setMediaItems(current => {
            const designImages = current.filter(item => item.metadata?.isRawDesignImage);
            
            if (designImages.length > 0) {

              designImages.forEach((img, index) => {
              });
            } else {
            }
            
            return current;
          });
        }, 100);
        
      } else {
      }
      
    } catch (error) {
    }
  };

  // ===== EXISTING UNIQUE IMAGES PROCESSING =====
  // REPLACE the section where you create the mediaItem in processUniqueImagesFromCanvas
const processUniqueImagesFromCanvas = async (
  uniqueImages: Record<string, any>,
  designData: DesignData,
  directImageSettings?: ImageAssociationSettings,
   extractedAreas?: string[] 
) => {
  try {
     const areasToUse = extractedAreas || availableAreas;
    const settingsToUse = directImageSettings || payloadImageSettings;
    
    const processedImages: MediaItem[] = [];
    let currentRank = 0;
    let skippedCount = 0;
    let failedCount = 0;
    
    for (const [imageHash, imageInfo] of Object.entries(uniqueImages)) {
      try {
        
        if (!imageInfo.imageData) {
          skippedCount++;
          continue;
        }
        
        let base64Data = imageInfo.imageData;
        if (!base64Data.startsWith('data:image/')) {
          if (base64Data.length > 100 && !base64Data.includes('data:')) {
            base64Data = `data:image/png;base64,${base64Data}`;
          } else {
            skippedCount++;
            continue;
          }
        }
        
        let extractedInfo = {
          colorName: imageInfo.colorName || 'Unknown',
          sizeName: imageInfo.sizeName,
          areaName: undefined as string | undefined
        };
        
        if (imageInfo.mockupTitle && (extractedInfo.colorName === 'Unknown' || !extractedInfo.sizeName || !extractedInfo.areaName)) {
          // 🔥 PASS availableAreas to parsing function
          const parsedFromTitle = parseVariantKeyEnhanced(imageInfo.mockupTitle, designData, availableAreas,areasToUse);
          if (parsedFromTitle.colorName !== 'Unknown') {
            extractedInfo.colorName = parsedFromTitle.colorName;
          }
          if (parsedFromTitle.sizeName && !extractedInfo.sizeName) {
            extractedInfo.sizeName = parsedFromTitle.sizeName;
          }
          if (parsedFromTitle.areaName && !extractedInfo.areaName) {
            extractedInfo.areaName = parsedFromTitle.areaName;
          }
        }
        
        if (extractedInfo.colorName === 'Unknown' && designData.colorDetails?.length > 0) {
          extractedInfo.colorName = designData.colorDetails[0].name;
        }
        
        const timestamp = Date.now();
        const fileName = extractedInfo.sizeName 
          ? `canvas-${extractedInfo.areaName || 'unknown'}-${extractedInfo.colorName.toLowerCase()}-${extractedInfo.sizeName.toLowerCase()}-${timestamp}.png`
          : `canvas-${extractedInfo.areaName || 'unknown'}-${extractedInfo.colorName.toLowerCase()}-${timestamp}.png`;
        
        
        const processedImage = await processBase64ToFile(
          base64Data,
          fileName,
          extractedInfo.colorName
        );
        
        if (!processedImage) {
          failedCount++;
          continue;
        }
        
        if (processedImage.file.size < 1000) {
          failedCount++;
          continue;
        }
        
        if (!processedImage.file.type.startsWith('image/')) {
          failedCount++;
          continue;
        }
        
        const variantInfo = createVariantInfoStructure(extractedInfo, settingsToUse);
        
        const mediaItem: MediaItem = {
          file: processedImage.file,
          url: processedImage.url,
          rank: currentRank,
          isNew: true,
          variantInfo: variantInfo,
          colorValue: extractedInfo.colorName,
          
          metadata: {
            isSharedImage: !settingsToUse.size_Images,
            originalVariantKey: `${imageInfo.mockupTitle}-${extractedInfo.colorName}${extractedInfo.sizeName ? `-${extractedInfo.sizeName}` : ''}`,
            sharingStrategy: determineSharingStrategy(settingsToUse),
            imageHash: imageHash,
            originalSize: processedImage.size,
            quality: processedImage.quality,
            validatedDimensions: processedImage.dimensions ? 
              `${processedImage.dimensions.width}x${processedImage.dimensions.height}` : 'unknown',
            extractedColorName: extractedInfo.colorName,
            extractedSizeName: extractedInfo.sizeName,
            extractedAreaName: extractedInfo.areaName,  // 🔥 ADD AREA TO METADATA
            payloadSettings: { ...settingsToUse },
            
            uploadValidation: {
              hasFile: !!processedImage.file,
              fileSize: processedImage.file.size,
              fileType: processedImage.file.type,
              fileName: processedImage.file.name,
              validForUpload: true,
              originalBase64Length: base64Data.length
            },
            
            debugInfo: {
              originalColorName: imageInfo.colorName,
              originalSizeName: imageInfo.sizeName,
              originalMockupTitle: imageInfo.mockupTitle,
              extractionStrategy: 'enhanced_validated',
              processed: true,
              timestamp: new Date().toISOString()
            }
          }
        };
        
        if (!mediaItem.file) {
          failedCount++;
          continue;
        }
        
        processedImages.push(mediaItem);
        currentRank++;
      
      } catch (error) {
        failedCount++;
      }
    }
    
    
    if (processedImages.length === 0) {
      setError('Enhanced processing: Failed to process any images. Check console for details.');
      return;
    }
    
    const validImages = processedImages.filter(item => {
      const isValid = item.file && item.file.size > 0 && item.url;
      if (!isValid) {
      }
      return isValid;
    });
    
    setMediaItems(prev => [...prev, ...validImages]);

    setTimeout(() => setActiveImageTab('upload'), 100);
    
    //console.log('✅ Processed images by area:');
    validImages.forEach((item, index) => {
      //console.log(`  ${index + 1}. Area: ${item.metadata?.extractedAreaName || 'unknown'}, Color: ${item.colorValue}, Size: ${item.metadata?.extractedSizeName || 'shared'}`);
    });
    
  } catch (error) {
    setError('Enhanced image processing failed. Check console for details.');
  }
};

  // ===== EXTRACT COLOR AND SIZE FROM IMAGE DATA =====
  const extractColorAndSizeFromImageData = (imageInfo: any, designData: DesignData) => {
    
    const colorMatcher = createColorMatcher(designData);
    
    let colorName = imageInfo.colorName || 'Unknown';
    let sizeName: string | undefined = imageInfo.sizeName;
    
    // Strategy 1: Direct extraction from imageInfo
    if (colorName && colorName !== 'Unknown') {
    } else {
      // Strategy 2: Extract from mockupTitle using dynamic matcher
      if (imageInfo.mockupTitle) {
        colorName = colorMatcher.matchColor(imageInfo.mockupTitle);
      }
      
      // Strategy 3: Use first available color as fallback
      if (colorName === 'Unknown') {
        const firstColor = colorMatcher.getAllColorNames()[0];
        if (firstColor) {
          colorName = firstColor;
        }
      }
    }
    
    // Size extraction with multiple strategies
    if (!sizeName && imageInfo.mockupTitle && designData.options) {
      const sizeOption = designData.options.find(opt => 
        opt.title.toLowerCase().includes('size')
      );
      
      if (sizeOption?.optionValues) {
        // Strategy 1: Direct match in mockupTitle
        for (const sizeValue of sizeOption.optionValues) {
          if (imageInfo.mockupTitle.toLowerCase().includes(sizeValue.toLowerCase())) {
            sizeName = sizeValue;
            break;
          }
        }
        
        // Strategy 2: Parse title parts
        if (!sizeName) {
          const titleParts = imageInfo.mockupTitle.split(/[-_\s]+/);
          for (const part of titleParts) {
            const matchingSize = sizeOption.optionValues.find(size => 
              size.toLowerCase() === part.trim().toLowerCase()
            );
            if (matchingSize) {
              sizeName = matchingSize;
              break;
            }
          }
        }
      }
    }
    
    return { colorName, sizeName };
  };

  // ===== HELPER FUNCTIONS =====

const processColorSpecificImages = async (
  colorSpecificImages: Record<string, any[]>,
  designData: DesignData,
  imageSettings: ImageAssociationSettings,
  extractedAreas?: string[]
) => {
  try {
    const processedImages: MediaItem[] = [];
    let currentRank = 1000;
    
    // Get all available sizes
    const sizeOption = designData.options?.find(opt => 
      opt.title.toLowerCase().includes('size')
    );
    const allSizes = sizeOption?.optionValues || [];
    
    // console.log('🔍 SIZE DEBUG: Processing with settings:', {
    //   size_Images: imageSettings.size_Images,
    //   color_Images: imageSettings.color_Images,
    //   availableSizes: allSizes
    // });
    
    // Iterate through each color group
    for (const [colorHex, mockups] of Object.entries(colorSpecificImages)) {
      const colorDetail = designData.colorDetails?.find(c => c.value.toLowerCase() === colorHex.toLowerCase());
      const colorName = colorDetail?.name || colorHex;
      
      //console.log(`\n🎨 Processing color: ${colorName} (${mockups.length} mockups)`);
      
      // 🔥 CASE 1: size_Images TRUE, color_Images FALSE - Size-specific images
      // 🔥 CASE 1: size_Images TRUE, color_Images FALSE - Size-specific images
if (imageSettings.size_Images && !imageSettings.color_Images && allSizes.length > 0) {
  // console.log(`🔧 SIZE MODE: Creating entries for color ${colorName}`);
  // console.log(`  Available mockups:`, mockups.length);
  // console.log(`  Available sizes:`, allSizes);
  
  // 🔥 CRITICAL FIX: Each mockup is ALREADY size-specific!
  // Extract size from mockupTitle or storageKey
  for (const mockup of mockups) {
    // console.log(`\n  📸 Processing mockup:`, {
    //   mockupTitle: mockup.mockupTitle,
    //   storageKey: mockup.storageKey
    // });
    
    // Extract size from mockupTitle: "Front (Galaxy 5)" -> "Galaxy 5"
    let extractedSize: string | null = null;
    
    // Method 1: Extract from mockupTitle
    const titleMatch = mockup.mockupTitle?.match(/\(([^)]+)\)/);
    if (titleMatch && titleMatch[1]) {
      extractedSize = titleMatch[1];
      //console.log(`    ✅ Extracted size from mockupTitle: "${extractedSize}"`);
    }
    
    // Method 2: Fallback - Extract from storageKey
    if (!extractedSize && mockup.storageKey) {
      // storageKey format: "68e215378637855a3783bbd5_front_ffffff_galaxy_5"
      const keyParts = mockup.storageKey.split('_');
      // Find which part matches a size
      for (const part of keyParts) {
        const matchingSize = allSizes.find(size => 
          size.toLowerCase().replace(/\s+/g, '_') === part.toLowerCase()
        );
        if (matchingSize) {
          extractedSize = matchingSize;
          //console.log(`    ✅ Extracted size from storageKey: "${extractedSize}"`);
          break;
        }
      }
      
      // Try multi-part match (e.g., "galaxy_5" -> "Galaxy 5")
      if (!extractedSize) {
        for (let i = 0; i < keyParts.length - 1; i++) {
          const combined = `${keyParts[i]}_${keyParts[i + 1]}`;
          const matchingSize = allSizes.find(size => 
            size.toLowerCase().replace(/\s+/g, '_') === combined.toLowerCase()
          );
          if (matchingSize) {
            extractedSize = matchingSize;
            //console.log(`    ✅ Extracted size from storageKey (combined): "${extractedSize}"`);
            break;
          }
        }
      }
    }
    
    // If we couldn't extract size, log warning and skip
    if (!extractedSize) {
      //console.log(`    ⚠️ WARNING: Could not extract size from mockup, skipping!`);
      continue;
    }
    
    // Verify extracted size is in allSizes
    if (!allSizes.includes(extractedSize)) {
      //console.log(`    ⚠️ WARNING: Extracted size "${extractedSize}" not in allSizes:`, allSizes);
      continue;
    }
    
    const fileName = `mockup-${mockup.viewAngle}-${colorName.toLowerCase()}-${extractedSize.toLowerCase().replace(/\s+/g, '_')}.png`;
    
    //console.log(`    🔧 Creating entry for extracted size: ${extractedSize}`);
    
    const processedImage = await processBase64ToFile(
      mockup.imageData,
      fileName,
      colorName
    );
    
    if (processedImage) {
      // 🔥 FIX: Use the EXTRACTED size, not loop through all sizes
      const variantInfo = {
        optionName: 'Size',
        optionValues: [extractedSize],  // ✅ Use extracted size
        secondaryOptionName: 'Color',
        secondaryOptionValues: [colorName]
      };
      
      const mediaItem: MediaItem = {
        file: processedImage.file,
        url: processedImage.url,
        rank: currentRank++,
        isNew: true,
        variantInfo: variantInfo,
        colorValue: colorName,
        metadata: {
          mockupId: mockup.mockupId,
          viewAngle: mockup.viewAngle,
          hasDesign: mockup.hasDesign,
          extractedColorName: colorName,
          extractedSizeName: extractedSize,  // ✅ Use extracted size
          originalMockupTitle: mockup.mockupTitle,
          originalStorageKey: mockup.storageKey,
          payloadSettings: { ...imageSettings }
        }
      };
      
      processedImages.push(mediaItem);
      
      // console.log('    ✅ SIZE DEBUG: Created size-specific media item:', {
      //   size: extractedSize,
      //   colorName,
      //   viewAngle: mockup.viewAngle,
      //   mockupTitle: mockup.mockupTitle,
      //   primaryOption: mediaItem.variantInfo.optionName,
      //   primaryValue: mediaItem.variantInfo.optionValues[0],
      //   fileName: mediaItem.file?.name
      // });
    } else {
      //console.log('    ❌ Failed to process image for size:', extractedSize);
    }
  }

      } 
      // 🔥 CASE 2: color_Images TRUE, size_Images FALSE - Color-specific, size-shared images
      else if (imageSettings.color_Images && !imageSettings.size_Images) {
        //console.log(`🎨 COLOR MODE: Creating color-specific images for ${colorName}`);
        
        for (const mockup of mockups) {
          const fileName = `mockup-${mockup.viewAngle}-${colorName.toLowerCase()}.png`;
          
          const processedImage = await processBase64ToFile(
            mockup.imageData,
            fileName,
            colorName
          );
          
          if (processedImage) {
            const variantInfo = {
              optionName: 'Color',
              optionValues: [colorName],
              isSharedAcrossSizes: true,
              coversSizes: allSizes
            };
            
            const mediaItem: MediaItem = {
              file: processedImage.file,
              url: processedImage.url,
              rank: currentRank++,
              isNew: true,
              variantInfo: variantInfo,
              colorValue: colorName,
              metadata: {
                mockupId: mockup.mockupId,
                viewAngle: mockup.viewAngle,
                hasDesign: mockup.hasDesign,
                extractedColorName: colorName,
                extractedSizeNames: allSizes,
                coversAllSizes: true,
                payloadSettings: { ...imageSettings }
              }
            };
            
            processedImages.push(mediaItem);
            
            // console.log('✅ COLOR DEBUG: Created color-specific media item:', {
            //   colorName,
            //   viewAngle: mockup.viewAngle,
            //   primaryOption: mediaItem.variantInfo.optionName,
            //   coversSizes: mediaItem.variantInfo.coversSizes
            // });
          }
        }
      }
      // 🔥 CASE 3: BOTH color_Images and size_Images TRUE
      else if (imageSettings.color_Images && imageSettings.size_Images) {
        //console.log(`🔄 BOTH MODE: Creating color+size specific images for ${colorName}`);
        
        // In this mode, we'd ideally need separate images per color-size combination
        // For now, we'll create entries covering all sizes per color
        for (const mockup of mockups) {
          const fileName = `mockup-${mockup.viewAngle}-${colorName.toLowerCase()}-all-sizes.png`;
          
          const processedImage = await processBase64ToFile(
            mockup.imageData,
            fileName,
            colorName
          );
          
          if (processedImage) {
            const variantInfo = {
              optionName: 'Color',
              optionValues: [colorName],
              secondaryOptionName: 'Size',
              secondaryOptionValues: allSizes,
              coversSizes: allSizes
            };
            
            const mediaItem: MediaItem = {
              file: processedImage.file,
              url: processedImage.url,
              rank: currentRank++,
              isNew: true,
              variantInfo: variantInfo,
              colorValue: colorName,
              metadata: {
                mockupId: mockup.mockupId,
                viewAngle: mockup.viewAngle,
                hasDesign: mockup.hasDesign,
                extractedColorName: colorName,
                extractedSizeNames: allSizes,
                coversAllSizes: true,
                payloadSettings: { ...imageSettings }
              }
            };
            
            processedImages.push(mediaItem);
            
            // console.log('✅ BOTH DEBUG: Created color+size media item:', {
            //   colorName,
            //   viewAngle: mockup.viewAngle,
            //   primaryOption: mediaItem.variantInfo.optionName,
            //   coversSizes: mediaItem.variantInfo.coversSizes
            // });
          }
        }
      }
      // 🔥 CASE 4: Neither enabled (default/fallback)
      else {
        //console.log(`⚙️ DEFAULT MODE: Creating basic images for ${colorName}`);
        
        for (const mockup of mockups) {
          const fileName = `mockup-${mockup.viewAngle}-${colorName.toLowerCase()}.png`;
          
          const processedImage = await processBase64ToFile(
            mockup.imageData,
            fileName,
            colorName
          );
          
          if (processedImage) {
            const variantInfo = {
              optionName: 'Color',
              optionValues: [colorName],
              isSharedAcrossSizes: true
            };
            
            const mediaItem: MediaItem = {
              file: processedImage.file,
              url: processedImage.url,
              rank: currentRank++,
              isNew: true,
              variantInfo: variantInfo,
              colorValue: colorName,
              metadata: {
                mockupId: mockup.mockupId,
                viewAngle: mockup.viewAngle,
                hasDesign: mockup.hasDesign,
                extractedColorName: colorName,
                payloadSettings: { ...imageSettings }
              }
            };
            
            processedImages.push(mediaItem);
          }
        }
      }
    }
    
    //console.log(`\n📦 SIZE DEBUG: Total processed images: ${processedImages.length}`);
    
    if (processedImages.length > 0) {
      setMediaItems(prev => [...prev, ...processedImages]);
      setTimeout(() => setActiveImageTab('upload'), 100);
      
      //console.log('✅ Images added to mediaItems state');
    } else {
      //console.log('⚠️ No images were processed');
    }
    
  } catch (error) {
    //console.error('❌ Error processing color-specific images:', error);
    setError('Failed to process mockup images');
  }
};

  // Add this helper function before the Create component
// Updated helper function to access the correct nested property
const getLocationId = (enhancedProductData?: PayloadProductData): string => {
  // First, try to get from PayloadCMS data (nested in shippingInfo)
  if (enhancedProductData?.shippingInfo?.shippingLocationID) {
    //console.log('✅ Using PayloadCMS shippingLocationID:', enhancedProductData.shippingInfo.shippingLocationID);
    return enhancedProductData.shippingInfo.shippingLocationID;
  }
  
  // Fallback to environment variable
  const envLocationId = import.meta.env.VITE_STORE_LOCATION_ID;
  if (envLocationId) {
    //console.log('✅ Using environment VITE_STORE_LOCATION_ID:', envLocationId);
    return envLocationId;
  }
  
  // ❌ REMOVED: No hardcoded fallback for production
  //console.error('❌ CRITICAL: No location ID found. Set shippingLocationID in PayloadCMS or VITE_STORE_LOCATION_ID in environment');
  return ''; // Return empty string to trigger error handling
};

  const validateColorExists = (colorName: string, designData: DesignData): boolean => {
    const colorMatcher = createColorMatcher(designData);
    return colorMatcher.getAllColorNames().includes(colorName);
  };


  const getStaticUrl = (fileId: string): string => {
  const baseUrl = import.meta.env.VITE_STATIC_BASE_URL || 'https://files.junooni.com/junooni-files';
  return `${baseUrl}/${fileId}`;
};

  const getColorHex = (colorName: string, designData: DesignData): string | undefined => {
    const colorMatcher = createColorMatcher(designData);
    return colorMatcher.getHexForColor(colorName);
  };

  const isSizeValue = (value: string, designData: DesignData): boolean => {
    const sizeOption = designData.options?.find(opt => 
      opt.title.toLowerCase().includes('size')
    );
    
    return sizeOption?.optionValues.includes(value) || false;
  };

  const createVariantInfoStructure = (
    extractedInfo: { colorName: string; sizeName?: string },
    settings: ImageAssociationSettings
  ) => {
    const { colorName, sizeName } = extractedInfo;
    
    const baseVariantInfo = {
      optionName: 'Color',
      optionValues: [colorName || 'Unknown']
    };
    
    if (settings.color_Images && settings.size_Images && sizeName) {
      return {
        ...baseVariantInfo,
        secondaryOptionName: 'Size',
        secondaryOptionValues: [sizeName]
      };
    } else if (settings.size_Images && sizeName) {
      return {
        optionName: 'Size',
        optionValues: [sizeName],
        secondaryOptionName: 'Color',
        secondaryOptionValues: [colorName || 'Unknown']
      };
    }
    
    return baseVariantInfo;
  };

  const determineSharingStrategy = (settings: ImageAssociationSettings): string => {
    if (settings.color_Images && settings.size_Images) {
      return 'color_and_size_specific';
    } else if (settings.color_Images && !settings.size_Images) {
      return 'color_specific_size_shared';
    } else {
      return 'shared_across_all';
    }
  };

  // REPLACE the entire getImagesForOptionValue function
const getImagesForOptionValue = (optionName: string, optionValue: string): MediaItem[] => {
  // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  // console.log('🔍 FILTER: getImagesForOptionValue called');
  // console.log('  optionName:', optionName);
  // console.log('  optionValue:', optionValue);
  // console.log('  payloadImageSettings:', payloadImageSettings);
  // console.log('  Total mediaItems:', mediaItems.length);
  
  const filteredImages = mediaItems.filter(item => {
    // Skip design images
    const isDesign = item.metadata?.isRawDesignImage === true || 
                   item.variantInfo?.isRawDesignImage === true||
                   item.metadata?.debugInfo?.source === 'canvas_design_element';
    if (isDesign) return false;
    
    const isColorOption = optionName.toLowerCase() === 'color';
    const isSizeOption = optionName.toLowerCase() === 'size';
    const optionValueLower = optionValue.toLowerCase();
    
    // console.log('\n🔍 FILTER: Checking image:', item.file?.name);
    // console.log('  variantInfo:', {
    //   optionName: item.variantInfo?.optionName,
    //   optionValues: item.variantInfo?.optionValues,
    //   secondaryOptionName: item.variantInfo?.secondaryOptionName,
    //   secondaryOptionValues: item.variantInfo?.secondaryOptionValues
    // });
    // console.log('  metadata:', {
    //   extractedSizeName: item.metadata?.extractedSizeName,
    //   extractedColorName: item.metadata?.extractedColorName
    // });
    
    // CASE 1: color_Images TRUE, size_Images FALSE
    if (payloadImageSettings.color_Images && !payloadImageSettings.size_Images) {
      if (!isColorOption) {
        //console.log('  ❌ FILTER: Not a color option, skipping');
        return false;
      }
      
      //console.log('  🎨 COLOR MODE: Checking color match');
      
      const matchesColor = (colorToCheck: string | undefined): boolean => {
        if (!colorToCheck) return false;
        
        const colorLower = colorToCheck.toLowerCase();
        const normalizedColor = colorLower.replace(/\s+/g, '').replace(/-/g, '').replace(/_/g, '');
        const normalizedOptionValue = optionValueLower.replace(/\s+/g, '').replace(/-/g, '').replace(/_/g, '');
        
        if (colorLower === optionValueLower) return true;
        if (normalizedColor === normalizedOptionValue) return true;
        if (colorLower.includes(optionValueLower) || optionValueLower.includes(colorLower)) return true;
        
        return false;
      };
      
      if (matchesColor(item.variantInfo?.optionValues?.[0])) {
        //console.log('  ✅ FILTER: Matched via primary optionValues');
        return true;
      }
      
      if (matchesColor(item.variantInfo?.secondaryOptionValues?.[0])) {
        //console.log('  ✅ FILTER: Matched via secondary optionValues');
        return true;
      }
      
      if (matchesColor(item.metadata?.extractedColorName)) {
        //console.log('  ✅ FILTER: Matched via extractedColorName');
        return true;
      }
      
      if (matchesColor(item.colorValue)) {
        //console.log('  ✅ FILTER: Matched via colorValue');
        return true;
      }
      
      if (item.metadata?.isSharedImage) {
        const sharedImageColor = item.colorValue || item.metadata?.extractedColorName;
        if (matchesColor(sharedImageColor)) {
          //console.log('  ✅ FILTER: Matched shared image for color:', sharedImageColor);
          return true;
        }
      }
      
      //console.log('  ❌ FILTER: No color match found');
      return false;
    }
    
    // CASE 2: color_Images FALSE, size_Images TRUE
    if (!payloadImageSettings.color_Images && payloadImageSettings.size_Images) {
      if (!isSizeOption) {
        //console.log('  ❌ FILTER: Not a size option, skipping');
        return false;
      }
      
      // console.log('  📏 SIZE MODE: Checking size match');
      // console.log('    Looking for:', optionValueLower);
      // console.log('    Image primary option:', item.variantInfo?.optionName?.toLowerCase());
      // console.log('    Image primary values:', item.variantInfo?.optionValues?.map(v => v.toLowerCase()));
      
      // Helper function for flexible size matching
      const matchesSize = (sizeToCheck: string | undefined): boolean => {
        if (!sizeToCheck) return false;
        
        const sizeLower = sizeToCheck.toLowerCase();
        const normalizedSize = sizeLower.replace(/\s+/g, '').replace(/-/g, '').replace(/_/g, '');
        const normalizedOptionValue = optionValueLower.replace(/\s+/g, '').replace(/-/g, '').replace(/_/g, '');
        
        // Exact match
        if (sizeLower === optionValueLower) return true;
        
        // Normalized match (no spaces/hyphens/underscores)
        if (normalizedSize === normalizedOptionValue) return true;
        
        // Partial match for compound names
        if (sizeLower.includes(optionValueLower) || optionValueLower.includes(sizeLower)) return true;
        
        return false;
      };
      
      // Check primary option (Size)
      if (item.variantInfo?.optionName?.toLowerCase() === 'size') {
        //console.log('    ✓ Primary option IS size');
        
        const primaryMatch = item.variantInfo?.optionValues?.some(val => {
          const match = matchesSize(val);
          //console.log(`      Comparing "${val.toLowerCase()}" with "${optionValueLower}": ${match}`);
          return match;
        });
        
        if (primaryMatch) {
          //console.log('  ✅ FILTER: MATCH via primary size option');
          return true;
        } else {
          //console.log('  ❌ NO MATCH in primary values');
        }
      } else {
        //console.log('    ✗ Primary option is NOT size, it is:', item.variantInfo?.optionName);
      }
      
      // Check secondary option (Size)
      if (item.variantInfo?.secondaryOptionName?.toLowerCase() === 'size') {
        //console.log('    ✓ Secondary option IS size');
        
        const secondaryMatch = item.variantInfo?.secondaryOptionValues?.some(val => {
          const match = matchesSize(val);
          //console.log(`      Comparing "${val.toLowerCase()}" with "${optionValueLower}": ${match}`);
          return match;
        });
        
        if (secondaryMatch) {
          //console.log('  ✅ FILTER: MATCH via secondary size option');
          return true;
        } else {
          //console.log('  ❌ NO MATCH in secondary values');
        }
      } else {
        //console.log('    ✗ Secondary option is NOT size, it is:', item.variantInfo?.secondaryOptionName);
      }
      
      // Check extracted size metadata
      if (item.metadata?.extractedSizeName) {
        const metadataMatch = matchesSize(item.metadata.extractedSizeName);
        //console.log(`    Checking metadata: "${item.metadata.extractedSizeName.toLowerCase()}" with "${optionValueLower}": ${metadataMatch}`);
        
        if (metadataMatch) {
          //console.log('  ✅ FILTER: MATCH via extractedSizeName');
          return true;
        }
      } else {
        //console.log('    ✗ No extractedSizeName in metadata');
      }
      
      //console.log('  ❌ FILTER: NO MATCH FOUND');
      return false;
    }
    
    // CASE 3: BOTH color_Images and size_Images are TRUE
    if (payloadImageSettings.color_Images && payloadImageSettings.size_Images) {
      //console.log('  🔄 BOTH MODE: Checking for color+size combination');
      
      const matchesColor = (colorToCheck: string | undefined): boolean => {
        if (!colorToCheck) return false;
        const colorLower = colorToCheck.toLowerCase();
        return colorLower === optionValueLower || 
               colorLower.includes(optionValueLower) || 
               optionValueLower.includes(colorLower);
      };
      
      const matchesSize = (sizeToCheck: string | undefined): boolean => {
        if (!sizeToCheck) return false;
        const sizeLower = sizeToCheck.toLowerCase();
        const normalizedSize = sizeLower.replace(/\s+/g, '').replace(/-/g, '').replace(/_/g, '');
        const normalizedOptionValue = optionValueLower.replace(/\s+/g, '').replace(/-/g, '').replace(/_/g, '');
        
        return sizeLower === optionValueLower || 
               normalizedSize === normalizedOptionValue ||
               sizeLower.includes(optionValueLower) || 
               optionValueLower.includes(sizeLower);
      };
      
      if (isColorOption) {
        if (item.variantInfo?.optionName?.toLowerCase() === 'color' &&
            item.variantInfo?.optionValues?.some(val => matchesColor(val))) {
          //console.log('  ✅ FILTER: MATCH via primary color');
          return true;
        }
        
        if (item.variantInfo?.secondaryOptionName?.toLowerCase() === 'color' &&
            item.variantInfo?.secondaryOptionValues?.some(val => matchesColor(val))) {
          //console.log('  ✅ FILTER: MATCH via secondary color');
          return true;
        }
        
        if (matchesColor(item.metadata?.extractedColorName) ||
            matchesColor(item.colorValue)) {
          //console.log('  ✅ FILTER: MATCH via color metadata');
          return true;
        }
      }
      
      if (isSizeOption) {
        if (item.variantInfo?.optionName?.toLowerCase() === 'size' &&
            item.variantInfo?.optionValues?.some(val => matchesSize(val))) {
          //console.log('  ✅ FILTER: MATCH via primary size');
          return true;
        }
        
        if (item.variantInfo?.secondaryOptionName?.toLowerCase() === 'size' &&
            item.variantInfo?.secondaryOptionValues?.some(val => matchesSize(val))) {
          //console.log('  ✅ FILTER: MATCH via secondary size');
          return true;
        }
        
        if (matchesSize(item.metadata?.extractedSizeName)) {
          //console.log('  ✅ FILTER: MATCH via size metadata');
          return true;
        }
      }
      
      //console.log('  ❌ FILTER: NO MATCH in both mode');
      return false;
    }
    
    // No specific image association settings enabled
    //console.log('  ⚠️ FILTER: No image association settings enabled');
    return false;
  });
  
  // Deduplicate
  const uniqueImages = filteredImages.filter((item, index, self) => {
    return self.findIndex(img => img.url === item.url) === index;
  });
  
  //console.log('\n🎯 FILTER: Result:', uniqueImages.length, 'images matched (after deduplication)');
  // uniqueImages.forEach((img, i) => {
  //   console.log(`  ${i + 1}. ${img.file?.name}`, {
  //     primaryOption: img.variantInfo?.optionName,
  //     primaryValue: img.variantInfo?.optionValues?.[0]
  //   });
  // });
  // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return uniqueImages;
};

// ADD THIS DEBUG FUNCTION
const debugImageTagging = () => {
  //console.log('🔍 DEBUG: All mediaItems:', mediaItems.length);
  
  const mockups = mediaItems.filter(item => {
    const isDesign = item.metadata?.isRawDesignImage === true || 
                   item.variantInfo?.isRawDesignImage === true ||
                   item.metadata?.debugInfo?.source === 'canvas_design_element';
    return !isDesign;
  });
  
  //console.log('🔍 DEBUG: Mockup images:', mockups.length);
  
  // mockups.forEach((item, idx) => {
  //   console.log(`Image ${idx + 1}:`, {
  //     fileName: item.file?.name,
  //     primaryOption: item.variantInfo?.optionName,
  //     primaryValues: item.variantInfo?.optionValues,
  //     secondaryOption: item.variantInfo?.secondaryOptionName,
  //     secondaryValues: item.variantInfo?.secondaryOptionValues,
  //     extractedColor: item.metadata?.extractedColorName,
  //     extractedSize: item.metadata?.extractedSizeName,
  //     colorValue: item.colorValue
  //   });
  // });
  
  //console.log('🔍 Settings:', payloadImageSettings);
};

// Call it when Size tab is selected
useEffect(() => {
  debugImageTagging();
}, [mediaItems, payloadImageSettings]);

  // ===== ENHANCED: GET IMAGES FOR COLOR-SIZE COMBINATION =====
  const getImagesForColorSizeCombination = (colorValue: string, sizeValue: string): MediaItem[] => {
    
    const filteredImages = mediaItems.filter(item => {
      let colorMatch = false;
      let sizeMatch = false;
      
      const colorLower = colorValue.toLowerCase();
      const sizeLower = sizeValue.toLowerCase();
      
      // Check color match (multiple strategies)
      if (item.variantInfo?.optionName?.toLowerCase() === 'color' && 
          item.variantInfo?.optionValues?.some(val => val.toLowerCase() === colorLower)) {
        colorMatch = true;
      } else if (item.metadata?.extractedColorName?.toLowerCase() === colorLower) {
        colorMatch = true;
      } else if (item.colorValue?.toLowerCase() === colorLower) {
        colorMatch = true;
      }
      
      // Check size match (multiple strategies)
      if (item.variantInfo?.secondaryOptionName?.toLowerCase() === 'size' && 
          item.variantInfo?.secondaryOptionValues?.some(val => val.toLowerCase() === sizeLower)) {
        sizeMatch = true;
      } else if (item.variantInfo?.optionName?.toLowerCase() === 'size' && 
                 item.variantInfo?.optionValues?.some(val => val.toLowerCase() === sizeLower)) {
        sizeMatch = true;
      } else if (item.metadata?.extractedSizeName?.toLowerCase() === sizeLower) {
        sizeMatch = true;
      }
      
      const result = colorMatch && sizeMatch;
      
      if (result) {
      }
      
      return result;
    });
    
    return filteredImages;
  };

  // ===== PAYLOADCMS DATA CONVERTER =====
  const convertPayloadCMSToFormData = (payloadProduct: PayloadCMSProduct): {
  designData: DesignData;
  enhancedProductData: PayloadProductData;
} => {
  
  const designData: DesignData = {
    productInfo: {
      title: payloadProduct.name,
      description: convertLexicalToHtml(payloadProduct.description),
      sku: payloadProduct.sku,
      brand: payloadProduct.brand
    },
    // ✅ ENHANCED: Include both color and size options properly
    options: [
      ...(payloadProduct.colorOptions.length > 0 ? [{
        title: 'Color',
        optionValues: payloadProduct.colorOptions.map(color => color.colorName)
      }] : []),
      ...(payloadProduct.sizeOptions.length > 0 ? [{
        title: 'Size', 
        optionValues: payloadProduct.sizeOptions.map(size => size.sizeName)
      }] : [])
    ],
    designElements: {},
    colorDetails: payloadProduct.colorOptions.map(color => ({
      name: color.colorName,
      value: color.colorHex
    })),
    printingTechnology: payloadProduct.printT?.[0]?.technologyName || '',
    price: payloadProduct.pricing.suggestedRetail
  };
    
    const enhancedProductData: PayloadProductData = {
      id: payloadProduct.id.toString(),
      cost: payloadProduct.cost,
      'Manufacturer sku': payloadProduct['Manufacturer sku'], // 🔥 ADD THIS
      dimensions: {
        weight: payloadProduct.shippingInfo.weight,
        length: payloadProduct.physicalDimensions.widthInches * 2.54,
        width: payloadProduct.physicalDimensions.heightInches * 2.54,
        height: payloadProduct.physicalDimensions.depthInches * 2.54
      },
      materials: {
        primary: payloadProduct.materials.primary,
        secondary: payloadProduct.materials.construction ? [payloadProduct.materials.construction] : []
      },
      pricing: {
        suggestedRetail: payloadProduct.pricing.suggestedRetail,
        markupValue: payloadProduct.pricing.markupValue,
        costBreakdown: {
          baseCost: payloadProduct.cost,
          markup: payloadProduct.pricing.markupValue,
          total: payloadProduct.pricing.suggestedRetail
        }
      },
      fulfillmentSettings: {
        handlingTime: '2-3',
        shippingTime: '7-10',
        provider: 'JUNOONI'
      },
       shippingInfo: {
      weight: payloadProduct.shippingInfo.weight,
      shippingDimensions: payloadProduct.shippingInfo.shippingDimensions,
      shippingLocationID: payloadProduct.shippingInfo.shippingLocationID, // Correct path
      packageType: payloadProduct.shippingInfo.packageType
    },
      color_Images: payloadProduct.color_Images,
      size_Images: payloadProduct.size_Images,
      material_Images: false,
      style_Images: false
    };
    
    return { designData, enhancedProductData };
  };

  // ===== UPDATED FORM POPULATION FUNCTION =====
  const populateFormWithPayloadCMSData = (payloadProduct: PayloadCMSProduct) => {
    try {

    const locationId = getLocationId(payloadProduct);
    setDynamicLocationId(locationId);
    form.setValue('locationId', locationId);
      
      // ===== 1. BASIC PRODUCT INFORMATION =====
      
      form.setValue('title', payloadProduct.name);
     // Convert PayloadCMS description to HTML format for TipTapEditor
      const convertedDescription = convertLexicalToHtml(payloadProduct.description);
      form.setValue('description', convertedDescription);
      // form.setValue('subtitle', `${payloadProduct.brand} - ${payloadProduct.productType.replace('_', ' ')}`);
      
      const widthInCm = Math.round(payloadProduct.physicalDimensions.widthInches);
      const heightInCm = Math.round(payloadProduct.physicalDimensions.heightInches);
      const lengthInCm = Math.round(payloadProduct.physicalDimensions.depthInches);
      const weightInGrams = Math.round(payloadProduct.shippingInfo.weight);
      
      form.setValue('weight', weightInGrams.toString());
      form.setValue('length', lengthInCm.toString());
      form.setValue('width', widthInCm.toString());
      form.setValue('height', heightInCm.toString());
      
      const materialInfo = payloadProduct.materials.primary;
      form.setValue('material', materialInfo);
      form.setValue('origin_country', 'IN');
      
      const suggestedPrice = payloadProduct.pricing.suggestedRetail;
      form.setValue('defaultVariantPrice', suggestedPrice);
      //console.log("Mug/shirt Price", suggestedPrice);
      
      // ===== 5. STATUS AND SETTINGS =====
      form.setValue('status', payloadProduct.status === 'active' ? 'published' : 'proposed');
      form.setValue('discountable', true);
      
      // ===== 6. IMAGE SETTINGS =====
      const imageSettings = {
        color_Images: payloadProduct.color_Images,
        size_Images: payloadProduct.size_Images,
        material_Images: false,
        style_Images: false
      };
      
      setPayloadImageSettings(imageSettings);
      
      // const currentOptions = form.getValues('options');
      // for (let i = currentOptions.length - 1; i > 0; i--) {
      //   removeOption(i);
      // }
      
      const { shippingTime, handlingTime, rushAvailable, rushTime } = extractFulfillmentTimesFromPayload(payloadProduct);
    
    // Store the extracted data in state instead of form fields
      setPayloadFulfillmentData({
        shippingTime,
        handlingTime,
        rushAvailable,
        rushTime,
        hasData: true
      });
      // ===== COLOR OPTIONS REMOVED - NOW HANDLED BY populateFormWithDesignData =====
      
      // ===== SIZE OPTIONS ONLY =====
      // if (payloadProduct.sizeOptions && payloadProduct.sizeOptions.length > 0) {
      //   // ✅ CHECK if Size option already exists
      //   const currentOptions = form.getValues('options');
      //   const existingSizeOption = currentOptions.find(opt => 
      //     opt.title && opt.title.toLowerCase().includes('size')
      //   );
        
      //   if (!existingSizeOption) {
      //     const sizeOption = {
      //       id: generateUUID(),
      //       title: 'Size',
      //       optionValues: payloadProduct.sizeOptions.map(size => size.sizeName),
      //       imageAssociation: payloadProduct.size_Images,
      //       colorHexValues: {}
      //     };
          
      //     appendOption(sizeOption);
      //   } else {
      //     //console.log('Size option already exists, skipping duplicate');
      //   }
      // }
      
      setHasVariants(true);

const currentDetails = form.getValues('productDetails') || [];
for (let i = currentDetails.length - 1; i >= 0; i--) {
  removeProductDetail(i);
}

// Enhanced product details extraction
let existingProductDetails: string[] = [];

// STEP 1: Try to extract from features field (rich text)
if (payloadProduct.features) {
  //console.log('📝 Found features field, parsing rich text...');
  const featuresText = parsePayloadRichText(payloadProduct.features);
  if (featuresText.length > 0) {
    existingProductDetails.push(...featuresText);
    //console.log('✅ Extracted from features:', featuresText);
  }
}

// STEP 2: Extract from materials.primary 
if (payloadProduct.materials?.primary && 
    !existingProductDetails.some(detail => 
      detail.toLowerCase().includes(payloadProduct.materials.primary.toLowerCase())
    )) {
  existingProductDetails.push(payloadProduct.materials.primary);
  //console.log('✅ Added material as product detail:', payloadProduct.materials.primary);
}

// STEP 3: Add construction details if available
if (payloadProduct.materials?.construction && 
    !existingProductDetails.some(detail => 
      detail.toLowerCase().includes(payloadProduct.materials.construction.toLowerCase())
    )) {
  existingProductDetails.push(payloadProduct.materials.construction);
  //console.log('✅ Added construction detail:', payloadProduct.materials.construction);
}

// STEP 4: Try other field names as fallback
if (existingProductDetails.length === 0) {
  const detailsFields = [
    'productDetails', 'product_details', 'details', 'highlights',
    'bullet_points', 'key_features', 'specifications'
  ];

  for (const field of detailsFields) {
    if (payloadProduct[field] && Array.isArray(payloadProduct[field]) && payloadProduct[field].length > 0) {
      const fieldDetails = payloadProduct[field].map(item => {
        const detailText = typeof item === 'string' ? item : item.text || item.content || String(item);
        return detailText.trim();
      }).filter(item => item.length > 0);
      
      if (fieldDetails.length > 0) {
        existingProductDetails.push(...fieldDetails);
        break;
      }
    }
  }
}

// STEP 5: Populate form with extracted details
if (existingProductDetails.length > 0) {
  //console.log(`📝 Populating ${existingProductDetails.length} product details`);

  const uniqueDetails = [...new Set(existingProductDetails)]
    .map(detail => detail.trim())
    .filter(detail => detail.length > 0)
    .slice(0, 10);

  const replaced = uniqueDetails.map(detail => ({
    id: generateUUID(),
    text: detail,
  }));

  // ✅ Replace the entire field at once (no duplicates possible)
  form.setValue("productDetails", replaced, { shouldDirty: true, shouldTouch: true,  shouldValidate: true });

  // ✅ CRITICAL: Force a re-render by updating state
  setTimeout(() => {
    form.trigger('productDetails'); // Force validation
    //console.log("✅ Product details set and validated:", form.getValues('productDetails'));
  }, 100);

  //console.log("✅ Product details populated successfully", replaced);
} else {
  //console.log("⚠️ No product details found in PayloadCMS data");
}


// Try different possible field names for product details
const detailsFields = [
  'productDetails',
  'product_details', 
  'details',
  'features',
  'highlights',
  'bullet_points',
  'key_features'
];

for (const field of detailsFields) {
  if (payloadProduct[field] && Array.isArray(payloadProduct[field]) && payloadProduct[field].length > 0) {
    existingProductDetails = payloadProduct[field];
    break;
  } else if (payloadProduct[field] && typeof payloadProduct[field] === 'string' && payloadProduct[field].trim()) {
    // If it's a string, split by newlines or bullets
    const splitDetails = payloadProduct[field]
      .split(/\n|•|\*|-/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    if (splitDetails.length > 0) {
      existingProductDetails = splitDetails;
      break;
    }
  }
}

// Add this safety check in both population functions
const ensureValidStatus = (status: any): string => {
  const validStatuses = ['published', 'draft', 'archived', 'proposed', 'rejected'];
  if (validStatuses.includes(status)) {
    return status;
  }
  return 'proposed'; // Always fallback to draft
};

// Then use it:
form.setValue('status', ensureValidStatus('proposed'));

// if (existingProductDetails && existingProductDetails.length > 0) {
  
//   existingProductDetails.forEach(detail => {
//     const detailText = typeof detail === 'string' ? detail : detail.text || detail.content || String(detail);
//     if (detailText.trim()) {
//       appendProductDetail({ id: generateUUID(), text: detailText.trim() });
//     }
//   });
  
// } else {
// }

        let existingStory = null;

        // Try different possible field names for story/description
        const storyFields = [
          'storyBehindDesign',
          'story_behind_design',
          'product_story',
          'design_story', 
          'story',
          'long_description',
          'detailed_description',
          'brand_story',
          'inspiration',
          'design_inspiration'
        ];

        for (const field of storyFields) {
          if (payloadProduct[field] && typeof payloadProduct[field] === 'string' && payloadProduct[field].trim()) {
            existingStory = payloadProduct[field].trim();
            break;
          }
        }

        if (existingStory) {
          form.setValue('storyBehindDesign', existingStory);
        } else {
          form.setValue('storyBehindDesign', '');
        }
      
      // ===== 10. GENERATE VARIANTS WITH CORRECT PRICING =====
      setTimeout(() => {
        handleGenerateVariants();
        
        setTimeout(() => {
          const variants = form.getValues('variants');
          const correctPrice = payloadProduct.pricing.suggestedRetail;
          
          variants.forEach((_, index) => {
            form.setValue(`variants.${index}.price`, correctPrice);
            form.setValue(`variants.${index}.stock`, 10);
          });
          
          form.trigger();
        }, 800);
      }, 400);
      
      setTimeout(() => {
        form.trigger();
      }, 1000);
      
    } catch (error) {
      setError(`Failed to populate form: ${error.message}`);
    }
  };

  // ===== FORM POPULATION WITH DYNAMIC IMAGE ASSOCIATION =====
const populateFormWithDesignData = (
  data: DesignData, 
  productData?: PayloadProductData,
  directImageSettings?: ImageAssociationSettings
) => {
  try {
    //console.log('🎯 POPULATE DEBUG: Starting form population with design data');
    // Clear existing product details first to avoid duplicates when this fn is called multiple times
    const currentDetails = form.getValues('productDetails') || [];
    for (let i = currentDetails.length - 1; i >= 0; i--) {
      removeProductDetail(i);
    }

    
    const settingsToUse = directImageSettings || payloadImageSettings;
    const locationId = getLocationId(productData);
    setDynamicLocationId(locationId);
    form.setValue('locationId', locationId);
    
    // STEP 1: Basic product information
    if (data.productInfo) {
      if (data.productInfo.title) {
        form.setValue('title', data.productInfo.title);
        //console.log('🎯 POPULATE DEBUG: Set title:', data.productInfo.title);
      }
      
     if (data.productInfo.description) {
        const convertedDescription = convertLexicalToHtml(data.productInfo.description);
        form.setValue('description', convertedDescription);
      }
      
      // if (data.productInfo.brand) {
      //   form.setValue('subtitle', `By ${data.productInfo.brand}`);
      // }
    }
    
    // STEP 2: Enhanced product data
    if (productData) {
      if (productData.dimensions) {
        if (productData.dimensions.weight) {
          form.setValue('weight', productData.dimensions.weight.toString());
        }
        if (productData.dimensions.length) {
          form.setValue('length', productData.dimensions.length.toString());
        }
        if (productData.dimensions.width) {
          form.setValue('width', productData.dimensions.width.toString());
        }
        if (productData.dimensions.height) {
          form.setValue('height', productData.dimensions.height.toString());
        }
      }
      
      if (productData.materials?.primary) {
        form.setValue('material', productData.materials.primary);
      }
      
      if (productData.pricing?.suggestedRetail) {
        form.setValue('defaultVariantPrice', productData.pricing.suggestedRetail);
      }
    }
    
    // STEP 3: Basic settings
    form.setValue('status', 'proposed');
    form.setValue('discountable', true);
    
    // STEP 4: Process colors ONLY from colorDetails (selected colors)
    // STEP 4: Process ALL options from designData (colors AND sizes)
    let optionIndex = 0;

    // Handle Color Options
    if (data.colorDetails && Array.isArray(data.colorDetails) && data.colorDetails.length > 0) {
      //console.log('🎯 POPULATE DEBUG: Processing selected colors:', data.colorDetails.length);
      
      const colorHexValues: Record<string, string> = {};
      data.colorDetails.forEach(color => {
        if (color.name && color.value) {
          colorHexValues[color.name] = color.value;
        }
      });
      
      const selectedColorNames = data.colorDetails.map(color => color.name);
      
      // Update first option with color data
      form.setValue(`options.${optionIndex}.id`, generateUUID());
      form.setValue(`options.${optionIndex}.title`, 'Color');
      form.setValue(`options.${optionIndex}.optionValues`, selectedColorNames);
      form.setValue(`options.${optionIndex}.imageAssociation`, settingsToUse.color_Images);
      form.setValue(`options.${optionIndex}.colorHexValues`, colorHexValues);
      
      //console.log('🎯 POPULATE DEBUG: Set color option with values:', selectedColorNames);
      optionIndex++;
    }

    // ✅ FIXED: Handle Size Options from designData.options
    // Handle Size Options from designData.option
    // Handle Size Options - Clear and rebuild approach
    if (data.options && Array.isArray(data.options)) {
      const sizeOption = data.options.find(opt => 
        opt.title && opt.title.toLowerCase().includes('size')
      );
      
      if (sizeOption && sizeOption.optionValues && sizeOption.optionValues.length > 0) {
        //console.log('🎯 POPULATE DEBUG: Processing size option:', sizeOption.optionValues.length, 'sizes');
        
        const currentOptions = form.getValues('options');
        
        // ✅ SIMPLE FIX: Filter out any existing size options first
        const nonSizeOptions = currentOptions.filter(opt => 
          !opt.title || !opt.title.toLowerCase().includes('size')
        );
        
        const newSizeOption = {
          id: generateUUID(),
          title: 'Size',
          optionValues: [...sizeOption.optionValues],
          imageAssociation: settingsToUse.size_Images,
          colorHexValues: {}
        };
        
        // Add the single size option
        const updatedOptions = [...nonSizeOptions, newSizeOption];
        
        form.setValue('options', updatedOptions, { shouldValidate: false, shouldTouch: false });
        
        //console.log('🎯 POPULATE DEBUG: Rebuilt options with single size option');
        //console.log('🎯 POPULATE DEBUG: Total options:', updatedOptions.length);
      }
    }
    setHasVariants(true);
    
    // STEP 5: Generate variants with delay to ensure options are set
    setTimeout(() => {
      //console.log('🎯 POPULATE DEBUG: Generating variants');
      try {
        handleGenerateVariants();
        
        // Set pricing after variants are generated
        setTimeout(() => {
          const variants = form.getValues('variants');
          const priceToApply = productData?.pricing?.suggestedRetail || 
                              (productData?.cost ? Math.round(productData.cost * 2.5) : 
                              data.price || 25.00);
          
          if (variants && variants.length > 0) {
            variants.forEach((_, index) => {
              form.setValue(`variants.${index}.price`, priceToApply);
              form.setValue(`variants.${index}.stock`, 10);
            });
            //console.log('🎯 POPULATE DEBUG: Variant prices set');
          }
        }, 1000);
      } catch (variantError) {
        //console.error('🎯 POPULATE ERROR: Variant generation failed:', variantError);
      }
    }, 1000);
    
    //console.log('🎯 POPULATE DEBUG: Form population completed successfully');
    
  } catch (error) {
    //console.error('🎯 POPULATE ERROR: Form population failed:', error);
    setError(`Failed to populate form: ${error.message}`);
  }
};

  // ===== FALLBACK: DIRECT MOCKUP PROCESSING =====
  // REPLACE your processMockupImagesDirectly function with this version
// UPDATE processMockupImagesDirectly signature
const processMockupImagesDirectly = async (
  mockupImages: Record<string, string>,
  designData: DesignData,
  directImageSettings?: ImageAssociationSettings,
  extractedAreas?: string[] // 🔥 ADD THIS PARAMETER
) => {
  try {
    const areasToUse = extractedAreas || availableAreas;
    //console.log('🔄 Processing mockup images directly with areas:', areasToUse);
    //console.log('🔄 Mockup keys to process:', Object.keys(mockupImages));
    
    const settingsToUse = directImageSettings || payloadImageSettings;
    
    const shouldDeduplicateByColor = settingsToUse.color_Images && !settingsToUse.size_Images;
    
    if (shouldDeduplicateByColor) {
      return await processSharedImagesByColor(mockupImages, designData, settingsToUse, areasToUse);
    } else {
      return await processIndividualImages(mockupImages, designData, settingsToUse, areasToUse);
    }
    
  } catch (error) {
    //console.error('❌ Error in processMockupImagesDirectly:', error);
    setError('Failed to process mockup images from designer');
  }
};

// UPDATE processSharedImagesByColor to include area information
const processSharedImagesByColor = async (
  mockupImages: Record<string, string>,
  designData: DesignData,
  imageSettings: ImageAssociationSettings,
  extractedAreas?: string[] // 🔥 ADD THIS PARAMETER
) => {

  //console.log('🔥 INCOMING mockupImages keys:', Object.keys(mockupImages));
  //console.log('🔥 Total mockupImages:', Object.keys(mockupImages).length);
  const areasToUse = extractedAreas || availableAreas;
  //console.log('🔥 processSharedImagesByColor called with:', Object.keys(mockupImages).length, 'images');
  //console.log('🏗️ Available areas for processing:', areasToUse);
  
  const imagesByColorAndArea: Record<string, Record<string, { key: string; data: string; allKeys: string[] }>> = {};
  
  // STEP 1: Group images by BOTH color AND area, then deduplicate
  for (const [variantKey, imageData] of Object.entries(mockupImages)) {
    if (!imageData || !imageData.startsWith('data:')) continue;
    
    // 🔥 PASS THE EXTRACTED AREAS
    const parsedInfo = parseVariantKeyEnhanced(variantKey, designData, areasToUse);
    const colorName = parsedInfo.colorName;
    const areaName = parsedInfo.areaName || 'unknown';

    // ADD THIS DEBUG:
    // console.log(`🔍 Parsing "${variantKey}":`, {
    //   extracted: parsedInfo,
    //   availableSizes: designData.options?.find(o => o.title.toLowerCase().includes('size'))?.optionValues
    // });
    
    //console.log(`🔥 Processing variant key: ${variantKey} -> Color: ${colorName}, Area: ${areaName}`);
    
    if (!imagesByColorAndArea[colorName]) {
      imagesByColorAndArea[colorName] = {};
    }
    
    if (!imagesByColorAndArea[colorName][areaName]) {
      imagesByColorAndArea[colorName][areaName] = {
        key: variantKey,
        data: imageData,
        allKeys: [variantKey]
      };
    } else {
      // Just add to allKeys for metadata, but don't create duplicate image
      imagesByColorAndArea[colorName][areaName].allKeys.push(variantKey);
      //console.log(`🔥 Skipping duplicate for color: ${colorName}, area: ${areaName}`);
    }
  }
  
  // console.log('🔥 Final grouped colors and areas:', 
  //   Object.keys(imagesByColorAndArea).map(color => 
  //     `${color}: [${Object.keys(imagesByColorAndArea[color]).join(', ')}]`
  //   )
  // );
  
  const processedImages: MediaItem[] = [];
  let currentRank = 1000; // Start after design images
  
  // STEP 2: Create exactly ONE shared image per color-area combination
  for (const [colorName, areaGroups] of Object.entries(imagesByColorAndArea)) {
    for (const [areaName, group] of Object.entries(areaGroups)) {
      try {
        //console.log(`🔥 Creating shared image for color: ${colorName}, area: ${areaName}, covering ${group.allKeys.length} variants`);
        
        const fileName = `mockup-${areaName}-${colorName.toLowerCase()}-shared.png`;
        
        const processedImage = await processBase64ToFile(
          group.data,
          fileName,
          colorName
        );
        
        if (!processedImage) {
          //console.log(`🔥 Failed to process image for color: ${colorName}, area: ${areaName}`);
          continue;
        }
        
        // Get all size values that this shared image covers
        const coversSizes = getSizesFromKeys(group.allKeys, designData);
        
        const variantInfo = {
          optionName: 'Color',
          optionValues: [colorName],
          isSharedAcrossSizes: true,
          coversSizes: coversSizes
        };
        
        const mediaItem: MediaItem = {
          file: processedImage.file,
          url: processedImage.url,
          rank: currentRank++,
          isNew: true,
          variantInfo: variantInfo,
          colorValue: colorName,
          metadata: {
            isSharedImage: true, // CRITICAL: Mark as shared
            originalVariantKey: group.key,
            sharingStrategy: 'color_specific_size_shared',
            imageHash: `shared_${colorName}_${areaName}`,
            extractedColorName: colorName,
            extractedSizeName: undefined, // No specific size
            extractedAreaName: areaName, // 🔥 STORE AREA NAME
            payloadSettings: { ...imageSettings },
            allCoveredKeys: group.allKeys,
            
            // Add deduplication metadata
            isDeduplicated: true,
            originalVariantCount: group.allKeys.length,
            
            debugInfo: {
              strategy: 'shared_by_color_and_area',
              representativeKey: group.key,
              totalVariantsCovered: group.allKeys.length,
              coveredKeys: group.allKeys,
              deduplicationApplied: true,
              area: areaName
            }
          }
        };
        
        processedImages.push(mediaItem);
        //console.log(`🔥 Created media item for color: ${colorName}, area: ${areaName} with ${group.allKeys.length} covered variants`);
        
      } catch (error) {
        //console.error(`🔥 Error processing color: ${colorName}, area: ${areaName}`, error);
      }
    }
  }
  
  //console.log(`🔥 Total processed images: ${processedImages.length}`);
  
  if (processedImages.length > 0) {
    setMediaItems(prev => {
      // Filter out any existing shared images for the same colors to prevent duplicates
      const existingNonShared = prev.filter(item => !item.metadata?.isSharedImage);
      
      // Add new shared images
      const combined = [...existingNonShared, ...processedImages];
      
      //console.log(`🔥 Setting mediaItems with ${combined.length} total items`);
      //console.log(`🔥 Shared images in result: ${combined.filter(item => item.metadata?.isSharedImage).length}`);
      
      return combined;
    });
    
    setTimeout(() => setActiveImageTab('upload'), 100);
    
    processedImages.forEach((item, index) => {
      // console.log(`🔥 Final shared image ${index + 1}:`, {
      //   colorName: item.colorValue,
      //   areaName: item.metadata?.extractedAreaName,
      //   fileName: item.file?.name,
      //   coveredVariants: item.metadata?.allCoveredKeys?.length || 0
      // });
    });
  } else {
    setError('Failed to create any shared images. Check console for details.');
  }
};
setTimeout(() => {
  debugImagesByColor();
}, 3000);



  const extractColorFromVariantKey = (variantKey: string, designData: DesignData): string => {
    
    const colorMatcher = createColorMatcher(designData);
    return colorMatcher.matchColor(variantKey);
  };

  const getSizesFromKeys = (keys: string[], designData: DesignData): string[] => {
    const sizes = new Set<string>();
    
    const availableSizes = designData.options?.find(opt => 
      opt.title.toLowerCase().includes('size')
    )?.optionValues || [];
    
    keys.forEach(key => {
      const parts = key.split(/[-_\s]+/).filter(p => p.length > 0);
      parts.forEach(part => {
        const matchingSize = availableSizes.find(size => 
          size.toLowerCase() === part.toLowerCase()
        );
        if (matchingSize) {
          sizes.add(matchingSize);
        }
      });
    });
    
    return Array.from(sizes);
  };

  // UPDATE the processIndividualImages function 
// REPLACE your processIndividualImages function
const processIndividualImages = async (
  mockupImages: Record<string, string>,
  designData: DesignData,
  imageSettings: ImageAssociationSettings,
  extractedAreas?: string[]
) => {
  const areasToUse = extractedAreas || availableAreas;
  //console.log('🔄 Processing individual images:', Object.keys(mockupImages));
  //console.log('🏗️ Using available areas:', availableAreas);
  
  const processedImages: MediaItem[] = [];
  let currentRank = 0;
  
  for (const [variantKey, imageDataUrl] of Object.entries(mockupImages)) {
    if (!imageDataUrl || !imageDataUrl.startsWith('data:')) continue;
    
   try {
      // 🔥 PASS the extracted areas
      const parsedInfo = parseVariantKeyEnhanced(variantKey, designData, areasToUse);
    console.log('🔍 Parsing result for', variantKey, ':', {
    extracted: parsedInfo,
    availableSizes: isSizeOption?.optionValues,
    keyParts: variantKey.split(/[-_]+/)
  });
      
      //console.log(`🔍 Processing ${variantKey}:`, parsedInfo);
      
      const fileName = parsedInfo.sizeName 
        ? `mockup-${parsedInfo.areaName || 'unknown'}-${parsedInfo.colorName.toLowerCase()}-${parsedInfo.sizeName.toLowerCase()}.png`
        : `mockup-${parsedInfo.areaName || 'unknown'}-${parsedInfo.colorName.toLowerCase()}.png`;
      
      const processedImage = await processBase64ToFile(
        imageDataUrl,
        fileName,
        parsedInfo.colorName
      );
      
      if (!processedImage) {
        //console.log(`❌ Failed to process image for ${variantKey}`);
        continue;
      }
      
      // const variantInfo = createVariantInfoStructure(
      //   { colorName: parsedInfo.colorName, sizeName: parsedInfo.sizeName },
      //   imageSettings
      // );

      const variantInfo = (() => {
      // Determine primary tag based on settings AND what data we have
      if (imageSettings.size_Images && parsedInfo.sizeName) {
        // Size images enabled and we have size data - make Size primary
        return {
          optionName: 'Size',
          optionValues: [parsedInfo.sizeName],
          secondaryOptionName: 'Color',
          secondaryOptionValues: [parsedInfo.colorName]
        };
      } else if (imageSettings.color_Images && parsedInfo.colorName) {
        console.warn(`⚠️ Missing size for image: ${fileName}, falling back to Color primary`);
        // Color images enabled and we have color data - make Color primary
        return {
          optionName: 'Color',
          optionValues: [parsedInfo.colorName],
          ...(parsedInfo.sizeName ? {
            secondaryOptionName: 'Size',
            secondaryOptionValues: [parsedInfo.sizeName]
          } : {})
        };
      } else {
        // Fallback to existing logic
        return createVariantInfoStructure(
          { colorName: parsedInfo.colorName, sizeName: parsedInfo.sizeName },
          imageSettings
        );
      }
    })();
      
      const mediaItem: MediaItem = {
        file: processedImage.file,
        url: processedImage.url,
        rank: currentRank++,
        isNew: true,
        variantInfo: variantInfo,
        colorValue: parsedInfo.colorName,
        metadata: {
          isSharedImage: false,
          originalVariantKey: variantKey,
          sharingStrategy: determineSharingStrategy(imageSettings),
          imageHash: variantKey,
          extractedColorName: parsedInfo.colorName,
          extractedSizeName: parsedInfo.sizeName,
          extractedAreaName: parsedInfo.areaName, // 🔥 STORE AREA NAME
          payloadSettings: { ...imageSettings }
        }
      };
      
      processedImages.push(mediaItem);
      //console.log(`✅ Processed: ${variantKey} -> Area: ${parsedInfo.areaName}, Color: ${parsedInfo.colorName}, Size: ${parsedInfo.sizeName || 'shared'}`);
      
    } catch (error) {
      //console.error(`❌ Error processing ${variantKey}:`, error);
    }
  }
  
  //console.log(`🎯 Total processed images: ${processedImages.length}`);
  
  // Log images by area for debugging
  const imagesByArea = processedImages.reduce((acc, item) => {
    const area = item.metadata?.extractedAreaName || 'unknown';
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  //console.log('📊 Processed images by area:', imagesByArea);
  
  setMediaItems(prev => {
    const combined = [...prev, ...processedImages];
    //console.log('🔄 Updated mediaItems, total count:', combined.length);
    return combined;
  });

  setTimeout(() => setActiveImageTab('upload'), 100);
};

  // ===== ENHANCED VARIANT KEY PARSING =====
  // REPLACE the existing parseVariantKeyEnhanced function with this enhanced version
// REPLACE the parseVariantKeyEnhanced function with this dynamic version
// REPLACE the parseVariantKeyEnhanced function with this improved version:
const parseVariantKeyEnhanced = (variantKey: string, designData: DesignData, dynamicAreas: string[] = []) => {
  //console.log('🔍 Parsing variant key:', variantKey);
  
  // Split by both underscores AND hyphens
  const parts = variantKey.split(/[-_]+/).filter(part => part.length > 0);  
  //console.log('🔍 Key parts:', parts);
  
  let colorName = 'Unknown';
  let sizeName: string | undefined = undefined;
  let areaName: string | undefined = undefined;
  
  const colorMatcher = createColorMatcher(designData);
  
  const sizeOption = designData.options?.find(opt => 
    opt.title.toLowerCase().includes('size')
  );
  
  // console.log('🔍 Available sizes:', sizeOption?.optionValues);
  // console.log('🔍 Available colors:', colorMatcher.getAllColorNames());
  // console.log('🔍 Available areas:', dynamicAreas);
  
  const availableAreasLower = dynamicAreas.map(area => area.toLowerCase());
  
  // Extract area
  for (const part of parts) {
    const partLower = part.toLowerCase();
    if (availableAreasLower.includes(partLower)) {
      areaName = partLower;
      //console.log('✅ Found area:', areaName);
      break;
    }
  }
  
  // Extract color
  for (const part of parts) {
    const matchedColor = colorMatcher.matchColor(part);
    if (matchedColor !== 'Unknown') {
      colorName = matchedColor;
      //console.log('✅ Found color:', colorName);
      break;
    }
  }
  
  // Extract size with flexible matching
  if (sizeOption?.optionValues) {
    // Try exact match first
    for (const part of parts) {
      const matchingSize = sizeOption.optionValues.find(size => 
        size.toLowerCase() === part.toLowerCase()
      );
      if (matchingSize) {
        sizeName = matchingSize;
        //console.log('✅ Found size (exact):', sizeName);
        break;
      }
    }
    
    // If no exact match, try partial matching for compound names like "galaxy_5" -> "Galaxy 5"
    if (!sizeName) {
      for (const sizeValue of sizeOption.optionValues) {
        // Normalize both: remove spaces/underscores, lowercase
        const normalizedSize = sizeValue.toLowerCase().replace(/[\s_-]+/g, '');
        
        // Check if any combination of consecutive parts matches
        for (let i = 0; i < parts.length - 1; i++) {
          const combined = (parts[i] + parts[i + 1]).toLowerCase();
          if (combined === normalizedSize) {
            sizeName = sizeValue;
            //console.log('✅ Found size (combined):', sizeName, 'from parts:', parts[i], parts[i + 1]);
            break;
          }
        }
        
        if (sizeName) break;
      }
    }
  }
  
  //console.log('🎯 Final parsed result:', { colorName, sizeName, areaName });
  return { colorName, sizeName, areaName };
};

  // ===== VARIANT GENERATION =====
  const handleGenerateVariants = useCallback(() => {
    const currentOptions = form.getValues('options');
    
    const validOptions = currentOptions.filter(opt => 
      opt.title && Array.isArray(opt.optionValues) && opt.optionValues.length > 0
    );
    
    if (validOptions.length > 0) {
      const parsedOptions = validOptions.map((opt) => ({
        optionId: opt.id || generateUUID(),
        optionName: opt.title,
        optionValues: opt.optionValues,
      }));
      
      const currentVariants = form.getValues('variants');
      
      const newVariants = generateVariantsFromOptions(parsedOptions);
      
      const variantsWithExistingData = newVariants.map(newVariant => {
        const existingVariant = currentVariants.find(existing => {
          if (!existing.optionValues || 
              !Array.isArray(existing.optionValues) || 
              existing.optionValues.length !== newVariant.optionValues.length) return false;
          
          const allValuesMatch = newVariant.optionValues.every(newOptVal => 
            existing.optionValues.some(existingOptVal => 
              existingOptVal.optionName === newOptVal.optionName && 
              existingOptVal.value === newOptVal.value
            )
          );
          
          return allValuesMatch;
        });
        
        if (existingVariant) {
          return {
            ...existingVariant,
            title: newVariant.title,
            optionValues: newVariant.optionValues.map(newOptVal => {
              const matchingExistingOptVal = existingVariant.optionValues.find(
                existingOptVal => existingOptVal.optionName === newOptVal.optionName && 
                                  existingOptVal.value === newOptVal.value
              );
              
              return {
                optionId: matchingExistingOptVal?.optionId || newOptVal.optionId,
                optionName: newOptVal.optionName,
                value: newOptVal.value
              };
            }),
          };
        }
        
        return newVariant;
      });
      
      replaceVariants(variantsWithExistingData);
    } else {
      replaceVariants([]);
    }
  }, [form, replaceVariants]);

  // Add this debugging function to see what images you actually have
const debugMediaItemsByArea = () => {
  //console.log('🔍 DEBUGGING: Current mediaItems by area:');
  
  const mockupImages = mediaItems.filter(item => {
    const isDesign = item.metadata?.isRawDesignImage === true || 
                   item.variantInfo?.isRawDesignImage === true ||
                   item.metadata?.debugInfo?.source === 'canvas_design_element';
    return !isDesign;
  });
  
  //console.log('Total mockup images:', mockupImages.length);
  
  const byArea = mockupImages.reduce((acc, item) => {
    const area = item.metadata?.extractedAreaName || 'unknown';
    if (!acc[area]) acc[area] = [];
    acc[area].push({
      originalKey: item.metadata?.originalVariantKey,
      fileName: item.file?.name,
      color: item.colorValue,
      size: item.metadata?.extractedSizeName,
      isShared: item.metadata?.isSharedImage
    });
    return acc;
  }, {} as Record<string, any[]>);
  
  Object.entries(byArea).forEach(([area, images]) => {
    //console.log(`📍 Area "${area}": ${images.length} images`);
    images.forEach((img, i) => {
      //console.log(`  ${i + 1}. ${img.fileName} (${img.originalKey})`);
    });
  });
  
  return byArea;
};

// Call this after your image processing to see what you actually have
setTimeout(() => {
  debugMediaItemsByArea();
}, 2000);

  // ===== FILE HANDLING =====
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    variantInfo: VariantInfo | null = null
  ): void => {
    try {
      if (e.target.files && e.target.files.length > 0) {
        const newMedia = Array.from(e.target.files).map((file, index) => {
          const mediaItem: MediaItem = {
            file,
            url: URL.createObjectURL(file),
            rank: mediaItems.length + index,
            isNew: true
          };
          
          if (variantInfo) {
            if (variantInfo.variantId) {
              mediaItem.variantInfo = {
                variantId: variantInfo.variantId
              };
            } else if (variantInfo.optionName && variantInfo.optionValues?.[0]) {
              mediaItem.variantInfo = {
                optionName: variantInfo.optionName,
                optionValues: [variantInfo.optionValues[0]]
              };
              
              if (isColorOption(variantInfo.optionName)) {
                mediaItem.colorValue = variantInfo.optionValues[0];
                
              }
            }
          }
          
          return mediaItem;
        });
        
        setMediaItems((prev) => [...prev, ...newMedia]);
        
        if (e.target) {
          e.target.value = '';
        }
      }
    } catch (error) {
      if (e.target) {
        e.target.value = '';
      }
      
      alert("Error uploading files. Please try again.");
    }
  };

  // ===== HELPER FUNCTIONS FOR IMAGE MANAGEMENT =====

  const debugImagesByColor = () => {
  const mockupImages = mediaItems.filter(item => {
    const isDesign = item.metadata?.isRawDesignImage === true || 
                   item.variantInfo?.isRawDesignImage === true;
    return !isDesign;
  });
  
  // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  // console.log('📊 DEBUG: All Mockup Images by Color');
  // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const byColor = mockupImages.reduce((acc, item) => {
    const color = item.colorValue || item.metadata?.extractedColorName || 'Unknown';
    if (!acc[color]) acc[color] = [];
    acc[color].push({
      fileName: item.file?.name,
      area: item.metadata?.extractedAreaName,
      isShared: item.metadata?.isSharedImage,
      url: item.url.substring(0, 50)
    });
    return acc;
  }, {} as Record<string, any[]>);
  
  Object.entries(byColor).forEach(([color, images]) => {
    //console.log(`\n🎨 Color: ${color} (${images.length} images)`);
    images.forEach((img, i) => {
      //console.log(`  ${i + 1}. ${img.fileName} [${img.area}] ${img.isShared ? '(SHARED)' : ''}`);
    });
  });
  
  //console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

  const getImageAssociatedOptions = () => {
    const currentOptions = form.getValues('options');
    return currentOptions.filter(opt => 
      opt.title && 
      opt.optionValues && 
      opt.optionValues.length > 0 && 
      shouldOptionHaveImages(opt.title, payloadImageSettings)
    );
  };
  
  const [imageAssociatedOptions, setImageAssociatedOptions] = useState<Option[]>([]);
  
  useEffect(() => {
    const subscription = form.watch((formValues, { name, type }) => {
      if (name && (name.includes('options') || name.includes('imageAssociation'))) {
        const newImageAssociatedOptions = getImageAssociatedOptions();
        setImageAssociatedOptions(newImageAssociatedOptions);
        
      }
    });
    
    setImageAssociatedOptions(getImageAssociatedOptions());
    
    return () => subscription.unsubscribe();
  }, [form, payloadImageSettings]);

  // ✅ ADD: Temporary debug effect to track option changes
useEffect(() => {
  const currentOptions = form.getValues('options');
  //console.log('👀 WATCH: Options changed, current count:', currentOptions.length);
  currentOptions.forEach((opt, index) => {
    // console.log(`👀 WATCH: Option ${index}:`, {
    //   title: opt.title,
    //   valueCount: opt.optionValues?.length || 0,
    //   values: opt.optionValues
    // });
  });
}, [form.watch('options')]);

  // useEffect(() => {
  //   const currentOptions = form.getValues('options');
    
  //   const validOptions = currentOptions.filter(opt => 
  //     opt.title && opt.title.trim() !== '' && 
  //     opt.optionValues && 
  //     Array.isArray(opt.optionValues) && 
  //     opt.optionValues.length > 0
  //   );
    
  //   if (currentOptions.length > validOptions.length + 1) {
      
  //     for (let i = currentOptions.length - 1; i > validOptions.length; i--) {
  //       removeOption(i);
  //     }
  //   }
    
  //   if (currentOptions.length > 3) {
  //     for (let i = currentOptions.length - 1; i >= 3; i--) {
  //       removeOption(i);
  //     }
  //   }
  // }, [form.watch('options')]);

  // ===== ADDITIONAL HELPER FUNCTIONS =====

  // ADD this new function to group images by area
// UPDATE getImagesByArea to show all dynamic areas
const getImagesByArea = (): Record<string, MediaItem[]> => {
  const mockupImages = mediaItems.filter(item => {
    const isDesign = item.metadata?.isRawDesignImage === true || 
                   item.variantInfo?.isRawDesignImage === true ||
                   item.metadata?.debugInfo?.source === 'canvas_design_element';
    return !isDesign;
  });

  const imagesByArea: Record<string, MediaItem[]> = {};
  
  // 🔥 NEW: Only initialize areas that we extracted (which have elements)
  const areasWithElements = availableAreas; // This now only contains areas WITH elements
  
  areasWithElements.forEach(area => {
    imagesByArea[area] = [];
  });
  
  mockupImages.forEach(item => {
    const area = item.metadata?.extractedAreaName || 'unknown';
    
    // 🔥 NEW: Only add to imagesByArea if area is in our filtered list
    if (areasWithElements.includes(area)) {
      if (!imagesByArea[area]) {
        imagesByArea[area] = [];
      }
      imagesByArea[area].push(item);
    }
  });

  // console.log('📊 Images by area (filtered):', 
  //   Object.keys(imagesByArea).map(area => `${area}: ${imagesByArea[area].length}`)
  // );
  
  // 🔥 NEW: Remove any areas that ended up with 0 images
  Object.keys(imagesByArea).forEach(area => {
    if (imagesByArea[area].length === 0) {
      delete imagesByArea[area];
    }
  });
  
  return imagesByArea;
};

  const handleAddOptionValue = (optionIndex: number) => {
    const value = newOptionValues[optionIndex];
    if (!value || value.trim() === '') return;
    
    const currentOptions = form.getValues('options');
    const currentOption = currentOptions[optionIndex];
    
    const currentValues = Array.isArray(currentOption.optionValues) 
      ? currentOption.optionValues 
      : [];
    
    if (!currentValues.includes(value)) {
      const updatedValues = [...currentValues, value];
      
      updateOption(optionIndex, {
        ...currentOption,
        optionValues: updatedValues
      });
      
      const updatedNewValues = { ...newOptionValues };
      updatedNewValues[optionIndex] = '';
      setNewOptionValues(updatedNewValues);
      
      handleGenerateVariants();
    }
  };

  const handleNewOptionValueChange = (optionIndex: number, value: string) => {
    setNewOptionValues(prev => ({
      ...prev,
      [optionIndex]: value
    }));
  };

  const handleVariantFieldChange = (variantIndex: number, field: string, value: any) => {
    const currentVariants = form.getValues('variants');
    const currentVariant = currentVariants[variantIndex];
    
    const updatedVariant = JSON.parse(JSON.stringify(currentVariant));
    updatedVariant[field] = value;
    
    updateVariant(variantIndex, updatedVariant);
  };

  const handleBulkEdit = (field: string, value: any) => {
    if (!selectedVariants.length) return;
    
    const currentVariants = form.getValues('variants');
    
    selectedVariants.forEach(variantId => {
      const variantIndex = currentVariants.findIndex(v => v.id === variantId);
      if (variantIndex !== -1) {
        handleVariantFieldChange(variantIndex, field, value);
      }
    });
    
    if (field === 'price') setBulkPrice('');
    if (field === 'stock') setBulkStock('');
  };

  const handleSelectAllVariants = (checked: boolean) => {
    if (checked) {
      const allVariantIds = form.getValues('variants').map(v => v.id);
      setSelectedVariants(allVariantIds);
    } else {
      setSelectedVariants([]);
    }
  };

  const handleToggleVariantSelection = (variantId: string) => {
    setSelectedVariants(prev => {
      if (prev.includes(variantId)) {
        return prev.filter(id => id !== variantId);
      } else {
        return [...prev, variantId];
      }
    });
  };

  const handleDuplicateVariant = (variantIndex: number) => {
    const currentVariants = form.getValues('variants');
    const variantToDuplicate = currentVariants[variantIndex];
    
    const newVariant = {
      ...JSON.parse(JSON.stringify(variantToDuplicate)),
      id: generateUUID(),
      sku: generateUniqueSku(`${variantToDuplicate.title}-copy`),
      title: `${variantToDuplicate.title} (Copy)`
    };
    
    const updatedVariants = [...currentVariants];
    updatedVariants.splice(variantIndex + 1, 0, newVariant);
    
    replaceVariants(updatedVariants);
  };

  
  const getVariantAssociatedImages = (variant: Variant, mediaItems: MediaItem[]): {id: string, url: string}[] => {
    if (!variant.optionValues || !Array.isArray(variant.optionValues)) {
      return [];
    }
    
    const associatedImages: {id: string, url: string}[] = [];
    
    const directVariantImages = mediaItems.filter(item => 
      item.variantInfo?.variantId === variant.id
    );
    
    directVariantImages.forEach(item => {
      if (item.url && item.id) {
        const exists = associatedImages.some(img => img.id === item.id);
        if (!exists) {
          associatedImages.push({ id: item.id, url: item.url });
        }
      }
    });
    
    variant.optionValues.forEach(optVal => {
      const optionValueImages = mediaItems.filter(item => {
        return item.variantInfo?.optionName && 
          item.variantInfo.optionName.toLowerCase() === optVal.optionName.toLowerCase() && 
          item.variantInfo?.optionValues?.includes(optVal.value);
      });
        
      optionValueImages.forEach(item => {
        if (item.url && item.id) {
          const exists = associatedImages.some(img => img.id === item.id);
          if (!exists) {
            associatedImages.push({ id: item.id, url: item.url });
          }
        }
      });
    });
    
    return associatedImages;
  };

  const handleAddProductDetail = () => {
    appendProductDetail({ id: generateUUID(), text: '' });
  };

  const handleDropzoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAddImageUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!newImageUrl.trim()) return;
    
    try {
      new URL(newImageUrl);
      
      setMediaItems((prev) => [
        ...prev,
        {
          file: undefined,
          url: newImageUrl,
          rank: prev.length,
          isNew: true
        }
      ]);
      
      setNewImageUrl('');
      
    } catch (error) {
      setError('Please enter a valid URL');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate({ to: '/productCatalog' });
  };

  // ===== EFFECTS FOR MONITORING CHANGES =====
  // useEffect(() => {
  //   const subscription = form.watch((formValues, { name, type }) => {
  //     if (name && 
  //         name.startsWith('options.') && 
  //         name.includes('optionValues') && 
  //         type === 'change') {
        
        
  //       const currentOptions = form.getValues('options');
        
  //       if (currentOptions.length === 1) {
  //         const firstOption = currentOptions[0];
  //         const hasTitle = firstOption?.title && firstOption.title.trim() !== '';
  //         const hasValues = firstOption?.optionValues && 
  //                          Array.isArray(firstOption.optionValues) && 
  //                          firstOption.optionValues.length > 0;
          
  //         if (hasTitle && hasValues) {
  //           appendOption({ 
  //             id: generateUUID(),
  //             title: '', 
  //             optionValues: [],
  //             imageAssociation: false
  //           });
  //         }
  //       }
        
  //       setTimeout(() => {
  //         handleGenerateVariants();
  //       }, 300);
  //     }
  //   });
    
  //   return () => subscription.unsubscribe();
  // }, [appendOption, form, handleGenerateVariants]);

  // ✅ REPLACE WITH THIS SIMPLER VERSION
useEffect(() => {
  const subscription = form.watch((formValues, { name, type }) => {
    // Only handle option value changes, not other form changes
    if (name && 
        name.startsWith('options.') && 
        name.includes('optionValues') && 
        type === 'change' &&
        !isSubmittingForm) { // Don't trigger during form submission
      
      //console.log('🎯 OPTIONS DEBUG: Option values changed:', name);
      
      // Debounce variant generation to prevent excessive calls
      clearTimeout(window.variantGenerationTimeout);
      window.variantGenerationTimeout = setTimeout(() => {
        try {
          //console.log('🎯 OPTIONS DEBUG: Regenerating variants');
          handleGenerateVariants();
        } catch (error) {
          //console.error('🎯 OPTIONS ERROR: Variant generation failed:', error);
        }
      }, 500);
    }
  });
  
  return () => {
    subscription.unsubscribe();
    if (window.variantGenerationTimeout) {
      clearTimeout(window.variantGenerationTimeout);
    }
  };
}, [form, handleGenerateVariants, isSubmittingForm]);


  useEffect(() => {
    const initialOptionValues: Record<number, string> = {};
    optionFields.forEach((_, index) => {
      initialOptionValues[index] = '';
    });
    setNewOptionValues(initialOptionValues);
  }, [optionFields.length]);

  useEffect(() => {
    return () => {
      mediaItems.forEach((item) => {
        if (item.file) URL.revokeObjectURL(item.url);
      });
    };
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      setCategoryError(null);
      try {
        const response = await fetchCategories();
        
        if (!response) {
          throw new Error('Failed to fetch categories');
        }
        
        const jsonData = await response.json();
        
        if (jsonData && jsonData.product_categories) {
          setProductCategories(jsonData.product_categories);
        } else {
          setCategoryError('Received invalid category data from server');
        }
      } catch (error) {
        setCategoryError('Failed to load categories. Please try again.');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, []);

useEffect(() => {
  // Early return if there's no location state to process
  if (!location.state) return;

  // If we've already populated once this mount, skip (extra safety in addition to hasProcessedInitialData)
  if (didPopulateRef.current) {
    //console.log('🚫 Skipping population — already processed for this mount');
    return;
  }

  // Timer handle so we can clear it if component unmounts or deps change
  let timer: ReturnType<typeof setTimeout> | null = null;

  const processLocationState = async () => {
    //console.log('🎯 CREATE DEBUG: Starting location state processing (effect)');

    // We'll only mark hasProcessedInitialData = true after successful full processing
    try {
      const locationState = location.state as LocationState;
      //console.log('🎯 CREATE DEBUG: Location state found:', locationState);
       //console.log('🔍 Checking for areas in location state:');
      //console.log('- availableMockups:', locationState.availableMockups?.all_available_areas);
      //console.log('- imageAreaAnalysis:', locationState.imageAreaAnalysis?.all_available_areas);
      //console.log('- designElements:', locationState.designData?.designElements ? Object.keys(locationState.designData.designElements) : 'not found');
      //console.log('- canvasImages areas:', locationState.canvasImages?.map(c => c.area_id));
      //console.log('- mockupImages sample keys:', locationState.mockupImages ? Object.keys(locationState.mockupImages).slice(0, 3) : 'not found');
      
      const extractedAreas = extractAvailableAreas(locationState);
      setAvailableAreas(extractedAreas);

      // STEP 1: Extract pre-generated images first
      const hasPreGeneratedImages = extractAndStorePreGeneratedImages(locationState);

      // STEP 2: Process canvas images
      if (locationState.canvasImages && Array.isArray(locationState.canvasImages)) {
        //console.log('🎯 CREATE DEBUG: Found', locationState.canvasImages.length, 'canvas images');
        setImportedCanvasImages(locationState.canvasImages);
      }

      // STEP 3: Process design images ONLY if they exist
      if (locationState.designImages && Array.isArray(locationState.designImages) && locationState.designImages.length > 0) {
        //console.log('🎯 CREATE DEBUG: Processing', locationState.designImages.length, 'design images');
        await processDesignImagesArray(locationState.designImages);
      }

      // STEP 4: Set design data and enhanced product data (do not populate form yet)
      if (locationState.designData) {
        //console.log('🎯 CREATE DEBUG: Setting design data');
        setDesignData(locationState.designData);
        setEnhancedProductData(locationState.enhancedProductData);

        const imageSettings = {
          color_Images: locationState.enhancedProductData?.color_Images || false,
          size_Images: locationState.enhancedProductData?.size_Images || false,
          material_Images: locationState.enhancedProductData?.material_Images || false,
          style_Images: locationState.enhancedProductData?.style_Images || false
        };

        setPayloadImageSettings(imageSettings);

        // STEP 5: Delay population slightly so prior async processing can complete
        timer = setTimeout(() => {
          // Prevent duplicate population if something else raced in
          if (didPopulateRef.current) {
            //console.log('🎯 CREATE DEBUG: Skipping duplicate form population (timer)');
            return;
          }

          //console.log('🎯 CREATE DEBUG: Starting form population (timer)');
          try {
            if (locationState.enhancedProductData && Object.keys(locationState.enhancedProductData).length > 10) {
              //console.log('🎯 CREATE DEBUG: Using PayloadCMS data');
              const payloadProduct = locationState.enhancedProductData as unknown as PayloadCMSProduct;
              populateFormWithPayloadCMSData(payloadProduct);
            } else {
              //console.log('🎯 CREATE DEBUG: Using design data');
              populateFormWithDesignData(locationState.designData, locationState.enhancedProductData, imageSettings);
            }

            // Process mockup images AFTER form is populated
            if (hasPreGeneratedImages || Object.keys(locationState.mockupImages || {}).length > 0) {
              //console.log('🎯 CREATE DEBUG: Processing mockup images');
              handleMockupImagesEnhanced(locationState, imageSettings);
            }

            setShowImportNotification(true);
            //console.log('🎯 CREATE DEBUG: Form population completed');

            // Mark success: prevents further runs for this mount
            didPopulateRef.current = true;
            setHasProcessedInitialData(true);
          } catch (populationError) {
            //console.error('🎯 CREATE ERROR: Form population failed:', populationError);
            setError('Failed to populate form with imported data');
            // leave hasProcessedInitialData as false so it can retry if appropriate
          }
        }, 2000); // keep your existing delay
      } else {
        // if no designData present, still mark processed so we don't re-run endlessly
        //console.log('🎯 CREATE DEBUG: No designData present — marking processed');
        didPopulateRef.current = true;
        setHasProcessedInitialData(true);
      }
    } catch (error) {
      //console.error('🎯 CREATE ERROR: Location state processing failed:', error);
      setError('Failed to process imported design data');
      // don't set hasProcessedInitialData here so user can retry / effect can re-run
    }
  };

  // Run the processor
  processLocationState();

  // cleanup: clear timer when unmounting or deps change
  return () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  // note: we depend on location.state here
}, [location.state]);


// Add this debug function before your onSubmit function
const debugMediaItems = () => {
  
  mediaItems.forEach((item, index) => {

    // Check if this would match the design image filter
    const isDesign = item.metadata?.isRawDesignImage === true || 
                   item.variantInfo?.isRawDesignImage === true ||
                   item.metadata?.debugInfo?.source === 'canvas_design_element';
    
  });
  
  // Test the actual filter
  const designImages = mediaItems.filter(item => {
    const isDesign = item.metadata?.isRawDesignImage === true || 
                   item.variantInfo?.isRawDesignImage === true ||
                   item.metadata?.debugInfo?.source === 'canvas_design_element';
    
    if (isDesign) {
     }
    
    return isDesign;
  });
  
  
  return designImages.length;
};

// ===== COMPLETE ENHANCED FORM SUBMISSION WITH DESIGN IMAGE UPLOAD =====
// Updated onSubmit function sections - replace the artwork creation and product creation parts

const processDesignImagesArray = async (designImagesArray) => {
  ////console.log('🎨 processDesignImagesArray called with:', designImagesArray?.length || 0, 'images');
  
  // GUARD: Prevent multiple simultaneous processing
  if (isProcessingDesignImages) {
    ////console.log('🚫 Already processing design images, skipping...');
    return false;
  }
  
  if (!Array.isArray(designImagesArray) || designImagesArray.length === 0) {
    return false;
  }
  
  setIsProcessingDesignImages(true);
  
  try {
    const processedImages = [];
    let designImageRank = 0;
    
    for (let i = 0; i < designImagesArray.length; i++) {
      const designImage = designImagesArray[i];
      
      if (!designImage.base64Data) {
        continue;
      }
      
      try {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const cleanName = (designImage.name || 'design-image')
          .replace(/[^a-z0-9.-]/gi, '_')
          .toLowerCase();
        const fileName = `design-${cleanName}-${designImage.area}-${timestamp}-${randomId}.png`;
        
        const processedImage = await processBase64ToFile(
          designImage.base64Data,
          fileName,
          undefined
        );
        
        if (!processedImage) {
          continue;
        }
        
        const designMediaItem = {
          file: processedImage.file,
          url: processedImage.url,
          rank: designImageRank++,
          isNew: true,
          
          variantInfo: {
            isRawDesignImage: true,
            designArea: designImage.area,
            originalFileName: designImage.name
          },
          
          metadata: {
            isRawDesignImage: true,
            designArea: designImage.area,
            originalFileName: designImage.name,
            originalImageWidth: designImage.originalWidth,
            originalImageHeight: designImage.originalHeight,
            
            canvasPosition: {
              x: designImage.position?.x || 0,
              y: designImage.position?.y || 0,
              width: designImage.dimensions?.width || 0,
              height: designImage.dimensions?.height || 0,
              rotation: designImage.rotation || 0
            },
            
            processingId: `${designImage.area}-${designImage.name}-${i}`,
            
            uploadValidation: {
              hasFile: true,
              fileSize: processedImage.file.size,
              fileType: processedImage.file.type,
              fileName: processedImage.file.name,
              validForUpload: true
            },
            
            debugInfo: {
              source: 'canvas_design_element',
              area: designImage.area,
              elementId: designImage.id,
              processed: true,
              timestamp: new Date().toISOString(),
              processedAt: 'processDesignImagesArray'
            }
          }
        };
        
        processedImages.push(designMediaItem);
    
      } catch (imageError) {
        //console.error('Error processing design image:', imageError);
      }
    }
    
    if (processedImages.length === 0) {
      return false;
    }
    
    // SINGLE state update with REPLACEMENT, not accumulation
    setMediaItems(prevMediaItems => {
      // Remove any existing design images first
      const nonDesignImages = prevMediaItems.filter(item => 
        !(item.metadata?.isRawDesignImage === true ||
          item.variantInfo?.isRawDesignImage === true ||
          item.metadata?.debugInfo?.source === 'canvas_design_element')
      );
      
      // Apply deduplication to new images only
      const deduplicatedNew = removeDuplicateDesignImages(processedImages);
      
      // Combine: deduplicated new + existing non-design
      return [...deduplicatedNew, ...nonDesignImages];
    });
    
    return true;
    
  } catch (criticalError) {
    //console.error('Critical error in processDesignImagesArray:', criticalError);
    return false;
  } finally {
    setIsProcessingDesignImages(false);
  }
};

const processCanvasImagesForArtwork = async (canvasImages: Array<{
  area_id: string;
  image_data: string | Promise<string>; // Updated type to handle Promise
  metadata: any;
  description: string;
}>): Promise<Array<{
  uploadResult: any;
  originalMetadata: any;
  areaId: string;
  description: string;
}>> => {
  //console.log('🖼️ Processing', canvasImages.length, 'canvas images for artwork');
  
  const processedCanvasImages = [];
  
  for (let i = 0; i < canvasImages.length; i++) {
    const canvasImage = canvasImages[i];
    
    try {
      // 🔥 FIX: Await the Promise if image_data is a Promise
      let resolvedImageData: string;
      
      if (canvasImage.image_data instanceof Promise) {
        //console.log(`⏳ Awaiting Promise for canvas image area: ${canvasImage.area_id}`);
        resolvedImageData = await canvasImage.image_data;
      } else {
        resolvedImageData = canvasImage.image_data;
      }
      
      //console.log(`✅ Resolved image data for area: ${canvasImage.area_id}, length: ${resolvedImageData.length}`);
      
      // Additional validation
      if (!resolvedImageData || !resolvedImageData.startsWith('data:image/')) {
        //console.error(`❌ Invalid image data for area: ${canvasImage.area_id}`);
        continue;
      }
      
      // Convert base64 to file
      const processedImage = await processBase64ToFile(
        resolvedImageData,
        `canvas-${canvasImage.area_id}-complete-layout.png`,
        undefined
      );
      
      if (!processedImage?.file) {
        //console.error(`❌ Failed to process canvas image for area: ${canvasImage.area_id}`);
        continue;
      }
      
      // Upload canvas image file
      //console.log(`⬆️ Uploading canvas image for area: ${canvasImage.area_id}`);
      const uploadResult = await uploadArtworkFile(processedImage.file);
      
      processedCanvasImages.push({
        uploadResult,
        originalMetadata: canvasImage.metadata,
        areaId: canvasImage.area_id,
        description: canvasImage.description
      });
      
      //console.log(`✅ Canvas image uploaded for area: ${canvasImage.area_id}`);
      
    } catch (error) {
      //console.error(`❌ Error processing canvas image for area ${canvasImage.area_id}:`, error);
    }
  }
  
  return processedCanvasImages;
};

//Helper function to display correct cost price with extra cost for size
const getVariantCostPrice = useCallback((variantIndex: number): number => {
  const baseCostPrice = canvasPricingData?.final_price_per_unit || 
                        enhancedProductData?.cost || 
                        0;
  
  if (baseCostPrice === 0) return 0;
  
  let finalCostPrice = baseCostPrice;
  
  // Get the variant's size option
  const variant = form.watch(`variants.${variantIndex}`);
  
  if (variant?.optionValues && enhancedProductData?.sizeOptions) {
    const sizeOptionValue = variant.optionValues.find(
      opt => opt.optionName.toLowerCase() === 'size'
    );
    
    if (sizeOptionValue) {
      const matchingSize = enhancedProductData.sizeOptions.find(
        size => size.sizeName.toLowerCase() === sizeOptionValue.value.toLowerCase()
      );
      
      if (matchingSize?.ExtraCost) {
        const extraCost = parseFloat(matchingSize.ExtraCost);
        if (!isNaN(extraCost) && extraCost > 0) {
          finalCostPrice += extraCost;
          //console.log(`Variant ${variantIndex}: Added ExtraCost ${extraCost} for size ${sizeOptionValue.value}`);
        }
      }
    }
  }
  
  return finalCostPrice;
}, [canvasPricingData, enhancedProductData, form]);


const onSubmit = async (values: ProductFormValues) => {
  
  // GUARD: Prevent multiple form submissions
  if (isSubmittingForm) {
    //console.log('🚫 Form already submitting, ignoring duplicate submission');
    return;
  }
  
  if (!values.title.trim()) {
    setError('Product title is required');
    return;
  }
  
 setIsSubmitting(true);
  setIsSubmittingForm(true);
  setError(null);

  
  try {
    
    const locationState = location.state as LocationState;
    const designArtworkPayloads: any[] = [];
    const productImages: Array<{id: string, url: string, alt?: string}> = [];
    let mainArtworkId: string | null = null;

    // Enhanced design image detection
    // Enhanced design image detection with deduplication

    // ENHANCED design image detection with STRICT deduplication
    // const allDesignImages = mediaItems.filter(item => {
    //   const isDesign = item.metadata?.isRawDesignImage === true || 
    //                  item.variantInfo?.isRawDesignImage === true ||
    //                  item.metadata?.debugInfo?.source === 'canvas_design_element';
    //   return isDesign;
    // });

    // ////console.log('🎨 Found', allDesignImages.length, 'design images before deduplication');

    // // Apply STRICT deduplication with improved logic
    // const designImages = removeDuplicateDesignImages(allDesignImages);
    //  const mockupImages = mediaItems.filter(item => !allDesignImages.includes(item));

    // Separate images by type using the same filtering logic consistently
    const { designImages: allDesignImages, mockupImages } = (() => {
      const designs = [];
      const mockups = [];
      
      for (const item of mediaItems) {
        const isDesign = item.metadata?.isRawDesignImage === true || 
                      item.variantInfo?.isRawDesignImage === true ||
                      item.metadata?.debugInfo?.source === 'canvas_design_element';
        
        if (isDesign) {
          designs.push(item);
        } else {
          mockups.push(item);
        }
      }
      
      return { designImages: designs, mockupImages: mockups };
    })();

    //console.log('🎨 Found', allDesignImages.length, 'design images before deduplication');
    //console.log('📸 Found', mockupImages.length, 'mockup images for upload');

    // Apply deduplication to design images only
    const designImages = removeDuplicateDesignImages(allDesignImages);
    
    //console.log('🎯 After deduplication:', designImages.length, 'unique design images');

    // Additional validation: ensure we have actual files
    const validDesignImages = designImages.filter(img => {
      const isValid = img.file && img.file.size > 0;
      if (!isValid) {
        ////console.log('❌ Invalid design image found:', img);
      }
      return isValid;
    });

    //console.log('✅ Valid design images for upload:', validDesignImages.length);

    // STEP 1: Process design images with SINGLE ARTWORK PER AREA
   // STEP 1: Process design images AND canvas images with COMBINED ARTWORK
if (validDesignImages.length > 0 || importedCanvasImages.length > 0) {
  //console.log('🚀 Starting artwork creation with:');
  //console.log('- Design images:', validDesignImages.length);
  //console.log('- Canvas images:', importedCanvasImages.length);
  
  try {
    const allUploadedFiles = [];
    let totalImageCount = 0;
    
    // PROCESS DESIGN IMAGES (existing code - keep as is)
    if (validDesignImages.length > 0) {
      const imagesByArea = validDesignImages.reduce((groups, designImage, index) => {
        const area = designImage.metadata?.designArea || 'front';
        if (!groups[area]) {
          groups[area] = [];
        }
        groups[area].push({ designImage, index });
        return groups;
      }, {});
      
      for (const [areaName, areaImages] of Object.entries(imagesByArea)) {
        for (const { designImage, index } of areaImages) {
          if (!designImage.file) continue;
          
          const uploadResult = await uploadArtworkFile(designImage.file);
          allUploadedFiles.push({
            ...uploadResult,
            originalMetadata: designImage.metadata,
            designArea: areaName,
            areaIndex: index,
            fileType: 'design_element' // 🔥 ADD TYPE
          });
          
          totalImageCount++;
        }
      }
    }
    
    // 🔥 NEW: PROCESS CANVAS IMAGES
    if (importedCanvasImages.length > 0) {
      const processedCanvasImages = await processCanvasImagesForArtwork(importedCanvasImages);
      
      processedCanvasImages.forEach((canvasImage, index) => {
        allUploadedFiles.push({
          ...canvasImage.uploadResult,
          originalMetadata: canvasImage.originalMetadata,
          designArea: canvasImage.areaId,
          areaIndex: index,
          fileType: 'canvas_layout', // 🔥 ADD TYPE
          manufacturingDescription: canvasImage.description
        });
        
        totalImageCount++;
      });
      
      //console.log(`✅ Added ${processedCanvasImages.length} canvas images to artwork`);
    }
    
    if (allUploadedFiles.length === 0) {
      //console.log(`⚠️ No files uploaded for artwork creation`);
    } else {
      // Create SINGLE artwork payload with ALL files (design + canvas)
      // Create SINGLE artwork payload with ALL files (design + canvas) and image area data
      // Create SINGLE artwork payload with ALL files (design + canvas) 
// UPDATE the combinedArtworkPayload creation in onSubmit
const combinedArtworkPayload = {
  name: `${form.getValues('title')} - Complete Design & Layout`,
  description: `Complete design for ${form.getValues('title')} containing ${totalImageCount} elements including design elements and manufacturing layout references with enhanced analysis data`,
  
  medias: allUploadedFiles.map((uploadedFile, globalIndex) => ({
    image_url: uploadedFile.url,
    filename: uploadedFile.filename,
    mime_type: uploadedFile.mime_type,
    file_id: uploadedFile.id,
    file_type: "image",
    // 🔥 ENHANCED: Use the new detailed file description
    file_description: createEnhancedFileDescription(
      uploadedFile, 
      locationState.enhancedImageAreaAnalysis, 
      globalIndex
    ),
    design_area: uploadedFile.designArea.toLowerCase(),
    file_category: uploadedFile.fileType,
    metadata: {
      original_filename: uploadedFile.originalMetadata?.originalFileName,
      canvas_position: uploadedFile.originalMetadata?.canvasPosition || {},
      source: uploadedFile.fileType === 'canvas_layout' ? 'canvas_complete_layout' : 'canvas_design_element',
      element_index: globalIndex,
      area_name: uploadedFile.designArea,
      area_element_index: uploadedFile.areaIndex,
      total_elements: totalImageCount,
      manufacturing_description: uploadedFile.manufacturingDescription || undefined,
      
      // 🔥 ENHANCED: Include detailed analysis data for the first file
      ...(globalIndex === 0 ? {
        // Enhanced image area analysis
        enhanced_image_area_analysis: locationState.enhancedImageAreaAnalysis ? {
          area_specifications: locationState.enhancedImageAreaAnalysis.area_specifications,
          design_complexity: locationState.enhancedImageAreaAnalysis.design_complexity,
          detailed_element_breakdown: locationState.enhancedImageAreaAnalysis.detailed_element_breakdown,
          elements_summary: locationState.enhancedImageAreaAnalysis.elements_summary
        } : null,
        
        // Include canvas pricing data in metadata
        canvas_pricing_data: canvasPricingData ? {
          final_price_per_unit: canvasPricingData.final_price_per_unit,
          technology_name: canvasPricingData.technology_name,
          total_design_area: canvasPricingData.total_design_area,
          pricing_breakdown: canvasPricingData.pricing_breakdown,
          quantity_pricing: canvasPricingData.quantity_pricing
        } : null,
        
        // Include mockup data in metadata
        canvas_mockup_data: canvasMockupData ? {
          technology_name: canvasMockupData.technology_name,
          total_available_mockups: canvasMockupData.total_available_mockups,
          selected_colors: canvasMockupData.selected_colors,
          mockups_by_color: canvasMockupData.mockups_by_color
        } : null,
      } : {}),
      
      // 🔥 ENHANCED: Add element-specific enhanced data
      element_enhanced_data: uploadedFile.fileType === 'design_element' ? 
        locationState.enhancedImageAreaAnalysis?.detailed_element_breakdown?.[uploadedFile.designArea]?.find(
          el => el.element_name === uploadedFile.originalMetadata?.originalFileName ||
               el.element_id === uploadedFile.originalMetadata?.elementId
        ) : null,
      
      // 🔥 ENHANCED: Add area-specific specifications
      area_specifications: locationState.enhancedImageAreaAnalysis?.area_specifications?.[uploadedFile.designArea],
      
      // Canvas-specific metadata (existing)
      ...(uploadedFile.fileType === 'canvas_layout' && uploadedFile.originalMetadata ? {
        canvas_dimensions: uploadedFile.originalMetadata.canvas_dimensions,
        printable_area: uploadedFile.originalMetadata.printable_area,
        design_elements_count: uploadedFile.originalMetadata.design_elements?.length || 0,
        canvas_settings: uploadedFile.originalMetadata.canvas_settings
      } : {})
    }
  }))
};
      
      //console.log(`🎨 Creating combined artwork with ${allUploadedFiles.length} files (design + canvas)`);
      
      // Create artwork containing everything
      const combinedArtworkResult = await createArtworkPayload(combinedArtworkPayload);
      //console.log(`✅ Combined artwork created:`, combinedArtworkResult);

      // Extract artwork ID
      if (combinedArtworkResult?.vendor_artwork?.id) {
        mainArtworkId = combinedArtworkResult.vendor_artwork.id;
        //console.log(`🎯 Combined artwork ID: ${mainArtworkId}`);
      }
      
      // Store artwork data with enhanced info
      designArtworkPayloads.push({
        artwork_data: combinedArtworkResult,
        design_areas: [...new Set(allUploadedFiles.map(f => f.designArea))],
        image_count: totalImageCount,
        design_elements_count: validDesignImages.length,
        canvas_images_count: importedCanvasImages.length,
        is_combined_artwork: true,
        artwork_id: mainArtworkId,
        contains_canvas_layouts: importedCanvasImages.length > 0
      });
      
      // Add product image (use first uploaded file)
      if (combinedArtworkResult.medias?.length > 0) {
        const primaryMedia = combinedArtworkResult.medias[0];
        productImages.push({
          id: primaryMedia.file_id,
          url: primaryMedia.image_url,
          alt: `Design: ${form.getValues('title')}`
        });
      }
    }
    
  } catch (artworkError) {
    //console.error(`❌ Error creating combined artwork:`, artworkError);
    throw new Error(`Failed to create combined artwork: ${artworkError.message}`);
  }
}

// Continue with existing mockup image processing...
    // STEP 2: Upload mockup images (unchanged)
    if (mockupImages.length > 0) {
      
      for (const [index, mockupImage] of mockupImages.entries()) {
        try {
          
          if (!mockupImage.file) {
            throw new Error(`Mockup image ${index + 1} missing file data`);
          }
          
          const formData = new FormData();
          formData.append('files', mockupImage.file);
          
          const uploadResult = await uploadProductImage({
            productId: '',
            formData: formData,
            multiple: false
          });
          
          if (!uploadResult || !('id' in uploadResult) || !('url' in uploadResult)) {
            throw new Error(`Invalid upload response for mockup image: ${mockupImage.file.name}`);
          }
          
          productImages.push({
            id: uploadResult.id,
            url: uploadResult.url,
            alt: `Mockup: ${mockupImage.colorValue || 'Product'}`
          });
          
          mockupImage.id = uploadResult.id;
          mockupImage.url = uploadResult.url;
          
          
        } catch (uploadError: any) {
          throw new Error(`Failed to upload mockup image: ${uploadError.message}`);
        }
      }
      
   }
    
    // ✅ STEP 3: Continue with product creation (rest of your existing code)
   const timestamp = Date.now();
   const random = Math.random().toString(36).slice(2, 8);

    const handle =
      values.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 40)
      + `-${timestamp}-${random}`;


    // Get form values
    const formValues = form.getValues();
    
    // Extract PayloadCMS image association settings for dynamic processing
    const imageAssociationSettings = {
      color_Images: enhancedProductData?.color_Images || false,
      size_Images: enhancedProductData?.size_Images || false,
      material_Images: enhancedProductData?.material_Images || false,
      style_Images: enhancedProductData?.style_Images || false
    };

    // Declare validOptions in the outer scope
    let validOptions: any[] = [];
    let options: any[] = [];
    let variants: any[] = [];
    
    // ✅ STEP 4: Process options and variants (unchanged existing code)
    if (hasVariants && formValues.options.length > 0) {
      
      validOptions = formValues.options.filter(opt => 
        opt.title && opt.optionValues && opt.optionValues.length > 0
      );
      
      if (validOptions.length === 0) {
        throw new Error("Please add at least one option with values");
      }
      
      // Format options for API
      options = validOptions.map(opt => ({
        title: opt.title,
        values: opt.optionValues
      }));
      
      const formVariants = formValues.variants;
      
      if (formVariants.length === 0) {
        throw new Error("No variants found. Please generate variants from your options.");
      }
      
      // Process variants with complete metadata
      variants = formVariants.map((variant, index) => {
        const price = typeof variant.price === 'string' 
          ? parseFloat(variant.price) 
          : (variant.price || 0);

        // Format variant options
        const variantOptions: Record<string, string> = {};
        if (variant.optionValues && variant.optionValues.length > 0) {
          variant.optionValues.forEach(optVal => {
            variantOptions[optVal.optionName] = optVal.value;
          });
        }

        // CREATE VARIANT METADATA WITH IMAGE ASSOCIATIONS
        const variantMetadata: Record<string, any> = {};
        
        // const costPrice = canvasPricingData?.final_price_per_unit || 
        //            enhancedProductData?.cost || 
        //            0;
  
        // if (costPrice > 0) {
        //   variantMetadata.cost_price = costPrice;
        // Enhanced cost_price calculation with ExtraCost
        const baseCostPrice = canvasPricingData?.final_price_per_unit || 
                              enhancedProductData?.cost || 
                              0;

        let finalCostPrice = baseCostPrice;

        if (baseCostPrice > 0) {
          // Add ExtraCost if size variant has it
          if (variant.optionValues && enhancedProductData?.sizeOptions) {
            const sizeOptionValue = variant.optionValues.find(
              opt => opt.optionName.toLowerCase() === 'size'
            );
            
            if (sizeOptionValue) {
              const matchingSize = enhancedProductData.sizeOptions.find(
                size => size.sizeName.toLowerCase() === sizeOptionValue.value.toLowerCase()
              );
              
              if (matchingSize?.ExtraCost) {
                const extraCost = parseFloat(matchingSize.ExtraCost);
                if (!isNaN(extraCost) && extraCost > 0) {
                  finalCostPrice += extraCost;
                  console.log(`Added ExtraCost ${extraCost} to variant ${variant.title}, new cost: ${finalCostPrice}`);
                }
              }
            }
          }
          
          variantMetadata.cost_price = finalCostPrice;
        }
      
        // 🔥 ADD: Construct manufacturer_sku from PayloadCMS data
        if (enhancedProductData) {
          const baseSku = enhancedProductData['Manufacturer sku'] || '';
          let manufacturerSku = baseSku;
          
          // Extract color SKU for this variant
          if (variant.optionValues && enhancedProductData.colorOptions) {
            const colorOptionValue = variant.optionValues.find(
              opt => opt.optionName.toLowerCase() === 'color'
            );
            
            if (colorOptionValue) {
              const matchingColor = enhancedProductData.colorOptions.find(
                color => color.colorName.toLowerCase() === colorOptionValue.value.toLowerCase()
              );
              
              if (matchingColor?.colorSku) {
                manufacturerSku += matchingColor.colorSku;
              }
            }
          }
          
          // Extract size SKU for this variant
          if (variant.optionValues && enhancedProductData.sizeOptions) {
            const sizeOptionValue = variant.optionValues.find(
              opt => opt.optionName.toLowerCase() === 'size'
            );
            
            if (sizeOptionValue) {
              const matchingSize = enhancedProductData.sizeOptions.find(
                size => size.sizeName.toLowerCase() === sizeOptionValue.value.toLowerCase()
              );
              
              if (matchingSize?.sizeSku) {
                manufacturerSku += matchingSize.sizeSku;
              }
            }
          }
          
          // Add to metadata if we have a valid SKU
          if (manufacturerSku) {
            variantMetadata.manufacturer_sku = manufacturerSku;
            //console.log(`✅ Variant ${variant.title} manufacturer_sku:`, manufacturerSku);
          }
        }

        // Get ALL images associated with this variant
        const directVariantImages = mediaItems.filter(item => 
          item.variantInfo?.variantId === variant.id && item.id
        );

        const optionValueImages = mediaItems.filter(item => {
          if (!item.variantInfo?.optionName || !item.variantInfo?.optionValues || !variant.optionValues) {
            return false;
          }
          
          return variant.optionValues.some(optVal => 
            optVal.optionName.toLowerCase() === item.variantInfo!.optionName!.toLowerCase() && 
            item.variantInfo!.optionValues!.includes(optVal.value)
          );
        });

        // Combine all variant-associated images, avoiding duplicates
        const allVariantImages = [...directVariantImages];
        optionValueImages.forEach(img => {
          if (!allVariantImages.some(existing => existing.id === img.id)) {
            allVariantImages.push(img);
          }
        });

        // METADATA KEY 1: variant_images (array of URLs)
        const variantImageUrls = allVariantImages
          .map(item => {
            if (item.url && item.url.startsWith('blob:') && item.id) {
              return getStaticUrl(item.id);
            }
            return item.url;
          })
          .filter(url => url);

        if (variantImageUrls.length > 0) {
          variantMetadata.variant_images = JSON.stringify(variantImageUrls);
        }

        // METADATA KEY 2: variant_image_ids (array of image IDs)
        const variantImageIds = allVariantImages
          .map(item => item.id)
          .filter(id => id && typeof id === 'string');

        if (variantImageIds.length > 0) {
          variantMetadata.variant_image_ids = JSON.stringify(variantImageIds);
        }

        // METADATA KEY 3: color_images and option_images - DYNAMIC based on PayloadCMS
        const colorImages: any[] = [];
        const allOptionImages: any[] = [];

        if (variant.optionValues) {
          variant.optionValues.forEach(optVal => {
            // Check if this option type should have images based on PayloadCMS
            const shouldHaveImages = shouldOptionHaveImages(optVal.optionName, payloadImageSettings);

            if (!shouldHaveImages) {
               return;
            }
            
            
            // Get images associated with this option value
            const optionSpecificImages = mediaItems.filter(item => 
              item.variantInfo?.optionName && 
              item.variantInfo.optionName.toLowerCase() === optVal.optionName.toLowerCase() && 
              item.variantInfo?.optionValues?.includes(optVal.value) &&
              item.url
            );
            
            optionSpecificImages.forEach(item => {
              let url = item.url;
              const STATIC_BASE_URL = import.meta.env.VITE_STATIC_BASE_URL || 'https://yourdomain.com/static';
                if (url.startsWith('blob:') && item.id) {
                  url = `${STATIC_BASE_URL}/${item.id}`;
                }
              
              // Add to general option images
              allOptionImages.push({
                option_name: optVal.optionName,
                option_value: optVal.value,
                url: url,
                imageId: item.id || ''
              });
              
              // If this is a color option AND color_Images is enabled, add to color_images
              if (isColorOption(optVal.optionName) && imageAssociationSettings.color_Images) {
                colorImages.push({
                  color: optVal.value,
                  url: url,
                  imageId: item.id || ''
                });
              }
            });
          });
        }

        // Add color_images metadata if we have color images
        if (colorImages.length > 0) {
          variantMetadata.color_images = JSON.stringify(colorImages);
           }

        // Add option_images metadata for all enabled option types
        if (allOptionImages.length > 0) {
          variantMetadata.option_images = JSON.stringify(allOptionImages);
          }

        // Return formatted variant with complete metadata
        return {
          title: variant.title || `Variant ${index + 1}`,
          sku: variant.sku || `sku-${timestamp}-${index}`,
          manage_inventory: Boolean(variant.manageInventory),
          allow_backorder: Boolean(variant.allowBackorder),
          options: variantOptions,
          prices: [{
            amount: price,
            currency_code: 'inr'
          }],
          metadata: variantMetadata
        };
      });
      
    } else {
      
      // For non-variant products, create default option
      validOptions = [{ title: "Size", optionValues: ["Default"] }];
      options = [{ title: "Size", values: ["Default"] }];
      
      variants = [{
        title: "Default",
        sku: `sku-${timestamp}`,
        manage_inventory: true,
        allow_backorder: false,
        options: { "Size": "Default" },
        prices: [{ amount: formValues.defaultVariantPrice || 25.00, currency_code: 'inr' }],
        metadata: {}
      }];
    }
    
    
    // ✅ STEP 5: Prepare main product metadata
    const productMetadata: Record<string, any> = {};
    

    // 🔥 NEW: Add PayloadCMS product name
    if (enhancedProductData?.name) {
      productMetadata.payload_product_name = enhancedProductData.name;
    }

    // 🔥 ADD DESIGN ARTWORK DATA TO PRODUCT METADATA
    if (designArtworkPayloads.length > 0) {
      productMetadata.design_artwork = JSON.stringify(designArtworkPayloads);
       }
    
    // Add fulfillment information
    // Add fulfillment information - ALWAYS set for PayloadCMS products
    if (enhancedProductData || payloadFulfillmentData.hasData) {
      const fulfillmentData = {
        type: "JUNOONI-fulfillment",
        ...(payloadFulfillmentData.shippingTime && { 
          shipping_time: payloadFulfillmentData.shippingTime 
        }),
        ...(payloadFulfillmentData.handlingTime && { 
          handling_time: payloadFulfillmentData.handlingTime 
        }),
        ...(payloadFulfillmentData.rushAvailable && {
          rush_available: true,
          rush_time: payloadFulfillmentData.rushTime
        })
      };
      productMetadata.fulfillment_type = JSON.stringify(fulfillmentData);
    }

    //console.log('📦 Product metadata after fulfillment:', productMetadata);
    //console.log('📦 Payload fulfillment data:', payloadFulfillmentData);
    // 🔥 NEW: ADD CARE INSTRUCTIONS FROM PAYLOADCMS
    if (enhancedProductData && Array.isArray(enhancedProductData.careInstructions) && enhancedProductData.careInstructions.length > 0) {
      // Extract care instructions and format them for storage
      const careInstructions = enhancedProductData.careInstructions.map(care => ({
        id: care.id,
        instruction: care.instruction,
        icon: care.icon || null
      }));
      
      productMetadata.care_instructions = JSON.stringify(careInstructions);
      //console.log('✅ Added care instructions to product metadata:', careInstructions.length, 'instructions');
    }

    // 🔥 ADD THIS CANVAS IMAGE METADATA CODE HERE
    if (importedCanvasImages.length > 0) {
      productMetadata.canvas_layouts = JSON.stringify({
        total_canvas_images: importedCanvasImages.length,
        areas_covered: importedCanvasImages.map(img => img.area_id),
        manufacturing_ready: true,
        canvas_metadata: importedCanvasImages.map(img => ({
          area: img.area_id,
          elements_count: img.metadata?.design_elements?.length || 0,
          canvas_dimensions: img.metadata?.canvas_dimensions
        }))
      });
    }
    
    // Add product details if present
    if (formValues.productDetails && Array.isArray(formValues.productDetails)) {
      const validDetails = formValues.productDetails
        .filter(detail => detail && detail.text && detail.text.trim() !== '')
        .map(detail => detail.text.trim());
      
      if (validDetails.length > 0) {
        productMetadata.product_details = JSON.stringify(validDetails);
      }
    }
    
    // Add story behind design if present
    if (formValues.storyBehindDesign && typeof formValues.storyBehindDesign === 'string') {
      productMetadata.description_story = formValues.storyBehindDesign.trim();
    }
    
    // Add color hex values if present
    const formColorOption = validOptions.find(opt => 
      opt.title?.toLowerCase() === 'color' || opt.title?.toLowerCase() === 'colour'
    );
    
    if (formColorOption && formColorOption.colorHexValues) {
      const colorHexArray = Object.entries(formColorOption.colorHexValues).map(
        ([colorName, hexValue]) => ({ name: colorName, hex: hexValue })
      );
      productMetadata.color_hex_values = JSON.stringify(colorHexArray);
    }
    
    // Add image association settings
    if (validOptions.length > 0) {
      const imageAssociationSettingsArray = validOptions
        .filter(opt => opt.title && Array.isArray(opt.optionValues) && opt.optionValues.length > 0)
        .map(opt => ({
          option_id: opt.id,
          option_name: opt.title,
          enabled: Boolean(opt.imageAssociation)
        }));

      if (imageAssociationSettingsArray.length > 0) {
        productMetadata.variant_specific_image_option = JSON.stringify(imageAssociationSettingsArray);
      }
    }

    // PayloadCMS integration metadata
    if (enhancedProductData) {
      productMetadata.payload_integration = JSON.stringify({
        source_product_id: enhancedProductData.id,
        base_cost: enhancedProductData.cost,
        image_settings: payloadImageSettings,
        imported_at: new Date().toISOString()
      });
    }

    // 🔥 NEW: CREATE ADDITIONAL_DATA OBJECT
    const additionalData: any = {};
    
    // Add vendor_artwork_id if we have a main artwork ID
    if (mainArtworkId) {
      additionalData.vendor_artwork_id = mainArtworkId;
      }
    
    // Add size_chart_id from PayloadCMS data
    if (enhancedProductData && enhancedProductData.sizeChartHtml) {
      additionalData.size_chart_id = enhancedProductData.sizeChartHtml;
    }

    // ✅ CORRECTED: Use supplierProductId as brand_id
    if (enhancedProductData?.vendorInfo?.supplierProductId) {
      additionalData.brand_id = enhancedProductData.vendorInfo.supplierProductId;
      //console.log('✅ Added brand_id from supplierProductId:', enhancedProductData.vendorInfo.supplierProductId);
    } else {
      // Fallback to empty string if not available
      additionalData.brand_id = "";
      //console.log('⚠️ No supplierProductId found, brand_id set to empty string');
    }
    
    // Add brand_id (leave empty for now as requested)
    //additionalData.brand_id = "";
    
    // Log the final additional_data


// --- ensure selected print technology name is included in metadata ---
// === resolve print technology (id + name) from router state or enhancedProductData ===
// === CORRECTED: Resolve print technology (id + name) from router state ===
// === CORRECTED: Resolve print technology (id + name) from router state ===
const state = (location?.state ?? {}) as any;

let printTechId: string | null = null;
let printTechName: string | null = null;

//console.log('🔍 TECH DEBUG: Starting print technology resolution');

// 1) PRIORITY: Use filteredProductData (selected technology from Canvas) - EXIT EARLY IF FOUND
if (state.filteredProductData && Array.isArray(state.filteredProductData.printT) && state.filteredProductData.printT.length > 0) {
  const tech = state.filteredProductData.printT[0];
  printTechId = tech?.id ? String(tech.id) : null;
  printTechName = tech?.technologyName || tech?.technology || null;
  
  //console.log('✅ TECH DEBUG: Found in filteredProductData:', { printTechId, printTechName });
  
  // ✅ CRITICAL: If we have both ID and name, use this and STOP checking other sources
  if (printTechId && printTechName) {
    //console.log('🎯 TECH DEBUG: Using filteredProductData - STOPPING fallback checks');
    
    // Normalize values and set in metadata immediately
    printTechName = String(printTechName).trim();
    printTechId = String(printTechId).trim();
    
    productMetadata.print_technology_name = printTechName;
    productMetadata.print_technology_id = printTechId;
    
    // //console.log('✅ TECH DEBUG: Final result from filteredProductData:', {
    //   print_technology_name: productMetadata.print_technology_name,
    //   print_technology_id: productMetadata.print_technology_id
    // });
    
    // Don't check any other sources - we have the definitive answer
  } else {
    //console.log('⚠️ TECH DEBUG: filteredProductData incomplete, checking fallbacks');
  }
} else {
  //console.log('⚠️ TECH DEBUG: No filteredProductData found, checking fallbacks');
}

// 2) ONLY check fallbacks if we don't have complete data from filteredProductData
if (!printTechId || !printTechName) {
  //console.log('🔄 TECH DEBUG: Checking fallback sources...');
  
  // Check designData.printingTechnology (but this might be hardcoded 'dtg')
  if (!printTechName && state.designData?.printingTechnology) {
    printTechName = state.designData.printingTechnology;
    //console.log('🔄 TECH DEBUG: Using designData.printingTechnology:', printTechName);
  }

  // Check enhancedProductData
  if ((!printTechId || !printTechName) && enhancedProductData && Array.isArray(enhancedProductData.printT) && enhancedProductData.printT.length > 0) {
    const tech = enhancedProductData.printT[0];
    if (!printTechId) printTechId = tech?.id ? String(tech.id) : null;
    if (!printTechName) printTechName = tech?.technologyName || tech?.technology || null;
    //console.log('🔄 TECH DEBUG: Using enhancedProductData tech:', { printTechId, printTechName });
  }

  // Check state.enhancedProductData
  if ((!printTechId || !printTechName) && state.enhancedProductData && Array.isArray(state.enhancedProductData.printT) && state.enhancedProductData.printT.length > 0) {
    const tech = state.enhancedProductData.printT[0];
    if (!printTechId) printTechId = tech?.id ? String(tech.id) : null;
    if (!printTechName) printTechName = tech?.technologyName || tech?.technology || null;
    //console.log('🔄 TECH DEBUG: Using state.enhancedProductData tech:', { printTechId, printTechName });
  }

  // Final fallback
  if (!printTechName) {
    printTechName = 'dtg';
    //console.log('🔄 TECH DEBUG: Using final fallback: dtg');
  }

  // Normalize and set metadata (only if not already set above)
  if (printTechName) printTechName = String(printTechName).trim();
  if (printTechId) printTechId = String(printTechId).trim();

  if (!productMetadata.print_technology_name) {
    productMetadata.print_technology_name = printTechName;
  }
  if (printTechId && !productMetadata.print_technology_id) {
    productMetadata.print_technology_id = printTechId;
  }

  // console.log('🔄 TECH DEBUG: Final result from fallbacks:', {
  //   print_technology_name: productMetadata.print_technology_name,
  //   print_technology_id: productMetadata.print_technology_id
  // });
}

// console.log('🎯 TECH DEBUG: FINAL METADATA:', {
//   print_technology_name: productMetadata.print_technology_name,
//   print_technology_id: productMetadata.print_technology_id
// });


    // ✅ STEP 6: Create final product object WITH ADDITIONAL_DATA
    const product = {
      title: formValues.title.trim(),
      subtitle: formValues.subtitle?.trim() || "", // ✅ ADD THIS LINE
      handle: handle,
      description: formValues.description?.trim() || "",
      status: formValues.status || "proposed",
      discountable: Boolean(formValues.discountable),
      
      // Add images if available
      ...(productImages.length > 0 ? { 
        images: productImages,
        thumbnail: productImages[0]?.url || "" 
      } : {}),
      
      // Add category if selected
      //...(formValues.category_id ? { categories: [{ id: formValues.category_id }] } : {}),
       ...(formValues.category_ids && formValues.category_ids.length > 0 ? { 
          categories: formValues.category_ids.map(id => ({ id }))
        } : {}),
      
      // Add physical dimensions if provided
      ...(formValues.weight ? { weight: parseInt(formValues.weight) || 0 } : {}),
      ...(formValues.length ? { length: parseInt(formValues.length) || 0 } : {}),
      ...(formValues.width ? { width: parseInt(formValues.width) || 0 } : {}),
      ...(formValues.height ? { height: parseInt(formValues.height) || 0 } : {}),
      ...(formValues.material ? { material: formValues.material } : {}),
      ...(formValues.origin_country ? { origin_country: formValues.origin_country } : {}),
      
      options: options,
      variants: variants,
      metadata: productMetadata,
      // Add HSN Code from PayloadCMS data
      ...(enhancedProductData?.HSNCode ? { hs_code: enhancedProductData.HSNCode } : {}),

      // ✅ ADD: Shipping Profile ID from PayloadCMS
      ...(enhancedProductData?.shippingInfo?.shippingProfileID ? { 
        shipping_profile_id: enhancedProductData.shippingInfo.shippingProfileID 
      } : {}),
          
      // 🔥 NEW: Add additional_data to product
      additional_data: additionalData
    };
    
    // ✅ STEP 7: Validation
    if (!product.options || product.options.length === 0) {
      throw new Error("CRITICAL ERROR: Options array is empty");
    }
    
    if (!product.variants || product.variants.length === 0) {
      throw new Error("CRITICAL ERROR: Variants array is empty");
    }
    
    // ✅ STEP 8: Create product
    const result = await createProduct({ product });

    if (result && result.id) {
      setCreatedProductId(result.id);
      
      // Handle inventory creation (unchanged)
      setTimeout(async () => {
        try {
          const completeProduct = await fetchProduct({ id: result.id });
          
          if (completeProduct && completeProduct.variants) {
            const inventoryCreations = [];

            const locationIdToUse = getLocationId(enhancedProductData);
            
            // ✅ NEW: Validate location ID exists
            if (!locationIdToUse || locationIdToUse.trim() === '') {
              //console.error('❌ CRITICAL ERROR: No location ID available for inventory creation');
              setError('Location ID not configured. Contact administrator.');
              return;
            }
            
            for (const variant of completeProduct.variants) {
              if (variant.inventory_items && Array.isArray(variant.inventory_items) && variant.inventory_items.length > 0) {
                const inventoryItemId = variant.inventory_items[0].inventory_item_id;
                
                if (inventoryItemId) {
                  inventoryCreations.push({
                    inventory_item_id: inventoryItemId,
                    location_id: locationIdToUse,
                    stocked_quantity: 10,
                    incoming_quantity: 0
                  });
                }
              }
            }
            
            if (inventoryCreations.length > 0) {
              //console.log('📦 Creating inventory at location:', locationIdToUse, 'Variants:', inventoryCreations.length);
              await batchUpdateInventoryLevels({ create: inventoryCreations });
            }
          }
        } catch (inventoryError) {
          //console.error('Inventory creation error:', inventoryError);
        }
      }, 2000);
      
      setShowSuccess(true);
    }
    
  } catch (error: any) {
    
    // Enhanced error handling
    if (error.message.includes('submitArtwork') || error.message.includes('artwork')) {
      setError(`Artwork processing failed: ${error.message}`);
    } else if (error.response?.data) {
      setError(`API Error: ${error.response.data.message || JSON.stringify(error.response.data)}`);
    } else if (error.message) {
      setError(error.message);
    } else {
      setError("Unknown error occurred");
    }
  } finally {
    setIsSubmitting(false);
  }
};

  // For debugging when create button doesn't work
  const handleManualSubmit = (e: React.FormEvent) => {
  if (e) e.preventDefault();
  
  // Prevent multiple rapid clicks
  if (isSubmittingForm) {
    //console.log('🚫 Already submitting, ignoring click');
    return;
  }
  
  form.handleSubmit(onSubmit)();
};

  // ===== ERROR HANDLING =====
  if (error && error.includes('Failed to load')) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Error</h2>
          <p className="mb-6">{error}</p>
          <Button 
            onClick={() => navigate({ to: '/productCatalog' })}
            className="bg-[#e65100] hover:bg-[#d84315] text-white"
          >
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  // Success message dialog
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
              <IconCheck size={32} className="text-green-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-800">Product Created Successfully!</h2>
            <p className="mb-6 text-gray-600">Your product has been created and is ready to go.</p>
            <div className="flex gap-4">
              <Button
                onClick={handleSuccessClose}
                variant="outline"
                className="flex-1"
              >
                Create Another
              </Button>
              <Button
                onClick={() => navigate({ to: `/products/${createdProductId}` })}
                className="flex-1 bg-[#e65100] hover:bg-[#d84315] text-white"
              >
                View Product
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="px-3 py-8 sm:px-6 bg-gray-50">
      {/* Header Bar with Junooni branding */}
      <div className="flex flex-col justify-between gap-4 p-6 mb-6 bg-white border border-gray-100 rounded-lg shadow-sm md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#e65100]">
            {designData ? 'Create Custom Product' : 'Create New Product'}
          </h1>
          <p className="mt-1 text-gray-500">Fill in the details to create your product</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => navigate({ to: '/productCatalog' })}
            className="text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleManualSubmit} 
            disabled={isSubmitting}
            className="bg-[#e65100] hover:bg-[#d84315] text-white shadow-sm"
          >
            {isSubmitting ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {showImportNotification && (
        <DesignImportSuccessNotification
          designData={designData}
          enhancedProductData={enhancedProductData}
          onDismiss={() => setShowImportNotification(false)}
        />
      )}

      <Form {...form}>
        <form 
          onSubmit={(e) => {
            // Prevent default form submission - we'll handle it manually
            e.preventDefault();
            handleManualSubmit(e);
          }}
          noValidate
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Left Column */}
            <div className="space-y-6 md:col-span-2">
              {/* Title & Description Section */}
              <section className="px-3 py-6 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
                <div className="mb-6">
                  <h2 className="mb-4 text-xl font-semibold text-gray-800">Basic Information</h2>
                  <Separator className="mb-6" />
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="font-medium text-gray-700">Product Title*</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g. Handcrafted Leather Bag" 
                            className="w-full border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">
                          The URL slug will be auto-generated from the title
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="font-medium text-gray-700">Short Description</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Brief product description (displays in listings)" 
                            className="w-full border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-gray-700">Description</FormLabel>
                        <FormControl>
                          <Controller
                            name="description"
                            control={form.control}
                            render={({ field }) => (
                              <TipTapEditor
                                value={field.value || ''}
                                onChange={field.onChange}
                                placeholder="Write product details..."
                              />
                            )}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Product Details Section (Bullet Points) */}
              <section className="px-3 py-6 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Product Details</h2>
                <Separator className="mb-6" />
                
                <p className="mb-4 text-sm text-gray-500">Add bullet points highlighting key features of your product</p>
                
                {productDetailFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2 mb-3">
                    <span className="mt-2.5 text-[#e65100]">•</span>
                    <FormField
                      control={form.control}
                      name={`productDetails.${index}.text`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder={`Product detail #${index + 1}`}
                              className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProductDetail(index)}
                      className="mt-1 text-gray-500 hover:text-red-500"
                    >
                      <IconX size={18} />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddProductDetail}
                  className="mt-2 text-[#e65100] border-[#e65100] hover:bg-orange-50"
                >
                  <IconCirclePlus className="mr-1.5" size={18} /> 
                  Add Product Detail
                </Button>
              </section>

              {/* Story Behind Design Section */}
              <section className="px-3 py-6 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Story Behind the Design</h2>
                <Separator className="mb-6" />
                
                <p className="mb-4 text-sm text-gray-500">Share the inspiration and story behind your product</p>
                
                <FormField
                  control={form.control}
                  name="storyBehindDesign"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Controller
                          name="storyBehindDesign"
                          control={form.control}
                          render={({ field }) => (
                            <TipTapEditor
                              value={field.value || ''}
                              onChange={field.onChange}
                              placeholder="Share the story behind your design..."
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </section>
           
              {/* Media Section - IMPROVED VERSION with working variant-specific uploads */}
              <section className="px-3 py-6 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">Product Images</h2>
              <Separator className="mb-6" />
              
              <p className="mb-4 text-sm text-gray-500">
                Add images for your product. The first image will be used as the thumbnail.
              </p>
              
              <div className="mb-6">
                <Tabs defaultValue="upload" onValueChange={setActiveImageTab} value={activeImageTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 p-1 mb-4 bg-gray-100 rounded-md">
                    <TabsTrigger 
                      value="upload" 
                      className="data-[state=active]:bg-white data-[state=active]:text-[#e65100] data-[state=active]:shadow-sm rounded-md"
                    >
                      <IconUpload size={16} className="mr-2" />
                      Upload Images
                    </TabsTrigger>
                    <TabsTrigger 
                      value="url" 
                      className="data-[state=active]:bg-white data-[state=active]:text-[#e65100] data-[state=active]:shadow-sm rounded-md"
                    >
                      <IconLink size={16} className="mr-2" />
                      Add from URL
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload">
                    {hasVariants && imageAssociatedOptions.length > 0 ? (
                      // ✅ FIXED: Pass all required props to StreamlinedImageManager
                      <StreamlinedImageManager
                        mediaItems={mediaItems}
                        setMediaItems={setMediaItems}
                        options={form.getValues('options')}
                        variants={form.getValues('variants')}
                        fileInputRef={fileInputRef}
                        handleFileChange={handleFileChange}
                        payloadImageSettings={payloadImageSettings}
                        getImagesForOptionValue={getImagesForOptionValue}
                        getImagesForColorSizeCombination={getImagesForColorSizeCombination}
                        isColorOption={isColorOption}
                        isSizeOption={(title: string) => isSizeOption(title.toLowerCase())}
                      />
                    ) : (
                      // Show standard upload interface when no variant-specific images needed
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          if (fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }}
                        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#e65100] hover:bg-orange-50 transition-all duration-200"
                      >
                        <div className="flex items-center justify-center w-16 h-16 mb-3 bg-orange-100 rounded-full">
                          <IconPhotoPlus size={28} className="text-[#e65100]" />
                        </div>
                        <p className="font-medium text-gray-700">Drag and drop images here</p>
                        <p className="mt-1 text-sm text-gray-500">
                          or click to browse your files
                        </p>
                        <p className="mt-4 text-xs text-gray-500">
                          Supports: JPG, PNG, GIF (Max 5MB)
                        </p>
                      </div>
                    )}
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="hidden"
                    />
                  </TabsContent>
                    
                    <TabsContent value="url">
                      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="mb-3 text-sm text-gray-600">
                          Add images from external URLs to your product gallery
                        </p>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="url"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddImageUrl(e);
                              }
                            }}
                          />
                          <Button 
                            onClick={(e) => handleAddImageUrl(e)} 
                            type="button"
                            className="bg-[#e65100] hover:bg-[#d84315] text-white"
                          >
                            Add Image
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                
                {/* Show general images only when not in variant-specific mode */}
                {(!hasVariants || imageAssociatedOptions.length === 0) && (
                  mediaItems.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {mediaItems.sort((a, b) => a.rank - b.rank).map((item, index) => (
                        <div
                          key={`${item.url}-${index}`}
                          className="relative flex flex-col overflow-hidden transition-all duration-200 bg-white border rounded-md group hover:shadow-md"
                        >
                          <div className="relative flex items-center justify-center h-48 overflow-hidden bg-gray-100">
                            <img
                              src={item.url}
                              alt={`Product image ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 bg-black bg-opacity-0 opacity-0 group-hover:bg-opacity-20 group-hover:opacity-100">
                              <div className="flex space-x-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (index === 0) return;
                                    setMediaItems((prev) => {
                                      const newMedia = [...prev];
                                      const temp = newMedia[index - 1];
                                      newMedia[index - 1] = { ...newMedia[index], rank: index - 1 };
                                      newMedia[index] = { ...temp, rank: index };
                                      return newMedia;
                                    });
                                  }}
                                  disabled={index === 0}
                                  className="p-1 text-white bg-gray-800 rounded-full disabled:opacity-50 hover:bg-gray-700"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (index === mediaItems.length - 1) return;
                                    setMediaItems((prev) => {
                                      const newMedia = [...prev];
                                      const temp = newMedia[index + 1];
                                      newMedia[index + 1] = { ...newMedia[index], rank: index + 1 };
                                      newMedia[index] = { ...temp, rank: index };
                                      return newMedia;
                                    });
                                  }}
                                  disabled={index === mediaItems.length - 1}
                                  className="p-1 text-white bg-gray-800 rounded-full disabled:opacity-50 hover:bg-gray-700"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 border-t">
                            <div className="flex-1 text-sm text-gray-600 truncate">
                              {item.file ? item.file.name.substring(0, 20) : `Image ${index + 1}`}
                              {item.variantInfo && (
                                <div className="mt-1">
                                  <Badge className="bg-[#e65100] text-white text-xs">
                                    {item.variantInfo.variantTitle || 
                                    item.variantInfo.optionName && item.variantInfo.optionValues?.[0] ? 
                                    `${item.variantInfo.optionName}: ${item.variantInfo.optionValues[0]}` : 
                                    'Variant'}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setMediaItems((prev) => {
                                  const removed = prev[index];
                                  if (removed.file) {
                                    URL.revokeObjectURL(removed.url);
                                  }
                                  // Return filtered array with reordered ranks
                                  const filtered = prev.filter((_, i) => i !== index);
                                  return filtered.map((item, i) => ({ ...item, rank: i }));
                                });
                              }}
                              className="p-1.5 text-red-500 bg-red-50 rounded-full hover:bg-red-100"
                            >
                              <IconTrash size={16} />
                            </button>
                          </div>
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-[#e65100] text-white text-xs px-2 py-1 rounded-md">
                              Main
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-gray-300 border-dashed rounded-md bg-gray-50">
                      <p className="text-gray-500">No images added yet. Add images to showcase your product.</p>
                    </div>
                  )
                )}
              </section>

              {/* Options & Variants Section with Junooni styling */}
              <section className="px-3 py-6 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Options & Variants</h2>
                <Separator className="mb-6" />
                
                {/* Variant Toggle */}
                <div className="mb-6">
                  <div className="flex items-center mb-4 space-x-2">
                    <Switch 
                      checked={hasVariants}
                      onCheckedChange={setHasVariants}
                      id="has-variants"
                      className="data-[state=checked]:bg-[#e65100]"
                    />
                    <label 
                      htmlFor="has-variants" 
                      className="font-medium text-gray-800 cursor-pointer"
                    >
                      This product has multiple variants
                    </label>
                  </div>
                  <div className="pl-10 mb-2 text-sm text-gray-600">
                    {hasVariants ? 
                      "Create variants like size or color that customers can choose from" : 
                      "A single variant will be created automatically"
                    }
                  </div>
                </div>
                
                {/* Default Variant Details - Only show when NOT using variants */}
                {!hasVariants && (
                  <div className="p-5 mb-8 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <h3 className="mb-4 font-medium text-gray-700">Default Variant Details</h3>
                    
                    <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="defaultVariantSku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-gray-700">SKU</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="e.g. LTH-BAG-001" 
                                className="w-full border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="defaultVariantPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-gray-700">Price</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                <Input 
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={field.value}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  placeholder="0.00" 
                                  className="w-full pl-7 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                
                {/* Options Section - Only show if variants are enabled */}
                {hasVariants && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-700">Product Options</h3>
                      <Badge variant="outline" className="text-[#e65100] border-[#e65100] bg-orange-50">
                        Required
                      </Badge>
                    </div>
                    
                    {/* <div className="p-4 mb-5 border border-orange-200 rounded-md bg-orange-50">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <IconInfoCircle className="h-5 w-5 text-[#e65100]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">
                            Add options like size or color to create variants of this product. Each combination will create a unique variant.
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#e65100]">
                            At least one option with values is required when using variants.
                          </p>
                        </div>
                      </div>
                    </div> */}
                    
                    {optionFields.map((opt, optionIndex) => (
                      <div key={opt.id} className="p-5 mb-4 transition-shadow duration-200 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <FormField
                            control={form.control}
                            name={`options.${optionIndex}.title`}
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel className="font-medium text-gray-700">
                                  Option {optionIndex + 1} name
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder={
                                      optionIndex === 0 ? "e.g. Size" : 
                                      optionIndex === 1 ? "e.g. Color" : "e.g. Material"
                                    }
                                    className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          {/* Don't allow removing the first option or if only one exists */}
                          {(optionIndex > 0 || optionFields.length > 1) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="mt-6 ml-2 text-gray-500 hover:text-red-500 hover:bg-red-50"
                              onClick={() => removeOption(optionIndex)}
                            >
                              <IconX size={18} />
                            </Button>
                          )}
                        </div>
                        
                        {/* Use Enhanced Option Component for all option types */}
                        <EnhancedOptionComponent
                          optionIndex={optionIndex}
                          currentOption={form.getValues('options')[optionIndex]}
                          updateOption={updateOption}
                          handleGenerateVariants={handleGenerateVariants}
                          form={form}
                        />
                      </div>
                    ))}
                    
                    {/* Add another option button (only if fewer than 3 options) */}
                    {optionFields.length < 3 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newOptionIndex = optionFields.length;
                          appendOption({ 
                            id: generateUUID(),
                            title: '', 
                            optionValues: [],
                            imageAssociation: false
                          });
                          setNewOptionValues(prev => ({
                            ...prev,
                            [newOptionIndex]: ''
                          }));
                        }}
                        className="mt-2 text-[#e65100] border-[#e65100] hover:bg-orange-50"
                      >
                        <IconCirclePlus className="mr-1.5" size={18} /> 
                        Add another option
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Variants Section with Bulk Editing */}
                {variantFields.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-medium text-gray-700">Product Variants ({variantFields.length})</h3>
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={handleGenerateVariants}
                        size="sm"
                        className="text-[#e65100] border-[#e65100] hover:bg-orange-50"
                      >
                        Regenerate variants
                      </Button>
                    </div>
                    
                    {/* Bulk Edit Controls */}
                    <Card className="mb-6 border-gray-200 shadow-sm">
                      <CardHeader className="pb-3 border-b bg-gray-50">
                        <CardTitle className="flex items-center text-base text-gray-700">
                          <IconEdit size={18} className="mr-2 text-[#e65100]" />
                          Bulk Edit
                        </CardTitle>
                        <CardDescription>
                          Apply changes to multiple variants at once
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center">
                            <Switch 
                              checked={bulkEditMode} 
                              onCheckedChange={setBulkEditMode} 
                              id="bulk-edit-mode"
                              className="data-[state=checked]:bg-[#e65100]"
                            />
                            <label htmlFor="bulk-edit-mode" className="ml-2 text-sm text-gray-700">
                              {bulkEditMode ? 'Exit bulk edit mode' : 'Enable bulk edit mode'}
                            </label>
                          </div>
                          
                          {bulkEditMode && (
                            <>
                              <div className="flex items-center mb-2">
                                <Switch 
                                  checked={selectedVariants.length === variantFields.length}
                                  onCheckedChange={handleSelectAllVariants}
                                  id="select-all-variants" 
                                  className="data-[state=checked]:bg-[#e65100]"
                                />
                                <label htmlFor="select-all-variants" className="ml-2 text-sm text-gray-700">
                                  Select all variants ({selectedVariants.length}/{variantFields.length})
                                </label>
                              </div>
                              
                              {selectedVariants.length > 0 && (
                                <div className="grid grid-cols-1 gap-4 mt-2 md:grid-cols-2">
                                  <div>
                                    <label className="block mb-1.5 text-sm text-gray-700">Set price for all selected</label>
                                    <div className="flex gap-2">
                                      <div className="relative flex-1">
                                        <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={bulkPrice}
                                          onChange={(e) => setBulkPrice(e.target.value)}
                                          placeholder="0.00"
                                          className="pl-7 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => handleBulkEdit('price', parseFloat(bulkPrice) || 0)}
                                        disabled={!bulkPrice}
                                        className="bg-[#e65100] hover:bg-[#d84315] text-white disabled:bg-gray-300"
                                      >
                                        Apply
                                      </Button>
                                    </div>
                                  </div>
                                  {/* <div>
                                    <label className="block mb-1.5 text-sm text-gray-700">Set stock for all selected</label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={bulkStock}
                                        onChange={(e) => setBulkStock(e.target.value)}
                                        placeholder="0"
                                        className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => handleBulkEdit('stock', parseInt(bulkStock) || 0)}
                                        disabled={!bulkStock}
                                        className="bg-[#e65100] hover:bg-[#d84315] text-white disabled:bg-gray-300"
                                      >
                                        Apply
                                      </Button>
                                    </div>
                                  </div> */}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Variants Table */}
                    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            {bulkEditMode && (
                              <th className="p-3 text-left border-r border-gray-200">
                                <span className="sr-only">Select</span>
                              </th>
                            )}
                            <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Variant</th>
                            <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">SKU</th>
                            <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Cost Price</th>
                            <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Price</th>
                            <th className="p-3 font-medium text-left text-gray-700 border-r border-gray-200">Your Profit</th>
                            <th className="px-2 py-3 font-medium text-center text-gray-700">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variantFields.map((vf, index) => (
                            <tr 
                              key={vf.id} 
                              className={`
                                ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                ${bulkEditMode && selectedVariants.includes(vf.id) ? "bg-orange-50" : ""}
                                hover:bg-orange-50 transition-colors duration-150
                              `}
                            >
                              {bulkEditMode && (
                                <td className="p-3 text-center border-r border-gray-200">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedVariants.includes(vf.id)} 
                                    onChange={() => handleToggleVariantSelection(vf.id)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#e65100] focus:ring-[#e65100]"
                                  />
                                </td>
                              )}
                              <td className="p-3 border-r border-gray-200">
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-800">{form.watch(`variants.${index}.title`)}</span>
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {form.watch(`variants.${index}.optionValues`, []).map((optVal: OptionValue, optIndex: number) => (
                                      <Badge 
                                        key={optIndex} 
                                        variant="outline" 
                                        className="text-xs text-[#e65100] border-orange-200 bg-orange-50"
                                      >
                                        {optVal.optionName}: {optVal.value}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 border-r border-gray-200">
                                <Input
                                  {...form.register(`variants.${index}.sku`)}
                                  onChange={(e) => handleVariantFieldChange(index, 'sku', e.target.value)}
                                  className="w-full border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                                />
                              </td>
                              <td className="p-3 border-r border-gray-200">
                                <div className="text-center">
                                  {(() => {
                                    const costPrice = getVariantCostPrice(index);
                                    return (
                                      <>
                                        <span className="font-medium text-orange-600">
                                          ₹{costPrice > 0 ? costPrice.toFixed(2) : '--'}
                                        </span>
                                        {/* {costPrice > 0 && (
                                          <div className="mt-1 text-xs text-gray-500">
                                            {(() => {
                                              const baseCost = canvasPricingData?.final_price_per_unit || 
                                                              enhancedProductData?.cost || 
                                                              0;
                                              const extraCost = costPrice - baseCost;
                                              console.log('Base Cost:', baseCost, 'Extra Cost:', extraCost);
                                              
                                              if (extraCost > 0) {
                                                  return `Base: ₹${baseCost.toFixed(2)} + ₹${extraCost.toFixed(2)}`;
                                                }
                                                return 'Base Cost';
                                              })()}
                                            </div>
                                          )} */}
                                        </>
                                      );
                                    })()}
                                  </div>
                              </td>
                             <td className="p-3 border-r border-gray-200">
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                  {/* <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.watch(`variants.${index}.price`) || ''}
                                    onChange={(e) => {
                                      const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                                      handleVariantFieldChange(index, 'price', value === '' ? 0 : value);
                                    }}
                                    className="w-full pl-7 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                                  /> */}
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    {...form.register(`variants.${index}.price`, {
                                      valueAsNumber: true
                                    })}
                                    className="w-full pl-7 border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]"
                                  />
                                </div>
                              </td>
                              <td className="p-3 border-r border-gray-200">
                                <div className="text-center">
                                  {(() => {
                                    const price = form.watch(`variants.${index}.price`) || 0;
                                    const costPrice = getVariantCostPrice(index);
                                    const profit = price - costPrice;
                                    
                                    return (
                                      <>
                                        <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          ₹{profit.toFixed(2)}
                                        </span>
                                        {/* {costPrice > 0 && (
                                          <div className="mt-1 text-xs text-gray-500">
                                            Margin: {price > 0 ? ((profit / price) * 100).toFixed(1) : '0'}%
                                          </div>
                                        )} */}
                                      </>
                                    );
                                  })()}
                                </div>
                              </td>
                              <td className="px-0 py-3 text-center">
                                <div className="flex justify-center space-x-0">
                                  {/* <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDuplicateVariant(index)}
                                    className="text-gray-600 hover:bg-gray-100"
                                    title="Duplicate variant"
                                  >
                                    <IconCopy size={16} />
                                  </Button> */}
                                  
                                  <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => removeVariant(index)}
                                    className="px-0 text-red-500 hover:bg-red-50"
                                    title="Remove variant"
                                  >
                                    <IconX size={16} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Status Card */}
              <section className="px-3 py-6 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Status & Visibility</h2>
                <Separator className="mb-6" />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="mb-5">
                      <FormLabel className="font-medium text-gray-700">Product Status</FormLabel>
                      <Select onValueChange={field.onChange}  value={field.value || "proposed"}  defaultValue="proposed">
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:ring-[#e65100]">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">
                            <div className="flex items-center">
                              <span className="w-2 h-2 mr-2 bg-gray-400 rounded-full"></span>
                              Draft
                            </div>
                          </SelectItem>
                          <SelectItem value="proposed">
                            <div className="flex items-center">
                              <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
                              Proposed
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-sm text-gray-500">
                        Draft products are not visible to customers
                      </FormDescription>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Category Selection */}
                {isLoadingCategories ? (
                <FormField
                  control={form.control}
                  name="category_ids"
                  render={({ field }) => (
                    <FormItem className="mb-5">
                      <FormLabel className="font-medium text-gray-700">Product Categories</FormLabel>
                      <Select disabled={true}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:ring-[#e65100]">
                            <SelectValue placeholder="Loading categories..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <div className="p-2 text-gray-500">Loading...</div>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-sm text-gray-500">
                        Select one or more categories for your product
                      </FormDescription>
                    </FormItem>
                  )}
                />
              ) : categoryError ? (
                <FormField
                  control={form.control}
                  name="category_ids"
                  render={({ field }) => (
                    <FormItem className="mb-5">
                      <FormLabel className="font-medium text-gray-700">Product Categories</FormLabel>
                      <Select disabled={true}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:ring-[#e65100]">
                            <SelectValue placeholder="Error loading categories" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <div className="p-2 text-sm text-red-500">{categoryError}</div>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-sm text-gray-500">
                        Select one or more categories for your product
                      </FormDescription>
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="category_ids"
                  render={({ field }) => (
                    <FormItem className="mb-5">
                      {/* <FormLabel className="font-medium text-gray-700">Product Categories</FormLabel> */}
                      
                      {/* Selected Categories Display */}
                      {/* {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {field.value.map((categoryId) => {
                            const category = findCategoryById(productCategories, categoryId);
                            return category ? (
                              <Badge 
                                key={categoryId}
                                variant="outline"
                                className="text-[#e65100] border-[#e65100] bg-orange-50 pr-1"
                              >
                                {category.title}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const newValue = field.value.filter(id => id !== categoryId);
                                    field.onChange(newValue);
                                  }}
                                  className="ml-1.5 hover:bg-orange-200 rounded-full p-0.5"
                                >
                                  <IconX size={14} />
                                </button>
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      )} */}
                      
                      {/* Category Selector Dropdown */}
                      <HierarchicalCategorySelector 
                        form={form} 
                        categories={productCategories} 
                        name="category_ids"
                        isMultiSelect={true}
                      />
                      
                      {/* <FormDescription className="text-sm text-gray-500">
                        Select one or more categories to help customers find your product
                      </FormDescription> */}
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              )}

                <FormField
                  control={form.control}
                  name="discountable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md">
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                          className="data-[state=checked]:bg-[#e65100]"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-gray-700">Discountable</FormLabel>
                        <FormDescription className="text-sm text-gray-500">
                          Allow this product to be used in discounts
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </section>
              
              {/* Shipping & Fulfillment Info Card */}
              {/* ✅ REPLACE: Entire Shipping & Fulfillment section */}
              {(payloadFulfillmentData.hasData || enhancedProductData) && (
              <section className="px-3 py-6 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Shipping & Fulfillment</h2>
                <Separator className="mb-4" />
                
                {/* Product Title and Technology Display */}
                <div className="mb-6 space-y-3">
                  <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                    <div className="flex items-start">
                      <div className="p-2 mr-3 text-orange-600 bg-orange-100 rounded-full">
                        <IconInfoCircle size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-800">Product </p>
                        {enhancedProductData?.name && enhancedProductData?.id ? (
                          <a
                            href={`/productCatalog/${enhancedProductData.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-base font-semibold text-orange-900 underline transition-colors duration-200 hover:text-orange-700 decoration-orange-300 hover:decoration-orange-500"
                          >
                            {enhancedProductData.name}
                            <IconExternalLink size={14} className="inline ml-1 mb-0.5" />
                          </a>
                        ) : (
                          <p className="mt-1 text-base font-semibold text-orange-900">
                            {enhancedProductData?.name || 
                            designData?.productInfo?.title || 
                            form.watch('title') || 
                            'Untitled Product'}
                          </p>
                        )}
                        {/* <p className="mt-1 text-base font-semibold text-orange-900">
                          {form.watch('title') || designData?.productInfo?.title || 'Untitled Product'}
                        </p> */}
                      </div>
                    </div>
                  </div>
                  
                 {(() => {
                  // Get the CANVAS-SELECTED technology from filteredProductData
                  const locationState = location.state as LocationState;
                  console.log('locationState:', locationState);
                  const canvasSelectedTech = locationState?.filteredProductData?.printT?.[0]?.technologyName;
                  const payloadBaseTech = designData?.printingTechnology || enhancedProductData?.printT?.[0]?.technologyName;
                  const displayTech = canvasSelectedTech || payloadBaseTech;
                  
                  return displayTech && (
                    <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                      <div className="flex items-start">
                        <div className="p-2 mr-3 text-orange-600 bg-orange-100 rounded-full">
                          <IconInfoCircle size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-orange-800">Print Technology</p>
                          <p className="mt-1 text-base font-semibold text-orange-900 uppercase">
                            {displayTech || 'Not specified'}
                          </p>
                          {/* Debug info - remove this after testing */}
                          {/* {canvasSelectedTech && canvasSelectedTech !== payloadBaseTech && (
                            <p className="mt-1 text-xs text-orange-600">
                              ✓ Canvas-selected (Base product: {payloadBaseTech})
                            </p>
                          )} */}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                </div>
                
                <Separator className="mb-4" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-full text-[#e65100]">
                    <IconTruck size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">JUNOONI Fulfillment</h3>
                    <p className="text-sm text-gray-600">Fulfillment managed by JUNOONI</p>
                  </div>
                </div>
                
                {/* ✅ NEW: PayloadCMS-based fulfillment info display */}
                {payloadFulfillmentData.hasData ? (
                  <div className="mt-6 space-y-4">
                    {payloadFulfillmentData.shippingTime && (
                      <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                        <div className="flex items-center">
                          <IconTruck size={18} className="mr-2 text-orange-600" />
                          <div>
                            <p className="font-medium text-orange-800">Shipping Time</p>
                            <p className="text-sm text-orange-600">{payloadFulfillmentData.shippingTime}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {payloadFulfillmentData.handlingTime && (
                      <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                        <div className="flex items-center">
                          <IconClock size={18} className="mr-2 text-orange-600" />
                          <div>
                            <p className="font-medium text-orange-800">Handling Time</p>
                            <p className="text-sm text-orange-600">{payloadFulfillmentData.handlingTime}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {payloadFulfillmentData.rushAvailable && payloadFulfillmentData.rushTime && (
                      <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                        <div className="flex items-center">
                          <IconClock size={18} className="mr-2 text-orange-600" />
                          <div>
                            <p className="font-medium text-orange-800">Rush Processing Available</p>
                            <p className="text-sm text-orange-600">Rush delivery: {payloadFulfillmentData.rushTime}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 mt-6 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center">
                      <IconInfoCircle size={18} className="mr-2 text-gray-500" />
                      <p className="text-sm text-gray-600">
                        No shipping information available for this product in the catalog.
                      </p>
                    </div>
                  </div>
                )}
              </section>
              )}
                
                {/* Stock Management Info - Keep this part */}
                {/* <div className="mt-6">
                  <h3 className="mb-2 font-medium text-gray-700">Stock Information</h3>
                  <p className="text-sm text-gray-600">
                    Stock levels you set for each variant will be tracked with each order.
                    Be sure to maintain sufficient inventory to fulfill orders promptly.
                  </p>
                  
                  <Alert className="mt-4">
                    <IconInfoCircle className="w-4 h-4" />
                    <AlertDescription>
                      Inventory will be managed automatically based on the stock levels you set for each variant.
                    </AlertDescription>
                  </Alert>
                </div> */}
              {/* </section>
              )} */}
              
              {/* Physical Details Card */}
              <section className="px-3 py-6 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Physical Details</h2>
                <Separator className="mb-6" />
                
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-gray-700">Weight (g)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0" 
                            placeholder="e.g. 400" 
                            className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-gray-700">Length(inch)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0" 
                              placeholder="e.g. 30" 
                              className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-gray-700">Width(inch)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0" 
                              placeholder="e.g. 20" 
                              className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-gray-700">Height(inch)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0" 
                              placeholder="e.g. 5" 
                              className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </section>
              
              {/* Additional Info Card */}
              <section className="p-4 pb-12 bg-white border border-gray-200 rounded-lg shadow-sm sm:mb-0 sm:p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Additional Info</h2>
                <Separator className="mb-6" />
                
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-gray-700">Material</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g. Cotton, Polyester" 
                            className="border-gray-300 focus:border-[#e65100] focus:ring-[#e65100]" 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="origin_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-gray-700">Country of Origin</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ''}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:ring-[#e65100]">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="IN">India</SelectItem>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CN">China</SelectItem>
                            <SelectItem value="JP">Japan</SelectItem>
                            <SelectItem value="KR">South Korea</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                            <SelectItem value="DE">Germany</SelectItem>
                            <SelectItem value="IT">Italy</SelectItem>
                            <SelectItem value="FR">France</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </section>
            </div>
          </div>
          
          {/* Bottom Action Bar - Fixed to bottom on mobile */}
          <div className="fixed bottom-0 left-0 right-0 z-10 px-4 py-2 bg-white border-t border-gray-200 sm:p-4 md:static md:bg-transparent md:border-0 md:p-0 md:mt-6">
            <div className="flex justify-center gap-4 space-x-3 mxfy-auto sm:justify-end max-w-7xl">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => navigate({ to: '/productCatalog' })}
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleManualSubmit} 
                disabled={isSubmitting}
                className="bg-[#e65100] hover:bg-[#d84315] text-white shadow-sm"
              >
                {isSubmitting ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
      
      {/* Error Display */}
      {error && (
        <div className="fixed max-w-md p-4 border border-red-200 rounded-lg shadow-lg bottom-4 right-4 bg-red-50">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <IconX className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">
                {error}
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 ml-4 text-red-400 hover:text-red-500"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Create;