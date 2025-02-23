import { CartLineItemDTO, CartShippingMethodDTO, CartWorkflowDTO, ItemTaxLineDTO, OrderLineItemDTO, OrderShippingMethodDTO, OrderWorkflowDTO, ShippingTaxLineDTO } from "@medusajs/framework/types";
export interface GetItemTaxLinesStepInput {
    orderOrCart: OrderWorkflowDTO | CartWorkflowDTO;
    items: OrderLineItemDTO[] | CartLineItemDTO[];
    shipping_methods: OrderShippingMethodDTO[] | CartShippingMethodDTO[];
    force_tax_calculation?: boolean;
    is_return?: boolean;
    shipping_address?: OrderWorkflowDTO["shipping_address"];
}
export declare const getItemTaxLinesStepId = "get-item-tax-lines";
/**
 * This step retrieves the tax lines for an order's line items and shipping methods.
 */
export declare const getItemTaxLinesStep: import("@medusajs/framework/workflows-sdk").StepFunction<GetItemTaxLinesStepInput, {
    lineItemTaxLines: ItemTaxLineDTO[];
    shippingMethodsTaxLines: ShippingTaxLineDTO[];
}>;
//# sourceMappingURL=get-item-tax-lines.d.ts.map