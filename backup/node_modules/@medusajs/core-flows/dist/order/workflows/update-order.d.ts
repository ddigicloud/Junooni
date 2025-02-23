import { OrderDTO, OrderWorkflow } from "@medusajs/framework/types";
import { OrderPreviewDTO } from "@medusajs/types";
/**
 * This step validates that an order can be updated with provided input.
 */
export declare const updateOrderValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<{
    order: OrderDTO;
    input: OrderWorkflow.UpdateOrderWorkflowInput;
}, unknown>;
export declare const updateOrderWorkflowId = "update-order-workflow";
/**
 * Update order workflow.
 */
export declare const updateOrderWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.UpdateOrderWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=update-order.d.ts.map