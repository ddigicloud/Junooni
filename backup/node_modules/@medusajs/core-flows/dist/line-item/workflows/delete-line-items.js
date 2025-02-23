"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLineItemsWorkflow = exports.deleteLineItemsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const refresh_cart_items_1 = require("../../cart/workflows/refresh-cart-items");
const delete_line_items_1 = require("../steps/delete-line-items");
exports.deleteLineItemsWorkflowId = "delete-line-items";
/**
 * This workflow deletes line items from a cart.
 */
exports.deleteLineItemsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteLineItemsWorkflowId, (input) => {
    (0, delete_line_items_1.deleteLineItemsStep)(input.ids);
    refresh_cart_items_1.refreshCartItemsWorkflow.runAsStep({
        input: { cart_id: input.cart_id },
    });
});
//# sourceMappingURL=delete-line-items.js.map