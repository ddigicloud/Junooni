import { OrderChangeDTO, OrderDTO, OrderWorkflow } from "@medusajs/framework/types";
import { OrderPreviewDTO } from "@medusajs/types";
/**
 * This step validates that an order transfer can be accepted.
 */
export declare const acceptOrderTransferValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<{
    token: string;
    order: OrderDTO;
    orderChange: OrderChangeDTO;
}, unknown>;
export declare const acceptOrderTransferWorkflowId = "accept-order-transfer-workflow";
/**
 * This workflow accepts an order transfer.
 */
export declare const acceptOrderTransferWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.AcceptOrderTransferWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=accept-order-transfer.d.ts.map