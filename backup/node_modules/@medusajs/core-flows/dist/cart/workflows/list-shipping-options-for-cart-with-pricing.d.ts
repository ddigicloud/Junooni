export declare const listShippingOptionsForCartWithPricingWorkflowId = "list-shipping-options-for-cart-with-pricing";
/**
 * This workflow lists the shipping options of a cart.
 */
export declare const listShippingOptionsForCartWithPricingWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<{
    cart_id: string;
    options?: {
        id: string;
        data?: Record<string, unknown>;
    }[];
    is_return?: boolean;
    enabled_in_store?: boolean;
}, any[], []>;
//# sourceMappingURL=list-shipping-options-for-cart-with-pricing.d.ts.map