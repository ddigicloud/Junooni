import { OrderChangeDTO, OrderDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * This step validates that a requested order transfer can be declineed.
 */
export declare const declineTransferOrderRequestValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<{
    order: OrderDTO;
    orderChange: OrderChangeDTO;
    input: OrderWorkflow.DeclineTransferOrderRequestWorkflowInput;
}, unknown>;
export declare const declineTransferOrderRequestWorkflowId = "decline-transfer-order-request";
/**
 * This workflow declines a requested order transfer.
 *
 * Only the original customer (who has the token) is allowed to decline the transfer.
 */
export declare const declineOrderTransferRequestWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.DeclineTransferOrderRequestWorkflowInput, unknown, any[]>;
//# sourceMappingURL=decline-order-transfer.d.ts.map