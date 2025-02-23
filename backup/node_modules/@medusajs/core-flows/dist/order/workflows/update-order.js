"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderWorkflow = exports.updateOrderWorkflowId = exports.updateOrderValidationStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
const order_validation_1 = require("../utils/order-validation");
const steps_1 = require("../steps");
const common_1 = require("../../common");
/**
 * This step validates that an order can be updated with provided input.
 */
exports.updateOrderValidationStep = (0, workflows_sdk_1.createStep)("update-order-validation", async function ({ order, input, }) {
    (0, order_validation_1.throwIfOrderIsCancelled)({ order });
    if (input.shipping_address?.country_code &&
        order.shipping_address?.country_code !==
            input.shipping_address?.country_code) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Country code cannot be changed");
    }
    if (input.billing_address?.country_code &&
        order.billing_address?.country_code !==
            input.billing_address?.country_code) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Country code cannot be changed");
    }
    if (input.email) {
        (0, utils_1.validateEmail)(input.email);
    }
});
exports.updateOrderWorkflowId = "update-order-workflow";
/**
 * Update order workflow.
 */
exports.updateOrderWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateOrderWorkflowId, function (input) {
    const orderQuery = (0, common_1.useQueryGraphStep)({
        entity: "order",
        fields: [
            "id",
            "status",
            "email",
            "shipping_address.*",
            "billing_address.*",
        ],
        filters: { id: input.id },
        options: { throwIfKeyNotFound: true },
    }).config({ name: "order-query" });
    const order = (0, workflows_sdk_1.transform)({ orderQuery }, ({ orderQuery }) => orderQuery.data[0]);
    (0, exports.updateOrderValidationStep)({ order, input });
    const updateInput = (0, workflows_sdk_1.transform)({ input, order }, ({ input, order }) => {
        const update = {};
        if (input.shipping_address) {
            const address = {
                // we want to create a new address
                ...order.shipping_address,
                ...input.shipping_address,
            };
            delete address.id;
            update.shipping_address = address;
        }
        if (input.billing_address) {
            const address = {
                ...order.billing_address,
                ...input.billing_address,
            };
            delete address.id;
            update.billing_address = address;
        }
        return { ...input, ...update };
    });
    const updatedOrders = (0, steps_1.updateOrdersStep)({
        selector: { id: input.id },
        update: updateInput,
    });
    const orderChangeInput = (0, workflows_sdk_1.transform)({ input, updatedOrders, order }, ({ input, updatedOrders, order }) => {
        const updatedOrder = updatedOrders[0];
        const changes = [];
        if (input.shipping_address) {
            changes.push({
                change_type: "update_order",
                order_id: input.id,
                created_by: input.user_id,
                confirmed_by: input.user_id,
                details: {
                    type: "shipping_address",
                    old: order.shipping_address,
                    new: updatedOrder.shipping_address,
                },
            });
        }
        if (input.billing_address) {
            changes.push({
                change_type: "update_order",
                order_id: input.id,
                created_by: input.user_id,
                confirmed_by: input.user_id,
                details: {
                    type: "billing_address",
                    old: order.billing_address,
                    new: updatedOrder.billing_address,
                },
            });
        }
        if (input.email) {
            changes.push({
                change_type: "update_order",
                order_id: input.id,
                created_by: input.user_id,
                confirmed_by: input.user_id,
                details: {
                    type: "email",
                    old: order.email,
                    new: input.email,
                },
            });
        }
        return changes;
    });
    (0, steps_1.registerOrderChangesStep)(orderChangeInput);
    (0, common_1.emitEventStep)({
        eventName: utils_1.OrderWorkflowEvents.UPDATED,
        data: { id: input.id },
    });
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.previewOrderChangeStep)(input.id));
});
//# sourceMappingURL=update-order.js.map