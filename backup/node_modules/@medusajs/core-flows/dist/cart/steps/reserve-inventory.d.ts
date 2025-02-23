import { BigNumberInput } from "@medusajs/types";
export interface ReserveVariantInventoryStepInput {
    items: {
        id?: string;
        inventory_item_id: string;
        required_quantity: number;
        allow_backorder: boolean;
        quantity: BigNumberInput;
        location_ids: string[];
    }[];
}
export declare const reserveInventoryStepId = "reserve-inventory-step";
/**
 * This step reserves the quantity of line items from the associated
 * variant's inventory.
 */
export declare const reserveInventoryStep: import("@medusajs/framework/workflows-sdk").StepFunction<ReserveVariantInventoryStepInput, import("@medusajs/types").ReservationItemDTO[]>;
//# sourceMappingURL=reserve-inventory.d.ts.map