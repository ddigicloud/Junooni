"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.declineOrderTransferRequestWorkflow = exports.declineTransferOrderRequestWorkflowId = exports.declineTransferOrderRequestValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that a requested order transfer can be declineed.
 */
exports.declineTransferOrderRequestValidationStep = (0, workflows_sdk_1.createStep)("validate-decline-transfer-order-request", async function ({ order, orderChange, input, }) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
    const token = orderChange.actions?.find((a) => a.action === utils_1.ChangeActionType.TRANSFER_CUSTOMER)?.details.token;
    if (!input.token?.length || token !== input.token) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Invalid token.");
    }
});
exports.declineTransferOrderRequestWorkflowId = "decline-transfer-order-request";
/**
 * This workflow declines a requested order transfer.
 *
 * Only the original customer (who has the token) is allowed to decline the transfer.
 */
exports.declineOrderTransferRequestWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.declineTransferOrderRequestWorkflowId, function (input) {
    const orderQuery = (0, common_1.useQueryGraphStep)({
        entity: "order",
        fields: ["id", "version", "declineed_at"],
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
    (0, exports.declineTransferOrderRequestValidationStep)({ order, orderChange, input });
    (0, steps_1.declineOrderChangeStep)({ id: orderChange.id });
});
//# sourceMappingURL=decline-order-transfer.js.map