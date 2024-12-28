import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import createBlankProductStep from "./steps/create-blank-products";

export type CreateBlankProductWorkflowInput = {
  
    title: string;
    handle: string;
    fcode: string;
    customisation_height: number;
    customisation_width: number;
    status: string;
    
    variants:
    {
      title: string;
     price: number;
     stock_quantity: number;
     sku: string;
     hs_code: string;
     variant_rank: number;

    };
    options: {
      title: string;
     values: string;
       
    };
    images: {
      rank: number;
      url: string;
    };
  
};

export const createBlankProductWorkflow = createWorkflow(
  "create-blank-product",
 
  (input: CreateBlankProductWorkflowInput) => {
    const blank = createBlankProductStep(input)

    return new WorkflowResponse(blank)
  }

  );

export default createBlankProductWorkflow;
