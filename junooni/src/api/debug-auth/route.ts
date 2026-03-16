import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const authModuleService = req.scope.resolve(Modules.AUTH)
  
  const authIdentities = await authModuleService.listAuthIdentities(
    {},
    { relations: ["provider_identities"] }
  )

  res.json({ 
    identities: authIdentities.map(i => ({
      id: i.id,
      app_metadata: i.app_metadata,
      created_at: i.created_at,
      provider_identities: i.provider_identities?.map(pi => ({
        provider: pi.provider,
        entity_id: pi.entity_id,
        user_metadata: pi.user_metadata,
      }))
    }))
  })
}