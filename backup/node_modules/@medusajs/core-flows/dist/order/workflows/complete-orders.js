"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeOrderWorkflow = exports.completeOrderWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const steps_1 = require("../steps");
exports.completeOrderWorkflowId = "complete-order-workflow";
/**
 * This workflow completes one or more orders.
 */
exports.completeOrderWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.completeOrderWorkflowId, (input) => {
    const completedOrders = (0, steps_1.completeOrdersStep)(input);
    const eventData = (0, workflows_sdk_1.transform)({ input }, (data) => {
        return data.input.orderIds.map((id) => ({ id }));
    });
    (0, emit_event_1.emitEventStep)({
        eventName: utils_1.OrderWorkflowEvents.COMPLETED,
        data: eventData,
    });
    const ordersCompleted = (0, workflows_sdk_1.createHook)("ordersCompleted", {
        orders: completedOrders,
        additional_data: input.additional_data,
    });
    return new workflows_sdk_1.WorkflowResponse(completedOrders, {
        hooks: [ordersCompleted],
    });
});
//# sourceMappingURL=complete-orders.js.map