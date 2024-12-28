import { MedusaService } from "@medusajs/framework/utils";
import Blank from "./models/blank";
import BlankVariants from "./models/blank-variants";
import BlankOptions from "./models/blank-options";
import BlankOptionValue from "./models/blank-option-values";
import BlankImages from "./models/blank-images";

class blankProductModuleService extends MedusaService({
  Blank,
  BlankVariants,
  BlankOptions,
  BlankOptionValue,
  BlankImages,

}) {}

export default blankProductModuleService;
