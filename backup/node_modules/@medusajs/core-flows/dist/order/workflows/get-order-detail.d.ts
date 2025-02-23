import { OrderDetailDTO } from "@medusajs/framework/types";
export declare const getOrderDetailWorkflowId = "get-order-detail";
/**
 * This workflow retrieves an order's details.
 */
export declare const getOrderDetailWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<{
    filters?: {
        is_draft_order?: boolean;
        customer_id?: string;
    };
    fields: string[];
    order_id: string;
    version?: number;
}, OrderDetailDTO, []>;
//# sourceMappingURL=get-order-detail.d.ts.map