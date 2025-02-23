"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderTransferRequestWorkflow = exports.cancelTransferOrderRequestWorkflowId = exports.cancelTransferOrderRequestValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that a requested order transfer can be canceled.
 */
exports.cancelTransferOrderRequestValidationStep = (0, workflows_sdk_1.createStep)("validate-cancel-transfer-order-request", async function ({ order, orderChange, input, }) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
    if (input.actor_type === "user") {
        return;
    }
    const action = orderChange.actions?.find((a) => a.action === utils_1.ChangeActionType.TRANSFER_CUSTOMER);
    if (action?.reference_id !== input.logged_in_user_id) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "This customer is not allowed to cancel the transfer.");
    }
});
exports.cancelTransferOrderRequestWorkflowId = "cancel-transfer-order-request";
/**
 * This workflow cancels a requested order transfer.
 *
 * Customer that requested the transfer or a store admin are allowed to cancel the order transfer request.
 */
exports.cancelOrderTransferRequestWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.cancelTransferOrderRequestWorkflowId, function (input) {
    const orderQuery = (0, common_1.useQueryGraphStep)({
        entity: "order",
        fields: ["id", "version", "canceled_at"],
        filters: { id: input.order_id },
        options: { throwIfKeyNotFound: true },
    }).config({ name: "order-query" });
    const order = (0, workflows_sdk_1.transform)({ orderQuery }, ({ orderQuery }) => orderQuery.data[0]);
    const orderChangeQuery = (0, common_1.useQueryGraphStep)({
        entity: "order_change",
        fields: ["id", "status", "version", "actions.*"],
        filters: {
            order_id: input.order_id,
            status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
        },
        options: { throwIfKeyNotFound: true },
    }).config({ name: "order-change-query" });
    const orderChange = (0, workflows_sdk_1.transform)({ orderChangeQuery }, ({ orderChangeQuery }) => orderChangeQuery.data[0]);
    (0, exports.cancelTransferOrderRequestValidationStep)({ order, orderChange, input });
    (0, steps_1.deleteOrderChangesStep)({ ids: [orderChange.id] });
});
//# sourceMappingURL=cancel-order-transfer.js.map