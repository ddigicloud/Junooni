"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaxRegionsWorkflow = exports.updateTaxRegionsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const update_tax_regions_1 = require("../steps/update-tax-regions");
exports.updateTaxRegionsWorkflowId = "update-tax-regions";
/**
 * This workflow updates one or more tax regions.
 */
exports.updateTaxRegionsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateTaxRegionsWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, update_tax_regions_1.updateTaxRegionsStep)(input));
});
//# sourceMappingURL=update-tax-regions.js.map