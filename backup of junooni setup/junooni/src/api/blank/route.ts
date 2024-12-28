import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils";
  import { z } from "zod";
import { BLANK_MODULE } from "../../modules/blank";
import blankProductModuleService from "../../modules/blank/service";

import { 
  CreateBlankProductWorkflowInput, 
  createBlankProductWorkflow,
} from "../../workflows/blank-catalog"
import { service } from "@medusajs/medusa/event-bus-local";
import { createBrandWorkflow } from "src/workflows/create-brand";

  
 // Schema for validating incoming POST request
 export const PostCreateBlank = z.object({
  title: z.string(),
   handle: z.string().optional(),
   status: z.string(),
   fcode:z.string(),
   customisation_height: z.number(),
   customisation_width: z.number(),
   metadata: z.record(z.any()).optional(),
   variants: z.object({
     title: z.string(),
     price: z.number(),
     stock_quantity: z.number().optional(),
     sku: z.string(),
     hs_code: z.string().optional(),
     variant_rank:z.number(),

   }).strict(),
   options: z.object({
     title: z.string(),
     
     values: z.string(),
     
     
   }).strict(),
   images: z.object({
     rank: z.number(),
     url: z.string(),
         
   }).strict(),
 }).strict();
 
 type PostBlankProduct = {
   title: string;
   handle: string;
   status: string;
   fcode: string;
   customisation_height: number;
   customisation_width: number;
   variants: {
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
 
 
 export const POST = async (
  req: MedusaRequest<PostBlankProduct>,
  res: MedusaResponse
) => {
  const { result } = await createBlankProductWorkflow(req.scope)
  .run({
    input: req.validatedBody,
  })

  res.json({ blank: result })
}

  

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

  
  
 