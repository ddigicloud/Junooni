import { FulfillmentWorkflow } from "@medusajs/framework/types";
type OptionsInput = (FulfillmentWorkflow.CreateShippingOptionsWorkflowInput | FulfillmentWorkflow.UpdateShippingOptionsWorkflowInput)[];
export declare const validateShippingOptionPricesStepId = "validate-shipping-option-prices";
/**
 * Validate that shipping options can be crated based on provided price configuration.
 *
 * For flat rate prices, it validates that regions exist for the shipping option prices.
 * For calculated prices, it validates with the fulfillment provider if the price can be calculated.
 */
export declare const validateShippingOptionPricesStep: import("@medusajs/framework/workflows-sdk").StepFunction<OptionsInput, undefined>;
export {};
//# sourceMappingURL=validate-shipping-option-prices.d.ts.map