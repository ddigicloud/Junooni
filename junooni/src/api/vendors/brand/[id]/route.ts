import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { BRAND_MODULE } from "../../../../modules/brand";
import BrandModuleService from "../../../../modules/brand/service";

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const brandModuleService: BrandModuleService = req.scope.resolve(
    BRAND_MODULE
  );

  const { id } = req.params; // Retrieve the ID from the route parameter

  try {
    // Assuming `retrieveBrand` is implemented in the BrandModuleService
    const brand = await brandModuleService.retrieveBrand(id);

    if (!brand) {
      return res.status(404).json({ message: `Brand with ID ${id} not found.` });
    }

    res.json({ brand });
  } catch (error) {
    console.error("Error fetching brand:", error);
    res.status(500).json({ message: "Failed to fetch brand", error: error.message });
  }
};
