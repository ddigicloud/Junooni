import { MedusaResponse, MedusaStoreRequest } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import { decode, JwtPayload } from "jsonwebtoken"

export async function GET(
  req: MedusaStoreRequest,
  res: MedusaResponse
) {
  
  
  const decodedToken = decode(req.params.token) as JwtPayload

  if (!decodedToken.follow_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Invalid token"
    )
  }

  const query = req.scope.resolve("query")

  const { data } = await query.graph({
    entity: "follow",
    fields: ["*", "creators.*", "creators.vendor.*"],
    filters: {
      id: decodedToken.follow_id
    }
  })

  if (!data.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No follows found"
    )
  }

  
  res.json({
   follow: data[0]
  })
}