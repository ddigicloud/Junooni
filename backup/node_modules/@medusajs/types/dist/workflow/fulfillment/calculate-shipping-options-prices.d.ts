import { CalculatedShippingOptionPrice } from "../../fulfillment";
export type CalculateShippingOptionsPricesWorkflowInput = {
    cart_id: string;
    shipping_options: {
        id: string;
        data?: Record<string, unknown>;
    }[];
};
export type CalculateShippingOptionsPricesWorkflowOutput = CalculatedShippingOptionPrice[];
//# sourceMappingURL=calculate-shipping-options-prices.d.ts.map