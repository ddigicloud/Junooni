import { model } from "@medusajs/framework/utils";
//import Blank from "./blank";
import BlankOptions from "./blank-options";
import BlankVariants from "./blank-variants";


export const BlankOptionValue = model.define("blank_option_values", {
  id: model.id().primaryKey(),
 
  value :model.text(),

 
option:model.belongsTo(() => BlankOptions, {
    mappedBy: "values",
  eager: false, // Automatically load variants
}),
  // Relationship back to Blank
  variants: model.manyToMany(() => BlankVariants, {
    mappedBy: "options", // Maps to "options" in BlankVariants
  }), 
  
})

export default BlankOptionValue;