import { model } from "@medusajs/framework/utils"
import Blank from "./blank"
import { url } from "inspector";

export const BlankImages = model.define("blank_images", {
  id: model.id().primaryKey(),  
  
  rank: model.number().default(0),
   
  url: model.text().unique(),
  blank: model.belongsTo(() => Blank, {
    mappedBy: "images", // Reference to the relationship in the Blank model
    eager: false, // Only load the parent blank if explicitly queried
  }),
  // Relationship back to Blank
  
})

export default BlankImages;