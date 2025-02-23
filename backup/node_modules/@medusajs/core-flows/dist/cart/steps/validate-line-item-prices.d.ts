export interface ValidateLineItemPricesStepInput {
    items: {
        unit_price?: number | null;
        title: string;
    }[];
}
export declare const validateLineItemPricesStepId = "validate-line-item-prices";
/**
 * This step validates the specified line item objects to ensure they have prices.
 */
export declare const validateLineItemPricesStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateLineItemPricesStepInput, unknown>;
//# sourceMappingURL=validate-line-item-prices.d.ts.map