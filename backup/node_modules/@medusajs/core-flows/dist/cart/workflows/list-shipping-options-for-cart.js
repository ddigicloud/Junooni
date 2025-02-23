"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listShippingOptionsForCartWorkflow = exports.listShippingOptionsForCartWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const use_remote_query_1 = require("../../common/steps/use-remote-query");
const fields_1 = require("../utils/fields");
exports.listShippingOptionsForCartWorkflowId = "list-shipping-options-for-cart";
/**
 * This workflow lists the shipping options of a cart.
 */
exports.listShippingOptionsForCartWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.listShippingOptionsForCartWorkflowId, (input) => {
    const cartQuery = (0, common_1.useQueryGraphStep)({
        entity: "cart",
        filters: { id: input.cart_id },
        fields: fields_1.cartFieldsForPricingContext,
        options: { throwIfKeyNotFound: true },
    }).config({ name: "get-cart" });
    const cart = (0, workflows_sdk_1.transform)({ cartQuery }, ({ cartQuery }) => cartQuery.data[0]);
    (0, common_1.validatePresenceOfStep)({
        entity: cart,
        fields: ["sales_channel_id", "region_id", "currency_code"],
    });
    const scFulfillmentSetQuery = (0, common_1.useQueryGraphStep)({
        entity: "sales_channels",
        filters: { id: cart.sales_channel_id },
        fields: [
            "stock_locations.fulfillment_sets.id",
            "stock_locations.id",
            "stock_locations.name",
            "stock_locations.address.*",
        ],
    }).config({ name: "sales_channels-fulfillment-query" });
    const scFulfillmentSets = (0, workflows_sdk_1.transform)({ scFulfillmentSetQuery }, ({ scFulfillmentSetQuery }) => scFulfillmentSetQuery.data[0]);
    const { fulfillmentSetIds } = (0, workflows_sdk_1.transform)({ scFulfillmentSets }, ({ scFulfillmentSets }) => {
        const fulfillmentSetIds = new Set();
        scFulfillmentSets.stock_locations.forEach((stockLocation) => {
            stockLocation.fulfillment_sets.forEach((fulfillmentSet) => {
                fulfillmentSetIds.add(fulfillmentSet.id);
            });
        });
        return {
            fulfillmentSetIds: Array.from(fulfillmentSetIds),
        };
    });
    const queryVariables = (0, workflows_sdk_1.transform)({ input, fulfillmentSetIds, cart }, ({ input, fulfillmentSetIds, cart }) => ({
        id: input.option_ids,
        context: {
            is_return: input.is_return ?? false,
            enabled_in_store: input.enabled_in_store ?? true,
        },
        filters: {
            fulfillment_set_id: fulfillmentSetIds,
            address: {
                country_code: cart.shipping_address?.country_code,
                province_code: cart.shipping_address?.province,
                city: cart.shipping_address?.city,
                postal_expression: cart.shipping_address?.postal_code,
            },
        },
        calculated_price: { context: cart },
    }));
    const shippingOptions = (0, use_remote_query_1.useRemoteQueryStep)({
        entry_point: "shipping_options",
        fields: [
            "id",
            "name",
            "price_type",
            "service_zone_id",
            "shipping_profile_id",
            "provider_id",
            "data",
            "service_zone.fulfillment_set_id",
            "type.id",
            "type.label",
            "type.description",
            "type.code",
            "provider.id",
            "provider.is_enabled",
            "rules.attribute",
            "rules.value",
            "rules.operator",
            "calculated_price.*",
            "prices.*",
            "prices.price_rules.*",
        ],
        variables: queryVariables,
    }).config({ name: "shipping-options-query" });
    const shippingOptionsWithPrice = (0, workflows_sdk_1.transform)({ shippingOptions }, ({ shippingOptions }) => shippingOptions.map((shippingOption) => {
        const price = shippingOption.calculated_price;
        return {
            ...shippingOption,
            amount: price?.calculated_amount,
            is_tax_inclusive: !!price?.is_calculated_price_tax_inclusive,
        };
    }));
    return new workflows_sdk_1.WorkflowResponse(shippingOptionsWithPrice);
});
//# sourceMappingURL=list-shipping-options-for-cart.js.map