"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToCartWorkflow = exports.addToCartWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const emit_event_1 = require("../../common/steps/emit-event");
const use_remote_query_1 = require("../../common/steps/use-remote-query");
const steps_1 = require("../steps");
const validate_cart_1 = require("../steps/validate-cart");
const validate_line_item_prices_1 = require("../steps/validate-line-item-prices");
const validate_variant_prices_1 = require("../steps/validate-variant-prices");
const fields_1 = require("../utils/fields");
const prepare_line_item_data_1 = require("../utils/prepare-line-item-data");
const confirm_variant_inventory_1 = require("./confirm-variant-inventory");
const refresh_cart_items_1 = require("./refresh-cart-items");
const cartFields = ["completed_at"].concat(fields_1.cartFieldsForPricingContext);
exports.addToCartWorkflowId = "add-to-cart";
/**
 * This workflow adds items to a cart.
 */
exports.addToCartWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.addToCartWorkflowId, (input) => {
    const cartQuery = (0, common_1.useQueryGraphStep)({
        entity: "cart",
        filters: { id: input.cart_id },
        fields: cartFields,
        options: { throwIfKeyNotFound: true },
    }).config({ name: "get-cart" });
    const cart = (0, workflows_sdk_1.transform)({ cartQuery }, ({ cartQuery }) => {
        return cartQuery.data[0];
    });
    (0, validate_cart_1.validateCartStep)({ cart });
    const variantIds = (0, workflows_sdk_1.transform)({ input }, (data) => {
        return (data.input.items ?? []).map((i) => i.variant_id).filter(Boolean);
    });
    const variants = (0, workflows_sdk_1.when)({ variantIds }, ({ variantIds }) => {
        return !!variantIds.length;
    }).then(() => {
        return (0, use_remote_query_1.useRemoteQueryStep)({
            entry_point: "variants",
            fields: fields_1.productVariantsFields,
            variables: {
                id: variantIds,
                calculated_price: {
                    context: cart,
                },
            },
        });
    });
    (0, validate_variant_prices_1.validateVariantPricesStep)({ variants });
    const lineItems = (0, workflows_sdk_1.transform)({ input, variants }, (data) => {
        const items = (data.input.items ?? []).map((item) => {
            const variant = (data.variants ?? []).find((v) => v.id === item.variant_id);
            const input = {
                item,
                variant: variant,
                cartId: data.input.cart_id,
                unitPrice: item.unit_price,
                isTaxInclusive: item.is_tax_inclusive ??
                    variant?.calculated_price?.is_calculated_price_tax_inclusive,
                isCustomPrice: (0, utils_1.isDefined)(item?.unit_price),
            };
            if (variant && !input.unitPrice) {
                input.unitPrice = variant.calculated_price?.calculated_amount;
            }
            return (0, prepare_line_item_data_1.prepareLineItemData)(input);
        });
        return items;
    });
    (0, validate_line_item_prices_1.validateLineItemPricesStep)({ items: lineItems });
    const { itemsToCreate = [], itemsToUpdate = [] } = (0, steps_1.getLineItemActionsStep)({
        id: cart.id,
        items: lineItems,
    });
    confirm_variant_inventory_1.confirmVariantInventoryWorkflow.runAsStep({
        input: {
            sales_channel_id: cart.sales_channel_id,
            variants,
            items: input.items,
            itemsToUpdate,
        },
    });
    (0, workflows_sdk_1.parallelize)((0, steps_1.createLineItemsStep)({
        id: cart.id,
        items: itemsToCreate,
    }), (0, steps_1.updateLineItemsStep)({
        id: cart.id,
        items: itemsToUpdate,
    }));
    refresh_cart_items_1.refreshCartItemsWorkflow.runAsStep({
        input: { cart_id: cart.id },
    });
    (0, emit_event_1.emitEventStep)({
        eventName: utils_1.CartWorkflowEvents.UPDATED,
        data: { id: cart.id },
    });
});
//# sourceMappingURL=add-to-cart.js.map