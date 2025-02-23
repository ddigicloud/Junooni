"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferCartCustomerWorkflow = exports.transferCartCustomerWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const steps_1 = require("../steps");
const refresh_cart_items_1 = require("./refresh-cart-items");
exports.transferCartCustomerWorkflowId = "transfer-cart-customer";
/**
 * This workflow transfers cart's customer.
 */
exports.transferCartCustomerWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.transferCartCustomerWorkflowId, (input) => {
    const cartQuery = (0, common_1.useQueryGraphStep)({
        entity: "cart",
        filters: { id: input.id },
        fields: [
            "id",
            "email",
            "customer_id",
            "customer.has_account",
            "shipping_address.*",
            "region.*",
            "region.countries.*",
        ],
        options: { throwIfKeyNotFound: true },
    }).config({ name: "get-cart" });
    const cart = (0, workflows_sdk_1.transform)({ cartQuery }, ({ cartQuery }) => cartQuery.data[0]);
    const customerQuery = (0, common_1.useQueryGraphStep)({
        entity: "customer",
        filters: { id: input.customer_id },
        fields: ["id", "email"],
        options: { throwIfKeyNotFound: true },
    }).config({ name: "get-customer" });
    const customer = (0, workflows_sdk_1.transform)({ customerQuery }, ({ customerQuery }) => customerQuery.data[0]);
    // If its the same customer, we don't want the email to be overridden, so we skip the
    // update entirely. When the customer is different, we also override the email.
    // The customer will have an opportunity to edit email again through update cart endpoint.
    const shouldTransfer = (0, workflows_sdk_1.transform)({ cart, customer }, ({ cart, customer }) => cart.customer?.id !== customer.id);
    (0, workflows_sdk_1.when)({ shouldTransfer }, ({ shouldTransfer }) => shouldTransfer).then(() => {
        const cartInput = (0, workflows_sdk_1.transform)({ cart, customer }, ({ cart, customer }) => [
            {
                id: cart.id,
                customer_id: customer.id,
                email: customer.email,
            },
        ]);
        (0, steps_1.updateCartsStep)(cartInput);
        refresh_cart_items_1.refreshCartItemsWorkflow.runAsStep({
            input: { cart_id: input.id },
        });
    });
});
//# sourceMappingURL=transfer-cart-customer.js.map