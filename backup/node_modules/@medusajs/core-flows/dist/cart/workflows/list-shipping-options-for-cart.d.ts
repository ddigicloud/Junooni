export declare const listShippingOptionsForCartWorkflowId = "list-shipping-options-for-cart";
/**
 * This workflow lists the shipping options of a cart.
 */
export declare const listShippingOptionsForCartWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<{
    cart_id: string;
    option_ids?: string[];
    is_return?: boolean;
    enabled_in_store?: boolean;
}, any, []>;
//# sourceMappingURL=list-shipping-options-for-cart.d.ts.map