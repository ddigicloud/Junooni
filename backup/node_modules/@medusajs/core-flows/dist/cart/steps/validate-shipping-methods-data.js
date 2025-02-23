"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAndReturnShippingMethodsDataStep = exports.validateAndReturnShippingMethodsDataStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/workflows-sdk");
exports.validateAndReturnShippingMethodsDataStepId = "validate-and-return-shipping-methods-data";
/**
 * This step validates shipping options to ensure they can be applied on a cart.
 */
exports.validateAndReturnShippingMethodsDataStep = (0, workflows_sdk_1.createStep)(exports.validateAndReturnShippingMethodsDataStepId, async (data, { container }) => {
    const optionsToValidate = data ?? [];
    if (!optionsToValidate.length) {
        return new workflows_sdk_1.StepResponse(void 0);
    }
    const fulfillmentModule = container.resolve(utils_1.Modules.FULFILLMENT);
    const validatedData = await (0, utils_1.promiseAll)(optionsToValidate.map(async (option) => {
        const validated = await fulfillmentModule.validateFulfillmentData(option.provider_id, option.option_data, option.method_data, option.context);
        return {
            [option.id]: validated,
        };
    }));
    return new workflows_sdk_1.StepResponse(validatedData);
});
//# sourceMappingURL=validate-shipping-methods-data.js.map