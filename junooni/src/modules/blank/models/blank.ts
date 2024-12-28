import { JSONProperty, model } from "@medusajs/framework/utils"
import BlankVariants from "./blank-variants";
import BlankImages from "./blank-images";
import BlankOptions from "./blank-options";

export const Blank = model.define("blank", {
  // Primary identifier
  id: model.id().primaryKey(),

  // Basic product information
  title: model.text(),
  handle: model.text().unique(), // Ensure unique URL-friendly identifier
  
  // Product status management
  status: model.enum(["draft", "published", "archived"]), // Added 'archived' for completeness
  
  // Fabric code for internal tracking
  fcode: model.text(),

  // Customization dimensions
  customisation_height: model.number(), // Prevent negative heights
  customisation_width: model.number(),  // Prevent negative widths
  variants: model.hasMany(() => BlankVariants,{
    mappedBy: "blank", // Reference to the relationship in the BlankVariants model
    
  }),
  options: model.hasMany(() => BlankOptions, {
    mappedBy: "blank", // Reference to the relationship in the BlankVariants model
    eager: true // Automatically load variants
  }),
  // Optional image representation
  images: model.hasMany(() => BlankImages, {
    mappedBy: "blank", // Reference to the relationship in the BlankVariants model
    eager: true // Automatically load variants
  }),
  

  // Additional metadata for flexibility
  metadata: model.json(),

  
})

export default Blank;