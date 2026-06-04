import {
  Megaphone, Image as ImageIcon, ShoppingBag, Star, Layers,
  BookOpen, Type, Video, Share2, Link as LinkIcon, Settings,
  Minus, Radio, Columns, Grid
} from "lucide-react"
import type { SectionType } from "./types"

export const SECTION_BLOCKS: {
  type: SectionType
  label: string
  icon: React.ReactNode
  desc: string
  color: string
  category: string
}[] = [
  { type: "announcement",       label: "Announcement Bar",      icon: <Megaphone className="w-3.5 h-3.5" />,   desc: "Top banner with message",              color: "#f59e0b", category: "layout"   },
  { type: "hero",               label: "Hero Banner",           icon: <ImageIcon className="w-3.5 h-3.5" />,   desc: "Big headline + CTA buttons",           color: "#8b5cf6", category: "layout"   },
  { type: "collection",         label: "Product Grid",          icon: <ShoppingBag className="w-3.5 h-3.5" />, desc: "All products / filtered grid",         color: "#e65100", category: "products" },
  // { type: "featured",           label: "Featured Products",     icon: <Star className="w-3.5 h-3.5" />,        desc: "Hand-picked highlights",               color: "#ec4899", category: "products" },
  { type: "featured_collections",label: "Collections Showcase", icon: <Layers className="w-3.5 h-3.5" />,     desc: "Pick collections to feature",          color: "#7c3aed", category: "products" },
  { type: "about",              label: "About",                 icon: <BookOpen className="w-3.5 h-3.5" />,    desc: "Story + image block",                  color: "#10b981", category: "content"  },
  { type: "text",               label: "Text Block",            icon: <Type className="w-3.5 h-3.5" />,        desc: "Rich text / Markdown",                 color: "#14b8a6", category: "content"  },
  { type: "image",              label: "Image",                 icon: <ImageIcon className="w-3.5 h-3.5" />,   desc: "Full-width image",                     color: "#6366f1", category: "content"  },
  { type: "video",              label: "Video",                 icon: <Video className="w-3.5 h-3.5" />,       desc: "YouTube / Vimeo embed",                color: "#f43f5e", category: "content"  },
  { type: "social",             label: "Social Links",          icon: <Share2 className="w-3.5 h-3.5" />,      desc: "Instagram, YouTube etc.",              color: "#3b82f6", category: "content"  },
  { type: "links",              label: "Link List",             icon: <LinkIcon className="w-3.5 h-3.5" />,    desc: "Bio-style link buttons",               color: "#0ea5e9", category: "content"  },
  { type: "html",               label: "Custom HTML",           icon: <Settings className="w-3.5 h-3.5" />,    desc: "Raw HTML / CSS / JS",                  color: "#ef4444", category: "advanced" },
  { type: "divider",            label: "Divider",               icon: <Minus className="w-3.5 h-3.5" />,       desc: "Visual separator",                     color: "#9ca3af", category: "layout"   },
  { type: "ticker",             label: "Scrolling Ticker",      icon: <Radio className="w-3.5 h-3.5" />,       desc: "Marquee text banner",                  color: "#f59e0b", category: "layout"   },
  { type: "image_text",         label: "Image with Text",       icon: <Columns className="w-3.5 h-3.5" />,     desc: "Image + rich text side by side",       color: "#8b5cf6", category: "content"  },
  { type: "video_text",         label: "Video with Text",       icon: <Video className="w-3.5 h-3.5" />,       desc: "Video + rich text side by side",       color: "#f43f5e", category: "content"  },
  { type: "featured_product",   label: "Featured Product",      icon: <Star className="w-3.5 h-3.5" />,        desc: "Spotlight one product with text",      color: "#ec4899", category: "products" },
  { type: "category_products",  label: "Category Products",     icon: <Grid className="w-3.5 h-3.5" />,        desc: "Products in this category",            color: "#f59e0b", category: "layout"   },
]