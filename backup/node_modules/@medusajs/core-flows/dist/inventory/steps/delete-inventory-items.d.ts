import { BigNumberInput } from "@medusajs/types";
export interface ValidateInventoryDeleteStepInput {
    inventory_items: {
        id: string;
        reserved_quantity: BigNumberInput;
    }[];
}
export declare const validateVariantInventoryStepId = "validate-inventory-item-delete";
export declare const validateInventoryDeleteStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateInventoryDeleteStepInput, unknown>;
export declare const deleteInventoryItemStepId = "delete-inventory-item-step";
/**
 * This step deletes one or more inventory items.
 */
export declare const deleteInventoryItemStep: import("@medusajs/framework/workflows-sdk").StepFunction<string[], undefined>;
//# sourceMappingURL=delete-inventory-items.d.ts.map