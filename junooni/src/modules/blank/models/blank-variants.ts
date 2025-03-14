import { model } from "@medusajs/framework/utils";
import Blank from "./blank";
//import BlankOptions from "./blank-options";
import BlankOptionValue from "./blank-option-values";


export const BlankVariants = model.define("blank_variants", {
  id: model.id().primaryKey(),
 
  title :model.text(),

   
  price: model.number().default(0),
  stock_quantity: model.number().default(0),
  
  sku: model.text().unique(),
  hs_code: model.text(),
  blank: model.belongsTo(() => Blank, {
    mappedBy: "variants", // Reference to the relationship in the BlankVariants model
   
  }),
options:model.manyToMany(() => BlankOptionValue, {
  mappedBy: "variants", // Reference to the relationship in the BlankVariants model
 
}),
  // Relationship back to Blank
  variant_rank:model.number().default(0),
  
})

export default BlankVariants;