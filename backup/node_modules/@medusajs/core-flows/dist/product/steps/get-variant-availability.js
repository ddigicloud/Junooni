"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariantAvailabilityStep = exports.getVariantAvailabilityId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.getVariantAvailabilityId = "get-variant-availability";
/**
 * Computes the varaint availability for a list of variants in a given sales channel
 */
exports.getVariantAvailabilityStep = (0, workflows_sdk_1.createStep)(exports.getVariantAvailabilityId, async (data, { container }) => {
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const availability = await (0, utils_1.getVariantAvailability)(query, data);
    return new workflows_sdk_1.StepResponse(availability);
});
//# sourceMappingURL=get-variant-availability.js.map