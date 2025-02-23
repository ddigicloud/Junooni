import { CreatePriceSetDTO, PriceRule } from "@medusajs/framework/types";
export interface ShippingOptionsPriceCurrencyCode {
    currency_code: string;
    amount: number;
    rules?: PriceRule[];
}
interface ShippingOptionsPriceRegionId {
    region_id: string;
    amount: number;
    rules?: PriceRule[];
}
export type CreateShippingOptionsPriceSetsStepInput = {
    id: string;
    prices: (ShippingOptionsPriceCurrencyCode | ShippingOptionsPriceRegionId)[];
}[];
export declare function buildPriceSet(prices: CreateShippingOptionsPriceSetsStepInput[0]["prices"], regionToCurrencyMap: Map<string, string>): CreatePriceSetDTO;
export declare const createShippingOptionsPriceSetsStepId = "add-shipping-options-prices-step";
/**
 * This step creates price sets for one or more shipping options.
 */
export declare const createShippingOptionsPriceSetsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateShippingOptionsPriceSetsStepInput, {
    id: string;
    priceSetId: string;
}[]>;
export {};
//# sourceMappingURL=add-shipping-options-prices.d.ts.map