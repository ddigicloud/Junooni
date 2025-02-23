import { OrderDTO, OrderWorkflow } from "@medusajs/framework/types";
import { CustomerDTO, OrderPreviewDTO } from "@medusajs/types";
/**
 * This step validates that an order transfer can be requested.
 */
export declare const requestOrderTransferValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<{
    order: OrderDTO;
    customer: CustomerDTO;
}, unknown>;
export declare const requestOrderTransferWorkflowId = "request-order-transfer-workflow";
/**
 * This workflow requests an order transfer.
 *
 * Can be initiated by a store admin or the customer.
 * If customer requested the transfer `input.logged_in_user === input.customer_id`.
 */
export declare const requestOrderTransferWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.RequestOrderTransferWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=request-order-transfer.d.ts.map