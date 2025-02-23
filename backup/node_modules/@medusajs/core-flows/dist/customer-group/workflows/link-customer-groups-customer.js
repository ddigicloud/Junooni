"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkCustomerGroupsToCustomerWorkflow = exports.linkCustomerGroupsToCustomerWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.linkCustomerGroupsToCustomerWorkflowId = "link-customer-groups-to-customer";
/**
 * This workflow creates one or more links between a customer and customer groups.
 */
exports.linkCustomerGroupsToCustomerWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.linkCustomerGroupsToCustomerWorkflowId, (input) => {
    return (0, steps_1.linkCustomerGroupsToCustomerStep)(input);
});
//# sourceMappingURL=link-customer-groups-customer.js.map