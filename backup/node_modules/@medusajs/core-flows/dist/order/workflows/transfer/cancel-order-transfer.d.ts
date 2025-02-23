import { OrderChangeDTO, OrderDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * This step validates that a requested order transfer can be canceled.
 */
export declare const cancelTransferOrderRequestValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<{
    order: OrderDTO;
    orderChange: OrderChangeDTO;
    input: OrderWorkflow.CancelTransferOrderRequestWorkflowInput;
}, unknown>;
export declare const cancelTransferOrderRequestWorkflowId = "cancel-transfer-order-request";
/**
 * This workflow cancels a requested order transfer.
 *
 * Customer that requested the transfer or a store admin are allowed to cancel the order transfer request.
 */
export declare const cancelOrderTransferRequestWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.CancelTransferOrderRequestWorkflowInput, unknown, any[]>;
//# sourceMappingURL=cancel-order-transfer.d.ts.map