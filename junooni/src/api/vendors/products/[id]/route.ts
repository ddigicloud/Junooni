import {
    AuthenticatedMedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework/http";
  import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
  import MarketplaceModuleService from "../../../../modules/marketplace/service";
  import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";
 
  import { createProductsWorkflow, deleteProductsWorkflow, deleteProductsWorkflowId } from "@medusajs/medusa/core-flows";
  import {
      CreateProductDTO,
    CreateProductWorkflowInputDTO,
    IProductModuleService,
    ISalesChannelModuleService,
    UpdateProductDTO,
    ProductOptionDTO,
    ProductDTO,
    UpsertProductOptionDTO
  } from "@medusajs/framework/types";
  import {  QueryContext } from "@medusajs/framework/utils";
 
  export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
  ) => {
    try {
      const { id } = req.params; // Extract product ID from URL parameters
      const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
      const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE);
 
      // Retrieve the vendor admin details
      const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
        req.auth_context.actor_id,
        {
          relations: ["vendor"],
        }
      );
 
      // Retrieve the vendor's products including all relations
      const {
        data: [vendor],
      } = await query.graph({
        entity: "vendor",
        fields: [
          "products.*",
          "products.variants.*",
          "products.images.*",
          "products.options.*",
          "products.options.metadata.*",
          "products.variants.options.*",
          "products.options.values.*",
          "products.variants.calculated_price.*",
          "products.variants.inventory_items.*",
          "products.description_parts",
          "products.variants.inventory_items.inventory_item_id",
          "products.variants.inventory_items.stocked_quantity",
         
          "products.brand.*",
          "products.categories.*",
          "products.tags.*",
          "products.vendor.*",
          "products.metadata"
   
         
         
        ],
        filters: {
          id: vendorAdmin.vendor.id,
        },
        context: {
          products: {
            variants: {
              calculated_price: QueryContext({
                currency_code: "inr"
              })
            }
          }
        },
      });




      if (!vendor || !vendor.products) {
        return res.status(404).json({ message: "Vendor or products not found" });
      }
 
      // Find the product by ID within the vendor's products
      const product = vendor.products.find((p) => p.id === id);
 
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
 
      // Enrich the product data
      const formattedProduct = {
        ...product,
        options: product.options?.map((option) => ({
          ...option,
          values: option.values?.map((value) => ({
            ...value,
          })) || [],
        })) || [],
        images: product.images?.map((image) => ({
          ...image,
        })) || [],
        variants: product.variants?.map((variant) => ({
          ...variant,
         
          options: variant.options?.map((variantOption) => ({
            ...variantOption,
            option: product.options?.find(
              (option) => option.id === variantOption.option_id
            ),
          })) || [],
        })) || [],
      };
 
      res.json({ product: formattedProduct });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({
        message: "Failed to fetch product",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
 
 
  import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";


  export const PUT = async (
    req: AuthenticatedMedusaRequest<UpdateProductDTO>,
    res: MedusaResponse
  ) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Product ID is required" });
      }
 
      // Validate request body
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Update data is required" });
      }
 
      const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
      const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE);
 
      // Retrieve the vendor admin details
      const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
        req.auth_context.actor_id,
        {
          relations: ["vendor"],
        }
      );
 
      // Verify the product belongs to the vendor and get current product data
      const {
        data: [vendor],
      } = await query.graph({
        entity: "vendor",
        fields: ["products.*", "products.images.*","products.variants.*","products.options.values.*","products.options.*","products.options.metadata","products.metadata"],
        filters: {
          id: vendorAdmin.vendor.id,
        },
      });
 
      const currentProduct = vendor?.products?.find((p) => p.id === id);
      if (!currentProduct) {
        return res.status(404).json({
          message: "Product not found or does not belong to this vendor"
        });
      }
 
      // Handle image updates properly
      const updateData: UpdateProductDTO = {
        ...req.body,
      };
 
      // If images are provided in the update, update the image URLs directly
      if (Array.isArray(updateData.images)) {
        updateData.images = updateData.images.map(image => ({
          url: image.url,
          id: image.id
        }));
      }
 
      // Run the update workflow
      const { result: updatedProducts } = await updateProductsWorkflow(req.scope).run({
        input: {
          selector: { id },
          update: updateData,
          additional_data: {
            vendor_id: vendorAdmin.vendor.id
          },
        },
      });
 
      const updatedProduct = updatedProducts?.[0];
      if (!updatedProduct) {
        return res
          .status(404)
          .json({ message: "Product not found or not updated" });
      }
 
      // Fetch the updated product with all relations to ensure we have the latest data
      const {
        data: [updatedVendor],
      } = await query.graph({
        entity: "vendor",
        fields: [
          "products.*",
          "products.variants.*",
          "products.images.*",
          "products.options.*",
          "products.options.metadata.*",
          "products.variants.options.*",
          "products.options.values.*",
          "products.variants.calculated_price.*",
          "products.variants.inventory_items.*",
          "products.size_chart.*",
          "products.description_parts",
          "products.brand.*",
          "products.categories.*",
          "products.tags.*",
          "products.vendor.*",
          "products.metadata"
   
        ],
        filters: {
          id: vendorAdmin.vendor.id,
        },
        context: {
          products: {
            variants: {
              calculated_price: QueryContext({ currency_code: "inr" }), // 👈
            },
          },
        },
      });
 
      const finalProduct = updatedVendor?.products?.find(p => p.id === id);
 
      // Return the updated product with all relations
      res.status(200).json({ product: finalProduct });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        message: "Failed to update product",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };


 
  export const DELETE = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
  ) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Product ID is required" });
      }
 
      const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
      const marketplaceModuleService: MarketplaceModuleService =
        req.scope.resolve(MARKETPLACE_MODULE);
 
      // Retrieve the vendor admin details
      const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
        req.auth_context.actor_id,
        {
          relations: ["vendor"],
        }
      );
 
      // Verify the product belongs to the vendor
      const {
        data: [vendor],
      } = await query.graph({
        entity: "vendor",
        fields: ["products.id"],
        filters: {
          id: vendorAdmin.vendor.id,
        },
      });
 
      const vendorProduct = vendor?.products?.find((p) => p.id === id);
      if (!vendorProduct) {
        return res.status(404).json({
          message: "Product not found or does not belong to this vendor"
        });
      }
 
      // Register a hook for the delete workflow
      deleteProductsWorkflow.hooks.productsDeleted(
        async ({ ids }, { container }) => {
          // You can add any post-deletion logic here if needed
          console.log("Products deleted:", ids);
        }
      );
 
      // Run the delete workflow
      const { result } = await deleteProductsWorkflow(req.scope).run({
        input: {
          ids: [id]
        }
      });
 
      if (!result) {
        return res.status(404).json({
          message: "Product could not be deleted"
        });
      }
 
      res.status(200).json({
        message: "Product deleted successfully",
        id: id
      });
 
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({
        message: "Failed to delete product",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

