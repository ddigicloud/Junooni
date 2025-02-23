import { FilterableOrderProps, UpdateOrderDTO } from "@medusajs/framework/types";
export type UpdateOrdersStepInput = {
    selector: FilterableOrderProps;
    update: UpdateOrderDTO;
};
export declare const updateOrdersStepId = "update-orders";
/**
 * This step updates orders matching the specified filters.
 */
export declare const updateOrdersStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateOrdersStepInput, import("@medusajs/framework/types").OrderDTO[]>;
//# sourceMappingURL=update-orders.d.ts.map