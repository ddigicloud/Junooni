import { model } from "@medusajs/framework/utils"
import Blank from "./blank";
//import BlankVariants from "./blank-variants";
import BlankOptionValue from "./blank-option-values";

export const BlankOptions = model.define("blank_options", {
  id: model.id().primaryKey(),
 
 title: model.text(),
  
blank: model.belongsTo(() => Blank, {
    mappedBy: "options", // Reference to the relationship in the Blank model
    eager: false, // Only load the parent blank if explicitly queried
  }),
  values: model.hasMany(() => BlankOptionValue,{
    mappedBy: "option", // Maps to "option" in BlankOptionValue
  }),
  
})

export default BlankOptions;