"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshCartItemsWorkflow = exports.refreshCartItemsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const use_remote_query_1 = require("../../common/steps/use-remote-query");
const steps_1 = require("../steps");
const validate_variant_prices_1 = require("../steps/validate-variant-prices");
const fields_1 = require("../utils/fields");
const prepare_line_item_data_1 = require("../utils/prepare-line-item-data");
const refresh_cart_shipping_methods_1 = require("./refresh-cart-shipping-methods");
const refresh_payment_collection_1 = require("./refresh-payment-collection");
const update_cart_promotions_1 = require("./update-cart-promotions");
const update_tax_lines_1 = require("./update-tax-lines");
exports.refreshCartItemsWorkflowId = "refresh-cart-items";
/**
 * This workflow refreshes a cart's items
 */
exports.refreshCartItemsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.refreshCartItemsWorkflowId, (input) => {
    const cart = (0, use_remote_query_1.useRemoteQueryStep)({
        entry_point: "cart",
        fields: fields_1.cartFieldsForRefreshSteps,
        variables: { id: input.cart_id },
        list: false,
    });
    const variantIds = (0, workflows_sdk_1.transform)({ cart }, (data) => {
        return (data.cart.items ?? []).map((i) => i.variant_id).filter(Boolean);
    });
    const cartPricingContext = (0, workflows_sdk_1.transform)({ cart }, ({ cart }) => {
        return (0, utils_1.filterObjectByKeys)(cart, fields_1.cartFieldsForPricingContext);
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
                    context: cartPricingContext,
                },
            },
        }).config({ name: "fetch-variants" });
    });
    (0, validate_variant_prices_1.validateVariantPricesStep)({ variants });
    const lineItems = (0, workflows_sdk_1.transform)({ cart, variants }, ({ cart, variants }) => {
        const items = cart.items.map((item) => {
            const variant = (variants ?? []).find((v) => v.id === item.variant_id);
            const input = {
                item,
                variant: variant,
                cartId: cart.id,
                unitPrice: item.unit_price,
                isTaxInclusive: item.is_tax_inclusive,
            };
            if (variant && !item.is_custom_price) {
                input.unitPrice = variant.calculated_price?.calculated_amount;
                input.isTaxInclusive =
                    variant.calculated_price?.is_calculated_price_tax_inclusive;
            }
            const preparedItem = (0, prepare_line_item_data_1.prepareLineItemData)(input);
            return {
                selector: { id: item.id },
                data: preparedItem,
            };
        });
        return items;
    });
    (0, steps_1.updateLineItemsStep)({
        id: cart.id,
        items: lineItems,
    });
    const refetchedCart = (0, use_remote_query_1.useRemoteQueryStep)({
        entry_point: "cart",
        fields: fields_1.cartFieldsForRefreshSteps,
        variables: { id: cart.id },
        list: false,
    }).config({ name: "refetch–cart" });
    refresh_cart_shipping_methods_1.refreshCartShippingMethodsWorkflow.runAsStep({
        input: { cart_id: cart.id },
    });
    update_tax_lines_1.updateTaxLinesWorkflow.runAsStep({
        input: { cart_id: cart.id },
    });
    const cartPromoCodes = (0, workflows_sdk_1.transform)({ refetchedCart, input }, ({ refetchedCart, input }) => {
        if ((0, utils_1.isDefined)(input.promo_codes)) {
            return input.promo_codes;
        }
        else {
            return refetchedCart.promotions.map((p) => p?.code).filter(Boolean);
        }
    });
    update_cart_promotions_1.updateCartPromotionsWorkflow.runAsStep({
        input: {
            cart_id: cart.id,
            promo_codes: cartPromoCodes,
            action: utils_1.PromotionActions.REPLACE,
        },
    });
    refresh_payment_collection_1.refreshPaymentCollectionForCartWorkflow.runAsStep({
        input: { cart_id: cart.id },
    });
    return new workflows_sdk_1.WorkflowResponse(refetchedCart);
});
//# sourceMappingURL=refresh-cart-items.js.map