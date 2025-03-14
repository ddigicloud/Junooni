import {
    MedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework/http"
  import { BLANK_MODULE } from "../../../modules/blank";
  import blankProductModuleService from "../../../modules/blank/service";
  
  export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
  ) => {
    const blankProductModuleService: blankProductModuleService = req.scope.resolve(
        BLANK_MODULE
    )
  
    const limit = req.query.limit || 15
    const offset = req.query.offset || 0
  
    const [blank, count] = await blankProductModuleService.listAndCountBlanks({}, {
      skip: offset as number,
      take: limit as number,
    })
  
    res.json({
      blank,
      count,
      limit,
      offset,
    })
  }
  import { 
    CreateBlankProductWorkflowInput, 
    createBlankProductWorkflow,
  } from "../../../workflows/blank-catalog"
  
  export const POST = async (
    req: MedusaRequest<CreateBlankProductWorkflowInput>,
    res: MedusaResponse
  ) => {
    const { result } = await createBlankProductWorkflow(req.scope)
      .run({
        input: req.body,
      })
  
    res.json({ blank: result })
    }
    
    