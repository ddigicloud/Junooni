import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { CreateBlankProductWorkflowInput } from "../index";
import BlankProductModuleService from "../../../modules/blank/service";
import { BLANK_MODULE } from "../../../modules/blank";


const createBlankProductStep = createStep(
  "create-blank-product-step",
  async (input: CreateBlankProductWorkflowInput, { container }) => {
    const blankProductModuleService: BlankProductModuleService = container.resolve(
      BLANK_MODULE
    )

    const blank = await blankProductModuleService.createBlanks(input)

    return new StepResponse(blank, blank.id);
  },
  async (blank, { container }) => {
    const blankProductModuleService: BlankProductModuleService =
      container.resolve(BLANK_MODULE);

    await blankProductModuleService.deleteBlanks(blank.id);
  }
);

export default createBlankProductStep;
