export type GetVariantAvailabilityStepInput = {
    variant_ids: string[];
    sales_channel_id: string;
};
export declare const getVariantAvailabilityId = "get-variant-availability";
/**
 * Computes the varaint availability for a list of variants in a given sales channel
 */
export declare const getVariantAvailabilityStep: import("@medusajs/framework/workflows-sdk").StepFunction<GetVariantAvailabilityStepInput, {
    [variant_id: string]: {
        availability: number;
        sales_channel_id: string;
    };
}>;
//# sourceMappingURL=get-variant-availability.d.ts.map